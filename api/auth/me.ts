import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isSiteSessionValid } from '../_lib/siteSession.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const secretConfigured = !!process.env.SESSION_SECRET?.trim();
  if (!secretConfigured) {
    return res.status(503).json({ authenticated: false, configured: false });
  }

  return res.status(200).json({
    authenticated: isSiteSessionValid(req),
    configured: true,
  });
}
