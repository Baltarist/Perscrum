import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare const validate: (schema: ZodSchema, source?: "body" | "params" | "query") => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateUuid: (paramName: string) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validatePagination: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateDateRange: (startField: string, endField: string) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
declare global {
    namespace Express {
        interface Request {
            pagination?: {
                page: number;
                limit: number;
                offset: number;
            };
        }
    }
}
//# sourceMappingURL=validation.middleware.d.ts.map