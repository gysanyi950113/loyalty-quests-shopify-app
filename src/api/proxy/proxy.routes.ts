import { Router, Request, Response } from 'express';
import { shopService } from '../../services/shopify/shop.service';
import { customerQuestService } from '../../services/customer/customer-quest.service';
import { logger } from '../../utils/logger';
import {
  verifyAppProxySignature,
  getCustomerIdFromProxy,
  getShopDomainFromProxy,
  isCustomerLoggedIn,
} from '../../utils/app-proxy';
import path from 'path';

const router = Router();

/**
 * Middleware to verify app proxy signature and extract shop/customer info
 */
async function verifyAndExtractProxyData(
  req: Request,
  res: Response,
  next: Function
): Promise<any> {
  try {
    // Verify signature
    if (!verifyAppProxySignature(req)) {
      logger.warn('Invalid app proxy signature', {
        query: req.query,
      });
      return res.status(401).send('Invalid signature');
    }

    // Extract shop domain
    const shopDomain = getShopDomainFromProxy(req);
    if (!shopDomain) {
      return res.status(400).send('Missing shop parameter');
    }

    // Get shop from database
    const shop = await shopService.getShopByDomain(shopDomain);
    if (!shop) {
      return res.status(404).send('Shop not found');
    }

    // Attach to request
    (req as any).shopId = shop.id;
    (req as any).shopDomain = shopDomain;
    (req as any).customerId = getCustomerIdFromProxy(req);
    (req as any).isLoggedIn = isCustomerLoggedIn(req);

    next();
  } catch (error) {
    logger.error('App proxy verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).send('Verification failed');
  }
}

/**
 * Root proxy route - redirect to quests
 */
router.get('/', verifyAndExtractProxyData, async (_req: Request, res: Response) => {
  return res.redirect('/apps/quests');
});

/**
 * Main quests page - Liquid template
 */
router.get('/quests', verifyAndExtractProxyData, async (req: Request, res: Response) => {
  const { shopId, customerId, isLoggedIn } = req as any;

  try {
    // If not logged in, show login prompt
    if (!isLoggedIn || !customerId) {
      return res.sendFile(
        path.join(__dirname, '../../views/proxy/login-required.html')
      );
    }

    // Get customer's quests and stats
    const [quests, stats, rewards] = await Promise.all([
      customerQuestService.getCustomerQuests(shopId, customerId),
      customerQuestService.getCustomerStats(shopId, customerId),
      customerQuestService.getCustomerRewards(shopId, customerId),
    ]);

    // Render template
    return res.render('proxy/quests', {
      quests,
      stats,
      rewards: rewards.filter(r => !r.isRedeemed && !r.isExpired),
      rewardsHistory: rewards.filter(r => r.isRedeemed || r.isExpired),
    });
  } catch (error) {
    logger.error('Failed to render quests page', {
      shopId,
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).send('Failed to load quests');
  }
});

/**
 * Quest detail page
 */
router.get('/quests/:id', verifyAndExtractProxyData, async (req: Request, res: Response) => {
  const { shopId, customerId, isLoggedIn } = req as any;
  const { id } = req.params;

  try {
    if (!isLoggedIn || !customerId) {
      return res.sendFile(
        path.join(__dirname, '../../views/proxy/login-required.html')
      );
    }

    const quest = await customerQuestService.getCustomerQuest(shopId, id, customerId);

    if (!quest) {
      return res.status(404).send('Quest not found');
    }

    return res.render('proxy/quest-detail', { quest });
  } catch (error) {
    logger.error('Failed to render quest detail', {
      shopId,
      questId: id,
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).send('Failed to load quest');
  }
});

/**
 * API endpoint - Get quests as JSON
 */
router.get('/api/quests', verifyAndExtractProxyData, async (req: Request, res: Response) => {
  const { shopId, customerId, isLoggedIn } = req as any;

  try {
    if (!isLoggedIn || !customerId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const quests = await customerQuestService.getCustomerQuests(shopId, customerId);
    return res.json({ quests });
  } catch (error) {
    logger.error('Failed to get quests API', {
      shopId,
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({ error: 'Failed to load quests' });
  }
});

/**
 * API endpoint - Get rewards as JSON
 */
router.get('/api/rewards', verifyAndExtractProxyData, async (req: Request, res: Response) => {
  const { shopId, customerId, isLoggedIn } = req as any;

  try {
    if (!isLoggedIn || !customerId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const rewards = await customerQuestService.getCustomerRewards(shopId, customerId);
    return res.json({ rewards });
  } catch (error) {
    logger.error('Failed to get rewards API', {
      shopId,
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({ error: 'Failed to load rewards' });
  }
});

/**
 * API endpoint - Get customer stats as JSON
 */
router.get('/api/stats', verifyAndExtractProxyData, async (req: Request, res: Response) => {
  const { shopId, customerId, isLoggedIn } = req as any;

  try {
    if (!isLoggedIn || !customerId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const stats = await customerQuestService.getCustomerStats(shopId, customerId);
    return res.json({ stats });
  } catch (error) {
    logger.error('Failed to get stats API', {
      shopId,
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({ error: 'Failed to load stats' });
  }
});

export default router;
