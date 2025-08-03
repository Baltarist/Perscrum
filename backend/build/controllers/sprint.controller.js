"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SprintController = void 0;
const sprint_service_1 = require("../services/sprint.service");
const asyncHandler_1 = require("../utils/asyncHandler");
class SprintController {
}
exports.SprintController = SprintController;
_a = SprintController;
// GET /api/projects/:projectId/sprints
SprintController.getProjectSprints = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const sprints = await sprint_service_1.SprintService.getProjectSprints(projectId, userId);
    res.json({
        success: true,
        data: { sprints },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/sprints/:id
SprintController.getSprintById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const sprint = await sprint_service_1.SprintService.getSprintById(id, userId);
    res.json({
        success: true,
        data: { sprint },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/projects/:projectId/sprints
SprintController.createSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const sprintData = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate)
    };
    const sprint = await sprint_service_1.SprintService.createSprint(projectId, userId, sprintData);
    res.status(201).json({
        success: true,
        data: { sprint },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// PUT /api/sprints/:id
SprintController.updateSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;
    const sprint = await sprint_service_1.SprintService.updateSprint(id, userId, updateData);
    res.json({
        success: true,
        data: { sprint },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/sprints/:id/start
SprintController.startSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const sprint = await sprint_service_1.SprintService.startSprint(id, userId);
    res.json({
        success: true,
        data: { sprint },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/sprints/:id/complete
SprintController.completeSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const { retrospectiveGood, retrospectiveImprove } = req.body;
    const sprint = await sprint_service_1.SprintService.completeSprint(id, userId, {
        good: retrospectiveGood,
        improve: retrospectiveImprove
    });
    res.json({
        success: true,
        data: { sprint },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/sprints/:id/stats
SprintController.getSprintStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const stats = await sprint_service_1.SprintService.getSprintStats(id, userId);
    res.json({
        success: true,
        data: { stats },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// DELETE /api/sprints/:id
SprintController.deleteSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    await sprint_service_1.SprintService.deleteSprint(id, userId);
    res.json({
        success: true,
        data: { message: 'Sprint deleted successfully' },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
//# sourceMappingURL=sprint.controller.js.map