import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Poem } from "@/data/poems";
import { usePoemStore } from "@/stores/poem-store";

interface PoemBookProps {
  poem: Poem;
  index: number;
}

export const PoemBook = ({ poem, index }: PoemBookProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(poem.title);
  const [editContent, setEditContent] = useState(poem.content);
  const titleRef = useRef<HTMLInputElement>(null);
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

  // Auto-save on changes
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      updatePoem(poem.id, { title: editTitle, content: editContent });
    }, 500);
    return () => clearTimeout(timeout);
  }, [editTitle, editContent, isOpen, poem.id, updatePoem]);

  const isEmpty = poem.content.trim() === "";

  return (
    <>
      {/* Book on shelf */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
        className={cn(
          "book-spine group relative flex flex-col items-center justify-end",
          "rounded-t-sm rounded-b-md shadow-md",
          "w-10 sm:w-12 md:w-14",
          "bg-book-spine",
        )}
        style={{
          height: `${140 + (index % 4) * 25}px`,
          animationDelay: `${index * 0.1}s`,
        }}
        aria-label={`Open poem: ${poem.title}`}
      >
        {/* Spine edge highlight */}
        <div className="absolute left-0 top-0 h-full w-1 rounded-tl-sm rounded-bl-md bg-book-spine-edge" />

        {/* Gold line details */}
        <div className="absolute left-2 right-2 top-3 h-px bg-primary/40" />
        <div className="absolute left-2 right-2 bottom-8 h-px bg-primary/40" />

        {/* Title on spine */}
        <span
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "font-display text-[9px] sm:text-[10px] font-semibold",
            "text-primary-foreground/80 whitespace-nowrap",
            "rotate-180",
            isEmpty && "italic text-primary-foreground/40",
          )}
          style={{ writingMode: "vertical-rl" }}
        >
          {poem.title}
        </span>

        {/* Hover glow */}
        <div className="absolute inset-0 rounded-t-sm rounded-b-md bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
      </button>

      {/* Open poem overlay — double-click backdrop or paper to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onDoubleClick={handleClose}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in pointer-events-none" />

          {/* Paper document */}
          <div
            className={cn(
              "relative z-10 max-w-lg w-full animate-scale-in",
              "flex flex-col",
            )}
          >
            {/* Paper curl / shadow effect */}
            <div className="absolute -bottom-2 left-4 right-4 h-4 bg-foreground/10 rounded-b-lg blur-md" />

            {/* Main paper */}
            <div className="relative bg-book-paper border border-book-paper-edge rounded-sm shadow-xl overflow-hidden">
              {/* Aged paper texture top border */}
              <div className="h-1 bg-gradient-to-r from-book-paper-edge via-book-paper to-book-paper-edge" />

              {/* Decorative header flourish */}
              <div className="flex items-center justify-center gap-2 pt-8 pb-2 px-8">
                <div className="h-px flex-1 bg-book-paper-line" />
                <div className="w-2 h-2 rotate-45 border border-book-paper-line" />
                <div className="h-px flex-1 bg-book-paper-line" />
              </div>

              {/* Content area */}
              <div className="px-8 sm:px-12 pb-8">
                {/* Hint */}
                <p className="text-right text-[10px] text-muted-foreground/60 mb-4 font-body select-none">
                  double-click to close
                </p>

                {/* Editable title */}
                <input
                  ref={titleRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full font-display text-2xl sm:text-3xl font-bold text-foreground bg-transparent border-none outline-none mb-6 placeholder:text-muted-foreground/40"
                  placeholder="Title"
                />

                {/* Editable content */}
                <textarea
                  ref={contentRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[200px] font-body text-sm sm:text-base leading-relaxed text-foreground/80 bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40"
                  placeholder="Write your poem here..."
                />
              </div>

              {/* Decorative footer flourish */}
              <div className="flex items-center justify-center gap-2 pb-6 px-8">
                <div className="h-px flex-1 bg-book-paper-line" />
                <span className="text-book-paper-line text-xs">✦</span>
                <div className="h-px flex-1 bg-book-paper-line" />
              </div>

              {/* Bottom aged edge */}
              <div className="h-1 bg-gradient-to-r from-book-paper-edge via-book-paper to-book-paper-edge" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
