import { Response } from 'express';
/**
 * AI Controller - Handles AI-powered endpoints
 * Provides task suggestions, chat functionality, and analytics
 */
export declare class AIController {
    /**
     * POST /api/ai/task-suggestions
     * Generate AI-powered task suggestions for a project or sprint
     */
    static generateTaskSuggestions: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * POST /api/ai/chat
     * Process AI chat messages for coaching and assistance
     */
    static processChat: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * POST /api/ai/subtask-suggestions
     * Generate AI-powered subtask suggestions for a specific task
     */
    static generateSubtaskSuggestions: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * POST /api/ai/sprint-analysis
     * Analyze sprint performance and provide retrospective insights
     */
    static analyzeSprintRetrospective: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * GET /api/ai/usage-stats
     * Get user's AI usage statistics and limits
     */
    static getUsageStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * GET /api/ai/health
     * Check AI service health and configuration
     */
    static healthCheck: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=ai.controller.d.ts.map