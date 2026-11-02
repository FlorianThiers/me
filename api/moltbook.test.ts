import type { VercelRequest, VercelResponse } from '@vercel/node';
import { describe, expect, it, vi } from 'vitest';
import handler from './moltbook.js';

function mockRes(): VercelResponse & { statusCode: number; body: unknown } {
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
    setHeader: vi.fn(),
    send: vi.fn(),
  };
  return res as VercelResponse & { statusCode: number; body: unknown };
}

describe('api/moltbook', () => {
  it('returns 401 without a site session when SESSION_SECRET is set', async () => {
    vi.stubEnv('SESSION_SECRET', 'test-session-secret-for-unit-tests');

    const req = { method: 'GET', query: { path: '/agents/me' }, headers: {} } as VercelRequest;
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ success: false, error: 'Unauthorized' });
  });
});
