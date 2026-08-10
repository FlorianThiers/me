import { useEffect, useState } from 'react';
import type { HomeStockSnapshot } from '../types/homeStock';

export function useHomeStock() {
  const [snapshot, setSnapshot] = useState<HomeStockSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/data/home-stock.json');
        if (!res.ok) throw new Error(`${res.status}`);
        const data = (await res.json()) as HomeStockSnapshot;
        if (!cancelled) {
          setSnapshot(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('load_failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    snapshot,
    loading,
    error,
    isDemo: snapshot?.isDemo ?? true,
    isLive: snapshot != null && !snapshot.isDemo,
  };
}
