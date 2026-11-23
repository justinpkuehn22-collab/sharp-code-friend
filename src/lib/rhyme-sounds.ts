// Approximate sounds of English line endings, from spelling alone.
// Good enough to hear that "night" and "bright" rhyme perfectly, "night" and "life"
// share a vowel (slant), and "hold it" and "moment" rhyme across two syllables.

export type RhymeKind = "perfect" | "multi" | "slant" | "consonance";

// Strongest first
export const rhymeKindOrder: RhymeKind[] = ["perfect", "multi", "slant", "consonance"];

export const rhymeKindLabels: Record<RhymeKind, string> = {
  perfect: "Perfect rhyme",
  multi: "Multi-syllable rhyme",
  slant: "Slant rhyme",
  consonance: "Consonance",
};

export const rhymeKindHints: Record<RhymeKind, string> = {
  perfect: "Same vowel and same sound after it: night / bright",
  multi: "Two or more syllables echo: hold it / moment",
  slant: "Same vowel, different ending: night / life",
  consonance: "Different vowel, same closing consonants: heart / hurt",
};

interface Syllable {
  vowel: string; // sound class, e.g. "AI", "OH", "IH"
  after: string; // consonant sound that follows, up to the next vowel
}

export interface Ending {
  stressed: string; // the last stressed vowel sound
  stressedAfter: string; // consonants right after it
  tail: Syllable[]; // unstressed syllables after it (possibly from a small word like "it")
  coda: string; // final consonant sound of the line
}

// Small words that lean on the word before them at a line end ("hold it", "show 'em")
const clitics = new Set(["it", "em", "a", "an", "the", "of", "to"]);

// Main (stressed) vowel for words spelling can't predict
const exceptions: Record<string, string> = {
  they: "AY", grey: "AY", prey: "AY", obey: "AY", whey: "AY", hey: "AY", convey: "AY", survey: "AY",
  you: "OO", through: "OO", to: "OO", do: "OO", who: "OO", two: "OO", shoe: "OO", lose: "OO", move: "OO", prove: "OO", whose: "OO",
  soul: "OH", though: "OH", dough: "OH", both: "OH", most: "OH", post: "OH", ghost: "OH", host: "OH", over: "OH", only: "OH", open: "OH", go: "OH", so: "OH", no: "OH",
  love: "UH", above: "UH", glove: "UH", dove: "UH", come: "UH", some: "UH", done: "UH", none: "UH", one: "UH", won: "UH", son: "UH", blood: "UH", flood: "UH", mother: "UH", brother: "UH", other: "UH", nothing: "UH", money: "UH", honey: "UH", young: "UH", touch: "UH", enough: "UH", rough: "UH", tough: "UH",
  give: "IH", live: "IH", been: "IH", forgive: "IH", river: "IH", given: "IH", women: "IH", busy: "IH",
  heart: "AR", hearth: "AR",
  were: "ER", word: "ER", words: "ER", world: "ER", work: "ER", worth: "ER", heard: "ER", learn: "ER", earth: "ER", search: "ER",
  eye: "AI", eyes: "AI", lie: "AI", die: "AI", tie: "AI", lies: "AI", cries: "AI", skies: "AI", tries: "AI", goodbye: "AI", goodbyes: "AI", buy: "AI",
  said: "EH", says: "EH", friend: "EH", friends: "EH", head: "EH", dead: "EH", bread: "EH", read: "EH", spread: "EH", thread: "EH", breath: "EH", death: "EH", ready: "EH", heaven: "EH", weather: "EH", heavy: "EH", meant: "EH", any: "EH", many: "EH", never: "EH", ever: "EH", every: "EH", clever: "EH", seven: "EH", forever: "EH", whatever: "EH", together: "EH",
  wind: "IH",
  could: "UU", would: "UU", should: "UU", good: "UU", wood: "UU", stood: "UU", hood: "UU", foot: "UU", look: "UU", book: "UU", took: "UU", put: "UU", full: "UU", pull: "UU",
  now: "OW", how: "OW", cow: "OW", vow: "OW", allow: "OW", brow: "OW", plow: "OW",
  down: "OW", town: "OW", crown: "OW", gown: "OW", frown: "OW", drown: "OW", brown: "OW", clown: "OW",
  where: "AIR", there: "AIR", their: "AIR", wear: "AIR", bear: "AIR", swear: "AIR", pear: "AIR",
  your: "OR", yours: "OR", four: "OR", pour: "OR", door: "OR", floor: "OR", poor: "OR", war: "OR", warm: "OR",
  what: "UH", was: "UH", want: "AA", water: "AW", father: "AA",
};

// Two-syllable words stressed on the end ("a-LONE", "be-LIEVE", "to-NIGHT")
const unstressedPrefix = /^(a|be|de|re|un|in|en|em|ex|pre|for|to|ad|al|con|dis|mis|sur|ob|per|up|with)(?=[a-z]{2,})/;
const finalStress = new Set([
  "goodbye", "goodbyes", "tonight", "today", "hello", "okay", "inside", "outside", "myself", "yourself", "himself", "herself",
  "upon", "until", "unless", "within", "without", "despite", "cannot", "alright", "alone", "above", "again", "away", "awake",
]);
const firstStress = new Set(["every", "after", "answer", "anger", "ember", "enter", "empty", "even", "evening", "open", "over", "only", "under", "other", "ever", "never", "any", "many", "money", "honey", "river", "weather", "heaven", "heavy", "ready", "promise", "prison", "pressure", "perfect", "person", "pretty", "purpose", "constant", "comfort", "conscience", "distance", "silence", "sudden", "summer", "winter", "water", "father", "mother", "brother", "sister", "other", "nothing", "something", "candle", "angel", "angels", "anchor", "ashes", "image", "into", "onto", "endless", "restless", "reckless", "rebel", "record", "deadly", "devil", "demon", "precious", "presence", "present", "prayer", "tender", "temple"]);

// Endings that pull the stress further back ("e-LEC-tri-ci-ty" -> "-CI-ty")
const antepenultSuffix = /(ity|ety|ible|able|ence|ance|ent|ant|ous|ful|less|ness|ial|ian|y)$/;

const stressIndexFor = (word: string, count: number): number => {
  if (count <= 1) return 0;
  if (count === 2) {
    if (finalStress.has(word)) return 1;
    if (firstStress.has(word)) return 0;
    return unstressedPrefix.test(word) ? 1 : 0;
  }
  if (/(ity|ety)$/.test(word)) return Math.max(0, count - 3);
  if (/(tion|sion|cian|ic|ical)$/.test(word)) return count - 2;
  if (antepenultSuffix.test(word)) return Math.max(0, count - 3);
  return count - 2;
};

const longVowel: Record<string, string> = { a: "AY", e: "EE", i: "AI", o: "OH", u: "OO" };
const shortVowel: Record<string, string> = { a: "AE", e: "EH", i: "IH", o: "AA", u: "UH" };

// Sound class for a vowel spelling in its context
const vowelSound = (g: string, next: string, nextNext: string, word: string, atEnd: boolean, magicE: boolean, openBefore: boolean): string => {
  // A silent "e" after r: "fire", "share", "more", "here", "pure"
  if (magicE && next === "r") return { a: "AIR", e: "EER", i: "IRE", y: "IRE", o: "OR", u: "OOR" }[g] ?? "ER";
  // Other r-coloured vowels: "star", "storm", "her", "bird", "turn", "learn"
  if (next === "r" && !/[aeiouy]/.test(nextNext)) {
    if (g === "a") return "AR";
    if (g === "o" || g === "oa" || g === "oo" || g === "ou") return "OR";
    if (g === "ea") return atEnd || nextNext === "" ? "EER" : "ER";
    if (g === "e" || g === "i" || g === "u") return "ER";
    if (g === "ai") return "AIR";
    if (g === "ee" || g === "ie") return "EER";
  }
  if (g === "igh") return "AI";
  if (g === "eigh") return "AY";
  if (g === "ai" || g === "ay" || g === "ei") return "AY";
  if (g === "ey") return word.length > 4 ? "EE" : "AY";
  if (g === "ee" || g === "ie" || g === "ea") return "EE";
  if (g === "oa" || g === "oe") return "OH";
  if (g === "oo" || g === "ew" || g === "ue" || g === "ui") return "OO";
  if (g === "oi" || g === "oy") return "OY";
  if (g === "au" || g === "aw") return "AW";
  if (g === "ou") return next === "g" && nextNext === "h" ? "AW" : "OW";
  if (g === "ow") return atEnd || next === "n" ? "OH" : "OW";
  if (g === "ye") return "AI";
  if (g === "y") return atEnd ? (word.length <= 4 ? "AI" : "EE") : "IH";
  if (g.length > 1) return shortVowel[g[0]] ?? "UH";
  // Single letters: long with a silent "e", at the end of a short word, or before a single consonant and another vowel
  if (magicE || (atEnd && word.length <= 3) || openBefore) return longVowel[g] ?? "UH";
  if (g === "o" && next === "l" && /[dt]/.test(nextNext)) return "OH"; // hold, bolt
  if (g === "a" && next === "l" && /[lkt]/.test(nextNext)) return "AW"; // all, walk, salt
  if (g === "i" && /^(nd|ld)$/.test(next + nextNext)) return "AI"; // mind, wild
  return shortVowel[g] ?? "UH";
};

// Consonant spelling to sound
const consonantSound = (letters: string): string =>
  letters
    .replace(/gh/g, "")
    .replace(/ck/g, "k")
    .replace(/ph/g, "f")
    .replace(/c(?=[eiy])/g, "s")
    .replace(/c/g, "k")
    .replace(/q/g, "k")
    .replace(/x/g, "ks")
    .replace(/dge/g, "j")
    .replace(/(.)\1+/g, "$1");

// Splits a word into syllables: each a vowel sound plus the consonants after it
export const syllables = (rawWord: string): Syllable[] => {
  let word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return [];
  // A leading "y" before a vowel is a consonant ("you", "yours", "yearn")
  const spelled = word.replace(/^y(?=[aeiou])/, "j");
  word = spelled;
  // Silent final "e" ("life", "stone", "lines"), but not "-le" ("table") or "ee"/"ye"
  const silentE = word.length > 2 && /[^aeiouy]es?$/.test(word) && !/[^aeiouy]les?$/.test(word) && !/(ee|ye)s?$/.test(word);
  let body = word;
  if (silentE) body = word.replace(/ces?$/, (m) => (m.endsWith("s") ? "ss" : "s")).replace(/ges?$/, (m) => (m.endsWith("s") ? "js" : "j")).replace(/es?$/, (m) => (m === "es" ? "s" : ""));
  // Vowel pairs that are really two syllables ("vi-o-lence", "cre-ate")
  const parts = body.match(/[^aeiouy]+|igh|eigh|ye(?=s?$)|ia|io|eo|iu|ua|uo|[aeiouy]{1,2}/g) ?? [];
  // Re-split pairs that are two syllables
  const tokens: string[] = [];
  for (const p of parts) {
    if (/^(ia|io|eo|iu|ua|uo)$/.test(p)) tokens.push(p[0], p[1]);
    else tokens.push(p);
  }
  const result: Syllable[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const isVowel = /^[aeiouy]/.test(t) || t === "igh" || t === "eigh";
    if (!isVowel) {
      if (result.length > 0) result[result.length - 1].after += t;
      continue;
    }
    const next = tokens[i + 1] ?? "";
    const afterNext = tokens[i + 2] ?? "";
    const nextIsConsonant = next !== "" && !/^[aeiouy]/.test(next);
    const isLastVowel = tokens.slice(i + 1).every((p) => !/^[aeiouy]/.test(p) && p !== "igh");
    const magicE = silentE && isLastVowel && next.length === 1;
    // "mo-ment", "bro-ken", "si-lence": one consonant, then another vowel (but not before v: "never", "river")
    const openBefore =
      (nextIsConsonant && next.length === 1 && next !== "v" && next !== "x" && /^[aeiouy]/.test(afterNext) && !isLastVowel) ||
      (/^[aeiou]$/.test(next) && t.length === 1);
    result.push({
      vowel: vowelSound(t, next[0] ?? "", next[1] ?? afterNext[0] ?? "", word, i === tokens.length - 1, magicE, openBefore),
      after: "",
    });
  }
  return result.map((s) => ({ ...s, after: consonantSound(s.after) }));
};

const words = (line: string): string[] =>
  line
    .toLowerCase()
    .replace(/[’]/g, "'")
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z']/g, "").replace(/'s$/, "s").replace(/'/g, ""))
    .filter(Boolean);

// Plural or possessive "s" doesn't break a rhyme ("score" / "yours")
const dropS = (c: string) => (c.length > 1 || c === "s" ? c.replace(/s$/, "") : c);

// The sound of a line's ending, from its last stressed vowel onwards
export const lineEnding = (line: string): Ending | null => {
  const ws = words(line);
  if (ws.length === 0) return null;
  let last = ws[ws.length - 1];
  const tailWords: string[] = [];
  // "hold it": the stress sits on the word before the small one
  if (ws.length >= 2 && clitics.has(last)) {
    tailWords.push(last);
    last = ws[ws.length - 2];
  }
  const syl = syllables(last);
  if (syl.length === 0) return null;
  const s = stressIndexFor(last, syl.length);
  const known = exceptions[last];
  if (known) syl[s] = { ...syl[s], vowel: known };
  const tail = [...syl.slice(s + 1), ...tailWords.flatMap(syllables)];
  const all = [syl[s], ...tail];
  return {
    stressed: syl[s].vowel,
    stressedAfter: tail.length === 0 ? dropS(syl[s].after) : syl[s].after,
    tail: tail.map((t, i) => (i === tail.length - 1 ? { ...t, after: dropS(t.after) } : t)),
    coda: dropS(all[all.length - 1].after),
  };
};

// Unstressed vowels blur together in speech
const tailKey = (tail: Syllable[]) => tail.map((t) => `@${t.after}`).join("");

export const classifyRhyme = (a: Ending, b: Ending): RhymeKind | null => {
  const sameVowel = a.stressed === b.stressed;
  const sameLength = a.tail.length === b.tail.length;
  if (sameVowel && sameLength && a.stressedAfter + tailKey(a.tail) === b.stressedAfter + tailKey(b.tail)) return "perfect";
  if (sameVowel && sameLength && a.tail.length >= 1) return "multi";
  // Both run past the stressed syllable and land on the same sound ("silence" / "violence")
  if (sameVowel && a.tail.length >= 1 && b.tail.length >= 1 && a.coda === b.coda) return "multi";
  if (sameVowel && sameLength) return "slant";
  // Same vowel, one ending a syllable longer ("night" / "frighten")
  if (sameVowel && Math.abs(a.tail.length - b.tail.length) === 1 && a.stressedAfter === b.stressedAfter && a.stressedAfter !== "") return "slant";
  // Different vowels, same closing consonants ("heart" / "hurt", "mind" / "sound")
  if (!sameVowel && sameLength && a.coda.length >= 2 && a.coda === b.coda) return "consonance";
  return null;
};
