import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  Filter,
  Headset,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
  Users2,
  UsersRound,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { permissionModules, type PermissionModuleId } from "@/data/party-workers";
import {
  allScopedPermissionKeysWithExtras,
  dataAccessOptions,
  loadManagedRoles,
  scopedPermissionKey,
  toggleScopedPermissionAction,
  type DataAccessScope,
} from "@/data/role-management";
import {
  getUserDesignation,
  getUserRegion,
  getUserOrgDistrict,
  getUserMandalam,
  getUserArea,
  getUserBooth,
} from "@/data/users";
import {
  getUserAvatarUrl,
  loadManagedDesktopUsers,
  saveManagedDesktopUsers,
  type ManagedUser,
} from "@/components/admin/RoleAccessSettings";

export const Route = createFileRoute("/admin/settings_/assign-role")({
  validateSearch: (search: Record<string, unknown>) => ({
    userId: typeof search.userId === "string" ? search.userId : undefined,
    userIds: typeof search.userIds === "string" ? search.userIds : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Assign Role to User · Admin · Vikasita Keralam" },
      { name: "description", content: "Assign role and customize permissions for user." },
    ],
  }),
  component: AssignRoleToUserPage,
});

type MatrixColumnId = "create" | "view" | "edit" | "delete" | "assign" | "respond";

interface MatrixColumn {
  id: MatrixColumnId;
  en: string;
  ml: string;
  actionIds: string[];
}

interface MatrixRow {
  key: string;
  moduleId: PermissionModuleId;
  en: string;
  ml: string;
  icon: React.ComponentType<{ className?: string }>;
  columns: readonly MatrixColumn[];
  actionIdsByColumn?: Partial<Record<MatrixColumnId, string[]>>;
}

const primaryMatrixColumns: readonly MatrixColumn[] = [
  { id: "create", en: "CREATE", ml: "സൃഷ്ടിക്കുക", actionIds: ["create_schemes", "add_workers", "create_applications", "create_profile", "create_roles", "create_designations", "create_users"] },
  { id: "view", en: "VIEW", ml: "കാണുക", actionIds: ["view_schemes", "view_workers", "view_applications", "view_profile", "view_roles", "view_designations", "view_users"] },
  { id: "edit", en: "EDIT", ml: "തിരുത്തുക", actionIds: ["edit_schemes", "edit_workers", "edit_applications", "edit_profile", "edit_roles", "edit_designations", "edit_users"] },
  { id: "delete", en: "DELETE", ml: "ഡിലീറ്റ്", actionIds: ["delete_schemes", "remove_workers", "delete_applications", "delete_profile", "delete_roles", "delete_designations", "delete_users"] },
];

const secondaryMatrixColumns: readonly MatrixColumn[] = [
  { id: "view", en: "VIEW", ml: "കാണുക", actionIds: ["view_helpdesk", "view_teams"] },
  { id: "assign", en: "ASSIGN", ml: "അസൈൻ", actionIds: ["manage_helpdesk"] },
  { id: "respond", en: "RESPOND", ml: "മറുപടി", actionIds: ["resolve_helpdesk"] },
];

const moduleIcons: Record<PermissionModuleId, React.ComponentType<{ className?: string }>> = {
  schemes: ClipboardList,
  party_workers: Users,
  applications: FileText,
  help_desk: Headset,
  applicant_profile: UserRound,
  roles: ShieldCheck,
  designations: Users2,
};

const primaryMatrixRows: MatrixRow[] = [
  { key: "applicant_profile", moduleId: "applicant_profile", en: "Applicant Profile", ml: "അപേക്ഷകന്റെ വിവരങ്ങൾ", icon: UserRound, columns: primaryMatrixColumns },
  { key: "applications", moduleId: "applications", en: "Applications", ml: "അപേക്ഷകൾ", icon: FileText, columns: primaryMatrixColumns },
  { key: "schemes", moduleId: "schemes", en: "Schemes", ml: "പദ്ധതികൾ", icon: ClipboardList, columns: primaryMatrixColumns },
  { key: "roles", moduleId: "roles", en: "Role & Access", ml: "റോൾ & ആക്സസ്", icon: ShieldCheck, columns: primaryMatrixColumns },
  { key: "designations", moduleId: "designations", en: "Designation", ml: "പദവി", icon: Users2, columns: primaryMatrixColumns },
  { key: "party_workers", moduleId: "party_workers", en: "Users", ml: "ഉപയോക്താക്കൾ", icon: Users, columns: primaryMatrixColumns },
];

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

function getMatrixColumnActionIds(row: MatrixRow, columnId: MatrixColumnId): string[] {
  const override = row.actionIdsByColumn?.[columnId];
  if (override) return [...override];

  const module = permissionModules.find((item) => item.id === row.moduleId);
  if (!module) return [];

  return module.actions
    .filter((action) => {
      const aid = action.id.toLowerCase();
      if (columnId === "create") return aid.includes("create") || aid.includes("add");
      if (columnId === "view") return aid.includes("view");
      if (columnId === "edit") return aid.includes("edit") || aid.includes("manage");
      if (columnId === "delete") return aid.includes("delete") || aid.includes("remove");
      if (columnId === "assign") return aid.includes("manage") || aid.includes("assign");
      if (columnId === "respond") return aid.includes("resolve") || aid.includes("respond");
      return false;
    })
    .map((a) => a.id);
}

const ROLE_OPTIONS = ["Admin", "Sub Admin", "Support Admin", "Specific Role"];

function FilterDropdownSelector({
  title,
  placeholder,
  options,
  selectedValues,
  onChange,
  tr,
}: {
  title: string;
  placeholder: string;
  options: string[];
  selectedValues: string[];
  onChange: (newValues: string[]) => void;
  tr: (en: string, ml: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((item) => item !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const getLabelText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} ${tr("Selected", "തിരഞ്ഞെടുത്തു")}`;
  };

  if (options.length === 0) return null;

  return (
    <div className="space-y-1">
      <label className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">
        {title}
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full h-9 px-3 rounded-lg border flex items-center justify-between text-xs font-semibold transition-all bg-white cursor-pointer select-none text-left shadow-2xs",
              selectedValues.length > 0
                ? "border-amber-400 bg-[#FFF8F0] text-amber-950 font-bold"
                : "border-border text-slate-800 hover:border-amber-300 hover:bg-slate-50/50",
            )}
          >
            <span className="truncate pr-2">{getLabelText()}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2 text-xs bg-white shadow-xl border border-amber-200 rounded-xl space-y-2 z-50">
          {options.length > 4 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr("Search...", "തിരയുക...")}
                className="w-full h-8 pl-8 pr-2 text-xs rounded-md border border-border bg-slate-50 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between px-1.5 py-1 border-b border-slate-100 text-[11px]">
            <span className="font-bold text-slate-500">
              {selectedValues.length > 0 ? `${selectedValues.length} ${tr("selected", "തിരഞ്ഞെടുത്തു")}` : tr("All", "എല്ലാം")}
            </span>
            {selectedValues.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-amber-600 hover:text-amber-700 font-bold cursor-pointer hover:underline"
              >
                {tr("Clear", "നീക്കം ചെയ്യുക")}
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
            <div
              onClick={() => onChange([])}
              className={cn(
                "flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-xs transition-colors font-medium",
                selectedValues.length === 0
                  ? "bg-amber-50 text-amber-900 font-bold"
                  : "hover:bg-slate-100 text-slate-700",
              )}
            >
              <span>{tr("All", "എല്ലാം")}</span>
              {selectedValues.length === 0 && <Check className="h-3.5 w-3.5 text-amber-600 stroke-[2.5]" />}
            </div>

            {filteredOptions.map((opt) => {
              const isChecked = selectedValues.includes(opt);
              return (
                <div
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={cn(
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-md cursor-pointer text-xs transition-colors select-none",
                    isChecked
                      ? "bg-[#FFF8F0] text-amber-950 font-bold"
                      : "hover:bg-slate-100 text-slate-700 font-medium",
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-md border shrink-0 flex items-center justify-center transition-colors",
                      isChecked
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-slate-300 bg-white",
                    )}
                  >
                    {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <span className="truncate flex-1">{opt}</span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function AssignRoleToUserPage() {
  const { lang } = useLang();
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const navigate = useNavigate();
  const { isMobile, state: sidebarState } = useSidebar();
  const { userId, userIds } = Route.useSearch();

  const [accordionOpen, setAccordionOpen] = useState(false);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [currentUser, setCurrentUser] = useState<ManagedUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("Admin");

  // Filter States
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedOrgDistricts, setSelectedOrgDistricts] = useState<string[]>([]);
  const [selectedMandalams, setSelectedMandalams] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedBooths, setSelectedBooths] = useState<string[]>([]);

  const toggleArrayFilter = (
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    val: string,
  ) => {
    if (current.includes(val)) {
      setter(current.filter((item) => item !== val));
    } else {
      setter([...current, val]);
    }
  };

  const availDesignations = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => set.add(getUserDesignation(u)));
    return Array.from(set).sort();
  }, [users]);

  const availRegions = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => set.add(getUserRegion(u)));
    return Array.from(set).sort();
  }, [users]);

  const availOrgDistricts = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => set.add(getUserOrgDistrict(u)));
    return Array.from(set).sort();
  }, [users]);

  const availMandalams = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => set.add(getUserMandalam(u)));
    return Array.from(set).sort();
  }, [users]);

  const availAreas = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => set.add(getUserArea(u)));
    return Array.from(set).sort();
  }, [users]);

  const availBooths = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => set.add(getUserBooth(u)));
    return Array.from(set).sort();
  }, [users]);

  const activeFilterCount =
    selectedDesignations.length +
    selectedRegions.length +
    selectedOrgDistricts.length +
    selectedMandalams.length +
    selectedAreas.length +
    selectedBooths.length;

  const filteredUsersList = useMemo(() => {
    return users.filter((u) => {
      if (selectedDesignations.length > 0 && !selectedDesignations.includes(getUserDesignation(u))) return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(getUserRegion(u))) return false;
      if (selectedOrgDistricts.length > 0 && !selectedOrgDistricts.includes(getUserOrgDistrict(u))) return false;
      if (selectedMandalams.length > 0 && !selectedMandalams.includes(getUserMandalam(u))) return false;
      if (selectedAreas.length > 0 && !selectedAreas.includes(getUserArea(u))) return false;
      if (selectedBooths.length > 0 && !selectedBooths.includes(getUserBooth(u))) return false;
      return true;
    });
  }, [
    users,
    selectedDesignations,
    selectedRegions,
    selectedOrgDistricts,
    selectedMandalams,
    selectedAreas,
    selectedBooths,
  ]);

  const [scopedPermissions, setScopedPermissions] = useState<string[]>([]);

  const isAllChecked = useMemo(() => {
    if (scopedPermissions.length === 0) return false;
    return allScopedPermissionKeysWithExtras.every((k) => scopedPermissions.includes(k));
  }, [scopedPermissions]);
  const [moduleDataAccess, setModuleDataAccess] = useState<
    Record<PermissionModuleId, DataAccessScope[]>
  >(() =>
    permissionModules.reduce(
      (acc, m) => ({ ...acc, [m.id]: ["own_records", "below_level", "same_level", "above_level"] as DataAccessScope[] }),
      {} as Record<PermissionModuleId, DataAccessScope[]>,
    ),
  );

  const parsedTargetUserIds = useMemo(() => {
    if (userIds) return userIds.split(",").map((s) => s.trim()).filter(Boolean);
    if (userId) return [userId];
    return [];
  }, [userId, userIds]);

  const selectedUsers = useMemo(() => {
    if (parsedTargetUserIds.length > 0) {
      const matched = users.filter((u) => parsedTargetUserIds.includes(u.id));
      if (matched.length > 0) return matched;
    }
    return currentUser ? [currentUser] : [];
  }, [users, parsedTargetUserIds, currentUser]);

  useEffect(() => {
    const loadedUsers = loadManagedDesktopUsers();
    setUsers(loadedUsers);

    const parsedIds = userIds
      ? userIds.split(",").map((s) => s.trim()).filter(Boolean)
      : userId
      ? [userId]
      : [];

    const foundUsers = parsedIds.length > 0
      ? loadedUsers.filter((u) => parsedIds.includes(u.id))
      : [];

    const found = foundUsers[0] || loadedUsers.find((u) => u.id === userId) || loadedUsers[0] || null;
    setCurrentUser(found);

    if (found) {
      const initialRole = found.assignedRole || "Admin";
      setSelectedRole(initialRole);
      loadPermissionsForRoleName(initialRole);
    }
  }, [userId, userIds]);

  const loadPermissionsForRoleName = (roleName: string) => {
    const roles = loadManagedRoles();
    const matchedRole = roles.find(
      (r) => r.name.toLowerCase() === roleName.toLowerCase() || r.name.toLowerCase().includes(roleName.toLowerCase()),
    );

    if (matchedRole && matchedRole.scopedPermissions && matchedRole.scopedPermissions.length > 0) {
      setScopedPermissions([...matchedRole.scopedPermissions]);
      if (matchedRole.dataAccess) {
        setModuleDataAccess((prev) => ({
          ...prev,
          ...matchedRole.dataAccess,
        }));
      }
    } else {
      if (roleName === "Admin") {
        setScopedPermissions([...allScopedPermissionKeysWithExtras]);
        setModuleDataAccess(
          permissionModules.reduce(
            (acc, m) => ({ ...acc, [m.id]: ["own_records", "below_level", "same_level", "above_level"] as DataAccessScope[] }),
            {} as Record<PermissionModuleId, DataAccessScope[]>,
          ),
        );
      } else if (roleName === "Sub Admin") {
        const subAdminPermissions: string[] = [];
        permissionModules.forEach((m) => {
          m.actions.forEach((a) => {
            if (
              a.id.includes("view") ||
              a.id.includes("create") ||
              a.id.includes("edit") ||
              a.id.includes("export") ||
              a.id.includes("add")
            ) {
              const scopes: DataAccessScope[] = ["own_records", "below_level", "same_level"];
              scopes.forEach((d) => {
                subAdminPermissions.push(scopedPermissionKey(m.id, d, a.id));
              });
            }
          });
        });
        setScopedPermissions(subAdminPermissions);
        setModuleDataAccess(
          permissionModules.reduce(
            (acc, m) => ({ ...acc, [m.id]: ["own_records", "below_level", "same_level"] as DataAccessScope[] }),
            {} as Record<PermissionModuleId, DataAccessScope[]>,
          ),
        );
      } else if (roleName === "Support Admin") {
        const supportPermissions: string[] = [];
        permissionModules.forEach((m) => {
          m.actions.forEach((a) => {
            if (
              a.id.includes("view") ||
              m.id === "help_desk" ||
              a.id.includes("resolve") ||
              a.id.includes("manage")
            ) {
              const scopes: DataAccessScope[] = ["own_records", "same_level"];
              scopes.forEach((d) => {
                supportPermissions.push(scopedPermissionKey(m.id, d, a.id));
              });
            }
          });
        });
        setScopedPermissions(supportPermissions);
        setModuleDataAccess(
          permissionModules.reduce(
            (acc, m) => ({ ...acc, [m.id]: ["own_records", "same_level"] as DataAccessScope[] }),
            {} as Record<PermissionModuleId, DataAccessScope[]>,
          ),
        );
      } else if (roleName === "Specific Role" || roleName === "Other Specific Role" || roleName === "Other Role" || roleName === "Other") {
        setScopedPermissions([]);
        setModuleDataAccess(
          permissionModules.reduce(
            (acc, m) => ({ ...acc, [m.id]: ["own_records"] as DataAccessScope[] }),
            {} as Record<PermissionModuleId, DataAccessScope[]>,
          ),
        );
      } else {
        const allScoped: string[] = [];
        permissionModules.forEach((m) => {
          m.actions.forEach((a) => {
            dataAccessOptions.forEach((d) => {
              allScoped.push(scopedPermissionKey(m.id, d.id as DataAccessScope, a.id));
            });
          });
        });
        setScopedPermissions(allScoped);
      }
    }
  };

  const handleRoleChange = (newRoleName: string) => {
    setSelectedRole(newRoleName);
    loadPermissionsForRoleName(newRoleName);
  };

  const scopesForModule = (moduleId: PermissionModuleId): DataAccessScope[] =>
    moduleDataAccess[moduleId] || ["state", "district", "local_body", "own_records"];

  const handleToggleColumn = (row: MatrixRow, columnId: MatrixColumnId) => {
    const actionIds = getMatrixColumnActionIds(row, columnId);
    if (actionIds.length === 0) return;

    const checked = isColumnChecked(row, columnId);
    const enabled = !checked;

    const currentScopes = scopesForModule(row.moduleId);
    let nextScoped = [...scopedPermissions];

    for (const actionId of actionIds) {
      for (const scope of currentScopes) {
        nextScoped = toggleScopedPermissionAction(
          nextScoped,
          row.moduleId,
          scope,
          actionId,
          enabled,
        );
      }
    }

    setScopedPermissions(nextScoped);
  };

  const isColumnChecked = (row: MatrixRow, columnId: MatrixColumnId) => {
    const actionIds = getMatrixColumnActionIds(row, columnId);
    if (actionIds.length === 0) return false;

    const currentScopes = scopesForModule(row.moduleId);
    return actionIds.every((actionId) =>
      currentScopes.every((scope) =>
        scopedPermissions.includes(scopedPermissionKey(row.moduleId, scope, actionId)),
      ),
    );
  };

  const isColumnDisabled = (row: MatrixRow, columnId: MatrixColumnId) =>
    getMatrixColumnActionIds(row, columnId).length === 0;

  const isModuleScopeSelected = (moduleId: PermissionModuleId, scope: DataAccessScope) =>
    scopesForModule(moduleId).includes(scope);

  const toggleModuleScope = (moduleId: PermissionModuleId, scope: DataAccessScope) => {
    const currentScopes = scopesForModule(moduleId);
    const hasScope = currentScopes.includes(scope);

    let nextScopes: DataAccessScope[];
    if (hasScope) {
      nextScopes = currentScopes.filter((item) => item !== scope);
      if (nextScopes.length === 0) nextScopes = ["own_records"];
    } else {
      nextScopes = [...currentScopes, scope];
    }

    setModuleDataAccess((prev) => ({ ...prev, [moduleId]: nextScopes }));

    const module = permissionModules.find((m) => m.id === moduleId);
    if (!module) return;

    let nextScopedPermissions = [...scopedPermissions];
    module.actions.forEach((action) => {
      const isActionActiveInOldScopes = currentScopes.some((s) =>
        nextScopedPermissions.includes(scopedPermissionKey(moduleId, s, action.id)),
      );

      if (isActionActiveInOldScopes) {
        currentScopes.forEach((s) => {
          const key = scopedPermissionKey(moduleId, s, action.id);
          nextScopedPermissions = nextScopedPermissions.filter((k) => k !== key);
        });
        nextScopes.forEach((s) => {
          const key = scopedPermissionKey(moduleId, s, action.id);
          if (!nextScopedPermissions.includes(key)) {
            nextScopedPermissions.push(key);
          }
        });
      }
    });

    setScopedPermissions(nextScopedPermissions);
  };

  const handleSave = () => {
    if (!currentUser && selectedUsers.length === 0) return;

    const targetIds = selectedUsers.map((u) => u.id);
    const updatedUsers = users.map((u) =>
      targetIds.includes(u.id)
        ? {
            ...u,
            assignedRole: selectedRole,
          }
        : u,
    );

    saveManagedDesktopUsers(updatedUsers);
    toast.success(
      selectedUsers.length > 1
        ? tr(
            `Role "${selectedRole}" assigned to ${selectedUsers.length} users successfully.`,
            `${selectedUsers.length} ഉപയോക്താക്കൾക്ക് "${selectedRole}" റോൾ വിജയകരമായി നൽകി.`,
          )
        : tr(
            `Role "${selectedRole}" assigned to ${currentUser?.name} successfully.`,
            `ഉപയോക്താവ് ${currentUser?.name} ന് "${selectedRole}" റോൾ വിജയകരമായി നൽകി.`,
          ),
    );

    void navigate({ to: "/admin/settings", search: { tab: "users" } });
  };

  if (!currentUser) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        {tr("User not found.", "ഉപയോക്താവിനെ കണ്ടെത്തിയില്ല.")}
      </div>
    );
  }

  const userName = lang === "ml" ? currentUser.nameMl || currentUser.name : currentUser.name;
  const userDesignation = lang === "ml" ? currentUser.designationMl : currentUser.designationEn;

  const locationParts: string[] = [];
  const boothStr = getUserBooth(currentUser);
  if (boothStr) locationParts.push(boothStr);
  const mandalamStr = getUserMandalam(currentUser);
  if (mandalamStr) locationParts.push(mandalamStr);
  const districtStr = lang === "ml" ? currentUser.districtNameMl || currentUser.districtNameEn : currentUser.districtNameEn;
  if (districtStr) locationParts.push(districtStr);

  const fullLocationStr = locationParts.length > 0 ? locationParts.join(",") : "Booth 1,Kazhakkoottam,Thiruvanandapuram";

  const toggleAllPermissions = () => {
    if (isAllChecked) {
      setScopedPermissions([]);
    } else {
      setScopedPermissions([...allScopedPermissionKeysWithExtras]);
    }
  };

  const renderMatrixTable = (
    rows: MatrixRow[],
    columns: readonly MatrixColumn[],
    gridClass: string,
  ) => (
    <div className="overflow-x-auto rounded-lg border border-border/80 bg-white shadow-xs">
      <div className={cn("min-w-[700px] text-xs font-semibold", gridClass)}>
        <div className="border-b border-border/80 bg-slate-50/80 px-3 py-2 font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
          {tr("MODULES", "മൊഡ്യൂളുകൾ")}
        </div>

        {columns.map((column) => (
          <div
            key={column.id}
            className="border-b border-l border-border/80 bg-slate-50/80 px-3 py-2 text-center font-bold text-muted-foreground uppercase tracking-wider text-[11px]"
          >
            {tr(column.en, column.ml)}
          </div>
        ))}

        <div className="border-b border-l border-border/80 bg-slate-50/80 px-3 py-2 text-center font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
          {tr("DATA ACCESS LEVEL", "ഡാറ്റ ആക്സസ് ലെവൽ")}
        </div>

        {rows.map((row) => {
          const Icon = row.icon;
          const selectedScopes = scopesForModule(row.moduleId);

          return (
            <div key={row.key} className="contents border-b border-border/60 hover:bg-amber-50/20 transition-colors">
              <div className="flex items-center gap-2 border-t border-border/60 px-3 py-2 font-bold text-foreground">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <span>{tr(row.en, row.ml)}</span>
              </div>

              {columns.map((column) => {
                const disabled = isColumnDisabled(row, column.id);
                const checked = isColumnChecked(row, column.id);

                return (
                  <div
                    key={`${row.key}:${column.id}`}
                    className="flex items-center justify-center border-t border-l border-border/60 px-2 py-1.5"
                  >
                    {disabled ? (
                      <span className="text-muted-foreground/40 font-semibold">—</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleColumn(row, column.id)}
                        className={cn(
                          "h-5 w-5 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center select-none",
                          checked
                            ? "border-amber-500 bg-amber-500 text-white shadow-2xs"
                            : "border-amber-400/80 bg-white hover:border-amber-500 hover:bg-amber-50/50",
                        )}
                      >
                        {checked && <Check className="h-3 w-3 stroke-[3]" />}
                      </button>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-center border-t border-l border-border/60 px-2 py-1.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-7 w-full max-w-[200px] items-center justify-between rounded-full border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer shadow-2xs"
                    >
                      <span className="truncate">
                        {selectedScopes
                          .map((scopeId) => {
                            const found = dataAccessOptions.find((o) => o.id === scopeId);
                            return found ? tr(found.en, found.ml) : scopeId;
                          })
                          .join(", ")}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60 ml-1 text-slate-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72 p-2">
                    <p className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase">
                      {tr("Select Data Access Scope", "ഡാറ്റ ആക്സസ് ലെവൽ തിരഞ്ഞെടുക്കുക")}
                    </p>
                    <div className="space-y-1 pt-1">
                      {dataAccessOptions.map((option) => {
                        const scope = option.id as DataAccessScope;
                        const checked = isModuleScopeSelected(row.moduleId, scope);
                        return (
                          <div
                            key={option.id}
                            onClick={() => toggleModuleScope(row.moduleId, scope)}
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-md transition-colors cursor-pointer select-none",
                              checked
                                ? "bg-primary/10 text-primary font-bold"
                                : "hover:bg-muted/50 text-foreground",
                            )}
                          >
                            <Checkbox checked={checked} className="pointer-events-none" />
                            <span className="text-xs">
                              {lang === "ml" ? option.shortMl : option.shortEn}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full pb-10 text-foreground md:pb-28">
      {/* Top Header */}
      <section className="sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2">
        <div className="flex items-center justify-between gap-3 pb-1 sm:pb-0">
          <div className="flex items-center gap-3 sm:gap-2.5">
            <button
              type="button"
              onClick={() => void navigate({ to: "/admin/settings", search: { tab: undefined } })}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary group cursor-pointer"
              title={tr("Back to Users List", "ഉപയോക്താക്കളുടെ പട്ടികയിലേക്ക് തിരികെ")}
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div>
              <h1 className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground">
                {selectedUsers.length > 1
                  ? tr(
                      `Edit Role Permissions (${selectedUsers.length} Selected Users)`,
                      `റോൾ പെർമിഷനുകൾ തിരുത്തുക (${selectedUsers.length} ഉപയോക്താക്കൾ)`,
                    )
                  : tr(`Edit Role Permissions (${userName})`, `റോൾ പെർമിഷനുകൾ തിരുത്തുക (${userName})`)}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-3 sm:mt-4 space-y-4">
        {/* Merged User Info & Role Permissions Matrix Card */}
        <section className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xs space-y-3">
          {selectedUsers.length > 1 ? (
            <div className="border-b border-border/60 pb-2.5">
              <button
                type="button"
                onClick={() => setAccordionOpen(!accordionOpen)}
                className="flex w-full items-center justify-between gap-3 text-left cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex -space-x-2 overflow-hidden shrink-0">
                    {selectedUsers.slice(0, 3).map((u) => (
                      <img
                        key={u.id}
                        src={getUserAvatarUrl(u)}
                        alt={u.name}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                      />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-foreground">
                        {tr(
                          `${selectedUsers.length} Selected Users`,
                          `${selectedUsers.length} തിരഞ്ഞെടുക്കപ്പെട്ട ഉപയോക്താക്കൾ`,
                        )}
                      </h2>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                        {selectedUsers.length}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedUsers.map((u) => u.name).slice(0, 4).join(", ")}
                      {selectedUsers.length > 4 ? `, +${selectedUsers.length - 4} ${tr("more", "മറ്റുള്ളവർ")}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:underline shrink-0">
                  <span>{accordionOpen ? tr("Hide Selected Users", "മറയ്ക്കുക") : tr("Show Selected Users", "കാണുക")}</span>
                  {accordionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {/* Accordion Content (default closed) */}
              {accordionOpen && (
                <div className="mt-3 space-y-2 pt-2 border-t border-border/40 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {selectedUsers.map((user) => {
                    const des = lang === "ml" ? user.designationMl : user.designationEn;
                    const dist = lang === "ml" ? user.districtNameMl || user.districtNameEn : user.districtNameEn;
                    const constName = lang === "ml" ? user.constituencyMl || user.constituencyEn : user.constituencyEn;
                    const booth = getUserBooth(user);
                    const mandalam = getUserMandalam(user);
                    const loc = [booth, mandalam, constName, dist].filter(Boolean).join(", ");

                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-slate-50/60 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={getUserAvatarUrl(user)}
                            alt={user.name}
                            className="h-7 w-7 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">
                              {lang === "ml" ? user.nameMl || user.name : user.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {des} • {user.mobile} {loc ? `• ${loc}` : ""}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex shrink-0 items-center rounded-md border border-border bg-white px-2 py-0.5 text-[10px] font-bold text-foreground">
                          {user.assignedRole || "Admin"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-3">
                <img
                  src={getUserAvatarUrl(currentUser)}
                  alt={currentUser.name}
                  className="h-9 w-9 rounded-full object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">{userName}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userDesignation} • {currentUser.mobile} • {fullLocationStr}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/40 pb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {tr("Role Permissions", "റോൾ പെർമിഷനുകൾ")}
                </h2>
                {/* Role Selection Dropdown near Role Permissions */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-foreground shrink-0">
                    {tr("Assign Role:", "റോൾ തിരഞ്ഞെടുക്കുക:")}
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="h-8 rounded-lg border border-border bg-white px-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer shadow-2xs"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* All Toggle Checkbox */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAllPermissions}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer select-none",
                    isAllChecked
                      ? "border-amber-400 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "h-3.5 w-3.5 rounded border flex items-center justify-center",
                      isAllChecked ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300 bg-white",
                    )}
                  >
                    {isAllChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <span>{tr("All", "എല്ലാം")}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 pt-0.5">
              {renderMatrixTable(primaryMatrixRows, primaryMatrixColumns, "grid grid-cols-[1.5fr_repeat(4,1fr)_1.8fr]")}
              {renderMatrixTable(secondaryMatrixRows, secondaryMatrixColumns, "grid grid-cols-[1.5fr_repeat(3,1fr)_1.8fr]")}
            </div>
          </div>
        </section>

        {/* Bottom Bar */}
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
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void navigate({ to: "/admin/settings", search: { tab: undefined } })}
              className="shrink-0 md:h-10 md:rounded-lg md:border-border md:bg-white md:px-5 md:py-2 md:text-xs md:font-bold cursor-pointer"
            >
              {tr("Cancel", "റദ്ദാക്കുക")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="shrink-0 gap-2 md:h-10 md:rounded-lg md:bg-primary md:px-5 md:py-2 md:text-xs md:font-bold md:shadow-xs md:hover:bg-primary/90 cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              {tr("Save & Update", "സംരക്ഷിക്കുക & അപ്ഡേറ്റ് ചെയ്യുക")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
