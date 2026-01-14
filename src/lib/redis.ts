import { Redis } from '@upstash/redis';

// Initialize Redis client
// Uses REST API for Edge Runtime compatibility
let redis: Redis | null = null;

try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken) {
        redis = new Redis({
            url: redisUrl,
            token: redisToken,
        });
    } else {
        console.warn('Redis credentials not configured. Caching will be disabled.');
    }
} catch (error) {
    console.error('Failed to initialize Redis client:', error);
}

export default redis;
