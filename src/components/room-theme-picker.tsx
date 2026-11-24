import { useEffect } from "react";
import { useLoungeStore } from "@/stores/lounge-store";
import { usePoemStore } from "@/stores/poem-store";
import { useSessionStore } from "@/stores/session-store";
import { effectiveTheme } from "@/lib/room-settings";

// The theme the room is wearing right now: the owner's saved one, or a guest's own pick,
// or Gatsby green by default
export const useRoomTheme = () => {
  const role = useSessionStore((s) => s.role);
  const { roomTheme: localChoice, guestPreview } = useLoungeStore();
  const savedTheme = usePoemStore((s) => s.roomSettings?.theme ?? null);
  return effectiveTheme({ role, guestPreview, savedTheme, localChoice });
};

// Keeps the page's colour theme in step with the choice
export const RoomThemeSync = () => {
  const theme = useRoomTheme();
  useEffect(() => {
    document.documentElement.dataset.roomTheme = theme;
  }, [theme]);
  return null;
};
