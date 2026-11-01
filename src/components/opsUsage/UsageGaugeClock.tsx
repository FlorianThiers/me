import React, { useId } from 'react';
import type { UsageWarningLevel } from '../../types/opsUsage';
import { warningBorderClass, warningTextClass } from '../../lib/opsUsage/warningLevel';

type Props = {
  title: string;
  currentPct: number;
  forecastPct: number;
  warningLevel: UsageWarningLevel;
  resetLabel: string;
  detail?: string;
};

export const UsageGaugeClock: React.FC<Props> = ({
  title,
  currentPct,
  forecastPct,
  warningLevel,
  resetLabel,
  detail,
}) => {
  const gradId = useId().replace(/:/g, '');
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const currentOffset = circumference * (1 - Math.min(currentPct, 100) / 100);
  const forecastOffset = circumference * (1 - Math.min(forecastPct, 100) / 100);

  return (
    <div
      className={`rounded-2xl bg-orbit-surface/80 border p-6 backdrop-blur-sm ${warningBorderClass(warningLevel)}`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-1">{title}</h2>
      <p className="text-[11px] text-white/45 mb-4">{resetLabel}</p>
      <div className="relative w-40 h-40 mx-auto">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(251,191,36,0.35)"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={forecastOffset}
            strokeLinecap="round"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={currentOffset}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className={`text-3xl font-bold tabular-nums ${warningTextClass(warningLevel)}`}>
            {Math.round(currentPct)}%
          </span>
          <span className="text-[10px] text-white/45 uppercase tracking-wide">verbruikt</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-black/30 px-3 py-2 border border-white/5">
          <p className="text-white/45">Prognose reset</p>
          <p className={`font-semibold tabular-nums ${warningTextClass(warningLevel)}`}>
            {Math.round(forecastPct)}%
          </p>
        </div>
        <div className="rounded-lg bg-black/30 px-3 py-2 border border-white/5">
          <p className="text-white/45">Dubbele 80%-regel</p>
          <p className="text-white/70">
            {warningLevel === 'red'
              ? '≥80% huidig of prognose'
              : warningLevel === 'amber'
                ? '≥70% waarschuwing'
                : 'Binnen marge'}
          </p>
        </div>
      </div>
      {detail && <p className="text-[11px] text-white/40 mt-3">{detail}</p>}
    </div>
  );
};
