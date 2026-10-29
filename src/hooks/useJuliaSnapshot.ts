import { useCallback, useEffect, useRef, useState } from 'react';
import type { JuliaSnapshot } from '../types/juliaSnapshot';
import { demoSnapshot } from '../data/juliaDemoBriefing';

const LIVE_MAX_AGE_MS = 36 * 60 * 60 * 1000;
const SNAPSHOT_URL = '/data/julia-snapshot.json';

type Options = {
  /** Poll for updates (e.g. 60000 on /orbit after gm export). */
  pollIntervalMs?: number;
};

async function loadSnapshot(bustCache: boolean): Promise<JuliaSnapshot | null> {
  const url = bustCache ? `${SNAPSHOT_URL}?t=${Date.now()}` : SNAPSHOT_URL;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as JuliaSnapshot;
  if (data?.date && !data.isDemo) return data;
  return null;
}

export function useJuliaSnapshot(options: Options = {}) {
  const { pollIntervalMs = 0 } = options;
  const [snapshot, setSnapshot] = useState<JuliaSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastKeyRef = useRef<string | null>(null);

  const applySnapshot = useCallback((data: JuliaSnapshot | null, initial: boolean) => {
    if (!data) {
      if (initial) setLoading(false);
      return;
    }
    const key = data.generatedAt + '|' + data.date + '|' + (data.router?.agentQueue?.length ?? 0);
    if (key === lastKeyRef.current && !initial) return;
    lastKeyRef.current = key;
    setSnapshot(data);
    setError(false);
    if (initial) setLoading(false);
  }, []);

  const refresh = useCallback(
    async (initial: boolean) => {
      if (!initial) setIsRefreshing(true);
      try {
        const data = await loadSnapshot(!initial);
        applySnapshot(data, initial);
      } catch {
        if (initial) {
          setError(true);
          setLoading(false);
        }
      } finally {
        if (!initial) setIsRefreshing(false);
      }
    },
    [applySnapshot]
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refresh(true);
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs < 5000) return undefined;
    const id = window.setInterval(() => {
      void refresh(false);
    }, pollIntervalMs);
    return () => window.clearInterval(id);
  }, [pollIntervalMs, refresh]);

  useEffect(() => {
    const onFocus = () => {
      void refresh(false);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

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
    isRefreshing,
    refresh: () => refresh(false),
  };
}
