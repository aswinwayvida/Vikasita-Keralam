import {
  constituencies,
  organisationalDistricts,
  regions,
  REGION_ORGANISATIONAL_DISTRICTS,
} from "@/data/geo";
import { ORGANISATIONAL_DISTRICT_MANDALAMS } from "./mobileOrganisationMapping";
import type { MobileLocationAssignment } from "./mobileLocationAssignments";

/** Resolve only explicit organisation hierarchy IDs; do not infer from names. */
export function verifiedMobileLocationAssignment(
  level: "region" | "org_district" | "mandalam",
  id: string,
): MobileLocationAssignment | null {
  if (level === "region") {
    return regions.some((region) => region.id === id) ? { region: id } : null;
  }

  const districtId =
    level === "org_district"
      ? id
      : Object.keys(ORGANISATIONAL_DISTRICT_MANDALAMS).find((district) =>
          ORGANISATIONAL_DISTRICT_MANDALAMS[district].includes(id),
        );
  if (!districtId || !organisationalDistricts.some((district) => district.id === districtId))
    return null;
  if (level === "mandalam" && !constituencies.some((mandalam) => mandalam.id === id)) return null;

  const regionId = Object.keys(REGION_ORGANISATIONAL_DISTRICTS).find((region) =>
    REGION_ORGANISATIONAL_DISTRICTS[region].includes(districtId),
  );
  if (!regionId) return null;
  return {
    region: regionId,
    org_district: districtId,
    ...(level === "mandalam" ? { mandalam: id } : {}),
  };
}
