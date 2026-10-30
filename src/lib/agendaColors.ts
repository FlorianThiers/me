const PROJECT_COLORS: Record<string, string> = {
  Vijverkuis: '#3db8d9',
  UC: '#8800ff',
  Servelec: '#0088ff',
  Anaconda: '#ff8800',
  MySpace: '#00ff88',
  Corridor: '#7c5cbf',
};

export function projectColor(project?: string): string {
  if (!project) return '#7c5cbf';
  return PROJECT_COLORS[project] ?? '#a78bfa';
}

export function sourceLabel(source: 'notion' | 'todoist' | 'google'): string {
  if (source === 'notion') return 'Notion';
  if (source === 'todoist') return 'Todoist';
  return 'Google Calendar';
}
