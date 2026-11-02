import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "ബന്ധപ്പെടുക · Contact" }] }),
  component: Contact,
});

function Contact() {
  const { lang } = useLang();
  const details = [
    {
      icon: Phone,
      label: lang === "ml" ? "ഔദ്യോഗിക ഫോൺ നമ്പർ" : "Official Phone Number",
      value: "+91.4712333390",
      href: "tel:+914712333390",
    },
    {
      icon: Mail,
      label: lang === "ml" ? "ഔദ്യോഗിക ഇമെയിൽ ഐഡി" : "Official Email ID",
      value: "bjpkerala@gmail.com",
      href: "mailto:bjpkerala@gmail.com",
    },
    {
      icon: Clock,
      label: lang === "ml" ? "പ്രവർത്തന സമയം" : "Business Hours",
      value: lang === "ml" ? "രാവിലെ 10 മുതൽ വൈകുന്നേരം 5:30 വരെ" : "10 AM to 5:30 PM",
    },
  ];

  return (
    <PublicLayout>
      <section className="vk-section-shell-narrow max-w-3xl">
        <h1 className="section-underline font-display text-[clamp(2rem,5vw,2.75rem)] font-bold leading-tight">
          {lang === "ml" ? "ബന്ധപ്പെടുക" : "Contact us"}
        </h1>
        <div className="mt-8 grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2">
          <div className="border-b border-border p-6 sm:border-b-0 sm:border-r">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {lang === "ml" ? "വിലാസം" : "Address"}
              </div>
            </div>
            <address className="mt-3 not-italic text-sm font-medium leading-relaxed">
              BJP Kerala
              <br />
              Mararji Smrithi Mandiram,
              <br />
              Thycaud P.O,
              <br />
              Trivandrum, Kerala 695014,
              <br />
              India
            </address>
          </div>
          <div className="divide-y divide-border">
            {details.map((detail) => {
              const body = (
                <div className="flex items-start gap-3 px-6 py-5">
                  <detail.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {detail.label}
                    </div>
                    <div className="mt-0.5 break-words text-sm font-medium">{detail.value}</div>
                  </div>
                </div>
              );

              return detail.href ? (
                <a
                  key={detail.label}
                  href={detail.href}
                  className="block transition-colors hover:bg-muted/50"
                >
                  {body}
                </a>
              ) : (
                <div key={detail.label}>{body}</div>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
