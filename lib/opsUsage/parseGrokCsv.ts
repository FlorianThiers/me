export type GrokLogRow = {
  date: string;
  weekLimitPct: number;
  reset: string;
  topBots: { name: string; count: number }[];
  topRoutines: { name: string; count: number }[];
  dayShare: number;
  forecastPct: number;
};

function parsePairs(cell: string): { name: string; count: number }[] {
  const trimmed = cell.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.flatMap((item) => {
          if (typeof item === 'object' && item && 'name' in item && 'count' in item) {
            return [{ name: String((item as { name: unknown }).name), count: Number((item as { count: unknown }).count) || 0 }];
          }
          return [];
        });
      }
    } catch {
      // fall through
    }
  }
  return trimmed.split('|').flatMap((part) => {
    const seg = part.trim();
    if (!seg) return [];
    const colon = seg.lastIndexOf(':');
    if (colon <= 0) return [{ name: seg, count: 1 }];
    const name = seg.slice(0, colon).trim();
    const count = Number(seg.slice(colon + 1).replace(',', '.'));
    return [{ name, count: Number.isFinite(count) ? count : 0 }];
  });
}

function parseDecimal(raw: string): number {
  const n = Number(raw.trim().replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Semicolon-separated Grok Bot log CSV. */
export function parseGrokUsageCsv(text: string): GrokLogRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes('datum') && header.includes('weeklimiet');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const rows: GrokLogRow[] = [];
  for (const line of dataLines) {
    const cols = line.split(';');
    if (cols.length < 7) continue;
    const [datum, weeklimiet_pct, reset, top_bots, top_routines, dag_aandeel, prognose_pct] = cols;
    rows.push({
      date: datum.trim(),
      weekLimitPct: parseDecimal(weeklimiet_pct),
      reset: reset.trim(),
      topBots: parsePairs(top_bots),
      topRoutines: parsePairs(top_routines),
      dayShare: parseDecimal(dag_aandeel),
      forecastPct: parseDecimal(prognose_pct),
    });
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

export function grokRowsInCycle(rows: GrokLogRow[], start: Date, end: Date): GrokLogRow[] {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return rows.filter((row) => {
    const d = parseIsoDateLocal(row.date);
    if (!d) return false;
    const t = d.getTime();
    return t >= startMs && t < endMs;
  });
}

export function parseIsoDateLocal(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

export function aggregateGrokBots(rows: GrokLogRow[]): Map<string, { total: number; lastSeen: string }> {
  const map = new Map<string, { total: number; lastSeen: string }>();
  for (const row of rows) {
    for (const bot of row.topBots) {
      const prev = map.get(bot.name) ?? { total: 0, lastSeen: row.date };
      map.set(bot.name, {
        total: prev.total + bot.count,
        lastSeen: row.date > prev.lastSeen ? row.date : prev.lastSeen,
      });
    }
  }
  return map;
}

export function sumNamed(entries: { name: string; count: number }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of entries) {
    map.set(e.name, (map.get(e.name) ?? 0) + e.count);
  }
  return map;
}

export function mapToNamedAmounts(map: Map<string, number>): { name: string; value: number }[] {
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
