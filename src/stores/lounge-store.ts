import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LoungeStore {
  typewriterSounds: boolean;
  musicVolume: number;
  setTypewriterSounds: (on: boolean) => void;
  setMusicVolume: (volume: number) => void;
}

// Sound preferences, remembered in this browser
export const useLoungeStore = create<LoungeStore>()(
  persist(
    (set) => ({
      typewriterSounds: true,
      musicVolume: 0.6,
      setTypewriterSounds: (typewriterSounds) => set({ typewriterSounds }),
      setMusicVolume: (musicVolume) => set({ musicVolume: Math.min(1, Math.max(0, musicVolume)) }),
    }),
    { name: "poetry-shelf-lounge" },
  ),
);
