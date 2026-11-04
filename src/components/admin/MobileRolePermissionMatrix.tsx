import {
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
  type LucideIcon,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { permissionModules, type PermissionModuleId } from "@/data/party-workers";
import {
  allScopedPermissionKeysWithExtras,
  dataAccessOptions,
  getPermissionMatrixActionIds,
  permissionsFromScopedPermissions,
  scopedPermissionKey,
  toggleScopedPermissionAction,
  type DataAccessScope,
  type RoleDataAccess,
  type RoleDraft,
} from "@/data/role-management";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

interface MobileRolePermissionMatrixProps {
  draft: RoleDraft;
  scopedPermissions: string[];
  onChange: (next: {
    scopedPermissions: string[];
    permissions: string[];
    dataAccess: RoleDataAccess;
  }) => void;
}

interface MatrixColumn {
  id: string;
  en: string;
  ml: string;
  actionIds: string[];
}

interface MatrixRow {
  key: string;
  moduleId: PermissionModuleId;
  en: string;
  ml: string;
  icon: LucideIcon;
  columns: MatrixColumn[];
}

const moduleIcons: Record<PermissionModuleId, LucideIcon> = {
  schemes: FileText,
  party_workers: Users,
  applications: ClipboardList,
  help_desk: Headset,
  applicant_profile: UserRound,
  roles: ShieldCheck,
  designations: Users2,
};

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

const crudColumns = [
  { id: "create", en: "Create", ml: "സൃഷ്ടിക്കുക" },
  { id: "view", en: "View", ml: "കാണുക" },
  { id: "edit", en: "Edit", ml: "തിരുത്തുക" },
  { id: "delete", en: "Delete", ml: "നീക്കം ചെയ്യുക" },
] as const;

const primaryRows: MatrixRow[] = orderedPermissionModules
  .filter((module) => module.id !== "help_desk")
  .map((module) => ({
    key: module.id,
    moduleId: module.id,
    en: module.en,
    ml: module.ml,
    icon: moduleIcons[module.id],
    columns: crudColumns.map((column) => ({
      ...column,
      actionIds: getPermissionMatrixActionIds(module.id, column.id),
    })),
  }));

const secondaryColumns: MatrixColumn[] = [
  { id: "view", en: "View", ml: "കാണുക", actionIds: ["view"] },
  { id: "assign", en: "Assign", ml: "അസൈൻ ചെയ്യുക", actionIds: ["assign_team_member"] },
  { id: "respond", en: "Respond/Reply", ml: "മറുപടി നൽകുക", actionIds: ["respond_reply"] },
];

const secondaryRows: MatrixRow[] = [
  {
    key: "help_desk",
    moduleId: "help_desk",
    en: "Request",
    ml: "അഭ്യർത്ഥന",
    icon: Headset,
    columns: secondaryColumns,
  },
  {
    key: "team",
    moduleId: "party_workers",
    en: "Team",
    ml: "ടീം",
    icon: UsersRound,
    columns: secondaryColumns.map((column) =>
      column.id === "view" ? { ...column, actionIds: ["view_teams"] } : column,
    ),
  },
];

const allMatrixRows = [...primaryRows, ...secondaryRows];

const dataAccessChoices = dataAccessOptions.filter((option) => option.id !== "above_level");
const supportedScopedPermissionKeys = allScopedPermissionKeysWithExtras.filter(
  (key) => !key.includes(".above_level."),
);
const fallbackScopes: DataAccessScope[] = ["own_records"];

const primaryGridClass = "grid grid-cols-[minmax(0,1fr)_repeat(4,40px)] gap-1";
const secondaryGridClass = "grid grid-cols-[minmax(0,1fr)_46px_46px_68px] gap-1";

export function MobileRolePermissionMatrix({
  draft,
  scopedPermissions,
  onChange,
}: MobileRolePermissionMatrixProps) {
  const { lang } = useLang();
  const isMalayalam = lang === "ml";
  const tr = (en: string, ml: string) => (isMalayalam ? ml : en);
  const scopedPermissionSet = new Set(scopedPermissions);

  const scopesForModule = (moduleId: PermissionModuleId): DataAccessScope[] => {
    const selectedScopes = (draft.dataAccess[moduleId] ?? []).filter(
      (scope) => scope !== "above_level",
    );
    return selectedScopes.length > 0 ? selectedScopes : fallbackScopes;
  };

  const actionIdsSelected = (
    moduleId: PermissionModuleId,
    scope: DataAccessScope,
    actionIds: string[],
  ) =>
    actionIds.length > 0 &&
    actionIds.every((actionId) =>
      scopedPermissionSet.has(scopedPermissionKey(moduleId, scope, actionId)),
    );

  const actionColumnState = (row: MatrixRow, column: MatrixColumn) => {
    const scopes = scopesForModule(row.moduleId);
    const selectedCount = scopes.filter((scope) =>
      actionIdsSelected(row.moduleId, scope, column.actionIds),
    ).length;
    return {
      all: scopes.length > 0 && selectedCount === scopes.length,
      partial: selectedCount > 0 && selectedCount < scopes.length,
    };
  };

  const isActionGroupEnabled = (row: MatrixRow, column: MatrixColumn) =>
    column.actionIds.some((actionId) =>
      scopesForModule(row.moduleId).some((scope) =>
        scopedPermissionSet.has(scopedPermissionKey(row.moduleId, scope, actionId)),
      ),
    );

  const emitChange = (nextScopedPermissions: string[], nextDataAccess: RoleDataAccess) => {
    onChange({
      scopedPermissions: nextScopedPermissions,
      permissions: permissionsFromScopedPermissions(nextScopedPermissions, draft.permissions),
      dataAccess: nextDataAccess,
    });
  };

  const toggleModuleAction = (row: MatrixRow, column: MatrixColumn) => {
    const scopes = scopesForModule(row.moduleId);
    const enabled = !actionColumnState(row, column).all;
    let next = scopedPermissions;
    for (const scope of scopes) {
      for (const actionId of column.actionIds) {
        next = toggleScopedPermissionAction(next, row.moduleId, scope, actionId, enabled);
      }
    }
    emitChange(next, draft.dataAccess);
  };

  const toggleModuleDataAccess = (row: MatrixRow, scope: DataAccessScope, checked: boolean) => {
    const scopes = scopesForModule(row.moduleId);
    const nextScopeSet = new Set(
      checked ? [...scopes, scope] : scopes.filter((id) => id !== scope),
    );
    const nextScopes = dataAccessChoices
      .map((option) => option.id)
      .filter((id) => nextScopeSet.has(id));
    const normalizedScopes = nextScopes.length > 0 ? nextScopes : fallbackScopes;
    let next = scopedPermissions;

    for (const moduleRow of allMatrixRows.filter(
      (candidate) => candidate.moduleId === row.moduleId,
    )) {
      for (const column of moduleRow.columns) {
        if (checked) {
          if (!isActionGroupEnabled(moduleRow, column)) continue;
          for (const actionId of column.actionIds) {
            next = toggleScopedPermissionAction(next, row.moduleId, scope, actionId, true);
          }
        } else {
          for (const actionId of column.actionIds) {
            next = toggleScopedPermissionAction(next, row.moduleId, scope, actionId, false);
          }
        }
      }
    }

    emitChange(next, { ...draft.dataAccess, [row.moduleId]: normalizedScopes });
  };

  const toggleAllScopesForModule = (row: MatrixRow) => {
    const scopes = scopesForModule(row.moduleId);
    const allSelected = scopes.length === dataAccessChoices.length;
    let next = scopedPermissions;

    if (allSelected) {
      for (const moduleRow of allMatrixRows.filter(
        (candidate) => candidate.moduleId === row.moduleId,
      )) {
        for (const column of moduleRow.columns) {
          for (const scope of dataAccessChoices) {
            for (const actionId of column.actionIds) {
              next = toggleScopedPermissionAction(next, row.moduleId, scope.id, actionId, false);
            }
          }
        }
      }
      emitChange(next, { ...draft.dataAccess, [row.moduleId]: fallbackScopes });
      return;
    }

    for (const option of dataAccessChoices) {
      if (scopes.includes(option.id)) continue;
      for (const moduleRow of allMatrixRows.filter(
        (candidate) => candidate.moduleId === row.moduleId,
      )) {
        for (const column of moduleRow.columns) {
          if (!isActionGroupEnabled(moduleRow, column)) continue;
          for (const actionId of column.actionIds) {
            next = toggleScopedPermissionAction(next, row.moduleId, option.id, actionId, true);
          }
        }
      }
    }
    emitChange(next, {
      ...draft.dataAccess,
      [row.moduleId]: dataAccessChoices.map((option) => option.id),
    });
  };

  const dataAccessSummary = (scopes: DataAccessScope[]) => {
    if (scopes.length === dataAccessChoices.length) {
      return tr("All Records", "എല്ലാ റെക്കോർഡുകളും");
    }
    const labels = dataAccessChoices
      .filter((option) => scopes.includes(option.id))
      .map((option) => (isMalayalam ? option.shortMl : option.shortEn));
    return isMalayalam ? `${labels.join(" + ")} റെക്കോർഡുകൾ` : `${labels.join(" + ")} Records`;
  };

  const totalMatrixCellCount = allMatrixRows.reduce(
    (total, row) => total + row.columns.length * dataAccessChoices.length,
    0,
  );
  const selectedPermissionCount = allMatrixRows.reduce(
    (total, row) =>
      total +
      row.columns.reduce(
        (columnTotal, column) =>
          columnTotal +
          dataAccessChoices.filter((option) =>
            actionIdsSelected(row.moduleId, option.id, column.actionIds),
          ).length,
        0,
      ),
    0,
  );
  const allPermissionsSelected =
    totalMatrixCellCount > 0 && selectedPermissionCount === totalMatrixCellCount;
  const hasPartialPermissionSelection = selectedPermissionCount > 0 && !allPermissionsSelected;

  const toggleAllPermissions = () => {
    if (allPermissionsSelected) {
      const nextDataAccess = Object.fromEntries(
        orderedPermissionModules.map((module) => [module.id, [...fallbackScopes]]),
      ) as RoleDataAccess;
      emitChange([], nextDataAccess);
      return;
    }

    const nextDataAccess = Object.fromEntries(
      orderedPermissionModules.map((module) => [
        module.id,
        dataAccessChoices.map((option) => option.id),
      ]),
    ) as RoleDataAccess;
    emitChange([...supportedScopedPermissionKeys], nextDataAccess);
  };

  const renderMatrixTable = (rows: MatrixRow[], gridClass: string) => {
    const columns = rows[0]?.columns ?? [];
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-white dark:bg-slate-900">
        <div
          className={cn(gridClass, "items-center border-b border-border bg-muted/40 px-2 py-1.5")}
        >
          <span className="text-[7.5px] font-black uppercase tracking-wide text-orange-700 dark:text-orange-300">
            {tr("Modules", "മൊഡ്യൂളുകൾ")}
          </span>
          {columns.map((column) => (
            <span
              key={column.id}
              className="text-center text-[7px] font-black uppercase leading-tight tracking-tight text-orange-700 dark:text-orange-300"
            >
              {isMalayalam ? column.ml : column.en}
            </span>
          ))}
        </div>

        {rows.map((row) => {
          const Icon = row.icon;
          const scopes = scopesForModule(row.moduleId);
          return (
            <div key={row.key} className="border-b border-border last:border-b-0">
              <div className={cn(gridClass, "items-center px-2 pb-1.5 pt-2")}>
                <div className="flex min-w-0 items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-300" />
                  <span className="min-w-0 whitespace-normal break-words text-[10px] font-extrabold leading-tight text-foreground">
                    {isMalayalam ? row.ml : row.en}
                  </span>
                </div>

                {row.columns.map((column) => {
                  if (column.actionIds.length === 0) {
                    return (
                      <span
                        key={column.id}
                        title={tr("Unavailable", "ലഭ്യമല്ല")}
                        aria-label={tr("Unavailable", "ലഭ്യമല്ല")}
                        className="flex h-8 items-center justify-center text-[10px] font-semibold text-muted-foreground/40"
                      >
                        —
                      </span>
                    );
                  }
                  const state = actionColumnState(row, column);
                  const columnLabel = isMalayalam ? column.ml : column.en;
                  return (
                    <button
                      key={column.id}
                      type="button"
                      role="checkbox"
                      aria-checked={state.all ? true : state.partial ? "mixed" : false}
                      aria-label={`${isMalayalam ? row.ml : row.en} ${columnLabel}`}
                      onClick={() => toggleModuleAction(row, column)}
                      className="flex h-8 w-full cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 dark:hover:bg-slate-800"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-[3px] border",
                          state.all
                            ? "border-orange-500 bg-orange-500 text-white"
                            : state.partial
                              ? "border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300"
                              : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900",
                        )}
                      >
                        {state.all ? (
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        ) : state.partial ? (
                          <span className="h-[1.5px] w-2 rounded-full bg-orange-500" />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 border-t border-border/40 bg-muted/20 px-2 py-1.5">
                <span className="shrink-0 text-[7.5px] font-black uppercase tracking-wide text-orange-700 dark:text-orange-300">
                  {tr("Data Access", "ഡാറ്റ ആക്സസ്")}
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${isMalayalam ? row.ml : row.en} ${tr(
                        "Data Access",
                        "ഡാറ്റ ആക്സസ്",
                      )}`}
                      className="ml-auto flex h-7 min-w-0 flex-1 items-center justify-between gap-1 rounded-md border border-border bg-white px-2 text-left text-[9px] font-bold text-foreground shadow-2xs transition-colors hover:border-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 dark:bg-slate-900"
                    >
                      <span className="min-w-0 truncate">{dataAccessSummary(scopes)}</span>
                      <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 rounded-lg border-border p-2">
                    <div className="space-y-0.5">
                      {dataAccessChoices.map((option) => {
                        const checked = scopes.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            onClick={() => toggleModuleDataAccess(row, option.id, !checked)}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[10px] font-semibold text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                          >
                            <span
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
                                checked
                                  ? "border-orange-500 bg-orange-500 text-white"
                                  : "border-border bg-white dark:bg-slate-900",
                              )}
                            >
                              {checked ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                            </span>
                            <span>{isMalayalam ? option.shortMl : option.shortEn}</span>
                          </button>
                        );
                      })}
                      <div className="my-1 h-px bg-border" />
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={scopes.length === dataAccessChoices.length}
                        onClick={() => toggleAllScopesForModule(row)}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[10px] font-bold text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
                            scopes.length === dataAccessChoices.length
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-border bg-white dark:bg-slate-900",
                          )}
                        >
                          {scopes.length === dataAccessChoices.length ? (
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
          );
        })}
      </div>
    );
  };

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white">
            2
          </span>
          <h4 className="text-[12px] font-extrabold text-foreground">
            {tr("Module Permissions", "മൊഡ്യൂൾ അനുമതികൾ")} <span className="text-rose-500">*</span>
          </h4>
        </div>
        <button
          type="button"
          role="checkbox"
          aria-checked={
            allPermissionsSelected ? true : hasPartialPermissionSelection ? "mixed" : false
          }
          aria-label={tr(
            "Select all module permissions",
            "എല്ലാ മൊഡ്യൂൾ അനുമതികളും തിരഞ്ഞെടുക്കുക",
          )}
          onClick={toggleAllPermissions}
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 text-[8.5px] font-bold text-orange-700 transition-colors hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-950/70",
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
        </button>
      </div>

      <div className="space-y-2">
        {renderMatrixTable(primaryRows, primaryGridClass)}
        {renderMatrixTable(secondaryRows, secondaryGridClass)}
      </div>
    </section>
  );
}
