import React from 'react';
import { useTranslation } from 'react-i18next';

export const OrbitBadge: React.FC<{ isLive: boolean }> = ({ isLive }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
        isLive
          ? 'border-neon-green/40 text-neon-green bg-neon-green/10'
          : 'border-violet-400/30 text-violet-200 bg-violet-900/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-neon-green animate-pulse' : 'bg-violet-300'}`} />
      {isLive ? t('julia.badgeLive') : t('julia.badge')}
    </span>
  );
};
