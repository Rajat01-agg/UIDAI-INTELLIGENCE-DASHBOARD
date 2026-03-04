export const buildFilterQuery = (filters: any) => {
  const where: any = {};

  if (filters.state) {
    where.state = { equals: filters.state, mode: 'insensitive' };
  }

  if (filters.district) {
    where.district = { equals: filters.district, mode: 'insensitive' };
  }

  if (filters.year) {
    where.year = Number(filters.year);
  }

  if (filters.month) {
    where.month = Number(filters.month);
  }

  if (filters.metricCategory) {
    where.metricCategory = filters.metricCategory;
  }

  if (filters.ageGroup) {
    where.ageGroup = filters.ageGroup;
  }

  return where;
};


export const resolveIndexColumn = (indexType: string) => {
  const map: any = {
    demandPressure: "demandPressureIndex",
    demand_pressure: "demandPressureIndex",
    operationalStress: "operationalStressIndex",
    operational_stress: "operationalStressIndex",
    updateAccessibilityGap: "updateAccessibilityGap",
    update_accessibility_gap: "updateAccessibilityGap",
    accessibilityGap: "updateAccessibilityGap",
    accessibility_gap: "updateAccessibilityGap",
    compositeRisk: "compositeRiskScore",
    composite_risk: "compositeRiskScore",
  };

  return map[indexType] || "compositeRiskScore";
};


export const getRiskLevel = (value: number): string => {
  // 5-tier system on 0-10 scale (DB stores indexes as 0-10)
  if (value >= 8) return "CRITICAL";
  if (value >= 6) return "HIGH";
  if (value >= 4) return "MODERATE";
  if (value >= 2) return "NORMAL";
  return "LOW";
};