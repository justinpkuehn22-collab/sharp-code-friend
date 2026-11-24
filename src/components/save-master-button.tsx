import { useState } from "react";
import { Check, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import type { MasterExample } from "@/data/master-examples";
import { fetchWholePoem, poemText } from "@/services/poetry-library";
import { favoriteId, usePoemStore } from "@/stores/poem-store";
import { cn } from "@/lib/utils";

// Longest poem saved whole; anything longer goes on the shelf as the passage only
const maxWholeLines = 120;

// Saves the famous poem behind a passage to the favorites shelf, whole when the
// public library has it, otherwise as the passage itself
export const SaveMasterButton = ({ master, className }: { master: MasterExample; className?: string }) => {
  const { poems, addFavorite, deletePoem } = usePoemStore();
  const [busy, setBusy] = useState(false);
  const id = favoriteId(master.poem, master.poet);
  const onShelf = poems.some((p) => p.id === id);

  const save = async () => {
    if (onShelf) {
      deletePoem(id);
      toast.success(`Took "${master.poem}" off your shelf.`);
      return;
    }
    setBusy(true);
    let content = master.lines;
    let whole = false;
    try {
      const found = await fetchWholePoem(master.poem, master.poet);
      if (found && found.lines.length > 0 && found.lines.length <= maxWholeLines) {
        content = poemText(found);
        whole = true;
      }
    } catch {
      // The passage alone is still worth keeping
    }
    addFavorite({ title: master.poem, author: master.poet, content, tags: whole ? [] : ["excerpt"] });
    setBusy(false);
    toast.success(whole ? `"${master.poem}" is on your favorites shelf.` : `The passage from "${master.poem}" is on your favorites shelf.`);
  };

  return (
    <button
      type="button"
      onClick={() => void save()}
      disabled={busy}
      aria-pressed={onShelf}
      className={cn(
        "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-60",
        onShelf ? "border border-amber-300/40 text-amber-100" : "brass-plate text-stone-900",
        className,
      )}
    >
      {busy ? <Loader2 size={11} className="animate-spin" aria-hidden="true" /> : onShelf ? <Check size={11} aria-hidden="true" /> : <Star size={11} aria-hidden="true" />}
      {onShelf ? "On your shelf" : "Save to my shelf"}
    </button>
  );
};
