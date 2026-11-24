import { beforeEach, describe, expect, it } from "vitest";
import { effectiveTheme, settingsId, settingsRecord } from "@/lib/room-settings";
import { usePoemStore } from "@/stores/poem-store";
import type { Poem } from "@/data/poems";

const poem: Poem = { id: "poem-1", title: "A", content: "words", tags: [], mood: null, createdAt: null, updatedAt: null, kind: "own", author: null } as unknown as Poem;

describe("room theme", () => {
  it("opens in Gatsby green for guests unless they picked their own", () => {
    expect(effectiveTheme({ role: "reader", guestPreview: false, savedTheme: "midnight", localChoice: null })).toBe("emerald");
    expect(effectiveTheme({ role: "reader", guestPreview: false, savedTheme: null, localChoice: "rouge" })).toBe("rouge");
    expect(effectiveTheme({ role: null, guestPreview: false, savedTheme: null, localChoice: null })).toBe("emerald");
  });

  it("uses the owner's saved theme everywhere, and shows the guest default in guest view", () => {
    expect(effectiveTheme({ role: "admin", guestPreview: false, savedTheme: "midnight", localChoice: "rouge" })).toBe("midnight");
    expect(effectiveTheme({ role: "admin", guestPreview: false, savedTheme: null, localChoice: null })).toBe("emerald");
    expect(effectiveTheme({ role: "admin", guestPreview: true, savedTheme: "midnight", localChoice: null })).toBe("emerald");
  });
});

describe("saved settings travel with the shelf", () => {
  beforeEach(() => usePoemStore.setState({ poems: [], roomSettings: null, revision: 0 }));

  it("keeps the settings record off the shelf and puts it back when saving", () => {
    usePoemStore.getState().setPoems([poem, settingsRecord({ theme: "rouge" }, "2026-01-01T00:00:00Z")]);
    const state = usePoemStore.getState();
    expect(state.poems.map((p) => p.id)).toEqual(["poem-1"]);
    expect(state.roomSettings?.theme).toBe("rouge");
    expect(state.shelfPayload().map((p) => p.id)).toEqual(["poem-1", settingsId]);
  });

  it("saving a theme marks the shelf as changed", () => {
    usePoemStore.getState().setPoems([poem]);
    usePoemStore.getState().saveRoomTheme("midnight");
    expect(usePoemStore.getState().revision).toBe(1);
    const record = usePoemStore.getState().shelfPayload().find((p) => p.id === settingsId);
    expect(record?.kind).toBe("favorite");
    expect(JSON.parse(record?.content ?? "{}").theme).toBe("midnight");
  });

  it("ignores a broken settings record", () => {
    usePoemStore.getState().setPoems([{ ...settingsRecord({ theme: null }, "x"), content: "not json" }]);
    expect(usePoemStore.getState().roomSettings?.theme).toBeNull();
  });
});

describe("the backend accepts the settings record as it is today", () => {
  it("passes validation", async () => {
    const { validatePoems } = await import("../../supabase/functions/_shared/shelf-core");
    const result = validatePoems([settingsRecord({ theme: "midnight" }, "2026-01-01T00:00:00.000Z")]);
    expect("error" in result ? result.error : "ok").toBe("ok");
  });
});
