"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const library_1 = require("@prisma/client/runtime/library");
const types_1 = require("../types");
// Error handler middleware
const errorHandler = (error, req, res, next) => {
    // Log error details
    console.error('Error occurred:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        userId: req.user?.userId,
        timestamp: new Date().toISOString()
    });
    // Handle Prisma errors
    if (error instanceof library_1.PrismaClientKnownRequestError) {
        return handlePrismaError(error, res);
    }
    // Handle custom application errors
    if (error instanceof types_1.ValidationError) {
        return res.status(400).json({
            success: false,
            error: {
                type: 'VALIDATION_ERROR',
                message: error.message,
                field: error.field
            }
        });
    }
    if (error instanceof types_1.AuthenticationError) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: error.message
            }
        });
    }
    if (error instanceof types_1.AuthorizationError) {
        return res.status(403).json({
            success: false,
            error: {
                type: 'AUTHORIZATION_ERROR',
                message: error.message
            }
        });
    }
    if (error instanceof types_1.NotFoundError) {
        return res.status(404).json({
            success: false,
            error: {
                type: 'NOT_FOUND_ERROR',
                message: error.message
            }
        });
    }
    if (error instanceof types_1.ConflictError) {
        return res.status(409).json({
            success: false,
            error: {
                type: 'CONFLICT_ERROR',
                message: error.message
            }
        });
    }
    if (error instanceof types_1.RateLimitError) {
        return res.status(429).json({
            success: false,
            error: {
                type: 'RATE_LIMIT_ERROR',
                message: error.message
            }
        });
    }
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Invalid token'
            }
        });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Token expired'
            }
        });
    }
    // Handle unexpected errors
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        error: {
            type: 'SERVER_ERROR',
            message: isDevelopment ? error.message : 'Internal server error',
            ...(isDevelopment && { stack: error.stack })
        }
    });
};
exports.errorHandler = errorHandler;
// Handle Prisma-specific errors
const handlePrismaError = (error, res) => {
    switch (error.code) {
        case 'P2002':
            // Unique constraint violation
            const field = error.meta?.target;
            return res.status(409).json({
                success: false,
                error: {
                    type: 'CONFLICT_ERROR',
                    message: `A record with this ${field ? field[0] : 'value'} already exists`,
                    field: field ? field[0] : undefined
                }
            });
        case 'P2025':
            // Record not found
            return res.status(404).json({
                success: false,
                error: {
                    type: 'NOT_FOUND_ERROR',
                    message: 'Record not found'
                }
            });
        case 'P2003':
            // Foreign key constraint violation
            return res.status(400).json({
                success: false,
                error: {
                    type: 'VALIDATION_ERROR',
                    message: 'Related record not found'
                }
            });
        case 'P2011':
            // Null constraint violation
            return res.status(400).json({
                success: false,
                error: {
                    type: 'VALIDATION_ERROR',
                    message: 'Required field is missing'
                }
            });
        default:
            return res.status(500).json({
                success: false,
                error: {
                    type: 'DATABASE_ERROR',
                    message: 'Database operation failed'
                }
            });
    }
};
// 404 handler for routes that don't exist
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            type: 'NOT_FOUND_ERROR',
            message: `Route ${req.method} ${req.path} not found`
        }
    });
};
exports.notFoundHandler = notFoundHandler;
// Async error wrapper to catch promise rejections
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.middleware.js.map