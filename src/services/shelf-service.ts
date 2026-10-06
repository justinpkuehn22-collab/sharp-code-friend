import type { Poem } from "@/data/poems";

const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shelf`;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export interface ShelfState {
  poems: Poem[];
  shelfSizes: number[];
}

const headers = (password: string) => ({
  "Content-Type": "application/json",
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
  "x-site-password": password,
});

export class WrongPasswordError extends Error {}

// Returns null when nothing has been saved online yet
export const fetchShelf = async (password: string): Promise<ShelfState | null> => {
  const res = await fetch(baseUrl, { headers: headers(password) });
  if (res.status === 401) throw new WrongPasswordError("Wrong password");
  if (!res.ok) throw new Error("Could not load the shelf");
  const data = (await res.json()) as { state: { poems: Poem[]; shelf_sizes: number[] } | null };
  if (!data.state) return null;
  return { poems: data.state.poems, shelfSizes: data.state.shelf_sizes };
};

export const saveShelf = async (password: string, state: ShelfState): Promise<void> => {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: headers(password),
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error("Could not save the shelf");
};

// Stores a copy in the backup history without touching the live shelf
export const backupShelf = async (password: string, state: ShelfState): Promise<void> => {
  const res = await fetch(`${baseUrl}?backup=1`, {
    method: "POST",
    headers: headers(password),
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error("Could not back up the shelf");
};

export const countWritten = (poems: Poem[]): number =>
  poems.filter((p) => p.content.trim() !== "").length;
