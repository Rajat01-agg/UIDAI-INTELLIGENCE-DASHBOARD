import type { Request, Response } from "express";
import prisma from "../config/database.ts";

export const getDashboardOverview = async (
    req: Request,
    res: Response
) => {
    const data = await fetchDashboardOverview();

    res.json({
        success: true,
        data
    });
};


export const fetchDashboardOverview = async () => {

    // 1️⃣ Total Aadhaar activity (India-wide)
    const totalActivity = await prisma.aggregatedAadhaarMetric.aggregate({
        _sum: { totalCount: true }
    });

    // 2️⃣ Average indexes (India-level health)
    const avgIndexes = await prisma.derivedMetrics.aggregate({
        _avg: {
            demandPressureIndex: true,
            operationalStressIndex: true,
            compositeRiskScore: true
        }
    });

    // 3️⃣ High-risk districts count (distinct state+district pairs, not rows)
    const highRiskRows = await prisma.derivedMetrics.groupBy({
        by: ["state", "district"],
        _avg: { compositeRiskScore: true }
    });
    const highRiskDistricts = highRiskRows.filter(
        r => (r._avg.compositeRiskScore || 0) > 0.75
    ).length;

    return {
        totalTransactions: totalActivity._sum.totalCount || 0,

        averageIndexes: {
            demandPressure: avgIndexes._avg.demandPressureIndex || 0,
            operationalStress: avgIndexes._avg.operationalStressIndex || 0,
            compositeRisk: avgIndexes._avg.compositeRiskScore || 0
        },

        highRiskDistrictCount: highRiskDistricts,

        lastUpdated: new Date().toISOString()
    };
};


export const getStatesSummary = async (req: Request, res: Response) => {
    const data = await fetchStatesSummary();
    res.json({ success: true, data });
};

export const getDistrictsSummaryByState = async (
    req: Request,
    res: Response
) => {
    const { stateName } = req.params as { stateName: string };
    const data = await fetchDistrictsSummary(stateName);
    res.json({ success: true, state: stateName, data });
};


/* ---------- Helpers ---------- */
const getStatusFromRisk = (risk: number) => {
    if (risk > 0.75) return "CRITICAL";
    if (risk > 0.5) return "WATCH";
    return "NORMAL";
};

/* ---------- STATE SUMMARY ---------- */
export const fetchStatesSummary = async () => {

    const stateAgg = await prisma.derivedMetrics.groupBy({
        by: ["state"],
        _avg: {
            compositeRiskScore: true,
            demandPressureIndex: true,
            operationalStressIndex: true
        }
    });

    // Count distinct districts per state
    const districtCounts = await prisma.derivedMetrics.groupBy({
        by: ["state", "district"],
        _avg: { compositeRiskScore: true }
    });

    // Build maps: state → total district count & high-risk district count
    const districtCountMap: Record<string, number> = {};
    const highRiskMap: Record<string, number> = {};
    for (const row of districtCounts) {
        const st = row.state;
        districtCountMap[st] = (districtCountMap[st] || 0) + 1;
        const risk = row._avg.compositeRiskScore || 0;
        if (risk > 0.75) {
            highRiskMap[st] = (highRiskMap[st] || 0) + 1;
        }
    }

    // OPTIONAL anomaly check (safe fallback)
    const anomalyStates = new Set(
        (
            await prisma.anomalyResults.findMany({
                select: { state: true },
                distinct: ["state"]
            })
        ).map(a => a.state)
    );

    return stateAgg.map(s => {
        const risk = s._avg.compositeRiskScore || 0;

        return {
            state: s.state,
            status: getStatusFromRisk(risk),
            compositeRisk: Number(risk.toFixed(2)),
            demandPressure: Number((s._avg.demandPressureIndex || 0).toFixed(2)),
            operationalStress: Number((s._avg.operationalStressIndex || 0).toFixed(2)),
            trend: "STABLE",               // Phase-1 simple
            hasAnomaly: anomalyStates.has(s.state),
            districtCount: districtCountMap[s.state] || 0,
            highRiskDistricts: highRiskMap[s.state] || 0
        };
    });
};

/* ---------- DISTRICT SUMMARY (DRILL-DOWN) ---------- */
export const fetchDistrictsSummary = async (stateName: string) => {

    const districtAgg = await prisma.derivedMetrics.groupBy({
        by: ["district"],
        where: { state: stateName },
        _avg: {
            compositeRiskScore: true,
            demandPressureIndex: true,
            operationalStressIndex: true,
            updateAccessibilityGap: true
        }
    });

    const anomalyDistricts = new Set(
        (
            await prisma.anomalyResults.findMany({
                where: { state: stateName },
                select: { district: true },
                distinct: ["district"]
            })
        ).map(a => a.district)
    );

    return districtAgg.map(d => {
        const risk = d._avg.compositeRiskScore || 0;

        const signals: string[] = [];
        if (anomalyDistricts.has(d.district)) signals.push("ANOMALY");
        if (risk > 0.6) signals.push("RISING_TREND");

        return {
            district: d.district,
            status: getStatusFromRisk(risk),
            compositeRisk: Number(risk.toFixed(2)),
            demandPressure: Number((d._avg.demandPressureIndex || 0).toFixed(2)),
            operationalStress: Number((d._avg.operationalStressIndex || 0).toFixed(2)),
            accessibilityGap: Number((d._avg.updateAccessibilityGap || 0).toFixed(2)),
            signals
        };
    });
};
