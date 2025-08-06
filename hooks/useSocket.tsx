import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socketService';

interface TaskUpdateData {
  action: 'created' | 'updated' | 'deleted';
  task?: any;
  changedFields?: string[];
  taskId?: string;
}

interface NotificationData {
  type: string;
  title: string;
  message: string;
  taskId?: string;
  projectId?: string;
}

interface UserPresenceData {
  userId: string;
  status: 'online' | 'offline';
  count?: number;
}

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [lastTaskUpdate, setLastTaskUpdate] = useState<TaskUpdateData | null>(null);
  const [lastNotification, setLastNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    // Connection status listener
    const unsubscribeConnection = socketService.onConnectionChange(setIsConnected);

    // Task update listener
    const unsubscribeTaskUpdate = socketService.onTaskUpdate((data) => {
      setLastTaskUpdate(data);
      console.log('🔄 Frontend: Task güncellendi', data);
    });

    // Notification listener
    const unsubscribeNotification = socketService.onNotification((data) => {
      setLastNotification(data);
      console.log('🔔 Frontend: Bildirim alındı', data);
      
      // Browser notification (opsiyonel)
      if (Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/favicon.ico'
        });
      }
    });

    // User presence listener
    const unsubscribeUserPresence = socketService.onUserPresence((data) => {
      if (data.count !== undefined) {
        setActiveUsers(data.count);
      }
      console.log('👥 Frontend: Kullanıcı durumu', data);
    });

    return () => {
      unsubscribeConnection();
      unsubscribeTaskUpdate();
      unsubscribeNotification();
      unsubscribeUserPresence();
    };
  }, []);

  const connect = useCallback(async (token?: string) => {
    try {
      await socketService.connect(token);
    } catch (error) {
      console.error('Socket bağlantı hatası:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  const joinProject = useCallback((projectId: string) => {
    socketService.joinProject(projectId);
  }, []);

  const leaveProject = useCallback((projectId: string) => {
    socketService.leaveProject(projectId);
  }, []);

  const joinSprint = useCallback((sprintId: string) => {
    socketService.joinSprint(sprintId);
  }, []);

  const leaveSprint = useCallback((sprintId: string) => {
    socketService.leaveSprint(sprintId);
  }, []);

  // Notification permission request
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  return {
    // State
    isConnected,
    activeUsers,
    lastTaskUpdate,
    lastNotification,
    
    // Actions
    connect,
    disconnect,
    joinProject,
    leaveProject,
    joinSprint,
    leaveSprint,
    requestNotificationPermission,
    
    // Utilities
    socketId: socketService.socketId
  };
};

export default useSocket;