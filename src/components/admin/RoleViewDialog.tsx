import {
  ClipboardList,
  FileText,
  Headset,
  Info,
  Lock,
  Pencil,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

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
  assignmentLevels,
  permissionKey,
  permissionModules,
  type PermissionModuleId,
} from "@/data/party-workers";
import { administrativePermissionOptions, type ManagedRole } from "@/data/role-management";
import { cn } from "@/lib/utils";

const moduleIcons: Record<PermissionModuleId, LucideIcon> = {
  schemes: FileText,
  party_workers: Users,
  applications: ClipboardList,
  help_desk: Headset,
  applicant_profile: UserRound,
};

export function RoleViewDialog({
  role,
  onClose,
  onEdit,
  lang,
}: {
  role: ManagedRole | null;
  onClose: () => void;
  onEdit: (role: ManagedRole) => void;
  lang: "en" | "ml";
}) {
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  if (!role) return null;
  return (
    <Dialog open={Boolean(role)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[88vh] w-[calc(100%-1rem)] max-w-2xl gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-border/80 px-5 py-4 pr-12 text-left">
          <div className="flex flex-wrap items-center gap-1.5">
            <DialogTitle className="text-base">{role.name}</DialogTitle>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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
              {role.status}
            </span>
          </div>
          <DialogDescription className="text-[11px] leading-relaxed">
            {role.description || tr("No description added.", "വിവരണം ചേർത്തിട്ടില്ല.")}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(88vh-8rem)] space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <ViewStat
              label={tr("Assigned users", "അസൈൻ ചെയ്ത ഉപയോക്താക്കൾ")}
              value={role.assignedUsers.toLocaleString("en-IN")}
            />
            <ViewStat
              label={tr("Module actions", "മൊഡ്യൂൾ പ്രവർത്തനങ്ങൾ")}
              value={String(role.permissions.length)}
            />
            <ViewStat
              label={tr("Admin controls", "അഡ്മിൻ നിയന്ത്രണങ്ങൾ")}
              value={String(role.administrativePermissions.length)}
            />
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {tr("Allowed assignment levels", "അനുവദനീയ അസൈൻമെന്റ് ലെവലുകൾ")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {role.assignmentLevels.map((level) => {
                const option = assignmentLevels.find((item) => item.id === level);
                return (
                  <span
                    key={level}
                    className="rounded-lg border border-border bg-muted/30 px-2 py-1 text-[10px] font-bold text-foreground"
                  >
                    {option ? (lang === "ml" ? option.ml : option.en) : level}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {tr("Module permissions", "മൊഡ്യൂൾ അനുമതികൾ")}
            </p>
            <div className="space-y-2">
              {permissionModules.map((module) => {
                const selected = module.actions.filter((action) =>
                  role.permissions.includes(permissionKey(module.id, action.id)),
                );
                if (selected.length === 0) return null;
                const Icon = moduleIcons[module.id];
                return (
                  <div key={module.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      <p className="text-[11px] font-extrabold text-foreground">
                        {lang === "ml" ? module.ml : module.en}
                      </p>
                      <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                        {selected.length}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {selected.map((action) => (
                        <span
                          key={action.id}
                          className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[9.5px] font-semibold text-muted-foreground"
                        >
                          {lang === "ml" ? action.ml : action.en}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {tr("Administrative permissions", "അഡ്മിനിസ്ട്രേറ്റീവ് അനുമതികൾ")}
            </p>
            {role.administrativePermissions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-3 text-[10.5px] font-semibold text-muted-foreground">
                {tr(
                  "No administrative authority granted.",
                  "അഡ്മിനിസ്ട്രേറ്റീവ് അധികാരം നൽകിയിട്ടില്ല.",
                )}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {role.administrativePermissions.map((id) => {
                  const option = administrativePermissionOptions.find((item) => item.id === id);
                  if (!option) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                    >
                      <Lock className="h-3 w-3" />
                      {lang === "ml" ? option.ml : option.en}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 p-3 text-[10px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p>
              {tr(
                "This role controls app permissions only. Choose actual districts, local bodies, and booths when assigning access areas to an individual worker.",
                "ഈ റോൾ ആപ്പ് അനുമതികൾ മാത്രം നിയന്ത്രിക്കുന്നു. ഒരു പ്രവർത്തകന് ആക്സസ് പ്രദേശങ്ങൾ നൽകുമ്പോൾ യഥാർത്ഥ ജില്ലകൾ, തദ്ദേശ സ്ഥാപനങ്ങൾ, ബൂത്തുകൾ എന്നിവ തിരഞ്ഞെടുക്കുക.",
              )}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border/80 px-5 py-3 sm:space-x-0">
          <Button type="button" variant="outline" onClick={onClose}>
            {tr("Close", "അടയ്ക്കുക")}
          </Button>
          {!role.system ? (
            <Button type="button" onClick={() => onEdit(role)}>
              <Pencil className="h-3.5 w-3.5" />
              {tr("Edit role", "റോൾ തിരുത്തുക")}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-extrabold text-foreground">{value}</p>
    </div>
  );
}
