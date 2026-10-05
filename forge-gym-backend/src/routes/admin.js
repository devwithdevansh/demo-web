import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { config } from '../config.js';
import { WhatsAppLink } from '../models/whatsapp.js';
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
      wabaId: z.string().regex(/^\d{5,30}$/).optional(),
      phoneNumberId: z.string().regex(/^\d{5,30}$/).optional(),
      // The signup window's own name for how it ended, e.g. FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING.
      event: z.string().max(80).optional(),
    }),
  ),
  async (req, res) => {
    if (!signupReady()) throw new HttpError(409, 'WhatsApp sign-up is not set up on the server yet. Add WHATSAPP_APP_ID, WHATSAPP_APP_SECRET and WHATSAPP_CONFIG_ID.', 'not_configured');

    // The code expires 30 seconds after the signup window closes, so it is exchanged before anything else.
    const token = await exchangeSignupCode(req.data.code);
    const wabaId = req.data.wabaId ?? (await grantedAccounts(token))[0];
    if (!wabaId) throw new HttpError(409, 'The sign-up finished without a WhatsApp account. Please run it again and complete every step.', 'no_account');

    const numbers = await listPhoneNumbers(wabaId, token);
    const number = numbers.find((n) => n.id === req.data.phoneNumberId) ?? numbers.find((n) => n.is_on_biz_app) ?? numbers[0];
    if (!number) throw new HttpError(409, 'That WhatsApp account has no phone number yet. Add a number during sign-up and try again.', 'no_number');

    const onBusinessApp = number.is_on_biz_app === true || req.data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING';
    if (!onBusinessApp) {
      // A number that is not on the Business app needs a separate registration step that is not built yet.
      throw new HttpError(409, 'This number is not on the WhatsApp Business app. Connecting API-only numbers is not supported yet.', 'unsupported_number');
    }

    await subscribeApp(wabaId, token);
    const link = await WhatsAppLink.findOneAndUpdate(
      { scope: 'demo', gymId: null },
      {
        wabaId, phoneNumberId: number.id, displayPhone: number.display_phone_number, verifiedName: number.verified_name,
        tokenSealed: seal(token), onBusinessApp, status: 'connected', statusReason: '',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    await startSync(link, token);
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

export default router;
