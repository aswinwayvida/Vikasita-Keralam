import {
  constituencies,
  districts,
  getWardsForLocalBody,
  panchayats,
  type LocalBodyType,
} from "./geo";
import { orgHierarchyData, type OrgLevel } from "./admin-dashboard-metrics";

/* -------------------------------------------------------------------------- */
/* Assignment levels & designations                                           */
/* -------------------------------------------------------------------------- */

export type AssignmentLevel =
  | "state"
  | "region"
  | "district"
  | "mandalam"
  | "area"
  | "assembly_constituency"
  | "local_body"
  | "ward"
  | "booth"
  | "org_unit";

export interface AssignmentLevelOption {
  id: AssignmentLevel;
  en: string;
  ml: string;
  hintEn: string;
  hintMl: string;
}

export const assignmentLevels: AssignmentLevelOption[] = [
  {
    id: "state",
    en: "State",
    ml: "സംസ്ഥാനം",
    hintEn: "Kerala, statewide",
    hintMl: "കേരളം, സംസ്ഥാന വ്യാപകം",
  },
  {
    id: "district",
    en: "District",
    ml: "ജില്ല",
    hintEn: "Government district",
    hintMl: "സർക്കാർ ജില്ല",
  },
  {
    id: "assembly_constituency",
    en: "Assembly Constituency",
    ml: "നിയോജകമണ്ഡലം",
    hintEn: "District → Assembly Constituency",
    hintMl: "ജില്ല → നിയോജകമണ്ഡലം",
  },
  {
    id: "local_body",
    en: "Local Body",
    ml: "തദ്ദേശ സ്ഥാപനം",
    hintEn: "District → Local Body Type → Local Body",
    hintMl: "ജില്ല → തദ്ദേശ സ്ഥാപന തരം → തദ്ദേശ സ്ഥാപനം",
  },
  {
    id: "ward",
    en: "Ward",
    ml: "വാർഡ്",
    hintEn: "District → Local Body → Ward",
    hintMl: "ജില്ല → തദ്ദേശ സ്ഥാപനം → വാർഡ്",
  },
  {
    id: "booth",
    en: "Booth",
    ml: "ബൂത്ത്",
    hintEn: "District → Assembly Constituency → Booth",
    hintMl: "ജില്ല → നിയോജകമണ്ഡലം → ബൂത്ത്",
  },
  {
    id: "org_unit",
    en: "Party Organisational Unit",
    ml: "പാർട്ടി ഓർഗനൈസേഷണൽ യൂണിറ്റ്",
    hintEn: "Administrator-configured party hierarchy",
    hintMl: "അഡ്മിനിസ്ട്രേറ്റർ ക്രമീകരിച്ച പാർട്ടി ഘടന",
  },
];

export interface OrganisationLevelOption {
  id: AssignmentLevel;
  en: string;
  ml: string;
}

export const roleOrganisationLevels: OrganisationLevelOption[] = [
  { id: "state", en: "State", ml: "സംസ്ഥാനം" },
  { id: "region", en: "Region", ml: "റീജിയൺ" },
  { id: "district", en: "Organisational District", ml: "ഓർഗനൈസേഷണൽ ജില്ല" },
  { id: "mandalam", en: "Mandalam", ml: "മണ്ഡലം" },
  { id: "area", en: "Area", ml: "ഏരിയ" },
  { id: "booth", en: "Booth", ml: "ബൂത്ത്" },
];

export interface PartyDesignation {
  id: string;
  en: string;
  ml: string;
  level: AssignmentLevel;
}

/**
 * Administrator-configured designation register. Each designation suggests an
 * assignment level, and the level filters this list in Step 1.
 */
export const partyDesignations: PartyDesignation[] = [
  /* State */
  { id: "state-president", en: "State President", ml: "സംസ്ഥാന പ്രസിഡന്റ്", level: "state" },
  { id: "state-vice-president", en: "Vice President", ml: "വൈസ് പ്രസിഡന്റ്", level: "state" },
  {
    id: "state-general-secretary",
    en: "General Secretary",
    ml: "ജനറൽ സെക്രട്ടറി",
    level: "state",
  },
  { id: "state-secretary", en: "Secretary", ml: "സെക്രട്ടറി", level: "state" },
  { id: "state-treasurer", en: "Treasurer", ml: "ട്രഷറർ", level: "state" },
  {
    id: "state-committee-member",
    en: "Committee Member",
    ml: "കമ്മിറ്റി അംഗം",
    level: "state",
  },

  /* Region */
  {
    id: "region-president",
    en: "Regional President",
    ml: "റീജിയണൽ പ്രസിഡന്റ്",
    level: "region",
  },
  {
    id: "region-in-charge",
    en: "Regional In-charge",
    ml: "റീജിയണൽ ഇൻ-ചാർജ്",
    level: "region",
  },
  {
    id: "region-coordinator",
    en: "Regional Coordinator",
    ml: "റീജിയണൽ കോർഡിനേറ്റർ",
    level: "region",
  },

  /* Organisational District */
  {
    id: "district-president",
    en: "District President",
    ml: "ജില്ലാ പ്രസിഡന്റ്",
    level: "district",
  },
  {
    id: "district-vice-president",
    en: "Vice President",
    ml: "വൈസ് പ്രസിഡന്റ്",
    level: "district",
  },
  {
    id: "district-general-secretary",
    en: "General Secretary",
    ml: "ജനറൽ സെക്രട്ടറി",
    level: "district",
  },
  {
    id: "district-secretary",
    en: "Secretary",
    ml: "സെക്രട്ടറി",
    level: "district",
  },
  {
    id: "district-treasurer",
    en: "Treasurer",
    ml: "ട്രഷറർ",
    level: "district",
  },
  {
    id: "district-committee-member",
    en: "Committee Member",
    ml: "കമ്മിറ്റി അംഗം",
    level: "district",
  },

  /* Mandalam */
  {
    id: "mandalam-president",
    en: "Mandalam President",
    ml: "മണ്ഡലം പ്രസിഡന്റ്",
    level: "mandalam",
  },
  {
    id: "mandalam-vice-president",
    en: "Vice President",
    ml: "വൈസ് പ്രസിഡന്റ്",
    level: "mandalam",
  },
  {
    id: "mandalam-general-secretary",
    en: "General Secretary",
    ml: "ജനറൽ സെക്രട്ടറി",
    level: "mandalam",
  },
  {
    id: "mandalam-secretary",
    en: "Secretary",
    ml: "സെക്രട്ടറി",
    level: "mandalam",
  },
  {
    id: "mandalam-treasurer",
    en: "Treasurer",
    ml: "ട്രഷറർ",
    level: "mandalam",
  },
  {
    id: "mandalam-committee-member",
    en: "Committee Member",
    ml: "കമ്മിറ്റി അംഗം",
    level: "mandalam",
  },

  /* Area */
  { id: "area-president", en: "Area President", ml: "ഏരിയ പ്രസിഡന്റ്", level: "area" },
  { id: "area-secretary", en: "Area Secretary", ml: "ഏരിയ സെക്രട്ടറി", level: "area" },
  {
    id: "area-coordinator",
    en: "Area Coordinator",
    ml: "ഏരിയ കോർഡിനേറ്റർ",
    level: "area",
  },
  {
    id: "area-committee-member",
    en: "Committee Member",
    ml: "കമ്മിറ്റി അംഗം",
    level: "area",
  },

  /* Booth */
  {
    id: "booth-president",
    en: "Booth President",
    ml: "ബൂത്ത് പ്രസിഡന്റ്",
    level: "booth",
  },
  {
    id: "booth-secretary",
    en: "Booth Secretary",
    ml: "ബൂത്ത് സെക്രട്ടറി",
    level: "booth",
  },
  { id: "booth-agent", en: "Booth Agent", ml: "ബൂത്ത് ഏജന്റ്", level: "booth" },
  {
    id: "booth-committee-member",
    en: "Booth Committee Member",
    ml: "ബൂത്ത് കമ്മിറ്റി അംഗം",
    level: "booth",
  },
  { id: "karyakarta", en: "Karyakarta", ml: "കാര്യകർത്താവ്", level: "booth" },

  /* Legacy levels kept for existing records and worker filters */
  {
    id: "constituency-president",
    en: "Constituency President",
    ml: "നിയോജകമണ്ഡലം പ്രസിഡന്റ്",
    level: "assembly_constituency",
  },
  {
    id: "constituency-in-charge",
    en: "Constituency In-Charge",
    ml: "നിയോജകമണ്ഡലം ഇൻ-ചാർജ്",
    level: "assembly_constituency",
  },
  {
    id: "constituency-coordinator",
    en: "Constituency Coordinator",
    ml: "നിയോജകമണ്ഡലം കോർഡിനേറ്റർ",
    level: "assembly_constituency",
  },
  {
    id: "local-body-president",
    en: "Local Body President",
    ml: "തദ്ദേശ സ്ഥാപന പ്രസിഡന്റ്",
    level: "local_body",
  },
  {
    id: "local-body-convener",
    en: "Local Body Convener",
    ml: "തദ്ദേശ സ്ഥാപന കൺവീനർ",
    level: "local_body",
  },
  {
    id: "panchayat-convener",
    en: "Panchayat Convener",
    ml: "പഞ്ചായത്ത് കൺവീനർ",
    level: "local_body",
  },
  { id: "ward-president", en: "Ward President", ml: "വാർഡ് പ്രസിഡന്റ്", level: "ward" },
  { id: "ward-lead", en: "Ward Lead", ml: "വാർഡ് ലീഡ്", level: "ward" },
  { id: "ward-in-charge", en: "Ward In-Charge", ml: "വാർഡ് ഇൻ-ചാർജ്", level: "ward" },
  {
    id: "mandalam-in-charge",
    en: "Mandalam In-Charge",
    ml: "മണ്ഡലം ഇൻ-ചാർജ്",
    level: "org_unit",
  },
  {
    id: "mandalam-coordinator",
    en: "Mandalam Coordinator",
    ml: "മണ്ഡലം കോർഡിനേറ്റർ",
    level: "org_unit",
  },
];

export function designationsForLevel(level: AssignmentLevel | "") {
  if (!level) return partyDesignations;
  return partyDesignations.filter((designation) => designation.level === level);
}

export const localBodyTypeOptions: { id: LocalBodyType; en: string; ml: string }[] = [
  { id: "corporation", en: "Corporation", ml: "കോർപ്പറേഷൻ" },
  { id: "municipality", en: "Municipality", ml: "മുനിസിപ്പാലിറ്റി" },
  { id: "panchayat", en: "Grama Panchayat", ml: "ഗ്രാമ പഞ്ചായത്ത്" },
];

/* -------------------------------------------------------------------------- */
/* Booth register (configured per assembly constituency)                      */
/* -------------------------------------------------------------------------- */

export interface PartyBooth {
  id: string;
  districtId: string;
  constituencyId: string;
  number: number;
  nameEn: string;
  nameMl: string;
}

const boothVenues = [
  { en: "Govt. LP School", ml: "ഗവ. എൽ.പി. സ്കൂൾ" },
  { en: "Govt. UP School", ml: "ഗവ. യു.പി. സ്കൂൾ" },
  { en: "Community Hall", ml: "കമ്മ്യൂണിറ്റി ഹാൾ" },
  { en: "Govt. Higher Secondary School", ml: "ഗവ. ഹയർ സെക്കൻഡറി സ്കൂൾ" },
  { en: "Panchayat Office Hall", ml: "പഞ്ചായത്ത് ഓഫീസ് ഹാൾ" },
  { en: "Library Reading Room", ml: "ലൈബ്രറി റീഡിംഗ് റൂം" },
];

/**
 * Booth numbers are scoped to an assembly constituency. Booths are deliberately
 * NOT derived from wards or local bodies: the app does not model one continuous
 * ward -> booth hierarchy.
 */
export const boothDirectory: PartyBooth[] = constituencies.flatMap((constituency, cIndex) =>
  Array.from({ length: 6 }, (_, boothIndex) => {
    const number = boothIndex + 1;
    const venue = boothVenues[(cIndex + boothIndex) % boothVenues.length];
    return {
      id: `${constituency.id}-booth-${number}`,
      districtId: constituency.districtId,
      constituencyId: constituency.id,
      number,
      nameEn: `Booth ${number} — ${venue.en}, ${constituency.en}`,
      nameMl: `ബൂത്ത് ${number} — ${venue.ml}, ${constituency.ml}`,
    };
  }),
);

export function getBoothsForConstituency(constituencyId: string) {
  return boothDirectory.filter((booth) => booth.constituencyId === constituencyId);
}

export function getLocalBodies(districtId: string, type: LocalBodyType | "") {
  if (!districtId || !type) return [];
  return panchayats.filter((body) => body.districtId === districtId && body.type === type);
}

/* -------------------------------------------------------------------------- */
/* Party organisational hierarchy                                             */
/* -------------------------------------------------------------------------- */

const orgLevelLabels: Record<OrgLevel, { en: string; ml: string }> = {
  STATE: { en: "Party State", ml: "പാർട്ടി സംസ്ഥാനം" },
  REGION: { en: "Party Region", ml: "പാർട്ടി റീജിയൺ" },
  DISTRICT: { en: "Party District", ml: "പാർട്ടി ജില്ല" },
  MANDALAM: { en: "Mandalam", ml: "മണ്ഡലം" },
  AREA: { en: "Party Area", ml: "പാർട്ടി ഏരിയ" },
  BOOTH: { en: "Party Booth", ml: "പാർട്ടി ബൂത്ത്" },
};

export function getOrgLevelLabel(level: OrgLevel, lang: "en" | "ml") {
  return orgLevelLabels[level][lang];
}

export function getPartyOrgPath(unitId: string, lang: "en" | "ml") {
  const node = orgHierarchyData.find((item) => item.id === unitId);
  if (!node) return "";
  const path: string[] = [node.name];
  let parentId = node.parentId;
  while (parentId) {
    const parent = orgHierarchyData.find((item) => item.id === parentId);
    if (!parent) break;
    path.unshift(parent.name);
    parentId = parent.parentId;
  }
  const joined = path.join(" › ");
  return lang === "ml" ? `${getOrgLevelLabel(node.level, "ml")} · ${joined}` : joined;
}

/* -------------------------------------------------------------------------- */
/* Permissions                                                                */
/* -------------------------------------------------------------------------- */

export type PermissionModuleId =
  "schemes" | "party_workers" | "applications" | "help_desk" | "applicant_profile";

export interface PermissionActionOption {
  id: string;
  en: string;
  ml: string;
  helpEn: string;
  helpMl: string;
  verbEn: string;
  verbMl: string;
}

export interface PermissionModule {
  id: PermissionModuleId;
  en: string;
  ml: string;
  descriptionEn: string;
  descriptionMl: string;
  actions: PermissionActionOption[];
}

export const permissionModules: PermissionModule[] = [
  {
    id: "schemes",
    en: "Schemes",
    ml: "പദ്ധതികൾ",
    descriptionEn: "Scheme catalogue and scheme detail visibility",
    descriptionMl: "പദ്ധതി കാറ്റലോഗും വിശദാംശങ്ങളും",
    actions: [
      {
        id: "view_list",
        en: "View List",
        ml: "പട്ടിക കാണുക",
        helpEn: "See the scheme list",
        helpMl: "പദ്ധതി പട്ടിക കാണാം",
        verbEn: "view the scheme list",
        verbMl: "പദ്ധതി പട്ടിക കാണാൻ",
      },
      {
        id: "view_details",
        en: "View Details",
        ml: "വിശദാംശങ്ങൾ കാണുക",
        helpEn: "Open scheme details and eligibility",
        helpMl: "പദ്ധതി വിശദാംശങ്ങൾ കാണാം",
        verbEn: "view scheme details",
        verbMl: "പദ്ധതി വിശദാംശങ്ങൾ കാണാൻ",
      },
      {
        id: "create",
        en: "Create",
        ml: "സൃഷ്ടിക്കുക",
        helpEn: "Add a scheme to the shared catalogue",
        helpMl: "പങ്കിട്ട കാറ്റലോഗിൽ പദ്ധതി ചേർക്കാം",
        verbEn: "create schemes",
        verbMl: "പദ്ധതികൾ സൃഷ്ടിക്കാൻ",
      },
      {
        id: "edit",
        en: "Edit",
        ml: "തിരുത്തുക",
        helpEn: "Edit a shared scheme (catalogue management)",
        helpMl: "പങ്കിട്ട പദ്ധതി തിരുത്താം (കാറ്റലോഗ് മാനേജ്മെന്റ്)",
        verbEn: "edit shared schemes",
        verbMl: "പങ്കിട്ട പദ്ധതികൾ തിരുത്താൻ",
      },
    ],
  },
  {
    id: "party_workers",
    en: "Users",
    ml: "ഉപയോക്താക്കൾ",
    descriptionEn: "Worker records, teams and account status",
    descriptionMl: "പ്രവർത്തക റെക്കോർഡുകൾ, ടീമുകൾ, അക്കൗണ്ട് നില",
    actions: [
      {
        id: "view",
        en: "View",
        ml: "കാണുക",
        helpEn: "Open worker profiles",
        helpMl: "പ്രവർത്തക പ്രൊഫൈൽ കാണാം",
        verbEn: "view users",
        verbMl: "ഉപയോക്താക്കളെ കാണാൻ",
      },
      {
        id: "create",
        en: "Create",
        ml: "സൃഷ്ടിക്കുക",
        helpEn: "Register new workers",
        helpMl: "പുതിയ പ്രവർത്തകരെ ചേർക്കാം",
        verbEn: "create users",
        verbMl: "ഉപയോക്താക്കളെ സൃഷ്ടിക്കാൻ",
      },
      {
        id: "edit",
        en: "Edit",
        ml: "തിരുത്തുക",
        helpEn: "Edit worker details",
        helpMl: "പ്രവർത്തക വിവരങ്ങൾ തിരുത്താം",
        verbEn: "edit users",
        verbMl: "ഉപയോക്താക്കളെ തിരുത്താൻ",
      },
      {
        id: "view_teams",
        en: "View Teams",
        ml: "ടീമുകൾ കാണുക",
        helpEn: "See team membership",
        helpMl: "ടീം അംഗത്വം കാണാം",
        verbEn: "view teams",
        verbMl: "ടീമുകൾ കാണാൻ",
      },
    ],
  },
  {
    id: "applications",
    en: "Applications",
    ml: "അപേക്ഷകൾ",
    descriptionEn: "Application workflow, documents and official decisions",
    descriptionMl: "അപേക്ഷ വർക്ക്ഫ്ലോ, രേഖകൾ, ഔദ്യോഗിക തീരുമാനങ്ങൾ",
    actions: [
      {
        id: "view",
        en: "View",
        ml: "കാണുക",
        helpEn: "Open applications",
        helpMl: "അപേക്ഷകൾ കാണാം",
        verbEn: "view applications",
        verbMl: "അപേക്ഷകൾ കാണാൻ",
      },
      {
        id: "create",
        en: "Create",
        ml: "സൃഷ്ടിക്കുക",
        helpEn: "Start new applications",
        helpMl: "പുതിയ അപേക്ഷകൾ തുടങ്ങാം",
        verbEn: "create applications",
        verbMl: "അപേക്ഷകൾ സൃഷ്ടിക്കാൻ",
      },
      {
        id: "edit",
        en: "Edit",
        ml: "തിരുത്തുക",
        helpEn: "Edit application details",
        helpMl: "അപേക്ഷ വിവരങ്ങൾ തിരുത്താം",
        verbEn: "edit applications",
        verbMl: "അപേക്ഷകൾ തിരുത്താൻ",
      },
    ],
  },
  {
    id: "help_desk",
    en: "Help Desk",
    ml: "ഹെൽപ്പ് ഡെസ്ക്",
    descriptionEn: "Citizen help requests and team assignment",
    descriptionMl: "പൗര സഹായ അഭ്യർത്ഥനകളും ടീം അസൈൻമെന്റും",
    actions: [
      {
        id: "view",
        en: "View",
        ml: "കാണുക",
        helpEn: "Open help desk requests",
        helpMl: "ഹെൽപ്പ് ഡെസ്ക് അഭ്യർത്ഥനകൾ കാണാം",
        verbEn: "view help desk requests",
        verbMl: "ഹെൽപ്പ് ഡെസ്ക് അഭ്യർത്ഥനകൾ കാണാൻ",
      },
      {
        id: "assign_team_member",
        en: "Assign to Team Member",
        ml: "ടീം അംഗത്തിന് നൽകുക",
        helpEn: "Assign a help desk request to a team member",
        helpMl: "ഹെൽപ്പ് ഡെസ്ക് അഭ്യർത്ഥന ഒരു ടീം അംഗത്തിന് നൽകാം",
        verbEn: "assign help desk requests to team members",
        verbMl: "ഹെൽപ്പ് ഡെസ്ക് അഭ്യർത്ഥനകൾ ടീം അംഗങ്ങൾക്ക് നൽകാൻ",
      },
    ],
  },
  {
    id: "applicant_profile",
    en: "Applicant Profile",
    ml: "അപേക്ഷക പ്രൊഫൈൽ",
    descriptionEn: "Applicant records and profile management",
    descriptionMl: "അപേക്ഷക റെക്കോർഡുകളും പ്രൊഫൈൽ മാനേജ്മെന്റും",
    actions: [
      {
        id: "create",
        en: "Create",
        ml: "സൃഷ്ടിക്കുക",
        helpEn: "Create applicant profiles",
        helpMl: "അപേക്ഷക പ്രൊഫൈലുകൾ സൃഷ്ടിക്കാം",
        verbEn: "create applicant profiles",
        verbMl: "അപേക്ഷക പ്രൊഫൈലുകൾ സൃഷ്ടിക്കാൻ",
      },
      {
        id: "edit",
        en: "Edit",
        ml: "തിരുത്തുക",
        helpEn: "Edit applicant profile details",
        helpMl: "അപേക്ഷക പ്രൊഫൈൽ വിവരങ്ങൾ തിരുത്താം",
        verbEn: "edit applicant profiles",
        verbMl: "അപേക്ഷക പ്രൊഫൈലുകൾ തിരുത്താൻ",
      },
      {
        id: "view",
        en: "View",
        ml: "കാണുക",
        helpEn: "Open applicant profiles",
        helpMl: "അപേക്ഷക പ്രൊഫൈലുകൾ കാണാം",
        verbEn: "view applicant profiles",
        verbMl: "അപേക്ഷക പ്രൊഫൈലുകൾ കാണാൻ",
      },
    ],
  },
];

export function getPermissionModule(moduleId: PermissionModuleId) {
  return permissionModules.find((module) => module.id === moduleId)!;
}

export function getPermissionAction(moduleId: PermissionModuleId, actionId: string) {
  return getPermissionModule(moduleId).actions.find((action) => action.id === actionId);
}

export function permissionKey(moduleId: PermissionModuleId, actionId: string) {
  return `${moduleId}.${actionId}`;
}

export const permissionPrerequisites: Record<string, string[]> = {
  "schemes.view_details": ["schemes.view_list"],
  "schemes.create": ["schemes.view_list", "schemes.view_details"],
  "schemes.edit": ["schemes.view_list", "schemes.view_details"],
  "party_workers.create": ["party_workers.view"],
  "party_workers.edit": ["party_workers.view"],
  "party_workers.view_teams": ["party_workers.view"],
  "applications.create": ["applications.view"],
  "applications.edit": ["applications.view"],
  "help_desk.assign_team_member": ["help_desk.view"],
  "applicant_profile.create": ["applicant_profile.view"],
  "applicant_profile.edit": ["applicant_profile.view"],
};

export function withPrerequisites(selected: string[], keys: string[]) {
  const next = new Set(selected);
  keys.forEach((key) => {
    next.add(key);
    (permissionPrerequisites[key] || []).forEach((prerequisite) => next.add(prerequisite));
  });
  return Array.from(next);
}

/** When a prerequisite is removed, remove every permission that depends on it. */
export function withoutDependentPermissions(selected: string[], removedKey: string) {
  const removed = new Set([removedKey]);
  let changed = true;
  while (changed) {
    changed = false;
    Object.entries(permissionPrerequisites).forEach(([key, prerequisites]) => {
      if (!removed.has(key) && prerequisites.some((prerequisite) => removed.has(prerequisite))) {
        removed.add(key);
        changed = true;
      }
    });
  }
  return selected.filter((key) => !removed.has(key));
}

export function togglePermission(selected: string[], key: string, enabled: boolean) {
  if (enabled) return withPrerequisites(selected, [key]);
  return withoutDependentPermissions(selected, key);
}

/* -------------------------------------------------------------------------- */
/* Role presets                                                               */
/* -------------------------------------------------------------------------- */

export type RolePresetId =
  | "state_admin"
  | "district_admin"
  | "constituency_admin"
  | "local_body_admin"
  | "booth_admin"
  | "party_worker"
  | "custom";

export interface RolePreset {
  id: RolePresetId;
  en: string;
  ml: string;
  descriptionEn: string;
  descriptionMl: string;
  permissions: string[];
}

const keys = (moduleId: PermissionModuleId, actionIds: string[]) =>
  actionIds.map((actionId) => permissionKey(moduleId, actionId));

export const rolePresets: RolePreset[] = [
  {
    id: "state_admin",
    en: "State Admin",
    ml: "സംസ്ഥാന അഡ്മിൻ",
    descriptionEn: "Full module access for statewide administration",
    descriptionMl: "സംസ്ഥാന വ്യാപക ഭരണത്തിന് പൂർണ്ണ മൊഡ്യൂൾ ആക്സസ്",
    permissions: [
      ...keys("schemes", ["view_list", "view_details", "create", "edit"]),
      ...keys("party_workers", ["view", "create", "edit", "view_teams"]),
      ...keys("applications", ["view", "create", "edit"]),
    ],
  },
  {
    id: "district_admin",
    en: "District Admin",
    ml: "ജില്ലാ അഡ്മിൻ",
    descriptionEn: "District-level schemes, workers and applications",
    descriptionMl: "ജില്ലാതല പദ്ധതികൾ, പ്രവർത്തകർ, അപേക്ഷകൾ",
    permissions: [
      ...keys("schemes", ["view_list", "view_details"]),
      ...keys("party_workers", ["view", "create", "edit", "view_teams"]),
      ...keys("applications", ["view", "create", "edit"]),
    ],
  },
  {
    id: "constituency_admin",
    en: "Constituency Admin",
    ml: "നിയോജകമണ്ഡലം അഡ്മിൻ",
    descriptionEn: "Constituency-level worker and application workflow",
    descriptionMl: "നിയോജകമണ്ഡലതല പ്രവർത്തക, അപേക്ഷ വർക്ക്‌ഫ്ലോ",
    permissions: [
      ...keys("schemes", ["view_list", "view_details"]),
      ...keys("party_workers", ["view", "create", "edit", "view_teams"]),
      ...keys("applications", ["view", "create", "edit"]),
    ],
  },
  {
    id: "local_body_admin",
    en: "Local Body Admin",
    ml: "തദ്ദേശ സ്ഥാപന അഡ്മിൻ",
    descriptionEn: "Local body worker records and application follow-up",
    descriptionMl: "തദ്ദേശ സ്ഥാപന പ്രവർത്തക റെക്കോർഡുകളും അപേക്ഷ ഫോളോ-അപ്പും",
    permissions: [
      ...keys("schemes", ["view_list", "view_details"]),
      ...keys("party_workers", ["view", "create"]),
      ...keys("applications", ["view", "create", "edit"]),
    ],
  },
  {
    id: "booth_admin",
    en: "Booth Admin",
    ml: "ബൂത്ത് അഡ്മിൻ",
    descriptionEn: "Booth-level visibility and assisted applications",
    descriptionMl: "ബൂത്ത് തല കാഴ്ചയും സഹായ അപേക്ഷകളും",
    permissions: [
      ...keys("schemes", ["view_list", "view_details"]),
      ...keys("party_workers", ["view"]),
      ...keys("applications", ["view", "create"]),
    ],
  },
  {
    id: "party_worker",
    en: "User",
    ml: "ഉപയോക്താവ്",
    descriptionEn: "Everyday worker access: view schemes and assist applications",
    descriptionMl: "പ്രവർത്തക ആക്സസ്: പദ്ധതികൾ കാണാം, അപേക്ഷകൾ സഹായിക്കാം",
    permissions: [
      ...keys("schemes", ["view_list", "view_details"]),
      ...keys("applications", ["view", "create"]),
    ],
  },
  {
    id: "custom",
    en: "Custom",
    ml: "ഇഷ്‌ടാനുസൃതം",
    descriptionEn: "Start from the current selections and adjust each permission",
    descriptionMl: "നിലവിലെ തിരഞ്ഞെടുപ്പിൽ നിന്ന് ഓരോ അനുമതിയും ക്രമീകരിക്കാം",
    permissions: [],
  },
];

export function getRolePreset(id: RolePresetId) {
  return rolePresets.find((preset) => preset.id === id)!;
}

/* -------------------------------------------------------------------------- */
/* Delegation policy                                                          */
/* -------------------------------------------------------------------------- */

export type ActorRole = "state_admin" | "party_worker";

export interface DelegationPolicy {
  allKerala: boolean;
  accessManagement: boolean;
  actions: "*" | string[];
}

export const delegationPolicies: Record<ActorRole, DelegationPolicy> = {
  state_admin: { allKerala: true, accessManagement: true, actions: "*" },
  party_worker: { allKerala: false, accessManagement: false, actions: [] },
};

export function canDelegateAction(role: ActorRole, moduleId: PermissionModuleId, actionId: string) {
  const policy = delegationPolicies[role];
  return policy.actions === "*" || policy.actions.includes(permissionKey(moduleId, actionId));
}

export const canDelegateStatewide = (role: ActorRole) => delegationPolicies[role].allKerala;
export const canDelegateAccessManagement = (role: ActorRole) =>
  delegationPolicies[role].accessManagement;

/* -------------------------------------------------------------------------- */
/* Access grants & area scopes                                                */
/* -------------------------------------------------------------------------- */

export type ScopeType =
  "all_kerala" | "regions" | "districts" | "constituencies" | "local_bodies" | "wards" | "booths";

export interface ScopeTypeOption {
  id: ScopeType;
  en: string;
  ml: string;
}

export const partyRegions = [
  { id: "REG-SOUTH", en: "South Region", ml: "സൗത്ത് റീജിയൺ" },
  { id: "REG-CENTRAL", en: "Central Region", ml: "സെൻട്രൽ റീജിയൺ" },
  { id: "REG-NORTH", en: "North Region", ml: "നോർത്ത് റീജിയൺ" },
];

export const scopeTypeOptions: ScopeTypeOption[] = [
  { id: "all_kerala", en: "State", ml: "സംസ്ഥാനം" },
  { id: "regions", en: "Region", ml: "റീജിയൺ" },
  { id: "districts", en: "Organisational District", ml: "ഓർഗനൈസേഷണൽ ജില്ല" },
  { id: "constituencies", en: "Mandalam", ml: "മണ്ഡലം" },
  { id: "local_bodies", en: "Area", ml: "ഏരിയ" },
  { id: "wards", en: "Ward", ml: "വാർഡ്" },
  { id: "booths", en: "Booth", ml: "ബൂത്ത്" },
];

export interface AreaRef {
  id: string;
  en: string;
  ml: string;
  shortEn: string;
  shortMl: string;
  parentEn?: string;
  parentMl?: string;
}

export interface AreaFilters {
  districtIds?: string[];
  constituencyIds?: string[];
  localBodyTypes?: LocalBodyType[];
  localBodyIds?: string[];
}

export interface AccessGrant {
  id: string;
  scopeType: ScopeType;
  areas: AreaRef[];
  filters: AreaFilters;
  contextEn?: string;
  contextMl?: string;
}

/**
 * Local bodies belong to a district and have their own type. They are not
 * children of an Assembly Constituency, and a single local body can span
 * constituencies, so constituency selections must not hide local bodies.
 */
export function getFilteredLocalBodies(filters: AreaFilters) {
  return panchayats
    .filter((item) => !filters.districtIds?.length || filters.districtIds.includes(item.districtId))
    .filter(
      (item) => !filters.localBodyTypes?.length || filters.localBodyTypes.includes(item.type),
    );
}

/**
 * Returns only the areas that the selected parents actually contain. Filtering
 * narrows the choices; it never implies access to the parent itself.
 */
export function getAreaOptions(
  scopeType: ScopeType,
  filters: AreaFilters,
  lang: "en" | "ml",
): AreaRef[] {
  if (scopeType === "all_kerala") {
    return [
      {
        id: "STATE-KL",
        en: "All Kerala",
        ml: "കേരളം മുഴുവൻ",
        shortEn: "Kerala",
        shortMl: "കേരളം",
      },
    ];
  }

  if (scopeType === "regions") {
    return partyRegions.map((region) => ({
      id: region.id,
      en: region.en,
      ml: region.ml,
      shortEn: region.en,
      shortMl: region.ml,
    }));
  }

  if (scopeType === "districts") {
    return districts.map((district) => ({
      id: district.id,
      en: district.en,
      ml: district.ml,
      shortEn: district.en,
      shortMl: district.ml,
    }));
  }

  if (scopeType === "constituencies") {
    return constituencies
      .filter(
        (item) => !filters.districtIds?.length || filters.districtIds.includes(item.districtId),
      )
      .map((item) => ({
        id: item.id,
        en: item.en,
        ml: item.ml,
        shortEn: item.en,
        shortMl: item.ml,
        parentEn: districts.find((district) => district.id === item.districtId)?.en,
        parentMl: districts.find((district) => district.id === item.districtId)?.ml,
      }));
  }

  if (scopeType === "local_bodies") {
    return getFilteredLocalBodies(filters).map((item) => ({
      id: item.id,
      en: item.en,
      ml: item.ml,
      shortEn: item.en,
      shortMl: item.ml,
      parentEn: districts.find((district) => district.id === item.districtId)?.en,
      parentMl: districts.find((district) => district.id === item.districtId)?.ml,
    }));
  }

  if (scopeType === "wards") {
    const matchingLocalBodies = getFilteredLocalBodies(filters);
    const matchingIds = new Set(matchingLocalBodies.map((item) => item.id));
    const localBodyIds = filters.localBodyIds?.length
      ? filters.localBodyIds.filter((id) => matchingIds.has(id))
      : matchingLocalBodies.map((item) => item.id);
    return localBodyIds.flatMap((localBodyId) => {
      const localBody = panchayats.find((item) => item.id === localBodyId);
      return getWardsForLocalBody(localBodyId).map((ward) => ({
        id: ward.id,
        en: lang === "ml" ? ward.displayMl : ward.displayEn,
        ml: ward.displayMl,
        shortEn: `Ward ${ward.number}`,
        shortMl: `വാർഡ് ${ward.number}`,
        parentEn: localBody?.en,
        parentMl: localBody?.ml,
      }));
    });
  }

  return boothDirectory
    .filter(
      (booth) => !filters.districtIds?.length || filters.districtIds.includes(booth.districtId),
    )
    .filter(
      (booth) =>
        !filters.constituencyIds?.length || filters.constituencyIds.includes(booth.constituencyId),
    )
    .map((booth) => {
      const constituency = constituencies.find((item) => item.id === booth.constituencyId);
      return {
        id: booth.id,
        en: lang === "ml" ? booth.nameMl : booth.nameEn,
        ml: booth.nameMl,
        shortEn: `Booth ${booth.number}`,
        shortMl: `ബൂത്ത് ${booth.number}`,
        parentEn: constituency?.en,
        parentMl: constituency?.ml,
      };
    });
}

export function joinLabels(labels: string[], lang: "en" | "ml") {
  const cleaned = labels.filter(Boolean);
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) {
    return lang === "ml" ? `${cleaned[0]} ഉം ${cleaned[1]} ഉം` : `${cleaned[0]} and ${cleaned[1]}`;
  }
  const head = cleaned.slice(0, -1).join(", ");
  return lang === "ml"
    ? `${head} ഉം ${cleaned[cleaned.length - 1]} ഉം`
    : `${head} and ${cleaned[cleaned.length - 1]}`;
}

function areasForSentence(grant: AccessGrant, lang: "en" | "ml") {
  if (grant.scopeType === "all_kerala") {
    return lang === "ml" ? "കേരളം മുഴുവൻ" : "across Kerala";
  }
  const context = lang === "ml" ? grant.contextMl : grant.contextEn;
  const labels = grant.areas.map((area) => {
    const short = lang === "ml" ? area.shortMl : area.shortEn;
    const parent = lang === "ml" ? area.parentMl : area.parentEn;
    const needsParent =
      !context && (grant.scopeType === "wards" || grant.scopeType === "booths") && Boolean(parent);
    return needsParent ? `${short}, ${parent}` : short;
  });
  const areasText = joinLabels(labels, lang);
  if (grant.scopeType === "regions") {
    return lang === "ml" ? `${areasText} റീജിയണുകളിൽ` : `in ${areasText}`;
  }
  if (grant.scopeType === "districts") {
    return lang === "ml"
      ? `${areasText} ജില്ലകളിൽ`
      : `in ${areasText} ${grant.areas.length === 1 ? "district" : "districts"}`;
  }
  if (grant.scopeType === "constituencies") {
    if (lang === "ml") {
      return context ? `${context} ജില്ലയിലെ ${areasText}` : `${areasText} മണ്ഡലങ്ങളിൽ`;
    }
    const base = `in ${areasText}`;
    return context ? `${base}, ${context} district` : base;
  }
  if (grant.scopeType === "local_bodies") {
    if (lang === "ml") {
      return context ? `${context} ജില്ലയിലെ ${areasText}` : `${areasText} തദ്ദേശ സ്ഥാപനങ്ങളിൽ`;
    }
    const base = `in ${areasText}`;
    return context ? `${base}, ${context} district` : base;
  }
  if (grant.scopeType === "wards") {
    if (lang === "ml")
      return context ? `${areasText} വാർഡുകളിൽ, ${context}` : `${areasText} വാർഡുകളിൽ`;
    return context ? `in ${areasText}, ${context}` : `in ${areasText}`;
  }
  if (grant.scopeType === "booths") {
    if (lang === "en") {
      const boothNumbers = grant.areas
        .map((area) => area.shortEn.match(/^Booth\s+(.+)$/i)?.[1] || "")
        .filter(Boolean);
      const grouped =
        context && boothNumbers.length === grant.areas.length
          ? `Booths ${joinLabels(boothNumbers, lang)}`
          : areasText;
      const base = `in ${grouped}`;
      return context ? `${base}, ${context}` : base;
    }
    const base = `${areasText} ബൂത്തുകളിൽ`;
    return context ? `${base}, ${context}` : base;
  }
  return areasText;
}

/** Plain-language summary shown before saving and on saved grant cards. */
export function describeAccessGrant(grant: AccessGrant, lang: "en" | "ml") {
  const areaPhrase = areasForSentence(grant, lang);
  return lang === "ml" ? `${areaPhrase} ആക്സസ് ലഭ്യമാണ്.` : `Access ${areaPhrase}.`;
}

export function grantScopeLabel(grant: AccessGrant, lang: "en" | "ml") {
  const option = scopeTypeOptions.find((scope) => scope.id === grant.scopeType);
  return option ? (lang === "ml" ? option.ml : option.en) : grant.scopeType;
}

/**
 * Shared evaluator used by the UI and intended for server-side enforcement of
 * records, documents, exports and direct links once an API exists.
 */
export function hasScopedAccess(grant: AccessGrant | undefined, areaId?: string) {
  if (!grant) return false;
  if (grant.scopeType === "all_kerala") return true;
  if (!areaId) return false;
  return grant.areas.some((area) => area.id === areaId);
}
