import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';
import { HttpError } from '../middleware/http.js';
import { WhatsAppLink } from '../models/whatsapp.js';
import { unseal } from './secretbox.js';

/**
 * Outside services used by the add-ons. Both are optional: with nothing set
 * up, the add-ons fall back to clearly labelled simulations.
 *
 * Demo rules, enforced here rather than in the routes:
 *  - Payments only ever run with Razorpay TEST keys, so no real money can move.
 *  - WhatsApp messages only ever go to the approved demo phones, never to a
 *    number typed into the demo.
 */

const TIMEOUT_MS = 12000;
export const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

// ---- Razorpay (payments) --------------------------------------------------

/** 'test' or 'live' depending on the configured key, or null when no keys are set. */
export function razorpayMode() {
  const { keyId, keySecret } = config.razorpay;
  if (!keyId || !keySecret) return null;
  return keyId.startsWith('rzp_test_') ? 'test' : 'live';
}

/** The gateway demo sandboxes may use. A live key is ignored on purpose. */
export const demoGateway = () => (razorpayMode() === 'test' ? 'razorpay_test' : null);

async function razorpay(path, { method = 'GET', body } = {}) {
  const { keyId, keySecret } = config.razorpay;
  let res;
  try {
    res = await fetch(`https://api.razorpay.com/v1${path}`, {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new HttpError(502, 'Could not reach the payment provider. Please try again.', 'provider_unreachable');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const reason = data?.error?.description;
    console.error(`[razorpay] ${method} ${path} failed with ${res.status}${reason ? `: ${reason}` : ''}`);
    if (res.status === 401) {
      throw new HttpError(502, 'The payment provider rejected the API keys. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 'provider_auth');
    }
    throw new HttpError(502, `The payment provider did not accept that request${reason ? `: ${reason}` : '.'}`, 'provider_error');
  }
  return data;
}

/** Creates a Razorpay order for an amount in whole rupees. */
export const createOrder = ({ amount, receipt, notes }) =>
  razorpay('/orders', { method: 'POST', body: { amount: amount * 100, currency: 'INR', receipt, notes } });

export const fetchPayment = (paymentId) => razorpay(`/payments/${encodeURIComponent(paymentId)}`);

/** Checks the signature Razorpay Checkout returns after a payment: HMAC-SHA256 of "order_id|payment_id". */
export function validCheckoutSignature({ orderId, paymentId, signature }) {
  const expected = createHmac('sha256', config.razorpay.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  return safeEqual(expected, signature);
}

// ---- WhatsApp Cloud API ---------------------------------------------------

const digits = (phone) => String(phone ?? '').replace(/\D/g, '');

/** One call to Meta's Graph API. Errors are reported without echoing tokens or secrets. */
async function graph(path, { method = 'GET', token, body, query, step = 'WhatsApp request' } = {}) {
  const url = new URL(`https://graph.facebook.com/${config.whatsapp.apiVersion}${path}`);
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v);
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new HttpError(502, 'Could not reach WhatsApp. Please try again.', 'provider_unreachable');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.error) {
    const err = data?.error;
    console.error(`[whatsapp] ${step} failed with ${res.status}${err ? `: (${err.code}) ${err.message}` : ''}`);
    if (err?.code === 190) {
      throw new HttpError(502, 'WhatsApp access has expired or been withdrawn. Connect the number again, or update WHATSAPP_TOKEN if you use a test token.', 'provider_auth');
    }
    throw new HttpError(502, `${step} was not accepted by WhatsApp${err?.message ? `: ${String(err.message).slice(0, 200)}` : '.'}`, 'provider_error');
  }
  return data;
}

/** True when a test sender is set in the environment (Meta's test number, for example). */
export function whatsappReady() {
  const { token, phoneNumberId, demoRecipients } = config.whatsapp;
  return !!(token && phoneNumberId && demoRecipients.length);
}

/** Delivery status updates arrive by webhook, which needs the app secret and a verify token. */
export const whatsappTracking = () => !!(config.whatsapp.appSecret && config.whatsapp.verifyToken);

/**
 * The number demo messages are sent from: a number connected on the admin
 * page if there is one, otherwise the test sender from the environment.
 */
export async function demoSender() {
  if (!config.whatsapp.demoRecipients.length) return null;
  const link = await WhatsAppLink.findOne({ scope: 'demo', status: 'connected' });
  const token = link ? unseal(link.tokenSealed) : null;
  if (token) return { token, phoneNumberId: link.phoneNumberId, label: link.displayPhone || 'the connected number', source: 'connected' };
  const { token: envToken, phoneNumberId } = config.whatsapp;
  return envToken && phoneNumberId ? { token: envToken, phoneNumberId, label: 'the test number', source: 'settings' } : null;
}

/**
 * The phone a demo message is actually sent to. If the member's own number is
 * one of the approved demo phones it is used; otherwise the first approved phone.
 */
export function demoRecipientFor(phone) {
  const list = config.whatsapp.demoRecipients;
  const wanted = digits(phone);
  return list.find((n) => n === wanted || (wanted.length >= 10 && n.endsWith(wanted.slice(-10)))) ?? list[0];
}

// A simple ceiling per server per day, so a public demo cannot be used to flood the demo phone.
const sentToday = { day: '', count: 0 };

/** Sends a free-text message. Returns the provider's message id; delivery is confirmed later by webhook. */
export async function sendWhatsAppText(sender, to, text) {
  const day = new Date().toISOString().slice(0, 10);
  if (sentToday.day !== day) Object.assign(sentToday, { day, count: 0 });
  if (sentToday.count >= config.whatsapp.dailyLimit) {
    throw new HttpError(429, 'The demo has reached its WhatsApp limit for today. Messages will work again tomorrow.', 'provider_limit');
  }
  const data = await graph(`/${sender.phoneNumberId}/messages`, {
    method: 'POST',
    token: sender.token,
    step: 'The message',
    body: { messaging_product: 'whatsapp', recipient_type: 'individual', to: `+${digits(to)}`, type: 'text', text: { preview_url: false, body: text } },
  });
  if (!data?.messages?.[0]?.id) throw new HttpError(502, 'WhatsApp did not confirm the message.', 'provider_error');
  sentToday.count += 1;
  return data.messages[0].id;
}

/** Meta signs each webhook with HMAC-SHA256 of the raw body, using the app secret. */
export function validWebhookSignature(rawBody, header) {
  if (!rawBody || typeof header !== 'string' || !header.startsWith('sha256=')) return false;
  const expected = createHmac('sha256', config.whatsapp.appSecret).update(rawBody).digest('hex');
  return safeEqual(expected, header.slice(7));
}

// ---- WhatsApp: connecting a business's own number (Embedded Signup) -------

/** True when the settings needed to run Meta's signup window are present. */
export const signupReady = () => !!(config.whatsapp.appId && config.whatsapp.appSecret && config.whatsapp.configId);

/** Swaps the short-lived code from the signup window for the business's access token. The code lasts 30 seconds. */
export async function exchangeSignupCode(code) {
  const { appId, appSecret } = config.whatsapp;
  const data = await graph('/oauth/access_token', { query: { client_id: appId, client_secret: appSecret, code }, step: 'Finishing the sign-up' });
  if (!data?.access_token) throw new HttpError(502, 'WhatsApp did not return access for this business.', 'provider_error');
  return data.access_token;
}

/** The WhatsApp accounts a token was granted, for when the signup window did not report one. */
export async function grantedAccounts(token) {
  const { appId, appSecret } = config.whatsapp;
  const data = await graph('/debug_token', { query: { input_token: token, access_token: `${appId}|${appSecret}` }, step: 'Checking the granted access' });
  const scopes = data?.data?.granular_scopes ?? [];
  return [...new Set(scopes.filter((s) => s.scope?.startsWith('whatsapp_business')).flatMap((s) => s.target_ids ?? []))];
}

export const listPhoneNumbers = async (wabaId, token) =>
  (await graph(`/${wabaId}/phone_numbers`, { token, query: { fields: 'id,display_phone_number,verified_name,is_on_biz_app,platform_type' }, step: 'Reading the phone numbers' }))?.data ?? [];

/** Makes this app receive the account's webhooks (delivery updates and the rest). */
export const subscribeApp = (wabaId, token) => graph(`/${wabaId}/subscribed_apps`, { method: 'POST', token, step: 'Subscribing to updates' });
export const unsubscribeApp = (wabaId, token) => graph(`/${wabaId}/subscribed_apps`, { method: 'DELETE', token, step: 'Unsubscribing' });

/**
 * For a number that is also on the WhatsApp Business app: asks Meta to start the
 * contact sync ("smb_app_state_sync") or the chat history sync ("history").
 * Meta requires both to be requested within 24 hours of connecting.
 */
export const requestAppSync = (phoneNumberId, token, syncType) =>
  graph(`/${phoneNumberId}/smb_app_data`, { method: 'POST', token, body: { messaging_product: 'whatsapp', sync_type: syncType }, step: 'Starting the sync' });
