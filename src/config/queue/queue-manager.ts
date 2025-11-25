import { Queue } from 'bullmq';
import { redisConnection, defaultJobOptions, QueueNames, QueueName } from './connection';
import { logger } from '../../utils/logger';

/**
 * Queue manager to create and manage BullMQ queues
 */
class QueueManager {
  private queues: Map<QueueName, Queue> = new Map();

  /**
   * Get or create a queue
   */
  getQueue(name: QueueName): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: redisConnection,
        defaultJobOptions,
      });

      queue.on('error', (error) => {
        logger.error('Queue error', { queue: name, error: error.message });
      });

      this.queues.set(name, queue);
      logger.info('Queue created', { name });
    }

    return this.queues.get(name)!;
  }

  /**
   * Close all queues
   */
  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.queues.values()).map((queue) =>
      queue.close()
    );
    await Promise.all(closePromises);
    logger.info('All queues closed');
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(name: QueueName) {
    const queue = this.getQueue(name);

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      name,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Get all queue statistics
   */
  async getAllStats() {
    const queueNames = Object.values(QueueNames);
    const stats = await Promise.all(
      queueNames.map((name) => this.getQueueStats(name))
    );
    return stats;
  }
}

export const queueManager = new QueueManager();

// Graceful shutdown
process.on('beforeExit', async () => {
  await queueManager.closeAll();
});
