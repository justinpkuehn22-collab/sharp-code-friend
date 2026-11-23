import type { Mood, Poem } from "@/data/poems";

export interface PoemFilter {
  query: string;
  mood: Mood | null;
  tag: string | null;
}

export const emptyFilter: PoemFilter = { query: "", mood: null, tag: null };

const normalise = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "'");

// Every word in the query must appear somewhere in the title, poem or tags
export const matchesFilter = (poem: Poem, filter: PoemFilter): boolean => {
  if (filter.mood && poem.mood !== filter.mood) return false;
  if (filter.tag && !poem.tags.includes(filter.tag)) return false;
  const terms = normalise(filter.query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalise(`${poem.title}\n${poem.content}\n${poem.tags.join(" ")}`);
  return terms.every((term) => haystack.includes(term));
};

export const filterPoems = (poems: Poem[], filter: PoemFilter): Poem[] =>
  poems.filter((poem) => matchesFilter(poem, filter));

export const isFilterActive = (filter: PoemFilter): boolean =>
  filter.query.trim() !== "" || filter.mood !== null || filter.tag !== null;

// Tags sorted by how often they're used, then alphabetically
export const tagCounts = (poems: Poem[]): Array<{ tag: string; count: number }> => {
  const counts = new Map<string, number>();
  for (const poem of poems) for (const tag of poem.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  );
};

export const moodsInUse = (poems: Poem[]): Mood[] => {
  const used = new Set<Mood>();
  for (const poem of poems) if (poem.mood) used.add(poem.mood);
  return Array.from(used);
};

export const chunk = <T,>(items: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
};
