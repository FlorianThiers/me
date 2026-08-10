import type { DesignData, DesignElement, ScaleConfig } from '../types/gardenDesigner';
import { drawElement } from './canvasUtils';
import { getElementsBounds } from './viewUtils';
import { formatDimension, unitToPixels } from './unitUtils';

export interface PlanExportOptions {
  designData: DesignData;
  /** Elements already filtered for visibility (plan top view). */
  elements: DesignElement[];
  title?: string;
  paddingPx?: number;
  /** Extra margin for title block + scale bar */
  chromePx?: number;
  background?: string;
}

function visibleElements(
  elements: DesignElement[],
  layerVisibility: DesignData['layerVisibility']
): DesignElement[] {
  return elements.filter(el => el.visible && (layerVisibility[el.layer] ?? true));
}

/** Render a printable plan bitmap (world units → pixels, 1:1 with design scale). */
export function renderPlanCanvas(opts: PlanExportOptions): HTMLCanvasElement | null {
  const {
    designData,
    elements,
    title = designData.name,
    paddingPx = 40,
    chromePx = 72,
    background = '#ffffff'
  } = opts;

  const visible = visibleElements(elements, designData.layerVisibility);
  const bounds = getElementsBounds(visible);
  if (!bounds) return null;

  const contentW = Math.max(bounds.maxX - bounds.minX, 100);
  const contentH = Math.max(bounds.maxY - bounds.minY, 100);
  const width = Math.ceil(contentW + paddingPx * 2);
  const height = Math.ceil(contentH + paddingPx * 2 + chromePx);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  // Title block
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillText(title, paddingPx, 28);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#4b5563';
  const dateStr = new Date().toLocaleDateString('nl-BE');
  ctx.fillText(`Verbouwingsplan · ${dateStr}`, paddingPx, 48);

  // Plan content
  ctx.save();
  ctx.translate(paddingPx - bounds.minX, paddingPx + chromePx - 24 - bounds.minY);

  // Light grid in cm steps (every 50 cm when 1px=1cm)
  drawExportGrid(ctx, bounds, designData.scale);

  for (const el of visible) {
    drawElement(ctx, el, false, true, designData.scale);
  }
  ctx.restore();

  drawScaleBar(ctx, designData.scale, paddingPx, height - 28, width - paddingPx * 2);
  drawNorthArrow(ctx, width - paddingPx - 28, 36);

  return canvas;
}

function drawExportGrid(
  ctx: CanvasRenderingContext2D,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  scale: ScaleConfig
) {
  const step = unitToPixels(50, 'cm', scale); // 50 cm grid
  if (step < 4) return;

  ctx.save();
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  const startX = Math.floor(bounds.minX / step) * step;
  const startY = Math.floor(bounds.minY / step) * step;
  for (let x = startX; x <= bounds.maxX + step; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, bounds.minY - 20);
    ctx.lineTo(x, bounds.maxY + 20);
    ctx.stroke();
  }
  for (let y = startY; y <= bounds.maxY + step; y += step) {
    ctx.beginPath();
    ctx.moveTo(bounds.minX - 20, y);
    ctx.lineTo(bounds.maxX + 20, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawScaleBar(
  ctx: CanvasRenderingContext2D,
  scale: ScaleConfig,
  x: number,
  y: number,
  maxWidth: number
) {
  const oneMeterPx = unitToPixels(1, 'm', scale);
  let barMeters = 1;
  let barPx = oneMeterPx;
  if (barPx > maxWidth * 0.45) {
    barMeters = 0.5;
    barPx = unitToPixels(50, 'cm', scale);
  } else if (barPx * 2 < maxWidth * 0.35) {
    barMeters = 2;
    barPx = oneMeterPx * 2;
  }

  const barH = 8;
  ctx.fillStyle = '#111827';
  ctx.fillRect(x, y - barH, barPx / 2, barH);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1;
  ctx.fillRect(x + barPx / 2, y - barH, barPx / 2, barH);
  ctx.strokeRect(x, y - barH, barPx, barH);

  ctx.fillStyle = '#111827';
  ctx.font = '11px system-ui, sans-serif';
  const label =
    barMeters >= 1
      ? `${barMeters} m`
      : formatDimension(barPx, scale);
  ctx.fillText(`Schaal · ${label}`, x, y - barH - 6);
  ctx.fillText(
    `1 ${scale.unit} = ${scale.pixelsPerUnit} px`,
    x + barPx + 12,
    y - 2
  );
}

function drawNorthArrow(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 14);
  ctx.lineTo(cx + 7, cy + 10);
  ctx.lineTo(cx, cy + 4);
  ctx.lineTo(cx - 7, cy + 10);
  ctx.closePath();
  ctx.fill();
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', cx, cy + 24);
  ctx.restore();
}

export function downloadPlanPng(opts: PlanExportOptions, filename?: string): boolean {
  const canvas = renderPlanCanvas(opts);
  if (!canvas) return false;
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `${sanitizeFilename(opts.designData.name)}-plan.png`;
  link.click();
  return true;
}

/** Open a print window so the user can Save as PDF (no extra dependency). */
export function printPlanPdf(opts: PlanExportOptions): boolean {
  const canvas = renderPlanCanvas(opts);
  if (!canvas) return false;
  const dataUrl = canvas.toDataURL('image/png');
  const title = opts.title ?? opts.designData.name;
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!w) return false;
  w.document.write(`<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} — PDF</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body { margin: 0; font-family: system-ui, sans-serif; background: #fff; color: #111; }
    h1 { font-size: 16px; margin: 0 0 8px; }
    p { font-size: 12px; color: #555; margin: 0 0 12px; }
    img { max-width: 100%; height: auto; border: 1px solid #e5e7eb; }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <p class="no-print">Gebruik <strong>Ctrl+P → Opslaan als PDF</strong> (of Afdrukken).</p>
  <h1>${escapeHtml(title)}</h1>
  <p>Verbouwingsplan · ${new Date().toLocaleString('nl-BE')}</p>
  <img src="${dataUrl}" alt="Plan" />
  <script>window.onload = () => setTimeout(() => window.print(), 250);</script>
</body>
</html>`);
  w.document.close();
  return true;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'plan';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
