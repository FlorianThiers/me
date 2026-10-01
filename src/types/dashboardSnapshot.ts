import type { PantryLocation } from './pantry';

/** Waar een blok z'n data vandaan haalt. 'seed' = handmatige/read-only momentopname (geen live token). */
export type BlockSource = 'home-stock' | 'notion' | 'todoist' | 'seed' | 'demo' | 'empty';

export type BlockMeta = {
  source: BlockSource;
  /** ISO timestamp van de meting; null = onbekend. */
  asOf: string | null;
  isDemo: boolean;
  note?: string;
};

export type StockSummary = {
  total: number;
  byLocation: Record<PantryLocation, number>;
  byCategory: Record<string, number>;
  byLocationCategory: Record<PantryLocation, Record<string, number>>;
  expiringSoon: { name: string; location: PantryLocation; daysToExpiry: number }[];
  expiredCount: number;
  expiringCount: number;
  gardenReady: number;
  generatedAt: string | null;
  isDemo: boolean;
};

export type DayPoint = {
  /** YYYY-MM-DD */
  date: string;
  /** Stemming 1-5 */
  mood: number | null;
  /** Liter */
  waterL: number | null;
  /** Uren */
  sleepH: number | null;
};

export type DashboardSnapshot = {
  schemaVersion: 1;
  generatedAt: string;
  /** YYYY-MM-DD (Europe/Brussels) */
  date: string;
  /** true als MINSTENS een blok voorbeelddata is. */
  isDemo: boolean;
  exportNote?: string;

  /** Voorraad-samenvatting (afgeleid van home-stock.json). */
  stats: { meta: BlockMeta; stock: StockSummary | null };

  tasks: {
    meta: BlockMeta;
    today: number;
    overdue: number;
    completedThisWeek: number;
    /** Maandag van de huidige week, YYYY-MM-DD. */
    weekStart: string;
  };

  workouts: {
    meta: BlockMeta;
    /** Laatste 8 weken, oudste eerst. */
    sessionsPerWeek: { weekStart: string; count: number }[];
    lastSession: { date: string; type: string | null; title: string } | null;
    /** Opeenvolgende weken (t/m huidige of vorige week) met minstens 1 sessie. */
    streakWeeks: number;
    totalLogged: number;
    nextPlanned: { due: string; title: string } | null;
  };

  mood: {
    meta: BlockMeta;
    /** Laatste 7 dagen, oudste eerst, altijd 7 punten. */
    days: DayPoint[];
    waterGoalL: number;
    /** Laatst bekende waarde buiten het 7-dagenvenster (voor context in de lege-staat). */
    lastKnown: {
      mood: { date: string; value: number } | null;
      water: { date: string; value: number } | null;
      sleep: { date: string; value: number } | null;
    };
  };

  garden: {
    meta: BlockMeta;
    total: number;
    /** Notion Status -> aantal (Gepland, Gezaaid, Groeiend, Oogstbaar, Geoogst, Afgerond). */
    counts: Record<string, number>;
    harvestable: number;
  };
};
