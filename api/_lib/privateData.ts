import fs from 'node:fs';
import path from 'node:path';

/**
 * Reads admin-only JSON snapshots. Prefer gitignored `private-data/` (local or
 * deployment-specific). Falls back to sanitized `public/data/*.example.json`.
 */
export function readPrivateJson(basename: string): unknown | null {
  const root = process.cwd();
  const candidates = [
    path.join(root, 'private-data', `${basename}.json`),
    path.join(root, 'public/data', `${basename}.example.json`),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}
