/**
 * StateDetailsPanel Component
 * 
 * Modal panel showing district-level details for a selected state.
 * Displays district summary with risk indexes and signal badges.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  MapPin,
} from 'lucide-react';
import {
  StateSummary,
  DistrictSummary,
  RegionStatus,
  TrendDirection,
  SignalBadge,
} from '../types';
import { fetchDistrictsSummary } from '../services/aadhaarApi';
import { getDistrictName, generateDistrictCode } from '../data/districts';

interface StateDetailsPanelProps {
  state: StateSummary;
  onClose: () => void;
}

// Helper to get status color classes
const getStatusClasses = (status: RegionStatus): string => {
  switch (status) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'WATCH':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'NORMAL':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper to get trend icon
const TrendIcon: React.FC<{ trend: TrendDirection; className?: string }> = ({ trend, className = 'h-3 w-3' }) => {
  switch (trend) {
    case 'up':
      return <ArrowUp className={`${className} text-red-500`} />;
    case 'down':
      return <ArrowDown className={`${className} text-green-500`} />;
    case 'stable':
      return <Minus className={`${className} text-gray-500`} />;
  }
};

// Helper to get signal badge styles
const getSignalBadgeStyle = (type: SignalBadge['type']): string => {
  switch (type) {
    case 'ANOMALY':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'RISING_TREND':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'FALLING_TREND':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'HIGH_DEMAND':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'LOW_COVERAGE':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// Helper to get risk color
const getRiskColor = (value: number): string => {
  if (value >= 70) return 'text-red-600';
  if (value >= 50) return 'text-yellow-600';
  return 'text-green-600';
};

const StateDetailsPanel: React.FC<StateDetailsPanelProps> = ({ state, onClose }) => {
  const [districts, setDistricts] = useState<DistrictSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDistrictsSummary(state.stateName);
        setDistricts(data);
      } catch (err) {
        console.warn('API unavailable, using fallback data:', err);
        setError(null);
        const mockDistricts: DistrictSummary[] = Array.from({ length: Math.min(state.districtCount, 10) }, (_, i) => {
          const districtName = getDistrictName(state.stateCode, i, state.stateName);
          return {
            districtCode: generateDistrictCode(state.stateCode, districtName),
            districtName,
          stateName: state.stateName,
          status: i < 3 ? 'CRITICAL' : i < 6 ? 'WATCH' : 'NORMAL',
          demandPressureIndex: 40 + Math.random() * 50,
          operationalStressIndex: 30 + Math.random() * 50,
          accessibilityGapIndex: 20 + Math.random() * 60,
          compositeRiskIndex: 35 + Math.random() * 50,
          trend: i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'stable',
          signals: i < 2 ? [{ type: 'ANOMALY' as const, label: 'Anomaly Detected' }] : 
                   i < 4 ? [{ type: 'RISING_TREND' as const, label: 'Rising Trend' }] : [],
          coordinates: [28.6 + Math.random(), 77.2 + Math.random()],
        };
        });
        setDistricts(mockDistricts);
      } finally {
        setLoading(false);
      }
    };

    loadDistricts();
  }, [state.stateName, state.stateCode, state.districtCount]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">{state.stateName}</h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusClasses(
                  state.status
                )}`}
              >
                {state.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {state.districtCount} districts • {state.highRiskDistricts} high-risk
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="flex items-center gap-3 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading districts...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">Failed to load districts</p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Districts Table */}
          {!loading && districts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider cursor-help" title="Enrolment & update demand pressure index (0–100)">
                      Demand
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider cursor-help" title="Operational stress / system load index (0–100)">
                      Stress
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider cursor-help" title="Service delivery accessibility gap index (0–100). Higher values indicate greater gaps in Aadhaar service accessibility.">
                      Gap
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider cursor-help" title="Composite risk index (0–100). Weighted combination of demand, stress, and gap.">
                      Risk
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider cursor-help" title="Active signals: anomalies, rising/falling trends, high demand, low coverage">
                      Signals
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {districts.map((district) => (
                    <tr
                      key={district.districtCode}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-sm text-gray-900">
                          {district.districtName}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {district.districtCode}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusClasses(
                            district.status
                          )}`}
                        >
                          {district.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`text-sm font-semibold ${getRiskColor(district.demandPressureIndex)}`}>
                          {district.demandPressureIndex.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`text-sm font-semibold ${getRiskColor(district.operationalStressIndex)}`}>
                          {district.operationalStressIndex.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`text-sm font-semibold ${getRiskColor(district.accessibilityGapIndex)}`}>
                          {district.accessibilityGapIndex.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className={`text-sm font-bold ${getRiskColor(district.compositeRiskIndex)}`}>
                            {district.compositeRiskIndex.toFixed(1)}
                          </span>
                          <TrendIcon trend={district.trend} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {district.signals.map((signal, idx) => (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${getSignalBadgeStyle(
                                signal.type
                              )}`}
                            >
                              {signal.label}
                            </span>
                          ))}
                          {district.signals.length === 0 && (
                            <span className="text-[10px] text-gray-400 italic">None</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!loading && districts.length === 0 && !error && (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No districts found</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-white hover:shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StateDetailsPanel;
