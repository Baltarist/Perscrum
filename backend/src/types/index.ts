import { Request } from 'express';

// API Response Types based on backend-rules-file.md

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    type: string;
    message: string;
    field?: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    timestamp: string;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  subscriptionTier: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number;
}

// User Types
export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface UpdateUserProfileRequest {
  displayName?: string;
  email?: string;
}

export interface UpdateUserSettingsRequest {
  sprintDurationWeeks?: 1 | 2;
  dailyCheckinEnabled?: boolean;
  dailyCheckinTime?: string;
  retrospectiveEnabled?: boolean;
  aiCoachName?: string;
  dailyFocusTaskId?: string;
}

// Project Types
export interface CreateProjectRequest {
  title: string;
  description?: string;
  colorTheme?: string;
  targetCompletionDate: string;
  totalSprints: number;
  sprintDurationWeeks: 1 | 2;
  teamMembers?: { userId: string; role: 'leader' | 'developer' | 'member' }[];
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: 'active' | 'paused' | 'completed';
  colorTheme?: string;
  targetCompletionDate?: string;
  totalSprints?: number;
  sprintDurationWeeks?: 1 | 2;
}

// Sprint Types
export interface CreateSprintRequest {
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSprintRequest {
  goal?: string;
  status?: 'planning' | 'active' | 'completed';
  startDate?: string;
  endDate?: string;
  velocityPoints?: number;
}

export interface CompleteSprintRequest {
  retrospective: {
    good: string;
    improve: string;
  };
}

// Task Types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  storyPoints?: number;
  assigneeId?: string;
  plannedDate?: string;
  isAiAssisted?: boolean;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  storyPoints?: number;
  assigneeId?: string;
  plannedDate?: string;
  notes?: string;
}

export interface CreateSubtaskRequest {
  title: string;
  assigneeId?: string;
  isAiAssisted?: boolean;
}

// AI Types
export interface AITaskSuggestionsRequest {
  projectId: string;
  sprintId?: string;
  context?: string;
}

export interface AIChatRequest {
  message: string;
  projectId: string;
  sprintId?: string;
}

export interface AISubtaskSuggestionsRequest {
  taskId: string;
  context?: string;
}

export interface AIRetrospectiveRequest {
  sprintId: string;
}

export interface AIEducationalContentRequest {
  topic: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

// Analytics Types
export interface VelocityDataPoint {
  sprint: string;
  completedPoints: number;
  plannedPoints: number;
}

export interface BurndownDataPoint {
  day: string;
  remaining: number;
  ideal: number;
}

// Subscription Types
export interface SubscriptionUpgradeRequest {
  tier: 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  paymentMethodId?: string;
}

export interface PaymentMethodRequest {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  cardHolder: string;
}

// Notification Types
export interface CreateNotificationRequest {
  userId: string;
  projectId?: string;
  type: 'task_assigned' | 'sprint_completed' | 'project_updated' | 'ai_suggestion';
  message: string;
}

// Error Types
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Custom Error class for service layer
export class CustomError extends Error {
  public status: number;
  public type: string;

  constructor(message: string, status: number = 500, type: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'CustomError';
    this.status = status;
    this.type = type;
  }
}

// Express Request with User Type
export interface RequestWithUser extends Request {
  user?: {
    userId: string;
    id: string;
    email: string;
    subscriptionTier: string;
  };
}

// Re-export Prisma generated types
export * from '../../generated/prisma';