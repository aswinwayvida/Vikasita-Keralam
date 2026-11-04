import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  FileText,
  Filter,
  Headset,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UserPlus,
  Users,
  Users2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  permissionKey,
  permissionModules,
  togglePermission,
  type AssignmentLevel,
  type PermissionModuleId,
} from "@/data/party-workers";
import {
  loadAssignablePartyWorkers,
  type AssignablePartyWorker,
} from "@/data/party-worker-directory";
import {
  allScopedPermissionKeys,
  cloneRoleDataAccess,
  createRoleId,
  dataAccessOptions,
  draftFromRole,
  emptyRoleDraft,
  ensureRolesPageAccessRoles,
  getPermissionMatrixActionIds,
  getRolesAndControlRoles,
  loadManagedRoles,
  markManagedRoleDeleted,
  nextRoleCopyName,
  permissionsFromScopedPermissions,
  saveManagedRoles,
  scopedPermissionKey,
  scopedPermissionsFromRole,
  syncRoleDataAccessWithScopedPermissions,
  toggleScopedPermission,
  type AdministrativePermissionId,
  type ManagedRole,
  type RoleDraft,
} from "@/data/role-management";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

interface MobileRolesPageProps {
  onBack: () => void;
  onFormOpenChange?: (open: boolean) => void;
}

const moduleIcons = {
  schemes: FileText,
  party_workers: Users,
  applications: ClipboardList,
  help_desk: Headset,
  applicant_profile: UserRound,
  roles: ShieldCheck,
  designations: Users2,
} as const;

const freshDraft = (): RoleDraft => ({
  ...emptyRoleDraft,
  assignmentLevels: ["state"],
  permissions: [],
  administrativePermissions: [],
});

const permissionModuleOrder: PermissionModuleId[] = [
  "applicant_profile",
  "applications",
  "schemes",
  "roles",
  "designations",
  "party_workers",
  "help_desk",
];

const orderedPermissionModules = [...permissionModules].sort(
  (a, b) => permissionModuleOrder.indexOf(a.id) - permissionModuleOrder.indexOf(b.id),
);

const crudPermissionColumns = [
  { id: "create", en: "Create", ml: "സൃഷ്ടിക്കുക" },
  { id: "view", en: "View", ml: "കാണുക" },
  { id: "edit", en: "Edit", ml: "തിരുത്തുക" },
  { id: "delete", en: "Delete", ml: "നീക്കം ചെയ്യുക" },
] as const;

const crudPermissionActionIds = new Set<string>(crudPermissionColumns.map((column) => column.id));

const additionalPermissionModules = orderedPermissionModules
  .filter((module) => module.id !== "schemes")
  .map((module) => ({
    module,
    actions: module.actions.filter((action) => !crudPermissionActionIds.has(action.id)),
  }))
  .filter((group) => group.actions.length > 0);

const rolePermissionModuleLabel = (
  module: { id: PermissionModuleId; en: string; ml: string },
  isMalayalam: boolean,
) =>
  module.id === "help_desk"
    ? isMalayalam
      ? "അഭ്യർത്ഥന"
      : "Request"
    : isMalayalam
      ? module.ml
      : module.en;

const totalMatrixCellCount = orderedPermissionModules.reduce(
  (moduleTotal, module) =>
    moduleTotal +
    crudPermissionColumns.filter(
      (column) => getPermissionMatrixActionIds(module.id, column.id).length > 0,
    ).length *
      dataAccessOptions.length,
  0,
);

const roleAccessPermissionIds: AdministrativePermissionId[] = ["manage_roles", "assign_access"];
const delegateAccessPermissionId: AdministrativePermissionId = "delegate_access";
const roleLevelNamePrefixes: Partial<Record<AssignmentLevel, string[]>> = {
  state: ["State"],
  region: ["Regional", "Region"],
  district: ["District", "Organisational District"],
  mandalam: ["Mandalam"],
  area: ["Area"],
  booth: ["Booth"],
};

const roleNameWithoutLevelPrefix = (name: string, level: AssignmentLevel | "other") => {
  if (level === "other") return name;
  const prefix = roleLevelNamePrefixes[level]?.find((value) =>
    name.toLowerCase().startsWith(`${value.toLowerCase()} `),
  );
  if (!prefix) return name;
  return name.slice(prefix.length).trim() || name;
};

const normalizeAdministrativePermissions = (ids: AdministrativePermissionId[]) => [
  ...(ids.some((id) => roleAccessPermissionIds.includes(id)) ? roleAccessPermissionIds : []),
  ...(ids.includes(delegateAccessPermissionId) ? [delegateAccessPermissionId] : []),
];

export function MobileRolesPage({ onBack, onFormOpenChange }: MobileRolesPageProps) {
  const { lang } = useLang();
  const isMalayalam = lang === "ml";
  const tr = (en: string, ml: string) => (isMalayalam ? ml : en);
  const [roles, setRoles] = useState<ManagedRole[]>(() =>
    ensureRolesPageAccessRoles(loadManagedRoles()),
  );
  const [activeView, setActiveView] = useState<"list" | "form" | "assign">("list");
  const [showRoleSearch, setShowRoleSearch] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editTarget, setEditTarget] = useState<ManagedRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedRole | null>(null);
  const [draft, setDraft] = useState<RoleDraft>(freshDraft);
  const [scopedPermissions, setScopedPermissions] = useState<string[]>([]);
  const [expandedPermissionModules, setExpandedPermissionModules] = useState<
    Set<PermissionModuleId>
  >(() => new Set([orderedPermissionModules[0].id]));
  const [assignmentRole, setAssignmentRole] = useState<ManagedRole | null>(null);
  const [assignmentWorkerIds, setAssignmentWorkerIds] = useState<string[]>([]);
  const [assignmentWorkers, setAssignmentWorkers] = useState<AssignablePartyWorker[]>([]);
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentDistrict, setAssignmentDistrict] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const scopedPermissionSet = new Set(scopedPermissions);
  const matrixCellSelected = (
    moduleId: PermissionModuleId,
    scope: (typeof dataAccessOptions)[number]["id"],
    columnId: (typeof crudPermissionColumns)[number]["id"],
  ) => {
    const actionIds = getPermissionMatrixActionIds(moduleId, columnId);
    return (
      actionIds.length > 0 &&
      actionIds.every((actionId) =>
        scopedPermissionSet.has(scopedPermissionKey(moduleId, scope, actionId)),
      )
    );
  };
  const selectedPermissionCount = orderedPermissionModules.reduce(
    (moduleTotal, module) =>
      moduleTotal +
      dataAccessOptions.reduce(
        (scopeTotal, scope) =>
          scopeTotal +
          crudPermissionColumns.filter((column) =>
            matrixCellSelected(module.id, scope.id, column.id),
          ).length,
        0,
      ),
    0,
  );
  const allPermissionsSelected =
    totalMatrixCellCount > 0 && selectedPermissionCount === totalMatrixCellCount;
  const hasPartialPermissionSelection = selectedPermissionCount > 0 && !allPermissionsSelected;
  useEffect(() => {
    return () => onFormOpenChange?.(false);
  }, [onFormOpenChange]);

  const commitRoles = (nextRoles: ManagedRole[]) => {
    setRoles(nextRoles);
    saveManagedRoles(nextRoles);
  };

  const visibleRoles = getRolesAndControlRoles(roles);
  const normalizedRoleSearch = roleSearch.trim().toLowerCase();
  const filteredRoles = visibleRoles.filter((role) => {
    const matchesSearch =
      !normalizedRoleSearch || role.name.toLowerCase().includes(normalizedRoleSearch);
    return matchesSearch;
  });

  const openEdit = (role: ManagedRole) => {
    setIsCreating(false);
    setEditTarget(role);
    setDraft(draftFromRole(role));
    const nextScopedPermissions = scopedPermissionsFromRole(role);
    setScopedPermissions(nextScopedPermissions);
    const modulesWithAccess = new Set(
      orderedPermissionModules
        .filter((module) => nextScopedPermissions.some((key) => key.startsWith(`${module.id}.`)))
        .map((module) => module.id),
    );
    setExpandedPermissionModules(
      modulesWithAccess.size > 0 ? modulesWithAccess : new Set([orderedPermissionModules[0].id]),
    );
    setErrors({});
    setActiveView("form");
    onFormOpenChange?.(true);
  };

  const openAssignRole = (role: ManagedRole) => {
    setIsCreating(false);
    setEditTarget(null);
    setAssignmentRole(role);
    setAssignmentWorkerIds(role.assignedWorkerIds ? [...role.assignedWorkerIds] : []);
    setAssignmentWorkers(loadAssignablePartyWorkers());
    setAssignmentSearch("");
    setAssignmentDistrict("");
    setActiveView("assign");
    onFormOpenChange?.(true);
  };

  const openCreate = () => {
    setIsCreating(true);
    setEditTarget(null);
    setDraft(freshDraft());
    setScopedPermissions([]);
    setExpandedPermissionModules(new Set([orderedPermissionModules[0].id]));
    setErrors({});
    setActiveView("form");
    onFormOpenChange?.(true);
  };

  const closeRoleDialog = () => {
    setIsCreating(false);
    setEditTarget(null);
    setAssignmentRole(null);
    setAssignmentWorkerIds([]);
    setAssignmentWorkers([]);
    setAssignmentSearch("");
    setAssignmentDistrict("");
    setActiveView("list");
    onFormOpenChange?.(false);
  };

  const validateRoleBasics = () => {
    const name = draft.name.trim();
    const nextErrors: Record<string, string> = {};
    if (!name) {
      nextErrors.name = tr("Role name is required.", "റോൾ നാമം നിർബന്ധമാണ്.");
    }
    if (
      roles.some(
        (role) =>
          role.id !== editTarget?.id && role.name.trim().toLowerCase() === name.toLowerCase(),
      )
    ) {
      nextErrors.name = tr(
        "A role with this name already exists.",
        "ഈ പേരിലുള്ള റോൾ ഇതിനകം നിലവിലുണ്ട്.",
      );
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const saveRole = () => {
    if (!isCreating && !editTarget) return;
    if (!validateRoleBasics()) return;
    if (draft.permissions.length === 0) {
      setErrors({
        permissions: tr(
          "Select at least one module permission.",
          "കുറഞ്ഞത് ഒരു മൊഡ്യൂൾ അനുമതി തിരഞ്ഞെടുക്കുക.",
        ),
      });
      return;
    }

    const name = draft.name.trim();
    const now = new Date().toISOString();
    const nextPermissions = permissionsFromScopedPermissions(scopedPermissions, draft.permissions);
    const nextDataAccess = syncRoleDataAccessWithScopedPermissions(
      draft.dataAccess,
      scopedPermissions,
    );
    if (isCreating) {
      const created: ManagedRole = {
        id: createRoleId(),
        name,
        description: draft.description.trim(),
        assignmentLevels: [...draft.assignmentLevels],
        permissions: nextPermissions,
        administrativePermissions: normalizeAdministrativePermissions(
          draft.administrativePermissions,
        ),
        dataAccess: nextDataAccess,
        scopedPermissions: [...scopedPermissions],
        status: draft.status,
        system: false,
        assignedUsers: 0,
        createdAt: now,
        updatedAt: now,
      };
      commitRoles([created, ...roles]);
      setAssignmentRole(created);
      setAssignmentWorkerIds([]);
      setAssignmentWorkers(loadAssignablePartyWorkers());
      setAssignmentSearch("");
      setAssignmentDistrict("");
      setActiveView("assign");
      toast.success(
        tr("Role created. Assign users next.", "റോൾ സൃഷ്ടിച്ചു. അടുത്ത് ഉപയോക്താക്കളെ നൽകുക."),
      );
      return;
    } else if (editTarget) {
      const updated: ManagedRole = {
        ...editTarget,
        name,
        description: draft.description.trim(),
        assignmentLevels: [...draft.assignmentLevels],
        permissions: nextPermissions,
        administrativePermissions: normalizeAdministrativePermissions(
          draft.administrativePermissions,
        ),
        dataAccess: nextDataAccess,
        scopedPermissions: [...scopedPermissions],
        status: draft.status,
        updatedAt: now,
      };
      commitRoles(roles.map((role) => (role.id === updated.id ? updated : role)));
      toast.success(tr("Role updated.", "റോൾ അപ്ഡേറ്റ് ചെയ്തു."));
    }
    closeRoleDialog();
  };

  const toggleAssignmentWorker = (workerId: string) => {
    setAssignmentWorkerIds((current) =>
      current.includes(workerId) ? current.filter((id) => id !== workerId) : [...current, workerId],
    );
  };

  const finishWorkerAssignment = () => {
    if (!assignmentRole) return;
    const updated: ManagedRole = {
      ...assignmentRole,
      assignedWorkerIds: [...assignmentWorkerIds],
      assignedUsers: assignmentWorkerIds.length,
      updatedAt: new Date().toISOString(),
    };
    commitRoles(roles.map((role) => (role.id === updated.id ? updated : role)));
    toast.success(
      tr(
        `${assignmentWorkerIds.length} user${assignmentWorkerIds.length === 1 ? "" : "s"} assigned to ${updated.name}.`,
        `${assignmentWorkerIds.length} ഉപയോക്താക്കളെ ${updated.name} റോളിലേക്ക് നൽകി.`,
      ),
    );
    closeRoleDialog();
  };

  const duplicateRole = (role: ManagedRole) => {
    const now = new Date().toISOString();
    const copy: ManagedRole = {
      id: createRoleId(),
      name: nextRoleCopyName(role.name, roles),
      description: role.description,
      assignmentLevels: [...role.assignmentLevels],
      permissions: [...role.permissions],
      administrativePermissions: [...role.administrativePermissions],
      dataAccess: cloneRoleDataAccess(role.dataAccess),
      scopedPermissions: scopedPermissionsFromRole(role),
      status: "Active",
      system: false,
      assignedUsers: 0,
      createdAt: now,
      updatedAt: now,
    };
    commitRoles([copy, ...roles]);
    toast.success(tr("Role duplicated.", "റോൾ പകർത്തി."));
  };

  const confirmDeleteRole = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    markManagedRoleDeleted(targetId);
    commitRoles(roles.filter((role) => role.id !== targetId));
    if (assignmentRole?.id === targetId) setAssignmentRole(null);
    setDeleteTarget(null);
    toast.success(tr("Role deleted.", "റോൾ മായ്ച്ചു."));
  };

  const assignmentDistrictOptions = Array.from(
    assignmentWorkers.reduce((options, worker) => {
      const value = worker.districtEn || worker.districtMl;
      if (!value || options.has(value)) return options;
      options.set(
        value,
        isMalayalam
          ? worker.districtMl || worker.districtEn
          : worker.districtEn || worker.districtMl,
      );
      return options;
    }, new Map<string, string>()),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const assignmentDistrictLabel =
    assignmentDistrictOptions.find((district) => district.value === assignmentDistrict)?.label ??
    "";

  const normalizedAssignmentSearch = assignmentSearch.trim().toLowerCase();
  const filteredAssignmentWorkers = assignmentWorkers.filter((worker) => {
    if (assignmentDistrict && (worker.districtEn || worker.districtMl) !== assignmentDistrict) {
      return false;
    }
    if (!normalizedAssignmentSearch) return true;
    return [
      worker.name,
      worker.nameMl,
      worker.mobile,
      worker.designationEn,
      worker.designationMl,
      worker.locationEn,
      worker.locationMl,
      worker.districtEn,
      worker.districtMl,
    ].some((value) => value?.toLowerCase().includes(normalizedAssignmentSearch));
  });

  return (
    <div
      className={cn(
        "animate-in fade-in duration-200",
        activeView === "form" || activeView === "assign"
          ? "relative flex h-full min-h-0 w-full flex-col bg-muted/20"
          : "relative flex h-full min-h-0 w-full flex-col",
      )}
    >
      {activeView === "list" && (
        <>
          <header className="relative flex h-10 shrink-0 items-center justify-center border-b border-border/70 px-3">
            {showRoleSearch ? (
              <div className="flex w-full items-center gap-2">
                <div className="relative flex min-w-0 flex-1 items-center">
                  <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={roleSearch}
                    onChange={(event) => setRoleSearch(event.target.value)}
                    placeholder={tr("Search roles...", "റോളുകൾ തിരയുക...")}
                    aria-label={tr("Search roles", "റോളുകൾ തിരയുക")}
                    autoFocus
                    className="h-7 w-full rounded-full border border-border bg-muted/30 pl-8 pr-2 text-[10.5px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleSearch(false);
                    setRoleSearch("");
                  }}
                  aria-label={tr("Cancel search", "തിരയൽ റദ്ദാക്കുക")}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-foreground transition-colors hover:bg-muted dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onBack}
                  className="absolute left-0 flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-foreground transition-colors hover:bg-muted dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer"
                  aria-label={tr("Go back", "തിരികെ പോവുക")}
                >
                  <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
                </button>
                <h1 className="text-[13px] font-extrabold tracking-tight text-[#152153] dark:text-white">
                  {tr("Roles and Control", "റോളുകളും നിയന്ത്രണവും")} ({visibleRoles.length})
                </h1>
                <div className="absolute right-0 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleSearch(true);
                      setRoleSearch("");
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-foreground transition-colors hover:bg-muted dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer"
                    aria-label={tr("Search roles", "റോളുകൾ തിരയുക")}
                  >
                    <Search className="h-3.5 w-3.5 stroke-[2.4]" />
                  </button>
                  <button
                    type="button"
                    onClick={openCreate}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-colors hover:bg-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:hover:bg-orange-900/60 cursor-pointer"
                    aria-label={tr("Create role", "റോൾ സൃഷ്ടിക്കുക")}
                  >
                    <Plus className="h-4 w-4 stroke-[2.6]" />
                  </button>
                </div>
              </>
            )}
          </header>

          <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredRoles.length > 0 ? (
              <div className="space-y-1.5 px-1">
                {filteredRoles.map((role) => {
                  const displayName = roleNameWithoutLevelPrefix(role.name, "state");
                  return (
                    <div
                      key={role.id}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border border-white bg-card px-2.5 py-2 shadow-2xs",
                        role.status === "Inactive" && "opacity-60",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => openEdit(role)}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                        aria-label={tr(`Edit ${displayName}`, `${displayName} തിരുത്തുക`)}
                      >
                        <img
                          src="/images/settings/role-card.png"
                          alt=""
                          aria-hidden="true"
                          className="h-7 w-7 shrink-0 object-contain"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[11.5px] font-extrabold leading-tight text-foreground">
                            {displayName}
                          </h3>
                        </div>
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                            aria-label={tr(`Actions for ${displayName}`, `${displayName} നടപടികൾ`)}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-xl border-orange-100 p-1.5 shadow-lg dark:border-slate-800"
                        >
                          <DropdownMenuItem
                            onSelect={() => openAssignRole(role)}
                            className="gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            {tr("Assign Role", "റോൾ അസൈൻ ചെയ്യുക")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => openEdit(role)}
                            className="gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {tr("Edit", "തിരുത്തുക")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => duplicateRole(role)}
                            className="gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {tr("Duplicate", "പകർത്തുക")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setDeleteTarget(role)}
                            className="gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold text-rose-600 focus:bg-rose-50 focus:text-rose-700 dark:text-rose-400 dark:focus:bg-rose-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {tr("Delete", "മായ്ക്കുക")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center">
                <Search className="h-5 w-5 text-muted-foreground" />
                <p className="text-[10.5px] font-bold text-foreground">
                  {tr("No roles found", "റോളുകളൊന്നും കണ്ടെത്തിയില്ല")}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {tr("Try a different search term.", "മറ്റൊരു തിരയൽ പദം പരീക്ഷിക്കുക.")}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {activeView === "assign" && assignmentRole && (
        <div className="flex min-h-0 flex-1 flex-col bg-muted/20">
          <header className="relative flex h-10 shrink-0 items-center justify-center border-b border-border/70 bg-card px-3 dark:bg-slate-900">
            <button
              type="button"
              onClick={closeRoleDialog}
              className="absolute left-3 flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-foreground transition-colors hover:bg-muted dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer"
              aria-label={tr("Back to roles", "റോളുകളിലേക്ക് മടങ്ങുക")}
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>
            <h1 className="text-[13px] font-extrabold tracking-tight text-[#152153] dark:text-white">
              {tr("Assign Users", "ഉപയോക്താക്കളെ നൽകുക")}
            </h1>
            <span className="absolute right-3 rounded-full border border-orange-100 bg-orange-50 px-2 py-1 text-[8.5px] font-bold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/50 dark:text-orange-300">
              {isCreating ? tr("Step 3 of 3", "ഘട്ടം 3/3") : tr("Assign Role", "റോൾ അസൈൻ")}
            </span>
          </header>

          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <section className="space-y-2.5 rounded-2xl border border-border bg-card p-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="relative flex min-w-0 flex-1 items-center">
                  <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={assignmentSearch}
                    onChange={(event) => setAssignmentSearch(event.target.value)}
                    placeholder={tr(
                      "Search name, location, phone...",
                      "പേര്, സ്ഥലം, ഫോൺ തിരയുക...",
                    )}
                    aria-label={tr("Search users", "ഉപയോക്താക്കളെ തിരയുക")}
                    className="w-full rounded-xl border border-border bg-muted/30 py-1.5 pl-8 pr-7 text-[10.5px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  {assignmentSearch ? (
                    <button
                      type="button"
                      onClick={() => setAssignmentSearch("")}
                      aria-label={tr("Clear search", "തിരയൽ മായ്ക്കുക")}
                      className="absolute right-2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={tr("Filter by district", "ജില്ല തിരിച്ച് ഫിൽട്ടർ ചെയ്യുക")}
                      className={cn(
                        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors cursor-pointer",
                        assignmentDistrict
                          ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
                          : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Filter className="h-3.5 w-3.5 stroke-[2.2]" />
                      {assignmentDistrict ? (
                        <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-orange-500" />
                      ) : null}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl p-1">
                    <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                      {tr("Filter by district", "ജില്ല തിരിച്ച് ഫിൽട്ടർ ചെയ്യുക")}
                    </div>
                    <DropdownMenuRadioGroup
                      value={assignmentDistrict}
                      onValueChange={setAssignmentDistrict}
                    >
                      <DropdownMenuRadioItem
                        value=""
                        className="rounded-lg py-1.5 text-[11px] font-semibold"
                      >
                        {tr("All districts", "എല്ലാ ജില്ല")}
                      </DropdownMenuRadioItem>
                      {assignmentDistrictOptions.map((district) => (
                        <DropdownMenuRadioItem
                          key={district.value}
                          value={district.value}
                          className="rounded-lg py-1.5 text-[11px] font-semibold"
                        >
                          {district.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {assignmentDistrict ? (
                <button
                  type="button"
                  onClick={() => setAssignmentDistrict("")}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[8.5px] font-bold text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300 dark:hover:bg-orange-950/50 cursor-pointer"
                >
                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{assignmentDistrictLabel}</span>
                  <X className="h-2.5 w-2.5 shrink-0" />
                </button>
              ) : null}

              <div className="overflow-hidden rounded-xl border border-border">
                <div className="divide-y divide-border/60">
                  {filteredAssignmentWorkers.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center">
                      {assignmentWorkers.length === 0 ? (
                        <Users className="mx-auto h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Search className="mx-auto h-5 w-5 text-muted-foreground" />
                      )}
                      <p className="mt-2 text-[10.5px] font-bold text-foreground">
                        {assignmentWorkers.length === 0
                          ? tr("No users found", "ഉപയോക്താക്കളെ കണ്ടെത്തിയില്ല")
                          : tr(
                              "No workers match your filters",
                              "ഫിൽട്ടറുകളുമായി പൊരുത്തപ്പെടുന്ന പ്രവർത്തകരില്ല",
                            )}
                      </p>
                      {assignmentWorkers.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setAssignmentSearch("");
                            setAssignmentDistrict("");
                          }}
                          className="mt-2 text-[9px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          {tr("Clear search and filters", "തിരയലും ഫിൽട്ടറുകളും മായ്ക്കുക")}
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    filteredAssignmentWorkers.map((worker) => {
                      const selected = assignmentWorkerIds.includes(worker.id);
                      const workerName = isMalayalam ? worker.nameMl || worker.name : worker.name;
                      const workerLocation = isMalayalam ? worker.locationMl : worker.locationEn;
                      return (
                        <button
                          key={worker.id}
                          type="button"
                          role="checkbox"
                          aria-checked={selected}
                          onClick={() => toggleAssignmentWorker(worker.id)}
                          className={cn(
                            "flex w-full items-start gap-2 px-3 py-2 text-left transition-colors cursor-pointer",
                            selected
                              ? "bg-orange-50/60 dark:bg-orange-950/20"
                              : "hover:bg-muted/40",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                              selected
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-slate-300 dark:border-slate-600",
                            )}
                          >
                            {selected ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[10px] font-bold text-foreground">
                              {workerName}
                            </span>
                            <span className="mt-0.5 flex min-w-0 items-center gap-1 text-[8.5px] leading-snug text-muted-foreground">
                              <MapPin className="h-2.5 w-2.5 shrink-0 text-orange-500" />
                              <span className="truncate">{workerLocation}</span>
                            </span>
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="shrink-0 border-t border-border/70 bg-background/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeRoleDialog}
                className="h-10 w-[30%] shrink-0 rounded-lg border border-orange-200 bg-white px-3 text-[10.5px] font-extrabold text-orange-700 shadow-none transition-colors hover:bg-orange-50 dark:border-orange-900/60 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-orange-950/40 cursor-pointer"
              >
                {tr("Skip", "ഒഴിവാക്കുക")}
              </button>
              <Button
                type="button"
                className="h-10 flex-1 rounded-lg text-[11.5px] font-extrabold shadow-none"
                onClick={finishWorkerAssignment}
                disabled={assignmentWorkerIds.length === 0}
              >
                {assignmentWorkerIds.length === 0
                  ? tr("Select at least one user", "കുറഞ്ഞത് ഒരു ഉപയോക്താവിനെ തിരഞ്ഞെടുക്കുക")
                  : tr(
                      `Assign ${assignmentWorkerIds.length} user${assignmentWorkerIds.length === 1 ? "" : "s"}`,
                      `${assignmentWorkerIds.length} ഉപയോക്താക്കളെ നൽകുക`,
                    )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeView === "form" && (
        <div className="flex min-h-0 flex-1 flex-col bg-muted/20">
          <header className="relative flex h-10 shrink-0 items-center justify-center border-b border-border/70 bg-card px-3 dark:bg-slate-900">
            <button
              type="button"
              onClick={closeRoleDialog}
              className="absolute left-3 flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-foreground transition-colors hover:bg-muted dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer"
              aria-label={tr("Go back", "തിരികെ പോവുക")}
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>
            <h1 className="text-[13px] font-extrabold tracking-tight text-[#152153] dark:text-white">
              {isCreating
                ? tr("Create New Role", "പുതിയ റോൾ സൃഷ്ടിക്കുക")
                : tr("Edit Role", "റോൾ തിരുത്തുക")}
            </h1>
          </header>

          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <section className="rounded-2xl border border-border bg-card p-3 shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white">
                    1
                  </span>
                  <h4 className="text-[12px] font-extrabold text-foreground">
                    {tr("Role Details", "റോൾ വിവരങ്ങൾ")}
                  </h4>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-foreground">
                    {tr("Role Name", "റോൾ നാമം")} <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={draft.name}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, name: event.target.value }));
                      setErrors((current) => ({ ...current, name: "" }));
                    }}
                    placeholder={tr("e.g. Area Coordinator", "ഉദാ: ഏരിയ കോർഡിനേറ്റർ")}
                    className={cn(
                      "h-9 rounded-lg border-border bg-background px-2.5 text-[11.5px] font-medium text-foreground shadow-none transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-500 md:text-[11.5px]",
                      errors.name && "border-rose-400",
                    )}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name ? (
                    <p className="mt-1 text-[9.5px] font-semibold text-rose-600">{errors.name}</p>
                  ) : null}
                </div>
              </div>

              <section className="mt-3 space-y-2.5 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white">
                      2
                    </span>
                    <h4 className="text-[12px] font-extrabold text-foreground">
                      {tr("Module Permissions", "മൊഡ്യൂൾ അനുമതികൾ")}{" "}
                      <span className="text-rose-500">*</span>
                    </h4>
                  </div>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={
                      allPermissionsSelected
                        ? true
                        : hasPartialPermissionSelection
                          ? "mixed"
                          : false
                    }
                    aria-label={tr(
                      "Select all module permissions",
                      "എല്ലാ മൊഡ്യൂൾ അനുമതികളും തിരഞ്ഞെടുക്കുക",
                    )}
                    onClick={() => {
                      const nextScopedPermissions = allPermissionsSelected
                        ? []
                        : [...allScopedPermissionKeys];
                      setScopedPermissions(nextScopedPermissions);
                      setDraft((current) => ({
                        ...current,
                        permissions: permissionsFromScopedPermissions(
                          nextScopedPermissions,
                          current.permissions,
                        ),
                        dataAccess: syncRoleDataAccessWithScopedPermissions(
                          current.dataAccess,
                          nextScopedPermissions,
                        ),
                      }));
                      setErrors((current) => ({ ...current, permissions: "" }));
                    }}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[8.5px] font-bold text-orange-700 transition-colors hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-950/70 cursor-pointer",
                      allPermissionsSelected
                        ? "bg-orange-100 dark:bg-orange-950/60"
                        : "bg-orange-50 dark:bg-orange-950/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                        allPermissionsSelected
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-orange-300 bg-white dark:border-orange-800 dark:bg-slate-900",
                      )}
                    >
                      {allPermissionsSelected ? (
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      ) : hasPartialPermissionSelection ? (
                        <span className="h-[1.5px] w-2 rounded-full bg-orange-600 dark:bg-orange-300" />
                      ) : null}
                    </span>
                    <span>{tr("All", "എല്ലാം")}</span>
                    <span>
                      ({selectedPermissionCount}/{totalMatrixCellCount})
                    </span>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="overflow-hidden rounded-xl border border-border bg-white dark:bg-slate-900">
                    {orderedPermissionModules.map((module) => {
                      const Icon = moduleIcons[module.id];
                      const moduleLabel = rolePermissionModuleLabel(module, isMalayalam);
                      const extraActions =
                        additionalPermissionModules.find((group) => group.module.id === module.id)
                          ?.actions ?? [];
                      const hasViewPermission = dataAccessOptions.some((scope) =>
                        matrixCellSelected(module.id, scope.id, "view"),
                      );
                      const showExtraActions =
                        extraActions.length > 0 &&
                        (module.actions.some((action) => action.id === "view")
                          ? hasViewPermission
                          : true);
                      const moduleSelectedCount = dataAccessOptions.reduce(
                        (scopeTotal, scope) =>
                          scopeTotal +
                          crudPermissionColumns.filter((column) =>
                            matrixCellSelected(module.id, scope.id, column.id),
                          ).length,
                        0,
                      );
                      const moduleTotalCellCount =
                        crudPermissionColumns.filter(
                          (column) => getPermissionMatrixActionIds(module.id, column.id).length > 0,
                        ).length * dataAccessOptions.length;
                      const expanded = expandedPermissionModules.has(module.id);
                      return (
                        <div key={module.id} className="border-t border-border first:border-t-0">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPermissionModules((current) => {
                                const next = new Set(current);
                                if (next.has(module.id)) next.delete(module.id);
                                else next.add(module.id);
                                return next;
                              })
                            }
                            aria-expanded={expanded}
                            className="flex w-full items-center gap-2.5 bg-white px-3.5 py-3 text-left transition-colors hover:bg-orange-50/40 dark:bg-slate-900 dark:hover:bg-slate-800/60"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-orange-600 dark:text-orange-300" />
                            <span className="min-w-0 flex-1 whitespace-normal break-words text-[12px] font-extrabold leading-snug text-foreground">
                              {moduleLabel}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                                moduleSelectedCount > 0
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {moduleSelectedCount}/{moduleTotalCellCount}
                            </span>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                expanded && "rotate-180",
                              )}
                            />
                          </button>

                          {expanded ? (
                            <div className="border-t border-border/60 bg-white px-2 pb-2 pt-1.5 dark:bg-slate-900">
                              <div className="grid grid-cols-[minmax(0,1fr)_36px_36px_36px_36px] items-center gap-1 pb-1">
                                <span className="pl-1 text-[8px] font-black uppercase tracking-wide text-orange-700/80 dark:text-orange-300">
                                  {tr("Data Access", "ഡാറ്റ ആക്സസ്")}
                                </span>
                                {crudPermissionColumns.map((column) => (
                                  <span
                                    key={column.id}
                                    className="text-center text-[7.5px] font-black uppercase tracking-tight text-orange-700/80 dark:text-orange-300"
                                  >
                                    {isMalayalam ? column.ml : column.en}
                                  </span>
                                ))}
                              </div>
                              {dataAccessOptions.map((scope) => {
                                const scopeLabel = isMalayalam ? scope.shortMl : scope.shortEn;
                                return (
                                  <div
                                    key={scope.id}
                                    className="grid grid-cols-[minmax(0,1fr)_36px_36px_36px_36px] items-center gap-1 border-t border-border/40 py-0.5"
                                  >
                                    <span className="min-w-0 pl-1 text-[9.5px] font-bold text-foreground">
                                      {scopeLabel}
                                    </span>
                                    {crudPermissionColumns.map((column) => {
                                      const actionIds = getPermissionMatrixActionIds(
                                        module.id,
                                        column.id,
                                      );
                                      if (actionIds.length === 0) {
                                        return (
                                          <span
                                            key={column.id}
                                            title={tr("Unavailable", "ലഭ്യമല്ല")}
                                            aria-label={tr("Unavailable", "ലഭ്യമല്ല")}
                                            className="flex h-9 items-center justify-center text-[11px] font-semibold text-slate-300 dark:text-slate-600"
                                          >
                                            —
                                          </span>
                                        );
                                      }
                                      const checked = matrixCellSelected(
                                        module.id,
                                        scope.id,
                                        column.id,
                                      );
                                      const columnLabel = isMalayalam ? column.ml : column.en;
                                      return (
                                        <button
                                          key={column.id}
                                          type="button"
                                          role="checkbox"
                                          aria-checked={checked}
                                          aria-label={`${moduleLabel} ${scopeLabel} ${columnLabel}: ${
                                            checked
                                              ? tr("Allowed", "അനുവദിച്ചിരിക്കുന്നു")
                                              : tr("Not Allowed", "അനുവദിച്ചിട്ടില്ല")
                                          }`}
                                          onClick={() => {
                                            const nextScopedPermissions = toggleScopedPermission(
                                              scopedPermissions,
                                              module.id,
                                              scope.id,
                                              column.id,
                                              !checked,
                                            );
                                            setScopedPermissions(nextScopedPermissions);
                                            setDraft((current) => ({
                                              ...current,
                                              permissions: permissionsFromScopedPermissions(
                                                nextScopedPermissions,
                                                current.permissions,
                                              ),
                                              dataAccess: syncRoleDataAccessWithScopedPermissions(
                                                current.dataAccess,
                                                nextScopedPermissions,
                                              ),
                                            }));
                                            setErrors((current) => ({
                                              ...current,
                                              permissions: "",
                                            }));
                                          }}
                                          className="flex h-9 w-full cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 dark:hover:bg-slate-800"
                                        >
                                          <span
                                            className={cn(
                                              "flex h-4 w-4 items-center justify-center rounded-[3px] border",
                                              checked
                                                ? "border-orange-500 bg-orange-500 text-white"
                                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900",
                                            )}
                                          >
                                            {checked ? (
                                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                                            ) : null}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })}

                              {showExtraActions ? (
                                <div className="mt-1 border-t border-dashed border-border/60 pt-2">
                                  <p className="text-[7.5px] font-black uppercase tracking-wide text-muted-foreground">
                                    {tr("Additional permissions", "അധിക അനുമതികൾ")}
                                  </p>
                                  <div className="mt-1 flex items-stretch gap-1.5">
                                    {extraActions.map((action) => {
                                      const key = permissionKey(module.id, action.id);
                                      const checked = draft.permissions.includes(key);
                                      return (
                                        <button
                                          key={action.id}
                                          type="button"
                                          role="checkbox"
                                          aria-checked={checked}
                                          aria-label={`${moduleLabel} ${
                                            isMalayalam ? action.ml : action.en
                                          }: ${
                                            checked
                                              ? tr("Allowed", "അനുവദിച്ചിരിക്കുന്നു")
                                              : tr("Not Allowed", "അനുവദിച്ചിട്ടില്ല")
                                          }`}
                                          onClick={() => {
                                            setDraft((current) => ({
                                              ...current,
                                              permissions: togglePermission(
                                                current.permissions,
                                                key,
                                                !checked,
                                              ),
                                            }));
                                            setErrors((current) => ({
                                              ...current,
                                              permissions: "",
                                            }));
                                          }}
                                          className={cn(
                                            "flex min-h-8 min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1.5 text-left transition-colors",
                                            checked
                                              ? "border-orange-200 bg-orange-50/70 dark:border-orange-900/60 dark:bg-orange-950/20"
                                              : "border-border/70 hover:bg-muted/40",
                                          )}
                                        >
                                          <span
                                            className={cn(
                                              "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                                              checked
                                                ? "border-orange-500 bg-orange-500 text-white"
                                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900",
                                            )}
                                          >
                                            {checked ? (
                                              <Check className="h-2 w-2 stroke-[3]" />
                                            ) : null}
                                          </span>
                                          <span className="min-w-0 flex-1 text-[9.5px] font-bold leading-snug text-foreground">
                                            {isMalayalam ? action.ml : action.en}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-0.5 text-[8px] font-semibold text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border border-orange-500 bg-orange-500 text-white">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                      {tr("Allowed", "അനുവദിച്ചിരിക്കുന്നു")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-3.5 w-3.5 rounded-[3px] border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900" />
                      {tr("Not Allowed", "അനുവദിച്ചിട്ടില്ല")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3.5 text-center text-[11px] font-semibold text-slate-300 dark:text-slate-600">
                        —
                      </span>
                      {tr("Unavailable", "ലഭ്യമല്ല")}
                    </span>
                  </div>
                </div>
                {errors.permissions ? (
                  <p className="mt-1 text-[9.5px] font-semibold text-rose-600">
                    {errors.permissions}
                  </p>
                ) : null}
              </section>
            </section>
          </div>

          <div className="shrink-0 border-t border-border/70 bg-background/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
            <Button
              type="button"
              className="h-10 w-full rounded-xl text-[11.5px] font-extrabold"
              onClick={saveRole}
            >
              {isCreating
                ? tr("Save and Create", "സേവ് ചെയ്ത് സൃഷ്ടിക്കുക")
                : tr("Save Changes", "മാറ്റങ്ങൾ സേവ് ചെയ്യുക")}
            </Button>
          </div>
        </div>
      )}

      {deleteTarget ? (
        <div
          className="absolute inset-0 z-[130] flex items-end bg-slate-950/50 backdrop-blur-[1px] animate-in fade-in duration-150"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full rounded-t-2xl border-t border-orange-100 bg-white shadow-2xl animate-in slide-in-from-bottom duration-200 dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 pb-3 pt-3">
              <div>
                <h3 className="text-[13px] font-extrabold text-foreground">
                  {tr("Delete Role", "റോൾ മായ്ക്കുക")}
                </h3>
                <p className="mt-0.5 text-[9.5px] font-medium text-muted-foreground">
                  {tr("This action cannot be undone.", "ഈ പ്രവർത്തനം പഴയപടിയാക്കാനാകില്ല.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:bg-slate-800 dark:hover:bg-slate-700"
                aria-label={tr("Close", "അടയ്ക്കുക")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="px-4 py-3">
              <p className="text-[11.5px] font-bold text-foreground">
                {tr(`Delete “${deleteTarget.name}”?`, `“${deleteTarget.name}” മായ്ക്കണോ?`)}
              </p>
              <p className="mt-1 text-[9.5px] font-medium leading-relaxed text-muted-foreground">
                {deleteTarget.assignedUsers > 0
                  ? tr(
                      `${deleteTarget.assignedUsers} assigned user${
                        deleteTarget.assignedUsers === 1 ? "" : "s"
                      } will lose this role.`,
                      `ഈ റോൾ നൽകിയ ${deleteTarget.assignedUsers} ഉപയോക്താവിന് ഇത് നഷ്ടമാകും.`,
                    )
                  : tr(
                      "This role will be removed from Roles and Control.",
                      "ഈ റോൾ Roles and Control-ൽ നിന്ന് നീക്കം ചെയ്യും.",
                    )}
              </p>
            </div>

            <div className="flex items-center gap-2 border-t border-border/70 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-10 w-[35%] shrink-0 rounded-lg border border-orange-200 bg-white px-3 text-[10.5px] font-extrabold text-orange-700 transition-colors hover:bg-orange-50 dark:border-orange-900/60 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-orange-950/40"
              >
                {tr("Cancel", "റദ്ദാക്കുക")}
              </button>
              <Button
                type="button"
                onClick={confirmDeleteRole}
                className="h-10 flex-1 rounded-lg bg-rose-600 text-[11.5px] font-extrabold text-white hover:bg-rose-700"
              >
                {tr("Delete Role", "റോൾ മായ്ക്കുക")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
