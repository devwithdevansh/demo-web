import bcrypt from 'bcryptjs';
import { Gym, User, Plan, Member } from '../models/index.js';
import { dayKey, shiftMonths } from '../lib/dates.js';

export async function ensureDefaultLiveUsers() {
  try {
    // 1. Find or create default Live Gym
    let gym = await Gym.findOne({ isDemo: false });
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
    }

    const defaultPassword = 'forge1234';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // 2. Default Plans
    let plan = await Plan.findOne({ gymId: gym._id });
    if (!plan) {
      plan = await Plan.create({
        gymId: gym._id,
        name: 'Performance Monthly',
        price: 2999,
        durationMonths: 1,
        active: true,
      });
    }

    // 3. User definitions
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
        // Ensure active and passwordHash is updated to forge1234
        user.passwordHash = passwordHash;
        user.active = true;
        user.gymId = gym._id;
        user.isDemo = false;
        await user.save();
      }

      if (u.role === 'trainer') {
        trainerDocs.push(user);
      }

      // If user is member, ensure corresponding Member record exists
      if (u.role === 'member') {
        let memberDoc = await Member.findOne({ gymId: gym._id, email: u.email });
        if (!memberDoc) {
          const today = dayKey();
          const memberIndex = u.email.replace(/\D/g, '') || '1';
          await Member.create({
            gymId: gym._id,
            userId: user._id,
            memberCode: `IP-100${memberIndex}`,
            name: u.name,
            email: u.email,
            phone: u.phone,
            category: 'Strength',
            planId: plan._id,
            startDate: today,
            expiryDate: shiftMonths(today, 1),
            feeDue: 0,
            trainerId: trainerDocs[0]?._id ?? null,
            notes: 'Registered live gym member.',
            pt: { total: 10, used: 2 },
          });
          console.log(`[db-seed] Created Member record for: ${u.name}`);
        } else if (!memberDoc.userId) {
          memberDoc.userId = user._id;
          await memberDoc.save();
        }
      }
    }
  } catch (err) {
    console.error('[db-seed] Error ensuring default users:', err);
  }
}
