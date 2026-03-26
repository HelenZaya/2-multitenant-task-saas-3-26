import Redis from 'ioredis';
import { env } from './env.js';

export let redis: Redis | null = null;

export async function connectRedis() {
  try {
    redis = new Redis(env.redisUrl, { maxRetriesPerRequest: 1 });
    redis.on('error', (err) => console.error('Redis error', err.message));
    await redis.ping();
    console.log('Redis connected');
  } catch (error) {
    console.warn('Redis unavailable, continuing without Redis');
    redis = null;
  }
}
