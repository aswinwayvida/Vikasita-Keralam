import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Pencil, Phone, ShieldCheck } from "lucide-react";
import { helpdeskLocations } from "@/data/helpdesk-locations";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/growth_/$helpdeskId")({
  head: () => ({ meta: [{ title: "Helpdesk details · Admin" }] }),
  component: HelpdeskDetails,
});
function HelpdeskDetails() {
  const { helpdeskId } = Route.useParams();
  const { lang } = useLang();
  const helpdesk = helpdeskLocations.find((x) => x.id === helpdeskId);
  if (!helpdesk)
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        Helpdesk not found
      </div>
    );
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/admin/growth"
            search={{ filter: undefined }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Helpdesks
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{helpdesk.name}</h1>
            <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              Active
            </span>
          </div>
          <p className="mt-1 text-sm text-primary">
            {lang === "ml" ? helpdesk.districtMl : helpdesk.district}
          </p>
        </div>
        <Button>
          <Pencil /> Edit details
        </Button>
      </header>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <main className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Contact and location</h2>
            <div className="mt-4 space-y-3">
              <div className="flex gap-3 rounded-xl bg-muted/50 p-4">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-6">{helpdesk.address}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {helpdesk.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm font-semibold hover:border-secondary/40 hover:text-secondary"
                  >
                    <Phone className="h-4 w-4" />
                    {phone}
                  </a>
                ))}
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Recent activity</h2>
            <div className="mt-4 space-y-3">
              {[
                "Contact details checked",
                "12 applicant calls handled",
                "4 applications forwarded",
              ].map((x, i) => (
                <div key={x} className="flex items-center gap-3 rounded-xl bg-muted/45 p-3">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <div>
                    <p className="text-sm font-semibold">{x}</p>
                    <p className="text-xs text-muted-foreground">
                      {i + 1} day{i ? "s" : ""} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
        <aside className="space-y-4">
          <Stat icon={Clock3} value="18" label="Pending requests" />
          <Stat icon={CheckCircle2} value="42" label="Handled this month" />
          <div className="rounded-2xl border border-secondary/20 bg-secondary/[0.06] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
              <ShieldCheck className="h-4 w-4" /> Contact details checked
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Last confirmed 3 days ago.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
function Stat({ icon: Icon, value, label }: { icon: typeof Clock3; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
