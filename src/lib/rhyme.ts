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

const rhymes = (a: string, b: string): boolean => a === b || (a.length >= 2 && b.length >= 2 && a.slice(-2) === b.slice(-2));

// Returns, for each line index that rhymes with at least one other line, its rhyme group
export const rhymeGroups = (text: string): Map<number, number> => {
  const groups: string[][] = [];
  const lineGroup = new Map<number, number>();
  text.split("\n").forEach((line, idx) => {
    const word = lastWord(line);
    if (!word) return;
    const end = ending(word);
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
