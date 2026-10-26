import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Smartphone, Wifi, Battery, Signal, ChevronRight, ChevronLeft, ArrowLeft, Users, HeartHandshake, Database, Layers, Sparkles, MessageSquare, Clock3, UserCheck, LayoutDashboard, Sliders, Calendar, FileText, XCircle, CheckCircle2, Hourglass, MapPin, Trophy, AlertTriangle, Activity, Globe, Map, Network, Store, ShieldCheck, ChevronDown, Filter, Search, Megaphone, CalendarDays, BellRing, Phone, RotateCcw, GraduationCap, Sprout, LayoutGrid, MoreVertical, AlertCircle, Star, Zap, Headphones, Edit, Upload, FileCheck, Loader2, SearchX, RefreshCw, Check, Lock, User, Download, Eye } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import officialLotus from "@/assets/bjp-official-lotus.png";
import users3dIcon from "@/assets/kpi-3d/users.png";
import inReview3dIcon from "@/assets/kpi-3d/in-review.png";
import applications3dIcon from "@/assets/kpi-3d/applications.png";
import applicationReceived3dIcon from "@/assets/kpi-3d/application-received.png";
import submitted3dIcon from "@/assets/kpi-3d/submitted.png";
import assisted3dIcon from "@/assets/kpi-3d/assisted.png";
import pending3dIcon from "@/assets/kpi-3d/pending.png";
import rejected3dIcon from "@/assets/kpi-3d/rejected.png";
import schemes3dIcon from "@/assets/kpi-3d/schemes.png";
import coveredBooth3dIcon from "@/assets/kpi-3d/covered-booth.png";
import sahaiAvatar from "@/assets/sahai-avatar-v3.png";
import { AdminMobileAppBottomNav, AdminMobileTab } from "./AdminMobileAppBottomNav";
import { AdminMobileAppHeader } from "./AdminMobileAppHeader";
import { DatePickerModal } from "./DatePickerModal";
import { MobileUsersListTab } from "./MobileUsersListTab";
import { MobileAppliedFiltersScope, FilterChip } from "./MobileAppliedFiltersScope";
import { PartyFlagIcon } from "@/components/common/PartyFlagIcon";
import { districts, constituencies, panchayats, wards, getDistrictName, getConstituencyName, getWardsForLocalBody, getMappedConstituencyForWard, LocalBodyType, WardItem } from "@/data/geo";
import { LeaderboardTop3Podium } from "./LeaderboardTop3Podium";

interface AdminMobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockBeneficiariesFullList = [
  { id: "BEN-8921", name: "Soman P", nameMl: "സോമൻ പി", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Kazhakkoottam, TVM", scheme: "Vayoshreshtha Pension", status: "Verified", date: "2026-10-04", phone: "+91 94471 23456" },
  { id: "BEN-8922", name: "Lakshmi Amma", nameMl: "ലക്ഷ്മി അമ്മ", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Vattiyoorkavu, TVM", scheme: "Karunya Health Insurance", status: "Verified", date: "2026-10-03", phone: "+91 98470 11223" },
  { id: "BEN-8923", name: "Abdul Rahman", nameMl: "അബ്ദുൾ റഹ്മാൻ", category: "BJP Member", categoryMl: "ബി.ജെ.പി അംഗം", location: "Kollam Port, KLM", scheme: "Matsya Samridhi Scheme", status: "Verified", date: "2026-10-05", phone: "+91 97451 98765" },
  { id: "BEN-8924", name: "Sunitha Kumari", nameMl: "സുനിത കുമാരി", category: "Politician", categoryMl: "രാഷ്ട്രീയ നേതാവ്", location: "Kottayam East, KTM", scheme: "Kudumbashree Enterprise Aid", status: "Verified", date: "2026-10-02", phone: "+91 94462 54321" },
  { id: "BEN-8925", name: "K. Krishnan", nameMl: "കെ. കൃഷ്ണൻ", category: "People’s Representative", categoryMl: "ജനപ്രതിനിധി", location: "Palakkad North, PKD", scheme: "PM Kisan Samman Nidhi", status: "Verified", date: "2026-10-01", phone: "+91 98463 87654" },
  { id: "BEN-8926", name: "Ananya Ramesh", nameMl: "അനന്യ രമേശ്", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Tripunithura, EKM", scheme: "Pratibha Education Assistance", status: "Verified", date: "2026-10-05", phone: "+91 94950 33445" },
  { id: "BEN-8927", name: "Joseph K", nameMl: "ജോസഫ് കെ", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Chathannoor, KLM", scheme: "LIFE Mission Housing Title", status: "Verified", date: "2026-09-29", phone: "+91 98952 66778" },
  { id: "BEN-8928", name: "Radhamani V", nameMl: "രാധാമണി വി", category: "BJP Member", categoryMl: "ബി.ജെ.പി അംഗം", location: "Balaramapuram, TVM", scheme: "Handloom Worker Subsidy", status: "Verified", date: "2026-09-28", phone: "+91 94475 99001" },
  { id: "BEN-8929", name: "Muhammed Shafee", nameMl: "മുഹമ്മദ് ഷാഫി", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Malappuram Central, MLP", scheme: "Subhiksha Keralam Agriculture Aid", status: "Verified", date: "2026-09-27", phone: "+91 97441 12389" },
  { id: "BEN-8930", name: "Devaki Amma", nameMl: "ദേവകി അമ്മ", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Kannur Town, KNR", scheme: "Vayokshema Pension Scheme", status: "Verified", date: "2026-09-26", phone: "+91 94460 44556" },
  { id: "BEN-8931", name: "Saritha V", nameMl: "സരിത വി", category: "BJP Member", categoryMl: "ബി.ജെ.പി അംഗം", location: "Kasaragod South, KSD", scheme: "She Pad & Hygiene Grant", status: "Verified", date: "2026-09-25", phone: "+91 98472 77889" },
  { id: "BEN-8932", name: "Mathew Varghese", nameMl: "മാത്യു വർഗീസ്", category: "Politician", categoryMl: "രാഷ്ട്രീയ നേതാവ്", location: "Adimali, IDK", scheme: "Hill Farming Subsidy & Crop Aid", status: "Verified", date: "2026-09-24", phone: "+91 94961 88990" },
  { id: "BEN-8933", name: "P. Thomas", nameMl: "പി. തോമസ്", category: "People’s Representative", categoryMl: "ജനപ്രതിനിധി", location: "Koyilandy, CLT", scheme: "Kera Suraksha Coconut Farming", status: "Verified", date: "2026-09-23", phone: "+91 97455 11224" },
  { id: "BEN-8934", name: "Suja Nair", nameMl: "സുജ നായർ", category: "Public Citizen", categoryMl: "പൊതുജനങ്ങൾ", location: "Thrissur Town, TSR", scheme: "Pratibha Merit Scholarship", status: "Verified", date: "2026-09-22", phone: "+91 98950 55667" },
];

const schemeCategories2Row = [
  {
    id: "agriculture",
    labelEn: "Agriculture",
    labelMl: "കൃഷി",
    schemesCount: "948 Schemes",
    schemesCountMl: "948 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_agriculture.png",
    detail: {
      id: "agriculture",
      count: 18,
      categoryLabelEn: "Agriculture & Farmers Welfare",
      categoryLabelMl: "കർഷക ക്ഷേമം",
      titleEn: "Agriculture & Farming Schemes",
      titleMl: "കാർഷിക & കർഷക ക്ഷേമ പദ്ധതികൾ",
    },
  },
  {
    id: "banking",
    labelEn: "Banking &\nInsurance",
    labelMl: "ബാങ്കിംഗ് &\nഇൻഷുറൻസ്",
    schemesCount: "358 Schemes",
    schemesCountMl: "358 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_banking.png",
    detail: {
      id: "banking",
      count: 14,
      categoryLabelEn: "Banking & Insurance",
      categoryLabelMl: "ബാങ്കിംഗ് & ഇൻഷുറൻസ്",
      titleEn: "Banking, Insurance & Credit Schemes",
      titleMl: "ബാങ്കിംഗ്, ഇൻഷുറൻസ് & വായ്പാ പദ്ധതികൾ",
    },
  },
  {
    id: "business",
    labelEn: "Business &\nEntrepreneurship",
    labelMl: "ബിസിനസ് &\nസംരംഭകത്വം",
    schemesCount: "831 Schemes",
    schemesCountMl: "831 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_business.png",
    detail: {
      id: "business",
      count: 22,
      categoryLabelEn: "Business & Entrepreneurship",
      categoryLabelMl: "സംരംഭകത്വം",
      titleEn: "Business & Startup Initiatives",
      titleMl: "ബിസിനസ് & സംരംഭകത്വ പദ്ധതികൾ",
    },
  },
  {
    id: "education",
    labelEn: "Education &\nLearning",
    labelMl: "വിദ്യാഭ്യാസം &\nപഠനം",
    schemesCount: "1,184 Schemes",
    schemesCountMl: "1,184 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_education.png",
    detail: {
      id: "education",
      count: 26,
      categoryLabelEn: "Education & Scholarships",
      categoryLabelMl: "വിദ്യാഭ്യാസം & സ്കോളർഷിപ്പ്",
      titleEn: "Education & Skill Learning Schemes",
      titleMl: "വിദ്യാഭ്യാസ & പഠന സ്കോളർഷിപ്പ് പദ്ധതികൾ",
    },
  },
  {
    id: "health",
    labelEn: "Health &\nWellness",
    labelMl: "ആരോഗ്യം &\nക്ഷേമം",
    schemesCount: "296 Schemes",
    schemesCountMl: "296 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_health.png",
    detail: {
      id: "healthcare",
      count: 15,
      categoryLabelEn: "Health & Medical",
      categoryLabelMl: "ആരോഗ്യം & വ്യക്തിഗത പരിരക്ഷ",
      titleEn: "Health & Family Insurance Schemes",
      titleMl: "ആരോഗ്യ പരിരക്ഷാ & മെഡിക്കൽ പദ്ധതികൾ",
    },
  },
  {
    id: "housing",
    labelEn: "Housing &\nShelter",
    labelMl: "ഭവനം &\nപാർപ്പിടം",
    schemesCount: "145 Schemes",
    schemesCountMl: "145 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_housing.png",
    detail: {
      id: "housing",
      count: 12,
      categoryLabelEn: "Housing & Infrastructure",
      categoryLabelMl: "ഭവനം & പാർപ്പിടം",
      titleEn: "Housing & Shelter Assistance Schemes",
      titleMl: "ഭവന നിർമ്മാണ & ലൈഫ് മിഷൻ പദ്ധതികൾ",
    },
  },
  {
    id: "law",
    labelEn: "Law &\nJustice",
    labelMl: "നിയമവും\nനീതിയും",
    schemesCount: "35 Schemes",
    schemesCountMl: "35 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_law_justice.png",
    detail: {
      id: "law",
      count: 9,
      categoryLabelEn: "Law, Justice & Rights",
      categoryLabelMl: "നിയമം & അവകാശങ്ങൾ",
      titleEn: "Legal Aid & Justice Protection Schemes",
      titleMl: "നിയമസഹായ & അവകാശ സംരക്ഷണ പദ്ധതികൾ",
    },
  },
  {
    id: "science",
    labelEn: "Science &\nIT",
    labelMl: "ശാസ്ത്രം &\nഐ.ടി",
    schemesCount: "134 Schemes",
    schemesCountMl: "134 പദ്ധതികൾ",
    icon: "/images/category-icons/cat_science.png",
    detail: {
      id: "science",
      count: 11,
      categoryLabelEn: "Science, Tech & IT",
      categoryLabelMl: "ശാസ്ത്രം & ഐ.ടി",
      titleEn: "Science & Technology Innovation Grants",
      titleMl: "ശാസ്ത്ര സാങ്കേതിക & ഐ.ടി വികസന പദ്ധതികൾ",
    },
  },
];


const popularSchemesList = [
  { id: "pm_jay", nameEn: "Ayushman Bharat", nameMl: "ആയുഷ്മാൻ ഭാരത്", logo: "/images/popular-schemes/pm_jay.png", categoryId: "healthcare" },
  { id: "digital_india", nameEn: "Digital India", nameMl: "ഡിജിറ്റൽ ഇന്ത്യ", logo: "/images/popular-schemes/digital_india.png", categoryId: "science" },
  { id: "pmkvy", nameEn: "PM Kaushal Vikas", nameMl: "പിഎം കൗശൽ വികാസ്", logo: "/images/popular-schemes/pmkvy.png", categoryId: "education" },
  { id: "khelo_india", nameEn: "Khelo India", nameMl: "ഖേലോ ഇന്ത്യ", logo: "/images/popular-schemes/khelo_india.png", categoryId: "education" },
  { id: "mid_day_meal", nameEn: "Mid-Day Meal", nameMl: "ഉച്ചഭക്ഷണ പദ്ധതി", logo: "/images/popular-schemes/mid_day_meal.png", categoryId: "education" },
  { id: "pm_matru_vandana", nameEn: "PM Matru Vandana", nameMl: "പിഎം മാതൃ വന്ദന", logo: "/images/popular-schemes/pm_matru_vandana.png", categoryId: "healthcare" },
  { id: "atal_pension", nameEn: "Atal Pension", nameMl: "അടൽ പെൻഷൻ", logo: "/images/popular-schemes/atal_pension.png", categoryId: "pension" },
  { id: "stand_up_india", nameEn: "Stand Up India", nameMl: "സ്റ്റാൻഡ് അപ് ഇന്ത്യ", logo: "/images/popular-schemes/stand_up_india.png", categoryId: "business" },
  { id: "smart_city", nameEn: "Smart City", nameMl: "സ്മാർട്ട് സിറ്റി", logo: "/images/popular-schemes/smart_city.png", categoryId: "housing" },
];

const metricsByPeriod: Record<
  string,
  {
    users: number;
    beneficiaries: number;
    pending: number;
    assisted: number;
    rejected: number;
    schemes: number;
    boothCoverage: string;
    convertedBooths: string;
    slaBreaches: number;
  }
> = {
  today: {
    users: 1420,
    beneficiaries: 450,
    pending: 180,
    assisted: 410,
    rejected: 15,
    schemes: 740,
    boothCoverage: "94.2%",
    convertedBooths: "27,850",
    slaBreaches: 3,
  },
  this_week: {
    users: 12850,
    beneficiaries: 4120,
    pending: 1240,
    assisted: 3980,
    rejected: 115,
    schemes: 740,
    boothCoverage: "94.2%",
    convertedBooths: "28,210",
    slaBreaches: 18,
  },
  this_month: {
    users: 142850,
    beneficiaries: 48250,
    pending: 6160,
    assisted: 8000,
    rejected: 1420,
    schemes: 740,
    boothCoverage: "94.2%",
    convertedBooths: "28,726",
    slaBreaches: 68,
  },
  this_quarter: {
    users: 385400,
    beneficiaries: 135400,
    pending: 32800,
    assisted: 128500,
    rejected: 4300,
    schemes: 740,
    boothCoverage: "94.2%",
    convertedBooths: "29,400",
    slaBreaches: 142,
  },
  custom: {
    users: 210500,
    beneficiaries: 72100,
    pending: 18400,
    assisted: 68900,
    rejected: 2200,
    schemes: 740,
    boothCoverage: "94.2%",
    convertedBooths: "28,726",
    slaBreaches: 85,
  },
};

export function AdminMobilePreviewModal({ isOpen, onClose }: AdminMobilePreviewModalProps) {
  const { lang } = useLang();
  const [userRole, setUserRole] = useState<"state_admin" | "party_worker">("state_admin");
  const [partyWorkerTab, setPartyWorkerTab] = useState<"my_work" | "team">("my_work");
  const [activeTab, setActiveTab] = useState<AdminMobileTab>("overview");

  // Create Application Form State
  const [createFullName, setCreateFullName] = useState<string>("");
  const [createAadhaar, setCreateAadhaar] = useState<string>("");
  const [createCountryCode, setCreateCountryCode] = useState<string>("+91");
  const [createPhone, setCreatePhone] = useState<string>("");
  const [createEmail, setCreateEmail] = useState<string>("");
  const [createDob, setCreateDob] = useState<string>("");
  const [createGender, setCreateGender] = useState<string>("");
  const [createReligion, setCreateReligion] = useState<string>("");
  const [createCaste, setCreateCaste] = useState<string>("");
  const [createMaritalStatus, setCreateMaritalStatus] = useState<string>("");
  const [createOccupation, setCreateOccupation] = useState<string>("");
  const [createIncomeRange, setCreateIncomeRange] = useState<string>("");

  // Address Section
  const [createDistrict, setCreateDistrict] = useState<string>("");
  const [createLocalBodyType, setCreateLocalBodyType] = useState<LocalBodyType | "">("");
  const [createLocalBody, setCreateLocalBody] = useState<string>("");
  const [createWard, setCreateWard] = useState<string>("");
  const [createMandalam, setCreateMandalam] = useState<string>("");
  const [createHouseName, setCreateHouseName] = useState<string>("");
  const [createStreetLocality, setCreateStreetLocality] = useState<string>("");
  const [createPin, setCreatePin] = useState<string>("");
  const createState = "Kerala";

  // Address Modal Bottom Sheets & Helpers
  const [activeAddressSheet, setActiveAddressSheet] = useState<"district" | "localBody" | "ward" | "mandalam" | null>(null);
  const [addressSheetSearch, setAddressSheetSearch] = useState<string>("");
  const [isMandalamAutoFilled, setIsMandalamAutoFilled] = useState<boolean>(false);

  // Address Cascading Handlers
  const handleDistrictSelect = (districtEn: string) => {
    setCreateDistrict(districtEn);
    setCreateLocalBody("");
    setCreateWard("");
    setCreateMandalam("");
    setIsMandalamAutoFilled(false);
    setActiveAddressSheet(null);
    setAddressSheetSearch("");
  };

  const renderPartyMemberDashboard = () => {
    return (
      <div className="space-y-3.5 animate-in fade-in duration-200">
        {/* Top Header Row: Good Morning Greeting + Animated Lotus Left & Segmented Switch (My Work | Team) Right */}
        <div className="flex items-center justify-between gap-2 pt-0.5 pb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="font-display font-black text-base sm:text-[17px] text-[#0A101D] dark:text-white leading-tight tracking-tight flex items-center gap-1.5 truncate">
              <span>{lang === "ml" ? "നമസ്കാരം, അനിൽ" : "Good Morning, Anil"}</span>
              <img
                src={officialLotus}
                alt="Lotus"
                className="h-5 w-5 sm:h-5.5 sm:w-5.5 object-contain inline-block animate-pulse drop-shadow-2xs shrink-0"
              />
            </h2>
          </div>

          {/* Top Segmented Switch: My Work | Team */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-[16px] border border-slate-200/90 dark:border-slate-800 shadow-2xs shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setPartyWorkerTab("my_work")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-[12.5px] transition-all cursor-pointer ${
                partyWorkerTab === "my_work"
                  ? "bg-[#FFF0E6] dark:bg-orange-950/60 text-[#ea580c] dark:text-orange-300 font-extrabold shadow-2xs"
                  : "text-[#475569] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
              }`}
            >
              <FileText className={`h-3.5 w-3.5 ${partyWorkerTab === "my_work" ? "text-[#ea580c] dark:text-orange-300" : "text-slate-400"}`} />
              <span>{lang === "ml" ? "എന്റെ ജോലി" : "My Work"}</span>
            </button>
            <button
              type="button"
              onClick={() => setPartyWorkerTab("team")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-[12.5px] transition-all cursor-pointer ${
                partyWorkerTab === "team"
                  ? "bg-[#FFF0E6] dark:bg-orange-950/60 text-[#ea580c] dark:text-orange-300 font-extrabold shadow-2xs"
                  : "text-[#475569] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
              }`}
            >
              <Users className={`h-3.5 w-3.5 ${partyWorkerTab === "team" ? "text-[#ea580c] dark:text-orange-300" : "text-slate-400"}`} />
              <span>{lang === "ml" ? "ടീം" : "Team"}</span>
            </button>
          </div>
        </div>

        {partyWorkerTab === "my_work" ? (
          <div className="space-y-3">
            {/* Header Row: Date Title Left + Action Buttons Right (<, >, Calendar, Filter) - Matching Admin View */}
            <div className="flex items-center justify-between gap-2 pt-0.5 pb-1 my-0">
              {/* Left Side: Bold Date/Period Title */}
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className="font-display text-[11px] sm:text-[13px] font-extrabold text-[#0a0f1d] dark:text-white tracking-tight leading-none text-left hover:text-[#ff5500] transition-colors cursor-pointer whitespace-nowrap truncate min-w-0"
                title="Click to Open Date Picker"
              >
                {getFormattedPeriodDisplay()}
              </button>

              {/* Right Side: Circular Action Buttons (Previous, Next, Calendar, Filter) */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Left Arrow (Previous Period) */}
                <button
                  type="button"
                  onClick={() => handleStepPeriod(-1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                  title="Previous Period"
                >
                  <ChevronLeft className="h-3 w-3 stroke-[2.5]" />
                </button>

                {/* Right Arrow (Next Period) */}
                <button
                  type="button"
                  onClick={() => handleStepPeriod(1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                  title="Next Period"
                >
                  <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                </button>

                {/* Calendar Icon Button */}
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer shadow-2xs"
                  title="Open Date Picker"
                >
                  <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
                </button>

                {/* Filter Button */}
                <button
                  type="button"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer ${
                    showFilterMenu || appliedFilterChips.length > 0
                      ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30"
                      : "border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-orange-500 hover:bg-orange-50"
                  }`}
                  title="Toggle Filters"
                >
                  <Filter className={`h-3 w-3 stroke-[2.2] ${appliedFilterChips.length > 0 || showFilterMenu ? "text-white" : "text-orange-500"}`} />

                  {appliedFilterChips.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white ring-1.5 ring-white dark:ring-slate-900 animate-pulse">
                      {appliedFilterChips.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Applied Filters & Current Scope UI */}
            <MobileAppliedFiltersScope
              currentScopeTitle={filterGeoScope !== "state" ? activeLocationLabel : "All Kerala • State Level"}
              currentScopeSubLabel={filterGeoScope !== "state" ? "Sector 1, Kazhakuttam" : "All 14 Districts & 140 Constituencies"}
              onResetScope={filterGeoScope !== "state" ? () => setFilterGeoScope("state") : undefined}
              appliedFilters={dashboardFilterChips}
              onResetAllFilters={() => {
                setFilterSchemeType("all");
                setFilterSchemeCategory("all");
                setFilterDepartment("all");
                setFilterPerformance("all");
                setFilterGeoScope("state");
              }}
            />

            {/* 2x2 Metric Cards Grid matching Admin view style */}
            <div className="grid grid-cols-2 gap-2">
              {/* Card 1: Open applications */}
              <div
                onClick={() => {
                  setActiveTab("applications");
                  setMobileSubPage("none");
                  setApplicationStatusFilter("pending");
                }}
                className="min-h-[44px] rounded-lg border border-border bg-card p-1.5 px-2 flex flex-col justify-between shadow-2xs hover:border-blue-500/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate leading-tight">
                    {lang === "ml" ? "തുറന്ന അപേക്ഷകൾ" : "Open applications"}
                  </span>
                  <img src={applicationReceived3dIcon} alt="Open applications" className="h-7 w-7 object-contain shrink-0" />
                </div>
                <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">24</p>
              </div>

              {/* Card 2: Documents pending */}
              <div
                onClick={() => {
                  setActiveTab("applications");
                  setMobileSubPage("none");
                  setApplicationStatusFilter("assisted");
                }}
                className="min-h-[44px] rounded-lg border border-border bg-card p-1.5 px-2 flex flex-col justify-between shadow-2xs hover:border-sky-500/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate leading-tight">
                    {lang === "ml" ? "ബാക്കിയുള്ള രേഖകൾ" : "Documents pending"}
                  </span>
                  <img src={inReview3dIcon} alt="Documents pending" className="h-7 w-7 object-contain shrink-0" />
                </div>
                <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">08</p>
              </div>

              {/* Card 3: Ready to submit */}
              <div
                onClick={() => {
                  setActiveTab("applications");
                  setMobileSubPage("none");
                  setApplicationStatusFilter("all");
                }}
                className="min-h-[44px] rounded-lg border border-border bg-card p-1.5 px-2 flex flex-col justify-between shadow-2xs hover:border-emerald-500/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate leading-tight">
                    {lang === "ml" ? "സമർപ്പിക്കാൻ തയ്യാറായവ" : "Ready to submit"}
                  </span>
                  <img src={submitted3dIcon} alt="Ready to submit" className="h-7 w-7 object-contain shrink-0" />
                </div>
                <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">05</p>
              </div>

              {/* Card 4: Follow-ups due */}
              <div
                onClick={() => setMobileSubPage("needs_attention")}
                className="min-h-[44px] rounded-lg border border-border bg-card p-1.5 px-2 flex flex-col justify-between shadow-2xs hover:border-amber-500/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate leading-tight">
                    {lang === "ml" ? "തുടർനടപടികൾ വേണ്ടവ" : "Follow-ups due"}
                  </span>
                  <img src={pending3dIcon} alt="Follow-ups due" className="h-7 w-7 object-contain shrink-0" />
                </div>
                <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">03</p>
              </div>
            </div>

            {/* SECTION: Events & Announcements - Matching Admin View */}
            <div className="space-y-1.5 pt-1">
              {/* Section Header */}
              <div className="flex items-center justify-between px-0.5 pb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                    <Megaphone className="h-3.5 w-3.5 stroke-[2.2]" />
                  </span>
                  <h3 className="font-display text-xs sm:text-[13px] font-black text-[#0a0f1d] dark:text-white tracking-tight truncate">
                    {lang === "ml" ? "പരിപാടികളും അറിയിപ്പുകളും" : "Events & Announcements"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSubPage("events_announcements")}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#ff5500] hover:text-orange-600 transition-colors cursor-pointer shrink-0"
                >
                  <span>{lang === "ml" ? "എല്ലാം" : "View All"}</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3b30] text-white text-[9.5px] font-black shadow-2xs">
                    3
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#ff5500] stroke-[2.5]" />
                </button>
              </div>

              {/* Single Unified Carousel */}
              {(() => {
                const mergedSlides = [
                  {
                    type: "banner_image",
                    bannerImg: "/images/pm_schemes_explore_now.png",
                    title: "Explore PM Schemes",
                    isUnread: true,
                  },
                  {
                    type: "event",
                    dateMonth: "OCT",
                    dateDay: "15",
                    dateYear: "2026",
                    ribbon: "BOOTH CONVENTION",
                    ribbonMl: "ബൂത്ത് സമ്മേളനം",
                    title: "VIKASITA KERALAM SAMMELAN 2026",
                    subtitle: "Statewide Mega Booth Worker Convention in TVM",
                    subtitleMl: "സംസ്ഥാനതല മെഗാ ബൂത്ത് സമ്മേളനം",
                    ctaText: "REGISTER NOW",
                    ctaTextMl: "രജിസ്റ്റർ ചെയ്യുക",
                    rightGradient: "from-[#800f13] via-[#a3161a] to-[#4f080b]",
                    accentBorder: "border-[#800f13]",
                    dateBadgeBg: "bg-white text-[#800f13]",
                    yearTagBg: "bg-red-50 text-[#800f13] border-red-200/80",
                    isUnread: true,
                  },
                  {
                    type: "announcement",
                    ribbon: "MODI'S GUARANTEE",
                    ribbonMl: "മോദിയുടെ ഗ്യാരണ്ടി",
                    ribbonBg: "bg-red-500 text-white font-black",
                    title: "SABKA SAATH · SABKA VIKAS",
                    subtitle: "Sabka Vishwas · Sabka Prayaas (2047 Vision)",
                    subtitleMl: "സബ്കാ സാഥ്, സബ്കാ വികാസ്, സബ്കാ വിശ്വാസ്",
                    cardStyle: "bg-gradient-to-r from-[#800f13] via-[#a3161a] to-[#590a0d] text-white shadow-md border border-red-900/50",
                    titleColor: "text-white font-extrabold",
                    subTitleColor: "text-red-100/95 font-medium",
                    rightGraphicBg: "bg-red-950/70 border-red-400/40",
                    isUnread: true,
                  },
                  {
                    type: "event",
                    dateMonth: "NOV",
                    dateDay: "02",
                    dateYear: "2026",
                    ribbon: "YOUTH RALLY",
                    ribbonMl: "യുവമോർച്ച റാലി",
                    title: "YUVA VIKAS YATRA & CONCLAVE",
                    subtitle: "50,000+ Youth Leaders Gathering in TVM",
                    subtitleMl: "തിരുവനന്തപുരത്ത് 50,000+ യുവ പ്രതിനിധികൾ",
                    ctaText: "JOIN YATRA",
                    ctaTextMl: "പങ്കെടുക്കുക",
                    rightGradient: "from-[#ea580c] via-[#c2410c] to-[#9a3412]",
                    accentBorder: "border-[#ea580c]",
                    dateBadgeBg: "bg-white text-[#c2410c]",
                    yearTagBg: "bg-orange-50 text-[#c2410c] border-orange-200/80",
                    isUnread: true,
                  },
                  {
                    type: "announcement",
                    ribbon: "PM KISAN SAMMAN",
                    ribbonMl: "പി.എം കിസാൻ",
                    ribbonBg: "bg-amber-400 text-amber-950 font-black",
                    title: "DIRECT BENEFIT TRANSFER ₹6,000",
                    subtitle: "Empowering 35 Lakh Farmers Across Kerala",
                    subtitleMl: "കേരളത്തിലെ 35 ലക്ഷം കർഷകർക്ക് നേട്ടങ്ങൾ",
                    cardStyle: "bg-gradient-to-r from-[#15803d] via-emerald-700 to-[#065f46] text-white shadow-md border border-emerald-600/50",
                    titleColor: "text-white font-extrabold",
                    subTitleColor: "text-emerald-100/95 font-medium",
                    rightGraphicBg: "bg-emerald-950/70 border-amber-300/40",
                    isUnread: false,
                  },
                  {
                    type: "event",
                    dateMonth: "NOV",
                    dateDay: "20",
                    dateYear: "2026",
                    ribbon: "BENEFICIARY MEET",
                    ribbonMl: "ഗുണഭോക്തൃ സംഗമം",
                    title: "CENTRAL SCHEMES EXPO",
                    subtitle: "Interactive Session with Union Ministers at Kochi",
                    subtitleMl: "കേന്ദ്ര മന്ത്രിമാരുമായുള്ള ഗുണഭോക്തൃ സംവാദം",
                    ctaText: "ATTEND EXPO",
                    ctaTextMl: "സന്ദർശിക്കുക",
                    rightGradient: "from-[#0d9488] via-[#0f766e] to-[#115e59]",
                    accentBorder: "border-[#0d9488]",
                    dateBadgeBg: "bg-white text-[#0f766e]",
                    yearTagBg: "bg-teal-50 text-[#0f766e] border-teal-200/80",
                    isUnread: false,
                  },
                  {
                    type: "announcement",
                    ribbon: "AYUSHMAN BHARAT",
                    ribbonMl: "ആയുഷ്മാൻ ഭാരത്",
                    ribbonBg: "bg-[#ff5500] text-white font-black",
                    title: "FREE HEALTH COVERAGE UP TO ₹5 LAKH",
                    subtitle: "Cashless Medical Treatment for All Families",
                    subtitleMl: "സൗജന്യ സമഗ്ര കുടുംബ ആരോഗ്യ സുരക്ഷാ പദ്ധതി",
                    cardStyle: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/90 dark:border-slate-800",
                    titleColor: "text-slate-900 dark:text-white font-extrabold",
                    subTitleColor: "text-slate-700 dark:text-slate-200 font-medium",
                    rightGraphicBg: "bg-orange-50 dark:bg-slate-800 border-orange-200 dark:border-slate-700",
                    isUnread: false,
                  },
                  {
                    type: "event",
                    dateMonth: "DEC",
                    dateDay: "10",
                    dateYear: "2026",
                    ribbon: "MAHILA SAMMELAN",
                    ribbonMl: "മഹിളാ സമ്മേളനം",
                    title: "NARI SHAKTI VIKAS CONCLAVE",
                    subtitle: "Empowering Women Entrepreneurs in Kozhikode",
                    subtitleMl: "വനിതാ സംരംഭകത്വ സംസ്ഥാന സമ്മേളനം",
                    ctaText: "GET PASS",
                    ctaTextMl: "പാസ് നേടുക",
                    rightGradient: "from-[#15803d] via-[#166534] to-[#14532d]",
                    accentBorder: "border-[#15803d]",
                    dateBadgeBg: "bg-white text-[#166534]",
                    yearTagBg: "bg-emerald-50 text-[#166534] border-emerald-200/80",
                    isUnread: false,
                  },
                ];

                const slide = mergedSlides[announcementIndex % mergedSlides.length];

                if (slide.type === "banner_image") {
                  return (
                    <div
                      onClick={() => setMobileSubPage("events_announcements")}
                      className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-[80px] w-full cursor-pointer group transition-all duration-500"
                    >
                      <img
                        src={slide.bannerImg}
                        alt="Explore PM Schemes - Viksit Bharat"
                        className="h-full w-full object-fill group-hover:scale-102 transition-transform duration-300"
                      />
                      {slide.isUnread && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block shadow-xs" />
                        </div>
                      )}
                    </div>
                  );
                }

                if (slide.type === "event") {
                  return (
                    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-[80px] flex items-center justify-between transition-all duration-500">
                      {/* Left Content Area (White background with black pill CTA) */}
                      <div className="flex-1 min-w-0 h-full p-2.5 pl-3 pr-3 flex flex-col justify-between z-10">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h4 className="font-display text-[11.5px] sm:text-[12px] font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate">
                              {slide.title}
                            </h4>
                            {slide.isUnread && (
                              <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block" />
                            )}
                          </div>
                          <p className="text-[9.5px] font-medium text-slate-600 dark:text-slate-300 leading-tight line-clamp-1">
                            {lang === "ml" ? slide.subtitleMl : slide.subtitle}
                          </p>
                        </div>
                        <div className="pt-0.5">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("recent_activity")}
                            className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8px] font-black tracking-wider uppercase shadow-xs transition-transform active:scale-95 cursor-pointer"
                          >
                            {lang === "ml" ? slide.ctaTextMl : slide.ctaText}
                          </button>
                        </div>
                      </div>

                      {/* Right Angular Geometric Section */}
                      <div className="relative h-full w-[38%] shrink-0 flex items-center justify-center overflow-hidden pr-0.5">
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.rightGradient} [clip-path:polygon(20%_0%,100%_0%,100%_100%,0%_100%,15%_50%)]`} />
                        <div className={`absolute inset-0 border-l-2 ${slide.accentBorder} opacity-80 [clip-path:polygon(20%_0%,25%_0%,20%_50%,25%_100%,20%_100%,15%_50%)]`} />

                        <div className={`relative z-10 rounded-lg px-2 py-0.5 flex flex-col items-center justify-center text-center ${slide.dateBadgeBg} min-w-[48px] shadow-md border border-white/60`}>
                          <span className="block text-[8px] font-black uppercase tracking-wider leading-none">{slide.dateMonth}</span>
                          <span className="block text-[15px] font-black leading-tight my-0.5 tracking-tight">{slide.dateDay}</span>
                          <span className={`block text-[7px] font-black tracking-widest leading-none px-1 py-0.5 rounded-xs border ${slide.yearTagBg}`}>
                            {slide.dateYear}
                          </span>
                        </div>

                        <div className="absolute top-1 right-1 z-20 h-5 w-5 rounded-full bg-amber-400 border border-white/80 p-0.5 flex items-center justify-center shadow-xs">
                          <img src={officialLotus} alt="Lotus" className="h-3.5 w-3.5 object-contain" />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className={`relative overflow-hidden rounded-xl ${slide.cardStyle} p-2 px-2.5 h-[80px] flex flex-col justify-between transition-all duration-500`}>
                    {/* Top Right Ribbon */}
                    <div className="absolute top-0 right-0 z-10">
                      <div className={`rounded-bl-md px-2 py-0.5 text-[7px] font-black uppercase tracking-wider shadow-xs ${slide.ribbonBg}`}>
                        {lang === "ml" ? slide.ribbonMl : slide.ribbon}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 flex-1 min-h-0">
                      <div className={`shrink-0 h-9 w-9 rounded-full border ${slide.rightGraphicBg} p-0.5 flex items-center justify-center shadow-xs overflow-hidden`}>
                        <img
                          src={officialLotus}
                          alt="Lotus Emblem"
                          className="h-5.5 w-5.5 object-contain drop-shadow-xs"
                        />
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col justify-center h-full pr-1 text-left space-y-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className={`font-display text-[12px] sm:text-[12.5px] font-extrabold leading-tight tracking-tight truncate ${slide.titleColor}`}>
                            {slide.title}
                          </h4>
                          {slide.isUnread && (
                            <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block" />
                          )}
                        </div>
                        <p className={`text-[9.5px] leading-tight line-clamp-2 ${slide.subTitleColor}`}>
                          {lang === "ml" ? slide.subtitleMl : slide.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* SECTION: Needs attention - Matching Admin View */}
            <div className="space-y-1.5 pt-1">
              {/* Section Header */}
              <div className="flex items-center justify-between px-0.5 pb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                    <AlertCircle className="h-3.5 w-3.5 stroke-[2.2]" />
                  </span>
                  <h3 className="font-display text-xs sm:text-[13px] font-black text-[#0a0f1d] dark:text-white tracking-tight truncate">
                    {lang === "ml" ? "ശ്രദ്ധ ആവശ്യമുണ്ട്" : "Needs attention"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("applications")}
                  className="flex items-center gap-0.5 text-[11px] font-bold text-[#f95700] hover:underline cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><span>{lang === "ml" ? "എല്ലാം" : "View all"}</span><span className="rounded-full bg-orange-500/10 dark:bg-orange-950/40 text-[#f95700] px-1.5 py-0.5 text-[9.5px] font-black leading-none border border-orange-200/80 dark:border-orange-900/50">2</span></span>
                  <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Needs Attention Items */}
              <div className="space-y-2">
                {/* Item 1: Meera Nair */}
                <div
                  onClick={() => setActiveTab("applications")}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 font-extrabold text-xs shrink-0">
                      MN
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-[12px] sm:text-[12.5px] text-slate-900 dark:text-white leading-tight truncate">
                        {lang === "ml" ? "മീര നായർ" : "Meera Nair"}
                      </h4>
                      <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                        {lang === "ml" ? "പി.എം വിശ്വകർമ്മ" : "PM Vishwakarma"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-[#fff4ed] dark:bg-orange-950/50 border border-[#ffebd9] dark:border-orange-900/50 px-2.5 py-1 text-[10px] font-bold text-[#f95700] dark:text-orange-400">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#f95700] text-white text-[8.5px] font-black leading-none">!</span>
                      <span>{lang === "ml" ? "1 രേഖ വിട്ടുപോയി" : "1 document missing"}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Item 2: Ravi Kumar */}
                <div
                  onClick={() => setActiveTab("applications")}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-xs shrink-0">
                      RK
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-[12px] sm:text-[12.5px] text-slate-900 dark:text-white leading-tight truncate">
                        {lang === "ml" ? "രവി കുമാർ" : "Ravi Kumar"}
                      </h4>
                      <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                        {lang === "ml" ? "പി.എം സ്വനിധി" : "PM SVANidhi"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-[#fff4ed] dark:bg-orange-950/50 border border-[#ffebd9] dark:border-orange-900/50 px-2.5 py-1 text-[10px] font-bold text-[#f95700] dark:text-orange-400">
                      <Calendar className="h-3.5 w-3.5 text-[#f95700]" />
                      <span>{lang === "ml" ? "ഇന്ന് തുടർനടപടി" : "Follow-up due today"}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Team Tab Content */
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5 pt-0.5">
              <h2 className="font-display text-sm sm:text-base font-black text-[#0a0f1d] dark:text-white tracking-tight">
                {lang === "ml" ? "ടീം പ്രവർത്തനം" : "Team Performance"}
              </h2>
              <span className="text-xs font-extrabold text-[#ea580c] bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                Booth 42
              </span>
            </div>

            {/* Team Metrics Summary */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Workers</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">18</p>
              </div>
              <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Applications Done</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">142</p>
              </div>
            </div>

            {/* Leaderboard Callout */}
            <div
              onClick={() => setMobileSubPage("leaderboard")}
              className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-3 text-white shadow-md cursor-pointer hover:opacity-95 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="h-6 w-6 text-amber-200 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm">Booth Leaderboard #1</h4>
                  <p className="text-[11px] text-orange-100 font-medium">Kazhakkoottam Mandalam</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white shrink-0" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleLocalBodyTypeSelect = (type: LocalBodyType) => {
    setCreateLocalBodyType(type);
    setCreateLocalBody("");
    setCreateWard("");
    setCreateMandalam("");
    setIsMandalamAutoFilled(false);
  };

    const handleLocalBodySelect = (lbName: string) => {
    setCreateLocalBody(lbName);
    setCreateWard("");
    setCreateMandalam("");
    setIsMandalamAutoFilled(false);
    setActiveAddressSheet(null);
    setAddressSheetSearch("");
  };

    const handleWardSelect = (wardItem: WardItem) => {
    const wardDisplay = `Ward ${wardItem.number} - ${lang === "ml" ? wardItem.nameMl : wardItem.nameEn}`;
    setCreateWard(wardDisplay);

    // Auto-map Assembly Mandalam if single reliable mapping
    const mappedConst = getMappedConstituencyForWard(createLocalBody, wardDisplay);
    if (mappedConst) {
      setCreateMandalam(mappedConst.en);
      setIsMandalamAutoFilled(true);
    } else {
      if (isMandalamAutoFilled) {
        setCreateMandalam("");
      }
      setIsMandalamAutoFilled(false);
    }

    setActiveAddressSheet(null);
    setAddressSheetSearch("");
  };

    const handleMandalamSelect = (mandalamEn: string) => {
    setCreateMandalam(mandalamEn);
    setIsMandalamAutoFilled(false);
    setActiveAddressSheet(null);
    setAddressSheetSearch("");
  };

    const isCreateFormValid = Boolean(
    createFullName.trim() &&
    createAadhaar.trim() &&
    createPhone.trim() &&
    createDob.trim() &&
    createGender.trim() &&
    createReligion.trim() &&
    createCaste.trim() &&
    createMaritalStatus.trim() &&
    createOccupation.trim() &&
    createIncomeRange.trim() &&
    createDistrict.trim() &&
    createLocalBodyType &&
    createLocalBody.trim() &&
    createWard.trim() &&
    createMandalam.trim() &&
    createHouseName.trim() &&
    createStreetLocality.trim() &&
    createPin.trim()
  );

  // Create Application Flow Steps State
  const [createFlowStep, setCreateFlowStep] = useState<"form" | "checking" | "eligibility_result" | "eligible_schemes" | "scheme_details" | "submitted">("form");
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(false);
  const [eligibleSchemesSearchQuery, setEligibleSchemesSearchQuery] = useState<string>("");
  const [isSingleSchemeEligible, setIsSingleSchemeEligible] = useState<boolean>(true);
  const [showEligibilityDetails, setShowEligibilityDetails] = useState<boolean>(true);
  const [selectedEligibleScheme, setSelectedEligibleScheme] = useState<{
    id: string;
    titleEn: string;
    titleMl: string;
    benefitEn: string;
    benefitMl: string;
    matchLabelEn: string;
    matchLabelMl: string;
    deptEn: string;
    deptMl: string;
    categoryEn: string;
    categoryMl: string;
    requiredDocEn: string;
    requiredDocMl: string;
  } | null>(null);
  const [uploadedDocName, setUploadedDocName] = useState<string>("");
  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankIfscCode, setBankIfscCode] = useState<string>("");
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);

  const mockEligibleSchemesList = [
    {
      id: "SCH-001",
      titleEn: "PM Kisan Samman Nidhi",
      titleMl: "പി.എം. കിസാൻ സമ്മാൻ നിധി",
      benefitEn: "₹6,000 / year direct benefit transfer in 3 installments for eligible farmers.",
      benefitMl: "കർഷകർക്ക് പ്രതിവർഷം ₹6,000 ധനസഹായം (3 ഗഡുക്കളായി നേരിട്ട് ബാങ്ക് അക്കൗണ്ടിലേക്ക്).",
      matchLabelEn: "100% Match",
      matchLabelMl: "100% യോഗ്യത",
      deptEn: "Agriculture Department",
      deptMl: "കൃഷി വകുപ്പ്",
      categoryEn: "Central Government",
      categoryMl: "കേന്ദ്ര സർക്കാർ",
      requiredDocEn: "Land Record / Revenue Tax Receipt Copy",
      requiredDocMl: "കരം അടച്ച രസീത് / ഭൂമി ഉടമസ്ഥാവകാശ രേഖ",
    },
    {
      id: "SCH-002",
      titleEn: "Karunya Arogya Suraksha Padhathi (KASP)",
      titleMl: "കാരുണ്യ ആരോഗ്യ സുരക്ഷാ പദ്ധതി (KASP)",
      benefitEn: "Up to ₹5,00,000 per family per year for secondary and tertiary hospitalization.",
      benefitMl: "കുടുംബത്തിന് പ്രതിവർഷം ₹5,00,000 വരെയുള്ള സൗജന്യ ആശുപത്രി ചികിത്സാ പരിരക്ഷ.",
      matchLabelEn: "96% Match",
      matchLabelMl: "96% യോഗ്യത",
      deptEn: "Health & Family Welfare",
      deptMl: "ആരോഗ്യ കുടുംബക്ഷേമ വകുപ്പ്",
      categoryEn: "State Government",
      categoryMl: "സംസ്ഥാന സർക്കാർ",
      requiredDocEn: "Ration Card Copy (AAY / PHH / Non-Priority)",
      requiredDocMl: "റേഷൻ കാർഡിന്റെ പകർപ്പ് (AAY / PHH)",
    },
    {
      id: "SCH-003",
      titleEn: "LIFE Mission Housing Title & Grant",
      titleMl: "ലൈഫ് മിഷൻ ഭവന നിർമ്മാണ പദ്ധതി",
      benefitEn: "₹4,00,000 financial assistance for constructing a house for homeless families.",
      benefitMl: "ഭവനരഹിതരായ കുടുംബങ്ങൾക്ക് വീട് നിർമ്മിക്കുന്നതിന് ₹4,00,000 സാമ്പത്തിക സഹായം.",
      matchLabelEn: "92% Match",
      matchLabelMl: "92% യോഗ്യത",
      deptEn: "Local Self Government",
      deptMl: "തദ്ദേശ സ്വയംഭരണ വകുപ്പ്",
      categoryEn: "State Government",
      categoryMl: "സംസ്ഥാന സർക്കാർ",
      requiredDocEn: "Land Ownership Title / Possessory Certificate",
      requiredDocMl: "ഭൂമി ഉടമസ്ഥാവകാശ സാക്ഷ്യപത്രം",
    },
    {
      id: "SCH-004",
      titleEn: "Vayoshreshtha Welfare & Pension Scheme",
      titleMl: "വയോശ്രേഷ്ഠ മുതിർന്ന പൗര പെൻഷൻ",
      benefitEn: "₹1,600 monthly social security pension and healthcare support.",
      benefitMl: "പ്രതിമാസം ₹1,600 സാമൂഹിക സുരക്ഷാ പെൻഷനും ആരോഗ്യ പരിരക്ഷയും.",
      matchLabelEn: "88% Match",
      matchLabelMl: "88% യോഗ്യത",
      deptEn: "Social Justice Department",
      deptMl: "സാമൂഹിക നീതി വകുപ്പ്",
      categoryEn: "State Government",
      categoryMl: "സംസ്ഥാന സർക്കാർ",
      requiredDocEn: "Aadhaar / Age Proof & Bank Passbook Copy",
      requiredDocMl: "വയസ് തെളിയിക്കുന്ന രേഖ & ബാങ്ക് പാസ്ബുക്ക് പകർപ്പ്",
    },
  ];

  const handleStartEligibilityCheck = () => {
    if (!isCreateFormValid || isCheckingEligibility) return;
    setCreateFlowStep("checking");
    setIsCheckingEligibility(true);

    setTimeout(() => {
      setIsCheckingEligibility(false);
      if (selectedSchemeName) {
        const matchedScheme = mockEligibleSchemesList.find(
          (s) => s.titleEn.toLowerCase().includes(selectedSchemeName.toLowerCase()) || selectedSchemeName.toLowerCase().includes(s.titleEn.toLowerCase())
        ) || {
          id: "SCH-SPECIFIC",
          titleEn: selectedSchemeName,
          titleMl: selectedSchemeName,
          benefitEn: "Official government scheme financial assistance and welfare benefits.",
          benefitMl: "സർക്കാർ പദ്ധതി സാമ്പത്തിക ആനുകൂല്യങ്ങളും ക്ഷേമ സഹായങ്ങളും.",
          matchLabelEn: "100% Match",
          matchLabelMl: "100% യോഗ്യത",
          deptEn: "Kerala State Department",
          deptMl: "കേരള സംസ്ഥാന വകുപ്പ്",
          categoryEn: "Government Scheme",
          categoryMl: "സർക്കാർ പദ്ധതി",
          requiredDocEn: "Aadhaar Card / Income Certificate Copy",
          requiredDocMl: "ആധാർ കാർഡ് / വരുമാന സർട്ടിഫിക്കറ്റ് പകർപ്പ്",
        };

          setSelectedEligibleScheme(matchedScheme);
        setIsSingleSchemeEligible(true);
        setCreateFlowStep("eligibility_result");
      } else {
        setCreateFlowStep("eligible_schemes");
      }
    }, 2200);
  };

    const [mobileSubPage, setMobileSubPage] = useState<"none" | "leaderboard" | "needs_attention" | "recent_activity" | "beneficiaries" | "notifications" | "applications" | "events_announcements" | "app_detail" | "category_schemes">("none");
  const [selectedSchemeCategoryDetail, setSelectedSchemeCategoryDetail] = useState<{
    id: string;
    titleEn: string;
    titleMl: string;
    categoryLabelEn: string;
    categoryLabelMl: string;
    count: number;
  } | null>(null);
  const [eventsSubTab, setEventsSubTab] = useState<"events" | "announcements">("events");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<"all" | "pending" | "assisted" | "rejected">("all");
  const [appSchemeCategoryFilter, setAppSchemeCategoryFilter] = useState<string>("all");
  const [appAssistanceStatusFilter, setAppAssistanceStatusFilter] = useState<string>("all");
  const [appDateFilter, setAppDateFilter] = useState<string>("all");
  const [appCustomStartDate, setAppCustomStartDate] = useState<string>("");
  const [appCustomEndDate, setAppCustomEndDate] = useState<string>("");
  const matchAppSearch = (
    status: "pending" | "assisted" | "rejected",
    nameEn: string,
    nameMl: string,
    applicantEn: string,
    applicantMl: string,
    typeEn: string,
    typeMl: string,
    ref: string
  ) => {
    const matchesStatus = applicationStatusFilter === "all" || applicationStatusFilter === status;
    if (!matchesStatus) return false;
    if (!applicationSearchQuery.trim()) return true;
    const q = applicationSearchQuery.toLowerCase();
    return (
      nameEn.toLowerCase().includes(q) ||
      nameMl.toLowerCase().includes(q) ||
      applicantEn.toLowerCase().includes(q) ||
      applicantMl.toLowerCase().includes(q) ||
      typeEn.toLowerCase().includes(q) ||
      typeMl.toLowerCase().includes(q) ||
      ref.toLowerCase().includes(q)
    );
  };

    const [applicationSearchQuery, setApplicationSearchQuery] = useState<string>("");
  const [beneficiarySearchQuery, setBeneficiarySearchQuery] = useState<string>("");
  const [beneficiaryCategoryFilter, setBeneficiaryCategoryFilter] = useState<string>("ALL");
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date>(new Date(2026, 9, 12)); // 12/10/2026
  const [selectedPeriod, setSelectedPeriod] = useState<string>("this_month");
  const [periodCustomLabel, setPeriodCustomLabel] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [deviceModel, setDeviceModel] = useState<"iphone" | "android">("iphone");
  const [activeNotificationFilter, setActiveNotificationFilter] = useState<"all" | "unread" | "applications" | "schemes" | "support">("all");
  const [schemeSourceFilter, setSchemeSourceFilter] = useState<"all" | "central" | "state">("all");
  const [selectedSchemeName, setSelectedSchemeName] = useState<string>("");
  const [schemeSearchQuery, setSchemeSearchQuery] = useState<string>("");
  const [selectedApplicationRecord, setSelectedApplicationRecord] = useState<{
    ref: string;
    schemeNameEn: string;
    schemeNameMl: string;
    categoryEn: string;
    categoryMl: string;
    status: "pending" | "in_review" | "approved" | "rejected" | "disbursed";
    applicantNameEn: string;
    applicantNameMl: string;
    aadhaar: string;
    phone: string;
    locationEn: string;
    locationMl: string;
    annualIncome: string;
    appliedDate: string;
    currentStep: number;
    pendingDocs: string[];
    nextActionEn: string;
    nextActionMl: string;
    auditLog: Array<{ titleEn: string; titleMl: string; date: string; status: "completed" | "current" | "upcoming" }>;
  } | null>(null);

  // Scheme specific filter drawer states
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState<string>("all");
  const [schemeBeneficiaryGroupFilter, setSchemeBeneficiaryGroupFilter] = useState<string>("all");
  const [schemeEligibilityFilter, setSchemeEligibilityFilter] = useState<string>("all");
  const [schemeAppStatusFilter, setSchemeAppStatusFilter] = useState<string>("all");
  const [schemeDeptFilter, setSchemeDeptFilter] = useState<string>("all");
  const [schemeTypeFilter, setSchemeTypeFilter] = useState<string>("all");

  const formatDateWithDay = (date: Date) => {
    const validDate = date && !isNaN(date.getTime()) ? date : new Date(2026, 9, 12);
    const day = String(validDate.getDate()).padStart(2, "0");
    const month = String(validDate.getMonth() + 1).padStart(2, "0");
    const year = validDate.getFullYear();
    const dayOfWeek = validDate.getDay();

    const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysMl = ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"];

    const dayName = lang === "ml" ? daysMl[dayOfWeek] : daysEn[dayOfWeek];
    return `${dayName}, ${day}/${month}/${year}`;
  };

    
  const getAreasForMandalam = (mandalamVal: string, language: "ml" | "en") => {
    if (!mandalamVal || mandalamVal === "all") {
      return [
        { id: "sector_1", ml: "പപ്പനംകോട്", en: "Pappanamcode" },
        { id: "sector_2", ml: "കവടിയാർ", en: "Kowdiar" },
        { id: "sector_3", ml: "ഉള്ളൂർ", en: "Ulloor" },
        { id: "sector_4", ml: "ശ്രീകാര്യം", en: "Sreekaryam" },
      ];
    }

    const c = constituencies.find(
      (item) => item.id === mandalamVal || item.en.toLowerCase() === mandalamVal.toLowerCase()
    );

    if (c) {
      const nameEn = c.en;
      const nameMl = c.ml;

      if (mandalamVal === "kazhakuttam" || c.id === "tvm-c6") {
        return [
          { id: "kzh-1", ml: "പപ്പനംകോട്", en: "Pappanamcode" },
          { id: "kzh-2", ml: "കവടിയാർ", en: "Kowdiar" },
          { id: "kzh-3", ml: "ഉള്ളൂർ", en: "Ulloor" },
          { id: "kzh-4", ml: "ശ്രീകാര്യം", en: "Sreekaryam" },
        ];
      }

      if (c.id === "tvm-c7") {
        return [
          { id: "vatt-1", ml: "പട്ടം", en: "Pattom" },
          { id: "vatt-2", ml: "ശാസ്തമംഗലം", en: "Sasthamangalam" },
          { id: "vatt-3", ml: "പേരൂർക്കട", en: "Peroorkada" },
          { id: "vatt-4", ml: "കുടപ്പനക്കുന്ന്", en: "Kudappanakunnu" },
        ];
      }

      if (c.id === "tvm-c9") {
        return [
          { id: "nem-1", ml: "നേമം നോർത്ത്", en: "Nemom North" },
          { id: "nem-2", ml: "തിരുവല്ലം", en: "Thiruvallam" },
          { id: "nem-3", ml: "പ്രവാചംബലം", en: "Pravachambalam" },
          { id: "nem-4", ml: "കരമന", en: "Karamana" },
        ];
      }

      if (c.id === "kkd-c6" || mandalamVal === "balussery" || c.en.toLowerCase() === "balussery") {
        return [
          { id: "bal-1", ml: "ബാലുശ്ശേരി ടൗൺ", en: "Balussery Town" },
          { id: "bal-2", ml: "ഉണ്ണികുളം", en: "Unnikulam" },
          { id: "bal-3", ml: "ഉള്ള്യേരി", en: "Ullyeri" },
          { id: "bal-4", ml: "പനങ്ങാട്", en: "Panangad" },
          { id: "bal-5", ml: "കൂരാച്ചുണ്ട്", en: "Koorachundu" },
          { id: "bal-6", ml: "കോട്ടൂർ", en: "Kottur" },
          { id: "bal-7", ml: "അത്തോളി", en: "Atholi" },
          { id: "bal-8", ml: "കയാന", en: "Kayanna" },
        ];
      }

      return [
        { id: `${c.id}-sec1`, ml: `${nameMl} നോർത്ത്`, en: `${nameEn} North` },
        { id: `${c.id}-sec2`, ml: `${nameMl} സൗത്ത്`, en: `${nameEn} South` },
        { id: `${c.id}-sec3`, ml: `${nameMl} ഈസ്റ്റ്`, en: `${nameEn} East` },
        { id: `${c.id}-sec4`, ml: `${nameMl} വെസ്റ്റ്`, en: `${nameEn} West` },
        { id: `${c.id}-sec5`, ml: `${nameMl} സെൻട്രൽ`, en: `${nameEn} Central` },
      ];
    }

    return [
      { id: "sec_1", ml: "സെക്ടർ 1", en: "Sector 1" },
      { id: "sec_2", ml: "സെക്ടർ 2", en: "Sector 2" },
      { id: "sec_3", ml: "സെക്ടർ 3", en: "Sector 3" },
      { id: "sec_4", ml: "സെക്ടർ 4", en: "Sector 4" },
    ];
  };

    const getFormattedPeriodDisplay = () => {
    if (selectedPeriod === "this_month" && !periodCustomLabel) {
      return lang === "ml" ? "ഒക്ടോബർ 2026" : "October 2026";
    }
    if (selectedPeriod === "last_month" && !periodCustomLabel) {
      return lang === "ml" ? "സെപ്റ്റംബർ 2026" : "September 2026";
    }
    if (selectedPeriod === "this_year" && !periodCustomLabel) {
      return lang === "ml" ? "2026 വർഷം" : "Year 2026";
    }
    if (periodCustomLabel) {
      return periodCustomLabel;
    }
    return formatDateWithDay(currentSelectedDate);
  };

    const renderAppDetailSubpage = () => {
    const record = selectedApplicationRecord || {
      ref: "APP-2026-8910",
      schemeNameEn: "Pratibha Merit Scholarship",
      schemeNameMl: "പ്രതിഭാ മെരിറ്റ് സ്കോളർഷിപ്പ്",
      categoryEn: "Scholarship",
      categoryMl: "സ്കോളർഷിപ്പ്",
      status: "pending" as const,
      applicantNameEn: "Ananya Ramesh",
      applicantNameMl: "അനന്യ രമേശ്",
      aadhaar: "XXXX-XXXX-8910",
      phone: "+91 94950 33445",
      locationEn: "Kazhakkoottam, TVM",
      locationMl: "കഴക്കൂട്ടം, തിരുവനന്തപുരം",
      annualIncome: "₹1,20,000",
      appliedDate: "05 Oct 2026",
      currentStep: 3,
      pendingDocs: ["Identity proof.pdf", "Mark sheet.pdf"],
      nextActionEn: "Awaiting document verification",
      nextActionMl: "രേഖാ പരിശോധന ബാക്കി നിൽക്കുന്നു",
      auditLog: [
        { titleEn: "Application Submitted", titleMl: "അപേക്ഷ സമർപ്പിച്ചു", date: "05 Oct 2026", status: "completed" as const },
        { titleEn: "Received at Office", titleMl: "ഓഫീസിൽ ലഭിച്ചു", date: "05 Oct 2026", status: "completed" as const },
        { titleEn: "Under Review", titleMl: "പരിശോധനയിൽ", date: "06 Oct 2026", status: "current" as const },
      ],
    };

      return (
      <div className="space-y-3.5 pt-0.5 animate-in fade-in duration-200 text-slate-900 dark:text-slate-100">
        {/* Header Bar: Back Arrow, Title, Download Icon */}
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => setMobileSubPage("none")}
            className="inline-flex items-center gap-2 text-sm font-extrabold text-foreground hover:text-orange-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 text-slate-800 dark:text-slate-200 stroke-[2.5]" />
            <span className="text-base font-extrabold">{lang === "ml" ? "അപേക്ഷാ വിവരങ്ങൾ" : "Application Details"}</span>
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title={lang === "ml" ? "ഡൗൺലോഡ്" : "Download PDF"}
          >
            <Download className="h-4.5 w-4.5 stroke-[2]" />
          </button>
        </div>

        {/* Top Scheme & Application Header Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/60 uppercase tracking-wider">
              {lang === "ml" ? record.categoryMl : record.categoryEn}
            </span>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 inline-flex items-center gap-1.5">
              <Hourglass className="h-3 w-3 text-amber-700 dark:text-amber-400" />
              <span>{record.status === "approved" || record.status === "disbursed" ? (lang === "ml" ? "അംഗീകരിച്ചു" : "Approved") : record.status === "rejected" ? (lang === "ml" ? "നിരസിച്ചു" : "Rejected") : (lang === "ml" ? "പെൻഡിംഗ്" : "Pending")}</span>
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
              {lang === "ml" ? record.schemeNameMl : record.schemeNameEn}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[11.5px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{record.ref}</span>
              <span>•</span>
              <span>{lang === "ml" ? `സമർപ്പിച്ചത് ${record.appliedDate}` : `Submitted ${record.appliedDate}`}</span>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
            <Hourglass className="h-4 w-4 stroke-[2.2]" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <h4 className="font-extrabold text-xs text-amber-900 dark:text-amber-200">
              {lang === "ml" ? record.nextActionMl || "രേഖാ പരിശോധന ബാക്കി നിൽക്കുന്നു" : record.nextActionEn || "Awaiting document verification"}
            </h4>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-snug font-medium">
              {lang === "ml" ? "നിങ്ങളുടെ അപേക്ഷ വിജയകരമായി ലഭിച്ചിട്ടുണ്ട്." : "Your application status is being processed."}
            </p>
          </div>
        </div>

        {/* Progress Tracker Stepper Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="relative flex items-center justify-between px-2">
            {/* Stepper Connecting Line */}
            <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0">
              <div className="h-full bg-emerald-500 w-[66%]" />
            </div>

            {/* Step 1: Submitted */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-1">
              <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Check className="h-4 w-4 stroke-[3]" />
              </div>
              <div className="space-y-0">
                <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {lang === "ml" ? "സമർപ്പിച്ചു" : "Submitted"}
                </span>
                <span className="block text-[9.5px] font-medium text-slate-500 dark:text-slate-400">
                  {record.appliedDate}
                </span>
              </div>
            </div>

            {/* Step 2: Received */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-1">
              <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Check className="h-4 w-4 stroke-[3]" />
              </div>
              <div className="space-y-0">
                <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {lang === "ml" ? "ലഭിച്ചു" : "Received"}
                </span>
                <span className="block text-[9.5px] font-medium text-slate-500 dark:text-slate-400">
                  {record.appliedDate}
                </span>
              </div>
            </div>

            {/* Step 3: In Review */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-1">
              <div className="h-7 w-7 rounded-full bg-orange-500 text-white ring-4 ring-orange-100 dark:ring-orange-950/60 flex items-center justify-center shadow-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
              <div className="space-y-0">
                <span className="block text-[11px] font-extrabold text-orange-600 dark:text-orange-400">
                  {lang === "ml" ? "പരിശോധനയിൽ" : "In Review"}
                </span>
              </div>
            </div>

            {/* Step 4: Decision */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-1">
              <div className="h-7 w-7 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
              <div className="space-y-0">
                <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {lang === "ml" ? "തീരുമാനം" : "Decision"}
                </span>
              </div>
            </div>
          </div>

          {/* Next Step Badge */}
          <div className="pt-1 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 text-[10.5px] font-extrabold text-orange-600 dark:text-orange-400">
              <span>{lang === "ml" ? "അടുത്തത്: പരിശോധനയിൽ" : "Next: In Review"}</span>
            </span>
          </div>
        </div>

        {/* Applicant Details Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5">
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-orange-500" />
            <span>{lang === "ml" ? "അപേക്ഷകന്റെ വിവരങ്ങൾ" : "Applicant Details"}</span>
          </h4>

          <div className="space-y-2 pt-1 text-[11.5px]">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{lang === "ml" ? "പേര്" : "Name"}</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{lang === "ml" ? record.applicantNameMl : record.applicantNameEn}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{lang === "ml" ? "ആധാർ നമ്പർ" : "Aadhaar Number"}</span>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">{record.aadhaar}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{lang === "ml" ? "ഫോൺ നമ്പർ" : "Phone Number"}</span>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">{record.phone}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{lang === "ml" ? "സ്ഥലം / ജില്ല" : "Location / District"}</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{lang === "ml" ? record.locationMl : record.locationEn}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{lang === "ml" ? "വാർഷിക വരുമാനം" : "Annual Income"}</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{record.annualIncome}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="font-medium text-slate-500 dark:text-slate-400">{lang === "ml" ? "സംസ്ഥാനം" : "State"}</span>
              <span className="font-extrabold text-slate-900 dark:text-white">Kerala</span>
            </div>
          </div>
        </div>

        {/* Application Information Accordion Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
              {lang === "ml" ? "അപേക്ഷാ ഫോം വിവരങ്ങൾ" : "Application Information"}
            </h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
              {lang === "ml" ? "സമർപ്പിച്ച ഫോം ഉത്തരങ്ങൾ കാണുക" : "View submitted form answers"}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>

        {/* Documents Section */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-orange-500" />
              <span>{lang === "ml" ? "രേഖകൾ" : "Documents"}</span>
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {record.pendingDocs ? record.pendingDocs.length : 2} files
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {(record.pendingDocs && record.pendingDocs.length > 0 ? record.pendingDocs : ["Identity proof.pdf", "Mark sheet.pdf"]).map((doc, docIdx) => (
              <div key={docIdx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-[11.5px] text-slate-900 dark:text-white truncate">
                    {doc}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                    <span>Uploaded</span>
                  </span>
                  <button type="button" className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Section */}
        <div className="pt-2 space-y-3 pb-2 text-center">
          <button
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
          >
            <span>{lang === "ml" ? "അപേക്ഷ ട്രാക്ക് ചെയ്യുക >" : "Track Application >"}</span>
          </button>

          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {lang === "ml" ? "സഹായം വേണോ? " : "Need help? "}
            <button type="button" className="font-extrabold text-[#ff5500] hover:underline cursor-pointer">
              {lang === "ml" ? "സപ്പോർട്ടുമായി ബന്ധപ്പെടുക" : "Contact support"}
            </button>
          </p>
        </div>
      </div>
    );
  };

    const handleStepPeriod = (daysOffset: number) => {
    const baseDate = currentSelectedDate && !isNaN(currentSelectedDate.getTime()) ? currentSelectedDate : new Date(2026, 9, 12);
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + daysOffset);
    setCurrentSelectedDate(newDate);
    setPeriodCustomLabel(formatDateWithDay(newDate));
  };

    const [activeDistrictFilter, setActiveDistrictFilter] = useState<string>("all");
  const [filterGeoScope, setFilterGeoScope] = useState<string>("state");
  // Mode selection: 'assembly' | 'local_body'
  const [geoMode, setGeoMode] = useState<'assembly' | 'local_body'>('assembly');
  const [appliedGeoMode, setAppliedGeoMode] = useState<'assembly' | 'local_body'>('assembly');

  // Assembly/Booth Draft State
  const [draftDistrict, setDraftDistrict] = useState<string>('all');
  const [draftMandalam, setDraftMandalam] = useState<string>('all');
  const [draftBooth, setDraftBooth] = useState<string>('all');

  // Assembly/Booth Applied State
  const [appliedDistrict, setAppliedDistrict] = useState<string>('all');
  const [appliedMandalam, setAppliedMandalam] = useState<string>('all');
  const [appliedBooth, setAppliedBooth] = useState<string>('all');

  // Local Bodies Draft State
  const [draftLBType, setDraftLBType] = useState<string>('all');
  const [draftLBDistrict, setDraftLBDistrict] = useState<string>('all');
  const [draftLocalBody, setDraftLocalBody] = useState<string>('all');
  const [draftWard, setDraftWard] = useState<string>('all');

  // Local Bodies Applied State
  const [appliedLBType, setAppliedLBType] = useState<string>('all');
  const [appliedLBDistrict, setAppliedLBDistrict] = useState<string>('all');
  const [appliedLocalBody, setAppliedLocalBody] = useState<string>('all');
  const [appliedWard, setAppliedWard] = useState<string>('all');

  const [selectedDistrict, setSelectedDistrict] = useState<string>("tvm");
  const [selectedMandalam, setSelectedMandalam] = useState<string>("kazhakuttam");
  const [selectedArea, setSelectedArea] = useState<string>("sector_1");
  const [selectedBooth, setSelectedBooth] = useState<string>("booth_101");
  const [filterScheme, setFilterScheme] = useState<string>("all");
  const [filterSchemeCategory, setFilterSchemeCategory] = useState<string>("all");
  const [filterSchemeType, setFilterSchemeType] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterPerformance, setFilterPerformance] = useState<string>("all");
  const [leaderboardCategory, setLeaderboardCategory] = useState<"districts" | "mandalam" | "area" | "booths" | "workers">("districts");
  const [announcementIndex, setAnnouncementIndex] = useState<number>(0);
  const [eventIndex, setEventIndex] = useState<number>(0);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  // Auto-rotate Announcements and Events carousels every 3 seconds (3000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % 4);
      setEventIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic scaling multiplier based on selected Geography Scope for realistic filtered analytics
  const geoScopeMultiplier =
    filterGeoScope === "booth"
      ? 0.0008
      : filterGeoScope === "area"
      ? 0.003
      : filterGeoScope === "mandalam"
      ? 0.012
      : filterGeoScope === "district"
      ? 0.08
      : 1.0;

  const rawMetrics = metricsByPeriod[selectedPeriod] || metricsByPeriod.this_month;

  const currentMetrics = {
    ...rawMetrics,
    users: Math.max(12, Math.round((rawMetrics?.users || 0) * geoScopeMultiplier)),
    pending: Math.max(3, Math.round((rawMetrics?.pending || 0) * geoScopeMultiplier)),
    rejected: Math.max(1, Math.round((rawMetrics?.rejected || 0) * geoScopeMultiplier)),
    beneficiaries: Math.max(5, Math.round((rawMetrics?.beneficiaries || 0) * geoScopeMultiplier)),
    assisted: Math.max(4, Math.round((rawMetrics?.assisted || 0) * geoScopeMultiplier)),
    schemes: rawMetrics?.schemes || 128,
    boothCoverage: rawMetrics?.boothCoverage || "94.2%",
    convertedBooths: rawMetrics?.convertedBooths || "23,550",
    slaBreaches: Math.max(0, Math.round((rawMetrics?.slaBreaches || 0) * geoScopeMultiplier)),
  };

    // Human readable active location label
  const activeLocationLabel = React.useMemo(() => {
    if (filterGeoScope === "booth") {
      const currentAreas = getAreasForMandalam(selectedMandalam, lang);
      const foundArea = currentAreas.find(a => a.id === selectedArea);
      const areaName = foundArea ? foundArea[lang] : "Area";
      const c = constituencies.find(item => item.id === selectedMandalam || item.en.toLowerCase() === selectedMandalam.toLowerCase());
      const mandalamName = c ? c[lang] : "Mandalam";
      const boothNum = selectedBooth.replace("booth_", "Booth #");
      return `${boothNum} (${areaName}, ${mandalamName})`;
    }
    if (filterGeoScope === "area") {
      const currentAreas = getAreasForMandalam(selectedMandalam, lang);
      const foundArea = currentAreas.find(a => a.id === selectedArea);
      const areaName = foundArea ? foundArea[lang] : "Area";
      const c = constituencies.find(item => item.id === selectedMandalam || item.en.toLowerCase() === selectedMandalam.toLowerCase());
      const mandalamName = c ? c[lang] : "Mandalam";
      return `${areaName} (${mandalamName})`;
    }
    if (filterGeoScope === "mandalam") {
      const c = constituencies.find(item => item.id === selectedMandalam || item.en.toLowerCase() === selectedMandalam.toLowerCase());
      const mandalamName = c ? c[lang] : "Mandalam";
      const distObj = districts.find(d => d.id === selectedDistrict);
      const distName = distObj ? distObj[lang] : "District";
      return `${mandalamName} (${distName})`;
    }
    if (filterGeoScope === "district") {
      const distObj = districts.find(d => d.id === selectedDistrict);
      return distObj ? `${distObj[lang]} ${lang === "ml" ? "ജില്ല" : "District"}` : "District Level";
    }
    return lang === "ml" ? "എല്ലാ കേരളവും • സംസ്ഥാന തലം" : "Kerala State (State-Wide)";
  }, [filterGeoScope, selectedDistrict, selectedMandalam, selectedArea, selectedBooth, lang]);
  // Applications = sum of pending, assisted (In Review), rejected, and beneficiaries (Approved)
  const applicationsCount =
    currentMetrics.pending +
    currentMetrics.assisted +
    currentMetrics.rejected +
    currentMetrics.beneficiaries;
  const resolvedCount = currentMetrics.beneficiaries + currentMetrics.assisted;
  const resolutionRateVal = applicationsCount > 0
    ? ((currentMetrics.beneficiaries / applicationsCount) * 100).toFixed(1)
    : "0.0";

  const dashboardFilterChips = React.useMemo(() => {
    const chips: FilterChip[] = [];
    if (filterSchemeType !== "all") {
      chips.push({
        id: "schemeType",
        label: `Scheme Type: ${filterSchemeType === "central" ? "Central" : "State"}`,
        onRemove: () => setFilterSchemeType("all"),
      });
    }
    if (filterSchemeCategory !== "all") {
      const catNames: Record<string, string> = {
        agriculture: "Agriculture",
        health: "Health",
        housing: "Housing",
        education: "Education",
        social_security: "Social Security",
        employment: "Employment",
      };

        chips.push({
        id: "category",
        label: `Category: ${catNames[filterSchemeCategory] || filterSchemeCategory}`,
        onRemove: () => setFilterSchemeCategory("all"),
      });
    }
    if (filterDepartment !== "all") {
      const deptNames: Record<string, string> = {
        agriculture_min: "Agriculture",
        health_min: "Health & Family Welfare",
        housing_min: "Housing",
        social_justice: "Welfare",
        rural_dev: "Rural Dev",
      };

        chips.push({
        id: "dept",
        label: `Department: ${deptNames[filterDepartment] || filterDepartment}`,
        onRemove: () => setFilterDepartment("all"),
      });
    }
    if (filterPerformance !== "all") {
      const perfNames: Record<string, string> = {
        top: "High Performing",
        average: "Average Performing",
        needs_attention: "Needs Attention",
        sla_breached: "SLA Breached",
      };

        chips.push({
        id: "perf",
        label: `Performance: ${perfNames[filterPerformance] || filterPerformance}`,
        onRemove: () => setFilterPerformance("all"),
      });
    }
    return chips;
  }, [filterSchemeType, filterSchemeCategory, filterDepartment, filterPerformance]);

  const appliedFilterChips = dashboardFilterChips;

  const filteredBeneficiariesList = React.useMemo(() => {
    return mockBeneficiariesFullList.filter((b) => {
      const matchesCategory =
        beneficiaryCategoryFilter === "ALL" ||
        b.category.toLowerCase().includes(beneficiaryCategoryFilter.toLowerCase());
      const query = beneficiarySearchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        b.name.toLowerCase().includes(query) ||
        b.nameMl.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query) ||
        b.scheme.toLowerCase().includes(query) ||
        b.location.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [beneficiarySearchQuery, beneficiaryCategoryFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-in fade-in duration-200">
      {/* Modal Shell Container */}
      <div className="relative flex flex-col items-center max-w-full my-auto">
        {/* Top Control Bar for Modal */}
        <div className="flex items-center justify-between w-full max-w-[390px] mb-3 px-2 text-white">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-bold tracking-wide">
              {lang === "ml" ? "മൊബൈൽ ആപ്പ് പ്രിവ്യൂ" : "Mobile App Preview"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Model Switcher */}
            <div className="flex bg-white/10 rounded-lg p-0.5 text-[10px] font-semibold">
              <button
                onClick={() => setDeviceModel("iphone")}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  deviceModel === "iphone" ? "bg-white text-black font-bold" : "text-white/80 hover:text-white"
                }`}
              >
                iOS
              </button>
              <button
                onClick={() => setDeviceModel("android")}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  deviceModel === "android" ? "bg-white text-black font-bold" : "text-white/80 hover:text-white"
                }`}
              >
                Android
              </button>
            </div>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-all"
              aria-label="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Smartphone Device Shell Frame */}
        <div className={`relative w-[360px] sm:w-[390px] h-[700px] sm:h-[760px] bg-card rounded-[44px] border-[10px] ${
          deviceModel === "iphone" ? "border-slate-800 shadow-2xl" : "border-slate-900 rounded-[36px] shadow-2xl"
        } flex flex-col overflow-hidden text-foreground select-none`}>

          {/* Notch / Dynamic Island */}
          {deviceModel === "iphone" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-black rounded-b-xl z-50 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-slate-900 mr-2" />
              <div className="h-1.5 w-1.5 rounded-full bg-blue-900" />
            </div>
          )}

          {/* Phone Status Bar */}
          <div className="flex items-center justify-between px-6 pt-2.5 pb-1 text-[11px] font-bold text-foreground/80 bg-background/90 shrink-0 z-40">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-foreground/70">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Mobile App Standard Header with Logo, Nav Menu, Notifications & Logged User Profile */}
          <AdminMobileAppHeader
            userRole={userRole}
            onSwitchRole={setUserRole}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setMobileSubPage("none");
            }}
            onOpenNotifications={() => {
              setActiveTab("overview");
              setMobileSubPage("notifications");
            }}
          />

          {/* Scrollable Main Content Area based on Selected Bottom Tab */}
          <div className="flex-1 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-3 pt-1.5 pb-16 space-y-2.5 bg-muted/20">
            {activeTab === "overview" && (
              <>
                {mobileSubPage === "none" ? (
                  userRole === "party_worker" ? (
                    renderPartyMemberDashboard()
                  ) : (
                    <div className="space-y-3 animate-in fade-in duration-200">
                    {/* Header Row: Date Title Left + Action Buttons Right (<, >, Calendar, Filter) - Matching Users Tab */}
                    <div className="flex items-center justify-between gap-2 pt-0.5 pb-1 my-0">
                      {/* Left Side: Bold Date/Period Title */}
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(true)}
                        className="font-display text-[11px] sm:text-[13px] font-extrabold text-[#0a0f1d] dark:text-white tracking-tight leading-none text-left hover:text-[#ff5500] transition-colors cursor-pointer whitespace-nowrap truncate min-w-0"
                        title="Click to Open Date Picker"
                      >
                        {getFormattedPeriodDisplay()}
                      </button>

                      {/* Right Side: Circular Action Buttons (Previous, Next, Calendar, Filter) */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Left Arrow (Previous Period) */}
                        <button
                          type="button"
                          onClick={() => handleStepPeriod(-1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                          title="Previous Period"
                        >
                          <ChevronLeft className="h-3 w-3 stroke-[2.5]" />
                        </button>

                        {/* Right Arrow (Next Period) */}
                        <button
                          type="button"
                          onClick={() => handleStepPeriod(1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                          title="Next Period"
                        >
                          <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                        </button>

                        {/* Calendar Icon Button */}
                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(true)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer shadow-2xs"
                          title="Open Date Picker"
                        >
                          <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
                        </button>

                        {/* Filter Button */}
                        <button
                          type="button"
                          onClick={() => setShowFilterMenu(!showFilterMenu)}
                          className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer ${
                            showFilterMenu || appliedFilterChips.length > 0
                              ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30"
                              : "border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-orange-500 hover:bg-orange-50"
                          }`}
                          title="Toggle Filters"
                        >
                          <Filter className={`h-3 w-3 stroke-[2.2] ${appliedFilterChips.length > 0 || showFilterMenu ? "text-white" : "text-orange-500"}`} />

                          {appliedFilterChips.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white ring-1.5 ring-white dark:ring-slate-900 animate-pulse">
                              {appliedFilterChips.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Applied Filters & Current Scope UI */}
                    <MobileAppliedFiltersScope
                      currentScopeTitle={filterGeoScope !== "state" ? activeLocationLabel : "All Kerala • State Level"}
                      currentScopeSubLabel={filterGeoScope !== "state" ? "Sector 1, Kazhakuttam" : "All 14 Districts & 140 Constituencies"}
                      onResetScope={filterGeoScope !== "state" ? () => setFilterGeoScope("state") : undefined}
                      appliedFilters={dashboardFilterChips}
                      onResetAllFilters={() => {
                        setFilterSchemeType("all");
                        setFilterSchemeCategory("all");
                        setFilterDepartment("all");
                        setFilterPerformance("all");
                        setFilterGeoScope("state");
                      }}
                    />

                    {/* Core Analytics KPI Grid (2 cards per row) */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. Application Received */}
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("all");
                        }}
                        className="min-h-[44px] rounded-lg border border-border bg-card p-1.5 px-2 flex flex-col justify-between shadow-2xs hover:border-blue-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate leading-tight">
                            {lang === "ml" ? "ലഭിച്ച അപേക്ഷകൾ" : "Application Received"}
                          </span>
                          <img src={applicationReceived3dIcon} alt="Application Received" className="h-7 w-7 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">{applicationsCount.toLocaleString()}</p>
                      </div>

                      {/* 2. Submitted */}
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("all");
                        }}
                        className="min-h-[44px] rounded-lg border border-border bg-card p-1.5 px-2 flex flex-col justify-between shadow-2xs hover:border-sky-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "സമർപ്പിച്ചവ" : "Submitted"}
                          </span>
                          <img src={submitted3dIcon} alt="Submitted" className="h-7 w-7 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">{(applicationsCount - 150).toLocaleString()}</p>
                      </div>

                      {/* 3. Beneficiaries */}
                      <div
                        onClick={() => setMobileSubPage("beneficiaries")}
                        className="min-h-[44px] rounded-lg border border-border bg-card p-1.5 px-2 flex flex-col justify-between shadow-2xs hover:border-emerald-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                          </span>
                          <img src={assisted3dIcon} alt="Beneficiaries" className="h-7 w-7 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">{currentMetrics.beneficiaries.toLocaleString()}</p>
                      </div>

                      {/* 4. In Review */}
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("assisted");
                        }}
                        className="min-h-[44px] rounded-lg border border-border bg-card p-1.5 px-2 flex flex-col justify-between shadow-2xs hover:border-indigo-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "പരിശോധനയിലുള്ളവ" : "In Review"}
                          </span>
                          <img src={inReview3dIcon} alt="In Review" className="h-7 w-7 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">{currentMetrics.assisted.toLocaleString()}</p>
                      </div>

                      {/* 5. Pending */}
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("pending");
                        }}
                        className="min-h-[44px] rounded-lg border border-border bg-card p-1.5 px-2 flex flex-col justify-between shadow-2xs hover:border-amber-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "പെൻഡിംഗ്" : "Pending"}
                          </span>
                          <img src={pending3dIcon} alt="Pending" className="h-7 w-7 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 leading-none mt-1">{currentMetrics.pending.toLocaleString()}</p>
                      </div>

                      {/* 6. Rejected */}
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("rejected");
                        }}
                        className="min-h-[44px] rounded-lg border border-border bg-card p-1.5 px-2 flex flex-col justify-between shadow-2xs hover:border-rose-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "നിരസിച്ചവ" : "Rejected"}
                          </span>
                          <img src={rejected3dIcon} alt="Rejected" className="h-7 w-7 object-contain shrink-0" />
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 leading-none mt-1">{currentMetrics.rejected.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Single Merged Events and Announcements Section */}
                    <div className="space-y-1.5 pt-0.5">
                      {/* Unified Section Header */}
                      <div className="flex items-center justify-between px-0.5 pb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                            <Megaphone className="h-3.5 w-3.5 stroke-[2.2]" />
                          </span>
                          <h3 className="font-display text-xs sm:text-[13px] font-black text-[#0a0f1d] dark:text-white tracking-tight truncate">
                            {lang === "ml" ? "പരിപാടികളും അറിയിപ്പുകളും" : "Events & Announcements"}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMobileSubPage("events_announcements")}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#ff5500] hover:text-orange-600 transition-colors cursor-pointer shrink-0"
                        >
                          <span>{lang === "ml" ? "എല്ലാം" : "View All"}</span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3b30] text-white text-[9.5px] font-black shadow-2xs">
                            3
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-[#ff5500] stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Single Unified Carousel */}
                      {(() => {
                        const mergedSlides = [
                          {
                            type: "banner_image",
                            bannerImg: "/images/pm_schemes_explore_now.png",
                            title: "Explore PM Schemes",
                            isUnread: true,
                          },
                          {
                            type: "event",
                            dateMonth: "OCT",
                            dateDay: "15",
                            dateYear: "2026",
                            ribbon: "BOOTH CONVENTION",
                            ribbonMl: "ബൂത്ത് സമ്മേളനം",
                            title: "VIKASITA KERALAM SAMMELAN 2026",
                            subtitle: "Statewide Mega Booth Worker Convention in TVM",
                            subtitleMl: "സംസ്ഥാനതല മെഗാ ബൂത്ത് സമ്മേളനം",
                            ctaText: "REGISTER NOW",
                            ctaTextMl: "രജിസ്റ്റർ ചെയ്യുക",
                            rightGradient: "from-[#800f13] via-[#a3161a] to-[#4f080b]",
                            accentBorder: "border-[#800f13]",
                            dateBadgeBg: "bg-white text-[#800f13]",
                            yearTagBg: "bg-red-50 text-[#800f13] border-red-200/80",
                            isUnread: true,
                          },
                          {
                            type: "announcement",
                            ribbon: "MODI'S GUARANTEE",
                            ribbonMl: "മോദിയുടെ ഗ്യാരണ്ടി",
                            ribbonBg: "bg-red-500 text-white font-black",
                            title: "SABKA SAATH · SABKA VIKAS",
                            subtitle: "Sabka Vishwas · Sabka Prayaas (2047 Vision)",
                            subtitleMl: "സബ്കാ സാഥ്, സബ്കാ വികാസ്, സബ്കാ വിശ്വാസ്",
                            cardStyle: "bg-gradient-to-r from-[#800f13] via-[#a3161a] to-[#590a0d] text-white shadow-md border border-red-900/50",
                            titleColor: "text-white font-extrabold",
                            subTitleColor: "text-red-100/95 font-medium",
                            rightGraphicBg: "bg-red-950/70 border-red-400/40",
                            isUnread: true,
                          },
                          {
                            type: "event",
                            dateMonth: "NOV",
                            dateDay: "02",
                            dateYear: "2026",
                            ribbon: "YOUTH RALLY",
                            ribbonMl: "യുവമോർച്ച റാലി",
                            title: "YUVA VIKAS YATRA & CONCLAVE",
                            subtitle: "50,000+ Youth Leaders Gathering in TVM",
                            subtitleMl: "തിരുവനന്തപുരത്ത് 50,000+ യുവ പ്രതിനിധികൾ",
                            ctaText: "JOIN YATRA",
                            ctaTextMl: "പങ്കെടുക്കുക",
                            rightGradient: "from-[#ea580c] via-[#c2410c] to-[#9a3412]",
                            accentBorder: "border-[#ea580c]",
                            dateBadgeBg: "bg-white text-[#c2410c]",
                            yearTagBg: "bg-orange-50 text-[#c2410c] border-orange-200/80",
                            isUnread: true,
                          },
                          {
                            type: "announcement",
                            ribbon: "PM KISAN SAMMAN",
                            ribbonMl: "പി.എം കിസാൻ",
                            ribbonBg: "bg-amber-400 text-amber-950 font-black",
                            title: "DIRECT BENEFIT TRANSFER ₹6,000",
                            subtitle: "Empowering 35 Lakh Farmers Across Kerala",
                            subtitleMl: "കേരളത്തിലെ 35 ലക്ഷം കർഷകർക്ക് നേട്ടങ്ങൾ",
                            cardStyle: "bg-gradient-to-r from-[#15803d] via-emerald-700 to-[#065f46] text-white shadow-md border border-emerald-600/50",
                            titleColor: "text-white font-extrabold",
                            subTitleColor: "text-emerald-100/95 font-medium",
                            rightGraphicBg: "bg-emerald-950/70 border-amber-300/40",
                            isUnread: false,
                          },
                          {
                            type: "event",
                            dateMonth: "NOV",
                            dateDay: "20",
                            dateYear: "2026",
                            ribbon: "BENEFICIARY MEET",
                            ribbonMl: "ഗുണഭോക്തൃ സംഗമം",
                            title: "CENTRAL SCHEMES EXPO",
                            subtitle: "Interactive Session with Union Ministers at Kochi",
                            subtitleMl: "കേന്ദ്ര മന്ത്രിമാരുമായുള്ള ഗുണഭോക്തൃ സംവാദം",
                            ctaText: "ATTEND EXPO",
                            ctaTextMl: "സന്ദർശിക്കുക",
                            rightGradient: "from-[#0d9488] via-[#0f766e] to-[#115e59]",
                            accentBorder: "border-[#0d9488]",
                            dateBadgeBg: "bg-white text-[#0f766e]",
                            yearTagBg: "bg-teal-50 text-[#0f766e] border-teal-200/80",
                            isUnread: false,
                          },
                          {
                            type: "announcement",
                            ribbon: "AYUSHMAN BHARAT",
                            ribbonMl: "ആയുഷ്മാൻ ഭാരത്",
                            ribbonBg: "bg-[#ff5500] text-white font-black",
                            title: "FREE HEALTH COVERAGE UP TO ₹5 LAKH",
                            subtitle: "Cashless Medical Treatment for All Families",
                            subtitleMl: "സൗജന്യ സമഗ്ര കുടുംബ ആരോഗ്യ സുരക്ഷാ പദ്ധതി",
                            cardStyle: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/90 dark:border-slate-800",
                            titleColor: "text-slate-900 dark:text-white font-extrabold",
                            subTitleColor: "text-slate-700 dark:text-slate-200 font-medium",
                            rightGraphicBg: "bg-orange-50 dark:bg-slate-800 border-orange-200 dark:border-slate-700",
                            isUnread: false,
                          },
                          {
                            type: "event",
                            dateMonth: "DEC",
                            dateDay: "10",
                            dateYear: "2026",
                            ribbon: "MAHILA SAMMELAN",
                            ribbonMl: "മഹിളാ സമ്മേളനം",
                            title: "NARI SHAKTI VIKAS CONCLAVE",
                            subtitle: "Empowering Women Entrepreneurs in Kozhikode",
                            subtitleMl: "വനിതാ സംരംഭകത്വ സംസ്ഥാന സമ്മേളനം",
                            ctaText: "GET PASS",
                            ctaTextMl: "പാസ് നേടുക",
                            rightGradient: "from-[#15803d] via-[#166534] to-[#14532d]",
                            accentBorder: "border-[#15803d]",
                            dateBadgeBg: "bg-white text-[#166534]",
                            yearTagBg: "bg-emerald-50 text-[#166534] border-emerald-200/80",
                            isUnread: false,
                          },
                        ];

                        const slide = mergedSlides[announcementIndex % mergedSlides.length];

                        if (slide.type === "banner_image") {
                          return (
                            <div
                              onClick={() => setMobileSubPage("events_announcements")}
                              className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-[80px] w-full cursor-pointer group transition-all duration-500"
                            >
                              <img
                                src={slide.bannerImg}
                                alt="Explore PM Schemes - Viksit Bharat"
                                className="h-full w-full object-fill group-hover:scale-102 transition-transform duration-300"
                              />
                              {slide.isUnread && (
                                <div className="absolute top-2 right-2 z-10">
                                  <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block shadow-xs" />
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (slide.type === "event") {
                          return (
                            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-[80px] flex items-center justify-between transition-all duration-500">
                              {/* Left Content Area (White background with black pill CTA) */}
                              <div className="flex-1 min-w-0 h-full p-2.5 pl-3 pr-3 flex flex-col justify-between z-10">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <h4 className="font-display text-[11.5px] sm:text-[12px] font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate">
                                      {slide.title}
                                    </h4>
                                    {slide.isUnread && (
                                      <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block" />
                                    )}
                                  </div>
                                  <p className="text-[9.5px] font-medium text-slate-600 dark:text-slate-300 leading-tight line-clamp-1">
                                    {lang === "ml" ? slide.subtitleMl : slide.subtitle}
                                  </p>
                                </div>
                                <div className="pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setMobileSubPage("recent_activity")}
                                    className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8px] font-black tracking-wider uppercase shadow-xs transition-transform active:scale-95 cursor-pointer"
                                  >
                                    {lang === "ml" ? slide.ctaTextMl : slide.ctaText}
                                  </button>
                                </div>
                              </div>

                              {/* Right Angular Geometric Section */}
                              <div className="relative h-full w-[38%] shrink-0 flex items-center justify-center overflow-hidden pr-0.5">
                                <div className={`absolute inset-0 bg-gradient-to-br ${slide.rightGradient} [clip-path:polygon(20%_0%,100%_0%,100%_100%,0%_100%,15%_50%)]`} />
                                <div className={`absolute inset-0 border-l-2 ${slide.accentBorder} opacity-80 [clip-path:polygon(20%_0%,25%_0%,20%_50%,25%_100%,20%_100%,15%_50%)]`} />

                                <div className={`relative z-10 rounded-lg px-2 py-0.5 flex flex-col items-center justify-center text-center ${slide.dateBadgeBg} min-w-[48px] shadow-md border border-white/60`}>
                                  <span className="block text-[8px] font-black uppercase tracking-wider leading-none">{slide.dateMonth}</span>
                                  <span className="block text-[15px] font-black leading-tight my-0.5 tracking-tight">{slide.dateDay}</span>
                                  <span className={`block text-[7px] font-black tracking-widest leading-none px-1 py-0.5 rounded-xs border ${slide.yearTagBg}`}>
                                    {slide.dateYear}
                                  </span>
                                </div>

                                <div className="absolute top-1 right-1 z-20 h-5 w-5 rounded-full bg-amber-400 border border-white/80 p-0.5 flex items-center justify-center shadow-xs">
                                  <img src={officialLotus} alt="Lotus" className="h-3.5 w-3.5 object-contain" />
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className={`relative overflow-hidden rounded-xl ${slide.cardStyle} p-2 px-2.5 h-[80px] flex flex-col justify-between transition-all duration-500`}>
                            {/* Top Right Ribbon */}
                            <div className="absolute top-0 right-0 z-10">
                              <div className={`rounded-bl-md px-2 py-0.5 text-[7px] font-black uppercase tracking-wider shadow-xs ${slide.ribbonBg}`}>
                                {lang === "ml" ? slide.ribbonMl : slide.ribbon}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1 flex-1 min-h-0">
                              <div className={`shrink-0 h-9 w-9 rounded-full border ${slide.rightGraphicBg} p-0.5 flex items-center justify-center shadow-xs overflow-hidden`}>
                                <img
                                  src={officialLotus}
                                  alt="Lotus Emblem"
                                  className="h-5.5 w-5.5 object-contain drop-shadow-xs"
                                />
                              </div>

                              <div className="min-w-0 flex-1 flex flex-col justify-center h-full pr-1 text-left space-y-0.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <h4 className={`font-display text-[12px] sm:text-[12.5px] font-extrabold leading-tight tracking-tight truncate ${slide.titleColor}`}>
                                    {slide.title}
                                  </h4>
                                  {slide.isUnread && (
                                    <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block" />
                                  )}
                                </div>
                                <p className={`text-[9.5px] leading-tight line-clamp-2 ${slide.subTitleColor}`}>
                                  {lang === "ml" ? slide.subtitleMl : slide.subtitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* SECTION 1: Needs attention */}
                    <div className="space-y-1.5 pt-1">
                      {/* Section Header */}
                      <div className="flex items-center justify-between px-0.5 pb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
                            <AlertCircle className="h-3.5 w-3.5 stroke-[2.2]" />
                          </span>
                          <h3 className="font-display text-xs sm:text-[13px] font-black text-[#0a0f1d] dark:text-white tracking-tight truncate">
                          {lang === "ml" ? "ശ്രദ്ധ ആവശ്യമുണ്ട്" : "Needs attention"}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("applications")}
                          className="flex items-center gap-0.5 text-[11px] font-bold text-[#f95700] hover:underline cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5"><span>{lang === "ml" ? "എല്ലാം" : "View all"}</span><span className="rounded-full bg-orange-500/10 dark:bg-orange-950/40 text-[#f95700] px-1.5 py-0.5 text-[9.5px] font-black leading-none border border-orange-200/80 dark:border-orange-900/50">2</span></span>
                          <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Needs Attention Items */}
                      <div className="space-y-2">
                        {/* Item 1: Meera Nair */}
                        <div
                          onClick={() => setActiveTab("applications")}
                          className="rounded-2xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 font-extrabold text-xs shrink-0">
                              MN
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-[12px] sm:text-[12.5px] text-slate-900 dark:text-white leading-tight truncate">
                                {lang === "ml" ? "മീര നായർ" : "Meera Nair"}
                              </h4>
                              <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                                {lang === "ml" ? "പി.എം വിശ്വകർമ്മ" : "PM Vishwakarma"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <div className="flex items-center gap-1.5 rounded-full bg-[#fff4ed] dark:bg-orange-950/50 border border-[#ffebd9] dark:border-orange-900/50 px-2.5 py-1 text-[10px] font-bold text-[#f95700] dark:text-orange-400">
                              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#f95700] text-white text-[8.5px] font-black leading-none">!</span>
                              <span>{lang === "ml" ? "1 രേഖ വിട്ടുപോയി" : "1 document missing"}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>

                        {/* Item 2: Ravi Kumar */}
                        <div
                          onClick={() => setActiveTab("applications")}
                          className="rounded-2xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-xs shrink-0">
                              RK
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-[12px] sm:text-[12.5px] text-slate-900 dark:text-white leading-tight truncate">
                                {lang === "ml" ? "രവി കുമാർ" : "Ravi Kumar"}
                              </h4>
                              <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                                {lang === "ml" ? "പി.എം സ്വനിധി" : "PM SVANidhi"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <div className="flex items-center gap-1.5 rounded-full bg-[#fff4ed] dark:bg-orange-950/50 border border-[#ffebd9] dark:border-orange-900/50 px-2.5 py-1 text-[10px] font-bold text-[#f95700] dark:text-orange-400">
                              <Calendar className="h-3.5 w-3.5 text-[#f95700]" />
                              <span>{lang === "ml" ? "ഇന്ന് തുടർനടപടി" : "Follow-up due today"}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                  )
                ) : (
                  /* Dedicated Full Screen Views inside Mobile App */
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {/* Dedicated Subpage 1: Leaderboard Page */}
                    {mobileSubPage === "leaderboard" && (() => {
                      const hierarchyTabs = [
                        { id: "districts", label: lang === "ml" ? "ജില്ലകൾ" : "Districts", icon: MapPin },
                        { id: "mandalam", label: lang === "ml" ? "മണ്ഡലം" : "Mandalam", icon: Network },
                        { id: "area", label: lang === "ml" ? "മേഖല" : "Area", icon: Map },
                        { id: "booths", label: lang === "ml" ? "ബൂത്തുകൾ" : "Booths", icon: Store },
                        { id: "workers", label: lang === "ml" ? "ഉപയോക്താക്കൾ" : "Users", icon: Users },
                      ];

                      const datasets: Record<string, { title: string; subtitle: string; items: Array<{ rank: number; tag: string; name: string; val: string; sub: string; rankColor: string; tagBg: string; district?: string; avatarUrl?: string }> }> = {
                        districts: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് ജില്ലകൾ" : "Top Performing Districts",
                          subtitle: lang === "ml" ? "ജില്ലാ റാങ്കിംഗുകൾ" : "District Rankings",
                          items: [
                            { rank: 1, tag: "TVM-C", name: "Thiruvananthapuram City", val: "8,420", sub: "420 assisted", rankColor: "text-[#eab308]", tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                            { rank: 2, tag: "TVM-S", name: "Thiruvananthapuram South", val: "7,980", sub: "398 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                            { rank: 3, tag: "TVM-N", name: "Thiruvananthapuram North", val: "7,560", sub: "376 assisted", rankColor: "text-[#f97316]", tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                            { rank: 4, tag: "KLW", name: "Kollam West", val: "7,120", sub: "351 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                            { rank: 5, tag: "KLE", name: "Kollam East", val: "6,940", sub: "338 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            { rank: 6, tag: "PTA", name: "Pathanamthitta", val: "6,720", sub: "326 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                            { rank: 7, tag: "ALS", name: "Alappuzha South", val: "6,340", sub: "309 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                            { rank: 8, tag: "ALN", name: "Alappuzha North", val: "6,180", sub: "298 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                          ],
                        },
                        mandalam: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് മണ്ഡലങ്ങൾ" : "Top Performing Mandalams",
                          subtitle: lang === "ml" ? "മണ്ഡലം റാങ്കിംഗുകൾ" : "Mandalam Rankings",
                          items: (() => {
                            let availableConstituencies = constituencies;
                            if (selectedDistrict !== "all") {
                              availableConstituencies = constituencies.filter((c) => c.districtId === selectedDistrict);
                            }

                            const baseConfigs = [
                              { val: "3,850", sub: 192, tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                              { val: "3,620", sub: 181, tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                              { val: "3,410", sub: 170, tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                              { val: "3,290", sub: 164, tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                              { val: "3,110", sub: 155, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                              { val: "2,980", sub: 149, tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                              { val: "2,840", sub: 142, tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                              { val: "2,710", sub: 135, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            ];

                            return availableConstituencies.slice(0, 8).map((c, idx) => {
                              const b = baseConfigs[idx % baseConfigs.length];
                              const tag = c.en.slice(0, 3).toUpperCase();
                              return {
                                rank: idx + 1,
                                tag,
                                name: c[lang],
                                val: b.val,
                                sub: lang === "ml" ? `${b.sub} സഹായം നൽകി` : `${b.sub} assisted`,
                                rankColor: idx === 0 ? "text-[#eab308]" : idx === 1 ? "text-[#6366f1]" : idx === 2 ? "text-[#f97316]" : "text-[#64748b]",
                                tagBg: b.tagBg,
                              };

                              });
                          })(),
                        },
                        area: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് മേഖലകൾ" : "Top Performing Areas",
                          subtitle: lang === "ml" ? "മേഖലാ റാങ്കിംഗുകൾ" : "Area Rankings",
                          items: (() => {
                            if (selectedMandalam === "all") {
                              if (selectedDistrict === "all") {
                                return [
                                  { rank: 1, tag: "PAP", name: lang === "ml" ? "പപ്പനംകോട് നോർത്ത്" : "Pappanamcode North", val: "1,940", sub: lang === "ml" ? "97 സഹായം നൽകി" : "97 assisted", rankColor: "text-[#eab308]", tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                                  { rank: 2, tag: "KAR", name: lang === "ml" ? "കരമന വെസ്റ്റ്" : "Karamana West", val: "1,820", sub: lang === "ml" ? "91 സഹായം നൽകി" : "91 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                                  { rank: 3, tag: "THI", name: lang === "ml" ? "തിരുവല്ലം ഈസ്റ്റ്" : "Thiruvallam East", val: "1,750", sub: lang === "ml" ? "87 സഹായം നൽകി" : "87 assisted", rankColor: "text-[#f97316]", tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                                  { rank: 4, tag: "PER", name: lang === "ml" ? "പേരൂർക്കട സെൻട്രൽ" : "Peroorkada Central", val: "1,680", sub: lang === "ml" ? "84 സഹായം നൽകി" : "84 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                                  { rank: 5, tag: "KOW", name: lang === "ml" ? "കവടിയാർ സൗത്ത്" : "Kowdiar South", val: "1,590", sub: lang === "ml" ? "79 സഹായം നൽകി" : "79 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                                  { rank: 6, tag: "ULM", name: lang === "ml" ? "ഉള്ളൂർ വെസ്റ്റ്" : "Ulloor West", val: "1,510", sub: lang === "ml" ? "75 സഹായം നൽകി" : "75 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                                  { rank: 7, tag: "SRE", name: lang === "ml" ? "ശ്രീകാര്യം ഈസ്റ്റ്" : "Sreekariyam East", val: "1,440", sub: lang === "ml" ? "72 സഹായം നൽകി" : "72 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                                  { rank: 8, tag: "MAN", name: lang === "ml" ? "മണക്കാട് സൗത്ത്" : "Manacaud South", val: "1,380", sub: lang === "ml" ? "69 സഹായം നൽകി" : "69 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                                ];
                              }

                              const distMandalams = constituencies.filter((c) => c.districtId === selectedDistrict);
                              const firstMandalam = distMandalams[0]?.id || "all";
                              const areas = getAreasForMandalam(firstMandalam, lang);
                              const baseAreaConfigs = [
                                { val: "1,940", sub: 97, tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                                { val: "1,820", sub: 91, tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                                { val: "1,750", sub: 87, tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                                { val: "1,680", sub: 84, tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                                { val: "1,590", sub: 79, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                                { val: "1,510", sub: 75, tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                                { val: "1,440", sub: 72, tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                                { val: "1,380", sub: 69, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                              ];

                              return baseAreaConfigs.map((b, idx) => {
                                const areaObj = areas[idx % areas.length];
                                const areaName = areaObj ? areaObj[lang] : `Area ${idx + 1}`;
                                const tag = areaObj ? areaObj.en.slice(0, 3).toUpperCase() : `A-${idx + 1}`;
                                return {
                                  rank: idx + 1,
                                  tag,
                                  name: areaName,
                                  val: b.val,
                                  sub: lang === "ml" ? `${b.sub} സഹായം നൽകി` : `${b.sub} assisted`,
                                  rankColor: idx === 0 ? "text-[#eab308]" : idx === 1 ? "text-[#6366f1]" : idx === 2 ? "text-[#f97316]" : "text-[#64748b]",
                                  tagBg: b.tagBg,
                                };

                                });
                            }

                            const areas = getAreasForMandalam(selectedMandalam, lang);
                            const baseAreaConfigs = [
                              { val: "1,940", sub: 97, tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                              { val: "1,820", sub: 91, tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                              { val: "1,750", sub: 87, tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                              { val: "1,680", sub: 84, tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                              { val: "1,590", sub: 79, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                              { val: "1,510", sub: 75, tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                              { val: "1,440", sub: 72, tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                              { val: "1,380", sub: 69, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            ];

                            return baseAreaConfigs.map((b, idx) => {
                              const areaObj = areas[idx % areas.length];
                              const areaName = areaObj ? areaObj[lang] : `Area ${idx + 1}`;
                              const tag = areaObj ? areaObj.en.slice(0, 3).toUpperCase() : `A-${idx + 1}`;
                              return {
                                rank: idx + 1,
                                tag,
                                name: areaName,
                                val: b.val,
                                sub: lang === "ml" ? `${b.sub} സഹായം നൽകി` : `${b.sub} assisted`,
                                rankColor: idx === 0 ? "text-[#eab308]" : idx === 1 ? "text-[#6366f1]" : idx === 2 ? "text-[#f97316]" : "text-[#64748b]",
                                tagBg: b.tagBg,
                              };

                              });
                          })(),
                        },
                        booths: {
                          title: lang === "ml" ? "\u0D1F\u0D4B\u0D2A\u0D4D\u0D2A\u0D4D \u0D2A\u0D46\u0D30\u0D4D\u0D2B\u0D4B\u0D2E\u0D3F\u0D02\u0D17\u0D4D \u0D2C\u0D42\u0D24\u0D4D\u0D24\u0D41\u0D15\u0D4D\u0D25\u0D33\u0D4D" : "Top Performing Booths",
                          subtitle: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D \u0D30\u0D3E\u0D19\u0D4D\u0D15\u0D3F\u0D02\u0D17\u0D41\u0D15\u0D4D\u0D25\u0D33\u0D4D" : "Booth Rankings",
                          items: (() => {
                            if (selectedMandalam === "all") {
                              return [
                                { rank: 1, tag: "B-142", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 142 \u00B7 \u0D23\u0D47\u0D2E\u0D02" : "Booth 142 · Nemom", val: "940", sub: lang === "ml" ? "47 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "47 assisted", rankColor: "text-[#eab308]", tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                                { rank: 2, tag: "B-088", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 88 \u00B7 \u0D15\u0D30\u0D2E\u0D28" : "Booth 88 · Karamana", val: "890", sub: lang === "ml" ? "44 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "44 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                                { rank: 3, tag: "B-105", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 105 \u00B7 \u0D2A\u0D2A\u0D4D\u0D2A\u0D28\u0D02\u0D15\u0D4B\u0D11\u0D21\u0D4D" : "Booth 105 · Pappanamcode", val: "840", sub: lang === "ml" ? "42 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "42 assisted", rankColor: "text-[#f97316]", tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                                { rank: 4, tag: "B-019", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 19 \u00B7 \u0D15\u0D35\u0D21\u0D3F\u0D2F\u0D3E\u0D7C" : "Booth 19 · Kowdiar", val: "790", sub: lang === "ml" ? "39 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "39 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                                { rank: 5, tag: "B-067", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 67 \u00B7 \u0D2A\u0D47\u0D30\u0D42\u0D7C\u0D15\u0D4D\u0D15\u0D11\u0D21" : "Booth 67 · Peroorkada", val: "740", sub: lang === "ml" ? "37 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "37 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                                { rank: 6, tag: "B-121", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 121 \u00B7 \u0D24\u0D3F\u0D30\u0D41\u0D35\u0D32\u0D4D\u0D32\u0D02" : "Booth 121 · Thiruvallam", val: "710", sub: lang === "ml" ? "35 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "35 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                                { rank: 7, tag: "B-034", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 34 \u00B7 \u0D30\u0D4D\u0D30\u0D40\u0D15\u0D3E\u0D30\u0D4D\u0D2F\u0D02" : "Booth 34 · Sreekaryam", val: "680", sub: lang === "ml" ? "34 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "34 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                                { rank: 8, tag: "B-092", name: lang === "ml" ? "\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D 92 \u00B7 \u0D15\u0D34\u0D15\u0D4D\u0D15\u0D42\u0D1F\u0D4D\u0D1F\u0D02" : "Booth 92 · Kazhakkoottam", val: "650", sub: lang === "ml" ? "32 \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D22\u0D3B\u0D15\u0D4D\u0D15\u0D3F" : "32 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                              ];
                            }

                            const currentAreas = getAreasForMandalam(selectedMandalam, lang);
                            const selectedMandalamObj = constituencies.find(
                              (c) => c.id === selectedMandalam || c.en.toLowerCase() === selectedMandalam.toLowerCase()
                            );
                            const mandalamName = selectedMandalamObj ? selectedMandalamObj[lang] : (lang === "ml" ? "\u0D2E\u0D23\u0D4D\u0D21\u0D32\u0D02" : "Mandalam");

                            let targetAreaName = "";
                            if (selectedArea !== "all") {
                              const foundArea = currentAreas.find((a) => a.id === selectedArea);
                              if (foundArea) {
                                targetAreaName = foundArea[lang];
                              }
                            }

                            const baseConfigs = [
                              { num: 142, val: "940", sub: 47, tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                              { num: 88, val: "890", sub: 44, tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                              { num: 105, val: "840", sub: 42, tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                              { num: 19, val: "790", sub: 39, tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                              { num: 67, val: "740", sub: 37, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                              { num: 121, val: "710", sub: 35, tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                              { num: 34, val: "680", sub: 34, tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                              { num: 92, val: "650", sub: 32, tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            ];

                            return baseConfigs.map((b, idx) => {
                              const locationLabel = targetAreaName || (currentAreas[idx % currentAreas.length] ? currentAreas[idx % currentAreas.length][lang] : mandalamName);
                              const boothLabel = lang === "ml" ? `\u0D2C\u0D42\u0D24\u0D4D\u0D25\u0D4D ${b.num}` : `Booth ${b.num}`;
                              return {
                                rank: idx + 1,
                                tag: `B-${String(b.num).padStart(3, "0")}`,
                                name: `${boothLabel} · ${locationLabel}`,
                                val: b.val,
                                sub: lang === "ml" ? `${b.sub} \u0D38\u0D39\u0D3E\u0D2F\u0D02 \u0D28\u0D7C\u0D15\u0D3F` : `${b.sub} assisted`,
                                rankColor: idx === 0 ? "text-[#eab308]" : idx === 1 ? "text-[#6366f1]" : idx === 2 ? "text-[#f97316]" : "text-[#64748b]",
                                tagBg: b.tagBg,
                              };

                              });
                          })(),
                        },
                        workers: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് ഉപയോക്താക്കൾ" : "Top Performing Users",
                          subtitle: lang === "ml" ? "ഉപയോക്തൃ റാങ്കിംഗുകൾ" : "User Rankings",
                          items: [
                            { rank: 1, tag: "PR", name: "Anitha Nair", district: "Thiruvananthapuram", val: "480", sub: "24 assisted", rankColor: "text-[#eab308]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800", avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
                            { rank: 2, tag: "PW", name: "Rajesh V. Kurup", district: "Kollam", val: "450", sub: "22 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800", avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
                            { rank: 3, tag: "PR", name: "Maya Devi S.", district: "Thiruvananthapuram", val: "420", sub: "21 assisted", rankColor: "text-[#f97316]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
                            { rank: 4, tag: "PW", name: "Manoj Kumar P.", district: "Alappuzha", val: "390", sub: "19 assisted", rankColor: "text-[#64748b]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
                            { rank: 5, tag: "PR", name: "Suresh Chandran", district: "Kottayam", val: "370", sub: "18 assisted", rankColor: "text-[#64748b]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
                            { rank: 6, tag: "PW", name: "Lekshmi Priya", district: "Ernakulam", val: "340", sub: "17 assisted", rankColor: "text-[#64748b]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" },
                            { rank: 7, tag: "PR", name: "Arun Mohan", district: "Thrissur", val: "320", sub: "16 assisted", rankColor: "text-[#64748b]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
                            { rank: 8, tag: "PW", name: "Deepa R. Nair", district: "Kozhikode", val: "310", sub: "15 assisted", rankColor: "text-[#64748b]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800", avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80" },
                          ],
                        },
                      };

                        const currentDataset = datasets[leaderboardCategory] || datasets.districts;
                      const podiumTop3 = currentDataset.items.slice(0, 3);
                      const rank1 = podiumTop3[0];
                      const rank2 = podiumTop3[1];
                      const rank3 = podiumTop3[2];

                      return (
                        <div className="space-y-2.5 pt-0.5">
                          {/* Top Header Bar with Scope and Period */}
                          <div className="flex items-center justify-between pb-0.5">
                            <div className="flex items-center gap-1 text-base font-black text-[#1e1b4b] dark:text-white">
                              <span>{lang === "ml" ? "ലീഡർബോർഡ്" : "Leaderboard"}</span>
                            </div>
                            
                            {/* Period Selection Bar Pill (Same as Dashboard UI & Actions) */}
                            <div className="flex items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 text-[10.5px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs hover:border-slate-300 transition-all min-h-[28px] max-w-[215px]">
                              <div className="flex items-center gap-0.5 min-w-0 flex-1 justify-center">
                                {/* Left Arrow (Previous Period) */}
                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(-1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Previous Period"
                                >
                                  <ChevronLeft className="h-3.5 w-3.5 stroke-[2.4]" />
                                </button>

                                {/* Date / Month Display */}
                                <button
                                  type="button"
                                  onClick={() => setIsDatePickerOpen(true)}
                                  className="text-[10px] font-extrabold text-[#0a0f1d] dark:text-slate-100 hover:text-[#ff5500] transition-colors cursor-pointer px-0.5 tracking-tight whitespace-nowrap"
                                  title="Click to Open Date Picker"
                                >
                                  {getFormattedPeriodDisplay()}
                                </button>

                                {/* Right Arrow (Next Period) */}
                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Next Period"
                                >
                                  <ChevronRight className="h-3.5 w-3.5 stroke-[2.4]" />
                                </button>
                              </div>

                              {/* Calendar Icon Button on Right End */}
                              <button
                                type="button"
                                onClick={() => setIsDatePickerOpen(true)}
                                className="p-0.5 rounded-full text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-800 pl-1.5 ml-0.5 shrink-0"
                                title="Open Period & Date Picker"
                              >
                                <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
                              </button>
                            </div>
                          </div>

                          {/* Hierarchy Selector Bar with Left & Right scroll arrows */}
                          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                if (tabScrollRef.current) {
                                  tabScrollRef.current.scrollBy({ left: -100, behavior: "smooth" });
                                }
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 active:scale-95 shrink-0 cursor-pointer shadow-2xs"
                              title="Scroll left"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>

                            <div
                              ref={tabScrollRef}
                              className="flex items-center gap-1 overflow-hidden scroll-smooth w-full"
                            >
                              {hierarchyTabs.map((cat) => {
                                const IconComp = cat.icon;
                                const isActive = leaderboardCategory === cat.id;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setLeaderboardCategory(cat.id as any)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                                      isActive
                                        ? "bg-[#fff2e8] dark:bg-orange-950/50 text-[#ff5500] border border-[#ffbb96]/60 shadow-2xs font-extrabold"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                                    }`}
                                  >
                                    <IconComp className={`h-3.5 w-3.5 ${isActive ? "text-[#ff5500]" : "text-slate-500"}`} />
                                    <span>{cat.label}</span>
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (tabScrollRef.current) {
                                  tabScrollRef.current.scrollBy({ left: 100, behavior: "smooth" });
                                }
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 active:scale-95 shrink-0 cursor-pointer shadow-2xs"
                              title="Scroll right"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Merged Filters & Podium Card Outer Container */}
                          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs space-y-2">
                            {/* Dynamic Cascading Filter Dropdowns based on Level (Excluding districts and workers) */}
                            {leaderboardCategory !== "districts" && leaderboardCategory !== "workers" && (
                              <div className="flex items-center gap-1.5 w-full">
                              {leaderboardCategory === "mandalam" && (
                                <div className="relative flex-1 min-w-0 flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-2.5 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                  <Filter className="h-3 w-3 text-orange-500 mr-1 shrink-0" />
                                  <span className="shrink-0 mr-1">District:</span>
                                  <select
                                    value={selectedDistrict}
                                    onChange={(e) => {
                                      setSelectedDistrict(e.target.value);
                                      setSelectedMandalam("all");
                                    }}
                                    className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                  >
                                    <option value="all">{lang === "ml" ? "എല്ലാ ജില്ലകളും" : "All Districts"}</option>
                                    {districts.map((d) => (
                                      <option key={d.id} value={d.id}>
                                        {d[lang]}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1.5 shrink-0" />
                                </div>
                              )}

                              {leaderboardCategory === "area" && (
                                <>
                                  <div className="relative flex-1 min-w-0 flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-2 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                    <span className="shrink-0 mr-1">District:</span>
                                    <select
                                      value={selectedDistrict}
                                      onChange={(e) => {
                                        setSelectedDistrict(e.target.value);
                                        setSelectedMandalam("all");
                                      }}
                                      className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                    >
                                      <option value="all">{lang === "ml" ? "എല്ലാ ജില്ലകളും" : "All"}</option>
                                      {districts.map((d) => (
                                        <option key={d.id} value={d.id}>
                                          {d.id.toUpperCase()} ({d[lang]})
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1 shrink-0" />
                                  </div>

                                  <div className="relative flex-1 min-w-0 flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-2 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                    <span className="shrink-0 mr-1">Mandalam:</span>
                                    <select
                                      value={selectedMandalam}
                                      onChange={(e) => setSelectedMandalam(e.target.value)}
                                      className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                    >
                                      <option value="all">{lang === "ml" ? "എല്ലാ മണ്ഡലങ്ങളും" : "All"}</option>
                                      {(selectedDistrict === "all"
                                        ? constituencies
                                        : constituencies.filter((c) => c.districtId === selectedDistrict)
                                      ).map((c) => (
                                        <option key={c.id} value={c.id}>
                                          {c[lang]}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1 shrink-0" />
                                  </div>
                                </>
                              )}

                              {leaderboardCategory === "booths" && (
                                <>
                                  <div className="relative flex-1 min-w-0 flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-2 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                    <span className="shrink-0 mr-1">Mandalam:</span>
                                    <select
                                      value={selectedMandalam}
                                      onChange={(e) => {
                                        setSelectedMandalam(e.target.value);
                                        setSelectedArea("all");
                                      }}
                                      className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                    >
                                      <option value="all">{lang === "ml" ? "എല്ലാ മണ്ഡലങ്ങളും" : "All"}</option>
                                      {constituencies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                          {c[lang]}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1 shrink-0" />
                                  </div>

                                  <div className="relative flex-1 min-w-0 flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 px-2 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                    <span className="shrink-0 mr-1">Area:</span>
                                    <select
                                      value={selectedArea}
                                      onChange={(e) => setSelectedArea(e.target.value)}
                                      className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                    >
                                      <option value="all">{lang === "ml" ? "എല്ലാ മേഖലകളും" : "All"}</option>
                                      {getAreasForMandalam(selectedMandalam, lang).map((a) => (
                                        <option key={a.id} value={a.id}>
                                          {a[lang]}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1 shrink-0" />
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          

                            {/* Top 3 Leaderboard Podium */}
                            <LeaderboardTop3Podium
                              rank1={rank1 as any}
                              rank2={rank2 as any}
                              rank3={rank3 as any}
                              category={leaderboardCategory}
                              lang={lang}
                            />

                          {/* Commonly Mentioned Legend Bar for PR & PW Badges */}
                          {leaderboardCategory === "workers" && (
                            <div className="flex items-center justify-center gap-3 px-2 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50">
                              <span className="flex items-center gap-1">
                                <span className="rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.2 text-[8.5px] font-black border border-purple-200">PR</span>
                                <span>{lang === "ml" ? "PR: ജനപ്രതിനിധി (People Representative)" : "PR: People Representative"}</span>
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="flex items-center gap-1">
                                <span className="rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 text-[8.5px] font-black border border-blue-200">PW</span>
                                <span>{lang === "ml" ? "PW: പാർട്ടി പ്രവർത്തകൻ (Party Worker)" : "PW: Party Worker"}</span>
                              </span>
                            </div>
                          )}

                          {/* Rankings List Card - Single Card with Thin Row Lines */}
                          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs space-y-1">
                            <div className="flex items-center justify-between pb-1">
                              <h3 className="font-black text-sm text-[#1e1b4b] dark:text-white tracking-tight">
                                {lang === "ml" ? "റാങ്കിംഗ്" : "Ranking"}
                              </h3>
                              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                                {lang === "ml" ? "പോയിന്റുകൾ" : "Points"}
                              </span>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {currentDataset.items.map((row) => (
                                <div
                                  key={row.rank}
                                  className="flex items-center justify-between py-1.5 px-1 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0 pr-1">
                                    <span className={`w-3.5 text-center font-black text-xs shrink-0 ${row.rankColor}`}>
                                      {row.rank}
                                    </span>
                                    {leaderboardCategory === "workers" && (row as any).avatarUrl ? (
                                      <img src={(row as any).avatarUrl} alt={row.name} className="h-7 w-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs" />
                                    ) : leaderboardCategory !== "workers" && (
                                      <span className={`text-[8px] font-black rounded-full px-1.5 py-0.2 shrink-0 ${row.tagBg}`}>
                                        {row.tag}
                                      </span>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-[12px] text-[#1e1b4b] dark:text-slate-200 truncate min-w-0">
                                          {row.name}
                                        </span>
                                        {leaderboardCategory === "workers" && (
                                          <span className={`text-[8.5px] font-black rounded-md px-1.5 py-0.2 shrink-0 ${row.tagBg}`}>
                                            {row.tag}
                                          </span>
                                        )}
                                      </div>
                                      {"district" in row && (row as any).district && (
                                        <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                                          {(row as any).district}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 pl-1">
                                    <p className="font-black text-[12.5px] text-[#1e1b4b] dark:text-white leading-tight">
                                      {row.val}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* View All Link at Bottom of List */}
                            <div className="pt-2 pb-0.5 text-center border-t border-slate-100 dark:border-slate-800/60">
                              <button
                                type="button"
                                className="text-[11.5px] font-extrabold text-[#4f46e5] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Verification Disclaimer Pill */}
                            <div className="rounded-xl bg-[#f0fdf4] dark:bg-emerald-950/40 border border-[#bbf7d0] dark:border-emerald-800/50 px-2.5 py-1 flex items-center justify-center gap-1.5 text-center mt-2">
                              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#10b981] text-white text-[8px] font-black shrink-0">✓</span>
                              <span className="text-[10px] font-bold text-[#15803d] dark:text-emerald-400">
                                {lang === "ml" ? "സ്ഥിരീകരിച്ച പ്രവർത്തനങ്ങൾക്ക് മാത്രം പോയിന്റുകൾ." : "Only verified activities earn points."}
                              </span>
                            </div>
                          </div>
                        </div>
                          </div>
                        );
                      })()}

                    {/* Dedicated Subpage 2: Needs Attention Page */}
                    {mobileSubPage === "needs_attention" && (
                      <div className="space-y-4 pt-1 pb-4">
                        {/* Subpage Back Header */}
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <button
                            type="button"
                            onClick={() => {
            setMobileSubPage("none");
            setActiveTab("applications");
          }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "ശ്രദ്ധിക്കേണ്ടവ" : "Needs Attention"}</span>
                          </button>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {lang === "ml" ? "5 അടിയന്തര കാര്യങ്ങൾ" : "5 Items"}
                          </span>
                        </div>

                        {/* --- Section 1: Today --- */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-extrabold text-foreground">
                              {lang === "ml" ? "ഇന്ന്" : "Today"}
                            </h4>
                            <span className="text-[10px] font-bold text-[#E11D48] bg-[#FFE4E6] dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-0.5 rounded-full">
                              {lang === "ml" ? "2 പുതിയത്" : "2 new"}
                            </span>
                          </div>

                          {/* Card 1: NSP (Red/Rose) */}
                          <div className="p-3.5 rounded-2xl bg-[#FFF5F6] dark:bg-rose-950/20 border border-[#FFE2E5] dark:border-rose-900/40 shadow-2xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider truncate flex-1 min-w-0">
                                {lang === "ml" ? "നാഷണൽ സ്കോളർഷിപ്പ് പോർട്ടൽ" : "NATIONAL SCHOLARSHIP PORTAL"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10.5px] font-medium text-[#71717A]">10:30 AM</span>
                                <span className="text-[10px] font-bold text-[#E11D48] bg-[#FFE4E6] px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === "ml" ? "നടപടി ആവശ്യം" : "Action required"}
                                </span>
                                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-1.5 pr-18">
                              <h5 className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-rose-100 leading-tight">
                                {lang === "ml" ? "അപേക്ഷ പൂർത്തിയാക്കുക" : "Complete your application"}
                              </h5>
                              <p className="text-[11px] text-[#64748B] dark:text-rose-300/80 leading-snug">
                                {lang === "ml"
                                  ? "വെരിഫിക്കേഷൻ പൂർത്തിയാക്കാൻ മുൻവർഷത്തെ മാർക്ക് ലിസ്റ്റ് അപ്‌ലോഡ് ചെയ്യുക."
                                  : "Upload your previous year mark list to complete the verification process."}
                              </p>

                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E11D48] pt-1">
                                <Calendar className="h-3.5 w-3.5 text-[#E11D48] shrink-0" />
                                <span className="whitespace-nowrap">{lang === "ml" ? "അവസാന തീയതി: 12 Nov 2024" : "Due by 12 Nov 2024"}</span>
                              </div>

                              <div className="pt-1.5">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-white bg-[#E11D48] hover:bg-rose-700 px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                                >
                                  <span>{lang === "ml" ? "തുടരുക" : "Continue Application"}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="absolute right-3 bottom-3 pointer-events-none w-16 h-18 bg-white/90 dark:bg-card/90 rounded-xl shadow-xs border border-rose-200/80 p-2 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="h-1.5 w-8 bg-rose-200 rounded-full" />
                                <div className="h-1.5 w-10 bg-rose-100 rounded-full" />
                                <div className="h-1.5 w-6 bg-rose-100 rounded-full" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-xs">
                                <ChevronRight className="h-3.5 w-3.5 -rotate-90 stroke-[3]" />
                              </div>
                            </div>
                          </div>

                          {/* Card 2: PM-KISAN (Amber/Orange) */}
                          <div className="p-3.5 rounded-2xl bg-[#FFFDF3] dark:bg-amber-950/20 border border-[#FEF3C7] dark:border-amber-900/40 shadow-2xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider truncate flex-1 min-w-0">
                                {lang === "ml" ? "പിഎം-കിസാൻ" : "PM-KISAN"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10.5px] font-medium text-[#71717A]">09:15 AM</span>
                                <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === "ml" ? "വെരിഫിക്കേഷൻ വേണം" : "Verification needed"}
                                </span>
                                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-1.5 pr-18">
                              <h5 className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-amber-100 leading-tight">
                                {lang === "ml" ? "ഇ-കെവൈസി പൂർത്തിയാക്കുക" : "Complete e-KYC"}
                              </h5>
                              <p className="text-[11px] text-[#64748B] dark:text-amber-300/80 leading-snug">
                                {lang === "ml"
                                  ? "അടുത്ത ഗഡു ലഭ്യമാക്കാൻ ആധാർ ഒടിപി വെരിഫിക്കേഷൻ പൂർത്തിയാക്കുക."
                                  : "Perform Aadhaar OTP verification to enable your next installment."}
                              </p>

                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D97706] pt-1">
                                <Calendar className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
                                <span className="whitespace-nowrap">{lang === "ml" ? "അവസാന തീയതി: 15 Nov 2024" : "Due by 15 Nov 2024"}</span>
                              </div>

                              <div className="pt-1.5">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-white bg-[#EA580C] hover:bg-orange-700 px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                                >
                                  <span>{lang === "ml" ? "വെരിഫൈ ചെയ്യുക" : "Verify Now"}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="absolute right-3 bottom-3 pointer-events-none w-16 h-14 bg-white/90 dark:bg-card/90 rounded-xl shadow-xs border border-amber-200/80 p-2 flex flex-col justify-between">
                              <div className="flex items-center gap-1">
                                <span className="text-[7px] font-extrabold text-amber-700">Aadhaar</span>
                                <div className="h-1 w-3 bg-amber-400 rounded-xs" />
                              </div>
                              <div className="space-y-1">
                                <div className="h-1 w-10 bg-amber-100 rounded-full" />
                                <div className="h-1 w-7 bg-amber-100 rounded-full" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
                                <ShieldCheck className="h-3.5 w-3.5" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* --- Section 2: This Week --- */}
                        <div className="space-y-2.5 pt-2">
                          <h4 className="text-sm font-extrabold text-foreground">
                            {lang === "ml" ? "ഈ ആഴ്ച" : "This Week"}
                          </h4>

                          {/* Card 3: Income Certificate (Blue) */}
                          <div className="p-3.5 rounded-2xl bg-[#F5F8FF] dark:bg-blue-950/20 border border-[#E0E7FF] dark:border-blue-900/40 shadow-2xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider truncate flex-1 min-w-0">
                                {lang === "ml" ? "വരുമാന സർട്ടിഫിക്കറ്റ് (ഇ-ഡിസ്ട്രിക്റ്റ്)" : "INCOME CERTIFICATE (KERALA E-DISTRICT)"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10.5px] font-medium text-[#71717A]">Tue, 5 Nov</span>
                                <span className="text-[10px] font-bold text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === "ml" ? "അപ്ഡേറ്റ്" : "Application Update"}
                                </span>
                                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-1.5 pr-18">
                              <h5 className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-blue-100 leading-tight">
                                {lang === "ml" ? "അപേക്ഷ അംഗീകരിച്ചു" : "Application approved"}
                              </h5>
                              <p className="text-[11px] text-[#64748B] dark:text-blue-300/80 leading-snug">
                                {lang === "ml"
                                  ? "നിങ്ങളുടെ വരുമാന സർട്ടിഫിക്കറ്റ് അപേക്ഷ വില്ലേജ് ഓഫീസർ അംഗീകരിച്ചു."
                                  : "Your income certificate application has been approved by the Village Officer."}
                              </p>

                              <div className="pt-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#2563EB] bg-white dark:bg-blue-950 hover:bg-blue-50 border border-[#2563EB] px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                  <span>{lang === "ml" ? "വിവരങ്ങൾ കാണുക" : "View Details"}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="absolute right-3 bottom-3 pointer-events-none w-16 h-18 bg-white/90 dark:bg-card/90 rounded-xl shadow-xs border border-blue-200/80 p-2 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="h-1.5 w-8 bg-blue-200 rounded-full" />
                                <div className="h-1.5 w-10 bg-blue-100 rounded-full" />
                                <div className="h-1.5 w-6 bg-blue-100 rounded-full" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xs">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                            </div>
                          </div>

                          {/* Card 4: New Scheme (Green/Mint) */}
                          <div className="p-3.5 rounded-2xl bg-[#F4FAF6] dark:bg-emerald-950/20 border border-[#D1FAE5] dark:border-emerald-900/40 shadow-2xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider truncate flex-1 min-w-0">
                                {lang === "ml" ? "പുതിയ പദ്ധതി" : "NEW SCHEME"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10.5px] font-medium text-[#71717A]">Sun, 3 Nov</span>
                                <span className="text-[10px] font-bold text-[#059669] bg-[#D1FAE5] px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === "ml" ? "പദ്ധതി അപ്ഡേറ്റ്" : "Scheme Update"}
                                </span>
                                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-1.5 pr-18">
                              <h5 className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-emerald-100 leading-tight">
                                {lang === "ml" ? "പുതിയ ക്ഷേമ പദ്ധതി പ്രസിദ്ധീകരിച്ചു" : "New welfare scheme published"}
                              </h5>
                              <p className="text-[11px] text-[#64748B] dark:text-emerald-300/80 leading-snug">
                                {lang === "ml"
                                  ? "പ്രധാനമന്ത്രി വിശ്വകർമ്മ യോജന ഇപ്പോൾ ലഭ്യമാണ്. അർഹത പരിശോധിച്ച് അപേക്ഷിക്കുക."
                                  : "Pradhan Mantri Vishwakarma Yojana is now available. Check eligibility and apply."}
                              </p>

                              <div className="pt-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#059669] bg-white dark:bg-emerald-950 hover:bg-emerald-50 border border-[#059669] px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                  <span>{lang === "ml" ? "പരിശോധിക്കുക" : "Explore Scheme"}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="absolute right-3 bottom-3 pointer-events-none w-16 h-16 bg-emerald-100/70 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center p-2 text-emerald-600">
                              <Megaphone className="h-8 w-8 stroke-[2.2]" />
                            </div>
                          </div>
                        </div>

                        {/* --- Section 3: Earlier --- */}
                        <div className="space-y-2.5 pt-2">
                          <h4 className="text-sm font-extrabold text-foreground">
                            {lang === "ml" ? "മുൻപ്" : "Earlier"}
                          </h4>

                          {/* Card 5: My Application (Purple) */}
                          <div className="p-3.5 rounded-2xl bg-[#FAF7FF] dark:bg-purple-950/20 border border-[#F3E8FF] dark:border-purple-900/40 shadow-2xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider truncate flex-1 min-w-0">
                                {lang === "ml" ? "എന്റെ അപേക്ഷ" : "MY APPLICATION"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10.5px] font-medium text-[#71717A]">Fri, 1 Nov</span>
                                <span className="text-[10px] font-bold text-[#7C3AED] bg-[#F3E8FF] px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {lang === "ml" ? "തുടർനടപടി" : "Follow up"}
                                </span>
                                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-1.5 pr-18">
                              <h5 className="font-extrabold text-[13.5px] text-[#0F172A] dark:text-purple-100 leading-tight">
                                {lang === "ml" ? "കൂടുതൽ വിവരങ്ങൾ ആവശ്യപ്പെട്ടു" : "Additional information requested"}
                              </h5>
                              <p className="text-[11px] text-[#64748B] dark:text-purple-300/80 leading-snug">
                                {lang === "ml"
                                  ? "നിങ്ങളുടെ ഭവന നിർമ്മാണ ഗ്രാന്റ് അപേക്ഷയ്ക്ക് അധിക രേഖകൾ ആവശ്യമാണ്."
                                  : "Your housing grant application requires additional documents."}
                              </p>

                              <div className="pt-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#7C3AED] bg-white dark:bg-purple-950 hover:bg-purple-50 border border-[#7C3AED] px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                  <span>{lang === "ml" ? "പരിശോധിക്കുക" : "Review"}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="absolute right-3 bottom-3 pointer-events-none w-16 h-16 bg-purple-100/70 dark:bg-purple-950/50 rounded-2xl p-2 flex items-center justify-center">
                              <div className="relative w-12 h-10 bg-white dark:bg-card rounded-md shadow-xs border border-purple-200 p-1 flex flex-col justify-between">
                                <div className="h-1 w-6 bg-purple-200 rounded-full" />
                                <div className="h-1 w-8 bg-purple-100 rounded-full" />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                                  i
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage 3: Recent Activity Page */}
                    {mobileSubPage === "recent_activity" && (
                      <div className="space-y-2.5 pt-0.5 pb-4 animate-in fade-in duration-200">
                        {/* Subpage Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 px-0.5">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b255a] dark:text-blue-400 hover:text-blue-700 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "സമീപകാല പ്രവർത്തനങ്ങൾ" : "Recent Activity"}</span>
                          </button>
                          <Activity className="h-4 w-4 text-[#1b255a] dark:text-blue-400" />
                        </div>

                        {/* ================= SECTION 1: TODAY ================= */}
                        <div className="space-y-2">
                          {/* Group Header Bar */}
                          <div className="flex items-center justify-between bg-[#EEF2FF] dark:bg-slate-900/90 px-3 py-1.5 rounded-lg">
                            <h4 className="text-xs font-extrabold text-[#1E1B4B] dark:text-blue-200">
                              {lang === "ml" ? "ഇന്ന്" : "Today"}
                            </h4>
                            <span className="text-[10px] font-bold text-[#15803D] dark:text-emerald-300 bg-[#DCFCE7] dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                              {lang === "ml" ? "2 പുതിയത്" : "2 new"}
                            </span>
                          </div>

                          {/* Items Container with Vertical Timeline Line */}
                          <div className="relative pl-4 space-y-0">
                            {/* Continuous Vertical Timeline Line */}
                            <div className="absolute left-[5px] top-3 bottom-3 w-[1.5px] bg-slate-200 dark:bg-slate-700 pointer-events-none" />

                            {/* Item 1: Application Submitted */}
                            <div className="relative py-1.5 flex items-start gap-2 border-b border-slate-100 dark:border-slate-800/80">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[15px] top-[11px] w-2.5 h-2.5 rounded-full bg-[#2563EB] ring-4 ring-white dark:ring-slate-950 z-10 shrink-0" />

                              {/* Icon Box */}
                              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                                <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
                              </div>

                              {/* Text Info */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="font-extrabold text-[12px] text-[#0F172A] dark:text-white leading-tight">
                                    {lang === "ml" ? "അപേക്ഷ സമർപ്പിച്ചു" : "Application Submitted"}
                                  </h5>
                                  <span className="text-[9.5px] font-medium text-[#94A3B8] shrink-0">10:30 AM</span>
                                </div>
                                <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 leading-tight mt-0.5">
                                  {lang === "ml" ? "നിങ്ങളുടെ അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു." : "Your application was submitted successfully."}
                                </p>
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#EFF6FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-300">
                                    {lang === "ml" ? "പിഎം-കിസാൻ സമ്മാൻ നിധി" : "PM-KISAN Samman Nidhi"}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1] dark:text-slate-600 self-center shrink-0" />
                            </div>

                            {/* Item 2: Eligibility Checked */}
                            <div className="relative py-1.5 flex items-start gap-2">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[15px] top-[11px] w-2.5 h-2.5 rounded-full bg-[#10B981] ring-4 ring-white dark:ring-slate-950 z-10 shrink-0" />

                              {/* Icon Box */}
                              <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                              </div>

                              {/* Text Info */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="font-extrabold text-[12px] text-[#0F172A] dark:text-white leading-tight">
                                    {lang === "ml" ? "യോഗ്യത പരിശോധിച്ചു" : "Eligibility Checked"}
                                  </h5>
                                  <span className="text-[9.5px] font-medium text-[#94A3B8] shrink-0">9:15 AM</span>
                                </div>
                                <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 leading-tight mt-0.5">
                                  {lang === "ml" ? "നിങ്ങൾ യോഗ്യതാ പരിശോധന പൂർത്തിയാക്കി." : "You completed the eligibility check."}
                                </p>
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#ECFDF5] dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-300">
                                    {lang === "ml" ? "പിഎം ആവാസ് യോജന - ഗ്രാമീൺ" : "PM Awas Yojana – Gramin"}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1] dark:text-slate-600 self-center shrink-0" />
                            </div>
                          </div>
                        </div>

                        {/* ================= SECTION 2: YESTERDAY ================= */}
                        <div className="space-y-2 pt-0.5">
                          {/* Group Header Bar */}
                          <div className="flex items-center justify-between bg-[#EEF2FF] dark:bg-slate-900/90 px-3 py-1.5 rounded-lg">
                            <h4 className="text-xs font-extrabold text-[#1E1B4B] dark:text-blue-200">
                              {lang === "ml" ? "ഇന്നലെ" : "Yesterday"}
                            </h4>
                            <span className="text-[10px] font-bold text-[#475569] dark:text-slate-300 bg-[#E2E8F0] dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {lang === "ml" ? "3 പ്രവർത്തനങ്ങൾ" : "3 activities"}
                            </span>
                          </div>

                          {/* Items Container with Vertical Timeline Line */}
                          <div className="relative pl-4 space-y-0">
                            {/* Continuous Vertical Timeline Line */}
                            <div className="absolute left-[5px] top-3 bottom-3 w-[1.5px] bg-slate-200 dark:bg-slate-700 pointer-events-none" />

                            {/* Item 3: Assistance Requested */}
                            <div className="relative py-1.5 flex items-start gap-2 border-b border-slate-100 dark:border-slate-800/80">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[15px] top-[11px] w-2.5 h-2.5 rounded-full bg-[#F97316] ring-4 ring-white dark:ring-slate-950 z-10 shrink-0" />

                              {/* Icon Box */}
                              <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] dark:bg-orange-950/60 flex items-center justify-center shrink-0">
                                <HeartHandshake className="h-3.5 w-3.5 text-[#F97316]" />
                              </div>

                              {/* Text Info */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="font-extrabold text-[12px] text-[#0F172A] dark:text-white leading-tight">
                                    {lang === "ml" ? "സഹായം അഭ്യർത്ഥിച്ചു" : "Assistance Requested"}
                                  </h5>
                                  <span className="text-[9.5px] font-medium text-[#94A3B8] shrink-0">4:20 PM</span>
                                </div>
                                <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 leading-tight mt-0.5">
                                  {lang === "ml" ? "നിങ്ങളുടെ അഭ്യർത്ഥന ലഭിച്ചു." : "Your request has been received."}
                                </p>
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#FFF7ED] dark:bg-orange-950/80 text-[#EA580C] dark:text-orange-300">
                                    {lang === "ml" ? "സ്കോളർഷിപ്പ് അപേക്ഷാ സഹായം" : "Scholarship application support"}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1] dark:text-slate-600 self-center shrink-0" />
                            </div>

                            {/* Item 4: Course Completed */}
                            <div className="relative py-1.5 flex items-start gap-2 border-b border-slate-100 dark:border-slate-800/80">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[15px] top-[11px] w-2.5 h-2.5 rounded-full bg-[#8B5CF6] ring-4 ring-white dark:ring-slate-950 z-10 shrink-0" />

                              {/* Icon Box */}
                              <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] dark:bg-purple-950/60 flex items-center justify-center shrink-0">
                                <GraduationCap className="h-3.5 w-3.5 text-[#8B5CF6]" />
                              </div>

                              {/* Text Info */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="font-extrabold text-[12px] text-[#0F172A] dark:text-white leading-tight">
                                    {lang === "ml" ? "കോഴ്സ് പൂർത്തിയായി" : "Course Completed"}
                                  </h5>
                                  <span className="text-[9.5px] font-medium text-[#94A3B8] shrink-0">11:00 AM</span>
                                </div>
                                <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 leading-tight mt-0.5">
                                  {lang === "ml" ? "നിങ്ങൾ ഓൺലൈൻ ക്ലാസ്സ് പൂർത്തിയാക്കി." : "You completed the online class."}
                                </p>
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#F5F3FF] dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300">
                                    {lang === "ml" ? "സർക്കാർ പദ്ധതി അവബോധം" : "Government Schemes Awareness"}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1] dark:text-slate-600 self-center shrink-0" />
                            </div>

                            {/* Item 5: Document Uploaded */}
                            <div className="relative py-1.5 flex items-start gap-2">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[15px] top-[11px] w-2.5 h-2.5 rounded-full bg-[#10B981] ring-4 ring-white dark:ring-slate-950 z-10 shrink-0" />

                              {/* Icon Box */}
                              <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                                <FileText className="h-3.5 w-3.5 text-[#10B981]" />
                              </div>

                              {/* Text Info */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="font-extrabold text-[12px] text-[#0F172A] dark:text-white leading-tight">
                                    {lang === "ml" ? "രേഖ അപ്‌ലോഡ് ചെയ്തു" : "Document Uploaded"}
                                  </h5>
                                  <span className="text-[9.5px] font-medium text-[#94A3B8] shrink-0">9:45 AM</span>
                                </div>
                                <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 leading-tight mt-0.5">
                                  {lang === "ml" ? "നിങ്ങളുടെ രേഖ വിജയകരമായി അപ്‌ലോഡ് ചെയ്തു." : "Your document has been uploaded successfully."}
                                </p>
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#ECFDF5] dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-300">
                                    {lang === "ml" ? "വരുമാന സർട്ടിഫിക്കറ്റ്" : "Income Certificate"}
                                  </span>
                                </div>
                              </div>

                              <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1] dark:text-slate-600 self-center shrink-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

  {/* Dedicated Subpage 6: Detailed Application View */}
  {mobileSubPage === "app_detail" && renderAppDetailSubpage()}

  {mobileSubPage === "notifications" && (
                      <div className="space-y-3 pt-0.5 animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border/80 pb-2">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b255a] dark:text-blue-400 hover:text-blue-700 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "അറിയിപ്പുകൾ" : "Notifications"}</span>
                          </button>
                          <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                            {lang === "ml" ? "4 പുതിയത്" : "4 unread"}
                          </span>
                        </div>

                        {/* Top Horizontally Scrollable Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setActiveNotificationFilter("all")}
                            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              activeNotificationFilter === "all"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                          >
                            {lang === "ml" ? "എല്ലാം (6)" : "All (6)"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveNotificationFilter("unread")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              activeNotificationFilter === "unread"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-100"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>{lang === "ml" ? "വായിക്കാത്തവ (4)" : "Unread (4)"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveNotificationFilter("applications")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              activeNotificationFilter === "applications"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/40 hover:bg-blue-100"
                            }`}
                          >
                            <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            <span>{lang === "ml" ? "അപേക്ഷകൾ (2)" : "Applications (2)"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveNotificationFilter("schemes")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              activeNotificationFilter === "schemes"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/40 hover:bg-purple-100"
                            }`}
                          >
                            <Megaphone className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            <span>{lang === "ml" ? "പദ്ധതികൾ (1)" : "Schemes (1)"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveNotificationFilter("support")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              activeNotificationFilter === "support"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40 hover:bg-emerald-100"
                            }`}
                          >
                            <Phone className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{lang === "ml" ? "സഹായം (1)" : "Support (1)"}</span>
                          </button>
                        </div>

                        {/* Notifications List Grouped */}
                        <div className="space-y-3 pt-0.5">
                          {/* Section 1: Today */}
                          {(activeNotificationFilter === "all" || activeNotificationFilter === "unread" || activeNotificationFilter === "applications") && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between px-0.5">
                                <h4 className="font-extrabold text-[11px] text-[#0f172a] dark:text-white">
                                  {lang === "ml" ? "ഇന്ന്" : "Today"}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                  {lang === "ml" ? "3 അറിയിപ്പുകൾ" : "3 notifications"}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {/* Item 1: PM-KISAN */}
                                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-2.5 cursor-pointer">
                                  <div className="h-11 w-11 rounded-2xl bg-[#fef6e7] dark:bg-amber-950/60 flex items-center justify-center text-[#d97706] dark:text-amber-400 shrink-0">
                                    <Sprout className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[8.5px] font-black text-[#c05621] dark:text-amber-300 bg-[#fef0d7] dark:bg-amber-950/80 px-2 py-0.2 rounded-full">
                                        PM-KISAN
                                      </span>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[9.5px] font-medium text-slate-400">10m ago</span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] shrink-0" />
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                      </div>
                                    </div>
                                    <h5 className="font-bold text-[11.5px] text-[#0f172a] dark:text-white leading-tight">
                                      {lang === "ml" ? "പിഎം-കിസാൻ ഇ-കെവൈസി പൂർത്തിയാക്കുക" : "Complete PM-KISAN e-KYC"}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                      {lang === "ml" ? "ഗുണഭോക്തൃ അക്കൗണ്ടിനായി വെരിഫിക്കേഷൻ കുടിശ്ശികയാണ്." : "Verification is pending for your beneficiary account."}
                                    </p>
                                  </div>
                                </div>

                                {/* Item 2: Scholarship */}
                                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-2.5 cursor-pointer">
                                  <div className="h-11 w-11 rounded-2xl bg-[#fdeef1] dark:bg-rose-950/60 flex items-center justify-center text-[#e11d48] dark:text-rose-400 shrink-0">
                                    <AlertTriangle className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[8.5px] font-black text-[#9b2c2c] dark:text-rose-300 bg-[#fde2e4] dark:bg-rose-950/80 px-2 py-0.2 rounded-full">
                                        {lang === "ml" ? "സ്കോളർഷിപ്പ്" : "Scholarship"}
                                      </span>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[9.5px] font-medium text-slate-400">25m ago</span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] shrink-0" />
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                      </div>
                                    </div>
                                    <h5 className="font-bold text-[11.5px] text-[#0f172a] dark:text-white leading-tight">
                                      {lang === "ml" ? "സ്കോളർഷിപ്പ് അപേക്ഷയിൽ തിരുത്തൽ വേണം" : "Scholarship application correction required"}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                      {lang === "ml" ? "പ്രോസസ്സിംഗ് തുടരാൻ കൂടുതൽ രേഖകൾ ആവശ്യമാണ്." : "Additional documents are needed to continue processing."}
                                    </p>
                                  </div>
                                </div>

                                {/* Item 3: Kerala e-District */}
                                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-2.5 cursor-pointer">
                                  <div className="h-11 w-11 rounded-2xl bg-[#eef4ff] dark:bg-blue-950/60 flex items-center justify-center text-[#2563eb] dark:text-blue-400 shrink-0">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[8.5px] font-black text-[#1e40af] dark:text-blue-300 bg-[#e0e7ff] dark:bg-blue-950/80 px-2 py-0.2 rounded-full">
                                        Kerala e-District
                                      </span>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[9.5px] font-medium text-slate-400">1h ago</span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] shrink-0" />
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                      </div>
                                    </div>
                                    <h5 className="font-bold text-[11.5px] text-[#0f172a] dark:text-white leading-tight">
                                      {lang === "ml" ? "വരുമാന സർട്ടിഫിക്കറ്റ് സമർപ്പിച്ചു" : "Income certificate submitted"}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                      {lang === "ml" ? "ഇ-ഡിസ്ട്രിക്റ്റ് അപേക്ഷ പരിശോധനയിലാണ്." : "Your Kerala e-District application is under review."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Section 2: Yesterday */}
                          {(activeNotificationFilter === "all" || activeNotificationFilter === "unread" || activeNotificationFilter === "schemes" || activeNotificationFilter === "support") && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between px-0.5">
                                <h4 className="font-extrabold text-[11px] text-[#0f172a] dark:text-white">
                                  {lang === "ml" ? "ഇന്നലെ" : "Yesterday"}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                  {lang === "ml" ? "2 അറിയിപ്പുകൾ" : "2 notifications"}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {/* Item 4: New scheme */}
                                {(activeNotificationFilter === "all" || activeNotificationFilter === "unread" || activeNotificationFilter === "schemes") && (
                                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-2.5 cursor-pointer">
                                    <div className="h-11 w-11 rounded-2xl bg-[#f4eefd] dark:bg-purple-950/60 flex items-center justify-center text-[#7c3aed] dark:text-purple-400 shrink-0">
                                      <Megaphone className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-[8.5px] font-black text-[#6b21a8] dark:text-purple-300 bg-[#f3e8ff] dark:bg-purple-950/80 px-2 py-0.2 rounded-full">
                                          {lang === "ml" ? "പുതിയ പദ്ധതി" : "New Scheme"}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-[9.5px] font-medium text-slate-400">Yesterday</span>
                                          <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] shrink-0" />
                                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                        </div>
                                      </div>
                                      <h5 className="font-bold text-[11.5px] text-[#0f172a] dark:text-white leading-tight">
                                        {lang === "ml" ? "പുതിയ പദ്ധതി ലഭ്യമാണ്" : "New scheme available"}
                                      </h5>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                        {lang === "ml" ? "പിഎം വിശ്വകർമ്മ യോജനയിൽ ഇപ്പോൾ അപേക്ഷിക്കാം." : "PM Vishwakarma Yojana is now open for eligible users."}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Item 5: Support */}
                                {(activeNotificationFilter === "all" || activeNotificationFilter === "support") && (
                                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-2.5 cursor-pointer">
                                    <div className="h-11 w-11 rounded-2xl bg-[#eefbf4] dark:bg-emerald-950/60 flex items-center justify-center text-[#059669] dark:text-emerald-400 shrink-0">
                                      <Phone className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-[8.5px] font-black text-[#065f46] dark:text-emerald-300 bg-[#d1fae5] dark:bg-emerald-950/80 px-2 py-0.2 rounded-full">
                                          {lang === "ml" ? "സഹായം" : "Support"}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-[9.5px] font-medium text-slate-400">Yesterday</span>
                                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                        </div>
                                      </div>
                                      <h5 className="font-bold text-[11.5px] text-[#0f172a] dark:text-white leading-tight">
                                        {lang === "ml" ? "സഹായ അഭ്യർത്ഥന പുതുക്കി" : "Help request updated"}
                                      </h5>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                        {lang === "ml" ? "സപ്പോർട്ട് ടീം കൂടുതൽ വിവരങ്ങൾ ആവശ്യപ്പെട്ടിട്ടുണ്ട്." : "Support team requested additional information."}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Section 3: 12 Nov 2024 */}
                          {(activeNotificationFilter === "all" || activeNotificationFilter === "applications") && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-[#0f172a] dark:text-white">
                                  12 Nov 2024
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                  {lang === "ml" ? "1 അറിയിപ്പ്" : "1 notification"}
                                </span>
                              </div>

                              {/* Item 6 */}
                              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-2.5 cursor-pointer">
                                <div className="h-9 w-9 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                                  <FileText className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-blue-800 dark:text-blue-300 bg-blue-100/90 dark:bg-blue-950/80 px-2 py-0.2 rounded-full">
                                      {lang === "ml" ? "അപേക്ഷ" : "Application"}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-[12px] text-[#0f172a] dark:text-white leading-tight">
                                    {lang === "ml" ? "വരുമാന സർട്ടിഫിക്കറ്റ് അപേക്ഷ സമർപ്പിച്ചു" : "Income certificate application submitted"}
                                  </h5>
                                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug">
                                    {lang === "ml" ? "തിരുവനന്തപുരം ജില്ല" : "Thiruvananthapuram district"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                                  <span className="text-[9.5px] font-semibold text-slate-400">12 Nov</span>
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Section 4: 11 Nov 2024 */}
                          {(activeNotificationFilter === "all" || activeNotificationFilter === "support") && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-[#0f172a] dark:text-white">
                                  11 Nov 2024
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                  {lang === "ml" ? "1 അറിയിപ്പ്" : "1 notification"}
                                </span>
                              </div>

                              {/* Item 7 */}
                              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-2.5 cursor-pointer">
                                <div className="h-9 w-9 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                                  <CheckCircle2 className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 px-2 py-0.2 rounded-full">
                                      {lang === "ml" ? "വിവരങ്ങൾ" : "Information"}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-[12px] text-[#0f172a] dark:text-white leading-tight">
                                    {lang === "ml" ? "പ്രൊഫൈൽ പുതുക്കി" : "Profile updated"}
                                  </h5>
                                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug">
                                    {lang === "ml" ? "നിങ്ങളുടെ മൊബൈൽ നമ്പർ വിജയികരമായി പുതുക്കി." : "Your mobile number has been successfully updated."}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                                  <span className="text-[9.5px] font-semibold text-slate-400">11 Nov</span>
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage 6: Applications Subpage */}
                    {mobileSubPage === "applications" && (
                      <div className="space-y-3 pt-0.5 animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border/80 pb-2 gap-1">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b255a] dark:text-blue-400 hover:text-blue-700 cursor-pointer shrink-0"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}</span>
                          </button>

                          {/* Period Selector & Filter Action in Header */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="flex items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs hover:border-slate-300 transition-all min-h-[28px] max-w-[150px] sm:max-w-[180px]">
                              <div className="flex items-center gap-0.5 min-w-0 flex-1 justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(-1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Previous Period"
                                >
                                  <ChevronLeft className="h-3 w-3 stroke-[2.4]" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setIsDatePickerOpen(true)}
                                  className="text-[9.5px] sm:text-[10px] font-extrabold text-[#0a0f1d] dark:text-slate-100 hover:text-[#ff5500] transition-colors cursor-pointer px-0.5 tracking-tight truncate"
                                  title="Click to Open Date Picker"
                                >
                                  {getFormattedPeriodDisplay()}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Next Period"
                                >
                                  <ChevronRight className="h-3 w-3 stroke-[2.4]" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setIsDatePickerOpen(true)}
                                className="p-0.5 rounded-full text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-800 pl-1 ml-0.5 shrink-0"
                                title="Open Date Picker"
                              >
                                <Calendar className="h-3 w-3 stroke-[2.2]" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowFilterMenu(!showFilterMenu)}
                              className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                                showFilterMenu
                                  ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                                  : "border-amber-200/60 dark:border-slate-800 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 hover:bg-amber-100/50"
                              }`}
                              title="Toggle Filters"
                            >
                              <Filter className={`h-3.5 w-3.5 stroke-[2.2] shrink-0 ${showFilterMenu ? "text-white" : "text-[#ff5500]"}`} />
                            </button>
                          </div>
                        </div>

                        {/* Search Input & Status Selection Dropdown Pill */}
                        <div className="flex items-center gap-2 pb-1">
                          {/* Application Search Input */}
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              value={applicationSearchQuery}
                              onChange={(e) => setApplicationSearchQuery(e.target.value)}
                              placeholder={lang === "ml" ? "പേര്, ഐഡി, ടൈപ്പ് തിരയുക..." : "Search by name, ID, type..."}
                              className="w-full h-7 pl-7 pr-6 text-[11px] font-semibold rounded-full border border-amber-200/80 dark:border-slate-800 bg-[#fffcfa] dark:bg-slate-900 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                            />
                            {applicationSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setApplicationSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Status Selection Dropdown Pill */}
                          <div className="relative shrink-0">
                            <select
                              value={applicationStatusFilter}
                              onChange={(e) => setApplicationStatusFilter(e.target.value as "all" | "assisted" | "pending" | "rejected")}
                              className="h-7 pl-3 pr-7 text-[11px] font-bold rounded-full border border-amber-200/80 dark:border-orange-800/80 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs cursor-pointer appearance-none"
                            >
                              <option value="all">{lang === "ml" ? `എല്ലാം (${applicationsCount})` : `All (${applicationsCount})`}</option>
                              <option value="assisted">{lang === "ml" ? `പരിശോധനയിലുള്ളവ (${currentMetrics.assisted})` : `In Review (${currentMetrics.assisted})`}</option>
                              <option value="pending">{lang === "ml" ? `പെൻഡിംഗ് (${currentMetrics.pending})` : `Pending (${currentMetrics.pending})`}</option>
                              <option value="rejected">{lang === "ml" ? `നിരസിച്ചവ (${currentMetrics.rejected})` : `Rejected (${currentMetrics.rejected})`}</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#0a0f1d] dark:text-slate-300 pointer-events-none" />
                          </div>
                        </div>

                        {/* List of Applications */}
                        <div className="space-y-2 pt-1">
                          {/* Item 1: Pending */}
                          {matchAppSearch("pending", "Pratibha Merit Scholarship", "പ്രതിഭാ മെരിറ്റ് സ്കോളർഷിപ്പ്", "Ananya Ramesh", "അനന്യ രമേശ്", "Scholarship", "സ്കോളർഷിപ്പ്", "APP-2026-8910") && (
                            <div 
                              onClick={() => {
                                setSelectedApplicationRecord({
                                  ref: "APP-2026-8910",
                                  schemeNameEn: "Pratibha Merit Scholarship",
                                  schemeNameMl: "പ്രതിഭാ മെരിറ്റ് സ്കോളർഷിപ്പ്",
                                  categoryEn: "Scholarship",
                                  categoryMl: "സ്കോളർഷിപ്പ്",
                                  status: "pending",
                                  applicantNameEn: "Ananya Ramesh",
                                  applicantNameMl: "അനന്യ രമേശ്",
                                  aadhaar: "XXXX-XXXX-8910",
                                  phone: "+91 94950 33445",
                                  locationEn: "Kazhakkoottam, Thiruvananthapuram",
                                  locationMl: "കഴക്കൂട്ടം, തിരുവനന്തപുരം",
                                  annualIncome: "₹ 1,20,000",
                                  appliedDate: "05/10/2026",
                                  currentStep: 2,
                                  pendingDocs: ["Class 10 Marklist", "Aadhaar Card", "Income Certificate"],
                                  nextActionEn: "Income Certificate verification by Village Officer pending",
                                  nextActionMl: "വില്ലേജ് ഓഫീസറുടെ വരുമാന സർട്ടിഫിക്കറ്റ് പരിശോധന കുടിശ്ശികയാണ്",
                                  auditLog: [
                                    { titleEn: "Application Submitted Online", titleMl: "അപേക്ഷ ഓൺലൈനായി സമർപ്പിച്ചു", date: "05 Oct 2026", status: "completed" },
                                    { titleEn: "Document Verification in Progress", titleMl: "രേഖാ പരിശോധന പുരോഗമിക്കുന്നു", date: "06 Oct 2026", status: "current" },
                                    { titleEn: "Field Level Verification", titleMl: "ഫീൽഡ് തല പരിശോധന", date: "Pending", status: "upcoming" },
                                  ],
                                });
                                setMobileSubPage("app_detail");
                              }}
                              className="p-3 rounded-2xl bg-[#FFFDF3] dark:bg-amber-950/20 border border-[#FEF3C7] dark:border-amber-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-black text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 px-2 py-0.5 rounded-full uppercase">
                                  {lang === "ml" ? "സ്കോളർഷിപ്പ്" : "Scholarship"}
                                </span>
                                <span className="text-[9.5px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-md inline-flex items-center gap-1">
                                  <Hourglass className="h-2.5 w-2.5" />
                                  {lang === "ml" ? "പെൻഡിംഗ്" : "Pending Verification"}
                                </span>
                              </div>
                              <h5 className="font-bold text-[12.5px] text-[#0f172a] dark:text-white leading-tight mt-1.5">
                                {lang === "ml" ? "പ്രതിഭാ മെരിറ്റ് സ്കോളർഷിപ്പ്" : "Pratibha Merit Scholarship"}
                              </h5>
                              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                                {lang === "ml" ? "അപേക്ഷകൻ: അനന്യ രമേശ് · കഴക്കൂട്ടം" : "Applicant: Ananya Ramesh · Kazhakkoottam"}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 mt-2 text-[10px] text-slate-500 font-medium">
                                <span>Ref: APP-2026-8910</span>
                                <span className="flex items-center gap-1 text-amber-700 font-bold">
                                  {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Item 2: Assisted */}
                          {matchAppSearch("assisted", "Karunya Health Insurance", "കാരുണ്യ ആരോഗ്യ ഇൻഷുറൻസ്", "Lakshmi Amma", "ലക്ഷ്മി അമ്മ", "Health Insurance", "ആരോഗ്യം", "APP-2026-8922") && (
                            <div 
                              onClick={() => {
                                setSelectedApplicationRecord({
                                  ref: "APP-2026-8922",
                                  schemeNameEn: "Karunya Health Insurance",
                                  schemeNameMl: "കാരുണ്യ ആരോഗ്യ ഇൻഷുറൻസ്",
                                  categoryEn: "Health Insurance",
                                  categoryMl: "ആരോഗ്യം",
                                  status: "approved",
                                  applicantNameEn: "Lakshmi Amma",
                                  applicantNameMl: "ലക്ഷ്മി അമ്മ",
                                  aadhaar: "XXXX-XXXX-8922",
                                  phone: "+91 98470 11223",
                                  locationEn: "Vattiyoorkavu, Thiruvananthapuram",
                                  locationMl: "വട്ടിയൂർക്കാവ്, തിരുവനന്തപുരം",
                                  annualIncome: "₹ 75,000",
                                  appliedDate: "03/10/2026",
                                  currentStep: 4,
                                  pendingDocs: ["Ration Card Copy", "Doctor Certificate"],
                                  nextActionEn: "Sanction letter generated. Financial claim process ready.",
                                  nextActionMl: "അനുമതി പത്രം തയാറായി. ധനസഹായ തുക നൽകാൻ വിവരങ്ങൾ ക്രമീകരിച്ചു.",
                                  auditLog: [
                                    { titleEn: "Application Received", titleMl: "അപേക്ഷ ലഭിച്ചു", date: "03 Oct 2026", status: "completed" },
                                    { titleEn: "Document Verification Completed", titleMl: "രേഖാ പരിശോധന പൂർത്തിയായി", date: "04 Oct 2026", status: "completed" },
                                    { titleEn: "District Medical Sanction", titleMl: "ജില്ലാ മെഡിക്കൽ അനുമതി", date: "05 Oct 2026", status: "completed" },
                                  ],
                                });
                                setMobileSubPage("app_detail");
                              }}
                              className="p-3 rounded-2xl bg-[#F0FDF4] dark:bg-teal-950/20 border border-[#DCFCE7] dark:border-teal-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-black text-teal-800 dark:text-teal-300 bg-teal-100/90 dark:bg-teal-950/80 px-2 py-0.5 rounded-full uppercase">
                                  {lang === "ml" ? "ആരോഗ്യം" : "Health Insurance"}
                                </span>
                                <span className="text-[9.5px] font-bold text-teal-700 bg-teal-100 px-2 py-0.2 rounded-md inline-flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  {lang === "ml" ? "സഹായം ലഭിച്ചു" : "Approved & Assisted"}
                                </span>
                              </div>
                              <h5 className="font-bold text-[12.5px] text-[#0f172a] dark:text-white leading-tight mt-1.5">
                                {lang === "ml" ? "കാരുണ്യ ആരോഗ്യ ഇൻഷുറൻസ്" : "Karunya Health Insurance"}
                              </h5>
                              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                                {lang === "ml" ? "അപേക്ഷക: ലക്ഷ്മി അമ്മ · വട്ടിയൂർക്കാവ്" : "Applicant: Lakshmi Amma · Vattiyoorkavu"}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-teal-200/60 mt-2 text-[10px] text-slate-500 font-medium">
                                <span>Ref: APP-2026-8922</span>
                                <span className="flex items-center gap-1 text-teal-700 font-bold">
                                  {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Item 3: Pending */}
                          {matchAppSearch("pending", "PM Kisan Samman Nidhi", "പിഎം-കിസാൻ സമ്മാൻ നിധി", "K. Krishnan", "കെ. കൃഷ്ണൻ", "Agriculture", "കൃഷി", "APP-2026-8925") && (
                            <div 
                              onClick={() => {
                                setSelectedApplicationRecord({
                                  ref: "APP-2026-8925",
                                  schemeNameEn: "PM Kisan Samman Nidhi",
                                  schemeNameMl: "പിഎം-കിസാൻ സമ്മാൻ നിധി",
                                  categoryEn: "Agriculture",
                                  categoryMl: "കൃഷി",
                                  status: "pending",
                                  applicantNameEn: "K. Krishnan",
                                  applicantNameMl: "കെ. കൃഷ്ണൻ",
                                  aadhaar: "XXXX-XXXX-8925",
                                  phone: "+91 98463 87654",
                                  locationEn: "Palakkad North, Palakkad",
                                  locationMl: "പാലക്കാട് നോർത്ത്, പാലക്കാട്",
                                  annualIncome: "₹ 90,000",
                                  appliedDate: "01/10/2026",
                                  currentStep: 2,
                                  pendingDocs: ["Land Tax Receipt", "Aadhaar e-KYC Verification"],
                                  nextActionEn: "Pending e-KYC validation via Biometric / OTP",
                                  nextActionMl: "ബയോമെട്രിക് / ഒടിപി വഴി ഇ-കെവൈസി പരിശോധന പൂർത്തിയാക്കുക",
                                  auditLog: [
                                    { titleEn: "Application Registered", titleMl: "അപേക്ഷ രജിസ്റ്റർ ചെയ്തു", date: "01 Oct 2026", status: "completed" },
                                    { titleEn: "Land Record Audit", titleMl: "ഭൂമി വിവര പരിശോധന", date: "03 Oct 2026", status: "completed" },
                                    { titleEn: "Bank Aadhar Seeding", titleMl: "ബാങ്ക് ആധാർ ലിങ്കിംഗ്", date: "Pending", status: "current" },
                                  ],
                                });
                                setMobileSubPage("app_detail");
                              }}
                              className="p-3 rounded-2xl bg-[#FFFDF3] dark:bg-amber-950/20 border border-[#FEF3C7] dark:border-amber-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-black text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 px-2 py-0.5 rounded-full uppercase">
                                  {lang === "ml" ? "കൃഷി" : "Agriculture"}
                                </span>
                                <span className="text-[9.5px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-md inline-flex items-center gap-1">
                                  <Hourglass className="h-2.5 w-2.5" />
                                  {lang === "ml" ? "പെൻഡിംഗ്" : "Document Review Pending"}
                                </span>
                              </div>
                              <h5 className="font-bold text-[12.5px] text-[#0f172a] dark:text-white leading-tight mt-1.5">
                                {lang === "ml" ? "പിഎം-കിസാൻ സമ്മാൻ നിധി" : "PM Kisan Samman Nidhi"}
                              </h5>
                              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                                {lang === "ml" ? "അപേക്ഷകൻ: കെ. കൃഷ്ണൻ · പാലക്കാട്" : "Applicant: K. Krishnan · Palakkad"}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 mt-2 text-[10px] text-slate-500 font-medium">
                                <span>Ref: APP-2026-8925</span>
                                <span className="flex items-center gap-1 text-amber-700 font-bold">
                                  {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Item 4: Rejected */}
                          {matchAppSearch("rejected", "LIFE Mission Housing Title", "ലൈഫ് മിഷൻ ഭവന പദ്ധതി", "Joseph K", "ജോസഫ് കെ", "Housing", "ഭവന നിർമ്മാണം", "APP-2026-8927") && (
                            <div 
                              onClick={() => {
                                setSelectedApplicationRecord({
                                  ref: "APP-2026-8927",
                                  schemeNameEn: "LIFE Mission Housing Title",
                                  schemeNameMl: "ലൈഫ് മിഷൻ ഭവന പദ്ധതി",
                                  categoryEn: "Housing",
                                  categoryMl: "ഭവന നിർമ്മാണം",
                                  status: "rejected",
                                  applicantNameEn: "Joseph K",
                                  applicantNameMl: "ജോസഫ് കെ",
                                  aadhaar: "XXXX-XXXX-8927",
                                  phone: "+91 98952 66778",
                                  locationEn: "Chathannoor, Kollam",
                                  locationMl: "ചാത്തന്നൂർ, കൊല്ലം",
                                  annualIncome: "₹ 1,80,000",
                                  appliedDate: "29/09/2026",
                                  currentStep: 3,
                                  pendingDocs: ["Ownership Title Deed"],
                                  nextActionEn: "Rejected due to income limit exceeding eligibility criteria",
                                  nextActionMl: "വരുമാന പരിധി യോഗ്യതാ മാനദണ്ഡത്തിൽ കൂടുതൽ ആയതിനാൽ നിരസിച്ചു",
                                  auditLog: [
                                    { titleEn: "Application Submitted", titleMl: "അപേക്ഷ സമർപ്പിച്ചു", date: "29 Sep 2026", status: "completed" },
                                    { titleEn: "Field Verification Inspection", titleMl: "ഫീൽഡ് തല പരിശോധന", date: "02 Oct 2026", status: "completed" },
                                    { titleEn: "Application Rejected", titleMl: "അപേക്ഷ നിരസിച്ചു", date: "04 Oct 2026", status: "completed" },
                                  ],
                                });
                                setMobileSubPage("app_detail");
                              }}
                              className="p-3 rounded-2xl bg-[#FFF5F5] dark:bg-rose-950/20 border border-[#FFE4E6] dark:border-rose-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-black text-rose-800 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/80 px-2 py-0.5 rounded-full uppercase">
                                  {lang === "ml" ? "ഭവന നിർമ്മാണം" : "Housing"}
                                </span>
                                <span className="text-[9.5px] font-bold text-rose-700 bg-rose-100 px-2 py-0.2 rounded-md inline-flex items-center gap-1">
                                  <XCircle className="h-2.5 w-2.5" />
                                  {lang === "ml" ? "നിരസിച്ചു" : "Rejected"}
                                </span>
                              </div>
                              <h5 className="font-bold text-[12.5px] text-[#0f172a] dark:text-white leading-tight mt-1.5">
                                {lang === "ml" ? "ലൈഫ് മിഷൻ ഭവന പദ്ധതി" : "LIFE Mission Housing Title"}
                              </h5>
                              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                                {lang === "ml" ? "അപേക്ഷകൻ: ജോസഫ് കെ · ചാത്തന്നൂർ" : "Applicant: Joseph K · Chathannoor"}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-rose-200/60 mt-2 text-[10px] text-slate-500 font-medium">
                                <span>Ref: APP-2026-8927</span>
                                <span className="flex items-center gap-1 text-rose-700 font-bold">
                                  {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Item 5: Assisted */}
                          {matchAppSearch("assisted", "Karunya Health Insurance", "കാരുണ്യ ആരോഗ്യ ഇൻഷുറൻസ്", "Lakshmi Amma", "ലക്ഷ്മി അമ്മ", "Health Insurance", "ആരോഗ്യം", "APP-2026-8922") && (
                            <div 
                              onClick={() => {
                                setSelectedApplicationRecord({
                                  ref: "APP-2026-8921",
                                  schemeNameEn: "Vayoshreshtha Pension Scheme",
                                  schemeNameMl: "വയോശ്രേഷ്ഠ പെൻഷൻ",
                                  categoryEn: "Pension",
                                  categoryMl: "പെൻഷൻ",
                                  status: "disbursed",
                                  applicantNameEn: "Soman P",
                                  applicantNameMl: "സോമൻ പി",
                                  aadhaar: "XXXX-XXXX-8921",
                                  phone: "+91 94471 23456",
                                  locationEn: "Kazhakkoottam, Thiruvananthapuram",
                                  locationMl: "കഴക്കൂട്ടം, തിരുവനന്തപുരം",
                                  annualIncome: "₹ 60,000",
                                  appliedDate: "04/10/2026",
                                  currentStep: 5,
                                  pendingDocs: ["Age Proof Certificate", "Bank Passbook Copy"],
                                  nextActionEn: "Monthly pension disbursed directly to DBT linked bank account",
                                  nextActionMl: "പ്രതിമാസ പെൻഷൻ ഡിബിടി ബാങ്ക് അക്കൗണ്ടിലേക്ക് അയച്ചു നൽകി",
                                  auditLog: [
                                    { titleEn: "Application Submitted", titleMl: "അപേക്ഷ സമർപ്പിച്ചു", date: "04 Oct 2026", status: "completed" },
                                    { titleEn: "Verification & Approval", titleMl: "പരിശോധനയും അംഗീകാരവും", date: "05 Oct 2026", status: "completed" },
                                    { titleEn: "First Pension Disbursed", titleMl: "ആദ്യ പെൻഷൻ ലഭിച്ചു", date: "06 Oct 2026", status: "completed" },
                                  ],
                                });
                                setMobileSubPage("app_detail");
                              }}
                              className="p-3 rounded-2xl bg-[#F0FDF4] dark:bg-teal-950/20 border border-[#DCFCE7] dark:border-teal-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-black text-teal-800 dark:text-teal-300 bg-teal-100/90 dark:bg-teal-950/80 px-2 py-0.5 rounded-full uppercase">
                                  {lang === "ml" ? "പെൻഷൻ" : "Pension"}
                                </span>
                                <span className="text-[9.5px] font-bold text-teal-700 bg-teal-100 px-2 py-0.2 rounded-md inline-flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  {lang === "ml" ? "സഹായം ലഭിച്ചു" : "Disbursed"}
                                </span>
                              </div>
                              <h5 className="font-bold text-[12.5px] text-[#0f172a] dark:text-white leading-tight mt-1.5">
                                {lang === "ml" ? "വയോശ്രേഷ്ഠ പെൻഷൻ" : "Vayoshreshtha Pension Scheme"}
                              </h5>
                              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                                {lang === "ml" ? "അപേക്ഷകൻ: സോമൻ പി · തിരുവനന്തപുരം" : "Applicant: Soman P · Thiruvananthapuram"}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-teal-200/60 mt-2 text-[10px] text-slate-500 font-medium">
                                <span>Ref: APP-2026-8921</span>
                                <span className="flex items-center gap-1 text-teal-700 font-bold">
                                  {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage 4: Beneficiaries Page */}

                    {/* Dedicated Subpage 4: Beneficiaries Page */}


                    {/* Dedicated Subpage 4: Beneficiaries Page */}
                    {mobileSubPage === "beneficiaries" && (
                      <div className="space-y-3 pt-0.5 animate-in fade-in duration-200">
                        {/* Subpage Header with Back Navigation Button and Period / Filter Pill */}
                        <div className="flex items-center justify-between border-b border-border/80 pb-2 gap-1">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#ff5500] hover:text-orange-600 cursor-pointer shrink-0"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "ഗുണഭോക്താക്കളുടെ പട്ടിക" : "Beneficiaries List"}</span>
                          </button>

                          {/* Period Selector & Filter Action in Header */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="flex items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs hover:border-slate-300 transition-all min-h-[28px] max-w-[150px] sm:max-w-[180px]">
                              <div className="flex items-center gap-0.5 min-w-0 flex-1 justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(-1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Previous Period"
                                >
                                  <ChevronLeft className="h-3 w-3 stroke-[2.4]" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setIsDatePickerOpen(true)}
                                  className="text-[9.5px] sm:text-[10px] font-extrabold text-[#0a0f1d] dark:text-slate-100 hover:text-[#ff5500] transition-colors cursor-pointer px-0.5 tracking-tight truncate"
                                  title="Click to Open Date Picker"
                                >
                                  {getFormattedPeriodDisplay()}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStepPeriod(1)}
                                  className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Next Period"
                                >
                                  <ChevronRight className="h-3 w-3 stroke-[2.4]" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setIsDatePickerOpen(true)}
                                className="p-0.5 rounded-full text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-800 pl-1 ml-0.5 shrink-0"
                                title="Open Date Picker"
                              >
                                <Calendar className="h-3 w-3 stroke-[2.2]" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowFilterMenu(!showFilterMenu)}
                              className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                                showFilterMenu
                                  ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                                  : "border-amber-200/60 dark:border-slate-800 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 hover:bg-amber-100/50"
                              }`}
                              title="Toggle Filters"
                            >
                              <Filter className={`h-3.5 w-3.5 stroke-[2.2] shrink-0 ${showFilterMenu ? "text-white" : "text-[#ff5500]"}`} />
                            </button>
                          </div>
                        </div>

                        {/* Top 2 KPI / Stats Cards: Matching Dashboard & User Page KPI Style */}
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          {/* 1. Beneficiaries KPI Card */}
                          <div className="p-2.5 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
                                {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                              </span>
                              <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-orange-500 to-[#ff5500] flex items-center justify-center text-white shrink-0 shadow-2xs">
                                <HeartHandshake className="h-2.5 w-2.5 stroke-[2.5]" />
                              </div>
                            </div>
                            <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-1">
                              {currentMetrics.beneficiaries.toLocaleString()}
                            </div>
                          </div>

                          {/* 2. Applications KPI Card */}
                          <div className="p-2.5 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
                                {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                              </span>
                              <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                                <FileText className="h-2.5 w-2.5 stroke-[2.5]" />
                              </div>
                            </div>
                            <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-1">
                              {applicationsCount.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Search & Category Filter */}
                        <div className="space-y-1">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                              type="text"
                              value={beneficiarySearchQuery}
                              onChange={(e) => setBeneficiarySearchQuery(e.target.value)}
                              placeholder={lang === "ml" ? "പേര്, വിഭാഗം, സ്ഥലം, പദ്ധതി സെർച്ച് ചെയ്യുക..." : "Search name, user type, location, scheme..."}
                              className="w-full rounded-xl border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                            />
                          </div>

                          {/* Quick Category Filter Pills (Requested User Types) */}
                          <div className="flex items-center gap-1 overflow-x-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-[1px] pb-0.5 text-[10px]">
                            {[
                              { id: "ALL", labelEn: "All", labelMl: "എല്ലാം" },
                              { id: "Public Citizen", labelEn: "Public Citizen", labelMl: "പൊതുജനങ്ങൾ" },
                              { id: "BJP Member", labelEn: "BJP Member", labelMl: "ബി.ജെ.പി അംഗം" },
                              { id: "Politician", labelEn: "Politician", labelMl: "രാഷ്ട്രീയ നേതാവ്" },
                              { id: "People’s Representative", labelEn: "People’s Representative", labelMl: "ജനപ്രതിനിധി" },
                            ].map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setBeneficiaryCategoryFilter(cat.id)}
                                className={`px-2.5 py-1 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                                  beneficiaryCategoryFilter === cat.id
                                    ? "bg-orange-500 text-white shadow-2xs"
                                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                              >
                                {lang === "ml" ? cat.labelMl : cat.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>


                        {/* Beneficiary List Items */}
                        <div className="space-y-2">
                          {filteredBeneficiariesList.map((b) => (
                            <div
                              key={b.id}
                              className="p-2.5 rounded-xl border border-border bg-card shadow-2xs hover:border-orange-300 dark:hover:border-orange-800 transition-all space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                    {b.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <h5 className="font-bold text-xs text-foreground truncate">
                                        {lang === "ml" ? b.nameMl : b.name}
                                      </h5>
                                      {(b.category === "BJP Member" || b.category === "BJP Members") && (
                                        <PartyFlagIcon className="h-3.5 w-5 rounded-[2px]" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                      <MapPin className="h-3 w-3 text-orange-500 shrink-0" />
                                      <span className="truncate">{b.location}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* User Category Badge */}
                                <span className="inline-flex items-center text-[9.5px] font-extrabold text-orange-700 dark:text-orange-300 bg-orange-500/10 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/60 px-2 py-0.5 rounded-md shrink-0">
                                  <span>{lang === "ml" ? (b.categoryMl || b.category) : b.category}</span>
                                </span>
                              </div>

                              <div className="pt-1.5 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
                                <div className="min-w-0">
                                  <span className="text-[9.5px] font-semibold text-muted-foreground block leading-tight">
                                    {lang === "ml" ? "പദ്ധതി:" : "Scheme:"}
                                  </span>
                                  <span className="font-bold text-foreground text-[11px] truncate block">
                                    {b.scheme}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <a
                                    href={`tel:${b.phone}`}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                                    title="Call Beneficiary"
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                  </a>
                                  <a
                                    href={`https://wa.me/${b.phone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                                    title="WhatsApp Beneficiary"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage: Events & Announcements Page */}
                    {mobileSubPage === "events_announcements" && (
                      <div className="space-y-3 pt-0.5 animate-in fade-in duration-200">
                        {/* Top Bar: Back Button + Sub-Tabs directly on top */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer shrink-0"
                            title={lang === "ml" ? "തിരികെ പോവുക" : "Go back"}
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                          </button>

                          {/* Two Sub-Tabs: Events & Announcements */}
                          <div className="grid grid-cols-2 gap-1.5 p-1 flex-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs font-extrabold">
                            <button
                              type="button"
                              onClick={() => setEventsSubTab("events")}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                                eventsSubTab === "events"
                                  ? "bg-white dark:bg-slate-900 text-[#ff5500] dark:text-orange-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>{lang === "ml" ? "പരിപാടികൾ" : "Events"}</span>
                              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                                eventsSubTab === "events"
                                  ? "bg-orange-100 text-[#ff5500] dark:bg-orange-950 dark:text-orange-300"
                                  : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                              }`}>
                                4
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEventsSubTab("announcements")}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                                eventsSubTab === "announcements"
                                  ? "bg-white dark:bg-slate-900 text-[#ff5500] dark:text-orange-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              <BellRing className="h-3.5 w-3.5" />
                              <span>{lang === "ml" ? "അറിയിപ്പുകൾ" : "Announcements"}</span>
                              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                                eventsSubTab === "announcements"
                                  ? "bg-orange-100 text-[#ff5500] dark:bg-orange-950 dark:text-orange-300"
                                  : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                              }`}>
                                4
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Tab Content List */}
                        <div className="space-y-3 pt-1">
                          {eventsSubTab === "events" ? (
                            /* Render Events List */
                            <div className="space-y-2.5">
                              {/* Event 1 */}
                              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-3 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-[#800f13] bg-red-50 dark:bg-red-950/80 border border-red-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {lang === "ml" ? "ബൂത്ത് സമ്മേളനം" : "BOOTH CONVENTION"}
                                    </span>
                                  </div>
                                  <h4 className="font-display text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    VIKASITA KERALAM SAMMELAN 2026
                                  </h4>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                    {lang === "ml" ? "സംസ്ഥാനതല മെഗാ ബൂത്ത് സമ്മേളനം" : "Statewide Mega Booth Worker Convention in TVM"}
                                  </p>
                                  <div className="pt-1">
                                    <span className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider">
                                      {lang === "ml" ? "രജിസ്റ്റർ ചെയ്യുക" : "REGISTER NOW"}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 rounded-lg p-2 bg-[#800f13] text-white flex flex-col items-center justify-center min-w-[50px] text-center shadow-xs">
                                  <span className="text-[8px] font-black uppercase">OCT</span>
                                  <span className="text-base font-black leading-none my-0.5">15</span>
                                  <span className="text-[7px] font-bold opacity-90">2026</span>
                                </div>
                              </div>

                              {/* Event 2 */}
                              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-3 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-orange-700 bg-orange-50 dark:bg-orange-950/80 border border-orange-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {lang === "ml" ? "യുവമോർച്ച റാലി" : "YOUTH RALLY"}
                                    </span>
                                  </div>
                                  <h4 className="font-display text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    YUVA VIKAS YATRA & CONCLAVE
                                  </h4>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                    {lang === "ml" ? "തിരുവനന്തപുരത്ത് 50,000+ യുവ പ്രതിനിധികൾ" : "50,000+ Youth Leaders Gathering in TVM"}
                                  </p>
                                  <div className="pt-1">
                                    <span className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider">
                                      {lang === "ml" ? "പങ്കെടുക്കുക" : "JOIN YATRA"}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 rounded-lg p-2 bg-[#ea580c] text-white flex flex-col items-center justify-center min-w-[50px] text-center shadow-xs">
                                  <span className="text-[8px] font-black uppercase">NOV</span>
                                  <span className="text-base font-black leading-none my-0.5">02</span>
                                  <span className="text-[7px] font-bold opacity-90">2026</span>
                                </div>
                              </div>

                              {/* Event 3 */}
                              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-3 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-teal-700 bg-teal-50 dark:bg-teal-950/80 border border-teal-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {lang === "ml" ? "ഗുണഭോക്തൃ സംഗമം" : "BENEFICIARY MEET"}
                                    </span>
                                  </div>
                                  <h4 className="font-display text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    CENTRAL SCHEMES EXPO
                                  </h4>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                    {lang === "ml" ? "കേന്ദ്ര മന്ത്രിമാരുമായുള്ള ഗുണഭോക്തൃ സംവാദം" : "Interactive Session with Union Ministers at Kochi"}
                                  </p>
                                  <div className="pt-1">
                                    <span className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider">
                                      {lang === "ml" ? "സന്ദർശിക്കുക" : "ATTEND EXPO"}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 rounded-lg p-2 bg-[#0d9488] text-white flex flex-col items-center justify-center min-w-[50px] text-center shadow-xs">
                                  <span className="text-[8px] font-black uppercase">NOV</span>
                                  <span className="text-base font-black leading-none my-0.5">20</span>
                                  <span className="text-[7px] font-bold opacity-90">2026</span>
                                </div>
                              </div>

                              {/* Event 4 */}
                              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-3 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8.5px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {lang === "ml" ? "മഹിളാ സമ്മേളനം" : "MAHILA SAMMELAN"}
                                    </span>
                                  </div>
                                  <h4 className="font-display text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    NARI SHAKTI VIKAS CONCLAVE
                                  </h4>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                    {lang === "ml" ? "വനിതാ സംരംഭകത്വ സംസ്ഥാന സമ്മേളനം" : "Empowering Women Entrepreneurs in Kozhikode"}
                                  </p>
                                  <div className="pt-1">
                                    <span className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider">
                                      {lang === "ml" ? "പാസ് നേടുക" : "GET PASS"}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 rounded-lg p-2 bg-[#15803d] text-white flex flex-col items-center justify-center min-w-[50px] text-center shadow-xs">
                                  <span className="text-[8px] font-black uppercase">DEC</span>
                                  <span className="text-base font-black leading-none my-0.5">10</span>
                                  <span className="text-[7px] font-bold opacity-90">2026</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Render Announcements & Banners List */
                            <div className="space-y-2.5">
                              {/* Announcement Banner 1: PM Schemes */}
                              <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-[85px] w-full cursor-pointer group">
                                <img
                                  src="/images/pm_schemes_explore_now.png"
                                  alt="Explore PM Schemes - Viksit Bharat"
                                  className="h-full w-full object-fill group-hover:scale-102 transition-transform duration-300"
                                />
                              </div>

                              {/* Announcement Banner 2: Sabka Saath Sabka Vikas */}
                              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#800f13] via-[#a3161a] to-[#590a0d] text-white shadow-xs border border-red-900/50 p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-2 space-y-1">
                                  <span className="inline-block rounded-md bg-red-500 text-white px-2 py-0.2 text-[8px] font-black uppercase tracking-wider">
                                    {lang === "ml" ? "മോദിയുടെ ഗ്യാരണ്ടി" : "MODI'S GUARANTEE"}
                                  </span>
                                  <h4 className="font-display text-xs font-black text-white leading-tight">
                                    SABKA SAATH · SABKA VIKAS
                                  </h4>
                                  <p className="text-[10px] text-[#ffffff] font-semibold">
                                    {lang === "ml" ? "സബ്കാ സാഥ്, സബ്കാ വികാസ്, സബ്കാ വിശ്വാസ്" : "Sabka Vishwas · Sabka Prayaas (2047 Vision)"}
                                  </p>
                                </div>
                                <div className="shrink-0 h-10 w-10 rounded-full bg-red-950/70 border border-red-400/40 p-1 flex items-center justify-center shadow-xs">
                                  <img src={officialLotus} alt="Lotus" className="h-6 w-6 object-contain" />
                                </div>
                              </div>

                              {/* Announcement Banner 3: Direct Benefit Transfer */}
                              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#15803d] via-emerald-700 to-[#065f46] text-white shadow-xs border border-emerald-600/50 p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-2 space-y-1">
                                  <span className="inline-block rounded-md bg-amber-400 text-amber-950 px-2 py-0.2 text-[8px] font-black uppercase tracking-wider">
                                    {lang === "ml" ? "പി.എം കിസാൻ" : "PM KISAN SAMMAN"}
                                  </span>
                                  <h4 className="font-display text-xs font-black text-white leading-tight">
                                    DIRECT BENEFIT TRANSFER ₹6,000
                                  </h4>
                                  <p className="text-[10px] text-emerald-100/90">
                                    {lang === "ml" ? "കേരളത്തിലെ 35 ലക്ഷം കർഷകർക്ക് നേട്ടങ്ങൾ" : "Empowering 35 Lakh Farmers Across Kerala"}
                                  </p>
                                </div>
                                <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-950/70 border border-amber-300/40 p-1 flex items-center justify-center shadow-xs">
                                  <img src={officialLotus} alt="Lotus" className="h-6 w-6 object-contain" />
                                </div>
                              </div>

                              {/* Announcement Banner 4: Ayushman Bharat */}
                              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/90 dark:border-slate-800 p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-2 space-y-1">
                                  <span className="inline-block rounded-md bg-[#ff5500] text-white px-2 py-0.2 text-[8px] font-black uppercase tracking-wider">
                                    {lang === "ml" ? "ആയുഷ്മാൻ ഭാരത്" : "AYUSHMAN BHARAT"}
                                  </span>
                                  <h4 className="font-display text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    FREE HEALTH COVERAGE UP TO ₹5 LAKH
                                  </h4>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                    {lang === "ml" ? "സൗജന്യ സമഗ്ര കുടുംബ ആരോഗ്യ സുരക്ഷാ പദ്ധതി" : "Cashless Medical Treatment for All Families"}
                                  </p>
                                </div>
                                <div className="shrink-0 h-10 w-10 rounded-full bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 p-1 flex items-center justify-center shadow-xs">
                                  <img src={officialLotus} alt="Lotus" className="h-6 w-6 object-contain" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "schemes" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {mobileSubPage === "category_schemes" && selectedSchemeCategoryDetail ? (
                  /* Separate Category Schemes Page view */
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
                    {/* Back Header */}
                    <div className="flex items-center justify-between bg-[#fffcf0] dark:bg-slate-800/80 p-2.5 rounded-xl border border-amber-200/80 dark:border-slate-700/60 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileSubPage("none");
                          setSelectedSchemeCategoryDetail(null);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#ff5500] hover:text-orange-600 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
                        <span>{lang === "ml" ? "തിരികെ പദ്ധതികളിലേക്ക്" : "Back to Schemes"}</span>
                      </button>
                      <span className="text-[10px] font-extrabold text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-950/70 border border-orange-200/80 dark:border-orange-900/60 px-2.5 py-0.5 rounded-full">
                        {selectedSchemeCategoryDetail.count} {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                      </span>
                    </div>

                    {/* Category Title Header */}
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-purple-500/10 border border-orange-200/60 dark:border-orange-900/40">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800">
                        {lang === "ml" ? selectedSchemeCategoryDetail.categoryLabelMl : selectedSchemeCategoryDetail.categoryLabelEn}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#0a0f1d] dark:text-white leading-tight mt-1.5">
                        {lang === "ml" ? selectedSchemeCategoryDetail.titleMl : selectedSchemeCategoryDetail.titleEn}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {lang === "ml" ? "ലഭ്യമായ പദ്ധതികളും അപേക്ഷ പ്രക്രിയകളും ചുവടെ കാണുക" : "Browse available schemes, eligibility criteria, and instant application options below."}
                      </p>
                    </div>

                    {/* Scheme Cards for Category */}
                    <div className="space-y-3 pt-1">
                      {/* Scheme 1 */}
                      {(schemeSourceFilter === "all" || schemeSourceFilter === "central") && (
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span className="text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded-md">
                              {lang === "ml" ? "കേന്ദ്ര സർക്കാർ" : "Central Government"}
                            </span>
                            <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {lang === "ml" ? "അപേക്ഷിക്കാം" : "Accepting Applications"}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-snug">
                            {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "പിഎം-കിസാൻ സമ്മാൻ നിധി" : "PM Kisan Samman Nidhi")}
                            {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "ആയുഷ്മാൻ ഭാരത് - പിഎം-ജയ്" : "Ayushman Bharat - PM-JAY Health Protection")}
                            {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "ഇന്ദിരാഗാന്ധി ദേശീയ വാർദ്ധക്യ പെൻഷൻ" : "Indira Gandhi National Old Age Pension (IGNOAP)")}
                            {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "പിഎംഎവൈ ഭവന പദ്ധതി (ഗ്രാമീൺ / അർബൻ)" : "Pradhan Mantri Awas Yojana (PMAY Housing)")}
                            {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "കേന്ദ്ര സർക്കാർ സുരക്ഷാ പദ്ധതി" : "National Welfare & Financial Support Program")}
                          </h5>

                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "കൃഷി മന്ത്രാലയം, ഭാരത സർക്കാർ" : "Ministry of Agriculture & Farmers Welfare, Govt of India")}
                            {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "ദേശീയ ആരോഗ്യ അതോറിറ്റി" : "National Health Authority, Govt of India")}
                            {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "ഗ്രാമീണ വികസന മന്ത്രാലയം" : "Ministry of Rural Development, Govt of India")}
                            {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "പാർപ്പിട നഗരകാര്യ മന്ത്രാലയം" : "Ministry of Housing & Urban Affairs, Govt of India")}
                            {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "കേന്ദ്ര വികസന മന്ത്രാലയം" : "Central Nodal Department, Govt of India")}
                          </p>

                          <div className="mt-2.5 p-2 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 text-[11px]">
                            <div className="font-extrabold text-orange-800 dark:text-orange-300">
                              {lang === "ml" ? "ആനുകൂല്യം:" : "Financial Benefit:"}
                              <span className="font-medium text-slate-700 dark:text-slate-300 ml-1">
                                {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "പ്രതിവർഷം ₹6,000 (3 ഗഡുക്കളായി)" : "₹6,000 / year direct bank transfer (3 installments)")}
                                {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "കുടുംബത്തിന് പ്രതിവർഷം ₹5 ലക്ഷം ചികിത്സാ സഹായം" : "₹5 Lakh / year free hospitalization per family")}
                                {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "പ്രതിമാസം ₹1,600 സാമ്പത്തിക പെൻഷൻ" : "₹1,600 / month direct financial pension transfer")}
                                {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "വീട് നിർമ്മാണത്തിന് ₹2.50 ലക്ഷം വരെ ധനസഹായം" : "Up to ₹2.50 Lakh financial grant for house construction")}
                                {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "നേരിട്ടുള്ള സാമ്പത്തിക സഹായം & സബ്‌സിഡി" : "Direct financial assistance & subsidy transfer")}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                              <span className="font-bold text-slate-600 dark:text-slate-300">{lang === "ml" ? "യോഗ്യത:" : "Eligibility:"} </span>
                              {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "സ്വന്തമായി കൃഷിഭൂമിയുള്ള എല്ലാ കർഷക കുടുംബങ്ങളും" : "Small & marginal farmers holding cultivable land")}
                              {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "എസ്‌ഇസിസി കണക്കെടുപ്പ് പ്രകാരം മുൻഗണനാ വിഭാഗങ്ങൾ" : "Low-income & SECC priority household members")}
                              {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "60 വയസ്സിന് മുകളിലുള്ള ബിപിഎൽ മുതിർന്ന പൗരന്മാർ" : "Senior citizens aged 60+ living below poverty line")}
                              {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "സ്വന്തമായി പക്കാ വീടില്ലാത്ത താഴ്ന്ന വരുമാനക്കാർ" : "Homeless or EWS households without pucca housing")}
                              {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "കേരളത്തിലെ സ്ഥിര താമസക്കാരും യോഗ്യതയുള്ളവരും" : "Eligible resident citizens of Kerala")}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {lang === "ml" ? "ഓൺലൈനായി അപേക്ഷിക്കാം" : "Online Application Enabled"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const schemeTitle =
                                  selectedSchemeCategoryDetail.id === "agriculture"
                                    ? (lang === "ml" ? "പിഎം-കിസാൻ സമ്മാൻ നിധി" : "PM Kisan Samman Nidhi")
                                    : selectedSchemeCategoryDetail.id === "healthcare"
                                    ? (lang === "ml" ? "ആയുഷ്മാൻ ഭാരത് - പിഎം-ജയ്" : "Ayushman Bharat - PM-JAY Health Protection")
                                    : selectedSchemeCategoryDetail.id === "pension"
                                    ? (lang === "ml" ? "ഇന്ദിരാഗാന്ധി ദേശീയ വാർദ്ധക്യ പെൻഷൻ" : "Indira Gandhi National Old Age Pension (IGNOAP)")
                                    : selectedSchemeCategoryDetail.id === "housing"
                                    ? (lang === "ml" ? "പിഎംഎവൈ ഭവന പദ്ധതി (ഗ്രാമീൺ / അർബൻ)" : "Pradhan Mantri Awas Yojana (PMAY Housing)")
                                    : (lang === "ml" ? "കേന്ദ്ര സർക്കാർ സുരക്ഷാ പദ്ധതി" : "National Welfare & Financial Support Program");
                                setSelectedSchemeName(schemeTitle);
                                setActiveTab("create");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}</span>
                              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Scheme 2 */}
                      {(schemeSourceFilter === "all" || schemeSourceFilter === "state") && (
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span className="text-[9px] font-extrabold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-900/60 px-2 py-0.5 rounded-md">
                              {lang === "ml" ? "സംസ്ഥാന സർക്കാർ" : "State Government"}
                            </span>
                            <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {lang === "ml" ? "അപേക്ഷിക്കാം" : "Accepting Applications"}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-snug">
                            {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "സുഭിക്ഷ കേരളം കൃഷി സബ്‌സിഡി പദ്ധതി" : "Subhiksha Keralam Fallow Land Subsidy")}
                            {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "കാരുണ്യ ആരോഗ്യ സുരക്ഷാ പദ്ധതി (KASP)" : "Karunya Arogya Suraksha Padhathi (KASP)")}
                            {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "കേരള വയോശ്രേഷ്ഠ & കർഷക പെൻഷൻ" : "Kerala Social Security Pension & Vayoshreshtha")}
                            {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "ലൈഫ് മിഷൻ ഭവന നിർമ്മാണ പദ്ധതി" : "LIFE Mission Housing Scheme")}
                            {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "കേരള സംസ്ഥാന വികസന സഹായ പദ്ധതി" : "Kerala State Welfare & Beneficiary Scheme")}
                          </h5>

                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "കൃഷി വികസന കർഷകക്ഷേമ വകുപ്പ്, കേരളം" : "Dept of Agriculture Development & Farmers Welfare, Kerala")}
                            {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "ആരോഗ്യ കുടുംബക്ഷേമ വകുപ്പ്, കേരള സർക്കാർ" : "Health & Family Welfare Dept, Govt of Kerala")}
                            {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "സാമൂഹികനീതി വകുപ്പ്, കേരള സർക്കാർ" : "Social Justice Department, Govt of Kerala")}
                            {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "തദ്ദേശ സ്വയംഭരണ & ഭവന നിർമ്മാണ വകുപ്പ്" : "Local Self Govt & Housing Dept, Govt of Kerala")}
                            {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "സംസ്ഥാന നോഡൽ വകുപ്പ്, കേരളം" : "State Nodal Department, Govt of Kerala")}
                          </p>

                          <div className="mt-2.5 p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 text-[11px]">
                            <div className="font-extrabold text-purple-800 dark:text-purple-300">
                              {lang === "ml" ? "ആനുകൂല്യം:" : "Financial Benefit:"}
                              <span className="font-medium text-slate-700 dark:text-slate-300 ml-1">
                                {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "ഏക്കറിന് ₹10,000 വരെ കൃഷി സബ്‌സിഡി" : "Up to ₹10,000 / acre cultivation & seed subsidy")}
                                {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "രജിസ്റ്റർ ചെയ്ത ആശുപത്രികളിൽ സൗജന്യ ചികിത്സ" : "Cashless medical treatment up to ₹5 Lakh at empaneled hospitals")}
                                {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "പ്രതിമാസം ₹1,600 നേരിട്ടുള്ള ബാങ്ക് പെൻഷൻ" : "₹1,600 / month direct pension to bank account")}
                                {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "വീട് നിർമ്മാണത്തിന് ₹4.00 ലക്ഷം ധനസഹായം" : "₹4.00 Lakh financial grant for house construction in 4 stages")}
                                {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "സംസ്ഥാന തല സാമ്പത്തിക & സാമൂഹിക സുരക്ഷ" : "State financial grant and welfare subsidies")}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                              <span className="font-bold text-slate-600 dark:text-slate-300">{lang === "ml" ? "യോഗ്യത:" : "Eligibility:"} </span>
                              {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "വ്യക്തിഗത കർഷകരും കുടുംബശ്രീ ഗ്രൂപ്പുകളും" : "Individual farmers & Kudumbashree farming groups")}
                              {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "കേരളത്തിലെ ബിപിഎൽ & മുൻഗണനാ റേഷൻ കാർഡ് ഉടമകൾ" : "BPL & priority ration card holders resident in Kerala")}
                              {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "വാർഷിക വരുമാനം ₹1 ലക്ഷത്തിൽ താഴെയുള്ളവർ" : "Resident citizens with annual family income below ₹1 Lakh")}
                              {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "ഭൂമിയുള്ള ഭവനരഹിതർ & തദ്ദേശീയ പാവപ്പെട്ട കുടുംബങ്ങൾ" : "Landowning homeless families registered with Local Panchayat")}
                              {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "കേരളവാസികളായ അർഹരായ ഗുണഭോക്താക്കൾ" : "Eligible resident beneficiaries in Kerala")}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {lang === "ml" ? "അക്ഷയ സെന്റർ / ഓൺലൈൻ വഴി" : "Available via Akshaya & Online Portal"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const schemeTitle =
                                  selectedSchemeCategoryDetail.id === "agriculture"
                                    ? (lang === "ml" ? "സുഭിക്ഷ കേരളം കൃഷി സബ്‌സിഡി പദ്ധതി" : "Subhiksha Keralam Fallow Land Subsidy")
                                    : selectedSchemeCategoryDetail.id === "healthcare"
                                    ? (lang === "ml" ? "കാരുണ്യ ആരോഗ്യ സുരക്ഷാ പദ്ധതി (KASP)" : "Karunya Arogya Suraksha Padhathi (KASP)")
                                    : selectedSchemeCategoryDetail.id === "pension"
                                    ? (lang === "ml" ? "കേരള വയോശ്രേഷ്ഠ & കർഷക പെൻഷൻ" : "Kerala Social Security Pension & Vayoshreshtha")
                                    : selectedSchemeCategoryDetail.id === "housing"
                                    ? (lang === "ml" ? "ലൈഫ് മിഷൻ ഭവന നിർമ്മാണ പദ്ധതി" : "LIFE Mission Housing Scheme")
                                    : (lang === "ml" ? "കേരള സംസ്ഥാന വികസന സഹായ പദ്ധതി" : "Kerala State Welfare & Beneficiary Scheme");
                                setSelectedSchemeName(schemeTitle);
                                setActiveTab("create");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}</span>
                              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Scheme 3 */}
                      {(schemeSourceFilter === "all" || schemeSourceFilter === "state") && (
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span className="text-[9px] font-extrabold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-900/60 px-2 py-0.5 rounded-md">
                              {lang === "ml" ? "സംസ്ഥാന സർക്കാർ" : "State Government"}
                            </span>
                            <span className="text-[9.5px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 px-2 py-0.5 rounded-full">
                              {lang === "ml" ? "അടുത്ത ഘട്ടം ഉടൻ" : "Upcoming Phase"}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-snug">
                            {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "കാർഷിക യന്ത്രവൽക്കരണ സബ്‌സിഡി പദ്ധതി" : "Farm Mechanization & Machinery Subsidy")}
                            {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "മെഡിസെപ് (MEDISEP) സർക്കാർ ജീവനക്കാരുടെ പദ്ധതി" : "MEDISEP Govt Employee Health Insurance")}
                            {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "കർഷക തൊഴിലാളി ക്ഷേമനിധി പെൻഷൻ" : "Agricultural Laborers Welfare Pension")}
                            {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "തീരദേശ ഭവന പുനരധിവാസ പദ്ധതി" : "Coastal Housing Rehabilitation Scheme")}
                            {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "പ്രത്യേക ക്ഷേമ സഹായ പദ്ധതി" : "Special Welfare & Assistance Initiative")}
                          </h5>

                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "കാർഷിക വികസന വകുപ്പ്, കേരളം" : "Department of Agriculture, Govt of Kerala")}
                            {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "ധനകാര്യ വകുപ്പ്, കേരള സർക്കാർ" : "Finance Department, Govt of Kerala")}
                            {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "തൊഴിൽ നൈപുണ്യ വകുപ്പ്, കേരളം" : "Labour & Skills Department, Govt of Kerala")}
                            {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "മത്സ്യബന്ധന വകുപ്പ്, കേരളം" : "Fisheries Department, Govt of Kerala")}
                            {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "സാമൂഹിക ക്ഷേമ വകുപ്പ്" : "Social Welfare Department")}
                          </p>

                          <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-[11px]">
                            <div className="font-extrabold text-slate-800 dark:text-slate-200">
                              {lang === "ml" ? "ആനുകൂല്യം:" : "Financial Benefit:"}
                              <span className="font-medium text-slate-700 dark:text-slate-300 ml-1">
                                {selectedSchemeCategoryDetail.id === "agriculture" && (lang === "ml" ? "ഉപകരണങ്ങൾക്ക് 50% വരെയുള്ള സബ്‌സിഡി" : "Up to 50% equipment subsidy for registered farmers")}
                                {selectedSchemeCategoryDetail.id === "healthcare" && (lang === "ml" ? "ജീവനക്കാർക്കും പെൻഷൻകാർക്കും ക്യാഷ്‌ലെസ് പരിരക്ഷ" : "Cashless health coverage for active & retired staff")}
                                {selectedSchemeCategoryDetail.id === "pension" && (lang === "ml" ? "പ്രതിമാസം ₹1,600 കർഷക തൊഴിലാളി പെൻഷൻ" : "₹1,600 / month pension for registered agri workers")}
                                {selectedSchemeCategoryDetail.id === "housing" && (lang === "ml" ? "പുനരധിവാസ ഭവന നിർമ്മാണത്തിന് ₹10 ലക്ഷം grant" : "₹10 Lakh land acquisition & house grant")}
                                {!["agriculture", "healthcare", "pension", "housing"].includes(selectedSchemeCategoryDetail.id) && (lang === "ml" ? "തൊഴിൽ നൈപുണ്യ വികസന സഹായം" : "Skill training and equipment subsidy")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {lang === "ml" ? "അടുത്ത ഘട്ടം വിജ്ഞാപനം ഉടൻ" : "Phase 2 Notification Soon"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const schemeTitle =
                                  selectedSchemeCategoryDetail.id === "agriculture"
                                    ? (lang === "ml" ? "കാർഷിക യന്ത്രവൽക്കരണ സബ്‌സിഡി പദ്ധതി" : "Farm Mechanization & Machinery Subsidy")
                                    : selectedSchemeCategoryDetail.id === "healthcare"
                                    ? (lang === "ml" ? "മെഡിസെപ് (MEDISEP) സർക്കാർ ജീവനക്കാരുടെ പദ്ധതി" : "MEDISEP Govt Employee Health Insurance")
                                    : selectedSchemeCategoryDetail.id === "pension"
                                    ? (lang === "ml" ? "കർഷക തൊഴിലാളി ക്ഷേമനിധി പെൻഷൻ" : "Agricultural Laborers Welfare Pension")
                                    : selectedSchemeCategoryDetail.id === "housing"
                                    ? (lang === "ml" ? "തീരദേശ ഭവന പുനരധിവാസ പദ്ധതി" : "Coastal Housing Rehabilitation Scheme")
                                    : (lang === "ml" ? "പ്രത്യേക ക്ഷേമ സഹായ പദ്ധതി" : "Special Welfare & Assistance Initiative");
                                setSelectedSchemeName(schemeTitle);
                                setActiveTab("create");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}</span>
                              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Main Schemes Overview: Search + Categories 2-Row Grid + Popular Schemes */
                  <div className="space-y-3">
                    {/* Single Row Search & Filter */}
                    <div className="pb-0.5">
                      <div className="flex items-center gap-2">
                        {/* Scheme Search Input */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={schemeSearchQuery}
                            onChange={(e) => setSchemeSearchQuery(e.target.value)}
                            placeholder={lang === "ml" ? "പദ്ധതികൾ തിരയുക..." : "Search schemes..."}
                            className="w-full h-8 pl-8 pr-7 text-xs font-semibold rounded-full border border-amber-200/80 dark:border-slate-800 bg-[#fffcfa] dark:bg-slate-900 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                          />
                          {schemeSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setSchemeSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Filter Button */}
                        <button
                          type="button"
                          onClick={() => setShowFilterMenu(!showFilterMenu)}
                          className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                            showFilterMenu
                              ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                              : "border-amber-200/80 dark:border-slate-800 bg-[#fffcf0] dark:bg-slate-900 text-[#ff5500] dark:text-slate-200 hover:bg-amber-100/50"
                          }`}
                          title="Toggle Filters"
                        >
                          <Filter className={`h-4 w-4 stroke-[2.2] shrink-0 ${showFilterMenu ? "text-white" : "text-[#ff5500]"}`} />
                        </button>
                      </div>
                    </div>

                    {/* 2-Row Scheme Categories Section */}
                    <div className="pt-1 pb-1">
                      <div className="flex items-center justify-between mb-1.5 px-1">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                          {lang === "ml" ? "വിഭാഗങ്ങൾ" : "Categories"}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchemeCategoryDetail({
                              id: "all",
                              count: 128,
                              categoryLabelEn: "All Categories",
                              categoryLabelMl: "എല്ലാ വിഭാഗങ്ങളും",
                              titleEn: "All Central & State Schemes",
                              titleMl: "എല്ലാ കേന്ദ്ര-സംസ്ഥാന ക്ഷേമപദ്ധതികൾ",
                            });
                            setSchemeCategoryFilter("all");
                            setMobileSubPage("category_schemes");
                          }}
                          className="inline-flex items-center gap-0.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-x-1 gap-y-2.5 pb-1 pt-0.5 px-0.5">
                        {schemeCategories2Row.map((cat) => {
                          const isSelected = selectedSchemeCategoryDetail?.id === cat.detail.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedSchemeCategoryDetail(cat.detail);
                                setSchemeCategoryFilter(cat.id);
                                setMobileSubPage("category_schemes");
                              }}
                              className={`flex flex-col items-center text-center p-0.5 cursor-pointer transition-all duration-150 group rounded-xl ${
                                isSelected
                                  ? "scale-105"
                                  : "hover:scale-105"
                              }`}
                            >
                              <div className={`relative h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center p-0.5 rounded-xl mb-1 transition-all ${
                                isSelected
                                  ? "bg-orange-100/90 dark:bg-orange-950/70 ring-2 ring-orange-500 shadow-xs"
                                  : "bg-slate-50/80 dark:bg-slate-800/40 group-hover:bg-amber-50 dark:group-hover:bg-slate-800"
                              }`}>
                                <img
                                  src={cat.icon}
                                  alt={cat.labelEn}
                                  className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-110"
                                />
                              </div>
                              <span className={`text-[10px] sm:text-[10.5px] font-extrabold leading-[1.15] block whitespace-pre-line text-center max-w-[76px] ${
                                isSelected
                                  ? "text-orange-600 dark:text-orange-400"
                                  : "text-slate-800 dark:text-slate-100"
                              }`}>
                                {lang === "ml" ? cat.labelMl : cat.labelEn}
                              </span>
                              <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 block text-center">
                                {lang === "ml" ? cat.schemesCountMl : cat.schemesCount}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Pagination Dots */}
                      <div className="flex items-center justify-center gap-1.5 mt-1.5 pb-0.5">
                        <span className="h-2 w-2 rounded-full bg-[#ff5500] transition-all" />
                        <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700 transition-all" />
                      </div>
                    </div>

                    {/* Popular Schemes - Official Logos Single Horizontal Scroll Row (4 visible at a time) */}
                    <div className="pt-2 pb-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            {lang === "ml" ? "ജനപ്രിയ പദ്ധതികൾ" : "Popular Schemes"}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchemeCategoryDetail({
                              id: "all",
                              count: 128,
                              categoryLabelEn: "All Categories",
                              categoryLabelMl: "എല്ലാ വിഭാഗങ്ങളും",
                              titleEn: "All Central & State Schemes",
                              titleMl: "എല്ലാ കേന്ദ്ര-സംസ്ഥാന ക്ഷേമപദ്ധതികൾ",
                            });
                            setSchemeCategoryFilter("all");
                            setMobileSubPage("category_schemes");
                          }}
                          className="inline-flex items-center gap-0.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex overflow-x-auto gap-2.5 pb-1 pt-0.5 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
                        {popularSchemesList.map((item) => {
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                const foundCat = schemeCategories2Row.find(c => c.id === item.categoryId || c.detail.id === item.categoryId);
                                if (foundCat) {
                                  setSelectedSchemeCategoryDetail(foundCat.detail);
                                  setSchemeCategoryFilter(foundCat.id);
                                } else {
                                  setSelectedSchemeCategoryDetail({
                                    id: item.id,
                                    count: 18,
                                    categoryLabelEn: item.nameEn,
                                    categoryLabelMl: item.nameMl,
                                    titleEn: item.nameEn,
                                    titleMl: item.nameMl,
                                  });
                                  setSchemeCategoryFilter("all");
                                }
                                setMobileSubPage("category_schemes");
                              }}
                              className="snap-start shrink-0 w-[calc(25%-7.5px)] min-w-[72px] flex flex-col items-center text-center p-0.5 group cursor-pointer transition-all duration-200 hover:scale-105"
                            >
                              <div className="relative h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-700/80 shadow-2xs group-hover:border-orange-500 dark:group-hover:border-orange-400 group-hover:shadow-xs flex items-center justify-center p-1.5 transition-all overflow-hidden">
                                <img
                                  src={item.logo}
                                  alt={item.nameEn}
                                  className="h-full w-full object-contain rounded-full transition-transform duration-200 group-hover:scale-110"
                                />
                              </div>
                              <span className="text-[10px] sm:text-[10.5px] font-extrabold leading-tight text-slate-800 dark:text-slate-100 mt-1.5 block text-center max-w-[72px] line-clamp-2">
                                {lang === "ml" ? item.nameMl : item.nameEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scheme List Below Popular Schemes */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                      {/* Scheme Card 1: Central Govt */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <span className="text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded-md">
                            {lang === "ml" ? "കേന്ദ്ര സർക്കാർ" : "Central Government"}
                          </span>
                          <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {lang === "ml" ? "അപേക്ഷിക്കാം" : "Accepting Applications"}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-snug">
                          {lang === "ml" ? "പി.എം. കിസാൻ സമ്മാൻ നിധി" : "PM Kisan Samman Nidhi"}
                        </h5>

                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          {lang === "ml" ? "കൃഷി വികസന കർഷകക്ഷേമ മന്ത്രാലയം, ഭാരത സർക്കാർ" : "Ministry of Agriculture & Farmers Welfare, Govt of India"}
                        </p>

                        <div className="mt-2.5 p-2 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 text-[11px]">
                          <div className="font-extrabold text-orange-800 dark:text-orange-300">
                            {lang === "ml" ? "സാമ്പത്തിക ആനുകൂല്യം:" : "Financial Benefit:"}
                            <span className="font-medium text-slate-700 dark:text-slate-300 ml-1">
                              {lang === "ml" ? "പ്രതിവർഷം ₹6,000 ബാങ്ക് അക്കൗണ്ടിലേക്ക് (3 ഗഡുക്കളായി)" : "₹6,000 / year direct bank transfer (3 installments)"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            <span className="font-bold text-slate-600 dark:text-slate-300">{lang === "ml" ? "യോഗ്യത:" : "Eligibility:"} </span>
                            {lang === "ml" ? "കൃഷിഭൂമിയുള്ള ചെറുകിട-നാമമാത്ര കർഷകർ" : "Small & marginal farmers holding cultivable land"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {lang === "ml" ? "ഓൺലൈൻ അപേക്ഷ ലഭ്യമാണ്" : "Online Application Enabled"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSchemeName("PM Kisan Samman Nidhi");
                              setActiveTab("create");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                          >
                            <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}</span>
                            <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>

                      {/* Scheme Card 2: State Govt */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <span className="text-[9px] font-extrabold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-900/60 px-2 py-0.5 rounded-md">
                            {lang === "ml" ? "സംസ്ഥാന സർക്കാർ" : "State Government"}
                          </span>
                          <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {lang === "ml" ? "അപേക്ഷിക്കാം" : "Accepting Applications"}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-snug">
                          {lang === "ml" ? "സുഭിക്ഷ കേരളം കൃഷി സബ്‌സിഡി പദ്ധതി" : "Subhiksha Keralam Fallow Land Subsidy"}
                        </h5>

                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          {lang === "ml" ? "കൃഷി വികസന കർഷകക്ഷേമ വകുപ്പ്, കേരളം" : "Dept of Agriculture Development & Farmers Welfare, Kerala"}
                        </p>

                        <div className="mt-2.5 p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 text-[11px]">
                          <div className="font-extrabold text-purple-800 dark:text-purple-300">
                            {lang === "ml" ? "സാമ്പത്തിക ആനുകൂല്യം:" : "Financial Benefit:"}
                            <span className="font-medium text-slate-700 dark:text-slate-300 ml-1">
                              {lang === "ml" ? "ഏക്കറിന് ₹10,000 വരെ കൃഷി സബ്‌സിഡി" : "Up to ₹10,000 / acre cultivation & seed subsidy"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            <span className="font-bold text-slate-600 dark:text-slate-300">{lang === "ml" ? "യോഗ്യത:" : "Eligibility:"} </span>
                            {lang === "ml" ? "വ്യക്തിഗത കർഷകരും കുടുംബശ്രീ ഗ്രൂപ്പുകളും" : "Individual farmers & Kudumbashree farming groups"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {lang === "ml" ? "അക്ഷയ സെന്റർ / ഓൺലൈൻ വഴി" : "Available via Akshaya & Online Portal"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSchemeName("Subhiksha Keralam Fallow Land Subsidy");
                              setActiveTab("create");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                          >
                            <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}</span>
                            <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "applications" && (
              mobileSubPage === "app_detail" ? (
                renderAppDetailSubpage()
              ) : (
                <div className="space-y-3 animate-in fade-in duration-200">
                {/* Applications Header with Period Selector & Filter Pill */}
                <div className="flex items-center justify-between border-b border-border/80 pb-2 gap-1">
                  {/* Left Side: Formatted Period Display replacing 'Applications' title */}
                  <span className="font-extrabold text-[#0a0f1d] dark:text-white text-xs sm:text-sm tracking-tight truncate">
                    {getFormattedPeriodDisplay()}
                  </span>

                  {/* Period Selector & Filter Action in Header */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs hover:border-slate-300 transition-all min-h-[28px] max-w-[150px] sm:max-w-[180px]">
                      <div className="flex items-center gap-0.5 min-w-0 flex-1 justify-center">
                        <button
                          type="button"
                          onClick={() => handleStepPeriod(-1)}
                          className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                          title="Previous Period"
                        >
                          <ChevronLeft className="h-3 w-3 stroke-[2.4]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(true)}
                          className="text-[9.5px] sm:text-[10px] font-extrabold text-[#0a0f1d] dark:text-slate-100 hover:text-[#ff5500] transition-colors cursor-pointer px-0.5 tracking-tight truncate"
                          title="Click to Open Date Picker"
                        >
                          {getFormattedPeriodDisplay()}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStepPeriod(1)}
                          className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                          title="Next Period"
                        >
                          <ChevronRight className="h-3 w-3 stroke-[2.4]" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(true)}
                        className="p-0.5 rounded-full text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-800 pl-1 ml-0.5 shrink-0"
                        title="Open Date Picker"
                      >
                        <Calendar className="h-3 w-3 stroke-[2.2]" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                        showFilterMenu
                          ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                          : "border-amber-200/60 dark:border-slate-800 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 hover:bg-amber-100/50"
                      }`}
                      title="Toggle Filters"
                    >
                      <Filter className={`h-3.5 w-3.5 stroke-[2.2] shrink-0 ${showFilterMenu ? "text-white" : "text-[#ff5500]"}`} />
                    </button>
                  </div>
                </div>

                {/* Search Input & Status Selection Dropdown Pill */}
                <div className="flex items-center gap-2 pb-1">
                  {/* Application Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={applicationSearchQuery}
                      onChange={(e) => setApplicationSearchQuery(e.target.value)}
                      placeholder={lang === "ml" ? "പേര്, ഐഡി, ടൈപ്പ് തിരയുക..." : "Search by name, ID, type..."}
                      className="w-full h-7 pl-7 pr-6 text-[11px] font-semibold rounded-full border border-amber-200/80 dark:border-slate-800 bg-[#fffcfa] dark:bg-slate-900 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                    />
                    {applicationSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setApplicationSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Selection Dropdown Pill */}
                  <div className="relative shrink-0">
                    <select
                      value={applicationStatusFilter}
                      onChange={(e) => setApplicationStatusFilter(e.target.value as "all" | "assisted" | "pending" | "rejected")}
                      className="h-7 pl-3 pr-7 text-[11px] font-bold rounded-full border border-amber-200/80 dark:border-orange-800/80 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs cursor-pointer appearance-none"
                    >
                      <option value="all">{lang === "ml" ? `എല്ലാം (${applicationsCount})` : `All (${applicationsCount})`}</option>
                      <option value="assisted">{lang === "ml" ? `പരിശോധനയിലുള്ളവ (${currentMetrics.assisted})` : `In Review (${currentMetrics.assisted})`}</option>
                      <option value="pending">{lang === "ml" ? `പെൻഡിംഗ് (${currentMetrics.pending})` : `Pending (${currentMetrics.pending})`}</option>
                      <option value="rejected">{lang === "ml" ? `നിരസിച്ചവ (${currentMetrics.rejected})` : `Rejected (${currentMetrics.rejected})`}</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#0a0f1d] dark:text-slate-300 pointer-events-none" />
                  </div>
                </div>

                {/* SLA Breaches Banner */}
                {/* Removed per user request */}

                {/* List of Applications */}
                <div className="space-y-2 pt-1">
                  {/* Item 1: Pending */}
                  {matchAppSearch("pending", "Pratibha Merit Scholarship", "പ്രതിഭാ മെരിറ്റ് സ്കോളർഷിപ്പ്", "Ananya Ramesh", "അനന്യ രമേശ്", "Scholarship", "സ്കോളർഷിപ്പ്", "APP-2026-8910") && (
                    <div 
                      onClick={() => {
                        setSelectedApplicationRecord({
                          ref: "APP-2026-8910",
                          schemeNameEn: "Pratibha Merit Scholarship",
                          schemeNameMl: "പ്രതിഭാ മെരിറ്റ് സ്കോളർഷിപ്പ്",
                          categoryEn: "Scholarship",
                          categoryMl: "സ്കോളർഷിപ്പ്",
                          status: "pending",
                          applicantNameEn: "Ananya Ramesh",
                          applicantNameMl: "അനന്യ രമേശ്",
                          aadhaar: "XXXX-XXXX-8910",
                          phone: "+91 94950 33445",
                          locationEn: "Kazhakkoottam, Thiruvananthapuram",
                          locationMl: "കഴക്കൂട്ടം, തിരുവനന്തപുരം",
                          annualIncome: "₹ 1,20,000",
                          appliedDate: "05/10/2026",
                          currentStep: 2,
                          pendingDocs: ["Class 10 Marklist", "Aadhaar Card", "Income Certificate"],
                          nextActionEn: "Income Certificate verification by Village Officer pending",
                          nextActionMl: "വില്ലേജ് ഓഫീസറുടെ വരുമാന സർട്ടിഫിക്കറ്റ് പരിശോധന കുടിശ്ശികയാണ്",
                          auditLog: [
                            { titleEn: "Application Submitted Online", titleMl: "അപേക്ഷ ഓൺലൈനായി സമർപ്പിച്ചു", date: "05 Oct 2026", status: "completed" },
                            { titleEn: "Document Verification in Progress", titleMl: "രേഖാ പരിശോധന പുരോഗമിക്കുന്നു", date: "06 Oct 2026", status: "current" },
                            { titleEn: "Field Level Verification", titleMl: "ഫീൽഡ് തല പരിശോധന", date: "Pending", status: "upcoming" },
                          ],
                        });
                        setMobileSubPage("app_detail");
                      }}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9.5px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {lang === "ml" ? "സ്കോളർഷിപ്പ്" : "Scholarship"}
                        </span>
                        <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Hourglass className="h-2.5 w-2.5" />
                          {lang === "ml" ? "പെൻഡിംഗ്" : "Pending Verification"}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-tight mt-2">
                        {lang === "ml" ? "പ്രതിഭാ മെരിറ്റ് സ്കോളർഷിപ്പ്" : "Pratibha Merit Scholarship"}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
                        {lang === "ml" ? "അപേക്ഷകൻ: അനന്യ രമേശ് · കഴക്കൂട്ടം" : "Applicant: Ananya Ramesh · Kazhakkoottam"}
                      </p>
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
                        <span className="font-mono text-[10px] text-slate-400">Ref: APP-2026-8910</span>
                        <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-extrabold text-[10.5px]">
                          {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                          <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Item 2: Assisted - Karunya Health Insurance */}
                  {matchAppSearch("assisted", "Karunya Health Insurance", "കാരുണ്യ ആരോഗ്യ ഇൻഷുറൻസ്", "Lakshmi Amma", "ലക്ഷ്മി അമ്മ", "Health Insurance", "ആരോഗ്യം", "APP-2026-8922") && (
                    <div 
                      onClick={() => {
                        setSelectedApplicationRecord({
                          ref: "APP-2026-8922",
                          schemeNameEn: "Karunya Health Insurance",
                          schemeNameMl: "കാരുണ്യ ആരോഗ്യ ഇൻഷുറൻസ്",
                          categoryEn: "Health Insurance",
                          categoryMl: "ആരോഗ്യം",
                          status: "approved",
                          applicantNameEn: "Lakshmi Amma",
                          applicantNameMl: "ലക്ഷ്മി അമ്മ",
                          aadhaar: "XXXX-XXXX-8922",
                          phone: "+91 98470 11223",
                          locationEn: "Vattiyoorkavu, Thiruvananthapuram",
                          locationMl: "വട്ടിയൂർക്കാവ്, തിരുവനന്തപുരം",
                          annualIncome: "₹ 75,000",
                          appliedDate: "03/10/2026",
                          currentStep: 4,
                          pendingDocs: ["Ration Card Copy", "Doctor Certificate"],
                          nextActionEn: "Sanction letter generated. Financial claim process ready.",
                          nextActionMl: "അനുമതി പത്രം തയാറായി. ധനസഹായ തുക നൽകാൻ വിവരങ്ങൾ ക്രമീകരിച്ചു.",
                          auditLog: [
                            { titleEn: "Application Received", titleMl: "അപേക്ഷ ലഭിച്ചു", date: "03 Oct 2026", status: "completed" },
                            { titleEn: "Document Verification Completed", titleMl: "രേഖാ പരിശോധന പൂർത്തിയായി", date: "04 Oct 2026", status: "completed" },
                            { titleEn: "District Medical Sanction", titleMl: "ജില്ലാ മെഡിക്കൽ അനുമതി", date: "05 Oct 2026", status: "completed" },
                          ],
                        });
                        setMobileSubPage("app_detail");
                      }}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9.5px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {lang === "ml" ? "ആരോഗ്യം" : "Health Insurance"}
                        </span>
                        <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {lang === "ml" ? "സഹായം ലഭിച്ചു" : "Approved & Assisted"}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-tight mt-2">
                        {lang === "ml" ? "കാരുണ്യ ആരോഗ്യ ഇൻഷുറൻസ്" : "Karunya Health Insurance"}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
                        {lang === "ml" ? "അപേക്ഷക: ലക്ഷ്മി അമ്മ · വട്ടിയൂർക്കാവ്" : "Applicant: Lakshmi Amma · Vattiyoorkavu"}
                      </p>
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
                        <span className="font-mono text-[10px] text-slate-400">Ref: APP-2026-8922</span>
                        <span className="flex items-center gap-0.5 text-teal-600 dark:text-teal-400 font-extrabold text-[10.5px]">
                          {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                          <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Item 3: PM Kisan Samman Nidhi */}
                  {matchAppSearch("pending", "PM Kisan Samman Nidhi", "പിഎം-കിസാൻ സമ്മാൻ നിധി", "K. Krishnan", "കെ. കൃഷ്ണൻ", "Agriculture", "കൃഷി", "APP-2026-8925") && (
                    <div 
                      onClick={() => {
                        setSelectedApplicationRecord({
                          ref: "APP-2026-8925",
                          schemeNameEn: "PM Kisan Samman Nidhi",
                          schemeNameMl: "പിഎം-കിസാൻ സമ്മാൻ നിധി",
                          categoryEn: "Agriculture",
                          categoryMl: "കൃഷി",
                          status: "pending",
                          applicantNameEn: "K. Krishnan",
                          applicantNameMl: "കെ. കൃഷ്ണൻ",
                          aadhaar: "XXXX-XXXX-8925",
                          phone: "+91 98463 87654",
                          locationEn: "Palakkad North, Palakkad",
                          locationMl: "പാലക്കാട് നോർത്ത്, പാലക്കാട്",
                          annualIncome: "₹ 90,000",
                          appliedDate: "01/10/2026",
                          currentStep: 2,
                          pendingDocs: ["Land Tax Receipt", "Aadhaar e-KYC Verification"],
                          nextActionEn: "Pending e-KYC validation via Biometric / OTP",
                          nextActionMl: "ബയോമെട്രിക് / ഒടിപി വഴി ഇ-കെവൈസി പരിശോധന പൂർത്തിയാക്കുക",
                          auditLog: [
                            { titleEn: "Application Registered", titleMl: "അപേക്ഷ രജിസ്റ്റർ ചെയ്തു", date: "01 Oct 2026", status: "completed" },
                            { titleEn: "Land Record Audit", titleMl: "ഭൂമി വിവര പരിശോധന", date: "03 Oct 2026", status: "completed" },
                            { titleEn: "Bank Aadhar Seeding", titleMl: "ബാങ്ക് ആധാർ ലിങ്കിംഗ്", date: "Pending", status: "current" },
                          ],
                        });
                        setMobileSubPage("app_detail");
                      }}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9.5px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {lang === "ml" ? "കൃഷി" : "Agriculture"}
                        </span>
                        <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Hourglass className="h-2.5 w-2.5" />
                          {lang === "ml" ? "പെൻഡിംഗ്" : "Document Review Pending"}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-tight mt-2">
                        {lang === "ml" ? "പിഎം-കിസാൻ സമ്മാൻ നിധി" : "PM Kisan Samman Nidhi"}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
                        {lang === "ml" ? "അപേക്ഷകൻ: കെ. കൃഷ്ണൻ · പാലക്കാട്" : "Applicant: K. Krishnan · Palakkad"}
                      </p>
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
                        <span className="font-mono text-[10px] text-slate-400">Ref: APP-2026-8925</span>
                        <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-extrabold text-[10.5px]">
                          {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                          <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Item 4: Rejected - LIFE Mission */}
                  {matchAppSearch("rejected", "LIFE Mission Housing Title", "ലൈഫ് മിഷൻ ഭവന പദ്ധതി", "Joseph K", "ജോസഫ് കെ", "Housing", "ഭവന നിർമ്മാണം", "APP-2026-8927") && (
                    <div 
                      onClick={() => {
                        setSelectedApplicationRecord({
                          ref: "APP-2026-8927",
                          schemeNameEn: "LIFE Mission Housing Title",
                          schemeNameMl: "ലൈഫ് മിഷൻ ഭവന പദ്ധതി",
                          categoryEn: "Housing",
                          categoryMl: "ഭവന നിർമ്മാണം",
                          status: "rejected",
                          applicantNameEn: "Joseph K",
                          applicantNameMl: "ജോസഫ് കെ",
                          aadhaar: "XXXX-XXXX-8927",
                          phone: "+91 98952 66778",
                          locationEn: "Chathannoor, Kollam",
                          locationMl: "ചാത്തന്നൂർ, കൊല്ലം",
                          annualIncome: "₹ 1,80,000",
                          appliedDate: "29/09/2026",
                          currentStep: 3,
                          pendingDocs: ["Ownership Title Deed"],
                          nextActionEn: "Rejected due to income limit exceeding eligibility criteria",
                          nextActionMl: "വരുമാന പരിധി യോഗ്യതാ മാനദണ്ഡത്തിൽ കൂടുതൽ ആയതിനാൽ നിരസിച്ചു",
                          auditLog: [
                            { titleEn: "Application Submitted", titleMl: "അപേക്ഷ സമർപ്പിച്ചു", date: "29 Sep 2026", status: "completed" },
                            { titleEn: "Field Verification Inspection", titleMl: "ഫീൽഡ് തല പരിശോധന", date: "02 Oct 2026", status: "completed" },
                            { titleEn: "Application Rejected", titleMl: "അപേക്ഷ നിരസിച്ചു", date: "04 Oct 2026", status: "completed" },
                          ],
                        });
                        setMobileSubPage("app_detail");
                      }}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9.5px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {lang === "ml" ? "ഭവന നിർമ്മാണം" : "Housing"}
                        </span>
                        <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <XCircle className="h-2.5 w-2.5" />
                          {lang === "ml" ? "നിരസിച്ചു" : "Rejected"}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-tight mt-2">
                        {lang === "ml" ? "ലൈഫ് മിഷൻ ഭവന പദ്ധതി" : "LIFE Mission Housing Title"}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
                        {lang === "ml" ? "അപേക്ഷകൻ: ജോസഫ് കെ · ചാത്തന്നൂർ" : "Applicant: Joseph K · Chathannoor"}
                      </p>
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
                        <span className="font-mono text-[10px] text-slate-400">Ref: APP-2026-8927</span>
                        <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-extrabold text-[10.5px]">
                          {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                          <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Item 5: Vayoshreshtha Pension */}
                  {matchAppSearch("assisted", "Vayoshreshtha Pension Scheme", "വയോശ്രേഷ്ഠ പെൻഷൻ", "Soman P", "സോമൻ പി", "Pension", "പെൻഷൻ", "APP-2026-8921") && (
                    <div 
                      onClick={() => {
                        setSelectedApplicationRecord({
                          ref: "APP-2026-8921",
                          schemeNameEn: "Vayoshreshtha Pension Scheme",
                          schemeNameMl: "വയോശ്രേഷ്ഠ പെൻഷൻ",
                          categoryEn: "Pension",
                          categoryMl: "പെൻഷൻ",
                          status: "disbursed",
                          applicantNameEn: "Soman P",
                          applicantNameMl: "സോമൻ പി",
                          aadhaar: "XXXX-XXXX-8921",
                          phone: "+91 94471 23456",
                          locationEn: "Kazhakkoottam, Thiruvananthapuram",
                          locationMl: "കഴക്കൂട്ടം, തിരുവനന്തപുരം",
                          annualIncome: "₹ 60,000",
                          appliedDate: "04/10/2026",
                          currentStep: 5,
                          pendingDocs: ["Age Proof Certificate", "Bank Passbook Copy"],
                          nextActionEn: "Monthly pension disbursed directly to DBT linked bank account",
                          nextActionMl: "പ്രതിമാസ പെൻഷൻ ഡിബിടി ബാങ്ക് അക്കൗണ്ടിലേക്ക് അയച്ചു നൽകി",
                          auditLog: [
                            { titleEn: "Application Submitted", titleMl: "അപേക്ഷ സമർപ്പിച്ചു", date: "04 Oct 2026", status: "completed" },
                            { titleEn: "Verification & Approval", titleMl: "പരിശോധനയും അംഗീകാരവും", date: "05 Oct 2026", status: "completed" },
                            { titleEn: "First Pension Disbursed", titleMl: "ആദ്യ പെൻഷൻ ലഭിച്ചു", date: "06 Oct 2026", status: "completed" },
                          ],
                        });
                        setMobileSubPage("app_detail");
                      }}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9.5px] font-extrabold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/70 dark:border-cyan-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {lang === "ml" ? "പെൻഷൻ" : "Pension"}
                        </span>
                        <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {lang === "ml" ? "സഹായം ലഭിച്ചു" : "Disbursed"}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white leading-tight mt-2">
                        {lang === "ml" ? "വയോശ്രേഷ്ഠ പെൻഷൻ" : "Vayoshreshtha Pension Scheme"}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
                        {lang === "ml" ? "അപേക്ഷകൻ: സോമൻ പി · തിരുവനന്തപുരം" : "Applicant: Soman P · Thiruvananthapuram"}
                      </p>
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
                        <span className="font-mono text-[10px] text-slate-400">Ref: APP-2026-8921</span>
                        <span className="flex items-center gap-0.5 text-teal-600 dark:text-teal-400 font-extrabold text-[10.5px]">
                          {lang === "ml" ? "വിശദാംശങ്ങൾ കാണുക" : "View Details"}
                          <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

            {(activeTab as string) === "users" && (
              <MobileUsersListTab
                periodText={getFormattedPeriodDisplay()}
                onOpenDatePicker={() => setIsDatePickerOpen(true)}
                onStepPeriod={handleStepPeriod}
              />
            )}

            {(activeTab === "create" || activeTab === "helpdesk") && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-border/80 pb-2 px-0.5">
                  <div className="flex items-center gap-2">
                    {activeTab === "create" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (createFlowStep === "scheme_details") {
                            setCreateFlowStep(selectedEligibleScheme ? "eligibility_result" : "eligible_schemes");
                          } else if (createFlowStep === "eligibility_result") {
                            setCreateFlowStep("form");
                          } else if (createFlowStep === "eligible_schemes") {
                            setCreateFlowStep("form");
                          } else if (createFlowStep === "checking") {
                            setIsCheckingEligibility(false);
                            setCreateFlowStep("form");
                          } else if (createFlowStep === "submitted") {
                            setCreateFlowStep("form");
                          } else if (selectedSchemeName) {
                            setActiveTab("schemes");
                            setSelectedSchemeName("");
                          } else {
                            setActiveTab("overview");
                            setMobileSubPage("none");
                          }
                        }}
                        className="p-1 rounded-lg bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
                        title={lang === "ml" ? "തിരികെ പോവുക" : "Go back"}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    )}
                    <h3 className="font-extrabold text-sm text-foreground">
                      {activeTab === "create" ? (
                        createFlowStep === "eligibility_result"
                          ? (lang === "ml" ? "അർഹതാ ഫലം" : "Eligibility Result")
                          : createFlowStep === "checking"
                          ? (lang === "ml" ? "യോഗ്യത പരിശോധിക്കുന്നു..." : "Checking eligibility...")
                          : createFlowStep === "eligible_schemes"
                          ? (lang === "ml" ? "യോഗ്യതയുള്ള പദ്ധതികൾ" : "Eligible Schemes")
                          : createFlowStep === "scheme_details"
                          ? `${selectedEligibleScheme?.titleEn || (lang === "ml" ? "പദ്ധതി" : "Scheme")} - ${lang === "ml" ? "അവസാന വിവരങ്ങൾ" : "Final Details"}`
                          : createFlowStep === "submitted"
                          ? (lang === "ml" ? "അപേക്ഷ സമർപ്പിച്ചു" : "Application Submitted")
                          : selectedSchemeName
                          ? `${selectedSchemeName} - ${lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}`
                          : (lang === "ml" ? "പുതിയ അപേക്ഷ സമർപ്പിക്കുക" : "Create New Application")
                      ) : (
                        lang === "ml" ? "സ്കീം ഹെൽപ്പ്ഡെസ്ക്" : "Scheme Helpdesk"
                      )}
                    </h3>
                  </div>
                  {activeTab !== "create" && (
                    <span className="text-[10.5px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                      Helpdesk
                    </span>
                  )}
                </div>

                {activeTab === "create" ? (
                  <>
                    {/* Step 1: Form Inputs View */}
                    {createFlowStep === "form" && (
                      <div className="space-y-3.5 bg-card p-3.5 rounded-2xl border border-border shadow-2xs">
                        {/* 1. Full Name */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "പൂർണ്ണമായ പേര് *" : "Full Name *"}
                          </label>
                          <input 
                            type="text" 
                            value={createFullName}
                            onChange={(e) => setCreateFullName(e.target.value)}
                            placeholder={lang === "ml" ? "ഉദാ: സോമൻ പി" : "Enter Full Name"}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 2. Aadhaar Number */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ആധാർ നമ്പർ *" : "Aadhaar Number *"}
                          </label>
                          <input 
                            type="text"
                            maxLength={12}
                            value={createAadhaar}
                            onChange={(e) => setCreateAadhaar(e.target.value.replace(/\D/g, ''))}
                            placeholder="12-digit Aadhaar number"
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 3. Mobile Number with Country Code */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "മൊബൈൽ നമ്പർ *" : "Mobile Number *"}
                          </label>
                          <div className="flex gap-1.5">
                            <select
                              value={createCountryCode}
                              onChange={(e) => setCreateCountryCode(e.target.value)}
                              className="text-xs font-semibold p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none shrink-0 text-foreground"
                            >
                              <option value="+91">🇮🇳 +91</option>
                              <option value="+1">🇺🇸 +1</option>
                              <option value="+971">🇦🇪 +971</option>
                              <option value="+44">🇬🇧 +44</option>
                            </select>
                            <input 
                              type="tel"
                              maxLength={10}
                              value={createPhone}
                              onChange={(e) => setCreatePhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="10-digit phone number"
                              className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                            />
                          </div>
                        </div>

                        {/* 4. Email (Optional) */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ഇമെയിൽ (ഓപ്ഷണൽ)" : "Email (Optional)"}
                          </label>
                          <input 
                            type="email" 
                            value={createEmail}
                            onChange={(e) => setCreateEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 5. Date of Birth */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ജനന തീയതി *" : "Date of Birth *"}
                          </label>
                          <input 
                            type="date" 
                            value={createDob}
                            onChange={(e) => setCreateDob(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 6. Gender */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ലിംഗഭേദം *" : "Gender *"}
                          </label>
                          <select 
                            value={createGender}
                            onChange={(e) => setCreateGender(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- ലിംഗഭേദം തിരഞ്ഞെടുക്കുക --" : "-- Select Gender --"}</option>
                            <option value="Male">{lang === "ml" ? "പുരുഷൻ" : "Male"}</option>
                            <option value="Female">{lang === "ml" ? "സ്ത്രീ" : "Female"}</option>
                            <option value="Transgender / Other">{lang === "ml" ? "ട്രാൻസ്‌ജെൻഡർ / മറ്റുള്ളവ" : "Transgender / Other"}</option>
                          </select>
                        </div>

                        {/* 7. Religion */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "മതം *" : "Religion *"}
                          </label>
                          <select 
                            value={createReligion}
                            onChange={(e) => setCreateReligion(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- മതം തിരഞ്ഞെടുക്കുക --" : "-- Select Religion --"}</option>
                            <option value="Hinduism">Hinduism</option>
                            <option value="Islam">Islam</option>
                            <option value="Christianity">Christianity</option>
                            <option value="Sikhism">Sikhism</option>
                            <option value="Buddhism">Buddhism</option>
                            <option value="Jainism">Jainism</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {/* 8. Caste */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ജാതി / വിഭാഗം *" : "Caste *"}
                          </label>
                          <select 
                            value={createCaste}
                            onChange={(e) => setCreateCaste(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- വിഭാഗം തിരഞ്ഞെടുക്കുക --" : "-- Select Caste --"}</option>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="OBC-NCL">OBC-NCL</option>
                            <option value="EWS">EWS</option>
                          </select>
                        </div>

                        {/* 9. Marital Status */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "വൈവാഹിക അവസ്ഥ *" : "Marital Status *"}
                          </label>
                          <select 
                            value={createMaritalStatus}
                            onChange={(e) => setCreateMaritalStatus(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- വൈവാഹിക അവസ്ഥ --" : "-- Select Marital Status --"}</option>
                            <option value="Single / Unmarried">{lang === "ml" ? "അവിവാഹിതൻ / അവിവാഹിത" : "Single / Unmarried"}</option>
                            <option value="Married">{lang === "ml" ? "വിവാഹിതൻ / വിവാഹിത" : "Married"}</option>
                            <option value="Widowed">{lang === "ml" ? "വിധവ / വിധവൻ" : "Widowed"}</option>
                            <option value="Divorcee">{lang === "ml" ? "വിവാഹബന്ധം വേർപെടുത്തിയ വ്യക്തി" : "Divorcee"}</option>
                            <option value="Separated">{lang === "ml" ? "വേർപിരിഞ്ഞു കഴിയുന്ന വ്യക്തി" : "Separated"}</option>
                          </select>
                        </div>

                        {/* 10. Occupation */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "തൊഴിൽ *" : "Occupation *"}
                          </label>
                          <select 
                            value={createOccupation}
                            onChange={(e) => setCreateOccupation(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- തൊഴിൽ തിരഞ്ഞെടുക്കുക --" : "-- Select Occupation --"}</option>
                            <option value="Farmer / Agriculture">{lang === "ml" ? "കർഷകൻ / കൃഷി" : "Farmer / Agriculture"}</option>
                            <option value="Daily Wage Worker">{lang === "ml" ? "ദിനബത്ത തൊഴിലാളി" : "Daily Wage Worker"}</option>
                            <option value="Salaried (Private)">{lang === "ml" ? "സ്വകാര്യ മേഖല ഉദ്യോഗസ്ഥൻ" : "Salaried (Private)"}</option>
                            <option value="Salaried (Government)">{lang === "ml" ? "സർക്കാർ ഉദ്യോഗസ്ഥൻ" : "Salaried (Government)"}</option>
                            <option value="Self-Employed / Business">{lang === "ml" ? "സ്വയംതൊഴിൽ / ബിസിനസ്സ്" : "Self-Employed / Business"}</option>
                            <option value="Homemaker">{lang === "ml" ? "ഗൃഹനാഥ / വീട്ടമ്മ" : "Homemaker"}</option>
                            <option value="Student">{lang === "ml" ? "വിദ്യാർത്ഥി" : "Student"}</option>
                            <option value="Unemployed">{lang === "ml" ? "തൊഴിൽ രഹിതൻ" : "Unemployed"}</option>
                            <option value="Retired">{lang === "ml" ? "വിരമിച്ച വ്യക്തി" : "Retired"}</option>
                            <option value="Other">{lang === "ml" ? "മറ്റുള്ളവ" : "Other"}</option>
                          </select>
                        </div>

                        {/* 11. Income Range */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "വാർഷിക വരുമാന പരിധി *" : "Income Range *"}
                          </label>
                          <select 
                            value={createIncomeRange}
                            onChange={(e) => setCreateIncomeRange(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          >
                            <option value="">{lang === "ml" ? "-- വരുമാന പരിധി --" : "-- Select Income Range --"}</option>
                            <option value="Below ₹50,000">Below ₹50,000</option>
                            <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                            <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                            <option value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</option>
                            <option value="Above ₹5,00,000">Above ₹5,00,000</option>
                          </select>
                        </div>

                        {/* 1. District */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ജില്ല *" : "District *"}
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddressSheet("district");
                              setAddressSheetSearch("");
                            }}
                            className="w-full text-xs p-3 rounded-xl border border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-800/60 focus:ring-1 focus:ring-orange-500 outline-none text-foreground flex items-center justify-between transition-colors cursor-pointer text-left"
                          >
                            <span className={createDistrict ? "font-bold" : "text-muted-foreground"}>
                              {createDistrict
                                ? (lang === "ml" ? getDistrictName(createDistrict, "ml") : createDistrict)
                                : (lang === "ml" ? "-- ജില്ല തിരഞ്ഞെടുക്കുക --" : "-- Select District --")}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        </div>

                        {/* 2. Local Body Type */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "തദ്ദേശ സ്വയംഭരണ തരം *" : "Local Body Type *"}
                          </label>
                          <select
                            value={createLocalBodyType}
                            onChange={(e) => handleLocalBodyTypeSelect(e.target.value as LocalBodyType)}
                            className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground cursor-pointer font-medium"
                          >
                            <option value="">{lang === "ml" ? "-- തരം തിരഞ്ഞെടുക്കുക --" : "-- Select Local Body Type --"}</option>
                            <option value="panchayat">{lang === "ml" ? "ഗ്രാമ പഞ്ചായത്ത് (Grama Panchayat)" : "Grama Panchayat"}</option>
                            <option value="municipality">{lang === "ml" ? "മുനിസിപ്പാലിറ്റി (Municipality)" : "Municipality"}</option>
                            <option value="corporation">{lang === "ml" ? "കോർപ്പറേഷൻ (Corporation)" : "Corporation"}</option>
                          </select>
                        </div>

                        {/* 3. Local Body */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "തദ്ദേശ സ്വയംഭരണ സ്ഥാപനം *" : "Local Body *"}
                          </label>
                          <button
                            type="button"
                            disabled={!createDistrict || !createLocalBodyType}
                            onClick={() => {
                              if (createDistrict && createLocalBodyType) {
                                setActiveAddressSheet("localBody");
                                setAddressSheetSearch("");
                              }
                            }}
                            className={`w-full text-xs p-3 rounded-xl border outline-none flex items-center justify-between transition-colors text-left ${
                              !createDistrict || !createLocalBodyType
                                ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed opacity-70"
                                : "bg-background hover:bg-slate-50 dark:hover:bg-slate-800/60 border-border text-foreground cursor-pointer"
                            }`}
                          >
                            <span className={createLocalBody ? "font-bold" : "text-muted-foreground"}>
                              {createLocalBody
                                ? createLocalBody
                                : (lang === "ml" ? "-- തദ്ദേശ സ്ഥാപനം തിരഞ്ഞെടുക്കുക --" : "-- Select Local Body --")}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        </div>

                        {/* 4. Ward */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "വാർഡ് *" : "Ward *"}
                          </label>
                          <button
                            type="button"
                            disabled={!createLocalBody}
                            onClick={() => {
                              if (createLocalBody) {
                                setActiveAddressSheet("ward");
                                setAddressSheetSearch("");
                              }
                            }}
                            className={`w-full text-xs p-3 rounded-xl border outline-none flex items-center justify-between transition-colors text-left ${
                              !createLocalBody
                                ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed opacity-70"
                                : "bg-background hover:bg-slate-50 dark:hover:bg-slate-800/60 border-border text-foreground cursor-pointer"
                            }`}
                          >
                            <span className={createWard ? "font-bold" : "text-muted-foreground"}>
                              {createWard
                                ? createWard
                                : (lang === "ml" ? "-- വാർഡ് തിരഞ്ഞെടുക്കുക --" : "-- Select Ward --")}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        </div>

                        {/* 5. Assembly Mandalam */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-foreground block">
                              {lang === "ml" ? "നിയമസഭാ മണ്ഡലം *" : "Assembly Mandalam *"}
                            </label>
                            {isMandalamAutoFilled && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                {lang === "ml" ? "ഓട്ടോ-മാപ്പ് ചെയ്തത്" : "Auto-Mapped"}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={!createDistrict}
                            onClick={() => {
                              if (createDistrict) {
                                setActiveAddressSheet("mandalam");
                                setAddressSheetSearch("");
                              }
                            }}
                            className={`w-full text-xs p-3 rounded-xl border outline-none flex items-center justify-between transition-colors text-left ${
                              !createDistrict
                                ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed opacity-70"
                                : "bg-background hover:bg-slate-50 dark:hover:bg-slate-800/60 border-border text-foreground cursor-pointer"
                            }`}
                          >
                            <span className={createMandalam ? "font-bold" : "text-muted-foreground"}>
                              {createMandalam
                                ? (lang === "ml" ? getConstituencyName(createMandalam, "ml") : createMandalam)
                                : (lang === "ml" ? "-- മണ്ഡലം തിരഞ്ഞെടുക്കുക --" : "-- Select Assembly Mandalam --")}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        </div>

                        {/* 6. House / Building Name */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "വീട്ടുപേര് / കെട്ടിടത്തിന്റെ പേര് *" : "House / Building Name *"}
                          </label>
                          <input 
                            type="text" 
                            value={createHouseName}
                            onChange={(e) => setCreateHouseName(e.target.value)}
                            placeholder={lang === "ml" ? "ഉദാ: കൃഷ്ണകൃപ, ഡോർ നമ്പർ 12/34" : "House Name / Door No."}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 7. Street / Locality */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "സ്ട്രീറ്റ് / സ്ഥലം *" : "Street / Locality *"}
                          </label>
                          <input 
                            type="text" 
                            value={createStreetLocality}
                            onChange={(e) => setCreateStreetLocality(e.target.value)}
                            placeholder={lang === "ml" ? "റോഡ് / പ്രദേശം / അടയാളം" : "Street / Locality / Landmark"}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 8. PIN Code */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "പിൻകോഡ് *" : "PIN Code *"}
                          </label>
                          <input 
                            type="text"
                            maxLength={6}
                            value={createPin}
                            onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, ''))}
                            placeholder="6-digit PIN code"
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground" 
                          />
                        </div>

                        {/* 9. State (Fixed Read-only) */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "സംസ്ഥാനം *" : "State *"}
                          </label>
                          <div className="w-full text-xs p-2.5 rounded-xl border border-border bg-slate-100 dark:bg-slate-800 font-bold text-foreground flex items-center justify-between">
                            <span>{lang === "ml" ? "കേരളം (Kerala)" : "Kerala"}</span>
                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-md">Fixed</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Scanning / Loading View - Check Eligibility */}
                    {createFlowStep === "checking" && (
                      <div className="py-6 px-2 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300 min-h-[440px]">
                        {/* Center Graphic: Glowing Halo + Orbiting Dot + Scanning Document Icon */}
                        <div className="relative flex items-center justify-center py-2">
                          {/* Outer Orange Orbit Ring */}
                          <div className="absolute h-36 w-36 rounded-full border border-orange-300/60 dark:border-orange-700/40 animate-spin" style={{ animationDuration: '8s' }}>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-orange-500 shadow-md" />
                          </div>
                          {/* Soft Inner Glowing Circular Gradient Background */}
                          <div className="h-28 w-28 rounded-full bg-gradient-to-b from-orange-100/90 via-orange-50/60 to-orange-100/30 dark:from-orange-950/60 dark:via-orange-900/30 dark:to-orange-950/10 border border-orange-200/80 dark:border-orange-800/60 flex items-center justify-center shadow-inner">
                            <div className="relative h-14 w-14 rounded-xl bg-orange-100/80 dark:bg-orange-900/60 border border-orange-300 dark:border-orange-700 flex flex-col items-center justify-center shadow-xs overflow-hidden">
                              <FileText className="h-9 w-9 text-orange-500 stroke-[1.8]" />
                              {/* Horizontal Scan Beam Line */}
                              <div className="absolute inset-x-0 h-0.5 bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1.5 max-w-xs">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            {lang === "ml" ? "യോഗ്യത പരിശോധിക്കുന്നു..." : "Checking eligibility..."}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-2">
                            {lang === "ml"
                              ? "നിങ്ങളുടെ വിവരങ്ങളുമായി പദ്ധതിയുടെ മാനദണ്ഡങ്ങൾ പൊരുത്തപ്പെടുത്തുന്നു."
                              : "Matching your details with the scheme requirements."}
                          </p>
                        </div>

                        {/* Selected Scheme & Applicant Card Box */}
                        <div className="w-full max-w-sm rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 text-left space-y-3 shadow-2xs">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                              {lang === "ml" ? "തിരഞ്ഞെടുത്ത പദ്ധതി" : "SELECTED SCHEME"}
                            </span>
                            <h4 className="text-sm sm:text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug">
                              {selectedSchemeName || (lang === "ml" ? "ദേശീയ ക്ഷേമ പദ്ധതി" : "National Welfare & Financial Support Program")}
                            </h4>
                          </div>

                          <div className="border-t border-slate-200/80 dark:border-slate-800 pt-3 flex items-center gap-3">
                            <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                                {lang === "ml" ? "അപേക്ഷകൻ" : "Applicant"}
                              </span>
                              <span className="text-xs font-black text-slate-900 dark:text-white block">
                                {createFullName || "Aswin Sasi"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="w-full max-w-sm space-y-2">
                          <div className="h-2 w-full bg-orange-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 rounded-full animate-pulse w-3/4 transition-all duration-1000" />
                          </div>
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 text-center">
                            {lang === "ml" ? "പദ്ധതി മാനദണ്ഡങ്ങൾ പരിശോധിക്കുന്നു..." : "Checking scheme criteria..."}
                          </p>
                        </div>

                        {/* Bottom Security / Keep Open Note */}
                        <div className="pt-2 flex items-start justify-center gap-2 text-left max-w-xs mx-auto">
                          <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-snug">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">
                              {lang === "ml" ? "നിങ്ങൾ നൽകിയ വിവരങ്ങൾ സൂക്ഷിച്ചിരിക്കുന്നു." : "Your entered details are saved."}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 block">
                              {lang === "ml" ? "ദയവായി ഈ സ്ക്രീൻ ഓപ്പണായി നിർത്തുക." : "Please keep this screen open."}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2.5: Specific Single Scheme Eligibility Result View */}
                    {createFlowStep === "eligibility_result" && selectedEligibleScheme && (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left pb-4">
                        {/* Top Green Checkmark Icon & Banner */}
                        <div className="text-center pt-2 pb-1 space-y-2">
                          <div className="relative flex items-center justify-center mx-auto">
                            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs border border-emerald-300 dark:border-emerald-800">
                              <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                                <Check className="h-6 w-6 stroke-[3]" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-foreground">
                              {lang === "ml" ? "നിങ്ങൾക്ക് അർഹതയുണ്ടാകാം" : "You may be eligible"}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">
                              {lang === "ml" ? "നിങ്ങൾ നൽകിയ വിവരങ്ങൾ അടിസ്ഥാനമാക്കി." : "Based on the details you provided."}
                            </p>
                          </div>
                        </div>

                        {/* Card: Selected Scheme details & Checks */}
                        <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
                          {/* Card Header Section */}
                          <div className="p-3.5 space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                              {lang === "ml" ? "തിരഞ്ഞെടുത്ത പദ്ധതി" : "SELECTED SCHEME"}
                            </span>
                            <h4 className="font-extrabold text-sm text-foreground">
                              {selectedSchemeName || (lang === "ml" ? selectedEligibleScheme.titleMl : selectedEligibleScheme.titleEn)}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {lang === "ml"
                                ? "പ്രാഥമിക അർഹതാ മാനദണ്ഡങ്ങൾ അനുസരിച്ച് നിങ്ങൾ അർഹനാണ്."
                                : "You appear to meet the initial eligibility criteria."}
                            </p>
                          </div>

                          <div className="h-[1px] bg-border/80 w-full" />

                          {/* Row 1: Applicant Details */}
                          <div className="p-3.5 flex items-center justify-between gap-3 bg-card">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-900/40">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-foreground leading-snug">
                                  {lang === "ml" ? "അപേക്ഷകന്റെ വിവരങ്ങൾ" : "Applicant details"}
                                </h5>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {lang === "ml" ? "നിങ്ങളുടെ അപേക്ഷയ്ക്കായി വിവരങ്ങൾ സൂക്ഷിച്ചു." : "Details saved for your application."}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCreateFlowStep("form")}
                              className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 shrink-0 cursor-pointer"
                            >
                              {lang === "ml" ? "തിരുത്തുക" : "Edit"}
                            </button>
                          </div>

                          <div className="h-[1px] bg-border/80 w-full" />

                          {/* Row 2: View Eligibility Checks Accordion */}
                          <div>
                            <button
                              type="button"
                              onClick={() => setShowEligibilityDetails(!showEligibilityDetails)}
                              className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-muted/40 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-900/40">
                                  <Check className="h-4 w-4 stroke-[2.5]" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-xs text-foreground leading-snug">
                                    {lang === "ml" ? "അർഹതാ പരിശോധനകൾ കാണുക" : "View eligibility checks"}
                                  </h5>
                                </div>
                              </div>
                              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${showEligibilityDetails ? "rotate-180" : ""}`} />
                            </button>

                            {/* Collapsible content */}
                            {showEligibilityDetails && (
                              <div className="px-3.5 pb-3.5 pt-1 space-y-2 bg-muted/20 text-xs border-t border-border/40">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span>{lang === "ml" ? "വരുമാന പരിധി യോഗ്യത പൂർത്തിയായി" : "Income Criteria Verified"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span>{lang === "ml" ? "മേഖല / മണ്ഡലം പരിധി യോഗ്യമാണ്" : "Regional Location Matched"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span>{lang === "ml" ? "പ്രായപരിധി മാനദണ്ഡങ്ങൾ പാലിക്കപ്പെട്ടു" : "Age Limit Requirements Met"}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Section: What happens next? */}
                        <div className="pt-1 space-y-2.5">
                          <h4 className="font-extrabold text-xs text-foreground px-0.5">
                            {lang === "ml" ? "അടുത്തത് എന്താണ്?" : "What happens next?"}
                          </h4>

                          <div className="space-y-2">
                            {/* Step 1 */}
                            <div className="flex items-start gap-3 p-2.5 bg-card rounded-xl border border-border/70 shadow-2xs">
                              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/50 dark:border-orange-900/40">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 pt-0.5">
                                <h5 className="font-bold text-xs text-foreground leading-tight">
                                  {lang === "ml" ? "ബാക്കി വിവരങ്ങൾ പൂർത്തിയാക്കുക" : "Complete remaining details"}
                                </h5>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                  {lang === "ml" ? "പ്രൊഫൈൽ പൂർത്തിയാക്കാൻ ആവശ്യമായ വിവരങ്ങൾ നൽകുക." : "Fill required info to complete your profile."}
                                </p>
                              </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start gap-3 p-2.5 bg-card rounded-xl border border-border/70 shadow-2xs">
                              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/50 dark:border-orange-900/40">
                                <Upload className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 pt-0.5">
                                <h5 className="font-bold text-xs text-foreground leading-tight">
                                  {lang === "ml" ? "ആവശ്യമായ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക" : "Upload required documents"}
                                </h5>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                  {lang === "ml" ? "തിരിച്ചറിയൽ രേഖയും വരുമാന സർട്ടിഫിക്കറ്റും സമർപ്പിക്കുക." : "Submit proof of identity and income."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer / Application Action */}
                        <div className="pt-2 text-center space-y-2">
                          <p className="text-[11px] text-muted-foreground font-medium">
                            {lang === "ml" ? "നിങ്ങൾ നൽകിയ വിവരങ്ങൾ ഇതോടൊപ്പം ചേർക്കും." : "Your entered details will be carried forward."}
                          </p>

                          <button
                            type="button"
                            onClick={() => setCreateFlowStep("scheme_details")}
                            className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>{lang === "ml" ? "അപേക്ഷ തുടരുക" : "Continue Application"}</span>
                            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                          </button>

                          <p className="text-[10px] text-muted-foreground/80 font-medium pt-0.5">
                            {lang === "ml" ? "അന്തിമ അനുമതി പരിശോധനയ്ക്ക് വിധേയമാണ്." : "Final approval is subject to verification."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Eligible Schemes View */}
                    {createFlowStep === "eligible_schemes" && (
                      <div className="space-y-3.5 animate-in fade-in duration-200">
                        {/* Compact Applicant Summary Card */}
                        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-3.5 rounded-2xl border border-orange-200 dark:border-orange-900/60 shadow-2xs flex items-center justify-between gap-2">
                          <div className="space-y-1 text-left min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-xs text-foreground truncate">
                                {createFullName || "Soman P"}
                              </span>
                              <span className="text-[9.5px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/80 px-2 py-0.5 rounded-full shrink-0">
                                {createCaste || "General"}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-muted-foreground truncate">
                              Aadhaar: XXXX-XXXX-{(createAadhaar || "8921").slice(-4)} • {createCountryCode} {createPhone || "9847123456"}
                            </p>
                            <p className="text-[10px] text-muted-foreground/90 truncate">
                              {createDistrict || "Thiruvananthapuram"} • {createMandalam || "Kazhakkoottam"} • Income: {createIncomeRange || "Below ₹1,00,000"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setCreateFlowStep("form")}
                            className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100/80 hover:bg-orange-200 dark:bg-orange-950/80 hover:dark:bg-orange-900/80 px-2.5 py-1.5 rounded-xl border border-orange-300 dark:border-orange-800 transition-colors cursor-pointer shrink-0 shadow-2xs"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>{lang === "ml" ? "മാറ്റുക" : "Edit"}</span>
                          </button>
                        </div>

                        {/* Search Bar for Eligible Schemes */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            value={eligibleSchemesSearchQuery}
                            onChange={(e) => setEligibleSchemesSearchQuery(e.target.value)}
                            placeholder={lang === "ml" ? "പദ്ധതിയുടെ പേര് തിരയുക..." : "Search eligible schemes..."}
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border bg-card focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          />
                          {eligibleSchemesSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setEligibleSchemesSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Eligible Scheme Cards or Empty State */}
                        {mockEligibleSchemesList.filter((s) => {
                          if (!eligibleSchemesSearchQuery.trim()) return true;
                          const q = eligibleSchemesSearchQuery.toLowerCase();
                          return (
                            s.titleEn.toLowerCase().includes(q) ||
                            s.titleMl.toLowerCase().includes(q) ||
                            s.deptEn.toLowerCase().includes(q) ||
                            s.benefitEn.toLowerCase().includes(q)
                          );
                        }).length > 0 ? (
                          <div className="space-y-3">
                            {mockEligibleSchemesList
                              .filter((s) => {
                                if (!eligibleSchemesSearchQuery.trim()) return true;
                                const q = eligibleSchemesSearchQuery.toLowerCase();
                                return (
                                  s.titleEn.toLowerCase().includes(q) ||
                                  s.titleMl.toLowerCase().includes(q) ||
                                  s.deptEn.toLowerCase().includes(q) ||
                                  s.benefitEn.toLowerCase().includes(q)
                                );
                              })
                              .map((scheme) => (
                                <div
                                  key={scheme.id}
                                  className="bg-card p-3.5 rounded-2xl border border-border shadow-2xs hover:border-orange-300 dark:hover:border-orange-800 transition-all space-y-2.5 text-left"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/60">
                                        {lang === "ml" ? scheme.categoryMl : scheme.categoryEn}
                                      </span>
                                      <h4 className="font-extrabold text-xs text-foreground mt-1.5 leading-snug">
                                        {lang === "ml" ? scheme.titleMl : scheme.titleEn}
                                      </h4>
                                    </div>
                                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full shrink-0 border border-emerald-300 dark:border-emerald-800">
                                      {lang === "ml" ? scheme.matchLabelMl : scheme.matchLabelEn}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    {lang === "ml" ? scheme.benefitMl : scheme.benefitEn}
                                  </p>

                                  <div className="pt-2 border-t border-border/80 flex items-center justify-between gap-2">
                                    <span className="text-[10px] text-muted-foreground font-medium truncate">
                                      {lang === "ml" ? scheme.deptMl : scheme.deptEn}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedEligibleScheme(scheme);
                                        setCreateFlowStep("scheme_details");
                                      }}
                                      className="py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                                    >
                                      {lang === "ml" ? "സ്കീം തിരഞ്ഞെടുക്കുക" : "Select Scheme"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          /* Empty & Retry State */
                          <div className="bg-card border border-border p-6 rounded-2xl shadow-2xs text-center space-y-3 my-2">
                            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                              <SearchX className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-xs text-foreground">
                                {lang === "ml" ? "പൊരുത്തപ്പെടുന്ന പദ്ധതികൾ കണ്ടെത്തിയില്ല" : "No matching schemes found"}
                              </h4>
                              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                                {lang === "ml"
                                  ? "നിങ്ങൾ നൽകിയ തിരച്ചിൽ വാക്കിന് അനുയോജ്യമായ പദ്ധതികളില്ല. തിരച്ചിൽ മാറ്റി ശ്രമിക്കുക."
                                  : "Try adjusting your search criteria or clear filters to view available schemes."}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEligibleSchemesSearchQuery("")}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-2xs cursor-pointer"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span>{lang === "ml" ? "വീണ്ടും ശ്രമിക്കുക" : "Retry Search"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Missing Scheme-Specific Details View */}
                    {createFlowStep === "scheme_details" && selectedEligibleScheme && (
                      <div className="space-y-3.5 bg-card p-3.5 rounded-2xl border border-border shadow-2xs text-left animate-in fade-in duration-200">
                        <div className="bg-orange-50 dark:bg-orange-950/50 p-2.5 rounded-xl border border-orange-200 dark:border-orange-800 text-[11px] text-orange-900 dark:text-orange-200 font-medium">
                          {lang === "ml"
                            ? `അപേക്ഷകന്റെ വിവരങ്ങൾ (${createFullName}) വിജയകരമായി കൈമാറി. ഈ സ്കീമിനുള്ള അവസാന വിവരങ്ങൾ നൽകുക.`
                            : `Applicant profile for ${createFullName || "Soman P"} carried forward. Complete missing scheme documents.`}
                        </div>

                        {/* Document Upload Box */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-foreground block">
                            {lang === "ml" ? "ആവശ്യമായ രേഖ സമർപ്പിക്കുക *" : "Required Document Upload *"}
                          </label>
                          <p className="text-[10.5px] text-muted-foreground">
                            {lang === "ml" ? selectedEligibleScheme.requiredDocMl : selectedEligibleScheme.requiredDocEn}
                          </p>
                          <div className="border-2 border-dashed border-border hover:border-orange-400 p-3.5 rounded-xl text-center bg-background transition-colors cursor-pointer"
                            onClick={() => setUploadedDocName(`${selectedEligibleScheme.id}_Document_Proof.pdf`)}
                          >
                            <Upload className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                            {uploadedDocName ? (
                              <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                <FileCheck className="h-4 w-4" />
                                <span>{uploadedDocName}</span>
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-muted-foreground">
                                {lang === "ml" ? "രേഖ അപ്‌ലോഡ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക (PDF/JPG)" : "Tap to upload file (PDF, JPG - Max 5MB)"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bank Account Number */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ബാങ്ക് അക്കൗണ്ട് നമ്പർ *" : "Bank Account Number *"}
                          </label>
                          <input
                            type="text"
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="e.g. 398201004821"
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                          />
                        </div>

                        {/* Bank IFSC Code */}
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">
                            {lang === "ml" ? "ബാങ്ക് IFSC കോഡ് *" : "Bank IFSC Code *"}
                          </label>
                          <input
                            type="text"
                            value={bankIfscCode}
                            onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                            placeholder="e.g. SBIN0001234"
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground uppercase"
                          />
                        </div>

                        {/* Declaration Checkbox */}
                        <div className="flex items-start gap-2 pt-2 border-t border-border">
                          <input
                            type="checkbox"
                            id="scheme_decl"
                            checked={declarationAccepted}
                            onChange={(e) => setDeclarationAccepted(e.target.checked)}
                            className="mt-0.5 accent-orange-500 rounded h-4 w-4 cursor-pointer"
                          />
                          <label htmlFor="scheme_decl" className="text-[10.5px] text-muted-foreground leading-tight cursor-pointer">
                            {lang === "ml"
                              ? "നൽകിയിട്ടുള്ള എല്ലാ വിവരങ്ങളും സത്യസന്ധവും കൃത്യവുമാണെന്ന് ഇതിനാൽ സാക്ഷ്യപ്പെടുത്തുന്നു."
                              : "I confirm that all supplied profile details and documents are authentic and accurate."}
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Submitted Success View */}
                    {createFlowStep === "submitted" && (
                      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs text-center space-y-4 my-2 animate-in zoom-in-95 duration-200">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                          <Check className="h-8 w-8 stroke-[3]" />
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-base font-extrabold text-foreground">
                            {lang === "ml" ? "അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു!" : "Application Submitted Successfully!"}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {lang === "ml"
                              ? "നിങ്ങളുടെ അപേക്ഷ പരിശോധനയ്ക്കായി അതത് ഉദ്യോഗസ്ഥർക്ക് അയച്ചിട്ടുണ്ട്."
                              : "Your welfare application has been registered and assigned an official tracking code."}
                          </p>
                        </div>

                        <div className="p-3 bg-muted/60 rounded-xl border border-border text-center space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            {lang === "ml" ? "അപേക്ഷ റെഫറൻസ് നമ്പർ" : "Application Reference No"}
                          </span>
                          <span className="text-sm font-black text-orange-600 dark:text-orange-400 tracking-wide font-mono">
                            VK-2026-849201
                          </span>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("applications");
                              setCreateFlowStep("form");
                            }}
                            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                          >
                            {lang === "ml" ? "അപേക്ഷകൾ കാണുക" : "View All Applications"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCreateFlowStep("form");
                              setUploadedDocName("");
                              setBankAccountNumber("");
                              setBankIfscCode("");
                              setDeclarationAccepted(false);
                            }}
                            className="w-full py-2.5 rounded-xl bg-muted text-foreground font-semibold text-xs hover:bg-muted/80 transition-colors cursor-pointer"
                          >
                            {lang === "ml" ? "മറ്റൊരു അപേക്ഷ നൽകുക" : "Submit Another Application"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3 bg-card p-3 rounded-2xl border border-border shadow-2xs">
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 font-bold">
                        AI
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">SahAI Scheme Assistant</h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "പദ്ധതി സംശയങ്ങൾക്കും സഹായങ്ങൾക്കുമായി സംസാരിക്കൂ." : "Instant assistance for scheme eligibility and application guidance."}
                        </p>
                      </div>
                    </div>
                    <div className="border border-border rounded-xl p-2.5 bg-background text-xs space-y-2">
                      <p className="text-muted-foreground font-medium">
                        {lang === "ml" ? "ഹെൽപ്പ്ഡെസ്ക് നമ്പർ: +91 1800 200 400" : "Helpdesk Helpline: 1800-200-400 (Toll Free)"}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("create");
                          setCreateFlowStep("form");
                        }}
                        className="w-full py-2 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
                      >
                        {lang === "ml" ? "നേരിട്ട് അപേക്ഷിക്കുക" : "Apply Directly"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(activeTab as string) === "more" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-border/80 pb-2 px-0.5">
                  <h3 className="font-extrabold text-sm text-foreground">
                    {lang === "ml" ? "കൂടുതൽ സേവനങ്ങൾ" : "More Navigation"}
                  </h3>
                  <span className="text-[10.5px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    {lang === "ml" ? "മെനു" : "Quick Menu"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* 1. Leaderboard */}
                  <button
                    type="button"
                    onClick={() => setMobileSubPage("leaderboard")}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-all cursor-pointer shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-amber-600 transition-colors">
                          {lang === "ml" ? "ലീഡർബോർഡ്" : "Leaderboard"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "വാർഡ്, പ്രവർത്തക റാങ്കിംഗുകൾ" : "Ward & worker performance rankings"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 2. Beneficiaries */}
                  <button
                    type="button"
                    onClick={() => setMobileSubPage("beneficiaries")}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-all cursor-pointer shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-rose-600 transition-colors">
                          {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "സ്ഥിരീകരിച്ച ഗുണഭോക്താക്കളുടെ വിവരങ്ങൾ" : "Verified benefit recipients list"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 3. Applications */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("applications");
                      setMobileSubPage("none");
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all cursor-pointer shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-blue-600 transition-colors">
                          {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "അപേക്ഷകളും എസ്‌എൽഎ ട്രാക്കിംഗും" : "SLA tracking & service requests"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 4. Schemes */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("schemes");
                      setMobileSubPage("none");
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-all cursor-pointer shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-purple-600 transition-colors">
                          {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "കേന്ദ്ര, സംസ്ഥാന ക്ഷേമപദ്ധതികൾ" : "Central & State welfare schemes"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 5. Settings */}
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu(true)}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                        <Sliders className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-emerald-600 transition-colors">
                          {lang === "ml" ? "ക്രമീകരണങ്ങൾ" : "Settings"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground">
                          {lang === "ml" ? "ആപ്പ് ക്രമീകരണങ്ങളും ഫിൽട്ടറുകളും" : "App scope filters & preferences"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            )
          }
          </div>

          {/* Sticky Phone App Bottom Footer Navigation */}
          {activeTab === "create" ? (
            <div className="sticky bottom-0 left-0 right-0 p-3 bg-card/95 backdrop-blur-md border-t border-border z-30 shadow-lg">
              {createFlowStep === "form" && (
                <button
                  type="button"
                  disabled={!isCreateFormValid}
                  onClick={handleStartEligibilityCheck}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all ${
                    isCreateFormValid
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-primary text-white active:scale-[0.98] cursor-pointer"
                      : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                  }`}
                >
                  {lang === "ml" ? "യോഗ്യത പരിശോധിക്കുക" : "Check Eligibility"}
                </button>
              )}

              {createFlowStep === "checking" && (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl font-bold text-xs shadow-md bg-orange-500/80 text-white flex items-center justify-center gap-2 cursor-wait"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{lang === "ml" ? "യോഗ്യത പരിശോധിക്കുന്നു..." : "Checking eligibility…"}</span>
                </button>
              )}

              {createFlowStep === "eligible_schemes" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateFlowStep("form")}
                    className="w-1/3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs text-foreground transition-colors cursor-pointer"
                  >
                    {lang === "ml" ? "എഡിറ്റ് ഫോം" : "Edit Form"}
                  </button>
                  <p className="w-2/3 text-[10.5px] font-semibold text-muted-foreground flex items-center justify-center text-center bg-muted/40 rounded-xl px-2">
                    {lang === "ml" ? "മുകളിലുള്ള 'Select Scheme' ക്ലിക്ക് ചെയ്യുക" : "Tap 'Select Scheme' on a scheme above"}
                  </p>
                </div>
              )}

              {createFlowStep === "scheme_details" && (
                <button
                  type="button"
                  onClick={() => {
                    setCreateFlowStep("submitted");
                  }}
                  className="w-full py-3 rounded-xl font-extrabold text-xs shadow-md bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white active:scale-[0.98] transition-all cursor-pointer"
                >
                  {lang === "ml" ? "അപേക്ഷ സമർപ്പിക്കുക" : "Submit Application"}
                </button>
              )}

              {createFlowStep === "submitted" && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("applications");
                    setCreateFlowStep("form");
                  }}
                  className="w-full py-3 rounded-xl font-bold text-xs shadow-md bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
                >
                  {lang === "ml" ? "അപേക്ഷകൾ കാണുക" : "Go to Applications List"}
                </button>
              )}
            </div>
          ) : (
            ((mobileSubPage === "none" || mobileSubPage === "leaderboard" || mobileSubPage === "beneficiaries" || mobileSubPage === "app_detail" || mobileSubPage === "category_schemes") && (
              <AdminMobileAppBottomNav
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setMobileSubPage("none");
                  setShowMoreMenu(false);
                }}
              />
            ))
          )}

          {/* Home Bar Indicator */}
          {deviceModel === "iphone" && (
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-28 bg-foreground/30 rounded-full z-50 pointer-events-none" />
          )}

          {/* More Navigation Menu Popup Modal */}
          {showMoreMenu && (
            <div 
              className="absolute inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 rounded-[36px] overflow-hidden"
              onClick={() => setShowMoreMenu(false)}
            >
              <div 
                className="w-full rounded-t-[28px] bg-white dark:bg-slate-900 p-4 shadow-2xl transition-all border-t border-x border-amber-200/80 dark:border-amber-900/60 animate-in slide-in-from-bottom-full duration-300 flex flex-col space-y-3 pb-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Sheet Handle */}
                <div className="w-9 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1 mb-1 shrink-0" />
                
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <span className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4 text-[#ea580c]" />
                    <span>{lang === "ml" ? "കൂടുതൽ മെനു" : "More Options"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMoreMenu(false)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Popup Options List */}
                <div className="space-y-2 pt-1">
                  {/* Option 1: Leaderboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSubPage("leaderboard");
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-amber-600 transition-colors">
                          {lang === "ml" ? "ലീഡർബോർഡ്" : "Leaderboard"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground leading-tight">
                          {lang === "ml" ? "വാർഡ്, പ്രവർത്തക റാങ്കിംഗുകൾ" : "Ward & worker rankings"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Option 2: Beneficiaries */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSubPage("beneficiaries");
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-rose-600 transition-colors">
                          {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground leading-tight">
                          {lang === "ml" ? "സ്ഥിരീകരിച്ച ഗുണഭോക്താക്കളുടെ വിവരങ്ങൾ" : "Verified beneficiaries list"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Option 3: Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setShowFilterMenu(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                        <Sliders className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-emerald-600 transition-colors">
                          {lang === "ml" ? "ക്രമീകരണങ്ങൾ" : "Settings"}
                        </h4>
                        <p className="text-[10.5px] text-muted-foreground leading-tight">
                          {lang === "ml" ? "ഭൂമിശാസ്ത്ര ഫിൽട്ടറുകളും ക്രമീകരണങ്ങളും" : "App scope filters & preferences"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Date & Period Picker Bottom Sheet Modal (In-App Popup) */}
          <DatePickerModal
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={(period, customLabel) => {
              setSelectedPeriod(period);
              if (customLabel) setPeriodCustomLabel(customLabel);
            }}
            inlineInApp={true}
          />

          {/* Interactive Filter Modal Overlay (Same popup UI as Calendar Modal) */}
          {showFilterMenu && (
            <div 
              className="absolute inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 rounded-[36px] overflow-hidden"
              onClick={() => {
                      setAppliedGeoMode(geoMode);
                      if (geoMode === "assembly") {
                        setAppliedDistrict(draftDistrict);
                        setAppliedMandalam(draftMandalam);
                        setAppliedBooth(draftBooth);
                        if (draftBooth !== "all") {
                          setFilterGeoScope("booth");
                          setSelectedDistrict(draftDistrict);
                          setSelectedMandalam(draftMandalam);
                          setSelectedBooth(draftBooth);
                        } else if (draftMandalam !== "all") {
                          setFilterGeoScope("mandalam");
                          setSelectedDistrict(draftDistrict);
                          setSelectedMandalam(draftMandalam);
                        } else if (draftDistrict !== "all") {
                          setFilterGeoScope("district");
                          setSelectedDistrict(draftDistrict);
                        } else {
                          setFilterGeoScope("state");
                        }
                      } else {
                        setAppliedLBType(draftLBType);
                        setAppliedLBDistrict(draftLBDistrict);
                        setAppliedLocalBody(draftLocalBody);
                        setAppliedWard(draftWard);
                        if (draftWard !== "all") {
                          setFilterGeoScope("booth");
                        } else if (draftLocalBody !== "all") {
                          setFilterGeoScope("area");
                        } else if (draftLBDistrict !== "all") {
                          setFilterGeoScope("district");
                        } else {
                          setFilterGeoScope("state");
                        }
                      }
                      setShowFilterMenu(false);
                    }}
            >
              <div 
                className="w-full rounded-t-[28px] bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xl transition-all border-t border-x border-amber-200/80 dark:border-amber-900/60 animate-in slide-in-from-bottom-full duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Sheet Handle */}
                <div className="w-9 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1 mb-2 shrink-0" />
                
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-amber-200/60 dark:border-amber-900/40 shrink-0">
                  <span className="text-sm sm:text-base font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-[#ff5500]" />
                    <span>{lang === "ml" ? "ഫിൽട്ടറുകൾ" : "Filters"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu(false)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Filter Inputs Area - Clean layout with generous spacing */}
                <div className="space-y-3.5 my-2.5 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Geography / Scope Filter + Cascading Selection Controls */}
                    <div className="col-span-2 flex flex-col gap-3 p-3 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/80">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1">
                          <span>{lang === "ml" ? "ഭൂമിശാസ്ത്രം / മേഖല" : "GEOGRAPHY SCOPE"}</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/80 px-2 py-0.5 rounded-full uppercase">
                          {geoMode === "assembly" ? "Assembly / Booth" : "Local Bodies"}
                        </span>
                      </div>

                      {/* Mode Segmented Tab Selector */}
                      <div className="flex rounded-lg bg-amber-200/60 dark:bg-amber-950/60 p-0.5 border border-amber-300/80 dark:border-amber-800/80">
                        <button
                          type="button"
                          onClick={() => setGeoMode("assembly")}
                          className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            geoMode === "assembly"
                              ? "bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 shadow-2xs"
                              : "text-amber-800 dark:text-amber-300 hover:text-amber-950"
                          }`}
                        >
                          {lang === "ml" ? "അസംബ്ലി / ബൂത്ത്" : "Assembly / Booth"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setGeoMode("local_body")}
                          className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            geoMode === "local_body"
                              ? "bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 shadow-2xs"
                              : "text-amber-800 dark:text-amber-300 hover:text-amber-950"
                          }`}
                        >
                          {lang === "ml" ? "തദ്ദേശ സ്ഥാപനങ്ങൾ" : "Local Bodies"}
                        </button>
                      </div>

                      {/* Mode 1: Assembly / Booth */}
                      {geoMode === "assembly" && (
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* District */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "ജില്ല" : "District"}
                            </label>
                            <select
                              value={draftDistrict}
                              onChange={(e) => {
                                const newDist = e.target.value;
                                setDraftDistrict(newDist);
                                setDraftMandalam("all");
                                setDraftBooth("all");
                              }}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ ജില്ലകളും" : "All Districts"}</option>
                              {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d[lang]}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Mandalam */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "മണ്ഡലം" : "Mandalam"}
                            </label>
                            <select
                              value={draftMandalam}
                              disabled={draftDistrict === "all"}
                              onChange={(e) => {
                                setDraftMandalam(e.target.value);
                                setDraftBooth("all");
                              }}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ മണ്ഡലങ്ങളും" : "All Mandalams"}</option>
                              {(draftDistrict === "all"
                                ? constituencies
                                : constituencies.filter((c) => c.districtId === draftDistrict)
                              ).map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c[lang]}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Booth */}
                          <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "ബൂത്ത്" : "Booth"}
                            </label>
                            <select
                              value={draftBooth}
                              disabled={draftMandalam === "all"}
                              onChange={(e) => setDraftBooth(e.target.value)}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ ബൂത്തുകളും" : "All Booths"}</option>
                              {[101, 102, 103, 104, 105, 106, 107, 108, 109, 110].map((num) => (
                                <option key={num} value={`booth_${num}`}>
                                  {lang === "ml" ? `ബൂത്ത് #${num}` : `Booth #${num}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Mode 2: Local Bodies */}
                      {geoMode === "local_body" && (
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* District */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "ജില്ല" : "District"}
                            </label>
                            <select
                              value={draftLBDistrict}
                              onChange={(e) => {
                                setDraftLBDistrict(e.target.value);
                                setDraftLocalBody("all");
                                setDraftWard("all");
                              }}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ ജില്ലകളും" : "All Districts"}</option>
                              {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d[lang]}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Local Body Type */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "തദ്ദേശ സ്ഥാപന തരം" : "Local Body Type"}
                            </label>
                            <select
                              value={draftLBType}
                              onChange={(e) => {
                                setDraftLBType(e.target.value);
                                setDraftLocalBody("all");
                                setDraftWard("all");
                              }}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ തരങ്ങളും" : "All Types"}</option>
                              <option value="corporation">{lang === "ml" ? "കോർപ്പറേഷൻ" : "Corporation"}</option>
                              <option value="municipality">{lang === "ml" ? "മുനിസിപ്പാലിറ്റി" : "Municipality"}</option>
                              <option value="panchayat">{lang === "ml" ? "ഗ്രാമ പഞ്ചായത്ത്" : "Grama Panchayat"}</option>
                            </select>
                          </div>

                          {/* Local Body */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "തദ്ദേശ സ്ഥാപനം" : "Local Body"}
                            </label>
                            <select
                              value={draftLocalBody}
                              onChange={(e) => {
                                setDraftLocalBody(e.target.value);
                                setDraftWard("all");
                              }}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ തദ്ദേശ സ്ഥാപനങ്ങളും" : "All Local Bodies"}</option>
                              {panchayats
                                .filter((p) => (draftLBDistrict === "all" || p.districtId === draftLBDistrict) && (draftLBType === "all" || p.type === draftLBType))
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p[lang]}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Ward */}
                          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "വാർഡ്" : "Ward"}
                            </label>
                            <select
                              value={draftWard}
                              disabled={draftLocalBody === "all"}
                              onChange={(e) => setDraftWard(e.target.value)}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ വാർഡുകളും" : "All Wards"}</option>
                              {wards.map((w) => (
                                <option key={w.id} value={w.id}>
                                  {lang === "ml" ? `വാർഡ് ${w.label}` : `Ward ${w.label}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scheme Category Filter */}
                    <div className="col-span-2 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>{lang === "ml" ? "പദ്ധതി വിഭാഗം" : "Scheme Category"}</span>
                        <span className="text-[10px] text-slate-500">Default: All Categories</span>
                      </label>
                      <select
                        value={appSchemeCategoryFilter}
                        onChange={(e) => setAppSchemeCategoryFilter(e.target.value)}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories"}</option>
                        <option value="agriculture">{lang === "ml" ? "കൃഷി" : "Agriculture"}</option>
                        <option value="education">{lang === "ml" ? "വിദ്യാഭ്യാസം" : "Education"}</option>
                        <option value="health">{lang === "ml" ? "ആരോഗ്യം" : "Health"}</option>
                        <option value="housing">{lang === "ml" ? "ഭവനം" : "Housing"}</option>
                        <option value="pension_welfare">{lang === "ml" ? "പെൻഷൻ & ക്ഷേമം" : "Pension & Welfare"}</option>
                        <option value="women_welfare">{lang === "ml" ? "വനിതാ ക്ഷേമം" : "Women Welfare"}</option>
                        <option value="employment">{lang === "ml" ? "തൊഴിൽ" : "Employment"}</option>
                        <option value="msme">{lang === "ml" ? "എം.എസ്.എം.ഇ & ബിസിനസ്" : "MSME & Business"}</option>
                      </select>
                    </div>

                    {/* Application Date Filter */}
                    <div className="col-span-2 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>{lang === "ml" ? "അപേക്ഷാ തീയതി" : "Application Date"}</span>
                        <span className="text-[10px] text-slate-500">Default: All Dates</span>
                      </label>
                      <select
                        value={appDateFilter}
                        onChange={(e) => setAppDateFilter(e.target.value)}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ തീയതികളും" : "All Dates"}</option>
                        <option value="today">{lang === "ml" ? "ഇന്ന്" : "Today"}</option>
                        <option value="7days">{lang === "ml" ? "കഴിഞ്ഞ 7 ദിവസം" : "Last 7 Days"}</option>
                        <option value="30days">{lang === "ml" ? "കഴിഞ്ഞ 30 ദിവസം" : "Last 30 Days"}</option>
                        <option value="custom">{lang === "ml" ? "കസ്റ്റം പരിധി" : "Custom Range"}</option>
                      </select>

                      {appDateFilter === "custom" && (
                        <div className="grid grid-cols-2 gap-2 pt-1.5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">From Date</span>
                            <input
                              type="date"
                              value={appCustomStartDate}
                              onChange={(e) => setAppCustomStartDate(e.target.value)}
                              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">To Date</span>
                            <input
                              type="date"
                              value={appCustomEndDate}
                              onChange={(e) => setAppCustomEndDate(e.target.value)}
                              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar: Reset & Apply Filters */}
                <div className="pt-2.5 mt-2 border-t border-amber-200/80 dark:border-amber-900/60 shrink-0 z-20 bg-white dark:bg-slate-900 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterGeoScope("state");
                      setFilterScheme("all");
                      setFilterSchemeCategory("all");
                      setFilterSchemeType("all");
                      setFilterDepartment("all");
                      setFilterPerformance("all");
                      setActiveDistrictFilter("all");
                      setAppSchemeCategoryFilter("all");
                      setAppAssistanceStatusFilter("all");
                      setAppDateFilter("all");
                      setAppCustomStartDate("");
                      setAppCustomEndDate("");
                    }}
                    className="w-1/3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold text-xs py-3 shadow-xs hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>{lang === "ml" ? "റീസെറ്റ്" : "Reset"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFilterMenu(false)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white font-black text-xs sm:text-sm py-3 shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    <span>{lang === "ml" ? "ഫിൽട്ടറുകൾ പ്രയോഗിക്കുക" : "Apply Filters"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Address Searchable Bottom Sheet Overlay Modal */}
          {activeAddressSheet && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
              <div className="bg-background border-t border-border rounded-t-3xl p-4 max-h-[80%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="font-extrabold text-sm text-foreground">
                    {activeAddressSheet === "district" && (lang === "ml" ? "ജില്ല തിരഞ്ഞെടുക്കുക" : "Select District")}
                    {activeAddressSheet === "localBody" && (lang === "ml" ? "തദ്ദേശ സ്ഥാപനം തിരഞ്ഞെടുക്കുക" : "Select Local Body")}
                    {activeAddressSheet === "ward" && (lang === "ml" ? "വാർഡ് തിരഞ്ഞെടുക്കുക" : "Select Ward")}
                    {activeAddressSheet === "mandalam" && (lang === "ml" ? "നിയമസഭാ മണ്ഡലം തിരഞ്ഞെടുക്കുക" : "Select Assembly Mandalam")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAddressSheet(null);
                      setAddressSheetSearch("");
                    }}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="py-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={addressSheetSearch}
                      onChange={(e) => setAddressSheetSearch(e.target.value)}
                      placeholder={lang === "ml" ? "തിരയുക..." : "Search..."}
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-border bg-muted/40 focus:bg-background focus:ring-1 focus:ring-orange-500 outline-none text-foreground"
                    />
                    {addressSheetSearch && (
                      <button
                        type="button"
                        onClick={() => setAddressSheetSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Options List */}
                <div className="overflow-y-auto flex-1 space-y-1 pr-1 min-h-[200px]">
                  {activeAddressSheet === "district" &&
                    districts
                      .filter((d) =>
                        d.en.toLowerCase().includes(addressSheetSearch.toLowerCase()) ||
                        d.ml.includes(addressSheetSearch)
                      )
                      .map((d) => {
                        const isSelected = createDistrict === d.en;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleDistrictSelect(d.en)}
                            className={`w-full p-3 text-left rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 text-white font-bold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span>{lang === "ml" ? d.ml : d.en}</span>
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}

                  {activeAddressSheet === "localBody" &&
                    panchayats
                      .filter((p) => {
                        const distObj = districts.find((d) => d.en === createDistrict);
                        const isDistrictMatch = !distObj || p.districtId === distObj.id;
                        const isTypeMatch = !createLocalBodyType || p.type === createLocalBodyType;
                        const isSearchMatch =
                          p.en.toLowerCase().includes(addressSheetSearch.toLowerCase()) ||
                          p.ml.includes(addressSheetSearch);
                        return isDistrictMatch && isTypeMatch && isSearchMatch;
                      })
                      .map((p) => {
                        const isSelected = createLocalBody === p.en;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleLocalBodySelect(p.en)}
                            className={`w-full p-3 text-left rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 text-white font-bold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span>{lang === "ml" ? p.ml : p.en}</span>
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}

                  {activeAddressSheet === "ward" &&
                    getWardsForLocalBody(createLocalBody)
                      .filter(
                        (w) =>
                          w.nameEn.toLowerCase().includes(addressSheetSearch.toLowerCase()) ||
                          w.nameMl.includes(addressSheetSearch) ||
                          w.number.toString().includes(addressSheetSearch)
                      )
                      .map((w) => {
                        const wardDisplay = `Ward ${w.number} - ${lang === "ml" ? w.nameMl : w.nameEn}`;
                        const isSelected = createWard === wardDisplay;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => handleWardSelect(w)}
                            className={`w-full p-3 text-left rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 text-white font-bold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <div>
                              <span className="font-bold">Ward {w.number}: </span>
                              <span>{lang === "ml" ? w.nameMl : w.nameEn}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}

                  {activeAddressSheet === "mandalam" &&
                    constituencies
                      .filter((c) => {
                        const distObj = districts.find((d) => d.en === createDistrict);
                        const isDistrictMatch = !distObj || c.districtId === distObj.id;
                        const isSearchMatch =
                          c.en.toLowerCase().includes(addressSheetSearch.toLowerCase()) ||
                          c.ml.includes(addressSheetSearch);
                        return isDistrictMatch && isSearchMatch;
                      })
                      .map((c) => {
                        const isSelected = createMandalam === c.en;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleMandalamSelect(c.en)}
                            className={`w-full p-3 text-left rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 text-white font-bold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span>{lang === "ml" ? c.ml : c.en}</span>
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
