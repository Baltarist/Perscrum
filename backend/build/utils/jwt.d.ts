import { JWTPayload, RefreshTokenPayload } from '../types';
export declare const generateAccessToken: (payload: JWTPayload) => string;
export declare const generateRefreshToken: (payload: RefreshTokenPayload) => string;
export declare const verifyAccessToken: (token: string) => JWTPayload;
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
export declare const extractTokenFromHeader: (authHeader?: string) => string | null;
//# sourceMappingURL=jwt.d.ts.map