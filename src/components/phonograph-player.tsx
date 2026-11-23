import { useEffect, useState } from "react";
import { Pause, Play, Volume1, Volume2 } from "lucide-react";
import { phonograph } from "@/lib/audio/phonograph";
import { useLoungeStore } from "@/stores/lounge-store";
import { cn } from "@/lib/utils";

// A little gramophone in the corner. It plays an original swing tune made live in the browser.
export const PhonographPlayer = () => {
  const [playing, setPlaying] = useState(phonograph.playing);
  const [open, setOpen] = useState(false);
  const { musicVolume, setMusicVolume } = useLoungeStore();

  useEffect(() => {
    phonograph.setVolume(musicVolume);
  }, [musicVolume]);

  // Lifting the needle when leaving the room
  useEffect(() => () => phonograph.stop(), []);

  const toggle = () => {
    if (playing) {
      phonograph.stop();
      setPlaying(false);
    } else {
      phonograph.setVolume(musicVolume);
      setPlaying(phonograph.start());
      setOpen(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-end gap-2">
      {open && (
        <div className="mb-1 flex animate-fade-in flex-col gap-2 rounded-md border border-amber-300/25 bg-stone-950/90 px-3 py-2 text-amber-100 shadow-xl backdrop-blur">
          <p className="font-display text-xs italic text-amber-100/80">
            {playing ? "Now playing: the house band" : "The house band is on break"}
          </p>
          <label className="flex items-center gap-2 text-[11px] text-amber-100/60">
            <Volume1 size={12} aria-hidden="true" />
            <span className="sr-only">Music volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer accent-amber-500"
            />
            <Volume2 size={12} aria-hidden="true" />
          </label>
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={toggle}
          className="group relative h-20 w-20 rounded-md border border-amber-300/30 bg-[linear-gradient(160deg,hsl(22_34%_22%),hsl(18_30%_10%))] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          aria-label={playing ? "Stop the music" : "Play some music"}
          aria-pressed={playing}
        >
          <div className={cn("vinyl relative h-full w-full rounded-full", playing && "animate-[spin_1.8s_linear_infinite] motion-reduce:animate-none")}>
            <div className="vinyl-shine absolute inset-0 rounded-full" />
          </div>
          {/* Tonearm */}
          <div
            className={cn(
              "brass-plate absolute right-1 top-1 h-12 w-1 origin-top rounded-full transition-transform duration-700",
              playing ? "rotate-[28deg]" : "rotate-[4deg]",
            )}
          />
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <span className="rounded-full bg-black/70 p-1.5 text-amber-100">
              {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute -top-2 -left-2 rounded-full border border-amber-300/30 bg-stone-950 p-1 text-amber-100/80 hover:text-amber-50"
          aria-label={open ? "Hide volume" : "Show volume"}
          aria-expanded={open}
        >
          <Volume2 size={11} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
