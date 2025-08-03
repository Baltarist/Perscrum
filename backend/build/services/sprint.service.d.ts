import { Sprint, SprintStatus, User, Task } from '../types';
export interface CreateSprintData {
    goal: string;
    startDate: Date;
    endDate: Date;
}
export interface UpdateSprintData {
    goal?: string;
    status?: SprintStatus;
    velocityPoints?: number;
    retrospectiveGood?: string;
    retrospectiveImprove?: string;
}
export interface SprintWithDetails extends Sprint {
    project: {
        id: string;
        title: string;
        ownerId: string;
    };
    tasks: Array<Task & {
        createdBy: Pick<User, 'id' | 'displayName' | 'email'>;
        assignee?: Pick<User, 'id' | 'displayName' | 'email'> | null;
        subtasks: Array<{
            id: string;
            title: string;
            isCompleted: boolean;
        }>;
    }>;
    _count: {
        tasks: number;
    };
}
export declare class SprintService {
    static getProjectSprints(projectId: string, userId: string): Promise<SprintWithDetails[]>;
    static getSprintById(sprintId: string, userId: string): Promise<SprintWithDetails>;
    static createSprint(projectId: string, userId: string, data: CreateSprintData): Promise<SprintWithDetails>;
    static updateSprint(sprintId: string, userId: string, data: UpdateSprintData): Promise<SprintWithDetails>;
    static startSprint(sprintId: string, userId: string): Promise<SprintWithDetails>;
    static completeSprint(sprintId: string, userId: string, retrospective?: {
        good?: string;
        improve?: string;
    }): Promise<SprintWithDetails>;
    static getSprintStats(sprintId: string, userId: string): Promise<any>;
    static deleteSprint(sprintId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=sprint.service.d.ts.map