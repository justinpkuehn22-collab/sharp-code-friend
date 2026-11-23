import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface WhiskeyGlassProps {
  // How many characters have been typed; each one becomes an ice cube
  cubes: number;
  shaking?: boolean;
  className?: string;
}

const maxVisibleCubes = 9;

// Fixed resting spots so cubes stack naturally inside the glass
const restingSpots = [
  { x: 62, y: 150, r: -8 },
  { x: 104, y: 152, r: 6 },
  { x: 82, y: 124, r: 14 },
  { x: 120, y: 126, r: -12 },
  { x: 48, y: 122, r: 4 },
  { x: 98, y: 98, r: -5 },
  { x: 64, y: 96, r: 18 },
  { x: 128, y: 100, r: 9 },
  { x: 84, y: 72, r: -15 },
];

// A rocks glass of whiskey. Typed characters never appear as text — only as ice.
export const WhiskeyGlass = ({ cubes, shaking = false, className }: WhiskeyGlassProps) => {
  const visible = Math.min(cubes, maxVisibleCubes);
  // The pour rises a little with every cube, like ice displacing whiskey
  const level = 118 - Math.min(cubes, 14) * 3;
  const spots = useMemo(() => restingSpots.slice(0, visible), [visible]);

  return (
    <svg
      viewBox="0 0 200 220"
      className={cn("h-44 w-40 drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]", shaking && "animate-glass-shake", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="whiskey" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(32, 85%, 52%)" stopOpacity="0.92" />
          <stop offset="100%" stopColor="hsl(22, 80%, 26%)" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.28" />
          <stop offset="45%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="white" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="ice" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(195, 60%, 96%)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="hsl(30, 60%, 70%)" stopOpacity="0.45" />
        </linearGradient>
        <clipPath id="glass-inside">
          <path d="M34 40 L166 40 L154 196 Q152 204 144 204 L56 204 Q48 204 46 196 Z" />
        </clipPath>
      </defs>

      {/* Bar-top shadow */}
      <ellipse cx="100" cy="210" rx="70" ry="7" fill="black" opacity="0.45" />

      <g clipPath="url(#glass-inside)">
        {/* Whiskey */}
        <rect x="30" y={level} width="140" height="120" fill="url(#whiskey)" className="transition-all duration-500" />
        <ellipse cx="100" cy={level} rx="66" ry="5" fill="hsl(36, 90%, 62%)" opacity="0.55" className="transition-all duration-500" />

        {/* Ice cubes */}
        {spots.map((spot, i) => (
          <g key={i} transform={`translate(${spot.x} ${spot.y}) rotate(${spot.r})`}>
            <g className="animate-cube-drop [transform-box:fill-box] origin-center">
              <rect x="-17" y="-17" width="34" height="34" rx="7" fill="url(#ice)" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" />
              <path d="M-10 -11 L6 -11" stroke="white" strokeOpacity="0.8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M-11 -6 L-11 4" stroke="white" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>
        ))}
      </g>

      {/* Glass walls and heavy base */}
      <path
        d="M30 36 L170 36 L157 198 Q154 212 142 212 L58 212 Q46 212 43 198 Z"
        fill="url(#glass)"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="2.5"
      />
      <path d="M48 186 L152 186" stroke="white" strokeOpacity="0.18" strokeWidth="2" />
      <path d="M44 52 L52 180" stroke="white" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="100" cy="36" rx="70" ry="6" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
    </svg>
  );
};
