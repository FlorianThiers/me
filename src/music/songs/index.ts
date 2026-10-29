import { BAJO_LA_LUNA } from './bajo-la-luna';
import { FRENCH_TEKNO_NUIT } from './french-tekno-nuit';
import { BLINK_LIKE_PUNK } from './all-the-small-hooks';
import { DANSE_MAGIQUE_HOMAGE } from './danse-magique-homage';
import type { SongDefinition, SongId } from './types';
import type { VoicePack } from '../types';
import { isVoicePack } from '../types';

export type { SongDefinition, SongId } from './types';

/** Built-in factory songs (shipped in repo). */
export const BUILTIN_SONGS: SongDefinition[] = [
  BAJO_LA_LUNA,
  FRENCH_TEKNO_NUIT,
  BLINK_LIKE_PUNK,
  DANSE_MAGIQUE_HOMAGE,
];

/** @deprecated use BUILTIN_SONGS — kept for older imports */
export const SONGS = BUILTIN_SONGS;

export const DEFAULT_SONG_ID: SongId = BAJO_LA_LUNA.id;

const ACTIVE_SONG_KEY = 'myspace-music-active-song';
const USER_SONGS_KEY = 'myspace-music-user-songs-v1';
const DRAFT_REV_KEY = 'myspace-music-draft-rev-v1';
const draftKey = (id: SongId) => `myspace-music-draft-${id}`;

const builtinById = new Map(BUILTIN_SONGS.map((s) => [s.id, s]));

function loadDraftRevs(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DRAFT_REV_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveDraftRev(id: SongId, revision: number) {
  try {
    const map = loadDraftRevs();
    map[id] = revision;
    localStorage.setItem(DRAFT_REV_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function clearDraftRev(id: SongId) {
  try {
    const map = loadDraftRevs();
    delete map[id];
    localStorage.setItem(DRAFT_REV_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || 'song';
}

function loadUserSongsRaw(): SongDefinition[] {
  try {
    const raw = localStorage.getItem(USER_SONGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SongDefinition[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s) => s && typeof s.id === 'string' && typeof s.livecode === 'string')
      .map((s) => ({
        ...s,
        user: true,
        revision: typeof s.revision === 'number' ? s.revision : 1,
        title: s.title || s.id,
        studioName: s.studioName || 'My Songs',
        genre: isVoicePack(String(s.genre)) ? s.genre : 'cumbia',
      }));
  } catch {
    return [];
  }
}

function persistUserSongs(songs: SongDefinition[]) {
  try {
    localStorage.setItem(USER_SONGS_KEY, JSON.stringify(songs));
  } catch {
    /* quota / private mode */
  }
}

export function listUserSongs(): SongDefinition[] {
  return loadUserSongsRaw();
}

export function listSongs(): SongDefinition[] {
  return [...BUILTIN_SONGS, ...loadUserSongsRaw()];
}

export function isBuiltinSong(id: SongId): boolean {
  return builtinById.has(id);
}

export function isUserSong(id: SongId): boolean {
  return loadUserSongsRaw().some((s) => s.id === id);
}

export function getSong(id: SongId | null | undefined): SongDefinition {
  if (id && builtinById.has(id)) return builtinById.get(id)!;
  if (id) {
    const user = loadUserSongsRaw().find((s) => s.id === id);
    if (user) return user;
  }
  return BAJO_LA_LUNA;
}

export function loadActiveSongId(): SongId {
  try {
    const raw = localStorage.getItem(ACTIVE_SONG_KEY);
    if (raw && (builtinById.has(raw) || loadUserSongsRaw().some((s) => s.id === raw))) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SONG_ID;
}

export function saveActiveSongId(id: SongId) {
  try {
    localStorage.setItem(ACTIVE_SONG_KEY, id);
  } catch {
    /* ignore */
  }
}

/** Livecode for a song: user songs = library; built-ins = draft overlay. */
export function loadSongDraft(id: SongId): string {
  const song = getSong(id);
  if (song.user) return song.livecode;
  try {
    const draft = localStorage.getItem(draftKey(id));
    if (draft && draft.trim()) {
      const storedRev = loadDraftRevs()[id];
      const factoryRev = song.revision ?? 1;
      // Stale draft from before a factory rewrite → discard (hear the real song).
      if (storedRev == null || storedRev < factoryRev) {
        localStorage.removeItem(draftKey(id));
        clearDraftRev(id);
        return song.livecode;
      }
      return draft;
    }
  } catch {
    /* ignore */
  }
  return song.livecode;
}

/**
 * Persist edits across refresh.
 * - User songs: write into the user library (canonical).
 * - Built-in songs: draft overlay only (factory file stays clean).
 */
export function saveSongDraft(id: SongId, code: string) {
  if (isUserSong(id)) {
    const songs = loadUserSongsRaw();
    const idx = songs.findIndex((s) => s.id === id);
    if (idx >= 0) {
      songs[idx] = { ...songs[idx], livecode: code, updatedAt: new Date().toISOString() };
      persistUserSongs(songs);
    }
  }
  try {
    localStorage.setItem(draftKey(id), code);
    saveDraftRev(id, getSong(id).revision ?? 1);
  } catch {
    /* ignore */
  }
}

export function clearSongDraft(id: SongId) {
  try {
    localStorage.removeItem(draftKey(id));
    clearDraftRev(id);
  } catch {
    /* ignore */
  }
}

/** Drop browser draft and return factory livecode (builtin) or current user song. */
export function resetSongToFactory(id: SongId): string {
  clearSongDraft(id);
  return getSong(id).livecode;
}

export function blankLivecode(genre: VoicePack, title: string): string {
  const bpm = genre === 'punk' ? 178 : genre === 'classical' ? 108 : genre === 'tekno' ? 168 : 92;
  if (genre === 'classical') {
    return `// ${title} — start with a long Piano Pattern (FL: write the phrase, then Playlist)
genre: "classical"
bpm: ${bpm}
bars: 32
clipWrap: 0
channels: [wt, bass, an, tp, rg]
scene: 1
play: "song"

// Empty 8-bar Grand Piano canvas — draw the story here (not 1-bar loops)
wt.1.notes: [62, 0, 2, 0.01, 0]
`;
  }
  if (genre === 'punk') {
    return `// ${title} — tight 4-channel punk bed
genre: "punk"
bpm: ${bpm}
bars: 16
clipWrap: 1
channels: [kick, snare, hihat, bass, wt]
scene: 1
play: "song"

kick.1.notes: [60, 0, 1, 60, 8, 1]
snare.1.notes: [60, 4, 1, 60, 12, 1]
hihat.1.notes: [60, 0, 1, 60, 2, 1, 60, 4, 1, 60, 6, 1, 60, 8, 1, 60, 10, 1, 60, 12, 1, 60, 14, 1]
`;
  }
  if (genre === 'tekno') {
    return `// ${title} — kick-led tekno (loops OK)
genre: "tekno"
bpm: ${bpm}
bars: 32
clipWrap: 1
channels: [kick, snare, hihat, bass, wt]
scene: 1
play: "song"

kick.1.notes: [60, 0, 1, 60, 4, 1, 60, 8, 1, 60, 12, 1]
`;
  }
  return `// ${title} — cumbia groove skeleton
genre: "cumbia"
bpm: ${bpm}
bars: 24
clipWrap: 1
channels: [kick, snare, hihat, mc, bass, wt]
scene: 1
play: "song"

kick.1.notes: [60, 0, 1, 60, 8, 1]
snare.1.notes: [60, 4, 1, 60, 12, 1]
hihat.1.notes: [60, 2, 1, 60, 6, 1, 60, 10, 1, 60, 14, 1]
`;
}

function uniqueUserId(title: string): SongId {
  const base = `user-${slugify(title)}`;
  const existing = new Set(listSongs().map((s) => s.id));
  if (!existing.has(base)) return base;
  let n = 2;
  while (existing.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

const STUDIO_FOR_GENRE: Record<VoicePack, string> = {
  cumbia: 'Cumbia Forge',
  tekno: 'Tekno Forge',
  punk: 'Punk Forge',
  classical: 'Salon Forge',
};

/** Create a new user song (optionally cloned from current code / template). */
export function createUserSong(opts: {
  title: string;
  genre: VoicePack;
  livecode?: string;
  studioName?: string;
}): SongDefinition {
  const title = opts.title.trim() || 'Untitled';
  const song: SongDefinition = {
    id: uniqueUserId(title),
    title,
    studioName: opts.studioName || STUDIO_FOR_GENRE[opts.genre] || 'My Songs',
    genre: opts.genre,
    livecode: opts.livecode?.trim() || blankLivecode(opts.genre, title),
    revision: 1,
    user: true,
    updatedAt: new Date().toISOString(),
  };
  const songs = loadUserSongsRaw();
  songs.push(song);
  persistUserSongs(songs);
  try {
    localStorage.setItem(draftKey(song.id), song.livecode);
  } catch {
    /* ignore */
  }
  return song;
}

/** Duplicate any song (built-in or user) into a new user song. */
export function duplicateAsUserSong(sourceId: SongId, title?: string): SongDefinition {
  const src = getSong(sourceId);
  const code = loadSongDraft(sourceId);
  return createUserSong({
    title: title?.trim() || `${src.title} (copy)`,
    genre: src.genre,
    livecode: code,
    studioName: src.studioName,
  });
}

export function renameUserSong(id: SongId, title: string): SongDefinition | null {
  const songs = loadUserSongsRaw();
  const idx = songs.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const nextTitle = title.trim() || songs[idx].title;
  songs[idx] = { ...songs[idx], title: nextTitle, updatedAt: new Date().toISOString() };
  persistUserSongs(songs);
  return songs[idx];
}

export function deleteUserSong(id: SongId): boolean {
  const songs = loadUserSongsRaw();
  const next = songs.filter((s) => s.id !== id);
  if (next.length === songs.length) return false;
  persistUserSongs(next);
  clearSongDraft(id);
  try {
    localStorage.removeItem(draftKey(id));
  } catch {
    /* ignore */
  }
  return true;
}

/** Downloadable backup of all user songs (+ optional active id). */
export function exportUserLibraryJson(): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      activeSongId: loadActiveSongId(),
      songs: loadUserSongsRaw(),
    },
    null,
    2,
  );
}

/** Import user songs from export JSON. Returns count imported. */
export function importUserLibraryJson(raw: string): number {
  const data = JSON.parse(raw) as { songs?: SongDefinition[] };
  if (!Array.isArray(data.songs)) throw new Error('Invalid library file');
  const existing = loadUserSongsRaw();
  const byId = new Map(existing.map((s) => [s.id, s]));
  let n = 0;
  for (const s of data.songs) {
    if (!s?.id || typeof s.livecode !== 'string') continue;
    const genre = isVoicePack(String(s.genre)) ? s.genre : 'cumbia';
    byId.set(s.id, {
      id: s.id,
      title: s.title || s.id,
      studioName: s.studioName || 'My Songs',
      genre,
      livecode: s.livecode,
      revision: typeof s.revision === 'number' ? s.revision : 1,
      user: true,
      updatedAt: new Date().toISOString(),
    });
    n += 1;
  }
  persistUserSongs([...byId.values()]);
  return n;
}
