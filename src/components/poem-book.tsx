import { cn } from "@/lib/utils";
import { moodLabels, type Poem } from "@/data/poems";

interface PoemBookProps {
  poem: Poem;
  index: number;
  onOpen: (id: string) => void;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

// Height and width steps, so each spine looks hand-picked without inline styles
const heights = ["h-[124px]", "h-[134px]", "h-[144px]", "h-[154px]", "h-[164px]", "h-[176px]"];
const widths = ["w-[38px]", "w-[42px]", "w-[46px]", "w-[50px]", "w-[54px]"];
const bookmarkColors = ["bg-primary", "bg-secondary"];

// One book on the shelf. Opening it is handled by the shelf, so books stay simple.
export const PoemBook = ({ poem, index, onOpen }: PoemBookProps) => {
  const height = heights[Math.floor(seededRandom(index + 1) * heights.length)];
  const width = widths[Math.floor(seededRandom(index + 50) * widths.length)];
  const title = poem.title.trim() || "Untitled";

  return (
    <button
      type="button"
      onClick={() => onOpen(poem.id)}
      className={cn(
        "group relative flex flex-col items-center justify-end rounded-b-md rounded-t-sm bg-[hsl(28,12%,12%)] shadow-lg",
        "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "hover:z-20 hover:-translate-y-6 hover:scale-[1.25] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]",
        "focus-visible:z-20 focus-visible:-translate-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
        height,
        width,
      )}
      aria-label={`Open poem: ${title}${poem.mood ? ` (${moodLabels[poem.mood]})` : ""}`}
    >
      <div className="absolute left-0 top-0 h-full w-1.5 rounded-bl-md rounded-tl-sm bg-[hsl(28,10%,18%)]" />
      <div className="absolute right-0 top-0 h-full w-px bg-[hsl(28,8%,8%)]" />

      <div className="absolute left-2 right-2 top-3 h-px bg-clock-trim/25" />
      <div className="absolute left-3 right-3 top-[18px] h-px bg-clock-trim/15" />
      <div className="absolute bottom-6 left-2 right-2 h-px bg-clock-trim/25" />
      <div className="absolute bottom-[30px] left-3 right-3 h-px bg-clock-trim/15" />

      <span
        className={cn(
          "absolute left-1/2 top-1/2 max-h-[85%] -translate-x-1/2 -translate-y-1/2 rotate-180 overflow-hidden text-ellipsis whitespace-nowrap",
          "font-display text-[9px] font-bold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] [writing-mode:vertical-rl] sm:text-[11px]",
          "transition-all duration-500 group-hover:tracking-wider group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]",
        )}
      >
        {title}
      </span>

      <div
        className={cn(
          "absolute -top-3 right-1.5 z-10 h-8 w-2.5 rounded-b-sm shadow-md [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]",
          bookmarkColors[index % 2],
        )}
      />

      <div className="absolute inset-0 rounded-b-md rounded-t-sm bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.07]" />
    </button>
  );
};
