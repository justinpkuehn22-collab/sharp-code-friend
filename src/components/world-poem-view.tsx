import { useState } from "react";
import { Globe2, Languages } from "lucide-react";
import type { WorldPoem } from "@/data/world-poems";
import { cn } from "@/lib/utils";

type View = "both" | "original" | "english";

const toggle = (active: boolean) =>
  cn("rounded-full px-2.5 py-1 text-[11px] transition", active ? "bg-amber-400 text-stone-900" : "text-amber-100/65 hover:text-amber-50");

// The original-language text, set the right way round for its script
export const OriginalText = ({ poem, className }: { poem: WorldPoem; className?: string }) => (
  <div
    lang={poem.lang}
    dir={poem.rtl ? "rtl" : "ltr"}
    className={cn("whitespace-pre-wrap font-body leading-[2.1] text-amber-50/90", poem.rtl && "text-right", /^(zh|ja|ko)/.test(poem.lang) && "tracking-[0.08em]", className)}
  >
    {poem.original}
  </div>
);

// A poem from elsewhere in the world: its own language and English, side by side or one at a time
export const WorldPoemView = ({ poem, showHeader = true }: { poem: WorldPoem; showHeader?: boolean }) => {
  const [view, setView] = useState<View>("both");
  const [sounds, setSounds] = useState(false);
  const english = <div className="whitespace-pre-wrap font-body leading-[2.1] text-[hsl(34,20%,72%)]">{poem.translation}</div>;
  const original = (
    <div>
      <OriginalText poem={poem} />
      {sounds && poem.romanization && (
        <p className="mt-3 whitespace-pre-wrap border-t border-amber-100/10 pt-3 text-sm italic leading-relaxed text-amber-100/55">{poem.romanization}</p>
      )}
    </div>
  );

  return (
    <article>
      {showHeader && (
        <header className="mb-4">
          <h3 className="font-display text-2xl font-bold text-[hsl(38,55%,70%)]">{poem.title}</h3>
          <p lang={poem.lang} dir={poem.rtl ? "rtl" : undefined} className={cn("text-lg text-amber-100/80", poem.rtl && "text-left")}>
            {poem.originalTitle}
          </p>
          <p className="mt-1 text-sm italic text-amber-100/60">
            {poem.poet} <span lang={poem.lang} className="not-italic text-amber-100/45">{poem.poet === poem.poetOriginal ? "" : `· ${poem.poetOriginal}`}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-amber-100/45">
            <Globe2 size={11} aria-hidden="true" /> {poem.language} · {poem.place} · {poem.dates}
          </p>
        </header>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-1" role="group" aria-label="How to show the poem">
        <Languages size={13} className="mr-1 text-amber-400/80" aria-hidden="true" />
        <button type="button" className={toggle(view === "both")} aria-pressed={view === "both"} onClick={() => setView("both")}>Side by side</button>
        <button type="button" className={toggle(view === "original")} aria-pressed={view === "original"} onClick={() => setView("original")}>{poem.language}</button>
        <button type="button" className={toggle(view === "english")} aria-pressed={view === "english"} onClick={() => setView("english")}>English</button>
        {poem.romanization && view !== "english" && (
          <label className="ml-auto flex items-center gap-1.5 text-[11px] text-amber-100/60">
            <input type="checkbox" checked={sounds} onChange={(e) => setSounds(e.target.checked)} className="accent-amber-500" />
            How it sounds
          </label>
        )}
      </div>

      {view === "both" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-md border border-amber-100/10 bg-black/20 p-4">{original}</div>
          <div className="p-4 md:px-0">{english}</div>
        </div>
      ) : view === "original" ? (
        original
      ) : (
        english
      )}

      <footer className="mt-6 space-y-2 border-t border-amber-200/10 pt-3 text-xs leading-relaxed">
        <p className="text-amber-100/75">{poem.note}</p>
        <p className="text-amber-100/45">
          English: {poem.translator}. Original checked against {poem.source}.
        </p>
      </footer>
    </article>
  );
};
