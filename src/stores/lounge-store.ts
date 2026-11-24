import { create } from "zustand";
import { persist } from "zustand/middleware";

export const roomThemes = [
  { id: "speakeasy", label: "Speakeasy", swatch: "bg-amber-500" },
  { id: "emerald", label: "Gatsby green", swatch: "bg-emerald-500" },
  { id: "midnight", label: "Midnight blue", swatch: "bg-sky-500" },
  { id: "rouge", label: "Rouge", swatch: "bg-rose-500" },
] as const;
export type RoomTheme = (typeof roomThemes)[number]["id"];

interface LoungeStore {
  typewriterSounds: boolean;
  musicVolume: number;
  // A guest's own pick on this device; null means the house default
  roomTheme: RoomTheme | null;
  // The owner is looking at the room as a guest would (not remembered)
  guestPreview: boolean;
  showRhymes: boolean;
  // Colour rhyming line endings in the editor while writing
  rhymeColorsWhileWriting: boolean;
  setTypewriterSounds: (on: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setRoomTheme: (theme: RoomTheme | null) => void;
  setGuestPreview: (on: boolean) => void;
  setShowRhymes: (on: boolean) => void;
  setRhymeColorsWhileWriting: (on: boolean) => void;
}

// Sound, theme and reading preferences, remembered in this browser
export const useLoungeStore = create<LoungeStore>()(
  persist(
    (set) => ({
      typewriterSounds: true,
      musicVolume: 0.6,
      roomTheme: null,
      guestPreview: false,
      showRhymes: false,
      rhymeColorsWhileWriting: true,
      setTypewriterSounds: (typewriterSounds) => set({ typewriterSounds }),
      setMusicVolume: (musicVolume) => set({ musicVolume: Math.min(1, Math.max(0, musicVolume)) }),
      setRoomTheme: (roomTheme) => set({ roomTheme }),
      setGuestPreview: (guestPreview) => set({ guestPreview }),
      setShowRhymes: (showRhymes) => set({ showRhymes }),
      setRhymeColorsWhileWriting: (rhymeColorsWhileWriting) => set({ rhymeColorsWhileWriting }),
    }),
    {
      name: "poetry-shelf-lounge",
      version: 2,
      // Earlier versions stored "speakeasy" for everyone who never chose; start them on the new default
      migrate: (state, version) => {
        const old = (state ?? {}) as Record<string, unknown>;
        return (version < 2 ? { ...old, roomTheme: null } : old) as unknown as LoungeStore;
      },
      partialize: ({ guestPreview: _preview, ...rest }) => rest,
    },
  ),
);
