import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserSettings, Notification, PaymentMethod } from '../types';
import { MOCK_USER_DATA } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  updateSubscription: (tier: 'free' | 'pro' | 'enterprise', billingCycle: 'monthly' | 'yearly') => void;
  updatePaymentMethod: (paymentMethod: PaymentMethod) => void;
  incrementAIUsage: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  getUserById: (id: string) => User | undefined;
  getAllUsers: () => User[];
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  setDailyFocusTask: (taskId?: string) => void;
  findUserByEmail: (email: string) => User | undefined;
  addUser: (email: string) => User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
        return MOCK_USER_DATA[storedUserId]?.user || null;
    }
    return null;
  });
  const navigate = useNavigate();

  const updateUserInMockData = (user: User) => {
      if(MOCK_USER_DATA[user.id]) {
          MOCK_USER_DATA[user.id].user = user;
      }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    const userEntry = Object.values(MOCK_USER_DATA).find(data => data.user.email === email);
    
    if (userEntry) {
      setCurrentUser(userEntry.user);
      localStorage.setItem('userId', userEntry.user.id);
      navigate('/dashboard');
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('userId');
    navigate('/login');
  };
  
  const updateUserSettings = (settings: Partial<UserSettings>) => {
    if (!currentUser) return;
    const updatedUser = {
        ...currentUser,
        settings: {
            ...currentUser.settings,
            ...settings
        }
    };
    setCurrentUser(updatedUser);
    updateUserInMockData(updatedUser);
  };
  
  const updateSubscription = (tier: 'free' | 'pro' | 'enterprise', billingCycle: 'monthly' | 'yearly') => {
    if (!currentUser) return;
    const daysToAdd = billingCycle === 'yearly' ? 365 : 30;
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    const updatedUser = {
        ...currentUser,
        subscriptionTier: tier,
        subscriptionEndDate: tier === 'free' ? undefined : newEndDate.toISOString().split('T')[0],
    };
    setCurrentUser(updatedUser);
    updateUserInMockData(updatedUser);
  };
  
  const updatePaymentMethod = (paymentMethod: PaymentMethod) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, paymentMethod };
    setCurrentUser(updatedUser);
    updateUserInMockData(updatedUser);
  };
  
  const incrementAIUsage = () => {
    if (!currentUser || currentUser.subscriptionTier !== 'free') return;
    const updatedUser = { ...currentUser, aiUsageCount: currentUser.aiUsageCount + 1 };
    setCurrentUser(updatedUser);
    updateUserInMockData(updatedUser);
  };

  const markNotificationAsRead = (notificationId: string) => {
    if (!currentUser) return;
    const updatedNotifications = currentUser.notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
    );
    const updatedUser = { ...currentUser, notifications: updatedNotifications };
    setCurrentUser(updatedUser);
    updateUserInMockData(updatedUser);
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    const updatedNotifications = currentUser.notifications.map(n => ({ ...n, isRead: true }));
    const updatedUser = { ...currentUser, notifications: updatedNotifications };
    setCurrentUser(updatedUser);
    updateUserInMockData(updatedUser);
  };
  
  const setDailyFocusTask = (taskId?: string) => {
      if(!currentUser) return;
      const updatedUser = { ...currentUser, dailyFocusTaskId: taskId };
      setCurrentUser(updatedUser);
      updateUserInMockData(updatedUser);
  }

  const getUserById = (id: string): User | undefined => {
    return Object.values(MOCK_USER_DATA).find(ud => ud.user.id === id)?.user;
  };
  
  const findUserByEmail = (email: string): User | undefined => {
    return Object.values(MOCK_USER_DATA).find(ud => ud.user.email.toLowerCase() === email.toLowerCase())?.user;
  }

  const addUser = (email: string): User => {
      const newId = `user-${Date.now()}`;
      const newUser: User = {
        id: newId,
        displayName: email.split('@')[0],
        email,
        subscriptionTier: 'free',
        aiUsageCount: 0,
        badges: [],
        checkinHistory: [],
        settings: {
            sprintDurationWeeks: 1,
            dailyCheckinEnabled: true,
            dailyCheckinTime: '09:00',
            retrospectiveEnabled: true,
            aiCoachName: 'Koç'
        },
        notifications: [],
      };
      
      MOCK_USER_DATA[newId] = {
          user: newUser,
          projects: [],
          velocityData: []
      };
      
      return newUser;
  }

  const getAllUsers = (): User[] => {
    return Object.values(MOCK_USER_DATA).map(ud => ud.user);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout, updateUserSettings, getUserById, getAllUsers, markNotificationAsRead, markAllNotificationsAsRead, setDailyFocusTask, findUserByEmail, addUser, incrementAIUsage, updateSubscription, updatePaymentMethod }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};