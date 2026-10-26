import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { LotusWatermark } from "@/components/public/LotusWatermark";
import { KeralaMapMark } from "@/components/public/KeralaMapMark";
import { SectionHeading } from "@/components/public/SectionHeading";
import { IssueCard } from "@/components/public/IssueCard";
import { Button } from "@/components/ui/button";
import { issues } from "@/data/issues";
import { schemes } from "@/data/schemes";
import { successStories } from "@/data/volunteers";
import {
  ArrowRight,
  MessageSquare,
  Megaphone,
  Users,
  Search,
  ShieldCheck,
  Sparkles,
  HandHeart,
  Clock,
  MapPin,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";
import { FEATURES } from "@/config/features";
import heroVikasita from "@/assets/hero-vikasita-keralam.png";
import heroSchemes from "@/assets/hero-schemes-helpdesk-v2.png";
import heroVolunteer from "@/assets/hero-volunteer-service-v2.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "വികസിത കേരളം · ഹോം" },
      {
        name: "description",
        content:
          "Malayalam-first Central Government scheme eligibility and application helpdesk for Kerala.",
      },
      { property: "og:title", content: "വികസിത കേരളം · ഹോം" },
      {
        property: "og:description",
        content:
          "Malayalam-first Central Government scheme eligibility and application helpdesk for Kerala.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { lang, t } = useLang();

  const pillars = [
    {
      icon: MessageSquare,
      to: "/eligibility",
      title: t.pillars.schemes.title,
      desc: t.pillars.schemes.desc,
      tone: "primary" as const,
    },
    ...(FEATURES.janashabdam
      ? [
          {
            icon: Megaphone,
            to: "/janashabdam" as const,
            title: t.pillars.janashabdam.title,
            desc: t.pillars.janashabdam.desc,
            tone: "secondary" as const,
          },
        ]
      : []),
    ...(FEATURES.janashabdam
      ? [
          {
            icon: Search,
            to: "/janashabdam/track" as const,
            title: t.pillars.track.title,
            desc: t.pillars.track.desc,
            tone: "primary" as const,
          },
        ]
      : []),
    {
      icon: Users,
      to: "/volunteer",
      title: t.pillars.volunteer.title,
      desc: t.pillars.volunteer.desc,
      tone: "secondary" as const,
    },
  ];

  const recentIssues = issues.filter((i) => i.publicVisible).slice(0, 6);
  const featured = schemes.slice(0, 6);

  const slides = [
    {
      eyebrow: t.hero.eyebrow,
      title: t.hero.title,
      sub: t.hero.sub,
      ctaPrimary: FEATURES.janashabdam
        ? { label: t.hero.ctaPrimary, to: "/janashabdam/submit" as const }
        : { label: t.hero.ctaPrimary, to: "/eligibility" as const },
      ctaSecondary: FEATURES.janashabdam
        ? { label: t.hero.ctaSecondary, to: "/eligibility" as const }
        : { label: t.hero.ctaSecondary, to: "/helpdesk" as const },
      image: heroVikasita,
      alt: "Vikasita Keralam - Development for Kerala",
      creative: "default" as const,
    },
    {
      eyebrow:
        lang === "ml"
          ? "പദ്ധതി കണ്ടെത്തൽ · യോഗ്യത · അപേക്ഷാ സഹായം"
          : "Discover Schemes · Check Eligibility · Get Application Support",
      title:
        lang === "ml"
          ? "നിങ്ങൾക്കുള്ള പദ്ധതി\nഒരൊറ്റ ക്ലിക്കിൽ"
          : "Find the right central\nscheme for you",
      sub:
        lang === "ml"
          ? "PM-KISAN, ആയുഷ്മാൻ ഭാരത്, ഉജ്ജ്വല, മുദ്ര തുടങ്ങിയ പദ്ധതികളിലേക്ക് യോഗ്യത പരിശോധിച്ച് അപേക്ഷിക്കാം."
          : "Check eligibility and apply for PM-KISAN, Ayushman Bharat, Ujjwala, Mudra and more — guided in your language.",
      ctaPrimary: {
        label: lang === "ml" ? "പദ്ധതികൾ കാണുക" : "Browse Schemes",
        to: "/schemes" as const,
      },
      ctaSecondary: { label: "Helpdesk", to: "/helpdesk" as const },
      image: heroSchemes,
      alt: "Elderly Kerala couple receiving scheme application assistance",
      creative: "schemes" as const,
    },
    {
      eyebrow: lang === "ml" ? "വോളണ്ടിയർ നെറ്റ്‌വർക്ക്" : "Volunteer Network",
      title:
        lang === "ml"
          ? "നിങ്ങളുടെ നാട്ടിൽ\nമാറ്റം കൊണ്ടുവരൂ"
          : "Bring real change\nto your neighbourhood",
      sub:
        lang === "ml"
          ? "വാർഡ്, പഞ്ചായത്ത്, നിയോജക മണ്ഡല തലത്തിൽ വോളണ്ടിയറായി ചേർന്ന് ജനങ്ങളെ സഹായിക്കാം."
          : "Join as a ward, panchayat or constituency-level volunteer and help citizens access schemes and services.",
      ctaPrimary: { label: "Join as Volunteer", to: "/volunteer" as const },
      ctaSecondary: FEATURES.janashabdam
        ? { label: "Success Stories", to: "/janashabdam/success-stories" as const }
        : { label: t.hero.ctaPrimary, to: "/eligibility" as const },
      image: heroVolunteer,
      alt: "Kerala volunteers guiding citizens at a community help camp",
      creative: "default" as const,
    },
  ];

  const autoplay = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <LotusWatermark className="pointer-events-none absolute -right-16 -top-20 h-[420px] w-[420px] text-primary opacity-[0.06]" />
        <KeralaMapMark className="pointer-events-none absolute -left-10 bottom-0 h-[360px] w-[140px] text-secondary opacity-[0.07]" />
        <div className="vk-home-hero-shell relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-12">
          <Carousel
            setApi={setApi}
            opts={{ loop: true, align: "start" }}
            plugins={[autoplay.current]}
            className="w-full"
          >
            <CarouselContent>
              {slides.map((slide, idx) => (
                <CarouselItem key={idx}>
                  <div className="grid items-center gap-8 lg:grid-cols-[52fr_48fr] lg:gap-10">
                    <div className="min-w-0">
                      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {slide.eyebrow}
                      </p>
                      <h1 className="vk-hero-title whitespace-pre-line font-display">
                        {slide.title}
                      </h1>
                      <p
                        className={`mt-4 max-w-[560px] text-base text-muted-foreground sm:text-lg ${lang === "ml" ? "ml-content" : ""}`}
                      >
                        {slide.sub}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          asChild
                          size="lg"
                          className="h-auto min-h-10 max-w-full whitespace-normal text-center"
                        >
                          <Link to={slide.ctaPrimary.to}>
                            {slide.ctaPrimary.label} <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="lg"
                          className="h-auto min-h-10 max-w-full whitespace-normal text-center"
                        >
                          <Link to={slide.ctaSecondary.to}>{slide.ctaSecondary.label}</Link>
                        </Button>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            aria-label={`Go to slide ${i + 1}`}
                            onClick={() => api?.scrollTo(i)}
                            className={`h-1.5 rounded-full transition-all ${
                              selected === i
                                ? "w-8 bg-primary"
                                : "w-3 bg-foreground/20 hover:bg-foreground/40"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="vk-home-hero-media relative mx-auto mb-6 max-w-[460px] sm:mb-8 lg:mb-10 lg:ml-auto lg:mr-0 lg:max-w-[520px]">
                      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted shadow-md">
                        <img
                          src={slide.image}
                          alt={slide.alt}
                          width={1024}
                          height={1024}
                          loading={idx === 0 ? "eager" : "lazy"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CarouselPrevious className="absolute left-3 top-1/2 z-20 h-9 w-9 -translate-y-1/2 translate-x-0 bg-background/95 shadow-md" />
                      <CarouselNext className="absolute right-3 top-1/2 z-20 h-9 w-9 -translate-y-1/2 translate-x-0 bg-background/95 shadow-md" />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Current-phase impact strip */}
      <section className="relative z-20 -mt-6 px-4 sm:-mt-8 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {[
            { label: t.stats.citizens, value: "1,24,800+" },
            { label: t.stats.volunteers, value: "8,201+" },
            { label: t.stats.panchayats, value: "940+" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/80 border-t-2 border-t-primary/35 bg-card px-6 py-5 text-center shadow-[0_10px_24px_-16px_rgba(15,36,85,0.32)] sm:py-6"
            >
              <div className="font-display text-2xl font-bold text-primary sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="vk-section-shell">
        <SectionHeading
          eyebrow={
            FEATURES.janashabdam
              ? "Four Pillars"
              : lang === "ml"
                ? "\u0D38\u0D47\u0D35\u0D28\u0D19\u0D4D\u0D19\u0D7E"
                : "Our services"
          }
          title={
            FEATURES.janashabdam
              ? "One platform, four services"
              : "Scheme helpdesk and volunteer support"
          }
          sub={
            FEATURES.janashabdam
              ? lang === "ml"
                ? "പദ്ധതി, ജനശബ്ദം, ട്രാക്കിംഗ്, വോളണ്ടിയർ — ഒരൊറ്റ ഇടത്ത്."
                : "Schemes, Janashabdam, tracking, volunteers — in one place."
              : lang === "ml"
                ? "പദ്ധതി യോഗ്യത, അപേക്ഷാ സഹായം, വോളണ്ടിയർ പിന്തുണ — ഒരൊറ്റ ഇടത്ത്."
                : "Scheme eligibility, application assistance, and volunteer support — in one place."
          }
        />
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${FEATURES.janashabdam ? "lg:grid-cols-4" : "lg:grid-cols-2"}`}
        >
          {pillars.map((p) => (
            <Link
              key={p.title}
              to={p.to}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${p.tone === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}
              >
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p
                className={`mt-1.5 text-sm text-muted-foreground ${lang === "ml" ? "ml-content" : ""}`}
              >
                {p.desc}
              </p>
              <span className="mt-4 inline-flex items-center text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                {t.common.learnMore} <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured schemes */}
      <section className="bg-card">
        <div className="vk-section-shell">
          <SectionHeading
            eyebrow={lang === "ml" ? "കേന്ദ്ര പദ്ധതികൾ" : "Central schemes"}
            title={
              lang === "ml" ? "ജനപ്രിയ കേന്ദ്ര പദ്ധതികൾ" : "Popular central government schemes"
            }
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/schemes">{t.common.viewAll}</Link>
              </Button>
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <Link
                key={s.id}
                to="/schemes/$id"
                params={{ id: s.id }}
                className="group rounded-xl border border-border bg-background p-5 transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> {s.ministry[lang]}
                </div>
                <h3 className="mt-2 text-base font-semibold group-hover:text-primary">{s[lang]}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.benefit[lang]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {FEATURES.janashabdam && (
        <>
          {/* Recent Janashabdam (anonymized) */}
          <section className="vk-section-shell">
            <SectionHeading
              eyebrow="Citizen Voices"
              title={lang === "ml" ? "സമീപകാല പൗര പ്രശ്നങ്ങൾ" : "Recent citizen issues"}
              sub={t.janashabdam.publicNote}
              action={
                <Button asChild variant="outline" size="sm">
                  <Link to="/janashabdam/issues">{t.common.viewAll}</Link>
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentIssues.map((i) => (
                <IssueCard key={i.id} issue={i} />
              ))}
            </div>
          </section>

          {/* Success stories */}
          <section className="bg-secondary/5">
            <div className="vk-section-shell">
              <SectionHeading
                eyebrow="Success Stories"
                title={
                  lang === "ml"
                    ? "പരിഹരിച്ച പ്രശ്നങ്ങൾ, ലളിതമായ വാർത്തകൾ"
                    : "Issues resolved, clearly reported"
                }
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link to="/janashabdam/success-stories">{t.common.viewAll}</Link>
                  </Button>
                }
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {successStories.slice(0, 6).map((s) => (
                  <div key={s.id} className="rounded-xl border border-border bg-card p-5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-semibold text-secondary">
                      <ShieldCheck className="h-3 w-3" /> Resolved
                    </span>
                    <h3 className="mt-3 text-base font-semibold leading-snug">{s.title[lang]}</h3>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {s.days} days
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {s.district.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Volunteer band */}
      <section className="vk-section-shell">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-primary/5 p-8 sm:p-12">
          <LotusWatermark className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-primary opacity-[0.08]" />
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="font-display text-2xl font-semibold sm:text-3xl">
                {lang === "ml"
                  ? "നിങ്ങളുടെ പ്രദേശത്ത് മാറ്റം കൊണ്ടുവരൂ"
                  : "Bring change to your local area"}
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {lang === "ml"
                  ? "വാർഡ് / പഞ്ചായത്ത് / നിയോജക മണ്ഡല തലത്തിൽ വോളണ്ടിയറായി ചേരുക."
                  : "Join as a volunteer at ward, panchayat or constituency level."}
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/volunteer">
                <HandHeart className="mr-1.5 h-4 w-4" /> {t.nav.volunteer}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
