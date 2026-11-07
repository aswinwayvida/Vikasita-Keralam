import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  ExternalLink,
  Filter,
  Download,
  Upload,
  LayoutGrid,
  List,
  Plus,
  Power,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
  Sprout,
  Users,
  HeartPulse,
  GraduationCap,
  Home,
  BriefcaseBusiness,
  HandHeart,
  Building2,
  Columns3,
  GripVertical,
  Search,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { schemes, type Scheme } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import schemeLogoFallback from "@/assets/kpi-3d/schemes.png";
import { useAdminTopSearch } from "@/lib/admin-search-store";

export const Route = createFileRoute("/admin/schemes")({
  head: () => ({ meta: [{ title: "Schemes · Admin" }] }),
  component: SchemesPage,
});

const modes = [
  "Apply here",
  "Connected service",
  "Download form",
  "Other government website",
] as const;

const categoryLabels: Record<Scheme["category"], { en: string; ml: string }> = {
  agriculture: { en: "Agriculture", ml: "കൃഷി" },
  women: { en: "Women & Child", ml: "വനിതകളും കുട്ടികളും" },
  health: { en: "Health", ml: "ആരോഗ്യം" },
  education: { en: "Education", ml: "വിദ്യാഭ്യാസം" },
  housing: { en: "Housing", ml: "ഭവനം" },
  employment: { en: "Skills & Employment", ml: "തൊഴിലും നൈപുണ്യവും" },
  welfare: { en: "Social Welfare", ml: "സാമൂഹിക സുരക്ഷ" },
  msme: { en: "Business & MSME", ml: "സംരംഭകത്വം" },
};

const categoryIcons: Record<Scheme["category"], typeof Sprout> = {
  agriculture: Sprout,
  women: Users,
  health: HeartPulse,
  education: GraduationCap,
  housing: Home,
  employment: BriefcaseBusiness,
  welfare: HandHeart,
  msme: Building2,
};

type SchemeColumnKey =
  | "scheme"
  | "category"
  | "portal"
  | "website"
  | "status"
  | "applications"
  | "approved"
  | "rejected"
  | "pending"
  | "inProgress"
  | "actions";

const SCHEME_COLUMNS: { key: SchemeColumnKey; en: string; ml: string }[] = [
  { key: "scheme", en: "Scheme Name", ml: "പദ്ധതിയുടെ പേര്" },
  { key: "category", en: "Category", ml: "വിഭാഗം" },
  { key: "portal", en: "Apply Link", ml: "പോർട്ടൽ തുറക്കുക" },
  { key: "website", en: "Official Website", ml: "ഔദ്യോഗിക വെബ്‌സൈറ്റ്" },
  { key: "status", en: "Status", ml: "സ്റ്റാറ്റസ്" },
  { key: "applications", en: "Applications", ml: "അപേക്ഷകൾ" },
  { key: "approved", en: "Approved", ml: "അംഗീകരിച്ചത്" },
  { key: "rejected", en: "Rejected", ml: "നിരസിച്ചത്" },
  { key: "pending", en: "Pending", ml: "തീർപ്പുകൽപ്പിക്കാത്തത്" },
  { key: "inProgress", en: "In Progress", ml: "പുരോഗതിയിൽ" },
  { key: "actions", en: "Actions", ml: "നടപടികൾ" },
];

const CATEGORY_OPTIONS = [
  "Agriculture",
  "Housing",
  "Healthcare",
  "Education",
  "Employment",
  "Women & Child",
  "Social Welfare",
  "Financial Assistance",
  "Others",
];

const STATUS_OPTIONS = ["Active", "Inactive", "Draft", "Archived"];

const BENEFICIARY_OPTIONS = [
  "Farmers",
  "Women",
  "Students",
  "Senior Citizens",
  "Persons with Disabilities",
  "Workers",
  "General Public",
];

const PRESET_MINISTRIES = [
  "Agriculture & Farmers Welfare",
  "Rural Development",
  "Health & Family Welfare",
  "Education",
  "Finance",
  "Housing & Urban Affairs",
  "Petroleum & Natural Gas",
  "Skill Development & Entrepreneurship",
  "Labour & Employment",
  "Women & Child Development",
  "Jal Shakti",
  "Social Justice & Empowerment",
];

function CategoryTag({ category, lang }: { category: Scheme["category"]; lang: "en" | "ml" }) {
  const CategoryIcon = categoryIcons[category];
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-transparent px-1.5 py-1 text-[10px] font-bold text-muted-foreground">
      <CategoryIcon className="h-3 w-3 shrink-0 text-primary" />
      {categoryLabels[category][lang]}
    </span>
  );
}

function getCategoryDisplay(category: Scheme["category"]): string {
  switch (category) {
    case "agriculture":
      return "Agriculture";
    case "housing":
      return "Housing";
    case "health":
      return "Healthcare";
    case "education":
      return "Education";
    case "employment":
      return "Employment";
    case "women":
      return "Women & Child";
    case "welfare":
      return "Social Welfare";
    case "msme":
      return "Financial Assistance";
    default:
      return "Others";
  }
}

function getBeneficiariesForScheme(record: Scheme): string[] {
  const text = `${record.en} ${record.eligibility.en} ${record.benefit.en} ${record.category}`.toLowerCase();
  const list: string[] = [];
  if (text.includes("farmer") || text.includes("kisan") || text.includes("crop") || record.category === "agriculture")
    list.push("Farmers");
  if (text.includes("women") || text.includes("girl") || text.includes("mother") || text.includes("matru") || record.category === "women")
    list.push("Women");
  if (text.includes("student") || text.includes("school") || text.includes("child") || text.includes("education") || record.category === "education")
    list.push("Students");
  if (text.includes("60") || text.includes("pension") || text.includes("senior") || text.includes("age 18"))
    list.push("Senior Citizens");
  if (text.includes("disability") || text.includes("handicapped") || text.includes("special"))
    list.push("Persons with Disabilities");
  if (text.includes("worker") || text.includes("labour") || text.includes("entrepreneur") || text.includes("skill") || record.category === "employment" || record.category === "msme")
    list.push("Workers");
  if (list.length === 0 || text.includes("bpl") || text.includes("household") || text.includes("insurance"))
    list.push("General Public");
  return Array.from(new Set(list));
}

const schemeLogoUrls: Record<string, string> = {
  pmkisan: "/images/popular-schemes/pm_kisan.png",
  pmjjby: "/images/popular-schemes/pmjjby.png",
  pmsby: "/images/popular-schemes/pmsby.png",
  apy: "/images/popular-schemes/atal_pension.png",
  pmay: "/images/popular-schemes/pm_awas.png",
  ujjwala: "/images/popular-schemes/pm_ujjwala.png",
  mudra: "/images/popular-schemes/mudra.png",
  pmjay: "/images/popular-schemes/pm_jay.png",
  standup: "/images/popular-schemes/stand_up_india.png",
  pmmvy: "/images/popular-schemes/pm_matru_vandana.png",
  midday: "/images/popular-schemes/mid_day_meal.png",
  pmkvy: "/images/popular-schemes/pmkvy.png",
};

function ModePill({ mode }: { mode: string }) {
  if (mode === "Apply here") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 border border-emerald-500/20">
        Apply here
      </span>
    );
  }
  if (mode === "Connected service") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-600 border border-sky-500/20">
        Connected
      </span>
    );
  }
  if (mode === "Download form") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-500/20">
        Download form
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-extrabold text-muted-foreground border border-border">
      External portal
    </span>
  );
}

// Exactly matching the FilterDropdownSelector UI used for User Filter in RoleAccessSettings.tsx
function FilterDropdownSelector({
  title,
  placeholder,
  options,
  selectedValues,
  onChange,
  tr,
}: {
  title: string;
  placeholder: string;
  options: string[];
  selectedValues: string[];
  onChange: (newValues: string[]) => void;
  tr: (en: string, ml: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((item) => item !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const getLabelText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} ${tr("Selected", "തിരഞ്ഞെടുത്തു")}`;
  };

  if (options.length === 0) return null;

  return (
    <div className="space-y-1">
      <label className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">
        {title}
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full h-9 px-3 rounded-lg border flex items-center justify-between text-xs font-semibold transition-all bg-white cursor-pointer select-none text-left shadow-2xs",
              selectedValues.length > 0
                ? "border-amber-400 bg-[#FFF8F0] text-amber-950 font-bold"
                : "border-border text-slate-800 hover:border-amber-300 hover:bg-slate-50/50",
            )}
          >
            <span className="truncate pr-2">{getLabelText()}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2 text-xs bg-white shadow-xl border border-amber-200 rounded-xl space-y-2 z-50">
          {options.length > 4 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr("Search...", "തിരയുക...")}
                className="w-full h-8 pl-8 pr-2 text-xs rounded-md border border-border bg-slate-50 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between px-1.5 py-1 border-b border-slate-100 text-[11px]">
            <span className="font-bold text-slate-500">
              {selectedValues.length > 0 ? `${selectedValues.length} ${tr("selected", "തിരഞ്ഞെടുത്തു")}` : tr("All", "എല്ലാം")}
            </span>
            {selectedValues.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-amber-600 hover:text-amber-700 font-bold cursor-pointer hover:underline"
              >
                {tr("Clear", "നീക്കം ചെയ്യുക")}
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
            <div
              onClick={() => onChange([])}
              className={cn(
                "flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-xs transition-colors font-medium",
                selectedValues.length === 0
                  ? "bg-amber-50 text-amber-900 font-bold"
                  : "hover:bg-slate-100 text-slate-700",
              )}
            >
              <span>{tr("All", "എല്ലാം")}</span>
              {selectedValues.length === 0 && <Check className="h-3.5 w-3.5 text-amber-600 stroke-[2.5]" />}
            </div>

            {filteredOptions.map((opt) => {
              const isChecked = selectedValues.includes(opt);
              return (
                <div
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={cn(
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-md cursor-pointer text-xs transition-colors select-none",
                    isChecked
                      ? "bg-[#FFF8F0] text-amber-950 font-bold"
                      : "hover:bg-slate-100 text-slate-700 font-medium",
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-md border shrink-0 flex items-center justify-center transition-colors",
                      isChecked
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-slate-300 bg-white",
                    )}
                  >
                    {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <span className="truncate flex-1">{opt}</span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SchemesPage() {
  const { lang } = useLang();
  const tr = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const navigate = useNavigate();
  const topSearchQuery = useAdminTopSearch();
  const [disabledSchemeIds, setDisabledSchemeIds] = useState<Set<string>>(() => new Set());
  const [deletedSchemeIds, setDeletedSchemeIds] = useState<Set<string>>(() => new Set());
  const [selectedSchemeIds, setSelectedSchemeIds] = useState<Set<string>>(() => new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<SchemeColumnKey>>(
    () => new Set(SCHEME_COLUMNS.map((column) => column.key)),
  );
  const [columnOrder, setColumnOrder] = useState<SchemeColumnKey[]>(() =>
    SCHEME_COLUMNS.map((column) => column.key),
  );
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);

  const handleDragStartColumn = (index: number) => {
    setDraggedColumnIndex(index);
  };

  const handleDragOverColumn = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropColumn = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === dropIndex) return;
    const nextOrder = [...columnOrder];
    const [moved] = nextOrder.splice(draggedColumnIndex, 1);
    nextOrder.splice(dropIndex, 0, moved);
    setColumnOrder(nextOrder);
    setDraggedColumnIndex(null);
  };

  // Filter states matching User Filter approach
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const allMinistryOptions = useMemo(() => {
    const dynamic = Array.from(new Set(schemes.map((s) => s.ministry.en)));
    const combined = Array.from(new Set([...PRESET_MINISTRIES, ...dynamic]));
    return combined.sort();
  }, []);

  const records = useMemo(
    () =>
      schemes.map((scheme, index) => {
        const categoryDisplay = getCategoryDisplay(scheme.category);
        const beneficiaries = getBeneficiariesForScheme(scheme);
        const status = disabledSchemeIds.has(scheme.id)
          ? "Inactive"
          : index % 11 === 0
            ? "Draft"
            : index % 13 === 0
              ? "Archived"
              : "Active";

        const totalApps = 38 + ((index * 17) % 148);
        const approved = Math.floor(totalApps * 0.55);
        const rejected = Math.floor(totalApps * 0.12);
        const inProgress = Math.floor(totalApps * 0.18);
        const pending = totalApps - approved - rejected - inProgress;

        return {
          ...scheme,
          mode: modes[index % modes.length],
          source:
            index % 3 === 0
              ? "Official ministry"
              : index % 3 === 1
                ? "myScheme reference"
                : "Department portal",
          verifiedDays: index % 6,
          applications: totalApps,
          approved,
          rejected,
          pending,
          inProgress,
          sync: index % 7 === 0 ? "Needs checking" : "Up to date",
          categoryDisplay,
          ministryDisplay: scheme.ministry.en,
          beneficiaries,
          status,
        };
      }),
    [disabledSchemeIds],
  );

  const filtered = useMemo(() => {
    return records.filter((record) => {
      if (deletedSchemeIds.has(record.id)) return false;

      const q = topSearchQuery.trim().toLowerCase();
      if (q) {
        const matchesSearch =
          record.en.toLowerCase().includes(q) ||
          record.ml.toLowerCase().includes(q) ||
          record.category.toLowerCase().includes(q) ||
          record.ministry.en.toLowerCase().includes(q) ||
          record.ministry.ml.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 1. Category Filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(record.categoryDisplay)) return false;
      }

      // 2. Ministry Filter
      if (selectedMinistries.length > 0) {
        const recordMinistry = record.ministryDisplay;
        const matchesMinistry = selectedMinistries.some(
          (m) =>
            recordMinistry.toLowerCase().includes(m.toLowerCase()) ||
            m.toLowerCase().includes(recordMinistry.toLowerCase()),
        );
        if (!matchesMinistry) return false;
      }

      // 3. Status Filter
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(record.status)) return false;
      }

      // 4. Target Beneficiary Filter
      if (selectedBeneficiaries.length > 0) {
        const matchesBeneficiary = record.beneficiaries.some((b) =>
          selectedBeneficiaries.includes(b),
        );
        if (!matchesBeneficiary) return false;
      }

      return true;
    });
  }, [
    records,
    deletedSchemeIds,
    topSearchQuery,
    selectedCategories,
    selectedMinistries,
    selectedStatuses,
    selectedBeneficiaries,
  ]);

  const activeFilterCount =
    selectedCategories.length +
    selectedMinistries.length +
    selectedStatuses.length +
    selectedBeneficiaries.length;

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedMinistries([]);
    setSelectedStatuses([]);
    setSelectedBeneficiaries([]);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedFiltered = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const toggleSchemeEnabled = (record: (typeof records)[number]) => {
    const isDisabled = disabledSchemeIds.has(record.id);
    setDisabledSchemeIds((current) => {
      const next = new Set(current);
      if (isDisabled) next.delete(record.id);
      else next.add(record.id);
      return next;
    });
    toast.success(
      isDisabled
        ? lang === "ml"
          ? "പദ്ധതി വീണ്ടും സജീവമാക്കി"
          : "Scheme enabled"
        : lang === "ml"
          ? "പദ്ധതി നിർജ്ജീവമാക്കി"
          : "Scheme disabled",
    );
  };

  const handleBulkEnable = () => {
    setDisabledSchemeIds((prev) => {
      const next = new Set(prev);
      selectedSchemeIds.forEach((id) => next.delete(id));
      return next;
    });
    toast.success(
      lang === "ml"
        ? `${selectedSchemeIds.size} പദ്ധതികൾ സജീവമാക്കി`
        : `Enabled ${selectedSchemeIds.size} scheme(s)`,
    );
    setSelectedSchemeIds(new Set());
  };

  const handleBulkDisable = () => {
    setDisabledSchemeIds((prev) => {
      const next = new Set(prev);
      selectedSchemeIds.forEach((id) => next.add(id));
      return next;
    });
    toast.success(
      lang === "ml"
        ? `${selectedSchemeIds.size} പദ്ധതികൾ നിർജ്ജീവമാക്കി`
        : `Disabled ${selectedSchemeIds.size} scheme(s)`,
    );
    setSelectedSchemeIds(new Set());
  };

  const handleBulkDelete = () => {
    const confirmed = window.confirm(
      lang === "ml"
        ? `തിരഞ്ഞെടുത്ത ${selectedSchemeIds.size} പദ്ധതികൾ ഡിലീറ്റ് ചെയ്യണോ?`
        : `Delete ${selectedSchemeIds.size} selected scheme(s)?`,
    );
    if (!confirmed) return;
    setDeletedSchemeIds((prev) => {
      const next = new Set(prev);
      selectedSchemeIds.forEach((id) => next.add(id));
      return next;
    });
    toast.success(
      lang === "ml"
        ? `${selectedSchemeIds.size} പദ്ധതികൾ ഡിലീറ്റ് ചെയ്തു`
        : `Deleted ${selectedSchemeIds.size} scheme(s)`,
    );
    setSelectedSchemeIds(new Set());
  };

  const toggleColumn = (key: SchemeColumnKey) => {
    setVisibleColumns((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const shareScheme = async (record: (typeof records)[number]) => {
    const shareUrl = `${window.location.origin}/schemes/${record.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: record[lang], url: shareUrl });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(lang === "ml" ? "പദ്ധതി ലിങ്ക് പകർത്തി" : "Scheme link copied");
    } catch {
      toast.info(shareUrl);
    }
  };

  const deleteScheme = (record: (typeof records)[number]) => {
    const confirmed = window.confirm(
      lang === "ml"
        ? `"${record[lang]}" എന്ന പദ്ധതി ഡിലീറ്റ് ചെയ്യണോ?`
        : `Delete "${record[lang]}"?`,
    );
    if (!confirmed) return;
    setDeletedSchemeIds((current) => new Set(current).add(record.id));
    toast.success(lang === "ml" ? "പദ്ധതി ഡിലീറ്റ് ചെയ്തു" : "Scheme deleted");
  };

  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return "table";
    }
    return "cards";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewMode(window.innerWidth >= 768 ? "table" : "cards");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const desktopQuery = window.matchMedia("(min-width: 640px)");
    const sync = () => root.classList.toggle("desktop-hide-page-scrollbar", desktopQuery.matches);
    sync();
    desktopQuery.addEventListener("change", sync);
    return () => {
      desktopQuery.removeEventListener("change", sync);
      root.classList.remove("desktop-hide-page-scrollbar");
    };
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Merged Single Section Container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        {/* Top Header Row with Title & Filter / Export / Import / Add Scheme Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-base font-bold text-foreground">
              {lang === "ml"
                ? `പദ്ധതി പട്ടിക (${filtered.length})`
                : `Schemes List (${filtered.length})`}
            </h2>

            {selectedSchemeIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 bg-white dark:bg-card border border-border/80 rounded-full px-3 py-1 text-xs shadow-2xs animate-in fade-in transition-all">
                <span className="font-extrabold text-foreground text-[11px]">
                  {tr(
                    `${selectedSchemeIds.size} of ${filtered.length} selected`,
                    `${selectedSchemeIds.size} / ${filtered.length} തിരഞ്ഞെടുത്തു`,
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSchemeIds(new Set())}
                  className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer text-[11px]"
                >
                  {tr("Deselect All", "എല്ലാം ഒഴിവാക്കുക")}
                </button>
                <div className="h-3.5 w-px bg-border mx-0.5" />
                <button
                  type="button"
                  onClick={handleBulkEnable}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer transition-colors"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{tr("Enable", "സജീവമാക്കുക")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkDisable}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{tr("Disable", "നിർജ്ജീവമാക്കുക")}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast.success(
                      lang === "ml"
                        ? `തിരഞ്ഞെടുത്ത ${selectedSchemeIds.size} പദ്ധതി വിവരങ്ങൾ എക്സ്പോർട്ട് ചെയ്തു`
                        : `Exported ${selectedSchemeIds.size} scheme(s)`,
                    )
                  }
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-card px-2.5 py-0.5 text-[11px] font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-slate-900 dark:text-slate-100" />
                  <span>{tr("Export", "എക്സ്പോർട്ട്")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  <span>{tr("Delete", "ഡിലീറ്റ് ചെയ്യുക")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Controls on the Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar desktop-hide-scrollbar pb-0.5 max-w-full sm:ml-auto shrink-0">
            {/* Column Management */}
            {/* Manage Columns Button (Desktop) */}
            <button
              type="button"
              onClick={() => setIsManageColumnsOpen(true)}
              aria-label={lang === "ml" ? "നിരകൾ കൈകാര്യം ചെയ്യുക" : "Manage columns"}
              title={lang === "ml" ? "നിരകൾ കൈകാര്യം ചെയ്യുക" : "Manage columns"}
              className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-xl sm:rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
            >
              <Columns3 className="h-4 w-4" />
            </button>

            {/* View Mode Toggle Switch (Hidden on Desktop) */}
            <div className="hidden flex items-center rounded-xl sm:rounded-lg border border-border bg-background p-0.5 shrink-0 md:hidden">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-lg sm:rounded-md px-3 py-1 text-[13px] leading-tight font-semibold transition-all ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={lang === "ml" ? "പട്ടിക വ്യൂ" : "Table View"}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">{lang === "ml" ? "പട്ടിക" : "List"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1 rounded-lg sm:rounded-md px-3 py-1 text-[13px] leading-tight font-semibold transition-all ${
                  viewMode === "cards"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={lang === "ml" ? "കാർഡ് വ്യൂ" : "Card View"}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">{lang === "ml" ? "കാർഡ്" : "Cards"}</span>
              </button>
            </div>

            {/* Actions Group: Filter, Import, Export */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Filter Dropdown Menu (Identical to User Filter) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl sm:rounded-lg border px-3.5 py-1.5 text-[13px] leading-tight font-semibold transition-colors shrink-0 cursor-pointer",
                      activeFilterCount > 0
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span>{tr("Filter", "ഫിൽട്ടർ")}</span>
                    {activeFilterCount > 0 && (
                      <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-3 text-xs space-y-3 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border">
                    <span className="font-bold text-foreground text-xs">
                      {tr("Filter Schemes", "പദ്ധതികൾ ഫിൽട്ടർ ചെയ്യുക")}
                    </span>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {tr("Reset All", "എല്ലാം റീസെറ്റ് ചെയ്യുക")}
                      </button>
                    )}
                  </div>

                  {/* 1. Scheme Category Filter */}
                  <FilterDropdownSelector
                    title={tr("SCHEME CATEGORY", "പദ്ധതി വിഭാഗം")}
                    placeholder={tr("Select Category", "വിഭാഗം തിരഞ്ഞെടുക്കുക")}
                    options={CATEGORY_OPTIONS}
                    selectedValues={selectedCategories}
                    onChange={setSelectedCategories}
                    tr={tr}
                  />

                  {/* 2. Ministry / Department Filter */}
                  <FilterDropdownSelector
                    title={tr("MINISTRY / DEPARTMENT", "മന്ത്രാലയം / വകുപ്പ്")}
                    placeholder={tr("Select Ministry", "മന്ത്രാലയം തിരഞ്ഞെടുക്കുക")}
                    options={allMinistryOptions}
                    selectedValues={selectedMinistries}
                    onChange={setSelectedMinistries}
                    tr={tr}
                  />

                  {/* 3. Scheme Status Filter */}
                  <FilterDropdownSelector
                    title={tr("SCHEME STATUS", "പദ്ധതി സ്റ്റാറ്റസ്")}
                    placeholder={tr("Select Status", "സ്റ്റാറ്റസ് തിരഞ്ഞെടുക്കുക")}
                    options={STATUS_OPTIONS}
                    selectedValues={selectedStatuses}
                    onChange={setSelectedStatuses}
                    tr={tr}
                  />

                  {/* 4. Target Beneficiary Filter */}
                  <FilterDropdownSelector
                    title={tr("TARGET BENEFICIARY", "ലക്ഷ്യ ഗുണഭോക്താവ്")}
                    placeholder={tr("Select Beneficiary", "ഗുണഭോക്താവ് തിരഞ്ഞെടുക്കുക")}
                    options={BENEFICIARY_OPTIONS}
                    selectedValues={selectedBeneficiaries}
                    onChange={setSelectedBeneficiaries}
                    tr={tr}
                  />
                </DropdownMenuContent>
              </DropdownMenu>

            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/admin/schemes/new"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl sm:rounded-lg bg-primary px-4 py-1.5 text-[13px] leading-tight font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                {lang === "ml" ? "പുതിയ പദ്ധതി ചേർക്കുക" : "Add scheme"}
              </Link>

              {/* 3-dot menu near Add scheme for Import / Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={tr("More Options", "കൂടുതൽ ഓപ്ഷനുകൾ")}
                    className="flex h-8 w-8 items-center justify-center rounded-xl sm:rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onSelect={() =>
                      toast.info(lang === "ml" ? "ഇമ്പോർട്ട് സൗകര്യം ലഭ്യമാണ്" : "Import feature ready")
                    }
                    className="gap-2 cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    {lang === "ml" ? "ഇമ്പോർട്ട്" : "Import"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      toast.success(
                        lang === "ml" ? "എല്ലാ പദ്ധതി വിവരങ്ങളും എക്സ്പോർട്ട് ചെയ്തു" : "All schemes exported",
                      )
                    }
                    className="gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    {lang === "ml" ? "എക്സ്പോർട്ട്" : "Export"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Cards View */}
        {viewMode === "cards" && (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {paginatedFiltered.map((record) => {
              const isSelected = selectedSchemeIds.has(record.id);
              return (
                <div
                  key={record.id}
                  onClick={() =>
                    navigate({ to: "/admin/schemes/$schemeId", params: { schemeId: record.id } })
                  }
                  className={`rounded-xl border bg-card p-4 space-y-3 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer ${
                    isSelected ? "border-primary/50 bg-primary/[0.04]" : "border-border/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            setSelectedSchemeIds((prev) => {
                              const next = new Set(prev);
                              if (checked) next.add(record.id);
                              else next.delete(record.id);
                              return next;
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-sm text-foreground leading-snug">
                          {record[lang]}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-medium truncate">
                          {record.ministry[lang]} · {record.categoryDisplay}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold border shrink-0 ${
                        record.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : record.status === "Inactive"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <ModePill mode={record.mode} />
                    <span className="font-mono font-bold text-xs text-foreground bg-muted px-2 py-0.5 rounded-md">
                      {record.applications} apps
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <span className="text-[11px]">
                      {record.verifiedDays === 0
                        ? "Verified today"
                        : `Verified ${record.verifiedDays}d ago`}
                    </span>
                    <span className="font-semibold text-primary flex items-center gap-0.5">
                      Manage scheme <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Data Table View */}
        {viewMode === "table" && (
          <div className="overflow-x-auto desktop-hide-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3.5 pl-4 sm:pl-5 pr-2 w-10 text-center">
                    <Checkbox
                      checked={
                        paginatedFiltered.length > 0 &&
                        paginatedFiltered.every((record) => selectedSchemeIds.has(record.id))
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSchemeIds((prev) => {
                            const next = new Set(prev);
                            paginatedFiltered.forEach((r) => next.add(r.id));
                            return next;
                          });
                        } else {
                          setSelectedSchemeIds((prev) => {
                            const next = new Set(prev);
                            paginatedFiltered.forEach((r) => next.delete(r.id));
                            return next;
                          });
                        }
                      }}
                    />
                  </th>
                  {columnOrder.map((colKey) => {
                    if (!visibleColumns.has(colKey)) return null;
                    switch (colKey) {
                      case "scheme":
                        return (
                          <th key="scheme" className="py-3.5 pl-2 pr-3 whitespace-nowrap">
                            {lang === "ml" ? "പദ്ധതിയുടെ പേര്" : "SCHEME NAME"}
                          </th>
                        );
                      case "category":
                        return (
                          <th key="category" className="p-3.5 whitespace-nowrap">
                            {lang === "ml" ? "വിഭാഗം" : "CATEGORY"}
                          </th>
                        );
                      case "portal":
                        return (
                          <th key="portal" className="p-3.5 whitespace-nowrap">
                            {lang === "ml" ? "പോർട്ടൽ തുറക്കുക" : "APPLY LINK"}
                          </th>
                        );
                      case "website":
                        return (
                          <th key="website" className="p-3.5 whitespace-nowrap">
                            {lang === "ml" ? "ഔദ്യോഗിക വെബ്‌സൈറ്റ്" : "OFFICIAL WEBSITE"}
                          </th>
                        );
                      case "status":
                        return (
                          <th key="status" className="p-3.5 whitespace-nowrap">
                            {lang === "ml" ? "സ്റ്റാറ്റസ്" : "STATUS"}
                          </th>
                        );
                      case "applications":
                        return (
                          <th key="applications" className="p-3.5 text-right whitespace-nowrap">
                            {lang === "ml" ? "അപേക്ഷകൾ" : "APPLICATIONS"}
                          </th>
                        );
                      case "approved":
                        return (
                          <th key="approved" className="p-3.5 text-right whitespace-nowrap">
                            {lang === "ml" ? "അംഗീകരിച്ചത്" : "APPROVED"}
                          </th>
                        );
                      case "rejected":
                        return (
                          <th key="rejected" className="p-3.5 text-right whitespace-nowrap">
                            {lang === "ml" ? "നിരസിച്ചത്" : "REJECTED"}
                          </th>
                        );
                      case "pending":
                        return (
                          <th key="pending" className="p-3.5 text-right whitespace-nowrap">
                            {lang === "ml" ? "തീർപ്പുകൽപ്പിക്കാത്തത്" : "PENDING"}
                          </th>
                        );
                      case "inProgress":
                        return (
                          <th key="inProgress" className="p-3.5 text-right whitespace-nowrap">
                            {lang === "ml" ? "പുരോഗതിയിൽ" : "IN PROGRESS"}
                          </th>
                        );
                      case "actions":
                        return (
                          <th key="actions" className="py-3.5 pl-3 pr-4 sm:pr-5 text-right whitespace-nowrap">
                            {lang === "ml" ? "നടപടികൾ" : "ACTIONS"}
                          </th>
                        );
                      default:
                        return null;
                    }
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {paginatedFiltered.map((record) => {
                  const isSelected = selectedSchemeIds.has(record.id);
                  return (
                    <tr
                      key={record.id}
                      onClick={() =>
                        navigate({ to: "/admin/schemes/$schemeId", params: { schemeId: record.id } })
                      }
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/[0.04] hover:bg-primary/[0.08]" : "hover:bg-muted/40"
                      }`}
                    >
                      <td
                        className="py-3.5 pl-4 sm:pl-5 pr-2 w-10 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            setSelectedSchemeIds((prev) => {
                              const next = new Set(prev);
                              if (checked) next.add(record.id);
                              else next.delete(record.id);
                              return next;
                            });
                          }}
                        />
                      </td>
                      {columnOrder.map((colKey) => {
                        if (!visibleColumns.has(colKey)) return null;
                        switch (colKey) {
                          case "scheme":
                            return (
                              <td key="scheme" className="py-3.5 pl-2 pr-3 min-w-44 max-w-80">
                                <div className="flex items-center gap-2.5">
                                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white p-1 shadow-2xs">
                                    <img
                                      src={schemeLogoUrls[record.id] ?? schemeLogoFallback}
                                      alt=""
                                      className="h-full w-full object-contain"
                                      loading="lazy"
                                      onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src = schemeLogoFallback;
                                      }}
                                    />
                                  </span>
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-foreground leading-snug">{record[lang]}</p>
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                      {record.ministry[lang]}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            );
                          case "category":
                            return (
                              <td key="category" className="p-3.5">
                                <CategoryTag category={record.category} lang={lang} />
                              </td>
                            );
                          case "portal":
                            return (
                              <td key="portal" className="p-3.5 whitespace-nowrap">
                                <a
                                  href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(record.en)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(event) => event.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                >
                                  {lang === "ml" ? "പോർട്ടൽ തുറക്കുക" : "Apply Link"}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </td>
                            );
                          case "website":
                            return (
                              <td key="website" className="p-3.5 whitespace-nowrap">
                                <a
                                  href={
                                    record.id === "pmkisan"
                                      ? "https://pmkisan.gov.in"
                                      : record.id === "pmjjby" || record.id === "pmsby" || record.id === "apy"
                                        ? "https://financialservices.gov.in"
                                        : record.id === "pmay"
                                          ? "https://pmaymis.gov.in"
                                          : record.id === "ujjwala"
                                            ? "https://pmuy.gov.in"
                                            : record.id === "mudra"
                                              ? "https://www.mudra.org.in"
                                              : `https://www.india.gov.in/search?title=${encodeURIComponent(record.en)}`
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(event) => event.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                >
                                  {lang === "ml" ? "ഔദ്യോഗിക വെബ്‌സൈറ്റ്" : "Official Website"}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </td>
                            );
                          case "status":
                            return (
                              <td key="status" className="p-3.5">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                                    record.status === "Active"
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                      : record.status === "Inactive"
                                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                        : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                                  }`}
                                >
                                  {record.status}
                                </span>
                              </td>
                            );
                          case "applications":
                            return (
                              <td key="applications" className="p-3.5 text-right font-mono text-foreground font-bold whitespace-nowrap">
                                {record.applications.toLocaleString()}
                              </td>
                            );
                          case "approved":
                            return (
                              <td key="approved" className="p-3.5 text-right font-mono text-emerald-600 font-bold whitespace-nowrap">
                                {record.approved.toLocaleString()}
                              </td>
                            );
                          case "rejected":
                            return (
                              <td key="rejected" className="p-3.5 text-right font-mono text-rose-600 font-bold whitespace-nowrap">
                                {record.rejected.toLocaleString()}
                              </td>
                            );
                          case "pending":
                            return (
                              <td key="pending" className="p-3.5 text-right font-mono text-amber-600 font-bold whitespace-nowrap">
                                {record.pending.toLocaleString()}
                              </td>
                            );
                          case "inProgress":
                            return (
                              <td key="inProgress" className="p-3.5 text-right font-mono text-sky-600 font-bold whitespace-nowrap">
                                {record.inProgress.toLocaleString()}
                              </td>
                            );
                          case "actions":
                            return (
                              <td
                                key="actions"
                                className="py-3.5 pl-3 pr-4 sm:pr-5 text-right"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type="button"
                                        aria-label={lang === "ml" ? "കൂടുതൽ നടപടികൾ" : "More actions"}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem
                                        onSelect={() =>
                                          navigate({
                                            to: "/admin/schemes/new",
                                            search: { edit: record.id },
                                          })
                                        }
                                        className="gap-2 cursor-pointer"
                                      >
                                        <Pencil className="h-4 w-4" />
                                        {lang === "ml" ? "തിരുത്തുക" : "Edit"}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onSelect={() => toggleSchemeEnabled(record)}
                                        className="gap-2 cursor-pointer"
                                      >
                                        <Power className="h-4 w-4" />
                                        {disabledSchemeIds.has(record.id)
                                          ? lang === "ml"
                                            ? "സജീവമാക്കുക"
                                            : "Enable scheme"
                                          : lang === "ml"
                                            ? "നിർജ്ജീവമാക്കുക"
                                            : "Disable scheme"}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onSelect={() => void shareScheme(record)}
                                        className="gap-2 cursor-pointer"
                                      >
                                        <Share2 className="h-4 w-4" />
                                        {lang === "ml" ? "പങ്കിടുക" : "Share"}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onSelect={() => deleteScheme(record)}
                                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        {lang === "ml" ? "ഡിലീറ്റ് ചെയ്യുക" : "Delete"}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            );
                          default:
                            return null;
                        }
                      })}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-muted-foreground">
                      {lang === "ml"
                        ? "തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകൾക്ക് അനുയോജ്യമായ പദ്ധതികളില്ല."
                        : "No schemes match the selected filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border p-4 bg-muted/10 text-xs text-muted-foreground font-semibold">
            <div>
              {lang === "ml"
                ? `${filtered.length} പദ്ധതികളിൽ ${Math.min((currentPage - 1) * pageSize + 1, filtered.length)} മുതൽ ${Math.min(currentPage * pageSize, filtered.length)} വരെ കാണിക്കുന്നു`
                : `Showing ${Math.min((currentPage - 1) * pageSize + 1, filtered.length)} to ${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length} schemes`}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {lang === "ml" ? "മുൻപത്തെ" : "Previous"}
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {lang === "ml" ? "അടുത്തത്" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Side Popup Sheet for Manage Columns */}
      <Sheet open={isManageColumnsOpen} onOpenChange={setIsManageColumnsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full p-0 gap-0 bg-white border-l border-border z-50">
          <SheetHeader className="p-5 border-b border-border bg-white text-left space-y-1">
            <SheetTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Columns3 className="h-5 w-5 text-primary" />
              <span>{lang === "ml" ? "നിരകൾ കൈകാര്യം ചെയ്യുക" : "Manage Columns"}</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {lang === "ml"
                ? "സ്ഥാനം മാറ്റാൻ ഡ്രാഗ് ചെയ്യുക, കാണിക്കാൻ/മറയ്ക്കാൻ ടിക്ക് ചെയ്യുക."
                : "Check to show or hide columns. Drag handle to reorder columns in the table."}
            </SheetDescription>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {visibleColumns.size} / {SCHEME_COLUMNS.length} {lang === "ml" ? "കാണിക്കുന്നു" : "visible"}
              </span>
              <button
                type="button"
                onClick={() =>
                  setVisibleColumns(new Set(SCHEME_COLUMNS.map((column) => column.key)))
                }
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                {lang === "ml" ? "എല്ലാം കാണിക്കുക" : "Show All"}
              </button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-2">
            {columnOrder.map((colKey, index) => {
              const colDef = SCHEME_COLUMNS.find((c) => c.key === colKey);
              if (!colDef) return null;
              const isChecked = visibleColumns.has(colKey);
              return (
                <div
                  key={colKey}
                  draggable
                  onDragStart={() => handleDragStartColumn(index)}
                  onDragOver={handleDragOverColumn}
                  onDrop={(e) => handleDropColumn(e, index)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-xs font-medium bg-white transition-all cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-2xs",
                    draggedColumnIndex === index
                      ? "opacity-40 border-primary bg-primary/5"
                      : "border-border/70",
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
                  <Checkbox
                    id={`sheet-col-scheme-${colKey}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleColumn(colKey)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label
                    htmlFor={`sheet-col-scheme-${colKey}`}
                    className="flex-1 cursor-pointer select-none font-bold text-foreground truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {lang === "ml" ? colDef.ml : colDef.en}
                  </label>
                </div>
              );
            })}
          </div>

          <SheetFooter className="p-4 border-t border-border bg-slate-50 flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              onClick={() => setIsManageColumnsOpen(false)}
              className="w-full sm:w-auto h-9 px-5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {lang === "ml" ? "ശരി" : "Done"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Mobile Sticky Floating Plus Button */}
      <div className="fixed bottom-6 right-5 z-50 sm:hidden">
        <Link
          to="/admin/schemes/new"
          className="flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
          aria-label={lang === "ml" ? "പുതിയ പദ്ധതി ചേർക്കുക" : "Add scheme"}
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
