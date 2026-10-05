import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { Gym, User, PACKAGES } from '../models/index.js';

const rank = (pkg) => PACKAGES.indexOf(pkg);

/** `pkg` is only set for demo sessions, where the visitor picks which package to explore. */
export function signToken(user, { pkg } = {}) {
  const payload = { sub: String(user._id), gym: String(user.gymId), role: user.role };
  if (pkg) payload.pkg = pkg;
  return jwt.sign(payload, config.jwtSecret, { expiresIn: `${config.sessionHours}h` });
}

const deny = (res, status, error, code) => res.status(status).json({ error, code });

/**
 * Resolves the caller from the bearer token and pins the request to their gym.
 * Routes read `req.gymId` for every query, so the tenant never comes from user input.
 */
export async function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return deny(res, 401, 'Please start a session to continue.', 'no_session');

  let claims;
  try {
    claims = jwt.verify(header.slice(7), config.jwtSecret);
  } catch {
    return deny(res, 401, 'Your session has ended. Please start again.', 'session_expired');
  }

  const [gym, user] = await Promise.all([
    Gym.findById(claims.gym),
    User.findOne({ _id: claims.sub, gymId: claims.gym, active: true }),
  ]);
  if (!gym || !user) return deny(res, 401, 'Your session has ended. Please start again.', 'session_expired');

  req.gym = gym;
  req.gymId = gym._id;
  req.user = user;
  // A demo visitor can explore a lower package than the sandbox holds, never a higher one.
  req.pkg = gym.isDemo && rank(claims.pkg) >= 0 && rank(claims.pkg) <= rank(gym.package) ? claims.pkg : gym.package;

  if (gym.isDemo && Date.now() - gym.lastUsedAt.getTime() > 5 * 60 * 1000) {
    await Gym.updateOne({ _id: gym._id }, { lastUsedAt: new Date() });
  }
  next();
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : deny(res, 403, 'Your role does not have access to this.', 'forbidden_role');

export const requirePackage = (pkg) => (req, res, next) =>
  rank(req.pkg) >= rank(pkg) ? next() : deny(res, 403, 'This feature is not part of the current package.', 'package_required');

export const requireAddon = (key) => (req, res, next) =>
  req.gym.addons?.[key] ? next() : deny(res, 403, 'This add-on is switched off for this gym.', 'addon_off');
