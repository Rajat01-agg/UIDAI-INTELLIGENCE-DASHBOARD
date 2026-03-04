import { Router } from "express";
import { authenticateJWT, requireMinimumRole, indiaOnlyAccess, apiRateLimiter } from "../middleware/auth.ts";
import { getHeatmapData } from "../controllers/heatmapController.ts";
import { wrapAsync } from "../utils/wrapAsync.ts";

const router = Router();

router.get(
  "/",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(getHeatmapData)
);

export default router;