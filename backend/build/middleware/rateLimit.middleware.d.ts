import { Request, Response } from 'express';
export declare const globalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const aiRateLimit: (req: Request, res: Response, next: Function) => Promise<any>;
export declare const uploadRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const resetDailyAIUsage: () => Promise<void>;
export declare const createCustomRateLimit: (windowMs: number, maxRequests: number, keyPrefix: string) => (req: Request, res: Response, next: Function) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=rateLimit.middleware.d.ts.map