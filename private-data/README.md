# Private JSON snapshots (not served from `public/`)

Place real exports here for local dev or a secure deployment pipeline:

- `home-stock.json`
- `julia-snapshot.json`
- `plant-catalog.json`
- `dashboard-snapshot.json`

## Ops usage (CSV / JSON)

Local layout under `private-data/ops-usage/`:

- `grok-usage.csv`
- `cursor-csv/*.csv`
- optional `cursor-usage-summary.json` (limits / metadata)
- optional `config.json` (`cursorMonthlyTokenLimit`)

**Production (Vercel):** prefer **Vercel Blob** (server env `BLOB_READ_WRITE_TOKEN` only — never `VITE_` / `NEXT_PUBLIC_`). Blob pathnames:

- `ops-usage/grok-usage.csv`
- `ops-usage/cursor-usage-summary.json`
- `ops-usage/cursor-csv/*.csv`

Upload from your machine:

```bash
BLOB_READ_WRITE_TOKEN=... node scripts/upload-ops-usage.mjs ./ops-usage
```

Default source directory: `/workspace/ops-usage`. Overwrites are allowed. Use **private** blob access when your store supports it; the API tries private then public reads.

`GET /api/private/ops-usage` checks the **site session first** (401 without cookie), then loads Blob → local `private-data/` → committed `public/data/ops-usage/*.example*` (with **Voorbeelddata** banner).

This directory is gitignored. Authenticated `/api/private/*` handlers never expose these files via static hosting.

On Vercel without Blob or local files, example data is read from the deployed `/data/ops-usage/*.example*` assets.
