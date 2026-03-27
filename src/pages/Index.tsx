import { usePoemStore } from "@/stores/poem-store";
import { PoemBook } from "@/components/poem-book";
import { GrandfatherClock } from "@/components/grandfather-clock";
import { Plus } from "lucide-react";

export const Index = () => {
  const { poems, shelfSizes, addShelf } = usePoemStore();

  const shelves: typeof poems[] = [];
  let offset = 0;
  for (const count of shelfSizes) {
    shelves.push(poems.slice(offset, offset + count));
    offset += count;
  }

  return (
    <div
      className="min-h-screen overflow-y-auto flex justify-center py-10 px-4"
      style={{
        backgroundColor: "hsl(30, 8%, 82%)",
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.08) 0%, transparent 50%)
        `,
      }}
    >
      {/* The bookshelf — a piece of furniture */}
      <div
        className="relative w-full max-w-3xl"
        style={{
          background: `
            linear-gradient(
              180deg,
              hsl(25, 30%, 20%) 0%,
              hsl(25, 28%, 17%) 100%
            )
          `,
          backgroundImage: `
            linear-gradient(180deg, hsl(25, 30%, 20%) 0%, hsl(25, 28%, 17%) 100%),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 55px,
              rgba(0,0,0,0.05) 55px,
              rgba(0,0,0,0.05) 57px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 160px,
              rgba(0,0,0,0.07) 160px,
              rgba(0,0,0,0.07) 163px
            )
          `,
          borderRadius: "4px 4px 6px 6px",
          boxShadow: `
            8px 8px 24px rgba(0,0,0,0.4),
            -8px 8px 24px rgba(0,0,0,0.4),
            0 2px 0 rgba(255,255,255,0.05) inset,
            0 -2px 0 rgba(0,0,0,0.3) inset,
            3px 0 0 rgba(255,255,255,0.03) inset,
            -3px 0 0 rgba(255,255,255,0.03) inset
          `,
          border: "3px solid hsl(25, 25%, 14%)",
        }}
      >
        {/* Top crown molding */}
        <div
          className="h-5 rounded-t-sm"
          style={{
            background: "linear-gradient(180deg, hsl(25, 30%, 28%), hsl(25, 28%, 20%))",
            borderBottom: "2px solid hsl(25, 20%, 12%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3) inset, 0 -1px 0 rgba(255,255,255,0.08) inset",
          }}
        />

        {/* Inner back panel — slightly lighter to show depth */}
        <div
          className="mx-3 sm:mx-5"
          style={{
            backgroundColor: "hsl(25, 22%, 15%)",
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 50px,
                rgba(255,255,255,0.015) 50px,
                rgba(255,255,255,0.015) 52px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 140px,
                rgba(0,0,0,0.06) 140px,
                rgba(0,0,0,0.06) 143px
              ),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 300px,
                rgba(255,255,255,0.01) 300px,
                rgba(255,255,255,0.01) 302px
              )
            `,
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4), inset 2px 0 4px rgba(0,0,0,0.2), inset -2px 0 4px rgba(0,0,0,0.2)",
          }}
        >
          {/* Grandfather Clock */}
          <div className="flex justify-center pt-8 pb-4 animate-fade-in">
            <GrandfatherClock />
          </div>

          {/* Shelves */}
          {shelves.map((shelfBooks, shelfIdx) => (
            <div key={shelfIdx} className="relative">
              {/* Books row */}
              <div className="flex items-end justify-center gap-2 sm:gap-3 px-6 sm:px-10 pb-0 pt-8">
                {shelfBooks.map((poem, i) => {
                  const globalIdx = shelfSizes.slice(0, shelfIdx).reduce((a, b) => a + b, 0) + i;
                  return (
                    <div
                      key={poem.id}
                      className="opacity-0 animate-fade-in"
                      style={{ animationDelay: `${0.2 + shelfIdx * 0.3 + i * 0.06}s` }}
                    >
                      <PoemBook poem={poem} index={globalIdx} />
                    </div>
                  );
                })}
              </div>

              {/* Shelf plank */}
              <div className="relative">
                {/* Top surface */}
                <div
                  className="h-4 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, hsl(30, 30%, 50%), hsl(28, 28%, 42%))",
                    backgroundImage: `
                      linear-gradient(180deg, hsl(30, 30%, 50%), hsl(28, 28%, 42%)),
                      repeating-linear-gradient(90deg, transparent, transparent 45px, rgba(0,0,0,0.04) 45px, rgba(0,0,0,0.04) 47px)
                    `,
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10" />
                </div>
                {/* Front face */}
                <div
                  className="h-3"
                  style={{
                    background: "linear-gradient(180deg, hsl(28, 28%, 38%), hsl(25, 25%, 32%))",
                    boxShadow: "inset 0 1px 0 rgba(0,0,0,0.2)",
                  }}
                />
                {/* Bottom lip shadow */}
                <div className="h-1" style={{ background: "hsl(25, 22%, 15%)", boxShadow: "0 4px 8px rgba(0,0,0,0.3)" }} />
              </div>
            </div>
          ))}

          {/* Add shelf button */}
          <div className="flex justify-center pt-6 pb-4">
            <button
              onClick={addShelf}
              className="group w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 active:scale-95 opacity-40 hover:opacity-80"
              style={{
                background: "linear-gradient(135deg, hsl(38, 55%, 45%), hsl(38, 50%, 35%))",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
              aria-label="Add new shelf"
            >
              <Plus size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* Bottom base molding */}
        <div
          className="h-6 rounded-b-sm"
          style={{
            background: "linear-gradient(180deg, hsl(25, 28%, 20%), hsl(25, 30%, 24%))",
            borderTop: "2px solid hsl(25, 20%, 12%)",
            boxShadow: "0 -2px 4px rgba(0,0,0,0.3) inset, 0 1px 0 rgba(255,255,255,0.06) inset",
          }}
        />

        {/* Furniture feet */}
        <div className="flex justify-between px-6">
          <div
            className="w-8 h-3 rounded-b-md"
            style={{ background: "hsl(25, 25%, 16%)", boxShadow: "0 3px 6px rgba(0,0,0,0.4)" }}
          />
          <div
            className="w-8 h-3 rounded-b-md"
            style={{ background: "hsl(25, 25%, 16%)", boxShadow: "0 3px 6px rgba(0,0,0,0.4)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
