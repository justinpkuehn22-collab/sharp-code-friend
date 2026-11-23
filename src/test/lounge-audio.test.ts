import { describe, expect, it } from "vitest";
import { buildBar, chordAt, songbook, swing, tuneSeconds } from "@/lib/audio/jazz-score";
import { keySoundFor } from "@/lib/audio/typewriter-sound";
import { midiToFrequency } from "@/lib/audio/audio-context";

describe("house band songbook", () => {
  it("has five records, each playing for a few minutes", () => {
    expect(songbook).toHaveLength(5);
    expect(new Set(songbook.map((t) => t.id)).size).toBe(5);
    for (const tune of songbook) {
      expect(tuneSeconds(tune)).toBeGreaterThan(120);
      expect(tuneSeconds(tune)).toBeLessThan(420);
    }
    // The whole playlist runs well past twenty minutes before repeating
    expect(songbook.reduce((sum, t) => sum + tuneSeconds(t), 0)).toBeGreaterThan(20 * 60);
  });

  it("includes the blues", () => {
    expect(songbook.filter((t) => t.style === "blues").length).toBeGreaterThanOrEqual(2);
    expect(songbook.find((t) => t.id === "smoke-gin")?.form).toHaveLength(12);
  });

  it("loops each tune's form", () => {
    const tune = songbook[0];
    expect(tune.form).toHaveLength(32);
    expect(chordAt(tune, 32).name).toBe(chordAt(tune, 0).name);
    expect(chordAt(tune, -1).name).toBe(chordAt(tune, 31).name);
  });

  it("swings the off-beats", () => {
    expect(swing(1)).toBe(1);
    expect(swing(1.5)).toBeCloseTo(1 + 2 / 3);
  });

  it("walks the swing bass into the next chord", () => {
    const tune = songbook[0];
    for (let bar = 0; bar < 32; bar++) {
      const bass = buildBar(tune, bar, 3).filter((e) => e.voice === "bass");
      expect(bass.map((e) => e.beat)).toEqual([0, 1, 2, 3]);
      expect(bass[0].notes[0]).toBe(chordAt(tune, bar).root);
      expect(Math.abs(bass[3].notes[0] - chordAt(tune, bar + 1).root)).toBe(1);
    }
  });

  it("plays a boogie bass and bent blue notes in the blues", () => {
    const tune = songbook.find((t) => t.id === "smoke-gin");
    if (!tune) throw new Error("missing blues");
    expect(buildBar(tune, 0, 1).filter((e) => e.voice === "bass")).toHaveLength(8);
    const bends = Array.from({ length: 48 }, (_, bar) => buildBar(tune, bar, 5)).flat().filter((e) => e.slide);
    expect(bends.length).toBeGreaterThan(0);
  });

  it("keeps every note inside the bar and in a listenable range, for every record", () => {
    for (const tune of songbook) {
      for (let bar = 0; bar < tune.form.length * 2; bar++) {
        for (const e of buildBar(tune, bar, 11)) {
          expect(e.beat).toBeGreaterThanOrEqual(0);
          expect(e.beat).toBeLessThan(4);
          for (const n of e.notes) {
            expect(n).toBeGreaterThanOrEqual(24);
            expect(n).toBeLessThanOrEqual(100);
          }
        }
      }
    }
  });

  it("plays the same chorus for the same seed, and a different one for another", () => {
    const tune = songbook[1];
    expect(buildBar(tune, 5, 2)).toEqual(buildBar(tune, 5, 2));
    const a = JSON.stringify(Array.from({ length: 8 }, (_, i) => buildBar(tune, i, 2)));
    const b = JSON.stringify(Array.from({ length: 8 }, (_, i) => buildBar(tune, i, 3)));
    expect(a).not.toEqual(b);
  });
});

describe("typewriter keys", () => {
  it("maps keys to sounds", () => {
    expect(keySoundFor("a", false)).toBe("key");
    expect(keySoundFor(" ", false)).toBe("space");
    expect(keySoundFor("Enter", false)).toBe("return");
    expect(keySoundFor("Backspace", false)).toBe("backspace");
  });

  it("stays quiet for shortcuts and navigation keys", () => {
    expect(keySoundFor("c", true)).toBeNull();
    expect(keySoundFor("ArrowLeft", false)).toBeNull();
    expect(keySoundFor("Shift", false)).toBeNull();
  });

  it("tunes notes correctly", () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(81)).toBeCloseTo(880);
  });
});

import { rhymeLetters, rhymeSchemeText } from "@/lib/rhyme";
import { countSyllables, lineSyllables } from "@/lib/syllables";

describe("rhyme scheme letters", () => {
  it("labels rhyming lines with the same letter and keeps stanzas", () => {
    const poem = "I walk at night\nthe street is cold\nthe moon is bright\nmy hands are old\n\nand then I wait";
    expect(rhymeLetters(poem)).toEqual(["A", "B", "A", "B", null, "C"]);
    expect(rhymeSchemeText(poem)).toBe("ABAB C");
  });

  it("handles an empty poem", () => {
    expect(rhymeSchemeText("")).toBe("");
  });
});

describe("syllables", () => {
  it("counts common words sensibly", () => {
    expect(countSyllables("love")).toBe(1);
    expect(countSyllables("forever")).toBe(3);
    expect(countSyllables("electricity")).toBeGreaterThanOrEqual(4);
    expect(countSyllables("little")).toBe(2);
    expect(lineSyllables("The heart breaks as it falls")).toBe(6);
  });
});

describe("sound-alike rhymes", () => {
  it("matches common endings spelled differently", () => {
    expect(rhymeSchemeText("the city cold and grey\nI never learned to stay")).toBe("AA");
    expect(rhymeSchemeText("I walk the street at night\nthe neon burning bright\nand then I write")).toBe("AAA");
    expect(rhymeSchemeText("you swept in like a storm\nI'm sure of it, I'm yours\nyou know the score")).toBe("ABB");
  });

  it("doesn't rhyme words that only share a silent e", () => {
    expect(rhymeSchemeText("the stone\nthe time")).toBe("AB");
  });
});
