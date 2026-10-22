import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Smartphone, Wifi, Battery, Signal, ChevronRight, ChevronLeft, ArrowLeft, Users, HeartHandshake, Database, Layers, Sparkles, MessageSquare, Clock3, UserCheck, LayoutDashboard, Sliders, Calendar, FileText, XCircle, CheckCircle2, Hourglass, MapPin, Trophy, AlertTriangle, Activity, Globe, Map, Network, Store, ShieldCheck, ChevronDown, Filter, Search, Megaphone, CalendarDays, BellRing, Phone, RotateCcw, GraduationCap, Sprout, LayoutGrid, MoreVertical, AlertCircle, Star } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import officialLotus from "@/assets/bjp-official-lotus.png";
import { AdminMobileAppBottomNav, AdminMobileTab } from "./AdminMobileAppBottomNav";
import { AdminMobileAppHeader } from "./AdminMobileAppHeader";
import { DatePickerModal } from "./DatePickerModal";
import { MobileUsersListTab } from "./MobileUsersListTab";
import { MobileAppliedFiltersScope, FilterChip } from "./MobileAppliedFiltersScope";
import { PartyFlagIcon } from "@/components/common/PartyFlagIcon";
import { districts, constituencies, getDistrictName, getConstituencyName } from "@/data/geo";
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
    pending: 14160,
    assisted: 46830,
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
  const [activeTab, setActiveTab] = useState<AdminMobileTab>("overview");
  const [mobileSubPage, setMobileSubPage] = useState<"none" | "leaderboard" | "needs_attention" | "recent_activity" | "beneficiaries" | "notifications" | "applications" | "events_announcements">("none");
  const [eventsSubTab, setEventsSubTab] = useState<"events" | "announcements">("events");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<"all" | "pending" | "assisted" | "rejected">("all");
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
  const [schemeSearchQuery, setSchemeSearchQuery] = useState<string>("");
  const [selectedSchemeCategoryDetail, setSelectedSchemeCategoryDetail] = useState<{
    id: string;
    titleEn: string;
    titleMl: string;
    categoryLabelEn: string;
    categoryLabelMl: string;
    count: number;
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
          <AdminMobileAppHeader
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

                    {/* Core Analytics KPI Grid (2 cards per row with Icon matching border on hover) */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. Users */}
                      <div
                        onClick={() => setActiveTab("users")}
                        className="min-h-[52px] rounded-lg border border-border bg-card p-2 flex flex-col justify-between shadow-2xs hover:border-emerald-500/70 transition-all cursor-pointer"
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
                        className="min-h-[52px] rounded-lg border border-border bg-card p-2 flex flex-col justify-between shadow-2xs hover:border-indigo-500/70 transition-all cursor-pointer"
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
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("all");
                        }}
                        className="min-h-[52px] rounded-lg border border-border bg-card p-2 flex flex-col justify-between shadow-2xs hover:border-blue-500/70 transition-all cursor-pointer"
                      >
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
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("assisted");
                        }}
                        className="min-h-[52px] rounded-lg border border-border bg-card p-2 flex flex-col justify-between shadow-2xs hover:border-teal-500/70 transition-all cursor-pointer"
                      >
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
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("pending");
                        }}
                        className="min-h-[52px] rounded-lg border border-border bg-card p-2 flex flex-col justify-between shadow-2xs hover:border-amber-500/70 transition-all cursor-pointer"
                      >
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
                      <div
                        onClick={() => {
                          setActiveTab("applications");
                          setMobileSubPage("none");
                          setApplicationStatusFilter("rejected");
                        }}
                        className="min-h-[52px] rounded-lg border border-border bg-card p-2 flex flex-col justify-between shadow-2xs hover:border-rose-500/70 transition-all cursor-pointer"
                      >
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
                      <div
                        onClick={() => {
                          setActiveTab("schemes");
                          setMobileSubPage("none");
                        }}
                        className="min-h-[52px] rounded-lg border border-border bg-card p-2 flex flex-col justify-between shadow-2xs hover:border-purple-500/70 transition-all cursor-pointer"
                      >
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
                        </div>
                      </div>

                      {/* 8. Covered Booth */}
                      <div className="min-h-[52px] rounded-lg border border-border bg-card p-2 flex flex-col justify-between shadow-2xs hover:border-cyan-500/70 transition-all cursor-pointer">
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
                            {currentMetrics.convertedBooths} / 30,495
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
                            onClick={() => setMobileSubPage("none")}
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

                    {/* Dedicated Subpage 5: Notifications Page */}
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

                        {/* Interactive Status Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setApplicationStatusFilter("all")}
                            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              applicationStatusFilter === "all"
                                ? "bg-[#0b132b] text-white shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                          >
                            {lang === "ml" ? `എല്ലാം (${applicationsCount})` : `All (${applicationsCount})`}
                          </button>

                          <button
                            type="button"
                            onClick={() => setApplicationStatusFilter("assisted")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              applicationStatusFilter === "assisted"
                                ? "bg-teal-700 text-white shadow-xs"
                                : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/80 hover:bg-teal-100"
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{lang === "ml" ? `സഹായം ലഭിച്ചവ (${currentMetrics.assisted})` : `Assisted (${currentMetrics.assisted})`}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setApplicationStatusFilter("pending")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              applicationStatusFilter === "pending"
                                ? "bg-amber-600 text-white shadow-xs"
                                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 hover:bg-amber-100"
                            }`}
                          >
                            <Hourglass className="h-3 w-3" />
                            <span>{lang === "ml" ? `പെൻഡിംഗ് (${currentMetrics.pending})` : `Pending (${currentMetrics.pending})`}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setApplicationStatusFilter("rejected")}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                              applicationStatusFilter === "rejected"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 hover:bg-rose-100"
                            }`}
                          >
                            <XCircle className="h-3 w-3" />
                            <span>{lang === "ml" ? `നിരസിച്ചവ (${currentMetrics.rejected})` : `Rejected (${currentMetrics.rejected})`}</span>
                          </button>
                        </div>

                        {/* List of Applications */}
                        <div className="space-y-2 pt-1">
                          {/* Item 1: Pending */}
                          {(applicationStatusFilter === "all" || applicationStatusFilter === "pending") && (
                            <div className="p-3 rounded-2xl bg-[#FFFDF3] dark:bg-amber-950/20 border border-[#FEF3C7] dark:border-amber-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer">
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
                          {(applicationStatusFilter === "all" || applicationStatusFilter === "assisted") && (
                            <div className="p-3 rounded-2xl bg-[#F0FDF4] dark:bg-teal-950/20 border border-[#DCFCE7] dark:border-teal-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer">
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
                          {(applicationStatusFilter === "all" || applicationStatusFilter === "pending") && (
                            <div className="p-3 rounded-2xl bg-[#FFFDF3] dark:bg-amber-950/20 border border-[#FEF3C7] dark:border-amber-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer">
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
                          {(applicationStatusFilter === "all" || applicationStatusFilter === "rejected") && (
                            <div className="p-3 rounded-2xl bg-[#FFF5F5] dark:bg-rose-950/20 border border-[#FFE4E6] dark:border-rose-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer">
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
                          {(applicationStatusFilter === "all" || applicationStatusFilter === "assisted") && (
                            <div className="p-3 rounded-2xl bg-[#F0FDF4] dark:bg-teal-950/20 border border-[#DCFCE7] dark:border-teal-900/40 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer">
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
                {/* Search Bar & Category Dropdown Selection Controls (Above Tabs) */}
                <div className="space-y-2 pb-0.5">
                  <div className="flex items-center gap-2">
                    {/* Scheme Search Input */}
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={schemeSearchQuery}
                        onChange={(e) => setSchemeSearchQuery(e.target.value)}
                        placeholder={lang === "ml" ? "പദ്ധതികൾ തിരയുക..." : "Search schemes..."}
                        className="w-full h-8.5 pl-8 pr-7 text-xs font-semibold rounded-xl border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                      />
                      {schemeSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSchemeSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Selection Dropdown Button */}
                    <div className="relative shrink-0">
                      <select
                        value={schemeCategoryFilter}
                        onChange={(e) => setSchemeCategoryFilter(e.target.value)}
                        className="h-8.5 pl-3 pr-7 text-xs font-bold rounded-xl border border-orange-300/80 dark:border-orange-800/80 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs cursor-pointer appearance-none"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories"}</option>
                        <option value="agriculture">{lang === "ml" ? "കൃഷി (Agriculture)" : "Agriculture"}</option>
                        <option value="healthcare">{lang === "ml" ? "ആരോഗ്യം (Healthcare)" : "Healthcare"}</option>
                        <option value="pension">{lang === "ml" ? "പെൻഷൻ (Pension)" : "Pension"}</option>
                        <option value="housing">{lang === "ml" ? "ഭവനം (Housing)" : "Housing"}</option>
                        <option value="education">{lang === "ml" ? "വിദ്യാഭ്യാസം (Education)" : "Education"}</option>
                        <option value="employment">{lang === "ml" ? "തൊഴിൽ (Employment)" : "Employment"}</option>
                        <option value="women_child">{lang === "ml" ? "വനിതാ ശിശു (Women & Child)" : "Women & Child"}</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-600 dark:text-orange-400 pointer-events-none stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* Scheme Source Tabs: All, Central, State & Filter Button */}
                <div className="flex items-center justify-between gap-1.5 border-b border-border/80 pb-2 text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <button
                      type="button"
                      onClick={() => setSchemeSourceFilter("all")}
                      className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                        schemeSourceFilter === "all"
                          ? "bg-[#ff5500] text-white shadow-xs font-extrabold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {lang === "ml" ? `എല്ലാം (128)` : `All (128)`}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSchemeSourceFilter("central")}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                        schemeSourceFilter === "central"
                          ? "bg-blue-600 text-white shadow-xs font-extrabold"
                          : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 hover:bg-blue-100"
                      }`}
                    >
                      <span>{lang === "ml" ? `കേന്ദ്ര പദ്ധതികൾ (43)` : `Central (43)`}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSchemeSourceFilter("state")}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                        schemeSourceFilter === "state"
                          ? "bg-orange-600 text-white shadow-xs font-extrabold"
                          : "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/80 hover:bg-orange-100"
                      }`}
                    >
                      <span>{lang === "ml" ? `സംസ്ഥാന പദ്ധതികൾ (85)` : `State (85)`}</span>
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

                {/* Scheme Categories Breakdown or Detailed Scheme List */}
                {selectedSchemeCategoryDetail ? (
                  /* Scheme List Page for selected Category */
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
                    {/* Back Header */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => setSelectedSchemeCategoryDetail(null)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4 text-orange-500" />
                        <span>{lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories"}</span>
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
                                setMobileSubPage("applications");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              <span>{lang === "ml" ? "അപേക്ഷിക്കുക" : "Apply Now"}</span>
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
                                setMobileSubPage("applications");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-orange-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              <span>{lang === "ml" ? "അപേക്ഷിക്കുക" : "Apply Now"}</span>
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
                                setMobileSubPage("applications");
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-[11px] flex items-center gap-1 hover:bg-slate-200 cursor-pointer transition-all"
                            >
                              <span>{lang === "ml" ? "വിശദാംശങ്ങൾ" : "View Details"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Scheme Categories Breakdown Cards */
                  <div className="space-y-2">
                    <div className="space-y-2">
                      {/* Category 1 - Agriculture */}
                      {(schemeSourceFilter === "all" || schemeSourceFilter === "central" || schemeSourceFilter === "state") &&
                       (schemeCategoryFilter === "all" || schemeCategoryFilter === "agriculture") &&
                       (!schemeSearchQuery || "agriculture farmers farmer welfare subsidy pm kisan subhiksha keralam seed subsidy കൃഷി കർഷക ക്ഷേമം".toLowerCase().includes(schemeSearchQuery.toLowerCase())) && (
                        <div
                          onClick={() => setSelectedSchemeCategoryDetail({
                            id: "agriculture",
                            titleEn: "Farmer Welfare & Subsidy Schemes",
                            titleMl: "കർഷക ക്ഷേമ സഹായങ്ങൾ",
                            categoryLabelEn: "Agriculture & Farmers",
                            categoryLabelMl: "കൃഷി",
                            count: 38
                          })}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs hover:border-orange-300 dark:hover:border-orange-800/80 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[9.5px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {lang === "ml" ? "കൃഷി" : "Agriculture & Farmers"}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              38 {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight mt-2">
                            {lang === "ml" ? "കർഷക ക്ഷേമ സഹായങ്ങൾ" : "Farmer Welfare & Subsidy Schemes"}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
                            {lang === "ml" ? "പിഎം-കിസാൻ, സുഭിക്ഷ കേരളം, വിത്തുവിതരണ പദ്ധതി" : "PM Kisan, Subhiksha Keralam, Seed Subsidy"}
                          </p>
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
                            <span>{lang === "ml" ? "ലഭ്യമായ ആനുകൂല്യങ്ങൾ" : "Active Beneficiaries: 18.4K"}</span>
                            <span className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform font-extrabold text-[10.5px]">
                              {lang === "ml" ? "പദ്ധതികൾ കാണുക" : "View Schemes"}
                              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Category 2 - Healthcare */}
                      {(schemeSourceFilter === "all" || schemeSourceFilter === "central" || schemeSourceFilter === "state") &&
                       (schemeCategoryFilter === "all" || schemeCategoryFilter === "healthcare") &&
                       (!schemeSearchQuery || "healthcare insurance health care financial assistance karunya ayushman bharat medisep ആരോഗ്യം ഇൻഷുറൻസ്".toLowerCase().includes(schemeSearchQuery.toLowerCase())) && (
                        <div
                          onClick={() => setSelectedSchemeCategoryDetail({
                            id: "healthcare",
                            titleEn: "Health Care & Financial Assistance",
                            titleMl: "ആരോഗ്യ ഇൻഷുറൻസ് സേവനങ്ങൾ",
                            categoryLabelEn: "Healthcare & Insurance",
                            categoryLabelMl: "ആരോഗ്യം",
                            count: 28
                          })}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs hover:border-orange-300 dark:hover:border-orange-800/80 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[9.5px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {lang === "ml" ? "ആരോഗ്യം" : "Healthcare & Insurance"}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              28 {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight mt-2">
                            {lang === "ml" ? "ആരോഗ്യ ഇൻഷുറൻസ് സേവനങ്ങൾ" : "Health Care & Financial Assistance"}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
                            {lang === "ml" ? "കാരുണ്യ, ആയുഷ്മാൻ ഭാരത്, മെഡിസെപ്" : "Karunya Security, Ayushman Bharat, MEDISEP"}
                          </p>
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
                            <span>{lang === "ml" ? "ലഭ്യമായ ആനുകൂല്യങ്ങൾ" : "Active Beneficiaries: 24.2K"}</span>
                            <span className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform font-extrabold text-[10.5px]">
                              {lang === "ml" ? "പദ്ധതികൾ കാണുക" : "View Schemes"}
                              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Category 3 - Pension */}
                      {(schemeSourceFilter === "all" || schemeSourceFilter === "state") &&
                       (schemeCategoryFilter === "all" || schemeCategoryFilter === "pension") &&
                       (!schemeSearchQuery || "social security pension welfare support vayoshreshtha widow pension agricultural pension പെൻഷൻ".toLowerCase().includes(schemeSearchQuery.toLowerCase())) && (
                        <div
                          onClick={() => setSelectedSchemeCategoryDetail({
                            id: "pension",
                            titleEn: "Social Welfare & Pension Support",
                            titleMl: "സാമൂഹിക സുരക്ഷാ പെൻഷനുകൾ",
                            categoryLabelEn: "Social Security Pension",
                            categoryLabelMl: "പെൻഷൻ",
                            count: 24
                          })}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs hover:border-orange-300 dark:hover:border-orange-800/80 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[9.5px] font-extrabold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/70 dark:border-cyan-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {lang === "ml" ? "പെൻഷൻ" : "Social Security Pension"}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              24 {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight mt-2">
                            {lang === "ml" ? "സാമൂഹിക സുരക്ഷാ പെൻഷനുകൾ" : "Social Welfare & Pension Support"}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
                            {lang === "ml" ? "വയോശ്രേഷ്ഠ, വാർദ്ധക്യ പെൻഷൻ, കർഷക പെൻഷൻ" : "Vayoshreshtha, Widow Pension, Agricultural Pension"}
                          </p>
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
                            <span>{lang === "ml" ? "ലഭ്യമായ ആനുകൂല്യങ്ങൾ" : "Active Beneficiaries: 31.5K"}</span>
                            <span className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform font-extrabold text-[10.5px]">
                              {lang === "ml" ? "പദ്ധതികൾ കാണുക" : "View Schemes"}
                              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Category 4 - Housing */}
                      {(schemeSourceFilter === "all" || schemeSourceFilter === "central" || schemeSourceFilter === "state") &&
                       (schemeCategoryFilter === "all" || schemeCategoryFilter === "housing") &&
                       (!schemeSearchQuery || "housing life mission subsidies infrastructure pmay urban gramin ഭവനം ഭവന നിർമ്മാണം".toLowerCase().includes(schemeSearchQuery.toLowerCase())) && (
                        <div
                          onClick={() => setSelectedSchemeCategoryDetail({
                            id: "housing",
                            titleEn: "Housing Subsidies & Infrastructure",
                            titleMl: "ഭവന നിർമ്മാണ പദ്ധതികൾ",
                            categoryLabelEn: "Housing & LIFE Mission",
                            categoryLabelMl: "ഭവനം",
                            count: 20
                          })}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs hover:border-orange-300 dark:hover:border-orange-800/80 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[9.5px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {lang === "ml" ? "ഭവന നിർമ്മാണം" : "Housing & LIFE Mission"}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              20 {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-xs sm:text-[13px] text-[#0a0f1d] dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight mt-2">
                            {lang === "ml" ? "ഭവന നിർമ്മാണ പദ്ധതികൾ" : "Housing Subsidies & Infrastructure"}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 font-medium">
                            {lang === "ml" ? "ലൈഫ് മിഷൻ, പിഎംഎവൈ ഭവന പദ്ധതി" : "LIFE Mission Housing, PMAY Urban/Gramin"}
                          </p>
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2.5 text-[10.5px] text-slate-400 font-medium">
                            <span>{lang === "ml" ? "ലഭ്യമായ ആനുകൂല്യങ്ങൾ" : "Active Beneficiaries: 12.1K"}</span>
                            <span className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform font-extrabold text-[10.5px]">
                              {lang === "ml" ? "പദ്ധതികൾ കാണുക" : "View Schemes"}
                              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "applications" && (
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

                {/* Interactive Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setApplicationStatusFilter("all")}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                      applicationStatusFilter === "all"
                        ? "bg-[#ff5500] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {lang === "ml" ? `എല്ലാം (${applicationsCount})` : `All (${applicationsCount})`}
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplicationStatusFilter("assisted")}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                      applicationStatusFilter === "assisted"
                        ? "bg-teal-700 text-white shadow-xs"
                        : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/80 hover:bg-teal-100"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{lang === "ml" ? `സഹായം ലഭിച്ചവ (${currentMetrics.assisted})` : `Assisted (${currentMetrics.assisted})`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplicationStatusFilter("pending")}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                      applicationStatusFilter === "pending"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 hover:bg-amber-100"
                    }`}
                  >
                    <Hourglass className="h-3 w-3" />
                    <span>{lang === "ml" ? `പെൻഡിംഗ് (${currentMetrics.pending})` : `Pending (${currentMetrics.pending})`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplicationStatusFilter("rejected")}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                      applicationStatusFilter === "rejected"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 hover:bg-rose-100"
                    }`}
                  >
                    <XCircle className="h-3 w-3" />
                    <span>{lang === "ml" ? `നിരസിച്ചവ (${currentMetrics.rejected})` : `Rejected (${currentMetrics.rejected})`}</span>
                  </button>
                </div>

                {/* SLA Breaches Banner */}
                {/* Removed per user request */}

                {/* List of Applications */}
                <div className="space-y-2 pt-1">
                  {/* Item 1: Pending */}
                  {(applicationStatusFilter === "all" || applicationStatusFilter === "pending") && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer">
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

                  {/* Item 2: Assisted */}
                  {(applicationStatusFilter === "all" || applicationStatusFilter === "assisted") && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer">
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

                  {/* Item 3: Pending */}
                  {(applicationStatusFilter === "all" || applicationStatusFilter === "pending") && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer">
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

                  {/* Item 4: Rejected */}
                  {(applicationStatusFilter === "all" || applicationStatusFilter === "rejected") && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer">
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

                  {/* Item 5: Assisted */}
                  {(applicationStatusFilter === "all" || applicationStatusFilter === "assisted") && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer">
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
            )}
          </div>

          {/* Sticky Phone App Bottom Footer Navigation */}
          {(mobileSubPage === "none" || mobileSubPage === "leaderboard" || mobileSubPage === "beneficiaries") && (
            <AdminMobileAppBottomNav
              activeTab={showMoreMenu || mobileSubPage === "leaderboard" || mobileSubPage === "beneficiaries" ? "more" : activeTab}
              onTabChange={(tab) => {
                if (tab === "more") {
                  setShowMoreMenu(true);
                } else {
                  setActiveTab(tab);
                  setMobileSubPage("none");
                  setShowMoreMenu(false);
                }
              }}
            />
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
              onClick={() => setShowFilterMenu(false)}
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
                    <div className="col-span-2 flex flex-col gap-2 p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/80">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1">
                          <span>{lang === "ml" ? "ഭൂമിശാസ്ത്രം / മേഖല" : "Geography Scope"}</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/80 px-2 py-0.5 rounded-full uppercase">
                          {filterGeoScope} level
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Scope Level Selector */}
                        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {lang === "ml" ? "തല തിരഞ്ഞെടുക്കുക" : "Select Level"}
                          </label>
                          <select
                            value={filterGeoScope}
                            onChange={(e) => setFilterGeoScope(e.target.value)}
                            className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-black text-amber-950 dark:text-amber-100 focus:outline-none cursor-pointer"
                          >
                            <option value="state">State Level (All Kerala)</option>
                            <option value="district">District Level</option>
                            <option value="mandalam">Mandalam Level</option>
                            <option value="area">Area / Sector Level</option>
                            <option value="booth">Booth Level</option>
                          </select>
                        </div>

                        {/* Dynamic Cascading Dropdowns based on Level */}
                        {filterGeoScope !== "state" && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "ജില്ല" : "District"}
                            </label>
                            <select
                              value={selectedDistrict}
                              onChange={(e) => {
                                const newDist = e.target.value;
                                setSelectedDistrict(newDist);
                                const mandalams = constituencies.filter(c => c.districtId === newDist);
                                if (mandalams.length > 0) {
                                  setSelectedMandalam(mandalams[0].id);
                                  const areas = getAreasForMandalam(mandalams[0].id, lang);
                                  if (areas.length > 0) {
                                    setSelectedArea(areas[0].id);
                                  }
                                }
                              }}
                              className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d[lang]}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {(filterGeoScope === "mandalam" || filterGeoScope === "area" || filterGeoScope === "booth") && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "മണ്ഡലം" : "Mandalam"}
                            </label>
                            <select
                              value={selectedMandalam}
                              onChange={(e) => {
                                const newMandalam = e.target.value;
                                setSelectedMandalam(newMandalam);
                                const areas = getAreasForMandalam(newMandalam, lang);
                                if (areas.length > 0) {
                                  setSelectedArea(areas[0].id);
                                }
                              }}
                              className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              {constituencies.filter(c => c.districtId === selectedDistrict).map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c[lang]}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {(filterGeoScope === "area" || filterGeoScope === "booth") && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "ഏരിയ / മേഖലാ" : "Area / Sector"}
                            </label>
                            <select
                              value={selectedArea}
                              onChange={(e) => setSelectedArea(e.target.value)}
                              className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              {getAreasForMandalam(selectedMandalam, lang).map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a[lang]}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {filterGeoScope === "booth" && (
                          <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {lang === "ml" ? "ബൂത്ത് തിരഞ്ഞെടുക്കുക" : "Select Booth"}
                            </label>
                            <select
                              value={selectedBooth}
                              onChange={(e) => setSelectedBooth(e.target.value)}
                              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-black text-amber-950 dark:text-amber-100 focus:outline-none cursor-pointer"
                            >
                              {[101, 102, 103, 104, 105, 106, 107, 108].map((num) => (
                                <option key={num} value={`booth_${num}`}>
                                  {lang === "ml" ? `ബൂത്ത് #${num}` : `Booth #${num}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scheme Source Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === "ml" ? "പദ്ധതി ഉറവിടം (Scheme Source)" : "Scheme Source"}
                      </label>
                      <select
                        value={schemeSourceFilter}
                        onChange={(e) => setSchemeSourceFilter(e.target.value as "all" | "central" | "state")}
                        className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ ഉറവിടങ്ങളും" : "All Sources"}</option>
                        <option value="central">{lang === "ml" ? "കേന്ദ്ര സർക്കാർ (Central Government)" : "Central Government"}</option>
                        <option value="state">{lang === "ml" ? "സംസ്ഥാന സർക്കാർ (State Government)" : "State Government"}</option>
                      </select>
                    </div>

                    {/* Scheme Category Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === "ml" ? "പദ്ധതി വിഭാഗം (Category)" : "Scheme Category"}
                      </label>
                      <select
                        value={schemeCategoryFilter}
                        onChange={(e) => setSchemeCategoryFilter(e.target.value)}
                        className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories"}</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="education">Education</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="housing">Housing</option>
                        <option value="pension">Pension</option>
                        <option value="employment">Employment</option>
                        <option value="women_child">Women & Child</option>
                      </select>
                    </div>

                    {/* Beneficiary Group Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === "ml" ? "ഗുണഭോക്തൃ ഗ്രൂപ്പ്" : "Beneficiary Group"}
                      </label>
                      <select
                        value={schemeBeneficiaryGroupFilter}
                        onChange={(e) => setSchemeBeneficiaryGroupFilter(e.target.value)}
                        className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ ഗ്രൂപ്പുകളും" : "All Groups"}</option>
                        <option value="farmers">Farmers</option>
                        <option value="students">Students</option>
                        <option value="women">Women</option>
                        <option value="senior_citizens">Senior Citizens</option>
                        <option value="pwd">Persons with Disabilities</option>
                        <option value="general">General Public</option>
                      </select>
                    </div>

                    {/* Eligibility Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === "ml" ? "യോജ്യത (Eligibility)" : "Eligibility"}
                      </label>
                      <select
                        value={schemeEligibilityFilter}
                        onChange={(e) => setSchemeEligibilityFilter(e.target.value)}
                        className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ പദ്ധതികളും" : "All Schemes"}</option>
                        <option value="eligible">Potentially Eligible</option>
                        <option value="not_checked">Eligibility Not Checked</option>
                      </select>
                    </div>

                    {/* Application Status Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === "ml" ? "അപേക്ഷാ അവസ്ഥ" : "Application Status"}
                      </label>
                      <select
                        value={schemeAppStatusFilter}
                        onChange={(e) => setSchemeAppStatusFilter(e.target.value)}
                        className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ അവസ്ഥകളും" : "All Statuses"}</option>
                        <option value="accepting">Accepting Applications</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="closed">Closed</option>
                        <option value="unknown">Status Unknown</option>
                      </select>
                    </div>

                    {/* Department / Ministry Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === "ml" ? "വകുപ്പ് / മന്ത്രാലയം" : "Department / Ministry"}
                      </label>
                      <select
                        value={schemeDeptFilter}
                        onChange={(e) => setSchemeDeptFilter(e.target.value)}
                        className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ വകുപ്പുകളും" : "All Departments"}</option>
                        <option value="agri">Ministry of Agriculture</option>
                        <option value="health">Ministry of Health & Family Welfare</option>
                        <option value="housing">Ministry of Housing & Urban Affairs</option>
                        <option value="social">Ministry of Social Justice</option>
                        <option value="rural">Department of Rural Development</option>
                      </select>
                    </div>

                    {/* Scheme Type Filter */}
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === "ml" ? "പദ്ധതി മാതൃക (Scheme Type)" : "Scheme Type"}
                      </label>
                      <select
                        value={schemeTypeFilter}
                        onChange={(e) => setSchemeTypeFilter(e.target.value)}
                        className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="all">{lang === "ml" ? "എല്ലാ മാതൃകകളും" : "All Scheme Types"}</option>
                        <option value="financial">Financial Assistance</option>
                        <option value="subsidy">Subsidy</option>
                        <option value="insurance">Insurance</option>
                        <option value="loan">Loan</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="training">Training</option>
                      </select>
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
        </div>
      </div>
    </div>
  );
}
