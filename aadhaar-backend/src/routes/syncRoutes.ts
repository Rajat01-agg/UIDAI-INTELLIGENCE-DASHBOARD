// src/api/mlSync.routes.ts
import express from 'express';
import { triggerMLSync } from '../controllers/syncController.ts';
import { authenticateJWT, requireMinimumRole, indiaOnlyAccess, apiRateLimiter } from '../middleware/auth.ts';

const router = express.Router();

router.post(
  '/',
  apiRateLimiter,
  indiaOnlyAccess,
  authenticateJWT,
  requireMinimumRole("viewer"),
  triggerMLSync
);

export default router;
