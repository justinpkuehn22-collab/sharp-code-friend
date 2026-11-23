import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { moodLabels, type Poem } from "@/data/poems";
import { computeInsights, formatNumber, formatPercent } from "@/lib/poem-insights";
import { tagCounts } from "@/lib/poem-search";

interface InsightsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poems: Poem[];
  onOpenPoem: (id: string) => void;
}

const chartConfig = { count: { label: "Poems", color: "hsl(38, 70%, 50%)" } } satisfies ChartConfig;

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-md border border-amber-200/10 bg-white/[0.03] p-3">
    <p className="text-[11px] uppercase tracking-wider text-amber-100/45">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-amber-100">{value}</p>
    {hint && <p className="mt-0.5 truncate text-xs text-amber-100/45">{hint}</p>}
  </div>
);

// Only rendered for the admin: a look at the library as a whole
export const InsightsPanel = ({ open, onOpenChange, poems, onOpenPoem }: InsightsPanelProps) => {
  const insights = useMemo(() => computeInsights(poems), [poems]);
  const tags = useMemo(() => tagCounts(poems).slice(0, 10), [poems]);
  const moodData = insights.moodMix.map((m) => ({ mood: moodLabels[m.mood], count: m.count }));
  const maxWord = insights.topWords[0]?.count ?? 1;

  const jump = (id: string | undefined) => {
    if (!id) return;
    onOpenChange(false);
    onOpenPoem(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-amber-200/15 bg-[hsl(20,18%,9%)] text-amber-50">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-amber-100">Library insights</DialogTitle>
          <DialogDescription className="sr-only">Statistics about your poems</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Poems" value={formatNumber(insights.poemCount)} />
          <Stat label="Words" value={formatNumber(insights.totalWords)} />
          <Stat label="Lines" value={formatNumber(insights.totalLines)} />
          <Stat label="Avg. words" value={formatNumber(insights.averageWords, 1)} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => jump(insights.longest?.id)} className="text-left">
            <Stat label="Longest" value={`${formatNumber(insights.longest?.words ?? 0)} words`} hint={insights.longest?.title} />
          </button>
          <button type="button" onClick={() => jump(insights.shortest?.id)} className="text-left">
            <Stat label="Shortest" value={`${formatNumber(insights.shortest?.words ?? 0)} words`} hint={insights.shortest?.title} />
          </button>
          <button type="button" onClick={() => jump(insights.mostRhymed?.id)} className="text-left">
            <Stat label="Most rhymed" value={formatPercent(insights.mostRhymed?.density ?? 0)} hint={insights.mostRhymed?.title} />
          </button>
        </div>

        <p className="text-sm text-amber-100/60">
          On average {formatPercent(insights.averageRhymeDensity)} of your lines end in a rhyme.
        </p>

        <section>
          <h3 className="mb-2 font-display text-lg text-amber-100">Words you return to</h3>
          {insights.topWords.length === 0 ? (
            <p className="text-sm text-amber-100/50">Write a few poems to see your favourite words.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {insights.topWords.map(({ word, count }) => (
                <li
                  key={word}
                  className={
                    count >= maxWord * 0.75
                      ? "rounded-full bg-amber-500/25 px-3 py-1 text-base text-amber-50"
                      : count >= maxWord * 0.45
                        ? "rounded-full bg-amber-500/15 px-3 py-1 text-sm text-amber-100"
                        : "rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-100/80"
                  }
                >
                  {word} <span className="opacity-50">{formatNumber(count)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="mb-2 font-display text-lg text-amber-100">Mood mix</h3>
          {moodData.length === 0 ? (
            <p className="text-sm text-amber-100/50">
              No moods set yet. Open a poem, tap the pencil and pick a mood to see the mix here.
            </p>
          ) : (
            <ChartContainer config={chartConfig} className={moodData.length <= 2 ? "h-24 w-full" : moodData.length <= 5 ? "h-40 w-full" : "h-56 w-full"}>
              <BarChart data={moodData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis type="category" dataKey="mood" width={90} tickLine={false} axisLine={false} tick={{ fill: "hsl(38, 30%, 75%)", fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} barSize={16} />
              </BarChart>
            </ChartContainer>
          )}
          {insights.noMoodCount > 0 && moodData.length > 0 && (
            <p className="text-xs text-amber-100/45">{formatNumber(insights.noMoodCount)} poems have no mood yet.</p>
          )}
        </section>

        <section>
          <h3 className="mb-2 font-display text-lg text-amber-100">Tags</h3>
          {tags.length === 0 ? (
            <p className="text-sm text-amber-100/50">No tags yet. Tags help friends find poems by theme.</p>
          ) : (
            <p className="text-sm text-amber-100/70">
              {tags.map((t) => `#${t.tag} (${formatNumber(t.count)})`).join(" · ")}
            </p>
          )}
          {insights.untaggedCount > 0 && (
            <p className="mt-1 text-xs text-amber-100/45">{formatNumber(insights.untaggedCount)} poems have no tags.</p>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};
