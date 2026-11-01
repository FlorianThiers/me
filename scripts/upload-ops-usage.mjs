#!/usr/bin/env node
/**
 * Upload local ops usage files to Vercel Blob (server-only paths).
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=... node scripts/upload-ops-usage.mjs [sourceDir]
 *
 * Default sourceDir: /workspace/ops-usage
 *
 * Expected layout:
 *   grok-usage.csv
 *   cursor-usage-summary.json (optional)
 *   cursor-csv/*.csv
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { put } from '@vercel/blob';

const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
if (!token) {
  console.error('Missing BLOB_READ_WRITE_TOKEN (server env only — never VITE_/NEXT_PUBLIC).');
  process.exit(1);
}

const sourceDir = path.resolve(process.argv[2] ?? '/workspace/ops-usage');

async function uploadFile(relativePathname, absolutePath) {
  const body = await readFile(absolutePath);
  const pathname = `ops-usage/${relativePathname.replace(/^\/+/, '')}`;
  for (const access of ['private', 'public']) {
    try {
      const result = await put(pathname, body, {
        access,
        token,
        allowOverwrite: true,
        contentType: pathname.endsWith('.json') ? 'application/json' : 'text/csv',
      });
      console.log(`OK [${access}] ${pathname} → ${result.url}`);
      return;
    } catch (err) {
      console.warn(`Retry other access for ${pathname} (${access} failed):`, err?.message ?? err);
    }
  }
  throw new Error(`Failed to upload ${pathname}`);
}

async function main() {
  let dirStat;
  try {
    dirStat = await stat(sourceDir);
  } catch {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }
  if (!dirStat.isDirectory()) {
    console.error(`Not a directory: ${sourceDir}`);
    process.exit(1);
  }

  const grok = path.join(sourceDir, 'grok-usage.csv');
  try {
    await stat(grok);
    await uploadFile('grok-usage.csv', grok);
  } catch {
    console.warn('Skip: grok-usage.csv not found');
  }

  const summary = path.join(sourceDir, 'cursor-usage-summary.json');
  try {
    await stat(summary);
    await uploadFile('cursor-usage-summary.json', summary);
  } catch {
    console.warn('Skip: cursor-usage-summary.json (optional)');
  }

  const cursorDir = path.join(sourceDir, 'cursor-csv');
  try {
    const entries = await readdir(cursorDir);
    for (const name of entries.filter((n) => n.endsWith('.csv'))) {
      await uploadFile(`cursor-csv/${name}`, path.join(cursorDir, name));
    }
  } catch {
    console.warn('Skip: cursor-csv/ (optional)');
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
