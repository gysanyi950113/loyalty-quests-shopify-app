import { prisma } from '../../utils/prisma';
import { QuestProgressStatus } from '@prisma/client';
import { logger } from '../../utils/logger';

export class CustomerQuestService {
  /**
   * Get all active quests with customer's progress
   */
  async getCustomerQuests(shopId: string, customerId: string) {
    try {
      // Get all active quests for the shop
      const quests = await prisma.quest.findMany({
        where: {
          shopId,
          isActive: true,
          OR: [
            { startDate: null },
            { startDate: { lte: new Date() } },
          ],
          AND: [
            {
              OR: [
                { endDate: null },
                { endDate: { gte: new Date() } },
              ],
            },
          ],
        },
        include: {
          conditions: true,
          rewards: true,
          progress: {
            where: {
              shopifyCustomerId: customerId,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform to include progress info
      return quests.map(quest => {
        const progress = quest.progress[0]; // Only one progress record per customer per quest

        return {
          id: quest.id,
          name: quest.name,
          description: quest.description,
          startDate: quest.startDate,
          endDate: quest.endDate,
          conditions: quest.conditions,
          rewards: quest.rewards,
          progress: progress ? {
            status: progress.status,
            currentValue: progress.currentValue,
            targetValue: progress.targetValue,
            completedAt: progress.completedAt,
            percentComplete: progress.targetValue > 0
              ? Math.min(
                  Math.round((progress.currentValue / progress.targetValue) * 100),
                  100
                )
              : 0,
          } : {
            status: QuestProgressStatus.NOT_STARTED,
            currentValue: 0,
            targetValue: this.getTargetValueFromConditions(quest.conditions),
            completedAt: null,
            percentComplete: 0,
          },
        };
      });
    } catch (error) {
      logger.error('Failed to get customer quests', {
        shopId,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get single quest with customer's progress
   */
  async getCustomerQuest(shopId: string, questId: string, customerId: string) {
    try {
      const quest = await prisma.quest.findFirst({
        where: {
          id: questId,
          shopId,
          isActive: true,
        },
        include: {
          conditions: true,
          rewards: true,
          progress: {
            where: {
              shopifyCustomerId: customerId,
            },
          },
        },
      });

      if (!quest) {
        return null;
      }

      const progress = quest.progress[0];

      return {
        id: quest.id,
        name: quest.name,
        description: quest.description,
        startDate: quest.startDate,
        endDate: quest.endDate,
        conditions: quest.conditions,
        rewards: quest.rewards,
        progress: progress ? {
          status: progress.status,
          currentValue: progress.currentValue,
          targetValue: progress.targetValue,
          completedAt: progress.completedAt,
          percentComplete: progress.targetValue > 0
            ? Math.min(
                Math.round((progress.currentValue / progress.targetValue) * 100),
                100
              )
            : 0,
        } : {
          status: QuestProgressStatus.NOT_STARTED,
          currentValue: 0,
          targetValue: this.getTargetValueFromConditions(quest.conditions),
          completedAt: null,
          percentComplete: 0,
        },
      };
    } catch (error) {
      logger.error('Failed to get customer quest', {
        shopId,
        questId,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get customer's rewards (available and redeemed)
   */
  async getCustomerRewards(shopId: string, customerId: string) {
    try {
      const rewards = await prisma.rewardRedemption.findMany({
        where: {
          shopId,
          shopifyCustomerId: customerId,
        },
        include: {
          reward: {
            include: {
              quest: true,
            },
          },
        },
        orderBy: {
          issuedAt: 'desc',
        },
      });

      return rewards.map(redemption => ({
        id: redemption.id,
        questName: redemption.reward.quest.name,
        rewardType: redemption.reward.type,
        rewardConfig: redemption.reward.config,
        discountCode: redemption.discountCode,
        issuedAt: redemption.issuedAt,
        redeemedAt: redemption.redeemedAt,
        expiresAt: redemption.expiresAt,
        isExpired: redemption.expiresAt ? new Date() > redemption.expiresAt : false,
        isRedeemed: !!redemption.redeemedAt,
      }));
    } catch (error) {
      logger.error('Failed to get customer rewards', {
        shopId,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get customer's stats
   */
  async getCustomerStats(shopId: string, customerId: string) {
    try {
      const [
        totalQuests,
        completedQuests,
        inProgressQuests,
        totalRewards,
      ] = await Promise.all([
        // Total active quests
        prisma.quest.count({
          where: { shopId, isActive: true },
        }),
        // Completed quests
        prisma.customerQuestProgress.count({
          where: {
            shopId,
            shopifyCustomerId: customerId,
            status: QuestProgressStatus.COMPLETED,
          },
        }),
        // In progress quests
        prisma.customerQuestProgress.count({
          where: {
            shopId,
            shopifyCustomerId: customerId,
            status: QuestProgressStatus.IN_PROGRESS,
          },
        }),
        // Total rewards earned
        prisma.rewardRedemption.count({
          where: {
            shopId,
            shopifyCustomerId: customerId,
          },
        }),
      ]);

      return {
        totalQuests,
        completedQuests,
        inProgressQuests,
        totalRewards,
        availableQuests: totalQuests - completedQuests,
      };
    } catch (error) {
      logger.error('Failed to get customer stats', {
        shopId,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Helper to extract target value from quest conditions
   */
  private getTargetValueFromConditions(conditions: any[]): number {
    // Simple logic: take the first condition's target
    // In a real app, you might have more complex logic
    if (!conditions || conditions.length === 0) {
      return 1;
    }

    const firstCondition = conditions[0];
    const config = firstCondition.config as any;

    return config.requiredCount || config.requiredValue || 1;
  }
}

export const customerQuestService = new CustomerQuestService();
