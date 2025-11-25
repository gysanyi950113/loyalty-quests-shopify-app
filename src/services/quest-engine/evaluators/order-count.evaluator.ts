import {
  IConditionEvaluator,
  OrderCountConditionConfig,
  QuestProgress,
  ShopifyOrder,
} from '../types';
import { logger } from '../../../utils/logger';

/**
 * Evaluates ORDER_COUNT quest conditions
 * Counts number of orders placed by customer
 */
export class OrderCountEvaluator implements IConditionEvaluator {
  /**
   * Evaluate order for ORDER_COUNT condition
   * Returns 1 if order should be counted, 0 otherwise
   */
  async evaluate(
    order: ShopifyOrder,
    condition: OrderCountConditionConfig,
    currentProgress: QuestProgress
  ): Promise<number> {
    try {
      // Only count paid orders
      if (order.financial_status !== 'paid') {
        logger.debug('Order not paid, skipping', {
          orderId: order.id,
          status: order.financial_status,
        });
        return 0;
      }

      // Check time window if specified
      if (condition.timeWindowDays) {
        const orderDate = new Date(order.created_at);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - condition.timeWindowDays);

        if (orderDate < cutoffDate) {
          logger.debug('Order outside time window', {
            orderId: order.id,
            orderDate,
            cutoffDate,
          });
          return 0;
        }
      }

      // Order counts toward quest
      logger.info('Order counted toward quest', {
        orderId: order.id,
        questId: currentProgress.questId,
        customerId: currentProgress.customerId,
      });

      return 1;
    } catch (error) {
      logger.error('Failed to evaluate order count condition', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 0;
    }
  }

  /**
   * Check if quest is completed
   */
  isCompleted(currentValue: number, targetValue: number): boolean {
    return currentValue >= targetValue;
  }

  /**
   * Calculate target value from config
   */
  getTargetValue(config: OrderCountConditionConfig): number {
    return config.targetOrderCount;
  }
}

export const orderCountEvaluator = new OrderCountEvaluator();
