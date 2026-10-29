export function makeSoftClipCurve(samples = 1024): Float32Array<ArrayBuffer> {
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
export function makeDriveCurve(amount: number, samples = 256): Float32Array {
  const curve = new Float32Array(samples);
  const k = 2 + Math.max(0, Math.min(1, amount)) * 48;
  for (let i = 0; i < samples; i += 1) {
    const x = (i * 2) / (samples - 1) - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}
