import { usePoemStore } from "@/stores/poem-store";
import { PoemBook } from "@/components/poem-book";
import { GrandfatherClock } from "@/components/grandfather-clock";

export const Index = () => {
  const { poems } = usePoemStore();
  const topRow = poems.slice(0, 7);
  const bottomRow = poems.slice(7);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Grandfather Clock */}
      <div className="mb-10 animate-fade-in">
        <GrandfatherClock />
      </div>

      {/* Bookshelf */}
      <div className="w-full max-w-2xl space-y-0">
        {/* Top shelf */}
        <div>
          <div className="flex items-end justify-center gap-1.5 sm:gap-2 px-6 pb-1">
            {topRow.map((poem, i) => (
              <div
                key={poem.id}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.3 + i * 0.08}s` }}
              >
                <PoemBook poem={poem} index={i} />
              </div>
            ))}
          </div>
          {/* Wooden shelf plank */}
          <div className="relative">
            <div className="h-4 bg-shelf-plank rounded-sm shadow-lg border-t border-shelf-highlight/30" />
            <div className="h-2 bg-shelf-plank-dark rounded-b-md mx-0.5 shadow-md" />
            {/* Shelf bracket left */}
            <div className="absolute -bottom-5 left-6 w-3 h-5 bg-shelf-bracket rounded-b-sm" />
            {/* Shelf bracket right */}
            <div className="absolute -bottom-5 right-6 w-3 h-5 bg-shelf-bracket rounded-b-sm" />
          </div>
        </div>

        {/* Bottom shelf */}
        {bottomRow.length > 0 && (
          <div className="mt-10">
            <div className="flex items-end justify-center gap-1.5 sm:gap-2 px-6 pb-1">
              {bottomRow.map((poem, i) => (
                <div
                  key={poem.id}
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: `${0.7 + i * 0.08}s` }}
                >
                  <PoemBook poem={poem} index={i + 7} />
                </div>
              ))}
            </div>
            {/* Wooden shelf plank */}
            <div className="relative">
              <div className="h-4 bg-shelf-plank rounded-sm shadow-lg border-t border-shelf-highlight/30" />
              <div className="h-2 bg-shelf-plank-dark rounded-b-md mx-0.5 shadow-md" />
              <div className="absolute -bottom-5 left-6 w-3 h-5 bg-shelf-bracket rounded-b-sm" />
              <div className="absolute -bottom-5 right-6 w-3 h-5 bg-shelf-bracket rounded-b-sm" />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="mt-24 text-center opacity-0 animate-fade-in"
        style={{ animationDelay: "1.2s" }}
      >
        <p className="font-body text-sm text-muted-foreground">
          Written with love & a little bit of ink ✦
        </p>
      </footer>
    </div>
  );
};

export default Index;
