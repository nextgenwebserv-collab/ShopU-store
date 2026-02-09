import { Redis } from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

const REDIS_URL = process.env.REDIS_URL;

let redisClient: Redis | null = null;

export const connectToRedis = async (): Promise<Redis> => {
  try {
    if (globalForRedis.redis) {
      redisClient = globalForRedis.redis;
      return redisClient;
    }

    if (!REDIS_URL) {
      throw new Error('REDIS_URL not exists in env');
    }

    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    client.on('connect', () => {
      console.log('Redis connecting');
    });

    client.on('ready', () => {
      console.log('Redis connected and ready');
    });

    client.on('error', err => {
      console.log('Redis error', err);
    });

    client.on('reconnecting', () => {
      console.log('Redis reconnecting');
    });

    if (typeof process !== 'undefined') {
      process.on('SIGINT', async () => {
        await client.quit();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await client.quit();
        process.exit(0);
      });
    }

    redisClient = client;

    if (process.env.NODE_ENV !== 'production') {
      globalForRedis.redis = client;
    }

    return client;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized, call connectRedis() first');
  }
  return redisClient;
};

export { Redis };
