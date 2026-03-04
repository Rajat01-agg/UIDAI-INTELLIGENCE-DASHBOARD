import prisma from "../config/database.ts";
import type { Request, Response } from "express";

async function globalSearch(query: string) {
    return {
        alerts: await prisma.alerts.findMany({
            where: {
                OR: [
                    { state: { contains: query, mode: "insensitive" } },
                    { district: { contains: query, mode: "insensitive" } },
                ],
            },
            take: 10,
        }),

        predictiveIndicators: await prisma.predictiveIndicators.findMany({
            where: {
                OR: [
                    { state: { contains: query, mode: "insensitive" } },
                    { district: { contains: query, mode: "insensitive" } },
                ],
            },
            take: 10,
        }),

        solutionFrameworks: await prisma.solutionFrameworks.findMany({
            where: {
                OR: [
                    { state: { contains: query, mode: "insensitive" } },
                    { district: { contains: query, mode: "insensitive" } },
                ],
            },
            take: 10,
        }),
    };
}



export const searchController = async (req: Request, res: Response) => {
    const q = req.query.q as string;

    if (!q || q.length < 2) {
        return res.json({ success: true, data: {} });
    }

    const results = await globalSearch(q);

    res.json({ success: true, data: results });
}
