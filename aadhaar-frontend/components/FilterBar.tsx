/**
 * FilterBar Component
 *
 * Reusable filter bar for the Aadhaar Intelligence Dashboard.
 * Used across Heatmap, Charts, Reports, and other pages.
 *
 * Filters are visually grouped into three sections:
 *   Location (State / District)  |  Time (Year / Month)  |  Analysis (Metric / Age / Index)
 * Each dropdown has a tiny label above it for clarity.
 */

import React from 'react';
import { Filter, X, Loader2, MapPin, Calendar, BarChart3, ChevronDown } from 'lucide-react';
import {
  FilterOptions,
  AppliedFilters,
  MetricType,
  AgeGroup,
  IndexType,
} from '../types';

interface FilterBarProps {
  filterOptions: FilterOptions | null;
  filters: AppliedFilters;
  loading?: boolean;

  // Filter setters
  onStateChange: (state: string | undefined) => void;
  onDistrictChange: (district: string | undefined) => void;
  onYearChange: (year: number | undefined) => void;
  onMonthChange: (month: number | undefined) => void;
  onMetricTypeChange: (metricType: MetricType | undefined) => void;
  onAgeGroupChange: (ageGroup: AgeGroup | undefined) => void;
  onIndexTypeChange: (indexType: IndexType | undefined) => void;
  onClearFilters: () => void;

  // Optional action button
  actionButton?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };

  // Filtered districts based on state selection
  filteredDistricts?: { code: string; name: string; stateCode: string }[];

  // Which filters to show (default: all)
  showFilters?: {
    state?: boolean;
    district?: boolean;
    year?: boolean;
    month?: boolean;
    metricType?: boolean;
    ageGroup?: boolean;
    indexType?: boolean;
  };
}

/* ── tiny reusable wrapper: label + select ─────────────────────── */
const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}> = ({ label, value, onChange, disabled, active, children }) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 pl-0.5 select-none">
      {label}
    </span>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          appearance-none w-full pl-2.5 pr-7 py-[7px] rounded-md text-[13px] font-medium
          border transition-all duration-150 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
          disabled:opacity-40 disabled:cursor-not-allowed
          ${active
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/60'}
        `}
      >
        {children}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5
          ${active ? 'text-blue-400' : 'text-gray-400'}`}
      />
    </div>
  </div>
);

/* ── group divider (thin vertical line) ────────────────────────── */
const GroupDivider: React.FC = () => (
  <div className="hidden sm:block self-stretch my-1 w-px bg-gray-200" />
);

const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  filters,
  loading = false,
  onStateChange,
  onDistrictChange,
  onYearChange,
  onMonthChange,
  onMetricTypeChange,
  onAgeGroupChange,
  onIndexTypeChange,
  onClearFilters,
  actionButton,
  filteredDistricts,
  showFilters = {
    state: true,
    district: true,
    year: true,
    month: true,
    metricType: true,
    ageGroup: true,
    indexType: true,
  },
}) => {
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);
  const activeCount = Object.values(filters).filter(v => v !== undefined).length;
  const districts = filteredDistricts || filterOptions?.districts || [];

  const showLocation = showFilters.state || showFilters.district;
  const showTime = showFilters.year || showFilters.month;
  const showAnalysis = showFilters.metricType || showFilters.ageGroup || showFilters.indexType;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading filters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      {/* ── Header strip ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-100">
            <Filter className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Filters</span>
          {activeCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-500
                       hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* ── Filter body ───────────────────────────────────────── */}
      <div className="px-4 py-3.5 space-y-3">

        {/* ── Row 1: Location + Period + Generate button ──────── */}
        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">

          {/* ── Location group ────────────────────────────────── */}
          {showLocation && (
            <>
              <div className="flex items-center gap-1.5 self-end pb-[7px] mr-0.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Location</span>
              </div>

              {showFilters.state && (
                <FilterSelect
                  label="State"
                  value={filters.state || ''}
                  onChange={(v) => onStateChange(v || undefined)}
                  active={!!filters.state}
                >
                  <option value="">All States</option>
                  {filterOptions?.states.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </FilterSelect>
              )}

              {showFilters.district && (
                <FilterSelect
                  label="District"
                  value={filters.district || ''}
                  onChange={(v) => onDistrictChange(v || undefined)}
                  disabled={!filters.state}
                  active={!!filters.district}
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </FilterSelect>
              )}
            </>
          )}

          {/* divider between location & time */}
          {showLocation && showTime && <GroupDivider />}

          {/* ── Time group ────────────────────────────────────── */}
          {showTime && (
            <>
              <div className="flex items-center gap-1.5 self-end pb-[7px] mr-0.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Period</span>
              </div>

              {showFilters.year && (
                <FilterSelect
                  label="Year"
                  value={filters.year?.toString() || ''}
                  onChange={(v) => onYearChange(v ? parseInt(v) : undefined)}
                  active={!!filters.year}
                >
                  <option value="">All Years</option>
                  {filterOptions?.years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </FilterSelect>
              )}

              {showFilters.month && (
                <FilterSelect
                  label="Month"
                  value={filters.month?.toString() || ''}
                  onChange={(v) => onMonthChange(v ? parseInt(v) : undefined)}
                  active={!!filters.month}
                >
                  <option value="">All Months</option>
                  {filterOptions?.months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </FilterSelect>
              )}
            </>
          )}

          {/* ── Generate button pinned to the right ───────────── */}
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              disabled={actionButton.disabled || actionButton.loading}
              className="ml-auto self-end flex items-center gap-2 px-5 py-[9px] rounded-lg text-[13px]
                         font-semibold text-white shadow-sm transition-all duration-150
                         bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
            >
              {actionButton.loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {actionButton.label}
            </button>
          )}
        </div>

        {/* ── Row 2: Analysis group (full width) ──────────────── */}
        {showAnalysis && (
          <div className="flex flex-wrap items-end gap-x-3 gap-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 self-end pb-[7px] mr-0.5">
              <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Analysis</span>
            </div>

            {showFilters.metricType && (
              <FilterSelect
                label="Metric"
                value={filters.metricType || ''}
                onChange={(v) => onMetricTypeChange((v as MetricType) || undefined)}
                active={!!filters.metricType}
              >
                <option value="">All Metrics</option>
                {filterOptions?.metricTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </FilterSelect>
            )}

            {showFilters.ageGroup && (
              <FilterSelect
                label="Age Group"
                value={filters.ageGroup || ''}
                onChange={(v) => onAgeGroupChange((v as AgeGroup) || undefined)}
                active={!!filters.ageGroup}
              >
                <option value="">All Ages</option>
                {filterOptions?.ageGroups.map((group) => (
                  <option key={group} value={group}>
                    {group === 'All' ? 'All Age Groups' : group}
                  </option>
                ))}
              </FilterSelect>
            )}

            {showFilters.indexType && (
              <FilterSelect
                label="Index"
                value={filters.indexType || ''}
                onChange={(v) => onIndexTypeChange((v as IndexType) || undefined)}
                active={!!filters.indexType}
              >
                <option value="">All Indexes</option>
                {filterOptions?.indexTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'CompositeRisk' ? 'Composite Risk' : `${type} Index`}
                  </option>
                ))}
              </FilterSelect>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
