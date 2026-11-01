import { useState } from "react";
import { ArrowLeft, ChevronRight, LogOut } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { MobileRolesPage } from "@/components/admin/MobileRolesPage";
import { useLang } from "@/i18n/LanguageProvider";

interface MobileSettingsPageProps {
  userRole: "state_admin" | "party_worker";
  onBack: () => void;
  onLogout: () => void;
  onImmersiveChange?: (immersive: boolean) => void;
}

export function MobileSettingsPage({
  userRole,
  onBack,
  onLogout,
  onImmersiveChange,
}: MobileSettingsPageProps) {
  const { lang, setLang } = useLang();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeView, setActiveView] = useState<"settings" | "roles">("settings");
  const isMalayalam = lang === "ml";
  const isPartyWorker = userRole === "party_worker";
  const displayName = isPartyWorker ? "Dhyan M S" : "Jayasurya";
  const roleLabel = isPartyWorker
    ? isMalayalam
      ? "ഏരിയ പ്രസിഡന്റ്"
      : "Area President"
    : isMalayalam
      ? "സംസ്ഥാന ഭരണം"
      : "State Administration";
  const placeLabel = isMalayalam ? "കഴക്കൂട്ടം, തിരുവനന്തപുരം" : "Kazhakkoottam, Trivandrum";
  const avatarUrl = isPartyWorker
    ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    : "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80";

  if (activeView === "roles") {
    return (
      <MobileRolesPage
        onBack={() => setActiveView("settings")}
        onFormOpenChange={onImmersiveChange}
      />
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
        <div className="flex items-center gap-3.5 px-4 py-3.5">
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
        </div>

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
