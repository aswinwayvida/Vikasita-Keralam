export const ELIGIBILITY_PROFILE_SESSION_KEY = "vikasita-keralam-eligibility-profile";
export const EMAIL_NOT_PROVIDED = "not_provided";

export function loadEligibilityProfile(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(ELIGIBILITY_PROFILE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}
export function updateEligibilityProfile(fields: Record<string, string>) {
  if (typeof window === "undefined") return;
  const current = loadEligibilityProfile();
  window.sessionStorage.setItem(ELIGIBILITY_PROFILE_SESSION_KEY, JSON.stringify({ ...current, ...fields }));
}