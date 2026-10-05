import { existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Local development reads forge-gym/.env (git-ignored). Hosted environments
// set real environment variables instead, which always take precedence.
const envFile = path.join(rootDir, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const isProd = process.env.NODE_ENV === 'production';
const int = (name, fallback) => {
  const n = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
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
  sessionHours: int('SESSION_HOURS', 12),
  sandboxTtlHours: int('DEMO_SANDBOX_TTL_HOURS', 24),
  maxSandboxes: int('DEMO_MAX_SANDBOXES', 200),
};
