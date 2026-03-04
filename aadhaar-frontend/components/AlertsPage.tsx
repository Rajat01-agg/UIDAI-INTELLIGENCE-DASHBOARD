/**
 * AlertsPage Component
 * 
 * Displays alert cards for anomalies, trends, gaps, and capacity issues.
 * Each card shows region, alert type, severity, explanation, and confidence.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  MapPin,
  Loader2,
  AlertCircle,
  Activity,
  Users,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { AadhaarAlert, AlertSeverity } from '../types';
import { fetchAlerts } from '../services/aadhaarApi';
import { useFilters } from '../hooks/useFilters';

// Alert type icons
const getAlertTypeIcon = (type: AadhaarAlert['alertType']) => {
  switch (type) {
    case 'ANOMALY':
      return <AlertTriangle className="h-5 w-5" />;
    case 'TREND':
      return <TrendingUp className="h-5 w-5" />;
    case 'GAP':
      return <Users className="h-5 w-5" />;
    case 'CAPACITY':
      return <Activity className="h-5 w-5" />;
  }
};

// Severity colors
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

// Alert type colors
const getAlertTypeClasses = (type: AadhaarAlert['alertType']): { bg: string; text: string } => {
  switch (type) {
    case 'ANOMALY':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'TREND':
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'GAP':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'CAPACITY':
      return { bg: 'bg-orange-100', text: 'text-orange-700' };
  }
};

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AadhaarAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<AadhaarAlert['alertType'] | 'All'>('All');

  const {
    filterOptions,
    filters,
    setStateFilter,
    setDistrictFilter,
    filteredDistricts,
  } = useFilters();

  // Load alerts
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAlerts({
        state: filters.state,
        district: filters.district,
      });
      setAlerts(data);
    } catch (err) {
      console.warn('API unavailable, using mock data:', err);
      // Set mock data for demo (clear error since we have fallback)
      setError(null);
      setAlerts(generateMockAlerts());
    } finally {
      setLoading(false);
    }
  }, [filters.state, filters.district]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'All' && alert.severity !== severityFilter) return false;
    if (typeFilter !== 'All' && alert.alertType !== typeFilter) return false;
    return true;
  });

  // Stats
  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'Critical').length,
    high: alerts.filter(a => a.severity === 'High').length,
    anomalies: alerts.filter(a => a.alertType === 'ANOMALY').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600 text-sm mt-1">
            System-detected anomalies, trends, and capacity issues
          </p>
        </div>
        <button
          onClick={loadAlerts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 
                     rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 
                     transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium">Total Alerts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-red-200 p-4">
          <p className="text-xs text-red-600 font-medium">Critical</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-lg border border-orange-200 p-4">
          <p className="text-xs text-orange-600 font-medium">High Priority</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.high}</p>
        </div>
        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <p className="text-xs text-purple-600 font-medium">Anomalies</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.anomalies}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filters.state || ''}
            onChange={(e) => setStateFilter(e.target.value || undefined)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
          >
            <option value="">All States</option>
            {filterOptions?.states.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>

          <select
            value={filters.district || ''}
            onChange={(e) => setDistrictFilter(e.target.value || undefined)}
            disabled={!filters.state}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Districts</option>
            {filteredDistricts.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'All')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as AadhaarAlert['alertType'] | 'All')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            <option value="ANOMALY">Anomaly</option>
            <option value="TREND">Trend</option>
            <option value="GAP">Gap</option>
            <option value="CAPACITY">Capacity</option>
          </select>

          <span className="text-sm text-gray-500 ml-auto">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading alerts...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAlerts.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No alerts found</p>
          <p className="text-gray-400 text-sm mt-1">
            {alerts.length > 0 ? 'Try adjusting your filters' : 'No active alerts at this time'}
          </p>
        </div>
      )}

      {/* Alert Cards */}
      {!loading && filteredAlerts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => {
            const severityClasses = getSeverityClasses(alert.severity);
            const typeClasses = getAlertTypeClasses(alert.alertType);

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-lg border ${severityClasses.border} shadow-sm overflow-hidden`}
              >
                {/* Header */}
                <div className={`px-4 py-3 ${severityClasses.bg} border-b ${severityClasses.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${typeClasses.bg}`}>
                        <span className={typeClasses.text}>
                          {getAlertTypeIcon(alert.alertType)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {alert.region} ({alert.regionType})
                          </span>
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

                {/* Body */}
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-4">{alert.explanation}</p>

                  {/* Metrics */}
                  {alert.metrics && alert.metrics.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-[10px] text-gray-500 font-medium uppercase mb-2">Key Metrics</p>
                      <div className="grid grid-cols-2 gap-2">
                        {alert.metrics.map((metric, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">{metric.label}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {metric.value.toFixed(1)}
                              {metric.threshold && (
                                <span className="text-xs text-gray-400 ml-1">
                                  / {metric.threshold}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Confidence</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            alert.confidence >= 80
                              ? 'bg-green-500'
                              : alert.confidence >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${alert.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{alert.confidence}%</span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(alert.detectedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
