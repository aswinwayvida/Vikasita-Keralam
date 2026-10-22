import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  UserRoundCheck,
} from "lucide-react";
import {
  adminApplicationMetrics,
  adminApplications,
  applicationReviewers,
  applicationStages,
  formatWaitingTime,
  maskPhone,
  type QueueStage,
} from "@/data/admin-applications";
import { schemes } from "@/data/schemes";
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

function ApplicationsPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const routeSearch = Route.useSearch();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<"All" | QueueStage>(routeSearch.stage ?? "All");
  const [district, setDistrict] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [helpdeskRequests, setHelpdeskRequests] = useState<HelpdeskRequest[]>([]);
  const [helpdeskFilter, setHelpdeskFilter] = useState("all");

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

  const visibleHelpdeskRequests = helpdeskRequests.filter(
    (item) => helpdeskFilter === "all" || item.helpdeskId === helpdeskFilter,
  );

  const filtered = useMemo(
    () =>
      adminApplications.filter((record) => {
        const scheme = schemes.find((item) => item.id === record.schemeId);
        const haystack =
          `${record.id} ${record.reference} ${record.applicant} ${record.mobile} ${scheme?.en ?? ""}`.toLowerCase();
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
          haystack.includes(query.toLowerCase()) &&
          filterMatch &&
          (stage === "All" || record.queueStage === stage) &&
          (district === "All" || record.districtId === district)
        );
      }),
    [district, query, routeSearch.filter, stage],
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, assign, check, submit and track applications from one place.
          </p>
        </div>
        <Button asChild className="h-10 rounded-xl px-4">
          <Link to="/admin/applications/new" search={{ stage: undefined, filter: undefined }}>
            <Plus className="h-4 w-4" /> New Application
          </Link>
        </Button>
      </div>

      <section className="rounded-2xl border border-primary/20 bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Helpdesk requests from the public website</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Review requests assigned to each helpdesk and follow up on missing documents.
            </p>
          </div>
          <label className="text-xs font-semibold">
            Helpdesk
            <select
              value={helpdeskFilter}
              onChange={(event) => setHelpdeskFilter(event.target.value)}
              className="mt-1 block h-10 w-full min-w-52 rounded-xl border border-border bg-background px-3 text-sm font-normal"
            >
              <option value="all">All helpdesks</option>
              {Array.from(new Map(helpdeskRequests.map((item) => [item.helpdeskId, item.helpdeskName])).entries()).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </label>
        </div>
        {visibleHelpdeskRequests.length ? (
          <div className="mt-4 grid gap-2">
            {visibleHelpdeskRequests.map((item) => (
              <Link
                key={item.reference}
                to="/admin/applications/$applicationId"
                params={{ applicationId: item.reference }}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 transition hover:border-primary/40 hover:bg-saffron-soft/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold">{item.applicant} <span className="ml-1 font-mono text-xs font-normal text-muted-foreground">{item.reference}</span></p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.helpdeskName} · {schemes.find((scheme) => scheme.id === item.schemeId)?.[lang] ?? item.schemeId}</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span>{item.documents.length} files selected · {item.missingDocuments.length} missing</span>
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-muted/45 p-4 text-sm text-muted-foreground">No public helpdesk requests found.</p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            icon: FileText,
            value: adminApplicationMetrics.open,
            label: "Open applications",
            href: "/admin/applications?filter=action",
            tone: "text-primary bg-primary/10",
          },
          {
            icon: Clock3,
            value: adminApplicationMetrics.waitingOver24Hours,
            label: "Waiting over 24 hours",
            href: "/admin/applications?filter=due",
            tone: "text-destructive bg-destructive/10",
          },
          {
            icon: FileCheck2,
            value: adminApplicationMetrics.documentsNeeded,
            label: "Documents needed",
            href: "/admin/applications?filter=documents",
            tone: "text-amber-700 bg-amber-500/10",
          },
          {
            icon: UserRoundCheck,
            value: adminApplicationMetrics.unassigned,
            label: "Unassigned applications",
            href: "/admin/applications?filter=unassigned",
            tone: "text-secondary bg-secondary/10",
          },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="group rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${item.tone}`}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <div className="mt-3 font-display text-2xl font-bold">{item.value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{item.label}</div>
          </a>
        ))}
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-3 sm:p-4">
          <div className="grid gap-2 lg:grid-cols-[minmax(260px,1fr)_210px_210px]">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="Search name, mobile or scheme"
              />
            </label>
            <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={stage}
                onChange={(event) => setStage(event.target.value as "All" | QueueStage)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              >
                <option>All</option>
                {applicationStages.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <select
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              >
                <option value="All">All districts</option>
                {districts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item[lang]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedIds.size > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-2.5">
              <span className="mr-1 text-xs font-semibold">{selectedIds.size} selected</span>
              <Button type="button" size="sm" variant="outline">
                <UserRoundCheck /> Assign
              </Button>
              <Button type="button" size="sm" variant="outline">
                <MessageCircle /> WhatsApp
              </Button>
              <Button type="button" size="sm" variant="outline">
                <Mail /> Email
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-muted/45 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all visible applications"
                  />
                </th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Scheme</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Submitted / waiting</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned to</th>
                <th className="px-4 py-3">Documents</th>
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((record) => {
                const schemeItem = schemes.find((item) => item.id === record.schemeId);
                const overdue = record.ageHours > 48 && record.queueStage !== "Completed";
                return (
                  <tr
                    key={record.id}
                    onClick={() =>
                      navigate({
                        to: "/admin/applications/$applicationId",
                        params: { applicationId: record.id },
                      })
                    }
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/35"
                  >
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(record.id)}
                        onCheckedChange={() => toggleOne(record.id)}
                        aria-label={`Select ${record.applicant}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/applications/$applicationId"
                        params={{ applicationId: record.id }}
                        onClick={(event) => event.stopPropagation()}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {record.applicant}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {maskPhone(record.mobile)}
                        </span>
                        <a
                          href={`tel:${record.mobile}`}
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-secondary hover:border-secondary"
                          aria-label={`Call ${record.applicant}`}
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="max-w-56 px-4 py-3 text-xs">
                      <span className="line-clamp-2">{schemeItem?.[lang]}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {getDistrictName(record.districtId, lang)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs">
                        {new Date(record.submittedAt).toLocaleDateString("en-IN")}
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] ${overdue ? "font-semibold text-destructive" : "text-muted-foreground"}`}
                      >
                        {record.queueStage === "Completed"
                          ? "Completed"
                          : `${formatWaitingTime(record.ageHours)} waiting`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StagePill stage={record.queueStage} />
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">{record.reviewer}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{record.documentCount}/5</td>
                    <td className="px-3 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            Showing {visible.length} of {filtered.length} applications
          </span>
          <span>{applicationReviewers.length - 1} reviewers available</span>
        </div>
      </section>
    </div>
  );
}

export function StagePill({ stage }: { stage: QueueStage }) {
  const style: Record<QueueStage, string> = {
    New: "bg-primary/10 text-primary",
    "Checking documents": "bg-amber-500/15 text-amber-700",
    "Ready to submit": "bg-secondary/10 text-secondary",
    "Follow-up needed": "bg-sky-500/10 text-sky-700",
    Completed: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${style[stage]}`}
    >
      {stage}
    </span>
  );
}
