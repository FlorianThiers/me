import { useEffect, useState } from 'react';
import type { JuliaSnapshot } from '../types/juliaSnapshot';
import { demoSnapshot } from '../data/juliaDemoBriefing';

const LIVE_MAX_AGE_MS = 36 * 60 * 60 * 1000;

export function useJuliaSnapshot() {
  const [snapshot, setSnapshot] = useState<JuliaSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/julia-snapshot.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: JuliaSnapshot | null) => {
        if (cancelled) return;
        if (data && data.date && !data.isDemo) {
          setSnapshot(data);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
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
