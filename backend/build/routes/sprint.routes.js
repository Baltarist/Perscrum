"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sprint_controller_1 = require("../controllers/sprint.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
// Apply authentication to all sprint routes
router.use(auth_middleware_1.authenticateToken);
router.use(rateLimit_middleware_1.globalRateLimit);
// Sprint CRUD routes
router.get('/:id', sprint_controller_1.SprintController.getSprintById);
router.put('/:id', (0, validation_middleware_1.validate)(validation_1.updateSprintSchema), sprint_controller_1.SprintController.updateSprint);
router.delete('/:id', sprint_controller_1.SprintController.deleteSprint);
// Sprint actions
router.post('/:id/start', sprint_controller_1.SprintController.startSprint);
router.post('/:id/complete', (0, validation_middleware_1.validate)(validation_1.completeSprintSchema), sprint_controller_1.SprintController.completeSprint);
router.get('/:id/stats', sprint_controller_1.SprintController.getSprintStats);
exports.default = router;
//# sourceMappingURL=sprint.routes.js.map