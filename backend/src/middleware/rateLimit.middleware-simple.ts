import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Global rate limiter - 100 requests per minute (simplified)
export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        type: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: 60
      }
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

// Authentication rate limiter - 5 attempts per minute
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Increased for development
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        type: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: 60
      }
    });
  }
});

// File upload rate limiter - 10 uploads per minute
export const fileUploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        type: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        message: 'Too many uploads. Please try again later.',
        retryAfter: 60
      }
    });
  }
});

// AI endpoints rate limiter - simplified for development
export const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour for development
  max: 100, // Generous limit for development
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        type: 'AI_RATE_LIMIT_EXCEEDED',
        message: 'AI usage limit exceeded. Please try again later.',
        retryAfter: 60 * 60
      }
    });
  }
});