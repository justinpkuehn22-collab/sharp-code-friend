import { useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { toast } from "sonner";
import { isOwn, type Poem } from "@/data/poems";
import { worldPoems, worldShelfAuthor, worldShelfText, worldShelfTitle } from "@/data/world-poems";
import { masterExamples } from "@/data/master-examples";
import { kindredPoems, type Kinship } from "@/lib/poem-themes";
import { shelfIdForWorldPoem, worldPoemForShelfId } from "@/lib/world-shelf";
import { favoriteId, usePoemStore } from "@/stores/poem-store";
import { cn } from "@/lib/utils";

// Moods and tags the writer picked, in theme terms
const moodThemes: Record<string, string> = { reflection: "self", family: "home" };
const themesFor = (p: Poem) => [...(p.mood ? [moodThemes[p.mood] ?? p.mood] : []), ...p.tags];

interface Card {
  key: string;
  title: string;
  author: string;
  text: string;
  original?: { text: string; lang: string; rtl?: boolean; language: string };
  // Not on the shelf yet: what to save
  saveAs?: { title: string; author: string; content: string; tags?: string[] };
  label?: string;
}

const preview = (text: string, lines = 4) => text.split("\n").filter((l) => l.trim()).slice(0, lines).join("\n");

const Row = ({ title, hint, items }: { title: string; hint: string; items: Array<{ card: Card; kinship: Kinship }> }) => {
  const strip = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const { poems, addFavorite } = usePoemStore();
  const scroll = (dir: number) => strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-amber-50">{title}</p>
          <p className="text-[11px] text-amber-100/45">{hint}</p>
        </div>
        <div className="hidden gap-1 sm:flex">
          <button type="button" onClick={() => scroll(-1)} className="rounded-full border border-amber-100/15 p-1 text-amber-100/70 hover:text-amber-50" aria-label={`Scroll ${title} left`}>
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scroll(1)} className="rounded-full border border-amber-100/15 p-1 text-amber-100/70 hover:text-amber-50" aria-label={`Scroll ${title} right`}>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
      {/* Swipe sideways through the row */}
      <div ref={strip} className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ card, kinship }) => {
          const expanded = open === card.key;
          const saved = card.saveAs ? poems.some((p) => p.id === favoriteId(card.saveAs!.title, card.saveAs!.author)) : true;
          return (
            <article key={card.key} className="flex w-[78%] shrink-0 snap-start flex-col rounded-md border border-amber-100/10 bg-white/[0.03] p-3 sm:w-60">
              <p className="font-display text-sm font-semibold leading-snug text-amber-50">{card.title}</p>
              <p className="text-[11px] italic text-amber-100/55">{card.author}{card.label ? ` · ${card.label}` : ""}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {kinship.shared.map((t) => (
                  <span key={t} className="rounded-full bg-amber-400/15 px-1.5 text-[10px] capitalize text-amber-200">{t}</span>
                ))}
              </div>
              {card.original && expanded && (
                <p lang={card.original.lang} dir={card.original.rtl ? "rtl" : undefined} className="mt-2 whitespace-pre-wrap border-l-2 border-amber-400/30 pl-2 font-body text-xs leading-relaxed text-amber-50/80">
                  {card.original.text}
                </p>
              )}
              <p className={cn("mt-2 flex-1 whitespace-pre-wrap font-body text-xs leading-relaxed text-amber-100/75", expanded && "max-h-72 overflow-y-auto")}>
                {expanded ? card.text : preview(card.text)}
              </p>
              {kinship.echoes.length > 0 && (
                <p className="mt-1.5 text-[10px] text-amber-100/40">Both say: {kinship.echoes.join(", ")}</p>
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                <button type="button" onClick={() => setOpen(expanded ? null : card.key)} className="text-[11px] text-amber-300 hover:text-amber-200">
                  {expanded ? "Show less" : card.original ? `Read it, with the ${card.original.language}` : "Read it all"}
                </button>
                {card.saveAs && (
                  <button
                    type="button"
                    disabled={saved}
                    onClick={() => {
                      if (card.saveAs) addFavorite(card.saveAs);
                      toast.success(`"${card.saveAs?.title}" is on your favorites shelf.`);
                    }}
                    className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", saved ? "text-amber-100/50" : "brass-plate text-stone-900")}
                  >
                    {saved ? <Check size={10} aria-hidden="true" /> : <Star size={10} aria-hidden="true" />}
                    {saved ? "On your shelf" : "Save"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

// Admin only: poems that share this one's themes, from his own shelf and from the great poets
export const KindredPoems = ({ poem }: { poem: Poem }) => {
  const poems = usePoemStore((s) => s.poems);

  const { mine, theirs } = useMemo(() => {
    const themes = themesFor(poem);
    const others = poems.filter((p) => p.id !== poem.id && p.content.trim());
    const mine = kindredPoems(
      poem.content,
      themes,
      others.filter(isOwn).map((p) => ({ item: { key: p.id, title: p.title || "Untitled", author: "JK", text: p.content } as Card, text: p.content, themes: themesFor(p) })),
      8,
    );
    const shelfIds = new Set(poems.map((p) => p.id));
    const favorites = others
      .filter((p) => !isOwn(p) && !worldPoemForShelfId(p.id))
      .map((p) => ({ item: { key: p.id, title: p.title, author: p.author ?? "", text: p.content, label: "your favorite" } as Card, text: p.content }));
    const world = worldPoems.map((w) => {
      const onShelf = shelfIds.has(shelfIdForWorldPoem(w));
      return {
        item: {
          key: `world-${w.id}`,
          title: w.title,
          author: w.poet,
          text: w.translation,
          label: onShelf ? `your favorite · ${w.language}` : w.language,
          original: { text: w.original, lang: w.lang, rtl: w.rtl, language: w.language },
          saveAs: { title: worldShelfTitle(w), author: worldShelfAuthor(w), content: worldShelfText(w) },
        } as Card,
        text: `${w.title}\n${w.translation}`,
      };
    });
    const masters = masterExamples
      .filter((m) => !shelfIds.has(favoriteId(m.poem, m.poet)))
      .map((m) => ({
        item: { key: `master-${m.id}`, title: m.poem, author: m.poet, text: m.lines, label: `${m.year}`, saveAs: { title: m.poem, author: m.poet, content: m.lines, tags: ["excerpt"] } } as Card,
        text: m.lines,
      }));
    // One card per poem, even when a famous passage and a saved favorite are the same poem
    const seen = new Set<string>();
    const theirs = kindredPoems(poem.content, themes, [...favorites, ...world, ...masters], 14).filter(({ item }) => {
      const k = `${item.title}|${item.author}`.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    return { mine: mine.map((r) => ({ card: r.item, kinship: r.kinship })), theirs: theirs.slice(0, 10).map((r) => ({ card: r.item, kinship: r.kinship })) };
  }, [poem, poems]);

  if (!mine.length && !theirs.length) return null;
  return (
    <section id="kindred-poems" className="scroll-mt-4 space-y-4">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-amber-400/80">Kindred poems</h3>
      {mine.length > 0 && <Row title="From your shelf" hint="Your poems that circle the same themes. Swipe to see more." items={mine} />}
      {theirs.length > 0 && <Row title="Poets who went there too" hint="From your favorites, the world library and the masters." items={theirs} />}
    </section>
  );
};
