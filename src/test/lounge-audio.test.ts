import { describe, expect, it } from "vitest";
import { buildBar, chordAt, form, swing } from "@/lib/audio/jazz-score";
import { keySoundFor } from "@/lib/audio/typewriter-sound";
import { midiToFrequency } from "@/lib/audio/audio-context";

describe("house band score", () => {
  it("is a 32-bar tune that loops", () => {
    expect(form).toHaveLength(32);
    expect(chordAt(32).name).toBe(chordAt(0).name);
    expect(chordAt(-1).name).toBe(chordAt(31).name);
  });

  it("swings the off-beats", () => {
    expect(swing(1)).toBe(1);
    expect(swing(1.5)).toBeCloseTo(1 + 2 / 3);
  });

  it("walks the bass four to the bar, starting on the root and leading into the next chord", () => {
    for (let bar = 0; bar < 32; bar++) {
      const bass = buildBar(bar, 3).filter((e) => e.voice === "bass");
      expect(bass.map((e) => e.beat)).toEqual([0, 1, 2, 3]);
      expect(bass[0].notes[0]).toBe(chordAt(bar).root);
      expect(Math.abs(bass[3].notes[0] - chordAt(bar + 1).root)).toBe(1);
    }
  });

  it("keeps every note inside the bar and in a listenable range", () => {
    for (let bar = 0; bar < 64; bar++) {
      for (const e of buildBar(bar, 11)) {
        expect(e.beat).toBeGreaterThanOrEqual(0);
        expect(e.beat).toBeLessThan(4);
        for (const n of e.notes) {
          expect(n).toBeGreaterThanOrEqual(30);
          expect(n).toBeLessThanOrEqual(96);
        }
      }
    }
  });

  it("plays the same chorus for the same seed, and a different one for another", () => {
    expect(buildBar(5, 2)).toEqual(buildBar(5, 2));
    const a = JSON.stringify(Array.from({ length: 8 }, (_, i) => buildBar(i, 2)));
    const b = JSON.stringify(Array.from({ length: 8 }, (_, i) => buildBar(i, 3)));
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
