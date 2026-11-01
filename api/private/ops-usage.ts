import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loadOpsUsagePayload } from '../_lib/opsUsageLoad.js';
import { requireSiteSession } from '../_lib/siteSession.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!requireSiteSession(req, res)) return;

  try {
    const payload = await loadOpsUsagePayload();
    if (payload == null) {
      return res.status(404).json({ success: false, error: 'No ops usage data configured' });
    }
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json(payload);
  } catch (err) {
    console.error('[ops-usage] handler error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load ops usage data' });
  }
}
