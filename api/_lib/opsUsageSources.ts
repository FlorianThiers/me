import fs from 'node:fs';
import path from 'node:path';
import type { OpsUsageConfig } from '../../lib/opsUsage/types.js';

const EXAMPLE_PATHS = {
  grok: '/data/ops-usage/grok-usage.example.csv',
  config: '/data/ops-usage/config.example.json',
  cursorCsv: '/data/ops-usage/cursor-csv/usage-2025-10.example.csv',
} as const;

function readUtf8File(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.warn('[ops-usage] fs read failed:', filePath, err);
  }
  return null;
}

function readJsonFile<T>(filePath: string): T | null {
  const raw = readUtf8File(filePath);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function listCsvInDir(dir: string): string[] {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.csv'))
      .map((f) => path.join(dir, f))
      .sort();
  } catch {
    return [];
  }
}

function siteBaseUrls(): string[] {
  const urls: string[] = [];
  if (process.env.VERCEL_URL) urls.push(`https://${process.env.VERCEL_URL}`);
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) urls.push(prod.startsWith('http') ? prod : `https://${prod}`);
  return urls;
}

async function fetchPublicAsset(relativePath: string): Promise<string | null> {
  for (const base of siteBaseUrls()) {
    try {
      const res = await fetch(`${base}${relativePath}`, { cache: 'no-store' });
      if (res.ok) return await res.text();
    } catch (err) {
      console.warn('[ops-usage] example fetch failed:', base, relativePath, err);
    }
  }
  return null;
}

export type RawOpsUsageSources = {
  grokCsv: string;
  cursorCsvFiles: string[];
  config?: OpsUsageConfig;
  isDemo: boolean;
};

function mergeConfig(
  ...parts: (OpsUsageConfig | null | undefined)[]
): OpsUsageConfig | undefined {
  const merged: OpsUsageConfig = {};
  for (const p of parts) {
    if (!p) continue;
    if (p.cursorMonthlyTokenLimit != null) merged.cursorMonthlyTokenLimit = p.cursorMonthlyTokenLimit;
    if (p.exportNote != null) merged.exportNote = p.exportNote;
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

function parseSummaryConfig(summaryJson: string | null): OpsUsageConfig | undefined {
  if (!summaryJson) return undefined;
  try {
    const parsed = JSON.parse(summaryJson) as Record<string, unknown>;
    return {
      cursorMonthlyTokenLimit:
        typeof parsed.cursorMonthlyTokenLimit === 'number'
          ? parsed.cursorMonthlyTokenLimit
          : undefined,
      exportNote: typeof parsed.exportNote === 'string' ? parsed.exportNote : undefined,
    };
  } catch {
    return undefined;
  }
}

/** Local private-data/ops-usage (dev or custom deploy bundle). */
export function loadOpsUsageFromFilesystem(): RawOpsUsageSources | null {
  const root = process.cwd();
  const privateDir = path.join(root, 'private-data', 'ops-usage');

  const grokCsv = readUtf8File(path.join(privateDir, 'grok-usage.csv'));
  if (!grokCsv) return null;

  const summaryJson = readUtf8File(path.join(privateDir, 'cursor-usage-summary.json'));
  const cursorDir = path.join(privateDir, 'cursor-csv');
  const cursorCsvFiles = listCsvInDir(cursorDir)
    .map((f) => readUtf8File(f))
    .filter((s): s is string => s != null);

  const config = mergeConfig(
    readJsonFile<OpsUsageConfig>(path.join(privateDir, 'config.json')),
    parseSummaryConfig(summaryJson),
  );

  return {
    grokCsv,
    cursorCsvFiles,
    config,
    isDemo: false,
  };
}

/** Committed example files (public/) + optional HTTP fetch on Vercel. */
export async function loadOpsUsageExamples(): Promise<RawOpsUsageSources | null> {
  const root = process.cwd();
  const publicDir = path.join(root, 'public', 'data', 'ops-usage');

  let grokCsv =
    readUtf8File(path.join(publicDir, 'grok-usage.example.csv')) ??
    (await fetchPublicAsset(EXAMPLE_PATHS.grok));

  const exampleCursorDir = path.join(publicDir, 'cursor-csv');
  let cursorPaths = listCsvInDir(exampleCursorDir).filter((f) => f.endsWith('.example.csv'));
  let cursorCsvFiles = cursorPaths
    .map((f) => readUtf8File(f))
    .filter((s): s is string => s != null);

  if (cursorCsvFiles.length === 0) {
    const fetched = await fetchPublicAsset(EXAMPLE_PATHS.cursorCsv);
    if (fetched) cursorCsvFiles = [fetched];
  }

  if (!grokCsv && cursorCsvFiles.length === 0) return null;

  const configFromDisk = readJsonFile<OpsUsageConfig>(path.join(publicDir, 'config.example.json'));
  const configFetchedRaw = await fetchPublicAsset(EXAMPLE_PATHS.config);
  let configFromFetch: OpsUsageConfig | undefined;
  if (configFetchedRaw) {
    try {
      configFromFetch = JSON.parse(configFetchedRaw) as OpsUsageConfig;
    } catch {
      configFromFetch = parseSummaryConfig(configFetchedRaw);
    }
  }

  const config =
    mergeConfig(configFromDisk, configFromFetch) ??
    { exportNote: 'VOORBEELDDATA — geen echte usage' };

  return {
    grokCsv: grokCsv ?? '',
    cursorCsvFiles,
    config,
    isDemo: true,
  };
}

export function rawFromBlob(input: {
  grokCsv: string | null;
  cursorCsvFiles: string[];
  summaryJson: string | null;
}): RawOpsUsageSources | null {
  if (!input.grokCsv && input.cursorCsvFiles.length === 0) return null;
  return {
    grokCsv: input.grokCsv ?? '',
    cursorCsvFiles: input.cursorCsvFiles,
    config: mergeConfig(parseSummaryConfig(input.summaryJson)),
    isDemo: false,
  };
}
