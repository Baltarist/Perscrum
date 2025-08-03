"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const types_1 = require("../types");
class UserService {
    // Get user profile - simplified
    static async getUserProfile(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                subscriptionTier: true,
                aiUsageCount: true,
                subscriptionEndDate: true,
                dailyFocusTaskId: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            throw new types_1.CustomError('User not found', 404);
        }
        // Get settings separately
        const settings = await database_1.default.userSettings.findUnique({
            where: { userId }
        });
        // Get badges separately  
        const badges = await database_1.default.userBadge.findMany({
            where: { userId },
            include: {
                badge: true
            }
        });
        // Get recent checkins
        const dailyCheckins = await database_1.default.dailyCheckin.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            },
            orderBy: { date: 'desc' },
            take: 10
        });
        // Get notifications
        const notifications = await database_1.default.notification.findMany({
            where: { userId, isRead: false },
            take: 5
        });
        return {
            ...user,
            settings,
            badges: badges.map((ub) => ({
                ...ub.badge,
                earnedAt: ub.earnedAt
            })),
            recentCheckins: dailyCheckins,
            unreadNotifications: notifications
        };
    }
    // Update user profile
    static async updateUserProfile(userId, data) {
        const user = await database_1.default.user.update({
            where: { id: userId },
            data: {
                displayName: data.displayName,
                email: data.email,
                updatedAt: new Date()
            }
        });
        return user;
    }
    // Update user settings
    static async updateUserSettings(userId, data) {
        const settings = await database_1.default.userSettings.upsert({
            where: { userId },
            update: {
                ...data,
                updatedAt: new Date()
            },
            create: {
                userId,
                ...data
            }
        });
        return settings;
    }
    // Record daily checkin
    static async recordDailyCheckin(userId, data) {
        const { mood, productivity, notes } = data;
        // Check if already checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingCheckin = await database_1.default.dailyCheckin.findFirst({
            where: {
                userId,
                date: {
                    gte: today
                }
            }
        });
        if (existingCheckin) {
            throw new types_1.CustomError('Daily check-in already completed for today', 400);
        }
        const checkin = await database_1.default.dailyCheckin.create({
            data: {
                userId,
                date: new Date(),
                mood: typeof mood === 'number' ? mood : parseInt(mood) || 3,
                productivity: typeof productivity === 'number' ? productivity : parseInt(productivity) || 3,
                notes
            }
        });
        // Simple badge check
        const lastWeekCheckins = await database_1.default.dailyCheckin.count({
            where: {
                userId,
                date: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });
        let earnedBadge = null;
        if (lastWeekCheckins >= 7) {
            const consistencyBadge = await database_1.default.badge.findFirst({
                where: { name: 'Consistency Champion' }
            });
            if (consistencyBadge) {
                const existingUserBadge = await database_1.default.userBadge.findFirst({
                    where: {
                        userId,
                        badgeId: consistencyBadge.id
                    }
                });
                if (!existingUserBadge) {
                    await database_1.default.userBadge.create({
                        data: {
                            userId,
                            badgeId: consistencyBadge.id
                        }
                    });
                    earnedBadge = consistencyBadge;
                }
            }
        }
        return { checkin, earnedBadge };
    }
    // Get user badges
    static async getUserBadges(userId) {
        const badges = await database_1.default.userBadge.findMany({
            where: { userId },
            include: {
                badge: true
            },
            orderBy: { earnedAt: 'desc' }
        });
        return badges.map((ub) => ({
            ...ub.badge,
            earnedAt: ub.earnedAt
        }));
    }
    // Get notifications
    static async getNotifications(userId, page = 1, limit = 10) {
        const notifications = await database_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        });
        const total = await database_1.default.notification.count({
            where: { userId }
        });
        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    // Mark notification as read
    static async markNotificationAsRead(userId, notificationId) {
        await database_1.default.notification.updateMany({
            where: {
                id: notificationId,
                userId
            },
            data: {
                isRead: true
            }
        });
    }
    // Mark all notifications as read
    static async markAllNotificationsAsRead(userId) {
        await database_1.default.notification.updateMany({
            where: { userId },
            data: { isRead: true }
        });
    }
    // Update password
    static async updatePassword(userId, currentPassword, newPassword) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new types_1.CustomError('User not found', 404);
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            throw new types_1.CustomError('Current password is incorrect', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.default.user.update({
            where: { id: userId },
            data: {
                passwordHash: hashedPassword,
                updatedAt: new Date()
            }
        });
    }
    // Get user stats
    static async getUserStats(userId) {
        const stats = await database_1.default.$transaction([
            // Total projects
            database_1.default.project.count({
                where: { ownerId: userId }
            }),
            // Total tasks created
            database_1.default.task.count({
                where: { createdById: userId }
            }),
            // Completed tasks
            database_1.default.task.count({
                where: {
                    createdById: userId,
                    status: 'done'
                }
            }),
            // Badges earned
            database_1.default.userBadge.count({
                where: { userId }
            })
        ]);
        const [totalProjects, totalTasks, completedTasks, badgesEarned] = stats;
        return {
            totalProjects,
            totalTasks,
            completedTasks,
            badgesEarned,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    }
    // Delete account
    static async deleteAccount(userId) {
        await database_1.default.user.delete({
            where: { id: userId }
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service-simple.js.map