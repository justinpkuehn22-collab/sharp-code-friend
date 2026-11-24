// Line-by-line coaching for one poem: what to try on specific lines, with concrete
// options, and examples from famous poems chosen to fit what this poem needs.
import { abstractWords, cliches, fillerWords, tellingPatterns } from "@/data/craft-lexicon";
import { imageIdeasFor } from "@/data/image-bank";
import { mastersFor, type MasterExample } from "@/data/master-examples";
import { analyzeRhymes, lastWord } from "@/lib/rhyme";
import type { ElementId } from "@/lib/poem-critique";

export type LineNoteKind = "image" | "cliche" | "telling" | "filler" | "rhyme" | "ending";

export interface LineNote {
  kind: LineNoteKind;
  lineNumber: number; // 1-based, counting every line including blanks
  line: string;
  title: string;
  detail: string;
  // Concrete options: images to try, or a tightened version of the line
  ideas: string[];
  // When set, the panel looks up words that rhyme with this one
  rhymeWith?: string;
}

// A small, stable number for a poem, so the same poem gets the same picks
// and different poems get different ones
export const seedOf = (text: string): number => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// A seeded shuffle: deterministic for a seed, different across seeds
export const shuffled = <T,>(items: T[], seed: number): T[] => {
  const out = [...items];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const wordsOf = (line: string) => line.toLowerCase().match(/[a-z']+/g) ?? [];
const weakEndings = new Set(["to", "the", "a", "an", "and", "but", "of", "for", "with", "that", "is", "was"]);
const clean = (w: string) => w.toLowerCase().replace(/[^a-z'-]/g, "").replace(/^'+|'+$/g, "");

// The line with its filler words taken out, tidied up
const withoutFiller = (line: string): string =>
  line
    .replace(/\b(very|really|just|truly|totally|simply|actually|literally|basically|quite|rather|somewhat)\s+/gi, "")
    .replace(/\bso\s+(?=[a-z]+\b)/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();

export const lineNotes = (text: string, variation = 0): LineNote[] => {
  const all = text.split("\n");
  const rhymes = analyzeRhymes(text);
  const written = all.map((l, i) => ({ line: l, i })).filter(({ line }) => lastWord(line) !== null);
  const rhymedShare = written.length ? written.filter(({ i }) => rhymes[i]?.kind).length / written.length : 0;
  const seed = seedOf(text) + variation * 7919;
  const notes: LineNote[] = [];

  written.forEach(({ line, i }) => {
    const words = wordsOf(line);
    const lower = line.toLowerCase();
    const lineNumber = i + 1;

    const cliche = cliches.find((c) => lower.includes(c));
    if (cliche) {
      notes.push({
        kind: "cliche",
        lineNumber,
        line,
        title: `“${cliche}” has been said many times`,
        detail: "Readers skim familiar phrases. Ask what you actually saw or heard in that moment, and say that instead.",
        ideas: [],
      });
    }

    if (tellingPatterns.some((p) => p.test(line))) {
      notes.push({
        kind: "telling",
        lineNumber,
        line,
        title: "This line names the feeling",
        detail: "Show what you did, saw or couldn't stop doing while you felt it, and the reader will feel it without being told.",
        ideas: [],
      });
    }

    const abstract = words.find((w) => abstractWords.has(w) && imageIdeasFor(w).length > 0);
    if (abstract) {
      notes.push({
        kind: "image",
        lineNumber,
        line,
        title: `Picture “${abstract}” instead of naming it`,
        detail: `“${abstract}” asks the reader to take your word for it. An object or moment lets them see it. Some starting points, swap in the real one from your life:`,
        ideas: shuffled(imageIdeasFor(abstract), seed + i).slice(0, 3),
      });
    }

    const fillers = Array.from(new Set(words.filter((w) => fillerWords.has(w))));
    if (fillers.length) {
      const tighter = withoutFiller(line);
      if (tighter && tighter !== line.trim()) {
        notes.push({
          kind: "filler",
          lineNumber,
          line,
          title: `Cut ${fillers.slice(0, 2).map((f) => `“${f}”`).join(" and ")}`,
          detail: "Small intensifiers soften a line. See if it hits harder without them:",
          ideas: [tighter],
        });
      }
    }

    const end = clean(lastWord(line) ?? "");
    if (weakEndings.has(end)) {
      notes.push({
        kind: "ending",
        lineNumber,
        line,
        title: `The line ends on “${end}”`,
        detail: "The last word of a line gets the most weight. Break the line earlier, or reorder it so it ends on the strongest word.",
        ideas: [],
      });
    }

    // In a poem that rhymes, a line that rhymes with nothing stands out
    if (rhymedShare >= 0.3 && !rhymes[i]?.kind && !weakEndings.has(end)) {
      // Its partner: the line before it in the same stanza, or else the one after
      const sameStanza = (from: number, step: number) => {
        for (let j = from + step; j >= 0 && j < all.length; j += step) {
          if (all[j].trim() === "") return null;
          if (lastWord(all[j]) !== null) return { line: all[j], i: j };
        }
        return null;
      };
      const partner = sameStanza(i, -1) ?? sameStanza(i, 1);
      const target = partner ? clean(lastWord(partner.line) ?? "") : "";
      if (target.length > 1) {
        notes.push({
          kind: "rhyme",
          lineNumber,
          line,
          title: `“${end}” doesn't rhyme with anything`,
          detail: `The poem rhymes elsewhere, so this ending stands out. If that isn't on purpose, try ending on a word that rhymes or nearly rhymes with “${target}”:`,
          ideas: [],
          rhymeWith: target,
        });
      }
    }
  });

  // One note per line; rarer, more useful kinds first, then a seeded mix so each poem
  // (and each "other ideas" press) gets a different selection
  const rank: Record<LineNoteKind, number> = { cliche: 0, telling: 1, image: 2, rhyme: 3, ending: 4, filler: 5 };
  const picked: LineNote[] = [];
  const usedLines = new Set<number>();
  const usedKinds = new Map<LineNoteKind, number>();
  const ordered = shuffled(notes, seed).sort((a, b) => rank[a.kind] - rank[b.kind]);
  // First pass: variety across kinds; second pass fills any space left
  for (const pass of [1, 3]) {
    for (const note of ordered) {
      if (picked.length >= 5) break;
      if (usedLines.has(note.lineNumber) || (usedKinds.get(note.kind) ?? 0) >= pass) continue;
      picked.push(note);
      usedLines.add(note.lineNumber);
      usedKinds.set(note.kind, (usedKinds.get(note.kind) ?? 0) + 1);
    }
  }
  return picked.sort((a, b) => a.lineNumber - b.lineNumber);
};

export interface MasterLesson extends MasterExample {
  tryIt: string; // with the writer's own line filled in
}

// A famous passage that shows the move a weak element needs, with an exercise on the writer's line
export const masterLesson = (element: ElementId, line: string | undefined, seed: number): MasterLesson | null => {
  const options = mastersFor(element);
  if (!options.length) return null;
  const pick = options[seed % options.length];
  const quoted = (line ?? "").trim();
  const short = quoted.length > 70 ? `${quoted.slice(0, 67).trimEnd()}…` : quoted;
  return {
    ...pick,
    tryIt: short ? pick.tryIt.replace("{line}", short) : pick.tryIt.replace(/“\{line\}”/g, "your strongest line").replace("{line}", "your strongest line"),
  };
};
