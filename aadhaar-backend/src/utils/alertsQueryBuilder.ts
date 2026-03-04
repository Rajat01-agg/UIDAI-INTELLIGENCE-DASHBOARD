import { Prisma, AlertType, AlertSeverity } from "@prisma/client";
import type { AlertFilters } from "../types/alertFilters.ts";

export function buildAlertWhere(filters: AlertFilters): Prisma.AlertsWhereInput {
    return {
        alertType: filters.alertType
            ? { in: filters.alertType as AlertType[] }
            : undefined,

        severity: filters.severity
            ? { in: filters.severity as AlertSeverity[] }
            : undefined,

        state: filters.state,
        district: filters.district,

        isRead: filters.isRead,
        isResolved: filters.isResolved,
    };
}
