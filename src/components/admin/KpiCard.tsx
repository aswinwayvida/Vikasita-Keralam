import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";

export function KpiCard({ icon: Icon, label, value, delta, tone = "primary", href }: {
  icon: LucideIcon; label: string; value: string | number;
  delta?: number; tone?: "primary" | "secondary" | "warning" | "destructive";
  href?: string;
}) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    warning: "bg-warning/15 text-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  const up = (delta ?? 0) >= 0;
  const content = (
    <div className="flex h-full flex-col justify-center space-y-0.5 space-y-[1px]">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${toneCls}`}><Icon className="h-3.5 w-3.5" /></span>
        {typeof delta === "number" ? (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-secondary" : "text-destructive"}`}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        ) : href ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" /> : null}
      </div>
      <div className="font-display text-base font-bold leading-none sm:text-lg">{value}</div>
      <div className="text-[16px] text-muted-foreground truncate leading-none">{label}</div>
    </div>
  );

  if (href) return <a href={href} className="group block h-[60px] rounded-xl border border-border bg-card px-3.5 py-1.5 transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{content}</a>;
  return <div className="h-[60px] rounded-xl border border-border bg-card px-3.5 py-1.5">{content}</div>;
}