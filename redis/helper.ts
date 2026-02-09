import { connectToRedis, getRedisClient } from './redisClient';

async function getClient() {
  await connectToRedis();
  return getRedisClient();
}

export const cache = {
  async get<T = string>(key: string): Promise<T | null> {
    try {
      const redis = await getClient();
      const value = await redis.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.log(`Redis GET error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    try {
      const redis = await getClient();
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      if (ttl) {
        await redis.setex(key, ttl, stringValue);
      } else {
        await redis.set(key, stringValue);
      }

      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  },

  async delete(key: string): Promise<boolean> {
    try {
      const redis = await getClient();
      const result = await redis.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Redis DELETE error for key ${key}:`, error);
      return false;
    }
  },

  async deleteMany(keys: string[]): Promise<number> {
    try {
      const redis = await getClient();
      if (keys.length === 0) return 0;
      return await redis.del(...keys);
    } catch (error) {
      console.error(`Redis DELETE MANY error:`, error);
      return 0;
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const redis = await getClient();
      return (await redis.exists(key)) === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  },
};

// ================= PUB / SUB =====================

export const pubsub = {
  async publish(channel: string, message: string): Promise<number> {
    const redis = await getClient();
    return redis.publish(channel, message);
  },

  async subscribe(
    channels: string | string[],
    callback: (channel: string, message: string) => void
  ) {
    const redis = await getClient();
    const subscriber = redis.duplicate();

    const channelArray = Array.isArray(channels) ? channels : [channels];

    await new Promise<void>((resolve, reject) => {
      subscriber.subscribe(...channelArray, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    subscriber.on('message', (channel, message) => callback(channel, message));

    subscriber.on('error', err => {
      console.error('Redis subscriber error:', err);
    });
  },
};
