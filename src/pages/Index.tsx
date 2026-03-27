import { usePoemStore } from "@/stores/poem-store";
import { PoemBook } from "@/components/poem-book";
import { GrandfatherClock } from "@/components/grandfather-clock";

const BOOKS_PER_SHELF = [7, 6, 7, 6];

export const Index = () => {
  const { poems } = usePoemStore();

  const shelves: typeof poems[] = [];
  let offset = 0;
  for (const count of BOOKS_PER_SHELF) {
    shelves.push(poems.slice(offset, offset + count));
    offset += count;
  }

  return (
    <div className="min-h-screen bg-shelf-wood overflow-y-auto">
      <div className="relative max-w-3xl mx-auto px-2 sm:px-6 py-8">
        {/* Grandfather Clock */}
        <div className="flex justify-center mb-12 animate-fade-in">
          <GrandfatherClock />
        </div>

        {/* Shelves */}
        <div className="space-y-20">
          {shelves.map((shelfBooks, shelfIdx) => (
            <div key={shelfIdx} className="relative">
              {/* Books row */}
              <div className="flex items-end justify-center gap-2 sm:gap-3 px-4 sm:px-8 pb-0">
                {shelfBooks.map((poem, i) => {
                  const globalIdx = BOOKS_PER_SHELF.slice(0, shelfIdx).reduce((a, b) => a + b, 0) + i;
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

              {/* Layered wooden shelf */}
              <div className="relative">
                {/* Top surface — lightest, with wood grain lines */}
                <div
                  className="h-5 rounded-sm shadow-lg relative overflow-hidden"
                  style={{
                    backgroundColor: "hsl(var(--shelf-plank-face))",
                    backgroundImage: `
                      repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 40px,
                        rgba(0,0,0,0.03) 40px,
                        rgba(0,0,0,0.03) 42px
                      ),
                      repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 120px,
                        rgba(0,0,0,0.05) 120px,
                        rgba(0,0,0,0.05) 123px
                      )
                    `,
                  }}
                >
                  {/* Highlight along top edge */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-shelf-highlight/30" />
                </div>

                {/* Front face of plank — medium tone */}
                <div
                  className="h-4 relative overflow-hidden"
                  style={{
                    backgroundColor: "hsl(var(--shelf-plank))",
                    backgroundImage: `
                      repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 3px,
                        rgba(0,0,0,0.04) 3px,
                        rgba(0,0,0,0.04) 4px
                      )
                    `,
                  }}
                >
                  {/* Shadow under top lip */}
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-black/10" />
                </div>

                {/* Bottom edge / underside shadow */}
                <div className="h-2 bg-shelf-plank-dark rounded-b-sm" />

                {/* Drop shadow below shelf */}
                <div className="absolute -bottom-3 inset-x-2 h-3 bg-black/15 blur-sm rounded-full" />

                {/* Brackets */}
                <div className="absolute -bottom-8 left-10 sm:left-14">
                  <div
                    className="w-4 h-8 rounded-b-sm shadow-md"
                    style={{
                      backgroundColor: "hsl(var(--shelf-bracket))",
                      backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05), transparent, rgba(0,0,0,0.1))",
                    }}
                  />
                </div>
                <div className="absolute -bottom-8 right-10 sm:right-14">
                  <div
                    className="w-4 h-8 rounded-b-sm shadow-md"
                    style={{
                      backgroundColor: "hsl(var(--shelf-bracket))",
                      backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05), transparent, rgba(0,0,0,0.1))",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer
          className="mt-24 pb-8 text-center opacity-0 animate-fade-in"
          style={{ animationDelay: "2s" }}
        >
          <p className="font-body text-sm text-shelf-highlight/60">
            Written with love & a little bit of ink ✦
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
