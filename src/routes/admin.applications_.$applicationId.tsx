import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  FileCheck2,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import {
  adminApplications,
  formatWaitingTime,
  maskEmail,
  maskPhone,
} from "@/data/admin-applications";
import { schemes } from "@/data/schemes";
import { getDistrictName } from "@/data/geo";
import { loadHelpdeskRequests, type HelpdeskRequest } from "@/lib/helpdesk-requests";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { StagePill } from "./admin.applications";

export const Route = createFileRoute("/admin/applications_/$applicationId")({
  head: () => ({ meta: [{ title: "Application details \u00b7 Admin" }] }),
  component: ApplicationDetailsPage,
});

function ApplicationDetailsPage() {
  const { applicationId } = Route.useParams();
  const { lang } = useLang();
  const application = adminApplications.find((item) => item.id === applicationId);
  const [helpdeskRequest, setHelpdeskRequest] = useState<HelpdeskRequest | undefined>();
  useEffect(() => {
    setHelpdeskRequest(loadHelpdeskRequests().find((item) => item.reference === applicationId));
  }, [applicationId]);
  const scheme = schemes.find((item) => item.id === application?.schemeId);

  if (helpdeskRequest) return <HelpdeskRequestDetails request={helpdeskRequest} lang={lang} />;

  if (!application)
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-bold">Application not found</h1>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/admin/applications" search={{ stage: undefined, filter: undefined }}>Back to Applications</Link>
        </Button>
      </div>
    );

  const completedProgressByStage = {
    New: 1,
    "Checking documents": 2,
    "Ready to submit": 4,
    "Follow-up needed": 5,
    Completed: 6,
  } as const;
  const completedProgress = completedProgressByStage[application.queueStage];

  const documents = [
    "Identity document",
    "Bank account proof",
    "Income / eligibility proof",
    "Scheme-specific declaration",
    "Applicant photograph",
  ];
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/admin/applications"
            search={{ stage: undefined, filter: undefined }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Applications
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{application.applicant}</h1>
            <StagePill stage={application.queueStage} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {application.reference} {"\u00b7"} submitted{" "}
            {new Date(application.submittedAt).toLocaleDateString("en-IN")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <UserRoundCheck /> Assign
          </Button>
          <Button variant="outline">
            <MessageCircle /> WhatsApp
          </Button>
          <Button variant="outline">
            <Mail /> Email
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.65fr)]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Applicant and contact details</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Applicant" value={application.applicant} />
              <Info
                label="Mobile"
                value={maskPhone(application.mobile)}
                action={
                  <a
                    href={`tel:${application.mobile}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-secondary"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                }
              />
              <Info
                label="Email"
                value={maskEmail(application.email)}
                action={
                  <a
                    href={`mailto:${application.email}`}
                    className="text-xs font-semibold text-secondary"
                  >
                    Email
                  </a>
                }
              />
              <Info label="District" value={getDistrictName(application.districtId, lang)} />
              <Info label="Current status" value={application.queueStage} />
              <Info label="Assigned to" value={application.reviewer} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Scheme and application details</h2>
            <div className="mt-4 rounded-xl border border-border bg-background p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
                Scheme
              </p>
              <p className="mt-1 font-semibold">{scheme?.[lang]}</p>
              <p className="mt-1 text-xs text-muted-foreground">{scheme?.ministry[lang]}</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Eligibility result" value="Initial criteria matched" />
              <Info label="Submission route" value="Helpdesk-assisted application" />
              <Info
                label={application.queueStage === "Completed" ? "Platform support" : "Waiting time"}
                value={
                  application.queueStage === "Completed"
                    ? "Completed after department submission"
                    : formatWaitingTime(application.ageHours)
                }
              />
              <Info
                label={application.queueStage === "Completed" ? "Submission status" : "Last update"}
                value={
                  application.queueStage === "Completed"
                    ? "Submitted to the responsible department"
                    : "Today, 10:30 AM"
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Documents</h2>
              <span className="text-sm font-semibold text-secondary">
                {application.documentCount}/5 received
              </span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {documents.map((name, index) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-lg ${index < application.documentCount ? "bg-secondary/10 text-secondary" : "bg-amber-500/10 text-amber-700"}`}
                  >
                    {index < application.documentCount ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <FileCheck2 className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-semibold">{name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {index < application.documentCount
                        ? "Received \u00b7 protected preview"
                        : "Not received"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Application progress</h2>
            <div className="mt-4 space-y-4">
              {[
                "Application received",
                "Contact verified",
                "Documents verified",
                "Ready for submission",
                "Submitted to department",
                "Platform follow-up completed",
              ].map((item, index) => {
                const isCompleted = index < completedProgress;
                return (
                  <div key={item} className="flex gap-3">
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${isCompleted ? "bg-secondary text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item}</p>
                      <p className="text-xs text-muted-foreground">
                        {isCompleted ? "Completed" : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="rounded-2xl border border-secondary/20 bg-secondary/[0.06] p-5">
            <div className="flex items-center gap-2 text-secondary">
              <ShieldCheck className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Protected access</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Personal information stays masked in the list. Opening protected documents is
              recorded.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Internal note</h2>
            <textarea
              className="mt-3 min-h-28 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              placeholder="Add a note for the team"
            />
            <Button className="mt-3 w-full">Save note</Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function HelpdeskRequestDetails({ request, lang }: { request: HelpdeskRequest; lang: "ml" | "en" }) {
  const scheme = schemes.find((item) => item.id === request.schemeId);
  return (
    <div className="space-y-5">
      <Link to="/admin/applications" search={{ stage: undefined, filter: undefined }} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Applications
      </Link>
      <div className="rounded-2xl border border-primary/20 bg-saffron-soft/25 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">Public helpdesk request</p>
        <h1 className="mt-2 font-display text-2xl font-bold">{request.applicant}</h1>
        <p className="mt-1 font-mono text-sm">{request.reference}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          This request has been prepared for helpdesk review. It does not mean an application was submitted on an official government portal.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Request and routing</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info label="Scheme" value={scheme?.[lang] ?? request.schemeId} />
            <Info label="Assigned helpdesk" value={request.helpdeskName} />
            <Info label="District" value={getDistrictName(request.district, lang)} />
            <Info label="Mobile" value={request.mobile} />
            <Info label="Email" value={request.email ?? "Not provided"} />
            <Info label="Received" value={new Date(request.createdAt).toLocaleString("en-IN")} />
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Document checklist</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Check the documents listed by the applicant and follow up on missing items.
          </p>
          <div className="mt-4 space-y-2">
            {request.documents.map((document) => (
              <div key={document.label} className="rounded-xl border border-green/20 bg-green-soft/25 p-3">
                <p className="text-sm font-semibold">{document.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{document.fileName} · selected by applicant</p>
              </div>
            ))}
            {request.missingDocuments.map((label) => (
              <div key={label} className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-amber-700">Missing · follow up with applicant</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/55 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{value}</p>
        {action}
      </div>
    </div>
  );
}
