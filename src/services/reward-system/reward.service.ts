import { prisma } from '../../utils/prisma';
import { logger } from '../../utils/logger';
import { createShopifyClient } from '../shopify/client';
import { QuestRewardType } from '@prisma/client';
import { DiscountPercentageRewardConfig, DiscountFixedRewardConfig, FreeShippingRewardConfig } from '../quest-engine/types';

export class RewardService {
  /**
   * Issue a reward to a customer upon quest completion
   */
  async issueReward(
    shopId: string,
    questId: string,
    rewardId: string,
    customerId: string
  ): Promise<string | null> {
    try {
      // Get shop and reward details
      const shop = await prisma.shop.findUnique({ where: { id: shopId } });
      if (!shop) {
        throw new Error('Shop not found');
      }

      const reward = await prisma.questReward.findUnique({ where: { id: rewardId } });
      if (!reward) {
        throw new Error('Reward not found');
      }

      // Check if reward already issued
      const existing = await prisma.rewardRedemption.findFirst({
        where: {
          shopId,
          questId,
          rewardId,
          shopifyCustomerId: customerId,
        },
      });

      if (existing) {
        logger.info('Reward already issued', {
          shopId,
          questId,
          customerId,
          discountCode: existing.discountCode,
        });
        return existing.discountCode;
      }

      // Generate discount code based on reward type
      let discountCode: string | null = null;

      switch (reward.type) {
        case QuestRewardType.DISCOUNT_PERCENTAGE:
          discountCode = await this.createPercentageDiscount(
            shop.shopDomain,
            shop.accessToken,
            reward.config as any,
            questId,
            customerId
          );
          break;

        case QuestRewardType.DISCOUNT_FIXED:
          discountCode = await this.createFixedDiscount(
            shop.shopDomain,
            shop.accessToken,
            reward.config as any,
            questId,
            customerId
          );
          break;

        case QuestRewardType.FREE_SHIPPING:
          discountCode = await this.createFreeShippingDiscount(
            shop.shopDomain,
            shop.accessToken,
            reward.config as any,
            questId,
            customerId
          );
          break;

        default:
          logger.warn('Unsupported reward type', { type: reward.type });
          return null;
      }

      if (!discountCode) {
        throw new Error('Failed to generate discount code');
      }

      // Calculate expiry date
      const config = reward.config as any;
      const expiryDays = config.expiryDays || 30; // Default 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // Store redemption record
      await prisma.rewardRedemption.create({
        data: {
          shopId,
          questId,
          rewardId,
          shopifyCustomerId: customerId,
          discountCode,
          expiresAt,
        },
      });

      // Update customer progress to REWARDED status
      await prisma.customerQuestProgress.updateMany({
        where: {
          shopId,
          questId,
          shopifyCustomerId: customerId,
        },
        data: {
          status: 'REWARDED',
          rewardId,
        },
      });

      logger.info('Reward issued successfully', {
        shopId,
        questId,
        customerId,
        discountCode,
        expiresAt,
      });

      return discountCode;
    } catch (error) {
      logger.error('Failed to issue reward', {
        shopId,
        questId,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Create percentage discount code in Shopify
   */
  private async createPercentageDiscount(
    shopDomain: string,
    accessToken: string,
    config: DiscountPercentageRewardConfig,
    questId: string,
    customerId: string
  ): Promise<string> {
    const client = createShopifyClient(shopDomain, accessToken);

    // Generate unique discount code
    const code = this.generateDiscountCode('QUEST', questId, customerId);

    const discountData = {
      price_rule: {
        title: `Quest Reward - ${code}`,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: 'percentage',
        value: `-${config.percentage}`,
        customer_selection: 'all',
        once_per_customer: true,
        usage_limit: 1,
        starts_at: new Date().toISOString(),
      },
    };

    // Add minimum order value if specified
    if (config.minimumOrderValue) {
      (discountData.price_rule as any).prerequisite_subtotal_range = {
        greater_than_or_equal_to: config.minimumOrderValue.toString(),
      };
    }

    // Create price rule
    const priceRuleResponse = await client.post({
      path: 'price_rules',
      data: discountData,
      type: 'application/json',
    });

    const priceRuleId = (priceRuleResponse.body as any).price_rule.id;

    // Create discount code
    const discountCodeResponse = await client.post({
      path: `price_rules/${priceRuleId}/discount_codes`,
      data: {
        discount_code: {
          code,
        },
      },
      type: 'application/json',
    });

    logger.info('Percentage discount created', {
      code,
      percentage: config.percentage,
      priceRuleId,
    });

    return code;
  }

  /**
   * Create fixed amount discount code in Shopify
   */
  private async createFixedDiscount(
    shopDomain: string,
    accessToken: string,
    config: DiscountFixedRewardConfig,
    questId: string,
    customerId: string
  ): Promise<string> {
    const client = createShopifyClient(shopDomain, accessToken);

    const code = this.generateDiscountCode('QUEST', questId, customerId);

    const discountData = {
      price_rule: {
        title: `Quest Reward - ${code}`,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: 'fixed_amount',
        value: `-${config.amount}`,
        customer_selection: 'all',
        once_per_customer: true,
        usage_limit: 1,
        starts_at: new Date().toISOString(),
      },
    };

    if (config.minimumOrderValue) {
      (discountData.price_rule as any).prerequisite_subtotal_range = {
        greater_than_or_equal_to: config.minimumOrderValue.toString(),
      };
    }

    const priceRuleResponse = await client.post({
      path: 'price_rules',
      data: discountData,
      type: 'application/json',
    });

    const priceRuleId = (priceRuleResponse.body as any).price_rule.id;

    await client.post({
      path: `price_rules/${priceRuleId}/discount_codes`,
      data: {
        discount_code: {
          code,
        },
      },
      type: 'application/json',
    });

    logger.info('Fixed discount created', {
      code,
      amount: config.amount,
      currency: config.currency,
      priceRuleId,
    });

    return code;
  }

  /**
   * Create free shipping discount code in Shopify
   */
  private async createFreeShippingDiscount(
    shopDomain: string,
    accessToken: string,
    config: FreeShippingRewardConfig,
    questId: string,
    customerId: string
  ): Promise<string> {
    const client = createShopifyClient(shopDomain, accessToken);

    const code = this.generateDiscountCode('FREESHIP', questId, customerId);

    const discountData = {
      price_rule: {
        title: `Quest Reward - ${code}`,
        target_type: 'shipping_line',
        target_selection: 'all',
        allocation_method: 'each',
        value_type: 'percentage',
        value: '-100',
        customer_selection: 'all',
        once_per_customer: true,
        usage_limit: 1,
        starts_at: new Date().toISOString(),
      },
    };

    if (config.minimumOrderValue) {
      (discountData.price_rule as any).prerequisite_subtotal_range = {
        greater_than_or_equal_to: config.minimumOrderValue.toString(),
      };
    }

    const priceRuleResponse = await client.post({
      path: 'price_rules',
      data: discountData,
      type: 'application/json',
    });

    const priceRuleId = (priceRuleResponse.body as any).price_rule.id;

    await client.post({
      path: `price_rules/${priceRuleId}/discount_codes`,
      data: {
        discount_code: {
          code,
        },
      },
      type: 'application/json',
    });

    logger.info('Free shipping discount created', {
      code,
      priceRuleId,
    });

    return code;
  }

  /**
   * Generate unique discount code
   */
  private generateDiscountCode(prefix: string, questId: string, customerId: string): string {
    const questPart = questId.substring(0, 8).toUpperCase();
    const customerPart = customerId.substring(0, 6);
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${questPart}-${randomPart}`;
  }

  /**
   * Get customer rewards
   */
  async getCustomerRewards(shopId: string, customerId: string) {
    return prisma.rewardRedemption.findMany({
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
  }

  /**
   * Mark reward as redeemed when used in an order
   */
  async markRewardRedeemed(
    shopId: string,
    discountCode: string,
    orderId: string
  ) {
    try {
      const redemption = await prisma.rewardRedemption.findFirst({
        where: {
          shopId,
          discountCode,
        },
      });

      if (!redemption) {
        logger.warn('Reward redemption not found', { shopId, discountCode });
        return;
      }

      await prisma.rewardRedemption.update({
        where: { id: redemption.id },
        data: {
          redeemedOrderId: orderId,
          redeemedAt: new Date(),
        },
      });

      logger.info('Reward marked as redeemed', {
        shopId,
        discountCode,
        orderId,
      });
    } catch (error) {
      logger.error('Failed to mark reward as redeemed', {
        shopId,
        discountCode,
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get reward statistics for a quest
   */
  async getQuestRewardStats(questId: string) {
    const stats = await prisma.rewardRedemption.groupBy({
      by: ['rewardId'],
      where: { questId },
      _count: {
        id: true,
      },
      _sum: {
        redeemedAt: true,
      },
    });

    const total = await prisma.rewardRedemption.count({
      where: { questId },
    });

    const redeemed = await prisma.rewardRedemption.count({
      where: {
        questId,
        redeemedAt: { not: null },
      },
    });

    return {
      total,
      redeemed,
      redemptionRate: total > 0 ? (redeemed / total) * 100 : 0,
      byReward: stats,
    };
  }
}

export const rewardService = new RewardService();
