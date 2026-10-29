import React, { useCallback, useEffect, useRef } from 'react';
import {
  type Complex,
  type FractalView,
  complexToPixel,
  pixelToComplex,
  renderJulia,
  renderMandelbrot,
} from '../../lib/fractalMath';
import { getExplorerMaxIter } from '../../lib/fractalPerformance';

type Mode = 'mandelbrot' | 'julia';

type Props = {
  mode: Mode;
  view: FractalView;
  c: Complex;
  maxIter?: number;
  marker?: Complex;
  className?: string;
  ariaLabel: string;
  onPick?: (z: Complex) => void;
  pickOnHover?: boolean;
  active?: boolean;
};

const MAX_RENDER_PX = 360;

function renderSize(rect: DOMRect): { w: number; h: number } {
  const scale = Math.min(1, MAX_RENDER_PX / Math.max(rect.width, rect.height, 1));
  return {
    w: Math.max(1, Math.floor(rect.width * scale)),
    h: Math.max(1, Math.floor(rect.height * scale)),
  };
}

function viewKey(view: FractalView): string {
  return `${view.centerRe},${view.centerIm},${view.span}`;
}

function drawMarker(ctx: CanvasRenderingContext2D, marker: Complex, w: number, h: number, view: FractalView) {
  const { x, y } = complexToPixel(marker, w, h, view);
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export const FractalCanvas: React.FC<Props> = ({
  mode,
  view,
  c,
  maxIter = getExplorerMaxIter(),
  marker,
  className = '',
  ariaLabel,
  onPick,
  pickOnHover = false,
  active = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mandelbrotBase = useRef<{ key: string; image: ImageData } | null>(null);
  const juliaTask = useRef(0);

  const paintMandelbrot = useCallback(
    (markerPoint?: Complex) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const { w, h } = renderSize(rect);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        mandelbrotBase.current = null;
      }

      const baseKey = `${w}x${h}:${viewKey(view)}:${maxIter}`;
      if (!mandelbrotBase.current || mandelbrotBase.current.key !== baseKey) {
        const image = ctx.createImageData(w, h);
        renderMandelbrot(image, view, maxIter);
        mandelbrotBase.current = { key: baseKey, image };
      }

      ctx.putImageData(mandelbrotBase.current.image, 0, 0);
      if (markerPoint) {
        drawMarker(ctx, markerPoint, w, h, view);
      }
    },
    [view, maxIter]
  );

  const paintJulia = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const taskId = ++juliaTask.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const { w, h } = renderSize(rect);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const image = ctx.createImageData(w, h);
    renderJulia(image, c, view, maxIter);
    if (taskId !== juliaTask.current) return;
    ctx.putImageData(image, 0, 0);
  }, [c, view, maxIter]);

  useEffect(() => {
    if (!active) return;
    if (mode === 'mandelbrot') {
      paintMandelbrot(marker ?? c);
      return;
    }
    const frame = requestAnimationFrame(paintJulia);
    return () => cancelAnimationFrame(frame);
  }, [mode, paintMandelbrot, paintJulia, marker, c, active]);

  const handlePointer = (clientX: number, clientY: number) => {
    if (!onPick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { w, h } = renderSize(rect);
    const px = ((clientX - rect.left) / rect.width) * w;
    const py = ((clientY - rect.top) / rect.height) * h;
    onPick(pixelToComplex(px, py, w, h, view));
  };

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full touch-none ${onPick ? 'cursor-crosshair' : 'cursor-default'} ${className}`}
      aria-label={ariaLabel}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        handlePointer(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (pickOnHover && e.pointerType === 'mouse') {
          handlePointer(e.clientX, e.clientY);
          return;
        }
        if (e.buttons === 0 && e.pointerType !== 'touch') return;
        if (!e.currentTarget.hasPointerCapture(e.pointerId) && e.pointerType !== 'touch') return;
        handlePointer(e.clientX, e.clientY);
      }}
    />
  );
};
