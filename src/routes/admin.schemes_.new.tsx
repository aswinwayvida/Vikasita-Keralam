import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Upload,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Gift,
  Globe,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/schemes_/new")({
  head: () => ({
    meta: [
      { title: "Create Scheme · Admin · Vikasita Keralam" },
      { name: "description", content: "Create a new government scheme on Vikasita Keralam." },
    ],
  }),
  component: CreateSchemePage,
});

interface RequiredDocItem {
  id: string;
  name: string;
  isRequired: boolean;
}

export function CreateSchemePage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const { state: sidebarState, isMobile: sidebarIsMobile } = useSidebar();

  // Active step state for form navigation
  const [activeStep, setActiveStep] = useState<number>(1);

  // Modal for unsaved changes
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  // Form State
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Section 1: Basic Information
  const [schemeName, setSchemeName] = useState("");
  const [schemeCode, setSchemeCode] = useState("");
  const [category, setCategory] = useState("");
  const [govLevel, setGovLevel] = useState<"State" | "Central">("State");
  const [department, setDepartment] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [logoFileName, setLogoFileName] = useState("");

  // Section 2: Eligibility
  const [selectedBeneficiaryGroups, setSelectedBeneficiaryGroups] = useState<string[]>([]);
  const [genderEligibility, setGenderEligibility] = useState("All");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [incomeLimit, setIncomeLimit] = useState("");
  const [occupationCategory, setOccupationCategory] = useState("");
  const [residenceRequirement, setResidenceRequirement] = useState("Resident of Kerala");
  const [specialConditions, setSpecialConditions] = useState("");
  const [exclusionConditions, setExclusionConditions] = useState("");

  // Geography Support (Cascading)
  const [locationSupport, setLocationSupport] = useState<"all" | "specific">("all");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMandalam, setSelectedMandalam] = useState("");
  const [selectedBooth, setSelectedBooth] = useState("");
  const [coverageAreas, setCoverageAreas] = useState<Array<{ district: string; mandalam?: string; booth?: string }>>([]);

  const mandalamOptionsMap: Record<string, string[]> = {
    Thiruvananthapuram: ["Kazhakkoottam", "Vattiyoorkavu", "Nemom"],
    Kollam: ["Chathannoor", "Kottarakkara"],
    Ernakulam: ["Ernakulam Central", "Aluva"],
    Kozhikode: ["Kozhikode North", "Kozhikode South"],
  };

  const boothOptionsMap: Record<string, string[]> = {
    Kazhakkoottam: ["Booth #12 - Govt HSS", "Booth #13 - Library Hall"],
    Vattiyoorkavu: ["Booth #14 - Panchayat Office"],
    Nemom: ["Booth #01 - Town Hall"],
  };

  const handleAddCoverageArea = () => {
    if (!selectedDistrict) return;
    setCoverageAreas([
      ...coverageAreas,
      { district: selectedDistrict, mandalam: selectedMandalam, booth: selectedBooth },
    ]);
    setSelectedDistrict("");
    setSelectedMandalam("");
    setSelectedBooth("");
    setIsDirty(true);
  };

  const handleRemoveCoverageArea = (idx: number) => {
    setCoverageAreas(coverageAreas.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  // Section 3: Benefits
  const [benefitType, setBenefitType] = useState("");
  const [benefitAmount, setBenefitAmount] = useState("");
  const [benefitFrequency, setBenefitFrequency] = useState("Monthly");
  const [benefitDescription, setBenefitDescription] = useState("");

  // Section 4: Application
  const [appMode, setAppMode] = useState<"Online" | "Offline" | "Both">("Both");
  const [appUrl, setAppUrl] = useState("");
  const [appOffice, setAppOffice] = useState("");
  const [startDate, setAppStartDate] = useState("");
  const [endDate, setAppEndDate] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [helpdeskEmail, setHelpdeskEmail] = useState("");
  const [howToApply, setHowToApply] = useState("");
  const [processingTime, setProcessingTime] = useState("");

  // Section 5: Required Documents
  const [documents, setDocuments] = useState<RequiredDocItem[]>([
    { id: "1", name: "Aadhaar Card", isRequired: true },
    { id: "2", name: "Income Certificate", isRequired: true },
    { id: "3", name: "Bank Passbook", isRequired: false },
  ]);
  const [newDocName, setNewDocName] = useState("");
  const [newDocRequired, setNewDocRequired] = useState(true);

  // Section 6: Documents & Publish
  const [officialWebsite, setOfficialWebsite] = useState("");
  const [sameAsAppUrl, setSameAsAppUrl] = useState(false);
  const [notificationNo, setNotificationNo] = useState("");
  const [notificationDate, setNotificationDate] = useState("");
  const [guidelinesPdfName, setGuidelinesPdfName] = useState("");
  const [appFormPdfName, setAppFormPdfName] = useState("");
  const [otherAttachmentsName, setOtherAttachmentsName] = useState("");
  const [status, setSchemeStatus] = useState<"Active" | "Draft">("Active");
  const [isFeatured, setIsFeatured] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");

  // Mark form as modified
  const handleInputChange = () => {
    if (!isDirty) setIsDirty(true);
  };

  // Back Navigation handler
  const handleBackNavigation = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      navigate({ to: "/admin/schemes" });
    }
  };

  // Document row actions
  const handleAddDocument = () => {
    if (!newDocName.trim()) return;
    setDocuments([
      ...documents,
      { id: Date.now().toString(), name: newDocName.trim(), isRequired: newDocRequired },
    ]);
    setNewDocName("");
    setNewDocRequired(true);
    setIsDirty(true);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    setIsDirty(true);
  };

  // Beneficiary Checkbox Group toggle
  const toggleBeneficiaryGroup = (group: string) => {
    setIsDirty(true);
    if (selectedBeneficiaryGroups.includes(group)) {
      setSelectedBeneficiaryGroups(selectedBeneficiaryGroups.filter((g) => g !== group));
    } else {
      setSelectedBeneficiaryGroups([...selectedBeneficiaryGroups, group]);
    }
  };

  // Validation Check
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!schemeName.trim()) {
      newErrors.schemeName = lang === "ml" ? "പദ്ധതിയുടെ പേര് ആവശ്യമാണ്" : "Scheme name is required";
    }
    if (!category) {
      newErrors.category = lang === "ml" ? "പദ്ധതി വിഭാഗം തിരഞ്ഞെടുക്കുക" : "Scheme category is required";
    }
    if (!department.trim()) {
      newErrors.department = lang === "ml" ? "വകുപ്പ് / മന്ത്രാലയം ആവശ്യമാണ്" : "Department / Ministry is required";
    }
    if (!benefitType) {
      newErrors.benefitType = lang === "ml" ? "ആനുകൂല്യ തരം തിരഞ്ഞെടുക്കുക" : "Benefit type is required";
    }

    if (appMode === "Online" || appMode === "Both") {
      if (!appUrl.trim()) {
        newErrors.appUrl = lang === "ml" ? "അപേക്ഷാ ലിങ്ക് (URL) നൽകുക" : "Application URL is required for online mode";
      }
    }
    if (appMode === "Offline" || appMode === "Both") {
      if (!appOffice.trim()) {
        newErrors.appOffice = lang === "ml" ? "അപേക്ഷിക്കേണ്ട ഓഫീസ് നൽകുക" : "Application office location is required for offline mode";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save / Create handler
  const handleSubmit = (targetStatus: "Active" | "Draft") => {
    if (targetStatus === "Active" && !validateForm()) {
      toast.error(lang === "ml" ? "ദയവായി വിട്ടുപോയ നിർബന്ധിത വിവരങ്ങൾ പൂരിപ്പിക്കുക" : "Please fill all required fields before creating the scheme.");
      setActiveStep(1); // Jump to first step with errors
      return;
    }

    toast.success(
      targetStatus === "Active"
        ? lang === "ml"
          ? "പുതിയ പദ്ധതി വിജയകരമായി സൃഷ്ടിച്ചു!"
          : "Scheme successfully created and published!"
        : lang === "ml"
        ? "പദ്ധതി ഡ്രാഫ്റ്റായി സൂക്ഷിച്ചു!"
        : "Scheme saved as draft!"
    );

    setIsDirty(false);
    navigate({ to: "/admin/schemes" });
  };

  const steps = [
    { id: 1, name: lang === "ml" ? "അടിസ്ഥാന വിവരങ്ങൾ" : "Basic Information", icon: FileText },
    { id: 2, name: lang === "ml" ? "യോഗ്യതയും ആനുകൂല്യങ്ങളും" : "Eligibility & Benefits", icon: ShieldCheck },
    { id: 3, name: lang === "ml" ? "അപേക്ഷ പ്രക്രിയ" : "Application Process", icon: Globe },
    { id: 4, name: lang === "ml" ? "രേഖകളും പ്രസിദ്ധീകരണവും" : "Documents & Publishing", icon: Sparkles },
  ];

  const beneficiaryOptions = [
    "Senior Citizens",
    "Farmers",
    "Women & Girls",
    "Students",
    "Below Poverty Line (BPL)",
    "Differently Abled (PwD)",
    "Unemployed Youth",
    "Artisans & Weavers",
  ];

  const districtOptions = ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"];
  const mandalamOptions = ["Kazhakkoottam", "Vattiyoorkavu", "Nemom", "Chathannoor", "Kottarakkara", "Ernakulam Central", "Aluva"];
  const boothOptions = ["Booth #12 - Govt HSS", "Booth #13 - Library Hall", "Booth #14 - Panchayat Office"];

  return (
    <div className="space-y-4 pb-24 text-foreground w-full">
      {/* Compact Industrial Header Navigation */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackNavigation}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-border bg-card text-foreground hover:bg-muted hover:text-primary transition-all shadow-2xs group cursor-pointer"
            title={lang === "ml" ? "പദ്ധതി പട്ടികയിലേക്ക് തിരികെ പോകുക" : "Back to Schemes"}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <span>{lang === "ml" ? "പുതിയ പദ്ധതി സൃഷ്ടിക്കുക" : "Create Scheme"}</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Industrial-Grade Stepper Navigation Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-2 sm:p-2.5 shadow-2xs">
        {/* Desktop Step Indicator */}
        <div className="hidden sm:flex items-center justify-between gap-1.5">
          {steps.map((step, idx) => {
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;

            return (
              <div key={step.id} className="flex-1 flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/30 shadow-2xs font-bold"
                      : isCompleted
                      ? "text-foreground hover:bg-muted/60"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
                  </span>
                  <span className="truncate leading-tight text-xs sm:text-[13px]">{step.name}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-border/80 shrink-0 mx-0.5 hidden lg:block" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Compact Step Scrollable Pill Navigation */}
        <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto no-scrollbar p-0.5">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-[10px] opacity-90">#{step.id}</span>
                <span>{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Industrial Standard Form Card Container */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-xs space-y-6">
        
        {/* ========================================================================= */}
        {/* SECTION 1: BASIC INFORMATION                                              */}
        {/* ========================================================================= */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-border/80 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                {lang === "ml" ? "വിഭാഗം 1 — അടിസ്ഥാന വിവരങ്ങൾ" : "Section 1 — Basic Information"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {lang === "ml"
                  ? "പദ്ധതിയുടെ പേര്, വകുപ്പ്, വിവരണം, ലോഗോ എന്നിവ നൽകുക."
                  : "Enter core scheme metadata, department details, descriptions, and scheme emblem."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
              {/* Row 1: Scheme Name (2 cols) + Government Level (1 col) */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>{lang === "ml" ? "പദ്ധതിയുടെ പേര്" : "Scheme Name"}</span>
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={schemeName}
                  onChange={(e) => {
                    setSchemeName(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. PM-KISAN Samman Nidhi / Karunya Health Insurance"
                  className={`h-11 w-full rounded-xl border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors ${
                    errors.schemeName ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.schemeName && <p className="text-[11px] font-semibold text-destructive">{errors.schemeName}</p>}
              </div>

              {/* Government Level (1 col) */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>{lang === "ml" ? "സർക്കാർ തലം" : "Government Level"}</span>
                  <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-3 h-11 border border-border bg-background rounded-xl px-3.5">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="radio"
                      name="govLevel"
                      value="State"
                      checked={govLevel === "State"}
                      onChange={() => {
                        setGovLevel("State");
                        handleInputChange();
                      }}
                      className="accent-primary h-4 w-4"
                    />
                    {lang === "ml" ? "സംസ്ഥാനം" : "State"}
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="radio"
                      name="govLevel"
                      value="Central"
                      checked={govLevel === "Central"}
                      onChange={() => {
                        setGovLevel("Central");
                        handleInputChange();
                      }}
                      className="accent-primary h-4 w-4"
                    />
                    {lang === "ml" ? "കേന്ദ്രം" : "Central"}
                  </label>
                </div>
              </div>

              {/* Row 2: 3 Inputs in one row -> Scheme Short Name, Category, Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "പദ്ധതി കോഡ് / ചുരുക്കപ്പേര്" : "Scheme Short Name / Code"}
                </label>
                <input
                  type="text"
                  value={schemeCode}
                  onChange={(e) => {
                    setSchemeCode(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. PMKISAN / KHIS"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>{lang === "ml" ? "പദ്ധതി വിഭാഗം" : "Scheme Category"}</span>
                  <span className="text-destructive">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    handleInputChange();
                  }}
                  className={`h-11 w-full rounded-xl border bg-background px-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors cursor-pointer ${
                    errors.category ? "border-destructive" : "border-border"
                  }`}
                >
                  <option value="">{lang === "ml" ? "-- വിഭാഗം തിരഞ്ഞെടുക്കുക --" : "-- Select Category --"}</option>
                  <option value="Pension">Pension & Social Security</option>
                  <option value="Health & Medical">Health & Medical Assistance</option>
                  <option value="Agriculture & Farming">Agriculture & Farming</option>
                  <option value="Education & Scholarship">Education & Scholarship</option>
                  <option value="Housing & Infrastructure">Housing & Infrastructure</option>
                  <option value="Women & Child Welfare">Women & Child Welfare</option>
                  <option value="Employment & Skill">Employment & Skill Development</option>
                  <option value="Other">Other Assistance</option>
                </select>
                {errors.category && <p className="text-[11px] font-semibold text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>{lang === "ml" ? "വകുപ്പ് / മന്ത്രാലയം" : "Department / Ministry"}</span>
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. Dept of Agriculture"
                  className={`h-11 w-full rounded-xl border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors ${
                    errors.department ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.department && <p className="text-[11px] font-semibold text-destructive">{errors.department}</p>}
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "വിശദമായ വിവരണം" : "Detailed Description"}
                </label>
                <textarea
                  rows={3}
                  value={detailedDescription}
                  onChange={(e) => {
                    setDetailedDescription(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="Complete objective, scope, and target guidelines of the scheme..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Scheme Image / Logo Upload Box */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "പദ്ധതി ലോഗോ / ചിത്രം" : "Scheme Image / Logo"}
                </label>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border/90 bg-background hover:bg-muted/20 p-4 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {logoFileName || (lang === "ml" ? "പദ്ധതി ചിത്രം അപ്‌ലോഡ് ചെയ്യുക (PNG, JPG, max 2MB)" : "Upload scheme emblem/logo (PNG, JPG, max 2MB)")}
                      </p>
                      <span className="text-[11px] text-muted-foreground block">Dimensions 400x400px recommended</span>
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shrink-0 shadow-2xs">
                    <span>{lang === "ml" ? "തിരഞ്ഞെടുക്കുക" : "Browse"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setLogoFileName(e.target.files[0].name);
                          handleInputChange();
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: ELIGIBILITY & BENEFITS                                         */}
        {/* ========================================================================= */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-border/80 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                {lang === "ml" ? "വിഭാഗം 2 — യോഗ്യതയും ആനുകൂല്യങ്ങളും" : "Section 2 — Eligibility & Benefits"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {lang === "ml"
                  ? "യോഗ്യതാ മാനദണ്ഡങ്ങൾ, ഗുണഭോക്താക്കൾ, ഭൂമിശാസ്ത്ര തലം, ആനുകൂല്യ വിവരങ്ങൾ നൽകുക."
                  : "Define applicant criteria, target groups, geographical coverage, and scheme benefit structure."}
              </p>
            </div>

            <div className="space-y-5">
              {/* Target Beneficiary Groups */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  {lang === "ml" ? "ഗുണഭോക്തൃ ഗ്രൂപ്പുകൾ (Beneficiary Groups)" : "Target Beneficiary Groups"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {beneficiaryOptions.map((group) => {
                    const isSelected = selectedBeneficiaryGroups.includes(group);
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => toggleBeneficiaryGroup(group)}
                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        {group}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gender, Age, Income */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "ലിംഗഭേദം" : "Gender Eligibility"}
                  </label>
                  <select
                    value={genderEligibility}
                    onChange={(e) => {
                      setGenderEligibility(e.target.value);
                      handleInputChange();
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="All">All Genders</option>
                    <option value="Female Only">Female Only</option>
                    <option value="Male Only">Male Only</option>
                    <option value="Transgender Included">Transgender Included</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "കുറഞ്ഞ പ്രായം" : "Minimum Age (Years)"}
                  </label>
                  <input
                    type="number"
                    value={minAge}
                    onChange={(e) => {
                      setMinAge(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. 18"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "കൂടിയ പ്രായം" : "Maximum Age (Years)"}
                  </label>
                  <input
                    type="number"
                    value={maxAge}
                    onChange={(e) => {
                      setMaxAge(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. 60 (Leave blank if no limit)"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "വരുമാന പരിധി (₹/വര്‍ഷം)" : "Income Limit (₹ / Year)"}
                  </label>
                  <input
                    type="text"
                    value={incomeLimit}
                    onChange={(e) => {
                      setIncomeLimit(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. ₹1,00,000 / No Limit"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Occupation & Residence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "തൊഴിൽ / വിഭാഗം" : "Occupation / Category"}
                  </label>
                  <input
                    type="text"
                    value={occupationCategory}
                    onChange={(e) => {
                      setOccupationCategory(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. Small Farmer, Traditional Craftsman"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "താമസ യോഗ്യത" : "Residence Requirement"}
                  </label>
                  <input
                    type="text"
                    value={residenceRequirement}
                    onChange={(e) => {
                      setResidenceRequirement(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. Permanent Resident of Kerala"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Hierarchy-based Location Support */}
              <div className="space-y-3 pt-3 border-t border-border/70">
                <label className="text-xs font-bold text-foreground block">
                  {lang === "ml" ? "ഭൂമിശാസ്ത്ര പിന്തുണ (Geographic Coverage)" : "Geographical Coverage"}
                </label>
                <div className="flex items-center gap-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="radio"
                      name="locationSupport"
                      value="all"
                      checked={locationSupport === "all"}
                      onChange={() => {
                        setLocationSupport("all");
                        handleInputChange();
                      }}
                      className="accent-primary h-4 w-4"
                    />
                    {lang === "ml" ? "എല്ലാ ജില്ലകൾക്കും ബാധകം" : "All Districts Across State"}
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="radio"
                      name="locationSupport"
                      value="specific"
                      checked={locationSupport === "specific"}
                      onChange={() => {
                        setLocationSupport("specific");
                        handleInputChange();
                      }}
                      className="accent-primary h-4 w-4"
                    />
                    {lang === "ml" ? "പ്രത്യേക മേഖലകൾ തിരഞ്ഞെടുക്കുക (Specific Areas)" : "Specific Districts / Mandalam / Booth"}
                  </label>
                </div>

                {/* Specific Location Selection Cascade */}
                {locationSupport === "specific" && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">District</label>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setSelectedMandalam("");
                            setSelectedBooth("");
                            handleInputChange();
                          }}
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                        >
                          <option value="">All Districts</option>
                          {districtOptions.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">Mandalam / Constituency</label>
                        <select
                          value={selectedMandalam}
                          onChange={(e) => {
                            setSelectedMandalam(e.target.value);
                            setSelectedBooth("");
                            handleInputChange();
                          }}
                          disabled={!selectedDistrict}
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="">All Mandalams</option>
                          {selectedDistrict &&
                            mandalamOptionsMap[selectedDistrict]?.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">Polling Booth / Ward</label>
                        <select
                          value={selectedBooth}
                          onChange={(e) => {
                            setSelectedBooth(e.target.value);
                            handleInputChange();
                          }}
                          disabled={!selectedMandalam}
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="">All Booths</option>
                          {selectedMandalam &&
                            boothOptionsMap[selectedMandalam]?.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddCoverageArea}
                        disabled={!selectedDistrict}
                        className="rounded-lg bg-card border border-border px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50 shadow-2xs"
                      >
                        Add Coverage Area
                      </button>
                    </div>

                    {/* Coverage Badges */}
                    {coverageAreas.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                        {coverageAreas.map((area, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-bold text-foreground"
                          >
                            <span>
                              {area.district} {area.mandalam && `› ${area.mandalam}`} {area.booth && `› ${area.booth}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoverageArea(idx)}
                              className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Special & Exclusion Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "പ്രത്യേക യോഗ്യതകൾ" : "Special Eligibility Conditions"}
                  </label>
                  <textarea
                    rows={2}
                    value={specialConditions}
                    onChange={(e) => {
                      setSpecialConditions(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="Specific priorities or additional criteria..."
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "ഒഴിവ് നിബന്ധനകൾ (Exclusions)" : "Exclusion Conditions"}
                  </label>
                  <textarea
                    rows={2}
                    value={exclusionConditions}
                    onChange={(e) => {
                      setExclusionConditions(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="Income tax payers, government employees, etc..."
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Benefits Sub-block integrated in Section 2 */}
              <div className="pt-4 border-t border-border/70 space-y-4">
                <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span>{lang === "ml" ? "ആനുകൂല്യ വിവരങ്ങൾ" : "Benefit Details"}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-4">
                  {/* Benefit Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <span>{lang === "ml" ? "ആനുകൂല്യ തരം" : "Benefit Type"}</span>
                      <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={benefitType}
                      onChange={(e) => {
                        setBenefitType(e.target.value);
                        handleInputChange();
                      }}
                      className={`h-11 w-full rounded-xl border bg-background px-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors cursor-pointer ${
                        errors.benefitType ? "border-destructive" : "border-border"
                      }`}
                    >
                      <option value="">{lang === "ml" ? "-- തരം തിരഞ്ഞെടുക്കുക --" : "-- Select Benefit Type --"}</option>
                      <option value="Financial Assistance">Financial Assistance (Direct Cash Transfer)</option>
                      <option value="Subsidy">Subsidy (Price Reduction)</option>
                      <option value="Service">Public Service / Care</option>
                      <option value="Loan">Concessional Loan</option>
                      <option value="Insurance">Health / Life Insurance Coverage</option>
                      <option value="Other">Other Benefit</option>
                    </select>
                    {errors.benefitType && <p className="text-[11px] font-semibold text-destructive">{errors.benefitType}</p>}
                  </div>

                  {/* Benefit Amount / Value */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      {lang === "ml" ? "ആനുകൂല്യ മൂല്യം / തുക" : "Benefit Amount / Value"}
                    </label>
                    <input
                      type="text"
                      value={benefitAmount}
                      onChange={(e) => {
                        setBenefitAmount(e.target.value);
                        handleInputChange();
                      }}
                      placeholder="e.g. ₹6,000 / year or Up to ₹5 Lakh"
                      className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Benefit Frequency */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      {lang === "ml" ? "വിതരണ ആവൃത്തി" : "Benefit Frequency"}
                    </label>
                    <select
                      value={benefitFrequency}
                      onChange={(e) => {
                        setBenefitFrequency(e.target.value);
                        handleInputChange();
                      }}
                      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="One-time">One-time Settlement</option>
                      <option value="As Needed">As Needed / On Claim</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: APPLICATION PROCESS                                            */}
        {/* ========================================================================= */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-border/80 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                {lang === "ml" ? "വിഭാഗം 3 — അപേക്ഷാ പ്രക്രിയ" : "Section 3 — Application Process"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {lang === "ml"
                  ? "പൗരന്മാർക്ക് അപേക്ഷിക്കാനുള്ള വഴികൾ, പോർട്ടൽ, തീയതികൾ, ഹെൽപ്പ് ലൈൻ വിവരങ്ങൾ നൽകുക."
                  : "Citizen-facing application instructions, channels, key dates, helpline, and processing timelines."}
              </p>
            </div>

            <div className="space-y-5">
              {/* Application Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>{lang === "ml" ? "അപേക്ഷാ രീതി" : "Application Mode"}</span>
                  <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-5 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="radio"
                      name="appMode"
                      value="Online"
                      checked={appMode === "Online"}
                      onChange={() => {
                        setAppMode("Online");
                        handleInputChange();
                      }}
                      className="accent-primary h-4 w-4"
                    />
                    {lang === "ml" ? "ഓൺലൈൻ മാത്രം (Online)" : "Online Only"}
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="radio"
                      name="appMode"
                      value="Offline"
                      checked={appMode === "Offline"}
                      onChange={() => {
                        setAppMode("Offline");
                        handleInputChange();
                      }}
                      className="accent-primary h-4 w-4"
                    />
                    {lang === "ml" ? "ഓഫ്ലൈൻ മാത്രം (Offline)" : "Offline Only"}
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="radio"
                      name="appMode"
                      value="Both"
                      checked={appMode === "Both"}
                      onChange={() => {
                        setAppMode("Both");
                        handleInputChange();
                      }}
                      className="accent-primary h-4 w-4"
                    />
                    {lang === "ml" ? "രണ്ടും (Online & Offline)" : "Both (Online & Offline)"}
                  </label>
                </div>
              </div>

              {/* Conditional Fields based on Application Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                {(appMode === "Online" || appMode === "Both") && (
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <span>{lang === "ml" ? "അപേക്ഷാ വെബ്സൈറ്റ് / പോർട്ടൽ ലിങ്ക് (URL)" : "Application Portal URL"}</span>
                      <span className="text-destructive">*</span>
                    </label>
                    <p className="text-[11px] text-muted-foreground -mt-0.5">Where citizens submit the application.</p>
                    <input
                      type="url"
                      value={appUrl}
                      onChange={(e) => {
                        setAppUrl(e.target.value);
                        if (sameAsAppUrl) setOfficialWebsite(e.target.value);
                        handleInputChange();
                      }}
                      placeholder="https://pmkisan.gov.in or https://e-district.kerala.gov.in"
                      className={`h-11 w-full rounded-xl border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors ${
                        errors.appUrl ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.appUrl && <p className="text-[11px] font-semibold text-destructive">{errors.appUrl}</p>}
                  </div>
                )}

                {(appMode === "Offline" || appMode === "Both") && (
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <span>{lang === "ml" ? "അപേക്ഷിക്കേണ്ട ഓഫീസ് / കേന്ദ്രം" : "Application Office / Location"}</span>
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={appOffice}
                      onChange={(e) => {
                        setAppOffice(e.target.value);
                        handleInputChange();
                      }}
                      placeholder="e.g. Village Office, Krishi Bhavan, or Akshaya Centers"
                      className={`h-11 w-full rounded-xl border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors ${
                        errors.appOffice ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.appOffice && <p className="text-[11px] font-semibold text-destructive">{errors.appOffice}</p>}
                  </div>
                )}

                {/* Dates & Processing Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "ആരംഭ തീയതി" : "Application Start Date"}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setAppStartDate(e.target.value);
                      handleInputChange();
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "അവസാന തീയതി" : "Application End Date"}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setAppEndDate(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="Leave blank if continuous / ongoing"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors cursor-pointer"
                  />
                </div>

                {/* Processing Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "പ്രോസസ്സിംഗ് സമയം" : "Processing Time"}
                  </label>
                  <input
                    type="text"
                    value={processingTime}
                    onChange={(e) => {
                      setProcessingTime(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. 15 working days"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>

                {/* Contact & Helpdesk */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "ഹെൽപ്പ് ലൈൻ ഫോൺ നമ്പർ" : "Helpline Number"}
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => {
                      setContactNumber(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. 1800-180-1551"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "ഇമെയിൽ അഡ്രസ്സ്" : "Helpdesk Email"}
                  </label>
                  <input
                    type="email"
                    value={helpdeskEmail}
                    onChange={(e) => {
                      setHelpdeskEmail(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. helpdesk@vikasitakeralam.gov.in"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>

                {/* How to Apply */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "അപേക്ഷിക്കേണ്ട ഘട്ടങ്ങൾ" : "How to Apply"}
                  </label>
                  <textarea
                    rows={3}
                    value={howToApply}
                    onChange={(e) => {
                      setHowToApply(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="Step 1: Visit portal, Step 2: Upload documents, Step 3: Submit application..."
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: DOCUMENTS & PUBLISHING                                         */}
        {/* ========================================================================= */}
        {activeStep === 4 && (
          <div className="space-y-7 animate-in fade-in-50 duration-200">
            {/* Subsection 4A: Required Documents */}
            <div className="space-y-4">
              <div className="border-b border-border/80 pb-3.5">
                <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                  {lang === "ml" ? "ആവശ്യമായ രേഖകൾ" : "Section 4 — Documents & Publishing"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {lang === "ml"
                    ? "അപേക്ഷകർക്ക് ആവശ്യമായ രേഖകളും ഔദ്യോഗിക പബ്ലിഷിംഗ് ക്രമീകരണങ്ങളും നൽകുക."
                    : "Specify applicant documents, government notification files, and publishing status."}
                </p>
              </div>

              {/* Repeatable Documents List */}
              <div className="rounded-xl border border-border overflow-hidden bg-background">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-[10px] uppercase font-extrabold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3">Document Name</th>
                      <th className="p-3">Requirement Type</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-background">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/30">
                        <td className="p-3.5 font-bold text-foreground">{doc.name}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              doc.isRequired ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {doc.isRequired ? "Required" : "Optional"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Remove Document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {documents.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-xs text-muted-foreground">
                          No documents added yet. Add documents using the row below.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add New Document Input Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-border bg-background p-3">
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Ration Card / Disability Certificate"
                  className="h-10.5 flex-1 rounded-lg border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <select
                  value={newDocRequired ? "Required" : "Optional"}
                  onChange={(e) => setNewDocRequired(e.target.value === "Required")}
                  className="h-10.5 rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer shrink-0"
                >
                  <option value="Required">Required</option>
                  <option value="Optional">Optional</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddDocument}
                  className="h-10.5 rounded-lg bg-card border border-border px-4 text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>{lang === "ml" ? "ചേർക്കുക" : "Add Document"}</span>
                </button>
              </div>
            </div>

            {/* Subsection 4B: Official Details & Publishing */}
            <div className="space-y-5 pt-5 border-t border-border/80">
              <div className="border-b border-border/80 pb-3.5">
                <h3 className="text-sm sm:text-base font-bold font-display text-foreground">
                  {lang === "ml" ? "ഔദ്യോഗിക വിവരങ്ങളും പ്രസിദ്ധീകരണവും" : "Official Details & Publishing"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "ml"
                    ? "ഔദ്യോഗിക നോട്ടീസ് നമ്പർ, മാർഗ്ഗനിർദ്ദേശങ്ങൾ, പ്രസിദ്ധീകരണ സ്റ്റാറ്റസ് നൽകുക."
                    : "Official scheme website, government notifications, guidelines PDFs, and publishing controls."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                {/* Official Website */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <label className="text-xs font-bold text-foreground block">
                    {lang === "ml" ? "ഔദ്യോഗിക വെബ്സൈറ്റ്" : "Official Scheme Website"}
                  </label>
                  <p className="text-[11px] text-muted-foreground -mt-0.5">Official information page for the scheme.</p>
                  <input
                    type="url"
                    value={officialWebsite}
                    onChange={(e) => {
                      setOfficialWebsite(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="https://kerala.gov.in/schemes"
                    disabled={sameAsAppUrl}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors disabled:opacity-60"
                  />
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-muted-foreground pt-1">
                    <input
                      type="checkbox"
                      checked={sameAsAppUrl}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameAsAppUrl(checked);
                        if (checked) {
                          setOfficialWebsite(appUrl);
                        }
                        handleInputChange();
                      }}
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                    />
                    <span>{lang === "ml" ? "അപേക്ഷാ പോർട്ടൽ ലിങ്കിന് തുല്യമാണ്" : "Same as application portal URL"}</span>
                  </label>
                </div>

                {/* Government Order No */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "സർക്കാർ ഉത്തരവ് / വിജ്ഞാപന നമ്പർ" : "Government Order / Notification Number"}
                  </label>
                  <input
                    type="text"
                    value={notificationNo}
                    onChange={(e) => {
                      setNotificationNo(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. G.O.(P) No. 104/2025/AGRI"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>

                {/* Notification Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "വിജ്ഞാപന തീയതി" : "Notification Date"}
                  </label>
                  <input
                    type="date"
                    value={notificationDate}
                    onChange={(e) => {
                      setNotificationDate(e.target.value);
                      handleInputChange();
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors cursor-pointer"
                  />
                </div>

                {/* Scheme Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <span>{lang === "ml" ? "പ്രസിദ്ധീകരണ സ്റ്റാറ്റസ്" : "Scheme Status"}</span>
                    <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setSchemeStatus(e.target.value as "Active" | "Draft");
                      handleInputChange();
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs sm:text-sm font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active (Published on platform)</option>
                    <option value="Draft">Draft (Hidden from citizens)</option>
                  </select>
                </div>

                {/* Guidelines PDF Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "മാർഗ്ഗനിർദ്ദേശങ്ങൾ (Guidelines PDF)" : "Guidelines PDF"}
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5">
                    <span className="text-xs text-muted-foreground truncate flex-1 pl-1">
                      {guidelinesPdfName || "Select PDF Guidelines file"}
                    </span>
                    <label className="cursor-pointer rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted shadow-2xs">
                      <span>Browse</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setGuidelinesPdfName(e.target.files[0].name);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Application Form PDF Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "അപേക്ഷാ ഫോം (Application Form PDF)" : "Application Form PDF"}
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5">
                    <span className="text-xs text-muted-foreground truncate flex-1 pl-1">
                      {appFormPdfName || "Select printable PDF form"}
                    </span>
                    <label className="cursor-pointer rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted shadow-2xs">
                      <span>Browse</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setAppFormPdfName(e.target.files[0].name);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Other Attachments */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "മറ്റ് അനുബന്ധ രേഖകൾ" : "Other Attachments"}
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5">
                    <span className="text-xs text-muted-foreground truncate flex-1 pl-1">
                      {otherAttachmentsName || "Select extra attachments"}
                    </span>
                    <label className="cursor-pointer rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted shadow-2xs">
                      <span>Browse</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setOtherAttachmentsName(e.target.files[0].name);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Featured Scheme Toggle */}
                <div className="space-y-1.5 flex flex-col justify-center sm:col-span-2 lg:col-span-3">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold text-foreground pt-1">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => {
                        setIsFeatured(e.target.checked);
                        handleInputChange();
                      }}
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                    />
                    <span>{lang === "ml" ? "ഹോം പേജിൽ ഫീച്ചർ ചെയ്യുക" : "Feature on Homepage"}</span>
                  </label>
                </div>

                {/* Internal Notes */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "ആന്തരിക റഫറൻസ് കുറിപ്പുകൾ" : "Internal Admin Notes"}
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => {
                      setInternalNotes(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="Private notes for admin reviewers (not visible to public)..."
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INDUSTRIAL STICKY FOOTER ACTION BAR */}
      <div
        className={`fixed bottom-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md p-3 sm:px-8 shadow-lg transition-all duration-200 ${
          sidebarIsMobile
            ? "left-0"
            : sidebarState === "collapsed"
              ? "left-[3rem]"
              : "left-[16rem]"
        }`}
      >
        <div className="w-full flex items-center justify-end gap-2 overflow-x-auto no-scrollbar">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleBackNavigation}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs shrink-0"
          >
            {lang === "ml" ? "റദ്ദാക്കുക" : "Cancel"}
          </button>

          {/* Previous Step Button */}
          {activeStep > 1 && (
            <button
              type="button"
              onClick={() => setActiveStep(activeStep - 1)}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs shrink-0"
            >
              {lang === "ml" ? "മുമ്പത്തെ ഘട്ടം" : "Previous"}
            </button>
          )}

          {/* Next Step Button (Primary Color) */}
          {activeStep < 4 && (
            <button
              type="button"
              onClick={() => setActiveStep(activeStep + 1)}
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs flex items-center gap-1.5 active:scale-98 shrink-0"
            >
              <span>{lang === "ml" ? "അടുത്ത ഘട്ടം" : "Next"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* Create Scheme Primary Button (Show ONLY in Section 4 — Documents & Publish) */}
          {activeStep === 4 && (
            <button
              type="button"
              onClick={() => handleSubmit("Active")}
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs flex items-center gap-2 active:scale-98 shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              <span>{lang === "ml" ? "പദ്ധതി സൃഷ്ടിക്കുക" : "Create Scheme"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Discard Changes Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  {lang === "ml" ? "സേവ് ചെയ്യാത്ത മാറ്റങ്ങൾ ഉപേക്ഷിക്കണോ?" : "Discard unsaved changes?"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "ml"
                    ? "നിങ്ങൾ നൽകിയ വിവരങ്ങൾ സേവ് ചെയ്തിട്ടില്ല. തിരികെ പോയാൽ വിവരങ്ങൾ നഷ്ടപ്പെടും."
                    : "Your scheme information has not been saved."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
              >
                {lang === "ml" ? "എഡിറ്റിംഗ് തുടരുക" : "Continue Editing"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardModal(false);
                  setIsDirty(false);
                  navigate({ to: "/admin/schemes" });
                }}
                className="rounded-xl bg-destructive px-3.5 py-2 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                {lang === "ml" ? "ഉപേക്ഷിച്ച് തിരികെ പോകുക" : "Discard & Go Back"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
