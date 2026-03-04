import type { Request, Response } from "express";
import prisma from "../config/database.ts";

import {
  buildFilterQuery,
  resolveIndexColumn,
} from "../utils/filterQueryBuilder.ts";

import { resolveChartPreset } from "../utils/chartPresetResolver.ts";

interface VisualRequest {
  chartType: "line" | "bar" | "pie";
  context: "trend" | "comparison" | "distribution";
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
    ];

    const rows = await prisma.derivedMetrics.groupBy({
      by: ["year", "month"],
      where,
      _avg: indexes.reduce((acc: any, idx: string) => {
        acc[resolveIndexColumn(idx)] = true;
        return acc;
      }, {}),
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    const labels = rows.map((r) => `${r.month}/${r.year}`);

    const datasets = indexes.map((idx: string) => {
      const col = resolveIndexColumn(idx);
      return {
        label: idx.replace(/_/g, " "),
        data: rows.map((r) =>
          Number(((r._avg as any)[col] || 0).toFixed(3))
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

    let normal = 0;
    let watch = 0;
    let critical = 0;

    rows.forEach((r) => {
      if (r.compositeRiskScore >= 0.75) critical++;
      else if (r.compositeRiskScore >= 0.5) watch++;
      else normal++;
    });

    return {
      labels: ["Normal", "Watch", "Critical"],
      datasets: [
        {
          label: "Risk Distribution",
          data: [normal, watch, critical],
        },
      ],
      meta: {
        context: "distribution",
        totalSamples: rows.length,
        thresholds: {
          normal: "< 0.5",
          watch: "0.5 – 0.75",
          critical: ">= 0.75",
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
