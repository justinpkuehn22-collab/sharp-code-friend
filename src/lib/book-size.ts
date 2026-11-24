import type { Poem } from "@/data/poems";

const wordCount = (text: string) => (text.match(/\S+/g) ?? []).length;

// Each book's size from 0 (the shortest poem on the shelf) to 1 (the longest), on a
// gentle log scale so one epic doesn't flatten every other book
export const bookSizes = (poems: Poem[]): Map<string, number> => {
  const counts = poems.map((p) => [p.id, Math.log(1 + wordCount(p.content))] as const);
  if (counts.length === 0) return new Map();
  const values = counts.map(([, c]) => c);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return new Map(counts.map(([id, c]) => [id, max - min < 0.01 ? 0.5 : (c - min) / (max - min)]));
};

// Spine height and width in pixels for a size between 0 and 1
export const spineDimensions = (size: number, jitter: number) => ({
  height: Math.round(112 + size * 88 + jitter * 8 - 4),
  width: Math.round(34 + size * 26 + jitter * 4 - 2),
});
