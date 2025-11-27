import { ConnectionOptions } from 'bullmq';
import { config } from '../environment';
import { logger } from '../../utils/logger';

/**
 * Redis connection configuration for BullMQ
 */
export const redisConnection: ConnectionOptions = {
  host: config.bullmq.redis.host,
  port: config.bullmq.redis.port,
  password: config.bullmq.redis.password,
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
