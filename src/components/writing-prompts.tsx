import { useMemo, useState } from "react";
import { PenLine, Shuffle, Sparkles } from "lucide-react";
import { moodLabels, moods, type Mood, type Poem } from "@/data/poems";
import type { WritingPrompt } from "@/data/writing-prompts";
import { pickPrompts } from "@/lib/writing-prompts";
import { cn } from "@/lib/utils";

interface WritingPromptsProps {
  poems: Poem[];
  onWrite: (prompt: WritingPrompt) => void;
}

const chip = (active: boolean) =>
  cn(
    "rounded-full border px-2.5 py-0.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
    active ? "border-amber-400 bg-amber-400/20 text-amber-50" : "border-amber-100/15 text-amber-100/60 hover:text-amber-100",
  );

// Admin only: ideas for the next poem, leaning toward themes the shelf has fewest of
export const WritingPrompts = ({ poems, onWrite }: WritingPromptsProps) => {
  const [mood, setMood] = useState<Mood | null>(null);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000) + 1);
  const prompts = useMemo(() => pickPrompts(poems, mood, 3, seed), [poems, mood, seed]);

  return (
    <section aria-labelledby="spark-heading" className="mx-4 mb-6 rounded-md border border-amber-300/20 bg-black/35 p-4 sm:mx-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="spark-heading" className="flex items-center gap-2 font-display text-lg text-amber-100">
          <Sparkles size={16} className="text-amber-400" aria-hidden="true" /> Need a spark?
        </h2>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 7)}
          className="flex items-center gap-1.5 text-xs text-amber-100/70 hover:text-amber-50"
        >
          <Shuffle size={12} aria-hidden="true" /> Show me others
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Prompt theme">
        <button type="button" role="radio" aria-checked={mood === null} onClick={() => setMood(null)} className={chip(mood === null)}>
          Something new
        </button>
        {moods.map((m) => (
          <button key={m} type="button" role="radio" aria-checked={mood === m} onClick={() => setMood(m)} className={chip(mood === m)}>
            {moodLabels[m]}
          </button>
        ))}
      </div>

      <ul className="grid gap-2 sm:grid-cols-3">
        {prompts.map((p) => (
          <li key={p.id} className="flex flex-col justify-between gap-3 rounded-md border border-amber-100/10 bg-white/[0.03] p-3">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wider text-amber-400/80">{moodLabels[p.mood]}</p>
              <p className="font-body text-sm leading-relaxed text-amber-50/90">{p.prompt}</p>
            </div>
            <button
              type="button"
              onClick={() => onWrite(p)}
              className="flex items-center gap-1.5 self-start rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-amber-50 hover:bg-amber-500"
            >
              <PenLine size={12} aria-hidden="true" /> Write this
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
