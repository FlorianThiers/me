# Private JSON snapshots (not served from `public/`)

Place real exports here for local dev or a secure deployment pipeline:

- `home-stock.json`
- `julia-snapshot.json`
- `plant-catalog.json`
- `dashboard-snapshot.json`

This directory is gitignored. The authenticated `/api/private/*` handlers read
these files first, then fall back to sanitized `public/data/*.example.json`.

On Vercel, add files via your own process (e.g. CI that writes into the
deployment bundle, or a future blob store). They are **not** committed to the
public GitHub repo.
