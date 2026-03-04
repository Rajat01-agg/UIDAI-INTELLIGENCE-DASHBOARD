import { Router } from "express";
import { reportController } from "../controllers/reportController.ts";
import { authenticateJWT, requireMinimumRole, indiaOnlyAccess, apiRateLimiter } from "../middleware/auth.ts";
import { wrapAsync } from "../utils/wrapAsync.ts";

const router = Router();

/**
 * @route   POST /api/reports/generate
 * @desc    Generate new Aadhaar intelligence report
 * @access  Protected (requires authentication)
 * @body    { year, month, state, district, metricCategory?, createdBy }
 */

router.post(
  "/generate",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(reportController.generateReport.bind(reportController))
);

/**
 * @route   GET /api/reports/stats
 * @desc    Get report statistics (total, completed, findings breakdown)
 * @access  Protected
 * @query   year?, state?
 */
router.get(
  "/stats",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(reportController.getStatistics.bind(reportController))
);

/**
 * @route   GET /api/reports
 * @desc    List reports with filters and pagination
 * @access  Protected
 * @query   year?, month?, state?, district?, metricCategory?, status?, page?, limit?
 */
router.get(
  "/",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(reportController.listReports.bind(reportController))
);

/**
 * @route   GET /api/reports/:id/download
 * @desc    Download report PDF file
 * @access  Protected
 * @param   id - Report UUID
 */
router.get(
  "/:id/download",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(reportController.downloadReport.bind(reportController))
);

/**
 * @route   GET /api/reports/:id
 * @desc    Get report by ID with all findings
 * @access  Protected
 * @param   id - Report UUID
 */
router.get(
  "/:id",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(reportController.getReport.bind(reportController))
);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete report and associated PDF file
 * @access  Protected (Admin only)
 * @param   id - Report UUID
 */
router.delete(
  "/:id",
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  wrapAsync(reportController.deleteReport.bind(reportController))
);

export default router;