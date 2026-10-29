import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Grid3x3, Orbit, Zap } from 'lucide-react';

const TripleViewDiagram: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8"
      role="img"
      aria-label={t('squaredMosaic.diagram.aria')}
    >
      <div className="rounded-xl border border-white/10 bg-dark-secondary/40 p-4 text-center">
        <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto mb-3 text-neon-green" aria-hidden="true">
          <rect x="8" y="8" width="32" height="32" fill="currentColor" opacity="0.85" />
          <rect x="40" y="8" width="20" height="20" fill="currentColor" opacity="0.55" />
          <rect x="60" y="8" width="12" height="12" fill="currentColor" opacity="0.4" />
          <rect x="40" y="28" width="12" height="12" fill="currentColor" opacity="0.5" />
          <rect x="52" y="28" width="20" height="20" fill="currentColor" opacity="0.65" />
          <rect x="8" y="40" width="20" height="20" fill="currentColor" opacity="0.45" />
          <rect x="28" y="40" width="12" height="12" fill="currentColor" opacity="0.35" />
          <rect x="8" y="60" width="32" height="12" fill="currentColor" opacity="0.7" />
          <rect x="40" y="48" width="32" height="24" fill="currentColor" opacity="0.5" />
        </svg>
        <p className="text-sm font-medium text-white">{t('squaredMosaic.diagram.mosaic')}</p>
        <p className="text-xs text-white/50 mt-1">{t('squaredMosaic.diagram.mosaicHint')}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-dark-secondary/40 p-4 text-center">
        <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto mb-3 text-neon-blue" aria-hidden="true">
          <circle cx="40" cy="12" r="5" fill="currentColor" />
          <circle cx="16" cy="40" r="5" fill="currentColor" />
          <circle cx="64" cy="40" r="5" fill="currentColor" />
          <circle cx="40" cy="68" r="5" fill="currentColor" />
          <line x1="40" y1="17" x2="18" y2="35" stroke="currentColor" strokeWidth="2" opacity="0.7" />
          <line x1="40" y1="17" x2="62" y2="35" stroke="currentColor" strokeWidth="2" opacity="0.7" />
          <line x1="16" y1="45" x2="40" y2="63" stroke="currentColor" strokeWidth="2" opacity="0.7" />
          <line x1="64" y1="45" x2="40" y2="63" stroke="currentColor" strokeWidth="2" opacity="0.7" />
          <line x1="21" y1="40" x2="59" y2="40" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
        </svg>
        <p className="text-sm font-medium text-white">{t('squaredMosaic.diagram.network')}</p>
        <p className="text-xs text-white/50 mt-1">{t('squaredMosaic.diagram.networkHint')}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-dark-secondary/40 p-4 text-center">
        <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto mb-3 text-orbit-violet" aria-hidden="true">
          <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <circle cx="40" cy="14" r="3.5" fill="currentColor" />
          <circle cx="62" cy="26" r="3.5" fill="currentColor" />
          <circle cx="66" cy="48" r="3.5" fill="currentColor" />
          <circle cx="52" cy="64" r="3.5" fill="currentColor" />
          <circle cx="28" cy="64" r="3.5" fill="currentColor" />
          <circle cx="14" cy="48" r="3.5" fill="currentColor" />
          <circle cx="18" cy="26" r="3.5" fill="currentColor" />
          <circle cx="40" cy="40" r="5" fill="currentColor" opacity="0.85" />
          <line x1="40" y1="40" x2="40" y2="17.5" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
          <line x1="40" y1="40" x2="59" y2="28" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
          <line x1="40" y1="40" x2="62.5" y2="48" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
          <line x1="40" y1="40" x2="50" y2="61" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
          <line x1="40" y1="40" x2="30" y2="61" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
          <line x1="40" y1="40" x2="17.5" y2="48" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
          <line x1="40" y1="40" x2="21" y2="28" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
        </svg>
        <p className="text-sm font-medium text-white">{t('squaredMosaic.diagram.circular')}</p>
        <p className="text-xs text-white/50 mt-1">{t('squaredMosaic.diagram.circularHint')}</p>
      </div>
    </div>
  );
};

export const SquaredMosaicPage: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    { icon: Grid3x3, key: 'threeFaces' as const },
    { icon: Zap, key: 'kirchhoff' as const },
    { icon: Orbit, key: 'mandelbrotLink' as const },
  ];

  return (
    <div className="container-custom px-4 py-8 max-w-4xl mx-auto">
      <Link
        to="/interests"
        className="inline-flex items-center text-neon-green text-sm mb-8 hover:text-neon-blue transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('squaredMosaic.back')}
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="flex justify-center mb-3">
          <Grid3x3 className="w-8 h-8 text-neon-green" aria-hidden="true" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('squaredMosaic.title')}</h1>
        <p className="text-white/75 max-w-2xl mx-auto text-lg leading-relaxed">{t('squaredMosaic.subtitle')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="orbit-readable-panel rounded-2xl p-6 md:p-8 mb-8"
      >
        <p className="text-white/80 leading-relaxed mb-2">{t('squaredMosaic.intro')}</p>
        <p className="text-white/55 text-sm leading-relaxed">{t('squaredMosaic.credit')}</p>
        <TripleViewDiagram />
      </motion.div>

      {sections.map(({ icon: Icon, key }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + i * 0.06 }}
          className="orbit-readable-panel rounded-2xl p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Icon className="w-5 h-5 text-neon-green shrink-0" aria-hidden="true" />
            <h2 className="text-xl font-bold text-neon-green">{t(`squaredMosaic.${key}.title`)}</h2>
          </div>
          <div className="space-y-3 text-white/80 leading-relaxed">
            <p>{t(`squaredMosaic.${key}.p1`)}</p>
            <p>{t(`squaredMosaic.${key}.p2`)}</p>
            <p>{t(`squaredMosaic.${key}.p3`)}</p>
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="text-center mt-10 mb-4"
      >
        <Link
          to="/mandelbrot"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
        >
          {t('squaredMosaic.ctaMandelbrot')}
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-white/45 text-sm mt-4 max-w-md mx-auto">{t('squaredMosaic.ctaHint')}</p>
      </motion.div>
    </div>
  );
};
