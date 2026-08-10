/** Public demo fallback — no live workflow-os / vault data. */

import type { JuliaSnapshot } from '../types/juliaSnapshot';
import type { OrbitIconName } from '../components/orbit/icons/OrbitIcons';

export type DayIntent = {
  id: 'deep' | 'body' | 'life' | 'admin';
  icon: OrbitIconName;
  labelKey: string;
  sampleKey: string;
};

export const demoDayIntents: DayIntent[] = [
  { id: 'deep', icon: 'deep', labelKey: 'julia.intents.deep', sampleKey: 'julia.demo.deep' },
  { id: 'body', icon: 'body', labelKey: 'julia.intents.body', sampleKey: 'julia.demo.body' },
  { id: 'life', icon: 'life', labelKey: 'julia.intents.life', sampleKey: 'julia.demo.life' },
  { id: 'admin', icon: 'admin', labelKey: 'julia.intents.admin', sampleKey: 'julia.demo.admin' },
];

export const demoWorkItems = [
  'julia.demo.work1',
  'julia.demo.work2',
  'julia.demo.work3',
] as const;

export const demoLifeTeaser = 'julia.demo.lifeTeaser';

export const weekAnchors = [
  { key: 'julia.lifeRhythm.anchors.sleep', pct: 75, icon: 'sleep' as const },
  { key: 'julia.lifeRhythm.anchors.nutrition', pct: 60, icon: 'food' as const },
  { key: 'julia.lifeRhythm.anchors.sport', pct: 50, icon: 'body' as const },
  { key: 'julia.lifeRhythm.anchors.hobby', pct: 40, icon: 'life' as const },
  { key: 'julia.lifeRhythm.anchors.home', pct: 35, icon: 'life' as const },
];

export const planningHorizons = ['day', 'week', 'month', 'year'] as const;
export type Horizon = (typeof planningHorizons)[number];

export const planningDomains = ['work', 'sport', 'nutrition', 'sleep'] as const;
export type PlanningDomain = (typeof planningDomains)[number];

export const planningActions: Record<
  Horizon,
  Record<PlanningDomain, { href: string; labelKey: string }>
> = {
  day: {
    work: { href: 'https://app.todoist.com/app/today', labelKey: 'julia.planning.actions.openTodoist' },
    sport: { href: 'https://app.todoist.com/app/label/sport', labelKey: 'julia.planning.actions.openSport' },
    nutrition: {
      href: 'https://www.notion.so/MySpace-391bb6cffa8381b18221e5d231626b7b',
      labelKey: 'julia.planning.actions.openNotion',
    },
    sleep: { href: 'https://app.todoist.com/app/today', labelKey: 'julia.planning.actions.openTodoist' },
  },
  week: {
    work: {
      href: 'https://www.notion.so/MySpace-391bb6cffa8381b18221e5d231626b7b',
      labelKey: 'julia.planning.actions.openNotion',
    },
    sport: { href: '/life-rhythm', labelKey: 'julia.planning.actions.openLifeRhythm' },
    nutrition: { href: '/cooking', labelKey: 'julia.planning.actions.openCooking' },
    sleep: { href: '/life-rhythm', labelKey: 'julia.planning.actions.openLifeRhythm' },
  },
  month: {
    work: {
      href: 'https://www.notion.so/393bb6cffa83803d83d8f67207b5e547',
      labelKey: 'julia.planning.actions.openFeatureFlow',
    },
    sport: { href: '/sports', labelKey: 'julia.planning.actions.openSports' },
    nutrition: { href: '/cooking', labelKey: 'julia.planning.actions.openCooking' },
    sleep: { href: '/goals', labelKey: 'julia.planning.actions.openGoals' },
  },
  year: {
    work: { href: '/goals', labelKey: 'julia.planning.actions.openGoals' },
    sport: { href: '/sports', labelKey: 'julia.planning.actions.openSports' },
    nutrition: { href: '/cooking', labelKey: 'julia.planning.actions.openCooking' },
    sleep: { href: '/goals', labelKey: 'julia.planning.actions.openGoals' },
  },
};

export const demoSnapshot: JuliaSnapshot = {
  generatedAt: new Date(0).toISOString(),
  date: '1970-01-01',
  greeting: 'Good morning. Four intents, one coherent day.',
  workTop3: [
    'Platform release and integration testing',
    'Workflow improvements for the team',
    'Plan next iteration with stakeholders',
  ],
  intents: [
    { id: 'deep', label: 'deep', text: 'Morning deep block — ship one meaningful step.' },
    { id: 'body', label: 'body', text: 'Recovery walk or light slackline — knee-friendly.' },
    { id: 'life', label: 'life', text: 'One home or hobby intent — no perfection required.' },
    { id: 'admin', label: 'admin', text: 'Mail triage and small errands — bounded time.' },
  ],
  weekConstraint: 'Knee rest after leg day — no heavy legs today.',
  sportTypeToday: 'D',
  anchors: { sleep: 75, nutrition: 27, sport: 50, hobby: 40, home: 35 },
  links: {
    dayLog: null,
    todoistToday: 'https://app.todoist.com/app/today',
    todoistSport: 'https://app.todoist.com/app/label/sport',
    todoistHome: 'https://app.todoist.com/app/label/huis',
    todoistFood: 'https://app.todoist.com/app/label/eten',
    notionMySpace: 'https://www.notion.so/MySpace-391bb6cffa8381b18221e5d231626b7b',
    notionLifeDay: 'https://www.notion.so/34c5e1c3ca0a4fa79479bc5b68a23d93',
  },
  life: {
    mealTonight: 'Split peas with mince & courgette',
    mealLunch: null,
    proteinG: 45,
    proteinTargetG: 140,
    waterL: 0.5,
    waterTargetL: 2.5,
    kcal: 800,
    fatG: 35,
    carbsG: 70,
    fiberG: 15,
    fiberTargetG: 30,
    movementMin: 0,
    lifeEntries: 6,
    pantryAlerts: [],
    microGaps: [
      { id: 'iron', current: 4.2, target: 11, unit: 'mg', pct: 38 },
      { id: 'calcium', current: 320, target: 1000, unit: 'mg', pct: 32 },
    ],
  },
  mealPlan: [
    { date: '1970-01-01', type: 'Lunch', title: 'Omelet met groenten', status: 'Gepland', kcal: 320, proteinG: 22 },
    { date: '1970-01-01', type: 'Avond', title: 'Pasta met tomatensaus', status: 'Gepland', kcal: 520, proteinG: 16 },
  ],
  isDemo: true,
};
