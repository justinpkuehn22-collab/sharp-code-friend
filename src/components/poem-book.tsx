import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { Poem } from "@/data/poems";
import { usePoemStore } from "@/stores/poem-store";
import { X } from "lucide-react";

interface PoemBookProps {
  poem: Poem;
  index: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const bookmarkColors = ["bg-primary", "bg-secondary"];

// Typewriter effect hook
const useTypewriter = (text: string, speed = 30, active = false) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      setDone(false);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, active]);

  return { displayed, done };
};

export const PoemBook = ({ poem, index }: PoemBookProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(poem.title);
  const [editContent, setEditContent] = useState(poem.content);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { updatePoem } = usePoemStore();

  const hasContent = poem.content.trim() !== "";

  // Typewriter for title and content on open
  const titleTypewriter = useTypewriter(poem.title, 60, isOpen && !isEditing && hasContent);
  const contentTypewriter = useTypewriter(poem.content, 18, isOpen && !isEditing && hasContent && titleTypewriter.done);

  const handleSave = useCallback(() => {
    updatePoem(poem.id, { title: editTitle, content: editContent });
  }, [poem.id, editTitle, editContent, updatePoem]);

  const handleOpen = () => {
    setEditTitle(poem.title);
    setEditContent(poem.content);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleClose = useCallback(() => {
    handleSave();
    setIsOpen(false);
    setIsEditing(false);
  }, [handleSave]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setTimeout(() => contentRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!hasContent) {
      setIsEditing(true);
      setTimeout(() => contentRef.current?.focus(), 400);
    }
  }, [isOpen, hasContent]);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      updatePoem(poem.id, { title: editTitle, content: editContent });
    }, 500);
    return () => clearTimeout(timeout);
  }, [editTitle, editContent, isOpen, poem.id, updatePoem]);

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
          "shadow-lg cursor-pointer",
          "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "hover:-translate-y-6 hover:scale-[1.25] hover:z-20",
          "hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]",
        )}
        style={{
          height: `${height}px`,
          width: `${width}px`,
          backgroundColor: "hsl(28, 12%, 12%)",
        }}
        aria-label={`Open poem: ${poem.title}`}
      >
        {/* Leather spine left edge */}
        <div
          className="absolute left-0 top-0 h-full w-1.5 rounded-tl-sm rounded-bl-md"
          style={{ backgroundColor: "hsl(28, 10%, 18%)" }}
        />
        <div
          className="absolute right-0 top-0 h-full w-[1px]"
          style={{ backgroundColor: "hsl(28, 8%, 8%)" }}
        />

        {/* Gold foil lines */}
        <div className="absolute left-2 right-2 top-3 h-px bg-clock-trim/25" />
        <div className="absolute left-3 right-3 top-[18px] h-px bg-clock-trim/15" />
        <div className="absolute left-2 right-2 bottom-6 h-px bg-clock-trim/25" />
        <div className="absolute left-3 right-3 bottom-[30px] h-px bg-clock-trim/15" />

        {/* Leather texture */}
        <div
          className="absolute inset-0 rounded-t-sm rounded-b-md opacity-20 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 3px)`,
          }}
        />

        {/* Title */}
        <span
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "font-display text-[9px] sm:text-[11px] font-bold",
            "text-white/90 whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]",
            "rotate-180",
            "transition-all duration-500",
            "group-hover:text-white group-hover:text-[12px] sm:group-hover:text-[14px]",
            "group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]",
            "group-hover:tracking-wider",
            !hasContent && "italic text-white/40 text-[8px]",
          )}
          style={{ writingMode: "vertical-rl" }}
        >
          {poem.title}
        </span>

        {/* Bookmark */}
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
        <div className="absolute inset-0 rounded-t-sm rounded-b-md bg-white/0 group-hover:bg-white/[0.07] transition-colors duration-500" />
      </button>

      {/* Typewriter-style poem overlay */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          role="dialog"
          aria-modal="true"
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in pointer-events-none" />

          {/* Typewriter paper */}
          <div className="relative z-10 max-w-lg w-full animate-typewriter-roll">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Close poem"
            >
              <X size={16} />
            </button>

            {/* Paper with typewriter aesthetic */}
            <div
              className="relative rounded shadow-2xl overflow-hidden"
              style={{
                backgroundColor: "hsl(42, 40%, 92%)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.1)",
              }}
            >
              {/* Typewriter roller bar */}
              <div
                className="h-3 flex items-center justify-between px-4"
                style={{
                  background: "linear-gradient(180deg, hsl(0,0%,30%), hsl(0,0%,20%), hsl(0,0%,25%))",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>

              {/* Red margin line */}
              <div className="absolute top-3 bottom-0 left-16 w-[1px] bg-red-400/30" />

              {/* Horizontal ruled lines background */}
              <div
                className="px-8 sm:px-12 pt-8 pb-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 27px,
                    hsl(210, 20%, 80%) 27px,
                    hsl(210, 20%, 80%) 28px
                  )`,
                  backgroundPosition: "0 12px",
                }}
              >
                {isEditing ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full font-mono text-xl sm:text-2xl font-bold text-black/90 bg-transparent border-none outline-none mb-6 placeholder:text-black/25"
                      placeholder="Title"
                      style={{ letterSpacing: "0.05em" }}
                    />
                    <textarea
                      ref={contentRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[220px] font-mono text-sm sm:text-base leading-[28px] text-black/75 bg-transparent border-none outline-none resize-none placeholder:text-black/25"
                      placeholder="Start typing your poem..."
                      style={{ letterSpacing: "0.02em" }}
                    />
                  </>
                ) : (
                  <div onClick={handleStartEditing} className="cursor-text min-h-[280px]">
                    {/* Typewriter title */}
                    <h2
                      className="font-mono text-xl sm:text-2xl font-bold text-black/90 mb-6"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      {titleTypewriter.displayed}
                      {!titleTypewriter.done && (
                        <span className="inline-block w-[2px] h-5 bg-black/70 ml-0.5 animate-blink align-middle" />
                      )}
                    </h2>

                    {/* Typewriter content */}
                    {titleTypewriter.done && (
                      <p
                        className="font-mono text-sm sm:text-base leading-[28px] text-black/70 whitespace-pre-wrap"
                        style={{ letterSpacing: "0.02em" }}
                      >
                        {contentTypewriter.displayed}
                        {!contentTypewriter.done && (
                          <span className="inline-block w-[2px] h-4 bg-black/70 ml-0.5 animate-blink align-middle" />
                        )}
                      </p>
                    )}

                    {/* Click to edit hint */}
                    {contentTypewriter.done && (
                      <p className="mt-6 text-xs text-black/30 font-mono animate-fade-in">
                        [ click anywhere to edit ]
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Paper tear / bottom edge */}
              <div
                className="h-2"
                style={{
                  background: "linear-gradient(180deg, hsl(42, 40%, 88%), hsl(42, 35%, 82%))",
                  boxShadow: "inset 0 1px 0 rgba(0,0,0,0.05)",
                }}
              />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
