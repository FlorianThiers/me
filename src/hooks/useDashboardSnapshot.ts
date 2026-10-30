import { useEffect, useState } from 'react';
import type { DashboardSnapshot } from '../types/dashboardSnapshot';
import { fetchPrivateJson } from '../lib/privateFetch';

export type DashboardSnapshotState = {
  snapshot: DashboardSnapshot | null;
  loading: boolean;
  /** true when only example/demo snapshot is available. */
  usingExample: boolean;
};

/**
 * Loads dashboard snapshot via authenticated API (never from public static files).
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
      const result = await fetchPrivateJson<DashboardSnapshot>('/api/private/dashboard-snapshot');
      if (cancelled) return;
      if (result.ok) {
        const usingExample = !!result.data.isDemo;
        setState({ snapshot: result.data, loading: false, usingExample });
      } else {
        setState({ snapshot: null, loading: false, usingExample: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}
