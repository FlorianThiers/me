/** Routes that require site admin login (UX guard; APIs enforce auth). */
export const PRIVATE_ROUTE_PREFIXES = [
  '/dashboard',
  '/julia',
  '/life-rhythm',
  '/stock',
  '/beleggen',
  '/garden-designer',
  '/cooking',
  '/cultivation',
  '/topics/substances',
] as const;

export const LOGIN_PATH = '/login';

export function isPrivatePath(pathname: string): boolean {
  if (pathname === LOGIN_PATH) return true;
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isPrivateAppRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Nav entries shown only when authenticated. */
export const AUTH_ONLY_NAV_PATHS = new Set(['/julia', '/dashboard']);

/** Interest cards (InterestsPage) hidden for visitors. */
export const AUTH_ONLY_INTEREST_KEYS = new Set([
  'lifeRhythm',
  'gardenDesign',
  'investing',
  'cultivation',
  'cooking',
  /** Chakra calendar card on /interests */
  'timeVisualization',
]);

/** Mind-computer topic cards linking to private routes (hidden for visitors). */
export const AUTH_ONLY_MIND_COMPUTER_TOPIC_KEYS = new Set(['substances']);
