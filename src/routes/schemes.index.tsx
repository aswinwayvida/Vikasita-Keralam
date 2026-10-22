import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Home,
  Landmark,
  Search,
  Sprout,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { LotusWatermark } from "@/components/public/LotusWatermark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/i18n/LanguageProvider";
import { schemes, type Scheme } from "@/data/schemes";
import heroSchemes from "@/assets/hero-schemes-helpdesk-v2.png";

export const Route = createFileRoute("/schemes/")({
  head: () => ({
    meta: [
      { title: "പദ്ധതികൾ · Vikasita Keralam" },
      {
        name: "description",
        content:
          "Search and explore Central Government schemes with Malayalam guidance and application support.",
      },
    ],
  }),
  component: SchemesIndex,
});

type Category = Scheme["category"];

const categoryMeta: Record<Category, { icon: LucideIcon; ml: string; en: string }> = {
  agriculture: { icon: Sprout, ml: "കൃഷി", en: "Agriculture" },
  women: { icon: Users, ml: "വനിതകളും കുട്ടികളും", en: "Women & Child" },
  health: { icon: HeartPulse, ml: "ആരോഗ്യം", en: "Health" },
  education: { icon: GraduationCap, ml: "വിദ്യാഭ്യാസം", en: "Education" },
  housing: { icon: Home, ml: "ഭവനം", en: "Housing" },
  employment: { icon: BriefcaseBusiness, ml: "തൊഴിലും നൈപുണ്യവും", en: "Skills & Employment" },
  welfare: { icon: HandHeart, ml: "സാമൂഹിക സുരക്ഷ", en: "Social Welfare" },
  msme: { icon: Building2, ml: "സംരംഭകത്വം", en: "Business & MSME" },
};

const categories = Object.keys(categoryMeta) as Category[];

function SchemesIndex() {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");

  const copy =
    lang === "ml"
      ? {
          eyebrow: "കേന്ദ്ര സർക്കാർ പദ്ധതികൾ",
          title: "ജീവിതത്തിന്റെ ഓരോ ഘട്ടത്തിനുമുള്ള പദ്ധതികൾ",
          sub: "നിങ്ങൾക്കും കുടുംബത്തിനും ലഭ്യമായ കേന്ദ്ര സർക്കാർ പദ്ധതികൾ മലയാളത്തിൽ കണ്ടെത്തൂ. യോഗ്യത പരിശോധിച്ച് അപേക്ഷാ സഹായവും നേടാം.",
          search: "പദ്ധതിയുടെ പേര്, ആനുകൂല്യം അല്ലെങ്കിൽ മന്ത്രാലയം തിരയുക",
          eligibility: "എന്റെ യോഗ്യത പരിശോധിക്കുക",
          all: "എല്ലാം",
          catalogue: "പദ്ധതി ഡയറക്ടറി",
          results: "പദ്ധതികൾ കണ്ടെത്തി",
          benefit: "ആനുകൂല്യം",
          eligible: "യോഗ്യത",
          details: "വിശദാംശങ്ങൾ",
          help: "അപേക്ഷാ സഹായം",
          noResults: "നിങ്ങളുടെ തിരച്ചിലിന് ചേരുന്ന പദ്ധതികൾ കണ്ടെത്താനായില്ല.",
          reset: "ഫിൽട്ടറുകൾ മാറ്റുക",
          trusted: "പരിശോധിച്ച പദ്ധതി വിവരങ്ങൾ",
          guided: "മലയാളത്തിൽ മാർഗനിർദേശം",
        }
      : {
          eyebrow: "Central Government Schemes",
          title: "Schemes for every stage of life",
          sub: "Discover Central Government schemes for you and your family. Check eligibility and get guided application support in Malayalam or English.",
          search: "Search by scheme, benefit or ministry",
          eligibility: "Check my eligibility",
          all: "All schemes",
          catalogue: "Scheme directory",
          results: "schemes found",
          benefit: "Benefit",
          eligible: "Eligibility",
          details: "View details",
          help: "Application help",
          noResults: "No schemes match your current search and category.",
          reset: "Reset filters",
          trusted: "Verified scheme information",
          guided: "Guidance in Malayalam",
        };

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return schemes.filter((scheme) => {
      if (category !== "all" && scheme.category !== category) return false;
      if (!needle) return true;
      return [
        scheme.ml,
        scheme.en,
        scheme.ministry.ml,
        scheme.ministry.en,
        scheme.benefit.ml,
        scheme.benefit.en,
        scheme.eligibility.ml,
        scheme.eligibility.en,
      ].some((value) => value.toLocaleLowerCase().includes(needle));
    });
  }, [category, query]);

  const chooseCategory = (next: "all" | Category) => {
    setCategory(next);
    requestAnimationFrame(() =>
      document
        .getElementById("scheme-list")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.08] via-background to-secondary/[0.08]">
        <LotusWatermark className="pointer-events-none absolute -right-20 -top-20 h-[420px] w-[420px] text-primary opacity-[0.07]" />
        <div className="vk-container vk-hero-shell vk-hero-grid relative lg:grid-cols-[56fr_44fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Landmark className="h-3.5 w-3.5" /> {copy.eyebrow}
              </p>
              <span className="inline-flex items-center rounded-full bg-green-soft px-3 py-1 text-xs font-bold text-green">
                {schemes.length}{" "}
                {lang === "ml"
                  ? "\u0D2A\u0D26\u0D4D\u0D27\u0D24\u0D3F\u0D15\u0D7E \u0D32\u0D2D\u0D4D\u0D2F\u0D02"
                  : "schemes available"}
              </span>
            </div>
            <h1 className="vk-hero-title mt-5 font-display">{copy.title}</h1>
            <p
              className={`mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg ${lang === "ml" ? "ml-content" : ""}`}
            >
              {copy.sub}
            </p>

            <div className="mt-6 w-full max-w-xl rounded-xl border border-border bg-background p-1.5 shadow-md shadow-foreground/[0.04]">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative flex-1">
                  <span className="sr-only">{copy.search}</span>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") chooseCategory(category);
                    }}
                    placeholder={copy.search}
                    className="h-10 border-0 bg-transparent pl-10 pr-9 text-sm shadow-none focus-visible:ring-0"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>
                <Button
                  type="button"
                  size="sm"
                  className="h-10 w-full px-5 sm:w-auto"
                  onClick={() => chooseCategory(category)}
                >
                  {lang === "ml" ? "തിരയുക" : "Search"} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-foreground/70">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-secondary" />
                {copy.trusted}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {copy.guided}
              </span>
            </div>
          </div>

          <div className="vk-hero-media mx-auto max-w-[460px]">
            <div className="aspect-[5/4] overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl">
              <img
                src={heroSchemes}
                alt="Scheme helpdesk support"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => chooseCategory("all")}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${category === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"}`}
            >
              <Landmark className="h-4 w-4" /> {copy.all}
            </button>
            {categories.map((id) => {
              const item = categoryMeta[id];
              const Icon = item.icon;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => chooseCategory(id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${category === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"}`}
                >
                  <Icon className="h-4 w-4" /> {item[lang]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="scheme-list" className="scroll-mt-28 vk-section-shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {copy.catalogue}
            </p>
            <h2 className="section-underline mt-2 text-2xl font-semibold sm:text-3xl">
              {filtered.length} {copy.results}
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/eligibility" search={{ scheme: undefined }}>
              {copy.eligibility} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {filtered.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((scheme) => {
              const meta = categoryMeta[scheme.category];
              const Icon = meta.icon;
              return (
                <article
                  key={scheme.id}
                  className="group flex min-h-[310px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
                >
                  <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-secondary" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                        <Icon className="h-3.5 w-3.5" /> {meta[lang]}
                      </span>
                      <Landmark className="h-5 w-5 shrink-0 text-secondary" />
                    </div>
                    <p className="mt-4 text-xs font-medium text-muted-foreground">
                      {scheme.ministry[lang]}
                    </p>
                    <h3
                      className={`mt-1 text-lg font-semibold leading-snug group-hover:text-primary ${lang === "ml" ? "ml-content" : ""}`}
                    >
                      {scheme[lang]}
                    </h3>
                    <div className="mt-4 grid gap-3 text-sm">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                          {copy.benefit}
                        </div>
                        <p className="mt-0.5 text-foreground/80">{scheme.benefit[lang]}</p>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                          {copy.eligible}
                        </div>
                        <p className="mt-0.5 text-foreground/80">{scheme.eligibility[lang]}</p>
                      </div>
                    </div>
                    <div className="mt-auto flex gap-2 pt-5">
                      <Button asChild size="sm" className="flex-1">
                        <Link to="/schemes/$id" params={{ id: scheme.id }}>
                          {copy.details}
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to="/helpdesk">{copy.help}</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">{copy.noResults}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              {copy.reset}
            </Button>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
