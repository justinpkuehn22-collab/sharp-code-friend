import { isWritten, moods, type Mood, type Poem } from "@/data/poems";
import { writingPrompts, type WritingPrompt } from "@/data/writing-prompts";

// Small seeded shuffle so "Show me others" gives a fresh, repeatable set
const seeded = (seed: number) => {
  let x = seed || 1;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
};

const shuffle = <T,>(items: T[], seed: number): T[] => {
  const rand = seeded(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Moods ordered from least written to most, so suggestions nudge toward new ground
export const leastWrittenMoods = (poems: Poem[]): Mood[] => {
  const written = poems.filter(isWritten);
  const counts = new Map<Mood, number>(moods.map((m) => [m, 0]));
  for (const p of written) if (p.mood) counts.set(p.mood, (counts.get(p.mood) ?? 0) + 1);
  return [...moods].sort((a, b) => (counts.get(a) ?? 0) - (counts.get(b) ?? 0));
};

// Picks prompts for a mood, or (with no mood) one each from the least-written moods
export const pickPrompts = (poems: Poem[], mood: Mood | null, count: number, seed: number): WritingPrompt[] => {
  if (mood) return shuffle(writingPrompts.filter((p) => p.mood === mood), seed).slice(0, count);
  const order = leastWrittenMoods(poems);
  // Rotate which under-written moods lead, so each shuffle shows different themes
  const start = seed % Math.max(1, Math.min(order.length, 4));
  const rotated = [...order.slice(start), ...order.slice(0, start)];
  return rotated
    .slice(0, count)
    .map((m, i) => shuffle(writingPrompts.filter((p) => p.mood === m), seed + i)[0])
    .filter((p): p is WritingPrompt => p !== undefined);
};
