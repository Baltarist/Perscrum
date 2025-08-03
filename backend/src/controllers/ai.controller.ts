import { Response } from 'express';
import { AIService } from '../services/ai.service';
import { RequestWithUser } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * AI Controller - Handles AI-powered endpoints
 * Provides task suggestions, chat functionality, and analytics
 */
export class AIController {
  
  /**
   * POST /api/ai/task-suggestions
   * Generate AI-powered task suggestions for a project or sprint
   */
  static generateTaskSuggestions = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;
    const { projectId, sprintId, context } = req.body;

    console.log('🎯 AIController.generateTaskSuggestions called');
    console.log('🎯 Request data:', { userId, projectId, sprintId, context });

    const result = await AIService.generateTaskSuggestions(userId, {
      projectId,
      sprintId, 
      context
    });

    res.json({
      success: true,
      data: {
        suggestions: result.suggestions,
        context: result.context,
        count: result.suggestions.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        aiGenerated: true
      }
    });
  });

  /**
   * POST /api/ai/chat
   * Process AI chat messages for coaching and assistance
   */
  static processChat = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;
    const { message, projectId, sprintId } = req.body;

    console.log('💬 AIController.processChat called');
    console.log('💬 Request data:', { userId, projectId, messageLength: message?.length });

    const result = await AIService.processChat(userId, {
      message,
      projectId,
      sprintId
    });

    res.json({
      success: true,
      data: {
        response: result.response,
        context: result.context,
        timestamp: new Date().toISOString()
      },
      meta: {
        timestamp: new Date().toISOString(),
        aiGenerated: true,
        coach: 'Koç'
      }
    });
  });

  /**
   * POST /api/ai/subtask-suggestions
   * Generate AI-powered subtask suggestions for a specific task
   */
  static generateSubtaskSuggestions = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;
    const { taskId } = req.body;

    console.log('🔍 AIController.generateSubtaskSuggestions called');
    console.log('🔍 Request data:', { userId, taskId });

    const result = await AIService.generateSubtaskSuggestions(userId, { taskId });

    res.json({
      success: true,
      data: {
        suggestions: result.suggestions,
        taskTitle: result.taskTitle,
        count: result.suggestions.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        aiGenerated: true
      }
    });
  });

  /**
   * POST /api/ai/sprint-analysis
   * Analyze sprint performance and provide retrospective insights
   */
  static analyzeSprintRetrospective = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;
    const { sprintId } = req.body;

    console.log('📊 AIController.analyzeSprintRetrospective called');
    console.log('📊 Request data:', { userId, sprintId });

    const result = await AIService.analyzeSprintRetrospective(userId, sprintId);

    res.json({
      success: true,
      data: {
        insights: result.insights,
        recommendations: result.recommendations,
        recommendationCount: result.recommendations.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        aiGenerated: true,
        analysisType: 'sprint_retrospective'
      }
    });
  });

  /**
   * GET /api/ai/usage-stats
   * Get user's AI usage statistics and limits
   */
  static getUsageStats = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;

    console.log('📈 AIController.getUsageStats called');
    console.log('📈 Request data:', { userId });

    const stats = await AIService.getUsageStats(userId);

    res.json({
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  /**
   * GET /api/ai/health
   * Check AI service health and configuration
   */
  static healthCheck = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const aiEnabled = process.env.AI_ENABLED === 'true';
    const hasApiKey = !!process.env.GEMINI_API_KEY;

    res.json({
      success: true,
      data: {
        aiEnabled,
        hasApiKey,
        model: process.env.GEMINI_MODEL || 'gemini-pro',
        status: aiEnabled && hasApiKey ? 'operational' : 'configuration_required',
        features: {
          taskSuggestions: aiEnabled && hasApiKey,
          chat: aiEnabled && hasApiKey,
          subtaskSuggestions: aiEnabled && hasApiKey,
          sprintAnalysis: aiEnabled && hasApiKey
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  });
}