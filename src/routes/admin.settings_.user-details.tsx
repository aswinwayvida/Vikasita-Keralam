import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Headset,
  Pencil,
  ShieldCheck,
  UserRound,
  Users,
  Users2,
  Phone,
  Calendar,
  Building2,
  MoreHorizontal,
  Power,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  loadManagedRoles,
  type ManagedRole,
} from "@/data/role-management";
import {
  loadManagedDesktopUsers,
  getUserAvatarUrl,
  type ManagedUser,
} from "@/components/admin/RoleAccessSettings";
import {
  getUserDesignation,
  getUserRegion,
  getUserOrgDistrict,
  getUserMandalam,
  getUserArea,
  getUserBooth,
} from "@/data/users";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings_/user-details")({
  validateSearch: (search: Record<string, unknown>) => ({
    userId: typeof search.userId === "string" ? search.userId : undefined,
  }),
  head: () => ({
    meta: [{ title: "User Details · Admin · Vikasita Keralam" }],
  }),
  component: UserDetailsPage,
});

interface MatrixColumn {
  id: string;
  labelEn: string;
  labelMl: string;
}

interface MatrixRow {
  moduleId: string;
  labelEn: string;
  labelMl: string;
  icon: typeof FileText;
  columns: MatrixColumn[];
}

const primaryMatrixColumns: MatrixColumn[] = [
  { id: "create", labelEn: "CREATE", labelMl: "സൃഷ്ടിക്കുക" },
  { id: "view", labelEn: "VIEW", labelMl: "കാണുക" },
  { id: "edit", labelEn: "EDIT", labelMl: "തിരുത്തുക" },
  { id: "delete", labelEn: "DELETE", labelMl: "നീക്കം ചെയ്യുക" },
];

const primaryMatrixRows: MatrixRow[] = [
  {
    moduleId: "applicant_profile",
    labelEn: "Applicant Profile",
    labelMl: "അപേക്ഷകന്റെ പ്രൊഫൈൽ",
    icon: UserRound,
    columns: primaryMatrixColumns,
  },
  {
    moduleId: "applications",
    labelEn: "Applications",
    labelMl: "അപേക്ഷകൾ",
    icon: ClipboardList,
    columns: primaryMatrixColumns,
  },
  {
    moduleId: "schemes",
    labelEn: "Schemes",
    labelMl: "പദ്ധതികൾ",
    icon: FileText,
    columns: primaryMatrixColumns,
  },
  {
    moduleId: "roles",
    labelEn: "Role & Access",
    labelMl: "റോളും ആക്‌സസും",
    icon: ShieldCheck,
    columns: primaryMatrixColumns,
  },
  {
    moduleId: "designations",
    labelEn: "Designation",
    labelMl: "തസ്തിക",
    icon: Users2,
    columns: primaryMatrixColumns,
  },
  {
    moduleId: "party_workers",
    labelEn: "Users",
    labelMl: "ഉപയോക്താക്കൾ",
    icon: Users,
    columns: primaryMatrixColumns,
  },
];

const secondaryMatrixColumns: MatrixColumn[] = [
  { id: "view", labelEn: "VIEW", labelMl: "കാണുക" },
  { id: "assign", labelEn: "ASSIGN", labelMl: "അസൈൻ ചെയ്യുക" },
  { id: "respond", labelEn: "RESPOND", labelMl: "മറുപടി നൽകുക" },
];

const secondaryMatrixRows: MatrixRow[] = [
  {
    moduleId: "help_desk",
    labelEn: "Request",
    labelMl: "അഭ്യർത്ഥന",
    icon: Headset,
    columns: secondaryMatrixColumns,
  },
  {
    moduleId: "team",
    labelEn: "Team",
    labelMl: "ടീം",
    icon: Users,
    columns: [
      { id: "view", labelEn: "VIEW", labelMl: "കാണുക" },
    ],
  },
];

function UserDetailsPage() {
  const { lang } = useLang();
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const navigate = useNavigate();
  const { userId } = Route.useSearch();

  // Load user data
  const users = useMemo(() => loadManagedDesktopUsers(), []);
  const targetUser: ManagedUser | undefined = useMemo(() => {
    if (userId) {
      const found = users.find((u) => u.id === userId);
      if (found) return found;
    }
    return users[0]; // fallback to first user
  }, [users, userId]);

  const [status, setStatus] = useState<"Active" | "Inactive">(
    targetUser?.status === "Active" || targetUser?.status === "Verified" ? "Active" : "Inactive"
  );

  // Load roles data to show role permissions matrix
  const roles = useMemo(() => loadManagedRoles(), []);
  const userRole: ManagedRole | undefined = useMemo(() => {
    if (!targetUser) return undefined;
    const roleName = targetUser.assignedRole || "Admin";
    return roles.find((r) => r.name.toLowerCase() === roleName.toLowerCase()) || roles[0];
  }, [roles, targetUser]);

  if (!targetUser) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>{tr("User not found.", "ഉപയോക്താവിനെ കണ്ടെത്തിയില്ല.")}</p>
        <Button
          onClick={() => void navigate({ to: "/admin/volunteers" })}
          className="mt-4"
        >
          {tr("Back to Users", "ഉപയോക്താക്കളിലേക്ക് തിരികെ പോകുക")}
        </Button>
      </div>
    );
  }

  const region = getUserRegion(targetUser);
  const orgDistrict = getUserOrgDistrict(targetUser);
  const mandalam = getUserMandalam(targetUser);
  const area = getUserArea(targetUser);
  const booth = getUserBooth(targetUser);
  const designation = getUserDesignation(targetUser);

  const activePerms = new Set(userRole?.permissions || []);
  const isAdminRole = (targetUser.assignedRole || "Admin").toLowerCase().includes("admin");

  const handleToggleStatus = () => {
    const nextStatus = status === "Active" ? "Inactive" : "Active";
    setStatus(nextStatus);
    toast.success(
      nextStatus === "Active"
        ? tr("User activated successfully", "ഉപയോക്താവിനെ സജീവമാക്കി")
        : tr("User deactivated successfully", "ഉപയോക്താവിനെ നിർജ്ജീവമാക്കി")
    );
  };

  const handleDeleteUser = () => {
    if (window.confirm(tr("Are you sure you want to delete this user?", "ഈ ഉപയോക്താവിനെ നീക്കം ചെയ്യാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?"))) {
      toast.success(tr("User deleted successfully", "ഉപയോക്താവിനെ നീക്കം ചെയ്തു"));
      void navigate({ to: "/admin/volunteers" });
    }
  };

  // Helper to check if permission is active for module & column
  const isPermChecked = (moduleId: string, colId: string): boolean => {
    if (isAdminRole) {
      if (moduleId === "applications" || moduleId === "schemes" || moduleId === "party_workers") {
        return colId !== "delete";
      }
      if (moduleId === "help_desk") {
        return true;
      }
      if (activePerms.has(`${moduleId}:${colId}`) || activePerms.has(`${moduleId}:create`)) {
        return true;
      }
      return false;
    }
    return (
      activePerms.has(`${moduleId}:${colId}`) ||
      activePerms.has(`${moduleId}:create`) ||
      activePerms.has(`${moduleId}:view`)
    );
  };

  const getModuleDataAccessLabel = (moduleId: string): string => {
    if (moduleId === "help_desk") return "Own + Peers Records";
    return "Own Records";
  };

  return (
    <div className="w-full pb-10 text-foreground md:pb-28">
      {/* Top Header without Edit User button */}
      <section className="sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5 mb-6">
        <div className="flex items-center justify-between gap-3 pb-1 sm:pb-0">
          <div className="flex items-center gap-3 sm:gap-2.5">
            <button
              type="button"
              onClick={() => void navigate({ to: "/admin/volunteers" })}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary group cursor-pointer sm:h-8 sm:w-8"
              title={tr("Back to Users", "ഉപയോക്താക്കളിലേക്ക് തിരികെ പോകുക")}
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 sm:h-3.5 sm:w-3.5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                {tr("User Details", "ഉപയോക്തൃ വിവരങ്ങൾ")}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {/* Merged User Details and Organisation Details Section */}
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-5">
          {/* User Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={getUserAvatarUrl(targetUser)}
                alt={targetUser.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {lang === "ml" ? targetUser.nameMl || targetUser.name : targetUser.name}
                  </h2>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200",
                    )}
                  >
                    {status === "Active" ? tr("Active", "സജീവം") : tr("Inactive", "നിർജ്ജീവമം")}
                  </span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">
                  {lang === "ml" ? targetUser.designationMl : designation} • {region}
                </p>
                <div className="flex items-center gap-2.5 pt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-amber-500" />
                    {targetUser.mobile}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    {tr("Joined", "ചേർന്ന തീയതി")}: {targetUser.joinedDate || "2021-07-22"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions & Role section on right side of profile card */}
            <div className="flex flex-col items-start md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-border">
              <div className="flex items-center gap-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">{tr("Assigned Role", "നൽകിയിട്ടുള്ള റോൾ")}: </span>
                  <span className="font-bold text-amber-600 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md">
                    {targetUser.assignedRole || "Admin"}
                  </span>
                </div>

                {/* Edit User Button */}
                <Button
                  type="button"
                  onClick={() =>
                    void navigate({
                      to: "/admin/settings/new-user",
                      search: { editUserId: targetUser.id },
                    })
                  }
                  className="bg-amber-500 text-white font-semibold hover:bg-amber-600 h-8 px-3 text-xs cursor-pointer gap-1.5 rounded-lg shadow-xs"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {tr("Edit User", "ഉപയോക്താവിനെ തിരുത്തുക")}
                </Button>

                {/* 3-Dot More Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-border text-slate-600 hover:text-foreground cursor-pointer"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={handleToggleStatus}
                      className="cursor-pointer gap-2 text-xs font-medium"
                    >
                      <Power className="h-3.5 w-3.5 text-amber-600" />
                      {status === "Active"
                        ? tr("Deactivate", "നിർജ്ജീവമാക്കുക")
                        : tr("Activate", "സജീവമാക്കുക")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDeleteUser}
                      className="cursor-pointer gap-2 text-xs font-medium text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {tr("Delete User", "ഉപയോക്താവിനെ നീക്കം ചെയ്യാൻ")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border/60" />

          {/* Organisation Details Sub-section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-500" />
              {tr("Organisation Details", "സംഘടനാ വിവരങ്ങൾ")}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-50/70 p-3 rounded-xl border border-border/60 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {tr("REGION", "മേഖല")}
                </span>
                <p className="font-bold text-slate-800 truncate">{region}</p>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-border/60 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {tr("ORGANISATIONAL DISTRICT", "സംഘടനാ ജില്ല")}
                </span>
                <p className="font-bold text-slate-800 truncate">{orgDistrict}</p>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-border/60 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {tr("MANDALAM", "മണ്ഡലം")}
                </span>
                <p className="font-bold text-slate-800 truncate">{mandalam}</p>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-border/60 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {tr("AREA", "ഏരിയ")}
                </span>
                <p className="font-bold text-slate-800 truncate">{area}</p>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-border/60 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {tr("BOOTH", "ബൂത്ത്")}
                </span>
                <p className="font-bold text-slate-800 truncate">{booth}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Role Permissions Matrix Section */}
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              {tr("Role Permissions Matrix", "റോൾ അനുമതികളുടെ മാട്രിക്സ്")}
            </h2>
            <span className="text-xs font-semibold text-muted-foreground">
              {tr("Role", "റോൾ")}: <strong className="text-slate-800">{targetUser.assignedRole || "Admin"}</strong>
            </span>
          </div>

          <div className="space-y-4">
            {/* Primary Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-border/80 bg-white">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/80 border-b border-border text-[11px] font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="p-3.5 text-left font-bold">{tr("MODULES", "മൊഡ്യൂളുകൾ")}</th>
                    <th className="p-3.5 text-center font-bold">{tr("CREATE", "സൃഷ്ടിക്കുക")}</th>
                    <th className="p-3.5 text-center font-bold">{tr("VIEW", "കാണുക")}</th>
                    <th className="p-3.5 text-center font-bold">{tr("EDIT", "തിരുത്തുക")}</th>
                    <th className="p-3.5 text-center font-bold">{tr("DELETE", "നീക്കം ചെയ്യുക")}</th>
                    <th className="p-3.5 text-left font-bold">{tr("DATA ACCESS LEVEL", "ഡാറ്റാ ആക്സസ് ലെവൽ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {primaryMatrixRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.moduleId} className="hover:bg-slate-50/40">
                        <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                          <Icon className="h-4 w-4 text-amber-500 shrink-0" />
                          {lang === "ml" ? row.labelMl : row.labelEn}
                        </td>
                        {primaryMatrixColumns.map((col) => {
                          const checked = isPermChecked(row.moduleId, col.id);
                          return (
                            <td key={col.id} className="p-3.5 text-center">
                              <div className="flex justify-center">
                                <span
                                  className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full transition-all",
                                    checked
                                      ? "border-amber-500 bg-amber-500 text-white shadow-2xs"
                                      : "border-2 border-amber-300 bg-white",
                                  )}
                                >
                                  {checked ? <Check className="h-3.5 w-3.5 stroke-[3] text-white" /> : null}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-3.5">
                          <div className="flex h-8 w-full max-w-[200px] items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs">
                            <span className="truncate">{getModuleDataAccessLabel(row.moduleId)}</span>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Secondary Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-border/80 bg-white">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/80 border-b border-border text-[11px] font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="p-3.5 text-left font-bold w-1/4">{tr("MODULES", "മൊഡ്യൂളുകൾ")}</th>
                    <th className="p-3.5 text-center font-bold">{tr("VIEW", "കാണുക")}</th>
                    <th className="p-3.5 text-center font-bold">{tr("ASSIGN", "അസൈൻ ചെയ്യുക")}</th>
                    <th className="p-3.5 text-center font-bold">{tr("RESPOND", "മറുപടി നൽകുക")}</th>
                    <th className="p-3.5 text-left font-bold w-1/4">{tr("DATA ACCESS LEVEL", "ഡാറ്റാ ആക്സസ് ലെവൽ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {secondaryMatrixRows.map((row) => {
                    const Icon = row.icon;
                    const isTeamRow = row.moduleId === "team";
                    return (
                      <tr key={row.moduleId} className="hover:bg-slate-50/40">
                        <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                          <Icon className="h-4 w-4 text-amber-500 shrink-0" />
                          {lang === "ml" ? row.labelMl : row.labelEn}
                        </td>

                        {/* VIEW */}
                        <td className="p-3.5 text-center">
                          <div className="flex justify-center">
                            <span
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full transition-all",
                                isPermChecked(row.moduleId, "view")
                                  ? "border-amber-500 bg-amber-500 text-white shadow-2xs"
                                  : "border-2 border-amber-300 bg-white",
                              )}
                            >
                              {isPermChecked(row.moduleId, "view") ? (
                                <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                              ) : null}
                            </span>
                          </div>
                        </td>

                        {/* ASSIGN */}
                        <td className="p-3.5 text-center">
                          {isTeamRow ? (
                            <span className="text-slate-400 font-bold">—</span>
                          ) : (
                            <div className="flex justify-center">
                              <span
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full transition-all",
                                  isPermChecked(row.moduleId, "assign")
                                    ? "border-amber-500 bg-amber-500 text-white shadow-2xs"
                                    : "border-2 border-amber-300 bg-white",
                                )}
                              >
                                {isPermChecked(row.moduleId, "assign") ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                                ) : null}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* RESPOND */}
                        <td className="p-3.5 text-center">
                          {isTeamRow ? (
                            <span className="text-slate-400 font-bold">—</span>
                          ) : (
                            <div className="flex justify-center">
                              <span
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full transition-all",
                                  isPermChecked(row.moduleId, "respond")
                                    ? "border-amber-500 bg-amber-500 text-white shadow-2xs"
                                    : "border-2 border-amber-300 bg-white",
                                )}
                              >
                                {isPermChecked(row.moduleId, "respond") ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                                ) : null}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* DATA ACCESS LEVEL */}
                        <td className="p-3.5">
                          <div className="flex h-8 w-full max-w-[200px] items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs">
                            <span className="truncate">{getModuleDataAccessLabel(row.moduleId)}</span>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
