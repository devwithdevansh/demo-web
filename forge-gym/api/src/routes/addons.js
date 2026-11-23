import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { config } from '../config.js';
import { Gym, Member, Lead, ActionLog, ADDON_KEYS } from '../models/index.js';
import { requireRole, requireAddon } from '../middleware/auth.js';
import { body, findOwned, demoCap, HttpError, notFound, zId } from '../middleware/http.js';
import { lookups, memberView, recordPayment } from '../lib/members.js';
import { prettyDay } from '../lib/dates.js';
import {
  createOrder, demoGateway, demoRecipientFor, demoSender, fetchPayment, sendWhatsAppText, validCheckoutSignature, whatsappTracking,
} from '../lib/providers.js';

// Mounted at /api/addons behind requireAuth.
const router = Router();
const desk = requireRole('owner', 'staff');

// Outside providers are optional. When one is not connected the action is a
// clearly labelled simulation. Providers are only wired to demo sandboxes so
// far: a live gym needs its own WhatsApp number and payment account, so it gets
// an honest "not connected" answer instead of using the demo's.
const SIMULATED_NOTE = 'Simulated in the demo. No WhatsApp provider is connected, so nothing was delivered.';
const SANDBOX_DAILY_MESSAGES = 25;

const shortName = (gym) => gym.name.replace(/\s*\(.*\)$/, '');
const first = (name) => name.split(' ')[0];
const maskPhone = (phone) => phone.replace(/\d(?=(?:\D*\d){3})/g, '•');
const lastFour = (phone) => String(phone).replace(/\D/g, '').slice(-4);
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

/** The number this gym's messages go out from, or null when WhatsApp is not connected for it. */
const senderFor = (gym) => (gym.isDemo ? demoSender() : null);

/** What is connected for this gym right now. */
async function providersFor(gym) {
  const sender = await senderFor(gym);
  return {
    whatsapp: sender ? 'cloud_api' : false,
    whatsappFrom: sender?.label ?? null,
    whatsappTracking: !!sender && whatsappTracking(),
    payments: (gym.isDemo && demoGateway()) || false,
  };
}

router.get('/', desk, async (req, res) => {
  const activity = await ActionLog.find({ gymId: req.gymId }).sort({ createdAt: -1 }).limit(25);
  res.json({ addons: req.gym.addons, providers: await providersFor(req.gym), activity });
});

router.patch('/', requireRole('owner'), body(z.object({ key: z.enum(ADDON_KEYS), enabled: z.boolean() })), async (req, res) => {
  req.gym.addons[req.data.key] = req.data.enabled;
  await req.gym.save();
  res.json({ addons: req.gym.addons });
});

/**
 * Drafts a WhatsApp message and, when asked, sends it.
 * With WhatsApp connected, a demo message goes to an approved demo phone and
 * never to the sample member's number. Without it, the send is recorded as simulated.
 */
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

    const sender = await senderFor(req.gym);
    const live = !!sender;
    const target = live ? demoRecipientFor(recipient.phone) : null;
    const reply = {
      message,
      recipient: recipient.name,
      to: live ? `demo phone ending ${lastFour(target)}` : maskPhone(recipient.phone),
      live,
      sent: false,
      // Never claimed here: WhatsApp reports delivery later, by webhook.
      delivered: false,
      simulated: !live,
      status: null,
      logId: null,
      tracking: live && whatsappTracking(),
      note: live
        ? `WhatsApp is connected and sends from ${sender.label}. In the demo this goes to the demo phone ending ${lastFour(target)}, not to the sample member's number.`
        : SIMULATED_NOTE,
    };
    if (!send) return res.json(reply);

    if (!req.gym.isDemo) throw new HttpError(501, 'No WhatsApp provider is connected for this gym yet.', 'provider_missing');
    const title = `WhatsApp ${template.replace('_', ' ')} to ${recipient.name}`;
    const base = { gymId: req.gymId, kind: 'whatsapp', memberId: forLead ? null : recipient.id, title };

    if (!live) {
      const log = await ActionLog.create({ ...base, detail: `${message}\n\n${SIMULATED_NOTE}` });
      return res.json({ ...reply, sent: true, status: 'simulated', logId: String(log._id) });
    }

    const since = new Date(Date.now() - 24 * 3600 * 1000);
    if ((await ActionLog.countDocuments({ gymId: req.gymId, kind: 'whatsapp', simulated: false, createdAt: { $gte: since } })) >= SANDBOX_DAILY_MESSAGES) {
      throw new HttpError(429, 'This demo has sent its WhatsApp messages for today. Reset the demo data or try again tomorrow.', 'provider_limit');
    }
    const providerId = await sendWhatsAppText(sender, target, message);
    const log = await ActionLog.create({
      ...base, status: 'accepted', simulated: false, providerId,
      detail: `${message}\n\nSent through WhatsApp from ${sender.label} to the demo phone ending ${lastFour(target)}.`,
    });
    res.json({ ...reply, sent: true, status: 'accepted', logId: String(log._id) });
  },
);

/** Latest delivery status of one sent message, for the screen that just sent it. */
router.get('/message/:id', desk, async (req, res) => {
  const log = await findOwned(ActionLog, req, req.params.id, 'Message');
  res.json({ status: log.status, reason: log.reason ?? null });
});

/**
 * Creates a payment link for a member. With Razorpay test keys it leads to a
 * real Razorpay test-mode payment; otherwise to a practice page. No money moves either way.
 */
router.post(
  '/upi-link',
  desk,
  requireAddon('upiLinks'),
  demoCap(ActionLog, 400),
  body(z.object({ memberId: zId, amount: z.number({ error: 'Enter an amount.' }).int('Use whole rupees.').min(1, 'Enter an amount.').max(1000000) })),
  async (req, res) => {
    if (!req.gym.isDemo) throw new HttpError(501, 'No payment provider is connected for this gym yet.', 'provider_missing');
    const member = await findOwned(Member, req, req.data.memberId, 'Member');
    const gateway = demoGateway();
    const token = randomBytes(18).toString('base64url');
    await ActionLog.create({
      gymId: req.gymId, kind: 'upi_link', memberId: member._id, status: 'pending', amount: req.data.amount, token, gateway,
      simulated: !gateway,
      title: `Payment link for ${member.name}`,
      detail: gateway
        ? 'Payment page in Razorpay test mode. A test payment is verified and recorded automatically; no real money moves.'
        : 'Demo payment link. Opens a practice page; no real payment can be made.',
    });
    res.status(201).json({ token, path: `/demo/pay/${token}`, amount: req.data.amount, memberName: member.name, gateway, simulated: !gateway });
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

// ---- Public pay page (no sign-in; the unguessable token is the access) ----

export const payRouter = Router();
payRouter.use(rateLimit({ windowMs: 10 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false }));

async function loadLink(token) {
  if (typeof token !== 'string' || token.length > 40) throw notFound('Payment link');
  const link = await ActionLog.findOne({ token, kind: 'upi_link' });
  // These links exist for demo gyms only. A live gym's links would belong to its own payment account.
  const gym = link && (await Gym.findOne({ _id: link.gymId, isDemo: true }));
  const member = gym && (await Member.findOne({ _id: link.memberId, gymId: gym._id }));
  if (!member) throw notFound('Payment link');
  return { link, gym, member };
}

const linkView = ({ link, gym, member }) => ({
  gymName: gym.name,
  payer: `${first(member.name)} ${member.name.split(' ')[1]?.[0] ?? ''}.`.trim(),
  amount: link.amount,
  status: link.status,
  gateway: link.gateway ?? null,
  simulated: !link.gateway,
});

/** Moves a link out of "pending" exactly once, so a double submit can never record two payments. */
const claim = (link, update) => ActionLog.findOneAndUpdate({ _id: link._id, status: 'pending' }, update, { returnDocument: 'after' });

payRouter.get('/:token', async (req, res) => res.json(linkView(await loadLink(req.params.token))));

/** Practice outcome, for links created while no payment provider is connected. */
payRouter.post('/:token', body(z.object({ outcome: z.enum(['success', 'failure']) })), async (req, res) => {
  const found = await loadLink(req.params.token);
  if (found.link.gateway) throw new HttpError(409, 'This link is paid on the payment page, not simulated.', 'invalid_state');
  const paid = req.data.outcome === 'success';
  const claimed = await claim(found.link, { status: paid ? 'paid' : 'failed' });
  if (!claimed) throw new HttpError(409, 'This payment link has already been used.', 'invalid_state');
  if (paid) {
    await recordPayment(found.member, { amount: found.link.amount, method: 'upi', note: 'Demo payment link (simulated)', recordedBy: 'Demo pay page', simulated: true });
  }
  res.json(linkView({ ...found, link: claimed }));
});

/** Step 1 of a gateway payment: an order for the pay page to open Razorpay Checkout with. */
payRouter.post('/:token/order', async (req, res) => {
  const found = await loadLink(req.params.token);
  const { link, gym } = found;
  if (link.gateway !== 'razorpay_test' || demoGateway() !== 'razorpay_test') throw new HttpError(409, 'This link is not connected to a payment provider.', 'invalid_state');
  if (link.status !== 'pending') throw new HttpError(409, 'This payment link has already been used.', 'invalid_state');
  if (!link.orderId) {
    const order = await createOrder({ amount: link.amount, receipt: link.token, notes: { purpose: 'FORGE demo membership fee' } });
    link.orderId = order.id;
    await link.save();
  }
  res.json({
    keyId: config.razorpay.keyId,
    orderId: link.orderId,
    amount: link.amount * 100,
    currency: 'INR',
    name: shortName(gym),
    description: `Membership fee for ${linkView(found).payer}`,
  });
});

const METHODS = { upi: 'upi', card: 'card', netbanking: 'bank' };

/** Step 2: Razorpay Checkout reports success; the signature proves it before anything is recorded. */
payRouter.post(
  '/:token/verify',
  body(
    z.object({
      razorpay_order_id: z.string().max(60),
      razorpay_payment_id: z.string().max(60),
      razorpay_signature: z.string().max(200),
    }),
  ),
  async (req, res) => {
    const found = await loadLink(req.params.token);
    const { link, member } = found;
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.data;
    if (link.gateway !== 'razorpay_test' || !link.orderId || link.orderId !== orderId || !validCheckoutSignature({ orderId, paymentId, signature })) {
      throw new HttpError(400, 'That payment could not be verified, so nothing was recorded.', 'not_verified');
    }
    const claimed = await claim(link, { status: 'paid', paymentId });
    // A repeat of an already verified payment just returns the current state.
    if (!claimed) return res.json(linkView(await loadLink(req.params.token)));

    // The payment method is a nicety for the fee records; a lookup failure must not lose the payment.
    const details = await fetchPayment(paymentId).catch(() => null);
    await recordPayment(member, {
      amount: link.amount,
      method: METHODS[details?.method] ?? 'upi',
      note: 'Payment link, Razorpay test mode',
      recordedBy: 'Razorpay (test mode)',
      gateway: 'razorpay_test',
      gatewayPaymentId: paymentId,
    });
    res.json(linkView({ ...found, link: claimed }));
  },
);
