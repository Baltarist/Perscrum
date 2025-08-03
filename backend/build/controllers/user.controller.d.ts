import { Request, Response } from 'express';
export declare class UserController {
    static getProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getSettings: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateSettings: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static dailyCheckin: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getBadges: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getNotifications: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static markNotificationAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static markAllNotificationsAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updatePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getUserStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static deleteAccount: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=user.controller.d.ts.map