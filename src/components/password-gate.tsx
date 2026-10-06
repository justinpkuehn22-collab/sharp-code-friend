import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePoemStore } from "@/stores/poem-store";
import { backupShelf, countWritten, fetchShelf, saveShelf, WrongPasswordError } from "@/services/shelf-service";

const storageKey = "poetry-shelf-password";

export const PasswordGate = ({ children }: { children: ReactNode }) => {
  const [password, setPassword] = useState<string | null>(() => localStorage.getItem(storageKey));
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // Load the shared shelf once a password is known
  useEffect(() => {
    if (!password) return;
    let cancelled = false;
    fetchShelf(password)
      .then(async (remote) => {
        if (cancelled) return;
        const local = usePoemStore.getState();
        const localState = { poems: local.poems, shelfSizes: local.shelfSizes };
        // Always keep a copy of this browser's poems before anything changes
        localStorage.setItem(`poetry-shelf-local-backup-${Date.now()}`, JSON.stringify(localState));
        await backupShelf(password, localState).catch(() => undefined);
        if (remote && countWritten(remote.poems) >= countWritten(local.poems)) {
          usePoemStore.setState({ poems: remote.poems, shelfSizes: remote.shelfSizes });
        } else {
          // This browser has more writing than the online shelf: keep it and save it online
          await saveShelf(password, localState);
        }
        localStorage.setItem(storageKey, password);
        loaded.current = true;
        setReady(true);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        localStorage.removeItem(storageKey);
        setPassword(null);
        setError(e instanceof WrongPasswordError ? "That password isn't right. Try again." : "Something went wrong. Please try again.");
      });
    return () => { cancelled = true; };
  }, [password]);

  // Save changes online (debounced)
  useEffect(() => {
    if (!password || !ready) return;
    let timer: number | undefined;
    const unsub = usePoemStore.subscribe((s) => {
      if (!loaded.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        saveShelf(password, { poems: s.poems, shelfSizes: s.shelfSizes }).catch(() => undefined);
      }, 800);
    });
    return () => { unsub(); window.clearTimeout(timer); };
  }, [password, ready]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPassword(input.trim());
  };

  if (ready) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {password ? (
        <p className="font-display text-lg text-muted-foreground animate-pulse">Opening the shelf…</p>
      ) : (
        <form onSubmit={onSubmit} className="w-full max-w-xs flex flex-col items-center gap-4 rounded-md bg-card p-8 shadow-xl">
          <h1 className="font-display text-2xl font-bold text-card-foreground">Poetry shelf</h1>
          <p className="text-sm text-muted-foreground text-center">Enter the password to come in.</p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-center tracking-widest text-foreground outline-none focus:ring-2 focus:ring-ring"
            aria-label="Password"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground font-semibold hover:opacity-90">
            Enter
          </button>
        </form>
      )}
    </div>
  );
};
