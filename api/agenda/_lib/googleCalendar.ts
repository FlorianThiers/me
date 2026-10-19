import type { AgendaCalendarMeta, AgendaItem } from './types.js';

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type CalendarListEntry = {
  id: string;
  summary?: string;
  primary?: boolean;
  backgroundColor?: string;
};

type CalendarEvent = {
  id: string;
  summary?: string;
  htmlLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Calendar OAuth env vars not configured');
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = (await res.json()) as GoogleTokenResponse;
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? `Google token ${res.status}`);
  }
  return data.access_token;
}

function googleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      process.env.GOOGLE_REFRESH_TOKEN?.trim(),
  );
}

export function primaryCalendarId(): string {
  return process.env.GOOGLE_PRIMARY_CALENDAR_ID?.trim() || 'primary';
}

async function googleFetch(path: string, params?: Record<string, string>) {
  const token = await getAccessToken();
  const url = new URL(`https://www.googleapis.com/calendar/v3${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: { message?: string } }).error?.message ?? res.statusText;
    throw new Error(`Google Calendar ${res.status}: ${msg}`);
  }
  return data as Record<string, unknown>;
}

export async function listGoogleCalendars(): Promise<AgendaCalendarMeta[]> {
  if (!googleConfigured()) return [];
  const data = await googleFetch('/users/me/calendarList');
  const entries = (data.items as CalendarListEntry[]) ?? [];
  const primaryId = primaryCalendarId();
  return entries.map((c) => ({
    id: c.id,
    name: c.summary ?? c.id,
    primary: Boolean(c.primary) || c.id === primaryId,
    backgroundColor: c.backgroundColor,
  }));
}

export async function fetchGoogleEvents(
  rangeStart: Date,
  rangeEnd: Date,
  calendarIds: string[],
): Promise<AgendaItem[]> {
  if (!googleConfigured() || calendarIds.length === 0) return [];

  const timeMin = rangeStart.toISOString();
  const timeMax = rangeEnd.toISOString();
  const items: AgendaItem[] = [];

  for (const calendarId of calendarIds) {
    const data = await googleFetch(`/calendars/${encodeURIComponent(calendarId)}/events`, {
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });
    const events = (data.items as CalendarEvent[]) ?? [];
    for (const ev of events) {
      const startRaw = ev.start?.dateTime ?? ev.start?.date;
      if (!startRaw) continue;
      const endRaw = ev.end?.dateTime ?? ev.end?.date;
      items.push({
        id: `google:${calendarId}:${ev.id}`,
        source: 'google',
        calendarId,
        title: ev.summary ?? '(zonder titel)',
        start: startRaw,
        end: endRaw,
        allDay: Boolean(ev.start?.date && !ev.start?.dateTime),
        url: ev.htmlLink,
      });
    }
  }
  return items;
}

export function isGoogleConfigured(): boolean {
  return googleConfigured();
}
