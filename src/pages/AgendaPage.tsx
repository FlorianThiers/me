import React, { useEffect, useMemo, useState } from 'react';
import { MandelbrotOrbBackground } from '../components/orbit/MandelbrotOrbBackground';
import { getPageFractalConfig } from '../data/pageMandelbrotConfig';
import { AgendaLogin } from '../components/agenda/AgendaLogin';
import { AgendaToolbar } from '../components/agenda/AgendaToolbar';
import { AgendaCalendarList } from '../components/agenda/AgendaCalendarList';
import { AgendaWeekView } from '../components/agenda/AgendaWeekView';
import { AgendaMonthView } from '../components/agenda/AgendaMonthView';
import { AgendaDetailPanel } from '../components/agenda/AgendaDetailPanel';
import { useAgendaSession } from '../hooks/useAgendaSession';
import { useAgendaFeed } from '../hooks/useAgendaFeed';
import type { AgendaItem, AgendaViewMode } from '../types/agenda';
import {
  addDays,
  endOfMonth,
  formatMonthTitle,
  formatWeekRange,
  startOfMonth,
  startOfWeekMonday,
  toIsoRangeEnd,
  toIsoRangeStart,
} from '../lib/agendaDates';
import {
  filterVisibleItems,
  googleIdsFromToggles,
  loadToggles,
  saveToggles,
  type LayerToggles,
} from '../lib/agendaToggles';

const agendaBackground = getPageFractalConfig('/life-rhythm').view;

export const AgendaPage: React.FC = () => {
  const { status, configured, login, logout } = useAgendaSession();
  const [view, setView] = useState<AgendaViewMode>('week');
  const [anchor, setAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState<AgendaItem | null>(null);
  const [toggles, setToggles] = useState<LayerToggles>({ notion: true, todoist: true });

  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (meta) meta.setAttribute('content', 'index, follow');
    };
  }, []);

  const range = useMemo(() => {
    if (view === 'week') {
      const start = startOfWeekMonday(anchor);
      const end = addDays(start, 6);
      return { start, end };
    }
    const start = startOfMonth(anchor);
    const end = endOfMonth(anchor);
    return { start, end };
  }, [anchor, view]);

  const timeMin = toIsoRangeStart(range.start);
  const timeMax = toIsoRangeEnd(range.end);
  const googleIds = useMemo(() => googleIdsFromToggles(toggles), [toggles]);

  const feed = useAgendaFeed(status === 'authed', timeMin, timeMax, googleIds);

  const calendarKey = feed.calendars.map((c) => c.id).join(',');
  useEffect(() => {
    if (!calendarKey) return;
    setToggles(loadToggles(feed.calendars));
  }, [calendarKey, feed.calendars]);

  const visibleItems = useMemo(
    () => filterVisibleItems(feed.items, toggles),
    [feed.items, toggles],
  );

  const title = view === 'week' ? formatWeekRange(anchor) : formatMonthTitle(anchor);

  const shiftAnchor = (delta: number) => {
    setAnchor((d) => {
      const next = new Date(d);
      if (view === 'week') next.setDate(next.getDate() + delta * 7);
      else next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  const handleToggle = (key: string, value: boolean) => {
    setToggles((t) => {
      const next = { ...t, [key]: value };
      saveToggles(next);
      return next;
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-bg text-white/60 flex items-center justify-center">
        Laden…
      </div>
    );
  }

  if (status === 'guest') {
    return (
      <div className="relative min-h-screen">
        <MandelbrotOrbBackground view={agendaBackground} />
        <div className="relative z-10 pt-24">
          <AgendaLogin configured={configured} onLogin={login} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-16">
      <MandelbrotOrbBackground view={agendaBackground} />
      <div className="relative z-10 container-custom px-4 pt-24 max-w-7xl mx-auto">
        <AgendaToolbar
          view={view}
          title={title}
          onViewChange={setView}
          onPrev={() => shiftAnchor(-1)}
          onNext={() => shiftAnchor(1)}
          onToday={() => setAnchor(new Date())}
          onLogout={() => void logout()}
          loading={feed.loading}
        />

        {feed.error && feed.error !== 'UNAUTHORIZED' && (
          <p className="text-neon-pink text-sm mb-4">{feed.error}</p>
        )}
        {feed.partialErrors && feed.partialErrors.length > 0 && (
          <p className="text-neon-orange text-xs mb-4">
            Sommige bronnen konden niet geladen worden: {feed.partialErrors.join(' · ')}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-4">
          <AgendaCalendarList calendars={feed.calendars} toggles={toggles} onChange={handleToggle} />
          <div>
            {view === 'week' ? (
              <AgendaWeekView
                anchor={anchor}
                items={visibleItems}
                calendars={feed.calendars}
                onSelect={setSelected}
              />
            ) : (
              <AgendaMonthView
                anchor={anchor}
                items={visibleItems}
                calendars={feed.calendars}
                onSelect={setSelected}
              />
            )}
          </div>
        </div>
      </div>
      <AgendaDetailPanel item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
