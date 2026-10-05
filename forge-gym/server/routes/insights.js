import { Router } from 'express';
import { z } from 'zod';
import { Member, Attendance, Payment, Lead, User, LEAD_STATUSES, PAY_METHODS } from '../models/index.js';
import { requireRole } from '../middleware/auth.js';
import { body, findOwned, demoCap, zName, zPhone, zText } from '../middleware/http.js';
import { lookups, memberView } from '../lib/members.js';
import { dayKey, shiftDay, shiftMonths, timeLabel } from '../lib/dates.js';

const router = Router();
const desk = requireRole('owner', 'staff');
const owner = requireRole('owner');
const sum = (rows) => rows.reduce((total, r) => total + r.amount, 0);

/** The "today" view: who came in, what was collected, and what needs a follow-up. */
router.get('/dashboard', desk, async (req, res) => {
  const { gymId } = req;
  const today = dayKey();
  const [members, look, checkins, monthPayments, leads] = await Promise.all([
    Member.find({ gymId }),
    lookups(gymId),
    Attendance.find({ gymId, day: today }).sort({ checkInAt: -1 }),
    Payment.find({ gymId, paidOn: { $gte: `${today.slice(0, 7)}-01` } }).sort({ createdAt: -1 }),
    Lead.find({ gymId, status: { $in: ['new', 'contacted', 'trial'] } }),
  ]);
  const rows = members.map((m) => memberView(m, look, today));
  const names = new Map(rows.map((m) => [m.id, m.name]));
  const paidToday = monthPayments.filter((p) => p.paidOn === today);
  const followUps = leads.filter((l) => l.followUpOn && l.followUpOn <= today).sort((a, b) => a.followUpOn.localeCompare(b.followUpOn));

  res.json({
    today,
    counts: {
      activeMembers: rows.filter((m) => m.status !== 'expired').length,
      expiringSoon: rows.filter((m) => m.status === 'expiring').length,
      lapsed: rows.filter((m) => m.status === 'expired' && m.daysLeft >= -45).length,
      checkinsToday: checkins.length,
      collectedToday: sum(paidToday),
      collectedMonth: req.user.role === 'owner' ? sum(monthPayments) : null,
      duesTotal: rows.reduce((total, m) => total + m.feeDue, 0),
      duesMembers: rows.filter((m) => m.feeDue > 0).length,
      openLeads: leads.length,
      followUpsDue: followUps.length,
    },
    checkins: checkins.slice(0, 8).map((c) => ({ id: String(c._id), name: names.get(String(c.memberId)) ?? 'Removed member', time: timeLabel(c.checkInAt), method: c.method })),
    expiring: rows.filter((m) => m.status === 'expiring').sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 6),
    followUps: followUps.slice(0, 6),
    payments: paidToday.slice(0, 6).map((p) => ({ ...p.toJSON(), memberName: names.get(String(p.memberId)) ?? 'Removed member' })),
  });
});

router.get('/reports', owner, async (req, res) => {
  const { gymId } = req;
  const today = dayKey();
  const firstMonth = `${shiftMonths(`${today.slice(0, 7)}-01`, -5).slice(0, 7)}-01`;
  const twoWeeksAgo = shiftDay(today, -13);
  const [members, look, payments, attendance, leads] = await Promise.all([
    Member.find({ gymId }),
    lookups(gymId),
    Payment.find({ gymId, paidOn: { $gte: firstMonth } }).select('amount paidOn method'),
    Attendance.find({ gymId, day: { $gte: twoWeeksAgo } }).select('day'),
    Lead.find({ gymId }).select('status'),
  ]);
  const rows = members.map((m) => memberView(m, look, today));
  const tally = (items, key) => items.reduce((acc, item) => acc.set(key(item), (acc.get(key(item)) ?? 0) + 1), new Map());

  const months = Array.from({ length: 6 }, (_, i) => shiftMonths(firstMonth, i).slice(0, 7));
  const days = Array.from({ length: 14 }, (_, i) => shiftDay(twoWeeksAgo, i));
  const visits = tally(attendance, (a) => a.day);
  const plans = tally(rows.filter((m) => m.status !== 'expired'), (m) => m.planName);
  const statuses = tally(rows, (m) => m.status);
  const leadStatuses = tally(leads, (l) => l.status);

  res.json({
    today,
    revenueByMonth: months.map((month) => ({ month, total: sum(payments.filter((p) => p.paidOn.startsWith(month))) })),
    attendanceByDay: days.map((day) => ({ day, count: visits.get(day) ?? 0 })),
    membersByStatus: ['active', 'expiring', 'expired'].map((status) => ({ status, count: statuses.get(status) ?? 0 })),
    membersByPlan: [...plans].map(([plan, count]) => ({ plan, count })).sort((a, b) => b.count - a.count),
    leadsByStatus: LEAD_STATUSES.map((status) => ({ status, count: leadStatuses.get(status) ?? 0 })),
    revenueByMethod: PAY_METHODS.map((method) => ({ method, total: sum(payments.filter((p) => p.method === method)) })),
  });
});

// ---- Team (trainers and staff) --------------------------------------------

const teamInput = z.object({
  name: zName,
  role: z.enum(['trainer', 'staff']),
  title: zText(80).optional(),
  phone: z.union([zPhone, z.literal('')]).optional(),
});

router.get('/team', desk, async (req, res) => {
  const [team, members] = await Promise.all([
    User.find({ gymId: req.gymId, role: { $in: ['owner', 'staff', 'trainer'] } }).sort({ role: 1, name: 1 }),
    Member.find({ gymId: req.gymId, trainerId: { $ne: null } }).select('trainerId'),
  ]);
  const load = new Map();
  for (const m of members) load.set(String(m.trainerId), (load.get(String(m.trainerId)) ?? 0) + 1);
  res.json({
    team: team.map((u) => ({ id: String(u._id), name: u.name, role: u.role, title: u.title ?? '', phone: u.phone ?? '', active: u.active, members: load.get(String(u._id)) ?? 0 })),
  });
});

router.post('/team', owner, demoCap(User, 40), body(teamInput), async (req, res) => {
  const user = await User.create({ ...req.data, gymId: req.gymId, isDemo: req.gym.isDemo });
  res.status(201).json({ id: String(user._id) });
});

router.patch('/team/:id', owner, body(teamInput.omit({ role: true }).partial().extend({ active: z.boolean().optional() })), async (req, res) => {
  const user = await findOwned(User, req, req.params.id, 'Team member');
  // The owner account and the sample sign-in accounts stay active so the demo can always be entered.
  if (user.role === 'owner' || user.demoPrimary) delete req.data.active;
  Object.assign(user, req.data);
  await user.save();
  res.json({ ok: true });
});

export default router;
