const STORAGE_KEY = 'julia-api-key';

export function getJuliaApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setJuliaApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function clearJuliaApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function authHeaders(): HeadersInit {
  const key = getJuliaApiKey();
  if (!key) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  };
}

export type CaptureResponse = {
  success: boolean;
  date?: string;
  kind?: string;
  waterL?: number;
  addedL?: number;
  entryId?: string;
  error?: string;
};

async function readJson<T extends { success?: boolean; error?: string }>(
  res: Response,
): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return {
      success: false,
      error: text.trim().slice(0, 200) || res.statusText || `HTTP ${res.status}`,
    } as T;
  }
}

export async function juliaCapture(payload: {
  date: string;
  kind: 'water' | 'food';
  liters?: number;
  preset?: string;
}): Promise<CaptureResponse> {
  const res = await fetch('/api/julia/capture', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await readJson<CaptureResponse>(res);
  if (!res.ok) {
    return { success: false, error: data.error ?? res.statusText };
  }
  return data;
}

export type ChatResponse = {
  success: boolean;
  text?: string;
  provider?: string;
  error?: string;
};

export async function juliaChat(payload: {
  message: string;
  date: string;
  lifeSummary?: string;
}): Promise<ChatResponse> {
  const res = await fetch('/api/julia/chat', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await readJson<ChatResponse & { tokensIn?: number }>(res);
  if (!res.ok) {
    return { success: false, error: data.error ?? res.statusText };
  }
  return data;
}

export type UsageProvider = {
  id: string;
  label: string;
  requests: number;
  requestLimit: number;
  requestPct: number;
  tokensIn: number;
  tokensOut: number;
  tokenLimit: number;
  tokenPct: number;
  status: 'active' | 'available' | 'exhausted' | 'no_key';
  exhaustedUntil?: string;
  lastError?: string;
};

export type UsageResponse = {
  success: boolean;
  date?: string;
  storage?: 'upstash' | 'memory';
  providers?: UsageProvider[];
  recentEvents?: Array<{
    ts: string;
    provider: string;
    tokensIn: number;
    tokensOut: number;
    intent: string;
    ok: boolean;
    note?: string;
  }>;
  error?: string;
};

export async function juliaUsage(date?: string): Promise<UsageResponse> {
  const q = date ? `?date=${encodeURIComponent(date)}` : '';
  const res = await fetch(`/api/julia/usage${q}`, { headers: authHeaders() });
  const data = await readJson<UsageResponse>(res);
  if (!res.ok) {
    return { success: false, error: data.error ?? res.statusText };
  }
  return data;
}

import type { JuliaLifeSnapshot } from '../types/juliaSnapshot';

export function lifeSummaryLine(life?: JuliaLifeSnapshot): string | undefined {
  if (!life) return undefined;
  const parts: string[] = [];
  if (life.proteinG != null) parts.push(`eiwit ${Math.round(life.proteinG)}g`);
  if (life.waterL != null) parts.push(`water ${life.waterL}L`);
  if (life.kcal != null) parts.push(`kcal ${Math.round(life.kcal)}`);
  if (life.mealTonight) parts.push(`avond ${life.mealTonight}`);
  else if (life.mealLunch) parts.push(`lunch ${life.mealLunch}`);
  return parts.length ? parts.join(', ') : undefined;
}
