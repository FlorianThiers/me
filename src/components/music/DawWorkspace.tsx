import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TRACK_COLORS, VOCAL_FX_PRESET } from '../../music/defaults';
import { parseProject, parseRepl, patchBinding } from '../../music/dsl';
import { useLiveSetKeys } from '../../hooks/useLiveSetKeys';
import { MusicEngine } from '../../music/engine';
import { saveOutputDeviceId } from '../../music/outputDevices';
import { loadMasterVolume, saveMasterVolume } from '../../music/masterVolume';
import {
  createUserSong,
  deleteUserSong,
  duplicateAsUserSong,
  exportUserLibraryJson,
  getSong,
  importUserLibraryJson,
  listSongs,
  loadActiveSongId,
  loadSongDraft,
  renameUserSong,
  resetSongToFactory,
  saveActiveSongId,
  saveSongDraft,
  type SongId,
} from '../../music/songs';
import type { VoicePack } from '../../music/types';
import {
  addSceneRow,
  clipBarsForPattern,
  extendArrangement,
  extendPattern,
  flattenAudioClips,
  flattenClips,
  flattenNotes,
  nextTakeOnLane,
  notesKey,
  patternContentSteps,
  patternLengthBars,
  rackChannelList,
  sceneCount,
  sceneForTrackAtBar,
  setPatternLength,
  songBarCount,
  trackLane,
} from '../../music/grid';
import type {
  AnalogParams,
  AudioClip,
  BeatInfo,
  BindingValue,
  DrumId,
  DrumSound,
  FxChain,
  MidiNote,
  PlayMode,
  PlaylistClip,
  TrackId,
  WavetableParams,
} from '../../music/types';
import type { LiveSetKeyBinding } from '../../music/liveSetKeys';
import { STEPS_PER_BAR, TRACK_IDS } from '../../music/types';
import { FL } from '../../music/flTerms';
import { initialOutputDeviceId } from './AudioOutputSelect';
import { ChannelRack } from './ChannelRack';
import { LiveSetGrid } from './LiveSetGrid';
import { LivecodeTerminal } from './LivecodeTerminal';
import { Mixer } from './Mixer';
import { metaFromGenre, MusicMetaProvider } from './MusicMetaContext';
import { PanelDock } from './PanelDock';
import { PianoRoll } from './PianoRoll';
import { PlaylistGrid } from './PlaylistGrid';
import { SoundPanel } from './SoundPanel';
import { SplitPane } from './SplitPane';
import { StudioNav } from './StudioNav';
import { StudioTransport, type PanelKey } from './StudioTransport';
import { STUDIO } from './studioTheme';
import { Visualizer } from './Visualizer';

const PANEL_STORAGE = 'myspace-studio-panels-v2';
const SPLIT_STORAGE = 'myspace-studio-splits-v2';
const KEYBOARD_MODE_STORAGE = 'myspace-studio-keyboard-mode';

export type StudioKeyboardMode = 'piano' | 'liveSet';

type PanelVisibility = Record<PanelKey, boolean>;

type SplitRatios = {
  centerVertical: number;
  rightWidth: number;
  rackWidth: number;
  mainHeight: number;
};

type RightTab = 'sound' | 'livecode' | 'visualizer';

const DEFAULT_PANELS: PanelVisibility = {
  arrangement: true,
  rack: true,
  pianoroll: true,
  mixer: true,
  livecode: true,
  visualizer: false,
  sound: false,
};

const DEFAULT_SPLITS: SplitRatios = {
  centerVertical: 0.36,
  rightWidth: 0.28,
  rackWidth: 0.22,
  mainHeight: 0.72,
};

function loadPanels(): PanelVisibility {
  try {
    const raw = localStorage.getItem(PANEL_STORAGE);
    if (!raw) return DEFAULT_PANELS;
    return { ...DEFAULT_PANELS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PANELS;
  }
}

function savePanels(panels: PanelVisibility) {
  try {
    localStorage.setItem(PANEL_STORAGE, JSON.stringify(panels));
  } catch {
    /* ignore */
  }
}

function loadSplits(): SplitRatios {
  try {
    const raw = localStorage.getItem(SPLIT_STORAGE);
    if (!raw) return DEFAULT_SPLITS;
    return { ...DEFAULT_SPLITS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SPLITS;
  }
}

function saveSplits(splits: SplitRatios) {
  try {
    localStorage.setItem(SPLIT_STORAGE, JSON.stringify(splits));
  } catch {
    /* ignore */
  }
}

function patternKey(track: TrackId, scene: number): string {
  return scene <= 1 ? track : `${track}.${scene}`;
}

function patchArrangement(code: string, project: ReturnType<typeof parseProject>['project']) {
  let next = code;
  for (const id of TRACK_IDS) {
    next = patchBinding(next, `${id}_arr`, project.arrangement[id]).code;
  }
  return next;
}

const FKEY_MAP: Record<string, PanelKey> = {
  F5: 'arrangement',
  F6: 'rack',
  F7: 'pianoroll',
  F9: 'mixer',
};

function firstOpenRightTab(panels: PanelVisibility): RightTab {
  if (panels.livecode) return 'livecode';
  if (panels.sound) return 'sound';
  return 'visualizer';
}

function loadKeyboardMode(): StudioKeyboardMode {
  try {
    const raw = localStorage.getItem(KEYBOARD_MODE_STORAGE);
    if (raw === 'piano' || raw === 'liveSet') return raw;
  } catch {
    /* ignore */
  }
  return 'liveSet';
}

function saveKeyboardMode(mode: StudioKeyboardMode) {
  try {
    localStorage.setItem(KEYBOARD_MODE_STORAGE, mode);
  } catch {
    /* ignore */
  }
}

export const DawWorkspace: React.FC = () => {
  const [songListTick, setSongListTick] = useState(0);
  const songs = useMemo(() => listSongs(), [songListTick]);
  const [songId, setSongId] = useState<SongId>(() => loadActiveSongId());
  const activeSong = useMemo(() => getSong(songId), [songId, songListTick]);
  const [code, setCode] = useState(() => loadSongDraft(loadActiveSongId()));
  const [followLine, setFollowLine] = useState<number | null>(null);
  const [followFlash, setFollowFlash] = useState(0);
  const [selected, setSelected] = useState<TrackId>('kick');
  const [paintScene, setPaintScene] = useState(1);
  const [keysOn, setKeysOn] = useState(true);
  const [keyboardMode, setKeyboardMode] = useState<StudioKeyboardMode>(loadKeyboardMode);
  const [liveSetBindings, setLiveSetBindings] = useState<Record<string, LiveSetKeyBinding>>({});
  const [liveSetUiTick, setLiveSetUiTick] = useState(0);
  const [octave, setOctave] = useState(4);
  const [selectedLane, setSelectedLane] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [looping, setLooping] = useState(true);
  const [metronome, setMetronome] = useState(false);
  const [swing, setSwing] = useState(0.28);
  const [snapSteps, setSnapSteps] = useState<1 | 2 | 4>(1);
  const [snapBars, setSnapBars] = useState<1 | 2 | 4>(1);
  const [bpmDraft, setBpmDraft] = useState<string | null>(null);
  const beatRef = useRef<BeatInfo>({ step: 0, patternStep: 0, bar: 0, scene: 1 });
  const [beatDisplay, setBeatDisplay] = useState<BeatInfo>({
    step: 0,
    patternStep: 0,
    bar: 0,
    scene: 1,
  });
  const [repl, setRepl] = useState('');
  const [vizMode, setVizMode] = useState<'waveform' | 'spectrum' | 'both'>('both');
  const [status, setStatus] = useState('ready');
  const [outputDeviceId, setOutputDeviceId] = useState(initialOutputDeviceId);
  const [masterVolume, setMasterVolume] = useState(loadMasterVolume);
  const [panels, setPanels] = useState<PanelVisibility>(loadPanels);
  const [splits, setSplits] = useState<SplitRatios>(loadSplits);
  const [rightTab, setRightTab] = useState<RightTab>(() => firstOpenRightTab(loadPanels()));
  const engineRef = useRef<MusicEngine | null>(null);
  const fromUiRef = useRef(false);

  const onEngineBeat = useCallback((info: BeatInfo) => {
    beatRef.current = info;
    setBeatDisplay(info);
  }, []);

  const parsed = useMemo(() => parseProject(code), [code]);
  const project = parsed.project;
  const musicMeta = useMemo(() => metaFromGenre(project.genre), [project.genre]);
  const TRACK_LABELS = musicMeta.labels;

  // Persist livecode draft per song while editing
  useEffect(() => {
    saveSongDraft(songId, code);
  }, [songId, code]);

  const switchSong = useCallback(
    (nextId: SongId) => {
      if (nextId === songId) return;
      engineRef.current?.stop();
      setPlaying(false);
      saveSongDraft(songId, code);
      saveActiveSongId(nextId);
      setSongId(nextId);
      setCode(loadSongDraft(nextId));
      setPaintScene(1);
      setBpmDraft(null);
      setFollowLine(null);
      setStatus(`song → ${getSong(nextId).title}`);
    },
    [songId, code],
  );

  const refreshSongList = useCallback(() => setSongListTick((n) => n + 1), []);

  const openCreatedSong = useCallback(
    (created: ReturnType<typeof createUserSong>, label: string) => {
      engineRef.current?.stop();
      setPlaying(false);
      saveSongDraft(songId, code);
      saveActiveSongId(created.id);
      refreshSongList();
      setSongId(created.id);
      setCode(created.livecode);
      setPaintScene(1);
      setBpmDraft(null);
      setFollowLine(null);
      setStatus(label);
    },
    [songId, code, refreshSongList],
  );

  const onSongNew = useCallback(
    (title: string, genre: VoicePack) => {
      const created = createUserSong({ title, genre });
      openCreatedSong(created, `new → ${created.title}`);
    },
    [openCreatedSong],
  );

  const onSongSaveAs = useCallback(
    (title: string) => {
      const created = createUserSong({
        title,
        genre: project.genre,
        livecode: code,
        studioName: activeSong.studioName,
      });
      openCreatedSong(created, `saved → ${created.title}`);
    },
    [openCreatedSong, project.genre, code, activeSong.studioName],
  );

  const onSongDuplicate = useCallback(() => {
    const created = duplicateAsUserSong(songId);
    openCreatedSong(created, `dup → ${created.title}`);
  }, [openCreatedSong, songId]);

  const onSongRename = useCallback(
    (title: string) => {
      const updated = renameUserSong(songId, title);
      if (!updated) {
        setStatus('rename failed (factory song?)');
        return;
      }
      refreshSongList();
      setStatus(`renamed → ${updated.title}`);
    },
    [songId, refreshSongList],
  );

  const onSongDelete = useCallback(() => {
    if (!deleteUserSong(songId)) {
      setStatus('delete failed');
      return;
    }
    engineRef.current?.stop();
    setPlaying(false);
    const nextId = listSongs()[0]?.id ?? 'bajo-la-luna';
    refreshSongList();
    saveActiveSongId(nextId);
    setSongId(nextId);
    setCode(loadSongDraft(nextId));
    setPaintScene(1);
    setStatus('song deleted');
  }, [songId, refreshSongList]);

  const onSongExport = useCallback(() => {
    const json = exportUserLibraryJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myspace-songs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('exported my songs');
  }, []);

  const onSongImport = useCallback(
    (json: string) => {
      try {
        const n = importUserLibraryJson(json);
        refreshSongList();
        setStatus(`imported ${n} song(s)`);
      } catch (e) {
        setStatus(`import failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
    [refreshSongList],
  );

  const showRight = panels.sound || panels.livecode || panels.visualizer;

  const rollSteps = useMemo(
    () => patternContentSteps(project, selected, Math.max(0, paintScene - 1)),
    [project, selected, paintScene],
  );

  const rollClipBars = useMemo(
    () => clipBarsForPattern(project, selected, paintScene),
    [project, selected, paintScene],
  );

  useEffect(() => {
    const rack = rackChannelList(project);
    if (!rack.includes(selected)) setSelected(rack[0] ?? 'wt');
  }, [project, selected]);

  const togglePanel = useCallback((key: PanelKey) => {
    setPanels((prev) => {
      // FL-style: PL while PR open → hide piano roll to reveal playlist
      if (key === 'arrangement' && prev.arrangement && prev.pianoroll) {
        const next = { ...prev, pianoroll: false };
        savePanels(next);
        return next;
      }
      // PR while closed → open overlay and keep playlist underneath
      if (key === 'pianoroll' && !prev.pianoroll) {
        const next = { ...prev, pianoroll: true, arrangement: true };
        savePanels(next);
        return next;
      }
      const opening = !prev[key];
      const next = { ...prev, [key]: opening };
      if (opening && (key === 'sound' || key === 'livecode' || key === 'visualizer')) {
        setRightTab(key);
      }
      if (!opening && key === rightTab) {
        setRightTab(firstOpenRightTab({ ...next, [key]: false }));
      }
      savePanels(next);
      return next;
    });
  }, [rightTab]);

  const openPiano = useCallback(() => {
    setPanels((prev) => {
      const next = { ...prev, pianoroll: true, arrangement: true };
      savePanels(next);
      return next;
    });
  }, []);

  const closePiano = useCallback(() => {
    setPanels((prev) => {
      const next = { ...prev, pianoroll: false };
      savePanels(next);
      return next;
    });
  }, []);

  const onSelectTrack = (track: TrackId) => {
    setSelected(track);
    if (track === 'vox') setSelectedLane(trackLane('vox'));
    setPaintScene(sceneForTrackAtBar(project, track, beatRef.current.bar));
    openPiano();
  };

  const openSound = (track: TrackId) => {
    onSelectTrack(track);
    setRightTab('sound');
    setPanels((prev) => {
      const next = { ...prev, sound: true };
      savePanels(next);
      return next;
    });
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!panels[rightTab]) {
      setRightTab(firstOpenRightTab(panels));
    }
  }, [panels, rightTab]);

  useEffect(() => {
    saveSplits(splits);
  }, [splits]);

  useEffect(() => {
    const engine = new MusicEngine(project, {
      onBeat: onEngineBeat,
      onStop: () => setPlaying(false),
    });
    engine.preferOutputDevice(initialOutputDeviceId());
    engine.preferMasterVolume(loadMasterVolume());
    engineRef.current = engine;
    return () => {
      void engine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setProject(project);
    engineRef.current?.setLooping(looping);
    engineRef.current?.setMetronome(metronome);
    engineRef.current?.setSwing(swing);
    if (project.playMode === 'session') {
      engineRef.current?.setSessionScene(paintScene);
    } else {
      engineRef.current?.setSessionScene(null);
    }
  }, [project, looping, metronome, swing, paintScene]);

  const onKeyboardMode = useCallback((mode: StudioKeyboardMode) => {
    setKeyboardMode(mode);
    saveKeyboardMode(mode);
    setStatus(mode === 'piano' ? 'keys · piano' : 'keys · live set');
  }, []);

  const onOutputDevice = useCallback(async (deviceId: string) => {
    setOutputDeviceId(deviceId);
    saveOutputDeviceId(deviceId);
    const engine = engineRef.current;
    if (!engine) return;
    try {
      await engine.setOutputDevice(deviceId);
      setStatus(
        deviceId.startsWith('upnp:')
          ? 'output · Phantom (play to cast)'
          : deviceId
            ? 'output switched'
            : 'output · system default',
      );
    } catch (e) {
      // Keep the chosen device id so the picker does not snap back / grey out.
      setStatus(e instanceof Error ? e.message : 'output switch failed');
      throw e;
    }
  }, []);

  const onMasterVolume = useCallback((volume: number) => {
    setMasterVolume(volume);
    saveMasterVolume(volume);
    engineRef.current?.setMasterVolume(volume);
  }, []);

  const applyGridProfile = (profile: 'tight' | 'human' | 'loose') => {
    if (profile === 'tight') {
      setSnapSteps(1);
      setSnapBars(1);
      setSwing(0.04);
      setStatus('profile tight');
      return;
    }
    if (profile === 'human') {
      setSnapSteps(2);
      setSnapBars(2);
      setSwing(0.12);
      setStatus('profile human');
      return;
    }
    setSnapSteps(4);
    setSnapBars(4);
    setSwing(0.2);
    setStatus('profile loose');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (e.code === 'Space' && !typing) {
        e.preventDefault();
        togglePlay();
        return;
      }

      // Tab = toggle piano roll ↔ playlist (FL-ish)
      if (e.code === 'Tab' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setPanels((prev) => {
          const next = { ...prev, pianoroll: !prev.pianoroll, arrangement: true };
          savePanels(next);
          return next;
        });
        return;
      }

      if (!typing && FKEY_MAP[e.code]) {
        e.preventDefault();
        togglePanel(FKEY_MAP[e.code]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchUi = useCallback((key: string, value: BindingValue) => {
    fromUiRef.current = true;
    setCode((prev) => {
      const result = patchBinding(prev, key, value);
      setFollowLine(result.line);
      setFollowFlash((n) => n + 1);
      return result.code;
    });
    setStatus(`ui → ${key}`);
    window.setTimeout(() => {
      fromUiRef.current = false;
    }, 0);
  }, []);

  const onLiveSetSceneLaunched = useCallback(
    (scene1: number) => {
      patchUi('scene', scene1);
      setPaintScene(scene1);
    },
    [patchUi],
  );

  useLiveSetKeys({
    enabled: keysOn && keyboardMode === 'liveSet',
    getEngine: () => engineRef.current,
    bindings: liveSetBindings,
    onSceneLaunched: onLiveSetSceneLaunched,
    onStatus: setStatus,
    onAction: () => setLiveSetUiTick((n) => n + 1),
  });

  const onCodeChange = useCallback((next: string) => {
    setCode(next);
    if (!fromUiRef.current) setStatus('livecode → ui');
  }, []);

  const evalNow = useCallback(() => {
    const { errors } = parseProject(code);
    setStatus(
      errors.length
        ? errors[0]
        : `eval · ${project.bpm} bpm · ${project.playMode} · scene ${project.scene}`,
    );
  }, [code, project.bpm, project.playMode, project.scene]);

  const togglePlay = async () => {
    const live = parseProject(code).project;
    if (engineRef.current?.isPlaying()) {
      engineRef.current.stop();
      setPlaying(false);
      setStatus('stop');
      return;
    }
    const prev = engineRef.current;
    const casting = outputDeviceId.startsWith('upnp:');
    if (prev) {
      // Don't bridgeStop here — a racing dispose was killing Phantom right after Play.
      await prev.disposeLocal();
    }
    const engine = new MusicEngine(live, {
      onBeat: onEngineBeat,
      onStop: () => setPlaying(false),
    });
    engine.setLooping(looping);
    engine.setMetronome(metronome);
    engine.setSwing(swing);
    engine.preferOutputDevice(outputDeviceId);
    engine.preferMasterVolume(masterVolume);
    if (live.playMode === 'session') {
      engine.setSessionScene(paintScene);
    } else {
      engine.setSessionScene(null);
    }
    engineRef.current = engine;
    try {
      await engine.start();
      setPlaying(true);
      setStatus(
        casting
          ? live.playMode === 'arr'
            ? `cast song · Phantom · ${live.bpm} bpm`
            : `cast pattern · Phantom · ${live.bpm} bpm`
          : live.playMode === 'arr'
            ? `play song · ${live.bpm} bpm · ${songBarCount(live)} bars`
            : `play pattern · ${live.bpm} bpm`,
      );
    } catch (e) {
      setPlaying(false);
      setStatus(e instanceof Error ? e.message : 'play/cast failed');
    }
  };

  const setPlayMode = (mode: PlayMode) => {
    patchUi('play', mode);
    setStatus(mode === 'arr' ? `${FL.songMode} mode · ${FL.playlist}` : `${FL.patternMode} mode · loop`);
  };

  const setRackChannels = (ids: TrackId[]) => {
    const unique = TRACK_IDS.filter((id) => ids.includes(id));
    if (unique.length === 0) return;
    patchUi('channels', unique);
    if (!unique.includes(selected)) setSelected(unique[0]);
    setStatus(`channels · ${unique.length}`);
  };

  const onAddChannel = (id: TrackId) => {
    const cur = rackChannelList(project);
    if (cur.includes(id)) return;
    setRackChannels([...cur, id]);
  };

  const onRemoveChannel = (id: TrackId) => {
    const cur = rackChannelList(project);
    if (cur.length <= 1) return;
    setRackChannels(cur.filter((c) => c !== id));
  };

  const resetToFactory = () => {
    engineRef.current?.stop();
    setPlaying(false);
    const code = resetSongToFactory(songId);
    setCode(code);
    setPaintScene(1);
    setBpmDraft(null);
    setFollowLine(null);
    setStatus('reset to factory');
  };

  const runRepl = () => {
    const parsedLine = parseRepl(repl);
    if (!parsedLine) return;
    if ('error' in parsedLine) {
      setStatus(parsedLine.error);
      return;
    }
    if ('launch' in parsedLine) {
      patchUi('scene', parsedLine.launch);
      setPaintScene(parsedLine.launch);
      setRepl('');
      return;
    }
    if ('replLaunch' in parsedLine) {
      engineRef.current?.launchClip(parsedLine.replLaunch.track, parsedLine.replLaunch.slot);
      setLiveSetUiTick((n) => n + 1);
      setStatus(`launch ${parsedLine.replLaunch.track} · ${parsedLine.replLaunch.slot}`);
      setRepl('');
      return;
    }
    if ('replScene' in parsedLine) {
      const scene1 = parsedLine.replScene.scene1;
      engineRef.current?.launchScene(scene1 - 1);
      patchUi('scene', scene1);
      setPaintScene(scene1);
      setStatus(`scene ${scene1}`);
      setRepl('');
      return;
    }
    if ('replStop' in parsedLine) {
      engineRef.current?.stopClip(parsedLine.replStop.track);
      setStatus(`stop ${parsedLine.replStop.track}`);
      setRepl('');
      return;
    }
    if ('replBind' in parsedLine) {
      const { code, track, slot } = parsedLine.replBind;
      setLiveSetBindings((prev) => ({ ...prev, [code]: { track, slot } }));
      setStatus(`bind ${code} → ${track}.${slot}`);
      setRepl('');
      return;
    }
    if ('replQuant' in parsedLine) {
      engineRef.current?.setLaunchQuantization(parsedLine.replQuant);
      setStatus(`quant · ${parsedLine.replQuant}`);
      setRepl('');
      return;
    }
    patchUi(parsedLine.key, parsedLine.value);
    setRepl('');
  };

  const onExtendRoll = (addBars: number) => {
    fromUiRef.current = true;
    setCode((prev) => {
      const ext = extendPattern(parseProject(prev).project, selected, paintScene, addBars * STEPS_PER_BAR);
      const result = patchBinding(
        prev,
        patternKey(selected, paintScene),
        ext.patterns[selected][paintScene - 1],
      );
      setStatus(`P${paintScene} +${addBars} bar`);
      return result.code;
    });
    window.setTimeout(() => {
      fromUiRef.current = false;
    }, 0);
  };

  const onSetPatternLength = (steps: number) => {
    fromUiRef.current = true;
    setCode((prev) => {
      const ext = setPatternLength(parseProject(prev).project, selected, paintScene, steps);
      const result = patchBinding(
        prev,
        patternKey(selected, paintScene),
        ext.patterns[selected][paintScene - 1],
      );
      const notes = ext.notes?.[selected]?.[Math.max(0, paintScene - 1)] ?? [];
      const withNotes = patchBinding(result.code, notesKey(selected, paintScene), flattenNotes(notes));
      return withNotes.code;
    });
    window.setTimeout(() => {
      fromUiRef.current = false;
    }, 0);
  };

  const onAddScene = () => {
    fromUiRef.current = true;
    setCode((prev) => {
      const ext = addSceneRow(parseProject(prev).project);
      const scenes = sceneCount(ext);
      let next = prev;
      for (const id of TRACK_IDS) {
        const result = patchBinding(next, patternKey(id, scenes), ext.patterns[id][scenes - 1]);
        next = result.code;
      }
      setPaintScene(scenes);
      setStatus(`pattern ${scenes} added`);
      return next;
    });
    window.setTimeout(() => {
      fromUiRef.current = false;
    }, 0);
  };

  const onAddBars = (count: number) => {
    fromUiRef.current = true;
    setCode((prev) => {
      const proj = parseProject(prev).project;
      const current = songBarCount(proj);
      const nextBars = current + Math.max(1, count);
      let next = patchBinding(prev, 'bars', nextBars).code;
      const ext = extendArrangement(parseProject(next).project, count);
      next = patchArrangement(next, ext);
      setStatus(`+${count} bars → ${nextBars}`);
      return next;
    });
    window.setTimeout(() => {
      fromUiRef.current = false;
    }, 0);
  };

  const onNotesChange = (notes: MidiNote[]) => {
    fromUiRef.current = true;
    setCode((prev) => {
      let next = patchBinding(prev, notesKey(selected, paintScene), flattenNotes(notes)).code;
      const proj = parseProject(next).project;
      const end = notes.reduce((m, n) => Math.max(m, Math.ceil(n.start + n.length)), 0);
      const current = patternContentSteps(proj, selected, Math.max(0, paintScene - 1));
      if (end > current) {
        const ext = setPatternLength(proj, selected, paintScene, end);
        next = patchBinding(next, patternKey(selected, paintScene), ext.patterns[selected][paintScene - 1]).code;
      }
      setFollowLine(null);
      setStatus(`notes → ${TRACK_LABELS[selected]} P${paintScene}`);
      return next;
    });
    window.setTimeout(() => {
      fromUiRef.current = false;
    }, 0);
  };

  const onClipsChange = (clips: PlaylistClip[]) => {
    patchUi('clips', flattenClips(clips));
    patchUi('lanes', Math.max(project.lanes ?? 8, 8));
  };

  const onAudioClipsChange = (audioClips: AudioClip[]) => {
    patchUi('audio', flattenAudioClips(audioClips));
  };

  const dropPatternClip = () => {
    if (selected === 'vox') {
      setStatus('vocals: record a take');
      return;
    }
    const patternBars = Math.max(1, patternLengthBars(project, selected, paintScene));
    fromUiRef.current = true;
    setCode((prev) => {
      const proj = parseProject(prev).project;
      const clips = [...(proj.clips ?? [])];
      const end = clips.reduce((m, c) => Math.max(m, c.start + c.length), 0);
      clips.push({
        track: selected,
        pattern: paintScene,
        start: end,
        length: patternBars,
      });
      let next = patchBinding(prev, 'clips', flattenClips(clips)).code;
      next = patchBinding(next, 'lanes', Math.max(proj.lanes ?? 8, 8)).code;
      setStatus(`${TRACK_LABELS[selected]} P${paintScene} → bar ${end + 1}`);
      return next;
    });
    window.setTimeout(() => {
      fromUiRef.current = false;
    }, 0);
    setPanels((prev) => ({ ...prev, arrangement: true }));
  };

  const onVocalRecorded = useCallback(
    ({
      sampleId,
      lengthBars,
      startBar,
    }: {
      sampleId: string;
      durationSec: number;
      lengthBars: number;
      startBar: number;
    }) => {
      const patternEnd = (project.clips ?? []).reduce((m, c) => Math.max(m, c.start + c.length), 0);
      const audioEnd = (project.audioClips ?? []).reduce((m, c) => Math.max(m, c.start + c.length), 0);
      const start =
        startBar >= 0 ? startBar : Math.max(beatRef.current.bar, patternEnd, audioEnd);
      const lane = selectedLane;
      const take = nextTakeOnLane(project, lane, start);
      const existing = project.audioClips ?? [];
      const next = existing.map((c) =>
        c.lane === lane && c.start === start ? { ...c, active: 0 } : c,
      );
      next.push({ take, lane, start, length: lengthBars, sampleId, active: 1 });
      onAudioClipsChange(next);
      setSelected('vox');
      setSelectedLane(trackLane('vox'));
      setPanels((prev) => ({ ...prev, arrangement: true }));
    },
    [project, selectedLane],
  );

  const ensurePlayingForVocal = async () => {
    if (engineRef.current?.isPlaying()) return;
    await togglePlay();
  };

  const applyVocalPreset = () => {
    (Object.keys(VOCAL_FX_PRESET) as (keyof FxChain)[]).forEach((key) => {
      patchUi(`vox.${key}`, VOCAL_FX_PRESET[key]);
    });
    setStatus('vocal FX preset');
  };

  const onFx = (trackId: TrackId, key: keyof FxChain, value: number) => {
    patchUi(`${trackId}.${key}`, value);
  };

  const onDrum = (id: DrumId, key: keyof DrumSound, value: number | string) => {
    patchUi(key === 'type' ? `${id}_type` : `${id}_${key}`, value);
  };

  const resetLayout = () => {
    setPanels(DEFAULT_PANELS);
    setSplits(DEFAULT_SPLITS);
    setRightTab('sound');
    savePanels(DEFAULT_PANELS);
    saveSplits(DEFAULT_SPLITS);
    setStatus('layout reset');
  };

  const playlistPanel = (
    <PanelDock title={FL.playlist} short="PL" accent={STUDIO.accent} visible>
      <PlaylistGrid
        project={project}
        paintScene={paintScene}
        paintTrack={selected}
        beatRef={beatRef}
        playing={playing}
        snapBars={snapBars}
        selectedTrack={selected}
        onSelectTrack={onSelectTrack}
        onChangeClips={onClipsChange}
        onChangeAudioClips={onAudioClipsChange}
        onAddBars={onAddBars}
        onFocusClip={(track, pattern) => {
          setSelected(track);
          setPaintScene(pattern);
          openPiano();
        }}
      />
    </PanelDock>
  );

  const pianoRollBody = (
    <PianoRoll
      project={project}
      track={selected}
      scene={paintScene}
      steps={rollSteps}
      clipBars={rollClipBars}
      beatRef={beatRef}
      playing={playing}
      snapSteps={snapSteps}
      onChange={onNotesChange}
      onExtend={onExtendRoll}
      onSetLength={onSetPatternLength}
      onPreview={(midi) => {
        void engineRef.current?.previewNote(selected, midi, Math.max(0, paintScene - 1));
      }}
      onDropClip={dropPatternClip}
      onShowPlaylist={closePiano}
    />
  );

  /** Piano roll overlays playlist (FL-style), not stacked below */
  const pianoOverlay = panels.pianoroll ? (
    <div
      className="absolute inset-x-0 bottom-0 z-30 flex flex-col border-t shadow-[0_-8px_32px_rgba(0,0,0,0.55)]"
      style={{
        height: `${Math.round((1 - Math.min(0.75, Math.max(0.2, splits.centerVertical))) * 100)}%`,
        minHeight: 180,
        borderColor: STUDIO.border,
        background: STUDIO.panel,
      }}
    >
      <div
        role="separator"
        aria-label="Resize piano roll"
        title="Sleep om piano roll hoogte aan te passen"
        className="flex h-2 shrink-0 cursor-row-resize items-center justify-center"
        style={{ background: STUDIO.border }}
        onPointerDown={(e) => {
          e.preventDefault();
          const startY = e.clientY;
          const startRatio = splits.centerVertical;
          const parent = (e.currentTarget.parentElement?.parentElement as HTMLElement | null);
          const h = parent?.clientHeight ?? 600;
          const onMove = (ev: PointerEvent) => {
            const dy = ev.clientY - startY;
            const next = Math.min(0.8, Math.max(0.15, startRatio + dy / h));
            setSplits((s) => ({ ...s, centerVertical: next }));
          };
          const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        }}
      >
        <span className="h-0.5 w-10 rounded-full" style={{ background: STUDIO.accent }} />
      </div>
      <PanelDock
        title={`Piano roll · ${TRACK_LABELS[selected]} · P${paintScene}`}
        short="PR"
        accent={TRACK_COLORS[selected]}
        visible
        className="min-h-0 flex-1"
        onClose={closePiano}
      >
        {pianoRollBody}
      </PanelDock>
    </div>
  ) : (
    <button
      type="button"
      onClick={openPiano}
      className="absolute inset-x-0 bottom-0 z-20 flex h-7 items-center gap-2 border-t px-3 text-left text-[10px] hover:brightness-110"
      style={{
        background: STUDIO.panelHeader,
        borderColor: STUDIO.border,
        color: STUDIO.textMuted,
      }}
      title="Tab of klik — open piano roll"
    >
      <span className="font-mono font-bold" style={{ color: STUDIO.accent }}>
        PR
      </span>
      <span>
        Piano roll · {TRACK_LABELS[selected]} · P{paintScene}
      </span>
      <span className="ml-auto text-[9px]" style={{ color: STUDIO.textDim }}>
        Tab / F7
      </span>
    </button>
  );

  const centerContent = () => {
    const hasPlaylist = panels.arrangement;
    const hasPiano = panels.pianoroll;

    if (!hasPlaylist && !hasPiano) {
      return (
        <div className="flex flex-1 items-center justify-center text-[11px]" style={{ color: STUDIO.textDim }}>
          Toggle PL or PR (F5 / F7 / Tab)
        </div>
      );
    }

    if (!hasPlaylist && hasPiano) {
      return (
        <PanelDock
          title={`Piano roll · ${TRACK_LABELS[selected]} · P${paintScene}`}
          short="PR"
          accent={TRACK_COLORS[selected]}
          visible
          className="h-full"
          onClose={closePiano}
        >
          {pianoRollBody}
        </PanelDock>
      );
    }

    return (
      <div className="relative min-h-0 min-w-0 flex-1">
        <div className="absolute inset-0 pb-7">{playlistPanel}</div>
        {pianoOverlay}
      </div>
    );
  };

  const rackPanel = (
    <PanelDock title={FL.channelRack} short="CR" accent={STUDIO.accent} visible className="h-full">
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <ChannelRack
            project={project}
            selected={selected}
            paintScene={paintScene}
            playMode={project.playMode}
            launchedScene={project.scene}
            onSelectTrack={onSelectTrack}
            onSelectScene={setPaintScene}
            onAddScene={onAddScene}
            onLaunchScene={(scene) => {
              engineRef.current?.launchScene(scene - 1);
              patchUi('scene', scene);
              setPaintScene(scene);
            }}
            onAddChannel={onAddChannel}
            onRemoveChannel={onRemoveChannel}
          />
        </div>
        {project.playMode === 'session' && (
          <LiveSetGrid
            project={project}
            engine={engineRef.current}
            playing={playing}
            beat={beatDisplay}
            bindings={liveSetBindings}
            onLaunch={(track, slot) => {
              engineRef.current?.launchClip(track, slot);
              setLiveSetUiTick((n) => n + 1);
              setStatus(`launch ${track} · slot ${slot}`);
            }}
            refreshToken={liveSetUiTick}
          />
        )}
      </div>
    </PanelDock>
  );

  const centerOnly = <div className="flex min-h-0 min-w-0 flex-1 flex-col">{centerContent()}</div>;

  const centerWithRack =
    panels.rack ? (
      <SplitPane
        direction="horizontal"
        ratio={splits.rackWidth}
        onRatioChange={(r) => setSplits((s) => ({ ...s, rackWidth: r }))}
        minFirst={160}
        minSecond={280}
        first={rackPanel}
        second={centerOnly}
      />
    ) : (
      centerOnly
    );

  const centerStack = (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">{centerWithRack}</div>
  );

  const rightPanel = showRight ? (
    <div className="flex h-full min-h-0 min-w-0 flex-col border-l" style={{ borderColor: STUDIO.border }}>
      <div
        className="flex h-[22px] shrink-0 border-b"
        style={{ background: STUDIO.panelHeader, borderColor: STUDIO.border }}
      >
        {panels.sound && (
          <button
            type="button"
            onClick={() => setRightTab('sound')}
            className="px-3 text-[9px] uppercase tracking-wide"
            style={{
              background: rightTab === 'sound' ? STUDIO.active : 'transparent',
              color: rightTab === 'sound' ? STUDIO.accent : STUDIO.textDim,
              borderBottom: rightTab === 'sound' ? `2px solid ${STUDIO.accent}` : 'none',
            }}
          >
            Sound
          </button>
        )}
        {panels.livecode && (
          <button
            type="button"
            onClick={() => setRightTab('livecode')}
            className="px-3 text-[9px] uppercase tracking-wide"
            style={{
              background: rightTab === 'livecode' ? STUDIO.active : 'transparent',
              color: rightTab === 'livecode' ? STUDIO.accent : STUDIO.textDim,
              borderBottom: rightTab === 'livecode' ? `2px solid ${STUDIO.accent}` : 'none',
            }}
          >
            Livecode
          </button>
        )}
        {panels.visualizer && (
          <button
            type="button"
            onClick={() => setRightTab('visualizer')}
            className="px-3 text-[9px] uppercase tracking-wide"
            style={{
              background: rightTab === 'visualizer' ? STUDIO.active : 'transparent',
              color: rightTab === 'visualizer' ? STUDIO.accent : STUDIO.textDim,
              borderBottom: rightTab === 'visualizer' ? `2px solid ${STUDIO.accent}` : 'none',
            }}
          >
            Scope
          </button>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden" style={{ minHeight: 280 }}>
        {rightTab === 'sound' && panels.sound && (
          <div className="min-h-0 flex-1 overflow-auto">
            <SoundPanel
              track={selected}
              bpm={project.bpm}
              fx={project.fx[selected]}
              drums={project.drums}
              wavetable={project.wavetable}
              analog={project.analog}
              brass={project.brass}
              guitar={project.guitar}
              engine={engineRef.current}
              onDrum={onDrum}
              onWavetable={(key: keyof WavetableParams, value) => patchUi(`wt.${key}`, value)}
              onAnalog={(key: keyof AnalogParams, value) => patchUi(`an.${key}`, value)}
              onBrass={(key: keyof WavetableParams, value) => patchUi(`tp.${key}`, value)}
              onGuitar={(key: keyof AnalogParams, value) => patchUi(`rg.${key}`, value)}
              onFx={(key, value) => onFx(selected, key, value)}
              onVocalPreset={selected === 'vox' ? applyVocalPreset : undefined}
              onRecorded={selected === 'vox' ? onVocalRecorded : undefined}
              onStatus={setStatus}
              playing={playing}
              getCurrentBar={() => beatRef.current.bar}
              onEnsurePlaying={ensurePlayingForVocal}
              onPreview={() => engineRef.current?.previewTrack(selected)}
              keysOn={keysOn && keyboardMode === 'piano'}
              octave={octave}
              onOctave={setOctave}
              onNoteOn={(midi) => {
                void engineRef.current?.noteOn(selected, midi, Math.max(0, paintScene - 1));
              }}
              onNoteOff={(midi) => engineRef.current?.noteOff(selected, midi)}
              onOpenRoll={() => setPanels((p) => ({ ...p, pianoroll: true }))}
              onDropClip={dropPatternClip}
            />
          </div>
        )}
        {rightTab === 'livecode' && panels.livecode && (
          <div className="flex min-h-0 flex-1 flex-col" style={{ minHeight: 280 }}>
            <div className="min-h-0 flex-1">
              <LivecodeTerminal
                code={code}
                followLine={followLine}
                followFlash={followFlash}
                onChange={onCodeChange}
                onEval={evalNow}
              />
            </div>
            <div className="flex h-8 shrink-0 border-t" style={{ borderColor: STUDIO.border }}>
              <span className="flex items-center px-2 font-mono text-[10px]" style={{ color: STUDIO.textDim }}>
                ›
              </span>
              <input
                value={repl}
                onChange={(e) => setRepl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    runRepl();
                  }
                }}
                placeholder="launch kick 2 · scene 2 · stop snare · bind q bass.1 · quant bar"
                className="h-full flex-1 bg-transparent font-mono text-[11px] outline-none"
                style={{ color: '#b8e0c8' }}
              />
            </div>
          </div>
        )}
        {rightTab === 'visualizer' && panels.visualizer && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-6 shrink-0 items-center gap-1 border-b px-2" style={{ borderColor: STUDIO.border }}>
              {(['waveform', 'spectrum', 'both'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setVizMode(m)}
                  className="px-2 text-[9px] capitalize"
                  style={{ color: vizMode === m ? STUDIO.accent : STUDIO.textDim }}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1">
              <Visualizer engine={engineRef.current} playing={playing} mode={vizMode} />
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  const mainArea =
    showRight && rightPanel ? (
      <SplitPane
        direction="horizontal"
        ratio={1 - splits.rightWidth}
        onRatioChange={(r) => setSplits((s) => ({ ...s, rightWidth: 1 - r }))}
        minFirst={320}
        minSecond={240}
        first={centerStack}
        second={rightPanel}
      />
    ) : (
      centerStack
    );

  const mixerPanel = panels.mixer ? (
    <PanelDock title={FL.mixer} short="MX" accent={STUDIO.accent} visible className="h-full">
      <Mixer
        project={project}
        selected={selected}
        onSelect={onSelectTrack}
        onGain={(trackId, gain) => patchUi(`${trackId}.gain`, gain)}
        onPan={(trackId, pan) => patchUi(`${trackId}.pan`, pan)}
        onMute={(trackId) => patchUi(`${trackId}.mute`, project.mixer[trackId].mute > 0 ? 0 : 1)}
        onSolo={(trackId) => patchUi(`${trackId}.solo`, project.mixer[trackId].solo > 0 ? 0 : 1)}
      />
    </PanelDock>
  ) : null;

  const workArea = (
    <div className="flex min-h-0 min-w-0 flex-1">
      <StudioNav
        project={project}
        selected={selected}
        onSelectTrack={onSelectTrack}
        onOpenSound={openSound}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {panels.mixer && mixerPanel ? (
          <SplitPane
            direction="vertical"
            ratio={splits.mainHeight}
            onRatioChange={(r) => setSplits((s) => ({ ...s, mainHeight: r }))}
            minFirst={200}
            minSecond={100}
            first={mainArea}
            second={mixerPanel}
          />
        ) : (
          <div className="min-h-0 flex-1">{mainArea}</div>
        )}
      </div>
    </div>
  );

  return (
    <MusicMetaProvider value={musicMeta}>
    <div
      className="fixed bottom-0 left-0 right-0 top-16 z-30 flex flex-col text-[12px]"
      style={{ background: STUDIO.bg, color: STUDIO.text }}
    >
      <StudioTransport
        studioName={activeSong.studioName}
        songs={songs}
        songId={songId}
        currentGenre={project.genre}
        onSongChange={switchSong}
        onSongNew={onSongNew}
        onSongSaveAs={onSongSaveAs}
        onSongDuplicate={onSongDuplicate}
        onSongRename={onSongRename}
        onSongDelete={onSongDelete}
        onSongExport={onSongExport}
        onSongImport={onSongImport}
        onSongResetFactory={resetToFactory}
        playing={playing}
        playMode={project.playMode}
        bpm={project.bpm}
        bpmDraft={bpmDraft}
        looping={looping}
        metronome={metronome}
        keysOn={keysOn}
        keyboardMode={keyboardMode}
        onKeyboardMode={onKeyboardMode}
        snapSteps={snapSteps}
        snapBars={snapBars}
        swing={swing}
        status={`${status} · ${TRACK_LABELS[selected]} · P${paintScene}`}
        parseErrors={parsed.errors.length}
        panels={panels}
        onTogglePlay={togglePlay}
        onPlayMode={setPlayMode}
        onLoop={() => setLooping((v) => !v)}
        onMetronome={() => setMetronome((v) => !v)}
        onKeys={() => setKeysOn((v) => !v)}
        onBpmDraft={setBpmDraft}
        onBpmCommit={(bpm) => patchUi('bpm', bpm)}
        onSnapSteps={setSnapSteps}
        onSnapBars={setSnapBars}
        onSwing={setSwing}
        onGridProfile={applyGridProfile}
        onResetProject={resetToFactory}
        onResetLayout={resetLayout}
        onTogglePanel={togglePanel}
        outputDeviceId={outputDeviceId}
        onOutputDevice={onOutputDevice}
        masterVolume={masterVolume}
        onMasterVolume={onMasterVolume}
      />

      {workArea}
    </div>
    </MusicMetaProvider>
  );
};
