import { useCallback, useEffect, useRef, useState } from "react";

// Reveals text one character at a time, pausing on line breaks and punctuation
export const useTypewriter = (text: string, speed = 30, active = false) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const skipRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const skip = useCallback(() => {
    skipRef.current = true;
    setDisplayed(text);
    setDone(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, [text]);

  useEffect(() => {
    skipRef.current = false;
    setDisplayed("");
    setDone(false);
    if (!active) return;
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
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [text, speed, active]);

  return { displayed, done, skip };
};
