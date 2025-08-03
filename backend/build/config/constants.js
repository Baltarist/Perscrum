"use strict";
// Application Constants based on backend-rules-file.md
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAIL_CONFIG = exports.UPLOAD_LIMITS = exports.CORS_ORIGIN = exports.AI_LIMITS = exports.CACHE_TTL = exports.RATE_LIMITS = exports.JWT_CONFIG = exports.NODE_ENV = exports.PORT = void 0;
exports.PORT = process.env.PORT || 5000;
exports.NODE_ENV = process.env.NODE_ENV || 'development';
// JWT Configuration
exports.JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    expiresIn: process.env.JWT_EXPIRE_TIME || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE_TIME || '7d'
};
// Rate Limiting Configuration
exports.RATE_LIMITS = {
    global: { windowMs: 60000, max: 100 },
    auth: { windowMs: 60000, max: 5 },
    ai: {
        free: { windowMs: 86400000, max: 10 }, // 10/day
        pro: { windowMs: 86400000, max: 1000 }, // 1000/day
        enterprise: { windowMs: 86400000, max: -1 } // unlimited
    }
};
// Cache TTL Configuration
exports.CACHE_TTL = {
    userProfile: 15 * 60, // 15 minutes
    projectData: 10 * 60, // 10 minutes
    aiResponses: 60 * 60, // 1 hour
    analytics: 30 * 60, // 30 minutes
};
// AI Limits per Subscription Tier
exports.AI_LIMITS = {
    free: { daily: 10, monthly: 100 },
    pro: { daily: 1000, monthly: -1 }, // unlimited
    enterprise: { daily: -1, monthly: -1 }
};
// CORS Configuration
exports.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
// File Upload Limits
exports.UPLOAD_LIMITS = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
};
// Email Configuration
exports.EMAIL_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};
//# sourceMappingURL=constants.js.map