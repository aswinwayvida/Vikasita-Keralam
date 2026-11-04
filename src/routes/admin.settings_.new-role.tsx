import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Headset,
  ShieldCheck,
  UserRound,
  Users,
  Users2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings_/new-role")({
  head: () => ({
    meta: [{ title: "Create New Role · Admin · Vikasita Keralam" }],
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

const primaryMatrixGridClass = "grid grid-cols-[minmax(200px,1fr)_repeat(4,84px)_360px]";
const secondaryMatrixGridClass = "grid grid-cols-[minmax(200px,1fr)_repeat(3,104px)_360px]";

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
    en: module.en,
    ml: module.ml,
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

    saveManagedRoles([role, ...loadManagedRoles()]);
    toast.success(tr("Role created successfully.", "റോൾ വിജയകരമായി സൃഷ്ടിച്ചു."));
    void navigate({ to: "/admin/settings", search: { tab: "roles" } });
  };

  const renderMatrixTable = (
    rows: MatrixRow[],
    columns: readonly MatrixColumn[],
    gridClass: string,
  ) => (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <div
        className={cn(
          gridClass,
          "items-center gap-1 border-b border-border bg-muted/40 px-4 py-2.5",
        )}
      >
        <span className="text-[9px] font-black uppercase tracking-wide text-primary md:text-[11px]">
          {tr("Modules", "മൊഡ്യൂളുകൾ")}
        </span>
        {columns.map((column) => (
          <span
            key={column.id}
            className="text-center text-[9px] font-black uppercase tracking-tight text-primary md:text-[11px] md:leading-tight"
          >
            {lang === "ml" ? column.ml : column.en}
          </span>
        ))}
        <span className="text-center text-[9px] font-black uppercase tracking-tight text-primary md:text-[11px] md:leading-tight">
          {tr("Data Access", "ഡാറ്റ ആക്സസ്")}
        </span>
      </div>

      {rows.map((row) => {
        const Icon = row.icon;

        return (
          <div key={row.key} className="border-t border-border first:border-t-0">
            <div className={cn(gridClass, "items-center gap-1 px-4 py-2")}>
              <div className="flex min-w-0 items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0 truncate text-[12.5px] font-extrabold text-foreground">
                  {lang === "ml" ? row.ml : row.en}
                </span>
              </div>

              {row.columns.map((column) => {
                const actionIds = getMatrixColumnActionIds(row, column.id);
                if (actionIds.length === 0) {
                  return (
                    <span
                      key={column.id}
                      title={tr("Unavailable", "ലഭ്യമല്ല")}
                      aria-label={tr("Unavailable", "ലഭ്യമല്ല")}
                      className="flex h-11 items-center justify-center text-xs font-semibold text-muted-foreground/40"
                    >
                      —
                    </span>
                  );
                }
                const state = actionColumnState(row, column.id);
                const columnLabel = lang === "ml" ? column.ml : column.en;
                const canSelect = scopesForRow(row).length > 0;
                return (
                  <button
                    key={column.id}
                    type="button"
                    role="checkbox"
                    aria-checked={state.all ? true : state.partial ? "mixed" : false}
                    aria-label={`${row.en} ${columnLabel}`}
                    onClick={() => toggleModuleAction(row, column.id)}
                    disabled={!canSelect}
                    className={cn(
                      "flex h-11 w-full items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                      canSelect
                        ? "cursor-pointer hover:bg-primary/5"
                        : "cursor-not-allowed opacity-40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-[4px] border",
                        state.all
                          ? "border-primary bg-primary text-primary-foreground"
                          : state.partial
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-white",
                      )}
                    >
                      {state.all ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : state.partial ? (
                        <span className="h-[2px] w-2.5 rounded-full bg-primary" />
                      ) : null}
                    </span>
                  </button>
                );
              })}

              <div className="flex h-11 items-center justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${row.en} ${tr("Data Access", "ഡാറ്റ ആക്സസ്")}`}
                      className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 text-left text-[11px] font-semibold text-foreground shadow-2xs transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <span className="min-w-0 truncate">
                        {dataAccessSummary(scopesForRow(row))}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 rounded-lg border-border p-2">
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
                            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] font-semibold text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          >
                            <span
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
                                checked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-white",
                              )}
                            >
                              {checked ? <Check className="h-3 w-3 stroke-[3]" /> : null}
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
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] font-bold text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
                            scopesForRow(row).length === dataAccessChoices.length
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-white",
                          )}
                        >
                          {scopesForRow(row).length === dataAccessChoices.length ? (
                            <Check className="h-3 w-3 stroke-[3]" />
                          ) : null}
                        </span>
                        <span>{tr("All", "എല്ലാം")}</span>
                        <span className="ml-auto text-[9px] font-semibold text-muted-foreground">
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
                {tr("Create New Role", "പുതിയ റോൾ സൃഷ്ടിക്കുക")}
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
              {tr("Create Role", "റോൾ സൃഷ്ടിക്കുക")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
