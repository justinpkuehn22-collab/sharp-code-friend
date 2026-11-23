import { describe, expect, it } from "vitest";
import type { Poem } from "@/data/poems";
import { writingPrompts } from "@/data/writing-prompts";
import { leastWrittenMoods, pickPrompts } from "@/lib/writing-prompts";
import { moods } from "@/data/poems";

const poem = (mood: Poem["mood"], content = "a line"): Poem => ({
  id: Math.random().toString(),
  title: "t",
  content,
  tags: [],
  mood,
  createdAt: null,
  updatedAt: null,
});

describe("writing prompts", () => {
  it("has prompts for every mood and unique ids", () => {
    for (const m of moods) expect(writingPrompts.some((p) => p.mood === m)).toBe(true);
    expect(new Set(writingPrompts.map((p) => p.id)).size).toBe(writingPrompts.length);
  });

  it("orders moods from least to most written, ignoring empty poems", () => {
    const shelf = [poem("love"), poem("love"), poem("heartbreak"), poem("hope", " ")];
    const order = leastWrittenMoods(shelf);
    expect(order.slice(-2)).toEqual(["heartbreak", "love"]);
    expect(order.indexOf("hope")).toBeLessThan(order.indexOf("heartbreak"));
  });

  it("only gives prompts for the chosen mood", () => {
    const picked = pickPrompts([], "family", 3, 5);
    expect(picked).toHaveLength(3);
    expect(picked.every((p) => p.mood === "family")).toBe(true);
  });

  it("suggests different, under-written themes when no mood is chosen", () => {
    const shelf = moods.filter((m) => m !== "hope").map((m) => poem(m));
    const picked = pickPrompts(shelf, null, 3, 4);
    expect(picked).toHaveLength(3);
    expect(new Set(picked.map((p) => p.mood)).size).toBe(3);
    expect(pickPrompts(shelf, null, 3, 4)).toEqual(picked);
  });
});
