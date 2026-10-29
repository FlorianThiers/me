import { createContext, useContext } from 'react';
import { TRACK_LABELS, trackLabels } from '../../music/defaults';
import type { TrackId, VoicePack } from '../../music/types';

type MusicMeta = {
  genre: VoicePack;
  labels: Record<TrackId, string>;
};

const MusicMetaContext = createContext<MusicMeta>({
  genre: 'cumbia',
  labels: TRACK_LABELS,
});

export const MusicMetaProvider = MusicMetaContext.Provider;

export function useTrackLabels(): Record<TrackId, string> {
  return useContext(MusicMetaContext).labels;
}

export function useMusicGenre(): VoicePack {
  return useContext(MusicMetaContext).genre;
}

export function metaFromGenre(genre: VoicePack): MusicMeta {
  return { genre, labels: trackLabels(genre) };
}
