import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  Info,
  Layers,
  Lock,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  ShieldCheck,
  UserCog,
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
import { RoleEditorDialog } from "@/components/admin/RoleEditorDialog";
import { RoleViewDialog } from "@/components/admin/RoleViewDialog";
import {
  assignmentLevels,
  type AssignmentLevel,
  type PermissionModuleId,
} from "@/data/party-workers";
import {
  createRoleId,
  draftFromRole,
  emptyRoleDraft,
  loadManagedRoles,
  nextRoleCopyName,
  saveManagedRoles,
  type ManagedRole,
  type ManagedRoleStatus,
  type RoleDraft,
} from "@/data/role-management";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function RoleAccessSettings() {
  const { lang } = useLang();
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);

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
    users: true,
  });
  const [viewRole, setViewRole] = useState<ManagedRole | null>(null);
  const [statusTarget, setStatusTarget] = useState<ManagedRole | null>(null);
  const [reviewAcknowledged, setReviewAcknowledged] = useState(false);

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
      users: true,
    });
    setEditorOpen(true);
  };

  const openEdit = (role: ManagedRole) => {
    if (role.system) return;
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
      users: true,
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
      users: true,
    });
    setEditorOpen(true);
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
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-foreground">
              {tr("Role & Access Settings", "റോൾ & ആക്സസ് ക്രമീകരണങ്ങൾ")}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {tr(
                "Create reusable roles and control what each role can do.",
                "പുനരുപയോഗിക്കാവുന്ന റോളുകൾ സൃഷ്ടിച്ച് ഓരോ റോളിനും എന്ത് ചെയ്യാമെന്ന് നിയന്ത്രിക്കുക.",
              )}
            </p>
          </div>
        </div>
        <Button type="button" onClick={openCreate} className="shrink-0 gap-1.5">
          <Plus className="h-4 w-4" />
          {tr("Create New Role", "പുതിയ റോൾ സൃഷ്ടിക്കുക")}
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/[0.04] p-3 text-[11px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>
          <span className="font-bold text-foreground">
            {tr("Keep these separate:", "ഇവ വേർതിരിച്ച് സൂക്ഷിക്കുക:")}
          </span>{" "}
          {tr(
            "App Role is what the user can do. Party Designation is their party position. Access Areas are where their permissions apply.",
            "ആപ്പ് റോൾ എന്ത് ചെയ്യാം എന്നതും, പാർട്ടി പദവി അവരുടെ സ്ഥാനവും, ആക്സസ് പ്രദേശങ്ങൾ അനുമതികൾ ബാധകമാകുന്ന സ്ഥലവുമാണ്.",
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label={tr("Total roles", "ആകെ റോളുകൾ")} value={stats.total} />
        <StatCard label={tr("Active", "സജീവം")} value={stats.active} tone="emerald" />
        <StatCard label={tr("Custom roles", "കസ്റ്റം റോളുകൾ")} value={stats.custom} />
        <StatCard label={tr("Assigned users", "അസൈൻ ചെയ്ത ഉപയോക്താക്കൾ")} value={stats.assigned} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {tr("All roles", "എല്ലാ റോളുകളും")}
            </h3>
            <p className="text-[10.5px] text-muted-foreground">
              {tr(
                "Built-in roles are protected. Duplicate one to create a custom variant.",
                "ബിൽറ്റ്-ഇൻ റോളുകൾ സംരക്ഷിതമാണ്. ഇഷ്‌ടാനുസൃത റോൾ ഉണ്ടാക്കാൻ അവ പകർത്തുക.",
              )}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
            {roles.length}
          </span>
        </div>
        <div className="divide-y divide-border/80">
          {roles.map((role) => (
            <RoleRow
              key={role.id}
              role={role}
              lang={lang}
              onView={() => setViewRole(role)}
              onEdit={() => openEdit(role)}
              onDuplicate={() => openDuplicate(role)}
              onToggleStatus={() => openStatusDialog(role)}
              levelLabel={levelLabel}
            />
          ))}
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
  onToggleStatus,
  levelLabel,
}: {
  role: ManagedRole;
  lang: "en" | "ml";
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleStatus: () => void;
  levelLabel: (level: AssignmentLevel) => string;
}) {
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  return (
    <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4">
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
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="truncate text-[12.5px] font-extrabold text-foreground">{role.name}</h4>
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
          <p className="mt-0.5 line-clamp-1 text-[10.5px] text-muted-foreground">
            {role.description || tr("No description added.", "വിവരണം ചേർത്തിട്ടില്ല.")}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] font-semibold text-muted-foreground">
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
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
        <RoleAction
          label={tr("View", "കാണുക")}
          icon={Eye}
          onClick={onView}
          title={tr("View role", "റോൾ കാണുക")}
        />
        <RoleAction
          label={tr("Edit", "തിരുത്തുക")}
          icon={Pencil}
          onClick={onEdit}
          disabled={role.system}
          title={
            role.system
              ? tr("Built-in roles are protected", "ബിൽറ്റ്-ഇൻ റോളുകൾ സംരക്ഷിതമാണ്")
              : tr("Edit role", "റോൾ തിരുത്തുക")
          }
        />
        <RoleAction
          label={tr("Duplicate", "പകർത്തുക")}
          icon={Copy}
          onClick={onDuplicate}
          title={tr("Duplicate as a custom role", "കസ്റ്റം റോളായി പകർത്തുക")}
        />
        <RoleAction
          label={
            role.status === "Active"
              ? tr("Deactivate", "നിർജ്ജീവമാക്കുക")
              : tr("Reactivate", "സജീവമാക്കുക")
          }
          icon={role.status === "Active" ? Power : RotateCcw}
          onClick={onToggleStatus}
          disabled={role.system}
          title={
            role.system
              ? tr("Built-in roles are protected", "ബിൽറ്റ്-ഇൻ റോളുകൾ സംരക്ഷിതമാണ്")
              : role.status === "Active"
                ? tr("Deactivate role", "റോൾ നിർജ്ജീവമാക്കുക")
                : tr("Reactivate role", "റോൾ സജീവമാക്കുക")
          }
          danger={role.status === "Active" && !role.system}
        />
      </div>
    </div>
  );
}

function RoleAction({
  label,
  icon: Icon,
  onClick,
  disabled,
  title,
  danger,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-lg border border-transparent px-1.5 text-[10px] font-bold text-muted-foreground transition hover:border-border hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35 lg:px-2",
        danger &&
          "hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden lg:inline">{label}</span>
    </button>
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
