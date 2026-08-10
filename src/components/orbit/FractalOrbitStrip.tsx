import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Orbit } from 'lucide-react';
import type { FractalBackgroundKind, MandelbrotViewConfig } from '../../data/pageMandelbrotConfig';
import type { OrbitTrapSettings } from '../../data/orbitTrapPresets';

type Props = {
  pagePath: string;
  view: MandelbrotViewConfig;
  fractalKind?: FractalBackgroundKind;
  orbitTrap?: OrbitTrapSettings;
  className?: string;
};

export const FractalOrbitStrip: React.FC<Props> = ({
  pagePath,
  view,
  fractalKind = 'mandelbrot',
  orbitTrap,
  className = '',
}) => {
  const { t } = useTranslation();
  const isJulia = pagePath.startsWith('/julia');
  const isMandelbrot = pagePath === '/mandelbrot';
  const isOrbitTrap = fractalKind === 'orbitTrap' && orbitTrap;

  const locationLabel = isMandelbrot
    ? t('mandelbrot.strip.tourLabel')
    : isOrbitTrap
      ? t(`mandelbrot.orbitTraps.${orbitTrap.labelKey}.label`)
      : t(view.nameKey);

  const metaphor = isOrbitTrap
    ? t(`mandelbrot.orbitTraps.${orbitTrap.metaphorKey}.metaphor`)
    : t(view.metaphorKey);

  return (
    <div className={`pt-6 ${className}`} aria-label={t('mandelbrot.strip.aria')}>
      <div className="flex items-center justify-center gap-2 text-white/40 text-xs uppercase tracking-wider mb-3">
        <Orbit className="w-3.5 h-3.5" aria-hidden="true" />
        {t('mandelbrot.strip.onTheSet')} — {locationLabel}
      </div>
      <p className="text-center text-white/55 text-sm mb-4 max-w-xl mx-auto">{metaphor}</p>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
        {!isMandelbrot && (
          <Link
            to={`/mandelbrot#${view.spotId}`}
            className="inline-flex items-center gap-1 text-white/50 hover:text-neon-green transition-colors"
          >
            {t('mandelbrot.strip.hubLink', { place: t(view.nameKey) })}
          </Link>
        )}
        {!isJulia && (
          <Link
            to="/julia"
            className="inline-flex items-center gap-1 text-white/50 hover:text-neon-green transition-colors"
          >
            {t('mandelbrot.strip.juliaLink')}
          </Link>
        )}
        <a
          href="https://en.wikipedia.org/wiki/Mandelbrot_set"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-white/50 hover:text-neon-green transition-colors"
        >
          {t('mandelbrot.strip.wiki')}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        {isOrbitTrap && (
          <a
            href="https://en.wikipedia.org/wiki/Orbit_trap"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/50 hover:text-neon-green transition-colors"
          >
            {t('mandelbrot.strip.orbitTrapWiki')}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        {isJulia && (
          <a
            href="https://en.wikipedia.org/wiki/Julia_set"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/50 hover:text-neon-green transition-colors"
          >
            {t('mandelbrot.strip.juliaWiki')}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
