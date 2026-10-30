import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  clearSessionCookie,
  clientIp,
  createSessionToken,
  failedLoginDelayMs,
  isSiteSessionValid,
  resetLoginFailures,
  setSessionCookie,
  siteAdminPassword,
} from '../_lib/siteSession.js';

type LoginBody = { password?: string };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const configured = siteAdminPassword();
  const secret = process.env.SESSION_SECRET?.trim();
  if (!configured || !secret) {
    return res.status(503).json({
      success: false,
      error: 'Site login is not configured (SITE_ADMIN_PASSWORD / SESSION_SECRET)',
    });
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as LoginBody;
  const password = body.password?.trim() ?? '';
  const ip = clientIp(req);

  if (!password || password !== configured) {
    const delay = failedLoginDelayMs(ip);
    await sleep(delay);
    return res.status(401).json({ success: false, error: 'Invalid password' });
  }

  resetLoginFailures(ip);
  const token = createSessionToken(secret);
  setSessionCookie(res, token);
  return res.status(200).json({ success: true });
}
