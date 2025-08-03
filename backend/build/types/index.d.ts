import { Request } from 'express';
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
export interface CreateProjectRequest {
    title: string;
    description?: string;
    colorTheme?: string;
    targetCompletionDate: string;
    totalSprints: number;
    sprintDurationWeeks: 1 | 2;
    teamMembers?: {
        userId: string;
        role: 'leader' | 'developer' | 'member';
    }[];
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
export interface CreateNotificationRequest {
    userId: string;
    projectId?: string;
    type: 'task_assigned' | 'sprint_completed' | 'project_updated' | 'ai_suggestion';
    message: string;
}
export declare class ValidationError extends Error {
    field: string;
    constructor(message: string, field: string);
}
export declare class AuthenticationError extends Error {
    constructor(message?: string);
}
export declare class AuthorizationError extends Error {
    constructor(message?: string);
}
export declare class NotFoundError extends Error {
    constructor(resource?: string);
}
export declare class ConflictError extends Error {
    constructor(message?: string);
}
export declare class RateLimitError extends Error {
    constructor(message?: string);
}
export declare class CustomError extends Error {
    status: number;
    type: string;
    constructor(message: string, status?: number, type?: string);
}
export interface RequestWithUser extends Request {
    user?: {
        userId: string;
        id: string;
        email: string;
        subscriptionTier: string;
    };
}
export * from '../../generated/prisma';
//# sourceMappingURL=index.d.ts.map