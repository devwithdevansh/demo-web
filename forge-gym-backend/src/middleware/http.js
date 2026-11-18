import mongoose from 'mongoose';
import { z } from 'zod';
import { DAY_RE } from '../lib/dates.js';

export class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const notFound = (what = 'Record') => new HttpError(404, `${what} not found.`, 'not_found');

/** Validates the JSON body against a zod schema; unknown keys are dropped, never stored. */
export const body = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    const fields = {};
    for (const issue of parsed.error.issues) fields[issue.path.join('.') || '_'] ??= issue.message;
    return res.status(400).json({ error: 'Please check the highlighted fields.', code: 'invalid', fields });
  }
  req.data = parsed.data;
  next();
};

/** Loads a record by id, but only if it belongs to the caller's gym. */
export async function findOwned(Model, req, id, what) {
  if (!mongoose.isValidObjectId(id)) throw notFound(what);
  const doc = await Model.findOne({ _id: id, gymId: req.gymId });
  if (!doc) throw notFound(what);
  return doc;
}

/** Keeps a public sandbox from growing without bound. Live gyms are not capped. */
export const demoCap = (Model, max) => async (req, _res, next) => {
  if (req.gym.isDemo && (await Model.countDocuments({ gymId: req.gymId })) >= max) {
    throw new HttpError(409, 'Demo limit reached. Use "Reset demo data" to start fresh.', 'demo_limit');
  }
  next();
};

// Shared field shapes
export const zText = (max) => z.string().trim().max(max);
export const zName = z.string().trim().min(2, 'Enter a name.').max(80);
export const zPhone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s-]{8,16}$/, 'Enter a valid phone number.');
export const zDay = z.string().regex(DAY_RE, 'Use a valid date.');
export const zId = z.string().refine((v) => mongoose.isValidObjectId(v), 'Choose a valid option.');
export const zEmail = z.union([z.literal(''), z.email('Enter a valid email.').max(160)]);

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, code: err.code });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'That request could not be read.', code: 'invalid' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'That request is too large.', code: 'invalid' });
  if (err?.code === 11000) return res.status(409).json({ error: 'That record already exists.', code: 'duplicate' });
  if (err?.name === 'ValidationError' || err?.name === 'CastError') {
    return res.status(400).json({ error: 'Some of that information could not be saved. Please check it and try again.', code: 'invalid' });
  }
  // Log the failure type for operators; never echo database details to the client.
  console.error('[api] request failed:', err?.name || 'Error', '-', err?.message);
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.', code: 'server_error' });
}
