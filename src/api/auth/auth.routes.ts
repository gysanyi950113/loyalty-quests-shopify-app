import { Router, Request, Response } from 'express';
import { shopify } from '../../services/shopify/client';
import { shopService } from '../../services/shopify/shop.service';
import { webhookService } from '../../services/shopify/webhook.service';
import { logger } from '../../utils/logger';
import { config } from '../../config/environment';

const router = Router();

/**
 * OAuth Start - Redirect merchant to Shopify authorization
 */
router.get('/auth', async (req: Request, res: Response): Promise<any> => {
  try {
    const shop = req.query.shop as string;

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop parameter' });
    }

    // Validate shop domain format
    if (!shop.endsWith('.myshopify.com')) {
      return res.status(400).json({ error: 'Invalid shop domain' });
    }

    const authUrl = await shopify.auth.begin({
      shop: shopify.utils.sanitizeShop(shop, true)!,
      callbackPath: '/api/auth/callback',
      isOnline: false, // Offline access for background tasks
      rawRequest: req,
      rawResponse: res,
    });

    logger.info('OAuth flow started', { shop });

    return res.redirect(authUrl);
  } catch (error) {
    logger.error('OAuth start failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({ error: 'Failed to start OAuth flow' });
  }
});

/**
 * OAuth Callback - Handle Shopify authorization callback
 */
router.get('/auth/callback', async (req: Request, res: Response): Promise<any> => {
  try {
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callback;

    if (!session) {
      throw new Error('No session received from Shopify');
    }

    // Store shop and access token in database
    await shopService.upsertShop({
      shopDomain: session.shop,
      accessToken: session.accessToken || '',
      scope: session.scope || config.shopify.scopes.join(','),
    });

    // Register webhooks
    await webhookService.registerWebhooks(session.shop, session.accessToken || '');

    logger.info('OAuth completed successfully', {
      shop: session.shop,
      scope: session.scope,
    });

    // Redirect to app homepage or onboarding
    const redirectUrl = `https://${session.shop}/admin/apps/${config.shopify.apiKey}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    logger.error('OAuth callback failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({ error: 'Failed to complete OAuth flow' });
  }
});

/**
 * Verify installation status
 */
router.get('/auth/verify', async (req: Request, res: Response): Promise<any> => {
  try {
    const shop = req.query.shop as string;

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop parameter' });
    }

    const shopData = await shopService.getShopByDomain(shop);

    if (!shopData) {
      return res.status(404).json({
        installed: false,
        message: 'Shop not found'
      });
    }

    const isValid = await shopService.verifyShopAccess(shop);

    res.json({
      installed: true,
      status: shopData.status,
      accessValid: isValid,
    });
  } catch (error) {
    logger.error('Installation verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({ error: 'Failed to verify installation' });
  }
});

export default router;
