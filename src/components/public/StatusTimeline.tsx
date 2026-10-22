import { useLang } from "@/i18n/LanguageProvider";
import type { IssueStatus } from "@/data/issues";
import { Check, Circle, Dot } from "lucide-react";

const order: IssueStatus[] = ["submitted", "under_review", "verification_pending", "verified", "escalated", "public_campaign", "followup_pending", "resolved", "closed"];

export function StatusTimeline({ current, events }: { current: IssueStatus; events?: { status: IssueStatus; at: string; note?: { ml: string; en: string } }[] }) {
  const { lang, t } = useLang();
  const currentIdx = order.indexOf(current);
  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {order.map((s, idx) => {
        const done = idx <= currentIdx;
        const ev = events?.find((e) => e.status === s);
        return (
          <li key={s} className="relative">
            <span className={`absolute -left-[31px] top-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border ${done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>
              {done ? <Check className="h-3.5 w-3.5" /> : idx === currentIdx + 1 ? <Circle className="h-2.5 w-2.5" /> : <Dot className="h-3 w-3" />}
            </span>
            <div>
              <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{t.status[s]}</p>
              {ev && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(ev.at).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  {ev.note ? ` · ${ev.note[lang]}` : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}