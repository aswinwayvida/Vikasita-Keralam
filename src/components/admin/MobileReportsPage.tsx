import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
function ApplicationPeriodLabel({ text, lang, onChange }: { text: string; lang: string; onChange: () => void }) {
  const viewportRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const measure = () => setOverflow(Math.max(0, (textRef.current?.scrollWidth || 0) - (viewportRef.current?.clientWidth || 0)));
    measure();
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (textRef.current) observer.observe(textRef.current);
    return () => observer.disconnect();
  }, [text]);
  useEffect(() => setExpanded(false), [text]);
  return <>
    <style>{`@keyframes mobile-application-period-scroll { 0%, 20% { transform: translateX(0); } 45%, 65% { transform: translateX(calc(-1 * var(--period-overflow))); } 85%, 100% { transform: translateX(0); } } @media (prefers-reduced-motion: reduce) { .mobile-application-period-scroll { animation: none !important; } }`}</style>
    <button type="button" onClick={() => setExpanded(value => !value)} aria-label={`${lang === "ml" ? "തിരഞ്ഞെടുത്ത തീയതി" : "Selected date"}: ${text}`} aria-expanded={expanded} className="min-w-0 flex-1 px-1 text-left font-display text-[10px] font-semibold leading-none tracking-tight text-[#0a0f1d] dark:text-white sm:text-[11px]">
      <span ref={viewportRef} className="block overflow-hidden whitespace-nowrap"><span ref={textRef} className={overflow > 0 ? "mobile-application-period-scroll inline-block" : "inline-block"} style={overflow > 0 ? { "--period-overflow": `${overflow}px`, animation: "mobile-application-period-scroll 12s ease-in-out infinite" } as React.CSSProperties : undefined}>{text}</span></span>
    </button>
    {expanded && <div className="absolute left-3 right-3 top-full z-30 mt-1 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"><span className="text-xs font-semibold text-slate-900 dark:text-white">{text}</span><button type="button" onClick={() => { setExpanded(false); onChange(); }} className="shrink-0 text-xs font-bold text-orange-600">{lang === "ml" ? "മാറ്റുക" : "Change"}</button><button type="button" onClick={() => setExpanded(false)} aria-label={lang === "ml" ? "അടയ്ക്കുക" : "Close"}><X className="h-4 w-4 text-slate-500" /></button></div>}
  </>;
}
import { MobileFilterPicker } from "./MobileFilterPicker";
import { MOBILE_SAMPLE_DEPARTMENTS, MOBILE_SAMPLE_SCHEME_DEPARTMENT } from "./mobileSampleDepartments";
import {
  ArrowLeft,
  ChevronLeft,
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
  FileSearch,
  HandCoins,
  XCircle,
  MoreVertical,
  ArrowUpDown,
  Pencil,
  Phone,
  Sparkles,
  Trash2,
  Share2,
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
  applicationFilterInPhone?: boolean;
  initialHomeLocation?: { level: "region" | "org_district" | "mandalam"; region?: string; district?: string; mandalam?: string } | null;
  initialKpiStatuses?: string[] | null;
  onBack: () => void;
  applications: MobileReportApplicationRecord[];
  onSelectApplication: (application: MobileReportApplicationRecord) => void;
  initialSelectedSchemeId?: string | null;
  onOpenApplicationFilter?: () => void;
  isFilterActive?: boolean;
  filterCount?: number;
  headerStyle?: "default" | "period_controls";
  periodText?: string;
  onOpenDatePicker?: () => void;
  onStepPeriod?: (direction: number) => void;
  onDrilldownChange?: (isDrilldown: boolean) => void;
  onEditApplication?: (application: MobileReportApplicationRecord) => void;
  onCallApplication?: (application: MobileReportApplicationRecord) => void;
  onCheckEligibility?: (application: MobileReportApplicationRecord) => void;
  onDocumentVerification?: (application: MobileReportApplicationRecord) => void;
  onDeleteApplication?: (application: MobileReportApplicationRecord) => void;
  onOpenSchemeDetails?: (schemeName: string) => void;
  onApplyScheme?: (schemeName: string) => void;
  onShareScheme?: (schemeName: string) => void;
  userRole?: "state_admin" | "party_worker";
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

type SchemeStatusBucket = "approved" | "in_review" | "pending" | "rejected" | "received" | "verified" | "applied";
type SchemeWorkView = "my_work" | "team";
type SchemeLocationLevel = "state" | "region" | "org_district" | "mandalam" | "area" | "ward";
type SchemeLocationField = "level" | "region" | "orgDistrict" | "mandalam" | "area" | "ward";
type SchemeFilterField = SchemeLocationField | "category" | "scheme" | "sortBy";

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
  category?: string;
  department?: string;
  scheme?: string;
  sortBy?: string;
  designation?: string;
  teamMember?: string;
}

const createEmptySchemeLocation = (): SchemeLocationFilter => ({
  region: "",
  orgDistrict: "",
  mandalam: "",
  area: "",
  ward: "",
});

const createDefaultSchemeFilter = (): SchemeFilterState => ({
  workView: "my_work",
  statuses: [],
  locationLevel: "state",
  location: createEmptySchemeLocation(),
  category: "all",
  department: "all",
  scheme: "all",
  sortBy: "benefits_high_low",
  designation: "all",
  teamMember: "all",
});

interface DesignationOption {
  id: string;
  en: string;
  ml: string;
}

const DESIGNATION_OPTIONS_BY_LEVEL: Record<SchemeLocationLevel, DesignationOption[]> = {
  state: [
    { id: "all", en: "All Designations", ml: "എല്ലാ പദവികളും" },
    { id: "state_president", en: "State President", ml: "സംസ്ഥാന പ്രസിഡന്റ്" },
    { id: "state_gen_sec", en: "State General Secretary", ml: "സംസ്ഥാന ജനറൽ സെക്രട്ടറി" },
    { id: "state_convenor", en: "State Convenor", ml: "സംസ്ഥാന കൺവീനർ" },
    { id: "state_exec_member", en: "State Executive Member", ml: "സംസ്ഥാന എക്സിക്യൂട്ടീവ് അംഗം" },
  ],
  region: [
    { id: "all", en: "All Designations", ml: "എല്ലാ പദവികളും" },
    { id: "region_president", en: "Regional President", ml: "മേഖല പ്രസിഡന്റ്" },
    { id: "district_president", en: "District President", ml: "ജില്ലാ പ്രസിഡന്റ്" },
    { id: "district_gen_sec", en: "District General Secretary", ml: "ജില്ലാ ജനറൽ സെക്രട്ടറി" },
    { id: "district_exec_member", en: "District Executive Member", ml: "ജില്ലാ എക്സിക്യൂട്ടീവ് അംഗം" },
  ],
  org_district: [
    { id: "all", en: "All Designations", ml: "എല്ലാ പദവികളും" },
    { id: "district_president", en: "District President", ml: "ജില്ലാ പ്രസിഡന്റ്" },
    { id: "district_gen_sec", en: "District General Secretary", ml: "ജില്ലാ ജനറൽ സെക്രട്ടറി" },
    { id: "district_exec_member", en: "District Executive Member", ml: "ജില്ലാ എക്സിക്യൂട്ടീവ് അംഗം" },
  ],
  mandalam: [
    { id: "all", en: "All Designations", ml: "എല്ലാ പദവികളും" },
    { id: "mandalam_president", en: "Mandalam President", ml: "മണ്ഡലം പ്രസിഡന്റ്" },
    { id: "mandalam_gen_sec", en: "Mandalam General Secretary", ml: "മണ്ഡലം ജനറൽ സെക്രട്ടറി" },
    { id: "mandalam_vice_president", en: "Mandalam Vice President", ml: "മണ്ഡലം വൈസ് പ്രസിഡന്റ്" },
  ],
  area: [
    { id: "all", en: "All Designations", ml: "എല്ലാ പദവികളും" },
    { id: "area_president", en: "Area President", ml: "ഏരിയ പ്രസിഡന്റ്" },
    { id: "area_secretary", en: "Area Secretary", ml: "ഏരിയ സെക്രട്ടറി" },
    { id: "area_exec_member", en: "Area Executive Member", ml: "ഏരിയ എക്സിക്യൂട്ടീവ് അംഗം" },
  ],
  ward: [
    { id: "all", en: "All Designations", ml: "എല്ലാ പദവികളും" },
    { id: "booth_president", en: "Booth President", ml: "ബൂത്ത് പ്രസിഡന്റ്" },
    { id: "booth_secretary", en: "Booth Secretary", ml: "ബൂത്ത് സെക്രട്ടറി" },
    { id: "booth_incharge", en: "Booth In-charge", ml: "ബൂത്ത് ഇൻ-ചാർജ്" },
  ],
};

interface TeamMemberDef {
  id: string;
  name: string;
  designationId: string;
  designationEn: string;
  designationMl: string;
  level: SchemeLocationLevel;
}

const TEAM_MEMBER_OPTIONS: TeamMemberDef[] = [
  { id: "k_p_radhakrishnan", name: "K. P. Radhakrishnan", designationId: "state_president", designationEn: "State President", designationMl: "സംസ്ഥാന പ്രസിഡന്റ്", level: "state" },
  { id: "sunil_kumar", name: "Sunil Kumar", designationId: "state_gen_sec", designationEn: "State General Secretary", designationMl: "സംസ്ഥാന ജനറൽ സെക്രട്ടറി", level: "state" },
  { id: "meena_p", name: "Meena P.", designationId: "state_convenor", designationEn: "State Convenor", designationMl: "സംസ്ഥാന കൺവീനർ", level: "state" },
  { id: "anil_v", name: "Anil V.", designationId: "state_exec_member", designationEn: "State Executive Member", designationMl: "സംസ്ഥാന എക്സിക്യൂട്ടീവ് അംഗം", level: "state" },

  { id: "rajesh_v", name: "Rajesh V", designationId: "district_president", designationEn: "District President", designationMl: "ജില്ലാ പ്രസിഡന്റ്", level: "region" },
  { id: "gopika_r", name: "Gopika R", designationId: "district_gen_sec", designationEn: "District General Secretary", designationMl: "ജില്ലാ ജനറൽ സെക്രട്ടറി", level: "region" },
  { id: "hari_m", name: "Hari M", designationId: "district_exec_member", designationEn: "District Executive Member", designationMl: "ജില്ലാ എക്സിക്യൂട്ടീവ് അംഗം", level: "region" },

  { id: "rajesh_v", name: "Rajesh V", designationId: "district_president", designationEn: "District President", designationMl: "ജില്ലാ പ്രസിഡന്റ്", level: "org_district" },
  { id: "gopika_r", name: "Gopika R", designationId: "district_gen_sec", designationEn: "District General Secretary", designationMl: "ജില്ലാ ജനറൽ സെക്രട്ടറി", level: "org_district" },
  { id: "hari_m", name: "Hari M", designationId: "district_exec_member", designationEn: "District Executive Member", designationMl: "ജില്ലാ എക്സിക്യൂട്ടീവ് അംഗം", level: "org_district" },

  { id: "suresh_kumar", name: "Suresh Kumar", designationId: "mandalam_president", designationEn: "Mandalam President", designationMl: "മണ്ഡലം പ്രസിഡന്റ്", level: "mandalam" },
  { id: "renjith_s", name: "Renjith S", designationId: "mandalam_gen_sec", designationEn: "Mandalam General Secretary", designationMl: "മണ്ഡലം ജനറൽ സെക്രട്ടറി", level: "mandalam" },
  { id: "deepa_n", name: "Deepa N", designationId: "mandalam_vice_president", designationEn: "Mandalam Vice President", designationMl: "മണ്ഡലം വൈസ് പ്രസിഡന്റ്", level: "mandalam" },

  { id: "dhyan", name: "Dhyan M S", designationId: "area_president", designationEn: "Area President", designationMl: "ഏരിയ പ്രസിഡന്റ്", level: "area" },
  { id: "rahul_k", name: "Rahul K", designationId: "area_secretary", designationEn: "Area Secretary", designationMl: "ഏരിയ സെക്രട്ടറി", level: "area" },
  { id: "priya_m", name: "Priya M", designationId: "area_exec_member", designationEn: "Area Executive Member", designationMl: "ഏരിയ എക്സിക്യൂട്ടീവ് അംഗം", level: "area" },

  { id: "anjali", name: "Anjali Nair", designationId: "booth_president", designationEn: "Booth Worker", designationMl: "ബൂത്ത് വർക്കർ", level: "ward" },
  { id: "vinu_s", name: "Vinu S", designationId: "booth_secretary", designationEn: "Booth Secretary", designationMl: "ബൂത്ത് സെക്രട്ടറി", level: "ward" },
  { id: "manoj_k", name: "Manoj K", designationId: "booth_incharge", designationEn: "Booth In-charge", designationMl: "ബൂത്ത് ഇൻ-ചാർജ്", level: "ward" },
];

const getFilteredTeamMembers = (level: SchemeLocationLevel, designationId?: string) => {
  const levelMembers = TEAM_MEMBER_OPTIONS.filter((m) => m.level === level);
  if (!designationId || designationId === "all") {
    return levelMembers;
  }
  return levelMembers.filter((m) => m.designationId === designationId);
};

const SCHEME_CARD_SORT_OPTIONS = [
  { value: "total_desc", label: "Applications: ↓" }, { value: "total_asc", label: "Applications: ↑" },
  { value: "approved_desc", label: "Beneficiary: ↓" }, { value: "approved_asc", label: "Beneficiary: ↑" },
  { value: "pending_desc", label: "Pending: ↓" }, { value: "pending_asc", label: "Pending: ↑" },
  { value: "review_desc", label: "In Review: ↓" }, { value: "review_asc", label: "In Review: ↑" },
  { value: "rejected_desc", label: "Rejected: ↓" }, { value: "rejected_asc", label: "Rejected: ↑" },
  { value: "name_asc", label: "Scheme Name: A → Z" }, { value: "name_desc", label: "Scheme Name: Z → A" },
];
const SCHEME_SORT_METRICS = [
  { value: "total", en: "Applications", ml: "അപേക്ഷകൾ" },
  { value: "approved", en: "Beneficiaries", ml: "ഗുണഭോക്താക്കൾ" },
  { value: "pending", en: "Pending", ml: "തീർപ്പാകാത്തവ" },
  { value: "review", en: "In Review", ml: "പരിശോധനയിൽ" },
  { value: "rejected", en: "Rejected", ml: "നിരസിച്ചവ" },
  { value: "name", en: "Scheme Name", ml: "പദ്ധതിയുടെ പേര്" },
];

const SORT_BY_OPTIONS = [
  {
    id: "benefits_high_low",
    en: "Benefits Received: High to Low",
    ml: "ലഭിച്ച ആനുകൂല്യങ്ങൾ: ഉയർന്നതിൽ നിന്ന് താഴ്ന്നതിലേക്ക്",
  },
  {
    id: "benefits_low_high",
    en: "Benefits Received: Low to High",
    ml: "ലഭിച്ച ആനുകൂല്യങ്ങൾ: താഴ്ന്നതിൽ നിന്ന് ഉയർന്നതിലേക്ക്",
  },
  {
    id: "pending_high_low",
    en: "Pending Applications: High to Low",
    ml: "തീർപ്പുകൽപ്പിക്കാത്ത അപേക്ഷകൾ: ഉയർന്നതിൽ നിന്ന് താഴ്ന്നതിലേക്ക്",
  },
  {
    id: "pending_low_high",
    en: "Pending Applications: Low to High",
    ml: "തീർപ്പുകൽപ്പിക്കാത്ത അപേക്ഷകൾ: താഴ്ന്നതിൽ നിന്ന് ഉയർന്നതിലേക്ക്",
  },
  {
    id: "review_high_low",
    en: "In Review: High to Low",
    ml: "പരിശോധനയിലുള്ളവ: ഉയർന്നതിൽ നിന്ന് താഴ്ന്നതിലേക്ക്",
  },
  {
    id: "review_low_high",
    en: "In Review: Low to High",
    ml: "പരിശോധനയിലുള്ളവ: താഴ്ന്നതിൽ നിന്ന് ഉയർന്നതിലേക്ക്",
  },
];

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
  { value: "north", en: "Northern Region", ml: "നോർത്തേൺ റീജിയൺ" },
  { value: "central", en: "Central Region", ml: "സെൻട്രൽ റീജിയൺ" },
  { value: "south", en: "Southern Region", ml: "സതേൺ റീജിയൺ" },
];

const KERALA_ORG_DISTRICTS: SchemeOrgDistrictOption[] = [
  // 1. Northern Region (10 Organisational Districts, 48 Mandalams)
  { value: "kasaragod", en: "Kasaragod", ml: "കാസർഗോഡ്", region: "north" },
  { value: "kannur_north", en: "Kannur North", ml: "കണ്ണൂർ നോർത്ത്", region: "north" },
  { value: "kannur_south", en: "Kannur South", ml: "കണ്ണൂർ സൗത്ത്", region: "north" },
  { value: "wayanad", en: "Wayanad", ml: "വയനാട്", region: "north" },
  { value: "kozhikode_city", en: "Kozhikode City", ml: "കോഴിക്കോട് സിറ്റി", region: "north" },
  { value: "kozhikode_north", en: "Kozhikode North", ml: "കോഴിക്കോട് നോർത്ത്", region: "north" },
  { value: "kozhikode_rural", en: "Kozhikode Rural", ml: "കോഴിക്കോട് റൂറൽ", region: "north" },
  { value: "malappuram_central", en: "Malappuram Central", ml: "മലപ്പുറം സെൻട്രൽ", region: "north" },
  { value: "malappuram_east", en: "Malappuram East", ml: "മലപ്പുറം ഈസ്റ്റ്", region: "north" },
  { value: "malappuram_west", en: "Malappuram West", ml: "മലപ്പുറം വെസ്റ്റ്", region: "north" },

  // 2. Central Region (12 Organisational Districts, 53 Mandalams)
  { value: "palakkad_east", en: "Palakkad East", ml: "പാലക്കാട് ഈസ്റ്റ്", region: "central" },
  { value: "palakkad_west", en: "Palakkad West", ml: "പാലക്കാട് വെസ്റ്റ്", region: "central" },
  { value: "thrissur_city", en: "Thrissur City", ml: "തൃശൂർ സിറ്റി", region: "central" },
  { value: "thrissur_north", en: "Thrissur North", ml: "തൃശൂർ നോർത്ത്", region: "central" },
  { value: "thrissur_south", en: "Thrissur South", ml: "തൃശൂർ സൗത്ത്", region: "central" },
  { value: "ernakulam_city", en: "Ernakulam City", ml: "എറണാകുളം സിറ്റി", region: "central" },
  { value: "ernakulam_north", en: "Ernakulam North", ml: "എറണാകുളം നോർത്ത്", region: "central" },
  { value: "ernakulam_east", en: "Ernakulam East", ml: "എറണാകുളം ഈസ്റ്റ്", region: "central" },
  { value: "idukki_north", en: "Idukki North", ml: "ഇടുക്കി നോർത്ത്", region: "central" },
  { value: "idukki_south", en: "Idukki South", ml: "ഇടുക്കി സൗത്ത്", region: "central" },
  { value: "kottayam_east", en: "Kottayam East", ml: "കോട്ടയം ഈസ്റ്റ്", region: "central" },
  { value: "kottayam_west", en: "Kottayam West", ml: "കോട്ടയം വെസ്റ്റ്", region: "central" },

  // 3. Southern Region (8 Organisational Districts, 39 Mandalams)
  { value: "alappuzha_north", en: "Alappuzha North", ml: "ആലപ്പുഴ നോർത്ത്", region: "south" },
  { value: "alappuzha_south", en: "Alappuzha South", ml: "ആലപ്പുഴ സൗത്ത്", region: "south" },
  { value: "pathanamthitta", en: "Pathanamthitta", ml: "പത്തനംതിട്ട", region: "south" },
  { value: "kollam_east", en: "Kollam East", ml: "കൊല്ലം ഈസ്റ്റ്", region: "south" },
  { value: "kollam_west", en: "Kollam West", ml: "കൊല്ലം വെസ്റ്റ്", region: "south" },
  { value: "thiruvananthapuram_city", en: "Thiruvananthapuram City", ml: "തിരുവനന്തപുരം സിറ്റി", region: "south" },
  { value: "thiruvananthapuram_north", en: "Thiruvananthapuram North", ml: "തിരുവനന്തപുരം നോർത്ത്", region: "south" },
  { value: "thiruvananthapuram_south", en: "Thiruvananthapuram South", ml: "തിരുവനന്തപുരം സൗത്ത്", region: "south" },
];

const ORGANISATIONAL_DISTRICT_MANDALAMS: Record<string, string[]> = {
  // Northern Region
  "kasaragod": ["Manjeshwar", "Kasaragod", "Udma", "Kanhangad", "Trikaripur"],
  "kannur_north": ["Payyannur", "Kalliasseri", "Taliparamba", "Irikkur", "Azhikode"],
  "kannur_south": ["Kannur", "Dharmadam", "Thalassery", "Kuthuparamba", "Mattannur", "Peravoor"],
  "wayanad": ["Mananthavady", "Sulthan Bathery", "Kalpetta"],
  "kozhikode_city": ["Elathur", "Kozhikode North", "Kozhikode South", "Beypore"],
  "kozhikode_north": ["Vadakara", "Kuttiadi", "Nadapuram", "Quilandy", "Perambra"],
  "kozhikode_rural": ["Balussery", "Kunnamangalam", "Koduvally", "Thiruvambady"],
  "malappuram_central": ["Kondotty", "Manjeri", "Malappuram", "Mankada", "Perinthalmanna"],
  "malappuram_east": ["Eranad", "Nilambur", "Wandoor", "Vengara", "Vallikkunnu"],
  "malappuram_west": ["Tirurangadi", "Tanur", "Tirur", "Kottakkal", "Thavanur", "Ponnani"],

  // Central Region
  "palakkad_east": ["Kongad", "Malampuzha", "Palakkad", "Chittur", "Nenmara", "Alathur"],
  "palakkad_west": ["Thrithala", "Pattambi", "Shornur", "Ottapalam", "Mannarkad", "Tarur"],
  "thrissur_city": ["Thrissur", "Ollur", "Manalur", "Nattika"],
  "thrissur_north": ["Chelakkara", "Kunnamkulam", "Guruvayoor", "Wadakkanchery"],
  "thrissur_south": ["Kaipamangalam", "Irinjalakkuda", "Puthukkad", "Chalakkudy", "Kodungallur"],
  "ernakulam_city": ["Kochi", "Ernakulam", "Thripunithura", "Thrikkakara", "Vypen"],
  "ernakulam_north": ["Angamaly", "Aluva", "Kalamassery", "Paravur"],
  "ernakulam_east": ["Perumbavoor", "Kunnathunad", "Piravom", "Muvattupuzha", "Kothamangalam"],
  "idukki_north": ["Devikulam", "Udumbanchola", "Thodupuzha"],
  "idukki_south": ["Idukki", "Peerumade"],
  "kottayam_east": ["Poonjar", "Kanjirappally", "Changanassery", "Puthuppally"],
  "kottayam_west": ["Pala", "Kaduthuruthy", "Vaikom", "Ettumanoor", "Kottayam"],

  // Southern Region
  "alappuzha_north": ["Aroor", "Cherthala", "Alappuzha", "Ambalapuzha"],
  "alappuzha_south": ["Kuttanad", "Haripad", "Kayamkulam", "Mavelikara", "Chengannur"],
  "pathanamthitta": ["Thiruvalla", "Ranni", "Aranmula", "Konni", "Adoor"],
  "kollam_east": ["Kunnathur", "Kottarakkara", "Pathanapuram", "Punalur", "Chadayamangalam", "Kundara"],
  "kollam_west": ["Karunagappally", "Chavara", "Kollam", "Eravipuram", "Chathannur"],
  "thiruvananthapuram_city": ["Kazhakkoottam", "Vattiyoorkavu", "Thiruvananthapuram", "Nemom"],
  "thiruvananthapuram_north": ["Varkala", "Attingal", "Chirayinkeezhu", "Nedumangad", "Vamanapuram", "Aruvikkara"],
  "thiruvananthapuram_south": ["Parassala", "Kattakkada", "Kovalam", "Neyyattinkara"]
};

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
  if (!key) return undefined;
  const directMatch = KERALA_ORG_DISTRICTS.find(
    (district) => district.value === key || normalizeLocationValue(district.en) === key
  );
  if (directMatch) return directMatch;

  // Check if any mandalam matches, returning its parent district
  for (const [distKey, mandalams] of Object.entries(ORGANISATIONAL_DISTRICT_MANDALAMS)) {
    if (mandalams.some((m) => normalizeLocationValue(m) === key)) {
      return KERALA_ORG_DISTRICTS.find((d) => d.value === distKey);
    }
  }

  // Fallback substring matching for legacy district names
  return KERALA_ORG_DISTRICTS.find(
    (district) =>
      normalizeLocationValue(district.en).includes(key) ||
      key.includes(normalizeLocationValue(district.en))
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

export const getApplicationLocationHierarchy = (app: MobileReportApplicationRecord) => {
  const { localityEn, districtEn } = splitSchemeLocation(app.locationEn, app.locationMl);
  let district = getSchemeOrgDistrictDef(districtEn);
  if (!district && localityEn) {
    district = getSchemeOrgDistrictDef(localityEn);
  }
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

// Explicit demo assignments; records without a listed locality remain unassigned.
const SAMPLE_ORGANISATION_ASSIGNMENTS: Record<string, { district: string; mandalam: string; area: string; ward: string }> = {
  "Malappuram Central": { district: "malappuram_central", mandalam: "Malappuram", area: "Central Area", ward: "Ward 1" },
  "Palakkad North": { district: "palakkad_east", mandalam: "Palakkad", area: "North Area", ward: "Ward 2" },
  Ollur: { district: "thrissur_city", mandalam: "Ollur", area: "South Area", ward: "Ward 3" },
  "Kottayam East": { district: "kottayam_west", mandalam: "Kottayam", area: "Central Area", ward: "Ward 4" },
  "Kannur Town": { district: "kannur_south", mandalam: "Kannur", area: "North Area", ward: "Ward 5" },
  Koyilandy: { district: "kozhikode_north", mandalam: "Quilandy", area: "Central Area", ward: "Ward 6" },
  Nedumangad: { district: "thiruvananthapuram_north", mandalam: "Nedumangad", area: "North Area", ward: "Ward 7" },
  Chavara: { district: "kollam_west", mandalam: "Chavara", area: "South Area", ward: "Ward 8" },
  Aluva: { district: "ernakulam_north", mandalam: "Aluva", area: "Central Area", ward: "Ward 9" },
  Tirur: { district: "malappuram_west", mandalam: "Tirur", area: "South Area", ward: "Ward 10" },
  Alathur: { district: "palakkad_east", mandalam: "Alathur", area: "South Area", ward: "Ward 1" },
  Kanjirappally: { district: "kottayam_east", mandalam: "Kanjirappally", area: "North Area", ward: "Ward 2" },
  Vadakara: { district: "kozhikode_north", mandalam: "Vadakara", area: "North Area", ward: "Ward 3" },
  Neyyattinkara: { district: "thiruvananthapuram_south", mandalam: "Neyyattinkara", area: "South Area", ward: "Ward 4" },
  Chittur: { district: "palakkad_east", mandalam: "Chittur", area: "Central Area", ward: "Ward 5" },
  Karunagappally: { district: "kollam_west", mandalam: "Karunagappally", area: "North Area", ward: "Ward 6" },
  Thiruvalla: { district: "pathanamthitta", mandalam: "Thiruvalla", area: "Central Area", ward: "Ward 7" },
  Mananthavady: { district: "wayanad", mandalam: "Mananthavady", area: "North Area", ward: "Ward 8" },
  Cherthala: { district: "alappuzha_north", mandalam: "Cherthala", area: "Central Area", ward: "Ward 9" },
  Kanhangad: { district: "kasaragod", mandalam: "Kanhangad", area: "South Area", ward: "Ward 10" },
};

// Curated supplementary roster generator per scheme to guarantee rich application list
const SCHEME_SAMPLE_FIRST_NAMES: [string, string][] = [
  ["Amal", "അമൽ"], ["Devika", "ദേവിക"], ["Arun", "അരുൺ"], ["Meera", "മീര"],
  ["Vishnu", "വിഷ്ണു"], ["Anjali", "അഞ്ജലി"], ["Rahul", "രാഹുൽ"], ["Lakshmi", "ലക്ഷ്മി"],
  ["Adithya", "ആദിത്യ"], ["Sreelakshmi", "ശ്രീലക്ഷ്മി"], ["Nikhil", "നിഖിൽ"], ["Aparna", "അപർണ"],
  ["Sanjay", "സഞ്ജയ്"], ["Athira", "ആതിര"], ["Anand", "ആനന്ദ്"], ["Reshma", "രേഷ്മ"],
  ["Akhil", "അഖിൽ"], ["Kavya", "കാവ്യ"], ["Jithu", "ജിത്തു"], ["Haritha", "ഹരിത"],
  ["Pranav", "പ്രണവ്"], ["Gopika", "ഗോപിക"], ["Abhijith", "അഭിജിത്ത്"], ["Sneha", "സ്നേഹ"],
  ["Sooraj", "സൂരജ്"], ["Ananya", "അനന്യ"], ["Midhun", "മിഥുൻ"], ["Arya", "ആര്യ"],
  ["Sarath", "ശരത്"], ["Parvathy", "പാർവ്വതി"], ["Deepak", "ദീപക്"], ["Karthika", "കാർത്തിക"],
  ["Vignesh", "വിഘ്നേഷ്"], ["Swathi", "സ്വാതി"], ["Aswin", "അശ്വിൻ"], ["Divya", "ദിവ്യ"],
  ["Manoj", "മനോജ്"], ["Pooja", "പൂജ"], ["Vivek", "വിവേക്"], ["Keerthi", "കീർത്തി"],
  ["Sreeraj", "ശ്രീരാജ്"], ["Malavika", "മാളവിക"], ["Harikrishnan", "ഹരികൃഷ്ണൻ"], ["Shilpa", "ശിൽപ"],
  ["Gokul", "ഗോകുൽ"], ["Nandana", "നന്ദന"], ["Rohit", "രോഹിത്"], ["Archana", "അർച്ചന"],
  ["Kiran", "കിരൺ"], ["Gayathri", "ഗായത്രി"], ["Bipin", "ബിപിൻ"], ["Manju", "മഞ്ജു"],
  ["Sudheesh", "സുധീഷ്"], ["Sandhya", "സന്ധ്യ"], ["Rajesh", "രാജേഷ്"], ["Ritu", "റിതു"],
  ["Suresh", "സുരേഷ്"], ["Remya", "രമ്യ"], ["Jayesh", "ജയേഷ്"], ["Deepa", "ദീപ"],
  ["Praveen", "പ്രവീൺ"], ["Veena", "വീണ"], ["Sunil", "സുനിൽ"], ["Anupama", "അനുപമ"],
  ["Vineeth", "വിനീത്"], ["Nimisha", "നിമിഷ"], ["Ajith", "അജിത്ത്"], ["Sangeetha", "സംഗീത"],
  ["Unnikrishnan", "ഉണ്ണികൃഷ്ണൻ"], ["Asha", "ആശ"], ["Sreejith", "ശ്രീജിത്ത്"], ["Soumya", "സൗമ്യ"],
  ["Mahesh", "മഹേഷ്"], ["Sujatha", "സുജാത"], ["Pradeep", "പ്രദീപ്"], ["Bindu", "ബിന്ദു"],
  ["Vijayan", "വിജയൻ"], ["Geetha", "ഗീത"], ["Mohanan", "മോഹനൻ"], ["Sobhana", "ശോഭന"],
  ["Gopalakrishnan", "ഗോപാലകൃഷ്ണൻ"], ["Radha", "രാധ"], ["Sadasivan", "സദാശിവൻ"], ["Vasantha", "വസന്ത"],
  ["Kuttappan", "കുട്ടപ്പൻ"], ["Saraswathi", "സരസ്വതി"], ["Damodaran", "ദാമോദരൻ"], ["Bhavani", "ഭവാനി"],
  ["Raman Nair", "രാമൻ നായർ"], ["Kamala", "കമലാ"], ["Raghavan", "രാഘവൻ"], ["Thankam", "തങ്കം"],
  ["Velayudhan", "വേലായുധൻ"], ["Janaki", "ജാനകി"], ["Balakrishnan", "ബാലകൃഷ്ണൻ"], ["Devaki", "ദേവകി"],
  ["Sankaran", "ശങ്കരൻ"], ["Meenakshi", "മീനാക്ഷി"], ["Kumaran", "കുമാരൻ"], ["Kalyani", "കല്യാണി"],
];

const SCHEME_SAMPLE_LAST_NAMES: [string, string][] = [
  ["Nair", "നായർ"], ["Menon", "മേനോൻ"], ["Pillai", "പിള്ള"], ["Varma", "വർമ്മ"],
  ["Kurup", "കുറുപ്പ്"], ["Panicker", "പണിക്കർ"], ["Nambiar", "നമ്പ്യാർ"], ["Namboodiri", "നമ്പൂതിരി"],
  ["Marar", "മാരാർ"], ["Warrier", "വാരിയർ"], ["Pisharody", "പിഷാരോടി"], ["Poduval", "പൊതുവാൾ"],
  ["Vaidyan", "വൈദ്യൻ"], ["Kaimal", "കൈമൾ"], ["Unnithan", "ഉണ്ണിത്താൻ"], ["Valiathan", "വലിയത്താൻ"],
  ["Thampi", "തമ്പി"], ["Elayath", "ഇളയത്"], ["Moothath", "മൂത്തത്"], ["Nedungadi", "നെടുങ്ങാടി"],
  ["Varghese", "വർഗ്ഗീസ്"], ["Joseph", "ജോസഫ്"], ["Thomas", "തോമസ്"], ["Mathew", "മാത്യു"],
  ["George", "ജോർജ്"], ["Philip", "ഫിലിപ്പ്"], ["Alexander", "അലക്സാണ്ടർ"], ["Chacko", "ചാക്കോ"],
  ["Shafee", "ഷാഫി"], ["Rahiman", "റഹിമാൻ"], ["Ahammed", "അഹമ്മദ്"], ["Hassan", "ഹസ്സൻ"],
  ["Ali", "അലി"], ["Khan", "ഖാൻ"], ["Rawther", "റാവുത്തർ"], ["Koya", "കോയ"],
];

const generateSchemeApplications = (
  scheme: SchemeReportDef,
  existingApps: MobileReportApplicationRecord[],
  targetCount = 7,
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
  const expandedSamples = targetCount === 20;
  const desiredCount = expandedSamples ? 28 + (hash % 125) : targetCount;

  for (let i = 0; i < (expandedSamples ? desiredCount + poolLen : poolLen) && result.length < desiredCount; i++) {
    const poolIdx = (hash + i) % poolLen;
    const person = KERALA_APPLICANT_POOL[poolIdx];
    let nameEn = person.nameEn;
    let nameMl = person.nameMl;
    if (expandedSamples && i >= poolLen) {
      const fn = SCHEME_SAMPLE_FIRST_NAMES[(hash + i * 7) % SCHEME_SAMPLE_FIRST_NAMES.length];
      const ln = SCHEME_SAMPLE_LAST_NAMES[(hash + i * 13) % SCHEME_SAMPLE_LAST_NAMES.length];
      nameEn = `${fn[0]} ${ln[0]}`;
      nameMl = `${fn[1]} ${ln[1]}`;
    }
    if (existingNames.has(nameEn.toLowerCase())) continue;

    const item = statusCycle[result.length % statusCycle.length];
    const day = 18 - (result.length % 12);
    const dateStr = `${day < 10 ? "0" + day : day} Oct 2026`;
    const ref = expandedSamples ? `SAMPLE-${scheme.id}-${i}` : `APP-2026-${9200 + ((hash + result.length * 13) % 700)}`;

    result.push({
      ref,
      trackingId: ref,
      schemeNameEn: scheme.nameEn,
      schemeNameMl: scheme.nameMl,
      categoryEn: scheme.categoryEn,
      categoryMl: scheme.categoryMl,
      applicantNameEn: nameEn,
      applicantNameMl: nameMl,
      locationEn: person.locationEn,
      locationMl: person.locationMl,
      status: item.status,
      workflowStatus: item.workflowStatus,
      appliedDate: dateStr,
    });
    existingNames.add(nameEn.toLowerCase());
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

function matchesApplicationFilterStatus(app: MobileReportApplicationRecord, status: SchemeStatusBucket): boolean {
  const workflow = (app.workflowStatus || app.status || "").toLowerCase();
  if (status === "received") return ["application_received", "received", "pending"].includes(workflow);
  if (status === "verified") return ["document_verification_completed", "document_verified"].includes(workflow);
  if (status === "pending") return matchesApplicationFilterStatus(app, "received") || matchesApplicationFilterStatus(app, "verified");
  if (status === "applied") return workflow === "applied" || workflow === "submitted";
  if (status === "in_review") return ["in_review", "review", "under_review", "in_progress"].includes(workflow);
  return getApplicationBucket(app) === status;
}

export function getSchemeStats(apps: MobileReportApplicationRecord[]) {
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

export function buildMobileApplicationRoster(
  applications: MobileReportApplicationRecord[],
  isFilterActive = false,
  applicationFilterInPhone = true,
): Map<string, MobileReportApplicationRecord[]> {
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
      const completeList = isFilterActive ? existing : generateSchemeApplications(scheme, existing, applicationFilterInPhone ? 20 : 7);
      map.set(scheme.id, completeList);
    }

    return map;
}

export function MobileReportsPage({
  applicationFilterInPhone = false,
  initialHomeLocation = null,
  initialKpiStatuses = null,
  onBack,
  applications = [],
  onSelectApplication,
  initialSelectedSchemeId,
  onOpenApplicationFilter,
  isFilterActive = false,
  filterCount = 0,
  headerStyle = "default",
  periodText,
  onOpenDatePicker,
  onStepPeriod,
  onDrilldownChange,
  onEditApplication,
  onCallApplication,
  onCheckEligibility,
  onDocumentVerification,
  onDeleteApplication,
  onOpenSchemeDetails,
  onApplyScheme,
  onShareScheme,
  userRole = "state_admin",
}: MobileReportsPageProps) {
  const { lang } = useLang();
  const [selectedScheme, setSelectedScheme] = useState<SchemeReportDef | null>(() => {
    if (initialSelectedSchemeId) {
      const norm = (str: string) => str.toLowerCase().replace(/[-_]/g, "");
      const targetNorm = norm(initialSelectedSchemeId);
      return REPORT_SCHEMES.find(
        (s) => norm(s.id) === targetNorm || norm(s.nameEn).includes(targetNorm) || targetNorm.includes(norm(s.id))
      ) || null;
    }
    return null;
  });
  const [isSchemeMenuOpen, setIsSchemeMenuOpen] = useState(false);
  const [schemeShareToast, setSchemeShareToast] = useState<string | null>(null);

  useEffect(() => {
    if (initialSelectedSchemeId) {
      const norm = (str: string) => str.toLowerCase().replace(/[-_]/g, "");
      const targetNorm = norm(initialSelectedSchemeId);
      const found = REPORT_SCHEMES.find(
        (s) => norm(s.id) === targetNorm || norm(s.nameEn).includes(targetNorm) || targetNorm.includes(norm(s.id))
      );
      if (found) {
        setSelectedScheme(found);
      }
    }
  }, [initialSelectedSchemeId]);

  const handleShareScheme = (schemeName: string) => {
    if (onShareScheme) {
      onShareScheme(schemeName);
      return;
    }
    const shareText = `${schemeName} - Vikasita Keralam`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: schemeName,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setSchemeShareToast(lang === "ml" ? "പദ്ധതി ലിങ്ക് പകർത്തി!" : "Scheme link copied!");
        setTimeout(() => setSchemeShareToast(null), 2200);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    onDrilldownChange?.(Boolean(selectedScheme));
  }, [selectedScheme, onDrilldownChange]);

  useEffect(() => {
    return () => {
      onDrilldownChange?.(false);
    };
  }, [onDrilldownChange]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryReportDef | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [schemeCardSort, setSchemeCardSort] = useState("total_desc");
  const [schemeSortOpen, setSchemeSortOpen] = useState(false);
  const [groupSortOpen, setGroupSortOpen] = useState(false);
  const [groupBy, setGroupBy] = useState("none");
  const [groupMetric, setGroupMetric] = useState("total");
  const [groupOrder, setGroupOrder] = useState("desc");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [draftSchemeCardSort, setDraftSchemeCardSort] = useState("total_desc");

  // Scheme Drilldown Search & Status Filter
  const [schemeAppSearchQuery, setSchemeAppSearchQuery] = useState("");
  const [isSchemeAppSearchExpanded, setIsSchemeAppSearchExpanded] = useState(false);
  const [schemeStatusFilter, setSchemeStatusFilter] = useState<"all" | "approved" | "in_review" | "in_progress" | "pending" | "rejected">("all");
  const [schemeSortOrder, setSchemeSortOrder] = useState<"newest" | "oldest">("newest");
  const [isSchemeSortMenuOpen, setIsSchemeSortMenuOpen] = useState(false);
  const [openAppMenuKey, setOpenAppMenuKey] = useState<string | null>(null);
  const [openAppMenuUp, setOpenAppMenuUp] = useState(false);

  // Page-level Application Filter (work view + statuses + location)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filterSheetBounds, setFilterSheetBounds] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [openLocationField, setOpenLocationField] = useState<SchemeLocationField | null>(null);
  const initialMobileFilter = (): SchemeFilterState => ({ ...createDefaultSchemeFilter(), statuses: (initialKpiStatuses || []) as SchemeStatusBucket[], ...(applicationFilterInPhone && initialHomeLocation ? { locationLevel: initialHomeLocation.level, location: { ...createEmptySchemeLocation(), region: initialHomeLocation.region || "", orgDistrict: initialHomeLocation.district || "", mandalam: initialHomeLocation.mandalam || "" } } : {}) });
  const [appliedSchemeFilter, setAppliedSchemeFilter] = useState<SchemeFilterState>(initialMobileFilter);
  useEffect(() => {
    setGroupBy("none");
    setCollapsedGroups([]);
  }, [appliedSchemeFilter.locationLevel]);
  const [draftSchemeFilter, setDraftSchemeFilter] = useState<SchemeFilterState>(initialMobileFilter);

  const mandalamOptionsByDistrict = useMemo(() => {
    const map = new Map<string, Map<string, SchemeLocationOption>>();

    // Initialize with all mandalams from ORGANISATIONAL_DISTRICT_MANDALAMS
    for (const [distKey, mandalams] of Object.entries(ORGANISATIONAL_DISTRICT_MANDALAMS)) {
      if (!map.has(distKey)) map.set(distKey, new Map());
      const distMap = map.get(distKey)!;
      for (const m of mandalams) {
        const val = normalizeLocationValue(m);
        distMap.set(val, { value: val, en: m, ml: m });
      }
    }

    const addLocation = (locationEn?: string, locationMl?: string) => {
      const { localityEn, localityMl, districtEn } = splitSchemeLocation(locationEn, locationMl);
      const district = getSchemeOrgDistrictDef(districtEn) || (localityEn ? getSchemeOrgDistrictDef(localityEn) : undefined);
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
  const targetLevel = appliedSchemeFilter.locationLevel;
  const appliedLocationChips: Array<{ key: string; label: string }> = [];

  if (targetLevel === "ward" && appliedLocation.ward) {
    appliedLocationChips.push({ key: "ward", label: getSchemeLocationLabel(KERALA_WARDS, appliedLocation.ward, lang) });
  } else if (targetLevel === "area" && appliedLocation.area) {
    appliedLocationChips.push({ key: "area", label: getSchemeLocationLabel(KERALA_AREAS, appliedLocation.area, lang) });
  } else if (targetLevel === "mandalam" && appliedLocation.mandalam) {
    appliedLocationChips.push({ key: "mandalam", label: getSchemeLocationLabel(allMandalamOptions, appliedLocation.mandalam, lang) });
  } else if (targetLevel === "org_district" && appliedLocation.orgDistrict) {
    appliedLocationChips.push({ key: "orgDistrict", label: getSchemeLocationLabel(KERALA_ORG_DISTRICTS, appliedLocation.orgDistrict, lang) });
  } else if (targetLevel === "region" && appliedLocation.region) {
    appliedLocationChips.push({ key: "region", label: getSchemeLocationLabel(KERALA_REGIONS, appliedLocation.region, lang) });
  } else {
    // Fallback: show only the single finest selected location name
    if (appliedLocation.ward) {
      appliedLocationChips.push({ key: "ward", label: getSchemeLocationLabel(KERALA_WARDS, appliedLocation.ward, lang) });
    } else if (appliedLocation.area) {
      appliedLocationChips.push({ key: "area", label: getSchemeLocationLabel(KERALA_AREAS, appliedLocation.area, lang) });
    } else if (appliedLocation.mandalam) {
      appliedLocationChips.push({ key: "mandalam", label: getSchemeLocationLabel(allMandalamOptions, appliedLocation.mandalam, lang) });
    } else if (appliedLocation.orgDistrict) {
      appliedLocationChips.push({ key: "orgDistrict", label: getSchemeLocationLabel(KERALA_ORG_DISTRICTS, appliedLocation.orgDistrict, lang) });
    } else if (appliedLocation.region) {
      appliedLocationChips.push({ key: "region", label: getSchemeLocationLabel(KERALA_REGIONS, appliedLocation.region, lang) });
    }
  }

  const hasLocationFilters = Boolean(
    appliedLocation.region ||
    appliedLocation.orgDistrict ||
    appliedLocation.mandalam ||
    appliedLocation.area ||
    appliedLocation.ward
  );
  const hasTeamDesignation = applicationFilterInPhone && appliedSchemeFilter.workView === "team" && Boolean(appliedSchemeFilter.designation && appliedSchemeFilter.designation !== "all");
  const hasTeamMember = applicationFilterInPhone && appliedSchemeFilter.workView === "team" && Boolean(appliedSchemeFilter.teamMember && appliedSchemeFilter.teamMember !== "all");
  const hasLocalFilters =
    hasTeamDesignation || hasTeamMember ||
    appliedSchemeFilter.statuses.length > 0 ||
    Boolean(appliedSchemeFilter.department && appliedSchemeFilter.department !== "all") ||
    Boolean(appliedSchemeFilter.category && appliedSchemeFilter.category !== "all") ||
    Boolean(appliedSchemeFilter.scheme && appliedSchemeFilter.scheme !== "all") ||
    Boolean(appliedSchemeFilter.sortBy && appliedSchemeFilter.sortBy !== "benefits_high_low") ||
    hasLocationFilters;
  const localFilterCount =
    (hasTeamDesignation ? 1 : 0) + (hasTeamMember ? 1 : 0) +
    (appliedSchemeFilter.statuses.length > 0 ? 1 : 0) +
    (appliedSchemeFilter.department && appliedSchemeFilter.department !== "all" ? 1 : 0) +
    (appliedSchemeFilter.category && appliedSchemeFilter.category !== "all" ? 1 : 0) +
    (appliedSchemeFilter.scheme && appliedSchemeFilter.scheme !== "all" ? 1 : 0) +
    (appliedSchemeFilter.sortBy && appliedSchemeFilter.sortBy !== "benefits_high_low" ? 1 : 0) +
    (hasLocationFilters ? 1 : 0);
  const activeFilterCount = (isFilterActive ? filterCount : 0) + localFilterCount;


  // Group applications by Scheme
  const applicationsByScheme = useMemo(
    () => buildMobileApplicationRoster(applications, isFilterActive, applicationFilterInPhone),
    [applications, isFilterActive, applicationFilterInPhone],
  );

  // Apply the page-level filter (work view + statuses + location) to each scheme roster
  const filteredByScheme = useMemo(() => {
    const statuses = new Set(appliedSchemeFilter.statuses);
    const selectedLocation = appliedSchemeFilter.location;
    const map = new Map<string, MobileReportApplicationRecord[]>();
    for (const [schemeId, list] of applicationsByScheme.entries()) {
      map.set(
        schemeId,
        list.filter((app) => {
          const bucket = getApplicationBucket(app);
          if (!applicationFilterInPhone && !(initialKpiStatuses && appliedSchemeFilter.statuses.length > 0) && appliedSchemeFilter.workView === "my_work" && bucket !== "pending" && bucket !== "in_review") {
            return false;
          }
          if (statuses.size > 0 && (applicationFilterInPhone ? ![...statuses].some((status) => matchesApplicationFilterStatus(app, status)) : !statuses.has(bucket))) {
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
  }, [applicationsByScheme, appliedSchemeFilter, applicationFilterInPhone, initialKpiStatuses]);

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

  // Hide schemes that have no applications matching the active filter, filter by category & scheme selection, and sort by selected sortBy metric
  const visibleSchemes = useMemo(() => {
    let list = filteredSchemes;

    if (applicationFilterInPhone && userRole === "state_admin" && appliedSchemeFilter.department && appliedSchemeFilter.department !== "all") {
      list = list.filter((scheme) => MOBILE_SAMPLE_SCHEME_DEPARTMENT[scheme.id] === appliedSchemeFilter.department);
    }

    // Filter by Category if selected
    if (appliedSchemeFilter.category && appliedSchemeFilter.category !== "all") {
      list = list.filter((s) => s.categoryId === appliedSchemeFilter.category);
    }

    // Filter by Scheme Selection if selected
    if (appliedSchemeFilter.scheme && appliedSchemeFilter.scheme !== "all") {
      list = list.filter((s) => s.id === appliedSchemeFilter.scheme);
    }

    // Filter out schemes with 0 matching applications if filter is active or local filters applied
    if (!applicationFilterInPhone && (isFilterActive || hasLocalFilters)) {
      list = list.filter((scheme) => (filteredByScheme.get(scheme.id) || []).length > 0);
    }

    // Sort schemes by the selected sortBy metric
    const sortBy = appliedSchemeFilter.sortBy || "benefits_high_low";
    return [...list].sort((a, b) => {
      const aApps = filteredByScheme.get(a.id) || [];
      const bApps = filteredByScheme.get(b.id) || [];
      if (applicationFilterInPhone) {
        const name = a.nameEn.localeCompare(b.nameEn);
        if (schemeCardSort === "name_asc") return name;
        if (schemeCardSort === "name_desc") return -name;
        const [metric, direction] = schemeCardSort.split("_");
        const uniqueStats = (apps: MobileReportApplicationRecord[]) => getSchemeStats([...new Map(apps.map((app) => [app.ref || app.trackingId, app])).values()]);
        const left = uniqueStats(aApps);
        const right = uniqueStats(bApps);
        const key = metric === "review" ? "inReview" : metric as "total" | "approved" | "pending" | "rejected";
        const difference = left[key] - right[key];
        return (direction === "asc" ? difference : -difference) || name;
      }
      const aStats = getSchemeStats(aApps);
      const bStats = getSchemeStats(bApps);

      switch (sortBy) {
        case "benefits_high_low":
          return bStats.approved - aStats.approved;
        case "benefits_low_high":
          return aStats.approved - bStats.approved;
        case "pending_high_low":
          return bStats.pending - aStats.pending;
        case "pending_low_high":
          return aStats.pending - bStats.pending;
        case "review_high_low":
          return bStats.inReview - aStats.inReview;
        case "review_low_high":
          return aStats.inReview - bStats.inReview;
        default:
          return 0;
      }
    });
  }, [filteredSchemes, filteredByScheme, isFilterActive, hasLocalFilters, appliedSchemeFilter, applicationFilterInPhone, schemeCardSort]);
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
    setOpenLocationField(null);
    setIsFilterSheetOpen(true);
  };

  const clearLocalFilters = () => {
    setAppliedSchemeFilter(createDefaultSchemeFilter());
    setDraftSchemeFilter(createDefaultSchemeFilter());
    setOpenLocationField(null);
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

  const statusFilterOptions: Array<{ id: SchemeStatusBucket; en: string; ml: string }> = applicationFilterInPhone ? [
    { id: "received", en: "Applications Received", ml: "ലഭിച്ച അപേക്ഷകൾ" },
    { id: "verified", en: "Document Verified (Ready to Apply)", ml: "രേഖകൾ പരിശോധിച്ചു" },
    { id: "pending", en: "Pending", ml: "തീർപ്പുകൽപ്പിക്കാത്തവ" },
    { id: "applied", en: "Applied", ml: "അപേക്ഷിച്ചു" },
    { id: "in_review", en: "In Review", ml: "പരിശോധനയിൽ" },
    { id: "approved", en: "Beneficiary", ml: "അംഗീകരിച്ചവ" },
    { id: "rejected", en: "Rejected", ml: "നിരസിച്ചവ" },
  ] : [
    { id: "approved", en: "Beneficiary", ml: "അംഗീകരിച്ചവ" },
    { id: "in_review", en: "In Review", ml: "പരിശോധനയിൽ" },
    { id: "pending", en: "Pending", ml: "തീർപ്പുകൽപ്പിക്കാത്തവ" },
    { id: "rejected", en: "Rejected", ml: "നിരസിച്ചവ" },
  ];

  const removeLocationFilter = (_key: string) => {
    setAppliedSchemeFilter((prev) => ({
      ...prev,
      locationLevel: "state",
      location: createEmptySchemeLocation(),
    }));
  };

  const removeStatusFilter = (statusId: SchemeStatusBucket) => {
    setAppliedSchemeFilter((prev) => ({
      ...prev,
      statuses: prev.statuses.filter((s) => s !== statusId),
    }));
  };

  const resetWorkView = () => {
    setAppliedSchemeFilter((prev) => ({
      ...prev,
      workView: "my_work",
    }));
    setDraftSchemeFilter((prev) => ({
      ...prev,
      workView: "my_work",
    }));
  };

  const renderAppliedFiltersRow = (showSchemeSort = false, showGroupSort = false) => {
    // Default no needs to show that section Applied Filter section and state wide,
    // if any changes done in the filter then only show that section.
    const groupActive = showGroupSort && groupBy !== "none";
    if (!hasLocalFilters && !(showSchemeSort && schemeCardSort !== "total_desc") && !groupActive) {
      return null;
    }

    const isWorker = userRole === "party_worker";

    return (
      <div className="flex flex-col border-b border-slate-200/70 dark:border-slate-800 bg-[#FAF7F2]/90 dark:bg-slate-900/80 shrink-0">
        {/* Active Filter Chips & View */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-2.5 py-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 whitespace-nowrap">
          {groupActive && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"><button type="button" onClick={() => setGroupOrder((order) => order === "desc" ? "asc" : "desc")} aria-label="Reverse group sort order">{groupBy === "none" ? (lang === "ml" ? "ഗ്രൂപ്പില്ല" : "No grouping") : ({ region: "Region", org_district: "Organisational District", mandalam: "Assembly Mandalam", area: "Area", ward: "Ward" } as Record<string, string>)[groupBy]} · {SCHEME_SORT_METRICS.find((option) => option.value === groupMetric)?.[lang === "ml" ? "ml" : "en"]} {groupOrder === "desc" ? "↓" : "↑"}</button><button type="button" onClick={() => { setGroupBy("none"); setGroupMetric("total"); setGroupOrder("desc"); setCollapsedGroups([]); }} aria-label="Clear group and sort"><X className="h-3 w-3" /></button></span>}
          {showSchemeSort && schemeCardSort !== "total_desc" && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"><button type="button" onClick={() => setSchemeCardSort((current) => { const [metric, direction] = current.split("_"); return `${metric}_${direction === "asc" ? "desc" : "asc"}`; })} aria-label="Reverse sort order">{SCHEME_CARD_SORT_OPTIONS.find((option) => option.value === schemeCardSort)?.label}</button><button type="button" onClick={() => setSchemeCardSort("total_desc")} aria-label="Clear sort"><X className="h-3 w-3" /></button></span>}
          {hasTeamDesignation && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><span>{(DESIGNATION_OPTIONS_BY_LEVEL[appliedSchemeFilter.locationLevel] || DESIGNATION_OPTIONS_BY_LEVEL.state).find(option => option.id === appliedSchemeFilter.designation)?.[lang === "ml" ? "ml" : "en"] || appliedSchemeFilter.designation}</span><button type="button" aria-label={lang === "ml" ? "പദവി ഒഴിവാക്കുക" : "Remove designation"} onClick={() => setAppliedSchemeFilter(prev => ({ ...prev, designation: "all" }))}><X className="h-3 w-3" /></button></span>}
          {hasTeamMember && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><span>{getFilteredTeamMembers(appliedSchemeFilter.locationLevel).find(member => member.id === appliedSchemeFilter.teamMember)?.name || appliedSchemeFilter.teamMember}</span><button type="button" aria-label={lang === "ml" ? "ടീം അംഗത്തെ ഒഴിവാക്കുക" : "Remove team member"} onClick={() => setAppliedSchemeFilter(prev => ({ ...prev, teamMember: "all" }))}><X className="h-3 w-3" /></button></span>}
          {/* Show location chips if location was changed from default */}
          {hasLocationFilters && (
            appliedLocationChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200/90 dark:border-orange-800/60 text-orange-800 dark:text-orange-300 font-semibold shrink-0 shadow-2xs text-[10.5px]"
              >
                <MapPin className="h-2.5 w-2.5 text-orange-500 shrink-0" />
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeLocationFilter(chip.key)}
                  className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-orange-200/80 dark:hover:bg-orange-900/60 text-orange-600 dark:text-orange-300 transition-colors cursor-pointer"
                  title={lang === "ml" ? "ഒഴിവാക്കുക" : "Remove"}
                  aria-label={lang === "ml" ? "ഒഴിവാക്കുക" : "Remove"}
                >
                  <X className="h-2.5 w-2.5 stroke-[2.5]" />
                </button>
              </span>
            ))
          )}

          {applicationFilterInPhone && userRole === "state_admin" && appliedSchemeFilter.department && appliedSchemeFilter.department !== "all" && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <span>{MOBILE_SAMPLE_DEPARTMENTS.find((department) => department.id === appliedSchemeFilter.department)?.[lang === "ml" ? "ml" : "en"]}</span>
              <button type="button" aria-label="Remove department" onClick={() => setAppliedSchemeFilter((prev) => ({ ...prev, department: "all" }))}><X className="h-3 w-3" /></button>
            </span>
          )}
          {/* Scheme Category Filter chip */}
          {appliedSchemeFilter.category && appliedSchemeFilter.category !== "all" && (() => {
            const catDef = REPORT_CATEGORIES.find((c) => c.id === appliedSchemeFilter.category);
            const label = catDef ? (lang === "ml" ? catDef.nameMl : catDef.nameEn) : appliedSchemeFilter.category;
            return (
              <span
                key="category"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold shrink-0 shadow-2xs text-[10.5px]"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedSchemeFilter((prev) => ({ ...prev, category: "all" }));
                    setDraftSchemeFilter((prev) => ({ ...prev, category: "all" }));
                  }}
                  className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  title={lang === "ml" ? "ഒഴിവാക്കുക" : "Remove"}
                  aria-label={lang === "ml" ? "ഒഴിവാക്കുക" : "Remove"}
                >
                  <X className="h-2.5 w-2.5 stroke-[2.5]" />
                </button>
              </span>
            );
          })()}

          {/* Scheme Selection Filter chip */}
          {appliedSchemeFilter.scheme && appliedSchemeFilter.scheme !== "all" && (() => {
            const schDef = REPORT_SCHEMES.find((s) => s.id === appliedSchemeFilter.scheme);
            const label = schDef ? (lang === "ml" ? schDef.nameMl : schDef.nameEn) : appliedSchemeFilter.scheme;
            return (
              <span
                key="scheme"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold shrink-0 shadow-2xs text-[10.5px]"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedSchemeFilter((prev) => ({ ...prev, scheme: "all" }));
                    setDraftSchemeFilter((prev) => ({ ...prev, scheme: "all" }));
                  }}
                  className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  title={lang === "ml" ? "ഒഴിവാക്കുക" : "Remove"}
                  aria-label={lang === "ml" ? "ഒഴിവാക്കുക" : "Remove"}
                >
                  <X className="h-2.5 w-2.5 stroke-[2.5]" />
                </button>
              </span>
            );
          })()}

          {/* Sort By Filter chip */}
          {appliedSchemeFilter.sortBy && appliedSchemeFilter.sortBy !== "benefits_high_low" && (() => {
            const sortOptionLabels: Record<string, { en: string; ml: string }> = {
              benefits_high_low: { en: "Benefits: High to Low", ml: "ആനുകൂല്യം: ഉയർന്നതിൽ നിന്ന് കുറഞ്ഞതിലേക്ക്" },
              benefits_low_high: applicationFilterInPhone ? { en: "Low to High", ml: "താഴ്ന്നതിൽ നിന്ന് മുകളിലേക്ക്" } : { en: "Benefits: Low to High", ml: "ആനുകൂല്യം: കുറഞ്ഞതിൽ നിന്ന് ഉയർന്നതിലേക്ക്" },
              pending_high_low: { en: "Pending: High to Low", ml: "തീർപ്പുകൽപ്പിക്കാത്തത്: ഉയർന്നതിൽ നിന്ന് കുറഞ്ഞതിലേക്ക്" },
              pending_low_high: { en: "Pending: Low to High", ml: "തീർപ്പുകൽപ്പിക്കാത്തത്: കുറഞ്ഞതിൽ നിന്ന് ഉയർന്നതിലേക്ക്" },
              review_high_low: { en: "In Review: High to Low", ml: "പരിശോധനയിൽ: ഉയർന്നതിൽ നിന്ന് കുറഞ്ഞതിലേക്ക്" },
              review_low_high: { en: "In Review: Low to High", ml: "പരിശോധനയിൽ: കുറഞ്ഞതിൽ നിന്ന് ഉയർന്നതിലേക്ക്" },
            };
            const label = sortOptionLabels[appliedSchemeFilter.sortBy]?.[lang] || appliedSchemeFilter.sortBy;
            return (
              <span
                key="sortBy"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold shrink-0 shadow-2xs text-[10.5px]"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedSchemeFilter((prev) => ({ ...prev, sortBy: "benefits_high_low" }));
                    setDraftSchemeFilter((prev) => ({ ...prev, sortBy: "benefits_high_low" }));
                  }}
                  className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  title={lang === "ml" ? "ഒഴിവാക്കുക" : "Remove"}
                  aria-label={lang === "ml" ? "ഒഴിവാക്കുക" : "Remove"}
                >
                  <X className="h-2.5 w-2.5 stroke-[2.5]" />
                </button>
              </span>
            );
          })()}

          {/* Status Filter chips */}
          {appliedSchemeFilter.statuses.map((statusId) => {
            const opt = statusFilterOptions.find((o) => o.id === statusId);
            const label = opt ? (lang === "ml" ? opt.ml : opt.en) : statusId;
            return (
              <span
                key={statusId}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold shrink-0 shadow-2xs text-[10.5px]"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => removeStatusFilter(statusId)}
                  className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  title={lang === "ml" ? "ഒഴിവാക്കുക" : "Remove"}
                  aria-label={lang === "ml" ? "ഒഴിവാക്കുക" : "Remove"}
                >
                  <X className="h-2.5 w-2.5 stroke-[2.5]" />
                </button>
              </span>
            );
          })}

          {/* Clear All action when any non-default filter is applied */}
          {hasLocalFilters && (
            <button
              type="button"
              onClick={clearLocalFilters}
              className="shrink-0 text-[10.5px] font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline px-1.5 py-0.5 transition-colors cursor-pointer"
            >
              {lang === "ml" ? "എല്ലാം ഒഴിവാക്കുക" : "Clear All"}
            </button>
          )}
        </div>
      </div>
    );
  };

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
      (draftSchemeFilter.statuses.length > 0 ? 1 : 0) +
      (draftSchemeFilter.department && draftSchemeFilter.department !== "all" ? 1 : 0) +
      (draftSchemeFilter.category && draftSchemeFilter.category !== "all" ? 1 : 0) +
      (draftSchemeFilter.scheme && draftSchemeFilter.scheme !== "all" ? 1 : 0) +
      (draftSchemeFilter.sortBy && draftSchemeFilter.sortBy !== "benefits_high_low" ? 1 : 0) +
      (draftHasLocation ? 1 : 0);

    const sheet = (
      <div
        className="absolute inset-0 z-[120] flex flex-col justify-end bg-slate-950/60 transition-opacity animate-in fade-in duration-200 rounded-[36px] overflow-hidden h-full w-full"
        onClick={() => setIsFilterSheetOpen(false)}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div
          className="w-full max-h-[85%] overflow-hidden rounded-t-[24px] border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl animate-in slide-in-from-bottom duration-250 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1 mb-3 shrink-0" />

          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
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

          <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3 my-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Work View */}
          <div className="space-y-1 mb-2.5">
            <div className="grid grid-cols-2 gap-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-0.5">
              {([
                { id: "my_work" as SchemeWorkView, en: "My View", ml: "എന്റെ കാഴ്ച", icon: Inbox },
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

          {/* Location Filter */}
          <div className="space-y-2 mb-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                {lang === "ml" ? "ലൊക്കേഷൻ ലെവൽ തിരഞ്ഞെടുക്കുക" : "Select Location Level"}
              </label>
              {applicationFilterInPhone ? <MobileFilterPicker label={lang === "ml" ? "ലൊക്കേഷൻ ലെവൽ തിരഞ്ഞെടുക്കുക" : "Select Location Level"} value={draftSchemeFilter.locationLevel} options={SCHEME_LOCATION_LEVEL_OPTIONS.map((option) => ({ value: option.id, label: lang === "ml" ? option.ml : option.en }))} onChange={(value) => { const level = value as SchemeLocationLevel; const rank = SCHEME_LOCATION_LEVEL_RANK[level]; setDraftSchemeFilter((prev) => { const location = { ...prev.location }; if (rank === 0) return { ...prev, locationLevel: level, location: createEmptySchemeLocation() }; if (rank >= 2) location.region = ""; if (rank < 2) location.orgDistrict = ""; if (rank < 3) location.mandalam = ""; if (rank < 4) location.area = ""; if (rank < 5) location.ward = ""; return { ...prev, locationLevel: level, location }; }); }} searchLabel={lang === "ml" ? "തിരയുക..." : "Search..."} /> : <>
              <button
                type="button"
                onClick={() => setOpenLocationField((open) => (open === "level" ? null : "level"))}
                aria-expanded={openLocationField === "level"}
                className="flex w-full h-9 items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-left cursor-pointer"
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
              </>}
            </div>

            {(() => {
              const rank = SCHEME_LOCATION_LEVEL_RANK[draftSchemeFilter.locationLevel];
              const selectedLocation = draftSchemeFilter.location;
              const orgDistrictOptions = !applicationFilterInPhone && selectedLocation.region
                ? KERALA_ORG_DISTRICTS.filter((district) => district.region === selectedLocation.region)
                : KERALA_ORG_DISTRICTS;
              const selectedDistrictMandalams = new Map<string, SchemeLocationOption>();
              if (selectedLocation.orgDistrict) {
                for (const option of mandalamOptionsByDistrict.get(selectedLocation.orgDistrict)?.values() || []) {
                  if (!selectedDistrictMandalams.has(option.value)) {
                    selectedDistrictMandalams.set(option.value, option);
                  }
                }
              } else if (selectedLocation.region) {
                for (const dist of orgDistrictOptions) {
                  for (const option of mandalamOptionsByDistrict.get(dist.value)?.values() || []) {
                    if (!selectedDistrictMandalams.has(option.value)) {
                      selectedDistrictMandalams.set(option.value, option);
                    }
                  }
                }
              }
              const mandalamOptions = (selectedLocation.orgDistrict || selectedLocation.region)
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
                if (applicationFilterInPhone && !multiple) return <div className="space-y-1"><label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</label><MobileFilterPicker label={label} value={value || ""} options={[{ value: "", label: allLabel }, ...options.map((option) => ({ value: option.value, label: lang === "ml" ? option.ml : option.en }))]} onChange={(selected) => updateDraftLocation(field, selected)} searchLabel={lang === "ml" ? "തിരയുക..." : "Search..."} /></div>;
                return (
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                      {label}
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpenLocationField((open) => (open === field ? null : field))}
                      aria-expanded={isOpen}
                      className="flex w-full h-9 items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-left cursor-pointer"
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
                          onClick={() => updateDraftLocation(field, "")}
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
                              onClick={() => updateDraftLocation(field, option.value)}
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
                <div className="space-y-2">
                  {rank === 1 &&
                    renderLocationDropdown({
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
                  {rank >= 3 &&
                    renderLocationDropdown({
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


          {applicationFilterInPhone && draftSchemeFilter.workView === "team" ? <div className="space-y-3 border-t border-slate-100 pt-2 dark:border-slate-800"><div><label className="mb-1 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">{lang === "ml" ? "പദവി തിരഞ്ഞെടുക്കുക" : "Select Designation"}</label><MobileFilterPicker label={lang === "ml" ? "പദവി തിരഞ്ഞെടുക്കുക" : "Select Designation"} value={draftSchemeFilter.designation || "all"} options={(DESIGNATION_OPTIONS_BY_LEVEL[draftSchemeFilter.locationLevel] || DESIGNATION_OPTIONS_BY_LEVEL.state).map((option) => ({ value: option.id, label: lang === "ml" ? option.ml : option.en }))} onChange={(value) => setDraftSchemeFilter((prev) => ({ ...prev, designation: value, teamMember: "all" }))} /></div><div><label className="mb-1 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">{lang === "ml" ? "ടീം അംഗത്തെ തിരഞ്ഞെടുക്കുക" : "Select Team Member"}</label><MobileFilterPicker label={lang === "ml" ? "ടീം അംഗത്തെ തിരഞ്ഞെടുക്കുക" : "Select Team Member"} value={draftSchemeFilter.teamMember || "all"} options={[{ value: "all", label: lang === "ml" ? "എല്ലാ ടീം അംഗങ്ങളും" : "All Team Members" }, ...getFilteredTeamMembers(draftSchemeFilter.locationLevel, draftSchemeFilter.designation).map((member) => ({ value: member.id, label: member.name }))]} onChange={(value) => setDraftSchemeFilter((prev) => ({ ...prev, teamMember: value }))} /></div></div> : !applicationFilterInPhone ? <>
          {/* Team Tab Filters: Designation & Team Member selection below Location level */}
          {draftSchemeFilter.workView === "team" && (
            <div className="space-y-2.5 mb-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Designation Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                  {lang === "ml" ? "പദവി തിരഞ്ഞെടുക്കുക" : "Select Designation"}
                </label>
                <button
                  type="button"
                  onClick={() => setOpenLocationField((open) => (open === ("designation" as any) ? null : ("designation" as any)))}
                  aria-expanded={openLocationField === ("designation" as any)}
                  className="flex w-full h-9 items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-left cursor-pointer"
                >
                  <span className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                    {(() => {
                      const levelDesignations = DESIGNATION_OPTIONS_BY_LEVEL[draftSchemeFilter.locationLevel] || DESIGNATION_OPTIONS_BY_LEVEL.state;
                      const current = levelDesignations.find((d) => d.id === draftSchemeFilter.designation);
                      return current ? (lang === "ml" ? current.ml : current.en) : (lang === "ml" ? "എല്ലാ പദവികളും" : "All Designations");
                    })()}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                      openLocationField === ("designation" as any) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openLocationField === ("designation" as any) && (
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                    {(DESIGNATION_OPTIONS_BY_LEVEL[draftSchemeFilter.locationLevel] || DESIGNATION_OPTIONS_BY_LEVEL.state).map((option) => {
                      const isSelected = (draftSchemeFilter.designation || "all") === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setDraftSchemeFilter((prev) => ({ ...prev, designation: option.id, teamMember: "all" }));
                            setOpenLocationField(null);
                          }}
                          className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                          }`}
                        >
                          <span className="truncate">{lang === "ml" ? option.ml : option.en}</span>
                          {isSelected && <Check className="h-3 w-3 shrink-0 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Team Member Selection Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                  {lang === "ml" ? "ടീം അംഗത്തെ തിരഞ്ഞെടുക്കുക" : "Select Team Member"}
                </label>
                <button
                  type="button"
                  onClick={() => setOpenLocationField((open) => (open === ("teamMember" as any) ? null : ("teamMember" as any)))}
                  aria-expanded={openLocationField === ("teamMember" as any)}
                  className="flex w-full h-9 items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-left cursor-pointer"
                >
                  <span className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                    {(() => {
                      const filteredMembers = getFilteredTeamMembers(draftSchemeFilter.locationLevel, draftSchemeFilter.designation);
                      const current = filteredMembers.find((m) => m.id === draftSchemeFilter.teamMember);
                      if (!current || draftSchemeFilter.teamMember === "all") {
                        return lang === "ml" ? "എല്ലാ ടീം അംഗങ്ങളും" : "All Team Members";
                      }
                      return lang === "ml" ? `${current.name} (${current.designationMl})` : `${current.name} (${current.designationEn})`;
                    })()}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                      openLocationField === ("teamMember" as any) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openLocationField === ("teamMember" as any) && (
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setDraftSchemeFilter((prev) => ({ ...prev, teamMember: "all" }));
                        setOpenLocationField(null);
                      }}
                      className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                        !draftSchemeFilter.teamMember || draftSchemeFilter.teamMember === "all"
                          ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span>{lang === "ml" ? "എല്ലാ ടീം അംഗങ്ങളും" : "All Team Members"}</span>
                      {(!draftSchemeFilter.teamMember || draftSchemeFilter.teamMember === "all") && (
                        <Check className="h-3 w-3 shrink-0 stroke-[3]" />
                      )}
                    </button>
                    {getFilteredTeamMembers(draftSchemeFilter.locationLevel, draftSchemeFilter.designation).map((member) => {
                      const isSelected = draftSchemeFilter.teamMember === member.id;
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setDraftSchemeFilter((prev) => ({ ...prev, teamMember: member.id }));
                            setOpenLocationField(null);
                          }}
                          className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                          }`}
                        >
                          <span className="truncate">{lang === "ml" ? `${member.name} (${member.designationMl})` : `${member.name} (${member.designationEn})`}</span>
                          {isSelected && <Check className="h-3 w-3 shrink-0 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          </> : null}

          {applicationFilterInPhone ? (
            !selectedScheme && <div className="space-y-3">
              {userRole === "state_admin" && <div><label className="mb-1 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">{lang === "ml" ? "വകുപ്പ്" : "Department"}</label><MobileFilterPicker label={lang === "ml" ? "വകുപ്പ്" : "Department"} value={draftSchemeFilter.department || "all"} options={[{ value: "all", label: lang === "ml" ? "എല്ലാ വകുപ്പുകളും" : "All Departments" }, ...MOBILE_SAMPLE_DEPARTMENTS.map((department) => ({ value: department.id, label: lang === "ml" ? department.ml : department.en }))]} onChange={(value) => setDraftSchemeFilter((prev) => ({ ...prev, department: value }))} /></div>}
              <div><label className="mb-1 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">{lang === "ml" ? "പദ്ധതി വിഭാഗം" : "Scheme Category"}</label><MobileFilterPicker label={lang === "ml" ? "പദ്ധതി വിഭാഗം" : "Scheme Category"} value={draftSchemeFilter.category || "all"} options={[{ value: "all", label: lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories" }, ...REPORT_CATEGORIES.map((cat) => ({ value: cat.id, label: lang === "ml" ? cat.nameMl : cat.nameEn }))]} onChange={(value) => setDraftSchemeFilter((prev) => ({ ...prev, category: value, scheme: "all" }))} searchLabel={lang === "ml" ? "തിരയുക..." : "Search..."} /></div>
              <div><label className="mb-1 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">{lang === "ml" ? "പദ്ധതി തിരഞ്ഞെടുക്കൽ" : "Scheme Selection"}</label><MobileFilterPicker label={lang === "ml" ? "പദ്ധതി തിരഞ്ഞെടുക്കൽ" : "Scheme Selection"} value={draftSchemeFilter.scheme || "all"} options={[{ value: "all", label: lang === "ml" ? "എല്ലാ പദ്ധതികളും" : "All Schemes" }, ...REPORT_SCHEMES.filter((scheme) => !draftSchemeFilter.category || draftSchemeFilter.category === "all" || scheme.categoryId === draftSchemeFilter.category).map((scheme) => ({ value: scheme.id, label: lang === "ml" ? scheme.nameMl : scheme.nameEn }))]} onChange={(value) => setDraftSchemeFilter((prev) => ({ ...prev, scheme: value }))} searchLabel={lang === "ml" ? "തിരയുക..." : "Search..."} /></div>
            </div>
          ) : (
            <>
          {/* Scheme Category */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
              {lang === "ml" ? "പദ്ധതി വിഭാഗം" : "Scheme Category"}
            </label>
            <button
              type="button"
              onClick={() => setOpenLocationField((open) => (open === ("category" as any) ? null : ("category" as any)))}
              aria-expanded={openLocationField === ("category" as any)}
              className="flex w-full h-9 items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-left cursor-pointer"
            >
              <span className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                {draftSchemeFilter.category && draftSchemeFilter.category !== "all"
                  ? REPORT_CATEGORIES.find((c) => c.id === draftSchemeFilter.category)?.[lang === "ml" ? "nameMl" : "nameEn"] || draftSchemeFilter.category
                  : (lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories")}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                  openLocationField === ("category" as any) ? "rotate-180" : ""
                }`}
              />
            </button>
            {openLocationField === ("category" as any) && (
              <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setDraftSchemeFilter((prev) => ({ ...prev, category: "all", scheme: "all" }));
                    setOpenLocationField(null);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                    !draftSchemeFilter.category || draftSchemeFilter.category === "all"
                      ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <span>{lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories"}</span>
                  {(!draftSchemeFilter.category || draftSchemeFilter.category === "all") && (
                    <Check className="h-3 w-3 shrink-0 stroke-[3]" />
                  )}
                </button>
                {REPORT_CATEGORIES.map((cat) => {
                  const isSelected = draftSchemeFilter.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setDraftSchemeFilter((prev) => ({ ...prev, category: cat.id, scheme: "all" }));
                        setOpenLocationField(null);
                      }}
                      className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span className="truncate">{lang === "ml" ? cat.nameMl : cat.nameEn}</span>
                      {isSelected && <Check className="h-3 w-3 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Scheme Selection */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
              {lang === "ml" ? "പദ്ധതി തിരഞ്ഞെടുക്കൽ" : "Scheme Selection"}
            </label>
            <button
              type="button"
              onClick={() => setOpenLocationField((open) => (open === ("scheme" as any) ? null : ("scheme" as any)))}
              aria-expanded={openLocationField === ("scheme" as any)}
              className="flex w-full h-9 items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-left cursor-pointer"
            >
              <span className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                {draftSchemeFilter.scheme && draftSchemeFilter.scheme !== "all"
                  ? REPORT_SCHEMES.find((s) => s.id === draftSchemeFilter.scheme)?.[lang === "ml" ? "nameMl" : "nameEn"] || draftSchemeFilter.scheme
                  : (lang === "ml" ? "എല്ലാ പദ്ധതികളും" : "All Schemes")}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                  openLocationField === ("scheme" as any) ? "rotate-180" : ""
                }`}
              />
            </button>
            {openLocationField === ("scheme" as any) && (
              <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setDraftSchemeFilter((prev) => ({ ...prev, scheme: "all" }));
                    setOpenLocationField(null);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                    !draftSchemeFilter.scheme || draftSchemeFilter.scheme === "all"
                      ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <span>{lang === "ml" ? "എല്ലാ പദ്ധതികളും" : "All Schemes"}</span>
                  {(!draftSchemeFilter.scheme || draftSchemeFilter.scheme === "all") && (
                    <Check className="h-3 w-3 shrink-0 stroke-[3]" />
                  )}
                </button>
                {(draftSchemeFilter.category && draftSchemeFilter.category !== "all"
                  ? REPORT_SCHEMES.filter((s) => s.categoryId === draftSchemeFilter.category)
                  : REPORT_SCHEMES
                ).map((scheme) => {
                  const isSelected = draftSchemeFilter.scheme === scheme.id;
                  return (
                    <button
                      key={scheme.id}
                      type="button"
                      onClick={() => {
                        setDraftSchemeFilter((prev) => ({ ...prev, scheme: scheme.id }));
                        setOpenLocationField(null);
                      }}
                      className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span className="truncate">{lang === "ml" ? scheme.nameMl : scheme.nameEn}</span>
                      {isSelected && <Check className="h-3 w-3 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
            </>
          )}

          {!applicationFilterInPhone && (
            <>
          {/* Sort By */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
              {lang === "ml" ? "ക്രമീകരിക്കുക" : "Sort By"}
            </label>
            <button
              type="button"
              onClick={() => setOpenLocationField((open) => (open === ("sortBy" as any) ? null : ("sortBy" as any)))}
              aria-expanded={openLocationField === ("sortBy" as any)}
              className="flex w-full h-9 items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-left cursor-pointer"
            >
              <span className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                {(applicationFilterInPhone ? [{ id: "benefits_high_low", en: "High to Low", ml: "ഉയർന്നതിൽ നിന്ന് താഴേക്ക്" }, { id: "benefits_low_high", en: "Low to High", ml: "താഴ്ന്നതിൽ നിന്ന് മുകളിലേക്ക്" }] : SORT_BY_OPTIONS).find((opt) => opt.id === (draftSchemeFilter.sortBy || "benefits_high_low"))?.[
                  lang === "ml" ? "ml" : "en"
                ]}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                  openLocationField === ("sortBy" as any) ? "rotate-180" : ""
                }`}
              />
            </button>
            {openLocationField === ("sortBy" as any) && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                {(applicationFilterInPhone ? [{ id: "benefits_high_low", en: "High to Low", ml: "ഉയർന്നതിൽ നിന്ന് താഴേക്ക്" }, { id: "benefits_low_high", en: "Low to High", ml: "താഴ്ന്നതിൽ നിന്ന് മുകളിലേക്ക്" }] : SORT_BY_OPTIONS).map((opt) => {
                  const isSelected = (draftSchemeFilter.sortBy || "benefits_high_low") === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setDraftSchemeFilter((prev) => ({ ...prev, sortBy: opt.id }));
                        setOpenLocationField(null);
                      }}
                      className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span className="truncate">{lang === "ml" ? opt.ml : opt.en}</span>
                      {isSelected && <Check className="h-3 w-3 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
            </>
          )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDraftSchemeFilter(createDefaultSchemeFilter());
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
    const phone = applicationFilterInPhone && typeof document !== "undefined"
      ? document.querySelector("[data-mobile-preview-shell]")
      : null;
    return phone ? createPortal(sheet, phone) : sheet;
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
        icon: XCircle,
        className: "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300",
      };
    }

    // 2. Beneficiary / Benefit Received / Disbursed
    if (
      wst === "beneficiary" ||
      wst === "disbursed" ||
      st === "beneficiary" ||
      st === "disbursed"
    ) {
      return {
        label: lang === "ml" ? "അംഗീകരിച്ചു" : "Beneficiary",
        icon: HandCoins,
        className: "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
      };
    }

    // 3. Approved / Assisted
    if (
      wst === "approved" ||
      wst === "assisted" ||
      st === "approved" ||
      st === "assisted"
    ) {
      return {
        label: lang === "ml" ? "അംഗീകരിച്ചു" : "Beneficiary",
        icon: CheckCircle2,
        className: "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
      };
    }

    // 4. Documents Verified
    if (
      wst === "document_verification_completed" ||
      wst === "document_verified" ||
      st === "document_verification_completed" ||
      st === "document_verified"
    ) {
      return {
        label: lang === "ml" ? "രേഖകൾ പരിശോധിച്ചു" : "Documents Verified",
        icon: FileCheck,
        className: "border-purple-200/80 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300",
      };
    }

    // 5. Applied
    if (wst === "applied" || st === "applied") {
      return {
        label: lang === "ml" ? "സമർപ്പിച്ചു" : "Submitted",
        icon: Send,
        className: "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
      };
    }

    // 6. Under Review / In Review / In Progress
    if (
      wst === "in_review" ||
      wst === "review" ||
      wst === "under_review" ||
      wst === "in_progress" ||
      st === "in_review" ||
      st === "review" ||
      st === "under_review" ||
      st === "in_progress"
    ) {
      return {
        label: lang === "ml" ? "പരിശോധനയിൽ" : "In Review",
        icon: FileSearch,
        className: "border-orange-200/90 bg-orange-50 text-[#ff5500] dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300",
      };
    }

    // 7. Received / Application Received / Pending (Fallback)
    return {
      label: lang === "ml" ? "ലഭിച്ചു" : "Received",
      icon: Inbox,
      className: "border-slate-200/90 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200",
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
    let list = schemeApplications;
    const q = schemeAppSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((app) => {
        const name = `${app.applicantNameEn || ""} ${app.applicantNameMl || ""}`.toLowerCase();
        const loc = `${app.locationEn || ""} ${app.locationMl || ""}`.toLowerCase();
        const ref = `${app.ref || ""} ${app.trackingId || ""}`.toLowerCase();
        return name.includes(q) || loc.includes(q) || ref.includes(q);
      });
    }

    const stats = getSchemeStats(applicationFilterInPhone && groupBy !== "none" ? list : schemeApplications);
    if (schemeStatusFilter === "approved") {
      list = list.filter((app) => getApplicationBucket(app) === "approved");
    } else if (schemeStatusFilter === "in_review" || schemeStatusFilter === "in_progress") {
      list = list.filter((app) => getApplicationBucket(app) === "in_review");
    } else if (schemeStatusFilter === "pending") {
      list = list.filter((app) => getApplicationBucket(app) === "pending");
    } else if (schemeStatusFilter === "rejected") {
      list = list.filter((app) => getApplicationBucket(app) === "rejected");
    }
    return {
      totalSchemeApps: stats.total,
      approvedSchemeApps: stats.approved,
      inReviewSchemeApps: stats.inReview,
      pendingSchemeApps: stats.pending,
      rejectedSchemeApps: stats.rejected,
      filteredSchemeApplications: list,
    };
  }, [schemeApplications, schemeStatusFilter, schemeAppSearchQuery, applicationFilterInPhone, groupBy]);

  const sortedSchemeApplications = useMemo(() => {
    return [...filteredSchemeApplications].sort((a, b) => {
      const aTime = a.appliedDate ? Date.parse(a.appliedDate) : 0;
      const bTime = b.appliedDate ? Date.parse(b.appliedDate) : 0;
      let diff = 0;
      if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== 0 && bTime !== 0 && aTime !== bTime) {
        diff = aTime - bTime;
      } else {
        diff = (a.ref || "").localeCompare(b.ref || "");
      }
      return schemeSortOrder === "oldest" ? diff : -diff;
    });
  }, [filteredSchemeApplications, schemeSortOrder]);

  const sampleGroups = useMemo(() => {
    if (!applicationFilterInPhone || groupBy === "none") return [];
    const groups = new Map<string, MobileReportApplicationRecord[]>();
    for (const app of sortedSchemeApplications) {
      const locality = (app.locationEn || "").split(",")[0].trim();
      const assignment = SAMPLE_ORGANISATION_ASSIGNMENTS[locality];
      const district = assignment && KERALA_ORG_DISTRICTS.find((item) => item.value === assignment.district);
      const name = groupBy === "region" ? KERALA_REGIONS.find((item) => item.value === district?.region)?.en : groupBy === "org_district" ? district?.en : groupBy === "mandalam" ? assignment?.mandalam : groupBy === "area" ? assignment?.area : assignment?.ward;
      const label = name || "Unassigned";
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(app);
    }
    return [...groups.entries()].map(([name, apps]) => ({ name, apps, stats: getSchemeStats(apps) })).sort((a, b) => {
      const key = groupMetric === "review" ? "inReview" : groupMetric as "total" | "approved" | "pending" | "rejected";
      const delta = a.stats[key] - b.stats[key];
      return (groupOrder === "asc" ? delta : -delta) || a.name.localeCompare(b.name);
    });
  }, [applicationFilterInPhone, groupBy, groupMetric, groupOrder, sortedSchemeApplications]);

  const selectSchemeStatusTab = (status: "all" | "approved" | "rejected" | "in_review" | "pending") => {
    const next = status !== "all" && schemeStatusFilter === status ? "all" : status;
    setSchemeStatusFilter(next);
    if (applicationFilterInPhone && groupBy !== "none") {
      setGroupMetric(next === "all" ? "total" : next === "in_review" ? "review" : next);
    }
  };

  const renderSchemeAppCard = (
    app: MobileReportApplicationRecord,
    index: number,
    groupPrefix?: string,
  ) => {
    const badge = getStatusBadge(app);
    const BadgeIcon = badge.icon;
    const menuKey = `${groupPrefix ? `${groupPrefix}-` : ""}${app.ref}-${index}`;
    const isMenuOpen = openAppMenuKey === menuKey;

    return (
      <div
        key={menuKey}
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
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {lang === "ml" ? app.locationMl : app.locationEn}
              </div>
            </div>
          </div>

          {/* Right: Status badge & 3-dot action button */}
          <div className="flex shrink-0 items-center gap-1 self-center">
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${badge.className}`}
            >
              <BadgeIcon className="h-3 w-3 stroke-[2]" />
              <span>{badge.label}</span>
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const isUp = window.innerHeight - rect.bottom < 180;
                  setOpenAppMenuUp(isUp);
                  setOpenAppMenuKey(isMenuOpen ? null : menuKey);
                }}
                className={`flex h-6.5 w-6.5 items-center justify-center rounded-full transition-colors cursor-pointer ${
                  isMenuOpen
                    ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                }`}
                aria-label={lang === "ml" ? "കൂടുതൽ പ്രവർത്തനങ്ങൾ" : "More actions"}
                title={lang === "ml" ? "കൂടുതൽ പ്രവർത്തനങ്ങൾ" : "More actions"}
              >
                <MoreVertical className="h-3.5 w-3.5 stroke-[2.2]" />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenAppMenuKey(null);
                    }}
                  />
                  <div
                    className={`absolute right-0 z-50 w-44 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150 ${
                      openAppMenuUp ? "bottom-7" : "top-7"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpenAppMenuKey(null);
                        if (onEditApplication) {
                          onEditApplication(app);
                        } else {
                          onSelectApplication(app);
                        }
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{lang === "ml" ? "തിരുത്തുക" : "Edit"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenAppMenuKey(null);
                        onSelectApplication(app);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{lang === "ml" ? "കാണുക" : "View"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenAppMenuKey(null);
                        if (onCallApplication) {
                          onCallApplication(app);
                        } else if (app.phone) {
                          window.location.href = `tel:${app.phone.replace(/\D/g, "")}`;
                        }
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 cursor-pointer"
                    >
                      <Phone className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{lang === "ml" ? "വിളിക്കുക" : "Call"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenAppMenuKey(null);
                        if (onDocumentVerification) {
                          onDocumentVerification(app);
                        } else {
                          onCheckEligibility?.(app);
                        }
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 cursor-pointer"
                    >
                      <FileCheck className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{lang === "ml" ? "രേഖാ പരിശോധന" : "Update Document verification"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenAppMenuKey(null);
                        onDeleteApplication?.(app);
                      }}
                      className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-1.5 text-left text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:border-slate-800 dark:text-red-400 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                      <span>{lang === "ml" ? "നീക്കം ചെയ്യുക" : "Delete"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Scheme Applications Drilldown View
  if (selectedScheme) {
    return (
      <div className={`flex flex-col min-h-full bg-white dark:bg-slate-950 pb-10 animate-in fade-in duration-200 ${isFilterSheetOpen ? "overflow-hidden max-h-screen" : ""}`}>
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
            <h2 className="absolute inset-y-0 left-10 right-12 flex items-center justify-center text-center text-[12.5px] font-extrabold text-[#0F172A] dark:text-white pointer-events-none truncate leading-tight">
              {lang === "ml" ? selectedScheme.nameMl : selectedScheme.nameEn}
            </h2>

            {/* Right Action: 3-dot Scheme Menu (View Scheme details, Apply Scheme, Share Scheme) */}
            <div className="relative shrink-0 z-10">
              <button
                type="button"
                onClick={() => setIsSchemeMenuOpen((prev) => !prev)}
                className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-white text-[#1b255a] hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer transition-colors border border-slate-200/80 dark:border-slate-700 shadow-2xs"
                aria-label={lang === "ml" ? "കൂടുതൽ ഓപ്ഷനുകൾ" : "More options"}
                title={lang === "ml" ? "കൂടുതൽ ഓപ്ഷനുകൾ" : "More options"}
              >
                <MoreVertical className="h-3.5 w-3.5 stroke-[2.2] text-slate-700 dark:text-slate-200" />
              </button>

              {isSchemeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSchemeMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSchemeMenuOpen(false);
                        onOpenSchemeDetails?.(selectedScheme.nameEn);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-slate-800 dark:hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                      <span>{lang === "ml" ? "പദ്ധതി വിവരങ്ങൾ കാണുക" : "View Scheme details"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSchemeMenuOpen(false);
                        onApplyScheme?.(selectedScheme.nameEn);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-slate-800 dark:hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      <FileCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{lang === "ml" ? "പദ്ധതിക്ക് അപേക്ഷിക്കുക" : "Apply Scheme"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSchemeMenuOpen(false);
                        handleShareScheme(selectedScheme.nameEn);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-slate-800 dark:hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span>{lang === "ml" ? "പദ്ധതി പങ്കിടുക" : "Share Scheme"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Date and Controls Section (October 2026, Arrows, Calendar, Search, Filter) */}
        <div className="relative bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-3.5 py-1.5 flex items-center justify-between gap-2">
          {isSchemeAppSearchExpanded ? (
            <div className="relative flex-1 animate-in fade-in slide-in-from-right-2 duration-150">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <input
                type="text"
                value={schemeAppSearchQuery}
                onChange={(e) => setSchemeAppSearchQuery(e.target.value)}
                placeholder={lang === "ml" ? "അപേക്ഷകന്റെ പേര്, സ്ഥലം തിരയുക..." : "Search applicant, location..."}
                className="w-full h-6 pl-7 pr-6 text-[11px] rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setIsSchemeAppSearchExpanded(false);
                  setSchemeAppSearchQuery("");
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                title={lang === "ml" ? "തിരയൽ റദ്ദാക്കുക" : "Cancel Search"}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={openFilterSheet}
                className="font-display text-[11px] sm:text-[13px] font-extrabold text-[#ff5500] tracking-tight leading-none text-left cursor-pointer whitespace-nowrap shrink-0"
                title={lang === "ml" ? "ഫിൽട്ടർ കാണിക്കുക" : "Show Filter Popup"}
              >
                {appliedSchemeFilter.workView === "team" ? (lang === "ml" ? "ടീം കാഴ്ച" : "Team View") : (lang === "ml" ? "എന്റെ കാഴ്ച" : "My View")}
              </button>
              {applicationFilterInPhone ? <ApplicationPeriodLabel text={periodText || "October 2026"} lang={lang} onChange={() => onOpenDatePicker?.()} /> : <button
                type="button"
                onClick={onOpenDatePicker}
                className="font-display text-[10px] sm:text-[11px] font-semibold text-[#0a0f1d] dark:text-white tracking-tight leading-none text-center hover:text-[#ff5500] transition-colors cursor-pointer whitespace-nowrap truncate min-w-0 flex-1 px-1"
                title={lang === "ml" ? "തീയതി മാറ്റുക" : "Change Period"}
              >
                {periodText || "October 2026"}
              </button>}
            </>
          )}

          {/* Right Controls: < > 📅 🔍 ⑂ */}
          <div className="flex items-center gap-1.5 min-w-0 shrink-0">
            {!isSchemeAppSearchExpanded && (
              <>
                {/* Previous Period */}
                <button
                  type="button"
                  onClick={() => onStepPeriod?.(-1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer shrink-0"
                  title={lang === "ml" ? "മുമ്പത്തെ കാലയളവ്" : "Previous Period"}
                >
                  <ChevronLeft className="h-3 w-3 stroke-[2.5]" />
                </button>

                {/* Next Period */}
                <button
                  type="button"
                  onClick={() => onStepPeriod?.(1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer shrink-0"
                  title={lang === "ml" ? "അടുത്ത കാലയളവ്" : "Next Period"}
                >
                  <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                </button>

                {/* Date Picker Button */}
                <button
                  type="button"
                  onClick={onOpenDatePicker}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors shadow-2xs cursor-pointer shrink-0"
                  title={lang === "ml" ? "തീയതി തിരഞ്ഞെടുക്കുക" : "Select Date / Period"}
                >
                  <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
                </button>

                {/* Search Icon Button */}
                <button
                  type="button"
                  onClick={() => setIsSchemeAppSearchExpanded(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs cursor-pointer shrink-0"
                  title={lang === "ml" ? "തിരയുക" : "Search"}
                >
                  <Search className="h-3 w-3 stroke-[2.2] text-[#ff5500]" />
                </button>
              </>
            )}

            {/* Filter Icon Button */}
            {applicationFilterInPhone && <button type="button" onClick={() => setGroupSortOpen(true)} aria-label="Group and sort applications" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${groupBy !== "none" || groupMetric !== "total" || groupOrder !== "desc" ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "border-slate-200 bg-white text-[#ff5500] dark:border-slate-800 dark:bg-slate-900"}`}><ArrowUpDown className="h-3.5 w-3.5" /></button>}
            <button
              type="button"
              onClick={openFilterSheet}
              aria-haspopup="dialog"
              aria-expanded={isFilterSheetOpen}
              className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                activeFilterCount > 0 || (applicationFilterInPhone && schemeStatusFilter !== "all")
                  ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              title={lang === "ml" ? "അപേക്ഷാ ഫിൽട്ടർ" : "Application Filter"}
            >
              <Filter
                className={`h-3 w-3 stroke-[2.2] ${
                  activeFilterCount > 0 || (applicationFilterInPhone && schemeStatusFilter !== "all") ? "text-white" : "text-[#ff5500]"
                }`}
              />
              {(activeFilterCount > 0 || (applicationFilterInPhone && schemeStatusFilter !== "all")) && (
                <span className="absolute -top-1 -right-1 flex h-3 min-w-3 items-center justify-center rounded-full bg-red-600 px-0.5 text-[7px] font-black leading-none text-white ring-1.5 ring-white dark:ring-slate-900">
                  {activeFilterCount + (applicationFilterInPhone && schemeStatusFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Applied Filters Bar (Single Row) */}
        {renderAppliedFiltersRow(false, applicationFilterInPhone)}

        {/* Content Container */}
        <div className="px-3 pt-2 pb-4">
          {/* Unified 5-KPI Segmented Card Bar (Compact height, adjusted padding and gap) */}
          {/* Order: Applications, Approved, Rejected, In Review, Pending */}
          <div className="flex items-stretch rounded-xl bg-[#FCFAF6] dark:bg-slate-900 border border-[#ECE7DF] dark:border-slate-800 shadow-2xs mb-2.5 overflow-hidden divide-x divide-[#ECE7DF] dark:divide-slate-800">
            {/* 1. Applications */}
            <button
              type="button"
              onClick={() => selectSchemeStatusTab("all")}
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
              onClick={() => selectSchemeStatusTab("approved")}
              className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center ${
                schemeStatusFilter === "approved"
                  ? "bg-emerald-50/70 dark:bg-emerald-950/40"
                  : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              }`}
              title={lang === "ml" ? "അംഗീകരിച്ചവ" : "Beneficiary"}
            >
              <span className="text-[13.5px] font-extrabold text-[#00875A] dark:text-emerald-400 leading-none">
                {approvedSchemeApps}
              </span>
              <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                {lang === "ml" ? "അംഗീകാരം" : "Beneficiary"}
              </span>
            </button>

            {/* 3. Rejected */}
            <button
              type="button"
              onClick={() => selectSchemeStatusTab("rejected")}
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

            {/* 4. In Review */}
            <button
              type="button"
              onClick={() => selectSchemeStatusTab("in_review")}
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

            {/* 5. Pending */}
            <button
              type="button"
              onClick={() => selectSchemeStatusTab("pending")}
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
          </div>

          {/* Applications List */}
          <div className="space-y-1.5">
            {sortedSchemeApplications.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                <Inbox className="h-7 w-7 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {lang === "ml" ? "അപേക്ഷകൾ ഒന്നും കണ്ടെത്തിയില്ല." : "No applications found."}
                </p>
                {(schemeStatusFilter !== "all" || schemeAppSearchQuery || activeFilterCount > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSchemeStatusFilter("all");
                      setSchemeAppSearchQuery("");
                      clearLocalFilters();
                    }}
                    className="mt-2 text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    {lang === "ml" ? "ഫിൽട്ടർ ഒഴിവാക്കുക" : "Clear Filters"}
                  </button>
                )}
              </div>
            ) : applicationFilterInPhone && groupBy !== "none" ? (
              sampleGroups.map((group) => {
                const expanded = collapsedGroups.includes(group.name);
                const metricKey =
                  groupMetric === "review"
                    ? "inReview"
                    : (groupMetric as "total" | "approved" | "pending" | "rejected");
                return (
                  <div
                    key={`group-${group.name}`}
                    className="overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs transition-all"
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() =>
                        setCollapsedGroups((current) =>
                          expanded
                            ? current.filter((name) => name !== group.name)
                            : [...current, group.name]
                        )
                      }
                      className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        expanded
                          ? "border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40"
                          : ""
                      }`}
                    >
                      <span className="min-w-0 truncate text-[12px] font-bold text-slate-900 dark:text-white">
                        {group.name}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-slate-800 px-1.5 text-[11px] font-extrabold text-orange-700 dark:text-slate-200">
                          {group.stats[metricKey]}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                            expanded ? "" : "-rotate-90"
                          }`}
                        />
                      </span>
                    </button>
                    {expanded && (
                      <div className="space-y-1.5 bg-slate-50/40 dark:bg-slate-950/40 p-2">
                        {group.apps.length === 0 ? (
                          <div className="py-2.5 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            {lang === "ml" ? "അപേക്ഷകൾ ഒന്നും ഇല്ല" : "No applications"}
                          </div>
                        ) : (
                          group.apps.map((app, appIdx) =>
                            renderSchemeAppCard(app, appIdx, group.name)
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              sortedSchemeApplications.map((app, index) =>
                renderSchemeAppCard(app, index)
              )
            )}
          </div>
        </div>
        {schemeShareToast && (
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900/90 text-white text-[11px] font-bold px-4 py-1.5 shadow-lg backdrop-blur-xs animate-in fade-in zoom-in-95">
            {schemeShareToast}
          </div>
        )}
        {applicationFilterInPhone && groupSortOpen && typeof document !== "undefined" && (() => {
          const phone = document.querySelector("[data-mobile-preview-shell]");
          if (!phone) return null;
          const groupLabels: Record<string, string> = { region: "Region", org_district: "Organisational District", mandalam: "Assembly Mandalam", area: "Area", ward: "Ward", none: "No Grouping" };
          const defaults: Record<SchemeLocationLevel, string> = { state: "org_district", region: "org_district", org_district: "mandalam", mandalam: "area", area: "ward", ward: "none" };
          const choices = appliedSchemeFilter.locationLevel === "state" ? ["none", "org_district", "region"] : [...new Set(["none", defaults[appliedSchemeFilter.locationLevel]])];
          return createPortal(<div className="absolute inset-0 z-[120] flex items-end bg-slate-950/60" onClick={() => setGroupSortOpen(false)}><div role="dialog" aria-modal="true" aria-label="Group and sort" onClick={(event) => event.stopPropagation()} className="flex max-h-[85%] w-full flex-col rounded-t-[24px] border-t border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" /><div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800"><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{lang === "ml" ? "ഗ്രൂപ്പും ക്രമവും" : "Group & Sort"}</h2><button type="button" onClick={() => setGroupSortOpen(false)} aria-label="Close" className="rounded-full bg-slate-100 p-1.5 dark:bg-slate-800"><X className="h-4 w-4" /></button></div><div className="min-h-0 space-y-3 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><p className="text-[10px] text-slate-500 dark:text-slate-400">{lang === "ml" ? "മാതൃകാ സംഘടനാ വിവരങ്ങൾ" : "Sample organisation assignments"}</p><div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Group By</span><MobileFilterPicker label="Group By" value={groupBy} options={choices.map((choice) => ({ value: choice, label: groupLabels[choice] }))} onChange={(value) => { setGroupBy(value); setCollapsedGroups([]); }} /></div><div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Sort By</span><MobileFilterPicker label="Sort By" value={groupMetric} options={SCHEME_SORT_METRICS.filter((option) => option.value !== "name").map((option) => ({ value: option.value, label: lang === "ml" ? option.ml : option.en }))} onChange={setGroupMetric} /></div><div><p className="mb-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">Sort Order</p><div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">{[{ id: "desc", text: "↓ High to Low" }, { id: "asc", text: "↑ Low to High" }].map((option) => <button key={option.id} type="button" aria-pressed={groupOrder === option.id} onClick={() => setGroupOrder(option.id)} className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold ${groupOrder === option.id ? "bg-white text-orange-700 shadow-sm dark:bg-slate-700 dark:text-orange-300" : "text-slate-500 dark:text-slate-400"}`}>{option.text}</button>)}</div></div></div><button type="button" onClick={() => { setSchemeStatusFilter(groupMetric === "total" ? "all" : groupMetric === "review" ? "in_review" : groupMetric as "approved" | "pending" | "rejected"); setGroupSortOpen(false); }} className="mt-3 rounded-lg bg-[#ff5500] py-2.5 text-xs font-extrabold text-white">{lang === "ml" ? "പ്രയോഗിക്കുക" : "Apply"}</button></div></div>, phone);
        })()}
        {renderApplicationFilterSheet()}
      </div>
    );
  }

  // Render Category Applications Drilldown View
  if (selectedCategory) {
    const appCount = categoryApplications.length;
    const catSchemesCount = schemesCountByCategory[selectedCategory.id] || selectedCategory.schemesCount;

    return (
      <div className={`relative flex flex-col min-h-full bg-white dark:bg-slate-950 pb-8 animate-in fade-in duration-200 ${isFilterSheetOpen ? "overflow-hidden max-h-screen" : ""}`}>
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
                          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {lang === "ml" ? app.locationMl : app.locationEn}
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
        {schemeShareToast && (
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900/90 text-white text-[11px] font-bold px-4 py-1.5 shadow-lg backdrop-blur-xs animate-in fade-in zoom-in-95">
            {schemeShareToast}
          </div>
        )}
        {renderApplicationFilterSheet()}
      </div>
    );
  }

  // Root Reports Page View with 2 Tabs
  return (
    <div className={`relative flex flex-col min-h-full bg-white dark:bg-slate-950 pb-20 animate-in fade-in duration-200 ${isFilterSheetOpen ? "overflow-hidden max-h-screen" : ""}`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-30 ${headerStyle === "period_controls" ? "bg-white" : "bg-[#FFFDF9]"} dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 px-3.5 py-1.5 shadow-2xs`}>
        {headerStyle === "period_controls" ? (
          <div className="flex items-center justify-between w-full gap-1">
            {/* Left Side: Period Title or Search Input */}
            {isSearchExpanded ? (
              <div className="relative flex-1 min-w-0 pr-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "ml" ? "പദ്ധതികൾ തിരയുക..." : "Search schemes..."}
                  className="w-full h-6 pl-7 pr-6 text-[11px] font-semibold rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchExpanded(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  title="Cancel Search"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openFilterSheet}
                  className="font-display text-[11px] sm:text-[13px] font-extrabold text-[#ff5500] tracking-tight leading-none text-left cursor-pointer whitespace-nowrap shrink-0"
                  title={lang === "ml" ? "ഫിൽട്ടർ കാണിക്കുക" : "Show Filter Popup"}
                >
                  {appliedSchemeFilter.workView === "team" ? (lang === "ml" ? "ടീം കാഴ്ച" : "Team View") : (lang === "ml" ? "എന്റെ കാഴ്ച" : "My View")}
                </button>
                {applicationFilterInPhone ? <ApplicationPeriodLabel text={periodText || "October 2026"} lang={lang} onChange={() => onOpenDatePicker?.()} /> : <button
                  type="button"
                  onClick={onOpenDatePicker}
                  className="font-display text-[10px] sm:text-[11px] font-semibold text-[#0a0f1d] dark:text-white tracking-tight leading-none text-center hover:text-[#ff5500] transition-colors cursor-pointer whitespace-nowrap truncate min-w-0 flex-1 px-1"
                  title={lang === "ml" ? "തീയതി മാറ്റുക" : "Change Period"}
                >
                  {periodText || "October 2026"}
                </button>}
              </>
            )}

            {/* Date Controls (< > calendar), Search Icon & Filter Action */}
            <div className="flex items-center gap-1.5 min-w-0 shrink-0">
              {!isSearchExpanded && (
                <>
                  {/* Previous Period */}
                  <button
                    type="button"
                    onClick={() => onStepPeriod?.(-1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer shrink-0"
                    title={lang === "ml" ? "മുമ്പത്തെ കാലയളവ്" : "Previous Period"}
                  >
                    <ChevronLeft className="h-3 w-3 stroke-[2.5]" />
                  </button>

                  {/* Next Period */}
                  <button
                    type="button"
                    onClick={() => onStepPeriod?.(1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer shrink-0"
                    title={lang === "ml" ? "അടുത്ത കാലയളവ്" : "Next Period"}
                  >
                    <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                  </button>

                  {/* Date Picker Button */}
                  <button
                    type="button"
                    onClick={onOpenDatePicker}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs cursor-pointer shrink-0"
                    title={lang === "ml" ? "തീയതി തിരഞ്ഞെടുക്കുക" : "Select Date / Period"}
                  >
                    <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
                  </button>
                </>
              )}

              {/* Search Icon Button */}
              {!isSearchExpanded && (
                <button
                  type="button"
                  onClick={() => setIsSearchExpanded(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs cursor-pointer shrink-0"
                  title="Search Schemes"
                >
                  <Search className="h-3 w-3 stroke-[2.2] text-[#ff5500]" />
                </button>
              )}

              {/* Filter Icon Button */}
              {applicationFilterInPhone && <button type="button" onClick={() => { setDraftSchemeCardSort(schemeCardSort); setSchemeSortOpen(true); }} aria-label={lang === "ml" ? "പദ്ധതികൾ ക്രമീകരിക്കുക" : "Sort schemes"} aria-haspopup="dialog" aria-expanded={schemeSortOpen} className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${schemeCardSort !== "total_desc" ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "border-slate-200 bg-white text-[#ff5500] dark:border-slate-800 dark:bg-slate-900"}`} title="Sort schemes">
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>}
              <button
                type="button"
                onClick={openFilterSheet}
                aria-haspopup="dialog"
                aria-expanded={isFilterSheetOpen}
                className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                  activeFilterCount > 0
                    ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                title={lang === "ml" ? "അപേക്ഷാ ഫിൽട്ടർ" : "Application Filter"}
              >
                <Filter
                  className={`h-3 w-3 stroke-[2.2] ${
                    activeFilterCount > 0 ? "text-white" : "text-[#ff5500]"
                  }`}
                />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 min-w-3 items-center justify-center rounded-full bg-red-600 px-0.5 text-[7px] font-black leading-none text-white ring-1 ring-white dark:ring-slate-900">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        ) : (
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
        )}

        {/* Collapsible Search Input for Default Header */}
        {headerStyle !== "period_controls" && isSearchExpanded && (
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

      {/* Applied Filters Bar (Single Row) */}
      {renderAppliedFiltersRow(applicationFilterInPhone)}

      {/* Main Body - Scheme-wise Applications List */}
      <div className="p-2.5 space-y-2">
        <div className="space-y-1.5">
          {visibleSchemes.map((scheme) => {
            const records = filteredByScheme.get(scheme.id) || [];
            const schemeApps = applicationFilterInPhone ? [...new Map(records.map((app) => [app.ref || app.trackingId, app])).values()] : records;
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
                    title={lang === "ml" ? "അംഗീകരിച്ചവ" : "Beneficiary"}
                  >
                    <span className="text-[11.5px] font-extrabold text-[#00875A] dark:text-emerald-400 leading-none">
                      {stats.approved}
                    </span>
                    <span className="text-[7.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap leading-none">
                      {lang === "ml" ? "ഗുണഭോക്താവ്" : "Beneficiary"}
                    </span>
                  </button>

                  {/* 3. Rejected */}
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

                  {/* 4. In Review */}
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

                  {/* 5. Pending */}
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
      {applicationFilterInPhone && schemeSortOpen && typeof document !== "undefined" && (() => {
        const phone = document.querySelector("[data-mobile-preview-shell]");
        if (!phone) return null;
        return createPortal(
          <div className="absolute inset-0 z-[120] flex items-end bg-slate-950/60" onClick={() => setSchemeSortOpen(false)}>
            <div role="dialog" aria-modal="true" aria-label={lang === "ml" ? "പദ്ധതികൾ ക്രമീകരിക്കുക" : "Sort schemes"} className="flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-[24px] border-t border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
              <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><ArrowUpDown className="h-4 w-4 text-[#ff5500]" />{lang === "ml" ? "ക്രമീകരിക്കുക" : "Sort By"}</h2>
                <button type="button" onClick={() => setSchemeSortOpen(false)} aria-label={lang === "ml" ? "അടയ്ക്കുക" : "Close"} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"><X className="h-4 w-4" /></button>
              </div>
              <div className="min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">{lang === "ml" ? "ക്രമീകരിക്കേണ്ട മാനദണ്ഡം" : "Sort By"}</p>
                <div role="radiogroup" aria-label="Sort By">
                  {SCHEME_SORT_METRICS.map((option) => {
                    const selected = draftSchemeCardSort.startsWith(`${option.value}_`);
                    return <button key={option.value} type="button" role="radio" aria-checked={selected} onClick={() => { if (!selected) setDraftSchemeCardSort(`${option.value}_${option.value === "name" ? "asc" : "desc"}`); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold ${selected ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"}`}><span>{lang === "ml" ? option.ml : option.en}</span><span className={`flex h-4 w-4 items-center justify-center rounded-full border ${selected ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 dark:border-slate-600"}`}>{selected && <Check className="h-3 w-3" />}</span></button>;
                  })}
                </div>
                <p className="px-3 pb-1 pt-3 text-[10px] font-bold text-slate-500 dark:text-slate-400">{lang === "ml" ? "ക്രമം" : "Sort Order"}</p>
                <div role="radiogroup" aria-label="Sort Order" className="mx-3 flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/70">
                  {(draftSchemeCardSort.startsWith("name_") ? [{ value: "asc", label: "A to Z" }, { value: "desc", label: "Z to A" }] : [{ value: "desc", label: lang === "ml" ? "ഉയർന്നതിൽ നിന്ന് താഴേക്ക്" : "High to Low" }, { value: "asc", label: lang === "ml" ? "താഴ്ന്നതിൽ നിന്ന് മുകളിലേക്ക്" : "Low to High" }]).map((option) => {
                    const [metric, direction] = draftSchemeCardSort.split("_");
                    const selected = direction === option.value;
                    return <button key={option.value} type="button" role="radio" aria-checked={selected} onClick={() => setDraftSchemeCardSort(`${metric}_${option.value}`)} className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 text-center text-xs font-semibold transition-colors ${selected ? "bg-white text-orange-700 shadow-sm dark:bg-slate-700 dark:text-orange-300" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}><span aria-hidden="true">{option.value === "desc" ? "↓" : "↑"}</span><span>{option.label}</span></button>;
                  })}
                </div>
                {(() => {
                  const [metric, direction] = draftSchemeCardSort.split("_");
                  const selectedMetric = SCHEME_SORT_METRICS.find((option) => option.value === metric);
                  const metricLabel = selectedMetric ? (lang === "ml" ? selectedMetric.ml : selectedMetric.en) : "";
                  const orderLabel = metric === "name" ? (direction === "asc" ? "A to Z" : "Z to A") : (direction === "desc" ? "highest first" : "lowest first");
                  return <p className="px-3 pt-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">{lang === "ml" ? `പദ്ധതികൾ ${metricLabel} അനുസരിച്ച് ${metric === "name" ? orderLabel : direction === "desc" ? "ഉയർന്നത് ആദ്യം" : "താഴ്ന്നത് ആദ്യം"} ക്രമീകരിക്കും.` : `Schemes will be sorted by ${metricLabel}, ${orderLabel}.`}</p>;
                })()}
              </div>
              <button type="button" onClick={() => { setSchemeCardSort(draftSchemeCardSort); setSchemeSortOpen(false); }} className="mt-3 shrink-0 rounded-lg bg-[#ff5500] py-2.5 text-xs font-extrabold text-white">{lang === "ml" ? "പ്രയോഗിക്കുക" : "Apply"}</button>
            </div>
          </div>, phone,
        );
      })()}
    </div>
  );
}
