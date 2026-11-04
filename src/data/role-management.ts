import {
  assignmentLevels,
  partyDesignations,
  permissionPrerequisites,
  permissionModules,
  roleOrganisationLevels,
  rolePresets,
  togglePermission,
  type AssignmentLevel,
  type PartyDesignation,
  type PermissionModuleId,
  type RolePresetId,
} from "./party-workers";

export interface CustomOrganisationLevel {
  id: AssignmentLevel;
  name: string;
  under: AssignmentLevel;
}

export const customOrganisationLevelStorageKey = "vk-custom-organisation-levels";

const retiredOrganisationLevelNames = new Set(["dbjmn", "it cell"]);

export function isRetiredOrganisationLevelName(name: string) {
  return retiredOrganisationLevelNames.has(name.trim().toLowerCase().replace(/\s+/g, " "));
}

export function loadCustomOrganisationLevels(): CustomOrganisationLevel[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(customOrganisationLevelStorageKey) || "[]",
    ) as unknown;
    if (!Array.isArray(parsed)) return [];
    const levels = parsed.filter(
      (item): item is CustomOrganisationLevel =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as CustomOrganisationLevel).id === "string" &&
        typeof (item as CustomOrganisationLevel).name === "string" &&
        Boolean((item as CustomOrganisationLevel).name.trim()) &&
        typeof (item as CustomOrganisationLevel).under === "string",
    );
    const cleaned = levels.filter((level) => !isRetiredOrganisationLevelName(level.name));
    if (cleaned.length !== levels.length) {
      saveCustomOrganisationLevels(cleaned);
    }
    return cleaned;
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

export type DataAccessScope = "own_records" | "below_level" | "same_level" | "above_level";

export interface DataAccessOption {
  id: DataAccessScope;
  en: string;
  ml: string;
  shortEn: string;
  shortMl: string;
}

export const dataAccessOptions: DataAccessOption[] = [
  {
    id: "own_records",
    en: "Own Records",
    ml: "സ്വന്തം റെക്കോർഡുകൾ",
    shortEn: "Own",
    shortMl: "സ്വന്തം",
  },
  {
    id: "below_level",
    en: "Below My Level",
    ml: "എന്റെ തലത്തിന് താഴെ",
    shortEn: "Below",
    shortMl: "താഴെ",
  },
  {
    id: "same_level",
    en: "Same Level — Peers",
    ml: "ഒരേ തലം — സമപദവിക്കാർ",
    shortEn: "Peers",
    shortMl: "സമപദവി",
  },
  {
    id: "above_level",
    en: "Above My Level",
    ml: "എന്റെ തലത്തിന് മുകളിൽ",
    shortEn: "Above",
    shortMl: "മുകളിൽ",
  },
];

export type RoleDataAccess = Partial<Record<PermissionModuleId, DataAccessScope[]>>;

const dataAccessScopeIds = new Set<DataAccessScope>(dataAccessOptions.map((option) => option.id));

export function defaultRoleDataAccess(): RoleDataAccess {
  return Object.fromEntries(
    permissionModules.map((module) => [module.id, ["own_records"]]),
  ) as RoleDataAccess;
}

export function sanitizeRoleDataAccess(value: unknown): RoleDataAccess {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultRoleDataAccess();
  }
  const result: RoleDataAccess = {};
  for (const module of permissionModules) {
    const scopes = (value as Record<string, unknown>)[module.id];
    if (!Array.isArray(scopes)) {
      result[module.id] = ["own_records"];
      continue;
    }
    const selected = new Set(
      scopes.filter(
        (scope): scope is DataAccessScope =>
          typeof scope === "string" && dataAccessScopeIds.has(scope as DataAccessScope),
      ),
    );
    const ordered = dataAccessOptions
      .map((option) => option.id)
      .filter((scope) => selected.has(scope));
    result[module.id] = ordered;
  }
  return result;
}

export function cloneRoleDataAccess(value?: RoleDataAccess): RoleDataAccess {
  const sanitized = sanitizeRoleDataAccess(value);
  return Object.fromEntries(
    Object.entries(sanitized).map(([moduleId, scopes]) => [moduleId, [...(scopes ?? [])]]),
  ) as RoleDataAccess;
}

export function toggleRoleDataAccess(
  current: RoleDataAccess,
  moduleId: PermissionModuleId,
  scope: DataAccessScope,
): RoleDataAccess {
  const selected = new Set(current[moduleId] ?? []);
  if (selected.has(scope)) selected.delete(scope);
  else selected.add(scope);
  const ordered = dataAccessOptions
    .map((option) => option.id)
    .filter((optionId) => selected.has(optionId));
  const next = { ...current };
  next[moduleId] = ordered;
  return next;
}

export type PermissionMatrixColumnId = "create" | "view" | "edit" | "delete";

export const permissionMatrixColumnIds: PermissionMatrixColumnId[] = [
  "create",
  "view",
  "edit",
  "delete",
];

const permissionMatrixViewActionIds: Partial<Record<PermissionModuleId, string[]>> = {
  schemes: ["view_list", "view_details"],
};

export function getPermissionMatrixActionIds(
  moduleId: PermissionModuleId,
  columnId: PermissionMatrixColumnId,
): string[] {
  const module = permissionModules.find((item) => item.id === moduleId);
  if (!module) return [];
  if (columnId === "view") {
    const override = permissionMatrixViewActionIds[moduleId];
    if (override) {
      return override.filter((actionId) => module.actions.some((action) => action.id === actionId));
    }
  }
  return module.actions.filter((action) => action.id === columnId).map((action) => action.id);
}

const matrixActionIdsByModule = new Map<PermissionModuleId, Set<string>>(
  permissionModules.map((module) => [
    module.id,
    new Set(
      permissionMatrixColumnIds.flatMap((columnId) =>
        getPermissionMatrixActionIds(module.id, columnId),
      ),
    ),
  ]),
);

export function scopedPermissionKey(
  moduleId: PermissionModuleId,
  scope: DataAccessScope,
  actionId: string,
) {
  return `${moduleId}.${scope}.${actionId}`;
}

export const allScopedPermissionKeys = permissionModules.flatMap((module) =>
  dataAccessOptions.flatMap((scope) =>
    Array.from(matrixActionIdsByModule.get(module.id) ?? []).map((actionId) =>
      scopedPermissionKey(module.id, scope.id, actionId),
    ),
  ),
);

export const allScopedPermissionKeysWithExtras = permissionModules.flatMap((module) =>
  dataAccessOptions.flatMap((scope) =>
    module.actions.map((action) => scopedPermissionKey(module.id, scope.id, action.id)),
  ),
);

const validScopedPermissionKeys = new Set(allScopedPermissionKeysWithExtras);

export function sanitizeScopedPermissions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value.filter(
        (key): key is string => typeof key === "string" && validScopedPermissionKeys.has(key),
      ),
    ),
  );
}

function legacyScopedPermissions(
  permissions: string[],
  dataAccess: RoleDataAccess | undefined,
): string[] {
  const selectedPermissions = new Set(permissions);
  const selectedDataAccess = sanitizeRoleDataAccess(dataAccess);
  const result: string[] = [];
  for (const module of permissionModules) {
    const actionIds = matrixActionIdsByModule.get(module.id) ?? new Set<string>();
    const scopes = selectedDataAccess[module.id] ?? [];
    if (scopes.length === 0) continue;
    for (const actionId of actionIds) {
      if (!selectedPermissions.has(`${module.id}.${actionId}`)) continue;
      for (const scope of scopes) {
        result.push(scopedPermissionKey(module.id, scope, actionId));
      }
    }
  }
  return Array.from(new Set(result));
}

export function scopedPermissionsFromRole(role: {
  permissions?: string[] | null;
  dataAccess?: RoleDataAccess;
  scopedPermissions?: string[] | null;
}): string[] {
  if (Array.isArray(role.scopedPermissions)) {
    return sanitizeScopedPermissions(role.scopedPermissions);
  }
  return legacyScopedPermissions(role.permissions ?? [], role.dataAccess);
}

const moduleActionIds = new Map<PermissionModuleId, Set<string>>(
  permissionModules.map((module) => [
    module.id,
    new Set(module.actions.map((action) => action.id)),
  ]),
);

function isModulePermissionKey(key: string) {
  const separator = key.indexOf(".");
  if (separator === -1) return false;
  const moduleId = key.slice(0, separator) as PermissionModuleId;
  const actionId = key.slice(separator + 1);
  return moduleActionIds.get(moduleId)?.has(actionId) ?? false;
}

export function permissionsFromScopedPermissions(
  scopedPermissions: string[],
  currentPermissions: string[],
): string[] {
  const extras = currentPermissions.filter((key) => !isModulePermissionKey(key));
  const next = new Set(extras);
  for (const key of sanitizeScopedPermissions(scopedPermissions)) {
    const [moduleId, , actionId] = key.split(".");
    next.add(`${moduleId}.${actionId}`);
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const key of Array.from(next)) {
      const prerequisites = permissionPrerequisites[key] ?? [];
      if (prerequisites.some((prerequisite) => !next.has(prerequisite))) {
        next.delete(key);
        changed = true;
      }
    }
  }
  return Array.from(next);
}

export function toggleScopedPermission(
  current: string[],
  moduleId: PermissionModuleId,
  scope: DataAccessScope,
  columnId: PermissionMatrixColumnId,
  enabled: boolean,
): string[] {
  const actionIds = getPermissionMatrixActionIds(moduleId, columnId);
  if (actionIds.length === 0) return current;

  return actionIds.reduce(
    (next, actionId) => toggleScopedPermissionAction(next, moduleId, scope, actionId, enabled),
    current,
  );
}

export function toggleScopedPermissionAction(
  current: string[],
  moduleId: PermissionModuleId,
  scope: DataAccessScope,
  actionId: string,
  enabled: boolean,
): string[] {
  const module = permissionModules.find((item) => item.id === moduleId);
  if (!module?.actions.some((action) => action.id === actionId)) return current;

  const prefix = `${moduleId}.${scope}.`;
  const existingActionKeys = current
    .filter((key) => key.startsWith(prefix))
    .map((key) => `${moduleId}.${key.slice(prefix.length)}`);

  const nextActionKeys = togglePermission(existingActionKeys, `${moduleId}.${actionId}`, enabled);

  const withoutScope = current.filter((key) => !key.startsWith(prefix));
  const nextScoped = nextActionKeys.map((key) =>
    scopedPermissionKey(moduleId, scope, key.slice(moduleId.length + 1)),
  );
  return [...withoutScope, ...nextScoped];
}

export function syncRoleDataAccessWithScopedPermissions(
  current: RoleDataAccess,
  scopedPermissions: string[],
): RoleDataAccess {
  const next = cloneRoleDataAccess(current);
  for (const module of permissionModules) {
    const scopedScopes = new Set(
      scopedPermissions
        .filter((key) => key.startsWith(`${module.id}.`))
        .map((key) => key.split(".")[1]),
    );
    if (scopedScopes.size === 0) continue;
    next[module.id] = dataAccessOptions
      .map((option) => option.id)
      .filter((scope) => scopedScopes.has(scope));
  }
  return next;
}

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
  dataAccess?: RoleDataAccess;
  scopedPermissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleDraft {
  name: string;
  description: string;
  assignmentLevels: AssignmentLevel[];
  permissions: string[];
  administrativePermissions: AdministrativePermissionId[];
  dataAccess: RoleDataAccess;
  status: ManagedRoleStatus;
}

export const emptyRoleDraft: RoleDraft = {
  name: "",
  description: "",
  assignmentLevels: [],
  permissions: [],
  administrativePermissions: [],
  dataAccess: defaultRoleDataAccess(),
  status: "Active",
};

export function draftFromRole(role: ManagedRole, name = role.name): RoleDraft {
  return {
    name,
    description: role.description,
    assignmentLevels: [...role.assignmentLevels],
    permissions: [...role.permissions],
    administrativePermissions: [...role.administrativePermissions],
    dataAccess: cloneRoleDataAccess(role.dataAccess),
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

export const requestedRoleOrganisationLevelOrder: AssignmentLevel[] = [
  "state",
  "region",
  "district",
  "mandalam",
  "area",
  "booth",
];

export const requestedRoleNamesByOrganisationLevel: Partial<
  Record<AssignmentLevel, readonly string[]>
> = {
  state: [
    "State President",
    "State Vice President",
    "State General Secretary",
    "State Secretary",
    "State Treasurer",
    "State Committee Member",
  ],
  region: ["Regional President", "Regional In-charge", "Regional Coordinator"],
  district: [
    "District President",
    "District Vice President",
    "District General Secretary",
    "District Secretary",
    "District Treasurer",
    "District Committee Member",
  ],
  mandalam: [
    "Mandalam President",
    "Mandalam Vice President",
    "Mandalam General Secretary",
    "Mandalam Secretary",
    "Mandalam Treasurer",
    "Mandalam Committee Member",
  ],
  area: ["Area President", "Area Secretary", "Area Coordinator", "Area Committee Member"],
  booth: [
    "Booth President",
    "Booth Secretary",
    "Booth Agent",
    "Booth Committee Member",
    "Karyakarta",
  ],
};

const requestedDesignationRoleNames: Record<string, string> = {
  "state-president": "State President",
  "state-vice-president": "State Vice President",
  "state-general-secretary": "State General Secretary",
  "state-secretary": "State Secretary",
  "state-treasurer": "State Treasurer",
  "state-committee-member": "State Committee Member",
  "region-president": "Regional President",
  "region-in-charge": "Regional In-charge",
  "region-coordinator": "Regional Coordinator",
  "district-president": "District President",
  "district-vice-president": "District Vice President",
  "district-general-secretary": "District General Secretary",
  "district-secretary": "District Secretary",
  "district-treasurer": "District Treasurer",
  "district-committee-member": "District Committee Member",
  "mandalam-president": "Mandalam President",
  "mandalam-vice-president": "Mandalam Vice President",
  "mandalam-general-secretary": "Mandalam General Secretary",
  "mandalam-secretary": "Mandalam Secretary",
  "mandalam-treasurer": "Mandalam Treasurer",
  "mandalam-committee-member": "Mandalam Committee Member",
  "area-president": "Area President",
  "area-secretary": "Area Secretary",
  "area-coordinator": "Area Coordinator",
  "area-committee-member": "Area Committee Member",
  "booth-president": "Booth President",
  "booth-secretary": "Booth Secretary",
  "booth-agent": "Booth Agent",
  "booth-committee-member": "Booth Committee Member",
  karyakarta: "Karyakarta",
};

const presetIdForDesignationLevel: Record<AssignmentLevel, Exclude<RolePresetId, "custom">> = {
  state: "state_admin",
  region: "district_admin",
  district: "district_admin",
  mandalam: "constituency_admin",
  area: "party_worker",
  assembly_constituency: "constituency_admin",
  local_body: "local_body_admin",
  ward: "party_worker",
  booth: "booth_admin",
  org_unit: "party_worker",
};

const designationRoleLevels = new Set<AssignmentLevel>(
  roleOrganisationLevels.map((level) => level.id),
);

const partyDesignationManagedRoles: ManagedRole[] = partyDesignations
  .filter((designation) => designationRoleLevels.has(designation.level))
  .map((designation) => {
    const presetId = presetIdForDesignationLevel[designation.level];
    const preset = rolePresets.find((item) => item.id === presetId)!;
    const levelLabel = organisationLevelLabel(designation.level, "en");

    return {
      id: `system_designation_${designation.id}`,
      name: requestedDesignationRoleNames[designation.id] ?? designation.en,
      description: `${levelLabel} · Party designation`,
      assignmentLevels: [designation.level],
      permissions: [...preset.permissions],
      administrativePermissions: [],
      status: "Active",
      system: true,
      presetId,
      assignedUsers: 0,
      createdAt: roleTimestamp,
      updatedAt: roleTimestamp,
    };
  });

const builtInAccessRoles: ManagedRole[] = builtInRoleSeeds.map((seed) => {
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

export const builtInManagedRoles: ManagedRole[] = [
  ...builtInAccessRoles,
  ...partyDesignationManagedRoles,
];

export const rolesPageAdminRoleId = "system_state_admin";
export const rolesPageSubAdminRoleId = "system_sub_admin";

const createRolesPageFallbackAdmin = (): ManagedRole => {
  const preset = rolePresets.find((item) => item.id === "state_admin");
  return {
    id: rolesPageAdminRoleId,
    name: "State Admin",
    description: preset?.descriptionEn ?? "Statewide administration",
    assignmentLevels: ["state"],
    permissions: [...(preset?.permissions ?? [])],
    administrativePermissions: ["manage_roles", "assign_access", "delegate_access"],
    status: "Active",
    system: true,
    presetId: "state_admin",
    assignedUsers: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
};

export function ensureRolesPageAccessRoles(roles: ManagedRole[]): ManagedRole[] {
  const existingAdmin =
    roles.find((role) => role.id === rolesPageAdminRoleId) ?? createRolesPageFallbackAdmin();
  const existingSubAdmin = roles.find((role) => role.id === rolesPageSubAdminRoleId);
  const baseRoles = roles.some((role) => role.id === rolesPageAdminRoleId)
    ? roles
    : [...roles, existingAdmin];
  if (existingSubAdmin) return baseRoles;

  return [
    ...baseRoles,
    {
      ...existingAdmin,
      id: rolesPageSubAdminRoleId,
      name: "State Sub Admin",
      description: "Statewide sub-administration",
      administrativePermissions: existingAdmin.administrativePermissions.filter(
        (permission) => permission !== "delegate_access",
      ),
      assignedUsers: 0,
      assignedWorkerIds: [],
    },
  ];
}

export const managedRoleStorageKey = "vk-managed-roles";
export const deletedManagedRoleStorageKey = "vk-deleted-managed-role-ids";

export function loadDeletedManagedRoleIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(deletedManagedRoleStorageKey) || "[]",
    ) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function markManagedRoleDeleted(id: string) {
  if (typeof window === "undefined") return;
  const ids = loadDeletedManagedRoleIds();
  if (ids.includes(id)) return;
  try {
    window.localStorage.setItem(deletedManagedRoleStorageKey, JSON.stringify([...ids, id]));
  } catch {
    // Persistence is best-effort in this prototype.
  }
}

const retiredCustomRoleNames = new Set([
  "new role",
  "role",
  "ghdbbn",
  "ssss",
  "dass",
  "aaa",
  "sss",
]);

export function isRetiredCustomRole(role: ManagedRole) {
  return !role.system && retiredCustomRoleNames.has(role.name.trim().toLowerCase());
}

const rolesAndControlOrder = [rolesPageAdminRoleId, rolesPageSubAdminRoleId];

export function getRolesAndControlRoles(roles: ManagedRole[]) {
  return roles
    .filter(
      (role) =>
        !isRetiredCustomRole(role) && (rolesAndControlOrder.includes(role.id) || !role.system),
    )
    .sort((a, b) => {
      const aOrder = rolesAndControlOrder.indexOf(a.id);
      const bOrder = rolesAndControlOrder.indexOf(b.id);
      if (aOrder !== -1 || bOrder !== -1) {
        if (aOrder === -1) return 1;
        if (bOrder === -1) return -1;
        return aOrder - bOrder;
      }
      return a.name.localeCompare(b.name);
    });
}

const validPermissionKeys = new Set(
  permissionModules.flatMap((module) =>
    module.actions.map((action) => `${module.id}.${action.id}`),
  ),
);

const sanitizeRole = (role: ManagedRole): ManagedRole => {
  const dataAccess = sanitizeRoleDataAccess(role.dataAccess);
  return {
    ...role,
    permissions: (role.permissions ?? []).filter((key) => validPermissionKeys.has(key)),
    dataAccess,
    scopedPermissions: scopedPermissionsFromRole({ ...role, dataAccess }),
  };
};

const migrateStoredDesignationRoleName = (role: ManagedRole): ManagedRole => {
  if (!role.system) return role;
  const designationPrefix = "system_designation_";
  if (!role.id.startsWith(designationPrefix)) return role;
  const designationId = role.id.slice(designationPrefix.length);
  const requestedName = requestedDesignationRoleNames[designationId];
  if (!requestedName) return role;
  const legacyName = partyDesignations.find((item) => item.id === designationId)?.en;
  if (!legacyName || role.name.trim().toLowerCase() !== legacyName.trim().toLowerCase()) {
    return role;
  }
  return role.name === requestedName ? role : { ...role, name: requestedName };
};

export function loadManagedRoles(): ManagedRole[] {
  const deletedIds = new Set(loadDeletedManagedRoleIds());
  if (typeof window === "undefined") {
    return builtInManagedRoles.filter((role) => !deletedIds.has(role.id)).map(sanitizeRole);
  }
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(managedRoleStorageKey) || "[]",
    ) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return builtInManagedRoles.filter((role) => !deletedIds.has(role.id)).map(sanitizeRole);
    }
    const storedRoles = (parsed as ManagedRole[])
      .map(sanitizeRole)
      .map(migrateStoredDesignationRoleName)
      .filter((role) => !isRetiredCustomRole(role) && !deletedIds.has(role.id));
    const storedIds = new Set(storedRoles.map((role) => role.id));
    const storedNames = new Set(storedRoles.map((role) => role.name.trim().toLowerCase()));
    const missingBuiltIns = builtInManagedRoles
      .filter(
        (role) =>
          !storedIds.has(role.id) &&
          !deletedIds.has(role.id) &&
          !storedNames.has(role.name.trim().toLowerCase()),
      )
      .map(sanitizeRole);
    return [...storedRoles, ...missingBuiltIns];
  } catch {
    return builtInManagedRoles.filter((role) => !deletedIds.has(role.id)).map(sanitizeRole);
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

export const customDesignationStorageKey = "vk-custom-designations";
export const designationOverrideStorageKey = "vk-designation-overrides";
export const hiddenDesignationStorageKey = "vk-hidden-designation-ids";

interface StoredDesignationOverride {
  name: string;
  level: AssignmentLevel;
}

function readStoredDesignationJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "null") as T | null;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Designations shown on the Designations page: built-in party designations,
 * custom roles, and administrator-created designations, with overrides and
 * deletions applied. Used by Create/Edit User so the Designation picker stays
 * in sync with that register.
 */
export function loadDesignationCatalogue(): PartyDesignation[] {
  const storedCustom = readStoredDesignationJson<unknown>(customDesignationStorageKey, []);
  const customDesignations: PartyDesignation[] = Array.isArray(storedCustom)
    ? storedCustom.filter(
        (item): item is PartyDesignation =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as PartyDesignation).id === "string" &&
          typeof (item as PartyDesignation).en === "string" &&
          typeof (item as PartyDesignation).level === "string",
      )
    : [];

  const storedOverrides = readStoredDesignationJson<Record<string, StoredDesignationOverride>>(
    designationOverrideStorageKey,
    {},
  );
  const overrides =
    storedOverrides && typeof storedOverrides === "object" && !Array.isArray(storedOverrides)
      ? storedOverrides
      : {};

  const storedHidden = readStoredDesignationJson<unknown>(hiddenDesignationStorageKey, []);
  const hidden = new Set(
    Array.isArray(storedHidden)
      ? storedHidden.filter((id): id is string => typeof id === "string")
      : [],
  );

  const managedDesignations: PartyDesignation[] = loadManagedRoles()
    .filter((role) => !role.system && role.status === "Active" && !isRetiredCustomRole(role))
    .map((role) => ({
      id: role.id,
      en: role.name,
      ml: role.name,
      level: role.assignmentLevels[0] ?? ("state" as AssignmentLevel),
    }));

  const entries = [...partyDesignations, ...managedDesignations, ...customDesignations]
    .filter((entry) => !hidden.has(entry.id))
    .map((entry) => {
      const override = overrides[entry.id];
      return override && typeof override.name === "string" && typeof override.level === "string"
        ? { ...entry, en: override.name, ml: override.name, level: override.level }
        : entry;
    });

  const seenIds = new Set<string>();
  const seenLabels = new Set<string>();
  return entries.filter((entry) => {
    const label = entry.en.trim().toLowerCase();
    if (seenIds.has(entry.id) || seenLabels.has(label)) return false;
    seenIds.add(entry.id);
    seenLabels.add(label);
    return true;
  });
}
