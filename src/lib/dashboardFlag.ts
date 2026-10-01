/**
 * Lokaal persoonlijk dashboard: alleen in dev of met VITE_ENABLE_DASHBOARD=1 (niet in de Vercel-build).
 * Gebruikt door App.tsx (routes) en Navigation.tsx (header-link).
 */
export const DASHBOARD_ENABLED: boolean =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DASHBOARD === '1';
