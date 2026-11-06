import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
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

  const [editingRecord, setEditingRecord] = useState<RichApplicationRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomRangeStart] = useState("");
  const [customEndDate, setCustomRangeEnd] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [visibleColumns, setVisibleColumns] = useState<Set<ApplicationColumnKey>>(
    () => new Set(APPLICATION_COLUMNS.map((c) => c.key).filter((k) => k !== "trackingId"))
  );
  const [columnOrder, setColumnOrder] = useState<ApplicationColumnKey[]>(() =>
    APPLICATION_COLUMNS.map((c) => c.key)
  );
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
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
        statusFilter === "All" ||
        record.appStatus === statusFilter ||
        record.queueStage === statusFilter;

      const districtMatch = districtFilter === "All" || record.districtId === districtFilter;

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

      let categoryMatch = true;
      if (schemeCategoryFilter !== "all") {
        const sch = schemes.find((s) => s.id === record.schemeId);
        categoryMatch = sch ? sch.category.toLowerCase() === schemeCategoryFilter.toLowerCase() : true;
      }

      return searchMatch && statusMatch && districtMatch && dateMatch && categoryMatch;
    });
  }, [applicationsList, topSearchQuery, statusFilter, districtFilter, dateFilter, schemeCategoryFilter]);

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
    (statusFilter !== "All" ? 1 : 0) +
    (districtFilter !== "All" ? 1 : 0) +
    (schemeCategoryFilter !== "all" ? 1 : 0) +
    (dateFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Merged Single Section Container */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-5">
        
        {/* Top Header Row with Title & Filter / Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {lang === "ml" ? "അപേക്ഷകളുടെ ലിസ്റ്റ്" : "Applications List"}
            </h2>
          </div>

          {/* Filter, View Mode, Columns & Actions on the Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5 max-w-full sm:ml-auto shrink-0">
            {/* View Mode Toggle Switch */}
            <div className="flex items-center rounded-xl border border-border bg-background p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={lang === "ml" ? "പട്ടിക വ്യൂ" : "Table View"}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lang === "ml" ? "പട്ടിക" : "List"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === "cards"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={lang === "ml" ? "കാർഡ് വ്യൂ" : "Card View"}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lang === "ml" ? "കാർഡ്" : "Cards"}</span>
              </button>
            </div>

            {/* Manage Columns Popover (Desktop) */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title={lang === "ml" ? "കോളങ്ങൾ ക്രമീകരിക്കുക" : "Manage columns"}
                  className="hidden md:flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
                >
                  <Columns3 className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-3 space-y-2.5 shadow-xl border-border">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <h4 className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "കോളങ്ങൾ കാണിക്കുക / മാറ്റുക" : "Manage Columns"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setVisibleColumns(new Set(APPLICATION_COLUMNS.map((c) => c.key)));
                      setColumnOrder(APPLICATION_COLUMNS.map((c) => c.key));
                    }}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    {lang === "ml" ? "എല്ലാം കാണിക്കുക" : "Show All"}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {lang === "ml"
                    ? "കോളങ്ങൾ ചെക്ക്/അൺചെക്ക് ചെയ്യുക. പൊസിഷൻ മാറ്റാൻ ഡ്രാഗ് ചെയ്യുക."
                    : "Check to show/hide. Drag handle to reorder columns."}
                </p>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
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
                        className={`flex items-center gap-2 rounded-lg p-1.5 text-xs transition-colors hover:bg-muted/60 ${
                          draggedColumnIndex === index ? "opacity-40 bg-muted" : ""
                        }`}
                      >
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />
                        <Checkbox
                          id={`col-app-${colKey}`}
                          checked={isChecked}
                          onCheckedChange={() => toggleColumn(colKey)}
                        />
                        <label
                          htmlFor={`col-app-${colKey}`}
                          className="flex-1 text-xs font-semibold text-foreground cursor-pointer select-none truncate"
                        >
                          {lang === "ml" ? meta.ml : meta.en}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Date Range Dropdown near Filter Button */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-8 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer shrink-0"
              title={lang === "ml" ? "തീയതി ക്രമീകരണം" : "Date Range"}
            >
              <option value="all">{lang === "ml" ? "എല്ലാ തീയതികളും" : "All Time"}</option>
              <option value="today">{lang === "ml" ? "ഇന്ന്" : "Today"}</option>
              <option value="week">{lang === "ml" ? "കഴിഞ്ഞ 1 ആഴ്ച" : "Last Week"}</option>
              <option value="month">{lang === "ml" ? "കഴിഞ്ഞ 1 മാസം" : "Last Month"}</option>
              <option value="6months">{lang === "ml" ? "കഴിഞ്ഞ 6 മാസം" : "Last 6 Months"}</option>
              <option value="year">{lang === "ml" ? "കഴിഞ്ഞ 1 വർഷം" : "Last Year"}</option>
            </select>

            {/* Filter Button with Dropdowns Inside Filter Popover */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                  activeFilterCount > 0 || showFilterMenu
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                {lang === "ml" ? "ഫിൽട്ടറുകൾ" : "Filter"}
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 top-full mt-2 z-30 w-72 rounded-xl border border-border bg-card p-4 shadow-lg space-y-3.5">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold text-foreground">
                      {lang === "ml" ? "അപേക്ഷ ഫിൽട്ടറുകൾ" : "Filter Applications"}
                    </h4>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => {
                          setStatusFilter("All");
                          setDistrictFilter("All");
                          setSchemeCategoryFilter("all");
                          setDateFilter("all");
                        }}
                        className="text-[11px] font-semibold text-primary hover:underline"
                      >
                        {lang === "ml" ? "റീസെറ്റ്" : "Reset all"}
                      </button>
                    )}
                  </div>

                  {/* Status / Stage Filter Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      {lang === "ml" ? "സ്റ്റാറ്റസ്" : "Status"}
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold outline-none"
                    >
                      <option value="All">{lang === "ml" ? "എല്ലാ സ്റ്റാറ്റസുകളും" : "All Statuses"}</option>
                      {applicationStatuses.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  {/* District Filter Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      {lang === "ml" ? "ജില്ല" : "District"}
                    </label>
                    <select
                      value={districtFilter}
                      onChange={(event) => setDistrictFilter(event.target.value)}
                      className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold outline-none"
                    >
                      <option value="All">{lang === "ml" ? "എല്ലാ ജില്ലകളും" : "All Districts"}</option>
                      {districts.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item[lang]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Scheme Category Filter Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      {lang === "ml" ? "പദ്ധതി വിഭാഗം" : "Scheme Category"}
                    </label>
                    <select
                      value={schemeCategoryFilter}
                      onChange={(e) => setSchemeCategoryFilter(e.target.value)}
                      className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold outline-none"
                    >
                      <option value="all">{lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories"}</option>
                      <option value="agriculture">{lang === "ml" ? "കൃഷി" : "Agriculture"}</option>
                      <option value="education">{lang === "ml" ? "വിദ്യാഭ്യാസം" : "Education"}</option>
                      <option value="health">{lang === "ml" ? "ആരോഗ്യം" : "Health"}</option>
                      <option value="housing">{lang === "ml" ? "ഭവനം" : "Housing"}</option>
                      <option value="welfare">{lang === "ml" ? "പെൻഷൻ / ക്ഷേമം" : "Pension & Welfare"}</option>
                      <option value="women">{lang === "ml" ? "വനിതാ ക്ഷേമം" : "Women Welfare"}</option>
                      <option value="employment">{lang === "ml" ? "തൊഴിൽ" : "Employment"}</option>
                      <option value="msme">{lang === "ml" ? "MSME / സംരംഭകം" : "MSME & Business"}</option>
                    </select>
                  </div>

                  {/* Application Date Filter Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      {lang === "ml" ? "അപേക്ഷാ തീയതി" : "Application Date"}
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold outline-none"
                    >
                      <option value="all">{lang === "ml" ? "എല്ലാ തീയതികളും" : "All Dates"}</option>
                      <option value="today">{lang === "ml" ? "ഇന്ന്" : "Today"}</option>
                      <option value="7days">{lang === "ml" ? "കഴിഞ്ഞ 7 ദിവസങ്ങൾ" : "Last 7 Days"}</option>
                      <option value="30days">{lang === "ml" ? "കഴിഞ്ഞ 30 ദിവസങ്ങൾ" : "Last 30 Days"}</option>
                      <option value="custom">{lang === "ml" ? "കസ്റ്റം റേഞ്ച്" : "Custom Range"}</option>
                    </select>
                    {dateFilter === "custom" && (
                      <div className="grid grid-cols-2 gap-2 pt-1.5">
                        <div>
                          <span className="text-[10px] text-muted-foreground block mb-0.5">From</span>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomRangeStart(e.target.value)}
                            className="w-full h-7 text-[11px] rounded border border-border bg-background px-1.5 font-medium"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block mb-0.5">To</span>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomRangeEnd(e.target.value)}
                            className="w-full h-7 text-[11px] rounded border border-border bg-background px-1.5 font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* New Application Button + 3-Dot Menu (Import / Export) */}
            <div className="flex items-center gap-1 shrink-0">
              <Button asChild className="hidden sm:inline-flex h-8 rounded-xl px-3.5 text-xs font-semibold shrink-0">
                <Link to="/admin/applications/new" search={{ stage: undefined, filter: undefined }}>
                  <Plus className="h-3.5 w-3.5" /> {lang === "ml" ? "പുതിയ അപേക്ഷ" : "New Application"}
                </Link>
              </Button>

              {/* 3-Dot Menu for Import & Export Near New Application Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                    title={lang === "ml" ? "കൂടുതൽ" : "Import & Export"}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 p-1 space-y-0.5 shadow-xl border-border">
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

        {/* Selected Applications Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-2.5">
            <span className="mr-1 text-xs font-bold text-foreground">
              {lang === "ml"
                ? `${selectedIds.size} / ${filtered.length} തിരഞ്ഞെടുത്തു`
                : `${selectedIds.size} of ${filtered.length} selected`}
            </span>
            <Button type="button" size="sm" variant="outline" className="cursor-pointer">
              <UserRoundCheck className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              {lang === "ml" ? "അസൈൻ ചെയ്യുക" : "Assign"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleBulkExport} className="cursor-pointer">
              <Download className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              {lang === "ml" ? "എക്സ്പോർട്ട്" : "Export"}
            </Button>
            <Button type="button" size="sm" variant="outline" className="cursor-pointer">
              <MessageCircle className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              WhatsApp
            </Button>
            <Button type="button" size="sm" variant="outline" className="cursor-pointer">
              <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              Email
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={handleBulkDelete} className="cursor-pointer">
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              {lang === "ml" ? "ഡിലീറ്റ്" : "Delete"}
            </Button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto px-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {lang === "ml" ? "ക്ലിയർ ചെയ്യുക" : "Clear"}
            </button>
          </div>
        )}

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
                                        {lang === "ml" ? "മറ്റൊരാൾക്ക് അസൈൻ ചെയ്യുക" : "Assign to Other User"}
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent className="w-56 p-1">
                                        {applicationReviewers.map((rev) => (
                                          <DropdownMenuItem
                                            key={rev}
                                            onClick={() => handleAssignUser(record.id, rev)}
                                            className={`cursor-pointer text-xs font-semibold ${record.reviewer === rev ? "bg-accent font-bold" : ""}`}
                                          >
                                            {rev}
                                          </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => navigate({ to: "/admin/settings_/new-role", search: { returnTo: "/admin/applications" } })}
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
