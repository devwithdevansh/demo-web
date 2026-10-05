import mongoose from 'mongoose';

// Every API response goes through toJSON, so internal fields are stripped in one place.
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    versionKey: false,
    transform: (_doc, ret) => {
      if (ret._id) ret.id = String(ret._id);
      delete ret._id;
      delete ret.gymId;
      delete ret.passwordHash;
      delete ret.demoKeyHash;
      return ret;
    },
  });
});

export const { Schema, model } = mongoose;
export const ObjectId = Schema.Types.ObjectId;
/** Every tenant-owned record carries the gym it belongs to. */
export const gymRef = { type: ObjectId, ref: 'Gym', required: true, index: true };
export const str = (max, extra = {}) => ({ type: String, trim: true, maxlength: max, ...extra });
