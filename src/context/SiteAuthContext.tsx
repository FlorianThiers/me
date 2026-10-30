import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type SiteAuthState = {
  loading: boolean;
  authenticated: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const SiteAuthContext = createContext<SiteAuthState | null>(null);

async function fetchMe(): Promise<{ authenticated: boolean; configured: boolean }> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) {
    return { authenticated: false, configured: false };
  }
  return (await res.json()) as { authenticated: boolean; configured: boolean };
}

export const SiteAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);

  const refresh = useCallback(async () => {
    const me = await fetchMe();
    setAuthenticated(me.authenticated);
    setConfigured(me.configured);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      return { ok: false, error: data.error || 'Login failed' };
    }
    await refresh();
    return { ok: true };
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ loading, authenticated, configured, refresh, login, logout }),
    [loading, authenticated, configured, refresh, login, logout],
  );

  return <SiteAuthContext.Provider value={value}>{children}</SiteAuthContext.Provider>;
};

export function useSiteAuth(): SiteAuthState {
  const ctx = useContext(SiteAuthContext);
  if (!ctx) {
    throw new Error('useSiteAuth must be used within SiteAuthProvider');
  }
  return ctx;
}
