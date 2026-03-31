import type { Role } from "../../utils/roles";

export type BackofficeSession = {
  token: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
};

const SESSION_KEY = "planet.backoffice.session";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const sessionStore = {
  get(): BackofficeSession | null {
    if (!canUseStorage()) return null;
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as BackofficeSession;
    } catch {
      return null;
    }
  },
  set(session: BackofficeSession) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(SESSION_KEY);
  }
};
