export type AgendaSource = 'notion' | 'todoist' | 'google';

export type AgendaCalendarMeta = {
  id: string;
  name: string;
  primary: boolean;
  backgroundColor?: string;
};

export type AgendaItem = {
  id: string;
  source: AgendaSource;
  calendarId?: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  isDeadline?: boolean;
  project?: string;
  planningType?: string;
  status?: string;
  url?: string;
};

export type AgendaFeedResponse = {
  calendars: AgendaCalendarMeta[];
  items: AgendaItem[];
  fetchedAt: string;
  partialErrors?: string[];
};
