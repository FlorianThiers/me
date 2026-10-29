import { UPNP_BRIDGE_WS } from './upnpClient';

/**
 * Taps stereo float audio from the graph, sends int16 PCM to the UPnP bridge.
 * Uses ScriptProcessor (pilot) — swap for AudioWorklet later if needed.
 */
export class PcmTap {
  private ctx: AudioContext;
  private source: AudioNode;
  private processor: ScriptProcessorNode | null = null;
  private silent: GainNode | null = null;
  private ws: WebSocket | null = null;
  private active = false;

  constructor(ctx: AudioContext, source: AudioNode) {
    this.ctx = ctx;
    this.source = source;
  }

  get connected() {
    return this.active && this.ws?.readyState === WebSocket.OPEN;
  }

  async start(): Promise<void> {
    if (this.active) return;
    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(UPNP_BRIDGE_WS);
      ws.binaryType = 'arraybuffer';
      const t = window.setTimeout(() => {
        ws.close();
        reject(new Error('UPnP bridge WebSocket timeout'));
      }, 2500);
      ws.onopen = () => {
        window.clearTimeout(t);
        ws.send(JSON.stringify({ type: 'hello', sampleRate: this.ctx.sampleRate, channels: 2 }));
        this.ws = ws;
        resolve();
      };
      ws.onerror = () => {
        window.clearTimeout(t);
        reject(new Error('UPnP bridge WebSocket failed — is npm run upnp-bridge running?'));
      };
    });

    const proc = this.ctx.createScriptProcessor(1024, 2, 2);
    const silent = this.ctx.createGain();
    silent.gain.value = 0;
    this.source.connect(proc);
    proc.connect(silent);
    silent.connect(this.ctx.destination);

    proc.onaudioprocess = (ev) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      const L = ev.inputBuffer.getChannelData(0);
      const R = ev.inputBuffer.numberOfChannels > 1 ? ev.inputBuffer.getChannelData(1) : L;
      const interleaved = new Int16Array(L.length * 2);
      for (let i = 0; i < L.length; i++) {
        interleaved[i * 2] = floatToInt16(L[i]);
        interleaved[i * 2 + 1] = floatToInt16(R[i]);
      }
      this.ws.send(interleaved.buffer);
    };

    this.processor = proc;
    this.silent = silent;
    this.active = true;
  }

  stop() {
    this.active = false;
    try {
      this.processor?.disconnect();
    } catch {
      /* ignore */
    }
    try {
      this.silent?.disconnect();
    } catch {
      /* ignore */
    }
    this.processor = null;
    this.silent = null;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        /* ignore */
      }
      this.ws = null;
    }
  }
}

function floatToInt16(s: number): number {
  const x = Math.max(-1, Math.min(1, s));
  return x < 0 ? (x * 0x8000) | 0 : (x * 0x7fff) | 0;
}
