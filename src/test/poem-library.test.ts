import { describe, expect, it } from "vitest";
import type { Poem } from "@/data/poems";
import { chunk, filterPoems, tagCounts } from "@/lib/poem-search";
import { computeInsights, formatNumber, formatPercent, words } from "@/lib/poem-insights";
import { rhymeDensity, rhymeGroups } from "@/lib/rhyme";
import { textToPoems, poemsToText } from "@/lib/poem-clipboard";
import { usePoemStore } from "@/stores/poem-store";

const poem = (overrides: Partial<Poem>): Poem => ({
  id: "p",
  title: "Title",
  content: "",
  tags: [],
  mood: null,
  createdAt: null,
  updatedAt: null,
  kind: "own",
  author: null,
  ...overrides,
});

const wolf = poem({ id: "wolf", title: "Wolf", content: "Alone in the silence,\nI resort to violence.", tags: ["anger"], mood: "anger" });
const electricity = poem({ id: "elec", title: "Electricity", content: "Love is electricity,\nin simplest simplicity.", tags: ["love"], mood: "love" });
const blank = poem({ id: "blank", title: "Untitled", content: "  " });

describe("filterPoems", () => {
  const all = [wolf, electricity];

  it("searches titles, lines and tags, ignoring case and accents", () => {
    expect(filterPoems(all, { query: "SILENCE", mood: null, tag: null })).toEqual([wolf]);
    expect(filterPoems(all, { query: "électricity", mood: null, tag: null })).toEqual([electricity]);
    expect(filterPoems(all, { query: "love simplest", mood: null, tag: null })).toEqual([electricity]);
  });

  it("filters by mood and tag", () => {
    expect(filterPoems(all, { query: "", mood: "anger", tag: null })).toEqual([wolf]);
    expect(filterPoems(all, { query: "", mood: null, tag: "love" })).toEqual([electricity]);
    expect(filterPoems(all, { query: "", mood: "love", tag: "anger" })).toEqual([]);
  });

  it("returns everything for an empty filter", () => {
    expect(filterPoems(all, { query: "  ", mood: null, tag: null })).toEqual(all);
  });
});

describe("tagCounts and chunk", () => {
  it("orders tags by use", () => {
    const tagged = [poem({ tags: ["dad", "love"] }), poem({ tags: ["love"] })];
    expect(tagCounts(tagged)).toEqual([
      { tag: "love", count: 2 },
      { tag: "dad", count: 1 },
    ]);
  });

  it("splits books into shelves", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("rhyme", () => {
  it("groups lines that end in a rhyme", () => {
    expect(Array.from(rhymeGroups("the silence\nsome violence\nunrelated end").keys())).toEqual([0, 1]);
  });

  it("measures how much of a poem rhymes", () => {
    expect(rhymeDensity("silence\nviolence\nsky\nwater")).toBe(0.5);
    expect(rhymeDensity("")).toBe(0);
  });
});

describe("computeInsights", () => {
  it("skips empty poems and summarises the rest", () => {
    const insights = computeInsights([wolf, electricity, blank]);
    expect(insights.poemCount).toBe(2);
    expect(insights.totalWords).toBe(words(wolf.content).length + words(electricity.content).length);
    expect(insights.totalLines).toBe(4);
    expect(insights.moodMix).toEqual([
      { mood: "love", count: 1 },
      { mood: "anger", count: 1 },
    ]);
    expect(insights.topWords.map((w) => w.word)).not.toContain("the");
    expect(insights.untaggedCount).toBe(0);
  });

  it("handles an empty library", () => {
    const insights = computeInsights([]);
    expect(insights.poemCount).toBe(0);
    expect(insights.longest).toBeNull();
    expect(insights.averageWords).toBe(0);
  });
});

describe("formatting", () => {
  it("uses European separators", () => {
    expect(formatNumber(1234)).toBe("1.234");
    expect(formatNumber(12.5, 1)).toBe("12,5");
    expect(formatPercent(0.425)).toBe("43 %");
  });
});

describe("clipboard round trip", () => {
  it("keeps titles and lines, and drops empty poems", () => {
    const text = poemsToText([wolf, blank]);
    expect(textToPoems(text)).toEqual([{ title: "Wolf", content: wolf.content }]);
  });
});

describe("poem store", () => {
  it("never keeps blank poems", () => {
    usePoemStore.getState().setPoems([wolf, blank]);
    expect(usePoemStore.getState().poems.map((p) => p.id)).toEqual(["wolf"]);

    const id = usePoemStore.getState().createPoem();
    usePoemStore.getState().discardIfEmpty(id);
    expect(usePoemStore.getState().poems.map((p) => p.id)).toEqual(["wolf"]);

    const kept = usePoemStore.getState().createPoem();
    usePoemStore.getState().updatePoem(kept, { content: "A line" });
    usePoemStore.getState().discardIfEmpty(kept);
    expect(usePoemStore.getState().poems).toHaveLength(2);
  });

  it("imports only written poems", () => {
    usePoemStore.getState().setPoems([]);
    const added = usePoemStore.getState().importPoems([
      { title: "A", content: "line" },
      { title: "B", content: " " },
    ]);
    expect(added).toBe(1);
  });
});
