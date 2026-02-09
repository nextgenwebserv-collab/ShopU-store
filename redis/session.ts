import { cache } from './helper.js';
import { getRedisClient } from './redisClient.js';

const redis = getRedisClient();

export interface SessionData {
  id: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export interface Session {
  sessionId: string;
  data: SessionData;
  createdAt: number;
  expiresAt: number;
}

const SESSION_PREFIX = 'session';
const DEFAULT_TTL = 7 * 24 * 60 * 60;

export const sessionManager = {
  async create(sessionId: string, data: SessionData, ttl: number = DEFAULT_TTL): Promise<boolean> {
    try {
      const now = Date.now();
      const session: Session = {
        sessionId,
        data,
        createdAt: now,
        expiresAt: now + ttl * 1000,
      };

      const key = `${SESSION_PREFIX}:${sessionId}`;
      return await cache.set(key, session, ttl);
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async delete(sessionId: string): Promise<boolean> {
    try {
      const key = `${SESSION_PREFIX}:${sessionId}`;
      return await cache.delete(key);
    } catch (error) {
      console.error(`Session DELETE error for ${sessionId}: `, error);
      return false;
    }
  },

  async get(sessionId: string): Promise<Session | null> {
    try {
      const key = `${SESSION_PREFIX}:${sessionId}`;
      const session = await cache.get<Session>(key);

      if (!session) return null;

      if (session.expiresAt < Date.now()) {
        await this.delete(sessionId);
        return null;
      }

      return session;
    } catch (error) {
      console.error(`Session GET error for ${sessionId}: `, error);
      return null;
    }
  },

  async update(sessionId: string, data: Partial<SessionData>): Promise<boolean> {
    try {
      const session = await this.get(sessionId);
      if (!session) return false;

      const updatedData: SessionData = {
        ...session.data,
        ...data,
      };

      const updatedSession: Session = {
        ...session,
        data: updatedData,
      };

      const key = `${SESSION_PREFIX}:${sessionId}`;
      return await cache.set(key, updatedSession, DEFAULT_TTL);
    } catch (error) {
      console.error(`Session UPDATE error for ${sessionId}: `, error);
      return false;
    }
  },

  async refresh(sessionId: string, ttl: number = DEFAULT_TTL): Promise<boolean> {
    try {
      const session = await this.get(sessionId);
      if (!session) return false;

      const udpatedSession: Session = {
        ...session,
        expiresAt: Date.now() + ttl * 1000,
      };

      const key = `${SESSION_PREFIX}:${sessionId}`;
      return await cache.set(key, udpatedSession, ttl);
    } catch (error) {
      console.error(`Session REFRESH error for ${sessionId}: `, error);
      return false;
    }
  },

  async deleteMany(sessionIds: string[]): Promise<number> {
    try {
      const keys = sessionIds.map(id => `${SESSION_PREFIX}:${id}`);
      return await cache.deleteMany(keys);
    } catch (error) {
      console.error(`Session DELETE MANY error: `, error);
      return 0;
    }
  },

  async exists(sessionId: string): Promise<boolean> {
    try {
      const session = await this.get(sessionId);
      return session !== null;
    } catch (error) {
      console.error(`Session EXISTS error for ${SESSION_PREFIX}: `, error);
      return false;
    }
  },

  async getTTL(sessionId: string): Promise<number> {
    try {
      const key = `${SESSION_PREFIX}:${sessionId}`;
      return await redis.ttl(key);
    } catch (error) {
      console.error(`Session TTL error for ${sessionId}: `, error);
      return -2;
    }
  },

  async getUserSessions(userId: string): Promise<string[]> {
    try {
      const pattern = `${SESSION_PREFIX}:*`;
      const sessionIds: string[] = [];

      let count = '0';
      do {
        const [nextCount, keys] = await redis.scan(count, 'MATCH', pattern, 'COUNT', 100);
        count = nextCount;

        for (const key of keys) {
          const session = await cache.get<Session>(key);
          if (session && session.data.userId === userId) {
            const sessionId = key.replace(`${SESSION_PREFIX}:`, '');
            sessionIds.push(sessionId);
          }
        }
      } while (count !== '0');

      return sessionIds;
    } catch (error) {
      console.error(`Session GET USER SESSIONS error for ${userId}: `, error);
      return [];
    }
  },
};
