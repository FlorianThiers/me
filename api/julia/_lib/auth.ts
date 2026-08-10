import type { VercelRequest, VercelResponse } from '@vercel/node';

function serverSecret(): string | null {
  const raw = process.env.JULIA_API_SECRET?.trim();
  return raw ? raw : null;
}

function bearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const raw = header.startsWith('Bearer ') ? header.slice(7) : header;
  const token = raw.trim();
  // Users sometimes paste "Bearer …" into the key field → double Bearer
  const stripped = token.toLowerCase().startsWith('bearer ')
    ? token.slice(7).trim()
    : token;
  return stripped || null;
}

export function isAuthorized(req: VercelRequest): boolean {
  const secret = serverSecret();
  if (!secret) return false;
  const token = bearerToken(req);
  if (!token) return false;
  return token === secret;
}

export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (!serverSecret()) {
    res.status(503).json({
      success: false,
      error: 'JULIA_API_SECRET not configured on server (check Vercel Production env + redeploy)',
    });
    return false;
  }
  if (isAuthorized(req)) return true;
  res.status(401).json({
    success: false,
    error: 'Unauthorized — key must match JULIA_API_SECRET exactly (no quotes)',
  });
  return false;
}
