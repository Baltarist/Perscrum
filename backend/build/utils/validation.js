"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDateRange = exports.paginationSchema = exports.uuidSchema = exports.paymentMethodSchema = exports.subscriptionUpgradeSchema = exports.aiEducationalContentSchema = exports.aiRetrospectiveSchema = exports.aiSubtaskSuggestionsSchema = exports.aiChatSchema = exports.aiTaskSuggestionsSchema = exports.addTeamMemberSchema = exports.updateSubtaskSchema = exports.createSubtaskSchema = exports.updateTaskSchema = exports.createTaskSchema = exports.completeSprintSchema = exports.updateSprintSchema = exports.createSprintSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.updateSettingsSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// User validation schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    displayName: zod_1.z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name too long')
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.updateProfileSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(2).max(50).optional(),
    email: zod_1.z.string().email().optional()
});
exports.updateSettingsSchema = zod_1.z.object({
    sprintDurationWeeks: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2)]).optional(),
    dailyCheckinEnabled: zod_1.z.boolean().optional(),
    dailyCheckinTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
    retrospectiveEnabled: zod_1.z.boolean().optional(),
    aiCoachName: zod_1.z.string().min(1).max(30).optional(),
    dailyFocusTaskId: zod_1.z.string().uuid().optional()
});
// Project validation schemas
exports.createProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
    description: zod_1.z.string().max(500, 'Description too long').optional(),
    colorTheme: zod_1.z.string().optional(),
    targetCompletionDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
    totalSprints: zod_1.z.number().int().min(1).max(50),
    sprintDurationWeeks: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2)]),
    teamMembers: zod_1.z.array(zod_1.z.object({
        userId: zod_1.z.string().uuid(),
        role: zod_1.z.enum(['leader', 'developer', 'member'])
    })).optional()
});
exports.updateProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100).optional(),
    description: zod_1.z.string().max(500).optional(),
    status: zod_1.z.enum(['active', 'paused', 'completed']).optional(),
    colorTheme: zod_1.z.string().optional(),
    targetCompletionDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
    totalSprints: zod_1.z.number().int().min(1).max(50).optional(),
    sprintDurationWeeks: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2)]).optional()
});
// Sprint validation schemas
exports.createSprintSchema = zod_1.z.object({
    goal: zod_1.z.string().max(200).optional(),
    startDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
    endDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date))).optional()
});
exports.updateSprintSchema = zod_1.z.object({
    goal: zod_1.z.string().max(200).optional(),
    status: zod_1.z.enum(['planning', 'active', 'completed']).optional(),
    startDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
    endDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
    velocityPoints: zod_1.z.number().int().min(0).optional()
});
exports.completeSprintSchema = zod_1.z.object({
    retrospective: zod_1.z.object({
        good: zod_1.z.string().min(10, 'Please provide more detail').max(1000),
        improve: zod_1.z.string().min(10, 'Please provide more detail').max(1000)
    })
});
// Task validation schemas
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title too long'),
    description: zod_1.z.string().max(1000, 'Description too long').optional(),
    storyPoints: zod_1.z.number().int().min(1).max(21).optional(),
    assigneeId: zod_1.z.string().uuid().optional(),
    plannedDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
    isAiAssisted: zod_1.z.boolean().optional()
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(150).optional(),
    description: zod_1.z.string().max(1000).optional(),
    status: zod_1.z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).optional(),
    storyPoints: zod_1.z.number().int().min(1).max(21).optional(),
    assigneeId: zod_1.z.string().uuid().optional(),
    plannedDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
    notes: zod_1.z.string().max(1000).optional()
});
exports.createSubtaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
    assigneeId: zod_1.z.string().uuid().optional(),
    isAiAssisted: zod_1.z.boolean().optional()
});
exports.updateSubtaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long').optional(),
    isCompleted: zod_1.z.boolean().optional(),
    assigneeId: zod_1.z.string().uuid().optional()
});
// Team management schemas
exports.addTeamMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    role: zod_1.z.enum(['member', 'admin']).optional()
});
// AI validation schemas
exports.aiTaskSuggestionsSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid(),
    sprintId: zod_1.z.string().uuid().optional(),
    context: zod_1.z.string().max(500).optional()
});
exports.aiChatSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
    projectId: zod_1.z.string().uuid(),
    sprintId: zod_1.z.string().uuid().optional()
});
exports.aiSubtaskSuggestionsSchema = zod_1.z.object({
    taskId: zod_1.z.string().uuid(),
    context: zod_1.z.string().max(500).optional()
});
exports.aiRetrospectiveSchema = zod_1.z.object({
    sprintId: zod_1.z.string().uuid()
});
exports.aiEducationalContentSchema = zod_1.z.object({
    topic: zod_1.z.string().min(3, 'Topic must be at least 3 characters').max(100, 'Topic too long'),
    level: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional()
});
// Subscription validation schemas
exports.subscriptionUpgradeSchema = zod_1.z.object({
    tier: zod_1.z.enum(['pro', 'enterprise']),
    billingCycle: zod_1.z.enum(['monthly', 'yearly']),
    paymentMethodId: zod_1.z.string().optional()
});
exports.paymentMethodSchema = zod_1.z.object({
    cardNumber: zod_1.z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
    expiryDate: zod_1.z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date (MM/YY)'),
    cvc: zod_1.z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
    cardHolder: zod_1.z.string().min(2, 'Cardholder name required').max(50, 'Cardholder name too long')
});
// Common validation helpers
exports.uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20)
});
// Date validation helpers
const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
};
exports.validateDateRange = validateDateRange;
//# sourceMappingURL=validation.js.map