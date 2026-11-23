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
const bookmarkColors = ["bg-amber-500", "bg-red-800"];
// Leather bindings: oxblood, bottle green, navy, tobacco and black
const leathers = [
  "bg-[linear-gradient(90deg,hsl(355_45%_16%),hsl(355_48%_24%)_45%,hsl(355_45%_15%))]",
  "bg-[linear-gradient(90deg,hsl(150_30%_11%),hsl(150_32%_18%)_45%,hsl(150_30%_10%))]",
  "bg-[linear-gradient(90deg,hsl(220_35%_12%),hsl(220_36%_20%)_45%,hsl(220_35%_11%))]",
  "bg-[linear-gradient(90deg,hsl(25_40%_14%),hsl(28_42%_22%)_45%,hsl(25_40%_13%))]",
  "bg-[linear-gradient(90deg,hsl(20_8%_7%),hsl(20_8%_14%)_45%,hsl(20_8%_6%))]",
];
// Cloth bindings for favorites from the library: parchment, slate and faded rose
const cloths = [
  "bg-[linear-gradient(90deg,hsl(40_30%_62%),hsl(42_34%_74%)_45%,hsl(40_30%_60%))]",
  "bg-[linear-gradient(90deg,hsl(210_10%_36%),hsl(210_12%_46%)_45%,hsl(210_10%_34%))]",
  "bg-[linear-gradient(90deg,hsl(350_22%_44%),hsl(350_24%_54%)_45%,hsl(350_22%_42%))]",
];

const surname = (author: string | null): string => {
  if (!author) return "";
  // "George Gordon, Lord Byron" -> "Byron"; "Percy Bysshe Shelley" -> "Shelley"
  const parts = author.trim().split(/\s+/);
  return parts[parts.length - 1];
};

// One book on the shelf. Opening it is handled by the shelf, so books stay simple.
export const PoemBook = ({ poem, index, onOpen }: PoemBookProps) => {
  const height = heights[Math.floor(seededRandom(index + 1) * heights.length)];
  const width = widths[Math.floor(seededRandom(index + 50) * widths.length)];
  const isFavorite = poem.kind === "favorite";
  const binding = isFavorite
    ? cloths[Math.floor(seededRandom(index + 90) * cloths.length)]
    : leathers[Math.floor(seededRandom(index + 90) * leathers.length)];
  const lightCloth = isFavorite && binding === cloths[0];
  const title = poem.title.trim() || "Untitled";

  return (
    <button
      type="button"
      onClick={() => onOpen(poem.id)}
      className={cn(
        "group relative flex flex-col items-center justify-end rounded-b-md rounded-t-sm shadow-[0_6px_14px_rgba(0,0,0,0.6)]",
        "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "hover:z-20 hover:-translate-y-6 hover:scale-[1.25] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]",
        "focus-visible:z-20 focus-visible:-translate-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
        height,
        width,
        binding,
      )}
      aria-label={`Open poem: ${title}${isFavorite && poem.author ? ` by ${poem.author}` : ""}${poem.mood ? ` (${moodLabels[poem.mood]})` : ""}`}
    >
      {/* Leather grain */}
      <div className="wood-grain-v pointer-events-none absolute inset-0 rounded-b-md rounded-t-sm opacity-30 mix-blend-overlay" />
      <div className="absolute right-0 top-0 h-full w-px bg-[hsl(28,8%,8%)]" />

      <div className="absolute left-2 right-2 top-3 h-px bg-amber-400/60" />
      <div className="absolute left-3 right-3 top-[18px] h-px bg-amber-400/35" />
      <div className="absolute bottom-6 left-2 right-2 h-px bg-amber-400/60" />
      <div className="absolute bottom-[30px] left-3 right-3 h-px bg-amber-400/35" />

      <span
        className={cn(
          "absolute left-1/2 top-1/2 max-h-[85%] -translate-x-1/2 -translate-y-1/2 rotate-180 overflow-hidden text-ellipsis whitespace-nowrap",
          "font-display text-[9px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] [writing-mode:vertical-rl] sm:text-[11px]",
          lightCloth ? "text-stone-900 drop-shadow-none" : "text-white/90",
          "transition-all duration-500 group-hover:tracking-wider group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]",
        )}
      >
        {title}
      </span>

      {isFavorite && (
        <span
          className={cn(
            "absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[7px] font-semibold uppercase tracking-wider",
            lightCloth ? "text-stone-800/80" : "text-amber-100/70",
          )}
        >
          {surname(poem.author).slice(0, 7)}
        </span>
      )}

      <div
        className={cn(
          isFavorite && "hidden",
          "absolute -top-3 right-1.5 z-10 h-8 w-2.5 rounded-b-sm shadow-md [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]",
          bookmarkColors[index % 2],
        )}
      />

      <div className="absolute inset-0 rounded-b-md rounded-t-sm bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.07]" />
    </button>
  );
};
