"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const sprint_controller_1 = require("../controllers/sprint.controller");
const task_controller_1 = require("../controllers/task.controller");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
// Apply authentication to all project routes
router.use(auth_middleware_1.authenticateToken);
router.use(rateLimit_middleware_1.globalRateLimit);
// Project CRUD routes
router.get('/', project_controller_1.ProjectController.getUserProjects);
router.post('/', (0, validation_middleware_1.validate)(validation_1.createProjectSchema), project_controller_1.ProjectController.createProject);
router.get('/:id', project_controller_1.ProjectController.getProjectById);
router.put('/:id', (0, validation_middleware_1.validate)(validation_1.updateProjectSchema), project_controller_1.ProjectController.updateProject);
router.delete('/:id', project_controller_1.ProjectController.deleteProject);
// Project actions
router.post('/:id/complete', project_controller_1.ProjectController.completeProject);
router.get('/:id/stats', project_controller_1.ProjectController.getProjectStats);
// Team management
router.get('/:id/members', project_controller_1.ProjectController.getTeamMembers);
router.post('/:id/members', (0, validation_middleware_1.validate)(validation_1.addTeamMemberSchema), project_controller_1.ProjectController.addTeamMember);
router.delete('/:id/members/:memberId', project_controller_1.ProjectController.removeTeamMember);
// Project sprints (nested routes)
router.get('/:projectId/sprints', sprint_controller_1.SprintController.getProjectSprints);
router.post('/:projectId/sprints', (0, validation_middleware_1.validate)(validation_1.createSprintSchema), sprint_controller_1.SprintController.createSprint);
// Project tasks (nested routes)  
router.get('/:projectId/sprints/:sprintId/tasks', task_controller_1.TaskController.getSprintTasks);
router.post('/:projectId/sprints/:sprintId/tasks', (0, validation_middleware_1.validate)(validation_1.createTaskSchema), task_controller_1.TaskController.createTask);
exports.default = router;
//# sourceMappingURL=project.routes.js.map