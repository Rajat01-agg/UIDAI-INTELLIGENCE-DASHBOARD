import { Router } from "express";
import { policyController, solutionFrameworkController } from "../controllers/policyController.ts";
import { authenticateJWT, requireMinimumRole, indiaOnlyAccess, apiRateLimiter } from "../middleware/auth.ts";
import { wrapAsync } from "../utils/wrapAsync.ts";

const router = Router();

router.post(
    "/suggestions",
    apiRateLimiter,
    indiaOnlyAccess,
    authenticateJWT,
    requireMinimumRole("viewer"),
    wrapAsync(policyController)
);

router.post(
    "/frameworks",
    apiRateLimiter,
    indiaOnlyAccess,
    authenticateJWT,
    requireMinimumRole("viewer"),
    wrapAsync(solutionFrameworkController)
);

export default router;
