"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProjectAccess = exports.requireSubscription = exports.optionalAuthenticate = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const types_1 = require("../types");
const database_1 = __importDefault(require("../config/database"));
// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            throw new types_1.AuthenticationError('Access token required');
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Verify user still exists and is active
        const user = await database_1.default.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                subscriptionTier: true,
                subscriptionEndDate: true
            }
        });
        if (!user) {
            throw new types_1.AuthenticationError('User not found');
        }
        // Check if subscription is still valid for paid tiers
        if (user.subscriptionTier !== 'free' && user.subscriptionEndDate) {
            const now = new Date();
            const subscriptionEnd = new Date(user.subscriptionEndDate);
            if (now > subscriptionEnd) {
                // Downgrade to free tier
                await database_1.default.user.update({
                    where: { id: user.id },
                    data: {
                        subscriptionTier: 'free',
                        subscriptionEndDate: null
                    }
                });
                user.subscriptionTier = 'free';
            }
        }
        req.user = {
            userId: user.id,
            email: user.email,
            subscriptionTier: user.subscriptionTier
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: error instanceof Error ? error.message : 'Authentication failed'
            }
        });
    }
};
exports.authenticateToken = authenticateToken;
// Optional authentication middleware (for endpoints that work with or without auth)
const optionalAuthenticate = async (req, res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        if (token) {
            const payload = (0, jwt_1.verifyAccessToken)(token);
            const user = await database_1.default.user.findUnique({
                where: { id: payload.userId },
                select: {
                    id: true,
                    email: true,
                    subscriptionTier: true
                }
            });
            if (user) {
                req.user = {
                    userId: user.id,
                    email: user.email,
                    subscriptionTier: user.subscriptionTier
                };
            }
        }
        next();
    }
    catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
// Subscription tier authorization middleware
const requireSubscription = (requiredTier) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    type: 'AUTHENTICATION_ERROR',
                    message: 'Authentication required'
                }
            });
        }
        const tierHierarchy = { free: 0, pro: 1, enterprise: 2 };
        const userTierLevel = tierHierarchy[req.user.subscriptionTier] || 0;
        const requiredTierLevel = tierHierarchy[requiredTier];
        if (userTierLevel < requiredTierLevel) {
            return res.status(403).json({
                success: false,
                error: {
                    type: 'SUBSCRIPTION_REQUIRED',
                    message: `${requiredTier} subscription required for this feature`,
                    details: {
                        currentTier: req.user.subscriptionTier,
                        requiredTier
                    }
                }
            });
        }
        next();
    };
};
exports.requireSubscription = requireSubscription;
// Project ownership/membership middleware
const requireProjectAccess = async (req, res, next) => {
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
        const projectId = req.params.projectId || req.params.id;
        if (!projectId) {
            return res.status(400).json({
                success: false,
                error: {
                    type: 'VALIDATION_ERROR',
                    message: 'Project ID required'
                }
            });
        }
        // Check if user owns the project or is a team member
        const project = await database_1.default.project.findFirst({
            where: {
                id: projectId,
                OR: [
                    { ownerId: req.user.userId },
                    {
                        teamMembers: {
                            some: {
                                userId: req.user.userId
                            }
                        }
                    }
                ]
            }
        });
        if (!project) {
            return res.status(403).json({
                success: false,
                error: {
                    type: 'ACCESS_DENIED',
                    message: 'Access denied to this project'
                }
            });
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                type: 'SERVER_ERROR',
                message: 'Error verifying project access'
            }
        });
    }
};
exports.requireProjectAccess = requireProjectAccess;
//# sourceMappingURL=auth.middleware.js.map