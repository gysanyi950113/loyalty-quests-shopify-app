import { Router, Request, Response } from 'express';
import { analyticsService } from '../../services/analytics/analytics.service.js';
import { authenticateShop } from '../../middleware/auth.middleware.js';
import { logger } from '../../utils/logger.js';

const router = Router();

/**
 * Analytics Routes
 *
 * Provides endpoints for retrieving quest performance metrics,
 * customer engagement data, and revenue impact insights.
 */

/**
 * GET /api/analytics/overview
 *
 * Get overall metrics for the shop including:
 * - Total quests (active/inactive)
 * - Total participants and completions
 * - Rewards issued and redeemed
 * - Overall completion and redemption rates
 *
 * Query params:
 *   - shop: Shop domain (required, from auth middleware)
 *
 * Response:
 *   {
 *     metrics: OverallMetrics
 *   }
 */
router.get(
  '/analytics/overview',
  authenticateShop,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const shopId = req.shop!.id;

      const metrics = await analyticsService.getOverallMetrics(shopId);

      res.json({ metrics });
    } catch (error) {
      logger.error('Error fetching overview analytics', {
        error,
        shop: req.shop?.shopDomain,
      });
      res.status(500).json({
        error: 'Failed to retrieve overview analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/analytics/quests
 *
 * Get detailed analytics for all quests including:
 * - Participant counts
 * - Completion rates
 * - Average progress
 * - Reward issuance and redemption
 *
 * Query params:
 *   - shop: Shop domain (required, from auth middleware)
 *
 * Response:
 *   {
 *     analytics: QuestAnalytics[]
 *   }
 */
router.get(
  '/analytics/quests',
  authenticateShop,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const shopId = req.shop!.id;

      const analytics = await analyticsService.getShopAnalytics(shopId);

      res.json({ analytics });
    } catch (error) {
      logger.error('Error fetching quest analytics', {
        error,
        shop: req.shop?.shopDomain,
      });
      res.status(500).json({
        error: 'Failed to retrieve quest analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/analytics/quests/:questId
 *
 * Get detailed analytics for a specific quest
 *
 * Path params:
 *   - questId: Quest UUID
 *
 * Query params:
 *   - shop: Shop domain (required, from auth middleware)
 *
 * Response:
 *   {
 *     analytics: QuestAnalytics
 *   }
 */
router.get(
  '/analytics/quests/:questId',
  authenticateShop,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const shopId = req.shop!.id;
      const { questId } = req.params;

      const analytics = await analyticsService.getQuestAnalytics(
        shopId,
        questId
      );

      if (!analytics) {
        return res.status(404).json({
          error: 'Quest not found',
        });
      }

      res.json({ analytics });
    } catch (error) {
      logger.error('Error fetching quest analytics', {
        error,
        shop: req.shop?.shopDomain,
        questId: req.params.questId,
      });
      return res.status(500).json({
        error: 'Failed to retrieve quest analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/analytics/customers
 *
 * Get customer engagement metrics including:
 * - Total and active customer counts
 * - Average quests per customer
 * - Top performers
 *
 * Query params:
 *   - shop: Shop domain (required, from auth middleware)
 *
 * Response:
 *   {
 *     engagement: CustomerEngagement
 *   }
 */
router.get(
  '/analytics/customers',
  authenticateShop,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const shopId = req.shop!.id;

      const engagement = await analyticsService.getCustomerEngagement(shopId);

      res.json({ engagement });
    } catch (error) {
      logger.error('Error fetching customer engagement', {
        error,
        shop: req.shop?.shopDomain,
      });
      res.status(500).json({
        error: 'Failed to retrieve customer engagement metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/analytics/revenue
 *
 * Get revenue impact metrics including:
 * - Total rewards issued and redeemed
 * - Estimated discount value
 * - Breakdown by reward type
 *
 * Query params:
 *   - shop: Shop domain (required, from auth middleware)
 *
 * Response:
 *   {
 *     revenue: RevenueImpact
 *   }
 */
router.get(
  '/analytics/revenue',
  authenticateShop,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const shopId = req.shop!.id;

      const revenue = await analyticsService.getRevenueImpact(shopId);

      res.json({ revenue });
    } catch (error) {
      logger.error('Error fetching revenue impact', {
        error,
        shop: req.shop?.shopDomain,
      });
      res.status(500).json({
        error: 'Failed to retrieve revenue impact metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
