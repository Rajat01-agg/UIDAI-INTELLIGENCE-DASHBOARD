/**
 * PolicyPage Component
 * 
 * Displays policy-safe solution frameworks in card format.
 * No prescriptive actions - only frameworks for consideration.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  AlertTriangle,
  Users,
  Settings,
  Target,
  Eye,
  MapPin,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { PolicyFramework, PolicyFrameworkType } from '../types';
import { fetchPolicyFrameworks } from '../services/aadhaarApi';

// Framework icons
const getFrameworkIcon = (type: PolicyFrameworkType) => {
  switch (type) {
    case 'CAPACITY_AUGMENTATION':
      return <Users className="h-6 w-6" />;
    case 'OPERATIONAL_STABILISATION':
      return <Settings className="h-6 w-6" />;
    case 'INCLUSION_OUTREACH':
      return <Target className="h-6 w-6" />;
    case 'MONITOR_ONLY':
      return <Eye className="h-6 w-6" />;
  }
};

// Framework colors
const getFrameworkColors = (type: PolicyFrameworkType): { bg: string; text: string; border: string; iconBg: string } => {
  switch (type) {
    case 'CAPACITY_AUGMENTATION':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-100' };
    case 'OPERATIONAL_STABILISATION':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-100' };
    case 'INCLUSION_OUTREACH':
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', iconBg: 'bg-green-100' };
    case 'MONITOR_ONLY':
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', iconBg: 'bg-gray-100' };
  }
};

// Priority badge
const getPriorityBadge = (priority: PolicyFramework['priority']) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Low':
      return 'bg-green-100 text-green-700 border-green-200';
  }
};

const PolicyPage: React.FC = () => {
  const [frameworks, setFrameworks] = useState<PolicyFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFramework, setExpandedFramework] = useState<string | null>(null);

  // Load frameworks
  const loadFrameworks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPolicyFrameworks();
      setFrameworks(data);
    } catch (err) {
      console.warn('API unavailable, using mock data:', err);
      // Set mock data for demo (clear error since we have fallback)
      setError(null);
      setFrameworks(generateMockFrameworks());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFrameworks();
  }, [loadFrameworks]);

  // Group frameworks by type
  const frameworksByType = frameworks.reduce((acc, framework) => {
    if (!acc[framework.type]) {
      acc[framework.type] = [];
    }
    acc[framework.type].push(framework);
    return acc;
  }, {} as Record<PolicyFrameworkType, PolicyFramework[]>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Policy Frameworks</h1>
        <p className="text-gray-600 text-sm mt-1">
          Solution frameworks for addressing identified issues - for policy consideration only
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Policy Guidance Only</p>
            <p className="text-sm text-amber-700 mt-1">
              These frameworks are analytical suggestions based on system data. They do not constitute 
              prescriptive recommendations and should be evaluated within the appropriate policy context.
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading policy frameworks...</p>
        </div>
      )}

      {/* Framework Cards */}
      {!loading && frameworks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(frameworksByType).map(([type, typeFrameworks]) => {
            const colors = getFrameworkColors(type as PolicyFrameworkType);

            return (
              <div
                key={type}
                className={`rounded-lg border ${colors.border} overflow-hidden`}
              >
                {/* Type Header */}
                <div className={`px-5 py-4 ${colors.bg} border-b ${colors.border}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                      <span className={colors.text}>
                        {getFrameworkIcon(type as PolicyFrameworkType)}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {typeFrameworks.length} framework{typeFrameworks.length !== 1 ? 's' : ''} identified
                      </p>
                    </div>
                  </div>
                </div>

                {/* Frameworks List */}
                <div className="bg-white divide-y divide-gray-100">
                  {typeFrameworks.map((framework) => (
                    <div key={framework.id} className="p-4">
                      <div
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedFramework(
                          expandedFramework === framework.id ? null : framework.id
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-gray-900">{framework.title}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getPriorityBadge(framework.priority)}`}
                            >
                              {framework.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{framework.description}</p>
                        </div>
                        <ChevronRight
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            expandedFramework === framework.id ? 'rotate-90' : ''
                          }`}
                        />
                      </div>

                      {/* Expanded Content */}
                      {expandedFramework === framework.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in duration-200">
                          {/* Applicable Regions */}
                          <div className="mb-4">
                            <p className="text-[10px] text-gray-500 font-medium uppercase mb-2">
                              Applicable Regions
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {framework.applicableRegions.map((region, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  <MapPin className="h-3 w-3" />
                                  {region}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Key Indicators */}
                          <div>
                            <p className="text-[10px] text-gray-500 font-medium uppercase mb-2">
                              Key Indicators
                            </p>
                            <ul className="space-y-1">
                              {framework.indicators.map((indicator, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-xs text-gray-600"
                                >
                                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 shrink-0" />
                                  {indicator}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && frameworks.length === 0 && !error && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No policy frameworks available</p>
          <p className="text-gray-400 text-sm mt-1">
            Frameworks will appear here based on system analysis
          </p>
        </div>
      )}
    </div>
  );
};

// Generate mock frameworks for demo
function generateMockFrameworks(): PolicyFramework[] {
  return [
    {
      id: 'FW-001',
      type: 'CAPACITY_AUGMENTATION',
      title: 'Enrolment Center Expansion',
      description: 'Framework for increasing enrolment capacity in high-demand districts through additional centers, mobile units, or extended operating hours.',
      applicableRegions: ['Uttar Pradesh', 'Bihar', 'Jharkhand'],
      priority: 'High',
      indicators: [
        'Demand pressure index > 75%',
        'Average wait time > 2 hours',
        'Center utilization > 120%',
      ],
    },
    {
      id: 'FW-002',
      type: 'CAPACITY_AUGMENTATION',
      title: 'Mobile Unit Deployment',
      description: 'Framework for deploying mobile enrolment units in underserved rural areas with accessibility challenges.',
      applicableRegions: ['Rajasthan', 'Madhya Pradesh', 'Chhattisgarh'],
      priority: 'Medium',
      indicators: [
        'Rural coverage gap > 30%',
        'Distance to nearest center > 15km',
        'Population density < 200/km²',
      ],
    },
    {
      id: 'FW-003',
      type: 'OPERATIONAL_STABILISATION',
      title: 'System Performance Optimization',
      description: 'Framework for addressing biometric authentication failures and system downtime through infrastructure improvements.',
      applicableRegions: ['West Bengal', 'Odisha'],
      priority: 'High',
      indicators: [
        'Authentication failure rate > 15%',
        'System uptime < 95%',
        'Network connectivity issues',
      ],
    },
    {
      id: 'FW-004',
      type: 'OPERATIONAL_STABILISATION',
      title: 'Equipment Maintenance Protocol',
      description: 'Framework for establishing regular maintenance schedules and rapid replacement protocols for biometric devices.',
      applicableRegions: ['Maharashtra', 'Gujarat', 'Karnataka'],
      priority: 'Medium',
      indicators: [
        'Device age > 3 years',
        'Maintenance backlog > 30 days',
        'Hardware failure rate increasing',
      ],
    },
    {
      id: 'FW-005',
      type: 'INCLUSION_OUTREACH',
      title: 'Last-Mile Connectivity Program',
      description: 'Framework for reaching unserved populations in remote areas through community partnerships and awareness campaigns.',
      applicableRegions: ['Assam', 'Meghalaya', 'Arunachal Pradesh'],
      priority: 'High',
      indicators: [
        'Coverage below state average',
        'Tribal/remote area population',
        'Low awareness metrics',
      ],
    },
    {
      id: 'FW-006',
      type: 'INCLUSION_OUTREACH',
      title: 'Elderly & Differently-Abled Support',
      description: 'Framework for providing assisted enrolment services for elderly citizens and differently-abled individuals.',
      applicableRegions: ['Tamil Nadu', 'Kerala', 'Punjab'],
      priority: 'Medium',
      indicators: [
        'Age group 60+ coverage gap',
        'Biometric exception rate',
        'Accessibility complaint volume',
      ],
    },
    {
      id: 'FW-007',
      type: 'MONITOR_ONLY',
      title: 'Seasonal Demand Patterns',
      description: 'Framework for monitoring and preparing for predictable seasonal spikes in demand related to government scheme deadlines.',
      applicableRegions: ['All States'],
      priority: 'Low',
      indicators: [
        'Historical demand patterns',
        'Upcoming scheme deadlines',
        'Festival/harvest season calendars',
      ],
    },
    {
      id: 'FW-008',
      type: 'MONITOR_ONLY',
      title: 'Demographic Update Trends',
      description: 'Framework for tracking demographic update request patterns and identifying potential data quality issues early.',
      applicableRegions: ['Delhi', 'Haryana', 'Chandigarh'],
      priority: 'Low',
      indicators: [
        'Update request volume trends',
        'Rejection rate patterns',
        'Document verification issues',
      ],
    },
  ];
}

export default PolicyPage;
