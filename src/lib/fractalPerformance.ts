/** Shared GPU / fractal background performance knobs. */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/** Skip animated WebGL backgrounds — static scrim only. */
export function shouldRenderFractalWebGL(): boolean {
  return !prefersReducedMotion();
}

export function getFractalDpr(): [number, number] {
  if (prefersReducedMotion()) return [1, 1];
  if (isCoarsePointer()) return [1, 1];
  return [1, 1.25];
}

export function getExplorerMaxIter(): number {
  if (isCoarsePointer()) return 56;
  return 64;
}

export const FRACTAL_GL = {
  antialias: false,
  alpha: true,
  premultipliedAlpha: false,
  powerPreference: 'low-power' as const,
};
