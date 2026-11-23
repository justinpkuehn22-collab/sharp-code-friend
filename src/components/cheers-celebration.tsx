import { useEffect } from "react";
import { createPortal } from "react-dom";
import { playGlassClink } from "@/lib/audio/glass-clink";

interface CheersCelebrationProps {
  // Changes every time a poem is finished, so the toast plays again
  trigger: number;
  withSound: boolean;
  onDone: () => void;
}

const sparkColors = ["bg-amber-200", "bg-amber-400", "bg-yellow-100", "bg-amber-300"];

const Flute = () => (
  <svg viewBox="0 0 60 200" className="h-48 w-14 drop-shadow-[0_0_18px_rgba(251,191,36,0.45)] sm:h-60 sm:w-16" aria-hidden="true">
    <defs>
      <linearGradient id="bubbly" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(48, 95%, 78%)" />
        <stop offset="100%" stopColor="hsl(40, 85%, 52%)" />
      </linearGradient>
      <clipPath id="bowl">
        <path d="M14 8 L46 8 L40 96 Q30 108 20 96 Z" />
      </clipPath>
    </defs>
    <g clipPath="url(#bowl)">
      <rect x="0" y="26" width="60" height="90" fill="url(#bubbly)" />
      <rect x="0" y="22" width="60" height="6" fill="hsl(50, 100%, 92%)" opacity="0.9" />
      {[22, 30, 36, 26, 33].map((x, i) => (
        <circle key={i} cx={x} cy={88 - i * 6} r={1.4} fill="white" opacity="0.85" className="animate-bubble-rise" />
      ))}
    </g>
    <path d="M14 8 L46 8 L40 96 Q30 108 20 96 Z" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />
    <path d="M18 14 L22 86" stroke="white" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 104 L30 178" stroke="white" strokeOpacity="0.75" strokeWidth="2.5" />
    <ellipse cx="30" cy="184" rx="18" ry="5" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />
  </svg>
);

// Two champagne flutes swing in, clink, and sparkle: a toast to a finished poem
export const CheersCelebration = ({ trigger, withSound, onDone }: CheersCelebrationProps) => {
  useEffect(() => {
    if (withSound) playGlassClink(1.42);
    const timer = window.setTimeout(onDone, 2900);
    return () => window.clearTimeout(timer);
  }, [trigger, withSound, onDone]);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center" role="status" aria-live="polite">
      <div className="absolute inset-0 animate-fade-in bg-black/40" />
      <div className="relative flex items-end justify-center">
        <div className="origin-bottom animate-glass-left">
          <Flute />
        </div>
        <div className="origin-bottom animate-glass-right">
          <Flute />
        </div>
        {/* Sparkles fly out from where the rims touch */}
        <div className="absolute left-1/2 top-6">
          {Array.from({ length: 14 }, (_, i) => (
            <span
              key={`${trigger}-${i}`}
              className={`spark-${i} absolute h-2 w-2 animate-sparkle-burst rounded-full ${sparkColors[i % sparkColors.length]} shadow-[0_0_10px_rgba(253,224,71,0.9)]`}
            />
          ))}
        </div>
      </div>
      <p className="neon-amber relative mt-6 animate-cheers-text font-['Dancing_Script',cursive] text-4xl opacity-0 sm:text-5xl">
        Cheers to a new poem
      </p>
    </div>,
    document.body,
  );
};
