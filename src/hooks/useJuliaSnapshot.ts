import { useEffect, useState } from 'react';
import type { JuliaSnapshot } from '../types/juliaSnapshot';
import { demoSnapshot } from '../data/juliaDemoBriefing';
import { fetchPrivateJson } from '../lib/privateFetch';

const LIVE_MAX_AGE_MS = 36 * 60 * 60 * 1000;

export function useJuliaSnapshot() {
  const [snapshot, setSnapshot] = useState<JuliaSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchPrivateJson<JuliaSnapshot>('/api/private/julia-snapshot');
      if (cancelled) return;
      if (result.ok && result.data.date && !result.data.isDemo) {
        setSnapshot(result.data);
      }
      if (!result.ok && result.status !== 401) {
        setError(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const active = snapshot ?? demoSnapshot;
  const isLive =
    !!snapshot &&
    !snapshot.isDemo &&
    Date.now() - new Date(snapshot.generatedAt).getTime() < LIVE_MAX_AGE_MS;

  return {
    snapshot: active,
    isLive,
    isDemo: !snapshot || snapshot.isDemo,
    loading,
    error,
  };
}
