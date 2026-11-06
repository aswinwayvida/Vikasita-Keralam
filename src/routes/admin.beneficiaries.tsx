import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { useAdminTopSearch } from "@/lib/admin-search-store";
import {
  HeartHandshake,
  Clock3,
  FileText,
  Users,
  Filter,
  Download,
  Upload,
  UserRoundCheck,
  MessageCircle,
  Mail,
  Columns3,
  GripVertical,
  MoreVertical,
  Eye,
  Pencil,
  RefreshCw,
  UserCheck,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export type BeneficiaryColumnKey =
  | "applicantName"
  | "district"
  | "mandalam"
  | "applications"
  | "approved"
  | "rejected"
  | "pending"
  | "createdBy"
  | "status"
  | "actions";

const BENEFICIARY_COLUMNS: { key: BeneficiaryColumnKey; en: string; ml: string }[] = [
  { key: "applicantName", en: "Applicant Name", ml: "അപേക്ഷകന്റെ പേര്" },
  { key: "district", en: "District", ml: "ജില്ല" },
  { key: "mandalam", en: "Mandalam", ml: "മണ്ഡലം" },
  { key: "applications", en: "Applications", ml: "അപേക്ഷകൾ" },
  { key: "approved", en: "Approved", ml: "അംഗീകരിച്ചവ" },
  { key: "rejected", en: "Rejected", ml: "നിരസിച്ചവ" },
  { key: "pending", en: "Pending", ml: "തീർപ്പുകൽപ്പിക്കാത്തവ" },
  { key: "createdBy", en: "Created By", ml: "സൃഷ്ടിച്ചത്" },
  { key: "status", en: "Status", ml: "സ്റ്റാറ്റസ്" },
  { key: "actions", en: "Actions", ml: "നടപടികൾ" },
];

export const Route = createFileRoute("/admin/beneficiaries")({
  head: () => ({ meta: [{ title: "Applicants List · Admin" }] }),
  component: BeneficiariesPage,
});

export interface BeneficiaryApplicant {
  id: string;
  applicantName: string;
  district: string;
  mandalam?: string;
  applicationsCount: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  createdBy: string;
  status: "Active" | "Verified" | "Pending" | "In Review";
  mobile?: string;
}

const mockBeneficiaries: BeneficiaryApplicant[] = [
  { id: "BEN-8921", applicantName: "Soman P", district: "Thiruvananthapuram", mandalam: "Nemom", applicationsCount: 5, approvedCount: 3, rejectedCount: 1, pendingCount: 1, createdBy: "District desk", status: "Active", mobile: "+91 98470 12345" },
  { id: "BEN-8922", applicantName: "Lakshmi Amma", district: "Thiruvananthapuram", mandalam: "Vattiyoorkavu", applicationsCount: 4, approvedCount: 4, rejectedCount: 0, pendingCount: 0, createdBy: "Anitha K.", status: "Verified", mobile: "+91 94471 23456" },
  { id: "BEN-8923", applicantName: "Abdul Rahman", district: "Kollam", mandalam: "Kollam", applicationsCount: 6, approvedCount: 2, rejectedCount: 2, pendingCount: 2, createdBy: "Rahul M.", status: "In Review", mobile: "+91 97452 34567" },
  { id: "BEN-8924", applicantName: "Sunitha Kumari", district: "Kottayam", mandalam: "Kottayam", applicationsCount: 3, approvedCount: 2, rejectedCount: 0, pendingCount: 1, createdBy: "Nithya S.", status: "Active", mobile: "+91 98953 45678" },
  { id: "BEN-8925", applicantName: "K. Krishnan", district: "Palakkad", mandalam: "Palakkad", applicationsCount: 7, approvedCount: 5, rejectedCount: 1, pendingCount: 1, createdBy: "Citizen Self", status: "Verified", mobile: "+91 94004 56789" },
  { id: "BEN-8926", applicantName: "Ananya Ramesh", district: "Ernakulam", mandalam: "Ernakulam", applicationsCount: 2, approvedCount: 1, rejectedCount: 0, pendingCount: 1, createdBy: "Support Admin", status: "Pending", mobile: "+91 98465 67890" },
  { id: "BEN-8927", applicantName: "Joseph K", district: "Kollam", mandalam: "Chathannoor", applicationsCount: 4, approvedCount: 3, rejectedCount: 1, pendingCount: 0, createdBy: "District desk", status: "Verified", mobile: "+91 94466 78901" },
  { id: "BEN-8928", applicantName: "Radhamani V", district: "Thiruvananthapuram", mandalam: "Kazhakoottam", applicationsCount: 3, approvedCount: 2, rejectedCount: 0, pendingCount: 1, createdBy: "Anitha K.", status: "Active", mobile: "+91 97477 89012" },
];

const availableReviewers = [
  "District desk",
  "Anitha K.",
  "Rahul M.",
  "Nithya S.",
  "Support Admin",
  "Citizen Self",
];

const availableStatuses: BeneficiaryApplicant["status"][] = [
  "Active",
  "Verified",
  "In Review",
  "Pending",
];

function BeneficiariesPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [beneficiariesList, setBeneficiariesList] = useState<BeneficiaryApplicant[]>(mockBeneficiaries);
  const [editingApplicant, setEditingApplicant] = useState<BeneficiaryApplicant | null>(null);
  const [viewingApplicant, setViewingApplicant] = useState<BeneficiaryApplicant | null>(null);
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return "table";
    }
    return "cards";
  });
  const [visibleColumns, setVisibleColumns] = useState<Set<BeneficiaryColumnKey>>(
    () => new Set(BENEFICIARY_COLUMNS.map((c) => c.key)),
  );
  const [columnOrder, setColumnOrder] = useState<BeneficiaryColumnKey[]>(() =>
    BENEFICIARY_COLUMNS.map((c) => c.key),
  );
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);

  const toggleColumn = (key: BeneficiaryColumnKey) => {
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

  const handleDeleteRecord = (id: string) => {
    setBeneficiariesList((prev) => prev.filter((item) => item.id !== id));
    toast.success(lang === "ml" ? "അപേക്ഷകന്റെ വിവരങ്ങൾ നീക്കം ചെയ്തു." : "Applicant profile deleted successfully.");
  };

  const handleBulkExport = () => {
    toast.success(
      lang === "ml"
        ? `${selectedIds.size} അപേക്ഷകരുടെ വിവരങ്ങൾ എക്സ്പോർട്ട് ചെയ്തു.`
        : `Exported ${selectedIds.size} selected applicant profile(s).`
    );
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    setBeneficiariesList((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    toast.success(
      lang === "ml"
        ? `${count} അപേക്ഷകരുടെ വിവരങ്ങൾ നീക്കം ചെയ്തു.`
        : `Deleted ${count} selected applicant profile(s).`
    );
  };

  const handleUpdateStatus = (id: string, newStatus: BeneficiaryApplicant["status"]) => {
    setBeneficiariesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success(
      lang === "ml"
        ? `സ്റ്റാറ്റസ് '${newStatus}' എന്ന് മാറ്റി.`
        : `Status updated to '${newStatus}'.`
    );
  };

  const handleAssignUser = (id: string, newUser: string) => {
    setBeneficiariesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, createdBy: newUser } : item))
    );
    toast.success(
      lang === "ml"
        ? `'${newUser}' ബാധ്യസ്ഥനാക്കി അസൈൻ ചെയ്തു.`
        : `Assigned applicant profile to ${newUser}.`
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewMode(window.innerWidth >= 768 ? "table" : "cards");
    }
  }, []);

  const topSearchQuery = useAdminTopSearch();

  const filteredBeneficiaries = beneficiariesList.filter((b) => {
    const q = topSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      b.applicantName.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.district.toLowerCase().includes(q) ||
      b.createdBy.toLowerCase().includes(q)
    );
  });

  function toggleSelectAll() {
    if (selectedIds.size === filteredBeneficiaries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBeneficiaries.map((r) => r.id)));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Merged Single Section Container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        
        {/* Top Header Row with Filter & Create New Applicant Buttons on the Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 p-4 sm:p-5">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {lang === "ml" ? "അപേക്ഷകരുടെ പട്ടിക" : "Applicants List"}
            </h2>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5 max-w-full sm:ml-auto shrink-0">
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
                      setVisibleColumns(new Set(BENEFICIARY_COLUMNS.map((c) => c.key)));
                      setColumnOrder(BENEFICIARY_COLUMNS.map((c) => c.key));
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
                    const meta = BENEFICIARY_COLUMNS.find((c) => c.key === colKey);
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
                          id={`col-ben-${colKey}`}
                          checked={isChecked}
                          onCheckedChange={() => toggleColumn(colKey)}
                        />
                        <label
                          htmlFor={`col-ben-${colKey}`}
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

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-8 rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
            >
              <option value="today">{lang === "ml" ? "ഇന്ന്" : "Today"}</option>
              <option value="7days">{lang === "ml" ? "7 ദിവസങ്ങൾ" : "7 Days"}</option>
              <option value="30days">{lang === "ml" ? "30 ദിവസങ്ങൾ" : "30 Days"}</option>
              <option value="60days">{lang === "ml" ? "60 ദിവസങ്ങൾ" : "60 Days"}</option>
              <option value="1year">{lang === "ml" ? "1 വർഷം" : "1 Year"}</option>
              <option value="all">{lang === "ml" ? "എല്ലാ സമയവും" : "All Time"}</option>
            </select>

            <button className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shrink-0">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {lang === "ml" ? "ഫിൽട്ടറുകൾ" : "Filter"}
            </button>

            {/* Create New Applicant Button */}
            <Button
              type="button"
              onClick={() => navigate({ to: "/admin/applications/new" })}
              className="h-8 rounded-xl px-3 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{lang === "ml" ? "പുതിയ അപേക്ഷകൻ" : "Create New Applicant"}</span>
            </Button>

            {/* 3-Dot More Actions Dropdown for Export & Import */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                  title={lang === "ml" ? "കൂടുതൽ നടപടികൾ" : "More Actions"}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 p-1 space-y-0.5 shadow-xl border-border">
                <DropdownMenuItem
                  onClick={() => toast.info(lang === "ml" ? "ഡാറ്റ എക്സ്പോർട്ട് ചെയ്യുന്നു..." : "Exporting data...")}
                  className="cursor-pointer text-xs font-semibold"
                >
                  <Download className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  {lang === "ml" ? "എക്സ്പോർട്ട്" : "Export"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast.info(lang === "ml" ? "ഡാറ്റ ഇമ്പോർട്ട് ചെയ്യുന്നു..." : "Importing data...")}
                  className="cursor-pointer text-xs font-semibold"
                >
                  <Upload className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  {lang === "ml" ? "ഇമ്പോർട്ട്" : "Import"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Selected Beneficiaries Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border/80 bg-primary/[0.06] px-4 py-2.5 sm:px-5">
            <span className="mr-1 text-xs font-bold text-foreground">
              {lang === "ml"
                ? `${selectedIds.size} / ${filteredBeneficiaries.length} തിരഞ്ഞെടുത്തു`
                : `${selectedIds.size} of ${filteredBeneficiaries.length} selected`}
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

        {/* Data Table View */}
        <div className="overflow-x-auto desktop-hide-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3.5 pl-4 sm:pl-5 pr-2 w-10 text-center">
                  <Checkbox
                    checked={selectedIds.size === filteredBeneficiaries.length && filteredBeneficiaries.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all applicants"
                  />
                </th>
                {columnOrder.map((colKey) => {
                  if (!visibleColumns.has(colKey)) return null;
                  const meta = BENEFICIARY_COLUMNS.find((c) => c.key === colKey);
                  if (!meta) return null;
                  return (
                    <th
                      key={colKey}
                      className={`p-3 ${colKey === "applications" || colKey === "approved" || colKey === "rejected" || colKey === "pending" || colKey === "actions" ? "text-center" : ""}`}
                    >
                      {lang === "ml" ? meta.ml : meta.en.toUpperCase()}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-semibold">
              {filteredBeneficiaries.map((b) => {
                const isSelected = selectedIds.has(b.id);
                return (
                  <tr
                    key={b.id}
                    className={`hover:bg-muted/40 transition-colors ${
                      isSelected ? "bg-primary/[0.04]" : ""
                    }`}
                  >
                    <td className="py-3 pl-4 sm:pl-5 pr-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectOne(b.id)}
                        aria-label={`Select applicant ${b.applicantName}`}
                      />
                    </td>
                    {columnOrder.map((colKey) => {
                      if (!visibleColumns.has(colKey)) return null;
                      switch (colKey) {
                        case "applicantName":
                          return (
                            <td key="applicantName" className="p-3">
                              <p className="font-bold text-foreground">{b.applicantName}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">{b.mobile || b.id}</p>
                            </td>
                          );
                        case "district":
                          return <td key="district" className="p-3 text-muted-foreground">{b.district}</td>;
                        case "mandalam":
                          return <td key="mandalam" className="p-3 text-muted-foreground">{b.mandalam || "—"}</td>;
                        case "applications":
                          return (
                            <td key="applications" className="p-3 text-center font-mono font-bold text-foreground">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-muted">
                                {b.applicationsCount}
                              </span>
                            </td>
                          );
                        case "approved":
                          return (
                            <td key="approved" className="p-3 text-center font-mono font-bold text-emerald-600">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10">
                                {b.approvedCount}
                              </span>
                            </td>
                          );
                        case "rejected":
                          return (
                            <td key="rejected" className="p-3 text-center font-mono font-bold text-destructive">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-destructive/10">
                                {b.rejectedCount}
                              </span>
                            </td>
                          );
                        case "pending":
                          return (
                            <td key="pending" className="p-3 text-center font-mono font-bold text-amber-600">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10">
                                {b.pendingCount}
                              </span>
                            </td>
                          );
                        case "createdBy":
                          return <td key="createdBy" className="p-3 text-muted-foreground">{b.createdBy}</td>;
                        case "status":
                          return (
                            <td key="status" className="p-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                                  b.status === "Active" || b.status === "Verified"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : b.status === "Pending"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    : "bg-sky-500/10 text-sky-600 border-sky-500/20"
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                          );
                          case "actions":
                            return (
                              <td key="actions" className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
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
                                  <DropdownMenuContent align="end" className="w-52 p-1 space-y-0.5 shadow-xl border-border">
                                    <DropdownMenuItem
                                      onClick={() => setViewingApplicant(b)}
                                      className="cursor-pointer text-xs font-semibold"
                                    >
                                      <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      {lang === "ml" ? "കാണുക" : "View"}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() => setEditingApplicant(b)}
                                      className="cursor-pointer text-xs font-semibold"
                                    >
                                      <Pencil className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      {lang === "ml" ? "തിരുത്തുക" : "Edit"}
                                    </DropdownMenuItem>

                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger className="cursor-pointer text-xs font-semibold">
                                        <RefreshCw className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                        {lang === "ml" ? "സ്റ്റാറ്റസ് മാറ്റുക" : "Change Status"}
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent className="w-48 p-1">
                                        {availableStatuses.map((st) => (
                                          <DropdownMenuItem
                                            key={st}
                                            onClick={() => handleUpdateStatus(b.id, st)}
                                            className={`cursor-pointer text-xs font-semibold ${b.status === st ? "bg-accent font-bold" : ""}`}
                                          >
                                            {st}
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
                                        {availableReviewers.map((rev) => (
                                          <DropdownMenuItem
                                            key={rev}
                                            onClick={() => handleAssignUser(b.id, rev)}
                                            className={`cursor-pointer text-xs font-semibold ${b.createdBy === rev ? "bg-accent font-bold" : ""}`}
                                          >
                                            {rev}
                                          </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => navigate({ to: "/admin/settings_/new-role", search: { returnTo: "/admin/beneficiaries" } })}
                                          className="cursor-pointer text-xs font-bold text-primary"
                                        >
                                          <Plus className="h-3.5 w-3.5 mr-2 text-primary" />
                                          {lang === "ml" ? "+ പുതിയ റോൾ സൃഷ്ടിക്കുക..." : "+ Create New Role..."}
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                      onClick={() => handleDeleteRecord(b.id)}
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

      </div>

      {/* Edit Applicant Modal */}
      {editingApplicant && (
        <Dialog open={!!editingApplicant} onOpenChange={() => setEditingApplicant(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {lang === "ml" ? "അപേക്ഷകന്റെ വിവരങ്ങൾ തിരുത്തുക" : "Edit Applicant Profile"} ({editingApplicant.id})
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  {lang === "ml" ? "അപേക്ഷകന്റെ പേര്" : "Applicant Name"}
                </label>
                <input
                  type="text"
                  value={editingApplicant.applicantName}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, applicantName: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-semibold outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">
                  {lang === "ml" ? "ജില്ല" : "District"}
                </label>
                <input
                  type="text"
                  value={editingApplicant.district}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, district: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-semibold outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">
                  {lang === "ml" ? "സ്റ്റാറ്റസ്" : "Status"}
                </label>
                <select
                  value={editingApplicant.status}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, status: e.target.value as BeneficiaryApplicant["status"] })}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-semibold outline-none focus:ring-1 focus:ring-primary"
                >
                  {availableStatuses.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">
                  {lang === "ml" ? "സൃഷ്ടിച്ചത് / അസൈൻ ചെയ്തയാൾ" : "Created By / Assigned Officer"}
                </label>
                <select
                  value={editingApplicant.createdBy}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, createdBy: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-semibold outline-none focus:ring-1 focus:ring-primary"
                >
                  {availableReviewers.map((rev) => (
                    <option key={rev} value={rev}>{rev}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingApplicant(null)}>
                {lang === "ml" ? "റദ്ദാക്കുക" : "Cancel"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setBeneficiariesList((prev) =>
                    prev.map((item) => (item.id === editingApplicant.id ? editingApplicant : item))
                  );
                  setEditingApplicant(null);
                  toast.success(lang === "ml" ? "പ്രൊഫൈൽ വിവരങ്ങൾ അപ്‌ഡേറ്റ് ചെയ്തു" : "Applicant profile updated");
                }}
              >
                {lang === "ml" ? "സേവ് ചെയ്യുക" : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Applicant Detail Modal */}
      {viewingApplicant && (
        <Dialog open={!!viewingApplicant} onOpenChange={() => setViewingApplicant(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {lang === "ml" ? "അപേക്ഷകന്റെ വിവരങ്ങൾ" : "Applicant Profile Details"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs divide-y divide-border/60">
              <div className="pb-2 flex justify-between">
                <span className="text-muted-foreground">{lang === "ml" ? "ഐഡി" : "ID"}:</span>
                <span className="font-mono font-bold">{viewingApplicant.id}</span>
              </div>
              <div className="pt-2 pb-2 flex justify-between">
                <span className="text-muted-foreground">{lang === "ml" ? "പേര്" : "Applicant Name"}:</span>
                <span className="font-bold">{viewingApplicant.applicantName}</span>
              </div>
              <div className="pt-2 pb-2 flex justify-between">
                <span className="text-muted-foreground">{lang === "ml" ? "ജില്ല" : "District"}:</span>
                <span>{viewingApplicant.district}</span>
              </div>
              <div className="pt-2 pb-2 flex justify-between">
                <span className="text-muted-foreground">{lang === "ml" ? "ഫോൺ" : "Mobile"}:</span>
                <span className="font-mono">{viewingApplicant.mobile || "N/A"}</span>
              </div>
              <div className="pt-2 pb-2 flex justify-between">
                <span className="text-muted-foreground">{lang === "ml" ? "സൃഷ്ടിച്ചത്" : "Created By"}:</span>
                <span>{viewingApplicant.createdBy}</span>
              </div>
              <div className="pt-2 pb-2 grid grid-cols-4 gap-2 text-center bg-muted/30 p-2 rounded-lg">
                <div>
                  <p className="text-[10px] text-muted-foreground">Applications</p>
                  <p className="font-bold">{viewingApplicant.applicationsCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Approved</p>
                  <p className="font-bold text-emerald-600">{viewingApplicant.approvedCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Rejected</p>
                  <p className="font-bold text-destructive">{viewingApplicant.rejectedCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                  <p className="font-bold text-amber-600">{viewingApplicant.pendingCount}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" onClick={() => setViewingApplicant(null)}>
                {lang === "ml" ? "അടയ്ക്കുക" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
