import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useJuliaSnapshot } from '../hooks/useJuliaSnapshot';
import { OrbitBadge } from '../components/orbit/OrbitBadge';
import { OrbitPanel } from '../components/orbit/OrbitPanel';
import type { JuliaRouterLane, JuliaRouterQueueItem } from '../types/juliaSnapshot';

type NavLink = { label: string; href: string; external?: boolean };

const SIDEBAR_SECTIONS: { title: string; links: NavLink[] }[] = [
  {
    title: 'Today',
    links: [
      { label: 'Julia hub', href: '/julia' },
      { label: 'Life rhythm', href: '/life-rhythm' },
      { label: 'Todoist today', href: 'https://app.todoist.com/app/today', external: true },
    ],
  },
  {
    title: 'Lanes',
    links: [
      { label: 'Servelec (E-stock)', href: 'https://app.notion.com/p/a25bb6cffa83820e818f811e86993a0e', external: true },
      { label: 'Urban Culture FF', href: 'https://www.notion.so/388bb6cffa8380b986ece468308fecd6', external: true },
      { label: 'Vijver / MySpace FF', href: 'https://www.notion.so/393bb6cffa83803d83d8f67207b5e547', external: true },
      { label: 'Planning tasks', href: 'https://www.notion.so/a1d362df42c742aba62c0f8da68208b4', external: true },
    ],
  },
  {
    title: 'Agents',
    links: [{ label: 'Orbit router run (vault)', href: 'https://github.com/FlorianThiers/workflow-os/blob/main/Agents/active/run-2026-09-28-orbit-router-v0.md', external: true }],
  },
];

function NavItem({ link }: { link: NavLink }) {
  const className =
    'block text-sm text-white/75 hover:text-neon-cyan transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5';
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        <span className="inline-flex items-center gap-1.5">
          {link.label}
          <ExternalLink className="w-3 h-3 opacity-60" />
        </span>
      </a>
    );
  }
  return (
    <Link to={link.href} className={className}>
      {link.label}
    </Link>
  );
}

function LaneRow({ lane }: { lane: JuliaRouterLane }) {
  const statusColor =
    lane.status === 'active' ? 'text-neon-green' : lane.status === 'waiting' ? 'text-amber-300/90' : 'text-white/45';
  return (
    <li className="border border-white/10 rounded-xl p-3 bg-dark-secondary/40">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-white font-medium text-sm">{lane.label}</span>
        <span className={`text-[10px] uppercase tracking-wider ${statusColor}`}>{lane.status}</span>
      </div>
      <p className="text-white/70 text-xs leading-relaxed">{lane.focus}</p>
    </li>
  );
}

function QueueRow({ item }: { item: JuliaRouterQueueItem }) {
  return (
    <li className="text-sm border-l-2 border-orbit-violet/50 pl-3 py-1">
      <div className="flex gap-2 items-baseline">
        <span className="text-neon-blue text-xs font-mono">{item.priority}</span>
        <span className="text-white/90">{item.title}</span>
      </div>
      {item.nextAction ? <p className="text-white/55 text-xs mt-1">{item.nextAction}</p> : null}
    </li>
  );
}

const ORBIT_POLL_MS = 60_000;

export const OrbitRouterPage: React.FC = () => {
  const { snapshot, isLive, loading, isRefreshing, refresh } = useJuliaSnapshot({
    pollIntervalMs: ORBIT_POLL_MS,
  });
  const router = snapshot.router;

  const generatedLabel = snapshot.generatedAt
    ? new Date(snapshot.generatedAt).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '—';

  return (
    <div className="min-h-screen pb-16">
      <div className="container-custom px-4 py-8 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Orbit Router</h1>
            <p className="text-white/60 text-sm mt-1">
              Mission control · {snapshot.date}
              <span className="text-white/40">
                {' '}
                · snapshot {generatedLabel}
                {isRefreshing ? ' · updating…' : ''}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refresh()}
              className="text-xs text-white/50 hover:text-neon-cyan border border-white/10 rounded-lg px-2 py-1"
            >
              Refresh
            </button>
            <OrbitBadge isLive={isLive} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-6 items-start">
          <aside className="lg:sticky lg:top-24 space-y-4">
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.title} className="rounded-2xl border border-orbit-violet/20 bg-orbit-surface p-3">
                <h2 className="text-[10px] uppercase tracking-[0.18em] text-violet-200/70 mb-2 px-2">{section.title}</h2>
                <nav className="flex flex-col">
                  {section.links.map((link) => (
                    <NavItem key={link.label} link={link} />
                  ))}
                </nav>
              </div>
            ))}
          </aside>

          <div className="space-y-6">
            {loading ? <p className="text-white/40 text-sm">Loading snapshot…</p> : null}

            <OrbitPanel title="Work top 3" titleClassName="text-neon-green">
              <ul className="space-y-2">
                {snapshot.workTop3.map((item) => (
                  <li key={item} className="text-white/85 text-sm flex gap-2">
                    <span className="text-neon-green">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </OrbitPanel>

            <OrbitPanel title="Lanes" titleClassName="text-violet-300">
              {router?.lanes?.length ? (
                <ul className="space-y-2">{router.lanes.map((lane) => <LaneRow key={lane.id} lane={lane} />)}</ul>
              ) : (
                <p className="text-white/50 text-sm">Vul lane-regels in day-log (During the day).</p>
              )}
            </OrbitPanel>

            <OrbitPanel title="Agent queue" titleClassName="text-neon-blue">
              {router?.agentQueue?.length ? (
                <ul className="space-y-3">{router.agentQueue.map((q) => <QueueRow key={q.title + q.priority} item={q} />)}</ul>
              ) : (
                <p className="text-white/50 text-sm">Vul ## Agent queue in workflow-os day-log.</p>
              )}
            </OrbitPanel>

            <div className="grid md:grid-cols-2 gap-4">
              <OrbitPanel title="Active runs" titleClassName="text-white/80">
                <ul className="space-y-2 text-sm">
                  {(router?.activeRuns ?? []).map((run) => (
                    <li key={run.path} className="text-white/75">
                      <span className="text-white/90">{run.title}</span>
                      <span className="block text-[11px] text-white/45 font-mono truncate">{run.path}</span>
                    </li>
                  ))}
                </ul>
              </OrbitPanel>
              <OrbitPanel title="Horizon" titleClassName="text-white/80">
                <p className="text-white/70 text-sm mb-2">{router?.horizons?.weekConstraint ?? snapshot.weekConstraint ?? '—'}</p>
                {router?.horizons?.carryOver?.length ? (
                  <ul className="text-xs text-amber-200/80 list-disc pl-4 space-y-1">
                    {router.horizons.carryOver.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                ) : null}
                <p className="text-white/40 text-xs mt-4">{router?.sessionsHint}</p>
              </OrbitPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
