import { logger } from '../utils/logger';
import { orderProcessorWorker } from './order-processor.worker';
import { rewardIssuerWorker } from './reward-issuer.worker';

/**
 * Start all workers
 */
export function startWorkers() {
  if (process.env.NODE_ENV === 'test') {
    logger.info('Skipping workers in test environment');
    return;
  }

  logger.info('Starting all BullMQ workers...');

  // Workers are auto-started when imported
  if (orderProcessorWorker) {
    logger.info('✓ Order Processor Worker started');
  }

  if (rewardIssuerWorker) {
    logger.info('✓ Reward Issuer Worker started');
  }

  logger.info('All workers started successfully');
}

/**
 * Stop all workers gracefully
 */
export async function stopWorkers() {
  logger.info('Stopping all workers...');

  const promises = [];

  if (orderProcessorWorker) {
    promises.push(orderProcessorWorker.close());
  }

  if (rewardIssuerWorker) {
    promises.push(rewardIssuerWorker.close());
  }

  await Promise.all(promises);

  logger.info('All workers stopped');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, stopping workers...');
  await stopWorkers();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, stopping workers...');
  await stopWorkers();
  process.exit(0);
});
