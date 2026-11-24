import { describe, expect, it } from "vitest";
import { kindredPoems, themeProfile } from "@/lib/poem-themes";

describe("kindred poems", () => {
  const night = "The moon sets over the hills and I sleep alone tonight in the dark";
  const candidates = [
    { item: "moon", text: "Before my bed the bright moonlight; I lower my head and think of home" },
    { item: "war", text: "The sword and the spear, blood on the field, rage of the enemy" },
    { item: "sea", text: "A lonely sail on the blue sea asks for the storm" },
  ];

  it("finds poems on the same themes first", () => {
    const found = kindredPoems(night, [], candidates);
    expect(found[0].item).toBe("moon");
    expect(found[0].kinship.shared).toContain("night");
    expect(found.map((f) => f.item)).not.toContain("war");
  });

  it("counts moods and tags the writer chose", () => {
    expect(themeProfile("words", ["grief"]).themes.get("grief")).toBe(1);
  });

  it("matches word forms", () => {
    expect(themeProfile("flowers blossoming, tears weeping").themes.size).toBeGreaterThan(0);
  });
});
