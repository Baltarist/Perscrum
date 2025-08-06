import prisma from '../config/database';
import { getSocketServer } from '../sockets/socketServer';

/**
 * Comprehensive Health Check Utility
 * Monitors database, Socket.io, and AI services
 */
export class HealthCheck {
  
  /**
   * Check database connectivity
   */
  static async checkDatabase(): Promise<{ status: string; details?: any }> {
    try {
      await prisma.$connect();
      
      // Test a simple query
      const userCount = await prisma.user.count();
      
      return {
        status: 'healthy',
        details: {
          connected: true,
          userCount,
          lastCheck: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Check Socket.io server status
   */
  static async checkSocketServer(): Promise<{ status: string; details?: any }> {
    try {
      const socketServer = getSocketServer();
      
      if (!socketServer) {
        return {
          status: 'unhealthy',
          details: {
            initialized: false,
            activeUsers: 0,
            lastCheck: new Date().toISOString()
          }
        };
      }

      const activeUsers = socketServer.getActiveUsersCount();
      
      return {
        status: 'healthy',
        details: {
          initialized: true,
          activeUsers,
          lastCheck: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Socket.io health check failed:', error);
      return {
        status: 'unhealthy',
        details: {
          initialized: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Check AI service status
   */
  static async checkAIService(): Promise<{ status: string; details?: any }> {
    try {
      const aiEnabled = process.env.AI_ENABLED === 'true';
      const hasApiKey = !!process.env.GEMINI_API_KEY && 
        process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here';

      if (!aiEnabled) {
        return {
          status: 'disabled',
          details: {
            enabled: false,
            reason: 'AI_ENABLED is false',
            lastCheck: new Date().toISOString()
          }
        };
      }

      if (!hasApiKey) {
        return {
          status: 'unhealthy',
          details: {
            enabled: true,
            hasValidApiKey: false,
            reason: 'Invalid or missing GEMINI_API_KEY',
            lastCheck: new Date().toISOString()
          }
        };
      }

      return {
        status: 'healthy',
        details: {
          enabled: true,
          hasValidApiKey: true,
          lastCheck: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ AI service health check failed:', error);
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Comprehensive system health check
   */
  static async checkSystemHealth(): Promise<{
    overall: string;
    services: {
      database: any;
      socketio: any;
      ai: any;
    };
    uptime: number;
    timestamp: string;
  }> {
    const [database, socketio, ai] = await Promise.all([
      this.checkDatabase(),
      this.checkSocketServer(),
      this.checkAIService()
    ]);

    // Determine overall health
    const criticalServices = [database, socketio];
    const hasUnhealthyService = criticalServices.some(service => service.status === 'unhealthy');
    
    const overall = hasUnhealthyService ? 'unhealthy' : 'healthy';

    return {
      overall,
      services: {
        database,
        socketio,
        ai
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Monitor system and restart if needed
   */
  static async monitorAndRestart(): Promise<void> {
    try {
      const health = await this.checkSystemHealth();
      
      if (health.overall === 'unhealthy') {
        console.warn('⚠️ System health check failed:', health);
        
        // Log critical issues
        if (health.services.database.status === 'unhealthy') {
          console.error('🗄️ Database connection failed - attempting reconnect...');
          try {
            await prisma.$disconnect();
            await prisma.$connect();
            console.log('✅ Database reconnected successfully');
          } catch (reconnectError) {
            console.error('❌ Database reconnection failed:', reconnectError);
          }
        }
      } else {
        console.log('✅ System health check passed');
      }
    } catch (error) {
      console.error('❌ Health monitoring error:', error);
    }
  }

  /**
   * Start periodic health monitoring
   */
  static startHealthMonitoring(intervalMs = 30000): void {
    console.log(`🔍 Starting health monitoring (every ${intervalMs / 1000}s)`);
    
    setInterval(async () => {
      await this.monitorAndRestart();
    }, intervalMs);

    // Initial health check
    setTimeout(async () => {
      await this.monitorAndRestart();
    }, 5000);
  }
}