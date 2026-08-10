export type StockCategory = 'Fruit' | 'Groente' | 'Vlees' | 'Vis' | 'Zuivel' | 'Overig' | string;

export type StockItem = {
  id: string;
  name: string;
  location: string;
  subLocation?: string | null;
  category?: StockCategory | null;
  quantity?: number | null;
  unit?: string | null;
  expiry?: string | null;
  daysToExpiry?: number | null;
  status?: string;
  frozen?: boolean;
  priority: number;
  source?: 'garden' | 'pantry';
};

export type StockSection = {
  id: string;
  label: string;
  priority: number;
  items: StockItem[];
};

export type HomeStockSnapshot = {
  generatedAt: string;
  date: string;
  isDemo: boolean;
  exportNote?: string;
  priorityLegend: string[];
  expiringSoon: StockItem[];
  sections: StockSection[];
  stats?: {
    totalItems: number;
    fridgeFresh: number;
    freezer: number;
    gardenReady: number;
  };
};
