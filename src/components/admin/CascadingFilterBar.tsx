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
  if (selectedRegion !== "ALL") appliedCount++;
  if (selectedDistrict !== "ALL") appliedCount++;
  if (selectedMandalam !== "ALL") appliedCount++;

  const handleReset = () => {
    setSelectedRegion("ALL");
    setSelectedDistrict("ALL");
    setSelectedMandalam("ALL");
  };

  return (
    <div className="sticky top-0 z-20 rounded-2xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur-md space-y-2.5">
      {/* Geography Scope Only Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-xs text-foreground mr-1">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <span>Geography Scope:</span>
          </div>

          {/* Region Dropdown */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 font-semibold">
            <span className="text-muted-foreground text-[11px]">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedDistrict("ALL");
                setSelectedMandalam("ALL");
              }}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
            >
              <option value="ALL">All Regions (Kerala State)</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 font-semibold">
            <span className="text-muted-foreground text-[11px]">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedMandalam("ALL");
              }}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
            >
              <option value="ALL">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Mandalam Dropdown */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 font-semibold">
            <span className="text-muted-foreground text-[11px]">Mandalam:</span>
            <select
              value={selectedMandalam}
              onChange={(e) => setSelectedMandalam(e.target.value)}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
            >
              <option value="ALL">All Mandalams</option>
              {mandalams.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 text-xs">
          {appliedCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
              {appliedCount} active scope{appliedCount > 1 ? "s" : ""}
            </span>
          )}

          {appliedCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Reset scope filter"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
