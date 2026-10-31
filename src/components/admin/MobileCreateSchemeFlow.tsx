import React, { useState } from "react";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Edit2,
  MoveUp,
  MoveDown,
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
  SlidersHorizontal
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

  // 2. Yes / No
  questionTextEn?: string;
  questionTextMl?: string;
  yesFollowUpText?: string;
  noFollowUpText?: string;

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

export const MobileCreateSchemeFlow: React.FC<CreateSchemeFlowProps> = ({
  lang,
  onClose,
  onPublishSuccess,
}) => {
  // Navigation State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"public" | "worker">("public");

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
  const [contributionType, setContributionType] = useState<"Amount" | "Percentage">("Percentage");
  const [contributionValue, setContributionValue] = useState("");

  // Eligibility
  const [eligibilitySummary, setEligibilitySummary] = useState("");
  const [exclusionsText, setExclusionsText] = useState("");
  const [applicableLocationsType, setApplicableLocationsType] = useState<"all" | "selected">("all");
  const [selectedDistricts, setSelectedSelectedDistricts] = useState<string[]>(["Thiruvananthapuram", "Ernakulam"]);
  const [manualReviewConditions, setManualReviewConditions] = useState("");

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
      reasonShownToWorker: "Income must be within BPL limit of ₹1,00,000/yr",
    },
    {
      id: "rule-2",
      attribute: "Age",
      condition: "Is greater than or equal to",
      value: "18",
      unit: "Years",
      grouping: "ALL",
      missingBehavior: "Request Answer",
      reasonShownToWorker: "Applicant must be an adult (18+ years)",
    },
  ]);

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

  const applicantAttributes = [
    "Annual Family Income",
    "Age",
    "Gender",
    "Category / Community",
    "District of Residence",
    "Panchayat / Municipality",
    "Land Holding (Acres)",
    "Disability Percentage",
    "Employment Status",
    "Ration Card Category (BPL/APL)",
  ];

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
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

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
  const [fieldDocName, setFieldDocName] = useState("");
  const [fieldUploadInstructions, setFieldUploadInstructions] = useState("");
  const [fieldAcceptedFormats, setFieldAcceptedFormats] = useState<string[]>(["pdf", "jpg"]);
  const [fieldMaxFileSizeMb, setFieldMaxFileSizeMb] = useState<number>(5);
  const [fieldMaxFileCount, setFieldMaxFileCount] = useState<number>(1);
  const [fieldAllowOfflineVerif, setFieldAllowOfflineVerif] = useState(true);

  const [fieldQuestionEn, setFieldQuestionEn] = useState("");
  const [fieldQuestionMl, setFieldQuestionMl] = useState("");
  const [fieldYesFollowUp, setFieldYesFollowUp] = useState("");
  const [fieldNoFollowUp, setFieldNoFollowUp] = useState("");

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
    if (!schemeNameMl.trim()) errs.schemeNameMl = lang === "ml" ? "മലയാളം പേര് നൽകുക" : "Scheme Name (Malayalam) is required";
    if (!category.trim()) errs.category = lang === "ml" ? "വിഭാഗം തിരഞ്ഞെടുക്കുക" : "Category is required";
    if (!department.trim()) errs.department = lang === "ml" ? "വകുപ്പ് തിരഞ്ഞെടുക്കുക" : "Department is required";
    if (department === "Custom / Other" && !customDepartment.trim()) {
      errs.customDepartment = lang === "ml" ? "വകുപ്പിന്റെ പേര് നൽകുക" : "Please enter custom department name";
    }
    if (!aboutScheme.trim()) errs.aboutScheme = lang === "ml" ? "പദ്ധതിയെപ്പറ്റി വിവരിക്കുക" : "About the Scheme is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (selectedBenefitTypes.length === 0) {
      errs.benefitTypes = lang === "ml" ? "കുറഞ്ഞത് ഒരു ആനുകൂല്യ തരം തിരഞ്ഞെടുക്കുക" : "Select at least one Benefit Type";
    }
    if (selectedBenefitTypes.includes("Other") && !customBenefitType.trim()) {
      errs.customBenefitType = lang === "ml" ? "ആനുകൂല്യ തരം നൽകുക" : "Specify custom benefit type";
    }
    if (!benefitSummary.trim()) {
      errs.benefitSummary = lang === "ml" ? "ആനുകൂല്യ സംഗ്രഹം നൽകുക" : "Benefit Summary is required";
    }

    if (selectedBenefitTypes.includes("Financial Assistance") || selectedBenefitTypes.includes("Subsidy") || selectedBenefitTypes.includes("Pension")) {
      if (benefitAmountType === "fixed" && !fixedAmount.trim()) {
        errs.fixedAmount = lang === "ml" ? "തുക നൽകുക" : "Fixed Amount is required";
      } else if (benefitAmountType === "range") {
        if (!minAmount.trim()) errs.minAmount = lang === "ml" ? "കുറഞ്ഞ തുക" : "Min Amount required";
        if (!maxAmount.trim()) errs.maxAmount = lang === "ml" ? "കൂടിയ തുക" : "Max Amount required";
      }
    }

    if (!eligibilitySummary.trim()) {
      errs.eligibilitySummary = lang === "ml" ? "യോഗ്യതാ വിവരണം നൽകുക" : "Eligibility Summary is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Navigation handlers
  const handleContinueFromStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleContinueFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenPreview = () => {
    setIsPreviewMode(true);
  };

  const handlePublishScheme = () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      setIsPreviewMode(false);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      setIsPreviewMode(false);
      return;
    }

    // Success publish
    const schemePayload = {
      nameEn: schemeNameEn,
      nameMl: schemeNameMl,
      shortName,
      logoUrl,
      category,
      department: department === "Custom / Other" ? customDepartment : department,
      aboutScheme,
      shortCardDescription,
      benefitTypes: selectedBenefitTypes,
      benefitSummary,
      eligibilitySummary,
      rulesCount: eligibilityRules.length,
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
    setShowRuleModal(true);
  };

  const handleSaveRule = () => {
    if (!ruleAttr || !ruleCond || !ruleVal) return;
    if (editingRuleId) {
      setEligibilityRules((prev) =>
        prev.map((r) =>
          r.id === editingRuleId
            ? {
                ...r,
                attribute: ruleAttr,
                condition: ruleCond,
                value: ruleVal,
                unit: ruleUnit,
                grouping: ruleGrouping,
                missingBehavior: ruleMissing,
                reasonShownToWorker: ruleReason,
              }
            : r
        )
      );
    } else {
      const newRule: EligibilityRule = {
        id: `rule-${Date.now()}`,
        attribute: ruleAttr,
        condition: ruleCond,
        value: ruleVal,
        unit: ruleUnit,
        grouping: ruleGrouping,
        missingBehavior: ruleMissing,
        reasonShownToWorker: ruleReason,
      };
      setEligibilityRules((prev) => [...prev, newRule]);
    }
    setShowRuleModal(false);
  };

  const handleDeleteRule = (id: string) => {
    setEligibilityRules((prev) => prev.filter((r) => r.id !== id));
  };

  // Field operations
  const handleOpenAddField = (type: CustomField["type"]) => {
    setEditingFieldId(null);
    setFieldType(type);
    setFieldLabelEn("");
    setFieldLabelMl("");
    setFieldRequired(true);
    setFieldShowOnlyWhenFieldId("");
    setFieldShowOnlyWhenValue("Yes");
    setFieldReuseApplicantAttr("");

    setFieldDocName("");
    setFieldUploadInstructions("");
    setFieldAcceptedFormats(["pdf", "jpg"]);
    setFieldMaxFileSizeMb(5);
    setFieldMaxFileCount(1);
    setFieldAllowOfflineVerif(true);

    setFieldQuestionEn("");
    setFieldQuestionMl("");
    setFieldYesFollowUp("");
    setFieldNoFollowUp("");

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

    setFieldDocName(field.documentName || "");
    setFieldUploadInstructions(field.uploadInstructions || "");
    setFieldAcceptedFormats(field.acceptedFormats || ["pdf", "jpg"]);
    setFieldMaxFileSizeMb(field.maxFileSizeMb || 5);
    setFieldMaxFileCount(field.maxFileCount || 1);
    setFieldAllowOfflineVerif(field.allowOfflineVerification ?? true);

    setFieldQuestionEn(field.questionTextEn || "");
    setFieldQuestionMl(field.questionTextMl || "");
    setFieldYesFollowUp(field.yesFollowUpText || "");
    setFieldNoFollowUp(field.noFollowUpText || "");

    setFieldPlaceholderEn(field.placeholderEn || "");
    setFieldPlaceholderMl(field.placeholderMl || "");
    setFieldHelpTextEn(field.helpTextEn || "");
    setFieldHelpTextMl(field.helpTextMl || "");
    setFieldCharLimit(field.charLimit || 250);

    setFieldOptions(field.options || []);
    setFieldIsMultiSelect(field.isMultiSelect || false);

    setShowFieldModal(true);
  };

  const handleSaveField = () => {
    if (!fieldLabelEn.trim()) return;

    const newField: CustomField = {
      id: editingFieldId || `field-${Date.now()}`,
      type: fieldType,
      labelEn: fieldLabelEn,
      labelMl: fieldLabelMl || fieldLabelEn,
      required: fieldRequired,
      showOnlyWhenFieldId: fieldShowOnlyWhenFieldId || undefined,
      showOnlyWhenValue: fieldShowOnlyWhenValue || undefined,
      reuseApplicantAttr: fieldReuseApplicantAttr || undefined,

      documentName: fieldType === "file_upload" ? (fieldDocName || fieldLabelEn) : undefined,
      uploadInstructions: fieldType === "file_upload" ? fieldUploadInstructions : undefined,
      acceptedFormats: fieldType === "file_upload" ? fieldAcceptedFormats : undefined,
      maxFileSizeMb: fieldType === "file_upload" ? fieldMaxFileSizeMb : undefined,
      maxFileCount: fieldType === "file_upload" ? fieldMaxFileCount : undefined,
      allowOfflineVerification: fieldType === "file_upload" ? fieldAllowOfflineVerif : undefined,

      questionTextEn: fieldType === "yes_no" ? fieldQuestionEn : undefined,
      questionTextMl: fieldType === "yes_no" ? fieldQuestionMl : undefined,
      yesFollowUpText: fieldType === "yes_no" ? fieldYesFollowUp : undefined,
      noFollowUpText: fieldType === "yes_no" ? fieldNoFollowUp : undefined,

      placeholderEn: fieldType === "descriptive_text" || fieldType === "single_text" ? fieldPlaceholderEn : undefined,
      placeholderMl: fieldType === "descriptive_text" || fieldType === "single_text" ? fieldPlaceholderMl : undefined,
      helpTextEn: fieldType === "descriptive_text" || fieldType === "single_text" ? fieldHelpTextEn : undefined,
      helpTextMl: fieldType === "descriptive_text" || fieldType === "single_text" ? fieldHelpTextMl : undefined,
      charLimit: fieldType === "descriptive_text" || fieldType === "single_text" ? fieldCharLimit : undefined,

      options: fieldType === "dropdown" ? fieldOptions : undefined,
      isMultiSelect: fieldType === "dropdown" ? fieldIsMultiSelect : undefined,
    };

    if (editingFieldId) {
      setCustomFields((prev) => prev.map((f) => (f.id === editingFieldId ? newField : f)));
    } else {
      setCustomFields((prev) => [...prev, newField]);
    }

    setShowFieldModal(false);
  };

  const handleDeleteField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDuplicateField = (field: CustomField) => {
    const dup: CustomField = {
      ...field,
      id: `field-${Date.now()}`,
      labelEn: `${field.labelEn} (Copy)`,
      labelMl: `${field.labelMl} (പകർപ്പ്)`,
    };
    setCustomFields((prev) => [...prev, dup]);
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= customFields.length) return;
    const updated = [...customFields];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setCustomFields(updated);
  };

  // ---------------------------------------------------------------------------
  // RENDER MODAL VIEW
  // ---------------------------------------------------------------------------
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
                setCurrentStep((prev) => (prev - 1) as 1 | 2);
              } else {
                onClose();
              }
            }}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-[#FFF7EC] text-[#1B255A] hover:bg-orange-100 dark:bg-slate-800 dark:text-white transition-colors cursor-pointer shadow-2xs"
            title={lang === "ml" ? "തിരികെ പോവുക" : "Go Back"}
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
          </button>

          <h1 className="text-[13.5px] font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            {isPreviewMode
              ? lang === "ml"
                ? "പദ്ധതി പ്രിവ്യൂ"
                : "Preview Scheme"
              : lang === "ml"
              ? "പുതിയ പദ്ധതി ചേർക്കുക"
              : "Create New Scheme"}
          </h1>

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
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 pb-24">
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
                  <p className="text-xs text-foreground font-medium pt-1">{benefitSummary}</p>
                </div>

                {/* Eligibility Rules Section */}
                <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs space-y-2">
                  <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-[#ff5500]" />
                    {lang === "ml" ? "യോഗ്യതാ നിബന്ധനകൾ" : "Eligibility Criteria"}
                  </h3>
                  <p className="text-xs text-foreground font-medium">{eligibilitySummary}</p>
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

                  {customFields.map((field) => (
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
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/50 dark:bg-orange-950/20 text-[#ff5500] text-xs font-bold hover:bg-orange-100 transition-colors">
                              <Upload className="h-3.5 w-3.5" />
                              <span>{simulatedUploadedFiles[field.id] ? "Change File" : "Choose File"}</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    setSimulatedUploadedFiles((prev) => ({ ...prev, [field.id]: f.name }));
                                  }
                                }}
                              />
                            </label>

                            {/* Offline Verification Button */}
                            {field.allowOfflineVerification && (
                              <button
                                type="button"
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
                        <div className="flex items-center gap-3 pt-1">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-foreground cursor-pointer">
                            <input type="radio" name={`yn-${field.id}`} className="accent-[#ff5500]" /> Yes
                          </label>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-foreground cursor-pointer">
                            <input type="radio" name={`yn-${field.id}`} className="accent-[#ff5500]" /> No
                          </label>
                        </div>
                      )}

                      {/* Dropdown Field Render */}
                      {field.type === "dropdown" && (
                        <select className="w-full text-xs h-9 px-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none">
                          <option value="">-- Select --</option>
                          {field.options?.map((opt) => (
                            <option key={opt.id} value={opt.labelEn}>{opt.labelEn}</option>
                          ))}
                        </select>
                      )}

                      {/* Text Field Render */}
                      {(field.type === "single_text" || field.type === "descriptive_text") && (
                        <input
                          type="text"
                          placeholder={field.placeholderEn || "Enter details..."}
                          className="w-full text-xs h-9 px-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-orange-500 outline-none"
                        />
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
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-white font-black text-[10px] shrink-0">
                    1
                  </span>
                  <h2 className="text-[12px] font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
                    {lang === "ml" ? "അടിസ്ഥാന വിവരങ്ങൾ" : "Basic Information"}
                  </h2>
                </div>

                {/* Scheme Name English */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "പദ്ധതിയുടെ പേര് (English) *" : "Scheme Name (English) *"}
                  </label>
                  <input
                    type="text"
                    value={schemeNameEn}
                    onChange={(e) => setSchemeNameEn(e.target.value)}
                    placeholder="e.g. Karunya Health Scheme"
                    className={`w-full rounded-2xl border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors ${
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

                {/* Scheme Name Malayalam */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "പദ്ധതിയുടെ പേര് (മലയാളം) *" : "Scheme Name (Malayalam) *"}
                  </label>
                  <input
                    type="text"
                    value={schemeNameMl}
                    onChange={(e) => setSchemeNameMl(e.target.value)}
                    placeholder="ഉദാ. കാരുണ്യ ആരോഗ്യ സുരക്ഷ പദ്ധതി"
                    className={`w-full rounded-2xl border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors ${
                      errors.schemeNameMl
                        ? "border-red-500 bg-red-50/50 ring-1 ring-red-500"
                        : "border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80"
                    }`}
                  />
                  {errors.schemeNameMl && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.schemeNameMl}
                    </p>
                  )}
                </div>

                {/* Short Name / Abbreviation */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "ലഘുനാമം / ചുരുക്കെഴുത്ത്" : "Short Name / Abbreviation"}
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="e.g. KASP / PM-KISAN"
                    className="w-full rounded-2xl border border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Official Scheme Logo Upload */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "ഔദ്യോഗിക സ്കീം ലോഗോ" : "Official Scheme Logo"}
                  </label>
                  {logoUrl ? (
                    <div className="flex items-center gap-3 p-2 rounded-2xl border border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80">
                      <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded-xl object-contain bg-white dark:bg-slate-900 border border-orange-100 p-1" />
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1 rounded-xl bg-[#FFF2E6] text-[#FF5500] text-[11px] font-extrabold cursor-pointer hover:bg-orange-200 transition-colors">
                          Replace
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={() => setLogoUrl(null)}
                          className="px-3 py-1 rounded-xl bg-red-50 text-red-600 text-[11px] font-extrabold hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-dashed border-orange-300 bg-[#FFFBF5] dark:bg-orange-950/20 text-[#FF5500] cursor-pointer hover:bg-orange-100/50 transition-colors">
                      <Upload className="h-5 w-5 mb-1 stroke-[2.2]" />
                      <span className="text-xs font-extrabold">Upload Scheme Logo</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">PNG, JPG or SVG (Max 2MB)</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
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
                    className="w-full rounded-2xl border border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
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
                    className="w-full rounded-2xl border border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
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
                      className="w-full mt-1.5 rounded-2xl border border-orange-200/80 dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800/80 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  )}
                </div>

                {/* About the Scheme */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1E293B] dark:text-slate-200 block">
                    {lang === "ml" ? "പദ്ധതിയെക്കുറിച്ച് *" : "About the Scheme *"}
                  </label>
                  <textarea
                    rows={3}
                    value={aboutScheme}
                    onChange={(e) => setAboutScheme(e.target.value)}
                    placeholder="Enter detailed objective and background of the scheme..."
                    className={`w-full rounded-2xl border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none transition-colors ${
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

                {/* Short Card Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-foreground block">
                    {lang === "ml" ? "കാർഡിലെ ലഘു വിവരണം" : "Short Card Description"}
                  </label>
                  <input
                    type="text"
                    value={shortCardDescription}
                    onChange={(e) => setShortCardDescription(e.target.value)}
                    placeholder="1-line quick summary shown on mobile cards..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {/* =================================------------------------------ */}
            {/* STEP 2 OF 3 — BENEFITS & ELIGIBILITY */}
            {/* =================================------------------------------ */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* SECTION 1: BENEFITS */}
                <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-white font-black text-[10px] shrink-0">
                      2
                    </span>
                    <h2 className="text-[12px] font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
                      {lang === "ml" ? "പദ്ധതി ആനുകൂല്യങ്ങൾ" : "Scheme Benefits"}
                    </h2>
                  </div>

                  {/* Benefit Types Multi Select */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-foreground block">
                      {lang === "ml" ? "ആനുകൂല്യ തരം *" : "Benefit Type *"}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Financial Assistance",
                        "Insurance",
                        "Loan",
                        "Subsidy",
                        "Pension",
                        "Service",
                        "Other",
                      ].map((type) => {
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
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#ff5500] border-[#ff5500] text-white shadow-2xs"
                                : "bg-background border-border text-foreground hover:border-orange-300"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                    {selectedBenefitTypes.includes("Other") && (
                      <input
                        type="text"
                        value={customBenefitType}
                        onChange={(e) => setCustomBenefitType(e.target.value)}
                        placeholder="Specify other benefit type..."
                        className="w-full mt-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    )}
                  </div>

                  {/* Benefit Summary */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-foreground block">
                      {lang === "ml" ? "ആനുകൂല്യ സംഗ്രഹം *" : "Benefit Summary *"}
                    </label>
                    <textarea
                      rows={2}
                      value={benefitSummary}
                      onChange={(e) => setBenefitSummary(e.target.value)}
                      placeholder="e.g. ₹5,000 direct benefit transfer annually for eligible BPL households."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                    />
                  </div>

                  {/* Financial inputs (Only shown when Financial / Subsidy / Pension selected) */}
                  {(selectedBenefitTypes.includes("Financial Assistance") ||
                    selectedBenefitTypes.includes("Subsidy") ||
                    selectedBenefitTypes.includes("Pension") ||
                    selectedBenefitTypes.includes("Loan")) && (
                    <div className="p-3 rounded-xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200/60 space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground block">Benefit Amount / Range</label>
                        <div className="flex gap-2">
                          {(["fixed", "range", "varies"] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setBenefitAmountType(mode)}
                              className={`flex-1 py-1 text-xs font-bold rounded-lg border capitalize cursor-pointer ${
                                benefitAmountType === mode
                                  ? "bg-[#ff5500] border-[#ff5500] text-white"
                                  : "bg-background border-border text-foreground"
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      {benefitAmountType === "fixed" && (
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block">Fixed Amount (₹)</label>
                          <input
                            type="number"
                            value={fixedAmount}
                            onChange={(e) => setFixedAmount(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono text-foreground focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                        </div>
                      )}

                      {benefitAmountType === "range" && (
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-muted-foreground block">Min Amount (₹)</label>
                            <input
                              type="number"
                              value={minAmount}
                              onChange={(e) => setMinAmount(e.target.value)}
                              placeholder="e.g. 1000"
                              className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono text-foreground focus:ring-1 focus:ring-orange-500 outline-none"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-muted-foreground block">Max Amount (₹)</label>
                            <input
                              type="number"
                              value={maxAmount}
                              onChange={(e) => setMaxAmount(e.target.value)}
                              placeholder="e.g. 10000"
                              className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono text-foreground focus:ring-1 focus:ring-orange-500 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {benefitAmountType === "varies" && (
                        <p className="text-[11px] text-muted-foreground italic">
                          Amount varies based on applicant profile / verification rules. No fixed currency required.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Payment Frequency & Duration */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-extrabold text-foreground block">Payment Frequency</label>
                      <select
                        value={paymentFrequency}
                        onChange={(e) => setPaymentFrequency(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option>One-time</option>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                        <option>Annual</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-foreground block">Benefit Duration</label>
                      <input
                        type="text"
                        value={benefitDuration}
                        onChange={(e) => setBenefitDuration(e.target.value)}
                        placeholder="e.g. 3 Years"
                        className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ELIGIBILITY & RULES */}
                <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs space-y-3">
                  <h2 className="text-xs font-black text-foreground uppercase tracking-wider text-[#ff5500] border-b border-border/60 pb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" />
                    {lang === "ml" ? "2B. യോഗ്യതയും നിബന്ധനകളും" : "2B. Eligibility & Rules"}
                  </h2>

                  {/* Eligibility Summary */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-foreground block">
                      {lang === "ml" ? "യോഗ്യതാ വിവരണം *" : "Eligibility Summary *"}
                    </label>
                    <textarea
                      rows={2}
                      value={eligibilitySummary}
                      onChange={(e) => setEligibilitySummary(e.target.value)}
                      placeholder="e.g. Resident of Kerala with annual family income below ₹1,00,000."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                    />
                  </div>

                  {/* Who Cannot Apply / Exclusions */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-foreground block">
                      {lang === "ml" ? "അർഹരല്ലാത്തവർ / ഒഴിവാക്കലുകൾ" : "Who Cannot Apply / Exclusions"}
                    </label>
                    <textarea
                      rows={2}
                      value={exclusionsText}
                      onChange={(e) => setExclusionsText(e.target.value)}
                      placeholder="e.g. Government employees, income tax payers..."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                    />
                  </div>

                  {/* Applicable Locations */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-foreground block">Applicable Locations</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setApplicableLocationsType("all")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-xl border cursor-pointer ${
                          applicableLocationsType === "all"
                            ? "bg-[#ff5500] border-[#ff5500] text-white"
                            : "bg-background border-border text-foreground"
                        }`}
                      >
                        All Kerala
                      </button>
                      <button
                        type="button"
                        onClick={() => setApplicableLocationsType("selected")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-xl border cursor-pointer ${
                          applicableLocationsType === "selected"
                            ? "bg-[#ff5500] border-[#ff5500] text-white"
                            : "bg-background border-border text-foreground"
                        }`}
                      >
                        Selected Locations
                      </button>
                    </div>

                    {applicableLocationsType === "selected" && (
                      <div className="p-2.5 rounded-xl bg-muted/50 border border-border text-xs space-y-1">
                        <span className="font-bold block">Selected Districts:</span>
                        <p className="text-muted-foreground">{selectedDistricts.join(", ")}</p>
                      </div>
                    )}
                  </div>

                  {/* Repeatable Rule Builder */}
                  <div className="space-y-2 pt-2 border-t border-border/80">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase text-foreground">
                        Eligibility Rules ({eligibilityRules.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenAddRule}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-[#ff5500] hover:underline cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> + Add Rule
                      </button>
                    </div>

                    <div className="space-y-2">
                      {eligibilityRules.map((rule) => (
                        <div key={rule.id} className="p-3 rounded-xl bg-muted/40 border border-border flex items-start justify-between gap-2">
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-orange-100 dark:bg-orange-950/60 text-[#ff5500]">
                                {rule.grouping}
                              </span>
                              <span className="text-xs font-extrabold text-foreground">{rule.attribute}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {rule.condition} <strong className="text-foreground">{rule.value} {rule.unit}</strong>
                            </p>
                            {rule.reasonShownToWorker && (
                              <p className="text-[10px] text-muted-foreground italic">
                                Worker note: "{rule.reasonShownToWorker}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditRule(rule)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1 rounded text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================------------------------------ */}
            {/* STEP 3 OF 3 — DETAILS & DOCUMENTS (CUSTOM FIELDS) */}
            {/* =================================------------------------------ */}
            {currentStep === 3 && (
              <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-white font-black text-[10px] shrink-0">
                      3
                    </span>
                    <h2 className="text-[12px] font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
                      {lang === "ml" ? "ഫീൽഡുകളും രേഖകളും" : "Custom Fields & Documents"}
                    </h2>
                  </div>

                  {/* Add Field Button */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => handleOpenAddField("file_upload")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#ff5500] text-white text-xs font-extrabold shadow-2xs hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>+ Add Field</span>
                    </button>
                  </div>
                </div>

                {/* Quick Type Selector Bar */}
                <div className="flex gap-1 overflow-x-auto pb-1 text-[10.5px] font-bold">
                  {[
                    { type: "file_upload", label: "File Upload" },
                    { type: "yes_no", label: "Yes / No" },
                    { type: "descriptive_text", label: "Descriptive Text" },
                    { type: "dropdown", label: "Dropdown" },
                    { type: "single_text", label: "Single Text" },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleOpenAddField(item.type as any)}
                      className="px-2.5 py-1 rounded-lg bg-muted hover:bg-orange-100 hover:text-[#ff5500] border border-border whitespace-nowrap transition-colors cursor-pointer"
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>

                {/* Custom Fields Compact List */}
                <div className="space-y-2">
                  {customFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-3 rounded-xl bg-background border border-border shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-[#ff5500]">
                              {field.type.replace("_", " ")}
                            </span>
                            {field.required && (
                              <span className="text-[9.5px] font-extrabold text-red-500">Required</span>
                            )}
                          </div>
                          <h4 className="text-xs font-extrabold text-foreground truncate">{field.labelEn}</h4>
                          <p className="text-[10.5px] text-muted-foreground truncate">{field.labelMl}</p>
                        </div>

                        {/* Actions: Reorder, Edit, Duplicate, Delete */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveField(idx, "up")}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === customFields.length - 1}
                            onClick={() => handleMoveField(idx, "down")}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditField(field)}
                            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {customFields.length === 0 && (
                    <div className="p-6 text-center border border-dashed border-border rounded-xl">
                      <p className="text-xs text-muted-foreground font-semibold">
                        No fields added yet. Click "+ Add Field" above to configure application form inputs.
                      </p>
                    </div>
                  )}
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
              className="flex-1 py-2.5 rounded-2xl border border-orange-200/80 bg-white hover:bg-orange-50/50 text-[#1E293B] font-extrabold text-xs transition-colors cursor-pointer dark:bg-slate-800 dark:text-white dark:border-slate-700"
            >
              {lang === "ml" ? "എഡിറ്റ് ക്രമീകരണങ്ങളിലേക്ക് മടങ്ങുക" : "Back to Edit"}
            </button>
            <button
              type="button"
              onClick={handlePublishScheme}
              className="flex-1 py-2.5 rounded-2xl bg-[#FF5500] hover:bg-[#E64D00] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {lang === "ml" ? "പദ്ധതി പബ്ലിഷ് ചെയ്യുക" : "Publish Scheme"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-orange-200/80 bg-white hover:bg-orange-50/50 text-[#1E293B] font-extrabold text-xs transition-colors cursor-pointer dark:bg-slate-800 dark:text-white dark:border-slate-700"
            >
              {lang === "ml" ? "ഡ്രാഫ്റ്റ് സേവ് ചെയ്യുക" : "Save Draft"}
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={currentStep === 1 ? handleContinueFromStep1 : handleContinueFromStep2}
                className="flex-1 py-2.5 rounded-2xl bg-[#FF5500] hover:bg-[#E64D00] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {lang === "ml" ? "തുടരുക →" : "Continue →"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenPreview}
                className="flex-1 py-2.5 rounded-2xl bg-[#FF5500] hover:bg-[#E64D00] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {lang === "ml" ? "സ്കീം പ്രിവ്യൂ കാണുക" : "Preview Scheme"}
              </button>
            )}
          </>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* RULE MODAL */}
      {/* --------------------------------------------------------------------- */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-xl">
            <h3 className="text-xs font-black text-foreground border-b border-border/80 pb-2">
              {editingRuleId ? "Edit Eligibility Rule" : "Add Eligibility Rule"}
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold block mb-1">Applicant Attribute</label>
                <select
                  value={ruleAttr}
                  onChange={(e) => setRuleAttr(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-border bg-background"
                >
                  {applicantAttributes.map((attr) => (
                    <option key={attr} value={attr}>{attr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Condition</label>
                <select
                  value={ruleCond}
                  onChange={(e) => setRuleCond(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-border bg-background"
                >
                  <option>Is less than or equal to</option>
                  <option>Is greater than or equal to</option>
                  <option>Is exactly equal to</option>
                  <option>Is member of</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="font-bold block mb-1">Value</label>
                  <input
                    type="text"
                    value={ruleVal}
                    onChange={(e) => setRuleVal(e.target.value)}
                    placeholder="e.g. 100000"
                    className="w-full h-8 px-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div className="w-24">
                  <label className="font-bold block mb-1">Unit</label>
                  <input
                    type="text"
                    value={ruleUnit}
                    onChange={(e) => setRuleUnit(e.target.value)}
                    placeholder="e.g. INR"
                    className="w-full h-8 px-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Reason Shown to Worker</label>
                <input
                  type="text"
                  value={ruleReason}
                  onChange={(e) => setRuleReason(e.target.value)}
                  placeholder="e.g. Must be within income ceiling"
                  className="w-full h-8 px-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-4 py-1.5 bg-[#ff5500] text-white text-xs font-extrabold rounded-xl"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* FIELD MODAL */}
      {/* --------------------------------------------------------------------- */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-xl max-h-[85vh] overflow-y-auto">
            <h3 className="text-xs font-black text-foreground border-b border-border/80 pb-2 capitalize">
              {editingFieldId ? "Edit Field" : `Add ${fieldType.replace("_", " ")}`}
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold block mb-0.5">Label (English) *</label>
                <input
                  type="text"
                  value={fieldLabelEn}
                  onChange={(e) => setFieldLabelEn(e.target.value)}
                  placeholder="e.g. Aadhaar Card Copy"
                  className="w-full h-8 px-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="font-bold block mb-0.5">Label (Malayalam)</label>
                <input
                  type="text"
                  value={fieldLabelMl}
                  onChange={(e) => setFieldLabelMl(e.target.value)}
                  placeholder="ഉദാ. ആധാർ കാർഡിന്റെ പകർപ്പ്"
                  className="w-full h-8 px-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="f-req"
                  checked={fieldRequired}
                  onChange={(e) => setFieldRequired(e.target.checked)}
                  className="accent-[#ff5500]"
                />
                <label htmlFor="f-req" className="font-bold cursor-pointer">Required Field</label>
              </div>

              {/* Type specific options */}
              {fieldType === "file_upload" && (
                <div className="p-2.5 rounded-xl bg-muted/40 space-y-2">
                  <div>
                    <label className="font-bold block mb-0.5">Upload Instructions</label>
                    <input
                      type="text"
                      value={fieldUploadInstructions}
                      onChange={(e) => setFieldUploadInstructions(e.target.value)}
                      placeholder="e.g. Upload clear PDF or image"
                      className="w-full h-8 px-2 rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="f-off"
                      checked={fieldAllowOfflineVerif}
                      onChange={(e) => setFieldAllowOfflineVerif(e.target.checked)}
                      className="accent-[#ff5500]"
                    />
                    <label htmlFor="f-off" className="font-bold cursor-pointer">Allow Offline Physical Verification</label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowFieldModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveField}
                className="px-4 py-1.5 bg-[#ff5500] text-white text-xs font-extrabold rounded-xl"
              >
                Save Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCreateSchemeFlow;
