import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchShelf, saveShelf, SignedOutError } from "@/services/shelf-service";
import { usePoemStore } from "@/stores/poem-store";
import { useSessionStore } from "@/stores/session-store";
import { isWritten } from "@/data/poems";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

// Loads the shelf for the current session and pushes it into the poem store
export const useShelfQuery = (token: string | null) => {
  const signOut = useSessionStore((s) => s.signOut);
  const query = useQuery({
    queryKey: ["shelf", token],
    queryFn: () => fetchShelf(token ?? ""),
    enabled: token !== null,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: (count, error) => !(error instanceof SignedOutError) && count < 2,
  });

  useEffect(() => {
    if (query.data) usePoemStore.getState().setPoems(query.data.poems);
  }, [query.data]);

  useEffect(() => {
    if (query.error instanceof SignedOutError) signOut();
  }, [query.error, signOut]);

  return query;
};

// Admin only: saves edits a moment after typing stops, and before the tab closes
export const useShelfAutosave = (token: string | null, enabled: boolean): SaveStatus => {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const signOut = useSessionStore((s) => s.signOut);
  const pending = useRef(false);

  useEffect(() => {
    if (!enabled || !token) return;
    let timer: number | undefined;

    const save = () => {
      pending.current = false;
      setStatus("saving");
      const poems = usePoemStore.getState().poems.filter(isWritten);
      saveShelf(token, poems)
        .then(() => setStatus(pending.current ? "saving" : "saved"))
        .catch((e: unknown) => {
          setStatus("error");
          if (e instanceof SignedOutError) signOut();
        });
    };

    const unsubscribe = usePoemStore.subscribe((state, prev) => {
      if (state.revision === prev.revision) return;
      pending.current = true;
      setStatus("saving");
      window.clearTimeout(timer);
      timer = window.setTimeout(save, 900);
    });

    const flush = () => {
      if (!pending.current) return;
      const poems = usePoemStore.getState().poems.filter(isWritten);
      pending.current = false;
      saveShelf(token, poems, { keepalive: true }).catch(() => undefined);
    };
    window.addEventListener("pagehide", flush);

    return () => {
      unsubscribe();
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [token, enabled, signOut]);

  return status;
};
