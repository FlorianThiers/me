const NOTION_VERSION = '2022-06-28';
const LIFE_DAY_DB = '34c5e1c3-ca0a-4fa7-9479-bc5b68a23d93';
const LIFE_ENTRY_DB = 'cb069679-197f-48d3-a0ca-64dde97af0ba';

const FOOD_PRESETS: Record<
  string,
  {
    title: string;
    grams: number;
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    magnesium?: number;
    calcium?: number;
    iron?: number;
  }
> = {
  merci: {
    title: 'Merci chocolade (1 praline)',
    grams: 11,
    kcal: 60,
    protein: 0.7,
    fat: 3.4,
    carbs: 6.8,
    fiber: 0.3,
    magnesium: 4,
    calcium: 8,
    iron: 0.2,
  },
};

function notionToken(): string {
  const t = process.env.NOTION_TOKEN;
  if (!t) throw new Error('NOTION_TOKEN not configured');
  return t;
}

async function notionRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${notionToken()}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? res.statusText;
    throw new Error(`Notion ${res.status}: ${msg}`);
  }
  return data as Record<string, unknown>;
}

function propNumber(props: Record<string, unknown>, key: string): number {
  const p = props[key] as { number?: number | null } | undefined;
  return typeof p?.number === 'number' ? p.number : 0;
}

async function findLifeDay(date: string): Promise<string | null> {
  const data = await notionRequest('POST', `/databases/${LIFE_DAY_DB}/query`, {
    filter: { property: 'Datum', date: { equals: date } },
    page_size: 1,
  });
  const results = (data.results as Array<{ id: string }>) ?? [];
  return results[0]?.id ?? null;
}

async function ensureLifeDay(date: string): Promise<string> {
  const existing = await findLifeDay(date);
  if (existing) return existing;

  const page = await notionRequest('POST', '/pages', {
    parent: { database_id: LIFE_DAY_DB },
    properties: {
      Name: { title: [{ text: { content: date } }] },
      Datum: { date: { start: date } },
      'Water (L)': { number: 0 },
      'Eiwit doel (g)': { number: 140 },
      'Water doel (L)': { number: 2.5 },
      'Magnesium doel (mg)': { number: 350 },
      'Calcium doel (mg)': { number: 1000 },
      'IJzer doel (mg)': { number: 11 },
      'Vezels doel (g)': { number: 30 },
    },
  });
  return page.id as string;
}

export async function addWater(date: string, liters: number): Promise<number> {
  const dayId = await ensureLifeDay(date);
  const page = await notionRequest('GET', `/pages/${dayId}`);
  const props = page.properties as Record<string, unknown>;
  const current = propNumber(props, 'Water (L)');
  const total = Math.round((current + liters) * 100) / 100;
  await notionRequest('PATCH', `/pages/${dayId}`, {
    properties: { 'Water (L)': { number: total } },
  });
  return total;
}

export async function addFood(date: string, presetKey: string): Promise<string> {
  const key = presetKey.toLowerCase();
  const info = FOOD_PRESETS[key];
  if (!info) {
    throw new Error(`Unknown preset: ${presetKey}`);
  }

  const dayId = await ensureLifeDay(date);
  const now = new Date().toISOString();
  const props: Record<string, unknown> = {
    Name: { title: [{ text: { content: info.title } }] },
    Categorie: { select: { name: 'Food' } },
    'Entry type': { select: { name: 'Meal' } },
    Source: { select: { name: 'Manual' } },
    'Life Day': { relation: [{ id: dayId }] },
    'Gram gegeten': { number: info.grams },
    Kcal: { number: info.kcal },
    'Eiwit (g)': { number: info.protein },
    'Vet (g)': { number: info.fat },
    'Koolhydraten (g)': { number: info.carbs },
    'Vezels (g)': { number: info.fiber },
    Notes: {
      rich_text: [{ text: { content: `julia capture API · ${now}` } }],
    },
  };
  if (info.magnesium) props['Magnesium (mg)'] = { number: info.magnesium };
  if (info.calcium) props['Calcium (mg)'] = { number: info.calcium };
  if (info.iron) props['IJzer (mg)'] = { number: info.iron };

  const page = await notionRequest('POST', '/pages', {
    parent: { database_id: LIFE_ENTRY_DB },
    properties: props,
  });
  return page.id as string;
}
