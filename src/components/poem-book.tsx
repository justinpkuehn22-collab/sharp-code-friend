import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { Poem } from "@/data/poems";
import { usePoemStore } from "@/stores/poem-store";

interface PoemBookProps {
  poem: Poem;
  index: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const bookmarkColors = [
  "bg-primary",      // pink
  "bg-secondary",    // green
];

export const PoemBook = ({ poem, index }: PoemBookProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(poem.title);
  const [editContent, setEditContent] = useState(poem.content);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { updatePoem } = usePoemStore();

  const handleSave = useCallback(() => {
    updatePoem(poem.id, { title: editTitle, content: editContent });
  }, [poem.id, editTitle, editContent, updatePoem]);

  const handleOpen = () => {
    setEditTitle(poem.title);
    setEditContent(poem.content);
    setIsOpen(true);
  };

  const handleClose = useCallback(() => {
    handleSave();
    setIsOpen(false);
  }, [handleSave]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      updatePoem(poem.id, { title: editTitle, content: editContent });
    }, 500);
    return () => clearTimeout(timeout);
  }, [editTitle, editContent, isOpen, poem.id, updatePoem]);

  const hasContent = poem.content.trim() !== "";
  const height = 120 + seededRandom(index + 1) * 60;
  const width = 38 + seededRandom(index + 50) * 18;
  const bookmarkColor = bookmarkColors[index % 2];

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
        className={cn(
          "group relative flex flex-col items-center justify-end",
          "rounded-t-sm rounded-b-md",
          "shadow-lg transition-all duration-300 ease-out cursor-pointer",
          "hover:-translate-y-4 hover:scale-110 hover:z-10 hover:shadow-2xl",
        )}
        style={{
          height: `${height}px`,
          width: `${width}px`,
          backgroundColor: "hsl(28, 12%, 12%)",
        }}
        aria-label={`Open poem: ${poem.title}`}
      >
        {/* Leather spine left edge — subtle lighter strip */}
        <div
          className="absolute left-0 top-0 h-full w-1.5 rounded-tl-sm rounded-bl-md"
          style={{ backgroundColor: "hsl(28, 10%, 18%)" }}
        />
        {/* Right edge — darker */}
        <div
          className="absolute right-0 top-0 h-full w-[1px]"
          style={{ backgroundColor: "hsl(28, 8%, 8%)" }}
        />

        {/* Embossed horizontal lines — gold foil look */}
        <div className="absolute left-2 right-2 top-3 h-px bg-clock-trim/25" />
        <div className="absolute left-3 right-3 top-[18px] h-px bg-clock-trim/15" />
        <div className="absolute left-2 right-2 bottom-6 h-px bg-clock-trim/25" />
        <div className="absolute left-3 right-3 bottom-[30px] h-px bg-clock-trim/15" />

        {/* Subtle leather texture overlay */}
        <div
          className="absolute inset-0 rounded-t-sm rounded-b-md opacity-20 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 3px
            )`,
          }}
        />

        {/* Title on spine */}
        <span
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "font-display text-[9px] sm:text-[10px] font-bold",
            "text-clock-trim/70 whitespace-nowrap",
            "rotate-180",
            "transition-all duration-300",
            "group-hover:text-clock-trim group-hover:text-[11px] sm:group-hover:text-[13px] group-hover:drop-shadow-[0_0_6px_rgba(200,170,100,0.5)]",
            !hasContent && "italic text-clock-trim/30 text-[8px]",
          )}
          style={{ writingMode: "vertical-rl" }}
        >
          {poem.title}
        </span>

        {/* Bookmark for completed poems */}
        {hasContent && (
          <div
            className={cn(
              "absolute -top-3 right-1.5 w-2.5 h-8 rounded-b-sm shadow-md z-10",
              bookmarkColor,
            )}
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)",
            }}
          />
        )}

        {/* Hover glow */}
        <div className="absolute inset-0 rounded-t-sm rounded-b-md bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
      </button>

      {/* Open poem overlay */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in pointer-events-none" />

          <div className="relative z-10 max-w-lg w-full origin-center animate-paper-unfold">
            <div className="absolute -bottom-2 left-4 right-4 h-4 bg-foreground/10 rounded-b-lg blur-md" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-foreground/80 text-background flex items-center justify-center shadow-lg hover:bg-foreground transition-colors duration-200 hover:scale-110 active:scale-95"
              aria-label="Close poem"
            >
              <X size={16} />
            </button>

            <div className="relative bg-book-paper border border-book-paper-edge rounded-sm shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-book-paper-edge via-book-paper to-book-paper-edge" />

              <div className="flex items-center justify-center gap-2 pt-8 pb-2 px-8">
                <div className="h-px flex-1 bg-book-paper-line" />
                <div className="w-2 h-2 rotate-45 border border-book-paper-line" />
                <div className="h-px flex-1 bg-book-paper-line" />
              </div>

              <div className="px-8 sm:px-12 pb-8 opacity-0 animate-paper-content">

                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full font-display text-2xl sm:text-3xl font-bold text-foreground bg-transparent border-none outline-none mb-6 placeholder:text-muted-foreground/40"
                  placeholder="Title"
                />

                <textarea
                  ref={contentRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[200px] font-body text-sm sm:text-base leading-relaxed text-foreground/80 bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40"
                  placeholder="Write your poem here..."
                />
              </div>

              <div className="flex items-center justify-center gap-2 pb-6 px-8">
                <div className="h-px flex-1 bg-book-paper-line" />
                <span className="text-book-paper-line text-xs">✦</span>
                <div className="h-px flex-1 bg-book-paper-line" />
              </div>

              <div className="h-1 bg-gradient-to-r from-book-paper-edge via-book-paper to-book-paper-edge" />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
