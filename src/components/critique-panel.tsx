import { useEffect, useState } from "react";
import { Award, Lightbulb, RotateCw } from "lucide-react";
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

const timeLabel = (date: Date) => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// Admin only: a workshop-style read of one poem, refreshed on demand
export const CritiquePanel = ({ poem, open, onOpenChange }: CritiquePanelProps) => {
  const [reading, setReading] = useState<{ critique: Critique; at: Date } | null>(null);
  const read = () => setReading({ critique: critiquePoem(poem.title, poem.content), at: new Date() });

  // Read the poem when the panel opens; after that, only when Refresh is pressed
  useEffect(() => {
    if (open && !reading) setReading({ critique: critiquePoem(poem.title, poem.content), at: new Date() });
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
