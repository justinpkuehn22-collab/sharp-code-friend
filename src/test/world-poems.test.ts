import { describe, expect, it } from "vitest";
import { worldPoems, worldRegions } from "@/data/world-poems";
import { shelfIdForWorldPoem, spineName, worldPoemForShelfId } from "@/lib/world-shelf";
import { masterExamples } from "@/data/master-examples";
import { favoriteId } from "@/stores/poem-store";

const lines = (s: string) => s.split("\n").filter((l) => l.trim()).length;

describe("world poems", () => {
  it("has unique ids and shelf ids", () => {
    expect(new Set(worldPoems.map((p) => p.id)).size).toBe(worldPoems.length);
    expect(new Set(worldPoems.map(shelfIdForWorldPoem)).size).toBe(worldPoems.length);
  });

  it("covers many languages and every region", () => {
    expect(new Set(worldPoems.map((p) => p.language)).size).toBeGreaterThanOrEqual(15);
    for (const r of worldRegions) expect(worldPoems.some((p) => p.region === r)).toBe(true);
  });

  it("marks right-to-left scripts", () => {
    for (const p of worldPoems) {
      const rtlScript = /[֐-ۿ]/.test(p.original);
      expect(Boolean(p.rtl), p.id).toBe(rtlScript);
    }
  });

  it("keeps romanizations line for line with the original", () => {
    for (const p of worldPoems.filter((w) => w.romanization)) expect(lines(p.romanization as string), p.id).toBe(lines(p.original));
  });

  it("translates line for line, except the credited older translations", () => {
    for (const p of worldPoems.filter((w) => w.translator.startsWith("Translated for"))) {
      expect(Math.abs(lines(p.translation) - lines(p.original)), p.id).toBeLessThanOrEqual(1);
    }
  });

  it("finds a world poem from its shelf book", () => {
    const p = worldPoems[0];
    expect(worldPoemForShelfId(shelfIdForWorldPoem(p))?.id).toBe(p.id);
    expect(worldPoemForShelfId("fav-someone-else")).toBeNull();
  });

  it("names poets the way readers know them", () => {
    const by = (id: string) => worldPoems.find((p) => p.id === id)!;
    expect(spineName(by("basho-old-pond"))).toBe("Bashō");
    expect(spineName(by("li-bai-quiet-night"))).toBe("Li Bai");
    expect(spineName(by("sappho-midnight"))).toBe("Sappho");
  });

  it("gives famous passages stable shelf ids", () => {
    expect(new Set(masterExamples.map((m) => favoriteId(m.poem, m.poet))).size).toBeGreaterThan(20);
  });
});

describe("saving a famous poem whole", () => {
  it("only accepts the same poem by the same poet", async () => {
    const { fetchWholePoem } = await import("@/services/poetry-library");
    const reply = [{ title: '"Hope" is the thing with feathers', author: "Emily Dickinson", linecount: "12", lines: ["x"] }];
    const original = globalThis.fetch;
    globalThis.fetch = (async () => new Response(JSON.stringify(reply))) as typeof fetch;
    try {
      expect((await fetchWholePoem("“Hope” is the thing with feathers", "Emily Dickinson"))?.author).toBe("Emily Dickinson");
      expect(await fetchWholePoem("The Red Wheelbarrow", "William Carlos Williams")).toBeNull();
    } finally {
      globalThis.fetch = original;
    }
  });
});
