import { getAudioContext, noiseBuffer } from "@/lib/audio/audio-context";

export type KeySound = "key" | "space" | "return" | "backspace" | null;

// Which sound a key should make; modifier keys and arrows stay silent
export const keySoundFor = (key: string, withModifier: boolean): KeySound => {
  if (withModifier) return null;
  if (key === "Enter") return "return";
  if (key === " ") return "space";
  if (key === "Backspace" || key === "Delete") return "backspace";
  if (key.length === 1) return "key";
  return null;
};

const jitter = (amount: number) => 1 + (Math.random() - 0.5) * amount;

// A very short burst of filtered noise: the basic "tick" of metal on metal
const tick = (
  ctx: BaseAudioContext,
  out: AudioNode,
  at: number,
  opts: { freq: number; q: number; level: number; decay: number; type?: BiquadFilterType },
) => {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = opts.type ?? "bandpass";
  filter.frequency.value = opts.freq * jitter(0.12);
  filter.Q.value = opts.q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(opts.level, at + 0.0008);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + opts.decay);
  src.connect(filter).connect(gain).connect(out);
  src.start(at, Math.random() * 0.8, opts.decay + 0.02);
};

// The typebar strikes the paper: a crisp, bright snap with a little ring,
// then the key springs back a moment later with a softer tick
const keystroke = (ctx: BaseAudioContext, out: AudioNode, at: number, weight: number) => {
  const level = 0.22 * weight * jitter(0.25);
  tick(ctx, out, at, { freq: 4200, q: 0.9, level, decay: 0.018, type: "highpass" });
  tick(ctx, out, at, { freq: 3100, q: 9, level: level * 0.55, decay: 0.045 });
  tick(ctx, out, at + 0.002, { freq: 1500, q: 2.5, level: level * 0.35, decay: 0.022 });
  tick(ctx, out, at + 0.075 * jitter(0.3), { freq: 2600, q: 3, level: level * 0.3, decay: 0.014 });
};

const spacebar = (ctx: BaseAudioContext, out: AudioNode, at: number) => {
  // Wider bar, duller and woodier, and a rattle as it settles
  tick(ctx, out, at, { freq: 1100, q: 1.6, level: 0.2, decay: 0.035 });
  tick(ctx, out, at, { freq: 3600, q: 1, level: 0.09, decay: 0.015, type: "highpass" });
  tick(ctx, out, at + 0.07, { freq: 1800, q: 4, level: 0.06, decay: 0.02 });
};

const bell = (ctx: BaseAudioContext, out: AudioNode, at: number) => {
  for (const [freq, level, decay] of [
    [2349, 0.09, 1.3],
    [3520, 0.035, 0.9],
    [5870, 0.015, 0.5],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(level, at + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(gain).connect(out);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }
};

// Carriage return: the bell, the lever pulled, a run of ratchet clicks as the
// carriage slides back, and a solid stop at the end
const carriageReturn = (ctx: BaseAudioContext, out: AudioNode, at: number) => {
  bell(ctx, out, at);
  tick(ctx, out, at + 0.12, { freq: 900, q: 1.5, level: 0.1, decay: 0.05 });
  const clicks = 9;
  for (let i = 0; i < clicks; i++) {
    const t = at + 0.16 + i * 0.026 * (1 + i * 0.03);
    tick(ctx, out, t, { freq: 3300, q: 6, level: 0.07 * (1 - i / (clicks * 1.4)), decay: 0.012 });
  }
  tick(ctx, out, at + 0.46, { freq: 1300, q: 1.8, level: 0.16, decay: 0.05 });
  tick(ctx, out, at + 0.46, { freq: 4000, q: 1, level: 0.07, decay: 0.02, type: "highpass" });
};

export const scheduleKeySound = (ctx: BaseAudioContext, out: AudioNode, sound: KeySound, at: number): void => {
  if (sound === "key") keystroke(ctx, out, at, 1);
  if (sound === "backspace") keystroke(ctx, out, at, 0.7);
  if (sound === "space") spacebar(ctx, out, at);
  if (sound === "return") carriageReturn(ctx, out, at);
};

export const playKeySound = (sound: KeySound): void => {
  if (!sound) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  scheduleKeySound(ctx, ctx.destination, sound, ctx.currentTime + 0.003);
};
