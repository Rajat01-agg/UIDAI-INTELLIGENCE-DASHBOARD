import React from 'react';

// ============================================
// AADHAAR INTELLIGENCE SYSTEM TYPES
// ============================================

// Status types for regions
export type RegionStatus = 'NORMAL' | 'WATCH' | 'CRITICAL';
export type TrendDirection = 'up' | 'down' | 'stable';
export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

// Metric types for filtering
export type MetricType = 'Enrolment' | 'Biometric' | 'Demographic';
export type IndexType = 'Demand' | 'Stress' | 'Gap' | 'CompositeRisk';
export type AgeGroup = 'All' | '0-5' | '5-18' | '18-60' | '60+';

// ============================================
// DASHBOARD OVERVIEW (KPI Cards)
// ============================================
export interface DashboardOverview {
  totalTransactions: number;
  avgDemandPressure: number;
  avgOperationalStress: number;
  overallCompositeRisk: number;
  highRiskDistrictCount: number;
  lastUpdated: string;
}

// ============================================
// STATE & DISTRICT SUMMARY
// ============================================
export interface StateSummary {
  stateCode: string;
  stateName: string;
  status: RegionStatus;
  hasAnomaly: boolean;
  trend: TrendDirection;
  compositeRiskIndex: number;
  districtCount: number;
  highRiskDistricts: number;
}

export interface DistrictSummary {
  districtCode: string;
  districtName: string;
  stateName: string;
  status: RegionStatus;
  demandPressureIndex: number;
  operationalStressIndex: number;
  accessibilityGapIndex: number;
  compositeRiskIndex: number;
  trend: TrendDirection;
  signals: SignalBadge[];
  coordinates: [number, number]; // [lat, lng] for map
}

export interface SignalBadge {
  type: 'ANOMALY' | 'RISING_TREND' | 'FALLING_TREND' | 'HIGH_DEMAND' | 'LOW_COVERAGE';
  label: string;
}

// ============================================
// FILTER OPTIONS (from /api/metadata/filters)
// ============================================
export interface FilterOptions {
  states: { code: string; name: string }[];
  districts: { code: string; name: string; stateCode: string }[];
  years: number[];
  months: { value: number; label: string }[];
  metricTypes: MetricType[];
  ageGroups: AgeGroup[];
  indexTypes: IndexType[];
}

export interface AppliedFilters {
  state?: string;
  district?: string;
  year?: number;
  month?: number;
  metricType?: MetricType;
  ageGroup?: AgeGroup;
  indexType?: IndexType;
}

// ============================================
// HEATMAP DATA
// ============================================
export interface HeatmapDataPoint {
  districtCode: string;
  districtName: string;
  stateName: string;
  coordinates: [number, number];
  indexValue: number;
  indexType: IndexType;
  status: RegionStatus;
  signals: SignalBadge[];
}

export interface HeatmapResponse {
  data: HeatmapDataPoint[];
  indexType: IndexType;
  minValue: number;
  maxValue: number;
}

// ============================================
// CHARTS & VISUALS DATA (Chart.js Compatible - Zero Transformation)
// ============================================

/**
 * Chart.js compatible dataset format
 * Backend returns this format directly - no frontend transformation needed
 */
export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  tension?: number;
  fill?: boolean;
}

/**
 * Line/Bar Chart data format
 * Directly compatible with Chart.js data prop
 */
export interface LineBarChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Pie/Doughnut Chart data format  
 * Directly compatible with Chart.js data prop
 */
export interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

/**
 * Visuals API Response
 * All chart data is Chart.js compatible - zero transformation required
 */
export interface VisualsResponse {
  lineChart?: LineBarChartData & { title?: string };
  barChart?: LineBarChartData & { title?: string };
  pieChart?: PieChartData & { title?: string };
  radarChart?: LineBarChartData & { title?: string };
  polarAreaChart?: PieChartData & { title?: string };
}

// ============================================
// ALERTS & NOTIFICATIONS
// ============================================
export interface AadhaarAlert {
  id: string;
  region: string;
  regionType: 'State' | 'District';
  alertType: 'ANOMALY' | 'TREND' | 'GAP' | 'CAPACITY';
  severity: AlertSeverity;
  title: string;
  explanation: string;
  confidence: number; // 0-100
  detectedAt: string;
  metrics?: {
    label: string;
    value: number;
    threshold?: number;
  }[];
}

// ============================================
// HIGH RISK DISTRICT (Alerts page)
// ============================================
export interface HighRiskDistrict {
  districtName: string;
  stateName: string;
  compositeRisk: number;      // 0-100 normalised
  demandPressure: number;     // 0-100
  operationalStress: number;  // 0-100
  accessibilityGap: number;   // 0-100
  riskLevel: 'CRITICAL' | 'WATCH' | 'NORMAL';
  anomaly: { isAnomaly: boolean; anomalySeverity?: string; anomalyScore?: number } | null;
  trend: string;              // 'increasing' | 'decreasing' | 'stable'
  pattern: string;            // pattern type or 'none'
  reasoning: string;          // AI-generated explanation
  recommendation: string;     // Decision-maker action
  dominantFactor: string;     // Which index is driving the risk
}

// ============================================
// ANOMALY DISTRICT (Alerts page – Anomalies tab)
// ============================================
export interface AnomalyDistrict {
  districtName: string;
  stateName: string;
  compositeRisk: number;        // 0-100 normalised
  demandPressure: number;       // 0-100
  operationalStress: number;    // 0-100
  accessibilityGap: number;     // 0-100
  anomalySeverity: 'critical' | 'high' | 'medium' | 'low';
  anomalyScore: number;         // 0-1 confidence-like score
  trend: string;                // 'increasing' | 'decreasing' | 'stable'
  pattern: string;              // pattern type or 'none'
  investigationNote: string;    // AI-generated investigation guidance
}

// ============================================
// POLICY FRAMEWORKS & PREDICTIVE RISKS
// ============================================
export type PolicyFrameworkType = 
  | 'CAPACITY_AUGMENTATION' 
  | 'OPERATIONAL_STABILISATION' 
  | 'INCLUSION_OUTREACH' 
  | 'MONITOR_ONLY';

export type RiskSignal = 'stable' | 'risk_building' | 'likely_spike';

export interface PolicyFramework {
  id: string;
  type: PolicyFrameworkType;
  title: string;
  description: string;
  applicableRegions: string[];
  priority: 'High' | 'Medium' | 'Low';
  indicators: string[];
  confidence: number;              // 0-100
  state?: string;
  district?: string;
  metricCategory?: string;
  predictiveSignal?: RiskSignal;
}

export interface PredictiveRisk {
  id: string;
  state: string;
  district: string;
  metricCategory: string;          // enrolment | biometric_update | demographic_update
  ageGroup: string;                // age_0_5 | age_6_17 | age_18_plus
  riskSignal: RiskSignal;
  riskScore: number;               // 0-100 normalised
  predictionConfidence: number;    // 0-100 normalised
  contributingFactors: string;     // explanation text
  aiRecommendation: string;        // generated recommendation
}

// ============================================
// REPORTS
// ============================================
export interface ReportMetadata {
  id: string;
  title: string;
  generatedAt: string;
  filters: AppliedFilters;
  status: 'Ready' | 'Processing' | 'Failed';
  fileUrl?: string;
  fileSize?: string;
}

// ============================================
// VIEW STATE (Navigation)
// ============================================
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  HEATMAP = 'HEATMAP',
  CHARTS = 'CHARTS',
  REPORTS = 'REPORTS',
  ALERTS = 'ALERTS',
  POLICY = 'POLICY',
  IMPACT = 'IMPACT', // Added Impact Tracker view
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE'
}

// ============================================
// AUTHENTICATION TYPES
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer' | 'analyst';
  avatar?: string;
  department?: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  mobileNumber?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp
}

export interface GoogleAuthPayload {
  credential: string; // Google OAuth token
}

// ============================================
// SEARCH TYPES
// ============================================
export type SearchResultType = 'state' | 'district' | 'alert';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  status?: RegionStatus;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalCount: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================
export interface Notification {
  id: string;
  type: 'emergency' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  region?: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ============================================
// HEALTH SUMMARY (Dashboard Widget)
// ============================================
export interface HealthSummary {
  majorAnomaliesCount: number;
  systemStressLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  nationalRiskTrend: TrendDirection;
  criticalStatesCount: number;
  watchStatesCount: number;
  lastUpdated: string;
}

// ============================================
// LEGACY TYPES (kept for compatibility during migration)
// ============================================
export interface Metric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}
