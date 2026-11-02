import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './julia/_lib/auth';

const BASE_URL = 'https://www.moltbook.com/api/v1';

/**
 * Server-side Moltbook proxy. The Moltbook key lives only in process.env.MOLTBOOK_API_KEY.
 * Callers must send `Authorization: Bearer <JULIA_API_SECRET>` (owner-only).
 * Usage: /api/moltbook?path=/posts?sort=new
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const apiKey = process.env.MOLTBOOK_API_KEY?.trim();
  if (!apiKey) {
    return res.status(503).json({ success: false, error: 'MOLTBOOK_API_KEY not configured on server.' });
  }

  const path = typeof req.query.path === 'string' ? req.query.path : '';
  if (!path.startsWith('/') || path.includes('..') || path.startsWith('//')) {
    return res.status(400).json({ success: false, error: 'Invalid path.' });
  }

  const method = (req.method || 'GET').toUpperCase();
  if (!['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const upstream = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:
        method === 'GET' || method === 'DELETE' || req.body == null
          ? undefined
          : typeof req.body === 'string'
            ? req.body
            : JSON.stringify(req.body),
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch {
    return res.status(502).json({ success: false, error: 'Moltbook upstream error.' });
  }
}
