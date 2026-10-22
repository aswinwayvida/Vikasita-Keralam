import React from "react";
import { MapPin, X } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

export interface FilterChip {
  id: string;
  label: string; // e.g. "Scheme Type: Central"
  onRemove: () => void;
}

export interface MobileAppliedFiltersScopeProps {
  currentScopeTitle?: string; // e.g. "Booth #101 • St. Mary's HS" or "Thiruvananthapuram District"
  currentScopeSubLabel?: string; // e.g. "Sector 1, Kazhakuttam" or "All 14 Districts, Kerala"
  onResetScope?: () => void;
  appliedFilters?: FilterChip[];
  onResetAllFilters?: () => void;
  maxVisibleChips?: number;
}

export function MobileAppliedFiltersScope({
  currentScopeTitle = "All Kerala • State Level",
  currentScopeSubLabel = "All 14 Districts & 140 Constituencies",
  onResetScope,
  appliedFilters = [],
  onResetAllFilters,
  maxVisibleChips = 4,
}: MobileAppliedFiltersScopeProps) {
  const { lang } = useLang();

  const isScopeFiltered =
    onResetScope && currentScopeTitle !== "All Kerala • State Level" && currentScopeTitle !== "എല്ലാ കേരളവും • സംസ്ഥാന തലം";

  const hasAppliedFilters = appliedFilters.length > 0;

  // Split visible vs overflow chips if more than maxVisibleChips
  const visibleChips = appliedFilters.slice(0, maxVisibleChips);
  const overflowCount = appliedFilters.length - maxVisibleChips;

  if (!isScopeFiltered && !hasAppliedFilters) {
    return null; // Render nothing if no filters or scope applied
  }

  return (
    <div className="space-y-2.5 animate-in fade-in duration-200">
      {/* 1. CURRENT SCOPE SECTION */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
          {lang === "ml" ? "നിലവിലെ ഭൂമിശാസ്ത്ര മേഖല (Current Scope)" : "Current Scope"}
        </h3>

        <div className="rounded-2xl border border-amber-300/80 dark:border-amber-900/60 bg-[#fffdfa] dark:bg-slate-900 p-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Pink Map Pin Icon Circle */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              <MapPin className="h-4 w-4 fill-rose-500/20" />
            </div>

            <div className="min-w-0">
              <h4 className="font-extrabold text-[#0a0f1d] dark:text-white text-xs sm:text-[13px] leading-tight truncate">
                {currentScopeTitle}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5 truncate">
                {currentScopeSubLabel}
              </p>
            </div>
          </div>

          {onResetScope && (
            <button
              type="button"
              onClick={onResetScope}
              className="text-xs font-extrabold text-[#ff5500] hover:underline cursor-pointer shrink-0 ml-2"
            >
              {lang === "ml" ? "റീസെറ്റ്" : "Reset"}
            </button>
          )}
        </div>
      </div>

      {/* 2. APPLIED FILTERS SECTION */}
      {hasAppliedFilters && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {lang === "ml" ? "പ്രയോഗിച്ച ഫിൽട്ടറുകൾ (Applied Filters)" : "Applied Filters"}
            </h3>
            {onResetAllFilters && (
              <button
                type="button"
                onClick={onResetAllFilters}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline cursor-pointer"
              >
                {lang === "ml" ? "എല്ലാം ഒഴിവാക്കുക" : "Clear All"}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            {visibleChips.map((chip) => (
              <div
                key={chip.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 dark:border-slate-700 bg-[#fffdf7] dark:bg-slate-800/80 px-3 py-1 text-[11px] font-bold text-[#0a0f1d] dark:text-slate-200 shadow-2xs"
              >
                <span>{chip.label}</span>
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

            {/* Overflow Badge Chip (+N more ✕) */}
            {overflowCount > 0 && (
              <div className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50/90 dark:bg-blue-950/60 px-2.5 py-1 text-[11px] font-extrabold text-blue-700 dark:text-blue-300 shadow-2xs">
                <span>+{overflowCount} more</span>
                {onResetAllFilters && (
                  <button
                    type="button"
                    onClick={onResetAllFilters}
                    className="p-0.5 text-blue-500 hover:text-blue-800 dark:hover:text-blue-100 rounded-full cursor-pointer"
                  >
                    <X className="h-3 w-3 stroke-[2.5]" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
