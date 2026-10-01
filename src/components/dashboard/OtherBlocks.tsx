import React from 'react';
import { formatDateNl } from '../../lib/dashboardFreshness';
import { DashboardBlock, EmptyState, SectionLabel, Stat, StatGrid } from './DashboardBlock';
import { Sparkline } from './Sparkline';
import { foot, noticeOf, statusOf, type Snap } from './status';

type Variant = 'summary' | 'detail';
type BlockProps = { snap: Snap; variant?: Variant };

const DETAIL = 'md:col-span-12';

/* ------------------------------------------------------------------ Tuin */
const GARDEN_ORDER = ['Gepland', 'Gezaaid', 'Groeiend', 'Oogstbaar', 'Geoogst', 'Afgerond'];

export const GardenBlock: React.FC<BlockProps> = ({ snap, variant = 'summary' }) => {
  const g = snap?.garden;
  const status = statusOf(snap, g?.meta, 14, !!g && g.total > 0);
  const detail = variant === 'detail';
  return (
    <DashboardBlock
      testId="block-garden"
      title="Tuin"
      accent="green"
      status={status}
      notice={noticeOf('Garden Crops', status, g?.meta)}
      className={detail ? DETAIL : 'md:col-span-6 xl:col-span-5'}
      footer={foot('Notion Garden Crops', g?.meta)}
      to={detail ? undefined : '/dashboard/tuin'}
    >
      {!g || g.total === 0 ? (
        <EmptyState title="Geen gewassen gevonden" hint="Voeg gewassen toe aan Garden Crops in Notion." />
      ) : detail ? (
        <div className="space-y-7">
          <StatGrid>
            <Stat label="Gewassen" value={g.total} size="lg" />
            <Stat label="Groeiend" value={g.counts['Groeiend'] ?? 0} tone="good" size="lg" />
            <Stat label="Oogstbaar" value={g.harvestable} tone={g.harvestable ? 'good' : 'default'} size="lg" />
          </StatGrid>
          <div>
            <SectionLabel>Verdeling per status</SectionLabel>
            <ul className="space-y-3.5">
              {GARDEN_ORDER.map((s) => {
                const n = g.counts[s] ?? 0;
                const pct = g.total ? (n / g.total) * 100 : 0;
                return (
                  <li key={s} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-4 text-sm">
                    <span className="text-white/90">{s}</span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                      <span className="block h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="text-right font-semibold tabular-nums text-white">{n}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <StatGrid>
            <Stat label="Gewassen" value={g.total} />
            <Stat label="Groeiend" value={g.counts['Groeiend'] ?? 0} tone="good" />
            <Stat label="Oogstbaar" value={g.harvestable} tone={g.harvestable ? 'good' : 'default'} />
          </StatGrid>
          <ul className="grid grid-cols-2 gap-3">
            {GARDEN_ORDER.map((s) => (
              <li
                key={s}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/90"
              >
                <span>{s}</span>
                <span className="font-semibold tabular-nums text-white">{g.counts[s] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardBlock>
  );
};

/* ---------------------------------------------------------------- Taken */
export const TasksBlock: React.FC<BlockProps> = ({ snap, variant = 'summary' }) => {
  const t = snap?.tasks;
  const status = statusOf(snap, t?.meta, 1, !!t);
  const detail = variant === 'detail';
  return (
    <DashboardBlock
      testId="block-tasks"
      title="Taken (Todoist)"
      accent="pink"
      status={status}
      notice={noticeOf('Todoist', status, t?.meta)}
      className={detail ? DETAIL : 'md:col-span-6 xl:col-span-4'}
      footer={foot('Todoist', t?.meta) + (t ? ` · week vanaf ${formatDateNl(t.weekStart)}` : '')}
      to={detail ? undefined : '/dashboard/taken'}
    >
      {!t ? (
        <EmptyState title="Nog geen takendata" hint="Genereer dashboard-snapshot.json (zie docs/DASHBOARD.md)." />
      ) : (
        <div className="space-y-6">
          <StatGrid>
            <Stat label="Vandaag" value={t.today} size={detail ? 'lg' : 'md'} />
            <Stat label="Achterstallig" value={t.overdue} tone={t.overdue ? 'warn' : 'good'} size={detail ? 'lg' : 'md'} />
            <Stat label="Afgevinkt (week)" value={t.completedThisWeek} tone="good" size={detail ? 'lg' : 'md'} />
          </StatGrid>
          {detail && (
            <p className="text-sm leading-relaxed text-white/75">
              {t.overdue > 0
                ? `Je hebt ${t.overdue} achterstallige ${t.overdue === 1 ? 'taak' : 'taken'}: werk die eerst weg.`
                : 'Geen achterstallige taken.'}{' '}
              Vandaag staan er {t.today} {t.today === 1 ? 'taak' : 'taken'} gepland; deze week heb je er al{' '}
              {t.completedThisWeek} afgevinkt.
            </p>
          )}
        </div>
      )}
    </DashboardBlock>
  );
};

/* -------------------------------------------------------------- Workouts */
export const WorkoutsBlock: React.FC<BlockProps> = ({ snap, variant = 'summary' }) => {
  const w = snap?.workouts;
  const status = statusOf(snap, w?.meta, 7, !!w && w.totalLogged > 0);
  const detail = variant === 'detail';
  const max = Math.max(1, ...(w?.sessionsPerWeek.map((s) => s.count) ?? [1]));
  const shortWeek = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' }).replace('.', '');

  const planned = w?.nextPlanned ? (
    <p className="text-sm leading-relaxed text-white/80">
      <span className="text-white/65">Gepland:</span> <span className="font-medium text-white">{w.nextPlanned.title}</span> ·{' '}
      {formatDateNl(w.nextPlanned.due)}
    </p>
  ) : null;

  return (
    <DashboardBlock
      testId="block-workouts"
      title="Workouts"
      accent="violet"
      status={status}
      notice={noticeOf('Workout-log', status, w?.meta)}
      className={detail ? DETAIL : 'md:col-span-6 xl:col-span-4'}
      footer={foot('Notion Workout-log', w?.meta)}
      to={detail ? undefined : '/dashboard/workouts'}
    >
      {!w || w.totalLogged === 0 ? (
        <div className="space-y-5">
          <EmptyState
            title="Nog geen sessies in de Workout-log"
            hint="Log een sessie in Notion (Workout-log) en draai de export."
          />
          {planned}
        </div>
      ) : (
        <div className="space-y-6">
          <StatGrid>
            <Stat label="Streak (weken)" value={w.streakWeeks} tone={w.streakWeeks ? 'good' : 'default'} size={detail ? 'lg' : 'md'} />
            <Stat label="Totaal gelogd" value={w.totalLogged} size={detail ? 'lg' : 'md'} />
          </StatGrid>
          <div>
            <SectionLabel>Sessies per week</SectionLabel>
            <div className={`flex items-end gap-2 ${detail ? 'h-40' : 'h-24'}`} role="img" aria-label="Sessies per week">
              {w.sessionsPerWeek.map((s) => (
                <div key={s.weekStart} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-xs font-semibold tabular-nums text-white/85">{s.count || ''}</span>
                  <span
                    className={`w-full rounded-t ${s.count ? 'bg-violet-400' : 'bg-white/15'}`}
                    style={{ height: `${Math.max((s.count / max) * 100, 4)}%` }}
                  />
                </div>
              ))}
            </div>
            {detail && (
              <div className="mt-2 flex gap-2">
                {w.sessionsPerWeek.map((s) => (
                  <span key={s.weekStart} className="flex-1 text-center text-xs text-white/65">
                    {shortWeek(s.weekStart)}
                  </span>
                ))}
              </div>
            )}
          </div>
          {w.lastSession && (
            <p className="text-sm leading-relaxed text-white/80">
              <span className="text-white/65">Laatste:</span> <span className="font-medium text-white">{w.lastSession.title}</span>
              {w.lastSession.type ? ` (${w.lastSession.type})` : ''} · {formatDateNl(w.lastSession.date)}
            </p>
          )}
          {planned}
        </div>
      )}
    </DashboardBlock>
  );
};

/* -------------------------------------------- Stemming / water / slaap */
const shortDay = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('nl-BE', { weekday: 'short' }).replace('.', '');

type Key = 'mood' | 'waterL' | 'sleepH';

export const MoodBlock: React.FC<BlockProps> = ({ snap, variant = 'summary' }) => {
  const m = snap?.mood;
  const days = m?.days ?? [];
  const detail = variant === 'detail';
  const has = (k: Key) => days.some((d) => d[k] != null);
  const anyData = has('mood') || has('waterL') || has('sleepH');
  const status = statusOf(snap, m?.meta, 3, anyData);
  const lk = m?.lastKnown;
  const labels = days.map((d) => shortDay(d.date));

  const rows: {
    key: Key;
    label: string;
    unit: string;
    stroke: string;
    min?: number;
    max?: number;
    target?: number | null;
    last?: { date: string; value: number } | null;
  }[] = [
    { key: 'mood', label: 'Stemming (1-5)', unit: '', stroke: '#f472b6', min: 1, max: 5, last: lk?.mood },
    { key: 'waterL', label: 'Water (L)', unit: ' L', stroke: '#38bdf8', min: 0, target: m?.waterGoalL ?? null, last: lk?.water },
    { key: 'sleepH', label: 'Slaap (uur)', unit: ' u', stroke: '#a78bfa', min: 0, max: 10, last: lk?.sleep },
  ];

  const rowEl = (r: (typeof rows)[number]) => {
    const vals = days.map((d) => d[r.key]);
    const present = vals.filter((v): v is number => v != null);
    const latest = present.length ? present[present.length - 1] : null;
    return (
      <div
        key={r.key}
        data-testid={`spark-${r.key}`}
        className={detail ? 'rounded-xl border border-white/10 bg-white/[0.04] p-5' : ''}
      >
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-white/90">{r.label}</span>
          <span className="text-base font-semibold tabular-nums text-white">{latest != null ? `${latest}${r.unit}` : '–'}</span>
        </div>
        {present.length > 0 ? (
          <Sparkline
            values={vals}
            stroke={r.stroke}
            min={r.min}
            max={r.max}
            target={r.target}
            labels={labels}
            label={`${r.label} laatste 7 dagen`}
          />
        ) : (
          <p className="rounded-lg border border-dashed border-white/25 px-3.5 py-3 text-sm leading-relaxed text-white/70">
            Geen metingen de laatste 7 dagen
            {r.last ? ` · laatst: ${r.last.value}${r.unit} op ${formatDateNl(r.last.date)}` : ''}
          </p>
        )}
      </div>
    );
  };

  return (
    <DashboardBlock
      testId="block-mood"
      title={detail ? 'Stemming · water · slaap (7 dagen)' : 'Welzijn (7 dagen)'}
      accent="cyan"
      status={status}
      notice={noticeOf('Life Day', status, m?.meta)}
      className={detail ? DETAIL : 'md:col-span-6 xl:col-span-4'}
      footer={foot('Notion Life Day / Life Entry', m?.meta)}
      to={detail ? undefined : '/dashboard/welzijn'}
    >
      {detail ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">{rows.map(rowEl)}</div>
          {!anyData && (
            <EmptyState title="Nog geen recente check-ins" hint="Log stemming/water via life_capture.py (workflow-os) of Notion." />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {rows.map(rowEl)}
          {!anyData && (
            <EmptyState title="Nog geen recente check-ins" hint="Log stemming/water via life_capture.py (workflow-os) of Notion." />
          )}
        </div>
      )}
    </DashboardBlock>
  );
};
