import { Request, Response } from 'express';
export declare class ProjectController {
    static getUserProjects: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProjectById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static createProject: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateProject: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static deleteProject: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static completeProject: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProjectStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static addTeamMember: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static removeTeamMember: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getTeamMembers: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=project.controller.d.ts.map