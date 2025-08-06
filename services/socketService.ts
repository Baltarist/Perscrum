import { io, Socket } from 'socket.io-client';
import { tokenManager } from './api';

interface NotificationData {
  type: string;
  title: string;
  message: string;
  taskId?: string;
  projectId?: string;
}

interface TaskUpdateData {
  action: 'created' | 'updated' | 'deleted';
  task?: any;
  changedFields?: string[];
  taskId?: string;
}

interface UserPresenceData {
  userId: string;
  status: 'online' | 'offline';
  count?: number;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  // Event listeners
  private taskUpdateListeners: ((data: TaskUpdateData) => void)[] = [];
  private notificationListeners: ((data: NotificationData) => void)[] = [];
  private userPresenceListeners: ((data: UserPresenceData) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const authToken = token || tokenManager.getAccessToken();
      
      if (!authToken) {
        reject(new Error('No authentication token available'));
        return;
      }

      this.socket = io('http://localhost:5000', {
        auth: {
          token: authToken
        },
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        console.log('🔌 Socket.io bağlandı!');
        this.isConnected = true;
        this.notifyConnectionListeners(true);
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Socket.io bağlantısı kesildi');
        this.isConnected = false;
        this.notifyConnectionListeners(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔌 Socket.io bağlantı hatası:', error);
        this.isConnected = false;
        this.notifyConnectionListeners(false);
        reject(error);
      });

      // Real-time event listeners
      this.socket.on('task_updated', (data: TaskUpdateData) => {
        console.log('📋 Task güncellendi:', data);
        this.notifyTaskUpdateListeners(data);
      });

      this.socket.on('notification', (data: NotificationData) => {
        console.log('🔔 Bildirim alındı:', data);
        this.notifyNotificationListeners(data);
      });

      this.socket.on('user_presence_update', (data: UserPresenceData) => {
        console.log('👥 Kullanıcı durumu güncellendi:', data);
        this.notifyUserPresenceListeners(data);
      });

      this.socket.on('connected', (data) => {
        console.log('🎉 Hoş geldiniz!', data);
      });

      this.socket.on('joined_project', (data) => {
        console.log('🏠 Projeye katıldı:', data.projectId);
      });

              this.socket.on('joined_sprint', (data) => {
          console.log('🏃 Sprint\'e katıldı:', data.sprintId);
        });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.notifyConnectionListeners(false);
    }
  }

  // Project & Sprint actions
  joinProject(projectId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_project', projectId);
      console.log('🏠 Projeye katılıyor:', projectId);
    }
  }

  leaveProject(projectId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_project', projectId);
      console.log('🏠 Projeden ayrılıyor:', projectId);
    }
  }

  joinSprint(sprintId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_sprint', sprintId);
      console.log('🏃 Sprint\'e katılıyor:', sprintId);
    }
  }

  leaveSprint(sprintId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_sprint', sprintId);
      console.log('🏃 Sprint\'ten ayrılıyor:', sprintId);
    }
  }

  // Event listener management
  onTaskUpdate(callback: (data: TaskUpdateData) => void): () => void {
    this.taskUpdateListeners.push(callback);
    return () => {
      const index = this.taskUpdateListeners.indexOf(callback);
      if (index > -1) {
        this.taskUpdateListeners.splice(index, 1);
      }
    };
  }

  onNotification(callback: (data: NotificationData) => void): () => void {
    this.notificationListeners.push(callback);
    return () => {
      const index = this.notificationListeners.indexOf(callback);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  onUserPresence(callback: (data: UserPresenceData) => void): () => void {
    this.userPresenceListeners.push(callback);
    return () => {
      const index = this.userPresenceListeners.indexOf(callback);
      if (index > -1) {
        this.userPresenceListeners.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  // Private notification methods
  private notifyTaskUpdateListeners(data: TaskUpdateData): void {
    this.taskUpdateListeners.forEach(listener => listener(data));
  }

  private notifyNotificationListeners(data: NotificationData): void {
    this.notificationListeners.forEach(listener => listener(data));
  }

  private notifyUserPresenceListeners(data: UserPresenceData): void {
    this.userPresenceListeners.forEach(listener => listener(data));
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get socketId(): string | null {
    return this.socket?.id || null;
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;