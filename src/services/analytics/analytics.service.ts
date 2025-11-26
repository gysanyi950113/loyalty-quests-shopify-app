import { PrismaClient, QuestProgressStatus } from '@prisma/client';
import { prisma } from '../../utils/prisma.js';
import { logger } from '../../utils/logger.js';

/**
 * Analytics Service
 *
 * Provides aggregated metrics and insights for quest performance,
 * customer engagement, and reward redemption.
 */

export interface QuestAnalytics {
  questId: string;
  questName: string;
  isActive: boolean;
  totalParticipants: number;
  completedCount: number;
  inProgressCount: number;
  completionRate: number;
  averageProgress: number;
  rewardIssuedCount: number;
  rewardRedeemedCount: number;
  redemptionRate: number;
}

export interface OverallMetrics {
  totalQuests: number;
  activeQuests: number;
  totalParticipants: number;
  totalCompletions: number;
  totalRewardsIssued: number;
  totalRewardsRedeemed: number;
  overallCompletionRate: number;
  overallRedemptionRate: number;
}

export interface CustomerEngagement {
  totalCustomers: number;
  activeCustomers: number;
  completedAtLeastOne: number;
  averageQuestsPerCustomer: number;
  topCustomers: Array<{
    shopifyCustomerId: string;
    completedQuests: number;
    rewardsEarned: number;
  }>;
}

export interface RevenueImpact {
  totalRewardsIssued: number;
  totalRewardsRedeemed: number;
  estimatedDiscountValue: number;
  redemptionsByType: Record<string, number>;
}

export class AnalyticsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get comprehensive analytics for all quests in a shop
   */
  async getShopAnalytics(shopId: string): Promise<QuestAnalytics[]> {
    try {
      const quests = await this.prisma.quest.findMany({
        where: { shopId },
        include: {
          progress: true,
          rewards: {
            include: {
              redemptions: true,
            },
          },
        },
      });

      const analytics: QuestAnalytics[] = quests.map((quest) => {
        const totalParticipants = quest.progress.length;
        const completedCount = quest.progress.filter(
          (p) => p.status === QuestProgressStatus.COMPLETED
        ).length;
        const inProgressCount = quest.progress.filter(
          (p) => p.status === QuestProgressStatus.IN_PROGRESS
        ).length;

        const completionRate =
          totalParticipants > 0 ? (completedCount / totalParticipants) * 100 : 0;

        const averageProgress =
          totalParticipants > 0
            ? quest.progress.reduce((sum, p) => {
                const progressPct = (p.currentValue / p.targetValue) * 100;
                return sum + progressPct;
              }, 0) / totalParticipants
            : 0;

        const rewardIssuedCount = quest.rewards.reduce(
          (sum, reward) => sum + reward.redemptions.length,
          0
        );

        const rewardRedeemedCount = quest.rewards.reduce(
          (sum, reward) =>
            sum +
            reward.redemptions.filter((r) => r.redeemedAt !== null).length,
          0
        );

        const redemptionRate =
          rewardIssuedCount > 0
            ? (rewardRedeemedCount / rewardIssuedCount) * 100
            : 0;

        return {
          questId: quest.id,
          questName: quest.name,
          isActive: quest.isActive,
          totalParticipants,
          completedCount,
          inProgressCount,
          completionRate: Math.round(completionRate * 100) / 100,
          averageProgress: Math.round(averageProgress * 100) / 100,
          rewardIssuedCount,
          rewardRedeemedCount,
          redemptionRate: Math.round(redemptionRate * 100) / 100,
        };
      });

      return analytics;
    } catch (error) {
      logger.error('Error getting shop analytics', { error, shopId });
      throw new Error('Failed to retrieve shop analytics');
    }
  }

  /**
   * Get overall metrics across all quests
   */
  async getOverallMetrics(shopId: string): Promise<OverallMetrics> {
    try {
      const [
        totalQuests,
        activeQuests,
        progressRecords,
        redemptions,
      ] = await Promise.all([
        this.prisma.quest.count({ where: { shopId } }),
        this.prisma.quest.count({ where: { shopId, isActive: true } }),
        this.prisma.customerQuestProgress.findMany({
          where: { shopId },
          select: { shopifyCustomerId: true, status: true },
        }),
        this.prisma.rewardRedemption.findMany({
          where: { shopId },
          select: { redeemedAt: true },
        }),
      ]);

      const uniqueParticipants = new Set(
        progressRecords.map((p) => p.shopifyCustomerId)
      ).size;

      const completedCount = progressRecords.filter(
        (p) => p.status === QuestProgressStatus.COMPLETED
      ).length;

      const totalRewardsIssued = redemptions.length;
      const totalRewardsRedeemed = redemptions.filter(
        (r) => r.redeemedAt !== null
      ).length;

      const overallCompletionRate =
        progressRecords.length > 0
          ? (completedCount / progressRecords.length) * 100
          : 0;

      const overallRedemptionRate =
        totalRewardsIssued > 0
          ? (totalRewardsRedeemed / totalRewardsIssued) * 100
          : 0;

      return {
        totalQuests,
        activeQuests,
        totalParticipants: uniqueParticipants,
        totalCompletions: completedCount,
        totalRewardsIssued,
        totalRewardsRedeemed,
        overallCompletionRate: Math.round(overallCompletionRate * 100) / 100,
        overallRedemptionRate: Math.round(overallRedemptionRate * 100) / 100,
      };
    } catch (error) {
      logger.error('Error getting overall metrics', { error, shopId });
      throw new Error('Failed to retrieve overall metrics');
    }
  }

  /**
   * Get customer engagement metrics
   */
  async getCustomerEngagement(shopId: string): Promise<CustomerEngagement> {
    try {
      const progressRecords = await this.prisma.customerQuestProgress.findMany({
        where: { shopId },
        select: {
          shopifyCustomerId: true,
          status: true,
        },
      });

      const redemptions = await this.prisma.rewardRedemption.findMany({
        where: { shopId },
        select: {
          shopifyCustomerId: true,
        },
      });

      const customerMap = new Map<
        string,
        { completed: number; rewards: number; hasActivity: boolean }
      >();

      progressRecords.forEach((record) => {
        const existing = customerMap.get(record.shopifyCustomerId) || {
          completed: 0,
          rewards: 0,
          hasActivity: false,
        };
        customerMap.set(record.shopifyCustomerId, {
          ...existing,
          completed:
            existing.completed +
            (record.status === QuestProgressStatus.COMPLETED ? 1 : 0),
          hasActivity:
            existing.hasActivity ||
            record.status === QuestProgressStatus.IN_PROGRESS ||
            record.status === QuestProgressStatus.COMPLETED,
        });
      });

      redemptions.forEach((redemption) => {
        const existing = customerMap.get(redemption.shopifyCustomerId) || {
          completed: 0,
          rewards: 0,
          hasActivity: false,
        };
        customerMap.set(redemption.shopifyCustomerId, {
          ...existing,
          rewards: existing.rewards + 1,
        });
      });

      const totalCustomers = customerMap.size;
      const activeCustomers = Array.from(customerMap.values()).filter(
        (c) => c.hasActivity
      ).length;
      const completedAtLeastOne = Array.from(customerMap.values()).filter(
        (c) => c.completed > 0
      ).length;

      const averageQuestsPerCustomer =
        totalCustomers > 0 ? progressRecords.length / totalCustomers : 0;

      // Get top 10 customers
      const topCustomers = Array.from(customerMap.entries())
        .map(([customerId, data]) => ({
          shopifyCustomerId: customerId,
          completedQuests: data.completed,
          rewardsEarned: data.rewards,
        }))
        .sort((a, b) => b.completedQuests - a.completedQuests)
        .slice(0, 10);

      return {
        totalCustomers,
        activeCustomers,
        completedAtLeastOne,
        averageQuestsPerCustomer:
          Math.round(averageQuestsPerCustomer * 100) / 100,
        topCustomers,
      };
    } catch (error) {
      logger.error('Error getting customer engagement', { error, shopId });
      throw new Error('Failed to retrieve customer engagement metrics');
    }
  }

  /**
   * Get revenue impact metrics
   */
  async getRevenueImpact(shopId: string): Promise<RevenueImpact> {
    try {
      const redemptions = await this.prisma.rewardRedemption.findMany({
        where: { shopId },
        include: {
          reward: true,
        },
      });

      const totalRewardsIssued = redemptions.length;
      const totalRewardsRedeemed = redemptions.filter(
        (r) => r.redeemedAt !== null
      ).length;

      // Estimate discount value (simplified calculation)
      let estimatedDiscountValue = 0;
      const redemptionsByType: Record<string, number> = {};

      redemptions.forEach((redemption) => {
        const rewardType = redemption.reward.type;
        redemptionsByType[rewardType] =
          (redemptionsByType[rewardType] || 0) + 1;

        if (redemption.redeemedAt) {
          const config = redemption.reward.config as any;

          // Estimate based on reward type
          if (rewardType === 'DISCOUNT_PERCENTAGE') {
            // Assume average order value of $100 for estimation
            const percentage = config.percentage || 0;
            const maxAmount = config.maximumAmount || percentage;
            estimatedDiscountValue += Math.min((100 * percentage) / 100, maxAmount);
          } else if (rewardType === 'DISCOUNT_FIXED') {
            estimatedDiscountValue += config.amount || 0;
          } else if (rewardType === 'FREE_SHIPPING') {
            // Assume average shipping cost of $10
            estimatedDiscountValue += 10;
          }
        }
      });

      return {
        totalRewardsIssued,
        totalRewardsRedeemed,
        estimatedDiscountValue: Math.round(estimatedDiscountValue * 100) / 100,
        redemptionsByType,
      };
    } catch (error) {
      logger.error('Error getting revenue impact', { error, shopId });
      throw new Error('Failed to retrieve revenue impact metrics');
    }
  }

  /**
   * Get analytics for a specific quest
   */
  async getQuestAnalytics(
    shopId: string,
    questId: string
  ): Promise<QuestAnalytics | null> {
    try {
      const quest = await this.prisma.quest.findFirst({
        where: { id: questId, shopId },
        include: {
          progress: true,
          rewards: {
            include: {
              redemptions: true,
            },
          },
        },
      });

      if (!quest) {
        return null;
      }

      const totalParticipants = quest.progress.length;
      const completedCount = quest.progress.filter(
        (p) => p.status === QuestProgressStatus.COMPLETED
      ).length;
      const inProgressCount = quest.progress.filter(
        (p) => p.status === QuestProgressStatus.IN_PROGRESS
      ).length;

      const completionRate =
        totalParticipants > 0 ? (completedCount / totalParticipants) * 100 : 0;

      const averageProgress =
        totalParticipants > 0
          ? quest.progress.reduce((sum, p) => {
              const progressPct = (p.currentValue / p.targetValue) * 100;
              return sum + progressPct;
            }, 0) / totalParticipants
          : 0;

      const rewardIssuedCount = quest.rewards.reduce(
        (sum, reward) => sum + reward.redemptions.length,
        0
      );

      const rewardRedeemedCount = quest.rewards.reduce(
        (sum, reward) =>
          sum + reward.redemptions.filter((r) => r.redeemedAt !== null).length,
        0
      );

      const redemptionRate =
        rewardIssuedCount > 0
          ? (rewardRedeemedCount / rewardIssuedCount) * 100
          : 0;

      return {
        questId: quest.id,
        questName: quest.name,
        isActive: quest.isActive,
        totalParticipants,
        completedCount,
        inProgressCount,
        completionRate: Math.round(completionRate * 100) / 100,
        averageProgress: Math.round(averageProgress * 100) / 100,
        rewardIssuedCount,
        rewardRedeemedCount,
        redemptionRate: Math.round(redemptionRate * 100) / 100,
      };
    } catch (error) {
      logger.error('Error getting quest analytics', { error, shopId, questId });
      throw new Error('Failed to retrieve quest analytics');
    }
  }
}

export const analyticsService = new AnalyticsService();
