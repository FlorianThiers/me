/** FL Studio–inspired palette for Cumbia Forge */
export const STUDIO = {
  bg: '#0d0d0d',
  surface: '#141414',
  panel: '#181818',
  panelHeader: '#1c1c1c',
  border: '#2a2a2a',
  borderLight: '#333333',
  text: '#d4d4d4',
  textMuted: '#7a7a7a',
  textDim: '#505050',
  accent: '#ff8c00',
  accentHover: '#ffa033',
  accentText: '#111111',
  play: '#ff8c00',
  active: '#3a3a3a',
  hover: '#222222',
} as const;

export const WINDOW_SHORT: Record<string, string> = {
  arrangement: 'PL',
  rack: 'CR',
  pianoroll: 'PR',
  mixer: 'MX',
  livecode: 'LC',
  visualizer: 'SC',
  sound: 'SD',
};
