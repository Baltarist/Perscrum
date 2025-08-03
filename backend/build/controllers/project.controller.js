"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const project_service_1 = require("../services/project.service");
const asyncHandler_1 = require("../utils/asyncHandler");
class ProjectController {
}
exports.ProjectController = ProjectController;
_a = ProjectController;
// GET /api/projects
ProjectController.getUserProjects = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const projects = await project_service_1.ProjectService.getUserProjects(userId);
    res.json({
        success: true,
        data: { projects },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/projects/:id
ProjectController.getProjectById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const project = await project_service_1.ProjectService.getProjectById(id, userId);
    res.json({
        success: true,
        data: { project },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/projects
ProjectController.createProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    console.log('🎯 ProjectController.createProject called');
    const userId = req.user.userId;
    const projectData = req.body;
    console.log('🎯 Controller data:', { userId, projectData });
    const project = await project_service_1.ProjectService.createProject(userId, projectData);
    res.status(201).json({
        success: true,
        data: { project },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// PUT /api/projects/:id
ProjectController.updateProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;
    const project = await project_service_1.ProjectService.updateProject(id, userId, updateData);
    res.json({
        success: true,
        data: { project },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// DELETE /api/projects/:id
ProjectController.deleteProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    await project_service_1.ProjectService.deleteProject(id, userId);
    res.json({
        success: true,
        data: { message: 'Project deleted successfully' },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/projects/:id/complete
ProjectController.completeProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const project = await project_service_1.ProjectService.completeProject(id, userId);
    res.json({
        success: true,
        data: { project },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/projects/:id/stats
ProjectController.getProjectStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const stats = await project_service_1.ProjectService.getProjectStats(id, userId);
    res.json({
        success: true,
        data: { stats },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// POST /api/projects/:id/members
ProjectController.addTeamMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const { email, role = 'member' } = req.body;
    const teamMember = await project_service_1.ProjectService.addTeamMember(id, userId, email, role);
    res.status(201).json({
        success: true,
        data: { teamMember },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// DELETE /api/projects/:id/members/:memberId
ProjectController.removeTeamMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id, memberId } = req.params;
    const userId = req.user.userId;
    await project_service_1.ProjectService.removeTeamMember(id, userId, memberId);
    res.json({
        success: true,
        data: { message: 'Team member removed successfully' },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
// GET /api/projects/:id/members
ProjectController.getTeamMembers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const project = await project_service_1.ProjectService.getProjectById(id, userId);
    res.json({
        success: true,
        data: { teamMembers: project.teamMembers },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
});
//# sourceMappingURL=project.controller.js.map