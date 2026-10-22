import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { districts } from "@/data/geo";
import { schemes } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/admin/applications/new")({
  head: () => ({ meta: [{ title: "New Application · Admin" }] }),
  component: NewApplicationPage,
});

function NewApplicationPage() {
  const { lang } = useLang();
  const [saved, setSaved] = useState(false);
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div><Link to="/admin/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Applications</Link><p className="mt-3 text-xs font-semibold uppercase tracking-[.12em] text-primary">Backend entry</p><h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">New Application</h1><p className="mt-1 text-sm text-muted-foreground">Enter an application received through a helpdesk, phone call or paper form.</p></div>
      {saved && <div className="flex items-center gap-2 rounded-xl border border-secondary/25 bg-secondary/[.08] p-4 text-sm font-semibold text-secondary"><Check className="h-4 w-4" /> Draft application saved.</div>}
      <form onSubmit={(event) => { event.preventDefault(); setSaved(true); }} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Applicant name"><Input required className="h-11 rounded-xl" /></Field>
          <Field label="Mobile number"><Input required inputMode="numeric" maxLength={10} className="h-11 rounded-xl" /></Field>
          <Field label="Email (optional)"><Input type="email" className="h-11 rounded-xl" /></Field>
          <Field label="District"><select required className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="">Select district</option>{districts.map((district) => <option key={district.id} value={district.id}>{district[lang]}</option>)}</select></Field>
          <Field label="Scheme"><select required className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="">Select scheme</option>{schemes.map((scheme) => <option key={scheme.id} value={scheme.id}>{scheme[lang]}</option>)}</select></Field>
          <Field label="Received through"><select required className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"><option>Helpdesk</option><option>Phone</option><option>Paper form</option><option>Volunteer</option></select></Field>
        </div>
        <Field label="Internal notes"><textarea className="mt-4 min-h-28 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary" /></Field>
        <div className="mt-5 flex justify-end gap-2"><Button asChild variant="outline"><Link to="/admin/applications">Cancel</Link></Button><Button type="submit"><Save /> Save application</Button></div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }