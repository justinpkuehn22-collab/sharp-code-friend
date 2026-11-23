import { isLibraryPoet, libraryPoets } from "@/data/library-poets";

// The classics come from PoetryDB, a free public collection of public-domain poems.
// Only the search words are sent; nothing about the shelf or its poems.
const base = "https://poetrydb.org";

export interface LibraryPoemSummary {
  title: string;
  author: string;
  linecount: number;
}

export interface LibraryPoem extends LibraryPoemSummary {
  lines: string[];
}

const get = async <T,>(path: string): Promise<T[]> => {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error("The library didn't answer");
  const data: unknown = await res.json();
  // "Not found" comes back as an object rather than a list
  if (!Array.isArray(data)) return [];
  return data as T[];
};

const segment = (s: string) => encodeURIComponent(s.replace(/[;/]/g, " ").trim());

const tidy = <T extends { author: string; linecount?: number | string }>(items: T[]) =>
  items
    .filter((p) => isLibraryPoet(p.author))
    .map((p) => ({ ...p, linecount: Number(p.linecount ?? 0) }));

// Short and medium poems only: epics don't fit on a little shelf
const maxLines = 140;

export const poemsByPoet = async (query: string): Promise<LibraryPoemSummary[]> =>
  tidy(await get<LibraryPoemSummary>(`/author/${segment(query)}/author,title,linecount`))
    .filter((p) => p.linecount > 0 && p.linecount <= maxLines)
    .sort((a, b) => a.title.localeCompare(b.title));

export const searchTitles = async (title: string): Promise<LibraryPoemSummary[]> =>
  tidy(await get<LibraryPoemSummary>(`/title/${segment(title)}/author,title,linecount`))
    .filter((p) => p.linecount > 0 && p.linecount <= maxLines)
    .slice(0, 40);

const normal = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

// Finds one poem by title and poet, preferring an exact title match
export const fetchPoem = async (title: string, poetQuery: string): Promise<LibraryPoem | null> => {
  const matches = tidy(await get<LibraryPoem>(`/author,title/${segment(poetQuery)};${segment(title)}`));
  if (matches.length === 0) return null;
  const exact = matches.find((p) => normal(p.title) === normal(title));
  const starts = matches.find((p) => normal(p.title).startsWith(normal(title)));
  return exact ?? starts ?? matches[0];
};

// A random short poem from one of the library's poets
export const randomPoem = async (): Promise<LibraryPoem | null> => {
  const poet = libraryPoets[Math.floor(Math.random() * libraryPoets.length)];
  const list = await poemsByPoet(poet.query);
  if (list.length === 0) return null;
  const pick = list[Math.floor(Math.random() * list.length)];
  return fetchPoem(pick.title, poet.query);
};

export const poemText = (poem: LibraryPoem): string =>
  poem.lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
