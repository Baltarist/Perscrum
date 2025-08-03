import { Response } from 'express';
import { TaskService, CreateTaskData, UpdateTaskData, CreateSubtaskData, UpdateSubtaskData } from '../services/task.service';
import { RequestWithUser, TaskStatus } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export class TaskController {
  // GET /api/sprints/:sprintId/tasks
  static getSprintTasks = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { sprintId } = req.params;
    const userId = req.user!.userId;
    
    const tasks = await TaskService.getSprintTasks(sprintId, userId);
    
    res.json({
      success: true,
      data: { tasks },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/tasks/:id
  static getTaskById = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const task = await TaskService.getTaskById(id, userId);
    
    res.json({
      success: true,
      data: { task },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // POST /api/sprints/:sprintId/tasks
  static createTask = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { sprintId } = req.params;
    const userId = req.user!.userId;
    const taskData: CreateTaskData = {
      ...req.body,
      plannedDate: req.body.plannedDate ? new Date(req.body.plannedDate) : undefined
    };
    
    const task = await TaskService.createTask(sprintId, userId, taskData);
    
    res.status(201).json({
      success: true,
      data: { task },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // PUT /api/tasks/:id
  static updateTask = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const updateData: UpdateTaskData = {
      ...req.body,
      plannedDate: req.body.plannedDate ? new Date(req.body.plannedDate) : undefined
    };
    
    const task = await TaskService.updateTask(id, userId, updateData);
    
    res.json({
      success: true,
      data: { task },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // DELETE /api/tasks/:id
  static deleteTask = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    await TaskService.deleteTask(id, userId);
    
    res.json({
      success: true,
      data: { message: 'Task deleted successfully' },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // POST /api/tasks/:id/subtasks
  static createSubtask = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const subtaskData: CreateSubtaskData = req.body;
    
    const subtask = await TaskService.createSubtask(id, userId, subtaskData);
    
    res.status(201).json({
      success: true,
      data: { subtask },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // PUT /api/subtasks/:id
  static updateSubtask = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const updateData: UpdateSubtaskData = req.body;
    
    const subtask = await TaskService.updateSubtask(id, userId, updateData);
    
    res.json({
      success: true,
      data: { subtask },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // DELETE /api/subtasks/:id
  static deleteSubtask = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    await TaskService.deleteSubtask(id, userId);
    
    res.json({
      success: true,
      data: { message: 'Subtask deleted successfully' },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/users/tasks
  static getUserTasks = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;
    const { status, limit } = req.query;
    
    const tasks = await TaskService.getUserTasks(
      userId, 
      status as TaskStatus | undefined,
      limit ? parseInt(limit as string) : undefined
    );
    
    res.json({
      success: true,
      data: { tasks },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // PUT /api/tasks/:id/status
  static updateTaskStatus = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const { status }: { status: TaskStatus } = req.body;
    const userId = req.user!.userId;
    
    const task = await TaskService.updateTask(id, userId, { status });
    
    res.json({
      success: true,
      data: { task },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // PUT /api/tasks/:id/assign
  static assignTask = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const { assigneeId }: { assigneeId: string } = req.body;
    const userId = req.user!.userId;
    
    const task = await TaskService.updateTask(id, userId, { assigneeId });
    
    res.json({
      success: true,
      data: { task },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });
}