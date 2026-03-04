import { Router } from "express";
import { authenticateJWT, requireMinimumRole, indiaOnlyAccess, apiRateLimiter } from "../middleware/auth.ts";
import { wrapAsync } from "../utils/wrapAsync.ts";
import { getVisualAnalytics } from "../controllers/analyticsController.ts";

const router = Router();

/**
 * POST /analytics/visuals
 * Generate chart-ready data based on filters
 */
router.post(
  "/visuals",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(getVisualAnalytics)
);

export default router;