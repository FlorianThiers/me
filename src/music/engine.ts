import {
  arrangementLength,
  clipsAtBar,
  patternContentSteps,
  patternStepForClip,
  songBarCount,
  stepCount,
} from './grid';
import { loadSample, samplesToAudioBuffer } from './audioStore';
import {
  applyFxToBus,
  createReturnBuses,
  createTrackBus,
  type ReturnBusNodes,
  type TrackBusNodes,
} from './fxChain';
import { midiToHz } from './midi';
import {
  clampMasterVolume,
  DEFAULT_MASTER_VOLUME,
  loadMasterVolume,
} from './masterVolume';
import { applySinkId } from './outputDevices';
import { PcmTap } from './pcmTap';
import {
  bridgePlay,
  bridgeStop,
  isUpnpDeviceId,
  rendererIdFromDeviceId,
  waitForLiveAudio,
  waitForStreamClient,
} from './upnpClient';
import type {
  AnalogParams,
  BeatInfo,
  DrumId,
  DrumSound,
  MusicProject,
  SynthEnvelope,
  TrackId,
  WavetableParams,
} from './types';
import { isAudioTrack, isPercRollTrack, DEFAULT_STEPS, STEPS_PER_BAR, STEPS_PER_BEAT, stepDurationSec, TRACK_IDS } from './types';

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12;

type EngineOpts = {
  onBeat: (info: BeatInfo) => void;
  onStop: () => void;
};

type HeldVoice = {
  gain: GainNode;
  oscs: OscillatorNode[];
  release: number;
};

type PercId = Exclude<DrumId, 'bass'>;

function applyAdsrHold(
  gain: GainNode,
  time: number,
  env: SynthEnvelope,
  peak: number,
) {
  const a = Math.max(0.002, env.attack);
  const d = Math.max(0.002, env.decay);
  const s = Math.max(0.0001, Math.min(1, env.sustain)) * peak;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + a);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, s), time + a + d);
}

function applyAdsr(
  gain: GainNode,
  time: number,
  env: SynthEnvelope,
  peak: number,
  total: number,
) {
  const a = Math.max(0.002, env.attack);
  const d = Math.max(0.002, env.decay);
  const s = Math.max(0.0001, Math.min(1, env.sustain)) * peak;
  const r = Math.max(0.005, env.release);
  const sustainEnd = Math.max(a + d + 0.01, total - r);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + a);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, s), time + a + d);
  gain.gain.setValueAtTime(Math.max(0.0001, s), time + sustainEnd);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + total);
}

function applyDrumEnvelope(
  gain: GainNode,
  time: number,
  attack: number,
  decay: number,
  peak: number,
  total: number,
) {
  const a = Math.max(0.001, attack);
  const d = Math.max(0.005, decay);
  const hold = Math.max(0, total - a - d);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + a);
  if (hold > 0.01) {
    gain.gain.setValueAtTime(peak * 0.8, time + a + hold * 0.2);
  }
  gain.gain.exponentialRampToValueAtTime(0.0001, time + total);
}

/** Soft tanh clipper — last defense against digital full-scale spikes. */
function makeSoftClipCurve(samples = 1024): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(samples);
  const k = 1.35;
  const norm = Math.tanh(k);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / (samples - 1) - 1;
    curve[i] = Math.tanh(x * k) / norm;
  }
  return curve;
}

/** Hardtek drive curve — amount 0..1 → soft → aggressive fold. */
function makeDriveCurve(amount: number, samples = 256): Float32Array {
  const curve = new Float32Array(samples);
  const k = 2 + Math.max(0, Math.min(1, amount)) * 48;
  for (let i = 0; i < samples; i += 1) {
    const x = (i * 2) / (samples - 1) - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  /** Brickwall-ish peak catcher before Phantom / speakers. */
  private safetyLimiter: DynamicsCompressorNode | null = null;
  private softClip: WaveShaperNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timer: number | null = null;
  private nextNoteTime = 0;
  private beat = 0;
  private globalBeat = 0;
  private playing = false;
  private looping = true;
  private metronome = false;
  private swing = 0;
  private project: MusicProject;
  private opts: EngineOpts;
  private held = new Map<string, HeldVoice>();
  private trackBuses: Partial<Record<TrackId, TrackBusNodes>> = {};
  private returns: ReturnBusNodes | null = null;
  /** Per-note pan (and future artic) active while a voice renders. */
  private notePan: number | null = null;
  private scheduledAudio: AudioBufferSourceNode[] = [];
  private busesReady = false;
  /** '' = browser default. `upnp:…` = bridge. */
  private outputDeviceId = '';
  private masterVolume = loadMasterVolume();
  private pcmTap: PcmTap | null = null;
  /** When casting to Phantom, mute local speakers to avoid double audio. */
  private localMute: GainNode | null = null;
  /** Pattern-mode override (UI paint scene). null → project.scene */
  private sessionScene: number | null = null;

  constructor(project: MusicProject, opts: EngineOpts) {
    this.project = project;
    this.opts = opts;
  }

  getOutputDeviceId() {
    return this.outputDeviceId;
  }

  /** Which pattern # plays in Pattern (session) mode. */
  setSessionScene(scene: number | null) {
    this.sessionScene = scene !== null && scene > 0 ? Math.round(scene) : null;
  }

  /** Remember sink for next ensureContext / start (no AudioContext yet). */
  preferOutputDevice(deviceId: string) {
    this.outputDeviceId = deviceId;
  }

  preferMasterVolume(volume: number) {
    this.masterVolume = clampMasterVolume(volume);
  }

  getMasterVolume() {
    return this.masterVolume;
  }

  /** Master fader (0…MAX). Affects local speakers and Phantom PCM tap. */
  setMasterVolume(volume: number) {
    this.masterVolume = clampMasterVolume(volume);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.02);
    }
  }

  /** Route master to a local sink or UPnP bridge (Devialet). */
  async setOutputDevice(deviceId: string) {
    const prev = this.outputDeviceId;
    this.outputDeviceId = deviceId;
    const ctx = await this.ensureContext();

    if (isUpnpDeviceId(prev) && !isUpnpDeviceId(deviceId)) {
      await this.stopUpnpCast();
    }

    if (isUpnpDeviceId(deviceId)) {
      this.setLocalMuted(true);
      // Do NOT start PCM here — filling the ring before Phantom pulls = multi-bar delay.
      if (this.playing) {
        await this.startUpnpCast(rendererIdFromDeviceId(deviceId) || '');
      }
      return;
    }

    this.setLocalMuted(false);
    await applySinkId(ctx, deviceId);
  }

  private setLocalMuted(muted: boolean) {
    if (!this.localMute || !this.ctx) return;
    this.localMute.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
  }

  private async startUpnpCast(rendererId: string) {
    const ctx = await this.ensureContext();
    if (!this.analyser) throw new Error('audio graph not ready');

    this.setLocalMuted(true);

    // 1) Tell Phantom to pull  2) wait until HTTP GET is live  3) wait out silence-prime
    // 4) then feed PCM + start sequencer — otherwise playhead runs 12s ahead of speakers.
    await bridgePlay(rendererId || undefined);
    const ready = await waitForStreamClient(12000);
    if (!ready) {
      console.warn('[music] Phantom stream client not seen — cast may be silent/late');
    } else {
      const live = await waitForLiveAudio(20000);
      if (!live) console.warn('[music] live-audio gate timed out — starting anyway');
    }

    if (!this.pcmTap) this.pcmTap = new PcmTap(ctx, this.analyser);
    if (!this.pcmTap.connected) await this.pcmTap.start();
    await new Promise((r) => setTimeout(r, 80));
  }

  /**
   * Tear down Web Audio / PCM tap without stopping the Phantom stream.
   * Used when replacing the engine on Play — otherwise a late bridgeStop
   * cancels the cast we just started.
   */
  async disposeLocal() {
    this.stop();
    this.pcmTap?.stop();
    this.pcmTap = null;
    try {
      await this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
  }

  private async stopUpnpCast() {
    this.pcmTap?.stop();
    this.pcmTap = null;
    await bridgeStop();
    this.setLocalMuted(false);
  }

  setProject(project: MusicProject) {
    this.project = project;
    this.syncTrackBuses();
    // Sync send delay to ~1/8 note so FX lock to tempo
    if (this.returns) {
      const eighth = 60 / Math.max(40, project.bpm) / 2;
      this.returns.delay.delayTime.value = Math.min(1.5, Math.max(0.08, eighth));
      const g = project.genre;
      this.returns.delayFb.gain.value =
        g === 'tekno' ? 0.42 : g === 'punk' ? 0.28 : g === 'classical' ? 0.4 : 0.35;
      this.returns.reverbGain.gain.value =
        g === 'classical' ? 0.82 : g === 'punk' ? 0.32 : g === 'tekno' ? 0.48 : 0.62;
      this.returns.delayGain.gain.value =
        g === 'classical' ? 0.38 : g === 'punk' ? 0.28 : g === 'tekno' ? 0.5 : 0.45;
    }
  }

  setLooping(looping: boolean) {
    this.looping = looping;
  }

  setMetronome(enabled: boolean) {
    this.metronome = enabled;
  }

  setSwing(amount: number) {
    this.swing = Math.max(0, Math.min(0.45, amount));
  }

  isPlaying() {
    return this.playing;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getContext(): AudioContext | null {
    return this.ctx;
  }

  async ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      // Glue bus
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      // Safety brickwall — catches nasty peaks before Phantom / speakers
      this.safetyLimiter = this.ctx.createDynamicsCompressor();
      this.safetyLimiter.threshold.setValueAtTime(-8, this.ctx.currentTime);
      this.safetyLimiter.knee.setValueAtTime(0, this.ctx.currentTime);
      this.safetyLimiter.ratio.setValueAtTime(20, this.ctx.currentTime);
      this.safetyLimiter.attack.setValueAtTime(0.001, this.ctx.currentTime);
      this.safetyLimiter.release.setValueAtTime(0.12, this.ctx.currentTime);

      this.softClip = this.ctx.createWaveShaper();
      this.softClip.curve = makeSoftClipCurve();
      this.softClip.oversample = '2x';

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.masterVolume || DEFAULT_MASTER_VOLUME,
        this.ctx.currentTime,
      );

      // master → glue → safety → soft-clip → analyser → (localMute | pcmTap)
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.safetyLimiter);
      this.safetyLimiter.connect(this.softClip);
      this.softClip.connect(this.analyser);

      this.localMute = this.ctx.createGain();
      this.localMute.gain.setValueAtTime(1, this.ctx.currentTime);
      this.analyser.connect(this.localMute);
      this.localMute.connect(this.ctx.destination);

      this.returns = createReturnBuses(this.ctx, this.masterGain);
      for (const id of TRACK_IDS) {
        this.trackBuses[id] = createTrackBus(this.ctx, this.masterGain, this.returns);
      }
      this.busesReady = true;
      this.syncTrackBuses();

      if (this.outputDeviceId && !isUpnpDeviceId(this.outputDeviceId)) {
        try {
          await applySinkId(this.ctx, this.outputDeviceId);
        } catch {
          this.outputDeviceId = '';
        }
      }
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    return this.ctx;
  }

  private getMaster(): AudioNode {
    return this.masterGain ?? this.ctx!.destination;
  }

  getVoxInput(): GainNode | null {
    return this.trackBuses.vox?.input ?? null;
  }

  private syncTrackBuses() {
    if (!this.busesReady) return;
    const anySolo = TRACK_IDS.some((id) => this.project.mixer[id].solo > 0);
    for (const id of TRACK_IDS) {
      const bus = this.trackBuses[id];
      if (!bus) continue;
      const mix = this.project.mixer[id];
      const muted = mix.mute > 0 || (anySolo && mix.solo <= 0);
      applyFxToBus(bus, this.project.fx[id], mix.gain, muted, mix.pan ?? 0);
    }
  }

  private trackOut(id: TrackId): AudioNode {
    const bus = this.trackBuses[id]?.input ?? this.getMaster();
    const pan = this.notePan;
    if (pan == null || Math.abs(pan) < 0.001 || !this.ctx) return bus;
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    panner.connect(bus);
    return panner;
  }

  async previewTrack(id: TrackId) {
    if (isAudioTrack(id)) return;
    const ctx = await this.ensureContext();
    const sceneIdx = Math.max(0, this.project.scene - 1);
    const gain = Math.max(0, Math.min(1, this.project.mixer[id].gain));
    this.trigger(id, ctx.currentTime + 0.02, gain, sceneIdx);
  }

  async previewNote(id: TrackId, midi: number, sceneIdx?: number) {
    if (isAudioTrack(id)) return;
    const ctx = await this.ensureContext();
    const scene = sceneIdx ?? Math.max(0, this.project.scene - 1);
    const gain = Math.max(0, Math.min(1, this.project.mixer[id].gain));
    this.trigger(id, ctx.currentTime + 0.01, gain, scene, midi);
  }

  async noteOn(id: TrackId, midi: number, sceneIdx?: number) {
    if (isAudioTrack(id)) return;
    const key = `${id}:${midi}`;
    if (this.held.has(key)) return;
    const ctx = await this.ensureContext();
    const scene = sceneIdx ?? Math.max(0, this.project.scene - 1);
    const mixGain = Math.max(0, Math.min(1, this.project.mixer[id].gain));
    const time = ctx.currentTime;
    this.notePan = null;
    // One-shots: same voice as the sequencer
    if (id === 'kick' || id === 'snare' || id === 'hihat' || id === 'mc') {
      this.voicePerc(id, time, mixGain, scene);
      return;
    }
    const hold = this.dispatchMelodic(id, time, mixGain, scene, midi, undefined, true);
    if (hold) this.held.set(key, hold);
  }

  noteOff(id: TrackId, midi: number) {
    const key = `${id}:${midi}`;
    const held = this.held.get(key);
    if (!held || !this.ctx) return;
    const t = this.ctx.currentTime;
    const rel = Math.max(0.04, held.release);
    held.gain.gain.cancelScheduledValues(t);
    held.gain.gain.setValueAtTime(Math.max(0.0001, held.gain.gain.value), t);
    held.gain.gain.exponentialRampToValueAtTime(0.0001, t + rel);
    for (const osc of held.oscs) {
      try {
        osc.stop(t + rel + 0.04);
      } catch {
        /* already stopped */
      }
    }
    this.held.delete(key);
  }

  async start() {
    const ctx = await this.ensureContext();
    this.clearScheduledAudio();
    this.playing = true;
    this.beat = 0;
    this.globalBeat = 0;
    this.nextNoteTime = ctx.currentTime + 0.05;

    // Mute laptop before any notes when casting — Soft-fail must not leave speakers loud.
    if (isUpnpDeviceId(this.outputDeviceId)) {
      this.setLocalMuted(true);
      try {
        await this.startUpnpCast(rendererIdFromDeviceId(this.outputDeviceId));
      } catch (e) {
        // Keep muted so we don't blast laptop; surface to UI via throw
        console.warn('[music] UPnP cast failed', e);
        throw e instanceof Error ? e : new Error(String(e));
      }
    }

    if (this.project.playMode === 'arr') {
      this.scheduleAudioClips(ctx.currentTime + 0.05);
    }
    this.scheduler();
  }

  stop() {
    this.playing = false;
    this.clearScheduledAudio();
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    // Release any held keyboard voices
    for (const [key, voice] of this.held) {
      const t = this.ctx?.currentTime ?? 0;
      try {
        voice.gain.gain.cancelScheduledValues(t);
        voice.gain.gain.setValueAtTime(0.0001, t);
        for (const osc of voice.oscs) osc.stop(t + 0.02);
      } catch {
        /* ignore */
      }
      this.held.delete(key);
    }
    this.opts.onBeat({ step: 0, patternStep: 0, bar: 0, scene: this.project.scene });
    // Keep UPnP session alive across stop/play; cleared in setOutputDevice / dispose.
    this.opts.onStop();
  }

  /** Full teardown (workspace unmount / engine replace). */
  async dispose() {
    this.stop();
    await this.stopUpnpCast();
    try {
      await this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
  }

  private clearScheduledAudio() {
    for (const src of this.scheduledAudio) {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    }
    this.scheduledAudio = [];
  }

  private scheduleAudioClips(startTime: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const stepDur = stepDurationSec(this.project.bpm);
    const barDur = stepDur * STEPS_PER_BAR;
    const clips = (this.project.audioClips ?? []).filter((c) => c.active > 0);
    for (const clip of clips) {
      const samples = loadSample(clip.sampleId);
      if (!samples) continue;
      const buffer = samplesToAudioBuffer(ctx, samples);
      const maxDur = clip.length * barDur;
      const playDur = Math.min(buffer.duration, maxDur);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.trackOut('vox'));
      const when = startTime + clip.start * barDur;
      source.start(when, 0, playDur);
      this.scheduledAudio.push(source);
    }
  }

  private stepsInLoop() {
    // Pattern mode: loop length = longest row in the active paint/launch scene
    // (not global max across every empty P3…P16 slot).
    const sceneIdx = Math.max(
      0,
      (this.sessionScene !== null ? this.sessionScene : this.project.scene) - 1,
    );
    let max = DEFAULT_STEPS;
    for (const id of TRACK_IDS) {
      if (isAudioTrack(id)) continue;
      max = Math.max(max, patternContentSteps(this.project, id, sceneIdx));
    }
    return max;
  }

  private songLengthSteps() {
    const project = this.project;
    if ((project.clips?.length ?? 0) > 0) {
      return songBarCount(project) * STEPS_PER_BAR;
    }
    // Legacy per-track arrangement: one cell = one full pattern pass.
    return arrangementLength(project) * stepCount(project);
  }

  private scheduler = () => {
    if (!this.playing || !this.ctx) return;
    const ctx = this.ctx;
    const patternLen = this.stepsInLoop();
    const clipMode = (this.project.clips?.length ?? 0) > 0;
    const songSteps = this.songLengthSteps();
    while (this.nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
      const song = this.project.playMode === 'arr';
      // Clip playlist: fixed 4/4 bars. Legacy arr: bar = full pattern length.
      const barDiv = song && clipMode ? STEPS_PER_BAR : patternLen;
      const bar = song ? Math.floor(this.globalBeat / barDiv) : 0;
      const stepInBar = song ? this.globalBeat % barDiv : this.beat;
      const scene = song ? 0 : this.project.scene;
      const stepDur = stepDurationSec(this.project.bpm);
      const swingOffset = stepInBar % 2 === 1 ? stepDur * this.swing * 0.5 : 0;
      const eventTime = this.nextNoteTime + swingOffset;
      if (this.metronome) {
        const onBeat = stepInBar % STEPS_PER_BEAT === 0;
        const accent = stepInBar === 0;
        if (onBeat) this.playMetronomeClick(eventTime, accent);
      }
      this.scheduleBeat(stepInBar, eventTime, song ? bar : undefined);
      let patternStep = stepInBar;
      if (song && clipMode) {
        const active = clipsAtBar(this.project, bar);
        if (active.length > 0) {
          const ref = active[0];
          const rowLen = patternContentSteps(this.project, ref.track, ref.pattern - 1);
          patternStep =
            patternStepForClip(ref, bar, stepInBar, rowLen, this.project.clipWrap !== false) ?? stepInBar;
        }
      } else if (!song) {
        patternStep = this.beat;
      }
      this.opts.onBeat({ step: stepInBar, patternStep, bar, scene });
      this.nextNoteTime += stepDur;
      if (song) {
        this.globalBeat += 1;
        if (this.globalBeat >= songSteps) {
          if (!this.looping) {
            this.stop();
            return;
          }
          this.globalBeat = 0;
          // Re-arm one-shot audio takes for the next pass
          this.clearScheduledAudio();
          this.scheduleAudioClips(this.nextNoteTime);
        }
      } else {
        this.beat = (this.beat + 1) % patternLen;
        if (this.beat === 0 && !this.looping) {
          this.stop();
          return;
        }
      }
    }
    this.timer = window.setTimeout(this.scheduler, LOOKAHEAD_MS);
  };

  private scheduleBeat(stepInBar: number, time: number, arrBar?: number) {
    const project = this.project;
    const anySolo = TRACK_IDS.some((id) => project.mixer[id].solo > 0);
    const clipMode = (project.clips?.length ?? 0) > 0;

    if (arrBar !== undefined && clipMode) {
      const active = clipsAtBar(project, arrBar);
      if (active.length === 0) return;

      const fired = new Set<string>();
      for (const clip of active) {
        const id = clip.track;
        if (isAudioTrack(id)) continue;
        const mix = project.mixer[id];
        if (mix.mute > 0) continue;
        if (anySolo && mix.solo <= 0) continue;
        const sceneIdx = clip.pattern - 1;
        const rowLen = patternContentSteps(project, id, sceneIdx);
        const patternStep = patternStepForClip(clip, arrBar, stepInBar, rowLen, project.clipWrap !== false);
        if (patternStep == null) continue;
        const key = `${id}:${sceneIdx}:${patternStep}`;
        if (fired.has(key)) continue;
        fired.add(key);
        const gain = Math.max(0, Math.min(1, mix.gain));
        this.fireChannel(id, patternStep, time, gain, sceneIdx);
      }
      return;
    }

    for (const id of TRACK_IDS) {
      if (isAudioTrack(id)) continue;
      const mix = project.mixer[id];
      if (mix.mute > 0) continue;
      if (anySolo && mix.solo <= 0) continue;
      const gain = Math.max(0, Math.min(1, mix.gain));

      if (arrBar === undefined) {
        const scene =
          this.sessionScene !== null ? this.sessionScene : project.scene;
        this.fireChannel(id, stepInBar, time, gain, Math.max(0, scene - 1));
        continue;
      }

      // Legacy arrangement: one cell plays the full pattern from step 0.
      const scenePick = project.arrangement[id][arrBar] ?? 0;
      if (scenePick <= 0) continue;
      this.fireChannel(id, stepInBar, time, gain, scenePick - 1);
    }
  }

  private playMetronomeClick(time: number, accent: boolean) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(accent ? 1800 : 1300, time);
    gain.gain.setValueAtTime(accent ? 0.16 : 0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(time);
    osc.stop(time + 0.04);
  }

  private fireChannel(id: TrackId, beat: number, time: number, gain: number, sceneIdx: number) {
    const loopLen = patternContentSteps(this.project, id, sceneIdx);
    const step = ((Math.round(beat) % loopLen) + loopLen) % loopLen;
    const notes = this.project.notes?.[id]?.[sceneIdx] ?? [];
    if (notes.length > 0) {
      for (const note of notes) {
        if (Math.round(note.start) === step) {
          this.trigger(id, time, gain, sceneIdx, note.pitch, note.length, {
            vel: note.vel,
            pan: note.pan,
          });
        }
      }
      return;
    }
    const row = this.project.patterns[id][sceneIdx];
    if (row?.[step]) this.trigger(id, time, gain, sceneIdx);
  }

  private humanize(time: number, gain: number, id: TrackId): { time: number; gain: number } {
    const g = this.project.genre;
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

  private trigger(
    id: TrackId,
    time: number,
    gain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    artic?: { vel?: number; pan?: number },
  ) {
    if (isAudioTrack(id)) return;
    const vel = artic?.vel != null ? Math.max(0.05, Math.min(1, artic.vel)) : 1;
    this.notePan = artic?.pan ?? null;
    try {
      const h = this.humanize(time, gain * vel, id);
      if (id === 'kick' || id === 'snare' || id === 'hihat' || id === 'mc') {
        this.voicePerc(id as PercId, h.time, h.gain, sceneIdx);
        return;
      }
      this.dispatchMelodic(id, h.time, h.gain, sceneIdx, midi, lengthSteps, false);
    } finally {
      this.notePan = null;
    }
  }

  /** Route melodic/bass tracks by voice pack. */
  private dispatchMelodic(
    id: TrackId,
    time: number,
    gain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    hold = false,
  ): HeldVoice | void {
    const g = this.project.genre;
    if (g === 'tekno') {
      if (id === 'wt') return this.voiceMentasm(time, gain, sceneIdx, midi, lengthSteps, hold);
      if (id === 'tp') return this.voiceScreech(time, gain, sceneIdx, midi, lengthSteps, hold);
      if (id === 'an') {
        this.voiceTeknoStab(time, gain, sceneIdx, midi, lengthSteps);
        return;
      }
      if (id === 'rg') {
        this.voiceLaser(time, gain, sceneIdx, midi, lengthSteps);
        return;
      }
      if (id === 'bass') {
        this.voiceAcidBass(time, gain, sceneIdx, midi, lengthSteps);
        return;
      }
      return;
    }
    if (g === 'punk') {
      if (id === 'wt') return this.voicePowerChord(time, gain, sceneIdx, midi, lengthSteps, hold);
      if (id === 'tp') return this.voicePunkLead(time, gain, sceneIdx, midi, lengthSteps, hold);
      if (id === 'an') {
        this.voicePalmMute(time, gain, sceneIdx, midi, lengthSteps);
        return;
      }
      if (id === 'rg') {
        this.voiceOctaveFill(time, gain, sceneIdx, midi, lengthSteps);
        return;
      }
      if (id === 'bass') {
        this.voicePunkBass(time, gain, sceneIdx, midi, lengthSteps);
        return;
      }
      return;
    }
    if (g === 'classical') {
      if (id === 'wt') return this.voiceGrandPiano(time, gain, sceneIdx, midi, lengthSteps, hold);
      if (id === 'tp') return this.voiceClarinet(time, gain, sceneIdx, midi, lengthSteps, hold);
      if (id === 'an') return this.voiceViolin(time, gain, sceneIdx, midi, lengthSteps, hold);
      if (id === 'rg') {
        this.voiceHarp(time, gain, sceneIdx, midi, lengthSteps);
        return;
      }
      if (id === 'bass') {
        this.voiceCelloBass(time, gain, sceneIdx, midi, lengthSteps);
        return;
      }
      return;
    }
    // cumbia default
    if (id === 'wt') return this.voiceAcordeon(time, gain, sceneIdx, midi, lengthSteps, hold);
    if (id === 'tp') return this.voiceTrompeta(time, gain, sceneIdx, midi, lengthSteps, hold);
    if (id === 'an') {
      this.voiceBajoSexto(time, gain, sceneIdx, midi, lengthSteps);
      return;
    }
    if (id === 'rg') {
      this.voiceRequinto(time, gain, sceneIdx, midi, lengthSteps);
      return;
    }
    if (id === 'bass') {
      this.voiceContrabajo(time, gain, sceneIdx, midi, lengthSteps);
    }
  }

  private resolveDrum(id: DrumId, sceneIdx: number): DrumSound {
    const base = this.project.drums[id];
    const ov = this.project.sceneOverrides[sceneIdx]?.drums[id];
    if (!ov) return base;
    return { ...base, ...ov };
  }

  private resolveWavetable(sceneIdx: number): WavetableParams {
    const base = this.project.wavetable;
    const ov = this.project.sceneOverrides[sceneIdx]?.wavetable;
    if (!ov || Object.keys(ov).length === 0) return base;
    return { ...base, ...ov };
  }

  private resolveAnalog(sceneIdx: number): AnalogParams {
    const base = this.project.analog;
    const ov = this.project.sceneOverrides[sceneIdx]?.analog;
    if (!ov || Object.keys(ov).length === 0) return base;
    return { ...base, ...ov };
  }

  private resolveBrass(sceneIdx: number): WavetableParams {
    const base = this.project.brass;
    const ov = this.project.sceneOverrides[sceneIdx]?.brass;
    if (!ov || Object.keys(ov).length === 0) return base;
    return { ...base, ...ov };
  }

  private resolveGuitar(sceneIdx: number): AnalogParams {
    const base = this.project.guitar;
    const ov = this.project.sceneOverrides[sceneIdx]?.guitar;
    if (!ov || Object.keys(ov).length === 0) return base;
    return { ...base, ...ov };
  }

  private voicePerc(id: PercId, time: number, mixGain: number, sceneIdx: number) {
    const g = this.project.genre;
    if (g === 'tekno') {
      switch (id) {
        case 'kick':
          this.voiceHardKick(time, mixGain, sceneIdx);
          break;
        case 'snare':
          this.voiceClap(time, mixGain, sceneIdx);
          break;
        case 'hihat':
          this.voiceClosedHat(time, mixGain, sceneIdx);
          break;
        case 'mc':
          this.voiceMetalOpen(time, mixGain, sceneIdx);
          break;
      }
      return;
    }
    if (g === 'punk') {
      switch (id) {
        case 'kick':
          this.voicePunkKick(time, mixGain, sceneIdx);
          break;
        case 'snare':
          this.voicePunkSnare(time, mixGain, sceneIdx);
          break;
        case 'hihat':
          this.voicePunkHat(time, mixGain, sceneIdx);
          break;
        case 'mc':
          this.voicePunkCrash(time, mixGain, sceneIdx);
          break;
      }
      return;
    }
    if (g === 'classical') {
      switch (id) {
        case 'kick':
          this.voiceTimpani(time, mixGain, sceneIdx);
          break;
        case 'snare':
          this.voiceWoodblock(time, mixGain, sceneIdx);
          break;
        case 'hihat':
          this.voiceTriangle(time, mixGain, sceneIdx);
          break;
        case 'mc':
          this.voiceSoftCymbal(time, mixGain, sceneIdx);
          break;
      }
      return;
    }
    switch (id) {
      case 'kick':
        this.voiceCajon(time, mixGain, sceneIdx);
        break;
      case 'snare':
        this.voiceTimbal(time, mixGain, sceneIdx);
        break;
      case 'hihat':
        this.voiceGuiro(time, mixGain, sceneIdx);
        break;
      case 'mc':
        this.voiceMaracas(time, mixGain, sceneIdx);
        break;
    }
  }

  /** CajÃ³n â€” houten doos + slap, geen 808-boom. */
  private voiceCajon(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('kick', sceneIdx);
    const total = Math.max(0.1, d.dur);
    const master = this.trackOut('kick');
    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, d.decay, 0.34 * mixGain, total);
    out.connect(master);

    const body = ctx.createOscillator();
    body.type = 'sine';
    const f0 = Math.max(55, d.freq + d.pitch);
    body.frequency.setValueAtTime(f0, time);
    body.frequency.exponentialRampToValueAtTime(Math.max(38, d.freq * 0.5), time + 0.09);
    const bodyG = ctx.createGain();
    bodyG.gain.setValueAtTime(0.9, time);
    body.connect(bodyG);
    bodyG.connect(out);

    const slap = ctx.createOscillator();
    slap.type = 'triangle';
    slap.frequency.setValueAtTime(240, time);
    slap.frequency.exponentialRampToValueAtTime(85, time + 0.028);
    const slapG = ctx.createGain();
    slapG.gain.setValueAtTime(0.42, time);
    slapG.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    slap.connect(slapG);
    slapG.connect(out);

    this.burstNoise(ctx, time, 0.022, 900, 1.8, 0.18 * mixGain * (0.5 + d.noise), out);

    body.start(time);
    body.stop(time + total + 0.02);
    slap.start(time);
    slap.stop(time + 0.05);
  }

  /** Timbal â€” schel + rim, Colombiaanse backbeat. */
  private voiceTimbal(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('snare', sceneIdx);
    const total = Math.max(0.06, d.dur);
    const master = this.trackOut('snare');
    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, d.decay, 0.28 * mixGain, total);
    out.connect(master);

    const shell = ctx.createOscillator();
    shell.type = 'sine';
    shell.frequency.setValueAtTime(Math.max(180, d.freq + d.pitch), time);
    shell.frequency.exponentialRampToValueAtTime(Math.max(90, d.freq * 0.65), time + 0.06);
    const shellG = ctx.createGain();
    shellG.gain.setValueAtTime(0.55, time);
    shell.connect(shellG);
    shellG.connect(out);

    const ring = ctx.createOscillator();
    ring.type = 'triangle';
    ring.frequency.setValueAtTime(820, time);
    const ringG = ctx.createGain();
    ringG.gain.setValueAtTime(0.22, time);
    ringG.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
    ring.connect(ringG);
    ringG.connect(out);

    this.burstNoise(ctx, time, total * 0.75, 1400, 2.2, 0.38 * mixGain * d.noise, out, 'bandpass');

    shell.start(time);
    shell.stop(time + total + 0.02);
    ring.start(time);
    ring.stop(time + 0.06);
  }

  /** GÃ¼iro â€” geschuurde ritmische textuur. */
  private voiceGuiro(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('hihat', sceneIdx);
    const total = Math.max(0.04, d.dur);
    const master = this.trackOut('hihat');
    const scrapes = 7;
    for (let s = 0; s < scrapes; s += 1) {
      const t0 = time + s * 0.0028;
      const len = Math.ceil(ctx.sampleRate * total * 0.42);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i += 1) {
        const env = 1 - i / len;
        data[i] = (Math.random() * 2 - 1) * env * env * env;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.setValueAtTime(1800 + s * 420 + d.filter * 0.15, t0);
      bpf.Q.setValueAtTime(1.2 + s * 0.08, t0);
      const g = ctx.createGain();
      const peak = 0.11 * mixGain * d.noise * (0.55 + s * 0.07);
      g.gain.setValueAtTime(peak, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + total * 0.65);
      noise.connect(bpf);
      bpf.connect(g);
      g.connect(master);
      noise.start(t0);
      noise.stop(t0 + total);
    }
  }

  /** Maracas â€” korrelige shaker-burst. */
  private voiceMaracas(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('mc', sceneIdx);
    const total = Math.max(0.03, d.dur);
    const master = this.trackOut('mc');
    const grains = 8;
    for (let g = 0; g < grains; g += 1) {
      const t0 = time + g * 0.0016 + Math.random() * 0.001;
      const len = Math.ceil(ctx.sampleRate * 0.018);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.setValueAtTime(2200 + g * 180, t0);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09 * mixGain * d.noise * (0.7 + Math.random() * 0.35), t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.022);
      noise.connect(hpf);
      hpf.connect(gain);
      gain.connect(master);
      noise.start(t0);
      noise.stop(t0 + 0.03);
    }
    void total;
  }

  /** Contrabajo â€” pizzicato bas met hout-klik. */
  private voiceContrabajo(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('bass', sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.12, lengthSteps * stepDur * 0.92)
        : Math.max(0.14, d.dur);
    const master = this.trackOut('bass');
    const hz = midi != null ? midiToHz(midi) : Math.max(32, d.freq);

    const out = ctx.createGain();
    out.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(80, d.filter) * 2.2, time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(60, d.filter), time + 0.06);
    filter.frequency.exponentialRampToValueAtTime(Math.max(45, d.filter * 0.7), time + total * 0.85);
    filter.Q.setValueAtTime(0.9, time);
    filter.connect(out);

    applyDrumEnvelope(out, time, 0.004, Math.min(d.decay, total * 0.35), 0.3 * mixGain, total);

    this.burstNoise(ctx, time, 0.012, 600, 1.4, 0.14 * mixGain, filter);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(hz * 1.015, time);
    osc.frequency.exponentialRampToValueAtTime(hz, time + 0.025);
    const oscG = ctx.createGain();
    oscG.gain.setValueAtTime(0.75, time);
    osc.connect(oscG);
    oscG.connect(filter);

    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(hz * 0.5, time);
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(0.35, time);
    sub.connect(subG);
    subG.connect(filter);

    osc.start(time);
    osc.stop(time + total + 0.02);
    sub.start(time);
    sub.stop(time + total + 0.02);
  }

  private burstNoise(
    ctx: AudioContext,
    time: number,
    duration: number,
    centerHz: number,
    q: number,
    peak: number,
    dest: AudioNode,
    type: BiquadFilterType = 'bandpass',
  ) {
    const len = Math.ceil(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.setValueAtTime(centerHz, time);
    filt.Q.setValueAtTime(q, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.9);
    noise.connect(filt);
    filt.connect(g);
    g.connect(dest);
    noise.start(time);
    noise.stop(time + duration);
  }

  /** Acordeón — rieten + tremolo, geen generieke synth-pad. */
  private voiceAcordeon(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    hold = false,
  ): HeldVoice | void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveWavetable(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.1, lengthSteps * stepDur + p.release)
        : p.attack + p.decay + 0.15 + p.release;
    const master = this.trackOut('wt');
    const hz = midi != null ? midiToHz(midi) : p.pitch;
    const voices = Math.max(2, Math.min(4, Math.round(p.unison)));

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const fBase = Math.max(120, p.cutoff);
    filter.frequency.setValueAtTime(fBase * (1 + p.filterEnv * 1.8), time);
    filter.frequency.exponentialRampToValueAtTime(fBase, time + p.attack + p.decay);
    filter.Q.setValueAtTime(0.4 + p.res * 5, time);

    const out = ctx.createGain();
    const peak = (0.11 * p.amp * mixGain) / Math.sqrt(voices);
    if (hold) applyAdsrHold(out, time, p, peak);
    else applyAdsr(out, time, p, peak, total);

    const tremGain = ctx.createGain();
    tremGain.gain.setValueAtTime(0.82, time);
    filter.connect(tremGain);
    tremGain.connect(out);
    out.connect(master);

    const oscs: OscillatorNode[] = [];
    const trem = ctx.createOscillator();
    trem.type = 'sine';
    trem.frequency.setValueAtTime(6.2 + p.lfoRate * 0.15, time);
    const tremDepth = ctx.createGain();
    tremDepth.gain.setValueAtTime(0.18 + p.lfoDepth * 0.35, time);
    trem.connect(tremDepth);
    tremDepth.connect(tremGain.gain);
    trem.start(time);
    if (!hold) trem.stop(time + total + 0.02);
    oscs.push(trem);

    for (let i = 0; i < voices; i += 1) {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'square' : 'triangle';
      const det = (i - (voices - 1) / 2) * 11;
      osc.frequency.setValueAtTime(hz, time);
      osc.detune.setValueAtTime(det, time);
      const reed = ctx.createGain();
      reed.gain.setValueAtTime(i === 0 ? 0.55 : 0.38, time);
      osc.connect(reed);
      reed.connect(filter);
      osc.start(time);
      if (!hold) osc.stop(time + total + 0.02);
      oscs.push(osc);

      if (midi != null) {
        const vib = ctx.createOscillator();
        vib.type = 'sine';
        vib.frequency.setValueAtTime(5.8, time);
        const vibG = ctx.createGain();
        vibG.gain.setValueAtTime(6, time);
        vib.connect(vibG);
        vibG.connect(osc.detune);
        vib.start(time);
        if (!hold) vib.stop(time + total + 0.02);
        oscs.push(vib);
      }
    }

    this.burstNoise(ctx, time, 0.035, 400, 0.8, 0.012 * mixGain, filter, 'highpass');
    if (hold) return { gain: out, oscs, release: p.release };
  }

  /** Bajo sexto â€” getokkelde nylon snaar. */
  private voiceBajoSexto(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    this.voicePluckedString('an', time, mixGain, sceneIdx, midi, lengthSteps, {
      brightness: 1.1,
      pluckMs: 0.008,
      bodyHz: 180,
    });
  }

  /** Requinto â€” heldere lead-gitaar. */
  private voiceRequinto(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    this.voicePluckedString('rg', time, mixGain, sceneIdx, midi, lengthSteps, {
      brightness: 1.55,
      pluckMs: 0.004,
      bodyHz: 320,
    });
  }

  private voicePluckedString(
    id: 'an' | 'rg',
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi: number | undefined,
    lengthSteps: number | undefined,
    opts: { brightness: number; pluckMs: number; bodyHz: number },
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = id === 'rg' ? this.resolveGuitar(sceneIdx) : this.resolveAnalog(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.06, lengthSteps * stepDur + p.release * 0.85)
        : p.attack + p.decay + p.release;
    const master = this.trackOut(id);
    const hz = midi != null ? midiToHz(midi) : p.pitch;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const fBase = Math.max(80, p.cutoff * opts.brightness);
    filter.frequency.setValueAtTime(fBase * (1 + p.filterEnv * 3), time);
    filter.frequency.exponentialRampToValueAtTime(fBase * 0.35, time + 0.05);
    filter.frequency.exponentialRampToValueAtTime(fBase * 0.2, time + total * 0.7);
    filter.Q.setValueAtTime(0.5 + p.res * 4, time);

    const out = ctx.createGain();
    const peak = 0.1 * p.amp * mixGain;
    applyAdsr(out, time, { ...p, sustain: p.sustain * 0.65 }, peak, total);
    filter.connect(out);
    out.connect(master);

    this.burstNoise(ctx, time, opts.pluckMs, opts.bodyHz, 1.2, 0.16 * mixGain, filter);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(hz * 1.03, time);
    osc.frequency.exponentialRampToValueAtTime(hz, time + 0.018);
    osc.connect(filter);
    osc.start(time);
    osc.stop(time + total + 0.02);
  }

  /** Trompeta — brass met scoop + harmonischen. */
  private voiceTrompeta(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    hold = false,
  ): HeldVoice | void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveBrass(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.08, lengthSteps * stepDur + p.release)
        : p.attack + p.decay + 0.12 + p.release;
    const master = this.trackOut('tp');
    const hz = midi != null ? midiToHz(midi) : p.pitch;
    const voices = Math.max(1, Math.min(3, Math.round(p.unison)));

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const fBase = Math.max(200, p.cutoff);
    filter.frequency.setValueAtTime(fBase * (1 + p.filterEnv * 2.5), time);
    filter.frequency.exponentialRampToValueAtTime(fBase, time + p.attack + p.decay);
    filter.Q.setValueAtTime(0.55 + p.res * 6, time);

    const out = ctx.createGain();
    const peak = (0.09 * p.amp * mixGain) / Math.sqrt(voices);
    if (hold) applyAdsrHold(out, time, p, peak);
    else applyAdsr(out, time, p, peak, total);
    filter.connect(out);
    out.connect(master);

    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < voices; i += 1) {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(hz * (i === 0 ? 1 : 2.01), time);
      if (midi != null) {
        osc.frequency.setValueAtTime(hz * 0.97, time);
        osc.frequency.exponentialRampToValueAtTime(hz * 1.02, time + 0.05);
        osc.frequency.exponentialRampToValueAtTime(hz, time + 0.12);
      }
      osc.detune.setValueAtTime((i - 1) * 7, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(i === 0 ? 0.7 : 0.22, time);
      osc.connect(g);
      g.connect(filter);
      osc.start(time);
      if (!hold) osc.stop(time + total + 0.02);
      oscs.push(osc);
    }

    this.burstNoise(ctx, time, 0.025, 1200, 1.5, 0.04 * mixGain, filter, 'bandpass');
    if (hold) return { gain: out, oscs, release: p.release };
  }

  // ── French tekno / hardtek voices (v2) ──────────────────────────────

  /** Distorted four-to-the-floor kick — deep sub + mid punch + click. */
  private voiceHardKick(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('kick', sceneIdx);
    const total = Math.max(0.14, Math.min(0.45, d.dur));
    const master = this.trackOut('kick');
    const peak = 0.62 * mixGain;

    const drive = ctx.createWaveShaper();
    drive.curve = makeDriveCurve(0.35 + d.drive * 0.65);
    drive.oversample = '2x';
    drive.connect(master);

    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, Math.max(0.12, d.decay), peak, total);
    out.connect(drive);

    const sub = ctx.createOscillator();
    sub.type = 'sine';
    const fStart = Math.max(90, d.freq + d.pitch * 1.4);
    const fEnd = Math.max(38, d.freq * 0.72);
    sub.frequency.setValueAtTime(fStart, time);
    sub.frequency.exponentialRampToValueAtTime(fEnd, time + 0.085);
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(1, time);
    subG.gain.exponentialRampToValueAtTime(0.0001, time + total);
    sub.connect(subG);
    subG.connect(out);
    sub.start(time);
    sub.stop(time + total + 0.02);

    const mid = ctx.createOscillator();
    mid.type = 'triangle';
    mid.frequency.setValueAtTime(Math.max(110, d.filter * 1.1), time);
    mid.frequency.exponentialRampToValueAtTime(55, time + 0.045);
    const midG = ctx.createGain();
    midG.gain.setValueAtTime(0.42, time);
    midG.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
    mid.connect(midG);
    midG.connect(out);
    mid.start(time);
    mid.stop(time + 0.1);

    const click = ctx.createOscillator();
    click.type = 'square';
    click.frequency.setValueAtTime(220, time);
    click.frequency.exponentialRampToValueAtTime(55, time + 0.018);
    const clickG = ctx.createGain();
    clickG.gain.setValueAtTime(0.22 + d.drive * 0.2, time);
    clickG.gain.exponentialRampToValueAtTime(0.0001, time + 0.022);
    click.connect(clickG);
    clickG.connect(out);
    click.start(time);
    click.stop(time + 0.03);

    this.burstNoise(ctx, time, 0.01, 2200, 0.7, 0.1 * d.noise * mixGain, out, 'highpass');
  }

  /** Layered warehouse clap — staggered noise + short body. */
  private voiceClap(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('snare', sceneIdx);
    const total = Math.max(0.1, d.dur);
    const master = this.trackOut('snare');

    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(280, time);
    hpf.connect(master);

    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, Math.max(0.08, d.decay), 0.5 * mixGain, total);
    out.connect(hpf);

    const center = Math.max(900, d.filter);
    for (const [offset, amp, q] of [
      [0, 0.55, 1.1],
      [0.011, 0.48, 1.3],
      [0.023, 0.38, 1.6],
      [0.038, 0.22, 0.9],
    ] as const) {
      this.burstNoise(
        ctx,
        time + offset,
        0.055,
        center * (0.85 + offset * 4),
        q,
        amp * d.noise * mixGain,
        out,
        'bandpass',
      );
    }

    const body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(Math.max(140, d.freq), time);
    body.frequency.exponentialRampToValueAtTime(90, time + 0.06);
    const bodyG = ctx.createGain();
    bodyG.gain.setValueAtTime(0.14 * mixGain, time);
    bodyG.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
    body.connect(bodyG);
    bodyG.connect(out);
    body.start(time);
    body.stop(time + 0.1);
  }

  /** Tight metallic closed hat — partials + bright noise. */
  private voiceClosedHat(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('hihat', sceneIdx);
    const total = Math.max(0.018, Math.min(0.08, d.dur));
    const master = this.trackOut('hihat');

    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(Math.max(5000, d.filter * 0.55), time);
    hpf.Q.setValueAtTime(0.7, time);
    hpf.connect(master);

    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, Math.max(0.015, d.decay), 0.32 * mixGain, total);
    out.connect(hpf);

    const base = Math.max(400, d.freq);
    for (const [ratio, type, amp] of [
      [1, 'square', 0.18],
      [1.34, 'square', 0.12],
      [2.0, 'sawtooth', 0.1],
      [2.76, 'square', 0.08],
      [4.1, 'sawtooth', 0.06],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(base * ratio, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(amp, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + total);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      osc.stop(time + total + 0.02);
    }

    this.burstNoise(
      ctx,
      time,
      total * 1.1,
      Math.max(7000, d.filter),
      0.55,
      0.45 * d.noise * mixGain,
      out,
      'highpass',
    );
  }

  /** Metallic open / ride scrap — dissonant ring + noise tail. */
  private voiceMetalOpen(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('mc', sceneIdx);
    const total = Math.max(0.08, d.dur);
    const master = this.trackOut('mc');

    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, Math.max(0.06, d.decay), 0.34 * mixGain, total);
    out.connect(master);

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(Math.max(1800, d.filter), time);
    bp.frequency.exponentialRampToValueAtTime(Math.max(900, d.filter * 0.55), time + total * 0.8);
    bp.Q.setValueAtTime(3.5 + d.drive * 10, time);
    bp.connect(out);

    const base = Math.max(280, d.freq);
    for (const [ratio, amp] of [
      [1, 0.2],
      [1.41, 0.14],
      [1.73, 0.12],
      [2.15, 0.1],
      [2.91, 0.08],
      [3.61, 0.06],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(base * ratio, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(amp, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + total);
      osc.connect(g);
      g.connect(bp);
      osc.start(time);
      osc.stop(time + total + 0.02);
    }

    this.burstNoise(ctx, time, total * 0.85, 6200, 1.1, 0.28 * d.noise * mixGain, out, 'highpass');
  }

  /** Resonant acid bass — 303-style filter scream + soft clip. */
  private voiceAcidBass(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('bass', sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.055, lengthSteps * stepDur * 0.97)
        : Math.max(0.07, d.dur);
    const master = this.trackOut('bass');
    const hz = midi != null ? midiToHz(midi) : Math.max(32, d.freq);

    const drive = ctx.createWaveShaper();
    drive.curve = makeDriveCurve(0.25 + d.drive * 0.7);
    drive.oversample = '2x';
    drive.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const fOpen = Math.max(280, d.filter * (3.2 + d.drive * 5));
    const fClosed = Math.max(70, d.filter * 0.35);
    filter.frequency.setValueAtTime(fOpen, time);
    filter.frequency.exponentialRampToValueAtTime(fClosed, time + Math.max(0.04, total * 0.55));
    filter.Q.setValueAtTime(10 + d.drive * 18, time);
    filter.connect(drive);

    const out = ctx.createGain();
    const peak = 0.4 * mixGain;
    out.gain.setValueAtTime(0.0001, time);
    out.gain.linearRampToValueAtTime(peak, time + Math.max(0.001, d.attack));
    out.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.55), time + Math.max(0.03, d.decay));
    out.gain.exponentialRampToValueAtTime(0.0001, time + total);
    out.connect(filter);

    const osc = ctx.createOscillator();
    osc.type = d.type === 'square' ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(hz * 0.92, time);
    osc.frequency.exponentialRampToValueAtTime(hz, time + 0.018);
    osc.connect(out);
    osc.start(time);
    osc.stop(time + total + 0.02);

    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(hz * 0.5, time);
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(0.28 * mixGain, time);
    subG.gain.exponentialRampToValueAtTime(0.0001, time + total);
    sub.connect(subG);
    subG.connect(master);
    sub.start(time);
    sub.stop(time + total + 0.02);
  }

  /** Mentasm / hoover — wide detuned saws + resonant scoop. */
  private voiceMentasm(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    hold = false,
  ): HeldVoice | void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveWavetable(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.08, lengthSteps * stepDur + p.release)
        : p.attack + p.decay + 0.12 + p.release;
    const master = this.trackOut('wt');
    const hz = midi != null ? midiToHz(midi) : p.pitch;
    const voices = Math.max(4, Math.min(8, Math.round(p.unison)));

    const drive = ctx.createWaveShaper();
    drive.curve = makeDriveCurve(0.45);
    drive.oversample = '2x';
    drive.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const fBase = Math.max(280, p.cutoff);
    filter.frequency.setValueAtTime(fBase * (1.4 + p.filterEnv * 2.6), time);
    filter.frequency.exponentialRampToValueAtTime(fBase * 0.4, time + p.attack + p.decay * 1.2);
    filter.Q.setValueAtTime(2.5 + p.res * 12, time);
    filter.connect(drive);

    const out = ctx.createGain();
    const peak = (0.1 * p.amp * mixGain) / Math.sqrt(voices);
    if (hold) applyAdsrHold(out, time, p, peak);
    else applyAdsr(out, time, p, peak, total);
    out.connect(filter);

    const oscs: OscillatorNode[] = [];
    const detuneSpread = 18 + p.lfoDepth * 28;
    for (let i = 0; i < voices; i += 1) {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
      const octave = i >= voices - 2 ? 2.004 : 1;
      osc.frequency.setValueAtTime(hz * octave * 1.06, time);
      osc.frequency.exponentialRampToValueAtTime(hz * octave, time + 0.05);
      osc.detune.setValueAtTime((i - (voices - 1) / 2) * detuneSpread, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(octave > 1 ? 0.22 : 0.5, time);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      if (!hold) osc.stop(time + total + 0.02);
      oscs.push(osc);
    }

    if (p.lfoRate > 0.05) {
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(Math.max(0.08, p.lfoRate), time);
      const lfoG = ctx.createGain();
      lfoG.gain.setValueAtTime(fBase * 0.45 * p.lfoDepth, time);
      lfo.connect(lfoG);
      lfoG.connect(filter.frequency);
      lfo.start(time);
      if (!hold) lfo.stop(time + total + 0.02);
      oscs.push(lfo);
    }

    if (hold) return { gain: out, oscs, release: p.release };
  }

  /** Short supersaw / rave stab — punchy + wide. */
  private voiceTeknoStab(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveAnalog(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.045, lengthSteps * stepDur + p.release * 0.5)
        : Math.max(0.06, p.attack + p.decay + p.release);
    const master = this.trackOut('an');
    const hz = midi != null ? midiToHz(midi) : p.pitch;
    const voices = Math.max(3, Math.min(7, Math.round(p.unison)));

    const drive = ctx.createWaveShaper();
    drive.curve = makeDriveCurve(0.4);
    drive.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const fBase = Math.max(220, p.cutoff);
    filter.frequency.setValueAtTime(fBase * (1.2 + p.filterEnv * 3.5), time);
    filter.frequency.exponentialRampToValueAtTime(fBase * 0.22, time + Math.max(0.035, p.decay));
    filter.Q.setValueAtTime(1.2 + p.res * 9, time);
    filter.connect(drive);

    const out = ctx.createGain();
    applyAdsr(
      out,
      time,
      { ...p, sustain: p.sustain * 0.25, release: Math.min(p.release, 0.14) },
      (0.12 * p.amp * mixGain) / Math.sqrt(voices),
      total,
    );
    out.connect(filter);

    for (let i = 0; i < voices; i += 1) {
      const osc = ctx.createOscillator();
      osc.type = i % 3 === 0 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(hz * 1.04, time);
      osc.frequency.exponentialRampToValueAtTime(hz, time + 0.02);
      osc.detune.setValueAtTime((i - (voices - 1) / 2) * Math.max(10, p.detune), time);
      osc.connect(out);
      osc.start(time);
      osc.stop(time + total + 0.02);
    }

    this.burstNoise(ctx, time, 0.015, 1800, 1.2, 0.06 * mixGain, filter, 'bandpass');
  }

  /** Industrial screech — rising dissonance + vibrato. */
  private voiceScreech(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    hold = false,
  ): HeldVoice | void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveBrass(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.08, lengthSteps * stepDur + p.release)
        : p.attack + p.decay + 0.12 + p.release;
    const master = this.trackOut('tp');
    const hz = midi != null ? midiToHz(midi) : p.pitch;

    const drive = ctx.createWaveShaper();
    drive.curve = makeDriveCurve(0.55);
    drive.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const f0 = Math.max(600, p.cutoff);
    filter.frequency.setValueAtTime(f0 * 0.7, time);
    filter.frequency.exponentialRampToValueAtTime(f0 * (1.1 + p.filterEnv * 0.6), time + total * 0.55);
    filter.Q.setValueAtTime(4 + p.res * 14, time);
    filter.connect(drive);

    const out = ctx.createGain();
    const peak = 0.13 * p.amp * mixGain;
    if (hold) applyAdsrHold(out, time, p, peak);
    else applyAdsr(out, time, p, peak, total);
    out.connect(filter);

    const oscs: OscillatorNode[] = [];
    for (const [ratio, amp, type] of [
      [1, 0.5, 'sawtooth'],
      [1.5, 0.28, 'square'],
      [2.01, 0.2, 'sawtooth'],
      [2.99, 0.12, 'square'],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(hz * ratio * 0.9, time);
      osc.frequency.exponentialRampToValueAtTime(hz * ratio * 1.08, time + Math.min(0.2, total * 0.5));
      const g = ctx.createGain();
      g.gain.setValueAtTime(amp, time);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      if (!hold) osc.stop(time + total + 0.02);
      oscs.push(osc);
    }

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(Math.max(4.5, p.lfoRate), time);
    const lfoG = ctx.createGain();
    lfoG.gain.setValueAtTime(hz * 0.045 * (0.5 + p.lfoDepth), time);
    lfo.connect(lfoG);
    for (const osc of oscs) lfoG.connect(osc.frequency);
    lfo.start(time);
    if (!hold) lfo.stop(time + total + 0.02);
    oscs.push(lfo);

    this.burstNoise(ctx, time, 0.04, 3200, 1.8, 0.1 * mixGain, filter, 'bandpass');
    if (hold) return { gain: out, oscs, release: p.release };
  }

  /** Laser / zap — steep pitch fall + noise spark. */
  private voiceLaser(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveGuitar(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.035, lengthSteps * stepDur * 0.65)
        : Math.max(0.045, p.attack + p.decay + 0.03);
    const master = this.trackOut('rg');
    const hz = midi != null ? midiToHz(midi) : p.pitch;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(Math.max(900, p.cutoff * (1.2 + p.filterEnv)), time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(180, p.cutoff * 0.15), time + total);
    filter.Q.setValueAtTime(6 + p.res * 16, time);
    filter.connect(master);

    const out = ctx.createGain();
    applyAdsr(out, time, { ...p, sustain: 0.02, release: Math.min(p.release, 0.1) }, 0.16 * p.amp * mixGain, total);
    out.connect(filter);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(hz * 2.4, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, hz * 0.25), time + total);
    osc.connect(out);
    osc.start(time);
    osc.stop(time + total + 0.02);

    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(hz * 2.55, time);
    osc2.frequency.exponentialRampToValueAtTime(Math.max(50, hz * 0.3), time + total);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.35, time);
    osc2.connect(g2);
    g2.connect(out);
    osc2.start(time);
    osc2.stop(time + total + 0.02);

    this.burstNoise(ctx, time, total * 0.9, 7500, 0.8, 0.28 * mixGain, filter, 'highpass');
  }

  // ── Pop-punk / Blink-182 voices ─────────────────────────────────────

  private voicePunkKick(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('kick', sceneIdx);
    const total = Math.max(0.12, d.dur);
    const master = this.trackOut('kick');
    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, d.decay, 0.55 * mixGain, total);
    out.connect(master);

    const body = ctx.createOscillator();
    body.type = 'sine';
    const f0 = Math.max(80, d.freq + d.pitch);
    body.frequency.setValueAtTime(f0, time);
    body.frequency.exponentialRampToValueAtTime(Math.max(42, d.freq * 0.65), time + 0.06);
    body.connect(out);
    body.start(time);
    body.stop(time + total);

    const click = ctx.createOscillator();
    click.type = 'triangle';
    click.frequency.setValueAtTime(160, time);
    click.frequency.exponentialRampToValueAtTime(50, time + 0.02);
    const clickG = ctx.createGain();
    clickG.gain.setValueAtTime(0.25, time);
    clickG.gain.exponentialRampToValueAtTime(0.0001, time + 0.025);
    click.connect(clickG);
    clickG.connect(out);
    click.start(time);
    click.stop(time + 0.03);
    this.burstNoise(ctx, time, 0.008, 2500, 0.6, 0.08 * d.noise * mixGain, out, 'highpass');
  }

  private voicePunkSnare(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('snare', sceneIdx);
    const total = Math.max(0.1, d.dur);
    const master = this.trackOut('snare');
    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, d.decay, 0.48 * mixGain, total);
    out.connect(master);

    const shell = ctx.createOscillator();
    shell.type = 'triangle';
    shell.frequency.setValueAtTime(Math.max(160, d.freq), time);
    shell.frequency.exponentialRampToValueAtTime(110, time + 0.05);
    const shellG = ctx.createGain();
    shellG.gain.setValueAtTime(0.35, time);
    shellG.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
    shell.connect(shellG);
    shellG.connect(out);
    shell.start(time);
    shell.stop(time + 0.1);

    this.burstNoise(ctx, time, total * 0.85, Math.max(1800, d.filter), 1.6, 0.55 * d.noise * mixGain, out, 'bandpass');
    this.burstNoise(ctx, time, 0.04, 6000, 0.7, 0.22 * mixGain, out, 'highpass');
  }

  private voicePunkHat(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('hihat', sceneIdx);
    const total = Math.max(0.02, d.dur);
    const master = this.trackOut('hihat');
    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, d.decay, 0.28 * mixGain, total);
    out.connect(master);
    this.burstNoise(ctx, time, total, Math.max(6000, d.filter), 0.5, 0.5 * d.noise * mixGain, out, 'highpass');
  }

  private voicePunkCrash(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('mc', sceneIdx);
    const total = Math.max(0.25, d.dur * 1.8);
    const master = this.trackOut('mc');
    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.002, Math.max(0.2, d.decay), 0.32 * mixGain, total);
    out.connect(master);

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(Math.max(2200, d.filter), time);
    bp.Q.setValueAtTime(0.8, time);
    bp.connect(out);

    for (const ratio of [1, 1.38, 1.72, 2.15, 2.9]) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(Math.max(300, d.freq) * ratio, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + total);
      osc.connect(g);
      g.connect(bp);
      osc.start(time);
      osc.stop(time + total + 0.02);
    }
    this.burstNoise(ctx, time, total * 0.7, 8000, 0.6, 0.35 * d.noise * mixGain, out, 'highpass');
  }

  private voicePunkBass(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('bass', sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.08, lengthSteps * stepDur * 0.95)
        : Math.max(0.1, d.dur);
    const master = this.trackOut('bass');
    const hz = midi != null ? midiToHz(midi) : Math.max(40, d.freq);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(200, d.filter * 2.2), time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(120, d.filter), time + 0.05);
    filter.Q.setValueAtTime(1.2, time);
    filter.connect(master);

    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.004, d.decay, 0.42 * mixGain, total);
    out.connect(filter);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(hz, time);
    osc.connect(out);
    osc.start(time);
    osc.stop(time + total + 0.02);

    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(hz * 0.5, time);
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(0.3 * mixGain, time);
    subG.gain.exponentialRampToValueAtTime(0.0001, time + total);
    sub.connect(subG);
    subG.connect(master);
    sub.start(time);
    sub.stop(time + total + 0.02);

    this.burstNoise(ctx, time, 0.008, 800, 1, 0.06 * mixGain, filter, 'bandpass');
  }

  private voicePowerChord(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    hold = false,
  ): HeldVoice | void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveWavetable(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.1, lengthSteps * stepDur + p.release)
        : p.attack + p.decay + 0.15 + p.release;
    const master = this.trackOut('wt');
    const root = midi != null ? midiToHz(midi) : p.pitch;

    const drive = ctx.createWaveShaper();
    drive.curve = makeDriveCurve(0.55 + p.res * 0.3);
    drive.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(400, p.cutoff * (1 + p.filterEnv)), time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(250, p.cutoff * 0.55), time + p.decay);
    filter.Q.setValueAtTime(0.8 + p.res * 3, time);
    filter.connect(drive);

    const out = ctx.createGain();
    const peak = 0.11 * p.amp * mixGain;
    if (hold) applyAdsrHold(out, time, p, peak);
    else applyAdsr(out, time, p, peak, total);
    out.connect(filter);

    const oscs: OscillatorNode[] = [];
    // Power chord: root + fifth (+ octave)
    for (const [ratio, amp, det] of [
      [1, 0.55, -7],
      [1, 0.5, 7],
      [1.498, 0.42, -5],
      [1.498, 0.38, 5],
      [2, 0.28, 0],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(root * ratio, time);
      osc.detune.setValueAtTime(det, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(amp, time);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      if (!hold) osc.stop(time + total + 0.02);
      oscs.push(osc);
    }
    if (hold) return { gain: out, oscs, release: p.release };
  }

  private voicePalmMute(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveAnalog(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.04, lengthSteps * stepDur * 0.55)
        : Math.max(0.05, p.attack + p.decay * 0.6);
    const master = this.trackOut('an');
    const hz = midi != null ? midiToHz(midi) : p.pitch;

    const drive = ctx.createWaveShaper();
    drive.curve = makeDriveCurve(0.4);
    drive.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(500, p.cutoff * 1.2), time);
    filter.frequency.exponentialRampToValueAtTime(180, time + Math.min(0.08, total));
    filter.Q.setValueAtTime(2 + p.res * 4, time);
    filter.connect(drive);

    const out = ctx.createGain();
    applyAdsr(out, time, { ...p, sustain: 0.05, release: 0.04 }, 0.12 * p.amp * mixGain, total);
    out.connect(filter);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(hz, time);
    osc.connect(out);
    osc.start(time);
    osc.stop(time + total + 0.02);

    this.burstNoise(ctx, time, 0.012, 1200, 1.5, 0.1 * mixGain, filter, 'bandpass');
  }

  private voicePunkLead(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    hold = false,
  ): HeldVoice | void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveBrass(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.08, lengthSteps * stepDur + p.release)
        : p.attack + p.decay + 0.12 + p.release;
    const master = this.trackOut('tp');
    const hz = midi != null ? midiToHz(midi) : p.pitch;

    const drive = ctx.createWaveShaper();
    drive.curve = makeDriveCurve(0.35);
    drive.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(800, p.cutoff * (1 + p.filterEnv)), time);
    filter.Q.setValueAtTime(1 + p.res * 4, time);
    filter.connect(drive);

    const out = ctx.createGain();
    const peak = 0.1 * p.amp * mixGain;
    if (hold) applyAdsrHold(out, time, p, peak);
    else applyAdsr(out, time, p, peak, total);
    out.connect(filter);

    const oscs: OscillatorNode[] = [];
    for (const det of [-8, 0, 9]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(hz, time);
      osc.detune.setValueAtTime(det, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(det === 0 ? 0.55 : 0.28, time);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      if (!hold) osc.stop(time + total + 0.02);
      oscs.push(osc);
    }

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.5 + p.lfoRate * 0.2, time);
    const lfoG = ctx.createGain();
    lfoG.gain.setValueAtTime(hz * 0.008 * (0.4 + p.lfoDepth), time);
    lfo.connect(lfoG);
    for (const osc of oscs) lfoG.connect(osc.frequency);
    lfo.start(time);
    if (!hold) lfo.stop(time + total + 0.02);
    oscs.push(lfo);

    if (hold) return { gain: out, oscs, release: p.release };
  }

  private voiceOctaveFill(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveGuitar(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.05, lengthSteps * stepDur * 0.8)
        : p.attack + p.decay + p.release;
    const master = this.trackOut('rg');
    const hz = midi != null ? midiToHz(midi) : p.pitch;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(600, p.cutoff * (1 + p.filterEnv)), time);
    filter.frequency.exponentialRampToValueAtTime(p.cutoff * 0.4, time + total * 0.6);
    filter.Q.setValueAtTime(0.8 + p.res * 3, time);
    filter.connect(master);

    const out = ctx.createGain();
    applyAdsr(out, time, p, 0.1 * p.amp * mixGain, total);
    out.connect(filter);

    for (const ratio of [1, 2]) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(hz * ratio, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(ratio === 1 ? 0.55 : 0.35, time);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      osc.stop(time + total + 0.02);
    }
  }

  // ── Classical / Constantini-style dance ─────────────────────────────

  private voiceTimpani(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('kick', sceneIdx);
    const total = Math.max(0.35, d.dur);
    const master = this.trackOut('kick');
    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.004, d.decay, 0.4 * mixGain, total);
    out.connect(master);

    const body = ctx.createOscillator();
    body.type = 'sine';
    const f0 = Math.max(55, d.freq + d.pitch * 0.3);
    body.frequency.setValueAtTime(f0 * 1.08, time);
    body.frequency.exponentialRampToValueAtTime(f0, time + 0.08);
    body.connect(out);
    body.start(time);
    body.stop(time + total);

    this.burstNoise(ctx, time, 0.03, 400, 1.2, 0.12 * d.noise * mixGain, out, 'bandpass');
  }

  private voiceWoodblock(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('snare', sceneIdx);
    const total = Math.max(0.06, d.dur * 0.6);
    const master = this.trackOut('snare');
    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, d.decay, 0.3 * mixGain, total);
    out.connect(master);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(Math.max(400, d.freq * 2.2), time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(280, d.freq * 1.4), time + 0.03);
    osc.connect(out);
    osc.start(time);
    osc.stop(time + total);
    this.burstNoise(ctx, time, 0.015, 2500, 2, 0.15 * mixGain, out, 'bandpass');
  }

  private voiceTriangle(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('hihat', sceneIdx);
    const total = Math.max(0.2, d.dur * 3);
    const master = this.trackOut('hihat');
    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.001, Math.max(0.15, d.decay), 0.22 * mixGain, total);
    out.connect(master);

    for (const ratio of [1, 2.76, 5.4]) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(Math.max(1200, d.filter * 0.4) * ratio, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(ratio === 1 ? 0.4 : 0.15, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + total);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      osc.stop(time + total + 0.02);
    }
  }

  private voiceSoftCymbal(time: number, mixGain: number, sceneIdx: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('mc', sceneIdx);
    const total = Math.max(0.5, d.dur * 3);
    const master = this.trackOut('mc');
    const out = ctx.createGain();
    applyDrumEnvelope(out, time, 0.01, Math.max(0.35, d.decay), 0.2 * mixGain, total);
    out.connect(master);
    this.burstNoise(ctx, time, total * 0.9, Math.max(4000, d.filter), 0.4, 0.35 * d.noise * mixGain, out, 'highpass');
  }

  private voiceCelloBass(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const d = this.resolveDrum('bass', sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.15, lengthSteps * stepDur * 0.95)
        : Math.max(0.2, d.dur);
    const master = this.trackOut('bass');
    const hz = midi != null ? midiToHz(midi) : Math.max(40, d.freq);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(180, d.filter * 1.8), time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(100, d.filter), time + 0.12);
    filter.Q.setValueAtTime(0.9, time);
    filter.connect(master);

    const out = ctx.createGain();
    applyAdsr(
      out,
      time,
      { attack: 0.02, decay: 0.2, sustain: 0.55, release: 0.25 },
      0.32 * mixGain,
      total,
    );
    out.connect(filter);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(hz * 1.01, time);
    osc.frequency.exponentialRampToValueAtTime(hz, time + 0.04);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.55, time);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    osc.stop(time + total + 0.02);

    const warm = ctx.createOscillator();
    warm.type = 'sine';
    warm.frequency.setValueAtTime(hz, time);
    const warmG = ctx.createGain();
    warmG.gain.setValueAtTime(0.45, time);
    warm.connect(warmG);
    warmG.connect(out);
    warm.start(time);
    warm.stop(time + total + 0.02);

    this.burstNoise(ctx, time, 0.015, 500, 1, 0.08 * mixGain, filter, 'bandpass');
  }

  private voiceGrandPiano(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    hold = false,
  ): HeldVoice | void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveWavetable(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.2, lengthSteps * stepDur + p.release * 1.4)
        : p.attack + p.decay + 0.4 + p.release;
    const master = this.trackOut('wt');
    const hz = midi != null ? midiToHz(midi) : p.pitch;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const bright = Math.max(900, p.cutoff * (1.2 + p.filterEnv));
    filter.frequency.setValueAtTime(bright, time);
    filter.frequency.exponentialRampToValueAtTime(bright * 0.35, time + Math.max(0.2, total * 0.5));
    filter.Q.setValueAtTime(0.6, time);
    filter.connect(master);

    const out = ctx.createGain();
    const peak = 0.14 * p.amp * mixGain;
    const env = { attack: 0.004, decay: 0.35, sustain: 0.25, release: Math.max(0.2, p.release) };
    if (hold) applyAdsrHold(out, time, env, peak);
    else applyAdsr(out, time, env, peak, total);
    out.connect(filter);

    const oscs: OscillatorNode[] = [];
    // Hammered partials: fundamental + soft harmonics
    for (const [ratio, amp, type] of [
      [1, 0.55, 'triangle'],
      [2, 0.22, 'sine'],
      [3, 0.1, 'sine'],
      [4.02, 0.06, 'sine'],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(hz * ratio * 1.01, time);
      osc.frequency.exponentialRampToValueAtTime(hz * ratio, time + 0.02);
      const g = ctx.createGain();
      g.gain.setValueAtTime(amp, time);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      if (!hold) osc.stop(time + total + 0.05);
      oscs.push(osc);
    }

    this.burstNoise(ctx, time, 0.012, 1800, 1.2, 0.08 * mixGain, filter, 'bandpass');
    if (hold) return { gain: out, oscs, release: env.release };
  }

  private voiceViolin(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    hold = false,
  ): HeldVoice | void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveAnalog(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.15, lengthSteps * stepDur + p.release)
        : p.attack + p.decay + 0.25 + p.release;
    const master = this.trackOut('an');
    const hz = midi != null ? midiToHz(midi) : p.pitch;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(Math.max(500, p.cutoff), time);
    filter.Q.setValueAtTime(1.5 + p.res * 4, time);
    filter.connect(master);

    const out = ctx.createGain();
    const peak = 0.1 * p.amp * mixGain;
    const env = { attack: Math.max(0.04, p.attack), decay: p.decay, sustain: 0.7, release: p.release };
    if (hold) applyAdsrHold(out, time, env, peak);
    else applyAdsr(out, time, env, peak, total);
    out.connect(filter);

    const oscs: OscillatorNode[] = [];
    for (const det of [-4, 0, 5]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(hz, time);
      osc.detune.setValueAtTime(det, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(det === 0 ? 0.5 : 0.22, time);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      if (!hold) osc.stop(time + total + 0.02);
      oscs.push(osc);
    }

    const vibrato = ctx.createOscillator();
    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(5.2, time);
    const vibG = ctx.createGain();
    vibG.gain.setValueAtTime(hz * 0.004, time);
    vibrato.connect(vibG);
    for (const osc of oscs) vibG.connect(osc.frequency);
    vibrato.start(time);
    if (!hold) vibrato.stop(time + total + 0.02);
    oscs.push(vibrato);

    if (hold) return { gain: out, oscs, release: env.release };
  }

  private voiceClarinet(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
    hold = false,
  ): HeldVoice | void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveBrass(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.12, lengthSteps * stepDur + p.release)
        : p.attack + p.decay + 0.2 + p.release;
    const master = this.trackOut('tp');
    const hz = midi != null ? midiToHz(midi) : p.pitch;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(700, p.cutoff), time);
    filter.Q.setValueAtTime(0.8 + p.res * 2, time);
    filter.connect(master);

    const out = ctx.createGain();
    const peak = 0.1 * p.amp * mixGain;
    const env = { attack: Math.max(0.03, p.attack), decay: p.decay, sustain: 0.65, release: p.release };
    if (hold) applyAdsrHold(out, time, env, peak);
    else applyAdsr(out, time, env, peak, total);
    out.connect(filter);

    const oscs: OscillatorNode[] = [];
    // Odd harmonics = clarinet-ish
    for (const [ratio, amp] of [
      [1, 0.55],
      [3, 0.22],
      [5, 0.1],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(hz * ratio, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(amp, time);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      if (!hold) osc.stop(time + total + 0.02);
      oscs.push(osc);
    }
    if (hold) return { gain: out, oscs, release: env.release };
  }

  private voiceHarp(
    time: number,
    mixGain: number,
    sceneIdx: number,
    midi?: number,
    lengthSteps?: number,
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = this.resolveGuitar(sceneIdx);
    const stepDur = stepDurationSec(this.project.bpm);
    const total =
      midi != null && lengthSteps
        ? Math.max(0.2, lengthSteps * stepDur + p.release)
        : p.attack + p.decay + 0.5 + p.release;
    const master = this.trackOut('rg');
    const hz = midi != null ? midiToHz(midi) : p.pitch;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(1200, p.cutoff * (1.5 + p.filterEnv)), time);
    filter.frequency.exponentialRampToValueAtTime(p.cutoff * 0.3, time + total * 0.55);
    filter.Q.setValueAtTime(0.7, time);
    filter.connect(master);

    const out = ctx.createGain();
    applyAdsr(out, time, { attack: 0.002, decay: 0.45, sustain: 0.15, release: 0.4 }, 0.12 * p.amp * mixGain, total);
    out.connect(filter);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(hz * 1.02, time);
    osc.frequency.exponentialRampToValueAtTime(hz, time + 0.015);
    osc.connect(out);
    osc.start(time);
    osc.stop(time + total + 0.02);

    this.burstNoise(ctx, time, 0.008, 2200, 1.4, 0.1 * mixGain, filter, 'bandpass');
  }
}
