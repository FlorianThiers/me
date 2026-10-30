import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'site_session';
const SESSION_VERSION = 1;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  v: number;
  exp: number;
};

function sessionSecret(): string | null {
  const raw = process.env.SESSION_SECRET?.trim();
  return raw ? raw : null;
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64url');
}

function fromB64url(value: string): Buffer {
  return Buffer.from(value, 'base64url');
}

export function signSessionPayload(payload: SessionPayload, secret: string): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string, secret: string): SessionPayload | null {
  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return null;

  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(fromB64url(body).toString('utf8')) as SessionPayload;
    if (payload.v !== SESSION_VERSION || typeof payload.exp !== 'number') return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(secret: string, now = Date.now()): string {
  const payload: SessionPayload = { v: SESSION_VERSION, exp: now + SESSION_TTL_MS };
  return signSessionPayload(payload, secret);
}

export function readSessionCookie(req: VercelRequest): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      return decodeURIComponent(trimmed.slice(SESSION_COOKIE_NAME.length + 1));
    }
  }
  return null;
}

export function isSiteSessionValid(req: VercelRequest): boolean {
  const secret = sessionSecret();
  if (!secret) return false;
  const token = readSessionCookie(req);
  if (!token) return false;
  return verifySessionToken(token, secret) != null;
}

export function cookieSecureFlag(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

export function setSessionCookie(res: VercelResponse, token: string): void {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (cookieSecureFlag()) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res: VercelResponse): void {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
  ];
  if (cookieSecureFlag()) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function requireSiteSession(req: VercelRequest, res: VercelResponse): boolean {
  if (!sessionSecret()) {
    res.status(503).json({
      success: false,
      error: 'SESSION_SECRET not configured on server',
    });
    return false;
  }
  if (isSiteSessionValid(req)) return true;
  res.status(401).json({ success: false, error: 'Unauthorized' });
  return false;
}

export function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return req.socket?.remoteAddress || 'unknown';
}

const loginFailures = new Map<string, { count: number }>();

/** Returns delay ms before responding to a failed login (rate limit / backoff). */
export function failedLoginDelayMs(ip: string): number {
  const entry = loginFailures.get(ip) ?? { count: 0 };
  entry.count += 1;
  loginFailures.set(ip, entry);
  return Math.min(400 * entry.count, 5000);
}

export function resetLoginFailures(ip: string): void {
  loginFailures.delete(ip);
}

export function siteAdminPassword(): string | null {
  const raw = process.env.SITE_ADMIN_PASSWORD?.trim();
  return raw ? raw : null;
}
