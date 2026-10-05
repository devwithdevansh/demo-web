import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
import { config } from '../config.js';

/**
 * Encrypts provider tokens before they are stored, so a copy of the database
 * alone is not enough to send messages as a connected business.
 * The key is derived from JWT_SECRET: changing that secret makes stored tokens
 * unreadable, and the WhatsApp number then has to be connected again.
 */
const key = () => Buffer.from(hkdfSync('sha256', config.jwtSecret, 'forge', 'provider-tokens', 32));

export function seal(text) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), body].map((part) => part.toString('base64url')).join('.');
}

/** Returns the original text, or null if it cannot be decrypted (wrong key or damaged value). */
export function unseal(sealed) {
  try {
    const [iv, tag, body] = String(sealed).split('.').map((part) => Buffer.from(part, 'base64url'));
    const decipher = createDecipheriv('aes-256-gcm', key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
