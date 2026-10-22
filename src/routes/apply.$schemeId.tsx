import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, FileCheck2, FileUp, Sparkles, Trash2 } from "lucide-react";

import { PublicLayout } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { districts } from "@/data/geo";
import { helpdeskLocations } from "@/data/helpdesk-locations";
import { getSchemeGuide } from "@/data/scheme-guides";
import { schemes } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";
import { EMAIL_NOT_PROVIDED, loadEligibilityProfile, updateEligibilityProfile } from "@/lib/citizen-profile";
import { saveHelpdeskRequest, type HelpdeskRequest } from "@/lib/helpdesk-requests";

export const Route = createFileRoute("/apply/$schemeId")({
  head: () => ({
    meta: [{ title: "Application assistance · Vikasita Keralam" }],
  }),
  component: GuidedApplication,
});

type Draft = {
  name: string;
  mobile: string;
  email: string;
  district: string;
  helpdeskId: string;
  age: string;
  income: string;
  occupation: string;
  notes: string;
};

const initialDraft: Draft = {
  name: "",
  mobile: "",
  email: "",
  district: "",
  helpdeskId: "",
  age: "",
  income: "",
  occupation: "",
  notes: "",
};

const incomeOptions = [
  "under1",
  "oneToTwoFive",
  "twoFiveToFive",
  "fiveToEight",
  "aboveEight",
  "unknown",
];
const occupationOptions = [
  "farmer",
  "student",
  "employee",
  "unorganised",
  "selfEmployed",
  "unemployed",
  "homemaker",
  "retired",
];

const INTERNAL_TEST_OTP = "123456";

function GuidedApplication() {
  const { schemeId } = Route.useParams();
  const { lang } = useLang();
  const scheme = schemes.find((item) => item.id === schemeId);
  const guide = scheme ? getSchemeGuide(scheme) : null;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, File>>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState("");
  const [submittedHelpdesk, setSubmittedHelpdesk] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const text = useMemo(() => createCopy(lang), [lang]);
  const districtName = districts.find((item) => item.id === draft.district)?.en;
  const availableHelpdesks = helpdeskLocations.filter((item) => item.district === districtName);
  const selectedHelpdesk = availableHelpdesks.find((item) => item.id === draft.helpdeskId);
  const uploadDocuments = guide?.documents.filter((item) => item.uploadable !== false) ?? [];
  const informationItems = guide?.documents.filter((item) => item.uploadable === false) ?? [];

  useEffect(() => {
    const profile = loadEligibilityProfile();
    const email = profile.email && profile.email !== EMAIL_NOT_PROVIDED ? profile.email : "";
    setDraft((current) => ({ ...current, name: profile.fullName || current.name, mobile: profile.mobile || current.mobile, email: email || current.email }));
    if (profile.mobile) setMobileVerified(true);
    if (email) setEmailVerified(true);
  }, []);
  const totalSteps = 4;
  const progress = reference ? 100 : ((step + 1) / totalSteps) * 100;

  if (!scheme || !guide) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">{text.notFound}</h1>
          <Button asChild className="mt-6">
            <Link to="/schemes">{text.allSchemes}</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  function updateDraft<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value, ...(field === "district" ? { helpdeskId: "" } : {}) }));
    setErrors((current) => ({ ...current, [field]: "" }));
    if (field === "mobile") {
      setOtpSent(false);
      setOtp("");
      setMobileVerified(false);
      setErrors((current) => ({ ...current, otp: "" }));
    }
    if (field === "email") {
      setEmailOtpSent(false);
      setEmailOtp("");
      setEmailVerified(false);
      setErrors((current) => ({ ...current, emailOtp: "" }));
    }
  }

  function sendOtp() {
    if (!/^\d{10}$/.test(draft.mobile)) {
      setErrors((current) => ({ ...current, mobile: text.errors.mobile }));
      return;
    }
    setOtp("");
    setOtpSent(true);
    setMobileVerified(false);
    setErrors((current) => ({ ...current, mobile: "", otp: "" }));
  }

  function verifyOtp() {
    if (otp === INTERNAL_TEST_OTP) {
      setMobileVerified(true);
      updateEligibilityProfile({ fullName: draft.name.trim(), mobile: draft.mobile });
      setErrors((current) => ({ ...current, otp: "" }));
      return;
    }
    setMobileVerified(false);
    setErrors((current) => ({ ...current, otp: text.errors.otp }));
  }

  function sendEmailOtp() {
    const email = draft.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((current) => ({ ...current, email: text.errors.email }));
      return;
    }
    setDraft((current) => ({ ...current, email }));
    setEmailOtp("");
    setEmailOtpSent(true);
    setEmailVerified(false);
    setErrors((current) => ({ ...current, email: "", emailOtp: "" }));
  }

  function verifyEmailOtp() {
    if (emailOtp === INTERNAL_TEST_OTP) {
      setEmailVerified(true);
      updateEligibilityProfile({ fullName: draft.name.trim(), mobile: draft.mobile, email: draft.email });
      setErrors((current) => ({ ...current, emailOtp: "" }));
      return;
    }
    setEmailVerified(false);
    setErrors((current) => ({ ...current, emailOtp: text.errors.otp }));
  }

  function validateCurrentStep() {
    const nextErrors: Record<string, string> = {};
    if (step === 0) {
      if (draft.name.trim().length < 2) nextErrors.name = text.errors.name;
      if (!/^\d{10}$/.test(draft.mobile)) nextErrors.mobile = text.errors.mobile;
      else if (!mobileVerified) nextErrors.otp = text.errors.otpRequired;
      if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) nextErrors.email = text.errors.email;
      else if (draft.email && !emailVerified) nextErrors.emailOtp = text.errors.emailOtpRequired;
      if (!draft.district) nextErrors.district = text.errors.required;
      else if (!draft.helpdeskId) nextErrors.helpdeskId = text.errors.helpdesk;
    }
    if (step === 1) {
      const age = Number(draft.age);
      if (!draft.age || age < 1 || age > 120) nextErrors.age = text.errors.age;
      if (!draft.income) nextErrors.income = text.errors.required;
      if (!draft.occupation) nextErrors.occupation = text.errors.required;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, totalSteps - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitApplication() {
    if (!scheme || !guide) return;
    if (!consent) {
      setErrors({ consent: text.errors.consent });
      return;
    }
    const generated = `VK-HELP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    if (!selectedHelpdesk) {
      setErrors({ helpdeskId: text.errors.helpdesk });
      setStep(0);
      return;
    }
    const record: HelpdeskRequest = {
      reference: generated,
      applicant: draft.name.trim(),
      schemeId: scheme.id,
      district: draft.district,
      helpdeskId: selectedHelpdesk.id,
      helpdeskName: selectedHelpdesk.name,
      mobile: `******${draft.mobile.slice(-4)}`,
      email: draft.email ? `${draft.email.slice(0, 2)}***@${draft.email.split("@")[1]}` : undefined,
      documents: uploadDocuments.flatMap((document) => {
        const file = selectedDocuments[document.en];
        return file ? [{ label: document.en, fileName: file.name, fileSize: file.size, fileType: file.type }] : [];
      }),
      missingDocuments: uploadDocuments.filter((document) => !selectedDocuments[document.en]).map((document) => document.en),
      status: "helpdesk_request_created",
      createdAt: new Date().toISOString(),
    };
    if (!saveHelpdeskRequest(record)) {
      setErrors({ submit: text.errors.storage });
      return;
    }
    setSubmittedHelpdesk(selectedHelpdesk.name);
    setReference(generated);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (reference) {
    return (
      <PublicLayout>
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="overflow-hidden rounded-[2rem] border border-green/25 bg-card shadow-[0_24px_70px_-45px_rgba(10,42,102,0.65)]">
            <div className="bg-gradient-to-r from-green-soft via-white to-saffron-soft px-5 py-8 text-center sm:px-10 sm:py-12">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green text-white shadow-lg">
                <Check className="h-8 w-8" />
              </div>
              <div className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-green">
                {text.successEyebrow}
              </div>
              <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{text.successTitle}</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {text.successText}
              </p>
            </div>
            <div className="px-5 py-7 sm:px-10 sm:py-9">
              <div className="rounded-2xl border border-dashed border-primary/45 bg-saffron-soft/40 p-5 text-center">
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {text.reference}
                </div>
                <div className="mt-2 font-mono text-xl font-extrabold tracking-wide text-navy sm:text-2xl">
                  {reference}
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2 rounded-xl border border-border bg-background p-4 text-center text-sm">
                  {text.routedTo} <strong>{submittedHelpdesk}</strong>.
                </div>
                <Button asChild size="lg" className="h-12 rounded-xl">
                  <Link to="/helpdesk">{text.findHelpdesk}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl">
                  <Link to="/schemes/$id" params={{ id: scheme.id }}>
                    {text.schemeDetails}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="border-b border-border bg-gradient-to-r from-saffron-soft/40 via-background to-green-soft/25">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Link
                to="/schemes/$id"
                params={{ id: scheme.id }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {text.back}
              </Link>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  {text.eyebrow}
                </span>
                <h1 className="text-xl font-extrabold leading-tight sm:text-2xl">{scheme[lang]}</h1>
              </div>
            </div>
            <p className="max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
              {text.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <main className="min-w-0">
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                    {text.step} {step + 1} / {totalSteps}
                  </div>
                  <h2 className="mt-1 text-xl font-bold sm:text-2xl">{text.stepTitles[step]}</h2>
                </div>
                <span className="hidden rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground sm:inline">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="mt-3" />

              <div className="mt-4">
                {step === 0 && (
                  <ContactStep
                    draft={draft}
                    errors={errors}
                    lang={lang}
                    text={text}
                    update={updateDraft}
                    otpSent={otpSent}
                    otp={otp}
                    mobileVerified={mobileVerified}
                    setOtp={setOtp}
                    sendOtp={sendOtp}
                    verifyOtp={verifyOtp}
                    emailOtpSent={emailOtpSent}
                    emailOtp={emailOtp}
                    emailVerified={emailVerified}
                    setEmailOtp={setEmailOtp}
                    sendEmailOtp={sendEmailOtp}
                    verifyEmailOtp={verifyEmailOtp}
                    availableHelpdesks={availableHelpdesks}
                  />
                )}
                {step === 1 && (
                  <ProfileStep
                    draft={draft}
                    errors={errors}
                    lang={lang}
                    text={text}
                    update={updateDraft}
                  />
                )}
                {step === 2 && (
                  <DocumentsStep
                    documents={uploadDocuments}
                    informationItems={informationItems}
                    selected={selectedDocuments}
                    lang={lang}
                    text={text}
                    setSelected={setSelectedDocuments}
                  />
                )}
                {step === 3 && (
                  <ReviewStep
                    schemeName={scheme[lang]}
                    draft={draft}
                    districtName={
                      districts.find((item) => item.id === draft.district)?.[lang] ?? draft.district
                    }
                    readyCount={Object.keys(selectedDocuments).length}
                    totalDocuments={uploadDocuments.length}
                    helpdeskName={selectedHelpdesk?.name ?? ""}
                    documents={uploadDocuments.map((document) => ({ label: document[lang], file: selectedDocuments[document.en] }))}
                    consent={consent}
                    setConsent={setConsent}
                    error={errors.consent}
                    lang={lang}
                    text={text}
                  />
                )}
              </div>
              {errors.submit && <p role="alert" className="mt-3 text-sm font-semibold text-destructive">{errors.submit}</p>}

              <div className="mt-5 flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl"
                  disabled={step === 0}
                  onClick={() => setStep((current) => current - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> {text.previous}
                </Button>
                {step < totalSteps - 1 ? (
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 rounded-xl px-7"
                    onClick={nextStep}
                  >
                    {text.continue} <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 rounded-xl px-7"
                    onClick={submitApplication}
                  >
                    {text.createRequest} <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
      </section>
    </PublicLayout>
  );
}

type Copy = ReturnType<typeof createCopy>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      {children}
      {error && (
        <span className="mt-1.5 block text-xs font-semibold text-destructive">{error}</span>
      )}
    </label>
  );
}

function ContactStep({
  draft,
  errors,
  lang,
  text,
  update,
  otpSent,
  otp,
  mobileVerified,
  setOtp,
  sendOtp,
  verifyOtp,
  emailOtpSent,
  emailOtp,
  emailVerified,
  setEmailOtp,
  sendEmailOtp,
  verifyEmailOtp,
  availableHelpdesks,
}: {
  draft: Draft;
  errors: Record<string, string>;
  lang: "ml" | "en";
  text: Copy;
  update: <K extends keyof Draft>(field: K, value: Draft[K]) => void;
  otpSent: boolean;
  otp: string;
  mobileVerified: boolean;
  setOtp: (value: string) => void;
  sendOtp: () => void;
  verifyOtp: () => void;
  emailOtpSent: boolean;
  emailOtp: string;
  emailVerified: boolean;
  setEmailOtp: (value: string) => void;
  sendEmailOtp: () => void;
  verifyEmailOtp: () => void;
  availableHelpdesks: typeof helpdeskLocations;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label={text.name} error={errors.name}>
        <Input
          className="h-11 rounded-xl bg-background"
          value={draft.name}
          onChange={(event) => update("name", event.target.value)}
          autoComplete="name"
        />
      </Field>
      <Field label={text.mobile} error={errors.mobile}>
        <div className="flex gap-2">
          <Input
            className="h-11 min-w-0 rounded-xl bg-background"
            value={draft.mobile}
            onChange={(event) =>
              update("mobile", event.target.value.replace(/\D/g, "").slice(0, 10))
            }
            inputMode="numeric"
            autoComplete="tel"
            placeholder={text.mobilePlaceholder}
          />
          <Button
            type="button"
            variant={mobileVerified ? "secondary" : "outline"}
            className="h-11 shrink-0 rounded-xl px-3 text-xs"
            onClick={sendOtp}
            disabled={mobileVerified}
          >
            {mobileVerified ? (
              <>
                <Check className="h-4 w-4 text-green" />
                {text.verified}
              </>
            ) : otpSent ? (
              text.resendOtp
            ) : (
              text.sendOtp
            )}
          </Button>
        </div>
      </Field>
      <Field label={text.email} error={errors.email || errors.emailOtp}>
        <div className="flex gap-2">
          <Input type="email" className="h-11 min-w-0 rounded-xl bg-background" value={draft.email} onChange={(event) => update("email", event.target.value.slice(0, 120))} autoComplete="email" placeholder={text.emailPlaceholder} />
          {draft.email && <Button type="button" variant={emailVerified ? "secondary" : "outline"} className="h-11 shrink-0 rounded-xl px-3 text-xs" onClick={sendEmailOtp} disabled={emailVerified}>{emailVerified ? <><Check className="h-4 w-4 text-green" />{text.verified}</> : emailOtpSent ? text.resendOtp : text.sendOtp}</Button>}
        </div>
      </Field>
      {otpSent && !mobileVerified && (
        <div className="sm:col-span-2 rounded-2xl border border-primary/20 bg-saffron-soft/25 p-3">
          <Field label={text.otp} error={errors.otp}>
            <div className="flex max-w-md gap-2">
              <Input
                className="h-11 rounded-xl bg-background tracking-[0.3em]"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={text.otpPlaceholder}
                onKeyDown={(event) => {
                  if (event.key === "Enter") verifyOtp();
                }}
              />
              <Button type="button" className="h-11 shrink-0 rounded-xl px-5" onClick={verifyOtp}>
                {text.verifyOtp}
              </Button>
            </div>
          </Field>
        </div>
      )}
      {emailOtpSent && !emailVerified && (
        <div className="sm:col-span-2 rounded-2xl border border-primary/20 bg-saffron-soft/25 p-3">
          <Field label={text.emailOtp} error={errors.emailOtp}>
            <div className="flex max-w-md gap-2">
              <Input className="h-11 rounded-xl bg-background tracking-[0.3em]" value={emailOtp} onChange={(event) => setEmailOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder={text.otpPlaceholder} onKeyDown={(event) => { if (event.key === "Enter") verifyEmailOtp(); }} />
              <Button type="button" className="h-11 shrink-0 rounded-xl px-5" onClick={verifyEmailOtp}>{text.verifyOtp}</Button>
            </div>
          </Field>
        </div>
      )}
      <Field label={text.district} error={errors.district}>
        <select
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          value={draft.district}
          onChange={(event) => update("district", event.target.value)}
        >
          <option value="">{text.select}</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district[lang]}
            </option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2 lg:col-span-2">
        <Field label={text.helpdesk} error={errors.helpdeskId}>
          <select
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
            value={draft.helpdeskId}
            onChange={(event) => update("helpdeskId", event.target.value)}
            disabled={!draft.district}
          >
            <option value="">{draft.district ? text.chooseHelpdesk : text.chooseDistrictFirst}</option>
            {availableHelpdesks.map((helpdesk) => (
              <option key={helpdesk.id} value={helpdesk.id}>{helpdesk.name} — {helpdesk.address}</option>
            ))}
          </select>
        </Field>
        <p className="mt-1 text-xs text-muted-foreground">{text.helpdeskHint}</p>
      </div>
    </div>
  );
}

function ProfileStep({
  draft,
  errors,
  lang,
  text,
  update,
}: {
  draft: Draft;
  errors: Record<string, string>;
  lang: "ml" | "en";
  text: Copy;
  update: <K extends keyof Draft>(field: K, value: Draft[K]) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={text.age} error={errors.age}>
        <Input
          className="h-12 rounded-xl bg-background"
          value={draft.age}
          onChange={(event) => update("age", event.target.value.replace(/\D/g, "").slice(0, 3))}
          inputMode="numeric"
        />
      </Field>
      <Field label={text.income} error={errors.income}>
        <select
          className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          value={draft.income}
          onChange={(event) => update("income", event.target.value)}
        >
          <option value="">{text.select}</option>
          {incomeOptions.map((value) => (
            <option key={value} value={value}>
              {text.incomeLabels[value]}
            </option>
          ))}
        </select>
      </Field>
      <Field label={text.occupation} error={errors.occupation}>
        <select
          className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          value={draft.occupation}
          onChange={(event) => update("occupation", event.target.value)}
        >
          <option value="">{text.select}</option>
          {occupationOptions.map((value) => (
            <option key={value} value={value}>
              {text.occupationLabels[value]}
            </option>
          ))}
        </select>
      </Field>
      <Field label={text.notes}>
        <Textarea
          className="min-h-24 rounded-xl bg-background"
          value={draft.notes}
          onChange={(event) => update("notes", event.target.value.slice(0, 300))}
          placeholder={text.notesHint}
        />
      </Field>
      <div className="sm:col-span-2 rounded-2xl border border-green/20 bg-green-soft/40 p-4 text-xs leading-5">
        <Sparkles className="mr-2 inline h-4 w-4 text-green" />
        {text.profileHint}
      </div>
    </div>
  );
}

function DocumentsStep({
  documents,
  informationItems,
  selected,
  lang,
  text,
  setSelected,
}: {
  documents: ReturnType<typeof getSchemeGuide>["documents"];
  informationItems: ReturnType<typeof getSchemeGuide>["documents"];
  selected: Record<string, File>;
  lang: "ml" | "en";
  text: Copy;
  setSelected: React.Dispatch<React.SetStateAction<Record<string, File>>>;
}) {
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  function selectFile(label: string, file?: File) {
    if (!file) return;
    const validType = ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
    if (!validType || file.size > 5 * 1024 * 1024 || file.size === 0) {
      setFileErrors((current) => ({ ...current, [label]: text.errors.file }));
      return;
    }
    setSelected((current) => ({ ...current, [label]: file }));
    setFileErrors((current) => ({ ...current, [label]: "" }));
  }

  function viewFile(file: File) {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <div>
      <p className="text-sm leading-6 text-muted-foreground">{text.documentsIntro}</p>
      <div className="mt-5 space-y-3">
        {documents.map((document) => {
          const file = selected[document.en];
          return (
            <div key={document.en} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{document[lang]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB` : text.missingDocument}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {file && (
                    <>
                      <Button type="button" variant="outline" size="sm" onClick={() => viewFile(file)}>{text.viewFile}</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setSelected((current) => { const next = { ...current }; delete next[document.en]; return next; })} aria-label={`${text.removeFile}: ${document[lang]}`}><Trash2 className="h-4 w-4" /> {text.removeFile}</Button>
                    </>
                  )}
                  <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-primary/30 bg-saffron-soft/35 px-3 text-xs font-semibold text-primary hover:bg-saffron-soft">
                    <FileUp className="h-4 w-4" /> {file ? text.replaceFile : text.chooseFile}
                    <input
                      className="sr-only"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={(event) => { selectFile(document.en, event.target.files?.[0]); event.target.value = ""; }}
                    />
                  </label>
                </div>
              </div>
              {fileErrors[document.en] && <p role="alert" className="mt-2 text-xs font-semibold text-destructive">{fileErrors[document.en]}</p>}
            </div>
          );
        })}
      </div>
      {informationItems.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-muted/35 p-4">
          <h3 className="text-sm font-bold">{text.informationForHelpdesk}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {informationItems.map((item) => <li key={item.en}>{item[lang]}</li>)}
          </ul>
        </div>
      )}
      <div className="mt-5 rounded-2xl border border-primary/20 bg-saffron-soft/45 p-4 text-xs leading-5">
        <FileCheck2 className="mr-2 inline h-4 w-4 text-primary" />
        {text.uploadNotice}
      </div>
    </div>
  );
}

function ReviewStep({
  schemeName,
  draft,
  districtName,
  readyCount,
  totalDocuments,
  helpdeskName,
  documents,
  consent,
  setConsent,
  error,
  text,
}: {
  schemeName: string;
  draft: Draft;
  districtName: string;
  readyCount: number;
  totalDocuments: number;
  helpdeskName: string;
  documents: Array<{ label: string; file?: File }>;
  consent: boolean;
  setConsent: (value: boolean) => void;
  error?: string;
  lang: "ml" | "en";
  text: Copy;
}) {
  const rows = [
    [text.scheme, schemeName],
    [text.name, draft.name],
    [text.mobile, `******${draft.mobile.slice(-4)}`],
    ...(draft.email ? [[text.email, draft.email]] : []),
    [text.district, districtName],
    [text.age, draft.age],
    [text.income, text.incomeLabels[draft.income]],
    [text.occupation, text.occupationLabels[draft.occupation]],
    [text.documentReadiness, `${readyCount} / ${totalDocuments}`],
    [text.helpdesk, helpdeskName],
  ];
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-muted/55 p-4">
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
            <div className="mt-1 text-sm font-bold">{value || text.notProvided}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-border p-4">
        <h3 className="text-sm font-bold">{text.documentsToReview}</h3>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {documents.map((document) => (
            <li key={document.label}>{document.label}: {document.file?.name ?? text.missingDocument}</li>
          ))}
        </ul>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-primary/25 bg-saffron-soft/35 p-4">
        <Checkbox
          className="mt-0.5 h-5 w-5"
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
        />
        <span className="text-sm leading-6">{text.consent}</span>
      </label>
      {error && <p className="mt-2 text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}

function createCopy(lang: "ml" | "en") {
  if (lang === "ml")
    return {
      notFound: "പദ്ധതി കണ്ടെത്താനായില്ല",
      allSchemes: "എല്ലാ പദ്ധതികളും",
      back: "പദ്ധതി വിശദാംശങ്ങൾ",
      eyebrow: "അപേക്ഷാ സഹായം",
      intro: "അപേക്ഷാ വിവരങ്ങൾ ഘട്ടംഘട്ടമായി നൽകി പ്രക്രിയ ലളിതമായി പൂർത്തിയാക്കാം.",
      step: "ഘട്ടം",
      stepTitles: [
        "ബന്ധപ്പെടാനുള്ള വിവരം",
        "പ്രാഥമിക അപേക്ഷാ വിവരങ്ങൾ",
        "രേഖകൾ ചേർക്കുക",
        "പരിശോധിച്ച് അഭ്യർത്ഥന സൃഷ്ടിക്കുക",
      ],
      stepSpeech: [
        "നമസ്കാരം. ആദ്യം നിങ്ങളെ ബന്ധപ്പെടാനുള്ള അടിസ്ഥാന വിവരങ്ങൾ നൽകി മൊബൈൽ നമ്പർ സ്ഥിരീകരിക്കൂ.",
        "ഇപ്പോൾ പദ്ധതിയുമായി ബന്ധപ്പെട്ട പ്രാഥമിക വിവരങ്ങൾ തിരഞ്ഞെടുക്കാം.",
        "ഈ പദ്ധതിക്ക് ആവശ്യമായ രേഖകൾ തിരഞ്ഞെടുക്കൂ. ലഭ്യമല്ലാത്തവ ഹെൽപ്പ്ഡെസ്കിന് അറിയിക്കാം.",
        "വിവരങ്ങൾ ഒന്നു പരിശോധിച്ച് അപേക്ഷാ സഹായ അഭ്യർത്ഥന സമർപ്പിക്കൂ.",
      ],
      voiceOn: "വോയ്സ് മാർഗനിർദ്ദേശം ഓൺ",
      voiceOff: "വോയ്സ് മാർഗനിർദ്ദേശം ഓഫ്",
      hearAgain: "വീണ്ടും കേൾക്കുക",
      needHelp: "നേരിട്ടുള്ള സഹായം വേണോ?",
      needHelpText: "അടുത്തുള്ള വികസിത കേരളം ഹെൽപ്പ്ഡെസ്ക് കണ്ടെത്താം.",
      findHelpdesk: "ഹെൽപ്പ്ഡെസ്ക് കണ്ടെത്തുക",
      previous: "പിന്നിലേക്ക്",
      continue: "തുടരുക",
      createRequest: "സഹായ അഭ്യർത്ഥന സൃഷ്ടിക്കുക",
      name: "പേര്",
      mobile: "മൊബൈൽ നമ്പർ",
      mobilePlaceholder: "10 അക്ക നമ്പർ",
      email: "ഇമെയിൽ (ഐച്ഛികം)",
      emailPlaceholder: "ഇമെയിൽ വിലാസം",
      emailOtp: "ഇമെയിലിൽ ലഭിച്ച OTP",
      sendOtp: "OTP അയയ്ക്കുക",
      resendOtp: "വീണ്ടും അയയ്ക്കുക",
      otp: "മൊബൈലിൽ ലഭിച്ച OTP",
      otpPlaceholder: "6 അക്ക OTP",
      verifyOtp: "സ്ഥിരീകരിക്കുക",
      verified: "സ്ഥിരീകരിച്ചു",
      district: "ജില്ല",
      select: "തിരഞ്ഞെടുക്കുക",
      helpdesk: "ഹെൽപ്പ്ഡെസ്ക്",
      chooseHelpdesk: "നിങ്ങളുടെ ഹെൽപ്പ്ഡെസ്ക് തിരഞ്ഞെടുക്കുക",
      chooseDistrictFirst: "ആദ്യം ജില്ല തിരഞ്ഞെടുക്കുക",
      helpdeskHint: "ഈ ഹെൽപ്പ്ഡെസ്കിന്റെ അവലോകന പട്ടികയിലേക്കാണ് അഭ്യർത്ഥന പോകുന്നത്.",

      age: "പ്രായം",
      income: "കുടുംബ വാർഷിക വരുമാനം",
      occupation: "തൊഴിൽ / നിലവിലെ സ്ഥിതി",
      notes: "എന്ത് സഹായമാണ് വേണ്ടത്? (ഐച്ഛികം)",
      notesHint: "ഉദാ: രേഖകൾ തയ്യാറാക്കാൻ സഹായം",
      profileHint:
        "ഈ വിവരങ്ങൾ അടുത്ത സഹായ ഘട്ടം ലളിതമാക്കാൻ ഉപയോഗിക്കും. അന്തിമ യോഗ്യത ഔദ്യോഗിക അതോറിറ്റി സ്ഥിരീകരിക്കും.",
      documentsIntro:
        "പദ്ധതിക്ക് ആവശ്യമായ ഓരോ രേഖയും PDF, JPG അല്ലെങ്കിൽ PNG ആയി ചേർക്കൂ. ലഭ്യമല്ലാത്ത രേഖകളോടെ അഭ്യർത്ഥന സമർപ്പിക്കാം; ഹെൽപ്പ്ഡെസ്ക് പിന്നീട് സഹായിക്കും.",
      ready: "തയ്യാറാണ്",
      chooseFile: "രേഖ തിരഞ്ഞെടുക്കുക",
      replaceFile: "മാറ്റുക",
      removeFile: "നീക്കുക",
      viewFile: "കാണുക",
      missingDocument: "രേഖ ചേർത്തിട്ടില്ല",
      documentsToReview: "രേഖകളുടെ നില",
      informationForHelpdesk: "ഹെൽപ്പ്ഡെസ്ക് പരിശോധിക്കേണ്ട മറ്റ് വിവരങ്ങൾ",
      uploadNotice: "PDF, JPG അല്ലെങ്കിൽ PNG ഫയലുകൾ ചേർക്കാം. ഓരോ ഫയലും 5 MB-ൽ താഴെയായിരിക്കണം. ലഭ്യമല്ലാത്ത രേഖകൾ ഹെൽപ്പ്ഡെസ്കിന്റെ തുടർനടപടിക്കായി അടയാളപ്പെടുത്തും.",
      noUploads:
        "അടുത്ത ഘട്ടത്തിൽ ആവശ്യമായ രേഖകൾ തയ്യാറാക്കാനും സമർപ്പിക്കാനും അപേക്ഷാ സഹായം ലഭിക്കും.",
      scheme: "പദ്ധതി",
      documentReadiness: "തയ്യാറായ രേഖകൾ",
      notProvided: "നൽകിയിട്ടില്ല",
      consent:
        "നൽകിയ വിവരങ്ങൾ ശരിയാണെന്ന് ഞാൻ സ്ഥിരീകരിക്കുന്നു. തിരഞ്ഞെടുത്ത ഹെൽപ്പ്ഡെസ്ക് എന്റെ വിവരങ്ങളും രേഖകളും പരിശോധിച്ച് ബന്ധപ്പെട്ട ഔദ്യോഗിക പോർട്ടലിൽ അപേക്ഷിക്കാൻ സഹായിക്കുന്നതിന് ഞാൻ സമ്മതിക്കുന്നു. ഔദ്യോഗിക അപേക്ഷ സമർപ്പിച്ചതായി ഈ അഭ്യർത്ഥന അർത്ഥമാക്കുന്നില്ല.",
      successEyebrow: "സഹായ അഭ്യർത്ഥന സൃഷ്ടിച്ചു",
      successTitle: "അടുത്ത ഘട്ടത്തിന് തയ്യാറാണ്",
      successText: "നിങ്ങളുടെ സഹായ അഭ്യർത്ഥനയുടെ റഫറൻസ് സൂക്ഷിക്കുക. ഹെൽപ്പ്ഡെസ്ക് രേഖകൾ പരിശോധിച്ച ശേഷം ഔദ്യോഗിക പോർട്ടലിലെ അപേക്ഷാ നടപടികൾ തുടരും.",
      routedTo: "തിരഞ്ഞെടുത്ത ഹെൽപ്പ്ഡെസ്ക്:",
      reference: "വികസിത കേരളം റഫറൻസ്",
      schemeDetails: "പദ്ധതി വിശദാംശങ്ങൾ",
      successSpeech:
        "നന്ദി. നിങ്ങളുടെ അപേക്ഷാ സഹായ അഭ്യർത്ഥന തയ്യാറായി. ഈ റഫറൻസ് ഉപയോഗിച്ച് അടുത്ത ഘട്ടത്തിലേക്ക് തുടരാം.",
      errors: {
        name: "കുറഞ്ഞത് രണ്ട് അക്ഷരമുള്ള പേര് നൽകുക.",
        mobile: "ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.",
        email: "ശരിയായ ഇമെയിൽ വിലാസം നൽകുക.",
        emailOtpRequired: "ഇമെയിൽ നൽകിയതിനാൽ OTP ഉപയോഗിച്ച് സ്ഥിരീകരിക്കുക.",
        otp: "ശരിയായ OTP നൽകുക.",
        otpRequired: "മൊബൈൽ നമ്പർ OTP ഉപയോഗിച്ച് സ്ഥിരീകരിക്കുക.",
        required: "ഈ വിവരം തിരഞ്ഞെടുക്കുക.",
        age: "1 മുതൽ 120 വരെ ശരിയായ പ്രായം നൽകുക.",
        consent: "തുടരാൻ സമ്മതം നൽകുക.",
        helpdesk: "ജില്ലയിലെ ഹെൽപ്പ്ഡെസ്ക് തിരഞ്ഞെടുക്കുക.",
        file: "PDF, JPG അല്ലെങ്കിൽ PNG ഫയൽ തിരഞ്ഞെടുക്കുക (പരമാവധി 5 MB).",
        storage: "അഭ്യർത്ഥന സൂക്ഷിക്കാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
      },
      incomeLabels: {
        under1: "₹1 ലക്ഷത്തിൽ താഴെ",
        oneToTwoFive: "₹1–2.5 ലക്ഷം",
        twoFiveToFive: "₹2.5–5 ലക്ഷം",
        fiveToEight: "₹5–8 ലക്ഷം",
        aboveEight: "₹8 ലക്ഷത്തിന് മുകളിൽ",
        unknown: "അറിയില്ല",
      } as Record<string, string>,
      occupationLabels: {
        farmer: "കർഷകൻ",
        student: "വിദ്യാർത്ഥി",
        employee: "ശമ്പള ജോലി",
        unorganised: "അസംഘടിത തൊഴിലാളി",
        selfEmployed: "സ്വയംതൊഴിൽ / സംരംഭകൻ",
        unemployed: "തൊഴിൽ അന്വേഷിക്കുന്നു",
        homemaker: "ഗൃഹനാഥ / ഗൃഹനാഥൻ",
        retired: "വിരമിച്ചവർ",
      } as Record<string, string>,
    };
  return {
    notFound: "Scheme not found",
    allSchemes: "All schemes",
    back: "Scheme details",
    eyebrow: "Application assistance",
    intro: "Provide the application details step by step and complete the process more easily.",
    step: "Step",
    stepTitles: [
      "Contact details",
      "Initial application profile",
      "Upload documents",
      "Review and create request",
    ],
    stepSpeech: [
      "Welcome. Start with your contact details and verify the mobile number.",
      "Now choose the initial information relevant to this scheme.",
      "Choose the documents needed for this scheme. The helpdesk can follow up on missing items.",
      "Review the details and submit your application-assistance request.",
    ],
    voiceOn: "Voice guidance on",
    voiceOff: "Voice guidance off",
    hearAgain: "Hear this again",
    needHelp: "Need personal help?",
    needHelpText: "Find a nearby Vikasita Keralam helpdesk.",
    findHelpdesk: "Find a helpdesk",
    previous: "Previous",
    continue: "Continue",
    createRequest: "Create assistance request",
    name: "Name",
    mobile: "Mobile number",
    mobilePlaceholder: "10-digit number",
    email: "Email (optional)",
    emailPlaceholder: "Email address",
    emailOtp: "OTP received by email",
    sendOtp: "Send OTP",
    resendOtp: "Resend",
    otp: "OTP received on mobile",
    otpPlaceholder: "6-digit OTP",
    verifyOtp: "Verify",
    verified: "Verified",
    district: "District",
    select: "Select",
    helpdesk: "Helpdesk",
    chooseHelpdesk: "Choose your helpdesk",
    chooseDistrictFirst: "Choose a district first",
    helpdeskHint: "Your request will appear in this helpdesk's review queue.",

    age: "Age",
    income: "Annual household income",
    occupation: "Occupation / current status",
    notes: "What help do you need? (optional)",
    notesHint: "Example: Help preparing documents",
    profileHint:
      "These details will simplify the next assistance step. The official authority determines final eligibility.",
    documentsIntro:
      "Add each available document as a PDF, JPG or PNG. You can still request help for missing documents.",
    ready: "Ready",
    chooseFile: "Choose file",
    replaceFile: "Replace",
    removeFile: "Remove",
    viewFile: "View",
    missingDocument: "Not added",
    documentsToReview: "Document status",
    informationForHelpdesk: "Other information for the helpdesk",
    uploadNotice: "Add PDF, JPG or PNG files up to 5 MB each. Missing documents will be marked for helpdesk follow-up.",
    noUploads:
      "Application assistance will be available to prepare and submit the required documents in the next step.",
    scheme: "Scheme",
    documentReadiness: "Documents ready",
    notProvided: "Not provided",
    consent:
      "I confirm the details are correct and consent to the selected helpdesk reviewing my information and documents to assist with an application on the relevant official portal. This request is not an official scheme application.",
    successEyebrow: "Assistance request created",
    successTitle: "Ready for the next step",
    successText: "Keep this helpdesk request reference. The helpdesk will review the documents before assisting with the application on the official portal.",
    routedTo: "Selected helpdesk:",
    reference: "Vikasita Keralam reference",
    schemeDetails: "Scheme details",
    successSpeech:
      "Thank you. Your application-assistance request is ready. Use the reference to continue to the next step.",
    errors: {
      name: "Enter a name with at least two characters.",
      mobile: "Enter a valid 10-digit mobile number.",
      email: "Enter a valid email address.",
      emailOtpRequired: "Verify the email address using OTP when an email is provided.",
      otp: "Enter the correct OTP.",
      otpRequired: "Verify the mobile number using OTP.",
      required: "Select this information.",
      age: "Enter a valid age between 1 and 120.",
      consent: "Provide consent to continue.",
      helpdesk: "Choose a helpdesk in your district.",
      file: "Choose a PDF, JPG or PNG file up to 5 MB.",
      storage: "The request could not be saved. Please try again.",
    },
    incomeLabels: {
      under1: "Below ₹1 lakh",
      oneToTwoFive: "₹1–2.5 lakh",
      twoFiveToFive: "₹2.5–5 lakh",
      fiveToEight: "₹5–8 lakh",
      aboveEight: "Above ₹8 lakh",
      unknown: "I don't know",
    } as Record<string, string>,
    occupationLabels: {
      farmer: "Farmer",
      student: "Student",
      employee: "Salaried employee",
      unorganised: "Unorganised worker",
      selfEmployed: "Self-employed / entrepreneur",
      unemployed: "Job seeker",
      homemaker: "Homemaker",
      retired: "Retired",
    } as Record<string, string>,
  };
}
