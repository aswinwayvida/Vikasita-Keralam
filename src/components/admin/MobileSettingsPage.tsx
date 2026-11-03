import { useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Headset,
  LogOut,
  MapPin,
  MoreVertical,
  Pencil,
  ShieldCheck,
  UserRound,
  Users2,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MobileRolesPage } from "@/components/admin/MobileRolesPage";
import { useLang } from "@/i18n/LanguageProvider";
import {
  permissionKey,
  permissionModules,
  rolePresets,
  type PermissionModuleId,
} from "@/data/party-workers";

interface MobileSettingsPageProps {
  userRole: "state_admin" | "party_worker";
  onBack: () => void;
  onLogout: () => void;
  onImmersiveChange?: (immersive: boolean) => void;
}

const profileOrganisationLevels = [
  { id: "state", en: "State", ml: "സംസ്ഥാനം" },
  { id: "region", en: "Region", ml: "മേഖല" },
  { id: "district", en: "Organisational District", ml: "ഓർഗനൈസേഷണൽ ജില്ല" },
  { id: "mandalam", en: "Mandalam", ml: "മണ്ഡലം" },
  { id: "area", en: "Area", ml: "ഏരിയ" },
  { id: "booth", en: "Booth", ml: "ബൂത്ത്" },
] as const;

export function MobileSettingsPage({
  userRole,
  onBack,
  onLogout,
  onImmersiveChange,
}: MobileSettingsPageProps) {
  const { lang, setLang } = useLang();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeView, setActiveView] = useState<"settings" | "roles" | "user">("settings");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileNameOverride, setProfileNameOverride] = useState<string | null>(null);
  const [profileRoleOverride, setProfileRoleOverride] = useState<string | null>(null);
  const [profileMobileOverride, setProfileMobileOverride] = useState<string | null>(null);
  const [profileLevelOverride, setProfileLevelOverride] = useState<string | null>(null);
  const [profileAssignmentOverride, setProfileAssignmentOverride] = useState<string | null>(null);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [accessAreaOpen, setAccessAreaOpen] = useState(false);
  const [editDraft, setEditDraft] = useState({ name: "", role: "", mobile: "" });
  const [accessDraft, setAccessDraft] = useState({ level: "state", assignment: "" });
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const isMalayalam = lang === "ml";
  const isPartyWorker = userRole === "party_worker";
  const defaultDisplayName = isPartyWorker ? "Dhyan M S" : "Jayasurya";
  const defaultRoleLabel = isPartyWorker
    ? isMalayalam
      ? "ഏരിയ പ്രസിഡന്റ്"
      : "Area President"
    : isMalayalam
      ? "സംസ്ഥാന ഭരണം"
      : "State Admin";
  const displayName = profileNameOverride ?? defaultDisplayName;
  const roleLabel = profileRoleOverride ?? defaultRoleLabel;
  const profileMobile = profileMobileOverride ?? "+91 98470 12345";
  const defaultProfileLevelId = isPartyWorker ? "area" : "state";
  const currentProfileLevelId = profileLevelOverride ?? defaultProfileLevelId;
  const placeLabel = isMalayalam ? "കഴക്കൂട്ടം, തിരുവനന്തപുരം" : "Kazhakkoottam, Trivandrum";
  const defaultProfileAssignment = isPartyWorker
    ? placeLabel
    : isMalayalam
      ? "കേരളം, സംസ്ഥാന വ്യാപകം"
      : "Kerala, statewide";
  const profileAssignment = profileAssignmentOverride ?? defaultProfileAssignment;
  const profileLevelLabel =
    profileOrganisationLevels.find((level) => level.id === currentProfileLevelId) ??
    profileOrganisationLevels[0];
  const avatarUrl = isPartyWorker
    ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    : "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80";

  const handleProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const openEditDetails = () => {
    setEditDraft({ name: displayName, role: roleLabel, mobile: profileMobile });
    setProfileMenuOpen(false);
    setEditDetailsOpen(true);
  };

  const saveEditDetails = () => {
    const name = editDraft.name.trim();
    if (!name) return;
    setProfileNameOverride(name);
    setProfileRoleOverride(editDraft.role.trim() || defaultRoleLabel);
    setProfileMobileOverride(editDraft.mobile.trim() || null);
    setEditDetailsOpen(false);
  };

  const openAccessArea = () => {
    setAccessDraft({ level: currentProfileLevelId, assignment: profileAssignment });
    setProfileMenuOpen(false);
    setAccessAreaOpen(true);
  };

  const saveAccessArea = () => {
    setProfileLevelOverride(accessDraft.level);
    setProfileAssignmentOverride(accessDraft.assignment.trim() || defaultProfileAssignment);
    setAccessAreaOpen(false);
  };

  if (activeView === "roles") {
    return (
      <MobileRolesPage
        onBack={() => setActiveView("settings")}
        onFormOpenChange={onImmersiveChange}
      />
    );
  }

  if (activeView === "user") {
    const presetId = isPartyWorker ? "party_worker" : "state_admin";
    const grantedPermissions =
      rolePresets.find((preset) => preset.id === presetId)?.permissions ?? [];
    const profileDistrict = isPartyWorker
      ? isMalayalam
        ? "തിരുവനന്തപുരം"
        : "Thiruvananthapuram"
      : isMalayalam
        ? "എല്ലാ ജില്ലകളും"
        : "All districts";

    return (
      <div className="relative flex h-full min-h-0 w-full flex-col animate-in fade-in duration-200">
        <header className="relative z-20 flex h-10 shrink-0 items-center justify-center border-b border-border/70 px-3">
          <button
            type="button"
            onClick={() => setActiveView("settings")}
            className="absolute left-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#fff7ec] text-[#1b255a] transition-colors hover:bg-orange-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer"
            aria-label={isMalayalam ? "ക്രമീകരണങ്ങളിലേക്ക് മടങ്ങുക" : "Back to settings"}
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
          </button>
          <h1 className="text-[13px] font-extrabold tracking-tight text-[#152153] dark:text-white">
            {isMalayalam ? "ഉപയോക്തൃ പ്രൊഫൈൽ" : "User Profile"}
          </h1>
          <div className="absolute right-0">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#1b255a] transition-colors hover:bg-orange-100 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
              aria-label={isMalayalam ? "ഉപയോക്തൃ ആക്ഷനുകൾ" : "User actions"}
              aria-expanded={profileMenuOpen}
            >
              <MoreVertical className="h-4 w-4 stroke-[2.3]" />
            </button>
            {profileMenuOpen ? (
              <div className="absolute right-0 top-9 z-30 w-56 overflow-hidden rounded-xl border border-orange-100 bg-white p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150 dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    profilePhotoInputRef.current?.click();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10.5px] font-bold text-slate-700 transition hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Camera className="h-3.5 w-3.5 shrink-0 text-[#C2410C] dark:text-orange-300" />
                  {isMalayalam ? "പ്രൊഫൈൽ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക" : "Upload Profile picture"}
                </button>
                <button
                  type="button"
                  onClick={openEditDetails}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10.5px] font-bold text-slate-700 transition hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-[#C2410C] dark:text-orange-300" />
                  {isMalayalam ? "വിവരങ്ങൾ തിരുത്തുക" : "Edit Details"}
                </button>
                <button
                  type="button"
                  onClick={openAccessArea}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10.5px] font-bold text-slate-700 transition hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C2410C] dark:text-orange-300" />
                  {isMalayalam ? "ആക്സസ് പ്രദേശം മാറ്റുക" : "Change access area"}
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pb-2 [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <section className="mt-2 divide-y divide-orange-100/80 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
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
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-orange-50 shadow-sm ring-2 ring-white dark:bg-slate-800 dark:ring-slate-900">
                    <img
                      src={profilePhoto || avatarUrl}
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5500] text-white shadow-md ring-2 ring-white transition active:scale-95 dark:ring-slate-900"
                    aria-label={
                      isMalayalam ? "പ്രൊഫൈൽ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക" : "Upload profile picture"
                    }
                    title={
                      isMalayalam ? "പ്രൊഫൈൽ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക" : "Upload profile picture"
                    }
                  >
                    <Camera className="h-2.5 w-2.5 stroke-[2.5]" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-[15px] font-extrabold leading-tight text-slate-900 dark:text-white">
                      {displayName}
                    </h2>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {isMalayalam ? "സജീവം" : "Active"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] font-bold text-[#C2410C] dark:text-orange-300">
                    {roleLabel}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-700 dark:bg-slate-800/40">
                <SummaryRow
                  label={isMalayalam ? "ലെവൽ" : "Level"}
                  value={isMalayalam ? profileLevelLabel.ml : profileLevelLabel.en}
                />
                <SummaryRow
                  label={isMalayalam ? "അസൈൻമെന്റ്" : "Assignment"}
                  value={profileAssignment}
                />
                <SummaryRow label={isMalayalam ? "മൊബൈൽ" : "Mobile"} value={profileMobile} />
                <SummaryRow label={isMalayalam ? "ജില്ല" : "District"} value={profileDistrict} />
              </div>
            </div>

            <div className="px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#ff5500] dark:bg-orange-950/40 dark:text-orange-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-extrabold leading-tight text-slate-900 dark:text-white">
                      {isMalayalam ? "അനുമതികൾ" : "Permissions"}
                    </p>
                    <p className="mt-px text-[8.5px] font-medium text-slate-500 dark:text-slate-400">
                      {isMalayalam
                        ? "ഈ പ്രവർത്തകന് നൽകിയ ആക്സസ്"
                        : "Access assigned to this worker"}
                    </p>
                  </div>
                </div>
              </div>

              <ProfileModulePermissionsTable
                grantedPermissions={grantedPermissions}
                isMalayalam={isMalayalam}
              />
            </div>

            <div className="p-3">
              <ProfileSectionHeading
                icon={MapPin}
                title={isMalayalam ? "ആക്സസ് പ്രദേശങ്ങൾ" : "Access Areas"}
                subtitle={
                  isMalayalam
                    ? "പ്രവർത്തകനൊപ്പം സൂക്ഷിച്ച സ്കോപ്പ് ഗ്രാന്റുകൾ"
                    : "Scoped grants saved with the worker"
                }
              />
              <div className="mt-2.5 space-y-2">
                <p className="rounded-xl border border-dashed border-slate-200 px-3 py-3 text-center text-[9.5px] font-semibold text-slate-500 dark:border-slate-700">
                  {isMalayalam
                    ? "അധിക ആക്സസ് പ്രദേശങ്ങളില്ല. അസൈൻമെന്റിൽ മാത്രം ആക്സസ്."
                    : "No extra access areas. Access is limited to the assignment."}
                </p>
              </div>
            </div>
          </section>
        </div>

        {editDetailsOpen ? (
          <div
            className="absolute inset-0 z-[120] flex items-end bg-slate-950/50 backdrop-blur-[1px] animate-in fade-in duration-150"
            onClick={() => setEditDetailsOpen(false)}
          >
            <div
              className="w-full rounded-t-2xl border-t border-orange-100 bg-white shadow-2xl animate-in slide-in-from-bottom duration-200 dark:border-slate-800 dark:bg-slate-900"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 pb-3 pt-3">
                <div>
                  <h3 className="text-[13px] font-extrabold text-foreground">
                    {isMalayalam ? "വിവരങ്ങൾ തിരുത്തുക" : "Edit Details"}
                  </h3>
                  <p className="mt-0.5 text-[9.5px] font-medium text-muted-foreground">
                    {isMalayalam
                      ? "ഉപയോക്താവിന്റെ അടിസ്ഥാന വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്യുക."
                      : "Update this user's basic details."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditDetailsOpen(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:bg-slate-800 dark:hover:bg-slate-700"
                  aria-label={isMalayalam ? "അടയ്ക്കുക" : "Close"}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3 px-4 py-3">
                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-foreground">
                    {isMalayalam ? "പൂർണ്ണ പേര്" : "Full Name"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    autoFocus
                    value={editDraft.name}
                    onChange={(event) =>
                      setEditDraft((draft) => ({ ...draft, name: event.target.value }))
                    }
                    className="h-9 rounded-lg border-border bg-background px-2.5 text-[11.5px] font-medium text-foreground shadow-none focus:border-orange-400 focus:ring-1 focus:ring-orange-500 md:text-[11.5px]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-foreground">
                    {isMalayalam ? "പദവി / റോൾ" : "Designation / Role"}
                  </label>
                  <Input
                    value={editDraft.role}
                    onChange={(event) =>
                      setEditDraft((draft) => ({ ...draft, role: event.target.value }))
                    }
                    className="h-9 rounded-lg border-border bg-background px-2.5 text-[11.5px] font-medium text-foreground shadow-none focus:border-orange-400 focus:ring-1 focus:ring-orange-500 md:text-[11.5px]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-foreground">
                    {isMalayalam ? "മൊബൈൽ നമ്പർ" : "Mobile Number"}
                  </label>
                  <Input
                    value={editDraft.mobile}
                    inputMode="tel"
                    onChange={(event) =>
                      setEditDraft((draft) => ({ ...draft, mobile: event.target.value }))
                    }
                    className="h-9 rounded-lg border-border bg-background px-2.5 text-[11.5px] font-medium text-foreground shadow-none focus:border-orange-400 focus:ring-1 focus:ring-orange-500 md:text-[11.5px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-border/70 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
                <button
                  type="button"
                  onClick={() => setEditDetailsOpen(false)}
                  className="h-10 w-[35%] shrink-0 rounded-lg border border-orange-200 bg-white px-3 text-[10.5px] font-extrabold text-orange-700 transition-colors hover:bg-orange-50 dark:border-orange-900/60 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-orange-950/40"
                >
                  {isMalayalam ? "റദ്ദാക്കുക" : "Cancel"}
                </button>
                <Button
                  type="button"
                  onClick={saveEditDetails}
                  className="h-10 flex-1 rounded-lg text-[11.5px] font-extrabold"
                >
                  {isMalayalam ? "സേവ് ചെയ്യുക" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {accessAreaOpen ? (
          <div
            className="absolute inset-0 z-[120] flex items-end bg-slate-950/50 backdrop-blur-[1px] animate-in fade-in duration-150"
            onClick={() => setAccessAreaOpen(false)}
          >
            <div
              className="w-full rounded-t-2xl border-t border-orange-100 bg-white shadow-2xl animate-in slide-in-from-bottom duration-200 dark:border-slate-800 dark:bg-slate-900"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 pb-3 pt-3">
                <div>
                  <h3 className="text-[13px] font-extrabold text-foreground">
                    {isMalayalam ? "ആക്സസ് പ്രദേശം മാറ്റുക" : "Change Access Area"}
                  </h3>
                  <p className="mt-0.5 text-[9.5px] font-medium text-muted-foreground">
                    {isMalayalam
                      ? "ഓർഗനൈസേഷൻ ലെവലും ആക്സസ് പ്രദേശവും അപ്ഡേറ്റ് ചെയ്യുക."
                      : "Update the organisation level and access area."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAccessAreaOpen(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:bg-slate-800 dark:hover:bg-slate-700"
                  aria-label={isMalayalam ? "അടയ്ക്കുക" : "Close"}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3 px-4 py-3">
                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-foreground">
                    {isMalayalam ? "ഓർഗനൈസേഷൻ ലെവൽ" : "Organisation Level"}
                  </label>
                  <div className="relative">
                    <select
                      value={accessDraft.level}
                      onChange={(event) =>
                        setAccessDraft((draft) => ({ ...draft, level: event.target.value }))
                      }
                      className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-border bg-background px-2.5 pr-8 text-[11.5px] font-medium text-foreground outline-none transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-500"
                    >
                      {profileOrganisationLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {isMalayalam ? level.ml : level.en}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-foreground">
                    {isMalayalam ? "ആക്സസ് പ്രദേശം" : "Access Area"}
                  </label>
                  <Input
                    value={accessDraft.assignment}
                    onChange={(event) =>
                      setAccessDraft((draft) => ({ ...draft, assignment: event.target.value }))
                    }
                    placeholder={
                      isMalayalam ? "ഉദാ: കേരളം, സംസ്ഥാന വ്യാപകം" : "e.g. Kerala, statewide"
                    }
                    className="h-9 rounded-lg border-border bg-background px-2.5 text-[11.5px] font-medium text-foreground shadow-none focus:border-orange-400 focus:ring-1 focus:ring-orange-500 md:text-[11.5px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-border/70 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
                <button
                  type="button"
                  onClick={() => setAccessAreaOpen(false)}
                  className="h-10 w-[35%] shrink-0 rounded-lg border border-orange-200 bg-white px-3 text-[10.5px] font-extrabold text-orange-700 transition-colors hover:bg-orange-50 dark:border-orange-900/60 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-orange-950/40"
                >
                  {isMalayalam ? "റദ്ദാക്കുക" : "Cancel"}
                </button>
                <Button
                  type="button"
                  onClick={saveAccessArea}
                  className="h-10 flex-1 rounded-lg text-[11.5px] font-extrabold"
                >
                  {isMalayalam ? "സേവ് ചെയ്യുക" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="pb-2 animate-in fade-in duration-200">
      <header className="relative flex h-10 items-center justify-center border-b border-border/70 px-3">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#fff7ec] text-[#1b255a] transition-colors hover:bg-orange-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 cursor-pointer"
          aria-label={isMalayalam ? "തിരികെ പോവുക" : "Go back"}
        >
          <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
        </button>
        <h1 className="text-[13px] font-extrabold tracking-tight text-[#152153] dark:text-white">
          {isMalayalam ? "ക്രമീകരണങ്ങൾ" : "Settings"}
        </h1>
      </header>

      <section className="mt-2 overflow-hidden rounded-2xl border border-orange-100 bg-card shadow-2xs dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveView("user")}
          className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-orange-50/60 dark:hover:bg-slate-800/70 cursor-pointer"
          aria-label={isMalayalam ? "ഉപയോക്തൃ പ്രൊഫൈൽ കാണുക" : "View user profile"}
        >
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-orange-100 dark:ring-slate-700"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[16px] font-extrabold tracking-tight text-[#152153] dark:text-white">
              {displayName}
            </h2>
            {isPartyWorker ? (
              <div className="mt-1 min-w-0 space-y-1">
                <span className="inline-flex max-w-full items-center rounded-full border border-orange-200/90 bg-orange-50 px-2.5 py-0.5 text-[10px] font-extrabold text-orange-700 dark:border-orange-800/70 dark:bg-orange-950/50 dark:text-orange-300">
                  <span className="truncate">{roleLabel}</span>
                </span>
                <p className="truncate text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                  {placeLabel}
                </p>
              </div>
            ) : (
              <p className="mt-0.5 truncate text-[11.5px] font-medium text-slate-500 dark:text-slate-400">
                {roleLabel}
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        </button>

        <div className="mx-4 h-px bg-orange-100 dark:bg-slate-800" />

        <button
          type="button"
          onClick={() => setLang(isMalayalam ? "en" : "ml")}
          className="flex w-full items-center justify-between gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors hover:bg-orange-50/60 dark:hover:bg-slate-800/70 cursor-pointer"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60">
              <img
                src="/images/settings/language.png"
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-[11.5px] font-extrabold text-foreground">
                {isMalayalam ? "ഭാഷ" : "Language"}
              </span>
              <span className="block text-[9.5px] text-muted-foreground">
                {isMalayalam ? "ആപ്പ് പ്രദർശന ഭാഷ" : "App display language"}
              </span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-orange-100 bg-orange-50 px-2 py-1 text-[9.5px] font-black text-orange-700 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-300">
            {isMalayalam ? "മലയാളം" : "English"}
            <ChevronRight className="h-3 w-3" />
          </span>
        </button>

        <label className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60">
              <img
                src="/images/settings/notifications.png"
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-[11.5px] font-extrabold text-foreground">
                {isMalayalam ? "അറിയിപ്പുകൾ" : "Notifications"}
              </span>
              <span className="block text-[9.5px] text-muted-foreground">
                {isMalayalam
                  ? "അപേക്ഷകളും പദ്ധതികളും സംബന്ധിച്ച അപ്ഡേറ്റുകൾ"
                  : "Application and scheme updates"}
              </span>
            </span>
          </span>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
            aria-label={isMalayalam ? "അറിയിപ്പുകൾ" : "Notifications"}
          />
        </label>

        <button
          type="button"
          onClick={() => setActiveView("roles")}
          className="flex w-full items-center justify-between gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors hover:bg-orange-50/60 dark:hover:bg-slate-800/70 cursor-pointer"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60">
              <img
                src="/images/settings/roles-access.png"
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-[11.5px] font-extrabold text-foreground">
                {isMalayalam ? "റോളുകളും നിയന്ത്രണവും" : "Roles and Control"}
              </span>
              <span className="block text-[9.5px] text-muted-foreground">
                {isMalayalam
                  ? "റോളുകൾ, അനുമതികൾ, ആക്സസ് എന്നിവ നിയന്ത്രിക്കുക"
                  : "Manage roles, permissions and access"}
              </span>
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="text-[11.5px] font-extrabold">
              {isMalayalam ? "ലോഗ് ഔട്ട്" : "Log out"}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-rose-300" />
        </button>
      </section>

      <p className="pt-2 text-center text-[9px] font-semibold text-slate-400">
        Vikasita Keralam · {isMalayalam ? "പതിപ്പ്" : "Version"} 1.0.0
      </p>
    </div>
  );
}

const profileModuleIcons: Record<PermissionModuleId, LucideIcon> = {
  schemes: FileText,
  party_workers: Users2,
  applications: ClipboardList,
  help_desk: Headset,
  applicant_profile: UserRound,
};

const profilePermissionColumns = [
  { id: "create", en: "Create", ml: "സൃഷ്ടിക്കുക" },
  { id: "view", en: "View", ml: "കാണുക" },
  { id: "edit", en: "Edit", ml: "തിരുത്തുക" },
  { id: "delete", en: "Delete", ml: "നീക്കം ചെയ്യുക" },
] as const;

const profilePermissionKeyOverrides: Partial<Record<PermissionModuleId, Record<string, string[]>>> =
  {
    schemes: { view: ["view_list", "view_details"] },
  };

const profilePermissionModuleOrder: PermissionModuleId[] = [
  "applicant_profile",
  "applications",
  "help_desk",
  "schemes",
  "party_workers",
];

const orderedProfilePermissionModules = [...permissionModules].sort(
  (a, b) => profilePermissionModuleOrder.indexOf(a.id) - profilePermissionModuleOrder.indexOf(b.id),
);

const profilePermissionActionIds = new Set<string>(
  profilePermissionColumns.map((column) => column.id),
);

const profileAdditionalPermissionGroups = orderedProfilePermissionModules
  .filter((module) => module.id !== "schemes")
  .map((module) => ({
    module,
    actions: module.actions.filter((action) => !profilePermissionActionIds.has(action.id)),
  }))
  .filter((group) => group.actions.length > 0);

const profilePermissionModuleLabel = (
  module: { id: PermissionModuleId; en: string; ml: string },
  isMalayalam: boolean,
) =>
  module.id === "help_desk"
    ? isMalayalam
      ? "സപ്പോർട്ട് ഹാൻഡ്ലിംഗ്"
      : "Support Handling"
    : isMalayalam
      ? module.ml
      : module.en;

function ProfileModulePermissionsTable({
  grantedPermissions,
  isMalayalam,
}: {
  grantedPermissions: string[];
  isMalayalam: boolean;
}) {
  const grantedAdditionalPermissions = profileAdditionalPermissionGroups.flatMap(
    ({ module, actions }) =>
      actions
        .filter((action) => grantedPermissions.includes(permissionKey(module.id, action.id)))
        .map((action) => ({ module, action })),
  );
  const stateLabel = (value: "allowed" | "notAllowed" | "unavailable") =>
    value === "allowed"
      ? isMalayalam
        ? "അനുവദിച്ചിരിക്കുന്നു"
        : "Allowed"
      : value === "notAllowed"
        ? isMalayalam
          ? "അനുവദിച്ചിട്ടില്ല"
          : "Not Allowed"
        : isMalayalam
          ? "ലഭ്യമല്ല"
          : "Unavailable";

  return (
    <div className="mt-2.5">
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-[minmax(0,1fr)_36px_36px_36px_36px] items-center gap-1 bg-orange-50/70 px-2 py-2 dark:bg-slate-800/70">
          <span className="pl-1 text-[7.5px] font-black uppercase tracking-wide text-orange-700/80 dark:text-orange-300">
            {isMalayalam ? "മൊഡ്യൂൾ" : "Module"}
          </span>
          {profilePermissionColumns.map((column) => (
            <span
              key={column.id}
              className="text-center text-[7px] font-black uppercase tracking-tight text-orange-700/80 dark:text-orange-300"
            >
              {isMalayalam ? column.ml : column.en}
            </span>
          ))}
        </div>

        {orderedProfilePermissionModules.map((module) => {
          const Icon = profileModuleIcons[module.id];
          const moduleLabel = profilePermissionModuleLabel(module, isMalayalam);

          return (
            <div
              key={module.id}
              className="grid grid-cols-[minmax(0,1fr)_36px_36px_36px_36px] items-center gap-1 border-t border-slate-200/80 px-2 dark:border-slate-700"
            >
              <div className="flex min-w-0 items-start gap-1.5 py-1.5">
                <Icon className="mt-0.5 h-3 w-3 shrink-0 text-orange-600 dark:text-orange-300" />
                <span className="min-w-0 whitespace-normal break-words text-[8.5px] font-extrabold leading-snug text-foreground">
                  {moduleLabel}
                </span>
              </div>
              {profilePermissionColumns.map((column) => {
                const action = module.actions.find((item) => item.id === column.id);
                const permissionIds =
                  profilePermissionKeyOverrides[module.id]?.[column.id] ??
                  (action ? [action.id] : []);
                const available = permissionIds.length > 0;
                const checked =
                  available &&
                  permissionIds.every((id) =>
                    grantedPermissions.includes(permissionKey(module.id, id)),
                  );
                const columnLabel = isMalayalam ? column.ml : column.en;
                const status = !available
                  ? stateLabel("unavailable")
                  : checked
                    ? stateLabel("allowed")
                    : stateLabel("notAllowed");

                return (
                  <span
                    key={column.id}
                    role="img"
                    aria-label={`${moduleLabel} ${columnLabel}: ${status}`}
                    className="flex h-8 items-center justify-center"
                  >
                    {!available ? (
                      <span className="text-[11px] font-semibold text-slate-300 dark:text-slate-600">
                        —
                      </span>
                    ) : (
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border ${
                          checked
                            ? "border-[#ff5500] bg-[#ff5500] text-white"
                            : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                        }`}
                      >
                        {checked ? <Check className="h-2 w-2 stroke-[3]" /> : null}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-0.5 text-[7.5px] font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="flex h-3 w-3 items-center justify-center rounded-[3px] border border-[#ff5500] bg-[#ff5500] text-white">
            <Check className="h-2 w-2 stroke-[3]" />
          </span>
          {stateLabel("allowed")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded-[3px] border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900" />
          {stateLabel("notAllowed")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 text-center text-[10px] font-semibold text-slate-300 dark:text-slate-600">
            —
          </span>
          {stateLabel("unavailable")}
        </span>
      </div>

      {grantedAdditionalPermissions.length > 0 ? (
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="bg-orange-50/70 px-2.5 py-1.5 dark:bg-slate-800/70">
            <span className="text-[7.5px] font-black uppercase tracking-wide text-orange-700/80 dark:text-orange-300">
              {isMalayalam ? "അധിക അനുമതികൾ" : "Additional Permissions"}
            </span>
          </div>
          {grantedAdditionalPermissions.map(({ module, action }) => {
            const Icon = profileModuleIcons[module.id];
            const moduleLabel = profilePermissionModuleLabel(module, isMalayalam);
            return (
              <div
                key={`${module.id}.${action.id}`}
                className="flex items-center justify-between gap-2 border-t border-slate-200/80 px-2.5 py-1.5 dark:border-slate-700"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <Icon className="h-3 w-3 shrink-0 text-orange-600 dark:text-orange-300" />
                  <span className="min-w-0 truncate text-[8.5px] font-extrabold text-foreground">
                    {moduleLabel}
                  </span>
                  <span className="shrink-0 text-[8.5px] text-slate-400">·</span>
                  <span className="min-w-0 truncate text-[8.5px] font-semibold text-slate-600 dark:text-slate-300">
                    {isMalayalam ? action.ml : action.en}
                  </span>
                </div>
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border border-[#ff5500] bg-[#ff5500] text-white">
                  <Check className="h-2 w-2 stroke-[3]" />
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      <span className="max-w-[64%] text-right text-[9.5px] font-extrabold leading-snug text-slate-800 dark:text-slate-100">
        {value}
      </span>
    </div>
  );
}

function ProfileSectionHeading({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#ff5500] dark:bg-orange-950/40 dark:text-orange-300">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold text-slate-800 dark:text-white">{title}</p>
          <p className="mt-0.5 text-[9px] font-medium text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>
      {badge ? (
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[8.5px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
