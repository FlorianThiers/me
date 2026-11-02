import { buildOpsUsagePayload } from '../../lib/opsUsage/buildPayload.js';
import type { OpsUsagePayload } from '../../lib/opsUsage/types.js';
import { loadOpsUsageFromBlob } from './opsUsageBlob.js';
import {
  loadOpsUsageExamples,
  loadOpsUsageFromFilesystem,
  rawFromBlob,
} from './opsUsageSources.js';

/**
 * Resolves ops usage inputs: Blob → private-data → example fallbacks.
 * Never throws; returns null when no usable data exists.
 */
export async function loadOpsUsagePayload(): Promise<OpsUsagePayload | null> {
  try {
    const blobRaw = await loadOpsUsageFromBlob();
    if (blobRaw) {
      const fromBlob = rawFromBlob(blobRaw);
      if (fromBlob) {
        return buildOpsUsagePayload({
          ...fromBlob,
          config: fromBlob.config ?? { exportNote: 'Live Blob data' },
        });
      }
    }

    const fromFs = loadOpsUsageFromFilesystem();
    if (fromFs) {
      return buildOpsUsagePayload(fromFs);
    }

    const examples = await loadOpsUsageExamples();
    if (examples) {
      return buildOpsUsagePayload(examples);
    }

    return null;
  } catch (err) {
    console.error('[ops-usage] loadOpsUsagePayload failed:', err);
    throw err;
  }
}
