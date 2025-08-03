import prisma from '../config/database';
import { Project, ProjectStatus, User, TeamRole, CustomError } from '../types';

export interface CreateProjectData {
  title: string;
  description?: string;
  colorTheme?: string;
  targetCompletionDate?: string;
  totalSprints?: number;
  sprintDurationWeeks?: number;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  colorTheme?: string;
  targetCompletionDate?: string;
  estimatedCompletionDate?: Date | string;
  status?: ProjectStatus;
}

export interface ProjectWithDetails extends Project {
  owner: Pick<User, 'id' | 'displayName' | 'email'>;
  teamMembers: Array<{
    id: string;
    userId: string;
    role: TeamRole;
    joinedAt: Date;
    user: Pick<User, 'id' | 'displayName' | 'email'>;
  }>;
  _count: {
    sprints: number;
    teamMembers: number;
  };
}

export class ProjectService {
  // Get user's projects
  static async getUserProjects(userId: string): Promise<ProjectWithDetails[]> {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { teamMembers: { some: { userId } } }
        ]
      },
      include: {
        owner: {
          select: { id: true, displayName: true, email: true }
        },
        teamMembers: {
          include: {
            user: {
              select: { id: true, displayName: true, email: true }
            }
          }
        },
        _count: {
          select: { sprints: true, teamMembers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects;
  }

  // Get single project by ID
  static async getProjectById(projectId: string, userId: string): Promise<ProjectWithDetails> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { teamMembers: { some: { userId } } }
        ]
      },
      include: {
        owner: {
          select: { id: true, displayName: true, email: true }
        },
        teamMembers: {
          include: {
            user: {
              select: { id: true, displayName: true, email: true }
            }
          }
        },
        _count: {
          select: { sprints: true, teamMembers: true }
        }
      }
    });

    if (!project) {
      throw new CustomError('Project not found or access denied', 404);
    }

    return project;
  }

  // Create new project
  static async createProject(userId: string, data: CreateProjectData): Promise<ProjectWithDetails> {
    console.log('🔍 CreateProject called with:', { userId, data });
    
    // Check user subscription limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { ownedProjects: true } } }
    });
    
    console.log('🔍 User found:', user ? 'YES' : 'NO');

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Free tier limit: 1 project
    if (user.subscriptionTier === 'free' && user._count.ownedProjects >= 1) {
      throw new CustomError('Free tier allows only 1 project. Please upgrade to Pro.', 403);
    }

    console.log('🔍 Creating project with Prisma...');
    try {
      const project = await prisma.project.create({
        data: {
          title: data.title,
          description: data.description,
          colorTheme: data.colorTheme || '#3B82F6',
          targetCompletionDate: data.targetCompletionDate ? new Date(data.targetCompletionDate) : new Date(),
          estimatedCompletionDate: new Date(),
          totalSprints: data.totalSprints || 10,
          sprintDurationWeeks: data.sprintDurationWeeks || 1,
          ownerId: userId,
          status: 'active'
        },
        include: {
          owner: {
            select: { id: true, displayName: true, email: true }
          },
          teamMembers: {
            include: {
              user: {
                select: { id: true, displayName: true, email: true }
              }
            }
          },
          _count: {
            select: { sprints: true, teamMembers: true }
          }
        }
    });

    console.log('🔍 Project created successfully:', project.id);

    // Create notification for project creation
    await prisma.notification.create({
      data: {
        userId,
        type: 'project_updated',
        message: `Project "${project.title}" has been created successfully!`,
        projectId: project.id
      }
    });

    console.log('🔍 Notification created, creating initial sprints...');
    
    // Auto-generate sprints based on project settings
    await this.createInitialSprints(project.id, project.totalSprints, project.sprintDurationWeeks, project.targetCompletionDate);
    
    console.log('🔍 Initial sprints created, returning project');
    return project;
    } catch (error) {
      console.error('❌ Error in createProject:', error);
      throw error;
    }
  }

  // Auto-generate initial sprints for new project
  private static async createInitialSprints(
    projectId: string, 
    totalSprints: number, 
    sprintDurationWeeks: number, 
    targetCompletionDate: Date
  ): Promise<void> {
    console.log('🔍 Creating initial sprints:', { projectId, totalSprints, sprintDurationWeeks });
    
    const startDate = new Date(); // Start from today
    const sprintDurationDays = sprintDurationWeeks * 7;
    
    for (let i = 1; i <= totalSprints; i++) {
      const sprintStartDate = new Date(startDate);
      sprintStartDate.setDate(startDate.getDate() + (i - 1) * sprintDurationDays);
      
      const sprintEndDate = new Date(sprintStartDate);
      sprintEndDate.setDate(sprintStartDate.getDate() + sprintDurationDays - 1);
      
      // Create sprint
      const sprint = await prisma.sprint.create({
        data: {
          projectId,
          sprintNumber: i,
          goal: `Sprint ${i} - Proje gelişimi`,
          status: i === 1 ? 'active' : 'planning', // First sprint is active
          startDate: sprintStartDate,
          endDate: sprintEndDate
        }
      });
      
      // Add initial tasks for first sprint
      if (i === 1) {
        await this.createInitialTasks(sprint.id);
      }
      
      console.log(`✅ Sprint ${i} created:`, sprint.id);
    }
  }

  // Create initial template tasks for first sprint
  private static async createInitialTasks(sprintId: string): Promise<void> {
    const initialTasks = [
      {
        title: 'Proje planlaması tamamla',
        description: 'Proje kapsamını netleştir ve hedefleri belirle',
        status: 'todo' as const,
        storyPoints: 3
      },
      {
        title: 'İlk geliştirme döngüsünü başlat',
        description: 'Temel geliştirme süreçlerini kur ve ilk özellikleri geliştir',
        status: 'todo' as const,
        storyPoints: 5
      },
      {
        title: 'Test ve gözden geçirme',
        description: 'Geliştirilenleri test et ve iyileştirmeler yap',
        status: 'todo' as const,
        storyPoints: 2
      }
    ];

    for (const taskData of initialTasks) {
      await prisma.task.create({
        data: {
          ...taskData,
          sprintId,
          createdById: (await prisma.sprint.findUnique({
            where: { id: sprintId },
            include: { project: { select: { ownerId: true } } }
          }))!.project.ownerId
        }
      });
    }
    
    console.log('✅ Initial tasks created for sprint:', sprintId);
  }

  // Update project
  static async updateProject(
    projectId: string, 
    userId: string, 
    data: UpdateProjectData
  ): Promise<ProjectWithDetails> {
    // Check if user has permission (owner or team member with admin role)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { teamMembers: { some: { userId, role: 'admin' } } }
        ]
      }
    });

    if (!project) {
      throw new CustomError('Project not found or insufficient permissions', 404);
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...data,
        targetCompletionDate: data.targetCompletionDate ? new Date(data.targetCompletionDate) : undefined,
        estimatedCompletionDate: data.estimatedCompletionDate ? (typeof data.estimatedCompletionDate === 'string' ? new Date(data.estimatedCompletionDate) : data.estimatedCompletionDate) : undefined,
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: { id: true, displayName: true, email: true }
        },
        teamMembers: {
          include: {
            user: {
              select: { id: true, displayName: true, email: true }
            }
          }
        },
        _count: {
          select: { sprints: true, teamMembers: true }
        }
      }
    });

    return updatedProject;
  }

  // Delete project
  static async deleteProject(projectId: string, userId: string): Promise<void> {
    // Only project owner can delete
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId }
    });

    if (!project) {
      throw new CustomError('Project not found or you are not the owner', 404);
    }

    // Delete project (cascade will handle related data)
    await prisma.project.delete({
      where: { id: projectId }
    });
  }

  // Complete project
  static async completeProject(projectId: string, userId: string): Promise<ProjectWithDetails> {
    const project = await this.updateProject(projectId, userId, { 
      status: 'completed',
      estimatedCompletionDate: new Date()
    });

    // Create notification for project completion
    await prisma.notification.create({
      data: {
        userId,
        type: 'project_updated',
        message: `Congratulations! Project "${project.title}" has been completed!`,
        projectId: project.id
      }
    });

    return project;
  }

  // Add team member
  static async addTeamMember(
    projectId: string, 
    userId: string, 
    memberEmail: string, 
    role: TeamRole = 'member'
  ): Promise<any> {
    // Check if user has permission (owner or admin)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { teamMembers: { some: { userId, role: 'admin' } } }
        ]
      }
    });

    if (!project) {
      throw new CustomError('Project not found or insufficient permissions', 404);
    }

    // Find user by email
    const memberUser = await prisma.user.findUnique({
      where: { email: memberEmail },
      select: { id: true, displayName: true, email: true }
    });

    if (!memberUser) {
      throw new CustomError('User with this email not found', 404);
    }

    // Check if already a team member
    const existingMember = await prisma.teamMember.findFirst({
      where: { projectId, userId: memberUser.id }
    });

    if (existingMember) {
      throw new CustomError('User is already a team member', 400);
    }

    // Add team member
    const teamMember = await prisma.teamMember.create({
      data: {
        projectId,
        userId: memberUser.id,
        role,
        joinedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, displayName: true, email: true }
        }
      }
    });

    // Create notification for the new member
    await prisma.notification.create({
      data: {
        userId: memberUser.id,
        type: 'system_update',
        message: `You have been added to project "${project.title}"`,
        projectId: project.id
      }
    });

    return teamMember;
  }

  // Remove team member
  static async removeTeamMember(
    projectId: string, 
    userId: string, 
    memberId: string
  ): Promise<void> {
    // Check if user has permission (owner or admin)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { teamMembers: { some: { userId, role: 'admin' } } }
        ]
      }
    });

    if (!project) {
      throw new CustomError('Project not found or insufficient permissions', 404);
    }

    // Cannot remove project owner
    if (memberId === project.ownerId) {
      throw new CustomError('Cannot remove project owner from team', 400);
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: { projectId, userId: memberId }
    });

    if (!teamMember) {
      throw new CustomError('Team member not found', 404);
    }

    await prisma.teamMember.delete({
      where: { id: teamMember.id }
    });
  }

  // Get project statistics
  static async getProjectStats(projectId: string, userId: string): Promise<any> {
    const project = await this.getProjectById(projectId, userId);

    const stats = await prisma.$transaction([
      // Sprint stats
      prisma.sprint.groupBy({
        by: ['status'],
        where: { projectId },
        _count: true,
        orderBy: { status: 'asc' }
      }),
      // Task stats
      prisma.task.groupBy({
        by: ['status'],
        where: { sprint: { projectId } },
        _count: true,
        orderBy: { status: 'asc' }
      }),
      // Total story points
      prisma.task.aggregate({
        where: { sprint: { projectId } },
        _sum: { storyPoints: true }
      }),
      // Completed story points
      prisma.task.aggregate({
        where: { 
          sprint: { projectId },
          status: 'done'
        },
        _sum: { storyPoints: true }
      })
    ]);

    const [sprintStats, taskStats, totalPoints, completedPoints] = stats;

    return {
      project: {
        id: project.id,
        title: project.title,
        status: project.status
      },
      sprints: {
        total: sprintStats.reduce((acc, s) => acc + (typeof s._count === 'number' ? s._count : 0), 0),
        byStatus: sprintStats.reduce((acc, s) => ({
          ...acc,
          [s.status]: s._count
        }), {})
      },
      tasks: {
        total: taskStats.reduce((acc, t) => acc + (typeof t._count === 'number' ? t._count : 0), 0),
        byStatus: taskStats.reduce((acc, t) => ({
          ...acc,
          [t.status]: t._count
        }), {})
      },
      storyPoints: {
        total: totalPoints._sum.storyPoints || 0,
        completed: completedPoints._sum.storyPoints || 0,
        completionRate: totalPoints._sum.storyPoints 
          ? Math.round((completedPoints._sum.storyPoints || 0) / totalPoints._sum.storyPoints * 100)
          : 0
      }
    };
  }
}