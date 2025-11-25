import { Router, Request, Response, NextFunction } from 'express';
import { webhookService } from '../../services/shopify/webhook.service';
import { shopService } from '../../services/shopify/shop.service';
import { logger } from '../../utils/logger';
import { prisma } from '../../utils/prisma';
import { queueManager } from '../../config/queue/queue-manager';
import { QueueNames } from '../../config/queue/connection';

const router = Router();

/**
 * Middleware to verify webhook HMAC
 */
async function verifyWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const hmac = req.get('X-Shopify-Hmac-SHA256');
    const shop = req.get('X-Shopify-Shop-Domain');

    if (!hmac || !shop) {
      logger.warn('Webhook missing required headers', {
        hasHmac: !!hmac,
        hasShop: !!shop,
      });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get raw body for HMAC verification
    const rawBody = JSON.stringify(req.body);
    const isValid = webhookService.verifyWebhook(rawBody, hmac);

    if (!isValid) {
      logger.warn('Webhook HMAC verification failed', { shop });
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    // Attach shop to request for handlers
    (req as any).shopDomain = shop;

    next();
  } catch (error) {
    logger.error('Webhook verification error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ error: 'Webhook verification failed' });
  }
}

/**
 * Log webhook for debugging
 */
async function logWebhook(
  shop: string,
  topic: string,
  payload: any,
  success: boolean,
  errorMessage?: string
) {
  try {
    await prisma.webhookLog.create({
      data: {
        shopDomain: shop,
        topic,
        payload,
        success,
        errorMessage,
      },
    });
  } catch (error) {
    logger.error('Failed to log webhook', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * APP_UNINSTALLED webhook
 */
router.post('/webhooks/app/uninstalled', verifyWebhook, async (req: Request, res: Response) => {
  const shop = (req as any).shopDomain as string;
  const topic = 'APP_UNINSTALLED';

  try {
    logger.info('App uninstalled webhook received', { shop });

    await shopService.markShopUninstalled(shop);

    await logWebhook(shop, topic, req.body, true);

    res.status(200).json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to handle app uninstalled webhook', { shop, error: errorMessage });

    await logWebhook(shop, topic, req.body, false, errorMessage);

    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * ORDERS_CREATE webhook
 */
router.post('/webhooks/orders/create', verifyWebhook, async (req: Request, res: Response) => {
  const shop = (req as any).shopDomain as string;
  const topic = 'ORDERS_CREATE';

  try {
    logger.info('Order created webhook received', {
      shop,
      orderId: req.body.id,
      orderNumber: req.body.order_number,
    });

    // Get shop from database to get shopId
    const shopData = await shopService.getShopByDomain(shop);
    if (!shopData) {
      throw new Error('Shop not found');
    }

    // Enqueue order processing job
    const orderQueue = queueManager.getQueue(QueueNames.ORDER_PROCESSING);
    await orderQueue.add('process-order', {
      shopId: shopData.id,
      order: req.body,
    });

    logger.info('Order enqueued for processing', {
      shop,
      orderId: req.body.id,
    });

    await logWebhook(shop, topic, req.body, true);

    res.status(200).json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to handle order created webhook', { shop, error: errorMessage });

    await logWebhook(shop, topic, req.body, false, errorMessage);

    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * ORDERS_PAID webhook
 */
router.post('/webhooks/orders/paid', verifyWebhook, async (req: Request, res: Response) => {
  const shop = (req as any).shopDomain as string;
  const topic = 'ORDERS_PAID';

  try {
    logger.info('Order paid webhook received', {
      shop,
      orderId: req.body.id,
      orderNumber: req.body.order_number,
      totalPrice: req.body.total_price,
    });

    // Get shop from database to get shopId
    const shopData = await shopService.getShopByDomain(shop);
    if (!shopData) {
      throw new Error('Shop not found');
    }

    // Enqueue order processing job
    const orderQueue = queueManager.getQueue(QueueNames.ORDER_PROCESSING);
    await orderQueue.add('process-order', {
      shopId: shopData.id,
      order: req.body,
    });

    logger.info('Paid order enqueued for processing', {
      shop,
      orderId: req.body.id,
    });

    await logWebhook(shop, topic, req.body, true);

    res.status(200).json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to handle order paid webhook', { shop, error: errorMessage });

    await logWebhook(shop, topic, req.body, false, errorMessage);

    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * ORDERS_UPDATED webhook
 */
router.post('/webhooks/orders/updated', verifyWebhook, async (req: Request, res: Response) => {
  const shop = (req as any).shopDomain as string;
  const topic = 'ORDERS_UPDATED';

  try {
    logger.info('Order updated webhook received', {
      shop,
      orderId: req.body.id,
      orderNumber: req.body.order_number,
    });

    // TODO: Handle order updates (cancellations, refunds, etc.)

    await logWebhook(shop, topic, req.body, true);

    res.status(200).json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to handle order updated webhook', { shop, error: errorMessage });

    await logWebhook(shop, topic, req.body, false, errorMessage);

    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
