import React from 'react';
import type { AgendaCalendarMeta, AgendaItem } from '../../types/agenda';
import {
  formatDayHeader,
  itemDayKey,
  weekDays,
} from '../../lib/agendaDates';
import { itemIsMuted } from '../../lib/agendaToggles';
import { projectColor } from '../../lib/agendaColors';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

type Props = {
  anchor: Date;
  items: AgendaItem[];
  calendars: AgendaCalendarMeta[];
  onSelect: (item: AgendaItem) => void;
};

function hourFromIso(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

export const AgendaWeekView: React.FC<Props> = ({ anchor, items, calendars, onSelect }) => {
  const days = weekDays(anchor);
  const byDay = new Map<string, AgendaItem[]>();
  for (const item of items) {
    const key = itemDayKey(item.start);
    const list = byDay.get(key) ?? [];
    list.push(item);
    byDay.set(key, list);
  }

  const timed = items.filter((i) => !i.allDay && !i.isDeadline);
  const allDay = items.filter((i) => i.allDay || i.isDeadline);

  return (
    <div className="bg-orbit-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] border-b border-white/10 text-xs text-white/50">
        <div />
        {days.map((d) => (
          <div key={d.toISOString()} className="px-2 py-2 border-l border-white/10 font-medium text-white/70">
            {formatDayHeader(d)}
          </div>
        ))}
      </div>

      {allDay.length > 0 && (
        <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] border-b border-white/10 min-h-[2.5rem]">
          <div className="text-[10px] text-white/40 px-1 py-1">dag</div>
          {days.map((d) => {
            const key = itemDayKey(d.toISOString());
            const dayItems = (byDay.get(key) ?? []).filter((i) => i.allDay || i.isDeadline);
            return (
              <div key={key} className="border-l border-white/10 p-1 flex flex-col gap-0.5">
                {dayItems.map((item) => {
                  const muted = itemIsMuted(item, calendars);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item)}
                      className={`text-left text-[10px] truncate rounded px-1 py-0.5 border ${
                        muted
                          ? 'opacity-45 border-white/10 text-white/55 bg-black/20'
                          : 'border-white/15 text-white bg-black/35'
                      }`}
                      style={
                        muted
                          ? undefined
                          : { borderLeftColor: projectColor(item.project), borderLeftWidth: 3 }
                      }
                    >
                      {item.isDeadline ? '◎ ' : ''}{item.title}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      <div className="relative max-h-[70vh] overflow-y-auto">
        <div
          className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))]"
          style={{ minHeight: `${HOURS.length * 48}px` }}
        >
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 text-[10px] text-white/35 pr-1 text-right"
                style={{ top: `${(h - HOURS[0]) * 48}px`, height: 48 }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>
          {days.map((d) => {
            const key = itemDayKey(d.toISOString());
            const dayTimed = timed.filter((i) => itemDayKey(i.start) === key);
            return (
              <div
                key={key}
                className="relative border-l border-white/10"
                style={{ minHeight: `${HOURS.length * 48}px` }}
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-white/5"
                    style={{ top: `${(h - HOURS[0]) * 48}px` }}
                  />
                ))}
                {dayTimed.map((item) => {
                  const startH = hourFromIso(item.start);
                  const endH = item.end ? hourFromIso(item.end) : startH + 1;
                  const top = Math.max(0, (startH - HOURS[0]) * 48);
                  const height = Math.max(20, (endH - startH) * 48);
                  const muted = itemIsMuted(item, calendars);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item)}
                      className={`absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-[10px] text-left overflow-hidden border ${
                        muted
                          ? 'opacity-40 bg-white/5 border-white/10 text-white/55 z-0'
                          : 'bg-black/50 border-white/15 text-white z-10'
                      }`}
                      style={{
                        top,
                        height,
                        borderLeftColor: muted ? undefined : projectColor(item.project),
                        borderLeftWidth: muted ? undefined : 3,
                      }}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
