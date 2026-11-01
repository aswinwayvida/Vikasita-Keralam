import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  FileText,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Trash2,
  Users,
  UserRoundCog,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  assignmentLevels,
  permissionKey,
  permissionModules,
  togglePermission,
  type AssignmentLevel,
  type PermissionModuleId,
} from "@/data/party-workers";
import {
  administrativePermissionOptions,
  createRoleId,
  draftFromRole,
  emptyRoleDraft,
  loadManagedRoles,
  nextRoleCopyName,
  saveManagedRoles,
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
} as const;

const freshDraft = (): RoleDraft => ({
  ...emptyRoleDraft,
  assignmentLevels: [],
  permissions: [],
  administrativePermissions: [],
});

const defaultExpandedModules: Record<PermissionModuleId, boolean> = {
  schemes: true,
  party_workers: false,
  applications: false,
};

export function MobileRolesPage({ onBack, onFormOpenChange }: MobileRolesPageProps) {
  const { lang } = useLang();
  const isMalayalam = lang === "ml";
  const tr = (en: string, ml: string) => (isMalayalam ? ml : en);
  const [roles, setRoles] = useState<ManagedRole[]>(() => loadManagedRoles());
  const [activeView, setActiveView] = useState<"list" | "form">("list");
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editTarget, setEditTarget] = useState<ManagedRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedRole | null>(null);
  const [statusTarget, setStatusTarget] = useState<ManagedRole | null>(null);
  const [statusAcknowledged, setStatusAcknowledged] = useState(false);
  const [draft, setDraft] = useState<RoleDraft>(freshDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedModules, setExpandedModules] =
    useState<Record<PermissionModuleId, boolean>>(defaultExpandedModules);

  useEffect(() => {
    return () => onFormOpenChange?.(false);
  }, [onFormOpenChange]);

  const commitRoles = (nextRoles: ManagedRole[]) => {
    setRoles(nextRoles);
    saveManagedRoles(nextRoles);
  };

  const levelLabel = (level: AssignmentLevel) => {
    const option = assignmentLevels.find((item) => item.id === level);
    return option ? (isMalayalam ? option.ml : option.en) : level;
  };

  const openEdit = (role: ManagedRole) => {
    setIsCreating(false);
    setEditTarget(role);
    setDraft(draftFromRole(role));
    setErrors({});
    setExpandedModules(defaultExpandedModules);
    setActiveView("form");
    setCreateStep(1);
    onFormOpenChange?.(true);
  };

  const openCreate = () => {
    setIsCreating(true);
    setEditTarget(null);
    setDraft(freshDraft());
    setErrors({});
    setExpandedModules(defaultExpandedModules);
    setActiveView("form");
    setCreateStep(1);
    onFormOpenChange?.(true);
  };

  const closeRoleDialog = () => {
    setIsCreating(false);
    setEditTarget(null);
    setActiveView("list");
    setCreateStep(1);
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
    if (draft.assignmentLevels.length === 0) {
      nextErrors.levels = tr(
        "Select at least one allowed assignment level.",
        "കുറഞ്ഞത് ഒരു അനുവദനീയ അസൈൻമെന്റ് ലെവൽ തിരഞ്ഞെടുക്കുക.",
      );
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const goToModuleStep = () => {
    if (!validateRoleBasics()) return;
    setCreateStep(2);
  };

  const saveRole = () => {
    if (!isCreating && !editTarget) return;
    if (!validateRoleBasics()) {
      setCreateStep(1);
      return;
    }
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
    if (isCreating) {
      const created: ManagedRole = {
        id: createRoleId(),
        name,
        description: draft.description.trim(),
        assignmentLevels: [...draft.assignmentLevels],
        permissions: [...draft.permissions],
        administrativePermissions: [...draft.administrativePermissions],
        status: draft.status,
        system: false,
        assignedUsers: 0,
        createdAt: now,
        updatedAt: now,
      };
      commitRoles([created, ...roles]);
      toast.success(tr("Role created.", "റോൾ സൃഷ്ടിച്ചു."));
    } else if (editTarget) {
      const updated: ManagedRole = {
        ...editTarget,
        name,
        description: draft.description.trim(),
        assignmentLevels: [...draft.assignmentLevels],
        permissions: [...draft.permissions],
        administrativePermissions: [...draft.administrativePermissions],
        status: draft.status,
        updatedAt: now,
      };
      commitRoles(roles.map((role) => (role.id === updated.id ? updated : role)));
      toast.success(tr("Role updated.", "റോൾ അപ്ഡേറ്റ് ചെയ്തു."));
    }
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
      status: "Active",
      system: false,
      assignedUsers: 0,
      createdAt: now,
      updatedAt: now,
    };
    commitRoles([copy, ...roles]);
    toast.success(tr("Role duplicated.", "റോൾ പകർത്തി."));
  };

  const openStatusConfirm = (role: ManagedRole) => {
    setStatusAcknowledged(false);
    setStatusTarget(role);
  };

  const confirmRoleStatus = () => {
    if (!statusTarget) return;
    const nextStatus = statusTarget.status === "Active" ? "Inactive" : "Active";
    const updated: ManagedRole = {
      ...statusTarget,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    commitRoles(roles.map((item) => (item.id === updated.id ? updated : item)));
    toast.success(
      nextStatus === "Inactive"
        ? tr("Role deactivated.", "റോൾ നിർജ്ജീവമാക്കി.")
        : tr("Role reactivated.", "റോൾ വീണ്ടും സജീവമാക്കി."),
    );
    setStatusTarget(null);
  };

  const removeRole = () => {
    if (!deleteTarget || deleteTarget.system) return;
    commitRoles(roles.filter((role) => role.id !== deleteTarget.id));
    toast.success(tr("Role deleted.", "റോൾ ഇല്ലാതാക്കി."));
    setDeleteTarget(null);
  };

  return (
    <div
      className={cn(
        "animate-in fade-in duration-200",
        activeView === "form" ? "flex h-full min-h-0 w-full flex-col bg-muted/20" : "pb-2",
      )}
    >
      {activeView === "list" && (
        <>
          <header className="relative flex h-10 items-center justify-center border-b border-border/70 px-3">
            <button
              type="button"
              onClick={onBack}
              className="absolute left-0 flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-foreground transition-colors hover:bg-muted dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer"
              aria-label={tr("Go back", "തിരികെ പോവുക")}
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>
            <h1 className="text-[13px] font-extrabold tracking-tight text-[#152153] dark:text-white">
              {tr("Roles and Control", "റോളുകളും നിയന്ത്രണവും")} ({roles.length})
            </h1>
            <button
              type="button"
              onClick={openCreate}
              className="absolute right-0 flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-colors hover:bg-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:hover:bg-orange-900/60 cursor-pointer"
              aria-label={tr("Create role", "റോൾ സൃഷ്ടിക്കുക")}
            >
              <Plus className="h-4 w-4 stroke-[2.6]" />
            </button>
          </header>

          <div className="mt-2 space-y-2">
            {roles.map((role) => (
              <article
                key={role.id}
                className={cn(
                  "rounded-2xl border border-orange-100 bg-card px-3 py-2.5 shadow-2xs dark:border-slate-800",
                  role.status === "Inactive" && "opacity-60",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
                    <UserRoundCog className="h-[18px] w-[18px] stroke-[1.9]" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[11.5px] font-extrabold leading-tight text-foreground">
                      {role.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {role.assignmentLevels.map((level) => (
                        <span
                          key={level}
                          className="rounded-md border border-orange-100 bg-orange-50/70 px-1.5 py-px text-[8.5px] font-bold text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-200"
                        >
                          {levelLabel(level)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                        aria-label={tr(`Actions for ${role.name}`, `${role.name} നടപടികൾ`)}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-44 rounded-xl border-orange-100 p-1.5 shadow-lg dark:border-slate-800"
                    >
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
                        onSelect={() => openStatusConfirm(role)}
                        className="gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold"
                      >
                        {role.status === "Active" ? (
                          <Power className="h-3.5 w-3.5" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        {role.status === "Active"
                          ? tr("Deactivate", "നിർജ്ജീവമാക്കുക")
                          : tr("Reactivate", "സജീവമാക്കുക")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-orange-100 dark:bg-slate-800" />
                      <DropdownMenuItem
                        disabled={role.system}
                        onSelect={() => setDeleteTarget(role)}
                        className="gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold text-rose-600 focus:bg-rose-50 focus:text-rose-700 dark:focus:bg-rose-950/30 dark:focus:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {tr("Delete", "ഇല്ലാതാക്കുക")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {activeView === "form" && (
        <div className="flex min-h-0 flex-1 flex-col bg-muted/20">
          <header className="relative flex h-10 shrink-0 items-center justify-center border-b border-border/70 bg-muted/20 px-3">
            <button
              type="button"
              onClick={() => (createStep === 2 ? setCreateStep(1) : closeRoleDialog())}
              className="absolute left-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#fff7ec] text-[#1b255a] transition-colors hover:bg-orange-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer"
              aria-label={tr("Go back", "തിരികെ പോവുക")}
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>
            <h1 className="text-[13px] font-extrabold tracking-tight text-[#152153] dark:text-white">
              {isCreating
                ? tr("Create New Role", "പുതിയ റോൾ സൃഷ്ടിക്കുക")
                : tr("Edit Role", "റോൾ തിരുത്തുക")}
            </h1>
            <span className="absolute right-0 rounded-full border border-orange-100 bg-orange-50 px-2 py-1 text-[8.5px] font-bold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/50 dark:text-orange-300">
              {tr(`Step ${createStep} of 2`, `ഘട്ടം ${createStep}/2`)}
            </span>
          </header>

          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3 [scrollbar-width:thin]">
            {createStep === 1 && (
              <section className="space-y-3 rounded-2xl border border-border bg-card p-3 shadow-2xs">
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
                    placeholder={tr("e.g. Local Body Admin", "ഉദാ: തദ്ദേശ സ്ഥാപന അഡ്മിൻ")}
                    className={cn("h-9 rounded-lg text-[11.5px]", errors.name && "border-rose-400")}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name ? (
                    <p className="mt-1 text-[9.5px] font-semibold text-rose-600">{errors.name}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-foreground">
                    {tr("Allowed Assignment Levels", "അനുവദനീയ അസൈൻമെന്റ് ലെവലുകൾ")}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={draft.assignmentLevels[0] ?? ""}
                      onChange={(event) => {
                        const nextLevel = event.target.value as AssignmentLevel | "";
                        setDraft((current) => ({
                          ...current,
                          assignmentLevels: nextLevel ? [nextLevel] : [],
                        }));
                        setErrors((current) => ({ ...current, levels: "" }));
                      }}
                      aria-invalid={Boolean(errors.levels)}
                      className={cn(
                        "h-9 w-full cursor-pointer appearance-none rounded-lg border border-border bg-background px-2.5 pr-8 text-[11.5px] font-medium text-foreground outline-none transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-500",
                        errors.levels && "border-rose-400",
                      )}
                    >
                      <option value="">
                        {tr(
                          "-- Select assignment level --",
                          "-- അസൈൻമെന്റ് ലെവൽ തിരഞ്ഞെടുക്കുക --",
                        )}
                      </option>
                      {assignmentLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {isMalayalam ? level.ml : level.en}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                  {errors.levels ? (
                    <p className="mt-1 text-[9.5px] font-semibold text-rose-600">{errors.levels}</p>
                  ) : null}
                </div>
              </section>
            )}

            {createStep === 2 && (
              <section className="space-y-2.5 rounded-2xl border border-border bg-card p-3 shadow-2xs">
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
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                    {draft.permissions.length} {tr("selected", "തിരഞ്ഞെടുത്തു")}
                  </span>
                </div>
                <p className="text-[8.5px] leading-snug text-muted-foreground">
                  {tr(
                    "Viewing permissions are added automatically as prerequisites.",
                    "ആവശ്യമായ കാഴ്ച അനുമതികൾ സ്വയം ചേർക്കും.",
                  )}
                </p>
                <div className="space-y-1.5">
                  {permissionModules.map((module) => {
                    const Icon = moduleIcons[module.id];
                    const expanded = expandedModules[module.id];
                    const selectedActions = module.actions.filter((action) =>
                      draft.permissions.includes(permissionKey(module.id, action.id)),
                    );
                    return (
                      <div
                        key={module.id}
                        className="overflow-hidden rounded-xl border border-border"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedModules((current) => ({
                              ...current,
                              [module.id]: !current[module.id],
                            }))
                          }
                          aria-expanded={expanded}
                          className="flex w-full items-center gap-2 bg-orange-50/40 px-2.5 py-2 text-left transition-colors hover:bg-orange-50 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 cursor-pointer"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-300" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10.5px] font-extrabold text-foreground">
                              {isMalayalam ? module.ml : module.en}
                            </span>
                            <span className="block truncate text-[8.5px] text-muted-foreground">
                              {selectedActions.length > 0
                                ? selectedActions
                                    .map((action) => (isMalayalam ? action.ml : action.en))
                                    .join(", ")
                                : tr("No permissions selected", "അനുമതികൾ തിരഞ്ഞെടുത്തിട്ടില്ല")}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[8.5px] font-bold",
                              selectedActions.length > 0
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {selectedActions.length}/{module.actions.length}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                              expanded && "rotate-180",
                            )}
                          />
                        </button>
                        {expanded ? (
                          <div className="space-y-1 border-t border-border/70 p-2">
                            {module.actions.map((action) => {
                              const key = permissionKey(module.id, action.id);
                              const checked = draft.permissions.includes(key);
                              return (
                                <button
                                  key={action.id}
                                  type="button"
                                  role="checkbox"
                                  aria-checked={checked}
                                  onClick={() => {
                                    setDraft((current) => ({
                                      ...current,
                                      permissions: togglePermission(
                                        current.permissions,
                                        key,
                                        !checked,
                                      ),
                                    }));
                                    setErrors((current) => ({ ...current, permissions: "" }));
                                  }}
                                  className={cn(
                                    "flex w-full items-start gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors cursor-pointer",
                                    checked
                                      ? "border-orange-200 bg-orange-50/60 dark:border-orange-900/60 dark:bg-orange-950/20"
                                      : "border-transparent hover:bg-muted/40",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                                      checked
                                        ? "border-orange-500 bg-orange-500 text-white"
                                        : "border-slate-300 dark:border-slate-600",
                                    )}
                                  >
                                    {checked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-[10px] font-bold text-foreground">
                                      {isMalayalam ? action.ml : action.en}
                                    </span>
                                    <span className="block text-[8.5px] leading-snug text-muted-foreground">
                                      {isMalayalam ? action.helpMl : action.helpEn}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                {errors.permissions ? (
                  <p className="mt-1 text-[9.5px] font-semibold text-rose-600">
                    {errors.permissions}
                  </p>
                ) : null}
              </section>
            )}

            {createStep === 1 && (
              <section className="space-y-2.5 rounded-2xl border border-border bg-card p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white">
                    2
                  </span>
                  <h4 className="text-[12px] font-extrabold text-foreground">
                    {tr("Administrative Permissions", "അഡ്മിനിസ്ട്രേറ്റീവ് അനുമതികൾ")}
                  </h4>
                </div>
                <p className="text-[8.5px] leading-snug text-muted-foreground">
                  {tr(
                    "Separate elevated controls. These are not included in Create or Edit Party Worker.",
                    "വേറിട്ട ഉയർന്ന അധികാരങ്ങൾ. ഇവ Party Worker സൃഷ്ടിക്കുക/തിരുത്തുക എന്നതിൽ ഉൾപ്പെടുന്നില്ല.",
                  )}
                </p>
                <div className="space-y-1.5">
                  {administrativePermissionOptions.map((option) => {
                    const checked = draft.administrativePermissions.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            administrativePermissions: checked
                              ? current.administrativePermissions.filter((id) => id !== option.id)
                              : [...current.administrativePermissions, option.id],
                          }))
                        }
                        className={cn(
                          "flex w-full items-start gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors cursor-pointer",
                          checked
                            ? "border-amber-300 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20"
                            : "border-border hover:bg-muted/30",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                            checked
                              ? "border-amber-500 bg-amber-500 text-white"
                              : "border-slate-300 dark:border-slate-600",
                          )}
                        >
                          {checked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] font-bold text-foreground">
                            {isMalayalam ? option.ml : option.en}
                          </span>
                          <span className="block text-[8.5px] leading-snug text-muted-foreground">
                            {isMalayalam ? option.descriptionMl : option.descriptionEn}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <div className="shrink-0 border-t border-border/70 bg-background/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
            {createStep === 1 ? (
              <Button
                type="button"
                className="h-10 w-full rounded-xl text-[11.5px] font-extrabold"
                onClick={goToModuleStep}
              >
                {tr("Continue", "തുടരുക")}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCreateStep(1)}
                  aria-label={tr("Back to role details", "റോൾ വിവരങ്ങളിലേക്ക് മടങ്ങുക")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted/40 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
                </button>
                <Button
                  type="button"
                  className="h-10 flex-1 rounded-xl text-[11.5px] font-extrabold"
                  onClick={saveRole}
                >
                  {isCreating
                    ? tr("Save and Create", "സേവ് ചെയ്ത് സൃഷ്ടിക്കുക")
                    : tr("Save Changes", "മാറ്റങ്ങൾ സേവ് ചെയ്യുക")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={Boolean(statusTarget)} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm gap-3 rounded-2xl p-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-[15px]">
              {statusTarget?.status === "Active"
                ? tr("Deactivate role?", "റോൾ നിർജ്ജീവമാക്കണോ?")
                : tr("Reactivate role?", "റോൾ വീണ്ടും സജീവമാക്കണോ?")}
            </DialogTitle>
            <DialogDescription className="text-[10.5px] leading-relaxed">
              {statusTarget
                ? statusTarget.status === "Active"
                  ? tr(
                      `${statusTarget.name} will stop being available for new assignments. ${statusTarget.assignedUsers} users currently use this role.`,
                      `${statusTarget.name} പുതിയ അസൈൻമെന്റുകൾക്ക് ലഭ്യമാകില്ല. ഈ റോൾ ഇപ്പോൾ ${statusTarget.assignedUsers} ഉപയോക്താക്കൾ ഉപയോഗിക്കുന്നു.`,
                    )
                  : tr(
                      `${statusTarget.name} will be available for new assignments again.`,
                      `${statusTarget.name} വീണ്ടും പുതിയ അസൈൻമെന്റുകൾക്ക് ലഭ്യമാകും.`,
                    )
                : ""}
            </DialogDescription>
          </DialogHeader>

          {statusTarget?.status === "Active" && statusTarget.assignedUsers > 0 ? (
            <button
              type="button"
              role="checkbox"
              aria-checked={statusAcknowledged}
              onClick={() => setStatusAcknowledged((current) => !current)}
              className="flex w-full items-start gap-2 rounded-xl border border-orange-100 bg-orange-50/60 p-2.5 text-left transition-colors hover:bg-orange-50 dark:border-orange-900/60 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 cursor-pointer"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
                  statusAcknowledged
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-slate-300 bg-background dark:border-slate-600",
                )}
              >
                {statusAcknowledged ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
              </span>
              <span className="text-[9.5px] font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                {tr(
                  `I will review the ${statusTarget.assignedUsers} affected users and reassign them where required.`,
                  `ബാധകമായ ${statusTarget.assignedUsers} ഉപയോക്താക്കളെ അവലോകനം ചെയ്ത് ആവശ്യമെങ്കിൽ പുനഃഅസൈൻ ചെയ്യും.`,
                )}
              </span>
            </button>
          ) : null}

          <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setStatusTarget(null)}>
              {tr("Cancel", "റദ്ദാക്കുക")}
            </Button>
            <Button
              type="button"
              variant={statusTarget?.status === "Active" ? "destructive" : "default"}
              size="sm"
              disabled={
                Boolean(
                  statusTarget &&
                  statusTarget.status === "Active" &&
                  statusTarget.assignedUsers > 0,
                ) && !statusAcknowledged
              }
              onClick={confirmRoleStatus}
            >
              {statusTarget?.status === "Active"
                ? tr("Deactivate", "നിർജ്ജീവമാക്കുക")
                : tr("Reactivate", "സജീവമാക്കുക")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm gap-3 rounded-2xl p-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-[15px]">
              {tr("Delete Role?", "റോൾ ഇല്ലാതാക്കണോ?")}
            </DialogTitle>
            <DialogDescription className="text-[10.5px] leading-relaxed">
              {deleteTarget
                ? tr(
                    `${deleteTarget.name} will be removed. ${deleteTarget.assignedUsers} assigned users will need a new role.`,
                    `${deleteTarget.name} നീക്കം ചെയ്യും. അസൈൻ ചെയ്ത ${deleteTarget.assignedUsers} ഉപയോക്താക്കൾക്ക് പുതിയ റോൾ ആവശ്യമാകും.`,
                  )
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              {tr("Cancel", "റദ്ദാക്കുക")}
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={removeRole}>
              {tr("Delete", "ഇല്ലാതാക്കുക")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
