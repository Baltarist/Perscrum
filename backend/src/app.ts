import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PORT, NODE_ENV, CORS_ORIGIN } from './config/constants';
// import { connectRedis } from './config/redis'; // Redis disabled for development
import prisma from './config/database';
import { globalRateLimit } from './middleware/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import { AIService } from './services/ai.service';

// Import routes
import apiRoutes from './routes/index';

const app = express();

// Security middleware
app.use(helmet({
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

// Rate limiting
app.use(globalRateLimit);

// Health check endpoint
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

// API routes
app.use('/api', apiRoutes);

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

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
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