import React from 'react';
import type { HomeStockSnapshot, StockItem } from '../../types/homeStock';
import type { StockSummary } from '../../types/dashboardSnapshot';
import { PANTRY_LOCATIONS, PANTRY_LOCATION_LABELS, type PantryLocation } from '../../types/pantry';
import { formatDateNl } from '../../lib/dashboardFreshness';
import { DashboardBlock, EmptyState, SectionLabel, Stat, StatGrid } from './DashboardBlock';
import { LOCATION_ICONS, expiryLabel, itemsByLocation, pickStockSource, stockStatus } from './stockHelpers';

type Props = {
  homeStock: HomeStockSnapshot | null;
  /** Samenvatting uit dashboard-snapshot.json (stats.stock), gebruikt als die nieuwer is of home-stock ontbreekt. */
  snapshotStock: StockSummary | null;
  variant?: 'summary' | 'detail';
};

const ExpiryBadge: React.FC<{ days: number | null | undefined; frozen?: boolean }> = ({ days, frozen }) => {
  if (days == null) return null;
  const cls = frozen
    ? 'border-white/20 text-white/70'
    : days < 0
      ? 'border-red-400/60 bg-red-400/10 text-red-200'
      : days <= 3
        ? 'border-amber-400/60 bg-amber-400/10 text-amber-200'
        : 'border-white/20 text-white/70';
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>{expiryLabel(days)}</span>
  );
};

export const ExpiringList: React.FC<{ items: StockSummary['expiringSoon']; limit?: number }> = ({ items, limit }) => (
  <ul className="divide-y divide-amber-400/20">
    {items.slice(0, limit).map((e) => (
      <li key={`${e.name}-${e.location}`} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
        <span className="min-w-0 text-sm text-white">
          <span className="font-medium">{e.name}</span>{' '}
          <span className="text-white/65">· {PANTRY_LOCATION_LABELS[e.location]}</span>
        </span>
        <ExpiryBadge days={e.daysToExpiry} />
      </li>
    ))}
  </ul>
);

const LocationCard: React.FC<{
  loc: PantryLocation;
  count: number;
  categories: Record<string, number>;
  items: StockItem[] | null;
}> = ({ loc, count, categories, items }) => {
  const Icon = LOCATION_ICONS[loc];
  const cats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  return (
    <section
      data-testid={`stock-location-${loc}`}
      aria-label={PANTRY_LOCATION_LABELS[loc]}
      className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7"
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="text-lg font-semibold text-white">{PANTRY_LOCATION_LABELS[loc]}</h3>
        </div>
        <span className="text-3xl font-bold tabular-nums text-white">{count}</span>
      </header>
      {count === 0 ? (
        <p className="rounded-xl border border-dashed border-white/25 px-4 py-5 text-center text-sm text-white/70">
          Niets in {PANTRY_LOCATION_LABELS[loc].toLowerCase()}.
        </p>
      ) : (
        <>
          <ul className="mb-5 flex flex-wrap gap-2">
            {cats.map(([cat, n]) => (
              <li key={cat} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm text-white/90">
                {cat} <span className="font-semibold text-white">{n}</span>
              </li>
            ))}
          </ul>
          {items && items.length > 0 ? (
            <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{it.name}</div>
                    <div className="text-xs text-white/65">
                      {[it.category, it.quantity != null ? `${it.quantity}${it.unit ? ` ${it.unit}` : ''}` : null, it.subLocation]
                        .filter(Boolean)
                        .join(' · ') || ' '}
                    </div>
                  </div>
                  <ExpiryBadge days={it.daysToExpiry} frozen={loc === 'diepvries'} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/65">Itemlijst niet beschikbaar in deze bron (alleen aantallen).</p>
          )}
        </>
      )}
    </section>
  );
};

export const StockBlock: React.FC<Props> = ({ homeStock, snapshotStock, variant = 'summary' }) => {
  const { stock, fromHome } = pickStockSource(homeStock, snapshotStock);
  const { status, notice } = stockStatus(stock);
  const footer = `bron: ${fromHome ? 'home-stock.json (Notion Pantry Stock)' : 'dashboard-snapshot.json (stats.stock)'} · export ${formatDateNl(stock?.generatedAt)}`;
  const empty = !stock || stock.total === 0;
  const emptyState = (
    <EmptyState
      title="Geen voorraaditems in de export"
      hint="Vul Pantry Stock in Notion of draai scripts/export_home_stock.py in workflow-os."
    />
  );

  if (variant === 'summary') {
    return (
      <DashboardBlock
        testId="block-stock"
        title="Voorraad"
        accent="green"
        status={status}
        notice={notice}
        className="md:col-span-12 xl:col-span-7"
        footer={footer}
        to="/dashboard/voorraad"
      >
        {empty ? (
          emptyState
        ) : (
          <div className="space-y-7">
            <StatGrid>
              <Stat label="Totaal" value={stock.total} />
              <Stat label="Bijna over datum" value={stock.expiringCount} tone={stock.expiringCount ? 'warn' : 'default'} />
              <Stat label="Over datum" value={stock.expiredCount} tone={stock.expiredCount ? 'warn' : 'default'} />
            </StatGrid>
            <div>
              <SectionLabel>Per locatie</SectionLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PANTRY_LOCATIONS.map((loc) => {
                  const Icon = LOCATION_ICONS[loc];
                  return (
                    <div key={loc} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Icon className="h-4 w-4 text-sky-300" aria-hidden="true" />
                        {PANTRY_LOCATION_LABELS[loc]}
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums text-white">{stock.byLocation[loc]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {stock.expiringSoon.length > 0 && (
              <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-5">
                <h3 className="mb-3 text-sm font-semibold text-amber-100">Eerst opeten</h3>
                <ExpiringList items={stock.expiringSoon} limit={4} />
              </div>
            )}
          </div>
        )}
      </DashboardBlock>
    );
  }

  /* ---- detail: totaal + per categorie, bijna over datum, dan 4 locatiekaarten ---- */
  const items = fromHome ? itemsByLocation(homeStock) : null;
  const cats = stock ? Object.entries(stock.byCategory).sort((a, b) => b[1] - a[1]) : [];
  return (
    <>
      <DashboardBlock
        testId="block-stock"
        title="Voorraad"
        accent="green"
        status={status}
        notice={notice}
        className="md:col-span-12"
        footer={footer}
      >
        {empty ? (
          emptyState
        ) : (
          <div className="space-y-7">
            <StatGrid>
              <Stat label="Totaal items" value={stock.total} size="lg" />
              <Stat label="Bijna over datum" value={stock.expiringCount} tone={stock.expiringCount ? 'warn' : 'default'} size="lg" hint="THT binnen 3 dagen" />
              <Stat label="Over datum" value={stock.expiredCount} tone={stock.expiredCount ? 'warn' : 'default'} size="lg" />
              <Stat label="Tuin oogstbaar" value={stock.gardenReady} tone={stock.gardenReady ? 'good' : 'default'} size="lg" />
            </StatGrid>
            <div>
              <SectionLabel>Per categorie</SectionLabel>
              <ul className="flex flex-wrap gap-2">
                {cats.map(([cat, n]) => (
                  <li key={cat} className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-sm text-white/90">
                    {cat} <span className="font-semibold text-white">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DashboardBlock>

      {!empty && stock.expiringSoon.length > 0 && (
        <DashboardBlock testId="block-stock-expiring" title="Bijna over datum" accent="amber" className="md:col-span-12">
          <ExpiringList items={stock.expiringSoon} />
        </DashboardBlock>
      )}

      {!empty && (
        <div className="grid gap-6 md:col-span-12 md:grid-cols-2" data-testid="stock-locations">
          {PANTRY_LOCATIONS.map((loc) => (
            <LocationCard
              key={loc}
              loc={loc}
              count={stock.byLocation[loc]}
              categories={stock.byLocationCategory[loc] ?? {}}
              items={items ? items[loc] : null}
            />
          ))}
        </div>
      )}
    </>
  );
};
