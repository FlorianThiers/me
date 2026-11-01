import React from 'react';
import { Sparkline } from '../dashboard/Sparkline';

type Props = {
  title: string;
  items: { name: string; value: number }[];
  valueSuffix?: string;
  maxBars?: number;
};

export const UsageBarList: React.FC<Props> = ({
  title,
  items,
  valueSuffix = '',
  maxBars = 8,
}) => {
  const slice = items.slice(0, maxBars);
  const max = slice.reduce((m, i) => Math.max(m, i.value), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-white/55">{title}</h3>
      {slice.length === 0 && <p className="text-xs text-white/40">Geen data in deze cyclus.</p>}
      {slice.map((item) => (
        <div key={item.name}>
          <div className="flex justify-between text-xs text-white/70 mb-1 gap-2">
            <span className="truncate">{item.name}</span>
            <span className="tabular-nums text-white/50 shrink-0">
              {item.value}
              {valueSuffix}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orbit-violet to-orbit-cyan"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

type DailyProps = {
  title: string;
  points: { date: string; value: number }[];
  stroke?: string;
  valueLabel?: string;
};

export const UsageDailyChart: React.FC<DailyProps> = ({
  title,
  points,
  stroke = '#22d3ee',
  valueLabel = 'usage',
}) => {
  const labels = points.map((p) => p.date.slice(8, 10));
  const values = points.map((p) => p.value);

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-white/55 mb-2">{title}</h3>
      {points.length === 0 ? (
        <p className="text-xs text-white/40">Geen dagelijkse punten.</p>
      ) : (
        <Sparkline
          values={values}
          stroke={stroke}
          label={valueLabel}
          width={320}
          height={64}
          labels={labels}
        />
      )}
    </div>
  );
};
