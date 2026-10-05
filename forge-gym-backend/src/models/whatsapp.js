import { Schema, model, str, ObjectId } from './base.js';

/**
 * A WhatsApp number connected through Meta's Embedded Signup.
 *  - scope "demo": the one number the public demo sends from.
 *  - scope "gym":  a live gym's own number (the connect screen for gyms comes with gym sign-in).
 * The access token is stored encrypted (see lib/secretbox.js) and is never returned by the API.
 */
const whatsappLinkSchema = new Schema(
  {
    scope: { type: String, enum: ['demo', 'gym'], required: true },
    gymId: { type: ObjectId, ref: 'Gym', default: null },
    wabaId: str(40, { required: true, index: true }),
    phoneNumberId: str(40, { required: true }),
    displayPhone: str(30),
    verifiedName: str(120),
    tokenSealed: { type: String, required: true },
    // True when the number is also still in use on the WhatsApp Business app ("coexistence").
    onBusinessApp: { type: Boolean, default: false },
    status: { type: String, enum: ['connected', 'disconnected'], default: 'connected' },
    statusReason: str(200),
    // Meta requires the contact and history sync to be requested within 24 hours of connecting.
    sync: { contacts: str(20), history: str(20), requestedAt: Date },
  },
  { timestamps: true },
);
whatsappLinkSchema.index({ scope: 1, gymId: 1 }, { unique: true });

export const WhatsAppLink = model('WhatsAppLink', whatsappLinkSchema);
