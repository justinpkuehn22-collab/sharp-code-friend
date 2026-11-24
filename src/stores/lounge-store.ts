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
  roomTheme: RoomTheme;
  showRhymes: boolean;
  // Colour rhyming line endings in the editor while writing
  rhymeColorsWhileWriting: boolean;
  setTypewriterSounds: (on: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setRoomTheme: (theme: RoomTheme) => void;
  setShowRhymes: (on: boolean) => void;
  setRhymeColorsWhileWriting: (on: boolean) => void;
}

// Sound, theme and reading preferences, remembered in this browser
export const useLoungeStore = create<LoungeStore>()(
  persist(
    (set) => ({
      typewriterSounds: true,
      musicVolume: 0.6,
      roomTheme: "speakeasy",
      showRhymes: false,
      rhymeColorsWhileWriting: true,
      setTypewriterSounds: (typewriterSounds) => set({ typewriterSounds }),
      setMusicVolume: (musicVolume) => set({ musicVolume: Math.min(1, Math.max(0, musicVolume)) }),
      setRoomTheme: (roomTheme) => set({ roomTheme }),
      setShowRhymes: (showRhymes) => set({ showRhymes }),
      setRhymeColorsWhileWriting: (rhymeColorsWhileWriting) => set({ rhymeColorsWhileWriting }),
    }),
    { name: "poetry-shelf-lounge" },
  ),
);
