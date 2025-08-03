import { CreateUserRequest, LoginRequest } from '../types';
export declare class AuthService {
    static register(userData: CreateUserRequest): Promise<{
        user: {
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
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    static login(loginData: LoginRequest): Promise<{
        user: {
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
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    static refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            subscriptionTier: import("generated/prisma").$Enums.SubscriptionTier;
        };
    }>;
    static getUserProfile(userId: string): Promise<{
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
        badges: {
            type: string;
            id: string;
            createdAt: Date;
            name: string;
            criteria: string;
            icon: string;
        }[];
        unreadNotifications: {
            type: import("generated/prisma").$Enums.NotificationType;
            message: string;
            id: string;
            createdAt: Date;
            userId: string;
            isRead: boolean;
            projectId: string | null;
        }[];
    }>;
    static verifyEmail(token: string): Promise<void>;
    static requestPasswordReset(email: string): Promise<void>;
    static resetPassword(token: string, newPassword: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map