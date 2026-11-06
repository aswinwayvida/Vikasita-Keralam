import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Info,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
  UserPlus,
  AlertCircle,
  Sparkles,
  Search,
  Building2,
  Tag,
  Check,
  CheckSquare,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { districts, constituencies, panchayats } from "@/data/geo";
import { schemes, Scheme } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/applications_/new")({
  head: () => ({ meta: [{ title: "New Application · Admin" }] }),
  component: NewApplicationPage,
});

// Mock database of existing applicants by mobile number
const existingApplicantsDb: Record<
  string,
  {
    id: string;
    fullName: string;
    dob: string;
    gender: string;
    maritalStatus: string;
    religion: string;
    caste: string;
    occupation: string;
    income: string;
    aadhaar: string;
    districtId: string;
    pinCode: string;
    houseNo: string;
    houseName: string;
    street: string;
    localBodyType: string;
    localBody: string;
    ward: string;
    assemblyMandalam: string;
  }
> = {
  "9400000000": {
    id: "VK-2026-0042",
    fullName: "Ramesh Kumar",
    dob: "1988-05-14",
    gender: "male",
    maritalStatus: "married",
    religion: "hinduism",
    caste: "obc",
    occupation: "farmer",
    income: "75000",
    aadhaar: "882390124512",
    districtId: "tvm",
    pinCode: "695001",
    houseNo: "TC 14/820",
    houseName: "Lakshmi Nivas",
    street: "Kaithamukku",
    localBodyType: "corporation",
    localBody: "tvm-corp",
    ward: "12",
    assemblyMandalam: "tvm-c6",
  },
  "9488000900": {
    id: "VK-2026-0108",
    fullName: "Sandhya Nair",
    dob: "1992-09-22",
    gender: "female",
    maritalStatus: "married",
    religion: "hinduism",
    caste: "general",
    occupation: "homemaker",
    income: "120000",
    aadhaar: "901238471209",
    districtId: "klm",
    pinCode: "691001",
    houseNo: "KP 8/120",
    houseName: "Sreevalsam",
    street: "Beach Road",
    localBodyType: "municipality",
    localBody: "klm-mun",
    ward: "5",
    assemblyMandalam: "klm-c1",
  },
};

// PIN Code mock lookup database
const pinCodeDatabase: Record<
  string,
  { districtId: string; postOffice: string; localBodyType: string }
> = {
  "695001": { districtId: "tvm", postOffice: "Fort PO, Thiruvananthapuram", localBodyType: "corporation" },
  "695002": { districtId: "tvm", postOffice: "Pattom PO, Thiruvananthapuram", localBodyType: "corporation" },
  "691001": { districtId: "klm", postOffice: "Kollam Head PO", localBodyType: "municipality" },
  "682001": { districtId: "ekm", postOffice: "Kochi Main PO, Ernakulam", localBodyType: "corporation" },
  "673001": { districtId: "kkd", postOffice: "Kozhikode HO", localBodyType: "corporation" },
  "680001": { districtId: "tsr", postOffice: "Thrissur Town PO", localBodyType: "corporation" },
};

export function NewApplicationPage() {
  const { lang } = useLang();
  const navigate = useNavigate();

  // Wizard Step State: 1, 2, or 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 3: Eligible Schemes Selection State
  const [selectedSchemeIds, setSelectedSchemeIds] = useState<Set<string>>(
    new Set(["pmkisan", "pmjay", "pmay"])
  );
  const [schemeSearch, setSchemeSearch] = useState("");
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState("all");

  // Step 1: Personal Details State
  const [mobileNumber, setMobileNumber] = useState("");
  const [checkingMobile, setCheckingMobile] = useState(false);
  const [existingApplicant, setExistingApplicant] = useState<
    (typeof existingApplicantsDb)[string] | null
  >(null);
  const [isUsingExisting, setIsUsingExisting] = useState(false);

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [canResendOtp, setResendOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Demographics
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [religion, setReligion] = useState("");
  const [caste, setCaste] = useState("");
  const [occupation, setOccupation] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [showAadhaar, setShowAadhaar] = useState(false);

  // Step 2: Address & Location Details State
  const [pinCode, setPinCode] = useState("");
  const [pinLocationInfo, setPinLocationInfo] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [assemblyMandalam, setAssemblyMandalam] = useState("");
  const [localBodyType, setLocalBodyType] = useState<"panchayat" | "municipality" | "corporation" | "">("");
  const [localBody, setLocalBody] = useState("");
  const [ward, setWard] = useState("");

  const [houseNumber, setHouseNumber] = useState("");
  const [houseName, setHouseName] = useState("");
  const [streetLocality, setStreetLocality] = useState("");

  // Form Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Auto age calculation
  const calculatedAge = useMemo(() => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  }, [dob]);

  // Mobile number existing applicant lookup trigger
  useEffect(() => {
    if (mobileNumber.length === 10) {
      setCheckingMobile(true);
      const timer = setTimeout(() => {
        setCheckingMobile(false);
        if (existingApplicantsDb[mobileNumber]) {
          setExistingApplicant(existingApplicantsDb[mobileNumber]);
        } else {
          setExistingApplicant(null);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setExistingApplicant(null);
      setIsUsingExisting(false);
    }
  }, [mobileNumber]);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    } else if (otpCountdown === 0) {
      setResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpCountdown]);

  // Handle Send OTP
  const handleSendOtp = () => {
    if (mobileNumber.length !== 10) {
      toast.error(lang === "ml" ? "10 അക്ക മൊബൈൽ നമ്പർ നൽകുക" : "Please enter a valid 10-digit mobile number.");
      return;
    }
    setOtpSent(true);
    setOtpCountdown(30);
    setResendOtp(false);
    setOtpError("");
    setIsOtpModalOpen(true);
    toast.success(
      lang === "ml"
        ? `${mobileNumber} ലേക്ക് OTP അയച്ചു (ഡെമോ OTP: 123456)`
        : `OTP sent to ${mobileNumber}. (Use demo OTP: 123456)`
    );
  };

  // Handle Verify OTP
  const handleVerifyOtp = () => {
    if (otpValue === "123456" || otpValue.length === 6) {
      setIsOtpVerified(true);
      setOtpError("");
      setIsOtpModalOpen(false);
      toast.success(lang === "ml" ? "മൊബൈൽ നമ്പർ വിജയകരമായി വെരിഫൈ ചെയ്തു!" : "Mobile number verified successfully!");
    } else {
      setOtpError(lang === "ml" ? "തെറ്റായ OTP. വീണ്ടും ശ്രമിക്കുക." : "Invalid OTP. Please try again.");
    }
  };

  // Handle Use Existing Applicant Selection
  const handleSelectExistingApplicant = () => {
    if (!existingApplicant) return;
    setIsUsingExisting(true);
    setFullName(existingApplicant.fullName);
    setDob(existingApplicant.dob);
    setGender(existingApplicant.gender);
    setMaritalStatus(existingApplicant.maritalStatus);
    setReligion(existingApplicant.religion);
    setCaste(existingApplicant.caste);
    setOccupation(existingApplicant.occupation);
    setAnnualIncome(existingApplicant.income);
    setAadhaarNumber(existingApplicant.aadhaar);

    // Prefill Address
    setPinCode(existingApplicant.pinCode);
    setSelectedDistrict(existingApplicant.districtId);
    setAssemblyMandalam(existingApplicant.assemblyMandalam);
    setLocalBodyType(existingApplicant.localBodyType as "corporation");
    setLocalBody(existingApplicant.localBody);
    setWard(existingApplicant.ward);
    setHouseNumber(existingApplicant.houseNo);
    setHouseName(existingApplicant.houseName);
    setStreetLocality(existingApplicant.street);

    setIsOtpVerified(true);
    toast.success(
      lang === "ml"
        ? `'${existingApplicant.fullName}' അനുബന്ധ വിവരങ്ങൾ തിരഞ്ഞെടുത്തു.`
        : `Selected existing applicant '${existingApplicant.fullName}'.`
    );
  };

  // PIN Code lookup handler
  useEffect(() => {
    if (pinCode.length === 6) {
      const location = pinCodeDatabase[pinCode];
      if (location) {
        setPinLocationInfo(location.postOffice);
        setSelectedDistrict(location.districtId);
        setLocalBodyType(location.localBodyType as "corporation");
        toast.info(lang === "ml" ? `പിൻകോഡ് വിവരങ്ങൾ ലഭ്യമാക്കി: ${location.postOffice}` : `PIN Location found: ${location.postOffice}`);
      } else {
        setPinLocationInfo("General Area Post Office");
      }
    } else {
      setPinLocationInfo(null);
    }
  }, [pinCode, lang]);

  // Derived location dropdown options
  const filteredConstituencies = constituencies.filter((c) => c.districtId === selectedDistrict);
  const filteredLocalBodies = panchayats.filter(
    (p) =>
      (!selectedDistrict || p.districtId === selectedDistrict) &&
      (!localBodyType || p.type === localBodyType)
  );

  // Validation before going to Step 2
  const handleProceedToStep2 = () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.error(lang === "ml" ? "സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ ആവശ്യമാണ്." : "Valid 10-digit mobile number is required.");
      return;
    }
    if (!isOtpVerified && !isUsingExisting) {
      toast.error(lang === "ml" ? "തുടരുന്നതിന് മുൻപ് OTP വെരിഫിക്കേഷൻ പൂർത്തിയാക്കുക." : "Please complete OTP verification before proceeding.");
      return;
    }
    if (!fullName.trim()) {
      toast.error(lang === "ml" ? "അപേക്ഷകന്റെ പേര് നൽകുക." : "Applicant Full Name is required.");
      return;
    }
    if (!dob) {
      toast.error(lang === "ml" ? "ജനനത്തീയതി നൽകുക." : "Date of birth is required.");
      return;
    }
    if (!gender) {
      toast.error(lang === "ml" ? "ലിംഗഭേദം തിരഞ്ഞെടുക്കുക." : "Please select Gender.");
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Form Submission -> Proceed to Step 3 (Eligible Schemes)
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode || pinCode.length !== 6) {
      toast.error(lang === "ml" ? "6 അക്ക പിൻകോഡ് ആവശ്യമാണ്." : "Valid 6-digit PIN code is required.");
      return;
    }
    if (!selectedDistrict) {
      toast.error(lang === "ml" ? "ജില്ല തിരഞ്ഞെടുക്കുക." : "District is required.");
      return;
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(
      lang === "ml"
        ? "അപേക്ഷകന്റെ വിവരങ്ങൾ സ്ഥിരീകരിച്ചു. അർഹതയുള്ള പദ്ധതികൾ തിരഞ്ഞെടുക്കുക."
        : "Applicant registered! Now select eligible schemes."
    );
  };

  // Final Form Submission from Step 3
  const handleFinalSubmitApplications = () => {
    if (selectedSchemeIds.size === 0) {
      toast.error(
        lang === "ml"
          ? "കുറഞ്ഞത് ഒരു പദ്ധതി എങ്കിലും തിരഞ്ഞെടുക്കുക."
          : "Please select at least one scheme to create applications."
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        lang === "ml"
          ? `${selectedSchemeIds.size} പദ്ധതികളിലേക്ക് അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു!`
          : `Created ${selectedSchemeIds.size} application(s) successfully for ${fullName || "Applicant"}!`
      );
      navigate({ to: "/admin/applications", search: { stage: undefined, filter: undefined } });
    }, 800);
  };

  return (
    <div className="w-full pb-10 text-foreground md:pb-28">
      {/* Top Header Section matching Create User Page styling & full-bleed white background */}
      <section className="sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 sm:pb-0">
          {/* Left: Back Navigation Button + Title */}
          <div className="flex items-center gap-3 sm:gap-2.5">
            <button
              type="button"
              onClick={() => void navigate({ to: "/admin/applications", search: { stage: undefined, filter: undefined } })}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary group cursor-pointer sm:h-8 sm:w-8"
              title={lang === "ml" ? "അപേക്ഷകളുടെ പട്ടികയിലേക്ക് തിരികെ" : "Back to Applications"}
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 sm:h-3.5 sm:w-3.5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                {lang === "ml" ? "പുതിയ അപേക്ഷ സൃഷ്ടിക്കുക" : "Create New Application"}
              </h1>
            </div>
          </div>

          {/* Right: Step 1 and Step 2 Progress Stepper */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Step 1 Button */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-all cursor-pointer ${
                currentStep === 1
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentStep === 1
                    ? "bg-primary text-primary-foreground"
                    : isOtpVerified
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </span>
              <span>{lang === "ml" ? "ഘട്ടം 1: വ്യക്തിഗത വിവരങ്ങൾ" : "Step 1: Personal Details & Verification"}</span>
            </button>

            {/* Step 2 Button */}
            <button
              type="button"
              onClick={() => {
                if (mobileNumber && (isOtpVerified || isUsingExisting)) {
                  setCurrentStep(2);
                } else {
                  toast.info(
                    lang === "ml"
                      ? "ഘട്ടം 2 ലേക്ക് കടക്കാൻ ഘട്ടം 1 വിവരങ്ങൾ പൂർത്തിയാക്കുക."
                      : "Complete Step 1 verification to proceed to Step 2."
                  );
                }
              }}
              className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-all cursor-pointer ${
                currentStep === 2
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentStep === 2
                    ? "bg-primary text-primary-foreground"
                    : currentStep === 3
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </span>
              <span>{lang === "ml" ? "ഘട്ടം 2: വിലാസവും ലൊക്കേഷനും" : "Step 2: Address & Location Details"}</span>
            </button>

            {/* Step 3 Button */}
            <button
              type="button"
              onClick={() => {
                if (mobileNumber && (isOtpVerified || isUsingExisting) && pinCode && selectedDistrict) {
                  setCurrentStep(3);
                } else {
                  toast.info(
                    lang === "ml"
                      ? "ഘട്ടം 3 ലേക്ക് കടക്കാൻ ഘട്ടം 1, 2 വിവരങ്ങൾ പൂർത്തിയാക്കുക."
                      : "Complete Step 1 & Step 2 details to proceed to Step 3."
                  );
                }
              }}
              className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-all cursor-pointer ${
                currentStep === 3
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentStep === 3
                    ? "bg-primary text-primary-foreground"
                    : selectedSchemeIds.size > 0
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </span>
              <span>{lang === "ml" ? "ഘട്ടം 3: അർഹതയുള്ള പദ്ധതികൾ" : "Step 3: Eligible Schemes"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* STEP 1 CONTENT */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Merged Section Container */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>
                  {lang === "ml"
                    ? "മൊബൈൽ വെരിഫിക്കേഷനും വ്യക്തിഗത വിവരങ്ങളും"
                    : "Mobile Verification & Personal Details"}
                </span>
              </h2>
              {isOtpVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {lang === "ml" ? "മൊബൈൽ നമ്പർ വെരിഫൈ ചെയ്തു" : "Mobile Number Verified"}
                </span>
              )}
            </div>

            {/* Mobile Number Input */}
            <div className="space-y-3 max-w-md">
              <label className="text-xs font-bold text-foreground block">
                {lang === "ml" ? "മൊബൈൽ നമ്പർ *" : "Mobile Number *"}
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setMobileNumber(val);
                    setIsOtpVerified(false);
                  }}
                  placeholder="Enter mobile number"
                  className="h-11 rounded-xl bg-white dark:bg-card border-border text-sm font-semibold"
                />
                {checkingMobile && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Status and Action after 10-digit mobile number entry */}
              {mobileNumber.length === 10 && !checkingMobile && (
                <div>
                  {existingApplicant ? (
                    <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          {lang === "ml" ? "ലഭ്യമായ അപേക്ഷകനെ കണ്ടെത്തി" : "Existing Applicant Found"}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded">
                          {existingApplicant.id}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/80 dark:text-amber-300">
                        Name: <strong>{existingApplicant.fullName}</strong> • DOB: {existingApplicant.dob}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSelectExistingApplicant}
                        className="w-full h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        {lang === "ml" ? "ഈ അപേക്ഷകനെ തിരഞ്ഞെടുക്കുക" : "Use Existing Applicant"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <UserPlus className="h-3.5 w-3.5" />
                        {lang === "ml" ? "പുതിയ അപേക്ഷകൻ" : "New Applicant"}
                      </p>

                      {!isOtpVerified && (
                        <Button
                          type="button"
                          onClick={handleSendOtp}
                          className="h-10 px-5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>{lang === "ml" ? "OTP അയക്കുക" : "Send OTP"}</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Demographics Form Section — Displayed inside the same container after verification */}
            {(isOtpVerified || isUsingExisting) && (
              <div className="pt-4 border-t border-border/80 space-y-6">
                {/* 3 Inputs per row grid */}
                <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
                  {/* 1. Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {lang === "ml" ? "പൂർണ്ണമായ പേര് *" : "Applicant Full Name *"}
                    </label>
                    <Input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full legal name"
                      className="h-11 rounded-xl bg-white dark:bg-card border-border text-sm font-semibold"
                    />
                  </div>

                  {/* 2. Date of Birth & Auto Age */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground block">
                        {lang === "ml" ? "ജനനത്തീയതി *" : "Date of Birth *"}
                      </label>
                      {calculatedAge !== null && (
                        <span className="text-[11px] font-bold text-primary">
                          Age: {calculatedAge} yrs
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="h-11 rounded-xl bg-white dark:bg-card border-border text-sm font-semibold pr-10"
                      />
                      <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* 3. Gender */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {lang === "ml" ? "ലിംഗഭേദം *" : "Gender *"}
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-foreground"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Transgender / Other</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* 4. Marital Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {lang === "ml" ? "വൈവാഹിക നില *" : "Marital Status *"}
                    </label>
                    <div className="relative">
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-foreground"
                      >
                        <option value="">Select Marital Status</option>
                        <option value="single">Single / Unmarried</option>
                        <option value="married">Married</option>
                        <option value="widowed">Widowed</option>
                        <option value="divorced">Divorced</option>
                        <option value="separated">Separated</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* 5. Religion */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {lang === "ml" ? "മതം *" : "Religion *"}
                    </label>
                    <div className="relative">
                      <select
                        value={religion}
                        onChange={(e) => setReligion(e.target.value)}
                        className="h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-foreground"
                      >
                        <option value="">Select Religion</option>
                        <option value="hinduism">Hinduism</option>
                        <option value="islam">Islam</option>
                        <option value="christianity">Christianity</option>
                        <option value="sikhism">Sikhism</option>
                        <option value="buddhism">Buddhism</option>
                        <option value="jainism">Jainism</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* 6. Caste / Social Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {lang === "ml" ? "സാമൂഹിക വിഭാഗം / ജാതി *" : "Caste / Social Category *"}
                    </label>
                    <div className="relative">
                      <select
                        value={caste}
                        onChange={(e) => setCaste(e.target.value)}
                        className="h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-foreground"
                      >
                        <option value="">Select Caste / Category</option>
                        <option value="general">General</option>
                        <option value="obc">OBC</option>
                        <option value="sc">SC</option>
                        <option value="st">ST</option>
                        <option value="obc_ncl">OBC-NCL</option>
                        <option value="ews">EWS</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* 7. Occupation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {lang === "ml" ? "തൊഴിൽ *" : "Occupation *"}
                    </label>
                    <div className="relative">
                      <select
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-foreground"
                      >
                        <option value="">Select Occupation</option>
                        <option value="farmer">Farmer / Agriculture</option>
                        <option value="daily_wage">Daily Wage Worker</option>
                        <option value="salaried_private">Salaried (Private)</option>
                        <option value="salaried_govt">Salaried (Government)</option>
                        <option value="self_employed">Self-Employed / Business</option>
                        <option value="homemaker">Homemaker</option>
                        <option value="student">Student</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="retired">Retired / Pensioner</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* 8. Annual Family Income */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {lang === "ml" ? "വാർഷിക കുടുംബ വരുമാനം (₹) *" : "Annual Family Income (₹) *"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        value={annualIncome}
                        onChange={(e) => setAnnualIncome(e.target.value)}
                        placeholder="e.g. 75000"
                        className="h-11 pl-8 rounded-xl bg-white dark:bg-card border-border text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {/* 9. Aadhaar Number with Masking */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {lang === "ml" ? "ആധാർ നമ്പർ (12 അക്കങ്ങൾ)" : "Aadhaar Number (12 Digits)"}
                    </label>
                    <div className="relative flex items-center">
                      <Input
                        type={showAadhaar ? "text" : "password"}
                        inputMode="numeric"
                        maxLength={12}
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 12-digit Aadhaar"
                        className="h-11 rounded-xl bg-white dark:bg-card border-border text-sm font-mono font-semibold tracking-wider pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAadhaar(!showAadhaar)}
                        className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer"
                        title={showAadhaar ? "Hide Aadhaar" : "Show Aadhaar"}
                      >
                        {showAadhaar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {lang === "ml"
                        ? "ആധാർ നമ്പർ സുരക്ഷിതമായി സൂക്ഷിക്കുന്നു."
                        : "Aadhaar is securely masked."}
                    </p>
                  </div>
                </div>

                {/* Bottom Action for Step 1 */}
                <div className="flex justify-end pt-4 border-t border-border/80">
                  <Button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="h-11 px-6 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>{lang === "ml" ? "തുടരുക (ഘട്ടം 2)" : "Continue to Step 2"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Small Popup Modal for OTP Input */}
          <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
            <DialogContent className="sm:max-w-md rounded-2xl bg-card p-6">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {lang === "ml" ? "OTP വെരിഫിക്കേഷൻ കോഡ്" : "Enter OTP Verification Code"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-1">
                  {lang === "ml"
                    ? `${mobileNumber} ലേക്ക് അയച്ച 6 അക്ക OTP കോഡ് നൽകുക.`
                    : `Enter the 6-digit verification code sent to ${mobileNumber}.`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                <div className="space-y-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="h-12 text-center text-lg font-mono font-bold tracking-widest rounded-xl bg-white dark:bg-card border-border"
                  />
                  {otpError && <p className="text-xs font-semibold text-destructive">{otpError}</p>}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>
                    {canResendOtp ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="font-bold text-primary hover:underline cursor-pointer"
                      >
                        {lang === "ml" ? "വീണ്ടും OTP അയക്കുക" : "Resend OTP"}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        Resend in 00:{otpCountdown < 10 ? `0${otpCountdown}` : otpCountdown}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">Demo OTP: 123456</span>
                </div>

                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpValue.length < 6}
                  className="w-full h-11 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {lang === "ml" ? "OTP വെരിഫൈ ചെയ്യുക" : "Verify OTP"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* STEP 2 CONTENT */}
      {currentStep === 2 && (
        <form onSubmit={handleProceedToStep3} className="space-y-6">
          {/* Location & Address Section Box */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-foreground border-b border-border/80 pb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{lang === "ml" ? "ലൊക്കേഷനും വിലാസവും" : "Location & Address Details"}</span>
            </h2>

            {/* PIN Code Lookup Section */}
            <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1 max-w-xs">
                  <label className="text-xs font-bold text-foreground block">
                    {lang === "ml" ? "പിൻകോഡ് (6 അക്കങ്ങൾ) *" : "PIN Code (6 Digits) *"}
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 695001"
                    className="h-11 rounded-xl bg-white dark:bg-card border-border font-mono font-bold text-sm"
                  />
                </div>
                {pinLocationInfo && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 sm:max-w-md">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                      ✓ Location Found: {pinLocationInfo}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                      District & Local body type auto-detected.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Group */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-1">
                {lang === "ml" ? "അഡ്മിനിസ്ട്രേറ്റീവ് ലൊക്കേഷൻ" : "Location Details"}
              </h3>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* District */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {lang === "ml" ? "ജില്ല *" : "District *"}
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setAssemblyMandalam("");
                        setLocalBody("");
                      }}
                      className="h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-foreground"
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d[lang]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Assembly Mandalam */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {lang === "ml" ? "നിയമസഭാ മണ്ഡലം *" : "Assembly Mandalam *"}
                  </label>
                  <div className="relative">
                    <select
                      value={assemblyMandalam}
                      onChange={(e) => setAssemblyMandalam(e.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-foreground"
                    >
                      <option value="">Select Assembly Mandalam</option>
                      {filteredConstituencies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c[lang]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Local Body Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {lang === "ml" ? "തദ്ദേശ സ്വയംഭരണ സ്ഥാപനം തരം *" : "Local Body Type *"}
                  </label>
                  <div className="relative">
                    <select
                      value={localBodyType}
                      onChange={(e) => {
                        setLocalBodyType(e.target.value as any);
                        setLocalBody("");
                      }}
                      className="h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-foreground"
                    >
                      <option value="">Select Local Body Type</option>
                      <option value="panchayat">Grama Panchayat</option>
                      <option value="municipality">Municipality</option>
                      <option value="corporation">Municipal Corporation</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Local Body */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {lang === "ml" ? "തദ്ദേശ സ്ഥാപനത്തിന്റെ പേര് *" : "Local Body *"}
                  </label>
                  <div className="relative">
                    <select
                      value={localBody}
                      onChange={(e) => setLocalBody(e.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-foreground"
                    >
                      <option value="">Select Local Body</option>
                      {filteredLocalBodies.map((lb) => (
                        <option key={lb.id} value={lb.id}>
                          {lb[lang]} ({lb.type})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Ward Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {lang === "ml" ? "വാർഡ് നമ്പർ *" : "Ward *"}
                  </label>
                  <div className="relative">
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-card px-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-foreground"
                    >
                      <option value="">Select Ward</option>
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((w) => (
                        <option key={w} value={w}>
                          Ward {w}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Residential Address Group */}
            <div className="space-y-4 pt-4 border-t border-border/80">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-1">
                {lang === "ml" ? "വീട്ടു വിലാസം" : "Residential Address"}
              </h3>

              <div className="grid gap-5 sm:grid-cols-3">
                {/* House Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {lang === "ml" ? "വീട്ടു നമ്പർ" : "House Number"}
                  </label>
                  <Input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="e.g. TC 14/820"
                    className="h-11 rounded-xl bg-white dark:bg-card border-border text-sm font-semibold"
                  />
                </div>

                {/* House Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {lang === "ml" ? "വീട്ടു പേര്" : "House Name"}
                  </label>
                  <Input
                    type="text"
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    placeholder="e.g. Lakshmi Nivas"
                    className="h-11 rounded-xl bg-white dark:bg-card border-border text-sm font-semibold"
                  />
                </div>

                {/* Street / Locality */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {lang === "ml" ? "തെരുവ് / സ്ഥലം" : "Street / Locality"}
                  </label>
                  <Input
                    type="text"
                    value={streetLocality}
                    onChange={(e) => setStreetLocality(e.target.value)}
                    placeholder="e.g. Kaithamukku Junction"
                    className="h-11 rounded-xl bg-white dark:bg-card border-border text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions for Step 2 */}
            <div className="flex items-center justify-between pt-6 border-t border-border/80">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="h-11 px-6 rounded-xl font-bold text-xs cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                <span>{lang === "ml" ? "പുറകിലേക്ക് (ഘട്ടം 1)" : "Back to Step 1"}</span>
              </Button>

              <Button
                type="submit"
                className="h-12 px-8 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>{lang === "ml" ? "അപേക്ഷകനെ രജിസ്റ്റർ ചെയ്ത് തുടരുക" : "Create Applicant & Continue"}</span>
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 3 CONTENT — Eligible Schemes Selection */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Main Card Container */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>{lang === "ml" ? "അർഹതയുള്ള പദ്ധതികളുടെ പട്ടിക" : "Eligible Schemes Selection"}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "ml"
                    ? "അപേക്ഷകന്റെ വിവരങ്ങൾക്കനുസരിച്ച് യോഗ്യമായ പദ്ധതികൾ താഴെ കാണിച്ചിരിക്കുന്നു. ഒന്നിൽക്കൂടുതൽ പദ്ധതികൾ തിരഞ്ഞെടുക്കാം."
                    : "Below is the list of eligible government schemes matched to the applicant. Select one or more schemes to create applications."}
                </p>
              </div>

              {/* Applicant Info Summary Chip */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 flex items-center gap-3 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  {fullName ? fullName.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{fullName || "Applicant"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {mobileNumber} • {districts.find((d) => d.id === selectedDistrict)?.[lang] || "Kerala"}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={schemeSearch}
                  onChange={(e) => setSchemeSearch(e.target.value)}
                  placeholder={lang === "ml" ? "പദ്ധതികൾ തിരയുക..." : "Search eligible schemes..."}
                  className="h-10 pl-9 pr-3 rounded-xl border-border bg-white dark:bg-card text-xs font-semibold"
                />
              </div>

              {/* Category Filter + Select All Toggle */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <select
                  value={schemeCategoryFilter}
                  onChange={(e) => setSchemeCategoryFilter(e.target.value)}
                  className="h-10 appearance-none rounded-xl border border-border bg-white dark:bg-card px-3 text-xs font-semibold outline-none text-foreground"
                >
                  <option value="all">{lang === "ml" ? "എല്ലാ വിഭാഗങ്ങളും" : "All Categories"}</option>
                  <option value="agriculture">{lang === "ml" ? "കൃഷി" : "Agriculture"}</option>
                  <option value="health">{lang === "ml" ? "ആരോഗ്യം" : "Health"}</option>
                  <option value="welfare">{lang === "ml" ? "ക്ഷേമം" : "Welfare"}</option>
                  <option value="women">{lang === "ml" ? "വനിതാ വികസനം" : "Women"}</option>
                  <option value="housing">{lang === "ml" ? "ഭവനം" : "Housing"}</option>
                  <option value="employment">{lang === "ml" ? "തൊഴിൽ" : "Employment"}</option>
                  <option value="msme">{lang === "ml" ? "MSME / സംരംഭങ്ങൾ" : "MSME"}</option>
                </select>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allIds = schemes.map((s) => s.id);
                    if (selectedSchemeIds.size === allIds.length) {
                      setSelectedSchemeIds(new Set());
                    } else {
                      setSelectedSchemeIds(new Set(allIds));
                    }
                  }}
                  className="h-10 text-xs font-bold rounded-xl border-border flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>
                    {selectedSchemeIds.size === schemes.length
                      ? lang === "ml"
                        ? "എല്ലാം ഒഴിവാക്കുക"
                        : "Clear Selection"
                      : lang === "ml"
                      ? "എല്ലാം തിരഞ്ഞെടുക്കുക"
                      : "Select All"}
                  </span>
                </Button>
              </div>
            </div>

            {/* Selected Count Indicator */}
            <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
              <span className="font-bold text-foreground">
                {lang === "ml" ? "ലഭ്യമായ പദ്ധതികൾ" : "Eligible Schemes"}{" "}
                <span className="text-muted-foreground">({schemes.length})</span>
              </span>
              <span className="font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                {selectedSchemeIds.size}{" "}
                {lang === "ml" ? "പദ്ധതികൾ തിരഞ്ഞെടുത്തു" : "Scheme(s) Selected"}
              </span>
            </div>

            {/* Schemes Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {schemes
                .filter((scheme) => {
                  const matchSearch =
                    !schemeSearch ||
                    scheme.en.toLowerCase().includes(schemeSearch.toLowerCase()) ||
                    scheme.ml.includes(schemeSearch);
                  const matchCat =
                    schemeCategoryFilter === "all" || scheme.category === schemeCategoryFilter;
                  return matchSearch && matchCat;
                })
                .map((scheme) => {
                  const isSelected = selectedSchemeIds.has(scheme.id);
                  return (
                    <div
                      key={scheme.id}
                      onClick={() => {
                        setSelectedSchemeIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(scheme.id)) {
                            next.delete(scheme.id);
                          } else {
                            next.add(scheme.id);
                          }
                          return next;
                        });
                      }}
                      className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/[0.04] shadow-xs ring-1 ring-primary"
                          : "border-border bg-card hover:border-border/80 hover:bg-muted/50"
                      }`}
                    >
                      {/* Top Checkbox & Category Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="inline-flex items-center rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-bold text-secondary-foreground uppercase tracking-wide">
                          {scheme.category}
                        </span>
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-white dark:bg-card"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 font-bold" />}
                        </div>
                      </div>

                      {/* Scheme Name */}
                      <div className="space-y-1 mb-3">
                        <h3 className="font-bold text-sm text-foreground leading-snug">
                          {scheme[lang] || scheme.en}
                        </h3>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                          <span>{scheme.ministry[lang] || scheme.ministry.en}</span>
                        </p>
                      </div>

                      {/* Benefits & Eligibility Summary */}
                      <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                        <div className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                          <Tag className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600" />
                          <span>{scheme.benefit[lang] || scheme.benefit.en}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/90 line-clamp-2">
                          <strong>Eligibility:</strong> {scheme.eligibility[lang] || scheme.eligibility.en}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Bottom Actions for Step 3 */}
            <div className="flex items-center justify-between pt-6 border-t border-border/80">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="h-11 px-6 rounded-xl font-bold text-xs cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                <span>{lang === "ml" ? "പുറകിലേക്ക് (ഘട്ടം 2)" : "Back to Step 2"}</span>
              </Button>

              <Button
                type="button"
                onClick={handleFinalSubmitApplications}
                disabled={isSubmitting || selectedSchemeIds.size === 0}
                className="h-12 px-8 rounded-xl font-bold text-xs bg-primary text-primary-foreground shadow-md hover:bg-primary/90 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>
                      {lang === "ml"
                        ? `അപേക്ഷ സമർപ്പിക്കുക (${selectedSchemeIds.size})`
                        : `Create Application (${selectedSchemeIds.size})`}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
