import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService, UserProfile, LoginRequest, RegisterRequest } from '../services/authService';
import { tokenManager, ApiError } from '../services/api';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; email?: string }) => Promise<boolean>;
  updateSettings: (settings: any) => Promise<boolean>;
  dailyCheckin: (mood?: string, notes?: string) => Promise<{ success: boolean; badge?: any }>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load user from token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenManager.getAccessToken();
      
      if (token && !tokenManager.isTokenExpired(token)) {
        try {
          const userData = await AuthService.getCurrentUser();
          setCurrentUser(userData);
        } catch (error) {
          console.error('Failed to load user:', error);
          tokenManager.clearTokens();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const userData = await AuthService.getUserProfile();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [currentUser]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    console.log('🔥 FRONTEND LOGIN: Starting login process...', { email });
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔥 FRONTEND: Calling AuthService.login...');
      const response = await AuthService.login({ email, password });
      console.log('🔥 FRONTEND: AuthService.login success!', { userEmail: response.user?.email });
      
      // Store tokens
      console.log('🔥 FRONTEND: Storing tokens...');
      tokenManager.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      console.log('🔥 FRONTEND: Tokens stored successfully');
      
      // Get full user profile
      console.log('🔥 FRONTEND: Getting user profile...');
      const userProfile = await AuthService.getUserProfile();
      setCurrentUser(userProfile);
      
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('❌ FRONTEND LOGIN: Error occurred!', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      if (error instanceof ApiError) {
        console.error('❌ ApiError details:', { message: error.message, status: error.status, type: error.type });
        setError(error.message);
      } else {
        console.error('❌ Non-ApiError:', error);
        setError('Login failed. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Register function
  const register = useCallback(async (email: string, password: string, displayName: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.register({ email, password, displayName });
      
      // Store tokens
      tokenManager.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      
      // Get full user profile
      const userProfile = await AuthService.getUserProfile();
      setCurrentUser(userProfile);
      
      navigate('/dashboard');
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      setCurrentUser(null);
      navigate('/login');
    }
  }, [navigate]);

  // Update profile
  const updateProfile = useCallback(async (data: { displayName?: string; email?: string }): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const response = await AuthService.updateProfile(data);
      setCurrentUser(response.user);
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to update profile');
      }
      return false;
    }
  }, [currentUser]);

  // Update settings
  const updateSettings = useCallback(async (settings: any): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const response = await AuthService.updateSettings(settings);
      setCurrentUser(prev => prev ? {
        ...prev,
        settings: response.settings
      } : null);
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to update settings');
      }
      return false;
    }
  }, [currentUser]);

  // Daily check-in
  const dailyCheckin = useCallback(async (mood?: string, notes?: string): Promise<{ success: boolean; badge?: any }> => {
    try {
      const response = await AuthService.dailyCheckin({ mood, notes });
      
      // Refresh user data to get updated checkin history
      await refreshUserData();
      
      return {
        success: true,
        badge: response.earnedBadge
      };
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Daily check-in failed');
      }
      return { success: false };
    }
  }, [refreshUserData]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await AuthService.markNotificationAsRead(notificationId);
      
      // Update notifications in current user
      setCurrentUser(prev => prev ? {
        ...prev,
        unreadNotifications: prev.unreadNotifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      } : null);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await AuthService.markAllNotificationsAsRead();
      
      // Update all notifications in current user
      setCurrentUser(prev => prev ? {
        ...prev,
        unreadNotifications: prev.unreadNotifications.map(n => ({ ...n, isRead: true }))
      } : null);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const value: AuthContextType = {
    currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateSettings,
    dailyCheckin,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshUserData,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthApi = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthApi must be used within an AuthProvider');
  }
  return context;
};