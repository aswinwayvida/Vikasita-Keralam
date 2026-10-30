import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  Check,
  ChevronDown,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Home,
  IndianRupee,
  Landmark,
  Loader2,
  RefreshCw,
  Search,
  SearchCheck,
  Sparkles,
  Sprout,
  Store,
  Send,
  User,
  Users,
  X,
} from "lucide-react";
import { schemes, type Scheme } from "@/data/schemes";
import { constituencies, districts, type LocalBodyType } from "@/data/geo";
import {
  evaluateEligibility,
  type EligibilityAnswers,
  type EligibilityLanguage,
  type EligibilityMatch,
} from "@/lib/eligibility-engine";
import { loadEligibilityProfile, updateEligibilityProfile } from "@/lib/citizen-profile";
import { sendGuestAssistanceRequest } from "@/lib/guest-assistance";

export const GUEST_ELIGIBILITY_SCHEME_KEY = "vk-guest-selected-scheme";

export type GuestEligibilityAnswers = {
  gender: string;
  dob: string;
  age: number | null;
  socialCategory: string;
  minorityStatus: string;
  disabilityStatus: string;
  disabilityPercentage: string;
  studentStatus: string;
  employmentStatus: string;
  occupation: string;
  bplStatus: string;
  annualFamilyIncome: string;
  districtId: string;
  localBodyType: LocalBodyType | "";
  localBodyId: string;
  wardId: string;
  mandalamId: string;
};

type Props = {
  lang: EligibilityLanguage;
  onClose: () => void;
  onHelpRequestSent: () => void;
  onOpenSchemeDetails?: (schemeId: string) => void;
};

type View = "questions" | "loading" | "results" | "browse" | "error" | "success";
type PickerKey = "district" | "mandalam";
type PickerOption = { value: string; label: string; hint?: string };

const EMPTY: GuestEligibilityAnswers = {
  gender: "",
  dob: "",
  age: null,
  socialCategory: "",
  minorityStatus: "",
  disabilityStatus: "",
  disabilityPercentage: "",
  studentStatus: "",
  employmentStatus: "",
  occupation: "",
  bplStatus: "",
  annualFamilyIncome: "",
  districtId: "",
  localBodyType: "",
  localBodyId: "",
  wardId: "",
  mandalamId: "",
};

const TOTAL_STEPS = 10;

const INCOME_OPTIONS = [
  { value: "under1", en: "Below ₹1 lakh", ml: "₹1 ലക്ഷത്തിൽ താഴെ" },
  { value: "oneToTwoFive", en: "₹1–2.5 lakh", ml: "₹1–2.5 ലക്ഷം" },
  { value: "twoFiveToFive", en: "₹2.5–5 lakh", ml: "₹2.5–5 ലക്ഷം" },
  { value: "fiveToEight", en: "₹5–8 lakh", ml: "₹5–8 ലക്ഷം" },
  { value: "aboveEight", en: "Above ₹8 lakh", ml: "₹8 ലക്ഷത്തിന് മുകളിൽ" },
  { value: "unknown", en: "Not sure", ml: "അറിയില്ല" },
];

const OCCUPATION_OPTIONS = [
  { value: "farmer", canonical: "farmer", en: "Farmer / Agriculture", ml: "കർഷകൻ / കൃഷി" },
  { value: "dailyWage", canonical: "unorganised", en: "Daily wage worker", ml: "ദിനബത്ത തൊഴിലാളി" },
  {
    value: "salariedPrivate",
    canonical: "employee",
    en: "Salaried (private)",
    ml: "സ്വകാര്യ മേഖല ഉദ്യോഗസ്ഥൻ",
  },
  {
    value: "salariedGovernment",
    canonical: "employee",
    en: "Salaried (government)",
    ml: "സർക്കാർ ഉദ്യോഗസ്ഥൻ",
  },
  {
    value: "selfEmployed",
    canonical: "selfEmployed",
    en: "Self-employed / Business",
    ml: "സ്വയംതൊഴിൽ / ബിസിനസ്സ്",
  },
  { value: "homemaker", canonical: "homemaker", en: "Homemaker", ml: "ഗൃഹനാഥ / വീട്ടമ്മ" },
  { value: "student", canonical: "student", en: "Student", ml: "വിദ്യാർത്ഥി" },
  { value: "unemployed", canonical: "unemployed", en: "Unemployed", ml: "തൊഴിൽ രഹിതൻ" },
  { value: "retired", canonical: "retired", en: "Retired", ml: "വിരമിച്ച വ്യക്തി" },
  { value: "other", canonical: "", en: "Other", ml: "മറ്റുള്ളവ" },
  { value: "notApplicable", canonical: "", en: "Not applicable", ml: "ബാധകമല്ല" },
];

const CATEGORY_META: Record<Scheme["category"], { en: string; ml: string; Icon: LucideIcon }> = {
  agriculture: { en: "Agriculture", ml: "കൃഷി", Icon: Sprout },
  women: { en: "Women & Child", ml: "വനിത–ശിശു", Icon: HeartHandshake },
  health: { en: "Health", ml: "ആരോഗ്യം", Icon: HeartPulse },
  education: { en: "Education", ml: "വിദ്യാഭ്യാസം", Icon: GraduationCap },
  housing: { en: "Housing", ml: "ഭവനം", Icon: Home },
  employment: { en: "Employment", ml: "തൊഴിൽ", Icon: Briefcase },
  welfare: { en: "Welfare", ml: "ക്ഷേമം", Icon: Users },
  msme: { en: "Business", ml: "സംരംഭം", Icon: Store },
};

const todayIso = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const calculateAge = (dob: string) => {
  if (!dob) return null;
  const birth = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : null;
};

const toEligibilityAnswers = (a: GuestEligibilityAnswers): EligibilityAnswers => {
  const result: EligibilityAnswers = {};
  if (a.gender) result.gender = a.gender;
  if (a.age !== null && Number.isFinite(a.age)) result.age = String(a.age);
  if (a.socialCategory) result.socialCategory = a.socialCategory;
  if (a.minorityStatus) result.minorityStatus = a.minorityStatus;
  if (a.disabilityStatus) result.disabilityStatus = a.disabilityStatus;
  if (a.disabilityStatus === "yes" && a.disabilityPercentage)
    result.disabilityPercentage = a.disabilityPercentage;
  if (a.annualFamilyIncome) result.annualIncome = a.annualFamilyIncome;
  if (a.bplStatus === "yes") result.rationCard = "bpl";
  else if (a.bplStatus === "no") result.rationCard = "apl";
  else if (a.bplStatus === "unknown") result.rationCard = "unknown";
  if (a.districtId)
    result.district =
      a.districtId === "ptm" ? "pta" : a.districtId === "wyd" ? "wnd" : a.districtId;
  if (a.localBodyType) result.residenceType = a.localBodyType === "panchayat" ? "rural" : "urban";
  const selected = OCCUPATION_OPTIONS.find((item) => item.value === a.occupation);
  const fallback =
    a.studentStatus === "yes"
      ? "student"
      : a.employmentStatus === "employed"
        ? "employee"
        : a.employmentStatus === "self_employed"
          ? "selfEmployed"
          : a.employmentStatus === "unemployed"
            ? "unemployed"
            : "";
  const occupation = selected?.canonical || fallback;
  if (occupation) result.occupation = occupation;
  return result;
};

function ChoiceCard({
  selected,
  label,
  helper,
  onClick,
}: {
  selected: boolean;
  label: string;
  helper?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all active:scale-[0.995] ${
        selected
          ? "border-orange-500 bg-orange-50 shadow-[0_0_0_1px_rgba(249,115,22,0.08)]"
          : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-orange-500 bg-orange-500 text-white"
            : "border-slate-300 bg-white text-transparent"
        }`}
      >
        <Check className="h-3 w-3 stroke-[3]" />
      </span>
      <span className="min-w-0">
        <span
          className={`block text-[12.5px] font-extrabold ${selected ? "text-orange-900" : "text-slate-800"}`}
        >
          {label}
        </span>
        {helper ? (
          <span
            className={`mt-0.5 block text-[10px] font-medium leading-snug ${selected ? "text-orange-700" : "text-slate-500"}`}
          >
            {helper}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function SearchableSelect({
  label,
  valueLabel,
  placeholder,
  searchPlaceholder,
  options,
  disabled,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  valueLabel: string;
  placeholder: string;
  searchPlaceholder: string;
  options: PickerOption[];
  disabled?: boolean;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);
  const filtered = options.filter((option) => {
    const normalized = query.trim().toLocaleLowerCase();
    return (
      !normalized || `${option.label} ${option.hint ?? ""}`.toLocaleLowerCase().includes(normalized)
    );
  });
  return (
    <div className="space-y-1">
      <label className="block text-[10.5px] font-extrabold text-slate-700">{label}</label>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-[11.5px] transition-colors ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : "cursor-pointer border-slate-200 bg-white text-slate-800 hover:border-orange-300"
        }`}
      >
        <span className={valueLabel ? "font-bold text-slate-800" : "text-slate-400"}>
          {valueLabel || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && !disabled ? (
        <div className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-md">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-[11.5px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[9.5px] font-bold text-orange-600"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="max-h-52 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-center text-[10.5px] font-medium text-slate-500">
                No matches found
              </p>
            ) : (
              filtered.map((option) => {
                const isSelected = valueLabel === option.label;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSelect(option.value)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      isSelected
                        ? "bg-orange-50 text-orange-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold">{option.label}</span>
                      {option.hint ? (
                        <span className="mt-0.5 block text-[9px] text-slate-500">
                          {option.hint}
                        </span>
                      ) : null}
                    </span>
                    {isSelected ? <Check className="h-3.5 w-3.5 shrink-0 stroke-[3]" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MobileGuestEligibilityQuestionnaire({
  lang,
  onClose,
  onHelpRequestSent,
  onOpenSchemeDetails,
}: Props) {
  const t = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const [answers, setAnswers] = useState<GuestEligibilityAnswers>(EMPTY);
  const [step, setStep] = useState(1);
  const [view, setView] = useState<View>("questions");
  const [results, setResults] = useState<EligibilityMatch[]>([]);
  const [resultQuery, setResultQuery] = useState("");
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [resultError, setResultError] = useState("");
  const [dobError, setDobError] = useState("");
  const [occupationQuery, setOccupationQuery] = useState("");
  const [browseQuery, setBrowseQuery] = useState("");
  const [browseCategory, setBrowseCategory] = useState("all");
  const [selectedSchemeIds, setSelectedSchemeIds] = useState<string[]>([]);
  const [assistanceOpen, setAssistanceOpen] = useState(false);
  const [assistanceName, setAssistanceName] = useState(
    () => loadEligibilityProfile().fullName ?? "",
  );
  const [assistanceMobile, setAssistanceMobile] = useState(
    () => loadEligibilityProfile().mobile ?? "",
  );
  const [assistanceNotes, setAssistanceNotes] = useState("");
  const [assistanceDistrictId, setAssistanceDistrictId] = useState("");
  const [assistanceMandalamId, setAssistanceMandalamId] = useState("");
  const [assistanceConsent, setAssistanceConsent] = useState(false);
  const [assistanceErrors, setAssistanceErrors] = useState<Record<string, string>>({});
  const [assistanceSending, setAssistanceSending] = useState(false);
  const [assistanceSubmitError, setAssistanceSubmitError] = useState("");
  const [assistanceStep, setAssistanceStep] = useState<"form" | "otp" | "success">("form");
  const [assistanceOtp, setAssistanceOtp] = useState("");
  const [assistanceOtpError, setAssistanceOtpError] = useState("");
  const [schemeNamesExpanded, setSchemeNamesExpanded] = useState(false);
  const [requestReference, setRequestReference] = useState("");
  const [openPicker, setOpenPicker] = useState<PickerKey | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef(onHelpRequestSent);
  const today = todayIso();

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [step, view]);
  useEffect(() => {
    exitRef.current = onHelpRequestSent;
  }, [onHelpRequestSent]);
  useEffect(() => {
    if (view !== "success") return;
    const timer = window.setTimeout(() => exitRef.current(), 3600);
    return () => window.clearTimeout(timer);
  }, [view]);

  const selectedDistrict = districts.find((district) => district.id === assistanceDistrictId);
  const districtConstituencies = constituencies.filter(
    (item) => item.districtId === assistanceDistrictId,
  );
  const selectedMandalam = districtConstituencies.find((item) => item.id === assistanceMandalamId);
  const selectedOccupation = OCCUPATION_OPTIONS.find((item) => item.value === answers.occupation);
  const filteredOccupations = OCCUPATION_OPTIONS.filter((option) => {
    const normalized = occupationQuery.trim().toLocaleLowerCase();
    return !normalized || `${option.en} ${option.ml}`.toLocaleLowerCase().includes(normalized);
  });
  const matchedResults = results.filter((match) => match.status !== "not-matched");
  const filteredResults = matchedResults.filter((match) => {
    const normalized = resultQuery.trim().toLocaleLowerCase();
    if (!normalized) return true;
    const scheme = match.scheme;
    return `${scheme.en} ${scheme.ml} ${scheme.benefit.en} ${scheme.benefit.ml} ${scheme.ministry.en} ${scheme.ministry.ml}`
      .toLocaleLowerCase()
      .includes(normalized);
  });
  const selectedSchemes = selectedSchemeIds.flatMap((id) => {
    const scheme = schemes.find((item) => item.id === id);
    return scheme ? [scheme] : [];
  });
  const browseCategories = Array.from(new Set(schemes.map((scheme) => scheme.category)));
  const browsedSchemes = schemes.filter((scheme) => {
    const normalized = browseQuery.trim().toLocaleLowerCase();
    const queryMatch =
      !normalized ||
      `${scheme.en} ${scheme.ml} ${scheme.benefit.en} ${scheme.benefit.ml} ${scheme.ministry.en} ${scheme.ministry.ml}`
        .toLocaleLowerCase()
        .includes(normalized);
    return queryMatch && (browseCategory === "all" || scheme.category === browseCategory);
  });

  const isAllResultsSelected =
    filteredResults.length > 0 &&
    filteredResults.every((match) => selectedSchemeIds.includes(match.scheme.id));

  const toggleSelectAllResults = () => {
    const allIds = filteredResults.map((match) => match.scheme.id);
    if (isAllResultsSelected) {
      setSelectedSchemeIds((current) => current.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedSchemeIds((current) => Array.from(new Set([...current, ...allIds])));
    }
  };

  const isAllBrowsedSelected =
    browsedSchemes.length > 0 &&
    browsedSchemes.every((scheme) => selectedSchemeIds.includes(scheme.id));

  const toggleSelectAllBrowsed = () => {
    const allIds = browsedSchemes.map((scheme) => scheme.id);
    if (isAllBrowsedSelected) {
      setSelectedSchemeIds((current) => current.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedSchemeIds((current) => Array.from(new Set([...current, ...allIds])));
    }
  };

  const canContinue = (() => {
    if (step === 1) return Boolean(answers.gender);
    if (step === 2) return Boolean(answers.dob && answers.age !== null && !dobError);
    if (step === 3) return Boolean(answers.socialCategory);
    if (step === 4) return Boolean(answers.minorityStatus);
    if (step === 5) return Boolean(answers.disabilityStatus);
    if (step === 6) return Boolean(answers.studentStatus);
    if (step === 7) return Boolean(answers.employmentStatus);
    if (step === 8) return Boolean(answers.occupation);
    if (step === 9) return Boolean(answers.bplStatus);
    if (step === 10) return Boolean(answers.annualFamilyIncome);
    return true;
  })();

  const update = (patch: Partial<GuestEligibilityAnswers>) =>
    setAnswers((current) => ({ ...current, ...patch }));

  const goBack = () => {
    if (view === "success") {
      onHelpRequestSent();
      return;
    }
    if (view === "browse") {
      setView(matchedResults.length ? "results" : "questions");
      if (!matchedResults.length) setStep(10);
      return;
    }
    if (view === "results" || view === "error") {
      setView("questions");
      setStep(10);
      return;
    }
    if (view === "loading") return;
    if (step === 1) {
      onClose();
      return;
    }
    setStep((current) => Math.max(1, current - 1));
  };

  const handleDobChange = (value: string) => {
    if (!value) {
      update({ dob: "", age: null });
      setDobError("");
      return;
    }
    if (value > today) {
      setDobError(t("Date of birth cannot be in the future.", "ജനന തീയതി ഭാവിയിലാകാന്‍ പാടില്ല."));
      update({ dob: value, age: null });
      return;
    }
    setDobError("");
    update({ dob: value, age: calculateAge(value) });
  };

  const handleAssistanceDistrictChange = (value: string) => {
    setAssistanceDistrictId(value);
    setAssistanceMandalamId("");
    setOpenPicker(null);
  };
  const handleAssistanceMandalamChange = (value: string) => {
    setAssistanceMandalamId(value);
    setOpenPicker(null);
  };

  const runCheck = () => {
    setResultError("");
    setView("loading");
    window.setTimeout(() => {
      try {
        const canonical = toEligibilityAnswers(answers);
        setResults(
          evaluateEligibility(canonical, schemes).filter((match) => match.status !== "not-matched"),
        );
        setView("results");
      } catch {
        setResultError(
          t(
            "We could not check scheme matches right now. Please try again.",
            "പദ്ധതി പൊരുത്തം പരിശോധിക്കാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
          ),
        );
        setView("error");
      }
    }, 650);
  };

  const next = () => {
    if (!canContinue) return;
    if (step === TOTAL_STEPS) {
      runCheck();
      return;
    }
    setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  };
  const skip = () =>
    step === TOTAL_STEPS ? runCheck() : setStep((current) => Math.min(TOTAL_STEPS, current + 1));

  const toggleScheme = (schemeId: string) => {
    setSelectedSchemeIds((current) =>
      current.includes(schemeId) ? current.filter((id) => id !== schemeId) : [...current, schemeId],
    );
  };

  const openAssistance = () => {
    if (!selectedSchemeIds.length) return;
    const profile = loadEligibilityProfile();
    setAssistanceName((current) => current || profile.fullName || "");
    setAssistanceMobile((current) => current || profile.mobile || "");
    setAssistanceErrors({});
    setAssistanceSubmitError("");
    setAssistanceStep("form");
    setAssistanceOtp("");
    setAssistanceOtpError("");
    setSchemeNamesExpanded(false);
    setOpenPicker(null);
    setAssistanceOpen(true);
  };

  const closeAssistance = () => {
    if (assistanceSending) return;
    setOpenPicker(null);
    setAssistanceStep("form");
    setAssistanceOtp("");
    setAssistanceOtpError("");
    setAssistanceOpen(false);
  };

  const submitAssistance = async () => {
    if (assistanceSending) return;
    const nextErrors: Record<string, string> = {};
    if (!selectedSchemeIds.length)
      nextErrors.schemes = t(
        "Select at least one scheme.",
        "കുറഞ്ഞത് ഒരു പദ്ധതിയെങ്കിലും തിരഞ്ഞെടുക്കുക.",
      );
    if (assistanceName.trim().length < 2)
      nextErrors.name = t("Enter your full name.", "നിങ്ങളുടെ മുഴുവൻ പേര് നൽകുക.");
    if (!/^\d{10}$/.test(assistanceMobile.trim()))
      nextErrors.mobile = t(
        "Enter a valid 10-digit mobile number.",
        "സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.",
      );
    if (!assistanceConsent)
      nextErrors.consent = t(
        "Please agree to share your details.",
        "വിവരങ്ങൾ പങ്കിടാൻ സമ്മതിക്കുക.",
      );
    setAssistanceErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setAssistanceSubmitError("");
    setAssistanceOtp("");
    setAssistanceOtpError("");
    setAssistanceStep("otp");
  };

  const verifyAndSubmitAssistance = async () => {
    if (assistanceSending) return;
    const cleanOtp = assistanceOtp.trim();
    if (cleanOtp.length < 6) {
      setAssistanceOtpError(
        t("Enter the 6-digit OTP code.", "6 അക്ക OTP നൽകുക."),
      );
      return;
    }
    if (cleanOtp !== "123456") {
      setAssistanceOtpError(
        t("Invalid OTP code. (Demo OTP: 123456)", "തെറ്റായ OTP. (ഡെമോ OTP: 123456)"),
      );
      return;
    }

    setAssistanceOtpError("");
    setAssistanceSubmitError("");
    setAssistanceSending(true);
    const result = await sendGuestAssistanceRequest({
      answers: {
        ...answers,
        districtId: assistanceDistrictId,
        localBodyType: "",
        localBodyId: "",
        wardId: "",
        mandalamId: assistanceMandalamId,
      },
      schemeIds: selectedSchemeIds,
      fullName: assistanceName,
      mobile: assistanceMobile,
      notes: assistanceNotes,
    });
    setAssistanceSending(false);
    if (!result.ok) {
      setAssistanceSubmitError(
        t(
          "We could not send your request. Please try again.",
          "അഭ്യർത്ഥന അയക്കാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
        ),
      );
      return;
    }

    updateEligibilityProfile({ fullName: assistanceName.trim(), mobile: assistanceMobile.trim() });
    try {
      sessionStorage.removeItem(GUEST_ELIGIBILITY_SCHEME_KEY);
    } catch {
      /* Guest handoff is complete. */
    }
    setRequestReference(result.reference);
    setAssistanceStep("success");
  };

  const renderStepIcon = () => {
    const icons: Record<number, LucideIcon> = {
      1: User,
      2: CalendarDays,
      3: Users,
      4: HeartHandshake,
      5: Accessibility,
      6: GraduationCap,
      7: Briefcase,
      8: Sparkles,
      9: Landmark,
      10: IndianRupee,
    };
    const Icon = icons[step];
    return (
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500 ring-1 ring-orange-100">
        <Icon className="h-8 w-8 stroke-[1.8]" />
      </div>
    );
  };

  const QuestionHeader = ({ title, helper }: { title: string; helper: string }) => (
    <div className="space-y-1 text-center">
      <h2 className="text-[17px] font-extrabold leading-snug text-slate-900">{title}</h2>
      <p className="text-[11px] font-medium leading-relaxed text-slate-500">{helper}</p>
    </div>
  );

  const renderQuestion = () => {
    if (step === 1) {
      return (
        <>
          {renderStepIcon()}
          <QuestionHeader
            title={t("What is your gender?", "നിങ്ങളുടെ ലിംഗം ഏതാണ്?")}
            helper={t(
              "This helps us identify schemes with gender-specific benefits.",
              "ലിംഗാധിഷ്ഠിത ആനുകൂല്യങ്ങളുള്ള പദ്ധതികൾ കണ്ടെത്താൻ ഇത് സഹായിക്കും.",
            )}
          />
          <div className="space-y-2">
            {[
              { value: "male", en: "Male", ml: "പുരുഷൻ" },
              { value: "female", en: "Female", ml: "സ്ത്രീ" },
              { value: "transgender", en: "Other", ml: "മറ്റുള്ളവർ" },
              { value: "prefer_not", en: "Prefer not to say", ml: "പറയാൻ താൽപര്യമില്ല" },
            ].map((option) => (
              <ChoiceCard
                key={option.value}
                selected={answers.gender === option.value}
                label={t(option.en, option.ml)}
                onClick={() => update({ gender: option.value })}
              />
            ))}
          </div>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          {renderStepIcon()}
          <QuestionHeader
            title={t("What is your date of birth?", "നിങ്ങളുടെ ജനന തീയതി എന്താണ്?")}
            helper={t(
              "Your age is calculated automatically to check age-based schemes.",
              "പ്രായാധിഷ്ഠിത പദ്ധതികൾ പരിശോധിക്കാൻ പ്രായം സ്വയം കണക്കാക്കും.",
            )}
          />
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-extrabold text-slate-700">
              {t("Date of birth", "ജനന തീയതി")}
            </label>
            <div className="relative">
              <input
                type="date"
                value={answers.dob}
                max={today}
                onChange={(event) => handleDobChange(event.target.value)}
                className={`w-full rounded-xl border bg-white px-3 py-3 pr-10 text-[12px] font-bold text-slate-800 outline-none focus:border-orange-400 ${dobError ? "border-rose-400" : "border-slate-200"}`}
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {dobError ? (
              <p className="text-[10px] font-semibold text-rose-600">{dobError}</p>
            ) : null}
          </div>
          <div className="rounded-xl border border-orange-100 bg-orange-50/60 px-3.5 py-3">
            <p className="text-[10.5px] font-bold text-orange-700">{t("Age", "പ്രായം")}</p>
            <p className="mt-0.5 text-[13px] font-extrabold text-slate-900">
              {answers.age === null
                ? t("Enter a date of birth", "ജനന തീയതി നൽകുക")
                : t(`${answers.age} years`, `${answers.age} വയസ്സ്`)}
            </p>
            <p className="mt-1 text-[9.5px] font-medium text-slate-500">
              {t(
                "Age is calculated automatically. Future dates are not allowed.",
                "പ്രായം സ്വയം കണക്കാക്കും. ഭാവി തീയതികൾ അനുവദനീയമല്ല.",
              )}
            </p>
          </div>
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          {renderStepIcon()}
          <QuestionHeader
            title={t("What is your social category?", "നിങ്ങളുടെ സാമൂഹിക വിഭാഗം ഏതാണ്?")}
            helper={t(
              "Choose the category shown in your records. Used only to find category-linked benefits.",
              "രേഖകളിൽ കാണുന്ന വിഭാഗം തിരഞ്ഞെടുക്കുക. വിഭാഗാധിഷ്ഠിത ആനുകൂല്യങ്ങൾക്ക് മാത്രം.",
            )}
          />
          <div className="space-y-2">
            {[
              { value: "general", en: "General", ml: "ജനറൽ" },
              { value: "obc", en: "OBC / SEBC", ml: "OBC / SEBC" },
              { value: "sc", en: "Scheduled Caste (SC)", ml: "പട്ടികജാതി (SC)" },
              { value: "st", en: "Scheduled Tribe (ST)", ml: "പട്ടികവർഗം (ST)" },
              { value: "prefer_not", en: "Prefer not to say", ml: "പറയാൻ താൽപര്യമില്ല" },
            ].map((option) => (
              <ChoiceCard
                key={option.value}
                selected={answers.socialCategory === option.value}
                label={t(option.en, option.ml)}
                onClick={() => update({ socialCategory: option.value })}
              />
            ))}
          </div>
        </>
      );
    }

    if (step === 4) {
      return (
        <>
          {renderStepIcon()}
          <QuestionHeader
            title={t(
              "Do you belong to a minority community?",
              "ന്യൂനപക്ഷ വിഭാഗത്തിൽ ഉൾപ്പെടുന്നുണ്ടോ?",
            )}
            helper={t(
              "Used only to find minority scholarships and support.",
              "ന്യൂനപക്ഷ സ്കോളർഷിപ്പുകളും സഹായങ്ങളും കണ്ടെത്താൻ മാത്രം.",
            )}
          />
          <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5">
            <p className="text-[10px] font-medium leading-relaxed text-sky-800">
              {t(
                "This refers to communities notified as minorities by the Government of India. Not sure is treated as missing information, not as a negative answer.",
                "ഭാരത സർക്കാർ ന്യൂനപക്ഷമായി വിജ്ഞാപനം ചെയ്ത വിഭാഗങ്ങളെയാണ് ഇത് സൂചിപ്പിക്കുന്നത്. 'അറിയില്ല' വിവരം ലഭ്യമല്ല എന്നാണ് പരിഗണിക്കുന്നത്.",
              )}
            </p>
          </div>
          <div className="space-y-2">
            {[
              { value: "yes", en: "Yes", ml: "അതെ" },
              { value: "no", en: "No", ml: "അല്ല" },
              { value: "unknown", en: "Not sure", ml: "അറിയില്ല" },
            ].map((option) => (
              <ChoiceCard
                key={option.value}
                selected={answers.minorityStatus === option.value}
                label={t(option.en, option.ml)}
                onClick={() => update({ minorityStatus: option.value })}
              />
            ))}
          </div>
        </>
      );
    }

    if (step === 5) {
      return (
        <>
          {renderStepIcon()}
          <QuestionHeader
            title={t("Are you a person with a disability?", "നിങ്ങൾക്ക് ഭിന്നശേഷിയുണ്ടോ?")}
            helper={t(
              "Additional details may be needed for specific schemes.",
              "ചില പദ്ധതികൾക്ക് അധിക വിവരങ്ങൾ ആവശ്യമായേക്കാം.",
            )}
          />
          <div className="space-y-2">
            {[
              { value: "yes", en: "Yes", ml: "അതെ" },
              { value: "no", en: "No", ml: "അല്ല" },
            ].map((option) => (
              <ChoiceCard
                key={option.value}
                selected={answers.disabilityStatus === option.value}
                label={t(option.en, option.ml)}
                onClick={() =>
                  update({
                    disabilityStatus: option.value,
                    disabilityPercentage:
                      option.value === "yes" ? answers.disabilityPercentage : "",
                  })
                }
              />
            ))}
          </div>
          {answers.disabilityStatus === "yes" ? (
            <div className="space-y-2 rounded-xl border border-orange-200 bg-orange-50/50 p-3">
              <div>
                <p className="text-[11px] font-extrabold text-slate-900">
                  {t("Disability percentage", "ഭിന്നശേഷി ശതമാനം")}
                </p>
                <p className="mt-0.5 text-[9.5px] font-medium leading-snug text-slate-500">
                  {t(
                    "Choose the approximate range on your certificate. You can select Not sure.",
                    "സർട്ടിഫിക്കറ്റിലെ ഏകദേശ പരിധി തിരഞ്ഞെടുക്കുക. അറിയില്ല എന്നും തിരഞ്ഞെടുക്കാം.",
                  )}
                </p>
              </div>
              <div className="space-y-2">
                {[
                  { value: "below40", en: "Below 40%", ml: "40%-ൽ താഴെ" },
                  { value: "fortyPlus", en: "40% or above", ml: "40% അല്ലെങ്കിൽ കൂടുതൽ" },
                  { value: "unknown", en: "Not sure", ml: "അറിയില്ല" },
                ].map((option) => (
                  <ChoiceCard
                    key={option.value}
                    selected={answers.disabilityPercentage === option.value}
                    label={t(option.en, option.ml)}
                    onClick={() => update({ disabilityPercentage: option.value })}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </>
      );
    }

    if (step === 6) {
      return (
        <>
          {renderStepIcon()}
          <QuestionHeader
            title={t("Are you currently a student?", "നിങ്ങൾ നിലവിൽ വിദ്യാർത്ഥിയാണോ?")}
            helper={t(
              "You can be a student and also employed. This is stored separately from employment status.",
              "വിദ്യാർത്ഥിയായിരിക്കെ തൊഴിലും ചെയ്യാം. ഇത് തൊഴിൽ നിലയിൽ നിന്ന് വെവ്വേറെ സൂക്ഷിക്കും.",
            )}
          />
          <div className="space-y-2">
            {[
              { value: "yes", en: "Yes", ml: "അതെ" },
              { value: "no", en: "No", ml: "അല്ല" },
            ].map((option) => (
              <ChoiceCard
                key={option.value}
                selected={answers.studentStatus === option.value}
                label={t(option.en, option.ml)}
                onClick={() => update({ studentStatus: option.value })}
              />
            ))}
          </div>
        </>
      );
    }

    if (step === 7) {
      return (
        <>
          {renderStepIcon()}
          <QuestionHeader
            title={t("What is your employment status?", "നിങ്ങളുടെ തൊഴിൽ നില എന്താണ്?")}
            helper={t(
              "Choose your current situation. This is stored separately from student status.",
              "നിലവിലെ സ്ഥിതി തിരഞ്ഞെടുക്കുക. ഇത് വിദ്യാർത്ഥി നിലയിൽ നിന്ന് വെവ്വേറെ സൂക്ഷിക്കും.",
            )}
          />
          <div className="space-y-2">
            {[
              { value: "employed", en: "Employed", ml: "തൊഴിലുള്ളവർ" },
              { value: "self_employed", en: "Self-employed", ml: "സ്വയംതൊഴിൽ / സംരംഭകൻ" },
              { value: "unemployed", en: "Unemployed", ml: "തൊഴിലില്ലാത്തവർ" },
            ].map((option) => (
              <ChoiceCard
                key={option.value}
                selected={answers.employmentStatus === option.value}
                label={t(option.en, option.ml)}
                onClick={() => update({ employmentStatus: option.value })}
              />
            ))}
          </div>
        </>
      );
    }

    if (step === 8) {
      return (
        <>
          {renderStepIcon()}
          <QuestionHeader
            title={t("What is your occupation?", "നിങ്ങളുടെ തൊഴിൽ എന്താണ്?")}
            helper={t(
              "Search the list and choose the closest option. Select Not applicable if none apply.",
              "പട്ടികയിൽ തിരഞ്ഞ് ഏറ്റവും അടുത്ത ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക. ബാധകമല്ലെങ്കിൽ 'ബാധകമല്ല' തിരഞ്ഞെടുക്കുക.",
            )}
          />
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={occupationQuery}
                onChange={(event) => setOccupationQuery(event.target.value)}
                placeholder={t("Search occupations", "തൊഴിലുകൾ തിരയുക")}
                className="min-w-0 flex-1 bg-transparent text-[11.5px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
              {occupationQuery ? (
                <button
                  type="button"
                  onClick={() => setOccupationQuery("")}
                  className="text-[9.5px] font-bold text-orange-600"
                >
                  {t("Clear", "മായ്ക്കുക")}
                </button>
              ) : null}
            </div>
            {selectedOccupation ? (
              <p className="rounded-xl border border-orange-100 bg-orange-50/70 px-3 py-2 text-[9.5px] font-bold text-orange-700">
                {t("Selected", "തിരഞ്ഞെടുത്തത്")}: {t(selectedOccupation.en, selectedOccupation.ml)}
              </p>
            ) : null}
            <div className="max-h-64 space-y-2 overflow-y-auto pr-0.5">
              {filteredOccupations.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-[10.5px] font-medium text-slate-500">
                  {t(
                    "No occupation matches your search.",
                    "തിരയലുമായി പൊരുത്തപ്പെടുന്ന തൊഴിൽ ഇല്ല.",
                  )}
                </p>
              ) : (
                filteredOccupations.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    selected={answers.occupation === option.value}
                    label={t(option.en, option.ml)}
                    onClick={() => update({ occupation: option.value })}
                  />
                ))
              )}
            </div>
          </div>
        </>
      );
    }

    if (step === 9) {
      return (
        <>
          {renderStepIcon()}
          <QuestionHeader
            title={t(
              "Does your household have BPL status?",
              "നിങ്ങളുടെ കുടുംബത്തിന് BPL നിലയുണ്ടോ?",
            )}
            helper={t(
              "BPL means Below Poverty Line. This is used only for scheme screening.",
              "BPL എന്നാൽ ദാരിദ്ര്യരേഖയ്ക്ക് താഴെ എന്നാണ്. പദ്ധതി പരിശോധനയ്ക്ക് മാത്രം.",
            )}
          />
          <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5">
            <p className="text-[10px] font-medium leading-relaxed text-sky-800">
              {t(
                "BPL status usually refers to households included in the priority or Below Poverty Line list. If you are unsure, select Not sure.",
                "BPL നില സാധാരണയായി മുൻഗണനാ അല്ലെങ്കിൽ ദാരിദ്ര്യരേഖയ്ക്ക് താഴെയുള്ള പട്ടികയിൽ ഉള്ള കുടുംബങ്ങളെ സൂചിപ്പിക്കുന്നു. ഉറപ്പില്ലെങ്കിൽ 'അറിയില്ല' തിരഞ്ഞെടുക്കുക.",
              )}
            </p>
          </div>
          <div className="space-y-2">
            {[
              { value: "yes", en: "Yes", ml: "അതെ" },
              { value: "no", en: "No", ml: "അല്ല" },
              { value: "unknown", en: "Not sure", ml: "അറിയില്ല" },
            ].map((option) => (
              <ChoiceCard
                key={option.value}
                selected={answers.bplStatus === option.value}
                label={t(option.en, option.ml)}
                onClick={() => update({ bplStatus: option.value })}
              />
            ))}
          </div>
        </>
      );
    }

    if (step === 10) {
      return (
        <>
          {renderStepIcon()}
          <QuestionHeader
            title={t(
              "What is your annual family income?",
              "നിങ്ങളുടെ വാർഷിക കുടുംബ വരുമാനം എത്രയാണ്?",
            )}
            helper={t(
              "Choose the range closest to your household's total annual income. No exact amount is required now.",
              "കുടുംബത്തിന്റെ ആകെ വാർഷിക വരുമാനത്തോട് ഏറ്റവും അടുത്ത പരിധി തിരഞ്ഞെടുക്കുക. ഇപ്പോൾ കൃത്യമായ തുക വേണ്ട.",
            )}
          />
          <div className="space-y-2">
            {INCOME_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                selected={answers.annualFamilyIncome === option.value}
                label={t(option.en, option.ml)}
                onClick={() => update({ annualFamilyIncome: option.value })}
              />
            ))}
          </div>
          <p className="text-[9.5px] font-medium leading-relaxed text-slate-500">
            {t(
              "These ranges follow the existing eligibility rules. Missing information is treated as More information needed, not as ineligible.",
              "ഈ പരിധികൾ നിലവിലുള്ള യോഗ്യതാ നിയമങ്ങളെ അടിസ്ഥാനമാക്കിയുള്ളതാണ്. വിവരം ലഭ്യമല്ലെങ്കിൽ 'കൂടുതൽ വിവരം ആവശ്യം' എന്നാണ് പരിഗണിക്കുക.",
            )}
          </p>
        </>
      );
    }

    return null;
  };

  const getSchemeLogoSrc = (scheme: Scheme) => {
    const title = (scheme.en || "").toLowerCase();
    if (/(kisan|pm-kisan|pm kisan)/.test(title)) {
      return "/pm-kisan-logo.png";
    }
    if (/(farmer|agri|crop)/.test(title) || scheme.category === "agriculture") {
      return "/images/category-icons/cat_agriculture.png";
    }
    if (/(karunya|arogya|health|hospital|pmjay)/.test(title) || scheme.category === "health") {
      return "/images/category-icons/cat_health.png";
    }
    if (/(life mission|housing|home|shelter|awas)/.test(title) || scheme.category === "housing") {
      return "/images/category-icons/cat_housing.png";
    }
    if (/(pension|vayoshreshtha|bima|apy|pmsby|pmjjby)/.test(title) || scheme.category === "welfare") {
      return "/images/category-icons/cat_banking.png";
    }
    if (scheme.category === "women") {
      return "/images/category-icons/cat_women.png";
    }
    if (scheme.category === "education") {
      return "/images/category-icons/cat_education.png";
    }
    if (scheme.category === "msme") {
      return "/images/category-icons/cat_business.png";
    }
    return "/images/category-icons/cat_governance.png";
  };

  const renderSchemeCard = (scheme: Scheme, match?: EligibilityMatch) => {
    const meta = CATEGORY_META[scheme.category];
    const strong = match?.status === "strong";
    const possible = match?.status === "possible";
    const isSelected = selectedSchemeIds.includes(scheme.id);
    const logoSrc = getSchemeLogoSrc(scheme);

    return (
      <button
        type="button"
        key={scheme.id}
        role="checkbox"
        aria-checked={isSelected}
        aria-label={`${lang === "ml" ? "പദ്ധതി തിരഞ്ഞെടുക്കുക" : "Select scheme"}: ${lang === "ml" ? scheme.ml : scheme.en}`}
        onClick={() => toggleScheme(scheme.id)}
        className={`w-full cursor-pointer bg-card px-3 py-2.5 rounded-2xl border shadow-2xs transition-all space-y-1.5 text-left ${
          isSelected
            ? "border-orange-400 bg-orange-50/40 ring-2 ring-orange-200/80 dark:border-orange-700 dark:bg-orange-950/20 dark:ring-orange-900/60"
            : "border-border hover:border-orange-300 dark:hover:border-orange-800 bg-white dark:bg-slate-900"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-orange-100 bg-white p-0.5 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
              <img
                src={logoSrc}
                alt=""
                aria-hidden
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/pm-kisan-logo.png";
                }}
              />
            </span>
            <div className="min-w-0">
              <h4
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSchemeDetails?.(scheme.id);
                }}
                className="font-bold text-[13px] text-foreground leading-snug break-words hover:text-orange-600 dark:hover:text-orange-400 hover:underline cursor-pointer"
              >
                {lang === "ml" ? scheme.ml : scheme.en}
              </h4>
              <p className="mt-0.5 text-[10.5px] font-semibold text-muted-foreground leading-snug">
                {lang === "ml" ? meta.ml : meta.en}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              aria-hidden="true"
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? "border-orange-500 bg-orange-500 text-white shadow-xs"
                  : "border-orange-300 bg-white hover:border-orange-500 dark:border-orange-900 dark:bg-slate-900"
              }`}
            >
              {isSelected && <Check className="h-2.5 w-2.5 stroke-[4]" />}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-snug">
          {lang === "ml" ? scheme.benefit.ml : scheme.benefit.en}
        </p>
      </button>
    );
  };

  const renderHeader = (title: string, progress: boolean) => (
    <div className="sticky top-0 z-20 shrink-0 border-b border-slate-200 bg-[#FFFDF9]/95 px-3 pb-2 pt-1.5 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goBack}
          disabled={view === "loading"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-orange-50 disabled:opacity-40"
          aria-label={t("Back", "തിരികെ")}
        >
          <ArrowLeft className="h-4.5 w-4.5 stroke-[2.2]" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[12.5px] font-extrabold text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(view === "results" || view === "browse") && (
            <button
              type="button"
              onClick={() => setShowHeaderSearch((prev) => !prev)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                showHeaderSearch || resultQuery ? "bg-orange-100 text-orange-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              aria-label={t("Search schemes", "പദ്ധതികൾ തിരയുക")}
            >
              <Search className="h-4 w-4 stroke-[2.2]" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label={t("Close eligibility check", "യോഗ്യതാ പരിശോധന അടയ്ക്കുക")}
          >
            <X className="h-4 w-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
      {(showHeaderSearch || resultQuery) && (view === "results" || view === "browse") && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
          <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <input
            autoFocus
            value={resultQuery}
            onChange={(event) => setResultQuery(event.target.value)}
            placeholder={t("Search schemes...", "പദ്ധതികൾ തിരയുക...")}
            className="min-w-0 flex-1 bg-transparent text-[11px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
          {resultQuery ? (
            <button
              type="button"
              onClick={() => setResultQuery("")}
              className="text-[9.5px] font-bold text-orange-600"
            >
              {t("Clear", "മായ്ക്കുക")}
            </button>
          ) : null}
        </div>
      )}
      {progress ? (
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-[9px] font-extrabold text-slate-500">
            <span>{t(`Step ${step} of ${TOTAL_STEPS}`, `ഘട്ടം ${step} / ${TOTAL_STEPS}`)}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-orange-100"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderResults = () => (
    <>
      {matchedResults.length > 0 ? (
        filteredResults.length > 0 ? (
          <>
            <div className="flex items-center justify-between pb-0.5 pt-0.5">
              <p className="text-[12px] font-semibold text-slate-500">
                {t(
                  `${filteredResults.length} eligible scheme${filteredResults.length === 1 ? "" : "s"}`,
                  `${filteredResults.length} അനുയോജ്യ പദ്ധതികൾ`,
                )}
              </p>
              <button
                type="button"
                onClick={toggleSelectAllResults}
                className="flex items-center gap-1.5 cursor-pointer text-[12px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-all active:scale-95 ${
                    isAllResultsSelected
                      ? "border-orange-500 bg-orange-500 text-white shadow-xs"
                      : "border-orange-300 bg-white hover:border-orange-500 dark:border-orange-900 dark:bg-slate-900"
                  }`}
                >
                  {isAllResultsSelected && <Check className="h-2.5 w-2.5 stroke-[4]" />}
                </span>
                <span>{t("Select all", "എല്ലാം തിരഞ്ഞെടുക്കുക")}</span>
              </button>
            </div>
            <div className="space-y-2">
              {filteredResults.map((match) => renderSchemeCard(match.scheme, match))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-[11px] font-bold text-slate-700">
              {t("No eligible schemes found", "അനുയോജ്യമായ പദ്ധതികൾ കണ്ടെത്തിയില്ല")}
            </p>
            <p className="mt-1 text-[9.5px] font-medium text-slate-500">
              {t(
                "Try a different search, or explore all schemes below.",
                "മറ്റൊരു തിരയൽ ശ്രമിക്കുകയോ താഴെയുള്ള എല്ലാ പദ്ധതികളും കാണുകയോ ചെയ്യുക.",
              )}
            </p>
            <button
              type="button"
              onClick={() => setResultQuery("")}
              className="mt-2.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-[9.5px] font-extrabold text-orange-700"
            >
              {t("Clear search", "തിരയൽ മായ്ക്കുക")}
            </button>
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
          <SearchCheck className="mx-auto h-9 w-9 text-slate-300" />
          <h3 className="mt-2 text-[13px] font-extrabold text-slate-900">
            {t(
              "No schemes matched your answers",
              "നിങ്ങളുടെ ഉത്തരങ്ങളുമായി പൊരുത്തപ്പെടുന്ന പദ്ധതികളില്ല",
            )}
          </h3>
          <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">
            {t(
              "Try editing your answers, or browse all schemes to explore other options.",
              "ഉത്തരങ്ങൾ തിരുത്തുകയോ എല്ലാ പദ്ധതികളും കാണുകയോ ചെയ്യുക.",
            )}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setView("questions");
                setStep(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-extrabold text-slate-700 hover:bg-slate-50"
            >
              {t("Edit Answers", "ഉത്തരങ്ങൾ തിരുത്തുക")}
            </button>
            <button
              type="button"
              onClick={() => setView("browse")}
              className="rounded-xl border border-orange-300 bg-orange-50 px-2 py-2 text-[10px] font-extrabold text-orange-700 hover:bg-orange-100"
            >
              {t("Explore All Schemes", "എല്ലാ പദ്ധതികളും കാണുക")}
            </button>
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center">
        <h3 className="text-[12px] font-extrabold text-slate-900">
          {t("Looking for another scheme?", "മറ്റൊരു പദ്ധതി തിരയുകയാണോ?")}
        </h3>
        <p className="mt-1 text-[9.5px] font-medium leading-relaxed text-slate-500">
          {t(
            "Browse all schemes with search and filters. Your answers stay saved.",
            "തിരയലും ഫിൽട്ടറുകളും ഉപയോഗിച്ച് എല്ലാ പദ്ധതികളും കാണുക. നിങ്ങളുടെ ഉത്തരങ്ങൾ സൂക്ഷിക്കും.",
          )}
        </p>
        <button
          type="button"
          onClick={() => setView("browse")}
          className="mt-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-[10.5px] font-extrabold text-orange-700 transition-colors hover:bg-orange-100"
        >
          {t("Explore All Schemes", "എല്ലാ പദ്ധതികളും കാണുക")}
          <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
      </div>
    </>
  );

  const renderBrowse = () => (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3">
        <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
          {t("General browsing", "പൊതു വിവരശേഖരണം")}
        </p>
        <h2 className="mt-1 text-[15px] font-extrabold text-slate-900">
          {t("All Schemes", "എല്ലാ പദ്ധതികളും")}
        </h2>
        <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">
          {t(
            "These are not matched to your answers. Use search or categories to explore.",
            "ഇവ നിങ്ങളുടെ ഉത്തരങ്ങളുമായി പൊരുത്തപ്പെടുത്തിയതല്ല. തിരയൽ അല്ലെങ്കിൽ വിഭാഗങ്ങൾ ഉപയോഗിക്കുക.",
          )}
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={browseQuery}
            onChange={(event) => setBrowseQuery(event.target.value)}
            placeholder={t("Search all schemes", "എല്ലാ പദ്ധതികളും തിരയുക")}
            className="min-w-0 flex-1 bg-transparent text-[11.5px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
          {browseQuery ? (
            <button
              type="button"
              onClick={() => setBrowseQuery("")}
              className="text-[9.5px] font-bold text-orange-600"
            >
              {t("Clear", "മായ്ക്കുക")}
            </button>
          ) : null}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setBrowseCategory("all")}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[9.5px] font-extrabold transition-colors ${browseCategory === "all" ? "border-orange-400 bg-orange-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-orange-200"}`}
          >
            {t("All", "എല്ലാം")}
          </button>
          {browseCategories.map((category) => {
            const meta = CATEGORY_META[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => setBrowseCategory(category)}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[9.5px] font-extrabold transition-colors ${browseCategory === category ? "border-orange-400 bg-orange-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-orange-200"}`}
              >
                {lang === "ml" ? meta.ml : meta.en}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between py-1">
          <p className="text-[12px] font-semibold text-slate-500">
            {t(`${browsedSchemes.length} schemes`, `${browsedSchemes.length} പദ്ധതികൾ`)}
          </p>
          <button
            type="button"
            onClick={toggleSelectAllBrowsed}
            className="flex items-center gap-1.5 cursor-pointer text-[12px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300"
          >
            <span
              aria-hidden="true"
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-all active:scale-95 ${
                isAllBrowsedSelected
                  ? "border-orange-500 bg-orange-500 text-white shadow-xs"
                  : "border-orange-300 bg-white hover:border-orange-500 dark:border-orange-900 dark:bg-slate-900"
              }`}
            >
              {isAllBrowsedSelected && <Check className="h-2.5 w-2.5 stroke-[4]" />}
            </span>
            <span>{t("Select all", "എല്ലാം തിരഞ്ഞെടുക്കുക")}</span>
          </button>
        </div>
      </div>
      {browsedSchemes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-[11px] font-bold text-slate-700">
            {t("No schemes found", "പദ്ധതികൾ കണ്ടെത്തിയില്ല")}
          </p>
          <p className="mt-1 text-[9.5px] font-medium text-slate-500">
            {t("Try a different search or category.", "മറ്റൊരു തിരയലോ വിഭാഗമോ ശ്രമിക്കുക.")}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {browsedSchemes.map((scheme) => renderSchemeCard(scheme))}
        </div>
      )}
    </>
  );

  const renderSelectionFooter = () => {
    const count = selectedSchemeIds.length;
    return (
      <div className="relative z-30 shrink-0 border-t border-slate-200 bg-white px-4 pb-3 pt-2 shadow-[0_-6px_18px_rgba(15,23,42,0.07)]">
        <p className="mb-1.5 text-center text-[9.5px] font-bold text-slate-600">
          {count === 1
            ? t("1 scheme selected", "1 പദ്ധതി തിരഞ്ഞെടുത്തു")
            : t(`${count} schemes selected`, `${count} പദ്ധതികൾ തിരഞ്ഞെടുത്തു`)}
        </p>
        <button
          type="button"
          onClick={openAssistance}
          disabled={count === 0}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[12px] font-extrabold text-white shadow-md transition-all ${
            count > 0
              ? "bg-orange-500 hover:bg-orange-600 active:scale-[0.99]"
              : "cursor-not-allowed bg-slate-300 shadow-none"
          }`}
        >
          <HeartHandshake className="h-4 w-4 stroke-[2.5]" />
          {t("Help Me", "സഹായം അഭ്യർത്ഥിക്കുക")}
        </button>
      </div>
    );
  };

  const renderAssistanceOtp = () => (
    <>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-3.5 pb-2.5 pt-2.5">
        <div className="min-w-0">
          <h2 className="text-[14px] font-extrabold text-slate-900">
            {t("OTP Verification", "OTP സ്ഥിരീകരണം")}
          </h2>
          <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-slate-500">
            {t(
              "Enter the 6-digit verification code sent to your mobile.",
              "നിങ്ങളുടെ മൊബൈലിലേക്ക് അയച്ച 6 അക്ക സ്ഥിരീകരണ കോഡ് നൽകുക.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={closeAssistance}
          disabled={assistanceSending}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
          aria-label={t("Close request assistance", "സഹായ അഭ്യർത്ഥന അടയ്ക്കുക")}
        >
          <X className="h-4 w-4 stroke-[2.2]" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3.5 py-3">
        <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3 text-center">
          <p className="text-[11px] font-semibold text-orange-950">
            {t("Verification code sent to", "OTP അയച്ച മൊബൈൽ നമ്പർ")}
          </p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-[13px] font-bold text-slate-900">
              +91 {assistanceMobile}
            </span>
            <button
              type="button"
              onClick={() => {
                setAssistanceStep("form");
                setAssistanceOtpError("");
              }}
              className="text-[10.5px] font-extrabold text-orange-600 underline hover:text-orange-700"
            >
              {t("Change", "മാറ്റുക")}
            </button>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="block text-center text-[11px] font-extrabold text-slate-700">
            {t("Enter 6-digit OTP", "6 അക്ക OTP നൽകുക")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            maxLength={6}
            value={assistanceOtp}
            onChange={(event) => {
              setAssistanceOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
              setAssistanceOtpError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") verifyAndSubmitAssistance();
            }}
            placeholder="123456"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-center text-lg font-bold tracking-[0.35em] text-slate-900 outline-none transition-colors focus:border-orange-500"
          />
          {assistanceOtpError ? (
            <p className="text-center text-[10px] font-semibold text-rose-600">
              {assistanceOtpError}
            </p>
          ) : (
            <p className="text-center text-[9.5px] font-medium text-slate-400">
              {t("Demo OTP: 123456", "ഡെമോ OTP: 123456")}
            </p>
          )}
        </div>

        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => {
              setAssistanceOtp("123456");
              setAssistanceOtpError("");
            }}
            className="text-[10.5px] font-semibold text-slate-500 hover:text-orange-600"
          >
            {t("Didn't receive code? Resend OTP", "കോഡ് ലഭിച്ചില്ലേ? OTP വീണ്ടും അയക്കുക")}
          </button>
        </div>

        {assistanceSubmitError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[9.5px] font-semibold text-rose-700">
            {assistanceSubmitError}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white px-3.5 pb-3 pt-2">
        <button
          type="button"
          onClick={verifyAndSubmitAssistance}
          disabled={assistanceSending}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-extrabold text-white shadow-md transition-all ${
            assistanceSending
              ? "cursor-wait bg-orange-300 shadow-none"
              : "bg-orange-500 hover:bg-orange-600 active:scale-[0.99]"
          }`}
        >
          {assistanceSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4 stroke-[2.5]" />
          )}
          {assistanceSending
            ? t("Verifying…", "സ്ഥിരീകരിക്കുന്നു…")
            : t("Verify & Submit", "സ്ഥിരീകരിച്ചു സമർപ്പിക്കുക")}
        </button>
      </div>
    </>
  );

  const renderAssistanceSuccess = () => (
    <div className="flex flex-col items-center justify-center px-6 pb-6 pt-3 text-center animate-in fade-in zoom-in-95 duration-200">
      {/* Top Grab Handle */}
      <div className="h-1.5 w-12 rounded-full bg-slate-300/80 mb-3" />

      {/* 3D Leader Illustration Image without border box */}
      <div className="relative w-full max-w-[260px] h-48 sm:h-52 flex items-center justify-center my-1 overflow-hidden">
        <img
          src="/images/request_sent_leader.png"
          alt="Request sent party leader"
          className="h-full w-auto object-contain mix-blend-multiply"
        />
      </div>

      {/* Title */}
      <h2 className="mt-3 text-[22px] font-black tracking-tight text-[#0f172a]">
        {t("Request sent", "അഭ്യർത്ഥന അയച്ചു")}
      </h2>

      {/* Subtitle */}
      <p className="mt-2 text-[13px] font-semibold leading-relaxed text-slate-500 max-w-[280px]">
        {t(
          "Your local party team will review your request and assign a worker to help you.",
          "നിങ്ങളുടെ പ്രാദേശിക പാർട്ടി ടീം അഭ്യർത്ഥന പരിശോധിച്ച് നിങ്ങളെ സഹായിക്കാൻ പ്രവർത്തകനെ ചുമതലപ്പെടുത്തും.",
        )}
      </p>

      {/* Back to Home Button */}
      <button
        type="button"
        onClick={() => {
          setAssistanceOpen(false);
          setAssistanceStep("form");
          if (onHelpRequestSent) {
            onHelpRequestSent();
          } else {
            setView("questionnaire");
          }
        }}
        className="mt-6 w-full rounded-2xl bg-[#ff5500] hover:bg-[#e04b00] active:scale-[0.99] py-3.5 text-[15px] font-extrabold text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer"
      >
        {t("Back to Home", "ഹോം പേജിലേക്ക് മടങ്ങുക")}
      </button>
    </div>
  );

  const renderAssistanceSheet = () => {
    if (!assistanceOpen) return null;
    const count = selectedSchemeIds.length;
    return (
      <div
        className="absolute inset-0 z-50 flex flex-col justify-end bg-slate-950/45 backdrop-blur-[2px]"
        onClick={closeAssistance}
      >
        <div
          className="flex max-h-[92%] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {assistanceStep === "success" ? (
            renderAssistanceSuccess()
          ) : assistanceStep === "otp" ? (
            renderAssistanceOtp()
          ) : (
            <>
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-3.5 pb-2.5 pt-2.5">
                <div className="min-w-0">
                  <h2 className="text-[14px] font-extrabold text-slate-900">
                    {t("Request assistance", "സഹായം അഭ്യർത്ഥിക്കുക")}
                  </h2>
                  <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-slate-500">
                    {t(
                      "Share your contact details so a party leader can help.",
                      "ഒരു പാർട്ടി നേതാവിന് സഹായിക്കാൻ കഴിയുന്ന വിധം നിങ്ങളുടെ കോൺടാക്റ്റ് വിവരങ്ങൾ പങ്കിടുക.",
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeAssistance}
                  disabled={assistanceSending}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
                  aria-label={t("Close request assistance", "സഹായ അഭ്യർത്ഥന അടയ്ക്കുക")}
                >
                  <X className="h-4 w-4 stroke-[2.2]" />
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3.5 py-2.5">
                <div className="overflow-hidden rounded-xl border border-orange-200 bg-orange-50/70">
                  <button
                    type="button"
                    onClick={() => setSchemeNamesExpanded((current) => !current)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                  >
                    <span className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-orange-800">
                      <HeartHandshake className="h-3.5 w-3.5" />
                      {count === 1
                        ? t("1 scheme selected", "1 പദ്ധതി തിരഞ്ഞെടുത്തു")
                        : t(`${count} schemes selected`, `${count} പദ്ധതികൾ തിരഞ്ഞെടുത്തു`)}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-orange-700 transition-transform ${schemeNamesExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  {schemeNamesExpanded ? (
                    <ul className="space-y-1 border-t border-orange-200/70 px-3 py-2">
                      {selectedSchemes.map((scheme) => (
                        <li
                          key={scheme.id}
                          className="flex items-start gap-1.5 text-[10px] font-semibold text-orange-900"
                        >
                          <Check className="mt-0.5 h-3 w-3 shrink-0 stroke-[3]" />
                          <span>{lang === "ml" ? scheme.ml : scheme.en}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="guest-assistance-name"
                    className="block text-[10.5px] font-extrabold text-slate-700"
                  >
                    {t("Full name", "മുഴുവൻ പേര്")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="guest-assistance-name"
                    value={assistanceName}
                    autoComplete="name"
                    onChange={(event) => {
                      setAssistanceName(event.target.value);
                      setAssistanceErrors((current) => ({ ...current, name: "" }));
                    }}
                    placeholder={t("Enter your full name", "നിങ്ങളുടെ മുഴുവൻ പേര് നൽകുക")}
                    className={`w-full rounded-xl border bg-white px-3 py-2 text-[11.5px] font-semibold text-slate-800 outline-none transition-colors focus:border-orange-400 ${
                      assistanceErrors.name ? "border-rose-400" : "border-slate-200"
                    }`}
                  />
                  {assistanceErrors.name ? (
                    <p className="text-[9.5px] font-semibold text-rose-600">{assistanceErrors.name}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="guest-assistance-mobile"
                    className="block text-[10.5px] font-extrabold text-slate-700"
                  >
                    {t("Mobile number", "മൊബൈൽ നമ്പർ")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="guest-assistance-mobile"
                    value={assistanceMobile}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(event) => {
                      setAssistanceMobile(event.target.value.replace(/\D/g, "").slice(0, 10));
                      setAssistanceErrors((current) => ({ ...current, mobile: "" }));
                    }}
                    placeholder={t("10-digit mobile number", "10 അക്ക മൊബൈൽ നമ്പർ")}
                    className={`w-full rounded-xl border bg-white px-3 py-2 text-[11.5px] font-semibold text-slate-800 outline-none transition-colors focus:border-orange-400 ${
                      assistanceErrors.mobile ? "border-rose-400" : "border-slate-200"
                    }`}
                  />
                  {assistanceErrors.mobile ? (
                    <p className="text-[9.5px] font-semibold text-rose-600">
                      {assistanceErrors.mobile}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
                  <SearchableSelect
                    label={t("District", "ജില്ല")}
                    valueLabel={
                      selectedDistrict ? (lang === "ml" ? selectedDistrict.ml : selectedDistrict.en) : ""
                    }
                    placeholder={t("Select district", "ജില്ല തിരഞ്ഞെടുക്കുക")}
                    searchPlaceholder={t("Search districts", "ജില്ലകൾ തിരയുക")}
                    options={districts.map((district) => ({
                      value: district.id,
                      label: lang === "ml" ? district.ml : district.en,
                    }))}
                    open={openPicker === "district"}
                    onToggle={() =>
                      setOpenPicker((current) => (current === "district" ? null : "district"))
                    }
                    onSelect={handleAssistanceDistrictChange}
                  />
                  <SearchableSelect
                    label={t("Assembly Mandalam", "അസംബ്ലി മണ്ഡലം")}
                    valueLabel={
                      selectedMandalam ? (lang === "ml" ? selectedMandalam.ml : selectedMandalam.en) : ""
                    }
                    placeholder={t(
                      "Select Assembly Mandalam",
                      "അസംബ്ലി മണ്ഡലം തിരഞ്ഞെടുക്കുക",
                    )}
                    searchPlaceholder={t("Search constituencies", "മണ്ഡലങ്ങൾ തിരയുക")}
                    options={districtConstituencies.map((item) => ({
                      value: item.id,
                      label: lang === "ml" ? item.ml : item.en,
                    }))}
                    disabled={!assistanceDistrictId}
                    open={openPicker === "mandalam"}
                    onToggle={() =>
                      setOpenPicker((current) => (current === "mandalam" ? null : "mandalam"))
                    }
                    onSelect={handleAssistanceMandalamChange}
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="guest-assistance-notes"
                    className="block text-[10.5px] font-extrabold text-slate-700"
                  >
                    {t("Notes (optional)", "കുറിപ്പുകൾ (ഐച്ഛികം)")}
                  </label>
                  <textarea
                    id="guest-assistance-notes"
                    value={assistanceNotes}
                    rows={2}
                    onChange={(event) => setAssistanceNotes(event.target.value)}
                    placeholder={t(
                      "Anything the party leader should know",
                      "പാർട്ടി നേതാവ് അറിയേണ്ട കാര്യങ്ങൾ",
                    )}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium leading-relaxed text-slate-800 outline-none transition-colors focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2">
                    <input
                      type="checkbox"
                      checked={assistanceConsent}
                      onChange={(event) => {
                        setAssistanceConsent(event.target.checked);
                        setAssistanceErrors((current) => ({ ...current, consent: "" }));
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
                    />
                    <span className="text-[9.5px] font-semibold leading-relaxed text-slate-600">
                      {t(
                        "I agree to share these details with the party leaders handling my request.",
                        "എന്റെ അഭ്യർത്ഥന കൈകാര്യം ചെയ്യുന്ന പാർട്ടി നേതാക്കളുമായി ഈ വിവരങ്ങൾ പങ്കിടാൻ ഞാൻ സമ്മതിക്കുന്നു.",
                      )}
                    </span>
                  </label>
                  {assistanceErrors.consent ? (
                    <p className="mt-1 text-[9.5px] font-semibold text-rose-600">
                      {assistanceErrors.consent}
                    </p>
                  ) : null}
                </div>

                {assistanceErrors.schemes ? (
                  <p className="text-[9.5px] font-semibold text-rose-600">{assistanceErrors.schemes}</p>
                ) : null}
                {assistanceSubmitError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[9.5px] font-semibold leading-relaxed text-rose-700">
                    {assistanceSubmitError}
                  </div>
                ) : null}
              </div>
              <div className="shrink-0 border-t border-slate-200 bg-white px-3.5 pb-3 pt-2">
                <button
                  type="button"
                  onClick={submitAssistance}
                  disabled={assistanceSending}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-extrabold text-white shadow-md transition-all ${
                    assistanceSending
                      ? "cursor-wait bg-orange-300 shadow-none"
                      : "bg-orange-500 hover:bg-orange-600 active:scale-[0.99]"
                  }`}
                >
                  {assistanceSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 stroke-[2.5]" />
                  )}
                  {assistanceSending
                    ? t("Sending…", "അയക്കുന്നു…")
                    : assistanceSubmitError
                      ? t("Try Again", "വീണ്ടും ശ്രമിക്കുക")
                      : t("Help Me", "എന്നെ സഹായിക്കൂ")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="flex min-h-[440px] flex-col items-center justify-center px-3 py-6 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-[320px] rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/90 via-white to-orange-50/30 p-5 shadow-xs">
        {/* Animated Check Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-100">
          <Check className="h-7 w-7 stroke-[3]" />
        </div>

        {/* Status Badge */}
        <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
          {t("Request Completed", "അഭ്യർത്ഥന പൂർത്തിയായി")}
        </div>

        <h2 className="mt-2 text-[17px] font-extrabold leading-tight text-slate-900">
          {t("Help Request Sent!", "സഹായ അഭ്യർത്ഥന അയച്ചു!")}
        </h2>

        <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-slate-600">
          {t(
            "Your request has been sent to party leaders for assistance. They will contact you shortly.",
            "സഹായത്തിനായി നിങ്ങളുടെ വിവരങ്ങൾ പാർട്ടി നേതാക്കൾക്ക് കൈമാറി. അവർ നിങ്ങളെ ഉടൻ ബന്ധപ്പെടും.",
          )}
        </p>

        {/* Reference ID Box */}
        {requestReference ? (
          <div className="mt-3.5 rounded-xl border border-slate-200/80 bg-slate-900 p-2.5 text-white shadow-inner">
            <p className="text-[8.5px] font-bold tracking-wider text-slate-400 uppercase">
              {t("Reference ID", "റഫറൻസ് നമ്പർ")}
            </p>
            <p className="mt-0.5 font-mono text-[12.5px] font-black text-orange-400 tracking-wider">
              {requestReference}
            </p>
          </div>
        ) : null}

        {/* Summary Pill */}
        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-100/80 px-3 py-1.5 text-[10.5px]">
          <span className="font-semibold text-slate-600">
            {t("Schemes selected", "തിരഞ്ഞെടുത്ത പദ്ധതികൾ")}
          </span>
          <span className="font-extrabold text-slate-900">
            {selectedSchemeIds.length}{" "}
            {t(selectedSchemeIds.length === 1 ? "scheme" : "schemes", "പദ്ധതികൾ")}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-4 w-full max-w-[320px] space-y-1.5">
        <button
          type="button"
          onClick={onHelpRequestSent}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-[12px] font-extrabold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.99]"
        >
          <Home className="h-4 w-4 stroke-[2.5]" />
          {t("Go to Home", "ഹോം പേജിലേക്ക് പോകുക")}
        </button>

        <p className="text-[9px] font-medium text-slate-400">
          {t("Returning to the guest home page…", "അതിഥി ഹോം പേജിലേക്ക് മടങ്ങുന്നു…")}
        </p>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
      <h2 className="mt-3 text-[15px] font-extrabold text-slate-900">
        {t("Checking suitable schemes", "അനുയോജ്യമായ പദ്ധതികൾ പരിശോധിക്കുന്നു")}
      </h2>
      <p className="mt-1.5 max-w-[240px] text-[10.5px] font-medium leading-relaxed text-slate-500">
        {t(
          "We are comparing your answers with the existing eligibility rules.",
          "നിങ്ങളുടെ ഉത്തരങ്ങൾ നിലവിലുള്ള യോഗ്യതാ നിയമങ്ങളുമായി താരതമ്യം ചെയ്യുന്നു.",
        )}
      </p>
    </div>
  );

  const renderError = () => (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <RefreshCw className="h-8 w-8" />
      </div>
      <h2 className="mt-3 text-[15px] font-extrabold text-slate-900">
        {t("Something went wrong", "എന്തോ കുഴപ്പം സംഭവിച്ചു")}
      </h2>
      <p className="mt-1.5 max-w-[260px] text-[10.5px] font-medium leading-relaxed text-slate-600">
        {resultError}
      </p>
      <button
        type="button"
        onClick={runCheck}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-[10.5px] font-extrabold text-white hover:bg-orange-600"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {t("Retry", "വീണ്ടും ശ്രമിക്കുക")}
      </button>
    </div>
  );

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#FAFAFA]">
      {view === "questions"
        ? renderHeader(
            t("Check Eligibility", "യോഗ്യത പരിശോധിക്കുക"),
            true,
          )
        : renderHeader(
            view === "success"
              ? t("Help request sent", "സഹായ അഭ്യർത്ഥന അയച്ചു")
              : view === "browse"
                ? t("All Schemes", "എല്ലാ പദ്ധതികളും")
                : t("Your scheme matches", "നിങ്ങളുടെ പദ്ധതി പൊരുത്തങ്ങൾ"),
            false,
          )}
      <div
        ref={contentRef}
        className={`min-h-0 flex-1 overflow-y-auto px-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          view === "results" || view === "browse" ? "pt-2 pb-6" : "pt-4 pb-24"
        }`}
      >
        {view === "questions" ? (
          <div className="space-y-4">{renderQuestion()}</div>
        ) : view === "loading" ? (
          renderLoading()
        ) : view === "error" ? (
          renderError()
        ) : view === "success" ? (
          renderSuccess()
        ) : view === "results" ? (
          <div className="space-y-3">{renderResults()}</div>
        ) : (
          <div className="space-y-3">{renderBrowse()}</div>
        )}
      </div>
      {view === "results" || view === "browse" ? renderSelectionFooter() : null}
      {view === "questions" ? (
        <div className="relative z-30 shrink-0 border-t border-slate-200 bg-white px-4 pb-3 pt-2.5 shadow-[0_-6px_18px_rgba(15,23,42,0.07)]">
          <button
            type="button"
            disabled={!canContinue}
            onClick={next}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[12px] font-extrabold text-white shadow-md transition-all ${
              canContinue
                ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99]"
                : "cursor-not-allowed bg-slate-300 shadow-none"
            }`}
          >
            {step === TOTAL_STEPS ? <SearchCheck className="h-4 w-4 stroke-[2.5]" /> : null}
            {step === TOTAL_STEPS
              ? t("Show Matching Schemes", "അനുയോജ്യ പദ്ധതികൾ കാണിക്കുക")
              : t("Continue", "തുടരുക")}
          </button>
          {step < TOTAL_STEPS ? (
            <>
              <button
                type="button"
                onClick={skip}
                className="mt-1.5 w-full rounded-lg py-1.5 text-[10px] font-extrabold text-orange-600 transition-colors hover:bg-orange-50"
              >
                {t("Skip for now", "ഇപ്പോൾ ഒഴിവാക്കുക")}
              </button>
              <p className="mt-0.5 text-center text-[8.5px] font-medium leading-snug text-slate-400">
                {t(
                  "Your details help us find suitable schemes.",
                  "നിങ്ങളുടെ വിവരങ്ങൾ അനുയോജ്യമായ പദ്ധതികൾ കണ്ടെത്താൻ സഹായിക്കും.",
                )}
              </p>
            </>
          ) : null}
        </div>
      ) : null}
      {renderAssistanceSheet()}
    </div>
  );
}
