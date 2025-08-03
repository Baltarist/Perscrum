import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  ConflictError,
  RateLimitError 
} from '../types';

// Error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.userId,
    timestamp: new Date().toISOString()
  });

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    return handlePrismaError(error, res);
  }

  // Handle custom application errors
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: error.message,
        field: error.field
      }
    });
  }

  if (error instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      error: {
        type: 'AUTHENTICATION_ERROR',
        message: error.message
      }
    });
  }

  if (error instanceof AuthorizationError) {
    return res.status(403).json({
      success: false,
      error: {
        type: 'AUTHORIZATION_ERROR',
        message: error.message
      }
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: {
        type: 'NOT_FOUND_ERROR',
        message: error.message
      }
    });
  }

  if (error instanceof ConflictError) {
    return res.status(409).json({
      success: false,
      error: {
        type: 'CONFLICT_ERROR',
        message: error.message
      }
    });
  }

  if (error instanceof RateLimitError) {
    return res.status(429).json({
      success: false,
      error: {
        type: 'RATE_LIMIT_ERROR',
        message: error.message
      }
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        type: 'AUTHENTICATION_ERROR',
        message: 'Invalid token'
      }
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        type: 'AUTHENTICATION_ERROR',
        message: 'Token expired'
      }
    });
  }

  // Handle unexpected errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    error: {
      type: 'SERVER_ERROR',
      message: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack })
    }
  });
};

// Handle Prisma-specific errors
const handlePrismaError = (error: PrismaClientKnownRequestError, res: Response) => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      return res.status(409).json({
        success: false,
        error: {
          type: 'CONFLICT_ERROR',
          message: `A record with this ${field ? field[0] : 'value'} already exists`,
          field: field ? field[0] : undefined
        }
      });

    case 'P2025':
      // Record not found
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND_ERROR',
          message: 'Record not found'
        }
      });

    case 'P2003':
      // Foreign key constraint violation
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Related record not found'
        }
      });

    case 'P2011':
      // Null constraint violation
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Required field is missing'
        }
      });

    default:
      return res.status(500).json({
        success: false,
        error: {
          type: 'DATABASE_ERROR',
          message: 'Database operation failed'
        }
      });
  }
};

// 404 handler for routes that don't exist
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      type: 'NOT_FOUND_ERROR',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
};

// Async error wrapper to catch promise rejections
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};