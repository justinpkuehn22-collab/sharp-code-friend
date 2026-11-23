import { useMemo, useState } from "react";
import { BarChart3, Check, Eye, EyeOff, ClipboardPaste, Copy, CloudOff, Loader2, LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePoemStore } from "@/stores/poem-store";
import { useSessionStore } from "@/stores/session-store";
import { useShelfAutosave, type SaveStatus } from "@/hooks/use-shelf";
import { PoemBook } from "@/components/poem-book";
import { PoemReader } from "@/components/poem-reader";
import { GrandfatherClock } from "@/components/grandfather-clock";
import { ShelfSearch } from "@/components/shelf-search";
import { InsightsPanel } from "@/components/insights-panel";
import { WritingPrompts } from "@/components/writing-prompts";
import type { WritingPrompt } from "@/data/writing-prompts";
import { copyText, poemsToText, textToPoems } from "@/lib/poem-clipboard";
import { chunk, emptyFilter, filterPoems, moodsInUse, tagCounts, type PoemFilter } from "@/lib/poem-search";
import { isWritten } from "@/data/poems";
import { useIsMobile } from "@/hooks/use-mobile";


const pill =
  "flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300";

const SaveIndicator = ({ status }: { status: SaveStatus }) => {
  if (status === "saving")
    return (
      <span className="flex items-center gap-1 text-xs text-amber-100/60">
        <Loader2 size={12} className="animate-spin" aria-hidden="true" /> Saving…
      </span>
    );
  if (status === "saved")
    return (
      <span className="flex items-center gap-1 text-xs text-amber-100/60">
        <Check size={12} aria-hidden="true" /> Saved
      </span>
    );
  if (status === "error")
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
        <CloudOff size={12} aria-hidden="true" /> Not saved — check your connection
      </span>
    );
  return null;
};

export const Index = () => {
  const { poems, createPoem, discardIfEmpty, importPoems } = usePoemStore();
  const { token, role, signOut } = useSessionStore();
  const isOwner = role === "admin";
  // Lets the owner see the shelf exactly as guests with the reader's code do
  const [viewAsGuest, setViewAsGuest] = useState(false);
  const isAdmin = isOwner && !viewAsGuest;
  const saveStatus = useShelfAutosave(token, isOwner);

  const booksPerShelf = useIsMobile() ? 5 : 7;
  const [filter, setFilter] = useState<PoemFilter>(emptyFilter);
  const [openId, setOpenId] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [freshPrompt, setFreshPrompt] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);

  const written = useMemo(() => poems.filter(isWritten), [poems]);
  const visible = useMemo(() => filterPoems(written, filter), [written, filter]);
  const shelves = useMemo(() => chunk(visible, booksPerShelf), [visible, booksPerShelf]);
  const tags = useMemo(() => tagCounts(written), [written]);
  // Each book keeps its own size no matter how the shelf is filtered
  const bookIndex = useMemo(() => new Map(written.map((p, i) => [p.id, i])), [written]);
  const moods = useMemo(() => moodsInUse(written), [written]);

  const openPoem = poems.find((p) => p.id === openId) ?? null;
  const openIndex = visible.findIndex((p) => p.id === openId);

  const close = () => {
    if (openId) discardIfEmpty(openId);
    setOpenId(null);
    setFreshId(null);
    setFreshPrompt(null);
  };

  const writeNew = (prompt?: WritingPrompt) => {
    const id = createPoem({ mood: prompt?.mood ?? null });
    setFreshId(id);
    setFreshPrompt(prompt?.prompt ?? null);
    setOpenId(id);
  };

  const random = () => {
    if (visible.length === 0) return;
    setOpenId(visible[Math.floor(Math.random() * visible.length)].id);
  };

  const paste = async () => {
    let text = "";
    try {
      text = await navigator.clipboard.readText();
    } catch {
      text = window.prompt("Paste your poems here:") ?? "";
    }
    const added = importPoems(textToPoems(text));
    if (added === 0) toast.error("Nothing to paste. Copy some poems first.");
    else toast.success(`Added ${added} ${added === 1 ? "poem" : "poems"} to your shelf.`);
  };

  const leave = () => {
    if (isOwner && saveStatus === "saving") {
      toast.message("Hold on, still saving your last change.");
      return;
    }
    signOut();
  };

  return (
    <div className="room-backdrop flex min-h-screen flex-col items-center px-4 py-6 sm:py-10">
      <p className="neon-amber mb-5 animate-neon-flicker font-['Dancing_Script',cursive] text-3xl sm:text-4xl" aria-hidden="true">
        The poetry room
      </p>
      {isOwner && viewAsGuest && (
        <div className="mb-4 flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-100" role="status">
          <span className="flex items-center gap-2">
            <Eye size={14} aria-hidden="true" /> Guest view: this is exactly what friends with the reader's code see.
          </span>
          <button type="button" onClick={() => setViewAsGuest(false)} className="font-semibold underline hover:text-amber-50">
            Back to admin
          </button>
        </div>
      )}

      <header className="mb-4 flex w-full max-w-3xl items-center justify-between gap-3">
        <p className="font-display text-sm italic text-amber-100/70">
          {isAdmin ? "Welcome back. The house is yours." : "Pull up a chair and read a while."}
        </p>
        <div className="flex items-center gap-2">
          {isAdmin && <SaveIndicator status={saveStatus} />}
          {isOwner && (
            <button
              type="button"
              onClick={() => {
                setOpenId(null);
                setInsightsOpen(false);
                setViewAsGuest((v) => !v);
              }}
              aria-pressed={viewAsGuest}
              className={`${pill} border border-amber-100/20 bg-black/30 text-amber-100/85 hover:text-amber-50`}
            >
              {viewAsGuest ? <EyeOff size={12} aria-hidden="true" /> : <Eye size={12} aria-hidden="true" />}
              {viewAsGuest ? "Admin view" : "View as guest"}
            </button>
          )}
          {isAdmin && (
            <button type="button" onClick={() => setInsightsOpen(true)} className={`${pill} brass-plate text-stone-900 hover:brightness-110`}>
              <BarChart3 size={12} aria-hidden="true" /> Insights
            </button>
          )}
          <button type="button" onClick={leave} className={`${pill} border border-amber-100/20 bg-black/30 text-amber-100/85 hover:text-amber-50`}>
            <LogOut size={12} aria-hidden="true" /> Leave
          </button>
        </div>
      </header>

      <div className="shelf-cabinet relative w-full max-w-3xl">
        {/* Wall sconces either side, like the entrance */}
        <div className="pointer-events-none absolute -left-24 top-40 hidden h-28 w-28 animate-candle rounded-full bg-amber-500/25 blur-3xl lg:block" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 top-40 hidden h-28 w-28 animate-candle rounded-full bg-amber-500/25 blur-3xl lg:block" aria-hidden="true" />

        <div className="shelf-crown flex h-10 items-center justify-center rounded-t-[8px]">
          <span className="brass-plate rounded-sm px-4 py-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-900">
            Poems by JK
          </span>
        </div>

        <div className="shelf-back mx-3 sm:mx-5">
          <div className="flex animate-fade-in justify-center pb-4 pt-8">
            <GrandfatherClock />
          </div>

          <ShelfSearch
            filter={filter}
            onChange={setFilter}
            moods={moods}
            tags={tags}
            shown={visible.length}
            total={written.length}
            onRandom={random}
          />

          {shelves.length === 0 && (
            <div className="px-6 pb-2 pt-10 text-center">
              <p className="font-display text-lg italic text-amber-100/70">
                {written.length === 0
                  ? isAdmin
                    ? "Your shelf is waiting for its first poem."
                    : "No poems on the shelf yet. Check back soon."
                  : "No poems match that. Try another word or mood."}
              </p>
              <div className="shelf-plank mt-8 h-4" />
              <div className="shelf-plank-front h-3" />
            </div>
          )}

          {shelves.map((books, shelfIdx) => (
            <div key={shelfIdx} className="relative">
              <div className="flex items-end justify-center gap-2 px-6 pb-0 pt-8 sm:gap-3 sm:px-10">
                {books.map((poem) => (
                  <div key={poem.id} className="animate-fade-in">
                    <PoemBook poem={poem} index={bookIndex.get(poem.id) ?? 0} onOpen={setOpenId} />
                  </div>
                ))}
              </div>
              <div className="shelf-plank relative h-4 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
              </div>
              <div className="shelf-plank-front h-3" />
              <div className="shelf-plank-shadow h-1" />
            </div>
          ))}

          {isAdmin ? (
            <div className="flex flex-wrap items-center justify-center gap-3 pb-5 pt-6">
              <button type="button" onClick={() => writeNew()} className={`${pill} bg-amber-600 text-amber-50 hover:bg-amber-500`}>
                <Plus size={12} aria-hidden="true" /> Write a new poem
              </button>
              <button
                type="button"
                onClick={() => {
                  copyText(poemsToText(written))
                    .then(() => toast.success("All your poems are copied. Paste them anywhere to save or share."))
                    .catch(() => toast.error("Couldn't copy your poems. Please try again."));
                }}
                className={`${pill} border border-amber-100/20 bg-black/30 text-amber-100/85 hover:text-amber-50`}
              >
                <Copy size={12} aria-hidden="true" /> Copy all
              </button>
              <button type="button" onClick={() => void paste()} className={`${pill} border border-amber-100/20 bg-black/30 text-amber-100/85 hover:text-amber-50`}>
                <ClipboardPaste size={12} aria-hidden="true" /> Paste poems
              </button>
            </div>
          ) : (
            <div className="pb-5 pt-6" />
          )}

          {isAdmin && <WritingPrompts poems={written} onWrite={writeNew} />}
        </div>

        <div className="shelf-base h-6 rounded-b-sm" />
        <div className="flex justify-between px-6">
          <div className="shelf-foot h-3 w-8 rounded-b-md" />
          <div className="shelf-foot h-3 w-8 rounded-b-md" />
        </div>
      </div>

      {openPoem && (
        <PoemReader
          key={openPoem.id}
          poem={openPoem}
          isAdmin={isAdmin}
          startEditing={openPoem.id === freshId}
          prompt={openPoem.id === freshId ? (freshPrompt ?? undefined) : undefined}
          onClose={close}
          onPrevious={openIndex > 0 ? () => setOpenId(visible[openIndex - 1].id) : undefined}
          onNext={openIndex >= 0 && openIndex < visible.length - 1 ? () => setOpenId(visible[openIndex + 1].id) : undefined}
        />
      )}

      {isAdmin && (
        <InsightsPanel open={insightsOpen} onOpenChange={setInsightsOpen} poems={written} onOpenPoem={setOpenId} />
      )}
    </div>
  );
};
