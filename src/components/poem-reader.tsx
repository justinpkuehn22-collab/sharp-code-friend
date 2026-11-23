import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Copy, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { moodLabels, moods, type Mood, type Poem } from "@/data/poems";
import { usePoemStore } from "@/stores/poem-store";
import { copyText, poemToText } from "@/lib/poem-clipboard";
import { useTypewriter } from "@/hooks/use-typewriter";
import { cn } from "@/lib/utils";

interface PoemReaderProps {
  poem: Poem;
  isAdmin: boolean;
  startEditing: boolean;
  // Shown above the editor when a poem was started from a writing prompt
  prompt?: string;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const iconButton =
  "flex h-9 w-9 items-center justify-center rounded-full shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300";

const TagEditor = ({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const tag = draft.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 30);
    if (tag && !tags.includes(tag) && tags.length < 12) onChange([...tags, tag]);
    setDraft("");
  };
  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded-full bg-amber-200/10 px-2.5 py-0.5 text-xs text-amber-100/80">
          #{tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remove tag ${tag}`} className="opacity-60 hover:opacity-100">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder={tags.length ? "Add tag" : "Add tags, e.g. dad, summer"}
        aria-label="Add a tag"
        className="min-w-[8rem] flex-1 bg-transparent text-xs text-amber-100/80 outline-none placeholder:text-amber-100/25"
      />
    </div>
  );
};

export const PoemReader = ({ poem, isAdmin, startEditing, prompt, onClose, onPrevious, onNext }: PoemReaderProps) => {
  const { updatePoem, deletePoem } = usePoemStore();
  const [isEditing, setIsEditing] = useState(isAdmin && startEditing);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const hasContent = poem.content.trim() !== "";
  const showTypewriter = !isEditing && hasContent;

  const title = useTypewriter(poem.title, 90, showTypewriter);
  const body = useTypewriter(poem.content, 40, showTypewriter && title.done);
  const revealed = title.done && body.done;

  useEffect(() => {
    if (isEditing) window.setTimeout(() => contentRef.current?.focus(), 80);
  }, [isEditing]);

  const skipAll = useCallback(() => {
    title.skip();
    body.skip();
  }, [title, body]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (isEditing) return;
      if (e.key === "Enter" && !revealed) {
        e.preventDefault();
        skipAll();
      }
      if (e.key === "ArrowLeft" && onPrevious) onPrevious();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isEditing, revealed, skipAll, onClose, onPrevious, onNext]);

  const onDelete = () => {
    if (window.confirm(`Remove "${poem.title.trim() || "this poem"}" from your shelf? It stays in your backups.`)) {
      deletePoem(poem.id);
      onClose();
    }
  };

  const onCopy = () => {
    copyText(poemToText(poem))
      .then(() => toast.success("Poem copied. Paste it anywhere to share."))
      .catch(() => toast.error("Couldn't copy the poem. Please try again."));
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={poem.title.trim() || "Poem"}
    >
      <div className="pointer-events-none absolute inset-0 animate-fade-in bg-black/80 backdrop-blur-lg" />

      {onPrevious && (
        <button type="button" onClick={onPrevious} className={cn(iconButton, "absolute left-2 z-20 bg-white/10 text-amber-100 sm:left-6")} aria-label="Previous poem">
          <ChevronLeft size={18} />
        </button>
      )}
      {onNext && (
        <button type="button" onClick={onNext} className={cn(iconButton, "absolute right-2 z-20 bg-white/10 text-amber-100 sm:right-6")} aria-label="Next poem">
          <ChevronRight size={18} />
        </button>
      )}

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-xl animate-typewriter-roll flex-col">
        <div className="absolute -right-4 -top-4 z-20 flex gap-2">
          {isAdmin && !isEditing && (
            <button type="button" onClick={() => setIsEditing(true)} className={cn(iconButton, "bg-amber-600 text-amber-50")} aria-label="Edit poem">
              <Pencil size={14} />
            </button>
          )}
          <button type="button" onClick={onCopy} className={cn(iconButton, "border border-amber-300/40 bg-stone-900 text-amber-100")} aria-label="Copy poem">
            <Copy size={14} />
          </button>
          <button type="button" onClick={onClose} className={cn(iconButton, "brass-plate text-stone-900")} aria-label="Close poem">
            <X size={16} />
          </button>
        </div>

        {isAdmin && (
          <button type="button" onClick={onDelete} className={cn(iconButton, "absolute -left-4 -top-4 z-20 bg-destructive text-destructive-foreground")} aria-label="Delete poem">
            <Trash2 size={14} />
          </button>
        )}

        <div className="relative flex min-h-0 flex-col overflow-hidden rounded-md bg-[hsl(30,10%,8%)] shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[hsl(38,55%,50%)] to-transparent" />

          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-10 sm:px-14 sm:py-14">
            {isEditing ? (
              <>
                {prompt && (
                  <p className="mb-6 rounded-md border border-amber-400/25 bg-amber-400/10 px-4 py-3 font-body text-sm italic text-amber-100/85">
                    {prompt}
                  </p>
                )}
                <input
                  value={poem.title}
                  onChange={(e) => updatePoem(poem.id, { title: e.target.value.slice(0, 200) })}
                  className="mb-6 w-full border-none bg-transparent font-display text-2xl font-bold tracking-[0.04em] text-[hsl(38,55%,70%)] outline-none placeholder:text-amber-200/30 sm:text-3xl"
                  placeholder="Title"
                  aria-label="Poem title"
                />
                <div className="mb-6 space-y-3 border-y border-amber-200/10 py-4">
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Mood">
                    {moods.map((mood: Mood) => (
                      <button
                        key={mood}
                        type="button"
                        role="radio"
                        aria-checked={poem.mood === mood}
                        onClick={() => updatePoem(poem.id, { mood: poem.mood === mood ? null : mood })}
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-xs transition",
                          poem.mood === mood
                            ? "border-amber-400 bg-amber-400/20 text-amber-100"
                            : "border-amber-200/15 text-amber-100/50 hover:text-amber-100/80",
                        )}
                      >
                        {moodLabels[mood]}
                      </button>
                    ))}
                  </div>
                  <TagEditor tags={poem.tags} onChange={(tags) => updatePoem(poem.id, { tags })} />
                </div>
                <textarea
                  ref={contentRef}
                  value={poem.content}
                  onChange={(e) => updatePoem(poem.id, { content: e.target.value.slice(0, 20000) })}
                  className="min-h-[280px] w-full resize-none border-none bg-transparent font-body text-base leading-[2] tracking-[0.01em] text-[hsl(34,30%,75%)] outline-none placeholder:text-amber-100/20 sm:text-lg"
                  placeholder="Write your poem here…"
                  aria-label="Poem"
                />
                {hasContent && (
                  <button type="button" onClick={() => setIsEditing(false)} className="mt-4 text-xs text-amber-200/50 hover:text-amber-200/90">
                    Done editing
                  </button>
                )}
              </>
            ) : (
              <div
                onClick={() => {
                  if (!revealed) skipAll();
                }}
                className="min-h-[300px] cursor-default"
              >
                <h2 className="mb-6 font-display text-2xl font-bold tracking-[0.04em] text-[hsl(38,55%,70%)] [text-shadow:0_0_20px_hsl(38_55%_50%/0.2)] sm:text-4xl">
                  {title.displayed}
                  {!title.done && <span className="ml-1 inline-block h-7 w-[3px] animate-blink rounded-sm bg-[hsl(38,55%,60%)] align-middle sm:h-9" />}
                </h2>

                {title.done && (poem.mood || poem.tags.length > 0) && (
                  <div className="mb-6 flex animate-fade-in flex-wrap gap-2 text-xs text-amber-200/50">
                    {poem.mood && <span className="rounded-full border border-amber-200/20 px-2 py-0.5">{moodLabels[poem.mood]}</span>}
                    {poem.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                )}

                {title.done && (
                  <div className="mb-8 flex animate-fade-in items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-600/40 to-transparent" />
                    <span className="text-xs text-amber-600/50">✦</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-amber-600/40 to-transparent" />
                  </div>
                )}

                {title.done && (
                  <div className="whitespace-pre-wrap font-body text-base leading-[2.2] tracking-[0.01em] text-[hsl(34,20%,65%)] sm:text-lg">
                    {body.done ? poem.content : body.displayed}
                    {!body.done && <span className="ml-0.5 inline-block h-4 w-[2px] animate-blink rounded-sm bg-[hsl(38,55%,60%)] align-middle sm:h-5" />}
                  </div>
                )}

                {revealed && (
                  <p className="mt-12 animate-fade-in text-right font-['Dancing_Script',cursive] text-2xl tracking-[0.02em] text-[hsl(38,55%,55%)] sm:text-3xl">— JK</p>
                )}
                {!revealed && <p className="mt-10 text-center text-xs text-amber-100/25">Tap or press Enter to reveal the whole poem</p>}
              </div>
            )}
          </div>

          <div className="h-[2px] bg-gradient-to-r from-transparent via-[hsl(38,55%,50%)] to-transparent" />
        </div>
      </div>
    </div>,
    document.body,
  );
};
