// Rough English syllable counter: good enough to feel the rhythm of a line
const cache = new Map<string, number>();

export const countSyllables = (rawWord: string): number => {
  const word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  const cached = cache.get(word);
  if (cached !== undefined) return cached;
  if (word.length <= 3) {
    cache.set(word, 1);
    return 1;
  }
  let w = word.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  if (!w) w = word;
  const groups = w.match(/[aeiouy]{1,2}/g);
  // A trailing "-le" ("table", "little") keeps its e, so it's already counted
  const result = Math.max(1, groups ? groups.length : 1);
  cache.set(word, result);
  return result;
};

export const lineSyllables = (line: string): number =>
  line
    .split(/\s+/)
    .filter(Boolean)
    .reduce((sum, w) => sum + countSyllables(w), 0);
