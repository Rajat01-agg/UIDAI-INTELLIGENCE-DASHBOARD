import { RegionStatus } from './types';

// Color Palette for Aadhaar Intelligence Dashboard
export const COLORS = {
  primary: '#1e3a5f',
  sidebarBg: '#0f2942',
  background: '#f5f7fa',
  // Region status colors
  status: {
    critical: '#dc2626',  // red-600
    watch: '#f59e0b',     // amber-500
    normal: '#22c55e',    // green-500
  },
  // Badge colors
  badges: {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#f59e0b',
    low: '#3b82f6',
    success: '#10b981',
  },
  // Index colors (for heatmap/charts)
  index: {
    veryHigh: '#dc2626',  // 80+
    high: '#ea580c',      // 60-80
    moderate: '#ca8a04',  // 40-60
    normal: '#16a34a',    // 20-40
    low: '#0891b2',       // 0-20
  }
};

// Helper functions for status colors
export const getStatusColor = (status: RegionStatus): string => {
  switch (status) {
    case 'CRITICAL': return COLORS.status.critical;
    case 'WATCH': return COLORS.status.watch;
    case 'NORMAL': return COLORS.status.normal;
    default: return '#cccccc';
  }
};

export const getIndexColor = (value: number): string => {
  if (value >= 80) return COLORS.index.veryHigh;
  if (value >= 60) return COLORS.index.high;
  if (value >= 40) return COLORS.index.moderate;
  if (value >= 20) return COLORS.index.normal;
  return COLORS.index.low;
};
