// Vercel function: passes shelf requests through to the backend (a Supabase edge
// function on Lovable Cloud). The browser talks only to this site, so no CORS setup
// is needed on the backend for the Vercel address.

const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
// The backend's public address (the same one in the repo's .env); SHELF_BACKEND_URL can override it
const defaultBackend = "https://dxduptyrlcjubeytgkbh.supabase.co";
const backend = () => `${env.SHELF_BACKEND_URL ?? env.VITE_SUPABASE_URL ?? defaultBackend}/functions/v1/shelf`;

// Only the headers the backend needs; the browser's Origin is left out on purpose
const forwarded = ["apikey", "authorization", "content-type", "x-shelf-session"];

const relay = async (request: Request): Promise<Response> => {
  if (!backend().startsWith("https://")) return Response.json({ error: "not_configured" }, { status: 500 });
  const url = new URL(request.url);
  const headers = new Headers();
  for (const name of forwarded) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const body = request.method === "POST" ? await request.text() : undefined;
  const upstream = await fetch(`${backend()}${url.search}`, { method: request.method, headers, body });
  const out = new Headers({ "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "no-store" });
  const retry = upstream.headers.get("retry-after");
  if (retry) out.set("retry-after", retry);
  return new Response(await upstream.text(), { status: upstream.status, headers: out });
};

export const GET = relay;
export const POST = relay;
