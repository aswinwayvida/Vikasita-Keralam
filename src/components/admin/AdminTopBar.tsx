import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Globe,
  LogOut,
  Moon,
  Search,
  Settings,
  Smartphone,
  Sun,
  Users,
} from "lucide-react";
import { LanguageToggle } from "@/components/public/LanguageToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import officialLotus from "@/assets/bjp-official-lotus.png";
import { setAdminTopSearchQuery, useAdminTopSearch } from "@/lib/admin-search-store";
import { AdminMobilePreviewModal } from "@/components/admin/AdminMobilePreviewModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

function getSearchPlaceholder(pathname: string, lang: "en" | "ml"): string {
  const p = pathname.toLowerCase();

  if (p === "/admin" || p === "/admin/") {
    return lang === "ml"
      ? "പൗരൻ, കേസ് ഐഡി, പദ്ധതി അല്ലെങ്കിൽ ഓർഗനൈസേഷൻ തിരയുക"
      : "Search citizen, case ID, scheme or organisation";
  }

  if (p.includes("/admin/settings") || p.includes("roles")) {
    if (typeof window !== "undefined" && window.location.search.includes("tab=designations")) {
      return lang === "ml" ? "തസ്തികകൾ തിരയുക..." : "Search designations...";
    }
    if (typeof window !== "undefined" && window.location.search.includes("tab=location")) {
      return lang === "ml" ? "സ്ഥലങ്ങൾ തിരയുക..." : "Search location...";
    }
    return lang === "ml" ? "റോളുകൾ തിരയുക..." : "Search roles...";
  }

  if (p.includes("/admin/schemes")) {
    return lang === "ml" ? "പദ്ധതികൾ തിരയുക..." : "Search schemes...";
  }

  if (p.includes("/admin/applications")) {
    return lang === "ml" ? "അപേക്ഷകൾ തിരയുക..." : "Search applications...";
  }

  if (p.includes("/admin/beneficiaries")) {
    return lang === "ml" ? "ഗുണഭോക്താക്കളെ തിരയുക..." : "Search beneficiaries...";
  }

  if (p.includes("/admin/citizens")) {
    return lang === "ml" ? "പൗരന്മാരെ തിരയുക..." : "Search citizens...";
  }

  if (p.includes("/admin/members")) {
    return lang === "ml" ? "അംഗങ്ങളെ തിരയുക..." : "Search members...";
  }

  if (p.includes("/admin/citizen-messages") || p.includes("issues") || p.includes("growth")) {
    return lang === "ml" ? "സന്ദേശങ്ങൾ തിരയുക..." : "Search messages...";
  }

  return lang === "ml" ? "തിരയുക..." : "Search...";
}

export function AdminTopBar() {
  const { lang, setLang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = useAdminTopSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUserView, setIsUserView] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );

  const avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";

  // Clear top search query whenever page location changes
  useEffect(() => {
    setAdminTopSearchQuery("");
  }, [location.pathname]);

  // Focus search input when pressing "/"
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleToggleView = () => {
    const nextView = !isUserView;
    setIsUserView(nextView);
    setIsProfileOpen(false);
    if (nextView) {
      toast.success(lang === "ml" ? "പൗരൻ കാഴ്ചയിലേക്ക് മാറ്റി" : "Switched to Citizen View");
      navigate({ to: "/" });
    } else {
      toast.success(lang === "ml" ? "അഡ്മിൻ കാഴ്ചയിലേക്ക് മാറ്റി" : "Switched to Admin View");
      navigate({ to: "/admin" });
    }
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    toast.success(lang === "ml" ? "വിജയകരമായി ലോഗ് ഔട്ട് ചെയ്തു" : "Logged out successfully");
    navigate({ to: "/auth/login" });
  };

  const placeholder = getSearchPlaceholder(location.pathname, lang);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-3 border-b border-border bg-background/95 px-2.5 sm:px-5 backdrop-blur md:bg-white md:dark:bg-slate-900">
        {/* Sidebar Trigger (Hamburger Menu Button) */}
        <SidebarTrigger className="h-9 w-9 shrink-0 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground" />

        {/* Brand Logo & Title (Visible on Mobile only; hidden on desktop where sidebar shows logo) */}
        <Link to="/admin" className="flex items-center gap-2 shrink-0 md:hidden">
          <img
            src={officialLotus}
            alt="Vikasita Keralam logo"
            className="h-8 w-8 shrink-0 object-contain"
          />
          <div className="leading-tight">
            <span className="block text-xs font-bold font-display text-foreground whitespace-nowrap">
              Vikasita Keralam
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-primary whitespace-nowrap">
              {lang === "ml" ? "അഡ്മിൻ പാനൽ" : "ADMIN PANEL"}
            </span>
          </div>
        </Link>

        {/* Search Bar (Visible on desktop/md+ screens) */}
        <div className="hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:flex ml-2">
          <Search className="h-4 w-4 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => setAdminTopSearchQuery(event.target.value)}
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground text-xs font-sans"
            placeholder={placeholder}
            aria-label="Search admin panel"
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
            /
          </kbd>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Preview Mobile App Button placed in Header right next to Language Toggle */}
          <button
            onClick={() => setIsMobileModalOpen(true)}
            className="h-9.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer font-sans"
            title={lang === "ml" ? "മൊബൈൽ ആപ്പ് പ്രിവ്യൂ തുറക്കുക" : "Open Mobile App Preview Window"}
          >
            <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">
              {lang === "ml" ? "📱 മൊബൈൽ ആപ്പ് പ്രിവ്യൂ" : "📱 Preview Mobile App"}
            </span>
          </button>

          <LanguageToggle />

          {/* Notifications Icon */}
          <Link
            to="/admin/notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card text-foreground/70 hover:text-primary shrink-0"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              4
            </span>
          </Link>

          {/* User Profile Card Button & Popover */}
          <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-xl border border-border/80 bg-card hover:bg-muted/60 px-2 py-1 sm:px-2.5 sm:py-1.5 transition-all cursor-pointer shadow-2xs shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans"
                aria-label="User menu"
              >
                <img
                  src={avatarUrl}
                  alt="Jayasurya"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border border-border/80 shadow-2xs shrink-0"
                />
                <div className="text-left leading-tight hidden md:block">
                  <span className="block text-xs font-bold text-foreground font-sans">
                    Jayasurya
                  </span>
                  <span className="block text-[10px] font-semibold text-muted-foreground font-sans">
                    {lang === "ml" ? "സ്റ്റേറ്റ് അഡ്മിൻ" : "State Admin"}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-72 rounded-2xl border border-amber-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl text-foreground font-sans z-50"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-3 pb-3.5 mb-2.5 border-b border-amber-100/80 dark:border-slate-800/80">
                <img
                  src={avatarUrl}
                  alt="Jayasurya"
                  className="h-11 w-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate font-display">
                    Jayasurya
                  </h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate font-sans">
                    {lang === "ml" ? "സ്റ്റേറ്റ് അഡ്മിൻ" : "State Admin"}
                  </p>
                </div>
              </div>

              {/* Actions List */}
              <div className="space-y-1">
                {/* 1. Switch View */}
                <button
                  onClick={handleToggleView}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/60 dark:hover:bg-slate-800/60 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                      {lang === "ml" ? "കാഴ്ച മാറ്റുക" : "Switch View"}
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-orange-100/90 dark:bg-orange-950/70 px-2.5 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 font-sans">
                    {isUserView ? "USER" : "USER"}
                  </span>
                </button>

                {/* 2. Language */}
                <button
                  onClick={() => setLang(lang === "en" ? "ml" : "en")}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/60 dark:hover:bg-slate-800/60 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                      {lang === "ml" ? "ഭാഷ" : "Language"}
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-orange-100/90 dark:bg-orange-950/70 px-2.5 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 font-sans">
                    {lang === "en" ? "ENGLISH" : "MALAYALAM"}
                  </span>
                </button>

                {/* 3. Dark Mode */}
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/60 dark:hover:bg-slate-800/60 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? (
                      <Moon className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    ) : (
                      <Sun className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                      {lang === "ml" ? "ഡാർക്ക് മോഡ്" : "Dark Mode"}
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-sans">
                    {isDark ? "ON" : "OFF"}
                  </span>
                </button>

                {/* 4. Settings */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate({ to: "/admin/settings" });
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/60 dark:hover:bg-slate-800/60 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                      {lang === "ml" ? "ക്രമീകരണങ്ങൾ" : "Settings"}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>

                {/* 5. Log out */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="h-4.5 w-4.5 text-red-500 shrink-0" />
                    <span className="text-xs font-bold text-red-500 group-hover:text-red-600 font-sans">
                      {lang === "ml" ? "ലോഗ് ഔട്ട്" : "Log out"}
                    </span>
                  </div>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Mobile App Preview Modal Window */}
      <AdminMobilePreviewModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </>
  );
}
