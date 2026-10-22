import { districts, constituencies, panchayats } from "./geo";

export type Volunteer = {
  id: string;
  name: string;
  mobile: string;
  role: "panchayat" | "constituency" | "district";
  districtId: string;
  constituencyId: string;
  panchayatId: string;
  active: boolean;
  joinedAt: string;
};

const names = ["അരുൺ", "സ്മിത", "ദിനേശ്", "പ്രിയ", "ഷിജു", "നിത്യ", "വിനോദ്", "സജി", "സന്തോഷ്", "രേഖ"];
const surnames = ["വി.", "മേനോൻ", "കെ.", "ജോസഫ്", "നായർ", "സി.", "കുമാർ", "രാജൻ"];
const roles: Volunteer["role"][] = ["panchayat", "constituency", "district"];

export const volunteers: Volunteer[] = Array.from({ length: 50 }, (_, i) => {
  const c = constituencies[i % constituencies.length];
  const p = panchayats.find((x) => x.districtId === c.districtId)!;
  return {
    id: `VOL-${String(i + 1).padStart(4, "0")}`,
    name: `${names[i % names.length]} ${surnames[i % surnames.length]}`,
    mobile: `9${String(400000000 + i * 311).slice(0, 9)}`,
    role: roles[i % roles.length],
    districtId: c.districtId,
    constituencyId: c.id,
    panchayatId: p.id,
    active: i % 8 !== 0,
    joinedAt: new Date(Date.now() - i * 7 * 86400000).toISOString(),
  };
});

export const successStories = [
  { id: "ss1", title: { ml: "കുണ്ടറയിൽ കുടിവെള്ള പ്രശ്നം പരിഹരിച്ചു", en: "Drinking water issue resolved in Kundara" }, days: 18, district: "klm", category: "water" },
  { id: "ss2", title: { ml: "ചാത്തന്നൂരിൽ തെരുവുനായ നിയന്ത്രണം", en: "Stray dog control drive in Chathannoor" }, days: 22, district: "klm", category: "stray_dog" },
  { id: "ss3", title: { ml: "ആലുവയിൽ റോഡ് നന്നാക്കി", en: "Road repaired in Aluva" }, days: 30, district: "ekm", category: "road" },
  { id: "ss4", title: { ml: "തിരൂരിൽ സ്ട്രീറ്റ് ലൈറ്റ് പുനഃസ്ഥാപിച്ചു", en: "Streetlights restored in Tirur" }, days: 12, district: "mlp", category: "streetlight" },
  { id: "ss5", title: { ml: "കോട്ടയത്ത് ഡ്രെയിനേജ് വൃത്തിയാക്കി", en: "Drainage cleaned in Kottayam" }, days: 9, district: "ktm", category: "drainage" },
  { id: "ss6", title: { ml: "പാലക്കാട് മാലിന്യ സംസ്കരണം", en: "Waste management in Palakkad" }, days: 25, district: "pkd", category: "waste" },
] as const;

export const whatsappCampaigns = [
  { id: "wc1", name: { ml: "PM-Kisan ഓർമ്മപ്പെടുത്തൽ", en: "PM-Kisan reminder" }, sent: 12400, delivered: 12290, read: 9120, date: "2026-06-12" },
  { id: "wc2", name: { ml: "ജനശബ്ദം — കുടിവെള്ളം", en: "Janashabdam — Water" }, sent: 8800, delivered: 8730, read: 6210, date: "2026-06-15" },
  { id: "wc3", name: { ml: "വോളണ്ടിയർ മീറ്റിംഗ്", en: "Volunteer meet-up" }, sent: 2300, delivered: 2280, read: 1900, date: "2026-06-18" },
  { id: "wc4", name: { ml: "Ayushman Bharat ക്യാമ്പ്", en: "Ayushman Bharat camp" }, sent: 5600, delivered: 5530, read: 3990, date: "2026-06-20" },
  { id: "wc5", name: { ml: "ഉജ്ജ്വല LPG ക്യാമ്പ്", en: "Ujjwala LPG camp" }, sent: 4400, delivered: 4360, read: 3210, date: "2026-06-21" },
  { id: "wc6", name: { ml: "Mudra വായ്പ ബോധവൽക്കരണം", en: "Mudra loan awareness" }, sent: 3100, delivered: 3060, read: 2120, date: "2026-06-22" },
  { id: "wc7", name: { ml: "സംസ്ഥാന കാമ്പയിൻ", en: "State campaign" }, sent: 18900, delivered: 18700, read: 12300, date: "2026-06-23" },
  { id: "wc8", name: { ml: "ജനശബ്ദം — റോഡ്", en: "Janashabdam — Roads" }, sent: 6200, delivered: 6150, read: 4400, date: "2026-06-24" },
];

export const auditLog = [
  { id: 1, who: "State Admin", action: "Verified issue ISS-0012", at: "2026-06-23 10:14" },
  { id: 2, who: "District Lead — Kollam", action: "Escalated ISS-0021 to municipality", at: "2026-06-23 11:02" },
  { id: 3, who: "Panchayat Volunteer — Aluva", action: "Marked ISS-0033 verification pending", at: "2026-06-23 12:48" },
  { id: 4, who: "State Admin", action: "Generated WhatsApp campaign #wc8", at: "2026-06-24 09:20" },
  { id: 5, who: "Constituency Worker — Nemom", action: "Assigned ISS-0044 to volunteer Arun V.", at: "2026-06-24 10:01" },
];