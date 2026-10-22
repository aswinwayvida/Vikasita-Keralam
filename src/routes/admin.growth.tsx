import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";
import { helpdeskLocations } from "@/data/helpdesk-locations";
import { useLang } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/admin/growth")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  head: () => ({ meta: [{ title: "Helpdesks · Admin" }] }),
  component: HelpdeskNetworkPage,
});

function HelpdeskNetworkPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const routeSearch = Route.useSearch();
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All");
  const districtNames = Array.from(
    new Set(helpdeskLocations.map((location) => location.district)),
  ).sort();

  const records = useMemo(
    () =>
      helpdeskLocations.map((location, index) => ({
        ...location,
        status: index % 9 === 0 ? "Needs checking" : "Active",
        openCases: 4 + ((index * 7) % 34),
        lastVerified: index % 9 === 0 ? "30+ days ago" : `${1 + (index % 8)} days ago`,
      })),
    [],
  );

  const filtered = records.filter((record) => {
    const text =
      `${record.name} ${record.district} ${record.districtMl} ${record.address}`.toLowerCase();
    const matchesReview = routeSearch.filter !== "review" || record.status === "Needs checking";
    return (
      matchesReview &&
      text.includes(query.toLowerCase()) &&
      (district === "All" || record.district === district)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Helpdesks
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Helpdesks</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage helpdesk helpdesks, contact details and pending applications.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
          <Building2 className="h-4 w-4" /> Add helpdesk
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            icon: Building2,
            value: records.length,
            label: "Helpdesks",
            tone: "bg-primary/10 text-primary",
          },
          {
            icon: MapPin,
            value: districtNames.length,
            label: "Districts covered",
            tone: "bg-sky-500/10 text-sky-700",
          },
          {
            icon: CheckCircle2,
            value: records.filter((item) => item.status === "Active").length,
            label: "Contact details checked",
            tone: "bg-secondary/10 text-secondary",
          },
          {
            icon: AlertTriangle,
            value: records.filter((item) => item.status === "Needs checking").length,
            label: "Need checking",
            tone: "bg-amber-500/10 text-amber-700",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${item.tone}`}
            >
              <item.icon className="h-4 w-4" />
            </span>
            <div className="mt-3 font-display text-2xl font-bold">{item.value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-2 border-b border-border p-3 sm:p-4 lg:grid-cols-[minmax(240px,1fr)_240px_auto]">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Search helpdesk, place or address"
            />
          </label>
          <select
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none"
          >
            <option>All</option>
            {districtNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            {filtered.length} helpdesks
          </div>
        </div>

        <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
          {filtered.map((record) => (
            <article
              key={record.id}
              onClick={() =>
                navigate({ to: "/admin/growth/$helpdeskId", params: { helpdeskId: record.id } })
              }
              className="group cursor-pointer rounded-xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold group-hover:text-primary">
                      {record.name}
                    </p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-primary">
                    {lang === "ml" ? record.districtMl : record.district}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${record.status === "Active" ? "bg-secondary/10 text-secondary" : "bg-amber-500/15 text-amber-700"}`}
                >
                  {record.status}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">
                {record.address}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {record.phones.slice(0, 2).map((phone) => (
                  <span
                    key={phone}
                    className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[11px] font-medium"
                  >
                    <Phone className="h-3 w-3" /> {phone}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Pending requests</p>
                  <p className="mt-0.5 font-semibold">{record.openCases}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last checked</p>
                  <p className="mt-0.5 font-semibold">{record.lastVerified}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="flex gap-3 rounded-xl border border-secondary/20 bg-secondary/[0.06] p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
        <div>
          <p className="text-sm font-semibold">Updating contact details</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Contact changes must be checked by another team member. Every change is recorded.
          </p>
        </div>
      </div>
    </div>
  );
}
