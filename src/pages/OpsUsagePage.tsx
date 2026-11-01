import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gauge, RefreshCw } from 'lucide-react';
import { useOpsUsage } from '../hooks/useOpsUsage';
import { OrbitPanel } from '../components/orbit/OrbitPanel';
import { UsageGaugeClock } from '../components/opsUsage/UsageGaugeClock';
import { UsageBarList, UsageDailyChart } from '../components/opsUsage/UsageCharts';

export const OpsUsagePage: React.FC = () => {
  const { data, loading, error, isDemo, reload } = useOpsUsage();

  return (
    <div className="relative min-h-screen pb-16">
      <div className="container-custom px-4 py-8 max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-orbit-cyan mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-7 h-7 text-orbit-cyan" />
                <span className="text-[10px] uppercase tracking-widest text-orbit-violet/80">Ops</span>
              </div>
              <h1 className="text-3xl font-bold text-white">Usage & limieten</h1>
              <p className="text-white/60 text-sm mt-2 max-w-2xl">
                Cursor-maandcyclus (reset op de 27e) en Grok Bot-weeklimiet (reset vrijdag 06:55,
                Europe/Brussels). Prognose = huidig + gemiddelde per dag sinds reset × resterende dagen.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void reload()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs border border-white/10 text-orbit-cyan hover:border-neon-green/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Vernieuwen
            </button>
          </div>
        </motion.div>

        {isDemo && data && (
          <p className="text-xs text-amber-200/90 border-l-2 border-amber-400/50 pl-3">
            Voorbeelddata — geen echte usage. Live exports in{' '}
            <code className="text-amber-100/80">private-data/ops-usage/</code> (gitignored).
          </p>
        )}

        {loading && !data && <p className="text-sm text-white/50">Usage laden…</p>}
        {error === 'unauthorized' && (
          <p className="text-sm text-rose-300">Sessie verlopen — log opnieuw in.</p>
        )}
        {error === 'load_failed' && (
          <p className="text-sm text-rose-300">Kon usage-data niet laden.</p>
        )}

        {data && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <UsageGaugeClock
                title={data.cursor.label}
                currentPct={data.cursor.currentPct}
                forecastPct={data.cursor.forecastPct}
                warningLevel={data.cursor.warningLevel}
                resetLabel={data.cursor.resetLabel}
                detail={`${data.cursor.tokensUsedInCycle.toLocaleString('nl-BE')} / ${data.cursor.monthlyTokenLimit.toLocaleString('nl-BE')} tokens in cyclus`}
              />
              <UsageGaugeClock
                title={data.grok.label}
                currentPct={data.grok.currentPct}
                forecastPct={data.grok.forecastPct}
                warningLevel={data.grok.warningLevel}
                resetLabel={data.grok.resetLabel}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <OrbitPanel title="Cursor — per dag" titleClassName="text-orbit-cyan">
                <UsageDailyChart
                  title="Tokens per dag (cyclus)"
                  points={data.cursor.dailyUsage}
                  stroke="#22d3ee"
                  valueLabel="Cursor tokens per dag"
                />
              </OrbitPanel>
              <OrbitPanel title="Grok — per dag" titleClassName="text-neon-green">
                <UsageDailyChart
                  title="Weeklimiet % per logdag"
                  points={data.grok.dailyUsage}
                  stroke="#a78bfa"
                  valueLabel="Grok weeklimiet percentage"
                />
              </OrbitPanel>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <OrbitPanel title="Per bot / model" titleClassName="text-orbit-violet">
                <UsageBarList title="Cursor (model)" items={data.cursor.byBot} valueSuffix=" tok" />
                <div className="mt-6 pt-4 border-t border-white/10">
                  <UsageBarList title="Grok (bot)" items={data.grok.byBot} />
                </div>
              </OrbitPanel>
              <OrbitPanel title="Per routine / kind" titleClassName="text-orbit-cyan">
                <UsageBarList title="Cursor (Kind)" items={data.cursor.byRoutine} valueSuffix=" tok" />
                <div className="mt-6 pt-4 border-t border-white/10">
                  <UsageBarList title="Grok (routine)" items={data.grok.byRoutine} />
                </div>
              </OrbitPanel>
              <OrbitPanel title="Grok bots — tabel" titleClassName="text-neon-green">
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-white/45 border-b border-white/10">
                        <th className="py-2 px-2 font-medium">Bot</th>
                        <th className="py-2 px-2 font-medium text-right">Uses</th>
                        <th className="py-2 px-2 font-medium text-right">Aandeel</th>
                        <th className="py-2 px-2 font-medium text-right">Laatst</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.grok.bots.map((bot) => (
                        <tr key={bot.name} className="border-b border-white/5 text-white/75">
                          <td className="py-2 px-2">{bot.name}</td>
                          <td className="py-2 px-2 text-right tabular-nums">{bot.totalUses}</td>
                          <td className="py-2 px-2 text-right tabular-nums">{bot.sharePct}%</td>
                          <td className="py-2 px-2 text-right text-white/45">{bot.lastSeen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </OrbitPanel>
            </div>

            <p className="text-[11px] text-white/35">
              Laatste build: {new Date(data.generatedAt).toLocaleString('nl-BE')}
              {data.exportNote ? ` · ${data.exportNote}` : ''}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
