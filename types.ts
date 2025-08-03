export enum TaskStatus {
  Backlog = 'Beklemede',
  Todo = 'Yapılacak',
  InProgress = 'Devam Ediyor',
  Review = 'Gözden Geçirme',
  Done = 'Tamamlandı',
}

export interface TeamMember {
  userId: string;
  role: 'Lider' | 'Geliştirici' | 'Üye';
}

export interface Notification {
  id: string;
  projectId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface StatusChange {
  changedBy: string; // userId
  from: TaskStatus;
  to: TaskStatus;
  timestamp: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdBy: string; // userId
  isAiAssisted?: boolean;
  assigneeId?: string;
}

export interface AIComment {
  id:string;
  text: string;
  type: 'suggestion' | 'reminder' | 'encouragement';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  storyPoints?: number;
  subtasks: Subtask[];
  aiComments?: AIComment[];
  notes?: string[];
  completedAt?: string;
  createdBy: string; // userId
  assigneeId?: string;
  isAiAssisted?: boolean;
  statusHistory: StatusChange[];
  plannedDate?: string; // YYYY-MM-DD
}

export interface AITaskSuggestion extends Omit<Task, 'subtasks' | 'aiComments' | 'notes' | 'createdBy' | 'statusHistory' | 'assigneeId' | 'plannedDate'> {
    suggestedSprintNumber: number;
    subtasks?: string[];
}

export interface ChatMessagePart {
  text: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: ChatMessagePart[];
}

export interface Sprint {
  id: string;
  sprintNumber: number;
  goal?: string;
  status: 'planning' | 'active' | 'completed';
  tasks: Task[];
  velocityPoints?: number;
  retrospective?: {
    good: string;
    improve: string;
  };
  startDate?: string;
  endDate?: string;
  chatHistory?: ChatMessage[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  sprints: Sprint[];
  colorTheme: string;
  targetCompletionDate: string;
  estimatedCompletionDate: string;
  totalSprints: number;
  sprintDurationWeeks: 1 | 2;
  teamMembers: TeamMember[];
}

export interface Badge {
    id: string;
    name: string;
    criteria: string;
    icon: string;
    type: "consistency" | "achievement" | "streak" | "planning";
}

export interface UserSettings {
    sprintDurationWeeks: 1 | 2;
    dailyCheckinEnabled: boolean;
    dailyCheckinTime: string; // "HH:MM" format
    retrospectiveEnabled: boolean;
    aiCoachName: string;
}

export interface PaymentMethod {
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    cardHolder: string;
}

export interface User {
    id: string;
    displayName: string;
    email: string;
    badges: string[];
    checkinHistory: string[];
    settings: UserSettings;
    notifications: Notification[];
    dailyFocusTaskId?: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
    aiUsageCount: number;
    paymentMethod?: PaymentMethod;
    subscriptionEndDate?: string;
}

export interface VelocityData {
    sprint: string;
    completedPoints: number;
}

export interface BurndownDataPoint {
    day: string;
    remaining: number;
    ideal: number;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'sprint' | 'check-in' | 'retrospective';
    colorTheme?: string;
    isFuture?: boolean;
}

export interface SprintReport {
    summary: string;
    achievements: string[];
    challenges: string[];
    recommendations: string[];
    acquiredSkills: string[];
}

export interface OverallReport {
    motivationalInsight: string;
    recurringStrengths: string[];
    developmentOpportunities: string[];
}

export interface EducationalContent {
    paidCourses: { title: string; url: string }[];
    freeVideos: { title: string; url: string }[];
    summaryArticle: string;
}
