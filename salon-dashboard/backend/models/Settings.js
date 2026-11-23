const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  salonName: { type: String, default: 'GlowUp Salon' },
  currency: { type: String, default: 'USD' },
  contactEmail: { type: String, default: 'contact@glowupsalon.com' },
  contactPhone: { type: String, default: '(555) 123-4567' },
  address: { type: String, default: '123 Beauty Blvd, NY' },
  taxRate: { type: Number, default: 0 },
  openingTime: { type: String, default: '09:00' },
  closingTime: { type: String, default: '18:00' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
