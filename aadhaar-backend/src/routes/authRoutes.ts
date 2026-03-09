import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateJWT, indiaOnlyAccess, authRateLimiter, requireMinimumRole, apiRateLimiter } from '../middleware/auth.ts';
import { wrapAsync } from '../utils/wrapAsync.ts';
import prisma from '../config/database.ts';

const router = Router();

// POST /auth/register - Register with email and password
router.post(
    '/register',
    authRateLimiter,
    indiaOnlyAccess,
    wrapAsync(async (req, res) => {
        const { email, password, name, mobileNumber } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Check if mobile number already exists
        if (mobileNumber) {
            const existingMobile = await prisma.user.findUnique({ where: { mobileNumber } });
            if (existingMobile) {
                return res.status(409).json({ message: 'User with this mobile number already exists' });
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                mobileNumber: mobileNumber || null,
                password: hashedPassword,
                role: 'viewer',
            },
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken: token,
            expiresAt,
        });
    })
);


// POST /auth/login - Login with email and password
router.post(
    '/login',
    authRateLimiter,
    indiaOnlyAccess,
    wrapAsync(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken: token,
            expiresAt,
        });
    })
);

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
