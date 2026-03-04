/**
 * useFilters Hook
 * 
 * Centralized filter state management for the Aadhaar Intelligence Dashboard.
 * Provides filter options from API and maintains current filter selections.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FilterOptions,
  AppliedFilters,
  MetricType,
  AgeGroup,
  IndexType,
} from '../types';
import { fetchFilterMetadata } from '../services/aadhaarApi';
import { CANONICAL_STATES_UTS, resolveStateByName } from '../data/states';
import { DISTRICT_NAMES } from '../data/districts';

interface UseFiltersResult {
  // Filter options from API
  filterOptions: FilterOptions | null;
  loadingOptions: boolean;
  optionsError: string | null;
  
  // Current filter values
  filters: AppliedFilters;
  
  // Filter setters
  setStateFilter: (state: string | undefined) => void;
  setDistrictFilter: (district: string | undefined) => void;
  setYearFilter: (year: number | undefined) => void;
  setMonthFilter: (month: number | undefined) => void;
  setMetricTypeFilter: (metricType: MetricType | undefined) => void;
  setAgeGroupFilter: (ageGroup: AgeGroup | undefined) => void;
  setIndexTypeFilter: (indexType: IndexType | undefined) => void;
  
  // Bulk operations
  setFilters: (filters: AppliedFilters) => void;
  clearFilters: () => void;
  
  // Query string builder
  buildQueryString: () => string;
  
  // Filtered district options based on selected state
  filteredDistricts: { code: string; name: string; stateCode: string }[];
  
  // Refresh filter options
  refreshOptions: () => Promise<void>;
}

// ── Comprehensive static option lists ────────────────────────

const ALL_MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const ALL_STATES = CANONICAL_STATES_UTS.map(s => ({ code: s.name, name: s.name }));
const ALL_METRIC_TYPES: MetricType[] = ['Enrolment', 'Biometric', 'Demographic'];
const ALL_AGE_GROUPS: AgeGroup[] = ['All', '0-5', '5-18', '18-60', '60+'];
const ALL_INDEX_TYPES: IndexType[] = ['Demand', 'Stress', 'Gap', 'CompositeRisk'];

/** Merge API-provided districts with canonical DISTRICT_NAMES so every state has entries */
function buildComprehensiveDistricts(
  apiDistricts: { code: string; name: string; stateCode: string }[]
): { code: string; name: string; stateCode: string }[] {
  const result: { code: string; name: string; stateCode: string }[] = [];
  const seen = new Set<string>();

  // API districts first (higher priority) — normalize stateCode to canonical name
  for (const d of apiDistricts) {
    const canonical = resolveStateByName(d.stateCode);
    const normalizedStateCode = canonical?.name || d.stateCode;
    const key = `${normalizedStateCode}|${d.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ code: d.code, name: d.name, stateCode: normalizedStateCode });
    }
  }

  // Fill in canonical districts for every state/UT
  for (const stateUT of CANONICAL_STATES_UTS) {
    const names = DISTRICT_NAMES[stateUT.abbreviation] || [];
    for (const dName of names) {
      const key = `${stateUT.name}|${dName}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ code: dName, name: dName, stateCode: stateUT.name });
      }
    }
  }

  return result;
}

/** Ensure every dropdown always has a full set of options */
function ensureComprehensiveOptions(partial: FilterOptions): FilterOptions {
  const yearSet = new Set([...(partial.years || []), 2024, 2025, 2026]);
  return {
    states: ALL_STATES,
    districts: buildComprehensiveDistricts(partial.districts || []),
    years: Array.from(yearSet).sort((a, b) => a - b),
    months: ALL_MONTH_OPTIONS,
    metricTypes: ALL_METRIC_TYPES,
    ageGroups: ALL_AGE_GROUPS,
    indexTypes: ALL_INDEX_TYPES,
  };
}

const INITIAL_FILTERS: AppliedFilters = {};

export const useFilters = (): UseFiltersResult => {
  // Filter options state
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  
  // Current filter selections
  const [filters, setFiltersState] = useState<AppliedFilters>(INITIAL_FILTERS);

  // Fetch filter options from API
  const fetchOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setOptionsError(null);
      const options = await fetchFilterMetadata();
      setFilterOptions(ensureComprehensiveOptions(options));
    } catch (err) {
      setOptionsError(err instanceof Error ? err.message : 'Failed to load filter options');
      // Use comprehensive fallback options with all states, districts, months, etc.
      setFilterOptions(ensureComprehensiveOptions({
        states: [],
        districts: [],
        years: [2024, 2025, 2026],
        months: [],
        metricTypes: [],
        ageGroups: [],
        indexTypes: [],
      }));
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // Individual filter setters
  const setStateFilter = useCallback((state: string | undefined) => {
    setFiltersState(prev => {
      // Clear district when state changes
      const newFilters: AppliedFilters = { ...prev, state };
      if (state !== prev.state) {
        newFilters.district = undefined;
      }
      return newFilters;
    });
  }, []);

  const setDistrictFilter = useCallback((district: string | undefined) => {
    setFiltersState(prev => ({ ...prev, district }));
  }, []);

  const setYearFilter = useCallback((year: number | undefined) => {
    setFiltersState(prev => ({ ...prev, year }));
  }, []);

  const setMonthFilter = useCallback((month: number | undefined) => {
    setFiltersState(prev => ({ ...prev, month }));
  }, []);

  const setMetricTypeFilter = useCallback((metricType: MetricType | undefined) => {
    setFiltersState(prev => ({ ...prev, metricType }));
  }, []);

  const setAgeGroupFilter = useCallback((ageGroup: AgeGroup | undefined) => {
    setFiltersState(prev => ({ ...prev, ageGroup }));
  }, []);

  const setIndexTypeFilter = useCallback((indexType: IndexType | undefined) => {
    setFiltersState(prev => ({ ...prev, indexType }));
  }, []);

  // Bulk operations
  const setFilters = useCallback((newFilters: AppliedFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(INITIAL_FILTERS);
  }, []);

  // Build query string from current filters
  const buildQueryString = useCallback((): string => {
    const params = new URLSearchParams();
    
    if (filters.state) params.append('state', filters.state);
    if (filters.district) params.append('district', filters.district);
    if (filters.year) params.append('year', filters.year.toString());
    if (filters.month) params.append('month', filters.month.toString());
    if (filters.metricType) params.append('metricType', filters.metricType);
    if (filters.ageGroup) params.append('ageGroup', filters.ageGroup);
    if (filters.indexType) params.append('indexType', filters.indexType);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }, [filters]);

  // Filter districts based on selected state
  const filteredDistricts = useMemo(() => {
    if (!filterOptions?.districts) return [];
    if (!filters.state) return []; // Require state selection before showing districts
    return filterOptions.districts.filter(d => d.stateCode === filters.state);
  }, [filterOptions?.districts, filters.state]);

  return {
    filterOptions,
    loadingOptions,
    optionsError,
    filters,
    setStateFilter,
    setDistrictFilter,
    setYearFilter,
    setMonthFilter,
    setMetricTypeFilter,
    setAgeGroupFilter,
    setIndexTypeFilter,
    setFilters,
    clearFilters,
    buildQueryString,
    filteredDistricts,
    refreshOptions: fetchOptions,
  };
};

export default useFilters;
