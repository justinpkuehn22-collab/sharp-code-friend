import type { RhymeKind } from "@/lib/rhyme-sounds";
import { rhymeKindHints, rhymeKindLabels, rhymeKindOrder } from "@/lib/rhyme-sounds";
import { cn } from "@/lib/utils";
import { rhymeBadgeStyle } from "@/lib/rhyme-colors";

export const RhymeLegend = ({ counts }: { counts?: Record<RhymeKind, number> }) => (
  <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-amber-100/60">
    {rhymeKindOrder.map((kind) => (
      <li key={kind} className="flex items-center gap-1.5" title={rhymeKindHints[kind]}>
        <span className={cn("flex h-4 w-4 items-center justify-center rounded text-[9px] font-semibold text-amber-200", rhymeBadgeStyle(kind, "bg-amber-400/25"))}>
          A
        </span>
        {rhymeKindLabels[kind]}
        {counts && <span className="tabular-nums text-amber-100/40">{counts[kind]}</span>}
      </li>
    ))}
  </ul>
);
