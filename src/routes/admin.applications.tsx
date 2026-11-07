import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Check,
  ChevronRight,
  Filter,
  Download,
  Upload,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  UserRoundCheck,
  UserPlus,
  Columns3,
  GripVertical,
  MoreVertical,
  Eye,
  Pencil,
  RefreshCw,
  UserCheck,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  Clock,
  Clock3,
  AlertCircle,
  FileCheck2,
  Send,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  adminApplications,
  applicationReviewers,
  type QueueStage,
  type AdminApplication,
} from "@/data/admin-applications";
import { districts, getDistrictName } from "@/data/geo";
import { schemes } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAdminTopSearch } from "@/lib/admin-search-store";
import { cn } from "@/lib/utils";

function FilterDropdownSelector({
  title,
  placeholder,
  options,
  selectedValues,
  onChange,
  tr,
}: {
  title: string;
  placeholder: string;
  options: string[];
  selectedValues: string[];
  onChange: (newValues: string[]) => void;
  tr: (en: string, ml: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((item) => item !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const getLabelText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} ${tr("Selected", "തിരഞ്ഞെടുത്തു")}`;
  };

  if (options.length === 0) return null;

  return (
    <div className="space-y-1">
      <label className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">
        {title}
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full h-9 px-3 rounded-lg border flex items-center justify-between text-xs font-semibold transition-all bg-white cursor-pointer select-none text-left shadow-2xs",
              selectedValues.length > 0
                ? "border-amber-400 bg-[#FFF8F0] text-amber-950 font-bold"
                : "border-border text-slate-800 hover:border-amber-300 hover:bg-slate-50/50"
            )}
          >
            <span className="truncate pr-2">{getLabelText()}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-64 p-2 text-xs bg-white shadow-xl border border-amber-200 rounded-xl space-y-2 z-50"
        >
          {options.length > 4 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr("Search...", "തിരയുക...")}
                className="w-full h-8 pl-8 pr-2 text-xs rounded-md border border-border bg-slate-50 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between px-1.5 py-1 border-b border-slate-100 text-[11px]">
            <span className="font-bold text-slate-500">
              {selectedValues.length > 0
                ? `${selectedValues.length} ${tr("selected", "തിരഞ്ഞെടുത്തു")}`
                : tr("All", "എല്ലാം")}
            </span>
            {selectedValues.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-amber-600 hover:text-amber-700 font-bold cursor-pointer hover:underline"
              >
                {tr("Clear", "നീക്കം ചെയ്യുക")}
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
            <div
              onClick={() => onChange([])}
              className={cn(
                "flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-xs transition-colors font-medium",
                selectedValues.length === 0
                  ? "bg-amber-50 text-amber-900 font-bold"
                  : "hover:bg-slate-100 text-slate-700"
              )}
            >
              <span>{tr("All", "എല്ലാം")}</span>
              {selectedValues.length === 0 && (
                <Check className="h-3.5 w-3.5 text-amber-600 stroke-[2.5]" />
              )}
            </div>

            {filteredOptions.map((opt) => {
              const isChecked = selectedValues.includes(opt);
              return (
                <div
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={cn(
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-md cursor-pointer text-xs transition-colors select-none",
                    isChecked
                      ? "bg-[#FFF8F0] text-amber-950 font-bold"
                      : "hover:bg-slate-100 text-slate-700 font-medium"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                      isChecked
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span className="truncate flex-1">{opt}</span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const Route = createFileRoute("/admin/applications")({
  validateSearch: (search: Record<string, unknown>) => ({
    stage: typeof search.stage === "string" ? search.stage : undefined,
    filter: typeof search.filter === "string" ? search.filter : undefined,
  }),
  head: () => ({ meta: [{ title: "Applications List · Admin" }] }),
  component: ApplicationsPage,
});

export type ApplicationStatus =
  | "Received"
  | "Follow Up Required"
  | "Document Verified"
  | "Applied"
  | "Approved"
  | "Rejected"
  | "Pending";

export const applicationStatuses: ApplicationStatus[] = [
  "Received",
  "Follow Up Required",
  "Document Verified",
  "Applied",
  "Approved",
  "Rejected",
  "Pending",
];

const mlToEnNames: Record<string, string> = {
  "രമേശ് കുമാർ": "Ramesh Kumar",
  "സന്ധ്യ നായർ": "Sandhya Nair",
  "അനിൽ മേനോൻ": "Anil Menon",
  "ലത ജോസഫ്": "Latha Joseph",
  "സുരേഷ് കുമാർ": "Suresh Kumar",
  "ദീപ നായർ": "Deepa Nair",
  "ബിജു മേനോൻ": "Biju Menon",
  "ശ്രീലത ജോസഫ്": "Sreelatha Joseph",
  "ജയൻ കുമാർ": "Jayan Kumar",
  "നിത്യ നായർ": "Nithya Nair",
  "വിനോദ് മേനോൻ": "Vinod Menon",
};

export function getApplicantName(applicant: string, lang: string): string {
  if (lang === "ml") return applicant;
  return mlToEnNames[applicant] || applicant;
}

const reviewerDesignations: Record<string, string> = {
  "Not assigned": "Unassigned Officer",
  "Anitha K.": "Senior Superintendent",
  "Rahul M.": "District Coordinator",
  "Nithya S.": "Junior Assistant",
  "District desk": "Helpdesk Officer",
};

export function StatusPill({ status }: { status: ApplicationStatus | string }) {
  let badgeClass = "bg-muted text-muted-foreground border-border";
  let Icon = Clock;

  if (status === "Received") {
    badgeClass = "bg-sky-500/10 text-sky-600 border-sky-500/20";
    Icon = Clock;
  } else if (status === "Follow Up Required" || status === "Follow-up needed") {
    badgeClass = "bg-destructive/10 text-destructive border-destructive/20";
    Icon = AlertCircle;
  } else if (status === "Document Verified" || status === "Checking documents") {
    badgeClass = "bg-purple-500/10 text-purple-600 border-purple-500/20";
    Icon = FileCheck2;
  } else if (status === "Applied" || status === "Ready to submit" || status === "New") {
    badgeClass = "bg-blue-500/10 text-blue-600 border-blue-500/20";
    Icon = Send;
  } else if (status === "Approved" || status === "Completed") {
    badgeClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    Icon = CheckCircle2;
  } else if (status === "Rejected") {
    badgeClass = "bg-red-500/10 text-red-600 border-red-500/20";
    Icon = XCircle;
  } else if (status === "Pending") {
    badgeClass = "bg-amber-500/10 text-amber-600 border-amber-500/20";
    Icon = Clock3;
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${badgeClass}`}>
      <Icon className="h-3 w-3 shrink-0" />
      {status}
    </span>
  );
}

export function StagePill({ stage }: { stage: QueueStage | string }) {
  return <StatusPill status={stage} />;
}

type ApplicationColumnKey =
  | "appDate"
  | "applicant"
  | "trackingId"
  | "scheme"
  | "areaOrgDistrict"
  | "createdBy"
  | "status"
  | "applyLink"
  | "actions";

const APPLICATION_COLUMNS: { key: ApplicationColumnKey; en: string; ml: string }[] = [
  { key: "appDate", en: "Application date", ml: "അപേക്ഷാ തീയതി" },
  { key: "applicant", en: "Applicant Name", ml: "അപേക്ഷകന്റെ പേര്" },
  { key: "trackingId", en: "Tracking ID", ml: "ട്രാക്കിംഗ് ഐഡി" },
  { key: "scheme", en: "Scheme and Scheme Category", ml: "പദ്ധതിയും വിഭാഗവും" },
  { key: "areaOrgDistrict", en: "Area & Org District", ml: "പ്രദേശവും ഓർഗ് ജില്ലയും" },
  { key: "createdBy", en: "Created By", ml: "സൃഷ്ടിച്ചത്" },
  { key: "status", en: "Status", ml: "സ്റ്റാറ്റസ്" },
  { key: "applyLink", en: "Apply Link", ml: "അപേക്ഷാ ലിങ്ക്" },
  { key: "actions", en: "Actions", ml: "നടപടികൾ" },
];

const areaNames = [
  "Thiruvananthapuram Urban",
  "Kollam East",
  "Alappuzha North",
  "Kottayam West",
  "Idukki Central",
  "Ernakulam Metro",
  "Thrissur North",
  "Palakkad Rural",
];

type RichApplicationRecord = AdminApplication & {
  appStatus?: ApplicationStatus;
  area: string;
  orgDistrict: string;
  trackingId: string;
  reviewerDesignation: string;
  applyUrl: string;
};

function ApplicationsPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const topSearchQuery = useAdminTopSearch();

  // Application Record state mapped to rich fields
  const [applicationsList, setApplicationsList] = useState<RichApplicationRecord[]>(() =>
    adminApplications.map((app, index) => {
      const distObj = districts.find((d) => d.id === app.districtId);
      const orgDistName = distObj ? distObj.en : "Thiruvananthapuram";
      const areaName = areaNames[index % areaNames.length];
      const trackingId = `TRK-${String(880000 + index * 137).slice(0, 6)}`;
      const reviewerDesig = reviewerDesignations[app.reviewer] || "Desk Officer";

      return {
        ...app,
        appStatus: applicationStatuses[index % applicationStatuses.length],
        area: areaName,
        orgDistrict: orgDistName,
        trackingId,
        reviewerDesignation: reviewerDesig,
        applyUrl: `https://services.kerala.gov.in/scheme/${app.schemeId}/apply`,
      };
    })
  );

  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);

  const [editingRecord, setEditingRecord] = useState<RichApplicationRecord | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSchemes, setSelectedSchemes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedCreatedBys, setSelectedCreatedBys] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomRangeStart] = useState("");
  const [customEndDate, setCustomRangeEnd] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const availableStatuses = useMemo(() => [...applicationStatuses], []);
  const availableSchemes = useMemo(() => {
    const list = schemes.map((s) => s.en);
    return Array.from(new Set(list)).sort();
  }, []);
  const availableCategories = useMemo(() => [
    "Agriculture",
    "Education",
    "Health",
    "Housing",
    "Pension & Welfare",
    "Women Welfare",
    "Employment",
    "MSME & Business",
  ], []);
  const availableDistricts = useMemo(() => districts.map((d) => d.en).sort(), []);
  const availableAreas = useMemo(() => Array.from(new Set(areaNames)).sort(), []);
  const availableCreatedBys = useMemo(() => Array.from(new Set(Object.keys(reviewerDesignations))).sort(), []);

  const [visibleColumns, setVisibleColumns] = useState<Set<ApplicationColumnKey>>(
    () => new Set(APPLICATION_COLUMNS.map((c) => c.key).filter((k) => k !== "trackingId"))
  );
  const [columnOrder, setColumnOrder] = useState<ApplicationColumnKey[]>(() =>
    APPLICATION_COLUMNS.map((c) => c.key)
  );
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return "table";
    }
    return "cards";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewMode(window.innerWidth >= 768 ? "table" : "cards");
    }
  }, []);

  const handleDeleteRecord = (id: string) => {
    setApplicationsList((prev) => prev.filter((item) => item.id !== id));
    toast.success(lang === "ml" ? "അപേക്ഷ നീക്കം ചെയ്തു." : "Application deleted successfully.");
  };

  const handleBulkExport = () => {
    toast.success(
      lang === "ml"
        ? `${selectedIds.size} അപേക്ഷകളുടെ ഡാറ്റ എക്സ്പോർട്ട് ചെയ്തു.`
        : `Exported ${selectedIds.size} selected application(s).`
    );
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    setApplicationsList((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    toast.success(
      lang === "ml"
        ? `${count} അപേക്ഷകൾ നീക്കം ചെയ്തു.`
        : `Deleted ${count} selected application(s).`
    );
  };

  const handleBulkEnable = () => {
    const count = selectedIds.size;
    setApplicationsList((prev) =>
      prev.map((item) => (selectedIds.has(item.id) ? { ...item, appStatus: "Approved" as ApplicationStatus } : item))
    );
    toast.success(
      lang === "ml"
        ? `${count} അപേക്ഷകൾ 'Approved' ആക്കി.`
        : `Enabled ${count} selected application(s).`
    );
  };

  const handleBulkDisable = () => {
    const count = selectedIds.size;
    setApplicationsList((prev) =>
      prev.map((item) => (selectedIds.has(item.id) ? { ...item, appStatus: "Rejected" as ApplicationStatus } : item))
    );
    toast.success(
      lang === "ml"
        ? `${count} അപേക്ഷകൾ 'Rejected' ആക്കി.`
        : `Disabled ${count} selected application(s).`
    );
  };

  const assignableUsersList = useMemo(() => [
    { id: "u1", name: "Anand V. Nair", nameMl: "ആനന്ദ് വി. നായർ", role: "Booth President", roleMl: "ബൂത്ത് പ്രസിഡന്റ്", location: "Balaramapuram Booth 44, Thiruvananthapuram", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { id: "u2", name: "Neethu R. Menon", nameMl: "നീതു ആർ. മേനോൻ", role: "Secretary", roleMl: "സെക്രട്ടറി", location: "Chathannoor Mandalam, Kollam", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
    { id: "u3", name: "Reshma S. Pillai", nameMl: "രേഷ്മ എസ്. പിള്ള", role: "Treasurer", roleMl: "ട്രഷറർ", location: "Thrissur Central, Thrissur", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
    { id: "u4", name: "C. Gokuldas", nameMl: "സി. ഗോകുൽദാസ്", role: "Area President", roleMl: "മേഖലാ പ്രസിഡന്റ്", location: "Palakkad, Palakkad", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    { id: "u5", name: "Nimisha Subramanian", nameMl: "നിമിഷ സുബ്രഹ്മണ്യൻ", role: "General Secretary", roleMl: "ജനറൽ സെക്രട്ടറി", location: "Ponnani, Malappuram", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80" },
    { id: "u6", name: "Pranav Krishna", nameMl: "പ്രണവ് കൃഷ്ണ", role: "Karyakarta", roleMl: "കാര്യകർത്താവ്", location: "Vadakara, Kozhikode", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
    { id: "u7", name: "C. Radhakrishnan", nameMl: "സി. രാധാകൃഷ്ണൻ", role: "District President", roleMl: "ജില്ലാ പ്രസിഡന്റ്", location: "Kannur, Kannur", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" },
    { id: "u8", name: "M. L. Anjana", nameMl: "എം. എൽ. അഞ്ജന", role: "Vice President", roleMl: "വൈസ് പ്രസിഡന്റ്", location: "Alappuzha, Alappuzha", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" },
    { id: "u9", name: "Anitha K.", nameMl: "അനിത കെ.", role: "Senior Superintendent", roleMl: "സീനിയർ സൂപ്പർവൈസർ", location: "District Office, Thiruvananthapuram", avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80" },
    { id: "u10", name: "Rahul M.", nameMl: "രാഹുൽ എം.", role: "District Coordinator", roleMl: "ഡിസ്ട്രിക്റ്റ് കോർഡിനേറ്റർ", location: "Welfare Cell, Ernakulam", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80" },
  ], []);

  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [selectedAssignUserIds, setSelectedAssignUserIds] = useState<Set<string>>(
    new Set(["u1", "u2", "u3"])
  );
  const [assignUserSearch, setAssignUserSearch] = useState<string>("");
  const [assignTargetAppId, setAssignTargetAppId] = useState<string | null>(null);

  const [drawerSelectedDesignations, setDrawerSelectedDesignations] = useState<string[]>([]);
  const [drawerSelectedRegions, setDrawerSelectedRegions] = useState<string[]>([]);
  const [drawerSelectedOrgDistricts, setDrawerSelectedOrgDistricts] = useState<string[]>([]);
  const [drawerSelectedMandalams, setDrawerSelectedMandalams] = useState<string[]>([]);
  const [drawerSelectedAreas, setDrawerSelectedAreas] = useState<string[]>([]);
  const [drawerSelectedBooths, setDrawerSelectedBooths] = useState<string[]>([]);

  const drawerActiveFilterCount =
    drawerSelectedDesignations.length +
    drawerSelectedRegions.length +
    drawerSelectedOrgDistricts.length +
    drawerSelectedMandalams.length +
    drawerSelectedAreas.length +
    drawerSelectedBooths.length;

  const availDesignations = useMemo(() => ["Booth President", "Secretary", "Treasurer", "Area President", "General Secretary", "Karyakarta", "District President", "Vice President"], []);
  const availRegions = useMemo(() => ["South Zone", "Central Zone", "North Zone"], []);
  const availOrgDistricts = useMemo(() => ["Thiruvananthapuram", "Kollam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Kannur", "Alappuzha"], []);
  const availMandalams = useMemo(() => ["Balaramapuram", "Chathannoor", "Thrissur Central", "Palakkad City", "Ponnani", "Vadakara", "Kannur Urban"], []);
  const availAreas = useMemo(() => ["Area 1", "Area 2", "Area 3"], []);
  const availBooths = useMemo(() => ["Booth 44", "Booth 12", "Booth 88"], []);

  const filteredAssignableUsers = useMemo(() => {
    let list = assignableUsersList;
    if (drawerSelectedDesignations.length > 0) {
      list = list.filter((u) => drawerSelectedDesignations.includes(u.role));
    }
    if (assignUserSearch.trim()) {
      const q = assignUserSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q)
      );
    }
    return list;
  }, [assignableUsersList, assignUserSearch, drawerSelectedDesignations]);

  const toggleSelectUser = (id: string) => {
    setSelectedAssignUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAllUsers = () => {
    if (selectedAssignUserIds.size === filteredAssignableUsers.length) {
      setSelectedAssignUserIds(new Set());
    } else {
      setSelectedAssignUserIds(new Set(filteredAssignableUsers.map((u) => u.id)));
    }
  };

  const handleBulkAssign = () => {
    setAssignTargetAppId(null);
    setAssignUserSearch("");
    setSelectedAssignUserIds(new Set(["u1", "u2", "u3"]));
    setIsAssignDrawerOpen(true);
  };

  const handleConfirmAssign = () => {
    if (selectedAssignUserIds.size === 0) {
      toast.error(lang === "ml" ? "ദയവായി കുറഞ്ഞത് ഒരു ഉപയോക്താവിനെ തിരഞ്ഞെടുക്കുക." : "Please select at least one user.");
      return;
    }

    const assignedUsers = assignableUsersList.filter((u) => selectedAssignUserIds.has(u.id));
    const primaryUser = assignedUsers[0]?.name || "Assigned User";
    const primaryDesig = assignedUsers[0]?.role || "Officer";

    if (assignTargetAppId) {
      setApplicationsList((prev) =>
        prev.map((item) =>
          item.id === assignTargetAppId
            ? { ...item, reviewer: primaryUser, reviewerDesignation: primaryDesig }
            : item
        )
      );
      toast.success(
        lang === "ml"
          ? `'${primaryUser}' അപേക്ഷയ്ക്ക് അസൈൻ ചെയ്തു.`
          : `Assigned application to ${primaryUser}.`
      );
    } else {
      const count = selectedIds.size > 0 ? selectedIds.size : applicationsList.length;
      setApplicationsList((prev) =>
        prev.map((item) =>
          selectedIds.has(item.id) || selectedIds.size === 0
            ? { ...item, reviewer: primaryUser, reviewerDesignation: primaryDesig }
            : item
        )
      );
      toast.success(
        lang === "ml"
          ? `${count} അപേക്ഷകൾ '${primaryUser}' ന് അസൈൻ ചെയ്തു.`
          : `Assigned ${count} application(s) to ${primaryUser}.`
      );
    }

    setIsAssignDrawerOpen(false);
  };

  const handleBulkMessage = () => {
    toast.info(
      lang === "ml"
        ? `${selectedIds.size} അപേക്ഷകർക്ക് സന്ദേശം അയയ്ക്കുന്നു.`
        : `Sending message to ${selectedIds.size} selected applicant(s).`
    );
  };

  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplicationsList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, appStatus: newStatus, queueStage: newStatus === "Approved" ? "Completed" : ("New" as QueueStage) }
          : item
      )
    );
    toast.success(
      lang === "ml"
        ? `സ്റ്റാറ്റസ് '${newStatus}' എന്ന് മാറ്റി.`
        : `Status updated to '${newStatus}'.`
    );
  };

  const handleAssignUser = (id: string, newUser: string) => {
    setApplicationsList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              reviewer: newUser,
              reviewerDesignation: reviewerDesignations[newUser] || "Desk Officer",
            }
          : item
      )
    );
    toast.success(
      lang === "ml"
        ? `'${newUser}' ബാധ്യസ്ഥനാക്കി അസൈൻ ചെയ്തു.`
        : `Assigned application to ${newUser}.`
    );
  };

  const toggleColumn = (key: ApplicationColumnKey) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleDragStartColumn = (index: number) => {
    setDraggedColumnIndex(index);
  };

  const handleDragOverColumn = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropColumn = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === dropIndex) return;
    const nextOrder = [...columnOrder];
    const [moved] = nextOrder.splice(draggedColumnIndex, 1);
    nextOrder.splice(dropIndex, 0, moved);
    setColumnOrder(nextOrder);
    setDraggedColumnIndex(null);
  };

  const filtered = useMemo(() => {
    return applicationsList.filter((record) => {
      const q = topSearchQuery.trim().toLowerCase();
      const nameEn = getApplicantName(record.applicant, "en").toLowerCase();
      const nameMl = record.applicant.toLowerCase();

      const searchMatch =
        !q ||
        nameEn.includes(q) ||
        nameMl.includes(q) ||
        record.id.toLowerCase().includes(q) ||
        record.reference.toLowerCase().includes(q) ||
        record.trackingId.toLowerCase().includes(q) ||
        record.area.toLowerCase().includes(q) ||
        record.orgDistrict.toLowerCase().includes(q) ||
        record.schemeId.toLowerCase().includes(q);

      const statusMatch =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(record.appStatus || "") ||
        selectedStatuses.includes(record.queueStage || "");

      const districtMatch =
        selectedDistricts.length === 0 ||
        selectedDistricts.includes(record.orgDistrict) ||
        selectedDistricts.some((dName) => {
          const dObj = districts.find((d) => d.en.toLowerCase() === dName.toLowerCase() || d.id === record.districtId);
          return dObj?.id === record.districtId;
        });

      const areaMatch =
        selectedAreas.length === 0 || selectedAreas.includes(record.area);

      const createdByMatch =
        selectedCreatedBys.length === 0 || selectedCreatedBys.includes(record.reviewer);

      const schemeMatch =
        selectedSchemes.length === 0 ||
        selectedSchemes.some((sTitle) => {
          const sch = schemes.find((s) => s.id === record.schemeId);
          if (!sch) return false;
          return (
            sch.en.toLowerCase() === sTitle.toLowerCase() ||
            sch.ml === sTitle
          );
        });

      let categoryMatch = true;
      if (selectedCategories.length > 0) {
        const sch = schemes.find((s) => s.id === record.schemeId);
        if (!sch) {
          categoryMatch = false;
        } else {
          categoryMatch = selectedCategories.some((cat) => {
            const catLower = cat.toLowerCase();
            const schCat = sch.category.toLowerCase();
            if (schCat === catLower) return true;
            if (catLower.includes("welfare") && schCat === "welfare") return true;
            if (catLower.includes("women") && schCat === "women") return true;
            if (catLower.includes("msme") && schCat === "msme") return true;
            return false;
          });
        }
      }

      let dateMatch = true;
      if (dateFilter !== "all") {
        const recordDate = new Date(record.submittedAt || record.createdAt || Date.now()).getTime();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (dateFilter === "today") {
          dateMatch = now - recordDate <= oneDay;
        } else if (dateFilter === "week" || dateFilter === "7days") {
          dateMatch = now - recordDate <= 7 * oneDay;
        } else if (dateFilter === "month" || dateFilter === "30days") {
          dateMatch = now - recordDate <= 30 * oneDay;
        } else if (dateFilter === "6months") {
          dateMatch = now - recordDate <= 180 * oneDay;
        } else if (dateFilter === "year") {
          dateMatch = now - recordDate <= 365 * oneDay;
        }
      }

      return (
        searchMatch &&
        statusMatch &&
        districtMatch &&
        areaMatch &&
        createdByMatch &&
        schemeMatch &&
        categoryMatch &&
        dateMatch
      );
    });
  }, [
    applicationsList,
    topSearchQuery,
    selectedStatuses,
    selectedSchemes,
    selectedCategories,
    selectedDistricts,
    selectedAreas,
    selectedCreatedBys,
    dateFilter,
  ]);

  const visible = filtered.slice(0, 50);
  const allVisibleSelected =
    visible.length > 0 && visible.every((record) => selectedIds.has(record.id));

  function toggleAll() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visible.forEach((record) => next.delete(record.id));
      else visible.forEach((record) => next.add(record.id));
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const activeFilterCount =
    selectedStatuses.length +
    selectedSchemes.length +
    selectedCategories.length +
    selectedDistricts.length +
    selectedAreas.length +
    selectedCreatedBys.length +
    (dateFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Merged Single Section Container */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-5">
        
        {/* Top Header Row with Title & Filter / Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-base font-bold text-foreground">
              {lang === "ml" ? "അപേക്ഷകളുടെ ലിസ്റ്റ്" : "Applications List"}
            </h2>

            {selectedIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 bg-white dark:bg-card border border-border/80 rounded-full px-3 py-1 text-xs shadow-2xs animate-in fade-in transition-all">
                <span className="font-extrabold text-foreground text-[11px]">
                  {tr(
                    `${selectedIds.size} of ${filtered.length} selected`,
                    `${selectedIds.size} / ${filtered.length} തിരഞ്ഞെടുത്തു`,
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer text-[11px]"
                >
                  {tr("Deselect All", "എല്ലാം ഒഴിവാക്കുക")}
                </button>
                <div className="h-3.5 w-px bg-border mx-0.5" />
                <button
                  type="button"
                  onClick={handleBulkAssign}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-card px-2.5 py-0.5 text-[11px] font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <UserRoundCheck className="h-3.5 w-3.5 text-slate-900 dark:text-slate-100" />
                  <span>{tr("Assign To User", "അസൈൻ ചെയ്യുക")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkMessage}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-card px-2.5 py-0.5 text-[11px] font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-slate-900 dark:text-slate-100" />
                  <span>{tr("Message", "സന്ദേശം")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkEnable}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer transition-colors"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{tr("Enable", "സജീവമാക്കുക")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkDisable}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{tr("Disable", "നിർജ്ജീവമാക്കുക")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkExport}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-card px-2.5 py-0.5 text-[11px] font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-slate-900 dark:text-slate-100" />
                  <span>{tr("Export", "എക്സ്പോർട്ട്")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  <span>{tr("Delete", "ഡിലീറ്റ് ചെയ്യുക")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Filter, View Mode, Columns & Actions on the Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5 max-w-full sm:ml-auto shrink-0">

            {/* Manage Columns Button (Desktop) */}
            <button
              type="button"
              onClick={() => setIsManageColumnsOpen(true)}
              title={lang === "ml" ? "കോളങ്ങൾ ക്രമീകരിക്കുക" : "Manage columns"}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
            >
              <Columns3 className="h-4 w-4" />
            </button>

            {/* Filter Button with Multi-Select Dropdowns & Date Range Inside Filter Popover */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0",
                    activeFilterCount > 0
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{tr("Filter", "ഫിൽട്ടർ")}</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 p-3 text-xs space-y-3.5 max-h-[85vh] overflow-y-auto z-50 bg-white border border-border shadow-xl rounded-xl"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-border">
                  <span className="font-bold text-foreground text-xs">
                    {tr("Filter Applications", "അപേക്ഷകളെ ഫിൽട്ടർ ചെയ്യുക")}
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStatuses([]);
                        setSelectedSchemes([]);
                        setSelectedCategories([]);
                        setSelectedDistricts([]);
                        setSelectedAreas([]);
                        setSelectedCreatedBys([]);
                        setDateFilter("all");
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {tr("Reset All", "എല്ലാം റീസെറ്റ് ചെയ്യുക")}
                    </button>
                  )}
                </div>

                {/* Date Range Filter */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {tr("DATE RANGE", "തീയതി")}
                  </div>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="all">{lang === "ml" ? "എല്ലാ തീയതികളും (All Time)" : "All Time"}</option>
                    <option value="today">{lang === "ml" ? "ഇന്ന്" : "Today"}</option>
                    <option value="week">{lang === "ml" ? "കഴിഞ്ഞ 1 ആഴ്ച" : "Last Week"}</option>
                    <option value="month">{lang === "ml" ? "കഴിഞ്ഞ 1 മാസം" : "Last Month"}</option>
                    <option value="6months">{lang === "ml" ? "കഴിഞ്ഞ 6 മാസം" : "Last 6 Months"}</option>
                    <option value="year">{lang === "ml" ? "കഴിഞ്ഞ 1 വർഷം" : "Last Year"}</option>
                  </select>
                </div>

                {/* Status Filter */}
                <FilterDropdownSelector
                  title={tr("STATUS", "സ്റ്റാറ്റസ്")}
                  placeholder={tr("Select Status", "സ്റ്റാറ്റസ് തിരഞ്ഞെടുക്കുക")}
                  options={availableStatuses}
                  selectedValues={selectedStatuses}
                  onChange={setSelectedStatuses}
                  tr={tr}
                />

                {/* Scheme Filter */}
                <FilterDropdownSelector
                  title={tr("SCHEME", "പദ്ധതി")}
                  placeholder={tr("Select Scheme", "പദ്ധതി തിരഞ്ഞെടുക്കുക")}
                  options={availableSchemes}
                  selectedValues={selectedSchemes}
                  onChange={setSelectedSchemes}
                  tr={tr}
                />

                {/* Scheme Category Filter */}
                <FilterDropdownSelector
                  title={tr("SCHEME CATEGORY", "പദ്ധതി വിഭാഗം")}
                  placeholder={tr("Select Category", "വിഭാഗം തിരഞ്ഞെടുക്കുക")}
                  options={availableCategories}
                  selectedValues={selectedCategories}
                  onChange={setSelectedCategories}
                  tr={tr}
                />

                {/* District / Org District Filter */}
                <FilterDropdownSelector
                  title={tr("ORG DISTRICT", "സംഘടനാ ജില്ല")}
                  placeholder={tr("Select District", "ജില്ല തിരഞ്ഞെടുക്കുക")}
                  options={availableDistricts}
                  selectedValues={selectedDistricts}
                  onChange={setSelectedDistricts}
                  tr={tr}
                />

                {/* Area Filter */}
                <FilterDropdownSelector
                  title={tr("AREA", "പ്രദേശം")}
                  placeholder={tr("Select Area", "പ്രദേശം തിരഞ്ഞെടുക്കുക")}
                  options={availableAreas}
                  selectedValues={selectedAreas}
                  onChange={setSelectedAreas}
                  tr={tr}
                />

                {/* Created By Filter */}
                <FilterDropdownSelector
                  title={tr("CREATED BY", "സൃഷ്ടിച്ചത്")}
                  placeholder={tr("Select Officer", "ഉദ്യോഗസ്ഥനെ തിരഞ്ഞെടുക്കുക")}
                  options={availableCreatedBys}
                  selectedValues={selectedCreatedBys}
                  onChange={setSelectedCreatedBys}
                  tr={tr}
                />
              </DropdownMenuContent>
            </DropdownMenu>

            {/* New Application Button + 3-Dot Menu (Import / Export) */}
            <div className="flex items-center gap-1 shrink-0">
              <Button asChild className="hidden sm:inline-flex h-8 rounded-xl px-3.5 text-xs font-semibold shrink-0">
                <Link to="/admin/applications/new" search={{ stage: undefined, filter: undefined }}>
                  <Plus className="h-3.5 w-3.5" /> {lang === "ml" ? "പുതിയ അപേക്ഷ" : "New Application"}
                </Link>
              </Button>

              {/* 3-Dot Menu for View Mode, Import & Export Near New Application Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                    title={lang === "ml" ? "കൂടുതൽ ഓപ്ഷനുകൾ" : "More options"}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1 space-y-0.5 shadow-xl border-border">
                  <DropdownMenuItem
                    onClick={() => setViewMode("table")}
                    className={cn("cursor-pointer text-xs font-semibold", viewMode === "table" && "bg-muted font-bold text-primary")}
                  >
                    <List className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    {lang === "ml" ? "ലിസ്റ്റ് വ്യൂ" : "List View"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setViewMode("cards")}
                    className={cn("cursor-pointer text-xs font-semibold", viewMode === "cards" && "bg-muted font-bold text-primary")}
                  >
                    <LayoutGrid className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    {lang === "ml" ? "കാർഡ് വ്യൂ" : "Card View"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => toast.info(lang === "ml" ? "ഇംപോർട്ട് ഫീച്ചർ തയ്യാറാകുന്നു" : "Import feature triggered")}
                    className="cursor-pointer text-xs font-semibold"
                  >
                    <Upload className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    {lang === "ml" ? "ഇംപോർട്ട്" : "Import"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.success(lang === "ml" ? "ഡാറ്റ എക്സ്പോർട്ട് ചെയ്തു" : "Data exported successfully")}
                    className="cursor-pointer text-xs font-semibold"
                  >
                    <Download className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    {lang === "ml" ? "എക്സ്പോർട്ട്" : "Export"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Cards View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {visible.map((record) => {
              const isSelected = selectedIds.has(record.id);
              const sch = schemes.find((s) => s.id === record.schemeId);
              const displayName = getApplicantName(record.applicant, lang);
              return (
                <div
                  key={record.id}
                  onClick={() =>
                    navigate({
                      to: "/admin/applications/$applicationId",
                      params: { applicationId: record.id },
                    })
                  }
                  className={`rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer ${
                    isSelected ? "border-primary/50 bg-primary/[0.04]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(record.id)}
                          aria-label={`Select application ${record.reference}`}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs text-foreground truncate">
                        {record.trackingId}
                      </span>
                    </div>
                    <StatusPill status={record.appStatus || record.queueStage} />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to="/admin/beneficiaries"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-sm text-foreground hover:text-primary hover:underline block"
                      >
                        {displayName}
                      </Link>
                      <p className="text-xs text-muted-foreground font-medium">{record.mobile}</p>
                    </div>
                    <div className="text-right">
                      <Link
                        to="/admin/schemes"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold text-primary hover:underline block"
                      >
                        {sch ? (lang === "ml" ? sch.ml : sch.en) : record.schemeId}
                      </Link>
                      <span className="text-[10px] text-muted-foreground font-semibold block capitalize">
                        {sch ? sch.category : ""}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <div>
                      <span className="text-[10px] block font-semibold text-muted-foreground/70">Area</span>
                      <span className="font-semibold text-foreground">{record.area}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block font-semibold text-muted-foreground/70">Org District</span>
                      <span className="font-semibold text-foreground">{record.orgDistrict}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {getDistrictName(record.districtId, lang)}
                    </span>
                    <span className="font-semibold text-primary flex items-center gap-0.5">
                      Details <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Data Table View */}
        {viewMode === "table" && (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
                <tr>
                  <th className="w-10 p-3">
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all visible applications"
                    />
                  </th>
                  {columnOrder.map((colKey) => {
                    if (!visibleColumns.has(colKey)) return null;
                    const meta = APPLICATION_COLUMNS.find((c) => c.key === colKey);
                    if (!meta) return null;
                    return (
                      <th
                        key={colKey}
                        className={`p-3 ${colKey === "actions" ? "text-right" : ""}`}
                      >
                        {lang === "ml" ? meta.ml : meta.en.toUpperCase()}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {visible.map((record) => {
                  const isSelected = selectedIds.has(record.id);
                  const sch = schemes.find((s) => s.id === record.schemeId);
                  const displayName = getApplicantName(record.applicant, lang);

                  return (
                    <tr
                      key={record.id}
                      onClick={() =>
                        navigate({
                          to: "/admin/applications/$applicationId",
                          params: { applicationId: record.id },
                        })
                      }
                      className={`cursor-pointer hover:bg-muted/40 transition-colors ${isSelected ? "bg-primary/[0.04]" : ""}`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(record.id)}
                          aria-label={`Select application ${record.reference}`}
                        />
                      </td>
                      {columnOrder.map((colKey) => {
                        if (!visibleColumns.has(colKey)) return null;
                        switch (colKey) {
                          case "appDate":
                            return (
                              <td key="appDate" className="p-3 font-mono font-bold text-foreground">
                                {new Date(record.submittedAt || record.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                            );
                          case "applicant":
                            return (
                              <td key="applicant" className="p-3" onClick={(e) => e.stopPropagation()}>
                                <Link
                                  to="/admin/beneficiaries"
                                  className="font-bold text-foreground hover:text-primary hover:underline block"
                                >
                                  {displayName}
                                </Link>
                                <p className="text-[10px] font-mono text-muted-foreground">{record.mobile}</p>
                              </td>
                            );
                          case "trackingId":
                            return (
                              <td key="trackingId" className="p-3 font-mono font-bold text-foreground">
                                {record.trackingId}
                              </td>
                            );
                          case "scheme":
                            return (
                              <td key="scheme" className="p-3" onClick={(e) => e.stopPropagation()}>
                                <Link
                                  to="/admin/schemes"
                                  className="font-bold text-primary hover:underline block"
                                >
                                  {sch ? (lang === "ml" ? sch.ml : sch.en) : record.schemeId}
                                </Link>
                                <p className="text-[10px] text-muted-foreground font-semibold capitalize">
                                  {sch ? sch.category : record.schemeId}
                                </p>
                              </td>
                            );
                          case "areaOrgDistrict":
                            return (
                              <td key="areaOrgDistrict" className="p-3">
                                <p className="font-bold text-foreground">{record.area}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold">{record.orgDistrict}</p>
                              </td>
                            );
                          case "createdBy":
                            return (
                              <td key="createdBy" className="p-3">
                                <p className="font-bold text-foreground">{record.reviewer || "Not assigned"}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">{record.reviewerDesignation}</p>
                              </td>
                            );
                          case "status":
                            return (
                              <td key="status" className="p-3">
                                <StatusPill status={record.appStatus || record.queueStage} />
                              </td>
                            );
                          case "applyLink":
                            return (
                              <td key="applyLink" className="p-3" onClick={(e) => e.stopPropagation()}>
                                <a
                                  href={record.applyUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" /> Apply
                                </a>
                              </td>
                            );
                          case "actions":
                            return (
                              <td key="actions" className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className="h-7 w-7 inline-flex items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                      title={lang === "ml" ? "നടപടികൾ" : "Actions"}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56 p-1 space-y-0.5 shadow-xl border-border">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate({
                                          to: "/admin/applications/$applicationId",
                                          params: { applicationId: record.id },
                                        })
                                      }
                                      className="cursor-pointer text-xs font-semibold"
                                    >
                                      <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      {lang === "ml" ? "കാണുക" : "View Details"}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() => setEditingRecord(record)}
                                      className="cursor-pointer text-xs font-semibold"
                                    >
                                      <Pencil className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      {lang === "ml" ? "തിരുത്തുക" : "Edit"}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() => window.open("https://kerala.gov.in", "_blank")}
                                      className="cursor-pointer text-xs font-semibold"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      {lang === "ml" ? "ഔദ്യോഗിക വെബ്‌സൈറ്റ്" : "Official Website"}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() => {
                                        navigator.clipboard.writeText(`https://vikasita.kerala.gov.in/track/${record.trackingId}`);
                                        toast.success(
                                          lang === "ml"
                                            ? "ട്രാക്കിംഗ് ലിങ്ക് കോപ്പി ചെയ്തു!"
                                            : "Tracking link copied to clipboard!"
                                        );
                                      }}
                                      className="cursor-pointer text-xs font-semibold"
                                    >
                                      <LinkIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      {lang === "ml" ? "ട്രാക്കിംഗ് ലിങ്ക്" : "Tracking Link"}
                                    </DropdownMenuItem>

                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger className="cursor-pointer text-xs font-semibold">
                                        <RefreshCw className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                        {lang === "ml" ? "സ്റ്റാറ്റസ് മാറ്റുക" : "Change Status"}
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent className="w-52 p-1">
                                        {applicationStatuses.map((stg) => (
                                          <DropdownMenuItem
                                            key={stg}
                                            onClick={() => handleUpdateStatus(record.id, stg)}
                                            className={`cursor-pointer text-xs font-semibold ${record.appStatus === stg ? "bg-accent font-bold" : ""}`}
                                          >
                                            {stg}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger className="cursor-pointer text-xs font-semibold">
                                        <UserCheck className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                        {lang === "ml" ? "മറ്റൊരാൾക്ക് അസൈൻ ചെയ്യുക" : "Assign to User"}
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent className="w-56 p-1">
                                        {applicationReviewers.map((rev) => (
                                          <DropdownMenuItem
                                            key={rev}
                                            onClick={() => { setAssignTargetAppId(record.id); setSelectedAssignOfficer(rev); setAssignUserSearch(""); setIsAssignDrawerOpen(true); }}
                                            className={`cursor-pointer text-xs font-semibold ${record.reviewer === rev ? "bg-accent font-bold" : ""}`}
                                          >
                                            {rev}
                                          </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => navigate({ to: "/admin/settings/new-role", search: { returnTo: "/admin/applications" } })}
                                          className="cursor-pointer text-xs font-bold text-primary"
                                        >
                                          <Plus className="h-3.5 w-3.5 mr-2 text-primary" />
                                          {lang === "ml" ? "+ പുതിയ റോൾ സൃഷ്ടിക്കുക..." : "+ Create New Role..."}
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                      onClick={() => handleDeleteRecord(record.id)}
                                      className="cursor-pointer text-xs font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-2 text-destructive" />
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Application Modal */}
        {editingRecord && (
          <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">
                  {lang === "ml" ? "അപേക്ഷ തിരുത്തുക" : "Edit Application"} ({editingRecord.reference})
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2 text-xs">
                <div>
                  <label className="font-semibold block mb-1">
                    {lang === "ml" ? "അപേക്ഷകന്റെ പേര്" : "Applicant Name"}
                  </label>
                  <input
                    type="text"
                    value={editingRecord.applicant}
                    onChange={(e) => setEditingRecord({ ...editingRecord, applicant: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-semibold outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    {lang === "ml" ? "ഫോൺ നമ്പർ" : "Mobile Number"}
                  </label>
                  <input
                    type="text"
                    value={editingRecord.mobile}
                    onChange={(e) => setEditingRecord({ ...editingRecord, mobile: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-semibold outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    {lang === "ml" ? "സ്റ്റാറ്റസ്" : "Status"}
                  </label>
                  <select
                    value={editingRecord.appStatus || "Pending"}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        appStatus: e.target.value as ApplicationStatus,
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-semibold outline-none focus:ring-1 focus:ring-primary"
                  >
                    {applicationStatuses.map((stg) => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    {lang === "ml" ? "അസൈൻ ചെയ്തയാൾ" : "Assigned Reviewer"}
                  </label>
                  <select
                    value={editingRecord.reviewer}
                    onChange={(e) => setEditingRecord({ ...editingRecord, reviewer: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-semibold outline-none focus:ring-1 focus:ring-primary"
                  >
                    {applicationReviewers.map((rev) => (
                      <option key={rev} value={rev}>{rev}</option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingRecord(null)}>
                  {lang === "ml" ? "റദ്ദാക്കുക" : "Cancel"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setApplicationsList((prev) =>
                      prev.map((item) => (item.id === editingRecord.id ? editingRecord : item))
                    );
                    setEditingRecord(null);
                    toast.success(lang === "ml" ? "അപേക്ഷ അപ്‌ഡേറ്റ് ചെയ്തു" : "Application updated");
                  }}
                >
                  {lang === "ml" ? "സേവ് ചെയ്യുക" : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Right Side Popup Sheet for Assigning User */}
        <Sheet open={isAssignDrawerOpen} onOpenChange={setIsAssignDrawerOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full p-0 gap-0 bg-white border-l border-border z-50">
            <SheetHeader className="p-5 border-b border-border bg-white text-left space-y-1">
              <SheetTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>
                  {tr(
                    'Assign Users to "Admin"',
                    '"Admin" റോളിലേക്ക് ഉപയോക്താക്കളെ അസൈൻ ചെയ്യുക'
                  )}
                </span>
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {tr(
                  "Select desktop users to assign this role. Multi-selection enabled.",
                  "ഈ റോൾ നൽകാനായി ഉപയോക്താക്കളെ തിരഞ്ഞെടുക്കുക (ഒന്നിലധികം പേരെ തിരഞ്ഞെടുക്കാം)."
                )}
              </SheetDescription>

              <div className="relative mt-3 flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={assignUserSearch}
                    onChange={(e) => setAssignUserSearch(e.target.value)}
                    placeholder={tr(
                      "Search users by name or designation...",
                      "പേരിലോ തസ്തികയിലോ തിരയുക..."
                    )}
                    className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer",
                        drawerActiveFilterCount > 0
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{tr("Filter", "ഫിൽട്ടർ")}</span>
                      {drawerActiveFilterCount > 0 && (
                        <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                          {drawerActiveFilterCount}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-3 text-xs space-y-3 max-h-96 overflow-y-auto z-50 bg-white border border-border shadow-xl rounded-xl">
                    <div className="flex items-center justify-between pb-1.5 border-b border-border">
                      <span className="font-bold text-foreground text-xs">{tr("Filter Users", "ഉപയോക്താക്കളെ ഫിൽട്ടർ ചെയ്യുക")}</span>
                      {drawerActiveFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setDrawerSelectedDesignations([]);
                            setDrawerSelectedRegions([]);
                            setDrawerSelectedOrgDistricts([]);
                            setDrawerSelectedMandalams([]);
                            setDrawerSelectedAreas([]);
                            setDrawerSelectedBooths([]);
                          }}
                          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          {tr("Reset All", "റീസെറ്റ് ചെയ്യുക")}
                        </button>
                      )}
                    </div>

                    <FilterDropdownSelector
                      title={tr("Designation", "തസ്തിക")}
                      placeholder={tr("Select Designation", "തസ്തിക തിരഞ്ഞെടുക്കുക")}
                      options={availDesignations}
                      selectedValues={drawerSelectedDesignations}
                      onChange={setDrawerSelectedDesignations}
                      tr={tr}
                    />

                    <FilterDropdownSelector
                      title={tr("Region", "മേഖല")}
                      placeholder={tr("Select Region", "മേഖല തിരഞ്ഞെടുക്കുക")}
                      options={availRegions}
                      selectedValues={drawerSelectedRegions}
                      onChange={setDrawerSelectedRegions}
                      tr={tr}
                    />

                    <FilterDropdownSelector
                      title={tr("Org District", "സംഘടനാ ജില്ല")}
                      placeholder={tr("Select Org District", "സംഘടനാ ജില്ല തിരഞ്ഞെടുക്കുക")}
                      options={availOrgDistricts}
                      selectedValues={drawerSelectedOrgDistricts}
                      onChange={setDrawerSelectedOrgDistricts}
                      tr={tr}
                    />

                    <FilterDropdownSelector
                      title={tr("Mandalam", "മണ്ഡലം")}
                      placeholder={tr("Select Mandalam", "മണ്ഡലം തിരഞ്ഞെടുക്കുക")}
                      options={availMandalams}
                      selectedValues={drawerSelectedMandalams}
                      onChange={setDrawerSelectedMandalams}
                      tr={tr}
                    />

                    <FilterDropdownSelector
                      title={tr("Area", "ഏരിയ")}
                      placeholder={tr("Select Area", "ഏരിയ തിരഞ്ഞെടുക്കുക")}
                      options={availAreas}
                      selectedValues={drawerSelectedAreas}
                      onChange={setDrawerSelectedAreas}
                      tr={tr}
                    />

                    <FilterDropdownSelector
                      title={tr("Booth", "ബൂത്ത്")}
                      placeholder={tr("Select Booth", "ബൂത്ത് തിരഞ്ഞെടുക്കുക")}
                      options={availBooths}
                      selectedValues={drawerSelectedBooths}
                      onChange={setDrawerSelectedBooths}
                      tr={tr}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SheetHeader>

            <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-border text-xs shrink-0">
              <span className="font-semibold text-muted-foreground">
                {tr(
                  `${selectedAssignUserIds.size} of ${filteredAssignableUsers.length} users selected`,
                  `${selectedAssignUserIds.size} / ${filteredAssignableUsers.length} ഉപയോക്താക്കൾ`
                )}
              </span>
              <button
                type="button"
                onClick={handleToggleSelectAllUsers}
                className="text-primary font-bold hover:underline cursor-pointer text-xs"
              >
                {selectedAssignUserIds.size === filteredAssignableUsers.length
                  ? tr("Deselect All", "എല്ലാം ഒഴിവാക്കുക")
                  : tr("Select All", "എല്ലാം തിരഞ്ഞെടുക്കുക")}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
              {filteredAssignableUsers.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  {tr("No matching users found.", "ഉപയോക്താക്കളെ കണ്ടെത്തിയില്ല.")}
                </div>
              ) : (
                filteredAssignableUsers.map((user) => {
                  const isChecked = selectedAssignUserIds.has(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleSelectUser(user.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                        isChecked
                          ? "border-primary/50 bg-white shadow-2xs ring-1 ring-primary/20"
                          : "border-border/60 bg-white hover:bg-slate-50/60"
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                        className="pointer-events-none"
                      />
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-foreground truncate">
                          {lang === "ml" ? user.nameMl || user.name : user.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {lang === "ml" ? user.roleMl || user.role : user.role}
                          {user.location && (
                            <span className="text-muted-foreground/80 font-medium">
                              {" • "}
                              {user.location}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-border bg-white flex items-center justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAssignDrawerOpen(false)}
                className="h-9 px-3.5 text-xs font-semibold cursor-pointer bg-white"
              >
                {tr("Skip", "ഒഴിവാക്കുക")}
              </Button>
              <Button
                type="button"
                onClick={handleConfirmAssign}
                disabled={selectedAssignUserIds.size === 0}
                className="h-9 px-4 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                {tr("Assign & Save", "അസൈൻ ചെയ്ത് സേവ് ചെയ്യുക")}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Right Side Popup Sheet for Manage Columns */}
        <Sheet open={isManageColumnsOpen} onOpenChange={setIsManageColumnsOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full p-0 gap-0 bg-white border-l border-border z-50">
            <SheetHeader className="p-5 border-b border-border bg-white text-left space-y-1">
              <SheetTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Columns3 className="h-5 w-5 text-primary" />
                <span>{tr("Manage Columns", "കോളങ്ങൾ കൈകാര്യം ചെയ്യുക")}</span>
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {tr(
                  "Check to show or hide columns. Drag handle to reorder columns in the table.",
                  "കോളങ്ങൾ കാണിക്കുക / മറയ്ക്കുക. പട്ടികയിലെ കോളങ്ങളുടെ ക്രമം മാറ്റാൻ ഡ്രാഗ് ചെയ്യുക."
                )}
              </SheetDescription>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  {tr(
                    `${visibleColumns.size} of ${APPLICATION_COLUMNS.length} visible`,
                    `${visibleColumns.size} / ${APPLICATION_COLUMNS.length} കാണിക്കുന്നു`
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setVisibleColumns(new Set(APPLICATION_COLUMNS.map((c) => c.key)));
                    setColumnOrder(APPLICATION_COLUMNS.map((c) => c.key));
                  }}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {tr("Show All", "എല്ലാം കാണിക്കുക")}
                </button>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {columnOrder.map((colKey, index) => {
                const meta = APPLICATION_COLUMNS.find((c) => c.key === colKey);
                if (!meta) return null;
                const isChecked = visibleColumns.has(colKey);
                return (
                  <div
                    key={colKey}
                    draggable
                    onDragStart={() => handleDragStartColumn(index)}
                    onDragOver={handleDragOverColumn}
                    onDrop={(e) => handleDropColumn(e, index)}
                    className={`flex items-center gap-3 rounded-xl border border-border/70 p-3 text-xs bg-white transition-all hover:border-primary/40 hover:shadow-2xs ${
                      draggedColumnIndex === index ? "opacity-40 bg-muted" : ""
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />
                    <Checkbox
                      id={`sheet-col-app-${colKey}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleColumn(colKey)}
                    />
                    <label
                      htmlFor={`sheet-col-app-${colKey}`}
                      className="flex-1 text-xs font-bold text-foreground cursor-pointer select-none truncate"
                    >
                      {lang === "ml" ? meta.ml : meta.en}
                    </label>
                  </div>
                );
              })}
            </div>

            <SheetFooter className="p-4 border-t border-border bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <Button
                type="button"
                onClick={() => setIsManageColumnsOpen(false)}
                className="w-full sm:w-auto h-9 px-5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                {tr("Done", "ശരി")}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Sticky Floating Plus Button */}
      <div className="fixed bottom-6 right-5 z-50 sm:hidden">
        <Link
          to="/admin/applications/new"
          search={{ stage: undefined, filter: undefined }}
          className="flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
          aria-label={lang === "ml" ? "പുതിയ അപേക്ഷ" : "New Application"}
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
