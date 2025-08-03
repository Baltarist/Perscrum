"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDateRange = exports.validatePagination = exports.validateUuid = exports.validate = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
// Generic validation middleware factory
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const dataToValidate = req[source];
            const validatedData = schema.parse(dataToValidate);
            // Replace the original data with validated data
            req[source] = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const validationErrors = error.issues.map((err) => ({
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
            if (error instanceof types_1.ValidationError) {
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
exports.validate = validate;
// Validate UUID parameters
const validateUuid = (paramName) => {
    return (req, res, next) => {
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
exports.validateUuid = validateUuid;
// Validate pagination query parameters
const validatePagination = (req, res, next) => {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
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
exports.validatePagination = validatePagination;
// Validate date range
const validateDateRange = (startField, endField) => {
    return (req, res, next) => {
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
exports.validateDateRange = validateDateRange;
//# sourceMappingURL=validation.middleware.js.map