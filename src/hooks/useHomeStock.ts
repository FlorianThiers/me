import { useEffect, useState } from 'react';
import type { HomeStockSnapshot } from '../types/homeStock';
import { fetchPrivateJson } from '../lib/privateFetch';

export function useHomeStock() {
  const [snapshot, setSnapshot] = useState<HomeStockSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchPrivateJson<HomeStockSnapshot>('/api/private/home-stock');
      if (cancelled) return;
      if (result.ok) {
        setSnapshot(result.data);
        setError(null);
      } else if (result.status === 401) {
        setError('unauthorized');
      } else {
        setError('load_failed');
      }
      setLoading(false);
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
