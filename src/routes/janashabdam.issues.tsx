import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { issues, type IssueCategory, type IssueStatus } from "@/data/issues";
import { districts } from "@/data/geo";
import { IssueCard } from "@/components/public/IssueCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

export const Route = createFileRoute("/janashabdam/issues")({
  head: () => ({ meta: [{ title: "പൊതു പ്രശ്നങ്ങൾ · Public issues" }] }),
  component: PublicIssues,
});

function PublicIssues() {
  const { lang, t } = useLang();
  const cats = Object.keys(t.categories) as IssueCategory[];
  const statuses: IssueStatus[] = ["submitted", "verified", "escalated", "public_campaign", "resolved"];
  const [category, setCategory] = useState<string>("all");
  const [district, setDistrict] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<"recent" | "support">("recent");

  const filtered = useMemo(() => {
    let arr = issues.filter((i) => i.publicVisible);
    if (category !== "all") arr = arr.filter((i) => i.category === category);
    if (district !== "all") arr = arr.filter((i) => i.districtId === district);
    if (status !== "all") arr = arr.filter((i) => i.status === status);
    arr = [...arr].sort((a, b) => sort === "recent" ? +new Date(b.createdAt) - +new Date(a.createdAt) : b.supportCount - a.supportCount);
    return arr;
  }, [category, district, status, sort]);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeading
          eyebrow="ജനശബ്ദം"
          title={lang === "ml" ? "പൊതു പ്രശ്നങ്ങൾ" : "Public issues"}
          sub={t.janashabdam.publicNote}
        />

        <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-4">
          <FilterSelect label={t.janashabdam.form.category} value={category} setValue={setCategory} options={[["all", t.common.all], ...cats.map((c) => [c, t.categories[c]] as [string, string])]} />
          <FilterSelect label={t.janashabdam.form.district} value={district} setValue={setDistrict} options={[["all", t.common.all], ...districts.map((d) => [d.id, d[lang]] as [string, string])]} />
          <FilterSelect label={lang === "ml" ? "സ്റ്റാറ്റസ്" : "Status"} value={status} setValue={setStatus} options={[["all", t.common.all], ...statuses.map((s) => [s, t.status[s]] as [string, string])]} />
          <FilterSelect label={lang === "ml" ? "സോർട്ട്" : "Sort"} value={sort} setValue={(v) => setSort(v as "recent" | "support")} options={[["recent", lang === "ml" ? "സമീപകാലം" : "Most recent"], ["support", lang === "ml" ? "ഏറ്റവും പിന്തുണ" : "Most supported"]]} />
        </div>

        <p className="mb-4 text-xs text-muted-foreground">
          {filtered.length} {lang === "ml" ? "പ്രശ്നങ്ങൾ കാണിക്കുന്നു" : "issues showing"}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">{t.common.noData}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((i) => <IssueCard key={i.id} issue={i} />)}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function FilterSelect({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <div className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}