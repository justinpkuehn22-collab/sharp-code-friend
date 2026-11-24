import { forwardRef, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { analyzeRhymes, rhymeSchemeText, splitEnding } from "@/lib/rhyme";
import { colorIndexForLetter, rhymeMarkColors } from "@/lib/rhyme-colors";
import { cn } from "@/lib/utils";

interface RhymeTextareaProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  highlight: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
}

// The poem's text box, with the rhyming line endings lit up behind the words as you write.
// A copy of the text sits underneath with the same font and wrapping; only its
// highlights show, so the caret and the typing stay native.
export const RhymeTextarea = forwardRef<HTMLTextAreaElement, RhymeTextareaProps>(
  ({ value, onChange, onKeyDown, highlight, className, placeholder, ...rest }, ref) => {
    const inner = useRef<HTMLTextAreaElement | null>(null);
    // Rhyme analysis waits for a pause in typing, so keys never lag behind it
    const settled = useDeferredValue(value);
    const rhymes = useMemo(() => (highlight ? analyzeRhymes(settled) : []), [highlight, settled]);
    const scheme = useMemo(() => (highlight ? rhymeSchemeText(settled) : ""), [highlight, settled]);
    const lines = value.split("\n");
    const settledLines = settled.split("\n");

    // Grow with the poem so the page scrolls, not the box, and the highlights stay aligned
    const fit = () => {
      const el = inner.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };
    useLayoutEffect(fit, [value]);
    // Re-fit when the box changes width (rotating a phone, opening the desk)
    useEffect(() => {
      const el = inner.current;
      if (!el || typeof ResizeObserver === "undefined") return;
      let width = el.offsetWidth;
      const observer = new ResizeObserver(() => {
        if (el.offsetWidth !== width) {
          width = el.offsetWidth;
          fit();
        }
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    const text = "whitespace-pre-wrap break-words [overflow-wrap:anywhere]";
    return (
      <div>
        <div className="relative">
          {highlight && (
            <div aria-hidden="true" className={cn(className, text, "pointer-events-none absolute inset-0 select-none text-transparent")}>
              {lines.map((line, i) => {
                const r = rhymes[i];
                const last = i === lines.length - 1 ? "" : "\n";
                // A line still being typed waits until the analysis catches up with it
                if (!r?.kind || !r.letter || settledLines[i] !== line) return <span key={i}>{line + last}</span>;
                const { head, end, tail } = splitEnding(line);
                return (
                  <span key={i}>
                    {head}
                    <mark
                      className={cn(
                        "rounded-sm text-transparent",
                        rhymeMarkColors[colorIndexForLetter(r.letter)],
                        (r.kind === "slant" || r.kind === "consonance") && "bg-transparent underline decoration-2 underline-offset-[6px]",
                        r.kind === "consonance" && "decoration-dotted",
                        r.kind === "slant" && "decoration-dashed",
                      )}
                    >
                      {end}
                    </mark>
                    {tail + last}
                  </span>
                );
              })}
              {/* The textarea keeps room for a trailing empty line */}
              {"​"}
            </div>
          )}
          <textarea
            ref={(el) => {
              inner.current = el;
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
            }}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            rows={8}
            spellCheck
            className={cn(className, text, "relative block overflow-hidden bg-transparent")}
            placeholder={placeholder}
            {...rest}
          />
        </div>
        {highlight && scheme.replace(/\s/g, "").length > 1 && (
          <p className="mt-3 text-[11px] tracking-[0.2em] text-amber-100/40">
            <span className="uppercase">Rhyme scheme</span> <span className="font-semibold text-amber-200/70">{scheme}</span>
          </p>
        )}
      </div>
    );
  },
);
RhymeTextarea.displayName = "RhymeTextarea";
