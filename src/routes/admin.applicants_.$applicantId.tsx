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
  Columns3,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
    status: "Approved" | "Pending" | "In Review" | "Rejected" | "Submitted" | "Document Verified" | "Received";
    benefit: string;
    createdBy?: string;
  }[];
}

const APPLIED_SCHEME_COLUMNS = [
  { key: "schemeName", en: "SCHEME NAME", ml: "പദ്ധതിയുടെ പേര്" },
  { key: "category", en: "SCHEME CATEGORY", ml: "വിഭാഗം" },
  { key: "date", en: "DATE", ml: "തീയതി" },
  { key: "createdBy", en: "ASSISTED BY / CREATED BY", ml: "സഹായിച്ചത് / നിർമ്മിച്ചത്" },
  { key: "status", en: "STATUS", ml: "സ്റ്റാറ്റസ്" },
  { key: "actions", en: "ACTIONS", ml: "നടപടികൾ" },
];

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
        id: "APP-0006",
        schemeId: "pmkisan",
        schemeName: "PM Kisan Samman Nidhi",
        category: "Agriculture & Farming",
        submittedDate: "2026-10-16",
        createdBy: "Anitha K.",
        status: "Approved",
        benefit: "₹6,000/year direct transfer",
      },
      {
        id: "APP-0007",
        schemeId: "pmjay",
        schemeName: "Ayushman Bharat PM-JAY",
        category: "Health & Medical",
        submittedDate: "2026-10-18",
        createdBy: "Rahul M.",
        status: "Approved",
        benefit: "₹5 Lakh health cover",
      },
      {
        id: "APP-0008",
        schemeId: "pmay",
        schemeName: "PM Awas Yojana (Urban)",
        category: "Housing & Infrastructure",
        submittedDate: "2026-10-25",
        createdBy: "District desk",
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
        id: "APP-0001",
        schemeId: "pmkisan",
        schemeName: "PM Kisan Samman Nidhi",
        category: "Agriculture & Farming",
        submittedDate: "2026-09-12",
        createdBy: "District desk",
        status: "Approved",
        benefit: "₹6,000/year direct transfer",
      },
      {
        id: "APP-0002",
        schemeId: "apy",
        schemeName: "Atal Pension Yojana",
        category: "Pension & Social Security",
        submittedDate: "2026-09-20",
        createdBy: "Anitha K.",
        status: "Approved",
        benefit: "Monthly pension ₹1,000–₹5,000",
      },
      {
        id: "APP-0003",
        schemeId: "pmsby",
        schemeName: "PM Suraksha Bima Yojana",
        category: "Insurance",
        submittedDate: "2026-10-01",
        createdBy: "Rahul M.",
        status: "Approved",
        benefit: "₹2 Lakh accident insurance cover",
      },
      {
        id: "APP-0004",
        schemeId: "mudra",
        schemeName: "PM MUDRA Yojana",
        category: "Business & MSME",
        submittedDate: "2026-10-15",
        createdBy: "Nithya S.",
        status: "In Review",
        benefit: "Micro business collateral-free loan",
      },
      {
        id: "APP-0005",
        schemeId: "pmkvy",
        schemeName: "PM Kaushal Vikas Yojana",
        category: "Employment & Skill",
        submittedDate: "2026-10-28",
        createdBy: "District desk",
        status: "Rejected",
        benefit: "Free skill training & certification",
      },
    ],
  },
  fallback: {
    id: "VK-2026-0108",
    fullName: "Lakshmi Amma",
    mobile: "+91 94471 23456",
    dob: "1960-03-12",
    age: 66,
    gender: "Female",
    maritalStatus: "Widowed",
    religion: "Hinduism",
    caste: "General",
    occupation: "Homemaker",
    annualIncome: "₹45,000 / Year",
    aadhaarNumber: "991234567890",
    houseNo: "TC 22/104",
    houseName: "Ammathan",
    streetLocality: "Vattiyoorkavu",
    pinCode: "695013",
    postOffice: "Vattiyoorkavu PO",
    district: "Thiruvananthapuram",
    localBodyType: "Corporation",
    localBody: "Thiruvananthapuram Corporation",
    ward: "Ward 18",
    assemblyMandalam: "Vattiyoorkavu",
    status: "Verified",
    createdBy: "District Desk - Rahul M.",
    createdAt: "2026-10-20 09:15 AM",
    lastUpdated: "2026-11-05 11:00 AM",
    applications: [
      {
        id: "APP-0009",
        schemeId: "pmsmy",
        schemeName: "Pradhan Mantri Matru Vandana Yojana",
        category: "Women & Child Welfare",
        submittedDate: "2026-10-21",
        createdBy: "Rahul M.",
        status: "Approved",
        benefit: "Maternity financial assistance",
      },
      {
        id: "APP-0010",
        schemeId: "pmjay",
        schemeName: "Ayushman Bharat PM-JAY",
        category: "Health & Medical",
        submittedDate: "2026-10-25",
        createdBy: "District desk",
        status: "Approved",
        benefit: "₹5 Lakh health cover",
      },
    ],
  },
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

interface ApplicantDateFilterState {
  appliedPreset: DashboardDatePreset;
  appliedDate: Date;
  appliedRangeStart: Date | null;
  appliedRangeEnd: Date | null;
  filterMode: DashboardDateFilterMode;
}

function formatFullDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatMonth(date: Date): string {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function ApplicantDateFilterControl({
  lang,
  onFilterChange,
}: {
  lang: string;
  onFilterChange: (state: ApplicantDateFilterState) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedPreset, setAppliedPreset] = useState<DashboardDatePreset>("allTime");
  const [appliedDate, setAppliedDate] = useState<Date>(DASHBOARD_DATE_REFERENCE);

  const [draftPreset, setDraftPreset] = useState<DashboardDatePreset>("thisMonth");
  const [draftDate, setDraftDate] = useState<Date>(DASHBOARD_DATE_REFERENCE);
  const [draftMode, setDraftMode] = useState<DashboardDateFilterMode>("single");
  const [draftRangeStart, setDraftRangeStart] = useState<Date | null>(null);
  const [draftRangeEnd, setDraftRangeEnd] = useState<Date | null>(null);

  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftPreset(appliedPreset);
      setDraftDate(appliedDate);
    }
    setIsOpen(open);
  };

  const stepAppliedMonth = (delta: number) => {
    const nextDate = new Date(appliedDate);
    nextDate.setMonth(nextDate.getMonth() + delta);
    setAppliedDate(nextDate);
    setAppliedPreset("thisMonth");
    onFilterChange({
      appliedPreset: "thisMonth",
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

  const appliedDateLabel =
    appliedPreset === "allTime"
      ? tr("All time", "എല്ലാ സമയവും")
      : appliedPreset === "thisMonth"
      ? formatMonth(appliedDate)
      : formatShortDate(appliedDate);

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
          className="flex h-full w-full flex-col gap-0 border-l border-border bg-white p-0 sm:max-w-[500px] z-50"
        >
          <SheetHeader className="space-y-1 border-b border-slate-100 px-5 py-4 pr-12 text-left">
            <SheetTitle className="flex items-center gap-2 text-base font-bold text-[#101828]">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{tr("Date filter", "തീയതി ഫിൽട്ടർ")}</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              {tr("Choose a preset, single date, or date range.", "ഒരു പ്രീസെറ്റ്, ഒരു തീയതി അല്ലെങ്കിൽ തീയതി പരിധി തിരഞ്ഞെടുക്കുക.")}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-4 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {DASHBOARD_DATE_PRESETS_ROW1.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setDraftPreset(p.key);
                      if (p.key === "today" || p.key === "thisMonth" || p.key === "thisYear") {
                        setDraftDate(DASHBOARD_DATE_REFERENCE);
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap",
                      draftPreset === p.key
                        ? "bg-primary text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {tr(p.en, p.ml)}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {DASHBOARD_DATE_PRESETS_ROW2.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setDraftPreset(p.key);
                      if (p.key === "today" || p.key === "thisMonth" || p.key === "thisYear") {
                        setDraftDate(DASHBOARD_DATE_REFERENCE);
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap",
                      draftPreset === p.key
                        ? "bg-primary text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {tr(p.en, p.ml)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 bg-slate-50/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-9 px-4 font-extrabold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {tr("Cancel", "റദ്ദാക്കുക")}
            </Button>
            <Button
              type="button"
              onClick={applySelection}
              className="h-9 px-5 font-extrabold text-xs bg-primary text-white hover:bg-primary/90 cursor-pointer shadow-xs"
            >
              {tr("Done", "പൂർത്തിയായി")}
            </Button>
          </div>
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

function ApplicantProfileDetailsPage() {
  const { applicantId } = Route.useParams();
  const navigate = useNavigate();
  const { lang } = useLang();

  // Selected Profile
  const profile =
    mockApplicantProfiles[applicantId] ||
    mockApplicantProfiles["BEN-8921"] ||
    mockApplicantProfiles["VK-2026-0042"];

  // Local State
  const [activeTab, setActiveTab] = useState<"personal" | "schemes">("personal");
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [schemeStatusFilter, setSchemeStatusFilter] = useState<string>("all");

  // Manage Columns State
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(["schemeName", "category", "date", "createdBy", "status", "actions"])
  );
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "schemeName",
    "category",
    "date",
    "createdBy",
    "status",
    "actions",
  ]);
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);
  const [draggedCol, setDraggedCol] = useState<string | null>(null);

  // Date Filter State
  const [dateFilterState, setDateFilterState] = useState<ApplicantDateFilterState>({
    appliedPreset: "allTime",
    appliedDate: DASHBOARD_DATE_REFERENCE,
    appliedRangeStart: null,
    appliedRangeEnd: null,
    filterMode: "single",
  });

  const toggleColumnVisibility = (key: string) => {
    if (key === "schemeName" || key === "actions") return; // Always visible
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 2) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleDragStart = (key: string) => {
    setDraggedCol(key);
  };

  const handleDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetKey) return;
    setColumnOrder((prev) => {
      const idx1 = prev.indexOf(draggedCol);
      const idx2 = prev.indexOf(targetKey);
      if (idx1 === -1 || idx2 === -1) return prev;
      const next = [...prev];
      next.splice(idx1, 1);
      next.splice(idx2, 0, draggedCol);
      return next;
    });
  };

  // Masked Aadhaar calculation
  const rawAadhaar = profile.aadhaarNumber.replace(/\D/g, "");
  const maskedAadhaar = rawAadhaar.length >= 4 ? `•••• ${rawAadhaar.slice(-4)}` : "•••• •••• ••••";
  const formattedAadhaar = rawAadhaar.replace(/(\d{4})(?=\d)/g, "$1 ");

  // Application Status Counts
  const approvedCount = profile.applications.filter((a) => a.status === "Approved").length;
  const inReviewCount = profile.applications.filter((a) => a.status === "In Review").length;
  const pendingCount = profile.applications.filter(
    (a) => a.status === "Pending" || a.status === "Document Verified" || a.status === "Received"
  ).length;
  const rejectedCount = profile.applications.filter((a) => a.status === "Rejected").length;

  // Filtered Applications List
  const filteredApplications = useMemo(() => {
    if (!profile) return [];
    let list = profile.applications;

    // Filter by Status
    if (schemeStatusFilter !== "all") {
      if (schemeStatusFilter === "Pending") {
        list = list.filter(
          (app) =>
            app.status === "Pending" ||
            app.status === "Document Verified" ||
            app.status === "Received"
        );
      } else {
        list = list.filter((app) => app.status === schemeStatusFilter);
      }
    }

    // Filter by Date
    if (dateFilterState.appliedPreset !== "allTime") {
      const targetDate = dateFilterState.appliedDate;
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();

      list = list.filter((app) => {
        const appDate = new Date(app.submittedDate);
        if (dateFilterState.appliedPreset === "thisMonth") {
          return appDate.getFullYear() === targetYear && appDate.getMonth() === targetMonth;
        }
        return app.submittedDate === formatFullDate(targetDate);
      });
    }

    return list;
  }, [profile, schemeStatusFilter, dateFilterState]);

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Navigation (Desktop only) */}
      <section className="hidden sm:block sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5 mb-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/beneficiaries"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary cursor-pointer"
              title={lang === "ml" ? "ഗുണഭോക്താക്കളുടെ പട്ടികയിലേക്ക് തിരികെ പോകുക" : "Back to Applicant Profiles"}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                {lang === "ml" ? "ഗുണഭോക്തൃ പ്രൊഫൈൽ വിവരങ്ങൾ" : "Applicant Profile Details"}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 sm:hidden border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/beneficiaries"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-base font-bold tracking-tight text-foreground">
              {lang === "ml" ? "ഗുണഭോക്തൃ പ്രൊഫൈൽ വിവരങ്ങൾ" : "Applicant Profile Details"}
            </h1>
          </div>
        </div>
      </div>

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

              {/* 3-Dot Actions Menu (Edit Profile redirects to Create New Application Mobile Verification page) */}
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
                      onClick={() => {
                        const cleanMobile = profile.mobile.replace(/\D/g, "").replace(/^91/, "");
                        navigate({
                          to: "/admin/applications/new",
                          search: {
                            applicantId: profile.id,
                            mobile: JSON.stringify(cleanMobile || "9847012345"),
                            skipOtp: "true",
                            edit: "true",
                          },
                        });
                      }}
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

        {/* Tab Navigation Switches */}
        <div className="flex border-b border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "personal"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>{lang === "ml" ? "വ്യക്തിഗത വിവരങ്ങൾ" : "Personal Details"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("schemes")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "schemes"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{lang === "ml" ? "അപേക്ഷിച്ച പദ്ധതികൾ" : "Applied Schemes"}</span>
            <span className="rounded-full bg-orange-100 px-1.5 py-0.2 text-[10px] font-extrabold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
              {profile.applications.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Personal Details Content */}
        {activeTab === "personal" && (
          <div className="grid gap-4 md:grid-cols-2">
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

              {/* Right Side Controls: Date Filter, Manage Columns Icon, Status Dropdown & Apply New Scheme Button */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. Date Filter Control */}
                <ApplicantDateFilterControl lang={lang} onFilterChange={setDateFilterState} />

                {/* 2. Manage Columns Action (Icon Button) */}
                <button
                  type="button"
                  onClick={() => setIsManageColumnsOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title={lang === "ml" ? "കോളങ്ങൾ നിയന്ത്രിക്കുക" : "Manage Columns"}
                >
                  <Columns3 className="h-4 w-4" />
                </button>

                {/* 3. All Statuses Dropdown */}
                <select
                  value={schemeStatusFilter}
                  onChange={(e) => setSchemeStatusFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="all">{lang === "ml" ? "എല്ലാ സ്റ്റാറ്റസും (All Status)" : "All Statuses"}</option>
                  <option value="Approved">{lang === "ml" ? "അംഗീകരിച്ചു (Approved)" : "Approved"}</option>
                  <option value="Rejected">{lang === "ml" ? "നിരസിച്ചു (Rejected)" : "Rejected"}</option>
                  <option value="In Review">{lang === "ml" ? "അവലോകനത്തിൽ (In Review)" : "In Review"}</option>
                  <option value="Submitted">{lang === "ml" ? "സമർപ്പിച്ചു (Submitted)" : "Submitted"}</option>
                  <option value="Document Verified">{lang === "ml" ? "രേഖകൾ ശരിയാണെന്ന് സ്ഥിരീകരിച്ചു (Document Verified)" : "Document Verified"}</option>
                  <option value="Received">{lang === "ml" ? "സ്വീകരിച്ചു (Received)" : "Received"}</option>
                  <option value="Pending">{lang === "ml" ? "പെൻഡിംഗ് (Pending)" : "Pending"}</option>
                </select>

                {/* 4. Apply New Scheme Button (Direct Link to Create New Application - Eligible Schemes Step) */}
                <Button
                  onClick={() => {
                    const cleanMobile = profile.mobile.replace(/\D/g, "").replace(/^91/, "");
                    navigate({
                      to: "/admin/applications/new",
                      search: {
                        applicantId: profile.id,
                        mobile: JSON.stringify(cleanMobile || "9847012345"),
                        skipOtp: "true",
                        edit: "true",
                        step: "3",
                      },
                    });
                  }}
                  className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs cursor-pointer shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{lang === "ml" ? "പുതിയ പദ്ധതിക്ക് അപേക്ഷിക്കുക" : "Apply New Scheme"}</span>
                </Button>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-900/70 border-b border-border text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {columnOrder.map((colKey) => {
                      if (!visibleColumns.has(colKey)) return null;
                      const meta = APPLIED_SCHEME_COLUMNS.find((c) => c.key === colKey);
                      if (!meta) return null;
                      return (
                        <th
                          key={colKey}
                          className={cn("px-3.5 py-3", colKey === "actions" && "text-right")}
                        >
                          {lang === "ml" ? meta.ml : meta.en}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => {
                        navigate({
                          to: "/admin/applications/$applicationId",
                          params: { applicationId: app.id },
                        });
                      }}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      {columnOrder.map((colKey) => {
                        if (!visibleColumns.has(colKey)) return null;
                        switch (colKey) {
                          case "schemeName":
                            return (
                              <td key={colKey} className="px-3.5 py-3 font-bold text-foreground">
                                {app.schemeName}
                              </td>
                            );
                          case "category":
                            return (
                              <td key={colKey} className="px-3.5 py-3 font-medium text-muted-foreground">
                                {app.category}
                              </td>
                            );
                          case "date":
                            return (
                              <td key={colKey} className="px-3.5 py-3 text-muted-foreground font-medium">
                                {app.submittedDate}
                              </td>
                            );
                          case "createdBy":
                            return (
                              <td key={colKey} className="px-3.5 py-3 font-semibold text-slate-700 dark:text-slate-300">
                                {app.createdBy || "District desk"}
                              </td>
                            );
                          case "status":
                            return (
                              <td key={colKey} className="px-3.5 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                                    app.status === "Approved"
                                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                                      : app.status === "Rejected"
                                      ? "border-rose-500/20 bg-rose-500/10 text-rose-600"
                                      : app.status === "Submitted"
                                      ? "border-sky-500/20 bg-sky-500/10 text-sky-600"
                                      : app.status === "Document Verified"
                                      ? "border-purple-500/20 bg-purple-500/10 text-purple-600"
                                      : app.status === "Received"
                                      ? "border-blue-500/20 bg-blue-500/10 text-blue-600"
                                      : "border-amber-500/20 bg-amber-500/10 text-amber-600"
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </td>
                            );
                          case "actions":
                            return (
                              <td key={colKey} className="px-3.5 py-3 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                                      title={lang === "ml" ? "നടപടികൾ" : "Actions"}
                                    >
                                      <MoreVertical className="h-3.5 w-3.5" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-36 z-50">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate({
                                          to: "/admin/applications/$applicationId",
                                          params: { applicationId: app.id },
                                        });
                                      }}
                                      className="cursor-pointer font-semibold text-xs gap-2"
                                    >
                                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                                      {lang === "ml" ? "കാണുക" : "View"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate({
                                          to: "/admin/applications/$applicationId/verify",
                                          params: { applicationId: app.id },
                                        });
                                      }}
                                      className="cursor-pointer font-semibold text-xs gap-2"
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-primary" />
                                      {lang === "ml" ? "എഡിറ്റ് ചെയ്യുക" : "Edit"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toast.error(lang === "ml" ? "അപേക്ഷ നീക്കംചെയ്തു" : "Application deleted");
                                      }}
                                      className="cursor-pointer font-semibold text-xs gap-2 text-rose-600 focus:text-rose-600"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      {lang === "ml" ? "നീക്കം ചെയ്യുക" : "Delete"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            );
                          default:
                            return null;
                        }
                      })}
                    </tr>
                  ))}
                  {filteredApplications.length === 0 && (
                    <tr>
                      <td colSpan={columnOrder.length} className="px-3.5 py-8 text-center text-muted-foreground font-medium">
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

      {/* Manage Columns Sheet */}
      <Sheet open={isManageColumnsOpen} onOpenChange={setIsManageColumnsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 z-50">
          <SheetHeader>
            <SheetTitle className="text-base font-bold flex items-center gap-2">
              <Columns3 className="h-5 w-5 text-primary" />
              {lang === "ml" ? "കോളങ്ങൾ കൈകാര്യം ചെയ്യുക" : "Manage Columns"}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {lang === "ml"
                ? "കോളങ്ങൾ കാണിക്കാനോ മറയ്ക്കാനോ ചെക്ക് ചെയ്യുക. ഓർഡർ മാറ്റാൻ ഡ്രാഗ് ചെയ്യുക."
                : "Toggle column visibility or drag to reorder."}
            </SheetDescription>
          </SheetHeader>

          <div className="py-4 space-y-2">
            {columnOrder.map((key) => {
              const col = APPLIED_SCHEME_COLUMNS.find((c) => c.key === key);
              if (!col) return null;
              const isVisible = visibleColumns.has(key);
              const isRequired = key === "schemeName" || key === "actions";

              return (
                <div
                  key={key}
                  draggable
                  onDragStart={() => handleDragStart(key)}
                  onDragOver={(e) => handleDragOver(e, key)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors cursor-move"
                >
                  <div className="flex items-center gap-2.5">
                    <GripVertical className="h-4 w-4 text-muted-foreground/60" />
                    <Checkbox
                      id={`col-${key}`}
                      checked={isVisible}
                      disabled={isRequired}
                      onCheckedChange={() => toggleColumnVisibility(key)}
                    />
                    <label
                      htmlFor={`col-${key}`}
                      className="text-xs font-semibold text-foreground cursor-pointer select-none"
                    >
                      {lang === "ml" ? col.ml : col.en}
                    </label>
                  </div>
                  {isRequired && (
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <SheetFooter>
            <Button
              onClick={() => setIsManageColumnsOpen(false)}
              className="w-full font-bold text-xs"
            >
              {lang === "ml" ? "പൂർത്തിയായി" : "Done"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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
