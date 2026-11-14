export type EligibilityMasterOptionStatus = "Active" | "Inactive";

export interface EligibilityMasterOption {
  label: string;
  code: string;
  status: EligibilityMasterOptionStatus;
  displayOrder: number;
}

export interface EligibilityMasterNumericConfig {
  minValue?: number;
  maxValue?: number;
}

export type EligibilityMasterFieldKind = "options" | "yesno" | "number" | "currency";

export interface EligibilityMasterField {
  key: string;
  label: string;
  description: string;
  kind: EligibilityMasterFieldKind;
  options: EligibilityMasterOption[];
  minValue?: number;
  maxValue?: number;
  placeholder?: string;
  unit?: string;
  configLabel?: string;
  usage: string;
  dependsOn?: string;
}

export const ELIGIBILITY_MASTER_STORAGE_KEY = "vikasita_eligibility_master_v1";

const option = (
  label: string,
  code: string,
  displayOrder: number,
  status: EligibilityMasterOptionStatus = "Active",
): EligibilityMasterOption => ({ label, code, status, displayOrder });

const yesNoOptions = (): EligibilityMasterOption[] => [
  option("Yes", "YES", 1),
  option("No", "NO", 2),
];

const DEFAULT_USAGE = "Used in eligibility rules and applicant data collection across schemes.";

export const ELIGIBILITY_MASTER_FIELDS: EligibilityMasterField[] = [
  {
    key: "gender",
    label: "Gender",
    description: "Manage allowed gender options for eligibility.",
    kind: "options",
    usage: DEFAULT_USAGE,
    options: [
      option("Male", "MALE", 1),
      option("Female", "FEMALE", 2),
      option("Others", "OTHERS", 3),
    ],
  },
  {
    key: "age",
    label: "Age",
    description: "Numeric age range used when age is evaluated in scheme eligibility rules.",
    kind: "number",
    usage: DEFAULT_USAGE,
    minValue: 0,
    maxValue: 120,
    placeholder: "e.g. 18",
    unit: "Years",
    configLabel: "Configuration (Between / Range)",
    options: [],
  },
  {
    key: "religion",
    label: "Religion",
    description: "Manage the standard religion values available to applicants and scheme rules.",
    kind: "options",
    usage: DEFAULT_USAGE,
    options: [
      option("Hinduism", "HINDUISM", 1),
      option("Islam", "ISLAM", 2),
      option("Christianity", "CHRISTIANITY", 3),
      option("Sikhism", "SIKHISM", 4),
      option("Buddhism", "BUDDHISM", 5),
      option("Jainism", "JAINISM", 6),
      option("Other", "OTHER", 7),
      option("Prefer Not to Disclose / Unknown", "PREFER_NOT_TO_DISCLOSE", 8),
    ],
  },
  {
    key: "caste",
    label: "Caste / Social Category",
    description: "Manage social category values used in eligibility checks.",
    kind: "options",
    usage: DEFAULT_USAGE,
    options: [
      option("General / Unreserved", "GENERAL_UNRESERVED", 1),
      option("SC", "SC", 2),
      option("ST", "ST", 3),
      option("OBC", "OBC", 4),
      option("Other", "OTHER", 5),
    ],
  },
  {
    key: "disabilityStatus",
    label: "Disability Status",
    description: "Yes/No status that controls disability percentage collection.",
    kind: "yesno",
    usage: DEFAULT_USAGE,
    options: yesNoOptions(),
  },
  {
    key: "disabilityPercentage",
    label: "Disability Percentage",
    description: "Percentage range applied when disability status is Yes.",
    kind: "number",
    usage: DEFAULT_USAGE,
    minValue: 0,
    maxValue: 100,
    placeholder: "e.g. 40",
    unit: "Percent",
    configLabel: "Range / Predefined",
    dependsOn: "Shown only when Disability Status is Yes.",
    options: [],
  },
  {
    key: "minorityStatus",
    label: "Minority Status",
    description: "Yes/No minority community status used in eligibility checks.",
    kind: "yesno",
    usage: DEFAULT_USAGE,
    options: yesNoOptions(),
  },
  {
    key: "studentStatus",
    label: "Student Status",
    description: "Yes/No student status; controls whether employment questions are asked.",
    kind: "yesno",
    usage: DEFAULT_USAGE,
    dependsOn:
      "When Student Status is Yes, Employment Status and Occupation are skipped in the citizen questionnaire.",
    options: yesNoOptions(),
  },
  {
    key: "employmentStatus",
    label: "Employment Status",
    description: "Manage employment status values. Occupation options depend on this value.",
    kind: "options",
    usage: DEFAULT_USAGE,
    options: [
      option("Employed", "EMPLOYED", 1),
      option("Unemployed", "UNEMPLOYED", 2),
      option("Self-Employed", "SELF_EMPLOYED", 3),
      option("Retired", "RETIRED", 4),
      option("Not in Labour Force", "NOT_IN_LABOUR_FORCE", 5),
      option("Other", "OTHER", 6),
    ],
  },
  {
    key: "occupation",
    label: "Occupation",
    description: "Manage occupation options grouped by employment status.",
    kind: "options",
    usage: DEFAULT_USAGE,
    dependsOn:
      "Grouped by Employment Status: Employed, Self-Employed, and Unemployed / Current Situation.",
    options: [
      option("Farmer", "FARMER", 1),
      option("Agricultural Labourer", "AGRICULTURAL_LABOURER", 2),
      option("Daily Wage Worker", "DAILY_WAGE_WORKER", 3),
      option("Construction Worker", "CONSTRUCTION_WORKER", 4),
      option("Fisherperson", "FISHERPERSON", 5),
      option("Artisan / Craftsperson", "ARTISAN_CRAFTPERSON", 6),
      option("Street Vendor", "STREET_VENDOR", 7),
      option("Small Business Owner", "SMALL_BUSINESS_OWNER", 8),
      option("Salaried Employee", "SALARIED_EMPLOYEE", 9),
      option("Government Employee", "GOVERNMENT_EMPLOYEE", 10),
      option("Homemaker", "HOMEMAKER", 11),
      option("Student", "STUDENT", 12),
      option("Other", "OTHER", 13),
    ],
  },
  {
    key: "annualIncome",
    label: "Annual Family Income",
    description: "Currency-based annual family income range used in scheme eligibility rules.",
    kind: "currency",
    usage: DEFAULT_USAGE,
    minValue: 0,
    placeholder: "e.g. 100000",
    unit: "INR per year",
    configLabel: "Range / Slabs",
    options: [],
  },
  {
    key: "maritalStatus",
    label: "Marital Status",
    description: "Manage standard marital status values.",
    kind: "options",
    usage: DEFAULT_USAGE,
    options: [
      option("Never Married / Single", "NEVER_MARRIED_SINGLE", 1),
      option("Married", "MARRIED", 2),
      option("Widowed", "WIDOWED", 3),
      option("Divorced", "DIVORCED", 4),
      option("Separated", "SEPARATED", 5),
      option("Other / Not Specified", "OTHER_NOT_SPECIFIED", 6),
    ],
  },
  {
    key: "householdStatus",
    label: "Household Status",
    description: "Manage household role values used in applicant profiles.",
    kind: "options",
    usage: DEFAULT_USAGE,
    options: [
      option("Head of Household", "HEAD_OF_HOUSEHOLD", 1),
      option("Spouse of Head", "SPOUSE_OF_HEAD", 2),
      option("Dependent Family Member", "DEPENDENT_FAMILY_MEMBER", 3),
      option("Other Adult Household Member", "OTHER_ADULT_HOUSEHOLD_MEMBER", 4),
      option("Single-Person Household", "SINGLE_PERSON_HOUSEHOLD", 5),
      option("Other", "OTHER", 6),
    ],
  },
  {
    key: "bplStatus",
    label: "BPL Status",
    description: "Yes/No Below Poverty Line status used in eligibility checks.",
    kind: "yesno",
    usage: DEFAULT_USAGE,
    options: yesNoOptions(),
  },
];

const isOptionStatus = (value: unknown): value is EligibilityMasterOptionStatus =>
  value === "Active" || value === "Inactive";

const sanitizeNumericConfig = (value: unknown): EligibilityMasterNumericConfig | null => {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<EligibilityMasterNumericConfig>;
  const minValue =
    typeof candidate.minValue === "number" && Number.isFinite(candidate.minValue)
      ? Math.max(0, candidate.minValue)
      : undefined;
  const maxValue =
    typeof candidate.maxValue === "number" && Number.isFinite(candidate.maxValue)
      ? Math.max(0, candidate.maxValue)
      : undefined;

  if (minValue === undefined && maxValue === undefined) return null;
  return { minValue, maxValue };
};

const sanitizeStoredOptions = (value: unknown): EligibilityMasterOption[] | null => {
  if (!Array.isArray(value)) return null;

  const options: EligibilityMasterOption[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const candidate = item as Partial<EligibilityMasterOption>;
    if (typeof candidate.label !== "string" || !candidate.label.trim()) return null;
    if (typeof candidate.code !== "string" || !candidate.code.trim()) return null;
    if (!isOptionStatus(candidate.status)) return null;
    if (typeof candidate.displayOrder !== "number" || !Number.isFinite(candidate.displayOrder)) {
      return null;
    }

    options.push({
      label: candidate.label.trim(),
      code: candidate.code.trim().toUpperCase(),
      status: candidate.status,
      displayOrder: Math.max(1, Math.round(candidate.displayOrder)),
    });
  }

  return options.length > 0 ? options : null;
};

const cloneOption = (item: EligibilityMasterOption): EligibilityMasterOption => ({ ...item });

export function cloneEligibilityMasterFields(
  fields: EligibilityMasterField[] = ELIGIBILITY_MASTER_FIELDS,
): EligibilityMasterField[] {
  return fields.map((field) => ({
    ...field,
    options: field.options.map(cloneOption),
  }));
}

export function loadEligibilityMasterOptions(): Record<string, EligibilityMasterOption[]> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(ELIGIBILITY_MASTER_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as { options?: Record<string, unknown> } | null;
    if (!parsed || typeof parsed !== "object" || !parsed.options) return {};

    const result: Record<string, EligibilityMasterOption[]> = {};
    for (const field of ELIGIBILITY_MASTER_FIELDS) {
      if (field.kind !== "options" && field.kind !== "yesno") continue;
      const stored = sanitizeStoredOptions(parsed.options[field.key]);
      if (stored) result[field.key] = stored;
    }
    return result;
  } catch {
    return {};
  }
}

export function loadEligibilityMasterNumericConfigs(): Record<
  string,
  EligibilityMasterNumericConfig
> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(ELIGIBILITY_MASTER_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as { numericConfigs?: Record<string, unknown> } | null;
    if (!parsed || typeof parsed !== "object" || !parsed.numericConfigs) return {};

    const result: Record<string, EligibilityMasterNumericConfig> = {};
    for (const field of ELIGIBILITY_MASTER_FIELDS) {
      if (field.kind !== "number" && field.kind !== "currency") continue;
      const stored = sanitizeNumericConfig(parsed.numericConfigs[field.key]);
      if (stored) result[field.key] = stored;
    }
    return result;
  } catch {
    return {};
  }
}

export function getEligibilityMasterFields(): EligibilityMasterField[] {
  const stored = loadEligibilityMasterOptions();
  const numericConfigs = loadEligibilityMasterNumericConfigs();
  return ELIGIBILITY_MASTER_FIELDS.map((field) => ({
    ...field,
    options: (stored[field.key] ?? field.options).map(cloneOption),
    ...(numericConfigs[field.key] ?? {}),
  }));
}

export function saveEligibilityMasterOptions(
  options: Record<string, EligibilityMasterOption[]>,
  numericConfigs: Record<string, EligibilityMasterNumericConfig> = {},
): void {
  if (typeof window === "undefined") return;

  const persisted: Record<string, EligibilityMasterOption[]> = {};
  const persistedNumericConfigs: Record<string, EligibilityMasterNumericConfig> = {};
  for (const field of ELIGIBILITY_MASTER_FIELDS) {
    if (field.kind === "options" || field.kind === "yesno") {
      if (options[field.key]) persisted[field.key] = options[field.key].map(cloneOption);
      continue;
    }

    const numericConfig = sanitizeNumericConfig(numericConfigs[field.key]);
    if (numericConfig) persistedNumericConfigs[field.key] = numericConfig;
  }

  window.localStorage.setItem(
    ELIGIBILITY_MASTER_STORAGE_KEY,
    JSON.stringify({ version: 2, options: persisted, numericConfigs: persistedNumericConfigs }),
  );
}
