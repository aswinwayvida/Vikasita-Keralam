import { Bell, LogOut, Search, ShieldCheck } from "lucide-react";
import { LanguageToggle } from "@/components/public/LanguageToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { clearAdminSession } from "@/lib/admin-auth";

export function AdminTopBar() {
  function handleLogout() {
    clearAdminSession();
    window.location.replace("/auth/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur sm:px-5">
      <SidebarTrigger />
      <div className="hidden min-w-0 max-w-xl flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:flex">
        <Search className="h-4 w-4 shrink-0" />
        <input
          className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Search application, scheme or district"
          aria-label="Search admin panel"
        />
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">/</kbd>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <LanguageToggle />
        <Link
          to="/admin/notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground/70 hover:text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            4
          </span>
        </Link>
        <Link
          to="/"
          className="hidden rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-primary lg:inline"
        >
          Public website ↗
        </Link>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="hidden leading-tight sm:inline">
            <span className="block text-xs font-semibold">Administrator</span>
            <span className="block text-[10px] text-muted-foreground">Kerala team</span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:border-destructive/30 hover:text-destructive"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
