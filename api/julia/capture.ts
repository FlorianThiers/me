import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './_lib/auth.js';
import { addFood, addWater } from './_lib/notion.js';
import { recordUsage } from './_lib/quotaStore.js';

type CaptureBody = {
  date?: string;
  kind?: 'water' | 'food';
  liters?: number;
  preset?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!requireAuth(req, res)) return;

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as CaptureBody;
  const date =
    body.date ??
    new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' });
  const kind = body.kind;

  if (!kind || !['water', 'food'].includes(kind)) {
    return res.status(400).json({ success: false, error: 'kind must be water or food' });
  }

  try {
    if (kind === 'water') {
      const liters = typeof body.liters === 'number' ? body.liters : 0.25;
      const waterL = await addWater(date, liters);
      await recordUsage({
        provider: 'tier0',
        tokensIn: 0,
        tokensOut: 0,
        intent: 'capture_water',
        ok: true,
        note: `+${liters}L`,
      }, date);
      return res.status(200).json({
        success: true,
        date,
        kind: 'water',
        addedL: liters,
        waterL,
      });
    }

    const preset = body.preset ?? 'merci';
    const entryId = await addFood(date, preset);
    await recordUsage({
      provider: 'tier0',
      tokensIn: 0,
      tokensOut: 0,
      intent: 'capture_food',
      ok: true,
      note: preset,
    }, date);
    return res.status(200).json({
      success: true,
      date,
      kind: 'food',
      preset,
      entryId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Capture failed';
    return res.status(503).json({ success: false, error: msg });
  }
}
