import { useLang } from "@/i18n/LanguageProvider";
import type { Urgency } from "@/data/issues";

const cls: Record<Urgency, string> = {
  low: "bg-secondary",
  medium: "bg-primary",
  high: "bg-warning",
  critical: "bg-destructive",
};

export function UrgencyDot({ urgency }: { urgency: Urgency }) {
  const { t } = useLang();
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-foreground/80">
      <span className={`h-2 w-2 rounded-full ${cls[urgency]}`} />
      {t.urgency[urgency]}
    </span>
  );
}