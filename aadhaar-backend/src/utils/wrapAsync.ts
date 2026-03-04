import type { Request, Response, NextFunction } from "express";

export const wrapAsync = (fn: (req: Request, res: Response, next: NextFunction) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};






// ============================================
// USAGE WITH GOOGLE AUTH
// ============================================

/*
// routes/auth.ts
import express from 'express';
import { restrictToIndia } from '../middleware/geoRestriction';
import passport from 'passport';

const router = express.Router();

// Apply geo-restriction to Google OAuth callback
router.get('/auth/google',
  restrictToIndia,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  restrictToIndia,
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    // User authenticated and from India
    res.redirect('/dashboard');
  }
);

export default router;
*/


// ============================================
// ALTERNATIVE: Store IP info in Prisma
// ============================================

/*
// If you want to log all attempts in database:

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const logAndRestrict = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const clientIP = getClientIP(req);
  const country = await getCountryFromIP(clientIP);
  
  // Log attempt in database
  await prisma.loginAttempt.create({
    data: {
      ipAddress: clientIP,
      country: country,
      allowed: country === 'IN',
      timestamp: new Date()
    }
  });
  
  if (country !== 'IN') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Login is only available from India.'
    });
    return;
  }
  
  next();
};
*/