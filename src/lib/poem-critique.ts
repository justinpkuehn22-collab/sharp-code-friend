// Reads a poem the way a workshop would: eight craft elements, each scored from patterns
// in the words, with the lines that earned or cost the score quoted back.
import {
  abstractWords,
  archetypalSymbols,
  cliches,
  concreteNouns,
  fillerWords,
  sensoryWords,
  stopWords,
  tellingPatterns,
  type Sense,
} from "@/data/craft-lexicon";
import { analyzeRhymes, rhymeKindCounts, rhymeSchemeText } from "@/lib/rhyme";
import { rhymeKindLabels, type RhymeKind } from "@/lib/rhyme-sounds";
import { lineSyllables } from "@/lib/syllables";
import { lineNotes, masterLesson, seedOf, type LineNote, type MasterLesson } from "@/lib/critique-coach";

export type ElementId = "imagery" | "figurative" | "symbolism" | "sound" | "rhythm" | "diction" | "structure" | "voice";

export interface ElementScore {
  id: ElementId;
  label: string;
  score: number; // 0 to 10, one decimal
  summary: string; // one line on what the score is based on
  evidence: string[]; // words or lines from the poem
}

export interface Badge {
  id: string;
  label: string;
  reason: string;
}

export interface Tip {
  element: ElementId;
  title: string;
  detail: string;
  quote?: string;
  // A famous passage that shows the move, with an exercise on the writer's own line
  master?: MasterLesson | null;
}

export interface Critique {
  overall: number;
  rhymeBlurb: string;
  scheme: string;
  elements: ElementScore[];
  badges: Badge[];
  tips: Tip[];
  // Specific lines worth another look, with options to try
  lineNotes: LineNote[];
  analyzedText: string;
}

export const elementLabels: Record<ElementId, string> = {
  imagery: "Imagery",
  figurative: "Figurative language",
  symbolism: "Symbolism",
  sound: "Sound & rhyme",
  rhythm: "Rhythm & flow",
  diction: "Fresh language",
  structure: "Structure",
  voice: "Voice & detail",
};

const clamp = (n: number) => Math.round(Math.max(0, Math.min(10, n)) * 10) / 10;

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[’]/g, "'")
    .split(/[^a-z']+/)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter(Boolean);

const contentLines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /[a-z]/i.test(l));

const stanzasOf = (text: string): string[][] =>
  text
    .trim()
    .split(/\n\s*\n/)
    .map((s) => s.split("\n").map((l) => l.trim()).filter((l) => /[a-z]/i.test(l)))
    .filter((s) => s.length > 0);

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const isConcrete = (w: string) =>
  concreteNouns.has(w) || (Object.values(sensoryWords) as Set<string>[]).some((set) => set.has(w));

// ---------- Rhyme blurb ----------

const relabel = (letters: string[]) => {
  const map = new Map<string, string>();
  return letters
    .map((l) => {
      if (!map.has(l)) map.set(l, String.fromCharCode(65 + map.size));
      return map.get(l);
    })
    .join("");
};

const schemeName = (pattern: string): string | null => {
  if (pattern.length < 2) return null;
  if (/^(AA)+$/.test(pattern.replace(/(.)\1/g, "AA")) && /^(?:(.)\1)+$/.test(pattern)) return "couplets";
  if (pattern === "ABAB" || pattern === "ABABCDCD".slice(0, pattern.length)) return "alternating rhyme";
  if (pattern === "ABCB") return "ballad rhyme";
  if (pattern === "ABBA") return "enclosed rhyme";
  if (/^A+$/.test(pattern)) return "a single sustained rhyme";
  if (pattern === "AABA") return "Rubaiyat rhyme";
  if (pattern === "AABB") return "couplets";
  return null;
};

export const describeRhyme = (text: string): string => {
  const rhymes = analyzeRhymes(text);
  const written = rhymes.filter((r) => r.letter !== null);
  if (written.length < 2) return "Too short to have a rhyme scheme yet.";
  const rhyming = written.filter((r) => r.kind !== null);
  const share = rhyming.length / written.length;
  const counts = rhymeKindCounts(text);

  // Each stanza's scheme, relabelled to start at A, and named when it's a known form
  const stanzaPatterns: string[] = [];
  let current: string[] = [];
  rhymes.forEach((r) => {
    if (r.letter === null) {
      if (current.length) stanzaPatterns.push(relabel(current));
      current = [];
    } else current.push(r.letter);
  });
  if (current.length) stanzaPatterns.push(relabel(current));
  const named = stanzaPatterns.map(schemeName);
  const formCounts = new Map<string, number>();
  named.forEach((n) => n && formCounts.set(n, (formCounts.get(n) ?? 0) + 1));
  const topForm = [...formCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const dominant = topForm !== undefined && topForm[1] >= Math.max(1, Math.ceil(stanzaPatterns.length / 2));
  const kinds = (Object.keys(counts) as RhymeKind[]).filter((k) => counts[k] > 0).sort((a, b) => counts[b] - counts[a]);
  const pct = Math.round(share * 100);

  const parts: string[] = [];
  if (share === 0) {
    parts.push("This poem is free verse: no line endings rhyme, so its music has to come from rhythm and repetition.");
  } else if (share < 0.35) {
    parts.push(`Rhyme is an accent here, not a frame: ${pct}% of lines rhyme, scattered rather than patterned.`);
  } else if (dominant && topForm) {
    parts.push(`Most stanzas settle into ${topForm[0]} (${stanzaPatterns.filter((_, i) => named[i] === topForm[0]).slice(0, 1).join("")}), and ${pct}% of your lines rhyme.`);
  } else {
    parts.push(`${pct}% of your lines rhyme, but the pattern shifts from stanza to stanza (${stanzaPatterns.slice(0, 4).join(" · ")}), so the rhymes land when they're needed rather than on a fixed beat.`);
  }

  if (kinds.length > 0) {
    const lead = kinds[0];
    const feel: Record<RhymeKind, string> = {
      perfect: "which gives the lines a firm, song-like click",
      multi: "which gives it a rolling, lyrical feel like a verse in a song",
      slant: "which keeps the sound loose and conversational instead of sing-song",
      consonance: "which ties lines together quietly through their closing consonants",
    };
    parts.push(`The rhymes lean on ${rhymeKindLabels[lead].toLowerCase()}s, ${feel[lead]}.`);
    if (kinds.length >= 3) parts.push("Mixing several kinds of rhyme like this is a sign of a trained ear.");
  }

  // A stanza that breaks the pattern
  if (dominant && topForm) {
    const breaker = named.findIndex((n, i) => n !== topForm[0] && stanzaPatterns[i].length >= 3);
    if (breaker >= 0) parts.push(`Stanza ${breaker + 1} breaks the pattern (${stanzaPatterns[breaker]}); make sure that shift is doing something.`);
  }
  return parts.join(" ");
};

// ---------- The eight elements ----------

const scoreImagery = (text: string, lines: string[]): { score: ElementScore; senses: Sense[]; flattest: string | null } => {
  const words = tokenize(text);
  const found: string[] = [];
  const senses = new Set<Sense>();
  for (const w of words) {
    for (const [sense, set] of Object.entries(sensoryWords) as Array<[Sense, Set<string>]>) {
      if (set.has(w)) {
        senses.add(sense);
        found.push(w);
      }
    }
    if (concreteNouns.has(w)) found.push(w);
  }
  const concrete = unique(found);
  const perLine = found.length / Math.max(1, lines.length);
  // Lines with no concrete word at all
  const flatLines = lines.filter((l) => !tokenize(l).some(isConcrete));
  const flattest = flatLines.sort((a, b) => tokenize(b).filter((w) => abstractWords.has(w)).length - tokenize(a).filter((w) => abstractWords.has(w)).length)[0] ?? null;
  const score = clamp(1.5 + perLine * 5 + senses.size * 0.8 - (flatLines.length / Math.max(1, lines.length)) * 1.5);
  return {
    score: {
      id: "imagery",
      label: elementLabels.imagery,
      score,
      summary: `${concrete.length} concrete or sensory words, reaching ${senses.size} of the 5 senses (${[...senses].join(", ") || "none"}).`,
      evidence: concrete.slice(0, 10),
    },
    senses: [...senses],
    flattest,
  };
};

const similePattern = /\b(like a|like an|like the|like my|as \w+ as)\b/i;
const metaphorPattern = /\b(i am|i'm|you are|you're|you were|i was|she was|he was|love is|life is|it was|is|was) (a|an|the|my|your) (\w+)/i;
const genitivePattern = /\b(the|a|my|your) (\w+) (of|to) (my|your|the) (\w+)/i;
// "Love is Electricity", "my reality is a casualty"
const bareMetaphorPattern = /\b(love|life|you|she|he|it|this|my \w+|your \w+)\s+(is|was|are|were)\s+(?:a |an |the |my |your |just )?(\w+)/i;
// "the animal I've become", "the monster you made me"
const becomePattern = /\bthe (\w+) (i've|i have|i|you've|you) (become|became|made)\b/i;
const figurativeNouns = new Set(["monster", "storm", "flame", "map", "cage", "abyss", "electricity", "casualty", "figment", "animal", "beast", "wolf", "ghost", "shadow", "mirror", "prison", "drug", "addiction", "fire", "ocean", "river", "home", "anchor", "poison", "knife", "war", "game", "mirage", "clover", "charm", "keeper", "thief", "stranger", "machine", "ruin", "wreck", "void"]);
const personifyPattern = /\b(love|silence|time|death|fate|hope|fear|pain|grief|night|darkness|the world|my heart|the heart|my mind|truth|lies|anger|loneliness|the city)\s+(whispers?|speaks?|screams?|calls?|sleeps?|breathes?|dances?|cries|laughs?|waits?|knows?|fades?|bleeds?|watches|holds?|swallows?|takes?|recoils?|lingers?|echo(e?s)?|builds?|reeks?|surges?)\b/i;

const scoreFigurative = (lines: string[], stanzaCount: number) => {
  const devices: Array<{ kind: string; line: string }> = [];
  for (const line of lines) {
    if (similePattern.test(line)) devices.push({ kind: "simile", line });
    const m = metaphorPattern.exec(line);
    if (m && (isConcrete(m[3].toLowerCase()) || figurativeNouns.has(m[3].toLowerCase()))) {
      devices.push({ kind: "metaphor", line });
    }
    const bare = bareMetaphorPattern.exec(line);
    if (bare && (figurativeNouns.has(bare[3].toLowerCase()) || (isConcrete(bare[3].toLowerCase()) && /love|life|reality|you|she|he/i.test(bare[1])))) {
      devices.push({ kind: "metaphor", line });
    }
    const become = becomePattern.exec(line);
    if (become && (figurativeNouns.has(become[1].toLowerCase()) || isConcrete(become[1].toLowerCase()))) devices.push({ kind: "metaphor", line });
    const g = genitivePattern.exec(line);
    if (g && isConcrete(g[2].toLowerCase()) && !isConcrete(g[5].toLowerCase())) devices.push({ kind: "metaphor", line });
    if (personifyPattern.test(line)) devices.push({ kind: "personification", line });
  }
  const distinct = unique(devices.map((d) => d.line));
  const perStanza = distinct.length / Math.max(1, stanzaCount);
  const kinds = unique(devices.map((d) => d.kind));
  const score = clamp(2.5 + perStanza * 4.5 + kinds.length * 0.8);
  return {
    id: "figurative" as const,
    label: elementLabels.figurative,
    score,
    summary: distinct.length
      ? `${distinct.length} figurative line${distinct.length === 1 ? "" : "s"} (${kinds.join(", ")}).`
      : "No similes, metaphors or personification spotted.",
    evidence: distinct.slice(0, 4),
  };
};

const scoreSymbolism = (text: string, stanzas: string[][]) => {
  const words = tokenize(text);
  const counts = new Map<string, number>();
  for (const w of words) if (concreteNouns.has(w) || archetypalSymbols[w]) counts.set(w, (counts.get(w) ?? 0) + 1);
  const recurring = [...counts.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
  const archetypes = unique(words.filter((w) => archetypalSymbols[w]));
  // An image that opens and closes the poem is doing symbolic work
  const firstWords = new Set(tokenize((stanzas[0] ?? []).join(" ")));
  const lastWords = new Set(tokenize((stanzas[stanzas.length - 1] ?? []).join(" ")));
  const bookends = [...firstWords].filter((w) => lastWords.has(w) && (concreteNouns.has(w) || archetypalSymbols[w]) && stanzas.length > 1);
  const score = clamp(2 + recurring.length * 1.6 + Math.min(3, archetypes.length * 0.6) + bookends.length * 1.5);
  const motifs = recurring.slice(0, 4).map(([w, c]) => `${w} ×${c}${archetypalSymbols[w] ? ` (${archetypalSymbols[w]})` : ""}`);
  return {
    element: {
      id: "symbolism" as const,
      label: elementLabels.symbolism,
      score,
      summary: recurring.length
        ? `${recurring.length} recurring image${recurring.length === 1 ? "" : "s"}${bookends.length ? `; "${bookends[0]}" opens and closes the poem` : ""}.`
        : archetypes.length
          ? `Symbolic images appear (${archetypes.slice(0, 3).join(", ")}) but none come back.`
          : "No image recurs or carries weight across the poem yet.",
      evidence: motifs.length ? motifs : archetypes.slice(0, 4),
    },
    recurring: recurring.map(([w]) => w),
    archetypes,
    bookends,
  };
};

const alliterationLines = (lines: string[]) =>
  lines.filter((line) => {
    const ws = tokenize(line).filter((w) => !stopWords.has(w) && w.length > 2);
    for (let i = 0; i < ws.length - 1; i++) {
      const a = ws[i][0];
      if (!/[aeiou]/.test(a) && (ws[i + 1][0] === a || ws[i + 2]?.[0] === a)) return true;
    }
    return false;
  });

const scoreSound = (text: string, lines: string[]) => {
  const rhymes = analyzeRhymes(text).filter((r) => r.letter !== null);
  const share = rhymes.filter((r) => r.kind).length / Math.max(1, rhymes.length);
  const counts = rhymeKindCounts(text);
  const kindsUsed = (Object.keys(counts) as RhymeKind[]).filter((k) => counts[k] > 0).length;
  const allit = alliterationLines(lines);
  // Repetition and refrains are music too
  const repeated = lines.filter((l, i) => lines.findIndex((x) => x.toLowerCase().replace(/[^a-z ]/g, "") === l.toLowerCase().replace(/[^a-z ]/g, "")) !== i);
  const score = clamp(2 + share * 4.5 + kindsUsed * 0.7 + (allit.length / Math.max(1, lines.length)) * 4 + Math.min(1, repeated.length * 0.5));
  return {
    id: "sound" as const,
    label: elementLabels.sound,
    score,
    summary: `${Math.round(share * 100)}% of lines rhyme using ${kindsUsed} kind${kindsUsed === 1 ? "" : "s"} of rhyme; ${allit.length} line${allit.length === 1 ? "" : "s"} with alliteration.`,
    evidence: allit.slice(0, 3),
  };
};

const scoreRhythm = (lines: string[], stanzas: string[][]) => {
  const syl = lines.map(lineSyllables);
  const mean = syl.reduce((a, b) => a + b, 0) / Math.max(1, syl.length);
  const sd = Math.sqrt(syl.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, syl.length));
  const cv = mean ? sd / mean : 0;
  // Enjambment: lines that run on without ending punctuation
  const runOn = lines.filter((l) => !/[.,;:!?—\-–"')]$/.test(l.trim())).length / Math.max(1, lines.length);
  // A steady pulse with some variation reads best; wild swings read as prose broken up
  const steadiness = cv < 0.2 ? 8.5 : cv < 0.35 ? 9 : cv < 0.5 ? 7 : cv < 0.7 ? 5 : 3.5;
  const score = clamp(steadiness + (runOn > 0.15 && runOn < 0.7 ? 0.8 : 0) - (Math.max(...syl, 0) > 18 ? 1 : 0));
  const longest = lines[syl.indexOf(Math.max(...syl))];
  const shortest = lines[syl.indexOf(Math.min(...syl))];
  void stanzas;
  return {
    element: {
      id: "rhythm" as const,
      label: elementLabels.rhythm,
      score,
      summary: `Lines average ${mean.toFixed(1)} syllables (${Math.min(...syl)} to ${Math.max(...syl)}); ${Math.round(runOn * 100)}% run on into the next line.`,
      evidence: syl.length > 1 ? [`Longest: "${longest}"`, `Shortest: "${shortest}"`] : [],
    },
    longest,
    shortest,
    cv,
  };
};

const scoreDiction = (text: string, lines: string[]) => {
  const lower = text.toLowerCase().replace(/[’]/g, "'");
  const foundCliches = cliches.filter((c) => lower.includes(c));
  const words = tokenize(text);
  const content = words.filter((w) => !stopWords.has(w));
  const abstractions = content.filter((w) => abstractWords.has(w));
  const fillers = words.filter((w) => fillerWords.has(w));
  const adverbs = content.filter((w) => /ly$/.test(w) && w.length > 4 && !["only", "family", "lonely", "lovely", "holy", "early", "belly", "reply", "ugly", "silly"].includes(w));
  const telling = lines.filter((l) => tellingPatterns.some((p) => p.test(l)));
  const abstractShare = abstractions.length / Math.max(1, content.length);
  const score = clamp(10 - foundCliches.length * 1.3 - abstractShare * 22 - (fillers.length / Math.max(1, lines.length)) * 3 - telling.length * 0.8 - adverbs.length * 0.2);
  return {
    element: {
      id: "diction" as const,
      label: elementLabels.diction,
      score,
      summary: `${foundCliches.length} familiar phrase${foundCliches.length === 1 ? "" : "s"}, ${Math.round(abstractShare * 100)}% abstract words, ${fillers.length} filler word${fillers.length === 1 ? "" : "s"}.`,
      evidence: [...foundCliches.map((c) => `"${c}"`), ...unique(abstractions).slice(0, 5)].slice(0, 8),
    },
    cliches: foundCliches,
    abstractions: unique(abstractions),
    fillers: unique(fillers),
    telling,
  };
};

const scoreStructure = (text: string, lines: string[], stanzas: string[][], title: string) => {
  const sizes = stanzas.map((s) => s.length);
  const consistent = sizes.length > 1 && Math.max(...sizes) - Math.min(...sizes) <= 1;
  const lastLine = lines[lines.length - 1] ?? "";
  const firstLine = lines[0] ?? "";
  const endsOnImage = tokenize(lastLine).some(isConcrete);
  const opensOnImage = tokenize(firstLine).some(isConcrete);
  const shortClose = tokenize(lastLine).length <= 6;
  // Anaphora: several lines opening the same way ("I remember…", "I wish you…")
  const openers = new Map<string, number>();
  lines.forEach((l) => {
    const key = tokenize(l).slice(0, 2).join(" ");
    if (key) openers.set(key, (openers.get(key) ?? 0) + 1);
  });
  const anaphora = [...openers.entries()].filter(([, c]) => c >= 3).map(([k]) => k);
  const score = clamp(
    4 + (stanzas.length >= 2 ? 1.2 : 0) + (consistent ? 1.3 : 0.4) + (endsOnImage ? 1.3 : 0) + (opensOnImage ? 0.8 : 0) + (shortClose ? 0.7 : 0) + Math.min(1.2, anaphora.length * 1.2) + (title.trim() ? 0.3 : -0.5),
  );
  void text;
  return {
    element: {
      id: "structure" as const,
      label: elementLabels.structure,
      score,
      summary: `${stanzas.length} stanza${stanzas.length === 1 ? "" : "s"} (${sizes.join("/")} lines)${anaphora.length ? `, with a repeated opening ("${anaphora[0]}…")` : ""}; ${endsOnImage ? "ends on an image" : "ends on a statement"}.`,
      evidence: [`Opens: "${firstLine}"`, `Closes: "${lastLine}"`],
    },
    endsOnImage,
    lastLine,
    anaphora,
  };
};

// People and places that make a poem feel lived-in
const specificWords = /\b(mom|mother|dad|father|sister|brother|grandma|grandpa|son|daughter|wife|husband|aunt|uncle|hospital|church|bar|school|kitchen|car|street|apartment|city|town|job|office|phone|texts?|cage|clover|one|two|three|four|five|six|seven|eight|nine|ten|twelve|twenty|forty|fifty|hundred|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)\b/i;

const scoreVoice = (text: string, lines: string[], title: string) => {
  const specifics: string[] = [];
  if (/\d/.test(title)) specifics.push(title);
  for (const line of lines) {
    if (/\d/.test(line) || specificWords.test(line.replace(/\bone (more|day|night|chance|life|line|minute)\b/gi, ""))) specifics.push(line);
    else if (/\s[A-Z][a-z]{2,}/.test(line.replace(/^(\S+\s+)?(I|God|I'm|I'll|I've)\b/, "")) && !/^[A-Z][a-z]+$/.test(line.trim())) {
      const names = line.match(/(?<=\s)[A-Z][a-z]{2,}/g)?.filter((n) => !["God", "Death", "Love"].includes(n));
      if (names?.length) specifics.push(line);
    }
  }
  const questions = lines.filter((l) => l.includes("?"));
  const address = tokenize(text).filter((w) => w === "you" || w === "your").length;
  const firstPerson = tokenize(text).filter((w) => w === "i" || w === "my" || w === "me").length;
  const score = clamp(4 + Math.min(3.5, unique(specifics).length * 0.7) + Math.min(1.5, questions.length * 0.6) + (address > 0 ? 1 : 0) + (firstPerson > 0 ? 0.5 : 0));
  return {
    id: "voice" as const,
    label: elementLabels.voice,
    score,
    summary: `${unique(specifics).length} line${unique(specifics).length === 1 ? "" : "s"} with specific details (names, numbers, places), ${questions.length} question${questions.length === 1 ? "" : "s"}${address ? ", speaking to someone directly" : ""}.`,
    evidence: unique(specifics).slice(0, 3),
  };
};

// ---------- Putting it together ----------

const senseNames: Record<Sense, string> = { sight: "sight", sound: "sound", touch: "touch", smell: "smell", taste: "taste" };

// Different wordings for each tip, so poems don't all hear the same sentence
const tipTitles: Record<ElementId, string[]> = {
  imagery: ["Show it with something a camera could catch", "Give the reader something to see", "Put an object in the room"],
  figurative: ["Turn a stated feeling into a comparison", "Say what the feeling is like", "Let a metaphor carry the weight"],
  symbolism: ["Let one image carry the poem", "Build a symbol that comes back changed", "Give the poem an object to orbit"],
  sound: ["Add music inside the lines", "Let the words echo each other", "Tune the line endings"],
  rhythm: ["Even out the breath of the lines", "Shape the pace line by line", "Use line length as a beat"],
  diction: ["Swap abstractions for specifics", "Choose the word nobody else would", "Make the language yours"],
  // Structure titles depend on the poem's ending, so they stay as written
  structure: [],
  voice: ["Add one detail only you would know", "Sound like a person in a room", "Name the real thing"],
};

// variation > 0 asks for a different set of examples and line notes for the same poem
export const critiquePoem = (title: string, text: string, variation = 0): Critique => {
  const lines = contentLines(text);
  const stanzas = stanzasOf(text);
  if (lines.length === 0) {
    return { overall: 0, rhymeBlurb: "Nothing written yet.", scheme: "", elements: [], badges: [], tips: [], lineNotes: [], analyzedText: text };
  }

  const imagery = scoreImagery(text, lines);
  const figurative = scoreFigurative(lines, stanzas.length);
  const symbolism = scoreSymbolism(text, stanzas);
  const sound = scoreSound(text, lines);
  const rhythm = scoreRhythm(lines, stanzas);
  const diction = scoreDiction(text, lines);
  const structure = scoreStructure(text, lines, stanzas, title);
  const voice = scoreVoice(text, lines, title);

  const elements: ElementScore[] = [imagery.score, figurative, symbolism.element, sound, rhythm.element, diction.element, structure.element, voice];
  const overall = clamp(elements.reduce((a, e) => a + e.score, 0) / elements.length);
  const byId = Object.fromEntries(elements.map((e) => [e.id, e])) as Record<ElementId, ElementScore>;
  const counts = rhymeKindCounts(text);

  // Badges: what this poem does well
  const badges: Badge[] = [];
  if (byId.imagery.score >= 7.5) badges.push({ id: "image-maker", label: "Image maker", reason: "Readers can see and feel this poem." });
  if (imagery.senses.length >= 4) badges.push({ id: "five-senses", label: "All the senses", reason: `Reaches ${imagery.senses.length} senses, not just sight.` });
  if (byId.figurative.score >= 7.5) badges.push({ id: "figurative-flair", label: "Figurative flair", reason: "Comparisons that show how you see the world." });
  if (symbolism.bookends.length) badges.push({ id: "symbol-weaver", label: "Symbol weaver", reason: `"${symbolism.bookends[0]}" opens and closes the poem.` });
  else if (byId.symbolism.score >= 7) badges.push({ id: "motif", label: "Motif builder", reason: "An image keeps returning and gathers meaning." });
  const subtle = counts.slant + counts.multi;
  if (subtle >= 4 && subtle >= lines.length * 0.4 && counts.multi >= 1) {
    badges.push({ id: "slant-master", label: "Slant master", reason: "Leans on slant and multi-syllable rhymes, the subtle kind." });
  }
  else if (byId.sound.score >= 8.5) badges.push({ id: "rhyme-smith", label: "Rhyme smith", reason: "Strong, steady music in the line endings." });
  if (byId.rhythm.score >= 8) badges.push({ id: "steady-pulse", label: "Steady pulse", reason: "The lines breathe at a consistent pace." });
  if (diction.cliches.length === 0 && byId.diction.score >= 7) badges.push({ id: "fresh", label: "Fresh language", reason: "No worn-out phrases spotted." });
  if (structure.endsOnImage && byId.structure.score >= 7) badges.push({ id: "strong-closer", label: "Strong closer", reason: "Ends on something the reader can picture." });
  if (structure.anaphora.length) badges.push({ id: "refrain", label: "Refrain", reason: `Lines echo each other ("${structure.anaphora[0]}…").` });
  if (byId.voice.score >= 7.5) badges.push({ id: "specific", label: "Specific details", reason: "Names, numbers or places make it feel lived-in." });

  // Room to grow: the three weakest elements, each with a concrete next step
  const tips: Tip[] = [];
  const weakest = [...elements].sort((a, b) => a.score - b.score).filter((e) => e.score < 7.5).slice(0, 3);
  for (const e of weakest) {
    if (e.id === "imagery") {
      const missing = (Object.keys(senseNames) as Sense[]).filter((s) => !imagery.senses.includes(s));
      tips.push({
        element: e.id,
        title: "Show it with something a camera could catch",
        detail: `Trade one abstraction for an object, gesture or place. ${missing.length ? `Try a detail of ${missing.slice(0, 2).map((s) => senseNames[s]).join(" or ")}, which the poem doesn't reach yet.` : ""}`,
        quote: imagery.flattest ?? undefined,
      });
    }
    if (e.id === "figurative") {
      // A line that names a feeling and isn't already figurative
      const feeling = lines.find((l) => tokenize(l).some((w) => abstractWords.has(w)) && !figurative.evidence.includes(l));
      tips.push({
        element: e.id,
        title: "Turn a stated feeling into a comparison",
        detail: "Instead of naming the feeling, say what it's like: an object, an animal, a weather. One fresh simile or metaphor per stanza is plenty.",
        quote: feeling,
      });
    }
    if (e.id === "symbolism") {
      const candidate = symbolism.recurring[0] ?? symbolism.archetypes[0] ?? tokenize(text).find((w) => concreteNouns.has(w));
      tips.push({
        element: e.id,
        title: "Let one image carry the poem",
        detail: candidate
          ? `"${candidate}" is already here. Bring it back in the last stanza, changed, so it gathers meaning each time it appears.`
          : "Choose one concrete object tied to the feeling and return to it at the start and the end.",
      });
    }
    if (e.id === "sound") {
      tips.push({
        element: e.id,
        title: "Add music inside the lines",
        detail: "Echo a vowel or consonant across neighbouring words, or let a line end in a slant rhyme with the one before. Read it aloud and listen for where it goes flat.",
        quote: lines.find((l, i) => i > 0 && analyzeRhymes(text)[text.split("\n").indexOf(l)]?.kind === null),
      });
    }
    if (e.id === "rhythm") {
      tips.push({
        element: e.id,
        title: "Even out the breath of the lines",
        detail: rhythm.cv > 0.5
          ? "Line lengths swing widely. Split the longest line where you'd naturally pause, or fold a very short line into its neighbour, unless the jolt is on purpose."
          : "The lines are very uniform. A deliberately short line at a turning point can land like a drumbeat.",
        quote: rhythm.cv > 0.5 ? rhythm.longest : rhythm.shortest,
      });
    }
    if (e.id === "diction") {
      const quote = diction.cliches[0];
      tips.push({
        element: e.id,
        title: quote ? "Rewrite the familiar phrase in your own words" : "Swap abstractions for specifics",
        detail: quote
          ? `Ask what "${quote}" is trying to say, then say that with an image only you would think of.${diction.cliches.length > 1 ? ` Also: ${diction.cliches.slice(1, 3).map((c) => `"${c}"`).join(", ")}.` : ""}`
          : `Words like ${diction.abstractions.slice(0, 3).map((w) => `"${w}"`).join(", ") || "these"} tell the reader what to feel. Replace one with the moment that made you feel it.`,
        quote: diction.telling[0],
      });
    }
    if (e.id === "structure") {
      tips.push({
        element: e.id,
        title: structure.endsOnImage ? "Give the stanzas a shape" : "End on an image, not an explanation",
        detail: structure.endsOnImage
          ? "Group the lines so each stanza turns on one idea, and let the stanza break act as a pause."
          : "Final lines that sum things up let the energy out. Try cutting the last line, or ending on the most vivid picture in the poem.",
        quote: structure.lastLine,
      });
    }
    if (e.id === "voice") {
      tips.push({
        element: e.id,
        title: "Add one detail only you would know",
        detail: "A street name, a date, the song that was playing, what someone was wearing. Specifics make a poem feel true, and they make it universal.",
      });
    }
  }

  // Vary the wording and pair each tip with a passage from a famous poem
  const seed = seedOf(`${title}\n${text}`) + variation * 104729;
  tips.forEach((tip, n) => {
    const titles = tipTitles[tip.element];
    // Keep a title that depends on the poem; otherwise rotate through the wordings
    if (titles.length && titles.includes(tip.title)) tip.title = titles[(seed + n) % titles.length];
    const line = tip.quote ?? lines[(seed + n * 7) % lines.length];
    tip.master = masterLesson(tip.element, line, seed + n * 31);
  });

  return {
    overall,
    rhymeBlurb: describeRhyme(text),
    scheme: rhymeSchemeText(text),
    elements,
    badges,
    tips,
    lineNotes: lineNotes(text, variation),
    analyzedText: text,
  };
};

// Used to tell whether a poem has changed since it was last read
export const sameText = (a: string, b: string) => a.trim() === b.trim();

