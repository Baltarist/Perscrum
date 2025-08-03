import { apiCall } from './api';
import apiClient from './api';

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
    aiUsageCount: number;
    subscriptionEndDate?: string;
    settings?: any;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  aiUsageCount: number;
  subscriptionEndDate?: string;
  createdAt: string;
  settings: {
    userId: string;
    sprintDurationWeeks: number;
    dailyCheckinEnabled: boolean;
    dailyCheckinTime: string;
    retrospectiveEnabled: boolean;
    aiCoachName: string;
    dailyFocusTaskId?: string;
  };
  badges: Array<{
    id: string;
    name: string;
    criteria: string;
    icon: string;
    type: string;
    earnedAt: string;
  }>;
  recentCheckins: Array<{
    id: string;
    date: string;
    mood?: string;
    notes?: string;
  }>;
  unreadNotifications: Array<{
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    project?: {
      id: string;
      title: string;
    };
  }>;
}

export interface UserStats {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
  };
  badges: number;
  checkinStreak: number;
}

// Auth Service
export class AuthService {
  // Register new user
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiCall(() => apiClient.post('/auth/register', data));
  }

  // Login user
  static async login(data: LoginRequest): Promise<AuthResponse> {
    console.log('🚀 AUTHSERVICE: Login called with:', { email: data.email });
    try {
      const result = await apiCall(() => apiClient.post('/auth/login', data));
      console.log('🚀 AUTHSERVICE: Login successful!', { userEmail: result.user?.email });
      return result;
    } catch (error) {
      console.error('🚀 AUTHSERVICE: Login failed!', error);
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<{ message: string }> {
    return apiCall(() => apiClient.post('/auth/logout'));
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; user: any }> {
    return apiCall(() => apiClient.post('/auth/refresh', { refreshToken }));
  }

  // Get current user
  static async getCurrentUser(): Promise<UserProfile> {
    return apiCall(() => apiClient.get('/auth/me'));
  }

  // Get detailed user profile
  static async getUserProfile(): Promise<UserProfile> {
    return apiCall(() => apiClient.get('/users/profile'));
  }

  // Update user profile
  static async updateProfile(data: { displayName?: string; email?: string }): Promise<{
    user: UserProfile;
  }> {
    return apiCall(() => apiClient.put('/users/profile', data));
  }

  // Get user settings
  static async getSettings(): Promise<UserProfile['settings']> {
    return apiCall(() => apiClient.get('/users/settings'));
  }

  // Update user settings
  static async updateSettings(settings: {
    sprintDurationWeeks?: 1 | 2;
    dailyCheckinEnabled?: boolean;
    dailyCheckinTime?: string;
    retrospectiveEnabled?: boolean;
    aiCoachName?: string;
    dailyFocusTaskId?: string;
  }): Promise<{ settings: UserProfile['settings'] }> {
    return apiCall(() => apiClient.put('/users/settings', settings));
  }

  // Daily check-in
  static async dailyCheckin(data: { mood?: string; notes?: string }): Promise<{
    checkin: any;
    earnedBadge?: any;
  }> {
    return apiCall(() => apiClient.post('/users/checkin', data));
  }

  // Get user badges
  static async getBadges(): Promise<{ badges: UserProfile['badges'] }> {
    return apiCall(() => apiClient.get('/users/badges'));
  }

  // Get user notifications
  static async getNotifications(page = 1, limit = 20): Promise<{
    notifications: UserProfile['unreadNotifications'];
  }> {
    return apiCall(() => apiClient.get(`/users/notifications?page=${page}&limit=${limit}`));
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<{ notification: any }> {
    return apiCall(() => apiClient.put(`/users/notifications/${notificationId}/read`));
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead(): Promise<{ message: string }> {
    return apiCall(() => apiClient.put('/users/notifications/read-all'));
  }

  // Get user stats
  static async getUserStats(): Promise<{ stats: UserStats }> {
    return apiCall(() => apiClient.get('/users/stats'));
  }

  // Update password
  static async updatePassword(data: { 
    currentPassword: string; 
    newPassword: string; 
  }): Promise<{ message: string }> {
    return apiCall(() => apiClient.put('/users/password', data));
  }
}