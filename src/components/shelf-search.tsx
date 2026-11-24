import { Search, Shuffle, X } from "lucide-react";
import { moodLabels, type Mood } from "@/data/poems";
import { isFilterActive, type PoemFilter } from "@/lib/poem-search";
import { cn } from "@/lib/utils";

interface ShelfSearchProps {
  filter: PoemFilter;
  onChange: (filter: PoemFilter) => void;
  moods: Mood[];
  tags: Array<{ tag: string; count: number }>;
  shown: number;
  total: number;
  onRandom: () => void;
}

const chip = (active: boolean) =>
  cn(
    "rounded-full border px-2.5 py-0.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
    active ? "border-amber-400 bg-amber-400/20 text-amber-50" : "border-amber-100/15 text-amber-100/60 hover:text-amber-100",
  );

export const ShelfSearch = ({ filter, onChange, moods, tags, shown, total, onRandom }: ShelfSearchProps) => (
  <section aria-label="Find a poem" className="mx-auto w-full max-w-xl space-y-3 px-4 pt-2 sm:px-6">
    <div className="flex gap-2">
      <label className="flex flex-1 items-center gap-2 rounded-full border border-amber-100/15 bg-black/25 px-4 py-2 focus-within:ring-2 focus-within:ring-amber-400/60">
        <Search size={14} className="text-amber-100/50" aria-hidden="true" />
        <span className="sr-only">Search poems</span>
        <input
          type="search"
          value={filter.query}
          onChange={(e) => onChange({ ...filter, query: e.target.value })}
          placeholder="Search poems"
          className="w-full bg-transparent text-sm text-amber-50 outline-none placeholder:text-amber-100/35"
        />
      </label>
      <button
        type="button"
        onClick={onRandom}
        disabled={shown === 0}
        className="flex items-center gap-1.5 rounded-full border border-amber-100/15 bg-black/25 px-3 text-xs text-amber-100/80 transition hover:text-amber-50 disabled:opacity-40"
      >
        <Shuffle size={13} aria-hidden="true" /> Surprise me
      </button>
    </div>

    {(moods.length > 0 || tags.length > 0) && (
      <div className="flex flex-wrap items-center gap-1.5">
        {moods.map((mood) => (
          <button
            key={mood}
            type="button"
            aria-pressed={filter.mood === mood}
            onClick={() => onChange({ ...filter, mood: filter.mood === mood ? null : mood })}
            className={chip(filter.mood === mood)}
          >
            {moodLabels[mood]}
          </button>
        ))}
        {tags.slice(0, 10).map(({ tag }) => (
          <button
            key={tag}
            type="button"
            aria-pressed={filter.tag === tag}
            onClick={() => onChange({ ...filter, tag: filter.tag === tag ? null : tag })}
            className={chip(filter.tag === tag)}
          >
            #{tag}
          </button>
        ))}
      </div>
    )}

    {isFilterActive(filter) && (
      <p className="flex items-center justify-between text-xs text-amber-100/55" role="status">
        <span>
          Showing {shown} of {total} {total === 1 ? "poem" : "poems"}
        </span>
        <button
          type="button"
          onClick={() => onChange({ query: "", mood: null, tag: null })}
          className="flex items-center gap-1 hover:text-amber-100"
        >
          <X size={12} aria-hidden="true" /> Clear
        </button>
      </p>
    )}
  </section>
);
