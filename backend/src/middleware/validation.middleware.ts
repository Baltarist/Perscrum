import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../types';

// Generic validation middleware factory
export const validate = (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[source];
      const validatedData = schema.parse(dataToValidate);
      
      // Replace the original data with validated data
      req[source] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: validationErrors
          }
        });
      }

      // Handle other validation errors
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

      // Unexpected error
      res.status(500).json({
        success: false,
        error: {
          type: 'SERVER_ERROR',
          message: 'Validation error occurred'
        }
      });
    }
  };
};

// Validate UUID parameters
export const validateUuid = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    
    if (!value) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: `${paramName} is required`,
          field: paramName
        }
      });
    }

    // UUID v4 regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(value)) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: `Invalid ${paramName} format`,
          field: paramName
        }
      });
    }

    next();
  };
};

// Validate pagination query parameters
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const { page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Page must be a positive integer',
        field: 'page'
      }
    });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Limit must be between 1 and 100',
        field: 'limit'
      }
    });
  }

  // Add validated pagination to request
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };

  next();
};

// Validate date range
export const validateDateRange = (startField: string, endField: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startDate = req.body[startField];
    const endDate = req.body[endField];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: `${startField} must be before ${endField}`,
            field: startField
          }
        });
      }
    }

    next();
  };
};

// Extend Express Request to include pagination
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
    }
  }
}