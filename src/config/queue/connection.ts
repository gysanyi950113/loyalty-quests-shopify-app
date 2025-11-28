import { ConnectionOptions } from 'bullmq';
import { config } from '../environment';
import { logger } from '../../utils/logger';

/**
 * Parse Redis URL to extract connection details
 */
function parseRedisUrl(url: string): { host: string; port: number; password?: string; username?: string } {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
  };
}

/**
 * Redis connection configuration for BullMQ
 * Prefer REDIS_URL if available, otherwise use individual params
 */
export const redisConnection: ConnectionOptions = config.redis.url
  ? {
      // Use Redis URL if available (includes auth)
      ...parseRedisUrl(config.redis.url),
      maxRetriesPerRequest: null,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn('Redis connection retry', { attempt: times, delayMs: delay });
        return delay;
      },
    }
  : {
      // Fallback to individual connection params
      host: config.bullmq.redis.host,
      port: config.bullmq.redis.port,
      ...(config.bullmq.redis.password && { password: config.bullmq.redis.password }),
      maxRetriesPerRequest: null,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn('Redis connection retry', { attempt: times, delayMs: delay });
        return delay;
      },
    };

/**
 * Default job options for all queues
 */
export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 1000,
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours
    count: 1000, // Keep last 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days
  },
};

/**
 * Queue names
 */
export const QueueNames = {
  ORDER_PROCESSING: 'order-processing',
  QUEST_EVALUATION: 'quest-evaluation',
  REWARD_ISSUANCE: 'reward-issuance',
  ANALYTICS: 'analytics',
} as const;

export type QueueName = typeof QueueNames[keyof typeof QueueNames];
