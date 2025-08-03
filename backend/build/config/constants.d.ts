export declare const PORT: string | number;
export declare const NODE_ENV: string;
export declare const JWT_CONFIG: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
};
export declare const RATE_LIMITS: {
    global: {
        windowMs: number;
        max: number;
    };
    auth: {
        windowMs: number;
        max: number;
    };
    ai: {
        free: {
            windowMs: number;
            max: number;
        };
        pro: {
            windowMs: number;
            max: number;
        };
        enterprise: {
            windowMs: number;
            max: number;
        };
    };
};
export declare const CACHE_TTL: {
    userProfile: number;
    projectData: number;
    aiResponses: number;
    analytics: number;
};
export declare const AI_LIMITS: {
    free: {
        daily: number;
        monthly: number;
    };
    pro: {
        daily: number;
        monthly: number;
    };
    enterprise: {
        daily: number;
        monthly: number;
    };
};
export declare const CORS_ORIGIN: string;
export declare const UPLOAD_LIMITS: {
    maxFileSize: number;
    maxFiles: number;
    allowedMimeTypes: string[];
};
export declare const EMAIL_CONFIG: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string | undefined;
        pass: string | undefined;
    };
};
//# sourceMappingURL=constants.d.ts.map