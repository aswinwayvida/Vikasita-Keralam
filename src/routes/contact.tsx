import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "ബന്ധപ്പെടുക · Contact" }] }),
  component: Contact,
});

function Contact() {
  const { lang } = useLang();
  return (
    <PublicLayout>
      <section className="vk-section-shell-narrow max-w-3xl">
        <h1 className="section-underline font-display text-[clamp(2rem,5vw,2.75rem)] font-bold leading-tight">
          {lang === "ml" ? "ബന്ധപ്പെടുക" : "Contact us"}
        </h1>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Mail, label: "Email", value: "help@vikasitakeralam.in" },
            { icon: Phone, label: lang === "ml" ? "ഫോൺ" : "Phone", value: "+91 471-000-0000" },
            {
              icon: MapPin,
              label: lang === "ml" ? "സംസ്ഥാന ഓഫീസ്" : "State office",
              value: "Thiruvananthapuram, Kerala",
            },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-5">
              <c.icon className="h-5 w-5 text-primary" />
              <div className="mt-2 text-xs text-muted-foreground">{c.label}</div>
              <div className="text-sm font-medium">{c.value}</div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
