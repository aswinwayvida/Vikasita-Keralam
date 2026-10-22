import { createFileRoute, redirect } from "@tanstack/react-router";
import { FEATURES } from "@/config/features";
import { useMemo, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import {
  issues as ALL_ISSUES, type Issue, type IssueCategory, type IssueStatus,
} from "@/data/issues";
import { districts, getDistrictName, getPanchayatName, getConstituencyName } from "@/data/geo";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/public/StatusBadge";
import { UrgencyDot } from "@/components/public/UrgencyDot";
import { StatusTimeline } from "@/components/public/StatusTimeline";
import { KpiCard } from "@/components/admin/KpiCard";
import { GeneratedTextDialog } from "@/components/admin/GeneratedTextDialog";
import {
  Megaphone, ShieldCheck, AlertTriangle, CheckCircle2, FileSignature,
  MessageCircle, Share2, ListTree, Users, FilePen, History,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { auditLog } from "@/data/volunteers";

export const Route = createFileRoute("/admin/issues")({
  beforeLoad: () => {
    if (!FEATURES.janashabdam) {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({ meta: [{ title: "Janashabdam Issues · Admin" }] }),
  component: AdminIssues,
});

function AdminIssues() {
  const { lang, t } = useLang();
  const [list, setList] = useState<Issue[]>(ALL_ISSUES);
  const [category, setCategory] = useState("all");
  const [district, setDistrict] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Issue | null>(null);

  const filtered = useMemo(() => {
    return list.filter((i) =>
      (category === "all" || i.category === category) &&
      (district === "all" || i.districtId === district) &&
      (status === "all" || i.status === status) &&
      (!q || i.title[lang].toLowerCase().includes(q.toLowerCase()) || i.id.toLowerCase().includes(q.toLowerCase()))
    );
  }, [list, category, district, status, q, lang]);

  const summary = {
    submitted: list.filter((i) => i.status === "submitted").length,
    verification: list.filter((i) => i.status === "verification_pending").length,
    verified: list.filter((i) => i.status === "verified").length,
    escalated: list.filter((i) => i.status === "escalated").length,
    campaign: list.filter((i) => i.status === "public_campaign").length,
    resolved: list.filter((i) => i.status === "resolved" || i.status === "closed").length,
  };

  const cats = Object.keys(t.categories) as IssueCategory[];
  const statuses: IssueStatus[] = ["submitted", "under_review", "verification_pending", "verified", "escalated", "public_campaign", "followup_pending", "resolved", "closed"];
  const catChart = cats.map((c) => ({ name: t.categories[c], value: list.filter((i) => i.category === c).length }));

  function updateIssue(id: string, patch: Partial<Issue>) {
    setList((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setOpen((o) => (o && o.id === id ? { ...o, ...patch } : o));
    toast.success(lang === "ml" ? "സേവ് ചെയ്തു" : "Saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t.admin.citizenService}</p>
        <h1 className="mt-1 font-display text-2xl font-bold">{t.admin.issues}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard icon={Megaphone} label={t.status.submitted} value={summary.submitted} />
        <KpiCard icon={Users} label={t.status.verification_pending} value={summary.verification} tone="warning" />
        <KpiCard icon={ShieldCheck} label={t.status.verified} value={summary.verified} tone="secondary" />
        <KpiCard icon={AlertTriangle} label={t.status.escalated} value={summary.escalated} tone="destructive" />
        <KpiCard icon={Megaphone} label={t.status.public_campaign} value={summary.campaign} tone="primary" />
        <KpiCard icon={CheckCircle2} label={t.status.resolved} value={summary.resolved} tone="secondary" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="section-underline text-sm font-semibold">{lang === "ml" ? "വിഭാഗം അനുസരിച്ച് പ്രശ്നങ്ങൾ" : "Issues by category"}</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <BarChart data={catChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)" interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="grid grid-cols-1 gap-3 border-b border-border p-4 sm:grid-cols-4">
          <Input placeholder={t.common.search} value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder={t.janashabdam.form.category} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              {cats.map((c) => <SelectItem key={c} value={c}>{t.categories[c]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger><SelectValue placeholder={t.janashabdam.form.district} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              {districts.map((d) => <SelectItem key={d.id} value={d.id}>{d[lang]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              {statuses.map((s) => <SelectItem key={s} value={s}>{t.status[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">ID</th>
                <th className="px-4 py-2.5">{lang === "ml" ? "പ്രശ്നം" : "Issue"}</th>
                <th className="px-4 py-2.5">{t.janashabdam.form.category}</th>
                <th className="px-4 py-2.5">{t.janashabdam.form.district}</th>
                <th className="px-4 py-2.5">{t.janashabdam.form.urgency}</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">{lang === "ml" ? "പബ്ലിക് സ്കോർ" : "Public score"}</th>
                <th className="px-4 py-2.5">{lang === "ml" ? "ഡ്യൂപ്ലിക്കേറ്റ്" : "Dup."}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 60).map((i) => (
                <tr key={i.id} onClick={() => setOpen(i)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{i.id}</td>
                  <td className="px-4 py-2.5"><div className="font-medium">{i.title[lang]}</div><div className="text-[11px] text-muted-foreground">{getPanchayatName(i.panchayatId, lang)}</div></td>
                  <td className="px-4 py-2.5 text-xs">{t.categories[i.category]}</td>
                  <td className="px-4 py-2.5 text-xs">{getDistrictName(i.districtId, lang)}</td>
                  <td className="px-4 py-2.5"><UrgencyDot urgency={i.urgency} /></td>
                  <td className="px-4 py-2.5"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">{i.publicInterest}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {i.clusterId ? <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-foreground"><ListTree className="h-3 w-3" /> {i.clusterId}</span> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {lang === "ml" ? "ആദ്യ" : "Showing first"} {Math.min(60, filtered.length)} {lang === "ml" ? "എണ്ണം" : "of"} {filtered.length}
        </div>
      </div>

      <IssueDrawer issue={open} onClose={() => setOpen(null)} onUpdate={updateIssue} />
    </div>
  );
}

function IssueDrawer({ issue, onClose, onUpdate }: { issue: Issue | null; onClose: () => void; onUpdate: (id: string, patch: Partial<Issue>) => void }) {
  const { lang, t } = useLang();
  const [escalation, setEscalation] = useState("");
  const [assignee, setAssignee] = useState("");
  const [genOpen, setGenOpen] = useState<null | { title: string; text: string }>(null);

  if (!issue) return null;

  function makeMemorandum() {
    return `സർട്ടിഫൈഡ് മെമോറാണ്ടം\n\nവിഷയം: ${issue!.title.ml}\nവിഭാഗം: ${t.categories[issue!.category]}\nസ്ഥലം: ${getPanchayatName(issue!.panchayatId, "ml")}, ${getConstituencyName(issue!.constituencyId, "ml")}, ${getDistrictName(issue!.districtId, "ml")}\nടോക്കൺ: ${issue!.token}\n\nബഹുമാനപ്പെട്ട അധികാരികളുടെ ശ്രദ്ധയ്ക്ക്,\n\nഈ പ്രദേശത്ത് നിന്നു ലഭിച്ച പരാതി പ്രകാരം, ${issue!.description.ml} ഈ പ്രശ്നം പരിശോധിക്കണമെന്നും, അടിയന്തിര നടപടി സ്വീകരിക്കണമെന്നും വിനയപൂർവ്വം അഭ്യർത്ഥിക്കുന്നു.\n\nവിശ്വസ്തതയോടെ,\nവികസിത കേരളം — ജനശബ്ദം സെൽ`;
  }
  function makeWhatsApp() {
    return `*ജനശബ്ദം അപ്ഡേറ്റ്*\n\n📍 ${getPanchayatName(issue!.panchayatId, "ml")}\n📝 ${issue!.title.ml}\nഇപ്പോഴത്തെ സ്റ്റാറ്റസ്: ${t.status[issue!.status]}\n\nനിങ്ങളുടെ പ്രദേശത്തെ പ്രശ്നങ്ങൾ ഞങ്ങൾ ഫോളോ ചെയ്യുകയാണ്. കൂടുതൽ വിശദാംശങ്ങൾക്ക് വികസിത കേരളം ജനശബ്ദം പോർട്ടൽ സന്ദർശിക്കുക.\n— വികസിത കേരളം`;
  }
  function makeSocial() {
    return `${t.categories[issue!.category]} | ${getDistrictName(issue!.districtId, "ml")}\n\n"${issue!.title.ml}" — ജനശബ്ദത്തിലൂടെ ലഭിച്ച ഈ പരാതിയിൽ പരിശോധനയും ഫോളോ-അപ്പും തുടരുകയാണ്. പൗരന്മാർക്ക് ഉത്തരവാദിത്വമുള്ള സേവനം ഉറപ്പാക്കാൻ ഞങ്ങൾ പ്രതിജ്ഞാബദ്ധരാണ്.\n\n#വികസിതകേരളം #ജനശബ്ദം`;
  }

  return (
    <Sheet open={!!issue} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-base">#{issue.id} · {issue.title[lang]}</SheetTitle>
          <SheetDescription className="text-xs">
            {getPanchayatName(issue.panchayatId, lang)} · {getDistrictName(issue.districtId, lang)} · {t.categories[issue.category]}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={issue.status} />
          <UrgencyDot urgency={issue.urgency} />
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{lang === "ml" ? "പബ്ലിക് സ്കോർ" : "Public score"} {issue.publicInterest}</span>
          {issue.clusterId && <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-2 py-0.5 text-[11px] font-medium"><ListTree className="h-3 w-3" /> {lang === "ml" ? "3 സമാന പ്രശ്നങ്ങൾ" : "3 similar issues"} · {issue.clusterId}</span>}
        </div>

        <p className="mt-4 text-sm leading-relaxed">{issue.description[lang]}</p>

        {/* Private reporter info (admin only) */}
        <div className="mt-5 rounded-lg border border-border bg-muted/40 p-3 text-xs">
          <div className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> {lang === "ml" ? "സ്വകാര്യ വിവരങ്ങൾ — അഡ്മിൻ മാത്രം" : "Private — admin only"}
          </div>
          <div>{lang === "ml" ? "പേര്" : "Name"}: <span className="font-medium text-foreground">{issue.reporter.name}</span></div>
          <div>{lang === "ml" ? "മൊബൈൽ" : "Mobile"}: <span className="font-medium text-foreground">{issue.reporter.mobile}</span></div>
          <div>WhatsApp: <span className="font-medium text-foreground">{issue.reporter.whatsapp ? t.common.yes : t.common.no}</span></div>
        </div>

        {/* Workflow */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-3">
            <div className="text-xs font-semibold text-primary">{lang === "ml" ? "സ്റ്റാറ്റസ് മാറ്റുക" : "Update status"}</div>
            <Select value={issue.status} onValueChange={(v) => onUpdate(issue.id, { status: v as IssueStatus })}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["submitted", "under_review", "verification_pending", "verified", "escalated", "public_campaign", "followup_pending", "resolved", "closed"] as IssueStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{t.status[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="text-xs font-semibold text-primary">{lang === "ml" ? "വോളണ്ടിയർ അസൈൻ ചെയ്യുക" : "Assign volunteer"}</div>
            <div className="mt-2 flex gap-2">
              <Input placeholder="Arun V." value={assignee} onChange={(e) => setAssignee(e.target.value)} />
              <Button size="sm" onClick={() => { if (assignee) { onUpdate(issue.id, { assignedTo: assignee }); setAssignee(""); } }}>{t.common.save}</Button>
            </div>
            {issue.assignedTo && <div className="mt-2 text-xs text-muted-foreground">{lang === "ml" ? "ഇപ്പോൾ:" : "Current:"} <span className="font-medium text-foreground">{issue.assignedTo}</span></div>}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border p-3">
          <div className="text-xs font-semibold text-primary">{lang === "ml" ? "എസ്കലേഷൻ കുറിപ്പ്" : "Escalation note"}</div>
          <Textarea rows={3} placeholder="…" value={escalation} onChange={(e) => setEscalation(e.target.value)} className="mt-2" />
          <Button size="sm" className="mt-2" onClick={() => { onUpdate(issue.id, { escalationNote: { ml: escalation, en: escalation } }); setEscalation(""); }}>{t.common.save}</Button>
          {issue.escalationNote && <p className="mt-2 text-xs text-muted-foreground">{issue.escalationNote[lang]}</p>}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <div className="text-xs font-semibold text-primary">{lang === "ml" ? "പബ്ലിക് ദൃശ്യപരത" : "Public visibility"}</div>
            <p className="mt-1 text-[11px] text-muted-foreground">{lang === "ml" ? "ഓഫ് ചെയ്‌താൽ പൊതുവിൽ കാണിക്കില്ല." : "Hides issue from public views."}</p>
          </div>
          <Switch checked={issue.publicVisible} onCheckedChange={(v) => onUpdate(issue.id, { publicVisible: v })} />
        </div>

        {/* Generate actions */}
        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">{lang === "ml" ? "ജനറേറ്റ് ചെയ്യുക" : "Generate"}</div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button variant="outline" size="sm" onClick={() => setGenOpen({ title: lang === "ml" ? "മെമോറാണ്ടം" : "Memorandum", text: makeMemorandum() })}><FileSignature className="mr-1.5 h-3.5 w-3.5" /> {lang === "ml" ? "മെമോറാണ്ടം" : "Memorandum"}</Button>
            <Button variant="outline" size="sm" onClick={() => setGenOpen({ title: lang === "ml" ? "WhatsApp അപ്ഡേറ്റ്" : "WhatsApp update", text: makeWhatsApp() })}><MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp</Button>
            <Button variant="outline" size="sm" onClick={() => setGenOpen({ title: lang === "ml" ? "സോഷ്യൽ സംഗ്രഹം" : "Social summary", text: makeSocial() })}><Share2 className="mr-1.5 h-3.5 w-3.5" /> {lang === "ml" ? "സോഷ്യൽ" : "Social"}</Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6">
          <div className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary"><FilePen className="h-3 w-3" /> {lang === "ml" ? "ടൈംലൈൻ" : "Timeline"}</div>
          <StatusTimeline current={issue.status} events={issue.timeline} />
        </div>

        {/* Audit preview */}
        <div className="mt-6">
          <div className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary"><History className="h-3 w-3" /> {lang === "ml" ? "ഓഡിറ്റ് ലോഗ്" : "Audit log"}</div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {auditLog.slice(0, 3).map((a) => (
              <li key={a.id}><span className="text-foreground">{a.who}</span> · {a.action} <span className="text-[10px]">({a.at})</span></li>
            ))}
          </ul>
        </div>

        {genOpen && <GeneratedTextDialog open={!!genOpen} onOpenChange={(o) => !o && setGenOpen(null)} title={genOpen.title} text={genOpen.text} />}
      </SheetContent>
    </Sheet>
  );
}
