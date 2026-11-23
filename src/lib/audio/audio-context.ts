// One shared AudioContext for the whole app. Browsers only allow sound after a
// click or key press, so this is created lazily on the first interaction.
let context: AudioContext | null = null;

export const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  if (context.state === "suspended") void context.resume();
  return context;
};

// White noise, reused by the typewriter, the brushes and the vinyl crackle
const noiseCache = new WeakMap<AudioContext, AudioBuffer>();
export const noiseBuffer = (ctx: AudioContext): AudioBuffer => {
  const cached = noiseCache.get(ctx);
  if (cached) return cached;
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noiseCache.set(ctx, buffer);
  return buffer;
};

export const midiToFrequency = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);
