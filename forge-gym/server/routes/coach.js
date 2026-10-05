import { Router } from 'express';
import { z } from 'zod';
import { Member, User, ClassSlot, Announcement, CoachLog, CATEGORIES, WEEKDAYS } from '../models/index.js';
import { requireRole, requireAddon } from '../middleware/auth.js';
import { body, findOwned, demoCap, HttpError, notFound, zId, zText } from '../middleware/http.js';
import { lookups, memberView } from '../lib/members.js';
import { dayKey, dayDiff, weekdayOf } from '../lib/dates.js';
import { SAMPLE_CLIP } from '../seed/demoGym.js';

// Mounted at /api/coach behind requireAuth + requirePackage('performance').
const router = Router();
const owner = requireRole('owner');
const coaches = requireRole('owner', 'trainer');

/** A trainer can only open members assigned to them; anyone else's simply does not exist for them. */
async function coachable(req, id) {
  const member = await findOwned(Member, req, id, 'Member');
  if (req.user.role === 'trainer' && String(member.trainerId) !== String(req.user._id)) throw notFound('Member');
  return member;
}

export async function timetableFor(gymId) {
  const [slots, trainers] = await Promise.all([ClassSlot.find({ gymId }), User.find({ gymId, role: 'trainer' }).select('name')]);
  const names = new Map(trainers.map((t) => [String(t._id), t.name]));
  return slots
    .map((s) => ({ id: String(s._id), day: s.day, time: s.time, name: s.name, durationMin: s.durationMin, trainerId: s.trainerId ? String(s.trainerId) : null, trainerName: names.get(String(s.trainerId)) ?? null }))
    .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) || a.time.localeCompare(b.time));
}

// ---- Timetable and announcements (seen by every role) ---------------------

router.get('/timetable', async (req, res) => {
  res.json({ slots: await timetableFor(req.gymId), days: WEEKDAYS, today: weekdayOf(dayKey()) });
});

router.post(
  '/timetable',
  owner,
  demoCap(ClassSlot, 80),
  body(
    z.object({
      day: z.enum(WEEKDAYS),
      time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a time like 18:30.'),
      name: z.string().trim().min(2, 'Name the class.').max(60),
      durationMin: z.number().int().min(10).max(180).optional(),
      trainerId: zId.nullable().optional(),
    }),
  ),
  async (req, res) => {
    const { trainerId, ...slot } = req.data;
    if (trainerId && !(await User.exists({ _id: trainerId, gymId: req.gymId, role: 'trainer' }))) {
      throw new HttpError(400, 'Choose a trainer from this gym.', 'invalid');
    }
    await ClassSlot.create({ ...slot, trainerId: trainerId || null, gymId: req.gymId });
    res.status(201).json({ slots: await timetableFor(req.gymId) });
  },
);

router.delete('/timetable/:id', owner, async (req, res) => {
  await (await findOwned(ClassSlot, req, req.params.id, 'Class')).deleteOne();
  res.json({ ok: true });
});

router.get('/announcements', async (req, res) => {
  res.json({ announcements: await Announcement.find({ gymId: req.gymId }).sort({ createdAt: -1 }).limit(20) });
});

router.post(
  '/announcements',
  requireRole('owner', 'staff'),
  demoCap(Announcement, 40),
  body(z.object({ title: z.string().trim().min(3, 'Add a title.').max(100), body: zText(600).optional() })),
  async (req, res) => {
    const announcement = await Announcement.create({ ...req.data, gymId: req.gymId, postedBy: req.user.name });
    res.status(201).json({ announcement });
  },
);

router.delete('/announcements/:id', requireRole('owner', 'staff'), async (req, res) => {
  await (await findOwned(Announcement, req, req.params.id, 'Announcement')).deleteOne();
  res.json({ ok: true });
});

// ---- Owner: categories, trainer assignments, PT packs ---------------------

router.get('/assignments', owner, async (req, res) => {
  const [members, look] = await Promise.all([Member.find({ gymId: req.gymId }).sort({ name: 1 }), lookups(req.gymId)]);
  const today = dayKey();
  res.json({
    members: members.map((m) => memberView(m, look, today)).filter((m) => m.status !== 'expired'),
    trainers: [...look.trainers.values()].filter((t) => t.active).map((t) => ({ id: String(t._id), name: t.name, title: t.title ?? '' })),
    categories: CATEGORIES,
  });
});

router.patch(
  '/members/:id/assignment',
  owner,
  body(z.object({ trainerId: zId.nullable().optional(), category: z.enum(CATEGORIES).optional(), ptTotal: z.number().int().min(0).max(200).optional() })),
  async (req, res) => {
    const member = await findOwned(Member, req, req.params.id, 'Member');
    const { trainerId, category, ptTotal } = req.data;
    if (trainerId !== undefined) {
      if (trainerId && !(await User.exists({ _id: trainerId, gymId: req.gymId, role: 'trainer', active: true }))) {
        throw new HttpError(400, 'Choose a trainer from this gym.', 'invalid');
      }
      member.trainerId = trainerId || null;
    }
    if (category) member.category = category;
    if (ptTotal !== undefined) {
      member.pt.total = ptTotal;
      member.pt.used = Math.min(member.pt.used, ptTotal);
    }
    await member.save();
    res.json({ member: memberView(member, await lookups(req.gymId)) });
  },
);

// ---- Trainer: my members and today's tasks --------------------------------

router.get('/overview', requireRole('trainer'), async (req, res) => {
  const { gymId } = req;
  const today = dayKey();
  const [members, look, slots] = await Promise.all([
    Member.find({ gymId, trainerId: req.user._id }).sort({ name: 1 }),
    lookups(gymId),
    timetableFor(gymId),
  ]);
  const lastLogs = await CoachLog.aggregate([
    { $match: { gymId, memberId: { $in: members.map((m) => m._id) }, type: 'checkin' } },
    { $group: { _id: '$memberId', day: { $max: '$day' } } },
  ]);
  const lastCheckin = new Map(lastLogs.map((l) => [String(l._id), l.day]));

  const tasks = [];
  const rows = members.map((m) => {
    const view = memberView(m, look, today, { coaching: true });
    const last = lastCheckin.get(view.id) ?? null;
    const sinceCheckin = last ? dayDiff(last, today) : null;
    const hasWorkout = (m.workout?.days?.length ?? 0) > 0;
    const ptLeft = m.pt.total - m.pt.used;
    const add = (kind, text) => tasks.push({ id: `${kind}-${view.id}`, kind, memberId: view.id, text });

    if (view.status !== 'expired') {
      if (!hasWorkout) add('plan', `Assign a workout plan to ${m.name}`);
      if (sinceCheckin === null) add('checkin', `First check-in with ${m.name}`);
      else if (sinceCheckin >= 7) add('checkin', `Check in with ${m.name} (last one ${sinceCheckin} days ago)`);
      if (m.pt.total > 0 && ptLeft <= 2) add('pt', `${m.name} has ${ptLeft} PT session${ptLeft === 1 ? '' : 's'} left`);
      if (view.status === 'expiring') add('renewal', `${m.name}'s membership ends in ${view.daysLeft} day${view.daysLeft === 1 ? '' : 's'}`);
    }
    const { workout: _w, diet: _d, ...summary } = view;
    return { ...summary, lastCheckin: last, sinceCheckin, hasWorkout };
  });

  res.json({
    today,
    trainer: { name: req.user.name, title: req.user.title ?? '' },
    members: rows,
    tasks,
    classesToday: slots.filter((s) => s.day === weekdayOf(today) && s.trainerId === String(req.user._id)),
  });
});

// ---- Trainer or owner: one member's coaching record -----------------------

router.get('/members/:id', coaches, async (req, res) => {
  const member = await coachable(req, req.params.id);
  const [look, logs] = await Promise.all([
    lookups(req.gymId),
    CoachLog.find({ gymId: req.gymId, memberId: member._id }).sort({ day: -1, createdAt: -1 }).limit(80),
  ]);
  res.json({ member: memberView(member, look, dayKey(), { coaching: true }), logs });
});

// Links a trainer adds must be ordinary web links. The bundled sample clip is the one local exception.
const zVideo = z.union([
  z.literal(''),
  z.literal(SAMPLE_CLIP),
  z.string().trim().max(300).regex(/^https?:\/\/[^\s<>"']+$/, 'Use a full link starting with https://'),
]);

const workoutInput = z.object({
  title: z.string().trim().min(2, 'Give the plan a title.').max(80),
  days: z
    .array(
      z.object({
        day: z.string().trim().min(1, 'Name the day.').max(20),
        focus: zText(60).optional(),
        exercises: z
          .array(
            z.object({
              name: z.string().trim().min(1, 'Name the exercise.').max(80),
              sets: zText(20).optional(),
              reps: zText(30).optional(),
              note: zText(160).optional(),
              videoUrl: zVideo.optional(),
            }),
          )
          .max(12),
      }),
    )
    .max(7),
});

router.put('/members/:id/workout', coaches, body(workoutInput), async (req, res) => {
  const member = await coachable(req, req.params.id);
  member.workout = { ...req.data, updatedAt: new Date(), updatedBy: req.user.name };
  await member.save();
  res.json({ workout: member.toJSON().workout });
});

router.put(
  '/members/:id/diet',
  coaches,
  body(
    z.object({
      title: z.string().trim().min(2, 'Give the guide a title.').max(80),
      note: zText(600).optional(),
      meals: z.array(z.object({ label: z.string().trim().min(1, 'Name the meal.').max(40), items: zText(300) })).max(8),
    }),
  ),
  async (req, res) => {
    const member = await coachable(req, req.params.id);
    member.diet = { ...req.data, updatedAt: new Date(), updatedBy: req.user.name };
    await member.save();
    res.json({ diet: member.toJSON().diet });
  },
);

router.post(
  '/members/:id/logs',
  coaches,
  demoCap(CoachLog, 2000),
  body(
    z
      .object({
        type: z.enum(['checkin', 'measurement']),
        weightKg: z.number({ error: 'Enter a number.' }).min(20, 'Check the weight.').max(300, 'Check the weight.').optional(),
        waistCm: z.number({ error: 'Enter a number.' }).min(30, 'Check the measurement.').max(250, 'Check the measurement.').optional(),
        note: zText(400).optional(),
      })
      .refine((v) => v.type !== 'checkin' || !!v.note, { path: ['note'], message: 'Add a short note for the check-in.' })
      .refine((v) => v.type !== 'measurement' || v.weightKg !== undefined || v.waistCm !== undefined, {
        path: ['weightKg'],
        message: 'Enter a weight or a waist measurement.',
      }),
  ),
  async (req, res) => {
    const member = await coachable(req, req.params.id);
    const entry = await CoachLog.create({ ...req.data, gymId: req.gymId, memberId: member._id, trainerName: req.user.name, day: dayKey() });
    res.status(201).json({ log: entry });
  },
);

router.post('/members/:id/pt-session', coaches, demoCap(CoachLog, 2000), body(z.object({ note: zText(400).optional() })), async (req, res) => {
  const member = await coachable(req, req.params.id);
  if (member.pt.used >= member.pt.total) throw new HttpError(409, 'There are no PT sessions left in this pack.', 'pt_exhausted');
  member.pt.used += 1;
  await member.save();
  const entry = await CoachLog.create({
    gymId: req.gymId, memberId: member._id, trainerName: req.user.name, day: dayKey(), type: 'pt_session',
    note: req.data.note || 'PT session completed.',
  });
  res.status(201).json({ log: entry, pt: member.pt });
});

// ---- Trainer Plus add-on: ready-made plan templates -----------------------

const t = (name, sets, reps) => ({ name, sets, reps, note: '', videoUrl: '' });
const TEMPLATES = [
  { id: 'beginner-3day', title: 'Beginner · 3 days', days: [
    { day: 'Day 1', focus: 'Full body A', exercises: [t('Goblet Squat', '3', '10'), t('Push-up', '3', '8'), t('Seated Row', '3', '12')] },
    { day: 'Day 2', focus: 'Full body B', exercises: [t('Leg Press', '3', '12'), t('Dumbbell Press', '3', '10'), t('Lat Pulldown', '3', '12')] },
    { day: 'Day 3', focus: 'Full body C', exercises: [t('Romanian Deadlift', '3', '10'), t('Shoulder Press', '3', '10'), t('Plank', '3', '30 sec')] },
  ] },
  { id: 'fat-loss-circuit', title: 'Fat loss circuit', days: [
    { day: 'Day 1', focus: 'Circuit', exercises: [t('Kettlebell Swing', '4', '15'), t('Step-up', '4', '12 each side'), t('Rowing Machine', '4', '2 min')] },
    { day: 'Day 2', focus: 'Intervals', exercises: [t('Bike Intervals', '8', '30 sec hard, 60 sec easy'), t('Farmer Carry', '4', '30 m')] },
  ] },
  { id: 'push-pull-legs', title: 'Push / Pull / Legs', days: [
    { day: 'Push', focus: 'Chest, shoulders, triceps', exercises: [t('Bench Press', '4', '6'), t('Overhead Press', '3', '8'), t('Triceps Pushdown', '3', '12')] },
    { day: 'Pull', focus: 'Back, biceps', exercises: [t('Deadlift', '3', '5'), t('Barbell Row', '4', '8'), t('Face Pull', '3', '15')] },
    { day: 'Legs', focus: 'Quads, hamstrings', exercises: [t('Back Squat', '4', '6'), t('Walking Lunge', '3', '12 each side'), t('Calf Raise', '3', '15')] },
  ] },
];

router.get('/templates', coaches, requireAddon('trainerPlus'), (_req, res) => res.json({ templates: TEMPLATES }));

export default router;
