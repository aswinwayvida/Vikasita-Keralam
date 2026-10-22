import { createFileRoute, redirect } from "@tanstack/react-router";
import { FEATURES } from "@/config/features";
import { useLang } from "@/i18n/LanguageProvider";
import { issues, type IssueCategory, type Urgency } from "@/data/issues";
import { districts, panchayats } from "@/data/geo";
import { KpiCard } from "@/components/admin/KpiCard";
import { Activity, Clock, TrendingUp, ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/public-pulse")({
  beforeLoad: () => {
    if (!FEATURES.janashabdam) {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({ meta: [{ title: "Public Pulse · Admin" }] }),
  component: PublicPulse,
});

function PublicPulse() {
  const { lang, t } = useLang();
  const cats = Object.keys(t.categories) as IssueCategory[];

  const total = issues.length;
  const resolved = issues.filter((i) => i.status === "resolved" || i.status === "closed").length;
  const verified = issues.filter((i) => ["verified", "escalated", "public_campaign", "followup_pending"].includes(i.status)).length;
  const resolutionRate = Math.round((resolved / total) * 100);

  const heat = districts.map((d) => {
    const row: Record<string, string | number> = { name: d[lang] };
    cats.forEach((c) => {
      row[c] = issues.filter((i) => i.districtId === d.id && i.category === c).length;
    });
    return row;
  });

  const trending = [...issues].sort((a, b) => b.publicInterest - a.publicInterest).slice(0, 5);

  const topPanchayats = panchayats.map((p) => ({
    name: p[lang],
    issues: issues.filter((i) => i.panchayatId === p.id).length,
  })).sort((a, b) => b.issues - a.issues).slice(0, 10);

  const urgencies: Urgency[] = ["low", "medium", "high", "critical"];
  const urgencyData = urgencies.map((u) => ({ name: t.urgency[u], value: issues.filter((i) => i.urgency === u).length }));
  const urgencyColors = ["var(--chart-2)", "var(--chart-1)", "var(--chart-3)", "var(--chart-4)"];

  const weekly = Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    raised: 24 + Math.round(Math.sin(i) * 8) + i * 2,
    resolved: 14 + Math.round(Math.cos(i) * 6) + i,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t.admin.overview}</p>
        <h1 className="mt-1 font-display text-2xl font-bold">{t.admin.publicPulse}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{lang === "ml" ? "സംസ്ഥാന തലത്തിലുള്ള പൗര വികാരത്തിന്റെ ഇൻഡിക്കേറ്റർ." : "Indicator of statewide citizen sentiment."}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={Activity} label={lang === "ml" ? "മൊത്തം പ്രശ്നങ്ങൾ" : "Total issues"} value={total} delta={5} />
        <KpiCard icon={ShieldCheck} label={lang === "ml" ? "സ്ഥിരീകരിച്ചവ" : "Verified"} value={verified} tone="secondary" delta={9} />
        <KpiCard icon={TrendingUp} label={lang === "ml" ? "പരിഹാര നിരക്ക്" : "Resolution rate"} value={`${resolutionRate}%`} tone="secondary" delta={4} />
        <KpiCard icon={Clock} label={lang === "ml" ? "ശരാശരി പരിശോധന" : "Avg time to verify"} value="2.4d" tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 xl:col-span-2">
          <h3 className="section-underline text-sm font-semibold">{lang === "ml" ? "ജില്ല × വിഭാഗം ഹീറ്റ്മാപ്പ്" : "District × category heatmap"}</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1.5 text-left text-[10px] uppercase text-muted-foreground">District</th>
                  {cats.map((c) => <th key={c} className="px-1 py-1.5 text-[10px] uppercase text-muted-foreground" title={t.categories[c]}>{t.categories[c].slice(0, 3)}</th>)}
                </tr>
              </thead>
              <tbody>
                {heat.map((row) => (
                  <tr key={row.name as string} className="border-t border-border">
                    <td className="px-2 py-1.5 font-medium">{row.name as string}</td>
                    {cats.map((c) => {
                      const v = row[c] as number;
                      const intensity = Math.min(1, v / 4);
                      return (
                        <td key={c} className="px-1 py-1.5">
                          <span
                            className="block rounded text-center text-[10px] font-semibold"
                            style={{ background: `color-mix(in oklab, var(--primary) ${intensity * 70}%, transparent)`, color: intensity > 0.5 ? "white" : "var(--foreground)", padding: "4px 6px" }}
                          >{v || ""}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="section-underline text-sm font-semibold">{lang === "ml" ? "ഈ ആഴ്ച ട്രെൻഡിംഗ്" : "Trending this week"}</h3>
          <ul className="mt-4 space-y-3">
            {trending.map((i) => (
              <li key={i.id} className="rounded-lg border border-border p-3">
                <div className="text-sm font-medium">{i.title[lang]}</div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{t.categories[i.category]}</span>
                  <span className="font-semibold text-primary">{i.publicInterest}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 xl:col-span-2">
          <h3 className="section-underline text-sm font-semibold">{lang === "ml" ? "ആഴ്ച തോറും — ഉന്നയിച്ചവ vs പരിഹരിച്ചവ" : "Weekly raised vs resolved"}</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="pp1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pp2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="raised" stroke="var(--chart-1)" fill="url(#pp1)" name={lang === "ml" ? "ഉന്നയിച്ചവ" : "Raised"} />
                <Area type="monotone" dataKey="resolved" stroke="var(--chart-2)" fill="url(#pp2)" name={lang === "ml" ? "പരിഹരിച്ചവ" : "Resolved"} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="section-underline text-sm font-semibold">{lang === "ml" ? "അടിയന്തിര വിതരണം" : "Urgency distribution"}</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={urgencyData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {urgencyData.map((_, i) => <Cell key={i} fill={urgencyColors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="section-underline text-sm font-semibold">{lang === "ml" ? "മികച്ച 10 പഞ്ചായത്തുകൾ — പ്രശ്ന വോളിയം" : "Top 10 panchayats by issue volume"}</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <BarChart data={topPanchayats} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis type="category" dataKey="name" width={130} stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
              <Bar dataKey="issues" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
