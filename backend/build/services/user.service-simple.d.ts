export declare class UserService {
    static getUserProfile(userId: string): Promise<any>;
    static updateUserProfile(userId: string, data: any): Promise<any>;
    static updateUserSettings(userId: string, data: any): Promise<any>;
    static recordDailyCheckin(userId: string, data: any): Promise<any>;
    static getUserBadges(userId: string): Promise<any>;
    static getNotifications(userId: string, page?: number, limit?: number): Promise<any>;
    static markNotificationAsRead(userId: string, notificationId: string): Promise<void>;
    static markAllNotificationsAsRead(userId: string): Promise<void>;
    static updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static getUserStats(userId: string): Promise<any>;
    static deleteAccount(userId: string): Promise<void>;
}
//# sourceMappingURL=user.service-simple.d.ts.map