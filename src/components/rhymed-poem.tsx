import { useMemo } from "react";
import { analyzeRhymes } from "@/lib/rhyme";
import { lineSyllables } from "@/lib/syllables";
import { rhymeKindLabels } from "@/lib/rhyme-sounds";
import { colorIndexForLetter, rhymeBadgeColors, rhymeBadgeStyle, rhymeTextColors } from "@/lib/rhyme-colors";
import { RhymeLegend } from "@/components/rhyme-legend";
import { cn } from "@/lib/utils";

const endingWords = new Set(["it", "em", "a", "an", "the", "of", "to"]);

// The poem with its rhyme scheme shown: rhyming endings share a colour and a letter,
// the badge shows what kind of rhyme it is, and each line shows its syllable count
export const RhymedPoem = ({ text }: { text: string }) => {
  const rhymes = useMemo(() => analyzeRhymes(text), [text]);
  const lines = text.split("\n");

  return (
    <div className="font-body text-base leading-[2.2] tracking-[0.01em] text-[hsl(34,20%,65%)] sm:text-lg">
      {lines.map((line, i) => {
        const r = rhymes[i];
        if (!r.letter) return <div key={i} className="h-[2.2em]" />;
        // Colour the last word, or the last two when it ends on a small word ("hold it")
        const match = /^(.*?)((?:\S+\s+)?\S+)(\s*)$/.exec(line);
        let head = line;
        let end = "";
        if (match) {
          const two = match[2].trim().split(/\s+/);
          const lastIsSmall = two.length === 2 && endingWords.has(two[1].toLowerCase().replace(/[^a-z]/g, ""));
          head = lastIsSmall ? match[1] : match[1] + (two.length === 2 ? `${two[0]} ` : "");
          end = lastIsSmall ? match[2] : two[two.length - 1];
        }
        const colour = colorIndexForLetter(r.letter);
        return (
          <div key={i} className="flex items-baseline gap-3">
            <span className="min-w-0 flex-1 whitespace-pre-wrap">
              {head}
              <span className={cn(r.kind && cn("font-semibold", rhymeTextColors[colour]), r.kind === "slant" && "underline decoration-dashed underline-offset-4")}>
                {end}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] leading-none">
              <span className="w-6 text-right tabular-nums text-amber-100/35">{lineSyllables(line)}</span>
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded font-semibold",
                  r.kind ? cn(rhymeTextColors[colour], rhymeBadgeStyle(r.kind, rhymeBadgeColors[colour])) : "text-amber-100/30",
                )}
                title={r.kind ? rhymeKindLabels[r.kind] : "No rhyme"}
              >
                {r.letter}
              </span>
            </span>
          </div>
        );
      })}
      <div className="mt-6 border-t border-amber-200/10 pt-3">
        <RhymeLegend />
      </div>
    </div>
  );
};
