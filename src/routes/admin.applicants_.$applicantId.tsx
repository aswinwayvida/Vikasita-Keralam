import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
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
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function ApplicantProfileDetailsPage() {
  const { applicantId } = Route.useParams();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [showAadhaar, setShowAadhaar] = useState(false);

  const profile = mockApplicantProfiles[applicantId] ?? {
    ...defaultApplicantFallback,
    id: applicantId || defaultApplicantFallback.id,
  };

  const approvedCount = profile.applications.filter((a) => a.status === "Approved").length;
  const pendingCount = profile.applications.filter((a) => a.status === "Pending" || a.status === "In Review").length;
  const rejectedCount = profile.applications.filter((a) => a.status === "Rejected").length;

  const maskedAadhaar = profile.aadhaarNumber
    ? `•••• •••• ${profile.aadhaarNumber.slice(-4)}`
    : "N/A";

  const formattedAadhaar = profile.aadhaarNumber
    ? profile.aadhaarNumber.replace(/(\d{4})/g, "$1 ").trim()
    : "N/A";

  return (
    <div className="pb-10 text-foreground w-full">
      {/* Top Header Navigation */}
      <section className="sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/beneficiaries"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary"
              title={lang === "ml" ? "അപേക്ഷകരുടെ പട്ടികയിലേക്ക് തിരികെ പോകുക" : "Back to Applicants"}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-bold tracking-tight">
                  {lang === "ml" ? "അപേക്ഷകന്റെ വിവരങ്ങൾ" : "Applicant Profile Details"}
                </h1>
                <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {profile.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info(lang === "ml" ? "പ്രൊഫൈൽ ഡൗൺലോഡ് ചെയ്യുന്നു..." : "Exporting applicant profile...")}
              className="h-8 rounded-xl text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {lang === "ml" ? "എക്സ്പോർട്ട്" : "Export Profile"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-8 rounded-xl text-xs font-semibold"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              {lang === "ml" ? "പ്രിന്റ്" : "Print"}
            </Button>
            <Button
              size="sm"
              onClick={() => navigate({ to: "/admin/applications/new" })}
              className="h-8 rounded-xl text-xs font-bold bg-primary text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {lang === "ml" ? "പുതിയ അപേക്ഷ" : "New Application"}
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {/* Profile Banner & Metric Header Card */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display text-2xl font-black uppercase shadow-inner">
                {profile.fullName.slice(0, 2)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight">
                    {profile.fullName}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-extrabold ${
                      profile.status === "Verified"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : profile.status === "Active"
                        ? "border-blue-500/20 bg-blue-500/10 text-blue-600"
                        : "border-amber-500/20 bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    <BadgeCheck className="h-3 w-3" />
                    {profile.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-semibold">
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

            {/* Counts Summary Bar */}
            <div className="flex items-center gap-3 bg-muted/40 px-4 py-2.5 rounded-xl border border-border/60 self-start sm:self-auto">
              <div className="text-center px-1">
                <p className="font-display text-lg font-extrabold text-foreground leading-none">
                  {profile.applications.length}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                  {lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}
                </p>
              </div>
              <div className="h-6 w-px bg-border/60" />
              <div className="text-center px-1">
                <p className="font-display text-lg font-extrabold text-emerald-600 leading-none">
                  {approvedCount}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                  {lang === "ml" ? "അംഗീകരിച്ചു" : "Approved"}
                </p>
              </div>
              <div className="h-6 w-px bg-border/60" />
              <div className="text-center px-1">
                <p className="font-display text-lg font-extrabold text-amber-600 leading-none">
                  {pendingCount}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                  {lang === "ml" ? "അവലോകനത്തിൽ" : "Pending"}
                </p>
              </div>
              <div className="h-6 w-px bg-border/60" />
              <div className="text-center px-1">
                <p className="font-display text-lg font-extrabold text-rose-600 leading-none">
                  {rejectedCount}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                  {lang === "ml" ? "നിരസിച്ചു" : "Rejected"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Registration Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "ml" ? "സൃഷ്ടിച്ചത്" : "Created By"}
              </span>
              <p className="font-semibold text-foreground mt-0.5">{profile.createdBy}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "ml" ? "രജിസ്ട്രേഷൻ തീയതി" : "Registration Date"}
              </span>
              <p className="font-semibold text-foreground mt-0.5">{profile.createdAt}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "ml" ? "അവസാന അപ്ഡേറ്റ്" : "Last Updated"}
              </span>
              <p className="font-semibold text-foreground mt-0.5">{profile.lastUpdated}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "ml" ? "ഓ ടി പി സ്റ്റാറ്റസ്" : "OTP Status"}
              </span>
              <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Left (Personal Info & Demographics), Right (Address & Location Details) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Personal Information */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-foreground">
                  {lang === "ml" ? "വ്യക്തിഗത വിവരങ്ങൾ" : "Personal Information"}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {lang === "ml" ? "അപേക്ഷകന്റെ വ്യക്തിഗത വിവരങ്ങൾ" : "Personal details and demographics collected"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ProfileField label={lang === "ml" ? "പൂർണ്ണമായ പേര്" : "Full Name"} value={profile.fullName} />
              <ProfileField label={lang === "ml" ? "മൊബൈൽ നമ്പർ" : "Mobile Number"} value={profile.mobile} />
              <ProfileField
                label={lang === "ml" ? "ജനന തീയതി & പ്രായം" : "Date of Birth & Age"}
                value={`${profile.dob} (${profile.age} Yrs)`}
              />
              <ProfileField label={lang === "ml" ? "ലിംഗഭേദം" : "Gender"} value={profile.gender} />
              <ProfileField label={lang === "ml" ? "വൈവാഹിക നില" : "Marital Status"} value={profile.maritalStatus} />
              <ProfileField label={lang === "ml" ? "മതം" : "Religion"} value={profile.religion} />
              <ProfileField label={lang === "ml" ? "ജാതി / സോഷ്യൽ കാറ്റഗറി" : "Caste / Social Category"} value={profile.caste} />
              <ProfileField label={lang === "ml" ? "തൊഴിൽ" : "Occupation"} value={profile.occupation} />
              <ProfileField label={lang === "ml" ? "വാർഷിക വരുമാനം" : "Annual Family Income"} value={profile.annualIncome} />
              
              {/* Aadhaar Field with Mask / Unmask Toggle */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[.1em] text-muted-foreground">
                    {lang === "ml" ? "ആധാർ നമ്പർ" : "Aadhaar Number"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAadhaar(!showAadhaar)}
                    className="text-muted-foreground hover:text-primary text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showAadhaar ? (
                      <>
                        <EyeOff className="h-3 w-3" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" /> Show
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 font-mono text-sm font-bold text-foreground">
                  {showAadhaar ? formattedAadhaar : maskedAadhaar}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location Details */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-foreground">
                  {lang === "ml" ? "മേൽവിലാസവും സ്ഥലവിവരങ്ങളും" : "Address & Location Details"}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {lang === "ml" ? "താമസസ്ഥലവും തദ്ദേശ സ്വയംഭരണ വിവരങ്ങളും" : "Residential address and administrative boundaries"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ProfileField label={lang === "ml" ? "വീട്ടു നമ്പർ / നമ്പർ" : "House No / Door No"} value={profile.houseNo} />
              <ProfileField label={lang === "ml" ? "വീടിന്റെ പേര്" : "House Name"} value={profile.houseName} />
              <ProfileField label={lang === "ml" ? "തെരുവ് / സ്ഥലം" : "Street / Locality"} value={profile.streetLocality} />
              <ProfileField label={lang === "ml" ? "പിൻകോഡ്" : "PIN Code"} value={profile.pinCode} />
              <ProfileField label={lang === "ml" ? "പോസ്റ്റ് ഓഫീസ്" : "Post Office"} value={profile.postOffice} />
              <ProfileField label={lang === "ml" ? "ജില്ല" : "District"} value={profile.district} />
              <ProfileField label={lang === "ml" ? "തദ്ദേശ സ്ഥാപന തരം" : "Local Body Type"} value={profile.localBodyType} />
              <ProfileField label={lang === "ml" ? "തദ്ദേശ സ്ഥാപനം" : "Local Body Name"} value={profile.localBody} />
              <ProfileField label={lang === "ml" ? "വാർഡ് നമ്പർ" : "Ward Number"} value={profile.ward} />
              <ProfileField label={lang === "ml" ? "നിയമസഭാ മണ്ഡലം" : "Assembly Mandalam"} value={profile.assemblyMandalam} />
            </div>
          </div>
        </div>

        {/* Section 3: Applications & Enrolled Schemes */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-foreground">
                  {lang === "ml" ? "അപേക്ഷിച്ച പദ്ധതികൾ" : "Applied Schemes & History"}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {lang === "ml" ? "അപേക്ഷകന്റെ നിലവിലെ പദ്ധതി അപേക്ഷകൾ" : "Schemes enrolled by this applicant and current approval status"}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              {profile.applications.length} {lang === "ml" ? "പദ്ധതികൾ" : "Enrolled"}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3.5 py-2.5"># Application ID</th>
                  <th className="px-3.5 py-2.5">{lang === "ml" ? "പദ്ധതിയുടെ പേര്" : "Scheme Name"}</th>
                  <th className="px-3.5 py-2.5">{lang === "ml" ? "വിഭാഗം" : "Category"}</th>
                  <th className="px-3.5 py-2.5">{lang === "ml" ? "ആനുകൂല്യം" : "Benefit"}</th>
                  <th className="px-3.5 py-2.5">{lang === "ml" ? "സമർപ്പിച്ച തീയതി" : "Submitted Date"}</th>
                  <th className="px-3.5 py-2.5">{lang === "ml" ? "സ്റ്റാറ്റസ്" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {profile.applications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3.5 py-3 font-mono font-bold text-primary">{app.id}</td>
                    <td className="px-3.5 py-3 font-bold text-foreground">{app.schemeName}</td>
                    <td className="px-3.5 py-3 font-medium text-muted-foreground">{app.category}</td>
                    <td className="px-3.5 py-3 font-semibold text-foreground">{app.benefit}</td>
                    <td className="px-3.5 py-3 text-muted-foreground">{app.submittedDate}</td>
                    <td className="px-3.5 py-3">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[.1em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value || "N/A"}</p>
    </div>
  );
}
