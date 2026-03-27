import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Poem } from "@/data/poems";
import { X } from "lucide-react";

interface PoemBookProps {
  poem: Poem;
  index: number;
}

export const PoemBook = ({ poem, index }: PoemBookProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const colorClasses = {
    pink: {
      spine: "bg-book-pink",
      cover: "bg-book-pink-light border-book-pink",
      text: "text-primary",
    },
    green: {
      spine: "bg-book-green",
      cover: "bg-book-green-light border-book-green",
      text: "text-secondary",
    },
  };

  const colors = colorClasses[poem.color];

  return (
    <>
      {/* Book on shelf */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "book-spine group relative flex flex-col items-center justify-end",
          "rounded-t-sm rounded-b-md shadow-md",
          "w-16 sm:w-20 md:w-24",
          colors.spine,
        )}
        style={{
          height: `${160 + (index % 3) * 30}px`,
          animationDelay: `${index * 0.15}s`,
        }}
        aria-label={`Open poem: ${poem.title}`}
      >
        {/* Spine edge highlight */}
        <div className="absolute left-0 top-0 h-full w-1.5 rounded-tl-sm rounded-bl-md bg-foreground/10" />

        {/* Title on spine */}
        <span
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "writing-mode-vertical font-display text-xs sm:text-sm font-semibold",
            "text-primary-foreground opacity-90 whitespace-nowrap",
            "rotate-180",
          )}
          style={{ writingMode: "vertical-rl" }}
        >
          {poem.title}
        </span>

        {/* Hover indicator */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary-foreground opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
      </button>

      {/* Open poem overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in" />

          {/* Poem card */}
          <div
            className={cn(
              "relative z-10 max-w-md w-full p-8 sm:p-10 rounded-lg border-2 shadow-xl animate-scale-in",
              colors.cover,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
              aria-label="Close poem"
            >
              <X size={20} />
            </button>

            <h2 className={cn("font-display text-2xl sm:text-3xl font-bold mb-6", colors.text)}>
              {poem.title}
            </h2>

            <div className="space-y-1">
              {poem.lines.map((line, i) => (
                <p
                  key={i}
                  className={cn(
                    "font-body text-sm sm:text-base leading-relaxed text-foreground/80",
                    line === "" && "h-4",
                  )}
                  style={{
                    opacity: 0,
                    animation: `fade-in 0.4s ease-out ${i * 0.06}s forwards`,
                  }}
                >
                  {line || "\u00A0"}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
