import { useLang } from "@/i18n/LanguageProvider";
import type { IssueStatus } from "@/data/issues";

const tone: Record<IssueStatus, string> = {
  submitted: "bg-muted text-foreground",
  under_review: "bg-accent text-accent-foreground",
  verification_pending: "bg-warning/15 text-foreground",
  verified: "bg-secondary/15 text-secondary",
  escalated: "bg-destructive/10 text-destructive",
  public_campaign: "bg-primary/15 text-primary",
  followup_pending: "bg-warning/15 text-foreground",
  resolved: "bg-secondary text-secondary-foreground",
  closed: "bg-foreground/10 text-foreground",
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  const { t } = useLang();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tone[status]}`}>
      {t.status[status]}
    </span>
  );
}