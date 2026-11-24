import { worldPoems, worldShelfAuthor, worldShelfTitle, type WorldPoem } from "@/data/world-poems";
import { favoriteId } from "@/stores/poem-store";

// Which shelf book belongs to which world poem, so the reader can show the original
const byShelfId = new Map<string, WorldPoem>(worldPoems.map((p) => [favoriteId(worldShelfTitle(p), worldShelfAuthor(p)), p]));

export const worldPoemForShelfId = (id: string): WorldPoem | null => byShelfId.get(id) ?? null;
export const shelfIdForWorldPoem = (p: WorldPoem): string => favoriteId(worldShelfTitle(p), worldShelfAuthor(p));

// The name a reader would know the poet by, for the foot of the spine
export const spineName = (p: WorldPoem): string => {
  const name = p.poet.replace(/\s*\(.*\)\s*/, "").trim();
  const parts = name.split(/\s+/);
  if (p.lang.startsWith("zh")) return name; // Li Bai, Du Fu: family name first, both short
  if (p.lang === "ko") return parts[0];
  return parts[parts.length - 1]; // Bashō, Issa, Rumi, Goethe
};
