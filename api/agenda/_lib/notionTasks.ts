import type { AgendaItem } from './types.js';

const NOTION_VERSION = '2022-06-28';

const DONE_LABELS = new Set(['done', 'klaar', 'afgerond', 'completed', 'archived']);

function notionToken(): string | null {
  const t = process.env.NOTION_TOKEN?.trim();
  return t || null;
}

function tasksDatabaseId(): string | null {
  const id = process.env.NOTION_TASKS_DATABASE_ID?.trim();
  return id || null;
}

async function notionRequest(method: string, path: string, body?: unknown) {
  const token = notionToken();
  if (!token) throw new Error('NOTION_TOKEN not configured');
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? res.statusText;
    throw new Error(`Notion ${res.status}: ${msg}`);
  }
  return data as Record<string, unknown>;
}

function propTitle(props: Record<string, unknown>): string {
  for (const value of Object.values(props)) {
    const p = value as { type?: string; title?: Array<{ plain_text?: string }> };
    if (p?.type === 'title' && Array.isArray(p.title)) {
      return p.title.map((t) => t.plain_text ?? '').join('').trim();
    }
  }
  const named = props.Name as { title?: Array<{ plain_text?: string }> } | undefined;
  if (named?.title) {
    return named.title.map((t) => t.plain_text ?? '').join('').trim();
  }
  return '';
}

function propDate(props: Record<string, unknown>, key: string): { start: string; end?: string } | null {
  const p = props[key] as
    | { type?: string; date?: { start?: string; end?: string | null } | null }
    | undefined;
  if (p?.type !== 'date' || !p.date?.start) return null;
  return { start: p.date.start, end: p.date.end ?? undefined };
}

function propSelect(props: Record<string, unknown>, key: string): string | undefined {
  const p = props[key] as { type?: string; select?: { name?: string } | null } | undefined;
  if (p?.type === 'select' && p.select?.name) return p.select.name;
  return undefined;
}

function propStatus(props: Record<string, unknown>, key: string): string | undefined {
  const p = props[key] as
    | { type?: string; status?: { name?: string } | null; select?: { name?: string } | null }
    | undefined;
  if (p?.type === 'status' && p.status?.name) return p.status.name;
  if (p?.type === 'select' && p.select?.name) return p.select.name;
  return undefined;
}

function isDoneStatus(status: string | undefined): boolean {
  if (!status) return false;
  return DONE_LABELS.has(status.trim().toLowerCase());
}

export function parseProjectPrefix(title: string): string | undefined {
  const m = title.match(/^\[([^\]]+)\]/);
  return m?.[1]?.trim();
}

function overlapsRange(
  startIso: string,
  endIso: string | undefined,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : start;
  if (Number.isNaN(start.getTime())) return false;
  const effectiveEnd = Number.isNaN(end.getTime()) ? start : end;
  return start <= rangeEnd && effectiveEnd >= rangeStart;
}

function notionPageUrl(pageId: string): string {
  const compact = pageId.replace(/-/g, '');
  return `https://www.notion.so/${compact}`;
}

export async function fetchNotionTasks(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<AgendaItem[]> {
  const dbId = tasksDatabaseId();
  if (!notionToken() || !dbId) return [];

  const timeMin = rangeStart.toISOString();
  const timeMax = rangeEnd.toISOString();

  const filter = {
    and: [
      {
        or: [
          {
            and: [
              { property: 'Start', date: { on_or_after: timeMin.slice(0, 10) } },
              { property: 'Start', date: { on_or_before: timeMax.slice(0, 10) } },
            ],
          },
          {
            and: [
              { property: 'Due', date: { on_or_after: timeMin.slice(0, 10) } },
              { property: 'Due', date: { on_or_before: timeMax.slice(0, 10) } },
            ],
          },
        ],
      },
    ],
  };

  const items: AgendaItem[] = [];
  let cursor: string | undefined;
  let pages = 0;

  do {
    const data = await notionRequest('POST', `/databases/${dbId}/query`, {
      filter,
      start_cursor: cursor,
      page_size: 100,
    });
    const results = (data.results as Array<{ id: string; properties: Record<string, unknown> }>) ?? [];
    for (const page of results) {
      const props = page.properties;
      const status = propStatus(props, 'Status');
      if (isDoneStatus(status)) continue;

      const title = propTitle(props);
      const startProp = propDate(props, 'Start');
      const dueProp = propDate(props, 'Due');
      const planningType = propSelect(props, 'Planningstype');
      const project = parseProjectPrefix(title);

      if (startProp && overlapsRange(startProp.start, startProp.end, rangeStart, rangeEnd)) {
        const allDay = !startProp.start.includes('T');
        items.push({
          id: `notion:${page.id}`,
          source: 'notion',
          title,
          start: startProp.start,
          end: startProp.end,
          allDay,
          project,
          planningType,
          status,
          url: notionPageUrl(page.id),
        });
      } else if (dueProp && overlapsRange(dueProp.start, dueProp.end, rangeStart, rangeEnd)) {
        items.push({
          id: `notion:${page.id}:due`,
          source: 'notion',
          title,
          start: dueProp.start,
          end: dueProp.end,
          allDay: !dueProp.start.includes('T'),
          isDeadline: true,
          project,
          planningType,
          status,
          url: notionPageUrl(page.id),
        });
      }
    }
    cursor = (data.next_cursor as string | null) ?? undefined;
    pages += 1;
  } while (cursor && pages < 10);

  return items;
}
