import { prisma } from '../../utils/prisma';
import { logger } from '../../utils/logger';
import {
  CreateQuestInput,
  UpdateQuestInput,
  QuestWithRelations,
  ShopifyOrder,
  QuestProgress,
} from './types';
import { QuestConditionType, QuestProgressStatus } from '@prisma/client';
import { orderCountEvaluator } from './evaluators/order-count.evaluator';

export class QuestService {
  /**
   * Create a new quest
   */
  async createQuest(input: CreateQuestInput): Promise<QuestWithRelations> {
    try {
      const quest = await prisma.quest.create({
        data: {
          shopId: input.shopId,
          name: input.name,
          description: input.description,
          isActive: input.isActive ?? true,
          startDate: input.startDate,
          endDate: input.endDate,
          conditions: {
            create: input.conditions.map(c => ({
              type: c.type,
              config: c.config as any,
            })),
          },
          rewards: {
            create: input.rewards.map(r => ({
              type: r.type,
              config: r.config as any,
            })),
          },
        },
        include: {
          conditions: true,
          rewards: true,
        },
      });

      logger.info('Quest created', {
        questId: quest.id,
        shopId: input.shopId,
        name: input.name,
      });

      return quest;
    } catch (error) {
      logger.error('Failed to create quest', {
        shopId: input.shopId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get quest by ID with relations
   */
  async getQuestById(questId: string): Promise<QuestWithRelations | null> {
    return prisma.quest.findUnique({
      where: { id: questId },
      include: {
        conditions: true,
        rewards: true,
      },
    });
  }

  /**
   * Get all active quests for a shop
   */
  async getActiveQuestsByShop(shopId: string): Promise<QuestWithRelations[]> {
    const now = new Date();

    return prisma.quest.findMany({
      where: {
        shopId,
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      include: {
        conditions: true,
        rewards: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get all quests for a shop (including inactive)
   */
  async getAllQuestsByShop(shopId: string): Promise<QuestWithRelations[]> {
    return prisma.quest.findMany({
      where: { shopId },
      include: {
        conditions: true,
        rewards: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update quest
   */
  async updateQuest(
    questId: string,
    input: UpdateQuestInput
  ): Promise<QuestWithRelations> {
    try {
      const quest = await prisma.quest.update({
        where: { id: questId },
        data: input,
        include: {
          conditions: true,
          rewards: true,
        },
      });

      logger.info('Quest updated', { questId, updates: Object.keys(input) });

      return quest;
    } catch (error) {
      logger.error('Failed to update quest', {
        questId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Delete quest (soft delete by setting isActive=false)
   */
  async deleteQuest(questId: string): Promise<void> {
    try {
      await prisma.quest.update({
        where: { id: questId },
        data: { isActive: false },
      });

      logger.info('Quest deleted (soft)', { questId });
    } catch (error) {
      logger.error('Failed to delete quest', {
        questId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get or create customer progress for a quest
   */
  async getOrCreateProgress(
    shopId: string,
    questId: string,
    customerId: string
  ): Promise<QuestProgress> {
    const quest = await this.getQuestById(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    // Get target value from first condition (MVP: single condition per quest)
    const condition = quest.conditions[0];
    let targetValue = 0;

    if (condition.type === QuestConditionType.ORDER_COUNT) {
      targetValue = (condition.config as any).targetOrderCount || 0;
    }

    const existing = await prisma.customerQuestProgress.findUnique({
      where: {
        shopId_questId_shopifyCustomerId: {
          shopId,
          questId,
          shopifyCustomerId: customerId,
        },
      },
    });

    if (existing) {
      return {
        questId: existing.questId,
        customerId: existing.shopifyCustomerId,
        status: existing.status,
        currentValue: existing.currentValue,
        targetValue: existing.targetValue,
        completedAt: existing.completedAt || undefined,
        rewardId: existing.rewardId || undefined,
      };
    }

    // Create new progress
    const newProgress = await prisma.customerQuestProgress.create({
      data: {
        shopId,
        questId,
        shopifyCustomerId: customerId,
        status: QuestProgressStatus.NOT_STARTED,
        currentValue: 0,
        targetValue,
      },
    });

    return {
      questId: newProgress.questId,
      customerId: newProgress.shopifyCustomerId,
      status: newProgress.status,
      currentValue: newProgress.currentValue,
      targetValue: newProgress.targetValue,
      completedAt: newProgress.completedAt || undefined,
      rewardId: newProgress.rewardId || undefined,
    };
  }

  /**
   * Update quest progress after an order
   */
  async updateProgress(
    shopId: string,
    questId: string,
    customerId: string,
    order: ShopifyOrder
  ): Promise<QuestProgress> {
    const quest = await this.getQuestById(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    const progress = await this.getOrCreateProgress(shopId, questId, customerId);

    // Skip if already completed
    if (progress.status === QuestProgressStatus.COMPLETED) {
      return progress;
    }

    // Evaluate condition (MVP: single ORDER_COUNT condition)
    const condition = quest.conditions[0];
    let progressIncrement = 0;

    if (condition.type === QuestConditionType.ORDER_COUNT) {
      progressIncrement = await orderCountEvaluator.evaluate(
        order,
        condition.config as any,
        progress
      );
    }

    if (progressIncrement === 0) {
      return progress; // No progress made
    }

    // Update progress
    const newValue = progress.currentValue + progressIncrement;
    const isCompleted = newValue >= progress.targetValue;

    const updated = await prisma.customerQuestProgress.update({
      where: {
        shopId_questId_shopifyCustomerId: {
          shopId,
          questId,
          shopifyCustomerId: customerId,
        },
      },
      data: {
        currentValue: newValue,
        status: isCompleted
          ? QuestProgressStatus.COMPLETED
          : QuestProgressStatus.IN_PROGRESS,
        lastUpdatedAt: new Date(),
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    logger.info('Quest progress updated', {
      questId,
      customerId,
      oldValue: progress.currentValue,
      newValue,
      isCompleted,
    });

    return {
      questId: updated.questId,
      customerId: updated.shopifyCustomerId,
      status: updated.status,
      currentValue: updated.currentValue,
      targetValue: updated.targetValue,
      completedAt: updated.completedAt || undefined,
      rewardId: updated.rewardId || undefined,
    };
  }

  /**
   * Get customer progress for all active quests
   */
  async getCustomerProgress(
    shopId: string,
    customerId: string
  ): Promise<QuestProgress[]> {
    const progressRecords = await prisma.customerQuestProgress.findMany({
      where: {
        shopId,
        shopifyCustomerId: customerId,
      },
      include: {
        quest: true,
      },
    });

    return progressRecords.map(p => ({
      questId: p.questId,
      customerId: p.shopifyCustomerId,
      status: p.status,
      currentValue: p.currentValue,
      targetValue: p.targetValue,
      completedAt: p.completedAt || undefined,
      rewardId: p.rewardId || undefined,
    }));
  }
}

export const questService = new QuestService();
