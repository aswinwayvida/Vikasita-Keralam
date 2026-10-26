import { constituencies, districts, getWardsForLocalBody, panchayats } from "@/data/geo";
import { helpdeskLocations } from "@/data/helpdesk-locations";
import { saveHelpdeskRequest, type HelpdeskRequest } from "@/lib/helpdesk-requests";

export type GuestAssistanceLocationAnswers = {
  districtId: string;
  localBodyType: string;
  localBodyId: string;
  wardId: string;
  mandalamId: string;
};

export type GuestAssistanceInput = {
  answers: GuestAssistanceLocationAnswers;
  schemeIds: string[];
  fullName: string;
  mobile: string;
  notes?: string;
};

export type GuestAssistanceResult = { ok: true; reference: string } | { ok: false };

export function buildGuestAssistanceRequest(input: GuestAssistanceInput): HelpdeskRequest {
  const district = districts.find((item) => item.id === input.answers.districtId);
  const localBody = panchayats.find((item) => item.id === input.answers.localBodyId);
  const ward = input.answers.localBodyId
    ? getWardsForLocalBody(input.answers.localBodyId).find(
        (item) => item.id === input.answers.wardId,
      )
    : undefined;
  const mandalam = constituencies.find((item) => item.id === input.answers.mandalamId);
  const districtName = district?.en ?? "";
  const helpdesk = helpdeskLocations.find((item) => item.district === districtName);
  const mobile = input.mobile.trim();
  const reference = `VK-HELP-G-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return {
    reference,
    applicant: input.fullName.trim(),
    schemeId: input.schemeIds[0],
    schemeIds: input.schemeIds,
    district: districtName,
    helpdeskId: helpdesk?.id ?? "state-helpdesk",
    helpdeskName: helpdesk?.name ?? "State Help Desk",
    mobile: `******${mobile.slice(-4)}`,
    contactName: input.fullName.trim(),
    contactMobile: mobile,
    notes: input.notes?.trim() || undefined,
    location: {
      districtId: district?.id,
      districtName,
      localBodyType: input.answers.localBodyType || undefined,
      localBodyId: localBody?.id,
      localBodyName: localBody?.en,
      wardId: ward?.id,
      wardName: ward ? ward.displayEn : undefined,
      mandalamId: mandalam?.id,
      mandalamName: mandalam?.en,
    },
    source: "guest_eligibility",
    documents: [],
    missingDocuments: [],
    status: "helpdesk_request_created",
    createdAt: new Date().toISOString(),
  };
}

export async function sendGuestAssistanceRequest(
  input: GuestAssistanceInput,
): Promise<GuestAssistanceResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 650));
  try {
    const request = buildGuestAssistanceRequest(input);
    return saveHelpdeskRequest(request)
      ? { ok: true, reference: request.reference }
      : { ok: false };
  } catch {
    return { ok: false };
  }
}
