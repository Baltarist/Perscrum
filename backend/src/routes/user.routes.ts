import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate, validateUuid } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { 
  updateProfileSchema,
  updateSettingsSchema 
} from '../utils/validation';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users/profile - Get user profile
router.get('/profile',
  UserController.getProfile
);

// PUT /api/users/profile - Update user profile
router.put('/profile',
  validate(updateProfileSchema, 'body'),
  UserController.updateProfile
);

// GET /api/users/settings - Get user settings
router.get('/settings',
  UserController.getSettings
);

// PUT /api/users/settings - Update user settings
router.put('/settings',
  validate(updateSettingsSchema, 'body'),
  UserController.updateSettings
);

// POST /api/users/checkin - Daily check-in
router.post('/checkin',
  UserController.dailyCheckin
);

// GET /api/users/badges - Get user badges
router.get('/badges',
  UserController.getBadges
);

// GET /api/users/notifications - Get user notifications
router.get('/notifications',
  UserController.getNotifications
);

// PUT /api/users/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read',
  validateUuid('id'),
  UserController.markNotificationAsRead
);

// PUT /api/users/notifications/read-all - Mark all notifications as read
router.put('/notifications/read-all',
  UserController.markAllNotificationsAsRead
);

// PUT /api/users/password - Update password
router.put('/password',
  UserController.updatePassword
);

// GET /api/users/stats - Get user statistics
router.get('/stats',
  UserController.getUserStats
);

// DELETE /api/users/account - Delete user account
router.delete('/account',
  UserController.deleteAccount
);

export default router;