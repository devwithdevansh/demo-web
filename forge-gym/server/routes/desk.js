import { Router } from 'express';
import { z } from 'zod';
import { Member, Attendance, Payment, Lead, PAY_METHODS, LEAD_SOURCES, LEAD_STATUSES } from '../models/index.js';
import { requireRole } from '../middleware/auth.js';
import { body, findOwned, demoCap, HttpError, zName, zPhone, zDay, zId, zText } from '../middleware/http.js';
import { lookups, memberView, recordPayment } from '../lib/members.js';
import { dayKey, timeLabel, DAY_RE } from '../lib/dates.js';

const router = Router();
const desk = requireRole('owner', 'staff');

// ---- Attendance -----------------------------------------------------------

router.get('/attendance', desk, async (req, res) => {
  const today = dayKey();
  const day = DAY_RE.test(req.query.date) && req.query.date <= today ? req.query.date : today;
  const [entries, members, look] = await Promise.all([
    Attendance.find({ gymId: req.gymId, day }).sort({ checkInAt: -1 }),
    Member.find({ gymId: req.gymId }).sort({ name: 1 }),
    lookups(req.gymId),
  ]);
  const byId = new Map(members.map((m) => [String(m._id), memberView(m, look, today)]));
  const present = new Set(entries.map((e) => String(e.memberId)));
  res.json({
    day,
    isToday: day === today,
    entries: entries.map((e) => {
      const m = byId.get(String(e.memberId));
      return { id: String(e._id), memberId: String(e.memberId), name: m?.name ?? 'Removed member', memberCode: m?.memberCode ?? '', time: timeLabel(e.checkInAt), method: e.method };
    }),
    notCheckedIn: [...byId.values()]
      .filter((m) => !present.has(m.id) && m.daysLeft >= -30)
      .map(({ id, name, memberCode, status, daysLeft }) => ({ id, name, memberCode, status, daysLeft })),
  });
});

/** Front-desk check-in, either by picking the member or by the code on their QR pass. */
router.post(
  '/attendance',
  desk,
  demoCap(Attendance, 3000),
  body(z.object({ memberId: zId.optional(), memberCode: zText(12).optional(), method: z.enum(['manual', 'qr']).default('manual') })),
  async (req, res) => {
    const { memberId, memberCode, method } = req.data;
    const member = memberId
      ? await findOwned(Member, req, memberId, 'Member')
      : memberCode
        ? await Member.findOne({ gymId: req.gymId, memberCode: memberCode.toUpperCase() })
        : null;
    if (!member) throw new HttpError(404, 'No member matches that pass.', 'not_found');

    const day = dayKey();
    if (await Attendance.exists({ gymId: req.gymId, memberId: member._id, day })) {
      throw new HttpError(409, `${member.name} is already checked in today.`, 'duplicate');
    }
    const entry = await Attendance.create({ gymId: req.gymId, memberId: member._id, day, method });
    const view = memberView(member, await lookups(req.gymId), day);
    res.status(201).json({
      entry: { id: String(entry._id), memberId: view.id, name: view.name, memberCode: view.memberCode, time: timeLabel(entry.checkInAt), method },
      warning: view.status === 'expired' ? `${view.name}'s membership expired ${-view.daysLeft} day(s) ago.` : null,
    });
  },
);

router.delete('/attendance/:id', desk, async (req, res) => {
  const entry = await findOwned(Attendance, req, req.params.id, 'Check-in');
  await entry.deleteOne();
  res.json({ ok: true });
});

// ---- Payments and dues ----------------------------------------------------

router.get('/payments', desk, async (req, res) => {
  const today = dayKey();
  const month = today.slice(0, 7);
  const [recent, monthPayments, members, look] = await Promise.all([
    Payment.find({ gymId: req.gymId }).sort({ paidOn: -1, createdAt: -1 }).limit(60),
    Payment.find({ gymId: req.gymId, paidOn: { $gte: `${month}-01` } }).select('amount paidOn'),
    Member.find({ gymId: req.gymId }),
    lookups(req.gymId),
  ]);
  const names = new Map(members.map((m) => [String(m._id), m.name]));
  const sum = (rows) => rows.reduce((total, p) => total + p.amount, 0);
  const dues = members.filter((m) => m.feeDue > 0).map((m) => memberView(m, look, today)).sort((a, b) => b.feeDue - a.feeDue);
  res.json({
    payments: recent.map((p) => ({ ...p.toJSON(), memberName: names.get(String(p.memberId)) ?? 'Removed member' })),
    dues,
    totals: {
      today: sum(monthPayments.filter((p) => p.paidOn === today)),
      // Monthly revenue is an owner figure; front-desk staff see the day only.
      month: req.user.role === 'owner' ? sum(monthPayments) : null,
      dues: sum(dues.map((m) => ({ amount: m.feeDue }))),
    },
  });
});

router.post(
  '/payments',
  desk,
  demoCap(Payment, 1500),
  body(
    z.object({
      memberId: zId,
      amount: z.number({ error: 'Enter an amount.' }).int('Use whole rupees.').min(1, 'Enter an amount.').max(1000000),
      method: z.enum(PAY_METHODS),
      note: zText(200).optional(),
    }),
  ),
  async (req, res) => {
    const member = await findOwned(Member, req, req.data.memberId, 'Member');
    const { amount, method, note } = req.data;
    const payment = await recordPayment(member, { amount, method, note, recordedBy: req.user.name });
    res.status(201).json({ payment: { ...payment.toJSON(), memberName: member.name }, feeDue: member.feeDue });
  },
);

// ---- Leads and enquiries --------------------------------------------------

const leadInput = z.object({
  name: zName,
  phone: zPhone,
  interest: zText(80).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  followUpOn: z.union([zDay, z.literal('')]).optional(),
  notes: zText(500).optional(),
});

router.get('/leads', desk, async (req, res) => {
  const leads = await Lead.find({ gymId: req.gymId }).sort({ createdAt: -1 });
  res.json({ leads, today: dayKey(), sources: LEAD_SOURCES, statuses: LEAD_STATUSES });
});

router.post('/leads', desk, demoCap(Lead, 150), body(leadInput), async (req, res) => {
  res.status(201).json({ lead: await Lead.create({ ...req.data, gymId: req.gymId, followUpOn: req.data.followUpOn || undefined }) });
});

router.patch('/leads/:id', desk, body(leadInput.partial()), async (req, res) => {
  const lead = await findOwned(Lead, req, req.params.id, 'Lead');
  Object.assign(lead, req.data);
  if (req.data.followUpOn === '') lead.followUpOn = undefined;
  await lead.save();
  res.json({ lead });
});

export default router;
