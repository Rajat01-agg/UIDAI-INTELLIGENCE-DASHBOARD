/**
 * AlertsPage Component
 *
 * Shows high-risk districts (composite risk score > 85) with detailed reasoning,
 * risk breakdowns, and actionable recommendations for decision makers.
 * Also displays real-time system alerts from the ML pipeline.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Loader2,
  AlertCircle,
  Activity,
  Users,
  Filter,
  RefreshCw,
  Shield,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  BarChart3,
  FileWarning,
  Eye,
} from 'lucide-react';
import { AadhaarAlert, AlertSeverity, HighRiskDistrict, AnomalyDistrict } from '../types';
import { fetchAlerts, fetchHighRiskDistricts, fetchAnomalyDistricts } from '../services/aadhaarApi';
import { useFilters } from '../hooks/useFilters';

// ── Severity colours ────────────────────────────────────────────────
const getSeverityClasses = (severity: AlertSeverity): { bg: string; text: string; border: string } => {
  switch (severity) {
    case 'Critical':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'High':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    case 'Medium':
      return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
    case 'Low':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  }
};

// ── Risk level badge ────────────────────────────────────────────────
const getRiskBadge = (score: number) => {
  if (score > 95) return { label: 'EXTREME', bg: 'bg-red-600', text: 'text-white', ring: 'ring-red-600/30' };
  if (score > 90) return { label: 'CRITICAL', bg: 'bg-red-500', text: 'text-white', ring: 'ring-red-500/30' };
  return { label: 'HIGH', bg: 'bg-orange-500', text: 'text-white', ring: 'ring-orange-500/30' };
};

// ── Index bar colour ────────────────────────────────────────────────
const getBarColor = (value: number): string => {
  if (value > 80) return 'bg-red-500';
  if (value > 60) return 'bg-orange-500';
  if (value > 40) return 'bg-yellow-500';
  return 'bg-green-500';
};

// ── Trend icon ──────────────────────────────────────────────────────
const TrendIcon: React.FC<{ trend: string }> = ({ trend }) => {
  if (trend === 'increasing') return <ArrowUpRight className="h-4 w-4 text-red-500" />;
  if (trend === 'decreasing') return <ArrowDownRight className="h-4 w-4 text-green-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
};

// ── Risk Score Gauge ────────────────────────────────────────────────
const RiskGauge: React.FC<{ score: number }> = ({ score }) => {
  const badge = getRiskBadge(score);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={score > 95 ? '#dc2626' : score > 90 ? '#ef4444' : '#f97316'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{score.toFixed(1)}</span>
        </div>
      </div>
      <span className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text} ring-2 ${badge.ring}`}>
        {badge.label}
      </span>
    </div>
  );
};

// ── Index Breakdown Bar ─────────────────────────────────────────────
const IndexBar: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-3">
    <div className="w-5 h-5 flex items-center justify-center text-gray-500">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600 truncate">{label}</span>
        <span className={`text-xs font-bold ${value > 80 ? 'text-red-600' : value > 60 ? 'text-orange-600' : value > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(value)}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════

// ── Anomaly severity colours ────────────────────────────────────────
const getAnomalySeverityClasses = (severity: string): { bg: string; text: string; border: string; ringColor: string } => {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', ringColor: 'ring-red-500/30' };
    case 'high':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', ringColor: 'ring-orange-500/30' };
    case 'medium':
      return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', ringColor: 'ring-yellow-500/30' };
    case 'low':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', ringColor: 'ring-blue-500/30' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300', ringColor: 'ring-gray-500/30' };
  }
};

const AlertsPage: React.FC = () => {
  const [highRiskDistricts, setHighRiskDistricts] = useState<HighRiskDistrict[]>([]);
  const [anomalyDistricts, setAnomalyDistricts] = useState<AnomalyDistrict[]>([]);
  const [alerts, setAlerts] = useState<AadhaarAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedAnomalies, setExpandedAnomalies] = useState<Set<string>>(new Set());
  const [stateFilterValue, setStateFilterValue] = useState<string>('All');
  const [tab, setTab] = useState<'districts' | 'anomalies' | 'alerts'>('districts');

  const { filterOptions } = useFilters();

  // ── Load data ─────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [districts, anomalies, alertsData] = await Promise.all([
        fetchHighRiskDistricts(80).catch((err) => {
          console.warn('High risk districts API unavailable, using mock:', err);
          return generateMockHighRiskDistricts();
        }),
        fetchAnomalyDistricts().catch((err) => {
          console.warn('Anomaly districts API unavailable, using mock:', err);
          return generateMockAnomalyDistricts();
        }),
        fetchAlerts({}).catch((err) => {
          console.warn('Alerts API unavailable, using mock:', err);
          return generateMockAlerts();
        }),
      ]);

      setHighRiskDistricts(districts);
      setAnomalyDistricts(anomalies);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to load alerts data:', err);
      setError('Failed to load data. Showing available information.');
      setHighRiskDistricts(generateMockHighRiskDistricts());
      setAnomalyDistricts(generateMockAnomalyDistricts());
      setAlerts(generateMockAlerts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Toggle card expansion ─────────────────────────────────────
  const toggleCard = (key: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAnomaly = (key: string) => {
    setExpandedAnomalies((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── Filters ───────────────────────────────────────────────────
  const filteredDistricts = highRiskDistricts.filter((d) =>
    stateFilterValue === 'All' || d.stateName === stateFilterValue
  );

  const filteredAnomalies = anomalyDistricts.filter((d) =>
    stateFilterValue === 'All' || d.stateName === stateFilterValue
  );

  const filteredAlerts = alerts.filter((a) =>
    stateFilterValue === 'All' || a.region.includes(stateFilterValue)
  );

  // ── Unique states from data ───────────────────────────────────
  const statesInData = [
    ...new Set([
      ...highRiskDistricts.map((d) => d.stateName),
      ...anomalyDistricts.map((d) => d.stateName),
    ]),
  ].sort();

  // ── Stats ─────────────────────────────────────────────────────
  const stats = {
    totalHighRisk: filteredDistricts.length,
    criticalCount: filteredDistricts.filter((d) => d.compositeRisk > 90).length,
    extremeCount: filteredDistricts.filter((d) => d.compositeRisk > 95).length,
    avgRisk: filteredDistricts.length > 0
      ? filteredDistricts.reduce((s, d) => s + d.compositeRisk, 0) / filteredDistricts.length
      : 0,
    withAnomalies: filteredDistricts.filter((d) => d.anomaly?.isAnomaly).length,
    risingTrend: filteredDistricts.filter((d) => d.trend === 'increasing').length,
    totalAlerts: filteredAlerts.length,
    totalAnomalies: filteredAnomalies.length,
    criticalAnomalies: filteredAnomalies.filter((d) => d.anomalySeverity === 'critical').length,
    highAnomalies: filteredAnomalies.filter((d) => d.anomalySeverity === 'high').length,
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            Risk Alerts &amp; Intelligence
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Districts requiring immediate attention — Composite Risk Score &gt; 80
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300
                     rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50
                     transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Summary Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-lg border-2 border-red-200 p-3 shadow-sm">
          <p className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">High Risk Districts</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{stats.totalHighRisk}</p>
        </div>
        <div className="bg-white rounded-lg border border-red-300 p-3 shadow-sm">
          <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">Extreme (&gt;95)</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.extremeCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-orange-200 p-3 shadow-sm">
          <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wider">Critical (&gt;90)</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.criticalCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Avg Risk Score</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgRisk.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-lg border border-purple-200 p-3 shadow-sm">
          <p className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider">ML Anomalies</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalAnomalies}</p>
          {stats.criticalAnomalies > 0 && (
            <p className="text-[10px] text-red-500 mt-0.5">{stats.criticalAnomalies} critical</p>
          )}
        </div>
        <div className="bg-white rounded-lg border border-rose-200 p-3 shadow-sm">
          <p className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">Rising Trend</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{stats.risingTrend}</p>
        </div>
        <div className="bg-white rounded-lg border border-blue-200 p-3 shadow-sm">
          <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Active Alerts</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalAlerts}</p>
        </div>
      </div>

      {/* ── Filters & Tab Selector ──────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>

          <select
            value={stateFilterValue}
            onChange={(e) => setStateFilterValue(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option value="All">All States / UTs</option>
            {statesInData.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Tabs */}
          <div className="ml-auto flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setTab('districts')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === 'districts'
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Shield className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              High Risk ({filteredDistricts.length})
            </button>
            <button
              onClick={() => setTab('anomalies')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === 'anomalies'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Anomalies ({filteredAnomalies.length})
            </button>
            <button
              onClick={() => setTab('alerts')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === 'alerts'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <AlertTriangle className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              System Alerts ({filteredAlerts.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────── */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-3" />
          <p className="text-gray-600">Analyzing district risk profiles...</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB: HIGH RISK DISTRICTS                          */}
      {/* ══════════════════════════════════════════════════ */}
      {!loading && tab === 'districts' && (
        <>
          {filteredDistricts.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Shield className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No districts above risk threshold</p>
              <p className="text-gray-400 text-sm mt-1">
                All districts are currently below the 80-point composite risk threshold.
              </p>
            </div>
          ) : (
            <>
              {/* Decision-maker banner */}
              <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg mt-0.5">
                    <FileWarning className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900">Decision Maker Brief</h3>
                    <p className="text-sm text-red-800 mt-1">
                      <strong>{filteredDistricts.length} district{filteredDistricts.length > 1 ? 's' : ''}</strong> across{' '}
                      <strong>{new Set(filteredDistricts.map(d => d.stateName)).size} state{new Set(filteredDistricts.map(d => d.stateName)).size > 1 ? 's' : ''}</strong>{' '}
                      have composite risk scores exceeding 80.
                      {stats.extremeCount > 0 && (
                        <> Of these, <strong className="text-red-700">{stats.extremeCount}</strong> are in <em>extreme</em> (&gt;95) territory. </>
                      )}
                      {stats.risingTrend > 0 && (
                        <> <strong className="text-red-700">{stats.risingTrend}</strong> show a <em>worsening trend</em>. </>
                      )}
                      {stats.withAnomalies > 0 && (
                        <> <strong className="text-red-700">{stats.withAnomalies}</strong> have active ML-detected anomalies requiring investigation. </>
                      )}
                      Immediate review and resource allocation is recommended.
                    </p>
                  </div>
                </div>
              </div>

              {/* District Cards */}
              <div className="space-y-4">
                {filteredDistricts.map((d, idx) => {
                  const key = `${d.stateName}-${d.districtName}`;
                  const expanded = expandedCards.has(key);
                  const badge = getRiskBadge(d.compositeRisk);

                  return (
                    <div
                      key={key}
                      className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${
                        d.compositeRisk > 95 ? 'border-red-300' : d.compositeRisk > 90 ? 'border-orange-300' : 'border-yellow-300'
                      }`}
                    >
                      {/* Card Header */}
                      <div
                        className={`px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${
                          d.compositeRisk > 95 ? 'bg-red-50/40' : d.compositeRisk > 90 ? 'bg-orange-50/40' : 'bg-yellow-50/30'
                        }`}
                        onClick={() => toggleCard(key)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </div>

                          {/* District Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900">{d.districtName}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                                {badge.label}
                              </span>
                              {d.anomaly?.isAnomaly && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                                  Anomaly
                                </span>
                              )}
                              {d.trend === 'increasing' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 flex items-center gap-0.5">
                                  <TrendingUp className="h-3 w-3" /> Rising
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-500">{d.stateName}</span>
                              <span className="text-gray-300 mx-1">&bull;</span>
                              <span className="text-sm text-gray-500">Dominant: <strong className="text-gray-700">{d.dominantFactor}</strong></span>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="flex-shrink-0 text-right mr-2">
                            <div className="text-3xl font-black text-gray-900">{d.compositeRisk.toFixed(1)}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Risk Score</div>
                          </div>

                          {/* Expand toggle */}
                          <div className="flex-shrink-0">
                            {expanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expanded && (
                        <div className="border-t border-gray-100">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-100">

                            {/* Column 1: Risk Gauge + Breakdown */}
                            <div className="p-5">
                              <div className="flex items-start gap-5">
                                <RiskGauge score={d.compositeRisk} />
                                <div className="flex-1 space-y-3">
                                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Index Breakdown</p>
                                  <IndexBar
                                    label="Demand Pressure"
                                    value={d.demandPressure}
                                    icon={<Users className="h-4 w-4" />}
                                  />
                                  <IndexBar
                                    label="Operational Stress"
                                    value={d.operationalStress}
                                    icon={<Activity className="h-4 w-4" />}
                                  />
                                  <IndexBar
                                    label="Accessibility Gap"
                                    value={d.accessibilityGap}
                                    icon={<Target className="h-4 w-4" />}
                                  />
                                </div>
                              </div>

                              {/* Signal badges */}
                              <div className="mt-4 flex flex-wrap gap-2">
                                {d.anomaly?.isAnomaly && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                    <Zap className="h-3 w-3" />
                                    Anomaly {d.anomaly.anomalySeverity && `(${d.anomaly.anomalySeverity})`}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                                  <TrendIcon trend={d.trend} />
                                  Trend: {d.trend}
                                </span>
                                {d.pattern !== 'none' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    <BarChart3 className="h-3 w-3" />
                                    Pattern: {d.pattern.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Column 2: Reasoning */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <Info className="h-4 w-4 text-blue-600" />
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">AI Risk Analysis</p>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {d.reasoning}
                              </p>
                            </div>

                            {/* Column 3: Recommendation */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <Eye className="h-4 w-4 text-green-600" />
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Recommended Action</p>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {d.recommendation}
                              </p>
                              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider mb-1">Priority</p>
                                <p className="text-sm font-semibold text-amber-900">
                                  {d.compositeRisk > 95
                                    ? 'Immediate — Escalate to Regional Director within 24 hours'
                                    : d.compositeRisk > 90
                                    ? 'Urgent — Action required within 48 hours'
                                    : 'High — Review and plan response within 1 week'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB: ML ANOMALIES                                 */}
      {/* ══════════════════════════════════════════════════ */}
      {!loading && tab === 'anomalies' && (
        <>
          {filteredAnomalies.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Zap className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No anomalies detected</p>
              <p className="text-gray-400 text-sm mt-1">
                The ML pipeline has not flagged any anomalous districts at this time.
              </p>
            </div>
          ) : (
            <>
              {/* Anomaly summary banner */}
              <div className="bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg mt-0.5">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">Anomaly Detection Summary</h3>
                    <p className="text-sm text-purple-800 mt-1">
                      The ML pipeline has detected <strong>{filteredAnomalies.length} anomalous district{filteredAnomalies.length > 1 ? 's' : ''}</strong> across{' '}
                      <strong>{new Set(filteredAnomalies.map(d => d.stateName)).size} state{new Set(filteredAnomalies.map(d => d.stateName)).size > 1 ? 's' : ''}</strong>.
                      {stats.criticalAnomalies > 0 && (
                        <> <strong className="text-red-700">{stats.criticalAnomalies}</strong> are at <em>critical</em> severity requiring immediate investigation. </>
                      )}
                      {stats.highAnomalies > 0 && (
                        <> <strong className="text-orange-700">{stats.highAnomalies}</strong> are at <em>high</em> severity. </>
                      )}
                      Anomalies indicate statistically unusual patterns that deviate from expected operational baselines.
                      Each district below includes an AI-generated investigation note for decision makers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Severity distribution */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
                  const count = filteredAnomalies.filter(d => d.anomalySeverity === sev).length;
                  const cls = getAnomalySeverityClasses(sev);
                  return (
                    <div key={sev} className={`bg-white rounded-lg border-2 ${cls.border} p-3 shadow-sm`}>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider ${cls.text}`}>{sev} Severity</p>
                      <p className={`text-2xl font-bold mt-1 ${cls.text}`}>{count}</p>
                    </div>
                  );
                })}
              </div>

              {/* Anomaly Cards */}
              <div className="space-y-4">
                {filteredAnomalies.map((d, idx) => {
                  const key = `anom-${d.stateName}-${d.districtName}`;
                  const expanded = expandedAnomalies.has(key);
                  const cls = getAnomalySeverityClasses(d.anomalySeverity);
                  const scorePercent = (d.anomalyScore * 100).toFixed(0);

                  return (
                    <div
                      key={key}
                      className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${cls.border}`}
                    >
                      {/* Card Header */}
                      <div
                        className={`px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${cls.bg}`}
                        onClick={() => toggleAnomaly(key)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </div>

                          {/* District Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900">{d.districtName}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls.bg} ${cls.text} ring-2 ${cls.ringColor}`}>
                                {d.anomalySeverity}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                d.compositeRisk > 90
                                  ? 'bg-red-100 text-red-700'
                                  : d.compositeRisk > 80
                                  ? 'bg-orange-100 text-orange-700'
                                  : d.compositeRisk > 60
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                Risk {d.compositeRisk.toFixed(1)}
                              </span>
                              {d.trend === 'increasing' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 flex items-center gap-0.5">
                                  <TrendingUp className="h-3 w-3" /> Rising
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-500">{d.stateName}</span>
                              {d.pattern !== 'none' && (
                                <>
                                  <span className="text-gray-300 mx-1">&bull;</span>
                                  <span className="text-sm text-gray-500">Pattern: <strong className="text-gray-700">{d.pattern.replace(/_/g, ' ')}</strong></span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Anomaly Score */}
                          <div className="flex-shrink-0 text-right mr-2">
                            <div className="text-3xl font-black text-purple-700">{scorePercent}%</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Confidence</div>
                          </div>

                          {/* Expand toggle */}
                          <div className="flex-shrink-0">
                            {expanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expanded && (
                        <div className="border-t border-gray-100">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-gray-100">

                            {/* Column 1: Index Overview */}
                            <div className="p-5">
                              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-3">District Index Overview</p>
                              <div className="space-y-3">
                                <IndexBar label="Composite Risk" value={d.compositeRisk} icon={<Shield className="h-4 w-4" />} />
                                <IndexBar label="Demand Pressure" value={d.demandPressure} icon={<Users className="h-4 w-4" />} />
                                <IndexBar label="Operational Stress" value={d.operationalStress} icon={<Activity className="h-4 w-4" />} />
                                <IndexBar label="Accessibility Gap" value={d.accessibilityGap} icon={<Target className="h-4 w-4" />} />
                              </div>

                              {/* Signal badges */}
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${cls.bg} ${cls.text} border ${cls.border}`}>
                                  <Zap className="h-3 w-3" />
                                  {d.anomalySeverity.toUpperCase()} Anomaly — {scorePercent}% confidence
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                                  <TrendIcon trend={d.trend} />
                                  Trend: {d.trend}
                                </span>
                                {d.pattern !== 'none' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    <BarChart3 className="h-3 w-3" />
                                    {d.pattern.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Column 2: Investigation Note */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <Eye className="h-4 w-4 text-purple-600" />
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">AI Investigation Note</p>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {d.investigationNote}
                              </p>
                              <div className={`mt-4 p-3 rounded-lg ${cls.bg} border ${cls.border}`}>
                                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${cls.text}`}>Response Timeline</p>
                                <p className={`text-sm font-semibold ${cls.text}`}>
                                  {d.anomalySeverity === 'critical'
                                    ? 'Immediate — Escalate to Regional Director within 24 hours'
                                    : d.anomalySeverity === 'high'
                                    ? 'Urgent — Investigate within 48 hours'
                                    : d.anomalySeverity === 'medium'
                                    ? 'Schedule investigation within 1 week'
                                    : 'Routine review — monitor for further deviations'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB: SYSTEM ALERTS                                */}
      {/* ══════════════════════════════════════════════════ */}
      {!loading && tab === 'alerts' && (
        <>
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No active alerts</p>
              <p className="text-gray-400 text-sm mt-1">No system alerts at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAlerts.map((alert) => {
                const severityClasses = getSeverityClasses(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className={`bg-white rounded-lg border ${severityClasses.border} shadow-sm overflow-hidden`}
                  >
                    <div className={`px-4 py-3 ${severityClasses.bg} border-b ${severityClasses.border}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/60">
                            <AlertTriangle className={`h-5 w-5 ${severityClasses.text}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{alert.region} ({alert.regionType})</span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${severityClasses.bg} ${severityClasses.text}`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 mb-4">{alert.explanation}</p>
                      {alert.metrics && alert.metrics.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-[10px] text-gray-500 font-medium uppercase mb-2">Key Metrics</p>
                          <div className="grid grid-cols-2 gap-2">
                            {alert.metrics.map((m, mi) => (
                              <div key={mi} className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">{m.label}</span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {m.value.toFixed(1)}
                                  {m.threshold && <span className="text-xs text-gray-400 ml-1">/ {m.threshold}</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 uppercase font-medium">Confidence</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                alert.confidence >= 80 ? 'bg-green-500' : alert.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${alert.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{alert.confidence}%</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {new Date(alert.detectedAt).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
function generateMockAnomalyDistricts(): AnomalyDistrict[] {
  return [
    {
      districtName: 'Varanasi',
      stateName: 'Uttar Pradesh',
      compositeRisk: 96.8,
      demandPressure: 94.2,
      operationalStress: 91.5,
      accessibilityGap: 78.3,
      anomalySeverity: 'critical',
      anomalyScore: 0.94,
      trend: 'increasing',
      pattern: 'likely_spike',
      investigationNote: 'Critical-severity anomaly detected in Varanasi (Uttar Pradesh) with 94% confidence. The district also has an elevated composite risk score of 96.8, primarily driven by demand pressure (94.2). Risk indicators are trending upward — conditions may deteriorate further. An ML pattern "likely spike" has been identified. IMMEDIATE investigation required — potential fraud, system malfunction, or extreme demand surge. Escalate to regional director within 24 hours.',
    },
    {
      districtName: 'Patna',
      stateName: 'Bihar',
      compositeRisk: 94.3,
      demandPressure: 88.7,
      operationalStress: 95.1,
      accessibilityGap: 72.6,
      anomalySeverity: 'high',
      anomalyScore: 0.87,
      trend: 'increasing',
      pattern: 'seasonal_surge',
      investigationNote: 'High-severity anomaly detected in Patna (Bihar) with 87% confidence. The district also has an elevated composite risk score of 94.3, primarily driven by operational stress (95.1). Risk indicators are trending upward — conditions may deteriorate further. An ML pattern "seasonal surge" has been identified. Urgent investigation recommended within 48 hours. Check for unusual enrolment/update patterns and verify infrastructure health.',
    },
    {
      districtName: 'Gaya',
      stateName: 'Bihar',
      compositeRisk: 88.2,
      demandPressure: 91.3,
      operationalStress: 74.6,
      accessibilityGap: 82.7,
      anomalySeverity: 'medium',
      anomalyScore: 0.72,
      trend: 'decreasing',
      pattern: 'none',
      investigationNote: 'Medium-severity anomaly detected in Gaya (Bihar) with 72% confidence. The district also has an elevated composite risk score of 88.2, primarily driven by demand pressure (91.3). The declining trend is encouraging but the anomaly requires root-cause analysis. Schedule investigation within one week. Monitor for further deviations and compare with neighbouring districts.',
    },
    {
      districtName: 'Lucknow',
      stateName: 'Uttar Pradesh',
      compositeRisk: 72.4,
      demandPressure: 68.1,
      operationalStress: 71.8,
      accessibilityGap: 65.3,
      anomalySeverity: 'medium',
      anomalyScore: 0.65,
      trend: 'stable',
      pattern: 'none',
      investigationNote: 'Medium-severity anomaly detected in Lucknow (Uttar Pradesh) with 65% confidence. Although the composite risk (72.4) is within tolerance, the anomalous pattern warrants attention. The leading index is operational stress at 71.8. Schedule investigation within one week. Monitor for further deviations and compare with neighbouring districts.',
    },
    {
      districtName: 'Jaipur',
      stateName: 'Rajasthan',
      compositeRisk: 76.1,
      demandPressure: 72.5,
      operationalStress: 74.3,
      accessibilityGap: 69.8,
      anomalySeverity: 'low',
      anomalyScore: 0.52,
      trend: 'stable',
      pattern: 'none',
      investigationNote: 'Low-severity anomaly detected in Jaipur (Rajasthan) with 52% confidence. Although the composite risk (76.1) is within tolerance, the anomalous pattern warrants attention. The leading index is operational stress at 74.3. Flag for routine review. Continue monitoring and correlate with seasonal baselines.',
    },
  ];
}

// MOCK DATA (fallback when API is unavailable)
// ══════════════════════════════════════════════════════════════════════

function generateMockHighRiskDistricts(): HighRiskDistrict[] {
  return [
    {
      districtName: 'Varanasi',
      stateName: 'Uttar Pradesh',
      compositeRisk: 96.8,
      demandPressure: 94.2,
      operationalStress: 91.5,
      accessibilityGap: 78.3,
      riskLevel: 'CRITICAL',
      anomaly: { isAnomaly: true, anomalySeverity: 'critical', anomalyScore: 0.94 },
      trend: 'increasing',
      pattern: 'likely_spike',
      reasoning: 'Varanasi (Uttar Pradesh) has a composite risk score of 96.8, significantly above the 85-point threshold. The primary driver is demand pressure at 94.2. This is compounded by elevated operational stress (91.5). An active anomaly (critical severity) has been detected, indicating statistically unusual activity patterns. Risk indicators are trending upward, suggesting conditions may worsen without intervention. A "likely spike" pattern has been identified by the ML pipeline.',
      recommendation: 'Deploy additional enrolment/update centres and mobile units. Consider extending operating hours and allocating more trained operators. Investigate anomaly root cause immediately — potential fraud or system malfunction. Escalate to regional director; consider emergency resource reallocation.',
      dominantFactor: 'Demand Pressure',
    },
    {
      districtName: 'Patna',
      stateName: 'Bihar',
      compositeRisk: 94.3,
      demandPressure: 88.7,
      operationalStress: 95.1,
      accessibilityGap: 72.6,
      riskLevel: 'CRITICAL',
      anomaly: { isAnomaly: true, anomalySeverity: 'high', anomalyScore: 0.87 },
      trend: 'increasing',
      pattern: 'seasonal_surge',
      reasoning: 'Patna (Bihar) has a composite risk score of 94.3, significantly above the 85-point threshold. The primary driver is operational stress at 95.1. This is compounded by elevated demand pressure (88.7). An active anomaly (high severity) has been detected. Risk indicators are trending upward.',
      recommendation: 'Augment system capacity — prioritise equipment maintenance, increase server bandwidth, and ensure adequate staffing at operational centres. Investigate anomaly root cause immediately. Escalate to regional director; consider emergency resource reallocation.',
      dominantFactor: 'Operational Stress',
    },
    {
      districtName: 'Ranchi',
      stateName: 'Jharkhand',
      compositeRisk: 92.1,
      demandPressure: 76.4,
      operationalStress: 82.9,
      accessibilityGap: 93.8,
      riskLevel: 'CRITICAL',
      anomaly: null,
      trend: 'stable',
      pattern: 'none',
      reasoning: 'Ranchi (Jharkhand) has a composite risk score of 92.1, significantly above the 85-point threshold. The primary driver is accessibility gap at 93.8. This is compounded by elevated operational stress (82.9). The high accessibility gap indicates underserved populations in rural/tribal areas lacking adequate Aadhaar infrastructure.',
      recommendation: 'Launch targeted inclusion outreach in underserved rural/tribal areas. Deploy mobile Aadhaar camps and partner with local administration for awareness drives.',
      dominantFactor: 'Accessibility Gap',
    },
    {
      districtName: 'Nagpur',
      stateName: 'Maharashtra',
      compositeRisk: 89.5,
      demandPressure: 85.2,
      operationalStress: 79.4,
      accessibilityGap: 88.1,
      riskLevel: 'WATCH',
      anomaly: null,
      trend: 'increasing',
      pattern: 'risk_building',
      reasoning: 'Nagpur (Maharashtra) has a composite risk score of 89.5, significantly above the 85-point threshold. The primary driver is accessibility gap at 88.1. This is compounded by elevated demand pressure (85.2). Risk indicators are trending upward. A "risk building" pattern has been identified.',
      recommendation: 'Launch targeted inclusion outreach in underserved rural/tribal areas. Deploy mobile Aadhaar camps and partner with local administration. Escalate to regional director; consider emergency resource reallocation.',
      dominantFactor: 'Accessibility Gap',
    },
    {
      districtName: 'Gaya',
      stateName: 'Bihar',
      compositeRisk: 88.2,
      demandPressure: 91.3,
      operationalStress: 74.6,
      accessibilityGap: 82.7,
      riskLevel: 'WATCH',
      anomaly: { isAnomaly: true, anomalySeverity: 'medium', anomalyScore: 0.72 },
      trend: 'decreasing',
      pattern: 'none',
      reasoning: 'Gaya (Bihar) has a composite risk score of 88.2, significantly above the 85-point threshold. The primary driver is demand pressure at 91.3. An active anomaly (medium severity) has been detected. Risk indicators show a declining trend, but the score remains critically high.',
      recommendation: 'Deploy additional enrolment/update centres and mobile units. Consider extending operating hours. Investigate anomaly root cause immediately — potential fraud or system malfunction.',
      dominantFactor: 'Demand Pressure',
    },
    {
      districtName: 'Murshidabad',
      stateName: 'West Bengal',
      compositeRisk: 86.9,
      demandPressure: 78.5,
      operationalStress: 84.1,
      accessibilityGap: 89.2,
      riskLevel: 'WATCH',
      anomaly: null,
      trend: 'stable',
      pattern: 'none',
      reasoning: 'Murshidabad (West Bengal) has a composite risk score of 86.9, significantly above the 85-point threshold. The primary driver is accessibility gap at 89.2. This is compounded by elevated operational stress (84.1). The high accessibility gap points to regional service delivery challenges.',
      recommendation: 'Launch targeted inclusion outreach in underserved rural/tribal areas. Deploy mobile Aadhaar camps and partner with local administration for awareness drives.',
      dominantFactor: 'Accessibility Gap',
    },
  ];
}

// Generate mock alerts for demo
function generateMockAlerts(): AadhaarAlert[] {
  return [
    {
      id: 'ALT-001',
      region: 'Uttar Pradesh',
      regionType: 'State',
      alertType: 'ANOMALY',
      severity: 'Critical',
      title: 'Sudden Spike in Biometric Failures',
      explanation: 'Biometric authentication failure rate has increased by 340% in the last 24 hours across multiple districts. This unusual pattern suggests potential system-wide issues or coordinated fraud attempts.',
      confidence: 92,
      detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      metrics: [
        { label: 'Failure Rate', value: 34.2, threshold: 10 },
        { label: 'Affected Districts', value: 23 },
      ],
    },
    {
      id: 'ALT-002',
      region: 'Bihar - Patna',
      regionType: 'District',
      alertType: 'CAPACITY',
      severity: 'High',
      title: 'Operational Capacity Breach',
      explanation: 'Enrolment centers in Patna district are operating at 156% capacity with average wait times exceeding 4 hours. Additional resources required urgently.',
      confidence: 88,
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metrics: [
        { label: 'Capacity Utilization', value: 156, threshold: 100 },
        { label: 'Avg Wait Time (hrs)', value: 4.2 },
      ],
    },
    {
      id: 'ALT-003',
      region: 'Jharkhand',
      regionType: 'State',
      alertType: 'TREND',
      severity: 'High',
      title: 'Rising Demographic Update Requests',
      explanation: 'Demographic update requests have shown a consistent upward trend for the past 6 weeks, now 78% above the seasonal baseline. May indicate data quality issues or policy changes.',
      confidence: 85,
      detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      metrics: [
        { label: 'Weekly Growth Rate', value: 12.4 },
        { label: 'Above Baseline %', value: 78 },
      ],
    },
    {
      id: 'ALT-004',
      region: 'Maharashtra - Nagpur',
      regionType: 'District',
      alertType: 'GAP',
      severity: 'Medium',
      title: 'Accessibility Gap Detected',
      explanation: 'Rural areas in Nagpur district show 45% lower Aadhaar coverage compared to urban areas. Mobile unit deployment may help bridge this gap.',
      confidence: 79,
      detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      metrics: [
        { label: 'Urban Coverage %', value: 94.2 },
        { label: 'Rural Coverage %', value: 51.8 },
      ],
    },
    {
      id: 'ALT-005',
      region: 'West Bengal',
      regionType: 'State',
      alertType: 'ANOMALY',
      severity: 'Medium',
      title: 'Unusual Transaction Pattern',
      explanation: 'Authentication requests from financial services have deviated significantly from normal patterns in the past 48 hours. Monitoring recommended.',
      confidence: 72,
      detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      metrics: [
        { label: 'Deviation %', value: 28.5 },
        { label: 'Affected Agencies', value: 12 },
      ],
    },
    {
      id: 'ALT-006',
      region: 'Rajasthan - Jaipur',
      regionType: 'District',
      alertType: 'CAPACITY',
      severity: 'Low',
      title: 'Equipment Maintenance Due',
      explanation: 'Scheduled maintenance for biometric devices in 8 enrolment centers is overdue. Minor impact expected but should be addressed within the week.',
      confidence: 95,
      detectedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      metrics: [
        { label: 'Overdue Days', value: 5 },
        { label: 'Centers Affected', value: 8 },
      ],
    },
  ];
}

export default AlertsPage;
