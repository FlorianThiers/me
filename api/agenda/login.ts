import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  appendSessionCookie,
  authConfigured,
  signAgendaSession,
  verifyAgendaPassword,
} from './_lib/auth.js';

type LoginBody = { password?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!authConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Agenda auth not configured (AGENDA_SESSION_SECRET, AGENDA_PASSWORD)',
    });
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as LoginBody;
  const password = body.password?.trim() ?? '';
  if (!password || !verifyAgendaPassword(password)) {
    return res.status(401).json({ success: false, error: 'Invalid password' });
  }

  const token = signAgendaSession();
  if (!token) {
    return res.status(503).json({ success: false, error: 'Could not create session' });
  }

  appendSessionCookie(res, token);
  return res.status(200).json({ success: true });
}
