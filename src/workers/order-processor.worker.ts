import { Worker, Job } from 'bullmq';
import { redisConnection, QueueNames } from '../config/queue/connection';
import { queueManager } from '../config/queue/queue-manager';
import { questService } from '../services/quest-engine/quest.service';
// Reward service might be needed in future for direct reward processing
// import { rewardService } from '../services/reward-system/reward.service';
import { logger } from '../utils/logger';
import { ShopifyOrder } from '../services/quest-engine/types';
import { QuestProgressStatus } from '@prisma/client';

/**
 * Job data for order processing
 */
interface OrderProcessingJobData {
  shopId: string;
  order: ShopifyOrder;
}

/**
 * Worker to process orders and update quest progress
 */
export class OrderProcessorWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      QueueNames.ORDER_PROCESSING,
      async (job: Job<OrderProcessingJobData>) => {
        return this.processOrder(job);
      },
      {
        connection: redisConnection,
        concurrency: 5, // Process 5 orders concurrently
      }
    );

    this.setupEventHandlers();
  }

  /**
   * Process an order webhook
   */
  private async processOrder(job: Job<OrderProcessingJobData>) {
    const { shopId, order } = job.data;

    logger.info('Processing order', {
      jobId: job.id,
      shopId,
      orderId: order.id,
      orderNumber: order.order_number,
    });

    try {
      // Get customer ID from order
      const customerId = order.customer?.id;
      if (!customerId) {
        logger.warn('Order has no customer, skipping', {
          orderId: order.id,
        });
        return { success: false, reason: 'No customer ID' };
      }

      // Get all active quests for this shop
      const activeQuests = await questService.getActiveQuestsByShop(shopId);

      if (activeQuests.length === 0) {
        logger.debug('No active quests for shop', { shopId });
        return { success: true, questsProcessed: 0 };
      }

      // Process each quest
      const results = await Promise.all(
        activeQuests.map(async (quest) => {
          try {
            // Update progress for this quest
            const progress = await questService.updateProgress(
              shopId,
              quest.id,
              customerId,
              order
            );

            // Check if quest was just completed
            if (progress.status === QuestProgressStatus.COMPLETED) {
              logger.info('Quest completed! Enqueueing reward issuance', {
                shopId,
                questId: quest.id,
                customerId,
              });

              // Enqueue reward issuance job
              const rewardQueue = queueManager.getQueue(QueueNames.REWARD_ISSUANCE);
              await rewardQueue.add('issue-reward', {
                shopId,
                questId: quest.id,
                customerId,
                rewardId: quest.rewards[0]?.id, // Use first reward (MVP)
              });

              return { questId: quest.id, completed: true, progress };
            }

            return { questId: quest.id, completed: false, progress };
          } catch (error) {
            logger.error('Failed to process quest', {
              questId: quest.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            return { questId: quest.id, error: true };
          }
        })
      );

      const completedCount = results.filter((r) => r.completed).length;
      const errorCount = results.filter((r) => r.error).length;

      logger.info('Order processing complete', {
        jobId: job.id,
        orderId: order.id,
        questsProcessed: results.length,
        questsCompleted: completedCount,
        errors: errorCount,
      });

      return {
        success: true,
        questsProcessed: results.length,
        questsCompleted: completedCount,
        errors: errorCount,
        results,
      };
    } catch (error) {
      logger.error('Order processing failed', {
        jobId: job.id,
        shopId,
        orderId: order.id,
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
      logger.info('Order processing job completed', {
        jobId: job.id,
        result,
      });
    });

    this.worker.on('failed', (job, error) => {
      logger.error('Order processing job failed', {
        jobId: job?.id,
        error: error.message,
        attempts: job?.attemptsMade,
      });
    });

    this.worker.on('error', (error) => {
      logger.error('Order processor worker error', {
        error: error.message,
      });
    });
  }

  /**
   * Close worker gracefully
   */
  async close() {
    await this.worker.close();
    logger.info('Order processor worker closed');
  }
}

// Create worker instance if not in test environment
let orderProcessorWorker: OrderProcessorWorker | null = null;

if (process.env.NODE_ENV !== 'test') {
  orderProcessorWorker = new OrderProcessorWorker();
}

export { orderProcessorWorker };
