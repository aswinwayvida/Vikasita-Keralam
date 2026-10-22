import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Landmark,
  Award,
  Sparkles,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Calendar,
  X,
  CheckCircle2,
  MessageCircle,
  Map,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { mockUsers, userCategorySummary, AppUser, UserCategory, isBjpMemberUser } from "@/data/users";
import { districts } from "@/data/geo";
import { FilterChip } from "./MobileAppliedFiltersScope";
import { PartyFlagIcon } from "@/components/common/PartyFlagIcon";

interface MobileUsersListTabProps {
  onSelectUser?: (user: AppUser) => void;
  periodText?: string;
  onOpenDatePicker?: () => void;
  onStepPeriod?: (direction: number) => void;
}

export function MobileUsersListTab({
  onSelectUser,
  periodText = "1 Oct - 7 Oct 2026",
  onOpenDatePicker,
  onStepPeriod,
}: MobileUsersListTabProps) {
  const { lang } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | UserCategory>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<AppUser | null>(null);

  const [internalPeriodIndex, setInternalPeriodIndex] = useState(2); // default to "1 Oct - 7 Oct 2026"
  const [internalPeriod, setInternalPeriod] = useState<string | null>(null);

  const PERIOD_PRESETS = [
    "Today (ഇന്ന്)",
    "Yesterday (ഇന്നലെ)",
    periodText || "1 Oct - 7 Oct 2026",
    "This Month (ഈ മാസം)",
    "Sep 2026",
    "Aug 2026",
    "Jul 2026",
    "This Year (ഈ വർഷം)",
  ];

  const displayPeriodText = internalPeriod || periodText || "1 Oct - 7 Oct 2026";

  const handleStepPeriodInternal = (direction: number) => {
    if (onStepPeriod) {
      onStepPeriod(direction);
    }
    const nextIdx = (internalPeriodIndex + direction + PERIOD_PRESETS.length) % PERIOD_PRESETS.length;
    setInternalPeriodIndex(nextIdx);
    setInternalPeriod(PERIOD_PRESETS[nextIdx]);
  };

  // Filter users based on category, district, period, and search term
  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      // Category filter
      if (selectedCategory !== "all") {
        if (selectedCategory === "bjp_member") {
          const isBjp = isBjpMemberUser(user);
          if (!isBjp) return false;
        } else if (selectedCategory === "peoples_representative") {
          const isRep =
            user.category === "peoples_representative" ||
            user.designationEn.toLowerCase().includes("mp") ||
            user.designationEn.toLowerCase().includes("mla") ||
            user.designationEn.toLowerCase().includes("minister") ||
            user.designationEn.toLowerCase().includes("councilor") ||
            user.designationEn.toLowerCase().includes("panchayat") ||
            user.designationEn.toLowerCase().includes("representative");
          if (!isRep) return false;
        } else if (selectedCategory === "politician") {
          const isPol =
            user.category === "politician" ||
            user.category === "bjp_member" ||
            user.category === "other_party_member";
          if (!isPol) return false;
        } else if (user.category !== selectedCategory) {
          return false;
        }
      }
      // District filter
      if (selectedDistrict !== "all" && user.districtId !== selectedDistrict) {
        return false;
      }
      // Search term filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesName =
          user.name.toLowerCase().includes(query) || user.nameMl.toLowerCase().includes(query);
        const matchesDesignation =
          user.designationEn.toLowerCase().includes(query) ||
          user.designationMl.toLowerCase().includes(query);
        const matchesLocation =
          user.constituencyEn.toLowerCase().includes(query) ||
          user.constituencyMl.toLowerCase().includes(query) ||
          user.districtNameEn.toLowerCase().includes(query) ||
          user.districtNameMl.toLowerCase().includes(query);
        const matchesMobile = user.mobile.includes(query);

        return matchesName || matchesDesignation || matchesLocation || matchesMobile;
      }

      return true;
    });
  }, [selectedCategory, selectedDistrict, searchQuery]);

  const selectedDistrictObj = districts.find((d) => d.id === selectedDistrict);

  // Dynamically recalculate KPI counts based on selected period
  const categoryCounts = useMemo(() => {
    let multiplier = 1.0;
    const p = displayPeriodText.toLowerCase();
    if (p.includes("today") || p.includes("ഇന്ന്")) multiplier = 0.04;
    else if (p.includes("yesterday") || p.includes("ഇന്നലെ")) multiplier = 0.035;
    else if (p.includes("7 days") || p.includes("7 ദിവസം") || p.includes("1 oct")) multiplier = 0.22;
    else if (p.includes("this month") || p.includes("ഈ മാസം") || p.includes("month")) multiplier = 0.65;
    else if (p.includes("sep")) multiplier = 0.94;
    else if (p.includes("aug")) multiplier = 0.88;
    else if (p.includes("jul")) multiplier = 0.82;
    else if (p.includes("this year") || p.includes("ഈ വർഷം") || p.includes("year")) multiplier = 1.0;
    else {
      let hash = 0;
      for (let i = 0; i < displayPeriodText.length; i++) {
        hash = (hash << 5) - hash + displayPeriodText.charCodeAt(i);
      }
      multiplier = 0.1 + (Math.abs(hash) % 80) / 100;
    }

    return {
      total: Math.round(userCategorySummary.total * multiplier),
      public: Math.round(userCategorySummary.public * multiplier),
      politicians: Math.round(userCategorySummary.politicians * multiplier),
      peoples_representative: Math.round(userCategorySummary.peoples_representative * multiplier),
      bjp_member: Math.round(userCategorySummary.bjp_member * multiplier),
      other_party_member: Math.round(userCategorySummary.other_party_member * multiplier),
    };
  }, [displayPeriodText]);

  // Construct Filter Chips for the Applied Filters UI
  const appliedFilterChips = useMemo(() => {
    const chips: FilterChip[] = [];

    if (selectedCategory !== "all") {
      const categoryLabels: Record<UserCategory, { en: string; ml: string }> = {
        politician: { en: "Politicians", ml: "രാഷ്ട്രീയ നേതാക്കൾ" },
        peoples_representative: { en: "People's Rep.", ml: "ജനപ്രതിനിധികൾ" },
        bjp_member: { en: "BJP Members", ml: "ബി.ജെ.പി അംഗങ്ങൾ" },
        public: { en: "Public Citizens", ml: "പൊതുജനങ്ങൾ" },
        other_party_member: { en: "Other Party Members", ml: "മറ്റ് പാർട്ടി അംഗങ്ങൾ" },
      };
      chips.push({
        id: "category",
        label: `User Category: ${lang === "ml" ? categoryLabels[selectedCategory].ml : categoryLabels[selectedCategory].en}`,
        onRemove: () => setSelectedCategory("all"),
      });
    }

    if (selectedDistrict !== "all" && selectedDistrictObj) {
      chips.push({
        id: "district",
        label: `District: ${lang === "ml" ? selectedDistrictObj.ml : selectedDistrictObj.en}`,
        onRemove: () => setSelectedDistrict("all"),
      });
    }

    if (searchQuery.trim() !== "") {
      chips.push({
        id: "search",
        label: `Search: "${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(""),
      });
    }

    return chips;
  }, [selectedCategory, selectedDistrict, selectedDistrictObj, searchQuery, lang]);

  const getUserBadge = (user: AppUser) => {
    if (user.badgeEn) {
      if (user.badgeEn === "Party Member") {
        return null;
      }
      const label = lang === "ml" && user.badgeMl ? user.badgeMl : user.badgeEn;
      let bg = "bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-800";
      let dot = "bg-orange-500";

      if (user.badgeEn === "People's Rep" || user.badgeEn === "Peoples Rep") {
        bg = "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
        dot = "bg-emerald-500";
      } else if (user.badgeEn === "Former MLA") {
        bg = "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800";
        dot = "bg-purple-500";
      } else if (user.badgeEn === "MP") {
        bg = "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
        dot = "bg-emerald-500";
      } else if (user.badgeEn === "MLA") {
        bg = "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
        dot = "bg-blue-500";
      }

      return { label, bg, dot };
    }

    switch (user.category) {
      case "politician":
        return {
          label: lang === "ml" ? "രാഷ്ട്രീയ നേതാവ്" : "Politician",
          bg: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          dot: "bg-purple-500",
        };
      case "peoples_representative":
        return {
          label: lang === "ml" ? "ജനപ്രതിനിധി" : "People's Rep",
          bg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          dot: "bg-emerald-500",
        };
      case "bjp_member":
        return null;
      case "other_party_member":
        return {
          label: lang === "ml" ? "മറ്റ് പാർട്ടി അംഗം" : "Other Party Member",
          bg: "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800",
          dot: "bg-amber-500",
        };
      case "public":
      default:
        return {
          label: lang === "ml" ? "പൊതുജനം" : "Public",
          bg: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          dot: "bg-blue-500",
        };
    }
  };

  const scopeTitleText =
    selectedDistrict !== "all" && selectedDistrictObj
      ? `${lang === "ml" ? selectedDistrictObj.ml : selectedDistrictObj.en} District`
      : lang === "ml"
      ? "എല്ലാ കേരളവും • സംസ്ഥാന തലം"
      : "All Kerala • State Level";

  const scopeSubText =
    selectedDistrict !== "all" && selectedDistrictObj
      ? lang === "ml"
        ? `${selectedDistrictObj.ml} ജില്ലയിലെ മണ്ഡലങ്ങളും മേഖലകളും`
        : `Constituencies & Sectors under ${selectedDistrictObj.en}`
      : lang === "ml"
      ? "14 ജില്ലകളും 140 മണ്ഡലങ്ങളും"
      : "All 14 Districts & 140 Constituencies";

  return (
    <div className="space-y-1.5 animate-in fade-in duration-200">
      {/* Top Header matching Dashboard layout: Date Title (Left) + Stepper & Controls (Right) */}
      <div className="flex items-center justify-between gap-2 py-1 my-0.5">
        {/* Left Side: Bold Date/Period Title */}
        <button
          type="button"
          onClick={onOpenDatePicker}
          className="font-display text-[11px] sm:text-[13px] font-extrabold text-[#0a0f1d] dark:text-white tracking-tight leading-none text-left hover:text-[#ff5500] transition-colors cursor-pointer whitespace-nowrap truncate min-w-0"
          title="Click to Open Date Picker"
        >
          {displayPeriodText}
        </button>

        {/* Right Side: Circular Action Buttons (Previous, Next, Calendar, Filter) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Left Arrow (Previous Period) */}
          <button
            type="button"
            onClick={() => handleStepPeriodInternal(-1)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Previous Period"
          >
            <ChevronLeft className="h-3 w-3 stroke-[2.5]" />
          </button>

          {/* Right Arrow (Next Period) */}
          <button
            type="button"
            onClick={() => handleStepPeriodInternal(1)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-100 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-900 text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Next Period"
          >
            <ChevronRight className="h-3 w-3 stroke-[2.5]" />
          </button>

          {/* Calendar Icon Button */}
          <button
            type="button"
            onClick={onOpenDatePicker}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#ff5500] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer shadow-2xs"
            title="Open Date Picker"
          >
            <Calendar className="h-3.5 w-3.5 stroke-[2.2]" />
          </button>

          {/* Filter Button */}
          <button
            type="button"
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-all shadow-2xs cursor-pointer ${
              showFilterDrawer || appliedFilterChips.length > 0 || selectedDistrict !== "all"
                ? "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30"
                : "border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-orange-500 hover:bg-orange-50"
            }`}
            title="Toggle Filters"
          >
            <Filter className={`h-3 w-3 stroke-[2.2] ${appliedFilterChips.length > 0 || showFilterDrawer || selectedDistrict !== "all" ? "text-white" : "text-orange-500"}`} />

            {(appliedFilterChips.length > 0 || selectedDistrict !== "all") && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white ring-1.5 ring-white dark:ring-slate-900 animate-pulse">
                {appliedFilterChips.length || 1}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Filter Drawer (Dashboard-Style) */}
      {showFilterDrawer && (
        <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 animate-in fade-in slide-in-from-top-1 duration-200 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between pb-1 border-b border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[10.5px] font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-[#ff5500]" />
              <span>{lang === "ml" ? "ഫിൽട്ടർ ക്രമീകരണങ്ങൾ" : "User Directory Filters"}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrict("all");
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                {lang === "ml" ? "റീസെറ്റ്" : "Reset"}
              </button>
              <button
                type="button"
                onClick={() => setShowFilterDrawer(false)}
                className="text-amber-800 dark:text-amber-300 p-0.5 hover:bg-amber-200/50 rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* District Dropdown Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
              <Map className="h-3 w-3 text-orange-500" />
              {lang === "ml" ? "ജില്ല അനുസരിച്ച്:" : "Filter by District:"}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-xl border border-border bg-card p-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">{lang === "ml" ? "എല്ലാ ജില്ലകളും (All Kerala)" : "All Kerala (All Districts)"}</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {lang === "ml" ? d.ml : d.en}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}



      {/* 6 Category KPI Cards Grid (Informative Stats Cards) */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {/* 1. Total Users KPI Card */}
        <div className="p-2 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between min-h-[58px]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
              {lang === "ml" ? "ഉപയോക്താക്കൾ" : "Total Users"}
            </span>
            <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-orange-500 to-[#ff5500] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Users className="h-2.5 w-2.5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-0.5">
              {categoryCounts.total.toLocaleString()}
            </div>
            <p className="text-[8.5px] sm:text-[9px] font-semibold text-orange-700 dark:text-orange-300 truncate mt-[1px]">
              {lang === "ml" ? "എല്ലാ രജിസ്റ്റർ ചെയ്തവരും" : "All Registered Users"}
            </p>
          </div>
        </div>

        {/* 2. Public Citizens KPI Card */}
        <div className="p-2 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between min-h-[58px]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
              {lang === "ml" ? "പൊതുജനനങ്ങൾ" : "Public Citizens"}
            </span>
            <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Users className="h-2.5 w-2.5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-0.5">
              {categoryCounts.public.toLocaleString()}
            </div>
            <p className="text-[8.5px] sm:text-[9px] font-semibold text-blue-700 dark:text-blue-300 truncate mt-[1px]">
              {lang === "ml" ? "പൗരന്മാരും അപേക്ഷകരും" : "Citizens & Applicants"}
            </p>
          </div>
        </div>

        {/* 3. Politicians KPI Card */}
        <div className="p-2 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between min-h-[58px]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
              {lang === "ml" ? "രാഷ്ട്രീയ നേതാക്കൾ" : "Politicians"}
            </span>
            <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Landmark className="h-2.5 w-2.5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-0.5">
              {categoryCounts.politicians.toLocaleString()}
            </div>
            <p className="text-[8.5px] sm:text-[9px] font-semibold text-purple-700 dark:text-purple-300 truncate mt-[1px]">
              {lang === "ml" ? "നേതാക്കളും ഭാരവാഹികളും" : "Party Leaders & Office Bearers"}
            </p>
          </div>
        </div>

        {/* 4. People’s Representatives KPI Card */}
        <div className="p-2 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between min-h-[58px]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
              {lang === "ml" ? "ജനപ്രതിനിധികൾ" : "People's Representatives"}
            </span>
            <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Award className="h-2.5 w-2.5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-0.5">
              {categoryCounts.peoples_representative.toLocaleString()}
            </div>
            <p className="text-[8.5px] sm:text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 truncate mt-[1px]">
              {lang === "ml" ? "പഞ്ചായത്ത്, MLA, MP & ലോക്കൽ റപ്സ്" : "Panchayat, MLA, MP & Local Reps"}
            </p>
          </div>
        </div>

        {/* 5. BJP Members KPI Card */}
        <div className="p-2 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between min-h-[58px]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
              {lang === "ml" ? "ബി.ജെ.പി അംഗങ്ങൾ" : "BJP Members"}
            </span>
            <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Sparkles className="h-2.5 w-2.5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-0.5">
              {categoryCounts.bjp_member.toLocaleString()}
            </div>
            <p className="text-[8.5px] sm:text-[9px] font-semibold text-orange-700 dark:text-orange-300 truncate mt-[1px]">
              {lang === "ml" ? "സജീവ പാർട്ടി അംഗങ്ങൾ" : "Active Party Members"}
            </p>
          </div>
        </div>

        {/* 6. Other Party Members KPI Card */}
        <div className="p-2 rounded-lg border border-border bg-card text-left shadow-2xs flex flex-col justify-between min-h-[58px]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-muted-foreground truncate">
              {lang === "ml" ? "മറ്റ് പാർട്ടി അംഗങ്ങൾ" : "Other Party Members"}
            </span>
            <div className="h-4.5 w-4.5 rounded-md bg-gradient-to-br from-amber-600 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <UserCheck className="h-2.5 w-2.5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-[13px] font-extrabold text-foreground leading-tight mt-0.5">
              {categoryCounts.other_party_member.toLocaleString()}
            </div>
            <p className="text-[8.5px] sm:text-[9px] font-semibold text-amber-800 dark:text-amber-300 truncate mt-[1px]">
              {lang === "ml" ? "മറ്റ് ഘടകകക്ഷികൾ / മുന്നണി" : "Other Parties / Allies"}
            </p>
          </div>
        </div>
      </div>

      {/* Clean Search Input + Category Dropdown on Right Side Container */}
      <div className="rounded-2xl border border-border bg-card p-2 shadow-2xs flex items-center gap-2">
        {/* Full-width Search Input Bar */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ml"
                ? "പേര്, മണ്ഡലം, ഫോൺ നൽകി തിരയുക..."
                : "Search name, constituency, phone..."
            }
            className="w-full rounded-xl border border-border bg-muted/30 pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Select Dropdown on Right Side */}
        <div className="flex items-center shrink-0 max-w-[130px] sm:max-w-[160px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as "all" | UserCategory)}
            className="w-full rounded-xl border border-border bg-muted/40 px-2 py-1.5 text-[11px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer text-ellipsis truncate"
          >
            <option value="all">
              {lang === "ml" ? "എല്ലാം (All Users)" : "All Users"}
            </option>
            <option value="public">
              {lang === "ml" ? "പൊതുജനങ്ങൾ" : "Public"}
            </option>
            <option value="politician">
              {lang === "ml" ? "നേതാക്കൾ" : "Politicians"}
            </option>
            <option value="peoples_representative">
              {lang === "ml" ? "ജനപ്രതിനിധികൾ" : "People's Reps"}
            </option>
            <option value="bjp_member">
              {lang === "ml" ? "ബി.ജെ.പി അംഗങ്ങൾ" : "BJP Members"}
            </option>
            <option value="other_party_member">
              {lang === "ml" ? "മറ്റ് പാർട്ടികൾ" : "Other Parties"}
            </option>
          </select>
        </div>
      </div>

      {/* Users List Cards Section */}
      <div className="space-y-2">
        {filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center space-y-2">
            <Users className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs font-bold text-foreground">
              {lang === "ml" ? "ഉപയോക്താക്കൾ ആരും കണ്ടില്ല" : "No Users Found"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {lang === "ml"
                ? "തിരയൽ വാക്കോ ഫിൽട്ടറോ മാറ്റി ശ്രമിക്കുക."
                : "Try adjusting your search query or selected filter."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedDistrict("all");
              }}
              className="text-[10px] font-bold text-orange-600 dark:text-orange-400 underline cursor-pointer"
            >
              {lang === "ml" ? "ഫിൽട്ടറുകൾ റീസെറ്റ് ചെയ്യുക" : "Reset All Filters"}
            </button>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const badge = getUserBadge(user);
            return (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUserDetail(user);
                  if (onSelectUser) onSelectUser(user);
                }}
                className="group relative rounded-lg border border-border bg-card p-2.5 shadow-2xs hover:border-orange-500/60 transition-all cursor-pointer space-y-1.5"
              >
                {/* Card Top Row: Avatar, Name & Category Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* User Avatar Image or Initial Circle */}
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold text-xs border border-orange-500/20 shadow-xs overflow-hidden">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        user.name.charAt(0)
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-background ${badge?.dot || "bg-orange-500"}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-xs font-extrabold text-foreground truncate group-hover:text-orange-600 transition-colors">
                          {lang === "ml" ? user.nameMl : user.name}
                        </h3>
                        {isBjpMemberUser(user) && (
                          <PartyFlagIcon className="h-3.5 w-5 rounded-[2px]" />
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-muted-foreground leading-tight truncate">
                        {lang === "ml" ? user.designationMl : user.designationEn}
                      </p>
                    </div>
                  </div>

                  {/* Category Pill Tag Badge */}
                  {badge && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${badge.bg}`}
                    >
                      <span>{badge.label}</span>
                    </span>
                  )}
                </div>

                {/* Location & Contact Info Row */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-border/40 text-[9.5px]">
                  <div className="flex items-center gap-1 text-muted-foreground truncate">
                    <MapPin className="h-3 w-3 text-orange-500 shrink-0" />
                    <span className="truncate font-medium">
                      {lang === "ml" ? user.constituencyMl : user.constituencyEn},{" "}
                      {lang === "ml" ? user.districtNameMl : user.districtNameEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground truncate justify-end">
                    <Phone className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-semibold text-foreground">{user.mobile}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User Detailed Information Drawer Sheet Modal */}
      {selectedUserDetail && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-3.5 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 font-black text-base border border-orange-500/20 overflow-hidden">
                  {selectedUserDetail.avatarUrl ? (
                    <img
                      src={selectedUserDetail.avatarUrl}
                      alt={selectedUserDetail.name}
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    selectedUserDetail.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-foreground">
                      {lang === "ml" ? selectedUserDetail.nameMl : selectedUserDetail.name}
                    </h3>
                    {isBjpMemberUser(selectedUserDetail) && (
                      <PartyFlagIcon className="h-4 w-5 rounded-[2px]" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    ID: {selectedUserDetail.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserDetail(null)}
                className="rounded-xl border border-border bg-muted p-1.5 text-foreground hover:bg-muted/80 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Info Fields */}
            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-border bg-muted/30 p-2.5 space-y-1.5">
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">
                    {lang === "ml" ? "ഫോൺ നമ്പർ" : "Mobile"}
                  </span>
                  <span className="font-bold text-foreground font-mono text-[11px]">
                    +91 {selectedUserDetail.mobile}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">
                    {lang === "ml" ? "വിഭാഗം" : "Category"}
                  </span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {lang === "ml"
                      ? selectedUserDetail.categoryLabelMl
                      : selectedUserDetail.categoryLabelEn}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">
                    {lang === "ml" ? "പദവി / റോൾ" : "Designation"}
                  </span>
                  <span className="font-bold text-foreground text-right max-w-[180px]">
                    {lang === "ml"
                      ? selectedUserDetail.designationMl
                      : selectedUserDetail.designationEn}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">
                    {lang === "ml" ? "മണ്ഡലം / സ്ഥലം" : "Constituency"}
                  </span>
                  <span className="font-bold text-foreground">
                    {lang === "ml"
                      ? selectedUserDetail.constituencyMl
                      : selectedUserDetail.constituencyEn}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">
                    {lang === "ml" ? "ജില്ല" : "District"}
                  </span>
                  <span className="font-bold text-foreground">
                    {lang === "ml"
                      ? selectedUserDetail.districtNameMl
                      : selectedUserDetail.districtNameEn}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground font-medium">
                    {lang === "ml" ? "രജിസ്ട്രേഷൻ തീയതി" : "Joined Date"}
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedUserDetail.joinedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Prominent Call & Message Action Buttons Below All Details */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${selectedUserDetail.mobile}`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-2.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs hover:bg-emerald-500/25 active:scale-95 transition-all text-center shadow-xs"
              >
                <Phone className="h-4 w-4" />
                {lang === "ml" ? "വിളിക്കുക (Call)" : "Call Now"}
              </a>

              <a
                href={`https://wa.me/91${selectedUserDetail.mobile}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-green-600/30 bg-green-600/15 py-2.5 font-bold text-green-700 dark:text-green-400 text-xs hover:bg-green-600/25 active:scale-95 transition-all text-center shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                {lang === "ml" ? "സന്ദേശം (Message)" : "Message"}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
