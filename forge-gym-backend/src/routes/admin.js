import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { config } from '../config.js';
import { WhatsAppLink } from '../models/whatsapp.js';
import { Gym, User, Member, TENANT_MODELS } from '../models/index.js';
import { body, HttpError } from '../middleware/http.js';
import { seal, unseal } from '../lib/secretbox.js';
import {
  demoSender, exchangeSignupCode, grantedAccounts, listPhoneNumbers, requestAppSync, safeEqual, sendWhatsAppText, signupReady, subscribeApp,
  unsubscribeApp, whatsappTracking,
} from '../lib/providers.js';

/**
 * Mounted at /api/admin. For the person who runs this FORGE installation, not
 * for gyms or demo visitors. Access needs the ADMIN_KEY setting; without one
 * (or with a short one) these routes do not exist.
 */
const router = Router();
router.use(rateLimit({ windowMs: 10 * 60 * 1000, limit: 40, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many attempts. Please wait a few minutes.', code: 'rate_limited' } }));
router.use((req, res, next) => {
  if (config.adminKey.length < 16) return res.status(404).json({ error: 'Not found.', code: 'not_found' });
  if (!safeEqual(req.get('x-admin-key') ?? '', config.adminKey)) return res.status(401).json({ error: 'That admin key is not correct.', code: 'bad_admin_key' });
  next();
});

const linkView = (link) =>
  link && {
    phone: link.displayPhone || null,
    name: link.verifiedName || null,
    onBusinessApp: link.onBusinessApp,
    status: link.status,
    statusReason: link.statusReason || null,
    sync: link.sync ?? null,
    connectedAt: link.createdAt,
  };

async function overview() {
  const link = await WhatsAppLink.findOne({ scope: 'demo' });
  const sender = await demoSender();
  return {
    // Public identifiers the signup window needs. The app secret is never sent to the browser.
    signup: signupReady() ? { appId: config.whatsapp.appId, configId: config.whatsapp.configId, graphVersion: config.whatsapp.apiVersion } : null,
    connection: linkView(link),
    sendingFrom: sender ? { label: sender.label, source: sender.source } : null,
    demoPhones: config.whatsapp.demoRecipients.map((n) => `ending ${n.slice(-4)}`),
    deliveryUpdates: whatsappTracking(),
  };
}

router.get('/whatsapp', async (_req, res) => res.json(await overview()));

/** Starts the two syncs Meta requires for a number that stays on the WhatsApp Business app. */
async function startSync(link, token) {
  const attempt = async (type) => {
    try {
      await requestAppSync(link.phoneNumberId, token, type);
      return 'requested';
    } catch {
      return 'failed';
    }
  };
  link.sync = { contacts: await attempt('smb_app_state_sync'), history: await attempt('history'), requestedAt: new Date() };
  await link.save();
}

/**
 * Finishes Meta's Embedded Signup. The browser sends the short-lived code (and
 * the ids the signup window reported); everything that needs the app secret happens here.
 */
router.post(
  '/whatsapp/connect',
  body(
    z.object({
      code: z.string().min(10).max(2000),
      // The return address the sign-up window was opened with. Meta needs the same one for the exchange.
      redirectUri: z.string().max(300).optional(),
      wabaId: z.string().regex(/^\d{5,30}$/).optional(),
      phoneNumberId: z.string().regex(/^\d{5,30}$/).optional(),
      // The signup window's own name for how it ended, e.g. FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING.
      event: z.string().max(80).optional(),
    }),
  ),
  async (req, res) => {
    if (!signupReady()) throw new HttpError(409, 'WhatsApp sign-up is not set up on the server yet. Add WHATSAPP_APP_ID, WHATSAPP_APP_SECRET and WHATSAPP_CONFIG_ID.', 'not_configured');

    // Only this site's own address is accepted as the return address, so the code can never be
    // exchanged on behalf of a page somewhere else.
    const { redirectUri } = req.data;
    const sites = config.corsOrigins.length ? config.corsOrigins : [req.get('origin')].filter(Boolean);
    if (redirectUri && !sites.some((site) => redirectUri === `${site}/`)) {
      throw new HttpError(400, 'The sign-up was started from an address this server does not recognise.', 'bad_redirect');
    }

    // The code expires 30 seconds after the signup window closes, so it is exchanged before anything else.
    const token = await exchangeSignupCode(req.data.code, redirectUri);
    const wabaId = req.data.wabaId ?? (await grantedAccounts(token))[0];
    if (!wabaId) throw new HttpError(409, 'The sign-up finished without a WhatsApp account. Please run it again and complete every step.', 'no_account');

    const numbers = await listPhoneNumbers(wabaId, token);
    const number = numbers.find((n) => n.id === req.data.phoneNumberId) ?? numbers.find((n) => n.is_on_biz_app) ?? numbers[0];
    if (!number) throw new HttpError(409, 'That WhatsApp account has no phone number yet. Add a number during sign-up and try again.', 'no_number');

    // Meta reports whether the number is still on the WhatsApp Business app. When it does not say
    // either way, the number is still connected; a number that turns out to need separate
    // registration will say so when the first message is sent.
    const onBusinessApp = number.is_on_biz_app === true || req.data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING';

    await subscribeApp(wabaId, token);
    const link = await WhatsAppLink.findOneAndUpdate(
      { scope: 'demo', gymId: null },
      {
        wabaId, phoneNumberId: number.id, displayPhone: number.display_phone_number, verifiedName: number.verified_name,
        tokenSealed: seal(token), onBusinessApp, status: 'connected', statusReason: '',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    if (onBusinessApp) await startSync(link, token);
    res.status(201).json(await overview());
  },
);

/** Retries the contact and history sync if the first request did not go through. */
router.post('/whatsapp/sync', async (_req, res) => {
  const link = await WhatsAppLink.findOne({ scope: 'demo', status: 'connected' });
  const token = link && unseal(link.tokenSealed);
  if (!token) throw new HttpError(409, 'No WhatsApp number is connected.', 'not_connected');
  await startSync(link, token);
  res.json(await overview());
});

/** Sends one plain message to the first demo phone, to prove the connection end to end. */
router.post('/whatsapp/test', async (_req, res) => {
  const sender = await demoSender();
  if (!sender) throw new HttpError(409, 'Nothing to send from yet. Connect a number, and set WHATSAPP_DEMO_RECIPIENTS.', 'not_connected');
  const to = config.whatsapp.demoRecipients[0];
  await sendWhatsAppText(sender, to, 'FORGE test message. If you can read this, WhatsApp sending is working.');
  res.json({ ok: true, to: `ending ${to.slice(-4)}`, from: sender.label });
});

/**
 * Stops FORGE using the number and forgets its access. The owner should also
 * disconnect inside the WhatsApp Business app: Settings > Account > Business Platform.
 */
router.delete('/whatsapp', async (_req, res) => {
  const link = await WhatsAppLink.findOne({ scope: 'demo' });
  if (link) {
    const token = unseal(link.tokenSealed);
    if (token) await unsubscribeApp(link.wabaId, token).catch(() => {});
    await link.deleteOne();
  }
  res.json(await overview());
});

// ---- Gym Management Endpoints ---------------------------------------------

// List all non-demo gyms with stats
router.get('/gyms', async (_req, res) => {
  const gyms = await Gym.find({ isDemo: false }).sort({ createdAt: -1 });
  const result = await Promise.all(
    gyms.map(async (gym) => {
      const owner = await User.findOne({ gymId: gym._id, role: 'owner' }).lean();
      const memberCount = await Member.countDocuments({ gymId: gym._id });
      return {
        id: String(gym._id),
        name: gym.name,
        package: gym.package,
        addons: gym.addons,
        createdAt: gym.createdAt,
        lastUsedAt: gym.lastUsedAt,
        memberCount,
        owner: owner
          ? {
              id: String(owner._id),
              name: owner.name,
              email: owner.email || '',
              phone: owner.phone || '',
              active: owner.active,
              hasPassword: !!owner.passwordHash,
            }
          : null,
      };
    })
  );
  res.json({ gyms: result });
});

// Create a new live gym and generate an activation invite token
router.post(
  '/gyms',
  body(
    z.object({
      name: z.string().min(2).max(80),
      ownerName: z.string().min(2).max(80),
      email: z.string().email().max(160).optional().or(z.literal('')),
      phone: z.string().min(8).max(20),
      package: z.enum(['essential', 'growth', 'performance']).default('growth'),
      addons: z.record(z.boolean()).optional(),
    })
  ),
  async (req, res) => {
    const { name, ownerName, email, phone, package: pkg, addons } = req.data;
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase(), isDemo: false });
      if (existingEmail) throw new HttpError(409, 'An account with that email already exists.', 'duplicate_email');
    }
    const existingPhone = await User.findOne({ phone, isDemo: false });
    if (existingPhone) throw new HttpError(409, 'An account with that phone number already exists.', 'duplicate_phone');

    const gym = await Gym.create({
      name,
      package: pkg,
      isDemo: false,
      addons: addons || {},
    });

    const user = await User.create({
      gymId: gym._id,
      name: ownerName,
      email: email ? email.toLowerCase() : undefined,
      phone,
      role: 'owner',
      title: 'Owner',
      isDemo: false,
      active: true,
    });

    const invitePayload = JSON.stringify({ gymId: String(gym._id), userId: String(user._id), exp: Date.now() + 7 * 86400000 });
    const inviteToken = seal(invitePayload);

    res.status(201).json({
      gym: { id: String(gym._id), name: gym.name, package: gym.package, addons: gym.addons },
      owner: { id: String(user._id), name: user.name, phone: user.phone, email: user.email },
      inviteToken,
    });
  }
);

// Regenerate invite link for a gym
router.post('/gyms/:id/invite', async (req, res) => {
  const gym = await Gym.findOne({ _id: req.params.id, isDemo: false });
  if (!gym) throw new HttpError(404, 'Gym not found.', 'not_found');
  const user = await User.findOne({ gymId: gym._id, role: 'owner' });
  if (!user) throw new HttpError(404, 'Owner account not found for this gym.', 'not_found');

  const invitePayload = JSON.stringify({ gymId: String(gym._id), userId: String(user._id), exp: Date.now() + 7 * 86400000 });
  const inviteToken = seal(invitePayload);
  res.json({ inviteToken, owner: { name: user.name, phone: user.phone, email: user.email } });
});

// Update gym (package, addons, name)
router.patch(
  '/gyms/:id',
  body(
    z.object({
      name: z.string().min(2).max(80).optional(),
      package: z.enum(['essential', 'growth', 'performance']).optional(),
      addons: z.record(z.boolean()).optional(),
    })
  ),
  async (req, res) => {
    const gym = await Gym.findOne({ _id: req.params.id, isDemo: false });
    if (!gym) throw new HttpError(404, 'Gym not found.', 'not_found');

    if (req.data.name) gym.name = req.data.name;
    if (req.data.package) gym.package = req.data.package;
    if (req.data.addons) gym.addons = { ...gym.addons, ...req.data.addons };
    await gym.save();

    res.json({ id: String(gym._id), name: gym.name, package: gym.package, addons: gym.addons });
  }
);

// Delete gym and all its records
router.delete('/gyms/:id', async (req, res) => {
  const gym = await Gym.findOne({ _id: req.params.id, isDemo: false });
  if (!gym) throw new HttpError(404, 'Gym not found.', 'not_found');

  await Promise.all(TENANT_MODELS.map((Model) => Model.deleteMany({ gymId: gym._id })));
  await gym.deleteOne();
  res.json({ ok: true, message: `Gym "${gym.name}" and all records removed.` });
});

export default router;
