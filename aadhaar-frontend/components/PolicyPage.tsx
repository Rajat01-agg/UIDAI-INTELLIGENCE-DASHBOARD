/**
 * PolicyPage Component
 *
 * Rich policy intelligence page with three integrated views:
 *   1. Predictive Risks — ML-detected risk signals with AI recommendations
 *   2. Solution Frameworks — Structured intervention plans grounded in data
 *   3. Action Matrix — Synthesized priority grid for decision makers
 *
 * No prescriptive directives — only evidence-based frameworks for consideration.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  AlertTriangle,
  AlertCircle,
  Users,
  Settings,
  Target,
  Eye,
  MapPin,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Shield,
  TrendingUp,
  Zap,
  Activity,
  Filter,
  RefreshCw,
  BarChart3,
  FileWarning,
  Info,
  ArrowUpRight,
  Minus,
  Layers,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { PolicyFramework, PolicyFrameworkType, PredictiveRisk, RiskSignal } from '../types';
import { fetchPolicyFrameworks, fetchPredictiveRisks } from '../services/aadhaarApi';

// ── Risk signal styling ─────────────────────────────────────────────
const getRiskSignalStyle = (signal: RiskSignal) => {
  switch (signal) {
    case 'likely_spike':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', label: 'Likely Spike', icon: <Zap className="h-4 w-4" /> };
    case 'risk_building':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', label: 'Risk Building', icon: <TrendingUp className="h-4 w-4" /> };
    default:
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', label: 'Stable', icon: <Minus className="h-4 w-4" /> };
  }
};

// ── Framework styling ───────────────────────────────────────────────
const getFrameworkStyle = (type: PolicyFrameworkType) => {
  switch (type) {
    case 'CAPACITY_AUGMENTATION':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-100', icon: <Users className="h-5 w-5" />, label: 'Capacity Augmentation' };
    case 'OPERATIONAL_STABILISATION':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-100', icon: <Settings className="h-5 w-5" />, label: 'Operational Stabilisation' };
    case 'INCLUSION_OUTREACH':
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', iconBg: 'bg-green-100', icon: <Target className="h-5 w-5" />, label: 'Inclusion & Outreach' };
    case 'MONITOR_ONLY':
      return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', iconBg: 'bg-gray-100', icon: <Eye className="h-5 w-5" />, label: 'Monitor Only' };
  }
};

// ── Priority badge colour ───────────────────────────────────────────
const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-green-100 text-green-700 border-green-200';
  }
};

// ── Metric category label ───────────────────────────────────────────
const metricLabel = (cat: string) =>
  cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// ── Age group label ─────────────────────────────────────────────────
const ageLabel = (ag: string) => {
  if (ag === 'age_0_5') return '0-5 yrs';
  if (ag === 'age_6_17') return '6-17 yrs';
  return '18+ yrs';
};

// ── Risk Score Bar ──────────────────────────────────────────────────
const ScoreBar: React.FC<{ label: string; value: number; max?: number; color?: string }> = ({ label, value, max = 100, color }) => {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = color || (value > 80 ? 'bg-red-500' : value > 60 ? 'bg-orange-500' : value > 40 ? 'bg-yellow-500' : 'bg-green-500');
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={`text-xs font-bold ${value > 80 ? 'text-red-600' : value > 60 ? 'text-orange-600' : 'text-gray-700'}`}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════

const PolicyPage: React.FC = () => {
  const [frameworks, setFrameworks] = useState<PolicyFramework[]>([]);
  const [risks, setRisks] = useState<PredictiveRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'risks' | 'frameworks' | 'matrix'>('risks');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [signalFilter, setSignalFilter] = useState<string>('All');

  // ── Load data ─────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [fwData, riskData] = await Promise.all([
        fetchPolicyFrameworks().catch((err) => {
          console.warn('Policy frameworks API unavailable, using mock:', err);
          return generateMockFrameworks();
        }),
        fetchPredictiveRisks().catch((err) => {
          console.warn('Predictive risks API unavailable, using mock:', err);
          return generateMockRisks();
        }),
      ]);

      setFrameworks(fwData);
      setRisks(riskData);
    } catch (err) {
      console.error('Failed to load policy data:', err);
      setError('Failed to load data. Showing demo information.');
      setFrameworks(generateMockFrameworks());
      setRisks(generateMockRisks());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Toggle expansion ──────────────────────────────────────────
  const toggle = (key: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── Filters ───────────────────────────────────────────────────
  const allStates = [...new Set([
    ...risks.map(r => r.state),
    ...frameworks.flatMap(f => f.applicableRegions),
  ])].sort();

  const filteredRisks = risks.filter(r =>
    (stateFilter === 'All' || r.state === stateFilter) &&
    (signalFilter === 'All' || r.riskSignal === signalFilter)
  );

  const filteredFrameworks = frameworks.filter(f =>
    stateFilter === 'All' || f.applicableRegions.some(r => r === stateFilter) || f.state === stateFilter
  );

  // ── Stats ─────────────────────────────────────────────────────
  const stats = {
    totalRisks: filteredRisks.length,
    spikeCount: filteredRisks.filter(r => r.riskSignal === 'likely_spike').length,
    buildingCount: filteredRisks.filter(r => r.riskSignal === 'risk_building').length,
    avgRisk: filteredRisks.length > 0
      ? filteredRisks.reduce((s, r) => s + r.riskScore, 0) / filteredRisks.length
      : 0,
    highConfidence: filteredRisks.filter(r => r.predictionConfidence >= 75).length,
    totalFrameworks: filteredFrameworks.length,
    highPriority: filteredFrameworks.filter(f => f.priority === 'High').length,
    statesAffected: new Set(filteredRisks.map(r => r.state)).size,
  };

  // ── Action Matrix data ────────────────────────────────────────
  const matrixCategories = [
    { key: 'CAPACITY_AUGMENTATION' as PolicyFrameworkType, label: 'Capacity Augmentation', icon: <Users className="h-5 w-5" />, color: 'blue' },
    { key: 'OPERATIONAL_STABILISATION' as PolicyFrameworkType, label: 'Operational Stabilisation', icon: <Settings className="h-5 w-5" />, color: 'purple' },
    { key: 'INCLUSION_OUTREACH' as PolicyFrameworkType, label: 'Inclusion & Outreach', icon: <Target className="h-5 w-5" />, color: 'green' },
    { key: 'MONITOR_ONLY' as PolicyFrameworkType, label: 'Monitor Only', icon: <Eye className="h-5 w-5" />, color: 'gray' },
  ];

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            Policy Intelligence &amp; Recommendations
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            ML-driven predictive risks, solution frameworks &amp; prioritised action matrix
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white rounded-lg border-2 border-red-200 p-3 shadow-sm">
          <p className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">Likely Spikes</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{stats.spikeCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-orange-200 p-3 shadow-sm">
          <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wider">Risk Building</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.buildingCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Total Predictions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRisks}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Avg Risk Score</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgRisk.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-lg border border-green-200 p-3 shadow-sm">
          <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">High Confidence</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.highConfidence}</p>
        </div>
        <div className="bg-white rounded-lg border border-blue-200 p-3 shadow-sm">
          <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Frameworks</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalFrameworks}</p>
        </div>
        <div className="bg-white rounded-lg border border-red-200 p-3 shadow-sm">
          <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">High Priority</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.highPriority}</p>
        </div>
        <div className="bg-white rounded-lg border border-purple-200 p-3 shadow-sm">
          <p className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider">States Affected</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.statesAffected}</p>
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
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option value="All">All States / UTs</option>
            {allStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {tab === 'risks' && (
            <select
              value={signalFilter}
              onChange={(e) => setSignalFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700
                         bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="All">All Signals</option>
              <option value="likely_spike">Likely Spike</option>
              <option value="risk_building">Risk Building</option>
              <option value="stable">Stable</option>
            </select>
          )}

          {/* Tabs */}
          <div className="ml-auto flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setTab('risks')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === 'risks' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Predictive Risks ({filteredRisks.length})
            </button>
            <button
              onClick={() => setTab('frameworks')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === 'frameworks' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Layers className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Frameworks ({filteredFrameworks.length})
            </button>
            <button
              onClick={() => setTab('matrix')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === 'matrix' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Action Matrix
            </button>
          </div>
        </div>
      </div>

      {/* ── Disclaimer ──────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Policy Guidance Only</p>
            <p className="text-sm text-amber-700 mt-1">
              These frameworks are analytical suggestions generated by the ML pipeline. They do not constitute
              prescriptive directives and should be evaluated within the appropriate policy context by authorised decision makers.
            </p>
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
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-3" />
          <p className="text-gray-600">Analyzing policy intelligence data...</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB: PREDICTIVE RISKS                             */}
      {/* ══════════════════════════════════════════════════ */}
      {!loading && tab === 'risks' && (
        <>
          {filteredRisks.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Shield className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No predictive risks detected</p>
              <p className="text-gray-400 text-sm mt-1">All monitored districts show stable risk profiles.</p>
            </div>
          ) : (
            <>
              {/* Decision-maker brief */}
              <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg mt-0.5">
                    <FileWarning className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900">Predictive Risk Brief</h3>
                    <p className="text-sm text-red-800 mt-1">
                      The ML pipeline has identified <strong>{filteredRisks.length} predictive risk signal{filteredRisks.length !== 1 ? 's' : ''}</strong> across{' '}
                      <strong>{stats.statesAffected} state{stats.statesAffected !== 1 ? 's' : ''}</strong>.
                      {stats.spikeCount > 0 && (
                        <> <strong className="text-red-700">{stats.spikeCount}</strong> are flagged as <em>likely spike</em> — requiring proactive intervention. </>
                      )}
                      {stats.highConfidence > 0 && (
                        <> <strong className="text-red-700">{stats.highConfidence}</strong> predictions have high confidence (&ge;75%). </>
                      )}
                      Each entry below includes an AI-generated recommendation for policy planning.
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk signal distribution */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['likely_spike', 'risk_building', 'stable'] as RiskSignal[]).map((sig) => {
                  const count = filteredRisks.filter(r => r.riskSignal === sig).length;
                  const style = getRiskSignalStyle(sig);
                  return (
                    <div key={sig} className={`bg-white rounded-lg border-2 ${style.border} p-4 shadow-sm`}>
                      <div className="flex items-center gap-2">
                        <span className={style.text}>{style.icon}</span>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>{style.label}</p>
                      </div>
                      <p className={`text-3xl font-bold mt-2 ${style.text}`}>{count}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {sig === 'likely_spike' ? 'Imminent demand surge predicted' :
                         sig === 'risk_building' ? 'Gradual risk escalation detected' :
                         'Within normal operating range'}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Risk Cards */}
              <div className="space-y-4">
                {filteredRisks.map((r, idx) => {
                  const key = `risk-${r.id || idx}`;
                  const expanded = expandedCards.has(key);
                  const style = getRiskSignalStyle(r.riskSignal);

                  return (
                    <div key={key} className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${style.border}`}>
                      {/* Card Header */}
                      <div
                        className={`px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${style.bg}`}
                        onClick={() => toggle(key)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </div>

                          {/* District Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900">{r.district}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} ring-2 ${
                                r.riskSignal === 'likely_spike' ? 'ring-red-500/30' : r.riskSignal === 'risk_building' ? 'ring-orange-500/30' : 'ring-green-500/30'
                              }`}>
                                {style.label}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                                {metricLabel(r.metricCategory)}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500">
                                {ageLabel(r.ageGroup)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-500">{r.state}</span>
                              {r.contributingFactors && (
                                <>
                                  <span className="text-gray-300 mx-1">&bull;</span>
                                  <span className="text-sm text-gray-500 truncate max-w-[300px]">{r.contributingFactors}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Scores */}
                          <div className="flex-shrink-0 text-right mr-2">
                            <div className="text-3xl font-black text-gray-900">{r.riskScore.toFixed(1)}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Risk Score</div>
                          </div>

                          {/* Expand */}
                          <div className="flex-shrink-0">
                            {expanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expanded && (
                        <div className="border-t border-gray-100">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-100">

                            {/* Column 1: Scores */}
                            <div className="p-5">
                              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-3">Risk Profile</p>
                              <div className="space-y-3">
                                <ScoreBar label="Risk Score" value={r.riskScore} />
                                <ScoreBar label="Prediction Confidence" value={r.predictionConfidence} color="bg-blue-500" />
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
                                  {style.icon}
                                  {style.label}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                                  <Activity className="h-3 w-3" />
                                  {metricLabel(r.metricCategory)}
                                </span>
                              </div>

                              {r.contributingFactors && (
                                <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Contributing Factors</p>
                                  <p className="text-sm text-gray-700">{r.contributingFactors}</p>
                                </div>
                              )}
                            </div>

                            {/* Column 2: AI Recommendation */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <Info className="h-4 w-4 text-blue-600" />
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">AI Policy Recommendation</p>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{r.aiRecommendation}</p>
                            </div>

                            {/* Column 3: Timeline & Priority */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Action Timeline</p>
                              </div>
                              <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider mb-1">Response Window</p>
                                <p className="text-sm font-semibold text-amber-900">
                                  {r.riskSignal === 'likely_spike'
                                    ? 'Urgent — Initiate within 1-2 weeks before spike materialises'
                                    : r.riskSignal === 'risk_building'
                                    ? 'Planned — Schedule intervention within 2-4 weeks'
                                    : 'Routine — Standard monitoring cycle'}
                                </p>
                              </div>

                              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                <p className="text-[10px] text-blue-800 font-semibold uppercase tracking-wider mb-1">Confidence Assessment</p>
                                <p className="text-sm text-blue-900">
                                  {r.predictionConfidence >= 75
                                    ? 'High confidence — Model prediction is statistically robust. Recommend acting on this signal.'
                                    : r.predictionConfidence >= 50
                                    ? 'Moderate confidence — Signal is meaningful but warrants cross-validation with ground data.'
                                    : 'Low confidence — Treat as an early warning. Gather additional data before committing resources.'}
                                </p>
                              </div>

                              <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Escalation</p>
                                <p className="text-sm text-gray-700">
                                  {r.riskSignal === 'likely_spike' && r.predictionConfidence >= 75
                                    ? 'Recommend escalation to Regional Director and State UIDAI office.'
                                    : r.riskSignal === 'likely_spike'
                                    ? 'Notify District Coordinator and prepare contingency brief.'
                                    : r.riskSignal === 'risk_building'
                                    ? 'Include in weekly district review briefing.'
                                    : 'Log for periodic review — no escalation needed.'}
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
      {/* TAB: SOLUTION FRAMEWORKS                          */}
      {/* ══════════════════════════════════════════════════ */}
      {!loading && tab === 'frameworks' && (
        <>
          {filteredFrameworks.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No solution frameworks available</p>
              <p className="text-gray-400 text-sm mt-1">Frameworks will appear here based on system analysis.</p>
            </div>
          ) : (
            <>
              {/* Frameworks brief */}
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Solution Framework Brief</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>{filteredFrameworks.length} solution framework{filteredFrameworks.length !== 1 ? 's' : ''}</strong> have been generated
                      by the ML pipeline.{' '}
                      {stats.highPriority > 0 && (
                        <><strong className="text-red-700">{stats.highPriority}</strong> are high-priority. </>
                      )}
                      Each framework includes a rationale, driving indicators, and applicable regions for targeted intervention.
                    </p>
                  </div>
                </div>
              </div>

              {/* Priority distribution */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['High', 'Medium', 'Low'] as const).map((p) => {
                  const count = filteredFrameworks.filter(f => f.priority === p).length;
                  return (
                    <div key={p} className={`bg-white rounded-lg border-2 p-4 shadow-sm ${
                      p === 'High' ? 'border-red-200' : p === 'Medium' ? 'border-yellow-200' : 'border-green-200'
                    }`}>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${
                        p === 'High' ? 'text-red-600' : p === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>{p} Priority</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        p === 'High' ? 'text-red-700' : p === 'Medium' ? 'text-yellow-700' : 'text-green-700'
                      }`}>{count}</p>
                    </div>
                  );
                })}
              </div>

              {/* Framework Cards */}
              <div className="space-y-4">
                {filteredFrameworks.map((fw, idx) => {
                  const key = `fw-${fw.id || idx}`;
                  const expanded = expandedCards.has(key);
                  const style = getFrameworkStyle(fw.type);

                  return (
                    <div key={key} className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${style.border}`}>
                      {/* Header */}
                      <div
                        className={`px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${style.bg}`}
                        onClick={() => toggle(key)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${style.iconBg}`}>
                            <span className={style.text}>{style.icon}</span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900">{fw.title}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyle(fw.priority)}`}>
                                {fw.priority}
                              </span>
                              {fw.predictiveSignal && fw.predictiveSignal !== 'stable' && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRiskSignalStyle(fw.predictiveSignal).bg} ${getRiskSignalStyle(fw.predictiveSignal).text}`}>
                                  {getRiskSignalStyle(fw.predictiveSignal).label}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-500">{fw.applicableRegions.join(', ') || 'All Regions'}</span>
                              {fw.metricCategory && (
                                <>
                                  <span className="text-gray-300 mx-1">&bull;</span>
                                  <span className="text-sm text-gray-500">{metricLabel(fw.metricCategory)}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Confidence */}
                          <div className="flex-shrink-0 text-right mr-2">
                            <div className="text-2xl font-black text-gray-900">{fw.confidence.toFixed(0)}%</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Confidence</div>
                          </div>

                          {/* Expand */}
                          <div className="flex-shrink-0">
                            {expanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expanded && (
                        <div className="border-t border-gray-100">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-100">

                            {/* Column 1: Rationale */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <Info className="h-4 w-4 text-blue-600" />
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Rationale</p>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{fw.description}</p>

                              {/* Confidence bar */}
                              <div className="mt-4">
                                <ScoreBar label="Framework Confidence" value={fw.confidence} color="bg-blue-500" />
                              </div>
                            </div>

                            {/* Column 2: Driving Indicators */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <Activity className="h-4 w-4 text-purple-600" />
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Driving Indicators</p>
                              </div>
                              {fw.indicators.length > 0 ? (
                                <ul className="space-y-2">
                                  {fw.indicators.map((ind, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                      <ArrowUpRight className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                      <span>{ind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-400 italic">No specific indicators recorded</p>
                              )}

                              {/* Applicable regions */}
                              <div className="mt-4">
                                <p className="text-[10px] text-gray-500 font-medium uppercase mb-2">Applicable Regions</p>
                                <div className="flex flex-wrap gap-2">
                                  {fw.applicableRegions.map((region, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      <MapPin className="h-3 w-3" />
                                      {region}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Column 3: Implementation guidance */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Implementation Guidance</p>
                              </div>
                              <div className="space-y-3">
                                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                                  <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider mb-1">Priority Level</p>
                                  <p className="text-sm font-semibold text-amber-900">
                                    {fw.priority === 'High'
                                      ? 'Immediate — Submit for approval and begin resource allocation within 1-2 weeks'
                                      : fw.priority === 'Medium'
                                      ? 'Planned — Include in next planning cycle (2-4 weeks)'
                                      : 'Deferred — Monitor and review in next quarterly assessment'}
                                  </p>
                                </div>

                                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                  <p className="text-[10px] text-blue-800 font-semibold uppercase tracking-wider mb-1">Framework Type</p>
                                  <p className="text-sm text-blue-900">{style.label}</p>
                                  <p className="text-xs text-blue-700 mt-1">
                                    {fw.type === 'CAPACITY_AUGMENTATION'
                                      ? 'Focus: Increasing service delivery capacity through additional resources, personnel, or infrastructure.'
                                      : fw.type === 'OPERATIONAL_STABILISATION'
                                      ? 'Focus: Improving system reliability, reducing failure rates, and optimising operational workflows.'
                                      : fw.type === 'INCLUSION_OUTREACH'
                                      ? 'Focus: Expanding coverage to underserved populations through targeted outreach and accessibility improvements.'
                                      : 'Focus: Continuous monitoring with predefined escalation triggers. No intervention needed at this stage.'}
                                  </p>
                                </div>

                                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Review Authority</p>
                                  <p className="text-sm text-gray-700">
                                    {fw.priority === 'High'
                                      ? 'State UIDAI Office / Regional Director'
                                      : fw.priority === 'Medium'
                                      ? 'District Coordinator / State Analyst'
                                      : 'Automated monitoring — flag on threshold breach'}
                                  </p>
                                </div>
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
      {/* TAB: ACTION MATRIX                                */}
      {/* ══════════════════════════════════════════════════ */}
      {!loading && tab === 'matrix' && (
        <>
          {/* Matrix brief */}
          <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg mt-0.5">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Action Matrix Overview</h3>
                <p className="text-sm text-purple-800 mt-1">
                  Synthesized view combining predictive risks and solution frameworks into actionable categories.
                  Use this matrix for rapid triage and resource allocation decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matrixCategories.map(({ key: catKey, label, icon, color }) => {
              const catFrameworks = filteredFrameworks.filter(f => f.type === catKey);
              // Cross-reference which states appear in this category
              const catStates = [...new Set(catFrameworks.flatMap(f => f.applicableRegions))];
              // Find related risks for those states
              const catRisks = filteredRisks.filter(r => catStates.includes(r.state));
              const highPriCount = catFrameworks.filter(f => f.priority === 'High').length;

              const borderClass = `border-${color}-200`;
              const bgClass = `bg-${color}-50`;
              const textClass = `text-${color}-700`;
              const iconBgClass = `bg-${color}-100`;

              return (
                <div key={catKey} className={`bg-white rounded-xl border-2 ${
                  color === 'blue' ? 'border-blue-200' : color === 'purple' ? 'border-purple-200' : color === 'green' ? 'border-green-200' : 'border-gray-200'
                } shadow-sm overflow-hidden`}>
                  {/* Category Header */}
                  <div className={`px-5 py-4 ${
                    color === 'blue' ? 'bg-blue-50' : color === 'purple' ? 'bg-purple-50' : color === 'green' ? 'bg-green-50' : 'bg-gray-50'
                  } border-b ${
                    color === 'blue' ? 'border-blue-200' : color === 'purple' ? 'border-purple-200' : color === 'green' ? 'border-green-200' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          color === 'blue' ? 'bg-blue-100' : color === 'purple' ? 'bg-purple-100' : color === 'green' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <span className={
                            color === 'blue' ? 'text-blue-700' : color === 'purple' ? 'text-purple-700' : color === 'green' ? 'text-green-700' : 'text-gray-700'
                          }>{icon}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{label}</h3>
                          <p className="text-xs text-gray-500">
                            {catFrameworks.length} framework{catFrameworks.length !== 1 ? 's' : ''} &bull; {catRisks.length} related risk{catRisks.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {highPriCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                          {highPriCount} High Priority
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {catFrameworks.length === 0 ? (
                      <p className="text-sm text-gray-400 italic text-center py-4">No frameworks in this category</p>
                    ) : (
                      <div className="space-y-3">
                        {/* Framework list */}
                        {catFrameworks.slice(0, 5).map((fw, i) => (
                          <div key={fw.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              fw.priority === 'High' ? 'bg-red-500' : fw.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-semibold text-gray-900 truncate">{fw.title}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getPriorityStyle(fw.priority)}`}>
                                  {fw.priority}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1">{fw.applicableRegions.join(', ')}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-700">{fw.confidence.toFixed(0)}%</span>
                          </div>
                        ))}
                        {catFrameworks.length > 5 && (
                          <p className="text-xs text-gray-400 text-center">+ {catFrameworks.length - 5} more</p>
                        )}
                      </div>
                    )}

                    {/* Related Risks Summary */}
                    {catRisks.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Related Predictive Risks</p>
                        <div className="flex flex-wrap gap-2">
                          {[...new Set(catRisks.map(r => `${r.district} (${r.state})`))].slice(0, 6).map((d, i) => (
                            <span key={i} className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                              {d}
                            </span>
                          ))}
                          {new Set(catRisks.map(r => `${r.district} (${r.state})`)).size > 6 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs">
                              +{new Set(catRisks.map(r => `${r.district} (${r.state})`)).size - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Regional Summary Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                Regional Priority Summary
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">States ranked by combined risk signals and framework requirements</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">State</th>
                    <th className="px-5 py-3 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Risk Signals</th>
                    <th className="px-5 py-3 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Spikes</th>
                    <th className="px-5 py-3 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Avg Risk</th>
                    <th className="px-5 py-3 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Frameworks</th>
                    <th className="px-5 py-3 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...new Set(filteredRisks.map(r => r.state))].map(state => {
                    const stateRisks = filteredRisks.filter(r => r.state === state);
                    const stateSpikes = stateRisks.filter(r => r.riskSignal === 'likely_spike').length;
                    const stateAvg = stateRisks.reduce((s, r) => s + r.riskScore, 0) / stateRisks.length;
                    const stateFw = filteredFrameworks.filter(f => f.applicableRegions.includes(state) || f.state === state);
                    const hasHighPri = stateFw.some(f => f.priority === 'High') || stateSpikes > 0;
                    return { state, total: stateRisks.length, spikes: stateSpikes, avg: stateAvg, fwCount: stateFw.length, highPri: hasHighPri };
                  })
                  .sort((a, b) => b.spikes - a.spikes || b.avg - a.avg)
                  .map((row) => (
                    <tr key={row.state} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-medium text-gray-900">{row.state}</td>
                      <td className="px-5 py-3 text-gray-700">{row.total}</td>
                      <td className="px-5 py-3">
                        {row.spikes > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">{row.spikes}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${row.avg > 80 ? 'text-red-600' : row.avg > 60 ? 'text-orange-600' : 'text-gray-700'}`}>
                          {row.avg.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{row.fwCount}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          row.highPri ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {row.highPri ? 'High' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
// MOCK DATA (fallback when API is unavailable)
// ══════════════════════════════════════════════════════════════════════

function generateMockRisks(): PredictiveRisk[] {
  return [
    {
      id: 'PR-001',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      metricCategory: 'enrolment',
      ageGroup: 'age_18_plus',
      riskSignal: 'likely_spike',
      riskScore: 92.4,
      predictionConfidence: 88.5,
      contributingFactors: 'High growth rate, seasonal surge, deviation from baseline by 3.2x',
      aiRecommendation: 'Varanasi (Uttar Pradesh) shows a "Likely Spike" pattern in enrolment with a risk score of 92.4. Contributing factors: High growth rate, seasonal surge, deviation from baseline by 3.2x. Pre-position additional enrolment capacity and mobile units. Alert district coordinator to prepare for surge. Consider extending operating hours in the next 2-4 weeks.',
    },
    {
      id: 'PR-002',
      state: 'Bihar',
      district: 'Patna',
      metricCategory: 'biometric_update',
      ageGroup: 'age_18_plus',
      riskSignal: 'likely_spike',
      riskScore: 89.7,
      predictionConfidence: 82.1,
      contributingFactors: 'Operational stress elevated, biometric failure rate rising, equipment age factor',
      aiRecommendation: 'Patna (Bihar) shows a "Likely Spike" pattern in biometric update with a risk score of 89.7. Contributing factors: Operational stress elevated, biometric failure rate rising, equipment age factor. Ensure biometric equipment is serviced and calibrated. Allocate additional trained operators. Review recent failure patterns for hardware vs. environmental causes.',
    },
    {
      id: 'PR-003',
      state: 'Jharkhand',
      district: 'Ranchi',
      metricCategory: 'enrolment',
      ageGroup: 'age_0_5',
      riskSignal: 'risk_building',
      riskScore: 78.3,
      predictionConfidence: 74.8,
      contributingFactors: 'Accessibility gap widening, rural coverage declining, population growth in underserved areas',
      aiRecommendation: 'Ranchi (Jharkhand) shows a "Risk Building" pattern in enrolment with a risk score of 78.3. Contributing factors: Accessibility gap widening, rural coverage declining, population growth in underserved areas. Monitor demand trajectory closely. Begin contingency planning for capacity augmentation. Review neighbouring district load-balancing options.',
    },
    {
      id: 'PR-004',
      state: 'Maharashtra',
      district: 'Nagpur',
      metricCategory: 'demographic_update',
      ageGroup: 'age_18_plus',
      riskSignal: 'risk_building',
      riskScore: 73.6,
      predictionConfidence: 69.2,
      contributingFactors: 'Update request volume trending upward, rejection rate increasing',
      aiRecommendation: 'Nagpur (Maharashtra) shows a "Risk Building" pattern in demographic update with a risk score of 73.6. Contributing factors: Update request volume trending upward, rejection rate increasing. Track update request volumes and rejection rates. Prepare awareness materials. Consider proactive communication about documentation requirements.',
    },
    {
      id: 'PR-005',
      state: 'West Bengal',
      district: 'Kolkata',
      metricCategory: 'biometric_update',
      ageGroup: 'age_6_17',
      riskSignal: 'risk_building',
      riskScore: 71.2,
      predictionConfidence: 66.5,
      contributingFactors: 'System uptime issues, network connectivity degradation in peripheral areas',
      aiRecommendation: 'Kolkata (West Bengal) shows a "Risk Building" pattern in biometric update with a risk score of 71.2. Contributing factors: System uptime issues, network connectivity degradation in peripheral areas. Schedule preventive equipment maintenance. Review operator training logs. Analyse failure patterns by time and device for targeted intervention.',
    },
    {
      id: 'PR-006',
      state: 'Rajasthan',
      district: 'Jaipur',
      metricCategory: 'enrolment',
      ageGroup: 'age_18_plus',
      riskSignal: 'stable',
      riskScore: 42.1,
      predictionConfidence: 81.3,
      contributingFactors: 'All metrics within normal operating range',
      aiRecommendation: 'Jaipur (Rajasthan) shows a "Stable" pattern in enrolment with a risk score of 42.1. Contributing factors: All metrics within normal operating range. Continue standard monitoring. No immediate intervention needed, but maintain readiness for escalation.',
    },
  ];
}

function generateMockFrameworks(): PolicyFramework[] {
  return [
    {
      id: 'FW-001',
      type: 'CAPACITY_AUGMENTATION',
      title: 'Capacity Augmentation Framework',
      description: 'Framework for increasing enrolment capacity in high-demand districts through additional centres, mobile units, and extended operating hours. Driven by demand pressure exceeding 85% utilisation across multiple centres in the region.',
      applicableRegions: ['Uttar Pradesh', 'Varanasi'],
      priority: 'High',
      confidence: 87.5,
      indicators: ['demandPressureIndex', 'operationalStressIndex', 'growthRate'],
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      metricCategory: 'enrolment',
      predictiveSignal: 'likely_spike',
    },
    {
      id: 'FW-002',
      type: 'CAPACITY_AUGMENTATION',
      title: 'Capacity Augmentation Framework',
      description: 'Mobile unit deployment framework for Bihar districts experiencing persistent demand pressure. Multiple centres operating above capacity threshold with rising wait times.',
      applicableRegions: ['Bihar', 'Patna'],
      priority: 'High',
      confidence: 82.1,
      indicators: ['demandPressureIndex', 'compositeRiskScore'],
      state: 'Bihar',
      district: 'Patna',
      metricCategory: 'enrolment',
      predictiveSignal: 'likely_spike',
    },
    {
      id: 'FW-003',
      type: 'OPERATIONAL_STABILISATION',
      title: 'Operational Stabilisation Plan',
      description: 'Framework for addressing biometric authentication failures and system downtime. Equipment age and maintenance backlog identified as primary contributing factors.',
      applicableRegions: ['Bihar', 'Patna'],
      priority: 'High',
      confidence: 79.8,
      indicators: ['operationalStressIndex', 'volatility', 'spikeRatio'],
      state: 'Bihar',
      district: 'Patna',
      metricCategory: 'biometric_update',
      predictiveSignal: 'likely_spike',
    },
    {
      id: 'FW-004',
      type: 'OPERATIONAL_STABILISATION',
      title: 'Operational Stabilisation Plan',
      description: 'System reliability improvement plan for West Bengal focusing on network connectivity, server capacity, and equipment replacement in critical centres.',
      applicableRegions: ['West Bengal', 'Kolkata'],
      priority: 'Medium',
      confidence: 66.5,
      indicators: ['operationalStressIndex', 'deviationFromBaseline'],
      state: 'West Bengal',
      district: 'Kolkata',
      metricCategory: 'biometric_update',
      predictiveSignal: 'risk_building',
    },
    {
      id: 'FW-005',
      type: 'INCLUSION_OUTREACH',
      title: 'Inclusion & Outreach Initiative',
      description: 'Targeted inclusion programme for Jharkhand addressing widening accessibility gap in tribal and rural areas. Focus on child enrolment coverage through community partnerships.',
      applicableRegions: ['Jharkhand', 'Ranchi'],
      priority: 'High',
      confidence: 74.8,
      indicators: ['updateAccessibilityGap', 'demandPressureIndex'],
      state: 'Jharkhand',
      district: 'Ranchi',
      metricCategory: 'enrolment',
      predictiveSignal: 'risk_building',
    },
    {
      id: 'FW-006',
      type: 'INCLUSION_OUTREACH',
      title: 'Inclusion & Outreach Initiative',
      description: 'Documentation awareness campaign for Nagpur district to reduce demographic update rejection rates. Community-level support for document preparation.',
      applicableRegions: ['Maharashtra', 'Nagpur'],
      priority: 'Medium',
      confidence: 62.4,
      indicators: ['updateAccessibilityGap'],
      state: 'Maharashtra',
      district: 'Nagpur',
      metricCategory: 'demographic_update',
      predictiveSignal: 'risk_building',
    },
    {
      id: 'FW-007',
      type: 'MONITOR_ONLY',
      title: 'Monitor & Track',
      description: 'Standard monitoring framework for Rajasthan. All indicators within normal range. Automated alerts configured for threshold breach.',
      applicableRegions: ['Rajasthan', 'Jaipur'],
      priority: 'Low',
      confidence: 81.3,
      indicators: ['compositeRiskScore'],
      state: 'Rajasthan',
      district: 'Jaipur',
      metricCategory: 'enrolment',
      predictiveSignal: 'stable',
    },
    {
      id: 'FW-008',
      type: 'MONITOR_ONLY',
      title: 'Monitor & Track',
      description: 'Seasonal pattern tracking for national demand cycles. Calendar-based triggers for pre-emptive capacity planning ahead of known surge periods.',
      applicableRegions: ['All States'],
      priority: 'Low',
      confidence: 55.0,
      indicators: ['growthRate', 'seasonalPattern'],
    },
  ];
}

export default PolicyPage;
