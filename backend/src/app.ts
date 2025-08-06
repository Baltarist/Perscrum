import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { PORT, NODE_ENV, CORS_ORIGIN } from './config/constants';
// import { connectRedis } from './config/redis'; // Redis disabled for development
import prisma from './config/database';
import { globalRateLimit } from './middleware/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import { AIService } from './services/ai.service';
import { initializeSocketServer } from './sockets/socketServer';
import { HealthCheck } from './utils/healthCheck';

// Import routes
import apiRoutes from './routes/index';

const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? [CORS_ORIGIN] 
    : ['http://localhost:3000', 'http://localhost:5173'], // Include Vite dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for real-time test page
app.use('/test', express.static('public'));

// Rate limiting
app.use(globalRateLimit);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      uptime: process.uptime()
    }
  });
});

// Comprehensive health check endpoint
app.get('/health/detailed', async (req, res) => {
  try {
    const health = await HealthCheck.checkSystemHealth();
    
    res.status(health.overall === 'healthy' ? 200 : 503).json({
      success: health.overall === 'healthy',
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        type: 'HEALTH_CHECK_ERROR',
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// API routes
app.use('/api', apiRoutes);

// Route conflicts removed - routes are handled by apiRoutes from routes/index.ts

// Temporary test endpoint to verify database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({
      success: true,
      data: {
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
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
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Initialize AI Service
    if (process.env.AI_ENABLED === 'true') {
      try {
        AIService.initialize();
        console.log('🤖 AI Service initialized successfully');
      } catch (error) {
        console.error('⚠️ AI Service initialization failed:', error);
        console.log('🔧 AI features will be disabled. Set GEMINI_API_KEY in .env to enable.');
      }
    } else {
      console.log('⚠️ AI features disabled in configuration');
    }

    // Connect to Redis - disabled for development
    // await connectRedis();
    console.log('⚠️ Redis disabled for development');

    // Initialize Socket.io server
    const socketServer = initializeSocketServer(httpServer);
    console.log('⚡ Socket.io server initialized');

    // Start health monitoring
    HealthCheck.startHealthMonitoring(30000); // Every 30 seconds

    // Start server with robust error handling
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔍 Detailed Health: http://localhost:${PORT}/health/detailed`);
      console.log(`⚡ Socket.io: ws://localhost:${PORT}`);
      console.log(`🌐 Real-time Test: http://localhost:${PORT}/test/realtime-test.html`);
      console.log(`👥 Active users: ${socketServer.getActiveUsersCount()}`);
      console.log(`🔍 Health monitoring started`);
    });

    // Handle server errors
    httpServer.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Gracefully shutting down...');
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏳ Received SIGTERM, shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
  
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
export { httpServer };