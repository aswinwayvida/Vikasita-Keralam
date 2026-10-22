import React from "react";
import { Building2, ShieldCheck, Filter, UserCheck } from "lucide-react";
import {
  OrgLevel,
  UserRole,
  roleConfigs,
  orgScopeLevels,
} from "@/data/admin-dashboard-metrics";

interface AdminScopeSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedLevel: OrgLevel;
  onLevelChange: (level: OrgLevel) => void;
  selectedUnitId: string;
  onUnitChange: (unitId: string) => void;
}

export function AdminScopeSelector({
  currentRole,
  onRoleChange,
  selectedLevel,
  onLevelChange,
  selectedUnitId,
  onUnitChange,
}: AdminScopeSelectorProps) {
  const activeRoleConfig = roleConfigs[currentRole];
  const availableLevelOptions = orgScopeLevels.filter((lvl) =>
    activeRoleConfig.allowedLevels.includes(lvl.level)
  );

  const currentLevelConfig =
    orgScopeLevels.find((l) => l.level === selectedLevel) || availableLevelOptions[0];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
      {/* Role Selector Badge */}
      <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-1.5 text-xs font-semibold">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">Role:</span>
        <select
          value={currentRole}
          onChange={(e) => {
            const newRole = e.target.value as UserRole;
            onRoleChange(newRole);
            const newConfig = roleConfigs[newRole];
            onLevelChange(newConfig.defaultLevel);
            const defaultUnits = orgScopeLevels.find((l) => l.level === newConfig.defaultLevel)?.units || [];
            if (defaultUnits.length > 0) {
              onUnitChange(defaultUnits[0].id);
            }
          }}
          className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
        >
          {Object.values(roleConfigs).map((r) => (
            <option key={r.role} value={r.role}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-4 w-[1px] bg-border hidden sm:block" />

      {/* Level Selector Dropdown */}
      <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-1.5 text-xs font-semibold">
        <Building2 className="h-4 w-4 text-secondary" />
        <span className="text-muted-foreground">Org Level:</span>
        <select
          value={selectedLevel}
          onChange={(e) => {
            const newLvl = e.target.value as OrgLevel;
            onLevelChange(newLvl);
            const unitsForLvl = orgScopeLevels.find((l) => l.level === newLvl)?.units || [];
            if (unitsForLvl.length > 0) {
              onUnitChange(unitsForLvl[0].id);
            }
          }}
          className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
        >
          {availableLevelOptions.map((lvl) => (
            <option key={lvl.level} value={lvl.level}>
              {lvl.label}
            </option>
          ))}
        </select>
      </div>

      {/* Unit Selector Dropdown */}
      <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.04] px-3 py-1.5 text-xs font-semibold text-primary">
        <Filter className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="text-muted-foreground text-[11px] uppercase tracking-wider">Unit:</span>
        <select
          value={selectedUnitId}
          onChange={(e) => onUnitChange(e.target.value)}
          className="w-full bg-transparent font-bold text-foreground outline-none cursor-pointer truncate"
        >
          {currentLevelConfig.units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
