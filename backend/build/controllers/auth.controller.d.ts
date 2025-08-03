import { Request, Response } from 'express';
export declare class AuthController {
    static register: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static login: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static refreshToken: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getCurrentUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static verifyEmail: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static forgotPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=auth.controller.d.ts.map