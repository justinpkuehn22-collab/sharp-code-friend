import { useEffect } from "react";
import { useLoungeStore } from "@/stores/lounge-store";

// Keeps the page's colour theme in step with the saved choice
export const RoomThemeSync = () => {
  const roomTheme = useLoungeStore((s) => s.roomTheme);
  useEffect(() => {
    document.documentElement.dataset.roomTheme = roomTheme;
  }, [roomTheme]);
  return null;
};
