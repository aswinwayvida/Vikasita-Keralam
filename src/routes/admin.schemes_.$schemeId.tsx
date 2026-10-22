import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Pencil,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { schemes } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/schemes_/$schemeId")({
  head: () => ({ meta: [{ title: "Scheme details Â· Admin" }] }),
  component: SchemeDetails,
});

function SchemeDetails() {
  const { schemeId } = Route.useParams();
  const { lang } = useLang();
  const scheme = schemes.find((item) => item.id === schemeId);
  if (!scheme) return <Empty title="Scheme not found" back="/admin/schemes" />;
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/admin/schemes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Schemes
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{scheme[lang]}</h1>
            <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              Active
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{scheme.ministry[lang]}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ExternalLink /> Official source
          </Button>
          <Button>
            <Pencil /> Edit scheme
          </Button>
        </div>
      </header>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_.7fr]">
        <main className="space-y-4">
          <Card title="Scheme information" icon={Sparkles}>
            <Info label="Category" value={scheme.category} />
            <Info label="Benefit" value={scheme.benefit[lang]} />
            <Info label="Eligibility" value={scheme.eligibility[lang]} />
            <Info label="Application route" value="Helpdesk-assisted / connected service" />
          </Card>
          <Card title="Eligibility and application setup" icon={FileText}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Step n="1" title="Eligibility questions" note="Scheme-specific rules saved" />
              <Step n="2" title="Required documents" note="5 document types configured" />
              <Step n="3" title="Submission" note="Connection reviewed before use" />
            </div>
          </Card>
          <Card title="Change history" icon={ShieldCheck}>
            <p className="text-sm text-muted-foreground">
              Last checked today. Every published change keeps the source, editor and date.
            </p>
          </Card>
        </main>
        <aside className="space-y-4">
          <Stat label="Applications" value="126" />
          <Stat label="Eligible checks" value="84" />
          <Stat label="Pending review" value="3" />
          <div className="rounded-2xl border border-secondary/20 bg-secondary/[0.06] p-5">
            <div className="flex items-center gap-2 font-semibold text-secondary">
              <CheckCircle2 className="h-5 w-5" /> Ready for applicants
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Scheme details and eligibility rules are available in the public portal.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Sparkles;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-bold">{title}</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/55 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}
function Step({ n, title, note }: { n: string; title: string; note: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {n}
      </span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
function Empty({ title, back }: { title: string; back: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <a
        href={back}
        className="mt-5 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-semibold"
      >
        Go back
      </a>
    </div>
  );
}
