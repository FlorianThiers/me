import {
  clipsAtBar,
  patternContentSteps,
  patternStepForClip,
} from '../grid';
import { loadSample, samplesToAudioBuffer } from '../audioStore';
import {
  applyFxToBus,
  createReturnBuses,
  createTrackBus,
  type ReturnBusNodes,
  type TrackBusNodes,
} from '../fxChain';
import {
  clampMasterVolume,
  DEFAULT_MASTER_VOLUME,
  loadMasterVolume,
} from '../masterVolume';
import { applySinkId } from '../outputDevices';
import { PcmTap } from '../pcmTap';
import {
  bridgePlay,
  bridgeStop,
  isUpnpDeviceId,
  rendererIdFromDeviceId,
  waitForLiveAudio,
  waitForStreamClient,
} from '../upnpClient';
import type { MusicProject, TrackId } from '../types';
import {
  STEPS_PER_BAR,
  STEPS_PER_BEAT,
  isAudioTrack,
  stepDurationSec,
  TRACK_IDS,
} from '../types';
import { LOOKAHEAD_MS, SCHEDULE_AHEAD } from './constants';
import { makeSoftClipCurve } from './fx/curves';
import { humanize } from './scheduler/humanize';
import { songLengthSteps, stepsInLoop } from './scheduler/timing';
import { dispatchMelodic, voicePerc } from './synths/dispatch';
import type { EngineOpts, HeldVoice, PercId, VoiceSynthHost } from './types';

export type { EngineOpts, HeldVoice } from './types';

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

  private synthHost(): VoiceSynthHost {
    return {
      ctx: this.ctx,
      project: this.project,
      trackOut: (id) => this.trackOut(id),
    };
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
      voicePerc(this.synthHost(), id, time, mixGain, scene);
      return;
    }
    const hold = dispatchMelodic(this.synthHost(), id, time, mixGain, scene, midi, undefined, true);
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

  private scheduler = () => {
    if (!this.playing || !this.ctx) return;
    const ctx = this.ctx;
    const patternLen = stepsInLoop(this.project, this.sessionScene);
    const clipMode = (this.project.clips?.length ?? 0) > 0;
    const songSteps = songLengthSteps(this.project);
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
      const h = humanize(this.project, time, gain * vel, id);
      if (id === 'kick' || id === 'snare' || id === 'hihat' || id === 'mc') {
        voicePerc(this.synthHost(), id as PercId, h.time, h.gain, sceneIdx);
        return;
      }
      dispatchMelodic(this.synthHost(), id, h.time, h.gain, sceneIdx, midi, lengthSteps, false);
    } finally {
      this.notePan = null;
    }
  }
}
