/**
 * Pantry-datamodel (voorraad per categorie/locatie).
 *
 * Doel: een stabiele, gestructureerde laag bovenop de Notion "Pantry Stock" export
 * (home-stock.json) zodat voorraad later per avondmaal (gekookt) en per boodschappenronde
 * kan worden bijgewerkt via events. Nog NIET geautomatiseerd - zie docs/DASHBOARD.md.
 */

export const PANTRY_LOCATIONS = ['koelkast', 'diepvries', 'kast', 'overig'] as const;
export type PantryLocation = (typeof PANTRY_LOCATIONS)[number];

export const PANTRY_LOCATION_LABELS: Record<PantryLocation, string> = {
  koelkast: 'Koelkast',
  diepvries: 'Diepvries',
  kast: 'Kast',
  overig: 'Overig',
};

/** Zelfde categorieen als StockCategory in homeStock.ts. */
export const PANTRY_CATEGORIES = ['Fruit', 'Groente', 'Vlees', 'Vis', 'Zuivel', 'Overig'] as const;
export type PantryCategory = (typeof PANTRY_CATEGORIES)[number];

export type PantryItem = {
  id: string;
  name: string;
  category: PantryCategory | string;
  location: PantryLocation;
  /** Vrije sub-locatie, bv. "Kast 2 / Lade 1", "Bergkot". */
  subLocation?: string | null;
  quantity: number | null;
  unit: string | null;
  /** THT / expiry als YYYY-MM-DD. */
  expiry?: string | null;
  addedAt: string;
  updatedAt: string;
  /** Notion page id van de Pantry Stock rij (voor latere sync). */
  notionId?: string | null;
};

/** Item zoals het binnenkomt bij een boodschappenronde / restjes (id + timestamps worden toegekend). */
export type PantryItemInput = Omit<PantryItem, 'id' | 'addedAt' | 'updatedAt'> & { id?: string };

export type ShoppingRoundEvent = {
  type: 'shopping_round';
  id: string;
  /** ISO timestamp. */
  at: string;
  store?: string | null;
  added: PantryItemInput[];
};

export type CookedMealEvent = {
  type: 'meal_cooked';
  id: string;
  at: string;
  meal: string;
  portions?: number | null;
  /** Wat uit de voorraad is verbruikt. */
  consumed: { itemId: string; quantity: number }[];
  /** Restjes / batch (bv. bolognese naar diepvries). */
  leftovers?: PantryItemInput[];
};

export type PantryAdjustEvent = {
  type: 'manual_adjust' | 'discard';
  id: string;
  at: string;
  itemId: string;
  /** manual_adjust: nieuwe hoeveelheid. discard: wordt genegeerd (item verdwijnt). */
  quantity?: number | null;
  reason?: string | null;
};

export type PantryEvent = ShoppingRoundEvent | CookedMealEvent | PantryAdjustEvent;

export type PantryState = {
  schemaVersion: 1;
  updatedAt: string;
  items: PantryItem[];
  /** Append-only log; state = items na toepassen van alle events. */
  events: PantryEvent[];
};
