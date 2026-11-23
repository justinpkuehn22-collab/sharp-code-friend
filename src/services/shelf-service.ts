import type { Poem, Role } from "@/data/poems";

const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shelf`;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// The publishable key only lets the request reach the function; the shelf session does the real work
const baseHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { "Content-Type": "application/json", apikey: publishableKey };
  if (!publishableKey.startsWith("sb_")) headers.Authorization = `Bearer ${publishableKey}`;
  return headers;
};

export class WrongCodeError extends Error {}
export class TooManyAttemptsError extends Error {}
export class SignedOutError extends Error {}

export interface SessionInfo {
  token: string;
  role: Role;
  expiresAt: number;
}

export const signIn = async (code: string): Promise<SessionInfo> => {
  const res = await fetch(`${baseUrl}?action=login`, {
    method: "POST",
    headers: baseHeaders(),
    body: JSON.stringify({ code }),
  });
  if (res.status === 401) throw new WrongCodeError("Wrong code");
  if (res.status === 429) throw new TooManyAttemptsError("Too many attempts");
  if (!res.ok) throw new Error("Could not sign in");
  return (await res.json()) as SessionInfo;
};

export const fetchShelf = async (token: string): Promise<{ role: Role; poems: Poem[] }> => {
  const res = await fetch(baseUrl, { headers: { ...baseHeaders(), "x-shelf-session": token } });
  if (res.status === 401) throw new SignedOutError("Signed out");
  if (!res.ok) throw new Error("Could not load the shelf");
  return (await res.json()) as { role: Role; poems: Poem[] };
};

export const saveShelf = async (token: string, poems: Poem[], options: { keepalive?: boolean } = {}): Promise<void> => {
  const body = JSON.stringify({ poems });
  const res = await fetch(`${baseUrl}?action=save`, {
    method: "POST",
    // Browsers only allow small keepalive bodies, so use it just for the close-the-tab save
    keepalive: options.keepalive === true && body.length < 60_000,
    headers: { ...baseHeaders(), "x-shelf-session": token },
    body,
  });
  if (res.status === 401 || res.status === 403) throw new SignedOutError("Signed out");
  if (!res.ok) throw new Error("Could not save the shelf");
};
