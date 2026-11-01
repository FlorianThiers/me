import { useEffect, useState } from 'react';
import type { OpsUsagePayload } from '../types/opsUsage';
import { fetchPrivateJson } from '../lib/privateFetch';

export function useOpsUsage() {
  const [data, setData] = useState<OpsUsagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const result = await fetchPrivateJson<OpsUsagePayload>('/api/private/ops-usage');
    if (result.ok) {
      setData(result.data);
      setError(null);
    } else if (result.status === 401) {
      setError('unauthorized');
    } else {
      setError('load_failed');
    }
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  return {
    data,
    loading,
    error,
    isDemo: data?.isDemo ?? true,
    reload,
  };
}
