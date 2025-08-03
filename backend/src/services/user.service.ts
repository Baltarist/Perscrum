import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { 
  UpdateUserProfileRequest, 
  UpdateUserSettingsRequest,
  NotFoundError,
  ConflictError,
  ValidationError 
} from '../types';

export class UserService {
  // Get user profile with additional data
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        badges: {
          include: {
            badge: true
          }
        },
        notifications: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            project: {
              select: { id: true, title: true }
            }
          }
        },
        checkins: {
          orderBy: { date: 'desc' },
          take: 7 // Last 7 check-ins
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      subscriptionTier: user.subscriptionTier,
      aiUsageCount: user.aiUsageCount,
      subscriptionEndDate: user.subscriptionEndDate,
      createdAt: user.createdAt,
      settings: user.settings,
      badges: user.badges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt
      })),
      recentCheckins: user.checkins,
      unreadNotifications: user.notifications
    };
  }

  // Update user profile
  static async updateProfile(userId: string, updateData: UpdateUserProfileRequest) {
    const { displayName, email } = updateData;

    // If email is being updated, check if it's already taken
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        throw new ConflictError('Email is already in use');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName && { displayName }),
        ...(email && { email })
      },
      include: {
        settings: true
      }
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      subscriptionTier: updatedUser.subscriptionTier,
      aiUsageCount: updatedUser.aiUsageCount,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      settings: updatedUser.settings
    };
  }

  // Update user settings
  static async updateSettings(userId: string, settingsData: UpdateUserSettingsRequest) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId },
      update: settingsData,
      create: {
        userId,
        ...settingsData
      }
    });

    return updatedSettings;
  }

  // Daily check-in
  static async recordDailyCheckin(userId: string, mood?: string, notes?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in today
    const existingCheckin = await prisma.dailyCheckin.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingCheckin) {
      throw new ConflictError('Already checked in today');
    }

    const checkin = await prisma.dailyCheckin.create({
      data: {
        userId,
        date: new Date(),
        mood,
        notes
      }
    });

    // Check for consistency badge (7 days in a row)
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
      // Award consistency badge if not already earned
      const consistencyBadge = await prisma.badge.findFirst({
        where: { type: 'consistency' }
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

    return {
      checkin,
      earnedBadge
    };
  }

  // Get user badges
  static async getUserBadges(userId: string) {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: { earnedAt: 'desc' }
    });

    return userBadges.map(ub => ({
      ...ub.badge,
      earnedAt: ub.earnedAt
    }));
  }

  // Get user notifications
  static async getUserNotifications(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        include: {
          project: {
            select: { id: true, title: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.notification.count({
        where: { userId }
      })
    ]);

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
  static async markNotificationAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return updatedNotification;
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return { updatedCount: result.count };
  }

  // Update password
  static async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect', 'currentPassword');
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    return { message: 'Password updated successfully' };
  }

  // Delete user account
  static async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ValidationError('Password is incorrect', 'password');
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    return { message: 'Account deleted successfully' };
  }

  // Get user statistics
  static async getUserStats(userId: string) {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      totalBadges,
      checkinStreak
    ] = await Promise.all([
      prisma.project.count({
        where: {
          OR: [
            { ownerId: userId },
            { teamMembers: { some: { userId } } }
          ]
        }
      }),
      prisma.project.count({
        where: {
          status: 'active',
          OR: [
            { ownerId: userId },
            { teamMembers: { some: { userId } } }
          ]
        }
      }),
      prisma.project.count({
        where: {
          status: 'completed',
          OR: [
            { ownerId: userId },
            { teamMembers: { some: { userId } } }
          ]
        }
      }),
      prisma.task.count({
        where: {
          OR: [
            { createdById: userId },
            { assigneeId: userId }
          ]
        }
      }),
      prisma.task.count({
        where: {
          status: 'done',
          OR: [
            { createdById: userId },
            { assigneeId: userId }
          ]
        }
      }),
      prisma.userBadge.count({
        where: { userId }
      }),
      this.calculateCheckinStreak(userId)
    ]);

    return {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      badges: totalBadges,
      checkinStreak
    };
  }

  // Helper: Calculate check-in streak
  private static async calculateCheckinStreak(userId: string): Promise<number> {
    const checkins = await prisma.dailyCheckin.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30 // Check last 30 days max
    });

    if (checkins.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const checkin of checkins) {
      const checkinDate = new Date(checkin.date);
      checkinDate.setHours(0, 0, 0, 0);

      // If this checkin is from current date or yesterday, continue streak
      if (checkinDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (checkinDate.getTime() === currentDate.getTime() - 24 * 60 * 60 * 1000) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
    }

    return streak;
  }
}