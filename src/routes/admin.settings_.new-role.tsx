import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Check,
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
  syncRoleDataAccessWithScopedPermissions,
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

const primaryMatrixGridClass = "grid grid-cols-[minmax(0,1fr)_repeat(4,84px)]";
const secondaryMatrixGridClass = "grid grid-cols-[minmax(0,1fr)_repeat(3,112px)]";

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

const totalMatrixCellCount = allMatrixRows.reduce(
  (moduleTotal, row) =>
    moduleTotal +
    row.columns.filter((column) => getMatrixColumnActionIds(row, column.id).length > 0).length *
      dataAccessOptions.length,
  0,
);

function CreateRolePage() {
  const { lang } = useLang();
  const { isMobile, state: sidebarState } = useSidebar();
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scopedPermissions, setScopedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const selectedCount = dataAccessOptions.filter((scope) =>
      matrixCellSelected(row, scope.id, columnId),
    ).length;
    return {
      selectedCount,
      all: selectedCount === dataAccessOptions.length,
      partial: selectedCount > 0 && selectedCount < dataAccessOptions.length,
    };
  };

  const selectedPermissionCount = allMatrixRows.reduce(
    (moduleTotal, row) =>
      moduleTotal +
      dataAccessOptions.reduce(
        (scopeTotal, scope) =>
          scopeTotal +
          row.columns.filter((column) => matrixCellSelected(row, scope.id, column.id)).length,
        0,
      ),
    0,
  );
  const allPermissionsSelected =
    totalMatrixCellCount > 0 && selectedPermissionCount === totalMatrixCellCount;
  const hasPartialPermissionSelection = selectedPermissionCount > 0 && !allPermissionsSelected;

  const toggleAllPermissions = () => {
    const next = allPermissionsSelected ? [] : [...allScopedPermissionKeysWithExtras];
    setScopedPermissions(next);
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
    const state = actionColumnState(row, columnId);
    let next = scopedPermissions;

    if (state.all) {
      for (const scope of dataAccessOptions) {
        next = selectActionForScope(next, row, scope.id, columnId, false);
      }
    } else if (state.partial) {
      for (const scope of dataAccessOptions) {
        next = selectActionForScope(next, row, scope.id, columnId, true);
      }
    } else {
      const ownScope = dataAccessOptions[0].id;
      next = selectActionForScope(next, row, ownScope, columnId, true);
    }

    setScopedPermissions(next);
    setErrors((current) => ({ ...current, permissions: "" }));
  };

  const toggleMatrixCell = (
    row: MatrixRow,
    scope: DataAccessScope,
    columnId: MatrixColumnId,
    checked: boolean,
  ) => {
    setScopedPermissions(selectActionForScope(scopedPermissions, row, scope, columnId, checked));
    setErrors((current) => ({ ...current, permissions: "" }));
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
    const role: ManagedRole = {
      id: createRoleId(),
      name: trimmedName,
      description: description.trim(),
      assignmentLevels: ["state"],
      permissions: permissionsFromScopedPermissions(scopedPermissions, []),
      administrativePermissions: [],
      dataAccess: syncRoleDataAccessWithScopedPermissions(
        emptyRoleDraft.dataAccess,
        scopedPermissions,
      ),
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
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
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
      </div>

      {rows.map((row) => {
        const Icon = row.icon;
        const moduleSelectedCount = dataAccessOptions.reduce(
          (scopeTotal, scope) =>
            scopeTotal +
            row.columns.filter((column) => matrixCellSelected(row, scope.id, column.id)).length,
          0,
        );
        const moduleTotalCellCount =
          row.columns.filter((column) => getMatrixColumnActionIds(row, column.id).length > 0)
            .length * dataAccessOptions.length;
        const moduleHasAccess = moduleSelectedCount > 0;

        return (
          <div key={row.key} className="border-t border-border first:border-t-0">
            <div className={cn(gridClass, "items-center gap-1 px-4 py-2")}>
              <div className="flex min-w-0 items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0 truncate text-[12.5px] font-extrabold text-foreground">
                  {lang === "ml" ? row.ml : row.en}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                    moduleSelectedCount > 0
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {moduleSelectedCount}/{moduleTotalCellCount}
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
                return (
                  <button
                    key={column.id}
                    type="button"
                    role="checkbox"
                    aria-checked={state.all ? true : state.partial ? "mixed" : false}
                    aria-label={`${row.en} ${columnLabel}`}
                    onClick={() => toggleModuleAction(row, column.id)}
                    className="flex h-11 w-full cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
            </div>

            {moduleHasAccess ? (
              <div className="border-t border-border/60 bg-muted/20 px-4 py-2">
                <div className={cn(gridClass, "items-center gap-1 pb-1")}>
                  <span className="text-[8.5px] font-black uppercase tracking-wide text-primary">
                    {tr("Data Access", "ഡാറ്റ ആക്സസ്")}
                  </span>
                </div>
                {dataAccessOptions.map((scope) => (
                  <div
                    key={scope.id}
                    className={cn(gridClass, "items-center gap-1 border-t border-border/40 py-1")}
                  >
                    <span className="min-w-0 text-xs font-bold text-foreground">
                      {lang === "ml" ? scope.shortMl : scope.shortEn}
                    </span>
                    {row.columns.map((column) => {
                      const actionIds = getMatrixColumnActionIds(row, column.id);
                      if (actionIds.length === 0) {
                        return (
                          <span
                            key={column.id}
                            className="flex h-9 items-center justify-center text-xs font-semibold text-muted-foreground/40"
                          >
                            —
                          </span>
                        );
                      }
                      const checked = matrixCellSelected(row, scope.id, column.id);
                      return (
                        <button
                          key={column.id}
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          aria-label={`${row.en} ${scope.en} ${
                            lang === "ml" ? column.ml : column.en
                          }`}
                          onClick={() => toggleMatrixCell(row, scope.id, column.id, !checked)}
                          className="flex h-9 w-full cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          <span
                            className={cn(
                              "flex h-4.5 w-4.5 items-center justify-center rounded-[4px] border",
                              checked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-white",
                            )}
                          >
                            {checked ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : null}
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
                <span>
                  ({selectedPermissionCount}/{totalMatrixCellCount})
                </span>
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
