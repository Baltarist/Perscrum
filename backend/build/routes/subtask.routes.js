"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
// Apply authentication to all subtask routes
router.use(auth_middleware_1.authenticateToken);
router.use(rateLimit_middleware_1.globalRateLimit);
// Subtask routes
router.put('/:id', (0, validation_middleware_1.validate)(validation_1.updateSubtaskSchema), task_controller_1.TaskController.updateSubtask);
router.delete('/:id', task_controller_1.TaskController.deleteSubtask);
exports.default = router;
//# sourceMappingURL=subtask.routes.js.map