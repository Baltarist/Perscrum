import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { CustomError } from '../types';

export class UserService {
  // Get user profile - simplified
  static async getUserProfile(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
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
      throw new CustomError('User not found', 404);
    }

    // Get settings separately
    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    });

    // Get badges separately  
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      }
    });

    // Get recent checkins
    const dailyCheckins = await prisma.dailyCheckin.findMany({
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
    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      take: 5
    });

    return {
      ...user,
      settings,
      badges: badges.map((ub: any) => ({
        ...ub.badge,
        earnedAt: ub.earnedAt
      })),
      recentCheckins: dailyCheckins,
      unreadNotifications: notifications
    };
  }

  // Update user profile
  static async updateUserProfile(userId: string, data: any): Promise<any> {
    const user = await prisma.user.update({
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
  static async updateUserSettings(userId: string, data: any): Promise<any> {
    const settings = await prisma.userSettings.upsert({
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
  static async recordDailyCheckin(userId: string, data: any): Promise<any> {
    const { mood, productivity, notes } = data;

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckin = await prisma.dailyCheckin.findFirst({
      where: {
        userId,
        date: {
          gte: today
        }
      }
    });

    if (existingCheckin) {
      throw new CustomError('Daily check-in already completed for today', 400);
    }

    const checkin = await prisma.dailyCheckin.create({
      data: {
        userId,
        date: new Date(),
        mood: typeof mood === 'number' ? mood : parseInt(mood) || 3,
        productivity: typeof productivity === 'number' ? productivity : parseInt(productivity) || 3,
        notes
      }
    });

    // Simple badge check
    const lastWeekCheckins = await prisma.dailyCheckin.count({
      where: {
        userId,
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    let earnedBadge = null;
    if (lastWeekCheckins >= 7) {
      const consistencyBadge = await prisma.badge.findFirst({
        where: { name: 'Consistency Champion' }
      });

      if (consistencyBadge) {
        const existingUserBadge = await prisma.userBadge.findFirst({
          where: {
            userId,
            badgeId: consistencyBadge.id
          }
        });

        if (!existingUserBadge) {
          await prisma.userBadge.create({
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
  static async getUserBadges(userId: string): Promise<any> {
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: { earnedAt: 'desc' }
    });

    return badges.map((ub: any) => ({
      ...ub.badge,
      earnedAt: ub.earnedAt
    }));
  }

  // Get notifications
  static async getNotifications(userId: string, page = 1, limit = 10): Promise<any> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.notification.count({
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
  static async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    await prisma.notification.updateMany({
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
  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true }
    });
  }

  // Update password
  static async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new CustomError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        updatedAt: new Date()
      }
    });
  }

  // Get user stats
  static async getUserStats(userId: string): Promise<any> {
    const stats = await prisma.$transaction([
      // Total projects
      prisma.project.count({
        where: { ownerId: userId }
      }),
      // Total tasks created
      prisma.task.count({
        where: { createdById: userId }
      }),
      // Completed tasks
      prisma.task.count({
        where: { 
          createdById: userId,
          status: 'done'
        }
      }),
      // Badges earned
      prisma.userBadge.count({
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
  static async deleteAccount(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId }
    });
  }
}