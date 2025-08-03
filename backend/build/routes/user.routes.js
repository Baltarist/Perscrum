"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(auth_middleware_1.authenticate);
// GET /api/users/profile - Get user profile
router.get('/profile', user_controller_1.UserController.getProfile);
// PUT /api/users/profile - Update user profile
router.put('/profile', (0, validation_middleware_1.validate)(validation_1.updateProfileSchema, 'body'), user_controller_1.UserController.updateProfile);
// GET /api/users/settings - Get user settings
router.get('/settings', user_controller_1.UserController.getSettings);
// PUT /api/users/settings - Update user settings
router.put('/settings', (0, validation_middleware_1.validate)(validation_1.updateSettingsSchema, 'body'), user_controller_1.UserController.updateSettings);
// POST /api/users/checkin - Daily check-in
router.post('/checkin', user_controller_1.UserController.dailyCheckin);
// GET /api/users/badges - Get user badges
router.get('/badges', user_controller_1.UserController.getBadges);
// GET /api/users/notifications - Get user notifications
router.get('/notifications', user_controller_1.UserController.getNotifications);
// PUT /api/users/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', (0, validation_middleware_1.validateUuid)('id'), user_controller_1.UserController.markNotificationAsRead);
// PUT /api/users/notifications/read-all - Mark all notifications as read
router.put('/notifications/read-all', user_controller_1.UserController.markAllNotificationsAsRead);
// PUT /api/users/password - Update password
router.put('/password', user_controller_1.UserController.updatePassword);
// GET /api/users/stats - Get user statistics
router.get('/stats', user_controller_1.UserController.getUserStats);
// DELETE /api/users/account - Delete user account
router.delete('/account', user_controller_1.UserController.deleteAccount);
exports.default = router;
//# sourceMappingURL=user.routes.js.map