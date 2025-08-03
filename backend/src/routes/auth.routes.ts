import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimit } from '../middleware/rateLimit.middleware';
import { 
  registerSchema, 
  loginSchema 
} from '../utils/validation';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', 
  authRateLimit,
  validate(registerSchema, 'body'),
  AuthController.register
);

// POST /api/auth/login - Login user
router.post('/login',
  authRateLimit,
  validate(loginSchema, 'body'),
  AuthController.login
);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh',
  AuthController.refreshToken
);

// POST /api/auth/logout - Logout user
router.post('/logout',
  AuthController.logout
);

// GET /api/auth/me - Get current user profile
router.get('/me',
  authenticate,
  AuthController.getCurrentUser
);

// Future routes (not implemented yet)
// POST /api/auth/verify-email - Verify email address
router.post('/verify-email',
  AuthController.verifyEmail
);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password',
  AuthController.forgotPassword
);

// POST /api/auth/reset-password - Reset password
router.post('/reset-password',
  AuthController.resetPassword
);

export default router;