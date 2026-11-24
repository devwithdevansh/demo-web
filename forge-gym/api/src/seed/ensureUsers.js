import bcrypt from 'bcryptjs';
import {
  Gym, User, Plan, Member, Attendance, Payment, Lead, ClassSlot, Announcement, CoachLog, FitnessVideo,
} from '../models/index.js';
import { dayKey, shiftDay, shiftMonths, at } from '../lib/dates.js';

export async function ensureDefaultLiveUsers() {
  try {
    const today = dayKey();
    const ALLOWED_EMAILS = [
      'owner1@gmail.com',
      'staff1@gmail.com',
      'trainer1@gmail.com',
      'trainer2@gmail.com',
      'trainer3@gmail.com',
      'member1@gmail.com',
      'member2@gmail.com',
      'member3@gmail.com',
      'member4@gmail.com',
      'member5@gmail.com',
    ];

    // 1. HARD DELETE all old gyms from MongoDB that are not "Iron Forge Gym"
    await Gym.deleteMany({ name: { $ne: 'Iron Forge Gym' } });

    // 2. Find or create default Live Gym
    let gym = await Gym.findOne({ name: 'Iron Forge Gym' });
    if (!gym) {
      gym = await Gym.create({
        name: 'Iron Forge Gym',
        isDemo: false,
        package: 'performance',
        addons: {
          whatsapp: true,
          upiLinks: true,
          autopay: true,
          leadFollowup: true,
          trainerPlus: true,
        },
      });
      console.log('[db-seed] Created default live gym:', gym.name);
    } else {
      gym.name = 'Iron Forge Gym';
      await gym.save();
    }

    // 3. HARD DELETE any User not in our 10 accounts from MongoDB
    const deletedUsers = await User.deleteMany({ email: { $nin: ALLOWED_EMAILS } });
    if (deletedUsers.deletedCount > 0) {
      console.log(`[db-seed] Deleted ${deletedUsers.deletedCount} unauthorized users from MongoDB`);
    }

    // 4. HARD DELETE any Member whose name is not Member 1..5 or email not in allowed from MongoDB
    const deletedMembers = await Member.deleteMany({
      $or: [
        { email: { $nin: ALLOWED_EMAILS } },
        { name: { $nin: ['Member 1', 'Member 2', 'Member 3', 'Member 4', 'Member 5'] } },
      ],
    });
    if (deletedMembers.deletedCount > 0) {
      console.log(`[db-seed] Deleted ${deletedMembers.deletedCount} legacy members from MongoDB`);
    }

    const defaultPassword = 'forge1234';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // 5. Default Plans
    let basicPlan = await Plan.findOne({ gymId: gym._id, name: 'Basic Monthly' });
    if (!basicPlan) {
      basicPlan = await Plan.create({ gymId: gym._id, name: 'Basic Monthly', price: 1499, durationMonths: 1, active: true });
    }
    let proPlan = await Plan.findOne({ gymId: gym._id, name: 'Pro Monthly' });
    if (!proPlan) {
      proPlan = await Plan.create({ gymId: gym._id, name: 'Pro Monthly', price: 2999, durationMonths: 1, active: true });
    }
    let quarterlyPlan = await Plan.findOne({ gymId: gym._id, name: 'Pro Quarterly' });
    if (!quarterlyPlan) {
      quarterlyPlan = await Plan.create({ gymId: gym._id, name: 'Pro Quarterly', price: 7999, durationMonths: 3, active: true });
    }
    let yearlyPlan = await Plan.findOne({ gymId: gym._id, name: 'Elite Yearly' });
    if (!yearlyPlan) {
      yearlyPlan = await Plan.create({ gymId: gym._id, name: 'Elite Yearly', price: 54990, durationMonths: 12, active: true });
    }

    // 6. User definitions
    const usersToEnsure = [
      { email: 'owner1@gmail.com', name: 'Owner 1', role: 'owner', title: 'Gym Owner', phone: '+919999900001' },
      { email: 'staff1@gmail.com', name: 'Staff 1', role: 'staff', title: 'Front Desk Manager', phone: '+919999900002' },
      { email: 'trainer1@gmail.com', name: 'Trainer 1', role: 'trainer', title: 'Head Strength Coach', phone: '+919999900003' },
      { email: 'trainer2@gmail.com', name: 'Trainer 2', role: 'trainer', title: 'Fitness Coach', phone: '+919999900004' },
      { email: 'trainer3@gmail.com', name: 'Trainer 3', role: 'trainer', title: 'Conditioning Coach', phone: '+919999900005' },
      { email: 'member1@gmail.com', name: 'Member 1', role: 'member', title: 'Member', phone: '+919999900006' },
      { email: 'member2@gmail.com', name: 'Member 2', role: 'member', title: 'Member', phone: '+919999900007' },
      { email: 'member3@gmail.com', name: 'Member 3', role: 'member', title: 'Member', phone: '+919999900008' },
      { email: 'member4@gmail.com', name: 'Member 4', role: 'member', title: 'Member', phone: '+919999900009' },
      { email: 'member5@gmail.com', name: 'Member 5', role: 'member', title: 'Member', phone: '+919999900010' },
    ];

    const trainerDocs = [];
    const memberUsers = [];

    for (const u of usersToEnsure) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create({
          gymId: gym._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          title: u.title,
          passwordHash,
          active: true,
          isDemo: false,
        });
        console.log(`[db-seed] Created real user in database: ${u.email} (${u.role})`);
      } else {
        user.name = u.name;
        user.passwordHash = passwordHash;
        user.active = true;
        user.gymId = gym._id;
        user.isDemo = false;
        await user.save();
      }

      if (u.role === 'trainer') trainerDocs.push(user);
      if (u.role === 'member') memberUsers.push(user);
    }

    // 7. Seed only the 5 clean members in MongoDB
    const memberDefs = [
      { name: 'Member 1', email: 'member1@gmail.com', phone: '+919999900006', plan: proPlan, expiresIn: 22, feeDue: 0, category: 'Strength', trainer: trainerDocs[0] },
      { name: 'Member 2', email: 'member2@gmail.com', phone: '+919999900007', plan: basicPlan, expiresIn: 3, feeDue: 1500, category: 'Weight loss', trainer: trainerDocs[1] },
      { name: 'Member 3', email: 'member3@gmail.com', phone: '+919999900008', plan: basicPlan, expiresIn: -2, feeDue: 0, category: 'General fitness', trainer: null },
      { name: 'Member 4', email: 'member4@gmail.com', phone: '+919999900009', plan: quarterlyPlan, expiresIn: 43, feeDue: 0, category: 'Weight loss', trainer: trainerDocs[1] },
      { name: 'Member 5', email: 'member5@gmail.com', phone: '+919999900010', plan: yearlyPlan, expiresIn: 190, feeDue: 0, category: 'Strength', trainer: trainerDocs[0] },
    ];

    const createdMemberDocs = [];
    for (let i = 0; i < memberDefs.length; i++) {
      const def = memberDefs[i];
      let memberDoc = await Member.findOne({ email: def.email });
      const expiryDate = shiftDay(today, def.expiresIn);
      const startDate = shiftMonths(expiryDate, -def.plan.durationMonths);

      if (!memberDoc) {
        memberDoc = await Member.create({
          gymId: gym._id,
          userId: memberUsers[i]?._id ?? null,
          memberCode: `IP-100${i + 1}`,
          name: def.name,
          email: def.email,
          phone: def.phone,
          category: def.category,
          planId: def.plan._id,
          startDate,
          expiryDate,
          feeDue: def.feeDue,
          trainerId: def.trainer?._id ?? null,
          notes: 'Registered gym member.',
          pt: { total: i === 0 ? 12 : i === 4 ? 24 : 0, used: i === 0 ? 7 : i === 4 ? 10 : 0 },
        });
        console.log(`[db-seed] Created Member record for: ${def.name}`);
      } else {
        memberDoc.name = def.name;
        memberDoc.memberCode = `IP-100${i + 1}`;
        memberDoc.planId = def.plan._id;
        memberDoc.feeDue = def.feeDue;
        memberDoc.expiryDate = expiryDate;
        memberDoc.startDate = startDate;
        memberDoc.trainerId = def.trainer?._id ?? null;
        memberDoc.userId = memberUsers[i]?._id ?? memberDoc.userId;
        await memberDoc.save();
      }
      createdMemberDocs.push(memberDoc);
    }

    const cleanMemberIds = createdMemberDocs.map((m) => m._id);

    // 8. HARD DELETE old payments, attendances, leads, coach logs from MongoDB
    await Payment.deleteMany({ memberId: { $nin: cleanMemberIds } });
    await Attendance.deleteMany({ memberId: { $nin: cleanMemberIds } });
    await CoachLog.deleteMany({ memberId: { $nin: cleanMemberIds } });
    await Lead.deleteMany({ name: { $nin: ['Lead 1', 'Lead 2', 'Lead 3'] } });
    await Announcement.deleteMany({ postedBy: { $nin: ['Owner 1', 'Staff 1'] } });
    await FitnessVideo.deleteMany({ postedBy: { $nin: ['Owner 1', 'Trainer 1', 'Trainer 2'] } });

    // 9. Ensure 3 clean payments exist
    const paymentCount = await Payment.countDocuments({ memberId: { $in: cleanMemberIds } });
    if (paymentCount === 0) {
      await Payment.insertMany([
        {
          gymId: gym._id,
          memberId: createdMemberDocs[0]._id,
          amount: 2999,
          method: 'upi',
          paidOn: shiftDay(today, -15),
          note: 'Pro Monthly fee',
          recordedBy: 'Staff 1',
          createdAt: at(shiftDay(today, -15), '11:00'),
        },
        {
          gymId: gym._id,
          memberId: createdMemberDocs[3]._id,
          amount: 7999,
          method: 'upi',
          paidOn: shiftDay(today, -40),
          note: 'Pro Quarterly fee',
          recordedBy: 'Staff 1',
          createdAt: at(shiftDay(today, -40), '11:00'),
        },
        {
          gymId: gym._id,
          memberId: createdMemberDocs[4]._id,
          amount: 54990,
          method: 'bank',
          paidOn: shiftDay(today, -90),
          note: 'Elite Yearly fee',
          recordedBy: 'Staff 1',
          createdAt: at(shiftDay(today, -90), '11:00'),
        },
      ]);
    }

    // 10. Ensure 3 clean attendances exist
    const attendanceCount = await Attendance.countDocuments({ memberId: { $in: cleanMemberIds } });
    if (attendanceCount === 0) {
      await Attendance.insertMany([
        { gymId: gym._id, memberId: createdMemberDocs[0]._id, day: today, checkInAt: at(today, '10:45'), method: 'qr' },
        { gymId: gym._id, memberId: createdMemberDocs[1]._id, day: today, checkInAt: at(today, '09:30'), method: 'qr' },
        { gymId: gym._id, memberId: createdMemberDocs[3]._id, day: today, checkInAt: at(today, '07:15'), method: 'manual' },
      ]);
    }

    // 11. Ensure clean leads
    const leadCount = await Lead.countDocuments({ gymId: gym._id });
    if (leadCount === 0) {
      await Lead.insertMany([
        { gymId: gym._id, name: 'Lead 1', phone: '+919999900020', source: 'website', status: 'new', interest: 'Pro plan', notes: 'Asked about morning slots.' },
        { gymId: gym._id, name: 'Lead 2', phone: '+919999900021', source: 'walk-in', status: 'contacted', interest: 'Personal training', notes: 'Trial session requested.' },
        { gymId: gym._id, name: 'Lead 3', phone: '+919999900022', source: 'instagram', status: 'trial', interest: 'Basic plan', notes: 'Completed trial on Saturday.' },
      ]);
    }

    console.log('[db-seed] Database successfully purged and synchronized to only clean records.');
  } catch (err) {
    console.error('[db-seed] Error ensuring default users and purging MongoDB:', err);
  }
}
