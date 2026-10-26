export const HELPDESK_REQUESTS_KEY = "vk-assistance-applications";

export type HelpdeskRequestDocument = {
  label: string;
  fileName: string;
  fileSize: number;
  fileType: string;
};

export type HelpdeskRequestLocation = {
  districtId?: string;
  districtName?: string;
  localBodyType?: string;
  localBodyId?: string;
  localBodyName?: string;
  wardId?: string;
  wardName?: string;
  mandalamId?: string;
  mandalamName?: string;
};

export type HelpdeskRequest = {
  reference: string;
  applicant: string;
  schemeId: string;
  schemeIds?: string[];
  district: string;
  helpdeskId: string;
  helpdeskName: string;
  mobile: string;
  email?: string;
  contactName?: string;
  contactMobile?: string;
  notes?: string;
  location?: HelpdeskRequestLocation;
  source?: "scheme_application" | "guest_eligibility";
  documents: HelpdeskRequestDocument[];
  missingDocuments: string[];
  status: "helpdesk_request_created";
  createdAt: string;
};

// Prototype queue only. File contents are deliberately never saved in browser storage.
export function loadHelpdeskRequests(): HelpdeskRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(HELPDESK_REQUESTS_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is HelpdeskRequest =>
        typeof item?.reference === "string" &&
        typeof item?.applicant === "string" &&
        typeof item?.helpdeskId === "string" &&
        Array.isArray(item?.documents),
    );
  } catch {
    return [];
  }
}

export function saveHelpdeskRequest(request: HelpdeskRequest): boolean {
  try {
    window.localStorage.setItem(
      HELPDESK_REQUESTS_KEY,
      JSON.stringify([request, ...loadHelpdeskRequests()].slice(0, 20)),
    );
    window.dispatchEvent(new Event("vk-helpdesk-requests-changed"));
    return true;
  } catch {
    return false;
  }
}
