import { useCallback, useEffect, useState } from 'react';
import { fetchAgendaFeed } from '../lib/agendaApi';
import type { AgendaCalendarMeta, AgendaItem } from '../types/agenda';

type FeedState = {
  items: AgendaItem[];
  calendars: AgendaCalendarMeta[];
  fetchedAt?: string;
  partialErrors?: string[];
  loading: boolean;
  error: string | null;
};

export function useAgendaFeed(
  enabled: boolean,
  timeMin: string,
  timeMax: string,
  googleCalendarIds: string[],
) {
  const [state, setState] = useState<FeedState>({
    items: [],
    calendars: [],
    loading: false,
    error: null,
  });

  const reload = useCallback(async () => {
    if (!enabled) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchAgendaFeed(timeMin, timeMax, googleCalendarIds);
      setState({
        items: data.items,
        calendars: data.calendars,
        fetchedAt: data.fetchedAt,
        partialErrors: data.partialErrors,
        loading: false,
        error: null,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Laden mislukt';
      setState((s) => ({
        ...s,
        loading: false,
        error: message,
      }));
    }
  }, [enabled, timeMin, timeMax, googleCalendarIds]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ...state, reload };
}
