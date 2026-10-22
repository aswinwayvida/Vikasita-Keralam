import { districts, constituencies, panchayats } from "./geo";

export type IssueStatus =
  | "submitted" | "under_review" | "verification_pending" | "verified"
  | "escalated" | "public_campaign" | "followup_pending" | "resolved" | "closed";

export type IssueCategory =
  | "stray_dog" | "waste" | "water" | "road" | "streetlight" | "drainage"
  | "health" | "service_delay" | "central_scheme" | "development" | "other";

export type Urgency = "low" | "medium" | "high" | "critical";

export type Issue = {
  id: string;
  token: string;
  title: { ml: string; en: string };
  description: { ml: string; en: string };
  category: IssueCategory;
  urgency: Urgency;
  status: IssueStatus;
  districtId: string;
  constituencyId: string;
  panchayatId: string;
  ward: string;
  landmark: { ml: string; en: string };
  reporter: { name: string; mobile: string; whatsapp: boolean };
  publicVisible: boolean;
  publicInterest: number;     // 0-100
  supportCount: number;
  clusterId?: string;         // duplicate cluster id
  assignedTo?: string;        // volunteer name
  escalationNote?: { ml: string; en: string };
  createdAt: string;
  updatedAt: string;
  photoSeed: number;          // for placeholder color
  timeline: { status: IssueStatus; at: string; note?: { ml: string; en: string } }[];
};

const categoryTitles: Record<IssueCategory, { ml: string; en: string; descML: string; descEN: string }[]> = {
  stray_dog: [
    { ml: "തെരുവുനായ ആക്രമണം", en: "Stray dog attack", descML: "സ്കൂൾ സമയത്ത് കുട്ടികൾക്ക് നേരെ ആക്രമണം.", descEN: "Repeated attacks on children during school hours." },
    { ml: "തെരുവുനായ കൂട്ടം", en: "Stray dog pack", descML: "രാത്രി കാലങ്ങളിൽ കൂട്ടം കൂടി ശല്യം.", descEN: "Pack of dogs roaming at night." },
  ],
  waste: [
    { ml: "മാലിന്യം നിറഞ്ഞ പൊതുസ്ഥലം", en: "Garbage dump in public space", descML: "ദിവസങ്ങളായി മാലിന്യം നീക്കിയിട്ടില്ല.", descEN: "Garbage not cleared for days." },
    { ml: "പ്ലാസ്റ്റിക് കത്തിക്കൽ", en: "Open plastic burning", descML: "ദുർഗന്ധവും പുകയും.", descEN: "Smoke and stench from burning plastic." },
  ],
  water: [
    { ml: "കുടിവെള്ളം ലഭ്യമല്ല", en: "No drinking water supply", descML: "ഒരാഴ്ചയായി പൈപ്പിൽ വെള്ളമില്ല.", descEN: "No pipe water for a week." },
    { ml: "മലിനജലം ടാപ്പിൽ", en: "Contaminated tap water", descML: "ടാപ്പിൽ നിന്നു മഞ്ഞ വെള്ളം.", descEN: "Yellow water from the tap." },
  ],
  road: [
    { ml: "റോഡിൽ വലിയ കുഴികൾ", en: "Major potholes on road", descML: "വാഹനാപകടങ്ങൾ പതിവ്.", descEN: "Frequent vehicle accidents." },
    { ml: "റോഡ് വശങ്ങൾ ഇടിഞ്ഞു", en: "Road shoulder collapsed", descML: "മഴയ്ക്കു ശേഷം ഇടിഞ്ഞു.", descEN: "Collapsed after the rains." },
  ],
  streetlight: [
    { ml: "സ്ട്രീറ്റ് ലൈറ്റ് കത്തുന്നില്ല", en: "Streetlights not working", descML: "മാസങ്ങളായി ഇരുട്ടിലാണ്.", descEN: "Whole stretch dark for months." },
  ],
  drainage: [
    { ml: "ഡ്രെയിനേജ് കവിഞ്ഞൊഴുകുന്നു", en: "Drainage overflowing", descML: "റോഡിലേക്ക് മലിനജലം ഒഴുകുന്നു.", descEN: "Sewage flowing onto road." },
  ],
  health: [
    { ml: "ഡെങ്കിപ്പനി പടരുന്നു", en: "Dengue outbreak", descML: "പ്രദേശത്ത് നിരവധി കേസുകൾ.", descEN: "Several cases reported locally." },
  ],
  service_delay: [
    { ml: "സർട്ടിഫിക്കറ്റ് കാലതാമസം", en: "Certificate delay", descML: "അക്ഷയ കേന്ദ്രത്തിൽ മാസങ്ങളായി പെൻഡിംഗ്.", descEN: "Akshaya request pending for months." },
    { ml: "റേഷൻ കാർഡ് അപ്ഡേറ്റ് ലഭിക്കുന്നില്ല", en: "Ration card update not received", descML: "സപ്ലൈ ഓഫീസിൽ ഉത്തരം ഇല്ല.", descEN: "No response from supply office." },
  ],
  central_scheme: [
    { ml: "PM-Kisan തുക ലഭിച്ചില്ല", en: "PM-Kisan amount not received", descML: "നാല് ഗഡുക്കൾ കിട്ടിയിട്ടില്ല.", descEN: "Four instalments pending." },
  ],
  development: [
    { ml: "പുതിയ ബസ് സ്റ്റോപ്പ് ആവശ്യം", en: "New bus stop requested", descML: "സ്കൂൾ കുട്ടികൾക്കായി ആവശ്യം.", descEN: "Needed for school children." },
  ],
  other: [
    { ml: "പൊതു ഇടത്തെ കൈയേറ്റം", en: "Public land encroachment", descML: "പൊതുവഴിയിൽ കൈയേറ്റം.", descEN: "Encroachment on public path." },
  ],
};

const reporterNames = ["രമേശ് കുമാർ", "സന്ധ്യ ദേവി", "അനിൽ കുമാർ", "ലത മേനോൻ", "സുരേഷ് നായർ", "ദീപ വർമ്മ", "രാജു മേനോൻ", "ജയ ഭാസ്കരൻ", "ബിജു തോമസ്", "ശ്രീലത"];
const statuses: IssueStatus[] = ["submitted", "under_review", "verification_pending", "verified", "escalated", "public_campaign", "followup_pending", "resolved", "closed"];
const urgencies: Urgency[] = ["low", "medium", "high", "critical"];
const volunteers = ["അരുൺ വി.", "സ്മിത മേനോൻ", "ദിനേശ് കെ.", "പ്രിയ രാജൻ", "ഷിജു സി.", "നിത്യ ജോസഫ്", "വിനോദ് കുമാർ"];
const landmarks = [
  { ml: "സർക്കാർ സ്കൂളിന് സമീപം", en: "Near government school" },
  { ml: "ബസ് സ്റ്റാൻഡിന് അരികിൽ", en: "Beside bus stand" },
  { ml: "പഞ്ചായത്ത് ഓഫീസിന് എതിർവശം", en: "Opposite panchayat office" },
  { ml: "ക്ഷേത്രത്തിന് സമീപം", en: "Near the temple" },
  { ml: "ജംഗ്ഷനിൽ", en: "At the junction" },
];

function hash(n: number) {
  let x = (n * 9301 + 49297) % 233280;
  return x / 233280;
}
function pick<T>(arr: T[], n: number): T { return arr[Math.floor(hash(n) * arr.length)]; }

function daysAgo(d: number): string {
  const ts = Date.now() - d * 86400000;
  return new Date(ts).toISOString();
}

export const issues: Issue[] = Array.from({ length: 100 }, (_, i) => {
  const cats = Object.keys(categoryTitles) as IssueCategory[];
  const category = cats[i % cats.length];
  const titleVariants = categoryTitles[category];
  const tv = titleVariants[i % titleVariants.length];
  const d = districts[i % districts.length];
  const districtPanchayats = panchayats.filter((p) => p.districtId === d.id);
  const displayPanchayats = districtPanchayats.filter(
    (p) =>
      p.en.toLowerCase() !== d.en.toLowerCase() &&
      p.ml !== d.ml
  );
  const safePanchayats = displayPanchayats.length > 0 ? displayPanchayats : districtPanchayats;
  const p = safePanchayats[Math.floor(i / districts.length) % safePanchayats.length];
  const c = constituencies.find((x) => x.districtId === d.id)!;
  const status = statuses[Math.floor(hash(i + 7) * statuses.length)];
  const urgency = urgencies[Math.floor(hash(i + 13) * urgencies.length)];
  const created = Math.floor(hash(i + 3) * 60) + 1;
  const lm = landmarks[i % landmarks.length];

  const statusIndex = statuses.indexOf(status);
  const timeline = statuses.slice(0, statusIndex + 1).map((s, k) => ({
    status: s,
    at: daysAgo(created - k * Math.max(1, Math.floor(created / (statusIndex + 1)))),
  }));

  return {
    id: `ISS-${String(i + 1).padStart(4, "0")}`,
    token: `VK${(100000 + i * 37).toString(36).toUpperCase()}`,
    title: { ml: tv.ml, en: tv.en },
    description: { ml: tv.descML, en: tv.descEN },
    category,
    urgency,
    status,
    districtId: d.id,
    constituencyId: c.id,
    panchayatId: p.id,
    ward: String(((i * 3) % 20) + 1),
    landmark: lm,
    reporter: {
      name: pick(reporterNames, i + 1),
      mobile: `9${String(400000000 + i * 137).slice(0, 9)}`,
      whatsapp: i % 3 !== 0,
    },
    publicVisible: i % 7 !== 0,
    publicInterest: 30 + Math.floor(hash(i + 19) * 70),
    supportCount: Math.floor(hash(i + 23) * 240),
    clusterId: i % 9 === 0 ? `CL-${Math.floor(i / 9) + 1}` : undefined,
    assignedTo: statusIndex >= 2 ? pick(volunteers, i) : undefined,
    escalationNote: statusIndex >= 4
      ? { ml: "ജില്ലാ ഓഫീസിലേക്ക് കൈമാറി. ഫോളോ-അപ്പ് തുടരുന്നു.", en: "Escalated to district office. Follow-up ongoing." }
      : undefined,
    createdAt: daysAgo(created),
    updatedAt: daysAgo(Math.max(0, created - statusIndex)),
    photoSeed: i,
    timeline,
  };
});

export function getCategoryCounts() {
  const map = new Map<IssueCategory, number>();
  issues.forEach((i) => map.set(i.category, (map.get(i.category) ?? 0) + 1));
  return map;
}

export function getStatusCounts() {
  const map = new Map<IssueStatus, number>();
  issues.forEach((i) => map.set(i.status, (map.get(i.status) ?? 0) + 1));
  return map;
}