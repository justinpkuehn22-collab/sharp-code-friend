import { useMemo } from "react";
import { rhymeGroups, rhymeLetters } from "@/lib/rhyme";
import { lineSyllables } from "@/lib/syllables";
import { colorIndexForLetter, rhymeBadgeColors, rhymeTextColors } from "@/lib/rhyme-colors";
import { cn } from "@/lib/utils";

// The poem with its rhyme scheme shown: rhyming end words share a colour and a letter,
// and each line shows its syllable count
export const RhymedPoem = ({ text }: { text: string }) => {
  const letters = useMemo(() => rhymeLetters(text), [text]);
  const rhyming = useMemo(() => rhymeGroups(text), [text]);
  const lines = text.split("\n");

  return (
    <div className="font-body text-base leading-[2.2] tracking-[0.01em] text-[hsl(34,20%,65%)] sm:text-lg">
      {lines.map((line, i) => {
        const letter = letters[i];
        if (!letter) return <div key={i} className="h-[2.2em]" />;
        const match = /^(.*?)(\S+)(\s*)$/.exec(line);
        const head = match ? match[1] : line;
        const end = match ? match[2] : "";
        const colour = colorIndexForLetter(letter);
        const rhymes = rhyming.has(i);
        return (
          <div key={i} className="flex items-baseline gap-3">
            <span className="min-w-0 flex-1 whitespace-pre-wrap">
              {head}
              <span className={cn(rhymes && cn("font-semibold", rhymeTextColors[colour]))}>{end}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] leading-none">
              <span className="w-6 text-right tabular-nums text-amber-100/35" title="Syllables">
                {lineSyllables(line)}
              </span>
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded font-semibold",
                  rhymes ? rhymeBadgeColors[colour] : "text-amber-100/30",
                )}
              >
                {letter}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
};
