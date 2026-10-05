import { createHash, randomBytes } from 'node:crypto';
import { config } from '../config.js';
import { dayKey, shiftDay, shiftMonths, at, weekdayOf } from '../lib/dates.js';
import {
  Gym, User, Plan, Member, Attendance, Payment, Lead, ClassSlot, Announcement, CoachLog, TENANT_MODELS,
} from '../models/index.js';

/**
 * The sample gym. Every name, number and figure below is invented for the
 * demo. Dates are generated relative to today so the data always looks current.
 */
export const SAMPLE_GYM_NAME = 'Ironpeak Fitness (Sample Gym)';
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
  ['Aarav Shah', 3, 18, 0, 'Strength', 0, 12, 7, 5],
  ['Diya Patel', 1, 3, 1500, 'Weight loss', 1, 0, 0, 4],
  ['Kabir Rao', 0, -2, 0, 'General fitness', null, 0, 0, 3],
  ['Ananya Iyer', 2, 41, 0, 'Weight loss', 1, 8, 3, 2],
  ['Vihaan Desai', 4, 212, 0, 'Strength', 0, 24, 10, 1],
  ['Ishita Verma', 0, 6, 0, 'Beginner', 3, 0, 0, 2],
  ['Rohan Gupta', 1, -9, 0, 'General fitness', null, 0, 0, 4],
  ['Meera Nair', 1, 12, 1000, 'Senior', 3, 0, 0, 6],
  ['Aditya Singh', 0, 1, 0, 'Student', null, 0, 0, 3],
  ['Sana Khan', 3, 24, 0, 'Personal training', 2, 12, 11, 5],
  ['Dev Malhotra', 2, 67, 0, 'Strength', 0, 0, 0, 2],
  ['Tara Menon', 0, 15, 0, 'Beginner', 3, 0, 0, 1],
  ['Nikhil Joshi', 1, -21, 0, 'General fitness', null, 0, 0, 3],
  ['Pooja Reddy', 1, 9, 0, 'Weight loss', 1, 0, 0, 5],
  ['Arnav Kulkarni', 0, 27, 0, 'Student', null, 0, 0, 2],
  ['Riya Chawla', 3, 5, 0, 'Personal training', 2, 12, 4, 3],
  ['Yash Thakur', 1, 20, 2999, 'General fitness', null, 0, 0, 6],
  ['Kavya Pillai', 2, 52, 0, 'Weight loss', 1, 0, 0, 2],
  ['Manav Bhatt', 0, 11, 499, 'Beginner', 3, 0, 0, 4],
  ['Zoya Mirza', 1, 2, 0, 'General fitness', null, 0, 0, 6],
  ['Harsh Agarwal', 0, -35, 0, 'General fitness', null, 0, 0, 2],
  ['Naina Kapoor', 4, 140, 0, 'Strength', 0, 0, 0, 1],
  ['Sameer Dutta', 1, 29, 0, 'Senior', 3, 0, 0, 5],
  ['Lavanya Rao', 1, 16, 0, 'General fitness', null, 0, 0, 3],
];

const ex = (name, sets, reps, note = '', videoUrl = '') => ({ name, sets, reps, note, videoUrl });

const WORKOUTS = {
  'Aarav Shah': {
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
  'Vihaan Desai': {
    title: 'Upper / Lower Split',
    days: [
      { day: 'Tuesday', focus: 'Upper', exercises: [ex('Bench Press', '5', '5', '', SAMPLE_CLIP), ex('Pull-up', '4', '6'), ex('Dumbbell Row', '3', '10')] },
      { day: 'Thursday', focus: 'Lower', exercises: [ex('Back Squat', '5', '5'), ex('Leg Press', '3', '12'), ex('Calf Raise', '3', '15')] },
    ],
  },
  'Dev Malhotra': {
    title: 'Foundation Strength',
    days: [{ day: 'Mon / Wed / Fri', focus: 'Full body', exercises: [ex('Goblet Squat', '3', '10'), ex('Push-up', '3', '12'), ex('Seated Row', '3', '12')] }],
  },
  'Diya Patel': {
    title: 'Fat Loss Circuit',
    days: [{ day: 'Mon / Thu', focus: 'Circuit', exercises: [ex('Kettlebell Swing', '4', '15'), ex('Step-up', '4', '12 each side'), ex('Rowing Machine', '4', '2 min')] }],
  },
};

const AARAV_DIET = {
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
  ['TUE', '06:30', 'Mobility', 3], ['TUE', '18:00', 'CrossFit', 2], ['TUE', '19:30', 'Yoga', 3],
  ['WED', '06:00', 'Strength', 0], ['WED', '18:00', 'HIIT', 1],
  ['THU', '06:30', 'Boxing', 2], ['THU', '18:00', 'CrossFit', 2], ['THU', '19:30', 'Mobility', 3],
  ['FRI', '06:00', 'Strength', 0], ['FRI', '07:30', 'HIIT', 1], ['FRI', '18:00', 'Yoga', 3],
  ['SAT', '08:00', 'CrossFit', 2], ['SAT', '09:30', 'Boxing', 2],
  ['SUN', '09:00', 'Mobility', 3],
];

// name, source, status, follow-up offset in days (null = none), interest, notes
const LEADS = [
  ['Ritika Sen', 'website', 'new', 0, 'Pro plan', 'Asked about the morning batch.'],
  ['Farhan Ali', 'walk-in', 'contacted', 1, 'Personal training', 'Wants a trial session with a trainer.'],
  ['Sneha Kulkarni', 'instagram', 'trial', 0, 'Basic or Pro plan', 'Trial done on Saturday. Deciding between two plans.'],
  ['Gaurav Jain', 'referral', 'new', -2, 'Strength training', 'Referred by an existing member.'],
  ['Pallavi Shetty', 'phone', 'contacted', 3, 'Yoga classes', 'Call back after her exams.'],
  ['Deepak Rana', 'website', 'new', -1, 'Weight loss', 'Prefers evening slots.'],
  ['Tanvi Mehra', 'walk-in', 'joined', null, 'Pro plan', 'Joined Pro Monthly.'],
  ['Omkar Patil', 'website', 'lost', null, 'Basic plan', 'Chose a gym closer to home.'],
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
    { ...demo, name: 'Rhea Kapoor', role: 'owner', title: 'Owner', phone: phone(1), demoPrimary: true },
    { ...demo, name: 'Imran Shaikh', role: 'staff', title: 'Front desk', phone: phone(2), demoPrimary: true },
    { ...demo, name: 'Alex Rey', role: 'trainer', title: 'Strength Coach', phone: phone(3), demoPrimary: true },
    { ...demo, name: 'Priya Nair', role: 'trainer', title: 'Fitness Coach', phone: phone(4) },
    { ...demo, name: 'Rahul Mehta', role: 'trainer', title: 'Performance Coach', phone: phone(5) },
    { ...demo, name: 'Sara Kade', role: 'trainer', title: 'Conditioning Coach', phone: phone(6) },
    { ...demo, name: 'Aarav Shah', role: 'member', demoPrimary: true },
  ]);
  const trainers = users.slice(2, 6);
  const memberUser = users[6];

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
        email: `${name.split(' ')[0].toLowerCase()}@example.com`,
        category,
        planId: plan._id,
        startDate: shiftMonths(expiryDate, -plan.durationMonths * periods),
        expiryDate,
        feeDue,
        trainerId: trainer?._id ?? null,
        userId: i === 0 ? memberUser._id : null,
        pt: { total: ptTotal, used: ptUsed },
        autopay:
          name === 'Sana Khan' ? { status: 'active', amount: plan.price, updatedAt: stamp(40) }
          : name === 'Riya Chawla' ? { status: 'requested', amount: plan.price, updatedAt: stamp(1) }
          : { status: 'none' },
        workout: workout ? { ...workout, updatedAt: stamp(5), updatedBy: trainer?.name } : undefined,
        diet: i === 0 ? { ...AARAV_DIET, updatedAt: stamp(12), updatedBy: trainer?.name } : undefined,
      };
    }),
  );

  // Fee history: one payment per membership period, newest first, within the last six months.
  const methods = ['upi', 'cash', 'upi', 'card', 'upi', 'bank', 'cash'];
  const horizon = shiftDay(today, -180);
  const payments = [];
  members.forEach((m, i) => {
    const [, planIdx, , feeDue, , , , , periods] = MEMBERS[i];
    const plan = plans[planIdx];
    for (let k = 1; k <= periods; k++) {
      const paidOn = shiftMonths(m.expiryDate, -plan.durationMonths * k);
      if (k > 1 && paidOn < horizon) break;
      const amount = k === 1 ? plan.price - feeDue : plan.price;
      if (amount <= 0) continue;
      payments.push({
        gymId, memberId: m._id, amount, method: methods[(i + k) % methods.length], paidOn,
        note: `${plan.name} fee`, recordedBy: 'Imran Shaikh', createdAt: at(paidOn, '11:00'),
      });
    }
  });
  await Payment.insertMany(payments);

  // Attendance: three weeks of history plus a handful of check-ins already made today.
  const attendance = [];
  const todays = [1, 4, 5, 9, 10, 13, 16, 21];
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
    { gymId, title: 'Sunday timings', body: 'From this Sunday the gym is open 7:00 AM to 1:00 PM. Evening slots stay closed on Sundays.', postedBy: 'Rhea Kapoor', createdAt: stamp(1) },
    { gymId, title: 'New Saturday mobility class', body: 'Sara is starting a 45-minute mobility class every Saturday at 10:30 AM. Open to all plans.', postedBy: 'Rhea Kapoor', createdAt: stamp(4) },
    { gymId, title: 'Please carry a towel', body: 'A quick reminder to carry a hand towel and wipe down equipment after use.', postedBy: 'Imran Shaikh', createdAt: stamp(9) },
  ]);

  const byName = Object.fromEntries(members.map((m) => [m.name, m]));
  const log = (name, trainer, daysAgo, type, extra = {}) => ({
    gymId, memberId: byName[name]._id, trainerName: trainer, day: shiftDay(today, -daysAgo), type, ...extra, createdAt: stamp(daysAgo),
  });
  const weights = [82.4, 82.0, 81.5, 81.1, 80.6, 80.3, 79.9, 79.6];
  await CoachLog.insertMany([
    ...weights.map((weightKg, i) => log('Aarav Shah', 'Alex Rey', 56 - i * 7, 'measurement', { weightKg, waistCm: 92 - i * 0.5 })),
    ...[30, 26, 23, 19, 16, 12, 5].map((d) => log('Aarav Shah', 'Alex Rey', d, 'pt_session', { note: 'PT session completed.' })),
    log('Aarav Shah', 'Alex Rey', 9, 'checkin', { note: 'Bench press moving well. Sleep has been short this week, so keep Saturday light.' }),
    log('Aarav Shah', 'Alex Rey', 23, 'checkin', { note: 'Good consistency, four sessions a week. Added a conditioning day.' }),
    log('Vihaan Desai', 'Alex Rey', 2, 'checkin', { note: 'Squat depth improved. Keep the same load next week.' }),
    log('Dev Malhotra', 'Alex Rey', 12, 'checkin', { note: 'Missed a week for travel. Restart at 90% of previous loads.' }),
    log('Diya Patel', 'Priya Nair', 4, 'checkin', { note: 'Enjoying the circuit. Add one extra walk per week.' }),
    log('Ananya Iyer', 'Priya Nair', 1, 'measurement', { weightKg: 68.2, waistCm: 81 }),
    log('Sana Khan', 'Rahul Mehta', 6, 'checkin', { note: 'One PT session left. Wants to discuss the next pack.' }),
    log('Riya Chawla', 'Rahul Mehta', 15, 'checkin', { note: 'Shoulder feels fine again. Resume overhead work slowly.' }),
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

/** Restores a sandbox to the original sample data. Refuses to touch anything that is not a demo gym. */
export async function resetSandbox(gym) {
  if (!gym.isDemo) throw new Error('Only demo gyms can be reset.');
  await purgeGym(gym._id);
  gym.addons = DEMO_ADDONS;
  gym.lastUsedAt = new Date();
  await gym.save();
  await seedGym(gym);
}
