import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Poem } from "@/data/poems";
import { usePoemStore } from "@/stores/poem-store";
import { X, Pen } from "lucide-react";

interface PoemBookProps {
  poem: Poem;
  index: number;
}

export const PoemBook = ({ poem, index }: PoemBookProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(poem.title);
  const [editContent, setEditContent] = useState(poem.content);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { updatePoem } = usePoemStore();

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    updatePoem(poem.id, { title: editTitle, content: editContent });
    setIsEditing(false);
  };

  const handleOpen = () => {
    setEditTitle(poem.title);
    setEditContent(poem.content);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isEditing) {
      handleSave();
    }
    setIsOpen(false);
    setIsEditing(false);
  };

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

      {/* Open poem overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in" />

          {/* Paper document */}
          <div
            className={cn(
              "relative z-10 max-w-lg w-full animate-scale-in",
              "flex flex-col",
            )}
            onClick={(e) => e.stopPropagation()}
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
                {/* Close & edit buttons */}
                <div className="flex justify-end gap-2 mb-4">
                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleSave();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      isEditing
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label={isEditing ? "Save poem" : "Edit poem"}
                  >
                    <Pen size={14} />
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close poem"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Title */}
                {isEditing ? (
                  <input
                    ref={titleRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full font-display text-2xl sm:text-3xl font-bold text-foreground bg-transparent border-b border-dashed border-book-paper-line outline-none mb-6 pb-1"
                    placeholder="Title"
                  />
                ) : (
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">
                    {poem.title}
                  </h2>
                )}

                {/* Poem content */}
                {isEditing ? (
                  <textarea
                    ref={contentRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[200px] font-body text-sm sm:text-base leading-relaxed text-foreground/80 bg-transparent border-none outline-none resize-none"
                    placeholder="Write your poem here..."
                  />
                ) : (
                  <div className="space-y-1 min-h-[120px]">
                    {isEmpty ? (
                      <p className="font-body text-sm italic text-muted-foreground">
                        Click the pen to start writing...
                      </p>
                    ) : (
                      poem.content.split("\n").map((line, i) => (
                        <p
                          key={i}
                          className={cn(
                            "font-body text-sm sm:text-base leading-relaxed text-foreground/80",
                            line === "" && "h-4",
                          )}
                          style={{
                            opacity: 0,
                            animation: `fade-in 0.4s ease-out ${i * 0.05}s forwards`,
                          }}
                        >
                          {line || "\u00A0"}
                        </p>
                      ))
                    )}
                  </div>
                )}
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
