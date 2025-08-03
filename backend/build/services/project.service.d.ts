import { Project, ProjectStatus, User, TeamRole } from '../types';
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
export declare class ProjectService {
    static getUserProjects(userId: string): Promise<ProjectWithDetails[]>;
    static getProjectById(projectId: string, userId: string): Promise<ProjectWithDetails>;
    static createProject(userId: string, data: CreateProjectData): Promise<ProjectWithDetails>;
    private static createInitialSprints;
    private static createInitialTasks;
    static updateProject(projectId: string, userId: string, data: UpdateProjectData): Promise<ProjectWithDetails>;
    static deleteProject(projectId: string, userId: string): Promise<void>;
    static completeProject(projectId: string, userId: string): Promise<ProjectWithDetails>;
    static addTeamMember(projectId: string, userId: string, memberEmail: string, role?: TeamRole): Promise<any>;
    static removeTeamMember(projectId: string, userId: string, memberId: string): Promise<void>;
    static getProjectStats(projectId: string, userId: string): Promise<any>;
}
//# sourceMappingURL=project.service.d.ts.map