import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Poem } from "@/data/poems";
import { defaultPoems } from "@/data/poems";

interface PoemStore {
  poems: Poem[];
  shelfSizes: number[];
  updatePoem: (id: string, updates: Partial<Pick<Poem, "title" | "content">>) => void;
  addShelf: () => void;
}

let nextId = 100;

export const usePoemStore = create<PoemStore>()(
  persist(
    (set) => ({
      poems: defaultPoems,
      shelfSizes: [7, 6, 7, 6],
      updatePoem: (id, updates) =>
        set((state) => ({
          poems: state.poems.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),
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
