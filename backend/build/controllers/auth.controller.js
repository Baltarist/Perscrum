"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
// POST /api/auth/register
AuthController.register = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    const result = await auth_service_1.AuthService.register(req.body);
    res.status(201).json({
        success: true,
        data: {
            message: 'User registered successfully',
            user: result.user,
            tokens: result.tokens
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/auth/login
AuthController.login = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    console.log('🎯 AUTH CONTROLLER: Login request received');
    console.log('🎯 Request body:', { email: req.body.email, passwordLength: req.body.password?.length });
    const result = await auth_service_1.AuthService.login(req.body);
    console.log('🎯 AUTH CONTROLLER: AuthService.login returned successfully');
    console.log('🎯 Result user email:', result.user.email);
    const response = {
        success: true,
        data: {
            message: 'Login successful',
            user: result.user,
            tokens: result.tokens
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    };
    console.log('🎯 AUTH CONTROLLER: Sending response to frontend...');
    res.status(200).json(response);
    console.log('✅ AUTH CONTROLLER: Response sent successfully!');
});
// POST /api/auth/refresh
AuthController.refreshToken = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            error: {
                type: 'VALIDATION_ERROR',
                message: 'Refresh token is required',
                field: 'refreshToken'
            }
        });
    }
    const result = await auth_service_1.AuthService.refreshToken(refreshToken);
    res.status(200).json({
        success: true,
        data: {
            message: 'Token refreshed successfully',
            accessToken: result.accessToken,
            user: result.user
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/auth/logout
AuthController.logout = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    // For JWT-based auth, logout is primarily handled on the client side
    // In the future, we could maintain a blacklist of invalidated tokens
    res.status(200).json({
        success: true,
        data: {
            message: 'Logout successful'
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/auth/me - Get current user profile
AuthController.getCurrentUser = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const userProfile = await auth_service_1.AuthService.getUserProfile(req.user.userId);
    res.status(200).json({
        success: true,
        data: {
            user: userProfile
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/auth/verify-email (future feature)
AuthController.verifyEmail = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        success: false,
        error: {
            type: 'NOT_IMPLEMENTED',
            message: 'Email verification not implemented yet'
        }
    });
});
// POST /api/auth/forgot-password (future feature)
AuthController.forgotPassword = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        success: false,
        error: {
            type: 'NOT_IMPLEMENTED',
            message: 'Password reset not implemented yet'
        }
    });
});
// POST /api/auth/reset-password (future feature)
AuthController.resetPassword = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        success: false,
        error: {
            type: 'NOT_IMPLEMENTED',
            message: 'Password reset not implemented yet'
        }
    });
});
//# sourceMappingURL=auth.controller.js.map