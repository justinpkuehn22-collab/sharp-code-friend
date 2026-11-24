import { create } from "zustand";
import { isWritten, type Mood, type Poem } from "@/data/poems";
import { isSettingsRecord, readSettings, settingsRecord, type RoomSettings } from "@/lib/room-settings";
import type { RoomTheme } from "@/stores/lounge-store";

type EditablePoemFields = Pick<Poem, "title" | "content" | "tags" | "mood">;

interface PoemStore {
  poems: Poem[];
  // The owner's saved room settings, kept apart from the poems
  roomSettings: RoomSettings | null;
  // Poems deleted on this device since the shelf loaded, so saving never brings them back
  deletedIds: Set<string>;
  // Takes in poems and edits made on another device, without counting as a new edit here
  absorbServer: (poems: Poem[]) => void;
  saveRoomTheme: (theme: RoomTheme) => void;
  // What gets saved: the poems plus the settings record
  shelfPayload: () => Poem[];
  // Bumps on every local edit so the sync hook knows when to save
  revision: number;
  setPoems: (poems: Poem[]) => void;
  createPoem: (options?: { mood?: Mood | null }) => string;
  updatePoem: (id: string, updates: Partial<EditablePoemFields>) => void;
  deletePoem: (id: string) => void;
  // Drops a poem if it was left blank, so empty books never sit on the shelf
  discardIfEmpty: (id: string) => void;
  importPoems: (items: Array<Pick<Poem, "title" | "content">>) => number;
  // Classics from the library that the owner favorites; guests see them on the shelf
  addFavorite: (item: { title: string; author: string; content: string; tags?: string[] }) => string;
}

const newId = (): string =>
  `poem-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

const nowIso = (): string => new Date().toISOString();

// Stable id for a classic, so the same poem can't be favorited twice
export const favoriteId = (title: string, author: string): string =>
  `fav-${`${author}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90)}`;

export const usePoemStore = create<PoemStore>()((set, get) => ({
  poems: [],
  roomSettings: null,
  deletedIds: new Set<string>(),
  revision: 0,
  setPoems: (poems) => {
    const record = poems.find(isSettingsRecord);
    set({ poems: poems.filter((p) => !isSettingsRecord(p) && isWritten(p)), roomSettings: record ? readSettings(record) : null });
  },
  absorbServer: (incoming) => {
    const record = incoming.find(isSettingsRecord);
    set({
      poems: incoming.filter((p) => !isSettingsRecord(p) && isWritten(p)),
      ...(record && !get().roomSettings ? { roomSettings: readSettings(record) } : {}),
    });
  },
  saveRoomTheme: (theme) => set((state) => ({ roomSettings: { ...(state.roomSettings ?? {}), theme }, revision: state.revision + 1 })),
  shelfPayload: () => {
    const { poems, roomSettings } = get();
    const written = poems.filter(isWritten);
    return roomSettings ? [...written, settingsRecord(roomSettings, nowIso())] : written;
  },
  createPoem: (options = {}) => {
    const id = newId();
    const stamp = nowIso();
    set((state) => ({
      poems: [...state.poems, { id, title: "", content: "", tags: [], mood: options.mood ?? null, createdAt: stamp, updatedAt: stamp, kind: "own", author: null }],
    }));
    return id;
  },
  updatePoem: (id, updates) =>
    set((state) => ({
      poems: state.poems.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: nowIso() } : p)),
      revision: state.revision + 1,
    })),
  deletePoem: (id) =>
    set((state) => ({ poems: state.poems.filter((p) => p.id !== id), deletedIds: new Set(state.deletedIds).add(id), revision: state.revision + 1 })),
  discardIfEmpty: (id) => {
    const poem = get().poems.find((p) => p.id === id);
    if (poem && !isWritten(poem)) {
      set((state) => ({ poems: state.poems.filter((p) => p.id !== id), deletedIds: new Set(state.deletedIds).add(id), revision: state.revision + 1 }));
    }
  },
  addFavorite: (item) => {
    const id = favoriteId(item.title, item.author);
    if (get().poems.some((p) => p.id === id)) return id;
    const stamp = nowIso();
    const favorite: Poem = { id, title: item.title, content: item.content, tags: item.tags ?? [], mood: null, createdAt: stamp, updatedAt: stamp, kind: "favorite", author: item.author };
    set((state) => ({ poems: [...state.poems, favorite], revision: state.revision + 1 }));
    return id;
  },
  importPoems: (items) => {
    const stamp = nowIso();
    const fresh: Poem[] = items
      .filter((item) => item.content.trim() !== "")
      .map((item) => ({ id: newId(), title: item.title, content: item.content, tags: [], mood: null, createdAt: stamp, updatedAt: stamp, kind: "own" as const, author: null }));
    if (fresh.length > 0) set((state) => ({ poems: [...state.poems, ...fresh], revision: state.revision + 1 }));
    return fresh.length;
  },
}));
