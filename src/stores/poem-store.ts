import { create } from "zustand";
import { isWritten, type Poem } from "@/data/poems";

type EditablePoemFields = Pick<Poem, "title" | "content" | "tags" | "mood">;

interface PoemStore {
  poems: Poem[];
  // Bumps on every local edit so the sync hook knows when to save
  revision: number;
  setPoems: (poems: Poem[]) => void;
  createPoem: () => string;
  updatePoem: (id: string, updates: Partial<EditablePoemFields>) => void;
  deletePoem: (id: string) => void;
  // Drops a poem if it was left blank, so empty books never sit on the shelf
  discardIfEmpty: (id: string) => void;
  importPoems: (items: Array<Pick<Poem, "title" | "content">>) => number;
}

const newId = (): string =>
  `poem-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

const nowIso = (): string => new Date().toISOString();

export const usePoemStore = create<PoemStore>()((set, get) => ({
  poems: [],
  revision: 0,
  setPoems: (poems) => set({ poems: poems.filter(isWritten) }),
  createPoem: () => {
    const id = newId();
    const stamp = nowIso();
    set((state) => ({
      poems: [...state.poems, { id, title: "", content: "", tags: [], mood: null, createdAt: stamp, updatedAt: stamp }],
    }));
    return id;
  },
  updatePoem: (id, updates) =>
    set((state) => ({
      poems: state.poems.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: nowIso() } : p)),
      revision: state.revision + 1,
    })),
  deletePoem: (id) =>
    set((state) => ({ poems: state.poems.filter((p) => p.id !== id), revision: state.revision + 1 })),
  discardIfEmpty: (id) => {
    const poem = get().poems.find((p) => p.id === id);
    if (poem && !isWritten(poem)) {
      set((state) => ({ poems: state.poems.filter((p) => p.id !== id), revision: state.revision + 1 }));
    }
  },
  importPoems: (items) => {
    const stamp = nowIso();
    const fresh: Poem[] = items
      .filter((item) => item.content.trim() !== "")
      .map((item) => ({ id: newId(), title: item.title, content: item.content, tags: [], mood: null, createdAt: stamp, updatedAt: stamp }));
    if (fresh.length > 0) set((state) => ({ poems: [...state.poems, ...fresh], revision: state.revision + 1 }));
    return fresh.length;
  },
}));
