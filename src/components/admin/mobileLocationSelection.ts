/** Shared organisation-location selection for the mobile preview. */
export type MobileLocationLevel = "region" | "org_district" | "mandalam" | "area" | "ward";

export interface MobileLocationSelection {
  level: MobileLocationLevel;
  id: string;
}

const STORAGE_KEY = "vikasita-mobile-location-selection-v1";
const CHANGE_EVENT = "vikasita-mobile-location-selection-change";
const levels = new Set<MobileLocationLevel>(["region", "org_district", "mandalam", "area", "ward"]);
let memorySelection: MobileLocationSelection | null = null;

function parseSelection(value: unknown): MobileLocationSelection | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<MobileLocationSelection>;
  if (
    !candidate.level ||
    !levels.has(candidate.level) ||
    typeof candidate.id !== "string" ||
    !candidate.id.trim()
  )
    return null;
  return { level: candidate.level, id: candidate.id };
}

export function getMobileLocationSelection(): MobileLocationSelection | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    memorySelection = stored ? parseSelection(JSON.parse(stored)) : null;
  } catch {
    // Keep the current session selection if storage is unavailable.
  }
  return memorySelection;
}

export function setMobileLocationSelection(selection: MobileLocationSelection | null): void {
  if (typeof window === "undefined") return;
  memorySelection = parseSelection(selection);
  try {
    if (memorySelection) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memorySelection));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The selection remains usable for the current session.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToMobileLocationSelection(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
