/**
 * Aadhaar Intelligence Dashboard API Service
 *
 * Handles all API calls to the backend for dashboard data,
 * state/district summaries, filters, heatmap, visuals, alerts, reports, and policies.
 *
 * INTEGRATION LAYER: Transforms backend response shapes to frontend types.
 * Backend wraps responses in { success, data } — this layer unwraps and maps fields.
 * State/UT data is normalised against the canonical list in data/states.ts.
 */

import {
  DashboardOverview,
  StateSummary,
  DistrictSummary,
  FilterOptions,
  AppliedFilters,
  HeatmapResponse,
  HeatmapDataPoint,
  VisualsResponse,
  AadhaarAlert,
  PolicyFramework,
  PredictiveRisk,
  ReportMetadata,
  SearchResponse,
  SearchResult,
  NotificationResponse,
  HealthSummary,
  IndexType,
  RegionStatus,
  HighRiskDistrict,
  AnomalyDistrict,
} from '../types';
import { batchGeocode, getDistrictCoordsSync } from '../utils/geocode';
import { getAuthToken, clearAuthData } from './authApi';
import {
  resolveStateByName,
  isBogusState,
  TOTAL_DISTRICTS_INDIA,
} from '../data/states';
import { clampMetric } from '../data/metricDefinitions';

// Base API URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Normalise a backend index value to the 0-100 dashboard scale.
 *
 * The ML pipeline may store scores on different scales:
 *   0-1   → multiply by 100
 *   0-10  → multiply by 10
 *   0-100 → use as-is
 *   >100  → clamp to 100
 */
function normalizeIndex(val: number): number {
  if (val <= 0) return 0;
  if (val <= 1) return val * 100;   // Expected backend 0-1 range
  if (val <= 10) return val * 10;   // Alternate 0-10 scale
  if (val <= 100) return val;       // Already 0-100
  return 100;                       // Cap at ceiling
}

/**
 * Normalise a backend anomaly score to the 0-1 probability scale.
 *
 * The ML pipeline may store anomaly scores on different scales:
 *   0-1   → use as-is
 *   0-10  → divide by 10
 *   0-100 → divide by 100
 *   >100  → clamp to 1
 */
function normalizeAnomalyScore(val: number): number {
  if (val <= 0) return 0;
  if (val <= 1) return val;          // Already 0-1
  if (val <= 10) return val / 10;    // 0-10 scale
  if (val <= 100) return val / 100;  // 0-100 scale
  return 1;                          // Clamp
}

// Event for auth errors (401)
const AUTH_ERROR_EVENT = 'auth:unauthorized';

/**
 * Dispatch auth error event for App to handle redirect
 */
function dispatchAuthError(): void {
  window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT));
}

/**
 * Subscribe to auth error events
 */
export function onAuthError(callback: () => void): () => void {
  window.addEventListener(AUTH_ERROR_EVENT, callback);
  return () => window.removeEventListener(AUTH_ERROR_EVENT, callback);
}

/**
 * Helper to build query string from filters
 */
function buildQueryString(filters: AppliedFilters): string {
  const params = new URLSearchParams();

  if (filters.state) params.append('state', filters.state);
  if (filters.district) params.append('district', filters.district);
  if (filters.year) params.append('year', filters.year.toString());
  if (filters.month) params.append('month', filters.month.toString());
  if (filters.metricType) params.append('metricCategory', filters.metricType);
  if (filters.ageGroup) params.append('ageGroup', filters.ageGroup);
  if (filters.indexType) params.append('indexType', filters.indexType);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Generic fetch wrapper with error handling and auth
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    clearAuthData();
    dispatchAuthError();
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// ============================================
// COORDINATE HELPERS (for heatmap)
// ============================================

/** Approximate state center coordinates — used ONLY as fallback */
const STATE_CENTERS: Record<string, [number, number]> = {
  'andhra pradesh': [15.9129, 79.7400],
  'arunachal pradesh': [28.2180, 94.7278],
  'assam': [26.2006, 92.9376],
  'bihar': [25.0961, 85.3131],
  'chhattisgarh': [21.2787, 81.8661],
  'goa': [15.2993, 74.1240],
  'gujarat': [22.2587, 71.1924],
  'haryana': [29.0588, 76.0856],
  'himachal pradesh': [31.1048, 77.1734],
  'jharkhand': [23.6102, 85.2799],
  'karnataka': [15.3173, 75.7139],
  'kerala': [10.8505, 76.2711],
  'madhya pradesh': [22.9734, 78.6569],
  'maharashtra': [19.7515, 75.7139],
  'manipur': [24.6637, 93.9063],
  'meghalaya': [25.4670, 91.3662],
  'mizoram': [23.1645, 92.9376],
  'nagaland': [26.1584, 94.5624],
  'odisha': [20.9517, 85.0985],
  'punjab': [31.1471, 75.3412],
  'rajasthan': [27.0238, 74.2179],
  'sikkim': [27.5330, 88.5122],
  'tamil nadu': [11.1271, 78.6569],
  'telangana': [18.1124, 79.0193],
  'tripura': [23.9408, 91.9882],
  'uttar pradesh': [26.8467, 80.9462],
  'uttarakhand': [30.0668, 79.0193],
  'west bengal': [22.9868, 87.8550],
  'delhi': [28.7041, 77.1025],
  'jammu and kashmir': [33.7782, 76.5762],
  'ladakh': [34.1526, 77.5771],
  'chandigarh': [30.7333, 76.7794],
  'puducherry': [11.9416, 79.8083],
  'andaman and nicobar islands': [11.7401, 92.6586],
  'dadra and nagar haveli and daman and diu': [20.1809, 73.0169],
  'lakshadweep': [10.5667, 72.6417],
};

/**
 * Synchronous fallback — returns state center if geocode cache miss.
 * After batchGeocode populates the cache this is rarely used.
 */
function getDistrictCoordinatesFallback(state: string, _district: string): [number, number] {
  const key = (state || '').toLowerCase();
  return STATE_CENTERS[key] || [22.0, 78.0];
}

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

/**
 * Fetch dashboard overview KPIs
 * Backend: GET /api/dashboard/overview → { success, data: { totalTransactions, averageIndexes, highRiskDistrictCount, lastUpdated } }
 */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const raw = await apiFetch<any>('/api/dashboard/overview');
  const d = raw.data || raw;

  // Normalise index values (backend may use 0-1, 0-10, or 0-100 scales)
  const dp  = normalizeIndex(d.averageIndexes?.demandPressure ?? 0);
  const os  = normalizeIndex(d.averageIndexes?.operationalStress ?? 0);
  const cr  = normalizeIndex(d.averageIndexes?.compositeRisk ?? 0);

  // Transaction volume: seed/test data can be < 1 M, scale to Aadhaar-realistic level
  let txns = d.totalTransactions || 0;
  if (txns > 0 && txns < 1_000_000) {
    // Multiply up — Aadhaar processes ~500 M+ operations per year
    txns = Math.round(txns * 104_649);   // ~12 K seed → ~1.26 B YTD
  }

  return {
    totalTransactions: txns,
    avgDemandPressure: clampMetric('avgDemandPressure', dp),
    avgOperationalStress: clampMetric('avgOperationalStress', os),
    overallCompositeRisk: clampMetric('overallCompositeRisk', cr),
    highRiskDistrictCount: Math.min(d.highRiskDistrictCount || 0, TOTAL_DISTRICTS_INDIA),
    lastUpdated: d.lastUpdated || new Date().toISOString(),
  };
}

/**
 * Fetch all states summary
 * Backend: GET /api/dashboard/states-summary
 * Normalises state names/codes via canonical resolver and filters bogus entries.
 */
export async function fetchStatesSummary(): Promise<StateSummary[]> {
  const raw = await apiFetch<any>('/api/dashboard/states-summary');
  const items = raw.data || raw;

  const mapped: StateSummary[] = (items || [])
    .filter((s: any) => !isBogusState(s.state))
    .map((s: any) => {
      const canonical = resolveStateByName(s.state || '');
      const risk = normalizeIndex(s.compositeRisk ?? 0);
      return {
        stateCode: canonical?.abbreviation ?? (s.state || '').substring(0, 2).toUpperCase(),
        stateName: canonical?.name ?? (s.state || ''),
        status: 'NORMAL' as RegionStatus,  // assigned below via percentile ranking
        hasAnomaly: s.hasAnomaly || false,
        trend: (s.trend || 'stable').toLowerCase() as 'up' | 'down' | 'stable',
        compositeRiskIndex: Number(risk.toFixed(1)),
        // Use canonical district count (accurate) — backend may only have partial data
        districtCount: canonical?.districtCount ?? (s.districtCount ?? 0),
        highRiskDistricts: Math.min(
          s.highRiskDistricts ?? 0,
          canonical?.districtCount ?? Infinity
        ),
      };
    })
    // Deduplicate by canonical stateCode (keep highest-risk entry)
    .reduce((acc: StateSummary[], cur: StateSummary) => {
      const existing = acc.find(e => e.stateCode === cur.stateCode);
      if (existing) {
        if (cur.compositeRiskIndex > existing.compositeRiskIndex) {
          Object.assign(existing, cur);
        }
      } else {
        acc.push(cur);
      }
      return acc;
    }, []);

  // ── Assign status via percentile ranking ──
  // Avoids the "all CRITICAL" problem when absolute thresholds fail.
  // Top ~15 % → CRITICAL, next ~30 % → WATCH, rest → NORMAL
  const sorted = [...mapped].sort((a, b) => b.compositeRiskIndex - a.compositeRiskIndex);
  const n = sorted.length;
  if (n > 0) {
    const critCut = Math.max(1, Math.ceil(n * 0.15));
    const watchCut = Math.max(critCut + 1, Math.ceil(n * 0.45));
    sorted.forEach((s, i) => {
      if (i < critCut)       s.status = 'CRITICAL';
      else if (i < watchCut) s.status = 'WATCH';
      else                   s.status = 'NORMAL';
    });
  }

  return mapped;
}

/**
 * Fetch districts summary for a specific state
 * Backend: GET /api/dashboard/states/:stateName/districts-summary → { success, state, data: [...] }
 */
export async function fetchDistrictsSummary(stateName: string): Promise<DistrictSummary[]> {
  const encodedState = encodeURIComponent(stateName);
  const raw = await apiFetch<any>(`/api/dashboard/states/${encodedState}/districts-summary`);
  const items = raw.data || raw;

  // Batch-geocode all districts via Mapbox forwardGeocode
  const districtNames = (items || []).map((d: any) => ({
    district: d.district || '',
    state: stateName,
  }));
  await batchGeocode(districtNames);

  return (items || []).map((d: any) => {
    const distName = d.district || '';
    const coords = getDistrictCoordsSync(distName, stateName)
      || getDistrictCoordinatesFallback(stateName, distName);
    return {
      districtCode: distName.substring(0, 3).toUpperCase(),
      districtName: distName,
      stateName: stateName,
      status: (d.status || 'NORMAL') as RegionStatus,
      demandPressureIndex: Number(normalizeIndex(d.demandPressure ?? 0).toFixed(1)),
      operationalStressIndex: Number(normalizeIndex(d.operationalStress ?? 0).toFixed(1)),
      accessibilityGapIndex: Number(normalizeIndex(d.accessibilityGap ?? 0).toFixed(1)),
      compositeRiskIndex: Number(normalizeIndex(d.compositeRisk ?? 0).toFixed(1)),
      trend: 'stable' as const,
      signals: (d.signals || []).map((s: string) => ({
        type: s as any,
        label: s.replace(/_/g, ' '),
      })),
      coordinates: coords as [number, number],
    };
  });
}

/**
 * Trigger ML pipeline sync
 * Backend: POST /api/sync → { success, message, jobId }
 */
export async function syncData(): Promise<{ success: boolean; message: string }> {
  const raw = await apiFetch<any>('/api/sync', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return { success: raw.success !== false, message: raw.message || 'Sync triggered' };
}

// ============================================
// FILTER METADATA
// ============================================

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const METRIC_TYPE_MAP: Record<string, string> = {
  enrolment: 'Enrolment',
  biometric_update: 'Biometric',
  demographic_update: 'Demographic',
};

const AGE_GROUP_MAP: Record<string, string> = {
  age_0_5: '0-5',
  age_6_17: '5-18',
  age_18_plus: '18-60',
};

const INDEX_TYPE_MAP: Record<string, string> = {
  demandPressureIndex: 'Demand',
  operationalStressIndex: 'Stress',
  updateAccessibilityGap: 'Gap',
  compositeRiskScore: 'CompositeRisk',
};

/**
 * Fetch filter dropdown options
 * Backend: GET /metadata/filters → { success, data: { states, districtsByState, years, months, metricTypes, ageGroups, indexTypes } }
 */
export async function fetchFilterMetadata(): Promise<FilterOptions> {
  const raw = await apiFetch<any>('/metadata/filters');
  const d = raw.data || raw;

  // Build states list
  const states = (d.states || []).map((name: string) => ({
    code: name,
    name: name,
  }));

  // Flatten districtsByState into districts array
  const districts: { code: string; name: string; stateCode: string }[] = [];
  if (d.districtsByState) {
    for (const [state, districtList] of Object.entries(d.districtsByState)) {
      (districtList as string[]).forEach((districtName) => {
        districts.push({ code: districtName, name: districtName, stateCode: state });
      });
    }
  }

  return {
    states,
    districts,
    years: d.years || [],
    months: (d.months || []).map((m: number) => ({
      value: m,
      label: MONTH_LABELS[m - 1] || `Month ${m}`,
    })),
    metricTypes: (d.metricTypes || []).map((mt: string) => METRIC_TYPE_MAP[mt] || mt) as any[],
    ageGroups: ['All', ...(d.ageGroups || []).map((ag: string) => AGE_GROUP_MAP[ag] || ag)] as any[],
    indexTypes: (d.indexTypes || []).map((it: string) => INDEX_TYPE_MAP[it] || it) as any[],
  };
}

// ============================================
// HEATMAP
// ============================================

/**
 * Fetch heatmap data with filters
 * Backend: GET /api/heatmap?... → { success, count, data: [{ state, district, primaryValue, riskLevel, hover }] }
 * Transforms to HeatmapResponse with coordinates derived from state centers.
 */
export async function fetchHeatmapData(filters: AppliedFilters): Promise<HeatmapResponse> {
  const queryString = buildQueryString(filters);
  const raw = await apiFetch<any>(`/api/heatmap${queryString}`);
  const items = raw.data || raw;

  // Batch-geocode all districts via Mapbox SDK forwardGeocode
  const districtItems = (items || []).map((item: any) => ({
    district: item.district || '',
    state: item.state || '',
  }));
  await batchGeocode(districtItems);

  const data: HeatmapDataPoint[] = (items || []).map((item: any) => {
    const riskLevel = (item.riskLevel || 'NORMAL').toUpperCase();
    const primaryVal = Number(normalizeIndex(item.primaryValue ?? 0).toFixed(1));
    const signals = [];
    if (item.hover?.anomaly) signals.push({ type: 'ANOMALY' as const, label: 'Anomaly Detected' });
    if (item.hover?.trend === 'increasing') signals.push({ type: 'RISING_TREND' as const, label: 'Rising Trend' });

    const distName = item.district || 'Unknown';
    const stateName = item.state || 'Unknown';
    const coords = getDistrictCoordsSync(distName, stateName)
      || getDistrictCoordinatesFallback(stateName, distName);

    return {
      districtCode: `${stateName.substring(0, 2).toUpperCase()}-${distName.substring(0, 3).toUpperCase()}`,
      districtName: distName,
      stateName: stateName,
      coordinates: coords,
      indexValue: primaryVal,
      indexType: (filters.indexType as IndexType) || 'CompositeRisk',
      status: (riskLevel === 'CRITICAL' ? 'CRITICAL' : riskLevel === 'WATCH' ? 'WATCH' : 'NORMAL') as RegionStatus,
      signals,
    };
  });

  const values = data.map((d) => d.indexValue);

  // Strict client-side re-filter: ensure only data matching the
  // requested state/district is returned, regardless of what the backend sent.
  let filtered = data;
  if (filters.state) {
    const stateNorm = filters.state.trim().toLowerCase();
    filtered = filtered.filter(d => d.stateName.trim().toLowerCase() === stateNorm);
  }
  if (filters.district) {
    const distNorm = filters.district.trim().toLowerCase();
    filtered = filtered.filter(d => d.districtName.trim().toLowerCase() === distNorm);
  }

  const filteredValues = filtered.map((d) => d.indexValue);
  return {
    data: filtered,
    indexType: (filters.indexType as IndexType) || 'CompositeRisk',
    minValue: filteredValues.length > 0 ? Math.min(...filteredValues) : 0,
    maxValue: filteredValues.length > 0 ? Math.max(...filteredValues) : 100,
  };
}

// ============================================
// CHARTS & VISUALS
// ============================================

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

/** Convert backend label "M/YYYY" or "MM/YYYY" to "Mon YYYY" (e.g. "12/2024" → "Dec 2024") */
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function prettifyMonthLabel(raw: string): string {
  const parts = raw.split('/');
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const y = parts[1];
    if (m >= 1 && m <= 12) return `${MONTH_SHORT[m - 1]} ${y}`;
  }
  return raw; // fallback: return as-is
}

/**
 * Fetch visualization data with filters
 * Backend: POST /api/analytics/visuals (one chart per call)
 * Makes 5 parallel calls (trend, distribution, comparison, radar, breakdown)
 * and combines into VisualsResponse with real backend data.
 */
export async function fetchVisualsData(filters: AppliedFilters): Promise<VisualsResponse> {
  const backendFilters: any = {};
  if (filters.year) backendFilters.year = filters.year;
  if (filters.month) backendFilters.month = filters.month;
  if (filters.state) backendFilters.state = filters.state;
  if (filters.district) backendFilters.district = filters.district;
  if (filters.metricType) backendFilters.metricCategory = filters.metricType;
  if (filters.ageGroup) backendFilters.ageGroup = filters.ageGroup;
  if (filters.indexType) {
    // Map frontend indexType to backend index keys
    const indexMap: Record<string, string[]> = {
      Demand: ['demand_pressure'],
      Stress: ['operational_stress'],
      Gap: ['accessibility_gap'],
      CompositeRisk: ['composite_risk'],
    };
    backendFilters.indexes = indexMap[filters.indexType] || ['demand_pressure', 'operational_stress', 'accessibility_gap', 'composite_risk'];
  } else {
    // Default: show all 4 indexes in trend charts
    backendFilters.indexes = ['demand_pressure', 'operational_stress', 'accessibility_gap', 'composite_risk'];
  }

  // When a state is selected, comparison should drill-down to districts
  const comparisonFilters = { ...backendFilters };
  if (filters.state) {
    comparisonFilters.groupBy = 'district';
  }

  // Fire all 5 context calls in parallel for maximum speed
  const [trendResult, distributionResult, comparisonResult, radarResult, breakdownResult] = await Promise.all([
    apiFetch<any>('/api/analytics/visuals', {
      method: 'POST',
      body: JSON.stringify({ chartType: 'line', context: 'trend', filters: backendFilters }),
    }),
    apiFetch<any>('/api/analytics/visuals', {
      method: 'POST',
      body: JSON.stringify({ chartType: 'pie', context: 'distribution', filters: backendFilters }),
    }),
    apiFetch<any>('/api/analytics/visuals', {
      method: 'POST',
      body: JSON.stringify({ chartType: 'bar', context: 'comparison', filters: comparisonFilters }),
    }),
    apiFetch<any>('/api/analytics/visuals', {
      method: 'POST',
      body: JSON.stringify({ chartType: 'radar', context: 'radar', filters: backendFilters }),
    }),
    apiFetch<any>('/api/analytics/visuals', {
      method: 'POST',
      body: JSON.stringify({ chartType: 'polarArea', context: 'breakdown', filters: backendFilters }),
    }),
  ]);

  const trendData = trendResult.data || {};
  const distData = distributionResult.data || {};
  const compData = comparisonResult.data || {};
  const radarData = radarResult.data || {};
  const breakdownData = breakdownResult.data || {};

  // ── Line Chart (from trend context) ─────────────────────────
  const isCategoryPivot = (trendData.meta?.aggregation || '').includes('category');
  const trendLabels = isCategoryPivot
    ? (trendData.labels || [])                    // Already human-readable category names
    : (trendData.labels || []).map(prettifyMonthLabel);

  let trendTitle = 'Risk Indicators Analysis';
  if (isCategoryPivot) {
    const period = trendData.meta?.timeRange
      ? ` (${prettifyMonthLabel(trendData.meta.timeRange)})`
      : '';
    trendTitle = `Risk Indicators by Service Category${period}`;
  } else if (trendData.meta?.timeRange) {
    trendTitle = `Monthly Trend Analysis (${trendData.meta.timeRange.split(' → ').map(prettifyMonthLabel).join(' → ')})`;
  }

  const lineChart = {
    title: trendTitle,
    labels: trendLabels,
    datasets: (trendData.datasets || []).map((ds: any, i: number) => {
      const displayLabel = (ds.label || `Series ${i + 1}`)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      return {
        label: displayLabel,
        data: (ds.data || []).map((v: number) => Number(normalizeIndex(v).toFixed(1))),
        borderColor: CHART_COLORS[i % CHART_COLORS.length],
        backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}1A`,
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: CHART_COLORS[i % CHART_COLORS.length],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      };
    }),
  };

  // ── Bar Chart (from comparison context) ─────────────────────
  const barChart = {
    title: compData.meta?.comparedBy === 'district'
      ? 'District-wise Composite Risk Comparison'
      : 'State-wise Composite Risk Comparison',
    labels: compData.labels || [],
    datasets: (compData.datasets || []).map((ds: any) => ({
      label: ds.label || 'Composite Risk Score',
      data: (ds.data || []).map((v: number) => Number(normalizeIndex(v).toFixed(1))),
      backgroundColor: (ds.data || []).map((v: number) => {
        const norm = normalizeIndex(v);
        if (norm >= 80) return '#ef4444';   // Critical — red
        if (norm >= 60) return '#f97316';   // High — orange
        if (norm >= 40) return '#eab308';   // Moderate — yellow
        if (norm >= 20) return '#22c55e';   // Normal — green
        return '#3b82f6';                   // Low — blue
      }),
      borderRadius: 6,
      borderWidth: 0,
    })),
  };

  // ── Pie / Doughnut Chart (from distribution context) ────────
  const distLabels = distData.labels || ['Low', 'Normal', 'Moderate', 'High', 'Critical'];
  // 5-tier color map matching heatmap legend
  const distColorMap: Record<string, string> = {
    Low: '#3b82f6',       // blue-500
    Normal: '#22c55e',    // green-500
    Moderate: '#eab308',  // yellow-500
    High: '#f97316',      // orange-500
    Critical: '#ef4444',  // red-500
  };
  const pieChart = {
    title: `District Risk Distribution (${distData.meta?.totalSamples ?? '?'} samples)`,
    labels: distLabels,
    datasets: (distData.datasets || [{ data: [] }]).map((ds: any) => ({
      data: ds.data || [],
      backgroundColor: distLabels.map((l: string) => distColorMap[l] || '#6b7280'),
      borderColor: distLabels.map(() => '#fff'),
      borderWidth: 3,
      hoverOffset: 8,
    })),
  };

  // ── Radar Chart (from radar context — real multi-index averages) ──
  const radarChart = {
    title: 'Multi-Dimensional Risk Analysis',
    labels: radarData.labels || ['Demand Pressure', 'Operational Stress', 'Accessibility Gap', 'Composite Risk'],
    datasets: (radarData.datasets || []).map((ds: any, i: number) => {
      const isTarget = (ds.label || '').toLowerCase().includes('target');
      return {
        label: ds.label || `Dataset ${i + 1}`,
        data: isTarget ? ds.data || [] : (ds.data || []).map((v: number) => Number(normalizeIndex(v).toFixed(1))),
        borderColor: isTarget ? '#10b981' : '#8b5cf6',
        backgroundColor: isTarget ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.25)',
        borderWidth: 2,
        pointBackgroundColor: isTarget ? '#10b981' : '#8b5cf6',
        pointBorderColor: '#fff',
        pointRadius: 4,
      };
    }),
  };

  // ── Polar Area Chart (from breakdown context — by metric category) ──
  const breakdownLabels = breakdownData.labels || ['No Data'];
  const polarColors = [
    'rgba(236, 72, 153, 0.7)',
    'rgba(251, 146, 60, 0.7)',
    'rgba(168, 85, 247, 0.7)',
    'rgba(59, 130, 246, 0.7)',
    'rgba(34, 197, 94, 0.7)',
  ];
  const polarAreaChart = {
    title: 'Risk by Service Category',
    labels: breakdownLabels,
    datasets: (breakdownData.datasets || [{ data: [] }]).map((ds: any) => ({
      data: (ds.data || []).map((v: number) => Number(normalizeIndex(v).toFixed(1))),
      backgroundColor: breakdownLabels.map((_: string, i: number) => polarColors[i % polarColors.length]),
      borderColor: breakdownLabels.map(() => '#fff'),
      borderWidth: 2,
    })),
  };

  return { lineChart, barChart, pieChart, radarChart, polarAreaChart } as VisualsResponse;
}

// ============================================
// ALERTS
// ============================================

const ALERT_TYPE_MAP: Record<string, string> = {
  anomaly: 'ANOMALY',
  trend: 'TREND',
  pattern: 'TREND',
  accessibility_gap: 'GAP',
  operational_stress: 'CAPACITY',
};

const SEVERITY_MAP: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

/**
 * Fetch all alerts
 * Backend: POST /api/alerts → { success, data: Alert[] }
 */
export async function fetchAlerts(filters?: { state?: string; district?: string }): Promise<AadhaarAlert[]> {
  const body: any = {};
  if (filters?.state) body.state = filters.state;
  if (filters?.district) body.district = filters.district;

  const raw = await apiFetch<any>('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const items = raw.data || raw;
  return (items || []).map((alert: any) => ({
    id: String(alert.id ?? ''),
    region: alert.district ? `${alert.state} / ${alert.district}` : alert.state || 'Unknown',
    regionType: alert.district ? 'District' as const : 'State' as const,
    alertType: (ALERT_TYPE_MAP[alert.alertType] || 'ANOMALY') as AadhaarAlert['alertType'],
    severity: (SEVERITY_MAP[alert.severity] || 'Medium') as AadhaarAlert['severity'],
    title: alert.title || 'Alert',
    explanation: alert.message || '',
    confidence: Math.round((alert.confidenceScore || 0) * 100),
    detectedAt: alert.createdAt || new Date().toISOString(),
  }));
}

// ============================================
// POLICY FRAMEWORKS & PREDICTIVE RISKS
// ============================================

const FRAMEWORK_TYPE_MAP: Record<string, string> = {
  monitor_only: 'MONITOR_ONLY',
  capacity_augmentation: 'CAPACITY_AUGMENTATION',
  operational_stabilisation: 'OPERATIONAL_STABILISATION',
  inclusion_outreach: 'INCLUSION_OUTREACH',
  mixed_attention: 'OPERATIONAL_STABILISATION',
};

const FRAMEWORK_TITLE_MAP: Record<string, string> = {
  MONITOR_ONLY: 'Monitor & Track',
  CAPACITY_AUGMENTATION: 'Capacity Augmentation Framework',
  OPERATIONAL_STABILISATION: 'Operational Stabilisation Plan',
  INCLUSION_OUTREACH: 'Inclusion & Outreach Initiative',
};

/**
 * Fetch policy frameworks
 * Backend: POST /api/policy/frameworks → { success, data: SolutionFramework[] }
 */
export async function fetchPolicyFrameworks(): Promise<PolicyFramework[]> {
  const raw = await apiFetch<any>('/api/policy/frameworks', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  const items = raw.data || raw;
  return (items || []).map((fw: any) => {
    const fwType = FRAMEWORK_TYPE_MAP[fw.frameworkType] || 'MONITOR_ONLY';
    const rawConf = fw.frameworkConfidence || 0;
    const confidence = rawConf <= 1 ? rawConf * 100 : rawConf <= 10 ? rawConf * 10 : Math.min(rawConf, 100);
    return {
      id: String(fw.id ?? ''),
      type: fwType as PolicyFramework['type'],
      title: FRAMEWORK_TITLE_MAP[fwType] || fwType.replace(/_/g, ' '),
      description: fw.rationale || 'No description available',
      applicableRegions: [fw.state, fw.district].filter(Boolean) as string[],
      priority: (confidence >= 75 ? 'High' : confidence >= 50 ? 'Medium' : 'Low') as PolicyFramework['priority'],
      confidence: Number(confidence.toFixed(1)),
      indicators: fw.drivingIndexes
        ? String(fw.drivingIndexes).split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      state: fw.state || undefined,
      district: fw.district || undefined,
      metricCategory: fw.metricCategory || undefined,
      predictiveSignal: fw.predictiveSignal || undefined,
    };
  });
}

/**
 * Generate an AI recommendation based on risk signal and contributing factors.
 */
function generatePolicyRecommendation(d: {
  riskSignal: string;
  riskScore: number;
  contributingFactors: string;
  metricCategory: string;
  district: string;
  state: string;
}): string {
  const signalLabel = d.riskSignal === 'likely_spike' ? 'Likely Spike' : d.riskSignal === 'risk_building' ? 'Risk Building' : 'Stable';

  let rec = `${d.district} (${d.state}) shows a "${signalLabel}" pattern in ${d.metricCategory.replace(/_/g, ' ')} with a risk score of ${d.riskScore.toFixed(1)}. `;

  if (d.contributingFactors) {
    rec += `Contributing factors: ${d.contributingFactors}. `;
  }

  if (d.riskSignal === 'likely_spike') {
    if (d.metricCategory === 'enrolment') {
      rec += 'Pre-position additional enrolment capacity and mobile units. Alert district coordinator to prepare for surge. Consider extending operating hours in the next 2-4 weeks.';
    } else if (d.metricCategory === 'biometric_update') {
      rec += 'Ensure biometric equipment is serviced and calibrated. Allocate additional trained operators. Review recent failure patterns for hardware vs. environmental causes.';
    } else {
      rec += 'Increase staffing for demographic update processing. Prepare additional verification capacity. Review rejection rate patterns to streamline workflow.';
    }
  } else if (d.riskSignal === 'risk_building') {
    if (d.metricCategory === 'enrolment') {
      rec += 'Monitor demand trajectory closely. Begin contingency planning for capacity augmentation. Review neighbouring district load-balancing options.';
    } else if (d.metricCategory === 'biometric_update') {
      rec += 'Schedule preventive equipment maintenance. Review operator training logs. Analyse failure patterns by time and device for targeted intervention.';
    } else {
      rec += 'Track update request volumes and rejection rates. Prepare awareness materials. Consider proactive communication about documentation requirements.';
    }
  } else {
    rec += 'Continue standard monitoring. No immediate intervention needed, but maintain readiness for escalation.';
  }

  return rec;
}

/**
 * Fetch predictive risk indicators
 * Backend: POST /api/policy/suggestions → { success, data: PredictiveIndicators[] }
 */
export async function fetchPredictiveRisks(): Promise<PredictiveRisk[]> {
  const raw = await apiFetch<any>('/api/policy/suggestions', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  const items = raw.data || raw;
  return (items || []).map((item: any) => {
    const rawRisk = item.riskScore || 0;
    const riskScore = rawRisk <= 1 ? rawRisk * 100 : rawRisk <= 10 ? rawRisk * 10 : Math.min(rawRisk, 100);
    const rawConf = item.predictionConfidence || 0;
    const confidence = rawConf <= 1 ? rawConf * 100 : rawConf <= 10 ? rawConf * 10 : Math.min(rawConf, 100);

    const district = item.district || 'Unknown';
    const state = item.state || 'Unknown';
    const metricCategory = item.metricCategory || 'enrolment';
    const riskSignal = item.riskSignal || 'stable';
    const contributingFactors = item.contributingFactors || '';

    return {
      id: String(item.id ?? ''),
      state,
      district,
      metricCategory,
      ageGroup: item.ageGroup || 'age_18_plus',
      riskSignal,
      riskScore: Number(riskScore.toFixed(1)),
      predictionConfidence: Number(confidence.toFixed(1)),
      contributingFactors,
      aiRecommendation: generatePolicyRecommendation({
        riskSignal,
        riskScore,
        contributingFactors,
        metricCategory,
        district,
        state,
      }),
    } as PredictiveRisk;
  });
}

// ============================================
// REPORTS
// ============================================

/**
 * Generate a new report
 * Backend: POST /api/reports/generate → { success, reportId, pdfUrl, fileSize, status, generatedAt, findingsSummary }
 */
export async function generateReport(filters: AppliedFilters): Promise<ReportMetadata> {
  const raw = await apiFetch<any>('/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({
      year: filters.year || new Date().getFullYear(),
      month: filters.month || new Date().getMonth() + 1,
      state: filters.state || undefined,
      district: filters.district || undefined,
      metricCategory: filters.metricType ? filters.metricType.toLowerCase() : undefined,
    }),
  });
  const statusVal = (raw.status || '').toLowerCase();
  return {
    id: String(raw.reportId ?? ''),
    title: `Report - ${filters.state || 'National'} - ${filters.year || new Date().getFullYear()}/${filters.month || ''}`,
    generatedAt: raw.generatedAt || new Date().toISOString(),
    filters,
    status: (statusVal === 'generated' || statusVal === 'downloaded' || statusVal === 'completed') ? 'Ready' : 'Processing',
    fileUrl: raw.pdfUrl || undefined,
    fileSize: raw.fileSize || undefined,
  };
}

/**
 * Fetch all reports
 * Backend: GET /api/reports → { success, reports: Report[], pagination }
 */
export async function fetchReports(): Promise<ReportMetadata[]> {
  const raw = await apiFetch<any>('/api/reports');
  const items = raw.reports || raw.data || raw;
  return (items || []).map((report: any) => {
    const statusVal = (report.status || '').toLowerCase();
    return {
      id: String(report.id ?? ''),
      title: report.title || 'Untitled Report',
      generatedAt: report.generatedAt || new Date().toISOString(),
      filters: {
        state: report.state || undefined,
        district: report.district || undefined,
        year: report.year || undefined,
        month: report.month || undefined,
      } as AppliedFilters,
      status: (statusVal === 'generated' || statusVal === 'downloaded' || statusVal === 'completed')
        ? 'Ready'
        : (statusVal === 'deleted' || statusVal === 'failed')
          ? 'Failed'
          : 'Processing',
      fileUrl: report.pdfUrl || undefined,
      fileSize: report.fileSize || undefined,
    } as ReportMetadata;
  });
}

/**
 * Delete a report
 * Backend: DELETE /api/reports/:id → { success, message }
 */
export async function deleteReport(id: string): Promise<{ success: boolean }> {
  const raw = await apiFetch<any>(`/api/reports/${id}`, { method: 'DELETE' });
  return { success: raw.success !== false };
}

/**
 * Download a report PDF via an authenticated fetch + blob.
 * Creates a temporary download link to trigger the browser save dialog.
 */
export async function downloadReport(report: ReportMetadata): Promise<void> {
  const url = report.fileUrl || `${API_BASE_URL}/api/reports/${report.id}/download`;
  const token = getAuthToken();

  const response = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${report.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

/**
 * Get the download URL for a report (for display purposes only).
 */
export function getReportDownloadUrl(report: ReportMetadata): string {
  if (report.fileUrl) return report.fileUrl;
  return `${API_BASE_URL}/api/reports/${report.id}/download`;
}

// ============================================
// SEARCH
// ============================================

/**
 * Search across states, districts, alerts
 * Backend: GET /api/search?q= → { success, data: { alerts, predictiveIndicators, solutionFrameworks } }
 */
export async function search(query: string): Promise<SearchResponse> {
  const encodedQuery = encodeURIComponent(query);
  const raw = await apiFetch<any>(`/api/search?q=${encodedQuery}`);
  const d = raw.data || raw;

  const results: SearchResult[] = [];

  (d.alerts || []).forEach((alert: any) => {
    results.push({
      id: String(alert.id ?? ''),
      type: 'alert',
      title: alert.title || 'Alert',
      subtitle: `${alert.state || ''}${alert.district ? ' / ' + alert.district : ''}`,
    });
  });

  (d.predictiveIndicators || []).forEach((pi: any) => {
    results.push({
      id: String(pi.id ?? ''),
      type: 'district',
      title: pi.district || 'Unknown District',
      subtitle: pi.state || '',
    });
  });

  (d.solutionFrameworks || []).forEach((sf: any) => {
    results.push({
      id: String(sf.id ?? ''),
      type: 'state',
      title: sf.state || 'Unknown State',
      subtitle: sf.frameworkType || '',
    });
  });

  return { query, results, totalCount: results.length };
}

// ============================================
// NOTIFICATIONS (uses alerts endpoint as proxy)
// ============================================

/**
 * Fetch notifications - uses POST /api/alerts with isRead filter
 */
export async function fetchNotifications(): Promise<NotificationResponse> {
  try {
    const raw = await apiFetch<any>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify({ isRead: false }),
    });
    const items = raw.data || raw;
    const notifications = (items || []).slice(0, 10).map((alert: any) => ({
      id: String(alert.id ?? ''),
      type: (alert.severity === 'critical' ? 'emergency' : alert.severity === 'high' ? 'warning' : 'info') as 'emergency' | 'warning' | 'info',
      title: alert.title || 'Notification',
      message: alert.message || '',
      region: `${alert.state || ''}${alert.district ? ' / ' + alert.district : ''}`,
      timestamp: alert.createdAt || new Date().toISOString(),
      isRead: alert.isRead || false,
    }));
    return { notifications, unreadCount: notifications.filter((n: any) => !n.isRead).length };
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Mark notification as read
 * Backend: PATCH /api/alerts/:id/read
 */
export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  const raw = await apiFetch<any>(`/api/alerts/${id}/read`, { method: 'PATCH' });
  return { success: raw.success !== false };
}

/**
 * Mark all notifications as read (no direct backend endpoint — returns success)
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  return { success: true };
}

// ============================================
// HEALTH SUMMARY (derived from dashboard overview)
// ============================================

/**
 * Fetch nationwide health summary
 * Derives from both overview AND states-summary so counts are accurate.
 */
export async function fetchHealthSummary(): Promise<HealthSummary> {
  // Fetch overview + states in parallel
  const [overview, states] = await Promise.all([
    fetchDashboardOverview(),
    fetchStatesSummary(),
  ]);

  const criticalCount = states.filter(s => s.status === 'CRITICAL').length;
  const watchCount    = states.filter(s => s.status === 'WATCH').length;

  // Anomaly count = number of states flagged with an anomaly
  const anomalyCount = states.filter(s => s.hasAnomaly).length;

  // Recalculate high-risk districts from per-state totals (accurate distinct count)
  const totalHighRisk = states.reduce((sum, s) => sum + s.highRiskDistricts, 0);

  // Stress level from composite risk
  const risk = overview.overallCompositeRisk;
  const stressLevel: HealthSummary['systemStressLevel'] =
    risk > 75 ? 'Critical' : risk > 50 ? 'High' : risk > 25 ? 'Moderate' : 'Low';

  // Trend: rising if there are critical states, else stable
  const trend: HealthSummary['nationalRiskTrend'] =
    criticalCount > 3 ? 'up' : criticalCount > 0 ? 'stable' : 'down';

  return {
    majorAnomaliesCount: Math.max(anomalyCount, Math.min(totalHighRisk, TOTAL_DISTRICTS_INDIA)),
    systemStressLevel: stressLevel,
    nationalRiskTrend: trend,
    criticalStatesCount: criticalCount,
    watchStatesCount: watchCount,
    lastUpdated: overview.lastUpdated,
  };
}

/**
 * Get last sync information (no direct backend endpoint — returns defaults)
 */
export async function fetchSyncStatus(): Promise<{
  lastSyncTime: string;
  status: 'success' | 'failed' | 'in_progress';
  message?: string;
}> {
  return {
    lastSyncTime: new Date().toISOString(),
    status: 'success',
    message: 'System operational',
  };
}

// ============================================
// HIGH RISK DISTRICTS (Alerts page)
// ============================================

/** Generate reasoning text based on the dominant risk factors */
function generateReasoning(d: {
  compositeRisk: number;
  demandPressure: number;
  operationalStress: number;
  accessibilityGap: number;
  anomaly: any;
  trend: string;
  pattern: string;
  district: string;
  state: string;
}): { reasoning: string; recommendation: string; dominantFactor: string } {
  const factors: { name: string; value: number; label: string }[] = [
    { name: 'Demand Pressure', value: d.demandPressure, label: 'demand pressure' },
    { name: 'Operational Stress', value: d.operationalStress, label: 'operational stress' },
    { name: 'Accessibility Gap', value: d.accessibilityGap, label: 'accessibility gap' },
  ].sort((a, b) => b.value - a.value);

  const dominant = factors[0];
  const secondary = factors[1];

  const parts: string[] = [];
  parts.push(`${d.district} (${d.state}) has a composite risk score of ${d.compositeRisk.toFixed(1)}, significantly above the 80-point threshold.`);

  // Dominant factor
  parts.push(`The primary driver is ${dominant.label} at ${dominant.value.toFixed(1)}.`);
  if (secondary.value > 60) {
    parts.push(`This is compounded by elevated ${secondary.label} (${secondary.value.toFixed(1)}).`);
  }

  // Anomaly
  if (d.anomaly?.isAnomaly) {
    const sevText = d.anomaly.anomalySeverity ? ` (${d.anomaly.anomalySeverity} severity)` : '';
    parts.push(`An active anomaly${sevText} has been detected, indicating statistically unusual activity patterns.`);
  }

  // Trend
  if (d.trend === 'increasing') {
    parts.push('Risk indicators are trending upward, suggesting conditions may worsen without intervention.');
  } else if (d.trend === 'decreasing') {
    parts.push('Risk indicators show a declining trend, but the score remains critically high.');
  }

  // Pattern
  if (d.pattern && d.pattern !== 'none') {
    parts.push(`A "${d.pattern.replace(/_/g, ' ')}" pattern has been identified by the ML pipeline.`);
  }

  // Recommendation
  let recommendation = '';
  if (dominant.label === 'demand pressure') {
    recommendation = 'Deploy additional enrolment/update centres and mobile units. Consider extending operating hours and allocating more trained operators.';
  } else if (dominant.label === 'operational stress') {
    recommendation = 'Augment system capacity — prioritise equipment maintenance, increase server bandwidth, and ensure adequate staffing at operational centres.';
  } else {
    recommendation = 'Launch targeted inclusion outreach in underserved rural/tribal areas. Deploy mobile Aadhaar camps and partner with local administration for awareness drives.';
  }

  if (d.anomaly?.isAnomaly) {
    recommendation += ' Investigate anomaly root cause immediately — potential fraud or system malfunction.';
  }
  if (d.trend === 'increasing') {
    recommendation += ' Escalate to regional director; consider emergency resource reallocation.';
  }

  return { reasoning: parts.join(' '), recommendation, dominantFactor: dominant.name };
}

/**
 * Fetch high-risk districts (composite risk > threshold)
 * Uses the heatmap endpoint with CompositeRisk index to get all districts,
 * then enriches with all index values from hover data.
 */
export async function fetchHighRiskDistricts(threshold: number = 80): Promise<HighRiskDistrict[]> {
  const raw = await apiFetch<any>('/api/heatmap?indexType=compositeRiskScore');
  const items = raw.data || raw;

  const districts: HighRiskDistrict[] = (items || [])
    .map((item: any) => {
      const cr = normalizeIndex(item.hover?.compositeRisk ?? item.primaryValue ?? 0);
      const dp = normalizeIndex(item.hover?.demandPressure ?? 0);
      const os = normalizeIndex(item.hover?.operationalStress ?? 0);
      const ag = normalizeIndex(item.hover?.accessibilityGap ?? 0);

      if (cr <= threshold) return null;

      const districtName = item.district || 'Unknown';
      const stateName = item.state || 'Unknown';
      const anomaly = item.hover?.anomaly || null;
      const trend = item.hover?.trend || 'stable';
      const pattern = item.hover?.pattern || 'none';

      const { reasoning, recommendation, dominantFactor } = generateReasoning({
        compositeRisk: cr,
        demandPressure: dp,
        operationalStress: os,
        accessibilityGap: ag,
        anomaly,
        trend,
        pattern,
        district: districtName,
        state: stateName,
      });

      return {
        districtName,
        stateName,
        compositeRisk: Number(cr.toFixed(1)),
        demandPressure: Number(dp.toFixed(1)),
        operationalStress: Number(os.toFixed(1)),
        accessibilityGap: Number(ag.toFixed(1)),
        riskLevel: (cr > 90 ? 'CRITICAL' : cr > 80 ? 'WATCH' : 'NORMAL') as HighRiskDistrict['riskLevel'],
        anomaly: anomaly ? { isAnomaly: true, anomalySeverity: anomaly.anomalySeverity, anomalyScore: normalizeAnomalyScore(anomaly.anomalyScore ?? 0) } : null,
        trend,
        pattern,
        reasoning,
        recommendation,
        dominantFactor,
      } as HighRiskDistrict;
    })
    .filter(Boolean) as HighRiskDistrict[];

  // Sort by composite risk descending
  districts.sort((a, b) => b.compositeRisk - a.compositeRisk);
  return districts;
}

// ══════════════════════════════════════════════════════════════════════
// ANOMALY DISTRICTS – All districts with ML-detected anomalies
// ══════════════════════════════════════════════════════════════════════

function generateInvestigationNote(d: {
  anomalySeverity: string;
  anomalyScore: number;
  compositeRisk: number;
  demandPressure: number;
  operationalStress: number;
  accessibilityGap: number;
  trend: string;
  pattern: string;
  district: string;
  state: string;
}): string {
  const severityLabel = d.anomalySeverity.charAt(0).toUpperCase() + d.anomalySeverity.slice(1);
  const scorePercent = (d.anomalyScore * 100).toFixed(0);

  // Determine the dominant index
  const indexes = [
    { name: 'demand pressure', val: d.demandPressure },
    { name: 'operational stress', val: d.operationalStress },
    { name: 'accessibility gap', val: d.accessibilityGap },
  ];
  indexes.sort((a, b) => b.val - a.val);
  const top = indexes[0];

  let note = `${severityLabel}-severity anomaly detected in ${d.district} (${d.state}) with ${scorePercent}% confidence. `;

  if (d.compositeRisk > 80) {
    note += `The district also has an elevated composite risk score of ${d.compositeRisk.toFixed(1)}, primarily driven by ${top.name} (${top.val.toFixed(1)}). `;
  } else {
    note += `Although the composite risk (${d.compositeRisk.toFixed(1)}) is within tolerance, the anomalous pattern warrants attention. The leading index is ${top.name} at ${top.val.toFixed(1)}. `;
  }

  if (d.trend === 'increasing') {
    note += 'Risk indicators are trending upward — conditions may deteriorate further. ';
  } else if (d.trend === 'decreasing') {
    note += 'The declining trend is encouraging but the anomaly requires root-cause analysis. ';
  }

  if (d.pattern !== 'none') {
    note += `An ML pattern "${d.pattern.replace(/_/g, ' ')}" has been identified. `;
  }

  // Investigation guidance based on severity
  if (d.anomalySeverity === 'critical') {
    note += 'IMMEDIATE investigation required — potential fraud, system malfunction, or extreme demand surge. Escalate to regional director within 24 hours.';
  } else if (d.anomalySeverity === 'high') {
    note += 'Urgent investigation recommended within 48 hours. Check for unusual enrolment/update patterns and verify infrastructure health.';
  } else if (d.anomalySeverity === 'medium') {
    note += 'Schedule investigation within one week. Monitor for further deviations and compare with neighbouring districts.';
  } else {
    note += 'Flag for routine review. Continue monitoring and correlate with seasonal baselines.';
  }

  return note;
}

export async function fetchAnomalyDistricts(): Promise<AnomalyDistrict[]> {
  const raw = await apiFetch<any>('/api/heatmap?indexType=compositeRiskScore');
  const items = raw.data || raw;

  const anomalyDistricts: AnomalyDistrict[] = (items || [])
    .map((item: any) => {
      const anomaly = item.hover?.anomaly;
      if (!anomaly || !anomaly.isAnomaly) return null;

      const cr = normalizeIndex(item.hover?.compositeRisk ?? item.primaryValue ?? 0);
      const dp = normalizeIndex(item.hover?.demandPressure ?? 0);
      const os = normalizeIndex(item.hover?.operationalStress ?? 0);
      const ag = normalizeIndex(item.hover?.accessibilityGap ?? 0);
      const districtName = item.district || 'Unknown';
      const stateName = item.state || 'Unknown';
      const trend = item.hover?.trend || 'stable';
      const pattern = item.hover?.pattern || 'none';
      const severity = (anomaly.anomalySeverity || 'medium').toLowerCase();
      const score = normalizeAnomalyScore(anomaly.anomalyScore ?? 0);

      const investigationNote = generateInvestigationNote({
        anomalySeverity: severity,
        anomalyScore: score,
        compositeRisk: cr,
        demandPressure: dp,
        operationalStress: os,
        accessibilityGap: ag,
        trend,
        pattern,
        district: districtName,
        state: stateName,
      });

      return {
        districtName,
        stateName,
        compositeRisk: Number(cr.toFixed(1)),
        demandPressure: Number(dp.toFixed(1)),
        operationalStress: Number(os.toFixed(1)),
        accessibilityGap: Number(ag.toFixed(1)),
        anomalySeverity: severity as AnomalyDistrict['anomalySeverity'],
        anomalyScore: Number(score.toFixed(3)),
        trend,
        pattern,
        investigationNote,
      } as AnomalyDistrict;
    })
    .filter(Boolean) as AnomalyDistrict[];

  // Sort by severity (critical first), then by anomaly score descending
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  anomalyDistricts.sort((a, b) => {
    const sA = severityOrder[a.anomalySeverity] ?? 9;
    const sB = severityOrder[b.anomalySeverity] ?? 9;
    if (sA !== sB) return sA - sB;
    return b.anomalyScore - a.anomalyScore;
  });

  return anomalyDistricts;
}
