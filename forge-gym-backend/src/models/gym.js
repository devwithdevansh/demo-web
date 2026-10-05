import { Schema, model, gymRef, str } from './base.js';

export const PACKAGES = ['essential', 'growth', 'performance'];
export const ROLES = ['owner', 'staff', 'trainer', 'member'];
export const ADDON_KEYS = ['whatsapp', 'upiLinks', 'autopay', 'leadFollowup', 'trainerPlus'];

const gymSchema = new Schema(
  {
    name: str(80, { required: true }),
    // Demo sandboxes are disposable copies of the sample gym; live gyms are never demo.
    isDemo: { type: Boolean, default: false, index: true },
    demoKeyHash: { type: String, index: { unique: true, sparse: true } },
    package: { type: String, enum: PACKAGES, default: 'growth' },
    addons: Object.fromEntries(ADDON_KEYS.map((k) => [k, { type: Boolean, default: false }])),
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const userSchema = new Schema(
  {
    gymId: gymRef,
    name: str(80, { required: true }),
    email: str(160, { lowercase: true, index: { unique: true, sparse: true } }),
    passwordHash: String,
    role: { type: String, enum: ROLES, required: true },
    title: str(80),
    phone: str(20),
    active: { type: Boolean, default: true },
    // Demo accounts have no password and can only be entered through the demo session endpoint.
    isDemo: { type: Boolean, default: false },
    demoPrimary: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Gym = model('Gym', gymSchema);
export const User = model('User', userSchema);
