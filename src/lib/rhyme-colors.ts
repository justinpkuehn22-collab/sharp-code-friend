// One colour per rhyme sound, readable on the dark page
export const rhymeTextColors = [
  "text-rose-300",
  "text-emerald-300",
  "text-sky-300",
  "text-amber-300",
  "text-violet-300",
  "text-teal-300",
  "text-orange-300",
  "text-lime-300",
];
export const rhymeBadgeColors = [
  "bg-rose-400/20 text-rose-200",
  "bg-emerald-400/20 text-emerald-200",
  "bg-sky-400/20 text-sky-200",
  "bg-amber-400/20 text-amber-200",
  "bg-violet-400/20 text-violet-200",
  "bg-teal-400/20 text-teal-200",
  "bg-orange-400/20 text-orange-200",
  "bg-lime-400/20 text-lime-200",
];
export const colorIndexForLetter = (letter: string): number => (letter.charCodeAt(0) - 65) % rhymeTextColors.length;
