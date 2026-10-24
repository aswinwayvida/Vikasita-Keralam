import { Link, useLocation } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { Home, FileText, Plus, Layers, Headphones } from "lucide-react";

export function BottomNav() {
  const { lang } = useLang();
  const location = useLocation();

  const isMl = lang === "ml";

  const labels = {
    home: isMl ? "ഹോം" : "Home",
    applications: isMl ? "അപേക്ഷകൾ" : "Applications",
    create: isMl ? "പുതിയത്" : "Create",
    schemes: isMl ? "പദ്ധതികൾ" : "Schemes",
    helpdesk: isMl ? "ഹെൽപ്പ്ഡെസ്ക്" : "Help Desk",
  };

  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block bg-background/95 backdrop-blur-md border-t border-border/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5 pb-safe">
        {/* Home */}
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-xs font-medium ${
            currentPath === "/" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="h-5 w-5 mb-0.5" />
          <span>{labels.home}</span>
        </Link>

        {/* Applications */}
        <Link
          to="/janashabdam/track"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-xs font-medium ${
            currentPath.includes("/track") || currentPath.includes("/janashabdam")
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-5 w-5 mb-0.5" />
          <span>{labels.applications}</span>
        </Link>

        {/* Center Plus Button - Create New Application */}
        <Link
          to="/helpdesk"
          className="relative -top-3 flex flex-col items-center justify-center group"
          title={isMl ? "പുതിയ അപേക്ഷ നൽകുക" : "Create New Application"}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95 group-hover:scale-105">
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-semibold text-primary mt-0.5">{labels.create}</span>
        </Link>

        {/* Schemes */}
        <Link
          to="/schemes"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-xs font-medium ${
            currentPath.startsWith("/schemes") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-5 w-5 mb-0.5" />
          <span>{labels.schemes}</span>
        </Link>

        {/* Help Desk */}
        <Link
          to="/helpdesk"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-xs font-medium ${
            currentPath === "/helpdesk" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Headphones className="h-5 w-5 mb-0.5" />
          <span>{labels.helpdesk}</span>
        </Link>
      </div>
    </nav>
  );
}
