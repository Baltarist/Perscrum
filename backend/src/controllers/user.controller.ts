import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware/errorHandler.middleware';

export class UserController {
  // GET /api/users/profile - Get current user profile
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const userProfile = await UserService.getUserProfile(req.user.userId);

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
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const updatedUser = await UserService.updateProfile(req.user.userId, req.body);

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
  static getSettings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const userProfile = await UserService.getUserProfile(req.user.userId);

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
  static updateSettings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const updatedSettings = await UserService.updateSettings(req.user.userId, req.body);

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
  static dailyCheckin = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const { mood, notes } = req.body;
    const result = await UserService.recordDailyCheckin(req.user.userId, mood, notes);

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
  static getBadges = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const badges = await UserService.getUserBadges(req.user.userId);

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
  static getNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await UserService.getUserNotifications(req.user.userId, page, limit);

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
  static markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
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
    const notification = await UserService.markNotificationAsRead(req.user.userId, id);

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
  static markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const result = await UserService.markAllNotificationsAsRead(req.user.userId);

    res.status(200).json({
      success: true,
      data: {
        message: `${result.updatedCount} notifications marked as read`
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // PUT /api/users/password - Update password
  static updatePassword = asyncHandler(async (req: Request, res: Response) => {
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

    const result = await UserService.updatePassword(req.user.userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/users/stats - Get user statistics
  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const stats = await UserService.getUserStats(req.user.userId);

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
  static deleteAccount = asyncHandler(async (req: Request, res: Response) => {
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

    const result = await UserService.deleteAccount(req.user.userId, password);

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });
}