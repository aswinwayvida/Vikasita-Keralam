import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  Download,
  FileText,
  FileCheck2,
  Filter,
  HeartHandshake,
  Layers,
  LineChart,
  MapPin,
  Maximize2,
  MessageCircle,
  MessageSquare,
  Radio,
  RefreshCw,
  Search,
  Send,
  Share2,
  Sparkles,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
  Zap,
  Smartphone,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import beneficiaries3dIcon from "@/assets/kpi-3d/beneficiaries.png";
import applications3dIcon from "@/assets/kpi-3d/applications.png";
import received3dIcon from "@/assets/kpi-3d/received.png";
import inReview3dIcon from "@/assets/kpi-3d/in-review.png";
import assisted3dIcon from "@/assets/kpi-3d/assisted.png";
import pending3dIcon from "@/assets/kpi-3d/pending.png";
import rejected3dIcon from "@/assets/kpi-3d/rejected.png";
import schemes3dIcon from "@/assets/kpi-3d/schemes.png";
import users3dIcon from "@/assets/kpi-3d/users.png";
import coveredBooth3dIcon from "@/assets/kpi-3d/covered-booth.png";
import { SchemesByCategoryCard } from "@/components/admin/SchemesByCategoryCard";
import { LeaderboardCard } from "@/components/admin/LeaderboardCard";
import { AdminMobileAppBottomNav, AdminMobileTab } from "@/components/admin/AdminMobileAppBottomNav";
import { AdminMobilePreviewModal } from "@/components/admin/AdminMobilePreviewModal";
import {
  OrgLevel,
  UserRole,
  roleConfigs,
  serviceTrendData,
  orgPerformanceData,
} from "@/data/admin-dashboard-metrics";
import { districts, constituencies } from "@/data/geo";
import { SchemeDemandAndEligibility } from "@/components/admin/SchemeDemandAndEligibility";
import { DatePickerModal } from "@/components/admin/DatePickerModal";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});


type DashboardDatePreset =
  | "allTime"
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "thisYear"
  | "yesterday"
  | "lastWeek"
  | "lastMonth"
  | "lastYear";

type DashboardDateFilterMode = "single" | "range";

const DASHBOARD_DATE_REFERENCE = new Date(2026, 9, 8);

const DASHBOARD_DATE_PRESETS_ROW1: { key: DashboardDatePreset; en: string; ml: string }[] = [
  { key: "allTime", en: "All time", ml: "എല്ലാ സമയവും" },
  { key: "today", en: "Today", ml: "ഇന്ന്" },
  { key: "yesterday", en: "Yesterday", ml: "ഇന്നലെ" },
  { key: "thisWeek", en: "This week", ml: "ഈ ആഴ്ച" },
  { key: "lastWeek", en: "Last week", ml: "കഴിഞ്ഞ ആഴ്ച" },
];

const DASHBOARD_DATE_PRESETS_ROW2: { key: DashboardDatePreset; en: string; ml: string }[] = [
  { key: "thisMonth", en: "This month", ml: "ഈ മാസം" },
  { key: "lastMonth", en: "Last month", ml: "കഴിഞ്ഞ മാസം" },
  { key: "thisYear", en: "This year", ml: "ഈ വർഷം" },
  { key: "lastYear", en: "Last year", ml: "കഴിഞ്ഞ വർഷം" },
];

function isSameDashboardDate(a: Date | null | undefined, b: Date | null | undefined) {
  return Boolean(
    a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate(),
  );
}

function DashboardDateFilter({ lang }: { lang: "en" | "ml" }) {
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const locale = lang === "ml" ? "ml-IN" : "en-GB";
  const [isOpen, setIsOpen] = useState(false);
  const [appliedDate, setAppliedDate] = useState(() => new Date(DASHBOARD_DATE_REFERENCE));
  const [appliedPreset, setAppliedPreset] = useState<DashboardDatePreset | null>("thisMonth");
  const [draftDate, setDraftDate] = useState(() => new Date(DASHBOARD_DATE_REFERENCE));
  const [draftPreset, setDraftPreset] = useState<DashboardDatePreset | null>("thisMonth");
  const [draftMode, setDraftMode] = useState<DashboardDateFilterMode>("single");
  const [draftRangeStart, setDraftRangeStart] = useState<Date | null>(null);
  const [draftRangeEnd, setDraftRangeEnd] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(DASHBOARD_DATE_REFERENCE.getFullYear(), DASHBOARD_DATE_REFERENCE.getMonth(), 1),
  );

  const formatMonth = (date: Date) =>
    date.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const formatFullDate = (date: Date) =>
    date.toLocaleDateString(locale, {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const formatShortDate = (date: Date) =>
    date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        new Date(2026, 9, 4 + index).toLocaleDateString(locale, { weekday: "narrow" }),
      ),
    [locale],
  );

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const leadingDays = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = Array.from({ length: leadingDays }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  const presetDate = (preset: DashboardDatePreset) => {
    const reference = new Date(DASHBOARD_DATE_REFERENCE);
    const year = reference.getFullYear();
    const month = reference.getMonth();
    const day = reference.getDate();
    const startOfWeek = new Date(year, month, day - reference.getDay());

    switch (preset) {
      case "today":
        return reference;
      case "yesterday":
        return new Date(year, month, day - 1);
      case "thisWeek":
        return startOfWeek;
      case "lastWeek":
        return new Date(year, month, day - reference.getDay() - 7);
      case "thisMonth":
        return reference;
      case "lastMonth":
        return new Date(year, month - 1, day);
      case "thisYear":
        return new Date(year, 0, day);
      case "lastYear":
        return new Date(year - 1, 0, day);
      case "allTime":
      default:
        return reference;
    }
  };

  const resetDraft = () => {
    setDraftDate(new Date(appliedDate));
    setDraftPreset(appliedPreset);
    setDraftMode("single");
    setDraftRangeStart(null);
    setDraftRangeEnd(null);
    setViewMonth(new Date(appliedDate.getFullYear(), appliedDate.getMonth(), 1));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) resetDraft();
    setIsOpen(nextOpen);
  };

  const handlePresetSelect = (preset: DashboardDatePreset) => {
    const nextDate = presetDate(preset);
    setDraftPreset(preset);
    setDraftDate(nextDate);
    setDraftMode("single");
    setDraftRangeStart(nextDate);
    setDraftRangeEnd(null);
    setViewMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
  };

  const handleModeChange = (mode: DashboardDateFilterMode) => {
    setDraftMode(mode);
    setDraftPreset(null);
    if (mode === "range") {
      setDraftRangeStart(null);
      setDraftRangeEnd(null);
    }
  };

  const handleDaySelect = (date: Date) => {
    if (draftMode === "single") {
      setDraftDate(date);
      setDraftPreset(null);
      return;
    }

    if (!draftRangeStart || draftRangeEnd) {
      setDraftRangeStart(date);
      setDraftRangeEnd(null);
      return;
    }

    if (date.getTime() < draftRangeStart.getTime()) {
      setDraftRangeStart(date);
      setDraftRangeEnd(null);
      return;
    }

    setDraftRangeEnd(date);
  };

  const stepAppliedMonth = (offset: number) => {
    setAppliedDate((current) => {
      const targetMonth = new Date(current.getFullYear(), current.getMonth() + offset, 1);
      const lastDay = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0,
      ).getDate();
      return new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth(),
        Math.min(current.getDate(), lastDay),
      );
    });
    setAppliedPreset(null);
  };

  const stepViewMonth = (offset: number) => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const applySelection = () => {
    if (draftMode === "single") {
      setAppliedDate(draftDate);
      setAppliedPreset(draftPreset);
    } else if (draftRangeStart && draftRangeEnd) {
      setAppliedDate(draftRangeEnd);
      setAppliedPreset(null);
    }
    setIsOpen(false);
  };

  const rangeStart = draftRangeStart;
  const rangeEnd = draftRangeEnd;
  const rangeStartTime = rangeStart?.getTime() ?? null;
  const rangeEndTime = rangeEnd?.getTime() ?? null;
  const appliedDateLabel =
    appliedPreset === "thisMonth" ? formatMonth(appliedDate) : formatShortDate(appliedDate);
  const draftSummary =
    draftMode === "single"
      ? formatFullDate(draftDate)
      : `${rangeStart ? formatShortDate(rangeStart) : tr("Start date", "ആരംഭ തീയതി")} – ${
          rangeEnd ? formatShortDate(rangeEnd) : tr("End date", "അവസാന തീയതി")
        }`;

  return (
    <div className="flex h-8 items-center rounded-xl sm:rounded-lg border border-border bg-background p-0.5 shadow-2xs shrink-0">
      <button
        type="button"
        onClick={() => stepAppliedMonth(-1)}
        aria-label={tr("Previous month", "മുൻ മാസം")}
        title={tr("Previous month", "മുൻ മാസം")}
        className="flex h-7 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-[12px] font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          title={tr("Select date", "തീയതി തിരഞ്ഞെടുക്കുക")}
        >
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span className="whitespace-nowrap">{appliedDateLabel}</span>
        </button>

        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 border-l border-border bg-white p-0 sm:max-w-[420px] z-50"
        >
          <SheetHeader className="space-y-1 border-b border-slate-100 px-5 py-4 pr-12 text-left">
            <SheetTitle className="flex items-center gap-2 text-base font-bold text-[#101828]">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{tr("Date filter", "തീയതി ഫിൽട്ടർ")}</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              {tr(
                "Choose a preset, single date, or date range.",
                "ഒരു പ്രീസെറ്റ്, ഒരു തീയതി അല്ലെങ്കിൽ തീയതി പരിധി തിരഞ്ഞെടുക്കുക.",
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-4 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {DASHBOARD_DATE_PRESETS_ROW1.map((preset) => {
                  const isActive = draftPreset === preset.key;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handlePresetSelect(preset.key)}
                      className={cn(
                        "rounded-full border px-2.5 py-[3px] text-[10.5px] leading-4 font-semibold transition-colors cursor-pointer",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                          : "border-[#f2dfca] bg-[#fffaf3] text-slate-700 hover:border-primary/40 hover:bg-orange-50",
                      )}
                    >
                      {lang === "ml" ? preset.ml : preset.en}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {DASHBOARD_DATE_PRESETS_ROW2.map((preset) => {
                  const isActive = draftPreset === preset.key;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handlePresetSelect(preset.key)}
                      className={cn(
                        "rounded-full border px-2.5 py-[3px] text-[10.5px] leading-4 font-semibold transition-colors cursor-pointer",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                          : "border-[#f2dfca] bg-[#fffaf3] text-slate-700 hover:border-primary/40 hover:bg-orange-50",
                      )}
                    >
                      {lang === "ml" ? preset.ml : preset.en}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mx-4 mt-3 border-t border-slate-100" />

            <div className="space-y-1.5 px-4 pt-3">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  {tr("Select date", "തീയതി തിരഞ്ഞെടുക്കുക")}
                </span>
                <div className="flex items-center gap-4 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => handleModeChange("single")}
                    className={cn(
                      "border-b-2 pb-0.5 transition-colors cursor-pointer",
                      draftMode === "single"
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-slate-500 hover:text-foreground",
                    )}
                  >
                    {tr("Single Date", "ഒരു തീയതി")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("range")}
                    className={cn(
                      "border-b-2 pb-0.5 transition-colors cursor-pointer",
                      draftMode === "range"
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-slate-500 hover:text-foreground",
                    )}
                  >
                    {tr("Date Range", "തീയതി പരിധി")}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-4 pt-3 pb-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[15px] font-bold tracking-tight text-[#101828]">
                    {formatMonth(viewMonth)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => stepViewMonth(-1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-foreground transition-colors cursor-pointer"
                      aria-label={tr("Previous month", "മുൻ മാസം")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepViewMonth(1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-foreground transition-colors cursor-pointer"
                      aria-label={tr("Next month", "അടുത്ത മാസം")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-y-1 text-center">
                  {weekdayLabels.map((label, index) => (
                    <span
                      key={`${label}-${index}`}
                      className="pb-1 text-[10px] font-bold uppercase text-slate-400"
                    >
                      {label}
                    </span>
                  ))}

                  {calendarDays.map((day, index) => {
                    if (!day) return <span key={`empty-${index}`} className="h-10" />;

                    const dayTime = day.getTime();
                    const isSelected =
                      draftMode === "single"
                        ? isSameDashboardDate(day, draftDate)
                        : isSameDashboardDate(day, rangeStart) || isSameDashboardDate(day, rangeEnd);
                    const isInRange =
                      draftMode === "range" &&
                      rangeStartTime !== null &&
                      rangeEndTime !== null &&
                      dayTime > Math.min(rangeStartTime, rangeEndTime) &&
                      dayTime < Math.max(rangeStartTime, rangeEndTime);

                    return (
                      <div key={day.toISOString()} className="flex h-[34px] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleDaySelect(day)}
                          aria-label={formatFullDate(day)}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition-colors cursor-pointer",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : isInRange
                                ? "bg-orange-50 text-primary hover:bg-orange-100"
                                : "text-[#344054] hover:bg-orange-50 hover:text-primary",
                          )}
                        >
                          {day.getDate()}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-3">
            <div className="mr-auto text-xs font-normal text-slate-600">
              {draftSummary}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {tr("Cancel", "റദ്ദാക്കുക")}
              </button>
              <button
                type="button"
                onClick={applySelection}
                disabled={draftMode === "range" && (!rangeStart || !rangeEnd)}
                className="inline-flex h-8 min-w-16 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
              >
                {tr("Done", "പൂർത്തിയായി")}
              </button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <button
        type="button"
        onClick={() => stepAppliedMonth(1)}
        aria-label={tr("Next month", "അടുത്ത മാസം")}
        title={tr("Next month", "അടുത്ത മാസം")}
        className="flex h-7 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AdminDashboard() {
  const { lang, setLang } = useLang();
  const [currentRole, setCurrentRole] = useState<UserRole>("STATE_ADMIN");
  const [period, setPeriod] = useState("30d");
  const [dashboardDate, setDashboardDate] = useState<Date>(new Date(2026, 9, 1));

  const handleStepMonth = (direction: -1 | 1) => {
    setDashboardDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const formatDashboardMonth = (date: Date, language: "en" | "ml") => {
    const monthNamesEn = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthNamesMl = [
      "ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ",
      "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്ടോബർ", "നവംബർ", "ഡിസംബർ"
    ];
    const monthStr = language === "ml" ? monthNamesMl[date.getMonth()] : monthNamesEn[date.getMonth()];
    return `${monthStr} ${date.getFullYear()}`;
  };
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [beneficiaryTab, setBeneficiaryTab] = useState<"district" | "recent">("district");

  // Geography Drill-Down State
  const [selectedLocationLevel, setSelectedLocationLevel] = useState("BOOTH");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [selectedMandalam, setSelectedMandalam] = useState("ALL");
  const [selectedArea, setSelectedArea] = useState("ALL");
  const [selectedBooth, setSelectedBooth] = useState("ALL");

  // Mobile App Preview State
  const [mobileTab, setMobileTab] = useState<AdminMobileTab>("overview");
  const [isMobileFrameActive, setIsMobileFrameActive] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  // Filter Popover State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const handleMobileTabChange = (tab: AdminMobileTab) => {
    setMobileTab(tab);
    if ((tab as string) === "users" || tab === "schemes" || tab === "applications") {
      setIsMobileModalOpen(true);
    } else if ((tab as string) === "more") {
      setIsFilterOpen(true);
    }
  };

  // Close filter panel on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const locationLevelOptions = [
    { value: "STATE", label: lang === "ml" ? "സംസ്ഥാനം" : "State" },
    { value: "REGION", label: lang === "ml" ? "റീജിയൻ" : "Region" },
    { value: "DISTRICT", label: lang === "ml" ? "ഓർഗനൈസേഷൻ ജില്ല" : "Org District" },
    { value: "MANDALAM", label: lang === "ml" ? "നിയമസഭാ മണ്ഡലം" : "Assembly Mandalam" },
    { value: "AREA", label: lang === "ml" ? "ഏരിയ" : "Area" },
    { value: "BOOTH", label: lang === "ml" ? "വാർഡ് / ബൂത്ത്" : "Ward / Booth" },
  ];

  const districtOptions = [
    { value: "ALL", label: lang === "ml" ? "എല്ലാ ഓർഗനൈസേഷൻ ജില്ലകളും" : "All Org Districts" },
    ...districts.map((d) => ({
      value: d.id,
      label: d[lang],
    })),
  ];

  const regionOptions = [
    { value: "ALL", label: lang === "ml" ? "എല്ലാ റീജിയണുകളും" : "All Regions" },
    { value: "SOUTH", label: lang === "ml" ? "തെക്കൻ റീജിയൻ" : "South Region" },
    { value: "CENTRAL", label: lang === "ml" ? "മധ്യ റീജിയൻ" : "Central Region" },
    { value: "NORTH", label: lang === "ml" ? "വടക്കൻ റീജിയൻ" : "North Region" },
  ];

  const areaOptions = [
    { value: "ALL", label: lang === "ml" ? "എല്ലാ ഏരിയകളും" : "All Areas" },
    { value: "AREA_1", label: lang === "ml" ? "ഏരിയ 01" : "Area 01" },
    { value: "AREA_2", label: lang === "ml" ? "ഏരിയ 02" : "Area 02" },
    { value: "AREA_3", label: lang === "ml" ? "ഏരിയ 03" : "Area 03" },
  ];

  const filteredMandalams = selectedDistrict === "ALL" 
    ? constituencies 
    : constituencies.filter((c) => c.districtId === selectedDistrict);

  const boothOptions = [
    { value: "ALL", label: lang === "ml" ? "എല്ലാ വാർഡുകളും / ബൂത്തുകളും" : "All Wards / Booths" },
    { value: "Booth 01", label: lang === "ml" ? "വാർഡ് 01 / ബൂത്ത് 01" : "Ward 01 / Booth 01" },
    { value: "Booth 02", label: lang === "ml" ? "വാർഡ് 02 / ബൂത്ത് 02" : "Ward 02 / Booth 02" },
    { value: "Booth 03", label: lang === "ml" ? "വാർഡ് 03 / ബൂത്ത് 03" : "Ward 03 / Booth 03" },
    { value: "Booth 04", label: lang === "ml" ? "വാർഡ് 04 / ബൂത്ത് 04" : "Ward 04 / Booth 04" },
  ];

  const activeFiltersCount =
    (selectedLocationLevel !== "STATE" ? 1 : 0) +
    (selectedScheme !== "ALL" ? 1 : 0) +
    (selectedStatus !== "ALL" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (selectedDistrict !== "ALL" ? 1 : 0) +
    (selectedMandalam !== "ALL" ? 1 : 0) +
    (selectedBooth !== "ALL" ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedLocationLevel("STATE");
    setSelectedScheme("ALL");
    setSelectedStatus("ALL");
    setSearchQuery("");
    setSelectedRegion("ALL");
    setSelectedDistrict("ALL");
    setSelectedMandalam("ALL");
    setSelectedArea("ALL");
    setSelectedBooth("ALL");
  };

  return (
    <div className="space-y-6 pb-12 text-foreground">
      {/* Merged Single Section Container */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs space-y-3">
        {/* Top Header Row with Title & Period / Filter Controls */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between border-b border-border/80 pb-2.5">
          <div className="space-y-0.5 max-w-2xl">
            <h1 className="font-display text-[20px] font-bold text-foreground flex items-center gap-2">
              <span>{lang === "ml" ? "അവലോകനം" : "Overview"}</span>
              <span className="inline-block text-[20px] animate-bounce hover:scale-125 transition-transform duration-300 cursor-pointer">🪷</span>
            </h1>
          </div>

          {/* Period & Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 self-start lg:self-center">
            {/* Date Filter */}
            <DashboardDateFilter lang={lang} />

            {/* Filter Control */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`h-8 rounded-xl sm:rounded-lg border px-3 text-xs font-bold shadow-2xs transition-all flex items-center gap-2 cursor-pointer ${
                  activeFiltersCount > 0 || isFilterOpen
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{lang === "ml" ? "ഫിൽട്ടറുകൾ" : "Filter"}</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-primary-foreground">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Filter Right-Sided Drawer Popup */}
              {isFilterOpen && (
                <div
                  className="fixed inset-0 z-[100] flex justify-end bg-black/50 transition-opacity animate-in fade-in duration-200"
                  onClick={() => setIsFilterOpen(false)}
                >
                  <div
                    className="w-full max-w-sm h-full bg-card p-5 shadow-2xl transition-all border-l border-border animate-in slide-in-from-right duration-300 overflow-y-auto flex flex-col justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-5">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-primary" />
                          <span className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                            {lang === "ml" ? "ഹോം ഫിൽട്ടർ" : "HOME FILTER"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsFilterOpen(false)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Location & Geography Filter */}
                      <div className="space-y-3.5">
                        {/* Select Location Level */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">
                            {lang === "ml" ? "ലൊക്കേഷൻ ലെവൽ തിരഞ്ഞെടുക്കുക" : "Select Location Level"}
                          </label>
                          <select
                            value={selectedLocationLevel}
                            onChange={(e) => setSelectedLocationLevel(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:outline-none cursor-pointer shadow-2xs"
                          >
                            {locationLevelOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* State */}
                        {(selectedLocationLevel === "STATE" || selectedLocationLevel === "REGION") && (
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">
                              {lang === "ml" ? "സംസ്ഥാനം" : "State"}
                            </label>
                            <input
                              type="text"
                              disabled
                              value={lang === "ml" ? "കേരള സംസ്ഥാനം" : "Kerala State"}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 cursor-not-allowed opacity-90 shadow-2xs"
                            />
                          </div>
                        )}

                        {/* Region */}
                        {selectedLocationLevel === "REGION" && (
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">
                              {lang === "ml" ? "റീജിയൻ" : "Region"}
                            </label>
                            <select
                              value={selectedRegion}
                              onChange={(e) => setSelectedRegion(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:outline-none cursor-pointer shadow-2xs"
                            >
                              {regionOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Org District */}
                        {["DISTRICT", "MANDALAM", "AREA", "BOOTH"].includes(selectedLocationLevel) && (
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">
                              {lang === "ml" ? "ഓർഗനൈസേഷൻ ജില്ല" : "Org District"}
                            </label>
                            <select
                              value={selectedDistrict}
                              onChange={(e) => {
                                setSelectedDistrict(e.target.value);
                                setSelectedMandalam("ALL");
                                setSelectedArea("ALL");
                                setSelectedBooth("ALL");
                              }}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:outline-none cursor-pointer shadow-2xs"
                            >
                              {districtOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Assembly Mandalam */}
                        {["MANDALAM", "AREA", "BOOTH"].includes(selectedLocationLevel) && (
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">
                              {lang === "ml" ? "നിയമസഭാ മണ്ഡലം" : "Assembly Mandalam"}
                            </label>
                            <select
                              value={selectedMandalam}
                              onChange={(e) => {
                                setSelectedMandalam(e.target.value);
                                setSelectedArea("ALL");
                                setSelectedBooth("ALL");
                              }}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:outline-none cursor-pointer shadow-2xs"
                            >
                              <option value="ALL">{lang === "ml" ? "എല്ലാ മണ്ഡലങ്ങളും" : "All Mandalams"}</option>
                              {filteredMandalams.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m[lang]}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Area */}
                        {["AREA", "BOOTH"].includes(selectedLocationLevel) && (
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">
                              {lang === "ml" ? "ഏരിയ" : "Area"}
                            </label>
                            <select
                              value={selectedArea}
                              onChange={(e) => {
                                setSelectedArea(e.target.value);
                                setSelectedBooth("ALL");
                              }}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:outline-none cursor-pointer shadow-2xs"
                            >
                              {areaOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Select Ward / Booth */}
                        {selectedLocationLevel === "BOOTH" && (
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">
                              {lang === "ml" ? "വാർഡ് / ബൂത്ത് തിരഞ്ഞെടുക്കുക" : "Select Ward / Booth"}
                            </label>
                            <select
                              value={selectedBooth}
                              onChange={(e) => setSelectedBooth(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:outline-none cursor-pointer shadow-2xs"
                            >
                              {boothOptions.map((b) => (
                                <option key={b.value} value={b.value}>
                                  {b.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Panel Footer Buttons */}
                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
                      >
                        {lang === "ml" ? "റീസെറ്റ്" : "Reset"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-2xs transition-all cursor-pointer"
                      >
                        {lang === "ml" ? "ഫിൽട്ടറുകൾ പ്രയോഗിക്കുക" : "Apply Filters"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>



      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 2. EXECUTIVE 8 KPI CARDS (MATCHING REFERENCE DESIGN WITH 3D ICONS)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Card 1: Application Received */}
        <div className="group rounded-xl border border-amber-200/50 dark:border-border bg-card p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              {lang === "ml" ? "ലഭിച്ച അപേക്ഷകൾ" : "Application Received"}
            </span>
            <img src={received3dIcon} alt="Application Received" className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0" />
          </div>
          <div className="mt-1 font-display text-base sm:text-xl font-extrabold text-foreground tracking-tight">
            63,830
          </div>
        </div>

        {/* Card 2: Submitted */}
        <div className="group rounded-xl border border-amber-200/50 dark:border-border bg-card p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              {lang === "ml" ? "സമർപ്പിച്ച അപേക്ഷകൾ" : "Submitted"}
            </span>
            <img src={applications3dIcon} alt="Submitted" className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0" />
          </div>
          <div className="mt-1 font-display text-base sm:text-xl font-extrabold text-foreground tracking-tight">
            58,410
          </div>
        </div>

        {/* Card 3: Beneficiaries */}
        <div className="group rounded-xl border border-amber-200/50 dark:border-border bg-card p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiaries"}
            </span>
            <img src={assisted3dIcon} alt="Beneficiaries" className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0" />
          </div>
          <div className="mt-1 font-display text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            48,250
          </div>
        </div>

        {/* Card 4: In Review */}
        <div className="group rounded-xl border border-amber-200/50 dark:border-border bg-card p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              {lang === "ml" ? "പരിശോധനയിലുള്ളവ" : "In Review"}
            </span>
            <img src={inReview3dIcon} alt="In Review" className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0" />
          </div>
          <div className="mt-1 font-display text-base sm:text-xl font-extrabold text-foreground tracking-tight">
            8,000
          </div>
        </div>

        {/* Card 5: Pending */}
        <div className="group rounded-xl border border-amber-200/50 dark:border-border bg-card p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              {lang === "ml" ? "തീർപ്പുകൽപ്പിക്കാത്തവ" : "Pending"}
            </span>
            <img src={pending3dIcon} alt="Pending" className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0" />
          </div>
          <div className="mt-1 font-display text-base sm:text-xl font-extrabold text-amber-600 dark:text-amber-500 tracking-tight">
            6,160
          </div>
        </div>

        {/* Card 6: Rejected */}
        <div className="group rounded-xl border border-amber-200/50 dark:border-border bg-card p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              {lang === "ml" ? "നിരസിച്ചവ" : "Rejected"}
            </span>
            <img src={rejected3dIcon} alt="Rejected" className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0" />
          </div>
          <div className="mt-1 font-display text-base sm:text-xl font-extrabold text-rose-600 dark:text-rose-500 tracking-tight">
            1,420
          </div>
        </div>

        {/* Card 7: Users */}
        <div className="group rounded-xl border border-amber-200/50 dark:border-border bg-card p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              {lang === "ml" ? "ഉപയോക്താക്കൾ" : "Users"}
            </span>
            <img src={users3dIcon} alt="Users" className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0" />
          </div>
          <div className="mt-1 font-display text-base sm:text-xl font-extrabold text-sky-600 dark:text-sky-400 tracking-tight">
            1,24,500
          </div>
        </div>

        {/* Card 8: Schemes */}
        <div className="group rounded-xl border border-amber-200/50 dark:border-border bg-card p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              {lang === "ml" ? "പദ്ധതികൾ" : "Schemes"}
            </span>
            <img src={schemes3dIcon} alt="Schemes" className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0" />
          </div>
          <div className="mt-1 font-display text-base sm:text-xl font-extrabold text-foreground tracking-tight">
            740
          </div>
        </div>
      </div>



      {/* 5. WELFARE ANALYTICS & GRASSROOTS GROWTH (SCHEMES) */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Scheme Demand & Eligibility Summary (7 Cols) */}
        <div className="lg:col-span-7">
          <SchemeDemandAndEligibility />
        </div>

        {/* Right: Schemes by Category (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Schemes by Category Card (3D Donut Chart) */}
          <SchemesByCategoryCard />
        </div>
      </section>



      {/* ========================================================================= */}
      {/* 7. DISTRICT WISE PERFORMANCE & BENEFICIARY OVERVIEW                       */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: District wise Performance Table (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-purple-600" />
                {lang === "ml" ? "ജില്ലാടിസ്ഥാനത്തിലുള്ള പ്രകടനം" : "District wise Performance"}
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-900/70 font-bold text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">{lang === "ml" ? "ജില്ല" : "DISTRICT"}</th>
                  <th className="p-3 text-right">{lang === "ml" ? "ആകെ അപേക്ഷകൾ" : "TOTAL REQUESTS"}</th>
                  <th className="p-3 text-right">{lang === "ml" ? "പൂർത്തിയായവ" : "CLOSED"}</th>
                  <th className="p-3 text-right">{lang === "ml" ? "നിലവിലുള്ളവ" : "OPEN"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {districts.map((d) => {
                  const perf = orgPerformanceData.find(
                    (p) => p.level === "DISTRICT" && p.unit.toLowerCase().includes(d.en.toLowerCase())
                  );
                  const totalCount = perf ? perf.total : 2000;
                  const closedCount = perf ? perf.closed : 1700;
                  const openCount = perf ? perf.open : 200;
                  return (
                    <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-bold text-foreground">{lang === "ml" ? d.ml : d.en}</td>
                      <td className="p-3 text-right font-mono font-bold">{totalCount.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-emerald-600 font-extrabold">{closedCount.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-amber-600 font-bold">{openCount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Beneficiary Section (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/80 pb-3 gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-600" />
                  {lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "Beneficiary Summary"}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
                  <button
                    onClick={() => setBeneficiaryTab("district")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      beneficiaryTab === "district"
                        ? "bg-background text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lang === "ml" ? "ജില്ല തിരിച്ച്" : "By District"}
                  </button>
                  <button
                    onClick={() => setBeneficiaryTab("recent")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      beneficiaryTab === "recent"
                        ? "bg-background text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lang === "ml" ? "സമീപകാല പട്ടിക" : "Recent List"}
                  </button>
                </div>
              </div>
            </div>

            {/* District Wise Breakdown View */}
            {beneficiaryTab === "district" ? (
              <div className="space-y-1 pt-2 text-xs">
                <div className="flex items-center justify-between font-bold text-muted-foreground uppercase text-[10px] tracking-wider pb-2 border-b border-border/60 px-1.5">
                  <span>{lang === "ml" ? "ജില്ല" : "DISTRICT"}</span>
                  <span>{lang === "ml" ? "ഗുണഭോക്താക്കൾ" : "BENEFICIARIES"}</span>
                </div>

                <div className="divide-y divide-border/40">
                  {[
                    { en: "Thiruvananthapuram", ml: "തിരുവനന്തപുരം", count: "5,420" },
                    { en: "Ernakulam", ml: "എറണാകുളം", count: "5,190" },
                    { en: "Malappuram", ml: "മലപ്പുറം", count: "4,680" },
                    { en: "Thrissur", ml: "തൃശ്ശൂർ", count: "4,320" },
                    { en: "Kozhikode", ml: "കോഴിക്കോട്", count: "4,210" },
                    { en: "Kollam", ml: "കൊല്ലം", count: "4,120" },
                    { en: "Palakkad", ml: "പാലക്കാട്", count: "3,850" },
                    { en: "Kottayam", ml: "കോട്ടയം", count: "3,580" },
                    { en: "Alappuzha", ml: "ആലപ്പുഴ", count: "3,210" },
                    { en: "Kannur", ml: "കണ്ണൂർ", count: "3,190" },
                    { en: "Pathanamthitta", ml: "പത്തനംതിട്ട", count: "2,450" },
                    { en: "Idukki", ml: "ഇടുക്കി", count: "2,140" },
                    { en: "Kasaragod", ml: "കാസർഗോഡ്", count: "2,000" },
                    { en: "Wayanad", ml: "വയനാട്", count: "1,890" },
                  ].map((d) => (
                    <div key={d.en} className="py-2.5 sm:py-3 hover:bg-muted/30 px-2 rounded-md transition-colors flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{lang === "ml" ? d.ml : d.en}</span>
                      <span className="font-mono font-bold text-emerald-600 text-xs">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Recent Beneficiaries List View */
              <div className="space-y-1 pt-2 text-xs">
                <div className="flex items-center justify-between font-bold text-muted-foreground uppercase text-[10px] tracking-wider pb-2 border-b border-border/60 px-1.5">
                  <span>{lang === "ml" ? "ഗുണഭോക്താവ്" : "BENEFICIARY"}</span>
                  <span>{lang === "ml" ? "പദ്ധതി" : "SCHEME"}</span>
                </div>

                <div className="divide-y divide-border/40">
                  {[
                    { id: "BEN-8921", name: "Soman P", location: "TVM", scheme: "Vayoshreshtha Pension" },
                    { id: "BEN-8922", name: "Lakshmi Amma", location: "TVM", scheme: "Karunya Health" },
                    { id: "BEN-8923", name: "Abdul Rahman", location: "KLM", scheme: "Matsya Samridhi" },
                    { id: "BEN-8924", name: "Sunitha Kumari", location: "KTM", scheme: "Kudumbashree Aid" },
                    { id: "BEN-8925", name: "K. Krishnan", location: "PKD", scheme: "PM Kisan Nidhi" },
                    { id: "BEN-8926", name: "Ananya Ramesh", location: "EKM", scheme: "Pratibha Education" },
                    { id: "BEN-8927", name: "Joseph K", location: "KLM", scheme: "LIFE Mission Housing" },
                    { id: "BEN-8928", name: "Radhamani V", location: "TVM", scheme: "Handloom Subsidy" },
                    { id: "BEN-8929", name: "Muhammed Shafee", location: "MLP", scheme: "Subhiksha Keralam" },
                    { id: "BEN-8930", name: "Devaki K", location: "KNR", scheme: "Vayokshema Pension" },
                    { id: "BEN-8931", name: "Saritha V", location: "KSD", scheme: "She Pad Scheme" },
                    { id: "BEN-8932", name: "Mathew Varghese", location: "IDK", scheme: "Hill Farming Grant" },
                    { id: "BEN-8933", name: "P. Thomas", location: "CLT", scheme: "Kera Suraksha" },
                    { id: "BEN-8934", name: "Suja Nair", location: "TSR", scheme: "Pratibha Scholarship" },
                  ].map((b) => (
                    <div key={b.id} className="flex items-center justify-between py-2 sm:py-2.5 transition-colors hover:bg-muted/30 px-2 rounded-md">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground text-xs">{b.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground font-medium">({b.id})</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block font-medium">{b.location}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-primary block">{b.scheme}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>
              {beneficiaryTab === "district"
                ? lang === "ml"
                  ? "ആകെ 14 ജില്ലകൾ • 48,250 ഗുണഭോക്താക്കൾ"
                  : "All 14 Districts • 48,250 Total"
                : lang === "ml"
                ? "ആകെ 48,250 ഗുണഭോക്താക്കൾ"
                : "Showing 12 of 48,250"}
            </span>
            <Link to="/admin/beneficiaries" className="text-primary hover:underline flex items-center gap-0.5 font-bold">
              {lang === "ml" ? "എല്ലാ ഗുണഭോക്താക്കളെയും കാണുക" : "View All"} →
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. RECENT LIVE OPERATIONAL ACTIVITY & NEEDS ATTENTION QUEUE               */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Recent Live Operational Activity (65% width / 8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-bold text-foreground flex items-start gap-1.5 leading-snug">
                <Radio className="h-4 w-4 text-cyan-600 animate-pulse shrink-0 mt-0.5" />
                <span>{lang === "ml" ? "സമീപകാല പ്രവർത്തനങ്ങൾ" : "Recent Activity"}</span>
              </h2>
            </div>
            <Link to="/admin/applications" search={{ stage: undefined, filter: undefined }} className="shrink-0 whitespace-nowrap text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                id: 1,
                badgeEn: "Assigned", badgeMl: "ചുമതലപ്പെടുത്തി",
                badgeClass: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30",
                titleEn: "Case #TVM-8812 assigned to Suresh Kumar",
                titleMl: "കേസ് #TVM-8812 സുരേഷ് കുമാറിന് ചുമതലപ്പെടുത്തി",
                memberEn: "Member: Suresh Kumar · District Coordinator (TVM)",
                memberMl: "അംഗം: സുരേഷ് കുമാർ (ജില്ലാ കോ-ഓർഡിനേറ്റർ)",
                timeEn: "5 mins ago", timeMl: "5 മിനിറ്റ് മുമ്പ്",
              },
              {
                id: 2,
                badgeEn: "Escalated", badgeMl: "ഉയർത്തി നൽകി",
                badgeClass: "bg-destructive/20 text-destructive dark:text-red-400 border border-destructive/30",
                titleEn: "Case #KLM-9143 escalated to State Nodal",
                titleMl: "കേസ് #KLM-9143 സംസ്ഥാന നോഡലിലേക്ക് നൽകി",
                memberEn: "Member: Anjali Nair · Booth In-Charge (Kollam East)",
                memberMl: "അംഗം: അഞ്ജലി നായർ (ബൂത്ത് ഇൻ-ചാർജ്)",
                timeEn: "18 mins ago", timeMl: "18 മിനിറ്റ് മുമ്പ്",
              },
              {
                id: 3,
                badgeEn: "Note", badgeMl: "കുറിപ്പ്",
                badgeClass: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30",
                titleEn: "Follow-up note added: Applicant submitted Aadhaar eKYC",
                titleMl: "തുടർകുറിപ്പ് ചേർത്തു: അപേക്ഷകൻ ആധാർ eKYC സമർപ്പിച്ചു",
                memberEn: "Member: Priya Varghese · Nodal Helpdesk Volunteer",
                memberMl: "അംഗം: പ്രിയ വർഗീസ് (നോഡൽ വോളന്റിയർ)",
                timeEn: "32 mins ago", timeMl: "32 മിനിറ്റ് മുമ്പ്",
              },
              {
                id: 4,
                badgeEn: "Closed", badgeMl: "അടച്ചു",
                badgeClass: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
                titleEn: "Case #EKM-9100 successfully resolved & closed",
                titleMl: "കേസ് #EKM-9100 വിജയകരമായി പരിഹരിച്ചു അടച്ചു",
                memberEn: "Member: Rajesh Kumar · Mandal Coordinator",
                memberMl: "അംഗം: രാജേഷ് കുമാർ (മണ്ഡലം കോർഡിനേറ്റർ)",
                timeEn: "1 hour ago", timeMl: "1 മണിക്കൂർ മുമ്പ്",
              },
              {
                id: 5,
                badgeEn: "Onboarded", badgeMl: "രജിസ്റ്റർ ചെയ്തു",
                badgeClass: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30",
                titleEn: "New Citizen Onboarded: Soman P (Kazhakkoottam)",
                titleMl: "പുതിയ പൗരൻ ചേർന്നു: സോമൻ പി (കഴക്കൂട്ടം)",
                memberEn: "Actor: Citizen Portal (Self Onboarding)",
                memberMl: "സിസ്റ്റം: സിറ്റിസൺ പോർട്ടൽ",
                timeEn: "1.5 hours ago", timeMl: "1.5 മണിക്കൂർ മുമ്പ്",
              },
              {
                id: 6,
                badgeEn: "Points", badgeMl: "പോയിന്റുകൾ",
                badgeClass: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30",
                titleEn: "Referral Code #REF-KZH-44 verified (+50 points awarded)",
                titleMl: "റഫറൽ കോഡ് #REF-KZH-44 സ്ഥിരീകരിച്ചു (+50 പോയിന്റുകൾ)",
                memberEn: "Actor: System Automation Engine",
                memberMl: "സിസ്റ്റം: ഓട്ടോമേഷൻ എഞ്ചിൻ",
                timeEn: "2 hours ago", timeMl: "2 മണിക്കൂർ മുമ്പ്",
              },
              {
                id: 7,
                badgeEn: "Eligibility", badgeMl: "യോഗ്യത",
                badgeClass: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30",
                titleEn: "Karunya Health Scheme eligibility pre-screen passed",
                titleMl: "കാരുണ്യ ആരോഗ്യ സുരക്ഷാ പദ്ധതി യോഗ്യത പരിശോധന വിജയിച്ചു",
                memberEn: "Actor: Automated e-Screening Engine",
                memberMl: "സിസ്റ്റം: ഓട്ടോമേറ്റഡ് e-സ്ക്രീനിംഗ്",
                timeEn: "2.5 hours ago", timeMl: "2.5 മണിക്കൂർ മുമ്പ്",
              },
              {
                id: 8,
                badgeEn: "Status", badgeMl: "സ്റ്റാറ്റസ്",
                badgeClass: "bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30",
                titleEn: "Case #TSR-4421 status updated to In Progress",
                titleMl: "കേസ് #TSR-4421 പുരോഗതിയിലാണ് എന്നതിലേക്ക് മാറ്റി",
                memberEn: "Member: K. V. Raman · Thrissur Field Desk Officer",
                memberMl: "അംഗം: കെ. വി. രാമൻ (തൃശ്ശൂർ ഫീൽഡ് ഓഫീസർ)",
                timeEn: "3 hours ago", timeMl: "3 മണിക്കൂർ മുമ്പ്",
              },
              {
                id: 9,
                badgeEn: "Priority", badgeMl: "മുൻഗണന",
                badgeClass: "bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30",
                titleEn: "SLA Priority bumped to High for Case #KZD-3301",
                titleMl: "കേസ് #KZD-3301 മുൻഗണന ഉന്നതതലത്തിലേക്ക് ഉയർത്തി",
                memberEn: "Member: Dr. Sunil Dutt · Kozhikode Nodal Officer",
                memberMl: "അംഗം: ഡോ. സുനിൽ ദത്ത് (കോഴിക്കോട് നോഡൽ ഓഫീസർ)",
                timeEn: "3.5 hours ago", timeMl: "3.5 മണിക്കൂർ മുമ്പ്",
              },
              {
                id: 10,
                badgeEn: "Verification", badgeMl: "സ്ഥിരീകരണം",
                badgeClass: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
                titleEn: "LIFE Mission land title documents verified",
                titleMl: "ലൈഫ് മിഷൻ ഭൂമി രേഖകൾ സ്ഥിരീകരിച്ചു",
                memberEn: "Member: Mathew Joseph · Revenue Inspector (Chathannoor)",
                memberMl: "അംഗം: മാത്യു ജോസഫ് (റവന്യൂ ഇൻസ്പെക്ടർ)",
                timeEn: "4 hours ago", timeMl: "4 മണിക്കൂർ മുമ്പ്",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="p-3 sm:p-3.5 rounded-xl bg-background border border-border/80 hover:border-border transition-all space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3"
              >
                {/* Mobile Header Row: Badge & Timestamp */}
                <div className="flex items-center justify-between sm:hidden">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${item.badgeClass}`}>
                    {lang === "ml" ? item.badgeMl : item.badgeEn}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {lang === "ml" ? item.timeMl : item.timeEn}
                  </span>
                </div>

                {/* Content Details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Desktop Badge */}
                  <span className={`hidden sm:inline-block shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase mt-0.5 ${item.badgeClass}`}>
                    {lang === "ml" ? item.badgeMl : item.badgeEn}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-xs leading-snug">
                      {lang === "ml" ? item.titleMl : item.titleEn}
                    </p>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      {lang === "ml" ? item.memberMl : item.memberEn}
                    </span>
                  </div>
                </div>

                {/* Desktop Timestamp */}
                <span className="hidden sm:inline-block text-[10px] font-mono text-muted-foreground shrink-0">
                  {lang === "ml" ? item.timeMl : item.timeEn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Needs Attention Queue (35% width / 4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-bold text-foreground flex items-start gap-1.5 leading-snug">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>{lang === "ml" ? "ശ്രദ്ധ ആവശ്യമായവ" : "Needs Attention"}</span>
                </h2>
              </div>
              <Link to="/admin/applications" search={{ stage: undefined, filter: undefined }} className="shrink-0 whitespace-nowrap text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Risk 1: Unassigned Help Requests */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.03] p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 uppercase">
                    {lang === "ml" ? "ഉയർന്ന ഗൗരവം" : "High Severity"}
                  </span>
                  <span className="font-display text-base font-bold text-foreground">142</span>
                </div>
                <h3 className="font-bold text-xs text-foreground">
                  {lang === "ml" ? "ചുമതലപ്പെടുത്താത്ത സഹായ അഭ്യർത്ഥനകൾ" : "Unassigned Help Requests"}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {lang === "ml"
                    ? "142 അഭ്യർത്ഥനകൾ ഉടൻ ജില്ലാ ടീമുകൾക്ക് നൽകേണ്ടതുണ്ട്."
                    : "142 citizen help requests require immediate assignment to district teams."}
                </p>
                <Link to="/admin/applications" search={{ stage: undefined, filter: "UNASSIGNED" }} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 pt-1">
                  <span>{lang === "ml" ? "പരിഹരിക്കുക" : "Resolve Items"}</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Risk 2: Overdue Follow-ups */}
              <div className="rounded-xl border border-destructive/30 bg-destructive/[0.03] p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-destructive/20 px-2 py-0.5 text-[10px] font-extrabold text-destructive uppercase">
                    {lang === "ml" ? "അതിതീവ്ര ഗൗരവം" : "Critical Severity"}
                  </span>
                  <span className="font-display text-base font-bold text-destructive">68</span>
                </div>
                <h3 className="font-bold text-xs text-foreground">
                  {lang === "ml" ? "വൈകിയ തുടർനടപടികൾ" : "Overdue Follow-ups"}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {lang === "ml"
                    ? "68 കേസുകൾ 24 മണിക്കൂർ പരിധി കവിഞ്ഞു."
                    : "68 cases have exceeded 24h target follow-up time (3 critical SLA breaches)."}
                </p>
                <Link to="/admin/applications" search={{ stage: undefined, filter: "OVERDUE" }} className="text-[11px] font-bold text-destructive hover:underline flex items-center gap-1 pt-1">
                  <span>{lang === "ml" ? "പരിഹരിക്കുക" : "Resolve Items"}</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Risk 3: Escalated Cases */}
              <div className="rounded-xl border border-destructive/30 bg-destructive/[0.03] p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-destructive/20 px-2 py-0.5 text-[10px] font-extrabold text-destructive uppercase">
                    {lang === "ml" ? "അതിതീവ്ര ഗൗരവം" : "Critical Severity"}
                  </span>
                  <span className="font-display text-base font-bold text-destructive">24</span>
                </div>
                <h3 className="font-bold text-xs text-foreground">
                  {lang === "ml" ? "മേലധികാരികൾക്ക് നൽകിയ കേസുകൾ" : "Escalated Cases"}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {lang === "ml"
                    ? "24 പെൻഷൻ / സ്ഥിരീകരണ കേസുകൾ സംസ്ഥാന നോഡലിന് നൽകി."
                    : "24 complex pension & verification cases escalated to State Nodal."}
                </p>
                <Link to="/admin/applications" search={{ stage: undefined, filter: "ESCALATED" }} className="text-[11px] font-bold text-destructive hover:underline flex items-center gap-1 pt-1">
                  <span>{lang === "ml" ? "പരിഹരിക്കുക" : "Resolve Items"}</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Risk 4: Long-Ageing Cases (+7 Days) */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.03] p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 uppercase">High Severity</span>
                  <span className="font-display text-base font-bold text-foreground">45</span>
                </div>
                <h3 className="font-bold text-xs text-foreground">Long-Ageing Cases (+7 Days)</h3>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  45 cases stalled due to external official portal response delays.
                </p>
                <Link to="/admin/applications" search={{ stage: undefined, filter: "over7d" }} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 pt-1">
                  <span>Resolve Items</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Risk 5: Scheme Records Needing Review */}
              <div className="rounded-xl border border-border bg-background p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-extrabold text-muted-foreground uppercase">Normal Severity</span>
                  <span className="font-display text-base font-bold text-foreground">6</span>
                </div>
                <h3 className="font-bold text-xs text-foreground">Scheme Records Needing Review</h3>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  6 portal welfare schemes require guidelines &amp; eligibility validation.
                </p>
                <Link to="/admin/schemes" className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 pt-1">
                  <span>Resolve Items</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Sticky Mobile Navigation Footer (Visible on Mobile screens) */}
      <AdminMobileAppBottomNav
        activeTab={mobileTab}
        onTabChange={handleMobileTabChange}
        className="md:hidden"
      />

      {/* Interactive Mobile Device Frame Preview Modal */}
      <AdminMobilePreviewModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />

      
    </div>
  );
}
