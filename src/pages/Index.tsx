import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBackendFeatures } from "@/services/shelf-service";
import { Check, CloudOff, Eye, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePoemStore } from "@/stores/poem-store";
import { useSessionStore } from "@/stores/session-store";
import { useShelfAutosave, type SaveStatus } from "@/hooks/use-shelf";
import { PoemBook } from "@/components/poem-book";
import { PoemReader } from "@/components/poem-reader";
import { GrandfatherClock } from "@/components/grandfather-clock";
import { ShelfSearch } from "@/components/shelf-search";
import { InsightsPanel } from "@/components/insights-panel";
import { PhonographPlayer } from "@/components/phonograph-player";
import { CheersCelebration } from "@/components/cheers-celebration";
import { RoomMenu } from "@/components/room-menu";
import { ShareInvite } from "@/components/share-invite";
import { LibraryPanel } from "@/components/library-panel";
import { useLoungeStore } from "@/stores/lounge-store";
import { WritingPrompts } from "@/components/writing-prompts";
import type { WritingPrompt } from "@/data/writing-prompts";
import { copyText, poemsToText, textToPoems } from "@/lib/poem-clipboard";
import { chunk, emptyFilter, filterPoems, moodsInUse, tagCounts, type PoemFilter } from "@/lib/poem-search";
import { isOwn, isWritten, type Poem } from "@/data/poems";
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

// One shelf of books with its plank
const Shelf = ({ books, bookIndex, onOpen }: { books: Poem[]; bookIndex: Map<string, number>; onOpen: (id: string) => void }) => (
  <div className="relative">
    <div className="flex items-end justify-center gap-2 px-6 pb-0 pt-8 sm:gap-3 sm:px-10">
      {books.map((poem) => (
        <div key={poem.id} className="animate-fade-in">
          <PoemBook poem={poem} index={bookIndex.get(poem.id) ?? 0} onOpen={onOpen} />
        </div>
      ))}
    </div>
    <div className="shelf-plank relative h-4 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
    </div>
    <div className="shelf-plank-front h-3" />
    <div className="shelf-plank-shadow h-1" />
  </div>
);

export const Index = () => {
  const { poems, createPoem, discardIfEmpty, importPoems } = usePoemStore();
  const { token, role, signOut } = useSessionStore();
  const isOwner = role === "admin";
  // Lets the owner see the shelf exactly as guests with the reader's code do
  const [viewAsGuest, setViewAsGuest] = useState(false);
  const isAdmin = isOwner && !viewAsGuest;
  const saveStatus = useShelfAutosave(token, isOwner);
  // The library only appears once the backend can store favorites properly
  const features = useQuery({ queryKey: ["backend-features"], queryFn: fetchBackendFeatures, enabled: isOwner, staleTime: 5 * 60_000 });
  const canFavorite = features.data?.includes("favorites") ?? false;

  const booksPerShelf = useIsMobile() ? 5 : 7;
  const [filter, setFilter] = useState<PoemFilter>(emptyFilter);
  const [openId, setOpenId] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [freshPrompt, setFreshPrompt] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [cheers, setCheers] = useState<number | null>(null);
  const withSound = useLoungeStore((s) => s.typewriterSounds);
  const endCheers = useCallback(() => setCheers(null), []);

  const written = useMemo(() => poems.filter(isWritten), [poems]);
  // JK's own poems, used for insights and writing prompts
  const own = useMemo(() => written.filter(isOwn), [written]);
  const visible = useMemo(() => filterPoems(written, filter), [written, filter]);
  const visibleOwn = useMemo(() => visible.filter(isOwn), [visible]);
  const visibleFavorites = useMemo(() => visible.filter((p) => !isOwn(p)), [visible]);
  // Own poems first, then the favorites, so reading order follows the shelves
  const readingOrder = useMemo(() => [...visibleOwn, ...visibleFavorites], [visibleOwn, visibleFavorites]);
  const shelves = useMemo(() => chunk(visibleOwn, booksPerShelf), [visibleOwn, booksPerShelf]);
  const favoriteShelves = useMemo(() => chunk(visibleFavorites, booksPerShelf), [visibleFavorites, booksPerShelf]);
  const tags = useMemo(() => tagCounts(written), [written]);
  // Each book keeps its own size no matter how the shelf is filtered
  const bookIndex = useMemo(() => new Map(written.map((p, i) => [p.id, i])), [written]);
  const moods = useMemo(() => moodsInUse(written), [written]);

  const openPoem = poems.find((p) => p.id === openId) ?? null;
  const openIndex = readingOrder.findIndex((p) => p.id === openId);

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

  const copyAll = () => {
    copyText(poemsToText(own))
      .then(() => toast.success("All your poems are copied. Paste them anywhere to save or share."))
      .catch(() => toast.error("Couldn't copy your poems. Please try again."));
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
      <header className="mb-4 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-display text-sm italic text-amber-100/70">
          <span className="rounded-sm border border-amber-400/40 px-1.5 py-px font-body text-[10px] not-italic uppercase tracking-[0.2em] text-amber-300">
            {isOwner ? (viewAsGuest ? "Guest view" : "Admin") : "Guest"}
          </span>
          {isOwner && viewAsGuest && <Eye size={13} aria-hidden="true" className="not-italic" />}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && <SaveIndicator status={saveStatus} />}
          {isAdmin && (
            <button type="button" onClick={() => writeNew()} className={`${pill} brass-plate text-stone-900 hover:brightness-110`}>
              <Plus size={12} aria-hidden="true" /> Write a new poem
            </button>
          )}
          <RoomMenu
            isOwner={isOwner}
            viewAsGuest={viewAsGuest}
            className={`${pill} border border-amber-100/20 bg-black/30 text-amber-100/85 hover:text-amber-50`}
            onShare={() => setShareOpen(true)}
            onLibrary={canFavorite ? () => setLibraryOpen(true) : undefined}
            onInsights={() => setInsightsOpen(true)}
            onToggleGuestView={() => {
              setOpenId(null);
              setViewAsGuest((v) => !v);
            }}
            onCopyAll={copyAll}
            onPaste={() => void paste()}
            onLeave={leave}
          />
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
            {isAdmin ? (
              <button
                type="button"
                onClick={() => writeNew()}
                className="group relative flex flex-col items-center rounded-md transition hover:drop-shadow-[0_0_24px_rgba(251,191,36,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                aria-label="Write a new poem"
              >
                <GrandfatherClock />
              </button>
            ) : (
              <GrandfatherClock />
            )}
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

          {shelves.length === 0 && favoriteShelves.length === 0 && (
            <div className="px-6 pb-2 pt-10 text-center">
              <p className="font-display text-lg italic text-amber-100/70">
                {written.length === 0
                  ? isAdmin
                    ? "Your shelf is waiting for its first poem."
                    : "No poems on the shelf yet."
                  : "No poems match that."}
              </p>
              <div className="shelf-plank mt-8 h-4" />
              <div className="shelf-plank-front h-3" />
            </div>
          )}

          {shelves.map((books, shelfIdx) => (
            <Shelf key={`own-${shelfIdx}`} books={books} bookIndex={bookIndex} onOpen={setOpenId} />
          ))}

          {favoriteShelves.length > 0 && (
            <>
              <div className="flex justify-center pt-8">
                <span className="brass-plate rounded-sm px-4 py-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-900">
                  JK's favorites
                </span>
              </div>
              {favoriteShelves.map((books, shelfIdx) => (
                <Shelf key={`fav-${shelfIdx}`} books={books} bookIndex={bookIndex} onOpen={setOpenId} />
              ))}
            </>
          )}

          <div className="pb-6 pt-6" />

          {isAdmin && <WritingPrompts poems={own} onWrite={writeNew} />}
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
          onFinishedWriting={() => setCheers(Date.now())}
          onClose={close}
          onPrevious={openIndex > 0 ? () => setOpenId(readingOrder[openIndex - 1].id) : undefined}
          onNext={openIndex >= 0 && openIndex < readingOrder.length - 1 ? () => setOpenId(readingOrder[openIndex + 1].id) : undefined}
        />
      )}

      <PhonographPlayer />

      {cheers !== null && <CheersCelebration key={cheers} trigger={cheers} withSound={withSound} onDone={endCheers} />}

      {isAdmin && <InsightsPanel open={insightsOpen} onOpenChange={setInsightsOpen} poems={own} onOpenPoem={setOpenId} />}
      {isAdmin && token && <ShareInvite token={token} open={shareOpen} onOpenChange={setShareOpen} />}
      {isAdmin && <LibraryPanel open={libraryOpen} onOpenChange={setLibraryOpen} />}
    </div>
  );
};
