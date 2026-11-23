import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  createSessionToken,
  isAllowedOrigin,
  limits,
  loginLimits,
  normaliseStored,
  readerView,
  resolveCodes,
  roleForCode,
  sha256Hex,
  validatePoems,
  verifySessionToken,
  type StoredPoem,
} from "../_shared/shelf-core.ts";

// Secrets (set in Lovable Cloud → Secrets):
//   ADMIN_CODE   – your code (ADMIN_PASSWORD / OWNER_CODE also work). Required to edit.
//   READER_CODE  – the code friends use (READER_PASSWORD / GUEST_CODE also work). Until it's set,
//                  the old SITE_PASSWORD works for reading only.
//   SHELF_ALLOWED_ORIGINS – optional comma-separated extra origins (e.g. a custom domain)
// Secrets are read on every request, so a newly added one works straight away.
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const extraOrigins = (Deno.env.get("SHELF_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const currentCodes = () => resolveCodes((name) => Deno.env.get(name));

// Sessions are signed with a key tied to the current codes: changing a code signs everyone out
const sessionSecret = (codes = currentCodes()): Promise<string> =>
  sha256Hex(`${Deno.env.get("SHELF_SESSION_SECRET") ?? serviceKey}|${codes.admin ?? ""}|${codes.reader ?? ""}`);

const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey, {
  auth: { persistSession: false },
});

const corsFor = (origin: string | null): Record<string, string> => ({
  ...(isAllowedOrigin(origin, extraOrigins) && origin ? { "Access-Control-Allow-Origin": origin } : {}),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-shelf-session",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  Vary: "Origin",
});

const reply = (origin: string | null, body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsFor(origin),
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });

const clientKey = async (req: Request): Promise<string> => {
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  // Store only a keyed hash, never the raw IP
  // Keyed with the service key only, so changing a code doesn't reset the guess counter
  return sha256Hex(`${serviceKey}|ip|${ip}`);
};

// Backup limiter kept in memory, used only if the attempts table isn't available yet
const memoryAttempts = new Map<string, number[]>();
const memoryWindowMs = loginLimits.windowMinutes * 60 * 1000;
const recentMemoryAttempts = (key: string): number[] => {
  const cutoff = Date.now() - memoryWindowMs;
  const kept = (memoryAttempts.get(key) ?? []).filter((t) => t > cutoff);
  memoryAttempts.set(key, kept);
  return kept;
};
const memoryTooMany = (ipHash: string): boolean =>
  recentMemoryAttempts(ipHash).length >= loginLimits.perClient ||
  recentMemoryAttempts("*").length >= loginLimits.global;
const recordFailure = async (ipHash: string): Promise<void> => {
  const now = Date.now();
  memoryAttempts.set(ipHash, [...recentMemoryAttempts(ipHash), now]);
  memoryAttempts.set("*", [...recentMemoryAttempts("*"), now]);
  await supabase.from("shelf_login_attempts").insert({ ip_hash: ipHash });
};

const tooManyAttempts = async (ipHash: string): Promise<boolean> => {
  if (memoryTooMany(ipHash)) return true;
  const since = new Date(Date.now() - loginLimits.windowMinutes * 60 * 1000).toISOString();
  const [mine, all] = await Promise.all([
    supabase
      .from("shelf_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("attempted_at", since),
    supabase
      .from("shelf_login_attempts")
      .select("id", { count: "exact", head: true })
      .gte("attempted_at", since),
  ]);
  // If the table isn't there yet, rely on the in-memory limiter rather than locking everyone out
  if (mine.error || all.error) {
    console.error("attempts table unavailable; using in-memory limit");
    return false;
  }
  return (mine.count ?? 0) >= loginLimits.perClient || (all.count ?? 0) >= loginLimits.global;
};

const loadPoems = async (): Promise<StoredPoem[] | null> => {
  const { data, error } = await supabase.from("shelf_state").select("poems").eq("id", 1).maybeSingle();
  if (error) {
    console.error("load failed", error.message);
    return null;
  }
  return normaliseStored(data?.poems ?? []);
};

const handleLogin = async (req: Request, origin: string | null): Promise<Response> => {
  const body: unknown = await req.json().catch(() => null);
  const code = body && typeof body === "object" ? (body as Record<string, unknown>).code : undefined;
  if (typeof code !== "string" || code.length > 200) return reply(origin, { error: "invalid_request" }, 400);

  const ipHash = await clientKey(req);
  if (await tooManyAttempts(ipHash)) {
    return reply(origin, { error: "too_many_attempts" }, 429, { "Retry-After": String(loginLimits.windowMinutes * 60) });
  }

  const codes = currentCodes();
  const role = await roleForCode(code, { admin: codes.admin, reader: codes.reader });
  if (!role) {
    await recordFailure(ipHash);
    return reply(origin, { error: "wrong_code" }, 401);
  }
  // A correct code clears this visitor's failed attempts
  memoryAttempts.delete(ipHash);
  await supabase.from("shelf_login_attempts").delete().eq("ip_hash", ipHash);
  const { token, expiresAt } = await createSessionToken(await sessionSecret(codes), role);
  return reply(origin, { token, role, expiresAt });
};

const handleSave = async (req: Request, origin: string | null): Promise<Response> => {
  const length = Number(req.headers.get("content-length") ?? "0");
  if (length > limits.maxBodyBytes) return reply(origin, { error: "too_large" }, 413);
  const raw = await req.text();
  if (raw.length > limits.maxBodyBytes) return reply(origin, { error: "too_large" }, 413);
  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(origin, { error: "invalid_request" }, 400);
  }
  const result = validatePoems(body && typeof body === "object" ? (body as Record<string, unknown>).poems : null);
  if ("error" in result) return reply(origin, { error: "invalid_poems", detail: result.error }, 400);

  // Snapshot the previous version, at most once every 10 minutes, so history stays useful
  const { data: prev } = await supabase.from("shelf_state").select("poems, shelf_sizes").eq("id", 1).maybeSingle();
  if (prev) {
    const { data: last } = await supabase
      .from("shelf_history")
      .select("saved_at")
      .order("saved_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastAt = last?.saved_at ? Date.parse(last.saved_at) : 0;
    if (Date.now() - lastAt > 10 * 60 * 1000) {
      await supabase.from("shelf_history").insert({ poems: prev.poems, shelf_sizes: prev.shelf_sizes });
    }
  }

  const written = readerView(result.poems).length;
  const shelfSizes: number[] = [];
  for (let i = 0; i < written; i += 7) shelfSizes.push(Math.min(7, written - i));

  const { error } = await supabase.from("shelf_state").upsert({
    id: 1,
    poems: result.poems,
    shelf_sizes: shelfSizes,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("save failed", error.message);
    return reply(origin, { error: "save_failed" }, 500);
  }
  return reply(origin, { ok: true });
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsFor(origin) });
  if (origin && !isAllowedOrigin(origin, extraOrigins)) return reply(origin, { error: "forbidden_origin" }, 403);
  const codes = currentCodes();

  // Safe to call by anyone: says which codes are set up, never what they are
  if (req.method === "GET" && new URL(req.url).searchParams.get("action") === "status") {
    return reply(origin, {
      adminCodeSet: codes.admin !== null,
      adminSecretName: codes.adminFrom,
      readerCodeSet: codes.reader !== null,
      readerSecretName: codes.readerFrom,
      // Lets the site know this backend can store favorites from the library
      features: ["favorites"],
    });
  }

  if ((!codes.admin && !codes.reader) || serviceKey === "") return reply(origin, { error: "not_configured" }, 503);

  const action = new URL(req.url).searchParams.get("action");

  try {
    if (req.method === "POST" && action === "login") return await handleLogin(req, origin);

    const session = await verifySessionToken(await sessionSecret(codes), req.headers.get("x-shelf-session"));
    if (!session) return reply(origin, { error: "signed_out" }, 401);

    // Admin only: the reader's code, so the owner can share it with friends
    if (req.method === "GET" && action === "invite") {
      if (session.role !== "admin") return reply(origin, { error: "admin_only" }, 403);
      if (!codes.reader) return reply(origin, { error: "no_reader_code" }, 404);
      return reply(origin, { readerCode: codes.reader });
    }

    if (req.method === "GET") {
      const poems = await loadPoems();
      if (!poems) return reply(origin, { error: "load_failed" }, 500);
      return reply(origin, { role: session.role, poems: session.role === "admin" ? poems : readerView(poems) });
    }

    if (req.method === "POST" && action === "save") {
      if (session.role !== "admin") return reply(origin, { error: "admin_only" }, 403);
      return await handleSave(req, origin);
    }

    return reply(origin, { error: "not_found" }, 404);
  } catch (e) {
    console.error("unexpected", e instanceof Error ? e.message : "unknown");
    return reply(origin, { error: "server_error" }, 500);
  }
});
