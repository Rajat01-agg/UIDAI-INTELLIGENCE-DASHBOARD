import { Router } from "express";
import { authenticateJWT, requireMinimumRole, indiaOnlyAccess, apiRateLimiter } from "../middleware/auth.ts";
import { getDashboardFilters } from "../controllers/metadataController.ts";
import { wrapAsync } from "../utils/wrapAsync.ts";

const router = Router();

router.get(
  "/filters",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(getDashboardFilters)
);

export default router;
