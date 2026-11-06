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
  GripVertical,
  Info,
  Layers,
  Lock,
  ListFilter,
  Network,
  MoreVertical,
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
  X,
} from "lucide-react";
import { toast } from "sonner";
import { OrganisationalChart } from "./OrganisationalChart";

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
  createCustomOrganisationLevelId,
  loadCustomOrganisationLevels,
  saveCustomOrganisationLevels,
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
import { districts, organisationalDistricts, constituencies } from "@/data/geo";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

const LOCATION_ORG_LEVELS_DATA = [
  { id: "LVL-1", name: "State", nameMl: "സംസ്ഥാനം", scope: "Entire Kerala State (1 Unit)", status: "Active" },
  { id: "LVL-2", name: "Region", nameMl: "മേഖല", scope: "3 Regional Clusters (South, Central, North)", status: "Active" },
  { id: "LVL-3", name: "Organisational District", nameMl: "സംഘടനാ ജില്ല", scope: "30 Organisational Districts", status: "Active" },
  { id: "LVL-4", name: "Mandalam", nameMl: "മണ്ഡലം", scope: "140 Assembly Constituencies", status: "Active" },
  { id: "LVL-5", name: "Area", nameMl: "ഏരിയ", scope: "Local Area Clusters", status: "Active" },
  { id: "LVL-6", name: "Booth", nameMl: "ബൂത്ത്", scope: "Polling Booth Units (25,000+)", status: "Active" },
];

const LOCATION_REGIONS_DATA = [
  { id: "REG-N", name: "Northern Region", nameMl: "വടക്കൻ മേഖല", scope: "10 Organisational Districts (48 Mandalams)", districts: "Kasaragod, Kannur, Wayanad, Kozhikode, Malappuram", status: "Active" },
  { id: "REG-C", name: "Central Region", nameMl: "മധ്യ മേഖല", scope: "12 Organisational Districts (53 Mandalams)", districts: "Palakkad, Thrissur, Ernakulam, Idukki, Kottayam", status: "Active" },
  { id: "REG-S", name: "Southern Region", nameMl: "തെക്കൻ മേഖല", scope: "8 Organisational Districts (39 Mandalams)", districts: "Alappuzha, Pathanamthitta, Kollam, Thiruvananthapuram", status: "Active" },
];

const getLocationRegionName = (districtName: string): string => {
  const d = (districtName || "").toLowerCase();
  if (
    d.includes("thiruvananthapuram") ||
    d.includes("trivandrum") ||
    d.includes("kollam") ||
    d.includes("pathanamthitta") ||
    d.includes("alappuzha")
  ) {
    return "South";
  }
  if (
    d.includes("kottayam") ||
    d.includes("idukki") ||
    d.includes("ernakulam") ||
    d.includes("kochi") ||
    d.includes("thrissur")
  ) {
    return "Central";
  }
  return "North";
};

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
  orgLevel?: string;
}

export interface ManagedDesignation {
  id: string;
  name: string;
  orgLevel: string;
  status: "Active" | "Disabled";
}

const MANAGED_DESIGNATIONS_KEY = "vikasita_managed_designations_v1";

const DEFAULT_DESIGNATIONS_BY_LEVEL: Record<string, string[]> = {
  State: [
    "President",
    "Vice President",
    "General Secretary",
    "General Secretary (Organisation)",
    "Secretary",
    "Treasurer",
    "Executive Member",
  ],
  Region: [
    "President",
    "In-charge",
    "Coordinator",
    "Cluster In-charge",
  ],
  "Organisational District": [
    "President",
    "Vice President",
    "General Secretary",
    "General Secretary (Organisation)",
    "Secretary",
    "Treasurer",
    "Executive Member",
  ],
  Mandalam: [
    "President",
    "Vice President",
    "General Secretary",
    "Secretary",
    "Treasurer",
    "Committee Member",
  ],
  Area: [
    "Kendra Convener",
    "Area Coordinator",
    "Area In-charge",
    "Area Committee Member",
  ],
  Booth: [
    "President",
    "Secretary",
    "Committee Member",
    "Worker",
  ],
};

const ORG_LEVEL_OPTIONS_LIST = [
  { id: "State", en: "State", ml: "സംസ്ഥാനം" },
  { id: "Region", en: "Region", ml: "റീജിയൻ" },
  { id: "Organisational District", en: "Organisational District", ml: "സംഘടനാ ജില്ല" },
  { id: "Mandalam", en: "Mandalam", ml: "മണ്ഡലം" },
  { id: "Area", en: "Area", ml: "ഏരിയ" },
  { id: "Booth", en: "Booth", ml: "ബൂത്ത്" },
];

export function loadManagedDesignations(): ManagedDesignation[] {
  if (typeof window === "undefined") return getDefaultDesignations();
  try {
    const raw = localStorage.getItem(MANAGED_DESIGNATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return getDefaultDesignations();
}

export function saveManagedDesignations(list: ManagedDesignation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MANAGED_DESIGNATIONS_KEY, JSON.stringify(list));
  } catch {
    // fallback
  }
}

function getDefaultDesignations(): ManagedDesignation[] {
  const defaults: ManagedDesignation[] = [];
  let count = 1;
  for (const [level, list] of Object.entries(DEFAULT_DESIGNATIONS_BY_LEVEL)) {
    for (const name of list) {
      defaults.push({
        id: `DESIG-${String(count++).padStart(3, "0")}`,
        name,
        orgLevel: level,
        status: "Active",
      });
    }
  }
  return defaults;
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

export function RoleAccessSettings({
  defaultTab = "roles",
  autoOpenCreateModal = false,
  returnTo,
}: {
  defaultTab?: "roles" | "users" | "designations" | "location";
  autoOpenCreateModal?: boolean;
  returnTo?: string;
} = {}) {
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
  const [activeTab, setActiveTab] = useState<"roles" | "users" | "designations" | "location">(defaultTab);
  const [locationSubTab, setLocationSubTab] = useState<
    "org-levels" | "region" | "org-district" | "mandalam" | "area" | "booth"
  >("org-levels");
  const [locationViewMode, setLocationViewMode] = useState<"list" | "chart">("list");

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (autoOpenCreateModal) {
      if (defaultTab === "designations") {
        handleOpenCreateDesignation();
      } else if (defaultTab === "location") {
        handleOpenLocationModal("org-levels");
      }
    }
  }, [autoOpenCreateModal, defaultTab]);

  // Designations management state
  const [designationsList, setDesignationsList] = useState<ManagedDesignation[]>(() => loadManagedDesignations());
  const [designationDialogOpen, setDesignationDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<ManagedDesignation | null>(null);
  const [designationForm, setDesignationForm] = useState({
    name: "",
    orgLevel: "State",
  });
  const [designationSearch, setDesignationSearch] = useState("");
  const [selectedOrgLevelFilter, setSelectedOrgLevelFilter] = useState("All");

  const commitDesignations = (next: ManagedDesignation[]) => {
    setDesignationsList(next);
    saveManagedDesignations(next);
  };

  const handleOpenCreateDesignation = () => {
    setEditingDesignation(null);
    setDesignationForm({ name: "", orgLevel: "State" });
    setDesignationDialogOpen(true);
  };

  const handleOpenEditDesignation = (desig: ManagedDesignation) => {
    setEditingDesignation(desig);
    setDesignationForm({ name: desig.name, orgLevel: desig.orgLevel });
    setDesignationDialogOpen(true);
  };

  const handleSaveDesignation = () => {
    const trimmed = designationForm.name.trim();
    if (!trimmed) {
      toast.error(tr("Designation name is required.", "തസ്തിക നാമം നിർബന്ധമാണ്."));
      return;
    }

    if (editingDesignation) {
      const updated = designationsList.map((d) =>
        d.id === editingDesignation.id ? { ...d, name: trimmed, orgLevel: designationForm.orgLevel } : d,
      );
      commitDesignations(updated);
      toast.success(tr("Designation updated successfully.", "തസ്തിക വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു."));
    } else {
      const newDesig: ManagedDesignation = {
        id: `DESIG-${Date.now()}`,
        name: trimmed,
        orgLevel: designationForm.orgLevel,
        status: "Active",
      };
      commitDesignations([newDesig, ...designationsList]);
      toast.success(tr("Designation created successfully.", "തസ്തിക വിജയകരമായി സൃഷ്ടിച്ചു."));
    }
    setDesignationDialogOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vk_newly_created_designation", trimmed);
    }
    if (returnTo) {
      void navigate({ to: returnTo });
    }
  };

  const handleToggleDesignationStatus = (desig: ManagedDesignation) => {
    const nextStatus: "Active" | "Disabled" = desig.status === "Active" ? "Disabled" : "Active";
    const updated = designationsList.map((d) => (d.id === desig.id ? { ...d, status: nextStatus } : d));
    commitDesignations(updated);
    toast.success(
      nextStatus === "Disabled"
        ? tr("Designation disabled.", "തസ്തിക നിർജ്ജീവമാക്കി.")
        : tr("Designation enabled.", "തസ്തിക സജീവമാക്കി."),
    );
  };

  const handleDeleteDesignation = (desig: ManagedDesignation) => {
    const confirmed = window.confirm(
      lang === "ml"
        ? `"${desig.name}" എന്ന തസ്തിക നീക്കം ചെയ്യണോ?`
        : `Are you sure you want to delete "${desig.name}"?`,
    );
    if (!confirmed) return;
    const updated = designationsList.filter((d) => d.id !== desig.id);
    commitDesignations(updated);
    toast.success(tr("Designation deleted.", "തസ്തിക നീക്കം ചെയ്തു."));
  };

  // Bulk designation selection & operations state
  const [selectedDesignationIds, setSelectedDesignationIds] = useState<string[]>([]);

  const handleSelectAllDesignations = (checked: boolean) => {
    if (checked) {
      setSelectedDesignationIds(filteredDesignations.map((d) => d.id));
    } else {
      setSelectedDesignationIds([]);
    }
  };

  const handleToggleSingleDesignationSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDesignationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      setSelectedDesignationIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleBulkEnableDesignations = () => {
    if (selectedDesignationIds.length === 0) return;
    const updated = designationsList.map((d) =>
      selectedDesignationIds.includes(d.id) ? { ...d, status: "Active" as const } : d
    );
    commitDesignations(updated);
    toast.success(
      lang === "ml"
        ? `${selectedDesignationIds.length} തസ്തികകൾ സജീവമാക്കി`
        : `Enabled ${selectedDesignationIds.length} designation(s)`
    );
  };

  const handleBulkDisableDesignations = () => {
    if (selectedDesignationIds.length === 0) return;
    const updated = designationsList.map((d) =>
      selectedDesignationIds.includes(d.id) ? { ...d, status: "Disabled" as const } : d
    );
    commitDesignations(updated);
    toast.info(
      lang === "ml"
        ? `${selectedDesignationIds.length} തസ്തികകൾ നിർജ്ജീവമാക്കി`
        : `Disabled ${selectedDesignationIds.length} designation(s)`
    );
  };

  const handleBulkDeleteDesignations = () => {
    if (selectedDesignationIds.length === 0) return;
    const confirmed = window.confirm(
      lang === "ml"
        ? `തിരഞ്ഞെടുത്ത ${selectedDesignationIds.length} തസ്തികകൾ നീക്കം ചെയ്യണോ?`
        : `Are you sure you want to delete ${selectedDesignationIds.length} selected designation(s)?`
    );
    if (!confirmed) return;
    const updated = designationsList.filter((d) => !selectedDesignationIds.includes(d.id));
    commitDesignations(updated);
    toast.success(
      lang === "ml"
        ? `${selectedDesignationIds.length} തസ്തികകൾ നീക്കം ചെയ്തു`
        : `Deleted ${selectedDesignationIds.length} designation(s)`
    );
    setSelectedDesignationIds([]);
  };

  const filteredDesignations = useMemo(() => {
    return designationsList.filter((d) => {
      const q = topSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.orgLevel.toLowerCase().includes(q);
      const matchesLevel = selectedOrgLevelFilter === "All" || d.orgLevel === selectedOrgLevelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [designationsList, topSearchQuery, selectedOrgLevelFilter]);

  // Location datasets state
  const [locationOrgLevels, setLocationOrgLevels] = useState(LOCATION_ORG_LEVELS_DATA);
  const [locationRegions, setLocationRegions] = useState(LOCATION_REGIONS_DATA);

  const initialOrgDistricts = useMemo(() => {
    return [
      // Northern Region (10)
      { id: "OD-01", name: "Kasaragod", nameMl: "കാസർഗോഡ്", region: "North", revDistrict: "Kasaragod", status: "Active" as const },
      { id: "OD-02", name: "Kannur North", nameMl: "കണ്ണൂർ നോർത്ത്", region: "North", revDistrict: "Kannur", status: "Active" as const },
      { id: "OD-03", name: "Kannur South", nameMl: "കണ്ണൂർ സൗത്ത്", region: "North", revDistrict: "Kannur", status: "Active" as const },
      { id: "OD-04", name: "Wayanad", nameMl: "വയനാട്", region: "North", revDistrict: "Wayanad", status: "Active" as const },
      { id: "OD-05", name: "Kozhikode City", nameMl: "കോഴിക്കോട് സിറ്റി", region: "North", revDistrict: "Kozhikode", status: "Active" as const },
      { id: "OD-06", name: "Kozhikode North", nameMl: "കോഴിക്കോട് നോർത്ത്", region: "North", revDistrict: "Kozhikode", status: "Active" as const },
      { id: "OD-07", name: "Kozhikode Rural", nameMl: "കോഴിക്കോട് റൂറൽ", region: "North", revDistrict: "Kozhikode", status: "Active" as const },
      { id: "OD-08", name: "Malappuram Central", nameMl: "മലപ്പുറം സെൻട്രൽ", region: "North", revDistrict: "Malappuram", status: "Active" as const },
      { id: "OD-09", name: "Malappuram East", nameMl: "മലപ്പുറം ഈസ്റ്റ്", region: "North", revDistrict: "Malappuram", status: "Active" as const },
      { id: "OD-10", name: "Malappuram West", nameMl: "മലപ്പുറം വെസ്റ്റ്", region: "North", revDistrict: "Malappuram", status: "Active" as const },

      // Central Region (12)
      { id: "OD-11", name: "Palakkad East", nameMl: "പാലക്കാട് ഈസ്റ്റ്", region: "Central", revDistrict: "Palakkad", status: "Active" as const },
      { id: "OD-12", name: "Palakkad West", nameMl: "പാലക്കാട് വെസ്റ്റ്", region: "Central", revDistrict: "Palakkad", status: "Active" as const },
      { id: "OD-13", name: "Thrissur City", nameMl: "തൃശ്ശൂർ സിറ്റി", region: "Central", revDistrict: "Thrissur", status: "Active" as const },
      { id: "OD-14", name: "Thrissur North", nameMl: "തൃശ്ശൂർ നോർത്ത്", region: "Central", revDistrict: "Thrissur", status: "Active" as const },
      { id: "OD-15", name: "Thrissur South", nameMl: "തൃശ്ശൂർ സൗത്ത്", region: "Central", revDistrict: "Thrissur", status: "Active" as const },
      { id: "OD-16", name: "Ernakulam City", nameMl: "എറണാകുളം സിറ്റി", region: "Central", revDistrict: "Ernakulam", status: "Active" as const },
      { id: "OD-17", name: "Ernakulam North", nameMl: "എറണാകുളം നോർത്ത്", region: "Central", revDistrict: "Ernakulam", status: "Active" as const },
      { id: "OD-18", name: "Ernakulam East", nameMl: "എറണാകുളം ഈസ്റ്റ്", region: "Central", revDistrict: "Ernakulam", status: "Active" as const },
      { id: "OD-19", name: "Idukki North", nameMl: "ഇടുക്കി നോർത്ത്", region: "Central", revDistrict: "Idukki", status: "Active" as const },
      { id: "OD-20", name: "Idukki South", nameMl: "ഇടുക്കി സൗത്ത്", region: "Central", revDistrict: "Idukki", status: "Active" as const },
      { id: "OD-21", name: "Kottayam East", nameMl: "കോട്ടയം ഈസ്റ്റ്", region: "Central", revDistrict: "Kottayam", status: "Active" as const },
      { id: "OD-22", name: "Kottayam West", nameMl: "കോട്ടയം വെസ്റ്റ്", region: "Central", revDistrict: "Kottayam", status: "Active" as const },

      // Southern Region (8)
      { id: "OD-23", name: "Alappuzha North", nameMl: "ആലപ്പുഴ നോർത്ത്", region: "South", revDistrict: "Alappuzha", status: "Active" as const },
      { id: "OD-24", name: "Alappuzha South", nameMl: "ആലപ്പുഴ സൗത്ത്", region: "South", revDistrict: "Alappuzha", status: "Active" as const },
      { id: "OD-25", name: "Pathanamthitta", nameMl: "പത്തനംതിട്ട", region: "South", revDistrict: "Pathanamthitta", status: "Active" as const },
      { id: "OD-26", name: "Kollam East", nameMl: "കൊല്ലം ഈസ്റ്റ്", region: "South", revDistrict: "Kollam", status: "Active" as const },
      { id: "OD-27", name: "Kollam West", nameMl: "കൊല്ലം വെസ്റ്റ്", region: "South", revDistrict: "Kollam", status: "Active" as const },
      { id: "OD-28", name: "Thiruvananthapuram City", nameMl: "തിരുവനന്തപുരം സിറ്റി", region: "South", revDistrict: "Thiruvananthapuram", status: "Active" as const },
      { id: "OD-29", name: "Thiruvananthapuram North", nameMl: "തിരുവനന്തപുരം നോർത്ത്", region: "South", revDistrict: "Thiruvananthapuram", status: "Active" as const },
      { id: "OD-30", name: "Thiruvananthapuram South", nameMl: "തിരുവനന്തപുരം സൗത്ത്", region: "South", revDistrict: "Thiruvananthapuram", status: "Active" as const },
    ];
  }, []);
  const [locationOrgDistrictsState, setLocationOrgDistrictsState] = useState(initialOrgDistricts);

  const initialMandalams = useMemo(() => {
    return [
      // 1. Northern Region (48 Mandalams)
      // Kasaragod (5)
      { id: "MAN-001", name: "Manjeshwar", nameMl: "മഞ്ചേശ്വരം", region: "North", orgDistrict: "Kasaragod", status: "Active" as const },
      { id: "MAN-002", name: "Kasaragod", nameMl: "കാസർഗോഡ്", region: "North", orgDistrict: "Kasaragod", status: "Active" as const },
      { id: "MAN-003", name: "Udma", nameMl: "ഉദുമ", region: "North", orgDistrict: "Kasaragod", status: "Active" as const },
      { id: "MAN-004", name: "Kanhangad", nameMl: "കാഞ്ഞങ്ങാട്", region: "North", orgDistrict: "Kasaragod", status: "Active" as const },
      { id: "MAN-005", name: "Trikaripur", nameMl: "തൃക്കരിപ്പൂർ", region: "North", orgDistrict: "Kasaragod", status: "Active" as const },
      // Kannur North (5)
      { id: "MAN-006", name: "Payyannur", nameMl: "പയ്യന്നൂർ", region: "North", orgDistrict: "Kannur North", status: "Active" as const },
      { id: "MAN-007", name: "Kalliasseri", nameMl: "കല്യാശ്ശേരി", region: "North", orgDistrict: "Kannur North", status: "Active" as const },
      { id: "MAN-008", name: "Taliparamba", nameMl: "തളിപ്പറമ്പ്", region: "North", orgDistrict: "Kannur North", status: "Active" as const },
      { id: "MAN-009", name: "Irikkur", nameMl: "ഇരിക്കൂർ", region: "North", orgDistrict: "Kannur North", status: "Active" as const },
      { id: "MAN-010", name: "Azhikode", nameMl: "അഴീക്കോട്", region: "North", orgDistrict: "Kannur North", status: "Active" as const },
      // Kannur South (6)
      { id: "MAN-011", name: "Kannur", nameMl: "കണ്ണൂർ", region: "North", orgDistrict: "Kannur South", status: "Active" as const },
      { id: "MAN-012", name: "Dharmadam", nameMl: "ധർമ്മടം", region: "North", orgDistrict: "Kannur South", status: "Active" as const },
      { id: "MAN-013", name: "Thalassery", nameMl: "തലശ്ശേരി", region: "North", orgDistrict: "Kannur South", status: "Active" as const },
      { id: "MAN-014", name: "Kuthuparamba", nameMl: "കൂത്തുപറമ്പ്", region: "North", orgDistrict: "Kannur South", status: "Active" as const },
      { id: "MAN-015", name: "Mattannur", nameMl: "മട്ടന്നൂർ", region: "North", orgDistrict: "Kannur South", status: "Active" as const },
      { id: "MAN-016", name: "Peravoor", nameMl: "പേരാവൂർ", region: "North", orgDistrict: "Kannur South", status: "Active" as const },
      // Wayanad (3)
      { id: "MAN-017", name: "Mananthavady", nameMl: "മാനന്തവാടി", region: "North", orgDistrict: "Wayanad", status: "Active" as const },
      { id: "MAN-018", name: "Sulthan Bathery", nameMl: "സുൽത്താൻ ബത്തേരി", region: "North", orgDistrict: "Wayanad", status: "Active" as const },
      { id: "MAN-019", name: "Kalpetta", nameMl: "കൽപ്പറ്റ", region: "North", orgDistrict: "Wayanad", status: "Active" as const },
      // Kozhikode City (3)
      { id: "MAN-020", name: "Kozhikode North", nameMl: "കോഴിക്കോട് നോർത്ത്", region: "North", orgDistrict: "Kozhikode City", status: "Active" as const },
      { id: "MAN-021", name: "Kozhikode South", nameMl: "കോഴിക്കോട് സൗത്ത്", region: "North", orgDistrict: "Kozhikode City", status: "Active" as const },
      { id: "MAN-022", name: "Beypore", nameMl: "ബേപ്പൂർ", region: "North", orgDistrict: "Kozhikode City", status: "Active" as const },
      // Kozhikode North (5)
      { id: "MAN-023", name: "Vadakara", nameMl: "വടകര", region: "North", orgDistrict: "Kozhikode North", status: "Active" as const },
      { id: "MAN-024", name: "Kuttiadi", nameMl: "കുറ്റ്യാടി", region: "North", orgDistrict: "Kozhikode North", status: "Active" as const },
      { id: "MAN-025", name: "Nadapuram", nameMl: "നാദാപുരം", region: "North", orgDistrict: "Kozhikode North", status: "Active" as const },
      { id: "MAN-026", name: "Quilandy", nameMl: "കൊയിലാണ്ടി", region: "North", orgDistrict: "Kozhikode North", status: "Active" as const },
      { id: "MAN-027", name: "Perambra", nameMl: "പേരാമ്പ്ര", region: "North", orgDistrict: "Kozhikode North", status: "Active" as const },
      // Kozhikode Rural (5)
      { id: "MAN-028", name: "Balusseri", nameMl: "ബാലുശ്ശേരി", region: "North", orgDistrict: "Kozhikode Rural", status: "Active" as const },
      { id: "MAN-029", name: "Elathur", nameMl: "എലത്തൂർ", region: "North", orgDistrict: "Kozhikode Rural", status: "Active" as const },
      { id: "MAN-030", name: "Kunnamangalam", nameMl: "കുന്ദമംഗലം", region: "North", orgDistrict: "Kozhikode Rural", status: "Active" as const },
      { id: "MAN-031", name: "Koduvally", nameMl: "കൊടുവള്ളി", region: "North", orgDistrict: "Kozhikode Rural", status: "Active" as const },
      { id: "MAN-032", name: "Thiruvambady", nameMl: "തിരുവമ്പാടി", region: "North", orgDistrict: "Kozhikode Rural", status: "Active" as const },
      // Malappuram Central (5)
      { id: "MAN-033", name: "Manjeri", nameMl: "മഞ്ചേരി", region: "North", orgDistrict: "Malappuram Central", status: "Active" as const },
      { id: "MAN-034", name: "Perinthalmanna", nameMl: "പെരിന്തൽമണ്ണ", region: "North", orgDistrict: "Malappuram Central", status: "Active" as const },
      { id: "MAN-035", name: "Mankada", nameMl: "മങ്കട", region: "North", orgDistrict: "Malappuram Central", status: "Active" as const },
      { id: "MAN-036", name: "Malappuram", nameMl: "മലപ്പുറം", region: "North", orgDistrict: "Malappuram Central", status: "Active" as const },
      { id: "MAN-037", name: "Vengara", nameMl: "വേങ്ങര", region: "North", orgDistrict: "Malappuram Central", status: "Active" as const },
      // Malappuram East (5)
      { id: "MAN-038", name: "Kondotty", nameMl: "കൊണ്ടോട്ടി", region: "North", orgDistrict: "Malappuram East", status: "Active" as const },
      { id: "MAN-039", name: "Eranad", nameMl: "ഏറനാട്", region: "North", orgDistrict: "Malappuram East", status: "Active" as const },
      { id: "MAN-040", name: "Nilambur", nameMl: "നിലമ്പൂർ", region: "North", orgDistrict: "Malappuram East", status: "Active" as const },
      { id: "MAN-041", name: "Wandoor", nameMl: "വണ്ടൂർ", region: "North", orgDistrict: "Malappuram East", status: "Active" as const },
      { id: "MAN-042", name: "Vallikkunnu", nameMl: "വള്ളിക്കുന്ന്", region: "North", orgDistrict: "Malappuram East", status: "Active" as const },
      // Malappuram West (6)
      { id: "MAN-043", name: "Tirurangadi", nameMl: "തിരൂരങ്ങാടി", region: "North", orgDistrict: "Malappuram West", status: "Active" as const },
      { id: "MAN-044", name: "Tanur", nameMl: "താനൂർ", region: "North", orgDistrict: "Malappuram West", status: "Active" as const },
      { id: "MAN-045", name: "Tirur", nameMl: "തിരൂർ", region: "North", orgDistrict: "Malappuram West", status: "Active" as const },
      { id: "MAN-046", name: "Kottakkal", nameMl: "കോട്ടക്കൽ", region: "North", orgDistrict: "Malappuram West", status: "Active" as const },
      { id: "MAN-047", name: "Thavanur", nameMl: "തവനൂർ", region: "North", orgDistrict: "Malappuram West", status: "Active" as const },
      { id: "MAN-048", name: "Ponnani", nameMl: "പൊന്നാനി", region: "North", orgDistrict: "Malappuram West", status: "Active" as const },

      // 2. Central Region (53 Mandalams)
      // Palakkad East (6)
      { id: "MAN-049", name: "Mannarkkad", nameMl: "മണ്ണാർക്കാട്", region: "Central", orgDistrict: "Palakkad East", status: "Active" as const },
      { id: "MAN-050", name: "Malampuzha", nameMl: "മലമ്പുഴ", region: "Central", orgDistrict: "Palakkad East", status: "Active" as const },
      { id: "MAN-051", name: "Palakkad", nameMl: "പാലക്കാട്", region: "Central", orgDistrict: "Palakkad East", status: "Active" as const },
      { id: "MAN-052", name: "Chittur", nameMl: "ചിറ്റൂർ", region: "Central", orgDistrict: "Palakkad East", status: "Active" as const },
      { id: "MAN-053", name: "Nenmara", nameMl: "നെന്മാറ", region: "Central", orgDistrict: "Palakkad East", status: "Active" as const },
      { id: "MAN-054", name: "Alathur", nameMl: "ആലത്തൂർ", region: "Central", orgDistrict: "Palakkad East", status: "Active" as const },
      // Palakkad West (6)
      { id: "MAN-055", name: "Thrithala", nameMl: "തൃത്താല", region: "Central", orgDistrict: "Palakkad West", status: "Active" as const },
      { id: "MAN-056", name: "Pattambi", nameMl: "പട്ടാമ്പി", region: "Central", orgDistrict: "Palakkad West", status: "Active" as const },
      { id: "MAN-057", name: "Shornur", nameMl: "ഷൊർണൂർ", region: "Central", orgDistrict: "Palakkad West", status: "Active" as const },
      { id: "MAN-058", name: "Ottapalam", nameMl: "ഒറ്റപ്പാലം", region: "Central", orgDistrict: "Palakkad West", status: "Active" as const },
      { id: "MAN-059", name: "Kongad", nameMl: "കൊങ്ങാട്", region: "Central", orgDistrict: "Palakkad West", status: "Active" as const },
      { id: "MAN-060", name: "Tarur", nameMl: "തരൂർ", region: "Central", orgDistrict: "Palakkad West", status: "Active" as const },
      // Thrissur City (4)
      { id: "MAN-061", name: "Wadakkanchery", nameMl: "വടക്കാഞ്ചേരി", region: "Central", orgDistrict: "Thrissur City", status: "Active" as const },
      { id: "MAN-062", name: "Ollur", nameMl: "ഒല്ലൂർ", region: "Central", orgDistrict: "Thrissur City", status: "Active" as const },
      { id: "MAN-063", name: "Thrissur", nameMl: "തൃശ്ശൂർ", region: "Central", orgDistrict: "Thrissur City", status: "Active" as const },
      { id: "MAN-064", name: "Puthukkad", nameMl: "പുതുക്കാട്", region: "Central", orgDistrict: "Thrissur City", status: "Active" as const },
      // Thrissur North (4)
      { id: "MAN-065", name: "Chelakkara", nameMl: "ചേലക്കര", region: "Central", orgDistrict: "Thrissur North", status: "Active" as const },
      { id: "MAN-066", name: "Kunnamkulam", nameMl: "കുന്നംകുളം", region: "Central", orgDistrict: "Thrissur North", status: "Active" as const },
      { id: "MAN-067", name: "Guruvayoor", nameMl: "ഗുരുവായൂർ", region: "Central", orgDistrict: "Thrissur North", status: "Active" as const },
      { id: "MAN-068", name: "Manalur", nameMl: "മണലൂർ", region: "Central", orgDistrict: "Thrissur North", status: "Active" as const },
      // Thrissur South (5)
      { id: "MAN-069", name: "Nattika", nameMl: "നാട്ടിക", region: "Central", orgDistrict: "Thrissur South", status: "Active" as const },
      { id: "MAN-070", name: "Kaipamangalam", nameMl: "കൈപ്പമംഗലം", region: "Central", orgDistrict: "Thrissur South", status: "Active" as const },
      { id: "MAN-071", name: "Irinjalakuda", nameMl: "ഇരിഞ്ഞാലക്കുട", region: "Central", orgDistrict: "Thrissur South", status: "Active" as const },
      { id: "MAN-072", name: "Chalakudy", nameMl: "ചാലക്കുടി", region: "Central", orgDistrict: "Thrissur South", status: "Active" as const },
      { id: "MAN-073", name: "Kodungallur", nameMl: "കൊടുങ്ങല്ലൂർ", region: "Central", orgDistrict: "Thrissur South", status: "Active" as const },
      // Ernakulam City (6)
      { id: "MAN-074", name: "Kalamassery", nameMl: "കളമശ്ശേരി", region: "Central", orgDistrict: "Ernakulam City", status: "Active" as const },
      { id: "MAN-075", name: "Vypen", nameMl: "വൈപ്പിൻ", region: "Central", orgDistrict: "Ernakulam City", status: "Active" as const },
      { id: "MAN-076", name: "Kochi", nameMl: "കൊച്ചി", region: "Central", orgDistrict: "Ernakulam City", status: "Active" as const },
      { id: "MAN-077", name: "Thripunithura", nameMl: "തൃപ്പൂണിത്തുറ", region: "Central", orgDistrict: "Ernakulam City", status: "Active" as const },
      { id: "MAN-078", name: "Ernakulam", nameMl: "എറണാകുളം", region: "Central", orgDistrict: "Ernakulam City", status: "Active" as const },
      { id: "MAN-079", name: "Thrikkakara", nameMl: "തൃക്കാക്കര", region: "Central", orgDistrict: "Ernakulam City", status: "Active" as const },
      // Ernakulam North (4)
      { id: "MAN-080", name: "Perumbavoor", nameMl: "പെരുമ്പാവൂർ", region: "Central", orgDistrict: "Ernakulam North", status: "Active" as const },
      { id: "MAN-081", name: "Angamaly", nameMl: "അങ്കമാലി", region: "Central", orgDistrict: "Ernakulam North", status: "Active" as const },
      { id: "MAN-082", name: "Aluva", nameMl: "ആലുവ", region: "Central", orgDistrict: "Ernakulam North", status: "Active" as const },
      { id: "MAN-083", name: "Paravur", nameMl: "പറവൂർ", region: "Central", orgDistrict: "Ernakulam North", status: "Active" as const },
      // Ernakulam East (4)
      { id: "MAN-084", name: "Kunnathunad", nameMl: "കുന്നത്തുനാട്", region: "Central", orgDistrict: "Ernakulam East", status: "Active" as const },
      { id: "MAN-085", name: "Piravom", nameMl: "പിറവം", region: "Central", orgDistrict: "Ernakulam East", status: "Active" as const },
      { id: "MAN-086", name: "Muvattupuzha", nameMl: "മൂവാറ്റുപുഴ", region: "Central", orgDistrict: "Ernakulam East", status: "Active" as const },
      { id: "MAN-087", name: "Kothamangalam", nameMl: "കോതമംഗലം", region: "Central", orgDistrict: "Ernakulam East", status: "Active" as const },
      // Idukki North (2)
      { id: "MAN-088", name: "Thodupuzha", nameMl: "തൊടുപുഴ", region: "Central", orgDistrict: "Idukki North", status: "Active" as const },
      { id: "MAN-089", name: "Idukki", nameMl: "ഇടുക്കി", region: "Central", orgDistrict: "Idukki North", status: "Active" as const },
      // Idukki South (3)
      { id: "MAN-090", name: "Devikulam", nameMl: "ദേവികുളം", region: "Central", orgDistrict: "Idukki South", status: "Active" as const },
      { id: "MAN-091", name: "Udumbanchola", nameMl: "ഉടുമ്പൻചോല", region: "Central", orgDistrict: "Idukki South", status: "Active" as const },
      { id: "MAN-092", name: "Peerumade", nameMl: "പീരുമേട്", region: "Central", orgDistrict: "Idukki South", status: "Active" as const },
      // Kottayam East (4)
      { id: "MAN-093", name: "Pala", nameMl: "പാലാ", region: "Central", orgDistrict: "Kottayam East", status: "Active" as const },
      { id: "MAN-094", name: "Kanjirappally", nameMl: "കാഞ്ഞിരപ്പള്ളി", region: "Central", orgDistrict: "Kottayam East", status: "Active" as const },
      { id: "MAN-095", name: "Poonjar", nameMl: "പൂഞ്ഞാർ", region: "Central", orgDistrict: "Kottayam East", status: "Active" as const },
      { id: "MAN-096", name: "Puthuppally", nameMl: "പുതുപ്പള്ളി", region: "Central", orgDistrict: "Kottayam East", status: "Active" as const },
      // Kottayam West (5)
      { id: "MAN-097", name: "Kaduthuruthy", nameMl: "കടുത്തുരുത്തി", region: "Central", orgDistrict: "Kottayam West", status: "Active" as const },
      { id: "MAN-098", name: "Vaikom", nameMl: "വൈക്കം", region: "Central", orgDistrict: "Kottayam West", status: "Active" as const },
      { id: "MAN-099", name: "Ettumanoor", nameMl: "ഏറ്റുമാനൂർ", region: "Central", orgDistrict: "Kottayam West", status: "Active" as const },
      { id: "MAN-100", name: "Kottayam", nameMl: "കോട്ടയം", region: "Central", orgDistrict: "Kottayam West", status: "Active" as const },
      { id: "MAN-101", name: "Changanassery", nameMl: "ചങ്ങനാശ്ശേരി", region: "Central", orgDistrict: "Kottayam West", status: "Active" as const },

      // 3. Southern Region (39 Mandalams)
      // Alappuzha North (5)
      { id: "MAN-102", name: "Aroor", nameMl: "അരൂർ", region: "South", orgDistrict: "Alappuzha North", status: "Active" as const },
      { id: "MAN-103", name: "Cherthala", nameMl: "ചേർത്തല", region: "South", orgDistrict: "Alappuzha North", status: "Active" as const },
      { id: "MAN-104", name: "Alappuzha", nameMl: "ആലപ്പുഴ", region: "South", orgDistrict: "Alappuzha North", status: "Active" as const },
      { id: "MAN-105", name: "Ambalapuzha", nameMl: "അമ്പലപ്പുഴ", region: "South", orgDistrict: "Alappuzha North", status: "Active" as const },
      { id: "MAN-106", name: "Kuttanad", nameMl: "കുട്ടനാട്", region: "South", orgDistrict: "Alappuzha North", status: "Active" as const },
      // Alappuzha South (4)
      { id: "MAN-107", name: "Haripad", nameMl: "ഹരിപ്പാട്", region: "South", orgDistrict: "Alappuzha South", status: "Active" as const },
      { id: "MAN-108", name: "Kayamkulam", nameMl: "കായംകുളം", region: "South", orgDistrict: "Alappuzha South", status: "Active" as const },
      { id: "MAN-109", name: "Mavelikara", nameMl: "മാവേലിക്കര", region: "South", orgDistrict: "Alappuzha South", status: "Active" as const },
      { id: "MAN-110", name: "Chengannur", nameMl: "ചെങ്ങന്നൂർ", region: "South", orgDistrict: "Alappuzha South", status: "Active" as const },
      // Pathanamthitta (5)
      { id: "MAN-111", name: "Thiruvalla", nameMl: "തിരുവല്ല", region: "South", orgDistrict: "Pathanamthitta", status: "Active" as const },
      { id: "MAN-112", name: "Ranni", nameMl: "റാന്നി", region: "South", orgDistrict: "Pathanamthitta", status: "Active" as const },
      { id: "MAN-113", name: "Aranmula", nameMl: "ആറന്മുള", region: "South", orgDistrict: "Pathanamthitta", status: "Active" as const },
      { id: "MAN-114", name: "Konni", nameMl: "കോന്നി", region: "South", orgDistrict: "Pathanamthitta", status: "Active" as const },
      { id: "MAN-115", name: "Adoor", nameMl: "അടൂർ", region: "South", orgDistrict: "Pathanamthitta", status: "Active" as const },
      // Kollam East (5)
      { id: "MAN-116", name: "Kunnathur", nameMl: "കുന്നത്തൂർ", region: "South", orgDistrict: "Kollam East", status: "Active" as const },
      { id: "MAN-117", name: "Kottarakkara", nameMl: "കൊട്ടാരക്കര", region: "South", orgDistrict: "Kollam East", status: "Active" as const },
      { id: "MAN-118", name: "Pathanapuram", nameMl: "പത്തനാപുരം", region: "South", orgDistrict: "Kollam East", status: "Active" as const },
      { id: "MAN-119", name: "Punalur", nameMl: "പുനലൂർ", region: "South", orgDistrict: "Kollam East", status: "Active" as const },
      { id: "MAN-120", name: "Chadayamangalam", nameMl: "ചടയമംഗലം", region: "South", orgDistrict: "Kollam East", status: "Active" as const },
      // Kollam West (6)
      { id: "MAN-121", name: "Karunagappally", nameMl: "കരുനാഗപ്പള്ളി", region: "South", orgDistrict: "Kollam West", status: "Active" as const },
      { id: "MAN-122", name: "Chavara", nameMl: "ചവറ", region: "South", orgDistrict: "Kollam West", status: "Active" as const },
      { id: "MAN-123", name: "Kundara", nameMl: "കുണ്ടറ", region: "South", orgDistrict: "Kollam West", status: "Active" as const },
      { id: "MAN-124", name: "Kollam", nameMl: "കൊല്ലം", region: "South", orgDistrict: "Kollam West", status: "Active" as const },
      { id: "MAN-125", name: "Eravipuram", nameMl: "ഇരവിപുരം", region: "South", orgDistrict: "Kollam West", status: "Active" as const },
      { id: "MAN-126", name: "Chathannur", nameMl: "ചാത്തന്നൂർ", region: "South", orgDistrict: "Kollam West", status: "Active" as const },
      // Thiruvananthapuram North (5)
      { id: "MAN-127", name: "Varkala", nameMl: "വർക്കല", region: "South", orgDistrict: "Thiruvananthapuram North", status: "Active" as const },
      { id: "MAN-128", name: "Attingal", nameMl: "ആറ്റിങ്ങൽ", region: "South", orgDistrict: "Thiruvananthapuram North", status: "Active" as const },
      { id: "MAN-129", name: "Chirayinkeezhu", nameMl: "ചിറയിൻകീഴ്", region: "South", orgDistrict: "Thiruvananthapuram North", status: "Active" as const },
      { id: "MAN-130", name: "Nedumangad", nameMl: "നെടുമങ്ങാട്", region: "South", orgDistrict: "Thiruvananthapuram North", status: "Active" as const },
      { id: "MAN-131", name: "Vamanapuram", nameMl: "വാമനപുരം", region: "South", orgDistrict: "Thiruvananthapuram North", status: "Active" as const },
      // Thiruvananthapuram City (4)
      { id: "MAN-132", name: "Kazhakkoottam", nameMl: "കഴക്കൂട്ടം", region: "South", orgDistrict: "Thiruvananthapuram City", status: "Active" as const },
      { id: "MAN-133", name: "Vattiyoorkavu", nameMl: "വട്ടിയൂർക്കാവ്", region: "South", orgDistrict: "Thiruvananthapuram City", status: "Active" as const },
      { id: "MAN-134", name: "Thiruvananthapuram", nameMl: "തിരുവനന്തപുരം", region: "South", orgDistrict: "Thiruvananthapuram City", status: "Active" as const },
      { id: "MAN-135", name: "Nemom", nameMl: "നേമം", region: "South", orgDistrict: "Thiruvananthapuram City", status: "Active" as const },
      // Thiruvananthapuram South (5)
      { id: "MAN-136", name: "Aruvikkara", nameMl: "അരുവിക്കര", region: "South", orgDistrict: "Thiruvananthapuram South", status: "Active" as const },
      { id: "MAN-137", name: "Parassala", nameMl: "പാറശ്ശാല", region: "South", orgDistrict: "Parassala", status: "Active" as const },
      { id: "MAN-138", name: "Kattakkada", nameMl: "കാട്ടാക്കട", region: "South", orgDistrict: "Thiruvananthapuram South", status: "Active" as const },
      { id: "MAN-139", name: "Kovalam", nameMl: "കോവളം", region: "South", orgDistrict: "Thiruvananthapuram South", status: "Active" as const },
      { id: "MAN-140", name: "Neyyattinkara", nameMl: "നെയ്യാറ്റിൻകര", region: "South", orgDistrict: "Thiruvananthapuram South", status: "Active" as const },
    ];
  }, []);
  const [locationMandalamsState, setLocationMandalamsState] = useState(initialMandalams);

  const initialAreas = useMemo(() => {
    return constituencies.slice(0, 35).map((c, idx) => {
      const revDistObj = districts.find((d) => d.id === c.districtId);
      const revDistName = revDistObj?.en || "Thiruvananthapuram";
      const regionName = getLocationRegionName(revDistName);
      const odName = `${revDistName} City`;
      return {
        id: `AREA-${String(idx + 1).padStart(3, "0")}`,
        name: `${c.en} Central`,
        nameMl: `${c.ml} സെൻട്രൽ`,
        region: regionName,
        orgDistrict: odName,
        mandalam: c.en,
        mandalamMl: c.ml,
        status: "Active" as "Active" | "Inactive",
      };
    });
  }, []);
  const [locationAreasState, setLocationAreasState] = useState(initialAreas);

  const initialBooths = useMemo(() => {
    return constituencies.slice(0, 25).flatMap((c, idx) => {
      const revDistObj = districts.find((d) => d.id === c.districtId);
      const revDistName = revDistObj?.en || "Thiruvananthapuram";
      const regionName = getLocationRegionName(revDistName);
      const odName = `${revDistName} City`;
      return [
        {
          id: `BTH-${String(idx * 2 + 1).padStart(4, "0")}`,
          number: `Booth ${idx * 2 + 1}`,
          name: `Booth ${idx * 2 + 1} - Govt LP School`,
          nameMl: `ബൂത്ത് ${idx * 2 + 1} - ഗവ. എൽ.പി സ്കൂൾ`,
          region: regionName,
          orgDistrict: odName,
          mandalam: c.en,
          area: `${c.en} Central`,
          status: "Active" as "Active" | "Inactive",
        },
        {
          id: `BTH-${String(idx * 2 + 2).padStart(4, "0")}`,
          number: `Booth ${idx * 2 + 2}`,
          name: `Booth ${idx * 2 + 2} - Town Hall`,
          nameMl: `ബൂത്ത് ${idx * 2 + 2} - ടൗൺ ഹാൾ`,
          region: regionName,
          orgDistrict: odName,
          mandalam: c.en,
          area: `${c.en} North`,
          status: "Active" as "Active" | "Inactive",
        },
      ];
    });
  }, []);
  const [locationBoothsState, setLocationBoothsState] = useState(initialBooths);

  // Modal State for Location Create / Edit
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationModalType, setLocationModalType] = useState<
    "org-levels" | "region" | "org-district" | "mandalam" | "area" | "booth"
  >("org-levels");
  const [editingLocationItem, setEditingLocationItem] = useState<any | null>(null);

  const [locationForm, setLocationForm] = useState({
    name: "",
    nameMl: "",
    scope: "Statewide",
    districts: "",
    hq: "",
    revDistrict: "",
    mandalam: "",
    area: "",
    number: "",
    region: "North",
    orgDistrict: "Kasaragod",
    hierarchyPos: 1,
  });

  const handleOpenLocationModal = (type: "org-levels" | "region" | "org-district" | "mandalam" | "area" | "booth", item?: any) => {
    setLocationModalType(type);
    if (item) {
      setEditingLocationItem(item);
      const currentPos = locationOrgLevels.findIndex((l) => l.id === item.id);
      setLocationForm({
        name: item.name || "",
        nameMl: item.nameMl || "",
        scope: item.scope || "Statewide",
        districts: item.districts || "",
        hq: item.hq || "",
        revDistrict: item.revDistrict || "",
        mandalam: item.mandalam || "",
        area: item.area || "",
        number: item.number || "",
        region: item.region || "North",
        orgDistrict: item.orgDistrict || "Kasaragod",
        hierarchyPos: currentPos >= 0 ? currentPos : locationOrgLevels.length,
      });
    } else {
      setEditingLocationItem(null);
      setLocationForm({
        name: "",
        nameMl: "",
        scope: "Statewide",
        districts: "",
        hq: "",
        revDistrict: "",
        mandalam: "",
        area: "",
        number: "",
        region: "North",
        orgDistrict: "Kasaragod",
        hierarchyPos: locationOrgLevels.length,
      });
    }
    setLocationModalOpen(true);
  };

  const handleSaveLocationItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationForm.name.trim()) {
      toast.error(tr("Name is required", "പേര് ആവശ്യമാണ്"));
      return;
    }

    if (locationModalType === "org-levels") {
      const trimmedName = locationForm.name.trim();
      if (!trimmedName) {
        toast.error(tr("Level Name is required", "ലെവൽ പേര് ആവശ്യമാണ്"));
        return;
      }
      const isDuplicate = locationOrgLevels.some(
        (lvl) =>
          lvl.id !== editingLocationItem?.id &&
          lvl.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        toast.error(tr("Level Name already exists", "ഈ പേരിൽ ഒരു തലം നിലവിലുണ്ട്"));
        return;
      }

      const scopeMap: Record<string, string> = {
        Statewide: "Entire State Level Unit",
        Regional: "Regional Level Clusters",
        District: "District Level Units",
        Local: "Local Level Units",
        "Booth Level": "Polling Booth Units",
      };
      const scopeDisplay = scopeMap[locationForm.scope] || locationForm.scope || "Statewide";

      if (editingLocationItem) {
        setLocationOrgLevels((prev) =>
          prev.map((i) =>
            i.id === editingLocationItem.id
              ? {
                  ...i,
                  name: trimmedName,
                  nameMl: locationForm.nameMl || trimmedName,
                  scope: scopeDisplay,
                }
              : i
          )
        );
        toast.success(tr("Organisation Level updated", "സംഘടനാ തലം തിരുത്തി"));
      } else {
        const pos = Number(locationForm.hierarchyPos ?? locationOrgLevels.length);
        const newItem = {
          id: `LVL-${Date.now()}`,
          name: trimmedName,
          nameMl: locationForm.nameMl || trimmedName,
          scope: scopeDisplay,
          status: "Active" as const,
        };
        setLocationOrgLevels((prev) => {
          const next = [...prev];
          const insertIdx = Math.max(0, Math.min(pos, next.length));
          next.splice(insertIdx, 0, newItem);
          return next;
        });
        toast.success(tr("Organisation Level created", "സംഘടനാ തലം സൃഷ്ടിച്ചു"));
      }
    } else if (locationModalType === "region") {
      if (editingLocationItem) {
        setLocationRegions((prev) =>
          prev.map((i) =>
            i.id === editingLocationItem.id
              ? {
                  ...i,
                  name: locationForm.name,
                  nameMl: locationForm.nameMl || locationForm.name,
                  scope: locationForm.scope || i.scope || "Regional Scope",
                }
              : i
          )
        );
        toast.success(tr("Region updated", "മേഖല തിരുത്തി"));
      } else {
        const newItem = {
          id: `REG-${String.fromCharCode(65 + locationRegions.length)}`,
          name: locationForm.name,
          nameMl: locationForm.nameMl || locationForm.name,
          scope: locationForm.scope || "Regional Scope",
          districts: locationForm.districts || "Kerala",
          status: "Active",
        };
        setLocationRegions((prev) => [newItem, ...prev]);
        toast.success(tr("Region created", "മേഖല സൃഷ്ടിച്ചു"));
      }
    } else if (locationModalType === "org-district") {
      if (editingLocationItem) {
        setLocationOrgDistrictsState((prev) =>
          prev.map((i) =>
            i.id === editingLocationItem.id
              ? {
                  ...i,
                  name: locationForm.name,
                  nameMl: locationForm.nameMl || locationForm.name,
                  region: locationForm.region || (i as any).region || "North",
                }
              : i
          )
        );
        toast.success(tr("Organisation District updated", "സംഘടനാ ജില്ല തിരുത്തി"));
      } else {
        const newItem = {
          id: `OD-${String(locationOrgDistrictsState.length + 1).padStart(3, "0")}`,
          name: locationForm.name,
          nameMl: locationForm.nameMl || locationForm.name,
          region: locationForm.region || "North",
          status: "Active" as const,
        };
        setLocationOrgDistrictsState((prev) => [newItem, ...prev]);
        toast.success(tr("Organisation District created", "സംഘടനാ ജില്ല സൃഷ്ടിച്ചു"));
      }
    } else if (locationModalType === "mandalam") {
      if (editingLocationItem) {
        setLocationMandalamsState((prev) =>
          prev.map((i) =>
            i.id === editingLocationItem.id
              ? {
                  ...i,
                  name: locationForm.name,
                  nameMl: locationForm.nameMl || locationForm.name,
                  region: locationForm.region || i.region || "North",
                  orgDistrict: locationForm.orgDistrict || i.orgDistrict || "Kasaragod",
                }
              : i
          )
        );
        toast.success(tr("Mandalam updated", "മണ്ഡലം തിരുത്തി"));
      } else {
        const newItem = {
          id: `MND-${String(locationMandalamsState.length + 1).padStart(3, "0")}`,
          name: locationForm.name,
          nameMl: locationForm.nameMl || locationForm.name,
          region: locationForm.region || "North",
          orgDistrict: locationForm.orgDistrict || "Kasaragod",
          status: "Active" as const,
        };
        setLocationMandalamsState((prev) => [newItem, ...prev]);
        toast.success(tr("Mandalam created", "മണ്ഡലം സൃഷ്ടിച്ചു"));
      }
    } else if (locationModalType === "area") {
      if (editingLocationItem) {
        setLocationAreasState((prev) =>
          prev.map((i) =>
            i.id === editingLocationItem.id
              ? {
                  ...i,
                  name: locationForm.name,
                  nameMl: locationForm.nameMl || locationForm.name,
                  region: locationForm.region || (i as any).region || "North",
                  orgDistrict: locationForm.orgDistrict || (i as any).orgDistrict || "Kasaragod",
                  mandalam: locationForm.mandalam || i.mandalam,
                  mandalamMl: locationForm.mandalam || i.mandalamMl,
                }
              : i
          )
        );
        toast.success(tr("Area updated", "ഏരിയ തിരുത്തി"));
      } else {
        const newItem = {
          id: `AREA-${String(locationAreasState.length + 1).padStart(3, "0")}`,
          name: locationForm.name,
          nameMl: locationForm.nameMl || locationForm.name,
          region: locationForm.region || "North",
          orgDistrict: locationForm.orgDistrict || "Kasaragod",
          mandalam: locationForm.mandalam || "Manjeshwar",
          mandalamMl: locationForm.mandalam || "മഞ്ചേശ്വരം",
          status: "Active" as const,
        };
        setLocationAreasState((prev) => [newItem, ...prev]);
        toast.success(tr("Area created", "ഏരിയ സൃഷ്ടിച്ചു"));
      }
    } else if (locationModalType === "booth") {
      if (editingLocationItem) {
        setLocationBoothsState((prev) =>
          prev.map((i) =>
            i.id === editingLocationItem.id
              ? {
                  ...i,
                  number: locationForm.number || i.number,
                  name: locationForm.name,
                  nameMl: locationForm.nameMl || locationForm.name,
                  region: locationForm.region || (i as any).region || "North",
                  orgDistrict: locationForm.orgDistrict || (i as any).orgDistrict || "Kasaragod",
                  mandalam: locationForm.mandalam || i.mandalam,
                  area: locationForm.area || i.area,
                }
              : i
          )
        );
        toast.success(tr("Booth updated", "ബൂത്ത് തിരുത്തി"));
      } else {
        const newItem = {
          id: `BTH-${String(locationBoothsState.length + 1).padStart(4, "0")}`,
          number: locationForm.number || `${locationBoothsState.length + 1}`,
          name: locationForm.name,
          nameMl: locationForm.nameMl || locationForm.name,
          region: locationForm.region || "North",
          orgDistrict: locationForm.orgDistrict || "Kasaragod",
          mandalam: locationForm.mandalam || "Manjeshwar",
          area: locationForm.area || "Manjeshwar Central",
          status: "Active" as const,
        };
        setLocationBoothsState((prev) => [newItem, ...prev]);
        toast.success(tr("Booth created", "ബൂത്ത് സൃഷ്ടിച്ചു"));
      }
    }

    if (locationModalType === "org-levels" && locationForm.name.trim()) {
      const levelName = locationForm.name.trim();
      const newCustomLevel = {
        id: createCustomOrganisationLevelId(levelName),
        name: levelName,
        under: "state" as const,
      };
      const existing = loadCustomOrganisationLevels();
      saveCustomOrganisationLevels([...existing, newCustomLevel]);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("vk_newly_created_org_level", levelName);
      }
    }

    setLocationModalOpen(false);
    if (returnTo) {
      void navigate({ to: returnTo });
    }
  };

  const handleToggleDisableLocationItem = (item: any, type: "org-levels" | "region" | "org-district" | "mandalam" | "area" | "booth") => {
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    if (type === "org-levels") {
      setLocationOrgLevels((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)));
    } else if (type === "region") {
      setLocationRegions((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)));
    } else if (type === "org-district") {
      setLocationOrgDistrictsState((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)));
    } else if (type === "mandalam") {
      setLocationMandalamsState((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)));
    } else if (type === "area") {
      setLocationAreasState((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)));
    } else if (type === "booth") {
      setLocationBoothsState((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)));
    }
    toast.success(nextStatus === "Inactive" ? tr("Item disabled", "നിർജ്ജീവമാക്കി") : tr("Item enabled", "സജീവമാക്കി"));
  };

  const handleDeleteLocationItem = (item: any, type: "org-levels" | "region" | "org-district" | "mandalam" | "area" | "booth") => {
    if (type === "org-levels") {
      setLocationOrgLevels((prev) => prev.filter((i) => i.id !== item.id));
    } else if (type === "region") {
      setLocationRegions((prev) => prev.filter((i) => i.id !== item.id));
    } else if (type === "org-district") {
      setLocationOrgDistrictsState((prev) => prev.filter((i) => i.id !== item.id));
    } else if (type === "mandalam") {
      setLocationMandalamsState((prev) => prev.filter((i) => i.id !== item.id));
    } else if (type === "area") {
      setLocationAreasState((prev) => prev.filter((i) => i.id !== item.id));
    } else if (type === "booth") {
      setLocationBoothsState((prev) => prev.filter((i) => i.id !== item.id));
    }
    toast.success(tr("Item deleted", "ഡിലീറ്റ് ചെയ്തു"));
  };

  const filteredLocationOrgLevels = useMemo(() => {
    const q = topSearchQuery.trim().toLowerCase();
    if (!q) return locationOrgLevels;
    return locationOrgLevels.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.nameMl.toLowerCase().includes(q) ||
        item.scope.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [topSearchQuery, locationOrgLevels]);

  const filteredLocationRegions = useMemo(() => {
    const q = topSearchQuery.trim().toLowerCase();
    if (!q) return locationRegions;
    return locationRegions.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.nameMl.toLowerCase().includes(q) ||
        item.districts.toLowerCase().includes(q) ||
        item.hq.toLowerCase().includes(q),
    );
  }, [topSearchQuery, locationRegions]);

  const filteredLocationOrgDistricts = useMemo(() => {
    const q = topSearchQuery.trim().toLowerCase();
    if (!q) return locationOrgDistrictsState;
    return locationOrgDistrictsState.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.nameMl.toLowerCase().includes(q) ||
        item.revDistrict.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [topSearchQuery, locationOrgDistrictsState]);

  const filteredLocationMandalams = useMemo(() => {
    const q = topSearchQuery.trim().toLowerCase();
    if (!q) return locationMandalamsState;
    return locationMandalamsState.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.nameMl.toLowerCase().includes(q) ||
        item.revDistrict.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [topSearchQuery, locationMandalamsState]);

  const filteredLocationAreas = useMemo(() => {
    const q = topSearchQuery.trim().toLowerCase();
    if (!q) return locationAreasState;
    return locationAreasState.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.nameMl.toLowerCase().includes(q) ||
        item.mandalam.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [topSearchQuery, locationAreasState]);

  const filteredLocationBooths = useMemo(() => {
    const q = topSearchQuery.trim().toLowerCase();
    if (!q) return locationBoothsState;
    return locationBoothsState.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.nameMl.toLowerCase().includes(q) ||
        item.mandalam.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.number.toLowerCase().includes(q),
    );
  }, [topSearchQuery, locationBoothsState]);

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

  const USER_COLUMNS_META: { key: keyof typeof visibleColumns; en: string; ml: string }[] = [
    { key: "user", en: "User", ml: "ഉപയോക്താവ്" },
    { key: "role", en: "Role", ml: "റോൾ" },
    { key: "localBody", en: "Area", ml: "ഏരിയ" },
    { key: "orgDistrict", en: "Organisational District", ml: "സംഘടനാ ജില്ല" },
    { key: "contact", en: "Contact", ml: "ബന്ധപ്പെടുക" },
    { key: "status", en: "Status", ml: "സ്റ്റാറ്റസ്" },
    { key: "actions", en: "Actions", ml: "നടപടികൾ" },
  ];

  const [userColumnOrder, setUserColumnOrder] = useState<(keyof typeof visibleColumns)[]>([
    "user",
    "role",
    "localBody",
    "orgDistrict",
    "contact",
    "status",
    "actions",
  ]);

  const [draggedUserColumnIndex, setDraggedUserColumnIndex] = useState<number | null>(null);

  const handleDragStartUserColumn = (index: number) => {
    setDraggedUserColumnIndex(index);
  };

  const handleDragOverUserColumn = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropUserColumn = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedUserColumnIndex === null || draggedUserColumnIndex === dropIndex) return;
    const nextOrder = [...userColumnOrder];
    const [moved] = nextOrder.splice(draggedUserColumnIndex, 1);
    nextOrder.splice(dropIndex, 0, moved);
    setUserColumnOrder(nextOrder);
    setDraggedUserColumnIndex(null);
  };

  const [visibleRoleColumns, setVisibleRoleColumns] = useState({
    role: true,
    description: true,
    users: true,
    status: true,
    actions: true,
  });

  const ROLE_COLUMNS_META: { key: keyof typeof visibleRoleColumns; en: string; ml: string }[] = [
    { key: "role", en: "Role Name", ml: "റോൾ പേര്" },
    { key: "description", en: "Description", ml: "വിവരണം" },
    { key: "users", en: "Users Count", ml: "ഉപയോക്താക്കളുടെ എണ്ണം" },
    { key: "status", en: "Status", ml: "സ്റ്റാറ്റസ്" },
    { key: "actions", en: "Actions", ml: "നടപടികൾ" },
  ];

  const [roleColumnOrder, setRoleColumnOrder] = useState<(keyof typeof visibleRoleColumns)[]>([
    "role",
    "description",
    "users",
    "status",
    "actions",
  ]);

  const [draggedRoleColumnIndex, setDraggedRoleColumnIndex] = useState<number | null>(null);

  const handleDragStartRoleColumn = (index: number) => {
    setDraggedRoleColumnIndex(index);
  };

  const handleDragOverRoleColumn = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropRoleColumn = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedRoleColumnIndex === null || draggedRoleColumnIndex === dropIndex) return;
    const nextOrder = [...roleColumnOrder];
    const [moved] = nextOrder.splice(draggedRoleColumnIndex, 1);
    nextOrder.splice(dropIndex, 0, moved);
    setRoleColumnOrder(nextOrder);
    setDraggedRoleColumnIndex(null);
  };

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
          {activeTab === "location" ? (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h2 className="text-sm font-extrabold text-foreground px-1">
                {tr("Location Management", "സ്ഥല നിർവ്വഹണം")}
              </h2>
              <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-muted/20 p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLocationViewMode("list")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                    locationViewMode === "list"
                      ? "bg-primary text-primary-foreground font-extrabold shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span>{tr("List View", "ലിസ്റ്റ് കാഴ്ച")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationViewMode("chart")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                    locationViewMode === "chart"
                      ? "bg-primary text-primary-foreground font-extrabold shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <Network className="h-3.5 w-3.5" />
                  <span>{tr("Organisational Chart", "സംഘടനാ ചാർട്ട്")}</span>
                </button>
              </div>
            </div>
          ) : activeTab === "designations" ? (
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-foreground px-1">
                {tr(`Designations (${designationsList.length})`, `തസ്തികകൾ (${designationsList.length})`)}
              </h2>
            </div>
          ) : (
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
          )}
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "designations" && (
              <select
                value={selectedOrgLevelFilter}
                onChange={(e) => setSelectedOrgLevelFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="All">{tr("All Levels", "എല്ലാ തലങ്ങളും")}</option>
                {ORG_LEVEL_OPTIONS_LIST.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {tr(opt.en, opt.ml)}
                  </option>
                ))}
              </select>
            )}


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
                  <div className="space-y-1 py-1 max-h-64 overflow-y-auto pr-1">
                    <div className="flex items-center justify-between pb-1.5 px-1 border-b border-border/60 mb-1">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {tr("Drag to reorder columns", "വലിച്ച് മാറ്റുക")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVisibleColumns({
                            user: true,
                            role: true,
                            localBody: true,
                            orgDistrict: true,
                            contact: true,
                            status: true,
                            actions: true,
                          });
                          setUserColumnOrder(USER_COLUMNS_META.map((c) => c.key));
                        }}
                        className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        {tr("Show All", "എല്ലാം കാണിക്കുക")}
                      </button>
                    </div>
                    {userColumnOrder.map((colKey, index) => {
                      const meta = USER_COLUMNS_META.find((c) => c.key === colKey);
                      if (!meta) return null;
                      const isChecked = visibleColumns[colKey];
                      return (
                        <div
                          key={colKey}
                          draggable
                          onDragStart={() => handleDragStartUserColumn(index)}
                          onDragOver={handleDragOverUserColumn}
                          onDrop={(e) => handleDropUserColumn(e, index)}
                          className={`flex items-center gap-2 rounded-lg p-1.5 text-xs transition-colors hover:bg-muted/60 ${
                            draggedUserColumnIndex === index ? "opacity-40 bg-muted" : ""
                          }`}
                        >
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />
                          <Checkbox
                            id={`col-user-${colKey}`}
                            checked={isChecked}
                            onCheckedChange={(c) =>
                              setVisibleColumns((prev) => ({ ...prev, [colKey]: Boolean(c) }))
                            }
                          />
                          <label
                            htmlFor={`col-user-${colKey}`}
                            className="flex-1 text-xs font-semibold text-foreground cursor-pointer select-none truncate"
                          >
                            {tr(meta.en, meta.ml)}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1 py-1 max-h-64 overflow-y-auto pr-1">
                    <div className="flex items-center justify-between pb-1.5 px-1 border-b border-border/60 mb-1">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {tr("Drag to reorder columns", "വലിച്ച് മാറ്റുക")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVisibleRoleColumns({
                            role: true,
                            description: true,
                            users: true,
                            status: true,
                            actions: true,
                          });
                          setRoleColumnOrder(ROLE_COLUMNS_META.map((c) => c.key));
                        }}
                        className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        {tr("Show All", "എല്ലാം കാണിക്കുക")}
                      </button>
                    </div>
                    {roleColumnOrder.map((colKey, index) => {
                      const meta = ROLE_COLUMNS_META.find((c) => c.key === colKey);
                      if (!meta) return null;
                      const isChecked = visibleRoleColumns[colKey];
                      return (
                        <div
                          key={colKey}
                          draggable
                          onDragStart={() => handleDragStartRoleColumn(index)}
                          onDragOver={handleDragOverRoleColumn}
                          onDrop={(e) => handleDropRoleColumn(e, index)}
                          className={`flex items-center gap-2 rounded-lg p-1.5 text-xs transition-colors hover:bg-muted/60 ${
                            draggedRoleColumnIndex === index ? "opacity-40 bg-muted" : ""
                          }`}
                        >
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />
                          <Checkbox
                            id={`col-role-${colKey}`}
                            checked={isChecked}
                            onCheckedChange={(c) =>
                              setVisibleRoleColumns((prev) => ({ ...prev, [colKey]: Boolean(c) }))
                            }
                          />
                          <label
                            htmlFor={`col-role-${colKey}`}
                            className="flex-1 text-xs font-semibold text-foreground cursor-pointer select-none truncate"
                          >
                            {tr(meta.en, meta.ml)}
                          </label>
                        </div>
                      );
                    })}
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
              <div className="flex items-center gap-1.5">
                <Link
                  to="/admin/settings/new-role"
                  search={{ editRoleId: undefined }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold leading-tight text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  {tr("Create New Role", "പുതിയ റോൾ സൃഷ്ടിക്കുക")}
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      title={tr("More Actions", "കൂടുതൽ പ്രവർത്തനങ്ങൾ")}
                      aria-label={tr("More Actions", "കൂടുതൽ പ്രവർത്തനങ്ങൾ")}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground cursor-pointer shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 text-xs font-semibold">
                    <DropdownMenuItem onClick={handleExportData} className="gap-2 cursor-pointer">
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{tr("Export", "എക്സ്പോർട്ട്")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportData} className="gap-2 cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{tr("Import", "ഇമ്പോർട്ട്")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : activeTab === "users" ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={openCreateUser}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold leading-tight text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  {tr("Create User", "ഉപയോക്താവിനെ ചേർക്കുക")}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      title={tr("More Actions", "കൂടുതൽ പ്രവർത്തനങ്ങൾ")}
                      aria-label={tr("More Actions", "കൂടുതൽ പ്രവർത്തനങ്ങൾ")}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground cursor-pointer shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 text-xs font-semibold">
                    <DropdownMenuItem onClick={handleExportData} className="gap-2 cursor-pointer">
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{tr("Export", "എക്സ്പോർട്ട്")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportData} className="gap-2 cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{tr("Import", "ഇമ്പോർട്ട്")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : activeTab === "designations" ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenCreateDesignation}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold leading-tight text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  {tr("Create New Designation", "പുതിയ തസ്തിക സൃഷ്ടിക്കുക")}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      title={tr("More Actions", "കൂടുതൽ പ്രവർത്തനങ്ങൾ")}
                      aria-label={tr("More Actions", "കൂടുതൽ പ്രവർത്തനങ്ങൾ")}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground cursor-pointer shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 text-xs font-semibold">
                    <DropdownMenuItem onClick={handleExportData} className="gap-2 cursor-pointer">
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{tr("Export", "എക്സ്പോർട്ട്")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportData} className="gap-2 cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{tr("Import", "ഇമ്പോർട്ട്")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : activeTab === "location" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold leading-tight text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer shadow-2xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{tr("Create Location", "ലൊക്കേഷൻ നിർമ്മിക്കുക")}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => handleOpenLocationModal("org-levels")}
                    className="cursor-pointer gap-2 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    {tr("Organisation Level", "സംഘടനാ തലം")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleOpenLocationModal("region")}
                    className="cursor-pointer gap-2 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    {tr("Region", "മേഖല")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleOpenLocationModal("org-district")}
                    className="cursor-pointer gap-2 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    {tr("Organisation District", "സംഘടനാ ജില്ല")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleOpenLocationModal("mandalam")}
                    className="cursor-pointer gap-2 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    {tr("Mandalam", "മണ്ഡലം")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleOpenLocationModal("area")}
                    className="cursor-pointer gap-2 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    {tr("Area", "ഏരിയ")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleOpenLocationModal("booth")}
                    className="cursor-pointer gap-2 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    {tr("Booth", "ബൂത്ത്")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
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

        {activeTab === "location" ? (
          locationViewMode === "chart" ? (
            <OrganisationalChart
              tr={tr}
              lang={lang}
              onEditLocation={(type, item) => handleOpenLocationModal(type as any, item)}
            />
          ) : (
            <div>
              <div className="border-b border-border bg-muted/20 p-2.5 sm:px-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "org-levels", en: `Organisation Levels (${filteredLocationOrgLevels.length})`, ml: `സംഘടനാ തലങ്ങൾ (${filteredLocationOrgLevels.length})` },
                    { id: "region", en: `Region (${filteredLocationRegions.length})`, ml: `മേഖല (${filteredLocationRegions.length})` },
                    { id: "org-district", en: `Organisation District (${filteredLocationOrgDistricts.length})`, ml: `സംഘടനാ ജില്ല (${filteredLocationOrgDistricts.length})` },
                    { id: "mandalam", en: `Mandalam (${filteredLocationMandalams.length})`, ml: `മണ്ഡലം (${filteredLocationMandalams.length})` },
                    { id: "area", en: `Area (${filteredLocationAreas.length})`, ml: `ഏരിയ / കേന്ദ്രം (${filteredLocationAreas.length})` },
                    { id: "booth", en: `Booth (${filteredLocationBooths.length})`, ml: `ബൂത്ത് (${filteredLocationBooths.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLocationSubTab(tab.id as any)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                        locationSubTab === tab.id
                          ? "bg-primary text-primary-foreground shadow-2xs font-extrabold"
                          : "bg-background text-muted-foreground border border-border/80 hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {tr(tab.en, tab.ml)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto desktop-hide-scrollbar">
            {locationSubTab === "org-levels" && (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                  <tr>
                    <th className="p-3">{tr("LEVEL NAME", "തലത്തിന്റെ പേര്")}</th>
                    <th className="p-3">{tr("SCOPE", "പരിധി")}</th>
                    <th className="p-3">{tr("STATUS", "സ്റ്റാറ്റസ്")}</th>
                    <th className="p-3 text-right">{tr("ACTIONS", "നടപടികൾ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-semibold">
                  {filteredLocationOrgLevels.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs font-semibold">
                        {tr("No location items found.", "സ്ഥല വിവരങ്ങൾ ഒന്നും കണ്ടെത്തിയില്ല.")}
                      </td>
                    </tr>
                  ) : (
                    filteredLocationOrgLevels.map((lvl) => (
                      <tr key={lvl.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold text-foreground">
                          {lang === "ml" ? lvl.nameMl : lvl.name}
                        </td>
                        <td className="p-3 text-muted-foreground">{lvl.scope}</td>
                        <td className="p-3">
                          {lvl.status === "Active" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {tr("Active", "സജീവം")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600 border border-slate-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              {tr("Inactive", "നിർജ്ജീവം")}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenLocationModal("org-levels", lvl)}
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
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => handleToggleDisableLocationItem(lvl, "org-levels")}
                                  className="cursor-pointer gap-2 text-xs font-medium"
                                >
                                  {lvl.status === "Active" ? (
                                    <>
                                      <X className="h-3.5 w-3.5 text-amber-600" />
                                      {tr("Disable", "നിർജ്ജീവമാക്കുക")}
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      {tr("Enable", "സജീവമാക്കുക")}
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteLocationItem(lvl, "org-levels")}
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
                    ))
                  )}
                </tbody>
              </table>
            )}

            {locationSubTab === "region" && (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                  <tr>
                    <th className="p-3">{tr("REGION NAME", "മേഖലയുടെ പേര്")}</th>
                    <th className="p-3">{tr("SCOPE", "പരിധി")}</th>
                    <th className="p-3">{tr("STATUS", "സ്റ്റാറ്റസ്")}</th>
                    <th className="p-3 text-right">{tr("ACTIONS", "നടപടികൾ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-semibold">
                  {filteredLocationRegions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs font-semibold">
                        {tr("No regions found.", "മേഖലകൾ ഒന്നും കണ്ടെത്തിയില്ല.")}
                      </td>
                    </tr>
                  ) : (
                    filteredLocationRegions.map((reg) => (
                      <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold text-foreground">
                          {lang === "ml" ? reg.nameMl : reg.name}
                        </td>
                        <td className="p-3 text-muted-foreground">{(reg as any).scope || reg.districts}</td>
                        <td className="p-3">
                          {reg.status === "Active" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {tr("Active", "സജീവം")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600 border border-slate-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              {tr("Inactive", "നിർജ്ജീവം")}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenLocationModal("region", reg)}
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
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => handleToggleDisableLocationItem(reg, "region")}
                                  className="cursor-pointer gap-2 text-xs font-medium"
                                >
                                  {reg.status === "Active" ? (
                                    <>
                                      <X className="h-3.5 w-3.5 text-amber-600" />
                                      {tr("Disable", "നിർജ്ജീവമാക്കുക")}
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      {tr("Enable", "സജീവമാക്കുക")}
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteLocationItem(reg, "region")}
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
                    ))
                  )}
                </tbody>
              </table>
            )}

            {locationSubTab === "org-district" && (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                  <tr>
                    <th className="p-3">{tr("ORGANISATION DISTRICT NAME", "സംഘടനാ ജില്ല")}</th>
                    <th className="p-3">{tr("REGION", "മേഖല")}</th>
                    <th className="p-3">{tr("STATUS", "സ്റ്റാറ്റസ്")}</th>
                    <th className="p-3 text-right">{tr("ACTIONS", "നടപടികൾ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-semibold">
                  {filteredLocationOrgDistricts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs font-semibold">
                        {tr("No organisation districts found.", "സംഘടനാ ജില്ലകൾ ഒന്നും കണ്ടെത്തിയില്ല.")}
                      </td>
                    </tr>
                  ) : (
                    filteredLocationOrgDistricts.map((od) => (
                      <tr key={od.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold text-foreground">
                          {lang === "ml" ? od.nameMl : od.name}
                        </td>
                        <td className="p-3 text-muted-foreground font-medium">
                          {(od as any).region === "North"
                            ? tr("Northern Region", "വടക്കൻ മേഖല")
                            : (od as any).region === "Central"
                            ? tr("Central Region", "മധ്യ മേഖല")
                            : tr("Southern Region", "തെക്കൻ മേഖല")}
                        </td>
                        <td className="p-3">
                          {od.status === "Active" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {tr("Active", "സജീവം")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600 border border-slate-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              {tr("Inactive", "നിർജ്ജീവം")}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenLocationModal("org-district", od)}
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
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => handleToggleDisableLocationItem(od, "org-district")}
                                  className="cursor-pointer gap-2 text-xs font-medium"
                                >
                                  {od.status === "Active" ? (
                                    <>
                                      <X className="h-3.5 w-3.5 text-amber-600" />
                                      {tr("Disable", "നിർജ്ജീവമാക്കുക")}
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      {tr("Enable", "സജീവമാക്കുക")}
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteLocationItem(od, "org-district")}
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
                    ))
                  )}
                </tbody>
              </table>
            )}

            {locationSubTab === "mandalam" && (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                  <tr>
                    <th className="p-3">{tr("MANDALAM NAME", "മണ്ഡലം")}</th>
                    <th className="p-3">{tr("REGION", "മേഖല")}</th>
                    <th className="p-3">{tr("DISTRICT", "ജില്ല")}</th>
                    <th className="p-3">{tr("STATUS", "സ്റ്റാറ്റസ്")}</th>
                    <th className="p-3 text-right">{tr("ACTIONS", "നടപടികൾ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-semibold">
                  {filteredLocationMandalams.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs font-semibold">
                        {tr("No mandalams found.", "മണ്ഡലങ്ങൾ ഒന്നും കണ്ടെത്തിയില്ല.")}
                      </td>
                    </tr>
                  ) : (
                    filteredLocationMandalams.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold text-foreground">
                          {lang === "ml" ? m.nameMl : m.name}
                        </td>
                        <td className="p-3 text-muted-foreground font-medium">
                          {(m as any).region === "North"
                            ? tr("Northern Region", "വടക്കൻ മേഖല")
                            : (m as any).region === "Central"
                            ? tr("Central Region", "മധ്യ മേഖല")
                            : tr("Southern Region", "തെക്കൻ മേഖല")}
                        </td>
                        <td className="p-3 text-muted-foreground font-medium">
                          {(m as any).orgDistrict || m.revDistrict}
                        </td>
                        <td className="p-3">
                          {m.status === "Active" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {tr("Active", "സജീവം")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600 border border-slate-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              {tr("Inactive", "നിർജ്ജീവം")}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenLocationModal("mandalam", m)}
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
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => handleToggleDisableLocationItem(m, "mandalam")}
                                  className="cursor-pointer gap-2 text-xs font-medium"
                                >
                                  {m.status === "Active" ? (
                                    <>
                                      <X className="h-3.5 w-3.5 text-amber-600" />
                                      {tr("Disable", "നിർജ്ജീവമാക്കുക")}
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      {tr("Enable", "സജീവമാക്കുക")}
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteLocationItem(m, "mandalam")}
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
                    ))
                  )}
                </tbody>
              </table>
            )}

            {locationSubTab === "area" && (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                  <tr>
                    <th className="p-3">{tr("AREA NAME", "ഏരിയ")}</th>
                    <th className="p-3">{tr("REGION", "മേഖല")}</th>
                    <th className="p-3">{tr("ORGANISATION DISTRICT", "സംഘടനാ ജില്ല")}</th>
                    <th className="p-3">{tr("MANDALAM", "മണ്ഡലം")}</th>
                    <th className="p-3">{tr("STATUS", "സ്റ്റാറ്റസ്")}</th>
                    <th className="p-3 text-right">{tr("ACTIONS", "നടപടികൾ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-semibold">
                  {filteredLocationAreas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs font-semibold">
                        {tr("No areas found.", "ഏരിയകൾ ഒന്നും കണ്ടെത്തിയില്ല.")}
                      </td>
                    </tr>
                  ) : (
                    filteredLocationAreas.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold text-foreground">
                          {lang === "ml" ? a.nameMl : a.name}
                        </td>
                        <td className="p-3 text-muted-foreground">{(a as any).region || "South"}</td>
                        <td className="p-3 text-muted-foreground">{(a as any).orgDistrict || "Trivandrum City"}</td>
                        <td className="p-3 text-muted-foreground">
                          {lang === "ml" ? a.mandalamMl || a.mandalam : a.mandalam}
                        </td>
                        <td className="p-3">
                          {a.status === "Active" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {tr("Active", "സജീവം")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600 border border-slate-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              {tr("Inactive", "നിർജ്ജീവം")}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenLocationModal("area", a)}
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
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => handleToggleDisableLocationItem(a, "area")}
                                  className="cursor-pointer gap-2 text-xs font-medium"
                                >
                                  {a.status === "Active" ? (
                                    <>
                                      <X className="h-3.5 w-3.5 text-amber-600" />
                                      {tr("Disable", "നിർജ്ജീവമാക്കുക")}
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      {tr("Enable", "സജീവമാക്കുക")}
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteLocationItem(a, "area")}
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
                    ))
                  )}
                </tbody>
              </table>
            )}

            {locationSubTab === "booth" && (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                  <tr>
                    <th className="p-3">{tr("BOOTH NAME", "ബൂത്ത് പേര്")}</th>
                    <th className="p-3">{tr("REGION", "മേഖല")}</th>
                    <th className="p-3">{tr("ORGANISATION DISTRICT", "സംഘടനാ ജില്ല")}</th>
                    <th className="p-3">{tr("MANDALAM", "മണ്ഡലം")}</th>
                    <th className="p-3">{tr("AREA", "ഏരിയ")}</th>
                    <th className="p-3">{tr("STATUS", "സ്റ്റാറ്റസ്")}</th>
                    <th className="p-3 text-right">{tr("ACTIONS", "നടപടികൾ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-semibold">
                  {filteredLocationBooths.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs font-semibold">
                        {tr("No booths found.", "ബൂത്തുകൾ ഒന്നും കണ്ടെത്തിയില്ല.")}
                      </td>
                    </tr>
                  ) : (
                    filteredLocationBooths.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold text-foreground">
                          {lang === "ml" ? b.nameMl : b.name}
                        </td>
                        <td className="p-3 text-muted-foreground">{(b as any).region || "South"}</td>
                        <td className="p-3 text-muted-foreground">{(b as any).orgDistrict || "Trivandrum City"}</td>
                        <td className="p-3 text-muted-foreground">{b.mandalam}</td>
                        <td className="p-3 text-muted-foreground">{b.area}</td>
                        <td className="p-3">
                          {b.status === "Active" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {tr("Active", "സജീവം")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600 border border-slate-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              {tr("Inactive", "നിർജ്ജീവം")}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenLocationModal("booth", b)}
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
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => handleToggleDisableLocationItem(b, "booth")}
                                  className="cursor-pointer gap-2 text-xs font-medium"
                                >
                                  {b.status === "Active" ? (
                                    <>
                                      <X className="h-3.5 w-3.5 text-amber-600" />
                                      {tr("Disable", "നിർജ്ജീവമാക്കുക")}
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      {tr("Enable", "സജീവമാക്കുക")}
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteLocationItem(b, "booth")}
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
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )
    ) : activeTab === "roles" ? (
          <div className="overflow-x-auto desktop-hide-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                <tr>
                  {roleColumnOrder.map((colKey) => {
                    if (!visibleRoleColumns[colKey]) return null;
                    const meta = ROLE_COLUMNS_META.find((c) => c.key === colKey);
                    if (!meta) return null;
                    return (
                      <th
                        key={colKey}
                        className={`p-3 ${colKey === "users" || colKey === "actions" ? "text-right" : ""}`}
                      >
                        {tr(meta.en.toUpperCase(), meta.ml)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {displayedRoles.map((role) => (
                  <tr key={role.id} className="transition-colors hover:bg-muted/40">
                    {roleColumnOrder.map((colKey) => {
                      if (!visibleRoleColumns[colKey]) return null;
                      switch (colKey) {
                        case "role":
                          return (
                            <td key="role" className="min-w-40 p-3">
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
                          );
                        case "description":
                          return (
                            <td key="description" className="max-w-md p-3 text-muted-foreground">
                              {role.description || "—"}
                            </td>
                          );
                        case "users":
                          return (
                            <td key="users" className="whitespace-nowrap p-3 text-right font-mono text-foreground">
                              {role.assignedUsers.toLocaleString("en-IN")}
                            </td>
                          );
                        case "status":
                          return (
                            <td key="status" className="p-3">
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
                          );
                        case "actions":
                          return (
                            <td key="actions" className="p-3 text-right">
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
                                      <MoreVertical className="h-4 w-4" />
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
                          );
                        default:
                          return null;
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "users" ? (
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
                  {userColumnOrder.map((colKey) => {
                    if (!visibleColumns[colKey]) return null;
                    const meta = USER_COLUMNS_META.find((c) => c.key === colKey);
                    if (!meta) return null;
                    return (
                      <th
                        key={colKey}
                        className={`p-3 ${colKey === "actions" ? "text-right" : ""}`}
                      >
                        {tr(meta.en.toUpperCase(), meta.ml)}
                      </th>
                    );
                  })}
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
                    {userColumnOrder.map((colKey) => {
                      if (!visibleColumns[colKey]) return null;
                      switch (colKey) {
                        case "user":
                          return (
                            <td
                              key="user"
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
                          );
                        case "role":
                          return (
                            <td key="role" className="p-3 whitespace-nowrap">
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
                          );
                        case "localBody":
                          return (
                            <td key="localBody" className="p-3 text-foreground whitespace-nowrap font-medium">
                              {getUserArea(user)}
                            </td>
                          );
                        case "orgDistrict":
                          return (
                            <td key="orgDistrict" className="p-3 text-muted-foreground whitespace-nowrap">
                              {getUserOrgDistrict(user)}
                            </td>
                          );
                        case "contact":
                          return (
                            <td key="contact" className="p-3 text-muted-foreground whitespace-nowrap">
                              <p className="font-mono text-foreground">{user.mobile}</p>
                            </td>
                          );
                        case "status":
                          return (
                            <td key="status" className="p-3 whitespace-nowrap">
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
                          );
                        case "actions":
                          return (
                            <td key="actions" className="p-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end">
                                 <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      aria-label={tr("More actions", "കൂടുതൽ നടപടികൾ")}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary cursor-pointer"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() => openEditUser(user)}
                                  className="cursor-pointer gap-2 text-xs font-medium"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  {tr("Edit", "തിരുത്തുക")}
                                </DropdownMenuItem>
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
                  );
                default:
                  return null;
              }
            })}
          </tr>
        ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDesignationIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
                <span className="font-bold text-primary">
                  {tr(
                    `${selectedDesignationIds.length} designation(s) selected`,
                    `${selectedDesignationIds.length} തസ്തികകൾ തിരഞ്ഞെടുത്തു`
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleBulkEnableDesignations}
                    className="h-8 text-xs font-bold gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                  >
                    <Power className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{tr("Enable Selected", "സജീവമാക്കുക")}</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDisableDesignations}
                    className="h-8 text-xs font-bold gap-1.5 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer"
                  >
                    <Power className="h-3.5 w-3.5 text-amber-600" />
                    <span>{tr("Disable Selected", "നിർജ്ജീവമാക്കുക")}</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkDeleteDesignations}
                    className="h-8 text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{tr("Delete Selected", "നീക്കം ചെയ്യുക")}</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto desktop-hide-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                  <tr>
                    <th className="p-3 w-10">
                      <Checkbox
                        checked={
                          filteredDesignations.length > 0 &&
                          selectedDesignationIds.length === filteredDesignations.length
                        }
                        onCheckedChange={(checked) => handleSelectAllDesignations(!!checked)}
                        aria-label="Select all designations"
                      />
                    </th>
                    <th className="p-3">{tr("DESIGNATION", "തസ്തിക")}</th>
                    <th className="p-3">{tr("ORGANISATION LEVEL", "സംഘടനാ തലം")}</th>
                    <th className="p-3">{tr("STATUS", "സ്റ്റാറ്റസ്")}</th>
                    <th className="p-3 text-right">{tr("ACTIONS", "നടപടികൾ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-semibold">
                  {filteredDesignations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs font-semibold">
                        {tr("No designations found.", "തസ്തികകൾ ഒന്നും കണ്ടെത്തിയില്ല.")}
                      </td>
                    </tr>
                  ) : (
                    filteredDesignations.map((desig) => {
                      const isSelected = selectedDesignationIds.includes(desig.id);
                      return (
                        <tr
                          key={desig.id}
                          className={cn(
                            "hover:bg-muted/30 transition-colors",
                            isSelected && "bg-primary/[0.04]"
                          )}
                        >
                          <td className="p-3 w-10">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleToggleSingleDesignationSelect(desig.id, !!checked)
                              }
                              aria-label={`Select ${desig.name}`}
                            />
                          </td>
                          <td className="p-3 font-bold text-foreground">{desig.name}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-200">
                              {desig.orgLevel}
                            </span>
                          </td>
                          <td className="p-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                            desig.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              desig.status === "Active" ? "bg-emerald-500" : "bg-slate-400",
                            )}
                          />
                          {desig.status === "Active" ? tr("Active", "സജീവം") : tr("Disabled", "നിർജ്ജീവം")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditDesignation(desig)}
                            className="h-8 px-2.5 text-xs font-bold gap-1 border-border hover:bg-muted cursor-pointer"
                            title={tr("Edit Designation", "തസ്തിക തിരുത്തുക")}
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-600" />
                            <span>{tr("Edit", "തിരുത്തുക")}</span>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 text-xs">
                              <DropdownMenuItem
                                onClick={() => handleToggleDesignationStatus(desig)}
                                className="gap-2 font-semibold cursor-pointer"
                              >
                                <Power className="h-3.5 w-3.5 text-slate-500" />
                                <span>
                                  {desig.status === "Active"
                                    ? tr("Disable", "നിർജ്ജീവമാക്കുക")
                                    : tr("Enable", "സജീവമാക്കുക")}
                                </span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteDesignation(desig)}
                                className="gap-2 font-semibold text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>{tr("Delete", "നീക്കം ചെയ്യുക")}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>



      {/* Create / Edit Designation Dialog */}
      <Dialog open={designationDialogOpen} onOpenChange={setDesignationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              {editingDesignation
                ? tr("Edit Designation", "തസ്തിക തിരുത്തുക")
                : tr("Create New Designation", "പുതിയ തസ്തിക സൃഷ്ടിക്കുക")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {tr(
                "Provide a designation name and assign its organisation level.",
                "തസ്തികയുടെ നാമവും സംഘടനാ തലവും നൽകുക."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-foreground">
                {tr("Designation Name", "തസ്തിക നാമം")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={designationForm.name}
                onChange={(e) => setDesignationForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={tr("e.g. President", "ഉദാ. പ്രസിഡന്റ്")}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-foreground">
                {tr("Organisation Level", "സംഘടനാ തലം")} <span className="text-destructive">*</span>
              </label>
              <select
                value={designationForm.orgLevel}
                onChange={(e) => setDesignationForm((prev) => ({ ...prev, orgLevel: e.target.value }))}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                {ORG_LEVEL_OPTIONS_LIST.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {tr(opt.en, opt.ml)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDesignationDialogOpen(false)}
              className="h-9 text-xs font-bold cursor-pointer"
            >
              {tr("Cancel", "റദ്ദാക്കുക")}
            </Button>
            <Button
              type="button"
              onClick={handleSaveDesignation}
              className="h-9 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {editingDesignation
                ? tr("Save Changes", "മാറ്റങ്ങൾ സംരക്ഷിക്കുക")
                : tr("Create Designation", "തസ്തിക സൃഷ്ടിക്കുക")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Location Dialog */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="sm:max-w-md bg-white text-zinc-900 border-border dark:bg-zinc-900 dark:text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              {editingLocationItem
                ? tr("Edit Location Entry", "ലൊക്കേഷൻ വിവരങ്ങൾ തിരുത്തുക")
                : tr(
                    `Create ${
                      locationModalType === "org-levels"
                        ? "Organisation Level"
                        : locationModalType === "region"
                        ? "Region"
                        : locationModalType === "org-district"
                        ? "Organisation District"
                        : locationModalType === "mandalam"
                        ? "Mandalam"
                        : locationModalType === "area"
                        ? "Area"
                        : "Booth"
                    }`,
                    `പുതിയ ${
                      locationModalType === "org-levels"
                        ? "സംഘടനാ തലം"
                        : locationModalType === "region"
                        ? "മേഖല"
                        : locationModalType === "org-district"
                        ? "സംഘടനാ ജില്ല"
                        : locationModalType === "mandalam"
                        ? "മണ്ഡലം"
                        : locationModalType === "area"
                        ? "ഏരിയ"
                        : "ബൂത്ത്"
                    } സൃഷ്ടിക്കുക`,
                  )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {tr(
                "Enter details for this location entry below.",
                "ഈ ലൊക്കേഷൻ എൻട്രിയുടെ വിവരങ്ങൾ താഴെ നൽകുക.",
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveLocationItem} className="space-y-4 py-2 text-xs">
            {locationModalType === "booth" && (
              <div className="space-y-1.5">
                <label className="block font-bold text-foreground">{tr("Booth Number", "ബൂത്ത് നമ്പർ")}</label>
                <input
                  type="text"
                  value={locationForm.number}
                  onChange={(e) => setLocationForm((p) => ({ ...p, number: e.target.value }))}
                  placeholder="e.g. Booth 104"
                  className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none dark:bg-zinc-800"
                />
              </div>
            )}

            {locationModalType === "org-levels" ? (
              <>
                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Level Name", "തലം പേര്")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={locationForm.name}
                    onChange={(e) => setLocationForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Sub-District / Sector"
                    required
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none dark:bg-zinc-800"
                  />
                  {locationOrgLevels.some(
                    (lvl) =>
                      lvl.id !== editingLocationItem?.id &&
                      lvl.name.trim().toLowerCase() === locationForm.name.trim().toLowerCase() &&
                      locationForm.name.trim().length > 0
                  ) && (
                    <p className="text-[11px] font-semibold text-destructive">
                      {tr("Level Name already exists in the organization hierarchy", "ഈ പേരിൽ ഒരു തലം നിലവിലുണ്ട്")}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Scope", "പരിധി")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.scope}
                    onChange={(e) => setLocationForm((p) => ({ ...p, scope: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    <option value="Statewide">{tr("Statewide", "സംസ്ഥാനതലം")}</option>
                    <option value="Regional">{tr("Regional", "മേഖലാതലം")}</option>
                    <option value="District">{tr("District", "ജില്ലാതലം")}</option>
                    <option value="Local">{tr("Local", "പ്രാദേശികതലം")}</option>
                    <option value="Booth Level">{tr("Booth Level", "ബൂത്ത് തലം")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Hierarchy Position", "ഹയരാർക്കി സ്ഥാനം")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.hierarchyPos}
                    onChange={(e) => setLocationForm((p) => ({ ...p, hierarchyPos: Number(e.target.value) }))}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    <option value={0}>
                      {tr("1. At Top (Above ", "1. ഉയർന്ന തലത്തിൽ (")}
                      {locationOrgLevels[0]?.name || "State"}
                      {tr(")", ")")}
                    </option>
                    {locationOrgLevels.map((lvl, idx) => {
                      const nextLvl = locationOrgLevels[idx + 1];
                      if (nextLvl) {
                        return (
                          <option key={lvl.id} value={idx + 1}>
                            {idx + 2}. {tr("Insert Between ", "ഇടയിൽ ചേർക്കുക: ")}
                            {lvl.name} {tr("and ", "മറ്റും ")}
                            {nextLvl.name}
                          </option>
                        );
                      }
                      return (
                        <option key={lvl.id} value={idx + 1}>
                          {idx + 2}. {tr("At Bottom (Below ", "താഴെ തലത്തിൽ (")}
                          {lvl.name}
                          {tr(")", ")")}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {(() => {
                  const pos = Number(locationForm.hierarchyPos ?? locationOrgLevels.length);
                  const parentLevel = pos > 0 ? locationOrgLevels[pos - 1]?.name : null;
                  const childLevel = pos < locationOrgLevels.length ? locationOrgLevels[pos]?.name : null;
                  return (
                    <div className="rounded-lg border border-border bg-zinc-50 dark:bg-zinc-800/50 p-3 space-y-2">
                      <div className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider">
                        {tr("Hierarchy Preview", "ഹയരാർക്കി പ്രിവ്യൂ")}
                      </div>
                      <div className="flex items-center gap-2 text-xs flex-wrap font-semibold">
                        <span className="px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-border text-muted-foreground">
                          {parentLevel ? parentLevel : tr("Top Level (Root)", "ഉയർന്ന തലം")}
                        </span>
                        <span className="text-primary font-bold">→</span>
                        <span className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold shadow-none">
                          {locationForm.name.trim() || tr("New Level", "പുതിയ തലം")}
                          <span className="ml-1.5 text-[10px] opacity-80">({locationForm.scope})</span>
                        </span>
                        <span className="text-primary font-bold">→</span>
                        <span className="px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-border text-muted-foreground">
                          {childLevel ? childLevel : tr("Bottom Level (End)", "താഴ്ന്ന തലം")}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground pt-1 flex justify-between border-t border-border/50">
                        <span>
                          {tr("Parent Level", "രക്ഷിതാവ് തലം")}: <strong>{parentLevel || tr("None (Root)", "ഒന്നുമില്ല")}</strong>
                        </span>
                        <span>
                          {tr("Child Level", "കീഴ് തലം")}: <strong>{childLevel || tr("None (Terminal)", "ഒന്നുമില്ല")}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {tr("Hierarchy Mapping Protection", "മാപ്പിംഗ് സംരക്ഷണ അറിയിപ്പ്")}
                  </div>
                  <p>
                    {tr(
                      "Saving will insert the new level into the organizational hierarchy. Existing location records, users, roles, permissions, and hierarchy relationships will be preserved.",
                      "രൂപീകരണം നടത്തുമ്പോൾ നിലവിലുള്ള എല്ലാ ലൊക്കേഷൻ വിവരങ്ങളും ഉപയോക്താക്കളെയും റോളുകളെയും അനുമതികളെയും സംരക്ഷിക്കും."
                    )}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">{tr("Name (English)", "പേര് (ഇംഗ്ലീഷ്)")} <span className="text-destructive">*</span></label>
                  <input
                    type="text"
                    value={locationForm.name}
                    onChange={(e) => setLocationForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. South Region / Nemom"
                    required
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none dark:bg-zinc-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">{tr("Name (Malayalam)", "പേര് (മലയാളം)")}</label>
                  <input
                    type="text"
                    value={locationForm.nameMl}
                    onChange={(e) => setLocationForm((p) => ({ ...p, nameMl: e.target.value }))}
                    placeholder="e.g. നെമവും"
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none dark:bg-zinc-800"
                  />
                </div>
              </>
            )}

            {locationModalType === "region" && (
              <div className="space-y-1.5">
                <label className="block font-bold text-foreground">{tr("Scope", "പരിധി")}</label>
                <input
                  type="text"
                  value={locationForm.scope}
                  onChange={(e) => setLocationForm((p) => ({ ...p, scope: e.target.value }))}
                  placeholder={tr("e.g. 10 Organisational Districts (48 Mandalams)", "ഉദാ. 10 സംഘടനാ ജില്ലകൾ (48 മണ്ഡലങ്ങൾ)")}
                  className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none dark:bg-zinc-800"
                />
              </div>
            )}

            {locationModalType === "org-district" && (
              <div className="space-y-1.5">
                <label className="block font-bold text-foreground">
                  {tr("Region", "മേഖല")} <span className="text-destructive">*</span>
                </label>
                <select
                  value={locationForm.region}
                  onChange={(e) => setLocationForm((p) => ({ ...p, region: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                >
                  <option value="North">{tr("Northern Region", "വടക്കൻ മേഖല")}</option>
                  <option value="Central">{tr("Central Region", "മധ്യ മേഖല")}</option>
                  <option value="South">{tr("Southern Region", "തെക്കൻ മേഖല")}</option>
                </select>
              </div>
            )}

            {locationModalType === "mandalam" && (
              <>
                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Region", "മേഖല")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.region}
                    onChange={(e) => {
                      const newRegion = e.target.value;
                      const defaultOrgDistrict =
                        newRegion === "North"
                          ? "Kasaragod"
                          : newRegion === "Central"
                          ? "Palakkad East"
                          : "Alappuzha North";
                      setLocationForm((p) => ({
                        ...p,
                        region: newRegion,
                        orgDistrict: defaultOrgDistrict,
                      }));
                    }}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    <option value="North">{tr("Northern Region", "വടക്കൻ മേഖല")}</option>
                    <option value="Central">{tr("Central Region", "മധ്യ മേഖല")}</option>
                    <option value="South">{tr("Southern Region", "തെക്കൻ മേഖല")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Organisation District", "സംഘടനാ ജില്ല")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.orgDistrict}
                    onChange={(e) => setLocationForm((p) => ({ ...p, orgDistrict: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    {(locationForm.region === "North"
                      ? [
                          "Kasaragod",
                          "Kannur North",
                          "Kannur South",
                          "Wayanad",
                          "Kozhikode City",
                          "Kozhikode North",
                          "Kozhikode Rural",
                          "Malappuram Central",
                          "Malappuram East",
                          "Malappuram West",
                        ]
                      : locationForm.region === "Central"
                      ? [
                          "Palakkad East",
                          "Palakkad West",
                          "Thrissur City",
                          "Thrissur North",
                          "Thrissur South",
                          "Ernakulam City",
                          "Ernakulam North",
                          "Ernakulam East",
                          "Idukki North",
                          "Idukki South",
                          "Kottayam East",
                          "Kottayam West",
                        ]
                      : [
                          "Alappuzha North",
                          "Alappuzha South",
                          "Pathanamthitta",
                          "Kollam East",
                          "Kollam West",
                          "Thiruvananthapuram City",
                          "Thiruvananthapuram North",
                          "Thiruvananthapuram South",
                        ]
                    ).map((od) => (
                      <option key={od} value={od}>
                        {od}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {locationModalType === "area" && (
              <>
                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Region", "മേഖല")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.region}
                    onChange={(e) => {
                      const newRegion = e.target.value;
                      const defaultOrgDistrict =
                        newRegion === "North"
                          ? "Kasaragod"
                          : newRegion === "Central"
                          ? "Palakkad East"
                          : "Alappuzha North";
                      const defaultMandalam =
                        newRegion === "North"
                          ? "Manjeshwar"
                          : newRegion === "Central"
                          ? "Mannarkkad"
                          : "Aroor";
                      setLocationForm((p) => ({
                        ...p,
                        region: newRegion,
                        orgDistrict: defaultOrgDistrict,
                        mandalam: defaultMandalam,
                      }));
                    }}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    <option value="North">{tr("Northern Region", "വടക്കൻ മേഖല")}</option>
                    <option value="Central">{tr("Central Region", "മധ്യ മേഖല")}</option>
                    <option value="South">{tr("Southern Region", "തെക്കൻ മേഖല")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Organisation District", "സംഘടനാ ജില്ല")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.orgDistrict}
                    onChange={(e) => {
                      const newDistrict = e.target.value;
                      const matchingMandalam = locationMandalamsState.find(
                        (m) => (m as any).orgDistrict === newDistrict
                      );
                      setLocationForm((p) => ({
                        ...p,
                        orgDistrict: newDistrict,
                        mandalam: matchingMandalam ? matchingMandalam.name : p.mandalam,
                      }));
                    }}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    {(locationForm.region === "North"
                      ? [
                          "Kasaragod",
                          "Kannur North",
                          "Kannur South",
                          "Wayanad",
                          "Kozhikode City",
                          "Kozhikode North",
                          "Kozhikode Rural",
                          "Malappuram Central",
                          "Malappuram East",
                          "Malappuram West",
                        ]
                      : locationForm.region === "Central"
                      ? [
                          "Palakkad East",
                          "Palakkad West",
                          "Thrissur City",
                          "Thrissur North",
                          "Thrissur South",
                          "Ernakulam City",
                          "Ernakulam North",
                          "Ernakulam East",
                          "Idukki North",
                          "Idukki South",
                          "Kottayam East",
                          "Kottayam West",
                        ]
                      : [
                          "Alappuzha North",
                          "Alappuzha South",
                          "Pathanamthitta",
                          "Kollam East",
                          "Kollam West",
                          "Thiruvananthapuram City",
                          "Thiruvananthapuram North",
                          "Thiruvananthapuram South",
                        ]
                    ).map((od) => (
                      <option key={od} value={od}>
                        {od}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Mandalam", "മണ്ഡലം")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.mandalam}
                    onChange={(e) => setLocationForm((p) => ({ ...p, mandalam: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    {locationMandalamsState
                      .filter((m) => !locationForm.orgDistrict || (m as any).orgDistrict === locationForm.orgDistrict)
                      .map((m) => (
                        <option key={m.id} value={m.name}>
                          {lang === "ml" ? m.nameMl : m.name}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            )}

            {locationModalType === "booth" && (
              <>
                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Region", "മേഖല")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.region}
                    onChange={(e) => {
                      const newRegion = e.target.value;
                      const defaultOrgDistrict =
                        newRegion === "North"
                          ? "Kasaragod"
                          : newRegion === "Central"
                          ? "Palakkad East"
                          : "Alappuzha North";
                      const defaultMandalam =
                        newRegion === "North"
                          ? "Manjeshwar"
                          : newRegion === "Central"
                          ? "Mannarkkad"
                          : "Aroor";
                      const defaultArea =
                        newRegion === "North"
                          ? "Manjeshwar Central"
                          : newRegion === "Central"
                          ? "Mannarkkad Central"
                          : "Aroor Central";
                      setLocationForm((p) => ({
                        ...p,
                        region: newRegion,
                        orgDistrict: defaultOrgDistrict,
                        mandalam: defaultMandalam,
                        area: defaultArea,
                      }));
                    }}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    <option value="North">{tr("Northern Region", "വടക്കൻ മേഖല")}</option>
                    <option value="Central">{tr("Central Region", "മധ്യ മേഖല")}</option>
                    <option value="South">{tr("Southern Region", "തെക്കൻ മേഖല")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Organisation District", "സംഘടനാ ജില്ല")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.orgDistrict}
                    onChange={(e) => {
                      const newDistrict = e.target.value;
                      const matchingMandalam = locationMandalamsState.find(
                        (m) => (m as any).orgDistrict === newDistrict
                      );
                      const mandalamName = matchingMandalam ? matchingMandalam.name : "Manjeshwar";
                      const matchingArea = locationAreasState.find(
                        (a) => (a as any).mandalam === mandalamName
                      );
                      setLocationForm((p) => ({
                        ...p,
                        orgDistrict: newDistrict,
                        mandalam: mandalamName,
                        area: matchingArea ? matchingArea.name : p.area,
                      }));
                    }}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    {(locationForm.region === "North"
                      ? [
                          "Kasaragod",
                          "Kannur North",
                          "Kannur South",
                          "Wayanad",
                          "Kozhikode City",
                          "Kozhikode North",
                          "Kozhikode Rural",
                          "Malappuram Central",
                          "Malappuram East",
                          "Malappuram West",
                        ]
                      : locationForm.region === "Central"
                      ? [
                          "Palakkad East",
                          "Palakkad West",
                          "Thrissur City",
                          "Thrissur North",
                          "Thrissur South",
                          "Ernakulam City",
                          "Ernakulam North",
                          "Ernakulam East",
                          "Idukki North",
                          "Idukki South",
                          "Kottayam East",
                          "Kottayam West",
                        ]
                      : [
                          "Alappuzha North",
                          "Alappuzha South",
                          "Pathanamthitta",
                          "Kollam East",
                          "Kollam West",
                          "Thiruvananthapuram City",
                          "Thiruvananthapuram North",
                          "Thiruvananthapuram South",
                        ]
                    ).map((od) => (
                      <option key={od} value={od}>
                        {od}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Mandalam", "മണ്ഡലം")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.mandalam}
                    onChange={(e) => {
                      const newMandalam = e.target.value;
                      const matchingArea = locationAreasState.find(
                        (a) => (a as any).mandalam === newMandalam
                      );
                      setLocationForm((p) => ({
                        ...p,
                        mandalam: newMandalam,
                        area: matchingArea ? matchingArea.name : p.area,
                      }));
                    }}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    {locationMandalamsState
                      .filter((m) => !locationForm.orgDistrict || (m as any).orgDistrict === locationForm.orgDistrict)
                      .map((m) => (
                        <option key={m.id} value={m.name}>
                          {lang === "ml" ? m.nameMl : m.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground">
                    {tr("Area / Kendra", "ഏരിയ / കേന്ദ്രം")} <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={locationForm.area}
                    onChange={(e) => setLocationForm((p) => ({ ...p, area: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer text-xs dark:bg-zinc-800"
                  >
                    {locationAreasState
                      .filter((a) => !locationForm.mandalam || (a as any).mandalam === locationForm.mandalam)
                      .map((a) => (
                        <option key={a.id} value={a.name}>
                          {lang === "ml" ? a.nameMl : a.name}
                        </option>
                      ))}
                    {locationAreasState.filter((a) => !locationForm.mandalam || (a as any).mandalam === locationForm.mandalam).length === 0 && (
                      <option value={locationForm.area || "General Area"}>
                        {locationForm.area || "General Area"}
                      </option>
                    )}
                  </select>
                </div>
              </>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocationModalOpen(false)}
                className="h-9 text-xs font-bold cursor-pointer shadow-none border-border bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                {tr("Cancel", "റദ്ദാക്കുക")}
              </Button>
              <Button
                type="submit"
                className="h-9 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-none"
              >
                {editingLocationItem ? tr("Save Changes", "മാറ്റങ്ങൾ സംരക്ഷിക്കുക") : tr("Create Entry", "എൻട്രി സൃഷ്ടിക്കുക")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              <MoreVertical className="h-4 w-4" />
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
