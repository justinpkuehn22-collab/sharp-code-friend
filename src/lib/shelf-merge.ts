import type { Poem } from "@/data/poems";

const time = (p: Poem) => Date.parse(p.updatedAt ?? "") || 0;

// Combines this device's shelf with what's saved on the server, so a tab or phone that
// has been open a while can't wipe out a poem written somewhere else.
// Keeps every poem from either side, takes whichever copy was edited last, and only
// drops a server poem when it was deleted on this device.
export const mergeShelves = (local: Poem[], server: Poem[], deletedHere: ReadonlySet<string>): Poem[] => {
  const merged = new Map(local.map((p) => [p.id, p]));
  for (const remote of server) {
    const mine = merged.get(remote.id);
    if (!mine) {
      if (!deletedHere.has(remote.id)) merged.set(remote.id, remote);
    } else if (time(remote) > time(mine)) {
      merged.set(remote.id, remote);
    }
  }
  return [...merged.values()];
};

// True when the server has poems or edits this device hasn't seen
export const serverHasNews = (local: Poem[], merged: Poem[]): boolean => {
  if (merged.length !== local.length) return true;
  const byId = new Map(local.map((p) => [p.id, p]));
  return merged.some((p) => byId.get(p.id) !== p);
};
