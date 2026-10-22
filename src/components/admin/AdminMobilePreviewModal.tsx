import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Smartphone, Wifi, Battery, Signal, ChevronRight, ChevronLeft, Users, HeartHandshake, Database, Layers, Sparkles, MessageSquare, Clock3, UserCheck, LayoutDashboard, Sliders, Calendar, FileText, XCircle, CheckCircle2, Hourglass, MapPin, Trophy, AlertTriangle, Activity, Globe, Map, Network, Store, ShieldCheck, ChevronDown, Filter, Search, Megaphone, CalendarDays, BellRing, Phone } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import officialLotus from "@/assets/bjp-official-lotus.png";
import { AdminMobileAppBottomNav, AdminMobileTab } from "./AdminMobileAppBottomNav";
import { AdminMobileAppHeader } from "./AdminMobileAppHeader";
import { DatePickerModal } from "./DatePickerModal";
import { MobileUsersListTab } from "./MobileUsersListTab";
import { MobileAppliedFiltersScope, FilterChip } from "./MobileAppliedFiltersScope";
import { PartyFlagIcon } from "@/components/common/PartyFlagIcon";
import { districts, constituencies, getDistrictName, getConstituencyName } from "@/data/geo";

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
    schemes: 128,
    boothCoverage: "94.2%",
    convertedBooths: "22,810",
    slaBreaches: 3,
  },
  this_week: {
    users: 12850,
    beneficiaries: 4120,
    pending: 1240,
    assisted: 3980,
    rejected: 115,
    schemes: 128,
    boothCoverage: "94.2%",
    convertedBooths: "23,120",
    slaBreaches: 18,
  },
  this_month: {
    users: 142850,
    beneficiaries: 48250,
    pending: 14160,
    assisted: 46830,
    rejected: 1420,
    schemes: 128,
    boothCoverage: "94.2%",
    convertedBooths: "23,550",
    slaBreaches: 68,
  },
  this_quarter: {
    users: 385400,
    beneficiaries: 135400,
    pending: 32800,
    assisted: 128500,
    rejected: 4300,
    schemes: 128,
    boothCoverage: "94.2%",
    convertedBooths: "24,100",
    slaBreaches: 142,
  },
  custom: {
    users: 210500,
    beneficiaries: 72100,
    pending: 18400,
    assisted: 68900,
    rejected: 2200,
    schemes: 128,
    boothCoverage: "94.2%",
    convertedBooths: "23,550",
    slaBreaches: 85,
  },
};

export function AdminMobilePreviewModal({ isOpen, onClose }: AdminMobilePreviewModalProps) {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<AdminMobileTab>("overview");
  const [mobileSubPage, setMobileSubPage] = useState<"none" | "leaderboard" | "needs_attention" | "recent_activity" | "beneficiaries">("none");
  const [beneficiarySearchQuery, setBeneficiarySearchQuery] = useState<string>("");
  const [beneficiaryCategoryFilter, setBeneficiaryCategoryFilter] = useState<string>("ALL");
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date>(new Date(2026, 9, 12)); // 12/10/2026
  const [selectedPeriod, setSelectedPeriod] = useState<string>("this_month");
  const [periodCustomLabel, setPeriodCustomLabel] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [deviceModel, setDeviceModel] = useState<"iphone" | "android">("iphone");

  const formatDateWithDay = (date: Date) => {
    const validDate = date && !isNaN(date.getTime()) ? date : new Date(2026, 9, 12);
    const day = String(validDate.getDate()).padStart(2, "0");
    const month = String(validDate.getMonth() + 1).padStart(2, "0");
    const year = validDate.getFullYear();
    const dayOfWeek = validDate.getDay();

    const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysMl = ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"];

    const dayName = lang === "ml" ? daysMl[dayOfWeek] : daysEn[dayOfWeek];
    return `${dayName}, ${day}/${month}/${year}`;
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

  const handleStepPeriod = (daysOffset: number) => {
    const baseDate = currentSelectedDate && !isNaN(currentSelectedDate.getTime()) ? currentSelectedDate : new Date(2026, 9, 12);
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + daysOffset);
    setCurrentSelectedDate(newDate);
    setPeriodCustomLabel(formatDateWithDay(newDate));
  };
  const [activeDistrictFilter, setActiveDistrictFilter] = useState<string>("all");
  const [filterGeoScope, setFilterGeoScope] = useState<string>("state");
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
  const activeLocationLabel =
    filterGeoScope === "booth"
      ? `${selectedBooth.toUpperCase().replace("_", " #")} - St. Mary's HS (Sector 1, Kazhakuttam)`
      : filterGeoScope === "area"
      ? "Sector 1 Kowdiar (Kazhakuttam Mandalam)"
      : filterGeoScope === "mandalam"
      ? "Kazhakuttam Mandalam (TVM District)"
      : filterGeoScope === "district"
      ? "Thiruvananthapuram District"
      : "Kerala State (State-Wide)";
  // Applications = sum of pending, rejected, and beneficiaries
  const applicationsCount =
    currentMetrics.pending +
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
          <AdminMobileAppHeader onNavigateTab={(tab) => setActiveTab(tab)} />

          {/* Scrollable Main Content Area based on Selected Bottom Tab */}
          <div className="flex-1 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-3 space-y-3 bg-muted/20 pb-16">
            {activeTab === "overview" && (
              <>
                {mobileSubPage === "none" ? (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {/* Header Row: Standalone Bolder Dashboard Title + Date Selection Pill + Filter Button Pill */}
                    <div className="flex items-center justify-between gap-1.5 pt-1 pb-0.5 mt-0 mb-1">
                      {/* Standalone Bolder & Larger Dashboard Title */}
                      <div className="flex items-center gap-1.5 shrink-0 h-7">
                        <h2 className="font-display text-lg sm:text-xl font-black text-[#0a0f1d] dark:text-white tracking-tight leading-none flex items-center h-full">
                          {lang === "ml" ? "ഡാഷ്‌ബോർഡ്" : "Dashboard"}
                        </h2>
                      </div>

                      {/* Right Group: Date Selection Pill + Filter Button */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Compact Period Selection Bar Pill */}
                        <div className="flex items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 text-[10.5px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs hover:border-slate-300 transition-all min-h-[28px] max-w-[190px]">
                          <div className="flex items-center gap-0.5 min-w-0 flex-1 justify-center">
                            {/* Left Arrow (Day Before) */}
                            <button
                              type="button"
                              onClick={() => handleStepPeriod(-1)}
                              className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                              title="Day Before (Previous Day)"
                            >
                              <ChevronLeft className="h-3.5 w-3.5 stroke-[2.4]" />
                            </button>

                            {/* Date / Month Display */}
                            <button
                              type="button"
                              onClick={() => setIsDatePickerOpen(true)}
                              className="text-[10.5px] font-extrabold text-[#0a0f1d] dark:text-slate-100 hover:text-[#ff5500] transition-colors cursor-pointer px-1 tracking-tight truncate"
                              title="Click to Open Date Picker"
                            >
                              {getFormattedPeriodDisplay()}
                            </button>

                            {/* Right Arrow (Day After) */}
                            <button
                              type="button"
                              onClick={() => handleStepPeriod(1)}
                              className="p-0.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                              title="Day After (Next Day)"
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

                        {/* Filter Button Pill with Active Indication */}
                        <button
                          type="button"
                          onClick={() => setShowFilterMenu(!showFilterMenu)}
                          className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer shrink-0 ${
                            showFilterMenu || appliedFilterChips.length > 0
                              ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30 shadow-xs"
                              : "border-amber-200/60 dark:border-slate-800 bg-[#fffcf0] dark:bg-slate-900 text-[#0a0f1d] dark:text-slate-200 hover:bg-amber-100/50"
                          }`}
                          title="Filter Dashboard Data"
                        >
                          <Filter className={`h-3.5 w-3.5 stroke-[2.2] shrink-0 ${showFilterMenu || appliedFilterChips.length > 0 ? "text-white" : "text-[#ff5500]"}`} />

                          {appliedFilterChips.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                              {appliedFilterChips.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Interactive Filter Drawer with 6 Filter Categories */}
                    {showFilterMenu && (
                      <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 animate-in fade-in slide-in-from-top-1 duration-200 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between pb-1 border-b border-amber-200/60 dark:border-amber-900/40">
                          <span className="text-[10.5px] font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Filter className="h-3.5 w-3.5 text-[#ff5500]" />
                            <span>{lang === "ml" ? "ഫിൽട്ടർ ക്രമീകരണങ്ങൾ" : "Dashboard Filters"}</span>
                          </span>
                          <div className="flex items-center gap-2">
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
                              }}
                              className="text-[9.5px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                            >
                              {lang === "ml" ? "റീസെറ്റ്" : "Reset All"}
                            </button>
                            <span className="text-amber-300 dark:text-amber-800">•</span>
                            <button
                              type="button"
                              onClick={() => setShowFilterMenu(false)}
                              className="text-[9.5px] font-bold text-amber-900 dark:text-amber-200 hover:underline cursor-pointer"
                            >
                              {lang === "ml" ? "മൂടുക" : "Close"}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {/* 1. Geography / Scope Filter + Cascading Selection Controls */}
                          <div className="col-span-2 flex flex-col gap-1.5 p-2 rounded-lg bg-amber-100/60 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/80">
                            <div className="flex items-center justify-between">
                              <label className="text-[9.5px] font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1">
                                <span>1. {lang === "ml" ? "ഭൂമിശാസ്ത്രം / മേഖല" : "Geography Scope"}</span>
                              </label>
                              <span className="text-[8.5px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/80 px-2 py-0.2 rounded-full uppercase">
                                {filterGeoScope} level
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              {/* Scope Level Selector */}
                              <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                                <label className="text-[8.5px] font-bold text-slate-600 dark:text-slate-400">
                                  {lang === "ml" ? "തല തിരഞ്ഞെടുക്കുക" : "Select Level"}
                                </label>
                                <select
                                  value={filterGeoScope}
                                  onChange={(e) => setFilterGeoScope(e.target.value)}
                                  className="rounded-md border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-black text-amber-950 dark:text-amber-100 focus:outline-none cursor-pointer"
                                >
                                  <option value="state">1. State Level (All Kerala)</option>
                                  <option value="district">2. District Level</option>
                                  <option value="mandalam">3. Mandalam Level</option>
                                  <option value="area">4. Area / Sector Level</option>
                                  <option value="booth">5. Booth Level</option>
                                </select>
                              </div>

                              {/* Dynamic Cascading Dropdowns based on Level */}
                              {filterGeoScope !== "state" && (
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-[8.5px] font-bold text-slate-600 dark:text-slate-400">
                                    {lang === "ml" ? "ജില്ല" : "District"}
                                  </label>
                                  <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                                  >
                                    <option value="tvm">Thiruvananthapuram</option>
                                    <option value="klm">Kollam</option>
                                    <option value="pta">Pathanamthitta</option>
                                    <option value="alp">Alappuzha</option>
                                    <option value="ktm">Kottayam</option>
                                    <option value="idk">Idukki</option>
                                    <option value="ekm">Ernakulam</option>
                                    <option value="tsr">Thrissur</option>
                                    <option value="pkd">Palakkad</option>
                                    <option value="mlp">Malappuram</option>
                                    <option value="clt">Kozhikode</option>
                                    <option value="wyd">Wayanad</option>
                                    <option value="knr">Kannur</option>
                                    <option value="ksr">Kasaragod</option>
                                  </select>
                                </div>
                              )}

                              {(filterGeoScope === "mandalam" || filterGeoScope === "area" || filterGeoScope === "booth") && (
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-[8.5px] font-bold text-slate-600 dark:text-slate-400">
                                    {lang === "ml" ? "മണ്ഡലം" : "Mandalam"}
                                  </label>
                                  <select
                                    value={selectedMandalam}
                                    onChange={(e) => setSelectedMandalam(e.target.value)}
                                    className="rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                                  >
                                    <option value="kazhakuttam">Kazhakuttam Mandalam</option>
                                    <option value="vattiyoorkavu">Vattiyoorkavu Mandalam</option>
                                    <option value="nemom">Nemom Mandalam</option>
                                    <option value="tvm_central">TVM Central Mandalam</option>
                                    <option value="parassala">Parassala Mandalam</option>
                                  </select>
                                </div>
                              )}

                              {(filterGeoScope === "area" || filterGeoScope === "booth") && (
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-[8.5px] font-bold text-slate-600 dark:text-slate-400">
                                    {lang === "ml" ? "ഏരിയ / മേഖലാ" : "Area / Sector"}
                                  </label>
                                  <select
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                    className="rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                                  >
                                    <option value="sector_1">Sector 1 - Kowdiar</option>
                                    <option value="sector_2">Sector 2 - Pattom</option>
                                    <option value="sector_3">Sector 3 - Ulloor</option>
                                    <option value="sector_4">Sector 4 - Sreekaryam</option>
                                  </select>
                                </div>
                              )}

                              {filterGeoScope === "booth" && (
                                <div className="flex flex-col gap-0.5 col-span-2">
                                  <label className="text-[8.5px] font-bold text-slate-600 dark:text-slate-400">
                                    {lang === "ml" ? "ബൂത്ത് തിരഞ്ഞെടുക്കുക" : "Select Booth"}
                                  </label>
                                  <select
                                    value={selectedBooth}
                                    onChange={(e) => setSelectedBooth(e.target.value)}
                                    className="rounded-md border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-black text-amber-950 dark:text-amber-100 focus:outline-none cursor-pointer"
                                  >
                                    <option value="booth_101">Booth #101 - St. Mary's Higher Secondary School</option>
                                    <option value="booth_102">Booth #102 - Govt Model School Pattom</option>
                                    <option value="booth_103">Booth #103 - Town Hall Sreekaryam</option>
                                    <option value="booth_104">Booth #104 - Panchayath Community Hall Kowdiar</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 2. Scheme Filter */}
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                              2. {lang === "ml" ? "പദ്ധതി" : "Scheme"}
                            </label>
                            <select
                              value={filterScheme}
                              onChange={(e) => setFilterScheme(e.target.value)}
                              className="rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ പദ്ധതികളും" : "All Schemes"}</option>
                              <option value="pm_kisan">PM-KISAN Samman Nidhi</option>
                              <option value="ayushman">Ayushman Bharat PM-JAY</option>
                              <option value="pm_awas">PM Awas Yojana</option>
                              <option value="jal_jeevan">Jal Jeevan Mission</option>
                              <option value="subhiksha">Subhiksha Keralam</option>
                            </select>
                          </div>

                          {/* 3. Scheme Category Filter */}
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                              3. {lang === "ml" ? "പദ്ധതി വിഭാഗം" : "Scheme Category"}
                            </label>
                            <select
                              value={filterSchemeCategory}
                              onChange={(e) => setFilterSchemeCategory(e.target.value)}
                              className="rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories"}</option>
                              <option value="agriculture">{lang === "ml" ? "കൃഷി (Agriculture)" : "Agriculture"}</option>
                              <option value="health">{lang === "ml" ? "ആരോഗ്യം (Health)" : "Health"}</option>
                              <option value="housing">{lang === "ml" ? "ഭവനം (Housing)" : "Housing"}</option>
                              <option value="education">{lang === "ml" ? "വിദ്യാഭ്യാസം (Education)" : "Education"}</option>
                              <option value="social_security">{lang === "ml" ? "സാമൂഹിക സുരക്ഷ (Social Security)" : "Social Security"}</option>
                              <option value="employment">{lang === "ml" ? "തൊഴിൽ & നൈപുണ്യം" : "Employment & Skill"}</option>
                            </select>
                          </div>

                          {/* 4. Scheme Type Filter */}
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                              4. {lang === "ml" ? "പദ്ധതി തരം" : "Scheme Type"}
                            </label>
                            <select
                              value={filterSchemeType}
                              onChange={(e) => setFilterSchemeType(e.target.value)}
                              className="rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാം" : "All Types"}</option>
                              <option value="central">{lang === "ml" ? "കേന്ദ്ര പദ്ധതി (Central)" : "Central"}</option>
                              <option value="state">{lang === "ml" ? "സംസ്ഥാന പദ്ധതി (State)" : "State"}</option>
                            </select>
                          </div>

                          {/* 5. Department / Ministry Filter */}
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                              5. {lang === "ml" ? "വകുപ്പ് / മന്ത്രാലയം" : "Department / Ministry"}
                            </label>
                            <select
                              value={filterDepartment}
                              onChange={(e) => setFilterDepartment(e.target.value)}
                              className="rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ വകുപ്പുകളും" : "All Departments"}</option>
                              <option value="agriculture_min">Ministry of Agriculture</option>
                              <option value="health_min">Ministry of Health & Family Welfare</option>
                              <option value="housing_min">Ministry of Housing & Urban Affairs</option>
                              <option value="social_justice">Ministry of Social Justice</option>
                              <option value="rural_dev">Department of Rural Development</option>
                            </select>
                          </div>

                          {/* 6. Performance Filter */}
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                              6. {lang === "ml" ? "പ്രകടനം" : "Performance"}
                            </label>
                            <select
                              value={filterPerformance}
                              onChange={(e) => setFilterPerformance(e.target.value)}
                              className="rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="all">{lang === "ml" ? "എല്ലാ തലങ്ങളും" : "All Levels"}</option>
                              <option value="top">{lang === "ml" ? "ഉയർന്ന പ്രകടനം (Top Performers)" : "Top Performers"}</option>
                              <option value="average">{lang === "ml" ? "ശരാശരി (Average)" : "Average Performers"}</option>
                              <option value="needs_attention">{lang === "ml" ? "ശ്രദ്ധ വേണം (Needs Attention)" : "Needs Attention"}</option>
                              <option value="sla_breached">{lang === "ml" ? "വൈകിയവ (SLA Breached)" : "SLA Breached"}</option>
                            </select>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setShowFilterMenu(false)}
                            className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-[10.5px] py-1.5 shadow-xs hover:from-amber-600 hover:to-orange-700 transition-all cursor-pointer"
                          >
                            {lang === "ml" ? "ഫിൽട്ടറുകൾ പ്രയോഗിക്കുക" : "Apply Filters"}
                          </button>
                        </div>
                      </div>
                    )}

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

                    {/* Core Analytics KPI Grid (2 cards per row with Icon matching border on hover) */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. Users */}
                      <div
                        onClick={() => setActiveTab("users")}
                        className="min-h-[66px] rounded-lg border border-border bg-card p-2.5 flex flex-col justify-between shadow-2xs hover:border-emerald-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "ഉപയോക്താക്കൾ" : "Users"}
                          </span>
                          <div className="h-5.5 w-5.5 rounded-md bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 p-1 flex items-center justify-center shadow-xs shrink-0">
                            <Users className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">{currentMetrics.users.toLocaleString()}</p>
                      </div>

                      {/* 2. Beneficiaries */}
                      <div
                        onClick={() => setMobileSubPage("beneficiaries")}
                        className="min-h-[66px] rounded-lg border border-border bg-card p-2.5 flex flex-col justify-between shadow-2xs hover:border-indigo-500/70 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                          </span>
                          <div className="h-5.5 w-5.5 rounded-md bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-700 p-1 flex items-center justify-center shadow-xs shrink-0">
                            <HeartHandshake className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">{currentMetrics.beneficiaries.toLocaleString()}</p>
                      </div>

                      {/* 3. Applications */}
                      <div className="min-h-[66px] rounded-lg border border-border bg-card p-2.5 flex flex-col justify-between shadow-2xs hover:border-blue-500/70 transition-all cursor-pointer">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                          </span>
                          <div className="h-5.5 w-5.5 rounded-md bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 p-1 flex items-center justify-center shadow-xs shrink-0">
                            <FileText className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none mt-1">{applicationsCount.toLocaleString()}</p>
                      </div>

                      {/* 4. Assisted */}
                      <div className="min-h-[66px] rounded-lg border border-border bg-card p-2.5 flex flex-col justify-between shadow-2xs hover:border-teal-500/70 transition-all cursor-pointer">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "സഹായം ലഭിച്ചവ" : "Assisted"}
                          </span>
                          <div className="h-5.5 w-5.5 rounded-md bg-gradient-to-br from-teal-400 via-teal-500 to-teal-700 p-1 flex items-center justify-center shadow-xs shrink-0">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-teal-600 dark:text-teal-400 leading-none mt-1">{currentMetrics.assisted.toLocaleString()}</p>
                      </div>

                      {/* 5. Pending */}
                      <div className="min-h-[66px] rounded-lg border border-border bg-card p-2.5 flex flex-col justify-between shadow-2xs hover:border-amber-500/70 transition-all cursor-pointer">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "പെൻഡിംഗ്" : "Pending"}
                          </span>
                          <div className="h-5.5 w-5.5 rounded-md bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-1 flex items-center justify-center shadow-xs shrink-0">
                            <Hourglass className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 leading-none mt-1">{currentMetrics.pending.toLocaleString()}</p>
                      </div>

                      {/* 6. Rejected */}
                      <div className="min-h-[66px] rounded-lg border border-border bg-card p-2.5 flex flex-col justify-between shadow-2xs hover:border-rose-500/70 transition-all cursor-pointer">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "നിരസിച്ചവ" : "Rejected"}
                          </span>
                          <div className="h-5.5 w-5.5 rounded-md bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 p-1 flex items-center justify-center shadow-xs shrink-0">
                            <XCircle className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <p className="font-display text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 leading-none mt-1">{currentMetrics.rejected.toLocaleString()}</p>
                      </div>

                      {/* 7. Schemes */}
                      <div className="min-h-[66px] rounded-lg border border-border bg-card p-2.5 flex flex-col justify-between shadow-2xs hover:border-purple-500/70 transition-all cursor-pointer">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                          </span>
                          <div className="h-5.5 w-5.5 rounded-md bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 p-1 flex items-center justify-center shadow-xs shrink-0">
                            <Layers className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="space-y-0.5 mt-0.5">
                          <p className="font-display text-sm sm:text-base font-bold text-foreground leading-none">{currentMetrics.schemes.toLocaleString()}</p>
                          <p className="text-[9px] font-normal text-muted-foreground/80 leading-tight truncate">
                            {lang === "ml" ? "സംസ്ഥാന + കേന്ദ്ര പദ്ധതികൾ" : "State + Central schemes"}
                          </p>
                        </div>
                      </div>

                      {/* 8. Covered Booth */}
                      <div className="min-h-[66px] rounded-lg border border-border bg-card p-2.5 flex flex-col justify-between shadow-2xs hover:border-cyan-500/70 transition-all cursor-pointer">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11.5px] font-bold text-muted-foreground truncate">
                            {lang === "ml" ? "കവർ ചെയ്ത ബൂത്തുകൾ" : "Covered Booth"}
                          </span>
                          <div className="h-5.5 w-5.5 rounded-md bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-700 p-1 flex items-center justify-center shadow-xs shrink-0">
                            <MapPin className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="space-y-0.5 mt-0.5">
                          <p className="font-display text-xs sm:text-sm font-bold text-cyan-600 dark:text-cyan-400 leading-none">
                            {currentMetrics.convertedBooths} / 25,000
                          </p>
                          <p className="text-[9px] font-normal text-emerald-600/90 dark:text-emerald-400/90 leading-tight">
                            {currentMetrics.boothCoverage} {lang === "ml" ? "കവറേജ്" : "covered"}
                          </p>
                        </div>
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
                          onClick={() => setMobileSubPage("recent_activity")}
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

                    {/* Quick Actions Section (Matching Reference Screenshot UI) */}
                    <div className="space-y-1.5 pt-1">
                      {/* Quick Actions Section Header */}
                      <div className="flex items-center justify-between px-0.5">
                        <h3 className="font-display text-xs sm:text-sm font-bold text-[#0a0f1d] dark:text-white tracking-tight">
                          {lang === "ml" ? "ദ്രുത ക്രിയകൾ" : "Quick Actions"}
                        </h3>
                      </div>

                      {/* 3 Quick Action Cards Row */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* 1. Leaderboard Card */}
                        <button
                          type="button"
                          onClick={() => setMobileSubPage("leaderboard")}
                          className="group flex flex-col justify-between rounded-xl border-0 bg-[#fffbf0] dark:bg-amber-950/30 p-2 text-left transition-all hover:shadow-xs active:scale-[0.97] cursor-pointer min-h-[90px]"
                        >
                          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-xs shrink-0">
                            <Trophy className="h-3.5 w-3.5" />
                          </div>
                          <div className="mt-1.5 space-y-0.5">
                            <span className="block font-bold text-[10.5px] text-[#0a0f1d] dark:text-white leading-tight">
                              {lang === "ml" ? "ലീഡർബോർഡ്" : "Leaderboard"}
                            </span>
                            <span className="block text-[9.5px] font-bold text-[#ff5500] dark:text-amber-400">
                              {lang === "ml" ? "റാങ്കിംഗ്" : "Top Leads"}
                            </span>
                          </div>
                        </button>

                        {/* 2. Needs Attention Card */}
                        <button
                          type="button"
                          onClick={() => setMobileSubPage("needs_attention")}
                          className="group flex flex-col justify-between rounded-xl border-0 bg-[#fff0f3] dark:bg-rose-950/30 p-2 text-left transition-all hover:shadow-xs active:scale-[0.97] cursor-pointer min-h-[90px]"
                        >
                          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-xs shrink-0">
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </div>
                          <div className="mt-1.5 space-y-0.5">
                            <span className="block font-bold text-[10.5px] text-[#0a0f1d] dark:text-white leading-tight">
                              {lang === "ml" ? "ശ്രദ്ധിക്കാൻ" : "Needs Attention"}
                            </span>
                            <span className="block text-[9.5px] font-bold text-rose-600 dark:text-rose-400">
                              {lang === "ml" ? "3 വിഷയം" : "3 Issues"}
                            </span>
                          </div>
                        </button>

                        {/* 3. Recent Activity Card */}
                        <button
                          type="button"
                          onClick={() => setMobileSubPage("recent_activity")}
                          className="group flex flex-col justify-between rounded-xl border-0 bg-[#eff6ff] dark:bg-blue-950/30 p-2 text-left transition-all hover:shadow-xs active:scale-[0.97] cursor-pointer min-h-[90px]"
                        >
                          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-xs shrink-0">
                            <Activity className="h-3.5 w-3.5" />
                          </div>
                          <div className="mt-1.5 space-y-0.5">
                            <span className="block font-bold text-[10.5px] text-[#0a0f1d] dark:text-white leading-tight">
                              {lang === "ml" ? "ആക്റ്റിവിറ്റി" : "Recent Activity"}
                            </span>
                            <span className="block text-[9.5px] font-bold text-blue-600 dark:text-blue-400">
                              {lang === "ml" ? "തത്സമയം" : "Live Feed"}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
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

                      const datasets: Record<string, { title: string; subtitle: string; items: Array<{ rank: number; tag: string; name: string; val: string; sub: string; rankColor: string; tagBg: string; district?: string }> }> = {
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
                          items: [
                            { rank: 1, tag: "NEM", name: "Nemom Mandalam", val: "3,850", sub: "192 assisted", rankColor: "text-[#eab308]", tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                            { rank: 2, tag: "KAZ", name: "Kazhakkoottam", val: "3,620", sub: "181 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                            { rank: 3, tag: "VAT", name: "Vattiyoorkavu", val: "3,410", sub: "170 assisted", rankColor: "text-[#f97316]", tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                            { rank: 4, tag: "TVM", name: "Trivandrum Central", val: "3,290", sub: "164 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                            { rank: 5, tag: "PAR", name: "Parassala Mandalam", val: "3,110", sub: "155 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            { rank: 6, tag: "KAT", name: "Kattakkada", val: "2,980", sub: "149 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                            { rank: 7, tag: "NEY", name: "Neyyattinkara", val: "2,840", sub: "142 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                            { rank: 8, tag: "KOV", name: "Kovalam Mandalam", val: "2,710", sub: "135 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                          ],
                        },
                        area: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് മേഖലകൾ" : "Top Performing Areas",
                          subtitle: lang === "ml" ? "മേഖലാ റാങ്കിംഗുകൾ" : "Area Rankings",
                          items: [
                            { rank: 1, tag: "PAP", name: "Pappanamcode North", val: "1,940", sub: "97 assisted", rankColor: "text-[#eab308]", tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                            { rank: 2, tag: "KAR", name: "Karamana West", val: "1,820", sub: "91 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                            { rank: 3, tag: "THI", name: "Thiruvallam East", val: "1,750", sub: "87 assisted", rankColor: "text-[#f97316]", tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                            { rank: 4, tag: "PER", name: "Peroorkada Central", val: "1,680", sub: "84 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                            { rank: 5, tag: "KOW", name: "Kowdiar South", val: "1,590", sub: "79 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            { rank: 6, tag: "ULM", name: "Ulloor West", val: "1,510", sub: "75 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                            { rank: 7, tag: "SRE", name: "Sreekariyam East", val: "1,440", sub: "72 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                            { rank: 8, tag: "MAN", name: "Manacaud South", val: "1,380", sub: "69 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                          ],
                        },
                        booths: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് ബൂത്തുകൾ" : "Top Performing Booths",
                          subtitle: lang === "ml" ? "ബൂത്ത് റാങ്കിംഗുകൾ" : "Booth Rankings",
                          items: [
                            { rank: 1, tag: "B-142", name: "Booth 142 · Nemom LPS", val: "940", sub: "47 assisted", rankColor: "text-[#eab308]", tagBg: "bg-[#fde8e8] text-[#991b1b] border border-rose-200" },
                            { rank: 2, tag: "B-088", name: "Booth 88 · Karamana High", val: "890", sub: "44 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-[#e0e7ff] text-[#3730a3] border border-indigo-200" },
                            { rank: 3, tag: "B-105", name: "Booth 105 · Pappanamcode", val: "840", sub: "42 assisted", rankColor: "text-[#f97316]", tagBg: "bg-[#ffedd5] text-[#9a3412] border border-orange-200" },
                            { rank: 4, tag: "B-019", name: "Booth 19 · Kowdiar UPS", val: "790", sub: "39 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#dcfce7] text-[#166534] border border-emerald-200" },
                            { rank: 5, tag: "B-067", name: "Booth 67 · Peroorkada", val: "740", sub: "37 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                            { rank: 6, tag: "B-121", name: "Booth 121 · Thiruvallam", val: "710", sub: "35 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#fef9c3] text-[#854d0e] border border-amber-200" },
                            { rank: 7, tag: "B-034", name: "Booth 34 · Sreekariyam", val: "680", sub: "34 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#cff4fc] text-[#087990] border border-cyan-200" },
                            { rank: 8, tag: "B-092", name: "Booth 92 · Kazhakkoottam", val: "650", sub: "32 assisted", rankColor: "text-[#64748b]", tagBg: "bg-[#f3e8ff] text-[#6b21a8] border border-purple-200" },
                          ],
                        },
                        workers: {
                          title: lang === "ml" ? "ടോപ്പ് പെർഫോമിംഗ് ഉപയോക്താക്കൾ" : "Top Performing Users",
                          subtitle: lang === "ml" ? "ഉപയോക്തൃ റാങ്കിംഗുകൾ" : "User Rankings",
                          items: [
                            { rank: 1, tag: "PR", name: "Anitha Nair", district: "Thiruvananthapuram", val: "480", sub: "24 assisted", rankColor: "text-[#eab308]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800" },
                            { rank: 2, tag: "PW", name: "Rajesh V. Kurup", district: "Kollam", val: "450", sub: "22 assisted", rankColor: "text-[#6366f1]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800" },
                            { rank: 3, tag: "PR", name: "Maya Devi S.", district: "Thiruvananthapuram", val: "420", sub: "21 assisted", rankColor: "text-[#f97316]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800" },
                            { rank: 4, tag: "PW", name: "Manoj Kumar P.", district: "Alappuzha", val: "390", sub: "19 assisted", rankColor: "text-[#64748b]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800" },
                            { rank: 5, tag: "PR", name: "Suresh Chandran", district: "Kottayam", val: "370", sub: "18 assisted", rankColor: "text-[#64748b]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800" },
                            { rank: 6, tag: "PW", name: "Lekshmi Priya", district: "Ernakulam", val: "340", sub: "17 assisted", rankColor: "text-[#64748b]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800" },
                            { rank: 7, tag: "PR", name: "Arun Mohan", district: "Thrissur", val: "320", sub: "16 assisted", rankColor: "text-[#64748b]", tagBg: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800" },
                            { rank: 8, tag: "PW", name: "Deepa R. Nair", district: "Kozhikode", val: "310", sub: "15 assisted", rankColor: "text-[#64748b]", tagBg: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800" },
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
                            <div className="flex items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 text-[10.5px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs hover:border-slate-300 transition-all min-h-[28px] max-w-[190px]">
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
                                  className="text-[10.5px] font-extrabold text-[#0a0f1d] dark:text-slate-100 hover:text-[#ff5500] transition-colors cursor-pointer px-1 tracking-tight truncate"
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

                          {/* Dynamic Cascading Filter Dropdowns based on Level (Excluding districts and workers) */}
                          {leaderboardCategory !== "districts" && leaderboardCategory !== "workers" && (
                            <div className="flex items-center gap-1.5 pt-0.5 w-full">
                              {leaderboardCategory === "mandalam" && (
                                <div className="relative flex-1 min-w-0 flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
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
                                  <div className="relative flex-1 min-w-0 flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
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

                                  <div className="relative flex-1 min-w-0 flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
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
                                  <div className="relative flex-1 min-w-0 flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                    <span className="shrink-0 mr-1">Mandalam:</span>
                                    <select
                                      value={selectedMandalam}
                                      onChange={(e) => setSelectedMandalam(e.target.value)}
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

                                  <div className="relative flex-1 min-w-0 flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-1 text-[9.5px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                                    <span className="shrink-0 mr-1">Area:</span>
                                    <select
                                      value={selectedArea}
                                      onChange={(e) => setSelectedArea(e.target.value)}
                                      className="appearance-none bg-transparent font-extrabold text-foreground focus:outline-none cursor-pointer pr-3 min-w-0 flex-1 truncate"
                                    >
                                      <option value="sector_1">Pappanamcode</option>
                                      <option value="sector_2">Kowdiar</option>
                                      <option value="sector_3">Ulloor</option>
                                      <option value="sector_4">Sreekaryam</option>
                                    </select>
                                    <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-1 shrink-0" />
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          {/* Top Performing Card (Podium) - Clean Outer White Container */}
                          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pt-3 pb-2 px-3 shadow-2xs space-y-1">

                            {/* Podium Stands Grid - Fitted cleanly inside with standard UI padding */}
                            <div className="flex items-end justify-center gap-1.5 pt-0.5 pb-0.5 px-0.5">
                              {/* Rank #2 Silver (Left) */}
                              {rank2 && (
                                <div className="flex-1 flex flex-col items-center min-w-0">
                                  {/* Badge 2 with Silver Laurels */}
                                  <div className="flex items-center justify-center gap-0.5 -mb-2 z-10">
                                    <span className="text-slate-400 text-[9.5px] select-none">🌿</span>
                                    <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-500 text-white font-black text-[9.5px] shadow-xs">
                                      2
                                    </div>
                                    <span className="text-slate-400 text-[9.5px] select-none scale-x-[-1]">🌿</span>
                                  </div>

                                  {/* Card Body */}
                                  <div className="w-full rounded-t-2xl bg-[#f0f5ff] dark:bg-slate-800/80 border border-blue-100/90 dark:border-slate-700/60 p-1 text-center flex flex-col items-center justify-between min-h-[98px]">
                                    {/* Circular Tag Avatar */}
                                    <div className="h-8 w-8 rounded-full bg-[#dbe8ff] dark:bg-slate-700 flex items-center justify-center text-[9px] font-extrabold text-[#1b255a] dark:text-blue-200 shadow-2xs my-0.5 shrink-0">
                                      {rank2.tag}
                                    </div>
                                    {/* Name & District */}
                                    <div className="flex flex-col items-center justify-center min-h-[22px] px-0.5">
                                      <p className="text-[8.5px] font-bold text-[#1b255a] dark:text-slate-200 leading-tight text-center line-clamp-1">
                                        {rank2.name}
                                      </p>
                                      {"district" in rank2 && (rank2 as any).district && (
                                        <p className="text-[7.5px] font-semibold text-slate-500 dark:text-slate-400 leading-none text-center truncate mt-0.5">
                                          {(rank2 as any).district}
                                        </p>
                                      )}
                                    </div>
                                    {/* Value */}
                                    <p className="text-[11.5px] font-black text-[#00a859] dark:text-emerald-400">
                                      {rank2.val}
                                    </p>
                                  </div>

                                  {/* 3D Base Bar */}
                                  <div className="h-2 w-full rounded-b-xs bg-gradient-to-r from-[#a0aec0] via-[#cbd5e1] to-[#a0aec0] border-t border-slate-400/40 shadow-xs" />
                                </div>
                              )}

                              {/* Rank #1 Gold (Center - Taller) */}
                              {rank1 && (
                                <div className="flex-1 flex flex-col items-center -mt-1 z-1 min-w-0">
                                  {/* Badge 1 with Gold Laurels */}
                                  <div className="flex items-center justify-center gap-0.5 -mb-2 z-10">
                                    <span className="text-amber-500 text-[10.5px] select-none">🌿</span>
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white font-black text-[10px] shadow-md ring-2 ring-amber-300">
                                      1
                                    </div>
                                    <span className="text-amber-500 text-[10.5px] select-none scale-x-[-1]">🌿</span>
                                  </div>

                                  {/* Card Body */}
                                  <div className="w-full rounded-t-2xl bg-[#fffbeb] dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 p-1 text-center flex flex-col items-center justify-between min-h-[114px]">
                                    {/* Circular Tag Avatar */}
                                    <div className="h-8.5 w-8.5 rounded-full bg-[#fde8e8] dark:bg-rose-950/50 flex items-center justify-center text-[9.5px] font-extrabold text-[#1b255a] dark:text-rose-200 shadow-2xs my-0.5 shrink-0">
                                      {rank1.tag}
                                    </div>
                                    {/* Name & District */}
                                    <div className="flex flex-col items-center justify-center min-h-[24px] px-0.5">
                                      <p className="text-[9px] font-black text-[#1b255a] dark:text-slate-100 leading-tight text-center line-clamp-1">
                                        {rank1.name}
                                      </p>
                                      {"district" in rank1 && (rank1 as any).district && (
                                        <p className="text-[7.5px] font-semibold text-slate-500 dark:text-slate-400 leading-none text-center truncate mt-0.5">
                                          {(rank1 as any).district}
                                        </p>
                                      )}
                                    </div>
                                    {/* Value */}
                                    <p className="text-[13px] font-black text-[#00a859] dark:text-emerald-400">
                                      {rank1.val}
                                    </p>
                                  </div>

                                  {/* 3D Base Bar */}
                                  <div className="h-3 w-full rounded-b-xs bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#d97706] border-t border-amber-600/50 shadow-xs" />
                                </div>
                              )}

                              {/* Rank #3 Bronze (Right) */}
                              {rank3 && (
                                <div className="flex-1 flex flex-col items-center min-w-0">
                                  {/* Badge 3 with Bronze Laurels */}
                                  <div className="flex items-center justify-center gap-0.5 -mb-2 z-10">
                                    <span className="text-amber-700 text-[9.5px] select-none">🌿</span>
                                    <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#b45309] text-white font-black text-[9.5px] shadow-xs">
                                      3
                                    </div>
                                    <span className="text-amber-700 text-[9.5px] select-none scale-x-[-1]">🌿</span>
                                  </div>

                                  {/* Card Body */}
                                  <div className="w-full rounded-t-2xl bg-[#fff5f0] dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 p-1 text-center flex flex-col items-center justify-between min-h-[98px]">
                                    {/* Circular Tag Avatar */}
                                    <div className="h-8 w-8 rounded-full bg-[#fde8e8] dark:bg-rose-950/50 flex items-center justify-center text-[9px] font-extrabold text-[#1b255a] dark:text-rose-200 shadow-2xs my-0.5 shrink-0">
                                      {rank3.tag}
                                    </div>
                                    {/* Name & District */}
                                    <div className="flex flex-col items-center justify-center min-h-[22px] px-0.5">
                                      <p className="text-[8.5px] font-bold text-[#1b255a] dark:text-slate-200 leading-tight text-center line-clamp-1">
                                        {rank3.name}
                                      </p>
                                      {"district" in rank3 && (rank3 as any).district && (
                                        <p className="text-[7.5px] font-semibold text-slate-500 dark:text-slate-400 leading-none text-center truncate mt-0.5">
                                          {(rank3 as any).district}
                                        </p>
                                      )}
                                    </div>
                                    {/* Value */}
                                    <p className="text-[11.5px] font-black text-[#00a859] dark:text-emerald-400">
                                      {rank3.val}
                                    </p>
                                  </div>

                                  {/* 3D Base Bar */}
                                  <div className="h-2 w-full rounded-b-xs bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] border-t border-amber-800/40 shadow-xs" />
                                </div>
                              )}
                            </div>
                          </div>

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
                                    {leaderboardCategory !== "workers" && (
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
                      );
                    })()}

                    {/* Dedicated Subpage 2: Needs Attention Page */}
                    {mobileSubPage === "needs_attention" && (
                      <div className="space-y-3 pt-0.5">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "ശ്രദ്ധിക്കേണ്ടവ" : "Needs Attention"}</span>
                          </button>
                          <AlertTriangle className="h-4 w-4 text-rose-500" />
                        </div>

                        <div className="rounded-md bg-rose-500/10 border-0 p-2.5 space-y-1">
                          <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {lang === "ml" ? "3 അടിയന്തര കേസുകൾ വൈകുന്നു (SLA Alert)" : "3 Overdue Critical SLA Cases"}
                          </span>
                          <p className="text-[10.5px] text-muted-foreground">
                            {lang === "ml" ? "ഉടൻ പ്രതികരണം ആവശ്യമുള്ള അപേക്ഷകൾ" : "Requires immediate action from nodal officers."}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          {[
                            { id: "APP-3092", title: "Water Connection Escalation", loc: "Kollam Ward 4", status: "SLA Overdue 48h", color: "text-rose-600" },
                            { id: "APP-2981", title: "KISAN Pension Document Delay", loc: "Thrissur West", status: "KYC Pending", color: "text-amber-600" },
                            { id: "APP-1042", title: "Housing Grant Field Audit", loc: "Trivandrum South", status: "Audit Pending", color: "text-rose-600" },
                          ].map((issue) => (
                            <div key={issue.id} className="p-2.5 rounded-md bg-card border-0 shadow-2xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-muted-foreground">{issue.id}</span>
                                <span className={`text-[10px] font-bold ${issue.color} bg-rose-500/10 px-1.5 py-0.5 rounded-md`}>
                                  {issue.status}
                                </span>
                              </div>
                              <h5 className="font-bold text-xs text-foreground">{issue.title}</h5>
                              <p className="text-[10px] text-muted-foreground">{issue.loc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dedicated Subpage 3: Recent Activity Page */}
                    {mobileSubPage === "recent_activity" && (
                      <div className="space-y-3 pt-0.5">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <button
                            type="button"
                            onClick={() => setMobileSubPage("none")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{lang === "ml" ? "പ്രവർത്തനങ്ങൾ" : "Recent Activity"}</span>
                          </button>
                          <Activity className="h-4 w-4 text-blue-500" />
                        </div>

                        <div className="space-y-1.5">
                          {[
                            { time: "10m ago", text: "3 Overdue Critical SLA Cases Logged", category: "SLA Alert", badge: "bg-rose-500/10 text-rose-600" },
                            { time: "25m ago", text: "Application #4029 approved by Lead Suresh", category: "Approval", badge: "bg-emerald-500/10 text-emerald-600" },
                            { time: "1h ago", text: "New Welfare Scheme Published: KISAN Pension", category: "Scheme", badge: "bg-blue-500/10 text-blue-600" },
                            { time: "2h ago", text: "Kollam district reached 85% coverage target", category: "Milestone", badge: "bg-amber-500/10 text-amber-600" },
                            { time: "3h ago", text: "12 New Citizen Registrations in Ernakulam", category: "Registration", badge: "bg-purple-500/10 text-purple-600" },
                          ].map((act, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-md bg-card border-0 shadow-2xs text-xs">
                              <span className="text-[10px] font-bold text-muted-foreground shrink-0 w-12 pt-0.5">{act.time}</span>
                              <div className="flex-1 space-y-0.5">
                                <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${act.badge}`}>
                                  {act.category}
                                </span>
                                <p className="font-semibold text-foreground leading-snug">{act.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                          <div className="p-2 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between min-h-[58px]">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
                                {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
                              </span>
                              <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-orange-500 to-[#ff5500] flex items-center justify-center text-white shrink-0 shadow-2xs">
                                <HeartHandshake className="h-2.5 w-2.5 stroke-[2.5]" />
                              </div>
                            </div>
                            <div>
                              <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-0.5">
                                {currentMetrics.beneficiaries.toLocaleString()}
                              </div>
                              <p className="text-[8.5px] sm:text-[9px] font-semibold text-orange-700 dark:text-orange-300 truncate mt-[1px]">
                                {lang === "ml" ? "സ്ഥിരീകരിച്ച ഗുണഭോക്താക്കൾ" : "Verified Beneficiaries"}
                              </p>
                            </div>
                          </div>

                          {/* 2. Applications KPI Card */}
                          <div className="p-2 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between min-h-[58px]">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
                                {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                              </span>
                              <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                                <FileText className="h-2.5 w-2.5 stroke-[2.5]" />
                              </div>
                            </div>
                            <div>
                              <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-0.5">
                                {applicationsCount.toLocaleString()}
                              </div>
                              <p className="text-[8.5px] sm:text-[9px] font-semibold text-blue-700 dark:text-blue-300 truncate mt-[1px]">
                                {lang === "ml" ? "ആകെ അപേക്ഷകൾ" : "Total Submissions"}
                              </p>
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
                  </div>
                )}
              </>
            )}

            {activeTab === "schemes" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Total Schemes</span>
                    <span className="font-display text-sm font-extrabold text-purple-600">128</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/60">
                    <div className="rounded-lg bg-orange-500/10 p-2 text-center">
                      <span className="block text-[10px] text-muted-foreground uppercase">State Schemes</span>
                      <span className="font-bold text-orange-600">85</span>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 p-2 text-center">
                      <span className="block text-[10px] text-muted-foreground uppercase">Central Schemes</span>
                      <span className="font-bold text-blue-600">43</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <span className="text-xs font-bold text-foreground block">Top Scheme Categories (16)</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Agriculture &amp; Farmers</span><span className="font-bold">38 Schemes</span></div>
                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Healthcare &amp; Insurance</span><span className="font-bold">28 Schemes</span></div>
                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Social Security Pension</span><span className="font-bold">24 Schemes</span></div>
                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Housing &amp; LIFE Mission</span><span className="font-bold">20 Schemes</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 space-y-1">
                  <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[9px] font-extrabold text-rose-700 uppercase">Action Needed</span>
                  <h3 className="font-bold text-xs text-foreground mt-1">SLA Target Breaches</h3>
                  <p className="text-[10px] text-muted-foreground">{currentMetrics.slaBreaches} cases exceeded 24h follow-up window.</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <span className="text-xs font-bold text-foreground block">Case Lifecycle Distribution</span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40"><span className="text-muted-foreground">Pending / In Verification</span><span className="font-bold">{currentMetrics.pending.toLocaleString()}</span></div>
                    <div className="flex justify-between py-1 border-b border-border/40"><span className="text-muted-foreground">Assisted &amp; Beneficiaries</span><span className="font-bold text-emerald-600">{(currentMetrics.assisted + currentMetrics.beneficiaries).toLocaleString()}</span></div>
                    <div className="flex justify-between py-1 border-b border-border/40"><span className="text-muted-foreground">Rejected</span><span className="font-bold text-rose-600">{currentMetrics.rejected.toLocaleString()}</span></div>
                    <div className="flex justify-between py-1 font-bold"><span className="text-foreground">Total Applications</span><span className="text-foreground">{applicationsCount.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <MobileUsersListTab
                periodText={getFormattedPeriodDisplay()}
                onOpenDatePicker={() => setIsDatePickerOpen(true)}
                onStepPeriod={handleStepPeriod}
              />
            )}

            {activeTab === "more" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <span className="text-xs font-bold text-foreground block">App Settings &amp; Filters</span>
                  <p className="text-[11px] text-muted-foreground">Filter by District, Mandalam, or Booth level geography.</p>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Phone App Bottom Footer Navigation */}
          {(mobileSubPage === "none" || mobileSubPage === "leaderboard" || mobileSubPage === "beneficiaries") && (
            <AdminMobileAppBottomNav
              activeTab={mobileSubPage === "leaderboard" ? "more" : activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setMobileSubPage("none");
              }}
            />
          )}

          {/* Home Bar Indicator */}
          {deviceModel === "iphone" && (
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-28 bg-foreground/30 rounded-full z-50 pointer-events-none" />
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
        </div>
      </div>
    </div>
  );
}
