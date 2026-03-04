/**
 * Unit Tests — Canonical State/UT & Metric Validation
 *
 * Covers:
 *  - Every canonical state/UT has required fields
 *  - Total district ceiling is respected
 *  - High-risk district count never exceeds table total
 *  - Metric validation and clamping behave correctly
 *  - Bogus / duplicate state detection
 *  - Stress–trend consistency
 *
 * Prerequisites: npm install -D vitest
 * Run with:      npx vitest run tests/states-metrics.test.ts
 */

// @ts-ignore — vitest types will be available after `npm install -D vitest`
import { describe, it, expect } from 'vitest';

import {
  CANONICAL_STATES_UTS,
  TOTAL_DISTRICTS_INDIA,
  resolveStateByName,
  resolveStateByAbbr,
  resolveStateById,
  isBogusState,
  CanonicalStateUT,
} from '../data/states';

import {
  METRIC_DEFINITIONS,
  clampMetric,
  validateMetric,
  deriveConsistentTrend,
} from '../data/metricDefinitions';

// ================================
// 1. CANONICAL STATE/UT INTEGRITY
// ================================

describe('Canonical States & UTs', () => {
  it('should have exactly 36 entries (28 states + 8 UTs)', () => {
    expect(CANONICAL_STATES_UTS.length).toBe(36);
  });

  it('every entry has required fields', () => {
    for (const s of CANONICAL_STATES_UTS) {
      expect(s.id).toBeGreaterThan(0);
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.abbreviation.length).toBeGreaterThanOrEqual(2);
      expect(['State', 'UT']).toContain(s.type);
      expect(s.districtCount).toBeGreaterThan(0);
    }
  });

  it('IDs are unique', () => {
    const ids = CANONICAL_STATES_UTS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('abbreviations are unique', () => {
    const abbrs = CANONICAL_STATES_UTS.map(s => s.abbreviation);
    expect(new Set(abbrs).size).toBe(abbrs.length);
  });

  it('names are unique (case-insensitive)', () => {
    const names = CANONICAL_STATES_UTS.map(s => s.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('TOTAL_DISTRICTS_INDIA equals sum of districtCounts', () => {
    const sum = CANONICAL_STATES_UTS.reduce((s, e) => s + e.districtCount, 0);
    expect(TOTAL_DISTRICTS_INDIA).toBe(sum);
  });

  it('uses official name Odisha (not Orissa)', () => {
    expect(resolveStateByName('Odisha')).toBeDefined();
    // Orissa alias should resolve to Odisha
    const fromAlias = resolveStateByName('Orissa');
    expect(fromAlias?.name).toBe('Odisha');
  });

  it('resolves Andaman & Nicobar variants to single entry', () => {
    const a = resolveStateByName('Andaman and Nicobar Islands');
    const b = resolveStateByName('Andaman & Nicobar Islands');
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(a?.id).toBe(b?.id);
  });

  it('resolves Dadra/Daman variants to single merged UT', () => {
    const a = resolveStateByName('Dadra and Nagar Haveli and Daman and Diu');
    const b = resolveStateByName('Daman & Diu');
    const c = resolveStateByName('Dadra and Nagar Haveli');
    expect(a).toBeDefined();
    expect(b?.id).toBe(a?.id);
    expect(c?.id).toBe(a?.id);
  });

  it('resolves Jammu and Kashmir / J&K to one entry', () => {
    const a = resolveStateByName('Jammu and Kashmir');
    const b = resolveStateByName('Jammu & Kashmir');
    expect(a).toBeDefined();
    expect(b?.id).toBe(a?.id);
  });

  it('resolves abbreviation aliases correctly', () => {
    // OR → OD (Orissa → Odisha)
    expect(resolveStateByAbbr('OR')?.name).toBe('Odisha');
    expect(resolveStateByAbbr('OD')?.name).toBe('Odisha');
    // UP
    expect(resolveStateByAbbr('UP')?.name).toBe('Uttar Pradesh');
  });
});

// ================================
// 2. BOGUS STATE DETECTION
// ================================

describe('Bogus state filtering', () => {
  it('detects numeric-only strings as bogus', () => {
    expect(isBogusState('1000')).toBe(true);
    expect(isBogusState('10')).toBe(true);
  });

  it('detects empty / whitespace', () => {
    expect(isBogusState('')).toBe(true);
    expect(isBogusState('  ')).toBe(true);
  });

  it('does NOT flag valid state names', () => {
    expect(isBogusState('Uttar Pradesh')).toBe(false);
    expect(isBogusState('Delhi')).toBe(false);
  });
});

// ================================
// 3. METRIC VALIDATION & CLAMPING
// ================================

describe('Metric definitions & validation', () => {
  it('all metric definitions have valid ranges', () => {
    for (const [key, def] of Object.entries(METRIC_DEFINITIONS)) {
      expect(def.min).toBeLessThanOrEqual(def.max);
      expect(def.label.length).toBeGreaterThan(0);
      expect(def.subtitle.length).toBeGreaterThan(0);
    }
  });

  it('clampMetric clamps to [min, max]', () => {
    expect(clampMetric('avgDemandPressure', 150)).toBe(100);
    expect(clampMetric('avgDemandPressure', -5)).toBe(0);
    expect(clampMetric('avgDemandPressure', 50)).toBe(50);
  });

  it('validateMetric returns error for out-of-range values', () => {
    expect(validateMetric('avgDemandPressure', 101)).not.toBeNull();
    expect(validateMetric('avgDemandPressure', -1)).not.toBeNull();
    expect(validateMetric('avgDemandPressure', 50)).toBeNull();
  });

  it('highRiskDistrictCount max should not exceed ~780', () => {
    const def = METRIC_DEFINITIONS['highRiskDistrictCount'];
    expect(def.max).toBeLessThanOrEqual(800);
    expect(def.max).toBeGreaterThanOrEqual(700);
  });
});

// ================================
// 4. HIGH-RISK DISTRICT BOUNDS
// ================================

describe('High-risk district count validation', () => {
  it('mock overview high-risk count <= total districts in India', () => {
    const mockCount = 127;
    expect(mockCount).toBeLessThanOrEqual(TOTAL_DISTRICTS_INDIA);
  });

  it('sum of per-state high-risk districts <= total districts', () => {
    // Simulated table data
    const mockStates = [
      { highRiskDistricts: 23 },
      { highRiskDistricts: 8 },
      { highRiskDistricts: 19 },
      { highRiskDistricts: 5 },
      { highRiskDistricts: 2 },
      { highRiskDistricts: 11 },
      { highRiskDistricts: 1 },
      { highRiskDistricts: 3 },
      { highRiskDistricts: 2 },
      { highRiskDistricts: 4 },
      { highRiskDistricts: 6 },
      { highRiskDistricts: 12 },
    ];
    const sum = mockStates.reduce((s, r) => s + r.highRiskDistricts, 0);
    expect(sum).toBeLessThanOrEqual(TOTAL_DISTRICTS_INDIA);
  });

  it('each state row references a valid canonical ID', () => {
    const mockRows = [
      'Uttar Pradesh', 'Maharashtra', 'Bihar', 'West Bengal',
      'Rajasthan', 'Madhya Pradesh', 'Tamil Nadu', 'Gujarat',
      'Karnataka', 'Andhra Pradesh', 'Odisha', 'Jharkhand',
    ];
    for (const name of mockRows) {
      const resolved = resolveStateByName(name);
      expect(resolved).toBeDefined();
      expect(resolved!.id).toBeGreaterThan(0);
    }
  });
});

// ================================
// 5. STRESS-TREND CONSISTENCY
// ================================

describe('Stress level ↔ Risk trend consistency', () => {
  it('Critical stress forces Rising trend', () => {
    expect(deriveConsistentTrend('Critical', 'down')).toBe('up');
    expect(deriveConsistentTrend('Critical', 'stable')).toBe('up');
    expect(deriveConsistentTrend('Critical', 'up')).toBe('up');
  });

  it('High stress prevents Falling trend', () => {
    expect(deriveConsistentTrend('High', 'down')).toBe('stable');
    expect(deriveConsistentTrend('High', 'up')).toBe('up');
  });

  it('Low stress prevents Rising trend', () => {
    expect(deriveConsistentTrend('Low', 'up')).toBe('stable');
    expect(deriveConsistentTrend('Low', 'down')).toBe('down');
  });

  it('Moderate stress passes through raw trend', () => {
    expect(deriveConsistentTrend('Moderate', 'up')).toBe('up');
    expect(deriveConsistentTrend('Moderate', 'down')).toBe('down');
    expect(deriveConsistentTrend('Moderate', 'stable')).toBe('stable');
  });
});
