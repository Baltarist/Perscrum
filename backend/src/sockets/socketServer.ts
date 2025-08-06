import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import prisma from '../config/database';

/**
 * Socket.io Server - Real-time Communication
 * Handles live updates, notifications, and collaboration
 */
export class SocketServer {
  private io: SocketIOServer;
  private activeUsers: Map<string, { userId: string; userName: string; projectId?: string; sprintId?: string }> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware for socket connections
   */
  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        
        // Get user details
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, displayName: true, email: true }
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        // Attach user info to socket
        socket.data.user = {
          userId: user.id,
          userName: user.displayName,
          email: user.email
        };

        console.log(`✅ Socket authenticated: ${user.displayName} (${user.email})`);
        next();

      } catch (error) {
        console.error('❌ Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      console.log(`🔌 User connected: ${user.userName} (${socket.id})`);

      // Store active user
      this.activeUsers.set(socket.id, {
        userId: user.userId,
        userName: user.userName
      });

      // Handle joining project/sprint rooms
      socket.on('join_project', async (data: { projectId: string }) => {
        try {
          const { projectId } = data;
          
          // Verify user has access to project
          const project = await prisma.project.findFirst({
            where: {
              id: projectId,
              OR: [
                { ownerId: user.userId },
                { teamMembers: { some: { userId: user.userId } } }
              ]
            },
            select: { id: true, title: true }
          });

          if (!project) {
            socket.emit('error', { message: 'Project access denied' });
            return;
          }

          // Join project room
          const roomName = `project_${projectId}`;
          socket.join(roomName);
          
          // Update user's current project
          const activeUser = this.activeUsers.get(socket.id);
          if (activeUser) {
            activeUser.projectId = projectId;
            this.activeUsers.set(socket.id, activeUser);
          }

          console.log(`👥 ${user.userName} joined project: ${project.title}`);
          
          // Notify others in the room
          socket.to(roomName).emit('user_joined_project', {
            userId: user.userId,
            userName: user.userName,
            projectId,
            timestamp: new Date().toISOString()
          });

          // Send confirmation to user
          socket.emit('project_joined', {
            projectId,
            projectTitle: project.title,
            activeUsers: this.getActiveUsersInRoom(roomName)
          });

        } catch (error) {
          console.error('❌ Error joining project:', error);
          socket.emit('error', { message: 'Failed to join project' });
        }
      });

      // Handle joining sprint rooms
      socket.on('join_sprint', async (data: { projectId: string; sprintId: string }) => {
        try {
          const { projectId, sprintId } = data;
          
          // Verify access to sprint
          const sprint = await prisma.sprint.findFirst({
            where: {
              id: sprintId,
              projectId,
              project: {
                OR: [
                  { ownerId: user.userId },
                  { teamMembers: { some: { userId: user.userId } } }
                ]
              }
            },
            select: { id: true, goal: true, status: true }
          });

          if (!sprint) {
            socket.emit('error', { message: 'Sprint access denied' });
            return;
          }

          // Join sprint room
          const roomName = `sprint_${sprintId}`;
          socket.join(roomName);
          
          // Update user's current sprint
          const activeUser = this.activeUsers.get(socket.id);
          if (activeUser) {
            activeUser.sprintId = sprintId;
            this.activeUsers.set(socket.id, activeUser);
          }

          console.log(`🏃‍♂️ ${user.userName} joined sprint: ${sprint.goal}`);
          
          // Notify others in the room
          socket.to(roomName).emit('user_joined_sprint', {
            userId: user.userId,
            userName: user.userName,
            sprintId,
            timestamp: new Date().toISOString()
          });

          // Send confirmation to user
          socket.emit('sprint_joined', {
            sprintId,
            sprintGoal: sprint.goal,
            sprintStatus: sprint.status,
            activeUsers: this.getActiveUsersInRoom(roomName)
          });

        } catch (error) {
          console.error('❌ Error joining sprint:', error);
          socket.emit('error', { message: 'Failed to join sprint' });
        }
      });

      // Handle leaving rooms
      socket.on('leave_project', (data: { projectId: string }) => {
        const roomName = `project_${data.projectId}`;
        socket.leave(roomName);
        
        // Update user status
        const activeUser = this.activeUsers.get(socket.id);
        if (activeUser) {
          activeUser.projectId = undefined;
          this.activeUsers.set(socket.id, activeUser);
        }

        // Notify others
        socket.to(roomName).emit('user_left_project', {
          userId: user.userId,
          userName: user.userName,
          projectId: data.projectId,
          timestamp: new Date().toISOString()
        });

        console.log(`👋 ${user.userName} left project: ${data.projectId}`);
      });

      socket.on('leave_sprint', (data: { sprintId: string }) => {
        const roomName = `sprint_${data.sprintId}`;
        socket.leave(roomName);
        
        // Update user status
        const activeUser = this.activeUsers.get(socket.id);
        if (activeUser) {
          activeUser.sprintId = undefined;
          this.activeUsers.set(socket.id, activeUser);
        }

        // Notify others
        socket.to(roomName).emit('user_left_sprint', {
          userId: user.userId,
          userName: user.userName,
          sprintId: data.sprintId,
          timestamp: new Date().toISOString()
        });

        console.log(`👋 ${user.userName} left sprint: ${data.sprintId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${user.userName} (${socket.id})`);
        
        // Remove from active users
        this.activeUsers.delete(socket.id);
        
        // Notify all rooms about disconnection
        this.notifyUserDisconnected(socket, user);
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to Scrum Coach Real-time Server',
        userId: user.userId,
        userName: user.userName,
        timestamp: new Date().toISOString()
      });
    });

    console.log('✅ Socket.io server initialized with authentication');
  }

  /**
   * Get active users in a specific room
   */
  private getActiveUsersInRoom(roomName: string): any[] {
    const room = this.io.sockets.adapter.rooms.get(roomName);
    if (!room) return [];

    const users: any[] = [];
    for (const socketId of room) {
      const user = this.activeUsers.get(socketId);
      if (user) {
        users.push({
          userId: user.userId,
          userName: user.userName
        });
      }
    }
    return users;
  }

  /**
   * Notify rooms about user disconnection
   */
  private notifyUserDisconnected(socket: any, user: any): void {
    // Get all rooms the socket was in
    for (const roomName of socket.rooms) {
      if (roomName !== socket.id) { // Skip the default room (socket ID)
        socket.to(roomName).emit('user_disconnected', {
          userId: user.userId,
          userName: user.userName,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Broadcast task update to relevant rooms
   */
  public broadcastTaskUpdate(taskId: string, taskData: any, projectId: string, sprintId?: string): void {
    // Broadcast to project room
    this.io.to(`project_${projectId}`).emit('task_updated', {
      taskId,
      taskData,
      timestamp: new Date().toISOString()
    });

    // Broadcast to sprint room if specified
    if (sprintId) {
      this.io.to(`sprint_${sprintId}`).emit('task_updated', {
        taskId,
        taskData,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📋 Task update broadcasted: ${taskId}`);
  }

  /**
   * Broadcast notification to user
   */
  public broadcastNotification(userId: string, notification: any): void {
    // Find all sockets for this user
    for (const [socketId, user] of this.activeUsers) {
      if (user.userId === userId) {
        this.io.to(socketId).emit('notification', {
          ...notification,
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log(`🔔 Notification sent to user: ${userId}`);
  }

  /**
   * Broadcast sprint update to relevant rooms
   */
  public broadcastSprintUpdate(sprintId: string, sprintData: any, projectId: string): void {
    // Broadcast to both project and sprint rooms
    this.io.to(`project_${projectId}`).emit('sprint_updated', {
      sprintId,
      sprintData,
      timestamp: new Date().toISOString()
    });

    this.io.to(`sprint_${sprintId}`).emit('sprint_updated', {
      sprintId,
      sprintData,
      timestamp: new Date().toISOString()
    });

    console.log(`🏃‍♂️ Sprint update broadcasted: ${sprintId}`);
  }

  /**
   * Get server instance for external use
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Get active users count
   */
  public getActiveUsersCount(): number {
    return this.activeUsers.size;
  }

  /**
   * Get active users in a project
   */
  public getActiveUsersInProject(projectId: string): any[] {
    return this.getActiveUsersInRoom(`project_${projectId}`);
  }
}

// Export singleton instance
let socketServer: SocketServer | null = null;

export const initializeSocketServer = (httpServer: HTTPServer): SocketServer => {
  if (!socketServer) {
    socketServer = new SocketServer(httpServer);
    console.log('🚀 Socket.io server initialized');
  }
  return socketServer;
};

export const getSocketServer = (): SocketServer | null => {
  return socketServer;
};