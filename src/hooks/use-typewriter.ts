import { useCallback, useEffect, useRef, useState } from "react";

// Reveals text one character at a time, pausing on line breaks and punctuation.
// Once skipped, it stays fully shown even if it only becomes active later.
export interface TypewriterPauses {
  line: number; // ms after a line break
  stanza: number; // ms after a blank line
  stop: number; // ms after a full stop, dash or ellipsis
  comma: number; // ms after a comma
}

// Pauses are fixed times, not multiples of the typing speed, so a fast typist still
// breathes at the end of each line
export const useTypewriter = (text: string, speed = 30, active = false, pauses?: TypewriterPauses) => {
  const p = pauses ?? { line: speed * 6, stanza: speed * 9, stop: speed * 4, comma: speed * 2.5 };
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setSkipped(false);
  }, [text]);

  const skip = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setSkipped(true);
  }, []);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (skipped) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    if (!active) return;
    // Very fast reveals type two letters per tick, so a phone isn't redrawing every few ms
    const step = speed < 16 ? 2 : 1;
    let i = 0;
    const tick = () => {
      i = Math.min(text.length, i + step);
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      const chunk = text.slice(i - step, i);
      let delay = speed * step;
      if (chunk.includes("\n")) delay += text[i] === "\n" || chunk.endsWith("\n\n") ? p.stanza : p.line;
      else if (/[.!?—…]/.test(chunk)) delay += p.stop;
      else if (/[,;:]/.test(chunk)) delay += p.comma;
      timerRef.current = window.setTimeout(tick, delay);
    };
    timerRef.current = window.setTimeout(tick, speed);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, active, skipped, p.line, p.stanza, p.stop, p.comma]);

  return { displayed, done, skip };
};
