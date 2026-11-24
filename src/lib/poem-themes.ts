// Finds poems that share a poem's themes: what they're about (love, loss, night, home...)
// and the images they lean on, so the critique can show kindred poems to read next.
import { stopWords } from "@/data/craft-lexicon";

export const themeWords: Record<string, string[]> = {
  love: ["love", "lover", "beloved", "kiss", "heart", "darling", "desire", "embrace", "rose", "sweet", "adore", "passion", "cupbearer"],
  heartbreak: ["heartbreak", "broken", "betray", "lies", "lie", "deceive", "deceived", "leave", "left", "gone", "goodbye", "apart", "jealousy", "hate"],
  grief: ["grief", "mourn", "tears", "weep", "cry", "loss", "lost", "death", "dead", "die", "grave", "tomb", "funeral", "sorrow"],
  longing: ["longing", "miss", "far", "away", "distant", "return", "separation", "parting", "wait", "waiting", "letter", "yearn"],
  home: ["home", "homeland", "native", "village", "house", "door", "family", "mother", "father", "country", "exile"],
  night: ["night", "moon", "moonlight", "stars", "dark", "darkness", "midnight", "shadow", "shadows", "sleep", "dream", "dreams"],
  nature: ["tree", "trees", "flower", "flowers", "blossom", "leaves", "hill", "hills", "mountain", "forest", "wood", "grass", "moss", "bird", "birds", "frog", "spring", "autumn", "winter", "rain", "wind"],
  sea: ["sea", "ocean", "wave", "waves", "river", "water", "storm", "sail", "shore", "stream", "pond"],
  time: ["time", "years", "days", "hour", "clock", "age", "old", "older", "forever", "eternal", "season", "seasons", "tomorrow", "yesterday"],
  anger: ["anger", "angry", "rage", "fury", "wrath", "fight", "war", "enemy", "foe", "sword", "spear", "blood", "fire"],
  hope: ["hope", "light", "dawn", "sun", "rise", "faith", "pray", "heaven", "believe", "soul", "freedom", "free"],
  self: ["myself", "mirror", "monster", "who", "become", "face", "mask", "reflection", "identity", "alone", "lonely", "nobody"],
  conflict: ["cage", "bars", "prison", "trapped", "chains", "bonds", "struggle", "torment", "agony"],
};

const themeOf = new Map<string, string>();
for (const [theme, words] of Object.entries(themeWords)) for (const w of words) if (!themeOf.has(w)) themeOf.set(w, theme);

// "flowers" -> "flower", "weeping" -> "weep", "loved" -> "love"
const stem = (w: string): string => {
  if (themeOf.has(w)) return w;
  for (const [suffix, back] of [["ies", "y"], ["ing", ""], ["ed", ""], ["es", ""], ["s", ""]] as const) {
    if (w.length > suffix.length + 2 && w.endsWith(suffix)) {
      const base = w.slice(0, -suffix.length) + back;
      if (themeOf.has(base)) return base;
      if (themeOf.has(`${base}e`)) return `${base}e`;
    }
  }
  return w;
};

const words = (text: string) => (text.toLowerCase().match(/[a-z']+/g) ?? []).map((w) => w.replace(/^'+|'+$/g, "")).filter((w) => w.length > 2 && !stopWords.has(w)).map(stem);

export interface ThemeProfile {
  themes: Map<string, number>; // theme -> share of the poem's theme words
  vocabulary: Set<string>;
}

export const themeProfile = (text: string, extraThemes: string[] = []): ThemeProfile => {
  const list = words(text);
  const counts = new Map<string, number>();
  for (const w of list) {
    const t = themeOf.get(w);
    if (t) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  // Moods and tags the writer chose count as strong signals
  for (const t of extraThemes) if (themeWords[t]) counts.set(t, (counts.get(t) ?? 0) + 2);
  const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
  return { themes: new Map([...counts].map(([t, n]) => [t, n / total])), vocabulary: new Set(list) };
};

export interface Kinship {
  score: number; // 0 to 1
  shared: string[]; // themes both poems lean on, strongest first
  echoes: string[]; // words both poems use
}

export const kinship = (a: ThemeProfile, b: ThemeProfile): Kinship => {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const v of a.themes.values()) na += v * v;
  for (const v of b.themes.values()) nb += v * v;
  const shared: Array<[string, number]> = [];
  for (const [t, v] of a.themes) {
    const w = b.themes.get(t);
    if (w) {
      dot += v * w;
      shared.push([t, Math.min(v, w)]);
    }
  }
  const cosine = na && nb ? dot / Math.sqrt(na * nb) : 0;
  const echoes = [...a.vocabulary].filter((w) => b.vocabulary.has(w) && themeOf.has(w));
  const overlap = Math.min(1, echoes.length / 4);
  return {
    score: cosine * 0.75 + overlap * 0.25,
    shared: shared.sort((x, y) => y[1] - x[1]).map(([t]) => t).slice(0, 3),
    echoes: echoes.slice(0, 4),
  };
};

export interface Candidate<T> {
  item: T;
  text: string;
  themes?: string[];
}

// The closest poems, best first, skipping anything with nothing in common
export const kindredPoems = <T,>(text: string, themes: string[], candidates: Array<Candidate<T>>, limit = 8): Array<{ item: T; kinship: Kinship }> => {
  const me = themeProfile(text, themes);
  return candidates
    .map((c) => ({ item: c.item, kinship: kinship(me, themeProfile(c.text, c.themes ?? [])) }))
    .filter((r) => r.kinship.score >= 0.2 && r.kinship.shared.length > 0)
    .sort((a, b) => b.kinship.score - a.kinship.score)
    .slice(0, limit);
};
