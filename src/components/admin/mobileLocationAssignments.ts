import type { MobileLocationLevel, MobileLocationSelection } from "./mobileLocationSelection";

/** Stable IDs for each ancestor of a mobile sample record. */
export type MobileLocationAssignment = Partial<Record<MobileLocationLevel, string>>;

/** An unassigned record cannot be treated as belonging to a selected location. */
export function matchesMobileLocation(
  assignment: MobileLocationAssignment | null | undefined,
  selection: MobileLocationSelection | null,
): boolean {
  return !selection || assignment?.[selection.level] === selection.id;
}

/** Filter once by record ID so duplicate sample entries do not inflate counts. */
export function filterMobileLocationRecords<T>(
  records: readonly T[],
  selection: MobileLocationSelection | null,
  getId: (record: T) => string,
  getAssignment: (record: T) => MobileLocationAssignment | null | undefined,
): T[] {
  const seen = new Set<string>();
  return records.filter((record) => {
    const id = getId(record);
    if (seen.has(id) || !matchesMobileLocation(getAssignment(record), selection)) return false;
    seen.add(id);
    return true;
  });
}
