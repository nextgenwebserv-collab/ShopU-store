// ============================== Rate Limiting Helper ================================

import { getRedisClient } from './redisClient';

// Example: Allow 100 requests per minute per IP address

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * simple rate limiter - fixed window approach
 *
 * How it works:
 * 1. We create a unique key for each user/IP (like "rateLimit:192.168.2.3")
 * 2. We count how many times they've made request in the current time window
 * 3. If count > maxRequest, we block them
 * 4. After the time window passes, the count resets
 */

export const rateLimit = {
  async check(
    identifier: string,
    maxRequests: number,
    windowSeconds: number,
    keyPrefix: string = 'rateLimit'
  ): Promise<RateLimitResult> {
    const redisKey = `${keyPrefix}:${identifier}`;
    const now = Date.now();
    const redis = getRedisClient();
    try {
      const currentCount = await redis.get(redisKey);
      const requestCount = currentCount ? parseInt(currentCount, 10) : 0;

      if (requestCount >= maxRequests) {
        const ttl = await redis.ttl(redisKey);
        const resetTime = now + ttl * 1000;

        return {
          allowed: false,
          remaining: 0,
          resetTime: resetTime,
          retryAfter: ttl > 0 ? ttl : windowSeconds,
        };
      }

      const newCount = requestCount + 1;

      if (requestCount === 0) {
        await redis.setex(redisKey, windowSeconds, newCount.toString());
      } else {
        await redis.incr(redisKey);
      }

      const remainingTtl = await redis.ttl(redisKey);
      const resetTime = now + remainingTtl * 1000;

      return {
        allowed: true,
        remaining: maxRequests - newCount,
        resetTime: resetTime,
      };
    } catch (error) {
      console.error(`Rate Limit error for ${identifier}: `, error);
      return {
        allowed: false,
        remaining: maxRequests,
        resetTime: now + windowSeconds * 1000,
      };
    }
  },
};
