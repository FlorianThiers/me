export function burstNoise(
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
