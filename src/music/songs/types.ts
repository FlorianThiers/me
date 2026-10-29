import type { VoicePack } from '../types';

export type SongId = string;

export type SongDefinition = {
  id: SongId;
  /** Short title in the song picker */
  title: string;
  /** Shown as studio name in the transport bar */
  studioName: string;
  genre: VoicePack;
  /** Livecode source (patterns, sound, clips, FX) */
  livecode: string;
  /**
   * Bump when factory livecode changes. Stale browser drafts are discarded
   * so users actually hear the repo song (not an old 4-bar loop draft).
   */
  revision: number;
  /** true = saved in browser localStorage (user-owned) */
  user?: boolean;
  /** ISO timestamp for user songs */
  updatedAt?: string;
};
