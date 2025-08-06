import prisma from '../config/database';

class CustomError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CustomError';
  }
}

export interface VelocityData {
  sprint: string;
  completedPoints: number;
  sprintNumber: number;
  sprintDuration: number;
  completionRate: number;
}

export interface BurndownDataPoint {
  day: string;
  remaining: number;
  ideal: number;
  completed: number;
}

export interface SprintMetrics {
  velocityPoints: number;
  completionRate: number;
  averageTaskDuration: number;
  teamEfficiency: number;
  burndownTrend: 'ahead' | 'on_track' | 'behind';
  predictedCompletion?: Date;
  riskFactors: string[];
  recommendations: string[];
}

export interface ProjectAnalyticsData {
  overallVelocity: number;
  averageSprintDuration: number;
  completionTrend: 'improving' | 'stable' | 'declining';
  estimatedCompletion?: Date;
  totalStoryPoints: number;
  completedStoryPoints: number;
  riskLevel: 'low' | 'medium' | 'high';
  strengthAreas: string[];
  improvementAreas: string[];
}

export class AnalyticsService {
  
  /**
   * Calculate and store velocity data for a completed sprint
   */
  static async calculateSprintVelocity(sprintId: string, userId: string): Promise<VelocityData> {
    try {
      const sprint = await prisma.sprint.findUnique({
        where: { id: sprintId },
        include: {
          tasks: true,
          project: true
        }
      });

      if (!sprint) {
        throw new CustomError('Sprint not found', 404);
      }

      // Calculate velocity metrics
      const totalStoryPoints = sprint.tasks.reduce((sum: number, task: any) => sum + (task.storyPoints || 0), 0);
      const completedTasks = sprint.tasks.filter((task: any) => task.status === 'done');
      const completedStoryPoints = completedTasks.reduce((sum: number, task: any) => sum + (task.storyPoints || 0), 0);
      
      const sprintDuration = Math.ceil(
        (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Store velocity tracking data
      const velocityTracking = await prisma.velocityTracking.create({
        data: {
          sprintId,
          projectId: sprint.projectId,
          userId,
          completedStoryPoints,
          totalStoryPoints,
          completedTasks: completedTasks.length,
          totalTasks: sprint.tasks.length,
          sprintDuration
        }
      });

      // Update sprint velocity points
      await prisma.sprint.update({
        where: { id: sprintId },
        data: { velocityPoints: completedStoryPoints }
      });

      return {
        sprint: `Sprint ${sprint.sprintNumber}`,
        completedPoints: completedStoryPoints,
        sprintNumber: sprint.sprintNumber,
        sprintDuration,
        completionRate: totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0
      };
    } catch (error) {
      console.error('Error calculating sprint velocity:', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to calculate sprint velocity', 500);
    }
  }

  /**
   * Get velocity trend data for a project
   */
  static async getProjectVelocityTrend(projectId: string, userId: string): Promise<VelocityData[]> {
    try {
      const velocityData = await prisma.velocityTracking.findMany({
        where: {
          projectId,
          userId
        },
        include: {
          sprint: true
        },
        orderBy: {
          sprint: {
            sprintNumber: 'asc'
          }
        }
      });

      return velocityData.map((v: any) => ({
        sprint: `Sprint ${v.sprint.sprintNumber}`,
        completedPoints: v.completedStoryPoints,
        sprintNumber: v.sprint.sprintNumber,
        sprintDuration: v.sprintDuration,
        completionRate: v.totalStoryPoints > 0 ? (v.completedStoryPoints / v.totalStoryPoints) * 100 : 0
      }));
    } catch (error) {
      console.error('Error getting project velocity trend:', error);
      throw new CustomError('Failed to get velocity data', 500);
    }
  }

  /**
   * Generate burndown chart data for a sprint
   */
  static async generateBurndownData(sprintId: string): Promise<BurndownDataPoint[]> {
    try {
      const sprint = await prisma.sprint.findUnique({
        where: { id: sprintId },
        include: {
          tasks: {
            include: {
              statusChanges: {
                orderBy: { changedAt: 'asc' }
              }
            }
          }
        }
      });

      if (!sprint) {
        throw new CustomError('Sprint not found', 404);
      }

      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalStoryPoints = sprint.tasks.reduce((sum: number, task: any) => sum + (task.storyPoints || 0), 0);

      const burndownData: BurndownDataPoint[] = [];

      // Generate data for each day of the sprint
      for (let day = 0; day <= totalDays; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);
        
        // Calculate completed story points up to this date
        let completedPoints = 0;
        sprint.tasks.forEach((task: any) => {
          const completionChange = task.statusChanges.find(
            (change: any) => change.toStatus === 'done' && 
            new Date(change.changedAt) <= currentDate
          );
          if (completionChange) {
            completedPoints += task.storyPoints || 0;
          }
        });

        const remainingPoints = totalStoryPoints - completedPoints;
        const idealRemaining = totalStoryPoints - (totalStoryPoints * day / totalDays);

        burndownData.push({
          day: currentDate.toISOString().split('T')[0],
          remaining: remainingPoints,
          ideal: Math.max(0, idealRemaining),
          completed: completedPoints
        });

        // Store in database for caching
        await prisma.burndownData.upsert({
          where: {
            sprintId_date: {
              sprintId,
              date: currentDate
            }
          },
          update: {
            remainingPoints,
            remainingTasks: sprint.tasks.length - sprint.tasks.filter((t: any) => 
              t.statusChanges.some((sc: any) => sc.toStatus === 'done' && new Date(sc.changedAt) <= currentDate)
            ).length,
            idealPoints: idealRemaining,
            completedPoints
          },
          create: {
            sprintId,
            date: currentDate,
            remainingPoints,
            remainingTasks: sprint.tasks.length - sprint.tasks.filter((t: any) => 
              t.statusChanges.some((sc: any) => sc.toStatus === 'done' && new Date(sc.changedAt) <= currentDate)
            ).length,
            idealPoints: idealRemaining,
            completedPoints
          }
        });
      }

      return burndownData;
    } catch (error) {
      console.error('Error generating burndown data:', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to generate burndown data', 500);
    }
  }

  /**
   * Get cached burndown data for a sprint
   */
  static async getBurndownChartData(sprintId: string): Promise<BurndownDataPoint[]> {
    try {
      const burndownData = await prisma.burndownData.findMany({
        where: { sprintId },
        orderBy: { date: 'asc' }
      });

      if (burndownData.length === 0) {
        // Generate data if not cached
        return await this.generateBurndownData(sprintId);
      }

      return burndownData.map((data: any) => ({
        day: data.date.toISOString().split('T')[0],
        remaining: data.remainingPoints,
        ideal: data.idealPoints,
        completed: data.completedPoints
      }));
    } catch (error) {
      console.error('Error getting burndown chart data:', error);
      throw new CustomError('Failed to get burndown data', 500);
    }
  }

  /**
   * Calculate comprehensive sprint metrics
   */
  static async calculateSprintMetrics(sprintId: string): Promise<SprintMetrics> {
    try {
      const sprint = await prisma.sprint.findUnique({
        where: { id: sprintId },
        include: {
          tasks: {
            include: {
              statusChanges: true
            }
          }
        }
      });

      if (!sprint) {
        throw new CustomError('Sprint not found', 404);
      }

      const totalStoryPoints = sprint.tasks.reduce((sum: number, task: any) => sum + (task.storyPoints || 0), 0);
      const completedTasks = sprint.tasks.filter((task: any) => task.status === 'done');
      const completedStoryPoints = completedTasks.reduce((sum: number, task: any) => sum + (task.storyPoints || 0), 0);
      
      const completionRate = totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) : 0;
      
      // Calculate average task duration
      const taskDurations = completedTasks.map((task: any) => {
        const startChange = task.statusChanges.find((sc: any) => sc.toStatus === 'in_progress');
        const endChange = task.statusChanges.find((sc: any) => sc.toStatus === 'done');
        
        if (startChange && endChange) {
          return (new Date(endChange.changedAt).getTime() - new Date(startChange.changedAt).getTime()) / (1000 * 60 * 60 * 24);
        }
        return 0;
      }).filter((duration: number) => duration > 0);

      const averageTaskDuration = taskDurations.length > 0 
        ? taskDurations.reduce((sum: number, duration: number) => sum + duration, 0) / taskDurations.length 
        : 0;

      // Calculate team efficiency (completion rate * velocity)
      const teamEfficiency = completionRate * (completedStoryPoints / Math.max(1, totalStoryPoints));

      // Determine burndown trend
      let burndownTrend: 'ahead' | 'on_track' | 'behind' = 'on_track';
      const sprintProgress = (new Date().getTime() - new Date(sprint.startDate).getTime()) / 
                           (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime());
      
      if (completionRate > sprintProgress + 0.1) {
        burndownTrend = 'ahead';
      } else if (completionRate < sprintProgress - 0.1) {
        burndownTrend = 'behind';
      }

      // Generate risk factors and recommendations
      const riskFactors: string[] = [];
      const recommendations: string[] = [];

      if (completionRate < 0.5 && sprintProgress > 0.7) {
        riskFactors.push('Low completion rate with limited time remaining');
        recommendations.push('Focus on critical tasks and consider scope reduction');
      }
      if (averageTaskDuration > 3) {
        riskFactors.push('Tasks taking longer than expected');
        recommendations.push('Break down complex tasks into smaller subtasks');
      }
      if (teamEfficiency < 0.6) {
        riskFactors.push('Team efficiency below optimal level');
        recommendations.push('Review task assignments and remove blockers');
      }

      // Store analytics
      await prisma.sprintAnalytics.upsert({
        where: { sprintId },
        update: {
          velocityPoints: completedStoryPoints,
          completionRate,
          averageTaskDuration,
          teamEfficiency,
          burndownTrend,
          riskFactors: JSON.stringify(riskFactors),
          recommendations: JSON.stringify(recommendations),
          generatedAt: new Date()
        },
        create: {
          sprintId,
          projectId: sprint.projectId,
          velocityPoints: completedStoryPoints,
          completionRate,
          averageTaskDuration,
          teamEfficiency,
          burndownTrend,
          riskFactors: JSON.stringify(riskFactors),
          recommendations: JSON.stringify(recommendations)
        }
      });

      return {
        velocityPoints: completedStoryPoints,
        completionRate,
        averageTaskDuration,
        teamEfficiency,
        burndownTrend,
        riskFactors,
        recommendations
      };
    } catch (error) {
      console.error('Error calculating sprint metrics:', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to calculate sprint metrics', 500);
    }
  }

  /**
   * Get user's overall velocity data across all projects
   */
  static async getUserVelocityHistory(userId: string): Promise<VelocityData[]> {
    try {
      const velocityData = await prisma.velocityTracking.findMany({
        where: { userId },
        include: {
          sprint: true,
          project: true
        },
        orderBy: {
          calculatedAt: 'asc'
        }
      });

      return velocityData.map((v: any) => ({
        sprint: `${v.project.title} - Sprint ${v.sprint.sprintNumber}`,
        completedPoints: v.completedStoryPoints,
        sprintNumber: v.sprint.sprintNumber,
        sprintDuration: v.sprintDuration,
        completionRate: v.totalStoryPoints > 0 ? (v.completedStoryPoints / v.totalStoryPoints) * 100 : 0
      }));
    } catch (error) {
      console.error('Error getting user velocity history:', error);
      throw new CustomError('Failed to get user velocity history', 500);
    }
  }

  /**
   * Calculate project-level analytics
   */
  static async calculateProjectAnalytics(projectId: string, userId: string): Promise<ProjectAnalyticsData> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          sprints: {
            include: {
              tasks: true,
              velocityTracking: {
                where: { userId }
              }
            }
          }
        }
      });

      if (!project) {
        throw new CustomError('Project not found', 404);
      }

      const completedSprints = project.sprints.filter((s: any) => s.status === 'completed');
      const totalStoryPoints = project.sprints.reduce((sum: number, sprint: any) => 
        sum + sprint.tasks.reduce((taskSum: number, task: any) => taskSum + (task.storyPoints || 0), 0), 0
      );
      const completedStoryPoints = completedSprints.reduce((sum: number, sprint: any) => 
        sum + sprint.tasks.filter((t: any) => t.status === 'done').reduce((taskSum: number, task: any) => taskSum + (task.storyPoints || 0), 0), 0
      );

      // Calculate overall velocity
      const velocitySum = completedSprints.reduce((sum: number, sprint: any) => sum + (sprint.velocityPoints || 0), 0);
      const overallVelocity = completedSprints.length > 0 ? velocitySum / completedSprints.length : 0;

      // Calculate average sprint duration
      const sprintDurations = completedSprints.map((sprint: any) => 
        Math.ceil((new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / (1000 * 60 * 60 * 24))
      );
      const averageSprintDuration = sprintDurations.length > 0 
        ? sprintDurations.reduce((sum: number, duration: number) => sum + duration, 0) / sprintDurations.length 
        : 0;

      // Determine completion trend
      let completionTrend: 'improving' | 'stable' | 'declining' = 'stable';
      if (completedSprints.length >= 3) {
        const recentVelocities = completedSprints.slice(-3).map((s: any) => s.velocityPoints || 0);
        const earlierVelocities = completedSprints.slice(-6, -3).map((s: any) => s.velocityPoints || 0);
        
        if (earlierVelocities.length > 0) {
          const recentAvg = recentVelocities.reduce((sum: number, v: number) => sum + v, 0) / recentVelocities.length;
          const earlierAvg = earlierVelocities.reduce((sum: number, v: number) => sum + v, 0) / earlierVelocities.length;
          
          if (recentAvg > earlierAvg * 1.1) {
            completionTrend = 'improving';
          } else if (recentAvg < earlierAvg * 0.9) {
            completionTrend = 'declining';
          }
        }
      }

      // Calculate estimated completion
      let estimatedCompletion: Date | undefined;
      if (overallVelocity > 0 && totalStoryPoints > completedStoryPoints) {
        const remainingPoints = totalStoryPoints - completedStoryPoints;
        const remainingSprints = Math.ceil(remainingPoints / overallVelocity);
        estimatedCompletion = new Date();
        estimatedCompletion.setDate(estimatedCompletion.getDate() + (remainingSprints * averageSprintDuration));
      }

      // Determine risk level
      const completionRate = totalStoryPoints > 0 ? completedStoryPoints / totalStoryPoints : 0;
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      
      if (completionRate < 0.3 && completionTrend === 'declining') {
        riskLevel = 'high';
      } else if (completionRate < 0.6 || completionTrend === 'declining') {
        riskLevel = 'medium';
      }

      // Generate insights
      const strengthAreas: string[] = [];
      const improvementAreas: string[] = [];

      if (overallVelocity > 15) strengthAreas.push('High velocity delivery');
      if (completionTrend === 'improving') strengthAreas.push('Improving team performance');
      if (averageSprintDuration <= 14) strengthAreas.push('Consistent sprint cadence');

      if (overallVelocity < 5) improvementAreas.push('Increase story point completion');
      if (completionTrend === 'declining') improvementAreas.push('Address performance decline');
      if (riskLevel === 'high') improvementAreas.push('Critical project intervention needed');

      return {
        overallVelocity,
        averageSprintDuration,
        completionTrend,
        estimatedCompletion,
        totalStoryPoints,
        completedStoryPoints,
        riskLevel,
        strengthAreas,
        improvementAreas
      };
    } catch (error) {
      console.error('Error calculating project analytics:', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to calculate project analytics', 500);
    }
  }
}