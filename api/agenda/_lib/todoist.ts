import type { AgendaItem } from './types.js';

type TodoistTask = {
  id: string;
  content: string;
  description?: string;
  due?: {
    date: string;
    datetime?: string;
    timezone?: string;
  } | null;
  url: string;
};

function todoistToken(): string | null {
  const t = process.env.TODOIST_API_TOKEN?.trim();
  return t || null;
}

function inRange(iso: string, rangeStart: Date, rangeEnd: Date): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d >= rangeStart && d <= rangeEnd;
}

export async function fetchTodoistTasks(rangeStart: Date, rangeEnd: Date): Promise<AgendaItem[]> {
  const token = todoistToken();
  if (!token) return [];

  const res = await fetch('https://api.todoist.com/rest/v2/tasks', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => [])) as TodoistTask[] | { error?: string };
  if (!res.ok) {
    const msg = (data as { error?: string }).error ?? res.statusText;
    throw new Error(`Todoist ${res.status}: ${msg}`);
  }
  if (!Array.isArray(data)) return [];

  const items: AgendaItem[] = [];
  for (const task of data) {
    if (!task.due) continue;
    const start = task.due.datetime ?? `${task.due.date}T12:00:00`;
    if (!inRange(start, rangeStart, rangeEnd)) continue;
    const allDay = !task.due.datetime;
    items.push({
      id: `todoist:${task.id}`,
      source: 'todoist',
      title: task.content,
      start: task.due.datetime ?? task.due.date,
      allDay,
      isDeadline: allDay,
      url: task.url,
    });
  }
  return items;
}
