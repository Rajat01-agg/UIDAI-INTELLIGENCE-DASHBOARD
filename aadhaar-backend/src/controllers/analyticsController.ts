import type { Request, Response } from "express";
import prisma from "../config/database.ts";

import {
  buildFilterQuery,
  resolveIndexColumn,
} from "../utils/filterQueryBuilder.ts";

import { resolveChartPreset } from "../utils/chartPresetResolver.ts";

interface VisualRequest {
  chartType: "line" | "bar" | "pie" | "radar" | "polarArea";
  context: "trend" | "comparison" | "distribution" | "radar" | "breakdown";
  filters: any;
}

/**
 * Core visual data generator
 */
export const generateVisualData = async ({
  chartType,
  context,
  filters,
}: VisualRequest) => {
  const where = buildFilterQuery(filters);

  // ===============================
  // 🔵 CONTEXT: TREND
  // ===============================
  if (context === "trend") {
    const indexes: string[] = filters.indexes || [
      "demand_pressure",
      "operational_stress",
      "accessibility_gap",
      "composite_risk",
    ];

    // First try grouping by year/month for multi-month data
    const monthRows = await prisma.derivedMetrics.groupBy({
      by: ["year", "month"],
      where,
      _avg: indexes.reduce((acc: any, idx: string) => {
        acc[resolveIndexColumn(idx)] = true;
        return acc;
      }, {}),
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    // If only 1 month, pivot by metricCategory to show meaningful variation
    if (monthRows.length <= 1) {
      const catRows = await prisma.derivedMetrics.groupBy({
        by: ["metricCategory"],
        where,
        _avg: indexes.reduce((acc: any, idx: string) => {
          acc[resolveIndexColumn(idx)] = true;
          return acc;
        }, {}),
      });

      const categoryLabels: Record<string, string> = {
        enrolment: "Enrolment",
        biometric_update: "Biometric Update",
        demographic_update: "Demographic Update",
      };

      const labels = catRows.map(
        (r) => categoryLabels[r.metricCategory] || r.metricCategory
      );

      const datasets = indexes.map((idx: string) => {
        const col = resolveIndexColumn(idx);
        return {
          label: idx.replace(/_/g, " "),
          data: catRows.map((r) =>
            Number(((r._avg as any)[col] || 0).toFixed(4))
          ),
        };
      });

      return {
        labels,
        datasets,
        meta: {
          context: "trend",
          indexes,
          aggregation: "by service category (single-month data)",
          timeRange: monthRows.length === 1
            ? `${monthRows[0].month}/${monthRows[0].year}`
            : null,
        },
      };
    }

    // Multi-month: normal monthly trend
    const labels = monthRows.map((r) => `${r.month}/${r.year}`);

    const datasets = indexes.map((idx: string) => {
      const col = resolveIndexColumn(idx);
      return {
        label: idx.replace(/_/g, " "),
        data: monthRows.map((r) =>
          Number(((r._avg as any)[col] || 0).toFixed(4))
        ),
      };
    });

    return {
      labels,
      datasets,
      meta: {
        context: "trend",
        indexes,
        aggregation: "monthly average",
        timeRange:
          labels.length > 0
            ? `${labels[0]} → ${labels[labels.length - 1]}`
            : null,
      },
    };
  }

  // ===============================
  // 🔵 CONTEXT: DISTRIBUTION
  // ===============================
  if (context === "distribution") {
    const rows = await prisma.derivedMetrics.findMany({
      where,
      select: {
        compositeRiskScore: true,
      },
    });

    // 5-tier system on 0-10 scale (DB stores indexes as 0-10):
    // Low: < 2 | Normal: 2-4 | Moderate: 4-6 | High: 6-8 | Critical: >= 8
    let low = 0;
    let normal = 0;
    let moderate = 0;
    let high = 0;
    let critical = 0;

    rows.forEach((r) => {
      const score = r.compositeRiskScore;
      if (score >= 8) critical++;
      else if (score >= 6) high++;
      else if (score >= 4) moderate++;
      else if (score >= 2) normal++;
      else low++;
    });

    return {
      labels: ["Low", "Normal", "Moderate", "High", "Critical"],
      datasets: [
        {
          label: "Risk Distribution",
          data: [low, normal, moderate, high, critical],
        },
      ],
      meta: {
        context: "distribution",
        totalSamples: rows.length,
        thresholds: {
          low: "< 2 (0-20)",
          normal: "2 – 4 (20-40)",
          moderate: "4 – 6 (40-60)",
          high: "6 – 8 (60-80)",
          critical: ">= 8 (80-100)",
        },
      },
    };
  }

  // ===============================
  // 🔵 CONTEXT: COMPARISON (NEW)
  // ===============================
  if (context === "comparison") {
    const groupBy: "state" | "district" = filters.groupBy || "state";

    const rows = await prisma.derivedMetrics.groupBy({
      by: [groupBy],
      where,
      _avg: {
        compositeRiskScore: true,
      },
      orderBy: {
        _avg: {
          compositeRiskScore: "desc",
        },
      },
      take: filters.limit ? Number(filters.limit) : 10,
    });

    return {
      labels: rows.map((r) => r[groupBy]),
      datasets: [
        {
          label: "Composite Risk Score",
          data: rows.map((r) =>
            Number((r._avg.compositeRiskScore || 0).toFixed(3))
          ),
        },
      ],
      meta: {
        context: "comparison",
        comparedBy: groupBy,
        metric: "compositeRiskScore",
        topN: rows.length,
      },
    };
  }

  // ===============================
  // 🔵 CONTEXT: RADAR (Multi-Dimensional Index View)
  // ===============================
  if (context === "radar") {
    const allIndexes = [
      "demand_pressure",
      "operational_stress",
      "accessibility_gap",
      "composite_risk",
    ];

    const agg = await prisma.derivedMetrics.aggregate({
      where,
      _avg: {
        demandPressureIndex: true,
        operationalStressIndex: true,
        updateAccessibilityGap: true,
        compositeRiskScore: true,
      },
      _count: true,
    });

    const labels = [
      "Demand Pressure",
      "Operational Stress",
      "Accessibility Gap",
      "Composite Risk",
    ];

    // Return raw DB values — frontend normalizeIndex() handles 0-1 → 0-100 conversion
    const currentValues = [
      Number((agg._avg.demandPressureIndex || 0).toFixed(4)),
      Number((agg._avg.operationalStressIndex || 0).toFixed(4)),
      Number((agg._avg.updateAccessibilityGap || 0).toFixed(4)),
      Number((agg._avg.compositeRiskScore || 0).toFixed(4)),
    ];

    // Target/benchmark values (could be configurable later)
    const targetValues = [50, 40, 30, 45];

    return {
      labels,
      datasets: [
        {
          label: "Current Average",
          data: currentValues,
        },
        {
          label: "Target Benchmark",
          data: targetValues,
        },
      ],
      meta: {
        context: "radar",
        totalSamples: agg._count,
        aggregation: "overall average",
      },
    };
  }

  // ===============================
  // 🔵 CONTEXT: BREAKDOWN (by metric category)
  // ===============================
  if (context === "breakdown") {
    const rows = await prisma.derivedMetrics.groupBy({
      by: ["metricCategory"],
      where,
      _avg: {
        demandPressureIndex: true,
        operationalStressIndex: true,
        updateAccessibilityGap: true,
        compositeRiskScore: true,
      },
      _count: true,
    });

    const categoryLabels: Record<string, string> = {
      enrolment: "Enrolment",
      biometric_update: "Biometric Update",
      demographic_update: "Demographic Update",
    };

    const labels = rows.map((r) => categoryLabels[r.metricCategory] || r.metricCategory);
    // Return raw DB values — frontend normalizeIndex() handles scaling
    const riskValues = rows.map((r) =>
      Number((r._avg.compositeRiskScore || 0).toFixed(4))
    );
    const counts = rows.map((r) => r._count);

    return {
      labels: labels.length > 0 ? labels : ["No Data"],
      datasets: [
        {
          label: "Avg Composite Risk (%)",
          data: riskValues.length > 0 ? riskValues : [0],
        },
      ],
      meta: {
        context: "breakdown",
        groupedBy: "metricCategory",
        sampleCounts: counts,
      },
    };
  }

  // ===============================
  // ❌ UNSUPPORTED CONTEXT
  // ===============================
  throw new Error(`Unsupported context: ${context}`);
};

/**
 * API Controller
 */
export const getVisualAnalytics = async (req: Request, res: Response) => {
  const { chartType, context, filters } = req.body;

  if (!chartType || !context) {
    return res.status(400).json({
      success: false,
      message: "chartType and context are required",
    });
  }

  const chartData = await generateVisualData({
    chartType,
    context,
    filters,
  });

  const preset = resolveChartPreset(context);

  res.json({
    success: true,
    chartType,
    context,
    preset,
    data: chartData,
  });
};
