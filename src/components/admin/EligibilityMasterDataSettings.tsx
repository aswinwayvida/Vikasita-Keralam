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
  Percent,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

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
  saveEligibilityMasterOptions,
  type EligibilityMasterField,
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
    setDrafts((prev) => ({ ...prev, [fieldKey]: nextOptions }));
  };

  const selectField = (fieldKey: string) => {
    setSelectedKey(fieldKey);
    setOptionSearch("");
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

    setRangeDrafts((prev) => ({
      ...prev,
      [rangeEditor.fieldKey]: {
        minValue: rangeEditor.minValue.trim(),
        maxValue: rangeEditor.maxValue.trim(),
      },
    }));
    setRangeEditor(null);
    toast.success("Validation range added. Choose Save Changes to apply.");
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
      toast.success("Option added. Choose Save Changes to apply.");
    } else {
      updateDraftOptions(
        editor.fieldKey,
        fieldOptions.map((option) => (option.code === nextOption.code ? nextOption : option)),
      );
      toast.success("Option updated. Choose Save Changes to apply.");
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
        ? "Option activated. Choose Save Changes to apply."
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

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div className="border-b border-border/80 px-4 py-3.5">
            <h2 className="text-[15px] font-extrabold text-foreground">
              Eligibility Field Masters
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Configure option values for each eligibility field.
            </p>
          </div>

          <div className="space-y-0.5 p-2">
            {savedFields.map((field) => {
              const Icon = FIELD_ICONS[field.key] ?? Info;
              const active = field.key === selectedField.key;
              const fieldOptions = drafts[field.key] ?? field.options;
              return (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => selectField(field.key)}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors cursor-pointer",
                    active
                      ? "border-primary/45 bg-[#FFF4EA] shadow-2xs"
                      : "border-transparent hover:border-border hover:bg-muted/35",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                      active ? "bg-primary/15 text-primary" : "bg-muted/70 text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[12.5px] font-bold",
                      active ? "text-primary" : "text-foreground",
                    )}
                  >
                    {field.label}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-right text-[10.5px] font-semibold",
                      active ? "text-primary/85" : "text-muted-foreground",
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
              );
            })}
          </div>
        </aside>
        <section className="flex min-h-[580px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div className="border-b border-border/80 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FFF4EA] text-primary">
                  <SelectedIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold leading-tight text-foreground sm:text-xl">
                    {selectedField.label}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                    {selectedField.description}
                  </p>
                </div>
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={isOptionField ? openAddOption : openAddRange}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-[12px] font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  {isOptionField ? "Add Option" : "Add Range"}
                </button>
              )}
            </div>

            {selectedField.dependsOn && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#243D95]/15 bg-[#243D95]/5 px-3 py-2 text-[10.5px] font-semibold text-[#243D95]">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{selectedField.dependsOn}</span>
              </div>
            )}
          </div>

          <div className="flex-1 px-4 py-4 sm:px-5">
            {isOptionField ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-[15px] font-extrabold text-foreground">
                    Options ({currentOptions.length})
                  </h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      value={optionSearch}
                      onChange={(event) => setOptionSearch(event.target.value)}
                      placeholder="Search option..."
                      aria-label="Search options"
                      className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs font-medium text-foreground transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>

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
                        <th className="w-14 px-3 py-2.5 text-center">#</th>
                        <th className="px-3 py-2.5">Option Label</th>
                        <th className="w-28 px-3 py-2.5">Status</th>
                        <th className="w-24 px-3 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOptions.map((option) => (
                        <tr
                          key={option.code}
                          className="border-t border-border/70 text-[12px] transition-colors hover:bg-muted/20"
                        >
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
                          <td className="px-3 py-2.5">
                            {canEdit ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditOption(option)}
                                  title={`Edit ${option.label}`}
                                  aria-label={`Edit ${option.label}`}
                                  className="grid h-7 w-7 place-items-center rounded-md text-primary transition-colors hover:bg-primary/10 cursor-pointer"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setStatusTarget({
                                      fieldKey: selectedField.key,
                                      code: option.code,
                                    })
                                  }
                                  title={
                                    option.status === "Active"
                                      ? `Deactivate ${option.label}`
                                      : `Activate ${option.label}`
                                  }
                                  aria-label={
                                    option.status === "Active"
                                      ? `Deactivate ${option.label}`
                                      : `Activate ${option.label}`
                                  }
                                  className={cn(
                                    "grid h-7 w-7 place-items-center rounded-md transition-colors cursor-pointer",
                                    option.status === "Active"
                                      ? "text-rose-600 hover:bg-rose-50"
                                      : "text-emerald-600 hover:bg-emerald-50",
                                  )}
                                >
                                  {option.status === "Active" ? (
                                    <Power className="h-3.5 w-3.5" />
                                  ) : (
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  )}
                                </button>
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
                          <td colSpan={4} className="px-3 py-10 text-center">
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
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2">
                    <SelectedIcon className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-extrabold text-foreground">Validation settings</h3>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    This field uses a numeric value rather than a list of dropdown options.
                  </p>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-border/80 bg-card px-3 py-2.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        Input type
                      </p>
                      <p className="mt-1 text-[12px] font-bold text-foreground">
                        {selectedField.kind === "currency" ? "Currency" : "Whole number"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-card px-3 py-2.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        Minimum
                      </p>
                      <p className="mt-1 text-[12px] font-bold text-foreground">
                        {formatRangeValue(
                          parseOptionalNumber(selectedRangeDraft.minValue),
                          selectedField.unit,
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-card px-3 py-2.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        Maximum
                      </p>
                      <p className="mt-1 text-[12px] font-bold text-foreground">
                        {formatRangeValue(
                          parseOptionalNumber(selectedRangeDraft.maxValue),
                          selectedField.unit,
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-card px-3 py-2.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        Unit
                      </p>
                      <p className="mt-1 text-[12px] font-bold text-foreground">
                        {selectedField.unit ?? "—"}
                      </p>
                    </div>
                  </div>
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

          <div className="flex flex-col gap-2 border-t border-border/80 bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-h-4 text-[10.5px] font-semibold">
              {totalIssueCount > 0 ? (
                <span className="flex items-center gap-1.5 text-rose-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {totalIssueCount} validation {totalIssueCount === 1 ? "issue" : "issues"} to
                  resolve
                </span>
              ) : dirty ? (
                <span className="text-amber-600">Unsaved changes</span>
              ) : (
                <span className="text-muted-foreground">All changes saved</span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!dirty}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-lg border px-4 text-[12px] font-bold transition-colors",
                  dirty
                    ? "border-border bg-background text-foreground hover:bg-muted cursor-pointer"
                    : "cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground/60",
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                title={
                  !canEdit
                    ? "You do not have permission to edit master data."
                    : totalIssueCount > 0
                      ? "Resolve validation issues before saving."
                      : !dirty
                        ? "No unsaved changes."
                        : undefined
                }
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-lg px-5 text-[12px] font-bold transition-colors",
                  canSave
                    ? "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 cursor-pointer"
                    : "cursor-not-allowed bg-muted text-muted-foreground",
                )}
              >
                Save Changes
              </button>
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
    </div>
  );
}
