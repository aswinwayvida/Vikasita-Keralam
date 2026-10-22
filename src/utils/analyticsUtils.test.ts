// @ts-nocheck
import { describe, it, expect } from "vitest";
import {
  calculatePercentage,
  calculateGrowth,
  calculateBeneficiaryRate,
  calculateResolutionRate,
  reconcileRequestMetrics,
  reconcileSchemeCounts,
  countUnique,
  validateAnalyticsQA,
} from "./analyticsUtils";

describe("analyticsUtils tests", () => {
  it("calculates percentages safely", () => {
    expect(calculatePercentage(48250, 142850)).toBe(33.8);
    expect(calculatePercentage(10566, 12450)).toBe(84.9);
    expect(calculatePercentage(0, 100)).toBe(0);
    expect(calculatePercentage(10, 0)).toBe(0);
    expect(calculatePercentage(NaN, 100)).toBe(0);
  });

  it("calculates growth correctly and handles edge cases", () => {
    expect(calculateGrowth(120, 100)).toEqual({
      percentage: 20,
      formatted: "+20.0%",
      type: "increase",
    });
    expect(calculateGrowth(80, 100)).toEqual({
      percentage: -20,
      formatted: "-20.0%",
      type: "decrease",
    });
    expect(calculateGrowth(50, 0)).toEqual({
      percentage: null,
      formatted: "New",
      type: "new",
    });
    expect(calculateGrowth(0, 0)).toEqual({
      percentage: 0,
      formatted: "0.0%",
      type: "neutral",
    });
  });

  it("reconciles main dashboard KPIs consistently", () => {
    const mainKpis = {
      totalCitizens: 142850,
      totalBeneficiaries: 48250,
      beneficiaryRate: calculateBeneficiaryRate(48250, 142850),
      totalRequests: 12450,
      openRequests: 1884,
      resolvedRequests: 10566,
      resolutionRate: calculateResolutionRate(10566, 12450),
    };

    expect(mainKpis.beneficiaryRate).toBe(33.8);
    expect(mainKpis.resolutionRate).toBe(84.9);

    const reconciled = reconcileRequestMetrics(12450, 1884);
    expect(reconciled.resolvedRequests).toBe(10566);
    expect(reconciled.resolutionRate).toBe(84.9);

    const warnings = validateAnalyticsQA(mainKpis);
    expect(warnings).toEqual([]);
  });

  it("reconciles scheme counts correctly", () => {
    const schemes = reconcileSchemeCounts(85, 43);
    expect(schemes.totalSchemes).toBe(128);
    expect(schemes.stateSchemes).toBe(85);
    expect(schemes.centralSchemes).toBe(43);
  });

  it("counts unique values accurately", () => {
    const sample = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
      { id: "1", name: "Alice Duplicate" },
      { id: null, name: "Empty" },
    ];
    expect(countUnique(sample, "id")).toBe(2);
  });
});
