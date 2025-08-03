import { AITaskSuggestionsRequest, AIChatRequest, AISubtaskSuggestionsRequest } from '../types';
/**
 * AI Service - Google Gemini Integration
 * Handles all AI-powered features including task suggestions, chat, and analytics
 */
export declare class AIService {
    private static ai;
    /**
     * Initialize Google Gemini AI client
     */
    static initialize(): void;
    /**
     * Check if user has exceeded their AI usage limits
     */
    private static checkUsageLimits;
    /**
     * Increment user's AI usage count
     */
    private static incrementUsage;
    /**
     * Generate AI-powered task suggestions for a project or sprint
     */
    static generateTaskSuggestions(userId: string, request: AITaskSuggestionsRequest): Promise<{
        suggestions: string[];
        context: string;
    }>;
    /**
     * AI Chat functionality - coaching and project assistance
     */
    static processChat(userId: string, request: AIChatRequest): Promise<{
        response: string;
        context: string;
    }>;
    /**
     * Generate subtask suggestions for a specific task
     */
    static generateSubtaskSuggestions(userId: string, request: AISubtaskSuggestionsRequest): Promise<{
        suggestions: string[];
        taskTitle: string;
    }>;
    /**
     * Analyze sprint for retrospective insights
     */
    static analyzeSprintRetrospective(userId: string, sprintId: string): Promise<{
        insights: string;
        recommendations: string[];
    }>;
    /**
     * Get user's current AI usage statistics
     */
    static getUsageStats(userId: string): Promise<{
        currentUsage: number;
        dailyLimit: number;
        monthlyLimit: number;
        subscriptionTier: import("generated/prisma").$Enums.SubscriptionTier;
        remainingToday: number;
    }>;
}
//# sourceMappingURL=ai.service.d.ts.map