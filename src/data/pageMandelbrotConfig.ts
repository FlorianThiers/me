import { ORBIT_TRAP_BY_ROUTE, resolveOrbitTrap, type OrbitTrapSettings } from './orbitTrapPresets';

/**
 * Per-page fractal backgrounds:
 * - mandelbrot: ONE fixed valley, local breathe / rotate / colour
 * - mandelbrotMorph: hub tour through all valleys (/mandelbrot only)
 * - orbitTrap: Julia orbit trap variants (see orbitTrapPresets.ts)
 */
export type FractalBackgroundKind = 'mandelbrot' | 'mandelbrotMorph' | 'orbitTrap';

export type MandelbrotSpotId =
  | 'overview'
  | 'elephant'
  | 'seahorse'
  | 'lightning'
  | 'misiurewicz'
  | 'spiral'
  | 'mini';

export type MandelbrotViewConfig = {
  spotId: MandelbrotSpotId;
  centerX: number;
  centerY: number;
  zoomLevel: number;
  zoomBreathAmp: number;
  breathSec: number;
  rotationSpeed: number;
  zoomSpeed: number;
  colorPhase: number;
  iterations: number;
  nameKey: string;
  metaphorKey: string;
};

const spot = (
  id: MandelbrotSpotId,
  centerX: number,
  centerY: number,
  zoomLevel: number,
  overrides: Partial<MandelbrotViewConfig> = {}
): MandelbrotViewConfig => ({
  spotId: id,
  centerX,
  centerY,
  zoomLevel,
  zoomBreathAmp: 0.1,
  breathSec: 28,
  rotationSpeed: 0.04,
  zoomSpeed: 0.55,
  colorPhase: 0,
  iterations: 150,
  nameKey: `mandelbrot.locations.${id}.name`,
  metaphorKey: `mandelbrot.locations.${id}.metaphor`,
  ...overrides,
});

export const MANDELBROT_SPOTS: Record<MandelbrotSpotId, MandelbrotViewConfig> = {
  overview: spot('overview', -0.55, 0.02, 1.35, {
    zoomBreathAmp: 0.08,
    rotationSpeed: 0.025,
    zoomSpeed: 0.35,
  }),
  elephant: spot('elephant', -0.7453, 0.1127, 2.15, {
    breathSec: 32,
    rotationSpeed: 0.05,
  }),
  seahorse: spot('seahorse', -0.8, 0.156, 2.45, {
    breathSec: 26,
    rotationSpeed: 0.055,
    zoomBreathAmp: 0.14,
  }),
  lightning: spot('lightning', -0.16, 1.0405, 2.0, {
    breathSec: 22,
    rotationSpeed: 0.07,
    zoomSpeed: 0.75,
  }),
  misiurewicz: spot('misiurewicz', -1.25066, 0.02012, 2.6, {
    breathSec: 34,
    rotationSpeed: 0.035,
    zoomBreathAmp: 0.08,
  }),
  spiral: spot('spiral', -0.7269, 0.1889, 2.35, {
    breathSec: 24,
    rotationSpeed: 0.065,
    zoomBreathAmp: 0.16,
  }),
  mini: spot('mini', 0.28, 0.008, 3.1, {
    breathSec: 30,
    rotationSpeed: 0.045,
    zoomBreathAmp: 0.12,
  }),
};

export const MANDELBROT_HUB_SPOTS = (
  Object.keys(MANDELBROT_SPOTS) as MandelbrotSpotId[]
).filter((id) => id !== 'overview');

export type PageFractalEntry = {
  spotId: MandelbrotSpotId;
  fractalKind?: FractalBackgroundKind;
} & Partial<MandelbrotViewConfig>;

export type PageFractalConfig = {
  kind: FractalBackgroundKind;
  view: MandelbrotViewConfig;
  orbitTrap?: OrbitTrapSettings;
};

export const MANDELBROT_MORPH_TOUR: Pick<
  MandelbrotViewConfig,
  'centerX' | 'centerY' | 'zoomLevel'
>[] = [
  MANDELBROT_SPOTS.overview,
  ...MANDELBROT_HUB_SPOTS.map((id) => MANDELBROT_SPOTS[id]),
];

/** Routes with orbit-trap presets — re-export for hub / docs. */
export const ORBIT_TRAP_ROUTES = Object.keys(ORBIT_TRAP_BY_ROUTE);

export const PAGE_MANDELBROT: Record<string, PageFractalEntry> = {
  '/mandelbrot': { spotId: 'overview', fractalKind: 'mandelbrotMorph' },
  '/cv': { spotId: 'overview', colorPhase: 0.1 },
  '/portfolio': { spotId: 'mini' },
  '/skills': { spotId: 'seahorse' },
  '/journey': { spotId: 'elephant', breathSec: 30 },
  '/goals': { spotId: 'lightning', colorPhase: 0.2 },
  '/julia/usage': { spotId: 'elephant', zoomLevel: 2.4 },
  '/life-rhythm': { spotId: 'spiral', breathSec: 28 },
  '/interests': { spotId: 'mini', zoomLevel: 2.85 },
  '/mind-computer': { spotId: 'seahorse', zoomLevel: 2.55 },
  '/philosopher/carl-jung': { spotId: 'misiurewicz' },
  '/philosopher/william-james': { spotId: 'seahorse', colorPhase: 0.45 },
  '/philosopher/sigmund-freud': { spotId: 'elephant', zoomLevel: 2.35 },
  '/philosopher/alan-turing': { spotId: 'mini', zoomLevel: 2.95 },
  '/philosopher/itzhak-bentov': { spotId: 'lightning', colorPhase: 0.6 },
  '/topics/substances': { spotId: 'misiurewicz', colorPhase: 0.15 },
  '/topics/meditation': { spotId: 'misiurewicz', breathSec: 36 },
  '/topics/quantum': { spotId: 'lightning', zoomLevel: 2.15 },
  '/topics/ai-consciousness': { spotId: 'seahorse', zoomLevel: 2.7 },
  '/topics/neural-networks': { spotId: 'seahorse', colorPhase: 0.35 },
  '/topics/consciousness-expansion': { spotId: 'spiral', colorPhase: 0.5 },
  '/music': { spotId: 'lightning', zoomSpeed: 0.85 },
  '/sports': { spotId: 'spiral' },
  '/sports/dapo-flow-star': { spotId: 'spiral', zoomLevel: 2.55, rotationSpeed: 0.08 },
  '/sports/dancing': { spotId: 'spiral', zoomLevel: 2.2, breathSec: 20 },
  '/cultivation': { spotId: 'mini', colorPhase: 0.25 },
  '/cooking': { spotId: 'lightning', zoomLevel: 1.95 },
  '/stock': { spotId: 'overview', zoomLevel: 1.5 },
  '/garden-designer': { spotId: 'mini', zoomLevel: 2.75, breathSec: 32 },
  '/beleggen': { spotId: 'overview', zoomLevel: 1.42, colorPhase: 0.7 },
  '/moltbook': { spotId: 'seahorse', colorPhase: 0.55 },
};

const DEFAULT_PAGE = PAGE_MANDELBROT['/interests'];

export function getMandelbrotViewForPath(pathname: string): MandelbrotViewConfig {
  const entry = PAGE_MANDELBROT[pathname] ?? DEFAULT_PAGE;
  const base = MANDELBROT_SPOTS[entry.spotId];
  const { spotId: _s, fractalKind: _k, ...overrides } = entry;
  return { ...base, ...overrides, spotId: entry.spotId };
}

export function getPageFractalConfig(pathname: string): PageFractalConfig {
  const entry = PAGE_MANDELBROT[pathname] ?? DEFAULT_PAGE;
  const orbitTrap = resolveOrbitTrap(pathname);
  const kind =
    entry.fractalKind ?? (orbitTrap ? 'orbitTrap' : 'mandelbrot');

  return {
    kind,
    view: getMandelbrotViewForPath(pathname),
    orbitTrap: kind === 'orbitTrap' ? orbitTrap : undefined,
  };
}
