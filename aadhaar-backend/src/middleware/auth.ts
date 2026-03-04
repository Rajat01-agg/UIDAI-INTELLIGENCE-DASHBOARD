import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import rateLimit from "express-rate-limit";
import axios from 'axios';
import { Redis } from 'ioredis';


export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};


export const allowedRoles =
    (allowedRoles: string[]) =>
        (req: Request, res: Response, next: NextFunction) => {
            const user = (req as any).user;

            if (!user || !user.role) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: "Access denied" });
            }

            next();
        };

const ROLE_HIERARCHY: Record<string, number> = {
    super_admin: 5,
    national_officer: 4,
    state_officer: 3,
    district_officer: 2,
    viewer: 1,
};


export const requireMinimumRole =
    (minimumRole: keyof typeof ROLE_HIERARCHY) =>
        (req: Request, res: Response, next: NextFunction) => {
            const user = (req as any).user;

            if (!user || !user.role) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            if (
                ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minimumRole]
            ) {
                return res.status(403).json({ message: "Access denied" });
            }

            next();
        };


// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true, // Don't crash if Redis is down initially
    retryStrategy: (times) => {
        // Retry with exponential backoff, max 2 seconds
        return Math.min(times * 50, 2000);
    }
});

redis.on('error', (err) => {
    // Suppress error logs to avoid console spam if Redis is intentionally offline
    // console.warn('Redis connection error:', err.message);
});

// Trigger connection logic non-blocking
redis.connect().catch(() => {
    // Initial connection failed, retry strategy will take over
});

const CACHE_EXPIRY = 3600; // 1 hour in seconds

// Get real client IP
const getClientIP = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];

    if (forwarded) {
        return (forwarded as string).split(',')[0].trim();
    }

    return req.headers['x-real-ip'] as string ||
        req.socket.remoteAddress ||
        req.ip ||
        '127.0.0.1';
};

// Get country from IP with Redis caching
const getCountryFromIP = async (ip: string): Promise<string> => {
    // Handle localhost/development
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.')) {
        return 'IN';
    }

    const cacheKey = `geo:${ip}`;
    let cached: string | null = null;

    // Check Redis cache only if connected
    if (redis.status === 'ready') {
        try {
            cached = await redis.get(cacheKey);
            if (cached) {
                console.log(`Cache hit for IP: ${ip} -> ${cached}`);
                return cached;
            }
        } catch (e) {
            // Redis get failed, proceed to API
        }
    }

    try {
        // Call ipapi.co for geolocation
        const response = await axios.get<string>(`https://ipapi.co/${ip}/country/`, {
            timeout: 5000,
            headers: { 'User-Agent': 'node-typescript-app' }
        });

        const country = response.data.trim();

        // Store in Redis with expiry
        if (redis.status === 'ready') {
            await redis.setex(cacheKey, CACHE_EXPIRY, country).catch(() => { });
        }

        console.log(`API call for IP: ${ip} -> ${country}`);
        return country;
    } catch (error) {
        console.error('Geolocation API error:', error);
        // Fail-safe: allow on error (change to throw if you want strict blocking)
        return 'IN';
    }
};

// Middleware to restrict access to India only
export const indiaOnlyAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const clientIP = getClientIP(req);
        console.log(`🌍 Login attempt from IP: ${clientIP}`);

        const country = await getCountryFromIP(clientIP);

        if (country === 'IN') {
            console.log(`✅ Access granted (India)`);
            return next();
        } else {
            console.log(`❌ Access denied (${country})`);
            res.status(403).json({
                success: false,
                message: 'Access denied. Login is only available from India.',
                detectedCountry: country
            });
            return;
        }
    } catch (error) {
        console.error('❌ Geo-restriction error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to verify location. Please try again.'
        });
        return;
    }
};


// 🔐 Auth routes (strict)
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // max 20 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many authentication attempts. Try again later.",
    },
});


// 📊 API routes (normal)
export const apiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120, // 120 req/min
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please slow down.",
    },
});
