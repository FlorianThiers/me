import type { DesignData, PlanProjection, ViewMode, ViewState } from '../types/gardenDesigner';
import { normalizeScale } from './unitUtils';

export const GARDEN_AUTOSAVE_KEY = 'myspace-garden-design-autosave-v1';

export interface GardenAutosavePayload {
  savedAt: string;
  designData: DesignData;
  viewState: ViewState;
  viewMode: ViewMode;
  planProjection: PlanProjection;
}

export function readGardenAutosave(): GardenAutosavePayload | null {
  try {
    const raw = localStorage.getItem(GARDEN_AUTOSAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GardenAutosavePayload;
    if (!parsed?.designData || !parsed.savedAt) return null;
    parsed.designData = {
      ...parsed.designData,
      scale: normalizeScale(parsed.designData.scale, parsed.designData.version)
    };
    return parsed;
  } catch {
    return null;
  }
}

export function writeGardenAutosave(payload: GardenAutosavePayload): void {
  try {
    localStorage.setItem(GARDEN_AUTOSAVE_KEY, JSON.stringify(payload));
  } catch {
    // Quota / private mode — ignore; manual JSON export remains available.
  }
}

export function clearGardenAutosave(): void {
  try {
    localStorage.removeItem(GARDEN_AUTOSAVE_KEY);
  } catch {
    // ignore
  }
}

export function formatAutosaveLabel(savedAt: string): string {
  try {
    return new Date(savedAt).toLocaleString('nl-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return savedAt;
  }
}

export function autosaveHasWork(payload: GardenAutosavePayload | null): boolean {
  if (!payload) return false;
  return (payload.designData.elements?.length ?? 0) > 0;
}
