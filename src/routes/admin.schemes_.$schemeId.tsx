import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  MoreVertical,
  Pencil,
  Power,
  PowerOff,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { schemes, type Scheme } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";
import schemeLogoFallback from "@/assets/kpi-3d/schemes.png";

export const Route = createFileRoute("/admin/schemes_/$schemeId")({
  head: () => ({ meta: [{ title: "Scheme details · Admin" }] }),
  component: SchemeDetails,
});

const CATEGORY_LABELS: Record<Scheme["category"], { en: string; ml: string }> = {
  agriculture: { en: "Agriculture & Farming", ml: "കൃഷിയും കാർഷികവും" },
  women: { en: "Women & Child Welfare", ml: "വനിതാ–ശിശു ക്ഷേമം" },
  health: { en: "Health & Medical", ml: "ആരോഗ്യവും വൈദ്യവും" },
  education: { en: "Education & Scholarship", ml: "വിദ്യാഭ്യാസവും സ്കോളർഷിപ്പും" },
  housing: { en: "Housing & Infrastructure", ml: "ഭവനവും അടിസ്ഥാന സൗകര്യവും" },
  employment: { en: "Employment & Skill", ml: "തൊഴിലും നൈപുണ്യവും" },
  welfare: { en: "Pension & Social Security", ml: "പെൻഷനും സാമൂഹിക സുരക്ഷയും" },
  msme: { en: "Business & MSME", ml: "സംരംഭവും MSME-യും" },
};

const ELIGIBILITY_FIELD_LABELS = [
  "Gender",
  "Age",
  "Religion",
  "Caste / Social Category",
  "Disability Status",
  "Disability Percentage",
  "Minority Status",
  "Student Status",
  "Employment Status",
  "Occupation",
  "Annual Family Income",
  "Marital Status",
  "Household Status",
  "BPL Status",
];

const schemeLogoUrls: Record<string, string> = {
  pmkisan: "/images/popular-schemes/pm_kisan.png",
  pmjjby: "/images/popular-schemes/pmjjby.png",
  pmsby: "/images/popular-schemes/pmsby.png",
  apy: "/images/popular-schemes/atal_pension.png",
  pmay: "/images/popular-schemes/pm_awas.png",
  ujjwala: "/images/popular-schemes/pm_ujjwala.png",
  mudra: "/images/popular-schemes/mudra.png",
  pmjay: "/images/popular-schemes/pm_jay.png",
  standup: "/images/popular-schemes/stand_up_india.png",
  pmmvy: "/images/popular-schemes/pm_matru_vandana.png",
  midday: "/images/popular-schemes/mid_day_meal.png",
  pmkvy: "/images/popular-schemes/pmkvy.png",
};

const inferBenefitType = (scheme: Scheme) => {
  const text = `${scheme.benefit.en} ${scheme.benefit.ml}`.toLowerCase();
  if (text.includes("insurance") || text.includes("ഇൻഷുറൻസ്")) return "Health / Life Insurance";
  if (text.includes("loan") || text.includes("വായ്പ")) return "Concessional Loan";
  if (text.includes("subsidy") || text.includes("സബ്സിഡി")) return "Subsidy";
  if (text.includes("pension") || text.includes("പെൻഷൻ")) return "Financial Assistance";
  return "Other Benefit";
};

function SchemeDetails() {
  const { schemeId } = Route.useParams();
  const { lang } = useLang();
  const [isEnabled, setIsEnabled] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  const scheme = schemes.find((item) => item.id === schemeId);
  if (!scheme || isDeleted) return <Empty title={isDeleted ? (lang === "ml" ? "പദ്ധതി ഇല്ലാതാക്കി" : "Scheme Deleted") : "Scheme not found"} />;

  const website = `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.en)}`;
  const websiteHost = "myscheme.gov.in";

  return (
    <div className="pb-8 text-foreground w-full">
      {/* Desktop header with back navigation */}
      <section className="sm:-mx-6 sm:-mt-6 sm:border-b sm:border-border/70 sm:bg-card sm:px-6 sm:py-2.5">
        <div className="flex items-center justify-between gap-3 pb-1 sm:pb-0">
          <div className="flex items-center gap-3 sm:gap-2.5">
            <Link
              to="/admin/schemes"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xs transition-all hover:bg-muted hover:text-primary sm:h-8 sm:w-8"
              title={lang === "ml" ? "പദ്ധതി പട്ടികയിലേക്ക് തിരികെ പോകുക" : "Back to Schemes"}
            >
              <ArrowLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </Link>
            <h1 className="font-display text-lg font-bold tracking-tight">
              {lang === "ml" ? "പദ്ധതി വിശദാംശങ്ങൾ" : "Scheme Details"}
            </h1>
          </div>
        </div>
      </section>

      <div className="space-y-5 pt-4 sm:pt-5">
        {/* Desktop View: Merged Scheme Header, Logo, Application Numbers & Basic Information Card */}
        <div className="hidden sm:block space-y-5">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            {/* Top Header Row inside Card: Logo, Scheme Title & Ministry, Action Buttons & 5 Application Stats */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/60 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-white p-2 shadow-2xs">
                    <img
                      src={schemeLogoUrls[scheme.id] ?? schemeLogoFallback}
                      alt=""
                      className="h-full w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = schemeLogoFallback;
                      }}
                    />
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {lang === "ml" ? "ലോഗോ" : "Logo"}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight">
                      {scheme[lang]}
                    </h2>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-extrabold ${
                        isEnabled
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                          : "border-rose-500/20 bg-rose-500/10 text-rose-600"
                      }`}
                    >
                      {isEnabled
                        ? (lang === "ml" ? "സജീവം" : "Active")
                        : (lang === "ml" ? "നിഷ്ക്രിയം" : "Disabled")}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">{scheme.ministry[lang]}</p>
                </div>
              </div>

              {/* Right Side: Action Buttons & 5 Counts Application Stats */}
              <div className="flex flex-col lg:items-end gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-bold text-foreground transition-colors hover:bg-muted shadow-2xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {lang === "ml" ? "അപേക്ഷാ ലിങ്ക്" : "Apply Link"}
                  </a>
                  <Link
                    to="/admin/schemes/new"
                    search={{ edit: scheme.id }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-2xs"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {lang === "ml" ? "പദ്ധതി തിരുത്തുക" : "Edit scheme"}
                  </Link>

                  {/* 3 Dot Action Menu for Disable / Enable & Delete */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-xl border-border bg-card shadow-2xs"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => {
                          const nextState = !isEnabled;
                          setIsEnabled(nextState);
                          toast.success(
                            nextState
                              ? (lang === "ml" ? "പദ്ധതി സജീവമാക്കി" : "Scheme enabled")
                              : (lang === "ml" ? "പദ്ധതി നിഷ്ക്രിയമാക്കി" : "Scheme disabled")
                          );
                        }}
                      >
                        {isEnabled ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4 text-amber-600" />
                            {lang === "ml" ? "നിഷ്ക്രിയമാക്കുക" : "Disable Scheme"}
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4 text-emerald-600" />
                            {lang === "ml" ? "സജീവമാക്കുക" : "Enable Scheme"}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => {
                          if (confirm(lang === "ml" ? "ഈ പദ്ധതി ഒഴിവാക്കണോ?" : "Are you sure you want to delete this scheme?")) {
                            setIsDeleted(true);
                            toast.success(lang === "ml" ? "പദ്ധതി ഇല്ലാതാക്കി" : "Scheme deleted");
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {lang === "ml" ? "ഇല്ലാതാക്കുക" : "Delete Scheme"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* 5 Counts Summary Bar: Applications, Approved, Rejected, Pending, In Progress */}
                <div className="flex items-center gap-3 bg-muted/40 px-3.5 py-2 rounded-xl border border-border/60">
                  <div className="text-center px-1">
                    <p className="font-display text-base font-extrabold text-foreground leading-none">126</p>
                    <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">{lang === "ml" ? "അപേക്ഷകൾ" : "Applications"}</p>
                  </div>
                  <div className="h-6 w-px bg-border/60" />
                  <div className="text-center px-1">
                    <p className="font-display text-base font-extrabold text-emerald-600 leading-none">98</p>
                    <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">{lang === "ml" ? "അംഗീകരിച്ചു" : "Approved"}</p>
                  </div>
                  <div className="h-6 w-px bg-border/60" />
                  <div className="text-center px-1">
                    <p className="font-display text-base font-extrabold text-rose-600 leading-none">12</p>
                    <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">{lang === "ml" ? "നിരസിച്ചു" : "Rejected"}</p>
                  </div>
                  <div className="h-6 w-px bg-border/60" />
                  <div className="text-center px-1">
                    <p className="font-display text-base font-extrabold text-amber-600 leading-none">11</p>
                    <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">{lang === "ml" ? "അവലോകനം" : "Pending"}</p>
                  </div>
                  <div className="h-6 w-px bg-border/60" />
                  <div className="text-center px-1">
                    <p className="font-display text-base font-extrabold text-blue-600 leading-none">5</p>
                    <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">{lang === "ml" ? "പുരോഗതിയിൽ" : "In Progress"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Cards Grid (without Basic Information heading) */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={lang === "ml" ? "പദ്ധതിയുടെ പേര്" : "Scheme Name"} value={scheme[lang]} />
              <Field label={lang === "ml" ? "വിഭാഗം" : "Category"} value={CATEGORY_LABELS[scheme.category][lang]} />
              <Field
                label={lang === "ml" ? "വകുപ്പ് / മന്ത്രാലയം" : "Department / Ministry"}
                value={scheme.ministry[lang]}
              />
              <Field label={lang === "ml" ? "ഔദ്യോഗിക വെബ്സൈറ്റ്" : "Official Website"} value={websiteHost} href={website} />
              <Field
                label={lang === "ml" ? "പദ്ധതി കാർഡ് വിവരണം" : "Scheme Card Description"}
                value={scheme.benefit[lang]}
              />
              <Field
                label={lang === "ml" ? "ആനുകൂല്യ കാലയളവ്" : "Benefits Duration"}
                value={lang === "ml" ? "വ്യക്തമാക്കിയിട്ടില്ല" : "Not specified"}
              />
              <Field label={lang === "ml" ? "ആനുകൂല്യ തരം" : "Benefits Type"} value={inferBenefitType(scheme)} />
              <Field
                label={lang === "ml" ? "പദ്ധതിയെക്കുറിച്ച്" : "About Scheme"}
                value={scheme.eligibility[lang]}
              />
              <Field
                label={lang === "ml" ? "പദ്ധതി ലോഗോ" : "Scheme Logo"}
                value={lang === "ml" ? "അപ്‌ലോഡ് ചെയ്ത ചിഹ്നം" : "Uploaded emblem"}
              />
            </div>
          </section>

          {/* Desktop 2-Column Grid: Eligibility Conditions on Left, Additional Questions & Documents on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DetailSection
              title={lang === "ml" ? "യോഗ്യതാ നിബന്ധനകൾ" : "Eligibility Conditions"}
              icon={ShieldCheck}
              description={
                lang === "ml"
                  ? "പദ്ധതിക്കായി ക്രമീകരിച്ച യോഗ്യതാ നിയമങ്ങൾ"
                  : "Eligibility rules configured for this scheme"
              }
            >
              <div className="space-y-3">
                <Field
                  label={lang === "ml" ? "യോഗ്യതാ സംഗ്രഹം" : "Eligibility Summary"}
                  value={scheme.eligibility[lang]}
                />
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="w-12 px-3 py-2">#</th>
                        <th className="px-3 py-2">{lang === "ml" ? "യോഗ്യതാ ഫീൽഡ്" : "Eligibility Field"}</th>
                        <th className="w-28 px-3 py-2">{lang === "ml" ? "നിയമം" : "Rule"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {ELIGIBILITY_FIELD_LABELS.map((label, index) => (
                        <tr key={label}>
                          <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{index + 1}</td>
                          <td className="px-3 py-2 font-semibold text-foreground">{label}</td>
                          <td className="px-3 py-2">
                            <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              Any
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </DetailSection>

            <DetailSection
              title={lang === "ml" ? "അധിക ചോദ്യങ്ങളും രേഖകളും" : "Additional Questions & Documents"}
              icon={FileText}
              description={
                lang === "ml"
                  ? "അപേക്ഷകരിൽ നിന്ന് ശേഖരിക്കുന്ന വിവരങ്ങളും രേഖകളും"
                  : "Questions and documents collected from applicants"
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                  <p className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "അധിക ചോദ്യങ്ങളൊന്നും ചേർത്തിട്ടില്ല" : "No additional questions added"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {lang === "ml"
                      ? "സൃഷ്ടിക്കൽ ഘട്ടത്തിൽ ചേർക്കുന്ന ഫീൽഡുകൾ ഇവിടെ കാണാം."
                      : "Fields added in the Create Scheme flow will appear here."}
                  </p>
                </div>
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                  <p className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "രേഖകളൊന്നും ക്രമീകരിച്ചിട്ടില്ല" : "No documents configured"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {lang === "ml"
                      ? "സൃഷ്ടിക്കൽ ഘട്ടത്തിൽ ചേർക്കുന്ന രേഖാ അപ്‌ലോഡുകൾ ഇവിടെ കാണാം."
                      : "Document uploads added in the Create Scheme flow will appear here."}
                  </p>
                </div>
              </div>
            </DetailSection>
          </div>

          <DetailSection
            title={lang === "ml" ? "മാറ്റ ചരിത്രം" : "Change history"}
            icon={ShieldCheck}
          >
            <p className="text-sm text-muted-foreground">
              {lang === "ml"
                ? "ഇന്ന് പരിശോധിച്ചു. പ്രസിദ്ധീകരിച്ച ഓരോ മാറ്റവും സ്രോതസ്സ്, എഡിറ്റർ, തീയതി എന്നിവ സൂക്ഷിക്കുന്നു."
                : "Last checked today. Every published change keeps the source, editor and date."}
            </p>
          </DetailSection>
        </div>

        {/* Mobile View: Standard Stacked Layout */}
        <div className="block sm:hidden space-y-5">
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-2xs">
                <img
                  src={schemeLogoUrls[scheme.id] ?? schemeLogoFallback}
                  alt=""
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = schemeLogoFallback;
                  }}
                />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-bold">{scheme[lang]}</h2>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600">
                    {lang === "ml" ? "സജീവം" : "Active"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{scheme.ministry[lang]}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4" />
                {lang === "ml" ? "ഔദ്യോഗിക സ്രോതസ്സ്" : "Official source"}
              </a>
              <Link
                to="/admin/schemes/new"
                search={{ edit: scheme.id }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Pencil className="h-4 w-4" />
                {lang === "ml" ? "പദ്ധതി തിരുത്തുക" : "Edit scheme"}
              </Link>
            </div>
          </header>

          <div className="space-y-4">
            <DetailSection
              title={lang === "ml" ? "അടിസ്ഥാന വിവരങ്ങൾ" : "Basic Information"}
              icon={Sparkles}
              description={
                lang === "ml"
                  ? "സൃഷ്ടിക്കൽ ഘട്ടത്തിൽ നൽകിയ പദ്ധതി വിവരങ്ങൾ"
                  : "Scheme details entered in the Create Scheme flow"
              }
            >
              <div className="grid gap-3 grid-cols-1">
                <Field label={lang === "ml" ? "പദ്ധതിയുടെ പേര്" : "Scheme Name"} value={scheme[lang]} />
                <Field label={lang === "ml" ? "വിഭാഗം" : "Category"} value={CATEGORY_LABELS[scheme.category][lang]} />
                <Field
                  label={lang === "ml" ? "വകുപ്പ് / മന്ത്രാലയം" : "Department / Ministry"}
                  value={scheme.ministry[lang]}
                />
                <Field label={lang === "ml" ? "ഔദ്യോഗിക വെബ്സൈറ്റ്" : "Official Website"} value={websiteHost} href={website} />
                <Field
                  label={lang === "ml" ? "പദ്ധതി കാർഡ് വിവരണം" : "Scheme Card Description"}
                  value={scheme.benefit[lang]}
                />
                <Field
                  label={lang === "ml" ? "ആനുകൂല്യ കാലയളവ്" : "Benefits Duration"}
                  value={lang === "ml" ? "വ്യക്തമാക്കിയിട്ടില്ല" : "Not specified"}
                />
                <Field label={lang === "ml" ? "ആനുകൂല്യ തരം" : "Benefits Type"} value={inferBenefitType(scheme)} />
                <Field
                  label={lang === "ml" ? "പദ്ധതിയെക്കുറിച്ച്" : "About Scheme"}
                  value={scheme.eligibility[lang]}
                />
                <Field
                  label={lang === "ml" ? "പദ്ധതി ലോഗോ" : "Scheme Logo"}
                  value={lang === "ml" ? "അപ്‌ലോഡ് ചെയ്ത ചിഹ്നം" : "Uploaded emblem"}
                />
              </div>
            </DetailSection>

            <DetailSection
              title={lang === "ml" ? "യോഗ്യതാ നിബന്ധനകൾ" : "Eligibility Conditions"}
              icon={ShieldCheck}
              description={
                lang === "ml"
                  ? "പദ്ധതിക്കായി ക്രമീകരിച്ച യോഗ്യതാ നിയമങ്ങൾ"
                  : "Eligibility rules configured for this scheme"
              }
            >
              <div className="space-y-3">
                <Field
                  label={lang === "ml" ? "യോഗ്യതാ സംഗ്രഹം" : "Eligibility Summary"}
                  value={scheme.eligibility[lang]}
                />
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="w-12 px-3 py-2">#</th>
                        <th className="px-3 py-2">{lang === "ml" ? "യോഗ്യതാ ഫീൽഡ്" : "Eligibility Field"}</th>
                        <th className="w-28 px-3 py-2">{lang === "ml" ? "നിയമം" : "Rule"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {ELIGIBILITY_FIELD_LABELS.map((label, index) => (
                        <tr key={label}>
                          <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{index + 1}</td>
                          <td className="px-3 py-2 font-semibold text-foreground">{label}</td>
                          <td className="px-3 py-2">
                            <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              Any
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </DetailSection>

            <DetailSection
              title={lang === "ml" ? "അധിക ചോദ്യങ്ങളും രേഖകളും" : "Additional Questions & Documents"}
              icon={FileText}
              description={
                lang === "ml"
                  ? "അപേക്ഷകരിൽ നിന്ന് ശേഖരിക്കുന്ന വിവരങ്ങളും രേഖകളും"
                  : "Questions and documents collected from applicants"
              }
            >
              <div className="grid gap-3 grid-cols-1">
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                  <p className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "അധിക ചോദ്യങ്ങളൊന്നും ചേർത്തിട്ടില്ല" : "No additional questions added"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {lang === "ml"
                      ? "സൃഷ്ടിക്കൽ ഘട്ടത്തിൽ ചേർക്കുന്ന ഫീൽഡുകൾ ഇവിടെ കാണാം."
                      : "Fields added in the Create Scheme flow will appear here."}
                  </p>
                </div>
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                  <p className="text-xs font-bold text-foreground">
                    {lang === "ml" ? "രേഖകളൊന്നും ക്രമീകരിച്ചിട്ടില്ല" : "No documents configured"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {lang === "ml"
                      ? "സൃഷ്ടിക്കൽ ഘട്ടത്തിൽ ചേർക്കുന്ന രേഖാ അപ്‌ലോഡുകൾ ഇവിടെ കാണാം."
                      : "Document uploads added in the Create Scheme flow will appear here."}
                  </p>
                </div>
              </div>
            </DetailSection>

            <DetailSection
              title={lang === "ml" ? "മാറ്റ ചരിത്രം" : "Change history"}
              icon={ShieldCheck}
            >
              <p className="text-sm text-muted-foreground">
                {lang === "ml"
                  ? "ഇന്ന് പരിശോധിച്ചു. പ്രസിദ്ധീകരിച്ച ഓരോ മാറ്റവും സ്രോതസ്സ്, എഡിറ്റർ, തീയതി എന്നിവ സൂക്ഷിക്കുന്നു."
                  : "Last checked today. Every published change keeps the source, editor and date."}
              </p>
            </DetailSection>

            <aside className="space-y-4">
              <Stat label={lang === "ml" ? "അപേക്ഷകൾ" : "Applications"} value="126" />
              <Stat label={lang === "ml" ? "യോഗ്യതാ പരിശോധനകൾ" : "Eligible checks"} value="84" />
              <Stat label={lang === "ml" ? "അവലോകനം ബാക്കി" : "Pending review"} value="3" />
              <div className="rounded-2xl border border-secondary/20 bg-secondary/[0.06] p-5">
                <div className="flex items-center gap-2 font-semibold text-secondary">
                  <CheckCircle2 className="h-5 w-5" />
                  {lang === "ml" ? "അപേക്ഷകർക്ക് തയ്യാർ" : "Ready for applicants"}
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {lang === "ml"
                    ? "പദ്ധതി വിവരങ്ങളും യോഗ്യതാ നിയമങ്ങളും പൊതു പോർട്ടലിൽ ലഭ്യമാണ്."
                    : "Scheme details and eligibility rules are available in the public portal."}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  description,
  children,
}: {
  title: string;
  icon: typeof Sparkles;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-2.5 border-b border-border/60 pb-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-bold">{title}</h2>
          {description && <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function Field({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[.1em] text-muted-foreground">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 break-all text-sm font-semibold text-primary hover:underline"
        >
          {value}
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ) : (
        <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Empty({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <Link
        to="/admin/schemes"
        className="mt-5 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-semibold"
      >
        Go back
      </Link>
    </div>
  );
}
