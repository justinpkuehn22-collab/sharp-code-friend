import { poems } from "@/data/poems";
import { PoemBook } from "@/components/poem-book";
import { BookOpen } from "lucide-react";

export const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-12 sm:py-20">
      {/* Header */}
      <header className="text-center mb-16 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="text-primary" size={28} />
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
            My poetry shelf
          </h1>
          <BookOpen className="text-secondary" size={28} />
        </div>
        <p className="font-body text-muted-foreground text-lg max-w-md mx-auto">
          Pick a book, read a poem. Each one is a small world.
        </p>
      </header>

      {/* Bookshelf */}
      <div className="w-full max-w-2xl">
        {/* Books row */}
        <div className="flex items-end justify-center gap-2 sm:gap-3 px-4">
          {poems.map((poem, i) => (
            <div
              key={poem.id}
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <PoemBook poem={poem} index={i} />
            </div>
          ))}
        </div>

        {/* Shelf */}
        <div className="relative mt-0">
          <div className="h-4 bg-book-tan-dark rounded-b-sm shadow-md" />
          <div className="h-2 bg-book-tan-dark/60 rounded-b-md mx-1" />
        </div>
      </div>

      {/* Footer */}
      <footer
        className="mt-20 text-center opacity-0 animate-fade-in"
        style={{ animationDelay: "1s" }}
      >
        <p className="font-body text-sm text-muted-foreground">
          Written with love & a little bit of ink ✦
        </p>
      </footer>
    </div>
  );
};

export default Index;
