import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  UserCheck,
} from "lucide-react";
import { volunteers } from "@/data/volunteers";
import { getConstituencyName, getDistrictName } from "@/data/geo";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/admin/volunteers_/$volunteerId")({
  head: () => ({ meta: [{ title: "Volunteer details · Admin" }] }),
  component: VolunteerDetails,
});
function VolunteerDetails() {
  const { volunteerId } = Route.useParams();
  const { lang } = useLang();
  const v = volunteers.find((x) => x.id === volunteerId);
  if (!v)
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        Volunteer not found
      </div>
    );
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/admin/volunteers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Volunteers
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{v.name}</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${v.active ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}
            >
              {v.active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{v.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`tel:${v.mobile}`}>
              <Phone /> Call
            </a>
          </Button>
          <Button variant="outline">
            <MessageCircle /> WhatsApp
          </Button>
          <Button>
            <Mail /> Email
          </Button>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Volunteer information</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info icon={Phone} label="Mobile" value={v.mobile} />
            <Info icon={UserCheck} label="Role" value={v.role} />
            <Info icon={MapPin} label="District" value={getDistrictName(v.districtId, lang)} />
            <Info
              icon={MapPin}
              label="Constituency"
              value={getConstituencyName(v.constituencyId, lang)}
            />
            <Info
              icon={CalendarDays}
              label="Joined"
              value={new Date(v.joinedAt).toLocaleDateString("en-IN")}
            />
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Work summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric value="18" label="Applicants assisted" />
            <Metric value="7" label="Open follow-ups" />
            <Metric value="12" label="Completed this month" />
            <Metric value="2h" label="Average response" />
          </div>
        </section>
      </div>
    </div>
  );
}
function Info({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}
function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
