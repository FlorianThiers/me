import React, { useCallback, useRef, useState } from 'react';
import { GripHorizontal, GripVertical } from 'lucide-react';
import { STUDIO } from './studioTheme';

type Props = {
  direction: 'horizontal' | 'vertical';
  /** 0–1 fraction for first pane */
  ratio: number;
  onRatioChange: (ratio: number) => void;
  minFirst?: number;
  minSecond?: number;
  first: React.ReactNode;
  second: React.ReactNode;
};

export const SplitPane: React.FC<Props> = ({
  direction,
  ratio,
  onRatioChange,
  minFirst = 120,
  minSecond = 120,
  first,
  second,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [hover, setHover] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const el = containerRef.current;
        if (!el || !dragging.current) return;
        const rect = el.getBoundingClientRect();
        let next: number;
        if (direction === 'vertical') {
          const y = ev.clientY - rect.top;
          next = Math.min(0.88, Math.max(0.12, y / rect.height));
          const firstPx = next * rect.height;
          const secondPx = rect.height - firstPx;
          if (firstPx < minFirst || secondPx < minSecond) return;
        } else {
          const x = ev.clientX - rect.left;
          next = Math.min(0.88, Math.max(0.12, x / rect.width));
          const firstPx = next * rect.width;
          const secondPx = rect.width - firstPx;
          if (firstPx < minFirst || secondPx < minSecond) return;
        }
        onRatioChange(next);
      };

      const onUp = () => {
        dragging.current = false;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [direction, minFirst, minSecond, onRatioChange],
  );

  const isVert = direction === 'vertical';
  const active = hover || dragging.current;

  return (
    <div
      ref={containerRef}
      className={`flex min-h-0 min-w-0 ${isVert ? 'flex-col' : 'flex-row'}`}
      style={{ flex: 1, height: isVert ? undefined : '100%', minHeight: 0 }}
    >
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden" style={{ flex: ratio, minHeight: 0 }}>
        {first}
      </div>
      <div
        role="separator"
        aria-orientation={isVert ? 'horizontal' : 'vertical'}
        aria-label="Resize panels"
        title="Sleep om paneelgrootte aan te passen"
        onPointerDown={onPointerDown}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className={`group relative z-20 flex shrink-0 items-center justify-center ${
          isVert ? 'h-2 w-full cursor-row-resize' : 'h-full w-2 cursor-col-resize'
        }`}
        style={{
          background: active ? STUDIO.accent : STUDIO.border,
        }}
      >
        <span
          className="pointer-events-none opacity-70"
          style={{ color: active ? STUDIO.accentText : STUDIO.textDim }}
        >
          {isVert ? <GripHorizontal className="h-3 w-3" /> : <GripVertical className="h-3 w-3" />}
        </span>
      </div>
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden" style={{ flex: 1 - ratio, minHeight: 0 }}>
        {second}
      </div>
    </div>
  );
};
