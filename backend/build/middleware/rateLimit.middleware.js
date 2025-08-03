"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomRateLimit = exports.resetDailyAIUsage = exports.uploadRateLimit = exports.aiRateLimit = exports.authRateLimit = exports.globalRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const constants_1 = require("../config/constants");
const redis_1 = __importDefault(require("../config/redis"));
const database_1 = __importDefault(require("../config/database"));
// Global rate limiter
exports.globalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: constants_1.RATE_LIMITS.global.windowMs,
    max: constants_1.RATE_LIMITS.global.max,
    message: {
        success: false,
        error: {
            type: 'RATE_LIMIT_ERROR',
            message: 'Too many requests, please try again later'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health';
    }
});
// Authentication rate limiter
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: constants_1.RATE_LIMITS.auth.windowMs,
    max: constants_1.RATE_LIMITS.auth.max,
    message: {
        success: false,
        error: {
            type: 'RATE_LIMIT_ERROR',
            message: 'Too many authentication attempts, please try again later'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Rate limit by IP and email if provided
        const email = req.body?.email;
        return email ? `auth:${req.ip}:${email}` : `auth:${req.ip}`;
    }
});
// AI usage rate limiter with subscription-based limits
const aiRateLimit = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    type: 'AUTHENTICATION_ERROR',
                    message: 'Authentication required'
                }
            });
        }
        const userId = req.user.userId;
        const subscriptionTier = req.user.subscriptionTier;
        // Get subscription limits
        const limits = constants_1.RATE_LIMITS.ai[subscriptionTier];
        // No limits for enterprise
        if (limits.max === -1) {
            return next();
        }
        // Check daily usage from database
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { aiUsageCount: true }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    type: 'AUTHENTICATION_ERROR',
                    message: 'User not found'
                }
            });
        }
        // For simplicity, we're tracking daily usage in the user record
        // In production, you might want a separate table for daily usage tracking
        if (user.aiUsageCount >= limits.max) {
            return res.status(429).json({
                success: false,
                error: {
                    type: 'AI_RATE_LIMIT_ERROR',
                    message: `Daily AI usage limit reached (${limits.max} requests)`,
                    details: {
                        currentUsage: user.aiUsageCount,
                        limit: limits.max,
                        subscriptionTier,
                        resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
                    }
                }
            });
        }
        // Increment usage count
        await database_1.default.user.update({
            where: { id: userId },
            data: { aiUsageCount: { increment: 1 } }
        });
        next();
    }
    catch (error) {
        console.error('AI rate limiting error:', error);
        res.status(500).json({
            success: false,
            error: {
                type: 'SERVER_ERROR',
                message: 'Error checking AI usage limits'
            }
        });
    }
};
exports.aiRateLimit = aiRateLimit;
// File upload rate limiter
exports.uploadRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 uploads per minute per user
    message: {
        success: false,
        error: {
            type: 'RATE_LIMIT_ERROR',
            message: 'Too many file uploads, please try again later'
        }
    },
    keyGenerator: (req) => {
        return req.user?.userId || req.ip || 'unknown';
    }
});
// Reset AI usage count daily (can be called from a cron job)
const resetDailyAIUsage = async () => {
    try {
        await database_1.default.user.updateMany({
            data: { aiUsageCount: 0 }
        });
        console.log('Daily AI usage counts reset successfully');
    }
    catch (error) {
        console.error('Error resetting daily AI usage:', error);
    }
};
exports.resetDailyAIUsage = resetDailyAIUsage;
// Custom rate limiter using Redis for more advanced scenarios
const createCustomRateLimit = (windowMs, maxRequests, keyPrefix) => {
    return async (req, res, next) => {
        try {
            const key = `${keyPrefix}:${req.user?.userId || req.ip}`;
            const current = await redis_1.default.get(key);
            if (current && parseInt(current) >= maxRequests) {
                const ttl = await redis_1.default.ttl(key);
                return res.status(429).json({
                    success: false,
                    error: {
                        type: 'RATE_LIMIT_ERROR',
                        message: 'Rate limit exceeded',
                        details: {
                            resetTime: new Date(Date.now() + ttl * 1000).toISOString()
                        }
                    }
                });
            }
            // Increment counter
            if (current) {
                await redis_1.default.incr(key);
            }
            else {
                await redis_1.default.setex(key, Math.ceil(windowMs / 1000), '1');
            }
            next();
        }
        catch (error) {
            // If Redis is down, allow the request but log the error
            console.error('Rate limiting error:', error);
            next();
        }
    };
};
exports.createCustomRateLimit = createCustomRateLimit;
//# sourceMappingURL=rateLimit.middleware.js.map