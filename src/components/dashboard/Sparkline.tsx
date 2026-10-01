import React from 'react';

type Props = {
  /** Waarden per dag (oudste eerst); null = geen meting. */
  values: (number | null)[];
  min?: number;
  max?: number;
  /** Optionele doellijn (bv. water doel). */
  target?: number | null;
  stroke?: string;
  label: string;
  width?: number;
  height?: number;
  className?: string;
  /** Optionele dag-labels (zelfde lengte als values), uitgelijnd onder de punten. */
  labels?: string[];
};

/** Minimalistische SVG-sparkline met gaten voor ontbrekende dagen. */
export const Sparkline: React.FC<Props> = ({
  values,
  min,
  max,
  target = null,
  stroke = '#38bdf8',
  label,
  width = 240,
  height = 56,
  className = 'w-full h-auto',
  labels,
}) => {
  const pad = 6;
  const present = values.filter((v): v is number => v != null);
  const lo = min ?? (present.length ? Math.min(...present, target ?? Infinity) : 0);
  const hiRaw = max ?? (present.length ? Math.max(...present, target ?? -Infinity) : 1);
  const hi = hiRaw === lo ? lo + 1 : hiRaw;
  const n = values.length;
  const x = (i: number) => pad + (n <= 1 ? 0 : (i * (width - 2 * pad)) / (n - 1));
  const y = (v: number) => height - pad - ((v - lo) / (hi - lo)) * (height - 2 * pad);

  // Segmenten van aaneengesloten waarden.
  const segments: { i: number; v: number }[][] = [];
  let cur: { i: number; v: number }[] = [];
  values.forEach((v, i) => {
    if (v == null) {
      if (cur.length) segments.push(cur);
      cur = [];
    } else cur.push({ i, v });
  });
  if (cur.length) segments.push(cur);

  return (
    <div>
    <svg role="img" aria-label={label} viewBox={`0 0 ${width} ${height}`} className={className}>
      {/* dagmarkeringen */}
      {values.map((_, i) => (
        <line key={i} x1={x(i)} x2={x(i)} y1={height - pad} y2={height - pad + 2} stroke="rgba(255,255,255,0.3)" />
      ))}
      <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="rgba(255,255,255,0.18)" />
      {target != null && target >= lo && target <= hi && (
        <line
          x1={pad}
          x2={width - pad}
          y1={y(target)}
          y2={y(target)}
          stroke="rgba(255,255,255,0.45)"
          strokeDasharray="4 4"
        />
      )}
      {segments.map((seg, k) =>
        seg.length > 1 ? (
          <polyline
            key={k}
            fill="none"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={seg.map((p) => `${x(p.i)},${y(p.v)}`).join(' ')}
          />
        ) : null,
      )}
      {values.map((v, i) => (v == null ? null : <circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill={stroke} />))}
    </svg>
    {labels && (
      <div className="relative mt-1.5 h-4" aria-hidden="true">
        {labels.map((l, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 text-xs text-white/65"
            style={{ left: `${(x(i) / width) * 100}%` }}
          >
            {l}
          </span>
        ))}
      </div>
    )}
    </div>
  );
};
