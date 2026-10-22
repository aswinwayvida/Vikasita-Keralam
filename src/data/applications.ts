import { schemes } from "./schemes";
import { districts } from "./geo";

export type AppStatus = "pending" | "in_review" | "approved" | "rejected" | "info_required";

export type Application = {
  id: string;
  applicant: string;
  mobile: string;
  schemeId: string;
  districtId: string;
  status: AppStatus;
  createdAt: string;
};

const statuses: AppStatus[] = ["pending", "in_review", "approved", "rejected", "info_required"];
const names = ["രമേശ്", "സന്ധ്യ", "അനിൽ", "ലത", "സുരേഷ്", "ദീപ", "ബിജു", "ശ്രീലത", "ജയൻ", "നിത്യ", "വിനോദ്"];

export const applications: Application[] = Array.from({ length: 80 }, (_, i) => ({
  id: `APP-${String(i + 1).padStart(4, "0")}`,
  applicant: `${names[i % names.length]} ${["കുമാർ", "നായർ", "മേനോൻ", "ജോസഫ്"][i % 4]}`,
  mobile: `9${String(400000000 + i * 211).slice(0, 9)}`,
  schemeId: schemes[i % schemes.length].id,
  districtId: districts[i % districts.length].id,
  status: statuses[i % statuses.length],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));