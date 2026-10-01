import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useHomeStock } from '../../hooks/useHomeStock';
import { useDashboardSnapshot } from '../../hooks/useDashboardSnapshot';
import { formatDateNl } from '../../lib/dashboardFreshness';
import type { DashboardData } from './dashboardContext';
import { DASHBOARD_NAV } from './dashboardNav';

const TITLES: Record<string, string> = {
  '/dashboard': 'Overzicht',
  '/dashboard/voorraad': 'Voorraad',
  '/dashboard/taken': 'Taken',
  '/dashboard/workouts': 'Workouts',
  '/dashboard/tuin': 'Tuin',
  '/dashboard/welzijn': 'Welzijn',
};

/**
 * Lokaal persoonlijk dashboard: sidenav (links; inklapbaar op mobiel) + sub-pagina's via <Outlet/>.
 * Data wordt hier één keer geladen en via outlet-context gedeeld (zie dashboardContext.ts).
 */
export const DashboardLayout: React.FC = () => {
  const { snapshot: homeStock } = useHomeStock();
  const { snapshot, loading, usingExample } = useDashboardSnapshot(true);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/dashboard';
  const title = TITLES[path] ?? 'Dashboard';

  // Menu sluit na navigeren (mobiel).
  useEffect(() => setOpen(false), [pathname]);

  const data: DashboardData = { homeStock, snapshot, usingExample };

  const nav = (
    <ul className="space-y-1.5">
      {DASHBOARD_NAV.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 ${
                isActive ? 'bg-sky-400/15 text-white ring-1 ring-sky-400/40' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-dark-bg pt-16" data-testid="dashboard-page">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col md:flex-row">
        {/* Mobiel: balk met menuknop */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden">
          <span className="text-base font-semibold text-white">Dashboard · {title}</span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="dashboard-sidenav"
            aria-label={open ? 'Sluit dashboardmenu' : 'Open dashboardmenu'}
            className="rounded-lg border border-white/20 p-2 text-white hover:bg-white/10"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <aside
          id="dashboard-sidenav"
          data-testid="dashboard-sidenav"
          className={`${open ? 'block' : 'hidden'} border-b border-white/10 px-4 py-5 md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)] md:w-60 md:shrink-0 md:self-start md:overflow-y-auto md:border-b-0 md:border-r md:px-5 md:py-8`}
        >
          <p className="mb-4 hidden px-3.5 text-xs font-semibold uppercase tracking-wider text-white/65 md:block">Dashboards</p>
          <nav aria-label="Dashboard">{nav}</nav>
          <p className="mt-8 hidden px-3.5 text-xs leading-relaxed text-white/60 md:block">Alleen lokaal · niet publiek</p>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Persoonlijk dashboard (lokaal) ·{' '}
              {snapshot ? `Snapshot van ${formatDateNl(snapshot.generatedAt)}` : loading ? 'Laden…' : 'Geen snapshot gevonden'}
              {snapshot?.exportNote ? ` · ${snapshot.exportNote}` : ''}
            </p>
            {usingExample && (
              <p
                role="note"
                className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100"
                data-testid="example-banner"
              >
                dashboard-snapshot.json ontbreekt: je ziet voorbeelddata (DEMO). Genereer je eigen snapshot met{' '}
                <code className="rounded bg-black/30 px-1.5 py-0.5 text-amber-50">python scripts/export_dashboard_snapshot.py</code>.
              </p>
            )}
          </header>
          <Outlet context={data} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
