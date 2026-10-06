import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-site-password",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const expected = Deno.env.get("SITE_PASSWORD");
  const given = req.headers.get("x-site-password");
  if (!expected || given !== expected) return json({ error: "Wrong password" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("shelf_state")
      .select("poems, shelf_sizes")
      .eq("id", 1)
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    return json({ state: data });
  }

  if (req.method === "POST") {
    const body: unknown = await req.json().catch(() => null);
    if (
      !body || typeof body !== "object" ||
      !Array.isArray((body as Record<string, unknown>).poems) ||
      !Array.isArray((body as Record<string, unknown>).shelfSizes)
    ) {
      return json({ error: "Invalid body" }, 400);
    }
    const b = body as { poems: unknown[]; shelfSizes: unknown[] };
    const { error } = await supabase.from("shelf_state").upsert({
      id: 1,
      poems: b.poems,
      shelf_sizes: b.shelfSizes,
      updated_at: new Date().toISOString(),
    });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});
