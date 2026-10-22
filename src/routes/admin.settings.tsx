import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { auditLog } from "@/data/volunteers";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Admin" }] }),
  component: SettingsPage,
});

const roles = ["Administrator", "District coordinator", "Constituency team member", "Panchayat Volunteer"];
const perms = ["View requests", "Check requests", "Send to senior team", "Create report", "Send messages", "Manage users"];
const matrix: Record<string, boolean[]> = {
  "Administrator": [true, true, true, true, true, true],
  "District coordinator": [true, true, true, true, true, false],
  "Constituency team member": [true, true, true, false, false, false],
  "Panchayat Volunteer": [true, true, false, false, false, false],
};

function SettingsPage() {
  const { lang, t } = useLang();
  return (
    <div className="space-y-6">
      <h1 className="section-underline font-display text-2xl font-bold">{t.admin.settings}</h1>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4 text-sm font-semibold">{lang === "ml" ? "ആർക്കെന്ത് ചെയ്യാം" : "Who can do what"}</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5">Role</th>
              {perms.map((p) => <th key={p} className="px-3 py-2.5 text-center">{p}</th>)}
            </tr>
          </thead>
          <tbody>{roles.map((r) => (
            <tr key={r} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 font-medium">{r}</td>
              {matrix[r].map((v, i) => (
                <td key={i} className="px-3 py-2.5 text-center">{v ? <Check className="mx-auto h-4 w-4 text-secondary" /> : <X className="mx-auto h-4 w-4 text-muted-foreground/40" />}</td>
              ))}
            </tr>))}</tbody>
        </table>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="section-underline text-sm font-semibold">{lang === "ml" ? "സമീപകാല പ്രവർത്തനങ്ങൾ" : "Recent activity"}</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {auditLog.map((a) => (
            <li key={a.id} className="flex justify-between border-b border-border pb-2 last:border-0"><span><span className="font-medium">{a.who}</span> · {a.action}</span><span className="text-xs text-muted-foreground">{a.at}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}