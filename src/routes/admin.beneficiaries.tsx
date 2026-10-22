import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { HeartHandshake, Clock3, FileText, Users, Filter, Download, LayoutGrid, List, UserRoundCheck, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/admin/beneficiaries")({
  head: () => ({ meta: [{ title: "Beneficiaries · Admin" }] }),
  component: BeneficiariesPage,
});

const mockBeneficiaries = [
  { id: "BEN-8921", name: "Soman P", category: "Senior Citizen", location: "Kazhakkoottam, TVM", scheme: "Vayoshreshtha Pension", status: "Verified", date: "2026-10-04" },
  { id: "BEN-8922", name: "Lakshmi Amma", category: "Healthcare", location: "Vattiyoorkavu, TVM", scheme: "Karunya Health Insurance", status: "Verified", date: "2026-10-03" },
  { id: "BEN-8923", name: "Abdul Rahman", category: "Fisherfolk Support", location: "Kollam Port, KLM", scheme: "Matsya Samridhi Scheme", status: "Verified", date: "2026-10-05" },
  { id: "BEN-8924", name: "Sunitha Kumari", category: "Women & SHG", location: "Kottayam East, KTM", scheme: "Kudumbashree Enterprise Aid", status: "Verified", date: "2026-10-02" },
  { id: "BEN-8925", name: "K. Krishnan", category: "Farmers", location: "Palakkad North, PKD", scheme: "PM Kisan Samman Nidhi", status: "Verified", date: "2026-10-01" },
  { id: "BEN-8926", name: "Ananya Ramesh", category: "Youth & Students", location: "Tripunithura, EKM", scheme: "Pratibha Education Assistance", status: "Verified", date: "2026-10-05" },
  { id: "BEN-8927", name: "Joseph K", category: "Housing", location: "Chathannoor, KLM", scheme: "LIFE Mission Housing Title", status: "Verified", date: "2026-09-29" },
  { id: "BEN-8928", name: "Radhamani V", category: "Weavers & Artisans", location: "Balaramapuram, TVM", scheme: "Handloom Worker Subsidy", status: "Verified", date: "2026-09-28" },
];

function BeneficiariesPage() {
  const { lang } = useLang();
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return "table";
    }
    return "cards";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewMode(window.innerWidth >= 768 ? "table" : "cards");
    }
  }, []);

  function toggleSelectAll() {
    if (selectedIds.size === mockBeneficiaries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(mockBeneficiaries.map((r) => r.id)));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Merged Single Section Container */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-5">
        
        {/* Top Header Row with Filter & Export Buttons on the Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {lang === "ml" ? "ഗുണഭോക്തൃ പട്ടിക & സ്റ്റാറ്റസ്" : "Beneficiary Directory & Overview"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {lang === "ml" ? "48,250 റജിസ്റ്റർ ചെയ്ത ഗുണഭോക്താക്കളുടെ തത്സമയ സ്റ്റാറ്റസ്" : "Real-time verification status for 48,250 registered beneficiaries"}
            </p>
          </div>

          {/* Filter & Export Buttons on the Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5 max-w-full sm:ml-auto shrink-0">
            {/* View Mode Toggle Switch */}
            <div className="flex items-center rounded-xl border border-border bg-background p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={lang === "ml" ? "പട്ടിക വ്യൂ" : "Table View"}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lang === "ml" ? "പട്ടിക" : "List"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === "cards"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={lang === "ml" ? "കാർഡ് വ്യൂ" : "Card View"}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lang === "ml" ? "കാർഡ്" : "Cards"}</span>
              </button>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-8 rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
            >
              <option value="today">{lang === "ml" ? "ഇന്ന്" : "Today"}</option>
              <option value="7days">{lang === "ml" ? "7 ദിവസങ്ങൾ" : "7 Days"}</option>
              <option value="30days">{lang === "ml" ? "30 ദിവസങ്ങൾ" : "30 Days"}</option>
              <option value="60days">{lang === "ml" ? "60 ദിവസങ്ങൾ" : "60 Days"}</option>
              <option value="1year">{lang === "ml" ? "1 വർഷം" : "1 Year"}</option>
            </select>
            <button className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shrink-0">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {lang === "ml" ? "ഫിൽട്ടറുകൾ" : "Filter"}
            </button>
            <button
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shrink-0"
              title={lang === "ml" ? "എക്സ്പോർട്ട്" : "Export"}
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">{lang === "ml" ? "എക്സ്പോർട്ട്" : "Export"}</span>
            </button>
          </div>
        </div>

        {/* Embedded Status KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Total Requests */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "ആകെ അപേക്ഷകൾ" : "TOTAL REQUESTS"}</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-foreground">66,600</p>
          </div>

          {/* Card 2: Total Beneficiaries */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "ആകെ ഗുണഭോക്താക്കൾ" : "TOTAL BENEFICIARIES"}</span>
              <HeartHandshake className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-foreground">48,250</p>
          </div>

          {/* Card 3: Under Processing */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">{lang === "ml" ? "പ്രോസസ്സിംഗിൽ" : "UNDER PROCESSING"}</span>
              <Clock3 className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-lg sm:text-xl font-mono font-extrabold text-amber-600">18,350</p>
          </div>

          {/* Card 4: Gender Distribution */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-3.5 space-y-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase truncate">{lang === "ml" ? "സ്ത്രീ-പുരുഷ അനുപാതം" : "GENDER DISTRIBUTION"}</span>
              <Users className="h-4 w-4 text-sky-600 shrink-0" />
            </div>
            <p className="text-sm xs:text-base sm:text-xl font-mono font-extrabold text-foreground whitespace-nowrap tracking-tight">53% F · 46% M</p>
            <span className="text-[10px] text-muted-foreground font-semibold block truncate">{lang === "ml" ? "1% മറ്റ് വിഭാഗം" : "1% Other"}</span>
          </div>
        </div>

        {/* Selected Beneficiaries Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-2.5">
            <span className="mr-1 text-xs font-semibold">{selectedIds.size} selected</span>
            <Button type="button" size="sm" variant="outline">
              <UserRoundCheck className="h-3.5 w-3.5 mr-1" /> Assign
            </Button>
            <Button type="button" size="sm" variant="outline">
              <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
            </Button>
            <Button type="button" size="sm" variant="outline">
              <Mail className="h-3.5 w-3.5 mr-1" /> Email
            </Button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}

        {/* Cards View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {mockBeneficiaries.map((b) => {
              const isSelected = selectedIds.has(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all ${
                    isSelected ? "border-primary/50 bg-primary/[0.04]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectOne(b.id)}
                        aria-label={`Select beneficiary ${b.name}`}
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate">{b.name}</h4>
                        <span className="text-[11px] font-semibold text-muted-foreground block truncate">{b.category}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                      {b.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary">{b.scheme}</p>
                    <p className="text-xs text-muted-foreground">{b.location}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-md font-semibold text-foreground">
                      {b.id}
                    </span>
                    <span className="font-mono text-[11px]">Verified: {b.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Data Table View */}
        {viewMode === "table" && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
                <tr>
                  <th className="w-10 p-3">
                    <Checkbox
                      checked={selectedIds.size === mockBeneficiaries.length && mockBeneficiaries.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all beneficiaries"
                    />
                  </th>
                  <th className="p-3">{lang === "ml" ? "ഗുണഭോക്താവ്" : "BENEFICIARY NAME"}</th>
                  <th className="p-3">{lang === "ml" ? "വിഭാഗം" : "CATEGORY"}</th>
                  <th className="p-3">{lang === "ml" ? "സ്ഥലം" : "LOCATION"}</th>
                  <th className="p-3">{lang === "ml" ? "പദ്ധതി" : "SCHEME"}</th>
                  <th className="p-3">{lang === "ml" ? "സ്റ്റാറ്റസ്" : "STATUS"}</th>
                  <th className="p-3 text-right">{lang === "ml" ? "തീയതി" : "VERIFIED DATE"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {mockBeneficiaries.map((b) => {
                  const isSelected = selectedIds.has(b.id);
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSelected ? "bg-primary/[0.04]" : ""
                      }`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectOne(b.id)}
                          aria-label={`Select beneficiary ${b.name}`}
                        />
                      </td>
                      <td className="p-3 font-bold text-foreground">{b.name}</td>
                      <td className="p-3 text-muted-foreground">{b.category}</td>
                      <td className="p-3 text-muted-foreground">{b.location}</td>
                      <td className="p-3 font-semibold text-primary">{b.scheme}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{b.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
