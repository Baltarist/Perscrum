import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { 
  updateSubtaskSchema 
} from '../utils/validation';
import { globalRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply authentication to all subtask routes
router.use(authenticateToken);
router.use(globalRateLimit);

// Subtask CRUD routes
router.put('/:id', validate(updateSubtaskSchema), TaskController.updateSubtask);
router.delete('/:id', TaskController.deleteSubtask);

export default router;