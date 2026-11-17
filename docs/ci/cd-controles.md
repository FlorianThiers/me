# CD-controles (CI & smoke na deploy)

Deze repository gebruikt **`master`** als basisbranch (geen `develop`).

## Workflows

| Workflow | Trigger | Doel |
| --- | --- | --- |
| [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) | `pull_request`, push op `master` / `develop` / `main` | Lint, typecheck, build |
| [`.github/workflows/smoke-deploy.yml`](../../.github/workflows/smoke-deploy.yml) | `deployment_status` (alleen Vercel, `success`) | Korte Playwright-smoke op preview of productie |

Beide workflows gebruiken **concurrency** met `cancel-in-progress`.

### Basis-CI

- **Lint (CI):** `npm run lint:ci` — draait ESLint op de hele tree en **faalt alleen op nieuwe fouten** t.o.v. [`eslint-baseline.json`](../../eslint-baseline.json). Lokaal blijft `npm run lint` de volledige output tonen.
- **Typecheck:** `npm run typecheck` (`tsc -b`)
- **Build:** `npm run build` met placeholder `VITE_*`-waarden (geen echte secrets in CI)
- **npm-cache** via `actions/setup-node@v4` (`cache: npm`)

### Smoke na deploy

- Alleen **GET** op publieke pagina's (`/`, `/links`, `/portfolio`, `/skills`): status 2xx, geen `console.error`.
- **Chromium** alleen; Playwright-run beperkt (`globalTimeout` 90s); GitHub-job `timeout-minutes: 10` (ruimte voor `npm ci` + browserinstall).
- **Productie:** `github.event.deployment.environment == Production` (geen branchnaam-check).
- **Preview:** alleen als repo-secret **`VERCEL_AUTOMATION_BYPASS_SECRET`** is gezet (header `x-vercel-protection-bypass`). Zonder secret: job **slaagt** en noteert in de **job summary** dat preview-smoke is overgeslagen.

### Supabase-migraties

Er is **geen** `supabase/migrations`-map in deze repo; er is geen migratiecheck-workflow toegevoegd.

## Optionele GitHub-secrets

| Secret | Gebruik |
| --- | --- |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Preview-smoke tegen Vercel Deployment Protection |

Geen secrets worden in workflows of logs gezet. Niet zelf configureren via deze PR.

## Lokaal testen

```bash
npm ci
npm run lint          # volledige ESLint-uitvoer
npm run lint:ci       # zoals in GitHub Actions
npm run typecheck
npm run build
npx playwright install chromium
npx playwright test --list
# Tegen een draaiende site (bijv. `npm run preview`):
BASE_URL=http://127.0.0.1:4173 npm run test:smoke
```

Vitest (`npm test`) blijft los van de deploy-smoke.

## ESLint-baseline (bestaande schuld)

- **38** bekende errors (nov 2025) staan in `eslint-baseline.json`; CI blokkeert geen merges daarvan, wel **nieuwe** errors in gewijzigde of nieuwe code.
- Na het oplossen van baseline-issues: `npm run lint:baseline:update` en commit de bijgewerkte baseline.
- Kleine veilige fix in deze PR: `prefer-const` in `api/_lib/opsUsageSources.ts` (2 fouten minder dan bij eerste CI-run).

## Bekende beperkingen

- **Smoke-deploy** is niet lokaal gedraaid tegen echte Vercel-preview/productie-URL's in deze setup.