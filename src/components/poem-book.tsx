import { memo, type CSSProperties } from "react";
import { spineDimensions } from "@/lib/book-size";
import { cn } from "@/lib/utils";
import { moodLabels, type Poem } from "@/data/poems";
import { spineName, worldPoemForShelfId } from "@/lib/world-shelf";

interface PoemBookProps {
  poem: Poem;
  index: number;
  // 0 for the shortest poem on the shelf, 1 for the longest
  size?: number;
  onOpen: (id: string) => void;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const bookmarkColors = ["bg-amber-500", "bg-red-800"];
// Leather bindings: oxblood, bottle green, navy, tobacco and black
const leathers = [
  "bg-[linear-gradient(90deg,hsl(355_45%_16%),hsl(355_48%_24%)_45%,hsl(355_45%_15%))]",
  "bg-[linear-gradient(90deg,hsl(150_30%_11%),hsl(150_32%_18%)_45%,hsl(150_30%_10%))]",
  "bg-[linear-gradient(90deg,hsl(220_35%_12%),hsl(220_36%_20%)_45%,hsl(220_35%_11%))]",
  "bg-[linear-gradient(90deg,hsl(25_40%_14%),hsl(28_42%_22%)_45%,hsl(25_40%_13%))]",
  "bg-[linear-gradient(90deg,hsl(20_8%_7%),hsl(20_8%_14%)_45%,hsl(20_8%_6%))]",
];
// Lacquered bindings for poems from around the world: deep teal, indigo and cinnabar
const lacquers = [
  "bg-[linear-gradient(90deg,hsl(175_40%_13%),hsl(175_42%_21%)_45%,hsl(175_40%_12%))]",
  "bg-[linear-gradient(90deg,hsl(235_35%_16%),hsl(235_38%_26%)_45%,hsl(235_35%_15%))]",
  "bg-[linear-gradient(90deg,hsl(8_55%_22%),hsl(8_58%_32%)_45%,hsl(8_55%_20%))]",
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
const PoemBookSpine = ({ poem, index, size = 0.5, onOpen }: PoemBookProps) => {
  // Longer poems make bigger books; a little jitter keeps equal lengths from looking stamped out
  const { height, width } = spineDimensions(size, seededRandom(index + 1));
  const isFavorite = poem.kind === "favorite";
  const world = isFavorite ? worldPoemForShelfId(poem.id) : null;
  const pick = (list: string[]) => list[Math.floor(seededRandom(index + 90) * list.length)];
  const binding = world ? pick(lacquers) : isFavorite ? pick(cloths) : pick(leathers);
  const lightCloth = isFavorite && binding === cloths[0];
  const title = poem.title.trim() || "Untitled";
  // Chinese, Japanese and Korean titles read top to bottom on the spine, as they would in print
  const verticalScript = world && /^(zh|ja|ko)/.test(world.lang);
  const spineTitle = verticalScript ? world.originalTitle : title;

  return (
    <button
      type="button"
      onClick={() => onOpen(poem.id)}
      className={cn(
        "group relative flex flex-col items-center justify-end rounded-b-md rounded-t-sm shadow-[0_6px_14px_rgba(0,0,0,0.6)]",
        "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "hover:z-20 hover:-translate-y-6 hover:scale-[1.25] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]",
        "focus-visible:z-20 focus-visible:-translate-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
        // A touch smaller on phones so five books still fit a shelf
        "h-[calc(var(--book-h)*0.85)] w-[calc(var(--book-w)*0.85)] sm:h-[var(--book-h)] sm:w-[var(--book-w)]",
        binding,
      )}
      style={{ "--book-h": `${height}px`, "--book-w": `${width}px` } as CSSProperties}
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
          "absolute left-1/2 top-1/2 max-h-[85%] -translate-x-1/2 -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap",
          verticalScript ? "[text-orientation:upright]" : "rotate-180",
          "font-display text-[9px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] [writing-mode:vertical-rl] sm:text-[11px]",
          lightCloth ? "text-stone-900 drop-shadow-none" : "text-white/90",
          "transition-all duration-500 group-hover:tracking-wider group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]",
        )}
      >
        <span lang={verticalScript ? world.lang : undefined}>{spineTitle}</span>
      </span>

      {isFavorite && (
        <span
          className={cn(
            "absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[7px] font-semibold uppercase tracking-wider",
            lightCloth ? "text-stone-800/80" : "text-amber-100/70",
          )}
        >
          {(world ? spineName(world) : surname(poem.author)).slice(0, 8)}
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

// Books only redraw when their own poem changes
export const PoemBook = memo(PoemBookSpine);
