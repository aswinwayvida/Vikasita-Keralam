import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Info, Maximize2, Sparkles, BarChart3 } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

interface SchemeMetricData {
  id: string;
  name: string;
  nameMl?: string;
  views: number;
  matches: number;
  helpRequests: number;
}

const topSchemesData: SchemeMetricData[] = [
  {
    id: "SCH-1",
    name: "PM-KISAN Samman Nidhi",
    nameMl: "പി.എം-കിസാൻ സമ്മാൻ നിധി",
    views: 18450,
    matches: 12200,
    helpRequests: 3420,
  },
  {
    id: "SCH-2",
    name: "Ayushman Bharat Jan Arogya Yojana",
    nameMl: "ആയുഷ്മാൻ ഭാരത് ജൻ ആരോഗ്യ യോജന",
    views: 14200,
    matches: 9800,
    helpRequests: 2850,
  },
  {
    id: "SCH-3",
    name: "Subhiksha Keralam Agricultural Loan",
    nameMl: "സുഭിക്ഷ കേരളം കാർഷിക വായ്പ",
    views: 8900,
    matches: 5400,
    helpRequests: 1420,
  },
  {
    id: "SCH-4",
    name: "Karunya Health Insurance Scheme",
    nameMl: "കാരുണ്യ ആരോഗ്യ ഇൻഷുറൻസ് പദ്ധതി",
    views: 7600,
    matches: 4900,
    helpRequests: 1180,
  },
  {
    id: "SCH-5",
    name: "LIFE Mission Housing Scheme",
    nameMl: "ലൈഫ് മിഷൻ ഭവന നിർമ്മാണ പദ്ധതി",
    views: 6500,
    matches: 3800,
    helpRequests: 950,
  },
  {
    id: "SCH-6",
    name: "Aaswasakiranam Caregiver Allowance",
    nameMl: "ആശ്വാസകിരണം ആനുകൂല്യ പദ്ധതി",
    views: 5200,
    matches: 3200,
    helpRequests: 820,
  },
  {
    id: "SCH-7",
    name: "Karunya Suraksha Housing Subsidy",
    nameMl: "കാരുണ്യ സുരക്ഷ ഭവന സഹായ പദ്ധതി",
    views: 4800,
    matches: 2900,
    helpRequests: 740,
  },
  {
    id: "SCH-8",
    name: "Kshema Pension for Differently Abled",
    nameMl: "ഭിന്നശേഷിക്കാർക്കുള്ള ക്ഷേമ പെൻഷൻ",
    views: 4100,
    matches: 2500,
    helpRequests: 620,
  },
];

type MetricTab = "helpRequests" | "views" | "matches";

export function SchemeDemandAndEligibility() {
  const { lang } = useLang();
  const [activeMetricTab, setActiveMetricTab] = useState<MetricTab>("helpRequests");

  // Summary Totals
  const totalViews = 60850;
  const totalMatches = 39300;
  const totalHelpRequests = 10640;

  // Ratios
  const matchRate = ((totalMatches / totalViews) * 100).toFixed(1);
  const helpAfterMatchRate = ((totalHelpRequests / totalMatches) * 100).toFixed(1);

  // Sort schemes based on selected tab
  const sortedSchemes = [...topSchemesData].sort((a, b) => b[activeMetricTab] - a[activeMetricTab]);
  const maxValForTab = Math.max(...sortedSchemes.map((s) => s[activeMetricTab]));

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* CITIZEN DEMAND BY SCHEME & DEPARTMENT                                     */}
      {/* ========================================================================= */}
      <section className="w-full rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-bold text-foreground flex items-start gap-1.5 leading-snug">
                <BarChart3 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{lang === "ml" ? "പദ്ധതി അവലോകനം" : "Schemes Overview"}</span>
              </h2>
            </div>
            <Link to="/admin/schemes" className="shrink-0 whitespace-nowrap text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {/* Compact Summary KPI Strip */}
          <div className="rounded-xl border border-border bg-muted/30 p-2.5 sm:p-3 grid grid-cols-3 gap-1 sm:gap-2 text-xs divide-x divide-border/60">
            <div className="px-1 sm:px-2 space-y-0.5 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-extrabold text-muted-foreground uppercase truncate block">
                {lang === "ml" ? "കാഴ്ചകൾ" : "Scheme Views"}
              </span>
              <p className="font-display text-xs xs:text-sm sm:text-base font-bold text-foreground truncate">{totalViews.toLocaleString()}</p>
            </div>

            <div className="px-1 sm:px-2 space-y-0.5 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-extrabold text-muted-foreground uppercase truncate block">
                {lang === "ml" ? "യോഗ്യതകൾ" : "Eligibility Matches"}
              </span>
              <p className="font-display text-xs xs:text-sm sm:text-base font-bold text-emerald-600 truncate">{totalMatches.toLocaleString()}</p>
            </div>

            <div className="px-1 sm:px-2 space-y-0.5 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-extrabold text-muted-foreground uppercase truncate block">
                {lang === "ml" ? "അഭ്യർത്ഥനകൾ" : "Help Requests"}
              </span>
              <div className="flex items-baseline gap-1 whitespace-nowrap">
                <p className="font-display text-xs xs:text-sm sm:text-base font-bold text-primary shrink-0">{totalHelpRequests.toLocaleString()}</p>
                <span className="text-[9px] xs:text-[10.5px] sm:text-[11px] font-semibold text-amber-600 shrink-0">
                  {lang === "ml" ? "(6,330 തുറന്നവ)" : "(6,330 open)"}
                </span>
              </div>
            </div>
          </div>

          {/* Section Sub-Title */}
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pt-1 border-b border-border/40 pb-1">
            <span className="uppercase text-[11px] text-foreground tracking-wider font-display font-bold">
              {lang === "ml" ? "മുൻനിര 7 പദ്ധതികൾ" : "Top 7 Schemes"}
            </span>
          </div>

          {/* Clean Horizontal Ranked Bar Chart */}
          <div className="space-y-3">
            {sortedSchemes.slice(0, 7).map((sch, idx) => {
              const currentVal = sch[activeMetricTab];
              const barPercent = Math.round((currentVal / maxValForTab) * 100);
              const displayName = lang === "ml" && sch.nameMl ? sch.nameMl : sch.name;

              return (
                <Link
                  key={sch.id}
                  to="/admin/schemes/$schemeId"
                  params={{ schemeId: sch.id }}
                  className="group block rounded-xl border border-border/60 bg-background p-3 hover:border-primary/50 hover:bg-muted/30 transition-all space-y-2"
                >
                  <div className="flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 text-xs">
                    {/* Scheme Name & Rank */}
                    <div className="sm:col-span-6 flex items-center justify-between sm:justify-start gap-2 font-bold text-foreground group-hover:text-primary transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground font-mono shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                          {displayName}
                        </span>
                      </div>
                      <span className="sm:hidden font-mono font-bold text-foreground shrink-0 ml-2">
                        {currentVal.toLocaleString()}
                      </span>
                    </div>

                    {/* Value on Desktop */}
                    <div className="hidden sm:block sm:col-span-2 text-right font-mono font-bold text-foreground">
                      {currentVal.toLocaleString()}
                    </div>

                    {/* Progress Bar */}
                    <div className="sm:col-span-4 w-full">
                      <div className="h-2 sm:h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Subtle Funnel Text */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-muted-foreground pt-1.5 border-t border-border/30">
                    <div className="flex items-center gap-1.5 flex-wrap text-muted-foreground">
                      <span>{(sch.views / 1000).toFixed(1)}K views</span>
                      <span className="text-muted-foreground/60">&rarr;</span>
                      <span>{(sch.matches / 1000).toFixed(1)}K matches</span>
                      <span className="text-muted-foreground/60">&rarr;</span>
                      <span>{(sch.helpRequests / 1000).toFixed(1)}K help requests</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </section>
    </div>
  );
}
