import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './_lib/auth.js';
import { loadUsage, usageSummary } from './_lib/quotaStore.js';
import { configuredProviders, PROVIDER_POOL } from './_lib/providerPool.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!requireAuth(req, res)) return;

  const date =
    typeof req.query.date === 'string'
      ? req.query.date
      : new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' });

  const usage = await loadUsage(date);
  const providers = usageSummary(usage);

  return res.status(200).json({
    success: true,
    date,
    storage: usage.storage,
    lastActiveProvider: usage.lastActiveProvider,
    configuredCount: configuredProviders().length,
    poolSize: PROVIDER_POOL.length,
    providers,
    recentEvents: usage.events.slice(0, 20),
  });
}
