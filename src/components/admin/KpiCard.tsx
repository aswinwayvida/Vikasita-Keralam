import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";

export function KpiCard({ icon: Icon, iconSrc, label, value, delta, tone = "primary", href, valueClassName }: {
  icon?: LucideIcon; iconSrc?: string; label: string; value: string | number;
  delta?: number; tone?: "primary" | "secondary" | "warning" | "destructive";
  href?: string; valueClassName?: string;
}) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    warning: "bg-warning/15 text-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  const up = (delta ?? 0) >= 0;
  const content = (
    <div className="flex h-full flex-col justify-between p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{label}</span>
        {iconSrc ? (
          <img src={iconSrc} alt={label} className="h-9 w-9 sm:h-11 sm:w-11 object-contain shrink-0" />
        ) : Icon ? (
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${toneCls}`}><Icon className="h-4 w-4" /></span>
        ) : null}
      </div>
      <div className="flex items-baseline justify-between mt-2">
        <div className={`font-display text-lg sm:text-2xl font-extrabold tracking-tight ${valueClassName || "text-foreground"}`}>{value}</div>
        {typeof delta === "number" ? (
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? "text-secondary" : "text-destructive"}`}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        ) : href ? <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" /> : null}
      </div>
    </div>
  );

  if (href) return <a href={href} className="group block rounded-2xl border border-amber-200/60 dark:border-border/80 bg-card transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{content}</a>;
  return <div className="rounded-2xl border border-amber-200/60 dark:border-border/80 bg-card shadow-2xs">{content}</div>;
}
