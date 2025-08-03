"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
class UserController {
}
exports.UserController = UserController;
_a = UserController;
// GET /api/users/profile - Get current user profile
UserController.getProfile = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const userProfile = await user_service_1.UserService.getUserProfile(req.user.userId);
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
// PUT /api/users/profile - Update user profile
UserController.updateProfile = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const updatedUser = await user_service_1.UserService.updateUserProfile(req.user.userId, req.body);
    res.status(200).json({
        success: true,
        data: {
            message: 'Profile updated successfully',
            user: updatedUser
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/users/settings - Get user settings
UserController.getSettings = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const userProfile = await user_service_1.UserService.getUserProfile(req.user.userId);
    res.status(200).json({
        success: true,
        data: {
            settings: userProfile.settings
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// PUT /api/users/settings - Update user settings
UserController.updateSettings = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const updatedSettings = await user_service_1.UserService.updateUserSettings(req.user.userId, req.body);
    res.status(200).json({
        success: true,
        data: {
            message: 'Settings updated successfully',
            settings: updatedSettings
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/users/checkin - Daily check-in
UserController.dailyCheckin = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const { mood, productivity, notes } = req.body;
    const result = await user_service_1.UserService.recordDailyCheckin(req.user.userId, { mood, productivity, notes });
    res.status(201).json({
        success: true,
        data: {
            message: 'Daily check-in recorded successfully',
            checkin: result.checkin,
            ...(result.earnedBadge && { earnedBadge: result.earnedBadge })
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/users/badges - Get user badges
UserController.getBadges = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const badges = await user_service_1.UserService.getUserBadges(req.user.userId);
    res.status(200).json({
        success: true,
        data: {
            badges
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/users/notifications - Get user notifications
UserController.getNotifications = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await user_service_1.UserService.getNotifications(req.user.userId, page, limit);
    res.status(200).json({
        success: true,
        data: {
            notifications: result.notifications
        },
        meta: {
            pagination: result.pagination,
            timestamp: new Date().toISOString()
        }
    });
});
// PUT /api/users/notifications/:id/read - Mark notification as read
UserController.markNotificationAsRead = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const { id } = req.params;
    const notification = await user_service_1.UserService.markNotificationAsRead(req.user.userId, id);
    res.status(200).json({
        success: true,
        data: {
            message: 'Notification marked as read',
            notification
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// PUT /api/users/notifications/read-all - Mark all notifications as read
UserController.markAllNotificationsAsRead = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const result = await user_service_1.UserService.markAllNotificationsAsRead(req.user.userId);
    res.status(200).json({
        success: true,
        data: {
            message: 'All notifications marked as read'
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// PUT /api/users/password - Update password
UserController.updatePassword = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            error: {
                type: 'VALIDATION_ERROR',
                message: 'Current password and new password are required'
            }
        });
    }
    const result = await user_service_1.UserService.updatePassword(req.user.userId, currentPassword, newPassword);
    res.status(200).json({
        success: true,
        data: result,
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/users/stats - Get user statistics
UserController.getUserStats = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const stats = await user_service_1.UserService.getUserStats(req.user.userId);
    res.status(200).json({
        success: true,
        data: {
            stats
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// DELETE /api/users/account - Delete user account
UserController.deleteAccount = (0, errorHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                type: 'AUTHENTICATION_ERROR',
                message: 'Authentication required'
            }
        });
    }
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({
            success: false,
            error: {
                type: 'VALIDATION_ERROR',
                message: 'Password is required to delete account',
                field: 'password'
            }
        });
    }
    await user_service_1.UserService.deleteAccount(req.user.userId);
    res.status(200).json({
        success: true,
        data: { message: 'Account deleted successfully' },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
//# sourceMappingURL=user.controller.js.map