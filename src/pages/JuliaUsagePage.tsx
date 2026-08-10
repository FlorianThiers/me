import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RefreshCw, ArrowLeft, KeyRound } from 'lucide-react';
import { OrbitPanel } from '../components/orbit/OrbitPanel';
import { juliaUsage, setJuliaApiKey, getJuliaApiKey, type UsageProvider } from '../lib/juliaApi';

function statusColor(status: UsageProvider['status']): string {
  switch (status) {
    case 'active':
      return 'text-neon-green';
    case 'exhausted':
      return 'text-rose-300';
    case 'no_key':
      return 'text-white/40';
    default:
      return 'text-orbit-cyan';
  }
}

export const JuliaUsagePage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [storage, setStorage] = useState<'upstash' | 'memory'>('memory');
  const [providers, setProviders] = useState<UsageProvider[]>([]);
  const [keyDraft, setKeyDraft] = useState('');

  const load = useCallback(async () => {
    if (!getJuliaApiKey()) {
      setLoading(false);
      setError(t('julia.usage.needKey'));
      return;
    }
    setLoading(true);
    setError(null);
    const res = await juliaUsage();
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? t('julia.usage.loadFailed'));
      return;
    }
    setDate(res.date ?? '');
    setStorage(res.storage ?? 'memory');
    setProviders(res.providers ?? []);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyDraft.trim()) return;
    setJuliaApiKey(keyDraft);
    setKeyDraft('');
    void load();
  };

  return (
    <div className="relative min-h-screen pb-16">
      <div className="container-custom px-4 py-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link
              to="/julia"
              className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-orbit-cyan mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('julia.usage.back')}
            </Link>
            <h1 className="text-2xl font-bold text-white">{t('julia.usage.title')}</h1>
            <p className="text-white/60 text-sm mt-1">{t('julia.usage.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs border border-white/10 text-orbit-cyan hover:border-neon-green/50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('julia.usage.refresh')}
          </button>
        </div>

        <OrbitPanel title={t('julia.voice.apiKeyToggle')} titleClassName="text-orbit-violet">
          <form onSubmit={onSaveKey} className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[12rem]">
              <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                placeholder={t('julia.voice.apiKeyPlaceholder')}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white/90"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm bg-orbit-violet/30 text-orbit-cyan border border-orbit-cyan/30"
            >
              {t('julia.voice.apiKeySave')}
            </button>
          </form>
        </OrbitPanel>

        {storage === 'memory' && !error && (
          <p className="text-xs text-amber-200/80 border-l-2 border-amber-400/40 pl-3">
            {t('julia.usage.memoryWarning')}
          </p>
        )}

        {error && <p className="text-sm text-rose-300">{error}</p>}

        {date && !error && (
          <p className="text-xs text-white/50">
            {t('julia.usage.dateLabel', { date })} · {t('julia.usage.storage', { mode: storage })}
          </p>
        )}

        <div className="grid gap-4">
          {providers.map((p) => (
            <OrbitPanel key={p.id} title={p.label} titleClassName={statusColor(p.status)}>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-white/50 text-xs">{t('julia.usage.requests')}</p>
                  <p className="text-white/90">
                    {p.requests} / {p.requestLimit}{' '}
                    <span className="text-white/40">({p.requestPct}%)</span>
                  </p>
                  <div className="h-1.5 mt-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-orbit-cyan rounded-full"
                      style={{ width: `${Math.min(p.requestPct, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-white/50 text-xs">{t('julia.usage.tokens')}</p>
                  <p className="text-white/90">
                    {p.tokensIn + p.tokensOut} / {p.tokenLimit}{' '}
                    <span className="text-white/40">({p.tokenPct}%)</span>
                  </p>
                  <div className="h-1.5 mt-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-neon-green rounded-full"
                      style={{ width: `${Math.min(p.tokenPct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-white/40 mt-2 capitalize">
                {t('julia.usage.status')}: {p.status}
                {p.lastError ? ` · ${p.lastError}` : ''}
              </p>
            </OrbitPanel>
          ))}
        </div>
      </div>
    </div>
  );
};
