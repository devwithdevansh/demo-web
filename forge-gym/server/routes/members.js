import { Router } from 'express';
import { z } from 'zod';
import { Member, Plan, User, Payment, Attendance, CATEGORIES, PAY_METHODS } from '../models/index.js';
import { requireRole } from '../middleware/auth.js';
import { body, findOwned, demoCap, HttpError, zName, zPhone, zEmail, zDay, zId, zText } from '../middleware/http.js';
import { lookups, memberView, recordPayment, escapeRegex } from '../lib/members.js';
import { dayKey, shiftDay, shiftMonths } from '../lib/dates.js';

const router = Router();
const desk = requireRole('owner', 'staff');
const owner = requireRole('owner');

const zAmount = z.number({ error: 'Enter an amount.' }).int('Use whole rupees.').min(0).max(1000000);
const paymentPart = { paidNow: zAmount.optional(), method: z.enum(PAY_METHODS).optional() };

async function trainerFor(req, trainerId) {
  if (!trainerId) return null;
  const trainer = await User.findOne({ _id: trainerId, gymId: req.gymId, role: 'trainer', active: true });
  if (!trainer) throw new HttpError(400, 'Choose a trainer from this gym.', 'invalid');
  return trainer._id;
}

// ---- Plans ----------------------------------------------------------------

const planInput = z.object({
  name: z.string().trim().min(2, 'Enter a plan name.').max(60),
  price: z.number({ error: 'Enter the fee in rupees.' }).int('Use whole rupees.').min(0).max(1000000),
  durationMonths: z.number().int().min(1).max(36),
  active: z.boolean().optional(),
});

router.get('/plans', desk, async (req, res) => {
  res.json({ plans: await Plan.find({ gymId: req.gymId }).sort({ price: 1 }) });
});

router.post('/plans', owner, demoCap(Plan, 20), body(planInput), async (req, res) => {
  res.status(201).json({ plan: await Plan.create({ ...req.data, gymId: req.gymId }) });
});

router.patch('/plans/:id', owner, body(planInput.partial()), async (req, res) => {
  const plan = await findOwned(Plan, req, req.params.id, 'Plan');
  Object.assign(plan, req.data);
  await plan.save();
  res.json({ plan });
});

// ---- Members --------------------------------------------------------------

router.get('/members', desk, async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60) : '';
  const filter = { gymId: req.gymId };
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { memberCode: rx }];
  }
  const [members, look] = await Promise.all([Member.find(filter).sort({ name: 1 }), lookups(req.gymId)]);
  const today = dayKey();
  let rows = members.map((m) => memberView(m, look, today));
  if (['active', 'expiring', 'expired'].includes(req.query.status)) rows = rows.filter((m) => m.status === req.query.status);
  if (req.query.status === 'dues') rows = rows.filter((m) => m.feeDue > 0);
  res.json({ members: rows, categories: CATEGORIES });
});

router.post(
  '/members',
  desk,
  demoCap(Member, 150),
  body(
    z.object({
      name: zName,
      phone: zPhone,
      email: zEmail.optional(),
      category: z.enum(CATEGORIES).optional(),
      planId: zId,
      startDate: zDay.optional(),
      trainerId: zId.nullable().optional(),
      notes: zText(500).optional(),
      ...paymentPart,
    }),
  ),
  async (req, res) => {
    const { paidNow = 0, method = 'cash', planId, trainerId, startDate, ...fields } = req.data;
    const plan = await findOwned(Plan, req, planId, 'Plan');
    const start = startDate || dayKey();
    const count = await Member.countDocuments({ gymId: req.gymId });
    const member = new Member({
      ...fields,
      gymId: req.gymId,
      planId: plan._id,
      trainerId: req.pkg === 'performance' ? await trainerFor(req, trainerId) : null,
      startDate: start,
      expiryDate: shiftMonths(start, plan.durationMonths),
      feeDue: plan.price,
      memberCode: `IP-${1001 + count}`,
    });
    for (let attempt = 0; ; attempt++) {
      try {
        await member.save();
        break;
      } catch (err) {
        if (err?.code !== 11000 || attempt >= 5) throw err;
        member.memberCode = `IP-${2000 + Math.floor(Math.random() * 8000)}`;
      }
    }
    if (paidNow > 0) {
      await recordPayment(member, { amount: Math.min(paidNow, plan.price), method, note: `${plan.name} fee`, recordedBy: req.user.name });
    }
    res.status(201).json({ member: memberView(member, await lookups(req.gymId)) });
  },
);

router.get('/members/:id', desk, async (req, res) => {
  const member = await findOwned(Member, req, req.params.id, 'Member');
  const since = shiftDay(dayKey(), -30);
  const [look, payments, visits] = await Promise.all([
    lookups(req.gymId),
    Payment.find({ gymId: req.gymId, memberId: member._id }).sort({ paidOn: -1, createdAt: -1 }).limit(12),
    Attendance.find({ gymId: req.gymId, memberId: member._id, day: { $gte: since } }).sort({ day: -1 }),
  ]);
  res.json({ member: memberView(member, look), payments, visits: visits.map((v) => v.day) });
});

router.patch(
  '/members/:id',
  desk,
  body(
    z.object({
      name: zName.optional(),
      phone: zPhone.optional(),
      email: zEmail.optional(),
      category: z.enum(CATEGORIES).optional(),
      planId: zId.optional(),
      expiryDate: zDay.optional(),
      notes: zText(500).optional(),
    }),
  ),
  async (req, res) => {
    const member = await findOwned(Member, req, req.params.id, 'Member');
    const { planId, ...fields } = req.data;
    if (planId) member.planId = (await findOwned(Plan, req, planId, 'Plan'))._id;
    Object.assign(member, fields);
    await member.save();
    res.json({ member: memberView(member, await lookups(req.gymId)) });
  },
);

/** Extends the membership by one plan period from today (or from the current expiry if still running). */
router.post('/members/:id/renew', desk, body(z.object({ planId: zId.optional(), ...paymentPart })), async (req, res) => {
  const member = await findOwned(Member, req, req.params.id, 'Member');
  const plan = await findOwned(Plan, req, req.data.planId || member.planId, 'Plan');
  const today = dayKey();
  member.planId = plan._id;
  member.expiryDate = shiftMonths(member.expiryDate < today ? today : member.expiryDate, plan.durationMonths);
  member.feeDue += plan.price;
  await member.save();
  const { paidNow = 0, method = 'cash' } = req.data;
  if (paidNow > 0) {
    await recordPayment(member, { amount: Math.min(paidNow, member.feeDue), method, note: `${plan.name} renewal`, recordedBy: req.user.name });
  }
  res.json({ member: memberView(member, await lookups(req.gymId)) });
});

/** Memberships that need attention: ending within two weeks, or lapsed in the last 45 days. */
router.get('/renewals', desk, async (req, res) => {
  const today = dayKey();
  const [members, look] = await Promise.all([
    Member.find({ gymId: req.gymId, expiryDate: { $gte: shiftDay(today, -45), $lte: shiftDay(today, 14) } }).sort({ expiryDate: 1 }),
    lookups(req.gymId),
  ]);
  const rows = members.map((m) => memberView(m, look, today));
  res.json({ expiring: rows.filter((m) => m.daysLeft >= 0), lapsed: rows.filter((m) => m.daysLeft < 0).reverse() });
});

export default router;
