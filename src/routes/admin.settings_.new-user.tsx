import { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  FileText,
  Headset,
  Plus,
  ShieldCheck,
  UserRound,
  Users,
  Users2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import { permissionModules, type PermissionModuleId } from "@/data/party-workers";
import {
  dataAccessOptions,
  loadCustomOrganisationLevels,
  loadManagedRoles,
  scopedPermissionKey,
  type DataAccessScope,
} from "@/data/role-management";
import {
  loadManagedDesktopUsers,
  saveManagedDesktopUsers,
  type ManagedUser,
} from "@/components/admin/RoleAccessSettings";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings_/new-user")({
  validateSearch: (search: Record<string, unknown>) => ({
    editUserId: typeof search.editUserId === "string" ? search.editUserId : undefined,
  }),
  head: () => ({
    meta: [{ title: "Create / Edit User · Admin · Vikasita Keralam" }],
  }),
  component: CreateUserPage,
});

const moduleIcons: Record<PermissionModuleId, LucideIcon> = {
  schemes: FileText,
  party_workers: Users,
  applications: ClipboardList,
  help_desk: Headset,
  applicant_profile: UserRound,
  roles: ShieldCheck,
  designations: Users2,
};

type MatrixColumnId = "create" | "view" | "edit" | "delete" | "view_teams" | "assign" | "respond";

interface MatrixColumn {
  id: MatrixColumnId;
  actionIds: readonly string[];
  en: string;
  ml: string;
}

const primaryMatrixColumns: readonly MatrixColumn[] = [
  { id: "create", actionIds: ["create"], en: "Create", ml: "സൃഷ്ടിക്കുക" },
  { id: "view", actionIds: ["view", "view_list", "view_details"], en: "View", ml: "കാണുക" },
  { id: "edit", actionIds: ["edit"], en: "Edit", ml: "തിരുത്തുക" },
  { id: "delete", actionIds: ["delete"], en: "Delete", ml: "നീക്കം ചെയ്യുക" },
];

const secondaryMatrixColumns: readonly MatrixColumn[] = [
  { id: "view", actionIds: ["view", "view_list", "view_details"], en: "View", ml: "കാണുക" },
  { id: "assign", actionIds: ["assign"], en: "Assign", ml: "അസൈൻ ചെയ്യുക" },
  { id: "respond", actionIds: ["respond"], en: "Respond", ml: "മറുപടി നൽകുക" },
];

const primaryMatrixGridClass = "grid grid-cols-[minmax(200px,1fr)_repeat(4,84px)_360px]";
const secondaryMatrixGridClass = "grid grid-cols-[minmax(200px,1fr)_repeat(3,104px)_360px]";

const dataAccessChoices = dataAccessOptions.filter((option) => option.id !== "above_level");

interface MatrixRow {
  key: string;
  moduleId: PermissionModuleId;
  en: string;
  ml: string;
  icon: LucideIcon;
  columns: readonly MatrixColumn[];
  actionIdsByColumn?: Partial<Record<MatrixColumnId, readonly string[]>>;
}

const primaryMatrixRows: MatrixRow[] = permissionModules
  .filter((module) => module.id !== "help_desk")
  .map((module) => ({
    key: module.id,
    moduleId: module.id,
    en: module.en,
    ml: module.ml,
    icon: moduleIcons[module.id],
    columns: primaryMatrixColumns,
  }));

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

function getMatrixColumnActionIds(row: MatrixRow, columnId: MatrixColumnId) {
  const column = row.columns.find((item) => item.id === columnId);
  if (!column) return [];
  const override = row.actionIdsByColumn?.[columnId];
  if (override) return [...override];
  const module = permissionModules.find((item) => item.id === row.moduleId);
  return column.actionIds.filter((actionId) =>
    module?.actions.some((action) => action.id === actionId),
  );
}

// Organisation Level Order: State, Region, Organisational District, Mandalam, Area, Booth
const ORG_LEVEL_OPTIONS = [
  { id: "State", en: "State", ml: "സംസ്ഥാനം" },
  { id: "Region", en: "Region", ml: "റീജിയൻ" },
  { id: "Organisational District", en: "Organisational District", ml: "സംഘടനാ ജില്ല" },
  { id: "Mandalam", en: "Mandalam", ml: "മണ്ഡലം" },
  { id: "Area", en: "Area", ml: "ഏരിയ" },
  { id: "Booth", en: "Booth", ml: "ബൂത്ത്" },
];

const DEFAULT_ROLE_SELECTIONS = [
  "None",
  "Admin",
  "Sub Admin",
  "Support Admin",
  "Other Specific Role",
];

export const DESIGNATIONS_BY_ORG_LEVEL: Record<string, string[]> = {
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

export function getOrgLevelForDesignation(desig: string): string {
  if (!desig) return "";
  const clean = desig.toLowerCase().trim();
  for (const [level, list] of Object.entries(DESIGNATIONS_BY_ORG_LEVEL)) {
    if (list.some((item) => item.toLowerCase() === clean)) {
      return level;
    }
  }
  if (clean.includes("state")) return "State";
  if (clean.includes("region") || clean.includes("cluster")) return "Region";
  if (clean.includes("district")) return "Organisational District";
  if (clean.includes("mandalam")) return "Mandalam";
  if (clean.includes("kendra") || clean.includes("area")) return "Area";
  if (clean.includes("booth")) return "Booth";
  return "";
}

// Role Level Dropdown Options: State, Region, Organisational District, Mandalam, Area, Booth
const ROLE_LEVEL_OPTIONS = [
  { id: "State", en: "State", ml: "സംസ്ഥാനം" },
  { id: "Region", en: "Region", ml: "റീജിയൻ" },
  { id: "Organisational District", en: "Organisational District", ml: "സംഘടനാ ജില്ല" },
  { id: "Mandalam", en: "Mandalam", ml: "മണ്ഡലം" },
  { id: "Area", en: "Area", ml: "ഏരിയ" },
  { id: "Booth", en: "Booth", ml: "ബൂത്ത്" },
];

// Master Options & Dependencies
const REGION_OPTIONS = [
  { id: "South Region", en: "South Region", ml: "സൗത്ത് റീജിയൻ" },
  { id: "Central Region", en: "Central Region", ml: "സെൻട്രൽ റീജിയൻ" },
  { id: "North Region", en: "North Region", ml: "നോർത്ത് റീജിയൻ" },
];

const ORG_DISTRICTS_BY_REGION: Record<string, { id: string; en: string; ml: string }[]> = {
  "South Region": [
    { id: "Thiruvananthapuram City", en: "Thiruvananthapuram City", ml: "തിരുവനന്തപുരം സിറ്റി" },
    { id: "Thiruvananthapuram North", en: "Thiruvananthapuram North", ml: "തിരുവനന്തപുരം നോർത്ത്" },
    { id: "Thiruvananthapuram South", en: "Thiruvananthapuram South", ml: "തിരുവനന്തപുരം സൗത്ത്" },
    { id: "Kollam East", en: "Kollam East", ml: "കൊല്ലം ഈസ്റ്റ്" },
    { id: "Kollam West", en: "Kollam West", ml: "കൊല്ലം വെസ്റ്റ്" },
    { id: "Pathanamthitta", en: "Pathanamthitta", ml: "പത്തനംതിട്ട" },
  ],
  "Central Region": [
    { id: "Alappuzha North", en: "Alappuzha North", ml: "ആലപ്പുഴ നോർത്ത്" },
    { id: "Alappuzha South", en: "Alappuzha South", ml: "ആലപ്പുഴ സൗത്ത്" },
    { id: "Kottayam Central", en: "Kottayam Central", ml: "കോട്ടയം സെൻട്രൽ" },
    { id: "Idukki Highrange", en: "Idukki Highrange", ml: "ഇടുക്കി ഹൈറേഞ്ച്" },
    { id: "Ernakulam City", en: "Ernakulam City", ml: "എറണാകുളം സിറ്റി" },
    { id: "Ernakulam North", en: "Ernakulam North", ml: "എറണാകുളം നോർത്ത്" },
  ],
  "North Region": [
    { id: "Thrissur City", en: "Thrissur City", ml: "തൃശ്ശൂർ സിറ്റി" },
    { id: "Palakkad East", en: "Palakkad East", ml: "പാലക്കാട് ഈസ്റ്റ്" },
    { id: "Malappuram Central", en: "Malappuram Central", ml: "മലപ്പുറം സെൻട്രൽ" },
    { id: "Kozhikode City", en: "Kozhikode City", ml: "കോഴിക്കോട് സിറ്റി" },
    { id: "Wayanad", en: "Wayanad", ml: "വയനാട്" },
    { id: "Kannur North", en: "Kannur North", ml: "കണ്ണൂർ നോർത്ത്" },
    { id: "Kasaragod", en: "Kasaragod", ml: "കാസർഗോഡ്" },
  ],
};

const MANDALAMS_BY_ORG_DISTRICT: Record<string, string[]> = {
  "Thiruvananthapuram City": [
    "Trivandrum Central Mandalam",
    "Kazhakkoottam Mandalam",
    "Vattiyoorkavu Mandalam",
    "Nemom Mandalam",
  ],
  "Thiruvananthapuram North": ["Attingal Mandalam", "Varkala Mandalam", "Nedumangad Mandalam"],
  "Thiruvananthapuram South": ["Neyyattinkara Mandalam", "Parassala Mandalam", "Kovalam Mandalam"],
  "Kollam East": ["Kollam Mandalam", "Eravipuram Mandalam", "Chathannoor Mandalam"],
  "Kollam West": ["Karunagappally Mandalam", "Chavara Mandalam", "Kunnathur Mandalam"],
  Pathanamthitta: ["Ranni Mandalam", "Aranmula Mandalam", "Konni Mandalam"],
  "Alappuzha North": ["Cherthala Mandalam", "Alappuzha Mandalam", "Ambalappuzha Mandalam"],
  "Alappuzha South": ["Kayamkulam Mandalam", "Haripad Mandalam", "Mavelikkara Mandalam"],
  "Kottayam Central": ["Kottayam Mandalam", "Ettumanoor Mandalam", "Puthuppally Mandalam"],
  "Idukki Highrange": ["Thodupuzha Mandalam", "Devikulam Mandalam", "Idukki Mandalam"],
  "Ernakulam City": ["Ernakulam Mandalam", "Kochi Mandalam", "Thrippunithura Mandalam"],
  "Ernakulam North": ["Aluva Mandalam", "Angamaly Mandalam", "Paravur Mandalam"],
  "Thrissur City": ["Thrissur Mandalam", "Ollur Mandalam", "Ayyanthole Mandalam"],
  "Thrissur North": ["Kunnamkulam Mandalam", "Guruvayur Mandalam", "Chelakkara Mandalam"],
  "Thrissur South": ["Kodungallur Mandalam", "Irinjalakuda Mandalam", "Chalakudy Mandalam"],
  "Palakkad East": ["Palakkad Mandalam", "Malampuzha Mandalam", "Chittur Mandalam"],
  "Palakkad West": ["Ottapalam Mandalam", "Shoranur Mandalam", "Pattambi Mandalam"],
  "Malappuram Central": ["Malappuram Mandalam", "Manjeri Mandalam", "Perinthalmanna Mandalam"],
  "Malappuram East": ["Nilambur Mandalam", "Wandoor Mandalam", "Eranad Mandalam"],
  "Malappuram West": ["Tirur Mandalam", "Ponnani Mandalam", "Kottakkal Mandalam"],
  "Kozhikode City": ["Kozhikode South Mandalam", "Kozhikode North Mandalam", "Elathur Mandalam"],
  "Kozhikode North": ["Beypore Mandalam", "Kunnamangalam Mandalam", "Koduvally Mandalam"],
  "Kozhikode Rural": ["Feroke Mandalam", "Vadakara Mandalam", "Koyilandy Mandalam"],
  Wayanad: ["Kalpetta Mandalam", "Mananthavady Mandalam", "Sulthan Bathery Mandalam"],
  "Kannur North": ["Payyannur Mandalam", "Kalliasseri Mandalam", "Taliparamba Mandalam"],
  "Kannur South": ["Kannur Mandalam", "Thalassery Mandalam", "Mattannur Mandalam"],
  Kasaragod: ["Kasaragod Mandalam", "Kanhangad Mandalam", "Manjeshwaram Mandalam"],
};

const AREAS_BY_MANDALAM: Record<string, string[]> = {
  "Trivandrum Central Mandalam": ["Pattom", "Palayam", "Statue", "Thampanoor"],
  "Kazhakkoottam Mandalam": ["Kazhakkoottam", "Sreekaryam", "Technopark", "Kariavattom"],
  "Vattiyoorkavu Mandalam": ["Vattiyoorkavu", "Kowdiar", "Sasthamangalam", "Peroorkada"],
  "Nemom Mandalam": ["Nemom", "Karamana", "Pravachambalam", "Pappanamcode"],
  "Ernakulam Mandalam": ["Edappally", "Palarivattom", "Vyttila", "Kakkanad"],
  "Thrissur Mandalam": ["Punkunnam", "Ollur", "Ayyanthole", "Mannuthy"],
  "Kozhikode South Mandalam": ["Nadakkavu", "Beypore", "Feroke", "Kunnamangalam"],
};

const DEFAULT_BOOTHS = [
  "Booth 01",
  "Booth 02",
  "Booth 03",
  "Booth 04",
  "Booth 05",
  "Booth 06",
  "Booth 07",
  "Booth 08",
  "Booth 09",
  "Booth 10",
];

function CreateUserPage() {
  const { lang } = useLang();
  const { isMobile, state: sidebarState } = useSidebar();
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const navigate = useNavigate();
  const { editUserId } = Route.useSearch();

  // User details state
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [orgLevel, setOrgLevel] = useState("");
  const [designation, setDesignation] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("None");
  const [roleLevel, setRoleLevel] = useState("State");

  // Custom organisation levels loaded from local storage/data
  const [customOrgLevels, setCustomOrgLevels] = useState(() => loadCustomOrganisationLevels());

  const saveFormDraftToSession = () => {
    if (typeof window === "undefined") return;
    const draftData = {
      fullName,
      mobile,
      orgLevel,
      designation,
      selectedRoleName,
      roleLevel,
      selectedRegion,
      selectedOrgDistrict,
      selectedMandalam,
      selectedArea,
      selectedBooth,
    };
    sessionStorage.setItem("vk_user_form_draft", JSON.stringify(draftData));
  };

  // Restoration effect after returning from creation pages
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedDraft = sessionStorage.getItem("vk_user_form_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.mobile) setMobile(parsed.mobile);
        if (parsed.orgLevel) setOrgLevel(parsed.orgLevel);
        if (parsed.designation) setDesignation(parsed.designation);
        if (parsed.selectedRoleName) setSelectedRoleName(parsed.selectedRoleName);
        if (parsed.roleLevel) setRoleLevel(parsed.roleLevel);
        if (parsed.selectedRegion) setSelectedRegion(parsed.selectedRegion);
        if (parsed.selectedOrgDistrict) setSelectedOrgDistrict(parsed.selectedOrgDistrict);
        if (parsed.selectedMandalam) setSelectedMandalam(parsed.selectedMandalam);
        if (parsed.selectedArea) setSelectedArea(parsed.selectedArea);
        if (parsed.selectedBooth) setSelectedBooth(parsed.selectedBooth);
      } catch {
        // ignore
      }
      sessionStorage.removeItem("vk_user_form_draft");
    }

    const newRole = sessionStorage.getItem("vk_newly_created_role");
    if (newRole) {
      setSelectedRoleName(newRole);
      sessionStorage.removeItem("vk_newly_created_role");
      toast.success(tr(`Role "${newRole}" created and selected.`, `"${newRole}" റോൾ സൃഷ്ടിച്ച് തിരഞ്ഞെടുത്തു.`));
    }

    const newDesignation = sessionStorage.getItem("vk_newly_created_designation");
    if (newDesignation) {
      setDesignation(newDesignation);
      sessionStorage.removeItem("vk_newly_created_designation");
      toast.success(
        tr(`Designation "${newDesignation}" created and selected.`, `"${newDesignation}" തസ്തിക സൃഷ്ടിച്ച് തിരഞ്ഞെടുത്തു.`),
      );
    }

    const newOrgLevel = sessionStorage.getItem("vk_newly_created_org_level");
    if (newOrgLevel) {
      setOrgLevel(newOrgLevel);
      setCustomOrgLevels(loadCustomOrganisationLevels());
      sessionStorage.removeItem("vk_newly_created_org_level");
      toast.success(
        tr(
          `Organisation Level "${newOrgLevel}" created and selected.`,
          `"${newOrgLevel}" സംഘടനാ തലം സൃഷ്ടിച്ച് തിരഞ്ഞെടുത്തു.`,
        ),
      );
    }
  }, []);

  // Custom designations state
  const [customDesignations, setCustomDesignations] = useState<Record<string, string[]>>({});
  const [newDesignationInput, setNewDesignationInput] = useState("");
  const [showAddDesignationPopover, setShowAddDesignationPopover] = useState(false);

  const activeDesignations = useMemo(() => {
    if (!orgLevel) return [];
    const base = DESIGNATIONS_BY_ORG_LEVEL[orgLevel] || [];
    const custom = customDesignations[orgLevel] || [];
    return Array.from(new Set([...base, ...custom]));
  }, [orgLevel, customDesignations]);

  const handleAddCustomDesignation = () => {
    if (!orgLevel) {
      toast.error(tr("Please select Organisation Level first.", "ആദ്യം സംഘടനാ തലം തിരഞ്ഞെടുക്കുക."));
      return;
    }
    const name = newDesignationInput.trim();
    if (!name) return;

    setCustomDesignations((prev) => ({
      ...prev,
      [orgLevel]: [...(prev[orgLevel] || []), name],
    }));
    setDesignation(name);
    setNewDesignationInput("");
    setShowAddDesignationPopover(false);
    if (errors.designation) setErrors((prev) => ({ ...prev, designation: "" }));
    toast.success(tr(`Designation "${name}" created.`, `തസ്തിക "${name}" സൃഷ്ടിച്ചു.`));
  };

  const handleOrgLevelChange = (newLevel: string) => {
    setOrgLevel(newLevel);
    setDesignation("");
    if (errors.orgLevel) setErrors((prev) => ({ ...prev, orgLevel: "" }));
    if (errors.designation) setErrors((prev) => ({ ...prev, designation: "" }));
  };

  // Organisation Hierarchy dependent state
  const [selectedRegion, setSelectedRegion] = useState("South Region");
  const [selectedOrgDistrict, setSelectedOrgDistrict] = useState("Thiruvananthapuram City");
  const [selectedMandalam, setSelectedMandalam] = useState("Trivandrum Central Mandalam");
  const [selectedArea, setSelectedArea] = useState("Pattom");
  const [selectedBooth, setSelectedBooth] = useState("Booth 01");

  // Options derived dynamically for dependent hierarchy
  const regionOptions = REGION_OPTIONS;

  const orgDistrictOptions = useMemo(() => {
    return ORG_DISTRICTS_BY_REGION[selectedRegion] || ORG_DISTRICTS_BY_REGION["South Region"];
  }, [selectedRegion]);

  const mandalamOptions = useMemo(() => {
    return MANDALAMS_BY_ORG_DISTRICT[selectedOrgDistrict] || [`${selectedOrgDistrict} Mandalam`];
  }, [selectedOrgDistrict]);

  const areaOptions = useMemo(() => {
    if (AREAS_BY_MANDALAM[selectedMandalam]) {
      return AREAS_BY_MANDALAM[selectedMandalam];
    }
    const cleanBase = selectedMandalam.replace(/\s+Mandalam$/i, "");
    return [`${cleanBase} Central`, `${cleanBase} North`, `${cleanBase} South`];
  }, [selectedMandalam]);

  const boothOptions = DEFAULT_BOOTHS;

  // Handlers for dependent dropdown changes
  const handleRegionChange = (regionVal: string) => {
    setSelectedRegion(regionVal);
    const orgDists = ORG_DISTRICTS_BY_REGION[regionVal] || [];
    const nextOrgDistrict = orgDists[0]?.id || "Thiruvananthapuram City";
    setSelectedOrgDistrict(nextOrgDistrict);

    const mandalams = MANDALAMS_BY_ORG_DISTRICT[nextOrgDistrict] || [`${nextOrgDistrict} Mandalam`];
    const nextMandalam = mandalams[0];
    setSelectedMandalam(nextMandalam);

    const areas = AREAS_BY_MANDALAM[nextMandalam] || [`${nextMandalam.replace(/\s+Mandalam$/i, "")} Central`];
    setSelectedArea(areas[0]);
    setSelectedBooth("Booth 01");
  };

  const handleOrgDistrictChange = (orgDistVal: string) => {
    setSelectedOrgDistrict(orgDistVal);
    const mandalams = MANDALAMS_BY_ORG_DISTRICT[orgDistVal] || [`${orgDistVal} Mandalam`];
    const nextMandalam = mandalams[0];
    setSelectedMandalam(nextMandalam);

    const areas = AREAS_BY_MANDALAM[nextMandalam] || [`${nextMandalam.replace(/\s+Mandalam$/i, "")} Central`];
    setSelectedArea(areas[0]);
    setSelectedBooth("Booth 01");
  };

  const handleMandalamChange = (mandalamVal: string) => {
    setSelectedMandalam(mandalamVal);
    const areas = AREAS_BY_MANDALAM[mandalamVal] || [`${mandalamVal.replace(/\s+Mandalam$/i, "")} Central`];
    setSelectedArea(areas[0]);
    setSelectedBooth("Booth 01");
  };

  const handleAreaChange = (areaVal: string) => {
    setSelectedArea(areaVal);
    setSelectedBooth("Booth 01");
  };

  // Visibility logic based on Organisation Level
  const showRegion = ["Region", "Organisational District", "Mandalam", "Area", "Booth"].includes(orgLevel);
  const showOrgDistrict = ["Organisational District", "Mandalam", "Area", "Booth"].includes(orgLevel);
  const showMandalam = ["Mandalam", "Area", "Booth"].includes(orgLevel);
  const showArea = ["Area", "Booth"].includes(orgLevel);
  const showBooth = ["Booth"].includes(orgLevel);

  // Permission Matrix State
  const [scopedPermissions, setScopedPermissions] = useState<string[]>([]);
  const [moduleDataAccess, setModuleDataAccess] = useState<
    Partial<Record<PermissionModuleId, DataAccessScope[]>>
  >(() =>
    Object.fromEntries(
      permissionModules.map((module) => [module.id, ["own_records"] as DataAccessScope[]]),
    ),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableRoleNames = useMemo(() => {
    const customRoles = loadManagedRoles()
      .filter((r) => !r.system)
      .map((r) => r.name);
    const combined = [...DEFAULT_ROLE_SELECTIONS, ...customRoles];
    if (selectedRoleName && !combined.includes(selectedRoleName)) {
      combined.push(selectedRoleName);
    }
    return Array.from(new Set(combined.filter(Boolean)));
  }, [selectedRoleName]);

  // Pre-populate when editing an existing user
  useEffect(() => {
    if (!editUserId) return;
    const desktopUsers = loadManagedDesktopUsers();
    const existing = desktopUsers.find((u) => u.id === editUserId);
    if (!existing) return;

    setFullName(existing.name || "");
    setMobile(existing.mobile || "");
    const existingDesig = existing.designationEn || "";
    const level =
      existing.orgLevel || getOrgLevelForDesignation(existingDesig) || "Organisational District";
    setOrgLevel(level);
    setDesignation(existingDesig);
    setSelectedRoleName(
      existing.assignedRole === "Unassigned" || !existing.assignedRole ? "None" : existing.assignedRole,
    );
    if (existing.regionEn) setSelectedRegion(existing.regionEn);
    if (existing.districtNameEn) setSelectedOrgDistrict(existing.districtNameEn);
    if (existing.mandalamEn) setSelectedMandalam(existing.mandalamEn);
    if (existing.areaEn) setSelectedArea(existing.areaEn);
    if (existing.boothEn) setSelectedBooth(existing.boothEn);
  }, [editUserId]);

  // When role selection changes
  useEffect(() => {
    if (!selectedRoleName) return;
    if (
      selectedRoleName === "None" ||
      selectedRoleName === "Other Specific Role" ||
      selectedRoleName === "Unassigned"
    ) {
      // Clear permissions for None / Unassigned / Other Specific Role
      setScopedPermissions([]);
      return;
    }

    const roles = loadManagedRoles();
    const roleObj = roles.find(
      (r) => r.name.trim().toLowerCase() === selectedRoleName.trim().toLowerCase(),
    );
    if (!roleObj) return;

    if (roleObj.scopedPermissions && roleObj.scopedPermissions.length > 0) {
      setScopedPermissions(roleObj.scopedPermissions);
    } else if (roleObj.permissions && roleObj.permissions.length > 0) {
      setScopedPermissions(roleObj.permissions);
    }

    if (roleObj.dataAccess) {
      const nextDataAccess: Partial<Record<PermissionModuleId, DataAccessScope[]>> = {};
      permissionModules.forEach((m) => {
        nextDataAccess[m.id] = (roleObj.dataAccess?.[m.id] as DataAccessScope[]) || ["own_records"];
      });
      setModuleDataAccess(nextDataAccess);
    }
  }, [selectedRoleName]);

  const scopesForModule = (moduleId: PermissionModuleId): DataAccessScope[] =>
    (moduleDataAccess[moduleId] && moduleDataAccess[moduleId]!.length > 0
      ? moduleDataAccess[moduleId]!
      : ["own_records"]) as DataAccessScope[];

  const handleToggleColumn = (row: MatrixRow, columnId: MatrixColumnId) => {
    const actionIds = getMatrixColumnActionIds(row, columnId);
    if (actionIds.length === 0) return;

    const scopes = scopesForModule(row.moduleId);
    const primaryScope = scopes[0] || "own_records";

    const isChecked = actionIds.some((actionId) =>
      scopedPermissions.includes(scopedPermissionKey(row.moduleId, primaryScope, actionId)),
    );

    let next = [...scopedPermissions];
    actionIds.forEach((actionId) => {
      scopes.forEach((s) => {
        const key = scopedPermissionKey(row.moduleId, s, actionId);
        if (isChecked) {
          next = next.filter((k) => k !== key);
        } else {
          if (!next.includes(key)) {
            next.push(key);
          }
        }
      });
    });

    setScopedPermissions(next);
  };

  const isColumnChecked = (row: MatrixRow, columnId: MatrixColumnId): boolean => {
    const actionIds = getMatrixColumnActionIds(row, columnId);
    if (actionIds.length === 0) return false;

    const scopes = scopesForModule(row.moduleId);
    const primaryScope = scopes[0] || "own_records";

    return actionIds.some((actionId) =>
      scopedPermissions.includes(scopedPermissionKey(row.moduleId, primaryScope, actionId)),
    );
  };

  const isColumnDisabled = (row: MatrixRow, columnId: MatrixColumnId): boolean => {
    return getMatrixColumnActionIds(row, columnId).length === 0;
  };

  const isModuleScopeSelected = (moduleId: PermissionModuleId, scope: DataAccessScope): boolean => {
    return scopesForModule(moduleId).includes(scope);
  };

  const toggleModuleScope = (moduleId: PermissionModuleId, scope: DataAccessScope) => {
    const currentScopes = scopesForModule(moduleId);
    let nextScopes: DataAccessScope[];

    if (currentScopes.includes(scope)) {
      if (currentScopes.length === 1) return;
      nextScopes = currentScopes.filter((s) => s !== scope);
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
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      newErrors.name = tr("Full name is required.", "മുഴുവൻ പേര് നിർബന്ധമാണ്.");
    }
    if (!orgLevel) {
      newErrors.orgLevel = tr("Organisation level is required.", "സംഘടനാ തലം നിർബന്ധമാണ്.");
    }
    if (!designation) {
      newErrors.designation = tr("Designation is required.", "തസ്തിക നിർബന്ധമാണ്.");
    } else if (orgLevel && !activeDesignations.includes(designation)) {
      newErrors.designation = tr(
        "Selected designation does not belong to the selected organisation level.",
        "തിരഞ്ഞെടുത്ത തസ്തിക ലെവലിന് യോജിച്ചതല്ല.",
      );
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const desktopUsers = loadManagedDesktopUsers();
    const now = new Date().toISOString().split("T")[0];

    // If None or empty, assign as "Unassigned" for user list table display
    const finalRole =
      !selectedRoleName || selectedRoleName === "None" || selectedRoleName === "Unassigned"
        ? "Unassigned"
        : selectedRoleName;

    if (editUserId) {
      const updated = desktopUsers.map((u) =>
        u.id === editUserId
          ? {
              ...u,
              name: fullName.trim(),
              nameMl: fullName.trim(),
              mobile: mobile.trim() || u.mobile,
              orgLevel: orgLevel,
              designationEn: designation,
              designationMl: designation,
              assignedRole: finalRole,
              districtNameEn: selectedOrgDistrict,
              regionEn: selectedRegion,
              mandalamEn: selectedMandalam,
              areaEn: selectedArea,
              boothEn: selectedBooth,
              orgDistrictEn: selectedOrgDistrict,
            }
          : u,
      );
      saveManagedDesktopUsers(updated);
      toast.success(tr("User updated successfully.", "ഉപയോക്താവ് വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു."));
    } else {
      const newUser: ManagedUser = {
        id: `USR-${Date.now()}`,
        name: fullName.trim(),
        nameMl: fullName.trim(),
        category: "bjp_member",
        categoryLabelEn: "BJP Member",
        categoryLabelMl: "ബി.ജെ.പി അംഗം",
        orgLevel: orgLevel,
        designationEn: designation || "Party Member",
        designationMl: designation || "പാർട്ടി അംഗം",
        mobile: mobile.trim() || "9447000000",
        email: `${fullName.toLowerCase().replace(/\s+/g, ".")}@bjpkerala.org`,
        districtId: "tvm",
        districtNameEn: selectedOrgDistrict,
        districtNameMl: selectedOrgDistrict,
        constituencyEn: selectedMandalam,
        constituencyMl: selectedMandalam,
        status: "Active",
        joinedDate: now,
        assignedRole: finalRole,
        regionEn: selectedRegion,
        mandalamEn: selectedMandalam,
        areaEn: selectedArea,
        boothEn: selectedBooth,
        orgDistrictEn: selectedOrgDistrict,
      };
      saveManagedDesktopUsers([newUser, ...desktopUsers]);
      toast.success(tr("User created successfully.", "ഉപയോക്താവ് വിജയകരമായി ചേർത്തു."));
    }

    void navigate({ to: "/admin/settings", search: { tab: "users" } });
  };

  const renderMatrixTable = (
    rows: MatrixRow[],
    columns: readonly MatrixColumn[],
    gridClass: string,
  ) => (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <div className={cn("min-w-[700px] text-xs font-semibold", gridClass)}>
        <div className="border-b border-border bg-slate-50 p-3 font-bold text-muted-foreground uppercase">
          {tr("MODULES", "മോഡ്യൂളുകൾ")}
        </div>

        {columns.map((column) => (
          <div
            key={column.id}
            className="border-b border-l border-border bg-slate-50 p-3 text-center font-bold text-muted-foreground uppercase"
          >
            {tr(column.en, column.ml)}
          </div>
        ))}

        <div className="border-b border-l border-border bg-slate-50 p-3 font-bold text-muted-foreground uppercase">
          {tr("DATA ACCESS LEVEL", "ഡാറ്റ ആക്സസ് ലെവൽ")}
        </div>

        {rows.map((row) => {
          const Icon = row.icon;
          const selectedScopes = scopesForModule(row.moduleId);

          return (
            <div key={row.key} className="contents border-b border-border hover:bg-slate-50/50">
              <div className="flex items-center gap-2 border-t border-border p-3 font-bold text-foreground">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <span>{tr(row.en, row.ml)}</span>
              </div>

              {columns.map((column) => {
                const disabled = isColumnDisabled(row, column.id);
                const checked = isColumnChecked(row, column.id);

                return (
                  <div
                    key={`${row.key}:${column.id}`}
                    className="flex items-center justify-center border-t border-l border-border p-3"
                  >
                    {disabled ? (
                      <span className="text-muted-foreground/40">—</span>
                    ) : (
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => handleToggleColumn(row, column.id)}
                      />
                    )}
                  </div>
                );
              })}

              <div className="flex items-center border-t border-l border-border p-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 w-full items-center justify-between rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="truncate">
                        {selectedScopes
                          .map((scopeId) => {
                            const found = dataAccessOptions.find((o) => o.id === scopeId);
                            return found ? tr(found.en, found.ml) : scopeId;
                          })
                          .join(", ")}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60 ml-1" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72 p-2">
                    <p className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase">
                      {tr("Select Data Access Scope", "ഡാറ്റ ആക്സസ് ലെവൽ തിരഞ്ഞെടുക്കുക")}
                    </p>
                    <div className="space-y-1 pt-1">
                      {dataAccessChoices.map((option) => {
                        const scope = option.id as DataAccessScope;
                        const checked = isModuleScopeSelected(row.moduleId, scope);
                        return (
                          <div
                            key={option.id}
                            onClick={() => toggleModuleScope(row.moduleId, scope)}
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-md transition-colors cursor-pointer select-none",
                              checked ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted/50 text-foreground",
                            )}
                          >
                            <Checkbox checked={checked} className="pointer-events-none" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold">{tr(option.en, option.ml)}</p>
                            </div>
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
      <section className="sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5 mb-6">
        <div className="flex items-center justify-between gap-3 pb-1 sm:pb-0">
          <div className="flex items-center gap-3 sm:gap-2.5">
            <button
              type="button"
              onClick={() => void navigate({ to: "/admin/settings", search: { tab: undefined } })}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary group cursor-pointer sm:h-8 sm:w-8"
              title={tr("Back to Users & Roles", "ഉപയോക്താക്കളിലേക്ക് തിരികെ പോകുക")}
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 sm:h-3.5 sm:w-3.5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                {editUserId
                  ? tr("Edit User", "ഉപയോക്താവിനെ തിരുത്തുക")
                  : tr("Create New User", "പുതിയ ഉപയോക്താവിനെ സൃഷ്ടിക്കുക")}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {/* User Information Section */}
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-foreground flex items-center gap-2">
            <UserRound className="h-4 w-4 text-amber-500" />
            {tr("User Information", "ഉപയോക്തൃ വിവരങ്ങൾ")}
          </h2>

          {/* Row 1: Full Name, Mobile Number, Organisation Level */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                {tr("Full Name", "മുഴുവൻ പേര്")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={tr("e.g. Anand V. Nair", "ഉദാ. ആനന്ദ് വി. നായർ")}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              />
              {errors.name && <p className="text-[11px] font-bold text-destructive">{errors.name}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                {tr("Mobile Number", "മൊബൈൽ നമ്പർ")}
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder={tr("e.g. 9447000000", "ഉദാ. 9447000000")}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Organisation Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                {tr("Organisation Level", "സംഘടനാ തലം")} <span className="text-destructive">*</span>
              </label>
              <select
                value={orgLevel}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__CREATE_NEW_ORG_LEVEL__") {
                    saveFormDraftToSession();
                    void navigate({
                      to: "/admin/settings",
                      search: { tab: "location", openCreate: "true", returnTo: "/admin/settings/new-user" },
                    });
                  } else {
                    handleOrgLevelChange(val);
                  }
                }}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="">{tr("Select Organisation Level", "സംഘടനാ തലം തിരഞ്ഞെടുക്കുക")}</option>
                {ORG_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {tr(opt.en, opt.ml)}
                  </option>
                ))}
                {customOrgLevels.map((lvl) => (
                  <option key={lvl.id} value={lvl.name}>
                    {lvl.name}
                  </option>
                ))}
                <option value="__CREATE_NEW_ORG_LEVEL__">
                  + {tr("Create New Organisation Level...", "പുതിയ സംഘടനാ തലം സൃഷ്ടിക്കുക...")}
                </option>
              </select>
              {errors.orgLevel && <p className="text-[11px] font-bold text-destructive">{errors.orgLevel}</p>}
            </div>
          </div>

          {/* Row 2: Designation, Role Selection, Role Level */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Designation Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                {tr("Designation", "തസ്തിക")} <span className="text-destructive">*</span>
              </label>

              <select
                value={designation}
                disabled={!orgLevel}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__CREATE_NEW_DESIGNATION__") {
                    saveFormDraftToSession();
                    void navigate({
                      to: "/admin/settings",
                      search: { tab: "designations", openCreate: "true", returnTo: "/admin/settings/new-user" },
                    });
                  } else {
                    setDesignation(val);
                    if (errors.designation) setErrors((prev) => ({ ...prev, designation: "" }));
                  }
                }}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer disabled:bg-slate-100 disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                {!orgLevel ? (
                  <option value="">{tr("Select organisation level first", "ആദ്യം സംഘടനാ തലം തിരഞ്ഞെടുക്കുക")}</option>
                ) : (
                  <>
                    <option value="">{tr("Select Designation", "തസ്തിക തിരഞ്ഞെടുക്കുക")}</option>
                    {activeDesignations.map((desig) => (
                      <option key={desig} value={desig}>
                        {desig}
                      </option>
                    ))}
                    <option value="__CREATE_NEW_DESIGNATION__">
                      + {tr("Create New Designation...", "പുതിയ തസ്തിക സൃഷ്ടിക്കുക...")}
                    </option>
                  </>
                )}
              </select>

              {showAddDesignationPopover && (
                <div className="mt-1.5 p-2.5 rounded-lg border border-primary/30 bg-amber-50/50 space-y-2">
                  <p className="text-xs font-bold text-foreground">
                    {tr(`Create New Designation (${orgLevel})`, `പുതിയ തസ്തിക സൃഷ്ടിക്കുക (${orgLevel})`)}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDesignationInput}
                      onChange={(e) => setNewDesignationInput(e.target.value)}
                      placeholder={tr("Designation Name", "തസ്തിക പേര്")}
                      className="h-8 flex-1 rounded-md border border-border bg-white px-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomDesignation();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomDesignation}
                      className="h-8 text-xs font-bold px-3"
                    >
                      {tr("Add", "ചേർക്കുക")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddDesignationPopover(false)}
                      className="h-8 text-xs font-bold px-2.5"
                    >
                      {tr("Cancel", "റദ്ദാക്കുക")}
                    </Button>
                  </div>
                </div>
              )}

              {errors.designation && <p className="text-[11px] font-bold text-destructive">{errors.designation}</p>}
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                {tr("Role Selection", "റോൾ തിരഞ്ഞെടുക്കൽ")}
              </label>
              <select
                value={selectedRoleName}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__CREATE_NEW_ROLE__") {
                    saveFormDraftToSession();
                    void navigate({
                      to: "/admin/settings_/new-role",
                      search: { returnTo: "/admin/settings/new-user" },
                    });
                  } else {
                    setSelectedRoleName(val);
                  }
                }}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                {availableRoleNames.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName === "None" ? tr("None", "ഒന്നുമില്ല") : roleName}
                  </option>
                ))}
                <option value="__CREATE_NEW_ROLE__">
                  + {tr("Create New Role...", "പുതിയ റോൾ സൃഷ്ടിക്കുക...")}
                </option>
              </select>
            </div>

            {/* Role Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                {tr("Role Level", "റോൾ ലെവൽ")}
              </label>
              <select
                value={roleLevel}
                onChange={(e) => setRoleLevel(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                {ROLE_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {tr(opt.en, opt.ml)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Organisation Hierarchy Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Region */}
            {showRegion && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  {tr("Region", "റീജിയൻ")}
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  {regionOptions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {tr(reg.en, reg.ml)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Organisational District */}
            {showOrgDistrict && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  {tr("Organisational District", "സംഘടനാ ജില്ല")}
                </label>
                <select
                  value={selectedOrgDistrict}
                  onChange={(e) => handleOrgDistrictChange(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  {orgDistrictOptions.map((od) => (
                    <option key={od.id} value={od.id}>
                      {tr(od.en, od.ml)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mandalam */}
            {showMandalam && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  {tr("Mandalam", "മണ്ഡലം")}
                </label>
                <select
                  value={selectedMandalam}
                  onChange={(e) => handleMandalamChange(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  {mandalamOptions.map((man) => (
                    <option key={man} value={man}>
                      {man}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Area */}
            {showArea && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  {tr("Area", "ഏരിയ")}
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  {areaOptions.map((ar) => (
                    <option key={ar} value={ar}>
                      {ar}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Booth */}
            {showBooth && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  {tr("Booth", "ബൂത്ത്")}
                </label>
                <select
                  value={selectedBooth}
                  onChange={(e) => setSelectedBooth(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  {boothOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Role Permissions Matrix Section (Shown ONLY when a role other than "None" / "Unassigned" is selected) */}
        {selectedRoleName !== "None" && selectedRoleName !== "Unassigned" && (
          <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                {tr(
                  `Role Permissions Matrix (${selectedRoleName})`,
                  `റോൾ അനുമതികളുടെ മാട്രിക്സ് (${selectedRoleName})`,
                )}
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium">
                {tr(
                  "Review or customize specific permissions for this user. Toggling checkboxes updates actions for this role.",
                  "ഈ ഉപയോക്താവിനായി നിർദ്ദിഷ്ട അനുമതികൾ അവലോകനം ചെയ്യുകയോ ഇഷ്‌ടാനുസൃതമാക്കുകയോ ചെയ്യുക.",
                )}
              </p>
            </div>

            <div className="space-y-4">
              {renderMatrixTable(primaryMatrixRows, primaryMatrixColumns, primaryMatrixGridClass)}
              {renderMatrixTable(
                secondaryMatrixRows,
                secondaryMatrixColumns,
                secondaryMatrixGridClass,
              )}
            </div>
          </section>
        )}
      </div>

      {/* Floating Action Bar */}
      <div
        className={cn(
          "fixed bottom-0 right-0 z-40 border-t border-border bg-card/95 p-3 px-8 shadow-lg backdrop-blur transition-all duration-200 flex items-center justify-end gap-3",
          isMobile
            ? "left-0"
            : sidebarState === "expanded"
              ? "left-[var(--sidebar-width,16rem)]"
              : "left-[var(--sidebar-width-icon,3rem)]",
        )}
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => void navigate({ to: "/admin/settings", search: { tab: undefined } })}
          className="h-9 px-4 text-xs font-bold cursor-pointer"
        >
          {tr("Cancel", "റദ്ദാക്കുക")}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="bg-amber-500 text-white font-semibold hover:bg-amber-600 h-9 px-5 text-xs cursor-pointer shadow-xs"
        >
          {tr("Save Changes", "മാറ്റങ്ങൾ സംരക്ഷിക്കുക")}
        </Button>
      </div>
    </div>
  );
}
