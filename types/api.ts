// API Request/Response Types for Frontend

// Authentication
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
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      displayName: string;
      subscriptionTier: string;
      aiUsageCount: number;
      subscriptionEndDate?: string;
    };
  };
  error?: {
    type: string;
    message: string;
    field?: string;
  };
}

// User Profile
export interface UserProfileResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    displayName: string;
    subscriptionTier: string;
    aiUsageCount: number;
    subscriptionEndDate?: string;
    settings?: UserSettings;
    badges: any[];
    checkinHistory: any[];
    notifications: any[];
    dailyFocusTaskId?: string;
  };
  error?: {
    type: string;
    message: string;
  };
}

export interface UserSettings {
  sprintDurationWeeks: 1 | 2;
  dailyCheckinEnabled: boolean;
  dailyCheckinTime: string;
  retrospectiveEnabled: boolean;
  aiCoachName: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  email?: string;
}

export interface UpdateSettingsRequest {
  sprintDurationWeeks?: 1 | 2;
  dailyCheckinEnabled?: boolean;
  dailyCheckinTime?: string;
  retrospectiveEnabled?: boolean;
  aiCoachName?: string;
  dailyFocusTaskId?: string;
}

export interface UserSettingsResponse {
  success: boolean;
  data?: UserSettings;
  error?: {
    type: string;
    message: string;
  };
}

// Daily Check-in
export interface DailyCheckinRequest {
  mood: number;
  productivity: number;
  notes?: string;
}

export interface DailyCheckinResponse {
  success: boolean;
  data?: {
    checkin: any;
    earnedBadge?: any;
  };
  error?: {
    type: string;
    message: string;
  };
}

// Badges
export interface UserBadgesResponse {
  success: boolean;
  data?: any[];
  error?: {
    type: string;
    message: string;
  };
}

// Notifications
export interface NotificationsResponse {
  success: boolean;
  data?: {
    notifications: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: {
    type: string;
    message: string;
  };
}

export interface MarkNotificationReadRequest {
  notificationId: string;
}

// Password Update
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// User Stats
export interface UserStatsResponse {
  success: boolean;
  data?: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    badgesEarned: number;
    completionRate: number;
  };
  error?: {
    type: string;
    message: string;
  };
}

// Project Management APIs
export interface ProjectResponse {
  success: boolean;
  data?: {
    projects?: any[];
    project?: any;
    stats?: any;
  };
  error?: {
    type: string;
    message: string;
  };
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  targetCompletionDate?: string;
  totalSprints?: number;
  sprintDurationWeeks?: 1 | 2;
  colorTheme?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: 'active' | 'paused' | 'completed';
  colorTheme?: string;
  targetCompletionDate?: string;
  totalSprints?: number;
  sprintDurationWeeks?: 1 | 2;
}

// Sprint APIs
export interface SprintResponse {
  success: boolean;
  data?: {
    sprints?: any[];
    sprint?: any;
    stats?: any;
  };
  error?: {
    type: string;
    message: string;
  };
}

export interface CreateSprintRequest {
  goal: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSprintRequest {
  goal?: string;
  status?: 'planning' | 'active' | 'completed';
  velocityPoints?: number;
  retrospectiveGood?: string;
  retrospectiveImprove?: string;
}

// Task APIs
export interface TaskResponse {
  success: boolean;
  data?: {
    tasks?: any[];
    task?: any;
  };
  error?: {
    type: string;
    message: string;
  };
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  storyPoints?: number;
  assigneeId?: string;
  plannedDate?: string;
  notes?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  storyPoints?: number;
  assigneeId?: string;
  plannedDate?: string;
  notes?: string;
}