"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
const redis_1 = require("redis");
// Redis client configuration
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        connectTimeout: 60000,
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
});
// Error handling
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});
redisClient.on('connect', () => {
    console.log('Connected to Redis');
});
redisClient.on('disconnect', () => {
    console.log('Disconnected from Redis');
});
// Connect to Redis
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis connection established');
    }
    catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Don't throw error in development - app should work without Redis
        if (process.env.NODE_ENV === 'production') {
            throw error;
        }
    }
};
exports.connectRedis = connectRedis;
// Graceful shutdown
process.on('SIGINT', async () => {
    if (redisClient.isOpen) {
        await redisClient.disconnect();
    }
});
exports.default = redisClient;
//# sourceMappingURL=redis.js.map