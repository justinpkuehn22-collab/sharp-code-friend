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

  it("ignores capital letters and spaces", async () => {
    expect(await roleForCode("  neat ", codes)).toBe("reader");
    expect(await roleForCode("Neat", codes)).toBe("reader");
    expect(await roleForCode("On the rocks", { admin: "1106", reader: "Ontherocks" })).toBe("reader");
    expect(await roleForCode("ONTHEROCKS", { admin: "1106", reader: "Ontherocks" })).toBe("reader");
    expect(await roleForCode(" 1106 ", { admin: "1106", reader: "Ontherocks" })).toBe("admin");
  });

  it("still rejects near misses", async () => {
    expect(await roleForCode("ontherock", { admin: "1106", reader: "Ontherocks" })).toBeNull();
    expect(await roleForCode("1107", { admin: "1106", reader: "Ontherocks" })).toBeNull();
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
      poems: [{ id: "a", title: "Wolf", content: "Line", tags: [], mood: null, createdAt: null, updatedAt: null, kind: "own", author: null }],
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
    const base = { tags: [], mood: null, createdAt: null, updatedAt: null, kind: "own" as const, author: null };
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

import { resolveCodes } from "../../supabase/functions/_shared/shelf-core";

describe("resolveCodes", () => {
  const env = (vars: Record<string, string>) => (name: string) => vars[name];

  it("reads the standard secret names", () => {
    expect(resolveCodes(env({ ADMIN_CODE: "1106", READER_CODE: "Ontherocks" }))).toMatchObject({
      admin: "1106",
      reader: "Ontherocks",
      adminFrom: "ADMIN_CODE",
      readerFrom: "READER_CODE",
    });
  });

  it("accepts common variations of the names", () => {
    const codes = resolveCodes(env({ ADMIN_PASSWORD: "1106", READER_PASSWORD: "Ontherocks" }));
    expect(codes.admin).toBe("1106");
    expect(codes.reader).toBe("Ontherocks");
  });

  it("ignores blank secrets", () => {
    expect(resolveCodes(env({ ADMIN_CODE: "  ", OWNER_CODE: "1106" })).admin).toBe("1106");
  });

  it("only lets the old site password read, and never when it equals the admin code", () => {
    expect(resolveCodes(env({ SITE_PASSWORD: "1234" }))).toMatchObject({ admin: null, reader: "1234" });
    expect(resolveCodes(env({ SITE_PASSWORD: "1106", ADMIN_CODE: "1106" }))).toMatchObject({ admin: "1106", reader: null });
    expect(resolveCodes(env({ SITE_PASSWORD: "1234", READER_CODE: "Ontherocks" })).reader).toBe("Ontherocks");
  });
});

describe("favorites from the library", () => {
  it("keeps the author for favorites and drops it for own poems", () => {
    const result = validatePoems([
      { id: "a", title: "Ozymandias", content: "I met a traveller", kind: "favorite", author: " Percy Bysshe Shelley " },
      { id: "b", title: "Wolf", content: "Line", author: "Someone else" },
    ]);
    if (!("poems" in result)) throw new Error(result.error);
    expect(result.poems[0]).toMatchObject({ kind: "favorite", author: "Percy Bysshe Shelley" });
    expect(result.poems[1]).toMatchObject({ kind: "own", author: null });
  });

  it("rejects favorites without an author and unknown kinds", () => {
    expect(validatePoems([{ id: "a", title: "t", content: "x", kind: "favorite" }])).toHaveProperty("error");
    expect(validatePoems([{ id: "a", title: "t", content: "x", kind: "stolen" }])).toHaveProperty("error");
  });
});
