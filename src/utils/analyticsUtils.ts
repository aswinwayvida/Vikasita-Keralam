/**
 * Central Analytics Utilities for Vikasita Keralam Admin Platform
 * Provides pure, safe, mathematically sound analytics functions, formulas, and reconciliation rules.
 */

export interface GrowthResult {
  percentage: number | null;
  formatted: string;
  type: "increase" | "decrease" | "neutral" | "new";
}

/**
 * Safely calculates percentage given a numerator and denominator.
 * Returns 0 if denominator <= 0 or if values are invalid (NaN / Infinity).
 */
export function calculatePercentage(
  numerator: number,
  denominator: number,
  decimals: number = 1
): number {
  if (
    typeof numerator !== "number" ||
    typeof denominator !== "number" ||
    isNaN(numerator) ||
    isNaN(denominator) ||
    !isFinite(numerator) ||
    !isFinite(denominator) ||
    denominator <= 0
  ) {
    return 0;
  }
  const result = (numerator / denominator) * 100;
  const factor = Math.pow(10, decimals);
  return Math.round(result * factor) / factor;
}

/**
 * Safely calculates period-over-period percentage growth.
 * Handles edge cases:
 * - previous <= 0 and current > 0 -> type: 'new', formatted: 'New'
 * - previous <= 0 and current === 0 -> type: 'neutral', formatted: '0.0%'
 */
export function calculateGrowth(
  current: number,
  previous: number,
  decimals: number = 1
): GrowthResult {
  if (
    typeof current !== "number" ||
    typeof previous !== "number" ||
    isNaN(current) ||
    isNaN(previous) ||
    !isFinite(current) ||
    !isFinite(previous)
  ) {
    return { percentage: 0, formatted: "0.0%", type: "neutral" };
  }

  if (previous <= 0) {
    if (current > 0) {
      return { percentage: null, formatted: "New", type: "new" };
    }
    return { percentage: 0, formatted: "0.0%", type: "neutral" };
  }

  const rawGrowth = ((current - previous) / previous) * 100;
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(rawGrowth * factor) / factor;

  if (rounded > 0) {
    return {
      percentage: rounded,
      formatted: `+${rounded.toFixed(decimals)}%`,
      type: "increase",
    };
  } else if (rounded < 0) {
    return {
      percentage: rounded,
      formatted: `${rounded.toFixed(decimals)}%`,
      type: "decrease",
    };
  }

  return { percentage: 0, formatted: "0.0%", type: "neutral" };
}

/**
 * Calculates Beneficiary Rate (% of citizens receiving benefits).
 * Formula: (Total Beneficiaries / Total Citizens) * 100
 */
export function calculateBeneficiaryRate(
  totalBeneficiaries: number,
  totalCitizens: number,
  decimals: number = 1
): number {
  return calculatePercentage(totalBeneficiaries, totalCitizens, decimals);
}

/**
 * Calculates Request Resolution Rate (% of requests resolved).
 * Formula: (Resolved Requests / Total Requests) * 100
 */
export function calculateResolutionRate(
  resolvedRequests: number,
  totalRequests: number,
  decimals: number = 1
): number {
  return calculatePercentage(resolvedRequests, totalRequests, decimals);
}

/**
 * Reconciles request status metrics.
 * Ensures: Total = Open + Resolved (when only 2 statuses exist)
 * or Resolved = Total - Open.
 */
export function reconcileRequestMetrics(
  totalRequests: number,
  openRequests: number,
  providedResolved?: number
): {
  totalRequests: number;
  openRequests: number;
  resolvedRequests: number;
  resolutionRate: number;
} {
  const safeTotal = Math.max(0, totalRequests || 0);
  const safeOpen = Math.max(0, Math.min(safeTotal, openRequests || 0));
  const resolvedRequests =
    providedResolved !== undefined
      ? Math.max(0, providedResolved)
      : safeTotal - safeOpen;
  const resolutionRate = calculateResolutionRate(resolvedRequests, safeTotal);

  return {
    totalRequests: safeTotal,
    openRequests: safeOpen,
    resolvedRequests,
    resolutionRate,
  };
}

/**
 * Reconciles scheme origin counts.
 * Ensures Total Schemes = State Schemes + Central Schemes
 */
export function reconcileSchemeCounts(
  stateSchemes: number,
  centralSchemes: number
): {
  stateSchemes: number;
  centralSchemes: number;
  totalSchemes: number;
} {
  const safeState = Math.max(0, stateSchemes || 0);
  const safeCentral = Math.max(0, centralSchemes || 0);
  return {
    stateSchemes: safeState,
    centralSchemes: safeCentral,
    totalSchemes: safeState + safeCentral,
  };
}

/**
 * Counts unique non-null values in an array by key or selector function.
 */
export function countUnique<T>(
  items: T[],
  keyOrSelector: keyof T | ((item: T) => any)
): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const set = new Set<any>();

  for (const item of items) {
    if (!item) continue;
    const val =
      typeof keyOrSelector === "function"
        ? keyOrSelector(item)
        : item[keyOrSelector];
    if (val !== null && val !== undefined && val !== "") {
      set.add(val);
    }
  }

  return set.size;
}

/**
 * Development / QA check helper to validate key analytics constraints.
 * Returns an array of warning messages if any constraint fails.
 */
export function validateAnalyticsQA(metrics: {
  totalCitizens?: number;
  totalBeneficiaries?: number;
  beneficiaryRate?: number;
  totalRequests?: number;
  openRequests?: number;
  resolvedRequests?: number;
  resolutionRate?: number;
  totalSchemes?: number;
  stateSchemes?: number;
  centralSchemes?: number;
}): string[] {
  const warnings: string[] = [];

  // 1. Citizen & Beneficiary check
  if (
    metrics.totalCitizens !== undefined &&
    metrics.totalBeneficiaries !== undefined
  ) {
    if (metrics.totalBeneficiaries > metrics.totalCitizens) {
      warnings.push(
        `Total Beneficiaries (${metrics.totalBeneficiaries}) exceeds Total Citizens (${metrics.totalCitizens})`
      );
    }
    const expectedRate = calculateBeneficiaryRate(
      metrics.totalBeneficiaries,
      metrics.totalCitizens
    );
    if (
      metrics.beneficiaryRate !== undefined &&
      Math.abs(metrics.beneficiaryRate - expectedRate) > 0.5
    ) {
      warnings.push(
        `Beneficiary Rate mismatch: displayed ${metrics.beneficiaryRate}%, expected ${expectedRate}%`
      );
    }
  }

  // 2. Request & Resolution check
  if (
    metrics.totalRequests !== undefined &&
    metrics.openRequests !== undefined
  ) {
    if (metrics.openRequests > metrics.totalRequests) {
      warnings.push(
        `Open Requests (${metrics.openRequests}) exceeds Total Requests (${metrics.totalRequests})`
      );
    }
    const derivedResolved = metrics.totalRequests - metrics.openRequests;
    if (
      metrics.resolvedRequests !== undefined &&
      metrics.resolvedRequests !== derivedResolved
    ) {
      warnings.push(
        `Resolved Requests mismatch: given ${metrics.resolvedRequests}, expected ${derivedResolved}`
      );
    }
    const expectedResRate = calculateResolutionRate(
      derivedResolved,
      metrics.totalRequests
    );
    if (
      metrics.resolutionRate !== undefined &&
      Math.abs(metrics.resolutionRate - expectedResRate) > 0.5
    ) {
      warnings.push(
        `Resolution Rate mismatch: displayed ${metrics.resolutionRate}%, expected ${expectedResRate}%`
      );
    }
  }

  // 3. Scheme breakdown check
  if (
    metrics.totalSchemes !== undefined &&
    metrics.stateSchemes !== undefined &&
    metrics.centralSchemes !== undefined
  ) {
    const sumSchemes = metrics.stateSchemes + metrics.centralSchemes;
    if (metrics.totalSchemes !== sumSchemes) {
      warnings.push(
        `Scheme sum mismatch: Total ${metrics.totalSchemes} != State (${metrics.stateSchemes}) + Central (${metrics.centralSchemes}) = ${sumSchemes}`
      );
    }
  }

  return warnings;
}
