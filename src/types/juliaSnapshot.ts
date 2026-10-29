export type JuliaIntent = {

  id: 'deep' | 'body' | 'life' | 'admin';

  label: string;

  text: string;

};



export type JuliaMealPlanSlot = {
  date: string;
  type: string;
  title: string;
  status: string;
  kcal?: number;
  proteinG?: number;
  mins?: number;
};

export type JuliaMicroGap = {
  id: string;
  current: number;
  target: number;
  unit: string;
  pct: number;
};

export type JuliaLifeMacros = {
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
  fiberTargetG: number;
  kcal: number;
};

export type JuliaLifeSnapshot = {
  mealTonight: string | null;
  mealLunch: string | null;
  proteinG: number;
  proteinTargetG: number;
  waterL: number;
  waterTargetL: number;
  kcal: number;
  fatG?: number;
  carbsG?: number;
  fiberG?: number;
  fiberTargetG?: number;
  macros?: JuliaLifeMacros;
  movementMin: number;
  sleepHours?: number;
  sleepTargetH?: number;
  meditationMin?: number;
  meditationStreakDays?: number;
  moodScore?: number;
  lifeEntries: number;
  pantryAlerts: string[];
  micro?: Record<string, number>;
  microGaps?: JuliaMicroGap[];
};



export type JuliaRouterLane = {
  id: string;
  label: string;
  status: 'active' | 'waiting' | 'idle';
  focus: string;
  cursorWorkspace?: string;
  notionFfUrl?: string;
};

export type JuliaRouterQueueItem = {
  priority: string;
  title: string;
  nextAction: string;
  contextPath?: string;
  owner?: string;
};

export type JuliaRouterRun = {
  title: string;
  path: string;
  status: string;
};

export type JuliaRouter = {
  lanes: JuliaRouterLane[];
  agentQueue: JuliaRouterQueueItem[];
  activeRuns: JuliaRouterRun[];
  horizons: {
    weekConstraint: string | null;
    carryOver: string[];
  };
  sessionsHint?: string;
};

export type JuliaSnapshot = {

  generatedAt: string;

  date: string;

  greeting: string;

  workTop3: string[];

  intents: JuliaIntent[];

  weekConstraint: string | null;

  sportTypeToday: 'A' | 'B' | 'C' | 'D' | null;

  anchors: {

    sleep: number;

    nutrition: number;

    sport: number;

    hobby: number;

    home: number;

  };

  links: {

    dayLog: string | null;

    todoistToday: string;

    todoistSport?: string;

    todoistHome?: string;

    todoistFood?: string;

    notionMySpace: string;

    notionLifeDay?: string;

  };

  life?: JuliaLifeSnapshot;

  mealPlan?: JuliaMealPlanSlot[];

  isDemo: boolean;

  router?: JuliaRouter;

};


