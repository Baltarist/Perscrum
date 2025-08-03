import { Task, TaskStatus } from '../types';
export interface CreateTaskData {
    title: string;
    description?: string;
    storyPoints?: number;
    assigneeId?: string;
    plannedDate?: Date;
    notes?: string;
}
export interface UpdateTaskData {
    title?: string;
    description?: string;
    status?: TaskStatus;
    storyPoints?: number;
    assigneeId?: string;
    plannedDate?: Date;
    notes?: string;
}
export interface CreateSubtaskData {
    title: string;
    assigneeId?: string;
}
export interface UpdateSubtaskData {
    title?: string;
    isCompleted?: boolean;
    assigneeId?: string;
}
export declare class TaskService {
    static getSprintTasks(sprintId: string, userId: string): Promise<Task[]>;
    static getTaskById(taskId: string, userId: string): Promise<Task>;
    static createTask(sprintId: string, userId: string, data: CreateTaskData): Promise<Task>;
    static updateTask(taskId: string, userId: string, data: UpdateTaskData): Promise<Task>;
    static deleteTask(taskId: string, userId: string): Promise<void>;
    static createSubtask(taskId: string, userId: string, data: CreateSubtaskData): Promise<any>;
    static updateSubtask(subtaskId: string, userId: string, data: UpdateSubtaskData): Promise<any>;
    static deleteSubtask(subtaskId: string, userId: string): Promise<void>;
    static getUserTasks(userId: string, status?: TaskStatus, limit?: number): Promise<Task[]>;
}
//# sourceMappingURL=task.service-simple.d.ts.map