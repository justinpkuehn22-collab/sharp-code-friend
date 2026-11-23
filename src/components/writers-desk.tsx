import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { findRhymes } from "@/services/rhyme-service";
import { lastWord, rhymeGroups, rhymeLetters, rhymeSchemeText } from "@/lib/rhyme";
import { lineSyllables } from "@/lib/syllables";
import { words } from "@/lib/poem-insights";
import { formatNumber } from "@/lib/poem-insights";
import { colorIndexForLetter, rhymeBadgeColors } from "@/lib/rhyme-colors";
import { cn } from "@/lib/utils";

interface WritersDeskProps {
  content: string;
  onInsertWord: (word: string) => void;
}

// A side panel for the poet: live counts, the rhyme scheme as it forms, and a rhyme finder
export const WritersDesk = ({ content, onInsertWord }: WritersDeskProps) => {
  const lines = content.split("\n");
  const letters = useMemo(() => rhymeLetters(content), [content]);
  const rhyming = useMemo(() => rhymeGroups(content), [content]);
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
    <aside aria-label="Writer's desk" className="flex min-h-0 flex-col gap-4 overflow-y-auto border-amber-200/10 px-6 py-8 text-amber-100 lg:border-l">
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
            <ol className="space-y-1 text-xs">
              {lines.map((line, i) => {
                const letter = letters[i];
                if (!letter) return null;
                const rhymes = rhyming.has(i);
                return (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded font-semibold",
                        rhymes ? rhymeBadgeColors[colorIndexForLetter(letter)] : "bg-white/5 text-amber-100/40",
                      )}
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
          <p className="text-xs text-amber-100/45">Start writing and the pattern of your end rhymes will appear here.</p>
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
          <p className="text-xs text-amber-100/45">Type a word, or end a line and I'll look up rhymes for it.</p>
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
    </aside>
  );
};
