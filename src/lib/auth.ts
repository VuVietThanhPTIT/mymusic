import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const DEFAULT_PASSWORD = 'admin'; // fallback default for quick local testing

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

function getSecretKey(): string {
  const pwd = getAdminPassword();
  return crypto.createHash('sha256').update(pwd + '_music_hub_salt').digest('hex');
}

/**
 * Creates a signed token valid for 7 days
 */
export function createSessionToken(): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `admin_${expiresAt}`;
  const hmac = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Verifies if the token is valid and not expired
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, hmac] = parts;
  const expectedHmac = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('hex');

  // Constant-time compare
  if (hmac.length !== expectedHmac.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
    return false;
  }

  const [, expiresStr] = payload.split('_');
  const expiresAt = parseInt(expiresStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  return true;
}

/**
 * Checks admin status from Next.js server cookies
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(sessionCookie);
}

export { COOKIE_NAME };
