import { describe, expect, it } from "vitest";
import { mergeShelves, serverHasNews } from "@/lib/shelf-merge";
import type { Poem } from "@/data/poems";

const poem = (id: string, content: string, updatedAt: string): Poem =>
  ({ id, title: id, content, tags: [], mood: null, createdAt: updatedAt, updatedAt, kind: "own", author: null }) as unknown as Poem;

describe("saving never loses a poem written on another device", () => {
  const old = poem("a", "old", "2026-11-24T10:00:00Z");
  const memory = poem("memory", "I remember coming into work", "2026-11-24T15:15:00Z");

  it("keeps a poem this tab has never seen", () => {
    const merged = mergeShelves([old], [old, memory], new Set());
    expect(merged.map((p) => p.id)).toEqual(["a", "memory"]);
    expect(serverHasNews([old], merged)).toBe(true);
  });

  it("still lets a poem deleted here stay deleted", () => {
    expect(mergeShelves([old], [old, memory], new Set(["memory"])).map((p) => p.id)).toEqual(["a"]);
  });

  it("takes whichever copy was edited last", () => {
    const newerThere = poem("a", "edited on the phone", "2026-11-24T11:00:00Z");
    expect(mergeShelves([old], [newerThere], new Set())[0].content).toBe("edited on the phone");
    const newerHere = poem("a", "edited here", "2026-11-24T12:00:00Z");
    expect(mergeShelves([newerHere], [newerThere], new Set())[0].content).toBe("edited here");
  });

  it("reports nothing new when the shelves match", () => {
    expect(serverHasNews([old], mergeShelves([old], [old], new Set()))).toBe(false);
  });
});
