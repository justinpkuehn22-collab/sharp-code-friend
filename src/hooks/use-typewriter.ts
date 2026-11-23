import { useCallback, useEffect, useRef, useState } from "react";

// Reveals text one character at a time, pausing on line breaks and punctuation.
// Once skipped, it stays fully shown even if it only becomes active later.
export const useTypewriter = (text: string, speed = 30, active = false) => {
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
    let i = 0;
    const tick = () => {
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
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [text, speed, active, skipped]);

  return { displayed, done, skip };
};
