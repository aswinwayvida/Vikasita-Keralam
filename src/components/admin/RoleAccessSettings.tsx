import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  Info,
  Layers,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { RoleEditorDialog } from "@/components/admin/RoleEditorDialog";
import { RoleViewDialog } from "@/components/admin/RoleViewDialog";
import {
  assignmentLevels,
  permissionModules,
  type AssignmentLevel,
  type PermissionModuleId,
} from "@/data/party-workers";
import {
  loadAssignablePartyWorkers,
  type AssignablePartyWorker,
} from "@/data/party-worker-directory";
import {
  cloneRoleDataAccess,
  createRoleId,
  draftFromRole,
  emptyRoleDraft,
  loadManagedRoles,
  loadDeletedManagedRoleIds,
  markManagedRoleDeleted,
  nextRoleCopyName,
  rolesPageAdminRoleId,
  rolesPageSubAdminRoleId,
  saveManagedRoles,
  type ManagedRole,
  type ManagedRoleStatus,
  type RoleDraft,
} from "@/data/role-management";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function getRoleModulePermissions(role: ManagedRole, lang: "en" | "ml") {
  const activePerms = new Set(role.permissions);

  return permissionModules
    .map((mod) => {
      const activeActions = mod.actions
        .filter((action) => activePerms.has(`${mod.id}:${action.id}`))
        .map((action) => (lang === "ml" ? action.ml : action.en));

      return {
        id: mod.id,
        name: lang === "ml" ? mod.ml : mod.en,
        activeActions,
        isFullAccess: activeActions.length === mod.actions.length,
        hasAccess: activeActions.length > 0,
      };
    })
    .filter((item) => item.hasAccess);
}

const supportAdminRoleId = "system_support_admin";

import { useAdminTopSearch } from "@/lib/admin-search-store";

export function RoleAccessSettings() {
  const { lang } = useLang();
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const topSearchQuery = useAdminTopSearch();

  const [roles, setRoles] = useState<ManagedRole[]>(() => loadManagedRoles());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RoleDraft>(emptyRoleDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedModules, setExpandedModules] = useState<Record<PermissionModuleId, boolean>>({
    schemes: true,
    party_workers: true,
    applications: true,
    help_desk: true,
    applicant_profile: true,
    roles: true,
    designations: true,
  });
  const [viewRole, setViewRole] = useState<ManagedRole | null>(null);
  const [assignTarget, setAssignTarget] = useState<ManagedRole | null>(null);
  const [statusTarget, setStatusTarget] = useState<ManagedRole | null>(null);
  const [reviewAcknowledged, setReviewAcknowledged] = useState(false);

  // Desktop only: hide page scrollbar indicator when mounted
  useEffect(() => {
    const root = document.documentElement;
    const desktopQuery = window.matchMedia("(min-width: 640px)");
    const sync = () => root.classList.toggle("desktop-hide-page-scrollbar", desktopQuery.matches);
    sync();
    desktopQuery.addEventListener("change", sync);
    return () => {
      desktopQuery.removeEventListener("change", sync);
      root.classList.remove("desktop-hide-page-scrollbar");
    };
  }, []);

  // Ensure the three built-in roles used by this page exist and stay ordered.
  useEffect(() => {
    const deleted = new Set(loadDeletedManagedRoleIds());
    const source =
      roles.find((role) => role.id === rolesPageAdminRoleId) ??
      roles.find((role) => role.id === rolesPageSubAdminRoleId);
    if (!source) return;

    const now = new Date().toISOString();
    const next = [...roles];
    let changed = false;

    if (
      !next.some((role) => role.id === rolesPageSubAdminRoleId) &&
      !deleted.has(rolesPageSubAdminRoleId)
    ) {
      next.push({
        ...source,
        id: rolesPageSubAdminRoleId,
        name: "Sub Admin",
        description: "Supports statewide administration and delegated access.",
        administrativePermissions: source.administrativePermissions.filter(
          (permission) => permission !== "delegate_access",
        ),
        status: "Active",
        system: true,
        presetId: undefined,
        assignedUsers: 0,
        assignedWorkerIds: [],
        createdAt: now,
        updatedAt: now,
      });
      changed = true;
    }

    const supportSource = next.find((role) => role.id === rolesPageSubAdminRoleId) ?? source;
    if (!next.some((role) => role.id === supportAdminRoleId) && !deleted.has(supportAdminRoleId)) {
      next.push({
        ...supportSource,
        id: supportAdminRoleId,
        name: "Support Admin",
        description: "Handles citizen requests, support cases and follow-ups.",
        administrativePermissions: [],
        status: "Active",
        system: true,
        presetId: undefined,
        assignedUsers: 0,
        assignedWorkerIds: [],
        createdAt: now,
        updatedAt: now,
      });
      changed = true;
    }

    if (changed) {
      setRoles(next);
      saveManagedRoles(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageRoles = useMemo(() => {
    const byId = new Map(roles.map((role) => [role.id, role]));
    const builtIn = [
      byId.get(rolesPageAdminRoleId),
      byId.get(rolesPageSubAdminRoleId),
      byId.get(supportAdminRoleId),
    ].filter((role): role is ManagedRole => Boolean(role));
    const customRoles = roles.filter((role) => !role.system);
    const seen = new Set(builtIn.map((role) => role.id));
    return [...builtIn, ...customRoles.filter((role) => !seen.has(role.id))];
  }, [roles]);

  const displayRoleName = (role: ManagedRole) => {
    if (role.id === rolesPageAdminRoleId) return "Admin";
    if (role.id === rolesPageSubAdminRoleId) return "Sub Admin";
    if (role.id === supportAdminRoleId) return "Support Admin";
    return role.name;
  };

  const displayedRoles = useMemo(() => {
    const q = topSearchQuery.trim().toLowerCase();
    if (!q) return pageRoles;
    return pageRoles.filter((role) => {
      const name = displayRoleName(role).toLowerCase();
      const rawName = (role.name || "").toLowerCase();
      const desc = (role.description || "").toLowerCase();
      return name.includes(q) || rawName.includes(q) || desc.includes(q);
    });
  }, [pageRoles, topSearchQuery]);

  const editingRole = roles.find((role) => role.id === editingId) || null;
  const affectedUsers = editingRole?.assignedUsers || 0;

  const stats = useMemo(() => {
    const active = roles.filter((role) => role.status === "Active").length;
    const custom = roles.filter((role) => !role.system).length;
    const assigned = roles.reduce((total, role) => total + role.assignedUsers, 0);
    return { total: roles.length, active, custom, assigned };
  }, [roles]);

  const commitRoles = (nextRoles: ManagedRole[]) => {
    setRoles(nextRoles);
    saveManagedRoles(nextRoles);
  };

  const levelLabel = (level: AssignmentLevel) => {
    const option = assignmentLevels.find((item) => item.id === level);
    return option ? (lang === "ml" ? option.ml : option.en) : level;
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyRoleDraft);
    setErrors({});
    setExpandedModules({
      schemes: true,
      party_workers: true,
      applications: true,
      help_desk: true,
      applicant_profile: true,
      roles: true,
      designations: true,
    });
    setEditorOpen(true);
  };

  const openEdit = (role: ManagedRole) => {
    const isPageBuiltIn =
      role.id === rolesPageAdminRoleId ||
      role.id === rolesPageSubAdminRoleId ||
      role.id === supportAdminRoleId;
    if (role.system && !isPageBuiltIn) return;
    setViewRole(null);
    setEditingId(role.id);
    setDraft(draftFromRole(role));
    setErrors({});
    setExpandedModules({
      schemes: true,
      party_workers: true,
      applications: true,
      help_desk: true,
      applicant_profile: true,
      roles: true,
      designations: true,
    });
    setEditorOpen(true);
  };

  const openDuplicate = (role: ManagedRole) => {
    setViewRole(null);
    setEditingId(null);
    setDraft(draftFromRole(role, nextRoleCopyName(role.name, roles)));
    setErrors({});
    setExpandedModules({
      schemes: true,
      party_workers: true,
      applications: true,
      help_desk: true,
      applicant_profile: true,
      roles: true,
      designations: true,
    });
    setEditorOpen(true);
  };

  const handleDeleteRole = (role: ManagedRole) => {
    const isPageBuiltIn =
      role.id === rolesPageAdminRoleId ||
      role.id === rolesPageSubAdminRoleId ||
      role.id === supportAdminRoleId;
    if (role.system && !isPageBuiltIn) {
      toast.error(
        tr(
          "Built-in system roles are protected and cannot be deleted.",
          "ബിൽറ്റ്-ഇൻ സിസ്റ്റം റോളുകൾ സംരക്ഷിതമാണ്, ഡിലീറ്റ് ചെയ്യാൻ കഴിയില്ല.",
        ),
      );
      return;
    }
    const confirmed = window.confirm(
      lang === "ml"
        ? `"${role.name}" എന്ന റോൾ ശാശ്വതമായി നീക്കം ചെയ്യണോ?`
        : `Are you sure you want to delete "${role.name}" permanently?`,
    );
    if (!confirmed) return;
    if (role.system) markManagedRoleDeleted(role.id);
    commitRoles(roles.filter((r) => r.id !== role.id));
    toast.success(tr("Role deleted successfully.", "റോൾ വിജയകരമായി നീക്കം ചെയ്തു."));
  };

  const handleSaveAssignment = (roleId: string, assignedCount: number) => {
    const updatedRoles = roles.map((r) =>
      r.id === roleId
        ? { ...r, assignedUsers: assignedCount, updatedAt: new Date().toISOString() }
        : r,
    );
    commitRoles(updatedRoles);
    toast.success(
      tr(
        `Role assignment updated (${assignedCount} users assigned).`,
        `റോൾ അസൈൻമെന്റ് അപ്‌ഡേറ്റ് ചെയ്തു (${assignedCount} ഉപയോക്താക്കളെ അസൈൻ ചെയ്തു).`,
      ),
    );
  };

  const saveRole = () => {
    const nextErrors: Record<string, string> = {};
    const trimmedName = draft.name.trim();
    if (!trimmedName) {
      nextErrors.name = tr("Role name is required.", "റോൾ നാമം നിർബന്ധമാണ്.");
    } else if (
      roles.some(
        (role) =>
          role.id !== editingId && role.name.trim().toLowerCase() === trimmedName.toLowerCase(),
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
    if (draft.permissions.length === 0) {
      nextErrors.permissions = tr(
        "Select at least one module permission.",
        "കുറഞ്ഞത് ഒരു മൊഡ്യൂൾ അനുമതി തിരഞ്ഞെടുക്കുക.",
      );
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const now = new Date().toISOString();
    if (editingRole) {
      const updated: ManagedRole = {
        ...editingRole,
        name: trimmedName,
        description: draft.description.trim(),
        assignmentLevels: [...draft.assignmentLevels],
        permissions: [...draft.permissions],
        administrativePermissions: [...draft.administrativePermissions],
        dataAccess: cloneRoleDataAccess(draft.dataAccess),
        status: draft.status,
        updatedAt: now,
      };
      commitRoles(roles.map((role) => (role.id === updated.id ? updated : role)));
      toast.success(
        affectedUsers > 0
          ? tr(
              `Role updated for ${affectedUsers.toLocaleString("en-IN")} affected users.`,
              `ബാധകമായ ${affectedUsers.toLocaleString("en-IN")} ഉപയോക്താക്കൾക്ക് റോൾ അപ്‌ഡേറ്റ് ചെയ്തു.`,
            )
          : tr("Role updated.", "റോൾ അപ്‌ഡേറ്റ് ചെയ്തു."),
      );
    } else {
      const created: ManagedRole = {
        id: createRoleId(),
        name: trimmedName,
        description: draft.description.trim(),
        assignmentLevels: [...draft.assignmentLevels],
        permissions: [...draft.permissions],
        administrativePermissions: [...draft.administrativePermissions],
        dataAccess: cloneRoleDataAccess(draft.dataAccess),
        status: draft.status,
        system: false,
        assignedUsers: 0,
        createdAt: now,
        updatedAt: now,
      };
      commitRoles([created, ...roles]);
      toast.success(tr("Custom role created.", "കസ്റ്റം റോൾ സൃഷ്ടിച്ചു."));
    }
    setEditorOpen(false);
    setEditingId(null);
  };

  const openStatusDialog = (role: ManagedRole) => {
    if (role.system) return;
    setReviewAcknowledged(false);
    setStatusTarget(role);
  };

  const confirmStatusChange = () => {
    if (!statusTarget) return;
    const nextStatus: ManagedRoleStatus = statusTarget.status === "Active" ? "Inactive" : "Active";
    const updated: ManagedRole = {
      ...statusTarget,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    commitRoles(roles.map((role) => (role.id === updated.id ? updated : role)));
    toast.success(
      nextStatus === "Inactive"
        ? tr(
            "Role deactivated. New assignments are blocked.",
            "റോൾ നിർജ്ജീവമാക്കി. പുതിയ അസൈൻമെന്റുകൾ തടയപ്പെട്ടു.",
          )
        : tr("Role reactivated.", "റോൾ വീണ്ടും സജീവമാക്കി."),
    );
    setStatusTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {tr(
                `Roles and Control (${pageRoles.length})`,
                `റോളുകളും നിയന്ത്രണവും (${pageRoles.length})`,
              )}
            </h2>
          </div>
          <Link
            to="/admin/settings/new-role"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold leading-tight text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {tr("Create New Role", "പുതിയ റോൾ സൃഷ്ടിക്കുക")}
          </Link>
        </div>
        <div className="overflow-x-auto desktop-hide-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
              <tr>
                <th className="p-3">{tr("ROLE", "റോൾ")}</th>
                <th className="p-3">{tr("DESCRIPTION", "വിവരണം")}</th>
                <th className="p-3 text-right">{tr("USERS", "ഉപയോക്താക്കൾ")}</th>
                <th className="p-3">{tr("STATUS", "സ്റ്റാറ്റസ്")}</th>
                <th className="p-3 text-right">{tr("ACTIONS", "നടപടികൾ")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-semibold">
              {displayedRoles.map((role) => (
                <tr key={role.id} className="transition-colors hover:bg-muted/40">
                  <td className="min-w-40 p-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          role.system
                            ? "bg-primary/10 text-primary"
                            : "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300",
                        )}
                      >
                        {role.system ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <UserCog className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground">{displayRoleName(role)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-md p-3 text-muted-foreground">{role.description || "—"}</td>
                  <td className="whitespace-nowrap p-3 text-right font-mono text-foreground">
                    {role.assignedUsers.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold",
                        role.status === "Active"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                          : "border-rose-500/20 bg-rose-500/10 text-rose-600",
                      )}
                    >
                      {role.status === "Active"
                        ? tr("Active", "സജീവം")
                        : tr("Inactive", "നിർജ്ജീവം")}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(role)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {tr("Edit", "തിരുത്തുക")}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={tr("More actions", "കൂടുതൽ നടപടികൾ")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => setAssignTarget(role)}
                            className="cursor-pointer gap-2 text-xs font-medium"
                          >
                            <UserPlus className="h-3.5 w-3.5 text-primary" />
                            {tr("Assign", "അസൈൻ ചെയ്യുക")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDuplicate(role)}
                            className="cursor-pointer gap-2 text-xs font-medium"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {tr("Duplicate", "പകർത്തുക")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteRole(role)}
                            className="cursor-pointer gap-2 text-xs font-medium text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {tr("Delete", "ഡിലീറ്റ് ചെയ്യുക")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RoleEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editingRole={editingRole}
        affectedUsers={affectedUsers}
        draft={draft}
        setDraft={setDraft}
        errors={errors}
        expandedModules={expandedModules}
        setExpandedModules={setExpandedModules}
        onSave={saveRole}
        lang={lang}
      />

      <RoleViewDialog
        role={viewRole}
        onClose={() => setViewRole(null)}
        onEdit={openEdit}
        lang={lang}
      />

      <AssignRoleDialog
        role={assignTarget}
        onClose={() => setAssignTarget(null)}
        onSave={(count) => assignTarget && handleSaveAssignment(assignTarget.id, count)}
        lang={lang}
      />

      <StatusDialog
        role={statusTarget}
        acknowledged={reviewAcknowledged}
        setAcknowledged={setReviewAcknowledged}
        onClose={() => setStatusTarget(null)}
        onConfirm={confirmStatusChange}
        lang={lang}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: number;
  tone?: "primary" | "emerald";
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs">
      <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-display text-lg font-extrabold",
          tone === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
        )}
      >
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function RoleRow({
  role,
  lang,
  onView,
  onEdit,
  onDuplicate,
  onAssign,
  onDelete,
  onToggleStatus,
  levelLabel,
}: {
  role: ManagedRole;
  lang: "en" | "ml";
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onAssign: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  levelLabel: (level: AssignmentLevel) => string;
}) {
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const modulePerms = getRoleModulePermissions(role, lang);

  return (
    <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            role.system
              ? "bg-primary/10 text-primary"
              : "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300",
          )}
        >
          {role.system ? <ShieldCheck className="h-4 w-4" /> : <UserCog className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="truncate text-[13px] font-extrabold text-foreground">{role.name}</h4>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide",
                role.system
                  ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
              )}
            >
              {role.system ? tr("System", "സിസ്റ്റം") : tr("Custom", "കസ്റ്റം")}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-black",
                role.status === "Active"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
              )}
            >
              {role.status === "Active" ? tr("Active", "സജീവം") : tr("Inactive", "നിർജ്ജീവം")}
            </span>
          </div>

          <p className="line-clamp-1 text-[11px] text-muted-foreground">
            {role.description || tr("No description added.", "വിവരണം ചേർത്തിട്ടില്ല.")}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" />
              {tr(
                `${role.assignedUsers.toLocaleString("en-IN")} assigned`,
                `${role.assignedUsers.toLocaleString("en-IN")} അസൈൻ ചെയ്തു`,
              )}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <Layers className="h-3 w-3 text-primary" />
              <span className="truncate">
                {role.assignmentLevels.map(levelLabel).join(" · ") ||
                  tr("No levels", "ലെവലുകൾ ഇല്ല")}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Check className="h-3 w-3 text-primary" />
              {tr(`${role.permissions.length} actions`, `${role.permissions.length} പ്രവർത്തനങ്ങൾ`)}
            </span>
            {role.administrativePermissions.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
                <Lock className="h-3 w-3" />
                {tr("Admin authority", "അഡ്മിൻ അധികാരം")}
              </span>
            ) : null}
          </div>

          {/* Explicit Module Permissions Display */}
          <div className="pt-2 border-t border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
              {tr("Module Permissions", "മൊഡ്യൂൾ അനുമതികൾ")}
            </p>
            {modulePerms.length === 0 ? (
              <span className="text-[10.5px] italic text-muted-foreground">
                {tr("No module permissions enabled", "മൊഡ്യൂൾ അനുമതികൾ ലഭ്യമല്ല")}
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {modulePerms.map((mod) => (
                  <span
                    key={mod.id}
                    className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 text-[10.5px] font-semibold text-foreground"
                  >
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold">{mod.name}:</span>
                    <span className="text-muted-foreground font-normal">
                      {mod.isFullAccess
                        ? tr("Full Access", "പൂർണ്ണ അനുമതി")
                        : mod.activeActions.join(", ")}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
        {/* Direct Edit Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          disabled={role.system}
          title={
            role.system
              ? tr("Built-in roles are protected", "ബിൽറ്റ്-ഇൻ റോളുകൾ സംരക്ഷിതമാണ്")
              : tr("Edit role", "റോൾ തിരുത്തുക")
          }
          className="h-8 gap-1.5 text-xs font-semibold"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>{tr("Edit", "തിരുത്തുക")}</span>
        </Button>

        {/* 3-dot Dropdown Button for Assign, Duplicate, Delete */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title={tr("More options", "കൂടുതൽ ഓപ്ഷനുകൾ")}
              aria-label={tr("More options", "കൂടുതൽ ഓപ്ഷനുകൾ")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={onAssign}
              className="cursor-pointer gap-2 text-xs font-medium"
            >
              <UserPlus className="h-3.5 w-3.5 text-primary" />
              <span>{tr("Assign", "അസൈൻ ചെയ്യുക")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDuplicate}
              className="cursor-pointer gap-2 text-xs font-medium"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{tr("Duplicate", "പകർത്തുക")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onView} className="cursor-pointer gap-2 text-xs font-medium">
              <Eye className="h-3.5 w-3.5" />
              <span>{tr("View details", "വിശദാംശങ്ങൾ കാണുക")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onToggleStatus}
              disabled={role.system}
              className="cursor-pointer gap-2 text-xs font-medium"
            >
              <Power className="h-3.5 w-3.5" />
              <span>
                {role.status === "Active"
                  ? tr("Deactivate", "നിർജ്ജീവമാക്കുക")
                  : tr("Reactivate", "സജീവമാക്കുക")}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              disabled={role.system}
              className="cursor-pointer gap-2 text-xs font-medium text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{tr("Delete", "ഡിലീറ്റ് ചെയ്യുക")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function AssignRoleDialog({
  role,
  onClose,
  onSave,
  lang,
}: {
  role: ManagedRole | null;
  onClose: () => void;
  onSave: (assignedCount: number) => void;
  lang: "en" | "ml";
}) {
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const [search, setSearch] = useState("");
  const workers = useMemo(() => loadAssignablePartyWorkers(), []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (role) {
      const initial = new Set(
        workers.slice(0, Math.min(role.assignedUsers, workers.length)).map((w) => w.id),
      );
      setSelectedIds(initial);
    }
  }, [role, workers]);

  if (!role) return null;

  const filtered = workers.filter((w) => {
    const q = search.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      (w.nameMl && w.nameMl.includes(q)) ||
      w.mobile.includes(q) ||
      w.designationEn.toLowerCase().includes(q) ||
      w.locationEn.toLowerCase().includes(q)
    );
  });

  const toggleWorker = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    onSave(selectedIds.size);
    onClose();
  };

  return (
    <Dialog open={Boolean(role)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-border/80 px-5 py-4 text-left">
          <DialogTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>
              {tr("Assign Role: ", "റോൾ അസൈൻ ചെയ്യുക: ")} {role.name}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {tr(
              "Select users or party workers to grant this role's permissions.",
              "ഈ റോളിന്റെ അനുമതികൾ നൽകാൻ ഉപയോക്താക്കളെ അല്ലെങ്കിൽ പ്രവർത്തകരെ തിരഞ്ഞെടുക്കുക.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={tr(
                "Search by name, designation or phone...",
                "പേര്, പദവി, ഫോൺ നമ്പർ വഴി തിരയുക...",
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="max-h-64 overflow-y-auto no-scrollbar desktop-hide-scrollbar divide-y divide-border/60 rounded-xl border border-border bg-card">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">
                {tr("No users found.", "ഉപയോക്താക്കളെ കണ്ടെത്തിയില്ല.")}
              </p>
            ) : (
              filtered.map((worker) => {
                const checked = selectedIds.has(worker.id);
                return (
                  <label
                    key={worker.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleWorker(worker.id)} />
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-bold text-foreground">
                        {lang === "ml" && worker.nameMl ? worker.nameMl : worker.name}
                      </p>
                      <p className="text-[10.5px] text-muted-foreground">
                        {lang === "ml" ? worker.designationMl : worker.designationEn} •{" "}
                        {worker.locationEn}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border/80 px-5 py-3 sm:space-x-0">
          <Button type="button" variant="outline" onClick={onClose}>
            {tr("Cancel", "റദ്ദാക്കുക")}
          </Button>
          <Button type="button" onClick={handleSave}>
            {tr(`Assign (${selectedIds.size})`, `അസൈൻ ചെയ്യുക (${selectedIds.size})`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusDialog({
  role,
  acknowledged,
  setAcknowledged,
  onClose,
  onConfirm,
  lang,
}: {
  role: ManagedRole | null;
  acknowledged: boolean;
  setAcknowledged: (value: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
  lang: "en" | "ml";
}) {
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  return (
    <Dialog open={Boolean(role)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0">
        {role ? (
          <>
            <DialogHeader className="border-b border-border/80 px-5 py-4 pr-12 text-left">
              <div
                className={cn(
                  "mb-2 flex h-10 w-10 items-center justify-center rounded-xl",
                  role.status === "Active"
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
                )}
              >
                {role.status === "Active" ? (
                  <Power className="h-5 w-5" />
                ) : (
                  <RotateCcw className="h-5 w-5" />
                )}
              </div>
              <DialogTitle className="text-base">
                {role.status === "Active"
                  ? tr("Deactivate role?", "റോൾ നിർജ്ജീവമാക്കണോ?")
                  : tr("Reactivate role?", "റോൾ വീണ്ടും സജീവമാക്കണോ?")}
              </DialogTitle>
              <DialogDescription className="text-[11.5px] leading-relaxed">
                <span className="font-bold text-foreground">{role.name}</span>{" "}
                {role.status === "Active"
                  ? tr("will stop accepting new assignments.", "പുതിയ അസൈൻമെന്റുകൾ സ്വീകരിക്കില്ല.")
                  : tr(
                      "will become available for new assignments.",
                      "പുതിയ അസൈൻമെന്റുകൾക്ക് ലഭ്യമാകും.",
                    )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 px-5 py-4 text-[11.5px] text-muted-foreground">
              {role.status === "Active" ? (
                <>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {tr(
                        `${role.assignedUsers.toLocaleString("en-IN")} users currently use this role`,
                        `ഈ റോൾ ഇപ്പോൾ ${role.assignedUsers.toLocaleString("en-IN")} ഉപയോക്താക്കൾ ഉപയോഗിക്കുന്നു`,
                      )}
                    </div>
                    <p className="mt-1 text-[10.5px] leading-relaxed">
                      {tr(
                        "New assignments are blocked immediately. Existing assignments stay in place but must be reviewed and reassigned where required.",
                        "പുതിയ അസൈൻമെന്റുകൾ ഉടൻ തടയും. നിലവിലുള്ള അസൈൻമെന്റുകൾ തുടരും, എന്നാൽ അവ അവലോകനം ചെയ്ത് ആവശ്യമെങ്കിൽ പുനഃഅസൈൻ ചെയ്യണം.",
                      )}
                    </p>
                  </div>
                  {role.assignedUsers > 0 ? (
                    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border p-3 hover:bg-muted/30">
                      <Checkbox
                        checked={acknowledged}
                        onCheckedChange={(checked) => setAcknowledged(checked === true)}
                        className="mt-0.5"
                      />
                      <span className="font-semibold text-foreground">
                        {tr(
                          `I will review the ${role.assignedUsers.toLocaleString("en-IN")} affected users and reassign them where required.`,
                          `ബാധകമായ ${role.assignedUsers.toLocaleString("en-IN")} ഉപയോക്താക്കളെ അവലോകനം ചെയ്ത് ആവശ്യമെങ്കിൽ പുനഃഅസൈൻ ചെയ്യും.`,
                        )}
                      </span>
                    </label>
                  ) : null}
                </>
              ) : (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                  {tr(
                    "The role will be selectable for new worker assignments again. Existing assignments are unchanged.",
                    "റോൾ വീണ്ടും പുതിയ പ്രവർത്തക അസൈൻമെന്റുകൾക്ക് തിരഞ്ഞെടുക്കാം. നിലവിലുള്ള അസൈൻമെന്റുകൾ മാറില്ല.",
                  )}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2 border-t border-border/80 px-5 py-3 sm:space-x-0">
              <Button type="button" variant="outline" onClick={onClose}>
                {tr("Cancel", "റദ്ദാക്കുക")}
              </Button>
              <Button
                type="button"
                variant={role.status === "Active" ? "destructive" : "default"}
                disabled={role.status === "Active" && role.assignedUsers > 0 && !acknowledged}
                onClick={onConfirm}
              >
                {role.status === "Active"
                  ? tr("Deactivate role", "റോൾ നിർജ്ജീവമാക്കുക")
                  : tr("Reactivate role", "റോൾ സജീവമാക്കുക")}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
