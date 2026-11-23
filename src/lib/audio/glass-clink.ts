import { getAudioContext } from "@/lib/audio/audio-context";

// Two crystal glasses touching: bright partials with a long, shimmering ring
export const playGlassClink = (delaySeconds = 0): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const at = ctx.currentTime + delaySeconds;
  for (const [freq, level, decay] of [
    [2637, 0.09, 1.6],
    [3951, 0.05, 1.2],
    [5274, 0.03, 0.8],
    [2649, 0.06, 1.8],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(level, at + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }
};
