import type { AgendaFeedResponse } from '../types/agenda';

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T;
  return data;
}

export async function checkAgendaSession(): Promise<{ authenticated: boolean; configured: boolean }> {
  const res = await fetch('/api/agenda/session', { credentials: 'include' });
  if (res.status === 401) {
    return { authenticated: false, configured: true };
  }
  const data = await parseJson<{ authenticated?: boolean; configured?: boolean }>(res);
  return {
    authenticated: Boolean(data.authenticated),
    configured: data.configured !== false,
  };
}

export async function loginAgenda(password: string): Promise<void> {
  const res = await fetch('/api/agenda/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const data = await parseJson<{ error?: string }>(res);
    throw new Error(data.error ?? 'Login mislukt');
  }
}

export async function logoutAgenda(): Promise<void> {
  await fetch('/api/agenda/logout', { method: 'POST', credentials: 'include' });
}

export async function fetchAgendaFeed(
  timeMin: string,
  timeMax: string,
  googleCalendarIds: string[],
): Promise<AgendaFeedResponse> {
  const params = new URLSearchParams({ timeMin, timeMax });
  if (googleCalendarIds.length > 0) {
    params.set('calendars', googleCalendarIds.join(','));
  }
  const res = await fetch(`/api/agenda/feed?${params}`, { credentials: 'include' });
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    const data = await parseJson<{ error?: string }>(res);
    throw new Error(data.error ?? 'Kon agenda niet laden');
  }
  return parseJson<AgendaFeedResponse>(res);
}
