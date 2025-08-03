import { Response } from 'express';
import { SprintService, CreateSprintData, UpdateSprintData } from '../services/sprint.service';
import { RequestWithUser } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export class SprintController {
  // GET /api/projects/:projectId/sprints
  static getProjectSprints = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!.userId;
    
    const sprints = await SprintService.getProjectSprints(projectId, userId);
    
    res.json({
      success: true,
      data: { sprints },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // GET /api/sprints/:id
  static getSprintById = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const sprint = await SprintService.getSprintById(id, userId);
    
    res.json({
      success: true,
      data: { sprint },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // POST /api/projects/:projectId/sprints
  static createSprint = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!.userId;
    const sprintData: CreateSprintData = {
      ...req.body,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate)
    };
    
    const sprint = await SprintService.createSprint(projectId, userId, sprintData);
    
    res.status(201).json({
      success: true,
      data: { sprint },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // PUT /api/sprints/:id
  static updateSprint = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const updateData: UpdateSprintData = req.body;
    
    const sprint = await SprintService.updateSprint(id, userId, updateData);
    
    res.json({
      success: true,
      data: { sprint },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // POST /api/sprints/:id/start
  static startSprint = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const sprint = await SprintService.startSprint(id, userId);
    
    res.json({
      success: true,
      data: { sprint },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // POST /api/sprints/:id/complete
  static completeSprint = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { retrospectiveGood, retrospectiveImprove } = req.body;
    
    const sprint = await SprintService.completeSprint(id, userId, {
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
  static getSprintStats = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const stats = await SprintService.getSprintStats(id, userId);
    
    res.json({
      success: true,
      data: { stats },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // DELETE /api/sprints/:id
  static deleteSprint = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    await SprintService.deleteSprint(id, userId);
    
    res.json({
      success: true,
      data: { message: 'Sprint deleted successfully' },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });
}