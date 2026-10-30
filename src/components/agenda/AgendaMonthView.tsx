import React from 'react';
import type { AgendaCalendarMeta, AgendaItem } from '../../types/agenda';
import {
  formatDayHeader,
  isSameDay,
  itemDayKey,
  monthGridDays,
  startOfMonth,
} from '../../lib/agendaDates';
import { itemIsMuted } from '../../lib/agendaToggles';
import { projectColor } from '../../lib/agendaColors';

type Props = {
  anchor: Date;
  items: AgendaItem[];
  calendars: AgendaCalendarMeta[];
  onSelect: (item: AgendaItem) => void;
};

export const AgendaMonthView: React.FC<Props> = ({ anchor, items, calendars, onSelect }) => {
  const days = monthGridDays(anchor);
  const monthStart = startOfMonth(anchor);
  const today = new Date();

  const byDay = new Map<string, AgendaItem[]>();
  for (const item of items) {
    const key = itemDayKey(item.start);
    const list = byDay.get(key) ?? [];
    list.push(item);
    byDay.set(key, list);
  }

  return (
    <div className="bg-orbit-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-white/10 text-xs text-white/50">
        {['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map((label) => (
          <div key={label} className="px-2 py-2 text-center uppercase tracking-wide">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(5.5rem,1fr)]">
        {days.map((d) => {
          const inMonth = d.getMonth() === monthStart.getMonth();
          const key = itemDayKey(d.toISOString());
          const dayItems = (byDay.get(key) ?? []).slice(0, 4);
          const more = (byDay.get(key)?.length ?? 0) - dayItems.length;
          return (
            <div
              key={key}
              className={`border-t border-l border-white/10 p-1.5 min-h-[5.5rem] ${
                inMonth ? '' : 'bg-black/20'
              } ${isSameDay(d, today) ? 'ring-1 ring-inset ring-orbit-violet/40' : ''}`}
            >
              <div className="text-[11px] text-white/45 mb-1">{formatDayHeader(d)}</div>
              <div className="space-y-0.5">
                {dayItems.map((item) => {
                  const muted = itemIsMuted(item, calendars);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item)}
                      className={`block w-full text-left text-[10px] truncate rounded px-1 py-0.5 ${
                        muted ? 'text-white/45 bg-white/5' : 'text-white/90 bg-black/35'
                      }`}
                      style={
                        muted
                          ? undefined
                          : { boxShadow: `inset 3px 0 0 ${projectColor(item.project)}` }
                      }
                    >
                      {item.isDeadline ? '◎ ' : ''}{item.title}
                    </button>
                  );
                })}
                {more > 0 && <p className="text-[10px] text-white/35">+{more} meer</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
