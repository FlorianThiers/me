import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import {
  planningDomains,
  planningHorizons,
  planningActions,
  type Horizon,
  type PlanningDomain,
} from '../data/juliaDemoBriefing';
import type { JuliaSnapshot } from '../types/juliaSnapshot';

type Props = {
  links?: JuliaSnapshot['links'];
};

export const JuliaPlanningHorizons: React.FC<Props> = ({ links }) => {
  const { t } = useTranslation();
  const [horizon, setHorizon] = useState<Horizon>('day');
  const [domain, setDomain] = useState<PlanningDomain>('work');

  const activeCell = `${horizon}.${domain}`;
  const action = planningActions[horizon][domain];
  const actionHref =
    horizon === 'day' && domain === 'work' && links?.todoistToday
      ? links.todoistToday
      : horizon === 'day' && domain === 'sport' && links?.todoistSport
        ? links.todoistSport
        : horizon === 'day' && domain === 'nutrition' && links?.notionLifeDay
          ? links.notionLifeDay
          : horizon === 'day' && domain === 'nutrition' && links?.notionMySpace
            ? links.notionMySpace
            : action.href;

  const isExternal = actionHref.startsWith('http');

  return (
    <div className="bg-orbit-surface border border-white/10 rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-bold text-white mb-2">{t('julia.planning.title')}</h2>
      <p className="text-white/55 text-sm mb-6">{t('julia.planning.subtitle')}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {planningHorizons.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setHorizon(h)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              horizon === h
                ? 'bg-orbit-violet/40 text-white border border-orbit-violet/50'
                : 'bg-black/30 text-white/60 border border-white/10 hover:border-orbit-violet/30'
            }`}
          >
            {t(`julia.planning.horizons.${h}`)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {planningDomains.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDomain(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
              domain === d
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                : 'bg-black/20 text-white/50 border border-white/10 hover:text-white/80'
            }`}
          >
            {t(`julia.planning.domains.${d}`)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCell}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-white/10 bg-black/25 p-5"
        >
          <p className="text-white/90 text-sm leading-relaxed mb-4">
            {t(`julia.planning.cells.${horizon}.${domain}.body`)}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-white/40">{t('julia.planning.toolLabel')}</span>
            <span className="px-2 py-1 rounded bg-orbit-deep/60 text-violet-200 border border-orbit-violet/30">
              {t(`julia.planning.cells.${horizon}.${domain}.tool`)}
            </span>
            {isExternal ? (
              <a
                href={actionHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orbit-violet/30 text-white border border-orbit-violet/40 hover:bg-orbit-violet/50 transition-colors"
              >
                {t(action.labelKey)}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <a
                href={actionHref}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orbit-violet/30 text-white border border-orbit-violet/40 hover:bg-orbit-violet/50 transition-colors"
              >
                {t(action.labelKey)}
              </a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg border border-white/10 p-4 bg-black/20">
          <div className="text-neon-green text-xs font-semibold uppercase mb-2">{t('julia.planning.nowTitle')}</div>
          <p className="text-white/65 text-xs leading-relaxed">{t('julia.planning.nowBody')}</p>
        </div>
        <div className="rounded-lg border border-white/10 p-4 bg-black/20">
          <div className="text-violet-300 text-xs font-semibold uppercase mb-2">{t('julia.planning.nextTitle')}</div>
          <p className="text-white/65 text-xs leading-relaxed">{t('julia.planning.nextBody')}</p>
        </div>
        <div className="rounded-lg border border-white/10 p-4 bg-black/20">
          <div className="text-white/50 text-xs font-semibold uppercase mb-2">{t('julia.planning.notYetTitle')}</div>
          <p className="text-white/65 text-xs leading-relaxed">{t('julia.planning.notYetBody')}</p>
        </div>
      </div>
    </div>
  );
};
