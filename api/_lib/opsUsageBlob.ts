import { BlobNotFoundError, get, list } from '@vercel/blob';

const BLOB_PREFIX = 'ops-usage';
const GROK_PATH = `${BLOB_PREFIX}/grok-usage.csv`;
const SUMMARY_PATH = `${BLOB_PREFIX}/cursor-usage-summary.json`;
const CURSOR_CSV_PREFIX = `${BLOB_PREFIX}/cursor-csv/`;

function blobToken(): string | null {
  const raw = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return raw ? raw : null;
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchBlobText(pathname: string, token: string): Promise<string | null> {
  for (const access of ['private', 'public'] as const) {
    try {
      const result = await get(pathname, { access, token, useCache: false });
      if (!result || result.statusCode !== 200 || !result.stream) continue;
      return await streamToString(result.stream);
    } catch (err) {
      if (err instanceof BlobNotFoundError) continue;
      console.warn(`[ops-usage] blob get failed (${access}) ${pathname}:`, err);
    }
  }
  return null;
}

export type BlobOpsUsageRaw = {
  grokCsv: string | null;
  cursorCsvFiles: string[];
  summaryJson: string | null;
};

/** Loads raw CSV/JSON from Vercel Blob when BLOB_READ_WRITE_TOKEN is set. */
export async function loadOpsUsageFromBlob(): Promise<BlobOpsUsageRaw | null> {
  const token = blobToken();
  if (!token) return null;

  try {
    const grokCsv = await fetchBlobText(GROK_PATH, token);
    const summaryJson = await fetchBlobText(SUMMARY_PATH, token);

    const cursorCsvFiles: string[] = [];
    let cursor = await list({ prefix: CURSOR_CSV_PREFIX, token });
    for (;;) {
      for (const item of cursor.blobs) {
        if (!item.pathname.endsWith('.csv')) continue;
        const text = await fetchBlobText(item.pathname, token);
        if (text) cursorCsvFiles.push(text);
      }
      if (!cursor.hasMore || !cursor.cursor) break;
      cursor = await list({ prefix: CURSOR_CSV_PREFIX, token, cursor: cursor.cursor });
    }

    if (!grokCsv && cursorCsvFiles.length === 0 && !summaryJson) {
      return null;
    }

    return { grokCsv, cursorCsvFiles, summaryJson };
  } catch (err) {
    console.warn('[ops-usage] blob list/load failed:', err);
    return null;
  }
}
