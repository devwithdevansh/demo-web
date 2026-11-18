import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Gym, User, Member, Lead, ROLES } from '../models/index.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { body, HttpError, zName, zPhone, zText } from '../middleware/http.js';
import { createSandbox, findSandbox, resetSandbox } from '../seed/demoGym.js';
import { dayKey } from '../lib/dates.js';
import { unseal } from '../lib/secretbox.js';

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

/** Activate onboarding invite link for a gym owner */
router.post(
  '/auth/activate',
  limiter(20),
  body(z.object({ token: z.string().min(10), password: z.string().min(6).max(200), name: z.string().min(2).max(80).optional() })),
  async (req, res) => {
    const raw = unseal(req.data.token);
    if (!raw) throw new HttpError(400, 'This activation link is invalid or has expired.', 'invalid_token');
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new HttpError(400, 'This activation link is corrupt.', 'invalid_token');
    }
    if (payload.exp && Date.now() > payload.exp) {
      throw new HttpError(410, 'This activation link has expired. Please ask for a new invite.', 'token_expired');
    }
    const user = await User.findOne({ _id: payload.userId, gymId: payload.gymId, isDemo: false });
    if (!user) throw new HttpError(404, 'Account not found.', 'not_found');
    const gym = await Gym.findOne({ _id: payload.gymId, isDemo: false });
    if (!gym) throw new HttpError(404, 'Gym not found.', 'not_found');

    user.passwordHash = await bcrypt.hash(req.data.password, 12);
    if (req.data.name) user.name = req.data.name;
    user.active = true;
    await user.save();

    res.json(sessionPayload(user, gym, gym.package));
  }
);

/** Sign-in for live gym accounts via email or phone. Demo accounts have no password and are never accepted here. */
router.post(
  '/auth/login',
  limiter(20),
  body(
    z.object({
      identifier: z.string().min(1).max(160).optional(),
      email: z.string().optional(),
      password: z.string().min(1).max(200),
    })
  ),
  async (req, res) => {
    const id = (req.data.identifier || req.data.email || '').trim().toLowerCase();
    if (!id) throw new HttpError(400, 'Please enter your phone number or email.', 'missing_identifier');

    const cleanPhone = id.replace(/\D/g, '');
    let user = await User.findOne({
      $or: [
        { email: id },
        { phone: id },
        ...(cleanPhone.length >= 10 ? [{ phone: { $regex: cleanPhone + '$' } }] : []),
      ],
      isDemo: false,
      active: true,
    });

    if (!user) {
      // Check if identifier is a memberCode (e.g. IP-1001)
      const member = await Member.findOne({
        memberCode: new RegExp(`^${id}$`, 'i'),
      });
      if (member?.userId) {
        user = await User.findOne({ _id: member.userId, isDemo: false, active: true });
      }
    }

    const matches = await bcrypt.compare(req.data.password, user?.passwordHash || DUMMY_HASH);
    const gym = user && matches ? await Gym.findOne({ _id: user.gymId, isDemo: false }) : null;
    if (!gym) throw new HttpError(401, 'Member ID/Phone or password is incorrect.', 'bad_credentials');
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
