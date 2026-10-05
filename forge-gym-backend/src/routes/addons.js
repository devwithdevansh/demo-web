import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Gym, Member, Lead, ActionLog, ADDON_KEYS } from '../models/index.js';
import { requireRole, requireAddon } from '../middleware/auth.js';
import { body, findOwned, demoCap, HttpError, notFound, zId } from '../middleware/http.js';
import { lookups, memberView, recordPayment } from '../lib/members.js';
import { prettyDay } from '../lib/dates.js';

// Mounted at /api/addons behind requireAuth.
const router = Router();
const desk = requireRole('owner', 'staff');

// No messaging or payment provider is integrated yet, so every outbound action
// is a clearly labelled simulation. Live gyms get an honest "not connected" error.
const PROVIDERS = { whatsapp: false, payments: false };
const SIMULATED_NOTE = 'Simulated in the demo. No WhatsApp provider is connected, so nothing was delivered.';

const shortName = (gym) => gym.name.replace(/\s*\(.*\)$/, '');
const first = (name) => name.split(' ')[0];
const maskPhone = (phone) => phone.replace(/\d(?=(?:\D*\d){3})/g, '•');
const rupees = (n) => `₹${n.toLocaleString('en-IN')}`;

const MEMBER_TEMPLATES = {
  renewal: (m, gym) =>
    `Hi ${first(m.name)}, your ${m.planName} membership at ${gym} ${m.daysLeft < 0 ? 'ended' : 'ends'} on ${prettyDay(m.expiryDate)}. Renew at the front desk, or reply here and we will help you.`,
  dues: (m, gym) =>
    `Hi ${first(m.name)}, a gentle reminder that ${rupees(m.feeDue)} is pending on your ${m.planName} membership at ${gym}. You can pay at the front desk on your next visit. Thank you!`,
  welcome: (m, gym) =>
    `Welcome to ${gym}, ${first(m.name)}! Your ${m.planName} membership is active until ${prettyDay(m.expiryDate)}. Your member code is ${m.memberCode}.`,
};
const leadMessage = (lead, gym) =>
  `Hi ${first(lead.name)}, thanks for your interest in ${gym}${lead.interest ? ` (${lead.interest})` : ''}. Would you like to visit for a trial session this week? Reply with a time that suits you.`;

router.get('/', desk, async (req, res) => {
  const activity = await ActionLog.find({ gymId: req.gymId }).sort({ createdAt: -1 }).limit(25);
  res.json({ addons: req.gym.addons, providers: PROVIDERS, activity });
});

router.patch('/', requireRole('owner'), body(z.object({ key: z.enum(ADDON_KEYS), enabled: z.boolean() })), async (req, res) => {
  req.gym.addons[req.data.key] = req.data.enabled;
  await req.gym.save();
  res.json({ addons: req.gym.addons });
});

/** Drafts a WhatsApp message and, when asked to send, records the attempt truthfully. */
router.post(
  '/message',
  desk,
  demoCap(ActionLog, 400),
  body(
    z
      .object({
        template: z.enum(['renewal', 'dues', 'welcome', 'lead_followup']),
        memberId: zId.optional(),
        leadId: zId.optional(),
        send: z.boolean().default(false),
      })
      .refine((v) => (v.template === 'lead_followup' ? !!v.leadId : !!v.memberId), { path: ['memberId'], message: 'Choose who the message is for.' }),
  ),
  async (req, res) => {
    const { template, memberId, leadId, send } = req.data;
    const { addons } = req.gym;
    const forLead = template === 'lead_followup';
    if (forLead ? !addons.leadFollowup : !addons.whatsapp) throw new HttpError(403, 'This add-on is switched off for this gym.', 'addon_off');
    if (send && !addons.whatsapp) throw new HttpError(403, 'Switch on WhatsApp notifications to send messages.', 'addon_off');

    const gymName = shortName(req.gym);
    let recipient, message;
    if (forLead) {
      recipient = await findOwned(Lead, req, leadId, 'Lead');
      message = leadMessage(recipient, gymName);
    } else {
      const member = await findOwned(Member, req, memberId, 'Member');
      recipient = memberView(member, await lookups(req.gymId));
      message = MEMBER_TEMPLATES[template](recipient, gymName);
    }

    if (send) {
      if (!req.gym.isDemo) throw new HttpError(501, 'No WhatsApp provider is connected for this gym yet.', 'provider_missing');
      await ActionLog.create({
        gymId: req.gymId, kind: 'whatsapp', memberId: forLead ? null : recipient.id,
        title: `WhatsApp ${template.replace('_', ' ')} to ${recipient.name}`, detail: `${message}\n\n${SIMULATED_NOTE}`,
      });
    }
    res.json({ message, to: maskPhone(recipient.phone), recipient: recipient.name, sent: send, delivered: false, simulated: true, note: SIMULATED_NOTE });
  },
);

/** Creates a payment link for a member. In the demo it opens a local page where no money moves. */
router.post(
  '/upi-link',
  desk,
  requireAddon('upiLinks'),
  demoCap(ActionLog, 400),
  body(z.object({ memberId: zId, amount: z.number({ error: 'Enter an amount.' }).int('Use whole rupees.').min(1, 'Enter an amount.').max(1000000) })),
  async (req, res) => {
    if (!req.gym.isDemo) throw new HttpError(501, 'No payment provider is connected for this gym yet.', 'provider_missing');
    const member = await findOwned(Member, req, req.data.memberId, 'Member');
    const token = randomBytes(18).toString('base64url');
    await ActionLog.create({
      gymId: req.gymId, kind: 'upi_link', memberId: member._id, status: 'pending', amount: req.data.amount, token,
      title: `Payment link for ${member.name}`, detail: 'Demo payment link. Opens a practice page; no real payment can be made.',
    });
    res.status(201).json({ token, path: `/demo/pay/${token}`, amount: req.data.amount, memberName: member.name, simulated: true });
  },
);

/** The gym can only ask a member to set up Autopay. Approval happens in the member's own portal. */
router.post('/autopay/request', desk, requireAddon('autopay'), body(z.object({ memberId: zId })), async (req, res) => {
  const member = await findOwned(Member, req, req.data.memberId, 'Member');
  const status = member.autopay?.status ?? 'none';
  if (status === 'active' || status === 'paused') throw new HttpError(409, `${member.name} already has Autopay set up.`, 'invalid_state');
  const look = await lookups(req.gymId);
  const amount = look.plans.get(String(member.planId))?.price ?? 0;
  member.autopay = { status: 'requested', amount, updatedAt: new Date() };
  await member.save();
  await ActionLog.create({
    gymId: req.gymId, kind: 'autopay', memberId: member._id, amount, title: `Autopay request sent to ${member.name}`,
    detail: 'Waiting for the member to approve in their portal. Nothing is charged until they do.',
  });
  res.json({ autopay: member.toJSON().autopay });
});

export default router;

// ---- Public demo pay page (no sign-in; the unguessable token is the access) ----

export const payRouter = Router();
payRouter.use(rateLimit({ windowMs: 10 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false }));

async function loadLink(token) {
  if (typeof token !== 'string' || token.length > 40) throw notFound('Payment link');
  const link = await ActionLog.findOne({ token, kind: 'upi_link' });
  // Simulated outcomes exist for demo gyms only. A live gym's links would be settled by the provider.
  const gym = link && (await Gym.findOne({ _id: link.gymId, isDemo: true }));
  const member = gym && (await Member.findOne({ _id: link.memberId, gymId: gym._id }));
  if (!member) throw notFound('Payment link');
  return { link, gym, member };
}

const linkView = ({ link, gym, member }) => ({
  gymName: gym.name, payer: `${first(member.name)} ${member.name.split(' ')[1]?.[0] ?? ''}.`.trim(), amount: link.amount, status: link.status, simulated: true,
});

payRouter.get('/:token', async (req, res) => res.json(linkView(await loadLink(req.params.token))));

payRouter.post('/:token', body(z.object({ outcome: z.enum(['success', 'failure']) })), async (req, res) => {
  const found = await loadLink(req.params.token);
  const { link, member } = found;
  if (link.status !== 'pending') throw new HttpError(409, 'This payment link has already been used.', 'invalid_state');
  if (req.data.outcome === 'success') {
    await recordPayment(member, { amount: link.amount, method: 'upi', note: 'Demo payment link (simulated)', recordedBy: 'Demo pay page', simulated: true });
    link.status = 'paid';
  } else {
    link.status = 'failed';
  }
  await link.save();
  res.json(linkView(found));
});
