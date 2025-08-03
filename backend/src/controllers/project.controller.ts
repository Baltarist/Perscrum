import { Request, Response } from 'express';
import { ProjectService, CreateProjectData, UpdateProjectData } from '../services/project.service';
import { RequestWithUser, TeamRole } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export class ProjectController {
  // GET /api/projects
  static getUserProjects = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user!.userId;
    
    const projects = await ProjectService.getUserProjects(userId);
    
    res.json({
      success: true,
      data: { projects },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/projects/:id
  static getProjectById = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const project = await ProjectService.getProjectById(id, userId);
    
    res.json({
      success: true,
      data: { project },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // POST /api/projects
  static createProject = asyncHandler(async (req: RequestWithUser, res: Response) => {
    console.log('🎯 ProjectController.createProject called');
    const userId = req.user!.userId;
    const projectData: CreateProjectData = req.body;
    
    console.log('🎯 Controller data:', { userId, projectData });
    
    const project = await ProjectService.createProject(userId, projectData);
    
    res.status(201).json({
      success: true,
      data: { project },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // PUT /api/projects/:id
  static updateProject = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const updateData: UpdateProjectData = req.body;
    
    const project = await ProjectService.updateProject(id, userId, updateData);
    
    res.json({
      success: true,
      data: { project },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // DELETE /api/projects/:id
  static deleteProject = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    await ProjectService.deleteProject(id, userId);
    
    res.json({
      success: true,
      data: { message: 'Project deleted successfully' },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // POST /api/projects/:id/complete
  static completeProject = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const project = await ProjectService.completeProject(id, userId);
    
    res.json({
      success: true,
      data: { project },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/projects/:id/stats
  static getProjectStats = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const stats = await ProjectService.getProjectStats(id, userId);
    
    res.json({
      success: true,
      data: { stats },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // POST /api/projects/:id/members
  static addTeamMember = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { email, role = 'member' }: { email: string; role?: TeamRole } = req.body;
    
    const teamMember = await ProjectService.addTeamMember(id, userId, email, role);
    
    res.status(201).json({
      success: true,
      data: { teamMember },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // DELETE /api/projects/:id/members/:memberId
  static removeTeamMember = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id, memberId } = req.params;
    const userId = req.user!.userId;
    
    await ProjectService.removeTeamMember(id, userId, memberId);
    
    res.json({
      success: true,
      data: { message: 'Team member removed successfully' },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/projects/:id/members
  static getTeamMembers = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const project = await ProjectService.getProjectById(id, userId);
    
    res.json({
      success: true,
      data: { teamMembers: project.teamMembers },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });
}