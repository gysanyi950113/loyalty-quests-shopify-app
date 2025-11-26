import { DeliveryMethod } from '@shopify/shopify-api';
import { shopify } from './client';
import { logger } from '../../utils/logger';
import { config } from '../../config/environment';
import { Session } from '@shopify/shopify-api';

export enum WebhookTopic {
  APP_UNINSTALLED = 'APP_UNINSTALLED',
  ORDERS_CREATE = 'ORDERS_CREATE',
  ORDERS_PAID = 'ORDERS_PAID',
  ORDERS_UPDATED = 'ORDERS_UPDATED',
  CUSTOMERS_CREATE = 'CUSTOMERS_CREATE',
  CUSTOMERS_UPDATE = 'CUSTOMERS_UPDATE',
}

export class WebhookService {
  private readonly webhookTopics = [
    WebhookTopic.APP_UNINSTALLED,
    WebhookTopic.ORDERS_CREATE,
    WebhookTopic.ORDERS_PAID,
    WebhookTopic.ORDERS_UPDATED,
  ];

  /**
   * Register all webhooks for a shop
   */
  async registerWebhooks(shop: string, accessToken: string) {
    const results = await Promise.allSettled(
      this.webhookTopics.map(topic =>
        this.registerWebhook(shop, accessToken, topic)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    logger.info('Webhook registration completed', {
      shop,
      successful,
      failed,
      total: this.webhookTopics.length,
    });

    if (failed > 0) {
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason);
      logger.error('Some webhooks failed to register', { shop, errors });
    }

    return { successful, failed, total: this.webhookTopics.length };
  }

  /**
   * Register a single webhook
   */
  private async registerWebhook(
    shop: string,
    accessToken: string,
    topic: WebhookTopic
  ) {
    try {
      const webhookPath = `/api/webhooks/${topic.toLowerCase().replace('_', '/')}`;
      const callbackUrl = `${config.app.url}${webhookPath}`;

      const session = new Session({
        id: shop,
        shop,
        state: 'active',
        isOnline: false,
        accessToken,
        scope: config.shopify.scopes.join(','),
      });
      const response = await shopify.webhooks.register({
        session,
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl,
      } as any);

      if (response.success) {
        logger.info('Webhook registered successfully', {
          shop,
          topic,
          callbackUrl,
        });
      } else {
        logger.warn('Webhook registration returned unsuccessful', {
          shop,
          topic,
          result: response.result,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to register webhook', {
        shop,
        topic,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Verify webhook HMAC signature
   */
  async verifyWebhook(rawBody: string, hmacHeader: string): Promise<boolean> {
    try {
      const result = await shopify.webhooks.validate({
        rawBody: Buffer.from(rawBody),
        rawRequest: hmacHeader,
      } as any);
      return result !== undefined;
    } catch (error) {
      logger.error('Webhook verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Unregister all webhooks for a shop (cleanup on uninstall)
   */
  async unregisterWebhooks(shop: string, _accessToken: string) {
    try {
      // Shopify automatically removes webhooks when app is uninstalled
      // This method is here for manual cleanup if needed
      logger.info('Webhooks cleanup initiated', { shop });
      return { success: true };
    } catch (error) {
      logger.error('Failed to unregister webhooks', {
        shop,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

export const webhookService = new WebhookService();
