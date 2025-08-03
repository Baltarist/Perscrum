import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

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
        health: '/api/health'
      },
      documentation: '/api/docs'
    }
  });
});

export default router;