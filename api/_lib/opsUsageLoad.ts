import fs from 'node:fs';
import path from 'node:path';
import { buildOpsUsagePayload, type OpsUsageConfig } from '../../src/lib/opsUsage/buildPayload.js';

function readUtf8(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8');
  } catch {
    // ignore
  }
  return null;
}

function readJson<T>(filePath: string): T | null {
  const raw = readUtf8(filePath);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function listCsvFiles(dir: string): string[] {
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

export function loadOpsUsagePayload() {
  const root = process.cwd();
  const privateDir = path.join(root, 'private-data', 'ops-usage');
  const publicDir = path.join(root, 'public', 'data', 'ops-usage');

  const privateGrok = readUtf8(path.join(privateDir, 'grok-usage.csv'));
  const exampleGrok = readUtf8(path.join(publicDir, 'grok-usage.example.csv'));
  const grokCsv = privateGrok ?? exampleGrok ?? '';
  const isDemo = privateGrok == null;

  const privateCursorDir = path.join(privateDir, 'cursor-csv');
  const exampleCursorDir = path.join(publicDir, 'cursor-csv');
  let cursorFiles = listCsvFiles(privateCursorDir);
  if (cursorFiles.length === 0) {
    cursorFiles = listCsvFiles(exampleCursorDir).filter((f) => f.endsWith('.example.csv'));
  }
  const cursorCsvFiles = cursorFiles.map((f) => readUtf8(f)).filter((s): s is string => s != null);

  const config =
    readJson<OpsUsageConfig>(path.join(privateDir, 'config.json')) ??
    readJson<OpsUsageConfig>(path.join(publicDir, 'config.example.json')) ??
    undefined;

  if (!grokCsv && cursorCsvFiles.length === 0) {
    return null;
  }

  return buildOpsUsagePayload({
    grokCsv,
    cursorCsvFiles,
    config: config ?? { exportNote: 'EXAMPLE DATA ONLY' },
    isDemo,
  });
}
