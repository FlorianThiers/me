import { emptyOverrides, emptyNotes, emptyProject } from './defaults';
import { normalizeProjectGrid, normalizeSteps, parseAudioClips, parseClips, parseNotes } from './grid';
import type { BindingValue, DrumId, MusicProject, ParseResult, PatchResult, TrackId, Waveform } from './types';
import { isVoicePack, TRACK_IDS, WAVEFORMS } from './types';

const TRACK_KEY = 'kick|snare|hihat|mc|bass|wt|an|tp|rg|vox';

const UI_BINDINGS_MARK = '// -- ui-bindings';
const KEY_LINE = /^\s*([\w.@]+)\s*:\s*(.*)$/;

const DRUM_SCALAR = new Set([
  'freq',
  'pitch',
  'dur',
  'attack',
  'decay',
  'filter',
  'drive',
  'noise',
]);

const WT_SCALAR = new Set([
  'pitch',
  'cutoff',
  'res',
  'unison',
  'wave',
  'amp',
  'attack',
  'decay',
  'sustain',
  'release',
  'filterEnv',
  'lfoRate',
  'lfoDepth',
]);

const AN_SCALAR = new Set([
  'pitch',
  'cutoff',
  'res',
  'unison',
  'detune',
  'amp',
  'attack',
  'decay',
  'sustain',
  'release',
  'filterEnv',
]);

export function formatValue(value: BindingValue): string {
  if (Array.isArray(value)) {
    const parts = value.map((v) => (typeof v === 'string' ? `"${v}"` : String(v)));
    return `[${parts.join(', ')}]`;
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(Math.round(value * 1000) / 1000);
}

function joinMultilineBindings(code: string): string[] {
  const lines = code.split('\n');
  const out: string[] = [];
  let buffer = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!buffer) {
      const open = trimmed.match(/^([\w.@]+)\s*:\s*\[(.*)$/);
      if (open && !trimmed.includes(']')) {
        buffer = trimmed;
        continue;
      }
      out.push(line);
      continue;
    }

    // Skip blank / comment lines inside a multiline [ ... ] binding
    if (!trimmed || trimmed.startsWith('//')) continue;

    buffer = `${buffer} ${trimmed}`;
    if (trimmed.includes(']')) {
      out.push(buffer);
      buffer = '';
    }
  }

  if (buffer) out.push(buffer);
  return out;
}

/** Strip // comments; for arrays, only drop trailing // after the closing ]. */
function stripComment(rest: string): string {
  const trimmed = rest.trim();
  if (trimmed.startsWith('[')) {
    const close = trimmed.lastIndexOf(']');
    if (close >= 0) return trimmed.slice(0, close + 1).trim();
    return trimmed;
  }
  const idx = rest.indexOf('//');
  return (idx === -1 ? rest : rest.slice(0, idx)).trim();
}

function parseArray(raw: string): (number | string)[] | null {
  const inner = raw.trim();
  if (!inner.startsWith('[') || !inner.endsWith(']')) return null;
  const parts = inner.slice(1, -1).split(',').map((p) => p.trim()).filter(Boolean);
  const out: (number | string)[] = [];
  for (const p of parts) {
    if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
      out.push(p.slice(1, -1));
      continue;
    }
    if (isTrack(p)) {
      out.push(p);
      continue;
    }
    const n = Number(p);
    if (Number.isNaN(n)) return null;
    out.push(n);
  }
  return out;
}

function parseNumberArray(raw: string): number[] | null {
  const mixed = parseArray(raw);
  if (!mixed) return null;
  if (mixed.some((v) => typeof v === 'string')) return null;
  return mixed as number[];
}

function parseScalar(raw: string): number | string | null {
  const v = raw.trim().replace(/^["']|["']$/g, '');
  if (v === '') return null;
  const n = Number(v);
  if (!Number.isNaN(n) && v !== '') return n;
  return v;
}

function isTrack(id: string): id is TrackId {
  return (TRACK_IDS as readonly string[]).includes(id);
}

function isWave(v: string): v is Waveform {
  return (WAVEFORMS as readonly string[]).includes(v);
}

function ensureSceneSlot(project: MusicProject, track: TrackId, sceneIdx: number) {
  while (project.patterns[track].length <= sceneIdx) {
    project.patterns[track].push([]);
  }
}

function ensureOverrideSlot(project: MusicProject, sceneIdx: number) {
  while (project.sceneOverrides.length <= sceneIdx) {
    project.sceneOverrides.push(emptyOverrides());
  }
}

export function parseProject(code: string): ParseResult {
  const project = emptyProject();
  const errors: string[] = [];

  for (const line of joinMultilineBindings(code)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    const m = trimmed.match(KEY_LINE);
    if (!m) continue;
    const key = m[1];
    const raw = stripComment(m[2].replace(/\s+/g, ' '));

    try {
      applyKey(project, key, raw, errors);
    } catch (err) {
      errors.push(`${key}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  project.bpm = Math.min(300, Math.max(40, project.bpm));
  return { project: normalizeProjectGrid(project), errors };
}

function applyKey(project: MusicProject, key: string, raw: string, errors: string[]) {
  if (key === 'bpm') {
    const n = Number(raw);
    if (Number.isNaN(n)) errors.push('bpm is not a number');
    else project.bpm = n;
    return;
  }
  if (key === 'scene') {
    const n = Number(raw);
    if (Number.isNaN(n)) errors.push('scene is not a number');
    else project.scene = n;
    return;
  }
  if (key === 'play') {
    const v = String(parseScalar(raw) ?? '').toLowerCase();
    project.playMode = v === 'arr' || v === 'arrangement' || v === 'song' ? 'arr' : 'session';
    return;
  }
  if (key === 'genre' || key === 'voice' || key === 'pack') {
    const v = String(parseScalar(raw) ?? '').toLowerCase();
    if (isVoicePack(v)) project.genre = v;
    else errors.push(`${key} needs cumbia|tekno|punk|classical`);
    return;
  }
  if (key === 'bars' || key === 'timeline' || key === 'timelineBars') {
    const n = Number(parseScalar(raw));
    if (Number.isNaN(n)) errors.push(`${key} is not a number`);
    else project.timelineBars = Math.max(0, Math.min(512, Math.round(n)));
    return;
  }
  if (key === 'clipWrap' || key === 'patternWrap' || key === 'wrapClips') {
    const n = Number(parseScalar(raw));
    const s = String(parseScalar(raw) ?? '').toLowerCase();
    if (s === 'false' || s === 'off' || n === 0) project.clipWrap = false;
    else if (s === 'true' || s === 'on' || n === 1) project.clipWrap = true;
    else errors.push(`${key} needs 0|1|true|false`);
    return;
  }

  const arrayVal = parseArray(raw);
  const numberArray = parseNumberArray(raw);

  if (key === 'channels' || key === 'rack' || key === 'rackChannels') {
    if (!arrayVal) {
      errors.push(`${key} needs an array of channel ids`);
      return;
    }
    const ids = arrayVal
      .map((v) => String(v).trim().toLowerCase())
      .filter((v): v is TrackId => (TRACK_IDS as readonly string[]).includes(v));
    if (ids.length === 0) errors.push(`${key} needs at least one valid channel`);
    else project.rackChannels = ids;
    return;
  }
  if (key === 'lanes') {
    const n = Number(parseScalar(raw));
    if (Number.isNaN(n)) errors.push('lanes is not a number');
    else project.lanes = Math.max(1, Math.min(24, Math.round(n)));
    return;
  }
  if (key === 'clips' && arrayVal) {
    project.clips = parseClips(arrayVal);
    return;
  }
  if (key === 'audio' && arrayVal) {
    project.audioClips = parseAudioClips(arrayVal);
    return;
  }
  const notesMatch = key.match(new RegExp(`^(${TRACK_KEY})(?:\\.(\\d+))?\\.notes$`));
  if (notesMatch && numberArray) {
    const track = notesMatch[1] as TrackId;
    const sceneIdx = notesMatch[2] ? Number(notesMatch[2]) - 1 : 0;
    ensureSceneSlot(project, track, sceneIdx);
    if (!project.notes) project.notes = emptyNotes();
    while (project.notes[track].length <= sceneIdx) project.notes[track].push([]);
    project.notes[track][sceneIdx] = parseNotes(numberArray);
    return;
  }

  const arrClip = key.match(new RegExp(`^(${TRACK_KEY})_arr$`));
  if (arrClip && numberArray) {
    project.arrangement[arrClip[1] as TrackId] = numberArray.map((n) => Math.max(0, Math.round(n)));
    return;
  }

  const sceneMatch = key.match(new RegExp(`^(${TRACK_KEY})\\.(\\d+)$`));
  if (sceneMatch && numberArray) {
    const track = sceneMatch[1] as TrackId;
    const sceneIdx = Number(sceneMatch[2]) - 1;
    ensureSceneSlot(project, track, sceneIdx);
    project.patterns[track][sceneIdx] = normalizeSteps(numberArray);
    return;
  }
  if (isTrack(key) && numberArray) {
    ensureSceneSlot(project, key, 0);
    project.patterns[key][0] = normalizeSteps(numberArray);
    return;
  }

  const drumParam = key.match(/^(kick|snare|hihat|mc|bass)_(freq|pitch|dur|attack|decay|filter|drive|noise|type)$/);
  if (drumParam) {
    const track = drumParam[1] as DrumId;
    const field = drumParam[2];
    if (field === 'type') {
      const t = String(parseScalar(raw) ?? '');
      if (isWave(t)) project.drums[track].type = t;
      else errors.push(`${key} needs sine|square|triangle|sawtooth`);
    } else if (DRUM_SCALAR.has(field)) {
      const n = Number(parseScalar(raw));
      if (Number.isNaN(n)) errors.push(`${key} is not a number`);
      else (project.drums[track] as unknown as Record<string, number>)[field] = n;
    }
    return;
  }

  const wt = key.match(/^wt\.(\w+)$/);
  if (wt && WT_SCALAR.has(wt[1])) {
    const n = Number(parseScalar(raw));
    if (Number.isNaN(n)) errors.push(`${key} is not a number`);
    else (project.wavetable as unknown as Record<string, number>)[wt[1]] = n;
    return;
  }

  const an = key.match(/^an\.(\w+)$/);
  if (an && AN_SCALAR.has(an[1])) {
    const n = Number(parseScalar(raw));
    if (Number.isNaN(n)) errors.push(`${key} is not a number`);
    else (project.analog as unknown as Record<string, number>)[an[1]] = n;
    return;
  }

  const tp = key.match(/^tp\.(\w+)$/);
  if (tp && WT_SCALAR.has(tp[1])) {
    const n = Number(parseScalar(raw));
    if (Number.isNaN(n)) errors.push(`${key} is not a number`);
    else (project.brass as unknown as Record<string, number>)[tp[1]] = n;
    return;
  }

  const rg = key.match(/^rg\.(\w+)$/);
  if (rg && AN_SCALAR.has(rg[1])) {
    const n = Number(parseScalar(raw));
    if (Number.isNaN(n)) errors.push(`${key} is not a number`);
    else (project.guitar as unknown as Record<string, number>)[rg[1]] = n;
    return;
  }

  const mix = key.match(new RegExp(`^(${TRACK_KEY})\\.(gain|pan|mute|solo)$`));
  if (mix && isTrack(mix[1])) {
    const n = Number(parseScalar(raw));
    if (Number.isNaN(n)) errors.push(`${key} is not a number`);
    else if (mix[2] === 'pan') {
      project.mixer[mix[1]].pan = Math.max(-1, Math.min(1, n));
    } else {
      project.mixer[mix[1]][mix[2] as 'gain' | 'mute' | 'solo'] = n;
    }
    return;
  }

  const fxKey = key.match(
    new RegExp(`^(${TRACK_KEY})\\.(hpf|compThreshold|compRatio|presence|reverbSend|delaySend)$`),
  );
  if (fxKey && isTrack(fxKey[1])) {
    const n = Number(parseScalar(raw));
    if (Number.isNaN(n)) errors.push(`${key} is not a number`);
    else project.fx[fxKey[1]][fxKey[2] as keyof MusicProject['fx'][TrackId]] = n;
    return;
  }

  const sceneOvDrum = key.match(/^(kick|snare|hihat|mc|bass)@(\d+)_(freq|pitch|dur|attack|decay|filter|drive|noise|type)$/);
  if (sceneOvDrum) {
    const track = sceneOvDrum[1] as DrumId;
    const sceneIdx = Number(sceneOvDrum[2]) - 1;
    const field = sceneOvDrum[3];
    ensureOverrideSlot(project, sceneIdx);
    const ov = project.sceneOverrides[sceneIdx];
    if (!ov.drums[track]) ov.drums[track] = {};
    if (field === 'type') {
      const t = String(parseScalar(raw) ?? '');
      if (isWave(t)) ov.drums[track]!.type = t;
    } else {
      const n = Number(parseScalar(raw));
      if (!Number.isNaN(n)) (ov.drums[track] as Record<string, unknown>)[field] = n;
    }
    return;
  }

  const sceneOvWt = key.match(/^wt@(\d+)\.(\w+)$/);
  if (sceneOvWt && WT_SCALAR.has(sceneOvWt[2])) {
    const sceneIdx = Number(sceneOvWt[1]) - 1;
    ensureOverrideSlot(project, sceneIdx);
    const n = Number(parseScalar(raw));
    if (!Number.isNaN(n))
      (project.sceneOverrides[sceneIdx].wavetable as Record<string, unknown>)[sceneOvWt[2]] = n;
    return;
  }

  const sceneOvAn = key.match(/^an@(\d+)\.(\w+)$/);
  if (sceneOvAn && AN_SCALAR.has(sceneOvAn[2])) {
    const sceneIdx = Number(sceneOvAn[1]) - 1;
    ensureOverrideSlot(project, sceneIdx);
    const n = Number(parseScalar(raw));
    if (!Number.isNaN(n))
      (project.sceneOverrides[sceneIdx].analog as Record<string, unknown>)[sceneOvAn[2]] = n;
    return;
  }

  const sceneOvTp = key.match(/^tp@(\d+)\.(\w+)$/);
  if (sceneOvTp && WT_SCALAR.has(sceneOvTp[2])) {
    const sceneIdx = Number(sceneOvTp[1]) - 1;
    ensureOverrideSlot(project, sceneIdx);
    const n = Number(parseScalar(raw));
    if (!Number.isNaN(n))
      (project.sceneOverrides[sceneIdx].brass as Record<string, unknown>)[sceneOvTp[2]] = n;
    return;
  }

  const sceneOvRg = key.match(/^rg@(\d+)\.(\w+)$/);
  if (sceneOvRg && AN_SCALAR.has(sceneOvRg[2])) {
    const sceneIdx = Number(sceneOvRg[1]) - 1;
    ensureOverrideSlot(project, sceneIdx);
    const n = Number(parseScalar(raw));
    if (!Number.isNaN(n))
      (project.sceneOverrides[sceneIdx].guitar as Record<string, unknown>)[sceneOvRg[2]] = n;
    return;
  }

  if (arrayVal === null && !key.includes('.') && !key.includes('_') && !key.includes('@')) {
    errors.push(`unknown binding ${key}`);
  }
}

function findKeyLineIndex(lines: string[], key: string): number {
  const re = new RegExp(`^\\s*${key.replace(/[.@]/g, '\\$&')}\\s*:`);
  return lines.findIndex((line) => re.test(line) && !line.trim().startsWith('//'));
}

function rewriteLine(line: string, formatted: string): string {
  const m = line.match(/^(\s*[\w.]+\s*:\s*)(.*)$/);
  if (!m) return line;
  const rest = m[2];
  const comment = rest.match(/(\s+\/\/.*)$/);
  return `${m[1]}${formatted}${comment ? comment[1] : ''}`;
}

export function patchBinding(code: string, key: string, value: BindingValue): PatchResult {
  const formatted = formatValue(value);
  const lines = code.split('\n');
  const idx = findKeyLineIndex(lines, key);
  if (idx >= 0) {
    lines[idx] = rewriteLine(lines[idx], formatted);
    return { code: lines.join('\n'), line: idx };
  }

  const insertAt = lines.findIndex((l) => l.includes(UI_BINDINGS_MARK));
  if (insertAt === -1) {
    const trimmed = code.replace(/\s+$/, '');
    const next = `${trimmed}\n\n${UI_BINDINGS_MARK}\n${key}: ${formatted}\n`;
    return { code: next, line: next.split('\n').length - 2 };
  }

  let cursor = insertAt + 1;
  while (cursor < lines.length && lines[cursor].trim() === '') cursor += 1;
  lines.splice(cursor, 0, `${key}: ${formatted}`);
  return { code: lines.join('\n'), line: cursor };
}

export function parseRepl(
  line: string,
): { key: string; value: BindingValue } | { error: string } | { launch: number } | null {
  const raw = line.trim();
  if (!raw || raw.startsWith('//')) return null;

  const launch = raw.match(/^launch\s+(\d+)$/i);
  if (launch) return { launch: Number(launch[1]) };

  const playCmd = raw.match(/^play\s+(session|arr|arrangement|song)$/i);
  if (playCmd) {
    const v = playCmd[1].toLowerCase();
    return { key: 'play', value: v === 'session' ? 'session' : 'arr' };
  }

  const setCmd = raw.match(/^set\s+([\w.]+)\s+(.+)$/i);
  if (setCmd) return parseAssignment(setCmd[1], setCmd[2].trim());

  const assign = raw.match(/^([\w.]+)\s*[:=]\s*(.+)$/);
  if (assign) return parseAssignment(assign[1], assign[2].trim());

  return { error: `cannot parse: ${raw}` };
}

function parseAssignment(
  key: string,
  rest: string,
): { key: string; value: BindingValue } | { error: string } {
  const stripped = stripComment(rest);
  const arr = parseArray(stripped);
  const numArr = parseNumberArray(stripped);
  if (arr) {
    const stepPatternKey =
      isTrack(key) || new RegExp(`^(${TRACK_KEY})\\.(\\d+)$`).test(key);
    if (stepPatternKey && numArr) return { key, value: normalizeSteps(numArr) };
    return { key, value: arr };
  }
  const scalar = parseScalar(stripped);
  if (scalar === null) return { error: `empty value for ${key}` };
  return { key, value: scalar };
}

export function lineIndexForKey(code: string, key: string): number {
  return findKeyLineIndex(code.split('\n'), key);
}
