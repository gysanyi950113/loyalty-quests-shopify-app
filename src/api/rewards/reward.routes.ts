import { Router, Request, Response } from 'express';
import { rewardService } from '../../services/reward-system/reward.service';
import { authenticateShop, requireActiveShop } from '../../middleware/auth.middleware';
import { logger } from '../../utils/logger';

const router = Router();

// Apply shop authentication
router.use(authenticateShop, requireActiveShop);

/**
 * GET /api/rewards/customer/:customerId
 * Get all rewards for a specific customer
 */
router.get('/rewards/customer/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const shopId = req.shop!.id;

    const rewards = await rewardService.getCustomerRewards(shopId, customerId);

    res.json({
      customerId,
      rewards,
      total: rewards.length,
    });
  } catch (error) {
    logger.error('Failed to get customer rewards', {
      customerId: req.params.customerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Failed to retrieve customer rewards',
    });
  }
});

/**
 * POST /api/rewards/issue
 * Manually issue a reward to a customer
 */
router.post('/rewards/issue', async (req: Request, res: Response) => {
  try {
    const { questId, rewardId, customerId } = req.body;

    if (!questId || !rewardId || !customerId) {
      return res.status(400).json({
        error: 'Missing required fields: questId, rewardId, customerId',
      });
    }

    const shopId = req.shop!.id;

    const discountCode = await rewardService.issueReward(
      shopId,
      questId,
      rewardId,
      customerId
    );

    res.json({
      success: true,
      discountCode,
      message: 'Reward issued successfully',
    });
  } catch (error) {
    logger.error('Failed to issue reward', {
      body: req.body,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Failed to issue reward',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rewards/quest/:questId/stats
 * Get reward statistics for a quest
 */
router.get('/rewards/quest/:questId/stats', async (req: Request, res: Response) => {
  try {
    const { questId } = req.params;

    const stats = await rewardService.getQuestRewardStats(questId);

    res.json({
      questId,
      stats,
    });
  } catch (error) {
    logger.error('Failed to get quest reward stats', {
      questId: req.params.questId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Failed to retrieve reward statistics',
    });
  }
});

/**
 * POST /api/rewards/redeem
 * Mark a reward as redeemed (called internally after order creation)
 */
router.post('/rewards/redeem', async (req: Request, res: Response) => {
  try {
    const { discountCode, orderId } = req.body;

    if (!discountCode || !orderId) {
      return res.status(400).json({
        error: 'Missing required fields: discountCode, orderId',
      });
    }

    const shopId = req.shop!.id;

    await rewardService.markRewardRedeemed(shopId, discountCode, orderId);

    res.json({
      success: true,
      message: 'Reward marked as redeemed',
    });
  } catch (error) {
    logger.error('Failed to mark reward as redeemed', {
      body: req.body,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Failed to mark reward as redeemed',
    });
  }
});

export default router;
