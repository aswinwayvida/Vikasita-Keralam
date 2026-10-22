import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Headphones,
  Info,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { PublicLayout } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { schemes } from "@/data/schemes";
import { getSchemeGuide } from "@/data/scheme-guides";
import { useLang } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/schemes/$id")({
  head: () => ({ meta: [{ title: "പദ്ധതി · Scheme" }] }),
  component: SchemeDetail,
});

function SchemeDetail() {
  const { id } = Route.useParams();
  const { lang, t } = useLang();
  const scheme = schemes.find((item) => item.id === id);

  if (!scheme) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl p-10 text-center text-muted-foreground">
          {t.common.noData}
        </div>
      </PublicLayout>
    );
  }

  const guide = getSchemeGuide(scheme);
  const copy =
    lang === "ml"
      ? {
          back: "എല്ലാ പദ്ധതികളും",
          benefit: "ലഭിക്കുന്ന സഹായം",
          eligibility: "പ്രാഥമിക യോഗ്യത",
          documents: "സാധാരണ ആവശ്യമായ രേഖകൾ",
          documentsHint: "ഇപ്പോൾ രേഖകൾ അപ്‌ലോഡ് ചെയ്യേണ്ടതില്ല.",
          process: "അപേക്ഷാ സഹായത്തിന്റെ വഴി",
          readiness: "തുടങ്ങുന്നതിന് മുമ്പ്",
          support: "SahAI നിങ്ങളോടൊപ്പം",
          supportText:
            "ഓരോ ഘട്ടവും ലളിതമായ മലയാളത്തിൽ SahAI വിശദീകരിക്കും. ആവശ്യമായാൽ ഹെൽപ്പ്ഡെസ്ക് സഹായവും തിരഞ്ഞെടുക്കാം.",
          start: "അപേക്ഷാ സഹായം തുടങ്ങുക",
          check: "യോഗ്യത വീണ്ടും പരിശോധിക്കുക",

          verified: "അന്തിമ യോഗ്യതയും അനുമതിയും ബന്ധപ്പെട്ട സർക്കാർ അതോറിറ്റിയുടേതാണ്.",
          mode: guide.supportMode === "guided" ? "പൂർണ്ണ മാർഗനിർദ്ദേശം" : "രേഖാ-അപേക്ഷ സഹായം",
        }
      : {
          back: "All schemes",
          benefit: "Benefit",
          eligibility: "Initial eligibility",
          documents: "Documents commonly required",
          documentsHint: "No document upload is required at this stage.",
          process: "Application-assistance path",
          readiness: "Before you begin",
          support: "SahAI stays with you",
          supportText:
            "SahAI explains every step in simple language, with helpdesk assistance available when needed.",
          start: "Start application assistance",
          check: "Check eligibility again",

          verified:
            "Final eligibility and approval remain with the responsible government authority.",
          mode:
            guide.supportMode === "guided" ? "Fully guided" : "Document and application assistance",
        };

  return (
    <PublicLayout>
      <section className="border-b border-border bg-gradient-to-br from-saffron-soft/55 via-background to-green-soft/35">
        <div className="vk-container vk-hero-shell">
          <Link
            to="/schemes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> {copy.back}
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/25 bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-wide text-saffron-deep">
                  {scheme.ministry[lang]}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-soft px-3 py-1 text-xs font-bold text-green">
                  <BadgeCheck className="h-3.5 w-3.5" /> {copy.mode}
                </span>
              </div>
              <h1 className="vk-hero-title mt-4 max-w-4xl font-display font-extrabold text-navy">
                {scheme[lang]}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                {guide.summary[lang]}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base font-bold">
                  <Link to="/apply/$schemeId" params={{ schemeId: scheme.id }}>
                    {copy.start} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl bg-white/80 px-6 text-base"
                >
                  <Link to="/eligibility" search={{ scheme: scheme.id }}>
                    {copy.check}
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="rounded-3xl border border-primary/20 bg-white p-5 shadow-[0_18px_50px_-32px_rgba(10,42,102,0.45)] sm:p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-saffron-soft text-saffron-deep">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{copy.support}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.supportText}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-muted/65 p-3 text-sm font-semibold">
                <Clock3 className="h-4 w-4 text-primary" /> {guide.expectedTime[lang]}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="vk-section-shell">
        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard icon={ShieldCheck} title={copy.benefit} text={scheme.benefit[lang]} />
          <InfoCard icon={CheckCircle2} title={copy.eligibility} text={scheme.eligibility[lang]} />
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-saffron-soft text-saffron-deep">
                <ListChecks className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold sm:text-2xl">{copy.process}</h2>
            </div>
            <ol className="mt-7 space-y-5">
              {guide.applicationSteps.map((step, index) => (
                <li key={step.en} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-bold text-white shadow-sm">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-foreground/85 sm:text-base">
                    {step[lang]}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <FileCheck2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">{copy.documents}</h2>
            </div>
            <ul className="mt-5 space-y-3">
              {guide.documents.map((document) => (
                <li key={document.en} className="flex gap-3 text-sm leading-6 text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green" /> {document[lang]}
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-xl bg-muted/70 px-4 py-3 text-xs leading-5 text-muted-foreground">
              {copy.documentsHint}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-green/20 bg-green-soft/45 p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <Headphones className="h-5 w-5 text-green" />
            <h2 className="text-xl font-bold">{copy.readiness}</h2>
          </div>
          <ul className="mt-4 grid gap-3 text-sm leading-6 md:grid-cols-3">
            {guide.readinessQuestions.map((question) => (
              <li key={question.en} className="flex gap-2.5 rounded-2xl bg-white/55 px-4 py-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green" />
                {question[lang]}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PublicLayout>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-saffron-soft text-saffron-deep">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{title}</div>
          <p className="mt-2 text-base leading-7 text-foreground/85">{text}</p>
        </div>
      </div>
    </div>
  );
}
