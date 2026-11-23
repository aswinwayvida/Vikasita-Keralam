import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  FileEdit,
  FileSpreadsheet,
  FileText,
  FileX,
  Hash,
  Heart,
  Home,
  IndianRupee,
  Landmark,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Phone,
  Send,
  ShieldCheck,
  Sprout,
  Tag,
  Trash2,
  Upload,
  User,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import {
  adminApplications,
  formatWaitingTime,
  maskEmail,
  maskPhone,
} from "@/data/admin-applications";
import { schemes } from "@/data/schemes";
import { getDistrictName } from "@/data/geo";
import { loadHelpdeskRequests, type HelpdeskRequest } from "@/lib/helpdesk-requests";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { StagePill } from "./admin.applications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const mlToEnNames: Record<string, string> = {
  രമേശ്: "Ramesh",
  സന്ധ്യ: "Sandhya",
  അനിൽ: "Anil",
  ലത: "Latha",
  സുരേഷ്: "Suresh",
  ദീപ: "Deepa",
  ബിജു: "Biju",
  ശ്രീലത: "Sreelatha",
  ജയൻ: "Jayan",
  നിത്യ: "Nithya",
  വിനോദ്: "Vinod",
  കുമാർ: "Kumar",
  നായർ: "Nair",
  മേനോൻ: "Menon",
  ജോസഫ്: "Joseph",
};

export function getApplicantDisplayName(nameStr: string, lang: "ml" | "en") {
  if (!nameStr) return "";
  if (lang === "ml") return nameStr;
  let result = nameStr;
  for (const [ml, en] of Object.entries(mlToEnNames)) {
    result = result.replaceAll(ml, en);
  }
  return result;
}

function DesktopStatusBadge({
  status,
  onStatusChange,
}: {
  status: string;
  onStatusChange: (newStatus: string) => void;
}) {
  const statusConfig: Record<string, { bg: string; icon: any }> = {
    Received: { bg: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: FileText },
    "Document Verified": { bg: "bg-teal-500/10 text-teal-600 border-teal-500/20", icon: FileCheck2 },
    Applied: { bg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", icon: Send },
    Approved: { bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
    Rejected: { bg: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
    "In Review": { bg: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock3 },
  };

  const config = statusConfig[status] || statusConfig["Received"];
  const Icon = config.icon;

  const statuses = [
    "Received",
    "Document Verified",
    "Applied",
    "Approved",
    "Rejected",
    "In Review",
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold border cursor-pointer hover:opacity-85 transition-opacity shadow-2xs",
            config.bg
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span>{status}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44 z-50">
        {statuses.map((st) => {
          const itemConfig = statusConfig[st];
          const ItemIcon = itemConfig.icon;
          return (
            <DropdownMenuItem
              key={st}
              onClick={() => onStatusChange(st)}
              className={cn(
                "cursor-pointer gap-2 py-2 font-semibold text-xs",
                status === st && "bg-muted font-bold"
              )}
            >
              <ItemIcon className="h-3.5 w-3.5" />
              <span>{st}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Route = createFileRoute("/admin/applications_/$applicationId")({
  head: () => ({ meta: [{ title: "Application details \u00b7 Admin" }] }),
  component: ApplicationDetailsPage,
});

function ApplicationDetailsPage() {
  const { applicationId } = Route.useParams();
  const { lang } = useLang();
  const application = adminApplications.find((item) => item.id === applicationId);
  const [helpdeskRequest, setHelpdeskRequest] = useState<HelpdeskRequest | undefined>();
  const mapInitialStatus = (stage: string) => {
    switch (stage) {
      case "New":
        return "Received";
      case "Checking documents":
        return "Document Verified";
      case "Ready to submit":
        return "Applied";
      case "Completed":
        return "Approved";
      case "Follow-up needed":
        return "In Review";
      default:
        return "Received";
    }
  };

  const [activeTab, setActiveTab] = useState<"details" | "files" | "applicant">("details");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [appStatus, setAppStatus] = useState<string>(() =>
    application ? mapInitialStatus(application.queueStage) : "Received"
  );

  useEffect(() => {
    setHelpdeskRequest(loadHelpdeskRequests().find((item) => item.reference === applicationId));
  }, [applicationId]);
  const scheme = schemes.find((item) => item.id === application?.schemeId);

  if (helpdeskRequest) return <HelpdeskRequestDetails request={helpdeskRequest} lang={lang} />;

  if (!application)
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-bold">Application not found</h1>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/admin/applications" search={{ stage: undefined, filter: undefined }}>Back to Applications</Link>
        </Button>
      </div>
    );

  const completedProgressByStage = {
    New: 1,
    "Checking documents": 2,
    "Ready to submit": 4,
    "Follow-up needed": 5,
    Completed: 6,
  } as const;
  const completedProgress = completedProgressByStage[application.queueStage];
  const applicantDisplayName = getApplicantDisplayName(application.applicant, lang);
  const avatarInitials = applicantDisplayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleCopy = (text: string, fieldKey: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // fallback
    }
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const detailsRows = [
    { icon: Sprout, label: "Agricultural Land Ownership", value: "Single", key: "land_ownership" },
    { icon: User, label: "Landowner Name", value: applicantDisplayName || "Ravi Kumar", key: "owner_name" },
    { icon: MapPin, label: "Land District", value: "Ollur", key: "land_district" },
    { icon: Building2, label: "Taluk", value: "Thrissur", key: "taluk" },
    { icon: Home, label: "Revenue Village", value: "Nallepilly", key: "village" },
    { icon: FileText, label: "Survey / Re-survey Number", value: "218/14-B", key: "survey_no" },
    { icon: FileSpreadsheet, label: "Thandaper / Land Account Number", value: "TP-4521/2024", key: "thandaper" },
    { icon: Layers, label: "Total Agricultural Land Area", value: "1.25 Acres", key: "land_area" },
    { icon: Calendar, label: "Date of Land Acquisition", value: "14/05/2019", key: "acquisition_date" },
    { icon: Landmark, label: "Bank Name", value: "State Bank of India", key: "bank_name" },
    { icon: User, label: "Bank Account Holder Name", value: applicantDisplayName || "Ravi Kumar", key: "acc_holder" },
    { icon: CreditCard, label: "Bank Account Number", value: "•••• •••• 4829", key: "acc_number" },
    { icon: Hash, label: "IFSC Code", value: "SBIN0070142", key: "ifsc" },
    { icon: ShieldCheck, label: "Aadhaar Authentication Status", value: "Completed (UIDAI)", key: "aadhaar_auth" },
  ];

  const filesData = [
    {
      title: "Ration Card / Family Proof",
      uploaded: false,
      fileName: null,
      size: null,
    },
    {
      title: "Agricultural Land Ownership Record",
      uploaded: true,
      fileName: "Agricultural_Land_Ownership_Record.pdf",
      size: "1.8 MB",
    },
    {
      title: "Latest Land Tax Receipt",
      uploaded: true,
      fileName: "Latest_Land_Tax_Receipt.pdf",
      size: "820 KB",
    },
    {
      title: "Thandaper / Revenue Record",
      uploaded: true,
      fileName: "Thandaper_Revenue_Record.pdf",
      size: "640 KB",
    },
    {
      title: "Bank Passbook — Relevant Details Page",
      uploaded: true,
      fileName: "Bank_Passbook_Page.png",
      size: "1.1 MB",
    },
    {
      title: "Aadhaar Card",
      uploaded: true,
      fileName: "Aadhaar_Card.pdf",
      size: "420 KB",
    },
    {
      title: "Farmer ID / Farmer Registry Proof",
      uploaded: true,
      fileName: "Farmer_ID_Registry_Proof.pdf",
      size: "780 KB",
    },
    {
      title: "Additional Land Verification Document",
      uploaded: true,
      fileName: "Land_Verification_Document.pdf",
      size: "1.4 MB",
    },
  ];

  const documents = [
    "Identity document",
    "Bank account proof",
    "Income / eligibility proof",
    "Scheme-specific declaration",
    "Applicant photograph",
  ];
  return (
    <div className="space-y-5">
      {/* Top Header Navigation (Desktop only) */}
      <section className="hidden sm:block sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5 mb-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/applications"
              search={{ stage: undefined, filter: undefined }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary"
              title={lang === "ml" ? "അപേക്ഷകളുടെ പട്ടികയിലേക്ക് തിരികെ പോകുക" : "Back to Applications"}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">
                {lang === "ml" ? "അപേക്ഷാ വിവരങ്ങൾ" : "Application Details"}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-only header layout */}
      <div className="flex flex-col gap-4 sm:hidden">
        <div>
          <Link
            to="/admin/applications"
            search={{ stage: undefined, filter: undefined }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Applications
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{application.applicant}</h1>
            <StagePill stage={application.queueStage} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {application.reference} {"\u00b7"} submitted{" "}
            {new Date(application.submittedAt).toLocaleDateString("en-IN")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <UserRoundCheck /> Assign
          </Button>
          <Button variant="outline">
            <MessageCircle /> WhatsApp
          </Button>
          <Button variant="outline">
            <Mail /> Email
          </Button>
        </div>
      </div>

      {/* Desktop-only Profile Banner Card matching Attachment 2 */}
      <div className="hidden sm:block rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 border border-orange-200/60 font-display text-xl font-extrabold uppercase shadow-2xs">
              {avatarInitials}
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-extrabold text-foreground tracking-tight">
                  {applicantDisplayName}
                </h2>
                <DesktopStatusBadge status={appStatus} onStatusChange={setAppStatus} />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-semibold">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  {application.mobile}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {getDistrictName(application.districtId, lang)}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: Scheme Info Box & 3-Dot Dropdown Action Menu */}
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-3 bg-muted/40 px-3.5 py-2 rounded-xl border border-border/60 shadow-2xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 border border-orange-200/60 font-bold">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-xs font-extrabold text-foreground leading-tight truncate max-w-[200px] sm:max-w-[240px]">
                  {scheme?.[lang] ?? application.schemeId}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 truncate max-w-[200px] sm:max-w-[240px]">
                  {scheme?.ministry[lang] ?? scheme?.category}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border border-border/80 bg-card text-foreground hover:bg-muted shadow-2xs cursor-pointer"
                  title={lang === "ml" ? "കൂടുതൽ ഓപ്ഷനുകൾ" : "More options"}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50">
                <DropdownMenuItem className="cursor-pointer gap-2.5 py-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{lang === "ml" ? "പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക" : "Edit Profile"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2.5 py-2">
                  <FileEdit className="h-4 w-4 text-muted-foreground" />
                  <span>{lang === "ml" ? "അപേക്ഷ എഡിറ്റ് ചെയ്യുക" : "Edit Application"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2.5 py-2">
                  <FileCheck2 className="h-4 w-4 text-muted-foreground" />
                  <span>{lang === "ml" ? "രേഖാ പരിശോധന പുതുക്കുക" : "Update Document Verifications"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2.5 py-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lang === "ml" ? "അപേക്ഷകനെ വിളിക്കുക" : "Call Applicant"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2.5 py-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>{lang === "ml" ? "അപേക്ഷകന് സന്ദേശം അയക്കുക" : "Message to Applicant"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2.5 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  <span>{lang === "ml" ? "ഡിലീറ്റ് ചെയ്യുക" : "Delete"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.65fr)]">
        <div className="space-y-4">
          {/* Desktop Tabs Header */}
          <div className="hidden sm:flex border-b border-border/70 mb-2 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={cn(
                "px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer",
                activeTab === "details"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {lang === "ml" ? "വിശദാംശങ്ങൾ" : "Details"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("files")}
              className={cn(
                "px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer",
                activeTab === "files"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {lang === "ml" ? "ഫയലുകൾ" : "Files"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("applicant")}
              className={cn(
                "px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer",
                activeTab === "applicant"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {lang === "ml" ? "അപേക്ഷകന്റെ വിവരങ്ങൾ" : "Applicant Details"}
            </button>
          </div>

          {/* Desktop Tab 1: Details */}
          <div className="hidden sm:block">
            {activeTab === "details" && (
              <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                <div className="divide-y divide-border/60">
                  {detailsRows.map((row) => {
                    const IconComponent = row.icon;
                    const isCopied = copiedField === row.key;
                    return (
                      <div
                        key={row.key}
                        className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <IconComponent className="h-4 w-4 shrink-0 text-orange-500" />
                          <span className="text-sm font-medium text-muted-foreground truncate">
                            {row.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <span className="text-sm font-extrabold text-foreground">
                            {row.value}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(row.value, row.key)}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="Copy value"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Desktop Tab 2: Files */}
            {activeTab === "files" && (
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-base font-bold text-foreground">
                    {lang === "ml" ? "അറ്റാച്ച് ചെയ്ത രേഖകൾ" : "Attached Documents"}
                  </h3>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {filesData.filter((f) => f.uploaded).length} / {filesData.length}{" "}
                    {lang === "ml" ? "അപ്‌ലോഡ് ചെയ്തു" : "Uploaded"}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {filesData.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-background hover:border-border transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {file.uploaded ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                        ) : (
                          <FileX className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-foreground truncate">
                            {file.title}
                          </p>
                          {file.uploaded && (
                            <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-2">
                              <span className="truncate max-w-[200px] sm:max-w-[300px]">
                                {file.fileName}
                              </span>
                              <span>•</span>
                              <span>{file.size}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 ml-3">
                        {file.uploaded ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 z-50">
                              <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{lang === "ml" ? "കാണുക" : "Preview"}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                                <Download className="h-3.5 w-3.5" />
                                <span>{lang === "ml" ? "ഡൗൺലോഡ്" : "Download"}</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer gap-2 py-2 text-destructive focus:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>{lang === "ml" ? "ഡിലീറ്റ്" : "Delete"}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-semibold gap-1.5 cursor-pointer border-primary/40 text-primary hover:bg-primary/10"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>{lang === "ml" ? "അപ്‌ലോഡ് ചെയ്യുക" : "Upload"}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Tab 3: Applicant Details */}
            {activeTab === "applicant" && (
              <div className="grid gap-4 md:grid-cols-2">
                {/* Personal Information Card */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                    <User className="h-4 w-4 text-orange-500" />
                    <h3 className="font-display text-base font-bold text-foreground">
                      {lang === "ml" ? "വ്യക്തിഗത വിവരങ്ങൾ" : "Personal Information"}
                    </h3>
                  </div>
                  <div className="divide-y divide-border/50 text-xs sm:text-sm">
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "പൂർണ്ണ നാമം" : "Full Name"}
                      </span>
                      <span className="font-extrabold text-foreground">{applicantDisplayName}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "മൊബൈൽ നമ്പർ" : "Mobile Number"}
                      </span>
                      <span className="font-extrabold text-foreground">{application.mobile}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "ജനനത്തീയതിയും വയസ്സും" : "Date of Birth & Age"}
                      </span>
                      <span className="font-extrabold text-foreground">1972-08-20 (54 Yrs)</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "ലിംഗഭേദം" : "Gender"}
                      </span>
                      <span className="font-extrabold text-foreground">Male</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "വൈവാഹിക നില" : "Marital Status"}
                      </span>
                      <span className="font-extrabold text-foreground">Married</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "മതം" : "Religion"}
                      </span>
                      <span className="font-extrabold text-foreground">Hinduism</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "ജാതി / സോഷ്യൽ വിഭാഗം" : "Caste / Social Category"}
                      </span>
                      <span className="font-extrabold text-foreground">OBC</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "തൊഴിൽ" : "Occupation"}
                      </span>
                      <span className="font-extrabold text-foreground">Agricultural Worker</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "വാർഷിക കുടുംബ വരുമാനം" : "Annual Family Income"}
                      </span>
                      <span className="font-extrabold text-foreground">₹60,000 / Year</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "ആധാർ നമ്പർ" : "Aadhaar Number"}
                      </span>
                      <div className="flex items-center gap-1.5 font-extrabold text-foreground">
                        <span>{showAadhaar ? "4829 1048 2345" : "•••• •••• 2345"}</span>
                        <button
                          type="button"
                          onClick={() => setShowAadhaar(!showAadhaar)}
                          className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showAadhaar ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address & Location Details Card */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                    <Home className="h-4 w-4 text-orange-500" />
                    <h3 className="font-display text-base font-bold text-foreground">
                      {lang === "ml" ? "വിലാസവും സ്ഥല വിവരങ്ങളും" : "Address & Location Details"}
                    </h3>
                  </div>
                  <div className="divide-y divide-border/50 text-xs sm:text-sm">
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "വീട്ടു നമ്പർ" : "House No / Door No"}
                      </span>
                      <span className="font-extrabold text-foreground">KP 4/312</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "വീടിന്റെ പേര്" : "House Name"}
                      </span>
                      <span className="font-extrabold text-foreground">Padmalayam</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "തെരുവ് / സ്ഥലം" : "Street / Locality"}
                      </span>
                      <span className="font-extrabold text-foreground">Nemom Junction</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "പിൻ കോഡ്" : "PIN Code"}
                      </span>
                      <span className="font-extrabold text-foreground">695020</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "പോസ്റ്റ് ഓഫീസ്" : "Post Office"}
                      </span>
                      <span className="font-extrabold text-foreground">Nemom PO</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "വാർഡ് നമ്പർ" : "Ward Number"}
                      </span>
                      <span className="font-extrabold text-foreground">Ward 04</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "തദ്ദേശ സ്വയംഭരണ തരം" : "Local Body Type"}
                      </span>
                      <span className="font-extrabold text-foreground">Panchayat</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "തദ്ദേശ സ്വയംഭരണ സ്ഥാപനം" : "Local Body Name"}
                      </span>
                      <span className="font-extrabold text-foreground">Nemom Grama Panchayat</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "നിയമസഭാ മണ്ഡലം" : "Assembly Mandalam"}
                      </span>
                      <span className="font-extrabold text-foreground">Nemom</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground font-medium">
                        {lang === "ml" ? "ജില്ല" : "District"}
                      </span>
                      <span className="font-extrabold text-foreground">
                        {getDistrictName(application.districtId, lang)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Only: Legacy Sections */}
          <div className="space-y-4 sm:hidden">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Applicant and contact details</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Applicant" value={applicantDisplayName} />
                <Info
                  label="Mobile"
                  value={maskPhone(application.mobile)}
                  action={
                    <a
                      href={`tel:${application.mobile}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-secondary"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                  }
                />
                <Info
                  label="Email"
                  value={maskEmail(application.email)}
                  action={
                    <a
                      href={`mailto:${application.email}`}
                      className="text-xs font-semibold text-secondary"
                    >
                      Email
                    </a>
                  }
                />
                <Info label="District" value={getDistrictName(application.districtId, lang)} />
                <Info label="Current status" value={application.queueStage} />
                <Info label="Assigned to" value={application.reviewer} />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Scheme and application details</h2>
              <div className="mt-4 rounded-xl border border-border bg-background p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
                  Scheme
                </p>
                <p className="mt-1 font-semibold">{scheme?.[lang]}</p>
                <p className="mt-1 text-xs text-muted-foreground">{scheme?.ministry[lang]}</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Info label="Eligibility result" value="Initial criteria matched" />
                <Info label="Submission route" value="Helpdesk-assisted application" />
                <Info
                  label={application.queueStage === "Completed" ? "Platform support" : "Waiting time"}
                  value={
                    application.queueStage === "Completed"
                      ? "Completed after department submission"
                      : formatWaitingTime(application.ageHours)
                  }
                />
                <Info
                  label={application.queueStage === "Completed" ? "Submission status" : "Last update"}
                  value={
                    application.queueStage === "Completed"
                      ? "Submitted to the responsible department"
                      : "Today, 10:30 AM"
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Documents</h2>
                <span className="text-sm font-semibold text-secondary">
                  {application.documentCount}/5 received
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {documents.map((name, index) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg ${index < application.documentCount ? "bg-secondary/10 text-secondary" : "bg-amber-500/10 text-amber-700"}`}
                    >
                      {index < application.documentCount ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <FileCheck2 className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-xs font-semibold">{name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {index < application.documentCount
                          ? "Received \u00b7 protected preview"
                          : "Not received"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Application progress</h2>
            <div className="mt-4 space-y-4">
              {[
                "Application received",
                "Contact verified",
                "Documents verified",
                "Ready for submission",
                "Submitted to department",
                "Platform follow-up completed",
              ].map((item, index) => {
                const isCompleted = index < completedProgress;
                return (
                  <div key={item} className="flex gap-3">
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${isCompleted ? "bg-secondary text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item}</p>
                      <p className="text-xs text-muted-foreground">
                        {isCompleted ? "Completed" : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="sm:hidden rounded-2xl border border-secondary/20 bg-secondary/[0.06] p-5">
            <div className="flex items-center gap-2 text-secondary">
              <ShieldCheck className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Protected access</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Personal information stays masked in the list. Opening protected documents is
              recorded.
            </p>
          </section>
          <section className="sm:hidden rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Internal note</h2>
            <textarea
              className="mt-3 min-h-28 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              placeholder="Add a note for the team"
            />
            <Button className="mt-3 w-full">Save note</Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function HelpdeskRequestDetails({ request, lang }: { request: HelpdeskRequest; lang: "ml" | "en" }) {
  const scheme = schemes.find((item) => item.id === request.schemeId);
  return (
    <div className="space-y-5">
      {/* Top Header Navigation (Desktop only) */}
      <section className="hidden sm:block sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5 mb-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/applications"
              search={{ stage: undefined, filter: undefined }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary"
              title={lang === "ml" ? "അപേക്ഷകളുടെ പട്ടികയിലേക്ക് തിരികെ പോകുക" : "Back to Applications"}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">
                {lang === "ml" ? "അപേക്ഷാ വിവരങ്ങൾ" : "Application Details"}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-only back link */}
      <Link
        to="/admin/applications"
        search={{ stage: undefined, filter: undefined }}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground sm:hidden"
      >
        <ArrowLeft className="h-4 w-4" /> Applications
      </Link>
      <div className="rounded-2xl border border-primary/20 bg-saffron-soft/25 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">Public helpdesk request</p>
        <h1 className="mt-2 font-display text-2xl font-bold">{request.applicant}</h1>
        <p className="mt-1 font-mono text-sm">{request.reference}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          This request has been prepared for helpdesk review. It does not mean an application was submitted on an official government portal.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Request and routing</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info label="Scheme" value={scheme?.[lang] ?? request.schemeId} />
            <Info label="Assigned helpdesk" value={request.helpdeskName} />
            <Info label="District" value={getDistrictName(request.district, lang)} />
            <Info label="Mobile" value={request.mobile} />
            <Info label="Email" value={request.email ?? "Not provided"} />
            <Info label="Received" value={new Date(request.createdAt).toLocaleString("en-IN")} />
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Document checklist</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Check the documents listed by the applicant and follow up on missing items.
          </p>
          <div className="mt-4 space-y-2">
            {request.documents.map((document) => (
              <div key={document.label} className="rounded-xl border border-green/20 bg-green-soft/25 p-3">
                <p className="text-sm font-semibold">{document.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{document.fileName} · selected by applicant</p>
              </div>
            ))}
            {request.missingDocuments.map((label) => (
              <div key={label} className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-amber-700">Missing · follow up with applicant</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/55 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{value}</p>
        {action}
      </div>
    </div>
  );
}
