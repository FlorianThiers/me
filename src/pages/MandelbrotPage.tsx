import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ExternalLink, Orbit } from 'lucide-react';
import {
  MANDELBROT_SPOTS,
  MANDELBROT_HUB_SPOTS,
  PAGE_MANDELBROT,
  type MandelbrotSpotId,
} from '../data/pageMandelbrotConfig';

function pagesForSpot(spotId: MandelbrotSpotId): string[] {
  return Object.entries(PAGE_MANDELBROT)
    .filter(([, cfg]) => cfg.spotId === spotId)
    .map(([path]) => path)
    .filter((p) => p !== '/mandelbrot');
}

export const MandelbrotPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container-custom px-4 py-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="flex justify-center mb-3">
          <Orbit className="w-8 h-8 text-neon-green" aria-hidden="true" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('mandelbrot.title')}</h1>
        <p className="text-white/75 max-w-2xl mx-auto text-lg leading-relaxed">{t('mandelbrot.subtitle')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="orbit-readable-panel rounded-2xl p-6 md:p-8 mb-10"
      >
        <h2 className="text-xl font-bold text-neon-green mb-4">{t('mandelbrot.metaphor.title')}</h2>
        <div className="space-y-4 text-white/80 leading-relaxed">
          <p>{t('mandelbrot.metaphor.p1')}</p>
          <p>{t('mandelbrot.metaphor.p2')}</p>
          <p>{t('mandelbrot.metaphor.p3')}</p>
        </div>
        <Link
          to="/julia"
          className="inline-flex items-center gap-2 mt-6 text-neon-blue hover:text-neon-green transition-colors font-medium"
        >
          {t('mandelbrot.metaphor.juliaCta')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <h2 className="text-2xl font-bold text-white mb-2 text-center">{t('mandelbrot.map.title')}</h2>
        <p className="text-white/55 text-center text-sm mb-8 max-w-xl mx-auto">{t('mandelbrot.map.subtitle')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MANDELBROT_HUB_SPOTS.map((spotId, i) => {
            const loc = MANDELBROT_SPOTS[spotId];
            const linked = pagesForSpot(spotId).slice(0, 3);
            return (
              <motion.div
                key={spotId}
                id={spotId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className="rounded-xl border border-white/10 orbit-readable-panel p-5 hover:border-neon-green/40 transition-colors"
              >
                <h3 className="text-neon-green font-semibold mb-2">{t(loc.nameKey)}</h3>
                <p className="text-white/65 text-sm mb-4">{t(loc.metaphorKey)}</p>
                {linked.length > 0 ? (
                  <ul className="space-y-1">
                    {linked.map((path) => (
                      <li key={path}>
                        <Link
                          to={path}
                          className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-neon-green transition-colors"
                        >
                          {path}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-white/35 text-xs">{t('mandelbrot.map.backgroundOnly')}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <a
          href="https://en.wikipedia.org/wiki/Mandelbrot_set"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-white/50 hover:text-neon-green transition-colors"
        >
          {t('mandelbrot.links.wiki')}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href="https://commons.wikimedia.org/wiki/File:Mandelbrot_set_(animated).gif"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-white/50 hover:text-neon-green transition-colors"
        >
          {t('mandelbrot.links.gif')}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
