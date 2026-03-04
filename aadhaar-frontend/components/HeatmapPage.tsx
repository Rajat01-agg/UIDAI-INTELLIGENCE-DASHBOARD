/// <reference types="vite/client" />

/**
 * HeatmapPage Component
 * 
 * India map with district-level dots colored by selected index type.
 * Uses Mapbox GL for map rendering and integrates with filter bar.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl';
import { Loader2, AlertTriangle, Info } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  HeatmapResponse,
  HeatmapDataPoint,
  IndexType,
  RegionStatus,
  AppliedFilters,
} from '../types';
import { fetchHeatmapData } from '../services/aadhaarApi';
import { useFilters } from '../hooks/useFilters';
import FilterBar from './FilterBar';
import { DISTRICT_NAMES } from '../data/districts';
import { CANONICAL_STATES_UTS } from '../data/states';
import { batchGeocode, getDistrictCoordsSync } from '../utils/geocode';

// Mapbox access token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

// Initial map view for India
const INITIAL_VIEW_STATE = {
  longitude: 78.9629,
  latitude: 20.5937,
  zoom: 4.5,
};

// State/UT center coordinates + zoom level for flyTo
const STATE_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Andhra Pradesh':       { lat: 15.9129, lng: 79.74,   zoom: 7   },
  'Arunachal Pradesh':    { lat: 28.218,  lng: 94.7278, zoom: 7   },
  'Assam':                { lat: 26.2006, lng: 92.9376, zoom: 7   },
  'Bihar':                { lat: 25.0961, lng: 85.3131, zoom: 7   },
  'Chhattisgarh':         { lat: 21.2787, lng: 81.8661, zoom: 7   },
  'Goa':                  { lat: 15.2993, lng: 74.124,  zoom: 9   },
  'Gujarat':              { lat: 22.2587, lng: 71.1924, zoom: 7   },
  'Haryana':              { lat: 29.0588, lng: 76.0856, zoom: 8   },
  'Himachal Pradesh':     { lat: 31.1048, lng: 77.1734, zoom: 8   },
  'Jharkhand':            { lat: 23.6102, lng: 85.2799, zoom: 7   },
  'Karnataka':            { lat: 15.3173, lng: 75.7139, zoom: 7   },
  'Kerala':               { lat: 10.8505, lng: 76.2711, zoom: 8   },
  'Madhya Pradesh':       { lat: 22.9734, lng: 78.6569, zoom: 7   },
  'Maharashtra':          { lat: 19.7515, lng: 75.7139, zoom: 7   },
  'Manipur':              { lat: 24.6637, lng: 93.9063, zoom: 8   },
  'Meghalaya':            { lat: 25.467,  lng: 91.3662, zoom: 8   },
  'Mizoram':              { lat: 23.1645, lng: 92.9376, zoom: 8   },
  'Nagaland':             { lat: 26.1584, lng: 94.5624, zoom: 8   },
  'Odisha':               { lat: 20.9517, lng: 85.0985, zoom: 7   },
  'Punjab':               { lat: 31.1471, lng: 75.3412, zoom: 8   },
  'Rajasthan':            { lat: 27.0238, lng: 74.2179, zoom: 7   },
  'Sikkim':               { lat: 27.533,  lng: 88.5122, zoom: 9   },
  'Tamil Nadu':           { lat: 11.1271, lng: 78.6569, zoom: 7   },
  'Telangana':            { lat: 18.1124, lng: 79.0193, zoom: 7.5 },
  'Tripura':              { lat: 23.9408, lng: 91.9882, zoom: 8   },
  'Uttar Pradesh':        { lat: 26.8467, lng: 80.9462, zoom: 7   },
  'Uttarakhand':          { lat: 30.0668, lng: 79.0193, zoom: 8   },
  'West Bengal':           { lat: 22.9868, lng: 87.855,  zoom: 7   },
  'Andaman and Nicobar Islands': { lat: 11.7401, lng: 92.6586, zoom: 7 },
  'Chandigarh':           { lat: 30.7333, lng: 76.7794, zoom: 11  },
  'Daman and Diu':        { lat: 20.4283, lng: 72.8397, zoom: 9   },
  'Delhi':                { lat: 28.7041, lng: 77.1025, zoom: 10  },
  'Jammu and Kashmir':    { lat: 33.7782, lng: 76.5762, zoom: 7   },
  'Ladakh':               { lat: 34.1526, lng: 77.5771, zoom: 7   },
  'Lakshadweep':          { lat: 10.5667, lng: 72.6417, zoom: 8   },
  'Puducherry':           { lat: 11.9416, lng: 79.8083, zoom: 10  },
};

// Helper to get color based on index value (matches legend)
const getIndexColor = (value: number): string => {
  if (value >= 80) return '#ef4444'; // red-500  — Critical
  if (value >= 60) return '#f97316'; // orange-500 — High
  if (value >= 40) return '#eab308'; // yellow-500 — Moderate
  if (value >= 20) return '#22c55e'; // green-500  — Normal
  return '#3b82f6';                  // blue-500   — Low
};

// Helper to get status color — aligned with the 5-tier index legend
const getStatusColor = (status: RegionStatus): string => {
  switch (status) {
    case 'CRITICAL': return '#ef4444'; // red-500
    case 'WATCH': return '#f97316';    // orange-500
    case 'NORMAL': return '#22c55e';   // green-500
    default: return '#6b7280';
  }
};

// Derive a 5-tier label + color from numeric index value
const getRiskTier = (value: number): { label: string; color: string } => {
  if (value >= 80) return { label: 'CRITICAL', color: '#ef4444' };
  if (value >= 60) return { label: 'HIGH',     color: '#f97316' };
  if (value >= 40) return { label: 'MODERATE',  color: '#eab308' };
  if (value >= 20) return { label: 'NORMAL',    color: '#22c55e' };
  return              { label: 'LOW',       color: '#3b82f6' };
};

const HeatmapPage: React.FC = () => {
  const {
    filterOptions,
    filters,
    loadingOptions,
    setStateFilter,
    setDistrictFilter,
    setYearFilter,
    setMonthFilter,
    setMetricTypeFilter,
    setAgeGroupFilter,
    setIndexTypeFilter,
    clearFilters,
    filteredDistricts,
  } = useFilters();

  const [heatmapData, setHeatmapData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<HeatmapDataPoint | null>(null);
  const mapRef = useRef<MapRef>(null);

  // Fly to selected state or district (or reset to India view)
  const flyToState = useCallback((stateName?: string, districtName?: string) => {
    const map = mapRef.current;
    if (!map) return;

    // If a specific district is selected, try to zoom to it directly
    if (stateName && districtName) {
      const distCoords = getDistrictCoordsSync(districtName, stateName);
      if (distCoords) {
        map.flyTo({ center: [distCoords[1], distCoords[0]], zoom: 9, duration: 1500 });
        return;
      }
    }

    if (stateName && STATE_CENTERS[stateName]) {
      const { lat, lng, zoom } = STATE_CENTERS[stateName];
      map.flyTo({ center: [lng, lat], zoom, duration: 1500 });
    } else {
      // Reset to full India view
      map.flyTo({
        center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
        zoom: INITIAL_VIEW_STATE.zoom,
        duration: 1500,
      });
    }
  }, []);

  // Strictly filter displayed markers by the active state/district filter.
  // This is a defensive layer — even if the backend or mock data returns extra
  // records, ONLY markers matching the selected state/district will render.
  const filteredMarkers = useMemo(() => {
    if (!heatmapData?.data) return [];
    return heatmapData.data.filter((point) => {
      if (filters.state) {
        if (point.stateName !== filters.state) return false;
      }
      if (filters.district) {
        if (point.districtName.toLowerCase() !== filters.district.toLowerCase()) return false;
      }
      return true;
    });
  }, [heatmapData, filters.state, filters.district]);

  // Load heatmap data
  const loadHeatmapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let finalData: HeatmapResponse | null = null;

      try {
        const apiData = await fetchHeatmapData(filters);
        // Use API data only if it has results; otherwise fall through to mock
        if (apiData.data.length > 0) {
          finalData = apiData;
        }
      } catch {
        // API unavailable — will fall through to mock
      }

      // If API returned no usable data, generate mock data
      if (!finalData) {
        const mockData: HeatmapDataPoint[] = await generateMockHeatmapData(filters);
        finalData = {
          data: mockData,
          indexType: (filters.indexType as IndexType) || 'CompositeRisk',
          minValue: 10,
          maxValue: 95,
        };
      }

      setHeatmapData(finalData);
    } catch (err) {
      console.error('Heatmap data load failed:', err);
      setError('Failed to load heatmap data');
    } finally {
      setLoading(false);
      // Auto-pan/zoom to selected state/district after data loads
      flyToState(filters.state, filters.district);
    }
  }, [filters, flyToState]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Heatmap</h1>
        <p className="text-gray-600 text-sm mt-1">
          District-level visualization of Aadhaar system metrics across India
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filterOptions={filterOptions}
        filters={filters}
        loading={loadingOptions}
        onStateChange={setStateFilter}
        onDistrictChange={setDistrictFilter}
        onYearChange={setYearFilter}
        onMonthChange={setMonthFilter}
        onMetricTypeChange={setMetricTypeFilter}
        onAgeGroupChange={setAgeGroupFilter}
        onIndexTypeChange={setIndexTypeFilter}
        onClearFilters={clearFilters}
        filteredDistricts={filteredDistricts}
        actionButton={{
          label: 'Generate Heatmap',
          onClick: loadHeatmapData,
          loading: loading,
          disabled: loading,
        }}
        showFilters={{
          state: true,
          district: true,
          year: true,
          month: true,
          metricType: true,
          ageGroup: true,
          indexType: true,
        }}
      />

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {filters.indexType ? `${filters.indexType} Index` : 'Composite Risk Index'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-600">Low (0-20)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600">Normal (20-40)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-gray-600">Moderate (40-60)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs text-gray-600">High (60-80)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600">Critical (80+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-[1000] bg-white/80 flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading map data...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2 text-red-700 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Mapbox Map */}
        <div style={{ height: '600px', position: 'relative' }}>
          <Map
            ref={mapRef}
            initialViewState={INITIAL_VIEW_STATE}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            maxZoom={10}
            minZoom={4}
          >
            <NavigationControl position="top-right" />
            
            {/* District Markers — strictly filtered by active state/district */}
            {filteredMarkers.map((point) => (
              <Marker
                key={point.districtCode}
                longitude={point.coordinates[1]}
                latitude={point.coordinates[0]}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedPoint(point);
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: getIndexColor(point.indexValue),
                    border: '2px solid white',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title={`${point.districtName}, ${point.stateName}`}
                />
              </Marker>
            ))}

            {/* Popup for selected point */}
            {selectedPoint && (
              <Popup
                longitude={selectedPoint.coordinates[1]}
                latitude={selectedPoint.coordinates[0]}
                onClose={() => setSelectedPoint(null)}
                closeButton={true}
                closeOnClick={false}
                anchor="bottom"
                offset={15}
              >
                <div className="min-w-[200px] p-2">
                  <h3 className="font-bold text-sm mb-1">{selectedPoint.districtName}</h3>
                  <p className="text-xs text-gray-500 mb-3">{selectedPoint.stateName}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        {heatmapData?.indexType === 'CompositeRisk' ? 'Composite Risk' : `${heatmapData?.indexType} Index`}
                      </span>
                      <span 
                        className="text-sm font-bold"
                        style={{ color: getIndexColor(selectedPoint.indexValue) }}
                      >
                        {selectedPoint.indexValue.toFixed(1)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Status</span>
                      {(() => {
                        const tier = getRiskTier(selectedPoint.indexValue);
                        return (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                            style={{
                              backgroundColor: `${tier.color}20`,
                              color: tier.color,
                            }}
                          >
                            {tier.label}
                          </span>
                        );
                      })()}
                    </div>
                    
                    {selectedPoint.signals.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-[10px] text-gray-500 mb-1">Signals:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedPoint.signals.map((signal, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[9px] font-medium"
                            >
                              {signal.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>

      {/* Stats Summary — based on composite risk score thresholds */}
      {heatmapData && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">Total Districts</p>
            <p className="text-2xl font-bold text-gray-900">{filteredMarkers.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">Critical (80+)</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredMarkers.filter(d => d.indexValue >= 80).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">Watch (40–80)</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredMarkers.filter(d => d.indexValue >= 40 && d.indexValue < 80).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">Normal (0–40)</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredMarkers.filter(d => d.indexValue < 40).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Generate mock heatmap data with real district names + Mapbox forwardGeocode
// Respects state/district filters so only the selected region is shown.
async function generateMockHeatmapData(filters: AppliedFilters): Promise<HeatmapDataPoint[]> {
  // Build full name→abbreviation map from canonical list
  const nameToAbbr: Record<string, string> = {};
  for (const s of CANONICAL_STATES_UTS) {
    nameToAbbr[s.name] = s.abbreviation;
  }

  // Map abbreviation → full name (for all states that have districts in DISTRICT_NAMES)
  const abbrToName: Record<string, string> = {};
  for (const s of CANONICAL_STATES_UTS) {
    abbrToName[s.abbreviation] = s.name;
  }

  // Collect all district/state pairs
  const pairs: Array<{ district: string; state: string; abbr: string }> = [];

  if (filters.state) {
    // Only generate data for the selected state
    const abbr = nameToAbbr[filters.state];
    const districts = abbr ? (DISTRICT_NAMES[abbr] || []) : [];
    for (const dist of districts) {
      // If a specific district is selected, only include that one
      if (filters.district && dist.toLowerCase() !== filters.district.toLowerCase()) continue;
      pairs.push({ district: dist, state: filters.state, abbr: abbr || 'XX' });
    }
  } else {
    // No state selected — show a sample across all states (original behavior)
    for (const [abbr, districts] of Object.entries(DISTRICT_NAMES)) {
      const stateName = abbrToName[abbr];
      if (!stateName) continue;
      for (const dist of districts.slice(0, 10)) {
        pairs.push({ district: dist, state: stateName, abbr });
      }
    }
  }

  // Batch-geocode all districts via Mapbox SDK forwardGeocode
  await batchGeocode(pairs.map(p => ({ district: p.district, state: p.state })));

  const dataPoints: HeatmapDataPoint[] = pairs.map((p) => {
    const indexValue = 15 + Math.random() * 75;
    const status: RegionStatus = indexValue >= 70 ? 'CRITICAL' : indexValue >= 50 ? 'WATCH' : 'NORMAL';
    const coords = getDistrictCoordsSync(p.district, p.state) || [22.0, 78.0];

    return {
      districtCode: `${p.abbr}-${p.district.substring(0, 3).toUpperCase()}`,
      districtName: p.district,
      stateName: p.state,
      coordinates: coords,
      indexValue,
      indexType: 'CompositeRisk' as IndexType,
      status,
      signals: indexValue >= 75 ? [{ type: 'ANOMALY' as const, label: 'Anomaly' }] : [],
    };
  });

  return dataPoints;
}

export default HeatmapPage;
