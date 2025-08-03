import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { 
  CreateUserRequest, 
  LoginRequest, 
  JWTPayload, 
  RefreshTokenPayload,
  AuthenticationError,
  ConflictError,
  NotFoundError 
} from '../types';

export class AuthService {
  // Register new user
  static async register(userData: CreateUserRequest) {
    const { email, password, displayName } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with default settings
    const user = await prisma.user.create({
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
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id });

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
  static async login(loginData: LoginRequest) {
    const { email, password } = loginData;

    // Find user with settings
    const user = await prisma.user.findUnique({
      where: { email },
      include: { settings: true }
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check subscription validity
    let currentSubscriptionTier = user.subscriptionTier;
    if (user.subscriptionTier !== 'free' && user.subscriptionEndDate) {
      const now = new Date();
      const subscriptionEnd = new Date(user.subscriptionEndDate);
      
      if (now > subscriptionEnd) {
        // Downgrade to free tier
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            subscriptionTier: 'free',
            subscriptionEndDate: null 
          }
        });
        currentSubscriptionTier = 'free';
      }
    }

    // Generate tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      subscriptionTier: currentSubscriptionTier
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        subscriptionTier: currentSubscriptionTier,
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

  // Refresh access token
  static async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const { verifyRefreshToken } = await import('../utils/jwt');
      const payload = verifyRefreshToken(refreshToken) as RefreshTokenPayload;

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          subscriptionTier: true,
          subscriptionEndDate: true
        }
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Check subscription validity
      let currentSubscriptionTier = user.subscriptionTier;
      if (user.subscriptionTier !== 'free' && user.subscriptionEndDate) {
        const now = new Date();
        const subscriptionEnd = new Date(user.subscriptionEndDate);
        
        if (now > subscriptionEnd) {
          await prisma.user.update({
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
      const newPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        subscriptionTier: currentSubscriptionTier
      };

      const accessToken = generateAccessToken(newPayload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          subscriptionTier: currentSubscriptionTier
        }
      };
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
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
      throw new NotFoundError('User not found');
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
  static async verifyEmail(token: string) {
    // Implementation for email verification
    // This would be used with email verification tokens
    throw new Error('Email verification not implemented yet');
  }

  // Password reset request (for future password reset feature)
  static async requestPasswordReset(email: string) {
    // Implementation for password reset
    // This would send password reset email
    throw new Error('Password reset not implemented yet');
  }

  // Reset password (for future password reset feature)
  static async resetPassword(token: string, newPassword: string) {
    // Implementation for password reset
    throw new Error('Password reset not implemented yet');
  }
}