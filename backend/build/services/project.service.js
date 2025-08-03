"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
class ProjectService {
    // Get user's projects
    static async getUserProjects(userId) {
        const projects = await database_1.default.project.findMany({
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
    static async getProjectById(projectId, userId) {
        const project = await database_1.default.project.findFirst({
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
            throw new types_1.CustomError('Project not found or access denied', 404);
        }
        return project;
    }
    // Create new project
    static async createProject(userId, data) {
        console.log('🔍 CreateProject called with:', { userId, data });
        // Check user subscription limits
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            include: { _count: { select: { ownedProjects: true } } }
        });
        console.log('🔍 User found:', user ? 'YES' : 'NO');
        if (!user) {
            throw new types_1.CustomError('User not found', 404);
        }
        // Free tier limit: 1 project
        if (user.subscriptionTier === 'free' && user._count.ownedProjects >= 1) {
            throw new types_1.CustomError('Free tier allows only 1 project. Please upgrade to Pro.', 403);
        }
        console.log('🔍 Creating project with Prisma...');
        try {
            const project = await database_1.default.project.create({
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
            await database_1.default.notification.create({
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
        }
        catch (error) {
            console.error('❌ Error in createProject:', error);
            throw error;
        }
    }
    // Auto-generate initial sprints for new project
    static async createInitialSprints(projectId, totalSprints, sprintDurationWeeks, targetCompletionDate) {
        console.log('🔍 Creating initial sprints:', { projectId, totalSprints, sprintDurationWeeks });
        const startDate = new Date(); // Start from today
        const sprintDurationDays = sprintDurationWeeks * 7;
        for (let i = 1; i <= totalSprints; i++) {
            const sprintStartDate = new Date(startDate);
            sprintStartDate.setDate(startDate.getDate() + (i - 1) * sprintDurationDays);
            const sprintEndDate = new Date(sprintStartDate);
            sprintEndDate.setDate(sprintStartDate.getDate() + sprintDurationDays - 1);
            // Create sprint
            const sprint = await database_1.default.sprint.create({
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
    static async createInitialTasks(sprintId) {
        const initialTasks = [
            {
                title: 'Proje planlaması tamamla',
                description: 'Proje kapsamını netleştir ve hedefleri belirle',
                status: 'todo',
                storyPoints: 3
            },
            {
                title: 'İlk geliştirme döngüsünü başlat',
                description: 'Temel geliştirme süreçlerini kur ve ilk özellikleri geliştir',
                status: 'todo',
                storyPoints: 5
            },
            {
                title: 'Test ve gözden geçirme',
                description: 'Geliştirilenleri test et ve iyileştirmeler yap',
                status: 'todo',
                storyPoints: 2
            }
        ];
        for (const taskData of initialTasks) {
            await database_1.default.task.create({
                data: {
                    ...taskData,
                    sprintId,
                    createdById: (await database_1.default.sprint.findUnique({
                        where: { id: sprintId },
                        include: { project: { select: { ownerId: true } } }
                    })).project.ownerId
                }
            });
        }
        console.log('✅ Initial tasks created for sprint:', sprintId);
    }
    // Update project
    static async updateProject(projectId, userId, data) {
        // Check if user has permission (owner or team member with admin role)
        const project = await database_1.default.project.findFirst({
            where: {
                id: projectId,
                OR: [
                    { ownerId: userId },
                    { teamMembers: { some: { userId, role: 'admin' } } }
                ]
            }
        });
        if (!project) {
            throw new types_1.CustomError('Project not found or insufficient permissions', 404);
        }
        const updatedProject = await database_1.default.project.update({
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
    static async deleteProject(projectId, userId) {
        // Only project owner can delete
        const project = await database_1.default.project.findFirst({
            where: { id: projectId, ownerId: userId }
        });
        if (!project) {
            throw new types_1.CustomError('Project not found or you are not the owner', 404);
        }
        // Delete project (cascade will handle related data)
        await database_1.default.project.delete({
            where: { id: projectId }
        });
    }
    // Complete project
    static async completeProject(projectId, userId) {
        const project = await this.updateProject(projectId, userId, {
            status: 'completed',
            estimatedCompletionDate: new Date()
        });
        // Create notification for project completion
        await database_1.default.notification.create({
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
    static async addTeamMember(projectId, userId, memberEmail, role = 'member') {
        // Check if user has permission (owner or admin)
        const project = await database_1.default.project.findFirst({
            where: {
                id: projectId,
                OR: [
                    { ownerId: userId },
                    { teamMembers: { some: { userId, role: 'admin' } } }
                ]
            }
        });
        if (!project) {
            throw new types_1.CustomError('Project not found or insufficient permissions', 404);
        }
        // Find user by email
        const memberUser = await database_1.default.user.findUnique({
            where: { email: memberEmail },
            select: { id: true, displayName: true, email: true }
        });
        if (!memberUser) {
            throw new types_1.CustomError('User with this email not found', 404);
        }
        // Check if already a team member
        const existingMember = await database_1.default.teamMember.findFirst({
            where: { projectId, userId: memberUser.id }
        });
        if (existingMember) {
            throw new types_1.CustomError('User is already a team member', 400);
        }
        // Add team member
        const teamMember = await database_1.default.teamMember.create({
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
        await database_1.default.notification.create({
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
    static async removeTeamMember(projectId, userId, memberId) {
        // Check if user has permission (owner or admin)
        const project = await database_1.default.project.findFirst({
            where: {
                id: projectId,
                OR: [
                    { ownerId: userId },
                    { teamMembers: { some: { userId, role: 'admin' } } }
                ]
            }
        });
        if (!project) {
            throw new types_1.CustomError('Project not found or insufficient permissions', 404);
        }
        // Cannot remove project owner
        if (memberId === project.ownerId) {
            throw new types_1.CustomError('Cannot remove project owner from team', 400);
        }
        const teamMember = await database_1.default.teamMember.findFirst({
            where: { projectId, userId: memberId }
        });
        if (!teamMember) {
            throw new types_1.CustomError('Team member not found', 404);
        }
        await database_1.default.teamMember.delete({
            where: { id: teamMember.id }
        });
    }
    // Get project statistics
    static async getProjectStats(projectId, userId) {
        const project = await this.getProjectById(projectId, userId);
        const stats = await database_1.default.$transaction([
            // Sprint stats
            database_1.default.sprint.groupBy({
                by: ['status'],
                where: { projectId },
                _count: true,
                orderBy: { status: 'asc' }
            }),
            // Task stats
            database_1.default.task.groupBy({
                by: ['status'],
                where: { sprint: { projectId } },
                _count: true,
                orderBy: { status: 'asc' }
            }),
            // Total story points
            database_1.default.task.aggregate({
                where: { sprint: { projectId } },
                _sum: { storyPoints: true }
            }),
            // Completed story points
            database_1.default.task.aggregate({
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
exports.ProjectService = ProjectService;
//# sourceMappingURL=project.service.js.map