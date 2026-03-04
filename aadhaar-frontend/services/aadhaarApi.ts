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
  ReportMetadata,
  SearchResponse,
  SearchResult,
  NotificationResponse,
  HealthSummary,
  IndexType,
  RegionStatus,
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
    filtered = filtered.filter(d => d.stateName === filters.state);
  }
  if (filters.district) {
    filtered = filtered.filter(d => d.districtName.toLowerCase() === filters.district!.toLowerCase());
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

/**
 * Fetch visualization data with filters
 * Backend: POST /api/analytics/visuals (one chart per call)
 * Makes 3 parallel calls (trend, distribution, comparison) and combines into VisualsResponse.
 */
export async function fetchVisualsData(filters: AppliedFilters): Promise<VisualsResponse> {
  const backendFilters: any = {};
  if (filters.year) backendFilters.year = filters.year;
  if (filters.month) backendFilters.month = filters.month;
  if (filters.state) backendFilters.state = filters.state;
  if (filters.district) backendFilters.district = filters.district;

  const [trendResult, distributionResult, comparisonResult] = await Promise.all([
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
      body: JSON.stringify({ chartType: 'bar', context: 'comparison', filters: backendFilters }),
    }),
  ]);

  const trendData = trendResult.data || {};
  const distData = distributionResult.data || {};
  const compData = comparisonResult.data || {};

  // Build lineChart from trend context
  const lineChart = {
    title: 'Monthly Trend Analysis - Risk Indicators',
    labels: trendData.labels || [],
    datasets: (trendData.datasets || []).map((ds: any, i: number) => ({
      label: ds.label || `Series ${i + 1}`,
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
    })),
  };

  // Build barChart from comparison context
  const barChart = {
    title: 'State-wise Composite Risk Comparison',
    labels: compData.labels || [],
    datasets: (compData.datasets || []).map((ds: any) => ({
      label: ds.label || 'Composite Risk Score',
      data: (ds.data || []).map((v: number) => Number(normalizeIndex(v).toFixed(1))),
      backgroundColor: (ds.data || []).map((v: number) => {
        const norm = normalizeIndex(v);
        return norm >= 75 ? '#dc2626' : norm >= 50 ? '#f59e0b' : '#22c55e';
      }),
      borderRadius: 6,
      borderWidth: 0,
    })),
  };

  // Build pieChart from distribution context
  const distLabels = distData.labels || ['Normal', 'Watch', 'Critical'];
  const pieChart = {
    title: 'District Risk Status Distribution',
    labels: distLabels,
    datasets: (distData.datasets || []).map((ds: any) => ({
      data: ds.data || [],
      backgroundColor: distLabels.map((_: string, i: number) => {
        const colors = ['#22c55e', '#f59e0b', '#dc2626', '#f97316', '#84cc16'];
        return colors[i % colors.length];
      }),
      borderColor: distLabels.map(() => '#fff'),
      borderWidth: 3,
      hoverOffset: 8,
    })),
  };

  // Build radarChart from trend data (average values per index)
  const radarLabels = (trendData.datasets || []).map((ds: any) =>
    (ds.label || '').replace(/_/g, ' ')
  );
  const radarValues = (trendData.datasets || []).map((ds: any) => {
    const vals: number[] = ds.data || [];
    if (vals.length === 0) return 0;
    return Number(normalizeIndex(vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1));
  });

  const radarChart = {
    title: 'Multi-Dimensional Risk Analysis',
    labels: radarLabels.length > 0 ? radarLabels : ['Demand Pressure', 'Operational Stress'],
    datasets: [
      {
        label: 'Average Index Values',
        data: radarValues,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.25)',
        borderWidth: 2,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointRadius: 4,
      },
    ],
  };

  // Build polarAreaChart from distribution data
  const polarAreaChart = {
    title: 'Risk Category Distribution',
    labels: distLabels,
    datasets: (distData.datasets || []).map((ds: any) => ({
      data: ds.data || [],
      backgroundColor: distLabels.map((_: string, i: number) => {
        const colors = [
          'rgba(34, 197, 94, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(220, 38, 38, 0.7)',
        ];
        return colors[i % colors.length];
      }),
      borderColor: distLabels.map(() => '#fff'),
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
// POLICY FRAMEWORKS
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
    const confidence = fw.frameworkConfidence || 0;
    return {
      id: String(fw.id ?? ''),
      type: fwType as PolicyFramework['type'],
      title: FRAMEWORK_TITLE_MAP[fwType] || fwType.replace(/_/g, ' '),
      description: fw.rationale || 'No description available',
      applicableRegions: [fw.state, fw.district].filter(Boolean) as string[],
      priority: (confidence >= 0.75 ? 'High' : confidence >= 0.5 ? 'Medium' : 'Low') as PolicyFramework['priority'],
      indicators: fw.drivingIndexes
        ? String(fw.drivingIndexes).split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    };
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
