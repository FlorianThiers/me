# Persoonlijk dashboard (lokaal, v1)

Alleen bedoeld voor localhost. Link **Dashboard** staat in de site-header (desktop + mobiel menu), ook alleen in dev.

| Pagina | Route |
|--------|-------|
| Overzicht (compacte samenvatting van alle blokken) | /dashboard |
| Voorraad (koelkast / diepvries / kast / overig, bijna over datum, DEMO/verouderd) | /dashboard/voorraad |
| Taken | /dashboard/taken |
| Workouts | /dashboard/workouts |
| Tuin | /dashboard/tuin |
| Welzijn (stemming / water / slaap) | /dashboard/welzijn |

Opbouw: src/pages/DashboardRoutes.tsx (lazy, geneste routes) -> DashboardLayout (sidenav links, inklapbaar op mobiel,
laadt data één keer en deelt die via useDashboardData()) -> pagina's in src/pages/ en src/pages/dashboard/.
Blokken (StockBlock, GardenBlock, ...) hebben ariant="summary" (overzicht) en ariant="detail" (eigen pagina).
Stijl: 12-koloms grid (gap-6), kaartkoppen in wit met accentbalkje (geen 	ext-neon-blue), tekst >= 12 px en
>= WCAG AA contrast op #0a0a0a.

## Starten

`powershell
cd C:\Users\flort\MySpace\me-dashboard   # git worktree van branch feat/personal-dashboard
npm run dev                               # Vite, standaard http://localhost:5173/dashboard (of de eerstvolgende vrije poort)
`

De routes en de header-link bestaan alleen in dev (import.meta.env.DEV) of als je expliciet bouwt met
VITE_ENABLE_DASHBOARD=1 (zie src/lib/dashboardFlag.ts). Een gewone productiebuild (Vercel) bevat ze **niet**.
public/data/dashboard-snapshot.json is **gitignored** (persoonlijke data mag niet in een
publieke deploy/commit terechtkomen). Zonder dat bestand toont de pagina
dashboard-snapshot.example.json met een duidelijke DEMO-markering.
## Data

| Blok | Bron | Bestand / veld |
|------|------|----------------|
| Voorraad | Notion Pantry Stock via `export_home_stock.py` | `public/data/home-stock.json` (type `HomeStockSnapshot`), samenvatting ook in `dashboard-snapshot.json` -> `stats.stock` |
| Tuin | Notion Garden Crops (`9278ca4d-...`) | `garden` |
| Taken | Todoist | `tasks` (vandaag / achterstallig / afgevinkt sinds maandag) |
| Workouts | Notion Workout-log (`collection://be8bbf11-...`) | `workouts` |
| Stemming/water/slaap | Notion Life Day (`34c5e1c3-...`) + Life Entry (`cb069679-...`, Categorie Mood/Sleep) | `mood.days` (7 dagen) |

Elk blok heeft `meta { source, asOf, isDemo }`. UI-labels: **DEMO** (isDemo), **Verouderd**
(ouder dan 14 d tuin / 7 d voorraad & workouts / 3 d stemming / 1 d taken) en **Leeg**.

Snapshot genereren (workflow-os):

```powershell
cd C:\Users\flort\workflow-os
python scripts\export_dashboard_snapshot.py --repo C:\Users\flort\MySpace\me-dashboard
python scripts\export_dashboard_snapshot.py --offline   # alleen seed + home-stock, geen netwerk
```

Zonder `TODOIST_API_TOKEN` / Notion-token valt elk blok terug op `scripts/data/dashboard-seed.json`
(momentopname) en anders op leeg + `isDemo:true`. De aanpassingsplek staat bovenaan in het script
(`SOURCES`, `fetch_*`).

## Pantry-datamodel (`src/types/pantry.ts`, `src/lib/pantry.ts`)

- Locaties: `koelkast | diepvries | kast | overig`. Notion-locaties worden gemapt
  (`Koelkast`->koelkast, `Diepvries`->diepvries, `Droogschap`/`Kast n`->kast, rest->overig).
- Categorie: Fruit, Groente, Vlees, Vis, Zuivel, Overig (zelfde als `StockCategory`).
- `PantryItem`: id, name, category, location, subLocation, quantity, unit, expiry (THT), addedAt, updatedAt, notionId.
- `PantryState`: `items` + append-only `events`. Events:
  - `shopping_round` - items toegevoegd na een boodschappenronde (zelfde naam+locatie+eenheid+THT wordt samengevoegd).
  - `meal_cooked` - verbruikte items (`consumed`) en eventuele restjes/batch (`leftovers`, bv. naar diepvries).
  - `manual_adjust` / `discard` - correcties, weggooien.
- `applyPantryEvent(state, event)` is een pure functie; er is **nog geen** UI, opslag of Notion-sync.

### Hoe updates later verlopen (nog NIET geautomatiseerd)

1. **Boodschappenronde**: na het winkelen een `shopping_round`-event (handmatig of uit de Todoist
   "Boodschappen"-sectie/ticket) -> items in Notion Pantry Stock aanmaken (`Locatie`, `Vers categorie`,
   `Hoeveelheid`, `Eenheid`, `THT`).
2. **Avondmaal gekookt**: bij het afvinken van de "Koken - ..."-taak een `meal_cooked`-event met de
   ingredienten uit het recept; verbruikte hoeveelheden aftrekken (0 = Status `Op`), restjes als nieuw item
   (vaak `diepvries`).
3. `export_home_stock.py` + `export_dashboard_snapshot.py` draaien (GM-run) -> dashboard ververst.
   Notion blijft de bron van waarheid; het event-model is het contract voor de latere sync.

Open keuzes: zie eindrapport (granulariteit hoeveelheden, per-recept ingredientenlijst, wie schrijft naar Notion).
