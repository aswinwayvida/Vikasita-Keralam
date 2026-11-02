import {
  assignmentLevels,
  permissionModules,
  roleOrganisationLevels,
  rolePresets,
  type AssignmentLevel,
  type RolePresetId,
} from "./party-workers";

export interface CustomOrganisationLevel {
  id: AssignmentLevel;
  name: string;
  under: AssignmentLevel;
}

export const customOrganisationLevelStorageKey = "vk-custom-organisation-levels";

export function loadCustomOrganisationLevels(): CustomOrganisationLevel[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(customOrganisationLevelStorageKey) || "[]",
    ) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CustomOrganisationLevel =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as CustomOrganisationLevel).id === "string" &&
        typeof (item as CustomOrganisationLevel).name === "string" &&
        Boolean((item as CustomOrganisationLevel).name.trim()) &&
        typeof (item as CustomOrganisationLevel).under === "string",
    );
  } catch {
    return [];
  }
}

export function saveCustomOrganisationLevels(levels: CustomOrganisationLevel[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(customOrganisationLevelStorageKey, JSON.stringify(levels));
  } catch {
    // Persistence is best-effort in this prototype.
  }
}

export function createCustomOrganisationLevelId(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
  return `custom_org_${slug || "level"}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}` as AssignmentLevel;
}

export function organisationLevelLabel(
  level: AssignmentLevel,
  lang: "en" | "ml",
  customLevels: CustomOrganisationLevel[] = [],
) {
  const custom = customLevels.find((item) => item.id === level);
  if (custom) return custom.name;
  const roleLevel = roleOrganisationLevels.find((item) => item.id === level);
  if (roleLevel) return lang === "ml" ? roleLevel.ml : roleLevel.en;
  const option = assignmentLevels.find((item) => item.id === level);
  return option ? (lang === "ml" ? option.ml : option.en) : level;
}

export type ManagedRoleStatus = "Active" | "Inactive";

export type AdministrativePermissionId = "manage_roles" | "assign_access" | "delegate_access";

export interface AdministrativePermissionOption {
  id: AdministrativePermissionId;
  en: string;
  ml: string;
  descriptionEn: string;
  descriptionMl: string;
}

export const administrativePermissionOptions: AdministrativePermissionOption[] = [
  {
    id: "manage_roles",
    en: "Role management",
    ml: "റോൾ മാനേജ്മെന്റ്",
    descriptionEn: "Create, edit, duplicate and deactivate custom roles.",
    descriptionMl: "കസ്റ്റം റോളുകൾ സൃഷ്ടിക്കാം, തിരുത്താം, പകർത്താം, നിർജ്ജീവമാക്കാം.",
  },
  {
    id: "assign_access",
    en: "Access assignment",
    ml: "ആക്സസ് അസൈൻമെന്റ്",
    descriptionEn: "Assign roles and access areas to users.",
    descriptionMl: "ഉപയോക്താക്കൾക്ക് റോളുകളും ആക്സസ് പ്രദേശങ്ങളും നൽകാം.",
  },
  {
    id: "delegate_access",
    en: "Access delegation",
    ml: "ആക്സസ് ഡെലിഗേഷൻ",
    descriptionEn: "Grant access-management authority to other administrators.",
    descriptionMl: "മറ്റ് അഡ്മിനിസ്ട്രേറ്റർമാർക്ക് ആക്സസ് മാനേജ്മെന്റ് അധികാരം നൽകാം.",
  },
];

export interface ManagedRole {
  id: string;
  name: string;
  description: string;
  assignmentLevels: AssignmentLevel[];
  permissions: string[];
  administrativePermissions: AdministrativePermissionId[];
  status: ManagedRoleStatus;
  system: boolean;
  presetId?: RolePresetId;
  assignedUsers: number;
  assignedWorkerIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleDraft {
  name: string;
  description: string;
  assignmentLevels: AssignmentLevel[];
  permissions: string[];
  administrativePermissions: AdministrativePermissionId[];
  status: ManagedRoleStatus;
}

export const emptyRoleDraft: RoleDraft = {
  name: "",
  description: "",
  assignmentLevels: [],
  permissions: [],
  administrativePermissions: [],
  status: "Active",
};

export function draftFromRole(role: ManagedRole, name = role.name): RoleDraft {
  return {
    name,
    description: role.description,
    assignmentLevels: [...role.assignmentLevels],
    permissions: [...role.permissions],
    administrativePermissions: [...role.administrativePermissions],
    status: role.status,
  };
}

export function nextRoleCopyName(name: string, roles: ManagedRole[]) {
  const base = `${name} (copy)`;
  if (!roles.some((role) => role.name.toLowerCase() === base.toLowerCase())) return base;
  let index = 2;
  while (roles.some((role) => role.name.toLowerCase() === `${base} ${index}`.toLowerCase())) {
    index += 1;
  }
  return `${base} ${index}`;
}

export function createRoleId() {
  return `role_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface BuiltInRoleSeed {
  presetId: Exclude<RolePresetId, "custom">;
  assignmentLevels: AssignmentLevel[];
  administrativePermissions: AdministrativePermissionId[];
  assignedUsers: number;
}

const builtInRoleSeeds: BuiltInRoleSeed[] = [
  {
    presetId: "state_admin",
    assignmentLevels: ["state"],
    administrativePermissions: ["manage_roles", "assign_access", "delegate_access"],
    assignedUsers: 4,
  },
  {
    presetId: "district_admin",
    assignmentLevels: ["district"],
    administrativePermissions: ["assign_access"],
    assignedUsers: 14,
  },
  {
    presetId: "constituency_admin",
    assignmentLevels: ["assembly_constituency"],
    administrativePermissions: ["assign_access"],
    assignedUsers: 42,
  },
  {
    presetId: "local_body_admin",
    assignmentLevels: ["local_body"],
    administrativePermissions: ["assign_access"],
    assignedUsers: 118,
  },
  {
    presetId: "booth_admin",
    assignmentLevels: ["booth"],
    administrativePermissions: [],
    assignedUsers: 326,
  },
  {
    presetId: "party_worker",
    assignmentLevels: ["ward", "booth", "org_unit"],
    administrativePermissions: [],
    assignedUsers: 1284,
  },
];

const roleTimestamp = "2024-01-01T00:00:00.000Z";

export const builtInManagedRoles: ManagedRole[] = builtInRoleSeeds.map((seed) => {
  const preset = rolePresets.find((item) => item.id === seed.presetId)!;
  return {
    id: `system_${seed.presetId}`,
    name: preset.en,
    description: preset.descriptionEn,
    assignmentLevels: seed.assignmentLevels,
    permissions: preset.permissions,
    administrativePermissions: seed.administrativePermissions,
    status: "Active",
    system: true,
    presetId: seed.presetId,
    assignedUsers: seed.assignedUsers,
    createdAt: roleTimestamp,
    updatedAt: roleTimestamp,
  };
});

export const managedRoleStorageKey = "vk-managed-roles";

const validPermissionKeys = new Set(
  permissionModules.flatMap((module) =>
    module.actions.map((action) => `${module.id}.${action.id}`),
  ),
);

const sanitizeRole = (role: ManagedRole): ManagedRole => ({
  ...role,
  permissions: (role.permissions ?? []).filter((key) => validPermissionKeys.has(key)),
});

export function loadManagedRoles(): ManagedRole[] {
  if (typeof window === "undefined") return builtInManagedRoles.map(sanitizeRole);
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(managedRoleStorageKey) || "[]",
    ) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return builtInManagedRoles.map(sanitizeRole);
    }
    return (parsed as ManagedRole[]).map(sanitizeRole);
  } catch {
    return builtInManagedRoles.map(sanitizeRole);
  }
}

export function saveManagedRoles(roles: ManagedRole[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(managedRoleStorageKey, JSON.stringify(roles));
  } catch {
    // Persistence is best-effort in this prototype.
  }
}
