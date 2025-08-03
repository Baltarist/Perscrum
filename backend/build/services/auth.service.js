"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const types_1 = require("../types");
class AuthService {
    // Register new user
    static async register(userData) {
        const { email, password, displayName } = userData;
        // Check if user already exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw new types_1.ConflictError('User with this email already exists');
        }
        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // Create user with default settings
        const user = await database_1.default.user.create({
            data: {
                email,
                passwordHash,
                displayName,
                subscriptionTier: 'free',
                settings: {
                    create: {
                        sprintDurationWeeks: 1,
                        dailyCheckinEnabled: true,
                        dailyCheckinTime: '09:00',
                        retrospectiveEnabled: true,
                        aiCoachName: 'Koç'
                    }
                }
            },
            include: {
                settings: true
            }
        });
        // Generate tokens
        const payload = {
            userId: user.id,
            email: user.email,
            subscriptionTier: user.subscriptionTier
        };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id });
        return {
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                subscriptionTier: user.subscriptionTier,
                aiUsageCount: user.aiUsageCount,
                subscriptionEndDate: user.subscriptionEndDate,
                settings: user.settings
            },
            tokens: {
                accessToken,
                refreshToken
            }
        };
    }
    // Login user
    static async login(loginData) {
        const { email, password } = loginData;
        // Debug logging
        console.log('🔍 Login attempt:', { email, passwordLength: password?.length });
        // Find user with settings
        const user = await database_1.default.user.findUnique({
            where: { email },
            include: { settings: true }
        });
        console.log('🔍 User found:', user ? 'YES' : 'NO');
        if (user) {
            console.log('🔍 User details:', {
                id: user.id,
                email: user.email,
                passwordHashLength: user.passwordHash?.length
            });
        }
        if (!user) {
            console.log('❌ User not found for email:', email);
            throw new types_1.AuthenticationError('Invalid email or password');
        }
        // Verify password
        console.log('🔍 Comparing passwords...');
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        console.log('🔍 Password valid:', isPasswordValid);
        if (!isPasswordValid) {
            console.log('❌ Password validation failed');
            throw new types_1.AuthenticationError('Invalid email or password');
        }
        console.log('✅ Password validation successful, proceeding with login...');
        // Check subscription validity
        console.log('🔍 Checking subscription...');
        let currentSubscriptionTier = user.subscriptionTier;
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
                currentSubscriptionTier = 'free';
                console.log('🔍 Subscription expired, downgraded to free');
            }
        }
        console.log('🔍 Current subscription tier:', currentSubscriptionTier);
        // Generate tokens
        console.log('🔍 Generating JWT tokens...');
        const payload = {
            userId: user.id,
            email: user.email,
            subscriptionTier: currentSubscriptionTier
        };
        try {
            const accessToken = (0, jwt_1.generateAccessToken)(payload);
            const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id });
            console.log('✅ JWT tokens generated successfully');
            console.log('🔍 Preparing response...');
            const response = {
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    subscriptionTier: currentSubscriptionTier,
                    aiUsageCount: user.aiUsageCount,
                    subscriptionEndDate: user.subscriptionEndDate?.toISOString() || null,
                    settings: user.settings || null
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            };
            console.log('✅ Login response ready, returning...');
            return response;
        }
        catch (error) {
            console.error('❌ JWT token generation failed:', error);
            throw error;
        }
    }
    // Refresh access token
    static async refreshToken(refreshToken) {
        try {
            // Verify refresh token
            const { verifyRefreshToken } = await Promise.resolve().then(() => __importStar(require('../utils/jwt')));
            const payload = verifyRefreshToken(refreshToken);
            // Find user
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
            // Check subscription validity
            let currentSubscriptionTier = user.subscriptionTier;
            if (user.subscriptionTier !== 'free' && user.subscriptionEndDate) {
                const now = new Date();
                const subscriptionEnd = new Date(user.subscriptionEndDate);
                if (now > subscriptionEnd) {
                    await database_1.default.user.update({
                        where: { id: user.id },
                        data: {
                            subscriptionTier: 'free',
                            subscriptionEndDate: null
                        }
                    });
                    currentSubscriptionTier = 'free';
                }
            }
            // Generate new access token
            const newPayload = {
                userId: user.id,
                email: user.email,
                subscriptionTier: currentSubscriptionTier
            };
            const accessToken = (0, jwt_1.generateAccessToken)(newPayload);
            return {
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    subscriptionTier: currentSubscriptionTier
                }
            };
        }
        catch (error) {
            throw new types_1.AuthenticationError('Invalid refresh token');
        }
    }
    // Get user profile
    static async getUserProfile(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            include: {
                settings: true,
                badges: {
                    include: {
                        badge: true
                    }
                },
                notifications: {
                    where: { isRead: false },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!user) {
            throw new types_1.NotFoundError('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            subscriptionTier: user.subscriptionTier,
            aiUsageCount: user.aiUsageCount,
            subscriptionEndDate: user.subscriptionEndDate,
            settings: user.settings,
            badges: user.badges.map(ub => ub.badge),
            unreadNotifications: user.notifications
        };
    }
    // Verify email (for future email verification feature)
    static async verifyEmail(token) {
        // Implementation for email verification
        // This would be used with email verification tokens
        throw new Error('Email verification not implemented yet');
    }
    // Password reset request (for future password reset feature)
    static async requestPasswordReset(email) {
        // Implementation for password reset
        // This would send password reset email
        throw new Error('Password reset not implemented yet');
    }
    // Reset password (for future password reset feature)
    static async resetPassword(token, newPassword) {
        // Implementation for password reset
        throw new Error('Password reset not implemented yet');
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map