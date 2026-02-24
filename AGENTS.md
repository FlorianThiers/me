# AGENTS.md

## Cursor Cloud specific instructions

This is a single React + TypeScript + Vite SPA (no backend, no database, no Docker). All data comes from external APIs; the app degrades gracefully without API keys.

### Key commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (Vite on port 5173) |
| Lint | `npm run lint` |
| Build | `npm run build` (runs `tsc -b && vite build`) |
| Preview prod build | `npm run preview` |

### Notes

- ESLint has ~49 pre-existing warnings/errors (mostly `no-explicit-any` and unused vars). These are in the existing codebase and not regressions.
- No automated test suite exists; testing is manual via the browser.
- The Vite dev server proxies `/api/fred` and `/api/yahoo` to external APIs (configured in `vite.config.ts`).
- Optional `.env` vars (`VITE_ALPHA_VANTAGE_API_KEY`, `VITE_FRED_API_KEY`, etc.) enable financial data features on the investment page; the app works without them.
- i18n supports EN, NL, ES — translations live in `src/i18n.ts` and related files.
