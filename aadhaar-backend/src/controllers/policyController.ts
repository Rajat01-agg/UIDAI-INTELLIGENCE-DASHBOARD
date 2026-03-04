import prisma from "../config/database.ts";
import type { Request, Response } from "express";

async function getPolicySuggestions(filters: any) {
    return prisma.predictiveIndicators.findMany({
        where: {
            riskSignal: filters.riskSignal
                ? { in: filters.riskSignal }
                : undefined,
            state: filters.state,
            district: filters.district,
        },
        orderBy: [
            { riskScore: "desc" },
            { predictionConfidence: "desc" },
        ],
        take: 20,
    });
}


export const policyController = async (req: Request, res: Response) => {
    const suggestions = await getPolicySuggestions(req.body);

    res.json({
        success: true,
        data: suggestions,
    });
}


async function getSolutionFrameworks(filters: any) {
    return prisma.solutionFrameworks.findMany({
        where: {
            frameworkType: filters.frameworkType
                ? { in: filters.frameworkType }
                : undefined,
            state: filters.state,
            district: filters.district,
        },
        orderBy: { frameworkConfidence: "desc" },
        take: 20,
    });
}


export const solutionFrameworkController = async (req: Request, res: Response) => {
    const frameworks = await getSolutionFrameworks(req.body);

    res.json({
        success: true,
        data: frameworks,
    });
}
