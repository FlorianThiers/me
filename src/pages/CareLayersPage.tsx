import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Layers, Eye, HeartHandshake, Scale } from 'lucide-react';

const LayersDiagram: React.FC = () => {
  const { t } = useTranslation();

  const rings = [
    { key: 'myth', opacity: 0.25, r: 46 },
    { key: 'arrangement', opacity: 0.4, r: 36 },
    { key: 'care', opacity: 0.55, r: 26 },
    { key: 'specific', opacity: 0.85, r: 14 },
  ] as const;

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 items-center"
      role="img"
      aria-label={t('careLayers.diagram.aria')}
    >
      <svg viewBox="0 0 120 120" className="w-48 h-48 mx-auto text-neon-green" aria-hidden="true">
        {rings.map(({ opacity, r }) => (
          <circle
            key={r}
            cx="60"
            cy="60"
            r={r}
            fill="currentColor"
            opacity={opacity}
            stroke="currentColor"
            strokeWidth="0.8"
          />
        ))}
        <circle cx="60" cy="60" r="5" fill="currentColor" className="text-neon-blue" />
      </svg>

      <ul className="space-y-3 text-sm">
        {rings.map(({ key }) => (
          <li key={key} className="flex gap-3 items-start">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-neon-green shrink-0" aria-hidden="true" />
            <div>
              <p className="text-white font-medium">{t(`careLayers.diagram.${key}`)}</p>
              <p className="text-white/50 text-xs mt-0.5">{t(`careLayers.diagram.${key}Hint`)}</p>
            </div>
          </li>
        ))}
        <li className="flex gap-3 items-start pt-1 border-t border-white/10">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-neon-blue shrink-0" aria-hidden="true" />
          <div>
            <p className="text-white font-medium">{t('careLayers.diagram.shared')}</p>
            <p className="text-white/50 text-xs mt-0.5">{t('careLayers.diagram.sharedHint')}</p>
          </div>
        </li>
      </ul>
    </div>
  );
};

export const CareLayersPage: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    { icon: Scale, key: 'bothAnd' as const },
    { icon: HeartHandshake, key: 'careShape' as const },
    { icon: Layers, key: 'oneWord' as const },
    { icon: Eye, key: 'sharedReality' as const },
  ];

  return (
    <div className="container-custom px-4 py-8 max-w-4xl mx-auto">
      <Link
        to="/interests"
        className="inline-flex items-center text-neon-green text-sm mb-8 hover:text-neon-blue transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('careLayers.back')}
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="flex justify-center mb-3">
          <Layers className="w-8 h-8 text-neon-green" aria-hidden="true" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('careLayers.title')}</h1>
        <p className="text-white/75 max-w-2xl mx-auto text-lg leading-relaxed">{t('careLayers.subtitle')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="orbit-readable-panel rounded-2xl p-6 md:p-8 mb-8"
      >
        <p className="text-white/80 leading-relaxed mb-2">{t('careLayers.intro')}</p>
        <p className="text-white/55 text-sm leading-relaxed">{t('careLayers.credit')}</p>
        <LayersDiagram />
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
            <h2 className="text-xl font-bold text-neon-green">{t(`careLayers.${key}.title`)}</h2>
          </div>
          <div className="space-y-3 text-white/80 leading-relaxed">
            <p>{t(`careLayers.${key}.p1`)}</p>
            <p>{t(`careLayers.${key}.p2`)}</p>
            <p>{t(`careLayers.${key}.p3`)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
