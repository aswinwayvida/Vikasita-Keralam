import React, { useEffect, useMemo, useRef, useState } from "react";
import { DatePickerModal } from "./DatePickerModal";
import partyWorkerAvatar from "@/assets/create-partyworker-3d-avatar.jpg";
import createScheme3dAvatar from "@/assets/create-scheme-3d-avatar.jpg";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  Briefcase,
  Building,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  Eye,
  FileText,
  Filter,
  GitFork,
  Headset,
  HelpCircle,
  Home,
  Inbox,
  Landmark,
  Layers,
  Leaf,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  PhoneCall,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Sprout,
  Trash2,
  User,
  UserCheck,
  UserRound,
  UserX,
  Users,
  Users2,
  Vote,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockUsers,
  getUserRegion,
  getUserOrgDistrict,
  getUserMandalam,
  getUserArea,
  getUserBooth,
  getUserDesignation,
  type AppUser,
} from "@/data/users";
import { partyWorkerStorageKey } from "@/data/party-worker-directory";
import {
  constituencies,
  districts,
  getWardsForLocalBody,
  organisationalDistricts,
  panchayats,
  regions,
  REGION_ORGANISATIONAL_DISTRICTS,
  type LocalBodyType,
} from "@/data/geo";
import { orgHierarchyData } from "@/data/admin-dashboard-metrics";
import {
  assignmentLevels,
  boothDirectory,
  canDelegateAccessManagement,
  canDelegateAction,
  canDelegateStatewide,
  describeAccessGrant,
  getAreaOptions,
  getFilteredLocalBodies,
  getLocalBodies,
  getOrgLevelLabel,
  getPartyOrgPath,
  getRolePreset,
  grantScopeLabel,
  localBodyTypeOptions,
  partyDesignations,
  permissionKey,
  type PartyDesignation,
  roleOrganisationLevels,
  permissionModules,
  rolePresets,
  scopeTypeOptions,
  togglePermission,
  withPrerequisites,
  type AccessGrant,
  type ActorRole,
  type AreaFilters,
  type AreaRef,
  type AssignmentLevel,
  type PermissionModuleId,
  type RolePresetId,
  type ScopeType,
  type ScopeTypeOption,
} from "@/data/party-workers";
import {
  cloneRoleDataAccess,
  dataAccessOptions,
  defaultRoleDataAccess,
  ensureRolesPageAccessRoles,
  getRolesAndControlRoles,
  isRetiredCustomRole,
  isRetiredOrganisationLevelName,
  loadCustomOrganisationLevels,
  loadDesignationCatalogue,
  loadManagedRoles,
  rolesPageAdminRoleId,
  rolesPageSubAdminRoleId,
  toggleRoleDataAccess,
  type ManagedRole,
  type RoleDataAccess,
} from "@/data/role-management";

type Lang = "en" | "ml";

interface MobileCreatePartyWorkerFlowProps {
  lang: Lang;
  onClose: () => void;
  onCreated?: (worker: WorkerProfile) => void;
  onSelectApplication?: (app: any) => void;
  onSelectScheme?: (scheme: any) => void;
  actorRole?: ActorRole;
  canOpenExistingWorker?: boolean;
  initialPhase?: "form" | "list";
  initialTeamMember?: { name: string; nameMl: string; role: string } | null;
}

interface WorkerProfile {
  id: string;
  name: string;
  photoUrl?: string;
  nameMl?: string;
  designationEn: string;
  designationMl: string;
  mobile: string;
  levelLabelEn: string;
  levelLabelMl: string;
  locationLines: { en: string; ml: string };
  districtNameEn: string;
  districtNameMl: string;
  regionIds?: string[];
  regionNamesEn?: string[];
  regionNamesMl?: string[];
  orgDistrictId?: string;
  orgDistrictNameEn?: string;
  orgDistrictNameMl?: string;
  permissions: string[];
  dataAccess?: RoleDataAccess;
  grants: AccessGrant[];
  accessManagement: boolean;
  designationId?: string;
  level?: AssignmentLevel;
  districtId?: string;
  constituencyId?: string;
  localBodyType?: LocalBodyType;
  localBodyId?: string;
  wardId?: string;
  boothId?: string;
  orgUnitId?: string;
  presetId?: RolePresetId;
  status: "Active" | "Verified" | "Pending" | "Deactivated";
  createdAt: string;
  createdBy: string;
  isExisting?: boolean;
}

type PickerKey =
  | "app_role"
  | "designation_catalogue"
  | "role_level"
  | "level"
  | "regions"
  | "org_district"
  | "district"
  | "constituency"
  | "local_body_type"
  | "local_body"
  | "ward"
  | "booth"
  | "org_unit"
  | "preset"
  | "filter_district"
  | "filter_constituency"
  | "filter_local_body_type"
  | "filter_local_body"
  | "worker_filter_level"
  | "worker_filter_region"
  | "worker_filter_designation"
  | "worker_filter_district"
  | "worker_filter_constituency"
  | "worker_filter_local_body_type"
  | "worker_filter_local_body"
  | "worker_filter_ward"
  | "worker_filter_booth"
  | "worker_filter_org_unit"
  | "worker_filter_status"
  | "worker_filter_app_role"
  | "worker_filter_app_status"
  | "worker_filter_scheme";

interface PickerOption {
  id: string;
  label: string;
  hint?: string;
  badge?: string;
  search?: string;
}

function toggleFilterId<T extends string>(ids: T[] | undefined, id: T): T[] | undefined {
  const current = ids ?? [];
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  return next.length ? next : undefined;
}

const sessionCreatedWorkers: WorkerProfile[] = [];
function readStoredWorkers(): WorkerProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(partyWorkerStorageKey) || "[]",
    ) as unknown;
    return Array.isArray(parsed) ? (parsed as WorkerProfile[]) : [];
  } catch {
    return [];
  }
}

function persistWorker(worker: WorkerProfile) {
  if (typeof window === "undefined") return;
  try {
    const previous = readStoredWorkers().filter((item) => item.id !== worker.id);
    window.localStorage.setItem(
      partyWorkerStorageKey,
      JSON.stringify([worker, ...previous].slice(0, 50)),
    );
  } catch {
    // Persistence is best-effort in this prototype.
  }
}

const profilePhotoMaxSide = 360;
const profilePhotoMaxUploadBytes = 8 * 1024 * 1024;

function readProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read_failed"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("decode_failed"));
      image.onload = () => {
        const scale = Math.min(
          1,
          profilePhotoMaxSide / Math.max(image.width || 1, image.height || 1),
        );
        const width = Math.max(1, Math.round((image.width || 1) * scale));
        const height = Math.max(1, Math.round((image.height || 1) * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(String(reader.result || ""));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

const moduleIcons: Record<PermissionModuleId, React.ElementType> = {
  schemes: FileText,
  party_workers: Users2,
  applications: ClipboardList,
  help_desk: Headset,
  applicant_profile: UserRound,
  roles: ShieldCheck,
  designations: Users2,
};

const rolePresetForLevel: Record<AssignmentLevel, Exclude<RolePresetId, "custom">> = {
  state: "state_admin",
  region: "district_admin",
  district: "district_admin",
  mandalam: "constituency_admin",
  area: "party_worker",
  assembly_constituency: "constituency_admin",
  local_body: "local_body_admin",
  ward: "party_worker",
  booth: "booth_admin",
  org_unit: "party_worker",
};

const roleLevelOptions: { id: AssignmentLevel; en: string; ml: string }[] = [
  { id: "state", en: "State", ml: "സംസ്ഥാനം" },
  { id: "region", en: "Region", ml: "റീജിയൺ" },
  { id: "district", en: "Organisation District", ml: "ഓർഗനൈസേഷണൽ ജില്ല" },
  { id: "mandalam", en: "Mandalam", ml: "മണ്ഡലം" },
  { id: "area", en: "Area", ml: "ഏരിയ" },
  { id: "local_body", en: "Local body", ml: "തദ്ദേശ സ്ഥാപനം" },
  { id: "ward", en: "Ward", ml: "വാർഡ്" },
  { id: "booth", en: "Booth", ml: "ബൂത്ത്" },
];

const partyWorkerPermissionOrder: PermissionModuleId[] = [
  "applicant_profile",
  "applications",
  "schemes",
  "roles",
  "designations",
  "party_workers",
  "help_desk",
];

const orderedPartyWorkerPermissions = [...permissionModules].sort(
  (a, b) => partyWorkerPermissionOrder.indexOf(a.id) - partyWorkerPermissionOrder.indexOf(b.id),
);

const permissionTableColumns = [
  { id: "create", en: "Create", ml: "സൃഷ്ടിക്കുക" },
  { id: "view", en: "View", ml: "കാണുക" },
  { id: "edit", en: "Edit", ml: "തിരുത്തുക" },
  { id: "delete", en: "Delete", ml: "നീക്കം ചെയ്യുക" },
] as const;

const permissionTableKeyOverrides: Partial<Record<PermissionModuleId, Record<string, string[]>>> = {
  schemes: { view: ["view_list", "view_details"] },
};

const crudActionIds = new Set<string>(permissionTableColumns.map((column) => column.id));

const additionalPermissionModulesForCreateUser = orderedPartyWorkerPermissions
  .filter((module) => module.id !== "schemes")
  .map((module) => ({
    module,
    actions: module.actions.filter((action) => !crudActionIds.has(action.id)),
  }))
  .filter((group) => group.actions.length > 0);

const allCreateUserPermissionKeys = permissionModules.flatMap((module) =>
  module.actions.map((action) => permissionKey(module.id, action.id)),
);

const createUserPermissionModuleLabel = (
  module: { id: PermissionModuleId; en: string; ml: string },
  isMalayalam: boolean,
) =>
  module.id === "help_desk"
    ? isMalayalam
      ? "അഭ്യർത്ഥന"
      : "Request"
    : isMalayalam
      ? module.ml
      : module.en;

function profileFromAppUser(user: AppUser): WorkerProfile {
  return {
    id: user.id,
    name: user.name,
    nameMl: user.nameMl,
    designationEn: user.designationEn,
    designationMl: user.designationMl,
    mobile: user.mobile,
    levelLabelEn: "Existing worker",
    levelLabelMl: "നിലവിലുള്ള പ്രവർത്തകൻ",
    locationLines: {
      en: `${user.constituencyEn}, ${user.districtNameEn}`,
      ml: `${user.constituencyMl}, ${user.districtNameMl}`,
    },
    districtNameEn: user.districtNameEn,
    districtNameMl: user.districtNameMl,
    permissions: [],
    grants: [],
    accessManagement: false,
    districtId: user.districtId,
    status: user.status,
    createdAt: user.joinedDate,
    createdBy: "Existing account",
    isExisting: true,
  };
}

function findExistingWorker(mobile: string) {
  const clean = mobile.replace(/\D/g, "");
  if (clean.length !== 10) return null;
  const created = sessionCreatedWorkers.find((worker) => worker.mobile === clean);
  if (created) return created;
  const stored = readStoredWorkers().find((worker) => worker.mobile === clean);
  if (stored) return stored;
  const user = mockUsers.find((item) => item.mobile.replace(/\D/g, "") === clean);
  return user ? profileFromAppUser(user) : null;
}

function getWorkerApplicationStats(worker: { id: string; name: string; mobile?: string }) {
  const seed = (worker.id + (worker.name || "") + (worker.mobile || "")).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const total = (seed % 15) + 4;
  const approved = Math.floor(total * 0.45) + (seed % 2);
  const rejected = Math.max(0, Math.floor(total * 0.15) - (seed % 2));
  const inReview = Math.floor(total * 0.25);
  const pending = Math.max(0, total - (approved + rejected + inReview));

  return {
    total,
    approved,
    rejected,
    inReview,
    pending,
  };
}

function workerAreaLabel(worker: WorkerProfile, lang: Lang) {
  const designationLevel = partyDesignations.find(
    (item) => item.en === worker.designationEn || item.ml === worker.designationMl,
  )?.level;
  const level = designationLevel || worker.level;
  const district =
    districts.find((item) => item.id === worker.districtId) ||
    districts.find(
      (item) => item.en === worker.districtNameEn || item.ml === worker.districtNameMl,
    );
  const orgDistrict =
    organisationalDistricts.find((item) => item.id === worker.orgDistrictId) ||
    organisationalDistricts.find(
      (item) => item.en === worker.orgDistrictNameEn || item.ml === worker.orgDistrictNameMl,
    ) ||
    (level === "district"
      ? organisationalDistricts.find(
          (item) => item.en === worker.districtNameEn || item.ml === worker.districtNameMl,
        )
      : undefined);
  const constituency =
    constituencies.find((item) => item.id === worker.constituencyId) ||
    constituencies.find(
      (item) =>
        worker.locationLines.en.includes(item.en) || worker.locationLines.ml.includes(item.ml),
    );
  const localBody =
    panchayats.find((item) => item.id === worker.localBodyId) ||
    panchayats.find(
      (item) =>
        worker.locationLines.en.includes(item.en) || worker.locationLines.ml.includes(item.ml),
    );
  const ward = localBody
    ? getWardsForLocalBody(localBody.id).find(
        (item) =>
          item.id === worker.wardId ||
          worker.locationLines.en.includes(item.displayEn) ||
          worker.locationLines.ml.includes(item.displayMl),
      )
    : undefined;
  const booth =
    boothDirectory.find((item) => item.id === worker.boothId) ||
    boothDirectory.find(
      (item) =>
        worker.districtId === item.districtId &&
        worker.locationLines.en.toLowerCase().includes(item.nameEn.toLowerCase()),
    );
  const pick = (en?: string, ml?: string) => (lang === "ml" ? ml || en || "" : en || ml || "");
  const parent = (en?: string, ml?: string) => (en || ml ? ` · ${pick(en, ml)}` : "");

  if (level === "state") return lang === "ml" ? "കേരളം" : "Kerala";
  if (level === "district") {
    return pick(
      orgDistrict?.en || district?.en || worker.districtNameEn,
      orgDistrict?.ml || district?.ml || worker.districtNameMl,
    );
  }
  if (level === "area") {
    return [
      pick(district?.en, district?.ml),
      pick(orgDistrict?.en, orgDistrict?.ml),
      pick(constituency?.en, constituency?.ml),
    ]
      .filter(Boolean)
      .join(" → ");
  }
  if (level === "assembly_constituency") {
    return `${pick(constituency?.en, constituency?.ml)}${parent(district?.en, district?.ml)}`;
  }
  if (level === "local_body") {
    return `${pick(localBody?.en, localBody?.ml)}${parent(constituency?.en, constituency?.ml)}`;
  }
  if (level === "ward") {
    return `${pick(ward?.displayEn, ward?.displayMl)}${parent(localBody?.en, localBody?.ml)}`;
  }
  if (level === "booth") {
    return `${pick(booth?.nameEn, booth?.nameMl)}${parent(constituency?.en, constituency?.ml)}`;
  }
  if (level === "org_unit" && worker.orgUnitId) return getPartyOrgPath(worker.orgUnitId, lang);
  return lang === "ml" ? worker.locationLines.ml : worker.locationLines.en;
}

type WorkerListFilters = {
  status: "all" | "Active" | "Inactive";
  level: AssignmentLevel | "all";
  designationId: string;
  regionId: string;
  districtId: string;
  constituencyId: string;
  localBodyType: LocalBodyType | "";
  localBodyId: string;
  wardId: string;
  boothId: string;
  orgUnitId: string;
  appRole: RolePresetId | "all";
  appStatus?: string;
  schemeId?: string;
};

function getWorkerAppStatusLabel(statusId: string, lang: Lang) {
  switch (statusId) {
    case "all":
      return lang === "ml" ? "എല്ലാ സ്റ്റാറ്റസുകളും" : "All Statuses";
    case "application_received":
      return lang === "ml" ? "അപേക്ഷ ലഭിച്ചു" : "Application Received";
    case "document_verification_completed":
      return lang === "ml" ? "രേഖാ പരിശോധന പൂർത്തിയായി" : "Document Verification Completed";
    case "applied":
      return lang === "ml" ? "അപേക്ഷിച്ചു" : "Applied";
    case "review":
      return lang === "ml" ? "പരിശോധനയിൽ" : "In Review";
    case "beneficiary":
      return lang === "ml" ? "അംഗീകരിച്ചു / ഗുണഭോക്താവ്" : "Beneficiary";
    case "rejected":
      return lang === "ml" ? "നിരസിച്ചു" : "Rejected";
    default:
      return statusId;
  }
}

function getWorkerSchemeLabel(schemeId: string, lang: Lang) {
  if (!schemeId || schemeId === "all") {
    return lang === "ml" ? "എല്ലാ പദ്ധതികളും" : "All Schemes";
  }
  return schemeId;
}

function managedRoleDesignation(role: ManagedRole, level?: AssignmentLevel | ""): PartyDesignation {
  return {
    id: role.id,
    en: role.name,
    ml: role.name,
    level: (level || role.assignmentLevels[0] || "state") as AssignmentLevel,
  };
}

function designationOptionLabel(
  designation: PartyDesignation,
  lang: Lang,
  level: AssignmentLevel | "",
) {
  const label = lang === "ml" ? designation.ml : designation.en;
  if (level !== "booth") return label;
  return label
    .replace(/^Booth\s+/i, "")
    .replace(/^ബൂത്ത്\s+/, "")
    .trim();
}

const defaultWorkerListFilters: WorkerListFilters = {
  status: "all",
  level: "all",
  designationId: "all",
  regionId: "",
  districtId: "",
  constituencyId: "",
  localBodyType: "",
  localBodyId: "",
  wardId: "",
  boothId: "",
  orgUnitId: "",
  appRole: "all",
  appStatus: "all",
  schemeId: "all",
};

function countActiveWorkerFilters(filters: WorkerListFilters) {
  let count = 0;
  if (filters.status !== "all") count += 1;
  if (filters.level !== "all") count += 1;
  if (filters.designationId !== "all") count += 1;
  if (filters.regionId) count += 1;
  if (filters.districtId) count += 1;
  if (filters.constituencyId) count += 1;
  if (filters.localBodyType) count += 1;
  if (filters.localBodyId) count += 1;
  if (filters.wardId) count += 1;
  if (filters.boothId) count += 1;
  if (filters.orgUnitId) count += 1;
  if (filters.appRole !== "all") count += 1;
  if (filters.appStatus && filters.appStatus !== "all") count += 1;
  if (filters.schemeId && filters.schemeId !== "all") count += 1;
  return count;
}

function workerAssignmentLevel(worker: WorkerProfile): AssignmentLevel | "" {
  const designation = partyDesignations.find(
    (item) =>
      item.id === worker.designationId ||
      item.en === worker.designationEn ||
      item.ml === worker.designationMl,
  );
  return designation?.level || worker.level || "";
}

function workerMatchesListFilters(worker: WorkerProfile, filters: WorkerListFilters) {
  const level = workerAssignmentLevel(worker);
  if (filters.level !== "all") {
    const isFilterDistrict =
      filters.level === "org_district" || filters.level === "districts" || filters.level === "district";
    const isWorkerDistrict =
      level === "org_district" || level === "districts" || level === "district";
    const isFilterMandalam =
      filters.level === "mandalam" || filters.level === "assembly_constituency";
    const isWorkerMandalam =
      level === "mandalam" || level === "assembly_constituency";

    if (isFilterDistrict) {
      if (!isWorkerDistrict) return false;
    } else if (isFilterMandalam) {
      if (!isWorkerMandalam) return false;
    } else if (level !== filters.level) {
      return false;
    }
  }

  const matchesStatus =
    filters.status === "all" ||
    (filters.status === "Inactive"
      ? worker.status === "Deactivated"
      : worker.status !== "Deactivated");
  if (!matchesStatus) return false;

  if (filters.designationId !== "all") {
    const designationId =
      worker.designationId ||
      partyDesignations.find(
        (item) => item.en === worker.designationEn || item.ml === worker.designationMl,
      )?.id;
    if (designationId !== filters.designationId) return false;
  }

  const locationText = `${worker.locationLines.en} ${worker.locationLines.ml}`.toLowerCase();
  const contains = (value?: string) => Boolean(value && locationText.includes(value.toLowerCase()));

  if (filters.regionId) {
    const regId = filters.regionId;
    const workerReg = getUserRegion({
      districtNameEn: worker.districtNameEn,
      districtNameMl: worker.districtNameMl,
      regionEn: worker.regionNamesEn?.[0],
    });
    let match = false;
    if (regId === "reg-north" && (workerReg === "Northern Region" || workerReg === "North Region" || worker.regionIds?.includes("reg-north"))) match = true;
    if (regId === "reg-central" && (workerReg === "Central Region" || worker.regionIds?.includes("reg-central"))) match = true;
    if (regId === "reg-south" && (workerReg === "Southern Region" || workerReg === "South Region" || worker.regionIds?.includes("reg-south"))) match = true;
    if (!match) return false;
  }

  if (filters.districtId) {
    const selectedDistrict = districts.find((item) => item.id === filters.districtId);
    const selectedOrgDistrict = organisationalDistricts.find((item) => item.id === filters.districtId);
    if (!selectedDistrict && !selectedOrgDistrict) return false;

    let matchesDistrict = false;
    if (selectedDistrict) {
      matchesDistrict =
        worker.districtId === selectedDistrict.id ||
        worker.districtNameEn === selectedDistrict.en ||
        worker.districtNameMl === selectedDistrict.ml ||
        contains(selectedDistrict.en) ||
        contains(selectedDistrict.ml);
    }
    if (!matchesDistrict && selectedOrgDistrict) {
      matchesDistrict =
        worker.orgDistrictId === selectedOrgDistrict.id ||
        worker.orgDistrictNameEn === selectedOrgDistrict.en ||
        worker.orgDistrictNameMl === selectedOrgDistrict.ml ||
        contains(selectedOrgDistrict.en) ||
        contains(selectedOrgDistrict.ml);
    }
    if (!matchesDistrict) return false;
  }

  if (filters.constituencyId) {
    const selectedConstituency = constituencies.find((item) => item.id === filters.constituencyId);
    if (!selectedConstituency) return false;
    const matchesConstituency =
      worker.constituencyId === selectedConstituency.id ||
      contains(selectedConstituency.en) ||
      contains(selectedConstituency.ml);
    if (!matchesConstituency) return false;
  }

  const workerLocalBody = panchayats.find((item) => item.id === worker.localBodyId);
  const workerLocalBodyType = worker.localBodyType || workerLocalBody?.type || "";
  if (filters.localBodyType && workerLocalBodyType !== filters.localBodyType) return false;

  if (filters.localBodyId) {
    const selectedLocalBody = panchayats.find((item) => item.id === filters.localBodyId);
    if (!selectedLocalBody) return false;
    const matchesLocalBody =
      worker.localBodyId === selectedLocalBody.id ||
      contains(selectedLocalBody.en) ||
      contains(selectedLocalBody.ml);
    if (!matchesLocalBody) return false;
  }

  if (filters.wardId) {
    const selectedWard = filters.localBodyId
      ? getWardsForLocalBody(filters.localBodyId).find((item) => item.id === filters.wardId)
      : undefined;
    if (!selectedWard) return false;
    const matchesWard =
      worker.wardId === selectedWard.id ||
      contains(selectedWard.displayEn) ||
      contains(selectedWard.displayMl);
    if (!matchesWard) return false;
  }

  if (filters.boothId) {
    const selectedBooth = boothDirectory.find((item) => item.id === filters.boothId);
    if (!selectedBooth) return false;
    const matchesBooth =
      worker.boothId === selectedBooth.id ||
      contains(selectedBooth.nameEn) ||
      contains(selectedBooth.nameMl);
    if (!matchesBooth) return false;
  }

  if (filters.orgUnitId) {
    const selectedUnit = orgHierarchyData.find((item) => item.id === filters.orgUnitId);
    if (!selectedUnit) return false;
    const selectedPath = getPartyOrgPath(selectedUnit.id, "en");
    const workerPath = worker.orgUnitId ? getPartyOrgPath(worker.orgUnitId, "en") : "";
    const matchesOrgUnit =
      worker.orgUnitId === selectedUnit.id ||
      (workerPath && workerPath.startsWith(selectedPath)) ||
      contains(selectedUnit.name);
    if (!matchesOrgUnit) return false;
  }

  if (filters.appRole !== "all" && (worker.presetId || "custom") !== filters.appRole) return false;

  return true;
}

function buildWorkerDirectory() {
  const workers = new Map<string, WorkerProfile>();
  const mockPartyMembers = mockUsers
    .filter((user) => user.category === "bjp_member")
    .map((user, idx) => {
      const profile = profileFromAppUser(user);
      // Ensure some users are displayed as Inactive (Deactivated)
      if (idx === 2 || idx === 5) {
        return {
          ...profile,
          status: "Deactivated" as const,
        };
      }
      return profile;
    });

  [
    ...sessionCreatedWorkers,
    ...readStoredWorkers(),
    ...mockPartyMembers,
  ].forEach((worker) => {
    const key = worker.mobile.replace(/\D/g, "") || worker.id;
    if (!workers.has(key)) workers.set(key, worker);
  });
  return Array.from(workers.values());
}

export type WorkerSortOption =
  | "name_asc"
  | "name_desc"
  | "benefits_desc"
  | "benefits_asc"
  | "apps_desc"
  | "apps_asc"
  | "pending_desc"
  | "pending_asc"
  | "in_review_desc"
  | "in_review_asc"
  | "rejected_desc"
  | "rejected_asc";

export function MobileCreatePartyWorkerFlow({
  lang,
  onClose,
  onCreated,
  onSelectApplication,
  onSelectScheme,
  actorRole = "state_admin",
  canOpenExistingWorker = true,
  initialPhase = "form",
  initialTeamMember = null,
}: MobileCreatePartyWorkerFlowProps) {
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);

  const [step, setStep] = useState<1 | 2>(1);
  const [phase, setPhase] = useState<"form" | "profile" | "list">(initialTeamMember ? "profile" : initialPhase);
  const [profile, setProfile] = useState<WorkerProfile | null>(() => initialTeamMember ? {
    id: `team-${initialTeamMember.name}`, name: initialTeamMember.name, nameMl: initialTeamMember.nameMl,
    designationEn: initialTeamMember.role, designationMl: initialTeamMember.role,
    mobile: "", levelLabelEn: "", levelLabelMl: "", locationLines: { en: "", ml: "" },
    districtNameEn: "", districtNameMl: "", permissions: [], grants: [], accessManagement: false,
    status: "Active", createdAt: "", createdBy: "", isExisting: true,
  } : null);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<"informations" | "applications">("informations");
  const [assistedViewMode, setAssistedViewMode] = useState<"applications" | "schemes">("applications");
  const [assistedViewDropdownOpen, setAssistedViewDropdownOpen] = useState(false);
  const [assistedDateRange, setAssistedDateRange] = useState<string>("this_month");
  const [assistedStatusFilter, setAssistedStatusFilter] = useState<string>("all");
  const [assistedFilterOpen, setAssistedFilterOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedAssistedApp, setSelectedAssistedApp] = useState<any | null>(null);
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);
  const [assistedAppList, setAssistedAppList] = useState<any[]>([
    {
      id: "app-1",
      categoryEn: "Agriculture",
      categoryMl: "കൃഷി",
      titleEn: "PM Kisan Samman Nidhi",
      titleMl: "പിഎം കിസാൻ സമ്മാൻ നിധി",
      ministryEn: "Ministry of Agriculture & Farmers Welfare, Govt. of India",
      ministryMl: "കാർഷിക കർഷക ക്ഷേമ മന്ത്രാലയം, ഭാരത സർക്കാർ",
      status: "approved",
      statusLabelEn: "Beneficiary",
      statusLabelMl: "അംഗീകരിച്ചു",
      date: "23 Oct 2026",
      periodKey: "oct2026",
      applicantName: "K. Krishnan",
      applicantLocation: "Palakkad North, Palakkad",
      applicantPhone: "9876543210",
      refId: "PMSV-2026-9281",
    },
    {
      id: "app-2",
      categoryEn: "Agriculture Credit",
      categoryMl: "കാർഷിക വായ്പ",
      titleEn: "Kisan Credit Card (KCC) Scheme",
      titleMl: "കിസാൻ ക്രെഡിറ്റ് കാർഡ് (KCC) പദ്ധതി",
      ministryEn: "NABARD & Ministry of Agriculture",
      ministryMl: "നബാർഡ് & കൃഷി മന്ത്രാലയം",
      status: "approved",
      statusLabelEn: "Beneficiary",
      statusLabelMl: "അംഗീകരിച്ചു",
      date: "23 Oct 2026",
      periodKey: "oct2026",
      applicantName: "K. Krishnan",
      applicantLocation: "Palakkad North, Palakkad",
      applicantPhone: "9876543210",
      refId: "KCC-2026-89415",
    },
    {
      id: "app-3",
      categoryEn: "Business",
      categoryMl: "ബിസിനസ്സ്",
      titleEn: "PM SVANidhi",
      titleMl: "പിഎം സ്വനിധി",
      ministryEn: "Ministry of Housing & Urban Affairs",
      ministryMl: "ഭവന നഗരകാര്യ മന്ത്രാലയം",
      status: "approved",
      statusLabelEn: "Beneficiary",
      statusLabelMl: "അംഗീകരിച്ചു",
      date: "23 Oct 2026",
      periodKey: "oct2026",
      applicantName: "K. Krishnan",
      applicantLocation: "Palakkad North, Palakkad",
      applicantPhone: "9876543210",
      refId: "PMSV-2026-89418",
    },
    {
      id: "app-4",
      categoryEn: "Agriculture",
      categoryMl: "കൃഷി",
      titleEn: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      titleMl: "പ്രധാനമന്ത്രി ഫസൽ ഭീമ യോജന (PMFBY)",
      ministryEn: "Ministry of Agriculture",
      ministryMl: "കൃഷി മന്ത്രാലയം",
      status: "pending",
      statusLabelEn: "Received",
      statusLabelMl: "ലഭിച്ചു",
      date: "18 Oct 2026",
      periodKey: "oct2026",
      applicantName: "K. Krishnan",
      applicantLocation: "Palakkad North, Palakkad",
      applicantPhone: "9876543210",
      refId: "PMFB-2026-87102",
    },
    {
      id: "app-5",
      categoryEn: "Business Loan",
      categoryMl: "ബിസിനസ് വായ്പ",
      titleEn: "Pradhan Mantri Mudra Yojana (PMMY)",
      titleMl: "പ്രധാനമന്ത്രി മുദ്ര യോജന (PMMY)",
      ministryEn: "Ministry of Finance",
      ministryMl: "ധനകാര്യ മന്ത്രാലയം",
      status: "pending",
      statusLabelEn: "Received",
      statusLabelMl: "ലഭിച്ചു",
      date: "18 Oct 2026",
      periodKey: "oct2026",
      applicantName: "K. Krishnan",
      applicantLocation: "Palakkad North, Palakkad",
      applicantPhone: "9876543210",
      refId: "PMMY-2026-87105",
    },
    {
      id: "app-6",
      categoryEn: "Pension",
      categoryMl: "പെൻഷൻ",
      titleEn: "Atal Pension Yojana (APY)",
      titleMl: "അടൽ പെൻഷൻ യോജന (APY)",
      ministryEn: "Ministry of Finance",
      ministryMl: "ധനകാര്യ മന്ത്രാലയം",
      status: "approved",
      statusLabelEn: "Beneficiary",
      statusLabelMl: "അംഗീകരിച്ചു",
      date: "12 Oct 2026",
      periodKey: "oct2026",
      applicantName: "Devaki Amma",
      applicantLocation: "Manalur, Thrissur",
      applicantPhone: "9876543211",
      refId: "APY-2026-85201",
    },
    {
      id: "app-7",
      categoryEn: "Pension",
      categoryMl: "പെൻഷൻ",
      titleEn: "Indira Gandhi National Old Age Pension",
      titleMl: "ഇന്ദിരാഗാന്ധി ദേശീയ വാർദ്ധക്യകാല പെൻഷൻ",
      ministryEn: "Ministry of Rural Development",
      ministryMl: "ഗ്രാമീണ വികസന മന്ത്രാലയം",
      status: "approved",
      statusLabelEn: "Beneficiary",
      statusLabelMl: "അംഗീകരിച്ചു",
      date: "10 Oct 2026",
      periodKey: "oct2026",
      applicantName: "Devaki Amma",
      applicantLocation: "Manalur, Thrissur",
      applicantPhone: "9876543211",
      refId: "IGNO-2026-84110",
    },
  ]);
  const [selectedAssistedScheme, setSelectedAssistedScheme] = useState<any | null>(null);
  const [profilePhotoBusy, setProfilePhotoBusy] = useState(false);
  const [profilePhotoError, setProfilePhotoError] = useState("");
  const [focusAccessAreas, setFocusAccessAreas] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerSearchOpen, setWorkerSearchOpen] = useState(false);
  const [workerSortOption, setWorkerSortOption] = useState<WorkerSortOption>("name_asc");
  const [draftWorkerSort, setDraftWorkerSort] = useState<WorkerSortOption>("name_asc");
  const [workerSortSheetOpen, setWorkerSortSheetOpen] = useState(false);
  const [workerFiltersOpen, setWorkerFiltersOpen] = useState(false);
  const [workerMoreFiltersOpen, setWorkerMoreFiltersOpen] = useState(false);
  const [appliedWorkerFilters, setAppliedWorkerFilters] = useState<WorkerListFilters>({
    ...defaultWorkerListFilters,
  });
  const [draftWorkerFilters, setDraftWorkerFilters] = useState<WorkerListFilters>({
    ...defaultWorkerListFilters,
  });
  const bodyRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const accessAreasRef = useRef<HTMLElement>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [designationTitle, setDesignationTitle] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [appRoleId, setAppRoleId] = useState(rolesPageAdminRoleId);
  const [roleLevel, setRoleLevel] = useState<AssignmentLevel | "">("");
  const [level, setLevel] = useState<AssignmentLevel | "">("");
  const [regionIds, setRegionIds] = useState<string[]>([]);
  const [orgDistrictId, setOrgDistrictId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [constituencyId, setConstituencyId] = useState("");
  const [localBodyType, setLocalBodyType] = useState<LocalBodyType | "">("");
  const [localBodyId, setLocalBodyId] = useState("");
  const [wardId, setWardId] = useState("");
  const [boothId, setBoothId] = useState("");
  const [orgUnitId, setOrgUnitId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [presetId, setPresetId] = useState<RolePresetId>("party_worker");
  const [permissions, setPermissions] = useState<string[]>(
    getRolePreset("party_worker").permissions,
  );
  const [accessManagement, setAccessManagement] = useState(false);
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [permissionError, setPermissionError] = useState("");
  const [dataAccess, setDataAccess] = useState<RoleDataAccess>(defaultRoleDataAccess);
  const managedRoles = useMemo<ManagedRole[]>(
    () => ensureRolesPageAccessRoles(loadManagedRoles()),
    [],
  );

  const allDesignationChoices = useMemo<PartyDesignation[]>(() => {
    const customRoles = managedRoles
      .filter((role) => !role.system && role.status === "Active" && !isRetiredCustomRole(role))
      .map((role) => managedRoleDesignation(role));
    return [...partyDesignations, ...customRoles];
  }, [managedRoles]);

  const designationCatalogue = useMemo<PartyDesignation[]>(() => loadDesignationCatalogue(), []);

  const rolesControlChoices = useMemo<ManagedRole[]>(() => {
    return getRolesAndControlRoles(managedRoles).filter(
      (role) =>
        role.id === rolesPageAdminRoleId ||
        role.id === rolesPageSubAdminRoleId ||
        role.name.trim().toLowerCase() === "support admin",
    );
  }, [managedRoles]);

  const roleChoices = useMemo<PartyDesignation[]>(
    () => rolesControlChoices.map((role) => managedRoleDesignation(role)),
    [rolesControlChoices],
  );

  const designationLookupChoices = useMemo<PartyDesignation[]>(() => {
    const merged = [...allDesignationChoices, ...designationCatalogue, ...roleChoices];
    const ids = new Set<string>();
    return merged.filter((item) => {
      if (ids.has(item.id)) return false;
      ids.add(item.id);
      return true;
    });
  }, [allDesignationChoices, designationCatalogue, roleChoices]);

  const [picker, setPicker] = useState<PickerKey | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  const [isAccessSheetOpen, setIsAccessSheetOpen] = useState(false);
  const [editingGrantId, setEditingGrantId] = useState<string | null>(null);
  const [sheetScope, setSheetScope] = useState<ScopeType>("districts");
  const [sheetAppRoleId, setSheetAppRoleId] = useState(rolesPageAdminRoleId);
  const [sheetFilters, setSheetFilters] = useState<AreaFilters>({});
  const [sheetAreas, setSheetAreas] = useState<Record<string, AreaRef>>({});
  const [sheetSearch, setSheetSearch] = useState("");
  const [sheetError, setSheetError] = useState("");

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, phase]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const closeMenu = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!focusAccessAreas || phase !== "form" || step !== 2) return;
    const frame = requestAnimationFrame(() => {
      const body = bodyRef.current;
      const target = accessAreasRef.current;
      if (body && target) {
        const offset = target.getBoundingClientRect().top - body.getBoundingClientRect().top;
        body.scrollTo({ top: body.scrollTop + offset - 8, behavior: "smooth" });
      }
      setFocusAccessAreas(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [focusAccessAreas, phase, step]);

  const duplicateWorker = useMemo(() => findExistingWorker(mobile), [mobile]);
  const designation = designationLookupChoices.find((item) => item.id === designationId) || null;
  const appRole = roleChoices.find((item) => item.id === appRoleId) ?? roleChoices[0] ?? null;
  const roleLevelOption = roleLevelOptions.find((item) => item.id === roleLevel);
  const designationManagedRole = designation
    ? managedRoles.find((role) => role.id === designation.id)
    : undefined;
  const rolePresetIdForDesignation =
    rolePresetForLevel[designation?.level ?? (level || "ward")] ?? "party_worker";
  const presetForDesignation = getRolePreset(rolePresetIdForDesignation);
  const managedRoleForDesignation =
    designationManagedRole ??
    managedRoles.find(
      (role) => role.presetId === rolePresetIdForDesignation && role.status === "Active",
    );
  const presetIdForDesignation: RolePresetId = designationManagedRole
    ? (designationManagedRole.presetId ?? "custom")
    : rolePresetIdForDesignation;
  const rolePermissions =
    managedRoleForDesignation?.permissions ?? presetForDesignation.permissions;
  const roleAdministrativePermissions = managedRoleForDesignation?.administrativePermissions ?? [];
  const roleAccessManagement = roleAdministrativePermissions.length > 0;
  const organisationLevelOptions = useMemo(() => {
    const customLevels = loadCustomOrganisationLevels().filter(
      (customLevel) => !isRetiredOrganisationLevelName(customLevel.name),
    );
    const hints: Record<string, { en: string; ml: string }> = {
      state: { en: "Kerala, statewide", ml: "കേരളം, സംസ്ഥാന വ്യാപകം" },
      region: { en: "State → Region", ml: "സംസ്ഥാനം → റീജിയൺ" },
      district: { en: "Region → Organisational District", ml: "റീജിയൺ → ഓർഗനൈസേഷണൽ ജില്ല" },
      mandalam: { en: "Organisational District → Mandalam", ml: "ഓർഗനൈസേഷണൽ ജില്ല → മണ്ഡലം" },
      area: { en: "Mandalam → Area", ml: "മണ്ഡലം → ഏരിയ" },
      booth: { en: "Area → Booth", ml: "ഏരിയ → ബൂത്ത്" },
    };
    return [
      ...roleOrganisationLevels.map((roleLevel) => ({
        id: roleLevel.id,
        en: roleLevel.en,
        ml: roleLevel.ml,
        hintEn: hints[roleLevel.id]?.en ?? "",
        hintMl: hints[roleLevel.id]?.ml ?? "",
      })),
      ...customLevels.map((customLevel) => ({
        id: customLevel.id,
        en: customLevel.name,
        ml: customLevel.name,
        hintEn: "Administrator-configured organisation level",
        hintMl: "അഡ്മിനിസ്ട്രേറ്റർ ക്രമീകരിച്ച ഓർഗനൈസേഷൻ ലെവൽ",
      })),
    ];
  }, []);

  const allLevelOptions = useMemo(() => {
    const combined = [...organisationLevelOptions];
    assignmentLevels.forEach((assignmentLevel) => {
      if (!combined.some((item) => item.id === assignmentLevel.id)) {
        combined.push(assignmentLevel);
      }
    });
    return combined;
  }, [organisationLevelOptions]);

  const levelOption = allLevelOptions.find((item) => item.id === level) || null;
  const district = districts.find((item) => item.id === districtId) || null;
  const selectedRegions = useMemo(
    () => districts.filter((item) => regionIds.includes(item.id)),
    [regionIds],
  );
  const orgDistrict = organisationalDistricts.find((item) => item.id === orgDistrictId) || null;
  const constituency = constituencies.find((item) => item.id === constituencyId) || null;
  const localBody = panchayats.find((item) => item.id === localBodyId) || null;
  const ward = localBodyId
    ? getWardsForLocalBody(localBodyId).find((item) => item.id === wardId)
    : undefined;
  const booth = boothDirectory.find((item) => item.id === boothId) || null;

  useEffect(() => {
    if (!designation) return;
    setPermissions([...rolePermissions]);
    setPresetId(presetIdForDesignation);
    setAccessManagement(roleAccessManagement);
    setPermissionError("");
  }, [designation, rolePermissions, presetIdForDesignation, roleAccessManagement]);

  const localBodyTypeLabel = localBodyTypeOptions.find((item) => item.id === localBodyType);

  const localBodyOptions = getLocalBodies(districtId, localBodyType);
  const wardOptions = localBodyId ? getWardsForLocalBody(localBodyId) : [];
  const boothOptions = constituencyId
    ? boothDirectory.filter((item) => item.constituencyId === constituencyId)
    : [];
  const constituencyOptions = districtId
    ? constituencies.filter((item) => item.districtId === districtId)
    : [];
  const orgDistrictOptions =
    level === "area"
      ? districtId
        ? organisationalDistricts.filter(
            (item) => item.id.replace(/^od-/, "").split("-")[0] === districtId,
          )
        : []
      : organisationalDistricts;

  const workerFilterDesignation = allDesignationChoices.find(
    (item) => item.id === draftWorkerFilters.designationId,
  );
  const workerFilterRegion = regions.find((item) => item.id === draftWorkerFilters.regionId);
  const workerFilterDistrict =
    districts.find((item) => item.id === draftWorkerFilters.districtId) ||
    organisationalDistricts.find((item) => item.id === draftWorkerFilters.districtId);
  const workerFilterConstituency = constituencies.find(
    (item) => item.id === draftWorkerFilters.constituencyId,
  );
  const workerFilterLocalBodyType = localBodyTypeOptions.find(
    (item) => item.id === draftWorkerFilters.localBodyType,
  );
  const workerFilterLocalBody = panchayats.find(
    (item) => item.id === draftWorkerFilters.localBodyId,
  );
  const workerFilterWard = draftWorkerFilters.localBodyId
    ? getWardsForLocalBody(draftWorkerFilters.localBodyId).find(
        (item) => item.id === draftWorkerFilters.wardId,
      )
    : undefined;
  const workerFilterBooth = boothDirectory.find((item) => item.id === draftWorkerFilters.boothId);
  const workerFilterOrgUnit = orgHierarchyData.find(
    (item) => item.id === draftWorkerFilters.orgUnitId,
  );
  const workerFilterAppRole = rolePresets.find((item) => item.id === draftWorkerFilters.appRole);
  const workerFilterDesignationOptions = useMemo<PartyDesignation[]>(() => {
    const filterLevel = draftWorkerFilters.level === "all" ? "" : draftWorkerFilters.level;
    const isDistrictLevel =
      filterLevel === "org_district" || filterLevel === "districts" || filterLevel === "district";
    const isMandalamLevel =
      filterLevel === "mandalam" || filterLevel === "assembly_constituency";

    const standard = partyDesignations.filter((item) => {
      if (!filterLevel) return true;
      if (isMandalamLevel) {
        return item.level === "mandalam" || item.level === "assembly_constituency";
      }
      if (isDistrictLevel) {
        return item.level === "org_district" || item.level === "districts" || item.level === "district";
      }
      return item.level === filterLevel;
    });
    const custom = managedRoles
      .filter(
        (role) =>
          !role.system &&
          role.status === "Active" &&
          !isRetiredCustomRole(role) &&
          (!filterLevel ||
            role.assignmentLevels.includes(filterLevel as AssignmentLevel) ||
            (isDistrictLevel &&
              (role.assignmentLevels.includes("district" as AssignmentLevel) ||
               role.assignmentLevels.includes("districts" as AssignmentLevel) ||
               role.assignmentLevels.includes("org_district" as AssignmentLevel))) ||
            (isMandalamLevel &&
              (role.assignmentLevels.includes("mandalam" as AssignmentLevel) ||
               role.assignmentLevels.includes("assembly_constituency" as AssignmentLevel)))),
      )
      .map((role) => managedRoleDesignation(role, filterLevel as AssignmentLevel));
    return [...standard, ...custom];
  }, [draftWorkerFilters.level, managedRoles]);
  const workerFilterConstituencyOptions = useMemo(() => {
    const distId = draftWorkerFilters.districtId;
    if (!distId || distId === "all") return constituencies;
    const revDist = districts.find(
      (d) => d.id === distId || distId === `od-${d.id}` || distId.startsWith(`od-${d.id}-`),
    );
    if (revDist) {
      return constituencies.filter((item) => item.districtId === revDist.id);
    }
    return constituencies.filter((item) => item.districtId === distId);
  }, [draftWorkerFilters.districtId]);
  const workerFilterLocalBodyOptions = getLocalBodies(
    draftWorkerFilters.districtId,
    draftWorkerFilters.localBodyType,
    draftWorkerFilters.constituencyId,
  );
  const workerFilterWardOptions = draftWorkerFilters.localBodyId
    ? getWardsForLocalBody(draftWorkerFilters.localBodyId)
    : [];
  const isUserView = actorRole !== "state_admin";
  const workerFilterBoothOptions = draftWorkerFilters.constituencyId
    ? boothDirectory.filter((item) => item.constituencyId === draftWorkerFilters.constituencyId)
    : isUserView
      ? boothDirectory
      : [];
  const appliedWorkerFilterCount = countActiveWorkerFilters(appliedWorkerFilters);

  const locationLine = (language: Lang) => {
    if (!level) return "";
    if (level === "state") {
      return language === "ml" ? "കേരളം, സംസ്ഥാന വ്യാപകം" : "Kerala, statewide";
    }
    if (level === "district") {
      return orgDistrict ? (language === "ml" ? orgDistrict.ml : orgDistrict.en) : "";
    }
    if (level === "region") {
      return selectedRegions.map((item) => (language === "ml" ? item.ml : item.en)).join(", ");
    }
    if (level === "area") {
      const regionLabel = district ? (language === "ml" ? district.ml : district.en) : "";
      const orgDistrictLabel = orgDistrict
        ? language === "ml"
          ? orgDistrict.ml
          : orgDistrict.en
        : "";
      const mandalamLabel = constituency
        ? language === "ml"
          ? constituency.ml
          : constituency.en
        : "";
      return [regionLabel, orgDistrictLabel, mandalamLabel].filter(Boolean).join(" → ");
    }
    if (level.startsWith("custom_org_")) {
      return district ? (language === "ml" ? district.ml : district.en) : "";
    }
    if (level === "mandalam") {
      return district && constituency
        ? `${language === "ml" ? district.ml : district.en} → ${
            language === "ml" ? constituency.ml : constituency.en
          }`
        : district
          ? language === "ml"
            ? district.ml
            : district.en
          : "";
    }
    if (level === "assembly_constituency") {
      return district && constituency
        ? `${language === "ml" ? district.ml : district.en} → ${
            language === "ml" ? constituency.ml : constituency.en
          }`
        : "";
    }
    if (level === "local_body") {
      return district && localBodyTypeLabel && localBody
        ? `${language === "ml" ? district.ml : district.en} → ${
            language === "ml" ? localBodyTypeLabel.ml : localBodyTypeLabel.en
          } → ${language === "ml" ? localBody.ml : localBody.en}`
        : "";
    }
    if (level === "ward") {
      return localBody && ward
        ? `${language === "ml" ? localBody.ml : localBody.en} → ${
            language === "ml" ? `വാർഡ് ${ward.number}` : `Ward ${ward.number}`
          }`
        : "";
    }
    if (level === "booth") {
      return district && constituency && booth
        ? `${language === "ml" ? district.ml : district.en} → ${
            language === "ml" ? constituency.ml : constituency.en
          } → ${language === "ml" ? `ബൂത്ത് ${booth.number}` : `Booth ${booth.number}`}`
        : "";
    }
    return orgUnitId ? getPartyOrgPath(orgUnitId, language) : "";
  };

  const resetLocations = () => {
    setRegionIds([]);
    setOrgDistrictId("");
    setDistrictId("");
    setConstituencyId("");
    setLocalBodyType("");
    setLocalBodyId("");
    setWardId("");
    setBoothId("");
    setOrgUnitId("");
  };

  const handleLevelChange = (nextLevel: AssignmentLevel) => {
    if (nextLevel !== level) resetLocations();
    setLevel(nextLevel);
    setErrors((prev) => ({
      ...prev,
      level: "",
      designation: "",
      district: "",
      region: "",
      org_district: "",
    }));
    if (designation && designation.level !== nextLevel) setDesignationId("");
  };

  const handleDesignationChange = (nextId: string) => {
    const next = designationLookupChoices.find((item) => item.id === nextId);
    if (!next) return;
    const isOrganisationOnlyLevel =
      level === "region" ||
      level === "mandalam" ||
      level === "area" ||
      level.startsWith("custom_org_");
    if (next.level !== level && !isOrganisationOnlyLevel) {
      resetLocations();
      setLevel(next.level);
    }
    setDesignationId(nextId);
    setErrors((prev) => ({ ...prev, designation: "", level: "" }));
  };

  const handleDistrictChange = (nextId: string) => {
    setDistrictId(nextId);
    if (level === "area") setOrgDistrictId("");
    setConstituencyId("");
    setLocalBodyId("");
    setWardId("");
    setBoothId("");
    setErrors((prev) => ({
      ...prev,
      district: "",
      org_district: "",
      region: "",
      constituency: "",
      local_body: "",
      ward: "",
      booth: "",
    }));
  };
  const handleConstituencyChange = (nextId: string) => {
    setConstituencyId(nextId);
    setBoothId("");
    setErrors((prev) => ({ ...prev, constituency: "", booth: "" }));
  };
  const handleLocalBodyTypeChange = (nextType: LocalBodyType) => {
    setLocalBodyType(nextType);
    setLocalBodyId("");
    setWardId("");
    setErrors((prev) => ({ ...prev, local_body_type: "", local_body: "", ward: "" }));
  };
  const handleLocalBodyChange = (nextId: string) => {
    setLocalBodyId(nextId);
    setWardId("");
    setErrors((prev) => ({ ...prev, local_body: "", ward: "" }));
  };

  const validateStep1 = () => {
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 3) {
      nextErrors.name = tr(
        "Enter the full name (at least 3 characters).",
        "പൂർണ്ണമായ പേര് നൽകുക (കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ).",
      );
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      nextErrors.mobile = tr(
        "Enter a valid 10-digit Indian mobile number.",
        "സാധുവായ 10 അക്ക ഇന്ത്യൻ മൊബൈൽ നമ്പർ നൽകുക.",
      );
    } else if (duplicateWorker && duplicateWorker.id !== editingWorkerId) {
      nextErrors.mobile = tr(
        "This mobile number is already registered.",
        "ഈ മൊബൈൽ നമ്പർ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.",
      );
    }
    if (!level) {
      nextErrors.level = tr("Select an organisation level.", "ഓർഗനൈസേഷൻ ലെവൽ തിരഞ്ഞെടുക്കുക.");
    }
    if ((level === "district" || level === "area") && !orgDistrictId) {
      nextErrors.org_district = tr(
        "Select an organisational district.",
        "ഓർഗനൈസേഷണൽ ജില്ല തിരഞ്ഞെടുക്കുക.",
      );
    } else if (
      level &&
      level !== "state" &&
      level !== "region" &&
      level !== "district" &&
      level !== "area" &&
      !districtId
    ) {
      nextErrors.district = tr("Select a district.", "ജില്ല തിരഞ്ഞെടുക്കുക.");
    }
    if (level === "region" && regionIds.length === 0) {
      nextErrors.region = tr("Select at least one region.", "കുറഞ്ഞത് ഒരു റീജിയൺ തിരഞ്ഞെടുക്കുക.");
    }
    if (level === "area" && !districtId) {
      nextErrors.region = tr("Select a region.", "റീജിയൺ തിരഞ്ഞെടുക്കുക.");
    }
    if (
      (level === "assembly_constituency" || level === "mandalam" || level === "area") &&
      !constituencyId
    ) {
      nextErrors.constituency =
        level === "area"
          ? tr("Select a Mandalam.", "മണ്ഡലം തിരഞ്ഞെടുക്കുക.")
          : tr("Select an assembly constituency.", "നിയോജകമണ്ഡലം തിരഞ്ഞെടുക്കുക.");
    }
    if (level === "local_body" || level === "ward") {
      if (!localBodyType) {
        nextErrors.local_body_type = tr(
          "Select a local body type.",
          "തദ്ദേശ സ്ഥാപന തരം തിരഞ്ഞെടുക്കുക.",
        );
      }
      if (!localBodyId) {
        nextErrors.local_body = tr("Select a local body.", "തദ്ദേശ സ്ഥാപനം തിരഞ്ഞെടുക്കുക.");
      }
    }
    if (level === "ward" && !wardId) {
      nextErrors.ward = tr("Select a ward.", "വാർഡ് തിരഞ്ഞെടുക്കുക.");
    }
    if (level === "booth") {
      if (!constituencyId) {
        nextErrors.constituency = tr(
          "Select an assembly constituency.",
          "നിയോജകമണ്ഡലം തിരഞ്ഞെടുക്കുക.",
        );
      }
      if (!boothId) {
        nextErrors.booth = tr("Select a booth.", "ബൂത്ത് തിരഞ്ഞെടുക്കുക.");
      }
    }
    if (level === "org_unit" && !orgUnitId) {
      nextErrors.org_unit = tr(
        "Select a party organisational unit.",
        "പാർട്ടി ഓർഗനൈസേഷണൽ യൂണിറ്റ് തിരഞ്ഞെടുക്കുക.",
      );
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildProfile = (): WorkerProfile => {
    const createdAt = new Date().toISOString();
    return {
      id: `PW-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      designationEn: designationTitle.trim() || designation?.en || "",
      designationMl: designationTitle.trim() || designation?.ml || "",
      mobile,
      levelLabelEn: levelOption?.en || "",
      levelLabelMl: levelOption?.ml || "",
      locationLines: { en: locationLine("en"), ml: locationLine("ml") },
      districtNameEn:
        level === "district" || level === "area"
          ? orgDistrict?.en || tr("Kerala", "കേരളം")
          : district?.en || selectedRegions[0]?.en || tr("Kerala", "കേരളം"),
      districtNameMl:
        level === "district" || level === "area"
          ? orgDistrict?.ml || "കേരളം"
          : district?.ml || selectedRegions[0]?.ml || "കേരളം",
      orgDistrictId: orgDistrictId || undefined,
      orgDistrictNameEn: orgDistrict?.en,
      orgDistrictNameMl: orgDistrict?.ml,
      regionIds: regionIds.length ? regionIds : undefined,
      regionNamesEn: selectedRegions.length ? selectedRegions.map((item) => item.en) : undefined,
      regionNamesMl: selectedRegions.length ? selectedRegions.map((item) => item.ml) : undefined,
      permissions,
      dataAccess,
      grants,
      accessManagement,
      designationId,
      level: level || undefined,
      districtId: level === "region" || level === "district" ? undefined : districtId || undefined,
      constituencyId: constituencyId || undefined,
      localBodyType: localBodyType || undefined,
      localBodyId: localBodyId || undefined,
      wardId: wardId || undefined,
      boothId: boothId || undefined,
      orgUnitId: orgUnitId || undefined,
      presetId,
      status: "Active",
      createdAt,
      createdBy: actorRole === "state_admin" ? "State Admin" : "User",
    };
  };

  const recordActivity = (
    worker: WorkerProfile,
    action: "party_worker_created" | "party_worker_updated" | "party_worker_status_changed",
  ) => {
    if (typeof window === "undefined") return;
    try {
      const key = "vk-party-worker-activity";
      const previous = JSON.parse(window.localStorage.getItem(key) || "[]") as unknown[];
      window.localStorage.setItem(
        key,
        JSON.stringify(
          [
            {
              id: worker.id,
              workerName: worker.name,
              action,
              creator: worker.createdBy,
              createdAt: worker.createdAt,
              permissions: worker.permissions,
              accessManagement: worker.accessManagement,
              accessGrants: worker.grants.map((grant) => ({
                scopeType: grant.scopeType,
                areas: grant.areas.map((area) => area.shortEn),
              })),
            },
            ...previous,
          ].slice(0, 50),
        ),
      );
    } catch {
      // Activity history is best-effort in this prototype.
    }
  };

  const handleContinue = () => {
    if (!validateStep1()) return;
    setErrors({});
    setStep(2);
  };

  const handleCreate = () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!appRoleId) {
      setErrors((prev) => ({
        ...prev,
        role: tr("Select a role.", "ഒരു റോൾ തിരഞ്ഞെടുക്കുക."),
      }));
      return;
    }
    const unauthorisedPermission = permissions.find((key) => {
      const [moduleId, actionId] = key.split(".");
      return !canDelegateAction(actorRole, moduleId as PermissionModuleId, actionId);
    });
    if (unauthorisedPermission) {
      setPermissionError(
        tr(
          "You are not authorised to grant one or more selected permissions.",
          "തിരഞ്ഞെടുത്ത ഒന്നോ അതിലധികമോ അനുമതികൾ നൽകാൻ നിങ്ങൾക്ക് അനുമതിയില്ല.",
        ),
      );
      return;
    }
    const unauthorisedGrant = grants.find(
      (grant) => grant.scopeType === "all_kerala" && !canDelegateStatewide(actorRole),
    );
    if (unauthorisedGrant) {
      setPermissionError(
        tr(
          "One or more access areas exceed your delegation authority.",
          "ഒന്നോ അതിലധികമോ ആക്സസ് പ്രദേശങ്ങൾ നിങ്ങളുടെ നൽകാനുള്ള അധികാരത്തിന് പുറത്താണ്.",
        ),
      );
      return;
    }
    if (accessManagement && !canDelegateAccessManagement(actorRole)) {
      setPermissionError(
        tr(
          "You are not authorised to grant access-management authority.",
          "ആക്സസ് മാനേജ്മെന്റ് അധികാരം നൽകാൻ നിങ്ങൾക്ക് അനുമതിയില്ല.",
        ),
      );
      return;
    }
    setPermissionError("");
    const worker = buildProfile();

    if (editingWorkerId && profile) {
      const updatedWorker: WorkerProfile = {
        ...profile,
        ...worker,
        id: profile.id,
        status: profile.status,
        createdAt: profile.createdAt,
        createdBy: profile.createdBy,
        isExisting: profile.isExisting,
      };
      const existingIndex = sessionCreatedWorkers.findIndex((item) => item.id === updatedWorker.id);
      if (existingIndex >= 0) sessionCreatedWorkers[existingIndex] = updatedWorker;
      else sessionCreatedWorkers.unshift(updatedWorker);
      persistWorker(updatedWorker);
      recordActivity(updatedWorker, "party_worker_updated");
      setProfile(updatedWorker);
      setEditingWorkerId(null);
      setPhase("profile");
      return;
    }

    sessionCreatedWorkers.unshift(worker);
    persistWorker(worker);
    recordActivity(worker, "party_worker_created");
    setProfile(worker);
    setPhase("profile");
    onCreated?.(worker);
  };

  const openExistingWorker = () => {
    if (!duplicateWorker || !canOpenExistingWorker) return;
    setProfile(duplicateWorker);
    setPhase("profile");
  };

  const loadWorkerIntoForm = (worker: WorkerProfile) => {
    const workerDesignation = allDesignationChoices.find(
      (item) =>
        item.id === worker.designationId ||
        item.en === worker.designationEn ||
        item.ml === worker.designationMl,
    );
    const workerLevel = allLevelOptions.find(
      (item) =>
        item.id === worker.level ||
        item.en === worker.levelLabelEn ||
        item.ml === worker.levelLabelMl,
    );
    const workerDistrict =
      districts.find((item) => item.id === worker.districtId) ||
      districts.find(
        (item) => item.en === worker.districtNameEn || item.ml === worker.districtNameMl,
      );
    const workerOrgDistrict =
      organisationalDistricts.find((item) => item.id === worker.orgDistrictId) ||
      organisationalDistricts.find(
        (item) => item.en === worker.orgDistrictNameEn || item.ml === worker.orgDistrictNameMl,
      ) ||
      organisationalDistricts.find(
        (item) => item.en === worker.districtNameEn || item.ml === worker.districtNameMl,
      );
    const workerRegionIds = (() => {
      const workerLevelId = workerLevel?.id || worker.level;
      if (workerLevelId !== "region") return [];
      const storedIds = (worker.regionIds ?? []).filter((id) =>
        districts.some((item) => item.id === id),
      );
      if (storedIds.length) return storedIds;
      const storedNamesEn = worker.regionNamesEn ?? [];
      const storedNamesMl = worker.regionNamesMl ?? [];
      const byName = districts.filter(
        (item) => storedNamesEn.includes(item.en) || storedNamesMl.includes(item.ml),
      );
      if (byName.length) return byName.map((item) => item.id);
      return districts
        .filter(
          (item) =>
            worker.locationLines.en.includes(item.en) || worker.locationLines.ml.includes(item.ml),
        )
        .map((item) => item.id);
    })();
    const workerConstituency =
      constituencies.find((item) => item.id === worker.constituencyId) ||
      constituencies.find(
        (item) =>
          worker.locationLines.en.includes(item.en) || worker.locationLines.ml.includes(item.ml),
      );
    const workerLocalBody =
      panchayats.find((item) => item.id === worker.localBodyId) ||
      panchayats.find(
        (item) =>
          worker.locationLines.en.includes(item.en) || worker.locationLines.ml.includes(item.ml),
      );
    const workerWard = workerLocalBody
      ? getWardsForLocalBody(workerLocalBody.id).find(
          (item) =>
            item.id === worker.wardId ||
            worker.locationLines.en.includes(item.displayEn) ||
            worker.locationLines.ml.includes(item.displayMl),
        )
      : undefined;
    const workerBooth =
      boothDirectory.find((item) => item.id === worker.boothId) ||
      boothDirectory.find((item) => worker.locationLines.en.includes(item.nameEn));

    setName(worker.name);
    setMobile(worker.mobile);
    setDesignationTitle(worker.designationEn || "");
    setDesignationId(workerDesignation?.id || "");
    setLevel(workerLevel?.id || "");
    setRegionIds(workerRegionIds);
    setOrgDistrictId(workerOrgDistrict?.id || "");
    setDistrictId(
      workerLevel?.id === "region" || workerLevel?.id === "district"
        ? ""
        : workerDistrict?.id || "",
    );
    setConstituencyId(workerConstituency?.id || "");
    setLocalBodyType(workerLocalBody?.type || worker.localBodyType || "");
    setLocalBodyId(workerLocalBody?.id || "");
    setWardId(workerWard?.id || "");
    setBoothId(workerBooth?.id || "");
    setOrgUnitId(worker.orgUnitId || "");
    setPresetId(worker.presetId || "custom");
    setPermissions(worker.permissions);
    setDataAccess(cloneRoleDataAccess(worker.dataAccess));
    setGrants(worker.grants);
    setAccessManagement(worker.accessManagement);
    setErrors({});
    setPermissionError("");
  };

  const beginWorkerEdit = () => {
    if (!profile) return;
    loadWorkerIntoForm(profile);
    setEditingWorkerId(profile.id);
    setStep(1);
    setPhase("form");
    setProfileMenuOpen(false);
  };

  const openWorkerProfile = (worker: WorkerProfile) => {
    setProfile(worker);
    setWorkerFiltersOpen(false);
    setProfileMenuOpen(false);
    setProfilePhotoError("");
    setPhase("profile");
  };

  const triggerProfilePhotoUpload = () => {
    if (profilePhotoBusy) return;
    setProfileMenuOpen(false);
    profilePhotoInputRef.current?.click();
  };

  const handleProfilePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) {
      setProfilePhotoError(
        tr("Choose an image file (JPG, PNG or WebP).", "ഒരു ഇമേജ് ഫയൽ തിരഞ്ഞെടുക്കുക."),
      );
      return;
    }
    if (file.size > profilePhotoMaxUploadBytes) {
      setProfilePhotoError(tr("Image must be smaller than 8 MB.", "ഇമേജ് 8 MB-ൽ ചെറുതായിരിക്കണം."));
      return;
    }
    setProfilePhotoBusy(true);
    setProfilePhotoError("");
    try {
      const photoUrl = await readProfilePhoto(file);
      const updatedWorker: WorkerProfile = { ...profile, photoUrl };
      const existingIndex = sessionCreatedWorkers.findIndex((item) => item.id === updatedWorker.id);
      if (existingIndex >= 0) sessionCreatedWorkers[existingIndex] = updatedWorker;
      else sessionCreatedWorkers.unshift(updatedWorker);
      persistWorker(updatedWorker);
      recordActivity(updatedWorker, "party_worker_updated");
      setProfile(updatedWorker);
    } catch {
      setProfilePhotoError(
        tr(
          "Could not load that image. Try a different photo.",
          "ഈ ഇമേജ് ലോഡ് ചെയ്യാനായില്ല. മറ്റൊരു ഫോട്ടോ ശ്രമിക്കുക.",
        ),
      );
    } finally {
      setProfilePhotoBusy(false);
    }
  };

  const openWorkerFilters = () => {
    setDraftWorkerFilters({ ...appliedWorkerFilters });
    setWorkerMoreFiltersOpen(false);
    setPicker(null);
    setWorkerFiltersOpen(true);
  };

  const closeWorkerFilters = () => {
    setWorkerFiltersOpen(false);
    setPicker(null);
  };

  const applyWorkerFilters = () => {
    setAppliedWorkerFilters({ ...draftWorkerFilters });
    setWorkerFiltersOpen(false);
    setPicker(null);
  };

  const resetWorkerFilters = () => {
    setDraftWorkerFilters({ ...defaultWorkerListFilters });
    setPicker(null);
  };

  const clearWorkerListFilters = () => {
    setAppliedWorkerFilters({ ...defaultWorkerListFilters });
    setDraftWorkerFilters({ ...defaultWorkerListFilters });
    setWorkerSearch("");
  };

  const clearedWorkerFilterLocations = () => ({
    regionId: "",
    districtId: "",
    constituencyId: "",
    localBodyType: "" as const,
    localBodyId: "",
    wardId: "",
    boothId: "",
    orgUnitId: "",
  });

  const handleWorkerFilterRegionChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => {
      const value = nextId === "all" ? "" : nextId;
      if (prev.regionId === value) return prev;
      return {
        ...prev,
        regionId: value,
        districtId: "",
        constituencyId: "",
        localBodyType: "",
        localBodyId: "",
        wardId: "",
        boothId: "",
      };
    });
  };

  const handleWorkerFilterLevelChange = (nextLevel: AssignmentLevel | "all") => {
    setDraftWorkerFilters((prev) => {
      if (prev.level === nextLevel) return prev;
      const previousDesignation = allDesignationChoices.find(
        (item) => item.id === prev.designationId,
      );
      const isDistrictLevel = (l?: string) =>
        l === "org_district" || l === "districts" || l === "district";
      const isMandalamLevel = (l?: string) =>
        l === "mandalam" || l === "assembly_constituency";

      let levelMatches = false;
      if (!previousDesignation?.level || nextLevel === "all") {
        levelMatches = true;
      } else if (isDistrictLevel(nextLevel) && isDistrictLevel(previousDesignation.level)) {
        levelMatches = true;
      } else if (isMandalamLevel(nextLevel) && isMandalamLevel(previousDesignation.level)) {
        levelMatches = true;
      } else if (previousDesignation.level === nextLevel) {
        levelMatches = true;
      }

      const designationId = levelMatches ? prev.designationId : "all";
      return {
        ...prev,
        ...clearedWorkerFilterLocations(),
        level: nextLevel,
        designationId,
      };
    });
  };

  const handleWorkerFilterDesignationChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => {
      if (nextId === "all") return { ...prev, designationId: "all" };
      const nextDesignation = allDesignationChoices.find((item) => item.id === nextId);
      if (!nextDesignation) return prev;
      const isDistrictLevel = (l?: string) =>
        l === "org_district" || l === "districts" || l === "district";
      const isMandalamLevel = (l?: string) =>
        l === "mandalam" || l === "assembly_constituency";

      const sameLevel =
        prev.level === nextDesignation.level ||
        (isDistrictLevel(prev.level) && isDistrictLevel(nextDesignation.level)) ||
        (isMandalamLevel(prev.level) && isMandalamLevel(nextDesignation.level));
      const levelChanged = !sameLevel;
      return {
        ...prev,
        designationId: nextId,
        level: nextDesignation.level,
        ...(levelChanged ? clearedWorkerFilterLocations() : {}),
      };
    });
  };

  const handleWorkerFilterDistrictChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => {
      const value = nextId === "all" ? "" : nextId;
      if (prev.districtId === value) return prev;
      return {
        ...prev,
        districtId: value,
        constituencyId: "",
        localBodyType: "",
        localBodyId: "",
        wardId: "",
        boothId: "",
      };
    });
  };

  const handleWorkerFilterConstituencyChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => {
      const value = nextId === "all" ? "" : nextId;
      if (prev.constituencyId === value) return prev;
      const constObj = constituencies.find((c) => c.id === value);
      const matchedOrgDistrictId = constObj
        ? (organisationalDistricts.find(
            (od) => od.id === `od-${constObj.districtId}` || od.id.startsWith(`od-${constObj.districtId}-`),
          )?.id || constObj.districtId)
        : prev.districtId;
      return {
        ...prev,
        districtId: prev.districtId || matchedOrgDistrictId,
        constituencyId: value,
        boothId: "",
      };
    });
  };

  const handleWorkerFilterLocalBodyTypeChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => {
      const value = (nextId === "all" ? "" : nextId) as LocalBodyType | "";
      if (prev.localBodyType === value) return prev;
      return { ...prev, localBodyType: value, localBodyId: "", wardId: "" };
    });
  };

  const handleWorkerFilterLocalBodyChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => {
      const value = nextId === "all" ? "" : nextId;
      if (prev.localBodyId === value) return prev;
      return { ...prev, localBodyId: value, wardId: "" };
    });
  };

  const handleWorkerFilterWardChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => ({
      ...prev,
      wardId: nextId === "all" ? "" : nextId,
    }));
  };

  const handleWorkerFilterBoothChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => ({
      ...prev,
      boothId: nextId === "all" ? "" : nextId,
    }));
  };

  const handleWorkerFilterOrgUnitChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => ({
      ...prev,
      orgUnitId: nextId === "all" ? "" : nextId,
    }));
  };

  const handleWorkerFilterAppRoleChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => ({
      ...prev,
      appRole: nextId === "all" ? "all" : (nextId as RolePresetId),
    }));
  };

  const handleWorkerFilterStatusChange = (nextId: string) => {
    setDraftWorkerFilters((prev) => ({
      ...prev,
      status: nextId as WorkerListFilters["status"],
    }));
  };

  const beginAccessAreaChange = () => {
    if (!profile) return;
    loadWorkerIntoForm(profile);
    setEditingWorkerId(profile.id);
    setStep(2);
    setPhase("form");
    setFocusAccessAreas(true);
    setProfileMenuOpen(false);
  };

  const toggleWorkerStatus = () => {
    if (!profile) return;
    const updatedWorker: WorkerProfile = {
      ...profile,
      status: profile.status === "Deactivated" ? "Active" : "Deactivated",
    };
    const existingIndex = sessionCreatedWorkers.findIndex((item) => item.id === updatedWorker.id);
    if (existingIndex >= 0) sessionCreatedWorkers[existingIndex] = updatedWorker;
    else sessionCreatedWorkers.unshift(updatedWorker);
    persistWorker(updatedWorker);
    recordActivity(updatedWorker, "party_worker_status_changed");
    setProfile(updatedWorker);
    setProfileMenuOpen(false);
  };

  const openAccessSheet = (grant?: AccessGrant) => {
    setSheetAppRoleId(appRoleId);
    if (grant) {
      setEditingGrantId(grant.id);
      setSheetScope(grant.scopeType);
      setSheetFilters(grant.filters);
      setSheetAreas(Object.fromEntries(grant.areas.map((area) => [area.id, area])));
    } else {
      setEditingGrantId(null);
      setSheetScope("districts");
      setSheetFilters({
        districtIds: districtId ? [districtId] : undefined,
        constituencyIds: constituencyId ? [constituencyId] : undefined,
        localBodyTypes: localBodyType ? [localBodyType] : undefined,
        localBodyIds: localBodyId ? [localBodyId] : undefined,
      });
      setSheetAreas({});
    }
    setSheetSearch("");
    setSheetError("");
    setIsAccessSheetOpen(true);
  };

  const accessOrganisationLevelOptions: ScopeTypeOption[] = [
    { id: "all_kerala", en: "State", ml: "സംസ്ഥാനം" },
    { id: "regions", en: "Region", ml: "റീജിയൺ" },
    { id: "districts", en: "Organisational District", ml: "ഓർഗനൈസേഷണൽ ജില്ല" },
    { id: "constituencies", en: "Mandalam", ml: "മണ്ഡലം" },
    { id: "local_bodies", en: "Area", ml: "ഏരിയ" },
    { id: "booths", en: "Booth", ml: "ബൂത്ത്" },
  ];
  const availableScopeTypes: ScopeTypeOption[] = accessOrganisationLevelOptions.filter(
    (option: ScopeTypeOption) => {
      return option.id !== "all_kerala" || canDelegateStatewide(actorRole);
    },
  );
  const legacyScopeType =
    editingGrantId && !availableScopeTypes.some((option) => option.id === sheetScope)
      ? scopeTypeOptions.find((option) => option.id === sheetScope) || null
      : null;
  const scopeTypeChoices = legacyScopeType
    ? [...availableScopeTypes, legacyScopeType]
    : availableScopeTypes;

  const handleScopeChange = (scope: ScopeType) => {
    setSheetScope(scope);
    setSheetAreas({});
    setSheetError("");
  };

  const sheetAreaOptions = useMemo(
    () => getAreaOptions(sheetScope, sheetFilters, lang),
    [sheetScope, sheetFilters, lang],
  );

  useEffect(() => {
    const validAreaIds = new Set(sheetAreaOptions.map((area) => area.id));
    setSheetAreas((prev) => {
      const next = Object.fromEntries(
        Object.entries(prev).filter(([areaId]) => validAreaIds.has(areaId)),
      );
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [sheetAreaOptions]);

  const filteredSheetAreas = useMemo(() => {
    const query = sheetSearch.trim().toLowerCase();
    if (!query) return sheetAreaOptions;
    return sheetAreaOptions.filter((area) =>
      [area.en, area.ml, area.shortEn, area.parentEn ?? "", area.parentMl ?? ""].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [sheetAreaOptions, sheetSearch]);

  const selectedSheetAreas = Object.values(sheetAreas);
  const selectedSheetParents = new Set(
    selectedSheetAreas.map((area) => area.parentEn).filter(Boolean),
  );
  const sheetGrantPreview: AccessGrant = {
    id: editingGrantId || "preview",
    scopeType: sheetScope,
    areas: selectedSheetAreas,
    filters: sheetFilters,
    contextEn: selectedSheetParents.size === 1 ? selectedSheetAreas[0].parentEn : undefined,
    contextMl: selectedSheetParents.size === 1 ? selectedSheetAreas[0].parentMl : undefined,
  };

  const handleSaveAccessArea = () => {
    if (selectedSheetAreas.length === 0) {
      setSheetError(
        tr(
          "Select at least one area. No selected area means no access.",
          "കുറഞ്ഞത് ഒരു പ്രദേശം തിരഞ്ഞെടുക്കുക. പ്രദേശം തിരഞ്ഞെടുക്കാത്തത് ആക്സസ് ഇല്ല എന്നാണ്.",
        ),
      );
      return;
    }
    const parents = new Set(selectedSheetAreas.map((area) => area.parentEn).filter(Boolean));
    const grant: AccessGrant = {
      id: editingGrantId || `grant-${Date.now()}`,
      scopeType: sheetScope,
      areas: selectedSheetAreas,
      filters: sheetFilters,
      contextEn: parents.size === 1 ? selectedSheetAreas[0].parentEn : undefined,
      contextMl: parents.size === 1 ? selectedSheetAreas[0].parentMl : undefined,
    };
    setGrants((prev) =>
      editingGrantId
        ? prev.map((item) => (item.id === editingGrantId ? grant : item))
        : [...prev, grant],
    );
    setAppRoleId(sheetAppRoleId);
    setIsAccessSheetOpen(false);
    setEditingGrantId(null);
    setSheetError("");
  };

  const openPicker = (key: PickerKey) => {
    setPickerSearch("");
    setPicker(key);
  };

  const renderPicker = () => {
    if (!picker) return null;
    const isMultiFilter = picker.startsWith("filter_") || picker === "regions";
    let title = "";
    let options: PickerOption[] = [];
    let selectedId = "";
    let selectedIds: string[] = [];
    let onPick: (id: string) => void = () => undefined;
    let onToggle: (id: string) => void = () => undefined;
    let onClear: (() => void) | null = null;

    if (picker === "app_role") {
      title = tr("Role", "റോൾ");
      options = roleChoices.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedId = appRoleId;
      onPick = (id) => {
        setAppRoleId(id);
        setErrors((prev) => ({ ...prev, role: "" }));
      };
    } else if (picker === "designation_catalogue") {
      title = tr("Designation", "പദവി");
      const catalogueChoices = level
        ? designationCatalogue.filter((item) => item.level === level)
        : designationCatalogue;
      options = catalogueChoices.map((item) => ({
        id: item.id,
        label: designationOptionLabel(item, lang, level),
        search: `${item.en} ${item.ml}`,
      }));
      selectedId = designationId;
      onPick = handleDesignationChange;
    } else if (picker === "role_level") {
      title = tr("Role Level", "റോൾ ലെവൽ");
      options = roleLevelOptions.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedId = roleLevel;
      onPick = (id) => setRoleLevel(id as AssignmentLevel);
    } else if (picker === "level") {
      title = tr("Organisation Level", "ഓർഗനൈസേഷൻ ലെവൽ");
      options = organisationLevelOptions.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        hint: lang === "ml" ? item.hintMl : item.hintEn,
        search: `${item.en} ${item.ml} ${item.hintEn} ${item.hintMl}`,
      }));
      selectedId = level;
      onPick = (id) => handleLevelChange(id as AssignmentLevel);
    } else if (picker === "org_district") {
      title = tr("Organisational District", "ഓർഗനൈസേഷണൽ ജില്ല");
      options = orgDistrictOptions.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedId = orgDistrictId;
      onPick = (id) => {
        setOrgDistrictId(id);
        if (level === "area") setConstituencyId("");
        setErrors((prev) => ({
          ...prev,
          org_district: "",
          ...(level === "area" ? { constituency: "" } : {}),
        }));
      };
    } else if (picker === "regions") {
      title = tr("Regions", "റീജിയണുകൾ");
      options = districts.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedIds = regionIds;
      onToggle = (id) => {
        setRegionIds((prev) => toggleFilterId(prev, id) ?? []);
        setErrors((prev) => ({ ...prev, region: "" }));
      };
      onClear = () => setRegionIds([]);
    } else if (picker === "district") {
      title = level === "area" ? tr("Region", "റീജിയൺ") : tr("District", "ജില്ല");
      options = districts.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedId = districtId;
      onPick = handleDistrictChange;
    } else if (picker === "constituency") {
      title =
        level === "area" ? tr("Mandalam", "മണ്ഡലം") : tr("Assembly Constituency", "നിയോജകമണ്ഡലം");
      options = constituencyOptions.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedId = constituencyId;
      onPick = handleConstituencyChange;
    } else if (picker === "local_body_type") {
      title = tr("Local Body Type", "തദ്ദേശ സ്ഥാപന തരം");
      options = localBodyTypeOptions.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedId = localBodyType;
      onPick = (id) => handleLocalBodyTypeChange(id as LocalBodyType);
    } else if (picker === "local_body") {
      title = tr("Local Body", "തദ്ദേശ സ്ഥാപനം");
      options = localBodyOptions.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        hint: localBodyTypeOptions.find((typeItem) => typeItem.id === item.type)?.[lang],
        search: `${item.en} ${item.ml}`,
      }));
      selectedId = localBodyId;
      onPick = handleLocalBodyChange;
    } else if (picker === "ward") {
      title = tr("Ward", "വാർഡ്");
      options = wardOptions.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.displayMl : item.displayEn,
        search: `Ward ${item.number} ${item.displayEn} ${item.displayMl}`,
      }));
      selectedId = wardId;
      onPick = (id) => {
        setWardId(id);
        setErrors((prev) => ({ ...prev, ward: "" }));
      };
    } else if (picker === "booth") {
      title = tr("Booth", "ബൂത്ത്");
      options = boothOptions.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.nameMl : item.nameEn,
        hint: tr(
          `Booth ${item.number} in this constituency`,
          `ഈ മണ്ഡലത്തിലെ ബൂത്ത് ${item.number}`,
        ),
        search: `Booth ${item.number} ${item.nameEn} ${item.nameMl}`,
      }));
      selectedId = boothId;
      onPick = (id) => {
        setBoothId(id);
        setErrors((prev) => ({ ...prev, booth: "" }));
      };
    } else if (picker === "org_unit") {
      title = tr("Party Organisational Unit", "പാർട്ടി ഓർഗനൈസേഷണൽ യൂണിറ്റ്");
      options = orgHierarchyData.map((item) => ({
        id: item.id,
        label: item.name,
        hint: `${getOrgLevelLabel(item.level, lang)} · ${getPartyOrgPath(item.id, lang)}`,
      }));
      selectedId = orgUnitId;
      onPick = (id) => {
        setOrgUnitId(id);
        setErrors((prev) => ({ ...prev, org_unit: "" }));
      };
    } else if (picker === "worker_filter_level") {
      title = tr("Location Level", "ലൊക്കേഷൻ ലെവൽ");
      options = [
        {
          id: "all",
          label: tr("All levels", "എല്ലാ ലെവലുകളും"),
          search: "all levels any",
        },
        {
          id: "state",
          label: tr("State", "സംസ്ഥാനം"),
          hint: tr("Kerala statewide", "സംസ്ഥാന വ്യാപകം"),
          search: "state kerala സംസ്ഥാനം",
        },
        {
          id: "region",
          label: tr("Region", "റീജിയൺ"),
          hint: tr("Regional clusters", "റീജിയണൽ ക്ലസ്റ്ററുകൾ"),
          search: "region regions northern central southern വടക്കൻ മധ്യ തെക്കൻ റീജിയൺ",
        },
        {
          id: "org_district",
          label: tr("Organisational District", "ഓർഗനൈസേഷണൽ ജില്ല"),
          hint: tr("Organisational districts", "ഓർഗനൈസേഷണൽ ജില്ലകൾ"),
          search: "organisational district ഓർഗനൈസേഷണൽ ജില്ല",
        },
        {
          id: "mandalam",
          label: tr("Assembly Mandalam", "അസംബ്ലി മണ്ഡലം"),
          hint: tr("Assembly mandalams", "അസംബ്ലി മണ്ഡലങ്ങൾ"),
          search: "assembly mandalam constituency അസംബ്ലി മണ്ഡലം",
        },
        {
          id: "area",
          label: tr("Area", "ഏരിയ"),
          hint: tr("Area level", "ഏരിയ ലെവൽ"),
          search: "area ഏരിയ",
        },
        {
          id: "ward",
          label: tr("Ward", "വാർഡ്"),
          hint: tr("Ward level", "വാർഡ് ലെവൽ"),
          search: "ward വാർഡ്",
        },
      ];
      selectedId = draftWorkerFilters.level;
      onPick = (id) => handleWorkerFilterLevelChange(id as AssignmentLevel | "all");
    } else if (picker === "worker_filter_region") {
      title = tr("Region", "റീജിയൺ");
      options = [
        {
          id: "all",
          label: tr("All Regions", "എല്ലാ റീജിയണുകളും"),
          search: "all regions any",
        },
        ...regions.map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.ml : item.en,
          hint: tr(`${item.count} Organisational Districts`, `${item.count} ഓർഗനൈസേഷണൽ ജില്ലകൾ`),
          search: `${item.en} ${item.ml}`,
        })),
      ];
      selectedId = draftWorkerFilters.regionId || "all";
      onPick = handleWorkerFilterRegionChange;
    } else if (picker === "worker_filter_designation") {
      title = tr("Designation", "പദവി");
      options = [
        {
          id: "all",
          label: tr("All designations", "എല്ലാ പദവികളും"),
          search: "all designations any",
        },
        ...workerFilterDesignationOptions.map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.ml : item.en,
          hint: (
            assignmentLevels.find((levelItem) => levelItem.id === item.level) ||
            (item.level === "district" || item.level === "districts" || item.level === "org_district"
              ? { en: "Organisational District", ml: "ഓർഗനൈസേഷണൽ ജില്ല" }
              : undefined)
          )?.[lang],
          search: `${item.en} ${item.ml}`,
        })),
      ];
      selectedId = draftWorkerFilters.designationId;
      onPick = handleWorkerFilterDesignationChange;
    } else if (picker === "worker_filter_district") {
      title = tr("Organisational District", "ഓർഗനൈസേഷണൽ ജില്ല");
      options = [
        {
          id: "all",
          label: tr("All Organisational Districts", "എല്ലാ ഓർഗനൈസേഷണൽ ജില്ലകളും"),
          search: "all districts any",
        },
        ...organisationalDistricts.map((item) => {
          const regKey = Object.keys(REGION_ORGANISATIONAL_DISTRICTS).find((rk) =>
            REGION_ORGANISATIONAL_DISTRICTS[rk].includes(item.id),
          );
          const regObj = regions.find((r) => r.id === regKey);
          return {
            id: item.id,
            label: lang === "ml" ? item.ml : item.en,
            hint: regObj ? (lang === "ml" ? regObj.ml : regObj.en) : undefined,
            search: `${item.en} ${item.ml} ${regObj?.en || ""} ${regObj?.ml || ""}`,
          };
        }),
      ];
      selectedId = draftWorkerFilters.districtId || "all";
      onPick = handleWorkerFilterDistrictChange;
    } else if (picker === "worker_filter_constituency") {
      title = tr("Assembly Constituency", "നിയോജകമണ്ഡലം");
      options = [
        {
          id: "all",
          label: tr("All constituencies", "എല്ലാ മണ്ഡലങ്ങളും"),
          search: "all constituencies any",
        },
        ...workerFilterConstituencyOptions.map((item) => {
          const dist = districts.find((d) => d.id === item.districtId);
          const regKey = Object.keys(REGION_ORGANISATIONAL_DISTRICTS).find((rk) =>
            REGION_ORGANISATIONAL_DISTRICTS[rk].some(
              (odId) => odId === `od-${item.districtId}` || odId.startsWith(`od-${item.districtId}-`),
            ),
          );
          const regObj = regions.find((r) => r.id === regKey);
          const hintText = [
            dist ? (lang === "ml" ? dist.ml : dist.en) : "",
            regObj ? (lang === "ml" ? regObj.ml : regObj.en) : "",
          ]
            .filter(Boolean)
            .join(" · ");
          return {
            id: item.id,
            label: lang === "ml" ? item.ml : item.en,
            hint: hintText,
            search: `${item.en} ${item.ml} ${dist?.en || ""} ${dist?.ml || ""} ${regObj?.en || ""} ${regObj?.ml || ""}`,
          };
        }),
      ];
      selectedId = draftWorkerFilters.constituencyId || "all";
      onPick = handleWorkerFilterConstituencyChange;
    } else if (picker === "worker_filter_local_body_type") {
      title = tr("Local Body Type", "തദ്ദേശ സ്ഥാപന തരം");
      options = [
        {
          id: "all",
          label: tr("All local body types", "എല്ലാ തദ്ദേശ സ്ഥാപന തരങ്ങളും"),
          search: "all local body types any",
        },
        ...localBodyTypeOptions.map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.ml : item.en,
          search: `${item.en} ${item.ml}`,
        })),
      ];
      selectedId = draftWorkerFilters.localBodyType || "all";
      onPick = handleWorkerFilterLocalBodyTypeChange;
    } else if (picker === "worker_filter_local_body") {
      title = tr("Local Body", "തദ്ദേശ സ്ഥാപനം");
      options = [
        {
          id: "all",
          label: tr("All local bodies", "എല്ലാ തദ്ദേശ സ്ഥാപനങ്ങളും"),
          search: "all local bodies any",
        },
        ...workerFilterLocalBodyOptions.map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.ml : item.en,
          hint: localBodyTypeOptions.find((typeItem) => typeItem.id === item.type)?.[lang],
          search: `${item.en} ${item.ml}`,
        })),
      ];
      selectedId = draftWorkerFilters.localBodyId || "all";
      onPick = handleWorkerFilterLocalBodyChange;
    } else if (picker === "worker_filter_ward") {
      title = tr("Ward", "വാർഡ്");
      options = [
        {
          id: "all",
          label: tr("All wards", "എല്ലാ വാർഡുകളും"),
          search: "all wards any",
        },
        ...workerFilterWardOptions.map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.displayMl : item.displayEn,
          search: `Ward ${item.number} ${item.displayEn} ${item.displayMl}`,
        })),
      ];
      selectedId = draftWorkerFilters.wardId || "all";
      onPick = handleWorkerFilterWardChange;
    } else if (picker === "worker_filter_booth") {
      title = tr("Booth", "ബൂത്ത്");
      options = [
        {
          id: "all",
          label: tr("All booths", "എല്ലാ ബൂത്തുകളും"),
          search: "all booths any",
        },
        ...workerFilterBoothOptions.map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.nameMl : item.nameEn,
          hint: tr(`Booth ${item.number}`, `ബൂത്ത് ${item.number}`),
          search: `Booth ${item.number} ${item.nameEn} ${item.nameMl}`,
        })),
      ];
      selectedId = draftWorkerFilters.boothId || "all";
      onPick = handleWorkerFilterBoothChange;
    } else if (picker === "worker_filter_org_unit") {
      title = tr("Party Organisational Unit", "പാർട്ടി ഓർഗനൈസേഷണൽ യൂണിറ്റ്");
      options = [
        {
          id: "all",
          label: tr("All party units", "എല്ലാ പാർട്ടി യൂണിറ്റുകളും"),
          search: "all party units any",
        },
        ...orgHierarchyData.map((item) => ({
          id: item.id,
          label: item.name,
          hint: `${getOrgLevelLabel(item.level, lang)} · ${getPartyOrgPath(item.id, lang)}`,
          search: `${item.name} ${getPartyOrgPath(item.id, lang)}`,
        })),
      ];
      selectedId = draftWorkerFilters.orgUnitId || "all";
      onPick = handleWorkerFilterOrgUnitChange;
    } else if (picker === "worker_filter_status") {
      title = tr("User Status", "ഉപയോക്തൃ നില");
      options = [
        {
          id: "all",
          label: tr("All", "എല്ലാം"),
          search: "all എല്ലാം",
        },
        {
          id: "Active",
          label: tr("Active", "സജീവം"),
          hint: tr("Active users", "സജീവ ഉപയോക്താക്കൾ"),
          search: "active സജീവം",
        },
        {
          id: "Inactive",
          label: tr("Inactive", "നിഷ്ക്രിയം"),
          hint: tr("Deactivated / inactive users", "നിഷ്ക്രിയ ഉപയോക്താക്കൾ"),
          search: "inactive deactivated നിഷ്ക്രിയം",
        },
      ];
      selectedId = draftWorkerFilters.status;
      onPick = handleWorkerFilterStatusChange;
    } else if (picker === "worker_filter_app_role") {
      title = tr("App Role", "ആപ്പ് റോൾ");
      options = [
        {
          id: "all",
          label: tr("All roles", "എല്ലാ റോളുകളും"),
          search: "all roles any",
        },
        ...rolePresets.map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.ml : item.en,
          hint: lang === "ml" ? item.descriptionMl : item.descriptionEn,
          search: `${item.en} ${item.ml} ${item.descriptionEn} ${item.descriptionMl}`,
        })),
      ];
      selectedId = draftWorkerFilters.appRole;
      onPick = handleWorkerFilterAppRoleChange;
    } else if (picker === "worker_filter_app_status") {
      title = tr("Status Filter", "സ്റ്റാറ്റസ് ഫിൽട്ടർ");
      options = [
        { id: "all", label: tr("All Statuses", "എല്ലാ സ്റ്റാറ്റസുകളും"), search: "all statuses" },
        { id: "application_received", label: tr("Application Received", "അപേക്ഷ ലഭിച്ചു"), search: "application received" },
        { id: "document_verification_completed", label: tr("Document Verification Completed", "രേഖാ പരിശോധന പൂർത്തിയായി"), search: "document verification completed" },
        { id: "applied", label: tr("Applied", "അപേക്ഷിച്ചു"), search: "applied" },
        { id: "review", label: tr("In Review", "പരിശോധനയിൽ"), search: "review in review" },
        { id: "beneficiary", label: tr("Beneficiary", "അംഗീകരിച്ചു / ഗുണഭോക്താവ്"), search: "approved beneficiary" },
        { id: "rejected", label: tr("Rejected", "നിരസിച്ചു"), search: "rejected" },
      ];
      selectedId = draftWorkerFilters.appStatus || "all";
      onPick = (id) =>
        setDraftWorkerFilters((prev) => ({
          ...prev,
          appStatus: id,
        }));
    } else if (picker === "worker_filter_scheme") {
      title = tr("Scheme Filter", "സ്കീം ഫിൽട്ടർ");
      const schemeList = [
        "PM Kisan Samman Nidhi",
        "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "Kisan Credit Card (KCC) Scheme",
        "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
        "Atal Pension Yojana (APY)",
        "PM SVANidhi",
        "PM Vishwakarma Yojana",
        "PM YASASVI Scholarship",
        "Ayushman Bharat - PM-JAY",
        "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
        "Pradhan Mantri Ujjwala Yojana 2.0",
        "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
      ];
      options = [
        { id: "all", label: tr("All Schemes", "എല്ലാ പദ്ധതികളും"), search: "all schemes" },
        ...schemeList.map((name) => ({
          id: name,
          label: name,
          search: name.toLowerCase(),
        })),
      ];
      selectedId = draftWorkerFilters.schemeId || "all";
      onPick = (id) =>
        setDraftWorkerFilters((prev) => ({
          ...prev,
          schemeId: id,
        }));
    } else if (picker === "filter_district") {
      title = tr("Filter by district", "ജില്ല ഉപയോഗിച്ച് ഫിൽട്ടർ ചെയ്യുക");
      options = districts.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedIds = sheetFilters.districtIds ?? [];
      onToggle = (id) =>
        setSheetFilters((prev) => ({
          ...prev,
          districtIds: toggleFilterId(prev.districtIds, id),
          constituencyIds: undefined,
          localBodyIds: undefined,
        }));
      onClear = () =>
        setSheetFilters((prev) => ({
          ...prev,
          districtIds: undefined,
          constituencyIds: undefined,
          localBodyIds: undefined,
        }));
    } else if (picker === "filter_constituency") {
      title = tr("Filter by constituency", "മണ്ഡലം ഉപയോഗിച്ച് ഫിൽട്ടർ ചെയ്യുക");
      options = constituencies
        .filter(
          (item) =>
            !sheetFilters.districtIds?.length || sheetFilters.districtIds.includes(item.districtId),
        )
        .map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.ml : item.en,
          search: `${item.en} ${item.ml}`,
        }));
      selectedIds = sheetFilters.constituencyIds ?? [];
      onToggle = (id) =>
        setSheetFilters((prev) => ({
          ...prev,
          constituencyIds: toggleFilterId(prev.constituencyIds, id),
          localBodyIds: undefined,
        }));
      onClear = () =>
        setSheetFilters((prev) => ({
          ...prev,
          constituencyIds: undefined,
        }));
    } else if (picker === "filter_local_body_type") {
      title = tr("Filter by local body type", "തദ്ദേശ സ്ഥാപന തരം ഉപയോഗിച്ച് ഫിൽട്ടർ ചെയ്യുക");
      options = localBodyTypeOptions.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedIds = sheetFilters.localBodyTypes ?? [];
      onToggle = (id) =>
        setSheetFilters((prev) => ({
          ...prev,
          localBodyTypes: toggleFilterId(prev.localBodyTypes, id as LocalBodyType),
          localBodyIds: undefined,
        }));
      onClear = () =>
        setSheetFilters((prev) => ({
          ...prev,
          localBodyTypes: undefined,
          localBodyIds: undefined,
        }));
    } else {
      title = tr("Filter by local body", "തദ്ദേശ സ്ഥാപനം ഉപയോഗിച്ച് ഫിൽട്ടർ ചെയ്യുക");
      options = getFilteredLocalBodies(sheetFilters).map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        hint: localBodyTypeOptions.find((typeItem) => typeItem.id === item.type)?.[lang],
        search: `${item.en} ${item.ml}`,
      }));
      selectedIds = sheetFilters.localBodyIds ?? [];
      onToggle = (id) =>
        setSheetFilters((prev) => ({
          ...prev,
          localBodyIds: toggleFilterId(prev.localBodyIds, id),
        }));
      onClear = () =>
        setSheetFilters((prev) => ({
          ...prev,
          localBodyIds: undefined,
        }));
    }

    const query = pickerSearch.trim().toLowerCase();
    const filteredOptions = query
      ? options.filter((option) =>
          `${option.label} ${option.hint || ""} ${option.search || ""}`
            .toLowerCase()
            .includes(query),
        )
      : options;

    return (
      <div
        className="absolute inset-0 z-[115] flex items-end bg-black/55 animate-in fade-in duration-150"
        onClick={() => setPicker(null)}
      >
        <div
          className="flex h-[72%] w-full flex-col rounded-t-2xl border-t border-orange-100 bg-white shadow-2xl animate-in slide-in-from-bottom duration-200 dark:border-slate-800 dark:bg-slate-900"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 px-4 pt-2.5">
            <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-extrabold text-slate-900 dark:text-white">{title}</h3>
              <button
                type="button"
                onClick={() => setPicker(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-orange-200/70 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">
              <Search className="h-3.5 w-3.5 text-orange-500" />
              <input
                autoFocus
                value={pickerSearch}
                onChange={(event) => setPickerSearch(event.target.value)}
                placeholder={tr("Search...", "തിരയുക...")}
                className="w-full bg-transparent text-[11px] font-semibold text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="mt-2 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-[11px] font-semibold text-slate-500">
                {tr("No matching options.", "പൊരുത്തപ്പെടുന്ന ഓപ്ഷനുകളില്ല.")}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const selected = isMultiFilter
                  ? selectedIds.includes(option.id)
                  : option.id === selectedId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      if (isMultiFilter) {
                        onToggle(option.id);
                      } else {
                        onPick(option.id);
                        setPicker(null);
                      }
                    }}
                    className={`flex w-full items-start gap-2.5 border-b border-slate-100 px-4 py-2.5 text-left last:border-b-0 dark:border-slate-800 ${
                      selected
                        ? "bg-orange-50/70 dark:bg-orange-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center ${
                        isMultiFilter ? "rounded-[3px] border-[1.5px]" : "rounded-full border-2"
                      } ${
                        selected
                          ? "border-[#ff5500] bg-[#ff5500] text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {selected ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11.5px] font-bold text-slate-900 dark:text-slate-100">
                        {option.label}
                      </span>
                      {option.hint ? (
                        <span className="mt-0.5 block text-[9.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                          {option.hint}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          {isMultiFilter ? (
            <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
              {onClear ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-extrabold text-slate-600 transition active:scale-[0.98] dark:border-slate-700 dark:text-slate-300"
                >
                  {tr("Clear", "മായ്ക്കുക")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setPicker(null)}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#ff5500] to-[#e64a00] px-3 py-2 text-[10px] font-extrabold text-white transition active:scale-[0.98]"
              >
                {tr("Done", "പൂർത്തിയായി")}
                {selectedIds.length ? ` (${selectedIds.length})` : ""}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-3.5">
      <section className="rounded-2xl border border-orange-100 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-2.5">
          <Field label={tr("Full Name", "പൂർണ്ണമായ പേര്")} required error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder={tr("e.g. Dhyan M S", "ഉദാ: ധ്യാൻ എം എസ്")}
              className={inputClass}
            />
          </Field>

          <Field label={tr("Mobile Number", "മൊബൈൽ നമ്പർ")} required error={errors.mobile}>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(event) => {
                setMobile(event.target.value.replace(/\D/g, "").slice(0, 10));
                setErrors((prev) => ({ ...prev, mobile: "" }));
              }}
              placeholder="98470 12345"
              className={inputClass}
            />
            {duplicateWorker && duplicateWorker.id !== editingWorkerId ? (
              <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2 dark:border-amber-900/60 dark:bg-amber-950/30">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
                    {tr(
                      "Mobile number already registered",
                      "മൊബൈൽ നമ്പർ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്",
                    )}
                  </p>
                  <p className="mt-0.5 text-[9.5px] font-semibold leading-snug text-amber-700 dark:text-amber-400">
                    {duplicateWorker.name} ·{" "}
                    {lang === "ml" ? duplicateWorker.designationMl : duplicateWorker.designationEn}
                  </p>
                  {canOpenExistingWorker ? (
                    <button
                      type="button"
                      onClick={openExistingWorker}
                      className="mt-1.5 inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2 py-1 text-[9.5px] font-extrabold text-amber-800 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300"
                    >
                      {tr("Open existing worker", "നിലവിലുള്ള പ്രവർത്തകനെ തുറക്കുക")}
                      <ArrowLeft className="h-2.5 w-2.5 rotate-180" />
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </Field>

          <PickerButton
            label={tr("Organisation Level", "ഓർഗനൈസേഷൻ ലെവൽ")}
            required
            value={levelOption ? (lang === "ml" ? levelOption.ml : levelOption.en) : ""}
            placeholder={tr("Select organisation level", "ഓർഗനൈസേഷൻ ലെവൽ തിരഞ്ഞെടുക്കുക")}
            hint={
              levelOption
                ? lang === "ml"
                  ? levelOption.hintMl
                  : levelOption.hintEn
                : tr(
                    "Select the organisation level for this user.",
                    "ഈ ഉപയോക്താവിനുള്ള ഓർഗനൈസേഷൻ ലെവൽ തിരഞ്ഞെടുക്കുക.",
                  )
            }
            error={errors.level}
            onClick={() => openPicker("level")}
          />

          <PickerButton
            label={tr("Designation", "പദവി")}
            value={
              designation ? (lang === "ml" ? designation.ml : designation.en) : designationTitle
            }
            placeholder={tr("Select designation", "പദവി തിരഞ്ഞെടുക്കുക")}
            error={errors.designation}
            onClick={() => openPicker("designation_catalogue")}
          />

          {level === "state" ? (
            <Field label={tr("Location", "പ്രദേശം")}>
              <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 dark:border-slate-700 dark:bg-slate-800/60">
                <Landmark className="h-3.5 w-3.5 text-[#ff5500]" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  {tr("Kerala, statewide", "കേരളം, സംസ്ഥാന വ്യാപകം")}
                </span>
              </div>
            </Field>
          ) : null}

          {level === "area" ? (
            <PickerButton
              label={tr("Region", "റീജിയൺ")}
              required
              value={district ? (lang === "ml" ? district.ml : district.en) : ""}
              placeholder={tr("Select region", "റീജിയൺ തിരഞ്ഞെടുക്കുക")}
              error={errors.region}
              onClick={() => openPicker("district")}
            />
          ) : null}

          {level === "district" || level === "area" ? (
            <PickerButton
              label={tr("Organisational District", "ഓർഗനൈസേഷണൽ ജില്ല")}
              required
              value={orgDistrict ? (lang === "ml" ? orgDistrict.ml : orgDistrict.en) : ""}
              placeholder={
                level === "area" && !districtId
                  ? tr("Select a region first", "ആദ്യം റീജിയൺ തിരഞ്ഞെടുക്കുക")
                  : tr("Select organisational district", "ഓർഗനൈസേഷണൽ ജില്ല തിരഞ്ഞെടുക്കുക")
              }
              hint={
                level === "area"
                  ? tr(
                      "Organisational districts within the selected region.",
                      "തിരഞ്ഞെടുത്ത റീജിയണിലെ ഓർഗനൈസേഷണൽ ജില്ലകൾ.",
                    )
                  : undefined
              }
              error={errors.org_district}
              disabled={level === "area" && !districtId}
              onClick={() =>
                level === "area" && !districtId ? undefined : openPicker("org_district")
              }
            />
          ) : null}

          {level === "region" ? (
            <PickerButton
              label={tr("Regions", "റീജിയണുകൾ")}
              required
              value={selectedRegions.map((item) => item[lang]).join(", ")}
              placeholder={tr("Select regions", "റീജിയണുകൾ തിരഞ്ഞെടുക്കുക")}
              hint={tr("Select one or more regions.", "ഒന്നോ അതിലധികമോ റീജിയണുകൾ തിരഞ്ഞെടുക്കുക.")}
              error={errors.region}
              onClick={() => openPicker("regions")}
            />
          ) : null}

          {level &&
          level !== "state" &&
          level !== "region" &&
          level !== "district" &&
          level !== "area" ? (
            <PickerButton
              label={tr("District", "ജില്ല")}
              required
              value={district ? (lang === "ml" ? district.ml : district.en) : ""}
              placeholder={tr("Select district", "ജില്ല തിരഞ്ഞെടുക്കുക")}
              error={errors.district}
              onClick={() => openPicker("district")}
            />
          ) : null}

          {level === "assembly_constituency" ||
          level === "mandalam" ||
          level === "area" ||
          level === "booth" ? (
            <PickerButton
              label={
                level === "area"
                  ? tr("Mandalam", "മണ്ഡലം")
                  : tr("Assembly Constituency", "നിയോജകമണ്ഡലം")
              }
              required
              value={constituency ? (lang === "ml" ? constituency.ml : constituency.en) : ""}
              placeholder={
                level === "area"
                  ? orgDistrictId
                    ? tr("Select Mandalam", "മണ്ഡലം തിരഞ്ഞെടുക്കുക")
                    : tr(
                        "Select a region and organisational district first",
                        "ആദ്യം റീജിയണും ഓർഗനൈസേഷണൽ ജില്ലയും തിരഞ്ഞെടുക്കുക",
                      )
                  : districtId
                    ? tr("Select constituency", "മണ്ഡലം തിരഞ്ഞെടുക്കുക")
                    : tr("Select a district first", "ആദ്യം ജില്ല തിരഞ്ഞെടുക്കുക")
              }
              error={errors.constituency}
              disabled={level === "area" ? !orgDistrictId : !districtId}
              onClick={() =>
                (level === "area" ? orgDistrictId : districtId) && openPicker("constituency")
              }
            />
          ) : null}

          {level === "local_body" || level === "ward" ? (
            <>
              <PickerButton
                label={tr("Local Body Type", "തദ്ദേശ സ്ഥാപന തരം")}
                required
                value={
                  localBodyTypeLabel
                    ? lang === "ml"
                      ? localBodyTypeLabel.ml
                      : localBodyTypeLabel.en
                    : ""
                }
                placeholder={tr("Select local body type", "തദ്ദേശ സ്ഥാപന തരം തിരഞ്ഞെടുക്കുക")}
                error={errors.local_body_type}
                disabled={!districtId}
                onClick={() => districtId && openPicker("local_body_type")}
              />
              <PickerButton
                label={tr("Local Body", "തദ്ദേശ സ്ഥാപനം")}
                required
                value={localBody ? (lang === "ml" ? localBody.ml : localBody.en) : ""}
                placeholder={
                  localBodyType
                    ? tr("Select local body", "തദ്ദേശ സ്ഥാപനം തിരഞ്ഞെടുക്കുക")
                    : tr("Select a type first", "ആദ്യം തരം തിരഞ്ഞെടുക്കുക")
                }
                hint={
                  localBodyType && localBodyOptions.length === 0
                    ? tr(
                        "No configured local bodies of this type in the district.",
                        "ഈ ജില്ലയിൽ ഈ തരത്തിലുള്ള തദ്ദേശ സ്ഥാപനങ്ങളില്ല.",
                      )
                    : undefined
                }
                error={errors.local_body}
                disabled={!localBodyType}
                onClick={() => localBodyType && openPicker("local_body")}
              />
              {level === "ward" ? (
                <PickerButton
                  label={tr("Ward", "വാർഡ്")}
                  required
                  value={ward ? (lang === "ml" ? ward.displayMl : ward.displayEn) : ""}
                  placeholder={
                    localBodyId
                      ? tr("Select ward", "വാർഡ് തിരഞ്ഞെടുക്കുക")
                      : tr("Select a local body first", "ആദ്യം തദ്ദേശ സ്ഥാപനം തിരഞ്ഞെടുക്കുക")
                  }
                  error={errors.ward}
                  disabled={!localBodyId}
                  onClick={() => localBodyId && openPicker("ward")}
                />
              ) : null}
            </>
          ) : null}

          {level === "booth" ? (
            <PickerButton
              label={tr("Booth", "ബൂത്ത്")}
              required
              value={booth ? (lang === "ml" ? booth.nameMl : booth.nameEn) : ""}
              placeholder={
                constituencyId
                  ? tr("Select booth", "ബൂത്ത് തിരഞ്ഞെടുക്കുക")
                  : tr("Select a constituency first", "ആദ്യം മണ്ഡലം തിരഞ്ഞെടുക്കുക")
              }
              hint={tr(
                "Booths belong to an assembly constituency, not a ward.",
                "ബൂത്തുകൾ വാർഡിനല്ല, നിയോജകമണ്ഡലത്തിനാണ്.",
              )}
              error={errors.booth}
              disabled={!constituencyId}
              onClick={() => constituencyId && openPicker("booth")}
            />
          ) : null}

          {level === "org_unit" ? (
            <PickerButton
              label={tr("Party Organisational Unit", "പാർട്ടി ഓർഗനൈസേഷണൽ യൂണിറ്റ്")}
              required
              value={orgUnitId ? getPartyOrgPath(orgUnitId, lang) : ""}
              placeholder={tr(
                "Select party organisational unit",
                "പാർട്ടി യൂണിറ്റ് തിരഞ്ഞെടുക്കുക",
              )}
              hint={tr(
                "Party districts and Mandalams are separate from government districts and constituencies.",
                "പാർട്ടി ജില്ലകളും മണ്ഡലങ്ങളും സർക്കാർ ജില്ലകളിൽ നിന്നും മണ്ഡലങ്ങളിൽ നിന്നും വേറെയാണ്.",
              )}
              error={errors.org_unit}
              onClick={() => openPicker("org_unit")}
            />
          ) : null}

          <div className="rounded-lg border border-orange-200/80 bg-[#FFF7EC] p-2 dark:border-orange-900/60 dark:bg-orange-950/25">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-[#C2410C] dark:text-orange-300" />
              <p className="text-[9.5px] font-black uppercase tracking-wider text-[#C2410C] dark:text-orange-300">
                {tr("Assignment summary", "അസൈൻമെന്റ് സംഗ്രഹം")}
              </p>
            </div>
            {level ? (
              <div className="mt-1.5 space-y-1">
                <SummaryRow
                  label={tr("Designation", "പദവി")}
                  value={
                    designationTitle.trim() ||
                    (designation ? (lang === "ml" ? designation.ml : designation.en) : "—")
                  }
                />
                <SummaryRow
                  label={tr("Level", "ലെവൽ")}
                  value={levelOption ? (lang === "ml" ? levelOption.ml : levelOption.en) : "—"}
                />
                <SummaryRow
                  label={tr("Location", "പ്രദേശം")}
                  value={locationLine(lang) || tr("Not selected", "തിരഞ്ഞെടുത്തിട്ടില്ല")}
                />
              </div>
            ) : (
              <p className="mt-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {tr(
                  "Choose an organisation level to preview the assignment.",
                  "അസൈൻമെന്റ് കാണാൻ ഓർഗനൈസേഷൻ ലെവൽ തിരഞ്ഞെടുക്കുക.",
                )}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  const renderStep2 = () => {
    const selectedPermissionCount = allCreateUserPermissionKeys.filter((key) =>
      permissions.includes(key),
    ).length;
    const allPermissionsSelected =
      allCreateUserPermissionKeys.length > 0 &&
      allCreateUserPermissionKeys.every((key) => permissions.includes(key));
    const dataAccessModules = orderedPartyWorkerPermissions.filter((module) =>
      permissions.some((key) => key.startsWith(`${module.id}.`)),
    );

    return (
      <div className="space-y-3.5">
        <section className="rounded-2xl border border-orange-100 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-[1.35fr_1fr] gap-2">
            <PickerButton
              label={tr("Role", "റോൾ")}
              required
              value={appRole ? (lang === "ml" ? appRole.ml : appRole.en) : ""}
              placeholder={tr("Select role", "റോൾ തിരഞ്ഞെടുക്കുക")}
              error={errors.role}
              onClick={() => openPicker("app_role")}
            />
            <PickerButton
              label={tr("Role Level", "റോൾ ലെവൽ")}
              value={
                roleLevelOption ? (lang === "ml" ? roleLevelOption.ml : roleLevelOption.en) : ""
              }
              placeholder={tr("Select level", "ലെവൽ തിരഞ്ഞെടുക്കുക")}
              onClick={() => openPicker("role_level")}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2 border-y border-border/60 py-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white">
                2
              </span>
              <h4 className="text-[12px] font-extrabold text-foreground">
                {tr("Module Permissions", "മൊഡ്യൂൾ അനുമതികൾ")}
              </h4>
            </div>
            <button
              type="button"
              role="checkbox"
              aria-checked={allPermissionsSelected}
              aria-label={tr(
                "Select all module permissions",
                "എല്ലാ മൊഡ്യൂൾ അനുമതികളും തിരഞ്ഞെടുക്കുക",
              )}
              onClick={() => {
                setPermissions(allPermissionsSelected ? [] : [...allCreateUserPermissionKeys]);
                setPermissionError("");
              }}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-orange-50 px-2 py-1 text-[8.5px] font-bold text-orange-700 transition-colors hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/70"
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
                  allPermissionsSelected
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-orange-300 bg-white dark:border-orange-800 dark:bg-slate-900"
                }`}
              >
                {allPermissionsSelected ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
              </span>
              <span>{tr("All", "എല്ലാം")}</span>
              <span>
                ({selectedPermissionCount}/{allCreateUserPermissionKeys.length})
              </span>
            </button>
          </div>

          <div className="mt-2 space-y-2">
            <div className="overflow-hidden rounded-xl border border-border bg-white dark:bg-slate-900">
              <div className="grid grid-cols-[minmax(0,1fr)_36px_36px_36px_36px] items-center gap-1 border-b border-border bg-white px-2 py-2 dark:bg-slate-900">
                <span className="pl-1 text-[8px] font-black uppercase tracking-wide text-orange-700/80 dark:text-orange-300">
                  {tr("Module", "മൊഡ്യൂൾ")}
                </span>
                {permissionTableColumns.map((column) => (
                  <span
                    key={column.id}
                    className="text-center text-[7.5px] font-black uppercase tracking-tight text-orange-700/80 dark:text-orange-300"
                  >
                    {lang === "ml" ? column.ml : column.en}
                  </span>
                ))}
              </div>

              <div>
                {orderedPartyWorkerPermissions.map((module) => {
                  const Icon = moduleIcons[module.id];
                  const moduleLabel = createUserPermissionModuleLabel(module, lang === "ml");
                  const extraActions =
                    additionalPermissionModulesForCreateUser.find(
                      (group) => group.module.id === module.id,
                    )?.actions ?? [];
                  const viewAction = module.actions.find((action) => action.id === "view");
                  const showExtraActions =
                    extraActions.length > 0 &&
                    (!viewAction || permissions.includes(permissionKey(module.id, viewAction.id)));
                  return (
                    <div key={module.id} className="border-t border-border first:border-t-0">
                      <div className="grid grid-cols-[minmax(0,1fr)_36px_36px_36px_36px] items-center gap-1 bg-white px-2 py-1 dark:bg-slate-900">
                        <div className="flex min-w-0 items-start gap-1.5 py-1.5">
                          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-300" />
                          <span className="min-w-0 whitespace-normal break-words text-[9.5px] font-extrabold leading-snug text-foreground">
                            {moduleLabel}
                          </span>
                        </div>
                        {permissionTableColumns.map((column) => {
                          const action = module.actions.find((item) => item.id === column.id);
                          const permissionIds =
                            permissionTableKeyOverrides[module.id]?.[column.id] ??
                            (action ? [action.id] : []);
                          if (permissionIds.length === 0) {
                            return (
                              <span
                                key={column.id}
                                title={tr("Unavailable", "ലഭ്യമല്ല")}
                                aria-label={tr("Unavailable", "ലഭ്യമല്ല")}
                                className="flex h-9 items-center justify-center text-[11px] font-semibold text-slate-300 dark:text-slate-600"
                              >
                                —
                              </span>
                            );
                          }
                          const permissionKeys = permissionIds.map((id) =>
                            permissionKey(module.id, id),
                          );
                          const checked = permissionKeys.every((key) => permissions.includes(key));
                          return (
                            <button
                              key={column.id}
                              type="button"
                              role="checkbox"
                              aria-checked={checked}
                              aria-label={`${moduleLabel} ${lang === "ml" ? column.ml : column.en}: ${
                                checked
                                  ? tr("Allowed", "അനുവദിച്ചിരിക്കുന്നു")
                                  : tr("Not Allowed", "അനുവദിച്ചിട്ടില്ല")
                              }`}
                              onClick={() => {
                                setPermissions((current) => {
                                  let next = current;
                                  permissionKeys.forEach((key) => {
                                    next = togglePermission(next, key, !checked);
                                  });
                                  return next;
                                });
                                setPermissionError("");
                              }}
                              className="flex h-9 w-full cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 dark:hover:bg-slate-800"
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-[3px] border ${
                                  checked
                                    ? "border-orange-500 bg-orange-500 text-white"
                                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                                }`}
                              >
                                {checked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {showExtraActions ? (
                        <div className="border-t border-dashed border-border/60 bg-white px-2 py-2 dark:bg-slate-900">
                          <p className="text-[7.5px] font-black uppercase tracking-wide text-muted-foreground">
                            {tr("Additional permissions", "അധിക അനുമതികൾ")}
                          </p>
                          <div className="mt-1 flex items-stretch gap-1.5">
                            {extraActions.map((action) => {
                              const key = permissionKey(module.id, action.id);
                              const checked = permissions.includes(key);
                              return (
                                <button
                                  key={action.id}
                                  type="button"
                                  role="checkbox"
                                  aria-checked={checked}
                                  aria-label={`${moduleLabel} ${lang === "ml" ? action.ml : action.en}: ${
                                    checked
                                      ? tr("Allowed", "അനുവദിച്ചിരിക്കുന്നു")
                                      : tr("Not Allowed", "അനുവദിച്ചിട്ടില്ല")
                                  }`}
                                  onClick={() => {
                                    setPermissions((current) =>
                                      togglePermission(current, key, !checked),
                                    );
                                    setPermissionError("");
                                  }}
                                  className={`flex min-h-8 min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2 py-1.5 text-left transition-colors cursor-pointer ${
                                    checked
                                      ? "border-orange-200 bg-orange-50/70 dark:border-orange-900/60 dark:bg-orange-950/20"
                                      : "border-border/70 hover:bg-muted/40"
                                  }`}
                                >
                                  <span
                                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
                                      checked
                                        ? "border-orange-500 bg-orange-500 text-white"
                                        : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                                    }`}
                                  >
                                    {checked ? <Check className="h-2 w-2 stroke-[3]" /> : null}
                                  </span>
                                  <span className="min-w-0 flex-1 text-[9.5px] font-bold leading-snug text-foreground">
                                    {lang === "ml" ? action.ml : action.en}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-0.5 text-[8px] font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border border-orange-500 bg-orange-500 text-white">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </span>
                {tr("Allowed", "അനുവദിച്ചിരിക്കുന്നു")}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-3.5 w-3.5 rounded-[3px] border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900" />
                {tr("Not Allowed", "അനുവദിച്ചിട്ടില്ല")}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3.5 text-center text-[11px] font-semibold text-slate-300 dark:text-slate-600">
                  —
                </span>
                {tr("Unavailable", "ലഭ്യമല്ല")}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-orange-100 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white">
              3
            </span>
            <h4 className="text-[12px] font-extrabold text-foreground">
              {tr("Data Access", "ഡാറ്റ ആക്സസ്")}
            </h4>
          </div>
          <p className="mt-2 text-[9.5px] font-semibold leading-relaxed text-muted-foreground">
            {tr(
              "Choose whose records this user can access in each module.",
              "ഓരോ മൊഡ്യൂളിലും ഈ ഉപയോക്താവിന് ആക്സസ് ഉള്ള റെക്കോർഡുകൾ തിരഞ്ഞെടുക്കുക.",
            )}
          </p>
          <div className="mt-2 overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[minmax(0,1fr)_40px_40px_40px_40px] items-center gap-1 border-b border-border bg-white px-2 py-2 dark:bg-slate-900">
              <span className="pl-1 text-[8px] font-black uppercase tracking-wide text-orange-700/80 dark:text-orange-300">
                {tr("Module", "മൊഡ്യൂൾ")}
              </span>
              {dataAccessOptions.map((option) => (
                <span
                  key={option.id}
                  title={lang === "ml" ? option.ml : option.en}
                  className="text-center text-[7px] font-black uppercase leading-tight tracking-tight text-orange-700/80 dark:text-orange-300"
                >
                  {lang === "ml" ? option.shortMl : option.shortEn}
                </span>
              ))}
            </div>
            {dataAccessModules.length === 0 ? (
              <p className="px-3 py-4 text-center text-[9.5px] font-semibold text-muted-foreground">
                {tr(
                  "No module has permissions yet. Select Create, View, Edit or Delete above.",
                  "ഇതുവരെ ഏതെങ്കിലും മൊഡ്യൂളിന് അനുമതികളില്ല. മുകളിൽ സൃഷ്ടിക്കുക, കാണുക, തിരുത്തുക അല്ലെങ്കിൽ നീക്കം ചെയ്യുക തിരഞ്ഞെടുക്കുക.",
                )}
              </p>
            ) : (
              dataAccessModules.map((module) => {
                const Icon = moduleIcons[module.id];
                const moduleLabel = createUserPermissionModuleLabel(module, lang === "ml");
                const selected = dataAccess[module.id] ?? [];
                return (
                  <div
                    key={module.id}
                    className="grid grid-cols-[minmax(0,1fr)_40px_40px_40px_40px] items-center gap-1 border-t border-border/60 px-2 first:border-t-0"
                  >
                    <div className="flex min-w-0 items-start gap-1.5 py-1.5">
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-300" />
                      <span className="min-w-0 whitespace-normal break-words text-[9.5px] font-extrabold leading-snug text-foreground">
                        {moduleLabel}
                      </span>
                    </div>
                    {dataAccessOptions.map((option) => {
                      const checked = selected.includes(option.id);
                      const optionLabel = lang === "ml" ? option.ml : option.en;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          aria-label={`${moduleLabel} ${optionLabel}: ${
                            checked
                              ? tr("Allowed", "അനുവദിച്ചിരിക്കുന്നു")
                              : tr("Not Allowed", "അനുവദിച്ചിട്ടില്ല")
                          }`}
                          onClick={() =>
                            setDataAccess((current) =>
                              toggleRoleDataAccess(current, module.id, option.id),
                            )
                          }
                          className="flex h-9 w-full cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 dark:hover:bg-slate-800"
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-[3px] border ${
                              checked
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                            }`}
                          >
                            {checked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section
          ref={accessAreasRef}
          className="rounded-2xl border border-orange-100 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[12px] font-extrabold text-slate-900 dark:text-white">
                {tr("Access Areas", "ആക്സസ് പ്രദേശങ്ങൾ")}
              </p>
              <p className="mt-0.5 text-[9.5px] font-semibold leading-snug text-slate-500 dark:text-slate-400">
                {tr(
                  "No selected area means no access. Access never defaults to statewide.",
                  "പ്രദേശം തിരഞ്ഞെടുക്കാത്തത് ആക്സസ് ഇല്ല. സ്വയമേവ സംസ്ഥാന വ്യാപകമാക്കില്ല.",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAccessSheet()}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-orange-300 bg-orange-50 px-2 py-1.5 text-[9.5px] font-extrabold text-[#C2410C] active:scale-95 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300"
            >
              <Plus className="h-3 w-3 stroke-[3]" />
              {tr("Add Access Area", "ആക്സസ് പ്രദേശം ചേർക്കുക")}
            </button>
          </div>

          <div className="mt-2.5 space-y-2">
            {grants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-3 py-4 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <MapPin className="mx-auto h-4 w-4 text-slate-400" />
                <p className="mt-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {tr("No access areas added", "ആക്സസ് പ്രദേശങ്ങൾ ചേർത്തിട്ടില്ല")}
                </p>
                <p className="mt-0.5 text-[9px] font-medium text-slate-500 dark:text-slate-400">
                  {tr(
                    "This worker can use only their assigned location.",
                    "ഈ പ്രവർത്തകന് അവരുടെ അസൈൻ ചെയ്ത പ്രദേശം മാത്രം ഉപയോഗിക്കാം.",
                  )}
                </p>
              </div>
            ) : (
              grants.map((grant) => (
                <div
                  key={grant.id}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-[#C2410C] dark:bg-orange-950/50 dark:text-orange-300">
                          {grantScopeLabel(grant, lang)}
                        </span>
                      </div>
                      <GrantAreaGroups grant={grant} lang={lang} />
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => openAccessSheet(grant)}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-800"
                        title={tr("Edit", "തിരുത്തുക")}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGrants((prev) => prev.filter((item) => item.id !== grant.id))
                        }
                        className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 active:scale-95 dark:hover:bg-rose-950/30"
                        title={tr("Remove", "നീക്കം ചെയ്യുക")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {permissionError ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 dark:border-rose-900/60 dark:bg-rose-950/30">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
            <p className="text-[9.5px] font-bold text-rose-700 dark:text-rose-300">
              {permissionError}
            </p>
          </div>
        ) : null}

        <p className="px-1 pb-1 text-center text-[8.5px] font-medium text-slate-400 dark:text-slate-500">
          {tr(
            "Access is enforced on records, documents, exports and direct links.",
            "റെക്കോർഡുകൾ, രേഖകൾ, എക്സ്പോർട്ടുകൾ, നേരിട്ടുള്ള ലിങ്കുകൾ എന്നിവയിൽ ആക്സസ് പരിശോധിക്കും.",
          )}
        </p>
      </div>
    );
  };

  const getVisibleWorkers = () => {
    const allWorkers = buildWorkerDirectory();
    const query = workerSearch.trim().toLowerCase();
    const filtered = allWorkers.filter((worker) => {
      const designation = lang === "ml" ? worker.designationMl : worker.designationEn;
      const area = workerAreaLabel(worker, lang);
      const searchText = `${worker.name} ${worker.nameMl || ""} ${worker.mobile} ${designation} ${area}`;
      const matchesSearch = !query || searchText.toLowerCase().includes(query);
      return matchesSearch && workerMatchesListFilters(worker, appliedWorkerFilters);
    });

    return filtered.sort((a, b) => {
      const statsA = getWorkerApplicationStats(a);
      const statsB = getWorkerApplicationStats(b);
      const nameA = lang === "ml" ? (a.nameMl || a.name) : a.name;
      const nameB = lang === "ml" ? (b.nameMl || b.name) : b.name;

      switch (workerSortOption) {
        case "name_asc":
          return nameA.localeCompare(nameB);
        case "name_desc":
          return nameB.localeCompare(nameA);
        case "benefits_desc":
          return statsB.approved - statsA.approved || nameA.localeCompare(nameB);
        case "benefits_asc":
          return statsA.approved - statsB.approved || nameA.localeCompare(nameB);
        case "apps_desc":
          return statsB.total - statsA.total || nameA.localeCompare(nameB);
        case "apps_asc":
          return statsA.total - statsB.total || nameA.localeCompare(nameB);
        case "pending_desc":
          return statsB.pending - statsA.pending || nameA.localeCompare(nameB);
        case "pending_asc":
          return statsA.pending - statsB.pending || nameA.localeCompare(nameB);
        case "in_review_desc":
          return statsB.inReview - statsA.inReview || nameA.localeCompare(nameB);
        case "in_review_asc":
          return statsA.inReview - statsB.inReview || nameA.localeCompare(nameB);
        case "rejected_desc":
          return statsB.rejected - statsA.rejected || nameA.localeCompare(nameB);
        case "rejected_asc":
          return statsA.rejected - statsB.rejected || nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });
  };

  const renderWorkerList = () => {
    const visibleWorkers = getVisibleWorkers();

    return (
      <div className="space-y-1.5">
        {visibleWorkers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-white px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-[#ff5500] dark:bg-orange-950/40 dark:text-orange-300">
              <Users2 className="h-5 w-5" />
            </div>
            <p className="mt-2 text-[12px] font-extrabold text-slate-800 dark:text-slate-100">
              {tr("No users found", "ഉപയോക്താക്കളെ കണ്ടെത്തിയില്ല")}
            </p>
            <p className="mt-1 text-[9.5px] font-medium text-slate-500 dark:text-slate-400">
              {tr(
                "Try another search or clear the filters.",
                "മറ്റൊരു തിരയൽ ശ്രമിക്കുകയോ ഫിൽട്ടറുകൾ മാറ്റുകയോ ചെയ്യുക.",
              )}
            </p>
            <button
              type="button"
              onClick={clearWorkerListFilters}
              className="mt-3 rounded-lg border border-orange-200 bg-[#FFF7EC] px-3 py-1.5 text-[10px] font-extrabold text-[#C2410C] dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300"
            >
              {tr("Clear Filters", "ഫിൽട്ടറുകൾ മായ്ക്കുക")}
            </button>
          </div>
        ) : (
          visibleWorkers.map((worker) => {
            const designation = lang === "ml" ? worker.designationMl : worker.designationEn;
            const area = workerAreaLabel(worker, lang);
            const isActive = worker.status !== "Deactivated";
            const stats = getWorkerApplicationStats(worker);

            return (
              <button
                key={`${worker.id}-${worker.mobile}`}
                type="button"
                onClick={() => openWorkerProfile(worker)}
                className="flex w-full flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-left shadow-2xs transition hover:border-[#ff5500]/40 hover:bg-[#FFFCF7] active:scale-[0.995] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="flex w-full items-center gap-2.5">
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-orange-50 shadow-sm ring-1 ring-orange-100 dark:bg-slate-800 dark:ring-slate-800">
                      <img
                        src={worker.photoUrl || partyWorkerAvatar}
                        alt=""
                        className={`h-full w-full rounded-full object-cover ${
                          worker.photoUrl ? "" : "scale-[1.22]"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="min-w-0 flex-1 truncate text-[11.5px] font-extrabold leading-tight text-slate-900 dark:text-white">
                        {lang === "ml" ? worker.nameMl || worker.name : worker.name}
                      </h2>
                    </div>
                    <p className="mt-0.5 truncate text-[9px] font-bold text-[#C2410C] dark:text-orange-300">
                      {designation || tr("User", "ഉപയോക്താവ്")}
                    </p>
                    <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[8.5px] font-medium text-slate-500 dark:text-slate-400">
                      <span className="truncate">
                        {area || tr("Area not recorded", "പ്രദേശം രേഖപ്പെടുത്തിയിട്ടില്ല")}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {stats.approved > 0 ? (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-black leading-none border border-[#00875A] bg-[#00875A] text-white shadow-2xs" title={tr(`Beneficiary: ${stats.approved}`, `അംഗീകരിച്ചു: ${stats.approved}`)}>
                        {stats.approved}
                      </span>
                    ) : (
                      <span className="h-5 w-[20px] shrink-0" />
                    )}

                    {stats.inReview + stats.pending > 0 ? (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-black leading-none border border-[#f59e0b] bg-[#f59e0b] text-white shadow-2xs" title={tr(`Pending in Review: ${stats.inReview + stats.pending}`, `പരിശോധനയിൽ: ${stats.inReview + stats.pending}`)}>
                        {stats.inReview + stats.pending}
                      </span>
                    ) : (
                      <span className="h-5 w-[20px] shrink-0" />
                    )}

                    {stats.rejected > 0 ? (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-black leading-none border border-[#FF2C2C] bg-[#FF2C2C] text-white shadow-2xs" title={tr(`Rejected: ${stats.rejected}`, `നിരസിച്ചു: ${stats.rejected}`)}>
                        {stats.rejected}
                      </span>
                    ) : (
                      <span className="h-5 w-[20px] shrink-0" />
                    )}

                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    );
  };

  const renderWorkerFilters = () => {
    if (!workerFiltersOpen) return null;
    const statusOptions: { id: WorkerListFilters["status"]; en: string; ml: string }[] = [
      { id: "all", en: "All", ml: "എല്ലാം" },
      { id: "Active", en: "Active", ml: "സജീവം" },
      { id: "Inactive", en: "Inactive", ml: "നിഷ്ക്രിയം" },
    ];
    const level = draftWorkerFilters.level;
    const showRegion = level === "region";
    const showDistrict = level === "org_district" || level === "district" || level === "mandalam" || level === "assembly_constituency" || level === "area" || level === "ward" || level === "booth";
    const showConstituency = level === "mandalam" || level === "assembly_constituency" || level === "area" || level === "ward" || level === "booth";
    const showLocalBodyType = level === "local_body";
    const showLocalBody = level === "local_body" || level === "area" || level === "ward";
    const showWard = level === "ward";
    const showBooth = level === "booth";
    const showOrgUnit = level === "org_unit";
    const filterLevelDisplayMap: Record<string, { en: string; ml: string }> = {
      state: { en: "State", ml: "സംസ്ഥാനം" },
      region: { en: "Region", ml: "റീജിയൺ" },
      org_district: { en: "Organisational District", ml: "ഓർഗനൈസേഷണൽ ജില്ല" },
      district: { en: "Organisational District", ml: "ഓർഗനൈസേഷണൽ ജില്ല" },
      mandalam: { en: "Assembly Mandalam", ml: "അസംബ്ലി മണ്ഡലം" },
      assembly_constituency: { en: "Assembly Mandalam", ml: "അസംബ്ലി മണ്ഡലം" },
      area: { en: "Area", ml: "ഏരിയ" },
      ward: { en: "Ward", ml: "വാർഡ്" },
      booth: { en: "Booth", ml: "ബൂത്ത്" },
      org_unit: { en: "Party Organisational Unit", ml: "പാർട്ടി ഓർഗനൈസേഷണൽ യൂണിറ്റ്" },
    };
    const selectedLevelDisplay = filterLevelDisplayMap[level]?.[lang] || assignmentLevels.find((item) => item.id === level)?.[lang];
    const draftFilterCount = countActiveWorkerFilters(draftWorkerFilters);

    return (
      <div
        className="absolute inset-0 z-[110] flex items-end bg-black/55 animate-in fade-in duration-150"
        onClick={closeWorkerFilters}
      >
        <div
          className="flex max-h-[88%] w-full flex-col rounded-t-2xl border-t border-orange-100 bg-white shadow-2xl animate-in slide-in-from-bottom duration-200 dark:border-slate-800 dark:bg-slate-900"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 border-b border-slate-100 px-3.5 pb-2.5 pt-2 dark:border-slate-800">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-1.5 text-[13px] font-extrabold text-slate-900 dark:text-white">
                  <Filter className="h-4 w-4 text-[#ff5500] stroke-[2.2]" />
                  {tr("Filter users", "ഉപയോക്താക്കളെ ഫിൽട്ടർ ചെയ്യുക")}
                  {draftFilterCount > 0 ? (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5500] px-1 text-[8.5px] font-black text-white">
                      {draftFilterCount}
                    </span>
                  ) : null}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeWorkerFilters}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-3.5 py-3 [scrollbar-width:thin]">
            <div className="space-y-2.5">
              <PickerButton
                label={tr("Location Level", "ലൊക്കേഷൻ ലെവൽ")}
                value={
                  isUserView
                    ? tr("Area", "ഏരിയ")
                    : level === "all"
                      ? tr("All levels", "എല്ലാ ലെവലുകളും")
                      : selectedLevelDisplay || ""
                }
                placeholder={tr("All levels", "എല്ലാ ലെവലുകളും")}
                disabled={isUserView}
                onClick={isUserView ? () => {} : () => openPicker("worker_filter_level")}
              />

              {level === "state" ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                  <Landmark className="h-4 w-4 shrink-0 text-[#ff5500] dark:text-orange-300" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                      {tr("Kerala", "കേരളം")}
                    </p>
                    <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
                      {tr("Statewide assignment", "സംസ്ഥാന വ്യാപക അസൈൻമെന്റ്")}
                    </p>
                  </div>
                </div>
              ) : null}

              {showRegion ? (
                <PickerButton
                  label={tr("Select Region", "റീജിയൺ തിരഞ്ഞെടുക്കുക")}
                  value={
                    workerFilterRegion
                      ? workerFilterRegion[lang]
                      : tr("All Regions", "എല്ലാ റീജിയണുകളും")
                  }
                  placeholder={tr("All Regions", "എല്ലാ റീജിയണുകളും")}
                  onClick={() => openPicker("worker_filter_region")}
                />
              ) : null}

              {showDistrict ? (
                <PickerButton
                  label={tr("Organisational District", "ഓർഗനൈസേഷണൽ ജില്ല")}
                  value={
                    workerFilterDistrict
                      ? workerFilterDistrict[lang]
                      : tr("All Org Districts", "എല്ലാ ഓർഗനൈസേഷണൽ ജില്ലകളും")
                  }
                  placeholder={tr("All Org Districts", "എല്ലാ ഓർഗനൈസേഷണൽ ജില്ലകളും")}
                  onClick={() => openPicker("worker_filter_district")}
                />
              ) : null}

              {showConstituency ? (
                <PickerButton
                  label={tr("Assembly Constituency", "നിയോജകമണ്ഡലം")}
                  value={
                    workerFilterConstituency
                      ? workerFilterConstituency[lang]
                      : tr("All constituencies", "എല്ലാ മണ്ഡലങ്ങളും")
                  }
                  placeholder={tr("All constituencies", "എല്ലാ മണ്ഡലങ്ങളും")}
                  disabled={false}
                  onClick={() => openPicker("worker_filter_constituency")}
                />
              ) : null}

              {showLocalBodyType ? (
                <PickerButton
                  label={tr("Local Body Type", "തദ്ദേശ സ്ഥാപന തരം")}
                  value={
                    workerFilterLocalBodyType
                      ? workerFilterLocalBodyType[lang]
                      : draftWorkerFilters.districtId
                        ? tr("Any type", "ഏത് തരവും")
                        : tr("Select a district first", "ആദ്യം ജില്ല തിരഞ്ഞെടുക്കുക")
                  }
                  placeholder={tr("Any type", "ഏത് തരവും")}
                  disabled={!draftWorkerFilters.districtId}
                  onClick={() => openPicker("worker_filter_local_body_type")}
                />
              ) : null}

              {showLocalBody ? (
                <PickerButton
                  label={level === "ward" || level === "area" ? tr("Area", "ഏരിയ") : tr("Local Body", "തദ്ദേശ സ്ഥാപനം")}
                  value={
                    workerFilterLocalBody
                      ? workerFilterLocalBody[lang]
                      : draftWorkerFilters.districtId || draftWorkerFilters.constituencyId
                        ? level === "ward" || level === "area"
                          ? tr("Any area", "ഏത് ഏരിയയും")
                          : tr("Any local body", "ഏത് തദ്ദേശ സ്ഥാപനവും")
                        : tr(
                            "Select a district first",
                            "ആദ്യം ജില്ല തിരഞ്ഞെടുക്കുക",
                          )
                  }
                  placeholder={level === "ward" || level === "area" ? tr("Any area", "ഏത് ഏരിയയും") : tr("Any local body", "ഏത് തദ്ദേശ സ്ഥാപനവും")}
                  disabled={!draftWorkerFilters.districtId && !draftWorkerFilters.constituencyId}
                  onClick={() => openPicker("worker_filter_local_body")}
                />
              ) : null}

              {showWard ? (
                <PickerButton
                  label={tr("Ward", "വാർഡ്")}
                  value={
                    workerFilterWard
                      ? workerFilterWard[lang === "ml" ? "displayMl" : "displayEn"]
                      : draftWorkerFilters.localBodyId
                        ? tr("Any ward", "ഏത് വാർഡും")
                        : tr("Select an area first", "ആദ്യം ഏരിയ തിരഞ്ഞെടുക്കുക")
                  }
                  placeholder={tr("Any ward", "ഏത് വാർഡും")}
                  disabled={!draftWorkerFilters.localBodyId}
                  onClick={() => openPicker("worker_filter_ward")}
                />
              ) : null}

              {showBooth ? (
                <PickerButton
                  label={tr("Booth", "ബൂത്ത്")}
                  value={
                    workerFilterBooth
                      ? workerFilterBooth[lang === "ml" ? "nameMl" : "nameEn"]
                      : draftWorkerFilters.constituencyId
                        ? tr("All booths", "എല്ലാ ബൂത്തുകളും")
                        : tr("Select a constituency first", "ആദ്യം മണ്ഡലം തിരഞ്ഞെടുക്കുക")
                  }
                  placeholder={tr("All booths", "എല്ലാ ബൂത്തുകളും")}
                  disabled={!draftWorkerFilters.constituencyId}
                  onClick={() => openPicker("worker_filter_booth")}
                />
              ) : null}

              {showOrgUnit ? (
                <PickerButton
                  label={tr("Party Organisational Unit", "പാർട്ടി ഓർഗനൈസേഷണൽ യൂണിറ്റ്")}
                  value={
                    workerFilterOrgUnit
                      ? getPartyOrgPath(workerFilterOrgUnit.id, lang)
                      : tr("All party units", "എല്ലാ പാർട്ടി യൂണിറ്റുകളും")
                  }
                  placeholder={tr("All party units", "എല്ലാ പാർട്ടി യൂണിറ്റുകളും")}
                  hint={tr(
                    "Uses the administrator-configured party hierarchy.",
                    "അഡ്മിനിസ്ട്രേറ്റർ ക്രമീകരിച്ച പാർട്ടി ഘടന ഉപയോഗിക്കുന്നു.",
                  )}
                  onClick={() => openPicker("worker_filter_org_unit")}
                />
              ) : null}

              <PickerButton
                label={tr("Designation", "പദവി")}
                value={
                  draftWorkerFilters.designationId === "all" || !workerFilterDesignation
                    ? tr("All designations", "എല്ലാ പദവികളും")
                    : workerFilterDesignation[lang]
                }
                placeholder={tr("All designations", "എല്ലാ പദവികളും")}
                hint={
                  level === "all"
                    ? tr(
                        "Designations are narrowed by location level.",
                        "ലൊക്കേഷൻ ലെവൽ അനുസരിച്ച് പദവികൾ ചുരുക്കുന്നു.",
                      )
                    : undefined
                }
                onClick={() => openPicker("worker_filter_designation")}
              />

              <PickerButton
                label={tr("Roles", "റോൾ")}
                value={
                  draftWorkerFilters.appRole === "all" || !workerFilterAppRole
                    ? tr("All roles", "എല്ലാ റോളുകളും")
                    : workerFilterAppRole[lang]
                }
                placeholder={tr("All roles", "എല്ലാ റോളുകളും")}
                onClick={() => openPicker("worker_filter_app_role")}
              />

              <PickerButton
                label={tr("User Status", "ഉപയോക്തൃ നില")}
                value={
                  statusOptions.find((o) => o.id === draftWorkerFilters.status)?.[lang] ||
                  tr("All status", "എല്ലാ നിലകളും")
                }
                placeholder={tr("All status", "എല്ലാ നിലകളും")}
                onClick={() => openPicker("worker_filter_status")}
              />

              <PickerButton
                label={tr("Status Filter", "സ്റ്റാറ്റസ് ഫിൽട്ടർ")}
                value={getWorkerAppStatusLabel(draftWorkerFilters.appStatus || "all", lang)}
                placeholder={tr("All Statuses", "എല്ലാ സ്റ്റാറ്റസുകളും")}
                onClick={() => openPicker("worker_filter_app_status")}
              />

              <PickerButton
                label={tr("Scheme Filter", "സ്കീം ഫിൽട്ടർ")}
                value={getWorkerSchemeLabel(draftWorkerFilters.schemeId || "all", lang)}
                placeholder={tr("All Schemes", "എല്ലാ പദ്ധതികളും")}
                onClick={() => openPicker("worker_filter_scheme")}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 px-3.5 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2.5 dark:border-slate-800">
            <button
              type="button"
              onClick={resetWorkerFilters}
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-white text-[11px] font-extrabold text-slate-600 transition active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {tr("Reset", "പുനഃസജ്ജീകരിക്കുക")}
            </button>
            <button
              type="button"
              onClick={applyWorkerFilters}
              className="h-10 flex-[1.5] rounded-lg bg-gradient-to-r from-[#ff5500] to-[#e64a00] text-[11px] font-extrabold text-white shadow-md transition active:scale-[0.98]"
            >
              {tr("Apply Filters", "ഫിൽട്ടറുകൾ പ്രയോഗിക്കുക")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderWorkerSortSheet = () => {
    if (!workerSortSheetOpen) return null;
    const options = [
      { id: "apps", en: "Applications", ml: "അപേക്ഷകൾ" },
      { id: "benefits", en: "Beneficiaries", ml: "ഗുണഭോക്താക്കൾ" },
      { id: "pending", en: "Pending", ml: "തീർപ്പാക്കാത്തവ" },
      { id: "in_review", en: "In Review", ml: "പരിശോധനയിൽ" },
      { id: "rejected", en: "Rejected", ml: "നിരസിച്ചത്" },
      { id: "name", en: "User Name", ml: "ഉപയോക്താവിന്റെ പേര്" },
    ];
    const split = draftWorkerSort.lastIndexOf("_");
    const metric = draftWorkerSort.slice(0, split);
    const direction = draftWorkerSort.slice(split + 1);
    return <div className="absolute inset-0 z-[110] flex items-end bg-slate-950/60" onClick={() => setWorkerSortSheetOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label={tr("Sort users", "ഉപയോക്താക്കളെ ക്രമീകരിക്കുക")} onClick={event => event.stopPropagation()} className="flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-[24px] border-t border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800"><h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><ArrowUpDown className="h-4 w-4 text-[#ff5500]" />{tr("Sort By", "ക്രമീകരിക്കുക")}</h2><button type="button" aria-label="Close" onClick={() => setWorkerSortSheetOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"><X className="h-4 w-4" /></button></div>
        <div className="min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><p className="px-3 pb-1 pt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">{tr("Sort By", "ക്രമീകരിക്കുക")}</p><div role="radiogroup" aria-label="Sort By">{options.map(option => { const selected = metric === option.id; return <button key={option.id} type="button" role="radio" aria-checked={selected} onClick={() => setDraftWorkerSort((option.id + (option.id === "name" ? "_asc" : "_desc")) as WorkerSortOption)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold ${selected ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"}`}><span>{option[lang]}</span><span className={`flex h-4 w-4 items-center justify-center rounded-full border ${selected ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 dark:border-slate-600"}`}>{selected && <Check className="h-3 w-3" />}</span></button>; })}</div>
        <p className="px-3 pb-1 pt-3 text-[10px] font-bold text-slate-500 dark:text-slate-400">{tr("Sort Order", "ക്രമം")}</p><div role="radiogroup" aria-label="Sort Order" className="mx-3 flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/70">{(metric === "name" ? [{ id: "asc", label: "A to Z" }, { id: "desc", label: "Z to A" }] : [{ id: "desc", label: tr("High to Low", "ഉയർന്നതിൽ നിന്ന് താഴേക്ക്") }, { id: "asc", label: tr("Low to High", "താഴ്ന്നതിൽ നിന്ന് മുകളിലേക്ക്") }]).map(option => <button key={option.id} type="button" role="radio" aria-checked={direction === option.id} onClick={() => setDraftWorkerSort((metric + "_" + option.id) as WorkerSortOption)} className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold ${direction === option.id ? "bg-white text-orange-700 shadow-sm dark:bg-slate-700 dark:text-orange-300" : "text-slate-500 dark:text-slate-400"}`}>{option.id === "desc" ? "↓" : "↑"} {option.label}</button>)}</div><p className="px-3 pt-2 text-[10px] text-slate-500 dark:text-slate-400">{tr("Users will be sorted by the selected criterion and order.", "തിരഞ്ഞെടുത്ത ക്രമത്തിൽ ഉപയോക്താക്കളെ കാണിക്കും.")}</p></div>
        <button type="button" onClick={() => { setWorkerSortOption(draftWorkerSort); setWorkerSortSheetOpen(false); }} className="mt-3 shrink-0 rounded-lg bg-[#ff5500] py-2.5 text-xs font-extrabold text-white">{tr("Apply", "പ്രയോഗിക്കുക")}</button>
      </div></div>;
  };

  const renderProfilePermissions = (
    permissions: string[],
    dataAccess?: RoleDataAccess,
  ) => {
    const isModulePermChecked = (moduleId: string, colId: string): boolean => {
      if (moduleId === "team") {
        return permissions.includes("party_workers.view") || permissions.includes("party_workers.view_teams");
      }
      if (moduleId === "help_desk") {
        if (colId === "view") return permissions.includes("help_desk.view");
        if (colId === "assign") return permissions.includes("help_desk.assign");
        if (colId === "respond") return permissions.includes("help_desk.respond");
        return false;
      }
      const override = permissionTableKeyOverrides[moduleId as PermissionModuleId]?.[colId];
      if (override && override.length > 0) {
        return override.some((actionId) => permissions.includes(permissionKey(moduleId as PermissionModuleId, actionId)));
      }
      return permissions.includes(permissionKey(moduleId as PermissionModuleId, colId));
    };

    const getDataAccessBadge = (moduleId: string) => {
      const scopes = dataAccess?.[moduleId as PermissionModuleId];
      if (scopes && scopes.length > 0) {
        const primary = dataAccessOptions.find((opt) => opt.id === scopes[0]);
        if (primary) return lang === "ml" ? primary.ml : primary.en;
      }
      if (moduleId === "help_desk") {
        return lang === "ml" ? "സ്വന്തം റെക്കോർഡുകൾ" : "Own Records";
      }
      return lang === "ml" ? "സ്വന്തം റെക്കോർഡുകൾ" : "Own Records";
    };

    const primaryRows = [
      { id: "applicant_profile", en: "Applicant Profile", ml: "അപേക്ഷകന്റെ പ്രൊഫൈൽ", icon: UserRound },
      { id: "applications", en: "Applications", ml: "അപേക്ഷകൾ", icon: ClipboardList },
      { id: "schemes", en: "Schemes", ml: "പദ്ധതികൾ", icon: FileText },
      { id: "roles", en: "Role & Access", ml: "റോളും ആക്‌സസും", icon: ShieldCheck },
      { id: "designations", en: "Designation", ml: "തസ്തിക", icon: Users2 },
      { id: "party_workers", en: "Users", ml: "ഉപയോക്താക്കൾ", icon: Users },
    ];

    const secondaryRows = [
      { id: "help_desk", en: "Request", ml: "അഭ്യർത്ഥന", icon: Headset, hasAssign: true, hasRespond: true },
      { id: "team", en: "Team", ml: "ടീം", icon: Users, hasAssign: false, hasRespond: false },
    ];

    return (
      <div className="p-3">
        <SectionHeading
          icon={ShieldCheck}
          title={tr("Role Permissions", "റോൾ പെർമിഷനുകൾ")}
          subtitle={tr("Module permissions and data access levels", "മൊഡ്യൂൾ പെർമിഷനുകളും ഡാറ്റ ആക്സസ് തലങ്ങളും")}
        />

        <div className="mt-2.5 space-y-3">
          {/* Table 1: Primary CRUD Modules */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full min-w-[460px] text-[9.5px]">
                <thead>
                  <tr className="border-b border-orange-100/90 bg-orange-50/70 text-[8px] font-black uppercase tracking-wider text-orange-800/80 dark:border-slate-800 dark:bg-slate-800/70 dark:text-orange-300">
                    <th className="py-2 pl-3 pr-2 text-left font-black">{tr("MODULES", "മൊഡ്യൂളുകൾ")}</th>
                    <th className="px-1.5 py-2 text-center font-black">{tr("CREATE", "സൃഷ്ടിക്കുക")}</th>
                    <th className="px-1.5 py-2 text-center font-black">{tr("VIEW", "കാണുക")}</th>
                    <th className="px-1.5 py-2 text-center font-black">{tr("EDIT", "തിരുത്തുക")}</th>
                    <th className="px-1.5 py-2 text-center font-black">{tr("DELETE", "നീക്കം ചെയ്യുക")}</th>
                    <th className="py-2 pl-2 pr-3 text-left font-black">{tr("DATA ACCESS LEVEL", "ഡാറ്റാ ആക്സസ് ലെവൽ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {primaryRows.map((row) => {
                    const Icon = row.icon;
                    const createChecked = isModulePermChecked(row.id, "create");
                    const viewChecked = isModulePermChecked(row.id, "view");
                    const editChecked = isModulePermChecked(row.id, "edit");
                    const deleteChecked = isModulePermChecked(row.id, "delete");

                    return (
                      <tr key={row.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 pl-3 pr-2 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                            <span className="whitespace-nowrap">{lang === "ml" ? row.ml : row.en}</span>
                          </div>
                        </td>
                        <td className="px-1.5 py-2.5 text-center">
                          <span
                            className={`mx-auto flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                              createChecked
                                ? "border-[#ff5500] bg-[#ff5500] text-white shadow-2xs"
                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                            }`}
                          >
                            {createChecked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                          </span>
                        </td>
                        <td className="px-1.5 py-2.5 text-center">
                          <span
                            className={`mx-auto flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                              viewChecked
                                ? "border-[#ff5500] bg-[#ff5500] text-white shadow-2xs"
                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                            }`}
                          >
                            {viewChecked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                          </span>
                        </td>
                        <td className="px-1.5 py-2.5 text-center">
                          <span
                            className={`mx-auto flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                              editChecked
                                ? "border-[#ff5500] bg-[#ff5500] text-white shadow-2xs"
                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                            }`}
                          >
                            {editChecked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                          </span>
                        </td>
                        <td className="px-1.5 py-2.5 text-center">
                          <span
                            className={`mx-auto flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                              deleteChecked
                                ? "border-[#ff5500] bg-[#ff5500] text-white shadow-2xs"
                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                            }`}
                          >
                            {deleteChecked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                          </span>
                        </td>
                        <td className="py-2.5 pl-2 pr-3">
                          <div className="inline-flex h-6 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2 text-[9px] font-semibold text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <span className="truncate max-w-[120px]">{getDataAccessBadge(row.id)}</span>
                            <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Request & Team Modules */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full min-w-[420px] text-[9.5px]">
                <thead>
                  <tr className="border-b border-orange-100/90 bg-orange-50/70 text-[8px] font-black uppercase tracking-wider text-orange-800/80 dark:border-slate-800 dark:bg-slate-800/70 dark:text-orange-300">
                    <th className="py-2 pl-3 pr-2 text-left font-black">{tr("MODULES", "മൊഡ്യൂളുകൾ")}</th>
                    <th className="px-1.5 py-2 text-center font-black">{tr("VIEW", "കാണുക")}</th>
                    <th className="px-1.5 py-2 text-center font-black">{tr("ASSIGN", "അസൈൻ ചെയ്യുക")}</th>
                    <th className="px-1.5 py-2 text-center font-black">{tr("RESPOND", "മറുപടി നൽകുക")}</th>
                    <th className="py-2 pl-2 pr-3 text-left font-black">{tr("DATA ACCESS LEVEL", "ഡാറ്റാ ആക്സസ് ലെവൽ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {secondaryRows.map((row) => {
                    const Icon = row.icon;
                    const viewChecked = isModulePermChecked(row.id, "view");
                    const assignChecked = row.hasAssign ? isModulePermChecked(row.id, "assign") : false;
                    const respondChecked = row.hasRespond ? isModulePermChecked(row.id, "respond") : false;

                    return (
                      <tr key={row.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 pl-3 pr-2 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                            <span className="whitespace-nowrap">{lang === "ml" ? row.ml : row.en}</span>
                          </div>
                        </td>
                        <td className="px-1.5 py-2.5 text-center">
                          <span
                            className={`mx-auto flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                              viewChecked
                                ? "border-[#ff5500] bg-[#ff5500] text-white shadow-2xs"
                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                            }`}
                          >
                            {viewChecked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                          </span>
                        </td>
                        <td className="px-1.5 py-2.5 text-center">
                          {row.hasAssign ? (
                            <span
                              className={`mx-auto flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                                assignChecked
                                  ? "border-[#ff5500] bg-[#ff5500] text-white shadow-2xs"
                                  : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                              }`}
                            >
                              {assignChecked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-1.5 py-2.5 text-center">
                          {row.hasRespond ? (
                            <span
                              className={`mx-auto flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                                respondChecked
                                  ? "border-[#ff5500] bg-[#ff5500] text-white shadow-2xs"
                                  : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                              }`}
                            >
                              {respondChecked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pl-2 pr-3">
                          <div className="inline-flex h-6 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2 text-[9px] font-semibold text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <span className="truncate max-w-[120px]">{getDataAccessBadge(row.id)}</span>
                            <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    if (!profile) return null;
    const designationLevel = partyDesignations.find(
      (item) => item.en === profile.designationEn || item.ml === profile.designationMl,
    )?.level;
    const profileLevel =
      designationLevel ||
      profile.level ||
      assignmentLevels.find(
        (item) => item.en === profile.levelLabelEn || item.ml === profile.levelLabelMl,
      )?.id;
    const boothNumber = Number(profile.locationLines.en.match(/Booth\s+(\d+)/i)?.[1]);
    const profileBooth =
      boothDirectory.find((item) => item.id === profile.boothId) ||
      (profileLevel === "booth" && Number.isFinite(boothNumber)
        ? boothDirectory.find(
            (item) => item.constituencyId === profile.constituencyId && item.number === boothNumber,
          )
        : undefined);
    const profileDistrict =
      districts.find((item) => item.id === profile.districtId) ||
      districts.find(
        (item) => item.en === profile.districtNameEn || item.ml === profile.districtNameMl,
      );
    const profileOrgDistrict =
      organisationalDistricts.find((item) => item.id === profile.orgDistrictId) ||
      organisationalDistricts.find(
        (item) => item.en === profile.orgDistrictNameEn || item.ml === profile.orgDistrictNameMl,
      );
    const profileConstituency =
      constituencies.find((item) => item.id === profile.constituencyId) ||
      constituencies.find(
        (item) =>
          profile.locationLines.en.includes(item.en) || profile.locationLines.ml.includes(item.ml),
      );
    const profileLocalBody =
      panchayats.find((item) => item.id === profile.localBodyId) ||
      panchayats.find(
        (item) =>
          profile.locationLines.en.includes(item.en) || profile.locationLines.ml.includes(item.ml),
      );
    const profileWard = profileLocalBody
      ? getWardsForLocalBody(profileLocalBody.id).find(
          (item) =>
            item.id === profile.wardId ||
            profile.locationLines.en.includes(item.displayEn) ||
            profile.locationLines.ml.includes(item.displayMl),
        )
      : undefined;
    const profileAreaLabel = (() => {
      if (profileLevel === "state") return lang === "ml" ? "കേരളം" : "Kerala";
      if (profileLevel === "region") {
        const names = lang === "ml" ? (profile.regionNamesMl ?? []) : (profile.regionNamesEn ?? []);
        const resolved = names.length
          ? names
          : districts
              .filter((item) => (profile.regionIds ?? []).includes(item.id))
              .map((item) => (lang === "ml" ? item.ml : item.en));
        if (resolved.length) return resolved.join(", ");
        return lang === "ml" ? profile.districtNameMl || "" : profile.districtNameEn || "";
      }
      if (profileLevel === "district") {
        return lang === "ml"
          ? profileDistrict?.ml || profile.districtNameMl
          : profileDistrict?.en || profile.districtNameEn;
      }
      if (profileLevel === "area") {
        return [
          profileDistrict ? (lang === "ml" ? profileDistrict.ml : profileDistrict.en) : "",
          profileOrgDistrict ? (lang === "ml" ? profileOrgDistrict.ml : profileOrgDistrict.en) : "",
          profileConstituency
            ? lang === "ml"
              ? profileConstituency.ml
              : profileConstituency.en
            : "",
        ]
          .filter(Boolean)
          .join(" → ");
      }
      if (profileLevel === "assembly_constituency") {
        return profileConstituency
          ? lang === "ml"
            ? profileConstituency.ml
            : profileConstituency.en
          : "";
      }
      if (profileLevel === "local_body") {
        return profileLocalBody ? (lang === "ml" ? profileLocalBody.ml : profileLocalBody.en) : "";
      }
      if (profileLevel === "ward") {
        return profileWard ? (lang === "ml" ? profileWard.displayMl : profileWard.displayEn) : "";
      }
      if (profileLevel === "booth") {
        return profileBooth ? (lang === "ml" ? profileBooth.nameMl : profileBooth.nameEn) : "";
      }
      if (profileLevel === "org_unit" && profile.orgUnitId) {
        return getPartyOrgPath(profile.orgUnitId, lang);
      }
      return "";
    })();

    // Resolve hierarchical locations
    const userRegion = getUserRegion({ districtNameEn: profile.districtNameEn, districtNameMl: profile.districtNameMl } as Partial<AppUser>);
    const userOrgDistrict = getUserOrgDistrict({ districtNameEn: profile.districtNameEn, districtNameMl: profile.districtNameMl, id: profile.id } as Partial<AppUser>);
    const userMandalam = getUserMandalam({ constituencyEn: profileConstituency?.en, constituencyMl: profileConstituency?.ml, districtNameEn: profile.districtNameEn } as Partial<AppUser>);
    const userArea = getUserArea({ areaEn: profileAreaLabel, constituencyEn: profileConstituency?.en, districtNameEn: profile.districtNameEn, id: profile.id } as Partial<AppUser>);
    const userBooth = profileBooth
      ? lang === "ml" ? profileBooth.nameMl : profileBooth.nameEn
      : getUserBooth({ designationEn: profile.designationEn, id: profile.id } as Partial<AppUser>);

    // Resolve Role and Role Level
    const resolvedRoleName = (() => {
      if (profile.presetId) {
        const preset = rolePresets.find((p) => p.id === profile.presetId);
        if (preset) return lang === "ml" ? preset.ml : preset.en;
      }
      return profileLevel === "state"
        ? (lang === "ml" ? "സംസ്ഥാന അഡ്മിൻ" : "State Admin")
        : profileLevel === "district"
          ? (lang === "ml" ? "ജില്ലാ അഡ്മിൻ" : "District Admin")
          : profileLevel === "assembly_constituency" || profileLevel === "mandalam"
            ? (lang === "ml" ? "നിയോജകമണ്ഡലം അഡ്മിൻ" : "Constituency Admin")
            : profileLevel === "local_body"
              ? (lang === "ml" ? "തദ്ദേശ സ്ഥാപന അഡ്മിൻ" : "Local Body Admin")
              : profileLevel === "booth"
                ? (lang === "ml" ? "ബൂത്ത് അഡ്മിൻ" : "Booth Admin")
                : (lang === "ml" ? "ഉപയോക്താവ്" : "Party Worker");
    })();

    const resolvedRoleLevel = (() => {
      const match = roleLevelOptions.find((opt) => opt.id === profileLevel);
      if (match) return lang === "ml" ? match.ml : match.en;
      return lang === "ml" ? profile.levelLabelMl : profile.levelLabelEn;
    })();

    const SummaryRow = ({
      icon: Icon,
      label,
      value,
    }: {
      icon?: React.ElementType;
      label: string;
      value: string;
    }) => (
      <div className="flex items-center justify-between py-2.5 px-3.5 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-[#EA580C] dark:text-orange-400 stroke-[1.8]" /> : null}
          <span className="truncate text-[11.5px] font-medium text-slate-500 dark:text-slate-400">
            {label}
          </span>
        </div>
        <span className="shrink-0 text-right text-[11.5px] font-bold text-[#1B255A] dark:text-white">
          {value || tr("Not provided", "നൽകിയിട്ടില്ല")}
        </span>
      </div>
    );

    return (
      <section className="relative bg-white dark:bg-slate-900 min-h-full">
        <div>
          <input
            ref={profilePhotoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="hidden"
            onChange={handleProfilePhotoChange}
          />
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
            <div className="relative shrink-0">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-orange-50 shadow-sm ring-2 ring-orange-100/80 dark:bg-slate-800 dark:ring-slate-700">
                <img
                  src={profile.photoUrl || partyWorkerAvatar}
                  alt={profile.name}
                  className={`h-full w-full rounded-full object-cover ${
                    profile.photoUrl ? "" : "scale-[1.22]"
                  }`}
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[15px] font-extrabold leading-tight text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
              </div>
              <p className="mt-1 text-[11px] font-bold text-[#C2410C] dark:text-orange-300">
                {lang === "ml" ? profile.designationMl : profile.designationEn}
              </p>
              {profileAreaLabel ? (
                <p className="mt-1 flex items-center gap-1 text-[10px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3 w-3 shrink-0 text-[#ff5500]" />
                  <span className="truncate">{profileAreaLabel}</span>
                </p>
              ) : null}
            </div>
          </div>
          {profilePhotoError ? (
            <p className="mt-2.5 flex items-start gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[9.5px] font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
              {profilePhotoError}
            </p>
          ) : null}

          {/* 2 Tabs: Information | Assisted Applications */}
          <div className="mt-3 flex border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setProfileActiveTab("informations")}
              className={`flex-1 pb-2.5 text-center text-[11.5px] transition-colors border-b-2 ${
                profileActiveTab === "informations"
                  ? "border-[#1B255A] text-[#1B255A] font-extrabold dark:border-blue-400 dark:text-blue-300"
                  : "border-transparent text-slate-500 font-bold hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tr("Information", "വിവരങ്ങൾ")}
            </button>
            <button
              type="button"
              onClick={() => setProfileActiveTab("applications")}
              className={`flex-1 pb-2.5 text-center text-[11.5px] transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                profileActiveTab === "applications"
                  ? "border-[#1B255A] text-[#1B255A] font-extrabold dark:border-blue-400 dark:text-blue-300"
                  : "border-transparent text-slate-500 font-bold hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span>{tr("Assisted Applications", "സഹായിച്ച അപേക്ഷകൾ")}</span>
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none ${
                  profileActiveTab === "applications"
                    ? "bg-slate-100 text-[#1B255A] dark:bg-slate-800 dark:text-blue-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                19
              </span>
            </button>
          </div>

          {/* Tab 1: Informations */}
          {profileActiveTab === "informations" && (
            <div className="pt-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs divide-y divide-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:divide-slate-800/80">
                <SummaryRow icon={Phone} label={tr("Mobile Number", "മൊബൈൽ നമ്പർ")} value={`+91 ${profile.mobile}`} />
                <SummaryRow
                  icon={Building2}
                  label={tr("Organisation Level", "ഓർഗനൈസേഷൻ ലെവൽ")}
                  value={lang === "ml" ? profile.levelLabelMl : profile.levelLabelEn}
                />
                <SummaryRow
                  icon={Briefcase}
                  label={tr("Designation", "പദവി")}
                  value={lang === "ml" ? profile.designationMl : profile.designationEn}
                />
                <SummaryRow icon={User} label={tr("Role", "റോൾ")} value={resolvedRoleName} />
                <SummaryRow icon={Shield} label={tr("Role Level", "റോൾ ലെവൽ")} value={resolvedRoleLevel} />

                <SummaryRow icon={MapPin} label={tr("Region", "റീജിയൺ")} value={userRegion} />
                <SummaryRow
                  icon={Building}
                  label={tr("Organisational District", "ഓർഗനൈസേഷണൽ ജില്ല")}
                  value={userOrgDistrict}
                />

                {profileLevel !== "state" && profileLevel !== "region" && (
                  <SummaryRow icon={GitFork} label={tr("Mandalam", "മണ്ഡലം")} value={userMandalam} />
                )}

                {profileLevel !== "state" &&
                  profileLevel !== "region" &&
                  profileLevel !== "district" && (
                    <SummaryRow icon={MapPin} label={tr("Area", "ഏരിയ")} value={userArea} />
                  )}

                {profileLocalBody && (
                  <SummaryRow
                    icon={Landmark}
                    label={tr("Local Body", "തദ്ദേശ സ്ഥാപനം")}
                    value={lang === "ml" ? profileLocalBody.ml : profileLocalBody.en}
                  />
                )}

                {profileWard && (
                  <SummaryRow
                    icon={Home}
                    label={tr("Ward", "വാർഡ്")}
                    value={lang === "ml" ? profileWard.displayMl : profileWard.displayEn}
                  />
                )}

                {(profileLevel === "booth" || profileBooth) && (
                  <SummaryRow icon={Vote} label={tr("Booth", "ബൂത്ത്")} value={userBooth} />
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Assisted Applications */}
          {profileActiveTab === "applications" && (
            <div className="pt-1.5 space-y-2">
              {/* Header Control Row: View Selection Dropdown + Bullet Date Label (Left) + Circular Action Controls (Right) */}
              <div className="flex items-center justify-between gap-1.5 pt-0.5 pb-0.5">
                {/* Left side: View Selection Dropdown + Selected Bullet Date Label */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setAssistedViewDropdownOpen(!assistedViewDropdownOpen)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#1B255A] shadow-2xs hover:bg-slate-50/80 dark:border-slate-700/80 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800/80 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <span>
                        {assistedViewMode === "applications"
                          ? tr("Applications View", "അപേക്ഷകളുടെ വ്യൂ")
                          : tr("Scheme-wise View", "പദ്ധതി അധിഷ്ഠിത വ്യൂ")}
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                          assistedViewDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {assistedViewDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setAssistedViewDropdownOpen(false)}
                        />
                        <div className="absolute left-0 top-full mt-1.5 z-40 w-48 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in-0 zoom-in-95 duration-150">
                          <div className="px-2.5 py-1 mb-1 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              {tr("Select View", "കാഴ്‌ച തിരഞ്ഞെടുക്കുക")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAssistedViewMode("applications");
                              setAssistedViewDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[11px] font-bold transition-all ${
                              assistedViewMode === "applications"
                                ? "bg-orange-50 text-[#ff5500] dark:bg-orange-950/40 dark:text-orange-400 font-extrabold"
                                : "text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 opacity-70" />
                              <span>{tr("Applications View", "അപേക്ഷകളുടെ വ്യൂ")}</span>
                            </div>
                            {assistedViewMode === "applications" && (
                              <Check className="h-3.5 w-3.5 text-[#ff5500] dark:text-orange-400 stroke-[2.5]" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAssistedViewMode("schemes");
                              setAssistedViewDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[11px] font-bold transition-all ${
                              assistedViewMode === "schemes"
                                ? "bg-orange-50 text-[#ff5500] dark:bg-orange-950/40 dark:text-orange-400 font-extrabold"
                                : "text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Layers className="h-3.5 w-3.5 opacity-70" />
                              <span>{tr("Scheme-wise View", "പദ്ധതി അധിഷ്ഠിത വ്യൂ")}</span>
                            </div>
                            {assistedViewMode === "schemes" && (
                              <Check className="h-3.5 w-3.5 text-[#ff5500] dark:text-orange-400 stroke-[2.5]" />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {assistedDateRange !== "all" && assistedDateRange !== "all_time" && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1B255A] dark:text-white truncate">
                      <span className="text-black dark:text-white font-extrabold text-sm leading-none">▪</span>
                      <span className="truncate">
                        {assistedDateRange === "oct2026" || assistedDateRange === "this_month"
                          ? "October 2026"
                          : assistedDateRange === "sep2026" || assistedDateRange === "last_month"
                          ? "September 2026"
                          : assistedDateRange === "this_year"
                          ? "2026"
                          : assistedDateRange === "last_year"
                          ? "2025"
                          : assistedDateRange === "today"
                          ? "Today"
                          : assistedDateRange === "yesterday"
                          ? "Yesterday"
                          : assistedDateRange === "this_week"
                          ? "This Week"
                          : assistedDateRange === "last_week"
                          ? "Last Week"
                          : "October 2026"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right side: Circular Action Controls (<, >, Calendar) */}
                <div className="flex items-center gap-1 shrink-0 relative">
                  {/* Prev Period */}
                  <button
                    type="button"
                    onClick={() => {
                      const periods = ["all", "this_month", "oct2026", "sep2026", "this_year"];
                      const currentIndex = periods.indexOf(assistedDateRange);
                      const prevIndex = (currentIndex - 1 + periods.length) % periods.length;
                      setAssistedDateRange(periods[prevIndex]);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-200 bg-orange-50/50 text-[#ff5500] hover:bg-orange-100 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400 active:scale-95 transition-all shadow-2xs cursor-pointer"
                    title={tr("Previous Period", "മുൻപത്തെ സമയം")}
                  >
                    <ChevronLeft className="h-3 w-3 stroke-[2.5]" />
                  </button>

                  {/* Next Period */}
                  <button
                    type="button"
                    onClick={() => {
                      const periods = ["all", "this_month", "oct2026", "sep2026", "this_year"];
                      const currentIndex = periods.indexOf(assistedDateRange);
                      const nextIndex = (currentIndex + 1) % periods.length;
                      setAssistedDateRange(periods[nextIndex]);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-200 bg-orange-50/50 text-[#ff5500] hover:bg-orange-100 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400 active:scale-95 transition-all shadow-2xs cursor-pointer"
                    title={tr("Next Period", "അടുത്ത സമയം")}
                  >
                    <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                  </button>

                  {/* Calendar Date Picker Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setDatePickerOpen(true)}
                    className={`flex h-6.5 w-6.5 items-center justify-center rounded-full border transition-all active:scale-95 shadow-2xs cursor-pointer ${
                      datePickerOpen || (assistedDateRange !== "all" && assistedDateRange !== "all_time")
                        ? "bg-[#ff5500] text-white border-orange-600"
                        : "border-orange-200 bg-orange-50/50 text-[#ff5500] hover:bg-orange-100 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400"
                    }`}
                    title={tr("Date Range Filter", "തീയതി ഫിൽട്ടർ")}
                  >
                    <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Select Period & Date Bottom Sheet Modal (Home date picker modal reused with zero left/right/bottom space) */}
              <DatePickerModal
                isOpen={datePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                selectedPeriod={assistedDateRange}
                onSelectPeriod={(period) => {
                  setAssistedDateRange(period);
                  setDatePickerOpen(false);
                }}
                inlineInApp={true}
              />

              {assistedViewMode === "applications" ? (
                /* Applications View (Attachment 2) */
                <div className="space-y-1.5">
                  {/* Top 5-Metric Box - Clean Dividers, No Orange Highlights per Applicant Profile UI */}
                  {/* Order: Applications, Approved, Rejected, In Review, Pending */}
                  <div className="flex items-stretch rounded-xl border border-slate-200/90 bg-[#F8FAFC] dark:border-slate-800 dark:bg-slate-900/90 overflow-hidden divide-x divide-slate-200/70 dark:divide-slate-800 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setAssistedStatusFilter("all")}
                      className="flex-1 py-1.5 px-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                    >
                      <span className="text-[12px] font-black text-slate-900 dark:text-white leading-none">5</span>
                      <span className="text-[7.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                        {tr("Applications", "അപേക്ഷകൾ")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAssistedStatusFilter("approved")}
                      className="flex-1 py-1.5 px-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                    >
                      <span className="text-[12px] font-black text-[#00875A] dark:text-emerald-400 leading-none">3</span>
                      <span className="text-[7.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                        {tr("Beneficiary", "അംഗീകരിച്ചു")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAssistedStatusFilter("rejected")}
                      className="flex-1 py-1.5 px-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                    >
                      <span className="text-[12px] font-black text-[#DC2626] dark:text-rose-400 leading-none">0</span>
                      <span className="text-[7.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                        {tr("Rejected", "നിരസിച്ചു")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAssistedStatusFilter("in_review")}
                      className="flex-1 py-1.5 px-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                    >
                      <span className="text-[12px] font-black text-[#2563EB] dark:text-blue-400 leading-none">0</span>
                      <span className="text-[7.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                        {tr("In Review", "പരിശോധനയിൽ")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAssistedStatusFilter("pending")}
                      className="flex-1 py-1.5 px-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                    >
                      <span className="text-[12px] font-black text-[#EA580C] dark:text-amber-400 leading-none">2</span>
                      <span className="text-[7.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                        {tr("Pending", "തീർപ്പില്ലാത്തവ")}
                      </span>
                    </button>
                  </div>

                  {/* Individual Application Cards (Attachment media_1795239761903_0840ab4a.jpg) */}
                  {assistedAppList
                    .filter((app) => {
                      if (assistedStatusFilter !== "all" && app.status !== assistedStatusFilter) return false;
                      if (assistedDateRange !== "all") {
                        if (
                          (assistedDateRange === "this_month" || assistedDateRange === "oct2026") &&
                          (app.periodKey === "this_month" || app.periodKey === "oct2026")
                        ) {
                          return true;
                        }
                        if (app.periodKey !== assistedDateRange) return false;
                      }
                      return true;
                    })
                    .map((app) => {
                      const isMenuOpen = openCardMenuId === app.id;

                      return (
                        <div
                          key={app.id}
                          onClick={() => {
                            setOpenCardMenuId(null);
                            if (onSelectApplication) {
                              onSelectApplication(app);
                            } else {
                              setSelectedAssistedApp(app);
                            }
                          }}
                          className="relative rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 active:scale-[0.99] transition-all"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {/* Left Side: Scheme Name + Applicant Name */}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[11.5px] font-extrabold leading-snug text-slate-900 dark:text-white line-clamp-1">
                                {lang === "ml" ? app.titleMl : app.titleEn}
                              </h4>
                              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                                {app.applicantName}
                              </p>
                            </div>

                            {/* Right Side: Status Badge + Date + 3 Dots Button */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="flex flex-col items-end gap-0.5">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold border ${
                                    app.status === "approved"
                                      ? "bg-[#E6F8F2] text-[#00875A] border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                      : "bg-[#F1F3FB] text-[#4A5578] border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                  }`}
                                >
                                  {app.status === "approved" ? (
                                    <CheckCircle2 className="h-3 w-3 text-[#00875A] dark:text-emerald-400 shrink-0" />
                                  ) : (
                                    <Inbox className="h-3 w-3 text-[#4A5578] dark:text-slate-400 shrink-0" />
                                  )}
                                  {lang === "ml" ? app.statusLabelMl : app.statusLabelEn}
                                </span>
                                <span className="text-[8px] font-medium text-slate-400 dark:text-slate-500 pr-0.5">
                                  {app.date}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenCardMenuId(isMenuOpen ? null : app.id);
                                }}
                                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition cursor-pointer"
                                title="Actions"
                              >
                                <MoreVertical className="h-4 w-4 stroke-[2.2]" />
                              </button>
                            </div>
                          </div>

                          {/* 3 Dot Actions Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-2 top-10 z-40 w-32 rounded-xl border border-slate-200/90 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-100 space-y-0.5"
                            >
                              {/* View Action */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  if (onSelectApplication) {
                                    onSelectApplication(app);
                                  } else {
                                    setSelectedAssistedApp(app);
                                  }
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                <span>{tr("View", "വ്യൂ")}</span>
                              </button>

                              {/* Call Action */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  window.location.href = `tel:+91${app.applicantPhone || "9876543210"}`;
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{tr("Call", "വിളിക്കുക")}</span>
                              </button>

                              {/* Delete Action */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  toast.success(
                                    tr(
                                      "Deletion request submitted. Will be deleted after Higher Authority Approval.",
                                      "ഡിലീറ്റ് അപേക്ഷ സമർപ്പിച്ചു. ഉന്നതാധികാര അനുമതി ലഭിച്ച ശേഷം നീക്കം ചെയ്യപ്പെടും."
                                    )
                                  );
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                <span>{tr("Delete", "ഡിലീറ്റ്")}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                /* Scheme-wise View (Current View / Attachment 1) */
                <div className="space-y-1.5">
                  {[
                    {
                      id: "pm-kisan",
                      titleEn: "PM Kisan Samman Nidhi",
                      titleMl: "പിഎം കിസാൻ സമ്മാൻ നിധി",
                      categoryEn: "Agriculture",
                      categoryMl: "കൃഷി",
                      logo: "/images/popular-schemes/pm_kisan.png",
                      total: 3,
                      approved: 0,
                      inReview: 1,
                      pending: 2,
                      rejected: 0,
                    },
                    {
                      id: "pmfby",
                      titleEn: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                      titleMl: "പ്രധാനമന്ത്രി ഫസൽ ഭീമ യോജന (PMFBY)",
                      categoryEn: "Agriculture",
                      categoryMl: "കൃഷി",
                      logo: "/images/popular-schemes/pm_kisan.png",
                      total: 5,
                      approved: 0,
                      inReview: 1,
                      pending: 4,
                      rejected: 0,
                    },
                    {
                      id: "kcc",
                      titleEn: "Kisan Credit Card (KCC) Scheme",
                      titleMl: "കിസാൻ ക്രെഡിറ്റ് കാർഡ് (KCC) പദ്ധതി",
                      categoryEn: "Agriculture Credit",
                      categoryMl: "കാർഷിക വായ്പ",
                      logo: "/images/popular-schemes/pm_kisan.png",
                      total: 4,
                      approved: 0,
                      inReview: 2,
                      pending: 2,
                      rejected: 0,
                    },
                    {
                      id: "pmjdy",
                      titleEn: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
                      titleMl: "പ്രധാനമന്ത്രി ജൻ ധൻ യോജന (PMJDY)",
                      categoryEn: "Banking",
                      categoryMl: "ബാങ്കിംഗ്",
                      logo: "/images/popular-schemes/pm_jan_dhan.png",
                      total: 4,
                      approved: 0,
                      inReview: 2,
                      pending: 2,
                      rejected: 0,
                    },
                    {
                      id: "apy",
                      titleEn: "Atal Pension Yojana (APY)",
                      titleMl: "അടൽ പെൻഷൻ യോജന (APY)",
                      categoryEn: "Banking & Pension",
                      categoryMl: "ബാങ്കിംഗ് & പെൻഷൻ",
                      logo: "/images/popular-schemes/atal_pension.png",
                      total: 3,
                      approved: 0,
                      inReview: 1,
                      pending: 2,
                      rejected: 0,
                    },
                  ].map((scheme) => (
                    <div
                      key={scheme.id}
                      onClick={() => {
                        if (onSelectScheme) {
                          onSelectScheme(scheme);
                        } else {
                          setSelectedAssistedScheme(scheme);
                        }
                      }}
                      className="rounded-lg border border-slate-200/90 bg-white p-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900 cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 active:scale-[0.99] transition-all"
                    >
                      {/* Top section: Icon, Title, Category, ChevronRight */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="h-7 w-7 shrink-0 rounded-md bg-white dark:bg-slate-800 p-0.5 flex items-center justify-center border border-slate-100 dark:border-slate-700 overflow-hidden shadow-2xs">
                            <img src={scheme.logo} alt="" className="h-full w-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[11px] font-extrabold leading-tight text-[#1B255A] dark:text-white truncate">
                              {lang === "ml" ? scheme.titleMl : scheme.titleEn}
                            </h4>
                            <p className="text-[9px] font-medium text-[#8E9BBA] dark:text-slate-400 truncate">
                              {lang === "ml" ? scheme.categoryMl : scheme.categoryEn}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#1B255A] dark:text-slate-300 stroke-[2]" />
                      </div>

                      {/* Bottom section: 5-KPI Segmented Pill Container */}
                      <div className="mt-1.5 flex items-stretch rounded-md bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#F1F5F9] dark:border-slate-800 overflow-hidden divide-x divide-[#E2E8F0] dark:divide-slate-700/60">
                        <div className="flex-1 py-0.5 px-0.5 flex flex-col items-center justify-center text-center">
                          <span className="text-[11px] font-extrabold text-[#1B255A] dark:text-blue-300 leading-none">
                            {scheme.total}
                          </span>
                          <span className="text-[7px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                            {tr("Applications", "അപേക്ഷകൾ")}
                          </span>
                        </div>

                        <div className="flex-1 py-0.5 px-0.5 flex flex-col items-center justify-center text-center">
                          <span className="text-[11px] font-extrabold text-[#00875A] dark:text-emerald-400 leading-none">
                            {scheme.approved}
                          </span>
                          <span className="text-[7px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                            {tr("Beneficiary", "അംഗീകരിച്ചു")}
                          </span>
                        </div>

                        <div className="flex-1 py-0.5 px-0.5 flex flex-col items-center justify-center text-center">
                          <span className="text-[11px] font-extrabold text-[#DC2626] dark:text-rose-400 leading-none">
                            {scheme.rejected}
                          </span>
                          <span className="text-[7px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                            {tr("Rejected", "നിരസിച്ചു")}
                          </span>
                        </div>

                        <div className="flex-1 py-0.5 px-0.5 flex flex-col items-center justify-center text-center">
                          <span className="text-[11px] font-extrabold text-[#2563EB] dark:text-blue-400 leading-none">
                            {scheme.inReview}
                          </span>
                          <span className="text-[7px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                            {tr("In Review", "പരിശോധനയിൽ")}
                          </span>
                        </div>

                        <div className="flex-1 py-0.5 px-0.5 flex flex-col items-center justify-center text-center">
                          <span className="text-[11px] font-extrabold text-[#EA580C] dark:text-amber-400 leading-none">
                            {scheme.pending}
                          </span>
                          <span className="text-[7px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                            {tr("Pending", "തീർപ്പില്ലാത്തവ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Full Subpage View for Selected Scheme (Attachment 2 UI) */}
          {selectedAssistedScheme && (
            <div className="absolute inset-0 z-[120] flex flex-col bg-white dark:bg-slate-950 animate-in fade-in duration-200">
              {/* Header */}
              <header className="sticky top-0 z-30 bg-[#FFFDF9] dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 px-3.5 py-1.5 shadow-2xs">
                <div className="relative flex h-9 items-center justify-between w-full">
                  <button
                    type="button"
                    onClick={() => setSelectedAssistedScheme(null)}
                    className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-[#FFF7EC] text-[#1b255a] hover:bg-orange-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer transition-colors border border-orange-100/80 dark:border-slate-700 shadow-2xs z-10"
                    aria-label={tr("Back", "മടങ്ങുക")}
                  >
                    <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
                  </button>
                  <h2 className="absolute inset-y-0 left-10 right-12 flex items-center justify-center text-center text-[12.5px] font-extrabold text-[#0F172A] dark:text-white pointer-events-none truncate leading-tight">
                    {lang === "ml" ? selectedAssistedScheme.titleMl : selectedAssistedScheme.titleEn}
                  </h2>
                  <button
                    type="button"
                    className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-white text-[#1b255a] hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer transition-colors border border-slate-200/80 dark:border-slate-700 shadow-2xs"
                  >
                    <MoreVertical className="h-3.5 w-3.5 stroke-[2.2] text-slate-700 dark:text-slate-200" />
                  </button>
                </div>
              </header>

              {/* Subheader: My View • October 2026 */}
              <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-3.5 py-1.5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setAssistedFilterOpen(true)}
                  className="font-display text-[11px] sm:text-[13px] font-extrabold text-[#ff5500] hover:text-[#e04b00] tracking-tight leading-none shrink-0 cursor-pointer text-left transition-colors"
                  title={tr("Show Filter Popup", "ഫിൽട്ടർ കാണിക്കുക")}
                >
                  {tr("My View", "എന്റെ കാഴ്ച")}
                </button>
                <span className="font-display text-[10px] sm:text-[11px] font-semibold text-[#0a0f1d] dark:text-white tracking-tight leading-none text-center truncate min-w-0 flex-1 px-1">
                  October 2026
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600">
                    <ChevronLeft className="h-3 w-3 stroke-[2.5]" />
                  </button>
                  <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600">
                    <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                  </button>
                  <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500]">
                    <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
                  </button>
                  <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500]">
                    <Search className="h-3 w-3 stroke-[2.2]" />
                  </button>
                  <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500]">
                    <Filter className="h-3 w-3 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Body: 5-KPI Segmented Pill & Applicant Cards List */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {/* 5-KPI Segmented Pill Container: Applications, Approved, Rejected, In Review, Pending */}
                <div className="flex items-stretch rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 overflow-hidden divide-x divide-[#E2E8F0] dark:divide-slate-800 shadow-2xs py-1">
                  <div className="flex-1 py-1 px-0.5 flex flex-col items-center justify-center text-center">
                    <span className="text-[12px] font-black text-[#1B255A] dark:text-blue-300 leading-none">{selectedAssistedScheme.total}</span>
                    <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">{tr("Applications", "അപേക്ഷകൾ")}</span>
                  </div>
                  <div className="flex-1 py-1 px-0.5 flex flex-col items-center justify-center text-center">
                    <span className="text-[12px] font-black text-[#00875A] dark:text-emerald-400 leading-none">{selectedAssistedScheme.approved}</span>
                    <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">{tr("Beneficiary", "അംഗീകരിച്ചു")}</span>
                  </div>
                  <div className="flex-1 py-1 px-0.5 flex flex-col items-center justify-center text-center">
                    <span className="text-[12px] font-black text-[#DC2626] dark:text-rose-400 leading-none">{selectedAssistedScheme.rejected}</span>
                    <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">{tr("Rejected", "നിരസിച്ചു")}</span>
                  </div>
                  <div className="flex-1 py-1 px-0.5 flex flex-col items-center justify-center text-center">
                    <span className="text-[12px] font-black text-[#2563EB] dark:text-blue-400 leading-none">{selectedAssistedScheme.inReview}</span>
                    <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">{tr("In Review", "പരിശോധനയിൽ")}</span>
                  </div>
                  <div className="flex-1 py-1 px-0.5 flex flex-col items-center justify-center text-center">
                    <span className="text-[12px] font-black text-[#EA580C] dark:text-amber-400 leading-none">{selectedAssistedScheme.pending}</span>
                    <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">{tr("Pending", "തീർപ്പില്ലാത്തവ")}</span>
                  </div>
                </div>

                {/* Applicant Cards List */}
                <div className="space-y-2.5">
                  {[
                    {
                      id: "app-r1",
                      initials: "RA",
                      nameEn: "Ravi Kumar",
                      nameMl: "രവി കുമാർ",
                      locationEn: "Ollur, Thrissur",
                      locationMl: "ഒല്ലൂർ, തൃശൂർ",
                      statusLabelEn: "Documents Verified",
                      statusLabelMl: "രേഖകൾ പരിശോധിച്ചു",
                      badgeStyle: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
                      icon: FileCheck,
                      refId: "PMSV-2026-9281",
                      status: "in_review",
                    },
                    {
                      id: "app-s1",
                      initials: "SU",
                      nameEn: "Sunitha Kumari",
                      nameMl: "സുനിത കുമാരി",
                      locationEn: "Kottayam East, Kottayam",
                      locationMl: "കോട്ടയം ഈസ്റ്റ്, കോട്ടയം",
                      statusLabelEn: "In Review",
                      statusLabelMl: "പരിശോധനയിൽ",
                      badgeStyle: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                      icon: Hourglass,
                      refId: "PMSV-2026-9282",
                      status: "in_review",
                    },
                    {
                      id: "app-d1",
                      initials: "DE",
                      nameEn: "Deepa Lakshmi",
                      nameMl: "ദീപ ലക്ഷ്മി",
                      locationEn: "Nedumangad, Thiruvananthapuram",
                      locationMl: "നെടുമങ്ങാട്, തിരുവനന്തപുരം",
                      statusLabelEn: "Received",
                      statusLabelMl: "ലഭിച്ചു",
                      badgeStyle: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
                      icon: Inbox,
                      refId: "PMSV-2026-9283",
                      status: "pending",
                    },
                  ].map((app) => {
                    const BadgeIcon = app.icon;
                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          if (onSelectApplication) {
                            onSelectApplication({
                              refId: app.refId,
                              titleEn: selectedAssistedScheme.titleEn,
                              titleMl: selectedAssistedScheme.titleMl,
                              categoryEn: selectedAssistedScheme.categoryEn,
                              categoryMl: selectedAssistedScheme.categoryMl,
                              status: app.status,
                              applicantName: lang === "ml" ? app.nameMl : app.nameEn,
                              applicantLocation: lang === "ml" ? app.locationMl : app.locationEn,
                              date: "23 Oct 2026",
                            });
                          }
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-amber-100/80 dark:bg-amber-900/40 border border-amber-200/60 dark:border-amber-700/60 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-xs">
                            {app.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-[12.5px] text-[#0f172a] dark:text-white leading-tight truncate">
                              {lang === "ml" ? app.nameMl : app.nameEn}
                            </h4>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {lang === "ml" ? app.locationMl : app.locationEn}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1 ${app.badgeStyle}`}>
                            <BadgeIcon className="h-3 w-3 stroke-[2.2]" />
                            {lang === "ml" ? app.statusLabelMl : app.statusLabelEn}
                          </span>
                          <button type="button" className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderAccessSheet = () => {
    if (!isAccessSheetOpen) return null;
    const needsDistrict =
      sheetScope === "constituencies" ||
      sheetScope === "local_bodies" ||
      sheetScope === "wards" ||
      sheetScope === "booths";
    const needsLocalBodyType = sheetScope === "local_bodies" || sheetScope === "wards";
    const needsLocalBody = sheetScope === "wards";
    const needsConstituency =
      sheetScope === "booths" || sheetScope === "local_bodies" || sheetScope === "wards";
    const selectedDistricts = districts.filter((item) =>
      sheetFilters.districtIds?.includes(item.id),
    );
    const selectedConstituencies = constituencies.filter((item) =>
      sheetFilters.constituencyIds?.includes(item.id),
    );
    const selectedLocalBodies = panchayats.filter((item) =>
      sheetFilters.localBodyIds?.includes(item.id),
    );
    const selectedTypes = localBodyTypeOptions.filter((item) =>
      sheetFilters.localBodyTypes?.includes(item.id),
    );
    const matchingLocalBodies = getFilteredLocalBodies(sheetFilters);
    const showingAllLocalBodies = !sheetFilters.localBodyIds?.length;
    const selectedLabel = (items: { en: string; ml: string }[], allLabel: string) => {
      if (items.length === 0) return allLabel;
      if (items.length === 1) return lang === "ml" ? items[0].ml : items[0].en;
      return `${items.length} ${tr("selected", "തിരഞ്ഞെടുത്തു")}`;
    };
    return (
      <div
        className="absolute inset-0 z-[100] flex items-end bg-black/60 animate-in fade-in duration-150"
        onClick={() => setIsAccessSheetOpen(false)}
      >
        <div
          className="flex max-h-[92%] w-full flex-col rounded-t-2xl border-t border-orange-100 bg-white shadow-2xl animate-in slide-in-from-bottom duration-200 dark:border-slate-800 dark:bg-slate-900"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 border-b border-slate-100 px-4 pb-2.5 pt-2.5 dark:border-slate-800">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[13px] font-extrabold leading-tight text-slate-900 dark:text-white">
                  {editingGrantId
                    ? tr("Edit access area", "ആക്സസ് പ്രദേശം തിരുത്തുക")
                    : tr("Add access area", "ആക്സസ് പ്രദേശം ചേർക്കുക")}
                </h3>
                <p className="mt-0.5 text-[9.5px] font-semibold leading-snug text-slate-500 dark:text-slate-400">
                  {tr(
                    "Choose the organisation level and areas where this worker's permissions apply.",
                    "ഈ പ്രവർത്തകന്റെ അനുമതികൾ ബാധകമാകുന്ന ഓർഗനൈസേഷൻ ലെവലും പ്രദേശങ്ങളും തിരഞ്ഞെടുക്കുക.",
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAccessSheetOpen(false)}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3.5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-2">
              <div className="min-w-0">
                <p className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  1 · {tr("Organisation Level", "ഓർഗനൈസേഷൻ ലെവൽ")}
                </p>
                {scopeTypeChoices.length === 0 ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-[9px] font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                    {tr(
                      "You are not authorised to delegate an access scope.",
                      "ആക്സസ് സ്കോപ്പ് നൽകാൻ നിങ്ങൾക്ക് അനുമതിയില്ല.",
                    )}
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      value={sheetScope}
                      onChange={(event) => handleScopeChange(event.target.value as ScopeType)}
                      className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-8 text-[12px] font-medium text-slate-900 outline-none focus:border-[#ff5500] focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      {scopeTypeChoices.map((option) => (
                        <option key={option.id} value={option.id}>
                          {lang === "ml" ? option.ml : option.en}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {tr("Role", "റോൾ")}
                </p>
                <div className="relative">
                  <select
                    value={sheetAppRoleId}
                    onChange={(event) => setSheetAppRoleId(event.target.value)}
                    className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-8 text-[12px] font-medium text-slate-900 outline-none focus:border-[#ff5500] focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {roleChoices.map((role) => (
                      <option key={role.id} value={role.id}>
                        {lang === "ml" ? role.ml : role.en}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {needsDistrict || needsLocalBodyType || needsLocalBody || needsConstituency ? (
              <div>
                <p className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  2 · {tr("Area Selection", "പ്രദേശ തിരഞ്ഞെടുപ്പ്")}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {needsDistrict ? (
                    <FilterButton
                      label={tr("District", "ജില്ല")}
                      value={selectedLabel(
                        selectedDistricts,
                        tr("All districts", "എല്ലാ ജില്ലകളും"),
                      )}
                      onClick={() => openPicker("filter_district")}
                    />
                  ) : null}
                  {needsConstituency ? (
                    <FilterButton
                      label={tr("Constituency", "മണ്ഡലം")}
                      value={selectedLabel(
                        selectedConstituencies,
                        tr("All constituencies", "എല്ലാ മണ്ഡലങ്ങളും"),
                      )}
                      onClick={() => openPicker("filter_constituency")}
                    />
                  ) : null}
                  {needsLocalBodyType ? (
                    <FilterButton
                      label={tr("Local body type", "തദ്ദേശ സ്ഥാപന തരം")}
                      value={selectedLabel(selectedTypes, tr("All types", "എല്ലാ തരങ്ങളും"))}
                      onClick={() => openPicker("filter_local_body_type")}
                    />
                  ) : null}
                  {needsLocalBody ? (
                    <FilterButton
                      label={tr("Local body", "തദ്ദേശ സ്ഥാപനം")}
                      value={selectedLabel(
                        selectedLocalBodies,
                        matchingLocalBodies.length === 0
                          ? tr("No matching local bodies", "പൊരുത്തമുള്ള തദ്ദേശ സ്ഥാപനങ്ങളില്ല")
                          : tr(
                              `All matching (${matchingLocalBodies.length})`,
                              `എല്ലാ പൊരുത്തവും (${matchingLocalBodies.length})`,
                            ),
                      )}
                      onClick={() => openPicker("filter_local_body")}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            <div>
              <p className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {needsDistrict || needsLocalBodyType || needsLocalBody || needsConstituency
                  ? "3"
                  : "2"}{" "}
                · {tr("Areas", "പ്രദേശങ്ങൾ")}
              </p>

              {needsLocalBody && showingAllLocalBodies && matchingLocalBodies.length > 1 ? (
                <p className="mb-1.5 rounded-lg border border-orange-100 bg-orange-50/70 px-2.5 py-1.5 text-[9px] font-semibold leading-snug text-[#9A3412] dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-300">
                  {tr(
                    `Wards from all ${matchingLocalBodies.length} matching local bodies are shown. Tick each ward you want to grant.`,
                    `പൊരുത്തപ്പെടുന്ന ${matchingLocalBodies.length} തദ്ദേശ സ്ഥാപനങ്ങളിലെ വാർഡുകളും കാണിക്കുന്നു. നൽകേണ്ട ഓരോ വാർഡും ടിക്ക് ചെയ്യുക.`,
                  )}
                </p>
              ) : null}

              {sheetScope === "all_kerala" ? (
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 p-2.5 dark:border-orange-900/60 dark:bg-orange-950/30">
                  <input
                    type="checkbox"
                    checked={Boolean(sheetAreaOptions[0] && sheetAreas[sheetAreaOptions[0].id])}
                    onChange={() => {
                      const kerala = sheetAreaOptions[0];
                      if (!kerala) return;
                      setSheetAreas((prev) => (prev[kerala.id] ? {} : { [kerala.id]: kerala }));
                      setSheetError("");
                    }}
                    className="h-3.5 w-3.5 shrink-0 rounded-[3px] accent-[#ff5500]"
                  />
                  <Landmark className="h-4 w-4 shrink-0 text-[#C2410C] dark:text-orange-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-extrabold text-slate-800 dark:text-slate-100">
                      {tr("All Kerala", "കേരളം മുഴുവൻ")}
                    </span>
                    <span className="mt-0.5 block text-[9px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                      {tr(
                        "Tick to grant statewide access.",
                        "സംസ്ഥാന വ്യാപക ആക്സസ് നൽകാൻ ടിക്ക് ചെയ്യുക.",
                      )}
                    </span>
                  </span>
                </label>
              ) : sheetAreaOptions.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-4 text-center text-[9.5px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                  {tr(
                    "No configured areas match these filters.",
                    "ഈ ഫിൽട്ടറുകൾക്ക് യോജിക്കുന്ന പ്രദേശങ്ങളില്ല.",
                  )}
                </p>
              ) : (
                <>
                  {selectedSheetAreas.length > 0 ? (
                    <div className="mb-1.5 flex flex-wrap gap-1">
                      {selectedSheetAreas.map((area) => (
                        <span
                          key={area.id}
                          className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[8.5px] font-bold text-[#C2410C] dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300"
                        >
                          {lang === "ml" ? area.shortMl : area.shortEn}
                          <button
                            type="button"
                            onClick={() =>
                              setSheetAreas((prev) => {
                                const next = { ...prev };
                                delete next[area.id];
                                return next;
                              })
                            }
                            aria-label={tr("Remove area", "പ്രദേശം നീക്കുക")}
                            className="rounded-sm text-[#C2410C] transition hover:text-[#9A3412] dark:text-orange-300"
                          >
                            <X className="h-2.5 w-2.5 stroke-[2.6]" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {sheetAreaOptions.length > 5 ? (
                    <div className="mb-1.5 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-[#ff5500] focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:ring-orange-950/50">
                      <Search className="h-3 w-3 shrink-0 text-slate-400" />
                      <input
                        value={sheetSearch}
                        onChange={(event) => setSheetSearch(event.target.value)}
                        placeholder={tr("Search areas...", "പ്രദേശങ്ങൾ തിരയുക...")}
                        className="w-full bg-transparent text-[10px] font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 dark:text-slate-100"
                      />
                    </div>
                  ) : null}

                  <div className="max-h-[168px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-700 dark:bg-slate-900 [scrollbar-width:thin]">
                    {filteredSheetAreas.length === 0 ? (
                      <p className="px-3 py-4 text-center text-[9.5px] font-semibold text-slate-500">
                        {tr("No matching areas.", "പൊരുത്തപ്പെടുന്ന പ്രദേശങ്ങളില്ല.")}
                      </p>
                    ) : (
                      filteredSheetAreas.map((area) => {
                        const checked = Boolean(sheetAreas[area.id]);
                        return (
                          <label
                            key={area.id}
                            className="flex cursor-pointer items-start gap-2 border-b border-slate-100 px-2.5 py-2 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setSheetAreas((prev) => {
                                  const next = { ...prev };
                                  if (next[area.id]) delete next[area.id];
                                  else next[area.id] = area;
                                  return next;
                                })
                              }
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-[3px] accent-[#ff5500]"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[10px] font-semibold leading-tight text-slate-700 dark:text-slate-100">
                                {lang === "ml" ? area.ml : area.en}
                              </span>
                              {area.parentEn ? (
                                <span className="mt-0.5 block truncate text-[8.5px] font-medium text-slate-400 dark:text-slate-500">
                                  {lang === "ml" ? area.parentMl : area.parentEn}
                                </span>
                              ) : null}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white px-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-2 pb-2.5">
              <div className="rounded-xl border border-orange-200/80 bg-[#FFF7EC] p-2.5 dark:border-orange-900/60 dark:bg-orange-950/30">
                <p className="text-[8px] font-black uppercase tracking-wider text-[#C2410C] dark:text-orange-300">
                  {tr("Access summary", "ആക്സസ് സംഗ്രഹം")}
                </p>
                <p className="mt-0.5 text-[9.5px] font-semibold leading-snug text-slate-700 dark:text-slate-200">
                  {selectedSheetAreas.length
                    ? describeAccessGrant(sheetGrantPreview, lang)
                    : tr(
                        "Select a scope and at least one area to see the summary.",
                        "സംഗ്രഹം കാണാൻ ഒരു സ്കോപ്പും കുറഞ്ഞത് ഒരു പ്രദേശവും തിരഞ്ഞെടുക്കുക.",
                      )}
                </p>
              </div>
              {sheetError ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-[9px] font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                  {sheetError}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAccessSheetOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[11px] font-extrabold text-slate-700 transition active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {tr("Cancel", "റദ്ദാക്കുക")}
              </button>
              <button
                type="button"
                onClick={handleSaveAccessArea}
                className="flex-[1.4] rounded-xl bg-gradient-to-r from-[#ff5500] to-[#e64a00] py-2.5 text-[11px] font-extrabold text-white shadow-[0_6px_14px_-6px_rgba(255,85,0,0.75)] transition active:scale-[0.98]"
              >
                {editingGrantId
                  ? tr("Save Area", "പ്രദേശം സൂക്ഷിക്കുക")
                  : tr("Add Area", "പ്രദേശം ചേർക്കുക")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`absolute inset-0 z-[90] flex flex-col overflow-hidden ${phase === "profile" || phase === "list" ? "bg-white dark:bg-slate-900" : "bg-[#FFFDF9] dark:bg-slate-900"}`}>
      <div className={`shrink-0 border-b px-3 dark:border-slate-800 ${phase === "profile" || phase === "list" ? "border-slate-100 bg-white dark:bg-slate-900" : "border-orange-100 bg-[#FFFDF9] dark:bg-slate-900"}`}>
        {phase === "list" && workerSearchOpen ? (
          <div className="flex h-9 items-center justify-between gap-2 w-full animate-in fade-in duration-150">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={workerSearch}
                onChange={(event) => setWorkerSearch(event.target.value)}
                placeholder={tr(
                  "Search by name, designation or area...",
                  "പേര്, പദവി അല്ലെങ്കിൽ പ്രദേശം തിരയുക...",
                )}
                className="w-full h-7 pl-8 pr-7 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-full border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              {workerSearch ? (
                <button
                  type="button"
                  onClick={() => setWorkerSearch("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={tr("Clear search", "തിരയൽ മായ്ക്കുക")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                setWorkerSearchOpen(false);
                setWorkerSearch("");
              }}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 shrink-0 px-1 cursor-pointer"
            >
              {tr("Cancel", "റദ്ദാക്കുക")}
            </button>
          </div>
        ) : (
          <div className="relative flex h-9 items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                if (phase === "profile") {
                  setProfileMenuOpen(false);
                  if (initialTeamMember) onClose();
                  else setPhase("list");
                } else if (phase === "list") onClose();
                else if (editingWorkerId && profile) {
                  setEditingWorkerId(null);
                  setPhase("profile");
                } else if (step === 2) setStep(1);
                else onClose();
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFF7EC] text-[#1B255A] shadow-2xs transition-colors hover:bg-orange-100 dark:bg-slate-800 dark:text-white"
              title={tr("Go back", "തിരികെ പോവുക")}
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>
            <div className="pointer-events-none absolute inset-x-10 top-1/2 -translate-y-1/2 text-center">
              <h1 className="truncate text-[13.5px] font-extrabold text-[#0F172A] dark:text-white">
                {phase === "profile"
                  ? tr("User Profile", "ഉപയോക്തൃ പ്രൊഫൈൽ")
                  : phase === "list"
                    ? tr(
                        `User list (${getVisibleWorkers().length})`,
                        `ഉപയോക്തൃ ലിസ്റ്റ് (${getVisibleWorkers().length})`,
                      )
                    : editingWorkerId
                      ? tr("Edit User", "ഉപയോക്താവിനെ തിരുത്തുക")
                      : tr("Create User", "ഉപയോക്താവിനെ ചേർക്കുക")}
              </h1>
            </div>
            {phase === "list" ? (
              <div className="relative z-20 flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (workerSearchOpen) setWorkerSearch("");
                    setWorkerSearchOpen((prev) => !prev);
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors active:scale-95 shadow-2xs ${
                    workerSearchOpen
                      ? "bg-[#ff5500] text-white border-orange-600"
                      : "bg-white text-[#ff5500] border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-orange-400 dark:border-slate-700"
                  }`}
                  aria-label={tr("Search users", "ഉപയോക്താക്കളെ തിരയുക")}
                  aria-expanded={workerSearchOpen}
                >
                  <Search className={`h-3.5 w-3.5 stroke-[2.2] ${workerSearchOpen ? "text-white" : "text-[#ff5500] dark:text-orange-400"}`} />
                </button>
                <button
                  type="button"
                  onClick={() => { setDraftWorkerSort(workerSortOption); setWorkerSortSheetOpen(true); }}
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-colors active:scale-95 shadow-2xs ${
                    workerSortOption !== "name_asc"
                      ? "bg-[#ff5500] text-white border-orange-600"
                      : "bg-white text-[#ff5500] border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-orange-400 dark:border-slate-700"
                  }`}
                  aria-label={tr("Sort users", "ഉപയോക്താക്കളെ ക്രമീകരിക്കുക")}
                >
                  <ArrowUpDown className={`h-3.5 w-3.5 stroke-[2.2] ${workerSortOption !== "name_asc" ? "text-white" : "text-[#ff5500] dark:text-orange-400"}`} />
                </button>
                <button
                  type="button"
                  onClick={openWorkerFilters}
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-colors active:scale-95 shadow-2xs ${
                    appliedWorkerFilterCount > 0
                      ? "bg-[#ff5500] text-white border-orange-600"
                      : "bg-white text-[#ff5500] border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-orange-400 dark:border-slate-700"
                  }`}
                  aria-label={
                    appliedWorkerFilterCount > 0
                      ? tr(
                          `Filter users, ${appliedWorkerFilterCount} applied`,
                          `ഉപയോക്താക്കളെ ഫിൽട്ടർ ചെയ്യുക, ${appliedWorkerFilterCount} പ്രയോഗിച്ചു`,
                        )
                      : tr("Filter users", "ഉപയോക്താക്കളെ ഫിൽട്ടർ ചെയ്യുക")
                  }
                >
                  <Filter className={`h-3.5 w-3.5 stroke-[2.2] ${appliedWorkerFilterCount > 0 ? "text-white" : "text-[#ff5500] dark:text-orange-400"}`} />
                  {appliedWorkerFilterCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#ff5500] px-1 text-[8px] font-black leading-none text-white ring-1.5 ring-white dark:ring-slate-900">
                      {appliedWorkerFilterCount}
                    </span>
                  ) : null}
                </button>
              </div>
            ) : phase === "profile" ? (
              <div ref={profileMenuRef} className="relative z-20 shrink-0">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#1B255A] transition-colors hover:bg-orange-50 active:scale-95 dark:text-white dark:hover:bg-slate-800"
                  aria-label={tr("User actions", "ഉപയോക്തൃ ആക്ഷനുകൾ")}
                  aria-expanded={profileMenuOpen}
                >
                  <MoreVertical className="h-4 w-4 stroke-[2.3]" />
                </button>
                {profileMenuOpen ? (
                  <div className="absolute right-0 top-9 w-48 overflow-hidden rounded-xl border border-orange-100 bg-white p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150 dark:border-slate-700 dark:bg-slate-900">
                    <a
                      href={`tel:${profile?.mobile || ""}`}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10.5px] font-bold text-slate-700 transition hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <PhoneCall className="h-3.5 w-3.5 shrink-0 text-[#C2410C] dark:text-orange-300" />
                      {tr(
                        `Call (+91 ${profile?.mobile || ""})`,
                        `ഫോണിൽ ബന്ധപ്പെടുക (+91 ${profile?.mobile || ""})`
                      )}
                    </a>
                  </div>
                ) : null}
              </div>
            ) : (
              <span className="shrink-0 rounded-full border border-orange-200/80 bg-[#FFF2E6] px-2 py-0.5 text-[10px] font-extrabold text-[#C2410C] shadow-2xs dark:border-orange-800/80 dark:bg-orange-950/80 dark:text-orange-300">
                {tr(`Step ${step} of 2`, `ഘട്ടം ${step} / 2`)}
              </span>
            )}
          </div>
        )}
      </div>

      {phase === "list" && appliedWorkerFilterCount > 0 && <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-slate-200/70 bg-[#FAF7F2]/90 px-2.5 py-1.5 whitespace-nowrap dark:border-slate-800 dark:bg-slate-900/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{(Object.keys(defaultWorkerListFilters) as (keyof WorkerListFilters)[]).filter(key => appliedWorkerFilters[key] !== defaultWorkerListFilters[key] && appliedWorkerFilters[key]).map(key => {
        const value = String(appliedWorkerFilters[key]);
        const location = ["regionId", "districtId", "constituencyId", "localBodyType", "localBodyId", "wardId", "boothId", "orgUnitId"].includes(key);
        const label = key === "level" ? assignmentLevels.find(item => item.id === value)?.[lang] : key === "designationId" ? allDesignationChoices.find(item => item.id === value)?.[lang] : key === "regionId" ? regions.find(item => item.id === value)?.[lang] : key === "districtId" ? (districts.find(item => item.id === value) || organisationalDistricts.find(item => item.id === value))?.[lang] : key === "constituencyId" ? constituencies.find(item => item.id === value)?.[lang] : key === "localBodyType" ? localBodyTypeOptions.find(item => item.id === value)?.[lang] : key === "localBodyId" ? panchayats.find(item => item.id === value)?.[lang] : key === "appRole" ? rolePresets.find(item => item.id === value)?.[lang] : key === "appStatus" ? getWorkerAppStatusLabel(value, lang) : key === "schemeId" ? getWorkerSchemeLabel(value, lang) : undefined;
        return <span key={key} className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold shadow-2xs ${location ? "border-orange-200/90 bg-orange-50 text-orange-800 dark:border-orange-800/60 dark:bg-orange-950/40 dark:text-orange-300" : "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>{location && <MapPin className="h-2.5 w-2.5 text-orange-500" />}<span>{label || value.replace(/[_-]/g, " ")}</span><button type="button" aria-label={`Remove ${key}`} onClick={() => setAppliedWorkerFilters(prev => ({ ...prev, [key]: defaultWorkerListFilters[key] }))} className="ml-0.5 -mr-0.5 rounded-full p-0.5"><X className="h-2.5 w-2.5 stroke-[2.5]" /></button></span>;
      })}<button type="button" onClick={() => { setAppliedWorkerFilters({ ...defaultWorkerListFilters }); setDraftWorkerFilters({ ...defaultWorkerListFilters }); }} className="shrink-0 text-[10px] font-bold text-orange-600">{tr("Clear All", "എല്ലാം ഒഴിവാക്കുക")}</button></div>}
      <div
        ref={bodyRef}
        className={`flex-1 overflow-y-auto px-3.5 py-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          phase === "list" ? "bg-white dark:bg-slate-900" : ""
        }`}
      >
        {phase === "form"
          ? step === 1
            ? renderStep1()
            : renderStep2()
          : phase === "profile"
            ? renderProfile()
            : renderWorkerList()}
      </div>

      {phase === "form" ? (
        <div className="shrink-0 border-t border-orange-100 bg-[#FFFDF9] px-3.5 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
          {step === 1 ? (
            <button
              type="button"
              onClick={handleContinue}
              className="h-10 w-full rounded-lg bg-gradient-to-r from-[#ff5500] to-[#e64a00] text-[12px] font-extrabold text-white shadow-md transition-all active:scale-[0.99]"
            >
              {tr("Continue", "തുടരുക")}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-10 flex-1 rounded-lg border border-orange-200/80 bg-white text-[11.5px] font-extrabold text-[#1E293B] active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {tr("Back", "തിരികെ")}
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="h-10 flex-[1.4] rounded-lg bg-gradient-to-r from-[#ff5500] to-[#e64a00] text-[11.5px] font-extrabold text-white shadow-md active:scale-[0.99]"
              >
                {editingWorkerId
                  ? tr("Update User", "ഉപയോക്തൃ വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്യുക")
                  : tr("Create User", "ഉപയോക്താവിനെ ചേർക്കുക")}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {renderPicker()}
      {renderAccessSheet()}
      {renderWorkerFilters()}
      {renderWorkerSortSheet()}

      {/* Application Details View Screen Overlay (Matching image media_1795239859823_d55f80fb.png) */}
      {selectedAssistedApp && (
        <div
          className="absolute inset-0 z-[200] flex flex-col bg-[#F8FAFC] dark:bg-slate-900 animate-in fade-in duration-150 overflow-y-auto min-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-3 dark:border-slate-800 dark:bg-slate-900/95">
            <button
              type="button"
              onClick={() => setSelectedAssistedApp(null)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Back"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
            </button>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {tr("Application Details", "അപേക്ഷയുടെ വിവരങ്ങൾ")}
            </h2>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Application Details Content */}
          <div className="p-4 space-y-3.5 max-w-md mx-auto w-full pb-12">
            {/* 1. Applicant Header Card */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100/90 text-xs font-black text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                {selectedAssistedApp.applicantName
                  ? selectedAssistedApp.applicantName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "KK"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {selectedAssistedApp.applicantName}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {selectedAssistedApp.applicantLocation || "Palakkad North, Palakkad"}
                </p>
              </div>
            </div>

            {/* 2. Scheme & Ministry Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-extrabold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <Sprout className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  {lang === "ml" ? selectedAssistedApp.categoryMl || "കൃഷി" : selectedAssistedApp.categoryEn || "Agriculture"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-extrabold ${
                    selectedAssistedApp.status === "approved"
                      ? "border-emerald-200 bg-emerald-50/90 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {selectedAssistedApp.status === "approved" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Inbox className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  )}
                  {lang === "ml" ? selectedAssistedApp.statusLabelMl : selectedAssistedApp.statusLabelEn}
                </span>
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                  {lang === "ml" ? selectedAssistedApp.titleMl : selectedAssistedApp.titleEn}
                </h2>
                <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-400 leading-snug">
                  {lang === "ml" ? selectedAssistedApp.ministryMl : selectedAssistedApp.ministryEn}
                </p>
              </div>
            </div>

            {/* 3. Tracking ID Card */}
            <div className="rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">
                {tr("Tracking ID", "ട്രാക്കിംഗ് ഐഡി")}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 dark:text-white tracking-wide">
                  {selectedAssistedApp.refId}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(selectedAssistedApp.refId);
                    }
                    setCopiedTrackingId(true);
                    setTimeout(() => setCopiedTrackingId(false), 2000);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                  title="Copy Tracking ID"
                >
                  {copiedTrackingId ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 4. Details List Rows */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {/* Applicant information */}
              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <User className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    {tr("Applicant information", "അപേക്ഷകന്റെ വിവരങ്ങൾ")}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              {/* Collected Details & Files */}
              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                  <div>
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {tr("Collected Details & Files", "ശേഖരിച്ച വിവരങ്ങളും ഫയലുകളും")}
                    </span>
                    <span className="block text-[10px] font-medium text-slate-400">
                      {tr("3 files uploaded", "3 ഫയലുകൾ അപ്‌ലോഡ് ചെയ്തു")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Other Scheme Applications */}
              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <Layers className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                  <div>
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {tr("Other Scheme Applications", "മറ്റ് പദ്ധതി അപേക്ഷകൾ")}
                    </span>
                    <span className="block text-[10px] font-medium text-slate-400">
                      {tr("4 more applications", "4 അപേക്ഷകൾ കൂടി")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100/90 text-[10px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    4
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Assisted by */}
              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400">
                      {tr("Assisted by", "സഹായിച്ചത്")}{" "}
                      <span className="font-normal">(Last updated 23 Oct 2026)</span>
                    </span>
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                      Anil Thomas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Quick Action Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* How to Apply */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-1 hover:border-orange-200 transition cursor-pointer">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 mb-2">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {tr("How to Apply", "എങ്ങനെ അപേക്ഷിക്കാം")}
                </h4>
                <p className="text-[10px] font-medium text-slate-400">
                  {tr("Step-by-step process", "ഘട്ടം ഘട്ടമായുള്ള പ്രക്രിയ")}
                </p>
              </div>

              {/* Required Details */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-1 hover:border-orange-200 transition cursor-pointer">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 mb-2">
                  <FileText className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {tr("Required Details", "ആവശ്യമായ വിവരങ്ങൾ")}
                </h4>
                <p className="text-[10px] font-medium text-slate-400">
                  {tr("Details and files", "വിവരങ്ങളും ഫയലുകളും")}
                </p>
              </div>
            </div>

            {/* 6. Contact Support Banner */}
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                  <PhoneCall className="h-4.5 w-4.5" />
                </div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight max-w-[150px]">
                  {tr("Need help with this application?", "ഈ അപേക്ഷയിൽ സഹായം വേണമെന്നുണ്ടോ?")}
                </p>
              </div>
              <a
                href={`tel:${selectedAssistedApp.applicantPhone || "1800123456"}`}
                className="inline-flex items-center gap-0.5 text-xs font-extrabold text-amber-700 hover:underline dark:text-amber-400 shrink-0"
              >
                <span>{tr("Contact support", "സപ്പോർട്ടുമായി ബന്ധപ്പെടുക")}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-900 outline-none focus:ring-1 focus:ring-[#ff5500] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-0.5 block text-[11px] font-bold text-slate-800 dark:text-slate-200">
        {label}
        {required ? <span className="text-[#ff5500]"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[9px] font-bold text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[9px] font-medium leading-snug text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function PickerButton({
  label,
  hideLabel,
  required,
  value,
  placeholder,
  hint,
  error,
  onClick,
  disabled,
}: {
  label: string;
  hideLabel?: boolean;
  required?: boolean;
  value: string;
  placeholder: string;
  hint?: string;
  error?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div>
      {hideLabel ? null : (
        <label className="mb-0.5 block text-[11px] font-bold text-slate-800 dark:text-slate-200">
          {label}
          {required ? <span className="text-[#ff5500]"> *</span> : null}
        </label>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={hideLabel ? label : undefined}
        className={`flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-white px-2.5 text-left outline-none focus:ring-1 focus:ring-[#ff5500] disabled:cursor-not-allowed disabled:opacity-55 dark:bg-slate-800 ${
          error ? "border-rose-300 dark:border-rose-800" : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <span
          className={`min-w-0 flex-1 truncate text-[12px] font-medium ${
            value ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>
      {hint ? (
        <p className="mt-0.5 text-[9px] font-medium leading-snug text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 text-[9px] font-bold text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}
    </div>
  );
}

function FilterButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-left dark:border-slate-700 dark:bg-slate-900"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[7.5px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[9.5px] font-bold text-slate-700 dark:text-slate-100">
          {value}
        </span>
      </span>
    </button>
  );
}

interface GrantAreaGroup {
  key: string;
  district?: string;
  constituency?: string;
  localBody?: string;
  areas: string[];
}

function groupGrantAreas(grant: AccessGrant, lang: Lang): GrantAreaGroup[] {
  const pick = (en: string | undefined, ml: string | undefined) =>
    lang === "ml" ? ml || en || "" : en || ml || "";
  const groups = new Map<string, GrantAreaGroup>();
  const add = (
    key: string,
    paths: Pick<GrantAreaGroup, "district" | "constituency" | "localBody">,
    area: AreaRef,
  ) => {
    const group = groups.get(key) || { key, ...paths, areas: [] };
    if (paths.district && !group.district) group.district = paths.district;
    if (paths.constituency && !group.constituency) group.constituency = paths.constituency;
    if (paths.localBody && !group.localBody) group.localBody = paths.localBody;
    group.areas.push(pick(area.shortEn, area.shortMl));
    groups.set(key, group);
  };

  grant.areas.forEach((area) => {
    if (grant.scopeType === "regions") {
      add("regions", {}, area);
      return;
    }
    if (grant.scopeType === "districts") {
      add("districts", {}, area);
      return;
    }
    if (grant.scopeType === "constituencies") {
      const constituency =
        constituencies.find((item) => item.id === area.id) ||
        constituencies.find((item) => item.en === area.en || item.ml === area.ml);
      const district = districts.find((item) => item.id === constituency?.districtId);
      add(
        district?.id || area.id,
        {
          district: pick(district?.en, district?.ml),
        },
        area,
      );
      return;
    }
    if (grant.scopeType === "local_bodies") {
      const localBody =
        panchayats.find((item) => item.id === area.id) ||
        panchayats.find((item) => item.en === area.en || item.ml === area.ml);
      const district = districts.find((item) => item.id === localBody?.districtId);
      const constituency = constituencies.find((item) => item.id === localBody?.constituencyId);
      add(
        constituency?.id || district?.id || area.id,
        {
          district: pick(district?.en, district?.ml),
          constituency: pick(constituency?.en, constituency?.ml),
        },
        area,
      );
      return;
    }
    if (grant.scopeType === "wards") {
      const localBody =
        panchayats.find((item) => area.id.startsWith(`${item.id}-ward-`)) ||
        panchayats.find((item) => item.en === area.parentEn || item.ml === area.parentMl);
      const district = districts.find((item) => item.id === localBody?.districtId);
      const constituency = constituencies.find((item) => item.id === localBody?.constituencyId);
      add(
        localBody?.id || area.parentEn || area.id,
        {
          district: pick(district?.en, district?.ml),
          constituency: pick(constituency?.en, constituency?.ml),
          localBody: pick(localBody?.en, localBody?.ml),
        },
        area,
      );
      return;
    }
    if (grant.scopeType === "booths") {
      const booth = boothDirectory.find((item) => item.id === area.id);
      const constituency = constituencies.find((item) => item.id === booth?.constituencyId);
      const district = districts.find((item) => item.id === booth?.districtId);
      add(
        constituency?.id || area.parentEn || area.id,
        {
          district: pick(district?.en, district?.ml),
          constituency: pick(constituency?.en, constituency?.ml),
        },
        area,
      );
      return;
    }
    add("all-kerala", {}, area);
  });

  return Array.from(groups.values());
}

function GrantAreaGroups({ grant, lang }: { grant: AccessGrant; lang: Lang }) {
  const groups = groupGrantAreas(grant, lang);
  if (groups.length === 0) return null;
  const areasLabel =
    grant.scopeType === "regions"
      ? lang === "ml"
        ? "റീജിയണുകൾ"
        : "Regions"
      : grant.scopeType === "wards"
        ? lang === "ml"
          ? "വാർഡുകൾ"
          : "Wards"
        : grant.scopeType === "booths"
          ? lang === "ml"
            ? "ബൂത്തുകൾ"
            : "Booths"
          : grant.scopeType === "local_bodies"
            ? lang === "ml"
              ? "തദ്ദേശ സ്ഥാപനങ്ങൾ"
              : "Local bodies"
            : grant.scopeType === "constituencies"
              ? lang === "ml"
                ? "മണ്ഡലങ്ങൾ"
                : "Constituencies"
              : grant.scopeType === "districts"
                ? lang === "ml"
                  ? "ജില്ലകൾ"
                  : "Districts"
                : lang === "ml"
                  ? "പ്രദേശം"
                  : "Area";

  return (
    <div className="mt-1.5 space-y-2">
      {groups.map((group, groupIndex) => (
        <div
          key={group.key}
          className={
            groupIndex > 0 ? "border-t border-slate-200/80 pt-2 dark:border-slate-700" : ""
          }
        >
          {group.district || group.constituency || group.localBody ? (
            <div className="space-y-0.5 text-[8.5px] leading-snug">
              {group.district ? (
                <p>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {lang === "ml" ? "ജില്ല" : "District"}:
                  </span>{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {group.district}
                  </span>
                </p>
              ) : null}
              {group.constituency ? (
                <p>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {lang === "ml" ? "മണ്ഡലം" : "Constituency"}:
                  </span>{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {group.constituency}
                  </span>
                </p>
              ) : null}
              {group.localBody ? (
                <p>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {lang === "ml" ? "തദ്ദേശ സ്ഥാപനം" : "Local body"}:
                  </span>{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {group.localBody}
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className="text-[8.5px] font-semibold text-slate-500 dark:text-slate-400">
              {areasLabel}:
            </span>
            {group.areas.map((area, areaIndex) => (
              <span
                key={`${group.key}-${areaIndex}`}
                className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[8.5px] font-bold text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="shrink-0 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="max-w-[72%] text-right text-[9.5px] font-extrabold leading-snug text-slate-800 dark:text-slate-100">
        {value || "—"}
      </span>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#ff5500] dark:bg-orange-950/50 dark:text-orange-300">
          <Icon className="h-3.5 w-3.5 stroke-[2.2]" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">{title}</p>
          <p className="mt-0.5 text-[9px] font-medium leading-snug text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>
      {badge ? (
        <span className="shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-[8.5px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
