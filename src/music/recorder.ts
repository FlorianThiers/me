import { decodeBlobToMono, newSampleId, saveSample } from './audioStore';

export type RecorderState = 'idle' | 'armed' | 'count-in' | 'recording';

export class VocalRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private state: RecorderState = 'idle';
  private deviceId = '';

  private meterCtx: AudioContext | null = null;
  private meterSource: MediaStreamAudioSourceNode | null = null;
  private meterAnalyser: AnalyserNode | null = null;
  private meterData: Float32Array<ArrayBuffer> | null = null;
  private monitorGain: GainNode | null = null;
  private monitorOn = false;

  getState() {
    return this.state;
  }

  isArmed() {
    return this.stream !== null && this.state !== 'idle';
  }

  async startCountIn(countInMs: number, onTick?: (remainingMs: number) => void): Promise<void> {
    this.state = 'count-in';
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        const elapsed = performance.now() - start;
        const remaining = Math.max(0, countInMs - elapsed);
        onTick?.(remaining);
        if (remaining <= 0) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  async arm(deviceId = ''): Promise<void> {
    if (this.stream && this.deviceId === deviceId) {
      this.state = 'armed';
      return;
    }
    this.disarm();
    this.deviceId = deviceId;
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.setupMeter(this.stream);
    this.state = 'armed';
  }

  /** Peak level 0…1 from the armed mic (for UI meter). */
  getLevel(): number {
    if (!this.meterAnalyser || !this.meterData) return 0;
    this.meterAnalyser.getFloatTimeDomainData(this.meterData);
    let peak = 0;
    for (let i = 0; i < this.meterData.length; i++) {
      const v = Math.abs(this.meterData[i] ?? 0);
      if (v > peak) peak = v;
    }
    return Math.min(1, peak * 1.4);
  }

  setMonitor(on: boolean, gain = 0.35) {
    this.monitorOn = on;
    if (!this.monitorGain) return;
    this.monitorGain.gain.value = on ? gain : 0;
  }

  startRecording() {
    if (!this.stream) throw new Error('mic not armed');
    this.chunks = [];
    this.recorder = new MediaRecorder(this.stream, { mimeType: this.pickMime() });
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start(100);
    this.state = 'recording';
  }

  async stopRecording(ctx: AudioContext): Promise<{ sampleId: string; durationSec: number }> {
    if (!this.recorder) throw new Error('not recording');
    const rec = this.recorder;
    await new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
      rec.stop();
    });
    this.recorder = null;
    this.state = this.stream ? 'armed' : 'idle';

    const blob = new Blob(this.chunks, { type: rec.mimeType || 'audio/webm' });
    this.chunks = [];
    const mono = await decodeBlobToMono(ctx, blob);
    const sampleId = newSampleId();
    saveSample(sampleId, mono);
    const durationSec = mono.length / ctx.sampleRate;
    return { sampleId, durationSec };
  }

  cancel() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        this.recorder.stop();
      } catch {
        /* ignore */
      }
    }
    this.recorder = null;
    this.chunks = [];
    this.state = this.stream ? 'armed' : 'idle';
  }

  disarm() {
    this.cancel();
    this.teardownMeter();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.state = 'idle';
  }

  private setupMeter(stream: MediaStream) {
    this.teardownMeter();
    const ctx = new AudioContext();
    this.meterCtx = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.4;
    const monitor = ctx.createGain();
    monitor.gain.value = this.monitorOn ? 0.35 : 0;
    source.connect(analyser);
    source.connect(monitor);
    monitor.connect(ctx.destination);
    this.meterSource = source;
    this.meterAnalyser = analyser;
    this.monitorGain = monitor;
    this.meterData = new Float32Array(analyser.fftSize);
    void ctx.resume();
  }

  private teardownMeter() {
    try {
      this.meterSource?.disconnect();
      this.meterAnalyser?.disconnect();
      this.monitorGain?.disconnect();
    } catch {
      /* ignore */
    }
    void this.meterCtx?.close();
    this.meterCtx = null;
    this.meterSource = null;
    this.meterAnalyser = null;
    this.monitorGain = null;
    this.meterData = null;
  }

  private pickMime(): string {
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c;
    }
    return '';
  }
}
