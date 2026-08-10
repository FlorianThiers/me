import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './_lib/auth';
import { routeChat } from './_lib/llmRouter';

type ChatBody = {
  message?: string;
  date?: string;
  lifeSummary?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!requireAuth(req, res)) return;

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as ChatBody;
  const message = body.message?.trim();
  if (!message) {
    return res.status(400).json({ success: false, error: 'message required' });
  }

  const date =
    body.date ??
    new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' });

  try {
    const result = await routeChat(message, {
      date,
      lifeSummary: body.lifeSummary,
    });
    return res.status(200).json({
      success: true,
      text: result.text,
      provider: result.provider,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      failoverFrom: result.failoverFrom,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Chat failed';
    return res.status(503).json({ success: false, error: msg });
  }
}
