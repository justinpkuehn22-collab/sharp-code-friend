import { afterEach, describe, expect, it, vi } from "vitest";

describe("the Vercel relay", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("passes requests to the backend without the browser's origin", async () => {
    process.env.SHELF_BACKEND_URL = "https://example.supabase.co";
    const calls: Array<{ url: string; init: RequestInit }> = [];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ token: "t", role: "reader" }), { status: 200, headers: { "content-type": "application/json" } });
    });
    const { POST } = await import("../../api/shelf");
    const res = await POST(
      new Request("https://poetry-shelf.vercel.app/api/shelf?action=login", {
        method: "POST",
        headers: { origin: "https://poetry-shelf.vercel.app", apikey: "pk", "content-type": "application/json" },
        body: JSON.stringify({ code: "x" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(calls[0].url).toBe("https://example.supabase.co/functions/v1/shelf?action=login");
    const sent = calls[0].init.headers as Headers;
    expect(sent.get("apikey")).toBe("pk");
    expect(sent.get("origin")).toBeNull();
    expect(calls[0].init.body).toBe(JSON.stringify({ code: "x" }));
  });
});
