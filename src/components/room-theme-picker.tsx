import { useEffect } from "react";
import { Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { roomThemes, useLoungeStore } from "@/stores/lounge-store";
import { cn } from "@/lib/utils";

// Keeps the page's colour theme in step with the saved choice
export const RoomThemeSync = () => {
  const roomTheme = useLoungeStore((s) => s.roomTheme);
  useEffect(() => {
    document.documentElement.dataset.roomTheme = roomTheme;
  }, [roomTheme]);
  return null;
};

export const RoomThemePicker = ({ className }: { className?: string }) => {
  const { roomTheme, setRoomTheme } = useLoungeStore();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={className} aria-label="Change the room's theme">
          <Palette size={12} aria-hidden="true" /> Theme
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 border-amber-300/25 bg-stone-950/95 p-2 text-amber-100">
        <p className="px-2 pb-1 text-[11px] uppercase tracking-wider text-amber-100/50">Set the mood</p>
        <ul role="radiogroup" aria-label="Room theme">
          {roomThemes.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                role="radio"
                aria-checked={roomTheme === t.id}
                onClick={() => setRoomTheme(t.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-white/5",
                  roomTheme === t.id && "bg-white/10",
                )}
              >
                <span className={cn("h-3 w-3 rounded-full ring-1 ring-white/30", t.swatch)} aria-hidden="true" />
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
