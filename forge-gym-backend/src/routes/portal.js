import { Router } from 'express';
import { z } from 'zod';
import { Member, Attendance, Announcement, CoachLog, ActionLog } from '../models/index.js';
import { requireAddon } from '../middleware/auth.js';
import { body, HttpError } from '../middleware/http.js';
import { lookups, memberView } from '../lib/members.js';
import { dayKey, shiftDay, weekdayOf, timeLabel, prettyDay } from '../lib/dates.js';
import { timetableFor } from './coach.js';

// Mounted at /api/portal behind requireAuth + requirePackage('performance') + requireRole('member').
const router = Router();

/** The signed-in member's own record. There is no id in the URL, so there is nothing to tamper with. */
async function ownRecord(req) {
  const member = await Member.findOne({ gymId: req.gymId, userId: req.user._id });
  if (!member) throw new HttpError(404, 'No membership is linked to this account.', 'not_found');
  return member;
}

router.get('/', async (req, res) => {
  const member = await ownRecord(req);
  const { gymId } = req;
  const today = dayKey();
  const [look, logs, visits, announcements, slots] = await Promise.all([
    lookups(gymId),
    CoachLog.find({ gymId, memberId: member._id }).sort({ day: -1, createdAt: -1 }).limit(80),
    Attendance.find({ gymId, memberId: member._id, day: { $gte: shiftDay(today, -29) } }).select('day'),
    Announcement.find({ gymId }).sort({ createdAt: -1 }).limit(10),
    timetableFor(gymId),
  ]);
  const view = memberView(member, look, today, { coaching: true });
  const trainer = member.trainerId ? look.trainers.get(String(member.trainerId)) : null;
  delete view.notes; // staff-only notes are not shown to the member

  res.json({
    today,
    weekday: weekdayOf(today),
    gymName: req.gym.name,
    member: { ...view, trainerTitle: trainer?.title ?? null },
    logs,
    visits: visits.map((v) => v.day).sort(),
    announcements,
    slots,
    gymCheckinCode: `FORGE_CHECKIN:${req.gymId}`,
    addons: { autopay: !!req.gym.addons?.autopay },
  });
});

/** Member self-check-in by scanning the Gym's counter/reception QR code */
router.post('/checkin', body(z.object({ qrCode: z.string().min(1) })), async (req, res) => {
  const member = await ownRecord(req);
  const code = req.data.qrCode.trim();
  const expected = `FORGE_CHECKIN:${req.gymId}`;

  const isValid =
    code.toLowerCase() === expected.toLowerCase() ||
    code === String(req.gymId) ||
    code.toLowerCase().endsWith(String(req.gymId).toLowerCase());

  if (!isValid) {
    throw new HttpError(400, 'Invalid gym QR code. Please scan the check-in QR code at your gym reception.', 'invalid_qr');
  }

  const today = dayKey();
  const existing = await Attendance.findOne({ gymId: req.gymId, memberId: member._id, day: today });
  if (existing) {
    return res.json({
      ok: true,
      alreadyCheckedIn: true,
      message: 'You are already checked in today!',
      time: timeLabel(existing.checkInAt),
    });
  }

  const look = await lookups(req.gymId);
  const view = memberView(member, look, today);
  if (view.status === 'expired') {
    throw new HttpError(
      403,
      `Your membership expired on ${prettyDay(member.expiryDate)}. Please renew at the front desk to check in.`,
      'expired_membership'
    );
  }

  const entry = await Attendance.create({
    gymId: req.gymId,
    memberId: member._id,
    day: today,
    method: 'qr',
    checkInAt: new Date(),
  });

  const countThisMonth = await Attendance.countDocuments({
    gymId: req.gymId,
    memberId: member._id,
    day: { $gte: shiftDay(today, -29) },
  });

  res.status(201).json({
    ok: true,
    alreadyCheckedIn: false,
    message: `Checked in successfully! Welcome to ${req.gym.name}!`,
    time: timeLabel(entry.checkInAt),
    visitsMonth: countThisMonth,
  });
});

const TRANSITIONS = {
  approve: { from: ['none', 'requested', 'cancelled'], to: 'active', title: 'Autopay approved by member' },
  pause: { from: ['active'], to: 'paused', title: 'Autopay paused by member' },
  resume: { from: ['paused'], to: 'active', title: 'Autopay resumed by member' },
  cancel: { from: ['active', 'paused', 'requested'], to: 'cancelled', title: 'Autopay cancelled by member' },
};

/**
 * Autopay is only ever switched on by the member. The gym can ask
 * (status "requested") but cannot approve on the member's behalf.
 */
router.post(
  '/autopay',
  requireAddon('autopay'),
  body(z.object({ action: z.enum(['approve', 'pause', 'resume', 'cancel']), consent: z.boolean().optional() })),
  async (req, res) => {
    const member = await ownRecord(req);
    const step = TRANSITIONS[req.data.action];
    const current = member.autopay?.status ?? 'none';
    if (!step.from.includes(current)) throw new HttpError(409, 'That change is not available right now.', 'invalid_state');
    if (req.data.action === 'approve' && req.data.consent !== true) {
      throw new HttpError(400, 'Please tick the box to confirm you approve automatic payments.', 'consent_required');
    }
    const look = await lookups(req.gymId);
    const amount = look.plans.get(String(member.planId))?.price ?? 0;
    member.autopay = { status: step.to, amount, updatedAt: new Date() };
    await member.save();
    await ActionLog.create({
      gymId: req.gymId, kind: 'autopay', memberId: member._id, title: step.title, amount,
      detail: 'Demo mandate only. No bank or UPI app was contacted and no money will be collected.',
    });
    res.json({ autopay: member.toJSON().autopay });
  },
);

export default router;
