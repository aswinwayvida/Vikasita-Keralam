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
  UserRound,
  Users,
  UsersRound,
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
  assignmentLevels,
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
  createRoleId,
  draftFromRole,
  emptyRoleDraft,
  loadManagedRoles,
  nextRoleCopyName,
  saveManagedRoles,
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
  users: UsersRound,
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
  help_desk: false,
  applicant_profile: false,
  users: false,
};

const roleAccessPermissionIds: AdministrativePermissionId[] = ["manage_roles", "assign_access"];
const delegateAccessPermissionId: AdministrativePermissionId = "delegate_access";

const normalizeAdministrativePermissions = (ids: AdministrativePermissionId[]) => [
  ...(ids.some((id) => roleAccessPermissionIds.includes(id)) ? roleAccessPermissionIds : []),
  ...(ids.includes(delegateAccessPermissionId) ? [delegateAccessPermissionId] : []),
];

export function MobileRolesPage({ onBack, onFormOpenChange }: MobileRolesPageProps) {
  const { lang } = useLang();
  const isMalayalam = lang === "ml";
  const tr = (en: string, ml: string) => (isMalayalam ? ml : en);
  const [roles, setRoles] = useState<ManagedRole[]>(() => loadManagedRoles());
  const [activeView, setActiveView] = useState<"list" | "form" | "assign">("list");
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editTarget, setEditTarget] = useState<ManagedRole | null>(null);
  const [draft, setDraft] = useState<RoleDraft>(freshDraft);
  const [assignmentRole, setAssignmentRole] = useState<ManagedRole | null>(null);
  const [assignmentWorkerIds, setAssignmentWorkerIds] = useState<string[]>([]);
  const [assignmentWorkers, setAssignmentWorkers] = useState<AssignablePartyWorker[]>([]);
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentDistrict, setAssignmentDistrict] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedModules, setExpandedModules] =
    useState<Record<PermissionModuleId, boolean>>(defaultExpandedModules);
  const roleAccessChecked = draft.administrativePermissions.some((id) =>
    roleAccessPermissionIds.includes(id),
  );
  const delegateAccessChecked = draft.administrativePermissions.includes(
    delegateAccessPermissionId,
  );

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
    setAssignmentRole(null);
    setAssignmentWorkerIds([]);
    setAssignmentWorkers([]);
    setAssignmentSearch("");
    setAssignmentDistrict("");
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
        administrativePermissions: normalizeAdministrativePermissions(
          draft.administrativePermissions,
        ),
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
        tr(
          "Role created. Assign party workers next.",
          "റോൾ സൃഷ്ടിച്ചു. അടുത്ത് പാർട്ടി പ്രവർത്തകരെ നൽകുക.",
        ),
      );
      return;
    } else if (editTarget) {
      const updated: ManagedRole = {
        ...editTarget,
        name,
        description: draft.description.trim(),
        assignmentLevels: [...draft.assignmentLevels],
        permissions: [...draft.permissions],
        administrativePermissions: normalizeAdministrativePermissions(
          draft.administrativePermissions,
        ),
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
        `${assignmentWorkerIds.length} party worker${assignmentWorkerIds.length === 1 ? "" : "s"} assigned to ${updated.name}.`,
        `${assignmentWorkerIds.length} പാർട്ടി പ്രവർത്തകരെ ${updated.name} റോളിലേക്ക് നൽകി.`,
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
      status: "Active",
      system: false,
      assignedUsers: 0,
      createdAt: now,
      updatedAt: now,
    };
    commitRoles([copy, ...roles]);
    toast.success(tr("Role duplicated.", "റോൾ പകർത്തി."));
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
          ? "flex h-full min-h-0 w-full flex-col bg-muted/20"
          : "relative flex h-full min-h-0 w-full flex-col",
      )}
    >
      {activeView === "list" && (
        <>
          <header className="relative flex h-10 shrink-0 items-center justify-center border-b border-border/70 px-3">
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

          <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pb-2 [scrollbar-width:thin]">
            {roles.map((role) => (
              <article
                key={role.id}
                className={cn(
                  "rounded-2xl border border-orange-100 bg-card px-3 py-2.5 shadow-2xs transition-colors hover:border-orange-200 dark:border-slate-800 dark:hover:border-slate-700",
                  role.status === "Inactive" && "opacity-60",
                )}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(role)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                    aria-label={tr(`Edit ${role.name}`, `${role.name} തിരുത്തുക`)}
                  >
                    <img
                      src="/images/settings/role-card.png"
                      alt=""
                      aria-hidden="true"
                      className="h-8 w-8 shrink-0 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[11.5px] font-extrabold leading-tight text-foreground">
                        {role.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {role.assignmentLevels.slice(0, 1).map((level) => (
                          <span
                            key={level}
                            className="rounded-md border border-orange-100 bg-orange-50/70 px-1.5 py-px text-[8.5px] font-bold text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-200"
                          >
                            {levelLabel(level)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>

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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </article>
            ))}
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
              {tr("Assign Party Workers", "പാർട്ടി പ്രവർത്തകരെ നൽകുക")}
            </h1>
            <span className="absolute right-3 rounded-full border border-orange-100 bg-orange-50 px-2 py-1 text-[8.5px] font-bold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/50 dark:text-orange-300">
              {tr("Step 3 of 3", "ഘട്ടം 3/3")}
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
                    aria-label={tr("Search party workers", "പാർട്ടി പ്രവർത്തകരെ തിരയുക")}
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
                          ? tr("No party workers found", "പാർട്ടി പ്രവർത്തകരെ കണ്ടെത്തിയില്ല")
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
                aria-label={tr("Back to roles", "റോളുകളിലേക്ക് മടങ്ങുക")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted/40 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
              </button>
              <Button
                type="button"
                className="h-10 flex-1 rounded-xl text-[11.5px] font-extrabold"
                onClick={finishWorkerAssignment}
                disabled={assignmentWorkerIds.length === 0}
              >
                {assignmentWorkerIds.length === 0
                  ? tr("Select at least one worker", "കുറഞ്ഞത് ഒരു പ്രവർത്തകനെ തിരഞ്ഞെടുക്കുക")
                  : tr(
                      `Assign ${assignmentWorkerIds.length} party worker${assignmentWorkerIds.length === 1 ? "" : "s"}`,
                      `${assignmentWorkerIds.length} പാർട്ടി പ്രവർത്തകരെ നൽകുക`,
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
              onClick={() => (createStep === 2 ? setCreateStep(1) : closeRoleDialog())}
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
            <span className="absolute right-3 rounded-full border border-orange-100 bg-orange-50 px-2 py-1 text-[8.5px] font-bold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/50 dark:text-orange-300">
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
                    "Elevated controls for roles and access. Not included in Create or Edit Party Worker.",
                    "റോളുകൾക്കും ആക്സസിനുമുള്ള ഉയർന്ന അധികാരങ്ങൾ. Party Worker സൃഷ്ടിക്കുക/തിരുത്തുക എന്നതിൽ ഇവ ഉൾപ്പെടുന്നില്ല.",
                  )}
                </p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={roleAccessChecked}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        administrativePermissions: current.administrativePermissions.some((id) =>
                          roleAccessPermissionIds.includes(id),
                        )
                          ? current.administrativePermissions.filter(
                              (id) => !roleAccessPermissionIds.includes(id),
                            )
                          : [
                              ...current.administrativePermissions.filter(
                                (id) => !roleAccessPermissionIds.includes(id),
                              ),
                              ...roleAccessPermissionIds,
                            ],
                      }))
                    }
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors cursor-pointer",
                      roleAccessChecked
                        ? "border-amber-300 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20"
                        : "border-border hover:bg-muted/30",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                        roleAccessChecked
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-slate-300 dark:border-slate-600",
                      )}
                    >
                      {roleAccessChecked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold text-foreground">
                        {tr("Role and access management", "റോൾ & ആക്സസ് മാനേജ്മെന്റ്")}
                      </span>
                      <span className="block text-[8.5px] leading-snug text-muted-foreground">
                        {tr(
                          "Create roles and assign access to party workers.",
                          "റോളുകൾ സൃഷ്ടിക്കാം, പാർട്ടി പ്രവർത്തകർക്ക് ആക്സസ് നൽകാം.",
                        )}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={delegateAccessChecked}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        administrativePermissions: current.administrativePermissions.includes(
                          delegateAccessPermissionId,
                        )
                          ? current.administrativePermissions.filter(
                              (id) => id !== delegateAccessPermissionId,
                            )
                          : [...current.administrativePermissions, delegateAccessPermissionId],
                      }))
                    }
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors cursor-pointer",
                      delegateAccessChecked
                        ? "border-amber-300 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20"
                        : "border-border hover:bg-muted/30",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                        delegateAccessChecked
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-slate-300 dark:border-slate-600",
                      )}
                    >
                      {delegateAccessChecked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold text-foreground">
                        {tr("Access delegation", "ആക്സസ് ഡെലിഗേഷൻ")}
                      </span>
                      <span className="block text-[8.5px] leading-snug text-muted-foreground">
                        {tr(
                          "Grant access-management authority to other administrators.",
                          "മറ്റ് അഡ്മിനിസ്ട്രേറ്റർമാർക്ക് ആക്സസ് മാനേജ്മെന്റ് അധികാരം നൽകാം.",
                        )}
                      </span>
                    </span>
                  </button>
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
    </div>
  );
}
