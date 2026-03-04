import { Router } from "express";
import { authenticateJWT, requireMinimumRole, indiaOnlyAccess, apiRateLimiter } from "../middleware/auth.ts";
import { getDashboardOverview, getStatesSummary, getDistrictsSummaryByState } from "../controllers/dashboardController.ts";
import { wrapAsync } from "../utils/wrapAsync.ts";

const router = Router();

router.get(
  "/overview",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(getDashboardOverview)
);

router.get(
  "/states-summary",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(getStatesSummary)
);

router.get(
  "/states/:stateName/districts-summary",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(getDistrictsSummaryByState)
);


export default router;
