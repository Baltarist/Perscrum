import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { RATE_LIMITS } from '../config/constants';
import redisClient from '../config/redis';
import prisma from '../config/database';

// Global rate limiter
export const globalRateLimit = rateLimit({
  windowMs: RATE_LIMITS.global.windowMs,
  max: RATE_LIMITS.global.max,
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
export const authRateLimit = rateLimit({
  windowMs: RATE_LIMITS.auth.windowMs,
  max: RATE_LIMITS.auth.max,
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
export const aiRateLimit = async (req: Request, res: Response, next: Function) => {
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
    const subscriptionTier = req.user.subscriptionTier as 'free' | 'pro' | 'enterprise';
    
    // Get subscription limits
    const limits = RATE_LIMITS.ai[subscriptionTier];
    
    // No limits for enterprise
    if (limits.max === -1) {
      return next();
    }

    // Check daily usage from database
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const user = await prisma.user.findUnique({
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
    await prisma.user.update({
      where: { id: userId },
      data: { aiUsageCount: { increment: 1 } }
    });

    next();
  } catch (error) {
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

// File upload rate limiter
export const uploadRateLimit = rateLimit({
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
export const resetDailyAIUsage = async () => {
  try {
    await prisma.user.updateMany({
      data: { aiUsageCount: 0 }
    });
    console.log('Daily AI usage counts reset successfully');
  } catch (error) {
    console.error('Error resetting daily AI usage:', error);
  }
};

// Custom rate limiter using Redis for more advanced scenarios
export const createCustomRateLimit = (
  windowMs: number,
  maxRequests: number,
  keyPrefix: string
) => {
  return async (req: Request, res: Response, next: Function) => {
    try {
      const key = `${keyPrefix}:${req.user?.userId || req.ip}`;
      const current = await redisClient.get(key);
      
      if (current && parseInt(current) >= maxRequests) {
        const ttl = await redisClient.ttl(key);
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
        await redisClient.incr(key);
      } else {
        await redisClient.setex(key, Math.ceil(windowMs / 1000), '1');
      }

      next();
    } catch (error) {
      // If Redis is down, allow the request but log the error
      console.error('Rate limiting error:', error);
      next();
    }
  };
};