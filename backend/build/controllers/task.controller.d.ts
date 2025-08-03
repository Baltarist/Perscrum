import { Response } from 'express';
export declare class TaskController {
    static getSprintTasks: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getTaskById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static createTask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateTask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteTask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static createSubtask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateSubtask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteSubtask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getUserTasks: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateTaskStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static assignTask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=task.controller.d.ts.map