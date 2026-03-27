import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Poem } from "@/data/poems";
import { defaultPoems } from "@/data/poems";

interface PoemStore {
  poems: Poem[];
  updatePoem: (id: string, updates: Partial<Pick<Poem, "title" | "content">>) => void;
}

export const usePoemStore = create<PoemStore>()(
  persist(
    (set) => ({
      poems: defaultPoems,
      updatePoem: (id, updates) =>
        set((state) => ({
          poems: state.poems.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),
    }),
    { name: "poetry-shelf" },
  ),
);
