export type Complex = { re: number; im: number };

export const PHI = (1 + Math.sqrt(5)) / 2;
export const GOLDEN_TURN = 1 / PHI;

export function complexSq(z: Complex): Complex {
  return {
    re: z.re * z.re - z.im * z.im,
    im: 2 * z.re * z.im,
  };
}

export function complexAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function complexMag2(z: Complex): number {
  return z.re * z.re + z.im * z.im;
}

/** Point on the main cardioid boundary for internal angle t (fraction of full turn). */
export function cardioidPoint(turns: number): Complex {
  const phi = turns * 2 * Math.PI;
  return {
    re: 0.5 * Math.cos(phi) - 0.25 * Math.cos(2 * phi),
    im: 0.5 * Math.sin(phi) - 0.25 * Math.sin(2 * phi),
  };
}

export function mandelbrotEscape(c: Complex, maxIter: number): { iter: number; escaped: boolean; z: Complex } {
  let z: Complex = { re: 0, im: 0 };
  for (let i = 0; i < maxIter; i++) {
    if (complexMag2(z) > 4) return { iter: i, escaped: true, z };
    z = complexAdd(complexSq(z), c);
  }
  return { iter: maxIter, escaped: false, z };
}

export function juliaEscape(z0: Complex, c: Complex, maxIter: number): { iter: number; escaped: boolean; z: Complex } {
  let z = { ...z0 };
  for (let i = 0; i < maxIter; i++) {
    if (complexMag2(z) > 4) return { iter: i, escaped: true, z };
    z = complexAdd(complexSq(z), c);
  }
  return { iter: maxIter, escaped: false, z };
}

export function isInMandelbrot(c: Complex, maxIter = 128): boolean {
  return !mandelbrotEscape(c, maxIter).escaped;
}

export function iterateOrbit(c: Complex, z0: Complex, maxIter = 200): Complex[] {
  const pts: Complex[] = [{ ...z0 }];
  let z = { ...z0 };
  for (let i = 0; i < maxIter; i++) {
    if (complexMag2(z) > 4) break;
    z = complexAdd(complexSq(z), c);
    pts.push({ ...z });
  }
  return pts;
}

function smoothColor(iter: number, maxIter: number): number {
  if (iter >= maxIter) return maxIter;
  return iter + 1 - Math.log2(Math.log2(Math.max(iter, 1) + 1));
}

/** RGB 0–255 — neon palette aligned with site shaders. */
export function escapeColor(iter: number, maxIter: number, escaped: boolean): [number, number, number] {
  if (!escaped) return [8, 8, 14];
  const t = (smoothColor(iter, maxIter) / maxIter) % 1;
  const hue = t * 0.85 + 0.35;
  const h = hue * 6;
  const x = 1 - Math.abs((h % 2) - 1);
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 1) {
    r = 1;
    g = x;
  } else if (h < 2) {
    r = x;
    g = 1;
  } else if (h < 3) {
    g = 1;
    b = x;
  } else if (h < 4) {
    g = x;
    b = 1;
  } else if (h < 5) {
    r = x;
    b = 1;
  } else {
    r = 1;
    b = x;
  }
  const boost = 0.55 + 0.45 * (1 - t);
  return [Math.round(r * 255 * boost), Math.round(g * 255 * boost), Math.round(b * 255 * boost)];
}

export type FractalView = {
  centerRe: number;
  centerIm: number;
  /** Complex-plane units visible across the shorter canvas edge. */
  span: number;
};

export function pixelToComplex(
  px: number,
  py: number,
  width: number,
  height: number,
  view: FractalView
): Complex {
  const scale = view.span / Math.min(width, height);
  const dx = (px - width / 2) * scale;
  const dy = (py - height / 2) * scale;
  return { re: view.centerRe + dx, im: view.centerIm - dy };
}

export function complexToPixel(
  c: Complex,
  width: number,
  height: number,
  view: FractalView
): { x: number; y: number } {
  const scale = view.span / Math.min(width, height);
  return {
    x: width / 2 + (c.re - view.centerRe) / scale,
    y: height / 2 - (c.im - view.centerIm) / scale,
  };
}

export function renderMandelbrot(
  image: ImageData,
  view: FractalView,
  maxIter: number,
  marker?: Complex
): void {
  const { width, height, data } = image;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const c = pixelToComplex(px, py, width, height, view);
      const { iter, escaped } = mandelbrotEscape(c, maxIter);
      const [r, g, b] = escapeColor(iter, maxIter, escaped);
      const i = (py * width + px) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  if (marker) {
    const { x, y } = complexToPixel(marker, width, height, view);
    const radius = 5;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const mx = Math.round(x + dx);
        const my = Math.round(y + dy);
        if (mx < 0 || mx >= width || my < 0 || my >= height) continue;
        const i = (my * width + mx) * 4;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }
  }
}

export function renderJulia(
  image: ImageData,
  c: Complex,
  view: FractalView,
  maxIter: number
): void {
  const { width, height, data } = image;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const z0 = pixelToComplex(px, py, width, height, view);
      const { iter, escaped } = juliaEscape(z0, c, maxIter);
      const [r, g, b] = escapeColor(iter, maxIter, escaped);
      const i = (py * width + px) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
}

/** Logarithmic spiral sample for golden-ratio guide overlay (reference only). */
export function goldenSpiralPoints(steps: number, maxR: number): Complex[] {
  const pts: Complex[] = [];
  const b = Math.log(PHI) / (Math.PI / 2);
  for (let i = 0; i < steps; i++) {
    const theta = i * 0.22;
    const r = 0.04 * Math.exp(b * theta);
    if (r > maxR) break;
    pts.push({ re: r * Math.cos(theta), im: r * Math.sin(theta) });
  }
  return pts;
}
