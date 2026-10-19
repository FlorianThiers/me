import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  authConfigured,
  readAgendaCookie,
  verifyAgendaSession,
} from './_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  if (!authConfigured()) {
    return res.status(503).json({
      authenticated: false,
      configured: false,
    });
  }

  const authenticated = verifyAgendaSession(readAgendaCookie(req));
  return res.status(authenticated ? 200 : 401).json({
    authenticated,
    configured: true,
  });
}
