import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireSiteSession } from '../../_lib/siteSession.js';

const UPSTREAM = 'https://api.stlouisfed.org/fred/series/observations';

const ALLOWED_SERIES = new Set(['CPIAUCSL']);
const ALLOWED_QUERY = new Set(['series_id', 'file_type', 'limit', 'sort_order']);

function pickQueryValue(req: VercelRequest, key: string): string | null {
  const raw = req.query[key];
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 32) return null;
  return raw;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!requireSiteSession(req, res)) return;

  const apiKey = process.env.FRED_API_KEY?.trim();
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      error: 'FRED_API_KEY not configured on server.',
    });
  }

  const seriesId = pickQueryValue(req, 'series_id');
  if (!seriesId || !ALLOWED_SERIES.has(seriesId)) {
    return res.status(400).json({ success: false, error: 'Invalid or missing series_id.' });
  }

  const params = new URLSearchParams();
  params.set('series_id', seriesId);
  params.set('api_key', apiKey);

  for (const key of ALLOWED_QUERY) {
    if (key === 'series_id') continue;
    const value = pickQueryValue(req, key);
    if (!value) continue;
    if (key === 'file_type' && value !== 'json') continue;
    if (key === 'sort_order' && value !== 'asc' && value !== 'desc') continue;
    if (key === 'limit') {
      const n = Number.parseInt(value, 10);
      if (!Number.isFinite(n) || n < 1 || n > 500) continue;
      params.set(key, String(n));
      continue;
    }
    params.set(key, value);
  }

  if (!params.has('file_type')) params.set('file_type', 'json');

  try {
    const upstream = await fetch(`${UPSTREAM}?${params.toString()}`);
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch {
    return res.status(502).json({ success: false, error: 'FRED upstream error.' });
  }
}
