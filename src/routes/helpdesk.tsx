import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { findHelpdeskLocations, helpdeskDistricts } from "@/data/helpdesk-locations";
import { toast } from "sonner";
import { Copy, MapPin, Navigation, Phone, Search } from "lucide-react";

export const Route = createFileRoute("/helpdesk")({
  head: () => ({
    meta: [
      { title: "Helpdesk Locator · Vikasita Keralam" },
      {
        name: "description",
        content: "Find Vikasita Keralam scheme-assistance helpdesks across Kerala.",
      },
    ],
  }),
  component: Helpdesk,
});

function Helpdesk() {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("all");

  const copy =
    lang === "ml"
      ? {
          eyebrow:
            "\u0d2a\u0d26\u0d4d\u0d27\u0d24\u0d3f \u0d38\u0d39\u0d3e\u0d2f \u0d15\u0d47\u0d28\u0d4d\u0d26\u0d4d\u0d30\u0d19\u0d4d\u0d19\u0d7e",
          title:
            "\u0d39\u0d46\u0d7d\u0d2a\u0d4d\u0d2a\u0d4d\u0d21\u0d46\u0d38\u0d4d\u0d15\u0d4d \u0d15\u0d23\u0d4d\u0d1f\u0d46\u0d24\u0d4d\u0d24\u0d42",
          intro:
            "\u0d15\u0d47\u0d28\u0d4d\u0d26\u0d4d\u0d30 \u0d38\u0d7c\u0d15\u0d4d\u0d15\u0d3e\u0d7c \u0d2a\u0d26\u0d4d\u0d27\u0d24\u0d3f\u0d15\u0d33\u0d41\u0d1f\u0d46 \u0d2f\u0d4b\u0d17\u0d4d\u0d2f\u0d24, \u0d30\u0d47\u0d16\u0d15\u0d7e, \u0d05\u0d2a\u0d47\u0d15\u0d4d\u0d37 \u0d0e\u0d28\u0d4d\u0d28\u0d3f\u0d35\u0d2f\u0d3f\u0d7d \u0d38\u0d39\u0d3e\u0d2f\u0d02 \u0d28\u0d47\u0d1f\u0d3e\u0d7b \u0d0f\u0d31\u0d4d\u0d31\u0d35\u0d41\u0d2e\u0d1f\u0d41\u0d24\u0d4d\u0d24 \u0d39\u0d46\u0d7d\u0d2a\u0d4d\u0d2a\u0d4d\u0d21\u0d46\u0d38\u0d4d\u0d15\u0d4d \u0d15\u0d23\u0d4d\u0d1f\u0d46\u0d24\u0d4d\u0d24\u0d42.",
          sahaiCta:
            "SahAI \u0d35\u0d34\u0d3f \u0d15\u0d23\u0d4d\u0d1f\u0d46\u0d24\u0d4d\u0d24\u0d3e\u0d02",
          sahaiHint:
            "\u0d28\u0d3f\u0d19\u0d4d\u0d19\u0d33\u0d41\u0d1f\u0d46 \u0d1c\u0d3f\u0d32\u0d4d\u0d32\u0d2f\u0d4b \u0d38\u0d4d\u0d25\u0d32\u0d2e\u0d4b \u0d2a\u0d31\u0d1e\u0d4d\u0d1e\u0d3e\u0d7d \u0d05\u0d1f\u0d41\u0d24\u0d4d\u0d24\u0d41\u0d33\u0d4d\u0d33 \u0d39\u0d46\u0d7d\u0d2a\u0d4d\u0d2a\u0d4d\u0d21\u0d46\u0d38\u0d4d\u0d15\u0d4d \u0d15\u0d23\u0d4d\u0d1f\u0d46\u0d24\u0d4d\u0d24\u0d3e\u0d02.",
          sahaiAction: "\u0d38\u0d02\u0d38\u0d3e\u0d30\u0d3f\u0d15\u0d4d\u0d15\u0d42",
          searchPlaceholder:
            "\u0d1c\u0d3f\u0d32\u0d4d\u0d32, \u0d38\u0d4d\u0d25\u0d32\u0d02 \u0d05\u0d32\u0d4d\u0d32\u0d46\u0d19\u0d4d\u0d15\u0d3f\u0d7d \u0d2a\u0d3f\u0d7b\u0d15\u0d4b\u0d21\u0d4d \u0d24\u0d3f\u0d30\u0d2f\u0d42",
          allDistricts:
            "\u0d0e\u0d32\u0d4d\u0d32\u0d3e \u0d1c\u0d3f\u0d32\u0d4d\u0d32\u0d15\u0d33\u0d41\u0d02",
          results:
            "\u0d39\u0d46\u0d7d\u0d2a\u0d4d\u0d2a\u0d4d\u0d21\u0d46\u0d38\u0d4d\u0d15\u0d41\u0d15\u0d7e",
          address: "\u0d35\u0d3f\u0d32\u0d3e\u0d38\u0d02",
          call: "\u0d35\u0d3f\u0d33\u0d3f\u0d15\u0d4d\u0d15\u0d42",
          directions: "\u0d35\u0d34\u0d3f\u0d15\u0d3e\u0d1f\u0d4d\u0d1f\u0d3f",
          copyAddress:
            "\u0d35\u0d3f\u0d32\u0d3e\u0d38\u0d02 \u0d2a\u0d15\u0d7c\u0d24\u0d4d\u0d24\u0d42",
          copied: "\u0d35\u0d3f\u0d32\u0d3e\u0d38\u0d02 \u0d2a\u0d15\u0d7c\u0d24\u0d4d\u0d24\u0d3f",
          noResults:
            "\u0d39\u0d46\u0d7d\u0d2a\u0d4d\u0d2a\u0d4d\u0d21\u0d46\u0d38\u0d4d\u0d15\u0d4d \u0d15\u0d23\u0d4d\u0d1f\u0d46\u0d24\u0d4d\u0d24\u0d3e\u0d28\u0d3e\u0d2f\u0d3f\u0d32\u0d4d\u0d32",
          noResultsSub:
            "\u0d2e\u0d31\u0d4d\u0d31\u0d4a\u0d30\u0d41 \u0d1c\u0d3f\u0d32\u0d4d\u0d32\u0d2f\u0d4b \u0d38\u0d4d\u0d25\u0d32\u0d2e\u0d4b \u0d24\u0d3f\u0d30\u0d2f\u0d41\u0d15.",
          visitNote:
            "\u0d38\u0d28\u0d4d\u0d26\u0d7c\u0d36\u0d3f\u0d15\u0d4d\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d24\u0d3f\u0d28\u0d4d \u0d2e\u0d41\u0d2e\u0d4d\u0d2a\u0d4d \u0d2b\u0d4b\u0d7a \u0d1a\u0d46\u0d2f\u0d4d\u0d24\u0d4d \u0d38\u0d2e\u0d2f\u0d02 \u0d38\u0d4d\u0d25\u0d3f\u0d30\u0d40\u0d15\u0d30\u0d3f\u0d15\u0d4d\u0d15\u0d41\u0d15.",
        }
      : {
          eyebrow: "Scheme assistance centres",
          title: "Find a helpdesk",
          intro:
            "Find the nearest helpdesk for support with Central Government scheme eligibility, documents and applications.",
          sahaiCta: "Find it with SahAI",
          sahaiHint: "Tell us your district or place to find a nearby helpdesk.",
          sahaiAction: "Speak now",
          searchPlaceholder: "Search district, place or PIN code",
          allDistricts: "All districts",
          results: "Helpdesks",
          address: "Address",
          call: "Call",
          directions: "Directions",
          copyAddress: "Copy address",
          copied: "Address copied",
          noResults: "No helpdesk found",
          noResultsSub: "Try another district or place name.",
          visitNote: "Please call and confirm the visiting time before travelling.",
        };

  const results = useMemo(() => findHelpdeskLocations(query, district), [district, query]);

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      toast.success(copy.copied);
    } catch {
      toast.error(lang === "ml" ? "Copy unavailable" : "Copy unavailable");
    }
  }

  return (
    <PublicLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/[0.08] via-background to-secondary/[0.06]">
        <div className="vk-container vk-hero-shell">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {copy.eyebrow}
            </div>
            <h1 className="vk-hero-title mt-3 max-w-3xl font-display text-foreground">
              {copy.title}
            </h1>
            <p
              className={`mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground ${lang === "ml" ? "ml-content" : ""}`}
            >
              {copy.intro}
            </p>
          </div>

        </div>
      </section>

      <section className="vk-section-shell">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-[280px_1fr]">
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="h-12 text-base" aria-label={copy.allDistricts}>
                <SelectValue placeholder={copy.allDistricts} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{copy.allDistricts}</SelectItem>
                {helpdeskDistricts.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {lang === "ml" ? item.nameMl : item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="h-12 pl-12 text-base"
                aria-label={copy.searchPlaceholder}
              />
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              className={`font-display text-2xl font-bold text-foreground ${lang === "ml" ? "ml-content" : ""}`}
            >
              {copy.results}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{results.length} / 30</p>
          </div>
          <p
            className={`max-w-lg text-sm text-muted-foreground ${lang === "ml" ? "ml-content" : ""}`}
          >
            {copy.visitNote}
          </p>
        </div>

        {results.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {results.map((location) => (
              <article
                key={location.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-foreground">{location.name}</h3>
                    <p className="mt-0.5 text-xs font-medium text-primary">
                      {lang === "ml" ? location.districtMl : location.district}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex-1">
                  <div
                    className={`text-xs font-semibold uppercase tracking-wide text-muted-foreground ${lang === "ml" ? "ml-content" : ""}`}
                  >
                    {copy.address}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                    {location.address}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {location.phones.map((phone) => (
                    <Button key={phone} asChild size="sm">
                      <a href={`tel:${phone}`} aria-label={`${copy.call} ${phone}`}>
                        <Phone className="h-4 w-4" />
                        {phone}
                      </a>
                    </Button>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => copyAddress(location.address)}
                  >
                    <Copy className="h-4 w-4" />
                    {copy.copyAddress}
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Navigation className="h-4 w-4" />
                      {copy.directions}
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
            <MapPin className="mx-auto h-9 w-9 text-muted-foreground" />
            <h3 className={`mt-3 text-lg font-semibold ${lang === "ml" ? "ml-content" : ""}`}>
              {copy.noResults}
            </h3>
            <p
              className={`mt-1 text-sm text-muted-foreground ${lang === "ml" ? "ml-content" : ""}`}
            >
              {copy.noResultsSub}
            </p>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
