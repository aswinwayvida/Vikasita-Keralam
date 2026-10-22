import React from "react";
import { MapPin, X } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

export interface FilterChip {
  id: string;
  label: string; // e.g. "Scheme Type: Central"
  onRemove: () => void;
}

export interface MobileAppliedFiltersScopeProps {
  currentScopeTitle?: string; // e.g. "Booth #107 (Thrissur North, Thrissur)"
  currentScopeSubLabel?: string;
  onResetScope?: () => void;
  appliedFilters?: FilterChip[];
  onResetAllFilters?: () => void;
  maxVisibleChips?: number;
}

export function MobileAppliedFiltersScope({
  currentScopeTitle = "All Kerala • State Level",
  currentScopeSubLabel,
  onResetScope,
  appliedFilters = [],
  onResetAllFilters,
  maxVisibleChips = 6,
}: MobileAppliedFiltersScopeProps) {
  const { lang } = useLang();

  const isScopeFiltered =
    !!onResetScope &&
    currentScopeTitle !== "All Kerala • State Level" &&
    currentScopeTitle !== "എല്ലാ കേരളവും • സംസ്ഥാന തലം";

  const hasAppliedFilters = appliedFilters.length > 0;

  if (!isScopeFiltered && !hasAppliedFilters) {
    return null; // Render nothing if state level and no filters applied
  }

  const visibleChips = appliedFilters.slice(0, maxVisibleChips);
  const overflowCount = appliedFilters.length - maxVisibleChips;

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {lang === "ml" ? "പ്രയോഗിച്ച ഫിൽട്ടറുകൾ" : "Applied Filters"}
        </h3>
        {onResetAllFilters && (
          <button
            type="button"
            onClick={onResetAllFilters}
            className="text-[10.5px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
          >
            {lang === "ml" ? "എല്ലാം ഒഴിവാക്കുക" : "Clear All"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
        {/* Scope Chip if Geography Scope is filtered */}
        {isScopeFiltered && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 dark:border-orange-800/80 bg-orange-50/90 dark:bg-orange-950/50 px-3 py-1 text-[11px] font-extrabold text-orange-950 dark:text-orange-100 shadow-2xs shrink-0 snap-start">
            <MapPin className="h-3 w-3 text-[#ff5500] shrink-0" />
            <span className="whitespace-nowrap">{currentScopeTitle}</span>
            <button
              type="button"
              onClick={onResetScope}
              className="p-0.5 text-orange-400 hover:text-orange-800 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              title="Reset Scope"
            >
              <X className="h-3 w-3 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Other Applied Filter Chips */}
        {visibleChips.map((chip) => (
          <div
            key={chip.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 dark:border-slate-700 bg-[#fffdf7] dark:bg-slate-800/80 px-3 py-1 text-[11px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs shrink-0 snap-start"
          >
            <span className="whitespace-nowrap">{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              title="Remove filter"
            >
              <X className="h-3 w-3 stroke-[2.5]" />
            </button>
          </div>
        ))}

        {/* Overflow Chip if many filters */}
        {overflowCount > 0 && (
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-300 dark:border-amber-800 bg-amber-100/80 dark:bg-amber-900/60 px-2.5 py-1 text-[11px] font-extrabold text-amber-900 dark:text-amber-200 shadow-2xs shrink-0 snap-start">
            <span className="whitespace-nowrap">+{overflowCount} more</span>
            {onResetAllFilters && (
              <button
                type="button"
                onClick={onResetAllFilters}
                className="p-0.5 text-amber-600 hover:text-amber-900 dark:hover:text-amber-100 rounded-full cursor-pointer"
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}