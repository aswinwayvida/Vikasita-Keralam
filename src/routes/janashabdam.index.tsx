import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { LotusWatermark } from "@/components/public/LotusWatermark";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/public/SectionHeading";
import { issues } from "@/data/issues";
import {
  Dog, Trash2, Droplets, Construction, Lightbulb, Waves, HeartPulse,
  ClipboardClock, BadgePercent, Sprout, MoreHorizontal, ShieldCheck,
  CheckCircle2, ArrowRight, FileSearch, Megaphone, Users2, ListChecks,
} from "lucide-react";
import type { IssueCategory } from "@/data/issues";

export const Route = createFileRoute("/janashabdam/")({
  head: () => ({ meta: [{ title: "ജനശബ്ദം · Citizen voices" }] }),
  component: JanashabdamLanding,
});

const catIcon: Record<IssueCategory, typeof Dog> = {
  stray_dog: Dog, waste: Trash2, water: Droplets, road: Construction,
  streetlight: Lightbulb, drainage: Waves, health: HeartPulse,
  service_delay: ClipboardClock, central_scheme: BadgePercent,
  development: Sprout, other: MoreHorizontal,
};

function JanashabdamLanding() {
  const { lang, t } = useLang();
  const cats = Object.keys(t.categories) as IssueCategory[];
  const counts = cats.reduce<Record<string, number>>((acc, c) => {
    acc[c] = issues.filter((i) => i.category === c).length;
    return acc;
  }, {});

  const stats = {
    total: issues.length,
    verified: issues.filter((i) => ["verified", "escalated", "public_campaign", "followup_pending", "resolved", "closed"].includes(i.status)).length,
    resolved: issues.filter((i) => i.status === "resolved" || i.status === "closed").length,
  };

  const steps = [
    { k: "s1", icon: FileSearch },
    { k: "s2", icon: ShieldCheck },
    { k: "s3", icon: Megaphone },
    { k: "s4", icon: CheckCircle2 },
  ] as const;

  const trust = [
    { icon: ShieldCheck, label: t.janashabdam.trust.anonymity },
    { icon: Users2, label: t.janashabdam.trust.verification },
    { icon: Megaphone, label: t.janashabdam.trust.escalation },
    { icon: ListChecks, label: t.janashabdam.trust.followup },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <LotusWatermark className="pointer-events-none absolute -right-16 -top-20 h-[420px] w-[420px] text-secondary opacity-[0.06]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            ജനശബ്ദം · Janashabdam
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">
            {lang === "ml" ? "നിങ്ങളുടെ ശബ്ദം, ഞങ്ങളുടെ ഉത്തരവാദിത്വം" : "Your voice, our responsibility"}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">{t.janashabdam.sub}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/janashabdam/submit">{t.janashabdam.submitCta} <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/janashabdam/issues">{t.janashabdam.browseCta}</Link></Button>
            <Button asChild variant="ghost" size="lg"><Link to="/janashabdam/track">{t.janashabdam.trackCta}</Link></Button>
          </div>

          {/* Live stats */}
          <div className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border">
            {[
              { label: t.stats.issues, value: stats.total },
              { label: lang === "ml" ? "സ്ഥിരീകരിച്ചവ" : "Verified", value: stats.verified },
              { label: t.stats.resolved, value: stats.resolved },
            ].map((s) => (
              <div key={s.label} className="bg-card px-4 py-5 text-center">
                <div className="font-display text-2xl font-bold text-primary sm:text-3xl">{s.value.toLocaleString()}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading title={t.janashabdam.how.title} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ k, icon: Icon }, idx) => {
            const s = t.janashabdam.how[k];
            return (
              <div key={k} className="relative rounded-xl border border-border bg-card p-5">
                <div className="absolute right-4 top-4 text-xs font-semibold text-muted-foreground/60">0{idx + 1}</div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-base font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories grid */}
      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow={lang === "ml" ? "വിഭാഗങ്ങൾ" : "Categories"}
            title={lang === "ml" ? "എന്തെല്ലാം രേഖപ്പെടുത്താം" : "What you can report"}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cats.map((c) => {
              const Icon = catIcon[c];
              return (
                <Link
                  key={c}
                  to="/janashabdam/submit"
                  className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{t.categories[c]}</span>
                    <span className="block text-xs text-muted-foreground">{counts[c]} {lang === "ml" ? "പ്രശ്നങ്ങൾ" : "issues"}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trust.map((tr) => (
            <div key={tr.label} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary/10 text-secondary"><tr.icon className="h-4 w-4" /></span>
              <span className="text-sm font-medium">{tr.label}</span>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}