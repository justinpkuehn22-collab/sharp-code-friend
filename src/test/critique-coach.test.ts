import { describe, expect, it } from "vitest";
import { critiquePoem } from "@/lib/poem-critique";
import { lineNotes, masterLesson, seedOf, shuffled } from "@/lib/critique-coach";
import { masterExamples } from "@/data/master-examples";

const monster = `She searched the mirror of my soul,
Found only shadows staring back -
An endless void, so deep, and so black.
I wish for light to mend these cracks.

They say "Ask and you shall receive."
Not me -
I ask,
Yet I am deceived.
This is just my reality.`;

const garden = `My father kept a garden by the tracks,
tomatoes splitting in the August heat.
He'd hand me one still warm and say "eat,"
and freight cars shook the fence behind our backs.`;

describe("critique coach", () => {
  it("points at specific lines with concrete options", () => {
    const notes = lineNotes(monster);
    const soul = notes.find((n) => n.line.includes("soul"));
    expect(soul?.kind).toBe("image");
    expect(soul?.ideas.length).toBeGreaterThan(0);
    const orphan = notes.find((n) => n.kind === "rhyme");
    expect(orphan?.line).toBe("Not me -");
    // Its partner is the line before it in the same stanza
    expect(orphan?.rhymeWith).toBe("receive");
  });

  it("offers a tightened line when filler words soften it", () => {
    const notes = lineNotes("The night was so very cold and still\nI really just wanted to stay until");
    const filler = notes.find((n) => n.kind === "filler");
    expect(filler?.ideas[0]).not.toMatch(/\b(really|just|very)\b/);
  });

  it("gives different poems different advice", () => {
    const a = critiquePoem("The Monster", monster);
    const b = critiquePoem("Garden", garden);
    const sig = (c: ReturnType<typeof critiquePoem>) => JSON.stringify([c.tips.map((t) => [t.title, t.master?.id]), c.lineNotes.map((n) => n.title)]);
    expect(sig(a)).not.toBe(sig(b));
  });

  it("pairs tips with a famous passage and an exercise on the writer's line", () => {
    const c = critiquePoem("The Monster", monster);
    const withMaster = c.tips.filter((t) => t.master);
    expect(withMaster.length).toBe(c.tips.length);
    for (const t of withMaster) {
      expect(t.master?.element).toBe(t.element);
      expect(t.master?.tryIt).not.toContain("{line}");
    }
  });

  it("shows other ideas on request and stays stable otherwise", () => {
    const first = critiquePoem("The Monster", monster);
    expect(critiquePoem("The Monster", monster).tips.map((t) => t.master?.id)).toEqual(first.tips.map((t) => t.master?.id));
    const others = [1, 2, 3].map((v) => critiquePoem("The Monster", monster, v).tips.map((t) => t.master?.id).join());
    expect(others.some((o) => o !== first.tips.map((t) => t.master?.id).join())).toBe(true);
  });

  it("keeps the examples short, dated before 1929 and covering every element", () => {
    for (const m of masterExamples) {
      expect(m.year).toBeLessThan(1929);
      expect(m.lines.split("\n").length).toBeLessThanOrEqual(8);
      expect(m.tryIt).toContain("{line}");
    }
    const elements = new Set(masterExamples.map((m) => m.element));
    expect(elements.size).toBe(8);
    expect(masterLesson("imagery", undefined, 3)?.tryIt).not.toContain("{line}");
  });

  it("seeds deterministically", () => {
    expect(seedOf("abc")).toBe(seedOf("abc"));
    expect(shuffled([1, 2, 3, 4, 5], 9)).toEqual(shuffled([1, 2, 3, 4, 5], 9));
  });
});
