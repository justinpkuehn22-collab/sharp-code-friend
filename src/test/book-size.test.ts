import { describe, expect, it } from "vitest";
import { bookSizes, spineDimensions } from "@/lib/book-size";
import { bodyCadence } from "@/components/poem-reader";
import type { Poem } from "@/data/poems";

const poem = (id: string, words: number) => ({ id, content: Array(words).fill("word").join(" ") }) as unknown as Poem;

describe("book sizes follow the poem's length", () => {
  it("makes longer poems bigger books", () => {
    const sizes = bookSizes([poem("short", 20), poem("mid", 120), poem("long", 400)]);
    expect(sizes.get("short")).toBe(0);
    expect(sizes.get("long")).toBe(1);
    expect(sizes.get("mid")!).toBeGreaterThan(0.4);
    const small = spineDimensions(0, 0.5);
    const big = spineDimensions(1, 0.5);
    expect(big.height).toBeGreaterThan(small.height + 60);
    expect(big.width).toBeGreaterThan(small.width + 20);
  });

  it("gives a lone poem a middle size", () => {
    expect(bookSizes([poem("only", 50)]).get("only")).toBe(0.5);
  });
});

describe("reading cadence", () => {
  it("types short poems slower than long ones, with a breath at each line", () => {
    const short = bodyCadence("x".repeat(200));
    const long = bodyCadence("x".repeat(1200));
    expect(short.speed).toBeGreaterThan(long.speed);
    expect(long.speed).toBeGreaterThanOrEqual(12);
    expect(short.pauses.line).toBeGreaterThan(long.pauses.line);
    expect(long.pauses.line).toBeGreaterThan(100);
  });
});
