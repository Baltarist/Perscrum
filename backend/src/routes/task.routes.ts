import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { 
  createTaskSchema, 
  updateTaskSchema,
  createSubtaskSchema,
  updateSubtaskSchema
} from '../utils/validation';
import { globalRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply authentication to all task routes
router.use(authenticateToken);
router.use(globalRateLimit);

// Task CRUD routes
router.get('/:id', TaskController.getTaskById);
router.put('/:id', validate(updateTaskSchema), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

// Task actions
router.put('/:id/status', TaskController.updateTaskStatus);
router.put('/:id/assign', TaskController.assignTask);

// Subtask routes
router.post('/:id/subtasks', validate(createSubtaskSchema), TaskController.createSubtask);

export default router;