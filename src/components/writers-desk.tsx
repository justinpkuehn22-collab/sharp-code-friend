import { useDeferredValue, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, Shuffle } from "lucide-react";
import { critiquePoem, elementLabels } from "@/lib/poem-critique";
import { findRhymes } from "@/services/rhyme-service";
import { analyzeRhymes, lastWord, rhymeKindCounts, rhymeSchemeText } from "@/lib/rhyme";
import { rhymeKindLabels } from "@/lib/rhyme-sounds";
import { RhymeLegend } from "@/components/rhyme-legend";
import { lineSyllables } from "@/lib/syllables";
import { words } from "@/lib/poem-insights";
import { formatNumber } from "@/lib/poem-insights";
import { colorIndexForLetter, rhymeBadgeColors, rhymeBadgeStyle } from "@/lib/rhyme-colors";
import { cn } from "@/lib/utils";

interface WritersDeskProps {
  content: string;
  onInsertWord: (word: string) => void;
}

// A side panel for the poet: live counts, the rhyme scheme as it forms, and a rhyme finder
export const WritersDesk = ({ content: live, onInsertWord }: WritersDeskProps) => {
  // The desk catches up between keystrokes rather than on every one
  const content = useDeferredValue(live);
  const lines = content.split("\n");
  // A famous passage that shows what this draft could use most right now
  const [variation, setVariation] = useState(0);
  const lesson = useMemo(() => {
    if (lines.filter((l) => l.trim()).length < 2) return null;
    const tips = critiquePoem("", content, variation).tips;
    const tip = tips[variation % Math.max(1, tips.length)];
    return tip?.master ? { element: tip.element, master: tip.master } : null;
    // lines comes from content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, variation]);
  const lineRhymes = useMemo(() => analyzeRhymes(content), [content]);
  const counts = useMemo(() => rhymeKindCounts(content), [content]);
  const scheme = useMemo(() => rhymeSchemeText(content), [content]);
  const writtenLines = lines.filter((l) => lastWord(l) !== null);
  const syllables = writtenLines.map(lineSyllables);
  const average = syllables.length ? syllables.reduce((a, b) => a + b, 0) / syllables.length : 0;

  const latestEnd = [...writtenLines].reverse().map(lastWord).find(Boolean)?.replace(/[^a-z'-]/gi, "") ?? "";
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const target = query || latestEnd;
  const rhymes = useQuery({
    queryKey: ["rhymes", target.toLowerCase()],
    queryFn: () => findRhymes(target),
    enabled: target.length > 1,
    staleTime: Infinity,
    retry: 1,
  });

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setQuery(draft.trim());
  };

  return (
    <aside aria-label="Writer's desk" className="flex flex-col gap-4 border-t border-amber-200/10 lg:min-h-0 px-6 py-8 text-amber-100 lg:overflow-y-auto lg:border-l lg:border-t-0">
      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.2em] text-amber-400/80">At a glance</h3>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Words", formatNumber(words(content).length)],
            ["Lines", formatNumber(writtenLines.length)],
            ["Syll./line", formatNumber(average, 1)],
          ].map(([label, value]) => (
            <div key={label} className="rounded border border-amber-100/10 bg-white/[0.03] py-1.5">
              <dt className="text-[10px] text-amber-100/45">{label}</dt>
              <dd className="font-display text-lg">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.2em] text-amber-400/80">Rhyme scheme</h3>
        {scheme ? (
          <>
            <p className="mb-2 break-words font-display text-lg tracking-[0.25em] text-amber-50">{scheme}</p>
            <div className="mb-3">
              <RhymeLegend counts={counts} />
            </div>
            <ol className="space-y-1 text-xs">
              {lines.map((line, i) => {
                const { letter, kind } = lineRhymes[i];
                if (!letter) return null;
                return (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded font-semibold",
                        kind ? rhymeBadgeStyle(kind, rhymeBadgeColors[colorIndexForLetter(letter)]) : "bg-white/5 text-amber-100/40",
                      )}
                      title={kind ? rhymeKindLabels[kind] : "No rhyme"}
                    >
                      {letter}
                    </span>
                    <span className="truncate text-amber-100/70">{lastWord(line)}</span>
                    <span className="ml-auto tabular-nums text-amber-100/35">{lineSyllables(line)}</span>
                  </li>
                );
              })}
            </ol>
          </>
        ) : (
          <p className="text-xs text-amber-100/45">—</p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.2em] text-amber-400/80">Find a rhyme</h3>
        <form onSubmit={onSearch} className="mb-2 flex items-center gap-2 rounded-full border border-amber-100/15 bg-black/30 px-3 py-1">
          <Search size={12} className="text-amber-100/40" aria-hidden="true" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={latestEnd ? `Rhymes for "${latestEnd}"` : "Type a word"}
            aria-label="Word to rhyme"
            className="w-full bg-transparent text-xs text-amber-50 outline-none placeholder:text-amber-100/35"
          />
        </form>
        {target.length < 2 ? (
          <p className="text-xs text-amber-100/45">—</p>
        ) : rhymes.isLoading ? (
          <p className="text-xs text-amber-100/45">Looking up rhymes for "{target}"…</p>
        ) : rhymes.isError ? (
          <p className="text-xs text-amber-100/45">Couldn't reach the rhyme finder. Try again in a moment.</p>
        ) : rhymes.data && rhymes.data.perfect.length + rhymes.data.near.length > 0 ? (
          <div className="space-y-2">
            {[
              ["Rhymes", rhymes.data.perfect],
              ["Near rhymes", rhymes.data.near],
            ].map(([label, list]) =>
              (list as string[]).length > 0 ? (
                <div key={label as string}>
                  <p className="mb-1 text-[10px] text-amber-100/40">{label as string}</p>
                  <div className="flex flex-wrap gap-1">
                    {(list as string[]).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => onInsertWord(w)}
                        title="Add to the poem"
                        className="rounded-full border border-amber-100/15 px-2 py-0.5 text-xs text-amber-100/80 hover:border-amber-400/60 hover:text-amber-50"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        ) : (
          <p className="text-xs text-amber-100/45">No rhymes found for "{target}". Try a different word.</p>
        )}
      </section>
      {lesson && (
        // Right under the poem on phones, at the bottom of the side desk on wide screens
        <section className="-order-1 lg:order-none">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-amber-400/80">
              <BookOpen size={11} aria-hidden="true" /> Learn from the masters
            </h3>
            <button type="button" onClick={() => setVariation((v) => v + 1)} className="flex items-center gap-1 text-[11px] text-amber-100/50 hover:text-amber-50" aria-label="Show another example">
              <Shuffle size={11} aria-hidden="true" /> Another
            </button>
          </div>
          <p className="mb-1.5 text-[11px] text-amber-100/50">Your draft could use more: {elementLabels[lesson.element].toLowerCase()}</p>
          <blockquote className="whitespace-pre-line border-l-2 border-amber-400/40 pl-2 font-body text-sm italic leading-relaxed text-amber-50/90">{lesson.master.lines}</blockquote>
          <p className="mt-1 text-[10px] text-amber-100/45">
            {lesson.master.poet}, <span className="italic">{lesson.master.poem}</span> ({lesson.master.year})
          </p>
          <p className="mt-2 text-xs leading-relaxed text-amber-100/70">{lesson.master.lesson}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-amber-100/90">
            <span className="font-semibold text-amber-300">Try it: </span>
            {lesson.master.tryIt}
          </p>
        </section>
      )}
    </aside>
  );
};
