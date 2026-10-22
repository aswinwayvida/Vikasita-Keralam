import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  Download,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  UserRoundCheck,
} from "lucide-react";
import {
  adminApplicationMetrics,
  adminApplications,
  applicationStages,
  type QueueStage,
} from "@/data/admin-applications";
import { districts, getDistrictName } from "@/data/geo";
import { loadHelpdeskRequests, type HelpdeskRequest } from "@/lib/helpdesk-requests";
import { useLang } from "@/i18n/LanguageProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/applications")({
  validateSearch: (search: Record<string, unknown>) => ({
    stage:
      typeof search.stage === "string" && applicationStages.includes(search.stage as QueueStage)
        ? (search.stage as QueueStage)
        : undefined,
    filter: typeof search.filter === "string" ? search.filter : undefined,
  }),
  head: () => ({ meta: [{ title: "Applications · Admin" }] }),
  component: ApplicationsPage,
});

export function StagePill({ stage }: { stage: QueueStage }) {
  if (stage === "New") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold text-primary border border-primary/20">
        New
      </span>
    );
  }
  if (stage === "Checking documents") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-500/20">
        Checking documents
      </span>
    );
  }
  if (stage === "Follow-up needed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-extrabold text-destructive border border-destructive/20">
        Follow-up needed
      </span>
    );
  }
  if (stage === "Ready to submit") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-600 border border-sky-500/20">
        Ready to submit
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 border border-emerald-500/20">
      Completed
    </span>
  );
}

export function formatWaitingTime(hours: number) {
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
}

function ApplicationsPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const routeSearch = Route.useSearch();
  const [stage, setStage] = useState<"All" | QueueStage>(routeSearch.stage ?? "All");
  const [district, setDistrict] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [, setHelpdeskRequests] = useState<HelpdeskRequest[]>([]);

  useEffect(() => {
    const refresh = () => setHelpdeskRequests(loadHelpdeskRequests());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("vk-helpdesk-requests-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("vk-helpdesk-requests-changed", refresh);
    };
  }, []);

  const filtered = useMemo(
    () =>
      adminApplications.filter((record) => {
        const filterMatch =
          !routeSearch.filter ||
          (routeSearch.filter === "action" && record.queueStage !== "Completed") ||
          (routeSearch.filter === "due" &&
            record.queueStage !== "Completed" &&
            record.ageHours >= 24) ||
          (routeSearch.filter === "documents" &&
            record.queueStage !== "Completed" &&
            record.documentCount < 5) ||
          (routeSearch.filter === "delayed" &&
            record.queueStage !== "Completed" &&
            record.ageHours > 48) ||
          (routeSearch.filter === "unassigned" && record.reviewer === "Not assigned");
        return (
          filterMatch &&
          (stage === "All" || record.queueStage === stage) &&
          (district === "All" || record.districtId === district)
        );
      }),
    [district, routeSearch.filter, stage],
  );
  const visible = filtered.slice(0, 40);
  const allVisibleSelected =
    visible.length > 0 && visible.every((record) => selectedIds.has(record.id));

  function toggleAll() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visible.forEach((record) => next.delete(record.id));
      else visible.forEach((record) => next.add(record.id));
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const [timeRange, setTimeRange] = useState("30days");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
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

  const activeFilterCount = (stage !== "All" ? 1 : 0) + (district !== "All" ? 1 : 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Merged Single Section Container */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-5">
        
        {/* Top Header Row with Title & Filter / Export / New Application Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {lang === "ml" ? "അപേക്ഷകളുടെ പട്ടിക & അവലോകനം" : "Applications Directory & Overview"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {lang === "ml" ? "അപേക്ഷ പരിശോധന, ട്രാക്കിംഗ്, റിവ്യൂ പ്രോസസ്സിംഗ്" : "View, assign, check, submit and track applications from one place"}
            </p>
          </div>

          {/* Filter, Export & New Application Controls on the Right */}
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
                        {lang === "ml" ? "അപേക്ഷ ഫിൽട്ടറുകൾ" : "Filter Applications"}
                      </h4>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={() => {
                            setStage("All");
                            setDistrict("All");
                          }}
                          className="text-[11px] font-semibold text-primary hover:underline"
                        >
                          {lang === "ml" ? "റീസെറ്റ്" : "Reset all"}
                        </button>
                      )}
                    </div>

                    {/* Status / Stage Filter */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        {lang === "ml" ? "സ്റ്റാറ്റസ് / ഘട്ടം" : "Status / Stage"}
                      </label>
                      <select
                        value={stage}
                        onChange={(event) => setStage(event.target.value as "All" | QueueStage)}
                        className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold outline-none"
                      >
                        <option value="All">{lang === "ml" ? "എല്ലാ സ്റ്റാറ്റസുകളും" : "All Statuses"}</option>
                        {applicationStages.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    {/* District Filter */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        {lang === "ml" ? "ജില്ല" : "District"}
                      </label>
                      <select
                        value={district}
                        onChange={(event) => setDistrict(event.target.value)}
                        className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold outline-none"
                      >
                        <option value="All">{lang === "ml" ? "എല്ലാ ജില്ലകളും" : "All Districts"}</option>
                        {districts.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item[lang]}
                          </option>
                        ))}
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

            <Button asChild className="hidden sm:inline-flex h-8 rounded-xl px-3.5 text-xs font-semibold shrink-0">
              <Link to="/admin/applications/new" search={{ stage: undefined, filter: undefined }}>
                <Plus className="h-3.5 w-3.5" /> {lang === "ml" ? "പുതിയ അപേക്ഷ" : "New Application"}
              </Link>
            </Button>
          </div>
        </div>

        {/* Embedded Status KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Open Applications */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "തുറന്ന അപേക്ഷകൾ" : "OPEN APPLICATIONS"}</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-foreground">{adminApplicationMetrics.open}</p>
            <span className="text-[10px] text-emerald-600 font-semibold block">{lang === "ml" ? "പ്രവർത്തനം ആവശ്യമാണ്" : "Action required"}</span>
          </div>

          {/* Card 2: Waiting over 24 hours */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "24 മണിക്കൂറിലധികം വൈകിയവ" : "WAITING OVER 24H"}</span>
              <Clock3 className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-destructive">{adminApplicationMetrics.waitingOver24Hours}</p>
            <span className="text-[10px] text-destructive font-semibold block">{lang === "ml" ? "മുൻഗണന നൽകുക" : "High priority queue"}</span>
          </div>

          {/* Card 3: Documents needed */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "രേഖകൾ വേണം" : "DOCUMENTS NEEDED"}</span>
              <FileCheck2 className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-amber-600">{adminApplicationMetrics.documentsNeeded}</p>
            <span className="text-[10px] text-amber-600 font-semibold block">{lang === "ml" ? "രേഖകൾ അപ്‌ലോഡ് ചെയ്യാൻ ബാക്കി" : "Pending citizen upload"}</span>
          </div>

          {/* Card 4: Unassigned applications */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "അസൈൻ ചെയ്യാത്തവ" : "UNASSIGNED"}</span>
              <UserRoundCheck className="h-4 w-4 text-sky-600" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-foreground">{adminApplicationMetrics.unassigned}</p>
            <span className="text-[10px] text-sky-600 font-semibold block">{lang === "ml" ? "ഓഫീസറെ വേണം" : "Needs reviewer"}</span>
          </div>
        </div>

        {/* Selected Applications Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-2.5">
            <span className="mr-1 text-xs font-semibold">{selectedIds.size} selected</span>
            <Button type="button" size="sm" variant="outline">
              <UserRoundCheck className="h-3.5 w-3.5 mr-1" /> Assign
            </Button>
            <Button type="button" size="sm" variant="outline">
              <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
            </Button>
            <Button type="button" size="sm" variant="outline">
              <Mail className="h-3.5 w-3.5 mr-1" /> Email
            </Button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}

        {/* Cards View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {visible.map((record) => {
              const isSelected = selectedIds.has(record.id);
              return (
                <div
                  key={record.id}
                  onClick={() =>
                    navigate({
                      to: "/admin/applications/$applicationId",
                      params: { applicationId: record.id },
                    })
                  }
                  className={`rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer ${
                    isSelected ? "border-primary/50 bg-primary/[0.04]" : ""
                  }`}
                >
                  {/* Top Header Row: Selection + Reference & Stage */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(record.id)}
                          aria-label={`Select application ${record.reference}`}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs text-foreground truncate">
                        {record.reference}
                      </span>
                    </div>
                    <StagePill stage={record.queueStage} />
                  </div>

                  {/* Applicant Details */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-foreground">{record.applicant}</p>
                      <p className="text-xs text-muted-foreground font-medium">{record.mobile}</p>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0 bg-primary/10 px-2.5 py-0.5 rounded-md">
                      {record.schemeId}
                    </span>
                  </div>

                  {/* Footer Meta Row: Location, Age, Action */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {getDistrictName(record.districtId, lang)}
                    </span>
                    <span className="font-mono font-medium text-[11px]">
                      Wait: {formatWaitingTime(record.ageHours)}
                    </span>
                    <span className="font-semibold text-primary flex items-center gap-0.5">
                      Details <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Data Table View */}
        {viewMode === "table" && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
                <tr>
                  <th className="w-10 p-3">
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all visible applications"
                    />
                  </th>
                  <th className="p-3">{lang === "ml" ? "റഫറൻസ് നമ്പർ" : "APPLICATION / REF"}</th>
                  <th className="p-3">{lang === "ml" ? "അപേക്ഷകൻ" : "APPLICANT"}</th>
                  <th className="p-3">{lang === "ml" ? "പദ്ധതി" : "SCHEME"}</th>
                  <th className="p-3">{lang === "ml" ? "ജില്ല" : "DISTRICT"}</th>
                  <th className="p-3">{lang === "ml" ? "ഘട്ടം" : "STAGE"}</th>
                  <th className="p-3">{lang === "ml" ? "പരിശോധകൻ" : "REVIEWER"}</th>
                  <th className="p-3 text-right">{lang === "ml" ? "കാത്തിരിപ്പ് സമയം" : "WAITING TIME"}</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {visible.map((record) => {
                  const isSelected = selectedIds.has(record.id);
                  return (
                    <tr
                      key={record.id}
                      onClick={() =>
                        navigate({
                          to: "/admin/applications/$applicationId",
                          params: { applicationId: record.id },
                        })
                      }
                      className={`cursor-pointer hover:bg-muted/40 transition-colors ${isSelected ? "bg-primary/[0.04]" : ""}`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(record.id)}
                          aria-label={`Select application ${record.reference}`}
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-foreground">
                        <p>{record.reference}</p>
                        <p className="text-[10px] text-muted-foreground font-normal">ID: {record.id}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-foreground">{record.applicant}</p>
                        <p className="text-[10px] text-muted-foreground font-normal">{record.mobile}</p>
                      </td>
                      <td className="p-3 text-primary font-bold">{record.schemeId}</td>
                      <td className="p-3 text-muted-foreground">{getDistrictName(record.districtId, lang)}</td>
                      <td className="p-3">
                        <StagePill stage={record.queueStage} />
                      </td>
                      <td className="p-3 text-muted-foreground">{record.reviewer}</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">
                        {formatWaitingTime(record.ageHours)}
                      </td>
                      <td className="p-3 text-right">
                        <ChevronRight className="h-4 w-4 text-muted-foreground inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Mobile Sticky Floating Plus Button */}
      <div className="fixed bottom-6 right-5 z-50 sm:hidden">
        <Link
          to="/admin/applications/new"
          search={{ stage: undefined, filter: undefined }}
          className="flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
          aria-label={lang === "ml" ? "പുതിയ അപേക്ഷ" : "New Application"}
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
