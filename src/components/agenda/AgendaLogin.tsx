import React, { useState } from 'react';

type Props = {
  configured: boolean;
  onLogin: (password: string) => Promise<void>;
};

export const AgendaLogin: React.FC<Props> = ({ configured, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onLogin(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login mislukt');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-orbit-surface border border-white/10 rounded-2xl p-8"
      >
        <h1 className="text-2xl font-bold text-white mb-2">Agenda</h1>
        <p className="text-white/55 text-sm mb-6">Privé planning — alleen met wachtwoord.</p>
        {!configured && (
          <p className="text-neon-orange text-sm mb-4">
            Server auth is nog niet geconfigureerd (AGENDA_SESSION_SECRET, AGENDA_PASSWORD).
          </p>
        )}
        <label className="block text-white/70 text-sm mb-2" htmlFor="agenda-password">
          Wachtwoord
        </label>
        <input
          id="agenda-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-white mb-4 focus:outline-none focus:border-orbit-violet/60"
        />
        {error && <p className="text-neon-pink text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full py-2.5 rounded-lg bg-orbit-violet/40 text-white border border-orbit-violet/50 hover:bg-orbit-violet/55 disabled:opacity-40 transition-colors"
        >
          {busy ? 'Bezig…' : 'Inloggen'}
        </button>
      </form>
    </div>
  );
};
