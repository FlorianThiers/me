import type { VercelRequest, VercelResponse } from '@vercel/node';

export function isAuthorized(req: VercelRequest): boolean {
  const secret = process.env.JULIA_API_SECRET;
  if (!secret) return false;
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return false;
  return header.slice(7) === secret;
}

export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (isAuthorized(req)) return true;
  res.status(401).json({ success: false, error: 'Unauthorized' });
  return false;
}
