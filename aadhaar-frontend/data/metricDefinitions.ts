/**
 * Metric Definitions & Validation
 *
 * Documents the allowable ranges, units, and descriptions for all
 * key metrics used in the Aadhaar Intelligence Dashboard.
 *
 * These are index values on a 0–100 scale (not raw percentages).
 */

export interface MetricDefinition {
  /** Machine key matching the DashboardOverview field */
  key: string;
  /** Human-readable label shown in KPI cards */
  label: string;
  /** Short description / subtitle for context */
  subtitle: string;
  /** Unit label displayed after the value */
  unit: string;
  /** Minimum allowed value (inclusive) */
  min: number;
  /** Maximum allowed value (inclusive) */
  max: number;
  /** Thresholds for colour coding: [warnAt, criticalAt] */
  thresholds: [number, number];
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  totalTransactions: {
    key: 'totalTransactions',
    label: 'TOTAL TRANSACTIONS',
    subtitle: 'Aadhaar operations YTD',
    unit: '',
    min: 0,
    max: Infinity,
    thresholds: [0, 0], // no colour coding
  },
  avgDemandPressure: {
    key: 'avgDemandPressure',
    label: 'AVG DEMAND PRESSURE',
    subtitle: 'Enrolment & update demand index (0–100 scale)',
    unit: 'Index',
    min: 0,
    max: 100,
    thresholds: [50, 70],
  },
  avgOperationalStress: {
    key: 'avgOperationalStress',
    label: 'AVG OPERATIONAL STRESS',
    subtitle: 'System load index (0–100 scale)',
    unit: 'Index',
    min: 0,
    max: 100,
    thresholds: [50, 70],
  },
  overallCompositeRisk: {
    key: 'overallCompositeRisk',
    label: 'COMPOSITE RISK',
    subtitle: 'Weighted risk score (0–100 scale)',
    unit: 'Index',
    min: 0,
    max: 100,
    thresholds: [50, 70],
  },
  highRiskDistrictCount: {
    key: 'highRiskDistrictCount',
    label: 'HIGH-RISK DISTRICTS',
    subtitle: 'Districts requiring attention',
    unit: '',
    min: 0,
    max: 780, // approximate total districts in India
    thresholds: [100, 200],
  },
};

/**
 * Clamp a metric value to its allowed range.
 * Returns the clamped value.
 */
export function clampMetric(key: string, value: number): number {
  const def = METRIC_DEFINITIONS[key];
  if (!def) return value;
  return Math.max(def.min, Math.min(def.max, value));
}

/**
 * Validate that a value is within the documented range.
 * Returns an error string or null if valid.
 */
export function validateMetric(key: string, value: number): string | null {
  const def = METRIC_DEFINITIONS[key];
  if (!def) return `Unknown metric key: ${key}`;
  if (value < def.min) return `${def.label} value ${value} is below minimum ${def.min}`;
  if (value > def.max) return `${def.label} value ${value} exceeds maximum ${def.max}`;
  return null;
}

/**
 * Derive a consistent risk trend label from stress level.
 * If stress is Critical → trend must be "Rising".
 * If stress is Low → trend should be "Falling" or "Stable".
 * Prevents contradictory STRESS LEVEL + RISK TREND combinations.
 */
export function deriveConsistentTrend(
  stressLevel: 'Low' | 'Moderate' | 'High' | 'Critical',
  rawTrend: 'up' | 'down' | 'stable'
): 'up' | 'down' | 'stable' {
  switch (stressLevel) {
    case 'Critical':
      // Critical stress must show Rising trend
      return 'up';
    case 'High':
      // High stress should not show Falling
      return rawTrend === 'down' ? 'stable' : rawTrend;
    case 'Low':
      // Low stress should not show Rising
      return rawTrend === 'up' ? 'stable' : rawTrend;
    default:
      return rawTrend;
  }
}

/**
 * Trend labels and their definitions (for tooltips).
 */
export const TREND_DEFINITIONS: Record<string, string> = {
  Rising: 'Risk indicators are increasing — requires immediate monitoring.',
  Falling: 'Risk indicators are decreasing — situation improving.',
  Stable: 'Risk indicators are unchanged — maintain current posture.',
};
