import { useEffect, useState, useSyncExternalStore } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume1, Volume2 } from "lucide-react";
import { phonograph } from "@/lib/audio/phonograph";
import { songbook } from "@/lib/audio/jazz-score";
import { useLoungeStore } from "@/stores/lounge-store";
import { cn } from "@/lib/utils";

const useRecordState = () =>
  useSyncExternalStore(
    (cb) => phonograph.subscribe(cb),
    () => `${phonograph.playing ? 1 : 0}:${phonograph.track}`,
  );

// A gramophone in the corner, playing the house band's records: original tunes made live in the browser
export const PhonographPlayer = () => {
  useRecordState();
  const playing = phonograph.playing;
  const tune = phonograph.tune;
  const [open, setOpen] = useState(false);
  const { musicVolume, setMusicVolume } = useLoungeStore();

  useEffect(() => {
    phonograph.setVolume(musicVolume);
  }, [musicVolume]);

  // Lift the needle when leaving the room
  useEffect(() => () => phonograph.stop(), []);

  const toggle = () => {
    if (playing) {
      phonograph.stop();
    } else {
      phonograph.setVolume(musicVolume);
      phonograph.start();
      setOpen(true);
    }
  };

  const goTo = (index: number) => {
    const steps = (index - phonograph.track + songbook.length) % songbook.length;
    for (let i = 0; i < steps; i++) phonograph.skip(1);
    if (!phonograph.playing) phonograph.start();
  };

  return (
    <div className="fixed bottom-3 right-3 z-40 flex items-end gap-2 sm:bottom-4 sm:right-4">
      {open && (
        <div className="mb-1 w-[min(16rem,calc(100vw-6rem))] animate-fade-in rounded-md border border-amber-300/25 bg-stone-950/95 p-3 text-amber-100 shadow-xl backdrop-blur">
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/80">{playing ? "Now playing" : "On the turntable"}</p>
          <p className="font-display text-sm italic text-amber-50">{tune.title}</p>

          <div className="mt-2 flex items-center justify-between">
            <button type="button" onClick={() => phonograph.skip(-1)} className="rounded-full p-1.5 text-amber-100/70 hover:text-amber-50" aria-label="Previous record">
              <SkipBack size={14} />
            </button>
            <button type="button" onClick={toggle} className="brass-plate rounded-full p-2 text-stone-900" aria-label={playing ? "Pause the music" : "Play the music"}>
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button type="button" onClick={() => phonograph.skip(1)} className="rounded-full p-1.5 text-amber-100/70 hover:text-amber-50" aria-label="Next record">
              <SkipForward size={14} />
            </button>
          </div>

          <label className="mt-2 flex items-center gap-2 text-[11px] text-amber-100/60">
            <Volume1 size={12} aria-hidden="true" />
            <span className="sr-only">Music volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer accent-amber-500"
            />
            <Volume2 size={12} aria-hidden="true" />
          </label>

          <ol className="mt-3 space-y-0.5 border-t border-amber-100/10 pt-2" aria-label="Records">
            {songbook.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-xs hover:bg-white/5",
                    i === phonograph.track ? "text-amber-300" : "text-amber-100/70",
                  )}
                  aria-current={i === phonograph.track ? "true" : undefined}
                >
                  <span className="w-3 text-[10px] tabular-nums opacity-60">{i + 1}</span>
                  <span className="flex-1">{t.title}</span>
                  <span className="text-[10px] capitalize opacity-50">{t.style}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={toggle}
          className="group relative h-14 w-14 rounded-md sm:h-20 sm:w-20 border border-amber-300/30 bg-[linear-gradient(160deg,hsl(22_34%_22%),hsl(18_30%_10%))] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          aria-label={playing ? "Stop the music" : "Play some music"}
          aria-pressed={playing}
        >
          <div className={cn("vinyl relative h-full w-full rounded-full", playing && "animate-[spin_1.8s_linear_infinite] motion-reduce:animate-none")}>
            <div className="vinyl-shine absolute inset-0 rounded-full" />
          </div>
          <div
            className={cn(
              "brass-plate absolute right-1 top-1 h-9 w-1 origin-top sm:h-12 rounded-full transition-transform duration-700",
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
          className="absolute -left-2 -top-2 flex items-center gap-1 rounded-full border border-amber-300/30 bg-stone-950 px-2 py-0.5 text-[10px] text-amber-100/80 hover:text-amber-50"
          aria-label={open ? "Hide the record list" : "Show the record list"}
          aria-expanded={open}
        >
          {open ? "Hide" : "Records"}
        </button>
      </div>
    </div>
  );
};
