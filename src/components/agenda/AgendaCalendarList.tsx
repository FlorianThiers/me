import React from 'react';
import type { AgendaCalendarMeta } from '../../types/agenda';
import type { LayerToggles } from '../../lib/agendaToggles';

type Props = {
  calendars: AgendaCalendarMeta[];
  toggles: LayerToggles;
  onChange: (key: string, value: boolean) => void;
};

function swatch(color: string) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export const AgendaCalendarList: React.FC<Props> = ({ calendars, toggles, onChange }) => {
  const otherCals = calendars.filter((c) => !c.primary);

  return (
    <aside className="bg-orbit-surface border border-white/10 rounded-xl p-4 text-sm">
      <h2 className="text-white font-semibold mb-3">Kalenders</h2>
      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          <input
            id="layer-notion"
            type="checkbox"
            checked={toggles.notion !== false}
            onChange={(e) => onChange('notion', e.target.checked)}
            className="accent-orbit-violet"
          />
          {swatch('#00ff88')}
          <label htmlFor="layer-notion" className="text-white/85 cursor-pointer">Notion taken</label>
        </li>
        <li className="flex items-center gap-2">
          <input
            id="layer-todoist"
            type="checkbox"
            checked={toggles.todoist !== false}
            onChange={(e) => onChange('todoist', e.target.checked)}
            className="accent-orbit-violet"
          />
          {swatch('#ff8800')}
          <label htmlFor="layer-todoist" className="text-white/85 cursor-pointer">Todoist</label>
        </li>
        {calendars
          .filter((c) => c.primary)
          .map((cal) => {
            const key = `google:${cal.id}`;
            return (
              <li key={cal.id} className="flex items-center gap-2">
                <input
                  id={`layer-${cal.id}`}
                  type="checkbox"
                  checked={toggles[key] !== false}
                  onChange={(e) => onChange(key, e.target.checked)}
                  className="accent-orbit-violet"
                />
                {swatch(cal.backgroundColor ?? '#0088ff')}
                <label htmlFor={`layer-${cal.id}`} className="text-white/85 cursor-pointer">
                  {cal.name}
                </label>
              </li>
            );
          })}
      </ul>
      {otherCals.length > 0 && (
        <>
          <p className="text-white/40 text-xs mt-4 mb-2 uppercase tracking-wide">Andere agenda&apos;s</p>
          <ul className="space-y-2">
            {otherCals.map((cal) => {
              const key = `google:${cal.id}`;
              return (
                <li key={cal.id} className="flex items-center gap-2">
                  <input
                    id={`layer-${cal.id}`}
                    type="checkbox"
                    checked={toggles[key] === true}
                    onChange={(e) => onChange(key, e.target.checked)}
                    className="accent-orbit-violet"
                  />
                  {swatch(cal.backgroundColor ?? '#666')}
                  <label htmlFor={`layer-${cal.id}`} className="text-white/60 cursor-pointer">
                    {cal.name}
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </aside>
  );
};
