import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Columns3,
  Copy,
  Download,
  Eye,
  Filter,
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
  SlidersHorizontal,
  Trash2,
  Upload,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import {
  getUserDesignation,
  getUserRegion,
  getUserOrgDistrict,
  getUserMandalam,
  getUserArea,
  getUserBooth,
  mockUsers,
  type AppUser,
} from "@/data/users";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export interface ManagedUser extends Omit<AppUser, "status"> {
  status: "Active" | "Verified" | "Pending" | "Inactive";
  assignedRole?: string;
  regionEn?: string;
  regionMl?: string;
  mandalamEn?: string;
  mandalamMl?: string;
  areaEn?: string;
  areaMl?: string;
  boothEn?: string;
  boothMl?: string;
}

export function getUserAvatarUrl(user: { name?: string; avatarUrl?: string }): string {
  if (user.avatarUrl && user.avatarUrl.trim() !== "" && !user.avatarUrl.includes("placeholder")) {
    return user.avatarUrl;
  }
  const name = (user.name || "").toLowerCase().trim();
  const firstName = name.split(" ")[0] || "";

  const femaleNames = [
    "neethu", "reshma", "nimisha", "sobha", "deepa", "anitha", "priya", "lakshmi",
    "anjana", "kavya", "aswathy", "divya", "sreedevi", "arya", "meera", "chithra",
    "aparna", "geetha", "sujatha", "remya", "radhika", "sunitha", "vidya", "kala",
    "maya", "saritha", "parvathy", "bhavana", "dhanya", "surabhi", "sangeetha",
    "manju", "sruthy", "vani", "sreeja", "sheeba", "preethi", "jisha", "mini",
    "bindu", "sini", "sindhu", "nisha", "soumya", "smitha", "veena", "ambika",
    "leela", "latha", "jayashree", "anjali", "devika", "malavika", "ananya",
    "gouri", "aadhya", "avanthika", "amrutha", "anamika", "gopika", "haritha",
    "aditi", "pooja", "aswini", "athira", "anju", "sona", "archana", "sujitha",
    "sandhya", "vijaya", "sreelekha", "sanitha", "sujani", "saranya", "anupama",
    "sreekutty", "akshara", "amala", "anugraha", "anupriya", "avani", "blessy",
    "cinimol", "deepthi", "drishya", "gisni", "greeshma", "jasmine", "jayasree",
    "jessi", "kripa", "lekha", "lini", "lipi", "mariya", "merin", "midhuna",
    "moly", "monisha", "mubeena", "nayana", "neena", "nikhila", "nima", "nimmy",
    "niranjana", "nithya", "raji", "rakhi", "ramya", "rani", "ranjini", "raveena",
    "riya", "roshni", "sadhana", "safna", "sajitha", "salini", "sameera", "sanmathi",
    "santhi", "sareena", "shahina", "shalu", "shameena", "shani", "sharanya",
    "sheetal", "shilpa", "shiny", "shirin", "shobhana", "srabani", "subha",
    "suchithra", "sudha", "sumi", "sumitha", "sunanda", "suramya", "swathi",
    "swetha", "vandana", "varsha", "vineetha", "vrinda", "fathima", "aisha",
    "mary", "ann", "anna", "sara", "sarah"
  ];

  const isFemale = femaleNames.some((f) => firstName.includes(f) || f.includes(firstName));

  return isFemale ? "/images/avatar-female.jpg" : "/images/avatar-male.jpg";
}

const MANAGED_USERS_KEY = "vk-managed-desktop-users";
const DESKTOP_ROLES = ["Admin", "Sub Admin", "Support Admin"];

export function loadManagedDesktopUsers(): ManagedUser[] {
  const sanitizeUsers = (list: (AppUser | ManagedUser)[]): ManagedUser[] => {
    return list
      .filter((u) => {
        const name = (u.name || "").toLowerCase();
        return (
          !name.includes("rajeev chandrasekhar") &&
          !name.includes("muraleedharan") &&
          !name.includes("suresh gopi") &&
          u.id !== "USR-BJP-007" &&
          u.id !== "USR-POL-002" &&
          u.id !== "USR-BJP-008"
        );
      })
      .map((u, index) => {
        const existingRole = (u as ManagedUser).assignedRole;
        const isUnassignedTarget = index === 2 || index === 5 || index === 7;
        let assignedRole = existingRole;
        if (isUnassignedTarget && (!existingRole || existingRole === "Support Admin" || existingRole === "Sub Admin" || existingRole === "Not Assigned")) {
          assignedRole = "Unassigned";
        } else if (!assignedRole || assignedRole === "Not Assigned") {
          assignedRole = isUnassignedTarget ? "Unassigned" : DESKTOP_ROLES[index % DESKTOP_ROLES.length];
        }
        const avatarUrl = getUserAvatarUrl(u);
        return {
          ...u,
          avatarUrl,
          status: u.status === "Inactive" ? "Inactive" : "Active",
          assignedRole,
        };
      });
  };

  if (typeof window === "undefined") return sanitizeUsers(mockUsers);
  try {
    const raw = localStorage.getItem(MANAGED_USERS_KEY);
    if (!raw) return sanitizeUsers(mockUsers);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return sanitizeUsers(parsed);
    }
    return sanitizeUsers(mockUsers);
  } catch {
    return sanitizeUsers(mockUsers);
  }
}

export function saveManagedDesktopUsers(users: ManagedUser[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(users));
  } catch {
    // best-effort
  }
}

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

export function RoleAccessSettings({ defaultTab = "roles" }: { defaultTab?: "roles" | "users" } = {}) {
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState<"roles" | "users">(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // User management state
  const [usersList, setUsersList] = useState<ManagedUser[]>(() => loadManagedDesktopUsers());
  const [userEditorOpen, setUserEditorOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [viewingUser, setViewingUser] = useState<ManagedUser | null>(null);
  const [userAssignTarget, setUserAssignTarget] = useState<ManagedUser | null>(null);
  const [selectedAssignedRole, setSelectedAssignedRole] = useState<string>("");

  const [userForm, setUserForm] = useState({
    name: "",
    designationEn: "",
    mobile: "",
    email: "",
    districtNameEn: "Thiruvananthapuram",
    assignedRole: "Admin",
    status: "Active" as "Active" | "Inactive",
  });

  const [selectedTableUserIds, setSelectedTableUserIds] = useState<string[]>([]);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkRoleSelected, setBulkRoleSelected] = useState("Sub Admin");

  const handleActionAssignRole = () => {
    if (selectedTableUserIds.length === 0) return;
    void navigate({
      to: "/admin/settings/assign-role",
      search: {
        userId: selectedTableUserIds[0],
        userIds: selectedTableUserIds.join(","),
      },
    });
  };

  const handleApplyBulkAssignRole = () => {
    if (!bulkRoleSelected) return;
    const updated = usersList.map((u) =>
      selectedTableUserIds.includes(u.id) ? { ...u, assignedRole: bulkRoleSelected } : u,
    );
    commitUsers(updated);
    toast.success(
      tr(
        `Assigned role "${bulkRoleSelected}" to ${selectedTableUserIds.length} user(s).`,
        `"${bulkRoleSelected}" റോൾ ${selectedTableUserIds.length} ഉപയോക്താക്കൾക്ക് നൽകി.`,
      ),
    );
    setBulkAssignOpen(false);
    setSelectedTableUserIds([]);
  };

  const handleBulkDeleteUsers = () => {
    const count = selectedTableUserIds.length;
    if (count === 0) return;
    const confirmed = window.confirm(
      lang === "ml"
        ? `തിരഞ്ഞെടുത്ത ${count} ഉപയോക്താക്കളെ നീക്കം ചെയ്യണോ?`
        : `Are you sure you want to delete ${count} selected user(s)?`,
    );
    if (!confirmed) return;
    commitUsers(usersList.filter((u) => !selectedTableUserIds.includes(u.id)));
    setSelectedTableUserIds([]);
    toast.success(
      tr(
        `${count} user(s) deleted successfully.`,
        `${count} ഉപയോക്താക്കൾ വിജയകരമായി നീക്കം ചെയ്തു.`,
      ),
    );
  };
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedLocalBodies, setSelectedLocalBodies] = useState<string[]>([]);
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedOrgDistricts, setSelectedOrgDistricts] = useState<string[]>([]);
  const [selectedMandalams, setSelectedMandalams] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedBooths, setSelectedBooths] = useState<string[]>([]);

  const toggleSelectAllUsers = () => {
    if (selectedTableUserIds.length === filteredUsers.length) {
      setSelectedTableUserIds([]);
    } else {
      setSelectedTableUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedTableUserIds.includes(id)) {
      setSelectedTableUserIds(selectedTableUserIds.filter((item) => item !== id));
    } else {
      setSelectedTableUserIds([...selectedTableUserIds, id]);
    }
  };

  const [visibleColumns, setVisibleColumns] = useState({
    user: true,
    role: true,
    localBody: true,
    orgDistrict: true,
    contact: true,
    status: true,
    actions: true,
  });

  const [visibleRoleColumns, setVisibleRoleColumns] = useState({
    role: true,
    description: true,
    users: true,
    status: true,
    actions: true,
  });

  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    usersList.forEach((u) => {
      const val = lang === "ml" ? u.districtNameMl || u.districtNameEn : u.districtNameEn;
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [usersList, lang]);

  const availableLocalBodies = useMemo(() => {
    const set = new Set<string>();
    usersList.forEach((u) => {
      const val =
        lang === "ml"
          ? u.constituencyMl || u.districtNameMl
          : u.constituencyEn || u.districtNameEn;
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [usersList, lang]);

  const availableDesignations = useMemo(() => {
    const set = new Set<string>();
    usersList.forEach((u) => set.add(getUserDesignation(u)));
    return Array.from(set).sort();
  }, [usersList]);

  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    usersList.forEach((u) => set.add(getUserRegion(u)));
    return Array.from(set).sort();
  }, [usersList]);

  const availableOrgDistricts = useMemo(() => {
    const set = new Set<string>();
    usersList.forEach((u) => set.add(getUserOrgDistrict(u)));
    return Array.from(set).sort();
  }, [usersList]);

  const availableMandalams = useMemo(() => {
    const set = new Set<string>();
    usersList.forEach((u) => set.add(getUserMandalam(u)));
    return Array.from(set).sort();
  }, [usersList]);

  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    usersList.forEach((u) => set.add(getUserArea(u)));
    return Array.from(set).sort();
  }, [usersList]);

  const availableBooths = useMemo(() => {
    const set = new Set<string>();
    usersList.forEach((u) => set.add(getUserBooth(u)));
    return Array.from(set).sort();
  }, [usersList]);

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

  const activeFilterCount =
    selectedRoles.length +
    selectedStatuses.length +
    selectedDistricts.length +
    selectedLocalBodies.length +
    selectedDesignations.length +
    selectedRegions.length +
    selectedOrgDistricts.length +
    selectedMandalams.length +
    selectedAreas.length +
    selectedBooths.length;

  const commitUsers = (next: ManagedUser[]) => {
    setUsersList(next);
    saveManagedDesktopUsers(next);
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const q = topSearchQuery.trim().toLowerCase();
      if (q) {
        const nameEn = (user.name || "").toLowerCase();
        const nameMl = (user.nameMl || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const desEn = (user.designationEn || "").toLowerCase();
        const distEn = (user.districtNameEn || "").toLowerCase();
        const roleName = (user.assignedRole || "").toLowerCase();
        const matchesQ =
          nameEn.includes(q) ||
          nameMl.includes(q) ||
          email.includes(q) ||
          desEn.includes(q) ||
          distEn.includes(q) ||
          roleName.includes(q);
        if (!matchesQ) return false;
      }

      if (selectedRoles.length > 0 && !selectedRoles.includes(user.assignedRole || "Admin")) {
        return false;
      }

      if (selectedStatuses.length > 0) {
        const isActive = user.status === "Active" || user.status === "Verified";
        const statusKey = isActive ? "active" : "inactive";
        if (!selectedStatuses.includes(statusKey)) return false;
      }

      if (selectedDistricts.length > 0) {
        const userDist =
          lang === "ml" ? user.districtNameMl || user.districtNameEn : user.districtNameEn;
        if (!selectedDistricts.includes(userDist || "")) return false;
      }

      if (selectedLocalBodies.length > 0) {
        const userLb =
          lang === "ml"
            ? user.constituencyMl || user.districtNameMl
            : user.constituencyEn || user.districtNameEn;
        if (!selectedLocalBodies.includes(userLb || "")) return false;
      }

      if (selectedDesignations.length > 0 && !selectedDesignations.includes(getUserDesignation(user))) {
        return false;
      }

      if (selectedRegions.length > 0 && !selectedRegions.includes(getUserRegion(user))) {
        return false;
      }

      if (selectedOrgDistricts.length > 0 && !selectedOrgDistricts.includes(getUserOrgDistrict(user))) {
        return false;
      }

      if (selectedMandalams.length > 0 && !selectedMandalams.includes(getUserMandalam(user))) {
        return false;
      }

      if (selectedAreas.length > 0 && !selectedAreas.includes(getUserArea(user))) {
        return false;
      }

      if (selectedBooths.length > 0 && !selectedBooths.includes(getUserBooth(user))) {
        return false;
      }

      return true;
    });
  }, [
    usersList,
    topSearchQuery,
    selectedRoles,
    selectedStatuses,
    selectedDistricts,
    selectedLocalBodies,
    selectedDesignations,
    selectedRegions,
    selectedOrgDistricts,
    selectedMandalams,
    selectedAreas,
    selectedBooths,
    lang,
  ]);

  const handleExportData = () => {
    if (activeTab === "roles") {
      const headers = "Role ID,Name,Description,Status,Assigned Users,Created At\n";
      const rows = pageRoles
        .map(
          (r) =>
            `"${r.id}","${r.name.replace(/"/g, '""')}","${(r.description || "").replace(/"/g, '""')}","${r.status}",${r.assignedUsers},"${r.createdAt}"`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "roles_export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(tr("Roles exported to CSV.", "റോളുകൾ CSV ആയി എക്സ്പോർട്ട് ചെയ്തു."));
    } else {
      const headers = "User ID,Name,Designation,Role,Local Body,District,Mobile,Status\n";
      const rows = filteredUsers
        .map(
          (u) =>
            `"${u.id}","${u.name.replace(/"/g, '""')}","${(u.designationEn || "").replace(/"/g, '""')}","${u.assignedRole || "Admin"}","${(u.constituencyEn || u.districtNameEn || "").replace(/"/g, '""')}","${(u.districtNameEn || "").replace(/"/g, '""')}","${u.mobile}","${u.status}"`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users_export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(tr("Users exported to CSV.", "ഉപയോക്താക്കൾ CSV ആയി എക്സ്പോർട്ട് ചെയ്തു."));
    }
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.json";
    input.onchange = () => {
      toast.success(
        tr(
          `${activeTab === "roles" ? "Roles" : "Users"} imported successfully.`,
          `${activeTab === "roles" ? "റോളുകൾ" : "ഉപയോക്താക്കൾ"} വിജയകരമായി ഇമ്പോർട്ട് ചെയ്തു.`
        )
      );
    };
    input.click();
  };

  const openCreateUser = () => {
    void navigate({ to: "/admin/settings/new-user", search: { editUserId: undefined } });
  };

  const openEditUser = (user: ManagedUser) => {
    void navigate({ to: "/admin/settings/new-user", search: { editUserId: user.id } });
  };

  const handleSaveUser = () => {
    if (!userForm.name.trim()) {
      toast.error(tr("User name is required.", "ഉപയോക്താവിന്റെ പേര് നിർബന്ധമാണ്."));
      return;
    }
    const now = new Date().toISOString().split("T")[0];
    if (editingUser) {
      const updated = usersList.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: userForm.name.trim(),
              designationEn: userForm.designationEn.trim(),
              mobile: userForm.mobile.trim(),
              email: userForm.email.trim(),
              districtNameEn: userForm.districtNameEn,
              assignedRole: userForm.assignedRole,
              status: userForm.status,
            }
          : u,
      );
      commitUsers(updated);
      toast.success(tr("User updated successfully.", "ഉപയോക്താവ് വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു."));
    } else {
      const newUser: ManagedUser = {
        id: `USR-${Date.now()}`,
        name: userForm.name.trim(),
        nameMl: userForm.name.trim(),
        category: "bjp_member",
        categoryLabelEn: "BJP Member",
        categoryLabelMl: "ബി.ജെ.പി അംഗം",
        designationEn: userForm.designationEn.trim() || "Party Member",
        designationMl: userForm.designationEn.trim() || "പാർട്ടി അംഗം",
        mobile: userForm.mobile.trim() || "9447000000",
        email: userForm.email.trim() || "user@bjpkerala.org",
        districtId: "tvm",
        districtNameEn: userForm.districtNameEn,
        districtNameMl: userForm.districtNameEn,
        constituencyEn: userForm.districtNameEn,
        constituencyMl: userForm.districtNameEn,
        status: userForm.status,
        joinedDate: now,
        assignedRole: userForm.assignedRole,
      };
      commitUsers([newUser, ...usersList]);
      toast.success(tr("User created successfully.", "ഉപയോക്താവിനെ വിജയകരമായി സൃഷ്ടിച്ചു."));
    }
    setUserEditorOpen(false);
  };

  const handleDeleteUser = (user: ManagedUser) => {
    const confirmed = window.confirm(
      lang === "ml"
        ? `"${user.name}" എന്ന ഉപയോക്താവിനെ നീക്കം ചെയ്യണോ?`
        : `Are you sure you want to delete user "${user.name}"?`,
    );
    if (!confirmed) return;
    commitUsers(usersList.filter((u) => u.id !== user.id));
    toast.success(tr("User deleted successfully.", "ഉപയോക്താവ് വിജയകരമായി നീക്കം ചെയ്തു."));
  };

  const handleToggleUserStatus = (user: ManagedUser) => {
    const nextStatus: "Active" | "Inactive" = user.status === "Active" || user.status === "Verified" ? "Inactive" : "Active";
    const updated: ManagedUser[] = usersList.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u));
    commitUsers(updated);
    toast.success(
      nextStatus === "Inactive"
        ? tr("User status set to Inactive.", "ഉപയോക്താവ് നിർജ്ജീവമാക്കി.")
        : tr("User status set to Active.", "ഉപയോക്താവ് വീണ്ടും സജീവമാക്കി."),
    );
  };

  const handleAssignUserRole = (user: ManagedUser, roleName: string) => {
    const updated: ManagedUser[] = usersList.map((u) => (u.id === user.id ? { ...u, assignedRole: roleName } : u));
    commitUsers(updated);
    toast.success(
      tr(
        `Assigned role "${roleName}" to ${user.name}.`,
        `"${roleName}" റോൾ ${user.name}-ന് നൽകി.`,
      ),
    );
    setUserAssignTarget(null);
  };

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
    void navigate({
      to: "/admin/settings/new-role",
      search: { editRoleId: role.id },
    });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 px-4 py-2.5 sm:px-5">
          <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-muted/20 p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer",
                activeTab === "roles"
                  ? "bg-primary/10 text-primary font-extrabold shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {tr(`Roles (${pageRoles.length})`, `റോളുകൾ (${pageRoles.length})`)}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer",
                activeTab === "users"
                  ? "bg-primary/10 text-primary font-extrabold shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {tr(`Users (${usersList.length})`, `ഉപയോക്താക്കൾ (${usersList.length})`)}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{tr("Export", "എക്സ്പോർട്ട്")}</span>
            </button>

            <button
              type="button"
              onClick={handleImportData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{tr("Import", "ഇമ്പോർട്ട്")}</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  title={tr("Column Settings", "കോളം സെറ്റിംഗ്സ്")}
                  aria-label={tr("Column Settings", "കോളം സെറ്റിംഗ്സ്")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <Columns3 className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-2 text-xs">
                <p className="px-2 py-1 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                  {tr("Hide / Show Columns", "കോളങ്ങൾ ഒളിപ്പിക്കുക / കാണിക്കുക")}
                </p>
                <DropdownMenuSeparator />
                {activeTab === "users" ? (
                  <div className="space-y-1 py-1">
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleColumns.user}
                        onCheckedChange={(c) =>
                          setVisibleColumns((prev) => ({ ...prev, user: Boolean(c) }))
                        }
                      />
                      <span>{tr("User", "ഉപയോക്താവ്")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleColumns.role}
                        onCheckedChange={(c) =>
                          setVisibleColumns((prev) => ({ ...prev, role: Boolean(c) }))
                        }
                      />
                      <span>{tr("Role", "റോൾ")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleColumns.localBody}
                        onCheckedChange={(c) =>
                          setVisibleColumns((prev) => ({ ...prev, localBody: Boolean(c) }))
                        }
                      />
                      <span>{tr("Local Body", "തദ്ദേശ സ്ഥാപനം")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleColumns.orgDistrict}
                        onCheckedChange={(c) =>
                          setVisibleColumns((prev) => ({ ...prev, orgDistrict: Boolean(c) }))
                        }
                      />
                      <span>{tr("Organisational District", "സംഘടനാ ജില്ല")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleColumns.contact}
                        onCheckedChange={(c) =>
                          setVisibleColumns((prev) => ({ ...prev, contact: Boolean(c) }))
                        }
                      />
                      <span>{tr("Contact", "ബന്ധപ്പെടുക")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleColumns.status}
                        onCheckedChange={(c) =>
                          setVisibleColumns((prev) => ({ ...prev, status: Boolean(c) }))
                        }
                      />
                      <span>{tr("Status", "സ്റ്റാറ്റസ്")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleColumns.actions}
                        onCheckedChange={(c) =>
                          setVisibleColumns((prev) => ({ ...prev, actions: Boolean(c) }))
                        }
                      />
                      <span>{tr("Actions", "നടപടികൾ")}</span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-1 py-1">
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleRoleColumns.role}
                        onCheckedChange={(c) =>
                          setVisibleRoleColumns((prev) => ({ ...prev, role: Boolean(c) }))
                        }
                      />
                      <span>{tr("Role Name", "റോൾ പേര്")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleRoleColumns.description}
                        onCheckedChange={(c) =>
                          setVisibleRoleColumns((prev) => ({ ...prev, description: Boolean(c) }))
                        }
                      />
                      <span>{tr("Description", "വിവരണം")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleRoleColumns.users}
                        onCheckedChange={(c) =>
                          setVisibleRoleColumns((prev) => ({ ...prev, users: Boolean(c) }))
                        }
                      />
                      <span>{tr("Users Count", "ഉപയോക്താക്കളുടെ എണ്ണം")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleRoleColumns.status}
                        onCheckedChange={(c) =>
                          setVisibleRoleColumns((prev) => ({ ...prev, status: Boolean(c) }))
                        }
                      />
                      <span>{tr("Status", "സ്റ്റാറ്റസ്")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 font-medium hover:bg-muted/50 rounded-md cursor-pointer select-none">
                      <Checkbox
                        checked={visibleRoleColumns.actions}
                        onCheckedChange={(c) =>
                          setVisibleRoleColumns((prev) => ({ ...prev, actions: Boolean(c) }))
                        }
                      />
                      <span>{tr("Actions", "നടപടികൾ")}</span>
                    </label>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {activeTab === "users" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                      activeFilterCount > 0
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{tr("Filter", "ഫിൽട്ടർ")}</span>
                    {activeFilterCount > 0 && (
                      <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-3 text-xs space-y-3 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border">
                    <span className="font-bold text-foreground text-xs">{tr("Filter Users", "ഉപയോക്താക്കളെ ഫിൽട്ടർ ചെയ്യുക")}</span>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRoles([]);
                          setSelectedStatuses([]);
                          setSelectedDistricts([]);
                          setSelectedLocalBodies([]);
                          setSelectedDesignations([]);
                          setSelectedRegions([]);
                          setSelectedOrgDistricts([]);
                          setSelectedMandalams([]);
                          setSelectedAreas([]);
                          setSelectedBooths([]);
                        }}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {tr("Reset All", "എല്ലാം റീസെറ്റ് ചെയ്യുക")}
                      </button>
                    )}
                  </div>

                  {/* Designation Filter Dropdown */}
                  <FilterDropdownSelector
                    title={tr("DESIGNATION", "തസ്തിക")}
                    placeholder={tr("Select Designation", "തസ്തിക തിരഞ്ഞെടുക്കുക")}
                    options={availableDesignations}
                    selectedValues={selectedDesignations}
                    onChange={setSelectedDesignations}
                    tr={tr}
                  />

                  {/* Region Filter Dropdown */}
                  <FilterDropdownSelector
                    title={tr("REGION", "മേഖല")}
                    placeholder={tr("Select Region", "മേഖല തിരഞ്ഞെടുക്കുക")}
                    options={availableRegions}
                    selectedValues={selectedRegions}
                    onChange={setSelectedRegions}
                    tr={tr}
                  />

                  {/* Org District Filter Dropdown */}
                  <FilterDropdownSelector
                    title={tr("ORG DISTRICT", "സംഘടനാ ജില്ല")}
                    placeholder={tr("Select Org District", "സംഘടനാ ജില്ല തിരഞ്ഞെടുക്കുക")}
                    options={availableOrgDistricts}
                    selectedValues={selectedOrgDistricts}
                    onChange={setSelectedOrgDistricts}
                    tr={tr}
                  />

                  {/* Mandalam Filter Dropdown */}
                  <FilterDropdownSelector
                    title={tr("MANDALAM", "മണ്ഡലം")}
                    placeholder={tr("Select Mandalam", "മണ്ഡലം തിരഞ്ഞെടുക്കുക")}
                    options={availableMandalams}
                    selectedValues={selectedMandalams}
                    onChange={setSelectedMandalams}
                    tr={tr}
                  />

                  {/* Area Filter Dropdown */}
                  <FilterDropdownSelector
                    title={tr("AREA", "ഏരിയ")}
                    placeholder={tr("Select Area", "ഏരിയ തിരഞ്ഞെടുക്കുക")}
                    options={availableAreas}
                    selectedValues={selectedAreas}
                    onChange={setSelectedAreas}
                    tr={tr}
                  />

                  {/* Booth Filter Dropdown */}
                  <FilterDropdownSelector
                    title={tr("BOOTH", "ബൂത്ത്")}
                    placeholder={tr("Select Booth", "ബൂത്ത് തിരഞ്ഞെടുക്കുക")}
                    options={availableBooths}
                    selectedValues={selectedBooths}
                    onChange={setSelectedBooths}
                    tr={tr}
                  />

                  {/* Role Filter Dropdown */}
                  <FilterDropdownSelector
                    title={tr("Roles", "റോളുകൾ")}
                    placeholder={tr("Select Roles", "റോളുകൾ തിരഞ്ഞെടുക്കുക")}
                    options={DESKTOP_ROLES}
                    selectedValues={selectedRoles}
                    onChange={setSelectedRoles}
                    tr={tr}
                  />

                  {/* Status Filter Dropdown */}
                  <FilterDropdownSelector
                    title={tr("Status", "സ്റ്റാറ്റസ്")}
                    placeholder={tr("Select Status", "സ്റ്റാറ്റസ് തിരഞ്ഞെടുക്കുക")}
                    options={["Active", "Inactive"]}
                    selectedValues={selectedStatuses.map((s) => (s === "active" ? "Active" : s === "inactive" ? "Inactive" : s))}
                    onChange={(vals) =>
                      setSelectedStatuses(vals.map((v) => (v === "Active" ? "active" : v === "Inactive" ? "inactive" : v)))
                    }
                    tr={tr}
                  />

                  {/* District Filter Dropdown */}
                  <FilterDropdownSelector
                    title={tr("District", "ജില്ല")}
                    placeholder={tr("Select District", "ജില്ല തിരഞ്ഞെടുക്കുക")}
                    options={availableDistricts}
                    selectedValues={selectedDistricts}
                    onChange={setSelectedDistricts}
                    tr={tr}
                  />

                  {/* Local Body Filter Dropdown */}
                  <FilterDropdownSelector
                    title={tr("Local Body", "തദ്ദേശ സ്ഥാപനം")}
                    placeholder={tr("Select Local Body", "തദ്ദേശ സ്ഥാപനം തിരഞ്ഞെടുക്കുക")}
                    options={availableLocalBodies}
                    selectedValues={selectedLocalBodies}
                    onChange={setSelectedLocalBodies}
                    tr={tr}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {activeTab === "roles" ? (
              <Link
                to="/admin/settings/new-role"
                search={{ editRoleId: undefined }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold leading-tight text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                {tr("Create New Role", "പുതിയ റോൾ സൃഷ്ടിക്കുക")}
              </Link>
            ) : (
              <button
                type="button"
                onClick={openCreateUser}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold leading-tight text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                {tr("Create User", "ഉപയോക്താവിനെ ചേർക്കുക")}
              </button>
            )}
          </div>
        </div>

        {activeTab === "users" && selectedTableUserIds.length > 0 && (
          <div className="flex items-center justify-between border-y border-border/80 bg-primary/5 px-4 py-2.5 transition-all">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground">
                {tr(
                  `${selectedTableUserIds.length} of ${filteredUsers.length} selected`,
                  `${selectedTableUserIds.length} / ${filteredUsers.length} തിരഞ്ഞെടുത്തു`,
                )}
              </span>
              <button
                type="button"
                onClick={() => setSelectedTableUserIds([])}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                {tr("Deselect All", "എല്ലാം ഒഴിവാക്കുക")}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleActionAssignRole}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer transition-colors shadow-2xs"
              >
                <UserPlus className="h-3.5 w-3.5 text-primary" />
                <span>{tr("Assign Role", "റോൾ നൽകുക")}</span>
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white font-extrabold">
                  {selectedTableUserIds.length}
                </span>
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteUsers}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 cursor-pointer transition-colors shadow-2xs"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                <span>{tr("Delete", "ഡിലീറ്റ് ചെയ്യുക")}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "roles" ? (
          <div className="overflow-x-auto desktop-hide-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                <tr>
                  {visibleRoleColumns.role && <th className="p-3">{tr("ROLE", "റോൾ")}</th>}
                  {visibleRoleColumns.description && <th className="p-3">{tr("DESCRIPTION", "വിവരണം")}</th>}
                  {visibleRoleColumns.users && <th className="p-3 text-right">{tr("USERS", "ഉപയോക്താക്കൾ")}</th>}
                  {visibleRoleColumns.status && <th className="p-3">{tr("STATUS", "സ്റ്റാറ്റസ്")}</th>}
                  {visibleRoleColumns.actions && <th className="p-3 text-right">{tr("ACTIONS", "നടപടികൾ")}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {displayedRoles.map((role) => (
                  <tr key={role.id} className="transition-colors hover:bg-muted/40">
                    {visibleRoleColumns.role && (
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
                    )}
                    {visibleRoleColumns.description && (
                      <td className="max-w-md p-3 text-muted-foreground">{role.description || "—"}</td>
                    )}
                    {visibleRoleColumns.users && (
                      <td className="whitespace-nowrap p-3 text-right font-mono text-foreground">
                        {role.assignedUsers.toLocaleString("en-IN")}
                      </td>
                    )}
                    {visibleRoleColumns.status && (
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
                    )}
                    {visibleRoleColumns.actions && (
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto desktop-hide-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                <tr>
                  <th className="p-3 w-10">
                    <Checkbox
                      checked={filteredUsers.length > 0 && selectedTableUserIds.length === filteredUsers.length}
                      onCheckedChange={toggleSelectAllUsers}
                    />
                  </th>
                  {visibleColumns.user && <th className="p-3">{tr("USER", "ഉപയോക്താവ്")}</th>}
                  {visibleColumns.role && <th className="p-3">{tr("ROLE", "റോൾ")}</th>}
                  {visibleColumns.localBody && (
                    <th className="p-3">{tr("AREA", "ഏരിയ")}</th>
                  )}
                  {visibleColumns.orgDistrict && (
                    <th className="p-3">{tr("ORGANISATIONAL DISTRICT", "സംഘടനാ ജില്ല")}</th>
                  )}
                  {visibleColumns.contact && <th className="p-3">{tr("CONTACT", "ബന്ധപ്പെടുക")}</th>}
                  {visibleColumns.status && <th className="p-3">{tr("STATUS", "സ്റ്റാറ്റസ്")}</th>}
                  {visibleColumns.actions && (
                    <th className="p-3 text-right">{tr("ACTIONS", "നടപടികൾ")}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={cn(
                      "transition-colors hover:bg-muted/40",
                      selectedTableUserIds.includes(user.id) && "bg-primary/5",
                    )}
                  >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedTableUserIds.includes(user.id)}
                          onCheckedChange={() => toggleSelectUser(user.id)}
                        />
                      </td>
                      {visibleColumns.user && (
                        <td
                          className="p-3 cursor-pointer group"
                          onClick={() =>
                            void navigate({
                              to: "/admin/settings/user-details",
                              search: { userId: user.id },
                            })
                          }
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={getUserAvatarUrl(user)}
                              alt={user.name}
                              className="h-8 w-8 rounded-full object-cover shrink-0 border border-border/40 group-hover:border-primary/50 transition-colors"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {lang === "ml" ? user.nameMl || user.name : user.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {lang === "ml" ? user.designationMl : user.designationEn}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.role && (
                        <td className="p-3 whitespace-nowrap">
                          {user.assignedRole && user.assignedRole !== "Unassigned" && user.assignedRole !== "Not Assigned" ? (
                            <span className="inline-flex items-center rounded-md border border-border/80 bg-background px-2.5 py-0.5 text-[11px] font-semibold text-foreground shadow-2xs">
                              {user.assignedRole}
                            </span>
                          ) : (
                            <span className="text-foreground font-semibold text-xs px-2">
                              _
                            </span>
                          )}
                        </td>
                      )}
                      {visibleColumns.localBody && (
                        <td className="p-3 text-foreground whitespace-nowrap font-medium">
                          {getUserArea(user)}
                        </td>
                      )}
                      {visibleColumns.orgDistrict && (
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {getUserOrgDistrict(user)}
                        </td>
                      )}
                      {visibleColumns.contact && (
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          <p className="font-mono text-foreground">{user.mobile}</p>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold",
                              user.status === "Active" || user.status === "Verified"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                                : "border-rose-500/20 bg-rose-500/10 text-rose-600",
                            )}
                          >
                            {user.status === "Active" || user.status === "Verified"
                              ? tr("Active", "സജീവം")
                              : tr("Inactive", "നിർജ്ജീവം")}
                          </span>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditUser(user)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              {tr("Edit", "തിരുത്തുക")}
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  aria-label={tr("More actions", "കൂടുതൽ നടപടികൾ")}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary cursor-pointer"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() =>
                                    void navigate({
                                      to: "/admin/settings/user-details",
                                      search: { userId: user.id },
                                    })
                                  }
                                  className="cursor-pointer gap-2 text-xs font-medium"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  {tr("View", "കാണുക")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    void navigate({
                                      to: "/admin/settings/assign-role",
                                      search: { userId: user.id },
                                    })
                                  }
                                  className="cursor-pointer gap-2 text-xs font-medium"
                                >
                                  <UserPlus className="h-3.5 w-3.5 text-primary" />
                                  {tr("Assign Role", "റോൾ നൽകുക")}
                                </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleUserStatus(user)}
                              className="cursor-pointer gap-2 text-xs font-medium"
                            >
                              <Power className="h-3.5 w-3.5 text-amber-600" />
                              {user.status === "Active" || user.status === "Verified"
                                ? tr("Deactivate", "നിർജ്ജീവമാക്കുക")
                                : tr("Activate", "സജീവമാക്കുക")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="cursor-pointer gap-2 text-xs font-medium text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {tr("Delete", "ഡിലീറ്റ് ചെയ്യുക")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
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

      {/* Create / Edit User Dialog */}
      <Dialog open={userEditorOpen} onOpenChange={setUserEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser
                ? tr("Edit User", "ഉപയോക്താവിനെ തിരുത്തുക")
                : tr("Create New User", "പുതിയ ഉപയോക്താവിനെ ചേർക്കുക")}
            </DialogTitle>
            <DialogDescription>
              {tr(
                "Fill in the details for the user account below.",
                "താഴെ നൽകിയിരിക്കുന്ന ഉപയോക്തൃ വിവരങ്ങൾ പൂരിപ്പിക്കുക.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="block font-bold text-foreground mb-1">
                {tr("Full Name", "പൂർണ്ണ നാമം")} *
              </label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-foreground mb-1">
                {tr("Designation", "പദവി")}
              </label>
              <input
                type="text"
                value={userForm.designationEn}
                onChange={(e) => setUserForm({ ...userForm, designationEn: e.target.value })}
                placeholder="e.g. District Coordinator"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  {tr("Mobile", "മൊബൈൽ")}
                </label>
                <input
                  type="text"
                  value={userForm.mobile}
                  onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                  placeholder="9447000000"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">
                  {tr("Email", "ഇമെയിൽ")}
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  {tr("Assigned Role", "നൽകിയ റോൾ")}
                </label>
                <select
                  value={userForm.assignedRole}
                  onChange={(e) => setUserForm({ ...userForm, assignedRole: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                >
                  <option value="Admin">Admin</option>
                  <option value="Sub Admin">Sub Admin</option>
                  <option value="Support Admin">Support Admin</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">
                  {tr("Status", "സ്റ്റാറ്റസ്")}
                </label>
                <select
                  value={userForm.status}
                  onChange={(e) =>
                    setUserForm({ ...userForm, status: e.target.value as "Active" | "Inactive" })
                  }
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                >
                  <option value="Active">Active (സജീവം)</option>
                  <option value="Inactive">Inactive (നിർജ്ജീവം)</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setUserEditorOpen(false)}>
              {tr("Cancel", "റദ്ദാക്കുക")}
            </Button>
            <Button size="sm" onClick={handleSaveUser}>
              {editingUser ? tr("Save Changes", "സേവ് ചെയ്യുക") : tr("Create User", "സൃഷ്ടിക്കുക")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={Boolean(viewingUser)} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tr("User Details", "ഉപയോക്തൃ വിവരങ്ങൾ")}</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-3 py-2 text-xs">
              <div className="flex items-center gap-3">
                {viewingUser.avatarUrl ? (
                  <img
                    src={viewingUser.avatarUrl}
                    alt={viewingUser.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-extrabold text-base">
                    {viewingUser.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-foreground">{viewingUser.name}</h3>
                  <p className="text-muted-foreground">{viewingUser.designationEn}</p>
                  <span className="inline-flex items-center mt-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {viewingUser.assignedRole || "Admin"}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-border/60 rounded-xl border border-border bg-muted/20 p-3 space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{tr("Mobile", "മൊബൈൽ")}</span>
                  <span className="font-bold font-mono">{viewingUser.mobile}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{tr("Local Body", "തദ്ദേശ സ്ഥാപനം")}</span>
                  <span className="font-bold">{viewingUser.constituencyEn || viewingUser.districtNameEn}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{tr("Organisational District", "സംഘടനാ ജില്ല")}</span>
                  <span className="font-bold">{viewingUser.districtNameEn}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{tr("Status", "സ്റ്റാറ്റസ്")}</span>
                  <span className="font-bold text-emerald-600">{viewingUser.status}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewingUser(null)}>
              {tr("Close", "അടയ്ക്കുക")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role to User Dialog */}
      <Dialog
        open={Boolean(userAssignTarget)}
        onOpenChange={(open) => !open && setUserAssignTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{tr("Assign Role", "റോൾ നൽകുക")}</DialogTitle>
            <DialogDescription>
              {userAssignTarget &&
                tr(
                  `Select a role to assign to ${userAssignTarget.name}.`,
                  `${userAssignTarget.name}-ന് നൽകേണ്ട റോൾ തിരഞ്ഞെടുക്കുക.`,
                )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2 text-xs">
            <label className="block font-bold text-foreground">
              {tr("Select Role", "റോൾ തിരഞ്ഞെടുക്കുക")}
            </label>
            <select
              value={selectedAssignedRole}
              onChange={(e) => setSelectedAssignedRole(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="Admin">Admin</option>
              <option value="Sub Admin">Sub Admin</option>
              <option value="Support Admin">Support Admin</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setUserAssignTarget(null)}>
              {tr("Cancel", "റദ്ദാക്കുക")}
            </Button>
            <Button
              size="sm"
              onClick={() =>
                userAssignTarget && handleAssignUserRole(userAssignTarget, selectedAssignedRole)
              }
            >
              {tr("Assign Role", "അസൈൻ ചെയ്യുക")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Assign Role Dialog */}
      <Dialog open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {tr("Assign Role to Selected Users", "തിരഞ്ഞെടുത്ത ഉപയോക്താക്കൾക്ക് റോൾ നൽകുക")}
            </DialogTitle>
            <DialogDescription>
              {tr(
                `Select a role to assign to ${selectedTableUserIds.length} selected user(s).`,
                `തിരഞ്ഞെടുത്ത ${selectedTableUserIds.length} ഉപയോക്താക്കൾക്കായി റോൾ തിരഞ്ഞെടുക്കുക.`,
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 text-xs space-y-3">
            <div>
              <label className="block font-bold text-foreground mb-1">
                {tr("Select Role", "റോൾ തിരഞ്ഞെടുക്കുക")}
              </label>
              <select
                value={bulkRoleSelected}
                onChange={(e) => setBulkRoleSelected(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
              >
                <option value="Admin">Admin</option>
                <option value="Sub Admin">Sub Admin</option>
                <option value="Support Admin">Support Admin</option>
                <option value="Other Role">Other Role</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkAssignOpen(false)}
            >
              {tr("Cancel", "റദ്ദാക്കുക")}
            </Button>
            <Button
              type="button"
              onClick={handleApplyBulkAssignRole}
              className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              {tr("Apply Role", "റോൾ നൽകുക")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  const [desktopUsers, setDesktopUsers] = useState<ManagedUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedOrgDistricts, setSelectedOrgDistricts] = useState<string[]>([]);
  const [selectedMandalams, setSelectedMandalams] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedBooths, setSelectedBooths] = useState<string[]>([]);

  const availDesignations = useMemo(() => {
    const set = new Set<string>();
    desktopUsers.forEach((u) => set.add(getUserDesignation(u)));
    return Array.from(set).sort();
  }, [desktopUsers]);

  const availRegions = useMemo(() => {
    const set = new Set<string>();
    desktopUsers.forEach((u) => set.add(getUserRegion(u)));
    return Array.from(set).sort();
  }, [desktopUsers]);

  const availOrgDistricts = useMemo(() => {
    const set = new Set<string>();
    desktopUsers.forEach((u) => set.add(getUserOrgDistrict(u)));
    return Array.from(set).sort();
  }, [desktopUsers]);

  const availMandalams = useMemo(() => {
    const set = new Set<string>();
    desktopUsers.forEach((u) => set.add(getUserMandalam(u)));
    return Array.from(set).sort();
  }, [desktopUsers]);

  const availAreas = useMemo(() => {
    const set = new Set<string>();
    desktopUsers.forEach((u) => set.add(getUserArea(u)));
    return Array.from(set).sort();
  }, [desktopUsers]);

  const availBooths = useMemo(() => {
    const set = new Set<string>();
    desktopUsers.forEach((u) => set.add(getUserBooth(u)));
    return Array.from(set).sort();
  }, [desktopUsers]);

  const drawerActiveFilterCount =
    selectedDesignations.length +
    selectedRegions.length +
    selectedOrgDistricts.length +
    selectedMandalams.length +
    selectedAreas.length +
    selectedBooths.length;

  useEffect(() => {
    if (role) {
      const users = loadManagedDesktopUsers();
      setDesktopUsers(users);

      const currentRoleName =
        role.id === rolesPageAdminRoleId
          ? "Admin"
          : role.id === rolesPageSubAdminRoleId
          ? "Sub Admin"
          : role.id === supportAdminRoleId
          ? "Support Admin"
          : role.name;

      const preSelected = users
        .filter((u) => u.assignedRole?.toLowerCase() === currentRoleName.toLowerCase())
        .map((u) => u.id);

      if (preSelected.length > 0) {
        setSelectedUserIds(preSelected);
      } else {
        setSelectedUserIds(users.slice(0, Math.min(role.assignedUsers, users.length)).map((u) => u.id));
      }
    }
  }, [role]);

  if (!role) return null;

  const roleDisplayName =
    role.id === rolesPageAdminRoleId
      ? "Admin"
      : role.id === rolesPageSubAdminRoleId
      ? "Sub Admin"
      : role.id === supportAdminRoleId
      ? "Support Admin"
      : role.name;

  const filteredUsers = desktopUsers.filter((u) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const matchesQ =
        u.name.toLowerCase().includes(q) ||
        (u.nameMl && u.nameMl.includes(q)) ||
        u.designationEn.toLowerCase().includes(q) ||
        (u.designationMl && u.designationMl.toLowerCase().includes(q)) ||
        (u.constituencyEn && u.constituencyEn.toLowerCase().includes(q)) ||
        (u.districtNameEn && u.districtNameEn.toLowerCase().includes(q));
      if (!matchesQ) return false;
    }

    if (selectedDesignations.length > 0 && !selectedDesignations.includes(getUserDesignation(u))) return false;
    if (selectedRegions.length > 0 && !selectedRegions.includes(getUserRegion(u))) return false;
    if (selectedOrgDistricts.length > 0 && !selectedOrgDistricts.includes(getUserOrgDistrict(u))) return false;
    if (selectedMandalams.length > 0 && !selectedMandalams.includes(getUserMandalam(u))) return false;
    if (selectedAreas.length > 0 && !selectedAreas.includes(getUserArea(u))) return false;
    if (selectedBooths.length > 0 && !selectedBooths.includes(getUserBooth(u))) return false;

    return true;
  });

  const allFilteredSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedUserIds.includes(u.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredUsers.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const merged = new Set([...selectedUserIds, ...filteredUsers.map((u) => u.id)]);
      setSelectedUserIds(Array.from(merged));
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveAssignment = () => {
    const allUsers = loadManagedDesktopUsers();
    const updatedUsers = allUsers.map((u) => {
      if (selectedUserIds.includes(u.id)) {
        return { ...u, assignedRole: roleDisplayName };
      }
      return u;
    });
    saveManagedDesktopUsers(updatedUsers);
    onSave(selectedUserIds.length);
    onClose();
  };

  return (
    <Sheet open={Boolean(role)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full p-0 gap-0 bg-white">
        <SheetHeader className="p-5 border-b border-border bg-white text-left space-y-1">
          <SheetTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>
              {tr(
                `Assign Users to "${roleDisplayName}"`,
                `"${roleDisplayName}" റോളിലേക്ക് ഉപയോക്താക്കളെ അസൈൻ ചെയ്യുക`,
              )}
            </span>
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {tr(
              "Select desktop users to assign this role. Multi-selection enabled.",
              "ഈ റോൾ നൽകാനായി ഉപയോക്താക്കളെ തിരഞ്ഞെടുക്കുക (ഒന്നിലധികം പേരെ തിരഞ്ഞെടുക്കാം).",
            )}
          </SheetDescription>

          <div className="relative mt-3 flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr(
                  "Search users by name or designation...",
                  "പേരിലോ തസ്തികയിലോ തിരയുക...",
                )}
                className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer",
                    drawerActiveFilterCount > 0
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{tr("Filter", "ഫിൽട്ടർ")}</span>
                  {drawerActiveFilterCount > 0 && (
                    <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {drawerActiveFilterCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-3 text-xs space-y-3 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between pb-1.5 border-b border-border">
                  <span className="font-bold text-foreground text-xs">{tr("Filter Users", "ഉപയോക്താക്കളെ ഫിൽട്ടർ ചെയ്യുക")}</span>
                  {drawerActiveFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDesignations([]);
                        setSelectedRegions([]);
                        setSelectedOrgDistricts([]);
                        setSelectedMandalams([]);
                        setSelectedAreas([]);
                        setSelectedBooths([]);
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {tr("Reset All", "റീസെറ്റ് ചെയ്യുക")}
                    </button>
                  )}
                </div>

                {/* Designation Filter Dropdown */}
                <FilterDropdownSelector
                  title={tr("Designation", "തസ്തിക")}
                  placeholder={tr("Select Designation", "തസ്തിക തിരഞ്ഞെടുക്കുക")}
                  options={availDesignations}
                  selectedValues={selectedDesignations}
                  onChange={setSelectedDesignations}
                  tr={tr}
                />

                {/* Region Filter Dropdown */}
                <FilterDropdownSelector
                  title={tr("Region", "മേഖല")}
                  placeholder={tr("Select Region", "മേഖല തിരഞ്ഞെടുക്കുക")}
                  options={availRegions}
                  selectedValues={selectedRegions}
                  onChange={setSelectedRegions}
                  tr={tr}
                />

                {/* Org District Filter Dropdown */}
                <FilterDropdownSelector
                  title={tr("Org District", "സംഘടനാ ജില്ല")}
                  placeholder={tr("Select Org District", "സംഘടനാ ജില്ല തിരഞ്ഞെടുക്കുക")}
                  options={availOrgDistricts}
                  selectedValues={selectedOrgDistricts}
                  onChange={setSelectedOrgDistricts}
                  tr={tr}
                />

                {/* Mandalam Filter Dropdown */}
                <FilterDropdownSelector
                  title={tr("Mandalam", "മണ്ഡലം")}
                  placeholder={tr("Select Mandalam", "മണ്ഡലം തിരഞ്ഞെടുക്കുക")}
                  options={availMandalams}
                  selectedValues={selectedMandalams}
                  onChange={setSelectedMandalams}
                  tr={tr}
                />

                {/* Area Filter Dropdown */}
                <FilterDropdownSelector
                  title={tr("Area", "ഏരിയ")}
                  placeholder={tr("Select Area", "ഏരിയ തിരഞ്ഞെടുക്കുക")}
                  options={availAreas}
                  selectedValues={selectedAreas}
                  onChange={setSelectedAreas}
                  tr={tr}
                />

                {/* Booth Filter Dropdown */}
                <FilterDropdownSelector
                  title={tr("Booth", "ബൂത്ത്")}
                  placeholder={tr("Select Booth", "ബൂത്ത് തിരഞ്ഞെടുക്കുക")}
                  options={availBooths}
                  selectedValues={selectedBooths}
                  onChange={setSelectedBooths}
                  tr={tr}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>

        <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-border text-xs shrink-0">
          <span className="font-semibold text-muted-foreground">
            {tr(
              `${selectedUserIds.length} of ${desktopUsers.length} users selected`,
              `${selectedUserIds.length} / ${desktopUsers.length} ഉപയോക്താക്കൾ`,
            )}
          </span>
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-primary font-bold hover:underline cursor-pointer text-xs"
          >
            {allFilteredSelected
              ? tr("Deselect All", "എല്ലാം ഒഴിവാക്കുക")
              : tr("Select All", "എല്ലാം തിരഞ്ഞെടുക്കുക")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              {tr("No matching users found.", "ഉപയോക്താക്കളെ കണ്ടെത്തിയില്ല.")}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isChecked = selectedUserIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => toggleUserSelection(user.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                    isChecked
                      ? "border-primary/50 bg-white shadow-2xs ring-1 ring-primary/20"
                      : "border-border/60 bg-white hover:bg-slate-50/60",
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                    className="pointer-events-none"
                  />
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-foreground truncate">
                      {lang === "ml" ? user.nameMl || user.name : user.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {lang === "ml" ? user.designationMl : user.designationEn}
                      {(user.constituencyEn || user.districtNameEn) && (
                        <span className="text-muted-foreground/80 font-medium">
                          {" • "}
                          {lang === "ml"
                            ? `${user.constituencyMl || user.districtNameMl}${user.districtNameMl ? `, ${user.districtNameMl}` : ""}`
                            : `${user.constituencyEn || user.districtNameEn}${user.districtNameEn ? `, ${user.districtNameEn}` : ""}`}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-border bg-white flex items-center justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-3.5 text-xs font-semibold cursor-pointer bg-white"
          >
            {tr("Skip", "ഒഴിവാക്കുക")}
          </Button>
          <Button
            type="button"
            onClick={handleSaveAssignment}
            className="h-9 px-4 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            {tr("Assign & Save", "അസൈൻ ചെയ്ത് സേവ് ചെയ്യുക")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
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
