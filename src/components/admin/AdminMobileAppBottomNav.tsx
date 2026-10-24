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

  const navItems = [
    { id: "overview" as AdminMobileTab, label: labels.home, icon: Home },
    { id: "applications" as AdminMobileTab, label: labels.applications, icon: FileText },
    { id: "create" as AdminMobileTab, label: labels.create, icon: Plus, isSpecial: true },
    { id: "schemes" as AdminMobileTab, label: labels.schemes, icon: Layers },
    { id: "helpdesk" as AdminMobileTab, label: labels.helpdesk, icon: Headphones },
  ];

  return (
    <nav
      className={`absolute bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-[2rem] overflow-visible ${className}`}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-stretch justify-around h-14 relative">
        {navItems.map((item, index) => {
          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange("create")}
                className="relative flex flex-col items-center justify-center flex-1 cursor-pointer group z-20"
                title={isMl ? "പുതിയ അപേക്ഷ നൽകുക" : "Create New Application"}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-[#ff5500] text-white shadow-md ring-4 ring-white dark:ring-slate-900 transition-transform active:scale-95 group-hover:scale-105 -mt-5">
                  <Plus className="h-6 w-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-extrabold text-[#ff5500] dark:text-orange-400 mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const isFirst = index === 0;
          const isLast = index === navItems.length - 1;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all text-[10.5px] cursor-pointer ${
                isFirst ? "rounded-bl-[2rem]" : ""
              } ${isLast ? "rounded-br-[2rem]" : ""} ${
                isActive
                  ? "bg-[#fff7f0] dark:bg-orange-950/30 text-[#ff5500] dark:text-orange-400 font-extrabold"
                  : "text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              }`}
            >
              {/* Top Orange Active Line Indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#ff5500] rounded-b-sm shadow-xs" />
              )}
              <Icon className={`h-5 w-5 mb-0.5 ${isActive ? "stroke-[2.3]" : "stroke-[1.8]"}`} />
              <span className="leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
