export type CursorUsageRow = {
  date: string;
  kind: string;
  model: string;
  totalTokens: number;
  outputTokens: number;
  inputTokens: number;
  cost: number;
};

function detectDelimiter(headerLine: string): ',' | ';' | '\t' {
  const counts = {
    ',': (headerLine.match(/,/g) ?? []).length,
    ';': (headerLine.match(/;/g) ?? []).length,
    '\t': (headerLine.match(/\t/g) ?? []).length,
  };
  if (counts[';'] >= counts[','] && counts[';'] >= counts['\t']) return ';';
  if (counts['\t'] >= counts[',']) return '\t';
  return ',';
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, ' ');
}

function pickColumn(headers: string[], candidates: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (const c of candidates) {
    const idx = normalized.indexOf(c);
    if (idx >= 0) return idx;
  }
  for (const c of candidates) {
    const idx = normalized.findIndex((h) => h.includes(c));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseNumber(raw: string | undefined): number {
  if (raw == null) return 0;
  const cleaned = raw.trim().replace(/[^\d.,-]/g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseDateCell(raw: string): string {
  const trimmed = raw.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const eu = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/.exec(trimmed);
  if (eu) {
    const d = eu[1].padStart(2, '0');
    const m = eu[2].padStart(2, '0');
    return `${eu[3]}-${m}-${d}`;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return trimmed.slice(0, 10);
}

/** Robuuste parser voor Cursor dashboard usage-export (CSV). */
export function parseCursorUsageCsv(text: string): CursorUsageRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((h) => h.trim());
  const dateIdx = pickColumn(headers, ['date', 'datum', 'day']);
  const kindIdx = pickColumn(headers, ['kind', 'type', 'agent']);
  const modelIdx = pickColumn(headers, ['model', 'model name']);
  const totalIdx = pickColumn(headers, ['total tokens', 'tokens', 'token count']);
  const outIdx = pickColumn(headers, ['output tokens', 'output']);
  const inIdx = pickColumn(headers, [
    'input (w/o cache write)',
    'input tokens',
    'input',
  ]);
  const costIdx = pickColumn(headers, ['cost', 'cost ($)', 'amount']);

  const rows: CursorUsageRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter);
    if (cols.length < 2) continue;
    const dateRaw = dateIdx >= 0 ? cols[dateIdx] : cols[0];
    const date = parseDateCell(dateRaw ?? '');
    const kind = kindIdx >= 0 ? (cols[kindIdx]?.trim() ?? '') : '';
    const model = modelIdx >= 0 ? (cols[modelIdx]?.trim() ?? 'Onbekend') : 'Onbekend';
    let totalTokens = totalIdx >= 0 ? parseNumber(cols[totalIdx]) : 0;
    const outputTokens = outIdx >= 0 ? parseNumber(cols[outIdx]) : 0;
    const inputTokens = inIdx >= 0 ? parseNumber(cols[inIdx]) : 0;
    if (totalTokens <= 0) totalTokens = inputTokens + outputTokens;
    const cost = costIdx >= 0 ? parseNumber(cols[costIdx]) : 0;
    if (!date) continue;
    rows.push({
      date,
      kind,
      model,
      totalTokens,
      outputTokens,
      inputTokens,
      cost,
    });
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

export function mergeCursorRows(all: CursorUsageRow[]): CursorUsageRow[] {
  return all.slice().sort((a, b) => a.date.localeCompare(b.date));
}

export function cursorRowsInRange(rows: CursorUsageRow[], start: Date, end: Date): CursorUsageRow[] {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return rows.filter((row) => {
    const d = parseIsoDateLocal(row.date);
    if (!d) return false;
    const t = d.getTime();
    return t >= startMs && t < endMs;
  });
}

function parseIsoDateLocal(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

export function dailyTokenTotals(rows: CursorUsageRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.date, (map.get(row.date) ?? 0) + row.totalTokens);
  }
  return map;
}

export function totalsByModel(rows: CursorUsageRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.model, (map.get(row.model) ?? 0) + row.totalTokens);
  }
  return map;
}

export function totalsByKind(rows: CursorUsageRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = row.kind.trim() || 'Overig';
    map.set(key, (map.get(key) ?? 0) + row.totalTokens);
  }
  return map;
}
