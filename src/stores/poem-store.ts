import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Poem } from "@/data/poems";
import { defaultPoems } from "@/data/poems";

interface PoemStore {
  poems: Poem[];
  shelfSizes: number[];
  updatePoem: (id: string, updates: Partial<Pick<Poem, "title" | "content">>) => void;
  deletePoem: (id: string) => void;
  addShelf: () => void;
}

let nextId = 100;

export const usePoemStore = create<PoemStore>()(
  persist(
    (set) => ({
      poems: defaultPoems,
      shelfSizes: [7, 6],
      updatePoem: (id, updates) =>
        set((state) => ({
          poems: state.poems.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),
      deletePoem: (id) =>
        set((state) => {
          const poemIdx = state.poems.findIndex((p) => p.id === id);
          if (poemIdx === -1) return state;

          // Find which shelf this poem is on
          let offset = 0;
          let shelfIdx = 0;
          for (let s = 0; s < state.shelfSizes.length; s++) {
            if (poemIdx < offset + state.shelfSizes[s]) {
              shelfIdx = s;
              break;
            }
            offset += state.shelfSizes[s];
          }

          const newPoems = state.poems.filter((p) => p.id !== id);
          const newSizes = [...state.shelfSizes];
          newSizes[shelfIdx] = Math.max(0, newSizes[shelfIdx] - 1);

          // Remove empty shelves
          const filteredSizes = newSizes.filter((s) => s > 0);

          return {
            poems: newPoems,
            shelfSizes: filteredSizes.length > 0 ? filteredSizes : [0],
          };
        }),
      addShelf: () =>
        set((state) => {
          const count = 6;
          const newPoems: Poem[] = Array.from({ length: count }, (_, i) => ({
            id: `poem-${nextId++}-${Date.now()}-${i}`,
            title: "Untitled",
            content: "",
          }));
          return {
            poems: [...state.poems, ...newPoems],
            shelfSizes: [...state.shelfSizes, count],
          };
        }),
    }),
    { name: "poetry-shelf" },
  ),
);
