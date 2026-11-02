import React, { useEffect, useMemo, useRef, useState } from "react";
import partyWorkerAvatar from "@/assets/create-partyworker-3d-avatar.jpg";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Filter,
  Headset,
  Landmark,
  Layers,
  Lock,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UserX,
  Users2,
  X,
} from "lucide-react";
import { mockUsers, type AppUser } from "@/data/users";
import { partyWorkerStorageKey } from "@/data/party-worker-directory";
import {
  constituencies,
  districts,
  getWardsForLocalBody,
  panchayats,
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
  designationsForLevel,
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
  administrativePermissionOptions,
  isRetiredOrganisationLevelName,
  loadCustomOrganisationLevels,
  loadManagedRoles,
  type ManagedRole,
} from "@/data/role-management";

type Lang = "en" | "ml";

interface MobileCreatePartyWorkerFlowProps {
  lang: Lang;
  onClose: () => void;
  onCreated?: (worker: WorkerProfile) => void;
  actorRole?: ActorRole;
  canOpenExistingWorker?: boolean;
  initialPhase?: "form" | "list";
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
  permissions: string[];
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
  | "designation"
  | "level"
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
  | "worker_filter_designation"
  | "worker_filter_district"
  | "worker_filter_constituency"
  | "worker_filter_local_body_type"
  | "worker_filter_local_body"
  | "worker_filter_ward"
  | "worker_filter_booth"
  | "worker_filter_org_unit"
  | "worker_filter_app_role";

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

const partyWorkerPermissionOrder: PermissionModuleId[] = [
  "applicant_profile",
  "applications",
  "help_desk",
  "schemes",
  "party_workers",
];

const orderedPartyWorkerPermissions = [...permissionModules].sort(
  (a, b) => partyWorkerPermissionOrder.indexOf(a.id) - partyWorkerPermissionOrder.indexOf(b.id),
);

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
  if (level === "district") return pick(district?.en, district?.ml);
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
  status: "all" | "Active" | "Suspended";
  level: AssignmentLevel | "all";
  designationId: string;
  districtId: string;
  constituencyId: string;
  localBodyType: LocalBodyType | "";
  localBodyId: string;
  wardId: string;
  boothId: string;
  orgUnitId: string;
  appRole: RolePresetId | "all";
};

const defaultWorkerListFilters: WorkerListFilters = {
  status: "all",
  level: "all",
  designationId: "all",
  districtId: "",
  constituencyId: "",
  localBodyType: "",
  localBodyId: "",
  wardId: "",
  boothId: "",
  orgUnitId: "",
  appRole: "all",
};

function countActiveWorkerFilters(filters: WorkerListFilters) {
  let count = 0;
  if (filters.status !== "all") count += 1;
  if (filters.level !== "all") count += 1;
  if (filters.designationId !== "all") count += 1;
  if (filters.districtId) count += 1;
  if (filters.constituencyId) count += 1;
  if (filters.localBodyType) count += 1;
  if (filters.localBodyId) count += 1;
  if (filters.wardId) count += 1;
  if (filters.boothId) count += 1;
  if (filters.orgUnitId) count += 1;
  if (filters.appRole !== "all") count += 1;
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
  if (filters.level !== "all" && level !== filters.level) return false;

  const matchesStatus =
    filters.status === "all" ||
    (filters.status === "Suspended"
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

  if (filters.districtId) {
    const selectedDistrict = districts.find((item) => item.id === filters.districtId);
    if (!selectedDistrict) return false;
    const matchesDistrict =
      worker.districtId === selectedDistrict.id ||
      worker.districtNameEn === selectedDistrict.en ||
      worker.districtNameMl === selectedDistrict.ml ||
      contains(selectedDistrict.en) ||
      contains(selectedDistrict.ml);
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
  [
    ...sessionCreatedWorkers,
    ...readStoredWorkers(),
    ...mockUsers.filter((user) => user.category === "bjp_member").map(profileFromAppUser),
  ].forEach((worker) => {
    const key = worker.mobile.replace(/\D/g, "") || worker.id;
    if (!workers.has(key)) workers.set(key, worker);
  });
  return Array.from(workers.values());
}

export function MobileCreatePartyWorkerFlow({
  lang,
  onClose,
  onCreated,
  actorRole = "state_admin",
  canOpenExistingWorker = true,
  initialPhase = "form",
}: MobileCreatePartyWorkerFlowProps) {
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);

  const [step, setStep] = useState<1 | 2>(1);
  const [phase, setPhase] = useState<"form" | "profile" | "list">(initialPhase);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profilePhotoBusy, setProfilePhotoBusy] = useState(false);
  const [profilePhotoError, setProfilePhotoError] = useState("");
  const [focusAccessAreas, setFocusAccessAreas] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerSearchOpen, setWorkerSearchOpen] = useState(false);
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
  const [designationId, setDesignationId] = useState("");
  const [level, setLevel] = useState<AssignmentLevel | "">("");
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
  const managedRoles = useMemo<ManagedRole[]>(() => loadManagedRoles(), []);

  const [picker, setPicker] = useState<PickerKey | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  const [isAccessSheetOpen, setIsAccessSheetOpen] = useState(false);
  const [editingGrantId, setEditingGrantId] = useState<string | null>(null);
  const [sheetScope, setSheetScope] = useState<ScopeType>("districts");
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
  const designation = partyDesignations.find((item) => item.id === designationId) || null;
  const rolePresetIdForDesignation =
    rolePresetForLevel[designation?.level ?? (level || "ward")] ?? "party_worker";
  const presetForDesignation = getRolePreset(rolePresetIdForDesignation);
  const managedRoleForDesignation = managedRoles.find(
    (role) => role.presetId === rolePresetIdForDesignation && role.status === "Active",
  );
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
  const constituency = constituencies.find((item) => item.id === constituencyId) || null;
  const localBody = panchayats.find((item) => item.id === localBodyId) || null;
  const ward = localBodyId
    ? getWardsForLocalBody(localBodyId).find((item) => item.id === wardId)
    : undefined;
  const booth = boothDirectory.find((item) => item.id === boothId) || null;

  useEffect(() => {
    if (!designation) return;
    setPermissions([...rolePermissions]);
    setPresetId(rolePresetIdForDesignation);
    setAccessManagement(roleAccessManagement);
    setPermissionError("");
  }, [designation, rolePermissions, rolePresetIdForDesignation, roleAccessManagement]);

  const localBodyTypeLabel = localBodyTypeOptions.find((item) => item.id === localBodyType);

  const designationsForSelectedLevel = designationsForLevel(level);
  const designationOptions =
    designationsForSelectedLevel.length > 0 ? designationsForSelectedLevel : partyDesignations;
  const localBodyOptions = getLocalBodies(districtId, localBodyType);
  const wardOptions = localBodyId ? getWardsForLocalBody(localBodyId) : [];
  const boothOptions = constituencyId
    ? boothDirectory.filter((item) => item.constituencyId === constituencyId)
    : [];
  const constituencyOptions = districtId
    ? constituencies.filter((item) => item.districtId === districtId)
    : [];

  const workerFilterDesignation = partyDesignations.find(
    (item) => item.id === draftWorkerFilters.designationId,
  );
  const workerFilterDistrict = districts.find((item) => item.id === draftWorkerFilters.districtId);
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
  const workerFilterDesignationOptions = designationsForLevel(
    draftWorkerFilters.level === "all" ? "" : draftWorkerFilters.level,
  );
  const workerFilterConstituencyOptions = draftWorkerFilters.districtId
    ? constituencies.filter((item) => item.districtId === draftWorkerFilters.districtId)
    : [];
  const workerFilterLocalBodyOptions = getLocalBodies(
    draftWorkerFilters.districtId,
    draftWorkerFilters.localBodyType,
  );
  const workerFilterWardOptions = draftWorkerFilters.localBodyId
    ? getWardsForLocalBody(draftWorkerFilters.localBodyId)
    : [];
  const workerFilterBoothOptions = draftWorkerFilters.constituencyId
    ? boothDirectory.filter((item) => item.constituencyId === draftWorkerFilters.constituencyId)
    : [];
  const appliedWorkerFilterCount = countActiveWorkerFilters(appliedWorkerFilters);

  const locationLine = (language: Lang) => {
    if (!level) return "";
    if (level === "state") {
      return language === "ml" ? "കേരളം, സംസ്ഥാന വ്യാപകം" : "Kerala, statewide";
    }
    if (level === "district") {
      return district ? (language === "ml" ? district.ml : district.en) : "";
    }
    if (level === "region" || level === "area" || level.startsWith("custom_org_")) {
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
    setErrors((prev) => ({ ...prev, level: "", designation: "" }));
    if (designation && designation.level !== nextLevel) setDesignationId("");
  };

  const handleDesignationChange = (nextId: string) => {
    const next = partyDesignations.find((item) => item.id === nextId);
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
    setConstituencyId("");
    setLocalBodyId("");
    setWardId("");
    setBoothId("");
    setErrors((prev) => ({
      ...prev,
      district: "",
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
    if (!designationId) {
      nextErrors.designation = tr("Select a party designation.", "പാർട്ടി പദവി തിരഞ്ഞെടുക്കുക.");
    }
    if (!level) {
      nextErrors.level = tr("Select an organisation level.", "ഓർഗനൈസേഷൻ ലെവൽ തിരഞ്ഞെടുക്കുക.");
    }
    if (level && level !== "state" && !districtId) {
      nextErrors.district = tr("Select a district.", "ജില്ല തിരഞ്ഞെടുക്കുക.");
    }
    if ((level === "assembly_constituency" || level === "mandalam") && !constituencyId) {
      nextErrors.constituency = tr(
        "Select an assembly constituency.",
        "നിയോജകമണ്ഡലം തിരഞ്ഞെടുക്കുക.",
      );
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
      designationEn: designation?.en || "",
      designationMl: designation?.ml || "",
      mobile,
      levelLabelEn: levelOption?.en || "",
      levelLabelMl: levelOption?.ml || "",
      locationLines: { en: locationLine("en"), ml: locationLine("ml") },
      districtNameEn: district?.en || tr("Kerala", "കേരളം"),
      districtNameMl: district?.ml || "കേരളം",
      permissions,
      grants,
      accessManagement,
      designationId,
      level: level || undefined,
      districtId: districtId || undefined,
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
    const workerDesignation = partyDesignations.find(
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
    setDesignationId(workerDesignation?.id || "");
    setLevel(workerLevel?.id || "");
    setDistrictId(workerDistrict?.id || "");
    setConstituencyId(workerConstituency?.id || "");
    setLocalBodyType(workerLocalBody?.type || worker.localBodyType || "");
    setLocalBodyId(workerLocalBody?.id || "");
    setWardId(workerWard?.id || "");
    setBoothId(workerBooth?.id || "");
    setOrgUnitId(worker.orgUnitId || "");
    setPresetId(worker.presetId || "custom");
    setPermissions(worker.permissions);
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
    districtId: "",
    constituencyId: "",
    localBodyType: "" as const,
    localBodyId: "",
    wardId: "",
    boothId: "",
    orgUnitId: "",
  });

  const handleWorkerFilterLevelChange = (nextLevel: AssignmentLevel | "all") => {
    setDraftWorkerFilters((prev) => {
      if (prev.level === nextLevel) return prev;
      const previousDesignation = partyDesignations.find((item) => item.id === prev.designationId);
      const designationId =
        nextLevel === "all" || previousDesignation?.level === nextLevel
          ? prev.designationId
          : "all";
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
      const nextDesignation = partyDesignations.find((item) => item.id === nextId);
      if (!nextDesignation) return prev;
      const levelChanged = prev.level !== nextDesignation.level;
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
      return { ...prev, constituencyId: value, boothId: "" };
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

  const availableScopeTypes: ScopeTypeOption[] = scopeTypeOptions.filter(
    (option: ScopeTypeOption) => {
      return option.id !== "all_kerala" || canDelegateStatewide(actorRole);
    },
  );

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
    const isMultiFilter = picker.startsWith("filter_");
    let title = "";
    let options: PickerOption[] = [];
    let selectedId = "";
    let selectedIds: string[] = [];
    let onPick: (id: string) => void = () => undefined;
    let onToggle: (id: string) => void = () => undefined;
    let onClear: (() => void) | null = null;

    if (picker === "designation") {
      title = tr("Party Designation", "പാർട്ടി പദവി");
      options = designationOptions.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedId = designationId;
      onPick = handleDesignationChange;
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
    } else if (picker === "district") {
      title = tr("District", "ജില്ല");
      options = districts.map((item) => ({
        id: item.id,
        label: lang === "ml" ? item.ml : item.en,
        search: `${item.en} ${item.ml}`,
      }));
      selectedId = districtId;
      onPick = handleDistrictChange;
    } else if (picker === "constituency") {
      title = tr("Assembly Constituency", "നിയോജകമണ്ഡലം");
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
      title = tr("Assignment Level", "അസൈൻമെന്റ് ലെവൽ");
      options = [
        {
          id: "all",
          label: tr("All levels", "എല്ലാ ലെവലുകളും"),
          search: "all levels any",
        },
        ...assignmentLevels.map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.ml : item.en,
          hint: lang === "ml" ? item.hintMl : item.hintEn,
          search: `${item.en} ${item.ml} ${item.hintEn} ${item.hintMl}`,
        })),
      ];
      selectedId = draftWorkerFilters.level;
      onPick = (id) => handleWorkerFilterLevelChange(id as AssignmentLevel | "all");
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
          hint: assignmentLevels.find((levelItem) => levelItem.id === item.level)?.[lang],
          search: `${item.en} ${item.ml}`,
        })),
      ];
      selectedId = draftWorkerFilters.designationId;
      onPick = handleWorkerFilterDesignationChange;
    } else if (picker === "worker_filter_district") {
      title = tr("District", "ജില്ല");
      options = [
        {
          id: "all",
          label: tr("All districts", "എല്ലാ ജില്ലകളും"),
          search: "all districts any",
        },
        ...districts.map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.ml : item.en,
          search: `${item.en} ${item.ml}`,
        })),
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
        ...workerFilterConstituencyOptions.map((item) => ({
          id: item.id,
          label: lang === "ml" ? item.ml : item.en,
          search: `${item.en} ${item.ml}`,
        })),
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
        className="absolute inset-0 z-[115] flex items-end bg-black/55 backdrop-blur-[1px] animate-in fade-in duration-150"
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
            placeholder={tr(
              "Select organisation level",
              "ഓർഗനൈസേഷൻ ലെവൽ തിരഞ്ഞെടുക്കുക",
            )}
            hint={
              levelOption
                ? lang === "ml"
                  ? levelOption.hintMl
                  : levelOption.hintEn
                : tr(
                    "Selecting a designation suggests its level",
                    "പദവി തിരഞ്ഞെടുക്കുമ്പോൾ ലെവൽ നിർദ്ദേശിക്കും",
                  )
            }
            error={errors.level}
            onClick={() => openPicker("level")}
          />

          <PickerButton
            label={tr("Party Designation", "പാർട്ടി പദവി")}
            required
            value={designation ? (lang === "ml" ? designation.ml : designation.en) : ""}
            placeholder={tr("Select designation", "പദവി തിരഞ്ഞെടുക്കുക")}
            hint={
              designation
                ? assignmentLevels.find((item) => item.id === designation.level)?.[lang]
                : level
                  ? tr(
                      `Showing designations for ${levelOption?.en}`,
                      `${levelOption?.ml} പദവികൾ കാണിക്കുന്നു`,
                    )
                  : tr("All configured designations", "ക്രമീകരിച്ച എല്ലാ പദവികളും")
            }
            error={errors.designation}
            onClick={() => openPicker("designation")}
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

          {level && level !== "state" ? (
            <PickerButton
              label={tr("District", "ജില്ല")}
              required
              value={district ? (lang === "ml" ? district.ml : district.en) : ""}
              placeholder={tr("Select district", "ജില്ല തിരഞ്ഞെടുക്കുക")}
              error={errors.district}
              onClick={() => openPicker("district")}
            />
          ) : null}

          {level === "assembly_constituency" || level === "mandalam" || level === "booth" ? (
            <PickerButton
              label={tr("Assembly Constituency", "നിയോജകമണ്ഡലം")}
              required
              value={constituency ? (lang === "ml" ? constituency.ml : constituency.en) : ""}
              placeholder={
                districtId
                  ? tr("Select constituency", "മണ്ഡലം തിരഞ്ഞെടുക്കുക")
                  : tr("Select a district first", "ആദ്യം ജില്ല തിരഞ്ഞെടുക്കുക")
              }
              error={errors.constituency}
              disabled={!districtId}
              onClick={() => districtId && openPicker("constituency")}
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
            {designation || level ? (
              <div className="mt-1.5 space-y-1">
                <SummaryRow
                  label={tr("Designation", "പദവി")}
                  value={designation ? (lang === "ml" ? designation.ml : designation.en) : "—"}
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
                  "Choose a designation and level to preview the assignment.",
                  "അസൈൻമെന്റ് കാണാൻ പദവിയും ലെവലും തിരഞ്ഞെടുക്കുക.",
                )}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  const renderStep2 = () => {
    const roleTitle =
      managedRoleForDesignation?.name ??
      (lang === "ml" ? presetForDesignation.ml : presetForDesignation.en);
    const designationLabel = designation
      ? lang === "ml"
        ? designation.ml
        : designation.en
      : tr("selected designation", "തിരഞ്ഞെടുത്ത പദവി");
    const roleDescription = tr(
      `Permissions inherited from the ${designationLabel} designation.`,
      `${designationLabel} പദവിയിൽ നിന്ന് ലഭിക്കുന്ന അനുമതികൾ.`,
    );
    const administrativeLabels = roleAdministrativePermissions
      .map((id) => administrativePermissionOptions.find((option) => option.id === id))
      .filter((option): option is (typeof administrativePermissionOptions)[number] =>
        Boolean(option),
      )
      .map((option) => (lang === "ml" ? option.ml : option.en));

    return (
      <div className="space-y-3.5">
        <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3 border-b border-orange-100 p-3 dark:border-slate-800">
            <div className="flex min-w-0 gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ff5500] text-white">
                <ShieldCheck className="h-3.5 w-3.5 stroke-[2.2]" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                  {roleTitle}
                </p>
                <p className="mt-0.5 text-[9px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                  {roleDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {orderedPartyWorkerPermissions.map((module) => {
                const Icon = moduleIcons[module.id];
                const grantedActions = module.actions.filter((action) =>
                  rolePermissions.includes(permissionKey(module.id, action.id)),
                );
                return (
                  <div key={module.id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-orange-50 text-[#ff5500] dark:bg-orange-950/50 dark:text-orange-300">
                        <Icon className="h-3.5 w-3.5 stroke-[2.2]" />
                      </span>
                      <span className="min-w-0 flex-1 text-[10px] font-extrabold text-slate-900 dark:text-white">
                        {lang === "ml" ? module.ml : module.en}
                      </span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[8.5px] font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {grantedActions.length}/{module.actions.length}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1 pl-7">
                      {grantedActions.length > 0 ? (
                        grantedActions.map((action) => (
                          <span
                            key={action.id}
                            className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[8.5px] font-bold text-orange-800 dark:bg-orange-950/40 dark:text-orange-200"
                          >
                            {lang === "ml" ? action.ml : action.en}
                          </span>
                        ))
                      ) : (
                        <span className="text-[8.5px] font-semibold italic text-slate-400 dark:text-slate-500">
                          {tr("No access", "ആക്സസ് ഇല്ല")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {administrativeLabels.length > 0 ? (
              <div className="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-700 dark:text-slate-200">
                  <Lock className="h-3 w-3 text-slate-500" />
                  {tr("Administrative access", "അഡ്മിനിസ്ട്രേറ്റീവ് ആക്സസ്")}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {administrativeLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[8.5px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
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
    return allWorkers.filter((worker) => {
      const designation = lang === "ml" ? worker.designationMl : worker.designationEn;
      const area = workerAreaLabel(worker, lang);
      const searchText = `${worker.name} ${worker.nameMl || ""} ${worker.mobile} ${designation} ${area}`;
      const matchesSearch = !query || searchText.toLowerCase().includes(query);
      return matchesSearch && workerMatchesListFilters(worker, appliedWorkerFilters);
    });
  };

  const renderWorkerList = () => {
    const visibleWorkers = getVisibleWorkers();

    return (
      <div className="space-y-2">
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
            const statusClass =
              worker.status === "Deactivated"
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                : worker.status === "Pending"
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : worker.status === "Verified"
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";

            return (
              <button
                key={`${worker.id}-${worker.mobile}`}
                type="button"
                onClick={() => openWorkerProfile(worker)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-orange-100 bg-white p-2.5 text-left shadow-2xs transition hover:border-orange-200 hover:bg-[#FFFCF7] active:scale-[0.995] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-orange-50 shadow-sm ring-2 ring-white dark:bg-slate-800 dark:ring-slate-900">
                  <img
                    src={worker.photoUrl || partyWorkerAvatar}
                    alt=""
                    className={`h-full w-full rounded-full object-cover ${
                      worker.photoUrl ? "" : "scale-[1.22]"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="min-w-0 flex-1 truncate text-[12px] font-extrabold leading-tight text-slate-900 dark:text-white">
                      {lang === "ml" ? worker.nameMl || worker.name : worker.name}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black ${statusClass}`}
                    >
                      {worker.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[9.5px] font-bold text-[#C2410C] dark:text-orange-300">
                    {designation || tr("User", "ഉപയോക്താവ്")}
                  </p>
                  <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[8.5px] font-semibold text-slate-500 dark:text-slate-400">
                    <MapPin className="h-2.5 w-2.5 shrink-0 text-[#ff5500]" />
                    <span className="truncate">
                      {area || tr("Area not recorded", "പ്രദേശം രേഖപ്പെടുത്തിയിട്ടില്ല")}
                    </span>
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
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
      { id: "Suspended", en: "Suspended", ml: "സസ്പെൻഡ് ചെയ്തത്" },
    ];
    const level = draftWorkerFilters.level;
    const showDistrict = level !== "all" && level !== "state" && level !== "org_unit";
    const showConstituency = level === "assembly_constituency" || level === "booth";
    const showLocalBodyType = level === "local_body" || level === "ward";
    const showLocalBody = level === "local_body" || level === "ward";
    const showWard = level === "ward";
    const showBooth = level === "booth";
    const showOrgUnit = level === "org_unit";
    const selectedLevel = assignmentLevels.find((item) => item.id === level);
    const draftFilterCount = countActiveWorkerFilters(draftWorkerFilters);

    return (
      <div
        className="absolute inset-0 z-[110] flex items-end bg-black/55 backdrop-blur-[1px] animate-in fade-in duration-150"
        onClick={closeWorkerFilters}
      >
        <div
          className="flex max-h-[88%] w-full flex-col rounded-t-2xl border-t border-orange-100 bg-white shadow-2xl animate-in slide-in-from-bottom duration-200 dark:border-slate-800 dark:bg-slate-900"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 border-b border-slate-100 px-3.5 pb-2.5 pt-2 dark:border-slate-800">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-1.5 text-[13px] font-extrabold text-slate-900 dark:text-white">
                  {tr("Filter users", "ഉപയോക്താക്കളെ ഫിൽട്ടർ ചെയ്യുക")}
                  {draftFilterCount > 0 ? (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5500] px-1 text-[8.5px] font-black text-white">
                      {draftFilterCount}
                    </span>
                  ) : null}
                </h3>
                <p className="mt-0.5 text-[9.5px] font-semibold text-slate-500 dark:text-slate-400">
                  {tr("Status, assignment and area", "നില, അസൈൻമെന്റ്, പ്രദേശം")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeWorkerFilters}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-3.5 py-3 [scrollbar-width:thin]">
            <div>
              <p className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {tr("Account Status", "അക്കൗണ്ട് നില")}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {statusOptions.map((option) => {
                  const active = draftWorkerFilters.status === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setDraftWorkerFilters((prev) => ({ ...prev, status: option.id }))
                      }
                      className={`h-8 rounded-lg border text-[10px] font-extrabold transition ${
                        active
                          ? "border-[#ff5500] bg-[#FFF2E6] text-[#C2410C] dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      }`}
                    >
                      {lang === "ml" ? option.ml : option.en}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <PickerButton
                label={tr("Assignment Level", "അസൈൻമെന്റ് ലെവൽ")}
                value={
                  level === "all"
                    ? tr("All levels", "എല്ലാ ലെവലുകളും")
                    : selectedLevel
                      ? selectedLevel[lang]
                      : ""
                }
                placeholder={tr("All levels", "എല്ലാ ലെവലുകളും")}
                onClick={() => openPicker("worker_filter_level")}
              />
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
                        "Designations are narrowed by assignment level.",
                        "അസൈൻമെന്റ് ലെവൽ അനുസരിച്ച് പദവികൾ ചുരുക്കുന്നു.",
                      )
                    : undefined
                }
                onClick={() => openPicker("worker_filter_designation")}
              />
            </div>

            <div className="rounded-xl border border-orange-100/80 bg-[#FFFDF9] p-2.5 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {tr("Assigned Location", "അസൈൻ ചെയ്ത പ്രദേശം")}
              </p>

              {level === "all" ? (
                <div className="rounded-lg border border-dashed border-orange-200 bg-white/70 px-3 py-2.5 text-[9.5px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                  {tr(
                    "Choose an assignment level to filter by area.",
                    "പ്രദേശം അനുസരിച്ച് ഫിൽട്ടർ ചെയ്യാൻ അസൈൻമെന്റ് ലെവൽ തിരഞ്ഞെടുക്കുക.",
                  )}
                </div>
              ) : level === "state" ? (
                <div className="flex items-center gap-2 rounded-lg border border-orange-100 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900">
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
              ) : (
                <div className="space-y-2">
                  {showDistrict ? (
                    <PickerButton
                      label={tr("District", "ജില്ല")}
                      value={
                        workerFilterDistrict
                          ? workerFilterDistrict[lang]
                          : tr("Any district", "ഏത് ജില്ലയും")
                      }
                      placeholder={tr("Any district", "ഏത് ജില്ലയും")}
                      onClick={() => openPicker("worker_filter_district")}
                    />
                  ) : null}

                  {showConstituency ? (
                    <PickerButton
                      label={tr("Assembly Constituency", "നിയോജകമണ്ഡലം")}
                      value={
                        workerFilterConstituency
                          ? workerFilterConstituency[lang]
                          : draftWorkerFilters.districtId
                            ? tr("Any constituency", "ഏത് മണ്ഡലവും")
                            : tr("Select a district first", "ആദ്യം ജില്ല തിരഞ്ഞെടുക്കുക")
                      }
                      placeholder={tr("Any constituency", "ഏത് മണ്ഡലവും")}
                      disabled={!draftWorkerFilters.districtId}
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
                      label={tr("Local Body", "തദ്ദേശ സ്ഥാപനം")}
                      value={
                        workerFilterLocalBody
                          ? workerFilterLocalBody[lang]
                          : draftWorkerFilters.districtId && draftWorkerFilters.localBodyType
                            ? tr("Any local body", "ഏത് തദ്ദേശ സ്ഥാപനവും")
                            : tr(
                                "Select district and type first",
                                "ആദ്യം ജില്ലയും തരവും തിരഞ്ഞെടുക്കുക",
                              )
                      }
                      placeholder={tr("Any local body", "ഏത് തദ്ദേശ സ്ഥാപനവും")}
                      disabled={!draftWorkerFilters.districtId || !draftWorkerFilters.localBodyType}
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
                            : tr("Select a local body first", "ആദ്യം തദ്ദേശ സ്ഥാപനം തിരഞ്ഞെടുക്കുക")
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
                            ? tr("Any booth", "ഏത് ബൂത്തും")
                            : tr("Select a constituency first", "ആദ്യം മണ്ഡലം തിരഞ്ഞെടുക്കുക")
                      }
                      placeholder={tr("Any booth", "ഏത് ബൂത്തും")}
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
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setWorkerMoreFiltersOpen((prev) => !prev)}
                className="flex w-full items-center gap-2 px-2.5 py-2.5 text-left"
              >
                <Layers className="h-4 w-4 shrink-0 text-[#ff5500] dark:text-orange-300" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
                    {tr("More Filters", "കൂടുതൽ ഫിൽട്ടറുകൾ")}
                  </p>
                  {!workerMoreFiltersOpen && draftWorkerFilters.appRole !== "all" ? (
                    <p className="mt-0.5 truncate text-[9px] font-medium text-slate-500 dark:text-slate-400">
                      {tr("App role", "ആപ്പ് റോൾ")}: {workerFilterAppRole?.[lang]}
                    </p>
                  ) : null}
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                    workerMoreFiltersOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {workerMoreFiltersOpen ? (
                <div className="border-t border-slate-100 p-2.5 dark:border-slate-800">
                  <PickerButton
                    label={tr("App Role", "ആപ്പ് റോൾ")}
                    value={
                      draftWorkerFilters.appRole === "all" || !workerFilterAppRole
                        ? tr("All roles", "എല്ലാ റോളുകളും")
                        : workerFilterAppRole[lang]
                    }
                    placeholder={tr("All roles", "എല്ലാ റോളുകളും")}
                    onClick={() => openPicker("worker_filter_app_role")}
                  />
                </div>
              ) : null}
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

  const renderProfile = () => {
    if (!profile) return null;
    const groupedPermissions = permissionModules
      .map((module) => ({
        module,
        actions: module.actions.filter((action) =>
          profile.permissions.includes(permissionKey(module.id, action.id)),
        ),
      }))
      .filter((entry) => entry.actions.length > 0);
    const permissionActionCount = groupedPermissions.reduce(
      (total, entry) => total + entry.actions.length,
      0,
    );
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
      if (profileLevel === "district") {
        return lang === "ml"
          ? profileDistrict?.ml || profile.districtNameMl
          : profileDistrict?.en || profile.districtNameEn;
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

    return (
      <section className="divide-y divide-orange-100/80 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        <div className="p-3">
          <input
            ref={profilePhotoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="hidden"
            onChange={handleProfilePhotoChange}
          />
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-orange-50 shadow-sm ring-2 ring-white dark:bg-slate-800 dark:ring-slate-900">
                <img
                  src={profile.photoUrl || partyWorkerAvatar}
                  alt={profile.name}
                  className={`h-full w-full rounded-full object-cover ${
                    profile.photoUrl ? "" : "scale-[1.22]"
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={triggerProfilePhotoUpload}
                disabled={profilePhotoBusy}
                className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#ff5500] text-white shadow-md ring-2 ring-white transition active:scale-95 disabled:opacity-60 dark:ring-slate-900"
                aria-label={tr("Upload profile picture", "പ്രൊഫൈൽ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക")}
                title={tr("Upload profile picture", "പ്രൊഫൈൽ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക")}
              >
                <Camera className="h-2.5 w-2.5 stroke-[2.5]" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[14px] font-extrabold leading-tight text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8.5px] font-black ${
                    profile.status === "Deactivated"
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  }`}
                >
                  {profile.status}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] font-bold text-[#C2410C] dark:text-orange-300">
                {lang === "ml" ? profile.designationMl : profile.designationEn}
              </p>
              {profileAreaLabel ? (
                <p className="mt-0.5 text-[9px] font-semibold leading-snug text-slate-500 dark:text-slate-400">
                  {profileAreaLabel}
                </p>
              ) : null}
            </div>
          </div>
          {profilePhotoError ? (
            <p className="mt-2 flex items-start gap-1 rounded-lg bg-rose-50 px-2 py-1.5 text-[9px] font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="mt-px h-3 w-3 shrink-0" />
              {profilePhotoError}
            </p>
          ) : null}
          <div className="mt-3 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-700 dark:bg-slate-800/40">
            <SummaryRow
              label={tr("Level", "ലെവൽ")}
              value={lang === "ml" ? profile.levelLabelMl : profile.levelLabelEn}
            />
            <SummaryRow
              label={tr("Assignment", "അസൈൻമെന്റ്")}
              value={lang === "ml" ? profile.locationLines.ml : profile.locationLines.en}
            />
            <SummaryRow label={tr("Mobile", "മൊബൈൽ")} value={`+91 ${profile.mobile}`} />
            <SummaryRow
              label={tr("District", "ജില്ല")}
              value={lang === "ml" ? profile.districtNameMl : profile.districtNameEn}
            />
          </div>
        </div>

        <div className="p-3">
          <SectionHeading
            icon={ShieldCheck}
            title={tr("Permissions", "അനുമതികൾ")}
            subtitle={tr("Access assigned to this worker", "ഈ പ്രവർത്തകന് നൽകിയ ആക്സസ്")}
            badge={tr(`${permissionActionCount} actions`, `${permissionActionCount} പ്രവർത്തനങ്ങൾ`)}
          />
          <div className="mt-2.5 space-y-2">
            {groupedPermissions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-3 py-3 text-center text-[9.5px] font-semibold text-slate-500 dark:border-slate-700">
                {tr(
                  "No module permissions recorded for this account.",
                  "ഈ അക്കൗണ്ടിന് മൊഡ്യൂൾ അനുമതികൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
                )}
              </p>
            ) : (
              <div className="divide-y divide-slate-200/80 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900">
                {groupedPermissions.map(({ module, actions }) => {
                  const Icon = moduleIcons[module.id];
                  return (
                    <div key={module.id} className="p-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-[#ff5500] dark:text-orange-400" />
                        <p className="min-w-0 flex-1 text-[11px] font-extrabold text-slate-800 dark:text-white">
                          {lang === "ml" ? module.ml : module.en}
                        </p>
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {actions.length}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1.5">
                        {actions.map((action) => (
                          <div key={action.id} className="flex min-w-0 items-start gap-1.5">
                            <Check className="mt-px h-3 w-3 shrink-0 stroke-[2.6] text-[#ff5500] dark:text-orange-400" />
                            <span className="min-w-0 text-[9px] font-semibold leading-snug text-slate-700 dark:text-slate-200">
                              {lang === "ml" ? action.ml : action.en}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {profile.accessManagement ? (
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-2 dark:border-amber-900/60 dark:bg-amber-950/30">
                <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <p className="text-[9px] font-extrabold text-amber-800 dark:text-amber-300">
                  {tr("Access management authority granted", "ആക്സസ് മാനേജ്മെന്റ് അധികാരം നൽകി")}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="p-3">
          <SectionHeading
            icon={MapPin}
            title={tr("Access Areas", "ആക്സസ് പ്രദേശങ്ങൾ")}
            subtitle={tr(
              "Scoped grants saved with the worker",
              "പ്രവർത്തകനൊപ്പം സൂക്ഷിച്ച സ്കോപ്പ് ഗ്രാന്റുകൾ",
            )}
          />
          <div className="mt-2.5 space-y-2">
            {profile.grants.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-3 py-3 text-center text-[9.5px] font-semibold text-slate-500 dark:border-slate-700">
                {tr(
                  "No extra access areas. Access is limited to the assignment.",
                  "അധിക ആക്സസ് പ്രദേശങ്ങളില്ല. അസൈൻമെന്റിൽ മാത്രം ആക്സസ്.",
                )}
              </p>
            ) : (
              profile.grants.map((grant) => (
                <div
                  key={grant.id}
                  className="rounded-lg bg-slate-50/70 p-2.5 dark:bg-slate-800/40"
                >
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300">
                      {grantScopeLabel(grant, lang)}
                    </span>
                  </div>
                  <GrantAreaGroups grant={grant} lang={lang} />
                </div>
              ))
            )}
          </div>
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
        className="absolute inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-[1px] animate-in fade-in duration-150"
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
                    "Choose the areas where this worker's permissions apply.",
                    "ഈ പ്രവർത്തകന്റെ അനുമതികൾ ബാധകമാകുന്ന പ്രദേശങ്ങൾ തിരഞ്ഞെടുക്കുക.",
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
            <div>
              <p className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1 · {tr("Scope Type", "സ്കോപ്പ് തരം")}
              </p>
              {availableScopeTypes.length === 0 ? (
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
                    {availableScopeTypes.map((option) => (
                      <option key={option.id} value={option.id}>
                        {lang === "ml" ? option.ml : option.en}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              )}
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
    <div className="absolute inset-0 z-[90] flex flex-col overflow-hidden bg-[#FFFDF9] dark:bg-slate-900">
      <div className="shrink-0 border-b border-orange-100 bg-[#FFFDF9] px-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex h-9 items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (phase === "profile") {
                setProfileMenuOpen(false);
                setPhase("list");
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
            <div className="relative z-20 flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => {
                  if (workerSearchOpen) setWorkerSearch("");
                  setWorkerSearchOpen((prev) => !prev);
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors active:scale-95 ${
                  workerSearchOpen
                    ? "bg-[#FFF2E6] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300"
                    : "text-[#1B255A] hover:bg-orange-50 dark:text-white dark:hover:bg-slate-800"
                }`}
                aria-label={tr("Search users", "ഉപയോക്താക്കളെ തിരയുക")}
                aria-expanded={workerSearchOpen}
              >
                <Search className="h-4 w-4 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={openWorkerFilters}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-colors active:scale-95 ${
                  appliedWorkerFilterCount > 0
                    ? "bg-[#FFF2E6] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300"
                    : "text-[#1B255A] hover:bg-orange-50 dark:text-white dark:hover:bg-slate-800"
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
                <Filter className="h-4 w-4 stroke-[2.2]" />
                {appliedWorkerFilterCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5500] px-1 text-[9px] font-black leading-none text-white ring-2 ring-[#FFFDF9] dark:ring-slate-900">
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
                <div className="absolute right-0 top-9 w-56 overflow-hidden rounded-xl border border-orange-100 bg-white p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150 dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={triggerProfilePhotoUpload}
                    disabled={profilePhotoBusy}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10.5px] font-bold text-slate-700 transition hover:bg-orange-50 disabled:opacity-60 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Camera className="h-3.5 w-3.5 shrink-0 text-[#C2410C] dark:text-orange-300" />
                    {profilePhotoBusy
                      ? tr("Updating photo...", "ഫോട്ടോ അപ്‌ഡേറ്റ് ചെയ്യുന്നു...")
                      : tr("Upload Profile picture", "പ്രൊഫൈൽ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക")}
                  </button>
                  <button
                    type="button"
                    onClick={beginWorkerEdit}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10.5px] font-bold text-slate-700 transition hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-3.5 w-3.5 shrink-0 text-[#C2410C] dark:text-orange-300" />
                    {tr("Edit Details", "വിവരങ്ങൾ തിരുത്തുക")}
                  </button>
                  <button
                    type="button"
                    onClick={beginAccessAreaChange}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10.5px] font-bold text-slate-700 transition hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C2410C] dark:text-orange-300" />
                    {tr("Change access area", "ആക്സസ് പ്രദേശം മാറ്റുക")}
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                  <button
                    type="button"
                    onClick={toggleWorkerStatus}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10.5px] font-bold transition ${
                      profile?.status === "Deactivated"
                        ? "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                        : "text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                    }`}
                  >
                    {profile?.status === "Deactivated" ? (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <UserX className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {profile?.status === "Deactivated"
                      ? tr("Reactivate user", "ഉപയോക്താവിനെ വീണ്ടും സജീവമാക്കുക")
                      : tr("Deactivate user", "ഉപയോക്താവിനെ നിർജ്ജീവമാക്കുക")}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <span className="shrink-0 rounded-full border border-orange-200/80 bg-[#FFF2E6] px-2 py-0.5 text-[10px] font-extrabold text-[#C2410C] shadow-2xs dark:border-orange-800/80 dark:bg-orange-950/80 dark:text-orange-300">
              {tr(`Step ${step} of 2`, `ഘട്ടം ${step} / 2`)}
            </span>
          )}
        </div>
        {phase === "list" && workerSearchOpen ? (
          <div className="pb-2">
            <div className="flex h-8 items-center gap-1.5 rounded-lg border border-orange-200/80 bg-white px-2.5 dark:border-slate-700 dark:bg-slate-800">
              <Search className="h-3.5 w-3.5 shrink-0 text-[#ff5500]" />
              <input
                autoFocus
                value={workerSearch}
                onChange={(event) => setWorkerSearch(event.target.value)}
                placeholder={tr(
                  "Search by name, designation or area...",
                  "പേര്, പദവി അല്ലെങ്കിൽ പ്രദേശം തിരയുക...",
                )}
                className="min-w-0 flex-1 bg-transparent text-[10.5px] font-semibold text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              {workerSearch ? (
                <button
                  type="button"
                  onClick={() => setWorkerSearch("")}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label={tr("Clear search", "തിരയൽ മായ്ക്കുക")}
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto px-3.5 py-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
    grant.scopeType === "wards"
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
