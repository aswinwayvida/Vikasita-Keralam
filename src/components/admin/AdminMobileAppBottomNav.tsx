import React from "react";
import { Home, Layers, FileText, Users, LayoutGrid } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

export type AdminMobileTab = "overview" | "schemes" | "applications" | "users" | "more";

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

  const tabs: { id: AdminMobileTab; labelEn: string; labelMl: string; icon: React.ElementType }[] = [
    {
      id: "overview",
      labelEn: "Dashboard",
      labelMl: "ഡാഷ്‌ബോർഡ്",
      icon: Home,
    },
    {
      id: "schemes",
      labelEn: "Schemes",
      labelMl: "പദ്ധതികൾ",
      icon: Layers,
    },
    {
      id: "applications",
      labelEn: "Applications",
      labelMl: "അപേക്ഷകൾ",
      icon: FileText,
    },
    {
      id: "users",
      labelEn: "Users",
      labelMl: "ഉപയോക്താക്കൾ",
      icon: Users,
    },
    {
      id: "more",
      labelEn: "More",
      labelMl: "കൂടുതൽ",
      icon: LayoutGrid,
    },
  ];

  return (
    <nav
      className={`absolute bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-stretch justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = lang === "ml" ? tab.labelMl : tab.labelEn;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-1 flex-col items-center justify-center pt-2.5 pb-2 px-1 transition-all duration-150 focus:outline-none cursor-pointer ${
                isActive
                  ? "bg-orange-50/70 dark:bg-orange-950/25 text-[#ea580c] dark:text-orange-500"
                  : "bg-transparent text-[#9e9e9e] dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {/* Top Orange Active Line Bar spanning entire tab width */}
              {isActive && (
                <span className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#ea580c] dark:bg-orange-500" />
              )}

              {/* Icon */}
              <div className="flex items-center justify-center h-6 w-6">
                <Icon
                  className={`h-5 w-5 transition-transform duration-150 ${
                    isActive
                      ? tab.id === "overview"
                        ? "fill-[#ea580c] text-[#ea580c] dark:fill-orange-500 dark:text-orange-500 stroke-0"
                        : "text-[#ea580c] dark:text-orange-500 stroke-[2.2]"
                      : "text-[#9e9e9e] dark:text-slate-400 stroke-[1.8]"
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10.5px] leading-tight tracking-tight mt-1 truncate max-w-[72px] ${
                  isActive
                    ? "font-extrabold text-[#ea580c] dark:text-orange-500"
                    : "font-semibold text-[#9e9e9e] dark:text-slate-400"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

