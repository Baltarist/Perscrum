import { Router } from 'express';
import { SprintController } from '../controllers/sprint.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { 
  createSprintSchema, 
  updateSprintSchema, 
  completeSprintSchema 
} from '../utils/validation';
import { globalRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply authentication to all sprint routes
router.use(authenticateToken);
router.use(globalRateLimit);

// Sprint CRUD routes
router.get('/:id', SprintController.getSprintById);
router.put('/:id', validate(updateSprintSchema), SprintController.updateSprint);
router.delete('/:id', SprintController.deleteSprint);

// Sprint actions
router.post('/:id/start', SprintController.startSprint);
router.post('/:id/complete', validate(completeSprintSchema), SprintController.completeSprint);
router.get('/:id/stats', SprintController.getSprintStats);

export default router;