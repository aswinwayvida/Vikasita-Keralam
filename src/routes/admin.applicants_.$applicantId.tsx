import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Home,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  HeartHandshake,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Printer,
  ShieldCheck,
  User,
  UserCheck,
  Building2,
  Tag,
  AlertCircle,
  Briefcase,
  BadgeCheck,
  ExternalLink,
  MoreVertical,
  MessageSquare,
  Ban,
  Trash2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/admin/applicants_/$applicantId")({
  head: () => ({ meta: [{ title: "Applicant Profile Details · Admin" }] }),
  component: ApplicantProfileDetailsPage,
});

// Mock database for applicant profiles (matching Create New Applicant schema)
interface ApplicantProfileData {
  id: string;
  fullName: string;
  mobile: string;
  dob: string;
  age: number;
  gender: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  occupation: string;
  annualIncome: string;
  aadhaarNumber: string;
  houseNo: string;
  houseName: string;
  streetLocality: string;
  pinCode: string;
  postOffice: string;
  district: string;
  localBodyType: string;
  localBody: string;
  ward: string;
  assemblyMandalam: string;
  status: "Active" | "Verified" | "In Review" | "Pending";
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  applications: {
    id: string;
    schemeId: string;
    schemeName: string;
    category: string;
    submittedDate: string;
    status: "Approved" | "Pending" | "In Review" | "Rejected";
    benefit: string;
  }[];
}

const mockApplicantProfiles: Record<string, ApplicantProfileData> = {
  "VK-2026-0042": {
    id: "VK-2026-0042",
    fullName: "Ramesh Kumar",
    mobile: "+91 94000 00000",
    dob: "1988-05-14",
    age: 38,
    gender: "Male",
    maritalStatus: "Married",
    religion: "Hinduism",
    caste: "OBC",
    occupation: "Farmer / Agriculture",
    annualIncome: "₹75,000 / Year",
    aadhaarNumber: "882390124512",
    houseNo: "TC 14/820",
    houseName: "Lakshmi Nivas",
    streetLocality: "Kaithamukku",
    pinCode: "695001",
    postOffice: "Fort PO, Thiruvananthapuram",
    district: "Thiruvananthapuram",
    localBodyType: "Corporation",
    localBody: "Thiruvananthapuram Corporation",
    ward: "Ward 12",
    assemblyMandalam: "Thiruvananthapuram Central",
    status: "Verified",
    createdBy: "District Desk - Anitha K.",
    createdAt: "2026-10-15 10:30 AM",
    lastUpdated: "2026-11-04 02:15 PM",
    applications: [
      {
        id: "APP-2026-8821",
        schemeId: "pmkisan",
        schemeName: "PM Kisan Samman Nidhi",
        category: "Agriculture & Farming",
        submittedDate: "2026-10-16",
        status: "Approved",
        benefit: "₹6,000/year direct transfer",
      },
      {
        id: "APP-2026-8822",
        schemeId: "pmjay",
        schemeName: "Ayushman Bharat PM-JAY",
        category: "Health & Medical",
        submittedDate: "2026-10-18",
        status: "Approved",
        benefit: "₹5 Lakh health cover",
      },
      {
        id: "APP-2026-8823",
        schemeId: "pmay",
        schemeName: "PM Awas Yojana (Urban)",
        category: "Housing & Infrastructure",
        submittedDate: "2026-10-25",
        status: "Pending",
        benefit: "Housing credit subsidy",
      },
    ],
  },
  "BEN-8921": {
    id: "BEN-8921",
    fullName: "Soman P",
    mobile: "+91 98470 12345",
    dob: "1972-08-20",
    age: 54,
    gender: "Male",
    maritalStatus: "Married",
    religion: "Hinduism",
    caste: "OBC",
    occupation: "Agricultural Worker",
    annualIncome: "₹60,000 / Year",
    aadhaarNumber: "772189012345",
    houseNo: "KP 4/312",
    houseName: "Padmalayam",
    streetLocality: "Nemom Junction",
    pinCode: "695020",
    postOffice: "Nemom PO",
    district: "Thiruvananthapuram",
    localBodyType: "Panchayat",
    localBody: "Nemom Grama Panchayat",
    ward: "Ward 04",
    assemblyMandalam: "Nemom",
    status: "Active",
    createdBy: "District Desk",
    createdAt: "2026-09-10 11:00 AM",
    lastUpdated: "2026-11-02 04:30 PM",
    applications: [
      {
        id: "APP-2026-7011",
        schemeId: "pmkisan",
        schemeName: "PM Kisan Samman Nidhi",
        category: "Agriculture & Farming",
        submittedDate: "2026-09-12",
        status: "Approved",
        benefit: "₹6,000/year direct transfer",
      },
      {
        id: "APP-2026-7012",
        schemeId: "apy",
        schemeName: "Atal Pension Yojana",
        category: "Pension & Social Security",
        submittedDate: "2026-09-20",
        status: "Approved",
        benefit: "Monthly pension after 60",
      },
      {
        id: "APP-2026-7013",
        schemeId: "pmsby",
        schemeName: "PM Suraksha Bima Yojana",
        category: "Insurance",
        submittedDate: "2026-10-01",
        status: "Approved",
        benefit: "₹2 Lakh accidental cover",
      },
      {
        id: "APP-2026-7014",
        schemeId: "mudra",
        schemeName: "PM MUDRA Yojana",
        category: "Business & MSME",
        submittedDate: "2026-10-15",
        status: "In Review",
        benefit: "Micro-business loan",
      },
      {
        id: "APP-2026-7015",
        schemeId: "pmkvy",
        schemeName: "PM Kaushal Vikas Yojana",
        category: "Employment & Skill",
        submittedDate: "2026-10-28",
        status: "Rejected",
        benefit: "Skill training & stipend",
      },
    ],
  },
};

const defaultApplicantFallback: ApplicantProfileData = {
  id: "VK-2026-0108",
  fullName: "Sandhya Nair",
  mobile: "+91 94880 00900",
  dob: "1992-09-22",
  age: 34,
  gender: "Female",
  maritalStatus: "Married",
  religion: "Hinduism",
  caste: "General",
  occupation: "Homemaker",
  annualIncome: "₹1,20,000 / Year",
  aadhaarNumber: "901238471209",
  houseNo: "KP 8/120",
  houseName: "Sreevalsam",
  streetLocality: "Beach Road",
  pinCode: "691001",
  postOffice: "Kollam Head PO",
  district: "Kollam",
  localBodyType: "Municipality",
  localBody: "Kollam Municipality",
  ward: "Ward 05",
  assemblyMandalam: "Kollam",
  status: "Verified",
  createdBy: "Anitha K.",
  createdAt: "2026-10-20 09:15 AM",
  lastUpdated: "2026-11-05 01:20 PM",
  applications: [
    {
      id: "APP-2026-9101",
      schemeId: "pmmvy",
      schemeName: "PM Matru Vandana Yojana",
      category: "Women & Child Welfare",
      submittedDate: "2026-10-21",
      status: "Approved",
      benefit: "Maternity financial assistance",
    },
    {
      id: "APP-2026-9102",
      schemeId: "pmjay",
      schemeName: "Ayushman Bharat PM-JAY",
      category: "Health & Medical",
      submittedDate: "2026-10-25",
      status: "Approved",
      benefit: "₹5 Lakh health cover",
    },
  ],
};

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

const DASHBOARD_DATE_REFERENCE = new Date(2026, 9, 8); // Oct 8, 2026

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

interface DateFilterState {
  appliedPreset: DashboardDatePreset | null;
  appliedDate: Date;
  appliedRangeStart: Date | null;
  appliedRangeEnd: Date | null;
  filterMode: DashboardDateFilterMode;
}

function ApplicantDateFilterControl({
  lang,
  onFilterChange,
}: {
  lang: "en" | "ml";
  onFilterChange: (filterState: DateFilterState) => void;
}) {
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const locale = lang === "ml" ? "ml-IN" : "en-GB";

  const [isOpen, setIsOpen] = useState(false);
  const [appliedDate, setAppliedDate] = useState(() => new Date(DASHBOARD_DATE_REFERENCE));
  const [appliedPreset, setAppliedPreset] = useState<DashboardDatePreset | null>("allTime");
  const [draftDate, setDraftDate] = useState(() => new Date(DASHBOARD_DATE_REFERENCE));
  const [draftPreset, setDraftPreset] = useState<DashboardDatePreset | null>("allTime");
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
    const nextDate = new Date(appliedDate.getFullYear(), appliedDate.getMonth() + offset, 1);
    setAppliedDate(nextDate);
    setAppliedPreset(null);
    onFilterChange({
      appliedPreset: null,
      appliedDate: nextDate,
      appliedRangeStart: null,
      appliedRangeEnd: null,
      filterMode: "single",
    });
  };

  const applySelection = () => {
    setAppliedDate(draftDate);
    setAppliedPreset(draftPreset);
    setIsOpen(false);
    onFilterChange({
      appliedPreset: draftPreset,
      appliedDate: draftDate,
      appliedRangeStart: draftRangeStart,
      appliedRangeEnd: draftRangeEnd,
      filterMode: draftMode,
    });
  };

  const rangeStart = draftRangeStart;
  const rangeEnd = draftRangeEnd;
  const rangeStartTime = rangeStart?.getTime() ?? null;
  const rangeEndTime = rangeEnd?.getTime() ?? null;

  const appliedDateLabel =
    appliedPreset === "allTime"
      ? tr("All time", "എല്ലാ സമയവും")
      : appliedPreset === "thisMonth"
      ? formatMonth(appliedDate)
      : formatShortDate(appliedDate);

  const draftSummary =
    draftMode === "single"
      ? formatFullDate(draftDate)
      : `${rangeStart ? formatShortDate(rangeStart) : tr("Start date", "ആരംഭ തീയതി")} – ${
          rangeEnd ? formatShortDate(rangeEnd) : tr("End date", "അവസാന തീയതി")
        }`;

  return (
    <div className="flex h-8 items-center rounded-full border border-orange-200/80 bg-orange-50/50 hover:bg-orange-100/60 px-1 py-0.5 shadow-2xs transition-colors shrink-0">
      <button
        type="button"
        onClick={() => stepAppliedMonth(-1)}
        aria-label={tr("Previous month", "മുൻ മാസം")}
        title={tr("Previous month", "മുൻ മാസം")}
        className="flex h-6 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-orange-200/50 hover:text-foreground transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          className="inline-flex h-6 items-center gap-1.5 px-2 text-xs font-extrabold text-foreground transition-colors cursor-pointer"
          title={tr("Select date", "തീയതി തിരഞ്ഞെടുക്കുക")}
        >
          <Calendar className="h-3.5 w-3.5 text-orange-500" />
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
                      onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-foreground transition-colors cursor-pointer"
                      aria-label={tr("Previous month", "മുൻ മാസം")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
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
                              ? "bg-primary text-primary-foreground shadow-sm font-bold"
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
        className="flex h-6 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-orange-200/50 hover:text-foreground transition-colors cursor-pointer"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function isApplicationInDateFilter(
  submittedDateStr: string,
  appliedPreset: DashboardDatePreset | null,
  appliedDate: Date | null | undefined,
  appliedRangeStart: Date | null | undefined,
  appliedRangeEnd: Date | null | undefined,
  filterMode: DashboardDateFilterMode,
): boolean {
  if (appliedPreset === "allTime") return true;
  if (!submittedDateStr) return true;

  const validAppliedDate =
    appliedDate instanceof Date && !isNaN(appliedDate.getTime())
      ? appliedDate
      : new Date(DASHBOARD_DATE_REFERENCE);

  const appDate = new Date(submittedDateStr);
  if (isNaN(appDate.getTime())) return true;

  const appYear = appDate.getFullYear();
  const appMonth = appDate.getMonth();
  const appDay = appDate.getDate();

  if (filterMode === "range" && appliedRangeStart && appliedRangeEnd) {
    const start = new Date(
      appliedRangeStart.getFullYear(),
      appliedRangeStart.getMonth(),
      appliedRangeStart.getDate(),
    ).getTime();
    const end = new Date(
      appliedRangeEnd.getFullYear(),
      appliedRangeEnd.getMonth(),
      appliedRangeEnd.getDate(),
    ).getTime();
    const current = new Date(appYear, appMonth, appDay).getTime();
    return current >= start && current <= end;
  }

  if (appliedPreset === "thisMonth") {
    return appYear === validAppliedDate.getFullYear() && appMonth === validAppliedDate.getMonth();
  }

  if (appliedPreset === "lastMonth") {
    const targetMonth = validAppliedDate.getMonth() === 0 ? 11 : validAppliedDate.getMonth() - 1;
    const targetYear =
      validAppliedDate.getMonth() === 0
        ? validAppliedDate.getFullYear() - 1
        : validAppliedDate.getFullYear();
    return appYear === targetYear && appMonth === targetMonth;
  }

  if (appliedPreset === "thisYear") {
    return appYear === validAppliedDate.getFullYear();
  }

  if (appliedPreset === "lastYear") {
    return appYear === validAppliedDate.getFullYear() - 1;
  }

  if (appliedPreset === "today" || appliedPreset === "yesterday") {
    const ref =
      appliedPreset === "yesterday"
        ? new Date(
            validAppliedDate.getFullYear(),
            validAppliedDate.getMonth(),
            validAppliedDate.getDate() - 1,
          )
        : validAppliedDate;
    return (
      appYear === ref.getFullYear() &&
      appMonth === ref.getMonth() &&
      appDay === ref.getDate()
    );
  }

  return (
    appYear === validAppliedDate.getFullYear() &&
    appMonth === validAppliedDate.getMonth() &&
    appDay === validAppliedDate.getDate()
  );
}

function ApplicantProfileDetailsPage() {
  const { applicantId } = Route.useParams();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [showAadhaar, setShowAadhaar] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "schemes">("personal");
  const [schemeStatusFilter, setSchemeStatusFilter] = useState<string>("all");
  const [dateFilterState, setDateFilterState] = useState<DateFilterState>({
    appliedPreset: "allTime",
    appliedDate: new Date(DASHBOARD_DATE_REFERENCE),
    appliedRangeStart: null,
    appliedRangeEnd: null,
    filterMode: "single",
  });

  const profile = mockApplicantProfiles[applicantId] ?? {
    ...defaultApplicantFallback,
    id: applicantId || defaultApplicantFallback.id,
  };

  const approvedCount = profile.applications.filter((a) => a.status === "Approved").length;
  const inReviewCount = profile.applications.filter((a) => a.status === "In Review").length;
  const pendingCount = profile.applications.filter((a) => a.status === "Pending").length;
  const rejectedCount = profile.applications.filter((a) => a.status === "Rejected").length;

  const filteredApplications = profile.applications.filter((app) => {
    if (schemeStatusFilter !== "all" && app.status !== schemeStatusFilter) {
      return false;
    }
    return isApplicationInDateFilter(
      app.submittedDate,
      dateFilterState?.appliedPreset ?? "allTime",
      dateFilterState?.appliedDate,
      dateFilterState?.appliedRangeStart,
      dateFilterState?.appliedRangeEnd,
      dateFilterState?.filterMode ?? "single",
    );
  });

  const maskedAadhaar = profile.aadhaarNumber
    ? `•••• •••• ${profile.aadhaarNumber.slice(-4)}`
    : "N/A";

  const formattedAadhaar = profile.aadhaarNumber
    ? profile.aadhaarNumber.replace(/(\d{4})/g, "$1 ").trim()
    : "N/A";

  return (
    <div className="pb-10 text-foreground w-full">
      {/* Top Header Navigation */}
      <section className="sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5 mb-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/beneficiaries"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary"
              title={lang === "ml" ? "അപേക്ഷകരുടെ പട്ടികയിലേക്ക് തിരികെ പോകുക" : "Back to Applicants"}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">
                {lang === "ml" ? "അപേക്ഷകന്റെ വിവരങ്ങൾ" : "Applicant Profile Details"}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-3.5">
        {/* Profile Banner & Metric Header Card */}
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 border border-orange-200/60 font-display text-xl font-extrabold uppercase shadow-2xs">
                {profile.fullName.slice(0, 2)}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-extrabold text-foreground tracking-tight">
                    {profile.fullName}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${
                      profile.status === "Verified" || profile.status === "Active"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : "border-amber-500/20 bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    <BadgeCheck className="h-3 w-3" />
                    {profile.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    {profile.mobile}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {profile.district}, {profile.assemblyMandalam}
                  </span>
                </div>
              </div>
            </div>

            {/* Counts Summary Bar & Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60">
                {/* Applications Count Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSchemeStatusFilter("all");
                    setActiveTab("schemes");
                  }}
                  className={`text-center px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    schemeStatusFilter === "all" && activeTab === "schemes"
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : "hover:bg-muted/80"
                  }`}
                  title={lang === "ml" ? "എല്ലാ അപേക്ഷകളും കാണുക" : "Show All Applications"}
                >
                  <p className="font-display text-base font-extrabold text-foreground leading-none">
                    {profile.applications.length}
                  </p>
                  <p className="text-[9.5px] font-semibold text-muted-foreground mt-0.5">
                    {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                  </p>
                </button>
                <div className="h-5 w-px bg-border/60" />

                {/* Approved Count Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSchemeStatusFilter("Approved");
                    setActiveTab("schemes");
                  }}
                  className={`text-center px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    schemeStatusFilter === "Approved" && activeTab === "schemes"
                      ? "bg-emerald-500/15 ring-1 ring-emerald-500/30"
                      : "hover:bg-muted/80"
                  }`}
                  title={lang === "ml" ? "അംഗീകരിച്ചവ കാണുക" : "Show Approved"}
                >
                  <p className="font-display text-base font-extrabold text-emerald-600 leading-none">
                    {approvedCount}
                  </p>
                  <p className="text-[9.5px] font-semibold text-muted-foreground mt-0.5">
                    {lang === "ml" ? "അംഗീകരിച്ചു" : "Approved"}
                  </p>
                </button>
                <div className="h-5 w-px bg-border/60" />

                {/* In Review Count Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSchemeStatusFilter("In Review");
                    setActiveTab("schemes");
                  }}
                  className={`text-center px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    schemeStatusFilter === "In Review" && activeTab === "schemes"
                      ? "bg-blue-500/15 ring-1 ring-blue-500/30"
                      : "hover:bg-muted/80"
                  }`}
                  title={lang === "ml" ? "അവലോകനത്തിലുള്ളവ കാണുക" : "Show In Review"}
                >
                  <p className="font-display text-base font-extrabold text-blue-600 leading-none">
                    {inReviewCount}
                  </p>
                  <p className="text-[9.5px] font-semibold text-muted-foreground mt-0.5">
                    {lang === "ml" ? "അവലോകനത്തിൽ" : "In Review"}
                  </p>
                </button>
                <div className="h-5 w-px bg-border/60" />

                {/* Pending Count Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSchemeStatusFilter("Pending");
                    setActiveTab("schemes");
                  }}
                  className={`text-center px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    schemeStatusFilter === "Pending" && activeTab === "schemes"
                      ? "bg-amber-500/15 ring-1 ring-amber-500/30"
                      : "hover:bg-muted/80"
                  }`}
                  title={lang === "ml" ? "പെൻഡിംഗ് അപേക്ഷകൾ കാണുക" : "Show Pending"}
                >
                  <p className="font-display text-base font-extrabold text-amber-600 leading-none">
                    {pendingCount}
                  </p>
                  <p className="text-[9.5px] font-semibold text-muted-foreground mt-0.5">
                    {lang === "ml" ? "പെൻഡിംഗ്" : "Pending"}
                  </p>
                </button>
                <div className="h-5 w-px bg-border/60" />

                {/* Rejected Count Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSchemeStatusFilter("Rejected");
                    setActiveTab("schemes");
                  }}
                  className={`text-center px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    schemeStatusFilter === "Rejected" && activeTab === "schemes"
                      ? "bg-rose-500/15 ring-1 ring-rose-500/30"
                      : "hover:bg-muted/80"
                  }`}
                  title={lang === "ml" ? "നിരസിച്ചവ കാണുക" : "Show Rejected"}
                >
                  <p className="font-display text-base font-extrabold text-rose-600 leading-none">
                    {rejectedCount}
                  </p>
                  <p className="text-[9.5px] font-semibold text-muted-foreground mt-0.5">
                    {lang === "ml" ? "നിരസിച്ചു" : "Rejected"}
                  </p>
                </button>
              </div>

              {/* 3-Dot Actions Menu (Includes Edit Profile) */}
              <div className="flex items-center gap-1.5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shadow-2xs"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => toast.info(lang === "ml" ? "പ്രൊഫൈൽ എഡിറ്റ് മോഡ്" : "Opening Edit Profile...")}
                      className="cursor-pointer font-semibold text-xs gap-2"
                    >
                      <Pencil className="h-3.5 w-3.5 text-primary" />
                      {lang === "ml" ? "പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക" : "Edit Profile"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.success(lang === "ml" ? "സന്ദേശം അയച്ചു" : "Message sent to applicant")}
                      className="cursor-pointer font-semibold text-xs gap-2"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      {lang === "ml" ? "സന്ദേശം അയക്കുക" : "Message"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.warning(lang === "ml" ? "പ്രൊഫൈൽ നിർജ്ജീവമാക്കി" : "Profile disabled")}
                      className="cursor-pointer font-semibold text-xs gap-2 text-amber-600 focus:text-amber-600"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      {lang === "ml" ? "നിർജ്ജീവമാക്കുക" : "Disable"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.error(lang === "ml" ? "പ്രൊഫൈൽ നീക്കംചെയ്തു" : "Profile deleted")}
                      className="cursor-pointer font-semibold text-xs gap-2 text-rose-600 focus:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {lang === "ml" ? "നീക്കം ചെയ്യുക" : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Bar for Personal Details and Applied Schemes List */}
        <div className="flex items-center gap-1 border-b border-border/80 px-1 pt-1 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border-b-2 -mb-px ${
              activeTab === "personal"
                ? "border-primary text-primary font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <User className="h-4 w-4" />
            <span>{lang === "ml" ? "വ്യക്തിഗത വിവരങ്ങൾ" : "Personal Details"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schemes")}
            className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border-b-2 -mb-px ${
              activeTab === "schemes"
                ? "border-primary text-primary font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{lang === "ml" ? "അപേക്ഷിച്ച പദ്ധതികൾ" : "Applied Schemes"}</span>
            <span
              className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold transition-colors ${
                activeTab === "schemes"
                  ? "bg-orange-100 text-orange-600 border border-orange-200"
                  : "bg-muted text-muted-foreground border border-border/60"
              }`}
            >
              {profile.applications.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Personal Details Content */}
        {activeTab === "personal" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {/* Section 1: Personal Information */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
              <div className="flex items-center gap-2 border-b border-border/60 p-3 bg-muted/20">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">
                    {lang === "ml" ? "വ്യക്തിഗത വിവരങ്ങൾ" : "Personal Information"}
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-border/50">
                <InfoRow icon={User} label={lang === "ml" ? "പൂർണ്ണമായ പേര്" : "Full Name"} value={profile.fullName} />
                <InfoRow icon={Phone} label={lang === "ml" ? "മൊബൈൽ നമ്പർ" : "Mobile Number"} value={profile.mobile} />
                <InfoRow
                  icon={Calendar}
                  label={lang === "ml" ? "ജനന തീയതി & പ്രായം" : "Date of Birth & Age"}
                  value={`${profile.dob} (${profile.age} Yrs)`}
                />
                <InfoRow icon={UserCheck} label={lang === "ml" ? "ലിംഗഭേദം" : "Gender"} value={profile.gender} />
                <InfoRow icon={HeartHandshake} label={lang === "ml" ? "വൈവാഹിക നില" : "Marital Status"} value={profile.maritalStatus} />
                <InfoRow icon={Building2} label={lang === "ml" ? "മതം" : "Religion"} value={profile.religion} />
                <InfoRow icon={Users} label={lang === "ml" ? "ജാതി / സോഷ്യൽ കാറ്റഗറി" : "Caste / Social Category"} value={profile.caste} />
                <InfoRow icon={Briefcase} label={lang === "ml" ? "തൊഴിൽ" : "Occupation"} value={profile.occupation} />
                <InfoRow icon={Tag} label={lang === "ml" ? "വാർഷിക വരുമാനം" : "Annual Family Income"} value={profile.annualIncome} />
                
                {/* Aadhaar Field Row */}
                <div className="flex items-center justify-between py-2.5 px-3 border-b border-border/50">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <ShieldCheck className="h-4 w-4 text-orange-500 shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      {lang === "ml" ? "ആധാർ നമ്പർ" : "Aadhaar Number"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {showAadhaar ? formattedAadhaar : maskedAadhaar}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAadhaar(!showAadhaar)}
                      className="text-muted-foreground hover:text-primary text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {showAadhaar ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Address & Location Details */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
              <div className="flex items-center gap-2 border-b border-border/60 p-3 bg-muted/20">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">
                    {lang === "ml" ? "മേൽവിലാസവും സ്ഥലവിവരങ്ങളും" : "Address & Location Details"}
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-border/50">
                <InfoRow icon={Home} label={lang === "ml" ? "വീട്ടു നമ്പർ / നമ്പർ" : "House No / Door No"} value={profile.houseNo} />
                <InfoRow icon={Building2} label={lang === "ml" ? "വീടിന്റെ പേര്" : "House Name"} value={profile.houseName} />
                <InfoRow icon={MapPin} label={lang === "ml" ? "തെരുവ് / സ്ഥലം" : "Street / Locality"} value={profile.streetLocality} />
                <InfoRow icon={Tag} label={lang === "ml" ? "പിൻകോഡ്" : "PIN Code"} value={profile.pinCode} />
                <InfoRow icon={FileText} label={lang === "ml" ? "പോസ്റ്റ് ഓഫീസ്" : "Post Office"} value={profile.postOffice} />
                <InfoRow icon={Home} label={lang === "ml" ? "വാർഡ് നമ്പർ" : "Ward Number"} value={profile.ward} />
                <InfoRow icon={Building2} label={lang === "ml" ? "തദ്ദേശ സ്ഥാപന തരം" : "Local Body Type"} value={profile.localBodyType} />
                <InfoRow icon={Building2} label={lang === "ml" ? "തദ്ദേശ സ്ഥാപനം" : "Local Body Name"} value={profile.localBody} />
                <InfoRow icon={MapPin} label={lang === "ml" ? "നിയമസഭാ മണ്ഡലം" : "Assembly Mandalam"} value={profile.assemblyMandalam} />
                <InfoRow icon={MapPin} label={lang === "ml" ? "ജില്ല" : "District"} value={profile.district} isLast={true} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Applied Schemes Content */}
        {activeTab === "schemes" && (
          <div className="rounded-xl border border-border bg-card p-3.5 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">
                    {lang === "ml" ? "അപേക്ഷിച്ച പദ്ധതികൾ" : "Applied Schemes"}
                  </h2>
                </div>
              </div>

              {/* Right Side: Status Selection Dropdown & Date Filter */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Date Filter Control matching Dashboard design (Attachment 2 & 3) */}
                <ApplicantDateFilterControl lang={lang} onFilterChange={setDateFilterState} />

                {/* Status Selection Dropdown */}
                <select
                  value={schemeStatusFilter}
                  onChange={(e) => setSchemeStatusFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="all">{lang === "ml" ? "എല്ലാ സ്റ്റാറ്റസും (All Status)" : "All Statuses"}</option>
                  <option value="Approved">{lang === "ml" ? "അംഗീകരിച്ചു (Approved)" : "Approved"}</option>
                  <option value="In Review">{lang === "ml" ? "അവലോകനത്തിൽ (In Review)" : "In Review"}</option>
                  <option value="Pending">{lang === "ml" ? "പെൻഡിംഗ് (Pending)" : "Pending"}</option>
                  <option value="Rejected">{lang === "ml" ? "നിരസിച്ചു (Rejected)" : "Rejected"}</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-900/70 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5">{lang === "ml" ? "പദ്ധതിയുടെ പേര്" : "Scheme Name"}</th>
                    <th className="px-3 py-2.5">{lang === "ml" ? "വിഭാഗം" : "Scheme Category"}</th>
                    <th className="px-3 py-2.5">{lang === "ml" ? "തീയതി" : "Date"}</th>
                    <th className="px-3 py-2.5">{lang === "ml" ? "സ്റ്റാറ്റസ്" : "Status"}</th>
                    <th className="px-3 py-2.5 text-right">{lang === "ml" ? "നടപടികൾ" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-bold text-foreground">{app.schemeName}</td>
                      <td className="px-3 py-2.5 font-medium text-muted-foreground">{app.category}</td>
                      <td className="px-3 py-2.5 text-muted-foreground font-medium">{app.submittedDate}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                            app.status === "Approved"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                              : app.status === "Rejected"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-600"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                              title={lang === "ml" ? "നടപടികൾ" : "Actions"}
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={() => toast.info(lang === "ml" ? "അപേക്ഷ എഡിറ്റ് ചെയ്യുക" : "Edit Application")}
                              className="cursor-pointer font-semibold text-xs gap-2"
                            >
                              <Pencil className="h-3.5 w-3.5 text-primary" />
                              {lang === "ml" ? "എഡിറ്റ് ചെയ്യുക" : "Edit"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toast.info(lang === "ml" ? "ആക്റ്റിവിറ്റി ലോഗ്" : "Activity Log")}
                              className="cursor-pointer font-semibold text-xs gap-2"
                            >
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                              {lang === "ml" ? "ആക്റ്റിവിറ്റി ലോഗ്" : "Activity log"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toast.error(lang === "ml" ? "അപേക്ഷ നീക്കംചെയ്തു" : "Application deleted")}
                              className="cursor-pointer font-semibold text-xs gap-2 text-rose-600 focus:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {lang === "ml" ? "നീക്കം ചെയ്യുക" : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filteredApplications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground font-medium">
                        {lang === "ml"
                          ? "ഫിൽട്ടർ ചെയ്ത മാനദണ്ഡങ്ങൾക്ക് അനുയോജ്യമായ അപേക്ഷകൾ ലഭ്യമല്ല."
                          : "No applications match the selected filter criteria."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
      <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-foreground">{value || "N/A"}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  isLast = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 px-3 ${
        isLast ? "" : "border-b border-border/50"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <Icon className="h-4 w-4 text-orange-500 shrink-0" />
        <span className="text-xs font-medium text-muted-foreground truncate">{label}</span>
      </div>
      <span className="text-xs font-bold text-foreground text-right shrink-0">{value || "N/A"}</span>
    </div>
  );
}
