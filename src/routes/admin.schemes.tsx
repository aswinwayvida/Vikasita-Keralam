import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Database,
  ExternalLink,
  FileDown,
  Link2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
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

function SchemesPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("All");

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
    const haystack =
      `${record.en} ${record.ml} ${record.ministry.en} ${record.category}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (mode === "All" || record.mode === mode);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Scheme management
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Schemes</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage scheme details, eligibility rules and how applicants can apply.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:border-primary/40">
            <RefreshCw className="h-4 w-4" /> Check updates
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <Sparkles className="h-4 w-4" /> Add scheme
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            icon: Database,
            value: records.length,
            label: "Total schemes",
            tone: "bg-primary/10 text-primary",
          },
          {
            icon: CheckCircle2,
            value: records.filter((item) => item.sync === "Up to date").length,
            label: "Up to date",
            tone: "bg-secondary/10 text-secondary",
          },
          {
            icon: Link2,
            value: records.filter(
              (item) => item.mode === "Apply here" || item.mode === "Connected service",
            ).length,
            label: "Can apply here",
            tone: "bg-sky-500/10 text-sky-700",
          },
          {
            icon: AlertTriangle,
            value: records.filter((item) => item.sync === "Needs checking").length,
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
        <div className="grid gap-2 border-b border-border p-3 sm:p-4 lg:grid-cols-[minmax(240px,1fr)_220px_auto]">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Search scheme or department"
            />
          </label>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none"
          >
            <option>All</option>
            {modes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            {filtered.length} schemes shown
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-muted/45 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Scheme</th>
                <th className="px-4 py-3">Official source</th>
                <th className="px-4 py-3">How to apply</th>
                <th className="px-4 py-3">Last checked</th>
                <th className="px-4 py-3 text-right">Applications</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr
                  key={record.id}
                  onClick={() =>
                    navigate({ to: "/admin/schemes/$schemeId", params: { schemeId: record.id } })
                  }
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="max-w-80 px-4 py-3">
                    <p className="font-semibold">{record[lang]}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {record.ministry[lang]} · {record.category}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">{record.source}</p>
                    <button
                      onClick={(event) => event.stopPropagation()}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      Open source <ExternalLink className="h-3 w-3" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <ModePill mode={record.mode} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">
                      {record.verifiedDays === 0
                        ? "Verified today"
                        : `Verified ${record.verifiedDays}d ago`}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Eligibility rules saved
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{record.applications}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${record.sync === "Up to date" ? "bg-secondary/10 text-secondary" : "bg-amber-500/15 text-amber-700"}`}
                    >
                      {record.sync}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Eligibility change history",
            note: "Each eligibility change keeps its source and date.",
          },
          {
            icon: FileDown,
            title: "Application forms",
            note: "Keep official forms here when permission allows.",
          },
          {
            icon: RefreshCw,
            title: "Scheme updates to check",
            note: "Check official source changes before publishing them.",
          },
        ].map((item) => (
          <div key={item.title} className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.note}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function ModePill({ mode }: { mode: (typeof modes)[number] }) {
  const style = {
    "Apply here": "bg-secondary/10 text-secondary",
    "Connected service": "bg-sky-500/10 text-sky-700",
    "Download form": "bg-primary/10 text-primary",
    "Other government website": "bg-muted text-muted-foreground",
  }[mode];
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${style}`}
    >
      {mode}
    </span>
  );
}
