import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Upload,
  UploadCloud,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  MoreVertical,
  Copy,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Eye,
  Building,
  Tag,
  DollarSign,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Layers,
  ShieldAlert,
  Info,
  Link as LinkIcon
} from "lucide-react";

export interface CreateSchemeFlowProps {
  lang: "en" | "ml";
  onClose: () => void;
  onPublishSuccess?: (schemeData: any) => void;
}

export interface EligibilityRule {
  id: string;
  attribute: string;
  condition: string;
  value: string;
  unit?: string;
  grouping: "ALL" | "ANY";
  missingBehavior: "Request Answer" | "Manual Review";
  reasonShownToWorker: string;
  sourceUrl?: string;
  enabled?: boolean;
}

export interface CustomFieldOption {
  id: string;
  labelEn: string;
  labelMl: string;
}

export interface CustomField {
  id: string;
  type: "file_upload" | "yes_no" | "descriptive_text" | "dropdown" | "single_text";
  labelEn: string;
  labelMl: string;
  required: boolean;
  
  // Conditional visibility
  showOnlyWhenFieldId?: string;
  showOnlyWhenValue?: string;
  
  // Re-use applicant info
  reuseApplicantAttr?: string;

  // Type specific props
  // 1. File Upload
  documentName?: string;
  uploadInstructions?: string;
  acceptedFormats?: string[]; // e.g. ["pdf", "jpg", "png"]
  maxFileSizeMb?: number;
  maxFileCount?: number;
  allowOfflineVerification?: boolean;
  offlineVerificationLabelMl?: string;

  // 2. Yes / No
  questionTextEn?: string;
  questionTextMl?: string;
  yesFollowUpText?: string;
  noFollowUpText?: string;
  followUpTrigger?: "Yes" | "No";

  // 3 & 5. Descriptive / Single Text
  placeholderEn?: string;
  placeholderMl?: string;
  helpTextEn?: string;
  helpTextMl?: string;
  charLimit?: number;

  // 4. Dropdown
  options?: CustomFieldOption[];
  isMultiSelect?: boolean;
}

const FIELD_TYPE_META: Record<
  CustomField["type"],
  { label: string; description: string }
> = {
  file_upload: {
    label: "File Upload",
    description: "Collect a document or image.",
  },
  yes_no: {
    label: "Yes / No",
    description: "Ask a two-option question.",
  },
  descriptive_text: {
    label: "Descriptive Text",
    description: "Collect a detailed answer.",
  },
  dropdown: {
    label: "Dropdown",
    description: "Choose from a list of options.",
  },
  single_text: {
    label: "Single-line Text",
    description: "Collect a short answer.",
  },
};

const UPLOAD_FORMAT_OPTIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];

const APPLICANT_ATTRIBUTES = [
  "Gender",
  "Age, calculated from date of birth",
  "Religion",
  "Caste / Community",
  "Disability Status",
  "Disability Percentage",
  "Minority Status",
  "Student Status",
  "Employment Status",
  "Occupation",
  "Annual Family Income",
  "Marital Status",
  "Household BPL Status",
];

type EligibilityConditionMode =
  | ""
  | "No Restriction"
  | "Minimum"
  | "Maximum"
  | "Between"
  | "Must be Yes"
  | "Must be No"
  | "Select values";

interface EligibilityConditionConfig {
  mode: EligibilityConditionMode;
  values: string[];
  min: string;
  max: string;
  referenceDate: string;
}

const YES_NO_ELIGIBILITY_ATTRIBUTES = [
  "Minority Status",
  "Disability Status",
  "Student Status",
  "Household BPL Status",
];

const NUMERIC_ELIGIBILITY_ATTRIBUTES = [
  "Age, calculated from date of birth",
  "Disability Percentage",
  "Annual Family Income",
];

const SEARCHABLE_ELIGIBILITY_ATTRIBUTES = ["Occupation", "Caste / Community"];

const ELIGIBILITY_ATTRIBUTE_UNITS: Record<string, string> = {
  "Age, calculated from date of birth": "Years",
  "Disability Percentage": "%",
  "Annual Family Income": "INR / Year",
};

const ELIGIBILITY_VALUE_OPTIONS: Record<string, string[]> = {
  Gender: ["Male", "Female", "Transgender / Other"],
  "Employment Status": ["Employed", "Unemployed", "Self-employed / Entrepreneur"],
  Occupation: [
    "Farmer / Agriculture",
    "Daily Wage Worker",
    "Salaried",
    "Self-Employed",
    "Homemaker",
    "Student",
    "Unemployed",
    "Retired",
    "Other",
  ],
  "Marital Status": ["Single / Unmarried", "Married", "Widowed", "Divorcee", "Separated"],
  Religion: ["Hindu", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Other"],
  "Caste / Community": ["General", "OBC", "SC", "ST", "OBC-NCL", "EWS"],
};

const ELIGIBILITY_VALUE_LABELS: Record<string, string> = {
  Gender: "Select applicable genders",
  "Employment Status": "Select applicable statuses",
  Occupation: "Search and select occupations",
  "Marital Status": "Select applicable statuses",
  Religion: "Select applicable religions",
  "Caste / Community": "Search and select castes",
};

const todayIso = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const createEmptyEligibilityConditions = () => {
  const result: Record<string, EligibilityConditionConfig> = {};
  APPLICANT_ATTRIBUTES.forEach((attribute) => {
    result[attribute] = {
      mode: "",
      values: [],
      min: "",
      max: "",
      referenceDate: attribute === "Age, calculated from date of birth" ? todayIso() : "",
    };
  });
  return result;
};

const getEligibilityConditionError = (
  attribute: string,
  condition: EligibilityConditionConfig | undefined
) => {
  if (!condition || !condition.mode) return "Select a condition or No Restriction.";
  if (condition.mode === "No Restriction") return null;

  if (condition.mode === "Select values") {
    return condition.values.length === 0 ? "Select at least one value." : null;
  }

  if (!NUMERIC_ELIGIBILITY_ATTRIBUTES.includes(attribute)) return null;

  const needsMin = condition.mode === "Minimum" || condition.mode === "Between";
  const needsMax = condition.mode === "Maximum" || condition.mode === "Between";

  if (needsMin && !condition.min.trim()) return "Enter a minimum value.";
  if (needsMax && !condition.max.trim()) return "Enter a maximum value.";

  const min = needsMin ? Number(condition.min) : null;
  const max = needsMax ? Number(condition.max) : null;
  if ((min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max))) {
    return "Enter valid numeric values.";
  }
  if (
    attribute === "Disability Percentage" &&
    ((min !== null && (min < 0 || min > 100)) || (max !== null && (max < 0 || max > 100)))
  ) {
    return "Disability percentage must be between 0 and 100.";
  }
  if (
    attribute === "Annual Family Income" &&
    ((min !== null && min < 0) || (max !== null && max < 0))
  ) {
    return "Annual family income cannot be negative.";
  }
  if (
    attribute === "Age, calculated from date of birth" &&
    ((min !== null && (min < 0 || min > 120)) || (max !== null && (max < 0 || max > 120)))
  ) {
    return "Enter an age between 0 and 120 years.";
  }
  if (min !== null && max !== null && min > max) {
    return "Minimum cannot be greater than maximum.";
  }
  if (attribute === "Age, calculated from date of birth" && !condition.referenceDate) {
    return "Select the age reference date.";
  }
  if (
    attribute === "Age, calculated from date of birth" &&
    condition.referenceDate &&
    Number.isNaN(new Date(condition.referenceDate).getTime())
  ) {
    return "Select a valid age reference date.";
  }

  return null;
};

const resolveEligibilityConflicts = (
  conditions: Record<string, EligibilityConditionConfig>
) => {
  const disabilityStatus = conditions["Disability Status"];
  const disabilityPercentage = conditions["Disability Percentage"];
  if (
    disabilityStatus?.mode === "Must be No" &&
    disabilityPercentage?.mode &&
    disabilityPercentage.mode !== "No Restriction"
  ) {
    conditions["Disability Percentage"] = {
      ...disabilityPercentage,
      mode: "No Restriction",
      values: [],
      min: "",
      max: "",
    };
  }
  return conditions;
};

const mapRuleToCondition = (
  condition: EligibilityConditionConfig,
  rule: EligibilityRule
): EligibilityConditionConfig => {
  const next = { ...condition, values: [...condition.values] };
  const value = rule.value.trim();

  if (rule.condition === "Is less than or equal to") {
    next.mode = "Maximum";
    next.max = value;
  } else if (rule.condition === "Is greater than or equal to") {
    next.mode = "Minimum";
    next.min = value;
  } else if (rule.condition === "Is between") {
    next.mode = "Between";
    const [min = "", max = ""] = value.split(/\s*(?:-|–|to)\s*/i);
    next.min = min.trim();
    next.max = max.trim();
  } else if (rule.condition === "Must be Yes / Must be No") {
    next.mode = /yes/i.test(value) ? "Must be Yes" : "Must be No";
  } else if (rule.condition === "Select applicable options" || rule.condition === "Is exactly equal to") {
    next.mode = "Select values";
    next.values = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return next;
};

const conditionsFromRules = (rules: EligibilityRule[]) => {
  const conditions = createEmptyEligibilityConditions();
  rules.forEach((rule) => {
    if (rule.enabled === false || !conditions[rule.attribute]) return;
    conditions[rule.attribute] = mapRuleToCondition(conditions[rule.attribute], rule);
  });
  return resolveEligibilityConflicts(conditions);
};

const rulesFromConditions = (
  conditions: Record<string, EligibilityConditionConfig>,
  grouping: "ALL" | "ANY",
  existingRules: EligibilityRule[]
) => {
  const existingByAttribute = new Map(existingRules.map((rule) => [rule.attribute, rule]));
  const nextRules: EligibilityRule[] = [];

  APPLICANT_ATTRIBUTES.forEach((attribute, index) => {
    const condition = conditions[attribute];
    if (!condition || !condition.mode || condition.mode === "No Restriction") return;

    let ruleCondition = "";
    let value = "";
    if (condition.mode === "Minimum") {
      ruleCondition = "Is greater than or equal to";
      value = condition.min.trim();
    } else if (condition.mode === "Maximum") {
      ruleCondition = "Is less than or equal to";
      value = condition.max.trim();
    } else if (condition.mode === "Between") {
      ruleCondition = "Is between";
      value = `${condition.min.trim()} - ${condition.max.trim()}`;
    } else if (condition.mode === "Must be Yes" || condition.mode === "Must be No") {
      ruleCondition = "Must be Yes / Must be No";
      value = condition.mode;
    } else if (condition.mode === "Select values") {
      ruleCondition = "Select applicable options";
      value = condition.values.join(", ");
    }

    const existing = existingByAttribute.get(attribute);
    nextRules.push({
      id: existing?.id ?? `rule-${Date.now()}-${index}`,
      attribute,
      condition: ruleCondition,
      value,
      unit: ELIGIBILITY_ATTRIBUTE_UNITS[attribute] ?? existing?.unit ?? "",
      grouping,
      missingBehavior: existing?.missingBehavior ?? "Request Answer",
      reasonShownToWorker: existing?.reasonShownToWorker ?? "",
      sourceUrl: existing?.sourceUrl,
      enabled: true,
    });
  });

  existingRules.forEach((rule) => {
    if (!APPLICANT_ATTRIBUTES.includes(rule.attribute)) nextRules.push(rule);
  });
  return nextRules;
};

export const MobileCreateSchemeFlow: React.FC<CreateSchemeFlowProps> = ({
  lang,
  onClose,
  onPublishSuccess,
}) => {
  // Navigation State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"public" | "worker">("public");
  const formBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formBodyRef.current?.scrollTo({ top: 0 });
  }, [currentStep, isPreviewMode]);

  // Inline Validation Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---------------------------------------------------------------------------
  // STEP 1 STATE: Basic Information
  // ---------------------------------------------------------------------------
  const [schemeNameEn, setSchemeNameEn] = useState("");
  const [schemeNameMl, setSchemeNameMl] = useState("");
  const [shortName, setShortName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [category, setCategory] = useState("Health & Medical");
  const [department, setDepartment] = useState("Department of Health & Family Welfare");
  const [customDepartment, setDepartmentCustom] = useState("");
  const [aboutScheme, setAboutScheme] = useState("");
  const [shortCardDescription, setShortCardDescription] = useState("");
  const [officialWebsite, setOfficialWebsite] = useState("");

  // Categories list
  const categoryOptions = [
    { en: "Health & Medical", ml: "ആരോഗ്യവും വൈദ്യസഹായവും" },
    { en: "Education & Student Aid", ml: "വിദ്യാഭ്യാസവും സ്കോളർഷിപ്പും" },
    { en: "Agriculture & Farmers", ml: "കൃഷിയും കർഷകക്ഷേമവും" },
    { en: "Social Welfare & Pension", ml: "സാമൂഹ്യക്ഷേമവും പെൻഷനും" },
    { en: "Housing & Shelter", ml: "ഭവനനിർമ്മാണം" },
    { en: "Employment & Skill", ml: "തൊഴിലും നൈപുണ്യവും" },
    { en: "Women & Child Development", ml: "വനിതാ ശിശുവികസനം" },
    { en: "Fisheries & Coastal", ml: "മത്സ്യബന്ധന മേഖല" },
    { en: "Other", ml: "മറ്റുള്ളവ" },
  ];

  const departmentOptions = [
    "Department of Health & Family Welfare",
    "Department of General Education",
    "Department of Agriculture Development and Farmers Welfare",
    "Department of Social Justice",
    "Department of Revenue",
    "Local Self Government Department",
    "Department of Fisheries",
    "Department of Labour and Skills",
    "Custom / Other",
  ];

  // ---------------------------------------------------------------------------
  // STEP 2 STATE: Benefits & Eligibility
  // ---------------------------------------------------------------------------
  // Benefits
  const [selectedBenefitTypes, setSelectedBenefitTypes] = useState<string[]>(["Financial Assistance"]);
  const [isBenefitDropdownOpen, setIsBenefitDropdownOpen] = useState(false);
  const [customBenefitType, setCustomBenefitType] = useState("");
  const [benefitSummary, setBenefitSummary] = useState("");
  const [benefitAmountType, setBenefitAmountType] = useState<"fixed" | "range" | "varies">("fixed");
  const [fixedAmount, setFixedAmount] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("Monthly");
  const [customPaymentFrequency, setCustomPaymentFrequency] = useState("");
  const [benefitDuration, setBenefitDuration] = useState("");
  const [coverageLimit, setCoverageLimit] = useState("");
  const [contributionType, setContributionType] = useState<"Amount" | "Percentage" | "None">("None");
  const [contributionValue, setContributionValue] = useState("");

  // Eligibility
  const [eligibilitySummary, setEligibilitySummary] = useState("");
  const [exclusionsText, setExclusionsText] = useState("");
  const [applicableLocationsType, setApplicableLocationsType] = useState<"all" | "selected">("all");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", 
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", 
    "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
  ]);
  const [selectedLocalBodyTypes, setSelectedLocalBodyTypes] = useState<string[]>(["Grama Panchayat", "Municipality", "Municipal Corporation"]);
  const [selectedBlockTaluk, setSelectedBlockTaluk] = useState("");
  const [manualReviewConditions, setManualReviewConditions] = useState("");

  // Overall Rule Grouping
  const [overallGrouping, setOverallGrouping] = useState<"ALL" | "ANY">("ALL");

  // Eligibility Rules
  const [eligibilityRules, setEligibilityRules] = useState<EligibilityRule[]>([
    {
      id: "rule-1",
      attribute: "Annual Family Income",
      condition: "Is less than or equal to",
      value: "100000",
      unit: "INR / Year",
      grouping: "ALL",
      missingBehavior: "Request Answer",
      reasonShownToWorker: "Income must be within BPL ceiling of ₹1,00,000/yr",
      sourceUrl: "https://kerala.gov.in/schemes/bpl-income",
      enabled: true,
    },
    {
      id: "rule-2",
      attribute: "Age, calculated from date of birth",
      condition: "Is greater than or equal to",
      value: "18",
      unit: "Years",
      grouping: "ALL",
      missingBehavior: "Request Answer",
      reasonShownToWorker: "Applicant must be an adult (18+ years)",
      sourceUrl: "https://kerala.gov.in/schemes/age-rule",
      enabled: true,
    },
  ]);

  // Eligibility conditions and the preview share the same saved rule data.
  const [eligibilityConditions, setEligibilityConditions] = useState(() =>
    conditionsFromRules(eligibilityRules)
  );
  const [conditionSearch, setConditionSearch] = useState<Record<string, string>>({});
  const [step4DraftNotice, setStep4DraftNotice] = useState(false);

  // Rule Builder Form state
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleAttr, setRuleAttr] = useState("Annual Family Income");
  const [ruleCond, setRuleCond] = useState("Is less than or equal to");
  const [ruleVal, setRuleVal] = useState("");
  const [ruleUnit, setRuleUnit] = useState("");
  const [ruleGrouping, setRuleGrouping] = useState<"ALL" | "ANY">("ALL");
  const [ruleMissing, setRuleMissing] = useState<"Request Answer" | "Manual Review">("Request Answer");
  const [ruleReason, setRuleReason] = useState("");
  const [ruleSourceUrl, setRuleSourceUrl] = useState("");
  const [ruleEnabled, setRuleEnabled] = useState(true);

  // Shared Applicant Attributes used by applicant profile and questionnaire
  const applicantAttributes = APPLICANT_ATTRIBUTES;

  // ---------------------------------------------------------------------------
  // STEP 3 STATE: Details & Documents (Custom Dynamic Fields)
  // ---------------------------------------------------------------------------
  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: "field-1",
      type: "file_upload",
      labelEn: "Aadhaar Card Copy",
      labelMl: "ആധാർ കാർഡിന്റെ പകർപ്പ്",
      required: true,
      documentName: "Aadhaar Card",
      uploadInstructions: "Upload clear front and back copy of Aadhaar card in PDF or JPG format.",
      acceptedFormats: ["pdf", "jpg", "png"],
      maxFileSizeMb: 5,
      maxFileCount: 1,
      allowOfflineVerification: true,
      reuseApplicantAttr: "Aadhaar Number",
    },
    {
      id: "field-2",
      type: "file_upload",
      labelEn: "Income Certificate",
      labelMl: "വരുമാന സർട്ടിഫിക്കറ്റ്",
      required: true,
      documentName: "Income Certificate from Village Officer",
      uploadInstructions: "Issued within the last 6 months by competent authority.",
      acceptedFormats: ["pdf"],
      maxFileSizeMb: 2,
      maxFileCount: 1,
      allowOfflineVerification: true,
    },
    {
      id: "field-3",
      type: "yes_no",
      labelEn: "Are you receiving any other Government Pension?",
      labelMl: "മറ്റ് ഏതെങ്കിലും സർക്കാർ പെൻഷൻ ലഭിക്കുന്നുണ്ടോ?",
      required: true,
      questionTextEn: "Are you receiving any other Government Pension?",
      questionTextMl: "മറ്റ് ഏതെങ്കിലും സർക്കാർ പെൻഷൻ ലഭിക്കുന്നുണ്ടോ?",
      yesFollowUpText: "Please specify the pension name and monthly amount.",
    },
  ]);

  // Modal for Adding / Editing Custom Field
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showFieldTypeSheet, setShowFieldTypeSheet] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldMenuId, setFieldMenuId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showFieldAdvanced, setShowFieldAdvanced] = useState(false);

  // Form states for Field modal
  const [fieldType, setFieldType] = useState<CustomField["type"]>("file_upload");
  const [fieldLabelEn, setFieldLabelEn] = useState("");
  const [fieldLabelMl, setFieldLabelMl] = useState("");
  const [fieldRequired, setFieldRequired] = useState(true);
  
  // Conditional visibility
  const [fieldShowOnlyWhenFieldId, setFieldShowOnlyWhenFieldId] = useState("");
  const [fieldShowOnlyWhenValue, setFieldShowOnlyWhenValue] = useState("Yes");
  const [fieldReuseApplicantAttr, setFieldReuseApplicantAttr] = useState("");

  // Type specific
  const [fieldUploadInstructions, setFieldUploadInstructions] = useState("");
  const [fieldAcceptedFormats, setFieldAcceptedFormats] = useState<string[]>(["pdf", "jpg"]);
  const [fieldMaxFileSizeMb, setFieldMaxFileSizeMb] = useState<number>(5);
  const [fieldMaxFileCount, setFieldMaxFileCount] = useState<number>(1);
  const [fieldAllowOfflineVerif, setFieldAllowOfflineVerif] = useState(true);
  const [fieldOfflineVerificationLabelMl, setFieldOfflineVerificationLabelMl] = useState("");

  const [fieldYesFollowUp, setFieldYesFollowUp] = useState("");
  const [fieldNoFollowUp, setFieldNoFollowUp] = useState("");
  const [fieldFollowUpEnabled, setFieldFollowUpEnabled] = useState(false);
  const [fieldFollowUpTrigger, setFieldFollowUpTrigger] = useState<"Yes" | "No">("Yes");

  const [fieldPlaceholderEn, setFieldPlaceholderEn] = useState("");
  const [fieldPlaceholderMl, setFieldPlaceholderMl] = useState("");
  const [fieldHelpTextEn, setFieldHelpTextEn] = useState("");
  const [fieldHelpTextMl, setFieldHelpTextMl] = useState("");
  const [fieldCharLimit, setFieldCharLimit] = useState<number>(250);

  const [fieldOptions, setFieldOptions] = useState<CustomFieldOption[]>([
    { id: "opt-1", labelEn: "Option 1", labelMl: "ഓപ്ഷൻ 1" },
    { id: "opt-2", labelEn: "Option 2", labelMl: "ഓപ്ഷൻ 2" },
  ]);
  const [fieldIsMultiSelect, setFieldIsMultiSelect] = useState(false);

  // Worker generated form mock state (for worker simulation in preview)
  const [simulatedUploadedFiles, setSimulatedUploadedFiles] = useState<Record<string, string>>({});
  const [simulatedVerifiedDocs, setSimulatedVerifiedDocs] = useState<Record<string, boolean>>({});
  const [simulatedYesNoAnswers, setSimulatedYesNoAnswers] = useState<Record<string, string>>({});
  const [simulatedDropdownAnswers, setSimulatedDropdownAnswers] = useState<Record<string, string>>({});

  // ---------------------------------------------------------------------------
  // HELPER FUNCTIONS & ACTIONS
  // ---------------------------------------------------------------------------

  // Handle Logo Upload Simulation
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setLogoUrl(fakeUrl);
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!schemeNameEn.trim()) errs.schemeNameEn = lang === "ml" ? "ഇംഗ്ലീഷ് പേര് നൽകുക" : "Scheme Name (English) is required";
    if (!category.trim()) errs.category = lang === "ml" ? "വിഭാഗം തിരഞ്ഞെടുക്കുക" : "Category is required";
    if (!department.trim()) errs.department = lang === "ml" ? "വകുപ്പ് തിരഞ്ഞെടുക്കുക" : "Department is required";
    if (department === "Custom / Other" && !customDepartment.trim()) {
      errs.customDepartment = lang === "ml" ? "വകുപ്പിന്റെ പേര് നൽകുക" : "Please enter custom department name";
    }
    if (!aboutScheme.trim()) errs.aboutScheme = lang === "ml" ? "പദ്ധതിയെപ്പറ്റി വിവരിക്കുക" : "About Us is required";
    if (selectedBenefitTypes.length === 0) {
      errs.benefitTypes = lang === "ml" ? "കുറഞ്ഞത് ഒരു ആനുകൂല്യ തരം തിരഞ്ഞെടുക്കുക" : "Select at least one Benefit Type";
    }
    if (selectedBenefitTypes.includes("Other") && !customBenefitType.trim()) {
      errs.customBenefitType = lang === "ml" ? "ആനുകൂല്യ തരം നൽകുക" : "Specify custom benefit type";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Navigation handlers
  const handleContinueFromStep1 = () => {
    if (validateStep1()) {
      setIsBenefitDropdownOpen(false);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleContinueFromStep2 = () => {
    setCurrentStep(3);
    setStep4DraftNotice(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateEligibility = () => {
    const errs: Record<string, string> = {};

    APPLICANT_ATTRIBUTES.forEach((attribute) => {
      const key = `elig_${attribute}`;
      const error = getEligibilityConditionError(attribute, eligibilityConditions[attribute]);
      if (error) errs[key] = error;
    });

    if (eligibilityConditions["Disability Status"]?.mode === "Must be No") {
      const percentage = eligibilityConditions["Disability Percentage"];
      if (percentage?.mode && percentage.mode !== "No Restriction") {
        errs["elig_Disability Percentage"] =
          "Remove the disability percentage restriction when Disability Status is Must be No.";
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      APPLICANT_ATTRIBUTES.forEach((attribute) => delete next[`elig_${attribute}`]);
      return { ...next, ...errs };
    });
    return Object.keys(errs).length === 0;
  };

  const handleOpenPreview = () => {
    if (!validateEligibility()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setIsPreviewMode(true);
  };

  const handleSaveDraft = () => {
    setStep4DraftNotice(true);
  };

  const handlePublishScheme = () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      setIsPreviewMode(false);
      return;
    }
    if (!validateEligibility()) {
      setCurrentStep(2);
      setIsPreviewMode(false);
      return;
    }

    // Success publish
    const schemePayload = {
      nameEn: schemeNameEn,
      nameMl: schemeNameMl || schemeNameEn,
      shortName,
      logoUrl,
      category,
      department: department === "Custom / Other" ? customDepartment : department,
      aboutScheme,
      shortCardDescription,
      officialWebsite,
      benefitTypes: selectedBenefitTypes,
      benefitSummary,
      eligibilitySummary,
      eligibilityGrouping: overallGrouping,
      eligibilityConditions,
      rulesCount: eligibilityRules.length,
      customFields,
      customFieldsCount: customFields.length,
    };

    if (onPublishSuccess) {
      onPublishSuccess(schemePayload);
    } else {
      onClose();
    }
  };

  // Rule operations
  const handleOpenAddRule = () => {
    setEditingRuleId(null);
    setRuleAttr("Annual Family Income");
    setRuleCond("Is less than or equal to");
    setRuleVal("");
    setRuleUnit("INR / Year");
    setRuleGrouping("ALL");
    setRuleMissing("Request Answer");
    setRuleReason("");
    setRuleSourceUrl("");
    setRuleEnabled(true);
    setShowRuleModal(true);
  };

  const handleOpenEditRule = (rule: EligibilityRule) => {
    setEditingRuleId(rule.id);
    setRuleAttr(rule.attribute);
    setRuleCond(rule.condition);
    setRuleVal(rule.value);
    setRuleUnit(rule.unit || "");
    setRuleGrouping(rule.grouping);
    setRuleMissing(rule.missingBehavior);
    setRuleReason(rule.reasonShownToWorker);
    setRuleSourceUrl(rule.sourceUrl || "");
    setRuleEnabled(rule.enabled ?? true);
    setShowRuleModal(true);
  };

  const handleSaveRule = () => {
    if (!ruleAttr || !ruleCond || !ruleVal) return;

    const nextRules = editingRuleId
      ? eligibilityRules
          .filter((rule) => rule.id === editingRuleId || rule.attribute !== ruleAttr || rule.enabled === false)
          .map((rule) =>
            rule.id === editingRuleId
              ? {
                  ...rule,
                  attribute: ruleAttr,
                  condition: ruleCond,
                  value: ruleVal,
                  unit: ruleUnit,
                  grouping: ruleGrouping,
                  missingBehavior: ruleMissing,
                  reasonShownToWorker: ruleReason,
                  sourceUrl: ruleSourceUrl,
                  enabled: ruleEnabled,
                }
              : rule
          )
      : [
          ...eligibilityRules.filter((rule) => rule.attribute !== ruleAttr || rule.enabled === false),
          {
        id: `rule-${Date.now()}`,
        attribute: ruleAttr,
        condition: ruleCond,
        value: ruleVal,
        unit: ruleUnit,
        grouping: ruleGrouping,
        missingBehavior: ruleMissing,
        reasonShownToWorker: ruleReason,
        sourceUrl: ruleSourceUrl,
        enabled: ruleEnabled,
          },
        ];

    setEligibilityRules(nextRules);
    setEligibilityConditions(conditionsFromRules(nextRules));
    setShowRuleModal(false);
  };

  const handleToggleRuleEnabled = (id: string) => {
    const nextRules = eligibilityRules.map((rule) =>
      rule.id === id ? { ...rule, enabled: rule.enabled === false ? true : false } : rule
    );
    setEligibilityRules(nextRules);
    setEligibilityConditions(conditionsFromRules(nextRules));
  };

  const handleDeleteRule = (id: string) => {
    const nextRules = eligibilityRules.filter((rule) => rule.id !== id);
    setEligibilityRules(nextRules);
    setEligibilityConditions(conditionsFromRules(nextRules));
  };

  const updateEligibilityCondition = (
    attribute: string,
    patch: Partial<EligibilityConditionConfig>
  ) => {
    let nextConditions = {
      ...eligibilityConditions,
      [attribute]: { ...eligibilityConditions[attribute], ...patch },
    };

    if (attribute === "Disability Status" && patch.mode === "Must be No") {
      nextConditions = {
        ...nextConditions,
        "Disability Percentage": {
          ...nextConditions["Disability Percentage"],
          mode: "No Restriction",
          values: [],
          min: "",
          max: "",
        },
      };
    }

    nextConditions = resolveEligibilityConflicts(nextConditions);
    setEligibilityConditions(nextConditions);
    setEligibilityRules((prev) => rulesFromConditions(nextConditions, overallGrouping, prev));
    setStep4DraftNotice(false);

    setErrors((prev) => {
      const next = { ...prev };
      delete next[`elig_${attribute}`];
      if (attribute === "Disability Status") delete next["elig_Disability Percentage"];
      return next;
    });
  };

  const handleConditionModeChange = (attribute: string, mode: EligibilityConditionMode) => {
    const current = eligibilityConditions[attribute];
    updateEligibilityCondition(attribute, {
      mode,
      referenceDate:
        attribute === "Age, calculated from date of birth" && !current.referenceDate
          ? todayIso()
          : current.referenceDate,
    });
  };

  const toggleConditionValue = (attribute: string, value: string) => {
    const current = eligibilityConditions[attribute];
    const values = current.values.includes(value)
      ? current.values.filter((item) => item !== value)
      : [...current.values, value];
    updateEligibilityCondition(attribute, { values });
  };

  const handleEligibilityGroupingChange = (grouping: "ALL" | "ANY") => {
    setOverallGrouping(grouping);
    setEligibilityRules((prev) => prev.map((rule) => ({ ...rule, grouping })));
  };

  // Field operations
  const handleOpenFieldTypePicker = () => {
    setFieldMenuId(null);
    setShowFieldTypeSheet(true);
  };

  const handleOpenAddField = (type: CustomField["type"]) => {
    setShowFieldTypeSheet(false);
    setEditingFieldId(null);
    setFieldType(type);
    setFieldLabelEn("");
    setFieldLabelMl("");
    setFieldRequired(true);
    setFieldShowOnlyWhenFieldId("");
    setFieldShowOnlyWhenValue("Yes");
    setFieldReuseApplicantAttr("");

    setFieldUploadInstructions("");
    setFieldAcceptedFormats(["pdf", "jpg"]);
    setFieldMaxFileSizeMb(5);
    setFieldMaxFileCount(1);
    setFieldAllowOfflineVerif(true);
    setFieldOfflineVerificationLabelMl("");

    setFieldYesFollowUp("");
    setFieldNoFollowUp("");
    setFieldFollowUpEnabled(false);
    setFieldFollowUpTrigger("Yes");

    setFieldPlaceholderEn("");
    setFieldPlaceholderMl("");
    setFieldHelpTextEn("");
    setFieldHelpTextMl("");
    setFieldCharLimit(250);

    setFieldOptions([
      { id: "opt-1", labelEn: "Option 1", labelMl: "ഓപ്ഷൻ 1" },
      { id: "opt-2", labelEn: "Option 2", labelMl: "ഓപ്ഷൻ 2" },
    ]);
    setFieldIsMultiSelect(false);

    setFieldErrors({});
    setShowFieldAdvanced(false);

    setShowFieldModal(true);
  };

  const handleOpenEditField = (field: CustomField) => {
    setEditingFieldId(field.id);
    setFieldType(field.type);
    setFieldLabelEn(field.labelEn);
    setFieldLabelMl(field.labelMl);
    setFieldRequired(field.required);
    setFieldShowOnlyWhenFieldId(field.showOnlyWhenFieldId || "");
    setFieldShowOnlyWhenValue(field.showOnlyWhenValue || "Yes");
    setFieldReuseApplicantAttr(field.reuseApplicantAttr || "");

    setFieldUploadInstructions(field.uploadInstructions || "");
    setFieldAcceptedFormats(field.acceptedFormats || ["pdf", "jpg"]);
    setFieldMaxFileSizeMb(field.maxFileSizeMb || 5);
    setFieldMaxFileCount(field.maxFileCount || 1);
    setFieldAllowOfflineVerif(field.allowOfflineVerification ?? true);
    setFieldOfflineVerificationLabelMl(field.offlineVerificationLabelMl || "");

    setFieldYesFollowUp(field.yesFollowUpText || "");
    setFieldNoFollowUp(field.noFollowUpText || "");
    setFieldFollowUpEnabled(Boolean(field.yesFollowUpText || field.noFollowUpText));
    setFieldFollowUpTrigger(
      field.followUpTrigger || (field.noFollowUpText && !field.yesFollowUpText ? "No" : "Yes")
    );

    setFieldPlaceholderEn(field.placeholderEn || "");
    setFieldPlaceholderMl(field.placeholderMl || "");
    setFieldHelpTextEn(field.helpTextEn || "");
    setFieldHelpTextMl(field.helpTextMl || "");
    setFieldCharLimit(field.charLimit || 250);

    setFieldOptions(field.options || []);
    setFieldIsMultiSelect(field.isMultiSelect || false);

    setFieldErrors({});
    setShowFieldAdvanced(false);

    setShowFieldModal(true);
  };

  const handleSaveField = () => {
    const errs: Record<string, string> = {};
    const nextFieldId = editingFieldId || `field-${Date.now()}`;
    const cleanedOptions = fieldOptions
      .map((option) => ({
        ...option,
        labelEn: option.labelEn.trim(),
        labelMl: option.labelMl.trim(),
      }))
      .filter((option) => option.labelEn);

    if (!fieldLabelEn.trim()) errs.labelEn = "Enter a field label in English.";

    if (fieldType === "dropdown") {
      if (cleanedOptions.length === 0) {
        errs.options = "Add at least one answer option.";
      } else if (
        new Set(cleanedOptions.map((option) => option.labelEn.toLowerCase())).size !==
        cleanedOptions.length
      ) {
        errs.options = "Answer options must have unique labels.";
      }
    }

    if (fieldType === "descriptive_text" || fieldType === "single_text") {
      const maxAllowed = fieldType === "descriptive_text" ? 10000 : 500;
      if (
        !Number.isFinite(fieldCharLimit) ||
        fieldCharLimit < 1 ||
        fieldCharLimit > maxAllowed
      ) {
        errs.charLimit = `Enter a character limit between 1 and ${maxAllowed}.`;
      }
    }

    if (fieldType === "file_upload") {
      if (fieldAcceptedFormats.length === 0) {
        errs.uploadFormats = "Select at least one accepted format.";
      }
      if (
        !Number.isFinite(fieldMaxFileSizeMb) ||
        fieldMaxFileSizeMb < 1 ||
        fieldMaxFileSizeMb > 100
      ) {
        errs.maxFileSize = "Enter a maximum file size between 1 and 100 MB.";
      }
      if (
        !Number.isFinite(fieldMaxFileCount) ||
        fieldMaxFileCount < 1 ||
        fieldMaxFileCount > 20
      ) {
        errs.maxFileCount = "Enter a file count between 1 and 20.";
      }
    }

    if (fieldType === "yes_no" && fieldFollowUpEnabled) {
      const followUpText =
        fieldFollowUpTrigger === "Yes" ? fieldYesFollowUp.trim() : fieldNoFollowUp.trim();
      if (!followUpText) errs.followUp = "Enter a follow-up question or instruction.";
    }

    if (
      ["uploadFormats", "maxFileSize", "maxFileCount"].some(
        (key) => errs[key]
      )
    ) {
      setShowFieldAdvanced(true);
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const newField: CustomField = {
      id: nextFieldId,
      type: fieldType,
      labelEn: fieldLabelEn.trim(),
      labelMl: fieldLabelMl.trim() || fieldLabelEn.trim(),
      required: fieldRequired,
      showOnlyWhenFieldId: fieldShowOnlyWhenFieldId || undefined,
      showOnlyWhenValue: fieldShowOnlyWhenFieldId ? fieldShowOnlyWhenValue : undefined,
      reuseApplicantAttr:
        fieldType === "file_upload" ? undefined : fieldReuseApplicantAttr || undefined,

      documentName: fieldType === "file_upload" ? fieldLabelEn.trim() : undefined,
      uploadInstructions: fieldType === "file_upload" ? fieldUploadInstructions : undefined,
      acceptedFormats: fieldType === "file_upload" ? fieldAcceptedFormats : undefined,
      maxFileSizeMb: fieldType === "file_upload" ? fieldMaxFileSizeMb : undefined,
      maxFileCount: fieldType === "file_upload" ? fieldMaxFileCount : undefined,
      allowOfflineVerification: fieldType === "file_upload" ? fieldAllowOfflineVerif : undefined,
      offlineVerificationLabelMl:
        fieldType === "file_upload" ? fieldOfflineVerificationLabelMl.trim() : undefined,

      questionTextEn: fieldType === "yes_no" ? fieldLabelEn.trim() : undefined,
      questionTextMl:
        fieldType === "yes_no" ? fieldLabelMl.trim() || fieldLabelEn.trim() : undefined,
      yesFollowUpText:
        fieldType === "yes_no" && fieldFollowUpEnabled && fieldFollowUpTrigger === "Yes"
          ? fieldYesFollowUp.trim()
          : undefined,
      noFollowUpText:
        fieldType === "yes_no" && fieldFollowUpEnabled && fieldFollowUpTrigger === "No"
          ? fieldNoFollowUp.trim()
          : undefined,
      followUpTrigger:
        fieldType === "yes_no" && fieldFollowUpEnabled ? fieldFollowUpTrigger : undefined,

      placeholderEn: fieldType === "descriptive_text" || fieldType === "single_text" ? fieldPlaceholderEn : undefined,
      placeholderMl: fieldType === "descriptive_text" || fieldType === "single_text" ? fieldPlaceholderMl : undefined,
      helpTextEn:
        fieldType === "yes_no" || fieldType === "descriptive_text" || fieldType === "single_text"
          ? fieldHelpTextEn
          : undefined,
      helpTextMl:
        fieldType === "yes_no" || fieldType === "descriptive_text" || fieldType === "single_text"
          ? fieldHelpTextMl
          : undefined,
      charLimit: fieldType === "descriptive_text" || fieldType === "single_text" ? fieldCharLimit : undefined,

      options: fieldType === "dropdown" ? cleanedOptions : undefined,
      isMultiSelect: fieldType === "dropdown" ? fieldIsMultiSelect : undefined,
    };

    if (editingFieldId) {
      setCustomFields((prev) => prev.map((f) => (f.id === editingFieldId ? newField : f)));
    } else {
      setCustomFields((prev) => [...prev, newField]);
    }

    setShowFieldModal(false);
    setFieldErrors({});
  };

  const handleDeleteField = (id: string) => {
    setCustomFields((prev) =>
      prev
        .filter((f) => f.id !== id)
        .map((f) =>
          f.showOnlyWhenFieldId === id
            ? { ...f, showOnlyWhenFieldId: undefined, showOnlyWhenValue: undefined }
            : f
        )
    );
    setFieldMenuId(null);
  };

  const handleDuplicateField = (field: CustomField) => {
    const dup: CustomField = {
      ...field,
      id: `field-${Date.now()}`,
      labelEn: `${field.labelEn} (Copy)`,
      labelMl: `${field.labelMl} (പകർപ്പ്)`,
    };
    setCustomFields((prev) => {
      const sourceIndex = prev.findIndex((item) => item.id === field.id);
      const next = [...prev];
      next.splice(sourceIndex + 1, 0, dup);
      return next;
    });
    setFieldMenuId(null);
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= customFields.length) return;
    const updated = [...customFields];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setCustomFields(updated);
    setFieldMenuId(null);
  };

  const handleCloseFieldEditor = () => {
    setShowFieldModal(false);
    setFieldErrors({});
  };

  const keepFieldInputVisible = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = event.currentTarget;
    window.setTimeout(() => {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 150);
  };

  const handlePrefillDemo = () => {
    // Step 1: Basic Information (Central Government Scheme - PM-KISAN)
    setSchemeNameEn("Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)");
    setSchemeNameMl("പ്രധാനമന്ത്രി കിസാൻ സമ്മാൻ നിധി (PM-KISAN)");
    setLogoUrl("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=150&auto=format&fit=crop&q=80");
    setCategory("Agriculture & Farmers Welfare");
    setDepartment("Ministry of Agriculture & Farmers Welfare (Central Government)");
    setAboutScheme("A Central Sector Scheme of the Government of India providing income support of ₹6,000 per year to all landholding farmer families across the country in three equal installments of ₹2,000 every four months directly into their bank accounts.");
    setShortCardDescription("Central financial benefit of ₹6,000/year directly to small and marginal farmer bank accounts.");

    // Step 2: Benefits & Eligibility
    setBenefitTypes(["Financial Assistance", "Subsidy"]);
    setBenefitSummary("Direct Benefit Transfer (DBT) of ₹6,000 annually credited directly into verified Aadhaar-seeded bank accounts.");
    setAmountType("Fixed Amount");
    setFixedAmount("6000");
    setPaymentFrequency("Quarterly");
    setBenefitDuration("Ongoing Central Scheme");
    setCoverageLimit("₹6,000 per year (3 installments of ₹2,000)");
    setBeneficiaryContribType("Amount");
    setBeneficiaryContribValue("0");

    setEligibilitySummary("All landholding farmer families with cultivable landholding in their names across all States and UTs.");
    setExclusions("Institutional landholders, serving or retired officers/employees of State/Central Government, income tax payees, and doctors/engineers/CA professionals.");
    setApplicableLocationsType("All Kerala");
    setManualReviewConditions("Land records pending revenue mutation or land details needing physical verification by Village Extension Officers (VEO).");
    setEligibilityRules([
      {
        id: "rule-demo-1",
        attribute: "Landholding Status",
        condition: "Equals",
        value: "Cultivable Land Owner",
        logicGroup: "ALL",
        missingBehavior: "Manual Review",
        reasonShown: "Applicant family must hold valid cultivable land records in Revenue database.",
      },
      {
        id: "rule-demo-2",
        attribute: "Income Tax Payee Status",
        condition: "Equals",
        value: "No",
        logicGroup: "ALL",
        missingBehavior: "Request Answer",
        reasonShown: "Members paying Income Tax in previous assessment year are ineligible.",
      },
      {
        id: "rule-demo-3",
        attribute: "Aadhaar e-KYC Verification",
        condition: "Equals",
        value: "Completed",
        logicGroup: "ALL",
        missingBehavior: "Request Answer",
        reasonShown: "Aadhaar e-KYC mandatory for DBT transfer under Central Government rules.",
      },
    ]);

    // Step 3: Details & Documents
    setCustomFields([
      {
        id: "field-demo-1",
        type: "file_upload",
        labelEn: "Land Ownership Record (Pokkuvaravu / Tandaper Certificate)",
        labelMl: "ഭൂമി ഉടമസ്ഥാവകാശ രേഖ / തണ്ടപ്പേര് സർട്ടിഫിക്കറ്റ്",
        required: true,
        docNameEn: "Land Record Document",
        docInstructionsEn: "Upload latest Revenue Land Possession or Tandaper document.",
        allowedFormats: [".pdf", ".jpg", ".png"],
        maxFileSizeMb: 3,
        maxFileCount: 1,
        allowOfflineVerification: true,
      },
      {
        id: "field-demo-2",
        type: "file_upload",
        labelEn: "Aadhaar Card Copy (e-KYC Verified)",
        labelMl: "ആധാർ കാർഡ് കോപ്പി (e-KYC സ്ഥരീകരിച്ചത്)",
        required: true,
        docNameEn: "Aadhaar Card",
        docInstructionsEn: "Upload copy of Aadhaar linked with mobile number for OTP e-KYC.",
        allowedFormats: [".pdf", ".jpg"],
        maxFileSizeMb: 2,
        maxFileCount: 1,
        allowOfflineVerification: true,
      },
      {
        id: "field-demo-3",
        type: "single_text",
        labelEn: "Bank Account Passbook (Aadhaar Seeded NPCI)",
        labelMl: "ബാങ്ക് അക്കൗണ്ട് പാസ്സ്ബുക്ക് (Aadhaar Seeded)",
        required: true,
        placeholderEn: "Enter Bank Account & IFSC Code",
        charLimit: 30,
      },
      {
        id: "field-demo-4",
        type: "yes_no",
        labelEn: "Are any family members institutional landholders or tax payees?",
        labelMl: "കുടുംബാംഗങ്ങളിൽ ആരെങ്കിലും ആദായനികുതി അടയ്ക്കുന്നവരോ സ്ഥാപന ഉടമകളോ ആണോ?",
        required: true,
      },
    ]);

    setErrors({});
  };

  // ---------------------------------------------------------------------------
  // RENDER MODAL VIEW
  // ---------------------------------------------------------------------------
  const configuredConditionCount = APPLICANT_ATTRIBUTES.filter(
    (attribute) => !getEligibilityConditionError(attribute, eligibilityConditions[attribute])
  ).length;

  const isCustomFieldVisible = (field: CustomField) => {
    if (!field.showOnlyWhenFieldId) return true;
    const dependency = customFields.find((item) => item.id === field.showOnlyWhenFieldId);
    if (!dependency) return false;
    const answer =
      dependency.type === "yes_no"
        ? simulatedYesNoAnswers[dependency.id]
        : dependency.type === "dropdown"
        ? simulatedDropdownAnswers[dependency.id]
        : "";
    return answer === field.showOnlyWhenValue;
  };

  return (
    <div className="absolute inset-0 flex flex-col h-full bg-[#FFFDF9] dark:bg-slate-900 text-foreground font-sans overflow-hidden z-10">
      {/* --------------------------------------------------------------------- */}
      {/* FIXED HEADER */}
      {/* --------------------------------------------------------------------- */}
      <div className="shrink-0 z-20 bg-[#FFFDF9] dark:bg-slate-900 border-b border-orange-100 dark:border-slate-800 px-3.5 pt-3 pb-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (isPreviewMode) {
                setIsPreviewMode(false);
              } else if (currentStep > 1) {
                setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
              } else {
                onClose();
              }
            }}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-[#FFF7EC] text-[#1B255A] hover:bg-orange-100 dark:bg-slate-800 dark:text-white transition-colors cursor-pointer shadow-2xs"
            title={lang === "ml" ? "തിരികെ പോവുക" : "Go Back"}
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-[13.5px] font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              {isPreviewMode
                ? lang === "ml"
                  ? "പദ്ധതി പ്രിവ്യൂ"
                  : "Preview Scheme"
                : lang === "ml"
                ? "പുതിയ പദ്ധതി ചേർക്കുക"
                : "Create New Scheme"}
            </h1>
          </div>

          {!isPreviewMode ? (
            <span className="shrink-0 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FFF2E6] dark:bg-orange-950/80 text-[#C2410C] dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80 shadow-2xs">
              {lang === "ml" ? `ഘട്ടം ${currentStep} / 3` : `Step ${currentStep} of 3`}
            </span>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SCROLLABLE FORM BODY */}
      {/* --------------------------------------------------------------------- */}
      <div ref={formBodyRef} className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-4 py-3.5 space-y-4 pb-24">
        {/* PREVIEW MODE VIEW */}
        {isPreviewMode ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Toggle Preview View: Public Info vs Worker Form */}
            <div className="flex rounded-xl bg-muted p-1 gap-1">
              <button
                type="button"
                onClick={() => setActivePreviewTab("public")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activePreviewTab === "public"
                    ? "bg-background text-[#ff5500] shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "ml" ? "പബ്ലിക് ഇൻഫോ പ്രിവ്യൂ" : "Public Scheme Info"}
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab("worker")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activePreviewTab === "worker"
                    ? "bg-background text-[#ff5500] shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "ml" ? "വർക്കർ ഫോം പ്രിവ്യൂ" : "Worker Form Preview"}
              </button>
            </div>

            {/* TAB 1: Public Card View */}
            {activePreviewTab === "public" && (
              <div className="space-y-3.5">
                {/* Scheme Header Card */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-3">
                  <div className="flex items-start gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded-xl object-contain border border-border p-1" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 flex items-center justify-center text-[#ff5500] font-black text-sm">
                        {shortName || "GOV"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-[#ff5500] text-[9.5px] font-black uppercase tracking-wider mb-1">
                        {category}
                      </span>
                      <h2 className="text-sm font-extrabold text-foreground leading-snug">
                        {schemeNameEn || "Untitled Scheme"}
                      </h2>
                      {schemeNameMl && (
                        <p className="text-xs font-bold text-muted-foreground mt-0.5">{schemeNameMl}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-2.5">
                    {aboutScheme || "No detailed description provided."}
                  </p>
                </div>

                {/* Benefits Section */}
                <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs space-y-2">
                  <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-[#ff5500]" />
                    {lang === "ml" ? "ആനുകൂല്യങ്ങൾ" : "Benefits Provided"}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBenefitTypes.map((type) => (
                      <span key={type} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-bold">
                        {type === "Other" ? customBenefitType || "Other" : type}
                      </span>
                    ))}
                  </div>
                  {benefitSummary && <p className="text-xs text-foreground font-medium pt-1">{benefitSummary}</p>}
                  {benefitDuration && (
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      Duration: <span className="text-foreground">{benefitDuration}</span>
                    </p>
                  )}
                </div>

                {/* Eligibility Rules Section */}
                <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs space-y-2">
                  <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-[#ff5500]" />
                    {lang === "ml" ? "യോഗ്യതാ നിബന്ധനകൾ" : "Eligibility Criteria"}
                  </h3>
                  {eligibilitySummary && <p className="text-xs text-foreground font-medium">{eligibilitySummary}</p>}
                  <div className="space-y-1.5 pt-1">
                    {eligibilityRules.map((rule, idx) => (
                      <div key={rule.id} className="p-2 rounded-xl bg-muted/60 text-xs font-medium flex items-center justify-between gap-2">
                        <span>
                          <strong className="text-foreground">{rule.attribute}</strong> {rule.condition} <strong className="text-[#ff5500]">{rule.value} {rule.unit}</strong>
                        </span>
                        <span className="text-[9.5px] font-black px-1.5 py-0.5 bg-background border border-border rounded-md shrink-0">
                          {rule.grouping}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Generated Worker Application Form Preview */}
            {activePreviewTab === "worker" && (
              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    {lang === "ml"
                      ? "ഇത് ഫീൽഡ് ലവൽ അക്ഷയ/വോളന്റിയർമാർക്കായി ജനറേറ്റ് ചെയ്യുന്ന കളക്ഷൻ ഫോമിന്റെ സാമ്പിളാണ്."
                      : "This is the generated field worker form with verification controls for document upload."}
                  </span>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-3.5">
                  <h3 className="text-xs font-black text-foreground border-b border-border/80 pb-2">
                    {lang === "ml" ? "ആവശ്യമായ വിവരങ്ങളും രേഖകളും" : "Required Details & Verification"}
                  </h3>

                  {customFields.filter(isCustomFieldVisible).map((field) => (
                    <div key={field.id} className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/80">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-foreground">
                          {field.labelEn} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-muted-foreground bg-background border border-border px-1.5 py-0.5 rounded">
                          {field.type.replace("_", " ")}
                        </span>
                      </div>

                      {/* File Upload Field Render */}
                      {field.type === "file_upload" && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[11px] text-muted-foreground">{field.uploadInstructions}</p>
                          <p className="text-[9.5px] font-semibold text-muted-foreground">
                            {(field.acceptedFormats ?? []).join(", ").toUpperCase()}
                            {field.maxFileSizeMb ? ` · Max ${field.maxFileSizeMb} MB` : ""}
                            {field.maxFileCount
                              ? ` · Up to ${field.maxFileCount} file${field.maxFileCount > 1 ? "s" : ""}`
                              : ""}
                          </p>
                          {field.allowOfflineVerification && field.offlineVerificationLabelMl && (
                            <p className="text-[10px] font-medium text-muted-foreground">
                              {field.offlineVerificationLabelMl}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/50 dark:bg-orange-950/20 text-[#ff5500] text-xs font-bold hover:bg-orange-100 transition-colors">
                              <Upload className="h-3.5 w-3.5" />
                              <span>{simulatedUploadedFiles[field.id] ? "Change File" : "Choose File"}</span>
                              <input
                                type="file"
                                className="hidden"
                                accept={(field.acceptedFormats ?? [])
                                  .map((format) => `.${format}`)
                                  .join(",")}
                                multiple={(field.maxFileCount ?? 1) > 1}
                                onChange={(e) => {
                                  const files = Array.from(e.target.files ?? []).slice(
                                    0,
                                    field.maxFileCount ?? 1
                                  );
                                  if (files.length > 0) {
                                    setSimulatedUploadedFiles((prev) => ({
                                      ...prev,
                                      [field.id]: files.map((file) => file.name).join(", "),
                                    }));
                                  }
                                }}
                              />
                            </label>

                            {/* Offline Verification Button */}
                            {field.allowOfflineVerification && (
                              <button
                                type="button"
                                title={field.offlineVerificationLabelMl || "Allow verification without upload"}
                                onClick={() => {
                                  setSimulatedVerifiedDocs((prev) => ({
                                    ...prev,
                                    [field.id]: !prev[field.id],
                                  }));
                                }}
                                className={`px-2.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1 ${
                                  simulatedVerifiedDocs[field.id]
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "bg-background border-border text-foreground hover:border-emerald-500"
                                }`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{simulatedVerifiedDocs[field.id] ? "Verified" : "Mark as Verified"}</span>
                              </button>
                            )}
                          </div>

                          {/* Show File Name */}
                          {simulatedUploadedFiles[field.id] && (
                            <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>File Uploaded: {simulatedUploadedFiles[field.id]}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Yes/No Field Render */}
                      {field.type === "yes_no" && (
                        <div className="space-y-2 pt-1">
                          {field.helpTextEn && (
                            <p className="text-[10.5px] font-medium text-muted-foreground">{field.helpTextEn}</p>
                          )}
                          <div className="flex items-center gap-3">
                            {(["Yes", "No"] as const).map((answer) => (
                              <label
                                key={answer}
                                className="flex items-center gap-1.5 text-xs font-bold text-foreground cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={`yn-${field.id}`}
                                  checked={simulatedYesNoAnswers[field.id] === answer}
                                  onChange={() =>
                                    setSimulatedYesNoAnswers((prev) => ({
                                      ...prev,
                                      [field.id]: answer,
                                    }))
                                  }
                                  className="accent-[#ff5500]"
                                />{" "}
                                {answer}
                              </label>
                            ))}
                          </div>
                          {(() => {
                            const followUp =
                              field.followUpTrigger === "Yes"
                                ? field.yesFollowUpText
                                : field.followUpTrigger === "No"
                                ? field.noFollowUpText
                                : "";
                            if (
                              !followUp ||
                              simulatedYesNoAnswers[field.id] !== field.followUpTrigger
                            ) {
                              return null;
                            }
                            return (
                              <div className="ml-1 space-y-1 rounded-lg border border-orange-100 bg-orange-50/40 p-2 dark:border-slate-700 dark:bg-slate-800/60">
                                <label className="text-[10px] font-extrabold text-foreground">{followUp}</label>
                                <input
                                  type="text"
                                  className="h-8 w-full rounded-lg border border-orange-200/80 bg-white px-2.5 text-[10.5px] outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                                  placeholder="Enter details"
                                />
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Dropdown Field Render */}
                      {field.type === "dropdown" && (
                        field.isMultiSelect ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(field.options ?? []).map((opt) => {
                              const selectedValues = (simulatedDropdownAnswers[field.id] || "").split("|");
                              const selected = selectedValues.includes(opt.labelEn);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() =>
                                    setSimulatedDropdownAnswers((prev) => {
                                      const current = (prev[field.id] || "").split("|").filter(Boolean);
                                      const next = current.includes(opt.labelEn)
                                        ? current.filter((value) => value !== opt.labelEn)
                                        : [...current, opt.labelEn];
                                      return { ...prev, [field.id]: next.join("|") };
                                    })
                                  }
                                  className={`rounded-lg border px-2 py-1 text-[10.5px] font-bold ${
                                    selected
                                      ? "border-[#FF5500] bg-orange-50 text-[#FF5500] dark:bg-orange-950/40"
                                      : "border-border bg-background text-foreground"
                                  }`}
                                >
                                  {opt.labelEn}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <select
                            value={simulatedDropdownAnswers[field.id] || ""}
                            onChange={(event) =>
                              setSimulatedDropdownAnswers((prev) => ({
                                ...prev,
                                [field.id]: event.target.value,
                              }))
                            }
                            className="w-full text-xs h-9 px-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none"
                          >
                            <option value="">{field.placeholderEn || "-- Select --"}</option>
                            {field.options?.map((opt) => (
                              <option key={opt.id} value={opt.labelEn}>{opt.labelEn}</option>
                            ))}
                          </select>
                        )
                      )}

                      {/* Text Field Render */}
                      {field.type === "descriptive_text" && (
                        <div className="space-y-1 pt-1">
                          <textarea
                            rows={3}
                            maxLength={field.charLimit}
                            placeholder={field.placeholderEn || "Enter details..."}
                            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                          {field.helpTextEn && (
                            <p className="text-[10px] font-medium text-muted-foreground">{field.helpTextEn}</p>
                          )}
                        </div>
                      )}
                      {field.type === "single_text" && (
                        <div className="space-y-1 pt-1">
                          <input
                            type="text"
                            maxLength={field.charLimit}
                            placeholder={field.placeholderEn || "Enter details..."}
                            className="w-full text-xs h-9 px-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                          {field.helpTextEn && (
                            <p className="text-[10px] font-medium text-muted-foreground">{field.helpTextEn}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STEP 1, 2, 3 EDITING FLOW */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* =================================------------------------------ */}
            {/* STEP 1 OF 3 — BASIC INFORMATION */}
            {/* =================================------------------------------ */}
            {currentStep === 1 && (
              <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-white font-black text-[10px] shrink-0">
                      1
                    </span>
                    <h2 className="text-[12px] font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
                      {lang === "ml" ? "അടിസ്ഥാന വിവരങ്ങൾ" : "Basic Information"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrefillDemo}
                    className="px-2.5 py-0.5 rounded-lg bg-orange-100 text-[#FF5500] hover:bg-orange-200 text-[10px] font-black transition-colors cursor-pointer border border-orange-200 flex items-center gap-1 shadow-2xs"
                    title="Fill all form fields with sample demo data"
                  >
                    ⚡ Prefill
                  </button>
                </div>

                {/* Scheme Name English */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "പദ്ധതിയുടെ പേര് *" : "Scheme Name *"}
                  </label>
                  <input
                    type="text"
                    value={schemeNameEn}
                    onChange={(e) => setSchemeNameEn(e.target.value)}
                    placeholder="e.g. Karunya Health Scheme"
                    className={`w-full rounded-lg border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors ${
                      errors.schemeNameEn
                        ? "border-red-500 bg-red-50/50 ring-1 ring-red-500"
                        : "border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80"
                    }`}
                  />
                  {errors.schemeNameEn && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.schemeNameEn}
                    </p>
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "വിഭാഗം *" : "Category *"}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat.en} value={cat.en}>
                        {lang === "ml" ? cat.ml : cat.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Dropdown */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "മന്ത്രാലയം / വകുപ്പ് *" : "Ministry / Department *"}
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-lg border border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {department === "Custom / Other" && (
                    <input
                      type="text"
                      value={customDepartment}
                      onChange={(e) => setDepartmentCustom(e.target.value)}
                      placeholder="Enter custom department name..."
                      className="w-full mt-1.5 rounded-lg border border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  )}
                </div>

                {/* Scheme Card Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground block">
                    {lang === "ml" ? "കാർഡിലെ ലഘു വിവരണം" : "Scheme Card Description"}
                  </label>
                  <input
                    type="text"
                    value={shortCardDescription}
                    onChange={(e) => setShortCardDescription(e.target.value)}
                    placeholder="1-line quick summary shown on mobile cards..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-3">
                  {/* Benefit Type Multi-Select */}
                  <div className="space-y-1.5 relative">
                    <label className="text-[11px] font-extrabold text-foreground block">
                      {lang === "ml" ? "ആനുകൂല്യ തരം *" : "Benefit Type *"}
                    </label>
                    <div
                      onClick={() => setIsBenefitDropdownOpen((prev) => !prev)}
                      className={`w-full min-h-[38px] px-2.5 py-1.5 rounded-lg border bg-[#FFFDF7] dark:bg-slate-800/80 text-xs text-foreground cursor-pointer flex items-center justify-between gap-2 shadow-2xs transition-colors ${
                        errors.benefitTypes
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-orange-200/80 dark:border-slate-700 hover:border-orange-400"
                      }`}
                    >
                      <div className="flex flex-wrap gap-1 items-center flex-1 min-w-0">
                        {selectedBenefitTypes.length > 0 ? (
                          selectedBenefitTypes.map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FF5500] text-white text-[11px] font-bold shadow-2xs"
                            >
                              <span>{type}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBenefitTypes((prev) => prev.filter((t) => t !== type));
                                }}
                                className="hover:bg-orange-600 rounded p-0.5 transition-colors cursor-pointer"
                              >
                                <X className="h-3 w-3 stroke-[3]" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">Select benefit types...</span>
                        )}
                      </div>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${isBenefitDropdownOpen ? "rotate-180" : ""}`} />
                    </div>

                    {isBenefitDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white dark:bg-slate-800 border border-orange-200/80 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in duration-150">
                        {["Financial Assistance", "Insurance", "Loan", "Subsidy", "Pension", "Service", "Other"].map((type) => {
                          const isSelected = selectedBenefitTypes.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedBenefitTypes((prev) => prev.filter((t) => t !== type));
                                } else {
                                  setSelectedBenefitTypes((prev) => [...prev, type]);
                                }
                              }}
                              className={`w-full px-3 py-2 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors text-left ${
                                isSelected
                                  ? "bg-orange-50 dark:bg-slate-700/80 text-[#FF5500]"
                                  : "text-foreground hover:bg-slate-50 dark:hover:bg-slate-700/50"
                              }`}
                            >
                              <span>{type}</span>
                              <div className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                                isSelected ? "bg-[#FF5500] border-[#FF5500] text-white" : "border-slate-300 dark:border-slate-600"
                              }`}>
                                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {selectedBenefitTypes.includes("Other") && (
                      <input
                        type="text"
                        value={customBenefitType}
                        onChange={(e) => setCustomBenefitType(e.target.value)}
                        placeholder="Specify other benefit type..."
                        className={`w-full mt-1.5 rounded-lg border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                          errors.customBenefitType ? "border-red-500 ring-1 ring-red-500" : "border-border bg-background"
                        }`}
                      />
                    )}
                    {errors.benefitTypes && (
                      <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.benefitTypes}
                      </p>
                    )}
                    {errors.customBenefitType && (
                      <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.customBenefitType}
                      </p>
                    )}
                  </div>

                  {/* Benefit Duration */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-foreground block">
                      {lang === "ml" ? "ആനുകൂല്യ കാലയളവ്" : "Benefit Duration"}
                    </label>
                    <input
                      type="text"
                      value={benefitDuration}
                      onChange={(e) => setBenefitDuration(e.target.value)}
                      placeholder="e.g. 3 Years / Ongoing"
                      className="w-full rounded-lg border border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* About Us */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "ഞങ്ങളെക്കുറിച്ച് *" : "About Us *"}
                  </label>
                  <textarea
                    rows={3}
                    value={aboutScheme}
                    onChange={(e) => setAboutScheme(e.target.value)}
                    placeholder="Enter detailed objective and background of the scheme..."
                    className={`w-full rounded-lg border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none transition-colors ${
                      errors.aboutScheme
                        ? "border-red-500 bg-red-50/50 ring-1 ring-red-500"
                        : "border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80"
                    }`}
                  />
                  {errors.aboutScheme && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.aboutScheme}
                    </p>
                  )}
                </div>

                {/* Official Scheme Website */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "ഔദ്യോഗിക സ്കീം വെബ്സൈറ്റ്" : "Official Scheme Website"}
                  </label>
                  <input
                    type="url"
                    value={officialWebsite}
                    onChange={(e) => setOfficialWebsite(e.target.value)}
                    placeholder="https://kerala.gov.in/schemes"
                    className="w-full rounded-lg border border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Official Scheme Logo Upload */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "ഔദ്യോഗിക സ്കീം ലോഗോ" : "Official Scheme Logo"}
                  </label>
                  {logoUrl ? (
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-orange-100 dark:border-slate-800 bg-[#FFFDF9] dark:bg-slate-800/80 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-slate-700 border border-orange-100 dark:border-slate-600">
                          {logoUrl.startsWith("http") || logoUrl.startsWith("data:") ? (
                            <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded-lg" />
                          ) : (
                            <FileText className="h-5 w-5 text-orange-500" />
                          )}
                          <span className="absolute -bottom-1 -left-1 px-1 py-0.2 rounded-xs bg-emerald-600 text-white text-[8px] font-black uppercase tracking-tighter">
                            PNG
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#0F172A] dark:text-white truncate max-w-[180px]">
                            {logoUrl.split('/').pop() || "scheme-logo.png"}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400">
                            PNG · Uploaded
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setLogoUrl(null)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-700 text-rose-500 hover:text-rose-700 hover:bg-rose-50 shadow-2xs border border-slate-100 dark:border-slate-600 transition-colors cursor-pointer"
                        title="Remove Logo"
                      >
                        <X className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border border-dashed border-orange-300 dark:border-orange-800 bg-[#FFFDF9] dark:bg-orange-950/10 hover:bg-orange-50/50 transition-colors cursor-pointer text-center space-y-1">
                      <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 shadow-2xs">
                        <UploadCloud className="h-4 w-4 text-[#FF5500]" />
                      </div>
                      <div className="space-y-0.2">
                        <p className="text-[11.5px] font-black text-[#0F172A] dark:text-white leading-tight">
                          {lang === "ml" ? "ഫയൽ തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ ഇവിടെ ഡ്രാഗ് ചെയ്യുക" : "Choose a file or drag & drop it here"}
                        </p>
                        <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-400 leading-tight">
                          PDF, JPG or PNG · Max 5MB
                        </p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* =================================------------------------------ */}
            {/* STEP 3 OF 3 — DETAILS & DOCUMENTS (CUSTOM FIELDS) */}
            {/* =================================------------------------------ */}
            {currentStep === 3 && (
              <div className="rounded-xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-white font-black text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-[12px] font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
                        {lang === "ml" ? "വിവരങ്ങളും രേഖകളും" : "Details & Documents"}
                      </h2>
                      <p className="mt-0.5 text-[10px] font-medium leading-snug text-muted-foreground">
                        {lang === "ml"
                          ? "ജീവനക്കാർ പൂരിപ്പിക്കേണ്ട ഫീൽഡുകൾ സൃഷ്ടിക്കുക."
                          : "Create the fields workers need to complete."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenFieldTypePicker}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#FF5500] px-2.5 py-1.5 text-[10.5px] font-extrabold text-white shadow-2xs transition-colors hover:bg-[#E64D00] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>{lang === "ml" ? "ഫീൽഡ് ചേർക്കുക" : "Add Field"}</span>
                  </button>
                </div>

                {step4DraftNotice && (
                  <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[10.5px] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="font-semibold">
                      {lang === "ml"
                        ? "ഡ്രാഫ്റ്റ് സേവ് ചെയ്തു. നിലവിലെ പദ്ധതി വിവരങ്ങൾ സൂക്ഷിച്ചിരിക്കുന്നു."
                        : "Draft saved with the current scheme details."}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  {customFields.map((field, idx) => {
                    const menuOpen = fieldMenuId === field.id;
                    return (
                      <div key={field.id} className="relative">
                        <button
                          type="button"
                          onClick={() => handleOpenEditField(field)}
                          className="flex w-full items-start gap-2 rounded-xl border border-orange-100/90 bg-[#FFFDF7] px-2.5 py-2.5 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                          <div className="min-w-0 flex-1 pr-7">
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                              <span className="text-[9px] font-black uppercase tracking-[0.08em] text-[#FF5500]">
                                {FIELD_TYPE_META[field.type].label}
                              </span>
                              <span className="text-[9px] font-bold text-slate-300">·</span>
                              <span
                                className={`text-[9.5px] font-extrabold ${
                                  field.required ? "text-red-500" : "text-slate-400"
                                }`}
                              >
                                {field.required ? "Required" : "Optional"}
                              </span>
                            </div>
                            <h4 className="mt-0.5 line-clamp-2 break-words text-[11.5px] font-extrabold leading-snug text-[#1E293B] dark:text-slate-100">
                              {field.labelEn}
                            </h4>
                            {field.labelMl && field.labelMl !== field.labelEn && (
                              <p className="mt-0.5 line-clamp-2 break-words text-[10px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                                {field.labelMl}
                              </p>
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setFieldMenuId(menuOpen ? null : field.id);
                          }}
                          className="absolute right-1.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-orange-100 hover:text-[#FF5500] dark:hover:bg-slate-700 cursor-pointer"
                          aria-label={`Field actions for ${field.labelEn}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {menuOpen && (
                          <div className="absolute right-1 top-10 z-40 w-40 overflow-hidden rounded-xl border border-orange-100 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                            <button
                              type="button"
                              onClick={() => {
                                setFieldMenuId(null);
                                handleOpenEditField(field);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateField(field)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" /> Duplicate
                            </button>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveField(idx, "up")}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <ArrowUp className="h-3.5 w-3.5" /> Move Up
                            </button>
                            <button
                              type="button"
                              disabled={idx === customFields.length - 1}
                              onClick={() => handleMoveField(idx, "down")}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <ArrowDown className="h-3.5 w-3.5" /> Move Down
                            </button>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                            <button
                              type="button"
                              onClick={() => handleDeleteField(field.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {customFields.length === 0 && (
                    <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/30 px-5 py-7 text-center dark:border-slate-700 dark:bg-slate-800/40">
                      <FileText className="mx-auto h-6 w-6 text-orange-300" />
                      <p className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {lang === "ml" ? "ഇതുവരെ ഫീൽഡുകളില്ല." : "No fields added yet."}
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                        {lang === "ml"
                          ? "ജീവനക്കാർക്ക് ആവശ്യമായ ഫീൽഡ് ചേർക്കുക."
                          : "Add a field workers need to complete."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =================================------------------------------ */}
            {/* STEP 2 OF 3 — ELIGIBILITY CONDITIONS */}
            {/* =================================------------------------------ */}
            {currentStep === 2 && (
              <div className="rounded-xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-white font-black text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-[12px] font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
                        {lang === "ml" ? "യോഗ്യതാ നിബന്ധനകൾ" : "Eligibility Conditions"}
                      </h2>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-orange-200/80 bg-[#FFF2E6] px-2 py-0.5 text-[10px] font-extrabold text-[#C2410C]">
                    {configuredConditionCount} / {APPLICANT_ATTRIBUTES.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {APPLICANT_ATTRIBUTES.map((attribute, index) => {
                    const condition = eligibilityConditions[attribute];
                    const isYesNo = YES_NO_ELIGIBILITY_ATTRIBUTES.includes(attribute);
                    const isNumeric = NUMERIC_ELIGIBILITY_ATTRIBUTES.includes(attribute);
                    const isSearchable = SEARCHABLE_ELIGIBILITY_ATTRIBUTES.includes(attribute);
                    const valueOptions = ELIGIBILITY_VALUE_OPTIONS[attribute] ?? [];
                    const searchTerm = (conditionSearch[attribute] ?? "").trim().toLowerCase();
                    const visibleValueOptions = isSearchable
                      ? valueOptions.filter((value) => value.toLowerCase().includes(searchTerm))
                      : valueOptions;
                    const error = errors[`elig_${attribute}`];
                    const isRestricted = Boolean(condition.mode) && condition.mode !== "No Restriction";
                    const isDisabilityPercentageLocked =
                      attribute === "Disability Percentage" &&
                      eligibilityConditions["Disability Status"]?.mode === "Must be No";

                    return (
                      <div
                        key={attribute}
                        className={`rounded-lg border p-2.5 space-y-1.5 ${
                          error
                            ? "border-red-300 bg-red-50/40 dark:border-red-900/70 dark:bg-red-950/20"
                            : "border-border bg-background"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex min-w-0 items-center gap-1.5 text-[11px] font-extrabold text-foreground">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[8.5px] font-black text-[#ff5500]">
                              {index + 1}
                            </span>
                            <span className="truncate">{attribute}</span>
                          </label>
                          {isRestricted ? (
                            <span className="shrink-0 rounded-full bg-orange-100 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wide text-[#C2410C]">
                              Restricted
                            </span>
                          ) : condition.mode === "No Restriction" ? (
                            <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wide text-slate-500">
                              Open
                            </span>
                          ) : null}
                        </div>

                        <select
                          value={condition.mode}
                          disabled={isDisabilityPercentageLocked}
                          onChange={(e) =>
                            handleConditionModeChange(
                              attribute,
                              e.target.value as EligibilityConditionMode
                            )
                          }
                          className={`h-8 w-full rounded-lg border bg-[#FFFDF7] px-2.5 text-[11px] font-semibold text-foreground outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 ${
                            error ? "border-red-400" : "border-orange-200/80 dark:border-slate-700"
                          }`}
                        >
                          <option value="">Select condition</option>
                          <option value="No Restriction">No Restriction</option>
                          {isYesNo && (
                            <>
                              <option value="Must be Yes">Must be Yes</option>
                              <option value="Must be No">Must be No</option>
                            </>
                          )}
                          {isNumeric && (
                            <>
                              <option value="Minimum">Minimum</option>
                              <option value="Maximum">Maximum</option>
                              <option value="Between">Between</option>
                            </>
                          )}
                          {!isYesNo && !isNumeric && (
                            <option value="Select values">{ELIGIBILITY_VALUE_LABELS[attribute]}</option>
                          )}
                        </select>

                        {isDisabilityPercentageLocked && (
                          <p className="text-[9.5px] font-medium leading-tight text-muted-foreground">
                            Disability percentage is not applicable when Disability Status is Must be No.
                          </p>
                        )}

                        {attribute === "Religion" && isRestricted && (
                          <p className="text-[9.5px] font-medium leading-tight text-muted-foreground">
                            Restrict only if required by official scheme rules.
                          </p>
                        )}

                        {!isYesNo && !isNumeric && condition.mode === "Select values" && (
                          <div className="space-y-1.5 pt-0.5">
                            {isSearchable && (
                              <input
                                type="search"
                                value={conditionSearch[attribute] ?? ""}
                                onChange={(e) =>
                                  setConditionSearch((prev) => ({
                                    ...prev,
                                    [attribute]: e.target.value,
                                  }))
                                }
                                placeholder={
                                  attribute === "Occupation"
                                    ? "Search occupations..."
                                    : "Search castes / communities..."
                                }
                                className="h-7 w-full rounded-lg border border-border bg-background px-2.5 text-[10.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500"
                              />
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {visibleValueOptions.map((value) => {
                                const selected = condition.values.includes(value);
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => toggleConditionValue(attribute, value)}
                                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold transition-colors ${
                                      selected
                                        ? "border-[#ff5500] bg-[#ff5500] text-white"
                                        : "border-border bg-background text-muted-foreground hover:border-orange-300 hover:text-[#ff5500]"
                                    }`}
                                  >
                                    {selected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                    {value}
                                  </button>
                                );
                              })}
                              {visibleValueOptions.length === 0 && (
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  No matching options.
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {isNumeric && condition.mode && condition.mode !== "No Restriction" && (
                          <div className="space-y-1.5 pt-0.5">
                            {attribute === "Age, calculated from date of birth" && (
                              <div className="space-y-0.5">
                                <span className="block text-[9.5px] font-bold text-muted-foreground">
                                  Age calculated as on
                                </span>
                                <input
                                  type="date"
                                  value={condition.referenceDate}
                                  onChange={(e) =>
                                    updateEligibilityCondition(attribute, {
                                      referenceDate: e.target.value,
                                    })
                                  }
                                  className="h-7 w-full rounded-lg border border-border bg-background px-2 text-[10.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-1.5">
                              {(condition.mode === "Minimum" || condition.mode === "Between") && (
                                <div className="space-y-0.5">
                                  <span className="block text-[9.5px] font-bold text-muted-foreground">
                                    Minimum
                                    {attribute === "Annual Family Income"
                                      ? " (₹ / year)"
                                      : attribute === "Disability Percentage"
                                      ? " (%)"
                                      : " (years)"}
                                  </span>
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    value={condition.min}
                                    onChange={(e) =>
                                      updateEligibilityCondition(attribute, { min: e.target.value })
                                    }
                                    placeholder="0"
                                    className="h-7 w-full rounded-lg border border-border bg-background px-2 text-[10.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500"
                                  />
                                </div>
                              )}
                              {(condition.mode === "Maximum" || condition.mode === "Between") && (
                                <div className="space-y-0.5">
                                  <span className="block text-[9.5px] font-bold text-muted-foreground">
                                    Maximum
                                    {attribute === "Annual Family Income"
                                      ? " (₹ / year)"
                                      : attribute === "Disability Percentage"
                                      ? " (%)"
                                      : " (years)"}
                                  </span>
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    value={condition.max}
                                    onChange={(e) =>
                                      updateEligibilityCondition(attribute, { max: e.target.value })
                                    }
                                    placeholder="0"
                                    className="h-7 w-full rounded-lg border border-border bg-background px-2 text-[10.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500"
                                  />
                                </div>
                              )}
                            </div>

                            <p className="text-[9px] font-medium leading-tight text-muted-foreground">
                              {attribute === "Annual Family Income"
                                ? "Enter rupees per year. Both minimum and maximum boundaries are inclusive."
                                : attribute === "Disability Percentage"
                                ? "Enter a percentage from 0 to 100. Boundaries are inclusive."
                                : "Enter completed years. Boundaries are inclusive."}
                            </p>
                          </div>
                        )}

                        {error && (
                          <p className="flex items-center gap-1 text-[9.5px] font-bold text-red-500">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {error}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* FIXED FOOTER WITH ACTIONS */}
      {/* --------------------------------------------------------------------- */}
      <div className="shrink-0 z-20 bg-[#FFFDF9] dark:bg-slate-900 border-t border-orange-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3 shadow-md">
        {isPreviewMode ? (
          <>
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              className="flex-1 py-2.5 rounded-lg border border-orange-200/80 bg-white hover:bg-orange-50/50 text-[#1E293B] font-extrabold text-xs transition-colors cursor-pointer dark:bg-slate-800 dark:text-white dark:border-slate-700"
            >
              {lang === "ml" ? "എഡിറ്റ് ക്രമീകരണങ്ങളിലേക്ക് മടങ്ങുക" : "Back to Edit"}
            </button>
            <button
              type="button"
              onClick={handlePublishScheme}
              className="flex-1 py-2.5 rounded-lg bg-[#FF5500] hover:bg-[#E64D00] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {lang === "ml" ? "പദ്ധതി പബ്ലിഷ് ചെയ്യുക" : "Publish Scheme"}
            </button>
          </>
        ) : (
          <>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={
                  currentStep === 1 ? handleContinueFromStep1 : handleContinueFromStep2
                }
                className="w-full py-2.5 rounded-lg bg-[#FF5500] hover:bg-[#E64D00] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer text-center"
              >
                {lang === "ml" ? "തുടരുക →" : "Continue →"}
              </button>
            ) : (
              <div className="flex w-full items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 py-2.5 rounded-lg border border-orange-200/80 bg-white hover:bg-orange-50/50 text-[#1E293B] font-extrabold text-xs transition-colors cursor-pointer dark:bg-slate-800 dark:text-white dark:border-slate-700"
                >
                  {lang === "ml" ? "ഡ്രാഫ്റ്റ് സേവ് ചെയ്യുക" : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={handlePublishScheme}
                  className="flex-1 py-2.5 rounded-lg bg-[#FF5500] hover:bg-[#E64D00] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer text-center"
                >
                  {lang === "ml" ? "സേവ് ചെയ്ത് സ്കീം സൃഷ്ടിക്കുക" : "Save & Create Scheme"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* RULE MODAL */}
      {/* --------------------------------------------------------------------- */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <h3 className="text-xs font-black text-foreground">
                {editingRuleId ? "Edit Eligibility Condition" : "Add Eligibility Condition"}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold text-muted-foreground">Enabled:</span>
                <input
                  type="checkbox"
                  checked={ruleEnabled}
                  onChange={(e) => setRuleEnabled(e.target.checked)}
                  className="h-4 w-4 accent-[#ff5500] cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-extrabold block mb-1 text-foreground">Shared Applicant Attribute *</label>
                <select
                  value={ruleAttr}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setRuleAttr(selected);
                    if (selected.includes("Income")) {
                      setRuleCond("Is less than or equal to");
                      setRuleUnit("INR / Year");
                    } else if (selected.includes("Age")) {
                      setRuleCond("Is greater than or equal to");
                      setRuleUnit("Years");
                    } else if (selected.includes("Percentage")) {
                      setRuleCond("Is greater than or equal to");
                      setRuleUnit("%");
                    } else {
                      setRuleCond("Must be Yes / Must be No");
                      setRuleUnit("");
                    }
                  }}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-medium text-foreground focus:ring-1 focus:ring-orange-500 outline-none"
                >
                  {applicantAttributes.map((attr) => (
                    <option key={attr} value={attr}>{attr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-extrabold block mb-1 text-foreground">Condition Operator *</label>
                <select
                  value={ruleCond}
                  onChange={(e) => setRuleCond(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-medium text-foreground focus:ring-1 focus:ring-orange-500 outline-none"
                >
                  <option>Is less than or equal to</option>
                  <option>Is greater than or equal to</option>
                  <option>Is between</option>
                  <option>Is exactly equal to</option>
                  <option>Must be Yes / Must be No</option>
                  <option>Select applicable options</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="font-extrabold block mb-1 text-foreground">Required Value / Criteria *</label>
                  <input
                    type="text"
                    value={ruleVal}
                    onChange={(e) => setRuleVal(e.target.value)}
                    placeholder="e.g. 100000 or Must be Yes"
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-background font-medium text-foreground focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                </div>
                {ruleUnit && (
                  <div className="w-24">
                    <label className="font-extrabold block mb-1 text-foreground">Unit</label>
                    <input
                      type="text"
                      value={ruleUnit}
                      onChange={(e) => setRuleUnit(e.target.value)}
                      placeholder="e.g. INR / Year"
                      className="w-full h-8 px-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="font-extrabold block mb-1 text-foreground">Condition Grouping</label>
                  <div className="flex gap-1 bg-muted p-0.5 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setRuleGrouping("ALL")}
                      className={`flex-1 py-1 text-[10.5px] font-extrabold rounded ${
                        ruleGrouping === "ALL" ? "bg-[#ff5500] text-white" : "text-muted-foreground"
                      }`}
                    >
                      ALL (AND)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRuleGrouping("ANY")}
                      className={`flex-1 py-1 text-[10.5px] font-extrabold rounded ${
                        ruleGrouping === "ANY" ? "bg-[#ff5500] text-white" : "text-muted-foreground"
                      }`}
                    >
                      ANY (OR)
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-extrabold block mb-1 text-foreground">Requirement Explanation (Shown to Worker)</label>
                <input
                  type="text"
                  value={ruleReason}
                  onChange={(e) => setRuleReason(e.target.value)}
                  placeholder="e.g. Income must be within official BPL limit of ₹1,00,000/yr"
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="font-extrabold block mb-1 text-foreground">Official Source URL or Reference</label>
                <input
                  type="url"
                  value={ruleSourceUrl}
                  onChange={(e) => setRuleSourceUrl(e.target.value)}
                  placeholder="e.g. https://kerala.gov.in/schemes/guidelines"
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-4 py-1.5 bg-[#ff5500] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Save Condition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIELD ACTION MENU BACKDROP */}
      {fieldMenuId && (
        <button
          type="button"
          aria-label="Close field actions"
          onClick={() => setFieldMenuId(null)}
          className="absolute inset-0 z-30 cursor-default bg-transparent"
        />
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CHOOSE FIELD TYPE BOTTOM SHEET */}
      {/* --------------------------------------------------------------------- */}
      {showFieldTypeSheet && (
        <div className="absolute inset-0 z-[70] flex items-end bg-black/50 backdrop-blur-[1px]">
          <button
            type="button"
            aria-label="Close field type picker"
            onClick={() => setShowFieldTypeSheet(false)}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative z-10 flex max-h-[86dvh] w-full flex-col rounded-t-2xl border-t border-orange-100 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex shrink-0 items-start justify-between border-b border-orange-100 px-4 pb-3 pt-4 dark:border-slate-800">
              <div>
                <h3 className="text-[13px] font-black text-[#1E293B] dark:text-slate-100">
                  Choose Field Type
                </h3>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  Select what workers need to provide.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFieldTypeSheet(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-slate-500 transition-colors hover:bg-orange-100 hover:text-[#FF5500] dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-3 py-2 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))]">
              {(Object.keys(FIELD_TYPE_META) as Array<CustomField["type"]>).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleOpenAddField(type)}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-orange-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF2E6] text-[#FF5500] dark:bg-orange-950/40">
                    {type === "file_upload" ? (
                      <UploadCloud className="h-4 w-4" />
                    ) : type === "yes_no" ? (
                      <HelpCircle className="h-4 w-4" />
                    ) : type === "descriptive_text" ? (
                      <FileText className="h-4 w-4" />
                    ) : type === "dropdown" ? (
                      <Layers className="h-4 w-4" />
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11.5px] font-extrabold text-[#1E293B] dark:text-slate-100">
                      {FIELD_TYPE_META[type].label}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-medium leading-snug text-muted-foreground">
                      {FIELD_TYPE_META[type].description}
                    </span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* FIELD EDITOR BOTTOM SHEET */}
      {/* --------------------------------------------------------------------- */}
      {showFieldModal && (
        <div className="absolute inset-0 z-[80] flex items-end bg-black/60 backdrop-blur-[1px]">
          <button
            type="button"
            aria-label="Close field editor"
            onClick={handleCloseFieldEditor}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative z-10 flex max-h-[92dvh] w-full flex-col rounded-t-2xl border-t border-orange-100 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex shrink-0 items-start justify-between border-b border-orange-100 px-4 pb-3 pt-4 dark:border-slate-800">
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[#FF5500]">
                  {FIELD_TYPE_META[fieldType].label}
                </span>
                <h3 className="mt-0.5 text-[13px] font-black text-[#1E293B] dark:text-slate-100">
                  {editingFieldId ? "Edit Field" : "Add Field"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseFieldEditor}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-slate-500 transition-colors hover:bg-orange-100 hover:text-[#FF5500] dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
              <div className="space-y-1">
                <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                  Label — English <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fieldLabelEn}
                  onChange={(event) => setFieldLabelEn(event.target.value)}
                  onFocus={keepFieldInputVisible}
                  placeholder={fieldType === "file_upload" ? "e.g. Aadhaar Card Copy" : "e.g. Field label"}
                  className={`w-full rounded-lg border bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none transition-colors focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 ${
                    fieldErrors.labelEn ? "border-red-400" : "border-orange-200/80 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.labelEn && (
                  <p className="flex items-center gap-1 text-[9.5px] font-bold text-red-500">
                    <AlertCircle className="h-3 w-3" /> {fieldErrors.labelEn}
                  </p>
                )}
                {fieldType === "file_upload" && (
                  <p className="text-[9px] font-medium text-muted-foreground">
                    Used as the document name in the worker form.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                  Label — Malayalam
                </label>
                <input
                  type="text"
                  value={fieldLabelMl}
                  onChange={(event) => setFieldLabelMl(event.target.value)}
                  onFocus={keepFieldInputVisible}
                  placeholder="ഉദാ. ആധാർ കാർഡിന്റെ പകർപ്പ്"
                  className="w-full rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none transition-colors focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={() => setFieldRequired((value) => !value)}
                className="flex w-full items-center justify-between rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2.5 text-left dark:border-slate-700 dark:bg-slate-800/70 cursor-pointer"
              >
                <span>
                  <span className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-100">
                    Required
                  </span>
                  <span className="mt-0.5 block text-[9px] font-medium text-muted-foreground">
                    Workers must complete this field.
                  </span>
                </span>
                <span
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    fieldRequired ? "bg-[#FF5500]" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                      fieldRequired ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
              {fieldType === "file_upload" && (
                <div className="space-y-2.5 border-t border-orange-100 pt-3 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Upload instructions
                    </label>
                    <textarea
                      rows={2}
                      value={fieldUploadInstructions}
                      onChange={(event) => setFieldUploadInstructions(event.target.value)}
                      onFocus={keepFieldInputVisible}
                      placeholder="e.g. Upload a clear copy of the original document."
                      className="w-full resize-none rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-3 py-2 text-[11px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/70">
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-100">
                        Allow verification without upload
                      </p>
                      <p className="mt-0.5 text-[9px] font-medium leading-snug text-muted-foreground">
                        Workers can verify the original document in person instead of uploading a copy.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFieldAllowOfflineVerif((value) => !value)}
                      className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
                        fieldAllowOfflineVerif ? "bg-[#FF5500]" : "bg-slate-300 dark:bg-slate-600"
                      }`}
                      aria-label="Allow verification without upload"
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                          fieldAllowOfflineVerif ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Allow verification without upload — Malayalam
                    </label>
                    <input
                      type="text"
                      value={fieldOfflineVerificationLabelMl}
                      onChange={(event) =>
                        setFieldOfflineVerificationLabelMl(event.target.value)
                      }
                      onFocus={keepFieldInputVisible}
                      placeholder="അപ്ലോഡ് ഇല്ലാതെ രേഖ പരിശോധിക്കാൻ അനുവദിക്കുക"
                      className="w-full rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <p className="text-[9px] font-medium leading-snug text-muted-foreground">
                      Shown to workers when offline verification is available.
                    </p>
                  </div>
                </div>
              )}

              {fieldType === "yes_no" && (
                <div className="space-y-2.5 border-t border-orange-100 pt-3 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Help text — English
                    </label>
                    <input
                      type="text"
                      value={fieldHelpTextEn}
                      onChange={(event) => setFieldHelpTextEn(event.target.value)}
                      onFocus={keepFieldInputVisible}
                      placeholder="Optional guidance for the worker"
                      className="w-full rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Help text — Malayalam
                    </label>
                    <input
                      type="text"
                      value={fieldHelpTextMl}
                      onChange={(event) => setFieldHelpTextMl(event.target.value)}
                      onFocus={keepFieldInputVisible}
                      placeholder="ഐച്ഛിക സഹായ വിവരം"
                      className="w-full rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>

                  <div className="rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/70">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-100">
                          Conditional follow-up
                        </p>
                        <p className="mt-0.5 text-[9px] font-medium text-muted-foreground">
                          Ask for more information after a Yes or No answer.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFieldFollowUpEnabled((value) => !value)}
                        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                          fieldFollowUpEnabled ? "bg-[#FF5500]" : "bg-slate-300 dark:bg-slate-600"
                        }`}
                        aria-label="Enable conditional follow-up"
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                            fieldFollowUpEnabled ? "left-[18px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {fieldFollowUpEnabled && (
                      <div className="mt-2.5 space-y-2">
                        <div className="grid grid-cols-2 gap-1 rounded-lg bg-white p-1 dark:bg-slate-900">
                          {(["Yes", "No"] as const).map((answer) => (
                            <button
                              key={answer}
                              type="button"
                              onClick={() => setFieldFollowUpTrigger(answer)}
                              className={`rounded-md py-1.5 text-[10.5px] font-extrabold transition-colors ${
                                fieldFollowUpTrigger === answer
                                  ? "bg-[#FF5500] text-white"
                                  : "text-slate-500 hover:bg-orange-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              {answer}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={
                            fieldFollowUpTrigger === "Yes" ? fieldYesFollowUp : fieldNoFollowUp
                          }
                          onChange={(event) =>
                            fieldFollowUpTrigger === "Yes"
                              ? setFieldYesFollowUp(event.target.value)
                              : setFieldNoFollowUp(event.target.value)
                          }
                          onFocus={keepFieldInputVisible}
                          placeholder="Follow-up question or instruction"
                          className={`w-full rounded-lg border bg-white px-3 py-2 text-[11px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-900 ${
                            fieldErrors.followUp
                              ? "border-red-400"
                              : "border-orange-200/80 dark:border-slate-700"
                          }`}
                        />
                        {fieldErrors.followUp && (
                          <p className="flex items-center gap-1 text-[9.5px] font-bold text-red-500">
                            <AlertCircle className="h-3 w-3" /> {fieldErrors.followUp}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(fieldType === "descriptive_text" || fieldType === "single_text") && (
                <div className="space-y-2.5 border-t border-orange-100 pt-3 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Placeholder — English
                    </label>
                    <input
                      type="text"
                      value={fieldPlaceholderEn}
                      onChange={(event) => setFieldPlaceholderEn(event.target.value)}
                      onFocus={keepFieldInputVisible}
                      placeholder="Placeholder shown inside the field"
                      className="w-full rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Placeholder — Malayalam
                    </label>
                    <input
                      type="text"
                      value={fieldPlaceholderMl}
                      onChange={(event) => setFieldPlaceholderMl(event.target.value)}
                      onFocus={keepFieldInputVisible}
                      placeholder="ഉദാ. വിവരങ്ങൾ നൽകുക"
                      className="w-full rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Help text — English
                    </label>
                    <input
                      type="text"
                      value={fieldHelpTextEn}
                      onChange={(event) => setFieldHelpTextEn(event.target.value)}
                      onFocus={keepFieldInputVisible}
                      placeholder="Optional guidance for the worker"
                      className="w-full rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Help text — Malayalam
                    </label>
                    <input
                      type="text"
                      value={fieldHelpTextMl}
                      onChange={(event) => setFieldHelpTextMl(event.target.value)}
                      onFocus={keepFieldInputVisible}
                      placeholder="ഐച്ഛിക സഹായ വിവരം"
                      className="w-full rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Character limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={fieldType === "descriptive_text" ? 10000 : 500}
                      value={fieldCharLimit}
                      onChange={(event) => setFieldCharLimit(Number(event.target.value))}
                      onFocus={keepFieldInputVisible}
                      className={`w-full rounded-lg border bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 ${
                        fieldErrors.charLimit
                          ? "border-red-400"
                          : "border-orange-200/80 dark:border-slate-700"
                      }`}
                    />
                    {fieldErrors.charLimit && (
                      <p className="flex items-center gap-1 text-[9.5px] font-bold text-red-500">
                        <AlertCircle className="h-3 w-3" /> {fieldErrors.charLimit}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {fieldType === "dropdown" && (
                <div className="space-y-2.5 border-t border-orange-100 pt-3 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Placeholder — English
                    </label>
                    <input
                      type="text"
                      value={fieldPlaceholderEn}
                      onChange={(event) => setFieldPlaceholderEn(event.target.value)}
                      onFocus={keepFieldInputVisible}
                      placeholder="e.g. Select an option"
                      className="w-full rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-3 py-2 text-[11.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                      Selection
                    </label>
                    <div className="grid grid-cols-2 gap-1 rounded-lg bg-orange-50/70 p-1 dark:bg-slate-800">
                      {[
                        { value: false, label: "Single" },
                        { value: true, label: "Multiple" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setFieldIsMultiSelect(item.value)}
                          className={`rounded-md py-1.5 text-[10.5px] font-extrabold transition-colors ${
                            fieldIsMultiSelect === item.value
                              ? "bg-white text-[#FF5500] shadow-2xs dark:bg-slate-900"
                              : "text-slate-500"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-200">
                        Answer options
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFieldOptions((options) => [
                            ...options,
                            {
                              id: `opt-${Date.now()}`,
                              labelEn: `Option ${options.length + 1}`,
                              labelMl: "",
                            },
                          ])
                        }
                        className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[9.5px] font-extrabold text-[#FF5500] hover:bg-orange-100 dark:bg-orange-950/40 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Add Option
                      </button>
                    </div>
                    {fieldErrors.options && (
                      <p className="flex items-center gap-1 text-[9.5px] font-bold text-red-500">
                        <AlertCircle className="h-3 w-3" /> {fieldErrors.options}
                      </p>
                    )}
                    <div className="space-y-1.5">
                      {fieldOptions.map((option, optionIndex) => (
                        <div
                          key={option.id}
                          className="flex items-center gap-1.5 rounded-lg border border-orange-100 bg-[#FFFDF7] p-1.5 dark:border-slate-700 dark:bg-slate-800/70"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <input
                              type="text"
                              value={option.labelEn}
                              onChange={(event) =>
                                setFieldOptions((options) =>
                                  options.map((item) =>
                                    item.id === option.id
                                      ? { ...item, labelEn: event.target.value }
                                      : item
                                  )
                                )
                              }
                              onFocus={keepFieldInputVisible}
                              placeholder="Option label"
                              className="w-full rounded-md border border-orange-100 bg-white px-2 py-1.5 text-[10.5px] font-semibold text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              value={option.labelMl}
                              onChange={(event) =>
                                setFieldOptions((options) =>
                                  options.map((item) =>
                                    item.id === option.id
                                      ? { ...item, labelMl: event.target.value }
                                      : item
                                  )
                                )
                              }
                              onFocus={keepFieldInputVisible}
                              placeholder="Malayalam (optional)"
                              className="w-full rounded-md border border-orange-100 bg-white px-2 py-1.5 text-[10px] font-medium text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                            />
                          </div>
                          <div className="flex shrink-0 flex-col items-center gap-0.5">
                            <button
                              type="button"
                              disabled={optionIndex === 0}
                              onClick={() =>
                                setFieldOptions((options) => {
                                  const next = [...options];
                                  const [moved] = next.splice(optionIndex, 1);
                                  next.splice(optionIndex - 1, 0, moved);
                                  return next;
                                })
                              }
                              className="rounded p-0.5 text-slate-400 hover:text-[#FF5500] disabled:opacity-25"
                              aria-label="Move option up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={optionIndex === fieldOptions.length - 1}
                              onClick={() =>
                                setFieldOptions((options) => {
                                  const next = [...options];
                                  const [moved] = next.splice(optionIndex, 1);
                                  next.splice(optionIndex + 1, 0, moved);
                                  return next;
                                })
                              }
                              className="rounded p-0.5 text-slate-400 hover:text-[#FF5500] disabled:opacity-25"
                              aria-label="Move option down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFieldOptions((options) =>
                                  options.filter((item) => item.id !== option.id)
                                )
                              }
                              className="rounded p-0.5 text-red-400 hover:text-red-600"
                              aria-label="Remove option"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-orange-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowFieldAdvanced((value) => !value)}
                  className="flex w-full items-center justify-between gap-2 bg-orange-50/40 px-3 py-2.5 text-left dark:bg-slate-800/70"
                >
                  <span>
                    <span className="block text-[10.5px] font-extrabold text-[#1E293B] dark:text-slate-100">
                      Advanced Settings
                    </span>
                    <span className="mt-0.5 block text-[9px] font-medium text-muted-foreground">
                      {fieldReuseApplicantAttr
                        ? "Applicant data reuse is configured."
                        : "Limits and applicant data reuse."}
                    </span>
                  </span>
                  {showFieldAdvanced ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                </button>

                {showFieldAdvanced && (
                  <div className="space-y-2.5 border-t border-orange-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    {fieldType === "file_upload" && (
                      <>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-[#1E293B] dark:text-slate-200">
                            Accepted formats
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {UPLOAD_FORMAT_OPTIONS.map((format) => {
                              const selected = fieldAcceptedFormats.includes(format);
                              return (
                                <button
                                  key={format}
                                  type="button"
                                  onClick={() =>
                                    setFieldAcceptedFormats((formats) =>
                                      selected
                                        ? formats.filter((item) => item !== format)
                                        : [...formats, format]
                                    )
                                  }
                                  className={`rounded-md border px-2 py-1 text-[9px] font-extrabold uppercase transition-colors ${
                                    selected
                                      ? "border-[#FF5500] bg-orange-50 text-[#FF5500] dark:bg-orange-950/40"
                                      : "border-orange-100 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                                  }`}
                                >
                                  {format}
                                </button>
                              );
                            })}
                          </div>
                          {fieldErrors.uploadFormats && (
                            <p className="flex items-center gap-1 text-[9px] font-bold text-red-500">
                              <AlertCircle className="h-3 w-3" /> {fieldErrors.uploadFormats}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-extrabold text-[#1E293B] dark:text-slate-200">
                              Max file size (MB)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={fieldMaxFileSizeMb}
                              onChange={(event) => setFieldMaxFileSizeMb(Number(event.target.value))}
                              onFocus={keepFieldInputVisible}
                              className={`w-full rounded-lg border bg-[#FFFDF7] px-2.5 py-2 text-[11px] outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 ${
                                fieldErrors.maxFileSize
                                  ? "border-red-400"
                                  : "border-orange-200/80 dark:border-slate-700"
                              }`}
                            />
                            {fieldErrors.maxFileSize && (
                              <p className="text-[8.5px] font-bold leading-tight text-red-500">
                                {fieldErrors.maxFileSize}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-extrabold text-[#1E293B] dark:text-slate-200">
                              Max files
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={fieldMaxFileCount}
                              onChange={(event) => setFieldMaxFileCount(Number(event.target.value))}
                              onFocus={keepFieldInputVisible}
                              className={`w-full rounded-lg border bg-[#FFFDF7] px-2.5 py-2 text-[11px] outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-800 ${
                                fieldErrors.maxFileCount
                                  ? "border-red-400"
                                  : "border-orange-200/80 dark:border-slate-700"
                              }`}
                            />
                            {fieldErrors.maxFileCount && (
                              <p className="text-[8.5px] font-bold leading-tight text-red-500">
                                {fieldErrors.maxFileCount}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {fieldType !== "file_upload" && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold text-[#1E293B] dark:text-slate-200">
                          Reuse applicant information
                        </label>
                        <select
                          value={fieldReuseApplicantAttr}
                          onChange={(event) => setFieldReuseApplicantAttr(event.target.value)}
                          onFocus={keepFieldInputVisible}
                          className="w-full rounded-lg border border-orange-200/80 bg-[#FFFDF7] px-2.5 py-2 text-[10.5px] text-foreground outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                        >
                          <option value="">Do not reuse</option>
                          {applicantAttributes.map((attribute) => (
                            <option key={attribute} value={attribute}>
                              {attribute}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-orange-100 bg-white px-4 py-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-900">
              {Object.keys(fieldErrors).length > 0 && (
                <p className="mb-2 flex items-center gap-1 text-[9.5px] font-bold text-red-500">
                  <AlertCircle className="h-3 w-3" /> Check the highlighted settings before saving.
                </p>
              )}
              <button
                type="button"
                onClick={handleSaveField}
                className="w-full rounded-lg bg-[#FF5500] py-2.5 text-[11.5px] font-extrabold text-white shadow-xs transition-colors hover:bg-[#E64D00] cursor-pointer"
              >
                {editingFieldId ? "Save Changes" : "Add Field"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCreateSchemeFlow;
