import { describe, expect, it } from 'vitest';
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  signSessionPayload,
  verifySessionToken,
} from './siteSession.js';

const SECRET = 'test-session-secret-for-unit-tests';

describe('siteSession', () => {
  it('signs and verifies a session token', () => {
    const token = createSessionToken(SECRET, Date.now());
    expect(verifySessionToken(token, SECRET)).not.toBeNull();
  });

  it('rejects tampered tokens', () => {
    const token = createSessionToken(SECRET, Date.now());
    const tampered = `${token}x`;
    expect(verifySessionToken(tampered, SECRET)).toBeNull();
  });

  it('rejects expired sessions', () => {
    const expired = signSessionPayload({ v: 1, exp: Date.now() - 1000 }, SECRET);
    expect(verifySessionToken(expired, SECRET)).toBeNull();
  });

  it('uses a stable cookie name', () => {
    expect(SESSION_COOKIE_NAME).toBe('site_session');
  });
});

describe('requireSiteSession behavior', () => {
  it('returns 401 without a valid session cookie', async () => {
    const { default: meHandler } = await import('../auth/me.js');
    const res = {
      statusCode: 200,
      body: undefined as unknown,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.body = payload;
        return this;
      },
    };
    const prev = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = SECRET;
    meHandler({ method: 'GET', headers: {} } as import('@vercel/node').VercelRequest, res as import('@vercel/node').VercelResponse);
    expect(res.body).toMatchObject({ authenticated: false, configured: true });
    process.env.SESSION_SECRET = prev;
  });

  it('private home-stock API returns 401 without session', async () => {
    const { default: handler } = await import('../private/home-stock.js');
    const res = {
      statusCode: 200,
      body: undefined as unknown,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.body = payload;
        return this;
      },
      setHeader() {
        return this;
      },
    };
    const prev = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = SECRET;
    handler({ method: 'GET', headers: {} } as import('@vercel/node').VercelRequest, res as import('@vercel/node').VercelResponse);
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({ success: false, error: 'Unauthorized' });
    process.env.SESSION_SECRET = prev;
  });
});
