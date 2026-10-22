import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationCascade, type LocValue } from "@/components/public/LocationCascade";
import { toast } from "sonner";

export const Route = createFileRoute("/volunteer")({
  head: () => ({ meta: [{ title: "വോളണ്ടിയർ · Join" }] }),
  component: Vol,
});

function Vol() {
  const { lang, t } = useLang();
  const [loc, setLoc] = useState<LocValue>({});
  const [done, setDone] = useState(false);
  return (
    <PublicLayout>
      <section className="vk-section-shell-narrow max-w-2xl">
        <h1 className="section-underline font-display text-[clamp(2rem,5vw,2.75rem)] font-bold leading-tight">
          {lang === "ml" ? "വോളണ്ടിയറായി ചേരുക" : "Join as a volunteer"}
        </h1>
        {done ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">{lang === "ml" ? "സ്വാഗതം!" : "Welcome!"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {lang === "ml"
                ? "ജില്ലാ ടീം ഉടൻ ബന്ധപ്പെടും."
                : "The district team will reach out shortly."}
            </p>
          </div>
        ) : (
          <form
            className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
              toast.success("Registered");
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs">{t.janashabdam.form.name}</Label>
                <Input required />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">{t.janashabdam.form.mobile}</Label>
                <Input required maxLength={10} />
              </div>
            </div>
            <LocationCascade value={loc} onChange={setLoc} />
            <Button type="submit">{t.common.submit}</Button>
          </form>
        )}
      </section>
    </PublicLayout>
  );
}
