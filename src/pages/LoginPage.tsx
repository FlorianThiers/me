import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useSiteAuth } from '../context/SiteAuthContext';
import { useNoIndex } from '../hooks/useNoIndex';

export const LoginPage: React.FC = () => {
  useNoIndex(true);
  const { login, authenticated, loading } = useSiteAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const redirect = params.get('redirect') || '/dashboard';

  useEffect(() => {
    if (!loading && authenticated) {
      navigate(redirect, { replace: true });
    }
  }, [loading, authenticated, navigate, redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(password);
    setSubmitting(false);
    if (result.ok) {
      navigate(redirect, { replace: true });
    } else {
      setError(result.error || 'Invalid password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-dark-secondary/80 backdrop-blur-md p-8 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-8 h-8 text-neon-green" />
          <div>
            <h1 className="text-2xl font-bold text-white">Private area</h1>
            <p className="text-sm text-white/55 mt-1">Sign in to open personal pages and data.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-white/70">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="mt-1 w-full rounded-lg bg-dark-bg border border-white/15 px-3 py-2 text-white focus:border-neon-green outline-none"
              required
            />
          </label>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-neon-green/90 hover:bg-neon-green text-dark-bg font-semibold py-2.5 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/45">
          <Link to="/" className="text-orbit-cyan hover:text-neon-green">
            Back to public site
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
