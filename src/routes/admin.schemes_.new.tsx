import { useEffect, useMemo, useState } from "react";
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
  Globe,
  X,
  Sparkles,
  ChevronRight,
  ChevronDown,
  List,
  Type,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { useSidebar } from "@/components/ui/sidebar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { schemes, type Scheme } from "@/data/schemes";
import {
  getEligibilityMasterFields,
  type EligibilityMasterField,
} from "@/data/eligibility-master";

export const Route = createFileRoute("/admin/schemes_/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    edit: typeof search.edit === "string" ? search.edit : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create Scheme · Admin · Vikasita Keralam" },
      { name: "description", content: "Create a new government scheme on Vikasita Keralam." },
    ],
  }),
  component: CreateSchemePage,
});

type QuestionnaireFieldType = "file" | "yesno" | "descriptive" | "dropdown" | "text";

const SCHEME_CATEGORY_TO_FORM: Record<Scheme["category"], string> = {
  agriculture: "Agriculture & Farming",
  women: "Women & Child Welfare",
  health: "Health & Medical",
  education: "Education & Scholarship",
  housing: "Housing & Infrastructure",
  employment: "Employment & Skill",
  welfare: "Pension",
  msme: "Other",
};

const inferBenefitType = (scheme: Scheme) => {
  const text = `${scheme.benefit.en} ${scheme.benefit.ml}`.toLowerCase();
  if (text.includes("insurance") || text.includes("ഇൻഷുറൻസ്")) return "Insurance";
  if (text.includes("loan") || text.includes("വായ്പ")) return "Loan";
  if (text.includes("pension") || text.includes("പെൻഷൻ")) return "Financial Assistance";
  if (text.includes("subsidy") || text.includes("സബ്സിഡി")) return "Subsidy";
  return "Other";
};

interface QuestionnaireField {
  id: string;
  type: QuestionnaireFieldType;
  label: string;
  required: boolean;
  options: string[];
}

const QUESTIONNAIRE_FIELD_TYPES: {
  type: QuestionnaireFieldType;
  label: string;
  description: string;
}[] = [
  { type: "file", label: "File Upload", description: "Attach a document or image" },
  { type: "yesno", label: "Yes / No", description: "Single choice between Yes and No" },
  { type: "descriptive", label: "Descriptive", description: "Long-form text answer" },
  { type: "dropdown", label: "Dropdown", description: "Choose from a list of options" },
  { type: "text", label: "Single Line Text", description: "Short text answer" },
];

const QUESTIONNAIRE_DEFAULT_LABELS: Record<QuestionnaireFieldType, string> = {
  file: "Upload supporting document",
  yesno: "Do you meet this requirement?",
  descriptive: "Tell us more",
  dropdown: "Select an option",
  text: "Short answer",
};

const QuestionnaireFieldIcon = ({
  type,
  className,
}: {
  type: QuestionnaireFieldType;
  className?: string;
}) => {
  const Icon =
    type === "file"
      ? Upload
      : type === "yesno"
        ? Check
        : type === "descriptive"
          ? FileText
          : type === "dropdown"
            ? List
            : Type;
  return <Icon className={className} />;
};

type EligibilityValueKind = "options" | "number" | "currency" | "none";

interface EligibilityFieldConfig {
  key: string;
  label: string;
  operators: string[];
  valueKind: EligibilityValueKind;
  options?: string[];
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
}

interface EligibilityRuleState {
  operator: string;
  values: string[];
  min: string;
  max: string;
  reference: string;
  referenceDate: string;
}

const OPTION_OPERATORS = ["Any", "Is", "Is Not", "Is One Of", "Is None Of"];
const YES_NO_OPERATORS = ["Any", "Yes", "No"];
const RANGE_OPERATORS = ["Any", "Minimum", "Maximum", "Between", "Exactly"];
const INCOME_OPERATORS = [
  "Any",
  "Less Than",
  "Less Than or Equal To",
  "Greater Than",
  "Greater Than or Equal To",
  "Between",
  "Equal To",
];

const SCHEME_FIELD_OPERATORS: Record<string, string[]> = {
  gender: OPTION_OPERATORS,
  age: RANGE_OPERATORS,
  religion: OPTION_OPERATORS,
  caste: OPTION_OPERATORS,
  disabilityStatus: YES_NO_OPERATORS,
  disabilityPercentage: RANGE_OPERATORS,
  minorityStatus: YES_NO_OPERATORS,
  studentStatus: YES_NO_OPERATORS,
  employmentStatus: OPTION_OPERATORS,
  occupation: OPTION_OPERATORS,
  annualIncome: INCOME_OPERATORS,
  maritalStatus: OPTION_OPERATORS,
  householdStatus: OPTION_OPERATORS,
  bplStatus: YES_NO_OPERATORS,
};

const buildSchemeEligibilityFields = (
  masterFields: EligibilityMasterField[],
): EligibilityFieldConfig[] =>
  masterFields.map((field) => ({
    key: field.key,
    label: field.label,
    operators: SCHEME_FIELD_OPERATORS[field.key] ?? OPTION_OPERATORS,
    valueKind:
      field.kind === "yesno" ? "none" : field.kind === "options" ? "options" : field.kind,
    options:
      field.kind === "options"
        ? field.options
            .filter((option) => option.status === "Active")
            .slice()
            .sort(
              (a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
            )
            .map((option) => option.label)
        : undefined,
    placeholder: field.placeholder,
    minValue: field.minValue,
    maxValue: field.maxValue,
  }));

const EligibilityConditionValueSelect = ({
  field,
  rule,
  multi,
  disabled,
  onToggle,
}: {
  field: EligibilityFieldConfig;
  rule: EligibilityRuleState;
  multi: boolean;
  disabled?: boolean;
  onToggle: (option: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selectedValues = rule.values;
  const selectedLabel =
    selectedValues.length === 0
      ? "Select values"
      : selectedValues.length <= 2
        ? selectedValues.join(", ")
        : `${selectedValues.length} values selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`flex h-9 w-full max-w-[280px] items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 text-left text-xs font-semibold transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none xl:bg-white ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${selectedValues.length ? "text-foreground" : "text-muted-foreground"}`}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1.5">
        <div className="max-h-56 space-y-0.5 overflow-y-auto">
          {field.options?.map((option) => {
            const isSelected = selectedValues.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onToggle(option);
                  if (!multi) setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-foreground transition-colors hover:bg-muted/60 cursor-pointer"
              >
                <span
                  className={`grid h-4 w-4 shrink-0 place-content-center rounded-sm border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
                <span className="min-w-0 flex-1">{option}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const createEmptyEligibilityRule = (): EligibilityRuleState => ({
  operator: "Any",
  values: [],
  min: "",
  max: "",
  reference: "Application Date",
  referenceDate: "",
});

const createInitialEligibilityRules = (
  fields: EligibilityFieldConfig[],
): Record<string, EligibilityRuleState> =>
  fields.reduce<Record<string, EligibilityRuleState>>((acc, field) => {
    acc[field.key] = createEmptyEligibilityRule();
    return acc;
  }, {});

export function CreateSchemePage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const { state: sidebarState, isMobile: sidebarIsMobile } = useSidebar();
  const { edit } = Route.useSearch();
  const editingScheme = useMemo(
    () => (edit ? schemes.find((scheme) => scheme.id === edit) : undefined),
    [edit],
  );
  const isEditing = Boolean(editingScheme);

  // Desktop only: hide the page scroll indicators while the wizard is open.
  useEffect(() => {
    const root = document.documentElement;
    const desktopQuery = window.matchMedia("(min-width: 640px)");
    const sync = () => root.classList.toggle("desktop-hide-page-scrollbar", desktopQuery.matches);
    sync();
    desktopQuery.addEventListener("change", sync);
    return () => {
      desktopQuery.removeEventListener("change", sync);
      root.classList.remove("desktop-hide-page-scrollbar");
    };
  }, []);

  // Active step state for form navigation
  const [activeStep, setActiveStep] = useState<number>(1);

  // Modal for unsaved changes
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  // Form State
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Section 1: Basic Information
  const [schemeName, setSchemeName] = useState("");
  const [category, setCategory] = useState("");
  const [benefitDuration, setBenefitDuration] = useState("");
  const [department, setDepartment] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [officialWebsite, setOfficialWebsite] = useState("");

  // Section 2: Eligibility
  const eligibilityFields = useMemo(
    () => buildSchemeEligibilityFields(getEligibilityMasterFields()),
    [],
  );
  const [eligibilityRules, setEligibilityRules] =
    useState<Record<string, EligibilityRuleState>>(() =>
      createInitialEligibilityRules(eligibilityFields),
    );
  const [benefitType, setBenefitType] = useState("");

  // Section 3: Additional Questions & Documents
  const [questionnaireFields, setQuestionnaireFields] = useState<QuestionnaireField[]>([]);
  const [showAddFieldMenu, setShowAddFieldMenu] = useState(false);

  // Prefill the wizard when editing an existing scheme.
  useEffect(() => {
    if (!editingScheme) return;
    setSchemeName(editingScheme[lang]);
    setCategory(SCHEME_CATEGORY_TO_FORM[editingScheme.category]);
    setDepartment(editingScheme.ministry[lang]);
    setShortDescription(editingScheme.benefit[lang]);
    setBenefitType(inferBenefitType(editingScheme));
    setIsDirty(false);
    setActiveStep(1);
    // Only repopulate when a different scheme is opened for editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingScheme?.id]);

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

  const getOperatorKind = (operator: string): "none" | "single" | "multi" | "range" => {
    if (operator === "Any" || operator === "Yes" || operator === "No") return "none";
    if (operator === "Is" || operator === "Is Not") return "single";
    if (operator === "Is One Of" || operator === "Is None Of") return "multi";
    return "range";
  };

  const updateEligibilityRule = (key: string, patch: Partial<EligibilityRuleState>) => {
    setEligibilityRules((prev) => {
      const current = prev[key];
      const nextRule: EligibilityRuleState = { ...current, ...patch };

      if (patch.operator && patch.operator !== current.operator) {
        const previousKind = getOperatorKind(current.operator);
        const nextKind = getOperatorKind(nextRule.operator);
        if (nextKind === "none") {
          nextRule.values = [];
          nextRule.min = "";
          nextRule.max = "";
        } else if (nextKind === "single" || nextKind === "multi") {
          nextRule.min = "";
          nextRule.max = "";
          if (previousKind !== "single" && previousKind !== "multi") nextRule.values = [];
          if (nextKind === "single" && nextRule.values.length > 1) nextRule.values = nextRule.values.slice(0, 1);
        } else {
          nextRule.values = [];
          if (nextRule.operator !== "Between") nextRule.max = "";
        }
      }

      const next = { ...prev, [key]: nextRule };

      if (key === "disabilityStatus" && nextRule.operator === "No") {
        next.disabilityPercentage = createEmptyEligibilityRule();
      }
      if (
        key === "disabilityPercentage" &&
        nextRule.operator !== "Any" &&
        next.disabilityStatus.operator !== "Yes"
      ) {
        next.disabilityStatus = { ...next.disabilityStatus, operator: "Yes" };
      }

      return next;
    });
    setIsDirty(true);
  };

  const toggleEligibilityValue = (key: string, option: string, multi: boolean) => {
    setEligibilityRules((prev) => {
      const rule = prev[key];
      const isSelected = rule.values.includes(option);
      const values = multi
        ? isSelected
          ? rule.values.filter((value) => value !== option)
          : [...rule.values, option]
        : isSelected
        ? []
        : [option];
      return { ...prev, [key]: { ...rule, values } };
    });
    setIsDirty(true);
  };

  const getEligibilityRuleError = (field: EligibilityFieldConfig, rule: EligibilityRuleState): string => {
    if (rule.operator === "Any" || field.valueKind === "none") return "";

    if (field.valueKind === "options") {
      if (rule.values.length === 0) return "Select at least one value";
      if ((rule.operator === "Is" || rule.operator === "Is Not") && rule.values.length > 1) {
        return "Select a single value";
      }
      return "";
    }

    if (!rule.min.trim()) return "Enter a value";
    const min = Number(rule.min);
    if (Number.isNaN(min)) return "Enter a valid number";
    if (field.minValue !== undefined && min < field.minValue) return `Value cannot be below ${field.minValue}`;
    if (field.maxValue !== undefined && min > field.maxValue) return `Value cannot exceed ${field.maxValue}`;

    if (rule.operator === "Between") {
      if (!rule.max.trim()) return "Enter both values";
      const max = Number(rule.max);
      if (Number.isNaN(max)) return "Enter a valid number";
      if (field.maxValue !== undefined && max > field.maxValue) return `Value cannot exceed ${field.maxValue}`;
      if (min > max) return "Minimum cannot exceed maximum";
    }

    if (field.key === "disabilityPercentage" && eligibilityRules.disabilityStatus.operator !== "Yes") {
      return "Set Disability Status to Yes";
    }

    return "";
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

    const hasEligibilityRuleErrors = eligibilityFields.some(
      (field) => getEligibilityRuleError(field, eligibilityRules[field.key]) !== "",
    );

    if (targetStatus === "Active" && hasEligibilityRuleErrors) {
      toast.error(
        lang === "ml"
          ? "ദയവായി എല്ലാ യോഗ്യതാ നിബന്ധനകളുടെയും മൂല്യങ്ങൾ പൂർത്തിയാക്കുകയോ നീക്കം ചെയ്യുകയോ ചെയ്യുക."
          : "Please complete the values for all active eligibility conditions, or set them to Any.",
      );
      setActiveStep(2);
      return;
    }

    toast.success(
      targetStatus === "Active"
        ? isEditing
          ? lang === "ml"
            ? "പദ്ധതി വിജയകരമായി അപ്ഡേറ്റ് ചെയ്തു!"
            : "Scheme updated successfully!"
          : lang === "ml"
            ? "പുതിയ പദ്ധതി വിജയകരമായി സൃഷ്ടിച്ചു!"
            : "Scheme successfully created and published!"
        : lang === "ml"
        ? "പദ്ധതി ഡ്രാഫ്റ്റായി സൂക്ഷിച്ചു!"
        : "Scheme saved as draft!"
    );

    setIsDirty(false);
    navigate({ to: "/admin/schemes" });
  };

  const addQuestionnaireField = (type: QuestionnaireFieldType) => {
    setQuestionnaireFields((prev) => [
      ...prev,
      {
        id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        label: QUESTIONNAIRE_DEFAULT_LABELS[type],
        required: false,
        options: type === "dropdown" ? ["Option 1", "Option 2"] : [],
      },
    ]);
    setShowAddFieldMenu(false);
    setIsDirty(true);
  };

  const updateQuestionnaireField = (id: string, patch: Partial<QuestionnaireField>) => {
    setQuestionnaireFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...patch } : field)));
    setIsDirty(true);
  };

  const removeQuestionnaireField = (id: string) => {
    setQuestionnaireFields((prev) => prev.filter((field) => field.id !== id));
    setIsDirty(true);
  };

  const addQuestionnaireOption = (id: string) => {
    setQuestionnaireFields((prev) =>
      prev.map((field) =>
        field.id === id
          ? { ...field, options: [...field.options, `Option ${field.options.length + 1}`] }
          : field,
      ),
    );
    setIsDirty(true);
  };

  const updateQuestionnaireOption = (id: string, index: number, value: string) => {
    setQuestionnaireFields((prev) =>
      prev.map((field) =>
        field.id === id
          ? { ...field, options: field.options.map((option, optionIndex) => (optionIndex === index ? value : option)) }
          : field,
      ),
    );
    setIsDirty(true);
  };

  const removeQuestionnaireOption = (id: string, index: number) => {
    setQuestionnaireFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, options: field.options.filter((_, optionIndex) => optionIndex !== index) } : field,
      ),
    );
    setIsDirty(true);
  };

  const renderQuestionnairePreview = (field: QuestionnaireField) => {
    if (field.type === "file") {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card px-3.5 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Upload className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground">
              {lang === "ml" ? "രേഖ അപ്ലോഡ് ചെയ്യുക" : "Upload document"}
            </p>
            <p className="text-[10px] text-muted-foreground">PDF, JPG or PNG · up to 5 MB</p>
          </div>
          <span className="ml-auto rounded-lg border border-border bg-background px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
            {lang === "ml" ? "തിരഞ്ഞെടുക്കുക" : "Browse"}
          </span>
        </div>
      );
    }

    if (field.type === "yesno") {
      return (
        <div className="flex items-center gap-2">
          {["Yes", "No"].map((option) => (
            <span
              key={option}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground"
            >
              <span className="h-3.5 w-3.5 rounded-full border border-border bg-background" />
              {option}
            </span>
          ))}
        </div>
      );
    }

    if (field.type === "descriptive") {
      return (
        <textarea
          disabled
          rows={2}
          placeholder={lang === "ml" ? "വിശദമായ ഉത്തരം..." : "Long-form answer..."}
          className="w-full resize-none rounded-xl border border-border bg-card p-2.5 text-xs text-muted-foreground"
        />
      );
    }

    if (field.type === "dropdown") {
      return (
        <div className="space-y-2">
          {field.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-1.5">
              <span className="w-4 text-right text-[10px] font-bold text-muted-foreground">{optionIndex + 1}</span>
              <input
                value={option}
                onChange={(e) => updateQuestionnaireOption(field.id, optionIndex, e.target.value)}
                placeholder={lang === "ml" ? "ഓപ്ഷൻ ലേബൽ" : "Option label"}
                className="h-8 flex-1 rounded-lg border border-border bg-card px-2.5 text-[11px] text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeQuestionnaireOption(field.id, optionIndex)}
                disabled={field.options.length <= 1}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                title={lang === "ml" ? "ഓപ്ഷൻ നീക്കം ചെയ്യുക" : "Remove option"}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addQuestionnaireOption(field.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[10.5px] font-bold text-foreground transition-colors hover:bg-muted/60"
          >
            <Plus className="h-3 w-3" />
            {lang === "ml" ? "ഓപ്ഷൻ ചേർക്കുക" : "Add option"}
          </button>
        </div>
      );
    }

    return (
      <input
        disabled
        placeholder={lang === "ml" ? "ചെറിയ ഉത്തരം..." : "Short answer..."}
        className="h-9 w-full rounded-lg border border-border bg-card px-2.5 text-xs text-muted-foreground"
      />
    );
  };

  const steps = [
    { id: 1, name: lang === "ml" ? "അടിസ്ഥാന വിവരങ്ങൾ" : "Basic Information", icon: FileText },
    { id: 2, name: lang === "ml" ? "യോഗ്യതാ നിബന്ധനകൾ" : "Eligibility Conditions", icon: ShieldCheck },
    { id: 3, name: lang === "ml" ? "അധിക ചോദ്യങ്ങളും രേഖകളും" : "Additional Questions & Documents", icon: Globe },
  ];

  return (
    <div className="pb-24 text-foreground w-full">
      {/* Desktop page header */}
      <section className="sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5">
        <div className="flex items-center justify-between gap-3 pb-1 sm:pb-0">
          <div className="flex items-center gap-3 sm:gap-2.5">
            <button
              type="button"
              onClick={handleBackNavigation}
              className="inline-flex items-center justify-center h-9 w-9 sm:h-8 sm:w-8 rounded-full border border-border bg-card text-foreground hover:bg-muted hover:text-primary transition-all shadow-2xs group cursor-pointer"
              title={lang === "ml" ? "പദ്ധതി പട്ടികയിലേക്ക് തിരികെ പോകുക" : "Back to Schemes"}
            >
              <ArrowLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                <span>
                  {isEditing
                    ? lang === "ml"
                      ? "പദ്ധതി തിരുത്തുക"
                      : "Edit Scheme"
                    : lang === "ml"
                      ? "പുതിയ പദ്ധതി സൃഷ്ടിക്കുക"
                      : "Create Scheme"}
                </span>
              </h1>
            </div>
          </div>

          <div className="hidden min-w-0 items-center justify-end gap-0.5 overflow-x-auto no-scrollbar desktop-hide-scrollbar md:flex">
            {steps.map((step, idx) => {
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                    title={step.name}
                    aria-current={isActive ? "step" : undefined}
                    className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2 text-[10.5px] font-semibold transition-colors ${
                      isActive
                        ? "border-primary/30 bg-primary/10 text-primary font-bold"
                        : isCompleted
                          ? "border-transparent text-foreground hover:bg-muted/60"
                          : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                          : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : step.id}
                    </span>
                    <span className="hidden whitespace-nowrap lg:inline">{step.name}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="mx-0.5 h-3.5 w-3.5 shrink-0 text-border/80" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="space-y-4 pt-4 sm:pt-5">
        {/* Mobile Compact Step Scrollable Pill Navigation */}
        <div className="rounded-2xl border border-border/80 bg-card p-2 shadow-2xs md:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-0.5">
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
          <div className="space-y-6 xl:space-y-4 animate-in fade-in-50 duration-200">
            <div className="border-b border-border/80 pb-3.5 xl:pb-2.5">
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                {lang === "ml" ? "വിഭാഗം 1 — അടിസ്ഥാന വിവരങ്ങൾ" : "Section 1 — Basic Information"}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-4 xl:gap-y-3">
              {/* Row 1: Scheme Name + Category */}
              <div className="space-y-1.5 xl:space-y-1 sm:col-span-2 lg:col-span-2">
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
                  className={`h-11 xl:h-10 w-full rounded-xl border bg-background xl:bg-white px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors ${
                    errors.schemeName ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.schemeName && <p className="text-[11px] font-semibold text-destructive">{errors.schemeName}</p>}
              </div>

              <div className="space-y-1.5 xl:space-y-1">
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
                  className={`h-11 xl:h-10 w-full rounded-xl border bg-background xl:bg-white px-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors cursor-pointer ${
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

              <div className="space-y-1.5 xl:space-y-1">
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
                  className={`h-11 xl:h-10 w-full rounded-xl border bg-background xl:bg-white px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors ${
                    errors.department ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.department && <p className="text-[11px] font-semibold text-destructive">{errors.department}</p>}
              </div>

              {/* Official Website */}
              <div className="space-y-1.5 xl:space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "ഔദ്യോഗിക വെബ്സൈറ്റ്" : "Official Website"}
                </label>
                <input
                  type="url"
                  value={officialWebsite}
                  onChange={(e) => {
                    setOfficialWebsite(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="https://india.gov.in/schemes"
                  className="h-11 xl:h-10 w-full rounded-xl border border-border bg-background xl:bg-white px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Logo Upload Box */}
              <div className="space-y-1.5 xl:space-y-1 sm:col-span-2 lg:col-span-3 xl:col-span-1 xl:col-start-4 xl:row-span-2 xl:row-start-1 xl:flex xl:flex-col">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "ലോഗോ" : "Logo"}
                </label>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border/90 bg-background xl:bg-white p-4 transition-colors hover:bg-muted/20 xl:flex-1 xl:flex-col xl:justify-center xl:gap-2 xl:p-2.5 xl:text-center">
                  <div className="flex items-center gap-3 min-w-0 xl:flex-col xl:gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground xl:h-8 xl:w-8">
                      <Upload className="h-5 w-5 xl:h-3.5 xl:w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm xl:text-xs font-bold text-foreground truncate xl:whitespace-normal">
                        {logoFileName || (lang === "ml" ? "പദ്ധതി ലോഗോ അപ്‌ലോഡ് ചെയ്യുക (PNG, JPG, max 2MB)" : "Upload scheme logo (PNG, JPG, max 2MB)")}
                      </p>
                      <span className="text-[11px] xl:text-[10px] text-muted-foreground block">Dimensions 400x400px recommended</span>
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border bg-card px-4 py-2 xl:px-3 xl:py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shrink-0 shadow-2xs">
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

              {/* Scheme Card Description, Benefits Duration & Type */}
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:col-span-2 sm:grid-cols-2 lg:col-span-3 xl:col-span-4 xl:grid-cols-4 xl:gap-x-4">
                <div className="space-y-1.5 xl:space-y-1 sm:col-span-2 xl:col-span-2">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "പദ്ധതി കാർഡ് വിവരണം" : "Scheme Card Description"}
                  </label>
                  <textarea
                    rows={2}
                    value={shortDescription}
                    onChange={(e) => {
                      setShortDescription(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="Short summary shown on the scheme card..."
                    className="w-full rounded-xl border border-border bg-background xl:bg-white p-3 xl:h-10 xl:py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5 xl:space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "ആനുകൂല്യ കാലയളവ്" : "Benefits Duration"}
                  </label>
                  <input
                    type="text"
                    value={benefitDuration}
                    onChange={(e) => {
                      setBenefitDuration(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. 5 years / Until March 2028"
                    className="h-11 xl:h-10 w-full rounded-xl border border-border bg-background xl:bg-white px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5 xl:space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <span>{lang === "ml" ? "ആനുകൂല്യ തരം" : "Benefits Type"}</span>
                    <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={benefitType}
                    onChange={(e) => {
                      setBenefitType(e.target.value);
                      handleInputChange();
                    }}
                    className={`h-11 xl:h-10 w-full rounded-xl border bg-background xl:bg-white px-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors cursor-pointer ${
                      errors.benefitType ? "border-destructive" : "border-border"
                    }`}
                  >
                    <option value="">{lang === "ml" ? "-- തരം തിരഞ്ഞെടുക്കുക --" : "-- Select Benefits Type --"}</option>
                    <option value="Financial Assistance">Financial Assistance (Direct Cash Transfer)</option>
                    <option value="Subsidy">Subsidy (Price Reduction)</option>
                    <option value="Service">Public Service / Care</option>
                    <option value="Loan">Concessional Loan</option>
                    <option value="Insurance">Health / Life Insurance Coverage</option>
                    <option value="Other">Other Benefit</option>
                  </select>
                  {errors.benefitType && <p className="text-[11px] font-semibold text-destructive">{errors.benefitType}</p>}
                </div>
              </div>

              {/* About Scheme */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3 xl:col-span-4">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ml" ? "പദ്ധതിയെക്കുറിച്ച്" : "About Scheme"}
                </label>
                <textarea
                  rows={4}
                  value={detailedDescription}
                  onChange={(e) => {
                    setDetailedDescription(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="Describe the scheme, its objectives, scope, and key details..."
                  className="w-full rounded-xl border border-border bg-background xl:bg-white p-3 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: ELIGIBILITY CONDITIONS                                         */}
        {/* ========================================================================= */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-border/80 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                {lang === "ml" ? "വിഭാഗം 2 — യോഗ്യതാ നിബന്ധനകൾ" : "Section 2 — Eligibility Conditions"}
              </h2>
            </div>

            <div className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="overflow-x-auto desktop-hide-scrollbar">
                  <table className="w-full min-w-[1120px] border-collapse text-left">
                    <thead>
                      <tr className="bg-muted/30 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        <th className="w-12 px-4 py-2.5">#</th>
                        <th className="w-56 px-4 py-2.5">Eligibility Field</th>
                        <th className="w-[340px] px-4 py-2.5">
                          {lang === "ml" ? "സ്കീം വ്യവസ്ഥ കോൺഫിഗറേഷൻ" : "Scheme Conditions Configuration"}
                        </th>
                        <th className="px-4 py-2.5">
                          {lang === "ml" ? "വ്യവസ്ഥ മൂല്യങ്ങൾ" : "Condition Values"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {eligibilityFields.map((field, index) => {
                        const rule = eligibilityRules[field.key];
                        const operatorKind = getOperatorKind(rule.operator);
                        const showsChoices =
                          field.valueKind === "options" && (operatorKind === "single" || operatorKind === "multi");
                        const showsNumber =
                          (field.valueKind === "number" || field.valueKind === "currency") && operatorKind === "range";
                        const isRange = rule.operator === "Between";
                        const isDisabled =
                          field.key === "disabilityPercentage" &&
                          eligibilityRules.disabilityStatus.operator === "No";
                        const error = isDisabled ? "" : getEligibilityRuleError(field, rule);

                        return (
                          <tr key={field.key} className="border-t border-border/60 align-top even:bg-muted/10">
                            <td className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground">{index + 1}</td>
                            <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{field.label}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex flex-col gap-2">
                                <div className="flex flex-nowrap items-center gap-1.5">
                                  <select
                                    value={rule.operator}
                                    onChange={(e) => updateEligibilityRule(field.key, { operator: e.target.value })}
                                    disabled={isDisabled}
                                    className={`h-9 shrink-0 ${field.valueKind === "number" ? "w-36" : "w-44"} rounded-lg border border-border bg-background xl:bg-white px-2.5 text-xs font-semibold text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors ${
                                      isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                    }`}
                                  >
                                    {field.operators.map((operator) => (
                                      <option key={operator} value={operator}>
                                        {operator}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex flex-nowrap items-center gap-2">
                                {showsChoices && (
                                  <EligibilityConditionValueSelect
                                    field={field}
                                    rule={rule}
                                    multi={operatorKind === "multi"}
                                    disabled={isDisabled}
                                    onToggle={(option) =>
                                      toggleEligibilityValue(field.key, option, operatorKind === "multi")
                                    }
                                  />
                                )}

                                {showsNumber && (
                                  <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
                                    <div className="relative">
                                      {field.valueKind === "currency" && (
                                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                          ₹
                                        </span>
                                      )}
                                      <input
                                        type="number"
                                        min={field.minValue}
                                        max={field.maxValue}
                                        inputMode="numeric"
                                        value={rule.min}
                                        onChange={(e) => updateEligibilityRule(field.key, { min: e.target.value })}
                                        placeholder={isRange ? "Min" : field.placeholder ?? "Value"}
                                        className={`h-9 ${field.valueKind === "currency" ? "w-32" : "w-16"} rounded-lg border border-border bg-background xl:bg-white px-2.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors ${
                                          field.valueKind === "currency" ? "pl-6" : ""
                                        }`}
                                      />
                                    </div>
                                    {isRange && (
                                      <>
                                        <span className="text-[11px] font-semibold text-muted-foreground">and</span>
                                        <input
                                          type="number"
                                          min={field.minValue}
                                          max={field.maxValue}
                                          inputMode="numeric"
                                          value={rule.max}
                                          onChange={(e) => updateEligibilityRule(field.key, { max: e.target.value })}
                                          placeholder="Max"
                                          className={`h-9 ${field.valueKind === "currency" ? "w-28" : "w-16"} rounded-lg border border-border bg-background xl:bg-white px-2.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors`}
                                        />
                                      </>
                                    )}
                                  </div>
                                )}

                                {!showsChoices && !showsNumber && (
                                  <span className="flex h-9 items-center text-xs font-semibold text-muted-foreground">—</span>
                                )}

                                {error && (
                                  <p className="shrink-0 whitespace-nowrap text-[11px] font-semibold text-destructive">{error}</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: ADDITIONAL QUESTIONS & DOCUMENTS                               */}
        {/* ========================================================================= */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                {lang === "ml" ? "അധിക ചോദ്യങ്ങളും രേഖകളും" : "Additional Questions & Documents"}
              </h2>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddFieldMenu((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={showAddFieldMenu}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {lang === "ml" ? "ഫീൽഡ് ചേർക്കുക" : "Add Field"}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${showAddFieldMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showAddFieldMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowAddFieldMenu(false)}
                      aria-hidden="true"
                    />
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl"
                    >
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {lang === "ml" ? "ഫീൽഡ് തരം" : "Field type"}
                      </p>
                      {QUESTIONNAIRE_FIELD_TYPES.map((fieldType) => (
                        <button
                          key={fieldType.type}
                          type="button"
                          role="menuitem"
                          onClick={() => addQuestionnaireField(fieldType.type)}
                          className="flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <QuestionnaireFieldIcon type={fieldType.type} className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-xs font-bold text-foreground">{fieldType.label}</span>
                            <span className="block text-[10.5px] text-muted-foreground">
                              {fieldType.description}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-5">
              {/* Additional Questions & Documents Builder */}
              <div className="rounded-2xl border border-border bg-card">
                <div className="space-y-3 p-4">
                  {questionnaireFields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center">
                      <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </span>
                      <p className="text-xs font-bold text-foreground">
                        {lang === "ml" ? "ഇതുവരെ ഫീൽഡുകളൊന്നും ചേർത്തിട്ടില്ല" : "No fields added yet"}
                      </p>
                      <p className="mt-1 max-w-md text-[11px] text-muted-foreground">
                        {lang === "ml"
                          ? "ഫയൽ അപ്ലോഡ്, Yes/No, വിവരണം, ഡ്രോപ്പ്ഡൗൺ അല്ലെങ്കിൽ ഒറ്റവരി ചോദ്യങ്ങൾ ചേർക്കാൻ Add Field ഉപയോഗിക്കുക."
                          : "Use Add Field to create a file upload, Yes/No, descriptive, dropdown, or single-line question."}
                      </p>
                    </div>
                  ) : (
                    questionnaireFields.map((field, index) => {
                      const typeMeta = QUESTIONNAIRE_FIELD_TYPES.find((option) => option.type === field.type);
                      return (
                        <div
                          key={field.id}
                          className="rounded-xl border border-border bg-background p-3.5 sm:bg-card"
                        >
                          <div className="flex flex-wrap items-start gap-2.5">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <QuestionnaireFieldIcon type={field.type} className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1 space-y-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground">Q{index + 1}</span>
                                <input
                                  value={field.label}
                                  onChange={(e) => updateQuestionnaireField(field.id, { label: e.target.value })}
                                  placeholder={lang === "ml" ? "ചോദ്യം / ഫീൽഡ് ലേബൽ" : "Question / field label"}
                                  className="h-9 min-w-[200px] flex-1 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                                />
                                <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                                  {typeMeta?.label}
                                </span>
                                <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[11px] font-semibold text-foreground">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) =>
                                      updateQuestionnaireField(field.id, { required: e.target.checked })
                                    }
                                    className="accent-primary h-3.5 w-3.5"
                                  />
                                  {lang === "ml" ? "നിർബന്ധം" : "Required"}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeQuestionnaireField(field.id)}
                                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                  title={lang === "ml" ? "ഫീൽഡ് നീക്കം ചെയ്യുക" : "Remove field"}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {renderQuestionnairePreview(field)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        </div>
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
        <div className="w-full flex items-center justify-end gap-2 overflow-x-auto no-scrollbar desktop-hide-scrollbar">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleBackNavigation}
            className="rounded-xl sm:rounded-lg border border-border bg-card px-4 py-2.5 sm:h-10 sm:px-5 sm:py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs shrink-0"
          >
            {lang === "ml" ? "റദ്ദാക്കുക" : "Cancel"}
          </button>

          {/* Previous Step Button */}
          {activeStep > 1 && (
            <button
              type="button"
              onClick={() => setActiveStep(activeStep - 1)}
              className="rounded-xl sm:rounded-lg border border-border bg-card px-4 py-2.5 sm:h-10 sm:px-5 sm:py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs shrink-0"
            >
              {lang === "ml" ? "മുമ്പത്തെ ഘട്ടം" : "Previous"}
            </button>
          )}

          {/* Next Step Button (Primary Color) */}
          {activeStep < 3 && (
            <button
              type="button"
              onClick={() => setActiveStep(activeStep + 1)}
              className="rounded-xl sm:rounded-lg bg-primary px-5 py-2.5 sm:h-10 sm:px-5 sm:py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs flex items-center gap-1.5 active:scale-98 shrink-0"
            >
              <span>{lang === "ml" ? "അടുത്ത ഘട്ടം" : "Next"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* Create Scheme Primary Button (Show ONLY in Section 3 — Additional Questions & Documents) */}
          {activeStep === 3 && (
            <button
              type="button"
              onClick={() => handleSubmit("Active")}
              className="rounded-xl sm:rounded-lg bg-primary px-5 py-2.5 sm:h-10 sm:px-5 sm:py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs flex items-center gap-2 active:scale-98 shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isEditing
                  ? lang === "ml"
                    ? "മാറ്റങ്ങൾ സേവ് ചെയ്യുക"
                    : "Update Scheme"
                  : lang === "ml"
                    ? "പദ്ധതി സൃഷ്ടിക്കുക"
                    : "Create Scheme"}
              </span>
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
