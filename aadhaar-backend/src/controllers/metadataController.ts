import type { Request, Response } from "express";
import prisma from "../config/database.ts";

export const getDashboardFilters = async (
  req: Request,
  res: Response
) => {
  const filters = await fetchDashboardFilters();

  res.json({
    success: true,
    data: filters
  });

};

export const fetchDashboardFilters = async () => {
  // 1️⃣ States
  const states = await prisma.aggregatedAadhaarMetric.findMany({
    distinct: ["state"],
    select: { state: true },
    orderBy: { state: "asc" }
  });

  // 2️⃣ Districts (state-wise)
  const districts = await prisma.aggregatedAadhaarMetric.findMany({
    distinct: ["state", "district"],
    select: { state: true, district: true },
    orderBy: [{ state: "asc" }, { district: "asc" }]
  });

  // 3️⃣ Years
  const years = await prisma.aggregatedAadhaarMetric.findMany({
    distinct: ["year"],
    select: { year: true },
    orderBy: { year: "desc" }
  });

  // 4️⃣ Months
  const months = await prisma.aggregatedAadhaarMetric.findMany({
    distinct: ["month"],
    select: { month: true },
    orderBy: { month: "asc" }
  });

  return {
    states: states.map(s => s.state),

    districtsByState: districts.reduce((acc: any, curr) => {
      if (!acc[curr.state]) acc[curr.state] = [];
      acc[curr.state].push(curr.district);
      return acc;
    }, {}),

    years: years.map(y => y.year),
    months: months.map(m => m.month),

    metricTypes: ["enrolment", "biometric_update", "demographic_update"],
    ageGroups: ["age_0_5", "age_6_17", "age_18_plus"],
    indexTypes: [
      "demandPressureIndex",
      "operationalStressIndex",
      "updateAccessibilityGap",
      "compositeRiskScore"
    ]
  };
};

