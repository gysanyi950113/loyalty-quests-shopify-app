import { Router, Request, Response } from 'express';
import { questService } from '../../services/quest-engine/quest.service';
import { rewardService } from '../../services/reward-system/reward.service';
import { optionalShopAuth } from '../../middleware/auth.middleware';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /public/quests
 * Get active quests and customer progress for storefront widget
 * Query params: shop (required), customerId (optional)
 */
router.get('/public/quests', optionalShopAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const shopDomain = req.query.shop as string;
    const customerId = req.query.customerId as string;

    if (!shopDomain) {
      return res.status(400).json({
        error: 'Missing shop parameter',
      });
    }

    // Get shop from domain
    const shop = req.shop;
    if (!shop) {
      return res.status(404).json({
        error: 'Shop not found',
      });
    }

    // Get active quests
    const quests = await questService.getActiveQuestsByShop(shop.id);

    // If customer ID provided, include their progress
    let customerProgress: any[] = [];
    let customerRewards: any[] = [];

    if (customerId) {
      customerProgress = await questService.getCustomerProgress(shop.id, customerId);
      customerRewards = await rewardService.getCustomerRewards(shop.id, customerId);
    }

    // Transform for public API (hide internal IDs, simplify structure)
    const publicQuests = quests.map(quest => ({
      id: quest.id,
      name: quest.name,
      description: quest.description,
      conditions: quest.conditions.map(c => ({
        type: c.type,
        target: (c.config as any).targetOrderCount || (c.config as any).targetAmount || 1,
      })),
      rewards: quest.rewards.map(r => ({
        type: r.type,
        description: formatRewardDescription(r.type, r.config as any),
      })),
      progress: customerProgress.find(p => p.questId === quest.id) || null,
    }));

    return res.json({
      shop: shopDomain,
      customerId: customerId || null,
      quests: publicQuests,
      rewards: customerRewards.map(r => ({
        questName: r.reward?.quest?.name || 'Unknown Quest',
        discountCode: r.discountCode,
        issuedAt: r.issuedAt,
        expiresAt: r.expiresAt,
        isRedeemed: !!r.redeemedAt,
      })),
    });
  } catch (error) {
    logger.error('Failed to get public quests', {
      shop: req.query.shop,
      customerId: req.query.customerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Failed to retrieve quests',
    });
  }
});

/**
 * Helper to format reward description for customers
 */
function formatRewardDescription(type: string, config: any): string {
  switch (type) {
    case 'DISCOUNT_PERCENTAGE':
      return `${config.percentage}% off your next order`;
    case 'DISCOUNT_FIXED':
      return `$${config.amount} off your next order`;
    case 'FREE_SHIPPING':
      return 'Free shipping on your next order';
    default:
      return 'Special reward';
  }
}

export default router;
