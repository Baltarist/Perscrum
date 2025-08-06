import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all analytics routes
router.use(authenticateToken);

// Velocity tracking routes
router.get('/velocity/:projectId', AnalyticsController.getProjectVelocity);
router.get('/velocity/user/:userId', AnalyticsController.getUserVelocity);

// Burndown chart routes
router.get('/burndown/:sprintId', AnalyticsController.getSprintBurndown);

// Sprint analytics routes
router.post('/sprint/:sprintId/calculate', AnalyticsController.calculateSprintAnalytics);
router.get('/sprint/:sprintId/metrics', AnalyticsController.getSprintMetrics);

// Project analytics routes
router.get('/project/:projectId', AnalyticsController.getProjectAnalytics);
router.post('/recalculate/:projectId', AnalyticsController.recalculateProjectAnalytics);

// Dashboard routes
router.get('/dashboard/:userId', AnalyticsController.getAnalyticsDashboard);

export default router;