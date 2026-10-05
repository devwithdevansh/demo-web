import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Gym, User, Lead, ROLES } from '../models/index.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { body, HttpError, zName, zPhone, zText } from '../middleware/http.js';
import { createSandbox, findSandbox, resetSandbox } from '../seed/demoGym.js';
import { dayKey } from '../lib/dates.js';

const router = Router();

const limiter = (limit) =>
  rateLimit({
    windowMs: 10 * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please wait a few minutes and try again.', code: 'rate_limited' },
  });

// Which demo roles each package offers. The trainer and member portals are Performance features.
const DEMO_ROLES = { growth: ['owner', 'staff'], performance: ['owner', 'staff', 'trainer', 'member'] };
const resetting = new Set();
// Compared against when no account matches, so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('no-such-account', 10);

function sessionPayload(user, gym, pkg, sandboxKey) {
  return {
    token: signToken(user, gym.isDemo ? { pkg } : {}),
    sandboxKey,
    user: { id: String(user._id), name: user.name, role: user.role, title: user.title ?? '' },
    gym: { name: gym.name, package: pkg, addons: gym.addons, isDemo: gym.isDemo },
  };
}

const primaryUser = (gym, role) => User.findOne({ gymId: gym._id, role, demoPrimary: true, active: true });

/**
 * Guided demo entry. Each visitor gets a private sandbox copy of the sample
 * gym, so nothing they type is visible to anyone else and no live gym is reachable.
 */
router.post(
  '/demo/session',
  limiter(60),
  body(z.object({ tier: z.enum(['growth', 'performance']), role: z.enum(ROLES), sandboxKey: z.string().max(80).optional() })),
  async (req, res) => {
    const { tier, role } = req.data;
    if (!DEMO_ROLES[tier].includes(role)) throw new HttpError(400, 'That role is not part of this demo.', 'invalid');

    let key = req.data.sandboxKey;
    let gym = await findSandbox(key);
    if (gym) await Gym.updateOne({ _id: gym._id }, { lastUsedAt: new Date() });
    else ({ gym, key } = await createSandbox());

    const user = await primaryUser(gym, role);
    if (!user) throw new HttpError(409, 'The demo is being reset. Please try again in a moment.', 'demo_resetting');
    res.json(sessionPayload(user, gym, tier, key));
  },
);

router.post('/demo/reset', limiter(20), requireAuth, async (req, res) => {
  if (!req.gym.isDemo) throw new HttpError(403, 'Only demo data can be reset.', 'forbidden_role');
  const id = String(req.gymId);
  if (resetting.has(id)) throw new HttpError(409, 'A reset is already running.', 'demo_resetting');
  resetting.add(id);
  try {
    await resetSandbox(req.gym);
  } finally {
    resetting.delete(id);
  }
  // Resetting recreates the sample accounts, so hand back a fresh session for the same role.
  const user = await primaryUser(req.gym, req.user.role);
  res.json(sessionPayload(user, req.gym, req.pkg));
});

/** Sign-in for live gym accounts. Demo accounts have no password and are never accepted here. */
router.post(
  '/auth/login',
  limiter(20),
  body(z.object({ email: z.email().max(160), password: z.string().min(1).max(200) })),
  async (req, res) => {
    const user = await User.findOne({ email: req.data.email.toLowerCase(), isDemo: false, active: true });
    const matches = await bcrypt.compare(req.data.password, user?.passwordHash || DUMMY_HASH);
    const gym = user && matches ? await Gym.findOne({ _id: user.gymId, isDemo: false }) : null;
    if (!gym) throw new HttpError(401, 'Email or password is incorrect.', 'bad_credentials');
    res.json(sessionPayload(user, gym, gym.package));
  },
);

router.get('/me', requireAuth, (req, res) => {
  const { user, gym } = req;
  res.json({
    user: { id: String(user._id), name: user.name, role: user.role, title: user.title ?? '' },
    gym: { name: gym.name, package: req.pkg, addons: gym.addons, isDemo: gym.isDemo },
  });
});

/** Enquiry form on the sample gym website. Lands in the visitor's own sandbox as a website lead. */
router.post(
  '/public/enquiry',
  limiter(20),
  body(
    z.object({
      sandboxKey: z.string().max(80).optional(),
      name: zName,
      phone: zPhone,
      interest: zText(80).optional(),
      message: zText(400).optional(),
    }),
  ),
  async (req, res) => {
    let key = req.data.sandboxKey;
    let gym = await findSandbox(key);
    if (!gym) ({ gym, key } = await createSandbox());
    if ((await Lead.countDocuments({ gymId: gym._id })) >= 150) {
      throw new HttpError(409, 'This demo has reached its enquiry limit. Reset the demo data to continue.', 'demo_limit');
    }
    const { name, phone, interest, message } = req.data;
    await Lead.create({ gymId: gym._id, name, phone, interest, notes: message, source: 'website', status: 'new', followUpOn: dayKey() });
    res.status(201).json({ ok: true, sandboxKey: key });
  },
);

export default router;
