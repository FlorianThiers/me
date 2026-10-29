import React, { useCallback, useRef } from 'react';
import { Minus, Square, X } from 'lucide-react';
import type { WindowFrame } from '../../music/windows';

type Props = {
  title: string;
  accent?: string;
  frame: WindowFrame;
  onChange: (patch: Partial<WindowFrame>) => void;
  onFocus: () => void;
  onClose: () => void;
  children: React.ReactNode;
};

type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
type DragKind = 'move' | Edge;

const EDGE_SIZE = 5;

const CURSOR_MAP: Record<Edge, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize',
};

export const FloatingWindow: React.FC<Props> = ({
  title,
  accent = '#c4783a',
  frame,
  onChange,
  onFocus,
  onClose,
  children,
}) => {
  const dragRef = useRef<{
    kind: DragKind;
    startX: number;
    startY: number;
    orig: WindowFrame;
  } | null>(null);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const o = drag.orig;

      if (drag.kind === 'move') {
        onChange({ x: o.x + dx, y: o.y + dy });
        return;
      }

      const patch: Partial<WindowFrame> = {};
      const edge = drag.kind;

      if (edge.includes('e')) {
        patch.w = Math.max(220, o.w + dx);
      }
      if (edge.includes('w')) {
        const newW = Math.max(220, o.w - dx);
        patch.w = newW;
        patch.x = o.x + o.w - newW;
      }
      if (edge.includes('s')) {
        patch.h = Math.max(120, o.h + dy);
      }
      if (edge.includes('n')) {
        const newH = Math.max(120, o.h - dy);
        patch.h = newH;
        patch.y = o.y + o.h - newH;
      }

      onChange(patch);
    },
    [onChange],
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
    document.body.style.cursor = '';
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
  }, [onPointerMove]);

  const startDrag = (kind: DragKind, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    dragRef.current = { kind, startX: e.clientX, startY: e.clientY, orig: frame };
    if (kind !== 'move') document.body.style.cursor = CURSOR_MAP[kind];
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
  };

  if (!frame.open) return null;

  const minimized = frame.minimized;
  const edges: { edge: Edge; style: React.CSSProperties }[] = minimized
    ? []
    : [
        { edge: 'n', style: { top: 0, left: EDGE_SIZE, right: EDGE_SIZE, height: EDGE_SIZE, cursor: 'ns-resize' } },
        { edge: 's', style: { bottom: 0, left: EDGE_SIZE, right: EDGE_SIZE, height: EDGE_SIZE, cursor: 'ns-resize' } },
        { edge: 'w', style: { top: EDGE_SIZE, bottom: EDGE_SIZE, left: 0, width: EDGE_SIZE, cursor: 'ew-resize' } },
        { edge: 'e', style: { top: EDGE_SIZE, bottom: EDGE_SIZE, right: 0, width: EDGE_SIZE, cursor: 'ew-resize' } },
        { edge: 'nw', style: { top: 0, left: 0, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2, cursor: 'nwse-resize' } },
        { edge: 'ne', style: { top: 0, right: 0, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2, cursor: 'nesw-resize' } },
        { edge: 'sw', style: { bottom: 0, left: 0, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2, cursor: 'nesw-resize' } },
        { edge: 'se', style: { bottom: 0, right: 0, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2, cursor: 'nwse-resize' } },
      ];

  return (
    <div
      className="absolute flex flex-col overflow-visible border border-[#2e2e2e] bg-[#141414] shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.w,
        height: minimized ? 28 : frame.h,
        zIndex: frame.z,
      }}
      onMouseDown={onFocus}
    >
      <div
        className="flex h-7 shrink-0 cursor-grab select-none items-center gap-1 border-b border-[#2a2a2a] bg-[#1a1a1a] px-1.5 active:cursor-grabbing"
        onPointerDown={(e) => startDrag('move', e)}
        onDoubleClick={() => onChange({ minimized: !minimized })}
      >
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: accent }} />
        <span className="min-w-0 flex-1 truncate text-[10px] font-medium uppercase tracking-wide text-[#c8c8c8]">
          {title}
        </span>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center text-[#6a6a6a] hover:text-white"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onChange({ minimized: !minimized })}
        >
          {minimized ? <Square className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
        </button>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center text-[#6a6a6a] hover:text-[#c45c4a]"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      {!minimized && <div className="min-h-0 flex-1 overflow-hidden">{children}</div>}
      {edges.map(({ edge, style }) => (
        <div
          key={edge}
          className="absolute z-50"
          style={style}
          onPointerDown={(e) => startDrag(edge, e)}
        />
      ))}
    </div>
  );
};
