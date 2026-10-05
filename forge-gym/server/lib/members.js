import { Plan, User, Payment } from '../models/index.js';
import { membershipStatus, dayKey } from './dates.js';

/** Plans and trainers for one gym, keyed by id, for decorating member rows. */
export async function lookups(gymId) {
  const [plans, trainers] = await Promise.all([Plan.find({ gymId }), User.find({ gymId, role: 'trainer' })]);
  const map = (docs) => new Map(docs.map((d) => [String(d._id), d]));
  return { plans: map(plans), trainers: map(trainers) };
}

/** The shape every screen receives for a member: stored fields plus plan, trainer and live status. */
export function memberView(member, look, today = dayKey(), { coaching = false } = {}) {
  const out = member.toJSON();
  delete out.userId;
  if (!coaching) {
    delete out.workout;
    delete out.diet;
  }
  const plan = look.plans.get(String(member.planId));
  const trainer = member.trainerId ? look.trainers.get(String(member.trainerId)) : null;
  return {
    ...out,
    planName: plan?.name ?? 'Plan removed',
    planPrice: plan?.price ?? 0,
    trainerName: trainer?.name ?? null,
    ...membershipStatus(member.expiryDate, today),
  };
}

/** Records money received against a member and lowers what they owe. Saves both documents. */
export async function recordPayment(member, { amount, method, note, recordedBy, simulated = false }) {
  const payment = await Payment.create({
    gymId: member.gymId, memberId: member._id, amount, method, note, recordedBy, simulated, paidOn: dayKey(),
  });
  member.feeDue = Math.max(0, member.feeDue - amount);
  await member.save();
  return payment;
}

export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
