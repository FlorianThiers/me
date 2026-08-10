import React from 'react';
import { useTranslation } from 'react-i18next';
import type { JuliaMicroGap } from '../../types/juliaSnapshot';

const MICRO_LABELS: Record<string, string> = {
  magnesium: 'magnesium',
  calcium: 'calcium',
  iron: 'iron',
  zinc: 'zinc',
  potassium: 'potassium',
  vitaminD: 'vitaminD',
  vitaminB12: 'vitaminB12',
  folate: 'folate',
};

type Props = {
  gaps: JuliaMicroGap[];
};

export const LifeMicroGaps: React.FC<Props> = ({ gaps }) => {
  const { t } = useTranslation();

  if (!gaps.length) return null;

  return (
    <ul className="space-y-1.5 border-t border-white/10 pt-3">
      <p className="text-[10px] uppercase tracking-wider text-white/45 mb-1">
        {t('julia.lifeToday.microGapsTitle')}
      </p>
      {gaps.map((gap) => (
        <li key={gap.id} className="flex justify-between gap-2 text-xs text-rose-200/90">
          <span>{t(`julia.lifeToday.micro.${MICRO_LABELS[gap.id] ?? gap.id}`)}</span>
          <span className="text-white/55 shrink-0">
            {gap.current}
            {gap.unit} / {gap.target}
            {gap.unit} ({gap.pct}%)
          </span>
        </li>
      ))}
    </ul>
  );
};
