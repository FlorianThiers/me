import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const AGENDA_COOKIE = 'agenda_session';
const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

function sessionSecret(): string | null {
  const raw = process.env.AGENDA_SESSION_SECRET?.trim();
  return raw || null;
}

function agendaPassword(): string | null {
  const raw = process.env.AGENDA_PASSWORD?.trim();
  return raw || null;
}

function cookieSecure(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

export function signAgendaSession(): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const payload = Buffer.from(JSON.stringify({ exp }), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAgendaSession(token: string | undefined | null): boolean {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: number;
    };
    return typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function readAgendaCookie(req: VercelRequest): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === AGENDA_COOKIE) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

export function appendSessionCookie(res: VercelResponse, token: string): void {
  const flags = [
    `${AGENDA_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SEC}`,
  ];
  if (cookieSecure()) flags.push('Secure');
  res.setHeader('Set-Cookie', flags.join('; '));
}

export function clearSessionCookie(res: VercelResponse): void {
  const flags = [
    `${AGENDA_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (cookieSecure()) flags.push('Secure');
  res.setHeader('Set-Cookie', flags.join('; '));
}

export function verifyAgendaPassword(candidate: string): boolean {
  const expected = agendaPassword();
  if (!expected) return false;
  try {
    const a = Buffer.from(candidate);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function requireAgendaAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (!sessionSecret()) {
    res.status(503).json({
      success: false,
      error: 'AGENDA_SESSION_SECRET not configured on server',
    });
    return false;
  }
  if (!verifyAgendaSession(readAgendaCookie(req))) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return false;
  }
  return true;
}

export function authConfigured(): boolean {
  return Boolean(sessionSecret() && agendaPassword());
}
