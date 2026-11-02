import { mockUsers } from "./users";

export const partyWorkerStorageKey = "vk-party-workers";

export interface AssignablePartyWorker {
  id: string;
  name: string;
  nameMl?: string;
  mobile: string;
  designationEn: string;
  designationMl: string;
  locationEn: string;
  locationMl: string;
  districtEn: string;
  districtMl: string;
  photoUrl?: string;
}

interface StoredPartyWorker {
  id?: string;
  name?: string;
  nameMl?: string;
  mobile?: string;
  designationEn?: string;
  designationMl?: string;
  locationLines?: { en?: string; ml?: string };
  districtNameEn?: string;
  districtNameMl?: string;
  photoUrl?: string;
}

function readStoredPartyWorkers(): StoredPartyWorker[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(partyWorkerStorageKey) || "[]",
    ) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredPartyWorker[]) : [];
  } catch {
    return [];
  }
}

function normalizeStoredWorker(worker: StoredPartyWorker): AssignablePartyWorker | null {
  const mobile = (worker.mobile || "").replace(/\D/g, "");
  const name = worker.name?.trim() || worker.nameMl?.trim() || "";
  if (!name) return null;

  return {
    id: worker.id?.trim() || mobile || name,
    name,
    nameMl: worker.nameMl,
    mobile,
    designationEn: worker.designationEn || "",
    designationMl: worker.designationMl || "",
    locationEn: worker.locationLines?.en || worker.districtNameEn || "Location not recorded",
    locationMl:
      worker.locationLines?.ml ||
      worker.districtNameMl ||
      worker.locationLines?.en ||
      worker.districtNameEn ||
      "സ്ഥലം രേഖപ്പെടുത്തിയിട്ടില്ല",
    districtEn: worker.districtNameEn || "",
    districtMl: worker.districtNameMl || "",
    photoUrl: worker.photoUrl,
  };
}

export function loadAssignablePartyWorkers(): AssignablePartyWorker[] {
  const workers = new Map<string, AssignablePartyWorker>();

  const addWorker = (worker: AssignablePartyWorker | null) => {
    if (!worker) return;
    const key = worker.mobile || worker.id;
    if (!workers.has(key)) workers.set(key, worker);
  };

  readStoredPartyWorkers().forEach((worker) => addWorker(normalizeStoredWorker(worker)));

  mockUsers
    .filter((user) => user.category === "bjp_member")
    .forEach((user) =>
      addWorker({
        id: user.id,
        name: user.name,
        nameMl: user.nameMl,
        mobile: user.mobile.replace(/\D/g, ""),
        designationEn: user.designationEn,
        designationMl: user.designationMl,
        locationEn: [user.constituencyEn, user.districtNameEn].filter(Boolean).join(", "),
        locationMl: [user.constituencyMl, user.districtNameMl].filter(Boolean).join(", "),
        districtEn: user.districtNameEn,
        districtMl: user.districtNameMl,
        photoUrl: user.avatarUrl,
      }),
    );

  return Array.from(workers.values());
}
