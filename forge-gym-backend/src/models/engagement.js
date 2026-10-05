import { Schema, model, gymRef, str, ObjectId } from './base.js';

export const LEAD_STATUSES = ['new', 'contacted', 'trial', 'joined', 'lost'];
export const LEAD_SOURCES = ['website', 'walk-in', 'referral', 'instagram', 'phone'];
export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const LOG_TYPES = ['checkin', 'measurement', 'pt_session'];

const leadSchema = new Schema(
  {
    gymId: gymRef,
    name: str(80, { required: true }),
    phone: str(20, { required: true }),
    interest: str(80),
    source: { type: String, enum: LEAD_SOURCES, default: 'walk-in' },
    status: { type: String, enum: LEAD_STATUSES, default: 'new' },
    followUpOn: String,
    notes: str(500),
  },
  { timestamps: true },
);

const classSlotSchema = new Schema(
  {
    gymId: gymRef,
    day: { type: String, enum: WEEKDAYS, required: true },
    time: { type: String, required: true },
    name: str(60, { required: true }),
    durationMin: { type: Number, default: 45, min: 10, max: 180 },
    trainerId: { type: ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

const announcementSchema = new Schema(
  { gymId: gymRef, title: str(100, { required: true }), body: str(600), postedBy: str(80) },
  { timestamps: true },
);

// Trainer-recorded history for one member: check-ins, measurements and PT sessions.
const coachLogSchema = new Schema(
  {
    gymId: gymRef,
    memberId: { type: ObjectId, ref: 'Member', required: true, index: true },
    trainerName: str(80),
    day: { type: String, required: true },
    type: { type: String, enum: LOG_TYPES, required: true },
    weightKg: Number,
    waistCm: Number,
    note: str(400),
  },
  { timestamps: true },
);

// Outbound add-on actions (messages, payment links). Nothing here leaves the
// server unless a provider is configured, and each entry records that honestly.
const actionLogSchema = new Schema(
  {
    gymId: gymRef,
    kind: { type: String, enum: ['whatsapp', 'upi_link', 'autopay'], required: true },
    memberId: { type: ObjectId, ref: 'Member', default: null },
    title: str(120),
    detail: str(700),
    // simulated: nothing left the server. pending/paid/failed: payment links.
    // accepted/sent/delivered/read/failed: a real WhatsApp message, updated by webhook.
    status: { type: String, enum: ['simulated', 'pending', 'paid', 'failed', 'accepted', 'sent', 'delivered', 'read'], default: 'simulated' },
    simulated: { type: Boolean, default: true },
    reason: str(300),
    amount: Number,
    token: { type: String, index: { unique: true, sparse: true } },
    // Payment links: which gateway handles it, and the gateway's own ids.
    gateway: str(30),
    orderId: str(60),
    paymentId: str(60),
    // WhatsApp: the message id the provider returned.
    providerId: { type: String, index: { sparse: true } },
  },
  { timestamps: true },
);

export const Lead = model('Lead', leadSchema);
export const ClassSlot = model('ClassSlot', classSlotSchema);
export const Announcement = model('Announcement', announcementSchema);
export const CoachLog = model('CoachLog', coachLogSchema);
export const ActionLog = model('ActionLog', actionLogSchema);
