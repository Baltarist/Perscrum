import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/constants';
import { JWTPayload, RefreshTokenPayload } from '../types';

// Generate access token
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload as object, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
    issuer: 'scrum-coach-api',
    audience: 'scrum-coach-client'
  } as jwt.SignOptions);
};

// Generate refresh token
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload as object, JWT_CONFIG.refreshSecret, {
    expiresIn: JWT_CONFIG.refreshExpiresIn,
    issuer: 'scrum-coach-api',
    audience: 'scrum-coach-client'
  } as jwt.SignOptions);
};

// Verify access token
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_CONFIG.secret, {
      issuer: 'scrum-coach-api',
      audience: 'scrum-coach-client'
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, JWT_CONFIG.refreshSecret, {
      issuer: 'scrum-coach-api',
      audience: 'scrum-coach-client'
    }) as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};