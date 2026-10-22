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
  // 1. Kasaragod (ksd) - 5
  { id: "ksd-c1", districtId: "ksd", ml: "മഞ്ചേശ്വരം", en: "Manjeshwar" },
  { id: "ksd-c2", districtId: "ksd", ml: "കാസർഗോഡ്", en: "Kasaragod" },
  { id: "ksd-c3", districtId: "ksd", ml: "ഉദുമ", en: "Udma" },
  { id: "ksd-c4", districtId: "ksd", ml: "കാഞ്ഞങ്ങാട്", en: "Kanhangad" },
  { id: "ksd-c5", districtId: "ksd", ml: "തൃക്കരിപ്പൂർ", en: "Trikaripur" },

  // 2. Kannur (knr) - 11
  { id: "knr-c1", districtId: "knr", ml: "പയ്യന്നൂർ", en: "Payyanur" },
  { id: "knr-c2", districtId: "knr", ml: "കല്യാശ്ശേരി", en: "Kalliasseri" },
  { id: "knr-c3", districtId: "knr", ml: "തളിപ്പറമ്പ്", en: "Taliparamba" },
  { id: "knr-c4", districtId: "knr", ml: "ഇരിക്കൂർ", en: "Irikkur" },
  { id: "knr-c5", districtId: "knr", ml: "അഴീക്കോട്", en: "Azhikode" },
  { id: "knr-c6", districtId: "knr", ml: "കണ്ണൂർ", en: "Kannur" },
  { id: "knr-c7", districtId: "knr", ml: "ധർമ്മടം", en: "Dharmadom" },
  { id: "knr-c8", districtId: "knr", ml: "തലശ്ശേരി", en: "Thalassery" },
  { id: "knr-c9", districtId: "knr", ml: "കൂത്തുപറമ്പ്", en: "Kuthuparamba" },
  { id: "knr-c10", districtId: "knr", ml: "മട്ടന്നൂർ", en: "Mattannur" },
  { id: "knr-c11", districtId: "knr", ml: "പേരാവൂർ", en: "Peravoor" },

  // 3. Wayanad (wyd) - 3
  { id: "wyd-c1", districtId: "wyd", ml: "മാനന്തവാടി", en: "Mananthavady" },
  { id: "wyd-c2", districtId: "wyd", ml: "സുൽത്താൻ ബത്തേരി", en: "Sulthan Bathery" },
  { id: "wyd-c3", districtId: "wyd", ml: "കൽപ്പറ്റ", en: "Kalpetta" },

  // 4. Kozhikode (kkd) - 13
  { id: "kkd-c1", districtId: "kkd", ml: "വടകര", en: "Vadakara" },
  { id: "kkd-c2", districtId: "kkd", ml: "കുറ്റ്യാടി", en: "Kuttiadi" },
  { id: "kkd-c3", districtId: "kkd", ml: "നാദാപുരം", en: "Nadapuram" },
  { id: "kkd-c4", districtId: "kkd", ml: "കൊയിലാണ്ടി", en: "Koyilandy" },
  { id: "kkd-c5", districtId: "kkd", ml: "പേരാമ്പ്ര", en: "Perambra" },
  { id: "kkd-c6", districtId: "kkd", ml: "ബാലുശ്ശേരി", en: "Balussery" },
  { id: "kkd-c7", districtId: "kkd", ml: "എലത്തൂർ", en: "Elathur" },
  { id: "kkd-c8", districtId: "kkd", ml: "കോഴിക്കോട് നോർത്ത്", en: "Kozhikode North" },
  { id: "kkd-c9", districtId: "kkd", ml: "കോഴിക്കോട് സൗത്ത്", en: "Kozhikode South" },
  { id: "kkd-c10", districtId: "kkd", ml: "ബേപ്പൂർ", en: "Beypore" },
  { id: "kkd-c11", districtId: "kkd", ml: "കുന്ദമംഗലം", en: "Kunnamangalam" },
  { id: "kkd-c12", districtId: "kkd", ml: "കൊടുവള്ളി", en: "Koduvally" },
  { id: "kkd-c13", districtId: "kkd", ml: "തിരുവമ്പാടി", en: "Thiruvambady" },

  // 5. Malappuram (mlp) - 16
  { id: "mlp-c1", districtId: "mlp", ml: "കൊണ്ടോട്ടി", en: "Kondotty" },
  { id: "mlp-c2", districtId: "mlp", ml: "ഏറനാട്", en: "Eranad" },
  { id: "mlp-c3", districtId: "mlp", ml: "നിലമ്പൂർ", en: "Nilambur" },
  { id: "mlp-c4", districtId: "mlp", ml: "വണ്ടൂർ", en: "Wandoor" },
  { id: "mlp-c5", districtId: "mlp", ml: "മഞ്ചേരി", en: "Manjeri" },
  { id: "mlp-c6", districtId: "mlp", ml: "പെരിന്തൽമണ്ണ", en: "Perinthalmanna" },
  { id: "mlp-c7", districtId: "mlp", ml: "മങ്കട", en: "Mankada" },
  { id: "mlp-c8", districtId: "mlp", ml: "മലപ്പുറം", en: "Malappuram" },
  { id: "mlp-c9", districtId: "mlp", ml: "വേങ്ങര", en: "Vengara" },
  { id: "mlp-c10", districtId: "mlp", ml: "വള്ളിക്കുന്ന്", en: "Vallikkunnu" },
  { id: "mlp-c11", districtId: "mlp", ml: "തിരൂരങ്ങാടി", en: "Tirurangadi" },
  { id: "mlp-c12", districtId: "mlp", ml: "താനൂർ", en: "Tanur" },
  { id: "mlp-c13", districtId: "mlp", ml: "തിരൂർ", en: "Tirur" },
  { id: "mlp-c14", districtId: "mlp", ml: "കോട്ടക്കൽ", en: "Kottakkal" },
  { id: "mlp-c15", districtId: "mlp", ml: "തവന്നൂർ", en: "Thavanur" },
  { id: "mlp-c16", districtId: "mlp", ml: "പൊന്നാനി", en: "Ponnani" },

  // 6. Palakkad (pkd) - 12
  { id: "pkd-c1", districtId: "pkd", ml: "തൃത്താല", en: "Thrithala" },
  { id: "pkd-c2", districtId: "pkd", ml: "പട്ടാമ്പി", en: "Pattambi" },
  { id: "pkd-c3", districtId: "pkd", ml: "ഷൊർണ്ണൂർ", en: "Shornur" },
  { id: "pkd-c4", districtId: "pkd", ml: "ഒറ്റപ്പാലം", en: "Ottapalam" },
  { id: "pkd-c5", districtId: "pkd", ml: "കോങ്ങാട്", en: "Kongad" },
  { id: "pkd-c6", districtId: "pkd", ml: "മണ്ണാർക്കാട്", en: "Mannarkkad" },
  { id: "pkd-c7", districtId: "pkd", ml: "മലമ്പുഴ", en: "Malampuzha" },
  { id: "pkd-c8", districtId: "pkd", ml: "പാലക്കാട്", en: "Palakkad" },
  { id: "pkd-c9", districtId: "pkd", ml: "തരൂർ", en: "Tarur" },
  { id: "pkd-c10", districtId: "pkd", ml: "ചിറ്റൂർ", en: "Chittur" },
  { id: "pkd-c11", districtId: "pkd", ml: "നെന്മാറ", en: "Nenmara" },
  { id: "pkd-c12", districtId: "pkd", ml: "ആലത്തൂർ", en: "Alathur" },

  // 7. Thrissur (tsr) - 13
  { id: "tsr-c1", districtId: "tsr", ml: "ചേലക്കര", en: "Chelakkara" },
  { id: "tsr-c2", districtId: "tsr", ml: "കുന്നംകുളം", en: "Kunnamkulam" },
  { id: "tsr-c3", districtId: "tsr", ml: "ഗുരുവായൂർ", en: "Guruvayur" },
  { id: "tsr-c4", districtId: "tsr", ml: "മണലൂർ", en: "Manalur" },
  { id: "tsr-c5", districtId: "tsr", ml: "വടക്കാഞ്ചേരി", en: "Wadakkanchery" },
  { id: "tsr-c6", districtId: "tsr", ml: "ഒല്ലൂർ", en: "Ollur" },
  { id: "tsr-c7", districtId: "tsr", ml: "തൃശ്ശൂർ", en: "Thrissur" },
  { id: "tsr-c8", districtId: "tsr", ml: "നാട്ടിക", en: "Natika" },
  { id: "tsr-c9", districtId: "tsr", ml: "കൈപമംഗലം", en: "Kaipamangalam" },
  { id: "tsr-c10", districtId: "tsr", ml: "ഇരിങ്ങാലക്കുട", en: "Irinjalakuda" },
  { id: "tsr-c11", districtId: "tsr", ml: "പുതുക്കാട്", en: "Puthukkad" },
  { id: "tsr-c12", districtId: "tsr", ml: "ചാലക്കുടി", en: "Chalakudy" },
  { id: "tsr-c13", districtId: "tsr", ml: "കൊടുങ്ങല്ലൂർ", en: "Kodungallur" },

  // 8. Ernakulam (ekm) - 14
  { id: "ekm-c1", districtId: "ekm", ml: "പെരുമ്പാവൂർ", en: "Perumbavoor" },
  { id: "ekm-c2", districtId: "ekm", ml: "അങ്കമാലി", en: "Angamaly" },
  { id: "ekm-c3", districtId: "ekm", ml: "ആലുവ", en: "Aluva" },
  { id: "ekm-c4", districtId: "ekm", ml: "കളമശ്ശേരി", en: "Kalamassery" },
  { id: "ekm-c5", districtId: "ekm", ml: "പറവൂർ", en: "Paravur" },
  { id: "ekm-c6", districtId: "ekm", ml: "വൈപ്പിൻ", en: "Vypin" },
  { id: "ekm-c7", districtId: "ekm", ml: "കൊച്ചി", en: "Kochi" },
  { id: "ekm-c8", districtId: "ekm", ml: "എറണാകുളം", en: "Ernakulam" },
  { id: "ekm-c9", districtId: "ekm", ml: "തൃക്കാക്കര", en: "Thrikkakara" },
  { id: "ekm-c10", districtId: "ekm", ml: "കുന്നത്ത്നാട്", en: "Kunnathunad" },
  { id: "ekm-c11", districtId: "ekm", ml: "പിറവം", en: "Piravom" },
  { id: "ekm-c12", districtId: "ekm", ml: "മൂവാറ്റുപുഴ", en: "Muvattupuzha" },
  { id: "ekm-c13", districtId: "ekm", ml: "കോതമംഗലം", en: "Kothamangalam" },
  { id: "ekm-c14", districtId: "ekm", ml: "ത്രിപ്പൂണിത്തുറ", en: "Tripunithura" },

  // 9. Idukki (idk) - 5
  { id: "idk-c1", districtId: "idk", ml: "ദേവികുളം", en: "Devikulam" },
  { id: "idk-c2", districtId: "idk", ml: "ഉടുമ്പഞ്ചോല", en: "Udumbanchola" },
  { id: "idk-c3", districtId: "idk", ml: "തൊടുപുഴ", en: "Thodupuzha" },
  { id: "idk-c4", districtId: "idk", ml: "ഇടുക്കി", en: "Idukki" },
  { id: "idk-c5", districtId: "idk", ml: "പീരുമേട്", en: "Peerumade" },

  // 10. Kottayam (ktm) - 9
  { id: "ktm-c1", districtId: "ktm", ml: "പാലാ", en: "Pala" },
  { id: "ktm-c2", districtId: "ktm", ml: "കടുത്തുരുത്തി", en: "Kaduthuruthy" },
  { id: "ktm-c3", districtId: "ktm", ml: "വൈക്കം", en: "Vaikom" },
  { id: "ktm-c4", districtId: "ktm", ml: "ഏറ്റുമാനൂർ", en: "Ettumanoor" },
  { id: "ktm-c5", districtId: "ktm", ml: "കോട്ടയം", en: "Kottayam" },
  { id: "ktm-c6", districtId: "ktm", ml: "പുതുപ്പള്ളി", en: "Puthuppally" },
  { id: "ktm-c7", districtId: "ktm", ml: "ചങ്ങനാശ്ശേരി", en: "Changanassery" },
  { id: "ktm-c8", districtId: "ktm", ml: "കാഞ്ഞിരപ്പള്ളി", en: "Kanjirappally" },
  { id: "ktm-c9", districtId: "ktm", ml: "പൂഞ്ഞാർ", en: "Poonjar" },

  // 11. Alappuzha (alp) - 9
  { id: "alp-c1", districtId: "alp", ml: "അരൂർ", en: "Aroor" },
  { id: "alp-c2", districtId: "alp", ml: "ചേർത്തല", en: "Cherthala" },
  { id: "alp-c3", districtId: "alp", ml: "ആലപ്പുഴ", en: "Alappuzha" },
  { id: "alp-c4", districtId: "alp", ml: "അമ്പലപ്പുഴ", en: "Ambalappuzha" },
  { id: "alp-c5", districtId: "alp", ml: "കുട്ടനാട്", en: "Kuttanad" },
  { id: "alp-c6", districtId: "alp", ml: "ഹരിപ്പാട്", en: "Haripad" },
  { id: "alp-c7", districtId: "alp", ml: "കായംകുളം", en: "Kayamkulam" },
  { id: "alp-c8", districtId: "alp", ml: "മാവേലിക്കര", en: "Mavelikara" },
  { id: "alp-c9", districtId: "alp", ml: "ചെങ്ങന്നൂർ", en: "Chengannur" },

  // 12. Pathanamthitta (ptm) - 5
  { id: "ptm-c1", districtId: "ptm", ml: "തിരുവല്ല", en: "Thiruvalla" },
  { id: "ptm-c2", districtId: "ptm", ml: "റാന്നി", en: "Ranni" },
  { id: "ptm-c3", districtId: "ptm", ml: "ആറന്മുള", en: "Aranmula" },
  { id: "ptm-c4", districtId: "ptm", ml: "കോന്നി", en: "Konni" },
  { id: "ptm-c5", districtId: "ptm", ml: "അടൂർ", en: "Adoor" },

  // 13. Kollam (klm) - 11
  { id: "klm-c1", districtId: "klm", ml: "കരുനാഗപ്പള്ളി", en: "Karunagappally" },
  { id: "klm-c2", districtId: "klm", ml: "ചവറ", en: "Chavara" },
  { id: "klm-c3", districtId: "klm", ml: "കുന്നത്തൂർ", en: "Kunnathur" },
  { id: "klm-c4", districtId: "klm", ml: "കൊട്ടാരക്കര", en: "Kottarakkara" },
  { id: "klm-c5", districtId: "klm", ml: "പത്തനാപുരം", en: "Pathanapuram" },
  { id: "klm-c6", districtId: "klm", ml: "പുനലൂർ", en: "Punalur" },
  { id: "klm-c7", districtId: "klm", ml: "ചടയമംഗലം", en: "Chadayamangalam" },
  { id: "klm-c8", districtId: "klm", ml: "കുണ്ടറ", en: "Kundara" },
  { id: "klm-c9", districtId: "klm", ml: "കൊല്ലം", en: "Kollam" },
  { id: "klm-c10", districtId: "klm", ml: "ഇരവിപുരം", en: "Eravipuram" },
  { id: "klm-c11", districtId: "klm", ml: "ചാത്തന്നൂർ", en: "Chathannoor" },

  // 14. Thiruvananthapuram (tvm) - 14
  { id: "tvm-c1", districtId: "tvm", ml: "വർക്കല", en: "Varkala" },
  { id: "tvm-c2", districtId: "tvm", ml: "ആറ്റിങ്ങൽ", en: "Attingal" },
  { id: "tvm-c3", districtId: "tvm", ml: "ചിറയിൻകീഴ്", en: "Chirayinkeezhu" },
  { id: "tvm-c4", districtId: "tvm", ml: "നെടുമങ്ങാട്", en: "Nedumangad" },
  { id: "tvm-c5", districtId: "tvm", ml: "വാമനപുരം", en: "Vamanapuram" },
  { id: "tvm-c6", districtId: "tvm", ml: "കഴക്കൂട്ടം", en: "Kazhakkoottam" },
  { id: "tvm-c7", districtId: "tvm", ml: "വട്ടിയൂർക്കാവ്", en: "Vattiyoorkavu" },
  { id: "tvm-c8", districtId: "tvm", ml: "തിരുവനന്തപുരം", en: "Thiruvananthapuram" },
  { id: "tvm-c9", districtId: "tvm", ml: "നേമം", en: "Nemom" },
  { id: "tvm-c10", districtId: "tvm", ml: "അരുവിിക്കര", en: "Aruvikkara" },
  { id: "tvm-c11", districtId: "tvm", ml: "പാറശ്ശാല", en: "Parassala" },
  { id: "tvm-c12", districtId: "tvm", ml: "കാട്ടാക്കട", en: "Kattakkada" },
  { id: "tvm-c13", districtId: "tvm", ml: "കോവളം", en: "Kovalam" },
  { id: "tvm-c14", districtId: "tvm", ml: "നെയ്യാറ്റിൻകര", en: "Neyyattinkara" },
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