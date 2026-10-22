import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Database,
  ExternalLink,
  Filter,
  Download,
  LayoutGrid,
  List,
  Link2,
  RefreshCw,
  Sparkles,
  Layers,
  Landmark,
  Building2,
  Plus,
} from "lucide-react";
import { schemes } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";

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

function SchemesPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState("All");
  const [syncStatus, setSyncStatus] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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
    return (
      (mode === "All" || record.mode === mode) &&
      (syncStatus === "All" || record.sync === syncStatus)
    );
  });

  const [timeRange, setTimeRange] = useState("30days");
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
  const activeFilterCount = (mode !== "All" ? 1 : 0) + (syncStatus !== "All" ? 1 : 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Merged Single Section Container */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-5">
        
        {/* Top Header Row with Title & Filter / Export / Add Scheme Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {lang === "ml" ? "പദ്ധതി പട്ടിക & അവലോകനം" : "Schemes Directory & Overview"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {lang === "ml" ? "സംസ്ഥാന-കേന്ദ്ര വികസന പദ്ധതികളുടെ വിശദാംശങ്ങൾ" : "Manage scheme details, eligibility rules and application channels"}
            </p>
          </div>

          {/* Filter, Export & Add Scheme Controls on the Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5 max-w-full sm:ml-auto shrink-0">
            {/* View Mode Toggle Switch */}
            <div className="flex items-center rounded-xl border border-border bg-background p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={lang === "ml" ? "പട്ടിക വ്യൂ" : "Table View"}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lang === "ml" ? "പട്ടിക" : "List"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === "cards"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={lang === "ml" ? "കാർഡ് വ്യൂ" : "Card View"}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lang === "ml" ? "കാർഡ്" : "Cards"}</span>
              </button>
            </div>

            {/* Time Range Selector Dropdown */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-8 rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
            >
              <option value="today">{lang === "ml" ? "ഇന്ന്" : "Today"}</option>
              <option value="7days">{lang === "ml" ? "7 ദിവസങ്ങൾ" : "7 Days"}</option>
              <option value="30days">{lang === "ml" ? "30 ദിവസങ്ങൾ" : "30 Days"}</option>
              <option value="60days">{lang === "ml" ? "60 ദിവസങ്ങൾ" : "60 Days"}</option>
              <option value="1year">{lang === "ml" ? "1 വർഷം" : "1 Year"}</option>
            </select>

            {/* Filter and Export Actions Pair */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Filter Button with Popover Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                    activeFilterCount > 0 || showFilterMenu
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
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
                        <option value="All">{lang === "ml" ? "എല്ലാ രീതികളും" : "All Modes"}</option>
                        {modes.map((item) => (
                          <option key={item} value={item}>{item}</option>
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
                        <option value="All">{lang === "ml" ? "എല്ലാ സ്റ്റാറ്റസുകളും" : "All Statuses"}</option>
                        <option value="Up to date">{lang === "ml" ? "അപ്-ടു-ഡേറ്റ്" : "Up to date"}</option>
                        <option value="Needs checking">{lang === "ml" ? "പരിശോധന വേണം" : "Needs checking"}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shrink-0"
                title={lang === "ml" ? "എക്സ്പോർട്ട്" : "Export"}
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">{lang === "ml" ? "എക്സ്പോർട്ട്" : "Export"}</span>
              </button>
            </div>
            <Link
              to="/admin/schemes/new"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              {lang === "ml" ? "പുതിയ പദ്ധതി ചേർക്കുക" : "Add scheme"}
            </Link>
          </div>
        </div>

        {/* Embedded Status KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Total Schemes */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "ആകെ പദ്ധതികൾ" : "TOTAL SCHEMES"}</span>
              <Database className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-foreground">128</p>
            <span className="text-[10px] text-muted-foreground font-semibold block">{lang === "ml" ? "ലഭ്യമായ എല്ലാ പദ്ധതികളും" : "All available schemes"}</span>
          </div>

          {/* Card 2: Scheme Categories */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "പദ്ധതി വിഭാഗങ്ങൾ" : "SCHEME CATEGORIES"}</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-foreground">16</p>
            <span className="text-[10px] text-muted-foreground font-semibold block">{lang === "ml" ? "പ്രധാന ക്ഷേമ മേഖലകളിൽ" : "Across major welfare sectors"}</span>
          </div>

          {/* Card 3: Central Schemes */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "കേന്ദ്ര പദ്ധതികൾ" : "CENTRAL SCHEMES"}</span>
              <Building2 className="h-4 w-4 text-sky-600" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-sky-600">43</p>
            <span className="text-[10px] text-muted-foreground font-semibold block">{lang === "ml" ? "ഇന്ത്യൻ കേന്ദ്ര സർക്കാരിന്റെ പദ്ധതികൾ" : "Government of India schemes"}</span>
          </div>

          {/* Card 4: State Schemes */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "സംസ്ഥാന പദ്ധതികൾ" : "STATE SCHEMES"}</span>
              <Landmark className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-emerald-600">85</p>
            <span className="text-[10px] text-muted-foreground font-semibold block">{lang === "ml" ? "കേരള സംസ്ഥാന സർക്കാരിന്റെ പദ്ധതികൾ" : "Government of Kerala schemes"}</span>
          </div>
        </div>

        {/* Cards View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                    <h4 className="font-bold text-sm text-foreground leading-snug">{record[lang]}</h4>
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
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">{lang === "ml" ? "പദ്ധതി" : "SCHEME NAME"}</th>
                  <th className="p-3">{lang === "ml" ? "സോഴ്സ്" : "OFFICIAL SOURCE"}</th>
                  <th className="p-3">{lang === "ml" ? "അപേക്ഷിക്കേണ്ട വിധം" : "HOW TO APPLY"}</th>
                  <th className="p-3">{lang === "ml" ? "അവസാനം പരിശോധിച്ചത്" : "LAST CHECKED"}</th>
                  <th className="p-3 text-right">{lang === "ml" ? "അപേക്ഷകൾ" : "APPLICATIONS"}</th>
                  <th className="p-3">{lang === "ml" ? "സ്റ്റാറ്റസ്" : "STATUS"}</th>
                  <th className="p-3" />
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
                    <td className="p-3 max-w-80">
                      <p className="font-bold text-foreground">{record[lang]}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {record.ministry[lang]} · {record.category}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs font-medium text-foreground">{record.source}</p>
                      <button
                        onClick={(event) => event.stopPropagation()}
                        className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        Open source <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="p-3">
                      <ModePill mode={record.mode} />
                    </td>
                    <td className="p-3">
                      <p className="text-xs font-medium text-foreground">
                        {record.verifiedDays === 0
                          ? "Verified today"
                          : `Verified ${record.verifiedDays}d ago`}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Eligibility rules saved
                      </p>
                    </td>
                    <td className="p-3 text-right font-mono text-foreground font-bold">{record.applications}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                          record.sync === "Up to date"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                        }`}
                      >
                        {record.sync}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <ChevronRight className="h-4 w-4 text-muted-foreground inline-block" />
                    </td>
                  </tr>
                ))}
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
