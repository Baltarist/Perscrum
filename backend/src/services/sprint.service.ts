import prisma from '../config/database';
import { Sprint, SprintStatus, User, Task, CustomError } from '../types';
import { ProjectService } from './project.service';

export interface CreateSprintData {
  goal: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateSprintData {
  goal?: string;
  status?: SprintStatus;
  velocityPoints?: number;
  retrospectiveGood?: string;
  retrospectiveImprove?: string;
}

export interface SprintWithDetails extends Sprint {
  project: {
    id: string;
    title: string;
    ownerId: string;
  };
  tasks: Array<Task & {
    createdBy: Pick<User, 'id' | 'displayName' | 'email'>;
    assignee?: Pick<User, 'id' | 'displayName' | 'email'> | null;
    subtasks: Array<{
      id: string;
      title: string;
      isCompleted: boolean;
    }>;
  }>;
  _count: {
    tasks: number;
  };
}

export class SprintService {
  // Get sprints for a project
  static async getProjectSprints(projectId: string, userId: string): Promise<SprintWithDetails[]> {
    // Verify user has access to project
    await ProjectService.getProjectById(projectId, userId);

    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      include: {
        project: {
          select: { id: true, title: true, ownerId: true }
        },
        tasks: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignee: {
              select: { id: true, displayName: true, email: true }
            },
            subtasks: {
              select: { id: true, title: true, isCompleted: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { sprintNumber: 'asc' }
    });

    return sprints;
  }

  // Get single sprint by ID
  static async getSprintById(sprintId: string, userId: string): Promise<SprintWithDetails> {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        project: {
          select: { id: true, title: true, ownerId: true }
        },
        tasks: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignee: {
              select: { id: true, displayName: true, email: true }
            },
            subtasks: {
              select: { id: true, title: true, isCompleted: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    if (!sprint) {
      throw new CustomError('Sprint not found', 404);
    }

    // Verify user has access to the project
    await ProjectService.getProjectById(sprint.project.id, userId);

    return sprint;
  }

  // Create new sprint
  static async createSprint(
    projectId: string, 
    userId: string, 
    data: CreateSprintData
  ): Promise<SprintWithDetails> {
    // Verify user has access to project
    await ProjectService.getProjectById(projectId, userId);

    // Validate dates
    if (data.startDate >= data.endDate) {
      throw new CustomError('End date must be after start date', 400);
    }

    // Get next sprint number
    const lastSprint = await prisma.sprint.findFirst({
      where: { projectId },
      orderBy: { sprintNumber: 'desc' },
      select: { sprintNumber: true }
    });

    const sprintNumber = (lastSprint?.sprintNumber || 0) + 1;

    // Check for overlapping sprints
    const overlappingSprint = await prisma.sprint.findFirst({
      where: {
        projectId,
        status: { in: ['planning', 'active'] },
        OR: [
          {
            startDate: { lte: data.endDate },
            endDate: { gte: data.startDate }
          }
        ]
      }
    });

    if (overlappingSprint) {
      throw new CustomError('Sprint dates overlap with existing active sprint', 400);
    }

    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        sprintNumber,
        goal: data.goal,
        status: 'planning',
        startDate: data.startDate,
        endDate: data.endDate
      },
      include: {
        project: {
          select: { id: true, title: true, ownerId: true }
        },
        tasks: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignee: {
              select: { id: true, displayName: true, email: true }
            },
            subtasks: {
              select: { id: true, title: true, isCompleted: true }
            }
          }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'system_update',
        message: `Sprint ${sprintNumber} has been created for project "${sprint.project.title}"`,
        projectId
      }
    });

    return sprint;
  }

  // Update sprint
  static async updateSprint(
    sprintId: string, 
    userId: string, 
    data: UpdateSprintData
  ): Promise<SprintWithDetails> {
    const sprint = await this.getSprintById(sprintId, userId);

    // Only project owner or admin can update sprints
    const project = await ProjectService.getProjectById(sprint.project.id, userId);
    const isOwner = project.ownerId === userId;
    const isAdmin = project.teamMembers.some(
      member => member.userId === userId && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      throw new CustomError('Insufficient permissions to update sprint', 403);
    }

    const updatedSprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        project: {
          select: { id: true, title: true, ownerId: true }
        },
        tasks: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignee: {
              select: { id: true, displayName: true, email: true }
            },
            subtasks: {
              select: { id: true, title: true, isCompleted: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    return updatedSprint;
  }

  // Start sprint
  static async startSprint(sprintId: string, userId: string): Promise<SprintWithDetails> {
    const sprint = await this.getSprintById(sprintId, userId);

    if (sprint.status !== 'planning') {
      throw new CustomError('Only planning sprints can be started', 400);
    }

    // Check if there's already an active sprint in the project
    const activeSprint = await prisma.sprint.findFirst({
      where: {
        projectId: sprint.project.id,
        status: 'active'
      }
    });

    if (activeSprint) {
      throw new CustomError('There is already an active sprint in this project', 400);
    }

    return this.updateSprint(sprintId, userId, { status: 'active' });
  }

  // Complete sprint
  static async completeSprint(
    sprintId: string, 
    userId: string, 
    retrospective?: { good?: string; improve?: string }
  ): Promise<SprintWithDetails> {
    const sprint = await this.getSprintById(sprintId, userId);

    if (sprint.status !== 'active') {
      throw new CustomError('Only active sprints can be completed', 400);
    }

    // Calculate velocity points (completed story points)
    const completedTasks = await prisma.task.findMany({
      where: {
        sprintId,
        status: 'done'
      },
      select: { storyPoints: true }
    });

    const velocityPoints = completedTasks.reduce(
      (total, task) => total + (task.storyPoints || 0), 
      0
    );

    const updatedSprint = await this.updateSprint(sprintId, userId, {
      status: 'completed',
      velocityPoints,
      retrospectiveGood: retrospective?.good,
      retrospectiveImprove: retrospective?.improve
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'sprint_completed',
        message: `Sprint ${sprint.sprintNumber} completed with ${velocityPoints} story points!`,
        projectId: sprint.project.id
      }
    });

    return updatedSprint;
  }

  // Get sprint statistics
  static async getSprintStats(sprintId: string, userId: string): Promise<any> {
    const sprint = await this.getSprintById(sprintId, userId);

    const stats = await prisma.$transaction([
      // Task stats by status
      prisma.task.groupBy({
        by: ['status'],
        where: { sprintId },
        _count: true,
        orderBy: { status: 'asc' }
      }),
      // Story points stats
      prisma.task.aggregate({
        where: { sprintId },
        _sum: { storyPoints: true }
      }),
      // Completed story points
      prisma.task.aggregate({
        where: { 
          sprintId,
          status: 'done'
        },
        _sum: { storyPoints: true }
      }),
      // Task completion over time (for burndown)
      prisma.task.findMany({
        where: { sprintId, completedAt: { not: null } },
        select: { completedAt: true, storyPoints: true },
        orderBy: { completedAt: 'asc' }
      })
    ]);

    const [taskStats, totalPoints, completedPoints, completionHistory] = stats;

    // Calculate burndown data
    const burndownData = completionHistory.reduce((acc, task) => {
      const date = task.completedAt!.toISOString().split('T')[0];
      const points = task.storyPoints || 0;
      
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += points;
      
      return acc;
    }, {} as Record<string, number>);

    return {
      sprint: {
        id: sprint.id,
        sprintNumber: sprint.sprintNumber,
        goal: sprint.goal,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate
      },
      tasks: {
        total: taskStats.reduce((acc, t) => acc + (typeof t._count === 'number' ? t._count : 0), 0),
        byStatus: taskStats.reduce((acc, t) => ({
          ...acc,
          [t.status]: t._count
        }), {})
      },
      storyPoints: {
        total: totalPoints._sum.storyPoints || 0,
        completed: completedPoints._sum.storyPoints || 0,
        remaining: (totalPoints._sum.storyPoints || 0) - (completedPoints._sum.storyPoints || 0),
        completionRate: totalPoints._sum.storyPoints 
          ? Math.round((completedPoints._sum.storyPoints || 0) / totalPoints._sum.storyPoints * 100)
          : 0
      },
      burndown: burndownData,
      velocity: sprint.velocityPoints || 0
    };
  }

  // Delete sprint
  static async deleteSprint(sprintId: string, userId: string): Promise<void> {
    const sprint = await this.getSprintById(sprintId, userId);

    // Only project owner can delete sprints
    if (sprint.project.ownerId !== userId) {
      throw new CustomError('Only project owner can delete sprints', 403);
    }

    // Cannot delete active sprints with tasks
    if (sprint.status === 'active' && sprint._count.tasks > 0) {
      throw new CustomError('Cannot delete active sprint with tasks', 400);
    }

    await prisma.sprint.delete({
      where: { id: sprintId }
    });
  }
}