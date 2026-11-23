// Pure, runtime-agnostic helpers for the shelf edge function.
// Uses only Web Crypto so it runs in Deno (edge) and Node (unit tests).

export type Role = "reader" | "admin";

export const moods = [
  "love",
  "heartbreak",
  "anger",
  "grief",
  "hope",
  "longing",
  "reflection",
  "family",
] as const;
export type Mood = (typeof moods)[number];

export interface StoredPoem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood: Mood | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export const limits = {
  maxPoems: 1000,
  maxTitle: 200,
  maxContent: 20000,
  maxTags: 12,
  maxTagLength: 30,
  maxIdLength: 100,
  maxBodyBytes: 2_000_000,
  sessionHours: { reader: 24 * 30, admin: 12 } as Record<Role, number>,
};

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (value: string): Uint8Array => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

const hmac = async (key: string, message: string): Promise<Uint8Array> => {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message)));
};

export const sha256Hex = async (value: string): Promise<string> => {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
};

// Constant-time comparison: both sides are hashed first so lengths always match
export const safeEqual = async (a: string, b: string): Promise<boolean> => {
  const [ha, hb] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  return diff === 0;
};

// Codes ignore capital letters and spaces, so "On the rocks" and "ontherocks" both work
export const normaliseCode = (code: string): string => code.toLowerCase().replace(/\s+/g, "");

// Works out which role (if any) a typed code unlocks. Admin wins if both match.
export const roleForCode = async (
  code: string,
  codes: { admin?: string | null; reader?: string | null },
): Promise<Role | null> => {
  const given = normaliseCode(code);
  if (!given) return null;
  const admin = codes.admin ? normaliseCode(codes.admin) : "";
  const reader = codes.reader ? normaliseCode(codes.reader) : "";
  // Always run both comparisons so timing doesn't reveal which code exists
  const [isAdmin, isReader] = await Promise.all([
    admin ? safeEqual(given, admin) : Promise.resolve(false),
    reader ? safeEqual(given, reader) : Promise.resolve(false),
  ]);
  if (isAdmin) return "admin";
  if (isReader) return "reader";
  return null;
};

export interface Session {
  role: Role;
  exp: number;
}

export const createSessionToken = async (
  secret: string,
  role: Role,
  now = Date.now(),
): Promise<{ token: string; expiresAt: number }> => {
  const exp = now + limits.sessionHours[role] * 60 * 60 * 1000;
  const payload = toBase64Url(encoder.encode(JSON.stringify({ role, exp })));
  const signature = toBase64Url(await hmac(secret, payload));
  return { token: `${payload}.${signature}`, expiresAt: exp };
};

export const verifySessionToken = async (
  secret: string,
  token: string | null,
  now = Date.now(),
): Promise<Session | null> => {
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  const expected = toBase64Url(await hmac(secret, payload));
  if (!(await safeEqual(signature, expected))) return null;
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (!parsed || typeof parsed !== "object") return null;
    const { role, exp } = parsed as Record<string, unknown>;
    if ((role !== "reader" && role !== "admin") || typeof exp !== "number") return null;
    if (exp <= now) return null;
    return { role, exp };
  } catch {
    return null;
  }
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const cleanTag = (tag: string): string => tag.trim().toLowerCase().replace(/\s+/g, " ");

const optionalDate = (v: unknown): string | null =>
  typeof v === "string" && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null;

// Validates and normalises a poem list coming from the admin's browser.
// Returns an error message instead of throwing so callers can answer with 400.
export const validatePoems = (input: unknown): { poems: StoredPoem[] } | { error: string } => {
  if (!Array.isArray(input)) return { error: "Poems must be a list" };
  if (input.length > limits.maxPoems) return { error: "Too many poems" };
  const seen = new Set<string>();
  const poems: StoredPoem[] = [];
  for (const raw of input) {
    if (!isRecord(raw)) return { error: "Each poem must be an object" };
    const { id, title, content, tags, mood, createdAt, updatedAt } = raw;
    if (typeof id !== "string" || !id || id.length > limits.maxIdLength) return { error: "Invalid poem id" };
    if (seen.has(id)) return { error: "Duplicate poem id" };
    seen.add(id);
    if (typeof title !== "string" || title.length > limits.maxTitle) return { error: "Invalid poem title" };
    if (typeof content !== "string" || content.length > limits.maxContent) return { error: "Invalid poem content" };
    let cleanTags: string[] = [];
    if (tags !== undefined) {
      if (!Array.isArray(tags) || tags.length > limits.maxTags) return { error: "Invalid tags" };
      for (const t of tags) {
        if (typeof t !== "string" || cleanTag(t).length === 0 || cleanTag(t).length > limits.maxTagLength) {
          return { error: "Invalid tag" };
        }
      }
      cleanTags = Array.from(new Set(tags.map((t) => cleanTag(t as string))));
    }
    let cleanMood: Mood | null = null;
    if (mood !== undefined && mood !== null) {
      if (typeof mood !== "string" || !(moods as readonly string[]).includes(mood)) return { error: "Invalid mood" };
      cleanMood = mood as Mood;
    }
    poems.push({
      id,
      title,
      content,
      tags: cleanTags,
      mood: cleanMood,
      createdAt: optionalDate(createdAt),
      updatedAt: optionalDate(updatedAt),
    });
  }
  return { poems };
};

// Normalises whatever is stored (older rows have no tags/mood) into StoredPoem
export const normaliseStored = (input: unknown): StoredPoem[] => {
  const result = validatePoems(Array.isArray(input) ? input : []);
  return "poems" in result ? result.poems : [];
};

// What a guest with the reader code is allowed to see
export const readerView = (poems: StoredPoem[]): StoredPoem[] =>
  poems.filter((p) => p.content.trim() !== "");

export const isAllowedOrigin = (origin: string | null, extra: string[] = []): boolean => {
  if (!origin) return false;
  if (extra.includes(origin)) return true;
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol === "http:" && (hostname === "localhost" || hostname === "127.0.0.1")) return true;
    if (protocol !== "https:") return false;
    return (
      hostname.endsWith(".lovable.app") ||
      hostname.endsWith(".lovableproject.com") ||
      hostname === "lovable.dev" ||
      hostname.endsWith(".lovable.dev")
    );
  } catch {
    return false;
  }
};

export const loginLimits = {
  windowMinutes: 15,
  perClient: 5,
  global: 60,
};

// Secret names we accept, so a slightly different name in the dashboard still works
export const adminSecretNames = ["ADMIN_CODE", "ADMIN_PASSWORD", "OWNER_CODE", "OWNER_PASSWORD", "ADMIN"];
export const readerSecretNames = ["READER_CODE", "READER_PASSWORD", "GUEST_CODE", "GUEST_PASSWORD", "READER"];

export interface ResolvedCodes {
  admin: string | null;
  reader: string | null;
  adminFrom: string | null;
  readerFrom: string | null;
}

// Finds the admin and reader codes from whatever secrets are set.
// The old SITE_PASSWORD only ever grants reading, and never if it equals the admin code.
export const resolveCodes = (getEnv: (name: string) => string | undefined): ResolvedCodes => {
  const first = (names: string[]) => {
    for (const name of names) {
      const value = getEnv(name)?.trim();
      if (value) return { value, name };
    }
    return null;
  };
  const admin = first(adminSecretNames);
  let reader = first(readerSecretNames);
  if (!reader) {
    const legacy = getEnv("SITE_PASSWORD")?.trim();
    if (legacy && (!admin || normaliseCode(legacy) !== normaliseCode(admin.value))) reader = { value: legacy, name: "SITE_PASSWORD" };
  }
  return { admin: admin?.value ?? null, reader: reader?.value ?? null, adminFrom: admin?.name ?? null, readerFrom: reader?.name ?? null };
};
