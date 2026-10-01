import { useEffect, useState } from 'react';
import type { DashboardSnapshot } from '../types/dashboardSnapshot';

export type DashboardSnapshotState = {
  snapshot: DashboardSnapshot | null;
  loading: boolean;
  /** true als het echte (lokale, gitignored) bestand ontbrak en het voorbeeldbestand wordt getoond. */
  usingExample: boolean;
};

async function fetchSnapshot(url: string): Promise<DashboardSnapshot | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    // Vite's SPA-fallback geeft index.html met 200 terug als het bestand ontbreekt -> JSON-parse faalt.
    const data = (await res.json()) as DashboardSnapshot;
    return data && data.schemaVersion === 1 ? data : null;
  } catch {
    return null;
  }
}

/**
 * Leest public/data/dashboard-snapshot.json (lokaal gegenereerd, NIET gecommit).
 * Ontbreekt die, dan valt het terug op dashboard-snapshot.example.json (altijd isDemo).
 */
export function useDashboardSnapshot(enabled: boolean): DashboardSnapshotState {
  const [state, setState] = useState<DashboardSnapshotState>({
    snapshot: null,
    loading: enabled,
    usingExample: false,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const real = await fetchSnapshot('/data/dashboard-snapshot.json');
      const snapshot = real ?? (await fetchSnapshot('/data/dashboard-snapshot.example.json'));
      if (!cancelled) setState({ snapshot, loading: false, usingExample: !real && !!snapshot });
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}
