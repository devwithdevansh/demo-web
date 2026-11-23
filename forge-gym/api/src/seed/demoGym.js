import { createHash, randomBytes } from 'node:crypto';
import { config } from '../config.js';
import { dayKey, shiftDay, shiftMonths, at, weekdayOf } from '../lib/dates.js';
import {
  Gym, User, Plan, Member, Attendance, Payment, Lead, ClassSlot, Announcement, CoachLog, FitnessVideo, TENANT_MODELS,
} from '../models/index.js';


/**
 * The sample gym. Every name, number and figure below is invented for the
 * demo. Dates are generated relative to today so the data always looks current.
 */
export const SAMPLE_GYM_NAME = 'Iron Forge Gym';
const DEMO_ADDONS = { whatsapp: true, upiLinks: true, autopay: true, leadFollowup: true, trainerPlus: true };
export const SAMPLE_CLIP = '/demo/sample-clip';

export const hashKey = (key) => createHash('sha256').update(String(key)).digest('hex');

// Small deterministic generator so every sandbox starts with the same believable history.
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const phone = (n) => `+91 00000 ${String(10000 + n).slice(-5)}`;

// name, plan, days until expiry, fee due, category, trainer, PT total, PT used, paid periods
const MEMBERS = [
  ['Member 1', 3, 18, 0, 'Strength', 0, 12, 7, 5],
  ['Member 2', 1, 3, 1500, 'Weight loss', 1, 0, 0, 4],
  ['Member 3', 0, -2, 0, 'General fitness', null, 0, 0, 3],
  ['Member 4', 2, 41, 0, 'Weight loss', 1, 8, 3, 2],
  ['Member 5', 4, 212, 0, 'Strength', 0, 24, 10, 1],
];

const ex = (name, sets, reps, note = '', videoUrl = '') => ({ name, sets, reps, note, videoUrl });

const WORKOUTS = {
  'Member 1': {
    title: 'Strength Block · Week 3',
    days: [
      { day: 'Monday', focus: 'Push', exercises: [
        ex('Bench Press', '4', '6', 'Pause for one second on the chest.', SAMPLE_CLIP),
        ex('Overhead Press', '3', '8'),
        ex('Incline Dumbbell Press', '3', '10'),
        ex('Triceps Pushdown', '3', '12'),
      ] },
      { day: 'Wednesday', focus: 'Pull', exercises: [
        ex('Deadlift', '3', '5', 'Reset your position before every rep.'),
        ex('Barbell Row', '4', '8'),
        ex('Lat Pulldown', '3', '10'),
        ex('Face Pull', '3', '15'),
      ] },
      { day: 'Friday', focus: 'Legs', exercises: [
        ex('Back Squat', '4', '6', 'Keep the same depth on every rep.'),
        ex('Romanian Deadlift', '3', '8'),
        ex('Walking Lunge', '3', '12 each side'),
        ex('Plank', '3', '45 sec'),
      ] },
      { day: 'Saturday', focus: 'Conditioning', exercises: [
        ex('Sled Push', '6', '20 m'),
        ex('Farmer Carry', '4', '30 m'),
        ex('Bike Intervals', '8', '30 sec hard, 60 sec easy'),
      ] },
    ],
  },
  'Member 2': {
    title: 'Upper / Lower Split',
    days: [
      { day: 'Tuesday', focus: 'Upper', exercises: [ex('Bench Press', '5', '5', '', SAMPLE_CLIP), ex('Pull-up', '4', '6'), ex('Dumbbell Row', '3', '10')] },
      { day: 'Thursday', focus: 'Lower', exercises: [ex('Back Squat', '5', '5'), ex('Leg Press', '3', '12'), ex('Calf Raise', '3', '15')] },
    ],
  },
};

const MEMBER_DIET = {
  title: 'Eating guide from your coach',
  note: 'General guidance shared by the gym team to support your training. Adjust portions with your coach.',
  meals: [
    { label: 'Breakfast', items: 'Vegetable omelette or paneer bhurji, 2 rotis, one fruit' },
    { label: 'Lunch', items: 'Dal, sabzi, salad, 2 rotis or a bowl of rice, curd' },
    { label: 'Before training', items: 'Banana and a handful of peanuts' },
    { label: 'Dinner', items: 'Grilled paneer or chicken, sauteed vegetables, a small bowl of rice' },
  ],
};

const TIMETABLE = [
  ['MON', '06:00', 'Strength', 0], ['MON', '07:30', 'HIIT', 1], ['MON', '18:00', 'Boxing', 2],
  ['TUE', '06:30', 'Mobility', 0], ['TUE', '18:00', 'CrossFit', 1], ['TUE', '19:30', 'Yoga', 2],
  ['WED', '06:00', 'Strength', 0], ['WED', '18:00', 'HIIT', 1],
  ['THU', '06:30', 'Boxing', 2], ['THU', '18:00', 'CrossFit', 1], ['THU', '19:30', 'Mobility', 0],
  ['FRI', '06:00', 'Strength', 0], ['FRI', '07:30', 'HIIT', 1], ['FRI', '18:00', 'Yoga', 2],
  ['SAT', '08:00', 'CrossFit', 1], ['SAT', '09:30', 'Boxing', 2],
  ['SUN', '09:00', 'Mobility', 0],
];

// name, source, status, follow-up offset in days (null = none), interest, notes
const LEADS = [
  ['Lead 1', 'website', 'new', 0, 'Pro plan', 'Asked about the morning batch.'],
  ['Lead 2', 'walk-in', 'contacted', 1, 'Personal training', 'Wants a trial session with a trainer.'],
  ['Lead 3', 'instagram', 'trial', 0, 'Basic or Pro plan', 'Trial done on Saturday. Deciding between two plans.'],
];

export async function purgeGym(gymId) {
  await Promise.all(TENANT_MODELS.map((M) => M.deleteMany({ gymId })));
}

/** Fills one gym with the sample data set. The gym must be empty. */
export async function seedGym(gym) {
  const gymId = gym._id;
  const today = dayKey();
  const rand = rng(20261004);
  const demo = { gymId, isDemo: true };

  const users = await User.insertMany([
    { ...demo, name: 'Owner 1', email: 'owner1@gmail.com', role: 'owner', title: 'Gym Owner', phone: phone(1), demoPrimary: true },
    { ...demo, name: 'Staff 1', email: 'staff1@gmail.com', role: 'staff', title: 'Front Desk & Operations', phone: phone(2), demoPrimary: true },
    { ...demo, name: 'Trainer 1', email: 'trainer1@gmail.com', role: 'trainer', title: 'Head Strength Coach', phone: phone(3), demoPrimary: true },
    { ...demo, name: 'Trainer 2', email: 'trainer2@gmail.com', role: 'trainer', title: 'Fitness Coach', phone: phone(4) },
    { ...demo, name: 'Trainer 3', email: 'trainer3@gmail.com', role: 'trainer', title: 'Conditioning Coach', phone: phone(5) },
    { ...demo, name: 'Member 1', email: 'member1@gmail.com', role: 'member', phone: phone(100), demoPrimary: true },
    { ...demo, name: 'Member 2', email: 'member2@gmail.com', role: 'member', phone: phone(101) },
    { ...demo, name: 'Member 3', email: 'member3@gmail.com', role: 'member', phone: phone(102) },
    { ...demo, name: 'Member 4', email: 'member4@gmail.com', role: 'member', phone: phone(103) },
    { ...demo, name: 'Member 5', email: 'member5@gmail.com', role: 'member', phone: phone(104) },
  ]);
  const trainers = users.slice(2, 5);
  const memberUsers = users.slice(5, 10);

  const plans = await Plan.insertMany([
    { gymId, name: 'Basic Monthly', price: 1499, durationMonths: 1 },
    { gymId, name: 'Pro Monthly', price: 2999, durationMonths: 1 },
    { gymId, name: 'Pro Quarterly', price: 7999, durationMonths: 3 },
    { gymId, name: 'Elite Monthly', price: 5499, durationMonths: 1 },
    { gymId, name: 'Elite Yearly', price: 54990, durationMonths: 12 },
  ]);

  const stamp = (daysAgo) => at(shiftDay(today, -daysAgo), '10:00');
  const members = await Member.insertMany(
    MEMBERS.map(([name, planIdx, expiresIn, feeDue, category, trainerIdx, ptTotal, ptUsed, periods], i) => {
      const plan = plans[planIdx];
      const expiryDate = shiftDay(today, expiresIn);
      const workout = WORKOUTS[name];
      const trainer = trainerIdx === null ? null : trainers[trainerIdx];
      return {
        gymId,
        memberCode: `IP-${1001 + i}`,
        name,
        phone: phone(100 + i),
        email: `member${i + 1}@gmail.com`,
        category,
        planId: plan._id,
        startDate: shiftMonths(expiryDate, -plan.durationMonths * periods),
        expiryDate,
        feeDue,
        trainerId: trainer?._id ?? null,
        userId: memberUsers[i]?._id ?? null,
        pt: { total: ptTotal, used: ptUsed },
        autopay:
          name === 'Member 1' ? { status: 'active', amount: plan.price, updatedAt: stamp(40) }
          : name === 'Member 2' ? { status: 'requested', amount: plan.price, updatedAt: stamp(1) }
          : { status: 'none' },
        workout: workout ? { ...workout, updatedAt: stamp(5), updatedBy: trainer?.name } : undefined,
        diet: i === 0 ? { ...MEMBER_DIET, updatedAt: stamp(12), updatedBy: trainer?.name } : undefined,
      };
    }),
  );

  // Clean payments for Member 1, Member 4, and Member 5
  const payments = [
    {
      gymId, memberId: members[0]._id, amount: plans[1].price, method: 'upi', paidOn: shiftDay(today, -15),
      note: `${plans[1].name} fee`, recordedBy: 'Staff 1', createdAt: at(shiftDay(today, -15), '11:00'),
    },
    {
      gymId, memberId: members[3]._id, amount: plans[2].price, method: 'upi', paidOn: shiftDay(today, -40),
      note: `${plans[2].name} fee`, recordedBy: 'Staff 1', createdAt: at(shiftDay(today, -40), '11:00'),
    },
    {
      gymId, memberId: members[4]._id, amount: plans[4].price, method: 'bank', paidOn: shiftDay(today, -90),
      note: `${plans[4].name} fee`, recordedBy: 'Staff 1', createdAt: at(shiftDay(today, -90), '11:00'),
    },
  ];
  await Payment.insertMany(payments);

  // Attendance: three weeks of history plus check-ins made today for members 1, 2, 4
  const attendance = [];
  const todays = [0, 1, 3];
  const opened = at(today, '05:35').getTime();
  const openFor = Date.now() - opened;
  members.forEach((m, i) => {
    const habit = 0.35 + rand() * 0.5;
    for (let back = 21; back >= 1; back--) {
      const day = shiftDay(today, -back);
      if (day < m.startDate || day > m.expiryDate) continue;
      if (rand() > (weekdayOf(day) === 'SUN' ? habit * 0.4 : habit)) continue;
      const hour = rand() < 0.55 ? 6 + Math.floor(rand() * 4) : 17 + Math.floor(rand() * 4);
      const minute = String(Math.floor(rand() * 60)).padStart(2, '0');
      attendance.push({
        gymId, memberId: m._id, day,
        checkInAt: at(day, `${String(hour).padStart(2, '0')}:${minute}`),
        method: rand() < 0.6 ? 'qr' : 'manual',
      });
    }
    const order = todays.indexOf(i) + 1;
    if (order > 0 && openFor > 20 * 60000) {
      attendance.push({
        gymId, memberId: m._id, day: today,
        checkInAt: new Date(opened + (openFor * order) / (todays.length + 1)),
        method: order % 3 === 0 ? 'manual' : 'qr',
      });
    }
  });
  await Attendance.insertMany(attendance);

  await Lead.insertMany(
    LEADS.map(([name, source, status, followUp, interest, notes], i) => ({
      gymId, name, phone: phone(200 + i), source, status, interest, notes,
      followUpOn: followUp === null ? undefined : shiftDay(today, followUp),
      createdAt: stamp(3 + i * 2),
    })),
  );

  await ClassSlot.insertMany(
    TIMETABLE.map(([day, time, name, trainerIdx]) => ({ gymId, day, time, name, trainerId: trainers[trainerIdx]._id })),
  );

  await Announcement.insertMany([
    { gymId, title: 'Sunday timings', body: 'From this Sunday the gym is open 7:00 AM to 1:00 PM. Evening slots stay closed on Sundays.', postedBy: 'Owner 1', createdAt: stamp(1) },
    { gymId, title: 'New Saturday mobility class', body: 'Mobility class every Saturday at 10:30 AM. Open to all plans.', postedBy: 'Owner 1', createdAt: stamp(4) },
    { gymId, title: 'Please carry a towel', body: 'A quick reminder to carry a hand towel and wipe down equipment after use.', postedBy: 'Staff 1', createdAt: stamp(9) },
  ]);

  await FitnessVideo.insertMany([
    {
      gymId,
      title: 'How To Deadlift with Perfect Form (Avoid Injury)',
      category: 'Workout Form',
      videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
      youtubeId: 'op9kVnSso6Q',
      thumbnailUrl: 'https://img.youtube.com/vi/op9kVnSso6Q/hqdefault.jpg',
      description: 'Master the barbell deadlift: hip hinge, bracing, foot stance, and bar path.',
      pinned: true,
      postedBy: 'Owner 1',
      createdAt: stamp(2),
    },
    {
      gymId,
      title: 'How to Squat Properly: Step by Step Guide',
      category: 'Legs & Glutes',
      videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8',
      youtubeId: 'bEv6CCg2BC8',
      thumbnailUrl: 'https://img.youtube.com/vi/bEv6CCg2BC8/hqdefault.jpg',
      description: 'Full barbell squat technique breakdown for knee safety and maximum quad/glute growth.',
      pinned: true,
      postedBy: 'Trainer 1',
      createdAt: stamp(5),
    },
    {
      gymId,
      title: '10-Minute Full Body Warm-Up & Mobility Routine',
      category: 'Warmup & Mobility',
      videoUrl: 'https://www.youtube.com/watch?v=uA_Mbmw2yD4',
      youtubeId: 'uA_Mbmw2yD4',
      thumbnailUrl: 'https://img.youtube.com/vi/uA_Mbmw2yD4/hqdefault.jpg',
      description: 'Do this dynamic warmup before every gym session to prevent muscle strain.',
      pinned: false,
      postedBy: 'Trainer 2',
      createdAt: stamp(8),
    },
    {
      gymId,
      title: 'Perfect Bench Press: Stop Hurting Your Shoulders',
      category: 'Chest & Arms',
      videoUrl: 'https://www.youtube.com/watch?v=vcBig73ojpE',
      youtubeId: 'vcBig73ojpE',
      thumbnailUrl: 'https://img.youtube.com/vi/vcBig73ojpE/hqdefault.jpg',
      description: 'Scapular retraction, arch, leg drive, and bar tuck for a bigger, safer chest press.',
      pinned: false,
      postedBy: 'Trainer 1',
      createdAt: stamp(12),
    },
    {
      gymId,
      title: 'High Protein Diet Plan for Muscle Gain & Fat Loss',
      category: 'Diet & Nutrition',
      videoUrl: 'https://www.youtube.com/watch?v=8YQkK14S14k',
      youtubeId: '8YQkK14S14k',
      thumbnailUrl: 'https://img.youtube.com/vi/8YQkK14S14k/hqdefault.jpg',
      description: 'Simple grocery shopping list and meal prep hacks for everyday gym-goers.',
      pinned: false,
      postedBy: 'Owner 1',
      createdAt: stamp(15),
    },
  ]);

  const byName = Object.fromEntries(members.map((m) => [m.name, m]));
  const log = (name, trainer, daysAgo, type, extra = {}) => {
    const mem = byName[name] || members[0];
    return {
      gymId, memberId: mem._id, trainerName: trainer, day: shiftDay(today, -daysAgo), type, ...extra, createdAt: stamp(daysAgo),
    };
  };
  const weights = [82.4, 82.0, 81.5, 81.1, 80.6, 80.3, 79.9, 79.6];
  await CoachLog.insertMany([
    ...weights.map((weightKg, i) => log('Member 1', 'Trainer 1', 56 - i * 7, 'measurement', { weightKg, waistCm: 92 - i * 0.5 })),
    ...[30, 26, 23, 19, 16, 12, 5].map((d) => log('Member 1', 'Trainer 1', d, 'pt_session', { note: 'PT session completed.' })),
    log('Member 1', 'Trainer 1', 9, 'checkin', { note: 'Bench press moving well. Sleep has been good this week.' }),
    log('Member 1', 'Trainer 1', 23, 'checkin', { note: 'Good consistency, four sessions a week. Added a conditioning day.' }),
    log('Member 2', 'Trainer 2', 4, 'checkin', { note: 'Enjoying the circuit. Add one extra walk per week.' }),
  ]);
}

/** Removes sandboxes nobody has used recently and keeps the total under the configured ceiling. */
export async function sweepSandboxes() {
  const cutoff = new Date(Date.now() - config.sandboxTtlHours * 3600 * 1000);
  const stale = await Gym.find({ isDemo: true, lastUsedAt: { $lt: cutoff } }).select('_id');
  const overflow = (await Gym.countDocuments({ isDemo: true })) - stale.length - (config.maxSandboxes - 1);
  const oldest = overflow > 0
    ? await Gym.find({ isDemo: true, lastUsedAt: { $gte: cutoff } }).sort({ lastUsedAt: 1 }).limit(overflow).select('_id')
    : [];
  for (const { _id } of [...stale, ...oldest]) {
    await purgeGym(_id);
    await Gym.deleteOne({ _id, isDemo: true });
  }
}

/** Creates a private copy of the sample gym for one visitor and returns the key that reopens it. */
export async function createSandbox() {
  await sweepSandboxes();
  const key = randomBytes(24).toString('base64url');
  const gym = await Gym.create({
    name: SAMPLE_GYM_NAME, isDemo: true, demoKeyHash: hashKey(key), package: 'performance', addons: DEMO_ADDONS,
  });
  await seedGym(gym);
  return { gym, key };
}

export async function findSandbox(key) {
  if (typeof key !== 'string' || key.length < 16 || key.length > 80) return null;
  return Gym.findOne({ isDemo: true, demoKeyHash: hashKey(key) });
}

export async function purgeAllOldDemoSandboxes() {
  try {
    const staleGyms = await Gym.find({
      $or: [
        { name: /Ironpeak/i },
        { isDemo: true },
      ],
    }).select('_id');
    for (const { _id } of staleGyms) {
      await purgeGym(_id);
      await Gym.deleteOne({ _id });
    }
  } catch (err) {
    console.error('[demo] Error cleaning old sandboxes:', err);
  }
}

/** Restores a sandbox to the original sample data. Refuses to touch anything that is not a demo gym. */
export async function resetSandbox(gym) {
  if (!gym.isDemo) throw new Error('Only demo gyms can be reset.');
  await purgeGym(gym._id);
  gym.name = SAMPLE_GYM_NAME;
  gym.addons = DEMO_ADDONS;
  gym.lastUsedAt = new Date();
  await gym.save();
  await seedGym(gym);
}
