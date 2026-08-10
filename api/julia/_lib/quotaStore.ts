import type { ProviderId } from './providerPool.js';
import { PROVIDER_POOL } from './providerPool.js';

export type UsageEvent = {
  ts: string;
  provider: ProviderId | 'tier0';
  tokensIn: number;
  tokensOut: number;
  intent: string;
  ok: boolean;
  note?: string;
};

export type ProviderDayStats = {
  requests: number;
  tokensIn: number;
  tokensOut: number;
  exhaustedUntil?: string;
  lastError?: string;
};

export type DayUsage = {
  date: string;
  providers: Record<string, ProviderDayStats>;
  events: UsageEvent[];
  lastActiveProvider?: ProviderId;
  storage: 'upstash' | 'memory';
};

const memory = new Map<string, DayUsage>();
const MAX_EVENTS = 80;

function brusselsDate(d = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' });
}

function emptyDay(date: string): DayUsage {
  const providers: Record<string, ProviderDayStats> = {};
  for (const p of PROVIDER_POOL) {
    providers[p.id] = { requests: 0, tokensIn: 0, tokensOut: 0 };
  }
  return { date, providers, events: [], storage: 'memory' };
}

function redisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function redisGet(key: string): Promise<string | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: string | null };
  return data.result ?? null;
}

async function redisSet(key: string, value: string): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  await fetch(`${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function keyFor(date: string): string {
  return `julia:usage:${date}`;
}

export async function loadUsage(date = brusselsDate()): Promise<DayUsage> {
  if (redisConfigured()) {
    const raw = await redisGet(keyFor(date));
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DayUsage;
        parsed.storage = 'upstash';
        return parsed;
      } catch {
        /* fall through */
      }
    }
    const fresh = emptyDay(date);
    fresh.storage = 'upstash';
    return fresh;
  }
  return memory.get(keyFor(date)) ?? emptyDay(date);
}

export async function saveUsage(usage: DayUsage): Promise<void> {
  if (redisConfigured()) {
    usage.storage = 'upstash';
    await redisSet(keyFor(usage.date), JSON.stringify(usage));
    return;
  }
  memory.set(keyFor(usage.date), usage);
}

export function isProviderAvailable(
  usage: DayUsage,
  providerId: ProviderId,
): { ok: boolean; reason?: string } {
  const cfg = PROVIDER_POOL.find((p) => p.id === providerId);
  if (!cfg) return { ok: false, reason: 'unknown' };
  if (!process.env[cfg.envKey]) return { ok: false, reason: 'no_key' };

  const stats = usage.providers[providerId] ?? { requests: 0, tokensIn: 0, tokensOut: 0 };
  if (stats.exhaustedUntil && new Date(stats.exhaustedUntil) > new Date()) {
    return { ok: false, reason: 'exhausted' };
  }
  if (stats.requests >= cfg.dailyRequests) {
    return { ok: false, reason: 'daily_requests' };
  }
  const tokens = stats.tokensIn + stats.tokensOut;
  if (tokens >= cfg.dailyTokens) {
    return { ok: false, reason: 'daily_tokens' };
  }
  return { ok: true };
}

export async function recordUsage(
  event: Omit<UsageEvent, 'ts'> & { ts?: string },
  date = brusselsDate(),
): Promise<DayUsage> {
  const usage = await loadUsage(date);
  const full: UsageEvent = { ...event, ts: event.ts ?? new Date().toISOString() };

  if (event.provider !== 'tier0') {
    const stats = usage.providers[event.provider] ?? { requests: 0, tokensIn: 0, tokensOut: 0 };
    stats.requests += 1;
    stats.tokensIn += event.tokensIn;
    stats.tokensOut += event.tokensOut;
    if (!event.ok) {
      stats.lastError = event.note ?? 'error';
      if (event.note === 'rate_limit' || event.note === 'quota') {
        const until = new Date();
        until.setHours(24, 0, 0, 0);
        stats.exhaustedUntil = until.toISOString();
      }
    }
    usage.providers[event.provider] = stats;
    if (event.ok) usage.lastActiveProvider = event.provider;
  }

  usage.events = [full, ...usage.events].slice(0, MAX_EVENTS);
  await saveUsage(usage);
  return usage;
}

export function usageSummary(usage: DayUsage) {
  return PROVIDER_POOL.map((p) => {
    const s = usage.providers[p.id] ?? { requests: 0, tokensIn: 0, tokensOut: 0 };
    const tokens = s.tokensIn + s.tokensOut;
    const reqPct = Math.round((s.requests / p.dailyRequests) * 100);
    const tokPct = Math.round((tokens / p.dailyTokens) * 100);
    const available = isProviderAvailable(usage, p.id);
    let status: 'active' | 'available' | 'exhausted' | 'no_key' = 'available';
    if (!process.env[p.envKey]) status = 'no_key';
    else if (!available.ok) status = 'exhausted';
    else if (usage.lastActiveProvider === p.id) status = 'active';

    return {
      id: p.id,
      label: p.label,
      requests: s.requests,
      requestLimit: p.dailyRequests,
      requestPct: reqPct,
      tokensIn: s.tokensIn,
      tokensOut: s.tokensOut,
      tokenLimit: p.dailyTokens,
      tokenPct: tokPct,
      status,
      exhaustedUntil: s.exhaustedUntil,
      lastError: s.lastError,
    };
  });
}
