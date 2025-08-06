import { Response } from 'express';
import { AIService } from '../services/ai.service';
import { RequestWithUser } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import prisma from '../config/database';

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
   * POST /api/ai/educational-content
   * Generate AI-powered educational content about Scrum methodology
   */
  static generateEducationalContent = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;
    const { topic, level, contentType } = req.body;

    console.log('📚 AIController.generateEducationalContent called');
    console.log('📚 Request data:', { userId, topic, level, contentType });

    const result = await AIService.generateEducationalContent(userId, {
      topic,
      level,
      contentType
    });

    res.json({
      success: true,
      data: {
        content: result.content,
        topic: result.topic,
        level: result.level,
        contentType: result.contentType,
        estimatedReadTime: result.estimatedReadTime
      },
      meta: {
        timestamp: new Date().toISOString(),
        aiGenerated: true,
        coach: 'Koç'
      }
    });
  });

  /**
   * GET /api/ai/learning-profile
   * Get user's learning profile and progress
   */
  static getLearningProfile = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;

    console.log('📚 AIController.getLearningProfile called');
    console.log('📚 Request data:', { userId });

    const profile = await AIService.getUserLearningProfile(userId);

    res.json({
      success: true,
      data: {
        profile: {
          currentLevel: profile.currentLevel,
          preferredContentType: profile.preferredContentType,
          topicsCompleted: JSON.parse(profile.topicsCompleted as string || '[]'),
          strongAreas: JSON.parse(profile.strongAreas as string || '[]'),
          weakAreas: JSON.parse(profile.weakAreas as string || '[]'),
          lastLevelUpdate: profile.lastLevelUpdate
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  /**
   * POST /api/ai/learning-feedback
   * Provide feedback on learning content
   */
  static provideLearningFeedback = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;
    const { topic, performance } = req.body;

    console.log('📈 AIController.provideLearningFeedback called');
    console.log('📈 Request data:', { userId, topic, performance });

    await AIService.updateLearningProfile(userId, topic, 'current', performance);

    res.json({
      success: true,
      data: { message: 'Learning feedback recorded successfully' },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  /**
   * GET /api/ai/interaction-history
   * Get user's AI interaction history
   */
  static getInteractionHistory = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 20;

    console.log('🕰️ AIController.getInteractionHistory called');
    console.log('🕰️ Request data:', { userId, limit });

    const history = await AIService.getUserInteractionHistory(userId, limit);

    res.json({
      success: true,
      data: {
        interactions: history.map(interaction => ({
          id: interaction.id,
          type: interaction.interactionType,
          input: interaction.input.substring(0, 100) + '...',
          timestamp: interaction.createdAt,
          context: interaction.context ? JSON.parse(interaction.context) : null
        })),
        count: history.length
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  /**
   * GET /api/ai/project-analytics/:projectId
   * Get AI-powered project analytics
   */
  static getProjectAnalytics = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;
    const { projectId } = req.params;

    console.log('📊 AIController.getProjectAnalytics called');
    console.log('📊 Request data:', { userId, projectId });

    // Update analytics first
    await AIService.updateProjectAnalytics(projectId, userId);

    // Get updated analytics
    const analytics = await prisma.projectAnalytics.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND_ERROR',
          message: 'Project analytics not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        analytics: {
          sprintCompletionRate: analytics.sprintCompletionRate,
          taskVelocity: analytics.taskVelocity,
          aiUsageFrequency: analytics.aiUsageFrequency,
          lastAnalyzed: analytics.lastAnalyzed
        }
      },
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
          sprintAnalysis: aiEnabled && hasApiKey,
          educationalContent: aiEnabled && hasApiKey
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  });
}