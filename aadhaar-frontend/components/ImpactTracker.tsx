import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, 
  TrendingDown, 
  Target, 
  IndianRupee, 
  Download, 
  Filter,
  Users,
  Server,
  RefreshCcw,
  BookOpen,
  Truck,
  Clock,
  AlertCircle,
  ArrowDown,
  Calendar,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// Time filter types
type TimeFilter = 'today' | 'week' | 'month';

// Base mock data for 'today'
const BASE_EFFECTIVENESS_DATA = [
  { action: 'Mobile Units', impact: 18, color: '#3b82f6' },
  { action: 'Server Upgrade', impact: 25, color: '#f59e0b' },
  { action: 'Staff Training', impact: 12, color: '#ef4444' },
  { action: 'Softw. Patch', impact: 35, color: '#8b5cf6' },
  { action: 'Queue Mgmt', impact: 15, color: '#10b981' },
];

const BASE_COST_EFFICIENCY_DATA = [
  { action: 'Mobile Units', costPerPoint: 2500 },
  { action: 'Server Upgrade', costPerPoint: 4500 },
  { action: 'Staff Training', costPerPoint: 800 },
  { action: 'Softw. Patch', costPerPoint: 1200 },
  { action: 'Queue Mgmt', costPerPoint: 600 },
];

// Intervention status type
type InterventionStatus = 'Effective' | 'In Progress' | 'Limited Effect';

// Intervention log entry type
interface InterventionEntry {
  id: number;
  date: string;
  district: string;
  state: string;
  action: string;
  stressBefore: number; // Operational Stress Index (0-100)
  stressAfter: number | null;
  cost: number;
  status: InterventionStatus;
}

// Comprehensive mock intervention log data (30+ entries for pagination) - AADHAAR CONTEXT
const INTERVENTION_LOG: InterventionEntry[] = [
  { id: 1, date: 'Jan 4, 10:30 AM', district: 'Lucknow', state: 'Uttar Pradesh', action: 'Mobile Units', stressBefore: 85, stressAfter: 65, cost: 45000, status: 'Effective' },
  { id: 2, date: 'Jan 4, 8:15 AM', district: 'Patna', state: 'Bihar', action: 'Server Upgrade', stressBefore: 92, stressAfter: null, cost: 120000, status: 'In Progress' },
  { id: 3, date: 'Jan 3, 2:00 PM', district: 'Thane', state: 'Maharashtra', action: 'Queue Mgmt', stressBefore: 78, stressAfter: 72, cost: 12000, status: 'Limited Effect' },
  { id: 4, date: 'Jan 3, 11:00 AM', district: 'Bangalore Urban', state: 'Karnataka', action: 'Softw. Patch', stressBefore: 88, stressAfter: 55, cost: 35000, status: 'Effective' },
  { id: 5, date: 'Jan 3, 9:30 AM', district: 'Jaipur', state: 'Rajasthan', action: 'Staff Training', stressBefore: 65, stressAfter: 58, cost: 8000, status: 'Limited Effect' },
  { id: 6, date: 'Jan 3, 7:00 AM', district: 'Ranchi', state: 'Jharkhand', action: 'Mobile Units', stressBefore: 82, stressAfter: 60, cost: 42000, status: 'Effective' },
  { id: 7, date: 'Jan 2, 4:30 PM', district: 'Pune', state: 'Maharashtra', action: 'Server Upgrade', stressBefore: 89, stressAfter: 65, cost: 110000, status: 'Effective' },
  { id: 8, date: 'Jan 2, 2:15 PM', district: 'Gaya', state: 'Bihar', action: 'Queue Mgmt', stressBefore: 76, stressAfter: 70, cost: 15000, status: 'Limited Effect' },
  { id: 9, date: 'Jan 2, 11:45 AM', district: 'Varanasi', state: 'Uttar Pradesh', action: 'Softw. Patch', stressBefore: 95, stressAfter: 62, cost: 40000, status: 'Effective' },
  { id: 10, date: 'Jan 2, 9:00 AM', district: 'Indore', state: 'Madhya Pradesh', action: 'Staff Training', stressBefore: 70, stressAfter: null, cost: 9500, status: 'In Progress' },
  { id: 11, date: 'Jan 2, 6:30 AM', district: 'Kanpur', state: 'Uttar Pradesh', action: 'Mobile Units', stressBefore: 84, stressAfter: 68, cost: 44000, status: 'Effective' },
  { id: 12, date: 'Jan 1, 5:00 PM', district: 'Nagpur', state: 'Maharashtra', action: 'Softw. Patch', stressBefore: 87, stressAfter: 60, cost: 32000, status: 'Effective' },
  { id: 13, date: 'Jan 1, 3:30 PM', district: 'Coimbatore', state: 'Tamil Nadu', action: 'Queue Mgmt', stressBefore: 68, stressAfter: 55, cost: 19000, status: 'Effective' },
  { id: 14, date: 'Jan 1, 1:00 PM', district: 'Mysore', state: 'Karnataka', action: 'Staff Training', stressBefore: 62, stressAfter: 59, cost: 11000, status: 'Limited Effect' },
  { id: 15, date: 'Jan 1, 10:30 AM', district: 'Bhopal', state: 'Madhya Pradesh', action: 'Mobile Units', stressBefore: 75, stressAfter: 58, cost: 38000, status: 'Effective' },
  { id: 16, date: 'Dec 31, 8:00 AM', district: 'Surat', state: 'Gujarat', action: 'Server Upgrade', stressBefore: 90, stressAfter: 68, cost: 95000, status: 'Effective' },
  { id: 17, date: 'Dec 31, 4:45 PM', district: 'Ahmedabad', state: 'Gujarat', action: 'Softw. Patch', stressBefore: 88, stressAfter: null, cost: 34000, status: 'In Progress' },
  { id: 18, date: 'Dec 31, 2:30 PM', district: 'Visakhapatnam', state: 'Andhra Pradesh', action: 'Queue Mgmt', stressBefore: 72, stressAfter: 60, cost: 21000, status: 'Effective' },
  { id: 19, date: 'Dec 31, 12:00 PM', district: 'Ludhiana', state: 'Punjab', action: 'Staff Training', stressBefore: 65, stressAfter: 62, cost: 14000, status: 'Limited Effect' },
  { id: 20, date: 'Dec 31, 9:15 AM', district: 'Agra', state: 'Uttar Pradesh', action: 'Mobile Units', stressBefore: 80, stressAfter: 65, cost: 41000, status: 'Effective' },
  { id: 21, date: 'Dec 30, 5:30 PM', district: 'Nashik', state: 'Maharashtra', action: 'Server Upgrade', stressBefore: 85, stressAfter: 62, cost: 98000, status: 'Effective' },
  { id: 22, date: 'Dec 30, 3:00 PM', district: 'Vadodara', state: 'Gujarat', action: 'Queue Mgmt', stressBefore: 68, stressAfter: 58, cost: 20000, status: 'Effective' },
  { id: 23, date: 'Dec 30, 12:30 PM', district: 'Ghaziabad', state: 'Uttar Pradesh', action: 'Staff Training', stressBefore: 75, stressAfter: 70, cost: 13000, status: 'Limited Effect' },
  { id: 24, date: 'Dec 30, 10:00 AM', district: 'Faridabad', state: 'Haryana', action: 'Softw. Patch', stressBefore: 92, stressAfter: 65, cost: 36000, status: 'Effective' },
  { id: 25, date: 'Dec 30, 7:30 AM', district: 'Meerut', state: 'Uttar Pradesh', action: 'Mobile Units', stressBefore: 82, stressAfter: 68, cost: 43000, status: 'Effective' },
  { id: 26, date: 'Dec 29, 4:00 PM', district: 'Rajkot', state: 'Gujarat', action: 'Server Upgrade', stressBefore: 86, stressAfter: 64, cost: 105000, status: 'Effective' },
  { id: 27, date: 'Dec 29, 1:30 PM', district: 'Kalyan', state: 'Maharashtra', action: 'Queue Mgmt', stressBefore: 74, stressAfter: 62, cost: 18500, status: 'Effective' },
  { id: 28, date: 'Dec 29, 11:00 AM', district: 'Vasai', state: 'Maharashtra', action: 'Staff Training', stressBefore: 70, stressAfter: 68, cost: 16000, status: 'Limited Effect' },
  { id: 29, date: 'Dec 29, 8:30 AM', district: 'Aurangabad', state: 'Maharashtra', action: 'Softw. Patch', stressBefore: 89, stressAfter: 58, cost: 33000, status: 'Effective' },
];

// Helper: Adjust data based on time filter
const adjustDataForTimeFilter = (baseValue: number, filter: TimeFilter): number => {
  if (filter === 'week') return Math.round(baseValue * 5.5); // Work days
  if (filter === 'month') return Math.round(baseValue * 22);
  return baseValue;
};

// Helper: Format currency in Indian locale
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper: Export to CSV
const exportToCSV = (data: InterventionEntry[]) => {
  const headers = ['Date', 'District', 'State', 'Action', 'Stress_Before', 'Stress_After', 'Reduction', 'Cost', 'Status'];
  const rows = data.map(row => [
    row.date,
    row.district,
    row.state,
    row.action,
    row.stressBefore,
    row.stressAfter || 'Pending',
    row.stressAfter ? row.stressBefore - row.stressAfter : 'Pending',
    row.cost,
    row.status
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `Aadhaar_Impact_Report_${date}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Custom tooltip for cost efficiency chart
const CustomCostTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isHighCost = data.costPerPoint > 3000;
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 text-sm mb-1">{data.action}</p>
        <p className="text-sm text-gray-600 mb-2">{formatCurrency(data.costPerPoint)} per risk point reduction</p>
        {isHighCost && (
          <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
            <p className="text-xs text-orange-700 font-medium flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              High resource intensity
            </p>
            <p className="text-xs text-orange-600 mt-1">Check ROI before scaling</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Get unique values for filters
const UNIQUE_DISTRICTS = [...new Set(INTERVENTION_LOG.map(item => item.district))];
const UNIQUE_ACTIONS = [...new Set(INTERVENTION_LOG.map(item => item.action))];

// Items per page
const ITEMS_PER_PAGE = 8;

const ImpactTracker: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [showExportToast, setShowExportToast] = useState(false);
  
  // Filter states
  const [actionFilter, setActionFilter] = useState<string>('All Actions');
  const [districtFilter, setDistrictFilter] = useState<string>('All Districts');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate filtered metrics based on time filter
  const filteredMetrics = useMemo(() => {
    const actionsTaken = adjustDataForTimeFilter(85, timeFilter);
    const totalSpent = adjustDataForTimeFilter(4500000, timeFilter);
    const avgReduction = 18; // Avg stress points reduced
    const successRate = 92;
    const costPerPoint = Math.round(totalSpent / (actionsTaken * avgReduction));
    
    return {
      actionsTaken,
      totalSpent,
      avgReduction,
      successRate,
      costPerPoint,
      weeklyIncrease: timeFilter === 'today' ? 12 : timeFilter === 'week' ? 45 : 180
    };
  }, [timeFilter]);
  
  // Calculate chart data based on time filter
  const effectivenessData = useMemo(() => {
    return BASE_EFFECTIVENESS_DATA.map(item => ({
      ...item,
      impact: item.impact
    }));
  }, [timeFilter]);
  
  const costEfficiencyData = useMemo(() => {
    return BASE_COST_EFFICIENCY_DATA.map(item => ({
      ...item,
      costPerPoint: item.costPerPoint
    }));
  }, [timeFilter]);
  
  // Filter intervention log based on selected filters
  const filteredInterventions = useMemo(() => {
    return INTERVENTION_LOG.filter(item => {
      const matchesAction = actionFilter === 'All Actions' || item.action === actionFilter;
      const matchesDistrict = districtFilter === 'All Districts' || item.district === districtFilter;
      return matchesAction && matchesDistrict;
    });
  }, [actionFilter, districtFilter]);
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredInterventions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = filteredInterventions.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  const handleActionFilterChange = (value: string) => {
    setActionFilter(value);
    setCurrentPage(1);
  };
  
  const handleDistrictFilterChange = (value: string) => {
    setDistrictFilter(value);
    setCurrentPage(1);
  };
  
  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };
  
  // Helper to get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Mobile Units':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'Queue Mgmt':
        return <Users className="h-4 w-4 text-orange-600" />;
      case 'Staff Training':
        return <BookOpen className="h-4 w-4 text-red-600" />;
      case 'Softw. Patch':
        return <RefreshCcw className="h-4 w-4 text-purple-600" />;
      case 'Server Upgrade':
        return <Server className="h-4 w-4 text-green-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };
  
  // Helper to get action icon background
  const getActionIconBg = (action: string) => {
    switch (action) {
      case 'Mobile Units': return 'bg-blue-100';
      case 'Queue Mgmt': return 'bg-orange-100';
      case 'Staff Training': return 'bg-red-100';
      case 'Softw. Patch': return 'bg-purple-100';
      case 'Server Upgrade': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };
  
  // Handle export
  const handleExport = () => {
    setShowExportToast(true);
    exportToCSV(filteredInterventions);
    setTimeout(() => setShowExportToast(false), 3000);
  };
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Export Toast Notification */}
      {showExportToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <Download className="h-5 w-5" />
          <span className="font-medium">Downloading Impact Report...</span>
        </div>
      )}
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif-heading">Impact Tracker</h1>
          <p className="text-gray-600 mt-1">
            Measure effectiveness of ecosystem interventions & ROI
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm">
            {[{label: 'Today', value: 'today'}, {label: 'This Week', value: 'week'}, {label: 'This Month', value: 'month'}].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeFilter(range.value as TimeFilter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timeFilter === range.value
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleExport}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">INTERVENTIONS</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {filteredMetrics.actionsTaken.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-xs">
              +{filteredMetrics.weeklyIncrease} new
            </span>
            <span className="text-gray-400 ml-2 text-xs">Target: {timeFilter === 'today' ? 20 : 100}</span>
          </div>
        </div>
        
        {/* Avg Reduction */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">STRESS REDUCTION</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">-{filteredMetrics.avgReduction}</h3>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 text-xs">Index points per action</span>
          </div>
        </div>
        
        {/* Success Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">SUCCESS RATE</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-1">{filteredMetrics.successRate}%</h3>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-xs">↑ 3%</span>
            <span className="text-gray-400 ml-2 text-xs">vs benchmark</span>
          </div>
        </div>
        
        {/* Total Cost */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">ESTIMATED COST</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(filteredMetrics.totalSpent)}
              </h3>
            </div>
            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
              <IndianRupee className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 text-xs">
              {formatCurrency(filteredMetrics.costPerPoint)} / stress pt reduction
            </span>
          </div>
        </div>
      </div>

      {/* ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Effectiveness Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Effectiveness by Intervention</h3>
              <p className="text-xs text-gray-500">Average operational stress reduction (points)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={effectivenessData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="action" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="impact" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fill: '#6b7280', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Efficiency Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cost Efficiency</h3>
              <p className="text-xs text-gray-500">Cost (₹) per 1 point of stress reduction</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="action" tick={{fontSize: 11}} interval={0} />
                <YAxis tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12}} />
                <Tooltip content={<CustomCostTooltip />} />
                <Bar dataKey="costPerPoint" radius={[4, 4, 0, 0]} barSize={40}>
                  {costEfficiencyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.costPerPoint > 3000 ? '#f97316' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ACTIONS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Intervention Log
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Detailed record of ecosystem actions and outcome analysis
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select 
                value={actionFilter}
                onChange={(e) => handleActionFilterChange(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              >
                <option>All Actions</option>
                {UNIQUE_ACTIONS.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select 
                value={districtFilter}
                onChange={(e) => handleDistrictFilterChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              >
                <option>All Districts</option>
                {UNIQUE_DISTRICTS.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">District / State</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Action Type</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stress Index Before</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stress Index After</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Improvement</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Est. Cost</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentPageData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="h-8 w-8 text-gray-300" />
                      <p className="font-medium">No interventions found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPageData.map((item) => {
                  const reduction = item.stressAfter ? item.stressBefore - item.stressAfter : null;
                  const costPerPoint = reduction ? Math.round(item.cost / reduction) : null;
                  
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {item.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.district}</p>
                          <p className="text-[11px] text-gray-500">{item.state}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 ${getActionIconBg(item.action)} rounded-md`}>
                            {getActionIcon(item.action)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold px-2 py-1 rounded ${
                          item.stressBefore >= 80 ? 'text-red-600 bg-red-50' : 
                          item.stressBefore >= 60 ? 'text-purple-600 bg-purple-50' : 
                          'text-orange-600 bg-orange-50'
                        }`}>
                          {item.stressBefore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.stressAfter ? (
                          <span className={`text-sm font-bold px-2 py-1 rounded ${
                            item.stressAfter >= 80 ? 'text-red-600 bg-red-50' : 
                            item.stressAfter >= 60 ? 'text-purple-600 bg-purple-50' : 
                            'text-green-600 bg-green-50'
                          }`}>
                            {item.stressAfter}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Pending...</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reduction ? (
                          <div>
                            <div className={`flex items-center gap-1 font-bold ${
                              reduction >= 20 ? 'text-green-600' : 
                              reduction >= 10 ? 'text-blue-600' : 
                              'text-yellow-600'
                            }`}>
                              <ArrowDown className="h-4 w-4" />
                              <span>{reduction} pts</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Evaluating...</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.cost)}</p>
                          {costPerPoint && (
                            <p className="text-[10px] text-gray-500">{formatCurrency(costPerPoint)}/pt</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === 'Effective' && (
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" />
                            Effective
                          </span>
                        )}
                        {item.status === 'In Progress' && (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                            <Clock className="h-3 w-3" />
                            In Progress
                          </span>
                        )}
                        {item.status === 'Limited Effect' && (
                          <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit border border-yellow-200">
                            <AlertCircle className="h-3 w-3" />
                            Limited Effect
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing {filteredInterventions.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredInterventions.length)} of {filteredInterventions.length} actions
            </p>
            <div className="flex gap-1">
              <button 
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-white text-xs font-medium bg-white disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
              >
                Previous
              </button>
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-xs text-gray-400">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page as number)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-gray-300 hover:bg-gray-50 bg-white text-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button 
                onClick={goToNext}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-white text-xs font-medium bg-white disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ImpactTracker;