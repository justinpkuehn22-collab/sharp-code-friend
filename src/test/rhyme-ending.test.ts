import { describe, expect, it } from "vitest";
import { splitEnding } from "@/lib/rhyme";

describe("splitEnding", () => {
  const cases: Array<[string, string]> = [
    ["She searched the mirror of my soul,", "soul,"],
    ["Found only shadows staring back -", "back"],
    ["I wanted just to hold it", "hold it"],
    ["  trailing spaces  ", "spaces"],
    ["one", "one"],
  ];
  it.each(cases)("finds the ending of %j", (line, end) => {
    const parts = splitEnding(line);
    expect(parts.end).toBe(end);
    expect(parts.head + parts.end + parts.tail).toBe(line);
  });
  it("leaves lines without words alone", () => {
    expect(splitEnding("— —")).toEqual({ head: "— —", end: "", tail: "" });
  });
});
