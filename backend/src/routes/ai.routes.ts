import { Router } from 'express';
import { z } from 'zod';
import { AIController } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { 
  aiTaskSuggestionsSchema, 
  aiChatSchema, 
  aiSubtaskSuggestionsSchema,
  aiEducationalContentSchema 
} from '../utils/validation';
import { globalRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply authentication to all AI routes
router.use(authenticateToken);
router.use(globalRateLimit);

/**
 * AI Routes - Phase 3 Implementation
 * All routes require authentication and are rate-limited
 */

// Health check endpoint
router.get('/health', AIController.healthCheck);

// Usage statistics endpoint
router.get('/usage-stats', AIController.getUsageStats);

// Task suggestions endpoint
router.post(
  '/task-suggestions',
  validate(aiTaskSuggestionsSchema),
  AIController.generateTaskSuggestions
);

// AI chat endpoint
router.post(
  '/chat',
  validate(aiChatSchema),
  AIController.processChat
);

// Subtask suggestions endpoint
router.post(
  '/subtask-suggestions',
  validate(aiSubtaskSuggestionsSchema),
  AIController.generateSubtaskSuggestions
);

// Sprint retrospective analysis endpoint
router.post(
  '/sprint-analysis',
  validate(z.object({
    sprintId: z.string().uuid('sprintId must be a valid UUID')
  })),
  AIController.analyzeSprintRetrospective
);

// Educational content endpoint
router.post(
  '/educational-content',
  validate(aiEducationalContentSchema),
  AIController.generateEducationalContent
);

// AI Context Enhancement endpoints
router.get('/learning-profile', AIController.getLearningProfile);
router.post(
  '/learning-feedback', 
  validate(z.object({
    topic: z.string().min(3),
    performance: z.enum(['good', 'fair', 'poor'])
  })),
  AIController.provideLearningFeedback
);
router.get('/interaction-history', AIController.getInteractionHistory);
router.get('/project-analytics/:projectId', AIController.getProjectAnalytics);

export default router;