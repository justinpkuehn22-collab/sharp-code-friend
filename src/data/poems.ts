import { moods, type Mood } from "../../supabase/functions/_shared/shelf-core";

export { moods };
export type { Mood };

export interface Poem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood: Mood | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type Role = "reader" | "admin";

export const moodLabels: Record<Mood, string> = {
  love: "Love",
  heartbreak: "Heartbreak",
  anger: "Anger",
  grief: "Grief",
  hope: "Hope",
  longing: "Longing",
  reflection: "Reflection",
  family: "Family",
};

export const isWritten = (poem: Pick<Poem, "content">): boolean => poem.content.trim() !== "";
