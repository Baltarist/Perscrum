import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name too long')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional()
});

export const updateSettingsSchema = z.object({
  sprintDurationWeeks: z.union([z.literal(1), z.literal(2)]).optional(),
  dailyCheckinEnabled: z.boolean().optional(),
  dailyCheckinTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  retrospectiveEnabled: z.boolean().optional(),
  aiCoachName: z.string().min(1).max(30).optional(),
  dailyFocusTaskId: z.string().uuid().optional()
});

// Project validation schemas
export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  colorTheme: z.string().optional(),
  targetCompletionDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  totalSprints: z.number().int().min(1).max(50),
  sprintDurationWeeks: z.union([z.literal(1), z.literal(2)]),
  teamMembers: z.array(z.object({
    userId: z.string().uuid(),
    role: z.enum(['leader', 'developer', 'member'])
  })).optional()
});

export const updateProjectSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'paused', 'completed']).optional(),
  colorTheme: z.string().optional(),
  targetCompletionDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  totalSprints: z.number().int().min(1).max(50).optional(),
  sprintDurationWeeks: z.union([z.literal(1), z.literal(2)]).optional()
});

// Sprint validation schemas
export const createSprintSchema = z.object({
  goal: z.string().max(200).optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional()
});

export const updateSprintSchema = z.object({
  goal: z.string().max(200).optional(),
  status: z.enum(['planning', 'active', 'completed']).optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  velocityPoints: z.number().int().min(0).optional()
});

export const completeSprintSchema = z.object({
  retrospective: z.object({
    good: z.string().min(10, 'Please provide more detail').max(1000),
    improve: z.string().min(10, 'Please provide more detail').max(1000)
  })
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  storyPoints: z.number().int().min(1).max(21).optional(),
  assigneeId: z.string().uuid().optional(),
  plannedDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  isAiAssisted: z.boolean().optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).optional(),
  storyPoints: z.number().int().min(1).max(21).optional(),
  assigneeId: z.string().uuid().optional(),
  plannedDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  notes: z.string().max(1000).optional()
});

export const createSubtaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  assigneeId: z.string().uuid().optional(),
  isAiAssisted: z.boolean().optional()
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long').optional(),
  isCompleted: z.boolean().optional(),
  assigneeId: z.string().uuid().optional()
});

// Team management schemas
export const addTeamMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['member', 'admin']).optional()
});

// AI validation schemas
export const aiTaskSuggestionsSchema = z.object({
  projectId: z.string().uuid(),
  sprintId: z.string().uuid().optional(),
  context: z.string().max(500).optional()
});

export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  projectId: z.string().uuid(),
  sprintId: z.string().uuid().optional()
});

export const aiSubtaskSuggestionsSchema = z.object({
  taskId: z.string().uuid(),
  context: z.string().max(500).optional()
});

export const aiRetrospectiveSchema = z.object({
  sprintId: z.string().uuid()
});

export const aiEducationalContentSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters').max(100, 'Topic too long'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional()
});

// Subscription validation schemas
export const subscriptionUpgradeSchema = z.object({
  tier: z.enum(['pro', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']),
  paymentMethodId: z.string().optional()
});

export const paymentMethodSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date (MM/YY)'),
  cvc: z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
  cardHolder: z.string().min(2, 'Cardholder name required').max(50, 'Cardholder name too long')
});

// Common validation helpers
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// Date validation helpers
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};