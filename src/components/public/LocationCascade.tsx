import { districts, constituencies, panchayats, wards } from "@/data/geo";
import { useLang } from "@/i18n/LanguageProvider";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type LocValue = { district?: string; constituency?: string; panchayat?: string; ward?: string };

export function LocationCascade({ value, onChange }: { value: LocValue; onChange: (v: LocValue) => void }) {
  const { lang, t } = useLang();
  const cs = constituencies.filter((c) => c.districtId === value.district);
  const ps = panchayats.filter((p) => p.constituencyId === value.constituency);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label className="mb-1.5 block text-xs font-medium">{t.janashabdam.form.district} <span className="text-destructive">*</span></Label>
        <Select value={value.district} onValueChange={(v) => onChange({ district: v })}>
          <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
          <SelectContent>{districts.map((d) => <SelectItem key={d.id} value={d.id}>{d[lang]}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-medium">{t.janashabdam.form.constituency} <span className="text-destructive">*</span></Label>
        <Select value={value.constituency} onValueChange={(v) => onChange({ ...value, constituency: v, panchayat: undefined, ward: undefined })} disabled={!value.district}>
          <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
          <SelectContent>{cs.map((c) => <SelectItem key={c.id} value={c.id}>{c[lang]}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-medium">{t.janashabdam.form.panchayat} <span className="text-destructive">*</span></Label>
        <Select value={value.panchayat} onValueChange={(v) => onChange({ ...value, panchayat: v, ward: undefined })} disabled={!value.constituency}>
          <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
          <SelectContent>{ps.map((p) => <SelectItem key={p.id} value={p.id}>{p[lang]} <span className="ml-1 text-xs text-muted-foreground">({p.type})</span></SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-medium">{t.janashabdam.form.ward} <span className="text-destructive">*</span></Label>
        <Select value={value.ward} onValueChange={(v) => onChange({ ...value, ward: v })} disabled={!value.panchayat}>
          <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
          <SelectContent>{wards.map((w) => <SelectItem key={w.id} value={w.label}>{lang === "ml" ? `വാർഡ് ${w.label}` : `Ward ${w.label}`}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}