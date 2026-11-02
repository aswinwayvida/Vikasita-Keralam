import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Headset,
  UserRound,
  Users,
} from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  assignmentLevels,
  permissionKey,
  permissionModules,
  togglePermission,
  type PermissionModuleId,
} from "@/data/party-workers";
import {
  administrativePermissionOptions,
  type ManagedRole,
  type ManagedRoleStatus,
  type RoleDraft,
} from "@/data/role-management";
import { cn } from "@/lib/utils";

const moduleIcons: Record<PermissionModuleId, LucideIcon> = {
  schemes: FileText,
  party_workers: Users,
  applications: ClipboardList,
  help_desk: Headset,
  applicant_profile: UserRound,
};

export function RoleEditorDialog({
  open,
  onOpenChange,
  editingRole,
  affectedUsers,
  draft,
  setDraft,
  errors,
  expandedModules,
  setExpandedModules,
  onSave,
  lang,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: ManagedRole | null;
  affectedUsers: number;
  draft: RoleDraft;
  setDraft: (draft: RoleDraft) => void;
  errors: Record<string, string>;
  expandedModules: Record<PermissionModuleId, boolean>;
  setExpandedModules: (next: Record<PermissionModuleId, boolean>) => void;
  onSave: () => void;
  lang: "en" | "ml";
}) {
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const toggleLevel = (levelId: RoleDraft["assignmentLevels"][number]) => {
    setDraft({
      ...draft,
      assignmentLevels: draft.assignmentLevels.includes(levelId)
        ? draft.assignmentLevels.filter((id) => id !== levelId)
        : [...draft.assignmentLevels, levelId],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] max-w-3xl gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-border/80 px-5 py-4 pr-12 text-left">
          <DialogTitle className="text-base">
            {editingRole
              ? tr("Edit role", "റോൾ തിരുത്തുക")
              : tr("Create new role", "പുതിയ റോൾ സൃഷ്ടിക്കുക")}
          </DialogTitle>
          <DialogDescription className="text-[11px] leading-relaxed">
            {tr(
              "Roles define what a user can do. Party designation and access areas are assigned separately.",
              "റോളുകൾ ഉപയോക്താവിന് എന്ത് ചെയ്യാമെന്ന് നിർവചിക്കുന്നു. പാർട്ടി പദവിയും ആക്സസ് പ്രദേശങ്ങളും വേറെയായി അസൈൻ ചെയ്യുന്നു.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(92vh-8.5rem)] space-y-5 overflow-y-auto px-5 py-4">
          {editingRole && affectedUsers > 0 ? (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-[11.5px] font-extrabold">
                  {tr(
                    `${affectedUsers.toLocaleString("en-IN")} users will be affected`,
                    `${affectedUsers.toLocaleString("en-IN")} ഉപയോക്താക്കളെ ഇത് ബാധിക്കും`,
                  )}
                </p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed">
                  {tr(
                    "Saving permission changes applies the updated role to every user currently assigned to it.",
                    "അനുമതി മാറ്റങ്ങൾ സേവ് ചെയ്യുമ്പോൾ ഈ റോൾ ഉള്ള എല്ലാ ഉപയോക്താക്കൾക്കും പുതിയ അനുമതികൾ ബാധകമാകും.",
                  )}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-1 block text-[10.5px] font-bold text-foreground">
                {tr("Role Name", "റോൾ നാമം")} <span className="text-rose-500">*</span>
              </label>
              <Input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder={tr("e.g. Local Body Admin", "ഉദാ: തദ്ദേശ സ്ഥാപന അഡ്മിൻ")}
                className={cn("h-9 rounded-lg text-[12px]", errors.name && "border-rose-400")}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? (
                <p className="mt-1 text-[10px] font-semibold text-rose-600">{errors.name}</p>
              ) : null}
            </div>
            <div>
              <span className="mb-1 block text-[10.5px] font-bold text-foreground">
                {tr("Status", "നില")}
              </span>
              <div className="flex h-9 items-center rounded-lg border border-input bg-background p-0.5">
                {(["Active", "Inactive"] as ManagedRoleStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setDraft({ ...draft, status })}
                    aria-pressed={draft.status === status}
                    className={cn(
                      "h-8 rounded-md px-3 text-[10.5px] font-bold transition",
                      draft.status === status
                        ? status === "Active"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-700 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {status === "Active" ? tr("Active", "സജീവം") : tr("Inactive", "നിർജ്ജീവം")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10.5px] font-bold text-foreground">
              {tr("Description", "വിവരണം")}
            </label>
            <Textarea
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder={tr(
                "Explain this role's responsibilities and scope.",
                "ഈ റോളിന്റെ ഉത്തരവാദിത്വങ്ങളും പരിധിയും വിശദീകരിക്കുക.",
              )}
              className="min-h-[64px] rounded-lg text-[12px]"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="text-[10.5px] font-bold text-foreground">
                {tr("Allowed Assignment Levels", "അനുവദനീയ അസൈൻമെന്റ് ലെവലുകൾ")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[9.5px] font-semibold text-muted-foreground">
                {draft.assignmentLevels.length} {tr("selected", "തിരഞ്ഞെടുത്തു")}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assignmentLevels.map((level) => {
                const selected = draft.assignmentLevels.includes(level.id);
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => toggleLevel(level.id)}
                    aria-pressed={selected}
                    title={lang === "ml" ? level.hintMl : level.hintEn}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10.5px] font-bold transition",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {selected ? <Check className="h-3 w-3" /> : null}
                    {lang === "ml" ? level.ml : level.en}
                  </button>
                );
              })}
            </div>
            {errors.levels ? (
              <p className="mt-1 text-[10px] font-semibold text-rose-600">{errors.levels}</p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="text-[10.5px] font-bold text-foreground">
                  {tr("Module Permissions", "മൊഡ്യൂൾ അനുമതികൾ")}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <p className="text-[9.5px] text-muted-foreground">
                  {tr(
                    "Viewing permissions are added automatically as prerequisites.",
                    "ആവശ്യമായ കാഴ്ച അനുമതികൾ സ്വയം ചേർക്കും.",
                  )}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9.5px] font-bold text-primary">
                {draft.permissions.length} {tr("selected", "തിരഞ്ഞെടുത്തു")}
              </span>
            </div>
            <div className="space-y-2">
              {permissionModules.map((module) => {
                const Icon = moduleIcons[module.id];
                const expanded = expandedModules[module.id];
                const selectedCount = module.actions.filter((action) =>
                  draft.permissions.includes(permissionKey(module.id, action.id)),
                ).length;
                return (
                  <div key={module.id} className="overflow-hidden rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModules({
                          ...expandedModules,
                          [module.id]: !expandedModules[module.id],
                        })
                      }
                      aria-expanded={expanded}
                      className="flex w-full items-center gap-2 bg-muted/20 px-3 py-2.5 text-left transition hover:bg-muted/40"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 text-[11px] font-extrabold text-foreground">
                        {lang === "ml" ? module.ml : module.en}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                          selectedCount > 0
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {selectedCount}/{module.actions.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>
                    {expanded ? (
                      <div className="grid gap-x-3 gap-y-2 border-t border-border/70 p-3 sm:grid-cols-2">
                        {module.actions.map((action) => {
                          const key = permissionKey(module.id, action.id);
                          const checked = draft.permissions.includes(key);
                          return (
                            <label
                              key={key}
                              htmlFor={`${module.id}-${action.id}`}
                              className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-0.5 hover:bg-muted/30"
                            >
                              <Checkbox
                                id={`${module.id}-${action.id}`}
                                checked={checked}
                                onCheckedChange={(next) =>
                                  setDraft({
                                    ...draft,
                                    permissions: togglePermission(
                                      draft.permissions,
                                      key,
                                      next === true,
                                    ),
                                  })
                                }
                                className="mt-0.5"
                              />
                              <span className="min-w-0">
                                <span className="block text-[10.5px] font-bold text-foreground">
                                  {lang === "ml" ? action.ml : action.en}
                                </span>
                                <span className="block text-[9px] leading-snug text-muted-foreground">
                                  {lang === "ml" ? action.helpMl : action.helpEn}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {errors.permissions ? (
              <p className="mt-1 text-[10px] font-semibold text-rose-600">{errors.permissions}</p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5">
              <label className="text-[10.5px] font-bold text-foreground">
                {tr("Administrative Permissions", "അഡ്മിനിസ്ട്രേറ്റീവ് അനുമതികൾ")}
              </label>
              <p className="text-[9.5px] text-muted-foreground">
                {tr(
                  "Separate elevated controls. These are not included in Create or Edit User.",
                  "വേറിട്ട ഉയർന്ന അധികാരങ്ങൾ. ഇവ ഉപയോക്താവിനെ സൃഷ്ടിക്കുക/തിരുത്തുക എന്നതിൽ ഉൾപ്പെടുന്നില്ല.",
                )}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {administrativePermissionOptions.map((option) => {
                const checked = draft.administrativePermissions.includes(option.id);
                return (
                  <label
                    key={option.id}
                    htmlFor={`admin-${option.id}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 transition",
                      checked
                        ? "border-amber-300 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20"
                        : "border-border hover:bg-muted/30",
                    )}
                  >
                    <Checkbox
                      id={`admin-${option.id}`}
                      checked={checked}
                      onCheckedChange={(next) =>
                        setDraft({
                          ...draft,
                          administrativePermissions:
                            next === true
                              ? [...draft.administrativePermissions, option.id]
                              : draft.administrativePermissions.filter((id) => id !== option.id),
                        })
                      }
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-[10.5px] font-extrabold text-foreground">
                        {lang === "ml" ? option.ml : option.en}
                      </span>
                      <span className="mt-0.5 block text-[9px] leading-snug text-muted-foreground">
                        {lang === "ml" ? option.descriptionMl : option.descriptionEn}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border/80 px-5 py-3 sm:space-x-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {tr("Cancel", "റദ്ദാക്കുക")}
          </Button>
          <Button type="button" onClick={onSave}>
            {editingRole
              ? affectedUsers > 0
                ? tr(
                    `Save changes for ${affectedUsers.toLocaleString("en-IN")} users`,
                    `${affectedUsers.toLocaleString("en-IN")} ഉപയോക്താക്കൾക്ക് സേവ് ചെയ്യുക`,
                  )
                : tr("Save changes", "മാറ്റങ്ങൾ സേവ് ചെയ്യുക")
              : tr("Create role", "റോൾ സൃഷ്ടിക്കുക")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
