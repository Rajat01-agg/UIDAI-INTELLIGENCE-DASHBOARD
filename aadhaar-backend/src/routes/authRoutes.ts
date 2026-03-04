import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { authenticateJWT, indiaOnlyAccess, authRateLimiter, requireMinimumRole, apiRateLimiter } from '../middleware/auth.ts';
import { wrapAsync } from '../utils/wrapAsync.ts';

const router = Router();

// Apply Rate Limiting & Geo-IP to OAuth entry points
router.get(
    '/google',
    authRateLimiter,
    indiaOnlyAccess,
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    authRateLimiter,
    indiaOnlyAccess,
    passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL || 'http://localhost:3001' }),
    wrapAsync((req, res) => {
        const user = req.user as any;
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        // Redirect to frontend with token and user info
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const userInfo = encodeURIComponent(JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }));
        res.redirect(`${frontendUrl}?token=${token}&user=${userInfo}`);
    }));


// GET /auth/me - Get logged-in user profile
router.get(
    '/me',
    apiRateLimiter,
    indiaOnlyAccess,
    authenticateJWT,
    requireMinimumRole("viewer"),
    wrapAsync(async (req, res) => {
        const user = req.user as { id: string; email: string; name?: string; role: string } | undefined;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        });
    }));


// POST /auth/logout - Stateless logout
router.post(
    '/logout',
    apiRateLimiter,
    indiaOnlyAccess,
    authenticateJWT,
    wrapAsync(async (req, res) => {
        res.json({ message: 'Logged out successfully' });
    }));


// GET /auth/status - Check authentication status
router.get(
    '/status',
    apiRateLimiter,
    indiaOnlyAccess,
    authenticateJWT,
    requireMinimumRole("viewer"),
    wrapAsync(async (req, res) => {
        const user = req.user as { id: string; email: string; role: string } | undefined;

        if (!user) {
            return res.status(401).json({ authenticated: false });
        }

        res.json({
            authenticated: true,
            role: user.role
        });
    }));

export default router;
