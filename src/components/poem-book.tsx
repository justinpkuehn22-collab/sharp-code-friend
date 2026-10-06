import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { Poem } from "@/data/poems";
import { usePoemStore } from "@/stores/poem-store";
import { X, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { copyText, poemToText } from "@/lib/poem-clipboard";

interface PoemBookProps {
  poem: Poem;
  index: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const bookmarkColors = ["bg-primary", "bg-secondary"];

// Typewriter effect hook — with skip support
const useTypewriter = (text: string, speed = 30, active = false) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const skipRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const skip = useCallback(() => {
    skipRef.current = true;
    setDisplayed(text);
    setDone(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [text]);

  useEffect(() => {
    skipRef.current = false;
    if (!active) {
      setDisplayed("");
      setDone(false);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const tick = () => {
      if (skipRef.current) return;
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      const char = text[i - 1];
      let delay = speed;
      if (char === "\n") delay = speed * 6;
      else if (char === "." || char === "—" || char === "…") delay = speed * 4;
      else if (char === ",") delay = speed * 2.5;
      timerRef.current = window.setTimeout(tick, delay);
    };
    timerRef.current = window.setTimeout(tick, speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, speed, active]);

  return { displayed, done, skip };
};

// Rhyme scheme colors — pink & green palette to match bookmarks
const rhymeColors = [
  "hsl(345, 50%, 65%)",  // pink
  "hsl(152, 40%, 55%)",  // green
  "hsl(330, 45%, 72%)",  // soft rose
  "hsl(165, 38%, 50%)",  // teal
  "hsl(350, 55%, 58%)",  // hot pink
  "hsl(140, 35%, 60%)",  // mint
  "hsl(10, 50%, 65%)",   // coral
  "hsl(180, 30%, 55%)",  // cyan-green
];

// Get the phonetic ending of a word (last 2-3 chars for simple rhyme matching)
const getEnding = (word: string): string => {
  const clean = word.replace(/[.,;:!?—"''""]/g, "").toLowerCase();
  if (clean.length <= 2) return clean;
  // Use last 3 chars, or 2 for short words
  return clean.length <= 4 ? clean.slice(-2) : clean.slice(-3);
};

// Group line-ending words by rhyme (similar endings)
const getRhymeScheme = (text: string): Map<number, number> => {
  const lines = text.split("\n");
  const lineEndings: { lineIdx: number; ending: string; word: string }[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const words = trimmed.split(/\s+/);
    const lastWord = words[words.length - 1];
    if (lastWord) {
      lineEndings.push({ lineIdx: i, ending: getEnding(lastWord), word: lastWord });
    }
  });

  // Group by similar endings
  const groups: string[][] = [];
  const lineToGroup = new Map<number, number>();

  for (const entry of lineEndings) {
    let foundGroup = -1;
    for (let g = 0; g < groups.length; g++) {
      // Check if this ending rhymes with any in the group
      if (groups[g].some((e) => {
        if (e === entry.ending) return true;
        // Match if last 2 chars are the same
        const a = e.slice(-2);
        const b = entry.ending.slice(-2);
        return a.length >= 2 && a === b;
      })) {
        foundGroup = g;
        break;
      }
    }
    if (foundGroup >= 0) {
      groups[foundGroup].push(entry.ending);
      lineToGroup.set(entry.lineIdx, foundGroup);
    } else {
      groups.push([entry.ending]);
      lineToGroup.set(entry.lineIdx, groups.length - 1);
    }
  }

  // Only color groups with 2+ members (actual rhymes)
  const result = new Map<number, number>();
  const groupCounts = new Map<number, number>();
  for (const [, g] of lineToGroup) {
    groupCounts.set(g, (groupCounts.get(g) || 0) + 1);
  }
  for (const [line, g] of lineToGroup) {
    if ((groupCounts.get(g) || 0) >= 2) {
      result.set(line, g);
    }
  }
  return result;
};

// Render text with rhyme-scheme colored end words
const HighlightedPoem = ({ text }: { text: string }) => {
  const rhymeScheme = useMemo(() => getRhymeScheme(text), [text]);

  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => {
        if (line.trim() === "") return <br key={li} />;
        const words = line.split(/(\s+)/);
        let lastWordIdx = -1;
        for (let j = words.length - 1; j >= 0; j--) {
          if (words[j].trim().length > 0) {
            lastWordIdx = j;
            break;
          }
        }
        const rhymeGroup = rhymeScheme.get(li);
        return (
          <span key={li}>
            {words.map((word, wi) => {
              const isEndWord = wi === lastWordIdx && rhymeGroup !== undefined;
              if (isEndWord) {
                const color = rhymeColors[rhymeGroup! % rhymeColors.length];
                return (
                  <span
                    key={wi}
                    className="font-semibold transition-colors duration-300"
                    style={{
                      color,
                      textShadow: `0 0 14px ${color}40`,
                    }}
                  >
                    {word}
                  </span>
                );
              }
              return <span key={wi}>{word}</span>;
            })}
            {li < lines.length - 1 && "\n"}
          </span>
        );
      })}
    </>
  );
};

export const PoemBook = ({ poem, index }: PoemBookProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(poem.title);
  const [editContent, setEditContent] = useState(poem.content);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { updatePoem, deletePoem } = usePoemStore();

  const handleDelete = () => {
    if (window.confirm(`Remove "${poem.title}" from your shelf?`)) {
      setIsOpen(false);
      deletePoem(poem.id);
    }
  };

  const hasContent = poem.content.trim() !== "";

  // Slower typewriter
  const titleTypewriter = useTypewriter(poem.title, 120, isOpen && !isEditing && hasContent);
  const contentTypewriter = useTypewriter(poem.content, 55, isOpen && !isEditing && hasContent && titleTypewriter.done);

  const skipAll = useCallback(() => {
    titleTypewriter.skip();
    contentTypewriter.skip();
  }, [titleTypewriter, contentTypewriter]);

  // Enter key to skip typewriter
  useEffect(() => {
    if (!isOpen || isEditing) return;
    if (titleTypewriter.done && contentTypewriter.done) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        skipAll();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, isEditing, titleTypewriter.done, contentTypewriter.done, skipAll]);

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
        <div
          className="absolute left-0 top-0 h-full w-1.5 rounded-tl-sm rounded-bl-md"
          style={{ backgroundColor: "hsl(28, 10%, 18%)" }}
        />
        <div
          className="absolute right-0 top-0 h-full w-[1px]"
          style={{ backgroundColor: "hsl(28, 8%, 8%)" }}
        />

        <div className="absolute left-2 right-2 top-3 h-px bg-clock-trim/25" />
        <div className="absolute left-3 right-3 top-[18px] h-px bg-clock-trim/15" />
        <div className="absolute left-2 right-2 bottom-6 h-px bg-clock-trim/25" />
        <div className="absolute left-3 right-3 bottom-[30px] h-px bg-clock-trim/15" />

        <div
          className="absolute inset-0 rounded-t-sm rounded-b-md opacity-20 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 3px)`,
          }}
        />

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

        <div className="absolute inset-0 rounded-t-sm rounded-b-md bg-white/0 group-hover:bg-white/[0.07] transition-colors duration-500" />
      </button>

      {/* Poem reading overlay — clean, dramatic, elegant */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-lg animate-fade-in pointer-events-none" />

          <div className="relative z-10 max-w-xl w-full max-h-[85vh] flex flex-col animate-typewriter-roll">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute -top-4 -right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
              aria-label="Close poem"
            >
              <X size={16} />
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="absolute -top-4 -left-4 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 bg-destructive text-destructive-foreground"
              aria-label="Delete poem"
            >
              <Trash2 size={14} />
            </button>

            {/* Copy */}
            <button
              onClick={() => {
                const current = usePoemStore.getState().poems.find((p) => p.id === poem.id) ?? poem;
                copyText(poemToText(current))
                  .then(() => toast.success("Poem copied. Paste it anywhere to share."))
                  .catch(() => toast.error("Couldn't copy the poem. Please try again."));
              }}
              className="absolute -top-4 right-8 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 bg-secondary text-secondary-foreground"
              aria-label="Copy poem"
            >
              <Copy size={14} />
            </button>

            {/* Elegant dark paper */}
            <div
              className="relative rounded-md overflow-hidden flex flex-col min-h-0"
              style={{
                backgroundColor: "hsl(30, 10%, 8%)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset",
              }}
            >
              {/* Top gold trim */}
              <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(38, 55%, 50%), transparent)" }} />

              {/* Content */}
              <div className="px-10 sm:px-14 py-10 sm:py-14 overflow-y-auto flex-1 min-h-0">
                {isEditing ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full font-display text-2xl sm:text-3xl font-bold bg-transparent border-none outline-none mb-8 placeholder:opacity-30"
                      placeholder="Title"
                      style={{ color: "hsl(38, 55%, 70%)", letterSpacing: "0.04em" }}
                    />
                    <textarea
                      ref={contentRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[240px] font-body text-base sm:text-lg leading-[2] bg-transparent border-none outline-none resize-none placeholder:opacity-20"
                      placeholder="Write your poem here..."
                      style={{ color: "hsl(34, 30%, 75%)", letterSpacing: "0.01em" }}
                    />
                  </>
                ) : (
                  <div
                    onClick={() => {
                      if (titleTypewriter.done && contentTypewriter.done) {
                        handleStartEditing();
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (!titleTypewriter.done || !contentTypewriter.done) {
                        skipAll();
                      }
                    }}
                    className="cursor-text min-h-[300px]"
                  >
                    {/* Title — typewriter */}
                    <h2
                      className="font-display text-2xl sm:text-4xl font-bold mb-8"
                      style={{
                        color: "hsl(38, 55%, 70%)",
                        letterSpacing: "0.04em",
                        textShadow: "0 0 20px hsl(38, 55%, 50%, 0.2)",
                      }}
                    >
                      {titleTypewriter.displayed}
                      {!titleTypewriter.done && (
                        <span
                          className="inline-block w-[3px] h-7 sm:h-9 ml-1 animate-blink align-middle rounded-sm"
                          style={{ backgroundColor: "hsl(38, 55%, 60%)" }}
                        />
                      )}
                    </h2>

                    {/* Divider after title */}
                    {titleTypewriter.done && (
                      <div className="flex items-center gap-3 mb-8 animate-fade-in">
                        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, hsl(38,55%,50%,0.4), transparent)" }} />
                        <span style={{ color: "hsl(38, 55%, 50%, 0.5)" }} className="text-xs">✦</span>
                        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, hsl(38,55%,50%,0.4))" }} />
                      </div>
                    )}

                    {/* Content — typewriter with highlighted end words */}
                    {titleTypewriter.done && (
                      <div
                        className="font-body text-base sm:text-lg leading-[2.2] whitespace-pre-wrap"
                        style={{
                          color: "hsl(34, 20%, 65%)",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {contentTypewriter.done ? (
                          poem.content
                        ) : (
                          <>
                            {contentTypewriter.displayed}
                            <span
                              className="inline-block w-[2px] h-4 sm:h-5 ml-0.5 animate-blink align-middle rounded-sm"
                              style={{ backgroundColor: "hsl(38, 55%, 60%)" }}
                            />
                          </>
                        )}
                      </div>
                    )}

                    {/* Signature + edit hint */}
                    {contentTypewriter.done && (
                      <div className="mt-12 animate-fade-in">
                        {/* JK Signature */}
                        <p
                          className="text-right text-2xl sm:text-3xl"
                          style={{
                            fontFamily: "'Dancing Script', cursive",
                            color: "hsl(38, 55%, 55%)",
                            textShadow: "0 0 10px hsl(38, 55%, 50%, 0.15)",
                            letterSpacing: "0.02em",
                          }}
                        >
                          — JK
                        </p>
                        <p className="mt-6 text-center text-xs" style={{ color: "hsl(34, 20%, 35%)" }}>
                          tap to edit
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom gold trim */}
              <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(38, 55%, 50%), transparent)" }} />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
