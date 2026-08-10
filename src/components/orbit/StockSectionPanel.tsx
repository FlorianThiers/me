import React from 'react';
import { Snowflake, Leaf, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StockItem, StockSection } from '../../types/homeStock';
import {
  stockCategoryLabel,
  stockExpiryLabel,
  stockQuantityLine,
  stockSectionLabel,
} from '../../lib/stockI18n';

const CATEGORY_COLORS: Record<string, string> = {
  fruit: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
  groente: 'text-neon-green border-neon-green/40 bg-neon-green/10',
  vlees: 'text-rose-300 border-rose-400/40 bg-rose-400/10',
  vis: 'text-sky-300 border-sky-400/40 bg-sky-400/10',
  zuivel: 'text-violet-200 border-violet-400/40 bg-violet-400/10',
  overig: 'text-white/60 border-white/10 bg-white/5',
};

function categoryClass(cat?: string | null): string {
  if (!cat) return 'text-white/50 border-white/10 bg-white/5';
  const key = cat.toLowerCase();
  return CATEGORY_COLORS[key] ?? 'text-white/60 border-white/10 bg-white/5';
}

function categoryKey(cat: string): string {
  const map: Record<string, string> = {
    Fruit: 'fruit',
    Groente: 'groente',
    Vlees: 'vlees',
    Vis: 'vis',
    Zuivel: 'zuivel',
    Overig: 'overig',
  };
  return map[cat] ?? cat.toLowerCase();
}

function StockItemRow({ item }: { item: StockItem }) {
  const { t } = useTranslation();
  const exp = stockExpiryLabel(item, t);
  const urgent = item.daysToExpiry != null && item.daysToExpiry <= 3 && !item.frozen;
  const qtyLine = stockQuantityLine(item, t);
  const catLabel = stockCategoryLabel(item.category, t);

  return (
    <li className="flex items-start justify-between gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-white/90 font-medium truncate">{item.name}</span>
          {item.category && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full border ${categoryClass(categoryKey(item.category))}`}
            >
              {catLabel}
            </span>
          )}
          {item.frozen && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-sky-200/80">
              <Snowflake className="w-3 h-3" />
              {t('stock.frozen')}
            </span>
          )}
        </div>
        {qtyLine && <p className="text-[11px] text-white/40 mt-0.5">{qtyLine}</p>}
      </div>
      {exp && (
        <span
          className={`text-[11px] shrink-0 ${urgent ? 'text-amber-300' : 'text-white/45'}`}
        >
          {exp}
        </span>
      )}
    </li>
  );
}

type SectionProps = {
  section: StockSection;
  highlight?: boolean;
};

export const StockSectionPanel: React.FC<SectionProps> = ({ section, highlight }) => {
  const { t } = useTranslation();
  if (section.items.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border p-4 md:p-5 ${
        highlight
          ? 'border-neon-green/30 bg-neon-green/5'
          : 'border-white/10 bg-dark-secondary/60 backdrop-blur-md'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          {section.id === 'garden' && <Leaf className="w-4 h-4 text-neon-green" />}
          {section.id === 'freezer' && <Snowflake className="w-4 h-4 text-sky-300/80" />}
          {stockSectionLabel(section.id, t)}
        </h2>
        <span className="text-[10px] uppercase tracking-wider text-white/35">
          {t('stock.itemCount', { count: section.items.length })}
        </span>
      </div>
      {section.id === 'freezer' && (
        <p className="text-[11px] text-white/40 mb-3 border-l-2 border-sky-400/30 pl-2">
          {t('stock.freezerHint')}
        </p>
      )}
      {section.id === 'fridge' && (
        <p className="text-[11px] text-white/40 mb-3 border-l-2 border-amber-400/30 pl-2">
          {t('stock.fridgeHint')}
        </p>
      )}
      <ul>
        {section.items.map((item) => (
          <StockItemRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
};

export const StockExpiringStrip: React.FC<{ items: StockItem[] }> = ({ items }) => {
  const { t } = useTranslation();
  if (!items.length) return null;

  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-amber-300" />
        <h3 className="text-sm font-medium text-amber-100">{t('stock.expiringTitle')}</h3>
      </div>
      <ul className="space-y-1">
        {items.slice(0, 6).map((item) => (
          <li key={item.id} className="text-xs text-amber-100/90 flex justify-between gap-2">
            <span>
              {item.name}
              {item.category ? ` (${stockCategoryLabel(item.category, t)})` : ''}
            </span>
            <span className="text-amber-200/70 shrink-0">{stockExpiryLabel(item, t)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
