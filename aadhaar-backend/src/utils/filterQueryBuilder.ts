export const buildFilterQuery = (filters: any) => {
  const where: any = {};

  if (filters.state) {
    where.state = filters.state;
  }

  if (filters.district) {
    where.district = filters.district;
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
    // demand_pressure: "demandPressureIndex", // support for snake_case
    operationalStress: "operationalStressIndex",
    // operational_stress: "operationalStressIndex", // support for snake_case
    updateAccessibilityGap: "updateAccessibilityGap",
    compositeRisk: "compositeRiskScore"
  };

  return map[indexType] || "compositeRiskScore";
};


export const getRiskLevel = (value: number): string => {
  if (value > 0.75) return "CRITICAL";
  if (value > 0.6) return "HIGH";
  if (value > 0.4) return "MEDIUM";
  return "LOW";
};