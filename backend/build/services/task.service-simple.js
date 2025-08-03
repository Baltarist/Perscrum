"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
const sprint_service_1 = require("./sprint.service");
class TaskService {
    // Get tasks for a sprint - simplified
    static async getSprintTasks(sprintId, userId) {
        // Verify user has access to sprint
        await sprint_service_1.SprintService.getSprintById(sprintId, userId);
        const tasks = await database_1.default.task.findMany({
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
        return tasks;
    }
    // Get single task by ID - simplified
    static async getTaskById(taskId, userId) {
        const task = await database_1.default.task.findUnique({
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
            throw new types_1.CustomError('Task not found', 404);
        }
        // Verify user has access to the project
        await sprint_service_1.SprintService.getSprintById(task.sprintId, userId);
        return task;
    }
    // Create new task
    static async createTask(sprintId, userId, data) {
        // Verify user has access to sprint
        await sprint_service_1.SprintService.getSprintById(sprintId, userId);
        // Validate assignee exists if provided
        if (data.assigneeId) {
            const assignee = await database_1.default.user.findUnique({
                where: { id: data.assigneeId }
            });
            if (!assignee) {
                throw new types_1.CustomError('Assignee not found', 404);
            }
        }
        const task = await database_1.default.task.create({
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
                subtasks: true
            }
        });
        // Create notification for assignee
        if (data.assigneeId && data.assigneeId !== userId) {
            await database_1.default.notification.create({
                data: {
                    userId: data.assigneeId,
                    type: 'task_assigned',
                    message: `New task "${task.title}" has been assigned to you`
                }
            });
        }
        return task;
    }
    // Update task
    static async updateTask(taskId, userId, data) {
        const currentTask = await this.getTaskById(taskId, userId);
        // Validate assignee exists if provided
        if (data.assigneeId) {
            const assignee = await database_1.default.user.findUnique({
                where: { id: data.assigneeId }
            });
            if (!assignee) {
                throw new types_1.CustomError('Assignee not found', 404);
            }
        }
        // Check if status is changing
        let completedAt = currentTask.completedAt;
        if (data.status) {
            if (data.status === 'done' && currentTask.status !== 'done') {
                completedAt = new Date();
            }
            else if (data.status !== 'done' && currentTask.status === 'done') {
                completedAt = null;
            }
        }
        const updatedTask = await database_1.default.task.update({
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
                subtasks: true
            }
        });
        // Create notification for status change
        if (data.status && updatedTask.assigneeId && updatedTask.assigneeId !== userId) {
            await database_1.default.notification.create({
                data: {
                    userId: updatedTask.assigneeId,
                    type: 'system_update',
                    message: `Task "${updatedTask.title}" status changed to ${data.status}`
                }
            });
        }
        return updatedTask;
    }
    // Delete task
    static async deleteTask(taskId, userId) {
        const task = await this.getTaskById(taskId, userId);
        // Only task creator can delete (simplified)
        if (task.createdById !== userId) {
            throw new types_1.CustomError('Only task creator can delete task', 403);
        }
        await database_1.default.task.delete({
            where: { id: taskId }
        });
    }
    // Create subtask
    static async createSubtask(taskId, userId, data) {
        const task = await this.getTaskById(taskId, userId);
        // Validate assignee exists if provided
        if (data.assigneeId) {
            const assignee = await database_1.default.user.findUnique({
                where: { id: data.assigneeId }
            });
            if (!assignee) {
                throw new types_1.CustomError('Assignee not found', 404);
            }
        }
        const subtask = await database_1.default.subtask.create({
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
    static async updateSubtask(subtaskId, userId, data) {
        const subtask = await database_1.default.subtask.findUnique({
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
            throw new types_1.CustomError('Subtask not found', 404);
        }
        // Verify user has access to the project
        await sprint_service_1.SprintService.getSprintById(subtask.task.sprintId, userId);
        // Validate assignee exists if provided
        if (data.assigneeId) {
            const assignee = await database_1.default.user.findUnique({
                where: { id: data.assigneeId }
            });
            if (!assignee) {
                throw new types_1.CustomError('Assignee not found', 404);
            }
        }
        const updatedSubtask = await database_1.default.subtask.update({
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
    static async deleteSubtask(subtaskId, userId) {
        const subtask = await database_1.default.subtask.findUnique({
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
            throw new types_1.CustomError('Subtask not found', 404);
        }
        // Only subtask creator can delete
        if (subtask.createdById !== userId) {
            throw new types_1.CustomError('Only subtask creator can delete', 403);
        }
        await database_1.default.subtask.delete({
            where: { id: subtaskId }
        });
    }
    // Get user's assigned tasks across all projects
    static async getUserTasks(userId, status, limit = 50) {
        const whereClause = {
            OR: [
                { assigneeId: userId },
                { createdById: userId }
            ]
        };
        if (status) {
            whereClause.status = status;
        }
        const tasks = await database_1.default.task.findMany({
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
        return tasks;
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.service-simple.js.map