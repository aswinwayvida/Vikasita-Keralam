import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  LayoutList,
  Maximize2,
  PieChart,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import {
  OrgLevel,
  OrgPerformanceRow,
  orgPerformanceData,
} from "@/data/admin-dashboard-metrics";

interface BreadcrumbItem {
  id: string; // 'root' or orgPerformanceRow.id
  name: string; // 'Kerala State' or org.unit
  level: OrgLevel;
}

const moduleI18n = {
  en: {
    title: "Organisation Performance",
    subtitle: "Which organisational unit needs attention?",
    keralaState: "Kerala State",
    regions: "Regions",
    districts: "Districts",
    mandalams: "Mandalams",
    areas: "Areas",
    booths: "Booths",
    orgUnit: "Organisation Unit",
    resolutionRate: "Resolution Rate",
    avgResponse: "Avg Response",
    openCases: "Open Requests",
    overdueCases: "Overdue",
    status: "Status",
    healthy: "Healthy",
    watch: "Watch",
    needsAttention: "Needs Attention",
    sortBy: "Sort by:",
    sortAttentionFirst: "Needs Attention First",
    sortResLow: "Resolution Rate (Lowest First)",
    sortResHigh: "Resolution Rate (Highest First)",
    sortRespSlow: "Avg Response (Slowest First)",
    sortOverdueHigh: "Overdue Cases (Highest First)",
    sortOpenHigh: "Open Requests (Highest First)",
    searchPlaceholder: "Search organisation unit...",
    noDataFound: "No organisation units found matching your search.",
    page: "Page",
    of: "of",
    prev: "Previous",
    next: "Next",
    tableView: "Table View",
    donutView: "Donut Distribution",
    totalCasesDistribution: "Total Open Requests Distribution",
  },
  ml: {
    title: "സംഘടനാ പ്രകടനം",
    subtitle: "ഏത് യൂണിറ്റിനാണ് കൂടുതൽ ശ്രദ്ധ വേണ്ടത്?",
    keralaState: "കേരള സംസ്ഥാനം",
    regions: "മേഖലകൾ (Regions)",
    districts: "ജില്ലകൾ (Districts)",
    mandalams: "മണ്ഡലങ്ങൾ (Mandalams)",
    areas: "ഏരിയകൾ (Areas)",
    booths: "ബൂത്തുകൾ (Booths)",
    orgUnit: "സംഘടനാ യൂണിറ്റ്",
    resolutionRate: "പരിഹാര നിരക്ക്",
    avgResponse: "ശരാശരി പ്രതികരണം",
    openCases: "തുറന്ന കേസുകൾ",
    overdueCases: "വൈകിയ കേസുകൾ",
    status: "നിലവാരം",
    healthy: "തൃപ്തികരം (Healthy)",
    watch: "നിരീക്ഷണം (Watch)",
    needsAttention: "ശ്രദ്ധ ആവശ്യം (Needs Attention)",
    sortBy: "ക്രമീകരിക്കുക:",
    sortAttentionFirst: "ശ്രദ്ധ ആവശ്യമുള്ളവ ആദ്യം",
    sortResLow: "പരിഹാര നിരക്ക് (കുറഞ്ഞവ ആദ്യം)",
    sortResHigh: "പരിഹാര നിരക്ക് (കൂടിയവ ആദ്യം)",
    sortRespSlow: "ശരാശരി പ്രതികരണം (കൂടുതൽ സമയം)",
    sortOverdueHigh: "വൈകിയ കേസുകൾ (കൂടുതൽ ആദ്യം)",
    sortOpenHigh: "തുറന്ന കേസുകൾ (കൂടുതൽ ആദ്യം)",
    searchPlaceholder: "യൂണിറ്റ് തിരയുക...",
    noDataFound: "തിരച്ചിലിന് അനുയോജ്യമായ യൂണിറ്റുകൾ കണ്ടെത്താനായില്ല.",
    page: "പേജ്",
    of: "ൽ",
    prev: "മുൻപത്തേത്",
    next: "അടുത്തത്",
    tableView: "പട്ടിക കാഴ്‌ച (Table)",
    donutView: "ഡോനട്ട് ഡയഗ്രം (Donut)",
    totalCasesDistribution: "ആകെ തുറന്ന കേസുകളുടെ വിഭജനം",
  },
};

export function OrganisationPerformanceModule() {
  const { lang } = useLang();
  const t = moduleI18n[lang as keyof typeof moduleI18n] || moduleI18n.en;

  // Breadcrumb Trail State - Default starts at Root Kerala State
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: t.keralaState, level: "STATE" },
  ]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"TABLE" | "DONUT">("TABLE");
  const pageSize = 10;

  const activeBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

  // Determine current active level & parentId for filtering
  const currentLevel: OrgLevel =
    activeBreadcrumb.level === "STATE"
      ? "REGION"
      : activeBreadcrumb.level === "REGION"
      ? "DISTRICT"
      : activeBreadcrumb.level === "DISTRICT"
      ? "MANDALAM"
      : activeBreadcrumb.level === "MANDALAM"
      ? "AREA"
      : "BOOTH";

  const parentIdFilter = activeBreadcrumb.id === "root" ? "STATE-KL" : activeBreadcrumb.id;

  // Compute status for a row
  function computeStatus(row: OrgPerformanceRow) {
    const res = parseFloat(row.resolutionRate);
    const resp = parseFloat(row.avgResponse);
    if (res < 94.5 || row.overdue >= 20 || resp > 15.0) {
      return {
        key: "ATTENTION",
        label: t.needsAttention,
        badgeClass: "bg-destructive/10 text-destructive border-destructive/30",
        dotClass: "bg-destructive",
        icon: AlertTriangle,
      };
    }
    if (res < 96.0 || row.overdue >= 10 || resp > 13.0) {
      return {
        key: "WATCH",
        label: t.watch,
        badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/30",
        dotClass: "bg-amber-500",
        icon: AlertCircle,
      };
    }
    return {
      key: "HEALTHY",
      label: t.healthy,
      badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      dotClass: "bg-emerald-500",
      icon: CheckCircle2,
    };
  }

  // Filter Rows with Dynamic Generator Failsafe for Mandalam, Area & Booth
  const filteredAndSortedRows = useMemo(() => {
    let rows = orgPerformanceData.filter(
      (r) => r.level === currentLevel && (activeBreadcrumb.id === "root" || r.parentId === parentIdFilter)
    );

    // Dynamic Failsafe: If no explicit mock rows exist for this parent unit, generate realistic children
    if (rows.length === 0 && activeBreadcrumb.id !== "root") {
      const parentName = activeBreadcrumb.name.replace(/ (District|Mandalam|Area|Region)$/i, "");
      const isBooth = currentLevel === "BOOTH";

      if (currentLevel === "MANDALAM") {
        rows = [
          { id: `${activeBreadcrumb.id}-man-1`, unit: `${parentName} Central Mandalam`, level: "MANDALAM", parentId: activeBreadcrumb.id, total: 980, open: 84, closed: 860, pendingFollowup: 22, overdue: 4, avgResponse: "11.5h", resolutionRate: "96.4%", hasChildren: true },
          { id: `${activeBreadcrumb.id}-man-2`, unit: `${parentName} North Mandalam`, level: "MANDALAM", parentId: activeBreadcrumb.id, total: 820, open: 76, closed: 710, pendingFollowup: 18, overdue: 6, avgResponse: "12.8h", resolutionRate: "95.2%", hasChildren: true },
          { id: `${activeBreadcrumb.id}-man-3`, unit: `${parentName} South Mandalam`, level: "MANDALAM", parentId: activeBreadcrumb.id, total: 750, open: 68, closed: 650, pendingFollowup: 15, overdue: 8, avgResponse: "13.6h", resolutionRate: "94.8%", hasChildren: true },
        ];
      } else if (currentLevel === "AREA") {
        rows = [
          { id: `${activeBreadcrumb.id}-area-1`, unit: `${parentName} Town Center Area`, level: "AREA", parentId: activeBreadcrumb.id, total: 410, open: 28, closed: 370, pendingFollowup: 8, overdue: 2, avgResponse: "9.8h", resolutionRate: "97.5%", hasChildren: true },
          { id: `${activeBreadcrumb.id}-area-2`, unit: `${parentName} Civil Station Area`, level: "AREA", parentId: activeBreadcrumb.id, total: 380, open: 25, closed: 345, pendingFollowup: 6, overdue: 1, avgResponse: "10.4h", resolutionRate: "96.8%", hasChildren: true },
          { id: `${activeBreadcrumb.id}-area-3`, unit: `${parentName} Bypass Junction Area`, level: "AREA", parentId: activeBreadcrumb.id, total: 350, open: 22, closed: 315, pendingFollowup: 5, overdue: 3, avgResponse: "11.2h", resolutionRate: "95.9%", hasChildren: true },
        ];
      } else if (isBooth) {
        rows = [
          { id: `${activeBreadcrumb.id}-b1`, unit: `Booth 101 - ${parentName} Govt Primary School`, level: "BOOTH", parentId: activeBreadcrumb.id, total: 160, open: 8, closed: 148, pendingFollowup: 2, overdue: 0, avgResponse: "8.2h", resolutionRate: "98.8%", hasChildren: false },
          { id: `${activeBreadcrumb.id}-b2`, unit: `Booth 102 - ${parentName} Panchayat Community Hall`, level: "BOOTH", parentId: activeBreadcrumb.id, total: 140, open: 9, closed: 128, pendingFollowup: 2, overdue: 0, avgResponse: "8.6h", resolutionRate: "98.2%", hasChildren: false },
          { id: `${activeBreadcrumb.id}-b3`, unit: `Booth 103 - ${parentName} Library Reading Room`, level: "BOOTH", parentId: activeBreadcrumb.id, total: 120, open: 7, closed: 110, pendingFollowup: 1, overdue: 1, avgResponse: "9.5h", resolutionRate: "97.4%", hasChildren: false },
        ];
      }
    }

    // Default Sort: Attention required first
    return [...rows].sort((a, b) => {
      const statusA = computeStatus(a).key;
      const statusB = computeStatus(b).key;
      const rankMap: Record<string, number> = { ATTENTION: 1, WATCH: 2, HEALTHY: 3 };
      const diff = (rankMap[statusA] || 3) - (rankMap[statusB] || 3);
      if (diff !== 0) return diff;
      return parseFloat(a.resolutionRate) - parseFloat(b.resolutionRate);
    });
  }, [currentLevel, parentIdFilter, activeBreadcrumb.id, activeBreadcrumb.name, lang]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRows.slice(start, start + pageSize);
  }, [filteredAndSortedRows, currentPage]);

  // Handle Breadcrumb Click
  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setCurrentPage(1);
  };

  // Handle Row Click (Drill down)
  const handleRowClick = (row: OrgPerformanceRow) => {
    if (row.hasChildren) {
      setBreadcrumbs([...breadcrumbs, { id: row.id, name: row.unit, level: row.level }]);
      setCurrentPage(1);
    }
  };

  const getSubLevelLabel = (lvl: OrgLevel) => {
    switch (lvl) {
      case "REGION":
        return t.regions;
      case "DISTRICT":
        return t.districts;
      case "MANDALAM":
        return t.mandalams;
      case "AREA":
        return t.areas;
      case "BOOTH":
        return t.booths;
      default:
        return t.regions;
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
              {t.title}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* CONTROLS: ICON-ONLY VIEW SWITCHER */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1 text-xs font-semibold shadow-xs">
            <button
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "TABLE"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              title={t.tableView}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("DONUT")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "DONUT"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              title={t.donutView}
            >
              <PieChart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* BREADCRUMB NAVIGATION */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs font-bold bg-muted/40 p-2.5 rounded-xl border border-border/60">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <div key={crumb.id} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />}
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                disabled={isLast}
                className={`transition-colors flex items-center gap-1 ${
                  isLast
                    ? "text-primary font-extrabold cursor-default"
                    : "text-muted-foreground hover:text-foreground hover:underline"
                }`}
              >
                {crumb.level === "STATE" && <Building2 className="h-3.5 w-3.5 text-primary" />}
                <span>{crumb.name}</span>
              </button>
            </div>
          );
        })}
        <span className="text-muted-foreground font-normal ml-1 text-[11px]">
          › <strong className="text-foreground">{getSubLevelLabel(currentLevel)}</strong>
        </span>
      </nav>

      {/* VIEW RENDERING: TABLE VIEW VS DONUT DISTRIBUTION VIEW */}
      {paginatedRows.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
          <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground mb-1.5" />
          <p>{t.noDataFound}</p>
        </div>
      ) : viewMode === "DONUT" ? (
        /* DONUT CHART DISTRIBUTION VIEW (MATCHING USER ATTACHMENT) */
        <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <span>{t.totalCasesDistribution} — {getSubLevelLabel(currentLevel)}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-primary">
              Total: {filteredAndSortedRows.reduce((acc, r) => acc + r.open, 0).toLocaleString()} open cases
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Donut Chart SVG */}
            <div className="md:col-span-5 flex justify-center relative py-4">
              {(() => {
                const totalVal = filteredAndSortedRows.reduce((acc, r) => acc + r.open, 0) || 1;
                const palette = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f97316", "#f59e0b", "#ef4444"];
                let accumulatedPercent = 0;

                const segments = filteredAndSortedRows.map((r, i) => {
                  const pct = (r.open / totalVal) * 100;
                  const startPct = accumulatedPercent;
                  accumulatedPercent += pct;
                  return {
                    unit: r.unit,
                    pct,
                    startPct,
                    color: palette[i % palette.length],
                    row: r,
                  };
                });

                const size = 180;
                const strokeWidth = 28;
                const radius = (size - strokeWidth) / 2;
                const circumference = 2 * Math.PI * radius;

                return (
                  <div className="relative h-48 w-48 flex items-center justify-center">
                    <svg className="h-full w-full -rotate-90 transform overflow-visible" viewBox={`0 0 ${size} ${size}`}>
                      {segments.map((seg, i) => {
                        const dashArray = (seg.pct / 100) * circumference;
                        const dashOffset = -((seg.startPct / 100) * circumference);

                        return (
                          <circle
                            key={seg.unit}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                            strokeDashoffset={dashOffset}
                            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                          />
                        );
                      })}
                    </svg>

                    {/* Donut Inner Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {t.openCases}
                      </span>
                      <span className="font-display text-xl font-extrabold text-foreground tracking-tight">
                        {totalVal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Donut Legend List */}
            <div className="md:col-span-7 space-y-3">
              {(() => {
                const totalVal = filteredAndSortedRows.reduce((acc, r) => acc + r.open, 0) || 1;
                const palette = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f97316", "#f59e0b", "#ef4444"];

                return filteredAndSortedRows.map((r, i) => {
                  const pct = Math.round((r.open / totalVal) * 100);
                  const color = palette[i % palette.length];

                  return (
                    <div
                      key={r.id}
                      onClick={() => r.hasChildren && handleRowClick(r)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border border-border/50 transition-all ${
                        r.hasChildren ? "hover:bg-primary/[0.04] cursor-pointer hover:border-primary/30" : "bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                        <div>
                          <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            <span>{r.unit}</span>
                            {r.hasChildren && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-semibold">
                            <span className="font-mono text-foreground font-bold">{r.open}</span> open cases ({r.resolutionRate} res.)
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-display text-base font-extrabold text-foreground tracking-tight">
                        {pct}%
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header (Desktop Only) */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/70">
            <div className="col-span-3">{t.orgUnit}</div>
            <div className="col-span-3">{t.resolutionRate} (Primary)</div>
            <div className="col-span-1 text-right">{t.avgResponse}</div>
            <div className="col-span-1 text-right">{t.openCases}</div>
            <div className="col-span-1 text-right">{t.overdueCases}</div>
            <div className="col-span-3 text-right pr-4">{t.status}</div>
          </div>

          {/* Hierarchy Rows */}
          <div className="divide-y divide-border/40">
            {paginatedRows.map((row) => {
              const statusInfo = computeStatus(row);
              const resNum = parseFloat(row.resolutionRate);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={row.id}
                  onClick={() => row.hasChildren && handleRowClick(row)}
                  className={`group py-3 px-3 rounded-xl transition-all ${
                    row.hasChildren
                      ? "hover:bg-primary/[0.04] hover:border-primary/20 cursor-pointer border border-transparent"
                      : "bg-background border border-border/40"
                  }`}
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:grid md:grid-cols-12 gap-3 items-center text-xs">
                    {/* 1. Org Name */}
                    <div className="col-span-3 font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2 pr-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{row.unit}</span>
                    </div>

                    {/* 2. Resolution Rate Progress Bar Anchor */}
                    <div className="col-span-3 space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                        <span className="text-foreground">{row.resolutionRate}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {row.closed.toLocaleString()} / {row.total.toLocaleString()} closed
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            resNum >= 96 ? "bg-emerald-500" : resNum >= 94.5 ? "bg-amber-500" : "bg-destructive"
                          }`}
                          style={{ width: `${resNum}%` }}
                        />
                      </div>
                    </div>

                    {/* 3. Avg Response Time */}
                    <div className="col-span-1 text-right font-mono font-semibold text-foreground flex items-center justify-end gap-1">
                      <Clock3 className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="whitespace-nowrap">{row.avgResponse}</span>
                    </div>

                    {/* 4. Open Cases (Clickable Link) */}
                    <div className="col-span-1 text-right font-mono font-bold">
                      <Link
                        to="/admin/applications"
                        search={{ stage: undefined, filter: "open" }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary hover:underline"
                        title="View open cases for this unit"
                      >
                        {row.open}
                      </Link>
                    </div>

                    {/* 5. Overdue Cases (Clickable Link) */}
                    <div className="col-span-1 text-right font-mono font-bold">
                      <Link
                        to="/admin/applications"
                        search={{ stage: "Follow-up needed", filter: undefined }}
                        onClick={(e) => e.stopPropagation()}
                        className={row.overdue > 0 ? "text-destructive hover:underline font-extrabold inline-flex items-center justify-end gap-1" : "text-muted-foreground"}
                        title="View overdue queue for this unit"
                      >
                        <span>{row.overdue}</span>
                        {row.overdue > 15 && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                      </Link>
                    </div>

                    {/* 6. Status Badge & Drill-Down Chevron */}
                    <div className="col-span-3 flex items-center justify-end gap-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold shrink-0 ${statusInfo.badgeClass}`}
                      >
                        <StatusIcon className="h-3 w-3 shrink-0" />
                        <span>{statusInfo.label}</span>
                      </span>

                      {row.hasChildren ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                      ) : (
                        <div className="w-4" />
                      )}
                    </div>
                  </div>

                  {/* Mobile Stacked Layout */}
                  <div className="md:hidden space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-foreground">{row.unit}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${statusInfo.badgeClass}`}>
                        <StatusIcon className="h-3 w-3 shrink-0" />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>

                    {/* Resolution Bar Mobile */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-xs font-bold">
                        <span>Resolution: <strong className="text-emerald-600">{row.resolutionRate}</strong></span>
                        <span className="text-muted-foreground text-[10px]">Resp: {row.avgResponse}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            resNum >= 96 ? "bg-emerald-500" : resNum >= 94.5 ? "bg-amber-500" : "bg-destructive"
                          }`}
                          style={{ width: `${resNum}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Strip Mobile */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40 font-semibold">
                      <span>Open: <strong className="text-primary font-mono">{row.open}</strong></span>
                      <span>Overdue: <strong className="text-destructive font-mono font-bold">{row.overdue}</strong></span>
                      {row.hasChildren && (
                        <span className="text-primary font-bold flex items-center gap-0.5">
                          Drill Down <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/70 pt-3 text-xs">
          <span className="text-muted-foreground font-semibold">
            {t.page} <strong className="text-foreground font-mono">{currentPage}</strong> {t.of} <strong className="text-foreground font-mono">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-border bg-background px-3 py-1 font-bold text-foreground disabled:opacity-40 hover:bg-muted transition-colors"
            >
              {t.prev}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-border bg-background px-3 py-1 font-bold text-foreground disabled:opacity-40 hover:bg-muted transition-colors"
            >
              {t.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
