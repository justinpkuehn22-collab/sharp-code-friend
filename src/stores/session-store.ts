import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/data/poems";
import type { SessionInfo } from "@/services/shelf-service";

interface SessionStore {
  token: string | null;
  role: Role | null;
  expiresAt: number | null;
  setSession: (session: SessionInfo) => void;
  signOut: () => void;
}

// Stores only a signed, expiring session token — never the code itself
export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      expiresAt: null,
      setSession: ({ token, role, expiresAt }) => set({ token, role, expiresAt }),
      signOut: () => set({ token: null, role: null, expiresAt: null }),
    }),
    { name: "poetry-shelf-session" },
  ),
);

export const isSessionValid = (expiresAt: number | null, now = Date.now()): boolean =>
  expiresAt !== null && expiresAt > now;

// Older versions kept the plain password and a full poem cache in this browser; remove them
export const clearLegacyStorage = (): void => {
  try {
    const legacyKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key === "poetry-shelf-password" || key === "poetry-shelf" || key.startsWith("poetry-shelf-local-backup-"))) {
        legacyKeys.push(key);
      }
    }
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable (private mode); nothing to clean up then
  }
};
