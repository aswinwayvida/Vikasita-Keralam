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
    <>
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneCls}`}><Icon className="h-4.5 w-4.5" /></span>
        {typeof delta === "number" ? (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-secondary" : "text-destructive"}`}>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta)}%
          </span>
        ) : href ? <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" /> : null}
      </div>
      <div className="mt-4 font-display text-2xl font-bold sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </>
  );

  if (href) return <a href={href} className="group block rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{content}</a>;
  return <div className="rounded-xl border border-border bg-card p-5">{content}</div>;
}