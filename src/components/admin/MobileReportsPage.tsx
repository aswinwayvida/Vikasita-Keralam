import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  Layers,
  FolderTree,
  ChevronRight,
  ChevronDown,
  FileText,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Inbox,
  FileCheck,
  Send,
  AlertCircle,
  Eye,
  X,
  TrendingUp,
  Award,
  Users,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

export interface MobileReportApplicationRecord {
  ref: string;
  trackingId?: string;
  schemeNameEn: string;
  schemeNameMl: string;
  categoryEn: string;
  categoryMl: string;
  applicantNameEn: string;
  applicantNameMl: string;
  aadhaar?: string;
  phone?: string;
  locationEn?: string;
  locationMl?: string;
  annualIncome?: string;
  appliedDate?: string;
  status: string;
  workflowStatus?: string;
  assistedByEn?: string;
  assistedByMl?: string;
}

export interface MobileReportsPageProps {
  onBack: () => void;
  applications: MobileReportApplicationRecord[];
  onSelectApplication: (application: MobileReportApplicationRecord) => void;
  onOpenApplicationFilter?: () => void;
  isFilterActive?: boolean;
  filterCount?: number;
}

interface SchemeReportDef {
  id: string;
  nameEn: string;
  nameMl: string;
  categoryId: string;
  categoryEn: string;
  categoryMl: string;
  logo: string;
  schemeCount?: number;
}

interface CategoryReportDef {
  id: string;
  nameEn: string;
  nameMl: string;
  icon: string;
  schemesCount: number;
}

type SchemeStatusBucket = "approved" | "in_review" | "pending" | "rejected";
type SchemeWorkView = "my_work" | "team";
type SchemeLocationLevel = "state" | "region" | "org_district" | "mandalam" | "area" | "ward";
type SchemeLocationField = "level" | "region" | "orgDistrict" | "mandalam" | "area" | "ward";

interface SchemeLocationOption {
  value: string;
  en: string;
  ml: string;
}

interface SchemeOrgDistrictOption extends SchemeLocationOption {
  region: string;
}

interface SchemeLocationFilter {
  region: string;
  orgDistrict: string;
  mandalam: string;
  area: string;
  ward: string;
}

interface SchemeFilterState {
  workView: SchemeWorkView;
  statuses: SchemeStatusBucket[];
  locationLevel: SchemeLocationLevel;
  location: SchemeLocationFilter;
}

const createEmptySchemeLocation = (): SchemeLocationFilter => ({
  region: "",
  orgDistrict: "",
  mandalam: "",
  area: "",
  ward: "",
});

const createDefaultSchemeFilter = (): SchemeFilterState => ({
  workView: "team",
  statuses: [],
  locationLevel: "state",
  location: createEmptySchemeLocation(),
});

const REPORT_SCHEMES: SchemeReportDef[] = [
  {
    id: "pm_kisan",
    nameEn: "PM Kisan Samman Nidhi",
    nameMl: "പി.എം. കിസാൻ സമ്മാൻ നിധി",
    categoryId: "agriculture",
    categoryEn: "Agriculture",
    categoryMl: "കൃഷി",
    logo: "/images/popular-schemes/pm_kisan.png",
  },
  {
    id: "pmfby",
    nameEn: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    nameMl: "പ്രധാനമന്ത്രി ഫസൽ ബീമാ യോജന (PMFBY)",
    categoryId: "agriculture",
    categoryEn: "Agriculture",
    categoryMl: "കൃഷി",
    logo: "/images/popular-schemes/pm_kisan.png",
  },
  {
    id: "kcc",
    nameEn: "Kisan Credit Card (KCC) Scheme",
    nameMl: "കിസാൻ ക്രെഡിറ്റ് കാർഡ് (KCC) പദ്ധതി",
    categoryId: "agriculture",
    categoryEn: "Agriculture Credit",
    categoryMl: "കാർഷിക വായ്പ",
    logo: "/images/popular-schemes/pm_kisan.png",
  },
  {
    id: "pm_jan_dhan",
    nameEn: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    nameMl: "പ്രധാനമന്ത്രി ജൻ ധൻ യോജന (PMJDY)",
    categoryId: "banking",
    categoryEn: "Banking",
    categoryMl: "ബാങ്കിംഗ്",
    logo: "/images/popular-schemes/pm_jan_dhan.png",
  },
  {
    id: "atal_pension",
    nameEn: "Atal Pension Yojana (APY)",
    nameMl: "അടൽ പെൻഷൻ യോജന (APY)",
    categoryId: "banking",
    categoryEn: "Banking & Pension",
    categoryMl: "ബാങ്കിംഗ് & പെൻഷൻ",
    logo: "/images/popular-schemes/atal_pension.png",
  },
  {
    id: "pmjjby",
    nameEn: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    nameMl: "പ്രധാനമന്ത്രി ജീവൻ ജ്യോതി ബീമാ യോജന (PMJJBY)",
    categoryId: "banking",
    categoryEn: "Insurance",
    categoryMl: "ഇൻഷുറൻസ്",
    logo: "/images/popular-schemes/pmjjby.png",
  },
  {
    id: "pmsby",
    nameEn: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    nameMl: "പ്രധാനമന്ത്രി സുരക്ഷാ ബീമാ യോജന (PMSBY)",
    categoryId: "banking",
    categoryEn: "Insurance",
    categoryMl: "ഇൻഷുറൻസ്",
    logo: "/images/popular-schemes/pmsby.png",
  },
  {
    id: "pm_svanidhi",
    nameEn: "PM SVANidhi",
    nameMl: "പി.എം സ്വനിധി",
    categoryId: "business",
    categoryEn: "Business",
    categoryMl: "ബിസിനസ്",
    logo: "/images/popular-schemes/stand_up_india.png",
  },
  {
    id: "mudra",
    nameEn: "Pradhan Mantri Mudra Yojana (PMMY)",
    nameMl: "പ്രധാനമന്ത്രി മുദ്രാ യോജന (PMMY)",
    categoryId: "business",
    categoryEn: "Business Loan",
    categoryMl: "ബിസിനസ് വായ്പ",
    logo: "/images/popular-schemes/mudra.png",
  },
  {
    id: "pm_vishwakarma",
    nameEn: "PM Vishwakarma Yojana",
    nameMl: "പി.എം വിശ്വകർമ്മ യോജന",
    categoryId: "business",
    categoryEn: "Business & Skills",
    categoryMl: "ബിസിനസ് & നൈപുണ്യം",
    logo: "/images/popular-schemes/pm_vishwakarma.png",
  },
  {
    id: "pm_yasasvi",
    nameEn: "PM YASASVI Scholarship",
    nameMl: "പിഎം യശസ്വി സ്കോളർഷിപ്പ്",
    categoryId: "education",
    categoryEn: "Scholarship",
    categoryMl: "സ്കോളർഷിപ്പ്",
    logo: "/images/popular-schemes/mid_day_meal.png",
  },
  {
    id: "post_matric_sc",
    nameEn: "Post Matric Scholarship for SC Students",
    nameMl: "എസ്‌സി വിദ്യാർത്ഥികൾക്കുള്ള പോസ്റ്റ് മെട്രിക് സ്കോളർഷിപ്പ്",
    categoryId: "education",
    categoryEn: "Education",
    categoryMl: "വിദ്യാഭ്യാസം",
    logo: "/images/popular-schemes/khelo_india.png",
  },
  {
    id: "pm_vidyalaxmi",
    nameEn: "PM Vidyalaxmi Scheme",
    nameMl: "പി.എം വിദ്യാലക്ഷ്മി പദ്ധതി",
    categoryId: "education",
    categoryEn: "Education Loan",
    categoryMl: "വിദ്യാഭ്യാസ വായ്പ",
    logo: "/images/popular-schemes/digital_india.png",
  },
  {
    id: "pm_jay",
    nameEn: "Ayushman Bharat - PM-JAY",
    nameMl: "ആയുഷ്മാൻ ഭാരത് - പിഎം-ജയ്",
    categoryId: "health",
    categoryEn: "Health Insurance",
    categoryMl: "ആരോഗ്യ ഇൻഷുറൻസ്",
    logo: "/images/popular-schemes/pm_jay.png",
  },
  {
    id: "dialysis_prog",
    nameEn: "Pradhan Mantri National Dialysis Programme",
    nameMl: "പ്രധാനമന്ത്രി ദേശീയ ഡയാലിസിസ് പദ്ധതി",
    categoryId: "health",
    categoryEn: "Health",
    categoryMl: "ആരോഗ്യം",
    logo: "/images/popular-schemes/pm_jay.png",
  },
  {
    id: "digital_health",
    nameEn: "Ayushman Bharat Digital Mission",
    nameMl: "ആയുഷ്മാൻ ഭാരത് ഡിജിറ്റൽ മിഷൻ",
    categoryId: "health",
    categoryEn: "Digital Health",
    categoryMl: "ഡിജിറ്റൽ ആരോഗ്യം",
    logo: "/images/popular-schemes/pm_jay.png",
  },
  {
    id: "pmay_g",
    nameEn: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
    nameMl: "പ്രധാനമന്ത്രി ആവാസ് യോജന - ഗ്രാമീൺ (PMAY-G)",
    categoryId: "housing",
    categoryEn: "Housing",
    categoryMl: "ഭവന നിർമ്മാണം",
    logo: "/images/popular-schemes/pm_awas.png",
  },
  {
    id: "pmay_u",
    nameEn: "Pradhan Mantri Awas Yojana - Urban 2.0",
    nameMl: "പ്രധാനമന്ത്രി ആവാസ് യോജന - അർബൻ 2.0",
    categoryId: "housing",
    categoryEn: "Housing",
    categoryMl: "ഭവന നിർമ്മാണം",
    logo: "/images/popular-schemes/pm_awas.png",
  },
  {
    id: "pm_surya_ghar",
    nameEn: "PM Surya Ghar: Muft Bijli Yojana",
    nameMl: "പിഎം സൂര്യ ഘർ: സൗജന്യ വൈദ്യുതി പദ്ധതി",
    categoryId: "housing",
    categoryEn: "Housing & Energy",
    categoryMl: "ഭവനം & ഊർജ്ജം",
    logo: "/images/popular-schemes/pm_surya_ghar.png",
  },
  {
    id: "pm_ujjwala",
    nameEn: "Pradhan Mantri Ujjwala Yojana 2.0",
    nameMl: "പ്രധാനമന്ത്രി ഉജ്ജ്വല യോജന 2.0",
    categoryId: "housing",
    categoryEn: "Household Welfare",
    categoryMl: "ഗാർഹിക ക്ഷേമം",
    logo: "/images/popular-schemes/pm_ujjwala.png",
  },
  {
    id: "pm_garib_kalyan",
    nameEn: "PM Garib Kalyan Anna Yojana",
    nameMl: "പിഎം ഗരീബ് കല്യാൺ അന്ന യോജന",
    categoryId: "welfare",
    categoryEn: "Food Security",
    categoryMl: "ഭക്ഷ്യ സുരക്ഷ",
    logo: "/images/popular-schemes/pm_kisan.png",
  },
  {
    id: "ignoaps",
    nameEn: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    nameMl: "ഇന്ദിരാഗാന്ധി ദേശീയ വാർധക്യ പെൻഷൻ പദ്ധതി (IGNOAPS)",
    categoryId: "welfare",
    categoryEn: "Pension",
    categoryMl: "പെൻഷൻ",
    logo: "/images/popular-schemes/atal_pension.png",
  },
];

const REPORT_CATEGORIES: CategoryReportDef[] = [
  {
    id: "agriculture",
    nameEn: "Agriculture & Farmers Welfare",
    nameMl: "കാർഷിക & കർഷക ക്ഷേമം",
    icon: "/images/category-icons/cat_agriculture.png",
    schemesCount: 18,
  },
  {
    id: "banking",
    nameEn: "Banking, Insurance & Financial Services",
    nameMl: "ബാങ്കിംഗ്, ഇൻഷുറൻസ് & സാമ്പത്തിക സേവനങ്ങൾ",
    icon: "/images/category-icons/cat_banking.png",
    schemesCount: 14,
  },
  {
    id: "business",
    nameEn: "Business, MSME & Entrepreneurship",
    nameMl: "ബിസിനസ്, ചെറുകിട സംരംഭങ്ങൾ & സ്വയംതൊഴിൽ",
    icon: "/images/category-icons/cat_business.png",
    schemesCount: 22,
  },
  {
    id: "education",
    nameEn: "Education, Scholarships & Skill Learning",
    nameMl: "വിദ്യാഭ്യാസം, സ്കോളർഷിപ്പുകൾ & പഠനം",
    icon: "/images/category-icons/cat_education.png",
    schemesCount: 26,
  },
  {
    id: "health",
    nameEn: "Health, Medical & Family Wellness",
    nameMl: "ആരോഗ്യം, മെഡിക്കൽ ചികിത്സ & കുടുംബക്ഷേമം",
    icon: "/images/category-icons/cat_health.png",
    schemesCount: 15,
  },
  {
    id: "housing",
    nameEn: "Housing, Energy & Shelter Assistance",
    nameMl: "ഭവന നിർമ്മാണം, വൈദ്യുതി & പാർപ്പിടം",
    icon: "/images/category-icons/cat_housing.png",
    schemesCount: 12,
  },
  {
    id: "welfare",
    nameEn: "Social Welfare, Pension & Food Security",
    nameMl: "സാമൂഹിക ക്ഷേമം, പെൻഷൻ & ഭക്ഷ്യസുരക്ഷ",
    icon: "/images/category-icons/cat_law_justice.png",
    schemesCount: 16,
  },
  {
    id: "science",
    nameEn: "Science, IT, Innovation & Technology",
    nameMl: "ശാസ്ത്രം, ഐ.ടി & സാങ്കേതികവിദ്യ",
    icon: "/images/category-icons/cat_science.png",
    schemesCount: 9,
  },
];

const normalizeStr = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const KERALA_REGIONS: SchemeLocationOption[] = [
  { value: "south", en: "South Region", ml: "ദക്ഷിണ മേഖല" },
  { value: "central", en: "Central Region", ml: "മധ്യ മേഖല" },
  { value: "north", en: "North Region", ml: "ഉത്തര മേഖല" },
];

const KERALA_ORG_DISTRICTS: SchemeOrgDistrictOption[] = [
  { value: "thiruvananthapuram", en: "Thiruvananthapuram", ml: "തിരുവനന്തപുരം", region: "south" },
  { value: "kollam", en: "Kollam", ml: "കൊല്ലം", region: "south" },
  { value: "pathanamthitta", en: "Pathanamthitta", ml: "പത്തനംതിട്ട", region: "south" },
  { value: "alappuzha", en: "Alappuzha", ml: "ആലപ്പുഴ", region: "south" },
  { value: "kottayam", en: "Kottayam", ml: "കോട്ടയം", region: "south" },
  { value: "idukki", en: "Idukki", ml: "ഇടുക്കി", region: "south" },
  { value: "ernakulam", en: "Ernakulam", ml: "എറണാകുളം", region: "south" },
  { value: "thrissur", en: "Thrissur", ml: "തൃശൂർ", region: "central" },
  { value: "palakkad", en: "Palakkad", ml: "പാലക്കാട്", region: "central" },
  { value: "malappuram", en: "Malappuram", ml: "മലപ്പുറം", region: "central" },
  { value: "kozhikode", en: "Kozhikode", ml: "കോഴിക്കോട്", region: "north" },
  { value: "wayanad", en: "Wayanad", ml: "വയനാട്", region: "north" },
  { value: "kannur", en: "Kannur", ml: "കണ്ണൂർ", region: "north" },
  { value: "kasaragod", en: "Kasaragod", ml: "കാസർഗോഡ്", region: "north" },
];

const KERALA_AREAS: SchemeLocationOption[] = [
  { value: "north_area", en: "North Area", ml: "വടക്കൻ ഏരിയ" },
  { value: "central_area", en: "Central Area", ml: "മധ്യ ഏരിയ" },
  { value: "south_area", en: "South Area", ml: "തെക്കൻ ഏരിയ" },
];

const KERALA_WARDS: SchemeLocationOption[] = Array.from({ length: 10 }, (_, index) => {
  const wardNumber = index + 1;
  return {
    value: `ward_${wardNumber}`,
    en: `Ward ${wardNumber}`,
    ml: `വാർഡ് ${wardNumber}`,
  };
});

const SCHEME_LOCATION_LEVEL_OPTIONS: Array<SchemeLocationOption & { id: SchemeLocationLevel }> = [
  { id: "state", value: "state", en: "State", ml: "സംസ്ഥാനം" },
  { id: "region", value: "region", en: "Region", ml: "മേഖല" },
  { id: "org_district", value: "org_district", en: "Org District", ml: "ഓർഗനൈസേഷൻ ജില്ല" },
  { id: "mandalam", value: "mandalam", en: "Assembly Mandalam", ml: "അസംബ്ലി മണ്ഡലം" },
  { id: "area", value: "area", en: "Area", ml: "ഏരിയ" },
  { id: "ward", value: "ward", en: "Ward", ml: "വാർഡ്" },
];

const SCHEME_LOCATION_LEVEL_RANK: Record<SchemeLocationLevel, number> = {
  state: 0,
  region: 1,
  org_district: 2,
  mandalam: 3,
  area: 4,
  ward: 5,
};

const normalizeLocationValue = (value?: string) => (value || "").trim().toLowerCase();

const splitSchemeLocation = (locationEn?: string, locationMl?: string) => {
  const partsEn = (locationEn || "").split(",").map((part) => part.trim()).filter(Boolean);
  const partsMl = (locationMl || "").split(",").map((part) => part.trim()).filter(Boolean);
  return {
    localityEn: partsEn.length > 1 ? partsEn[0] : "",
    localityMl: partsMl.length > 1 ? partsMl[0] : "",
    districtEn: partsEn[partsEn.length - 1] || "",
    districtMl: partsMl[partsMl.length - 1] || "",
  };
};

const getSchemeOrgDistrictDef = (districtEn?: string) => {
  const key = normalizeLocationValue(districtEn);
  return KERALA_ORG_DISTRICTS.find(
    (district) => district.value === key || normalizeLocationValue(district.en) === key
  );
};

const hashLocationValue = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const getSchemeLocationLabel = (options: SchemeLocationOption[], value: string, lang: string) => {
  const option = options.find((item) => item.value === value);
  if (!option) return value;
  return lang === "ml" ? option.ml : option.en;
};

const getApplicationLocationHierarchy = (app: MobileReportApplicationRecord) => {
  const { localityEn, districtEn } = splitSchemeLocation(app.locationEn, app.locationMl);
  const district = getSchemeOrgDistrictDef(districtEn);
  const districtKey = district?.value || normalizeLocationValue(districtEn);
  const seed = hashLocationValue(
    `${app.ref}|${app.trackingId || ""}|${app.applicantNameEn}|${app.locationEn || ""}`
  );
  return {
    region: district?.region || "",
    orgDistrict: districtKey,
    mandalam: normalizeLocationValue(localityEn),
    area: KERALA_AREAS[seed % KERALA_AREAS.length].value,
    ward: KERALA_WARDS[hashLocationValue(`${seed}-ward`) % KERALA_WARDS.length].value,
  };
};

const KERALA_APPLICANT_POOL: Array<{
  nameEn: string;
  nameMl: string;
  locationEn: string;
  locationMl: string;
}> = [
  { nameEn: "Muhammed Shafee", nameMl: "മുഹമ്മദ് ഷാഫി", locationEn: "Malappuram Central, Malappuram", locationMl: "മലപ്പുറം സെൻട്രൽ, മലപ്പുറം" },
  { nameEn: "K. Krishnan", nameMl: "കെ. കൃഷ്ണൻ", locationEn: "Palakkad North, Palakkad", locationMl: "പാലക്കാട് നോർത്ത്, പാലക്കാട്" },
  { nameEn: "Ravi Kumar", nameMl: "രവി കുമാർ", locationEn: "Ollur, Thrissur", locationMl: "ഒല്ലൂർ, തൃശൂർ" },
  { nameEn: "Sunitha Kumari", nameMl: "സുനിത കുമാരി", locationEn: "Kottayam East, Kottayam", locationMl: "കോട്ടയം ഈസ്റ്റ്, കോട്ടയം" },
  { nameEn: "Devaki Amma", nameMl: "ദേവകി അമ്മ", locationEn: "Kannur Town, Kannur", locationMl: "കണ്ണൂർ ടൗൺ, കണ്ണൂർ" },
  { nameEn: "P. Thomas", nameMl: "പി. തോമസ്", locationEn: "Koyilandy, Kozhikode", locationMl: "കൊയിലാണ്ടി, കോഴിക്കോട്" },
  { nameEn: "Deepa Lakshmi", nameMl: "ദീപ ലക്ഷ്മി", locationEn: "Nedumangad, Thiruvananthapuram", locationMl: "നെടുമങ്ങാട്, തിരുവനന്തപുരം" },
  { nameEn: "Aswin Sasi", nameMl: "അശ്വിൻ ശശി", locationEn: "Chavara, Kollam", locationMl: "ചവറ, കൊല്ലം" },
  { nameEn: "Anitha Ramesh", nameMl: "അനിത രമേഷ്", locationEn: "Aluva, Ernakulam", locationMl: "ആലുവ, എറണാകുളം" },
  { nameEn: "Abdul Rahiman", nameMl: "അബ്ദുൾ റഹിമാൻ", locationEn: "Tirur, Malappuram", locationMl: "തിരൂർ, മലപ്പുറം" },
  { nameEn: "Radhika Nair", nameMl: "രാധിക നായർ", locationEn: "Alathur, Palakkad", locationMl: "ആലത്തൂർ, പാലക്കാട്" },
  { nameEn: "George Kutty", nameMl: "ജോർജ് കുട്ടി", locationEn: "Kanjirappally, Kottayam", locationMl: "കാഞ്ഞിരപ്പള്ളി, കോട്ടയം" },
  { nameEn: "Biju Narayanan", nameMl: "ബിജു നാരായണൻ", locationEn: "Vadakara, Kozhikode", locationMl: "വടകര, കോഴിക്കോട്" },
  { nameEn: "Lekha S.", nameMl: "ലേഖ എസ്.", locationEn: "Neyyattinkara, Thiruvananthapuram", locationMl: "നെയ്യാറ്റിൻകര, തിരുവനന്തപുരം" },
  { nameEn: "Manoj Kumar", nameMl: "മനോജ് കുമാർ", locationEn: "Chittur, Palakkad", locationMl: "ചിറ്റൂർ, പാലക്കാട്" },
  { nameEn: "Fatima Beevi", nameMl: "ഫാത്തിമ ബീവി", locationEn: "Karunagappally, Kollam", locationMl: "കരുനാഗപ്പള്ളി, കൊല്ലം" },
  { nameEn: "Santhosh Varghese", nameMl: "സന്തോഷ് വർഗീസ്", locationEn: "Thiruvalla, Pathanamthitta", locationMl: "തിരുവല്ല, പത്തനംതിട്ട" },
  { nameEn: "Sujatha K.", nameMl: "സുജാത കെ.", locationEn: "Mananthavady, Wayanad", locationMl: "മാനന്തവാടി, വയനാട്" },
  { nameEn: "Harikrishnan P.", nameMl: "ഹരികൃഷ്ണൻ പി.", locationEn: "Cherthala, Alappuzha", locationMl: "ചേർത്തല, ആലപ്പുഴ" },
  { nameEn: "Saritha Mohan", nameMl: "സരിത മോഹൻ", locationEn: "Kanhangad, Kasaragod", locationMl: "കാഞ്ഞങ്ങാട്, കാസർഗോഡ്" },
];

// Curated supplementary roster generator per scheme to guarantee rich application list
const generateSchemeApplications = (
  scheme: SchemeReportDef,
  existingApps: MobileReportApplicationRecord[]
): MobileReportApplicationRecord[] => {
  const result: MobileReportApplicationRecord[] = [...existingApps];
  const existingNames = new Set(
    existingApps.map((a) => (a.applicantNameEn || "").trim().toLowerCase())
  );

  // Status progression pattern for generated applications (Approved, In Review, Pending [Received / Document Verified], Rejected)
  const statusCycle: Array<{
    status: "approved" | "in_review" | "pending" | "rejected";
    workflowStatus: string;
  }> = [
    { status: "pending", workflowStatus: "application_received" },
    { status: "approved", workflowStatus: "beneficiary" },
    { status: "pending", workflowStatus: "document_verification_completed" },
    { status: "in_review", workflowStatus: "review" },
    { status: "approved", workflowStatus: "beneficiary" },
    { status: "rejected", workflowStatus: "rejected" },
    { status: "pending", workflowStatus: "application_received" },
  ];

  // Hash seed from scheme id
  let hash = 0;
  for (let i = 0; i < scheme.id.length; i++) {
    hash = (hash * 31 + scheme.id.charCodeAt(i)) >>> 0;
  }

  const poolLen = KERALA_APPLICANT_POOL.length;
  const targetCount = 7; // Guarantee 7 applications per scheme

  for (let i = 0; i < poolLen && result.length < targetCount; i++) {
    const poolIdx = (hash + i) % poolLen;
    const person = KERALA_APPLICANT_POOL[poolIdx];
    if (existingNames.has(person.nameEn.toLowerCase())) continue;

    const item = statusCycle[result.length % statusCycle.length];
    const day = 18 - (result.length % 12);
    const dateStr = `${day < 10 ? "0" + day : day} Oct 2026`;
    const refNum = 9200 + ((hash + result.length * 13) % 700);

    result.push({
      ref: `APP-2026-${refNum}`,
      trackingId: `APP-2026-${refNum}`,
      schemeNameEn: scheme.nameEn,
      schemeNameMl: scheme.nameMl,
      categoryEn: scheme.categoryEn,
      categoryMl: scheme.categoryMl,
      applicantNameEn: person.nameEn,
      applicantNameMl: person.nameMl,
      locationEn: person.locationEn,
      locationMl: person.locationMl,
      status: item.status,
      workflowStatus: item.workflowStatus,
      appliedDate: dateStr,
    });
    existingNames.add(person.nameEn.toLowerCase());
  }

  return result;
};

function getApplicationBucket(
  app: MobileReportApplicationRecord
): "rejected" | "pending" | "in_review" | "approved" {
  const wst = (app.workflowStatus || "").toLowerCase();
  const st = (app.status || "").toLowerCase();

  // 1. Rejected
  if (wst === "rejected" || st === "rejected") {
    return "rejected";
  }

  // 2. Pending: Document Verified or Received / Pending
  if (
    wst === "document_verification_completed" ||
    wst === "document_verified" ||
    st === "document_verified" ||
    wst === "application_received" ||
    wst === "received" ||
    st === "received" ||
    wst === "pending" ||
    st === "pending"
  ) {
    return "pending";
  }

  // 3. In Review
  if (
    wst === "in_review" ||
    wst === "review" ||
    wst === "under_review" ||
    wst === "in_progress" ||
    wst === "applied" ||
    st === "in_review" ||
    st === "review" ||
    st === "under_review" ||
    st === "in_progress"
  ) {
    return "in_review";
  }

  // 4. Approved
  if (
    wst === "beneficiary" ||
    wst === "approved" ||
    wst === "assisted" ||
    st === "beneficiary" ||
    st === "approved" ||
    st === "disbursed"
  ) {
    return "approved";
  }

  // 5. Default
  return "pending";
}

function getSchemeStats(apps: MobileReportApplicationRecord[]) {
  const total = apps.length;
  let approved = 0;
  let inReview = 0;
  let pending = 0;
  let rejected = 0;

  for (const app of apps) {
    const bucket = getApplicationBucket(app);
    if (bucket === "rejected") {
      rejected++;
    } else if (bucket === "approved") {
      approved++;
    } else if (bucket === "in_review") {
      inReview++;
    } else {
      pending++;
    }
  }

  return { total, approved, inReview, pending, rejected };
}

export function MobileReportsPage({
  onBack,
  applications = [],
  onSelectApplication,
  onOpenApplicationFilter,
  isFilterActive = false,
  filterCount = 0,
}: MobileReportsPageProps) {
  const { lang } = useLang();
  const [selectedScheme, setSelectedScheme] = useState<SchemeReportDef | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryReportDef | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Scheme Drilldown Search & Status Filter
  const [schemeAppSearchQuery, setSchemeAppSearchQuery] = useState("");
  const [isSchemeAppSearchExpanded, setIsSchemeAppSearchExpanded] = useState(false);
  const [schemeStatusFilter, setSchemeStatusFilter] = useState<"all" | "approved" | "in_review" | "in_progress" | "pending" | "rejected">("all");

  // Page-level Application Filter (work view + statuses + location)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filterSheetBounds, setFilterSheetBounds] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [openLocationField, setOpenLocationField] = useState<SchemeLocationField | null>(null);
  const [appliedSchemeFilter, setAppliedSchemeFilter] = useState<SchemeFilterState>(() => createDefaultSchemeFilter());
  const [draftSchemeFilter, setDraftSchemeFilter] = useState<SchemeFilterState>(() => createDefaultSchemeFilter());

  const mandalamOptionsByDistrict = useMemo(() => {
    const map = new Map<string, Map<string, SchemeLocationOption>>();
    const addLocation = (locationEn?: string, locationMl?: string) => {
      const { localityEn, localityMl, districtEn } = splitSchemeLocation(locationEn, locationMl);
      const district = getSchemeOrgDistrictDef(districtEn);
      const districtKey = district?.value || normalizeLocationValue(districtEn);
      if (!districtKey) return;
      if (!map.has(districtKey)) map.set(districtKey, new Map());
      const options = map.get(districtKey);
      if (!options || !localityEn) return;
      const value = normalizeLocationValue(localityEn);
      if (!options.has(value)) {
        options.set(value, { value, en: localityEn, ml: localityMl || localityEn });
      }
    };

    for (const app of applications) addLocation(app.locationEn, app.locationMl);
    for (const person of KERALA_APPLICANT_POOL) addLocation(person.locationEn, person.locationMl);

    for (const district of KERALA_ORG_DISTRICTS) {
      if (!map.has(district.value)) map.set(district.value, new Map());
      const options = map.get(district.value)!;
      if (options.size === 0) {
        options.set(district.value, {
          value: district.value,
          en: `${district.en} Mandalam`,
          ml: `${district.ml} മണ്ഡലം`,
        });
      }
    }
    return map;
  }, [applications]);

  const allMandalamOptions = useMemo(() => {
    const map = new Map<string, SchemeLocationOption>();
    for (const options of mandalamOptionsByDistrict.values()) {
      for (const [value, option] of options.entries()) {
        if (!map.has(value)) map.set(value, option);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.en.localeCompare(b.en));
  }, [mandalamOptionsByDistrict]);

  const appliedLocation = appliedSchemeFilter.location;
  const appliedLocationChips: Array<{ key: string; label: string }> = [];
  if (appliedLocation.region) {
    appliedLocationChips.push({ key: "region", label: getSchemeLocationLabel(KERALA_REGIONS, appliedLocation.region, lang) });
  }
  if (appliedLocation.orgDistrict) {
    appliedLocationChips.push({ key: "orgDistrict", label: getSchemeLocationLabel(KERALA_ORG_DISTRICTS, appliedLocation.orgDistrict, lang) });
  }
  if (appliedLocation.mandalam) {
    appliedLocationChips.push({ key: "mandalam", label: getSchemeLocationLabel(allMandalamOptions, appliedLocation.mandalam, lang) });
  }
  if (appliedLocation.area) {
    appliedLocationChips.push({ key: "area", label: getSchemeLocationLabel(KERALA_AREAS, appliedLocation.area, lang) });
  }
  if (appliedLocation.ward) {
    appliedLocationChips.push({ key: "ward", label: getSchemeLocationLabel(KERALA_WARDS, appliedLocation.ward, lang) });
  }

  const hasLocationFilters = Boolean(
    appliedLocation.region ||
    appliedLocation.orgDistrict ||
    appliedLocation.mandalam ||
    appliedLocation.area ||
    appliedLocation.ward
  );
  const hasLocalFilters =
    appliedSchemeFilter.workView !== "team" ||
    appliedSchemeFilter.statuses.length > 0 ||
    hasLocationFilters;
  const localFilterCount =
    (appliedSchemeFilter.workView !== "team" ? 1 : 0) +
    (appliedSchemeFilter.statuses.length > 0 ? 1 : 0) +
    (hasLocationFilters ? 1 : 0);
  const activeFilterCount = (isFilterActive ? filterCount : 0) + localFilterCount;


  // Group applications by Scheme
  const applicationsByScheme = useMemo(() => {
    const map = new Map<string, MobileReportApplicationRecord[]>();
    for (const scheme of REPORT_SCHEMES) {
      map.set(scheme.id, []);
    }

    const normSchemeMap = new Map<string, SchemeReportDef>();
    for (const scheme of REPORT_SCHEMES) {
      normSchemeMap.set(normalizeStr(scheme.nameEn), scheme);
      normSchemeMap.set(normalizeStr(scheme.id), scheme);
    }

    for (const app of applications) {
      const appSchemeNorm = normalizeStr(app.schemeNameEn);
      let matchedSchemeId = "";

      for (const [normKey, scheme] of normSchemeMap.entries()) {
        if (appSchemeNorm.includes(normKey) || normKey.includes(appSchemeNorm)) {
          matchedSchemeId = scheme.id;
          break;
        }
      }

      if (!matchedSchemeId) {
        // Fallback matching
        for (const scheme of REPORT_SCHEMES) {
          if (
            app.schemeNameEn.toLowerCase().includes(scheme.nameEn.toLowerCase()) ||
            scheme.nameEn.toLowerCase().includes(app.schemeNameEn.toLowerCase())
          ) {
            matchedSchemeId = scheme.id;
            break;
          }
        }
      }

      if (matchedSchemeId && map.has(matchedSchemeId)) {
        map.get(matchedSchemeId)!.push(app);
      }
    }

    // Guarantee that every scheme has a rich complete roster of applications when no filter is active
    for (const scheme of REPORT_SCHEMES) {
      const existing = map.get(scheme.id) || [];
      const completeList = isFilterActive ? existing : generateSchemeApplications(scheme, existing);
      map.set(scheme.id, completeList);
    }

    return map;
  }, [applications, isFilterActive]);

  // Apply the page-level filter (work view + statuses + location) to each scheme roster
  const filteredByScheme = useMemo(() => {
    if (!hasLocalFilters) return applicationsByScheme;
    const statuses = new Set(appliedSchemeFilter.statuses);
    const selectedLocation = appliedSchemeFilter.location;
    const map = new Map<string, MobileReportApplicationRecord[]>();
    for (const [schemeId, list] of applicationsByScheme.entries()) {
      map.set(
        schemeId,
        list.filter((app) => {
          const bucket = getApplicationBucket(app);
          if (appliedSchemeFilter.workView === "my_work" && bucket !== "pending" && bucket !== "in_review") {
            return false;
          }
          if (statuses.size > 0 && !statuses.has(bucket)) {
            return false;
          }
          const appLocation = getApplicationLocationHierarchy(app);
          if (selectedLocation.region && appLocation.region !== selectedLocation.region) return false;
          if (selectedLocation.orgDistrict && appLocation.orgDistrict !== selectedLocation.orgDistrict) return false;
          if (selectedLocation.mandalam && appLocation.mandalam !== selectedLocation.mandalam) return false;
          if (selectedLocation.area && appLocation.area !== selectedLocation.area) return false;
          if (selectedLocation.ward && appLocation.ward !== selectedLocation.ward) return false;
          return true;
        })
      );
    }
    return map;
  }, [applicationsByScheme, hasLocalFilters, appliedSchemeFilter]);

  // Group applications by Category from schemes
  const applicationsByCategory = useMemo(() => {
    const map = new Map<string, MobileReportApplicationRecord[]>();
    for (const cat of REPORT_CATEGORIES) {
      map.set(cat.id, []);
    }

    for (const scheme of REPORT_SCHEMES) {
      const schemeApps = filteredByScheme.get(scheme.id) || [];
      const catId = scheme.categoryId || "agriculture";
      if (!map.has(catId)) map.set(catId, []);
      map.get(catId)!.push(...schemeApps);
    }

    return map;
  }, [filteredByScheme]);

  // Count schemes per category
  const schemesCountByCategory = useMemo(() => {
    const countMap: Record<string, number> = {};
    for (const cat of REPORT_CATEGORIES) {
      countMap[cat.id] = REPORT_SCHEMES.filter((s) => s.categoryId === cat.id).length || cat.schemesCount;
    }
    return countMap;
  }, []);

  // Filter schemes based on search
  const filteredSchemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return REPORT_SCHEMES;
    return REPORT_SCHEMES.filter((s) =>
      s.nameEn.toLowerCase().includes(q) ||
      s.nameMl.toLowerCase().includes(q) ||
      s.categoryEn.toLowerCase().includes(q) ||
      s.categoryMl.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return REPORT_CATEGORIES;
    return REPORT_CATEGORIES.filter((c) =>
      c.nameEn.toLowerCase().includes(q) ||
      c.nameMl.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Hide schemes that have no applications matching the active filter
  const visibleSchemes = useMemo(() => {
    if (!isFilterActive && !hasLocalFilters) return filteredSchemes;
    return filteredSchemes.filter((scheme) => (filteredByScheme.get(scheme.id) || []).length > 0);
  }, [filteredSchemes, filteredByScheme, isFilterActive, hasLocalFilters]);
  const getFilterSheetBounds = (anchor?: HTMLElement | null) => {
    let ancestor = anchor?.parentElement || null;
    while (ancestor && ancestor !== document.body) {
      const style = window.getComputedStyle(ancestor);
      const rect = ancestor.getBoundingClientRect();
      const isClippedFrame =
        style.overflowX === "hidden" &&
        style.overflowY === "hidden" &&
        rect.width >= 280 &&
        rect.height >= 400 &&
        rect.width < window.innerWidth - 8 &&
        rect.height <= window.innerHeight;
      if (isClippedFrame) {
        return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
      }
      ancestor = ancestor.parentElement;
    }
    return null;
  };

  const openFilterSheet = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (onOpenApplicationFilter) {
      onOpenApplicationFilter();
      return;
    }
    setFilterSheetBounds(getFilterSheetBounds(event?.currentTarget));
    setDraftSchemeFilter({
      ...appliedSchemeFilter,
      statuses: [...appliedSchemeFilter.statuses],
      location: { ...appliedSchemeFilter.location },
    });
    setIsStatusMenuOpen(false);
    setOpenLocationField(null);
    setIsFilterSheetOpen(true);
  };

  const clearLocalFilters = () => {
    setAppliedSchemeFilter(createDefaultSchemeFilter());
    setDraftSchemeFilter(createDefaultSchemeFilter());
    setOpenLocationField(null);
  };

  const toggleDraftStatus = (id: SchemeStatusBucket) => {
    setDraftSchemeFilter((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(id)
        ? prev.statuses.filter((status) => status !== id)
        : [...prev.statuses, id],
    }));
  };

  const updateDraftLocation = (field: keyof SchemeLocationFilter, value: string) => {
    setDraftSchemeFilter((prev) => {
      const nextLocation = { ...prev.location, [field]: value };
      if (field === "region") {
        nextLocation.orgDistrict = "";
        nextLocation.mandalam = "";
        nextLocation.area = "";
        nextLocation.ward = "";
      } else if (field === "orgDistrict") {
        nextLocation.mandalam = "";
        nextLocation.area = "";
        nextLocation.ward = "";
      } else if (field === "mandalam") {
        nextLocation.area = "";
        nextLocation.ward = "";
      } else if (field === "area") {
        nextLocation.ward = "";
      }
      return { ...prev, location: nextLocation };
    });
    setOpenLocationField(null);
  };

  const statusFilterOptions: Array<{ id: SchemeStatusBucket; en: string; ml: string }> = [
    { id: "approved", en: "Approved", ml: "അംഗീകരിച്ചവ" },
    { id: "in_review", en: "In Review", ml: "പരിശോധനയിൽ" },
    { id: "pending", en: "Pending", ml: "തീർപ്പുകൽപ്പിക്കാത്തവ" },
    { id: "rejected", en: "Rejected", ml: "നിരസിച്ചവ" },
  ];

  const renderApplicationFilterSheet = () => {
    if (!isFilterSheetOpen) return null;
    const draftLocation = draftSchemeFilter.location;
    const draftHasLocation = Boolean(
      draftLocation.region ||
      draftLocation.orgDistrict ||
      draftLocation.mandalam ||
      draftLocation.area ||
      draftLocation.ward
    );
    const draftCount =
      (draftSchemeFilter.workView !== "team" ? 1 : 0) +
      (draftSchemeFilter.statuses.length > 0 ? 1 : 0) +
      (draftHasLocation ? 1 : 0);
    const draftStatusSummary =
      draftSchemeFilter.statuses.length === 0
        ? (lang === "ml" ? "എല്ലാ അപേക്ഷകളും" : "All Applications")
        : draftSchemeFilter.statuses.length === 1
          ? (() => {
              const option = statusFilterOptions.find((item) => item.id === draftSchemeFilter.statuses[0]);
              if (!option) return "1";
              return lang === "ml" ? option.ml : option.en;
            })()
          : lang === "ml"
            ? `${draftSchemeFilter.statuses.length} എണ്ണം തിരഞ്ഞെടുത്തു`
            : `${draftSchemeFilter.statuses.length} selected`;

    return (
      <div
        className={`fixed ${filterSheetBounds ? "" : "inset-0"} z-[120] flex items-end bg-slate-950/50 backdrop-blur-[1px] animate-in fade-in duration-150`}
        style={filterSheetBounds ?? undefined}
        onClick={() => setIsFilterSheetOpen(false)}
      >
        <div
          className="w-full max-h-[88%] overflow-y-auto rounded-t-[24px] border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl animate-in slide-in-from-bottom-full duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1 mb-3" />

          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#ff5500]">
                <Filter className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <span className="text-[13px] font-extrabold text-slate-900 dark:text-white">
                {lang === "ml" ? "അപേക്ഷാ ഫിൽട്ടറുകൾ" : "Application Filters"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label={lang === "ml" ? "അടയ്ക്കുക" : "Close"}
              title={lang === "ml" ? "അടയ്ക്കുക" : "Close"}
            >
              <X className="h-4 w-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Work View */}
          <div className="space-y-1 mb-2.5">
            <label className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 block">
              {lang === "ml" ? "വർക്ക് വ്യൂ" : "Work View"}
            </label>
            <div className="grid grid-cols-2 gap-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-0.5">
              {([
                { id: "my_work" as SchemeWorkView, en: "My Work", ml: "എന്റെ ജോലി", icon: Inbox },
                { id: "team" as SchemeWorkView, en: "Team", ml: "ടീം", icon: Users },
              ]).map((option) => {
                const WorkIcon = option.icon;
                const isSelected = draftSchemeFilter.workView === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDraftSchemeFilter((prev) => ({ ...prev, workView: option.id }))}
                    className={`flex items-center justify-center gap-1 rounded-md border px-1.5 py-1 text-[10.5px] font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700 text-[#EA580C] dark:text-orange-400 shadow-2xs"
                        : "bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    <WorkIcon className="h-3 w-3 shrink-0" strokeWidth={2.2} />
                    <span>{lang === "ml" ? option.ml : option.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Application Status - multi-select dropdown */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 block">
              {lang === "ml" ? "അപേക്ഷാ നില" : "Application Status"}
            </label>
            <button
              type="button"
              onClick={() => setIsStatusMenuOpen((open) => !open)}
              aria-expanded={isStatusMenuOpen}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-left cursor-pointer"
            >
              <span className="truncate text-[11.5px] font-bold text-slate-800 dark:text-slate-100">
                {draftStatusSummary}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                  isStatusMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isStatusMenuOpen && (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                <button
                  type="button"
                  onClick={() => setDraftSchemeFilter((prev) => ({ ...prev, statuses: [] }))}
                  className={`flex w-full items-center justify-between gap-2 px-2.5 py-2 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                    draftSchemeFilter.statuses.length === 0
                      ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <span>{lang === "ml" ? "എല്ലാ അപേക്ഷകളും" : "All Applications"}</span>
                  {draftSchemeFilter.statuses.length === 0 && (
                    <Check className="h-3 w-3 shrink-0 stroke-[3]" />
                  )}
                </button>
                {statusFilterOptions.map((option) => {
                  const isChecked = draftSchemeFilter.statuses.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleDraftStatus(option.id)}
                      className={`flex w-full items-center gap-2 px-2.5 py-2 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-orange-50/70 dark:bg-orange-950/30 text-slate-900 dark:text-white"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border ${
                          isChecked
                            ? "border-[#EA580C] bg-[#EA580C] text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isChecked && <Check className="h-2.5 w-2.5 stroke-[3.4]" />}
                      </span>
                      <span className="truncate">{lang === "ml" ? option.ml : option.en}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location Filter */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#ff5500]" />
              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
                {lang === "ml" ? "ലൊക്കേഷൻ ഫിൽട്ടർ" : "Location Filter"}
              </span>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                {lang === "ml" ? "ലൊക്കേഷൻ ലെവൽ തിരഞ്ഞെടുക്കുക" : "Select Location Level"}
              </label>
              <button
                type="button"
                onClick={() => setOpenLocationField((open) => (open === "level" ? null : "level"))}
                aria-expanded={openLocationField === "level"}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-left cursor-pointer"
              >
                <span className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                  {lang === "ml"
                    ? SCHEME_LOCATION_LEVEL_OPTIONS.find((option) => option.id === draftSchemeFilter.locationLevel)?.ml
                    : SCHEME_LOCATION_LEVEL_OPTIONS.find((option) => option.id === draftSchemeFilter.locationLevel)?.en}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                    openLocationField === "level" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openLocationField === "level" && (
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                  {SCHEME_LOCATION_LEVEL_OPTIONS.map((option) => {
                    const isSelected = draftSchemeFilter.locationLevel === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          const rank = SCHEME_LOCATION_LEVEL_RANK[option.id];
                          setDraftSchemeFilter((prev) => {
                            const nextLocation = { ...prev.location };
                            if (rank === 0) {
                              return { ...prev, locationLevel: option.id, location: createEmptySchemeLocation() };
                            }
                            if (rank < 2) nextLocation.orgDistrict = "";
                            if (rank < 3) nextLocation.mandalam = "";
                            if (rank < 4) nextLocation.area = "";
                            if (rank < 5) nextLocation.ward = "";
                            return { ...prev, locationLevel: option.id, location: nextLocation };
                          });
                          setOpenLocationField(null);
                        }}
                        className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                        }`}
                      >
                        <span>{lang === "ml" ? option.ml : option.en}</span>
                        {isSelected && <Check className="h-3 w-3 shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {(() => {
              const rank = SCHEME_LOCATION_LEVEL_RANK[draftSchemeFilter.locationLevel];
              const selectedLocation = draftSchemeFilter.location;
              const orgDistrictOptions = selectedLocation.region
                ? KERALA_ORG_DISTRICTS.filter((district) => district.region === selectedLocation.region)
                : KERALA_ORG_DISTRICTS;
              const selectedDistrictMandalams = new Map<string, SchemeLocationOption>();
              for (const district of selectedLocation.orgDistrict) {
                for (const option of mandalamOptionsByDistrict.get(district)?.values() || []) {
                  if (!selectedDistrictMandalams.has(option.value)) {
                    selectedDistrictMandalams.set(option.value, option);
                  }
                }
              }
              const mandalamOptions = selectedLocation.orgDistrict.length
                ? Array.from(selectedDistrictMandalams.values()).sort((a, b) => a.en.localeCompare(b.en))
                : allMandalamOptions;

              const renderLocationDropdown = ({
                field,
                label,
                allLabel,
                value,
                values = [],
                multiple = false,
                options,
              }: {
                field: Exclude<SchemeLocationField, "level">;
                label: string;
                allLabel: string;
                value?: string;
                values?: string[];
                multiple?: boolean;
                options: SchemeLocationOption[];
              }) => {
                const isOpen = openLocationField === field;
                const selectedValues = multiple ? values : value ? [value] : [];
                const selectedLabel =
                  selectedValues.length === 0
                    ? allLabel
                    : selectedValues.length === 1
                      ? getSchemeLocationLabel(options, selectedValues[0], lang)
                      : lang === "ml"
                        ? `${selectedValues.length} എണ്ണം തിരഞ്ഞെടുത്തു`
                        : `${selectedValues.length} selected`;
                return (
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                      {label}
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpenLocationField((open) => (open === field ? null : field))}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-left cursor-pointer"
                    >
                      <span className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                        {selectedLabel}
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                        <button
                          type="button"
                          onClick={() => (multiple ? clearDraftLocation(field) : updateDraftRegion(""))}
                          className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                            selectedValues.length === 0
                              ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                          }`}
                        >
                          <span>{allLabel}</span>
                          {selectedValues.length === 0 && <Check className="h-3 w-3 shrink-0 stroke-[3]" />}
                        </button>
                        {options.map((option) => {
                          const isSelected = selectedValues.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                multiple
                                  ? toggleDraftLocation(field, option.value)
                                  : updateDraftRegion(option.value)
                              }
                              className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                              }`}
                            >
                              <span className="truncate">{lang === "ml" ? option.ml : option.en}</span>
                              {multiple ? (
                                <span
                                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border ${
                                    isSelected
                                      ? "border-[#EA580C] bg-[#EA580C] text-white"
                                      : "border-slate-300 dark:border-slate-600"
                                  }`}
                                >
                                  {isSelected && <Check className="h-2.5 w-2.5 stroke-[3.4]" />}
                                </span>
                              ) : (
                                isSelected && <Check className="h-3 w-3 shrink-0 stroke-[3]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              };

              if (rank === 0) return null;

              return (
                <div className="space-y-1.5">
                  <div className={`grid gap-1.5 ${rank >= 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {renderLocationDropdown({
                      field: "region",
                      label: lang === "ml" ? "മേഖല തിരഞ്ഞെടുക്കുക" : "Select Region",
                      allLabel: lang === "ml" ? "എല്ലാ മേഖലകളും" : "All Regions",
                      value: selectedLocation.region,
                      options: KERALA_REGIONS,
                    })}
                    {rank >= 2 &&
                      renderLocationDropdown({
                        field: "orgDistrict",
                        label: lang === "ml" ? "ഓർഗനൈസേഷൻ ജില്ല" : "Org District",
                        allLabel: lang === "ml" ? "എല്ലാ ഓർഗ് ജില്ലകളും" : "All Org Districts",
                        value: selectedLocation.orgDistrict,
                        options: orgDistrictOptions,
                      })}
                  </div>
                  {rank >= 3 && (
                    <div className={`grid gap-1.5 ${rank >= 4 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {renderLocationDropdown({
                        field: "mandalam",
                        label: lang === "ml" ? "അസംബ്ലി മണ്ഡലം" : "Assembly Mandalam",
                        allLabel: lang === "ml" ? "എല്ലാ മണ്ഡലങ്ങളും" : "All Mandalams",
                        value: selectedLocation.mandalam,
                        options: mandalamOptions,
                      })}
                      {rank >= 4 &&
                        renderLocationDropdown({
                          field: "area",
                          label: lang === "ml" ? "ഏരിയ" : "Area",
                          allLabel: lang === "ml" ? "എല്ലാ ഏരിയകളും" : "All Areas",
                          value: selectedLocation.area,
                          options: KERALA_AREAS,
                        })}
                    </div>
                  )}
                  {rank >= 5 &&
                    renderLocationDropdown({
                      field: "ward",
                      label: lang === "ml" ? "വാർഡ് / ബൂത്ത് തിരഞ്ഞെടുക്കുക" : "Select Ward / Booth",
                      allLabel: lang === "ml" ? "എല്ലാ വാർഡുകളും / ബൂത്തുകളും" : "All Wards / Booths",
                      value: selectedLocation.ward,
                      options: KERALA_WARDS,
                    })}
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDraftSchemeFilter(createDefaultSchemeFilter());
                setIsStatusMenuOpen(false);
                setOpenLocationField(null);
              }}
              className="w-1/3 flex items-center justify-center gap-1.5 rounded-lg border border-orange-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-extrabold text-[11.5px] py-2.5 hover:bg-orange-50 transition-all cursor-pointer active:scale-[0.98]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{lang === "ml" ? "റീസെറ്റ്" : "Reset"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAppliedSchemeFilter({
                  ...draftSchemeFilter,
                  statuses: [...draftSchemeFilter.statuses],
                  location: { ...draftSchemeFilter.location },
                });
                setIsFilterSheetOpen(false);
                setIsStatusMenuOpen(false);
                setOpenLocationField(null);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11.5px] py-2.5 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Filter className="h-3.5 w-3.5 stroke-[2.2]" />
              <span>
                {lang === "ml" ? "ഫിൽട്ടർ പ്രയോഗിക്കുക" : "Apply Filters"}
                {draftCount > 0 ? ` (${draftCount})` : ""}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Applications list for selected scheme
  const schemeApplications = useMemo(() => {
    if (!selectedScheme) return [];
    return filteredByScheme.get(selectedScheme.id) || [];
  }, [selectedScheme, filteredByScheme]);

  // Applications list for selected category
  const categoryApplications = useMemo(() => {
    if (!selectedCategory) return [];
    return applicationsByCategory.get(selectedCategory.id) || [];
  }, [selectedCategory, applicationsByCategory]);

  const getStatusBadge = (input: MobileReportApplicationRecord | string) => {
    let wst = "";
    let st = "";

    if (typeof input === "string") {
      st = input.toLowerCase();
      wst = input.toLowerCase();
    } else {
      wst = (input.workflowStatus || "").toLowerCase();
      st = (input.status || "").toLowerCase();
    }

    // 1. Rejected
    if (wst === "rejected" || st === "rejected") {
      return {
        label: lang === "ml" ? "നിരസിച്ചു" : "Rejected",
        icon: AlertCircle,
        className: "bg-rose-50 text-[#DC2626] border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60",
      };
    }

    // 2. Pending: Document Verified
    if (
      wst === "document_verification_completed" ||
      wst === "document_verified" ||
      st === "document_verified"
    ) {
      return {
        label: lang === "ml" ? "രേഖകൾ പരിശോധിച്ചു" : "Document Verified",
        icon: FileCheck,
        className: "bg-amber-50 text-[#D97706] border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
      };
    }

    // 3. Pending: Received / Application Received / Pending
    if (
      wst === "application_received" ||
      wst === "received" ||
      st === "received" ||
      wst === "pending" ||
      st === "pending"
    ) {
      return {
        label: lang === "ml" ? "ലഭിച്ചു" : "Received",
        icon: Inbox,
        className: "bg-amber-50 text-[#EA580C] border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
      };
    }

    // 4. In Review
    if (
      wst === "in_review" ||
      wst === "review" ||
      wst === "under_review" ||
      wst === "in_progress" ||
      wst === "applied" ||
      st === "in_review" ||
      st === "review" ||
      st === "under_review" ||
      st === "in_progress"
    ) {
      return {
        label: lang === "ml" ? "പരിശോധനയിൽ" : "In Review",
        icon: Clock,
        className: "bg-blue-50 text-[#2563EB] border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60",
      };
    }

    // 5. Approved / Beneficiary
    if (
      wst === "beneficiary" ||
      wst === "approved" ||
      wst === "assisted" ||
      st === "beneficiary" ||
      st === "approved" ||
      st === "disbursed"
    ) {
      return {
        label: lang === "ml" ? "അംഗീകരിച്ചു" : "Approved",
        icon: CheckCircle2,
        className: "bg-emerald-50 text-[#00875A] border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60",
      };
    }

    // Fallback: Received
    return {
      label: lang === "ml" ? "ലഭിച്ചു" : "Received",
      icon: Inbox,
      className: "bg-amber-50 text-[#EA580C] border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
    };
  };

  // Scheme drilldown status counts and filtering
  const {
    totalSchemeApps,
    approvedSchemeApps,
    inReviewSchemeApps,
    pendingSchemeApps,
    rejectedSchemeApps,
    filteredSchemeApplications,
  } = useMemo(() => {
    const stats = getSchemeStats(schemeApplications);
    const total = stats.total;
    const approved = stats.approved;
    const inReview = stats.inReview;
    const pending = stats.pending;
    const rejected = stats.rejected;

    let list = schemeApplications;
    if (schemeStatusFilter === "approved") {
      list = list.filter((app) => getApplicationBucket(app) === "approved");
    } else if (schemeStatusFilter === "in_review" || schemeStatusFilter === "in_progress") {
      list = list.filter((app) => getApplicationBucket(app) === "in_review");
    } else if (schemeStatusFilter === "pending") {
      list = list.filter((app) => getApplicationBucket(app) === "pending");
    } else if (schemeStatusFilter === "rejected") {
      list = list.filter((app) => getApplicationBucket(app) === "rejected");
    }

    const q = schemeAppSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((app) => {
        const name = `${app.applicantNameEn || ""} ${app.applicantNameMl || ""}`.toLowerCase();
        const loc = `${app.locationEn || ""} ${app.locationMl || ""}`.toLowerCase();
        const ref = `${app.ref || ""} ${app.trackingId || ""}`.toLowerCase();
        return name.includes(q) || loc.includes(q) || ref.includes(q);
      });
    }

    return {
      totalSchemeApps: total,
      approvedSchemeApps: approved,
      inReviewSchemeApps: inReview,
      pendingSchemeApps: pending,
      rejectedSchemeApps: rejected,
      filteredSchemeApplications: list,
    };
  }, [schemeApplications, schemeStatusFilter, schemeAppSearchQuery]);

  // Render Scheme Applications Drilldown View
  if (selectedScheme) {
    return (
      <div className="flex flex-col min-h-full bg-white dark:bg-slate-950 pb-8 animate-in fade-in duration-200">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#FFFDF9] dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 px-3.5 py-1.5 shadow-2xs">
          <div className="relative flex h-9 items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                setSelectedScheme(null);
                setSchemeAppSearchQuery("");
                setIsSchemeAppSearchExpanded(false);
                setSchemeStatusFilter("all");
              }}
              className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-[#FFF7EC] text-[#1b255a] hover:bg-orange-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer transition-colors border border-orange-100/80 dark:border-slate-700 shadow-2xs z-10"
              aria-label={lang === "ml" ? "പദ്ധതികളിലേക്ക് മടങ്ങുക" : "Back to Schemes"}
              title={lang === "ml" ? "പദ്ധതികളിലേക്ക് മടങ്ങുക" : "Back to Schemes"}
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>
            <h2 className="absolute inset-y-0 left-10 right-20 flex items-center justify-center text-center text-[12.5px] font-extrabold text-[#0F172A] dark:text-white pointer-events-none truncate leading-tight">
              {lang === "ml" ? selectedScheme.nameMl : selectedScheme.nameEn}
            </h2>

            {/* Right Action Buttons: Search & Application Filter */}
            <div className="flex items-center gap-1.5 shrink-0 z-10">
              <button
                type="button"
                onClick={() => setIsSchemeAppSearchExpanded(!isSchemeAppSearchExpanded)}
                className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-white text-[#1b255a] hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer transition-colors border border-slate-200/80 dark:border-slate-700 shadow-2xs"
                aria-label={lang === "ml" ? "തിരയുക" : "Search"}
                title={lang === "ml" ? "തിരയുക" : "Search"}
              >
                <Search className="h-3.5 w-3.5 stroke-[2.2]" />
              </button>

              <button
                type="button"
                onClick={openFilterSheet}
                aria-haspopup="dialog"
                aria-expanded={isFilterSheetOpen}
                className={`relative flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full transition-all border shadow-2xs cursor-pointer ${
                  activeFilterCount > 0
                    ? "bg-orange-500 text-white border-orange-500 shadow-xs ring-2 ring-orange-500/20"
                    : "bg-white text-[#1b255a] hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700"
                }`}
                title={lang === "ml" ? "അപേക്ഷാ ഫിൽട്ടർ" : "Application Filter"}
                aria-label={lang === "ml" ? "അപേക്ഷാ ഫിൽട്ടർ" : "Application Filter"}
              >
                <Filter
                  className={`h-3.5 w-3.5 stroke-[2.2] ${
                    activeFilterCount > 0 ? "text-white" : "text-[#ff5500]"
                  }`}
                />
                {activeFilterCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-black leading-none text-white ring-1.5 ring-white dark:ring-slate-900">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {/* Expandable Search Input */}
          {isSchemeAppSearchExpanded && (
            <div className="mt-2 pb-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={schemeAppSearchQuery}
                  onChange={(e) => setSchemeAppSearchQuery(e.target.value)}
                  placeholder={lang === "ml" ? "അപേക്ഷകന്റെ പേര്, സ്ഥലം തിരയുക..." : "Search applicant, location..."}
                  className="w-full pl-8 pr-7 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1.5 focus:ring-blue-500"
                  autoFocus
                />
                {schemeAppSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSchemeAppSearchQuery("")}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Content Container */}
        <div className="px-3 pt-2 pb-4">
          {/* Unified 5-KPI Segmented Card Bar (Compact height, adjusted padding and gap) */}
          {/* Order: Applications, Approved, In Review, Pending, Rejected */}
          <div className="flex items-stretch rounded-xl bg-[#FCFAF6] dark:bg-slate-900 border border-[#ECE7DF] dark:border-slate-800 shadow-2xs mb-2.5 overflow-hidden divide-x divide-[#ECE7DF] dark:divide-slate-800">
            {/* 1. Applications */}
            <button
              type="button"
              onClick={() => setSchemeStatusFilter("all")}
              className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center ${
                schemeStatusFilter === "all"
                  ? "bg-blue-50/70 dark:bg-blue-950/40"
                  : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              }`}
              title={lang === "ml" ? "എല്ലാ അപേക്ഷകളും" : "All Applications"}
            >
              <span className="text-[13.5px] font-extrabold text-[#0B2545] dark:text-blue-300 leading-none">
                {totalSchemeApps}
              </span>
              <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
              </span>
            </button>

            {/* 2. Approved */}
            <button
              type="button"
              onClick={() => setSchemeStatusFilter(schemeStatusFilter === "approved" ? "all" : "approved")}
              className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center ${
                schemeStatusFilter === "approved"
                  ? "bg-emerald-50/70 dark:bg-emerald-950/40"
                  : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              }`}
              title={lang === "ml" ? "അംഗീകരിച്ചവ" : "Approved"}
            >
              <span className="text-[13.5px] font-extrabold text-[#00875A] dark:text-emerald-400 leading-none">
                {approvedSchemeApps}
              </span>
              <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                {lang === "ml" ? "അംഗീകാരം" : "Approved"}
              </span>
            </button>

            {/* 3. In Review (renamed from In progress) */}
            <button
              type="button"
              onClick={() => setSchemeStatusFilter(schemeStatusFilter === "in_review" ? "all" : "in_review")}
              className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center ${
                schemeStatusFilter === "in_review"
                  ? "bg-sky-50/70 dark:bg-sky-950/40"
                  : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              }`}
              title={lang === "ml" ? "പരിശോധനയിൽ" : "In Review"}
            >
              <span className="text-[13.5px] font-extrabold text-[#2563EB] dark:text-sky-400 leading-none">
                {inReviewSchemeApps}
              </span>
              <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                {lang === "ml" ? "പരിശോധനയിൽ" : "In Review"}
              </span>
            </button>

            {/* 4. Pending */}
            <button
              type="button"
              onClick={() => setSchemeStatusFilter(schemeStatusFilter === "pending" ? "all" : "pending")}
              className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center ${
                schemeStatusFilter === "pending"
                  ? "bg-amber-50/70 dark:bg-amber-950/40"
                  : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              }`}
              title={lang === "ml" ? "തീർപ്പുകൽപ്പിക്കാത്തവ" : "Pending"}
            >
              <span className="text-[13.5px] font-extrabold text-[#EA580C] dark:text-amber-400 leading-none">
                {pendingSchemeApps}
              </span>
              <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                {lang === "ml" ? "തീർപ്പില്ലാത്തവ" : "Pending"}
              </span>
            </button>

            {/* 5. Rejected */}
            <button
              type="button"
              onClick={() => setSchemeStatusFilter(schemeStatusFilter === "rejected" ? "all" : "rejected")}
              className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center ${
                schemeStatusFilter === "rejected"
                  ? "bg-rose-50/70 dark:bg-rose-950/40"
                  : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              }`}
              title={lang === "ml" ? "നിരസിച്ചവ" : "Rejected"}
            >
              <span className="text-[13.5px] font-extrabold text-[#DC2626] dark:text-rose-400 leading-none">
                {rejectedSchemeApps}
              </span>
              <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                {lang === "ml" ? "നിരസിച്ചത്" : "Rejected"}
              </span>
            </button>
          </div>

          {/* Applications List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {lang === "ml" ? "അപേക്ഷകർ" : "Applications"} ({filteredSchemeApplications.length})
              </span>
              {(schemeStatusFilter !== "all" || schemeAppSearchQuery || activeFilterCount > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setSchemeStatusFilter("all");
                    setSchemeAppSearchQuery("");
                    clearLocalFilters();
                  }}
                  className="text-[9.5px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {lang === "ml" ? "ഫിൽട്ടർ ഒഴിവാക്കുക" : "Clear Filter"}
                </button>
              )}
            </div>

            {filteredSchemeApplications.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                <Inbox className="h-7 w-7 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {lang === "ml" ? "അപേക്ഷകൾ ഒന്നും കണ്ടെത്തിയില്ല." : "No applications found."}
                </p>
              </div>
            ) : (
              filteredSchemeApplications.map((app, index) => {
                const badge = getStatusBadge(app);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={`${app.ref}-${index}`}
                    onClick={() => onSelectApplication(app)}
                    className="group relative px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-orange-300 dark:hover:border-orange-800 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Left: Avatar (Orange shade) + Applicant Name (Decreased size) + Location */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-7.5 w-7.5 rounded-full bg-orange-100/80 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-[10px] font-extrabold shrink-0 border border-orange-200 dark:border-orange-800/60">
                          {(lang === "ml" ? app.applicantNameMl : app.applicantNameEn)?.slice(0, 2).toUpperCase() || "AP"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11.5px] font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight">
                            {lang === "ml" ? app.applicantNameMl : app.applicantNameEn}
                          </h4>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                            <span className="truncate">{lang === "ml" ? app.locationMl : app.locationEn}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status badge (Decreased tag size) */}
                      <span
                        className={`inline-flex items-center gap-1 text-[8.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${badge.className}`}
                      >
                        <BadgeIcon className="h-2.5 w-2.5 stroke-[2.2]" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {renderApplicationFilterSheet()}
      </div>
    );
  }

  // Render Category Applications Drilldown View
  if (selectedCategory) {
    const appCount = categoryApplications.length;
    const catSchemesCount = schemesCountByCategory[selectedCategory.id] || selectedCategory.schemesCount;

    return (
      <div className="flex flex-col min-h-full bg-white dark:bg-slate-950 pb-8 animate-in fade-in duration-200">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#FFFDF9] dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 px-3.5 py-1.5 shadow-2xs">
          <div className="relative flex h-9 items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-[#FFF7EC] text-[#1b255a] hover:bg-orange-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer transition-colors border border-orange-100/80 dark:border-slate-700 shadow-2xs z-10"
              aria-label={lang === "ml" ? "വിഭാഗങ്ങളിലേക്ക് മടങ്ങുക" : "Back to Categories"}
              title={lang === "ml" ? "വിഭാഗങ്ങളിലേക്ക് മടങ്ങുക" : "Back to Categories"}
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>
            <h2 className="absolute inset-y-0 left-10 right-10 flex items-center justify-center text-center text-[12.5px] font-extrabold text-[#0F172A] dark:text-white pointer-events-none truncate leading-tight">
              {lang === "ml" ? selectedCategory.nameMl : selectedCategory.nameEn}
            </h2>
          </div>
        </header>

        {/* Category Hero Card */}
        <div className="p-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs mb-2.5">
            <div className="relative h-10 w-10 shrink-0 rounded-lg bg-blue-50/60 dark:bg-slate-800 p-1.5 border border-blue-100/60 dark:border-slate-700 flex items-center justify-center overflow-hidden">
              <img
                src={selectedCategory.icon}
                alt={selectedCategory.nameEn}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <FolderTree className="h-5 w-5 text-[#243D95] fallback-icon" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {lang === "ml" ? selectedCategory.nameMl : selectedCategory.nameEn}
              </h3>
              <div className="mt-0.5 flex items-center gap-3 text-[10px] font-semibold">
                <span className="text-slate-500 dark:text-slate-400">
                  {catSchemesCount} {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                </span>
                <span className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
                  <Users className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                  {appCount} {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                </span>
              </div>
            </div>
          </div>

          {/* Applications under this Category */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {lang === "ml" ? "അപേക്ഷകൾ" : "Applications in Category"} ({appCount})
              </span>
            </div>

            {appCount === 0 ? (
              <div className="p-6 text-center rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                <Inbox className="h-7 w-7 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {lang === "ml" ? "ഈ വിഭാഗത്തിൽ അപേക്ഷകൾ ലഭിച്ചിട്ടില്ല." : "No applications found in this category."}
                </p>
              </div>
            ) : (
              categoryApplications.map((app, index) => {
                const badge = getStatusBadge(app);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={`${app.ref}-${index}`}
                    onClick={() => onSelectApplication(app)}
                    className="group relative px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="mb-1 flex items-center justify-between gap-1">
                      <span className="inline-block px-1.5 py-0.2 text-[9px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[200px]">
                        {lang === "ml" ? app.schemeNameMl : app.schemeNameEn}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${badge.className}`}
                      >
                        <BadgeIcon className="h-2.5 w-2.5 stroke-[2.2]" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2.5 mt-1.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#243D95] dark:text-blue-300 flex items-center justify-center text-[10.5px] font-extrabold shrink-0 border border-blue-200/60 dark:border-blue-900/40">
                          {(lang === "ml" ? app.applicantNameMl : app.applicantNameEn)?.slice(0, 2).toUpperCase() || "AP"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#243D95] transition-colors leading-tight">
                            {lang === "ml" ? app.applicantNameMl : app.applicantNameEn}
                          </h4>
                          <div className="flex items-center gap-1 text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lang === "ml" ? app.locationMl : app.locationEn}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-[#243D95] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {renderApplicationFilterSheet()}
      </div>
    );
  }

  // Root Reports Page View with 2 Tabs
  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-slate-950 pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FFFDF9] dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 px-3.5 py-1.5 shadow-2xs">
        <div className="relative flex h-9 items-center justify-between w-full">
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-[#FFF7EC] text-[#1b255a] hover:bg-orange-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer transition-colors border border-orange-100/80 dark:border-slate-700 shadow-2xs z-10"
            aria-label={lang === "ml" ? "തിരികെ പോവുക" : "Go back"}
            title={lang === "ml" ? "തിരികെ പോവുക" : "Go back"}
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
          </button>

          {/* Header Title */}
          <h1 className="absolute inset-y-0 left-10 right-20 flex items-center justify-center text-center text-[12.5px] font-extrabold text-[#0F172A] dark:text-white pointer-events-none truncate leading-tight">
            {lang === "ml" ? "പദ്ധതി തിരിച്ചുള്ള അപേക്ഷകൾ" : "Scheme-wise Applications"}
          </h1>

          {/* Right Action Buttons: Search & Application Filter */}
          <div className="flex items-center gap-1.5 shrink-0 z-10">
            {/* Quick Search Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-white text-[#1b255a] hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer transition-colors border border-slate-200/80 dark:border-slate-700 shadow-2xs"
              title={lang === "ml" ? "തിരയുക" : "Search"}
              aria-label={lang === "ml" ? "തിരയുക" : "Search"}
            >
              <Search className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>

            {/* Application Filter Button */}
            <button
              type="button"
              onClick={openFilterSheet}
              aria-haspopup="dialog"
              aria-expanded={isFilterSheetOpen}
              className={`relative flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full transition-all border shadow-2xs cursor-pointer ${
                activeFilterCount > 0
                  ? "bg-orange-500 text-white border-orange-500 shadow-xs ring-2 ring-orange-500/20"
                  : "bg-white text-[#1b255a] hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700"
              }`}
              title={lang === "ml" ? "അപേക്ഷാ ഫിൽട്ടർ" : "Application Filter"}
              aria-label={lang === "ml" ? "അപേക്ഷാ ഫിൽട്ടർ" : "Application Filter"}
            >
              <Filter
                className={`h-3.5 w-3.5 stroke-[2.2] ${
                  activeFilterCount > 0 ? "text-white" : "text-[#ff5500]"
                }`}
              />
              {activeFilterCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-black leading-none text-white ring-1.5 ring-white dark:ring-slate-900">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Collapsible Search Input */}
        {isSearchExpanded && (
          <div className="relative mt-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ml" ? "പദ്ധതികൾ തിരയുക..." : "Search schemes..."}
              className="w-full h-7.5 pl-8 pr-7 text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#243D95] shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </header>


      {/* Main Body - Scheme-wise Applications List */}
      <div className="p-2.5 space-y-2">
        <div className="space-y-1.5">
          {visibleSchemes.map((scheme) => {
            const schemeApps = filteredByScheme.get(scheme.id) || [];
            const stats = getSchemeStats(schemeApps);

            return (
              <div
                key={scheme.id}
                onClick={() => {
                  setSelectedScheme(scheme);
                  setSchemeStatusFilter("all");
                }}
                className="group flex flex-col gap-1.5 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer active:scale-[0.99]"
              >
                {/* Top Row: Scheme Logo, Name, Category & Chevron */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Left: Scheme Logo */}
                    <div className="relative h-7 w-7 shrink-0 rounded-md bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                      <img
                        src={scheme.logo}
                        alt={scheme.nameEn}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <FileText className="h-3 w-3 text-[#243D95] fallback-icon" />
                    </div>

                    {/* Middle: Scheme Name & Category */}
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <h3 className="text-[11px] font-bold text-slate-900 dark:text-white leading-none truncate group-hover:text-[#243D95] transition-colors">
                        {lang === "ml" ? scheme.nameMl : scheme.nameEn}
                      </h3>
                      <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate leading-none mt-0.5">
                        {lang === "ml" ? scheme.categoryMl : scheme.categoryEn}
                      </p>
                    </div>
                  </div>

                  {/* Right: Chevron Arrow (Count removed) */}
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#243D95] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

                {/* 5-KPI Segmented Status Bar (Compact padding, gap and spaces) */}
                <div className="flex items-stretch rounded-lg bg-[#FCFAF6] dark:bg-slate-900 border border-[#ECE7DF] dark:border-slate-800 shadow-2xs overflow-hidden divide-x divide-[#ECE7DF] dark:divide-slate-800">
                  {/* 1. Applications */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScheme(scheme);
                      setSchemeStatusFilter("all");
                    }}
                    className="flex-1 py-1 px-0.5 flex flex-col items-center justify-center bg-blue-50/70 dark:bg-blue-950/40 transition-colors cursor-pointer text-center hover:bg-blue-100/60 dark:hover:bg-blue-900/50"
                    title={lang === "ml" ? "എല്ലാ അപേക്ഷകളും" : "All Applications"}
                  >
                    <span className="text-[11.5px] font-extrabold text-[#0B2545] dark:text-blue-300 leading-none">
                      {stats.total}
                    </span>
                    <span className="text-[7.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap leading-none">
                      {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                    </span>
                  </button>

                  {/* 2. Approved */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScheme(scheme);
                      setSchemeStatusFilter("approved");
                    }}
                    className="flex-1 py-1 px-0.5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40"
                    title={lang === "ml" ? "അംഗീകരിച്ചവ" : "Approved"}
                  >
                    <span className="text-[11.5px] font-extrabold text-[#00875A] dark:text-emerald-400 leading-none">
                      {stats.approved}
                    </span>
                    <span className="text-[7.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap leading-none">
                      {lang === "ml" ? "അംഗീകാരം" : "Approved"}
                    </span>
                  </button>

                  {/* 3. In Review */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScheme(scheme);
                      setSchemeStatusFilter("in_review");
                    }}
                    className="flex-1 py-1 px-0.5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center hover:bg-sky-50/70 dark:hover:bg-sky-950/40"
                    title={lang === "ml" ? "പരിശോധനയിൽ" : "In Review"}
                  >
                    <span className="text-[11.5px] font-extrabold text-[#2563EB] dark:text-sky-400 leading-none">
                      {stats.inReview}
                    </span>
                    <span className="text-[7.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap leading-none">
                      {lang === "ml" ? "പരിശോധനയിൽ" : "In Review"}
                    </span>
                  </button>

                  {/* 4. Pending */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScheme(scheme);
                      setSchemeStatusFilter("pending");
                    }}
                    className="flex-1 py-1 px-0.5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center hover:bg-amber-50/70 dark:hover:bg-amber-950/40"
                    title={lang === "ml" ? "തീർപ്പുകൽപ്പിക്കാത്തവ" : "Pending"}
                  >
                    <span className="text-[11.5px] font-extrabold text-[#EA580C] dark:text-amber-400 leading-none">
                      {stats.pending}
                    </span>
                    <span className="text-[7.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap leading-none">
                      {lang === "ml" ? "തീർപ്പില്ലാത്തവ" : "Pending"}
                    </span>
                  </button>

                  {/* 5. Rejected */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScheme(scheme);
                      setSchemeStatusFilter("rejected");
                    }}
                    className="flex-1 py-1 px-0.5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center hover:bg-rose-50/70 dark:hover:bg-rose-950/40"
                    title={lang === "ml" ? "നിരസിച്ചവ" : "Rejected"}
                  >
                    <span className="text-[11.5px] font-extrabold text-[#DC2626] dark:text-rose-400 leading-none">
                      {stats.rejected}
                    </span>
                    <span className="text-[7.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap leading-none">
                      {lang === "ml" ? "നിരസിച്ചത്" : "Rejected"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}

          {visibleSchemes.length === 0 && (
            <div className="p-6 text-center rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {activeFilterCount > 0
                  ? (lang === "ml" ? "ഫിൽട്ടറുമായി പൊരുത്തപ്പെടുന്ന അപേക്ഷകൾ ഇല്ല." : "No applications match the selected filters.")
                  : (lang === "ml" ? "പദ്ധതികൾ കണ്ടെത്തിയില്ല." : "No schemes found.")}
              </p>
            </div>
          )}
        </div>
      </div>
      {renderApplicationFilterSheet()}
    </div>
  );
}
