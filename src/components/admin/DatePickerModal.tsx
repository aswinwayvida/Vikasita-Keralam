import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

export interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPeriod: string;
  onSelectPeriod: (period: string, customLabel?: string) => void;
  inlineInApp?: boolean;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  selectedPeriod,
  onSelectPeriod,
  inlineInApp = false,
}) => {
  const { lang } = useLang();
  const [activePreset, setActivePreset] = useState<string>(selectedPeriod || "this_month");
  const [selectMode, setSelectMode] = useState<"single" | "range">("single");
  const [selectedDay, setSelectedDay] = useState<number>(8);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October

  if (!isOpen) return null;

  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthNamesMl = [
    "ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ",
    "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്ടോബർ", "നവംബർ", "ഡിസംബർ"
  ];

  const presets = [
    { id: "all_time", labelEn: "All time", labelMl: "എല്ലാ സമയവും" },
    { id: "today", labelEn: "Today", labelMl: "ഇന്ന്" },
    { id: "this_week", labelEn: "This week", labelMl: "ഈ ആഴ്ച" },
    { id: "this_month", labelEn: "This month", labelMl: "ഈ മാസം" },
    { id: "this_year", labelEn: "This year", labelMl: "ഈ വർഷം" },
    { id: "yesterday", labelEn: "Yesterday", labelMl: "ഇന്നലെ" },
    { id: "last_week", labelEn: "Last week", labelMl: "കഴിഞ്ഞ ആഴ്ച" },
    { id: "last_month", labelEn: "Last month", labelMl: "കഴിഞ്ഞ മാസം" },
    { id: "last_year", labelEn: "Last year", labelMl: "കഴിഞ്ഞ വർഷം" },
  ];

  // Days in month calculation for grid
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daysMl = ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"];

  const handleApply = () => {
    let customLabel = "";
    if (activePreset === "all_time") {
      customLabel = lang === "ml" ? "എല്ലാ സമയവും" : "All Time";
    } else if (selectMode === "range") {
      const validDay = selectedDay || 12;
      const validYear = currentYear || 2026;
      const validMonth = typeof currentMonth === "number" ? currentMonth : 9;
      const startDayStr = String(Math.max(1, validDay - 6)).padStart(2, "0");
      const endDayStr = String(validDay).padStart(2, "0");
      const monthStr = String(validMonth + 1).padStart(2, "0");
      customLabel = `${startDayStr}/${monthStr}/${validYear} - ${endDayStr}/${monthStr}/${validYear}`;
    } else {
      const validDay = selectedDay || 12;
      const validYear = currentYear || 2026;
      const validMonth = typeof currentMonth === "number" ? currentMonth : 9;
      const d = new Date(validYear, validMonth, validDay);
      const dayOfWeek = d.getDay();
      const dayName = lang === "ml" ? daysMl[dayOfWeek] : daysEn[dayOfWeek];
      const dayStr = String(validDay).padStart(2, "0");
      const monthStr = String(validMonth + 1).padStart(2, "0");
      customLabel = `${dayName}, ${dayStr}/${monthStr}/${validYear}`;
    }
    onSelectPeriod(activePreset, customLabel);
    onClose();
  };

  const currentDayFormatted = () => {
    const validDay = selectedDay || 12;
    const validYear = currentYear || 2026;
    const validMonth = typeof currentMonth === "number" ? currentMonth : 9;
    const d = new Date(validYear, validMonth, validDay);
    if (isNaN(d.getTime())) return "Monday, 12/10/2026";
    const dayOfWeek = d.getDay();
    const dayName = lang === "ml" ? daysMl[dayOfWeek] : daysEn[dayOfWeek];
    const dayStr = String(validDay).padStart(2, "0");
    const monthStr = String(validMonth + 1).padStart(2, "0");
    return `${dayName}, ${dayStr}/${monthStr}/${validYear}`;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const overlayClass = inlineInApp
    ? "absolute inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 rounded-[36px] overflow-hidden"
    : "fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200";

  return (
    <div className={overlayClass} onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xl transition-all border-t border-x border-slate-200/80 dark:border-slate-800 animate-in slide-in-from-bottom-full duration-300 max-h-[88%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle Bar for Mobile Sheet Feel */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1 mb-2" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff5500]" />
            <span>{lang === "ml" ? "കാലയളവ് തിരഞ്ഞെടുക്കുക" : "Select Period & Date"}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 1. Quick Preset Chips (App Saffron & Dark Theme Aligned) */}
        <div className="pt-2.5 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setActivePreset(preset.id)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#ff5500] text-white shadow-xs scale-102"
                      : "bg-amber-50/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-slate-750 border border-amber-200/70 dark:border-slate-700"
                  }`}
                >
                  {lang === "ml" ? preset.labelMl : preset.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Sub-Header: Mode Selection (Single Date | Date Range) */}
        <div className="flex items-center justify-between pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {lang === "ml" ? "തീയതി തിരഞ്ഞെടുക്കൂ" : "Select date"}
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectMode("single")}
              className={`pb-0.5 transition-all cursor-pointer ${
                selectMode === "single"
                  ? "font-black text-[#ff5500] border-b-2 border-[#ff5500]"
                  : "font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              {lang === "ml" ? "ഒറ്റ തീയതി" : "Single Date"}
            </button>
            <button
              type="button"
              onClick={() => setSelectMode("range")}
              className={`pb-0.5 transition-all cursor-pointer ${
                selectMode === "range"
                  ? "font-black text-[#ff5500] border-b-2 border-[#ff5500]"
                  : "font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              {lang === "ml" ? "തീയതി പരിധി" : "Date Range"}
            </button>
          </div>
        </div>

        {/* 3. Selected Date Title */}
        <div className="py-1.5">
          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            {currentDayFormatted()}
          </h4>
        </div>

        {/* Divider */}
        <div className="border-b border-slate-100 dark:border-slate-800 mb-2.5" />

        {/* 4. Calendar View */}
        <div className="space-y-2">
          {/* Calendar Navigation Header */}
          <div className="flex items-center justify-between px-0.5">
            <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {lang === "ml" ? `${monthNamesMl[currentMonth]} ${currentYear}` : `${monthNamesEn[currentMonth]} ${currentYear}`}
            </h5>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday Columns */}
          <div className="grid grid-cols-7 text-center text-[10.5px] font-extrabold text-slate-400 py-0.5">
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-medium">
            {/* Empty slots for month start padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 w-7" />
            ))}

            {/* Days 1 to daysInMonth */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected = selectedDay === dayNum;
              return (
                <div key={dayNum} className="flex items-center justify-center h-7">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDay(dayNum);
                      setActivePreset("custom");
                    }}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-all cursor-pointer text-xs ${
                      isSelected
                        ? "bg-[#ff5500] text-white font-black shadow-md scale-105"
                        : "text-slate-800 dark:text-slate-200 hover:bg-amber-100/60 dark:hover:bg-slate-800 font-semibold"
                    }`}
                  >
                    {dayNum}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Footer Action Buttons (Cancel / OK) */}
        <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
          >
            {lang === "ml" ? "റദ്ദാക്കുക" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="text-xs font-extrabold bg-[#ff5500] text-white hover:bg-orange-600 px-4 py-1.5 rounded-full shadow-xs transition-all cursor-pointer"
          >
            {lang === "ml" ? "ശരി" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};
