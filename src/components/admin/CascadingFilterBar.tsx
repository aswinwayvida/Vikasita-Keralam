import React, { useState } from "react";
import { Search, RotateCcw, ShieldCheck, ChevronRight, Building2, Filter } from "lucide-react";
import { orgHierarchyData, UserRole, roleConfigs } from "@/data/admin-dashboard-metrics";

interface CascadingFilterBarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  dateRange: string;
  setDateRange: (val: string) => void;
  selectedScheme: string;
  setSelectedScheme: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedRegion: string;
  setSelectedRegion: (val: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (val: string) => void;
  selectedMandalam: string;
  setSelectedMandalam: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export function CascadingFilterBar({
  currentRole,
  onRoleChange,
  dateRange,
  setDateRange,
  selectedScheme,
  setSelectedScheme,
  selectedStatus,
  setSelectedStatus,
  selectedRegion,
  setSelectedRegion,
  selectedDistrict,
  setSelectedDistrict,
  selectedMandalam,
  setSelectedMandalam,
  searchQuery,
  setSearchQuery,
}: CascadingFilterBarProps) {
  const [showOrgPanel, setShowOrgPanel] = useState(false);

  const regions = orgHierarchyData.filter((n) => n.level === "REGION");
  
  const districts = selectedRegion === "ALL"
    ? orgHierarchyData.filter((n) => n.level === "DISTRICT")
    : orgHierarchyData.filter((n) => n.level === "DISTRICT" && n.parentId === selectedRegion);

  const mandalams = selectedDistrict === "ALL"
    ? (selectedRegion === "ALL" 
        ? orgHierarchyData.filter((n) => n.level === "MANDALAM")
        : orgHierarchyData.filter((n) => n.level === "MANDALAM" && districts.some(d => d.id === n.parentId)))
    : orgHierarchyData.filter((n) => n.level === "MANDALAM" && n.parentId === selectedDistrict);

  // Active breadcrumb label
  const regionObj = regions.find((r) => r.id === selectedRegion);
  const districtObj = districts.find((d) => d.id === selectedDistrict);
  const mandalamObj = mandalams.find((m) => m.id === selectedMandalam);

  let activeOrgBreadcrumb = "Kerala State";
  if (regionObj) activeOrgBreadcrumb += ` > ${regionObj.name.split(" ")[0]}`;
  if (districtObj) activeOrgBreadcrumb += ` > ${districtObj.name}`;
  if (mandalamObj) activeOrgBreadcrumb += ` > ${mandalamObj.name}`;

  let appliedCount = 0;
  if (dateRange !== "30d") appliedCount++;
  if (selectedScheme !== "ALL") appliedCount++;
  if (selectedStatus !== "ALL") appliedCount++;
  if (selectedRegion !== "ALL") appliedCount++;
  if (searchQuery.trim() !== "") appliedCount++;

  const handleReset = () => {
    setDateRange("30d");
    setSelectedScheme("ALL");
    setSelectedStatus("ALL");
    setSelectedRegion("ALL");
    setSelectedDistrict("ALL");
    setSelectedMandalam("ALL");
    setSearchQuery("");
  };

  return (
    <div className="sticky top-0 z-20 rounded-2xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur-md space-y-2.5">
      {/* Reduced Executive Filter Bar (4 Core Dropdowns + Search) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Box */}
          <div className="relative min-w-[200px] sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search citizen, case ID, scheme or org"
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Date Range Dropdown */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 font-semibold">
            <span className="text-muted-foreground text-[11px]">Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>

          {/* Scheme Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 font-semibold max-w-[180px]">
            <span className="text-muted-foreground text-[11px]">Scheme:</span>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer truncate"
            >
              <option value="ALL">All Schemes</option>
              <option value="SCH-1">PM-KISAN</option>
              <option value="SCH-2">Ayushman Bharat</option>
              <option value="SCH-3">Subhiksha Keralam</option>
              <option value="SCH-4">Karunya Health</option>
              <option value="SCH-5">LIFE Mission</option>
            </select>
          </div>

          {/* Case Status Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 font-semibold">
            <span className="text-muted-foreground text-[11px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING_FOLLOWUP">Pending Follow-up</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Breadcrumb Organisation Hierarchy Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowOrgPanel(!showOrgPanel)}
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/[0.04] px-3 py-1.5 font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-[220px]">{activeOrgBreadcrumb}</span>
              <ChevronRight className={`h-3 w-3 transition-transform ${showOrgPanel ? "rotate-90" : ""}`} />
            </button>

            {/* Quick Organisation Breadcrumb Selector Panel */}
            {showOrgPanel && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card p-3 shadow-xl z-30 space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-1.5 text-[11px] font-bold">
                  <span className="text-foreground">Organisation Hierarchy Scope</span>
                  <button onClick={() => setShowOrgPanel(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Region</label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedDistrict("ALL");
                        setSelectedMandalam("ALL");
                      }}
                      className="w-full rounded-lg border border-border bg-background p-1.5 font-semibold text-foreground"
                    >
                      <option value="ALL">All Regions (Kerala State)</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">District</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setSelectedMandalam("ALL");
                      }}
                      className="w-full rounded-lg border border-border bg-background p-1.5 font-semibold text-foreground"
                    >
                      <option value="ALL">All Districts</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Mandalam</label>
                    <select
                      value={selectedMandalam}
                      onChange={(e) => setSelectedMandalam(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-1.5 font-semibold text-foreground"
                    >
                      <option value="ALL">All Mandalams</option>
                      {mandalams.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setShowOrgPanel(false)}
                  className="w-full rounded-xl bg-primary py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Apply Scope Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 text-xs">
          {appliedCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
              {appliedCount} active filter{appliedCount > 1 ? "s" : ""}
            </span>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
