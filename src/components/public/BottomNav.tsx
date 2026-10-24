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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="mx-auto flex max-w-md sm:max-w-lg items-center justify-around px-3 py-1.5 pb-safe">
        {/* Home */}
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors text-xs font-medium ${
            currentPath === "/" ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="h-5 w-5 mb-0.5" />
          <span>{labels.home}</span>
        </Link>

        {/* Applications */}
        <Link
          to="/janashabdam/track"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors text-xs font-medium ${
            currentPath.includes("/track") || currentPath.includes("/applications")
              ? "text-primary font-bold bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-5 w-5 mb-0.5" />
          <span>{labels.applications}</span>
        </Link>

        {/* Center Plus Button - Create New Application */}
        <Link
          to="/helpdesk"
          className="relative -top-4 flex flex-col items-center justify-center group"
          title={isMl ? "പുതിയ അപേക്ഷ നൽകുക" : "Create New Application"}
        >
          <div className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-primary text-primary-foreground shadow-xl ring-4 ring-background transition-transform active:scale-95 group-hover:scale-105">
            <Plus className="h-7 w-7 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-primary mt-0.5">{labels.create}</span>
        </Link>

        {/* Schemes */}
        <Link
          to="/schemes"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors text-xs font-medium ${
            currentPath.startsWith("/schemes") ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-5 w-5 mb-0.5" />
          <span>{labels.schemes}</span>
        </Link>

        {/* Help Desk */}
        <Link
          to="/helpdesk"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors text-xs font-medium ${
            currentPath === "/helpdesk" ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Headphones className="h-5 w-5 mb-0.5" />
          <span>{labels.helpdesk}</span>
        </Link>
      </div>
    </nav>
  );
}
