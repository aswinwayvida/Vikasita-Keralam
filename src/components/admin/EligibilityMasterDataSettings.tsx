import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Calendar,
  ChevronRight,
  Church,
  GraduationCap,
  HardHat,
  Heart,
  Home,
  IndianRupee,
  Info,
  MoreVertical,
  Percent,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getEligibilityMasterFields,
  loadEligibilityMasterPayload,
  saveEligibilityMasterOptions,
  saveEligibilityMasterState,
  type EligibilityMasterField,
  type EligibilityMasterFieldKind,
  type EligibilityMasterNumericConfig,
  type EligibilityMasterOption,
  type EligibilityMasterOptionStatus,
} from "@/data/eligibility-master";
import { getAdminSession } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

const FIELD_ICONS: Record<string, LucideIcon> = {
  gender: Users,
  age: Calendar,
  religion: Church,
  caste: UsersRound,
  disabilityStatus: Accessibility,
  disabilityPercentage: Percent,
  minorityStatus: Users,
  studentStatus: GraduationCap,
  employmentStatus: Briefcase,
  occupation: HardHat,
  annualIncome: IndianRupee,
  maritalStatus: Heart,
  householdStatus: Home,
  bplStatus: BadgeCheck,
};

const inputClass =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

interface OptionEditorState {
  mode: "add" | "edit";
  fieldKey: string;
  originalCode?: string;
  label: string;
  displayOrder: string;
  status: EligibilityMasterOptionStatus;
}

interface RangeEditorState {
  fieldKey: string;
  minValue: string;
  maxValue: string;
}

type RangeDrafts = Record<string, { minValue: string; maxValue: string }>;

interface StatusTarget {
  fieldKey: string;
  code: string;
}

interface ValidationIssue {
  fieldKey: string;
  message: string;
}

const buildDraftMap = (
  fields: EligibilityMasterField[],
): Record<string, EligibilityMasterOption[]> =>
  Object.fromEntries(
    fields.map((field) => [field.key, field.options.map((option) => ({ ...option }))]),
  );

const buildRangeDraftMap = (fields: EligibilityMasterField[]): RangeDrafts =>
  Object.fromEntries(
    fields
      .filter((field) => field.kind === "number" || field.kind === "currency")
      .map((field) => [
        field.key,
        {
          minValue: field.minValue === undefined ? "" : String(field.minValue),
          maxValue: field.maxValue === undefined ? "" : String(field.maxValue),
        },
      ]),
  );

const applyDraftsToFields = (
  fields: EligibilityMasterField[],
  drafts: Record<string, EligibilityMasterOption[]>,
): EligibilityMasterField[] =>
  fields.map((field) =>
    field.kind === "options" || field.kind === "yesno"
      ? {
          ...field,
          options: (drafts[field.key] ?? []).map((option) => ({ ...option })),
        }
      : { ...field, options: [] },
  );

const normalizeDrafts = (
  fields: EligibilityMasterField[],
  drafts: Record<string, EligibilityMasterOption[]>,
): Record<string, EligibilityMasterOption[]> => {
  const normalized: Record<string, EligibilityMasterOption[]> = {};
  for (const field of fields) {
    if (field.kind !== "options" && field.kind !== "yesno") continue;
    normalized[field.key] = (drafts[field.key] ?? [])
      .map((option) => ({
        ...option,
        label: option.label.trim(),
        code: option.code.trim().toUpperCase(),
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label));
  }
  return normalized;
};

const validateDrafts = (
  fields: EligibilityMasterField[],
  drafts: Record<string, EligibilityMasterOption[]>,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  for (const field of fields) {
    if (field.kind !== "options" && field.kind !== "yesno") continue;
    const options = drafts[field.key] ?? [];

    if (options.length === 0) {
      issues.push({ fieldKey: field.key, message: "At least one option is required." });
      continue;
    }

    const seenLabels = new Set<string>();
    for (const option of options) {
      const label = option.label.trim();
      if (!label) {
        issues.push({ fieldKey: field.key, message: "Option label is required." });
      } else if (seenLabels.has(label.toLowerCase())) {
        issues.push({
          fieldKey: field.key,
          message: "Option labels must be unique within this field.",
        });
      } else {
        seenLabels.add(label.toLowerCase());
      }

      if (!Number.isInteger(option.displayOrder) || option.displayOrder < 1) {
        issues.push({
          fieldKey: field.key,
          message: "Display order must be a whole number of 1 or more.",
        });
      }
    }

    if (!options.some((option) => option.status === "Active")) {
      issues.push({
        fieldKey: field.key,
        message: "At least one option must remain active.",
      });
    }
  }

  return issues;
};

const getEditorErrors = (
  editor: OptionEditorState,
  drafts: Record<string, EligibilityMasterOption[]>,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const label = editor.label.trim();
  if (!label) {
    errors.label = "Option label is required.";
  } else if (
    (drafts[editor.fieldKey] ?? []).some(
      (option) =>
        option.code !== editor.originalCode &&
        option.label.trim().toLowerCase() === label.toLowerCase(),
    )
  ) {
    errors.label = "An option with this label already exists for this field.";
  }

  const order = Number(editor.displayOrder);
  if (!Number.isInteger(order) || order < 1) {
    errors.displayOrder = "Enter a whole number of 1 or more.";
  }

  return errors;
};

const codeFromLabel = (label: string) =>
  label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

const uniqueCodeFromLabel = (
  label: string,
  options: EligibilityMasterOption[],
  existingCode?: string,
) => {
  if (existingCode) return existingCode;

  const base = codeFromLabel(label) || "OPTION";
  const usedCodes = new Set(options.map((option) => option.code.trim().toUpperCase()));
  if (!usedCodes.has(base)) return base;

  let suffix = 2;
  while (usedCodes.has(`${base}_${suffix}`)) suffix += 1;
  return `${base}_${suffix}`;
};

const parseOptionalNumber = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getRangeDraftError = (draft: { minValue: string; maxValue: string }): string | null => {
  const min = parseOptionalNumber(draft.minValue);
  const max = parseOptionalNumber(draft.maxValue);

  if (draft.minValue.trim() && (min === undefined || min < 0)) {
    return "Minimum must be zero or a positive number.";
  }
  if (draft.maxValue.trim() && (max === undefined || max < 0)) {
    return "Maximum must be zero or a positive number.";
  }
  if (min !== undefined && max !== undefined && max < min) {
    return "Maximum must be greater than or equal to minimum.";
  }
  if (min === undefined && max === undefined) {
    return "Enter a minimum or maximum value.";
  }
  return null;
};

const formatFieldMeta = (
  field: EligibilityMasterField,
  options: EligibilityMasterOption[],
): string => {
  if (field.kind === "options" || field.kind === "yesno") {
    return `${options.length} ${options.length === 1 ? "Option" : "Options"}`;
  }
  return field.configLabel ?? "Configuration";
};

const formatRangeValue = (value: number | undefined, unit?: string) => {
  if (value === undefined) return "No limit";
  if (unit === "INR per year") {
    return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
  }
  return `${value}${unit === "Percent" ? "%" : unit === "Years" ? " yrs" : ""}`;
};

export function EligibilityMasterDataSettings() {
  const navigate = useNavigate();
  const initialFields = useMemo(() => getEligibilityMasterFields(), []);
  const [savedFields, setSavedFields] = useState<EligibilityMasterField[]>(initialFields);
  const [drafts, setDrafts] = useState<Record<string, EligibilityMasterOption[]>>(() =>
    buildDraftMap(initialFields),
  );
  const [rangeDrafts, setRangeDrafts] = useState<RangeDrafts>(() =>
    buildRangeDraftMap(initialFields),
  );
  const [selectedKey, setSelectedKey] = useState(initialFields[0]?.key ?? "gender");
  const [optionSearch, setOptionSearch] = useState("");
  const [editor, setEditor] = useState<OptionEditorState | null>(null);
  const [editorAttempted, setEditorAttempted] = useState(false);
  const [rangeEditor, setRangeEditor] = useState<RangeEditorState | null>(null);
  const [rangeEditorAttempted, setRangeEditorAttempted] = useState(false);
  const [statusTarget, setStatusTarget] = useState<StatusTarget | null>(null);
  const [canEdit] = useState(() => {
    if (typeof window === "undefined") return false;
    return getAdminSession()?.role === "STATE_ADMIN";
  });

  // Checkbox selection states
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>([]);
  const [selectedOptionCodes, setSelectedOptionCodes] = useState<string[]>([]);

  // Create Field Dialog states
  const [createFieldOpen, setCreateFieldOpen] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldKind, setNewFieldKind] = useState<EligibilityMasterFieldKind>("options");
  const [newFieldDescription, setNewFieldDescription] = useState("");
  const [newFieldUnit, setNewFieldUnit] = useState("");
  const [newFieldOptionsRaw, setNewFieldOptionsRaw] = useState("");
  const [createFieldAttempted, setCreateFieldAttempted] = useState(false);

  // Delete confirmation dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"options" | "fields" | "range" | null>(null);
  const [deleteTargetCodes, setDeleteTargetCodes] = useState<string[]>([]);
  const [deleteTargetFieldKeys, setDeleteTargetFieldKeys] = useState<string[]>([]);

  const selectedField = savedFields.find((field) => field.key === selectedKey) ?? savedFields[0];
  const currentOptions = drafts[selectedField.key] ?? [];
  const isOptionField = selectedField.kind === "options" || selectedField.kind === "yesno";
  const selectedRangeDraft = rangeDrafts[selectedField.key] ?? { minValue: "", maxValue: "" };

  const savedDraftMap = useMemo(() => buildDraftMap(savedFields), [savedFields]);
  const savedRangeDraftMap = useMemo(() => buildRangeDraftMap(savedFields), [savedFields]);
  const dirty = useMemo(
    () =>
      JSON.stringify(drafts) !== JSON.stringify(savedDraftMap) ||
      JSON.stringify(rangeDrafts) !== JSON.stringify(savedRangeDraftMap),
    [drafts, rangeDrafts, savedDraftMap, savedRangeDraftMap],
  );
  const validationIssues = useMemo(
    () => validateDrafts(savedFields, drafts),
    [savedFields, drafts],
  );
  const selectedIssues = validationIssues.filter((issue) => issue.fieldKey === selectedField.key);
  const rangeIssueCount = Object.values(rangeDrafts).filter((draft) =>
    Boolean(getRangeDraftError(draft)),
  ).length;
  const totalIssueCount = validationIssues.length + rangeIssueCount;
  const canSave = canEdit && dirty && totalIssueCount === 0;

  const filteredOptions = useMemo(() => {
    const query = optionSearch.trim().toLowerCase();
    return currentOptions
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label))
      .filter((option) => !query || option.label.toLowerCase().includes(query));
  }, [currentOptions, optionSearch]);

  const editorErrors = editor ? getEditorErrors(editor, drafts) : {};
  const rangeEditorError = rangeEditor ? getRangeDraftError(rangeEditor) : null;
  const statusTargetOption = statusTarget
    ? (drafts[statusTarget.fieldKey] ?? []).find((option) => option.code === statusTarget.code)
    : undefined;

  const updateDraftOptions = (fieldKey: string, nextOptions: EligibilityMasterOption[]) => {
    const nextDrafts = { ...drafts, [fieldKey]: nextOptions };
    setDrafts(nextDrafts);
    const normalized = normalizeDrafts(savedFields, nextDrafts);
    const normalizedRanges: Record<string, EligibilityMasterNumericConfig> = Object.fromEntries(
      Object.entries(rangeDrafts).map(([fKey, draft]) => [
        fKey,
        {
          minValue: parseOptionalNumber(draft.minValue),
          maxValue: parseOptionalNumber(draft.maxValue),
        },
      ]),
    );
    const nextFields = applyDraftsToFields(savedFields, normalized);
    saveEligibilityMasterOptions(normalized, normalizedRanges);
    setSavedFields(nextFields);
  };

  const selectField = (fieldKey: string) => {
    setSelectedKey(fieldKey);
    setOptionSearch("");
    setSelectedOptionCodes([]);
  };

  const toggleSelectOption = (code: string) => {
    setSelectedOptionCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const toggleSelectAllOptions = () => {
    if (selectedOptionCodes.length === filteredOptions.length && filteredOptions.length > 0) {
      setSelectedOptionCodes([]);
    } else {
      setSelectedOptionCodes(filteredOptions.map((opt) => opt.code));
    }
  };

  const handleBulkDisableOptions = () => {
    if (selectedOptionCodes.length === 0) return;
    const current = drafts[selectedField.key] ?? [];
    const nextOptions = current.map((opt) =>
      selectedOptionCodes.includes(opt.code)
        ? { ...opt, status: "Inactive" as EligibilityMasterOptionStatus }
        : opt,
    );
    updateDraftOptions(selectedField.key, nextOptions);
    toast.success(`Disabled ${selectedOptionCodes.length} option(s).`);
    setSelectedOptionCodes([]);
  };

  const handleBulkEnableOptions = () => {
    if (selectedOptionCodes.length === 0) return;
    const current = drafts[selectedField.key] ?? [];
    const nextOptions = current.map((opt) =>
      selectedOptionCodes.includes(opt.code)
        ? { ...opt, status: "Active" as EligibilityMasterOptionStatus }
        : opt,
    );
    updateDraftOptions(selectedField.key, nextOptions);
    toast.success(`Enabled ${selectedOptionCodes.length} option(s).`);
    setSelectedOptionCodes([]);
  };

  const handleConfirmDeleteOptions = () => {
    if (deleteTargetCodes.length === 0) return;
    const current = drafts[selectedField.key] ?? [];
    const nextOptions = current.filter((opt) => !deleteTargetCodes.includes(opt.code));
    updateDraftOptions(selectedField.key, nextOptions);
    toast.success(`Deleted ${deleteTargetCodes.length} option(s).`);
    setSelectedOptionCodes([]);
    setDeleteConfirmOpen(false);
    setDeleteTargetCodes([]);
  };

  const handleConfirmDeleteRange = () => {
    const nextRangeDrafts = {
      ...rangeDrafts,
      [selectedField.key]: { minValue: "", maxValue: "" },
    };
    setRangeDrafts(nextRangeDrafts);
    const normalized = normalizeDrafts(savedFields, drafts);
    const normalizedRanges: Record<string, EligibilityMasterNumericConfig> = Object.fromEntries(
      Object.entries(nextRangeDrafts).map(([fKey, draft]) => [
        fKey,
        {
          minValue: parseOptionalNumber(draft.minValue),
          maxValue: parseOptionalNumber(draft.maxValue),
        },
      ]),
    );
    const nextFields = applyDraftsToFields(savedFields, normalized).map((field) =>
      field.kind === "number" || field.kind === "currency"
        ? {
            ...field,
            ...(normalizedRanges[field.key] ?? {}),
          }
        : field,
    );
    saveEligibilityMasterOptions(normalized, normalizedRanges);
    setSavedFields(nextFields);
    toast.success(`Range limits for "${selectedField.label}" cleared.`);
    setDeleteConfirmOpen(false);
    setDeleteType(null);
  };

  const toggleSingleFieldStatus = (fieldKey: string) => {
    const target = savedFields.find((f) => f.key === fieldKey);
    const currentStatus = target?.status ?? "Active";
    const newStatus: EligibilityMasterOptionStatus =
      currentStatus === "Active" ? "Inactive" : "Active";
    const nextFields = savedFields.map((f) =>
      f.key === fieldKey ? { ...f, status: newStatus } : f,
    );
    setSavedFields(nextFields);
    saveEligibilityMasterState({
      options: drafts,
      fieldStatuses: Object.fromEntries(nextFields.map((f) => [f.key, f.status ?? "Active"])),
      customFields: nextFields.filter((f) => f.isCustom),
    });
    toast.success(`${newStatus === "Active" ? "Enabled" : "Disabled"} ${target?.label || "field"}.`);
  };

  const toggleSelectField = (fieldKey: string) => {
    setSelectedFieldKeys((prev) =>
      prev.includes(fieldKey) ? prev.filter((k) => k !== fieldKey) : [...prev, fieldKey],
    );
  };

  const toggleSelectAllFields = () => {
    if (selectedFieldKeys.length === savedFields.length) {
      setSelectedFieldKeys([]);
    } else {
      setSelectedFieldKeys(savedFields.map((f) => f.key));
    }
  };

  const handleBulkDisableFields = () => {
    if (selectedFieldKeys.length === 0) return;
    const nextFields = savedFields.map((f) =>
      selectedFieldKeys.includes(f.key)
        ? { ...f, status: "Inactive" as EligibilityMasterOptionStatus }
        : f,
    );
    setSavedFields(nextFields);
    saveEligibilityMasterState({
      options: drafts,
      fieldStatuses: Object.fromEntries(nextFields.map((f) => [f.key, f.status ?? "Active"])),
      customFields: nextFields.filter((f) => f.isCustom),
    });
    toast.success(`Disabled ${selectedFieldKeys.length} eligibility field(s).`);
    setSelectedFieldKeys([]);
  };

  const handleBulkEnableFields = () => {
    if (selectedFieldKeys.length === 0) return;
    const nextFields = savedFields.map((f) =>
      selectedFieldKeys.includes(f.key)
        ? { ...f, status: "Active" as EligibilityMasterOptionStatus }
        : f,
    );
    setSavedFields(nextFields);
    saveEligibilityMasterState({
      options: drafts,
      fieldStatuses: Object.fromEntries(nextFields.map((f) => [f.key, f.status ?? "Active"])),
      customFields: nextFields.filter((f) => f.isCustom),
    });
    toast.success(`Enabled ${selectedFieldKeys.length} eligibility field(s).`);
    setSelectedFieldKeys([]);
  };

  const handleConfirmDeleteFields = () => {
    if (deleteTargetFieldKeys.length === 0) return;
    const remainingFields = savedFields.filter((f) => !deleteTargetFieldKeys.includes(f.key));
    if (remainingFields.length === 0) {
      toast.error("Cannot delete all eligibility fields.");
      return;
    }
    setSavedFields(remainingFields);
    const payload = loadEligibilityMasterPayload();
    const existingDeleted = payload.deletedFieldKeys ?? [];
    const nextDeletedKeys = Array.from(new Set([...existingDeleted, ...deleteTargetFieldKeys]));

    saveEligibilityMasterState({
      options: drafts,
      customFields: remainingFields.filter((f) => f.isCustom),
      fieldStatuses: Object.fromEntries(remainingFields.map((f) => [f.key, f.status ?? "Active"])),
      deletedFieldKeys: nextDeletedKeys,
    });
    if (deleteTargetFieldKeys.includes(selectedKey)) {
      setSelectedKey(remainingFields[0]?.key ?? "gender");
    }
    toast.success(`Deleted ${deleteTargetFieldKeys.length} eligibility field(s).`);
    setSelectedFieldKeys([]);
    setDeleteConfirmOpen(false);
    setDeleteTargetFieldKeys([]);
  };

  const handleCreateField = () => {
    setCreateFieldAttempted(true);
    const label = newFieldLabel.trim();
    if (!label) {
      toast.error("Field label is required.");
      return;
    }
    if (savedFields.some((f) => f.label.toLowerCase() === label.toLowerCase())) {
      toast.error("An eligibility field with this label already exists.");
      return;
    }

    const baseKey =
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "custom_field";
    let uniqueKey = baseKey;
    let counter = 1;
    while (savedFields.some((f) => f.key === uniqueKey)) {
      uniqueKey = `${baseKey}_${counter}`;
      counter += 1;
    }

    let initialOptions: EligibilityMasterOption[] = [];
    if (newFieldKind === "options") {
      const parsedLabels = newFieldOptionsRaw
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const labelsToUse =
        parsedLabels.length > 0 ? parsedLabels : ["Standard Option 1", "Standard Option 2"];
      initialOptions = labelsToUse.map((optLabel, idx) => ({
        label: optLabel,
        code: uniqueCodeFromLabel(optLabel, []),
        status: "Active" as EligibilityMasterOptionStatus,
        displayOrder: idx + 1,
      }));
    } else if (newFieldKind === "yesno") {
      initialOptions = [
        { label: "Yes", code: "YES", status: "Active", displayOrder: 1 },
        { label: "No", code: "NO", status: "Active", displayOrder: 2 },
      ];
    }

    const newField: EligibilityMasterField = {
      key: uniqueKey,
      label,
      description:
        newFieldDescription.trim() ||
        `Manage allowed ${label} options and criteria for eligibility.`,
      kind: newFieldKind,
      usage: "Used in eligibility rules and applicant data collection across schemes.",
      options: initialOptions,
      status: "Active",
      isCustom: true,
      ...(newFieldKind === "number" || newFieldKind === "currency"
        ? {
            minValue: 0,
            maxValue: undefined,
            unit: newFieldUnit.trim() || (newFieldKind === "currency" ? "INR per year" : undefined),
            configLabel: "Configuration (Between / Range)",
          }
        : {}),
    };

    const nextFields = [...savedFields, newField];
    setSavedFields(nextFields);
    setDrafts((prev) => ({
      ...prev,
      [uniqueKey]: initialOptions,
    }));
    if (newFieldKind === "number" || newFieldKind === "currency") {
      setRangeDrafts((prev) => ({
        ...prev,
        [uniqueKey]: { minValue: "0", maxValue: "" },
      }));
    }

    const payload = loadEligibilityMasterPayload();
    const existingCustom = Array.isArray(payload.customFields) ? payload.customFields : [];
    saveEligibilityMasterState({
      options: { ...drafts, [uniqueKey]: initialOptions },
      customFields: [...existingCustom, newField],
      fieldStatuses: Object.fromEntries(nextFields.map((f) => [f.key, f.status ?? "Active"])),
    });

    setSelectedKey(uniqueKey);
    setCreateFieldOpen(false);
    toast.success(`Created eligibility field "${label}".`);
  };

  const openAddOption = () => {
    if (!canEdit) return;
    const maxOrder = currentOptions.reduce((max, option) => Math.max(max, option.displayOrder), 0);
    setEditor({
      mode: "add",
      fieldKey: selectedField.key,
      label: "",
      displayOrder: String(maxOrder + 1),
      status: "Active",
    });
    setEditorAttempted(false);
  };

  const openAddRange = () => {
    if (!canEdit) return;
    setRangeEditor({
      fieldKey: selectedField.key,
      minValue: selectedRangeDraft.minValue,
      maxValue: selectedRangeDraft.maxValue,
    });
    setRangeEditorAttempted(false);
  };

  const openEditOption = (option: EligibilityMasterOption) => {
    if (!canEdit) return;
    setEditor({
      mode: "edit",
      fieldKey: selectedField.key,
      originalCode: option.code,
      label: option.label,
      displayOrder: String(option.displayOrder),
      status: option.status,
    });
    setEditorAttempted(false);
  };

  const handleSaveRange = () => {
    if (!rangeEditor) return;
    setRangeEditorAttempted(true);
    const error = getRangeDraftError(rangeEditor);
    if (error) {
      toast.error(error);
      return;
    }

    const nextRangeDrafts = {
      ...rangeDrafts,
      [rangeEditor.fieldKey]: {
        minValue: rangeEditor.minValue.trim(),
        maxValue: rangeEditor.maxValue.trim(),
      },
    };
    setRangeDrafts(nextRangeDrafts);
    const normalized = normalizeDrafts(savedFields, drafts);
    const normalizedRanges: Record<string, EligibilityMasterNumericConfig> = Object.fromEntries(
      Object.entries(nextRangeDrafts).map(([fKey, draft]) => [
        fKey,
        {
          minValue: parseOptionalNumber(draft.minValue),
          maxValue: parseOptionalNumber(draft.maxValue),
        },
      ]),
    );
    const nextFields = applyDraftsToFields(savedFields, normalized).map((field) =>
      field.kind === "number" || field.kind === "currency"
        ? {
            ...field,
            ...(normalizedRanges[field.key] ?? {}),
          }
        : field,
    );
    saveEligibilityMasterOptions(normalized, normalizedRanges);
    setSavedFields(nextFields);
    setRangeEditor(null);
    toast.success("Validation range updated successfully.");
  };

  const handleSaveOption = () => {
    if (!editor) return;
    setEditorAttempted(true);
    if (Object.keys(editorErrors).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    const nextOption: EligibilityMasterOption = {
      label: editor.label.trim(),
      code: uniqueCodeFromLabel(
        editor.label,
        drafts[editor.fieldKey] ?? [],
        editor.mode === "edit" ? editor.originalCode : undefined,
      ),
      status: editor.status,
      displayOrder: Number(editor.displayOrder),
    };
    const fieldOptions = drafts[editor.fieldKey] ?? [];

    if (editor.mode === "add") {
      updateDraftOptions(editor.fieldKey, [...fieldOptions, nextOption]);
      toast.success("Option added successfully.");
    } else {
      updateDraftOptions(
        editor.fieldKey,
        fieldOptions.map((option) => (option.code === nextOption.code ? nextOption : option)),
      );
      toast.success("Option updated successfully.");
    }
    setEditor(null);
  };

  const handleToggleStatus = () => {
    if (!statusTarget || !statusTargetOption) return;
    const nextStatus: EligibilityMasterOptionStatus =
      statusTargetOption.status === "Active" ? "Inactive" : "Active";
    updateDraftOptions(
      statusTarget.fieldKey,
      (drafts[statusTarget.fieldKey] ?? []).map((option) =>
        option.code === statusTargetOption.code ? { ...option, status: nextStatus } : option,
      ),
    );
    toast.success(
      nextStatus === "Active"
        ? "Option activated successfully."
        : "Option deactivated. Historical records are preserved.",
    );
    setStatusTarget(null);
  };

  const handleSave = () => {
    if (!canSave) return;
    const normalized = normalizeDrafts(savedFields, drafts);
    const normalizedRanges: Record<string, EligibilityMasterNumericConfig> = Object.fromEntries(
      Object.entries(rangeDrafts).map(([fieldKey, draft]) => [
        fieldKey,
        {
          minValue: parseOptionalNumber(draft.minValue),
          maxValue: parseOptionalNumber(draft.maxValue),
        },
      ]),
    );
    const nextFields = applyDraftsToFields(savedFields, normalized).map((field) =>
      field.kind === "number" || field.kind === "currency"
        ? {
            ...field,
            ...(normalizedRanges[field.key] ?? {}),
          }
        : field,
    );
    saveEligibilityMasterOptions(normalized, normalizedRanges);
    setSavedFields(nextFields);
    setDrafts(buildDraftMap(nextFields));
    setRangeDrafts(buildRangeDraftMap(nextFields));
    toast.success("Master data changes saved.");
  };

  const handleCancel = () => {
    setDrafts(buildDraftMap(savedFields));
    setRangeDrafts(buildRangeDraftMap(savedFields));
    setOptionSearch("");
    toast.info("Unsaved changes discarded.");
  };

  const SelectedIcon = FIELD_ICONS[selectedField.key] ?? Info;
  const statusIsActive = statusTargetOption?.status === "Active";

  return (
    <div className="space-y-4 pb-8">
      <section className="sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void navigate({ to: "/admin/settings" })}
            className="group inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary cursor-pointer sm:h-8 sm:w-8"
            title="Back to Settings"
            aria-label="Back to Settings"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 sm:h-3.5 sm:w-3.5" />
          </button>
          <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
            Master Data
          </h1>
        </div>
      </section>

      {!canEdit && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong className="font-bold">View-only access.</strong> Editing master data requires
            the State Administrator role.
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[460px_minmax(0,1fr)] xl:grid-cols-[500px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div className="border-b border-border/80 px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[15px] font-extrabold text-foreground">
                  Eligibility Field Masters
                </h2>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setNewFieldLabel("");
                    setNewFieldKind("options");
                    setNewFieldDescription("");
                    setNewFieldUnit("");
                    setNewFieldOptionsRaw("");
                    setCreateFieldAttempted(false);
                    setCreateFieldOpen(true);
                  }}
                  className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Eligibility Field
                </button>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex min-h-[38px] items-center justify-between border-b border-border/60 bg-muted/20 px-3.5 py-1.5">
              <label className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={
                    selectedFieldKeys.length === savedFields.length && savedFields.length > 0
                      ? true
                      : selectedFieldKeys.length > 0
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={toggleSelectAllFields}
                  aria-label="Select all sections"
                  className="border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground focus-visible:ring-primary/40"
                />
                <span>Select All Sections</span>
              </label>

              {selectedFieldKeys.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleBulkDisableFields}
                      title="Disable selected sections"
                      aria-label="Disable selected sections"
                      className="grid h-6 w-6 place-items-center rounded-md text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkEnableFields}
                      title="Enable selected sections"
                      aria-label="Enable selected sections"
                      className="grid h-6 w-6 place-items-center rounded-md text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteType("fields");
                        setDeleteTargetFieldKeys(selectedFieldKeys);
                        setDeleteConfirmOpen(true);
                      }}
                      title="Delete selected sections"
                      aria-label="Delete selected sections"
                      className="grid h-6 w-6 place-items-center rounded-md text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] font-bold text-foreground">
                    {selectedFieldKeys.length}/{savedFields.length}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-0.5 p-2">
            {savedFields.map((field) => {
              const Icon = FIELD_ICONS[field.key] ?? Info;
              const active = field.key === selectedField.key;
              const fieldOptions = drafts[field.key] ?? field.options;
              const isSelected = selectedFieldKeys.includes(field.key);
              const isFieldDisabled = field.status === "Inactive";
              return (
                <div
                  key={field.key}
                  className={cn(
                    "group flex w-full items-center gap-1.5 rounded-xl border px-2 py-1.5 transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 shadow-2xs"
                      : "border-transparent hover:border-border hover:bg-muted/35",
                  )}
                >
                  {canEdit && (
                    <div className="pl-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectField(field.key)}
                        aria-label={`Select section ${field.label}`}
                        className="border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:ring-primary/40"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => selectField(field.key)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left cursor-pointer"
                  >
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                        active
                          ? "bg-primary/20 text-primary"
                          : "bg-primary/10 text-primary group-hover:bg-primary/20",
                      )}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <div className="min-w-0 flex-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "truncate text-[12.5px] font-bold",
                            active ? "text-primary" : "text-foreground",
                            isFieldDisabled && "text-muted-foreground line-through opacity-70",
                          )}
                        >
                          {field.label}
                        </span>
                        {isFieldDisabled && (
                          <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-500">
                            Disabled
                          </span>
                        )}
                        {field.isCustom && (
                          <span className="rounded bg-orange-50 px-1 py-0.2 text-[9px] font-semibold text-primary">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-right text-[10.5px] font-semibold",
                        active ? "text-primary/80" : "text-muted-foreground",
                      )}
                    >
                      {formatFieldMeta(field, fieldOptions)}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        active ? "text-primary" : "text-muted-foreground/60",
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
        <section className="flex min-h-[580px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div className="border-b border-border/80 px-4 py-2.5 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-8.5 w-8.5 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <SelectedIcon className="h-4.5 w-4.5 text-primary" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-extrabold leading-none text-foreground sm:text-lg">
                    {selectedField.label}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {canEdit && selectedOptionCodes.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-foreground mr-1">
                      {selectedOptionCodes.length} of {filteredOptions.length} selected
                    </span>
                    <button
                      type="button"
                      onClick={handleBulkDisableOptions}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Power className="h-3 w-3" />
                      Disable
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkEnableOptions}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Enable
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteType("options");
                        setDeleteTargetCodes(selectedOptionCodes);
                        setDeleteConfirmOpen(true);
                      }}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-rose-600 px-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOptionCodes([])}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                      Deselect
                    </button>
                  </div>
                )}

                {canEdit && (
                  <button
                    type="button"
                    onClick={isOptionField ? openAddOption : openAddRange}
                    className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[12px] font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {isOptionField ? "Add Option" : "Add Range"}
                  </button>
                )}
              </div>
            </div>

            {selectedField.dependsOn && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#243D95]/15 bg-[#243D95]/5 px-3 py-1.5 text-[10.5px] font-semibold text-[#243D95]">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{selectedField.dependsOn}</span>
              </div>
            )}
          </div>

          <div className="flex-1 px-4 py-3 sm:px-5 sm:py-3.5">
            {isOptionField ? (
              <div className="space-y-3">
                {selectedIssues.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10.5px] font-semibold text-rose-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{selectedIssues[0].message}</span>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[440px] border-collapse text-left">
                    <thead>
                      <tr className="bg-muted/35 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {canEdit && (
                          <th className="w-10 px-3 py-2.5 text-center">
                            <Checkbox
                              checked={
                                selectedOptionCodes.length === filteredOptions.length &&
                                filteredOptions.length > 0
                                  ? true
                                  : selectedOptionCodes.length > 0
                                    ? "indeterminate"
                                    : false
                              }
                              onCheckedChange={toggleSelectAllOptions}
                              aria-label="Select all options"
                            />
                          </th>
                        )}
                        <th className="w-14 px-3 py-2.5 text-center">#</th>
                        <th className="px-3 py-2.5">Option Label</th>
                        <th className="w-28 px-3 py-2.5">Status</th>
                        <th className="w-16 px-3 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOptions.map((option) => (
                        <tr
                          key={option.code}
                          className="border-t border-border/70 text-[12px] transition-colors hover:bg-muted/20"
                        >
                          {canEdit && (
                            <td className="px-3 py-2.5 text-center">
                              <Checkbox
                                checked={selectedOptionCodes.includes(option.code)}
                                onCheckedChange={() => toggleSelectOption(option.code)}
                                aria-label={`Select option ${option.label}`}
                              />
                            </td>
                          )}
                          <td className="px-3 py-2.5 text-center text-[11px] font-bold text-muted-foreground">
                            {option.displayOrder}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={cn(
                                "font-bold",
                                option.status === "Active"
                                  ? "text-foreground"
                                  : "text-muted-foreground line-through decoration-muted-foreground/40",
                              )}
                            >
                              {option.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                                option.status === "Active"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-100 text-slate-500",
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  option.status === "Active" ? "bg-emerald-500" : "bg-slate-400",
                                )}
                              />
                              {option.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            {canEdit ? (
                              <div className="flex items-center justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      title={`Actions for ${option.label}`}
                                      aria-label={`Actions for ${option.label}`}
                                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-36 text-xs font-semibold bg-white shadow-md">
                                    <DropdownMenuItem
                                      onClick={() => openEditOption(option)}
                                      className="gap-2 cursor-pointer"
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-primary" />
                                      <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setStatusTarget({
                                          fieldKey: selectedField.key,
                                          code: option.code,
                                        })
                                      }
                                      className={cn(
                                        "gap-2 cursor-pointer",
                                        option.status === "Active"
                                          ? "text-rose-600 focus:text-rose-600"
                                          : "text-emerald-600 focus:text-emerald-600",
                                      )}
                                    >
                                      {option.status === "Active" ? (
                                        <>
                                          <Power className="h-3.5 w-3.5 text-rose-600" />
                                          <span>Deactivate</span>
                                        </>
                                      ) : (
                                        <>
                                          <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                                          <span>Activate</span>
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setDeleteType("options");
                                        setDeleteTargetCodes([option.code]);
                                        setDeleteConfirmOpen(true);
                                      }}
                                      className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ) : (
                              <span className="block text-right text-[10px] text-muted-foreground">
                                View only
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredOptions.length === 0 && (
                        <tr className="border-t border-border/70">
                          <td colSpan={canEdit ? 5 : 4} className="px-3 py-10 text-center">
                            <Search className="mx-auto mb-2 h-5 w-5 text-muted-foreground/50" />
                            <p className="text-xs font-semibold text-muted-foreground">
                              No options match your search.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {rangeEditorError && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10.5px] font-semibold text-rose-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{rangeEditorError}</span>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[440px] border-collapse text-left">
                    <thead>
                      <tr className="bg-muted/35 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        <th className="w-14 px-3 py-2.5 text-center">#</th>
                        <th className="px-3 py-2.5">Minimum</th>
                        <th className="px-3 py-2.5">Maximum</th>
                        <th className="w-32 px-3 py-2.5">Unit</th>
                        <th className="w-28 px-3 py-2.5">Status</th>
                        <th className="w-16 px-3 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border/70 text-[12px] transition-colors hover:bg-muted/20">
                        <td className="px-3 py-2.5 text-center text-[11px] font-bold text-muted-foreground">
                          1
                        </td>
                        <td className="px-3 py-2.5 font-bold text-foreground">
                          {selectedRangeDraft.minValue.trim()
                            ? formatRangeValue(
                                parseOptionalNumber(selectedRangeDraft.minValue),
                                selectedField.unit,
                              )
                            : "No limit"}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-foreground">
                          {selectedRangeDraft.maxValue.trim()
                            ? formatRangeValue(
                                parseOptionalNumber(selectedRangeDraft.maxValue),
                                selectedField.unit,
                              )
                            : "No limit"}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground font-medium">
                          {selectedField.unit ?? "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                              selectedField.status === "Active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-100 text-slate-500",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                selectedField.status === "Active"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400",
                              )}
                            />
                            {selectedField.status ?? "Active"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {canEdit ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer ml-auto"
                                  aria-label="More actions"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36 text-xs font-semibold bg-white shadow-md">
                                <DropdownMenuItem
                                  onClick={openAddRange}
                                  className="gap-2 cursor-pointer"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-primary" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toggleSingleFieldStatus(selectedField.key)}
                                  className="gap-2 cursor-pointer"
                                >
                                  {selectedField.status === "Active" ? (
                                    <>
                                      <Power className="h-3.5 w-3.5 text-rose-600" />
                                      <span>Disable</span>
                                    </>
                                  ) : (
                                    <>
                                      <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                                      <span>Enable</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDeleteType("range");
                                    setDeleteConfirmOpen(true);
                                  }}
                                  className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="block text-right text-[10px] text-muted-foreground">View only</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-slate-50/70 px-3.5 py-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#243D95]" />
                  <div className="text-[11px] leading-relaxed text-muted-foreground">
                    <p className="font-bold text-foreground">Applied by scheme rules</p>
                    <p className="mt-0.5">
                      These limits are evaluated by Scheme Eligibility Rules. Numeric fields are
                      intentionally not converted into ordinary dropdown options.
                    </p>
                    {selectedField.key === "age" && (
                      <p className="mt-1.5">
                        Age is derived from the applicant&apos;s date of birth before the range is
                        checked.
                      </p>
                    )}
                    {selectedField.key === "disabilityPercentage" && (
                      <p className="mt-1.5">
                        Disability Percentage is only considered when Disability Status is Yes.
                      </p>
                    )}
                    {selectedField.key === "annualIncome" && (
                      <p className="mt-1.5">
                        Income is captured as an annual amount in Indian Rupees.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border/70 bg-slate-50/80 px-3.5 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[11px] font-extrabold text-foreground">Usage</p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">
                  {selectedField.usage}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <DialogContent className="gap-0 overflow-hidden bg-white p-0 sm:max-w-[460px]">
          {editor && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveOption();
              }}
            >
              <DialogHeader className="border-b border-border/80 px-5 pb-4 pt-5 text-left">
                <DialogTitle className="text-base font-extrabold">
                  {editor.mode === "add" ? "Add Option" : "Edit Option"}
                </DialogTitle>
                <DialogDescription className="text-[11px]">
                  {selectedField.label} · standard eligibility master values
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 px-5 py-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    Option Label <span className="text-rose-600">*</span>
                  </label>
                  <input
                    autoFocus
                    value={editor.label}
                    onChange={(event) =>
                      setEditor((prev) => (prev ? { ...prev, label: event.target.value } : prev))
                    }
                    placeholder="e.g. Male"
                    className={inputClass}
                  />
                  {editorAttempted && editorErrors.label && (
                    <p className="text-[10px] font-semibold text-rose-600">{editorErrors.label}</p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Display Order <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={editor.displayOrder}
                      onChange={(event) =>
                        setEditor((prev) =>
                          prev ? { ...prev, displayOrder: event.target.value } : prev,
                        )
                      }
                      className={inputClass}
                    />
                    {editorAttempted && editorErrors.displayOrder && (
                      <p className="text-[10px] font-semibold text-rose-600">
                        {editorErrors.displayOrder}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Status
                    </label>
                    <select
                      value={editor.status}
                      onChange={(event) =>
                        setEditor((prev) =>
                          prev
                            ? {
                                ...prev,
                                status: event.target.value as EligibilityMasterOptionStatus,
                              }
                            : prev,
                        )
                      }
                      className={cn(inputClass, "cursor-pointer")}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-border/80 bg-white px-5 py-3 sm:flex-row sm:justify-end sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setEditor(null)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-[12px] font-bold text-foreground transition-colors hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-[12px] font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  Save Option
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(rangeEditor)}
        onOpenChange={(open) => {
          if (!open) setRangeEditor(null);
        }}
      >
        <DialogContent className="gap-0 overflow-hidden bg-white p-0 sm:max-w-[460px]">
          {rangeEditor && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveRange();
              }}
            >
              <DialogHeader className="border-b border-border/80 px-5 pb-4 pt-5 text-left">
                <DialogTitle className="text-base font-extrabold">Add Range</DialogTitle>
                <DialogDescription className="text-[11px]">
                  {selectedField.label} · numeric validation range
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 px-5 py-4">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Set the minimum and maximum values used when this field is evaluated in scheme
                  eligibility rules. Leave a value blank when no limit is required.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Minimum
                    </label>
                    <input
                      autoFocus
                      type="number"
                      min={0}
                      step="any"
                      value={rangeEditor.minValue}
                      onChange={(event) =>
                        setRangeEditor((prev) =>
                          prev ? { ...prev, minValue: event.target.value } : prev,
                        )
                      }
                      placeholder="No limit"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Maximum
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={rangeEditor.maxValue}
                      onChange={(event) =>
                        setRangeEditor((prev) =>
                          prev ? { ...prev, maxValue: event.target.value } : prev,
                        )
                      }
                      placeholder="No limit"
                      className={inputClass}
                    />
                  </div>
                </div>
                {rangeEditorAttempted && rangeEditorError && (
                  <p className="text-[10px] font-semibold text-rose-600">{rangeEditorError}</p>
                )}
              </div>

              <DialogFooter className="border-t border-border/80 bg-white px-5 py-3 sm:flex-row sm:justify-end sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setRangeEditor(null)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-white px-4 text-[12px] font-bold text-foreground transition-colors hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-[12px] font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  Save Range
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
      >
        <DialogContent className="gap-0 overflow-hidden bg-white p-0 sm:max-w-[430px]">
          {statusTargetOption && (
            <>
              <DialogHeader className="border-b border-border/80 px-5 pb-4 pt-5 text-left">
                <div
                  className={cn(
                    "mb-2 grid h-9 w-9 place-items-center rounded-full",
                    statusIsActive ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600",
                  )}
                >
                  {statusIsActive ? (
                    <Power className="h-4 w-4" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                </div>
                <DialogTitle className="text-base font-extrabold">
                  {statusIsActive ? "Deactivate option?" : "Activate option?"}
                </DialogTitle>
                <DialogDescription className="text-[11px] leading-relaxed">
                  {statusIsActive
                    ? `"${statusTargetOption.label}" will be hidden from new selections but preserved in historical applicant and scheme records.`
                    : `"${statusTargetOption.label}" will become selectable again in new eligibility selections.`}
                </DialogDescription>
              </DialogHeader>

              {statusIsActive && (
                <div className="px-5 py-3.5">
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10.5px] font-semibold text-amber-900">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      This option may be referenced by active scheme eligibility rules. Existing
                      references and applicant answers will not be deleted.
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter className="border-t border-border/80 bg-white px-5 py-3 sm:flex-row sm:justify-end sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setStatusTarget(null)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-[12px] font-bold text-foreground transition-colors hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-lg px-4 text-[12px] font-bold text-white shadow-2xs transition-colors cursor-pointer",
                    statusIsActive
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-emerald-600 hover:bg-emerald-700",
                  )}
                >
                  {statusIsActive ? "Deactivate" : "Activate"}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create New Eligibility Field Dialog */}
      <Dialog open={createFieldOpen} onOpenChange={setCreateFieldOpen}>
        <DialogContent className="gap-0 overflow-hidden bg-white p-0 sm:max-w-[500px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateField();
            }}
          >
            <DialogHeader className="border-b border-border/80 px-5 pb-4 pt-5 text-left">
              <DialogTitle className="text-base font-extrabold">
                Create New Eligibility Field
              </DialogTitle>
              <DialogDescription className="text-[11px]">
                Add a new master field for scheme eligibility evaluations and applicant data.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 px-5 py-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Field Label <span className="text-rose-600">*</span>
                </label>
                <input
                  autoFocus
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="e.g. Land Holding Size"
                  className={inputClass}
                />
                {createFieldAttempted && !newFieldLabel.trim() && (
                  <p className="text-[10px] font-semibold text-rose-600">
                    Field label is required.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Field Input Type
                </label>
                <select
                  value={newFieldKind}
                  onChange={(e) =>
                    setNewFieldKind(e.target.value as EligibilityMasterFieldKind)
                  }
                  className={cn(inputClass, "cursor-pointer")}
                >
                  <option value="options">Dropdown Options (Multiple allowed choices)</option>
                  <option value="yesno">Yes / No Binary Selection</option>
                  <option value="number">Numeric Range (Whole number / Count / Slabs)</option>
                  <option value="currency">Currency Range (Income / Financial Slabs in ₹)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Description
                </label>
                <input
                  value={newFieldDescription}
                  onChange={(e) => setNewFieldDescription(e.target.value)}
                  placeholder="e.g. Manage allowed land holding options for eligibility."
                  className={inputClass}
                />
              </div>

              {(newFieldKind === "number" || newFieldKind === "currency") && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    Measurement Unit (Optional)
                  </label>
                  <input
                    value={newFieldUnit}
                    onChange={(e) => setNewFieldUnit(e.target.value)}
                    placeholder={newFieldKind === "currency" ? "INR per year" : "e.g. Acres, Years, Score"}
                    className={inputClass}
                  />
                </div>
              )}

              {newFieldKind === "options" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    Initial Options (Comma or newline separated)
                  </label>
                  <textarea
                    rows={3}
                    value={newFieldOptionsRaw}
                    onChange={(e) => setNewFieldOptionsRaw(e.target.value)}
                    placeholder={"Marginal (< 1 Acre)\nSmall (1 - 2 Acres)\nMedium (2 - 5 Acres)\nLarge (> 5 Acres)"}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-semibold text-foreground transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Leave blank to start with default placeholder options, which you can edit afterwards.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-border/80 bg-white px-5 py-3 sm:flex-row sm:justify-end sm:space-x-2">
              <button
                type="button"
                onClick={() => setCreateFieldOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-[12px] font-bold text-foreground transition-colors hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-[12px] font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90 cursor-pointer"
              >
                Create Field
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="gap-0 overflow-hidden bg-white p-0 sm:max-w-[440px]">
          <DialogHeader className="border-b border-border/80 px-5 pb-4 pt-5 text-left">
            <div className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-rose-50 text-rose-600">
              <Trash2 className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-extrabold">
              {deleteType === "fields"
                ? `Delete ${deleteTargetFieldKeys.length} Eligibility Field(s)?`
                : deleteType === "range"
                  ? `Clear Range Limits for "${selectedField.label}"?`
                  : `Delete ${deleteTargetCodes.length} Option(s)?`}
            </DialogTitle>
            <DialogDescription className="text-[11px] leading-relaxed">
              {deleteType === "fields" ? (
                <>
                  Are you sure you want to permanently delete the selected field(s)? This will remove them from the eligibility masters sidebar.
                </>
              ) : deleteType === "range" ? (
                <>
                  Are you sure you want to clear the validation range limits for &ldquo;{selectedField.label}&rdquo;?
                </>
              ) : (
                <>
                  Are you sure you want to delete the selected option(s) from &ldquo;{selectedField.label}&rdquo;?
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 py-3.5">
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-[10.5px] font-semibold text-rose-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
              <span>
                {deleteType === "fields"
                  ? "Deleted fields will no longer be available in eligibility criteria or new scheme configurations."
                  : deleteType === "range"
                    ? "Schemes using this field will have no minimum or maximum bounds evaluated until configured again."
                    : "Active schemes using these options may require updating if their eligibility criteria rely on them."}
              </span>
            </div>
          </div>

          <DialogFooter className="border-t border-border/80 bg-white px-5 py-3 sm:flex-row sm:justify-end sm:space-x-2">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteTargetCodes([]);
                setDeleteTargetFieldKeys([]);
                setDeleteType(null);
              }}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-[12px] font-bold text-foreground transition-colors hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={
                deleteType === "fields"
                  ? handleConfirmDeleteFields
                  : deleteType === "range"
                    ? handleConfirmDeleteRange
                    : handleConfirmDeleteOptions
              }
              className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-600 px-4 text-[12px] font-bold text-white shadow-2xs transition-colors hover:bg-rose-700 cursor-pointer"
            >
              {deleteType === "range" ? "Clear Limits" : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
