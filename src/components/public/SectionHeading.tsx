import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        )}
        <h2 className="section-underline text-2xl font-semibold sm:text-3xl">{title}</h2>
        {sub && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}