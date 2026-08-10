import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, ChefHat, Home, Music, ArrowLeft } from 'lucide-react';
import { weekAnchors } from '../data/juliaDemoBriefing';
import { useJuliaSnapshot } from '../hooks/useJuliaSnapshot';
import { OrbitIcon } from '../components/orbit/icons/OrbitIcons';
import { OrbitBadge } from '../components/orbit/OrbitBadge';
import type { OrbitIconName } from '../components/orbit/icons/OrbitIcons';

const toolLinks = [
  { to: '/sports', icon: Activity, labelKey: 'julia.lifeRhythm.links.sports' },
  { to: '/cooking', icon: ChefHat, labelKey: 'julia.lifeRhythm.links.cooking' },
  { to: '/garden-designer', icon: Home, labelKey: 'julia.lifeRhythm.links.garden' },
  { to: '/music', icon: Music, labelKey: 'julia.lifeRhythm.links.music' },
] as const;

const anchorKeys = ['sleep', 'nutrition', 'sport', 'hobby', 'home'] as const;

export const LifeRhythmPage: React.FC = () => {
  const { t } = useTranslation();
  const { snapshot, isLive, isDemo } = useJuliaSnapshot();

  const anchors = anchorKeys.map((key) => {
    const demo = weekAnchors.find((a) => a.key === `julia.lifeRhythm.anchors.${key}`);
    return {
      key: `julia.lifeRhythm.anchors.${key}`,
      pct: snapshot.anchors[key],
      icon: (demo?.icon ?? key) as OrbitIconName,
    };
  });

  return (
    <div className="min-h-screen pb-16">
      <div className="container-custom px-4 py-8 max-w-4xl mx-auto">
        <Link
          to="/julia"
          className="inline-flex items-center text-neon-green text-sm mb-8 hover:text-neon-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('julia.lifeRhythm.back')}
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-white">{t('julia.lifeRhythm.title')}</h1>
            <OrbitBadge isLive={isLive} />
          </div>
          <p className="text-white/70 mb-4">{t('julia.lifeRhythm.intro')}</p>
          {snapshot.sportTypeToday && (
            <p className="text-orbit-cyan text-sm mb-6">
              {t('julia.sportTypeToday', { type: snapshot.sportTypeToday })}
            </p>
          )}
          {snapshot.life && !isDemo && (
            <p className="text-white/55 text-sm mb-6">
              {t('julia.lifeToday.nutritionAnchor', { pct: snapshot.anchors.nutrition })}
              {' · '}
              {Math.round(snapshot.life.proteinG)}g / {snapshot.life.proteinTargetG}g
              {' · '}
              {snapshot.life.waterL.toFixed(1)}L / {snapshot.life.waterTargetL}L
            </p>
          )}
          {snapshot.weekConstraint && (
            <p className="text-white/55 text-sm mb-10 border-l-2 border-orbit-violet/40 pl-4">
              {snapshot.weekConstraint}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative w-64 h-64 mx-auto mb-12"
        >
          <div className="absolute inset-0 rounded-full border border-orbit-violet/25" />
          <div className="absolute inset-4 rounded-full border border-orbit-cyan/20" />
          {anchors.map((anchor, i) => {
            const angle = (i / anchors.length) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + 38 * Math.cos(angle);
            const y = 50 + 38 * Math.sin(angle);
            return (
              <div
                key={anchor.key}
                className="absolute w-20 -ml-10 -mt-6 text-center"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div
                  className="h-1.5 rounded-full bg-neon-green/30 mb-1 mx-auto w-12 overflow-hidden"
                  title={`${anchor.pct}%`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-orbit-violet to-orbit-cyan rounded-full"
                    style={{ width: `${anchor.pct}%` }}
                  />
                </div>
                <OrbitIcon name={anchor.icon} className="w-4 h-4 mx-auto mb-0.5 text-orbit-violet/80" />
                <span className="text-[10px] text-white/60 leading-tight block">{t(anchor.key)}</span>
              </div>
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <OrbitIcon name="life" className="w-10 h-10 text-orbit-violet/50" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {toolLinks.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <Link
                to={item.to}
                className="flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-dark-secondary/50 hover:border-neon-green/40 transition-all group"
              >
                <item.icon className="w-8 h-8 text-neon-green group-hover:scale-110 transition-transform" />
                <span className="text-white font-medium">{t(item.labelKey)}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {isDemo && <p className="text-white/40 text-xs text-center">{t('julia.demoNotice')}</p>}
      </div>
    </div>
  );
};
