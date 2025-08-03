"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
const asyncHandler_1 = require("../utils/asyncHandler");
class TaskController {
}
exports.TaskController = TaskController;
_a = TaskController;
// GET /api/sprints/:sprintId/tasks
TaskController.getSprintTasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { sprintId } = req.params;
    const userId = req.user.userId;
    const tasks = await task_service_1.TaskService.getSprintTasks(sprintId, userId);
    res.json({
        success: true,
        data: { tasks },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/tasks/:id
TaskController.getTaskById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const task = await task_service_1.TaskService.getTaskById(id, userId);
    res.json({
        success: true,
        data: { task },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/sprints/:sprintId/tasks
TaskController.createTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { sprintId } = req.params;
    const userId = req.user.userId;
    const taskData = {
        ...req.body,
        plannedDate: req.body.plannedDate ? new Date(req.body.plannedDate) : undefined
    };
    const task = await task_service_1.TaskService.createTask(sprintId, userId, taskData);
    res.status(201).json({
        success: true,
        data: { task },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// PUT /api/tasks/:id
TaskController.updateTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = {
        ...req.body,
        plannedDate: req.body.plannedDate ? new Date(req.body.plannedDate) : undefined
    };
    const task = await task_service_1.TaskService.updateTask(id, userId, updateData);
    res.json({
        success: true,
        data: { task },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// DELETE /api/tasks/:id
TaskController.deleteTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    await task_service_1.TaskService.deleteTask(id, userId);
    res.json({
        success: true,
        data: { message: 'Task deleted successfully' },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/tasks/:id/subtasks
TaskController.createSubtask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const subtaskData = req.body;
    const subtask = await task_service_1.TaskService.createSubtask(id, userId, subtaskData);
    res.status(201).json({
        success: true,
        data: { subtask },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// PUT /api/subtasks/:id
TaskController.updateSubtask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;
    const subtask = await task_service_1.TaskService.updateSubtask(id, userId, updateData);
    res.json({
        success: true,
        data: { subtask },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// DELETE /api/subtasks/:id
TaskController.deleteSubtask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    await task_service_1.TaskService.deleteSubtask(id, userId);
    res.json({
        success: true,
        data: { message: 'Subtask deleted successfully' },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/users/tasks
TaskController.getUserTasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const { status, limit } = req.query;
    const tasks = await task_service_1.TaskService.getUserTasks(userId, status, limit ? parseInt(limit) : undefined);
    res.json({
        success: true,
        data: { tasks },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// PUT /api/tasks/:id/status
TaskController.updateTaskStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const task = await task_service_1.TaskService.updateTask(id, userId, { status });
    res.json({
        success: true,
        data: { task },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// PUT /api/tasks/:id/assign
TaskController.assignTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { assigneeId } = req.body;
    const userId = req.user.userId;
    const task = await task_service_1.TaskService.updateTask(id, userId, { assigneeId });
    res.json({
        success: true,
        data: { task },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
//# sourceMappingURL=task.controller.js.map