import { DEFAULT_BARS, DEFAULT_SCENES, DEFAULT_STEPS, DEFAULT_PATTERN_STEPS, STEPS_PER_BAR, TRACK_IDS } from './types';
import type { AudioClip, MidiNote, MusicProject, PlaylistClip, TrackId } from './types';
import { isAudioTrack } from './types';

/** Instrument rows on the playlist (vox uses audio takes). */
export const PLAYLIST_TRACKS = TRACK_IDS.filter((id) => !isAudioTrack(id));

/** Channels shown in Channel rack + Playlist (FL: only channels in the project). */
export function rackChannelList(project: MusicProject): TrackId[] {
  const listed = project.rackChannels?.filter((id) => TRACK_IDS.includes(id)) ?? [];
  if (listed.length === 0) return [...TRACK_IDS];
  return listed;
}

export function trackLane(track: TrackId): number {
  return Math.max(0, TRACK_IDS.indexOf(track));
}

export function laneTrack(lane: number): TrackId {
  const idx = Math.max(0, Math.min(TRACK_IDS.length - 1, Math.round(lane)));
  return TRACK_IDS[idx];
}

function resolveClipTrack(raw: string | number): TrackId | null {
  if (typeof raw === 'number') {
    return laneTrack(raw);
  }
  const key = raw.trim().toLowerCase();
  const hit = TRACK_IDS.find((id) => id === key);
  return hit ?? null;
}

export { STEPS_PER_BAR };

/** Written pattern content (notes / step hits) — NOT playlist clip length. */
export function patternContentSteps(project: MusicProject, track: TrackId, sceneIdx: number): number {
  let len = 0;
  const notes = project.notes?.[track]?.[sceneIdx] ?? [];
  for (const n of notes) {
    len = Math.max(len, Math.ceil(n.start + n.length));
  }
  const row = project.patterns[track]?.[sceneIdx];
  if (row?.length) {
    let lastHit = 0;
    for (let i = row.length - 1; i >= 0; i -= 1) {
      if (row[i]) {
        lastHit = i + 1;
        break;
      }
    }
    len = Math.max(len, lastHit);
  }
  if (len <= 0) return DEFAULT_PATTERN_STEPS;
  return Math.max(STEPS_PER_BAR, Math.ceil(len / STEPS_PER_BAR) * STEPS_PER_BAR);
}

/** Playlist span for this pattern number (info / extend only). */
export function clipBarsForPattern(project: MusicProject, track: TrackId, scene: number): number {
  let max = 0;
  for (const c of project.clips ?? []) {
    if (c.track === track && c.pattern === scene) {
      max = Math.max(max, c.length);
    }
  }
  return max;
}

/** Pattern row length for piano roll + loop playback (content only). */
export function patternLength(project: MusicProject, track: TrackId, sceneIdx: number): number {
  return patternContentSteps(project, track, sceneIdx);
}

export function patternLengthBars(project: MusicProject, track: TrackId, sceneIdx: number): number {
  return Math.ceil(patternContentSteps(project, track, sceneIdx) / STEPS_PER_BAR);
}

/** Which pattern # to edit for a track at the current song bar. */
export function sceneForTrackAtBar(project: MusicProject, track: TrackId, bar: number): number {
  const clips = project.clips ?? [];
  const hit = clips.find((c) => c.track === track && bar >= c.start && bar < c.start + c.length);
  if (hit) return hit.pattern;
  const first = clips.find((c) => c.track === track);
  return first?.pattern ?? 1;
}

export function stepCount(project: MusicProject): number {
  let max = DEFAULT_STEPS;
  for (const id of TRACK_IDS) {
    for (let s = 0; s < project.patterns[id].length; s += 1) {
      max = Math.max(max, patternLength(project, id, s));
    }
  }
  return max;
}

export function sceneCount(project: MusicProject): number {
  let max = DEFAULT_SCENES;
  for (const id of TRACK_IDS) {
    max = Math.max(max, project.patterns[id].length);
  }
  return Math.max(1, max);
}

export function normalizeSteps(steps: number[]): number[] {
  return steps.map((n) => (n ? 1 : 0));
}

export function padPattern(steps: number[], len: number): number[] {
  const base = normalizeSteps(steps);
  while (base.length < len) base.push(0);
  return base;
}

/** After parse: pad each pattern row to its own length (notes + clips). */
export function normalizeProjectGrid(project: MusicProject): MusicProject {
  const scenes = sceneCount(project);
  const patterns = {} as Record<TrackId, number[][]>;
  const notes = {} as Record<TrackId, MidiNote[][]>;

  for (const id of TRACK_IDS) {
    const rows = [...project.patterns[id]];
    while (rows.length < scenes) rows.push([]);
    const noteRows = [...(project.notes?.[id] ?? [])];
    while (noteRows.length < scenes) noteRows.push([]);
    patterns[id] = rows.slice(0, scenes).map((row, sceneIdx) =>
      padPattern(row ?? [], patternContentSteps({ ...project, patterns: { ...project.patterns, [id]: rows } }, id, sceneIdx)),
    );
    notes[id] = noteRows.slice(0, scenes);
  }

  const maxScene = scenes;
  return normalizeArrangement(
    ensureNotes({
      ...project,
      scene: Math.min(maxScene, Math.max(1, Math.round(project.scene))),
      patterns,
      notes,
    }),
  );
}

export function arrangementLength(project: MusicProject): number {
  let max = DEFAULT_BARS;
  for (const id of TRACK_IDS) {
    max = Math.max(max, project.arrangement[id]?.length ?? 0);
  }
  return Math.max(1, max);
}

export function normalizeArrangement(project: MusicProject): MusicProject {
  const len = arrangementLength(project);
  const scenes = Math.max(1, ...TRACK_IDS.map((id) => project.patterns[id].length));
  const arrangement = {} as Record<TrackId, number[]>;
  for (const id of TRACK_IDS) {
    const row = [...(project.arrangement[id] ?? [])];
    while (row.length < len) row.push(0);
    arrangement[id] = row.slice(0, len).map((n) => {
      const scene = Math.round(n);
      if (scene <= 0) return 0;
      return Math.min(scenes, scene);
    });
  }
  return { ...project, arrangement };
}

export function extendArrangement(project: MusicProject, add: number): MusicProject {
  const len = arrangementLength(project) + Math.max(1, add);
  const arrangement = {} as Record<TrackId, number[]>;
  for (const id of TRACK_IDS) {
    const row = [...project.arrangement[id]];
    while (row.length < len) row.push(0);
    arrangement[id] = row;
  }
  return { ...project, arrangement };
}

export function extendAllSteps(project: MusicProject, add: number): MusicProject {
  const scenes = sceneCount(project);
  const patterns = {} as Record<TrackId, number[][]>;
  for (const id of TRACK_IDS) {
    patterns[id] = project.patterns[id].slice(0, scenes).map((row, sceneIdx) => {
      const nextLen = patternLength(project, id, sceneIdx) + add;
      return padPattern(row, nextLen);
    });
  }
  return { ...project, patterns };
}

/** Grow one pattern row (piano roll width) by N steps. */
export function extendPattern(
  project: MusicProject,
  track: TrackId,
  scene: number,
  addSteps: number,
): MusicProject {
  const sceneIdx = Math.max(0, scene - 1);
  const nextLen = patternContentSteps(project, track, sceneIdx) + Math.max(1, addSteps);
  return setPatternLength(project, track, scene, nextLen);
}

/** Set absolute pattern length in steps (snapped to whole bars). Keeps notes that fit. */
export function setPatternLength(
  project: MusicProject,
  track: TrackId,
  scene: number,
  steps: number,
): MusicProject {
  const sceneIdx = Math.max(0, scene - 1);
  const nextLen = Math.max(STEPS_PER_BAR, Math.ceil(Math.max(1, steps) / STEPS_PER_BAR) * STEPS_PER_BAR);
  const patterns = { ...project.patterns } as Record<TrackId, number[][]>;
  const rows = [...(patterns[track] ?? [])];
  while (rows.length <= sceneIdx) rows.push([]);
  rows[sceneIdx] = padPattern(rows[sceneIdx] ?? [], nextLen).slice(0, nextLen);
  patterns[track] = rows;

  const notes = { ...(project.notes ?? {}) } as Record<TrackId, MidiNote[][]>;
  const noteRows = [...(notes[track] ?? [])];
  while (noteRows.length <= sceneIdx) noteRows.push([]);
  noteRows[sceneIdx] = (noteRows[sceneIdx] ?? []).filter((n) => n.start < nextLen);
  notes[track] = noteRows;

  return { ...project, patterns, notes };
}

export function ensurePatternLength(
  project: MusicProject,
  track: TrackId,
  scene: number,
  minSteps: number,
): MusicProject {
  const sceneIdx = Math.max(0, scene - 1);
  const current = patternLength(project, track, sceneIdx);
  if (current >= minSteps) return project;
  return setPatternLength(project, track, scene, minSteps);
}

export function addSceneRow(project: MusicProject): MusicProject {
  const scenes = sceneCount(project);
  const steps = stepCount(project);
  const patterns = {} as Record<TrackId, number[][]>;
  const notes = {} as Record<TrackId, MidiNote[][]>;
  for (const id of TRACK_IDS) {
    patterns[id] = [...project.patterns[id].slice(0, scenes), Array(steps).fill(0)];
    const rows = [...(project.notes?.[id] ?? [])];
    while (rows.length < scenes) rows.push([]);
    rows.push([]);
    notes[id] = rows;
  }
  return { ...project, patterns, notes };
}

export function flattenNotes(notes: MidiNote[]): number[] {
  const articulated = notes.some((n) => (n.vel != null && n.vel !== 1) || (n.pan != null && n.pan !== 0));
  if (articulated) {
    return notes.flatMap((n) => [n.pitch, n.start, n.length, n.vel ?? 1, n.pan ?? 0]);
  }
  return notes.flatMap((n) => [n.pitch, n.start, n.length]);
}

/**
 * Notes are triples [pitch, start, length] or quintuples
 * [pitch, start, length, vel, pan]. An array must be one format throughout
 * (flattenNotes always writes uniform groups).
 */
export function parseNotes(flat: number[]): MidiNote[] {
  const out: MidiNote[] = [];
  if (flat.length >= 5 && flat.length % 5 === 0 && looksLikeNoteQuintuples(flat)) {
    for (let i = 0; i + 4 < flat.length; i += 5) {
      out.push({
        pitch: Math.max(0, Math.min(127, Math.round(flat[i]))),
        start: Math.max(0, flat[i + 1]),
        length: Math.max(0.25, flat[i + 2]),
        vel: Math.max(0.05, Math.min(1, flat[i + 3])),
        pan: Math.max(-1, Math.min(1, flat[i + 4])),
      });
    }
    return out;
  }
  for (let i = 0; i + 2 < flat.length; i += 3) {
    out.push({
      pitch: Math.max(0, Math.min(127, Math.round(flat[i]))),
      start: Math.max(0, flat[i + 1]),
      length: Math.max(0.25, flat[i + 2]),
    });
  }
  return out;
}

/** True when every 5-group looks like pitch/start/length/vel/pan. */
function looksLikeNoteQuintuples(flat: number[]): boolean {
  for (let i = 0; i + 4 < flat.length; i += 5) {
    const pitch = flat[i];
    const start = flat[i + 1];
    const length = flat[i + 2];
    const vel = flat[i + 3];
    const pan = flat[i + 4];
    if (pitch < 0 || pitch > 127) return false;
    if (start < 0) return false;
    if (length < 0.25) return false;
    if (vel < 0 || vel > 1.25) return false;
    if (pan < -1 || pan > 1) return false;
  }
  return true;
}

export function flattenClips(clips: PlaylistClip[]): (string | number)[] {
  return clips.flatMap((c) => [c.track, c.pattern, c.start, c.length]);
}

export function parseClips(flat: (number | string)[]): PlaylistClip[] {
  const out: PlaylistClip[] = [];
  const hasNamedTrack = flat.some((v) => typeof v === 'string');

  if (hasNamedTrack) {
    for (let i = 0; i + 3 < flat.length; i += 4) {
      const track = resolveClipTrack(flat[i]);
      if (!track || isAudioTrack(track)) continue;
      const pattern = Math.max(1, Math.round(Number(flat[i + 1])));
      const start = Math.max(0, Math.round(Number(flat[i + 2])));
      const length = Math.max(1, Math.round(Number(flat[i + 3])));
      out.push({ track, pattern, start, length });
    }
    return out;
  }

  // Legacy: pattern, lane, start, length — lane mapped to track row.
  for (let i = 0; i + 3 < flat.length; i += 4) {
    const pattern = Math.max(1, Math.round(Number(flat[i])));
    const lane = Math.max(0, Math.round(Number(flat[i + 1])));
    const start = Math.max(0, Math.round(Number(flat[i + 2])));
    const length = Math.max(1, Math.round(Number(flat[i + 3])));
    const track = laneTrack(lane);
    if (isAudioTrack(track)) continue;
    out.push({ track, pattern, start, length });
  }
  return out;
}

export function notesKey(track: TrackId, scene: number): string {
  return scene <= 1 ? `${track}.notes` : `${track}.${scene}.notes`;
}

export function ensureNotes(project: MusicProject): MusicProject {
  const scenes = sceneCount(project);
  const notes = { ...(project.notes ?? emptyNotesGrid()) } as MusicProject['notes'];
  for (const id of TRACK_IDS) {
    const rows = [...(notes[id] ?? [])];
    while (rows.length < scenes) rows.push([]);
    notes[id] = rows;
  }
  return {
    ...project,
    notes,
    clips: project.clips ?? [],
    audioClips: project.audioClips ?? [],
    lanes: project.lanes ?? 8,
  };
}

function emptyNotesGrid(): MusicProject['notes'] {
  const notes = {} as MusicProject['notes'];
  for (const id of TRACK_IDS) notes[id] = [];
  return notes;
}

/** Song length in bars: playlist clips, timeline floor, else legacy arrangement. */
export function songBarCount(project: MusicProject): number {
  const clips = project.clips ?? [];
  const audio = project.audioClips ?? [];
  const clipBars =
    clips.length > 0 ? Math.max(1, ...clips.map((c) => c.start + c.length)) : 0;
  const audioBars =
    audio.length > 0 ? Math.max(1, ...audio.map((c) => c.start + c.length)) : 0;
  const timeline = Math.max(0, Math.round(project.timelineBars ?? 0));
  // Keep legacy arrangement as timeline floor so "+N bars" always works.
  return Math.max(arrangementLength(project), clipBars, audioBars, timeline, 1);
}

export function flattenAudioClips(clips: AudioClip[]): (number | string)[] {
  return clips.flatMap((c) => [
    c.take,
    c.lane,
    c.start,
    c.length,
    c.active,
    c.sampleId,
  ]);
}

export function parseAudioClips(flat: (number | string)[]): AudioClip[] {
  const out: AudioClip[] = [];
  for (let i = 0; i + 5 < flat.length; i += 6) {
    const take = Math.max(1, Math.round(Number(flat[i])));
    const lane = Math.max(0, Math.round(Number(flat[i + 1])));
    const start = Math.max(0, Math.round(Number(flat[i + 2])));
    const length = Math.max(1, Math.round(Number(flat[i + 3])));
    const active = Number(flat[i + 4]) > 0 ? 1 : 0;
    const sampleId = String(flat[i + 5] ?? '').trim();
    if (!sampleId) continue;
    out.push({ take, lane, start, length, active, sampleId });
  }
  return out;
}

export function nextTakeOnLane(project: MusicProject, lane: number, start: number): number {
  const same = (project.audioClips ?? []).filter((c) => c.lane === lane && c.start === start);
  if (same.length === 0) return 1;
  return Math.max(...same.map((c) => c.take)) + 1;
}

/** Unique pattern indexes (1-based) sounding at this bar. */
export function patternsAtBar(project: MusicProject, bar: number): number[] {
  return clipsAtBar(project, bar).map((c) => c.pattern).filter((p, i, arr) => arr.indexOf(p) === i);
}

/** Playlist clips covering this song bar. */
export function clipsAtBar(project: MusicProject, bar: number): PlaylistClip[] {
  const clips = project.clips ?? [];
  return clips.filter((c) => bar >= c.start && bar < c.start + c.length);
}

/** @deprecated use patternLength */
export function patternRowLength(
  project: MusicProject,
  track: TrackId,
  sceneIdx: number,
): number {
  return patternLength(project, track, sceneIdx);
}

/**
 * Step index inside a pattern row for this clip at the current song bar.
 * Uses clip-local bars so each playlist clip starts at pattern step 0.
 * When wrap=false (classical): past pattern end → null (silence, no FL-style loop).
 */
export function patternStepForClip(
  clip: PlaylistClip,
  bar: number,
  stepInBar: number,
  patternLen: number,
  wrap = true,
): number | null {
  const len = Math.max(1, patternLen);
  const clipBar = Math.max(0, bar - clip.start);
  const clipStep = clipBar * STEPS_PER_BAR + stepInBar;
  if (!wrap && clipStep >= len) return null;
  return ((clipStep % len) + len) % len;
}

/** How many times a Pattern would repeat inside a Playlist clip (FL wrap). */
export function clipLoopCount(clipBars: number, patternBars: number): number {
  const pb = Math.max(1, patternBars);
  return Math.max(1, Math.ceil(Math.max(1, clipBars) / pb));
}

/** Linear step offset from the start of a playlist clip. */
export function stepInClip(clip: PlaylistClip, bar: number, stepInBar: number): number {
  const clipBar = Math.max(0, bar - clip.start);
  return clipBar * STEPS_PER_BAR + stepInBar;
}

/** Pattern-row step for a track at the current transport position. */
export function rackStepForTrack(
  project: MusicProject,
  track: TrackId,
  beat: { bar: number; step: number; patternStep: number },
): number {
  if (project.playMode !== 'arr' || !(project.clips?.length)) {
    return project.playMode === 'session' ? beat.step : beat.patternStep;
  }
  const active = clipsAtBar(project, beat.bar).find((c) => c.track === track);
  if (!active) return beat.patternStep;
  const rowLen = patternContentSteps(project, track, active.pattern - 1);
  return patternStepForClip(active, beat.bar, beat.step, rowLen, project.clipWrap !== false) ?? 0;
}
