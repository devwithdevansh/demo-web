import { Schema, model, gymRef, str, ObjectId } from './base.js';

export const CATEGORIES = ['General fitness', 'Weight loss', 'Strength', 'Beginner', 'Senior', 'Student', 'Personal training'];
export const PAY_METHODS = ['cash', 'upi', 'card', 'bank'];
export const AUTOPAY_STATES = ['none', 'requested', 'active', 'paused', 'cancelled'];

const planSchema = new Schema(
  {
    gymId: gymRef,
    name: str(60, { required: true }),
    price: { type: Number, required: true, min: 0 },
    durationMonths: { type: Number, required: true, min: 1, max: 36 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const exerciseSchema = new Schema(
  { name: str(80, { required: true }), sets: str(20), reps: str(30), note: str(160), videoUrl: str(300) },
  { _id: false },
);
const workoutDaySchema = new Schema({ day: str(20), focus: str(60), exercises: [exerciseSchema] }, { _id: false });
const mealSchema = new Schema({ label: str(40), items: str(300) }, { _id: false });

const memberSchema = new Schema(
  {
    gymId: gymRef,
    memberCode: str(12, { required: true }),
    name: str(80, { required: true }),
    phone: str(20, { required: true }),
    email: str(160),
    category: { type: String, enum: CATEGORIES, default: 'General fitness' },
    planId: { type: ObjectId, ref: 'Plan', required: true },
    startDate: { type: String, required: true },
    expiryDate: { type: String, required: true },
    feeDue: { type: Number, default: 0, min: 0 },
    trainerId: { type: ObjectId, ref: 'User', default: null },
    userId: { type: ObjectId, ref: 'User', default: null },
    notes: str(500),
    pt: { total: { type: Number, default: 0, min: 0 }, used: { type: Number, default: 0, min: 0 } },
    autopay: {
      status: { type: String, enum: AUTOPAY_STATES, default: 'none' },
      amount: Number,
      updatedAt: Date,
    },
    workout: { title: str(80), updatedAt: Date, updatedBy: str(80), days: [workoutDaySchema] },
    diet: { title: str(80), note: str(600), updatedAt: Date, updatedBy: str(80), meals: [mealSchema] },
  },
  { timestamps: true },
);
memberSchema.index({ gymId: 1, memberCode: 1 }, { unique: true });

const attendanceSchema = new Schema(
  {
    gymId: gymRef,
    memberId: { type: ObjectId, ref: 'Member', required: true },
    day: { type: String, required: true },
    checkInAt: { type: Date, default: Date.now },
    method: { type: String, enum: ['manual', 'qr'], default: 'manual' },
  },
  { timestamps: true },
);
// One check-in per member per day, enforced by the database.
attendanceSchema.index({ gymId: 1, memberId: 1, day: 1 }, { unique: true });
attendanceSchema.index({ gymId: 1, day: 1 });

const paymentSchema = new Schema(
  {
    gymId: gymRef,
    memberId: { type: ObjectId, ref: 'Member', required: true },
    amount: { type: Number, required: true, min: 1 },
    method: { type: String, enum: PAY_METHODS, required: true },
    paidOn: { type: String, required: true },
    note: str(200),
    recordedBy: str(80),
    // True when the payment came from the demo pay page rather than money actually moving.
    simulated: { type: Boolean, default: false },
  },
  { timestamps: true },
);
paymentSchema.index({ gymId: 1, paidOn: -1 });

export const Plan = model('Plan', planSchema);
export const Member = model('Member', memberSchema);
export const Attendance = model('Attendance', attendanceSchema);
export const Payment = model('Payment', paymentSchema);
