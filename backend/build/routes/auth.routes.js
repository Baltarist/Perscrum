"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
// POST /api/auth/register - Register new user
router.post('/register', rateLimit_middleware_1.authRateLimit, (0, validation_middleware_1.validate)(validation_1.registerSchema, 'body'), auth_controller_1.AuthController.register);
// POST /api/auth/login - Login user
router.post('/login', rateLimit_middleware_1.authRateLimit, (0, validation_middleware_1.validate)(validation_1.loginSchema, 'body'), auth_controller_1.AuthController.login);
// POST /api/auth/refresh - Refresh access token
router.post('/refresh', auth_controller_1.AuthController.refreshToken);
// POST /api/auth/logout - Logout user
router.post('/logout', auth_controller_1.AuthController.logout);
// GET /api/auth/me - Get current user profile
router.get('/me', auth_middleware_1.authenticateToken, auth_controller_1.AuthController.getCurrentUser);
// Future routes (not implemented yet)
// POST /api/auth/verify-email - Verify email address
router.post('/verify-email', auth_controller_1.AuthController.verifyEmail);
// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', auth_controller_1.AuthController.forgotPassword);
// POST /api/auth/reset-password - Reset password
router.post('/reset-password', auth_controller_1.AuthController.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map