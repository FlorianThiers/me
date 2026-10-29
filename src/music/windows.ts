import { TRACK_LABELS } from './defaults';

import type { TrackId } from './types';

import { TRACK_IDS } from './types';



export const CORE_WINDOW_IDS = ['rack', 'arrangement', 'pianoroll', 'mixer', 'livecode', 'visualizer'] as const;

export type CoreWindowId = (typeof CORE_WINDOW_IDS)[number];

export type SoundWindowId = `sound-${TrackId}`;

export type WindowId = CoreWindowId | SoundWindowId;



export type WindowFrame = {

  x: number;

  y: number;

  w: number;

  h: number;

  z: number;

  open: boolean;

  minimized: boolean;

};



export type WindowLayout = Record<WindowId, WindowFrame>;



const STORAGE_KEY = 'myspace-studio-windows-v3';



export const WINDOW_TITLES: Record<WindowId, string> = {

  rack: 'Patterns',

  arrangement: 'Playlist',

  pianoroll: 'Piano roll',

  mixer: 'Mixer',

  livecode: 'Livecode',

  visualizer: 'Scope / Spectrum',

  'sound-kick': `${TRACK_LABELS.kick} · sound`,

  'sound-snare': `${TRACK_LABELS.snare} · sound`,

  'sound-hihat': `${TRACK_LABELS.hihat} · sound`,

  'sound-mc': `${TRACK_LABELS.mc} · sound`,

  'sound-bass': `${TRACK_LABELS.bass} · sound`,

  'sound-wt': `${TRACK_LABELS.wt} · sound`,

  'sound-an': `${TRACK_LABELS.an} · sound`,

  'sound-tp': `${TRACK_LABELS.tp} · sound`,

  'sound-rg': `${TRACK_LABELS.rg} · sound`,

  'sound-vox': `${TRACK_LABELS.vox} · sound + FX`,

};



export function soundWindowId(track: TrackId): SoundWindowId {

  return `sound-${track}`;

}



export function isSoundWindow(id: WindowId): id is SoundWindowId {

  return id.startsWith('sound-');

}



export function trackFromSoundWindow(id: SoundWindowId): TrackId {

  return id.slice(6) as TrackId;

}



export function allWindowIds(): WindowId[] {

  return [...CORE_WINDOW_IDS, ...TRACK_IDS.map(soundWindowId)];

}



export function defaultLayout(): WindowLayout {

  const layout = {} as WindowLayout;

  layout.rack = { x: 12, y: 12, w: 520, h: 280, z: 3, open: true, minimized: false };

  layout.arrangement = { x: 544, y: 12, w: 560, h: 320, z: 4, open: true, minimized: false };

  layout.pianoroll = { x: 544, y: 344, w: 560, h: 280, z: 8, open: true, minimized: false };

  layout.mixer = { x: 12, y: 304, w: 720, h: 180, z: 5, open: true, minimized: false };

  layout.livecode = { x: 1120, y: 12, w: 340, h: 430, z: 6, open: true, minimized: false };

  layout.visualizer = { x: 1120, y: 454, w: 340, h: 220, z: 7, open: true, minimized: false };

  TRACK_IDS.forEach((id, i) => {

    layout[soundWindowId(id)] = {

      x: 544 + i * 18,

      y: 420 + i * 18,

      w: 300,

      h: 440,

      z: 8 + i,

      open: id === 'kick' || id === 'vox',

      minimized: false,

    };

  });

  return layout;

}



function isFrame(v: unknown): v is WindowFrame {

  if (!v || typeof v !== 'object') return false;

  const f = v as WindowFrame;

  return [f.x, f.y, f.w, f.h, f.z].every((n) => typeof n === 'number') && typeof f.open === 'boolean';

}



export function loadLayout(): WindowLayout {

  const base = defaultLayout();

  try {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return base;

    const parsed = JSON.parse(raw) as Partial<WindowLayout>;

    for (const id of allWindowIds()) {

      if (isFrame(parsed[id])) {

        base[id] = { ...base[id], ...parsed[id], minimized: parsed[id]?.minimized ?? false };

      }

    }

  } catch {

    return defaultLayout();

  }

  return base;

}



export function saveLayout(layout: WindowLayout) {

  try {

    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));

  } catch {

    /* ignore quota */

  }

}



export function nextZ(layout: WindowLayout): number {

  return Math.max(0, ...allWindowIds().map((id) => layout[id].z)) + 1;

}



export function clampFrame(frame: WindowFrame, deskW: number, deskH: number): WindowFrame {

  const w = Math.max(220, Math.min(frame.w, Math.max(220, deskW - 8)));

  const h = frame.minimized ? 28 : Math.max(120, Math.min(frame.h, Math.max(120, deskH - 8)));

  const x = Math.max(0, Math.min(frame.x, Math.max(0, deskW - 48)));

  const y = Math.max(0, Math.min(frame.y, Math.max(0, deskH - 28)));

  return { ...frame, x, y, w, h };

}


