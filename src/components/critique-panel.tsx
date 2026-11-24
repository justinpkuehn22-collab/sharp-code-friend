import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, Lightbulb, RotateCw, Shuffle } from "lucide-react";
import { findRhymes } from "@/services/rhyme-service";
import type { LineNote } from "@/lib/critique-coach";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { critiquePoem, sameText, type Critique } from "@/lib/poem-critique";
import { rhymeKindCounts } from "@/lib/rhyme";
import { RhymeLegend } from "@/components/rhyme-legend";
import { formatNumber } from "@/lib/poem-insights";
import type { Poem } from "@/data/poems";
import { cn } from "@/lib/utils";

interface CritiquePanelProps {
  poem: Poem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const scoreTone = (score: number) => (score >= 7.5 ? "text-emerald-300" : score >= 5.5 ? "text-amber-300" : "text-rose-300");

// Words that rhyme with a line's partner, looked up when the note is shown
const RhymeOptions = ({ word }: { word: string }) => {
  const rhymes = useQuery({ queryKey: ["rhymes", word], queryFn: () => findRhymes(word), staleTime: Infinity, retry: 1 });
  if (rhymes.isLoading) return <p className="mt-1.5 text-[11px] text-amber-100/45">Finding rhymes for “{word}”…</p>;
  if (rhymes.isError) return <p className="mt-1.5 text-[11px] text-amber-100/45">Couldn't look up rhymes right now.</p>;
  const perfect = rhymes.data?.perfect.slice(0, 8) ?? [];
  const near = rhymes.data?.near.slice(0, 6) ?? [];
  if (!perfect.length && !near.length) return <p className="mt-1.5 text-[11px] text-amber-100/45">No rhymes found for “{word}”.</p>;
  return (
    <div className="mt-1.5 space-y-1 text-xs">
      {perfect.length > 0 && (
        <p className="flex flex-wrap gap-1"><span className="text-amber-100/45">Rhymes:</span>{perfect.map((w) => <span key={w} className="rounded bg-emerald-400/15 px-1.5 text-emerald-100">{w}</span>)}</p>
      )}
      {near.length > 0 && (
        <p className="flex flex-wrap gap-1"><span className="text-amber-100/45">Near:</span>{near.map((w) => <span key={w} className="rounded border border-dashed border-sky-300/40 px-1.5 text-sky-100">{w}</span>)}</p>
      )}
    </div>
  );
};

const LineNoteCard = ({ note }: { note: LineNote }) => (
  <li className="rounded-md border border-amber-100/10 bg-white/[0.03] p-3">
    <p className="flex gap-2 font-body text-sm italic text-amber-100/85">
      <span className="shrink-0 not-italic tabular-nums text-amber-400/60">{note.lineNumber}</span>
      <span className="min-w-0 break-words">{note.line.trim()}</span>
    </p>
    <p className="mt-1.5 text-sm font-semibold text-amber-50">{note.title}</p>
    <p className="mt-0.5 text-xs leading-relaxed text-amber-100/70">{note.detail}</p>
    {note.ideas.length > 0 && (
      <ul className="mt-1.5 space-y-1">
        {note.ideas.map((idea) => (
          <li key={idea} className="border-l-2 border-amber-400/40 pl-2 text-xs text-amber-100/90">
            {note.kind === "filler" ? <span className="font-body text-sm italic">{idea}</span> : idea}
          </li>
        ))}
      </ul>
    )}
    {note.rhymeWith && <RhymeOptions word={note.rhymeWith} />}
  </li>
);

const timeLabel = (date: Date) => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// Admin only: a workshop-style read of one poem, refreshed on demand
export const CritiquePanel = ({ poem, open, onOpenChange }: CritiquePanelProps) => {
  const [reading, setReading] = useState<{ critique: Critique; at: Date; variation: number } | null>(null);
  const read = () => setReading({ critique: critiquePoem(poem.title, poem.content), at: new Date(), variation: 0 });
  // Same poem, a different set of famous examples and line notes
  const otherIdeas = () => {
    const variation = (reading?.variation ?? 0) + 1;
    setReading({ critique: critiquePoem(poem.title, poem.content, variation), at: new Date(), variation });
  };

  // Read the poem when the panel opens; after that, only when Refresh is pressed
  useEffect(() => {
    if (open && !reading) setReading({ critique: critiquePoem(poem.title, poem.content), at: new Date(), variation: 0 });
    // Only on opening: later edits wait for Refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const critique = reading?.critique;
  const changed = critique ? !sameText(critique.analyzedText, poem.content) : false;
  const counts = critique ? rhymeKindCounts(critique.analyzedText) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-amber-200/15 bg-[hsl(20,18%,8%)] text-amber-50 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl text-amber-100">Critique</SheetTitle>
          <SheetDescription className="text-amber-100/55">
            {poem.title.trim() || "Untitled"}
            {poem.kind === "favorite" && poem.author ? ` · ${poem.author}` : ""}
          </SheetDescription>
        </SheetHeader>

        {!critique ? (
          <p className="mt-6 text-sm text-amber-100/60">Reading the poem…</p>
        ) : (
          <div className="mt-5 space-y-6">
            {/* Overall and refresh */}
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-2 border-amber-400/50 bg-black/30">
                <span className={cn("font-display text-3xl font-bold", scoreTone(critique.overall))}>{formatNumber(critique.overall, 1)}</span>
                <span className="text-[10px] text-amber-100/45">out of 10</span>
              </div>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={read}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    changed ? "brass-plate text-stone-900" : "border border-amber-300/40 text-amber-100 hover:text-amber-50",
                  )}
                >
                  <RotateCw size={13} aria-hidden="true" /> Refresh
                </button>
                <button
                  type="button"
                  onClick={otherIdeas}
                  className="mt-1.5 flex items-center gap-1.5 rounded-full border border-amber-300/25 px-3 py-1.5 text-xs text-amber-100/80 transition hover:text-amber-50"
                >
                  <Shuffle size={13} aria-hidden="true" /> Other ideas
                </button>
                <p className="mt-1.5 text-[11px] text-amber-100/50" role="status">
                  {changed ? "You've changed the poem since this read." : `Read at ${reading ? timeLabel(reading.at) : ""}`}
                </p>
              </div>
            </div>

            {/* Rhyme */}
            <section>
              <h3 className="mb-1 text-[11px] uppercase tracking-[0.2em] text-amber-400/80">Rhyme scheme</h3>
              {critique.scheme && <p className="mb-2 break-words font-display text-lg tracking-[0.2em] text-amber-50">{critique.scheme}</p>}
              <p className="text-sm leading-relaxed text-amber-100/80">{critique.rhymeBlurb}</p>
              {counts && (
                <div className="mt-2">
                  <RhymeLegend counts={counts} />
                </div>
              )}
            </section>

            {/* Badges */}
            {critique.badges.length > 0 && (
              <section>
                <h3 className="mb-2 text-[11px] uppercase tracking-[0.2em] text-amber-400/80">What's working</h3>
                <ul className="flex flex-wrap gap-2">
                  {critique.badges.map((b) => (
                    <li key={b.id} title={b.reason} className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-100">
                      <Award size={12} className="text-amber-300" aria-hidden="true" /> {b.label}
                    </li>
                  ))}
                </ul>
                <ul className="mt-2 space-y-0.5 text-[11px] text-amber-100/55">
                  {critique.badges.map((b) => (
                    <li key={b.id}>
                      <span className="text-amber-100/80">{b.label}:</span> {b.reason}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Scores */}
            <section>
              <h3 className="mb-2 text-[11px] uppercase tracking-[0.2em] text-amber-400/80">Craft scores</h3>
              <ul className="space-y-3">
                {critique.elements.map((e) => (
                  <li key={e.id}>
                    <details className="group">
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm text-amber-50">{e.label}</span>
                          <span className={cn("font-display text-sm font-semibold tabular-nums", scoreTone(e.score))}>{formatNumber(e.score, 1)}</span>
                        </div>
                        <Progress value={e.score * 10} className="mt-1 h-1.5 bg-white/10 [&>div]:bg-amber-400" aria-label={`${e.label} score`} />
                        <p className="mt-1 text-[11px] leading-snug text-amber-100/55">{e.summary}</p>
                      </summary>
                      {e.evidence.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5 border-l border-amber-300/20 pl-2 text-[11px] italic text-amber-100/70">
                          {e.evidence.map((ev) => (
                            <li key={ev}>{ev}</li>
                          ))}
                        </ul>
                      )}
                    </details>
                  </li>
                ))}
              </ul>
            </section>

            {/* Line by line */}
            {critique.lineNotes.length > 0 && (
              <section>
                <h3 className="mb-2 text-[11px] uppercase tracking-[0.2em] text-amber-400/80">Line by line</h3>
                <ol className="space-y-3">
                  {critique.lineNotes.map((n) => (
                    <LineNoteCard key={`${n.lineNumber}-${n.kind}`} note={n} />
                  ))}
                </ol>
              </section>
            )}

            {/* Room to grow */}
            {critique.tips.length > 0 && (
              <section>
                <h3 className="mb-2 text-[11px] uppercase tracking-[0.2em] text-amber-400/80">Room to grow</h3>
                <ol className="space-y-3">
                  {critique.tips.map((t) => (
                    <li key={t.element} className="rounded-md border border-amber-100/10 bg-white/[0.03] p-3">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-50">
                        <Lightbulb size={13} className="text-amber-300" aria-hidden="true" /> {t.title}
                      </p>
                      {t.quote && <p className="mt-1.5 border-l-2 border-amber-400/40 pl-2 font-body text-sm italic text-amber-100/80">{t.quote}</p>}
                      <p className="mt-1.5 text-xs leading-relaxed text-amber-100/70">{t.detail}</p>
                      {t.master && (
                        <figure className="mt-3 rounded border border-amber-300/15 bg-black/25 p-2.5">
                          <figcaption className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-amber-400/75">
                            <BookOpen size={11} aria-hidden="true" /> Learn from the masters
                          </figcaption>
                          <blockquote className="whitespace-pre-line font-body text-sm italic leading-relaxed text-amber-50/90">{t.master.lines}</blockquote>
                          <p className="mt-1 text-[11px] text-amber-100/55">
                            {t.master.poet}, <span className="italic">{t.master.poem}</span> ({t.master.year})
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-amber-100/75">{t.master.lesson}</p>
                          <p className="mt-2 text-xs leading-relaxed text-amber-100/90">
                            <span className="font-semibold text-amber-300">Try it: </span>
                            {t.master.tryIt}
                          </p>
                        </figure>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <p className="border-t border-amber-200/10 pt-3 text-[10px] leading-snug text-amber-100/40">
              Scores come from patterns in the words, so treat them as a guide for revision, not a verdict on the poem.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
