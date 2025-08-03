"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
// Apply authentication to all task routes
router.use(auth_middleware_1.authenticateToken);
router.use(rateLimit_middleware_1.globalRateLimit);
// Task CRUD routes
router.get('/:id', task_controller_1.TaskController.getTaskById);
router.put('/:id', (0, validation_middleware_1.validate)(validation_1.updateTaskSchema), task_controller_1.TaskController.updateTask);
router.delete('/:id', task_controller_1.TaskController.deleteTask);
// Task actions
router.put('/:id/status', task_controller_1.TaskController.updateTaskStatus);
router.put('/:id/assign', task_controller_1.TaskController.assignTask);
// Subtask routes
router.post('/:id/subtasks', (0, validation_middleware_1.validate)(validation_1.createSubtaskSchema), task_controller_1.TaskController.createSubtask);
exports.default = router;
//# sourceMappingURL=task.routes.js.map