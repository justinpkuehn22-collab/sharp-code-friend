// Rhyme suggestions from Datamuse, a free public word-finding service.
// Only the single word being looked up is sent, never the poem.
const endpoint = "https://api.datamuse.com/words";

export interface RhymeSuggestions {
  perfect: string[];
  near: string[];
}

const lookup = async (param: "rel_rhy" | "rel_nry", word: string): Promise<string[]> => {
  const res = await fetch(`${endpoint}?${param}=${encodeURIComponent(word)}&max=18`);
  if (!res.ok) throw new Error("Rhyme lookup failed");
  const data = (await res.json()) as Array<{ word: string }>;
  return data.map((d) => d.word).filter((w) => /^[a-z' -]+$/i.test(w));
};

export const findRhymes = async (word: string): Promise<RhymeSuggestions> => {
  const clean = word.toLowerCase().replace(/[^a-z'-]/g, "");
  if (!clean) return { perfect: [], near: [] };
  const [perfect, near] = await Promise.all([lookup("rel_rhy", clean), lookup("rel_nry", clean)]);
  return { perfect, near: near.filter((w) => !perfect.includes(w)).slice(0, 12) };
};
