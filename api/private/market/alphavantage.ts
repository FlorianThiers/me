import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireSiteSession } from '../../_lib/siteSession.js';

const UPSTREAM = 'https://www.alphavantage.co/query';

const ALLOWED_FUNCTIONS = new Set(['GLOBAL_QUOTE', 'CURRENCY_EXCHANGE_RATE', 'TIME_SERIES_DAILY']);

const ALLOWED_PARAMS: Record<string, ReadonlySet<string>> = {
  GLOBAL_QUOTE: new Set(['function', 'symbol']),
  CURRENCY_EXCHANGE_RATE: new Set(['function', 'from_currency', 'to_currency']),
  TIME_SERIES_DAILY: new Set(['function', 'symbol', 'outputsize']),
};

function pickQueryValue(req: VercelRequest, key: string): string | null {
  const raw = req.query[key];
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 64) return null;
  return raw;
}

function validateParams(fn: string, params: URLSearchParams): string | null {
  if (fn === 'GLOBAL_QUOTE' || fn === 'TIME_SERIES_DAILY') {
    const symbol = params.get('symbol');
    if (!symbol || !/^[A-Z0-9.\-]{1,20}$/i.test(symbol)) return 'Invalid symbol.';
  }
  if (fn === 'CURRENCY_EXCHANGE_RATE') {
    const from = params.get('from_currency');
    const to = params.get('to_currency');
    if (!from || !/^[A-Z]{3,5}$/i.test(from)) return 'Invalid from_currency.';
    if (!to || !/^[A-Z]{3,5}$/i.test(to)) return 'Invalid to_currency.';
  }
  if (fn === 'TIME_SERIES_DAILY') {
    const size = params.get('outputsize');
    if (size && size !== 'compact' && size !== 'full') return 'Invalid outputsize.';
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!requireSiteSession(req, res)) return;

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY?.trim();
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      error: 'ALPHA_VANTAGE_API_KEY not configured on server.',
    });
  }

  const fn = pickQueryValue(req, 'function');
  if (!fn || !ALLOWED_FUNCTIONS.has(fn)) {
    return res.status(400).json({ success: false, error: 'Invalid or missing function.' });
  }

  const allowedKeys = ALLOWED_PARAMS[fn];
  const params = new URLSearchParams();
  params.set('function', fn);

  for (const key of allowedKeys) {
    if (key === 'function') continue;
    const value = pickQueryValue(req, key);
    if (value) params.set(key, value);
  }

  const validationError = validateParams(fn, params);
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  params.set('apikey', apiKey);

  try {
    const upstream = await fetch(`${UPSTREAM}?${params.toString()}`);
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch {
    return res.status(502).json({ success: false, error: 'Alpha Vantage upstream error.' });
  }
}
