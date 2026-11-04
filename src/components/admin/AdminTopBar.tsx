import { useEffect, useRef } from "react";
import { Bell, ChevronDown, Search, UserCheck } from "lucide-react";
import { LanguageToggle } from "@/components/public/LanguageToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import officialLotus from "@/assets/bjp-official-lotus.png";
import { setAdminTopSearchQuery, useAdminTopSearch } from "@/lib/admin-search-store";

function getSearchPlaceholder(pathname: string, lang: "en" | "ml"): string {
  const p = pathname.toLowerCase();

  if (p === "/admin" || p === "/admin/") {
    return lang === "ml"
      ? "പൗരൻ, കേസ് ഐഡി, പദ്ധതി അല്ലെങ്കിൽ ഓർഗനൈസേഷൻ തിരയുക"
      : "Search citizen, case ID, scheme or organisation";
  }

  if (p.includes("/admin/settings") || p.includes("roles")) {
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
  const { lang } = useLang();
  const location = useLocation();
  const searchQuery = useAdminTopSearch();
  const inputRef = useRef<HTMLInputElement>(null);

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

  const placeholder = getSearchPlaceholder(location.pathname, lang);

  return (
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
          className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground text-xs"
          placeholder={placeholder}
          aria-label="Search admin panel"
        />
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">/</kbd>
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5 shrink-0">
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

        {/* User Profile Button */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted/50 px-2 sm:px-2.5 py-1.5 transition-all cursor-pointer shadow-2xs shrink-0">
          <div className="text-right leading-tight hidden md:block">
            <span className="block text-xs font-bold text-foreground">
              {lang === "ml" ? "അഡ്മിൻ" : "Admin"}
            </span>
            <span className="block text-[10px] font-semibold text-primary">
              {lang === "ml" ? "വികസിത കേരളം" : "Vikasita Keralam"}
            </span>
          </div>
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <UserCheck className="h-3.5 w-3.5" />
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
