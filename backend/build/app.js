"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const constants_1 = require("./config/constants");
// import { connectRedis } from './config/redis'; // Redis disabled for development
const database_1 = __importDefault(require("./config/database"));
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const ai_service_1 = require("./services/ai.service");
// Import routes
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: constants_1.NODE_ENV === 'production'
        ? [constants_1.CORS_ORIGIN]
        : ['http://localhost:3000', 'http://localhost:5173'], // Include Vite dev server
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting
app.use(rateLimit_middleware_1.globalRateLimit);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: constants_1.NODE_ENV,
            uptime: process.uptime()
        }
    });
});
// API routes
app.use('/api', index_1.default);
// Future API routes (to be implemented)
app.use('/api/projects', (req, res) => {
    res.json({
        success: true,
        message: 'Project routes will be implemented in Phase 2',
        phase: 'Phase 2 - Core Features'
    });
});
app.use('/api/sprints', (req, res) => {
    res.json({
        success: true,
        message: 'Sprint routes will be implemented in Phase 2',
        phase: 'Phase 2 - Core Features'
    });
});
app.use('/api/tasks', (req, res) => {
    res.json({
        success: true,
        message: 'Task routes will be implemented in Phase 2',
        phase: 'Phase 2 - Core Features'
    });
});
// Temporary test endpoint to verify database connection
app.get('/api/test-db', async (req, res) => {
    try {
        await database_1.default.$connect();
        res.json({
            success: true,
            data: {
                message: 'Database connection successful',
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                type: 'DATABASE_ERROR',
                message: 'Database connection failed'
            }
        });
    }
});
// 404 handler for undefined routes
app.use(errorHandler_middleware_1.notFoundHandler);
// Global error handler (must be last)
app.use(errorHandler_middleware_1.errorHandler);
// Database connection and server startup
const startServer = async () => {
    try {
        // Connect to database
        await database_1.default.$connect();
        console.log('✅ Database connected successfully');
        // Initialize AI Service
        if (process.env.AI_ENABLED === 'true') {
            try {
                ai_service_1.AIService.initialize();
                console.log('🤖 AI Service initialized successfully');
            }
            catch (error) {
                console.error('⚠️ AI Service initialization failed:', error);
                console.log('🔧 AI features will be disabled. Set GEMINI_API_KEY in .env to enable.');
            }
        }
        else {
            console.log('⚠️ AI features disabled in configuration');
        }
        // Connect to Redis - disabled for development
        // await connectRedis();
        console.log('⚠️ Redis disabled for development');
        // Start server
        app.listen(constants_1.PORT, () => {
            console.log(`🚀 Server running on port ${constants_1.PORT} in ${constants_1.NODE_ENV} mode`);
            console.log(`📚 API Documentation: http://localhost:${constants_1.PORT}/api/docs`);
            console.log(`🏥 Health Check: http://localhost:${constants_1.PORT}/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏳ Gracefully shutting down...');
    try {
        await database_1.default.$disconnect();
        console.log('✅ Database disconnected');
    }
    catch (error) {
        console.error('❌ Error disconnecting from database:', error);
    }
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n⏳ Received SIGTERM, shutting down gracefully...');
    try {
        await database_1.default.$disconnect();
        console.log('✅ Database disconnected');
    }
    catch (error) {
        console.error('❌ Error disconnecting from database:', error);
    }
    process.exit(0);
});
// Start the server
if (require.main === module) {
    startServer();
}
exports.default = app;
//# sourceMappingURL=app.js.map