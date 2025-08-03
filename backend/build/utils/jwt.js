"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTokenFromHeader = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../config/constants");
// Generate access token
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, constants_1.JWT_CONFIG.secret, {
        expiresIn: constants_1.JWT_CONFIG.expiresIn,
        issuer: 'scrum-coach-api',
        audience: 'scrum-coach-client'
    });
};
exports.generateAccessToken = generateAccessToken;
// Generate refresh token
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, constants_1.JWT_CONFIG.refreshSecret, {
        expiresIn: constants_1.JWT_CONFIG.refreshExpiresIn,
        issuer: 'scrum-coach-api',
        audience: 'scrum-coach-client'
    });
};
exports.generateRefreshToken = generateRefreshToken;
// Verify access token
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, constants_1.JWT_CONFIG.secret, {
            issuer: 'scrum-coach-api',
            audience: 'scrum-coach-client'
        });
    }
    catch (error) {
        throw new Error('Invalid or expired access token');
    }
};
exports.verifyAccessToken = verifyAccessToken;
// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, constants_1.JWT_CONFIG.refreshSecret, {
            issuer: 'scrum-coach-api',
            audience: 'scrum-coach-client'
        });
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
// Extract token from Authorization header
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
};
exports.extractTokenFromHeader = extractTokenFromHeader;
//# sourceMappingURL=jwt.js.map