import { useCallback, useEffect, useState } from 'react';
import { checkAgendaSession, loginAgenda, logoutAgenda } from '../lib/agendaApi';

export function useAgendaSession() {
  const [status, setStatus] = useState<'loading' | 'guest' | 'authed'>('loading');
  const [configured, setConfigured] = useState(true);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await checkAgendaSession();
      setConfigured(result.configured);
      setStatus(result.authenticated ? 'authed' : 'guest');
    } catch {
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (password: string) => {
    await loginAgenda(password);
    setStatus('authed');
  }, []);

  const logout = useCallback(async () => {
    await logoutAgenda();
    setStatus('guest');
  }, []);

  return { status, configured, login, logout, refresh };
}
