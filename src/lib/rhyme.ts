// Rhyme detection for line endings. Sound-based (see rhyme-sounds.ts), with a spelling
// check as a back-up so eye rhymes like "love" / "move" still count as slant.
import { classifyRhyme, lineEnding, rhymeKindOrder, type RhymeKind } from "@/lib/rhyme-sounds";

const ending = (word: string): string => {
  const clean = word.replace(/[^a-z]/gi, "").toLowerCase();
  if (clean.length <= 2) return clean;
  return clean.length <= 4 ? clean.slice(-2) : clean.slice(-3);
};

export const lastWord = (line: string): string | null => {
  const words = line.trim().split(/\s+/).filter((w) => /[a-z]/i.test(w));
  return words.length > 0 ? words[words.length - 1] : null;
};

// Spellings that sound the same at the end of a word, so "grey" rhymes with "stay"
const soundAlikes: Array<[RegExp, string]> = [
  [/eigh$|ey$|aigh$/, "ay"],
  [/ight$|yte$|ite$/, "ite"],
  [/ies$|ise$|yse$/, "ize"],
  [/ire$|yre$|ier$/, "ire"],
  [/oor$|our$|oar$|ore$|or$/, "ore"],
  [/ain$|ane$|eign$/, "ane"],
  [/aim$|ame$/, "ame"],
  [/ue$|ew$|oo$|ough$|ou$/, "oo"],
  [/ee$|ea$|ie$|ey$|e$/, "ee"],
  [/eal$|eel$|ele$/, "eel"],
  [/eam$|eem$|eme$/, "eem"],
  [/ear$|eer$|ere$|ier$/, "eer"],
  [/oan$|one$/, "one"],
  [/oal$|ole$|oll$|owl$/, "ole"],
  [/oat$|ote$/, "ote"],
  [/air$|are$|ear$|ere$/, "air"],
];

// A rough "sound" of a word's ending, used to match rhymes spelled differently
export const rhymeSound = (word: string): string => {
  const raw = word.replace(/[^a-z]/gi, "").toLowerCase();
  if (/ies$/.test(raw)) return "ize";
  // Plurals rhyme like their singular: "yours" with "score"
  const clean = raw.length > 3 ? raw.replace(/([^su])s$/, "$1") : raw;
  // Only short words take the "-ey"/"-e" as long vowels (grey, they, me, be)
  for (const [pattern, sound] of soundAlikes) {
    if ((sound === "ee" || sound === "ay") && clean.length > 5 && /ey$/.test(clean)) continue;
    if (sound === "ee" && /[^aeiou]e$/.test(clean) && clean.length > 3) continue;
    if (pattern.test(clean)) return sound;
  }
  return ending(clean);
};

const rhymes = (a: string, b: string): boolean => a === b || (a.length >= 2 && b.length >= 2 && a.slice(-2) === b.slice(-2));

export interface LineRhyme {
  // Letter in the rhyme scheme; null for blank lines
  letter: string | null;
  // Shared by lines that rhyme; null if the line rhymes with nothing
  group: number | null;
  // How this line rhymes with its partners: the strongest kind it has
  kind: RhymeKind | null;
}

const strength = (k: RhymeKind | null) => (k ? rhymeKindOrder.length - rhymeKindOrder.indexOf(k) : 0);

const pairKind = (a: string, b: string): RhymeKind | null => {
  const ea = lineEnding(a);
  const eb = lineEnding(b);
  const bySound = ea && eb ? classifyRhyme(ea, eb) : null;
  if (bySound) return bySound;
  const wa = lastWord(a);
  const wb = lastWord(b);
  // Spelled alike: an eye rhyme, which poets count as slant
  if (wa && wb && rhymes(rhymeSound(wa), rhymeSound(wb))) return "slant";
  return null;
};

const cache = new Map<string, LineRhyme[]>();

// Every line's rhyme letter, group and kind
export const analyzeRhymes = (text: string): LineRhyme[] => {
  const cached = cache.get(text);
  if (cached) return cached;
  const lines = text.split("\n");
  const groupOf: Array<number | null> = lines.map(() => null);
  const kindOf: Array<RhymeKind | null> = lines.map(() => null);
  let nextGroup = 0;
  const written = lines.map((l) => lastWord(l) !== null);

  lines.forEach((line, i) => {
    if (!written[i]) return;
    let best: { j: number; kind: RhymeKind } | null = null;
    for (let j = i - 1; j >= 0; j--) {
      if (!written[j]) continue;
      const kind = pairKind(line, lines[j]);
      if (kind && (!best || strength(kind) > strength(best.kind))) best = { j, kind };
    }
    if (best) {
      const g = groupOf[best.j] ?? nextGroup++;
      groupOf[best.j] = g;
      groupOf[i] = g;
      kindOf[i] = best.kind;
      if (strength(best.kind) > strength(kindOf[best.j])) kindOf[best.j] = best.kind;
    }
  });

  // Letters in order of appearance; lines that rhyme with nothing get a letter of their own
  const letterForGroup = new Map<number, string>();
  let next = 0;
  const nextLetter = () => {
    const n = next++;
    return n < 26 ? String.fromCharCode(65 + n) : `${String.fromCharCode(65 + (n % 26))}${Math.floor(n / 26)}`;
  };
  const result = lines.map((_, i): LineRhyme => {
    if (!written[i]) return { letter: null, group: null, kind: null };
    const g = groupOf[i];
    if (g === null) return { letter: nextLetter(), group: null, kind: null };
    if (!letterForGroup.has(g)) letterForGroup.set(g, nextLetter());
    return { letter: letterForGroup.get(g) ?? null, group: g, kind: kindOf[i] };
  });
  if (cache.size > 200) cache.clear();
  cache.set(text, result);
  return result;
};

// For each line that rhymes with at least one other line, its rhyme group
export const rhymeGroups = (text: string): Map<number, number> => {
  const groups = new Map<number, number>();
  analyzeRhymes(text).forEach((r, i) => {
    if (r.group !== null) groups.set(i, r.group);
  });
  return groups;
};

// Share of non-empty lines whose ending rhymes, in any way, with another line's (0 to 1)
export const rhymeDensity = (text: string): number => {
  const lines = text.split("\n").filter((l) => lastWord(l) !== null);
  if (lines.length === 0) return 0;
  return rhymeGroups(text).size / lines.length;
};

// Letters for each line's rhyme sound; blank lines are null so stanzas stay visible
export const rhymeLetters = (text: string): Array<string | null> => analyzeRhymes(text).map((r) => r.letter);

export const rhymeSchemeText = (text: string): string =>
  rhymeLetters(text)
    .map((l) => l ?? " ")
    .join("")
    .replace(/ +/g, " ")
    .trim();

// How many lines rhyme in each way
export const rhymeKindCounts = (text: string): Record<RhymeKind, number> => {
  const counts: Record<RhymeKind, number> = { perfect: 0, multi: 0, slant: 0, consonance: 0 };
  for (const r of analyzeRhymes(text)) if (r.kind) counts[r.kind]++;
  return counts;
};

const smallEndings = new Set(["it", "em", "a", "an", "the", "of", "to"]);

// Splits a line into what comes before its rhyming ending, the ending itself and any
// trailing dashes, punctuation or spaces, so head + end + tail is exactly the line.
// The ending is the last word, or the last two when it ends on a small word ("hold it").
export const splitEnding = (line: string): { head: string; end: string; tail: string } => {
  const match = /^([\s\S]*?)(\S*[A-Za-z]\S*)((?:\s+[^A-Za-z\s]+)*\s*)$/.exec(line);
  if (!match) return { head: line, end: "", tail: "" };
  let [, head, end] = match;
  const tail = match[3];
  if (smallEndings.has(end.toLowerCase().replace(/[^a-z]/g, ""))) {
    const before = /^([\s\S]*?)(\S*[A-Za-z]\S*\s+)$/.exec(head);
    if (before) {
      head = before[1];
      end = before[2] + end;
    }
  }
  return { head, end, tail };
};
