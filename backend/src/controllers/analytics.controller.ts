import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { asyncHandler } from '../utils/asyncHandler';
import { RequestWithUser } from '../types';

export class AnalyticsController {
  
  // GET /api/analytics/velocity/:projectId
  static getProjectVelocity = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!.userId;
    
    const velocityData = await AnalyticsService.getProjectVelocityTrend(projectId, userId);
    
    res.json({
      success: true,
      data: { velocityData },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/analytics/velocity/user/:userId
  static getUserVelocity = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { userId } = req.params;
    const requestingUserId = req.user!.userId;
    
    // Users can only access their own velocity data (for now)
    if (userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: {
          type: 'FORBIDDEN',
          message: 'You can only access your own velocity data'
        }
      });
    }
    
    const velocityData = await AnalyticsService.getUserVelocityHistory(userId);
    
    res.json({
      success: true,
      data: { velocityData },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/analytics/burndown/:sprintId
  static getSprintBurndown = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { sprintId } = req.params;
    const { regenerate } = req.query;
    
    let burndownData;
    if (regenerate === 'true') {
      burndownData = await AnalyticsService.generateBurndownData(sprintId);
    } else {
      burndownData = await AnalyticsService.getBurndownChartData(sprintId);
    }
    
    res.json({
      success: true,
      data: { burndownData },
      meta: {
        timestamp: new Date().toISOString(),
        regenerated: regenerate === 'true'
      }
    });
  });

  // POST /api/analytics/sprint/:sprintId/calculate
  static calculateSprintAnalytics = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { sprintId } = req.params;
    const userId = req.user!.userId;
    
    // Calculate velocity for this sprint
    const velocityData = await AnalyticsService.calculateSprintVelocity(sprintId, userId);
    
    // Calculate comprehensive sprint metrics
    const sprintMetrics = await AnalyticsService.calculateSprintMetrics(sprintId);
    
    // Generate burndown data
    const burndownData = await AnalyticsService.generateBurndownData(sprintId);
    
    res.json({
      success: true,
      data: {
        velocity: velocityData,
        metrics: sprintMetrics,
        burndown: burndownData
      },
      meta: {
        timestamp: new Date().toISOString(),
        sprintId
      }
    });
  });

  // GET /api/analytics/sprint/:sprintId/metrics
  static getSprintMetrics = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { sprintId } = req.params;
    
    const sprintMetrics = await AnalyticsService.calculateSprintMetrics(sprintId);
    
    res.json({
      success: true,
      data: { metrics: sprintMetrics },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/analytics/project/:projectId
  static getProjectAnalytics = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!.userId;
    
    const projectAnalytics = await AnalyticsService.calculateProjectAnalytics(projectId, userId);
    
    res.json({
      success: true,
      data: { analytics: projectAnalytics },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/analytics/dashboard/:userId
  static getAnalyticsDashboard = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { userId } = req.params;
    const requestingUserId = req.user!.userId;
    
    // Users can only access their own dashboard (for now)
    if (userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: {
          type: 'FORBIDDEN',
          message: 'You can only access your own analytics dashboard'
        }
      });
    }
    
    try {
      // Get user's velocity history
      const velocityHistory = await AnalyticsService.getUserVelocityHistory(userId);
      
      // TODO: Get user's projects and calculate overall analytics
      // This will be expanded to include project analytics, trends, etc.
      
      res.json({
        success: true,
        data: {
          velocityHistory,
          // Add more dashboard data here
        },
        meta: {
          timestamp: new Date().toISOString(),
          userId
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          type: 'DASHBOARD_ERROR',
          message: 'Failed to load analytics dashboard'
        }
      });
    }
  });

  // POST /api/analytics/recalculate/:projectId
  static recalculateProjectAnalytics = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!.userId;
    
    try {
      // Get all completed sprints for this project
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          sprints: {
            where: { status: 'completed' },
            include: { tasks: true }
          }
        }
      });
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            type: 'NOT_FOUND',
            message: 'Project not found'
          }
        });
      }
      
      const results = [];
      
      // Recalculate analytics for each completed sprint
      for (const sprint of project.sprints) {
        const velocityData = await AnalyticsService.calculateSprintVelocity(sprint.id, userId);
        const sprintMetrics = await AnalyticsService.calculateSprintMetrics(sprint.id);
        const burndownData = await AnalyticsService.generateBurndownData(sprint.id);
        
        results.push({
          sprintId: sprint.id,
          sprintNumber: sprint.sprintNumber,
          velocity: velocityData,
          metrics: sprintMetrics,
          burndownPoints: burndownData.length
        });
      }
      
      // Calculate overall project analytics
      const projectAnalytics = await AnalyticsService.calculateProjectAnalytics(projectId, userId);
      
      res.json({
        success: true,
        data: {
          projectAnalytics,
          sprintResults: results,
          recalculatedSprints: results.length
        },
        meta: {
          timestamp: new Date().toISOString(),
          projectId
        }
      });
      
    } catch (error) {
      console.error('Error recalculating project analytics:', error);
      res.status(500).json({
        success: false,
        error: {
          type: 'RECALCULATION_ERROR',
          message: 'Failed to recalculate project analytics'
        }
      });
    }
  });
}