// Simple spelling-based rhyme detection: good enough to spot end rhymes in free verse

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

// Returns, for each line index that rhymes with at least one other line, its rhyme group
export const rhymeGroups = (text: string): Map<number, number> => {
  const groups: string[][] = [];
  const lineGroup = new Map<number, number>();
  text.split("\n").forEach((line, idx) => {
    const word = lastWord(line);
    if (!word) return;
    const end = rhymeSound(word);
    if (!end) return;
    let group = groups.findIndex((g) => g.some((e) => rhymes(e, end)));
    if (group === -1) {
      groups.push([end]);
      group = groups.length - 1;
    } else {
      groups[group].push(end);
    }
    lineGroup.set(idx, group);
  });
  const result = new Map<number, number>();
  for (const [line, group] of lineGroup) if (groups[group].length >= 2) result.set(line, group);
  return result;
};

// Share of non-empty lines whose last word rhymes with another line's (0 to 1)
export const rhymeDensity = (text: string): number => {
  const lines = text.split("\n").filter((l) => lastWord(l) !== null);
  if (lines.length === 0) return 0;
  return rhymeGroups(text).size / lines.length;
};

// Letters for each line's rhyme sound: rhyming lines share a letter, others get their own.
// Blank lines are null so stanzas stay visible ("ABAB CDCD").
export const rhymeLetters = (text: string): Array<string | null> => {
  const groups = rhymeGroups(text);
  const letterForGroup = new Map<number, string>();
  let next = 0;
  const nextLetter = () => {
    const n = next++;
    return n < 26 ? String.fromCharCode(65 + n) : `${String.fromCharCode(65 + (n % 26))}${Math.floor(n / 26)}`;
  };
  return text.split("\n").map((line, i) => {
    if (lastWord(line) === null) return null;
    const group = groups.get(i);
    if (group === undefined) return nextLetter();
    if (!letterForGroup.has(group)) letterForGroup.set(group, nextLetter());
    return letterForGroup.get(group) ?? null;
  });
};

export const rhymeSchemeText = (text: string): string =>
  rhymeLetters(text)
    .map((l) => l ?? " ")
    .join("")
    .replace(/ +/g, " ")
    .trim();
