import { existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Local development reads the .env file in this folder (git-ignored). Hosted environments
// set real environment variables instead, which always take precedence.
const envFile = path.join(rootDir, '.env');
// Skipped under "npm test", so tests can never pick up real keys and call a real provider.
if (existsSync(envFile) && !process.env.NODE_TEST_CONTEXT) process.loadEnvFile(envFile);

const isProd = process.env.NODE_ENV === 'production';
const int = (name, fallback) => {
  const n = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

if (isProd && !process.env.JWT_SECRET) {
  console.error('[api] JWT_SECRET must be set when NODE_ENV=production. Add it to the service environment and redeploy.');
  process.exit(1);
}

export const config = {
  isProd,
  port: int('PORT', 4000),
  mongoUri: process.env.MONGODB_URI || '',
  // Always connect to a named database. A cluster is often shared with other
  // projects, and a URI without a database would silently fall through to "test".
  mongoDb: process.env.MONGODB_DB || 'gym',
  // Without a configured secret (local dev only) sessions simply end when the API restarts.
  jwtSecret: process.env.JWT_SECRET || randomBytes(48).toString('hex'),
  // Site addresses allowed to call this API from a browser (comma-separated), for example
  // https://demo-web-forge-gym.onrender.com. Not needed locally: the dev site proxies /api.
  corsOrigins: (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean),
  // Razorpay keys for the payment-link add-on. Only TEST keys (rzp_test_...) are used by the demo.
  razorpay: { keyId: process.env.RAZORPAY_KEY_ID || '', keySecret: process.env.RAZORPAY_KEY_SECRET || '' },
  // WhatsApp Cloud API for the notifications add-on. Demo messages go only to WHATSAPP_DEMO_RECIPIENTS.
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v25.0',
    demoRecipients: (process.env.WHATSAPP_DEMO_RECIPIENTS || '').split(',').map((n) => n.replace(/\D/g, '')).filter((n) => n.length >= 10),
    dailyLimit: int('WHATSAPP_DAILY_LIMIT', 50),
    // For connecting a business's own number through Meta's sign-up window: the Meta app's id and
    // the id of its Embedded Signup configuration. Both are public identifiers.
    appId: process.env.WHATSAPP_APP_ID || '',
    configId: process.env.WHATSAPP_CONFIG_ID || '',
    // Both are needed to receive delivery updates (sent, delivered, read) by webhook.
    // The app secret also finishes the sign-up, so it never leaves the server.
    appSecret: process.env.WHATSAPP_APP_SECRET || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
  },
  // Unlocks /api/admin (connecting the WhatsApp number). At least 16 characters, or the routes stay off.
  adminKey: process.env.ADMIN_KEY || '',
  sessionHours: int('SESSION_HOURS', 12),
  sandboxTtlHours: int('DEMO_SANDBOX_TTL_HOURS', 24),
  maxSandboxes: int('DEMO_MAX_SANDBOXES', 200),
};
