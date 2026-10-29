import type { AnalogParams, DrumId, DrumSound, MusicProject, WavetableParams } from '../../types';

export function resolveDrum(project: MusicProject, id: DrumId, sceneIdx: number): DrumSound {
  const base = project.drums[id];
  const ov = project.sceneOverrides[sceneIdx]?.drums[id];
  if (!ov) return base;
  return { ...base, ...ov };
}

export function resolveWavetable(project: MusicProject, sceneIdx: number): WavetableParams {
  const base = project.wavetable;
  const ov = project.sceneOverrides[sceneIdx]?.wavetable;
  if (!ov || Object.keys(ov).length === 0) return base;
  return { ...base, ...ov };
}

export function resolveAnalog(project: MusicProject, sceneIdx: number): AnalogParams {
  const base = project.analog;
  const ov = project.sceneOverrides[sceneIdx]?.analog;
  if (!ov || Object.keys(ov).length === 0) return base;
  return { ...base, ...ov };
}

export function resolveBrass(project: MusicProject, sceneIdx: number): WavetableParams {
  const base = project.brass;
  const ov = project.sceneOverrides[sceneIdx]?.brass;
  if (!ov || Object.keys(ov).length === 0) return base;
  return { ...base, ...ov };
}

export function resolveGuitar(project: MusicProject, sceneIdx: number): AnalogParams {
  const base = project.guitar;
  const ov = project.sceneOverrides[sceneIdx]?.guitar;
  if (!ov || Object.keys(ov).length === 0) return base;
  return { ...base, ...ov };
}
