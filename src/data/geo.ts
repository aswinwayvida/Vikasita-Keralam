export type District = { id: string; ml: string; en: string };
export type Constituency = { id: string; districtId: string; ml: string; en: string };
export type Panchayat = { id: string; districtId: string; constituencyId: string; ml: string; en: string; type: "panchayat" | "municipality" | "corporation" };

export const districts: District[] = [
  { id: "tvm", ml: "തിരുവനന്തപുരം", en: "Thiruvananthapuram" },
  { id: "klm", ml: "കൊല്ലം", en: "Kollam" },
  { id: "ptm", ml: "പത്തനംതിട്ട", en: "Pathanamthitta" },
  { id: "alp", ml: "ആലപ്പുഴ", en: "Alappuzha" },
  { id: "ktm", ml: "കോട്ടയം", en: "Kottayam" },
  { id: "idk", ml: "ഇടുക്കി", en: "Idukki" },
  { id: "ekm", ml: "എറണാകുളം", en: "Ernakulam" },
  { id: "tsr", ml: "തൃശ്ശൂർ", en: "Thrissur" },
  { id: "pkd", ml: "പാലക്കാട്", en: "Palakkad" },
  { id: "mlp", ml: "മലപ്പുറം", en: "Malappuram" },
  { id: "kkd", ml: "കോഴിക്കോട്", en: "Kozhikode" },
  { id: "wyd", ml: "വയനാട്", en: "Wayanad" },
  { id: "knr", ml: "കണ്ണൂർ", en: "Kannur" },
  { id: "ksd", ml: "കാസർഗോഡ്", en: "Kasaragod" },
];

export const constituencies: Constituency[] = [
  { id: "tvm-c1", districtId: "tvm", ml: "തിരുവനന്തപുരം", en: "Thiruvananthapuram" },
  { id: "tvm-c2", districtId: "tvm", ml: "നേമം", en: "Nemom" },
  { id: "tvm-c3", districtId: "tvm", ml: "കഴക്കൂട്ടം", en: "Kazhakkoottam" },
  { id: "klm-c1", districtId: "klm", ml: "കൊല്ലം", en: "Kollam" },
  { id: "klm-c2", districtId: "klm", ml: "ചവറ", en: "Chavara" },
  { id: "ptm-c1", districtId: "ptm", ml: "പത്തനംതിട്ട", en: "Pathanamthitta" },
  { id: "alp-c1", districtId: "alp", ml: "ആലപ്പുഴ", en: "Alappuzha" },
  { id: "ktm-c1", districtId: "ktm", ml: "കോട്ടയം", en: "Kottayam" },
  { id: "idk-c1", districtId: "idk", ml: "ഇടുക്കി", en: "Idukki" },
  { id: "ekm-c1", districtId: "ekm", ml: "എറണാകുളം", en: "Ernakulam" },
  { id: "ekm-c2", districtId: "ekm", ml: "ത്രിപ്പൂണിത്തുറ", en: "Tripunithura" },
  { id: "ekm-c3", districtId: "ekm", ml: "കളമശ്ശേരി", en: "Kalamassery" },
  { id: "tsr-c1", districtId: "tsr", ml: "തൃശ്ശൂർ", en: "Thrissur" },
  { id: "pkd-c1", districtId: "pkd", ml: "പാലക്കാട്", en: "Palakkad" },
  { id: "mlp-c1", districtId: "mlp", ml: "മലപ്പുറം", en: "Malappuram" },
  { id: "kkd-c1", districtId: "kkd", ml: "കോഴിക്കോട് നോർത്ത്", en: "Kozhikode North" },
  { id: "kkd-c2", districtId: "kkd", ml: "കോഴിക്കോട് സൗത്ത്", en: "Kozhikode South" },
  { id: "wyd-c1", districtId: "wyd", ml: "കൽപ്പറ്റ", en: "Kalpetta" },
  { id: "knr-c1", districtId: "knr", ml: "കണ്ണൂർ", en: "Kannur" },
  { id: "ksd-c1", districtId: "ksd", ml: "കാസർഗോഡ്", en: "Kasaragod" },
];

// District → 5 representative areas (panchayat/municipality/corporation).
// Every entry stays within its real Kerala district to avoid mismatched pairings.
const districtAreas: Record<string, Array<[string, string]>> = {
  tvm: [["വട്ടിയൂർക്കാവ്","Vattiyoorkavu"],["കഴക്കൂട്ടം","Kazhakkoottam"],["നേമം","Nemom"],["ആറ്റിങ്ങൽ","Attingal"],["വർക്കല","Varkala"]],
  klm: [["കൊല്ലം","Kollam"],["ചവറ","Chavara"],["കരുനാഗപ്പള്ളി","Karunagappally"],["കുണ്ടറ","Kundara"],["ചാത്തന്നൂർ","Chathannoor"]],
  ptm: [["പത്തനംതിട്ട","Pathanamthitta"],["കൊന്നി","Konni"],["റാന്നി","Ranni"],["തിരുവല്ല","Thiruvalla"],["അടൂർ","Adoor"]],
  alp: [["ആലപ്പുഴ","Alappuzha"],["ചേർത്തല","Cherthala"],["അമ്പലപ്പുഴ","Ambalappuzha"],["കായംകുളം","Kayamkulam"],["മാവേലിക്കര","Mavelikara"]],
  ktm: [["കോട്ടയം","Kottayam"],["ചങ്ങനാശ്ശേരി","Changanassery"],["വൈക്കം","Vaikom"],["ഏറ്റുമാനൂർ","Ettumanoor"],["പാലാ","Pala"]],
  idk: [["തൊടുപുഴ","Thodupuzha"],["കട്ടപ്പന","Kattappana"],["മൂന്നാർ","Munnar"],["അടിമാലി","Adimali"],["കുമിളി","Kumily"]],
  ekm: [["എറണാകുളം","Ernakulam"],["ആലുവ","Aluva"],["കളമശ്ശേരി","Kalamassery"],["തൃപ്പൂണിത്തുറ","Tripunithura"],["പെരുമ്പാവൂർ","Perumbavoor"]],
  tsr: [["തൃശ്ശൂർ","Thrissur"],["ഗുരുവായൂർ","Guruvayoor"],["ചാലക്കുടി","Chalakudy"],["ഇരിങ്ങാലക്കുട","Irinjalakuda"],["കുന്നംകുളം","Kunnamkulam"]],
  pkd: [["പാലക്കാട്","Palakkad"],["ഒറ്റപ്പാലം","Ottapalam"],["ചിറ്റൂർ","Chittur"],["മണ്ണാർക്കാട്","Mannarkkad"],["ആലത്തൂർ","Alathur"]],
  mlp: [["മലപ്പുറം","Malappuram"],["തിരൂർ","Tirur"],["പൊന്നാനി","Ponnani"],["കൊണ്ടോട്ടി","Kondotty"],["മഞ്ചേരി","Manjeri"]],
  kkd: [["കോഴിക്കോട്","Kozhikode"],["ബേപ്പൂർ","Beypore"],["കൊയിലാണ്ടി","Koyilandy"],["വടകര","Vatakara"],["ബാലുശ്ശേരി","Balussery"]],
  wyd: [["കൽപ്പറ്റ","Kalpetta"],["മാനന്തവാടി","Mananthavady"],["സുൽത്താൻ ബത്തേരി","Sultan Bathery"],["വൈത്തിരി","Vythiri"],["മേപ്പാടി","Meppadi"]],
  knr: [["കണ്ണൂർ","Kannur"],["തലശ്ശേരി","Thalassery"],["പയ്യന്നൂർ","Payyannur"],["മട്ടന്നൂർ","Mattannur"],["കൂത്തുപറമ്പ്","Koothuparamba"]],
  ksd: [["കാസർഗോഡ്","Kasaragod"],["കാഞ്ഞങ്ങാട്","Kanhangad"],["മഞ്ചേശ്വരം","Manjeshwaram"],["ഉദുമ","Uduma"],["ബേക്കൽ","Bekal"]],
};

export const panchayats: Panchayat[] = districts.flatMap((d) => {
  const firstConstituency = constituencies.find((c) => c.districtId === d.id)!;
  return districtAreas[d.id].map(([ml, en], j) => ({
    id: `${d.id}-a${j + 1}`,
    districtId: d.id,
    constituencyId: firstConstituency.id,
    ml,
    en,
    type: (j === 0 ? "corporation" : j === 1 ? "municipality" : "panchayat") as Panchayat["type"],
  }));
});

export const wards = Array.from({ length: 20 }, (_, i) => ({ id: `w${i + 1}`, label: `${i + 1}` }));

export function getDistrictName(id: string, lang: "ml" | "en") {
  const d = districts.find((x) => x.id === id);
  return d ? d[lang] : id;
}
export function getConstituencyName(id: string, lang: "ml" | "en") {
  const c = constituencies.find((x) => x.id === id);
  return c ? c[lang] : id;
}
export function getPanchayatName(id: string, lang: "ml" | "en") {
  const p = panchayats.find((x) => x.id === id);
  return p ? p[lang] : id;
}