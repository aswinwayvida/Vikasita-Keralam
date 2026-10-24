import React from "react";
import { Home, Layers, FileText, Headphones, Plus } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

export type AdminMobileTab = "overview" | "applications" | "create" | "schemes" | "helpdesk";

interface AdminMobileAppBottomNavProps {
  activeTab: AdminMobileTab;
  onTabChange: (tab: AdminMobileTab) => void;
  className?: string;
}

export function AdminMobileAppBottomNav({
  activeTab,
  onTabChange,
  className = "",
}: AdminMobileAppBottomNavProps) {
  const { lang } = useLang();
  const isMl = lang === "ml";

  const labels = {
    home: isMl ? "ഹോം" : "Home",
    applications: isMl ? "അപേക്ഷകൾ" : "Applications",
    create: isMl ? "പുതിയത്" : "Create",
    schemes: isMl ? "പദ്ധതികൾ" : "Schemes",
    helpdesk: isMl ? "ഹെൽപ്പ്ഡെസ്ക്" : "Help Desk",
  };

  return (
    <nav
      className={`absolute bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around px-2 py-1 pb-1">
        {/* Home / Overview */}
        <button
          type="button"
          onClick={() => onTabChange("overview")}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors text-[10.5px] font-medium cursor-pointer ${
            activeTab === "overview" ? "text-orange-600 dark:text-orange-500 font-bold" : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <Home className="h-5 w-5 mb-0.5" />
          <span>{labels.home}</span>
        </button>

        {/* Applications */}
        <button
          type="button"
          onClick={() => onTabChange("applications")}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors text-[10.5px] font-medium cursor-pointer ${
            activeTab === "applications" ? "text-orange-600 dark:text-orange-500 font-bold" : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <FileText className="h-5 w-5 mb-0.5" />
          <span>{labels.applications}</span>
        </button>

        {/* Center Elevated Plus Button - Create New Application */}
        <button
          type="button"
          onClick={() => onTabChange("create")}
          className="relative -top-3.5 flex flex-col items-center justify-center px-1 cursor-pointer group"
          title={isMl ? "പുതിയ അപേക്ഷ നൽകുക" : "Create New Application"}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-primary text-white shadow-md ring-4 ring-white dark:ring-slate-900 transition-transform active:scale-95 group-hover:scale-105">
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="text-[9.5px] font-bold text-orange-600 dark:text-orange-500 mt-0.5">{labels.create}</span>
        </button>

        {/* Schemes */}
        <button
          type="button"
          onClick={() => onTabChange("schemes")}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors text-[10.5px] font-medium cursor-pointer ${
            activeTab === "schemes" ? "text-orange-600 dark:text-orange-500 font-bold" : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <Layers className="h-5 w-5 mb-0.5" />
          <span>{labels.schemes}</span>
        </button>

        {/* Help Desk */}
        <button
          type="button"
          onClick={() => onTabChange("helpdesk")}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors text-[10.5px] font-medium cursor-pointer ${
            activeTab === "helpdesk" ? "text-orange-600 dark:text-orange-500 font-bold" : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <Headphones className="h-5 w-5 mb-0.5" />
          <span>{labels.helpdesk}</span>
        </button>
      </div>
    </nav>
  );
}
