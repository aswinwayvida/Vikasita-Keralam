/** Department assignments for the mobile preview's sample schemes. */
export const MOBILE_SAMPLE_DEPARTMENTS = [
  { id: "agriculture", en: "Agriculture & Farmers Welfare", ml: "കൃഷി & കർഷകക്ഷേമം" },
  { id: "finance", en: "Financial Services & Pension", ml: "ധനകാര്യ സേവനങ്ങളും പെൻഷനും" },
  { id: "education", en: "Education", ml: "വിദ്യാഭ്യാസം" },
  { id: "health", en: "Health & Family Welfare", ml: "ആരോഗ്യ & കുടുംബക്ഷേമം" },
  { id: "housing", en: "Housing & Urban Affairs", ml: "ഭവന & നഗരകാര്യങ്ങൾ" },
  { id: "welfare", en: "Social Welfare", ml: "സാമൂഹിക ക്ഷേമം" },
] as const;

export const MOBILE_SAMPLE_SCHEME_DEPARTMENT: Record<string, string> = {
  pm_kisan: "agriculture", pmfby: "agriculture", kcc: "agriculture",
  pm_jan_dhan: "finance", atal_pension: "finance", pmjjby: "finance", pmsby: "finance",
  pm_svanidhi: "housing", mudra: "finance", pm_vishwakarma: "finance",
  pm_yasasvi: "education", post_matric_sc: "education", pm_vidyalaxmi: "education",
  pm_jay: "health", dialysis_prog: "health", digital_health: "health",
  pmay_g: "housing", pmay_u: "housing", pm_surya_ghar: "housing", pm_ujjwala: "welfare",
  pm_garib_kalyan: "welfare", ignoaps: "welfare",
};
