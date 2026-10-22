import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  Link2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { adminApplicationMetrics } from "@/data/admin-applications";
import { schemes } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview Â· Admin" }] }),
  component: AdminDashboard,
});

const queueStages = [
  {
    label: "New applications",
    count: adminApplicationMetrics.stageCounts.New,
    tone: "bg-primary",
    note: `${adminApplicationMetrics.newUnassigned} need to be assigned`,
    href: "/admin/applications?stage=New",
  },
  {
    label: "Documents being checked",
    count: adminApplicationMetrics.stageCounts["Checking documents"],
    tone: "bg-amber-500",
    note: `${adminApplicationMetrics.documentRepliesNeeded} need a reply from the applicant`,
    href: "/admin/applications?stage=Checking%20documents",
  },
  {
    label: "Ready for submission",
    count: adminApplicationMetrics.stageCounts["Ready to submit"],
    tone: "bg-secondary",
    note: `${adminApplicationMetrics.readyInPlatform} can be completed in-platform`,
    href: "/admin/applications?stage=Ready%20to%20submit",
  },
  {
    label: "Follow-up on other websites",
    count: adminApplicationMetrics.stageCounts["Follow-up needed"],
    tone: "bg-sky-500",
    note: `Check the status of ${adminApplicationMetrics.followUpsWaiting} applications`,
    href: "/admin/applications?stage=Follow-up%20needed",
  },
  {
    label: "Completed",
    count: adminApplicationMetrics.stageCounts.Completed,
    tone: "bg-slate-400",
    note: "Completed recently",
    href: "/admin/applications?stage=Completed",
  },
];

const attentionItems = [
  {
    icon: AlertCircle,
    title: `${adminApplicationMetrics.delayed} applications are delayed`,
    note: "Assign them to a district team member",
    tone: "text-destructive bg-destructive/10",
    href: "/admin/applications?filter=delayed",
  },
  {
    icon: UserRoundCheck,
    title: `${adminApplicationMetrics.unassigned} applications need an assignee`,
    note: "Assign them to available team members",
    tone: "text-primary bg-primary/10",
    href: "/admin/applications?filter=unassigned",
  },
  {
    icon: MapPin,
    title: "Check details of 6 helpdesks",
    note: "Confirm contact details and availability",
    tone: "text-amber-600 bg-amber-500/10",
    href: "/admin/growth?filter=review",
  },
];

const integrationHealth = [
  {
    name: "Scheme list",
    meta: `${schemes.length} active schemes`,
    status: "Checked",
    tone: "text-secondary",
    icon: Sparkles,
    href: "/admin/schemes",
  },
  {
    name: "Application submission",
    meta: "Official portal access pending",
    status: "Pending",
    tone: "text-secondary",
    icon: Link2,
    href: "/admin/connections",
  },
  {
    name: "Document storage",
    meta: "Personal details hidden",
    status: "Protected",
    tone: "text-secondary",
    icon: ShieldCheck,
    href: "/admin/connections",
  },
  {
    name: "Application status checks",
    meta: "Review 3 sources",
    status: "Needs review",
    tone: "text-amber-600",
    icon: RefreshCw,
    href: "/admin/connections",
  },
];

function AdminDashboard() {
  const { lang } = useLang();
  const ml = lang === "ml";
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/[0.09] via-card to-secondary/[0.08] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin dashboard
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
              {ml
                ? "à´…à´ªàµ‡à´•àµà´·à´•à´³àµà´Ÿàµ† à´¸à´‚à´¸àµà´¥à´¾à´¨ à´…à´µà´²àµ‹à´•à´¨à´‚"
                : "Application overview"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {ml
                ? "à´ªàµà´¤à´¿à´¯ à´…à´ªàµ‡à´•àµà´· à´®àµà´¤àµ½ à´¸à´®àµ¼à´ªàµà´ªà´£à´‚, à´«àµ‹à´³àµ‹-à´…à´ªàµà´ªàµ, à´ªàµ‚àµ¼à´¤àµà´¤àµ€à´•à´°à´£à´‚ à´µà´°àµ† à´’à´°à´¿à´Ÿà´¤àµà´¤àµ à´¨à´¿à´¯à´¨àµà´¤àµà´°à´¿à´•àµà´•àµà´•."
                : "Manage every application from intake and document review to submission, follow-up and completion."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/applications"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              View applications <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/schemes"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:border-primary/40"
            >
              View schemes
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          icon={FileText}
          label="Applications needing action"
          value={adminApplicationMetrics.open}
          tone="warning"
          href="/admin/applications?filter=action"
        />
        <KpiCard
          icon={Clock3}
          label="Waiting over 24 hours"
          value={adminApplicationMetrics.waitingOver24Hours}
          tone="destructive"
          href="/admin/applications?filter=due"
        />
        <KpiCard
          icon={FileCheck2}
          label="Missing documents"
          value={adminApplicationMetrics.documentsNeeded}
          tone="primary"
          href="/admin/applications?filter=documents"
        />
        <KpiCard
          icon={Sparkles}
          label="Active schemes"
          value={schemes.length}
          tone="secondary"
          href="/admin/schemes"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                Application status
              </p>
              <h2 className="mt-1 font-display text-xl font-bold">Application progress</h2>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Updated just now
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {queueStages.map((stage) => (
              <a
                key={stage.label}
                href={stage.href}
                className="group rounded-xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm last:sm:col-span-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${stage.tone}`} />
                    <div>
                      <p className="text-sm font-semibold">{stage.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{stage.note}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl font-bold">{stage.count}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Needs attention
            </p>
            <div className="mt-4 space-y-3">
              {attentionItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group flex gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary/35 hover:shadow-sm"
                >
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone}`}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.note}</p>
                  </div>
                  <ChevronRight className="mt-2 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Connected services
                </p>
                <h2 className="mt-1 font-display text-lg font-bold">Connection status</h2>
              </div>
              <CheckCircle2 className="h-5 w-5 text-secondary" />
            </div>
            <div className="mt-4 divide-y divide-border">
              {integrationHealth.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium group-hover:text-primary">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{item.meta}</p>
                  </div>
                  <span className={`text-xs font-semibold ${item.tone}`}>{item.status}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
