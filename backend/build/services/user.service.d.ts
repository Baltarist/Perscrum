import { UpdateUserProfileRequest, UpdateUserSettingsRequest } from '../types';
export declare class UserService {
    static getUserProfile(userId: string): Promise<{
        id: string;
        email: string;
        displayName: string;
        subscriptionTier: import("generated/prisma").$Enums.SubscriptionTier;
        aiUsageCount: number;
        subscriptionEndDate: Date | null;
        createdAt: Date;
        settings: {
            createdAt: Date;
            updatedAt: Date;
            sprintDurationWeeks: number;
            dailyCheckinEnabled: boolean;
            dailyCheckinTime: string;
            retrospectiveEnabled: boolean;
            aiCoachName: string;
            dailyFocusTaskId: string | null;
            userId: string;
        } | null;
        badges: {
            earnedAt: Date;
            type: string;
            id: string;
            createdAt: Date;
            name: string;
            criteria: string;
            icon: string;
        }[];
        recentCheckins: {
            id: string;
            userId: string;
            date: Date;
            notes: string | null;
            mood: string | null;
        }[];
        unreadNotifications: ({
            project: {
                id: string;
                title: string;
            } | null;
        } & {
            type: import("generated/prisma").$Enums.NotificationType;
            message: string;
            id: string;
            createdAt: Date;
            userId: string;
            isRead: boolean;
            projectId: string | null;
        })[];
    }>;
    static updateProfile(userId: string, updateData: UpdateUserProfileRequest): Promise<{
        id: string;
        email: string;
        displayName: string;
        subscriptionTier: import("generated/prisma").$Enums.SubscriptionTier;
        aiUsageCount: number;
        subscriptionEndDate: Date | null;
        settings: {
            createdAt: Date;
            updatedAt: Date;
            sprintDurationWeeks: number;
            dailyCheckinEnabled: boolean;
            dailyCheckinTime: string;
            retrospectiveEnabled: boolean;
            aiCoachName: string;
            dailyFocusTaskId: string | null;
            userId: string;
        } | null;
    }>;
    static updateSettings(userId: string, settingsData: UpdateUserSettingsRequest): Promise<{
        createdAt: Date;
        updatedAt: Date;
        sprintDurationWeeks: number;
        dailyCheckinEnabled: boolean;
        dailyCheckinTime: string;
        retrospectiveEnabled: boolean;
        aiCoachName: string;
        dailyFocusTaskId: string | null;
        userId: string;
    }>;
    static recordDailyCheckin(userId: string, mood?: string, notes?: string): Promise<{
        checkin: {
            id: string;
            userId: string;
            date: Date;
            notes: string | null;
            mood: string | null;
        };
        earnedBadge: {
            type: string;
            id: string;
            createdAt: Date;
            name: string;
            criteria: string;
            icon: string;
        } | null;
    }>;
    static getUserBadges(userId: string): Promise<{
        earnedAt: Date;
        type: string;
        id: string;
        createdAt: Date;
        name: string;
        criteria: string;
        icon: string;
    }[]>;
    static getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        notifications: ({
            project: {
                id: string;
                title: string;
            } | null;
        } & {
            type: import("generated/prisma").$Enums.NotificationType;
            message: string;
            id: string;
            createdAt: Date;
            userId: string;
            isRead: boolean;
            projectId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static markNotificationAsRead(userId: string, notificationId: string): Promise<{
        type: import("generated/prisma").$Enums.NotificationType;
        message: string;
        id: string;
        createdAt: Date;
        userId: string;
        isRead: boolean;
        projectId: string | null;
    }>;
    static markAllNotificationsAsRead(userId: string): Promise<{
        updatedCount: number;
    }>;
    static updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    static deleteAccount(userId: string, password: string): Promise<{
        message: string;
    }>;
    static getUserStats(userId: string): Promise<{
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
    }>;
    private static calculateCheckinStreak;
}
//# sourceMappingURL=user.service.d.ts.map