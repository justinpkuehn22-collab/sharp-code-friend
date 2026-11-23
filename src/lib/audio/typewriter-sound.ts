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

const clack = (ctx: AudioContext, at: number, brightness: number, loudness: number) => {
  // The strike: a short burst of filtered noise
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx);
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = brightness * (0.85 + Math.random() * 0.3);
  band.Q.value = 1.4;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(loudness, at);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, at + 0.045);
  noise.connect(band).connect(noiseGain).connect(ctx.destination);
  noise.start(at, Math.random() * 0.5, 0.06);

  // The body: a low knock as the typebar lands
  const thump = ctx.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(170 + Math.random() * 40, at);
  thump.frequency.exponentialRampToValueAtTime(70, at + 0.04);
  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(loudness * 0.9, at);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, at + 0.05);
  thump.connect(thumpGain).connect(ctx.destination);
  thump.start(at);
  thump.stop(at + 0.06);
};

const bell = (ctx: AudioContext, at: number) => {
  for (const [freq, level] of [
    [2093, 0.12],
    [3136, 0.05],
    [4186, 0.025],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(0.0005, at + 1.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 1.2);
  }
};

const carriage = (ctx: AudioContext, at: number) => {
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx);
  const low = ctx.createBiquadFilter();
  low.type = "bandpass";
  low.frequency.setValueAtTime(900, at);
  low.frequency.linearRampToValueAtTime(500, at + 0.28);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(0.12, at + 0.05);
  gain.gain.linearRampToValueAtTime(0.0001, at + 0.3);
  noise.connect(low).connect(gain).connect(ctx.destination);
  noise.start(at, 0, 0.32);
};

export const playKeySound = (sound: KeySound): void => {
  if (!sound) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const at = ctx.currentTime + 0.005;
  if (sound === "key") clack(ctx, at, 3200, 0.35);
  if (sound === "backspace") clack(ctx, at, 2200, 0.22);
  if (sound === "space") clack(ctx, at, 1400, 0.3);
  if (sound === "return") {
    bell(ctx, at);
    carriage(ctx, at + 0.08);
    clack(ctx, at + 0.38, 1200, 0.35);
  }
};
