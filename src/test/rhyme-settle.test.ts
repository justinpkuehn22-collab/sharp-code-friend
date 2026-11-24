import { describe, expect, it } from "vitest";
import { lineIsFinished, settleText } from "@/components/rhyme-textarea";

describe("rhymes wait for a finished line", () => {
  it("knows a finished line by its punctuation", () => {
    expect(lineIsFinished("I wish for light to mend these cracks.")).toBe(true);
    expect(lineIsFinished("She searched the mirror of my soul,")).toBe(true);
    expect(lineIsFinished("Found only shadows staring back -")).toBe(true);
    expect(lineIsFinished('They say "Ask and you shall receive."')).toBe(true);
    expect(lineIsFinished("An endless void, so deep")).toBe(false);
  });

  it("holds the line being typed at its last finished version", () => {
    const before = "The night was cold,\nThe moon was bright.";
    const typing = "The night was cold,\nThe moon was bri";
    expect(settleText(typing, 1, before)).toBe(before);
  });

  it("leaves a brand-new unfinished line out until it's done", () => {
    const before = "The night was cold,";
    expect(settleText("The night was cold,\nAnd I was alo", 1, before)).toBe("The night was cold,\n");
    expect(settleText("The night was cold,\nAnd I was alone.", 1, before)).toBe("The night was cold,\nAnd I was alone.");
  });

  it("takes everything once the caret moves to a fresh line", () => {
    expect(settleText("The night was cold\nThe moon was bright\n", 2, "")).toBe("The night was cold\nThe moon was bright\n");
  });
});
