import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  isAllowedOrigin,
  readerView,
  roleForCode,
  safeEqual,
  validatePoems,
  verifySessionToken,
} from "../../supabase/functions/_shared/shelf-core";

const secret = "test-secret";

describe("roleForCode", () => {
  const codes = { admin: "old-fashioned-1919", reader: "neat" };

  it("recognises the admin and reader codes", async () => {
    expect(await roleForCode("old-fashioned-1919", codes)).toBe("admin");
    expect(await roleForCode("neat", codes)).toBe("reader");
  });

  it("ignores surrounding spaces but nothing else", async () => {
    expect(await roleForCode("  neat ", codes)).toBe("reader");
    expect(await roleForCode("Neat", codes)).toBeNull();
  });

  it("rejects empty and wrong codes", async () => {
    expect(await roleForCode("", codes)).toBeNull();
    expect(await roleForCode("rye", codes)).toBeNull();
  });

  it("never lets anyone in when no reader code is configured", async () => {
    expect(await roleForCode("anything", { admin: "a1", reader: null })).toBeNull();
  });
});

describe("safeEqual", () => {
  it("compares values of different lengths safely", async () => {
    expect(await safeEqual("abc", "abc")).toBe(true);
    expect(await safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a valid token", async () => {
    const { token } = await createSessionToken(secret, "reader", 1000);
    expect(await verifySessionToken(secret, token, 2000)).toMatchObject({ role: "reader" });
  });

  it("rejects expired tokens", async () => {
    const { token, expiresAt } = await createSessionToken(secret, "admin", 0);
    expect(await verifySessionToken(secret, token, expiresAt + 1)).toBeNull();
  });

  it("rejects tokens signed with another secret", async () => {
    const { token } = await createSessionToken("other", "admin");
    expect(await verifySessionToken(secret, token)).toBeNull();
  });

  it("rejects a reader token edited to say admin", async () => {
    const { token } = await createSessionToken(secret, "reader");
    const [, signature] = token.split(".");
    const forgedPayload = btoa(JSON.stringify({ role: "admin", exp: Date.now() + 1e9 }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(await verifySessionToken(secret, `${forgedPayload}.${signature}`)).toBeNull();
  });

  it("rejects malformed tokens", async () => {
    expect(await verifySessionToken(secret, null)).toBeNull();
    expect(await verifySessionToken(secret, "garbage")).toBeNull();
    expect(await verifySessionToken(secret, "a.b.c")).toBeNull();
  });
});

describe("validatePoems", () => {
  it("accepts old poems without tags or mood", () => {
    const result = validatePoems([{ id: "a", title: "Wolf", content: "Line" }]);
    expect(result).toEqual({
      poems: [{ id: "a", title: "Wolf", content: "Line", tags: [], mood: null, createdAt: null, updatedAt: null }],
    });
  });

  it("normalises and de-duplicates tags", () => {
    const result = validatePoems([{ id: "a", title: "", content: "", tags: [" Love ", "love", "Dad"] }]);
    expect("poems" in result && result.poems[0].tags).toEqual(["love", "dad"]);
  });

  it("rejects unknown moods, duplicate ids and oversized content", () => {
    expect(validatePoems([{ id: "a", title: "", content: "", mood: "joyful-ish" }])).toHaveProperty("error");
    expect(
      validatePoems([
        { id: "a", title: "", content: "" },
        { id: "a", title: "", content: "" },
      ]),
    ).toHaveProperty("error");
    expect(validatePoems([{ id: "a", title: "", content: "x".repeat(20001) }])).toHaveProperty("error");
    expect(validatePoems("not a list")).toHaveProperty("error");
  });
});

describe("readerView", () => {
  it("hides empty poems", () => {
    const base = { tags: [], mood: null, createdAt: null, updatedAt: null };
    const view = readerView([
      { id: "a", title: "Wolf", content: "Line", ...base },
      { id: "b", title: "Untitled", content: "   ", ...base },
    ]);
    expect(view.map((p) => p.id)).toEqual(["a"]);
  });
});

describe("isAllowedOrigin", () => {
  it("allows the live site, previews and localhost", () => {
    expect(isAllowedOrigin("https://sharp-code-friend.lovable.app")).toBe(true);
    expect(isAllowedOrigin("https://abc.lovableproject.com")).toBe(true);
    expect(isAllowedOrigin("http://localhost:8080")).toBe(true);
  });

  it("blocks other sites and look-alikes", () => {
    expect(isAllowedOrigin("https://evil.example")).toBe(false);
    expect(isAllowedOrigin("https://lovable.app.evil.example")).toBe(false);
    expect(isAllowedOrigin("http://sharp-code-friend.lovable.app")).toBe(false);
    expect(isAllowedOrigin(null)).toBe(false);
  });

  it("allows configured extra origins", () => {
    expect(isAllowedOrigin("https://poems.example.com", ["https://poems.example.com"])).toBe(true);
  });
});
