import { Worker, Job } from 'bullmq';
import { redisConnection, QueueNames } from '../config/queue/connection';
import { rewardService } from '../services/reward-system/reward.service';
import { logger } from '../utils/logger';

/**
 * Job data for reward issuance
 */
interface RewardIssuanceJobData {
  shopId: string;
  questId: string;
  customerId: string;
  rewardId: string;
}

/**
 * Worker to issue rewards when quests are completed
 */
export class RewardIssuerWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      QueueNames.REWARD_ISSUANCE,
      async (job: Job<RewardIssuanceJobData>) => {
        return this.issueReward(job);
      },
      {
        connection: redisConnection,
        concurrency: 3, // Process 3 rewards concurrently
      }
    );

    this.setupEventHandlers();
  }

  /**
   * Issue a reward to a customer
   */
  private async issueReward(job: Job<RewardIssuanceJobData>) {
    const { shopId, questId, customerId, rewardId } = job.data;

    logger.info('Issuing reward', {
      jobId: job.id,
      shopId,
      questId,
      customerId,
      rewardId,
    });

    try {
      // Issue the reward (creates Shopify discount code)
      const discountCode = await rewardService.issueReward(
        shopId,
        questId,
        rewardId,
        customerId
      );

      if (!discountCode) {
        throw new Error('Failed to generate discount code');
      }

      logger.info('Reward issued successfully', {
        jobId: job.id,
        shopId,
        questId,
        customerId,
        discountCode,
      });

      // TODO: Send notification to customer (email, SMS, etc.)
      // This would be another job in a notification queue

      return {
        success: true,
        discountCode,
        issuedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Reward issuance failed', {
        jobId: job.id,
        shopId,
        questId,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error; // Will trigger retry
    }
  }

  /**
   * Setup event handlers for worker
   */
  private setupEventHandlers() {
    this.worker.on('completed', (job, result) => {
      logger.info('Reward issuance job completed', {
        jobId: job.id,
        discountCode: result.discountCode,
      });
    });

    this.worker.on('failed', (job, error) => {
      logger.error('Reward issuance job failed', {
        jobId: job?.id,
        error: error.message,
        attempts: job?.attemptsMade,
      });
    });

    this.worker.on('error', (error) => {
      logger.error('Reward issuer worker error', {
        error: error.message,
      });
    });
  }

  /**
   * Close worker gracefully
   */
  async close() {
    await this.worker.close();
    logger.info('Reward issuer worker closed');
  }
}

// Create worker instance if not in test environment
let rewardIssuerWorker: RewardIssuerWorker | null = null;

if (process.env.NODE_ENV !== 'test') {
  rewardIssuerWorker = new RewardIssuerWorker();
}

export { rewardIssuerWorker };
