import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler.middleware';

export class AuthController {
  // POST /api/auth/register
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);

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
  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    res.status(200).json({
      success: true,
      data: {
        message: 'Login successful',
        user: result.user,
        tokens: result.tokens
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // POST /api/auth/refresh
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
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

    const result = await AuthService.refreshToken(refreshToken);

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
  static logout = asyncHandler(async (req: Request, res: Response) => {
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
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const userProfile = await AuthService.getUserProfile(req.user.userId);

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
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      error: {
        type: 'NOT_IMPLEMENTED',
        message: 'Email verification not implemented yet'
      }
    });
  });

  // POST /api/auth/forgot-password (future feature)
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      error: {
        type: 'NOT_IMPLEMENTED',
        message: 'Password reset not implemented yet'
      }
    });
  });

  // POST /api/auth/reset-password (future feature)
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      error: {
        type: 'NOT_IMPLEMENTED',
        message: 'Password reset not implemented yet'
      }
    });
  });
}