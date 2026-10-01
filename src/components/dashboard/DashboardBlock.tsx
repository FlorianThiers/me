import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Freshness } from '../../lib/dashboardFreshness';

export type BlockStatus = Freshness | 'empty';

/* Alle tekst op #0a0a0a: wit/85+ (>= 14:1), wit/70 (>= 9:1), wit/60 (>= 7:1) -> ruim boven WCAG AA (4.5:1). */
const PILL: Record<BlockStatus, { text: string; cls: string }> = {
  live: { text: 'Actueel', cls: 'border-emerald-400/50 text-emerald-300 bg-emerald-400/10' },
  demo: { text: 'DEMO', cls: 'border-amber-400/60 text-amber-200 bg-amber-400/10' },
  stale: { text: 'Verouderd', cls: 'border-orange-400/60 text-orange-200 bg-orange-400/10' },
  unknown: { text: 'Verouderd?', cls: 'border-orange-400/60 text-orange-200 bg-orange-400/10' },
  empty: { text: 'Leeg', cls: 'border-white/25 text-white/70 bg-white/5' },
};

export const StatusPill: React.FC<{ status: BlockStatus }> = ({ status }) => (
  <span
    data-status={status}
    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${PILL[status].cls}`}
  >
    {PILL[status].text}
  </span>
);

export type Accent = 'green' | 'cyan' | 'pink' | 'violet' | 'amber';
const ACCENT: Record<Accent, string> = {
  green: 'bg-emerald-400',
  cyan: 'bg-sky-400',
  pink: 'bg-pink-400',
  violet: 'bg-violet-400',
  amber: 'bg-amber-400',
};

type Props = {
  title: string;
  status?: BlockStatus;
  /** Korte bronregel onderaan (bv. "bron: Todoist · 1 okt 2026"). */
  footer?: string;
  /** Extra waarschuwing bovenaan (DEMO / verouderd). */
  notice?: string;
  className?: string;
  accent?: Accent;
  /** Optionele "Details"-link (overzicht -> detailpagina). */
  to?: string;
  children: React.ReactNode;
  testId: string;
};

/** Kaart met nette flex-header: accentbalkje + witte titel links, statuspil rechts. */
export const DashboardBlock: React.FC<Props> = ({
  title,
  status,
  footer,
  notice,
  className = '',
  accent = 'cyan',
  to,
  children,
  testId,
}) => (
  <section
    data-testid={testId}
    aria-label={title}
    className={`flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7 ${className}`}
  >
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`h-6 w-1.5 shrink-0 rounded-full ${ACCENT[accent]}`} aria-hidden="true" />
        <h2 className="truncate text-lg font-semibold tracking-tight text-white">{title}</h2>
      </div>
      {status && <StatusPill status={status} />}
    </header>
    {notice && (
      <p
        role="note"
        className="mb-6 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3.5 py-2.5 text-sm leading-relaxed text-amber-100"
      >
        {notice}
      </p>
    )}
    <div className="flex-1">{children}</div>
    {(footer || to) && (
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/10 pt-4">
        {footer ? <p className="text-xs leading-relaxed text-white/60">{footer}</p> : <span />}
        {to && (
          <Link
            to={to}
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-sky-300 hover:text-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            Details <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </footer>
    )}
  </section>
);

export const EmptyState: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
  <div className="rounded-xl border border-dashed border-white/25 bg-white/[0.02] px-5 py-6 text-center">
    <p className="text-sm font-medium text-white/90">{title}</p>
    {hint && <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-white/65">{hint}</p>}
  </div>
);

export const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'warn' | 'good';
  hint?: string;
  size?: 'md' | 'lg';
}> = ({ label, value, tone = 'default', hint, size = 'md' }) => (
  <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
    <div
      className={`font-bold leading-none tabular-nums ${size === 'lg' ? 'text-4xl' : 'text-3xl'} ${
        tone === 'warn' ? 'text-amber-300' : tone === 'good' ? 'text-emerald-300' : 'text-white'
      }`}
    >
      {value}
    </div>
    <div className="mt-2 text-sm font-medium leading-snug text-white/75">{label}</div>
    {hint && <div className="mt-0.5 text-xs text-white/60">{hint}</div>}
  </div>
);

/** Kleine sectiekop binnen een kaart. */
export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/70">{children}</h3>
);

/** Responsieve auto-fit grid voor Stat-tegels binnen een kaart (past zich aan de kaartbreedte aan). */
export const StatGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-4">{children}</div>
);

/** 12-koloms grid (vanaf md): blokken geven zelf md:/xl:col-span-* mee. */
export const DashboardGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-12" data-testid="dashboard-grid">
    {children}
  </div>
);
