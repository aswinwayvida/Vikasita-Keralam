import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  FileCheck2,
  FileText,
  Upload,
  Phone,
  MapPin,
  Save,
  Clock,
  Send,
  Clock3,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminApplications } from "@/data/admin-applications";
import { schemes } from "@/data/schemes";
import { districts, getDistrictName } from "@/data/geo";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/applications_/$applicationId_/verify")({
  head: () => ({ meta: [{ title: "Verify Documents · Admin" }] }),
  component: DocumentVerificationPage,
});

const schemeLogoFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ea580c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l5 5v11a2 2 0 01-2 2z'/%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M14 2v4a2 2 0 002 2h4'/%3E%3C/svg%3E";

const schemeLogoUrls: Record<string, string> = {
  pmkisan: "/images/popular-schemes/pm_kisan.png",
  pmjjby: "/images/popular-schemes/pmjjby.png",
  pmsby: "/images/popular-schemes/pmsby.png",
  apy: "/images/popular-schemes/atal_pension.png",
  pmay: "/images/popular-schemes/pm_awas.png",
  ujjwala: "/images/popular-schemes/pm_ujjwala.png",
  mudra: "/images/popular-schemes/mudra.png",
  pmjay: "/images/popular-schemes/pm_jay.png",
  standup: "/images/popular-schemes/stand_up_india.png",
  pmmvy: "/images/popular-schemes/pm_matru_vandana.png",
  midday: "/images/popular-schemes/mid_day_meal.png",
  pmkvy: "/images/popular-schemes/pmkvy.png",
  pm_kisan: "/images/popular-schemes/pm_kisan.png",
  pm_jay: "/images/popular-schemes/pm_jay.png",
  pm_ujjwala: "/images/popular-schemes/pm_ujjwala.png",
  pm_awas: "/images/popular-schemes/pm_awas.png",
};

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

const enToMlNames: Record<string, string> = {
  Ramesh: "രമേശ്",
  Sandhya: "സന്ധ്യ",
  Anil: "അനിൽ",
  Latha: "ലത",
  Suresh: "സുരേഷ്",
  Deepa: "ദീപ",
  Biju: "ബിജു",
  Sreelatha: "ശ്രീലത",
  Jayan: "ജയൻ",
  Nithya: "നിത്യ",
  Vinod: "വിനോദ്",
  Kumar: "കുമാർ",
  Nair: "നായർ",
  Menon: "മേനോൻ",
  Joseph: "ജോസഫ്",
};

function getApplicantDisplayName(rawName: string, lang: "en" | "ml"): string {
  if (!rawName) return lang === "ml" ? "രമേശ് കുമാർ" : "Ramesh Kumar";
  const parts = rawName.trim().split(/\s+/);
  if (lang === "en") {
    return parts.map((part) => mlToEnNames[part] || part).join(" ");
  } else {
    return parts.map((part) => enToMlNames[part] || part).join(" ");
  }
}

function DesktopStatusBadge({
  status,
  onStatusChange,
}: {
  status: string;
  onStatusChange: (newStatus: string) => void;
}) {
  const statusConfig: Record<string, { bg: string; icon: any }> = {
    Received: { bg: "bg-sky-500/10 text-sky-600 border-sky-500/20", icon: Clock },
    "Document Verified": { bg: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: FileCheck2 },
    Applied: { bg: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Send },
    Submitted: { bg: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", icon: Send },
    "In Review": { bg: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock3 },
    Approved: { bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
    Rejected: { bg: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
    Pending: { bg: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: Clock },
  };

  const config = statusConfig[status] || statusConfig["Received"];
  const Icon = config.icon;

  const statuses = [
    "Received",
    "Document Verified",
    "Applied",
    "Submitted",
    "In Review",
    "Approved",
    "Rejected",
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

interface VerificationDocument {
  id: string;
  nameEn: string;
  nameMl: string;
  isUploaded: boolean;
  fileName?: string;
  fileSize?: string;
  status: "verified" | "pending" | "rejected" | "needs_reupload";
  remarks?: string;
}

export function DocumentVerificationPage() {
  const { applicationId } = Route.useParams();
  const { lang } = useLang();
  const navigate = useNavigate();

  const application = useMemo(() => {
    return adminApplications.find((item) => item.id === applicationId) || adminApplications[0];
  }, [applicationId]);

  const scheme = useMemo(() => {
    return schemes.find((item) => item.id === application?.schemeId);
  }, [application]);

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

  const [appStatus, setAppStatus] = useState<string>(() =>
    application ? mapInitialStatus(application.queueStage) : "Received"
  );

  const applicantDisplayName = useMemo(() => {
    return getApplicantDisplayName(application?.applicant || "Ramesh Kumar", lang);
  }, [application?.applicant, lang]);

  // Form Field States
  const [applicantName, setApplicantName] = useState(applicantDisplayName);
  const [mobileNumber, setMobileNumber] = useState(application?.mobile || "9400000000");
  const [aadhaarNumber, setAadhaarNumber] = useState("882390124512");
  const [dob, setDob] = useState("1988-05-14");
  const [annualIncome, setAnnualIncome] = useState("75000");
  const [district, setDistrict] = useState(application?.districtId || "tvm");
  const [taluk, setTaluk] = useState(lang === "ml" ? "തൃശ്ശൂർ" : "Thrissur");
  const [revenueVillage, setRevenueVillage] = useState(lang === "ml" ? "നല്ലേപ്പിള്ളി" : "Nallepilly");
  const [surveyNumber, setSurveyNumber] = useState("218/14-B");
  const [thandaperNumber, setThandaperNumber] = useState("TP-4521/2024");
  const [landArea, setLandArea] = useState(lang === "ml" ? "1.25 ഏക്കർ" : "1.25 Acres");
  const [bankName, setBankName] = useState(lang === "ml" ? "സ്റ്റേറ്റ് ബാങ്ക് ഓഫ് ഇന്ത്യ" : "State Bank of India");
  const [accountHolderName, setAccountHolderName] = useState(applicantDisplayName);
  const [accountNumber, setAccountNumber] = useState("482910394812");
  const [ifscCode, setIfscCode] = useState("SBIN0001234");

  // Keep applicant input synchronized with language toggle unless modified
  useEffect(() => {
    setApplicantName(getApplicantDisplayName(application?.applicant || "Ramesh Kumar", lang));
    setAccountHolderName(getApplicantDisplayName(application?.applicant || "Ramesh Kumar", lang));
    if (lang === "ml") {
      setTaluk("തൃശ്ശൂർ");
      setRevenueVillage("നല്ലേപ്പിള്ളി");
      setLandArea("1.25 ഏക്കർ");
      setBankName("സ്റ്റേറ്റ് ബാങ്ക് ഓഫ് ഇന്ത്യ");
    } else {
      setTaluk("Thrissur");
      setRevenueVillage("Nallepilly");
      setLandArea("1.25 Acres");
      setBankName("State Bank of India");
    }
  }, [lang, application?.applicant]);

  // Documents State
  const [documents, setDocuments] = useState<VerificationDocument[]>([
    {
      id: "doc-1",
      nameEn: "Ration Card / Family Proof",
      nameMl: "റേഷൻ കാർഡ് / കുടുംബ തെളിവ്",
      isUploaded: true,
      fileName: "Ration_Card_Ramesh.pdf",
      fileSize: "1.2 MB",
      status: "verified",
      remarks: lang === "ml" ? "രേഖ സാധുവാണ്." : "Document valid and clear.",
    },
    {
      id: "doc-2",
      nameEn: "Agricultural Land Ownership Record",
      nameMl: "കാർഷിക ഭൂമിയുടെ ഉടമസ്ഥാവകാശ രേഖ",
      isUploaded: true,
      fileName: "Agricultural_Land_Ownership.pdf",
      fileSize: "1.8 MB",
      status: "verified",
      remarks: lang === "ml" ? "തണ്ടപ്പേര് റവന്യൂ റെക്കോർഡുമായി ഒത്തുപോകുന്നു." : "Thandaper matches revenue record.",
    },
    {
      id: "doc-3",
      nameEn: "Latest Land Tax Receipt",
      nameMl: "ഏറ്റവും പുതിയ ഭൂനികുതി രസീത്",
      isUploaded: true,
      fileName: "Latest_Land_Tax_Receipt.pdf",
      fileSize: "820 KB",
      status: "verified",
      remarks: lang === "ml" ? "നടപ്പ് സാമ്പത്തിക വർഷത്തെ നികുതി അടച്ചു." : "Tax paid up to current financial year.",
    },
    {
      id: "doc-4",
      nameEn: "Thandaper / Revenue Record",
      nameMl: "തണ്ടപ്പേര് / റവന്യൂ രേഖ",
      isUploaded: true,
      fileName: "Thandaper_Revenue_Record.pdf",
      fileSize: "640 KB",
      status: "verified",
    },
    {
      id: "doc-5",
      nameEn: "Bank Passbook – Relevant Details Page",
      nameMl: "ബാങ്ക് പാസ്ബുക്ക് - വിവരങ്ങൾ അടങ്ങിയ പേജ്",
      isUploaded: true,
      fileName: "Bank_Passbook_Page.pdf",
      fileSize: "1.1 MB",
      status: "verified",
      remarks: lang === "ml" ? "അക്കൗണ്ട് നമ്പറും IFSC കോഡും വ്യക്തമാണ്." : "Account number and IFSC clearly visible.",
    },
    {
      id: "doc-6",
      nameEn: "Aadhaar Card",
      nameMl: "ആധാർ കാർഡ്",
      isUploaded: true,
      fileName: "Aadhaar_Card.pdf",
      fileSize: "420 KB",
      status: "verified",
    },
    {
      id: "doc-7",
      nameEn: "Farmer ID / Farmer Registry Proof",
      nameMl: "കർഷക ഐഡി / രജിസ്ട്രി തെളിവ്",
      isUploaded: true,
      fileName: "Farmer_ID_Registry_Proof.pdf",
      fileSize: "780 KB",
      status: "pending",
      remarks: lang === "ml" ? "കൃഷിഭവൻ പരിശോധനയിലാണ്." : "Verification pending with Krishi Bhavan.",
    },
    {
      id: "doc-8",
      nameEn: "Additional Land Verification Document",
      nameMl: "അധിക ഭൂമി പരിശോധനാ രേഖ",
      isUploaded: true,
      fileName: "Land_Verification_Doc.pdf",
      fileSize: "1.4 MB",
      status: "pending",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            isUploaded: true,
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            status: "pending",
          };
        }
        return doc;
      })
    );

    toast.success(
      lang === "ml"
        ? `${file.name} അപ്‌ലോഡ് ചെയ്തു`
        : `${file.name} uploaded successfully`
    );
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            isUploaded: false,
            fileName: undefined,
            fileSize: undefined,
            status: "pending",
          };
        }
        return doc;
      })
    );
    toast.info(
      lang === "ml" ? "രേഖ നീക്കം ചെയ്തു" : "Document removed"
    );
  };

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        lang === "ml"
          ? "അപേക്ഷാ വിവരങ്ങളും രേഖാ പരിശോധനയും വിജയകരമായി സേവ് ചെയ്തു!"
          : "Application details and document verifications saved successfully!"
      );
      navigate({ to: `/admin/applications/${applicationId}` });
    }, 600);
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Desktop Top Navigation Bar (Identical style to Application Details page) */}
      <section className="hidden sm:block sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/admin/applications/${applicationId}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary cursor-pointer"
              title={lang === "ml" ? "അപേക്ഷാ വിവരങ്ങളിലേക്ക് തിരികെ പോകുക" : "Back to Application Details"}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                {lang === "ml" ? "രേഖാ പരിശോധന" : "Verify Documents"}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 sm:hidden border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5">
          <Link
            to={`/admin/applications/${applicationId}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-base font-bold text-foreground">
              {lang === "ml" ? "രേഖാ പരിശോധന" : "Verify Documents"}
            </h1>
            <p className="text-[11px] text-muted-foreground font-mono">{application.reference}</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
        >
          {lang === "ml" ? "സേവ്" : "Save"}
        </Button>
      </div>

      {/* Applicant Banner Summary Card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 border border-orange-200/60 font-display text-lg font-black uppercase shadow-2xs">
              {applicantName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-foreground tracking-tight">
                  {applicantName}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground font-semibold">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  {mobileNumber}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {getDistrictName(district, lang)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-border shadow-2xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 border border-border p-1">
              <img
                src={schemeLogoUrls[application.schemeId] ?? schemeLogoFallback}
                alt={scheme?.[lang] ?? application.schemeId}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = schemeLogoFallback;
                }}
              />
            </div>
            <div>
              <p className="font-display text-xs font-bold text-foreground leading-tight">
                {scheme?.[lang] ?? application.schemeId}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {scheme?.ministry?.[lang] ?? scheme?.category ?? "Ministry / Department"}
              </p>
            </div>
            <div className="pl-2.5 border-l border-border/70 shrink-0">
              <DesktopStatusBadge status={appStatus} onStatusChange={setAppStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Application Details (Left Column) & Attached Documents & Verification (Right Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Consolidated Application Details Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <FileText className="h-5 w-5 text-orange-600" />
              <h3 className="font-display text-base font-extrabold text-foreground">
                {lang === "ml" ? "അപേക്ഷാ വിവരങ്ങൾ" : "Application Details"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personal Details Subsection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "അപേക്ഷകന്റെ പേര്" : "Applicant / Landowner Name"}
                </label>
                <Input
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "ഫോൺ നമ്പർ" : "Mobile Number"}
                </label>
                <Input
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "ആധാർ നമ്പർ" : "Aadhaar Number"}
                </label>
                <Input
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "ജനനത്തീയതി" : "Date of Birth"}
                </label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "വാർഷിക വരുമാനം (₹)" : "Annual Income (₹)"}
                </label>
                <Input
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  className="bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              {/* Location & Land Subsection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "ജില്ല" : "District"}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-md border border-input bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d[lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "താലൂക്ക്" : "Taluk"}
                </label>
                <Input
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "വില്ലേജ്" : "Revenue Village"}
                </label>
                <Input
                  value={revenueVillage}
                  onChange={(e) => setRevenueVillage(e.target.value)}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "സർവേ നമ്പർ" : "Survey / Re-survey Number"}
                </label>
                <Input
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  className="bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "തണ്ടപ്പേര് നമ്പർ" : "Thandaper / Land Account Number"}
                </label>
                <Input
                  value={thandaperNumber}
                  onChange={(e) => setThandaperNumber(e.target.value)}
                  className="bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "ആകെ ഭൂമി വിസ്തീർണ്ണം" : "Total Agricultural Land Area"}
                </label>
                <Input
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              {/* Bank Details Subsection */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "ബാങ്കിന്റെ പേര്" : "Bank Name"}
                </label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "അക്കൗണ്ട് ഉടമയുടെ പേര്" : "Account Holder Name"}
                </label>
                <Input
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "അക്കൗണ്ട് നമ്പർ" : "Account Number"}
                </label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "IFSC കോഡ്" : "IFSC Code"}
                </label>
                <Input
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="bg-white dark:bg-slate-900 font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attached Documents Upload */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-border bg-white dark:bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-orange-600" />
                <h3 className="font-display text-base font-extrabold text-foreground">
                  {lang === "ml" ? "അറ്റാച്ച് ചെയ്ത രേഖകളും പരിശോധനയും" : "Attached Documents & Verification"}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200">
                {documents.filter((d) => d.isUploaded).length} / {documents.length}{" "}
                {lang === "ml" ? "അപ്‌ലോഡ് ചെയ്തു" : "Uploaded"}
              </span>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 p-3.5 shadow-2xs hover:border-orange-300/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-display text-xs font-bold text-foreground">
                          {doc[lang === "ml" ? "nameMl" : "nameEn"]}
                        </p>
                        {doc.isUploaded && (
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {doc.fileName} ({doc.fileSize})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* File Upload Input Button */}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-100 shadow-2xs">
                        <Upload className="h-3.5 w-3.5 text-orange-600" />
                        <span>{doc.isUploaded ? (lang === "ml" ? "മാറ്റുക" : "Replace") : (lang === "ml" ? "അപ്‌ലോഡ്" : "Upload")}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(doc.id, e)}
                        />
                      </label>

                      {/* Delete Icon Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white dark:bg-slate-800 text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-2xs cursor-pointer"
                        title={lang === "ml" ? "രേഖ നീക്കം ചെയ്യുക" : "Delete document"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Fixed Bottom Action Bar (Sticks to bottom of viewport when scrolling) */}
      <div className="hidden sm:flex sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3.5 px-6 border-t border-border/80 shadow-lg sm:-mx-6 -mb-20 items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate({ to: `/admin/applications/${applicationId}` })}
          className="cursor-pointer font-semibold px-5 bg-card hover:bg-muted"
        >
          {lang === "ml" ? "റദ്ദാക്കുക" : "Cancel"}
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer shadow-md px-6"
        >
          <Save className="h-4 w-4" />
          {isSubmitting
            ? lang === "ml"
              ? "സേവ് ചെയ്യുന്നു..."
              : "Saving..."
            : lang === "ml"
              ? "സേവ് ചെയ്ത് പൂർത്തിയാക്കുക"
              : "Save & Complete Verification"}
        </Button>
      </div>
    </div>
  );
}
