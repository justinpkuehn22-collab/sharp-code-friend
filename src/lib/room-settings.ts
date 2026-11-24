// The owner's room settings travel with the shelf as one hidden record, so a saved
// theme follows him to every device without changing the backend.
import type { Poem, Role } from "@/data/poems";
import { roomThemes, type RoomTheme } from "@/stores/lounge-store";

export const settingsId = "settings-room";
const settingsName = "Room settings";

export interface RoomSettings {
  theme: RoomTheme | null;
}

// Guests walk into Gatsby green unless they've picked something else on their own device
export const guestDefaultTheme: RoomTheme = "emerald";

const isTheme = (v: unknown): v is RoomTheme => roomThemes.some((t) => t.id === v);

export const isSettingsRecord = (p: Pick<Poem, "id">) => p.id === settingsId;

export const readSettings = (p: Poem): RoomSettings => {
  try {
    const data: unknown = JSON.parse(p.content);
    const theme = typeof data === "object" && data !== null ? (data as Record<string, unknown>).theme : null;
    return { theme: isTheme(theme) ? theme : null };
  } catch {
    return { theme: null };
  }
};

export const settingsRecord = (s: RoomSettings, stamp: string): Poem => ({
  id: settingsId,
  title: settingsName,
  content: JSON.stringify(s),
  tags: [],
  mood: null,
  createdAt: stamp,
  updatedAt: stamp,
  // Stored as a favorite because the backend already accepts those; never shown as a book
  kind: "favorite",
  author: settingsName,
});

// Which theme the room should wear right now
export const effectiveTheme = (o: { role: Role | null; guestPreview: boolean; savedTheme: RoomTheme | null; localChoice: RoomTheme | null }): RoomTheme => {
  if (o.role === "admin" && !o.guestPreview) return o.savedTheme ?? guestDefaultTheme;
  // "View as guest" shows exactly what a guest sees on a first visit
  if (o.guestPreview) return guestDefaultTheme;
  return o.localChoice ?? guestDefaultTheme;
};
