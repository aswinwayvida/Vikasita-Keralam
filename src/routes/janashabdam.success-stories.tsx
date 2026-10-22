import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { SectionHeading } from "@/components/public/SectionHeading";
import { successStories } from "@/data/volunteers";
import { issues } from "@/data/issues";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { getDistrictName } from "@/data/geo";

export const Route = createFileRoute("/janashabdam/success-stories")({
  head: () => ({ meta: [{ title: "വിജയ കഥകൾ · Success stories" }] }),
  component: Stories,
});

function Stories() {
  const { lang, t } = useLang();
  const resolved = issues.filter((i) => i.status === "resolved" || i.status === "closed");

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeading
          eyebrow="ജനശബ്ദം"
          title={lang === "ml" ? "പരിഹരിച്ച പ്രശ്നങ്ങൾ" : "Resolved issues"}
          sub={lang === "ml" ? "സമൂഹത്തിന്റെ പിന്തുണയോടെ പരിഹരിച്ച പ്രശ്നങ്ങളും വോളണ്ടിയർ കഥകളും." : "Issues resolved with community and volunteer support."}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {successStories.map((s) => (
            <article key={s.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="grid grid-cols-2 gap-0.5 bg-border">
                <div className="aspect-[4/3] bg-muted/60 flex items-center justify-center text-xs text-muted-foreground">{lang === "ml" ? "മുമ്പ്" : "Before"}</div>
                <div className="aspect-[4/3] bg-secondary/15 flex items-center justify-center text-xs text-secondary font-medium">{lang === "ml" ? "ശേഷം" : "After"}</div>
              </div>
              <div className="p-5">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-semibold text-secondary"><CheckCircle2 className="h-3 w-3" /> {lang === "ml" ? "പരിഹരിച്ചു" : "Resolved"}</span>
                <h3 className="mt-3 text-base font-semibold leading-snug">{s.title[lang]}</h3>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.days} {lang === "ml" ? "ദിവസം" : "days"}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {getDistrictName(s.district, lang)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          {lang === "ml" ? "കൂടാതെ" : "Plus"} {resolved.length} {lang === "ml" ? "പ്രശ്നങ്ങൾ ജനശബ്ദത്തിലൂടെ പരിഹരിക്കപ്പെട്ടു." : "issues resolved through Janashabdam."}
        </p>
      </section>
    </PublicLayout>
  );
}