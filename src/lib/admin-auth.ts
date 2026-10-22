export const ADMIN_SESSION_KEY = "vk-admin-session";
export const ADMIN_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

type AdminSession = {
  username: string;
  role: "STATE_ADMIN";
  expiresAt: number;
};

export function createAdminSession(username: string) {
  if (typeof window === "undefined") return;
  const session: AdminSession = {
    username,
    role: "STATE_ADMIN",
    expiresAt: Date.now() + ADMIN_SESSION_DURATION_MS,
  };
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    if (session.role !== "STATE_ADMIN" || session.expiresAt <= Date.now()) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function isAdminAuthenticated() {
  return getAdminSession() !== null;
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}
