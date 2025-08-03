"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
// Apply authentication to all AI routes
router.use(auth_middleware_1.authenticateToken);
router.use(rateLimit_middleware_1.globalRateLimit);
/**
 * AI Routes - Phase 3 Implementation
 * All routes require authentication and are rate-limited
 */
// Health check endpoint
router.get('/health', ai_controller_1.AIController.healthCheck);
// Usage statistics endpoint
router.get('/usage-stats', ai_controller_1.AIController.getUsageStats);
// Task suggestions endpoint
router.post('/task-suggestions', (0, validation_middleware_1.validate)(validation_1.aiTaskSuggestionsSchema), ai_controller_1.AIController.generateTaskSuggestions);
// AI chat endpoint
router.post('/chat', (0, validation_middleware_1.validate)(validation_1.aiChatSchema), ai_controller_1.AIController.processChat);
// Subtask suggestions endpoint
router.post('/subtask-suggestions', (0, validation_middleware_1.validate)(validation_1.aiSubtaskSuggestionsSchema), ai_controller_1.AIController.generateSubtaskSuggestions);
// Sprint retrospective analysis endpoint
router.post('/sprint-analysis', (0, validation_middleware_1.validate)(zod_1.z.object({
    sprintId: zod_1.z.string().uuid('sprintId must be a valid UUID')
})), ai_controller_1.AIController.analyzeSprintRetrospective);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map