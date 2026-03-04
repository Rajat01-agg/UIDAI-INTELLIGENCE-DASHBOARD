import prisma from "../config/database.ts";
import { AlertType, AlertSeverity } from "@prisma/client";
import type { AlertFilters } from "../types/alertFilters.ts";
import { buildAlertWhere } from "../utils/alertsQueryBuilder.ts";
import type { Request, Response } from "express";

async function fetchAlerts(filters: AlertFilters) {
    const where = buildAlertWhere(filters);

    return prisma.alerts.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50, // safety
    });
}

export const showAlerts = async (req: Request, res: Response) => {
    const filters = req.body; // frontend se aaya

    // Manual validation for alertType if provided
    if (filters.alertType) {
        const validTypes = Object.values(AlertType);
        if (!validTypes.includes(filters.alertType as AlertType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid alertType. Allowed: ${validTypes.join(", ")}`
            });
        }
    }

    const alerts = await fetchAlerts(filters);

    res.json({
        success: true,
        data: alerts,
    });
}


async function fetchAlertSummary(filters: AlertFilters) {
    const baseWhere = buildAlertWhere(filters);

    const [
        total,
        critical,
        high,
        medium,
        unread,
        anomalies,
        trends,
        patterns,
        accessibilityGap,
        operationalStress
    ] = await Promise.all([
        prisma.alerts.count({ where: baseWhere }),

        prisma.alerts.count({
            where: { ...baseWhere, severity: AlertSeverity.critical },
        }),

        prisma.alerts.count({
            where: { ...baseWhere, severity: AlertSeverity.high },
        }),

        prisma.alerts.count({
            where: { ...baseWhere, severity: AlertSeverity.medium },
        }),

        prisma.alerts.count({
            where: { ...baseWhere, isRead: false },
        }),

        prisma.alerts.count({
            where: { ...baseWhere, alertType: AlertType.anomaly },
        }),

        prisma.alerts.count({
            where: { ...baseWhere, alertType: AlertType.trend },
        }),

        prisma.alerts.count({
            where: { ...baseWhere, alertType: AlertType.pattern },
        }),

        prisma.alerts.count({
            where: { ...baseWhere, alertType: AlertType.accessibility_gap },
        }),

        prisma.alerts.count({
            where: { ...baseWhere, alertType: AlertType.operational_stress },
        }),
    ]);

    return {
        total,
        critical,
        high,
        medium,
        unread,
        anomalies,
        trends,
        patterns,
        accessibilityGap,
        operationalStress
    };
}

export const showAlertSummary = async (req: Request, res: Response) => {
    const filters = req.body;

    const summary = await fetchAlertSummary(filters);

    res.json({
        success: true,
        data: summary,
    });
}

async function markAlertAsRead(alertId: bigint) {
    return prisma.alerts.update({
        where: { id: alertId },
        data: { isRead: true },
    });
}

async function markAlertAsResolved(alertId: bigint) {
    return prisma.alerts.update({
        where: { id: alertId },
        data: {
            isResolved: true,
            resolvedAt: new Date(),
        },
    });
}


export const markAlertAsReadController = async (req: Request, res: Response) => {
    try {
        const id = BigInt(req.params.id as string);
        const alert = await markAlertAsRead(id);
        res.json({ success: true, data: alert });
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, message: "Alert not found" });
        } else {
            throw error;
        }
    }
}


export const markAlertAsResolvedController = async (req: Request, res: Response) => {
    try {
        const id = BigInt(req.params.id as string);
        const alert = await markAlertAsResolved(id);
        res.json({ success: true, data: alert });
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, message: "Alert not found" });
        } else {
            throw error;
        }
    }
}