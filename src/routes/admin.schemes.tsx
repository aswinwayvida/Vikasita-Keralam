import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Filter,
  Download,
  LayoutGrid,
  List,
  Link2,
  RefreshCw,
  Sparkles,
  Plus,
  Power,
  MoreHorizontal,
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
} from "lucide-react";
import { schemes, type Scheme } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import schemeLogoFallback from "@/assets/kpi-3d/schemes.png";

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

type SchemeColumnKey = "scheme" | "department" | "category" | "portal" | "status" | "applications" | "actions";

const SCHEME_COLUMNS: { key: SchemeColumnKey; en: string; ml: string }[] = [
  { key: "scheme", en: "Scheme Name", ml: "പദ്ധതിയുടെ പേര്" },
  { key: "department", en: "Department (Ministry)", ml: "വകുപ്പ് (മന്ത്രാലയം)" },
  { key: "category", en: "Category", ml: "വിഭാഗം" },
  { key: "portal", en: "Open Portal", ml: "പോർട്ടൽ തുറക്കുക" },
  { key: "status", en: "Status", ml: "സ്റ്റാറ്റസ്" },
  { key: "applications", en: "Applications", ml: "അപേക്ഷകൾ" },
  { key: "actions", en: "Actions", ml: "നടപടികൾ" },
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

import { useAdminTopSearch } from "@/lib/admin-search-store";

function SchemesPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const topSearchQuery = useAdminTopSearch();
  const [mode, setMode] = useState("All");
  const [syncStatus, setSyncStatus] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [disabledSchemeIds, setDisabledSchemeIds] = useState<Set<string>>(() => new Set());
  const [deletedSchemeIds, setDeletedSchemeIds] = useState<Set<string>>(() => new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<SchemeColumnKey>>(
    () => new Set(SCHEME_COLUMNS.map((column) => column.key)),
  );

  const records = useMemo(
    () =>
      schemes.map((scheme, index) => ({
        ...scheme,
        mode: modes[index % modes.length],
        source:
          index % 3 === 0
            ? "Official ministry"
            : index % 3 === 1
              ? "myScheme reference"
              : "Department portal",
        verifiedDays: index % 6,
        applications: 38 + ((index * 17) % 148),
        sync: index % 7 === 0 ? "Needs checking" : "Up to date",
      })),
    [],
  );

  const filtered = records.filter((record) => {
    if (deletedSchemeIds.has(record.id)) return false;
    const matchesFilter =
      (mode === "All" || record.mode === mode) &&
      (syncStatus === "All" || record.sync === syncStatus);
    if (!matchesFilter) return false;
    const q = topSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      record.en.toLowerCase().includes(q) ||
      record.ml.toLowerCase().includes(q) ||
      record.category.toLowerCase().includes(q) ||
      record.ministry.en.toLowerCase().includes(q) ||
      record.ministry.ml.toLowerCase().includes(q)
    );
  });

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

  // Desktop only: hide the page scroll indicators on the Schemes List.
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

  const activeFilterCount = (mode !== "All" ? 1 : 0) + (syncStatus !== "All" ? 1 : 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Merged Single Section Container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        {/* Top Header Row with Title & Filter / Export / Add Scheme Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 p-4 sm:p-5">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {lang === "ml" ? "പദ്ധതി പട്ടിക (25)" : "Schemes List (25)"}
            </h2>
          </div>

          {/* Filter, Export & Add Scheme Controls on the Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar desktop-hide-scrollbar pb-0.5 max-w-full sm:ml-auto shrink-0">
            {/* Column Management */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={lang === "ml" ? "നിരകൾ കൈകാര്യം ചെയ്യുക" : "Manage columns"}
                  title={lang === "ml" ? "നിരകൾ കൈകാര്യം ചെയ്യുക" : "Manage columns"}
                  className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-xl sm:rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                >
                  <Columns3 className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">
                  {lang === "ml" ? "നിരകൾ കൈകാര്യം ചെയ്യുക" : "Manage Columns"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SCHEME_COLUMNS.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={visibleColumns.has(column.key)}
                    onCheckedChange={() => toggleColumn(column.key)}
                    onSelect={(event) => event.preventDefault()}
                    className="text-xs"
                  >
                    {lang === "ml" ? column.ml : column.en}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setVisibleColumns(new Set(SCHEME_COLUMNS.map((column) => column.key)))}
                  className="text-xs font-semibold text-primary"
                >
                  {lang === "ml" ? "എല്ലാ നിരകളും കാണിക്കുക" : "Show all columns"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle Switch */}
            <div className="flex items-center rounded-xl sm:rounded-lg border border-border bg-background p-0.5 shrink-0">
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

            {/* Filter and Export Actions Pair */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Filter Button with Popover Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`flex items-center gap-1.5 rounded-xl sm:rounded-lg border px-3.5 py-1.5 text-[13px] leading-tight font-semibold transition-colors shrink-0 ${
                    activeFilterCount > 0 || showFilterMenu
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  {lang === "ml" ? "ഫിൽട്ടറുകൾ" : "Filter"}
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 top-full mt-2 z-30 w-72 rounded-xl border border-border bg-card p-4 shadow-lg space-y-3.5">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h4 className="text-xs font-bold text-foreground">
                        {lang === "ml" ? "പദ്ധതി ഫിൽട്ടറുകൾ" : "Filter Schemes"}
                      </h4>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={() => {
                            setMode("All");
                            setSyncStatus("All");
                          }}
                          className="text-[11px] font-semibold text-primary hover:underline"
                        >
                          {lang === "ml" ? "റീസെറ്റ്" : "Reset all"}
                        </button>
                      )}
                    </div>

                    {/* Mode / Application Channel Filter */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        {lang === "ml" ? "അപേക്ഷിക്കുന്ന രീതി" : "Application Mode"}
                      </label>
                      <select
                        value={mode}
                        onChange={(event) => setMode(event.target.value)}
                        className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold outline-none"
                      >
                        <option value="All">
                          {lang === "ml" ? "എല്ലാ രീതികളും" : "All Modes"}
                        </option>
                        {modes.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Verification Sync Status Filter */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        {lang === "ml" ? "പരിശോധന സ്റ്റാറ്റസ്" : "Verification Status"}
                      </label>
                      <select
                        value={syncStatus}
                        onChange={(event) => setSyncStatus(event.target.value)}
                        className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold outline-none"
                      >
                        <option value="All">
                          {lang === "ml" ? "എല്ലാ സ്റ്റാറ്റസുകളും" : "All Statuses"}
                        </option>
                        <option value="Up to date">
                          {lang === "ml" ? "അപ്-ടു-ഡേറ്റ്" : "Up to date"}
                        </option>
                        <option value="Needs checking">
                          {lang === "ml" ? "പരിശോധന വേണം" : "Needs checking"}
                        </option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="flex items-center gap-1.5 rounded-xl sm:rounded-lg border border-border bg-background px-3 sm:px-4 py-1.5 text-[13px] leading-tight font-semibold text-foreground hover:bg-muted transition-colors shrink-0"
                title={lang === "ml" ? "എക്സ്പോർട്ട്" : "Export"}
              >
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline">
                  {lang === "ml" ? "എക്സ്പോർട്ട്" : "Export"}
                </span>
              </button>
            </div>
            <Link
              to="/admin/schemes/new"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl sm:rounded-lg bg-primary px-4 py-1.5 text-[13px] leading-tight font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              {lang === "ml" ? "പുതിയ പദ്ധതി ചേർക്കുക" : "Add scheme"}
            </Link>
          </div>
        </div>

        {/* Cards View */}
        {viewMode === "cards" && (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.map((record) => (
              <div
                key={record.id}
                onClick={() =>
                  navigate({ to: "/admin/schemes/$schemeId", params: { schemeId: record.id } })
                }
                className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-bold text-sm text-foreground leading-snug">
                      {record[lang]}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-medium truncate">
                      {record.ministry[lang]} · {record.category}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold border shrink-0 ${
                      record.sync === "Up to date"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                    }`}
                  >
                    {record.sync}
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
            ))}
          </div>
        )}

        {/* Data Table View */}
        {viewMode === "table" && (
          <div className="overflow-x-auto desktop-hide-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
                <tr>
                  {visibleColumns.has("scheme") && (
                    <th className="py-3.5 pl-4 sm:pl-5 pr-3 whitespace-nowrap">
                      {lang === "ml" ? "പദ്ധതിയുടെ പേര്" : "SCHEME NAME"}
                    </th>
                  )}
                  {visibleColumns.has("department") && (
                    <th className="p-3.5">
                      {lang === "ml" ? "വകുപ്പ് (മന്ത്രാലയം)" : "DEPARTMENT (MINISTRY)"}
                    </th>
                  )}
                  {visibleColumns.has("category") && (
                    <th className="p-3.5 whitespace-nowrap">{lang === "ml" ? "വിഭാഗം" : "CATEGORY"}</th>
                  )}
                  {visibleColumns.has("portal") && (
                    <th className="p-3.5 whitespace-nowrap">
                      {lang === "ml" ? "പോർട്ടൽ തുറക്കുക" : "OPEN PORTAL"}
                    </th>
                  )}
                  {visibleColumns.has("status") && (
                    <th className="p-3.5 whitespace-nowrap">
                      {lang === "ml" ? "സ്റ്റാറ്റസ്" : "STATUS"}
                    </th>
                  )}
                  {visibleColumns.has("applications") && (
                    <th className="p-3.5 text-right">{lang === "ml" ? "അപേക്ഷകൾ" : "APPLICATIONS"}</th>
                  )}
                  {visibleColumns.has("actions") && (
                    <th className="py-3.5 pl-3 pr-4 sm:pr-5 text-right whitespace-nowrap">
                      {lang === "ml" ? "നടപടികൾ" : "ACTIONS"}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {filtered.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() =>
                      navigate({ to: "/admin/schemes/$schemeId", params: { schemeId: record.id } })
                    }
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    {visibleColumns.has("scheme") && (
                    <td className="py-3.5 pl-4 sm:pl-5 pr-3 min-w-44 max-w-80">
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
                        <p className="font-bold text-foreground">{record[lang]}</p>
                      </div>
                    </td>
                    )}
                    {visibleColumns.has("department") && (
                      <td className="p-3.5 min-w-36 text-muted-foreground">{record.ministry[lang]}</td>
                    )}
                    {visibleColumns.has("category") && (
                      <td className="p-3.5">
                        <CategoryTag category={record.category} lang={lang} />
                      </td>
                    )}
                    {visibleColumns.has("portal") && (
                    <td className="p-3.5 whitespace-nowrap">
                      <a
                        href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(record.en)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        {lang === "ml" ? "പോർട്ടൽ തുറക്കുക" : "Open portal"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    )}
                    {visibleColumns.has("status") && (
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                          disabledSchemeIds.has(record.id)
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : record.sync === "Up to date"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                        }`}
                      >
                        {disabledSchemeIds.has(record.id)
                          ? lang === "ml"
                            ? "നിർജ്ജീവം"
                            : "Disabled"
                          : record.sync === "Up to date"
                            ? lang === "ml"
                              ? "സജീവം"
                              : "Active"
                            : lang === "ml"
                              ? "പരിശോധന വേണം"
                              : "Needs checking"}
                      </span>
                    </td>
                    )}
                    {visibleColumns.has("applications") && (
                      <td className="p-3.5 text-right font-mono text-foreground font-bold whitespace-nowrap">
                        {record.applications.toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.has("actions") && (
                    <td className="py-3.5 pl-3 pr-4 sm:pr-5 text-right" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            navigate({
                              to: "/admin/schemes/new",
                              search: { edit: record.id },
                            })
                          }
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[11px] font-semibold text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {lang === "ml" ? "തിരുത്തുക" : "Edit"}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label={lang === "ml" ? "കൂടുതൽ നടപടികൾ" : "More actions"}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
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
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
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
      </div>

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
