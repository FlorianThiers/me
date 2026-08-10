import React from 'react';

import { useTranslation } from 'react-i18next';

import type { JuliaLifeSnapshot } from '../../types/juliaSnapshot';



function ringPct(current: number, target: number): number {

  if (target <= 0) return 0;

  return Math.min(100, Math.round((current / target) * 100));

}



const Ring: React.FC<{

  label: string;

  value: string;

  pct: number;

  accent: string;

}> = ({ label, value, pct, accent }) => {

  const r = 28;

  const c = 2 * Math.PI * r;

  const offset = c - (pct / 100) * c;



  return (

    <div className="flex flex-col items-center gap-1.5 min-w-[5.5rem]">

      <div className="relative w-[4.5rem] h-[4.5rem]">

        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90" aria-hidden>

          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />

          <circle

            cx="32"

            cy="32"

            r={r}

            fill="none"

            stroke={accent}

            strokeWidth="5"

            strokeLinecap="round"

            strokeDasharray={c}

            strokeDashoffset={offset}

            className="transition-all duration-700"

          />

        </svg>

        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white/90">

          {pct}%

        </span>

      </div>

      <span className="text-[10px] uppercase tracking-wider text-white/45">{label}</span>

      <span className="text-xs text-white/80 font-medium text-center leading-tight">{value}</span>

    </div>

  );

};



export const LifeNutritionRings: React.FC<{ life: JuliaLifeSnapshot; compact?: boolean }> = ({

  life,

  compact = false,

}) => {

  const { t } = useTranslation();

  const proteinPct = ringPct(life.proteinG, life.proteinTargetG);
  const waterPct = ringPct(life.waterL, life.waterTargetL);
  const fiberTarget = life.fiberTargetG ?? 30;
  const fiberPct = ringPct(life.fiberG ?? 0, fiberTarget);
  const showFiber = !compact && (life.fiberG ?? 0) > 0;



  return (

    <div className={`flex ${compact ? 'gap-4 justify-center' : 'gap-6 justify-center flex-wrap'}`}>

      <Ring

        label={t('julia.lifeToday.protein')}

        value={`${Math.round(life.proteinG)} / ${life.proteinTargetG}g`}

        pct={proteinPct}

        accent="#22d3ee"

      />

      <Ring
        label={t('julia.lifeToday.water')}
        value={`${life.waterL.toFixed(1)} / ${life.waterTargetL}L`}
        pct={waterPct}
        accent="#a78bfa"
      />
      {showFiber && (
        <Ring
          label={t('julia.lifeToday.fiber')}
          value={`${Math.round(life.fiberG ?? 0)} / ${fiberTarget}g`}
          pct={fiberPct}
          accent="#4ade80"
        />
      )}

      {!compact && life.kcal > 0 && (

        <div className="flex flex-col items-center justify-center min-w-[5.5rem] px-2">

          <span className="text-2xl font-bold text-white/90">{Math.round(life.kcal)}</span>

          <span className="text-[10px] uppercase tracking-wider text-white/45">{t('julia.lifeToday.kcal')}</span>

        </div>

      )}

    </div>

  );

};


