import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAgendaAuth } from './_lib/auth.js';
import { cacheKey, withCache } from './_lib/cache.js';
import { fetchGoogleEvents, isGoogleConfigured, listGoogleCalendars } from './_lib/googleCalendar.js';
import { fetchNotionTasks } from './_lib/notionTasks.js';
import { fetchTodoistTasks } from './_lib/todoist.js';
import type { AgendaFeedResponse } from './_lib/types.js';

const CACHE_TTL_MS = 60_000;

function parseRange(req: VercelRequest): { start: Date; end: Date } | null {
  const timeMin = typeof req.query.timeMin === 'string' ? req.query.timeMin : '';
  const timeMax = typeof req.query.timeMax === 'string' ? req.query.timeMax : '';
  const start = new Date(timeMin);
  const end = new Date(timeMax);
  if (!timeMin || !timeMax || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  return { start, end };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!requireAgendaAuth(req, res)) return;

  const range = parseRange(req);
  if (!range) {
    return res.status(400).json({ success: false, error: 'timeMin and timeMax query params required' });
  }

  const calendarsParam =
    typeof req.query.calendars === 'string' ? req.query.calendars.trim() : '';
  const googleCalendarIds = calendarsParam
    ? calendarsParam.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

  res.setHeader('Cache-Control', 'private, max-age=60');

  const key = cacheKey([
    'feed',
    range.start.toISOString(),
    range.end.toISOString(),
    calendarsParam || '*',
  ]);

  try {
    const payload = await withCache<AgendaFeedResponse>(key, CACHE_TTL_MS, async () => {
      const partialErrors: string[] = [];
      const calendars = isGoogleConfigured()
        ? await listGoogleCalendars().catch((e: Error) => {
            partialErrors.push(e.message);
            return [];
          })
        : [];

      const idsForEvents =
        googleCalendarIds ??
        calendars.filter((c) => c.primary).map((c) => c.id);

      const [notion, todoist, google] = await Promise.all([
        fetchNotionTasks(range.start, range.end).catch((e: Error) => {
          partialErrors.push(e.message);
          return [];
        }),
        fetchTodoistTasks(range.start, range.end).catch((e: Error) => {
          partialErrors.push(e.message);
          return [];
        }),
        fetchGoogleEvents(range.start, range.end, idsForEvents).catch((e: Error) => {
          partialErrors.push(e.message);
          return [];
        }),
      ]);

      const items = [...notion, ...todoist, ...google].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );

      return {
        calendars,
        items,
        fetchedAt: new Date().toISOString(),
        partialErrors: partialErrors.length ? partialErrors : undefined,
      };
    });

    return res.status(200).json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Feed error';
    return res.status(500).json({ success: false, error: message });
  }
}
