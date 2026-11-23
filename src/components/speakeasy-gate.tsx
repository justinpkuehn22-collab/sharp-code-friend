import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { WhiskeyGlass } from "@/components/whiskey-glass";
import { signIn, TooManyAttemptsError, WrongCodeError } from "@/services/shelf-service";
import { clearLegacyStorage, isSessionValid, useSessionStore } from "@/stores/session-store";
import { useShelfQuery } from "@/hooks/use-shelf";
import { cn } from "@/lib/utils";

type Phase = "waiting" | "checking" | "opening";

export const SpeakeasyGate = ({ children }: { children: ReactNode }) => {
  const { token, expiresAt, setSession, signOut } = useSessionStore();
  const sessionValid = token !== null && isSessionValid(expiresAt);
  const shelf = useShelfQuery(sessionValid ? token : null);

  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("waiting");
  const [message, setMessage] = useState("");
  const [shaking, setShaking] = useState(false);
  const [doorOpened, setDoorOpened] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    clearLegacyStorage();
  }, []);

  useEffect(() => {
    if (token && !isSessionValid(expiresAt)) signOut();
  }, [token, expiresAt, signOut]);

  // Leaving (or being signed out) closes the door again
  useEffect(() => {
    if (token) return;
    setPhase("waiting");
    setDoorOpened(false);
  }, [token]);

  // Let the door swing before showing the shelf
  useEffect(() => {
    if (phase !== "opening" || !shelf.data) return;
    const timer = window.setTimeout(() => setDoorOpened(true), 1100);
    return () => window.clearTimeout(timer);
  }, [phase, shelf.data]);

  const refuse = (text: string) => {
    setMessage(text);
    setShaking(true);
    setCode("");
    setPhase("waiting");
    window.setTimeout(() => setShaking(false), 500);
  };

  // Put the cursor back in the hidden input whenever the door is ready for another try
  useEffect(() => {
    if (phase === "waiting") inputRef.current?.focus();
  }, [phase]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || phase !== "waiting") return;
    setMessage("");
    setPhase("checking");
    try {
      const session = await signIn(code);
      setCode("");
      setSession(session);
      setPhase("opening");
    } catch (err: unknown) {
      if (err instanceof WrongCodeError) refuse("That's not the word, friend. Try again.");
      else if (err instanceof TooManyAttemptsError) refuse("Easy there. The doorman says come back in 15 minutes.");
      else refuse("The door's stuck. Check your connection and knock again.");
    }
  };

  // Returning visitors with a live session skip the door entirely
  const returning = sessionValid && phase === "waiting";
  if (shelf.data && (returning || doorOpened)) return <>{children}</>;

  if (returning) {
    return (
      <div className="speakeasy-wall flex min-h-screen items-center justify-center">
        {shelf.isError ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-display text-lg italic text-amber-200/80">The shelf didn't load. Check your connection.</p>
            <button
              type="button"
              onClick={() => void shelf.refetch()}
              className="brass rounded-md px-4 py-2 font-display font-semibold text-stone-900"
            >
              Try again
            </button>
          </div>
        ) : (
          <p className="font-display text-lg italic text-amber-200/70 animate-pulse">Pouring you a drink…</p>
        )}
      </div>
    );
  }

  const loadFailed = phase === "opening" && shelf.isError;

  return (
    <main className="speakeasy-wall relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Neon sign */}
      <p className="neon-amber mb-8 animate-neon-flicker font-['Dancing_Script',cursive] text-4xl sm:text-5xl" aria-hidden="true">
        The poetry room
      </p>

      {/* Wall sconces */}
      <div className="pointer-events-none absolute left-[8%] top-[22%] hidden h-24 w-24 animate-candle rounded-full bg-amber-500/20 blur-2xl sm:block" />
      <div className="pointer-events-none absolute right-[8%] top-[22%] hidden h-24 w-24 animate-candle rounded-full bg-amber-500/20 blur-2xl sm:block" />

      <div className="relative w-full max-w-sm">
        {/* What's behind the door: the bar, glowing */}
        <div className="absolute inset-0 rounded-t-[160px] bg-[radial-gradient(ellipse_at_50%_40%,hsl(38_90%_55%/0.55),hsl(20_40%_6%)_75%)]" />

        <form
          onSubmit={onSubmit}
          className={cn(
            "speakeasy-door relative flex flex-col items-center rounded-t-[160px] px-8 pb-10 pt-16 origin-left",
            phase === "opening" && shelf.data && "animate-door-open",
          )}
        >
          <h1 className="sr-only">Poetry shelf — enter your code</h1>

          {/* Door knocker plate */}
          <div className="brass mb-6 h-3 w-16 rounded-full opacity-80 shadow-md" />

          {/* Peephole slot */}
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="speakeasy-slot flex w-full flex-col items-center rounded-md px-4 pb-3 pt-4 focus:outline-none"
            aria-label="Type your code"
          >
            <span className="font-display text-sm italic tracking-wide text-amber-100/80">
              {phase === "checking" ? "Let me check the list…" : code ? "Keep going…" : "What's the word?"}
            </span>
            <WhiskeyGlass cubes={code.length} shaking={shaking} className="mt-1" />
          </button>

          <label htmlFor="speakeasy-code" className="sr-only">
            Code word
          </label>
          <input
            id="speakeasy-code"
            ref={inputRef}
            type="password"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
            maxLength={64}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={phase !== "waiting"}
            className="absolute h-px w-px overflow-hidden opacity-0"
          />

          <p className="mt-5 min-h-[2.5rem] text-center text-sm text-amber-100/70" role="status" aria-live="polite">
            {loadFailed
              ? "You're in, but the shelf didn't load. Refresh to try again."
              : message || "Every letter you type drops in as ice. No one sees the word."}
          </p>

          <button
            type="submit"
            disabled={phase !== "waiting" || !code.trim()}
            className="brass mt-2 w-full rounded-md px-4 py-2.5 font-display text-base font-semibold text-stone-900 shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            {phase === "checking" ? "Knocking…" : "Knock"}
          </button>

          {/* Door handle */}
          <div className="brass absolute bottom-28 right-4 h-14 w-3 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.7)]" />
        </form>
      </div>

      <p className="mt-8 max-w-xs text-center text-xs text-amber-100/40">
        Friends get a reader's code. The house has its own.
      </p>
    </main>
  );
};
