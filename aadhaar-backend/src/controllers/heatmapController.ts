import type { Request, Response } from "express";
import prisma from "../config/database.ts";
import { buildFilterQuery, resolveIndexColumn, getRiskLevel } from "../utils/filterQueryBuilder.ts";

export const fetchHeatmapData = async (filters: any) => {
    const where: any = buildFilterQuery(filters);

    // 🔹 STEP 1: Latest snapshot default
    if (!filters.year || !filters.month) {
        const latest = await prisma.derivedMetrics.findFirst({
            orderBy: [{ year: "desc" }, { month: "desc" }],
            select: { year: true, month: true }
        });

        if (latest) {
            where.year = latest.year;
            where.month = latest.month;
        }
    }

    // 🔹 STEP 2: Resolve index column
    const indexColumn = resolveIndexColumn(filters.indexType) as "demandPressureIndex" | "operationalStressIndex" | "updateAccessibilityGap" | "compositeRiskScore";

    // 🔹 STEP 3: Parallel queries to get metrics and related signals
    // We fetch anomalies, trends, and patterns matching the same filters (time, etc.)
    const [groupedMetrics, anomalies, trends, patterns] = await Promise.all([
        prisma.derivedMetrics.groupBy({
            by: ["state", "district"],
            where,
            _avg: {
                demandPressureIndex: true,
                operationalStressIndex: true,
                updateAccessibilityGap: true,
                compositeRiskScore: true
            }
        }),
        prisma.anomalyResults.findMany({
            where,
            select: {
                state: true,
                district: true,
                isAnomaly: true,
                anomalySeverity: true,
                anomalyScore: true
            }
        }),
        prisma.trendResults.findMany({
            where,
            select: {
                state: true,
                district: true,
                trendDirection: true
            }
        }),
        prisma.patternResults.findMany({
            where,
            select: {
                state: true,
                district: true,
                dominantPatternType: true
            }
        })
    ]);

    // 🔹 STEP 4: Build Maps for O(1) Lookup
    const anomalyMap = new Map<string, any>();
    anomalies.forEach(a => {
        if (a.isAnomaly) {
            anomalyMap.set(`${a.state}-${a.district}`, a);
        }
    });

    const trendMap = new Map<string, any>();
    trends.forEach(t => {
        trendMap.set(`${t.state}-${t.district}`, t);
    });

    const patternMap = new Map<string, any>();
    patterns.forEach(p => {
        patternMap.set(`${p.state}-${p.district}`, p);
    });

    // 🔹 STEP 5: Merge and Return
    return groupedMetrics.map(r => {
        const avg = r._avg;
        // Safe access using the resolved column
        const primaryValue = avg[indexColumn] || 0;
        const key = `${r.state}-${r.district}`;

        return {
            state: r.state,
            district: r.district,

            primaryValue,
            riskLevel: getRiskLevel(primaryValue),

            hover: {
                // Return all the calculated indexes for the hover tooltip
                demandPressure: avg.demandPressureIndex,
                operationalStress: avg.operationalStressIndex,
                accessibilityGap: avg.updateAccessibilityGap,
                compositeRisk: avg.compositeRiskScore,

                // Lookup extra signals
                anomaly: anomalyMap.get(key) || null,
                trend: trendMap.get(key)?.trendDirection || "stable",
                pattern: patternMap.get(key)?.dominantPatternType || "none"
            }
        };
    });
};

export const getHeatmapData = async (req: Request, res: Response) => {
    const filters = req.query;

    const data = await fetchHeatmapData(filters);

    res.json({
        success: true,
        count: data.length,
        data
    });
};
