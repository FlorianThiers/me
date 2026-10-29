import type { MusicProject, TrackId } from '../../types';
import { isPercRollTrack } from '../../types';

export function humanize(
  project: MusicProject,
  time: number,
  gain: number,
  id: TrackId,
): { time: number; gain: number } {
  const g = project.genre;
  if (g === 'tekno') {
    const tJitter = id === 'hihat' ? (Math.random() - 0.5) * 0.002 : (Math.random() - 0.5) * 0.001;
    const gVar = id === 'hihat' ? 0.94 + Math.random() * 0.1 : 0.96 + Math.random() * 0.06;
    return { time: time + tJitter, gain: gain * gVar };
  }
  if (g === 'punk') {
    // Pushy pop-punk: slight rush on hats, snare crack variance
    const tJitter =
      id === 'hihat' || id === 'snare'
        ? (Math.random() - 0.5) * 0.004
        : (Math.random() - 0.5) * 0.002;
    const gVar = id === 'snare' ? 0.9 + Math.random() * 0.18 : 0.94 + Math.random() * 0.1;
    return { time: time + tJitter, gain: gain * gVar };
  }
  if (g === 'classical') {
    // Soft rubato on melodic lines; percussion stays steadier
    const melodic = id === 'wt' || id === 'an' || id === 'tp' || id === 'rg' || id === 'bass';
    const tJitter = melodic ? (Math.random() - 0.5) * 0.012 : (Math.random() - 0.5) * 0.003;
    const gVar = melodic ? 0.82 + Math.random() * 0.28 : 0.9 + Math.random() * 0.12;
    return { time: time + tJitter, gain: gain * gVar };
  }
  const perc = isPercRollTrack(id) || id === 'bass';
  const tJitter =
    id === 'hihat'
      ? (Math.random() - 0.5) * 0.006
      : (Math.random() - 0.5) * (perc ? 0.016 : 0.01);
  const gVar = id === 'hihat' ? 0.92 + Math.random() * 0.14 : 0.86 + Math.random() * 0.22;
  return { time: time + tJitter, gain: gain * gVar };
}
