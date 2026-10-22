import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LocationCascade, type LocValue } from "@/components/public/LocationCascade";
import { UploadDropzone } from "@/components/public/UploadDropzone";
import type { IssueCategory, Urgency } from "@/data/issues";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/janashabdam/submit")({
  head: () => ({ meta: [{ title: "പ്രശ്നം രേഖപ്പെടുത്തുക · Submit issue" }] }),
  component: SubmitIssue,
});

function SubmitIssue() {
  const { lang, t } = useLang();
  const cats = Object.keys(t.categories) as IssueCategory[];
  const urgencies: Urgency[] = ["low", "medium", "high", "critical"];

  const [step, setStep] = useState<"form" | "done">("form");
  const [token, setToken] = useState("");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [loc, setLoc] = useState<LocValue>({});
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [landmark, setLandmark] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [allowPublic, setAllowPublic] = useState(true);
  const [consent, setConsent] = useState(false);

  const valid = name && mobile.length >= 10 && loc.district && loc.constituency && loc.panchayat && loc.ward && category && title && desc && consent;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      toast.error(lang === "ml" ? "ദയവായി എല്ലാ ഫീൽഡുകളും പൂരിപ്പിക്കുക" : "Please complete required fields");
      return;
    }
    const t = `VK${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setToken(t);
    setStep("done");
    toast.success(lang === "ml" ? "പ്രശ്നം രേഖപ്പെടുത്തി" : "Issue registered");
  }

  if (step === "done") {
    return (
      <PublicLayout>
        <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15 text-secondary">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold">{t.janashabdam.form.successTitle}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.janashabdam.form.successSub}</p>
            <div className="mt-6 rounded-lg bg-muted px-4 py-3">
              <div className="text-xs text-muted-foreground">{t.janashabdam.form.token}</div>
              <div className="mt-1 flex items-center justify-center gap-2 font-mono text-lg font-semibold">
                {token}
                <button
                  onClick={() => { void navigator.clipboard.writeText(token); toast.success(t.common.copied); }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-primary"
                  aria-label="copy"
                ><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild><Link to="/janashabdam/track">{t.janashabdam.trackCta}</Link></Button>
              <Button asChild variant="outline"><Link to="/janashabdam">{t.common.back}</Link></Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="section-underline font-display text-3xl font-bold">{t.janashabdam.submitCta}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t.janashabdam.publicNote}</p>

        <form onSubmit={submit} className="mt-8 space-y-8">
          <FormSection title={t.janashabdam.form.sectionReporter}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={`${t.janashabdam.form.name} *`}><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label={`${t.janashabdam.form.mobile} *`}><Input value={mobile} maxLength={10} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} /></Field>
            </div>
            <label className="mt-3 inline-flex items-center gap-2 text-sm">
              <Checkbox checked={whatsapp} onCheckedChange={(v) => setWhatsapp(Boolean(v))} />
              <span>{t.janashabdam.form.whatsapp}</span>
            </label>
          </FormSection>

          <FormSection title={t.janashabdam.form.sectionLocation}>
            <LocationCascade value={loc} onChange={setLoc} />
          </FormSection>

          <FormSection title={t.janashabdam.form.sectionIssue}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={`${t.janashabdam.form.category} *`}>
                <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory)}>
                  <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
                  <SelectContent>{cats.map((c) => <SelectItem key={c} value={c}>{t.categories[c]}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label={`${t.janashabdam.form.urgency} *`}>
                <RadioGroup value={urgency} onValueChange={(v) => setUrgency(v as Urgency)} className="flex flex-wrap gap-3">
                  {urgencies.map((u) => (
                    <label key={u} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${urgency === u ? "border-primary bg-primary/5 text-primary" : "border-border"}`}>
                      <RadioGroupItem value={u} className="sr-only" />
                      {t.urgency[u]}
                    </label>
                  ))}
                </RadioGroup>
              </Field>
            </div>
            <Field label={`${t.janashabdam.form.issueTitle} *`}><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} /></Field>
            <Field label={`${t.janashabdam.form.description} *`}><Textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
            <Field label={t.janashabdam.form.landmark}><Input value={landmark} onChange={(e) => setLandmark(e.target.value)} /></Field>
            <UploadDropzone />
          </FormSection>

          <FormSection title={t.janashabdam.form.sectionPrivacy}>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={allowPublic} onCheckedChange={(v) => setAllowPublic(Boolean(v))} className="mt-0.5" />
              <span>{t.janashabdam.form.allowPublic}</span>
            </label>
            <label className="mt-3 flex items-start gap-2 text-sm">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} className="mt-0.5" />
              <span>{t.janashabdam.form.consent} <span className="text-destructive">*</span></span>
            </label>
          </FormSection>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" asChild><Link to="/janashabdam">{t.common.cancel}</Link></Button>
            <Button type="submit" disabled={!valid}>{t.janashabdam.form.submitBtn}</Button>
          </div>
        </form>
      </section>
    </PublicLayout>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}