import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Check, Search, Shuffle, Star } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { libraryPoets, starterPicks } from "@/data/library-poets";
import { fetchPoem, poemsByPoet, poemText, randomPoem, searchTitles, type LibraryPoem } from "@/services/poetry-library";
import { favoriteId, usePoemStore } from "@/stores/poem-store";
import { cn } from "@/lib/utils";

interface LibraryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tab = "picks" | "poets" | "search";

const tabClass = (active: boolean) =>
  cn("rounded-full px-3 py-1 text-xs transition", active ? "bg-amber-400 text-stone-900" : "text-amber-100/70 hover:text-amber-50");

const rowClass = (active: boolean) =>
  cn("w-full rounded px-2 py-1.5 text-left text-sm transition hover:bg-white/5", active ? "bg-white/10 text-amber-50" : "text-amber-100/80");

// Admin only: browse public-domain classics and favorite the ones that inspire you
export const LibraryPanel = ({ open, onOpenChange }: LibraryPanelProps) => {
  const { poems, addFavorite, deletePoem } = usePoemStore();
  const [tab, setTab] = useState<Tab>("picks");
  const [poet, setPoet] = useState(libraryPoets[0].query);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ title: string; poet: string } | null>(null);
  const [surprise, setSurprise] = useState<LibraryPoem | null>(null);

  const byPoet = useQuery({ queryKey: ["library-poet", poet], queryFn: () => poemsByPoet(poet), enabled: open && tab === "poets", staleTime: Infinity });
  const search = useQuery({ queryKey: ["library-search", query], queryFn: () => searchTitles(query), enabled: open && tab === "search" && query.length > 1, staleTime: Infinity });
  const poem = useQuery({
    queryKey: ["library-poem", selected?.title, selected?.poet],
    queryFn: () => (selected ? fetchPoem(selected.title, selected.poet) : Promise.resolve(null)),
    enabled: open && selected !== null && surprise === null,
    staleTime: Infinity,
  });
  const shown = surprise ?? poem.data ?? null;
  const shownId = shown ? favoriteId(shown.title, shown.author) : null;
  const onShelf = shownId !== null && poems.some((p) => p.id === shownId);

  const choose = (title: string, poetQuery: string) => {
    setSurprise(null);
    setSelected({ title, poet: poetQuery });
  };

  const surpriseMe = async () => {
    try {
      const found = await randomPoem();
      if (found) {
        setSelected(null);
        setSurprise(found);
      }
    } catch {
      toast.error("The library didn't answer. Try again in a moment.");
    }
  };

  const toggleFavorite = () => {
    if (!shown || !shownId) return;
    if (onShelf) {
      deletePoem(shownId);
      toast.success(`Took "${shown.title}" off your shelf.`);
    } else {
      addFavorite({ title: shown.title, author: shown.author, content: poemText(shown) });
      toast.success(`"${shown.title}" is on your favorites shelf.`);
    }
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setQuery(draft.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden border-amber-200/15 bg-[hsl(20,18%,9%)] p-0 text-amber-50">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 font-display text-2xl text-amber-100">
            <BookOpen size={20} className="text-amber-400" aria-hidden="true" /> The library
          </DialogTitle>
          <DialogDescription className="sr-only">Browse classic poems and add favorites to your shelf</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 grid-cols-1 border-t border-amber-200/10 md:grid-cols-[300px_minmax(0,1fr)]">
          {/* Browse */}
          <div className="flex max-h-[30vh] min-h-0 flex-col border-amber-200/10 md:max-h-[70vh] md:border-r">
            <div className="flex flex-wrap items-center gap-1 px-4 py-3">
              <button type="button" className={tabClass(tab === "picks")} onClick={() => setTab("picks")}>Picks</button>
              <button type="button" className={tabClass(tab === "poets")} onClick={() => setTab("poets")}>Poets</button>
              <button type="button" className={tabClass(tab === "search")} onClick={() => setTab("search")}>Search</button>
              <button type="button" onClick={() => void surpriseMe()} className="ml-auto flex items-center gap-1 text-xs text-amber-100/70 hover:text-amber-50" aria-label="Surprise me with a classic">
                <Shuffle size={12} aria-hidden="true" /> Surprise
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
              {tab === "picks" && (
                <ul>
                  {starterPicks.map((p) => (
                    <li key={`${p.poet}-${p.title}`}>
                      <button type="button" onClick={() => choose(p.title, p.poet)} className={rowClass(selected?.title === p.title && selected.poet === p.poet)}>
                        <span className="block">{p.title}</span>
                        <span className="block text-[11px] text-amber-100/45">{p.why}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {tab === "poets" && (
                <>
                  <select
                    value={poet}
                    onChange={(e) => setPoet(e.target.value)}
                    aria-label="Poet"
                    className="mb-2 w-full rounded border border-amber-100/15 bg-black/40 px-2 py-1.5 text-sm text-amber-50"
                  >
                    {libraryPoets.map((p) => (
                      <option key={p.query} value={p.query}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {byPoet.isLoading && <p className="px-2 text-xs text-amber-100/50">Pulling books off the shelf…</p>}
                  {byPoet.isError && <p className="px-2 text-xs text-red-300">The library didn't answer. Try again in a moment.</p>}
                  <ul>
                    {byPoet.data?.map((p) => (
                      <li key={`${p.author}-${p.title}`}>
                        <button type="button" onClick={() => choose(p.title, poet)} className={rowClass(selected?.title === p.title)}>
                          {p.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {tab === "search" && (
                <>
                  <form onSubmit={onSearch} className="mb-2 flex items-center gap-2 rounded-full border border-amber-100/15 bg-black/30 px-3 py-1.5">
                    <Search size={12} className="text-amber-100/40" aria-hidden="true" />
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="A title, e.g. Ozymandias"
                      aria-label="Search titles"
                      className="w-full bg-transparent text-sm text-amber-50 outline-none placeholder:text-amber-100/35"
                    />
                  </form>
                  {search.isLoading && <p className="px-2 text-xs text-amber-100/50">Searching…</p>}
                  {search.isError && <p className="px-2 text-xs text-red-300">The library didn't answer. Try again in a moment.</p>}
                  {search.data && search.data.length === 0 && <p className="px-2 text-xs text-amber-100/50">Nothing by that title.</p>}
                  <ul>
                    {search.data?.map((p) => (
                      <li key={`${p.author}-${p.title}`}>
                        <button type="button" onClick={() => choose(p.title, p.author)} className={rowClass(selected?.title === p.title)}>
                          <span className="block">{p.title}</span>
                          <span className="block text-[11px] text-amber-100/45">{p.author}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Read */}
          <div className="min-h-0 max-h-[55vh] overflow-y-auto px-6 py-6 md:max-h-[70vh]">
            {!selected && !surprise ? (
              <p className="pt-10 text-center font-display text-lg italic text-amber-100/40">Pick a poem to read it here.</p>
            ) : poem.isLoading && !surprise ? (
              <p className="text-sm text-amber-100/50">Opening the book…</p>
            ) : !shown ? (
              <p className="text-sm text-amber-100/60">That one isn't in the library. Try another.</p>
            ) : (
              <article>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[hsl(38,55%,70%)]">{shown.title}</h3>
                    <p className="text-sm italic text-amber-100/60">{shown.author}</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    aria-pressed={onShelf}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      onShelf ? "border border-amber-300/50 text-amber-100" : "brass-plate text-stone-900",
                    )}
                  >
                    {onShelf ? <Check size={13} aria-hidden="true" /> : <Star size={13} aria-hidden="true" />}
                    {onShelf ? "On your shelf" : "Add to favorites"}
                  </button>
                </div>
                <div className="whitespace-pre-wrap font-body text-base leading-[2] text-[hsl(34,20%,72%)]">{poemText(shown)}</div>
              </article>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
