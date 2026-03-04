/**
 * ChartsPage Component
 * 
 * Enhanced Charts & Visuals page with professional UI/UX
 * Features refined filters and beautiful Chart.js visualizations
 */

import React, { useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import { 
  Loader2, 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  AlertTriangle, 
  Filter,
  X,
  Sparkles,
  Download,
  RefreshCw,
  Target,
  Activity,
  MapPin,
  Clock
} from 'lucide-react';
import { VisualsResponse } from '../types';
import { fetchVisualsData } from '../services/aadhaarApi';
import { useFilters } from '../hooks/useFilters';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartsPage: React.FC = () => {
  const {
    filterOptions,
    filters,
    loadingOptions,
    setStateFilter,
    setDistrictFilter,
    setYearFilter,
    setIndexTypeFilter,
    clearFilters,
    filteredDistricts,
  } = useFilters();

  const [visualsData, setVisualsData] = useState<VisualsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Additional filters from screenshot
  const [signalTypes, setSignalTypes] = useState<string[]>([]);
  const [severityLevel, setSeverityLevel] = useState<string>('All');
  const [timeWindow, setTimeWindow] = useState<string>('Last 7 days');

  // Available options for new filters
  const signalTypeOptions = ['Anomalies', 'Trends', 'Patterns', 'Accessibility Gap', 'Operational Stress'];
  const severityOptions = ['All', 'Critical', 'High', 'Medium'];
  const timeWindowOptions = ['Last 24h', 'Last 7 days', 'Last 30 days'];

  // Toggle signal type selection
  const toggleSignalType = (type: string) => {
    setSignalTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Generate visuals from real backend data
  const handleGenerateVisuals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVisualsData(filters);
      setVisualsData(data);
      setHasGenerated(true);
    } catch (err: any) {
      console.error('Failed to fetch visuals from backend:', err);
      setError(err?.message || 'Failed to load chart data from the server. Please check your connection and try again.');
      setVisualsData(null);
      setHasGenerated(false);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Enhanced Chart Options
  const lineChartOptions:  any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 12,
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          padding: 8,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          padding: 8,
        },
      },
    },
  };

  const barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          padding: 8,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          padding: 8,
        },
      },
    },
  };

  const doughnutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 12,
        },
      },
    },
  };

  const radarChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 20,
          font: {
            size: 10,
          },
          backdropColor: 'transparent',
        },
      },
    },
  };

  const polarAreaChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 20,
          font: {
            size: 10,
          },
          backdropColor: 'transparent',
        },
      },
    },
  };

  const lineChartData = visualsData?.lineChart || null;
  const barChartData = visualsData?.barChart || null;
  const pieChartData = visualsData?.pieChart || null;
  const radarChartData = visualsData?.radarChart || null;
  const polarAreaChartData = visualsData?.polarAreaChart || null;
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Enhanced Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Charts & Analytics</h1>
              <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                Generate intelligent visualizations from filtered data
              </p>
            </div>
          </div>
        </div>
        {hasGenerated && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        )}
      </div>

      {/* Enhanced Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Criteria</h2>
          {hasActiveFilters && (
            <span className="ml-auto text-sm text-gray-500">
              {Object.keys(filters).filter(k => filters[k as keyof typeof filters]).length + signalTypes.length} filter(s) active
            </span>
          )}
        </div>

        {/* Signal Type (Multi-Select) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-blue-600" />
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Signal Type (Select Multiple)
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {signalTypeOptions.map((type) => (
              <button
                key={type}
                onClick={() => toggleSignalType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  signalTypes.includes(type)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {signalTypes.includes(type) && (
                  <span className="mr-1">✓</span>
                )}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Severity Level and Time Window */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Severity Level */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Severity Level
              </label>
            </div>
            <div className="flex gap-2">
              {severityOptions.map((level) => (
                <button
                  key={level}
                  onClick={() => setSeverityLevel(level)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    severityLevel === level
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Time Window */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-purple-600" />
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Time Window
              </label>
            </div>
            <div className="flex gap-2">
              {timeWindowOptions.map((window) => (
                <button
                  key={window}
                  onClick={() => setTimeWindow(window)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeWindow === window
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {window}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Geography Section */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-green-600" />
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Geography & Demographics
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* State Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              State
            </label>
            <select
              value={filters.state || ''}
              onChange={(e) => setStateFilter(e.target.value || undefined)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All States</option>
              {filterOptions?.states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              District
            </label>
            <select
              value={filters.district || ''}
              onChange={(e) => setDistrictFilter(e.target.value || undefined)}
              disabled={!filters.state}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Districts</option>
              {filteredDistricts?.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Year
            </label>
            <select
              value={filters.year || ''}
              onChange={(e) => setYearFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Years</option>
              {filterOptions?.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Index Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Index Type
            </label>
            <select
              value={filters.indexType || ''}
              onChange={(e) => setIndexTypeFilter(e.target.value as any || undefined)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Indexes</option>
              {filterOptions?.indexTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleGenerateVisuals}
            disabled={loading || loadingOptions}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Visuals
              </>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          )}

          {hasGenerated && !loading && (
            <button
              onClick={handleGenerateVisuals}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-5 shadow-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Data</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasGenerated && !loading && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Generate Analytics</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Select your preferred filters above and click <strong>"Generate Visuals"</strong> to create 
              comprehensive charts and insights for Aadhaar system analysis.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>Trend Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-green-500" />
                <span>Distribution</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                <span>Comparisons</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State with Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Charts Grid */}
      {hasGenerated && !loading && visualsData && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Line Chart */}
          {lineChartData && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-md">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{visualsData.lineChart?.title || 'Trend Analysis'}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Time-series performance indicators</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div style={{ height: '380px' }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-transparent border-t border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-md mt-0.5">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-1">Key Insight</p>
                    <p className="text-xs text-gray-600 leading-relaxed">Track how demand pressure and operational stress evolve over time. Rising trends indicate growing system load—plan resource allocation accordingly. Sudden spikes may signal anomalies requiring immediate attention.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bar and Doughnut Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            {barChartData && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600 rounded-lg shadow-md">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{visualsData.barChart?.title || 'Comparison Analysis'}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Regional performance metrics</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div style={{ height: '320px' }}>
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </div>
                <div className="px-6 py-4 bg-gradient-to-r from-orange-50/50 to-transparent border-t border-orange-100">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-orange-100 rounded-md mt-0.5">
                      <BarChart3 className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-orange-900 mb-1">Key Insight</p>
                      <p className="text-xs text-gray-600 leading-relaxed">Compare risk levels across states at a glance. Red bars indicate critical zones needing urgent intervention. Use this to prioritize resource deployment and policy focus.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Doughnut Chart */}
            {pieChartData && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg shadow-md">
                      <PieChartIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{visualsData.pieChart?.title || 'Distribution Analysis'}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Categorical breakdown</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div style={{ height: '320px' }}>
                    <Doughnut data={pieChartData} options={doughnutChartOptions} />
                  </div>
                </div>
                <div className="px-6 py-4 bg-gradient-to-r from-green-50/50 to-transparent border-t border-green-100">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-green-100 rounded-md mt-0.5">
                      <PieChartIcon className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-900 mb-1">Key Insight</p>
                      <p className="text-xs text-gray-600 leading-relaxed">View the proportion of districts in each risk category. A healthy system shows majority in green/low risk. Growing critical segments signal systemic issues requiring policy intervention.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Radar and Polar Area Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            {radarChartData && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg shadow-md">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{visualsData.radarChart?.title || 'Multi-Dimensional Analysis'}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Performance across indicators</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div style={{ height: '320px' }}>
                    <Radar data={radarChartData} options={radarChartOptions} />
                  </div>
                </div>
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50/50 to-transparent border-t border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-100 rounded-md mt-0.5">
                      <Target className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-900 mb-1">Key Insight</p>
                      <p className="text-xs text-gray-600 leading-relaxed">Assess system health across multiple dimensions simultaneously. Gaps between current and target lines highlight improvement areas. Balanced polygons indicate well-rounded performance.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Polar Area Chart */}
            {polarAreaChartData && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-600 rounded-lg shadow-md">
                      <PieChartIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{visualsData.polarAreaChart?.title || 'Risk by Service Category'}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Composite risk grouped by Aadhaar service type</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div style={{ height: '320px' }}>
                    <PolarArea data={polarAreaChartData} options={polarAreaChartOptions} />
                  </div>
                </div>
                <div className="px-6 py-4 bg-gradient-to-r from-pink-50/50 to-transparent border-t border-pink-100">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-pink-100 rounded-md mt-0.5">
                      <PieChartIcon className="h-3.5 w-3.5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-pink-900 mb-1">Key Insight</p>
                      <p className="text-xs text-gray-600 leading-relaxed">Compare average composite risk across Aadhaar service categories (Enrolment, Biometric Update, Demographic Update). Larger slices indicate higher risk — useful for identifying which service pipelines need the most attention.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Stats Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Analytics Generated Successfully</h3>
                <p className="text-blue-100 text-sm">
                  Displaying {[lineChartData, barChartData, pieChartData, radarChartData, polarAreaChartData].filter(Boolean).length} visualization(s) based on your filters
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// All charts now use real backend data via fetchVisualsData().
// Mock data has been removed — errors are shown to the user instead.

export default ChartsPage;
