import { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Filter,
  Headset,
  Search,
  ShieldCheck,
  UserPlus,
  UserRound,
  Users,
  Users2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSidebar } from "@/components/ui/sidebar";
import { permissionModules, type PermissionModuleId } from "@/data/party-workers";
import {
  allScopedPermissionKeysWithExtras,
  createRoleId,
  dataAccessOptions,
  emptyRoleDraft,
  loadManagedRoles,
  permissionsFromScopedPermissions,
  saveManagedRoles,
  scopedPermissionKey,
  toggleScopedPermissionAction,
  type DataAccessScope,
  type ManagedRole,
} from "@/data/role-management";
import {
  getUserDesignation,
  getUserRegion,
  getUserOrgDistrict,
  getUserMandalam,
  getUserArea,
  getUserBooth,
} from "@/data/users";
import {
  loadManagedDesktopUsers,
  saveManagedDesktopUsers,
  type ManagedUser,
} from "@/components/admin/RoleAccessSettings";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings_/new-role")({
  validateSearch: (search: Record<string, unknown>) => ({
    editRoleId: typeof search.editRoleId === "string" ? search.editRoleId : undefined,
  }),
  head: () => ({
    meta: [{ title: "Create / Edit Role · Admin · Vikasita Keralam" }],
  }),
  component: CreateRolePage,
});

const moduleIcons: Record<PermissionModuleId, LucideIcon> = {
  schemes: FileText,
  party_workers: Users,
  applications: ClipboardList,
  help_desk: Headset,
  applicant_profile: UserRound,
  roles: ShieldCheck,
  designations: Users2,
};

const matrixColumns = [
  { id: "create", actionIds: ["create"], en: "Create", ml: "സൃഷ്ടിക്കുക" },
  { id: "view", actionIds: ["view", "view_list", "view_details"], en: "View", ml: "കാണുക" },
  { id: "edit", actionIds: ["edit"], en: "Edit", ml: "തിരുത്തുക" },
  { id: "delete", actionIds: ["delete"], en: "Delete", ml: "നീക്കം ചെയ്യുക" },
  { id: "view_teams", actionIds: ["view_teams"], en: "View Teams", ml: "ടീമുകൾ കാണുക" },
  {
    id: "assign_team_member",
    actionIds: ["assign_team_member"],
    en: "Assign",
    ml: "അസൈൻ ചെയ്യുക",
  },
  {
    id: "respond_reply",
    actionIds: ["respond_reply"],
    en: "Respond/Reply",
    ml: "മറുപടി നൽകുക",
  },
] as const;

type MatrixColumnId = (typeof matrixColumns)[number]["id"];

type MatrixColumn = (typeof matrixColumns)[number];

const primaryMatrixColumns = matrixColumns.slice(0, 4);
const secondaryMatrixColumns = [matrixColumns[1], matrixColumns[5], matrixColumns[6]];

const primaryMatrixGridClass = "grid grid-cols-[1.5fr_repeat(4,1fr)_1.8fr]";
const secondaryMatrixGridClass = "grid grid-cols-[1.5fr_repeat(3,1fr)_1.8fr]";

const dataAccessChoices = dataAccessOptions.filter((option) => option.id !== "above_level");
const supportedScopedPermissionKeys = allScopedPermissionKeysWithExtras.filter(
  (key) => !key.includes(".above_level."),
);

interface MatrixRow {
  key: string;
  moduleId: PermissionModuleId;
  en: string;
  ml: string;
  icon: LucideIcon;
  columns: readonly MatrixColumn[];
  actionIdsByColumn?: Partial<Record<MatrixColumnId, readonly string[]>>;
}

const primaryMatrixRows: MatrixRow[] = permissionModules
  .filter((module) => module.id !== "help_desk")
  .map((module) => ({
    key: module.id,
    moduleId: module.id,
    en: module.id === "party_workers" ? "Users" : module.en,
    ml: module.id === "party_workers" ? "ഉപയോക്താക്കൾ" : module.ml,
    icon: moduleIcons[module.id],
    columns: primaryMatrixColumns,
  }));

const secondaryMatrixRows: MatrixRow[] = [
  {
    key: "help_desk",
    moduleId: "help_desk",
    en: "Request",
    ml: "അഭ്യർത്ഥന",
    icon: Headset,
    columns: secondaryMatrixColumns,
  },
  {
    key: "team",
    moduleId: "party_workers",
    en: "Team",
    ml: "ടീം",
    icon: UsersRound,
    columns: secondaryMatrixColumns,
    actionIdsByColumn: { view: ["view_teams"] },
  },
];

const allMatrixRows = [...primaryMatrixRows, ...secondaryMatrixRows];

function getMatrixColumnActionIds(row: MatrixRow, columnId: MatrixColumnId) {
  const column = row.columns.find((item) => item.id === columnId);
  if (!column) return [];
  const override = row.actionIdsByColumn?.[columnId];
  if (override) return [...override];
  const module = permissionModules.find((item) => item.id === row.moduleId);
  return column.actionIds.filter((actionId) =>
    module?.actions.some((action) => action.id === actionId),
  );
}

function CreateRolePage() {
  const { lang } = useLang();
  const { isMobile, state: sidebarState } = useSidebar();
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const navigate = useNavigate();
  const { editRoleId } = Route.useSearch();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scopedPermissions, setScopedPermissions] = useState<string[]>([]);
  const [moduleDataAccess, setModuleDataAccess] = useState<
    Partial<Record<PermissionModuleId, DataAccessScope[]>>
  >(() =>
    Object.fromEntries(
      permissionModules.map((module) => [module.id, ["own_records"] as DataAccessScope[]]),
    ),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // User Assignment Popup State
  const [showAssignUsersSheet, setShowAssignUsersSheet] = useState(false);
  const [targetSavedRoleName, setTargetSavedRoleName] = useState<string>("");
  const [assignUsersList, setAssignUsersList] = useState<ManagedUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedOrgDistricts, setSelectedOrgDistricts] = useState<string[]>([]);
  const [selectedMandalams, setSelectedMandalams] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedBooths, setSelectedBooths] = useState<string[]>([]);

  const availDesignations = useMemo(() => {
    const set = new Set<string>();
    assignUsersList.forEach((u) => set.add(getUserDesignation(u)));
    return Array.from(set).sort();
  }, [assignUsersList]);

  const availRegions = useMemo(() => {
    const set = new Set<string>();
    assignUsersList.forEach((u) => set.add(getUserRegion(u)));
    return Array.from(set).sort();
  }, [assignUsersList]);

  const availOrgDistricts = useMemo(() => {
    const set = new Set<string>();
    assignUsersList.forEach((u) => set.add(getUserOrgDistrict(u)));
    return Array.from(set).sort();
  }, [assignUsersList]);

  const availMandalams = useMemo(() => {
    const set = new Set<string>();
    assignUsersList.forEach((u) => set.add(getUserMandalam(u)));
    return Array.from(set).sort();
  }, [assignUsersList]);

  const availAreas = useMemo(() => {
    const set = new Set<string>();
    assignUsersList.forEach((u) => set.add(getUserArea(u)));
    return Array.from(set).sort();
  }, [assignUsersList]);

  const availBooths = useMemo(() => {
    const set = new Set<string>();
    assignUsersList.forEach((u) => set.add(getUserBooth(u)));
    return Array.from(set).sort();
  }, [assignUsersList]);

  const drawerActiveFilterCount =
    selectedDesignations.length +
    selectedRegions.length +
    selectedOrgDistricts.length +
    selectedMandalams.length +
    selectedAreas.length +
    selectedBooths.length;

  const toggleArrayFilter = (
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    val: string,
  ) => {
    if (current.includes(val)) {
      setter(current.filter((item) => item !== val));
    } else {
      setter([...current, val]);
    }
  };

  const filteredAssignUsers = useMemo(() => {
    return assignUsersList.filter((u) => {
      const q = userSearchQuery.trim().toLowerCase();
      if (q) {
        const nameEn = (u.name || "").toLowerCase();
        const nameMl = (u.nameMl || "").toLowerCase();
        const desigEn = (u.designationEn || "").toLowerCase();
        const desigMl = (u.designationMl || "").toLowerCase();
        const matchesQ = nameEn.includes(q) || nameMl.includes(q) || desigEn.includes(q) || desigMl.includes(q);
        if (!matchesQ) return false;
      }

      if (selectedDesignations.length > 0 && !selectedDesignations.includes(getUserDesignation(u))) return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(getUserRegion(u))) return false;
      if (selectedOrgDistricts.length > 0 && !selectedOrgDistricts.includes(getUserOrgDistrict(u))) return false;
      if (selectedMandalams.length > 0 && !selectedMandalams.includes(getUserMandalam(u))) return false;
      if (selectedAreas.length > 0 && !selectedAreas.includes(getUserArea(u))) return false;
      if (selectedBooths.length > 0 && !selectedBooths.includes(getUserBooth(u))) return false;

      return true;
    });
  }, [
    assignUsersList,
    userSearchQuery,
    selectedDesignations,
    selectedRegions,
    selectedOrgDistricts,
    selectedMandalams,
    selectedAreas,
    selectedBooths,
  ]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const allFilteredSelected =
    filteredAssignUsers.length > 0 &&
    filteredAssignUsers.every((u) => selectedUserIds.includes(u.id));

  const toggleSelectAllUsers = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredAssignUsers.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const next = new Set([...selectedUserIds, ...filteredAssignUsers.map((u) => u.id)]);
      setSelectedUserIds(Array.from(next));
    }
  };

  const handleSaveUserAssignment = () => {
    const updatedUsers = assignUsersList.map((u) => {
      if (selectedUserIds.includes(u.id)) {
        return { ...u, assignedRole: targetSavedRoleName };
      }
      if (u.assignedRole === targetSavedRoleName && !selectedUserIds.includes(u.id)) {
        return { ...u, assignedRole: "Sub Admin" };
      }
      return u;
    });

    saveManagedDesktopUsers(updatedUsers);

    // Update assignedUsers count in ManagedRole list
    const allRoles = loadManagedRoles();
    const updatedRoles = allRoles.map((r) =>
      r.name.trim().toLowerCase() === targetSavedRoleName.trim().toLowerCase()
        ? { ...r, assignedUsers: selectedUserIds.length, updatedAt: new Date().toISOString() }
        : r,
    );
    saveManagedRoles(updatedRoles);

    toast.success(
      tr(
        `Role and user assignments updated (${selectedUserIds.length} users assigned).`,
        `റോളും ഉപയോക്തൃ അസൈൻമെന്റും അപ്‌ഡേറ്റ് ചെയ്തു (${selectedUserIds.length} പേരെ അസൈൻ ചെയ്തു).`,
      ),
    );
    setShowAssignUsersSheet(false);
    void navigate({ to: "/admin/settings", search: { tab: "roles" } });
  };

  const handleSkipUserAssignment = () => {
    setShowAssignUsersSheet(false);
    void navigate({ to: "/admin/settings", search: { tab: "roles" } });
  };

  useEffect(() => {
    if (!editRoleId) return;
    const existingRole = loadManagedRoles().find((r) => r.id === editRoleId);
    if (!existingRole) return;

    setName(existingRole.name || "");
    setDescription(existingRole.description || "");
    if (existingRole.scopedPermissions && existingRole.scopedPermissions.length > 0) {
      setScopedPermissions(existingRole.scopedPermissions);
    }
    if (existingRole.dataAccess) {
      setModuleDataAccess(
        existingRole.dataAccess as Partial<Record<PermissionModuleId, DataAccessScope[]>>,
      );
    }
  }, [editRoleId]);

  const scopesForModule = (moduleId: PermissionModuleId): DataAccessScope[] => {
    const selectedScopes = (moduleDataAccess[moduleId] ?? []).filter(
      (scope) => scope !== "above_level",
    );
    return selectedScopes.length > 0 ? selectedScopes : ["own_records"];
  };

  const scopesForRow = (row: MatrixRow): DataAccessScope[] => scopesForModule(row.moduleId);

  const isCellSelected = (
    permissions: string[],
    row: MatrixRow,
    scope: DataAccessScope,
    columnId: MatrixColumnId,
  ) => {
    const actionIds = getMatrixColumnActionIds(row, columnId);
    return (
      actionIds.length > 0 &&
      actionIds.every((actionId) =>
        permissions.includes(scopedPermissionKey(row.moduleId, scope, actionId)),
      )
    );
  };

  const matrixCellSelected = (row: MatrixRow, scope: DataAccessScope, columnId: MatrixColumnId) =>
    isCellSelected(scopedPermissions, row, scope, columnId);

  const actionColumnState = (row: MatrixRow, columnId: MatrixColumnId) => {
    const scopes = scopesForRow(row);
    const selectedCount = scopes.filter((scope) => matrixCellSelected(row, scope, columnId)).length;
    return {
      selectedCount,
      all: scopes.length > 0 && selectedCount === scopes.length,
      partial: selectedCount > 0 && selectedCount < scopes.length,
    };
  };

  const totalMatrixCellCount = allMatrixRows.reduce(
    (moduleTotal, row) =>
      moduleTotal +
      row.columns.filter((column) => getMatrixColumnActionIds(row, column.id).length > 0).length *
        Math.max(scopesForRow(row).length, 1),
    0,
  );
  const selectedPermissionCount = allMatrixRows.reduce(
    (moduleTotal, row) =>
      moduleTotal +
      scopesForRow(row).reduce(
        (scopeTotal, scope) =>
          scopeTotal +
          row.columns.filter((column) => matrixCellSelected(row, scope, column.id)).length,
        0,
      ),
    0,
  );
  const allPermissionsSelected =
    totalMatrixCellCount > 0 && selectedPermissionCount === totalMatrixCellCount;
  const hasPartialPermissionSelection = selectedPermissionCount > 0 && !allPermissionsSelected;

  const toggleAllPermissions = () => {
    if (allPermissionsSelected) {
      setScopedPermissions([]);
    } else {
      setModuleDataAccess(
        Object.fromEntries(
          permissionModules.map((module) => [
            module.id,
            dataAccessChoices.map((option) => option.id),
          ]),
        ),
      );
      setScopedPermissions([...supportedScopedPermissionKeys]);
    }
    setErrors((current) => ({ ...current, permissions: "" }));
  };

  const selectActionForScope = (
    permissions: string[],
    row: MatrixRow,
    scope: DataAccessScope,
    columnId: MatrixColumnId,
    enabled: boolean,
  ) => {
    let next = permissions;
    for (const actionId of getMatrixColumnActionIds(row, columnId)) {
      next = toggleScopedPermissionAction(next, row.moduleId, scope, actionId, enabled);
    }
    const viewIsSupported = getMatrixColumnActionIds(row, "view").length > 0;

    if (enabled && viewIsSupported && columnId !== "view") {
      if (!isCellSelected(next, row, scope, "view")) {
        for (const actionId of getMatrixColumnActionIds(row, "view")) {
          next = toggleScopedPermissionAction(next, row.moduleId, scope, actionId, true);
        }
      }
    } else if (!enabled && columnId === "view") {
      for (const column of row.columns) {
        if (column.id === "view") continue;
        for (const actionId of getMatrixColumnActionIds(row, column.id)) {
          next = toggleScopedPermissionAction(next, row.moduleId, scope, actionId, false);
        }
      }
    }

    return next;
  };

  const toggleModuleAction = (row: MatrixRow, columnId: MatrixColumnId) => {
    const scopes = scopesForRow(row);
    if (scopes.length === 0) return;
    const state = actionColumnState(row, columnId);
    let next = scopedPermissions;

    const enable = !state.all;
    for (const scope of scopes) {
      next = selectActionForScope(next, row, scope, columnId, enable);
    }

    setScopedPermissions(next);
    setErrors((current) => ({ ...current, permissions: "" }));
  };

  const isActionGroupEnabled = (row: MatrixRow, columnId: MatrixColumnId) =>
    getMatrixColumnActionIds(row, columnId).some((actionId) =>
      scopesForRow(row).some((scope) =>
        scopedPermissions.includes(scopedPermissionKey(row.moduleId, scope, actionId)),
      ),
    );

  const toggleRowDataAccess = (row: MatrixRow, scope: DataAccessScope, checked: boolean) => {
    const scopes = scopesForRow(row);
    const nextScopeSet = new Set(
      checked ? [...scopes, scope] : scopes.filter((id) => id !== scope),
    );
    const nextScopes = dataAccessChoices
      .map((option) => option.id)
      .filter((id) => nextScopeSet.has(id));
    let next = scopedPermissions;

    for (const column of row.columns) {
      if (checked) {
        if (!isActionGroupEnabled(row, column.id)) continue;
        next = selectActionForScope(next, row, scope, column.id, true);
      } else {
        for (const actionId of getMatrixColumnActionIds(row, column.id)) {
          next = toggleScopedPermissionAction(next, row.moduleId, scope, actionId, false);
        }
      }
    }

    setModuleDataAccess((current) => ({ ...current, [row.moduleId]: nextScopes }));
    setScopedPermissions(next);
    setErrors((current) => ({ ...current, permissions: "" }));
  };

  const toggleRowDataAccessAll = (row: MatrixRow) => {
    const scopes = scopesForRow(row);
    if (scopes.length === dataAccessChoices.length) {
      let next = scopedPermissions;
      for (const column of row.columns) {
        for (const actionId of getMatrixColumnActionIds(row, column.id)) {
          for (const scope of dataAccessChoices) {
            next = toggleScopedPermissionAction(next, row.moduleId, scope.id, actionId, false);
          }
        }
      }
      setModuleDataAccess((current) => ({ ...current, [row.moduleId]: [] }));
      setScopedPermissions(next);
    } else {
      let next = scopedPermissions;
      for (const option of dataAccessChoices) {
        if (scopes.includes(option.id)) continue;
        for (const column of row.columns) {
          if (!isActionGroupEnabled(row, column.id)) continue;
          next = selectActionForScope(next, row, option.id, column.id, true);
        }
      }
      setModuleDataAccess((current) => ({
        ...current,
        [row.moduleId]: dataAccessChoices.map((option) => option.id),
      }));
      setScopedPermissions(next);
    }
    setErrors((current) => ({ ...current, permissions: "" }));
  };

  const dataAccessSummary = (scopes: DataAccessScope[]) => {
    if (scopes.length === 0) {
      return tr("Select access", "ആക്സസ് തിരഞ്ഞെടുക്കുക");
    }
    if (scopes.length === dataAccessChoices.length) {
      return tr("All Records", "എല്ലാ റെക്കോർഡുകളും");
    }
    const labels = dataAccessChoices
      .filter((option) => scopes.includes(option.id))
      .map((option) => (lang === "ml" ? option.shortMl : option.shortEn));
    return lang === "ml" ? `${labels.join(" + ")} റെക്കോർഡുകൾ` : `${labels.join(" + ")} Records`;
  };

  const handleSave = () => {
    const nextErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    if (!trimmedName) {
      nextErrors.name = tr("Role name is required.", "റോൾ നാമം ആവശ്യമാണ്.");
    }
    if (scopedPermissions.length === 0) {
      nextErrors.permissions = tr(
        "Select at least one module permission.",
        "കുറഞ്ഞത് ഒരു മൊഡ്യൂൾ അനുമതി തിരഞ്ഞെടുക്കുക.",
      );
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const now = new Date().toISOString();
    const dataAccess = permissionModules.reduce<NonNullable<ManagedRole["dataAccess"]>>(
      (current, module) => ({
        ...current,
        [module.id]: scopesForModule(module.id),
      }),
      { ...emptyRoleDraft.dataAccess },
    );

    const allRoles = loadManagedRoles();
    const existingRole = editRoleId ? allRoles.find((r) => r.id === editRoleId) : null;

    if (existingRole) {
      const updatedRole: ManagedRole = {
        ...existingRole,
        name: trimmedName,
        description: description.trim(),
        dataAccess,
        scopedPermissions: [...scopedPermissions],
        permissions: permissionsFromScopedPermissions(scopedPermissions, []),
        updatedAt: now,
      };
      saveManagedRoles(allRoles.map((r) => (r.id === editRoleId ? updatedRole : r)));
    } else {
      const role: ManagedRole = {
        id: createRoleId(),
        name: trimmedName,
        description: description.trim(),
        assignmentLevels: ["state"],
        permissions: permissionsFromScopedPermissions(scopedPermissions, []),
        administrativePermissions: [],
        dataAccess,
        scopedPermissions: [...scopedPermissions],
        status: "Active",
        system: false,
        assignedUsers: 0,
        createdAt: now,
        updatedAt: now,
      };
      saveManagedRoles([role, ...allRoles]);
    }

    // Open right-aligned User List popup
    setTargetSavedRoleName(trimmedName);
    const desktopUsers = loadManagedDesktopUsers();
    setAssignUsersList(desktopUsers);

    // Pre-select users who are assigned to this role
    const currentlyAssignedUserIds = desktopUsers
      .filter((u) => u.assignedRole === trimmedName)
      .map((u) => u.id);
    setSelectedUserIds(currentlyAssignedUserIds);
    setShowAssignUsersSheet(true);

    toast.success(
      tr(
        "Role saved. Select users to assign this role.",
        "റോൾ സംരക്ഷിച്ചു. ഇനി ഉപയോക്താക്കളെ അസൈൻ ചെയ്യുക.",
      ),
    );
  };

  const renderMatrixTable = (
    rows: MatrixRow[],
    columns: readonly MatrixColumn[],
    gridClass: string,
  ) => (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-2xs">
      <div
        className={cn(
          gridClass,
          "items-center border-b border-border bg-slate-50/60 py-3",
        )}
      >
        <span className="border-r border-border/60 pl-4 pr-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {tr("MODULES", "മൊഡ്യൂളുകൾ")}
        </span>
        {columns.map((column) => (
          <span
            key={column.id}
            className="border-r border-border/60 px-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            {lang === "ml"
              ? column.ml
              : column.id === "respond_reply"
                ? "RESPOND"
                : column.en.toUpperCase()}
          </span>
        ))}
        <span className="px-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {tr("DATA ACCESS LEVEL", "ഡാറ്റാ ആക്സസ് ലെവൽ")}
        </span>
      </div>

      {rows.map((row) => {
        const Icon = row.icon;

        return (
          <div key={row.key} className="border-b border-border/60 last:border-b-0">
            <div className={cn(gridClass, "items-center")}>
              <div className="flex h-12 min-w-0 items-center gap-2.5 border-r border-border/60 pl-4 pr-3">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0 truncate text-[13px] font-bold text-foreground">
                  {lang === "ml" ? row.ml : row.en}
                </span>
              </div>

              {row.columns.map((column) => {
                const actionIds = getMatrixColumnActionIds(row, column.id);
                if (actionIds.length === 0) {
                  return (
                    <div
                      key={column.id}
                      className="flex h-12 items-center justify-center border-r border-border/60 text-xs font-semibold text-muted-foreground/40"
                    >
                      —
                    </div>
                  );
                }
                const state = actionColumnState(row, column.id);
                const columnLabel = lang === "ml" ? column.ml : column.en;
                const canSelect = scopesForRow(row).length > 0;
                return (
                  <div
                    key={column.id}
                    className="flex h-12 items-center justify-center border-r border-border/60"
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={state.all ? true : state.partial ? "mixed" : false}
                      aria-label={`${row.en} ${columnLabel}`}
                      onClick={() => toggleModuleAction(row, column.id)}
                      disabled={!canSelect}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                        canSelect
                          ? "cursor-pointer hover:bg-primary/5"
                          : "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                          state.all
                            ? "border-primary bg-primary text-white shadow-2xs"
                            : state.partial
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-amber-500/70 bg-white hover:border-amber-600",
                        )}
                      >
                        {state.all ? (
                          <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                        ) : state.partial ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        ) : null}
                      </span>
                    </button>
                  </div>
                );
              })}

              <div className="flex h-12 items-center justify-center px-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${row.en} ${tr("Data Access", "ഡാറ്റ ആക്സസ്")}`}
                      className="flex h-8 w-full items-center justify-between gap-2 rounded-full border border-border/80 bg-white px-3.5 text-left text-xs font-medium text-slate-800 shadow-2xs transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <span className="min-w-0 truncate text-[12px] font-medium text-slate-700">
                        {dataAccessSummary(scopesForRow(row))}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 rounded-xl border-border p-2 shadow-lg">
                    <div className="space-y-0.5">
                      {dataAccessChoices.map((option) => {
                        const checked = scopesForRow(row).includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            onClick={() => toggleRowDataAccess(row, option.id, !checked)}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          >
                            <span
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
                                checked
                                  ? "border-primary bg-primary text-white"
                                  : "border-border bg-white",
                              )}
                            >
                              {checked ? <Check className="h-3 w-3 stroke-[3] text-white" /> : null}
                            </span>
                            <span>{lang === "ml" ? option.shortMl : option.shortEn}</span>
                          </button>
                        );
                      })}
                      <div className="my-1 h-px bg-border" />
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={scopesForRow(row).length === dataAccessChoices.length}
                        onClick={() => toggleRowDataAccessAll(row)}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-bold text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
                            scopesForRow(row).length === dataAccessChoices.length
                              ? "border-primary bg-primary text-white"
                              : "border-border bg-white",
                          )}
                        >
                          {scopesForRow(row).length === dataAccessChoices.length ? (
                            <Check className="h-3 w-3 stroke-[3] text-white" />
                          ) : null}
                        </span>
                        <span>{tr("All", "എല്ലാം")}</span>
                        <span className="ml-auto text-[10px] font-semibold text-muted-foreground">
                          {tr("3 levels", "3 തലങ്ങൾ")}
                        </span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full pb-10 text-foreground md:pb-28">
      <section className="sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5">
        <div className="flex items-center justify-between gap-3 pb-1 sm:pb-0">
          <div className="flex items-center gap-3 sm:gap-2.5">
            <button
              type="button"
              onClick={() => void navigate({ to: "/admin/settings", search: { tab: "roles" } })}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary group cursor-pointer sm:h-8 sm:w-8"
              title={tr("Back to Roles and Control", "റോളുകളിലേക്ക് തിരികെ പോകുക")}
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 sm:h-3.5 sm:w-3.5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                {editRoleId
                  ? tr("Edit Role", "റോൾ തിരുത്തുക")
                  : tr("Create New Role", "പുതിയ റോൾ സൃഷ്ടിക്കുക")}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 sm:mt-5">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-xs font-bold text-foreground">
                <span>{tr("Role Name", "റോൾ നാമം")}</span>
                <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setErrors((current) => ({ ...current, name: "" }));
                }}
                placeholder={tr("e.g. Area Coordinator", "ഉദാ: ഏരിയ കോർഡിനേറ്റർ")}
                aria-invalid={Boolean(errors.name)}
                className={cn(
                  "h-11 w-full rounded-xl border border-border bg-white px-3.5 text-xs text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 sm:text-sm",
                  errors.name && "border-destructive",
                )}
              />
              {errors.name ? (
                <p className="text-[11px] font-semibold text-destructive">{errors.name}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {tr("Description", "വിവരണം")}
              </label>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={tr(
                  "Explain this role's responsibilities and scope.",
                  "ഈ റോളിന്റെ ഉത്തരവാദിത്വങ്ങളും പരിധിയും വിശദീകരിക്കുക.",
                )}
                className="h-11 w-full rounded-xl border border-border bg-white px-3.5 text-xs text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-1 font-display text-base font-bold text-foreground">
                <span>{tr("Module Permissions", "മൊഡ്യൂൾ അനുമതികൾ")}</span>
                <span className="text-destructive">*</span>
              </h2>
              <button
                type="button"
                role="checkbox"
                aria-checked={
                  allPermissionsSelected ? true : hasPartialPermissionSelection ? "mixed" : false
                }
                onClick={toggleAllPermissions}
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
                  allPermissionsSelected
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
                    allPermissionsSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-white",
                  )}
                >
                  {allPermissionsSelected ? (
                    <Check className="h-3 w-3 stroke-[3]" />
                  ) : hasPartialPermissionSelection ? (
                    <span className="h-[2px] w-2 rounded-full bg-primary" />
                  ) : null}
                </span>
                <span>{tr("All", "എല്ലാം")}</span>
              </button>
            </div>

            {errors.permissions ? (
              <p className="mt-2 text-[11px] font-semibold text-destructive">
                {errors.permissions}
              </p>
            ) : null}

            <div className="mt-4 space-y-3">
              {renderMatrixTable(primaryMatrixRows, primaryMatrixColumns, primaryMatrixGridClass)}
              {renderMatrixTable(
                secondaryMatrixRows,
                secondaryMatrixColumns,
                secondaryMatrixGridClass,
              )}
            </div>
          </div>
        </section>

        <div
          className="mt-4 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur md:fixed md:bottom-0 md:right-0 md:z-40 md:mt-0 md:rounded-none md:border-x-0 md:border-b-0 md:border-t md:p-3 md:px-8 md:backdrop-blur-md md:transition-all md:duration-200"
          style={
            isMobile
              ? undefined
              : {
                  left: sidebarState === "expanded" ? "16rem" : "3rem",
                  right: "0",
                }
          }
        >
          <div className="flex w-full items-center justify-end gap-2 overflow-x-auto no-scrollbar desktop-hide-scrollbar">
            <Button
              type="button"
              variant="outline"
              onClick={() => void navigate({ to: "/admin/settings", search: { tab: "roles" } })}
              className="shrink-0 md:h-10 md:rounded-lg md:border-border md:bg-card md:px-5 md:py-2 md:text-xs md:font-bold md:shadow-2xs md:transition-all md:hover:bg-muted md:hover:text-foreground"
            >
              {tr("Cancel", "റദ്ദാക്കുക")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="shrink-0 gap-2 md:h-10 md:rounded-lg md:bg-primary md:px-5 md:py-2 md:text-xs md:font-bold md:shadow-xs md:transition-all md:hover:bg-primary/90 md:active:scale-98"
            >
              <Check className="h-4 w-4" />
              {editRoleId
                ? tr("Save Changes", "മാറ്റങ്ങൾ സംരക്ഷിക്കുക")
                : tr("Create Role", "റോൾ സൃഷ്ടിക്കുക")}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Aligned Users List Popup */}
      <Sheet
        open={showAssignUsersSheet}
        onOpenChange={(open) => {
          if (!open) handleSkipUserAssignment();
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full p-0 gap-0 bg-white">
          <SheetHeader className="p-5 border-b border-border bg-white text-left space-y-1">
            <SheetTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <UserPlus className="h-5 w-5 text-primary" />
              {tr(
                `Assign Users to "${targetSavedRoleName}"`,
                `"${targetSavedRoleName}" റോളിലേക്ക് ഉപയോക്താക്കളെ അസൈൻ ചെയ്യുക`,
              )}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {tr(
                "Select desktop users to assign this role. Multi-selection enabled.",
                "ഈ റോൾ നൽകാനായി ഉപയോക്താക്കളെ തിരഞ്ഞെടുക്കുക (ഒന്നിലധികം പേരെ തിരഞ്ഞെടുക്കാം).",
              )}
            </SheetDescription>

            {/* Search Input & Filter Button */}
            <div className="relative mt-3 flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder={tr(
                    "Search users by name or designation...",
                    "പേരിലോ തസ്തികയിലോ തിരയുക...",
                  )}
                  className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer",
                      drawerActiveFilterCount > 0
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{tr("Filter", "ഫിൽട്ടർ")}</span>
                    {drawerActiveFilterCount > 0 && (
                      <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {drawerActiveFilterCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-3 text-xs space-y-3 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border">
                    <span className="font-bold text-foreground text-xs">{tr("Filter Users", "ഉപയോക്താക്കളെ ഫിൽട്ടർ ചെയ്യുക")}</span>
                    {drawerActiveFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDesignations([]);
                          setSelectedRegions([]);
                          setSelectedOrgDistricts([]);
                          setSelectedMandalams([]);
                          setSelectedAreas([]);
                          setSelectedBooths([]);
                        }}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {tr("Reset All", "റീസെറ്റ് ചെയ്യുക")}
                      </button>
                    )}
                  </div>

                  {/* 1. Designation Filter */}
                  {availDesignations.length > 0 && (
                    <div>
                      <p className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                        {tr("Designation", "തസ്തിക")}
                      </p>
                      <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1">
                        {availDesignations.map((item) => {
                          const checked = selectedDesignations.includes(item);
                          return (
                            <div
                              key={item}
                              onClick={() => toggleArrayFilter(selectedDesignations, setSelectedDesignations, item)}
                              className={cn(
                                "flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer select-none transition-colors text-xs font-semibold",
                                checked
                                  ? "bg-[#FFF8F0] text-amber-950 font-bold"
                                  : "hover:bg-slate-100 text-slate-800",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                  checked
                                    ? "border-amber-500 bg-amber-500 text-white"
                                    : "border-amber-400 bg-white",
                                )}
                              >
                                {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. Region Filter */}
                  {availRegions.length > 0 && (
                    <div>
                      <p className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                        {tr("Region", "മേഖല")}
                      </p>
                      <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1">
                        {availRegions.map((item) => {
                          const checked = selectedRegions.includes(item);
                          return (
                            <div
                              key={item}
                              onClick={() => toggleArrayFilter(selectedRegions, setSelectedRegions, item)}
                              className={cn(
                                "flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer select-none transition-colors text-xs font-semibold",
                                checked
                                  ? "bg-[#FFF8F0] text-amber-950 font-bold"
                                  : "hover:bg-slate-100 text-slate-800",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                  checked
                                    ? "border-amber-500 bg-amber-500 text-white"
                                    : "border-amber-400 bg-white",
                                )}
                              >
                                {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. Org District Filter */}
                  {availOrgDistricts.length > 0 && (
                    <div>
                      <p className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                        {tr("Org District", "സംഘടനാ ജില്ല")}
                      </p>
                      <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1">
                        {availOrgDistricts.map((item) => {
                          const checked = selectedOrgDistricts.includes(item);
                          return (
                            <div
                              key={item}
                              onClick={() => toggleArrayFilter(selectedOrgDistricts, setSelectedOrgDistricts, item)}
                              className={cn(
                                "flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer select-none transition-colors text-xs font-semibold",
                                checked
                                  ? "bg-[#FFF8F0] text-amber-950 font-bold"
                                  : "hover:bg-slate-100 text-slate-800",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                  checked
                                    ? "border-amber-500 bg-amber-500 text-white"
                                    : "border-amber-400 bg-white",
                                )}
                              >
                                {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. Mandalam Filter */}
                  {availMandalams.length > 0 && (
                    <div>
                      <p className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                        {tr("Mandalam", "മണ്ഡലം")}
                      </p>
                      <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1">
                        {availMandalams.map((item) => {
                          const checked = selectedMandalams.includes(item);
                          return (
                            <div
                              key={item}
                              onClick={() => toggleArrayFilter(selectedMandalams, setSelectedMandalams, item)}
                              className={cn(
                                "flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer select-none transition-colors text-xs font-semibold",
                                checked
                                  ? "bg-[#FFF8F0] text-amber-950 font-bold"
                                  : "hover:bg-slate-100 text-slate-800",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                  checked
                                    ? "border-amber-500 bg-amber-500 text-white"
                                    : "border-amber-400 bg-white",
                                )}
                              >
                                {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 5. Area Filter */}
                  {availAreas.length > 0 && (
                    <div>
                      <p className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                        {tr("Area", "ഏരിയ")}
                      </p>
                      <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1">
                        {availAreas.map((item) => {
                          const checked = selectedAreas.includes(item);
                          return (
                            <div
                              key={item}
                              onClick={() => toggleArrayFilter(selectedAreas, setSelectedAreas, item)}
                              className={cn(
                                "flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer select-none transition-colors text-xs font-semibold",
                                checked
                                  ? "bg-[#FFF8F0] text-amber-950 font-bold"
                                  : "hover:bg-slate-100 text-slate-800",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                  checked
                                    ? "border-amber-500 bg-amber-500 text-white"
                                    : "border-amber-400 bg-white",
                                )}
                              >
                                {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 6. Booth Filter */}
                  {availBooths.length > 0 && (
                    <div>
                      <p className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                        {tr("Booth", "ബൂത്ത്")}
                      </p>
                      <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1">
                        {availBooths.map((item) => {
                          const checked = selectedBooths.includes(item);
                          return (
                            <div
                              key={item}
                              onClick={() => toggleArrayFilter(selectedBooths, setSelectedBooths, item)}
                              className={cn(
                                "flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer select-none transition-colors text-xs font-semibold",
                                checked
                                  ? "bg-[#FFF8F0] text-amber-950 font-bold"
                                  : "hover:bg-slate-100 text-slate-800",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                  checked
                                    ? "border-amber-500 bg-amber-500 text-white"
                                    : "border-amber-400 bg-white",
                                )}
                              >
                                {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetHeader>

          {/* Selection Bar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-border text-xs shrink-0">
            <span className="font-semibold text-muted-foreground">
              {tr(
                `${selectedUserIds.length} of ${assignUsersList.length} users selected`,
                `${selectedUserIds.length} / ${assignUsersList.length} ഉപയോക്താക്കൾ`,
              )}
            </span>
            <button
              type="button"
              onClick={toggleSelectAllUsers}
              className="text-primary font-bold hover:underline cursor-pointer text-xs"
            >
              {allFilteredSelected
                ? tr("Deselect All", "എല്ലാം ഒഴിവാക്കുക")
                : tr("Select All", "എല്ലാം തിരഞ്ഞെടുക്കുക")}
            </button>
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
            {filteredAssignUsers.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                {tr("No matching users found.", "ഉപയോക്താക്കളെ കണ്ടെത്തിയില്ല.")}
              </div>
            ) : (
              filteredAssignUsers.map((user) => {
                const isChecked = selectedUserIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                      isChecked
                        ? "border-primary/50 bg-white shadow-2xs ring-1 ring-primary/20"
                        : "border-border/60 bg-white hover:bg-slate-50/60",
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                      className="pointer-events-none"
                    />
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-foreground truncate">
                        {lang === "ml" ? user.nameMl || user.name : user.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {lang === "ml" ? user.designationMl : user.designationEn}
                        {(user.constituencyEn || user.districtNameEn) && (
                          <span className="text-muted-foreground/80 font-medium">
                            {" • "}
                            {lang === "ml"
                              ? `${user.constituencyMl || user.districtNameMl}${user.districtNameMl ? `, ${user.districtNameMl}` : ""}`
                              : `${user.constituencyEn || user.districtNameEn}${user.districtNameEn ? `, ${user.districtNameEn}` : ""}`}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-white flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipUserAssignment}
              className="h-9 px-3.5 text-xs font-semibold cursor-pointer bg-white"
            >
              {tr("Skip", "ഒഴിവാക്കുക")}
            </Button>
            <Button
              type="button"
              onClick={handleSaveUserAssignment}
              className="h-9 px-4 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              {tr("Assign & Save", "അസൈൻ ചെയ്ത് സേവ് ചെയ്യുക")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
