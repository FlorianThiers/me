export type UsageWarningLevel = 'ok' | 'amber' | 'red';

export type CycleClock = {
  label: string;
  currentPct: number;
  forecastPct: number;
  warningLevel: UsageWarningLevel;
  cycleStart: string;
  cycleEnd: string;
  resetLabel: string;
};

export type DailyPoint = {
  date: string;
  value: number;
};

export type NamedAmount = {
  name: string;
  value: number;
};

export type GrokBotRow = {
  name: string;
  totalUses: number;
  sharePct: number;
  lastSeen: string;
};

export type OpsUsagePayload = {
  generatedAt: string;
  isDemo: boolean;
  exportNote?: string;
  cursor: CycleClock & {
    dailyUsage: DailyPoint[];
    byBot: NamedAmount[];
    byRoutine: NamedAmount[];
    monthlyTokenLimit: number;
    tokensUsedInCycle: number;
  };
  grok: CycleClock & {
    dailyUsage: DailyPoint[];
    byBot: NamedAmount[];
    byRoutine: NamedAmount[];
    bots: GrokBotRow[];
  };
};

export type OpsUsageConfig = {
  cursorMonthlyTokenLimit?: number;
  exportNote?: string;
};

export type OpsUsageSources = {
  grokCsv: string;
  cursorCsvFiles: string[];
  config?: OpsUsageConfig;
  isDemo: boolean;
};
