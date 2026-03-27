import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { Poem } from "@/data/poems";
import { usePoemStore } from "@/stores/poem-store";

interface PoemBookProps {
  poem: Poem;
  index: number;
}

// Deterministic pseudo-random from index for consistent sizing
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

// Bookmark colors for completed poems
const bookmarkColors = [
  "bg-red-500",
  "bg-amber-400",
  "bg-emerald-500",
  "bg-sky-400",
  "bg-violet-500",
  "bg-rose-400",
  "bg-teal-400",
  "bg-orange-400",
  "bg-pink-500",
  "bg-indigo-400",
];

// Spine color palettes - rich, varied book colors
const spineColors = [
  { bg: "hsl(345, 45%, 30%)", edge: "hsl(345, 40%, 22%)" },   // burgundy
  { bg: "hsl(152, 35%, 25%)", edge: "hsl(152, 30%, 18%)" },   // forest green
  { bg: "hsl(220, 40%, 28%)", edge: "hsl(220, 35%, 20%)" },   // navy
  { bg: "hsl(25, 50%, 25%)", edge: "hsl(25, 45%, 18%)" },     // leather brown
  { bg: "hsl(280, 30%, 28%)", edge: "hsl(280, 25%, 20%)" },   // plum
  { bg: "hsl(35, 55%, 30%)", edge: "hsl(35, 50%, 22%)" },     // caramel
  { bg: "hsl(0, 0%, 22%)", edge: "hsl(0, 0%, 15%)" },         // charcoal
  { bg: "hsl(200, 35%, 28%)", edge: "hsl(200, 30%, 20%)" },   // steel blue
  { bg: "hsl(15, 50%, 28%)", edge: "hsl(15, 45%, 20%)" },     // rust
  { bg: "hsl(45, 40%, 30%)", edge: "hsl(45, 35%, 22%)" },     // olive gold
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
  const height = 120 + seededRandom(index + 1) * 60; // 120-180px
  const width = 38 + seededRandom(index + 50) * 20;  // 38-58px
  const colorIdx = index % spineColors.length;
  const spine = spineColors[colorIdx];
  const bookmarkColor = bookmarkColors[index % bookmarkColors.length];

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
        className="book-spine group relative flex flex-col items-center justify-end rounded-t-sm rounded-b-md shadow-lg"
        style={{
          height: `${height}px`,
          width: `${width}px`,
          backgroundColor: spine.bg,
        }}
        aria-label={`Open poem: ${poem.title}`}
      >
        {/* Spine left edge highlight */}
        <div
          className="absolute left-0 top-0 h-full w-1.5 rounded-tl-sm rounded-bl-md"
          style={{ backgroundColor: spine.edge }}
        />

        {/* Gold line accents */}
        <div className="absolute left-2 right-2 top-3 h-px bg-clock-trim/30" />
        <div className="absolute left-2 right-2 top-5 h-px bg-clock-trim/20" />
        <div className="absolute left-2 right-2 bottom-6 h-px bg-clock-trim/30" />
        <div className="absolute left-2 right-2 bottom-8 h-px bg-clock-trim/20" />

        {/* Title on spine — prominent */}
        <span
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "font-display text-[9px] sm:text-[11px] font-bold",
            "text-white/90 whitespace-nowrap drop-shadow-sm",
            "rotate-180",
            !hasContent && "italic text-white/40 text-[8px] sm:text-[9px]",
          )}
          style={{ writingMode: "vertical-rl" }}
        >
          {poem.title}
        </span>

        {/* Bookmark for completed poems */}
        {hasContent && (
          <div
            className={cn(
              "absolute -top-3 right-1.5 w-2.5 h-7 rounded-b-sm shadow-sm",
              bookmarkColor,
            )}
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
            }}
          />
        )}

        {/* Hover glow */}
        <div className="absolute inset-0 rounded-t-sm rounded-b-md bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
      </button>

      {/* Open poem overlay */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onDoubleClick={handleClose}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in pointer-events-none" />

          <div className="relative z-10 max-w-lg w-full origin-center animate-paper-unfold">
            <div className="absolute -bottom-2 left-4 right-4 h-4 bg-foreground/10 rounded-b-lg blur-md" />

            <div className="relative bg-book-paper border border-book-paper-edge rounded-sm shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-book-paper-edge via-book-paper to-book-paper-edge" />

              <div className="flex items-center justify-center gap-2 pt-8 pb-2 px-8">
                <div className="h-px flex-1 bg-book-paper-line" />
                <div className="w-2 h-2 rotate-45 border border-book-paper-line" />
                <div className="h-px flex-1 bg-book-paper-line" />
              </div>

              <div className="px-8 sm:px-12 pb-8 opacity-0 animate-paper-content">
                <p className="text-right text-[10px] text-muted-foreground/60 mb-4 font-body select-none">
                  double-click to close
                </p>

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
