import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy, Filter, MapPin, Award, CheckCircle2, ChevronDown } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { districts, constituencies, getDistrictName, getConstituencyName } from "@/data/geo";
import { getFilteredLeaderboard } from "@/data/leaderboard";
import { LeaderboardTop3Podium } from "./LeaderboardTop3Podium";

interface LeaderboardCardProps {
  initialDistrict?: string;
  initialConstituency?: string;
}

export function LeaderboardCard({ initialDistrict = "all", initialConstituency = "all" }: LeaderboardCardProps) {
  const { lang } = useLang();
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [selectedConstituency, setSelectedConstituency] = useState<string>(initialConstituency);

  // Sync state when initial props change from parent filter bar
  React.useEffect(() => {
    setSelectedDistrict(initialDistrict);
  }, [initialDistrict]);

  React.useEffect(() => {
    setSelectedConstituency(initialConstituency);
  }, [initialConstituency]);

  // Available constituencies dependent on selected district
  const filteredConstituencies = useMemo(() => {
    if (selectedDistrict === "all") {
      return constituencies;
    }
    return constituencies.filter((c) => c.districtId === selectedDistrict);
  }, [selectedDistrict]);

  // Handle District change
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    // Reset constituency when district changes
    setSelectedConstituency("all");
  };

  // Get filtered leaders
  const leaderboardList = useMemo(() => {
    return getFilteredLeaderboard(selectedDistrict, selectedConstituency);
  }, [selectedDistrict, selectedConstituency]);

  // Top 5 leaders to display
  const topLeaders = leaderboardList.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2 leading-snug">
            <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
            <span>{lang === "ml" ? "ലീഡർബോർഡ്" : "Leaderboard"}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lang === "ml" 
              ? "14 ജില്ലകളിലെയും 140 മണ്ഡലങ്ങളിലെയും തത്സമയ വോളണ്ടിയർ പ്രകടനം" 
              : "Real-time volunteer performance across 14 Districts & 140 Mandalams"}
          </p>
        </div>
        <Link 
          to="/admin/volunteers" 
          className="shrink-0 whitespace-nowrap text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>{lang === "ml" ? "എല്ലാം കാണുക" : "View All"}</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Filter Dropdowns (District 14 & Mandalam 140) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-muted/40 p-3 rounded-xl border border-border/60">
        {/* District Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span>{lang === "ml" ? "ജില്ല തിരഞ്ഞെടുക്കുക (14)" : "Select District (14)"}</span>
          </label>
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-primary pr-8 cursor-pointer"
            >
              <option value="all">
                {lang === "ml" ? "എല്ലാ ജില്ലകളും (14)" : "All Districts (14)"}
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d[lang]} ({cCountForDistrict(d.id)} {lang === "ml" ? "മണ്ഡലങ്ങൾ" : "Mandalams"})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Mandalam / Constituency Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Filter className="h-3 w-3 text-primary shrink-0" />
            <span>
              {lang === "ml" 
                ? `മണ്ഡലം (${filteredConstituencies.length})` 
                : `Select Mandalam (${filteredConstituencies.length})`}
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedConstituency}
              onChange={(e) => setSelectedConstituency(e.target.value)}
              className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-primary pr-8 cursor-pointer"
            >
              <option value="all">
                {selectedDistrict === "all" 
                  ? (lang === "ml" ? "എല്ലാ മണ്ഡലങ്ങളും (140)" : "All Mandalams (140)") 
                  : (lang === "ml" ? "ഈ ജില്ലയിലെ എല്ലാ മണ്ഡലങ്ങളും" : "All Mandalams in District")}
              </option>
              {filteredConstituencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c[lang]}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Indicator Pill */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-1">
        <span className="flex items-center gap-1">
          <Award className="h-3.5 w-3.5 text-amber-500" />
          <span>
            {selectedDistrict === "all" && selectedConstituency === "all" ? (
              lang === "ml" ? "കേരളത്തിലെ മൊത്തം ലീഡർമാർ" : "Statewide Top Leaders"
            ) : selectedConstituency !== "all" ? (
              `${getConstituencyName(selectedConstituency, lang)} ${lang === "ml" ? "മണ്ഡലം" : "Mandalam"}`
            ) : (
              `${getDistrictName(selectedDistrict, lang)} ${lang === "ml" ? "ജില്ല" : "District"}`
            )}
          </span>
        </span>
        <span className="font-bold text-foreground">
          {leaderboardList.length} {lang === "ml" ? "അംഗങ്ങൾ" : "Volunteers"}
        </span>
      </div>

      {/* Top 3 Podium Visual */}
      {leaderboardList.length >= 3 && (
        <div className="bg-muted/30 p-2 rounded-xl border border-border/50 overflow-hidden">
          <LeaderboardTop3Podium
            rank1={{
              rank: 1,
              name: leaderboardList[0].name,
              val: leaderboardList[0].points.toString(),
              avatarUrl: leaderboardList[0].avatarUrl,
            }}
            rank2={{
              rank: 2,
              name: leaderboardList[1].name,
              val: leaderboardList[1].points.toString(),
              avatarUrl: leaderboardList[1].avatarUrl,
            }}
            rank3={{
              rank: 3,
              name: leaderboardList[2].name,
              val: leaderboardList[2].points.toString(),
              avatarUrl: leaderboardList[2].avatarUrl,
            }}
            category="workers"
            lang={lang}
          />
        </div>
      )}

      {/* Leaderboard Entries List */}
      <div className="space-y-2 text-xs">
        {topLeaders.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-xs rounded-xl border border-dashed border-border">
            {lang === "ml" ? "ഈ മണ്ഡലത്തിൽ ലീഡർമാരെ ലഭ്യമല്ല" : "No leaders found for this selection."}
          </div>
        ) : (
          topLeaders.map((leader, index) => {
            const rank = index + 1;
            const distName = getDistrictName(leader.districtId, lang);
            const mandalamName = getConstituencyName(leader.constituencyId, lang);

            // Badge styling for top ranks
            let rankBadge = "bg-muted font-bold text-muted-foreground";
            let borderClass = "hover:border-primary/40";

            if (rank === 1) {
              rankBadge = "bg-amber-500/20 text-amber-700 font-extrabold border border-amber-500/40";
              borderClass = "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60";
            } else if (rank === 2) {
              rankBadge = "bg-slate-300/40 text-slate-700 font-bold border border-slate-400/40";
              borderClass = "hover:border-slate-400/50";
            } else if (rank === 3) {
              rankBadge = "bg-amber-700/20 text-amber-800 font-bold border border-amber-700/30";
              borderClass = "hover:border-amber-700/40";
            }

            return (
              <div
                key={leader.id}
                className={`flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/80 transition-all ${borderClass}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs shrink-0 ${rankBadge}`}>
                    #{rank}
                  </span>
                  {leader.avatarUrl && (
                    <img
                      src={leader.avatarUrl}
                      alt={leader.name}
                      className="h-8 w-8 rounded-full object-cover border border-border shrink-0 shadow-2xs"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-foreground block leading-tight truncate">
                      {leader.name}
                    </span>
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 flex-wrap leading-tight mt-0.5">
                      <span className="font-extrabold text-primary">
                        {lang === "ml" ? leader.roleMl : leader.roleEn}
                      </span>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="truncate">
                        {mandalamName}, {distName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 block text-xs sm:text-sm">
                    {leader.points.toLocaleString()} pts
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>{leader.casesResolved} {lang === "ml" ? "കേസുകൾ" : "resolved"}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function cCountForDistrict(districtId: string): number {
  return constituencies.filter((c) => c.districtId === districtId).length;
}
