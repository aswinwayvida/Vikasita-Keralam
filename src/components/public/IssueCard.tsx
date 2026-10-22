import { Link } from "@tanstack/react-router";
import type { Issue } from "@/data/issues";
import { useLang } from "@/i18n/LanguageProvider";
import { getDistrictName, getPanchayatName } from "@/data/geo";
import { StatusBadge } from "./StatusBadge";
import { UrgencyDot } from "./UrgencyDot";
import { MapPin, ThumbsUp } from "lucide-react";

// Public-safe card — never shows reporter name or mobile.
export function IssueCard({ issue }: { issue: Issue }) {
  const { lang, t } = useLang();
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-foreground/70">
          {t.categories[issue.category]}
        </span>
        <StatusBadge status={issue.status} />
      </div>
      <h3 className="text-base font-semibold leading-snug">{issue.title[lang]}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{issue.description[lang]}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-foreground/70">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {getPanchayatName(issue.panchayatId, lang)} · {getDistrictName(issue.districtId, lang)}
        </span>
        <UrgencyDot urgency={issue.urgency} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
          <ThumbsUp className="h-3.5 w-3.5" />
          {issue.supportCount.toLocaleString()} {t.common.support}
        </span>
        <Link to="/janashabdam/issues" className="text-xs font-medium text-primary hover:underline">
          {t.common.learnMore} →
        </Link>
      </div>
    </article>
  );
}