import { describe, expect, it } from "vitest";
import { critiquePoem, describeRhyme } from "@/lib/poem-critique";

const vivid = `The kitchen light hums over the cold sink,
your coffee cup still warm beside the window,
rain ticking on the glass like a slow clock,
the smell of smoke in the curtains you left.

I hold the cup, the kitchen dark,
the window black, the rain still ticking,
and the light hums on like it never heard you go.`;

const abstractPoem = `Love is pain and pain is love,
my heart is broken, deep down I know,
time and time again I feel so sad,
forever lost in my despair and sorrow.`;

describe("critiquePoem", () => {
  it("scores a concrete, image-led poem above an abstract one", () => {
    const a = critiquePoem("Kitchen", vivid);
    const b = critiquePoem("Untitled", abstractPoem);
    const score = (c: ReturnType<typeof critiquePoem>, id: string) => c.elements.find((e) => e.id === id)?.score ?? 0;
    expect(score(a, "imagery")).toBeGreaterThan(score(b, "imagery"));
    expect(score(a, "diction")).toBeGreaterThan(score(b, "diction"));
    expect(a.overall).toBeGreaterThan(b.overall);
  });

  it("scores all eight elements between 0 and 10", () => {
    const c = critiquePoem("Kitchen", vivid);
    expect(c.elements.map((e) => e.id)).toEqual(["imagery", "figurative", "symbolism", "sound", "rhythm", "diction", "structure", "voice"]);
    for (const e of c.elements) {
      expect(e.score).toBeGreaterThanOrEqual(0);
      expect(e.score).toBeLessThanOrEqual(10);
      expect(e.summary.length).toBeGreaterThan(0);
    }
  });

  it("finds the simile and the images that come back", () => {
    const c = critiquePoem("Kitchen", vivid);
    expect(c.elements.find((e) => e.id === "figurative")?.evidence.join(" ")).toContain("like a slow clock");
    expect(c.badges.map((b) => b.id)).toContain("symbol-weaver");
  });

  it("flags clichés and abstractions with a concrete next step", () => {
    const c = critiquePoem("Untitled", abstractPoem);
    const diction = c.elements.find((e) => e.id === "diction");
    expect(diction?.evidence).toEqual(expect.arrayContaining(['"deep down"', '"time and time again"']));
    expect(c.tips.length).toBeGreaterThan(0);
    expect(c.tips.length).toBeLessThanOrEqual(3);
    expect(c.tips.some((t) => t.element === "diction" || t.element === "imagery")).toBe(true);
  });

  it("handles an empty poem", () => {
    const c = critiquePoem("", "   ");
    expect(c.overall).toBe(0);
    expect(c.elements).toHaveLength(0);
  });
});

describe("describeRhyme", () => {
  it("names a consistent scheme", () => {
    const quatrains = "the night\nthe sea\nso bright\nfor me\n\nthe rain\nthe door\nagain\nthe floor";
    expect(describeRhyme(quatrains)).toContain("alternating rhyme");
  });

  it("calls unrhymed poems free verse", () => {
    expect(describeRhyme("the kitchen light\nyour coffee cup\nrain on the window")).toContain("free verse");
  });
});
