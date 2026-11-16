import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  Layers,
  FolderTree,
  ChevronRight,
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

export function MobileReportsPage({
  onBack,
  applications = [],
  onSelectApplication,
}: MobileReportsPageProps) {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<"schemes" | "categories">("schemes");
  const [selectedScheme, setSelectedScheme] = useState<SchemeReportDef | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryReportDef | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Scheme Drilldown Search & Status Filter
  const [schemeAppSearchQuery, setSchemeAppSearchQuery] = useState("");
  const [isSchemeAppSearchExpanded, setIsSchemeAppSearchExpanded] = useState(false);
  const [schemeStatusFilter, setSchemeStatusFilter] = useState<"all" | "approved" | "in_review" | "in_progress" | "pending" | "rejected">("all");

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

    // Guarantee that every scheme has a rich complete roster of applications
    for (const scheme of REPORT_SCHEMES) {
      const existing = map.get(scheme.id) || [];
      const completeList = generateSchemeApplications(scheme, existing);
      map.set(scheme.id, completeList);
    }

    return map;
  }, [applications]);

  // Group applications by Category from schemes
  const applicationsByCategory = useMemo(() => {
    const map = new Map<string, MobileReportApplicationRecord[]>();
    for (const cat of REPORT_CATEGORIES) {
      map.set(cat.id, []);
    }

    for (const scheme of REPORT_SCHEMES) {
      const schemeApps = applicationsByScheme.get(scheme.id) || [];
      const catId = scheme.categoryId || "agriculture";
      if (!map.has(catId)) map.set(catId, []);
      map.get(catId)!.push(...schemeApps);
    }

    return map;
  }, [applicationsByScheme]);

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

  // Applications list for selected scheme
  const schemeApplications = useMemo(() => {
    if (!selectedScheme) return [];
    return applicationsByScheme.get(selectedScheme.id) || [];
  }, [selectedScheme, applicationsByScheme]);

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
    // Exact classification matching user rules:
    // Rejected: rejected
    // Pending: Received, Document Verified
    // In Review: in_review, in_progress, under_review, review
    // Approved: beneficiary, approved
    const getApplicationBucket = (
      app: MobileReportApplicationRecord
    ): "rejected" | "pending" | "in_review" | "approved" => {
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
    };

    const total = schemeApplications.length;
    let approved = 0;
    let inReview = 0;
    let pending = 0;
    let rejected = 0;

    for (const app of schemeApplications) {
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
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-3.5 py-1.5 shadow-2xs">
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
            <h2 className="absolute inset-x-0 text-center text-[13.5px] font-extrabold text-[#0F172A] dark:text-white pointer-events-none px-12 truncate leading-tight">
              {lang === "ml" ? selectedScheme.nameMl : selectedScheme.nameEn}
            </h2>
            <button
              type="button"
              onClick={() => setIsSchemeAppSearchExpanded(!isSchemeAppSearchExpanded)}
              className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-[#FFF7EC] text-[#1b255a] hover:bg-orange-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer transition-colors border border-orange-100/80 dark:border-slate-700 shadow-2xs z-10"
              aria-label={lang === "ml" ? "തിരയുക" : "Search"}
              title={lang === "ml" ? "തിരയുക" : "Search"}
            >
              <Search className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>
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
              {(schemeStatusFilter !== "all" || schemeAppSearchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSchemeStatusFilter("all");
                    setSchemeAppSearchQuery("");
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
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-3.5 py-1.5 shadow-2xs">
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
            <h2 className="absolute inset-x-0 text-center text-[13.5px] font-extrabold text-[#0F172A] dark:text-white pointer-events-none px-12 truncate leading-tight">
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
      </div>
    );
  }

  // Root Reports Page View with 2 Tabs
  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-slate-950 pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-3.5 py-1.5 shadow-2xs">
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
          <h1 className="absolute inset-x-0 text-center text-[13.5px] font-extrabold text-[#0F172A] dark:text-white pointer-events-none px-12 truncate leading-tight">
            {lang === "ml" ? "റിപ്പോർട്ടുകൾ" : "Reports"}
          </h1>

          {/* Quick Search Toggle */}
          <button
            type="button"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-[#FFF7EC] text-[#1b255a] hover:bg-orange-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer transition-colors border border-orange-100/80 dark:border-slate-700 shadow-2xs z-10"
            title={lang === "ml" ? "തിരയുക" : "Search"}
          >
            <Search className="h-3.5 w-3.5 stroke-[2.2]" />
          </button>
        </div>

        {/* Collapsible Search Input */}
        {isSearchExpanded && (
          <div className="relative mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "schemes"
                  ? lang === "ml" ? "പദ്ധതികൾ തിരയുക..." : "Search schemes..."
                  : lang === "ml" ? "വിഭാഗങ്ങൾ തിരയുക..." : "Search categories..."
              }
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

      {/* Main Body */}
      <div className="p-3 space-y-2.5">
        {/* 2 Tabs: Schemes (First) vs Categories (Next) - Underline Tab Style with Count */}
        <div
          role="tablist"
          aria-label={lang === "ml" ? "പദ്ധതികൾ അല്ലെങ്കിൽ വിഭാഗങ്ങൾ" : "Schemes or Categories"}
          className="grid grid-cols-2 border-b border-[#EADFD2] dark:border-slate-800"
        >
          {/* Tab 1: Schemes */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "schemes"}
            onClick={() => setActiveTab("schemes")}
            className={`relative flex items-center justify-center gap-1.5 pb-2 pt-1 text-[12.5px] font-extrabold tracking-tight transition-colors cursor-pointer ${
              activeTab === "schemes"
                ? "text-[#243D95] dark:text-blue-300"
                : "text-[#7C8AAE] hover:text-[#243D95] dark:text-slate-400 dark:hover:text-blue-300"
            }`}
          >
            <span>{lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}</span>
            <span className="text-[11px] font-bold opacity-80">({filteredSchemes.length})</span>
            <span
              aria-hidden="true"
              className={`absolute -bottom-px left-1/2 h-[2.5px] w-14 -translate-x-1/2 rounded-full transition-colors ${
                activeTab === "schemes" ? "bg-[#243D95] dark:bg-blue-300" : "bg-transparent"
              }`}
            />
          </button>

          {/* Tab 2: Categories */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "categories"}
            onClick={() => setActiveTab("categories")}
            className={`relative flex items-center justify-center gap-1.5 pb-2 pt-1 text-[12.5px] font-extrabold tracking-tight transition-colors cursor-pointer ${
              activeTab === "categories"
                ? "text-[#243D95] dark:text-blue-300"
                : "text-[#7C8AAE] hover:text-[#243D95] dark:text-slate-400 dark:hover:text-blue-300"
            }`}
          >
            <span>{lang === "ml" ? "വിഭാഗങ്ങൾ" : "Categories"}</span>
            <span className="text-[11px] font-bold opacity-80">({filteredCategories.length})</span>
            <span
              aria-hidden="true"
              className={`absolute -bottom-px left-1/2 h-[2.5px] w-14 -translate-x-1/2 rounded-full transition-colors ${
                activeTab === "categories" ? "bg-[#243D95] dark:bg-blue-300" : "bg-transparent"
              }`}
            />
          </button>
        </div>

        {/* TAB 1: Schemes View (First) */}
        {activeTab === "schemes" && (
          <div className="space-y-1.5">
            {filteredSchemes.map((scheme) => {
              const schemeApps = applicationsByScheme.get(scheme.id) || [];
              const appsCount = schemeApps.length;

              return (
                <div
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer active:scale-[0.99]"
                >
                  {/* Left: Scheme Logo */}
                  <div className="relative h-8 w-8 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    <img
                      src={scheme.logo}
                      alt={scheme.nameEn}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <FileText className="h-3.5 w-3.5 text-[#243D95] fallback-icon" />
                  </div>

                  {/* Middle: Scheme Name & Category */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight truncate group-hover:text-[#243D95] transition-colors">
                      {lang === "ml" ? scheme.nameMl : scheme.nameEn}
                    </h3>
                    <div className="mt-0.5">
                      <span className="inline-block text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {lang === "ml" ? scheme.categoryMl : scheme.categoryEn}
                      </span>
                    </div>
                  </div>

                  {/* Right: Application icon and count only near arrow button in orange color */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                      <FileText className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400 stroke-[2.2]" />
                      <span className="font-extrabold">{appsCount}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}

            {filteredSchemes.length === 0 && (
              <div className="p-6 text-center rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {lang === "ml" ? "പദ്ധതികൾ കണ്ടെത്തിയില്ല." : "No schemes found."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Categories View (Next) */}
        {activeTab === "categories" && (
          <div className="space-y-1.5">
            {filteredCategories.map((cat) => {
              const catApps = applicationsByCategory.get(cat.id) || [];
              const appsCount = catApps.length;
              const schemesCount = schemesCountByCategory[cat.id] || cat.schemesCount;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer active:scale-[0.99]"
                >
                  {/* Left: Category Icon */}
                  <div className="relative h-8 w-8 shrink-0 rounded-lg bg-blue-50/60 dark:bg-slate-800 p-1 border border-blue-100/60 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    <img
                      src={cat.icon}
                      alt={cat.nameEn}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <FolderTree className="h-3.5 w-3.5 text-[#243D95] fallback-icon" />
                  </div>

                  {/* Middle: Category Name & Scheme Count */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight truncate group-hover:text-[#243D95] transition-colors">
                      {lang === "ml" ? cat.nameMl : cat.nameEn}
                    </h3>
                    <p className="mt-0.5 text-[9px] font-medium text-slate-500 dark:text-slate-400">
                      {schemesCount} {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                    </p>
                  </div>

                  {/* Right: Application icon and count only near arrow button in orange color */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                      <FileText className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400 stroke-[2.2]" />
                      <span className="font-extrabold">{appsCount}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="p-6 text-center rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {lang === "ml" ? "വിഭാഗങ്ങൾ കണ്ടെത്തിയില്ല." : "No categories found."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
