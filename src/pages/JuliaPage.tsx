import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { JuliaPlanningHorizons } from '../components/JuliaPlanningHorizons';
import { demoDayIntents } from '../data/juliaDemoBriefing';
import { useJuliaSnapshot } from '../hooks/useJuliaSnapshot';
import { OrbitBadge } from '../components/orbit/OrbitBadge';
import { OrbitPanel } from '../components/orbit/OrbitPanel';
import { LifeTodayPanel } from '../components/orbit/LifeTodayPanel';
import { OrbitIcon, type OrbitIconName } from '../components/orbit/icons/OrbitIcons';
import { JuliaVoicePanel } from '../components/orbit/JuliaVoicePanel';
import { MealWeekBoard } from '../components/orbit/MealWeekBoard';
import { JuliaOrbBackground } from '../components/orbit/JuliaOrbBackground';
import { FractalOrbitStrip } from '../components/orbit/FractalOrbitStrip';
import { MANDELBROT_SPOTS } from '../data/pageMandelbrotConfig';

const intentIconMap: Record<string, OrbitIconName> = {
  deep: 'deep',
  body: 'body',
  life: 'life',
  admin: 'admin',
};

export const JuliaPage: React.FC = () => {
  const { t } = useTranslation();
  const { snapshot, isLive, isDemo } = useJuliaSnapshot();

  const intents = snapshot.intents.map((intent) => {
    const demo = demoDayIntents.find((d) => d.id === intent.id);
    return {
      id: intent.id,
      icon: demo?.icon ?? intentIconMap[intent.id] ?? 'deep',
      labelKey: demo?.labelKey ?? `julia.intents.${intent.id}`,
      text: intent.text,
    };
  });

  return (
    <div className="relative min-h-screen pb-16 overflow-x-hidden">
      <JuliaOrbBackground zoom={3.1} />

      <div className="relative z-10 container-custom px-4 py-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-3">
            <OrbitBadge isLive={isLive} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{t('julia.title')}</h1>
          <p className="text-white/70 max-w-2xl mx-auto">{t('julia.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_14rem_1fr] gap-6 lg:gap-10 items-center mb-10">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-start-1"
          >
            <OrbitPanel
              title={t('julia.workPanel')}
              titleClassName="text-neon-blue"
              className="bg-dark-secondary/88 backdrop-blur-lg"
            >
              <ul className="space-y-3">
                {snapshot.workTop3.map((item) => (
                  <li key={item} className="text-white/85 text-sm flex gap-2">
                    <span className="text-neon-green">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </OrbitPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center lg:col-start-2 min-h-[14rem] lg:min-h-[18rem] px-2"
          >
            <div className="rounded-2xl bg-dark-bg/50 backdrop-blur-md border border-white/10 px-5 py-4 w-full max-w-[14rem] text-center shadow-lg shadow-black/40">
              <p className="text-[10px] uppercase tracking-[0.2em] text-violet-200/80 mb-2">
                {t('julia.orbLabel')}
              </p>
              <p className="text-white/95 text-sm font-medium leading-snug">{snapshot.greeting}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-start-3"
          >
            <OrbitPanel
              title={t('julia.lifePanel')}
              titleClassName="text-neon-green"
              className="bg-dark-secondary/88 backdrop-blur-lg"
            >
              {snapshot.weekConstraint && (
                <p className="text-white/60 text-xs mb-3 border-l-2 border-orbit-cyan/40 pl-3">
                  {snapshot.weekConstraint}
                </p>
              )}
              {snapshot.sportTypeToday && (
                <p className="text-orbit-cyan text-xs font-medium mb-3">
                  {t('julia.sportTypeToday', { type: snapshot.sportTypeToday })}
                </p>
              )}
              <LifeTodayPanel
                life={snapshot.life}
                links={snapshot.links}
                nutritionAnchor={snapshot.anchors.nutrition}
                isDemo={isDemo}
                compact
                showRings={isDemo}
              />
              <Link
                to="/life-rhythm"
                className="inline-flex items-center text-neon-green text-sm font-medium hover:text-neon-blue transition-colors mt-4"
              >
                {t('julia.lifeRhythmLink')}
                <span className="ml-1">→</span>
              </Link>
            </OrbitPanel>
          </motion.div>
        </div>

        {!isDemo && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mb-8"
          >
            <OrbitPanel title={t('julia.voice.title')} titleClassName="text-orbit-violet">
              <JuliaVoicePanel life={snapshot.life} date={snapshot.date} />
            </OrbitPanel>
          </motion.div>
        )}

        {snapshot.life && !isDemo && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.19 }}
            className="mb-8"
          >
            <OrbitPanel
              title={t('julia.lifeToday.title')}
              titleClassName="text-orbit-cyan"
              className="bg-dark-secondary/75 backdrop-blur-md"
            >
              <LifeTodayPanel
                life={snapshot.life}
                links={snapshot.links}
                nutritionAnchor={snapshot.anchors.nutrition}
                isDemo={isDemo}
              />
            </OrbitPanel>
          </motion.div>
        )}

        {snapshot.mealPlan && snapshot.mealPlan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.195 }}
            className="mb-8"
          >
            <OrbitPanel title={t('julia.mealPlan.title')} titleClassName="text-neon-green">
              <MealWeekBoard slots={snapshot.mealPlan} today={snapshot.date} compact />
            </OrbitPanel>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-secondary/75 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-6 text-center">{t('julia.todayThread')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {intents.map((intent, i) => (
              <motion.div
                key={intent.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-4"
              >
                <div className="mb-2">
                  <OrbitIcon name={intent.icon} className="w-7 h-7 text-orbit-violet" />
                </div>
                <div className="text-neon-green text-xs font-semibold uppercase mb-1">{t(intent.labelKey)}</div>
                <p className="text-white/75 text-sm">{intent.text}</p>
              </motion.div>
            ))}
          </div>
          {isDemo && <p className="text-center text-white/40 text-xs mt-6">{t('julia.demoNotice')}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <JuliaPlanningHorizons links={snapshot.links} />
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a
            href="https://en.wikipedia.org/wiki/Julia_set"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/50 hover:text-neon-green transition-colors"
          >
            {t('julia.links.wiki')}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://en.wikipedia.org/wiki/Julia_set#/media/File:JSr07885.gif"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/50 hover:text-neon-green transition-colors"
          >
            {t('julia.links.gif')}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://commons.wikimedia.org/wiki/File:Julia_circling.ogv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/50 hover:text-neon-green transition-colors"
          >
            {t('julia.links.video')}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <FractalOrbitStrip pagePath="/julia" view={MANDELBROT_SPOTS.elephant} />
      </div>
    </div>
  );
};
