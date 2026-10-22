import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Phone, UserCheck, Users } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { volunteers } from "@/data/volunteers";
import { getDistrictName, getConstituencyName } from "@/data/geo";

export const Route = createFileRoute("/admin/volunteers")({
  head: () => ({ meta: [{ title: "Volunteers · Admin" }] }),
  component: VolunteersPage,
});

function VolunteersPage() {
  const { lang } = useLang();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[.12em] text-primary">Volunteers</p>
        <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Volunteers / Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View volunteer coverage, contact details and availability.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat icon={Users} value={volunteers.length} label="Registered volunteers" />
        <Stat icon={UserCheck} value={volunteers.filter((v) => v.active).length} label="Active volunteers" />
        <Stat icon={Phone} value="14" label="Districts covered" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Constituency</th>
                <th className="px-4 py-3">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => navigate({ to: "/admin/volunteers/$volunteerId", params: { volunteerId: v.id } })}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/35"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-[11px] text-muted-foreground">{v.mobile}</p>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize">{v.role}</td>
                  <td className="px-4 py-3 text-xs">{getDistrictName(v.districtId, lang)}</td>
                  <td className="px-4 py-3 text-xs">{getConstituencyName(v.constituencyId, lang)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        v.active ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {v.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: number | string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}