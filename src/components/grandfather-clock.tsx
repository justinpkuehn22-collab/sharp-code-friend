import { useEffect, useState } from "react";

const numerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

// A brass rosette, for the pediment and the corners of the hood
const Rosette = ({ className = "" }: { className?: string }) => (
  <span className={`clock-brass block rounded-full ${className}`}>
    <span className="block h-full w-full rounded-full bg-[radial-gradient(circle,hsl(45_90%_80%/0.7)_0_18%,transparent_20%_45%,hsl(30_50%_20%/0.5)_47%_50%,transparent_52%)]" />
  </span>
);

// A fluted column with a brass capital and base, either side of the dial
const Column = ({ side }: { side: "left" | "right" }) => (
  <div className={`absolute top-1 bottom-1 ${side === "left" ? "left-0.5" : "right-0.5"} flex w-3.5 flex-col items-center sm:w-4`}>
    <span className="clock-brass h-2 w-full rounded-sm" />
    <span className="clock-column w-[70%] flex-1" />
    <span className="clock-brass h-2 w-full rounded-sm" />
  </div>
);

// The dial, drawn as one picture so the numerals, ring and hands stay crisp at any size
const Dial = ({ hourDeg, minuteDeg, secondDeg }: { hourDeg: number; minuteDeg: number; secondDeg: number }) => (
  <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
    <defs>
      <radialGradient id="clock-dial" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stopColor="hsl(42 45% 90%)" />
        <stop offset="70%" stopColor="hsl(38 38% 80%)" />
        <stop offset="100%" stopColor="hsl(32 30% 62%)" />
      </radialGradient>
      <linearGradient id="clock-bezel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(45 80% 70%)" />
        <stop offset="35%" stopColor="hsl(38 55% 38%)" />
        <stop offset="60%" stopColor="hsl(42 70% 62%)" />
        <stop offset="100%" stopColor="hsl(32 50% 26%)" />
      </linearGradient>
      <linearGradient id="clock-hand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(25 25% 10%)" />
        <stop offset="100%" stopColor="hsl(25 30% 20%)" />
      </linearGradient>
      <filter id="clock-age">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" />
        <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.18 0" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
    </defs>

    {/* Brass bezel and aged ivory dial */}
    <circle cx="100" cy="100" r="98" fill="url(#clock-bezel)" />
    <circle cx="100" cy="100" r="91" fill="hsl(30 40% 18%)" />
    <circle cx="100" cy="100" r="89" fill="url(#clock-dial)" />
    <circle cx="100" cy="100" r="89" fill="hsl(40 40% 80%)" filter="url(#clock-age)" />

    {/* Chapter ring */}
    <circle cx="100" cy="100" r="84" fill="none" stroke="hsl(25 30% 20% / 0.75)" strokeWidth="0.8" />
    <circle cx="100" cy="100" r="76" fill="none" stroke="hsl(25 30% 20% / 0.75)" strokeWidth="0.8" />
    <circle cx="100" cy="100" r="56" fill="none" stroke="hsl(25 30% 20% / 0.35)" strokeWidth="0.6" />
    {Array.from({ length: 60 }).map((_, i) => (
      <line
        key={i}
        x1="100"
        y1={i % 5 === 0 ? 16 : 16}
        x2="100"
        y2={i % 5 === 0 ? 24 : 20}
        stroke="hsl(25 30% 18%)"
        strokeWidth={i % 5 === 0 ? 1.8 : 0.7}
        transform={`rotate(${i * 6} 100 100)`}
      />
    ))}
    {numerals.map((n, i) => {
      const a = ((i * 30 - 90) * Math.PI) / 180;
      return (
        <text
          key={n}
          x={100 + 63 * Math.cos(a)}
          y={100 + 63 * Math.sin(a)}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="700"
          fontSize={n.length > 2 ? 11 : 13}
          fill="hsl(25 32% 16%)"
        >
          {n}
        </text>
      );
    })}
    {/* Engraved centre flourish */}
    <circle cx="100" cy="100" r="22" fill="none" stroke="hsl(25 30% 20% / 0.25)" strokeWidth="0.6" strokeDasharray="1.5 2.5" />

    {/* Spade hour hand, pointed minute hand, slim red seconds */}
    <g transform={`rotate(${hourDeg} 100 100)`}>
      <path d="M98.6 108 L98.6 66 C93 62 93 54 100 48 C107 54 107 62 101.4 66 L101.4 108 Z" fill="url(#clock-hand)" />
      <circle cx="100" cy="58" r="2.4" fill="hsl(40 40% 82%)" />
    </g>
    <g transform={`rotate(${minuteDeg} 100 100)`}>
      <path d="M99 112 L99 34 L100 22 L101 34 L101 112 Z" fill="url(#clock-hand)" />
      <path d="M100 40 C96 44 96 48 100 52 C104 48 104 44 100 40 Z" fill="hsl(25 25% 12%)" />
    </g>
    <g transform={`rotate(${secondDeg} 100 100)`}>
      <line x1="100" y1="122" x2="100" y2="22" stroke="hsl(0 60% 42%)" strokeWidth="0.9" />
      <circle cx="100" cy="118" r="3" fill="hsl(0 60% 42%)" />
    </g>
    <circle cx="100" cy="100" r="5.5" fill="url(#clock-bezel)" stroke="hsl(30 50% 20%)" strokeWidth="0.6" />
    <circle cx="99" cy="99" r="1.6" fill="hsl(45 90% 85% / 0.8)" />
  </svg>
);

export const GrandfatherClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  return (
    <div className="flex flex-col items-center drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]">
      {/* Crown: three brass finials over a broken arch */}
      <div className="relative w-52 sm:w-64">
        <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 flex-col items-center">
          <span className="clock-brass h-3 w-3 rounded-full" />
          <span className="clock-brass -mt-0.5 h-3 w-2 rounded-b-sm" />
        </div>
        <span className="clock-brass absolute -top-2 left-3 h-3 w-2 rounded-t-full" />
        <span className="clock-brass absolute -top-2 right-3 h-3 w-2 rounded-t-full" />
        <div className="clock-wood-dark h-7 w-full rounded-t-[50%] border-t-2 border-clock-trim/50 shadow-[inset_0_2px_0_hsl(40_70%_65%/0.2)]" />
        <Rosette className="absolute left-1/2 top-2.5 h-4 w-4 -translate-x-1/2" />
      </div>
      {/* Carved cornice */}
      <div className="clock-wood-dark h-2.5 w-56 border-y border-clock-trim/40 sm:w-[17rem]" />

      {/* Hood with fluted columns around the dial */}
      <div className="clock-wood relative w-52 px-5 pb-3 pt-4 sm:w-64 sm:px-6">
        <Column side="left" />
        <Column side="right" />
        {/* Brass corner ornaments, as on an English longcase clock */}
        <span className="clock-brass absolute left-5 top-3 h-3 w-3 rounded-br-full sm:left-6" />
        <span className="clock-brass absolute right-5 top-3 h-3 w-3 rounded-bl-full sm:right-6" />
        <div className="relative mx-auto h-36 w-36 sm:h-44 sm:w-44">
          <Dial hourDeg={hours * 30 + minutes * 0.5} minuteDeg={minutes * 6 + seconds * 0.1} secondDeg={seconds * 6} />
          {/* The glass over the dial catches the light */}
          <span className="pointer-events-none absolute inset-[6%] rounded-full bg-[linear-gradient(135deg,hsl(0_0%_100%/0.22),transparent_38%,transparent_70%,hsl(0_0%_100%/0.06))]" />
        </div>
        <p className="mt-2 text-center font-display text-[10px] uppercase tracking-[0.3em] text-clock-trim/80 sm:text-xs">Poetry Shelf</p>
      </div>
      <div className="clock-wood-dark h-2 w-56 border-y border-clock-trim/40 sm:w-[17rem]" />

      {/* Trunk: a glazed door showing the pendulum and the two weights */}
      <div className="clock-wood-dark relative w-44 px-4 py-4 sm:w-52">
        <div className="clock-trunk-window relative mx-auto h-24 w-28 overflow-hidden rounded-t-[50%] sm:h-28 sm:w-32">
          <span className="absolute left-1.5 top-0 flex flex-col items-center">
            <span className="h-9 w-px bg-clock-trim/50 sm:h-10" />
            <span className="clock-brass h-7 w-2.5 rounded-sm" />
          </span>
          <span className="absolute right-1.5 top-0 flex flex-col items-center">
            <span className="h-5 w-px bg-clock-trim/50 sm:h-6" />
            <span className="clock-brass h-7 w-2.5 rounded-sm" />
          </span>
          <div className="absolute left-1/2 top-0 flex -translate-x-1/2 origin-top animate-pendulum flex-col items-center">
            <div className="h-14 w-[2px] bg-gradient-to-b from-clock-trim/40 to-clock-trim sm:h-16" />
            <div className="clock-brass relative h-6 w-6 rounded-full sm:h-7 sm:w-7">
              <span className="absolute left-1 top-1 h-2 w-2 rounded-full bg-[hsl(45_90%_85%/0.7)] blur-[1px]" />
            </div>
          </div>
          <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,hsl(0_0%_100%/0.12),transparent_35%)]" />
        </div>
        <Rosette className="mx-auto mt-2 h-3 w-3" />
      </div>

      {/* Plinth and bracket feet */}
      <div className="clock-wood h-5 w-52 border-t-2 border-clock-trim/40 sm:w-60" />
      <div className="clock-wood-dark h-2 w-56 rounded-b-sm sm:w-64" />
      <div className="flex w-56 justify-between px-2 sm:w-64">
        <span className="clock-wood-dark h-2 w-5 rounded-b-md" />
        <span className="clock-wood-dark h-2 w-5 rounded-b-md" />
      </div>
    </div>
  );
};
