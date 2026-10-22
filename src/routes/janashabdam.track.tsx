import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { issues } from "@/data/issues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/public/StatusBadge";
import { StatusTimeline } from "@/components/public/StatusTimeline";
import { getDistrictName, getPanchayatName, getConstituencyName } from "@/data/geo";
import { toast } from "sonner";
import type { Issue } from "@/data/issues";
import { Search } from "lucide-react";

export const Route = createFileRoute("/janashabdam/track")({
  head: () => ({ meta: [{ title: "ട്രാക്ക് · Track issue" }] }),
  component: TrackIssue,
});

function TrackIssue() {
  const { lang, t } = useLang();
  const [token, setToken] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState<Issue[] | null>(null);

  function byToken() {
    const f = issues.find((i) => i.token.toLowerCase() === token.trim().toLowerCase());
    if (!f) { toast.error(t.janashabdam.track.noMatch); setResult([]); return; }
    setResult([f]);
  }
  function byMobile() {
    if (otp !== "123456") { toast.error(lang === "ml" ? "തെറ്റായ OTP" : "Wrong OTP"); return; }
    const list = issues.filter((i) => i.reporter.mobile === mobile.trim());
    setResult(list);
    if (list.length === 0) toast.error(t.janashabdam.track.noMatch);
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="section-underline font-display text-3xl font-bold">{t.janashabdam.track.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t.janashabdam.track.sub}</p>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <Tabs defaultValue="token">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="token">{t.janashabdam.track.byToken}</TabsTrigger>
              <TabsTrigger value="mobile">{t.janashabdam.track.byMobile}</TabsTrigger>
            </TabsList>
            <TabsContent value="token" className="mt-4 space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs font-medium">{t.janashabdam.form.token}</Label>
                <Input placeholder="VK…" value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} />
              </div>
              <Button onClick={byToken} className="w-full"><Search className="mr-1.5 h-4 w-4" /> {t.janashabdam.track.lookup}</Button>
              <p className="text-xs text-muted-foreground">{lang === "ml" ? "ഉദാഹരണം:" : "Try:"} <code className="rounded bg-muted px-1 py-0.5">{issues[0].token}</code></p>
            </TabsContent>
            <TabsContent value="mobile" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium">{t.janashabdam.form.mobile}</Label>
                  <Input value={mobile} maxLength={10} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium">{t.janashabdam.track.otpMock}</Label>
                  <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder={lang === "ml" ? "6 അക്ക OTP" : "6-digit OTP"} />
                </div>
              </div>
              <Button onClick={byMobile} className="w-full"><Search className="mr-1.5 h-4 w-4" /> {t.janashabdam.track.lookup}</Button>
            </TabsContent>
          </Tabs>
        </div>

        {result && result.length > 0 && (
          <div className="mt-8 space-y-6">
            {result.map((iss) => (
              <article key={iss.id} className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">#{iss.id} · {iss.token}</div>
                    <h3 className="mt-1 text-lg font-semibold">{iss.title[lang]}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{iss.description[lang]}</p>
                  </div>
                  <StatusBadge status={iss.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs sm:grid-cols-4">
                  <Info label={t.janashabdam.form.district} value={getDistrictName(iss.districtId, lang)} />
                  <Info label={t.janashabdam.form.constituency} value={getConstituencyName(iss.constituencyId, lang)} />
                  <Info label={t.janashabdam.form.panchayat} value={getPanchayatName(iss.panchayatId, lang)} />
                  <Info label={t.janashabdam.form.ward} value={iss.ward} />
                </dl>
                {iss.assignedTo && (
                  <p className="mt-3 text-xs text-muted-foreground">{lang === "ml" ? "അസൈൻ ചെയ്തത്:" : "Assigned to:"} <span className="font-medium text-foreground">{iss.assignedTo}</span></p>
                )}
                <div className="mt-6">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">{lang === "ml" ? "സ്റ്റാറ്റസ് ടൈംലൈൻ" : "Status timeline"}</h4>
                  <StatusTimeline current={iss.status} events={iss.timeline} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
