import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { AuthenticationError } from '../types';
import prisma from '../config/database';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        subscriptionTier: string;
      };
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    const payload = verifyAccessToken(token);
    
    // Verify user still exists and is active
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

    // Check if subscription is still valid for paid tiers
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
        user.subscriptionTier = 'free';
      }
    }

    req.user = {
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        type: 'AUTHENTICATION_ERROR',
        message: error instanceof Error ? error.message : 'Authentication failed'
      }
    });
  }
};

// Optional authentication middleware (for endpoints that work with or without auth)
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          subscriptionTier: true
        }
      });

      if (user) {
        req.user = {
          userId: user.id,
          email: user.email,
          subscriptionTier: user.subscriptionTier
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Subscription tier authorization middleware
export const requireSubscription = (requiredTier: 'pro' | 'enterprise') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const tierHierarchy = { free: 0, pro: 1, enterprise: 2 };
    const userTierLevel = tierHierarchy[req.user.subscriptionTier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier];

    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        success: false,
        error: {
          type: 'SUBSCRIPTION_REQUIRED',
          message: `${requiredTier} subscription required for this feature`,
          details: {
            currentTier: req.user.subscriptionTier,
            requiredTier
          }
        }
      });
    }

    next();
  };
};

// Project ownership/membership middleware
export const requireProjectAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    const projectId = req.params.projectId || req.params.id;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Project ID required'
        }
      });
    }

    // Check if user owns the project or is a team member
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: req.user.userId },
          {
            teamMembers: {
              some: {
                userId: req.user.userId
              }
            }
          }
        ]
      }
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        error: {
          type: 'ACCESS_DENIED',
          message: 'Access denied to this project'
        }
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        type: 'SERVER_ERROR',
        message: 'Error verifying project access'
      }
    });
  }
};