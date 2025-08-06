import prisma from '../config/database';
import { Task, TaskStatus, User, Subtask, CustomError } from '../types';
import { SprintService } from './sprint.service';
import { getSocketServer } from '../sockets/socketServer';

export interface CreateTaskData {
  title: string;
  description?: string;
  storyPoints?: number;
  assigneeId?: string;
  plannedDate?: Date;
  notes?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  storyPoints?: number;
  assigneeId?: string;
  plannedDate?: Date;
  notes?: string;
}

export interface CreateSubtaskData {
  title: string;
  assigneeId?: string;
}

export interface UpdateSubtaskData {
  title?: string;
  isCompleted?: boolean;
  assigneeId?: string;
}

export class TaskService {
  // Get tasks for a sprint - simplified
  static async getSprintTasks(sprintId: string, userId: string): Promise<Task[]> {
    // Verify user has access to sprint
    await SprintService.getSprintById(sprintId, userId);

    const tasks = await prisma.task.findMany({
      where: { sprintId },
      include: {
        createdBy: {
          select: { id: true, displayName: true, email: true }
        },
        assignee: {
          select: { id: true, displayName: true, email: true }
        },
        subtasks: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignee: {
              select: { id: true, displayName: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks as any[];
  }

  // Get single task by ID - simplified
  static async getTaskById(taskId: string, userId: string): Promise<Task> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        sprint: {
          include: {
            project: {
              select: { id: true, title: true, ownerId: true }
            }
          }
        },
        createdBy: {
          select: { id: true, displayName: true, email: true }
        },
        assignee: {
          select: { id: true, displayName: true, email: true }
        },
        subtasks: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignee: {
              select: { id: true, displayName: true, email: true }
            }
          }
        }
      }
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    // Verify user has access to the project
    await SprintService.getSprintById(task.sprintId, userId);

    return task as any;
  }

  // Create new task
  static async createTask(
    sprintId: string, 
    userId: string, 
    data: CreateTaskData
  ): Promise<Task> {
    // Verify user has access to sprint
    await SprintService.getSprintById(sprintId, userId);

    // Validate assignee exists if provided
    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assigneeId }
      });
      if (!assignee) {
        throw new CustomError('Assignee not found', 404);
      }
    }

    const task = await prisma.task.create({
      data: {
        sprintId,
        title: data.title,
        description: data.description,
        status: 'todo',
        storyPoints: data.storyPoints,
        assigneeId: data.assigneeId,
        plannedDate: data.plannedDate,
        notes: data.notes,
        createdById: userId,
        isAiAssisted: false
      },
      include: {
        createdBy: {
          select: { id: true, displayName: true, email: true }
        },
        assignee: {
          select: { id: true, displayName: true, email: true }
        },
        subtasks: true,
        sprint: {
          select: { id: true, projectId: true }
        }
      }
    });

    // Create notification for assignee
    if (data.assigneeId && data.assigneeId !== userId) {
      await prisma.notification.create({
        data: {
          userId: data.assigneeId,
          type: 'task_assigned',
          message: `New task "${task.title}" has been assigned to you`
        }
      });
    }

    // Broadcast real-time update
    const socketServer = getSocketServer();
    if (socketServer && task.sprint) {
      socketServer.broadcastTaskUpdate(
        task.id,
        {
          action: 'created',
          task: {
            id: task.id,
            title: task.title,
            status: task.status,
            storyPoints: task.storyPoints,
            assignee: task.assignee,
            createdBy: task.createdBy
          }
        },
        task.sprint.projectId,
        task.sprintId
      );

      // Send real-time notification to assignee
      if (data.assigneeId && data.assigneeId !== userId) {
        socketServer.broadcastNotification(data.assigneeId, {
          type: 'task_assigned',
          title: 'Yeni Görev Atandı',
          message: `"${task.title}" görevi size atandı`,
          taskId: task.id,
          projectId: task.sprint.projectId
        });
      }
    }

    return task as any;
  }

  // Update task
  static async updateTask(
    taskId: string, 
    userId: string, 
    data: UpdateTaskData
  ): Promise<Task> {
    const currentTask = await this.getTaskById(taskId, userId);

    // Validate assignee exists if provided
    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assigneeId }
      });
      if (!assignee) {
        throw new CustomError('Assignee not found', 404);
      }
    }

    // Check if status is changing
    let completedAt = currentTask.completedAt;
    if (data.status) {
      if (data.status === 'done' && currentTask.status !== 'done') {
        completedAt = new Date();
      } else if (data.status !== 'done' && currentTask.status === 'done') {
        completedAt = null;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        completedAt,
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          select: { id: true, displayName: true, email: true }
        },
        assignee: {
          select: { id: true, displayName: true, email: true }
        },
        subtasks: true,
        sprint: {
          select: { id: true, projectId: true }
        }
      }
    });

    // Create notification for status change
    if (data.status && updatedTask.assigneeId && updatedTask.assigneeId !== userId) {
      await prisma.notification.create({
        data: {
          userId: updatedTask.assigneeId,
          type: 'system_update',
          message: `Task "${updatedTask.title}" status changed to ${data.status}`
        }
      });
    }

    // Broadcast real-time update
    const socketServer = getSocketServer();
    if (socketServer && updatedTask.sprint) {
      const changedFields = Object.keys(data);
      socketServer.broadcastTaskUpdate(
        updatedTask.id,
        {
          action: 'updated',
          changedFields,
          task: {
            id: updatedTask.id,
            title: updatedTask.title,
            status: updatedTask.status,
            storyPoints: updatedTask.storyPoints,
            assignee: updatedTask.assignee,
            completedAt: updatedTask.completedAt
          }
        },
        updatedTask.sprint.projectId,
        updatedTask.sprintId
      );

      // Send real-time notification for status change
      if (data.status && updatedTask.assigneeId && updatedTask.assigneeId !== userId) {
        socketServer.broadcastNotification(updatedTask.assigneeId, {
          type: 'task_status_changed',
          title: 'Görev Durumu Değişti',
          message: `"${updatedTask.title}" görevinin durumu ${data.status} olarak güncellendi`,
          taskId: updatedTask.id,
          projectId: updatedTask.sprint.projectId
        });
      }

      // Send notification for assignment change
      if (data.assigneeId && data.assigneeId !== currentTask.assigneeId && data.assigneeId !== userId) {
        socketServer.broadcastNotification(data.assigneeId, {
          type: 'task_assigned',
          title: 'Yeni Görev Atandı',
          message: `"${updatedTask.title}" görevi size atandı`,
          taskId: updatedTask.id,
          projectId: updatedTask.sprint.projectId
        });
      }
    }

    return updatedTask as any;
  }

  // Delete task
  static async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.getTaskById(taskId, userId);

    // Only task creator can delete (simplified)
    if (task.createdById !== userId) {
      throw new CustomError('Only task creator can delete task', 403);
    }

    // Get sprint info for broadcasting
    const taskWithSprint = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        sprint: {
          select: { id: true, projectId: true }
        }
      }
    });

    await prisma.task.delete({
      where: { id: taskId }
    });

    // Broadcast real-time update
    const socketServer = getSocketServer();
    if (socketServer && taskWithSprint?.sprint) {
      socketServer.broadcastTaskUpdate(
        taskId,
        {
          action: 'deleted',
          taskId
        },
        taskWithSprint.sprint.projectId,
        taskWithSprint.sprintId
      );
    }
  }

  // Create subtask
  static async createSubtask(
    taskId: string, 
    userId: string, 
    data: CreateSubtaskData
  ): Promise<any> {
    const task = await this.getTaskById(taskId, userId);

    // Validate assignee exists if provided
    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assigneeId }
      });
      if (!assignee) {
        throw new CustomError('Assignee not found', 404);
      }
    }

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title: data.title,
        isCompleted: false,
        assigneeId: data.assigneeId,
        createdById: userId,
        isAiAssisted: false
      },
      include: {
        createdBy: {
          select: { id: true, displayName: true, email: true }
        },
        assignee: {
          select: { id: true, displayName: true, email: true }
        }
      }
    });

    return subtask;
  }

  // Update subtask
  static async updateSubtask(
    subtaskId: string, 
    userId: string, 
    data: UpdateSubtaskData
  ): Promise<any> {
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: {
        task: {
          include: {
            sprint: {
              include: {
                project: { select: { id: true, ownerId: true } }
              }
            }
          }
        }
      }
    });

    if (!subtask) {
      throw new CustomError('Subtask not found', 404);
    }

    // Verify user has access to the project
    await SprintService.getSprintById(subtask.task.sprintId, userId);

    // Validate assignee exists if provided
    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assigneeId }
      });
      if (!assignee) {
        throw new CustomError('Assignee not found', 404);
      }
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          select: { id: true, displayName: true, email: true }
        },
        assignee: {
          select: { id: true, displayName: true, email: true }
        }
      }
    });

    return updatedSubtask;
  }

  // Delete subtask
  static async deleteSubtask(subtaskId: string, userId: string): Promise<void> {
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: {
        task: {
          include: {
            sprint: {
              include: {
                project: { select: { id: true, ownerId: true } }
              }
            }
          }
        }
      }
    });

    if (!subtask) {
      throw new CustomError('Subtask not found', 404);
    }

    // Only subtask creator can delete
    if (subtask.createdById !== userId) {
      throw new CustomError('Only subtask creator can delete', 403);
    }

    await prisma.subtask.delete({
      where: { id: subtaskId }
    });
  }

  // Get user's assigned tasks across all projects
  static async getUserTasks(
    userId: string, 
    status?: TaskStatus, 
    limit = 50
  ): Promise<Task[]> {
    const whereClause: any = {
      OR: [
        { assigneeId: userId },
        { createdById: userId }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        sprint: {
          include: {
            project: {
              select: { id: true, title: true, ownerId: true }
            }
          }
        },
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
      orderBy: { updatedAt: 'desc' },
      take: limit
    });

    return tasks as any[];
  }
}