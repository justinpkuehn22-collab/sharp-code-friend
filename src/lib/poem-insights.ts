import { isWritten, moods, type Mood, type Poem } from "@/data/poems";
import { rhymeDensity } from "@/lib/rhyme";

const stopWords = new Set(
  (
    "a an and are as at be been but by can could did do does don't for from had has have he her his how i i'd i'll i'm i've if in into is it it's its just like me my no not now of on once one or our out she so some than that the their them then there they this to too up us was we were what when where which while who why will with would you you're your yet all am any been being cause did each even ever every got let made more much must never only own same should since such these those through under very what's"
  ).split(" "),
);

export const words = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[’]/g, "'")
    .split(/[^a-z']+/)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter(Boolean);

export interface PoemStat {
  id: string;
  title: string;
  words: number;
  lines: number;
}

export interface LibraryInsights {
  poemCount: number;
  totalWords: number;
  totalLines: number;
  averageWords: number;
  averageRhymeDensity: number;
  longest: PoemStat | null;
  shortest: PoemStat | null;
  mostRhymed: (PoemStat & { density: number }) | null;
  topWords: Array<{ word: string; count: number }>;
  moodMix: Array<{ mood: Mood; count: number }>;
  untaggedCount: number;
  noMoodCount: number;
}

export const lineCount = (text: string): number => text.split("\n").filter((l) => l.trim() !== "").length;

export const computeInsights = (allPoems: Poem[], topWordLimit = 12): LibraryInsights => {
  const poems = allPoems.filter(isWritten);
  const stats = poems.map((p) => ({
    id: p.id,
    title: p.title.trim() || "Untitled",
    words: words(p.content).length,
    lines: lineCount(p.content),
    density: rhymeDensity(p.content),
  }));

  const counts = new Map<string, number>();
  for (const p of poems) {
    for (const w of words(p.content)) {
      if (w.length < 3 || stopWords.has(w)) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
  }

  const totalWords = stats.reduce((sum, s) => sum + s.words, 0);
  const bySize = [...stats].sort((a, b) => b.words - a.words);
  const byRhyme = [...stats].sort((a, b) => b.density - a.density);
  const strip = ({ id, title, words: w, lines }: PoemStat): PoemStat => ({ id, title, words: w, lines });

  return {
    poemCount: poems.length,
    totalWords,
    totalLines: stats.reduce((sum, s) => sum + s.lines, 0),
    averageWords: poems.length ? totalWords / poems.length : 0,
    averageRhymeDensity: poems.length ? stats.reduce((sum, s) => sum + s.density, 0) / poems.length : 0,
    longest: bySize[0] ? strip(bySize[0]) : null,
    shortest: bySize.length ? strip(bySize[bySize.length - 1]) : null,
    mostRhymed: byRhyme[0] ? { ...strip(byRhyme[0]), density: byRhyme[0].density } : null,
    topWords: Array.from(counts, ([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
      .slice(0, topWordLimit),
    moodMix: moods
      .map((mood) => ({ mood, count: poems.filter((p) => p.mood === mood).length }))
      .filter((m) => m.count > 0),
    untaggedCount: poems.filter((p) => p.tags.length === 0).length,
    noMoodCount: poems.filter((p) => !p.mood).length,
  };
};

// European formatting, per the project's style rules: 1.234 and 12,5
export const formatNumber = (value: number, decimals = 0): string =>
  new Intl.NumberFormat("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

export const formatPercent = (ratio: number): string => `${formatNumber(ratio * 100, 0)} %`;
