import { usePoemStore } from "@/stores/poem-store";
import { PoemBook } from "@/components/poem-book";
import { GrandfatherClock } from "@/components/grandfather-clock";

const BOOKS_PER_SHELF = [7, 6, 7, 6];

export const Index = () => {
  const { poems } = usePoemStore();

  // Split poems into shelves
  const shelves: typeof poems[] = [];
  let offset = 0;
  for (const count of BOOKS_PER_SHELF) {
    shelves.push(poems.slice(offset, offset + count));
    offset += count;
  }

  return (
    <div className="min-h-screen bg-shelf-wood overflow-y-auto">
      {/* Full wooden bookshelf background */}
      <div className="relative max-w-3xl mx-auto px-2 sm:px-6 py-8">
        {/* Grandfather Clock at top */}
        <div className="flex justify-center mb-12 animate-fade-in">
          <GrandfatherClock />
        </div>

        {/* Shelves */}
        <div className="space-y-16">
          {shelves.map((shelfBooks, shelfIdx) => (
            <div key={shelfIdx} className="relative">
              {/* Books row */}
              <div className="flex items-end justify-center gap-2 sm:gap-3 px-4 sm:px-8 pb-1">
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

              {/* Wooden shelf plank */}
              <div className="relative">
                {/* Main plank */}
                <div className="h-5 bg-shelf-plank shadow-xl border-t border-shelf-highlight/20 rounded-sm" />
                {/* Plank underside / depth */}
                <div className="h-2.5 bg-shelf-plank-dark rounded-b-sm mx-0" />
                {/* Left bracket */}
                <div className="absolute -bottom-7 left-8 sm:left-12">
                  <div className="w-4 h-7 bg-shelf-bracket rounded-b-sm shadow-md" />
                </div>
                {/* Right bracket */}
                <div className="absolute -bottom-7 right-8 sm:right-12">
                  <div className="w-4 h-7 bg-shelf-bracket rounded-b-sm shadow-md" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer
          className="mt-20 pb-8 text-center opacity-0 animate-fade-in"
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
