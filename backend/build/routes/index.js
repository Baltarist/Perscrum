"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const project_routes_1 = __importDefault(require("./project.routes"));
const sprint_routes_1 = __importDefault(require("./sprint.routes"));
const task_routes_1 = __importDefault(require("./task.routes"));
const subtask_routes_1 = __importDefault(require("./subtask.routes"));
const ai_routes_1 = __importDefault(require("./ai.routes"));
const router = (0, express_1.Router)();
// API Routes
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/projects', project_routes_1.default);
router.use('/sprints', sprint_routes_1.default);
router.use('/tasks', task_routes_1.default);
router.use('/subtasks', subtask_routes_1.default);
router.use('/ai', ai_routes_1.default);
// Health check endpoint (alternative location)
router.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            version: '1.0.0'
        }
    });
});
// API info endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'Scrum Coach Backend API',
            version: '1.0.0',
            description: 'Kişisel Scrum Koçu AI - Backend API',
            endpoints: {
                auth: '/api/auth',
                users: '/api/users',
                projects: '/api/projects',
                sprints: '/api/sprints',
                tasks: '/api/tasks',
                ai: '/api/ai',
                health: '/api/health'
            },
            documentation: '/api/docs'
        }
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map