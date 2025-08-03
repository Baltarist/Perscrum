import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { 
  createProjectSchema, 
  updateProjectSchema, 
  addTeamMemberSchema,
  createSprintSchema,
  createTaskSchema
} from '../utils/validation';
import { SprintController } from '../controllers/sprint.controller';
import { TaskController } from '../controllers/task.controller';
import { globalRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply authentication to all project routes
router.use(authenticateToken);
router.use(globalRateLimit);

// Project CRUD routes
router.get('/', ProjectController.getUserProjects);
router.post('/', validate(createProjectSchema), ProjectController.createProject);
router.get('/:id', ProjectController.getProjectById);
router.put('/:id', validate(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

// Project actions
router.post('/:id/complete', ProjectController.completeProject);
router.get('/:id/stats', ProjectController.getProjectStats);

// Team management
router.get('/:id/members', ProjectController.getTeamMembers);
router.post('/:id/members', validate(addTeamMemberSchema), ProjectController.addTeamMember);
router.delete('/:id/members/:memberId', ProjectController.removeTeamMember);

// Project sprints (nested routes)
router.get('/:projectId/sprints', SprintController.getProjectSprints);
router.post('/:projectId/sprints', validate(createSprintSchema), SprintController.createSprint);

// Project tasks (nested routes)  
router.get('/:projectId/sprints/:sprintId/tasks', TaskController.getSprintTasks);
router.post('/:projectId/sprints/:sprintId/tasks', validate(createTaskSchema), TaskController.createTask);

export default router;