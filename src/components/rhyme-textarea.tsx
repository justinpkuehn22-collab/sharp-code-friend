import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { analyzeRhymes, rhymeSchemeText, splitEnding } from "@/lib/rhyme";
import { colorIndexForLetter, rhymeMarkColors } from "@/lib/rhyme-colors";
import { cn } from "@/lib/utils";

interface RhymeTextareaProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  // Called with the poem each time a line is finished, for anything else that reads rhymes
  onSettle?: (text: string) => void;
  highlight: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
}

// A line counts as finished once it ends in punctuation (a comma, period, dash...)
export const lineIsFinished = (line: string) => /[,.;:!?…—–-]["'”’)]*\s*$/.test(line);

// The text with the line under the caret held back at how it last stood when finished,
// so rhymes only change once a line is done, not on every key
export const settleText = (value: string, caretLine: number, previous: string): string => {
  const lines = value.split("\n");
  const active = lines[caretLine];
  if (active === undefined || active.trim() === "" || lineIsFinished(active)) return value;
  const before = previous.split("\n");
  // Same line count: keep the earlier version of the line being typed
  if (before.length === lines.length) {
    lines[caretLine] = before[caretLine];
    return lines.join("\n");
  }
  // A line was added or removed: leave the unfinished line out until it's done
  lines[caretLine] = "";
  return lines.join("\n");
};

// The poem's text box, with the rhyming line endings lit up behind the words.
// A mirror of the text sits underneath with the same font and wrapping: it sets the
// box's height (so the page never shrinks and jumps while typing) and carries the
// highlights, while the caret and typing stay native.
export const RhymeTextarea = forwardRef<HTMLTextAreaElement, RhymeTextareaProps>(
  ({ value, onChange, onKeyDown, onSettle, highlight, className, placeholder, ...rest }, ref) => {
    const inner = useRef<HTMLTextAreaElement | null>(null);
    const [settled, setSettled] = useState(value);
    const settledRef = useRef(value);

    const settle = useCallback(() => {
      const el = inner.current;
      const caret = el && document.activeElement === el ? el.selectionStart : -1;
      const caretLine = caret < 0 ? -1 : value.slice(0, caret).split("\n").length - 1;
      const next = caretLine < 0 ? value : settleText(value, caretLine, settledRef.current);
      if (next !== settledRef.current) {
        settledRef.current = next;
        setSettled(next);
        onSettle?.(next);
      }
    }, [value, onSettle]);

    // Re-check after each change, when the caret moves to another line, and on leaving the box
    useEffect(settle, [settle]);

    const rhymes = useMemo(() => (highlight ? analyzeRhymes(settled) : []), [highlight, settled]);
    const scheme = useMemo(() => (highlight ? rhymeSchemeText(settled) : ""), [highlight, settled]);
    const lines = value.split("\n");
    const settledLines = settled.split("\n");

    const text = "whitespace-pre-wrap break-words [overflow-wrap:anywhere]";
    return (
      <div>
        <div className="relative">
          <div aria-hidden="true" className={cn(className, text, "pointer-events-none select-none text-transparent")}>
            {lines.map((line, i) => {
              const r = rhymes[i];
              const last = i === lines.length - 1 ? "" : "\n";
              // Only lines whose rhyme has settled get a highlight
              if (!highlight || !r?.kind || !r.letter || settledLines[i] !== line) return <span key={i}>{line + last}</span>;
              const { head, end, tail } = splitEnding(line);
              return (
                <span key={i}>
                  {head}
                  <mark
                    className={cn(
                      "rounded-sm text-transparent transition-colors duration-500",
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
            {/* Room for the line after a final line break */}
            {"​"}
          </div>
          <textarea
            ref={(el) => {
              inner.current = el;
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
            }}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onSelect={settle}
            onBlur={settle}
            spellCheck
            className={cn(className, text, "absolute inset-0 block h-full min-h-0 overflow-hidden bg-transparent")}
            placeholder={placeholder}
            {...rest}
          />
        </div>
        {/* Always the same height, so the scheme appearing never moves the page */}
        {highlight && (
          <p className="mt-3 h-4 overflow-x-auto whitespace-nowrap text-[11px] leading-4 [scrollbar-width:none] tracking-[0.2em] text-amber-100/40">
            {scheme.replace(/\s/g, "").length > 1 && (
              <>
                <span className="uppercase">Rhyme scheme</span> <span className="font-semibold text-amber-200/70">{scheme}</span>
              </>
            )}
          </p>
        )}
      </div>
    );
  },
);
RhymeTextarea.displayName = "RhymeTextarea";
